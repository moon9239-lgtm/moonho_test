from __future__ import annotations

import argparse
import csv
import html
import json
import os
import re
import sys
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urljoin, urlparse
from urllib.request import HTTPCookieProcessor, Request, build_opener


BASE_URL = "https://www.pipc.go.kr"
LIST_PATH = "/np/default/minutes.do"
DOWNLOAD_PATH = "/np/cmm/fms/FileDown.do"
DEFAULT_MCODE = "E020010000"
DEFAULT_SCH_TYPE_CD = "1"
DEFAULT_SCH_CAT_CD = "1"
DEFAULT_TYPE_CD = "1"
DEFAULT_CAT_CD = "1"


@dataclass
class Attachment:
    name: str
    atch_file_id: str
    file_sn: str
    download_url: str
    saved_path: str = ""
    size_bytes: int = 0
    status: str = "pending"
    error: str = ""


@dataclass
class Meeting:
    number: int
    idx_id: str
    title: str
    meeting_date: str
    detail_url: str
    division: str = ""
    content: str = ""
    attachments: list[Attachment] = field(default_factory=list)


class PipcCrawler:
    def __init__(self, delay: float = 0.5, timeout: int = 30) -> None:
        self.delay = delay
        self.timeout = timeout
        self.opener = build_opener(HTTPCookieProcessor())
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        }

    def get_text(self, url: str, referer: str | None = None) -> str:
        data = self.get_bytes(url, referer=referer)
        return data.decode("utf-8", errors="replace")

    def get_bytes(self, url: str, referer: str | None = None) -> bytes:
        headers = dict(self.headers)
        if referer:
            headers["Referer"] = referer
        req = Request(url, headers=headers)
        with self.opener.open(req, timeout=self.timeout) as res:
            return res.read()

    def list_url(self, page: int) -> str:
        params = {"mCode": DEFAULT_MCODE, "schTypeCd": DEFAULT_SCH_TYPE_CD, "page": str(page)}
        return f"{BASE_URL}{LIST_PATH}?{urlencode(params)}"

    def detail_url(self, idx_id: str, page: int = 1) -> str:
        params = {
            "op": "view",
            "idxId": idx_id,
            "page": str(page),
            "mCode": DEFAULT_MCODE,
            "fromDt": "",
            "toDt": "",
            "schCatCd": DEFAULT_SCH_CAT_CD,
            "schTypeCd": DEFAULT_SCH_TYPE_CD,
            "typeCd": DEFAULT_TYPE_CD,
            "catCd": DEFAULT_CAT_CD,
        }
        return f"{BASE_URL}{LIST_PATH}?{urlencode(params)}"

    def download_url(self, atch_file_id: str, file_sn: str) -> str:
        params = {"atchFileId": atch_file_id, "fileSn": file_sn}
        return f"{BASE_URL}{DOWNLOAD_PATH}?{urlencode(params)}"

    def discover_last_page(self, html_text: str) -> int:
        pages = [int(page) for page in re.findall(r"[?&amp;]page=(\d+)", html_text)]
        return max(pages) if pages else 1

    def parse_list_page(self, html_text: str, page: int) -> list[Meeting]:
        rows = re.findall(r"<tr>\s*(.*?)\s*</tr>", html_text, flags=re.S | re.I)
        meetings: list[Meeting] = []
        for row in rows:
            idx_match = re.search(r"idxId=(\d+)", row)
            if not idx_match:
                continue

            cells = re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.S | re.I)
            if len(cells) < 3:
                continue

            try:
                number = int(clean_text(cells[0]))
            except ValueError:
                continue

            idx_id = idx_match.group(1)
            title = clean_text(cells[1])
            meeting_date = clean_text(cells[2])
            meetings.append(
                Meeting(
                    number=number,
                    idx_id=idx_id,
                    title=title,
                    meeting_date=meeting_date,
                    detail_url=self.detail_url(idx_id, page),
                )
            )
        return meetings

    def parse_detail_page(self, meeting: Meeting, html_text: str) -> Meeting:
        division = re.search(r'class="division[^"]*">\s*(.*?)\s*</span>', html_text, flags=re.S | re.I)
        if division:
            meeting.division = clean_text(division.group(1))

        date_match = re.search(
            r"<th[^>]*>\s*회\s*&nbsp;\s*의\s*&nbsp;\s*일\s*</th>\s*<td[^>]*>(.*?)</td>",
            html_text,
            flags=re.S | re.I,
        )
        if date_match:
            meeting.meeting_date = clean_text(date_match.group(1))

        content_match = re.search(
            r'<td[^>]*class="tbl_cnts"[^>]*>\s*<div[^>]*>(.*?)</div>\s*</td>',
            html_text,
            flags=re.S | re.I,
        )
        if content_match:
            meeting.content = clean_text(content_match.group(1), preserve_lines=True)

        meeting.attachments = []
        attachment_pattern = re.compile(
            r'<div[^>]*class="download"[^>]*>\s*'
            r'<img[^>]*>\s*(?P<name>.*?)\s*'
            r'<span>\s*<a[^>]*onclick="fn_egov_downFile\('
            r"'(?P<atch>[^']+)'\s*,\s*'(?P<sn>[^']+)'",
            flags=re.S | re.I,
        )
        for match in attachment_pattern.finditer(html_text):
            name = clean_text(match.group("name"))
            atch_file_id = match.group("atch")
            file_sn = match.group("sn")
            meeting.attachments.append(
                Attachment(
                    name=name,
                    atch_file_id=atch_file_id,
                    file_sn=file_sn,
                    download_url=self.download_url(atch_file_id, file_sn),
                )
            )
        return meeting

    def crawl_index(self, limit_pages: int | None = None, limit_items: int | None = None) -> list[Meeting]:
        first_html = self.get_text(self.list_url(1))
        last_page = self.discover_last_page(first_html)
        if limit_pages is not None:
            last_page = min(last_page, limit_pages)

        meetings = self.parse_list_page(first_html, page=1)
        print(f"[list] page 1/{last_page}: {len(meetings)} rows")
        polite_sleep(self.delay)

        for page in range(2, last_page + 1):
            page_html = self.get_text(self.list_url(page), referer=self.list_url(page - 1))
            page_meetings = self.parse_list_page(page_html, page=page)
            meetings.extend(page_meetings)
            print(f"[list] page {page}/{last_page}: {len(page_meetings)} rows")
            polite_sleep(self.delay)

        unique: dict[str, Meeting] = {}
        for meeting in meetings:
            unique.setdefault(meeting.idx_id, meeting)

        ordered = sorted(unique.values(), key=lambda item: item.number, reverse=True)
        if limit_items is not None:
            ordered = ordered[:limit_items]
        return ordered

    def enrich_details(self, meetings: Iterable[Meeting]) -> list[Meeting]:
        enriched: list[Meeting] = []
        for i, meeting in enumerate(meetings, start=1):
            detail_html = self.get_text(meeting.detail_url, referer=self.list_url(1))
            enriched_meeting = self.parse_detail_page(meeting, detail_html)
            enriched.append(enriched_meeting)
            print(
                f"[detail] {i}: {meeting.meeting_date} {meeting.title} "
                f"attachments={len(enriched_meeting.attachments)}"
            )
            polite_sleep(self.delay)
        return enriched

    def download_attachments(self, meetings: Iterable[Meeting], output_dir: Path, force: bool = False) -> None:
        for meeting in meetings:
            year = meeting.meeting_date[:4] if meeting.meeting_date else "unknown"
            target_dir = output_dir / "downloads" / year
            target_dir.mkdir(parents=True, exist_ok=True)

            for attachment in meeting.attachments:
                filename = make_attachment_filename(meeting, attachment)
                target = target_dir / filename
                if target.exists() and target.stat().st_size > 0 and not force:
                    attachment.saved_path = str(target.relative_to(output_dir))
                    attachment.size_bytes = target.stat().st_size
                    attachment.status = "skipped"
                    continue

                try:
                    data = self.get_bytes(attachment.download_url, referer=meeting.detail_url)
                    target.write_bytes(data)
                    attachment.saved_path = str(target.relative_to(output_dir))
                    attachment.size_bytes = len(data)
                    attachment.status = "downloaded"
                    print(f"[download] {attachment.saved_path} ({len(data):,} bytes)")
                except (HTTPError, URLError, TimeoutError, OSError) as exc:
                    attachment.status = "failed"
                    attachment.error = str(exc)
                    print(f"[download:failed] {meeting.title} / {attachment.name}: {exc}", file=sys.stderr)
                polite_sleep(self.delay)


def clean_text(value: str, preserve_lines: bool = False) -> str:
    value = re.sub(r"<!--.*?-->", " ", value, flags=re.S)
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    value = value.replace("\xa0", " ")
    if preserve_lines:
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in value.splitlines()]
        return "\n".join(line for line in lines if line)
    return re.sub(r"\s+", " ", value).strip()


def safe_filename(value: str, max_length: int = 150) -> str:
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", value)
    value = re.sub(r"\s+", "_", value).strip(" ._")
    return value[:max_length] or "file"


def make_attachment_filename(meeting: Meeting, attachment: Attachment) -> str:
    original = attachment.name or f"{attachment.atch_file_id}_{attachment.file_sn}"
    suffix = Path(original).suffix
    if not suffix:
        suffix = ".bin"
    stem = original[: -len(suffix)] if suffix else original
    prefix = safe_filename(f"{meeting.meeting_date}_{meeting.title}", max_length=90)
    stem = safe_filename(stem, max_length=55)
    return f"{prefix}_{attachment.file_sn}_{stem}{suffix}"


def polite_sleep(delay: float) -> None:
    if delay > 0:
        time.sleep(delay)


def write_outputs(meetings: list[Meeting], output_dir: Path) -> None:
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    meetings_json = data_dir / "meetings.json"
    meetings_json.write_text(
        json.dumps([asdict(meeting) for meeting in meetings], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    meetings_csv = data_dir / "meetings.csv"
    with meetings_csv.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "number",
                "idx_id",
                "title",
                "division",
                "meeting_date",
                "detail_url",
                "attachment_count",
                "content",
            ],
        )
        writer.writeheader()
        for meeting in meetings:
            writer.writerow(
                {
                    "number": meeting.number,
                    "idx_id": meeting.idx_id,
                    "title": meeting.title,
                    "division": meeting.division,
                    "meeting_date": meeting.meeting_date,
                    "detail_url": meeting.detail_url,
                    "attachment_count": len(meeting.attachments),
                    "content": meeting.content,
                }
            )

    attachments_csv = data_dir / "attachments.csv"
    with attachments_csv.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "meeting_number",
                "idx_id",
                "meeting_title",
                "meeting_date",
                "attachment_name",
                "atch_file_id",
                "file_sn",
                "download_url",
                "saved_path",
                "size_bytes",
                "status",
                "error",
            ],
        )
        writer.writeheader()
        for meeting in meetings:
            for attachment in meeting.attachments:
                writer.writerow(
                    {
                        "meeting_number": meeting.number,
                        "idx_id": meeting.idx_id,
                        "meeting_title": meeting.title,
                        "meeting_date": meeting.meeting_date,
                        "attachment_name": attachment.name,
                        "atch_file_id": attachment.atch_file_id,
                        "file_sn": attachment.file_sn,
                        "download_url": attachment.download_url,
                        "saved_path": attachment.saved_path,
                        "size_bytes": attachment.size_bytes,
                        "status": attachment.status,
                        "error": attachment.error,
                    }
                )


def summarize(meetings: list[Meeting]) -> dict[str, int]:
    attachments = [attachment for meeting in meetings for attachment in meeting.attachments]
    return {
        "meetings": len(meetings),
        "attachments": len(attachments),
        "downloaded": sum(1 for item in attachments if item.status == "downloaded"),
        "skipped": sum(1 for item in attachments if item.status == "skipped"),
        "failed": sum(1 for item in attachments if item.status == "failed"),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download PIPC protection committee minutes and transcripts.")
    parser.add_argument("--output", default=".", help="Output directory. Defaults to the project directory.")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay between requests in seconds.")
    parser.add_argument("--timeout", type=int, default=30, help="HTTP timeout in seconds.")
    parser.add_argument("--limit-pages", type=int, default=None, help="Crawl only the first N list pages.")
    parser.add_argument("--limit-items", type=int, default=None, help="Crawl only the first N meetings after indexing.")
    parser.add_argument("--no-download", action="store_true", help="Create metadata only; do not download PDFs.")
    parser.add_argument("--force", action="store_true", help="Download even if a target file already exists.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    crawler = PipcCrawler(delay=args.delay, timeout=args.timeout)
    try:
        meetings = crawler.crawl_index(limit_pages=args.limit_pages, limit_items=args.limit_items)
        meetings = crawler.enrich_details(meetings)
        if not args.no_download:
            crawler.download_attachments(meetings, output_dir=output_dir, force=args.force)
        write_outputs(meetings, output_dir=output_dir)
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"Failed: {exc}", file=sys.stderr)
        return 1

    summary = summarize(meetings)
    print("[summary] " + ", ".join(f"{key}={value}" for key, value in summary.items()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
