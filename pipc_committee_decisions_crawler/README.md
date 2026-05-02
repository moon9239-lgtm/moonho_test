# PIPC Committee Decisions Crawler

개인정보보호위원회 `위원회 결정문` 목록에서 회의구분이 `위원회`인 항목만 수집합니다.

대상 페이지:

```text
https://www.pipc.go.kr/np/default/agenda.do?mCode=E030010000
```

검색 필터:

```text
chrgCmit=01
```

`1소위원회`, `2소위원회`, `기타`는 제외합니다.

## 사용법

소량 테스트:

```powershell
python crawler.py --limit-pages 1 --limit-items 3
```

전체 수집:

```powershell
python crawler.py --delay 0.5
```

메타데이터만 확인:

```powershell
python crawler.py --no-download
```

## 결과

```text
data/
  decisions.csv
  decisions.json
  attachments.csv
downloads/
  2026/
  2025/
  ...
```

`decisions.csv`는 결정문 게시글 단위 색인이고, `attachments.csv`는 공개 의결서 첨부파일 단위 색인입니다. 사이트가 PDF와 HWP를 함께 공개하는 경우 둘 다 저장합니다.
