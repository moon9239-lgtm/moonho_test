# PIPC Dashboard Inventory

## Dashboard Snapshot

- Existing snapshot file: `pipc_dashboard/data/dashboard-data.js`는 Supabase 대시보드 뷰를 브라우저 전역 스냅샷으로 저장한 파일이며, `pipc_dashboard/README.md`도 이 파일을 화면용 데이터 스냅샷으로 설명한다.
- Keys available for situation board: `meetingTranscripts`, `commissionerActivity`, `majorPenaltyCases`, `issueTagDistribution`, `lawArticleDistribution`가 확인된다. 보조로 연도/월별 의결·회의 메트릭, `agenda_decision_links`, `decision_cases_with_utterances`, `meetings_with_transcripts_ready` 같은 KPI 필드도 존재한다.
- Keys missing for MVP: 회의 상세 화면이 바로 소비할 정규화된 안건별 발언 묶음, 위원 캐릭터 ID 매핑, 법령 조문 실시간 조회 결과 캐시, 유사사례 텍스트 매칭 점수, 애니메이션용 scene JSON 생성 상태는 별도 파생 또는 어댑터가 필요하다.

## Meeting Detail Sources

- Transcript index source: `meetingTranscripts` 키는 Supabase `dashboard_meeting_transcripts` 뷰 기반이며 `meetings`, `meeting_files`, `source_documents`의 `raw_md_path`를 연결한다고 문서화되어 있다.
- Markdown serving path: 각 항목은 `raw_md_path`와 `/` 구분자로 정리된 `transcript_path`를 가진다. 예: `pipc_knowledge_base/99_raw/transcripts/2026/2026-03-25_2026년_제5회_보호위원회_1_제5회_전체회의_속기록.md`. `pipc_dashboard/tools/static-server.mjs`는 `.md`를 `text/markdown; charset=utf-8`로 서빙할 MIME 매핑을 갖고 있다.
- Known limits: 스냅샷에는 원문 Markdown 파일 경로와 상태(`transcript_status`, `utterance_analysis_status`)는 있지만, 회의 상세 UI용 전문 본문, 발언자별 타임라인, 안건별 세그먼트는 즉시 포함되어 있지 않다. 로컬 정적 서버에서 경로 해석과 인코딩, Windows 역슬래시/웹 슬래시 정규화가 필요하다.

## Law Lookup

- korean-law-mcp package path: `pipc_minutes_crawler/node_modules/korean-law-mcp`에 `korean-law-mcp@3.5.4`가 설치되어 있으며 `build/index.js`, `build/cli.js`를 bin으로 노출한다.
- Historical lookup support observed: `build/tools`에서 `historical-law.js`, `law-history.js`, `article-history.js`, `article-detail.js`, `law-text.js`, `search.js`, `verify-citations.js`, `similar-precedents.js` 등 도구 파일을 확인했다. `lawArticleDistribution`에는 `data_status: partially_mcp_verified`, `verified_rows`, `pending_mcp_rows`, `needs_review_rows`가 있어 과거 MCP 검증 흔적이 남아 있다.
- Adapter requirement: 대시보드 MVP는 조문 문자열(`개인정보 보호법`, `제29조` 등)과 기준일을 MCP 도구 호출 파라미터로 변환하고, 결과를 UI용 제목·본문·시행일·출처 URL·검증 상태로 정규화하는 얇은 어댑터가 필요하다. 네트워크/API 키 실패 시 스냅샷의 부분 검증 필드로 폴백해야 한다.

## Animation Assets

- Character metadata: `pipc_knowledge_base/04_members/character_profiles/characters.json`에 `go_haksu`, `song_kyunghee`, `yoon_jongin` 등 위원 ID, 역할, 상태, 캐릭터 타입, 팔레트, 소품, 발화 제스처, 애니메이션 훅, `source_files`가 정의되어 있다.
- Character image directory: `pipc_knowledge_base/04_members/character_profiles/character_assets/sd3d_members`에 `go_haksu_sd3d_character.png`, `choi_youngjin_sd3d_character.png`, `song_kyunghee_sd3d_character.png` 등 SD3D 캐릭터 PNG와 `character_manifest.json`, contact sheet, gallery HTML이 있다.
- Existing animation prototype: `pipc_knowledge_base/05_animation_prototype`에 `sample_2026_05_meeting_data.json`, `pipc_meeting_animation_sample.html`, `build_meeting_animation_sample.ps1`, `meeting_animation_plan.md`가 존재한다. 기획 문서는 2026-03-25 제5회 전체회의 샘플, 회의장 풀샷, 안건 목록, 발언 흐름, 브라우저 즉시 재생 구조를 제안한다.
- Missing assets: 회의별 자동 생성 scene JSON, 좌석 배치와 참석자 자동 매핑, 입 모양/viseme 에셋, TTS 음성, 카메라 줌/효과음, 모든 위원·사무처 보고자에 대한 애니메이션 상태 세트는 아직 통합 산출물로 확인되지 않는다.

## Commissioner Analysis Sources

- Existing commissioner activity keys: `commissionerActivity`에는 위원 이름, 현직/전직 상태, `top_tags` 배열, `tag_key`, `tag_label`, `tag_category`, `utterance_count`, `average_confidence`가 포함된다. `issueTagDistribution`에는 태그별 전체 발언 수와 상위 위원 목록이 있다.
- Existing speech profile files: `pipc_knowledge_base/04_members/speech_profiles`에 `고학수_speech_profile.md`, `송경희_speech_profile.md`, `윤종인_speech_profile.md` 등 위원별 발화 프로필 파일이 존재한다. `characters.json`도 각 캐릭터에서 관련 인물 Markdown과 speech profile 경로를 참조한다.
- Required derived fields: MVP 위원 분석에는 캐릭터 ID와 위원명 결합, 기간/회의별 발언량, 안건 유형별 발언 패턴, 대표 발언 인용, 최근 회의 추세, 태그 신뢰도 임계값, 위원별 프로필 요약과 이미지 경로가 파생 필드로 필요하다.

## Agenda Assistant Sources

- Existing similar-case sources: `majorPenaltyCases`는 사건번호, 과징금/과태료 관련 주요 사건, 조문 배열(`law_name`, `article_no`, `article_title`)을 제공한다. `pipc_knowledge_base/90_normalized_data/agenda_seed.json`에는 안건 seed와 `agenda_key`가 대량 존재한다. korean-law-mcp 쪽에는 `similar-precedents.js`, `precedent-summary.js`, `precedents.js`, `committee-decisions.js`, `unified-decisions.js` 도구가 있다.
- Existing decision metadata: `dashboard-data.js`에는 `decision_year`, `decision_month_key`, `case_no`, `decision_cases`, `decision_agendas`, `agenda_decision_links`, `linked_decision_posts`, `utterance_case_links`, `decision_cases_with_utterances` 등 의결·안건 연결 메타데이터가 있다.
- Required text matching fields: 안건 보조 기능에는 안건명 원문, 요약문, 관련 법령 조문, 사건번호, 처분 유형, 과징금/과태료 금액, 쟁점 태그, 발언 텍스트, 의결문 본문 또는 발췌, 유사도 점수, 근거 문장 위치, 출처 링크가 필요하다. 현재 스냅샷은 매칭 후보와 통계 중심이라 본문 검색 인덱스와 점수 산출 레이어가 추가되어야 한다.
