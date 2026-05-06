# PIPC Dashboard Visual Style Reference

## Direction

보호위 전체회의 대시보드는 `Soft Operational Intelligence` 톤을 따른다.
공공기관 내부 업무도구의 신뢰감과 정보 밀도는 유지하되, 화면 인상은 부드럽고 밝게 만든다.
핵심은 파스텔 기반의 명확한 대비, 읽기 쉬운 카드 위계, 차분한 데이터 시각화다.

## Reference Sources

- Smartify - Smart Home Branding Exploration: 부드러운 브랜드 톤, 밝은 면과 그림자 대비, 간결한 상징 체계.
- Project Management Dashboard: 파스텔 팔레트와 높은 가독성의 핵심 기준.
- Educational Dashboard Design: 여러 지표와 일정성 정보를 한 화면에서 직관적으로 읽는 구조.
- Customer Journey CRM Dashboard: 위원별 성향, 질문 흐름, 준비 포인트를 journey/map처럼 해석하는 방식.

## Palette

- Background: `#F5F7FB`
- Surface: `#FFFFFF`
- Soft Surface: `#EEF3FA`
- Line: `#DCE5F0`
- Strong Line: `#B2C7DC`
- Text: `#263044`
- Muted Text: `#64708A`
- Primary Blue: `#2C65D3`
- Primary Soft: `#E3ECFF`
- Lavender: `#736894`
- Lavender Soft: `#EEEAF7`
- Slate Blue: `#8F95B2`
- Slate Soft: `#EEF1F7`
- Coral: `#F8B1A8`
- Coral Text: `#603E43`
- Warning Gold: `#C28A2C`
- Warning Soft: `#F8E8C8`

## Application Rules

- 첫 화면은 상황판처럼 보이되, 색은 차갑고 부드러운 블루-그레이 기반으로 둔다.
- 주요 CTA와 선택 상태는 `#2C65D3`를 사용한다.
- 제재, 처분, 위험 신호는 코랄 배경과 짙은 브라운 텍스트로 표시한다.
- 위원별 분석은 CRM/journey 대시보드처럼 카드와 흐름 단위로 읽히게 한다.
- 회의 상세 화면은 중앙 속기록, 오른쪽 법조항 비교, 상단 애니메이션 버튼 구조를 유지한다.
- 큰 그라디언트나 장식용 blob은 쓰지 않는다. 데이터 가독성이 우선이다.

## Current CSS Mapping

- `--bg` -> `#F5F7FB`
- `--surface-soft` -> `#EEF3FA`
- `--line` -> `#DCE5F0`
- `--line-strong` -> `#B2C7DC`
- `--text` -> `#263044`
- `--muted` -> `#64708A`
- `--teal` -> `#2C65D3`
- `--teal-soft` -> `#E3ECFF`
- `--coral` -> `#F8B1A8`
- `--coral-soft` -> `#FDE7E3`
- `--danger` -> `#603E43`
- `--olive` -> `#736894`
- `--olive-soft` -> `#EEEAF7`
- `--ink` -> `#8F95B2`
- `--ink-soft` -> `#EEF1F7`
