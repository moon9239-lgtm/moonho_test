# 개보위 전체회의 대시보드 재개 메모

작성 시각: 2026-05-05

## 프로젝트 위치

`C:\Users\user\Desktop\메인계정\OneDrive\Desktop\바이브코딩_안티그래비티\test`

## 직전 작업 상태

- 스레드 `개보위 전체회의 프로젝트`의 마지막 작업은 `pipc_dashboard/meeting-2026-04-docs.html` 생성/수정이었다.
- 이 HTML은 2026-03-11, 2026년 제4회 보호위원회의 속기록 원문과 회의록 추출본을 좌우 2패널로 대조하는 화면이다.
- 관련 원문:
  - `pipc_knowledge_base/99_raw/transcripts/2026/2026-03-11_2026년_제4회_보호위원회_1_제4회_전체회의_속기록.md`
  - `analysis_members/minutes_page1_md/2026-03-11_2026년_제4회_보호위원회_0_제4회_전체회의_회의록.md`

## 로컬 실행

프로젝트 루트에서 아래 명령을 실행한다.

```powershell
node pipc_dashboard\tools\static-server.mjs
```

그 다음 브라우저에서 연다.

```text
http://127.0.0.1:5174/pipc_dashboard/meeting-2026-04-docs.html
```

또는 `pipc_dashboard/start-server.cmd`를 실행해도 된다.

## 검증 결과

- `node --test --test-isolation=none tests\*.test.mjs`
- 결과: 42개 테스트 통과
- 정적 서버 단발 응답 확인:
  - URL: `http://127.0.0.1:5174/pipc_dashboard/meeting-2026-04-docs.html`
  - HTTP 200
  - title: `2026년 제4회 보호위원회 문서 대조`

## 주의할 점

- 이 Codex 샌드박스에서는 `Start-Process`가 `Path`/`PATH` 환경변수 충돌로 실패했다.
- 샌드박스 안에서 띄운 백그라운드 Node 프로세스는 명령 종료 후 정리될 수 있다.
- 그래서 지속 실행은 사용자가 `start-server.cmd`를 직접 실행하거나, 터미널에서 `node pipc_dashboard\tools\static-server.mjs`를 켜두는 방식이 안정적이다.
- `oh-my-codex`는 설치되어 있고 `config.toml`에 OMX MCP(state/memory/code-intel/trace/wiki)가 활성화되어 있다. 다만 현재 세션에서는 `omx` CLI shim이 PATH에 바로 노출되지 않을 수 있으므로, 사용 가능하면 OMX를 우선 활용하고 아니면 이 문서와 `AGENTS.md`에 작업 맥락을 남긴다.
- Kordoc MCP는 원문 PDF/HWP 계열 문서를 다시 변환하거나 한국어 공문서 구조를 보존해야 할 때 우선 활용한다. 현재처럼 이미 변환된 MD의 줄끊김 복원 작업은 로컬 정리 규칙으로 처리하되, 원본 문서 재변환이 필요하면 Kordoc을 먼저 확인한다.

## 다음 작업 후보

1. 제4회 전체회의 안건 목록을 회의록/속기록 위치와 매핑한다.
2. `meeting-2026-04-docs.html`에 안건 점프 목록을 추가한다.
3. 매핑 결과를 대시보드의 회의 상세 화면 또는 안건 검색 화면과 연결한다.
