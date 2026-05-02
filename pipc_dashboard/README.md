# PIPC Dashboard

개인정보보호위원회 전체회의 분석 대시보드 프로토타입입니다.

## 현재 구현

- 1번 탭: 전체회의 핵심 현황 대시보드
- 2~5번 탭: 다음 구현을 위한 작업면 스켈레톤
- 데이터: Supabase 대시보드 뷰를 로컬 스냅샷으로 저장해 브라우저에서 읽음

## 파일 구조

| 경로 | 역할 |
| --- | --- |
| `index.html` | 앱 진입점 |
| `styles.css` | 레이아웃과 시각 스타일 |
| `app.js` | 탭 전환, 차트/표 렌더링, 필터 프리뷰 |
| `data/dashboard-data.js` | Supabase에서 생성한 화면용 데이터 스냅샷 |
| `tools/fetch-dashboard-data.mjs` | Supabase 뷰를 읽어 스냅샷을 갱신하는 스크립트 |

## 데이터 갱신

```powershell
node pipc_dashboard\tools\fetch-dashboard-data.mjs
```

`SUPABASE_ACCESS_TOKEN`이 현재 셸에 있어야 합니다. 생성된 `data/dashboard-data.js`에는 비밀키가 포함되지 않습니다.

## 열기

`index.html`을 브라우저에서 열면 됩니다. 별도 빌드나 패키지 설치는 필요하지 않습니다.
