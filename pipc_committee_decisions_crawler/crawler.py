from __future__ import annotations

import argparse
import csv
import html
import json
import re
import sys
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin
from urllib.request import HTTPCookieProcessor, Request, build_opener


BASE_URL = "https://www.pipc.go.kr"
LIST_PATH = "/np/default/agenda.do"
DOWNLOAD_PATH = "/np/cmm/fms/FileDown.do"
MCODE = "E030010000"
COMMITTEE_CODE = "01"
COMMITTEE_NAME = "위원회"


@dataclass
class Attachment:
    name: str
    atch_file_id: str
    file_sn: str
    file_extsn: str
    cnv_cnt: str
    download_url: str
    saved_path: str = ""
    size_bytes: int = 0
    status: str = "pending"
    error: str = ""


@dataclass
class Decision:
    number: int
    idx_id: str
    committee: str
    title: str
    decision_date: str
    detail_url: str
    bill_number: str = ""
    created_date: str = ""
    request_content: str = ""
    decision_content: str = ""
    view_count: int = 0
    preview_ids: str = ""
    attachments: list[Attachment] = field(default_factory=list)


class PipcDecisionCrawler:
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

    def get_bytes(self, url: str, referer: str | None = None) -> bytes:
        headers = dict(self.headers)
        if referer:
            headers["Referer"] = referer
        req = Request(url, headers=headers)
        with self.opener.open(req, timeout=self.timeout) as res:
            return res.read()

    def get_text(self, url: str, referer: str | None = None) -> str:
        return self.get_bytes(url, referer=referer).decode("utf-8", errors="replace")

    def list_url(self, page: int) -> str:
        params = {
            "op": "list",
            "page": str(page),
            "mCode": MCODE,
            "chrgCmit": COMMITTEE_CODE,
        }
        return f"{BASE_URL}{LIST_PATH}?{urlencode(params)}"

    def detail_url(self, idx_id: str, page: int) -> str:
        params = {
            "op": "view",
            "mCode": MCODE,
            "page": str(page),
            "isPre": "",
            "mrtlCd": "",
            "idxId": idx_id,
            "schStr": "",
            "fromDt": "",
            "toDt": "",
            "insttDivCdNm": "",
            "insttNms": "",
            "processCdNm": "",
        }
        return f"{BASE_URL}{LIST_PATH}?{urlencode(params)}"

    def download_url(self, atch_file_id: str, file_sn: str, file_extsn: str, cnv_cnt: str) -> str:
        params = {
            "atchFileId": atch_file_id,
            "fileSn": file_sn,
            "fileExtsn": file_extsn,
            "cnvCnt": cnv_cnt,
        }
        return f"{BASE_URL}{DOWNLOAD_PATH}?{urlencode(params)}"

    def discover_last_page(self, html_text: str) -> int:
        pages = [int(page) for page in re.findall(r"[?&amp;]page=(\d+)", html_text)]
        return max(pages) if pages else 1

    def parse_list_page(self, html_text: str, page: int) -> list[Decision]:
        rows = re.findall(r"<tr>\s*(.*?)\s*</tr>", html_text, flags=re.S | re.I)
        decisions: list[Decision] = []

        for row in rows:
            cells = re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.S | re.I)
            if len(cells) < 6:
                continue

            try:
                number = int(clean_text(cells[0]))
            except ValueError:
                continue

            committee = clean_text(cells[1])
            if committee != COMMITTEE_NAME:
                continue

            href_match = re.search(r'<a\s+href="(?P<href>[^"]*idxId=(?P<idx>[^"&]+)[^"]*)"', cells[2], flags=re.I)
            if not href_match:
                continue

            title = clean_text(cells[2])
            decision_date = normalize_date(clean_text(cells[3]))
            preview_match = re.search(r"fn_xmlHtmlView\('([^']*)'\)", cells[4])
            preview_ids = preview_match.group(1) if preview_match else ""
            try:
                view_count = int(clean_text(cells[5]).replace(",", ""))
            except ValueError:
                view_count = 0

            idx_id = href_match.group("idx")
            decisions.append(
                Decision(
                    number=number,
                    idx_id=idx_id,
                    committee=committee,
                    title=title,
                    decision_date=decision_date,
                    detail_url=self.detail_url(idx_id, page),
                    view_count=view_count,
                    preview_ids=preview_ids,
                )
            )
        return decisions

    def parse_detail_page(self, decision: Decision, html_text: str) -> Decision:
        table_match = re.search(r'<table[^>]*class="tbView"[^>]*>(.*?)</table>', html_text, flags=re.S | re.I)
        if not table_match:
            return decision

        rows = re.findall(r"<tr>\s*(.*?)\s*</tr>", table_match.group(1), flags=re.S | re.I)
        for row in rows:
            headers = [clean_text(item) for item in re.findall(r"<th[^>]*>(.*?)</th>", row, flags=re.S | re.I)]
            values = [clean_text(item, preserve_lines=True) for item in re.findall(r"<td[^>]*>(.*?)</td>", row, flags=re.S | re.I)]
            if not headers or not values:
                continue

            if headers[0] == "제목":
                decision.title = values[0]
            elif headers[0] == "회의구분":
                decision.committee = values[0]
            elif headers[0] == "의안번호":
                decision.bill_number = values[0]
                if len(headers) > 1 and headers[1] == "의결일" and len(values) > 1:
                    decision.decision_date = normalize_date(values[1])
            elif headers[0] == "작성일":
                decision.created_date = normalize_date(values[0])
            elif headers[0] == "첨부파일":
                decision.attachments = self.parse_attachments(row)

        content_match = re.search(
            r'<td[^>]*class="tbl_cnts"[^>]*>\s*<div[^>]*>(.*?)</div>\s*</td>',
            table_match.group(1),
            flags=re.S | re.I,
        )
        if content_match:
            decision.request_content, decision.decision_content = parse_content_sections(content_match.group(1))

        return decision

    def parse_attachments(self, html_text: str) -> list[Attachment]:
        pattern = re.compile(
            r'<div[^>]*class="download"[^>]*>\s*'
            r'<img[^>]*>\s*(?P<name>.*?)\s*'
            r'<span>\s*<a[^>]*onclick="(?:javascript:)?fn_egov_downFileCnv\('
            r"'(?P<atch>[^']+)'\s*,\s*'(?P<sn>[^']+)'\s*,\s*'(?P<ext>[^']+)'",
            flags=re.S | re.I,
        )
        cnv_match = re.search(r'name="cnvCnt"\s+value="([^"]*)"', html_text, flags=re.I)
        cnv_cnt = cnv_match.group(1) if cnv_match else "2"

        attachments: list[Attachment] = []
        for match in pattern.finditer(html_text):
            name = clean_text(match.group("name"))
            atch_file_id = match.group("atch")
            file_sn = match.group("sn")
            file_extsn = match.group("ext")
            attachments.append(
                Attachment(
                    name=name,
                    atch_file_id=atch_file_id,
                    file_sn=file_sn,
                    file_extsn=file_extsn,
                    cnv_cnt=cnv_cnt,
                    download_url=self.download_url(atch_file_id, file_sn, file_extsn, cnv_cnt),
                )
            )
        return attachments

    def crawl_index(self, limit_pages: int | None = None, limit_items: int | None = None) -> list[Decision]:
        first_html = self.get_text(self.list_url(1))
        last_page = self.discover_last_page(first_html)
        if limit_pages is not None:
            last_page = min(last_page, limit_pages)

        decisions = self.parse_list_page(first_html, page=1)
        print(f"[list] page 1/{last_page}: {len(decisions)} committee rows")
        polite_sleep(self.delay)

        for page in range(2, last_page + 1):
            page_html = self.get_text(self.list_url(page), referer=self.list_url(page - 1))
            page_decisions = self.parse_list_page(page_html, page=page)
            decisions.extend(page_decisions)
            print(f"[list] page {page}/{last_page}: {len(page_decisions)} committee rows")
            polite_sleep(self.delay)

        unique: dict[str, Decision] = {}
        for decision in decisions:
            unique.setdefault(decision.idx_id, decision)

        ordered = sorted(unique.values(), key=lambda item: item.number, reverse=True)
        if limit_items is not None:
            ordered = ordered[:limit_items]
        return ordered

    def enrich_details(self, decisions: list[Decision]) -> list[Decision]:
        enriched: list[Decision] = []
        for i, decision in enumerate(decisions, start=1):
            html_text = self.get_text(decision.detail_url, referer=self.list_url(1))
            enriched_decision = self.parse_detail_page(decision, html_text)
            enriched.append(enriched_decision)
            print(
                f"[detail] {i}: {enriched_decision.decision_date} "
                f"{enriched_decision.title} attachments={len(enriched_decision.attachments)}"
            )
            polite_sleep(self.delay)
        return enriched

    def download_attachments(self, decisions: list[Decision], output_dir: Path, force: bool = False) -> None:
        for decision in decisions:
            year = decision.decision_date[:4] if decision.decision_date else "unknown"
            target_dir = output_dir / "downloads" / year
            target_dir.mkdir(parents=True, exist_ok=True)

            for attachment in decision.attachments:
                target = target_dir / make_attachment_filename(decision, attachment)
                if target.exists() and target.stat().st_size > 0 and not force and is_valid_existing_file(target):
                    attachment.saved_path = str(target.relative_to(output_dir))
                    attachment.size_bytes = target.stat().st_size
                    attachment.status = "skipped"
                    continue

                try:
                    data = self.get_bytes(attachment.download_url, referer=decision.detail_url)
                    if is_html_response(data):
                        attachment.status = "failed"
                        attachment.error = "server_returned_html"
                        print(f"[download:failed] {decision.idx_id} / {attachment.name}: server_returned_html")
                        continue
                    target.write_bytes(data)
                    attachment.saved_path = str(target.relative_to(output_dir))
                    attachment.size_bytes = len(data)
                    attachment.status = "downloaded"
                    print(f"[download] {attachment.saved_path} ({len(data):,} bytes)")
                except (HTTPError, URLError, TimeoutError, OSError) as exc:
                    attachment.status = "failed"
                    attachment.error = str(exc)
                    print(f"[download:failed] {decision.idx_id} / {attachment.name}: {exc}", file=sys.stderr)
                polite_sleep(self.delay)


def clean_text(value: str, preserve_lines: bool = False) -> str:
    value = re.sub(r"<!--.*?-->", " ", value, flags=re.S)
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"</p\s*>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value).replace("\xa0", " ")
    if preserve_lines:
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in value.splitlines()]
        return "\n".join(line for line in lines if line)
    return re.sub(r"\s+", " ", value).strip()


def normalize_date(value: str) -> str:
    value = clean_text(value)
    match = re.search(r"(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})", value)
    if not match:
        return value
    year, month, day = match.groups()
    return f"{year}-{int(month):02d}-{int(day):02d}"


def parse_content_sections(raw_html: str) -> tuple[str, str]:
    text = clean_text(raw_html, preserve_lines=True)
    request = ""
    decision = ""
    current = ""
    request_lines: list[str] = []
    decision_lines: list[str] = []

    for line in text.splitlines():
        normalized = line.strip()
        if not normalized:
            continue
        if "요청내용" in normalized:
            current = "request"
            continue
        if "의결내용" in normalized:
            current = "decision"
            continue
        if current == "request":
            request_lines.append(normalized)
        elif current == "decision":
            decision_lines.append(normalized)

    request = "\n".join(request_lines)
    decision = "\n".join(decision_lines)
    return request, decision


def safe_filename(value: str, max_length: int = 150) -> str:
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", value)
    value = re.sub(r"\s+", "_", value).strip(" ._")
    return value[:max_length] or "file"


def make_attachment_filename(decision: Decision, attachment: Attachment) -> str:
    original = attachment.name or f"{attachment.atch_file_id}_{attachment.file_sn}.{attachment.file_extsn}"
    suffix = Path(original).suffix or f".{attachment.file_extsn or 'bin'}"
    stem = original[: -len(suffix)] if suffix else original
    prefix = safe_filename(f"{decision.decision_date}_{decision.number}_{decision.idx_id}", max_length=45)
    stem = safe_filename(stem, max_length=105)
    return f"{prefix}_{attachment.file_sn}_{stem}{suffix}"


def is_html_response(data: bytes) -> bool:
    sample = data[:512].lstrip().lower()
    return sample.startswith(b"<!doctype html") or sample.startswith(b"<html")


def is_valid_existing_file(path: Path) -> bool:
    try:
        with path.open("rb") as f:
            sample = f.read(512)
        return not is_html_response(sample)
    except OSError:
        return False


def polite_sleep(delay: float) -> None:
    if delay > 0:
        time.sleep(delay)


def write_outputs(decisions: list[Decision], output_dir: Path) -> None:
    data_dir = output_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    (data_dir / "decisions.json").write_text(
        json.dumps([asdict(decision) for decision in decisions], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    with (data_dir / "decisions.csv").open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "number",
                "idx_id",
                "committee",
                "title",
                "bill_number",
                "decision_date",
                "created_date",
                "detail_url",
                "preview_ids",
                "view_count",
                "attachment_count",
                "request_content",
                "decision_content",
            ],
        )
        writer.writeheader()
        for decision in decisions:
            writer.writerow(
                {
                    "number": decision.number,
                    "idx_id": decision.idx_id,
                    "committee": decision.committee,
                    "title": decision.title,
                    "bill_number": decision.bill_number,
                    "decision_date": decision.decision_date,
                    "created_date": decision.created_date,
                    "detail_url": decision.detail_url,
                    "preview_ids": decision.preview_ids,
                    "view_count": decision.view_count,
                    "attachment_count": len(decision.attachments),
                    "request_content": decision.request_content,
                    "decision_content": decision.decision_content,
                }
            )

    with (data_dir / "attachments.csv").open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "decision_number",
                "idx_id",
                "decision_title",
                "decision_date",
                "bill_number",
                "attachment_name",
                "atch_file_id",
                "file_sn",
                "file_extsn",
                "cnv_cnt",
                "download_url",
                "saved_path",
                "size_bytes",
                "status",
                "error",
            ],
        )
        writer.writeheader()
        for decision in decisions:
            for attachment in decision.attachments:
                writer.writerow(
                    {
                        "decision_number": decision.number,
                        "idx_id": decision.idx_id,
                        "decision_title": decision.title,
                        "decision_date": decision.decision_date,
                        "bill_number": decision.bill_number,
                        "attachment_name": attachment.name,
                        "atch_file_id": attachment.atch_file_id,
                        "file_sn": attachment.file_sn,
                        "file_extsn": attachment.file_extsn,
                        "cnv_cnt": attachment.cnv_cnt,
                        "download_url": attachment.download_url,
                        "saved_path": attachment.saved_path,
                        "size_bytes": attachment.size_bytes,
                        "status": attachment.status,
                        "error": attachment.error,
                    }
                )


def summarize(decisions: list[Decision]) -> dict[str, int]:
    attachments = [attachment for decision in decisions for attachment in decision.attachments]
    return {
        "decisions": len(decisions),
        "attachments": len(attachments),
        "downloaded": sum(1 for item in attachments if item.status == "downloaded"),
        "skipped": sum(1 for item in attachments if item.status == "skipped"),
        "failed": sum(1 for item in attachments if item.status == "failed"),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Download PIPC committee-only decision PDFs.")
    parser.add_argument("--output", default=".", help="Output directory. Defaults to the project directory.")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay between requests in seconds.")
    parser.add_argument("--timeout", type=int, default=30, help="HTTP timeout in seconds.")
    parser.add_argument("--limit-pages", type=int, default=None, help="Crawl only the first N list pages.")
    parser.add_argument("--limit-items", type=int, default=None, help="Crawl only the first N decisions after indexing.")
    parser.add_argument("--no-download", action="store_true", help="Create metadata only; do not download PDFs.")
    parser.add_argument("--force", action="store_true", help="Download even if a target file already exists.")
    return parser.parse_args()


def main() -> int:
    configure_console_encoding()
    args = parse_args()
    output_dir = Path(args.output).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    crawler = PipcDecisionCrawler(delay=args.delay, timeout=args.timeout)
    try:
        decisions = crawler.crawl_index(limit_pages=args.limit_pages, limit_items=args.limit_items)
        decisions = crawler.enrich_details(decisions)
        if not args.no_download:
            crawler.download_attachments(decisions, output_dir=output_dir, force=args.force)
        write_outputs(decisions, output_dir=output_dir)
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"Failed: {exc}", file=sys.stderr)
        return 1

    summary = summarize(decisions)
    print("[summary] " + ", ".join(f"{key}={value}" for key, value in summary.items()))
    return 0


def configure_console_encoding() -> None:
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")


if __name__ == "__main__":
    raise SystemExit(main())
