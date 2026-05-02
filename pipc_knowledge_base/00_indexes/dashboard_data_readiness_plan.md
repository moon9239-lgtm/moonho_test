# 개인정보보호위원회 전체회의 분석 대시보드 데이터 준비 계획

생성일: 2026-04-27

## 1. 현재 데이터 자산

현재 Supabase와 로컬 지식베이스 기준으로 대시보드의 뼈대는 이미 상당 부분 준비되어 있다.

| 영역 | 현재 상태 |
| --- | ---: |
| 회의 | 126건 |
| 회의 파일 | 233건 |
| 안건 | 496건 |
| 안건-결정문 링크 | 149건 |
| 결정문 게시글 | 152건 |
| 결정문 파일 | 990건 |
| 결정문 사건 후보 | 506건 |
| 처분 후보 | 1,098건 |
| 금액 후보 | 1,836건 |
| 조항 후보 | 10,085건 |
| 조항 MCP 검증 완료 | 882건 |
| 조항 MCP 재검토 | 98건 |
| 속기록 발언 | 16,287건 |
| 발언-사건 링크 | 2,072건 |
| 위원 | 21명 |
| 위원 발언 집계 | 21명 |
| 발언 성향 태그 | 22,282건 |
| 원문 MD 청크 | 9,059건 |

회의 자료 가용성:

| 상태 | 회의 수 |
| --- | ---: |
| 회의록 있음 / 속기록 있음 / 발언 분석 완료 | 114 |
| 회의록 있음 / 속기록 없음 / 발언 분석 불가 | 5 |
| 회의록 없음 / 속기록 없음 / 발언 분석 불가 | 7 |

## 2. 현재 관계도

```text
meetings
  -> meeting_files
  -> agenda_items
       -> agenda_decision_links -> decision_posts
                                      -> decision_files
                                      -> decision_cases
                                           -> sanctions
                                           -> monetary_penalties
                                           -> law_citations
       -> utterances
             -> utterance_case_links -> decision_cases
             -> utterance_tendency_tags

commissioners
  -> commissioner_terms
  -> utterances
  -> commissioner_speech_aggregates
  -> commissioner_speech_samples
  -> commissioner_tendency_stats

source_documents
  -> meeting_files / decision_files
  -> raw_md_path
  -> document_chunks

law_citations
  -> laws
  -> law_articles
  -> law_versions
  -> law_article_versions
```

## 3. 요구사항별 준비도

### 3.1 전체회의 통계분석 대시보드

지금 바로 가능한 지표:

- 연도별 회의 수
- 연도별 안건 수
- 의결/보고 안건 수와 비율
- 공개/비공개 안건 수와 비율
- 회의록/속기록 보유 현황
- 연도별 발언 수
- 위원별 발언 수
- 처분 후보 종류별 건수
- 조항 후보 상위 빈도
- 위원 성향 태그 빈도

추가 정제 후 보여줘야 하는 지표:

- 최종 과징금/과태료 금액 통계
- 처분대상별 누적 과징금/과태료
- 조항별 최종 처분 수준
- 공공/민간/플랫폼/의료/금융 등 분야별 처분 경향
- 감경/가중 사유별 통계
- 의결 결과 유형: 원안의결, 수정의결, 감경, 부과면제, 개선권고 등
- 회의별 참석 위원 수와 발언 참여율
- 안건별 발언 밀도: 총 발언 수, 위원 발언 수, 사무처 발언 수
- 위원별 관심 쟁점 변화: 연도별 태그 변화

주의할 지표:

- 현재 `monetary_penalties`는 금액 후보이다. 최종 부과액, 기준금액, 감경 후 금액, 매출액, 비율 조각이 섞일 수 있다.
- 현재 조항 후보 10,085건 중 882건은 `korean-law-mcp`로 기준일별 법령 버전과 조문 내용까지 연결됐다.
- 법령명이 비어 있어 `개인정보 보호법`으로 추정한 후보 중 조문/항이 맞지 않는 98건은 확정 부재가 아니라 `needs_review`로 남겨야 한다.

### 3.2 안건 통합검색

지금 가능한 검색 축:

- 회의일/연도/회차
- 안건명
- 보고/의결 구분
- 공개/비공개
- 사건번호
- 결정문 게시글
- 결정문 사건 후보
- 처분 후보
- 조항 후보
- 위원 발언 키워드
- 위원 성향 태그

추가로 필요한 검색 인덱스:

- `dashboard_agenda_search_index`: 안건 단위 통합 검색 행
- `document_chunks`: 결정문/속기록 원문 청킹 완료
- `dashboard_document_chunk_search_index`: 원문 청크 키워드 검색용 뷰 생성 완료
- `search_vector`: PostgreSQL full-text 검색용
- `embedding`: 유사사건 검색용 벡터
- `normalized_entities`: 처분대상/기관명 정규화
- `topic_links`: 사건 주제 태깅

현재 큰 공백:

- `document_chunks`는 9,059건 적재됐지만, 아직 임베딩이 0건이다. 키워드 전문 검색은 준비됐고 의미 기반 유사사건 검색에는 임베딩 적재가 필요하다.
- 처분대상명이 아직 고정밀 후보만 들어가 있어, 전체 사건의 피심인/대상기관 검색에는 부족하다.

### 3.3 각 회의별 확인

지금 가능한 화면:

- 회의 기본정보: 일자, 회차, 제목, 자료 보유 상태
- 안건 목록: 안건명, 의결/보고, 공개/비공개, 사건번호
- 연결 결정문
- 연결 사건 후보
- 발언 목록
- 안건별 발언 구간
- 위원별 발언
- 원문 MD 링크

추가로 필요한 데이터:

- `meeting_attendance`: 회의별 참석 위원 명단
- `agenda_segments`: 속기록 내 안건별 시작/종료 발언 순서
- `agenda_outcomes`: 안건별 최종 처리 결과
- `meeting_timeline_events`: 회의 재현용 진행 이벤트
- `meeting_room_layouts`: 회의실 좌석 배치
- `commissioner_avatar_profiles`: 캐릭터/페르소나/음성/표정 메타데이터

회의 재현 기능은 마지막에 하는 것이 맞다. 그 전에 `agenda_segments`와 `meeting_timeline_events`가 안정적으로 있어야 한다.

### 3.4 위원 대시보드

지금 가능한 화면:

- 위원 기본 프로필
- 임기/추천 경로
- 발언 수, 회의 수
- 안건 연결 발언 수
- 사건 연결 발언 수
- 성향 태그 후보
- 대표 발언 샘플
- 처분/조항 후보와 연결된 발언

추가로 필요한 데이터:

- 성향 태그의 방향성: 찬성, 반대, 감경 지지, 가중 지지, 보완 요구 등
- 위원별 질문 유형: 사실확인, 법리검토, 기술검토, 정책제안, 처분수준 조정
- 위원별 변화 추이: 연도별 관심 쟁점
- 위원별 공동발언/논점 네트워크

### 3.5 신규 안건 준비 도우미

지금 가능한 분석:

- 유사 사건 후보 검색: 사건번호/안건명/조항/처분 키워드 기반
- 관련 위원 발언 샘플 제공
- 관련 조항 후보 제공
- 유사 처분 후보 제공

추가로 필요한 데이터:

- `case_similarity_features`: 유사사건 검색용 특징 벡터
- `verified_penalty_outcomes`: 최종 과징금/과태료 금액
- `verified_law_article_versions`: 해당 시점 조문 내용
- `decision_reasoning_points`: 결정문 이유 부분에서 쟁점 추출
- `commissioner_question_patterns`: 위원별 예상 질의 패턴
- `preparation_checklists`: 조항/사건유형별 검토 체크리스트

## 4. 추가 스키마 후보

### 4.1 대시보드용 뷰/마트

1. `dashboard_yearly_stats`
   - 연도별 회의/안건/의결/보고/공개/비공개/발언/결정문/처분/조항 통계

2. `dashboard_agenda_search_index`
   - 안건 1건당 1행
   - 회의, 안건, 사건, 피심인, 조항, 처분, 금액, 주요 발언을 denormalized
   - 검색 화면의 기본 테이블

3. `dashboard_meeting_detail`
   - 회의 1건당 1행
   - 회의 기본정보, 참석위원, 안건 JSON, 파일 상태, 발언 수

4. `dashboard_commissioner_profile`
   - 위원 1명당 1행
   - 기본 프로필, 임기, 발언 집계, 태그, 대표 발언 경로

5. `dashboard_case_detail`
   - 사건 후보 1건당 1행
   - 결정문, 처분, 금액, 조항, 연결 안건, 연결 발언

### 4.2 추가 정규화 테이블

1. `meeting_attendance`
   - `meeting_id`, `commissioner_id`, `attendance_status`, `role_at_meeting`, `source_text`, `confidence`

2. `agenda_segments`
   - `agenda_item_id`, `start_utterance_order`, `end_utterance_order`, `segment_method`, `confidence`

3. `agenda_outcomes`
   - `agenda_item_id`, `outcome_kind`, `outcome_text`, `decision_variant`, `confidence`

4. `decision_penalty_outcomes`
   - `decision_case_id`, `penalty_kind`, `amount_role`, `amount_krw`, `is_final_amount`, `basis_text`, `confidence`

5. `entity_aliases`
   - `entity_id`, `alias`, `alias_type`, `source_type`, `confidence`

6. `law_article_verification_jobs`
   - 조항 후보를 `korean-law-mcp`로 검증하기 위한 큐

7. `case_similarity_features`
   - `decision_case_id`, 조항/처분/주제/금액/텍스트 임베딩 등 유사사건 검색용 특징

8. `preparation_assistant_runs`
   - 신규 안건 준비 도우미의 입력, 추천 유사사건, 예상 질의, 생성 결과 기록

## 5. 우선순위 작업

### P0. 검색/통계 대시보드 전에 꼭 해야 할 작업

1. 대시보드용 통계 뷰 생성
2. 안건 검색 인덱스 생성
3. 원문 MD 청킹 및 `document_chunks` 적재 완료
4. 금액 후보 정제: 최종금액/기준금액/감경금액 분류
5. 조항 후보 상위 항목부터 `korean-law-mcp` 검증

### P1. 회의 상세 화면 품질을 높이는 작업

1. 회의별 참석위원 추출
2. 안건별 발언 구간 `agenda_segments` 확정
3. 안건별 결과 문구 추출
4. 비공개/자료없음 회차 결측 상태를 UI에 노출할 수 있도록 사유 정리

### P2. 위원 대시보드와 준비 도우미 고도화

1. 위원 성향 태그 방향성 분류
2. 위원별 예상질의 패턴 생성
3. 유사사건 벡터 검색
4. 조항별 체크리스트 생성
5. 회의 재현용 타임라인/캐릭터 데이터 설계

## 6. 추천 다음 작업

가장 먼저 완료된 작업은 `dashboard_tab1_*` 통계 뷰와 `document_chunks` 적재이다. 다음 작업은 `dashboard_agenda_search_index`와 임베딩 적재 중 하나를 선택하면 된다.

두 작업이 이어지면 바로 다음이 가능해진다.

- 전체회의 통계분석 대시보드의 첫 화면
- 안건 통합검색의 기본 목록
- 회의 상세 페이지로 이동하는 링크
- 위원/조항/처분/금액 필터

다만 금액과 조항은 현재 후보 상태이므로 UI에서 `후보`, `검증전`, `원문대조 필요` 상태를 함께 표시해야 한다.
