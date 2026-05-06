# PIPC Dashboard

개인정보보호위원회 전체회의 내부 업무도구 MVP입니다.

## 실행

```powershell
node pipc_dashboard\tools\static-server.mjs
```

브라우저에서 `http://127.0.0.1:5174/pipc_dashboard/`를 엽니다.

`npm`이 설치된 환경에서는 다음 명령도 사용할 수 있습니다.

```powershell
cd pipc_dashboard
npm run serve
```

## 테스트

현재 작업 환경에서는 `npm`이 PATH에 없을 수 있으므로 Node로 테스트 파일을 직접 실행합니다.

```powershell
node pipc_dashboard\tests\data-model.test.mjs
node pipc_dashboard\tests\renderers.test.mjs
node pipc_dashboard\tests\meeting-detail.test.mjs
node pipc_dashboard\tests\law-references.test.mjs
node pipc_dashboard\tests\animation-model.test.mjs
node pipc_dashboard\tests\commissioner-model.test.mjs
node pipc_dashboard\tests\agenda-assistant-model.test.mjs
```

## 데이터 갱신

```powershell
node pipc_dashboard\tools\fetch-dashboard-data.mjs
```

`SUPABASE_ACCESS_TOKEN`이 현재 셸에 있어야 합니다. 생성된 `data/dashboard-data.js`에는 비밀키가 포함되지 않습니다.

## 현재 MVP 범위

- 회의 운영 상황판
- 회의 상세 탐색
- 속기록 내 법조항 참조 감지와 비교 패널 구조
- 선택형 회의 애니메이션 프로토타입
- 위원별 분석 초기 화면
- 텍스트 입력 기반 새 안건 준비 도우미

## 주요 데이터

- `data/dashboard-data.js`: 브라우저에서 읽는 로컬 스냅샷
- `src/*`: 테스트 가능한 ES 모듈
- `tools/static-server.mjs`: 대시보드와 지식베이스 Markdown을 함께 제공하는 로컬 서버
- `tools/fetch-dashboard-data.mjs`: Supabase 뷰 기반 스냅샷 갱신 스크립트
