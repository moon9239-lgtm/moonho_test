# PIPC member character profiles

이 폴더는 `04_members`의 멤버 프로필과 `speech_profiles`의 규칙 기반 발언 태그를 바탕으로 만든 모의회의 애니메이션용 캐릭터 초안입니다.

## 사용 원칙

- 실존 인물의 실제 얼굴이나 목소리를 복제하지 않는다.
- 캐릭터는 역할, 전문 배경, 회의 발언 기능을 시각화한 오리지널 아바타로 설계한다.
- 발언 성향은 `speech_profiles`의 자동 태그에서 출발한 연출 가이드이며, 확정적 인물 평가는 아니다.
- 외부 공개용 영상에서는 이름 대신 "위원장", "소비자 권익 위원", "보안 기술 위원"처럼 역할명 캐릭터로 바꾸어도 된다.
- 이미지 생성 시에는 `not a portrait, no photographic likeness, fictionalized original character`를 프롬프트에 포함한다.

## 파일

- `member_character_bible.md`: 사람이 읽는 캐릭터 바이블 초안
- `characters.json`: 애니메이션 파이프라인에서 읽기 쉬운 구조화 데이터
- `image_prompt_template.md`: 이미지 생성 및 캐릭터 시트 제작용 프롬프트 템플릿
- `photo_references/photo_manifest.json`: 사진 파일, 출처, 검증 상태
- `photo_references/photo_reference_index.md`: 사진 참조자료를 사람이 읽기 쉽게 정리한 인덱스
- `photo_references/originals/`: 공식 사진 및 검색 후보 원본 저장 폴더

## 다음 단계

1. 현재 캐릭터 초안을 검토해 톤을 고른다. 예: 공공기관 브리핑풍, 웹툰풍, 픽사풍 3D가 아닌 2D 모션그래픽풍.
2. 공식 사진이 있는 대표 멤버 3명으로 이미지 시트를 먼저 만든다.
3. 표정 6종, 회의 제스처 4종, 앉은 자세 2종을 고정한다.
4. 모의회의 대본 생성기는 `characters.json`의 `voice_direction`, `meeting_function`, `top_tags`를 참조한다.
