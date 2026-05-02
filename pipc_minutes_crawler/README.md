# PIPC Minutes Crawler

개인정보보호위원회 `보호위원회` 회의 일정 페이지에서 공개된 회의록/속기록 PDF를 내려받고 색인을 만드는 크롤러입니다.

대상 페이지:

```text
https://www.pipc.go.kr/np/default/minutes.do?mCode=E020010000&schTypeCd=1
```

## 사용법

먼저 소량 테스트:

```powershell
python crawler.py --limit-pages 1 --limit-items 3
```

전체 수집:

```powershell
python crawler.py
```

메타데이터만 확인:

```powershell
python crawler.py --no-download
```

## 결과

```text
data/
  meetings.csv
  meetings.json
  attachments.csv
downloads/
  2026/
  2025/
  ...
```

`meetings.csv`는 회의 단위 색인이고, `attachments.csv`는 첨부파일 단위 색인입니다.

## 주의

공개 페이지를 천천히 읽도록 기본 지연시간을 `0.5`초로 두었습니다. 전체 재수집이 필요하면 사이트에 부담을 주지 않도록 `--delay 1`처럼 더 여유 있게 실행하세요.
