# PIPC Analysis Markdown Schema

회의록, 속기록, 위원회 결정문을 연결해 분석 Markdown으로 저장하기 위한 초안입니다.

## File Naming

```text
analysis/
  YYYY/
    YYYY-MM-DD_meeting-{idx_id}_agenda-{decision_idx_id}.md
```

## Front Matter

```yaml
---
analysis_version: 0.1
status: draft
meeting:
  date:
  title:
  idx_id:
  detail_url:
agenda:
  title:
  public: true
  case_numbers: []
decision:
  idx_id:
  number:
  bill_number:
  decision_date:
  created_date:
  detail_url:
source_files:
  meeting_minutes_pdf:
  meeting_transcript_pdf:
  decision_documents: []
derived_files:
  raw_markdown: []
---
```

## Body Sections

```markdown
# 한눈에 보기

# 연결 근거

# 사건 개요

# 회의 논의 맥락

# 결정문별 분석

## 문서 1

### 피심인

### 주요 사실

### 위반 조항

### 처분 및 제재

### 위원회 판단 구조

# 법령·조문 맥락

# 쟁점 태그

# 품질 점검

# 후속 작업
```

## Extraction Notes

- `kordoc` 원문 변환 Markdown은 `raw_md/`에 보관합니다.
- 분석 Markdown은 원문을 그대로 복사하기보다, 색인 CSV와 변환 Markdown에서 필요한 사실을 정규화합니다.
- 표가 복잡한 결정문은 Markdown 표와 HTML 표가 섞일 수 있으므로, 과징금 산정표·처분표는 별도 후처리 후보로 표시합니다.
- 법령 인용은 다음 단계에서 `korean-law-mcp`의 `verify_citations`, `get_law_text`, `chain_amendment_track`로 검증합니다.
