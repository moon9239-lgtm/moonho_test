window.PIPC_DASHBOARD_DATA = {
  "moneyKpis": [
    {
      "note": "과징금·과태료 등 확정 금액 합계",
      "label": "전체 처분금액",
      "card_key": "total_penalty_amount",
      "meta_text": "309개 금전처분 사건 기준",
      "amount_krw": 280176309000,
      "sort_order": 1,
      "value_text": "2801.8억"
    },
    {
      "note": "금액 규모를 좌우하는 핵심 처분",
      "label": "과징금 합계",
      "card_key": "surcharge_amount",
      "meta_text": "전체 금액의 99.4%",
      "amount_krw": 278611309000,
      "sort_order": 2,
      "value_text": "2786.1억"
    },
    {
      "note": "건수는 많지만 과징금보다 총액 영향은 작음",
      "label": "과태료 합계",
      "card_key": "fine_amount",
      "meta_text": "확정 과태료 합계",
      "amount_krw": 1565000000,
      "sort_order": 3,
      "value_text": "15.7억"
    },
    {
      "note": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "label": "최고 처분 사건",
      "card_key": "largest_case",
      "meta_text": "1348.0억 · 2025-08-27",
      "amount_krw": 134800600000,
      "sort_order": 4,
      "value_text": "에스케이텔레콤 주식회사"
    },
    {
      "note": "기관·기업명 식별 기준",
      "label": "처분 대상",
      "card_key": "identified_targets",
      "meta_text": "대상 미식별 사건 224건",
      "amount_krw": null,
      "sort_order": 5,
      "value_text": "83곳"
    },
    {
      "note": "회의 개최 흐름은 하단 캘린더에서 확인",
      "label": "전체회의 개최",
      "card_key": "meetings",
      "meta_text": "2020-08-05 ~ 2026-04-22",
      "amount_krw": null,
      "sort_order": 6,
      "value_text": "126회"
    },
    {
      "note": "현재 전체회의 구성 스냅샷",
      "label": "현재 2기 위원",
      "card_key": "current_second_commissioners",
      "meta_text": "조소영 위원 사퇴, 김휘강 위원 합류 반영",
      "amount_krw": null,
      "sort_order": 7,
      "value_text": "9명"
    }
  ],
  "dataQuality": [
    {
      "label": "속기록 분석 가능 회의",
      "notes": "속기록이 없는 회차는 없는 상태 그대로 표시합니다.",
      "ratio": 0.9048,
      "status": "partial",
      "metric_key": "transcript_ready_meetings",
      "total_count": 126,
      "value_count": 114
    },
    {
      "label": "안건 연결 발언",
      "notes": "일부 발언은 개회, 폐회, 절차 발언 등이라 특정 안건에 붙지 않을 수 있습니다.",
      "ratio": 0.8891,
      "status": "partial",
      "metric_key": "utterances_with_agenda",
      "total_count": 16287,
      "value_count": 14480
    },
    {
      "label": "회의 안건과 연결된 결정문 게시글",
      "notes": "제목, 회차, 사건번호를 이용해 연결한 범위입니다.",
      "ratio": 0.9539,
      "status": "partial",
      "metric_key": "decision_posts_linked_to_agenda",
      "total_count": 152,
      "value_count": 145
    },
    {
      "label": "발언과 연결된 결정 사건",
      "notes": "위원 질의와 결정문 사건을 직접 연결한 범위입니다. 향후 검색/RAG로 보강할 구간입니다.",
      "ratio": 0.083,
      "status": "needs_work",
      "metric_key": "decision_cases_with_utterance_links",
      "total_count": 506,
      "value_count": 42
    },
    {
      "label": "법령 MCP 검증 조항",
      "notes": "시점별 조문 검증 완료, MCP 대기, 재검토 필요 항목을 분리했습니다.",
      "ratio": 0.8462,
      "status": "needs_work",
      "metric_key": "law_citations_mcp_verified",
      "total_count": 10085,
      "value_count": 8534
    },
    {
      "label": "법령 MCP 대기 조항",
      "notes": "대기 항목은 조문 원문 확인을 계속 진행해야 합니다.",
      "ratio": 0,
      "status": "ready",
      "metric_key": "law_citations_pending_mcp",
      "total_count": 10085,
      "value_count": 0
    },
    {
      "label": "검색/RAG 문서 청크",
      "notes": "통합검색과 신규 안건 도우미를 위해 청크/임베딩 적재를 계속 보강합니다.",
      "ratio": 6.0353,
      "status": "partial",
      "metric_key": "document_chunks",
      "total_count": 1501,
      "value_count": 9059
    },
    {
      "label": "금액 행 상태 정리",
      "notes": "최종액, 문맥상 숫자, 재검토 필요 금액을 구분했습니다.",
      "ratio": 1,
      "status": "ready",
      "metric_key": "penalty_rows_resolved",
      "total_count": 1836,
      "value_count": 1836
    },
    {
      "label": "확정 처분 금액",
      "notes": "대시보드 금액 통계는 이 확정 금액 테이블을 사용합니다.",
      "ratio": 1,
      "status": "ready",
      "metric_key": "verified_penalty_outcomes",
      "total_count": 375,
      "value_count": 375
    }
  ],
  "generatedAt": "2026-04-27T09:55:22.376104+00:00",
  "moneyYearly": [
    {
      "top_case_no": "2021조일0035",
      "decision_year": 2021,
      "fine_total_krw": 156400000,
      "top_target_name": "넷플릭스",
      "amount_total_krw": 565700000,
      "max_case_amount_krw": 227200000,
      "monetary_case_count": 19,
      "surcharge_total_krw": 409300000,
      "identified_target_count": 5
    },
    {
      "top_case_no": "2021조일0028",
      "decision_year": 2022,
      "fine_total_krw": 389500000,
      "top_target_name": "구글",
      "amount_total_krw": 69783990000,
      "max_case_amount_krw": 69241000000,
      "monetary_case_count": 83,
      "surcharge_total_krw": 69394490000,
      "identified_target_count": 20
    },
    {
      "top_case_no": "2023조이0003",
      "decision_year": 2023,
      "fine_total_krw": 628700000,
      "top_target_name": "㈜엘지유플러스",
      "amount_total_krw": 11039753000,
      "max_case_amount_krw": 6827452000,
      "monetary_case_count": 130,
      "surcharge_total_krw": 10411053000,
      "identified_target_count": 16
    },
    {
      "top_case_no": "2023조이0023",
      "decision_year": 2024,
      "fine_total_krw": 206200000,
      "top_target_name": "㈜카카오",
      "amount_total_krw": 29621992000,
      "max_case_amount_krw": 15149760000,
      "monetary_case_count": 39,
      "surcharge_total_krw": 29415792000,
      "identified_target_count": 8
    },
    {
      "top_case_no": "2025조이0056",
      "decision_year": 2025,
      "fine_total_krw": 170100000,
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 167529074000,
      "max_case_amount_krw": 134800600000,
      "monetary_case_count": 34,
      "surcharge_total_krw": 167358974000,
      "identified_target_count": 31
    },
    {
      "top_case_no": "2025조총0045",
      "decision_year": 2026,
      "fine_total_krw": 14100000,
      "top_target_name": "한국연구재단",
      "amount_total_krw": 1635800000,
      "max_case_amount_krw": 707800000,
      "monetary_case_count": 4,
      "surcharge_total_krw": 1621700000,
      "identified_target_count": 3
    }
  ],
  "yearlyStats": [
    {
      "meetings": 9,
      "sanctions": 0,
      "utterances": 1171,
      "agenda_items": 39,
      "meeting_year": 2020,
      "law_citations": 0,
      "decision_cases": 0,
      "public_agendas": 31,
      "report_agendas": 22,
      "private_agendas": 8,
      "decision_agendas": 15,
      "linked_agenda_items": 1,
      "report_agenda_ratio": 0.5641,
      "unspecified_agendas": 2,
      "private_agenda_ratio": 0.2051,
      "utterance_case_links": 0,
      "agenda_decision_links": 1,
      "decision_agenda_ratio": 0.3846,
      "linked_decision_posts": 1,
      "utterances_with_agenda": 1112,
      "avg_agendas_per_meeting": 4.33,
      "law_citations_mcp_pending": 0,
      "monetary_penalty_outcomes": 0,
      "avg_utterances_per_meeting": 130.11,
      "law_citations_mcp_verified": 0,
      "law_citations_needs_review": 0,
      "meetings_without_transcripts": 0,
      "commissioners_with_utterances": 10,
      "decision_cases_with_utterances": 0,
      "meetings_with_transcripts_ready": 9,
      "monetary_penalty_amount_avg_krw": 0,
      "monetary_penalty_amount_max_krw": 0,
      "monetary_penalty_amount_total_krw": 0
    },
    {
      "meetings": 21,
      "sanctions": 56,
      "utterances": 1802,
      "agenda_items": 68,
      "meeting_year": 2021,
      "law_citations": 798,
      "decision_cases": 28,
      "public_agendas": 51,
      "report_agendas": 26,
      "private_agendas": 17,
      "decision_agendas": 42,
      "linked_agenda_items": 19,
      "report_agenda_ratio": 0.3824,
      "unspecified_agendas": 0,
      "private_agenda_ratio": 0.25,
      "utterance_case_links": 22,
      "agenda_decision_links": 21,
      "decision_agenda_ratio": 0.6176,
      "linked_decision_posts": 19,
      "utterances_with_agenda": 1493,
      "avg_agendas_per_meeting": 3.24,
      "law_citations_mcp_pending": 0,
      "monetary_penalty_outcomes": 24,
      "avg_utterances_per_meeting": 85.81,
      "law_citations_mcp_verified": 670,
      "law_citations_needs_review": 123,
      "meetings_without_transcripts": 0,
      "commissioners_with_utterances": 10,
      "decision_cases_with_utterances": 4,
      "meetings_with_transcripts_ready": 21,
      "monetary_penalty_amount_avg_krw": 23570833,
      "monetary_penalty_amount_max_krw": 224000000,
      "monetary_penalty_amount_total_krw": 565700000
    },
    {
      "meetings": 21,
      "sanctions": 207,
      "utterances": 1904,
      "agenda_items": 70,
      "meeting_year": 2022,
      "law_citations": 2062,
      "decision_cases": 113,
      "public_agendas": 56,
      "report_agendas": 19,
      "private_agendas": 14,
      "decision_agendas": 51,
      "linked_agenda_items": 25,
      "report_agenda_ratio": 0.2714,
      "unspecified_agendas": 0,
      "private_agenda_ratio": 0.2,
      "utterance_case_links": 366,
      "agenda_decision_links": 25,
      "decision_agenda_ratio": 0.7286,
      "linked_decision_posts": 25,
      "utterances_with_agenda": 1550,
      "avg_agendas_per_meeting": 3.33,
      "law_citations_mcp_pending": 0,
      "monetary_penalty_outcomes": 87,
      "avg_utterances_per_meeting": 90.67,
      "law_citations_mcp_verified": 1776,
      "law_citations_needs_review": 267,
      "meetings_without_transcripts": 1,
      "commissioners_with_utterances": 12,
      "decision_cases_with_utterances": 11,
      "meetings_with_transcripts_ready": 20,
      "monetary_penalty_amount_avg_krw": 802114828,
      "monetary_penalty_amount_max_krw": 69241000000,
      "monetary_penalty_amount_total_krw": 69783990000
    },
    {
      "meetings": 21,
      "sanctions": 379,
      "utterances": 2680,
      "agenda_items": 104,
      "meeting_year": 2023,
      "law_citations": 3615,
      "decision_cases": 164,
      "public_agendas": 81,
      "report_agendas": 29,
      "private_agendas": 23,
      "decision_agendas": 75,
      "linked_agenda_items": 40,
      "report_agenda_ratio": 0.2788,
      "unspecified_agendas": 0,
      "private_agenda_ratio": 0.2212,
      "utterance_case_links": 474,
      "agenda_decision_links": 41,
      "decision_agenda_ratio": 0.7212,
      "linked_decision_posts": 40,
      "utterances_with_agenda": 2553,
      "avg_agendas_per_meeting": 4.95,
      "law_citations_mcp_pending": 0,
      "monetary_penalty_outcomes": 143,
      "avg_utterances_per_meeting": 127.62,
      "law_citations_mcp_verified": 3040,
      "law_citations_needs_review": 556,
      "meetings_without_transcripts": 2,
      "commissioners_with_utterances": 16,
      "decision_cases_with_utterances": 9,
      "meetings_with_transcripts_ready": 19,
      "monetary_penalty_amount_avg_krw": 77201070,
      "monetary_penalty_amount_max_krw": 6800452000,
      "monetary_penalty_amount_total_krw": 11039753000
    },
    {
      "meetings": 21,
      "sanctions": 186,
      "utterances": 4012,
      "agenda_items": 84,
      "meeting_year": 2024,
      "law_citations": 1480,
      "decision_cases": 98,
      "public_agendas": 44,
      "report_agendas": 33,
      "private_agendas": 40,
      "decision_agendas": 51,
      "linked_agenda_items": 26,
      "report_agenda_ratio": 0.3929,
      "unspecified_agendas": 0,
      "private_agenda_ratio": 0.4762,
      "utterance_case_links": 218,
      "agenda_decision_links": 27,
      "decision_agenda_ratio": 0.6071,
      "linked_decision_posts": 27,
      "utterances_with_agenda": 3227,
      "avg_agendas_per_meeting": 4,
      "law_citations_mcp_pending": 0,
      "monetary_penalty_outcomes": 56,
      "avg_utterances_per_meeting": 191.05,
      "law_citations_mcp_verified": 1183,
      "law_citations_needs_review": 297,
      "meetings_without_transcripts": 0,
      "commissioners_with_utterances": 10,
      "decision_cases_with_utterances": 5,
      "meetings_with_transcripts_ready": 21,
      "monetary_penalty_amount_avg_krw": 528964143,
      "monetary_penalty_amount_max_krw": 15141960000,
      "monetary_penalty_amount_total_krw": 29621992000
    },
    {
      "meetings": 26,
      "sanctions": 247,
      "utterances": 3723,
      "agenda_items": 97,
      "meeting_year": 2025,
      "law_citations": 1975,
      "decision_cases": 99,
      "public_agendas": 50,
      "report_agendas": 31,
      "private_agendas": 47,
      "decision_agendas": 66,
      "linked_agenda_items": 31,
      "report_agenda_ratio": 0.3196,
      "unspecified_agendas": 0,
      "private_agenda_ratio": 0.4845,
      "utterance_case_links": 871,
      "agenda_decision_links": 31,
      "decision_agenda_ratio": 0.6804,
      "linked_decision_posts": 30,
      "utterances_with_agenda": 3588,
      "avg_agendas_per_meeting": 3.73,
      "law_citations_mcp_pending": 0,
      "monetary_penalty_outcomes": 58,
      "avg_utterances_per_meeting": 143.19,
      "law_citations_mcp_verified": 1734,
      "law_citations_needs_review": 230,
      "meetings_without_transcripts": 7,
      "commissioners_with_utterances": 11,
      "decision_cases_with_utterances": 9,
      "meetings_with_transcripts_ready": 19,
      "monetary_penalty_amount_avg_krw": 2888432310,
      "monetary_penalty_amount_max_krw": 134791000000,
      "monetary_penalty_amount_total_krw": 167529074000
    },
    {
      "meetings": 7,
      "sanctions": 23,
      "utterances": 995,
      "agenda_items": 34,
      "meeting_year": 2026,
      "law_citations": 155,
      "decision_cases": 4,
      "public_agendas": 13,
      "report_agendas": 14,
      "private_agendas": 21,
      "decision_agendas": 20,
      "linked_agenda_items": 3,
      "report_agenda_ratio": 0.4118,
      "unspecified_agendas": 0,
      "private_agenda_ratio": 0.6176,
      "utterance_case_links": 121,
      "agenda_decision_links": 3,
      "decision_agenda_ratio": 0.5882,
      "linked_decision_posts": 3,
      "utterances_with_agenda": 957,
      "avg_agendas_per_meeting": 4.86,
      "law_citations_mcp_pending": 0,
      "monetary_penalty_outcomes": 7,
      "avg_utterances_per_meeting": 142.14,
      "law_citations_mcp_verified": 131,
      "law_citations_needs_review": 20,
      "meetings_without_transcripts": 2,
      "commissioners_with_utterances": 9,
      "decision_cases_with_utterances": 4,
      "meetings_with_transcripts_ready": 5,
      "monetary_penalty_amount_avg_krw": 233685714,
      "monetary_penalty_amount_max_krw": 703000000,
      "monetary_penalty_amount_total_krw": 1635800000
    }
  ],
  "moneyMonthly": [
    {
      "decision_year": 2021,
      "decision_month": 7,
      "fine_total_krw": 4800000,
      "top_target_name": "2021조이0055",
      "amount_total_krw": 4800000,
      "decision_month_key": "2021-07",
      "max_case_amount_krw": 4800000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2021,
      "decision_month": 8,
      "fine_total_krw": 3200000,
      "top_target_name": "넷플릭스",
      "amount_total_krw": 227200000,
      "decision_month_key": "2021-08",
      "max_case_amount_krw": 227200000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 224000000
    },
    {
      "decision_year": 2021,
      "decision_month": 9,
      "fine_total_krw": 148400000,
      "top_target_name": "㈜스타일쉐어",
      "amount_total_krw": 333700000,
      "decision_month_key": "2021-09",
      "max_case_amount_krw": 110700000,
      "monetary_case_count": 17,
      "surcharge_total_krw": 185300000
    },
    {
      "decision_year": 2022,
      "decision_month": 2,
      "fine_total_krw": 18600000,
      "top_target_name": "트리플콤마(주)",
      "amount_total_krw": 148390000,
      "decision_month_key": "2022-02",
      "max_case_amount_krw": 148390000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 129790000
    },
    {
      "decision_year": 2022,
      "decision_month": 3,
      "fine_total_krw": 92000000,
      "top_target_name": "성보공업",
      "amount_total_krw": 115700000,
      "decision_month_key": "2022-03",
      "max_case_amount_krw": 21500000,
      "monetary_case_count": 16,
      "surcharge_total_krw": 23700000
    },
    {
      "decision_year": 2022,
      "decision_month": 4,
      "fine_total_krw": 1000000,
      "top_target_name": "2021조총0080",
      "amount_total_krw": 1000000,
      "decision_month_key": "2022-04",
      "max_case_amount_krw": 1000000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2022,
      "decision_month": 5,
      "fine_total_krw": 44100000,
      "top_target_name": "제2022-009-056호",
      "amount_total_krw": 44100000,
      "decision_month_key": "2022-05",
      "max_case_amount_krw": 13500000,
      "monetary_case_count": 8,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2022,
      "decision_month": 6,
      "fine_total_krw": 16600000,
      "top_target_name": "주식회사_ㅇㅇㅇ",
      "amount_total_krw": 16600000,
      "decision_month_key": "2022-06",
      "max_case_amount_krw": 5000000,
      "monetary_case_count": 10,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2022,
      "decision_month": 7,
      "fine_total_krw": 7800000,
      "top_target_name": "제2022-012-087호",
      "amount_total_krw": 7800000,
      "decision_month_key": "2022-07",
      "max_case_amount_krw": 7800000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2022,
      "decision_month": 8,
      "fine_total_krw": 46000000,
      "top_target_name": "(주)발란",
      "amount_total_krw": 46000000,
      "decision_month_key": "2022-08",
      "max_case_amount_krw": 14400000,
      "monetary_case_count": 9,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2022,
      "decision_month": 9,
      "fine_total_krw": 82200000,
      "top_target_name": "구글",
      "amount_total_krw": 69323200000,
      "decision_month_key": "2022-09",
      "max_case_amount_krw": 69241000000,
      "monetary_case_count": 25,
      "surcharge_total_krw": 69241000000
    },
    {
      "decision_year": 2022,
      "decision_month": 11,
      "fine_total_krw": 81200000,
      "top_target_name": "제2022-019-166호",
      "amount_total_krw": 81200000,
      "decision_month_key": "2022-11",
      "max_case_amount_krw": 12000000,
      "monetary_case_count": 12,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2023,
      "decision_month": 1,
      "fine_total_krw": 13000000,
      "top_target_name": "제2023-001-001호",
      "amount_total_krw": 13000000,
      "decision_month_key": "2023-01",
      "max_case_amount_krw": 10000000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2023,
      "decision_month": 2,
      "fine_total_krw": 22600000,
      "top_target_name": "(재)한국어린이안전재단",
      "amount_total_krw": 22600000,
      "decision_month_key": "2023-02",
      "max_case_amount_krw": 9000000,
      "monetary_case_count": 5,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2023,
      "decision_month": 3,
      "fine_total_krw": 91600000,
      "top_target_name": "제2023-005-043호",
      "amount_total_krw": 189600000,
      "decision_month_key": "2023-03",
      "max_case_amount_krw": 101600000,
      "monetary_case_count": 22,
      "surcharge_total_krw": 98000000
    },
    {
      "decision_year": 2023,
      "decision_month": 4,
      "fine_total_krw": 69400000,
      "top_target_name": "제2023-007-068호",
      "amount_total_krw": 118150000,
      "decision_month_key": "2023-04",
      "max_case_amount_krw": 48750000,
      "monetary_case_count": 15,
      "surcharge_total_krw": 48750000
    },
    {
      "decision_year": 2023,
      "decision_month": 5,
      "fine_total_krw": 104600000,
      "top_target_name": "2021조총0037",
      "amount_total_krw": 204350000,
      "decision_month_key": "2023-05",
      "max_case_amount_krw": 81350000,
      "monetary_case_count": 20,
      "surcharge_total_krw": 99750000
    },
    {
      "decision_year": 2023,
      "decision_month": 6,
      "fine_total_krw": 79600000,
      "top_target_name": "제2023-006-056호",
      "amount_total_krw": 2065492000,
      "decision_month_key": "2023-06",
      "max_case_amount_krw": 1141986000,
      "monetary_case_count": 9,
      "surcharge_total_krw": 1985892000
    },
    {
      "decision_year": 2023,
      "decision_month": 7,
      "fine_total_krw": 157000000,
      "top_target_name": "㈜엘지유플러스",
      "amount_total_krw": 7108702000,
      "decision_month_key": "2023-07",
      "max_case_amount_krw": 6827452000,
      "monetary_case_count": 41,
      "surcharge_total_krw": 6951702000
    },
    {
      "decision_year": 2023,
      "decision_month": 10,
      "fine_total_krw": 69300000,
      "top_target_name": "2023조일0035",
      "amount_total_krw": 1267509000,
      "decision_month_key": "2023-10",
      "max_case_amount_krw": 922200000,
      "monetary_case_count": 10,
      "surcharge_total_krw": 1198209000
    },
    {
      "decision_year": 2023,
      "decision_month": 11,
      "fine_total_krw": 7200000,
      "top_target_name": "제2023-018-234호",
      "amount_total_krw": 35950000,
      "decision_month_key": "2023-11",
      "max_case_amount_krw": 16250000,
      "monetary_case_count": 4,
      "surcharge_total_krw": 28750000
    },
    {
      "decision_year": 2023,
      "decision_month": 12,
      "fine_total_krw": 14400000,
      "top_target_name": "㈜스피드옥션",
      "amount_total_krw": 14400000,
      "decision_month_key": "2023-12",
      "max_case_amount_krw": 7800000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2024,
      "decision_month": 1,
      "fine_total_krw": 16800000,
      "top_target_name": "한국장학재단",
      "amount_total_krw": 16800000,
      "decision_month_key": "2024-01",
      "max_case_amount_krw": 8400000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 0
    },
    {
      "decision_year": 2024,
      "decision_month": 2,
      "fine_total_krw": 40200000,
      "top_target_name": "TAG HEUER branch of LVMH Swiss Manufactures SA",
      "amount_total_krw": 166200000,
      "decision_month_key": "2024-02",
      "max_case_amount_krw": 133800000,
      "monetary_case_count": 8,
      "surcharge_total_krw": 126000000
    },
    {
      "decision_year": 2024,
      "decision_month": 3,
      "fine_total_krw": 3300000,
      "top_target_name": "제2024-006-163호",
      "amount_total_krw": 616300000,
      "decision_month_key": "2024-03",
      "max_case_amount_krw": 616300000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 613000000
    },
    {
      "decision_year": 2024,
      "decision_month": 4,
      "fine_total_krw": 49900000,
      "top_target_name": "제2024-007-178호",
      "amount_total_krw": 212331000,
      "decision_month_key": "2024-04",
      "max_case_amount_krw": 91396000,
      "monetary_case_count": 7,
      "surcharge_total_krw": 162431000
    },
    {
      "decision_year": 2024,
      "decision_month": 5,
      "fine_total_krw": 13200000,
      "top_target_name": "㈜카카오",
      "amount_total_krw": 22659160000,
      "decision_month_key": "2024-05",
      "max_case_amount_krw": 15149760000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 22645960000
    },
    {
      "decision_year": 2024,
      "decision_month": 6,
      "fine_total_krw": 15000000,
      "top_target_name": "2023조이0053",
      "amount_total_krw": 82788000,
      "decision_month_key": "2024-06",
      "max_case_amount_krw": 79188000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 67788000
    },
    {
      "decision_year": 2024,
      "decision_month": 7,
      "fine_total_krw": 7800000,
      "top_target_name": "2024조일0013",
      "amount_total_krw": 1985800000,
      "decision_month_key": "2024-07",
      "max_case_amount_krw": 1985800000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 1978000000
    },
    {
      "decision_year": 2024,
      "decision_month": 8,
      "fine_total_krw": 15600000,
      "top_target_name": "2023조이0124#2",
      "amount_total_krw": 18898000,
      "decision_month_key": "2024-08",
      "max_case_amount_krw": 10498000,
      "monetary_case_count": 4,
      "surcharge_total_krw": 3298000
    },
    {
      "decision_year": 2024,
      "decision_month": 9,
      "fine_total_krw": 5400000,
      "top_target_name": "제2024-016-234호",
      "amount_total_krw": 1816400000,
      "decision_month_key": "2024-09",
      "max_case_amount_krw": 725000000,
      "monetary_case_count": 4,
      "surcharge_total_krw": 1811000000
    },
    {
      "decision_year": 2024,
      "decision_month": 10,
      "fine_total_krw": 10800000,
      "top_target_name": "㈜네오팜",
      "amount_total_krw": 133973000,
      "decision_month_key": "2024-10",
      "max_case_amount_krw": 112373000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 123173000
    },
    {
      "decision_year": 2024,
      "decision_month": 11,
      "fine_total_krw": 28200000,
      "top_target_name": "제2024-019-248호",
      "amount_total_krw": 1913342000,
      "decision_month_key": "2024-11",
      "max_case_amount_krw": 1310000000,
      "monetary_case_count": 6,
      "surcharge_total_krw": 1885142000
    },
    {
      "decision_year": 2025,
      "decision_month": 1,
      "fine_total_krw": 16000000,
      "top_target_name": "㈜카카오페이",
      "amount_total_krw": 10531000000,
      "decision_month_key": "2025-01",
      "max_case_amount_krw": 5968000000,
      "monetary_case_count": 5,
      "surcharge_total_krw": 10515000000
    },
    {
      "decision_year": 2025,
      "decision_month": 2,
      "fine_total_krw": 19500000,
      "top_target_name": "㈜섹타나인",
      "amount_total_krw": 1694600000,
      "decision_month_key": "2025-02",
      "max_case_amount_krw": 1484200000,
      "monetary_case_count": 3,
      "surcharge_total_krw": 1675100000
    },
    {
      "decision_year": 2025,
      "decision_month": 3,
      "fine_total_krw": 10200000,
      "top_target_name": "주식회사 우리카드",
      "amount_total_krw": 14208200000,
      "decision_month_key": "2025-03",
      "max_case_amount_krw": 13451000000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 14198000000
    },
    {
      "decision_year": 2025,
      "decision_month": 4,
      "fine_total_krw": 14100000,
      "top_target_name": "㈜클래스유",
      "amount_total_krw": 72615000,
      "decision_month_key": "2025-04",
      "max_case_amount_krw": 60800000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 58515000
    },
    {
      "decision_year": 2025,
      "decision_month": 5,
      "fine_total_krw": 29600000,
      "top_target_name": "Whaleco Technology Limited",
      "amount_total_krw": 1398600000,
      "decision_month_key": "2025-05",
      "max_case_amount_krw": 896600000,
      "monetary_case_count": 3,
      "surcharge_total_krw": 1369000000
    },
    {
      "decision_year": 2025,
      "decision_month": 6,
      "fine_total_krw": 33000000,
      "top_target_name": "전북대학교",
      "amount_total_krw": 1248623000,
      "decision_month_key": "2025-06",
      "max_case_amount_krw": 628400000,
      "monetary_case_count": 6,
      "surcharge_total_krw": 1215623000
    },
    {
      "decision_year": 2025,
      "decision_month": 7,
      "fine_total_krw": 6300000,
      "top_target_name": "㈜비와이엔블랙야크",
      "amount_total_krw": 1955000000,
      "decision_month_key": "2025-07",
      "max_case_amount_krw": 1391000000,
      "monetary_case_count": 5,
      "surcharge_total_krw": 1948700000
    },
    {
      "decision_year": 2025,
      "decision_month": 8,
      "fine_total_krw": 9600000,
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 134800600000,
      "decision_month_key": "2025-08",
      "max_case_amount_krw": 134800600000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 134791000000
    },
    {
      "decision_year": 2025,
      "decision_month": 9,
      "fine_total_krw": 7200000,
      "top_target_name": "㈜몽클레르코리아",
      "amount_total_krw": 88217000,
      "decision_month_key": "2025-09",
      "max_case_amount_krw": 88217000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 81017000
    },
    {
      "decision_year": 2025,
      "decision_month": 10,
      "fine_total_krw": 0,
      "top_target_name": "인크루트(주)",
      "amount_total_krw": 463000000,
      "decision_month_key": "2025-10",
      "max_case_amount_krw": 463000000,
      "monetary_case_count": 1,
      "surcharge_total_krw": 463000000
    },
    {
      "decision_year": 2025,
      "decision_month": 11,
      "fine_total_krw": 13800000,
      "top_target_name": "2024조이0092",
      "amount_total_krw": 669800000,
      "decision_month_key": "2025-11",
      "max_case_amount_krw": 529000000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 656000000
    },
    {
      "decision_year": 2025,
      "decision_month": 12,
      "fine_total_krw": 10800000,
      "top_target_name": "2K Games, Inc",
      "amount_total_krw": 398819000,
      "decision_month_key": "2025-12",
      "max_case_amount_krw": 201719000,
      "monetary_case_count": 3,
      "surcharge_total_krw": 388019000
    },
    {
      "decision_year": 2026,
      "decision_month": 1,
      "fine_total_krw": 9300000,
      "top_target_name": "한국연구재단",
      "amount_total_krw": 721000000,
      "decision_month_key": "2026-01",
      "max_case_amount_krw": 707800000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 711700000
    },
    {
      "decision_year": 2026,
      "decision_month": 3,
      "fine_total_krw": 4800000,
      "top_target_name": "공무원연금공단",
      "amount_total_krw": 914800000,
      "decision_month_key": "2026-03",
      "max_case_amount_krw": 532000000,
      "monetary_case_count": 2,
      "surcharge_total_krw": 910000000
    }
  ],
  "overviewKpis": [
    {
      "data_notes": {
        "law_articles_status": "verified_pending_and_review_separated",
        "year_2026_is_partial": true,
        "monetary_amount_source": "verified_penalty_outcomes",
        "document_chunks_missing": false
      },
      "meetings_total": 126,
      "sanctions_total": 1098,
      "utterances_total": 16287,
      "agenda_items_total": 496,
      "commissioners_total": 21,
      "law_citations_total": 10085,
      "decision_cases_total": 506,
      "decision_posts_total": 152,
      "public_agendas_total": 326,
      "report_agendas_total": 174,
      "document_chunks_total": 9059,
      "private_agendas_total": 170,
      "decision_agendas_total": 320,
      "source_documents_total": 1501,
      "utterances_with_agenda": 14480,
      "linked_agenda_items_total": 145,
      "unspecified_agendas_total": 2,
      "agenda_decision_links_total": 149,
      "linked_decision_posts_total": 145,
      "meetings_without_transcripts": 12,
      "commissioner_speech_tags_total": 22282,
      "law_citations_mcp_pending_total": 0,
      "meetings_with_transcripts_ready": 114,
      "monetary_penalty_outcomes_total": 375,
      "law_citations_mcp_verified_total": 8534,
      "law_citations_needs_review_total": 1493,
      "monetary_penalty_outcomes_amount_total_krw": 280176309000
    }
  ],
  "meetingYearly": [
    {
      "agenda_count": 39,
      "meeting_year": 2020,
      "meeting_count": 9,
      "last_meeting_date": "2020-12-23",
      "first_meeting_date": "2020-08-05",
      "report_agenda_count": 22,
      "decision_agenda_count": 15
    },
    {
      "agenda_count": 68,
      "meeting_year": 2021,
      "meeting_count": 21,
      "last_meeting_date": "2021-12-22",
      "first_meeting_date": "2021-01-13",
      "report_agenda_count": 26,
      "decision_agenda_count": 42
    },
    {
      "agenda_count": 70,
      "meeting_year": 2022,
      "meeting_count": 21,
      "last_meeting_date": "2022-12-28",
      "first_meeting_date": "2022-01-12",
      "report_agenda_count": 19,
      "decision_agenda_count": 51
    },
    {
      "agenda_count": 104,
      "meeting_year": 2023,
      "meeting_count": 21,
      "last_meeting_date": "2023-12-27",
      "first_meeting_date": "2023-01-11",
      "report_agenda_count": 29,
      "decision_agenda_count": 75
    },
    {
      "agenda_count": 84,
      "meeting_year": 2024,
      "meeting_count": 21,
      "last_meeting_date": "2024-12-11",
      "first_meeting_date": "2024-01-10",
      "report_agenda_count": 33,
      "decision_agenda_count": 51
    },
    {
      "agenda_count": 97,
      "meeting_year": 2025,
      "meeting_count": 26,
      "last_meeting_date": "2025-12-10",
      "first_meeting_date": "2025-01-08",
      "report_agenda_count": 31,
      "decision_agenda_count": 66
    },
    {
      "agenda_count": 34,
      "meeting_year": 2026,
      "meeting_count": 7,
      "last_meeting_date": "2026-04-22",
      "first_meeting_date": "2026-01-14",
      "report_agenda_count": 14,
      "decision_agenda_count": 20
    }
  ],
  "issueTagYearly": [
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 1,
      "tag_category": "legal_reasoning",
      "year_tag_max": 377,
      "meeting_count": 9,
      "share_in_year": 0.2098,
      "year_tag_total": 1797,
      "utterance_count": 377,
      "average_confidence": 0.5509,
      "commissioner_count": 10
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 2,
      "tag_category": "remedy_orientation",
      "year_tag_max": 377,
      "meeting_count": 9,
      "share_in_year": 0.1603,
      "year_tag_total": 1797,
      "utterance_count": 288,
      "average_confidence": 0.5678,
      "commissioner_count": 10
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 3,
      "tag_category": "deliberation_style",
      "year_tag_max": 377,
      "meeting_count": 9,
      "share_in_year": 0.1263,
      "year_tag_total": 1797,
      "utterance_count": 227,
      "average_confidence": 0.5444,
      "commissioner_count": 9
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 4,
      "tag_category": "technology_policy",
      "year_tag_max": 377,
      "meeting_count": 8,
      "share_in_year": 0.1191,
      "year_tag_total": 1797,
      "utterance_count": 214,
      "average_confidence": 0.5457,
      "commissioner_count": 10
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 5,
      "tag_category": "sanction_orientation",
      "year_tag_max": 377,
      "meeting_count": 8,
      "share_in_year": 0.1029,
      "year_tag_total": 1797,
      "utterance_count": 185,
      "average_confidence": 0.553,
      "commissioner_count": 9
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 6,
      "tag_category": "sector_focus",
      "year_tag_max": 377,
      "meeting_count": 9,
      "share_in_year": 0.064,
      "year_tag_total": 1797,
      "utterance_count": 115,
      "average_confidence": 0.5683,
      "commissioner_count": 10
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 7,
      "tag_category": "market_context",
      "year_tag_max": 377,
      "meeting_count": 8,
      "share_in_year": 0.0607,
      "year_tag_total": 1797,
      "utterance_count": 109,
      "average_confidence": 0.5417,
      "commissioner_count": 9
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 8,
      "tag_category": "rights_focus",
      "year_tag_max": 377,
      "meeting_count": 9,
      "share_in_year": 0.0607,
      "year_tag_total": 1797,
      "utterance_count": 109,
      "average_confidence": 0.5466,
      "commissioner_count": 9
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 9,
      "tag_category": "international",
      "year_tag_max": 377,
      "meeting_count": 8,
      "share_in_year": 0.0551,
      "year_tag_total": 1797,
      "utterance_count": 99,
      "average_confidence": 0.5462,
      "commissioner_count": 10
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2020,
      "rank_in_year": 10,
      "tag_category": "issue_focus",
      "year_tag_max": 377,
      "meeting_count": 8,
      "share_in_year": 0.0412,
      "year_tag_total": 1797,
      "utterance_count": 74,
      "average_confidence": 0.5473,
      "commissioner_count": 10
    },
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 1,
      "tag_category": "legal_reasoning",
      "year_tag_max": 875,
      "meeting_count": 21,
      "share_in_year": 0.3401,
      "year_tag_total": 2573,
      "utterance_count": 875,
      "average_confidence": 0.55,
      "commissioner_count": 10
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 2,
      "tag_category": "deliberation_style",
      "year_tag_max": 875,
      "meeting_count": 21,
      "share_in_year": 0.1562,
      "year_tag_total": 2573,
      "utterance_count": 402,
      "average_confidence": 0.5513,
      "commissioner_count": 10
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 3,
      "tag_category": "remedy_orientation",
      "year_tag_max": 875,
      "meeting_count": 19,
      "share_in_year": 0.0979,
      "year_tag_total": 2573,
      "utterance_count": 252,
      "average_confidence": 0.5609,
      "commissioner_count": 9
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 4,
      "tag_category": "sanction_orientation",
      "year_tag_max": 875,
      "meeting_count": 21,
      "share_in_year": 0.0913,
      "year_tag_total": 2573,
      "utterance_count": 235,
      "average_confidence": 0.5956,
      "commissioner_count": 10
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 5,
      "tag_category": "issue_focus",
      "year_tag_max": 875,
      "meeting_count": 20,
      "share_in_year": 0.061,
      "year_tag_total": 2573,
      "utterance_count": 157,
      "average_confidence": 0.571,
      "commissioner_count": 10
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 6,
      "tag_category": "market_context",
      "year_tag_max": 875,
      "meeting_count": 19,
      "share_in_year": 0.0602,
      "year_tag_total": 2573,
      "utterance_count": 155,
      "average_confidence": 0.5485,
      "commissioner_count": 10
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 7,
      "tag_category": "rights_focus",
      "year_tag_max": 875,
      "meeting_count": 21,
      "share_in_year": 0.0602,
      "year_tag_total": 2573,
      "utterance_count": 155,
      "average_confidence": 0.5676,
      "commissioner_count": 10
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 8,
      "tag_category": "international",
      "year_tag_max": 875,
      "meeting_count": 21,
      "share_in_year": 0.0501,
      "year_tag_total": 2573,
      "utterance_count": 129,
      "average_confidence": 0.5478,
      "commissioner_count": 9
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 9,
      "tag_category": "sector_focus",
      "year_tag_max": 875,
      "meeting_count": 16,
      "share_in_year": 0.0424,
      "year_tag_total": 2573,
      "utterance_count": 109,
      "average_confidence": 0.583,
      "commissioner_count": 10
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2021,
      "rank_in_year": 10,
      "tag_category": "technology_policy",
      "year_tag_max": 875,
      "meeting_count": 17,
      "share_in_year": 0.0404,
      "year_tag_total": 2573,
      "utterance_count": 104,
      "average_confidence": 0.56,
      "commissioner_count": 9
    },
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 1,
      "tag_category": "legal_reasoning",
      "year_tag_max": 887,
      "meeting_count": 20,
      "share_in_year": 0.3296,
      "year_tag_total": 2691,
      "utterance_count": 887,
      "average_confidence": 0.5522,
      "commissioner_count": 12
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 2,
      "tag_category": "deliberation_style",
      "year_tag_max": 887,
      "meeting_count": 20,
      "share_in_year": 0.1605,
      "year_tag_total": 2691,
      "utterance_count": 432,
      "average_confidence": 0.5484,
      "commissioner_count": 12
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 3,
      "tag_category": "remedy_orientation",
      "year_tag_max": 887,
      "meeting_count": 19,
      "share_in_year": 0.0899,
      "year_tag_total": 2691,
      "utterance_count": 242,
      "average_confidence": 0.5764,
      "commissioner_count": 12
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 4,
      "tag_category": "sanction_orientation",
      "year_tag_max": 887,
      "meeting_count": 19,
      "share_in_year": 0.0784,
      "year_tag_total": 2691,
      "utterance_count": 211,
      "average_confidence": 0.5842,
      "commissioner_count": 12
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 5,
      "tag_category": "rights_focus",
      "year_tag_max": 887,
      "meeting_count": 20,
      "share_in_year": 0.0777,
      "year_tag_total": 2691,
      "utterance_count": 209,
      "average_confidence": 0.5468,
      "commissioner_count": 12
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 6,
      "tag_category": "issue_focus",
      "year_tag_max": 887,
      "meeting_count": 20,
      "share_in_year": 0.0773,
      "year_tag_total": 2691,
      "utterance_count": 208,
      "average_confidence": 0.5683,
      "commissioner_count": 12
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 7,
      "tag_category": "market_context",
      "year_tag_max": 887,
      "meeting_count": 18,
      "share_in_year": 0.065,
      "year_tag_total": 2691,
      "utterance_count": 175,
      "average_confidence": 0.5632,
      "commissioner_count": 12
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 8,
      "tag_category": "technology_policy",
      "year_tag_max": 887,
      "meeting_count": 13,
      "share_in_year": 0.0468,
      "year_tag_total": 2691,
      "utterance_count": 126,
      "average_confidence": 0.5414,
      "commissioner_count": 10
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 9,
      "tag_category": "sector_focus",
      "year_tag_max": 887,
      "meeting_count": 16,
      "share_in_year": 0.0438,
      "year_tag_total": 2691,
      "utterance_count": 118,
      "average_confidence": 0.5686,
      "commissioner_count": 11
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2022,
      "rank_in_year": 10,
      "tag_category": "international",
      "year_tag_max": 887,
      "meeting_count": 14,
      "share_in_year": 0.0308,
      "year_tag_total": 2691,
      "utterance_count": 83,
      "average_confidence": 0.5339,
      "commissioner_count": 10
    },
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 1,
      "tag_category": "legal_reasoning",
      "year_tag_max": 1387,
      "meeting_count": 19,
      "share_in_year": 0.3503,
      "year_tag_total": 3959,
      "utterance_count": 1387,
      "average_confidence": 0.5529,
      "commissioner_count": 16
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 2,
      "tag_category": "deliberation_style",
      "year_tag_max": 1387,
      "meeting_count": 19,
      "share_in_year": 0.1306,
      "year_tag_total": 3959,
      "utterance_count": 517,
      "average_confidence": 0.5528,
      "commissioner_count": 16
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 3,
      "tag_category": "remedy_orientation",
      "year_tag_max": 1387,
      "meeting_count": 19,
      "share_in_year": 0.1031,
      "year_tag_total": 3959,
      "utterance_count": 408,
      "average_confidence": 0.5734,
      "commissioner_count": 16
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 4,
      "tag_category": "sanction_orientation",
      "year_tag_max": 1387,
      "meeting_count": 18,
      "share_in_year": 0.0902,
      "year_tag_total": 3959,
      "utterance_count": 357,
      "average_confidence": 0.5927,
      "commissioner_count": 16
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 5,
      "tag_category": "market_context",
      "year_tag_max": 1387,
      "meeting_count": 19,
      "share_in_year": 0.0818,
      "year_tag_total": 3959,
      "utterance_count": 324,
      "average_confidence": 0.5585,
      "commissioner_count": 16
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 6,
      "tag_category": "issue_focus",
      "year_tag_max": 1387,
      "meeting_count": 19,
      "share_in_year": 0.0725,
      "year_tag_total": 3959,
      "utterance_count": 287,
      "average_confidence": 0.5807,
      "commissioner_count": 15
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 7,
      "tag_category": "sector_focus",
      "year_tag_max": 1387,
      "meeting_count": 16,
      "share_in_year": 0.0677,
      "year_tag_total": 3959,
      "utterance_count": 268,
      "average_confidence": 0.5982,
      "commissioner_count": 16
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 8,
      "tag_category": "rights_focus",
      "year_tag_max": 1387,
      "meeting_count": 19,
      "share_in_year": 0.0604,
      "year_tag_total": 3959,
      "utterance_count": 239,
      "average_confidence": 0.5713,
      "commissioner_count": 15
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 9,
      "tag_category": "international",
      "year_tag_max": 1387,
      "meeting_count": 16,
      "share_in_year": 0.0265,
      "year_tag_total": 3959,
      "utterance_count": 105,
      "average_confidence": 0.5529,
      "commissioner_count": 15
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2023,
      "rank_in_year": 10,
      "tag_category": "technology_policy",
      "year_tag_max": 1387,
      "meeting_count": 14,
      "share_in_year": 0.0169,
      "year_tag_total": 3959,
      "utterance_count": 67,
      "average_confidence": 0.5407,
      "commissioner_count": 13
    },
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 1,
      "tag_category": "legal_reasoning",
      "year_tag_max": 1499,
      "meeting_count": 21,
      "share_in_year": 0.2947,
      "year_tag_total": 5086,
      "utterance_count": 1499,
      "average_confidence": 0.5438,
      "commissioner_count": 10
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 2,
      "tag_category": "market_context",
      "year_tag_max": 1499,
      "meeting_count": 21,
      "share_in_year": 0.1209,
      "year_tag_total": 5086,
      "utterance_count": 615,
      "average_confidence": 0.5419,
      "commissioner_count": 10
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 3,
      "tag_category": "remedy_orientation",
      "year_tag_max": 1499,
      "meeting_count": 21,
      "share_in_year": 0.119,
      "year_tag_total": 5086,
      "utterance_count": 605,
      "average_confidence": 0.5612,
      "commissioner_count": 10
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 4,
      "tag_category": "deliberation_style",
      "year_tag_max": 1499,
      "meeting_count": 21,
      "share_in_year": 0.1113,
      "year_tag_total": 5086,
      "utterance_count": 566,
      "average_confidence": 0.5517,
      "commissioner_count": 10
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 5,
      "tag_category": "technology_policy",
      "year_tag_max": 1499,
      "meeting_count": 19,
      "share_in_year": 0.1091,
      "year_tag_total": 5086,
      "utterance_count": 555,
      "average_confidence": 0.5758,
      "commissioner_count": 10
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 6,
      "tag_category": "issue_focus",
      "year_tag_max": 1499,
      "meeting_count": 20,
      "share_in_year": 0.0641,
      "year_tag_total": 5086,
      "utterance_count": 326,
      "average_confidence": 0.5606,
      "commissioner_count": 10
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 7,
      "tag_category": "sanction_orientation",
      "year_tag_max": 1499,
      "meeting_count": 21,
      "share_in_year": 0.058,
      "year_tag_total": 5086,
      "utterance_count": 295,
      "average_confidence": 0.5737,
      "commissioner_count": 10
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 8,
      "tag_category": "rights_focus",
      "year_tag_max": 1499,
      "meeting_count": 21,
      "share_in_year": 0.0564,
      "year_tag_total": 5086,
      "utterance_count": 287,
      "average_confidence": 0.543,
      "commissioner_count": 9
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 9,
      "tag_category": "sector_focus",
      "year_tag_max": 1499,
      "meeting_count": 19,
      "share_in_year": 0.0466,
      "year_tag_total": 5086,
      "utterance_count": 237,
      "average_confidence": 0.5907,
      "commissioner_count": 10
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2024,
      "rank_in_year": 10,
      "tag_category": "international",
      "year_tag_max": 1499,
      "meeting_count": 15,
      "share_in_year": 0.0199,
      "year_tag_total": 5086,
      "utterance_count": 101,
      "average_confidence": 0.5506,
      "commissioner_count": 8
    },
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 1,
      "tag_category": "legal_reasoning",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.3633,
      "year_tag_total": 4836,
      "utterance_count": 1757,
      "average_confidence": 0.5433,
      "commissioner_count": 11
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 2,
      "tag_category": "remedy_orientation",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.1139,
      "year_tag_total": 4836,
      "utterance_count": 551,
      "average_confidence": 0.554,
      "commissioner_count": 11
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 3,
      "tag_category": "deliberation_style",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.1106,
      "year_tag_total": 4836,
      "utterance_count": 535,
      "average_confidence": 0.5506,
      "commissioner_count": 11
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 4,
      "tag_category": "market_context",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.0809,
      "year_tag_total": 4836,
      "utterance_count": 391,
      "average_confidence": 0.5447,
      "commissioner_count": 11
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 5,
      "tag_category": "issue_focus",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.0749,
      "year_tag_total": 4836,
      "utterance_count": 362,
      "average_confidence": 0.5629,
      "commissioner_count": 11
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 6,
      "tag_category": "sector_focus",
      "year_tag_max": 1757,
      "meeting_count": 18,
      "share_in_year": 0.0715,
      "year_tag_total": 4836,
      "utterance_count": 346,
      "average_confidence": 0.5811,
      "commissioner_count": 11
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 7,
      "tag_category": "technology_policy",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.0587,
      "year_tag_total": 4836,
      "utterance_count": 284,
      "average_confidence": 0.5523,
      "commissioner_count": 11
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 8,
      "tag_category": "sanction_orientation",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.0556,
      "year_tag_total": 4836,
      "utterance_count": 269,
      "average_confidence": 0.5644,
      "commissioner_count": 11
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 9,
      "tag_category": "rights_focus",
      "year_tag_max": 1757,
      "meeting_count": 19,
      "share_in_year": 0.0471,
      "year_tag_total": 4836,
      "utterance_count": 228,
      "average_confidence": 0.5514,
      "commissioner_count": 11
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2025,
      "rank_in_year": 10,
      "tag_category": "international",
      "year_tag_max": 1757,
      "meeting_count": 18,
      "share_in_year": 0.0234,
      "year_tag_total": 4836,
      "utterance_count": 113,
      "average_confidence": 0.5684,
      "commissioner_count": 10
    },
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 1,
      "tag_category": "legal_reasoning",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.359,
      "year_tag_total": 1340,
      "utterance_count": 481,
      "average_confidence": 0.5484,
      "commissioner_count": 9
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 2,
      "tag_category": "market_context",
      "year_tag_max": 481,
      "meeting_count": 4,
      "share_in_year": 0.1142,
      "year_tag_total": 1340,
      "utterance_count": 153,
      "average_confidence": 0.5446,
      "commissioner_count": 9
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 3,
      "tag_category": "deliberation_style",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.1104,
      "year_tag_total": 1340,
      "utterance_count": 148,
      "average_confidence": 0.5511,
      "commissioner_count": 9
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 4,
      "tag_category": "issue_focus",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.0933,
      "year_tag_total": 1340,
      "utterance_count": 125,
      "average_confidence": 0.5724,
      "commissioner_count": 9
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 5,
      "tag_category": "technology_policy",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.0858,
      "year_tag_total": 1340,
      "utterance_count": 115,
      "average_confidence": 0.5564,
      "commissioner_count": 9
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 6,
      "tag_category": "sector_focus",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.0701,
      "year_tag_total": 1340,
      "utterance_count": 94,
      "average_confidence": 0.5995,
      "commissioner_count": 9
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 7,
      "tag_category": "sanction_orientation",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.0672,
      "year_tag_total": 1340,
      "utterance_count": 90,
      "average_confidence": 0.5667,
      "commissioner_count": 9
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 8,
      "tag_category": "rights_focus",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.0463,
      "year_tag_total": 1340,
      "utterance_count": 62,
      "average_confidence": 0.5403,
      "commissioner_count": 9
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 9,
      "tag_category": "remedy_orientation",
      "year_tag_max": 481,
      "meeting_count": 5,
      "share_in_year": 0.0403,
      "year_tag_total": 1340,
      "utterance_count": 54,
      "average_confidence": 0.5689,
      "commissioner_count": 9
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "meeting_year": 2026,
      "rank_in_year": 10,
      "tag_category": "international",
      "year_tag_max": 481,
      "meeting_count": 4,
      "share_in_year": 0.0134,
      "year_tag_total": 1340,
      "utterance_count": 18,
      "average_confidence": 0.5433,
      "commissioner_count": 8
    }
  ],
  "moneyByArticle": [
    {
      "law_name": "개인정보 보호법",
      "article_no": "제29조",
      "case_count": 226,
      "top_case_no": "2025조이0056",
      "article_title": "안전조치의무",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 196617253000,
      "max_case_amount_krw": 134800600000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제30조",
      "case_count": 171,
      "top_case_no": "2025조이0056",
      "article_title": "개인정보 처리방침의 수립 및 공개",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 169906106000,
      "max_case_amount_krw": 134800600000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제26조",
      "case_count": 55,
      "top_case_no": "2025조이0056",
      "article_title": "업무위탁에 따른 개인정보의 처리 제한",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 161485399000,
      "max_case_amount_krw": 134800600000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제34조",
      "case_count": 37,
      "top_case_no": "2025조이0056",
      "article_title": "개인정보 유출 등의 통지ㆍ신고",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 141064588000,
      "max_case_amount_krw": 134800600000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제31조",
      "case_count": 2,
      "top_case_no": "2025조이0056",
      "article_title": "개인정보 보호책임자의 지정 등",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 135666706000,
      "max_case_amount_krw": 134800600000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제17조",
      "case_count": 23,
      "top_case_no": "2021조일0028",
      "article_title": "개인정보의 제공",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조일0028)",
      "top_target_name": "구글",
      "amount_total_krw": 95096296000,
      "max_case_amount_krw": 69241000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제24조의2",
      "case_count": 35,
      "top_case_no": "2021조일0028",
      "article_title": "주민등록번호 처리의 제한",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조일0028)",
      "top_target_name": "구글",
      "amount_total_krw": 94985146000,
      "max_case_amount_krw": 69241000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제15조",
      "case_count": 28,
      "top_case_no": "2021조일0028",
      "article_title": "개인정보의 수집ㆍ이용",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조일0028)",
      "top_target_name": "구글",
      "amount_total_krw": 91020696000,
      "max_case_amount_krw": 69241000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제39조의3",
      "case_count": 13,
      "top_case_no": "2021조일0028",
      "article_title": "개인정보의 수집ㆍ이용 동의 등에 대한 특례",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조일0028)",
      "top_target_name": "구글",
      "amount_total_krw": 70606906000,
      "max_case_amount_krw": 69241000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제22조",
      "case_count": 15,
      "top_case_no": "2021조일0028",
      "article_title": "동의를 받는 방법",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조일0028)",
      "top_target_name": "구글",
      "amount_total_krw": 69327400000,
      "max_case_amount_krw": 69241000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제24조",
      "case_count": 163,
      "top_case_no": "2023조이0023",
      "article_title": "고유식별정보의 처리 제한",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "top_target_name": "㈜카카오",
      "amount_total_krw": 38649103000,
      "max_case_amount_krw": 15149760000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제23조",
      "case_count": 135,
      "top_case_no": "2023조이0023",
      "article_title": "민감정보의 처리 제한",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "top_target_name": "㈜카카오",
      "amount_total_krw": 28690959000,
      "max_case_amount_krw": 15149760000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제25조",
      "case_count": 145,
      "top_case_no": "2023조이0023",
      "article_title": "영상정보처리기기의 설치ㆍ운영 제한",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "top_target_name": "㈜카카오",
      "amount_total_krw": 27110653000,
      "max_case_amount_krw": 15149760000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제39조의4",
      "case_count": 41,
      "top_case_no": "2023조이0023",
      "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "top_target_name": "㈜카카오",
      "amount_total_krw": 25920603000,
      "max_case_amount_krw": 15149760000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제28조의8",
      "case_count": 7,
      "top_case_no": "2024조일0034#2",
      "article_title": "개인정보의 국외 이전",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0034)",
      "top_target_name": "주식회사 우리카드",
      "amount_total_krw": 25812600000,
      "max_case_amount_krw": 13451000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제32조의2",
      "case_count": 6,
      "top_case_no": "2023조이0023",
      "article_title": "개인정보 보호 인증",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "top_target_name": "㈜카카오",
      "amount_total_krw": 25479575000,
      "max_case_amount_krw": 15149760000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제18조",
      "case_count": 120,
      "top_case_no": "2024조일0034#2",
      "article_title": "개인정보의 목적 외 이용ㆍ제공 제한",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0034)",
      "top_target_name": "주식회사 우리카드",
      "amount_total_krw": 22011675000,
      "max_case_amount_krw": 13451000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제28조의4",
      "case_count": 119,
      "top_case_no": "2023조이0023",
      "article_title": "가명정보에 대한 안전조치의무 등",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "top_target_name": "㈜카카오",
      "amount_total_krw": 20020911000,
      "max_case_amount_krw": 15149760000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제21조",
      "case_count": 37,
      "top_case_no": "2023조일0116",
      "article_title": "개인정보의 파기",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조일0116)",
      "top_target_name": "㈜골프존",
      "amount_total_krw": 19806116000,
      "max_case_amount_krw": 7509400000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제71조",
      "case_count": 3,
      "top_case_no": "2024조일0034#2",
      "article_title": "벌칙",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0034)",
      "top_target_name": "주식회사 우리카드",
      "amount_total_krw": 13823390000,
      "max_case_amount_krw": 13451000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제59조",
      "case_count": 2,
      "top_case_no": "2024조일0034#2",
      "article_title": "금지행위",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0034)",
      "top_target_name": "주식회사 우리카드",
      "amount_total_krw": 13675000000,
      "max_case_amount_krw": 13451000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제61조",
      "case_count": 58,
      "top_case_no": "2024조일0013",
      "article_title": "의견제시 및 개선권고",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0013)",
      "top_target_name": "피심인 미식별",
      "amount_total_krw": 9838701000,
      "max_case_amount_krw": 1985800000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제28조",
      "case_count": 43,
      "top_case_no": "2023조이0003",
      "article_title": "개인정보취급자에 대한 감독",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0003)",
      "top_target_name": "㈜엘지유플러스",
      "amount_total_krw": 9271138000,
      "max_case_amount_krw": 6827452000
    },
    {
      "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
      "article_no": "제17조",
      "case_count": 2,
      "top_case_no": "제2025-001-002호",
      "article_title": null,
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "top_target_name": "㈜카카오페이",
      "amount_total_krw": 8375200000,
      "max_case_amount_krw": 5968000000
    },
    {
      "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
      "article_no": "제18조",
      "case_count": 2,
      "top_case_no": "제2025-001-002호",
      "article_title": null,
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "top_target_name": "㈜카카오페이",
      "amount_total_krw": 8375200000,
      "max_case_amount_krw": 5968000000
    },
    {
      "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
      "article_no": "제28조의8제1항제1호",
      "case_count": 2,
      "top_case_no": "제2025-001-002호",
      "article_title": null,
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "top_target_name": "㈜카카오페이",
      "amount_total_krw": 8375200000,
      "max_case_amount_krw": 5968000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제39조의6",
      "case_count": 16,
      "top_case_no": "2023조이0003",
      "article_title": "개인정보의 파기에 대한 특례",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0003)",
      "top_target_name": "㈜엘지유플러스",
      "amount_total_krw": 8279916000,
      "max_case_amount_krw": 6827452000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제39조의14",
      "case_count": 19,
      "top_case_no": "2023조이0003",
      "article_title": "방송사업자등에 대한 특례",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0003)",
      "top_target_name": "㈜엘지유플러스",
      "amount_total_krw": 7112642000,
      "max_case_amount_krw": 6827452000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제32조",
      "case_count": 5,
      "top_case_no": "제2025-001-002호",
      "article_title": "개인정보파일의 등록 및 공개",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "top_target_name": "㈜카카오페이",
      "amount_total_krw": 6939706000,
      "max_case_amount_krw": 5968000000
    },
    {
      "law_name": "개인정보 보호법",
      "article_no": "제48조의2",
      "case_count": 1,
      "top_case_no": "2023조이0003",
      "article_title": null,
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0003)",
      "top_target_name": "㈜엘지유플러스",
      "amount_total_krw": 6827452000,
      "max_case_amount_krw": 6827452000
    }
  ],
  "targetRankings": [
    {
      "target_name": "에스케이텔레콤 주식회사",
      "top_case_no": "2025조이0056",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "amount_total_krw": 134800600000,
      "top_decision_date": "2025-08-27",
      "max_case_amount_krw": 134800600000,
      "monetary_case_count": 1
    },
    {
      "target_name": "구글",
      "top_case_no": "2021조일0028",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조일0028)",
      "amount_total_krw": 69241000000,
      "top_decision_date": "2022-09-14",
      "max_case_amount_krw": 69241000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜카카오",
      "top_case_no": "2023조이0023",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "amount_total_krw": 15149760000,
      "top_decision_date": "2024-05-22",
      "max_case_amount_krw": 15149760000,
      "monetary_case_count": 1
    },
    {
      "target_name": "주식회사 우리카드",
      "top_case_no": "2024조일0034#2",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0034)",
      "amount_total_krw": 13451000000,
      "top_decision_date": "2025-03-26",
      "max_case_amount_krw": 13451000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜골프존",
      "top_case_no": "2023조일0116",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조일0116)",
      "amount_total_krw": 7509400000,
      "top_decision_date": "2024-05-08",
      "max_case_amount_krw": 7509400000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜엘지유플러스",
      "top_case_no": "2023조이0003",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0003)",
      "amount_total_krw": 6827452000,
      "top_decision_date": "2023-07-12",
      "max_case_amount_krw": 6827452000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜카카오페이",
      "top_case_no": "제2025-001-002호",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "amount_total_krw": 5968000000,
      "top_decision_date": "2025-01-22",
      "max_case_amount_krw": 5968000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "Apple Distribution International Limited",
      "top_case_no": "제2025-001-003호",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "amount_total_krw": 2407200000,
      "top_decision_date": "2025-01-22",
      "max_case_amount_krw": 2407200000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜섹타나인",
      "top_case_no": "2023조이0062",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0062, 2023조이0131)",
      "amount_total_krw": 1484200000,
      "top_decision_date": "2025-02-12",
      "max_case_amount_krw": 1484200000,
      "monetary_case_count": 1
    },
    {
      "target_name": "에스케이스토아㈜",
      "top_case_no": "제2024-011-187호",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0130 등 2건)",
      "amount_total_krw": 1435000000,
      "top_decision_date": "2025-01-22",
      "max_case_amount_krw": 1435000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜비와이엔블랙야크",
      "top_case_no": "제2025-015-229호",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0032, 2024조이0090)",
      "amount_total_krw": 1391000000,
      "top_decision_date": "2025-07-09",
      "max_case_amount_krw": 1391000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "공무원연금공단",
      "top_case_no": "제2025-026-305호",
      "target_group": "공공",
      "target_source": "entity",
      "top_case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조총0042, 2024조총0025)",
      "amount_total_krw": 914800000,
      "top_decision_date": "2026-03-25",
      "max_case_amount_krw": 532000000,
      "monetary_case_count": 2
    },
    {
      "target_name": "Whaleco Technology Limited",
      "top_case_no": "2024조일0013",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0013, 2025조일0025)",
      "amount_total_krw": 896600000,
      "top_decision_date": "2025-05-14",
      "max_case_amount_krw": 896600000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜자비스앤빌런즈",
      "top_case_no": "2022조이0028",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2022조이0028)",
      "amount_total_krw": 866106000,
      "top_decision_date": "2023-06-28",
      "max_case_amount_krw": 866106000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜모두투어네트워크",
      "top_case_no": "2024조이0079",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조이0079)",
      "amount_total_krw": 757200000,
      "top_decision_date": "2025-03-12",
      "max_case_amount_krw": 757200000,
      "monetary_case_count": 1
    },
    {
      "target_name": "한국사회복지협의회",
      "top_case_no": "2024조총0003#2",
      "target_group": "공공",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0003, 2023조이0078)",
      "amount_total_krw": 712400000,
      "top_decision_date": "2024-09-25",
      "max_case_amount_krw": 488400000,
      "monetary_case_count": 2
    },
    {
      "target_name": "한국연구재단",
      "top_case_no": "2025조총0045",
      "target_group": "공공",
      "target_source": "entity",
      "top_case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조총0045)",
      "amount_total_krw": 707800000,
      "top_decision_date": "2026-01-28",
      "max_case_amount_krw": 707800000,
      "monetary_case_count": 1
    },
    {
      "target_name": "전북대학교",
      "top_case_no": "제2025-013-040호",
      "target_group": "공공",
      "target_source": "entity",
      "top_case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0059, 0067)",
      "amount_total_krw": 628400000,
      "top_decision_date": "2025-06-11",
      "max_case_amount_krw": 628400000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜동행복권",
      "top_case_no": "제2025-002-005호",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0130 등 2건)",
      "amount_total_krw": 507800000,
      "top_decision_date": "2025-01-22",
      "max_case_amount_krw": 507800000,
      "monetary_case_count": 1
    },
    {
      "target_name": "Elementary Innovation Pte. Ltd",
      "top_case_no": "2025조일0025",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0013, 2025조일0025)",
      "amount_total_krw": 490000000,
      "top_decision_date": "2025-05-14",
      "max_case_amount_krw": 490000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "인크루트(주)",
      "top_case_no": "2025조이0034",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0034)",
      "amount_total_krw": 463000000,
      "top_decision_date": "2025-10-22",
      "max_case_amount_krw": 463000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜해성디에스",
      "top_case_no": "2024조일0043#3",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0043, 2023조총0051)",
      "amount_total_krw": 343000000,
      "top_decision_date": "2025-07-23",
      "max_case_amount_krw": 343000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "이화여자대학교",
      "top_case_no": "제2025-013-041호",
      "target_group": "공공",
      "target_source": "entity",
      "top_case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0059, 0067)",
      "amount_total_krw": 343000000,
      "top_decision_date": "2025-06-11",
      "max_case_amount_krw": 343000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "넷플릭스",
      "top_case_no": "2021조일0035",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건 (2021조일0033 등 3건)",
      "amount_total_krw": 227200000,
      "top_decision_date": "2021-08-25",
      "max_case_amount_krw": 227200000,
      "monetary_case_count": 1
    },
    {
      "target_name": "법원행정처",
      "top_case_no": "2023조총0053",
      "target_group": "공공",
      "target_source": "entity",
      "top_case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조총0053)",
      "amount_total_krw": 213000000,
      "top_decision_date": "2025-01-08",
      "max_case_amount_krw": 213000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "2K Games, Inc",
      "top_case_no": "2023조일0033",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0009 등 3건)",
      "amount_total_krw": 201719000,
      "top_decision_date": "2025-12-10",
      "max_case_amount_krw": 201719000,
      "monetary_case_count": 1
    },
    {
      "target_name": "주식회사 와이엘랜드",
      "top_case_no": "제2023-017-232호",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "정보통신서비스 제공자의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0020 등 3건)",
      "amount_total_krw": 161187000,
      "top_decision_date": "2023-10-25",
      "max_case_amount_krw": 161187000,
      "monetary_case_count": 1
    },
    {
      "target_name": "트리플콤마(주)",
      "top_case_no": "2021조이0152",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조이0152)",
      "amount_total_krw": 148390000,
      "top_decision_date": "2022-02-23",
      "max_case_amount_krw": 148390000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜하스",
      "top_case_no": "2024조이0080",
      "target_group": "민간기업",
      "target_source": "source_text",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조이0080 등 2건)",
      "amount_total_krw": 140800000,
      "top_decision_date": "2025-11-26",
      "max_case_amount_krw": 140800000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜비즈니스온커뮤니케이션",
      "top_case_no": "제2025-004-014호",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0128, 2023조삼0046)",
      "amount_total_krw": 139700000,
      "top_decision_date": "2025-02-26",
      "max_case_amount_krw": 139700000,
      "monetary_case_count": 1
    },
    {
      "target_name": "TAG HEUER branch of LVMH Swiss Manufactures SA",
      "top_case_no": "2023조일0051",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조일0051)",
      "amount_total_krw": 133800000,
      "top_decision_date": "2024-02-14",
      "max_case_amount_krw": 133800000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜네오팜",
      "top_case_no": "제2024-017-239호",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조이0011, 2024조이0008)",
      "amount_total_krw": 112373000,
      "top_decision_date": "2024-10-23",
      "max_case_amount_krw": 112373000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜스타일쉐어",
      "top_case_no": "2021조이0038#2",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조이0038 등 4건)",
      "amount_total_krw": 110700000,
      "top_decision_date": "2021-09-29",
      "max_case_amount_krw": 110700000,
      "monetary_case_count": 1
    },
    {
      "target_name": "해성디에스",
      "top_case_no": "제2025-016-235호",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0043, 2023조총0051)",
      "amount_total_krw": 101600000,
      "top_decision_date": "2025-07-23",
      "max_case_amount_krw": 101600000,
      "monetary_case_count": 1
    },
    {
      "target_name": "(사)부산국제금융진흥원",
      "top_case_no": "제2025-026-307호",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0009 등 3건)",
      "amount_total_krw": 99100000,
      "top_decision_date": "2025-12-10",
      "max_case_amount_krw": 99100000,
      "monetary_case_count": 1
    },
    {
      "target_name": "국립항공박물관",
      "top_case_no": "제2025-026-306호",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0009 등 3건)",
      "amount_total_krw": 98000000,
      "top_decision_date": "2025-12-10",
      "max_case_amount_krw": 98000000,
      "monetary_case_count": 1
    },
    {
      "target_name": "Qookka Entertainment Limited",
      "top_case_no": "2025조일0005",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조일0005, 0027)",
      "amount_total_krw": 93700000,
      "top_decision_date": "2025-07-23",
      "max_case_amount_krw": 93700000,
      "monetary_case_count": 1
    },
    {
      "target_name": "TELUS International AI, Ltd",
      "top_case_no": "2024조일0027",
      "target_group": "기타/미분류",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조일0021, 2024조일0027)",
      "amount_total_krw": 89200000,
      "top_decision_date": "2025-06-25",
      "max_case_amount_krw": 89200000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜몽클레르코리아",
      "top_case_no": "2023조일0007",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조일0007)",
      "amount_total_krw": 88217000,
      "top_decision_date": "2025-09-10",
      "max_case_amount_krw": 88217000,
      "monetary_case_count": 1
    },
    {
      "target_name": "㈜야놀자",
      "top_case_no": "2021조이0038#1",
      "target_group": "민간기업",
      "target_source": "entity",
      "top_case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조이0038 등 4건)",
      "amount_total_krw": 86900000,
      "top_decision_date": "2021-09-29",
      "max_case_amount_krw": 86900000,
      "monetary_case_count": 1
    }
  ],
  "meetingYearMonth": [
    {
      "agenda_count": 9,
      "meeting_year": 2020,
      "meeting_count": 2,
      "meeting_month": 8,
      "last_meeting_date": "2020-08-26",
      "meeting_month_key": "2020-08",
      "first_meeting_date": "2020-08-05",
      "report_agenda_count": 5,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 7,
      "meeting_year": 2020,
      "meeting_count": 2,
      "meeting_month": 9,
      "last_meeting_date": "2020-09-23",
      "meeting_month_key": "2020-09",
      "first_meeting_date": "2020-09-09",
      "report_agenda_count": 6,
      "decision_agenda_count": 1
    },
    {
      "agenda_count": 3,
      "meeting_year": 2020,
      "meeting_count": 1,
      "meeting_month": 10,
      "last_meeting_date": "2020-10-28",
      "meeting_month_key": "2020-10",
      "first_meeting_date": "2020-10-28",
      "report_agenda_count": 3,
      "decision_agenda_count": 0
    },
    {
      "agenda_count": 10,
      "meeting_year": 2020,
      "meeting_count": 2,
      "meeting_month": 11,
      "last_meeting_date": "2020-11-25",
      "meeting_month_key": "2020-11",
      "first_meeting_date": "2020-11-18",
      "report_agenda_count": 4,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 10,
      "meeting_year": 2020,
      "meeting_count": 2,
      "meeting_month": 12,
      "last_meeting_date": "2020-12-23",
      "meeting_month_key": "2020-12",
      "first_meeting_date": "2020-12-09",
      "report_agenda_count": 4,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 8,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 1,
      "last_meeting_date": "2021-01-27",
      "meeting_month_key": "2021-01",
      "first_meeting_date": "2021-01-13",
      "report_agenda_count": 1,
      "decision_agenda_count": 7
    },
    {
      "agenda_count": 2,
      "meeting_year": 2021,
      "meeting_count": 1,
      "meeting_month": 2,
      "last_meeting_date": "2021-02-24",
      "meeting_month_key": "2021-02",
      "first_meeting_date": "2021-02-24",
      "report_agenda_count": 1,
      "decision_agenda_count": 1
    },
    {
      "agenda_count": 4,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 3,
      "last_meeting_date": "2021-03-24",
      "meeting_month_key": "2021-03",
      "first_meeting_date": "2021-03-10",
      "report_agenda_count": 2,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 7,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 4,
      "last_meeting_date": "2021-04-28",
      "meeting_month_key": "2021-04",
      "first_meeting_date": "2021-04-14",
      "report_agenda_count": 3,
      "decision_agenda_count": 4
    },
    {
      "agenda_count": 5,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 5,
      "last_meeting_date": "2021-05-26",
      "meeting_month_key": "2021-05",
      "first_meeting_date": "2021-05-12",
      "report_agenda_count": 2,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 6,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 6,
      "last_meeting_date": "2021-06-23",
      "meeting_month_key": "2021-06",
      "first_meeting_date": "2021-06-09",
      "report_agenda_count": 4,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 6,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 7,
      "last_meeting_date": "2021-07-28",
      "meeting_month_key": "2021-07",
      "first_meeting_date": "2021-07-14",
      "report_agenda_count": 3,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 4,
      "meeting_year": 2021,
      "meeting_count": 1,
      "meeting_month": 8,
      "last_meeting_date": "2021-08-25",
      "meeting_month_key": "2021-08",
      "first_meeting_date": "2021-08-25",
      "report_agenda_count": 2,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 9,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 9,
      "last_meeting_date": "2021-09-29",
      "meeting_month_key": "2021-09",
      "first_meeting_date": "2021-09-08",
      "report_agenda_count": 1,
      "decision_agenda_count": 8
    },
    {
      "agenda_count": 2,
      "meeting_year": 2021,
      "meeting_count": 1,
      "meeting_month": 10,
      "last_meeting_date": "2021-10-27",
      "meeting_month_key": "2021-10",
      "first_meeting_date": "2021-10-27",
      "report_agenda_count": 0,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 8,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 11,
      "last_meeting_date": "2021-11-24",
      "meeting_month_key": "2021-11",
      "first_meeting_date": "2021-11-10",
      "report_agenda_count": 3,
      "decision_agenda_count": 5
    },
    {
      "agenda_count": 7,
      "meeting_year": 2021,
      "meeting_count": 2,
      "meeting_month": 12,
      "last_meeting_date": "2021-12-22",
      "meeting_month_key": "2021-12",
      "first_meeting_date": "2021-12-08",
      "report_agenda_count": 4,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 6,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 1,
      "last_meeting_date": "2022-01-26",
      "meeting_month_key": "2022-01",
      "first_meeting_date": "2022-01-12",
      "report_agenda_count": 2,
      "decision_agenda_count": 4
    },
    {
      "agenda_count": 8,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 2,
      "last_meeting_date": "2022-02-23",
      "meeting_month_key": "2022-02",
      "first_meeting_date": "2022-02-09",
      "report_agenda_count": 5,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 2,
      "meeting_year": 2022,
      "meeting_count": 1,
      "meeting_month": 3,
      "last_meeting_date": "2022-03-23",
      "meeting_month_key": "2022-03",
      "first_meeting_date": "2022-03-23",
      "report_agenda_count": 0,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 8,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 4,
      "last_meeting_date": "2022-04-27",
      "meeting_month_key": "2022-04",
      "first_meeting_date": "2022-04-13",
      "report_agenda_count": 2,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 5,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 5,
      "last_meeting_date": "2022-05-25",
      "meeting_month_key": "2022-05",
      "first_meeting_date": "2022-05-11",
      "report_agenda_count": 1,
      "decision_agenda_count": 4
    },
    {
      "agenda_count": 5,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 6,
      "last_meeting_date": "2022-06-22",
      "meeting_month_key": "2022-06",
      "first_meeting_date": "2022-06-08",
      "report_agenda_count": 2,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 5,
      "meeting_year": 2022,
      "meeting_count": 1,
      "meeting_month": 7,
      "last_meeting_date": "2022-07-13",
      "meeting_month_key": "2022-07",
      "first_meeting_date": "2022-07-13",
      "report_agenda_count": 0,
      "decision_agenda_count": 5
    },
    {
      "agenda_count": 8,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 8,
      "last_meeting_date": "2022-08-31",
      "meeting_month_key": "2022-08",
      "first_meeting_date": "2022-08-10",
      "report_agenda_count": 2,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 7,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 9,
      "last_meeting_date": "2022-09-28",
      "meeting_month_key": "2022-09",
      "first_meeting_date": "2022-09-14",
      "report_agenda_count": 1,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 2,
      "meeting_year": 2022,
      "meeting_count": 1,
      "meeting_month": 10,
      "last_meeting_date": "2022-10-19",
      "meeting_month_key": "2022-10",
      "first_meeting_date": "2022-10-19",
      "report_agenda_count": 1,
      "decision_agenda_count": 1
    },
    {
      "agenda_count": 6,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 11,
      "last_meeting_date": "2022-11-30",
      "meeting_month_key": "2022-11",
      "first_meeting_date": "2022-11-16",
      "report_agenda_count": 1,
      "decision_agenda_count": 5
    },
    {
      "agenda_count": 8,
      "meeting_year": 2022,
      "meeting_count": 2,
      "meeting_month": 12,
      "last_meeting_date": "2022-12-28",
      "meeting_month_key": "2022-12",
      "first_meeting_date": "2022-12-14",
      "report_agenda_count": 2,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 4,
      "meeting_year": 2023,
      "meeting_count": 1,
      "meeting_month": 1,
      "last_meeting_date": "2023-01-11",
      "meeting_month_key": "2023-01",
      "first_meeting_date": "2023-01-11",
      "report_agenda_count": 3,
      "decision_agenda_count": 1
    },
    {
      "agenda_count": 6,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 2,
      "last_meeting_date": "2023-02-22",
      "meeting_month_key": "2023-02",
      "first_meeting_date": "2023-02-08",
      "report_agenda_count": 0,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 7,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 3,
      "last_meeting_date": "2023-03-22",
      "meeting_month_key": "2023-03",
      "first_meeting_date": "2023-03-08",
      "report_agenda_count": 1,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 8,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 4,
      "last_meeting_date": "2023-04-26",
      "meeting_month_key": "2023-04",
      "first_meeting_date": "2023-04-12",
      "report_agenda_count": 4,
      "decision_agenda_count": 4
    },
    {
      "agenda_count": 9,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 5,
      "last_meeting_date": "2023-05-24",
      "meeting_month_key": "2023-05",
      "first_meeting_date": "2023-05-10",
      "report_agenda_count": 3,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 13,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 6,
      "last_meeting_date": "2023-06-28",
      "meeting_month_key": "2023-06",
      "first_meeting_date": "2023-06-14",
      "report_agenda_count": 6,
      "decision_agenda_count": 7
    },
    {
      "agenda_count": 12,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 7,
      "last_meeting_date": "2023-07-26",
      "meeting_month_key": "2023-07",
      "first_meeting_date": "2023-07-12",
      "report_agenda_count": 3,
      "decision_agenda_count": 9
    },
    {
      "agenda_count": 15,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 9,
      "last_meeting_date": "2023-09-19",
      "meeting_month_key": "2023-09",
      "first_meeting_date": "2023-09-11",
      "report_agenda_count": 1,
      "decision_agenda_count": 14
    },
    {
      "agenda_count": 12,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 10,
      "last_meeting_date": "2023-10-25",
      "meeting_month_key": "2023-10",
      "first_meeting_date": "2023-10-11",
      "report_agenda_count": 1,
      "decision_agenda_count": 11
    },
    {
      "agenda_count": 9,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 11,
      "last_meeting_date": "2023-11-22",
      "meeting_month_key": "2023-11",
      "first_meeting_date": "2023-11-08",
      "report_agenda_count": 4,
      "decision_agenda_count": 5
    },
    {
      "agenda_count": 9,
      "meeting_year": 2023,
      "meeting_count": 2,
      "meeting_month": 12,
      "last_meeting_date": "2023-12-27",
      "meeting_month_key": "2023-12",
      "first_meeting_date": "2023-12-13",
      "report_agenda_count": 3,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 11,
      "meeting_year": 2024,
      "meeting_count": 2,
      "meeting_month": 1,
      "last_meeting_date": "2024-01-24",
      "meeting_month_key": "2024-01",
      "first_meeting_date": "2024-01-10",
      "report_agenda_count": 4,
      "decision_agenda_count": 7
    },
    {
      "agenda_count": 10,
      "meeting_year": 2024,
      "meeting_count": 2,
      "meeting_month": 2,
      "last_meeting_date": "2024-02-28",
      "meeting_month_key": "2024-02",
      "first_meeting_date": "2024-02-14",
      "report_agenda_count": 4,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 13,
      "meeting_year": 2024,
      "meeting_count": 2,
      "meeting_month": 3,
      "last_meeting_date": "2024-03-27",
      "meeting_month_key": "2024-03",
      "first_meeting_date": "2024-03-13",
      "report_agenda_count": 5,
      "decision_agenda_count": 8
    },
    {
      "agenda_count": 4,
      "meeting_year": 2024,
      "meeting_count": 1,
      "meeting_month": 4,
      "last_meeting_date": "2024-04-24",
      "meeting_month_key": "2024-04",
      "first_meeting_date": "2024-04-24",
      "report_agenda_count": 2,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 4,
      "meeting_year": 2024,
      "meeting_count": 2,
      "meeting_month": 5,
      "last_meeting_date": "2024-05-22",
      "meeting_month_key": "2024-05",
      "first_meeting_date": "2024-05-08",
      "report_agenda_count": 2,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 7,
      "meeting_year": 2024,
      "meeting_count": 2,
      "meeting_month": 6,
      "last_meeting_date": "2024-06-26",
      "meeting_month_key": "2024-06",
      "first_meeting_date": "2024-06-12",
      "report_agenda_count": 1,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 2,
      "meeting_year": 2024,
      "meeting_count": 2,
      "meeting_month": 7,
      "last_meeting_date": "2024-07-24",
      "meeting_month_key": "2024-07",
      "first_meeting_date": "2024-07-10",
      "report_agenda_count": 0,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 3,
      "meeting_year": 2024,
      "meeting_count": 1,
      "meeting_month": 8,
      "last_meeting_date": "2024-08-28",
      "meeting_month_key": "2024-08",
      "first_meeting_date": "2024-08-28",
      "report_agenda_count": 1,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 11,
      "meeting_year": 2024,
      "meeting_count": 2,
      "meeting_month": 9,
      "last_meeting_date": "2024-09-25",
      "meeting_month_key": "2024-09",
      "first_meeting_date": "2024-09-11",
      "report_agenda_count": 5,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 6,
      "meeting_year": 2024,
      "meeting_count": 1,
      "meeting_month": 10,
      "last_meeting_date": "2024-10-23",
      "meeting_month_key": "2024-10",
      "first_meeting_date": "2024-10-23",
      "report_agenda_count": 3,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 8,
      "meeting_year": 2024,
      "meeting_count": 3,
      "meeting_month": 11,
      "last_meeting_date": "2024-11-27",
      "meeting_month_key": "2024-11",
      "first_meeting_date": "2024-11-04",
      "report_agenda_count": 3,
      "decision_agenda_count": 5
    },
    {
      "agenda_count": 5,
      "meeting_year": 2024,
      "meeting_count": 1,
      "meeting_month": 12,
      "last_meeting_date": "2024-12-11",
      "meeting_month_key": "2024-12",
      "first_meeting_date": "2024-12-11",
      "report_agenda_count": 3,
      "decision_agenda_count": 2
    },
    {
      "agenda_count": 6,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 1,
      "last_meeting_date": "2025-01-22",
      "meeting_month_key": "2025-01",
      "first_meeting_date": "2025-01-08",
      "report_agenda_count": 1,
      "decision_agenda_count": 5
    },
    {
      "agenda_count": 8,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 2,
      "last_meeting_date": "2025-02-26",
      "meeting_month_key": "2025-02",
      "first_meeting_date": "2025-02-12",
      "report_agenda_count": 2,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 10,
      "meeting_year": 2025,
      "meeting_count": 3,
      "meeting_month": 3,
      "last_meeting_date": "2025-03-26",
      "meeting_month_key": "2025-03",
      "first_meeting_date": "2025-03-07",
      "report_agenda_count": 5,
      "decision_agenda_count": 5
    },
    {
      "agenda_count": 8,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 4,
      "last_meeting_date": "2025-04-23",
      "meeting_month_key": "2025-04",
      "first_meeting_date": "2025-04-09",
      "report_agenda_count": 4,
      "decision_agenda_count": 4
    },
    {
      "agenda_count": 13,
      "meeting_year": 2025,
      "meeting_count": 3,
      "meeting_month": 5,
      "last_meeting_date": "2025-05-28",
      "meeting_month_key": "2025-05",
      "first_meeting_date": "2025-05-02",
      "report_agenda_count": 6,
      "decision_agenda_count": 7
    },
    {
      "agenda_count": 10,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 6,
      "last_meeting_date": "2025-06-25",
      "meeting_month_key": "2025-06",
      "first_meeting_date": "2025-06-11",
      "report_agenda_count": 3,
      "decision_agenda_count": 7
    },
    {
      "agenda_count": 10,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 7,
      "last_meeting_date": "2025-07-23",
      "meeting_month_key": "2025-07",
      "first_meeting_date": "2025-07-09",
      "report_agenda_count": 2,
      "decision_agenda_count": 8
    },
    {
      "agenda_count": 3,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 8,
      "last_meeting_date": "2025-08-27",
      "meeting_month_key": "2025-08",
      "first_meeting_date": "2025-08-22",
      "report_agenda_count": 0,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 11,
      "meeting_year": 2025,
      "meeting_count": 3,
      "meeting_month": 9,
      "last_meeting_date": "2025-09-24",
      "meeting_month_key": "2025-09",
      "first_meeting_date": "2025-09-03",
      "report_agenda_count": 3,
      "decision_agenda_count": 8
    },
    {
      "agenda_count": 4,
      "meeting_year": 2025,
      "meeting_count": 1,
      "meeting_month": 10,
      "last_meeting_date": "2025-10-22",
      "meeting_month_key": "2025-10",
      "first_meeting_date": "2025-10-22",
      "report_agenda_count": 1,
      "decision_agenda_count": 3
    },
    {
      "agenda_count": 8,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 11,
      "last_meeting_date": "2025-11-26",
      "meeting_month_key": "2025-11",
      "first_meeting_date": "2025-11-20",
      "report_agenda_count": 2,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 6,
      "meeting_year": 2025,
      "meeting_count": 2,
      "meeting_month": 12,
      "last_meeting_date": "2025-12-10",
      "meeting_month_key": "2025-12",
      "first_meeting_date": "2025-12-03",
      "report_agenda_count": 2,
      "decision_agenda_count": 4
    },
    {
      "agenda_count": 9,
      "meeting_year": 2026,
      "meeting_count": 2,
      "meeting_month": 1,
      "last_meeting_date": "2026-01-28",
      "meeting_month_key": "2026-01",
      "first_meeting_date": "2026-01-14",
      "report_agenda_count": 3,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 5,
      "meeting_year": 2026,
      "meeting_count": 1,
      "meeting_month": 2,
      "last_meeting_date": "2026-02-11",
      "meeting_month_key": "2026-02",
      "first_meeting_date": "2026-02-11",
      "report_agenda_count": 1,
      "decision_agenda_count": 4
    },
    {
      "agenda_count": 9,
      "meeting_year": 2026,
      "meeting_count": 2,
      "meeting_month": 3,
      "last_meeting_date": "2026-03-25",
      "meeting_month_key": "2026-03",
      "first_meeting_date": "2026-03-11",
      "report_agenda_count": 3,
      "decision_agenda_count": 6
    },
    {
      "agenda_count": 11,
      "meeting_year": 2026,
      "meeting_count": 2,
      "meeting_month": 4,
      "last_meeting_date": "2026-04-22",
      "meeting_month_key": "2026-04",
      "first_meeting_date": "2026-04-08",
      "report_agenda_count": 7,
      "decision_agenda_count": 4
    }
  ],
  "majorPenaltyCases": [
    {
      "case_id": "ebb88535-c32d-45ca-b360-c15c9a443294",
      "case_no": "2025조이0056",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제31조",
          "article_title": "개인정보 보호책임자의 지정 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조",
          "article_title": "손해배상책임"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제40조",
          "article_title": "설치 및 구성"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0056)",
      "target_name": "에스케이텔레콤 주식회사",
      "meeting_date": "2025-08-27",
      "target_group": "민간기업",
      "decision_date": "2025-08-27",
      "meeting_title": "2025년 제18회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 9600000,
      "meeting_number": 111,
      "amount_total_krw": 134800600000,
      "penalty_breakdown": [
        {
          "amount_krw": 134791000000,
          "amount_text": "134,791,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 9600000,
          "amount_text": "9,600,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 134791000000
    },
    {
      "case_id": "41bc7f24-8fb6-4bc4-b9da-9df2f3bd716a",
      "case_no": "2021조일0028",
      "articles": [
        {
          "law_name": null,
          "article_no": "제26조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제4항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제12조",
          "article_title": "개인정보 보호지침"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제15조",
          "article_title": "개인정보의 수집ㆍ이용"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제22조",
          "article_title": "동의를 받는 방법"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의15",
          "article_title": "과징금의 부과 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의3",
          "article_title": "개인정보의 수집ㆍ이용 동의 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "전자문서 및 전자거래 기본법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "정보통신망 이용촉진 및 정보보호 등에 관한 법률",
          "article_no": "제2조",
          "article_title": "정의"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조일0028)",
      "target_name": "구글",
      "meeting_date": "2022-09-14",
      "target_group": "민간기업",
      "decision_date": "2022-09-14",
      "meeting_title": "2022년 제15회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 45,
      "amount_total_krw": 69241000000,
      "penalty_breakdown": [
        {
          "amount_krw": 69241000000,
          "amount_text": "69,241,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 69241000000
    },
    {
      "case_id": "01a40639-98f9-429e-bc88-361de7f8d671",
      "case_no": "2023조이0023",
      "articles": [
        {
          "law_name": null,
          "article_no": "제39조의14",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항제5호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항제2호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제3항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의4제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의4",
          "article_title": "가명정보에 대한 안전조치의무 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제32조의2",
          "article_title": "개인정보 보호 인증"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0023)",
      "target_name": "㈜카카오",
      "meeting_date": "2024-05-22",
      "target_group": "민간기업",
      "decision_date": "2024-05-22",
      "meeting_title": "2024년 제9회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 7800000,
      "meeting_number": 81,
      "amount_total_krw": 15149760000,
      "penalty_breakdown": [
        {
          "amount_krw": 15141960000,
          "amount_text": "15,141,960,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 7800000,
          "amount_text": "7,800,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 15141960000
    },
    {
      "case_id": "32bbcf52-f93c-492b-abb3-79dd49e222b5",
      "case_no": "2024조일0034#2",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제12조",
          "article_title": "개인정보 보호지침"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제15조",
          "article_title": "개인정보의 수집ㆍ이용"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제18조",
          "article_title": "개인정보의 목적 외 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의8",
          "article_title": "개인정보의 국외 이전"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제59조",
          "article_title": "금지행위"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제71조",
          "article_title": "벌칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "여신전문금융업법",
          "article_no": "제14조의2",
          "article_title": "신용카드회원의 모집"
        },
        {
          "law_name": "여신전문금융업법",
          "article_no": "제16조의2",
          "article_title": "가맹점의 모집 등"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0034)",
      "target_name": "주식회사 우리카드",
      "meeting_date": "2025-03-26",
      "target_group": "민간기업",
      "decision_date": "2025-03-26",
      "meeting_title": "2025년 제7회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 100,
      "amount_total_krw": 13451000000,
      "penalty_breakdown": [
        {
          "amount_krw": 13451000000,
          "amount_text": "13,451,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 13451000000
    },
    {
      "case_id": "b91a5b2e-497f-431f-834e-4532d81b6482",
      "case_no": "2023조일0116",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항제9호",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조일0116)",
      "target_name": "㈜골프존",
      "meeting_date": "2024-05-08",
      "target_group": "민간기업",
      "decision_date": "2024-05-08",
      "meeting_title": "2024년 제8회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 5400000,
      "meeting_number": 80,
      "amount_total_krw": 7509400000,
      "penalty_breakdown": [
        {
          "amount_krw": 7504000000,
          "amount_text": "7,504,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 5400000,
          "amount_text": "5,400,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 7504000000
    },
    {
      "case_id": "bcea3285-0369-481b-a6e0-270db7df4cad",
      "case_no": "2023조이0003",
      "articles": [
        {
          "law_name": null,
          "article_no": "제48조의11제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항제2호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항제3호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항제4호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제3항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조",
          "article_title": "개인정보취급자에 대한 감독"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의14",
          "article_title": "방송사업자등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의15",
          "article_title": "과징금의 부과 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의6",
          "article_title": "개인정보의 파기에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "전기통신사업법",
          "article_no": "제5조",
          "article_title": "전기통신사업의 구분 등"
        },
        {
          "law_name": "전기통신사업법",
          "article_no": "제6조",
          "article_title": "기간통신사업의 등록 등"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0003)",
      "target_name": "㈜엘지유플러스",
      "meeting_date": "2023-07-12",
      "target_group": "민간기업",
      "decision_date": "2023-07-12",
      "meeting_title": "2023년 제12회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 27000000,
      "meeting_number": 63,
      "amount_total_krw": 6827452000,
      "penalty_breakdown": [
        {
          "amount_krw": 6800452000,
          "amount_text": "6,800,452,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 27000000,
          "amount_text": "27,000,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 6800452000
    },
    {
      "case_id": "22dd6a7e-b2ba-46ac-86d1-9bf8f4229cab",
      "case_no": "제2025-001-002호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제15조",
          "article_title": "개인정보의 수집ㆍ이용"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제18조",
          "article_title": "개인정보의 목적 외 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의8",
          "article_title": "개인정보의 국외 이전"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제32조",
          "article_title": "개인정보파일의 등록 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제32조의2",
          "article_title": "개인정보 보호 인증"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
          "article_no": "제17조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
          "article_no": "제18조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
          "article_no": "제28조의8제1항제1호",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "target_name": "㈜카카오페이",
      "meeting_date": "2025-01-22",
      "target_group": "민간기업",
      "decision_date": "2025-01-22",
      "meeting_title": "2025년 제2회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 95,
      "amount_total_krw": 5968000000,
      "penalty_breakdown": [
        {
          "amount_krw": 5968000000,
          "amount_text": "5,968,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 5968000000
    },
    {
      "case_id": "6db1f32f-2898-4638-811c-07d4cbc03038",
      "case_no": "제2025-001-003호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제29조의7",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의8",
          "article_title": "개인정보의 국외 이전"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제32조의2",
          "article_title": "개인정보 보호 인증"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
          "article_no": "제17조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
          "article_no": "제18조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)",
          "article_no": "제28조의8제1항제1호",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조삼0005 등 3건)",
      "target_name": "Apple Distribution International Limited",
      "meeting_date": "2025-01-22",
      "target_group": "기타/미분류",
      "decision_date": "2025-01-22",
      "meeting_title": "2025년 제2회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 2200000,
      "meeting_number": 95,
      "amount_total_krw": 2407200000,
      "penalty_breakdown": [
        {
          "amount_krw": 2405000000,
          "amount_text": "2,405,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 2200000,
          "amount_text": "2,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 2405000000
    },
    {
      "case_id": "27a865b2-d2c5-43f6-b74f-efaede1927d3",
      "case_no": "2024조일0013",
      "articles": [
        {
          "law_name": null,
          "article_no": "제29조의10제1항제1호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제29조의10제2항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제19조",
          "article_title": "개인정보를 제공받은 자의 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의11",
          "article_title": "준용규정"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의8",
          "article_title": "개인정보의 국외 이전"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제31조의2",
          "article_title": "국내대리인의 지정"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제35조",
          "article_title": "개인정보의 열람"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제35조의2",
          "article_title": "개인정보의 전송 요구"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제36조",
          "article_title": "개인정보의 정정ㆍ삭제"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제37조",
          "article_title": "개인정보의 처리정지 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제37조의2",
          "article_title": "자동화된 결정에 대한 정보주체의 권리 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제38조",
          "article_title": "권리행사의 방법 및 절차"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제28조의8제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0013)",
      "target_name": null,
      "meeting_date": "2024-07-24",
      "target_group": "대상 미식별",
      "decision_date": "2024-07-24",
      "meeting_title": "2024년 제13회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 7800000,
      "meeting_number": 85,
      "amount_total_krw": 1985800000,
      "penalty_breakdown": [
        {
          "amount_krw": 1978000000,
          "amount_text": "1,978,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 7800000,
          "amount_text": "7,800,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 1978000000
    },
    {
      "case_id": "34dc1ceb-9bfb-429c-befc-55340330e395",
      "case_no": "2023조이0062",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조",
          "article_title": "손해배상책임"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제40조",
          "article_title": "설치 및 구성"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0062, 2023조이0131)",
      "target_name": "㈜섹타나인",
      "meeting_date": "2025-02-12",
      "target_group": "민간기업",
      "decision_date": "2025-02-12",
      "meeting_title": "2025년 제3회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 7200000,
      "meeting_number": 96,
      "amount_total_krw": 1484200000,
      "penalty_breakdown": [
        {
          "amount_krw": 1477000000,
          "amount_text": "1,477,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 7200000,
          "amount_text": "7,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 1477000000
    },
    {
      "case_id": "cf67bf7f-0ca4-467f-b086-39a1f0f00c65",
      "case_no": "제2024-011-187호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조의2",
          "article_title": "이동형 영상정보처리기기의 운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의4",
          "article_title": "가명정보에 대한 안전조치의무 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제32조의2",
          "article_title": "개인정보 보호 인증"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        },
        {
          "law_name": "정보통신망 이용촉진 및 정보보호 등에 관한 법률",
          "article_no": "제2조",
          "article_title": "정의"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0130 등 2건)",
      "target_name": "에스케이스토아㈜",
      "meeting_date": "2025-01-22",
      "target_group": "민간기업",
      "decision_date": "2025-01-22",
      "meeting_title": "2025년 제2회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 3000000,
      "meeting_number": 95,
      "amount_total_krw": 1435000000,
      "penalty_breakdown": [
        {
          "amount_krw": 1432000000,
          "amount_text": "1,432,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 3000000,
          "amount_text": "3,000,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 1432000000
    },
    {
      "case_id": "0687c051-1047-4c41-bba7-244376b7c631",
      "case_no": "제2025-015-229호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0032, 2024조이0090)",
      "target_name": "㈜비와이엔블랙야크",
      "meeting_date": "2025-07-09",
      "target_group": "민간기업",
      "decision_date": "2025-07-09",
      "meeting_title": "2025년 제15회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 108,
      "amount_total_krw": 1391000000,
      "penalty_breakdown": [
        {
          "amount_krw": 1391000000,
          "amount_text": "1,391,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 1391000000
    },
    {
      "case_id": "aa3f9726-6022-41e3-b786-c5daf22186df",
      "case_no": "제2024-019-248호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조의2",
          "article_title": "개인정보 처리방침의 평가 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제3조",
          "article_title": "개인정보 보호 원칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조이0163 등 3건)",
      "target_name": null,
      "meeting_date": "2024-11-27",
      "target_group": "대상 미식별",
      "decision_date": "2024-11-27",
      "meeting_title": "2024년 제20회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 0,
      "meeting_number": 92,
      "amount_total_krw": 1310000000,
      "penalty_breakdown": [
        {
          "amount_krw": 1310000000,
          "amount_text": "1,310,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 1310000000
    },
    {
      "case_id": "29797297-09bf-4cfa-a8dc-275aceb75370",
      "case_no": "제2023-006-056호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제48조의11",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항제2호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제3항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의4제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조",
          "article_title": "개인정보취급자에 대한 감독"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의4",
          "article_title": "가명정보에 대한 안전조치의무 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의15",
          "article_title": "과징금의 부과 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2022조일0069, 2022조이0052)",
      "target_name": null,
      "meeting_date": "2023-06-28",
      "target_group": "대상 미식별",
      "decision_date": "2023-06-28",
      "meeting_title": "2023년 제11회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 10200000,
      "meeting_number": 62,
      "amount_total_krw": 1141986000,
      "penalty_breakdown": [
        {
          "amount_krw": 1131786000,
          "amount_text": "1,131,786,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 10200000,
          "amount_text": "10,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 1131786000
    },
    {
      "case_id": "c2ffdc4c-1c8d-41e4-88be-951fae75a45f",
      "case_no": "2023조일0035",
      "articles": [
        {
          "law_name": null,
          "article_no": "제39조의15",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항제5호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제4항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항제2호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제49조의11제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "舊 개인정보 보호법 위반에 대한 과태료 부과기준",
          "article_no": "제63조",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조일0035)",
      "target_name": null,
      "meeting_date": "2023-10-25",
      "target_group": "대상 미식별",
      "decision_date": "2023-10-25",
      "meeting_title": "2023년 제17회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 16200000,
      "meeting_number": 68,
      "amount_total_krw": 922200000,
      "penalty_breakdown": [
        {
          "amount_krw": 906000000,
          "amount_text": "906,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 16200000,
          "amount_text": "16,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 906000000
    },
    {
      "case_id": "d5a855ce-bee1-4c65-ae32-6adb9caf14fb",
      "case_no": "2024조일0013",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조",
          "article_title": "개인정보취급자에 대한 감독"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의8",
          "article_title": "개인정보의 국외 이전"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제31조의2",
          "article_title": "국내대리인의 지정"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제35조",
          "article_title": "개인정보의 열람"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제35조의2",
          "article_title": "개인정보의 전송 요구"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제36조",
          "article_title": "개인정보의 정정ㆍ삭제"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제37조",
          "article_title": "개인정보의 처리정지 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제37조의2",
          "article_title": "자동화된 결정에 대한 정보주체의 권리 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제38조",
          "article_title": "권리행사의 방법 및 절차"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0013, 2025조일0025)",
      "target_name": "Whaleco Technology Limited",
      "meeting_date": "2025-05-14",
      "target_group": "민간기업",
      "decision_date": "2025-05-14",
      "meeting_title": "2025년 제11회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 17600000,
      "meeting_number": 104,
      "amount_total_krw": 896600000,
      "penalty_breakdown": [
        {
          "amount_krw": 879000000,
          "amount_text": "879,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 17600000,
          "amount_text": "17,600,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 879000000
    },
    {
      "case_id": "a52b48bc-c906-4328-97dd-de7c4ddbcfda",
      "case_no": "2022조이0028",
      "articles": [
        {
          "law_name": null,
          "article_no": "제48조의11",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의5제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제15조",
          "article_title": "개인정보의 수집ㆍ이용"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제18조",
          "article_title": "개인정보의 목적 외 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제31조",
          "article_title": "개인정보 보호책임자의 지정 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제32조",
          "article_title": "개인정보파일의 등록 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의15",
          "article_title": "과징금의 부과 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의3",
          "article_title": "개인정보의 수집ㆍ이용 동의 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의6",
          "article_title": "개인정보의 파기에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2022조이0028)",
      "target_name": "㈜자비스앤빌런즈",
      "meeting_date": "2023-06-28",
      "target_group": "민간기업",
      "decision_date": "2023-06-28",
      "meeting_title": "2023년 제11회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 12000000,
      "meeting_number": 62,
      "amount_total_krw": 866106000,
      "penalty_breakdown": [
        {
          "amount_krw": 854106000,
          "amount_text": "854,106,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 12000000,
          "amount_text": "12,000,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 854106000
    },
    {
      "case_id": "8b999ee0-37fa-4f33-a6cc-bc0a863029ba",
      "case_no": "2024조이0079",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조",
          "article_title": "손해배상책임"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제40조",
          "article_title": "설치 및 구성"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조이0079)",
      "target_name": "㈜모두투어네트워크",
      "meeting_date": "2025-03-12",
      "target_group": "민간기업",
      "decision_date": "2025-03-12",
      "meeting_title": "2025년 제6회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 10200000,
      "meeting_number": 99,
      "amount_total_krw": 757200000,
      "penalty_breakdown": [
        {
          "amount_krw": 747000000,
          "amount_text": "747,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 10200000,
          "amount_text": "10,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 747000000
    },
    {
      "case_id": "f17b3154-1588-4298-abf0-b09d08d01af8",
      "case_no": "제2024-016-234호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제15조",
          "article_title": "개인정보의 수집ㆍ이용"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제18조",
          "article_title": "개인정보의 목적 외 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의8",
          "article_title": "개인정보의 국외 이전"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제38조",
          "article_title": "권리행사의 방법 및 절차"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 공표 및 공표명령 지침",
          "article_no": "제6조제1항제3호",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제5조제2항",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0012)",
      "target_name": null,
      "meeting_date": "2024-09-25",
      "target_group": "대상 미식별",
      "decision_date": "2024-09-25",
      "meeting_title": "2024년 제16회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 0,
      "meeting_number": 88,
      "amount_total_krw": 725000000,
      "penalty_breakdown": [
        {
          "amount_krw": 725000000,
          "amount_text": "725,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 725000000
    },
    {
      "case_id": "a4048e1d-7253-4e96-912e-c9a4e406f8c2",
      "case_no": "2025조총0045",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항제1호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제6항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제3조",
          "article_title": "개인정보 보호 원칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "한국연구재단법",
          "article_no": "제2조",
          "article_title": "법인"
        }
      ],
      "case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조총0045)",
      "target_name": "한국연구재단",
      "meeting_date": "2026-01-28",
      "target_group": "공공",
      "decision_date": "2026-01-28",
      "meeting_title": "2026년 제2회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 4800000,
      "meeting_number": 121,
      "amount_total_krw": 707800000,
      "penalty_breakdown": [
        {
          "amount_krw": 703000000,
          "amount_text": "703,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 4800000,
          "amount_text": "4,800,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 703000000
    },
    {
      "case_id": "a669b550-34dd-4050-a9f5-c8537ebff5ad",
      "case_no": "제2025-013-040호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항제1호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제6항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 공표 및 공표명령 지침",
          "article_no": "제6조제1항제2호",
          "article_title": null
        }
      ],
      "case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0059, 0067)",
      "target_name": "전북대학교",
      "meeting_date": "2025-06-11",
      "target_group": "공공",
      "decision_date": "2025-06-11",
      "meeting_title": "2025년 제13회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 5400000,
      "meeting_number": 106,
      "amount_total_krw": 628400000,
      "penalty_breakdown": [
        {
          "amount_krw": 623000000,
          "amount_text": "623,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 5400000,
          "amount_text": "5,400,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 623000000
    },
    {
      "case_id": "47dc1e95-c2d1-4e87-b12a-e0013c08c504",
      "case_no": "제2024-006-163호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조",
          "article_title": "손해배상책임"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조이0016 등 2건)",
      "target_name": null,
      "meeting_date": "2024-03-27",
      "target_group": "대상 미식별",
      "decision_date": "2024-03-27",
      "meeting_title": "2024년 제6회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 3300000,
      "meeting_number": 78,
      "amount_total_krw": 616300000,
      "penalty_breakdown": [
        {
          "amount_krw": 613000000,
          "amount_text": "613,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 3300000,
          "amount_text": "3,300,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 613000000
    },
    {
      "case_id": "b6436aa8-3449-4690-a5a1-3720bcd74724",
      "case_no": "제2025-026-305호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항제1호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제6항",
          "article_title": null
        },
        {
          "law_name": "<br>으로, 같은 법</td><td>개인정보 보호법",
          "article_no": "제2조제2호",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호 법규 위반에 대한 징계권고 기준",
          "article_no": "제3조제1항제4호",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조의2",
          "article_title": "개인정보 처리방침의 평가 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 공표 및 공표명령 지침",
          "article_no": "제3조제1항제3호",
          "article_title": null
        }
      ],
      "case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조총0042, 2024조총0025)",
      "target_name": "공무원연금공단",
      "meeting_date": "2026-03-25",
      "target_group": "공공",
      "decision_date": "2026-03-25",
      "meeting_title": "2026년 제5회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 124,
      "amount_total_krw": 532000000,
      "penalty_breakdown": [
        {
          "amount_krw": 532000000,
          "amount_text": "532,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 532000000
    },
    {
      "case_id": "e10a799d-ae43-4e80-8514-3e5626398a78",
      "case_no": "2024조이0092",
      "articles": [
        {
          "law_name": null,
          "article_no": "제21조의2제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제21조의2제3항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조",
          "article_title": "손해배상책임"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제40조",
          "article_title": "설치 및 구성"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제76조",
          "article_title": "과태료에 관한 규정 적용의 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        },
        {
          "law_name": "중소기업기본법",
          "article_no": "제2조",
          "article_title": "중소기업자의 범위"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조이0092)",
      "target_name": null,
      "meeting_date": "2025-11-20",
      "target_group": "대상 미식별",
      "decision_date": "2025-11-20",
      "meeting_title": "2025년 제23회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 6000000,
      "meeting_number": 116,
      "amount_total_krw": 529000000,
      "penalty_breakdown": [
        {
          "amount_krw": 523000000,
          "amount_text": "523,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 6000000,
          "amount_text": "6,000,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 523000000
    },
    {
      "case_id": "d169abac-6125-426e-8681-f80fda2e0c7a",
      "case_no": "제2025-002-005호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제26조",
          "article_title": "업무위탁에 따른 개인정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제32조의2",
          "article_title": "개인정보 보호 인증"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0130 등 2건)",
      "target_name": "㈜동행복권",
      "meeting_date": "2025-01-22",
      "target_group": "민간기업",
      "decision_date": "2025-01-22",
      "meeting_title": "2025년 제2회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 4800000,
      "meeting_number": 95,
      "amount_total_krw": 507800000,
      "penalty_breakdown": [
        {
          "amount_krw": 503000000,
          "amount_text": "503,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 4800000,
          "amount_text": "4,800,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 503000000
    },
    {
      "case_id": "2d366eec-7737-4c98-a0fd-f763e59ac422",
      "case_no": "2025조일0025",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0013, 2025조일0025)",
      "target_name": "Elementary Innovation Pte. Ltd",
      "meeting_date": "2025-05-14",
      "target_group": "민간기업",
      "decision_date": "2025-05-14",
      "meeting_title": "2025년 제11회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 104,
      "amount_total_krw": 490000000,
      "penalty_breakdown": [
        {
          "amount_krw": 490000000,
          "amount_text": "490,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 490000000
    },
    {
      "case_id": "988ee482-4e6e-4949-b281-8ff3b99dad0e",
      "case_no": "2024조총0003#2",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제3조",
          "article_title": "개인정보 보호 원칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과태료 부과기준",
          "article_no": "제63조",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0003, 2023조이0078)",
      "target_name": "한국사회복지협의회",
      "meeting_date": "2024-09-25",
      "target_group": "공공",
      "decision_date": "2024-09-25",
      "meeting_title": "2024년 제16회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 5400000,
      "meeting_number": 88,
      "amount_total_krw": 488400000,
      "penalty_breakdown": [
        {
          "amount_krw": 483000000,
          "amount_text": "483,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 5400000,
          "amount_text": "5,400,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 483000000
    },
    {
      "case_id": "7fa2804d-0064-454a-8eb7-3d37ae47d423",
      "case_no": "2025조이0034",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조",
          "article_title": "손해배상책임"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제40조",
          "article_title": "설치 및 구성"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "중소기업기본법",
          "article_no": "제10조",
          "article_title": "공정경쟁 및 동반성장의 촉진"
        },
        {
          "law_name": "중소기업기본법",
          "article_no": "제2조",
          "article_title": "중소기업자의 범위"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2025조이0034)",
      "target_name": "인크루트(주)",
      "meeting_date": "2025-10-22",
      "target_group": "민간기업",
      "decision_date": "2025-10-22",
      "meeting_title": "2025년 제22회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 115,
      "amount_total_krw": 463000000,
      "penalty_breakdown": [
        {
          "amount_krw": 463000000,
          "amount_text": "463,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 463000000
    },
    {
      "case_id": "99b864ea-d6be-4e71-a56b-e5adb986966a",
      "case_no": "제2026-005-025호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항제1호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제6항",
          "article_title": null
        },
        {
          "law_name": "| 지방자치법",
          "article_no": "제2조제5호",
          "article_title": null
        },
        {
          "law_name": "| 지방자치법",
          "article_no": "제2조제6호",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제3조",
          "article_title": "개인정보 보호 원칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        }
      ],
      "case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조총0042, 2024조총0025)",
      "target_name": "공무원연금공단",
      "meeting_date": "2026-03-25",
      "target_group": "공공",
      "decision_date": "2026-03-25",
      "meeting_title": "2026년 제5회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 4800000,
      "meeting_number": 124,
      "amount_total_krw": 382800000,
      "penalty_breakdown": [
        {
          "amount_krw": 378000000,
          "amount_text": "378,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 4800000,
          "amount_text": "4,800,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 378000000
    },
    {
      "case_id": "884abee4-b15a-4688-b893-5f0cd1f55f25",
      "case_no": "제2024-016-235호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제22조의2",
          "article_title": "아동의 개인정보 보호"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의8",
          "article_title": "개인정보의 국외 이전"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제28조의8제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보보호 법규 위반에 대한 과징금 부과기준",
          "article_no": "제64조의2제1항",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0012)",
      "target_name": null,
      "meeting_date": "2024-09-25",
      "target_group": "대상 미식별",
      "decision_date": "2024-09-25",
      "meeting_title": "2024년 제16회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 0,
      "meeting_number": 88,
      "amount_total_krw": 379000000,
      "penalty_breakdown": [
        {
          "amount_krw": 379000000,
          "amount_text": "379,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 379000000
    },
    {
      "case_id": "4d6d8163-b19c-4b24-adaa-113a88a24525",
      "case_no": "2024조일0043#3",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조일0043, 2023조총0051)",
      "target_name": "㈜해성디에스",
      "meeting_date": "2025-07-23",
      "target_group": "민간기업",
      "decision_date": "2025-07-23",
      "meeting_title": "2025년 제16회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 109,
      "amount_total_krw": 343000000,
      "penalty_breakdown": [
        {
          "amount_krw": 343000000,
          "amount_text": "343,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 343000000
    },
    {
      "case_id": "7cedba80-acce-46c7-aaa9-3f99eeba1632",
      "case_no": "제2025-013-041호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항제1호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제6항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호 법규 위반에 대한 징계권고 기준",
          "article_no": "제3조제1항제3호",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호 법규 위반에 대한 징계권고 기준",
          "article_no": "제64조의2제1항제9호",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 공표 및 공표명령 지침",
          "article_no": "제6조제1항제2호",
          "article_title": null
        }
      ],
      "case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0059, 0067)",
      "target_name": "이화여자대학교",
      "meeting_date": "2025-06-11",
      "target_group": "공공",
      "decision_date": "2025-06-11",
      "meeting_title": "2025년 제13회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 106,
      "amount_total_krw": 343000000,
      "penalty_breakdown": [
        {
          "amount_krw": 343000000,
          "amount_text": "343,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 343000000
    },
    {
      "case_id": "29c0c92a-ae11-415e-a079-07fb2b18d852",
      "case_no": "제2024-019-246호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제39조의14",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항제5호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제3항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의4제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의4",
          "article_title": "가명정보에 대한 안전조치의무 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조이0163 등 3건)",
      "target_name": null,
      "meeting_date": "2024-11-27",
      "target_group": "대상 미식별",
      "decision_date": "2024-11-27",
      "meeting_title": "2024년 제20회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 10800000,
      "meeting_number": 92,
      "amount_total_krw": 289451000,
      "penalty_breakdown": [
        {
          "amount_krw": 278651000,
          "amount_text": "278,651,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 10800000,
          "amount_text": "10,800,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 278651000
    },
    {
      "case_id": "4856f086-d870-403b-b939-3df85b00ad33",
      "case_no": "2021조일0035",
      "articles": [
        {
          "law_name": null,
          "article_no": "제48조의11제4항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의12",
          "article_title": "국외 이전 개인정보의 보호"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의15",
          "article_title": "과징금의 부과 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의3",
          "article_title": "개인정보의 수집ㆍ이용 동의 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제3조",
          "article_title": "개인정보 보호 원칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과태료 부과기준(지침)",
          "article_no": "제6조",
          "article_title": null
        },
        {
          "law_name": "개인정보보호법령 및 지침․고시 해설(이하 ‘해설서’)",
          "article_no": "제6조",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건 (2021조일0033 등 3건)",
      "target_name": "넷플릭스",
      "meeting_date": "2021-08-25",
      "target_group": "민간기업",
      "decision_date": "2021-08-25",
      "meeting_title": "2021년 제14회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 3200000,
      "meeting_number": 23,
      "amount_total_krw": 227200000,
      "penalty_breakdown": [
        {
          "amount_krw": 224000000,
          "amount_text": "224,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 3200000,
          "amount_text": "3,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 224000000
    },
    {
      "case_id": "27bd2572-25bd-4f77-92d0-4004c6acca01",
      "case_no": "제2024-016-232호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제11조",
          "article_title": "자료제출 요구 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제15조",
          "article_title": "개인정보의 수집ㆍ이용"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제18조",
          "article_title": "개인정보의 목적 외 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의3",
          "article_title": "개인정보의 수집ㆍ이용 동의 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제3조",
          "article_title": "개인정보 보호 원칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제59조",
          "article_title": "금지행위"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제71조",
          "article_title": "벌칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0003, 2023조이0078)",
      "target_name": "한국사회복지협의회",
      "meeting_date": "2024-09-25",
      "target_group": "공공",
      "decision_date": "2024-09-25",
      "meeting_title": "2024년 제16회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 0,
      "meeting_number": 88,
      "amount_total_krw": 224000000,
      "penalty_breakdown": [
        {
          "amount_krw": 224000000,
          "amount_text": "224,000,000원",
          "penalty_kind": "과징금"
        }
      ],
      "surcharge_total_krw": 224000000
    },
    {
      "case_id": "aecf605c-8d55-417a-ad11-d5a87a573ee2",
      "case_no": "2023조총0053",
      "articles": [
        {
          "law_name": null,
          "article_no": "제40조의2제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호 법규 위반에 대한 징계권고 기준",
          "article_no": "제24조제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호 법규 위반에 대한 징계권고 기준",
          "article_no": "제3조제1항제4호",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제19조",
          "article_title": "개인정보를 제공받은 자의 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조",
          "article_title": "개인정보 유출 등의 통지ㆍ신고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제34조의2",
          "article_title": "노출된 개인정보의 삭제ㆍ차단"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과태료 부과기준",
          "article_no": "제34조의2",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과태료 부과기준",
          "article_no": "제76조",
          "article_title": null
        },
        {
          "law_name": "민사소송 등에서의 전자문서 이용 등에 관한 법률",
          "article_no": "제4조",
          "article_title": "전산정보처리시스템의 운영"
        }
      ],
      "case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조총0053)",
      "target_name": "법원행정처",
      "meeting_date": "2025-01-08",
      "target_group": "공공",
      "decision_date": "2025-01-08",
      "meeting_title": "2025년 제1회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 6000000,
      "meeting_number": 94,
      "amount_total_krw": 213000000,
      "penalty_breakdown": [
        {
          "amount_krw": 207000000,
          "amount_text": "207,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 6000000,
          "amount_text": "6,000,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 207000000
    },
    {
      "case_id": "42338be6-60f3-48a3-93ae-484d4aeb2fa5",
      "case_no": "2023조일0033",
      "articles": [
        {
          "law_name": null,
          "article_no": "제39조의14",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항제5호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제3항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제18조",
          "article_title": "개인정보의 목적 외 이용ㆍ제공 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의4",
          "article_title": "가명정보에 대한 안전조치의무 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제3조",
          "article_title": "개인정보 보호 원칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0009 등 3건)",
      "target_name": "2K Games, Inc",
      "meeting_date": null,
      "target_group": "기타/미분류",
      "decision_date": "2025-12-10",
      "meeting_title": null,
      "target_source": "entity",
      "fine_total_krw": 7200000,
      "meeting_number": null,
      "amount_total_krw": 201719000,
      "penalty_breakdown": [
        {
          "amount_krw": 194519000,
          "amount_text": "194,519,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 7200000,
          "amount_text": "7,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 194519000
    },
    {
      "case_id": "ae12bc35-d4b0-4e1b-9012-9eb6df0413ab",
      "case_no": "제2024-019-244호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제60조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제60조의2제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제10조",
          "article_title": "시행계획"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제2조",
          "article_title": "정의"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제30조",
          "article_title": "개인정보 처리방침의 수립 및 공개"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제61조",
          "article_title": "의견제시 및 개선권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조의2",
          "article_title": "과징금의 부과"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제9조",
          "article_title": "기본계획"
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과징금 부과기준",
          "article_no": "제24조제3항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과징금 부과기준",
          "article_no": "제29조",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법 위반에 대한 과태료 부과기준",
          "article_no": "제63조",
          "article_title": null
        }
      ],
      "case_title": "공공기관의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2024조총0010 등 2건)",
      "target_name": null,
      "meeting_date": "2024-11-13",
      "target_group": "공공",
      "decision_date": "2024-11-13",
      "meeting_title": "2024년 제19회 보호위원회",
      "target_source": "unidentified",
      "fine_total_krw": 6600000,
      "meeting_number": 91,
      "amount_total_krw": 199600000,
      "penalty_breakdown": [
        {
          "amount_krw": 193000000,
          "amount_text": "193,000,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 6600000,
          "amount_text": "6,600,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 193000000
    },
    {
      "case_id": "9ed2177e-9b21-472a-9e95-9033e53e0665",
      "case_no": "제2023-017-232호",
      "articles": [
        {
          "law_name": null,
          "article_no": "제39조의14",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제39조의15제1항제5호",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제1항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의2제3항",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의4제2항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제28조의4",
          "article_title": "가명정보에 대한 안전조치의무 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의6",
          "article_title": "개인정보의 파기에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제4조",
          "article_title": "정보주체의 권리"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제5조",
          "article_title": "국가 등의 책무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제6조",
          "article_title": "다른 법률과의 관계"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제7조",
          "article_title": "개인정보 보호위원회"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제8조",
          "article_title": null
        }
      ],
      "case_title": "정보통신서비스 제공자의 개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2023조이0020 등 3건)",
      "target_name": "주식회사 와이엘랜드",
      "meeting_date": "2023-10-25",
      "target_group": "민간기업",
      "decision_date": "2023-10-25",
      "meeting_title": "2023년 제17회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 10200000,
      "meeting_number": 68,
      "amount_total_krw": 161187000,
      "penalty_breakdown": [
        {
          "amount_krw": 150987000,
          "amount_text": "150,987,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 10200000,
          "amount_text": "10,200,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 150987000
    },
    {
      "case_id": "707e3fc6-39be-4096-8a70-70f417404d4d",
      "case_no": "2021조이0152",
      "articles": [
        {
          "law_name": null,
          "article_no": "제48조의11",
          "article_title": null
        },
        {
          "law_name": null,
          "article_no": "제48조의11제1항",
          "article_title": null
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제15조",
          "article_title": "개인정보의 수집ㆍ이용"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제17조",
          "article_title": "개인정보의 제공"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제20조",
          "article_title": "정보주체 이외로부터 수집한 개인정보의 수집 출처 등 고지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제21조",
          "article_title": "개인정보의 파기"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제23조",
          "article_title": "민감정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조",
          "article_title": "고유식별정보의 처리 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제24조의2",
          "article_title": "주민등록번호 처리의 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제25조",
          "article_title": "영상정보처리기기의 설치ㆍ운영 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제27조",
          "article_title": "영업양도 등에 따른 개인정보의 이전 제한"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제29조",
          "article_title": "안전조치의무"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조",
          "article_title": "손해배상책임"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의14",
          "article_title": "방송사업자등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의15",
          "article_title": "과징금의 부과 등에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의4",
          "article_title": "개인정보 유출등의 통지ㆍ신고에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제39조의6",
          "article_title": "개인정보의 파기에 대한 특례"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제48조",
          "article_title": "조정의 거부 및 중지"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제63조",
          "article_title": "자료제출 요구 및 검사"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제64조",
          "article_title": "시정조치 등"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제65조",
          "article_title": "고발 및 징계권고"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제66조",
          "article_title": "결과의 공표"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제71조",
          "article_title": "벌칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제73조",
          "article_title": "벌칙"
        },
        {
          "law_name": "개인정보 보호법",
          "article_no": "제75조",
          "article_title": "과태료"
        }
      ],
      "case_title": "개인정보보호 법규 위반행위에 대한 시정조치에 관한 건(2021조이0152)",
      "target_name": "트리플콤마(주)",
      "meeting_date": "2022-02-23",
      "target_group": "민간기업",
      "decision_date": "2022-02-23",
      "meeting_title": "2022년 제4회 보호위원회",
      "target_source": "entity",
      "fine_total_krw": 18600000,
      "meeting_number": 34,
      "amount_total_krw": 148390000,
      "penalty_breakdown": [
        {
          "amount_krw": 129790000,
          "amount_text": "129,790,000원",
          "penalty_kind": "과징금"
        },
        {
          "amount_krw": 18600000,
          "amount_text": "18,600,000원",
          "penalty_kind": "과태료"
        }
      ],
      "surcharge_total_krw": 129790000
    }
  ],
  "topicDistribution": [
    {
      "label": "위반·처분",
      "topic_key": "violation_sanction",
      "data_status": "rule_based_topic",
      "agenda_count": 201,
      "meeting_count": 107,
      "public_agenda_count": 161,
      "report_agenda_count": 9,
      "private_agenda_count": 40,
      "decision_agenda_count": 192
    },
    {
      "label": "법령·규정 정비",
      "topic_key": "law_rulemaking",
      "data_status": "rule_based_topic",
      "agenda_count": 122,
      "meeting_count": 71,
      "public_agenda_count": 82,
      "report_agenda_count": 51,
      "private_agenda_count": 40,
      "decision_agenda_count": 69
    },
    {
      "label": "기타",
      "topic_key": "other",
      "data_status": "rule_based_topic",
      "agenda_count": 101,
      "meeting_count": 71,
      "public_agenda_count": 58,
      "report_agenda_count": 70,
      "private_agenda_count": 43,
      "decision_agenda_count": 31
    },
    {
      "label": "AI·데이터·영상",
      "topic_key": "ai_data",
      "data_status": "rule_based_topic",
      "agenda_count": 47,
      "meeting_count": 40,
      "public_agenda_count": 17,
      "report_agenda_count": 25,
      "private_agenda_count": 30,
      "decision_agenda_count": 22
    },
    {
      "label": "공공부문",
      "topic_key": "public_sector",
      "data_status": "rule_based_topic",
      "agenda_count": 14,
      "meeting_count": 13,
      "public_agenda_count": 4,
      "report_agenda_count": 11,
      "private_agenda_count": 10,
      "decision_agenda_count": 3
    },
    {
      "label": "정보주체 권리·동의",
      "topic_key": "rights_policy",
      "data_status": "rule_based_topic",
      "agenda_count": 10,
      "meeting_count": 10,
      "public_agenda_count": 4,
      "report_agenda_count": 7,
      "private_agenda_count": 6,
      "decision_agenda_count": 3
    },
    {
      "label": "국외·플랫폼",
      "topic_key": "cross_border_platform",
      "data_status": "rule_based_topic",
      "agenda_count": 1,
      "meeting_count": 1,
      "public_agenda_count": 0,
      "report_agenda_count": 1,
      "private_agenda_count": 1,
      "decision_agenda_count": 0
    }
  ],
  "targetGroupSummary": [
    {
      "top_case_no": "2025조이0056",
      "target_count": 47,
      "target_group": "민간기업",
      "top_target_name": "에스케이텔레콤 주식회사",
      "amount_total_krw": 263252822000,
      "max_case_amount_krw": 134800600000,
      "monetary_case_count": 47
    },
    {
      "top_case_no": "2024조일0013",
      "target_count": 0,
      "target_group": "대상 미식별",
      "top_target_name": "피심인 미식별",
      "amount_total_krw": 9128818000,
      "max_case_amount_krw": 1985800000,
      "monetary_case_count": 170
    },
    {
      "top_case_no": "2025조총0045",
      "target_count": 18,
      "target_group": "공공",
      "top_target_name": "한국연구재단",
      "amount_total_krw": 4437350000,
      "max_case_amount_krw": 707800000,
      "monetary_case_count": 74
    },
    {
      "top_case_no": "제2025-001-003호",
      "target_count": 14,
      "target_group": "기타/미분류",
      "top_target_name": "Apple Distribution International Limited",
      "amount_total_krw": 3332819000,
      "max_case_amount_krw": 2407200000,
      "monetary_case_count": 14
    },
    {
      "top_case_no": "제2022-005-018호",
      "target_count": 4,
      "target_group": "개인",
      "top_target_name": "성보공업",
      "amount_total_krw": 24500000,
      "max_case_amount_krw": 21500000,
      "monetary_case_count": 4
    }
  ],
  "secondCommissioners": [
    {
      "name": "김일환",
      "end_date": "2026-09-20",
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2023-09-21",
      "appearances": 51,
      "term_status": "current",
      "profile_path": "../04_members/김일환.md",
      "role_current": "위원",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "763288da-610a-4a67-8bcd-614ba181566e",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2023-10-11",
      "official_term_text": "2023-09-21~2026-09-20",
      "commissioner_status": "current",
      "recommendation_route": "여당 추천"
    },
    {
      "name": "김진욱",
      "end_date": "2026-09-20",
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2023-09-21",
      "appearances": 51,
      "term_status": "current",
      "profile_path": "../04_members/김진욱.md",
      "role_current": "위원",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "517e6796-3163-4816-93e3-04e3178fa05e",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2023-10-11",
      "official_term_text": "2023-09-21~2026-09-20",
      "commissioner_status": "current",
      "recommendation_route": "여당 추천"
    },
    {
      "name": "김진환",
      "end_date": "2026-09-20",
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2023-09-21",
      "appearances": 52,
      "term_status": "current",
      "profile_path": "../04_members/김진환.md",
      "role_current": "위원",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "bc6c33e3-774f-4dfc-99d1-a1173579263f",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2023-10-11",
      "official_term_text": "2023-09-21~2026-09-20",
      "commissioner_status": "current",
      "recommendation_route": "위원장 제청"
    },
    {
      "name": "박상희",
      "end_date": "2026-09-20",
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2023-09-21",
      "appearances": 52,
      "term_status": "current",
      "profile_path": "../04_members/박상희.md",
      "role_current": "위원",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2023-10-11",
      "official_term_text": "2023-09-21~2026-09-20",
      "commissioner_status": "current",
      "recommendation_route": "야당 추천"
    },
    {
      "name": "윤영미",
      "end_date": "2026-09-20",
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2023-09-21",
      "appearances": 52,
      "term_status": "current",
      "profile_path": "../04_members/윤영미.md",
      "role_current": "위원",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "da4b8d3f-9c19-4634-b897-faabeccc29cc",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2023-10-11",
      "official_term_text": "2023-09-21~2026-09-20",
      "commissioner_status": "current",
      "recommendation_route": "야당 추천"
    },
    {
      "name": "이문한",
      "end_date": null,
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2024-03-11",
      "appearances": 41,
      "term_status": "current",
      "profile_path": "../04_members/이문한.md",
      "role_current": "위원",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "af447476-ec6e-46c3-b2f8-1757070b8745",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2024-03-13",
      "official_term_text": "2024-03-11~확인 필요",
      "commissioner_status": "current",
      "recommendation_route": "야당 추천"
    },
    {
      "name": "김휘강",
      "end_date": null,
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2025-03-14",
      "appearances": 19,
      "term_status": "current",
      "profile_path": "../04_members/김휘강.md",
      "role_current": "위원",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "4e7a20b5-56dd-4135-8122-4eb6f15b1264",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2025-03-26",
      "official_term_text": "2025-03-14~확인 필요",
      "commissioner_status": "current",
      "recommendation_route": "조소영 후임, 위원장 제청 계열 추정"
    },
    {
      "name": "송경희",
      "end_date": null,
      "term_role": "위원장",
      "generation": "2기",
      "start_date": "2025-10-22",
      "appearances": 6,
      "term_status": "current",
      "profile_path": "../04_members/송경희.md",
      "role_current": "위원장",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "ba4a4021-4607-49f4-af9d-cdbc1f30cf15",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2025-10-22",
      "official_term_text": "2025-10~현재",
      "commissioner_status": "current",
      "recommendation_route": "상임위원 임명"
    },
    {
      "name": "이정렬",
      "end_date": null,
      "term_role": "부위원장",
      "generation": "2기",
      "start_date": "2025-11-20",
      "appearances": 7,
      "term_status": "current",
      "profile_path": "../04_members/이정렬.md",
      "role_current": "부위원장",
      "display_status": "현직",
      "background_axis": null,
      "commissioner_id": "6b2db646-6f9f-4e93-a793-c8aa3807b47d",
      "appointment_route": null,
      "minutes_last_seen": "2026-03-25",
      "minutes_first_seen": "2025-11-20",
      "official_term_text": "2025-11~현재",
      "commissioner_status": "current",
      "recommendation_route": "상임위원 임명"
    },
    {
      "name": "조소영",
      "end_date": null,
      "term_role": "위원",
      "generation": "2기",
      "start_date": "2023-09-21",
      "appearances": 25,
      "term_status": "former",
      "profile_path": "../04_members/조소영.md",
      "role_current": "위원",
      "display_status": "전직/교체",
      "background_axis": null,
      "commissioner_id": "0b107f34-dc20-42be-ab52-aeea5a250681",
      "appointment_route": null,
      "minutes_last_seen": "2024-11-27",
      "minutes_first_seen": "2023-10-11",
      "official_term_text": "2023-09-21~중도 사퇴",
      "commissioner_status": "former",
      "recommendation_route": "위원장 제청"
    }
  ],
  "commissionerActivity": [
    {
      "name": "고학수",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 1453,
          "average_confidence": 0.5414
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 565,
          "average_confidence": 0.55
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 395,
          "average_confidence": 0.5638
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 262,
          "average_confidence": 0.5496
        },
        {
          "tag_key": "ai_data_governance",
          "tag_label": "AI·데이터 활용 거버넌스",
          "tag_category": "technology_policy",
          "utterance_count": 260,
          "average_confidence": 0.5607
        }
      ],
      "case_count": 85,
      "agenda_count": 135,
      "profile_path": "../04_members/고학수.md",
      "role_current": "위원장",
      "meeting_count": 51,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\고학수_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
      "total_utterances": 2026,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2025-09-24",
      "case_utterance_count": 481,
      "first_utterance_date": "2022-10-19",
      "agenda_utterance_count": 1768
    },
    {
      "name": "윤종인",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 833,
          "average_confidence": 0.5453
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 494,
          "average_confidence": 0.5452
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 295,
          "average_confidence": 0.563
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 223,
          "average_confidence": 0.5753
        },
        {
          "tag_key": "ai_data_governance",
          "tag_label": "AI·데이터 활용 거버넌스",
          "tag_category": "technology_policy",
          "utterance_count": 170,
          "average_confidence": 0.5446
        }
      ],
      "case_count": 10,
      "agenda_count": 113,
      "profile_path": "../04_members/윤종인.md",
      "role_current": "위원장",
      "meeting_count": 45,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\윤종인_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
      "total_utterances": 1481,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2022-09-28",
      "case_utterance_count": 101,
      "first_utterance_date": "2020-08-05",
      "agenda_utterance_count": 1155
    },
    {
      "name": "박상희",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 634,
          "average_confidence": 0.5383
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 232,
          "average_confidence": 0.5564
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 217,
          "average_confidence": 0.558
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 180,
          "average_confidence": 0.5349
        },
        {
          "tag_key": "ai_data_governance",
          "tag_label": "AI·데이터 활용 거버넌스",
          "tag_category": "technology_policy",
          "utterance_count": 164,
          "average_confidence": 0.57
        }
      ],
      "case_count": 53,
      "agenda_count": 96,
      "profile_path": "../04_members/박상희.md",
      "role_current": "위원",
      "meeting_count": 52,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\박상희_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
      "total_utterances": 907,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-25",
      "case_utterance_count": 263,
      "first_utterance_date": "2020-08-26",
      "agenda_utterance_count": 851
    },
    {
      "name": "김진환",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 567,
          "average_confidence": 0.5635
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 186,
          "average_confidence": 0.5468
        },
        {
          "tag_key": "technical_security",
          "tag_label": "기술·보안 통제 점검",
          "tag_category": "issue_focus",
          "utterance_count": 182,
          "average_confidence": 0.5644
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 171,
          "average_confidence": 0.5506
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 167,
          "average_confidence": 0.564
        }
      ],
      "case_count": 39,
      "agenda_count": 76,
      "profile_path": "../04_members/김진환.md",
      "role_current": "위원",
      "meeting_count": 47,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\김진환_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "bc6c33e3-774f-4dfc-99d1-a1173579263f",
      "total_utterances": 717,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-11",
      "case_utterance_count": 169,
      "first_utterance_date": "2023-10-11",
      "agenda_utterance_count": 629
    },
    {
      "name": "염흥열",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 466,
          "average_confidence": 0.5586
        },
        {
          "tag_key": "technical_security",
          "tag_label": "기술·보안 통제 점검",
          "tag_category": "issue_focus",
          "utterance_count": 197,
          "average_confidence": 0.582
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 188,
          "average_confidence": 0.5513
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 152,
          "average_confidence": 0.5689
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 120,
          "average_confidence": 0.5784
        }
      ],
      "case_count": 47,
      "agenda_count": 118,
      "profile_path": "../04_members/염흥열.md",
      "role_current": "위원",
      "meeting_count": 59,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\염흥열_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "a5eecd57-2c57-4ca6-beea-14b9b1428b0a",
      "total_utterances": 576,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2023-07-26",
      "case_utterance_count": 92,
      "first_utterance_date": "2020-08-05",
      "agenda_utterance_count": 541
    },
    {
      "name": "김진욱",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 370,
          "average_confidence": 0.5469
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 208,
          "average_confidence": 0.5577
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 155,
          "average_confidence": 0.5543
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 133,
          "average_confidence": 0.5462
        },
        {
          "tag_key": "ai_data_governance",
          "tag_label": "AI·데이터 활용 거버넌스",
          "tag_category": "technology_policy",
          "utterance_count": 131,
          "average_confidence": 0.577
        }
      ],
      "case_count": 35,
      "agenda_count": 82,
      "profile_path": "../04_members/김진욱.md",
      "role_current": "위원",
      "meeting_count": 49,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\김진욱_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "517e6796-3163-4816-93e3-04e3178fa05e",
      "total_utterances": 553,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-25",
      "case_utterance_count": 134,
      "first_utterance_date": "2023-10-11",
      "agenda_utterance_count": 494
    },
    {
      "name": "이희정",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 463,
          "average_confidence": 0.5589
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 184,
          "average_confidence": 0.5517
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 149,
          "average_confidence": 0.5974
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 148,
          "average_confidence": 0.5549
        },
        {
          "tag_key": "technical_security",
          "tag_label": "기술·보안 통제 점검",
          "tag_category": "issue_focus",
          "utterance_count": 141,
          "average_confidence": 0.565
        }
      ],
      "case_count": 37,
      "agenda_count": 106,
      "profile_path": "../04_members/이희정.md",
      "role_current": "위원",
      "meeting_count": 53,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\이희정_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "fcb01b4e-6e0a-4302-893a-b29aff094ba8",
      "total_utterances": 542,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2023-07-26",
      "case_utterance_count": 101,
      "first_utterance_date": "2020-08-05",
      "agenda_utterance_count": 508
    },
    {
      "name": "윤영미",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 379,
          "average_confidence": 0.5389
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 136,
          "average_confidence": 0.5388
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 131,
          "average_confidence": 0.5554
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 103,
          "average_confidence": 0.5584
        },
        {
          "tag_key": "technical_security",
          "tag_label": "기술·보안 통제 점검",
          "tag_category": "issue_focus",
          "utterance_count": 92,
          "average_confidence": 0.5665
        }
      ],
      "case_count": 49,
      "agenda_count": 83,
      "profile_path": "../04_members/윤영미.md",
      "role_current": "위원",
      "meeting_count": 50,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\윤영미_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "da4b8d3f-9c19-4634-b897-faabeccc29cc",
      "total_utterances": 508,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-11",
      "case_utterance_count": 150,
      "first_utterance_date": "2023-10-11",
      "agenda_utterance_count": 469
    },
    {
      "name": "최장혁",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 348,
          "average_confidence": 0.5389
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 133,
          "average_confidence": 0.5739
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 124,
          "average_confidence": 0.5539
        },
        {
          "tag_key": "public_sector_accountability",
          "tag_label": "공공부문 책임성 강조",
          "tag_category": "sector_focus",
          "utterance_count": 98,
          "average_confidence": 0.5929
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 81,
          "average_confidence": 0.5448
        }
      ],
      "case_count": 43,
      "agenda_count": 62,
      "profile_path": "../04_members/최장혁.md",
      "role_current": "부위원장",
      "meeting_count": 41,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\최장혁_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "f107e949-a411-48fb-870e-e7c3994c126b",
      "total_utterances": 503,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2025-08-27",
      "case_utterance_count": 149,
      "first_utterance_date": "2022-06-22",
      "agenda_utterance_count": 417
    },
    {
      "name": "김일환",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 286,
          "average_confidence": 0.5468
        },
        {
          "tag_key": "ai_data_governance",
          "tag_label": "AI·데이터 활용 거버넌스",
          "tag_category": "technology_policy",
          "utterance_count": 139,
          "average_confidence": 0.5617
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 132,
          "average_confidence": 0.5568
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 111,
          "average_confidence": 0.5322
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 74,
          "average_confidence": 0.5376
        }
      ],
      "case_count": 29,
      "agenda_count": 54,
      "profile_path": "../04_members/김일환.md",
      "role_current": "위원",
      "meeting_count": 36,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\김일환_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "763288da-610a-4a67-8bcd-614ba181566e",
      "total_utterances": 439,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-11",
      "case_utterance_count": 107,
      "first_utterance_date": "2023-10-11",
      "agenda_utterance_count": 422
    },
    {
      "name": "강정화",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 201,
          "average_confidence": 0.5523
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 93,
          "average_confidence": 0.5601
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 84,
          "average_confidence": 0.5433
        },
        {
          "tag_key": "data_subject_rights",
          "tag_label": "정보주체 권리·피해 관점",
          "tag_category": "rights_focus",
          "utterance_count": 74,
          "average_confidence": 0.5559
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 64,
          "average_confidence": 0.5425
        }
      ],
      "case_count": 31,
      "agenda_count": 68,
      "profile_path": "../04_members/강정화.md",
      "role_current": "위원",
      "meeting_count": 45,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\강정화_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "08109637-266b-42b0-b010-0b6d90defbed",
      "total_utterances": 282,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2023-07-26",
      "case_utterance_count": 47,
      "first_utterance_date": "2020-08-05",
      "agenda_utterance_count": 267
    },
    {
      "name": "백대용",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 207,
          "average_confidence": 0.5516
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 83,
          "average_confidence": 0.5589
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 65,
          "average_confidence": 0.5977
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 59,
          "average_confidence": 0.5734
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 47,
          "average_confidence": 0.5436
        }
      ],
      "case_count": 25,
      "agenda_count": 51,
      "profile_path": "../04_members/백대용.md",
      "role_current": "위원",
      "meeting_count": 45,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\백대용_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "95f526ee-b27b-4000-a2ae-7858ea8372c1",
      "total_utterances": 258,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2023-07-26",
      "case_utterance_count": 31,
      "first_utterance_date": "2020-08-05",
      "agenda_utterance_count": 232
    },
    {
      "name": "지성우",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 198,
          "average_confidence": 0.5535
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 74,
          "average_confidence": 0.5559
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 69,
          "average_confidence": 0.5752
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 68,
          "average_confidence": 0.5524
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 53,
          "average_confidence": 0.5511
        }
      ],
      "case_count": 39,
      "agenda_count": 73,
      "profile_path": "../04_members/지성우.md",
      "role_current": "위원",
      "meeting_count": 50,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\지성우_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "0130b390-a55e-4748-be57-f8237b415edb",
      "total_utterances": 242,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2023-07-26",
      "case_utterance_count": 53,
      "first_utterance_date": "2020-08-05",
      "agenda_utterance_count": 236
    },
    {
      "name": "이정렬",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 168,
          "average_confidence": 0.571
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 79,
          "average_confidence": 0.6147
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 70,
          "average_confidence": 0.5611
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 70,
          "average_confidence": 0.5669
        },
        {
          "tag_key": "public_sector_accountability",
          "tag_label": "공공부문 책임성 강조",
          "tag_category": "sector_focus",
          "utterance_count": 58,
          "average_confidence": 0.6117
        }
      ],
      "case_count": 11,
      "agenda_count": 46,
      "profile_path": "../04_members/이정렬.md",
      "role_current": "부위원장",
      "meeting_count": 33,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\이정렬_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "6b2db646-6f9f-4e93-a793-c8aa3807b47d",
      "total_utterances": 231,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-11",
      "case_utterance_count": 28,
      "first_utterance_date": "2021-01-27",
      "agenda_utterance_count": 222
    },
    {
      "name": "송경희",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 157,
          "average_confidence": 0.5397
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 63,
          "average_confidence": 0.5465
        },
        {
          "tag_key": "public_sector_accountability",
          "tag_label": "공공부문 책임성 강조",
          "tag_category": "sector_focus",
          "utterance_count": 36,
          "average_confidence": 0.5825
        },
        {
          "tag_key": "technical_security",
          "tag_label": "기술·보안 통제 점검",
          "tag_category": "issue_focus",
          "utterance_count": 31,
          "average_confidence": 0.5642
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 30,
          "average_confidence": 0.5673
        }
      ],
      "case_count": 6,
      "agenda_count": 18,
      "profile_path": "../04_members/송경희.md",
      "role_current": "위원장",
      "meeting_count": 6,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\송경희_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "ba4a4021-4607-49f4-af9d-cdbc1f30cf15",
      "total_utterances": 219,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-25",
      "case_utterance_count": 59,
      "first_utterance_date": "2025-10-22",
      "agenda_utterance_count": 193
    },
    {
      "name": "최영진",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 117,
          "average_confidence": 0.553
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 45,
          "average_confidence": 0.5478
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 41,
          "average_confidence": 0.5651
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 37,
          "average_confidence": 0.5789
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 29,
          "average_confidence": 0.5631
        }
      ],
      "case_count": 4,
      "agenda_count": 37,
      "profile_path": "../04_members/최영진.md",
      "role_current": "부위원장",
      "meeting_count": 28,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\최영진_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "2608a597-3690-493f-8250-e7639bddf3cc",
      "total_utterances": 158,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2022-06-22",
      "case_utterance_count": 25,
      "first_utterance_date": "2020-08-26",
      "agenda_utterance_count": 143
    },
    {
      "name": "고성학",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 115,
          "average_confidence": 0.5523
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 38,
          "average_confidence": 0.5826
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 31,
          "average_confidence": 0.5506
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 27,
          "average_confidence": 0.5833
        },
        {
          "tag_key": "data_subject_rights",
          "tag_label": "정보주체 권리·피해 관점",
          "tag_category": "rights_focus",
          "utterance_count": 25,
          "average_confidence": 0.5524
        }
      ],
      "case_count": 21,
      "agenda_count": 36,
      "profile_path": "../04_members/고성학.md",
      "role_current": "위원",
      "meeting_count": 32,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\고성학_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "c9c7032c-df1d-47ea-8622-eaf1ac1f76b9",
      "total_utterances": 130,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2023-07-26",
      "case_utterance_count": 24,
      "first_utterance_date": "2020-08-26",
      "agenda_utterance_count": 128
    },
    {
      "name": "조소영",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 80,
          "average_confidence": 0.54
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 30,
          "average_confidence": 0.5513
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 27,
          "average_confidence": 0.5389
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 24,
          "average_confidence": 0.56
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 21,
          "average_confidence": 0.6024
        }
      ],
      "case_count": 12,
      "agenda_count": 26,
      "profile_path": "../04_members/조소영.md",
      "role_current": "위원",
      "meeting_count": 20,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\조소영_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "0b107f34-dc20-42be-ab52-aeea5a250681",
      "total_utterances": 115,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2024-11-27",
      "case_utterance_count": 15,
      "first_utterance_date": "2023-10-11",
      "agenda_utterance_count": 94
    },
    {
      "name": "이문한",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 80,
          "average_confidence": 0.539
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 33,
          "average_confidence": 0.5688
        },
        {
          "tag_key": "technical_security",
          "tag_label": "기술·보안 통제 점검",
          "tag_category": "issue_focus",
          "utterance_count": 32,
          "average_confidence": 0.5425
        },
        {
          "tag_key": "sanction_effectiveness",
          "tag_label": "처분 실효성·제재수준 점검",
          "tag_category": "sanction_orientation",
          "utterance_count": 30,
          "average_confidence": 0.5513
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 23,
          "average_confidence": 0.537
        }
      ],
      "case_count": 17,
      "agenda_count": 37,
      "profile_path": "../04_members/이문한.md",
      "role_current": "위원",
      "meeting_count": 29,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\이문한_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "af447476-ec6e-46c3-b2f8-1757070b8745",
      "total_utterances": 112,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-11",
      "case_utterance_count": 28,
      "first_utterance_date": "2024-03-27",
      "agenda_utterance_count": 95
    },
    {
      "name": "서종식",
      "status": "former",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 74,
          "average_confidence": 0.5549
        },
        {
          "tag_key": "data_subject_rights",
          "tag_label": "정보주체 권리·피해 관점",
          "tag_category": "rights_focus",
          "utterance_count": 32,
          "average_confidence": 0.5425
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 28,
          "average_confidence": 0.5443
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 24,
          "average_confidence": 0.5567
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 20,
          "average_confidence": 0.618
        }
      ],
      "case_count": 9,
      "agenda_count": 27,
      "profile_path": "../04_members/서종식.md",
      "role_current": "위원",
      "meeting_count": 26,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\서종식_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "6f6ec14b-28bb-4e3a-b41b-507855b858dc",
      "total_utterances": 97,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2023-07-12",
      "case_utterance_count": 26,
      "first_utterance_date": "2020-08-26",
      "agenda_utterance_count": 90
    },
    {
      "name": "김휘강",
      "status": "current",
      "top_tags": [
        {
          "tag_key": "procedure_legal_reasoning",
          "tag_label": "절차·법리·근거 검토",
          "tag_category": "legal_reasoning",
          "utterance_count": 67,
          "average_confidence": 0.5503
        },
        {
          "tag_key": "technical_security",
          "tag_label": "기술·보안 통제 점검",
          "tag_category": "issue_focus",
          "utterance_count": 47,
          "average_confidence": 0.6117
        },
        {
          "tag_key": "business_burden_context",
          "tag_label": "사업자 부담·산업 맥락 고려",
          "tag_category": "market_context",
          "utterance_count": 32,
          "average_confidence": 0.55
        },
        {
          "tag_key": "evidence_fact_clarification",
          "tag_label": "사실관계·증거 확인",
          "tag_category": "deliberation_style",
          "utterance_count": 28,
          "average_confidence": 0.5643
        },
        {
          "tag_key": "remedial_prevention",
          "tag_label": "재발방지·개선·예방 지향",
          "tag_category": "remedy_orientation",
          "utterance_count": 28,
          "average_confidence": 0.5557
        }
      ],
      "case_count": 16,
      "agenda_count": 24,
      "profile_path": "../04_members/김휘강.md",
      "role_current": "위원",
      "meeting_count": 15,
      "sample_md_path": "pipc_knowledge_base\\04_members\\speech_profiles\\김휘강_speech_profile.md",
      "background_axis": null,
      "commissioner_id": "4e7a20b5-56dd-4135-8122-4eb6f15b1264",
      "total_utterances": 82,
      "extraction_status": "auto_aggregated_rule_based",
      "source_confidence": 0.68,
      "last_utterance_date": "2026-03-25",
      "case_utterance_count": 46,
      "first_utterance_date": "2025-03-26",
      "agenda_utterance_count": 79
    }
  ],
  "issueTagDistribution": [
    {
      "tag_key": "procedure_legal_reasoning",
      "tag_label": "절차·법리·근거 검토",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "legal_reasoning",
      "utterance_total": 7263,
      "top_commissioners": [
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 1453,
          "average_confidence": 0.5414
        },
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 833,
          "average_confidence": 0.5453
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 634,
          "average_confidence": 0.5383
        },
        {
          "name": "김진환",
          "commissioner_id": "bc6c33e3-774f-4dfc-99d1-a1173579263f",
          "utterance_count": 567,
          "average_confidence": 0.5635
        },
        {
          "name": "염흥열",
          "commissioner_id": "a5eecd57-2c57-4ca6-beea-14b9b1428b0a",
          "utterance_count": 466,
          "average_confidence": 0.5586
        }
      ],
      "average_confidence": 0.5493,
      "commissioner_count": 21
    },
    {
      "tag_key": "evidence_fact_clarification",
      "tag_label": "사실관계·증거 확인",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "deliberation_style",
      "utterance_total": 2827,
      "top_commissioners": [
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 565,
          "average_confidence": 0.55
        },
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 494,
          "average_confidence": 0.5452
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 217,
          "average_confidence": 0.558
        },
        {
          "name": "염흥열",
          "commissioner_id": "a5eecd57-2c57-4ca6-beea-14b9b1428b0a",
          "utterance_count": 188,
          "average_confidence": 0.5513
        },
        {
          "name": "이희정",
          "commissioner_id": "fcb01b4e-6e0a-4302-893a-b29aff094ba8",
          "utterance_count": 184,
          "average_confidence": 0.5517
        }
      ],
      "average_confidence": 0.5511,
      "commissioner_count": 21
    },
    {
      "tag_key": "remedial_prevention",
      "tag_label": "재발방지·개선·예방 지향",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "remedy_orientation",
      "utterance_total": 2400,
      "top_commissioners": [
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 395,
          "average_confidence": 0.5638
        },
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 295,
          "average_confidence": 0.563
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 232,
          "average_confidence": 0.5564
        },
        {
          "name": "김진환",
          "commissioner_id": "bc6c33e3-774f-4dfc-99d1-a1173579263f",
          "utterance_count": 167,
          "average_confidence": 0.564
        },
        {
          "name": "김진욱",
          "commissioner_id": "517e6796-3163-4816-93e3-04e3178fa05e",
          "utterance_count": 155,
          "average_confidence": 0.5543
        }
      ],
      "average_confidence": 0.5675,
      "commissioner_count": 21
    },
    {
      "tag_key": "business_burden_context",
      "tag_label": "사업자 부담·산업 맥락 고려",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "market_context",
      "utterance_total": 1922,
      "top_commissioners": [
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 262,
          "average_confidence": 0.5496
        },
        {
          "name": "김진욱",
          "commissioner_id": "517e6796-3163-4816-93e3-04e3178fa05e",
          "utterance_count": 208,
          "average_confidence": 0.5577
        },
        {
          "name": "김진환",
          "commissioner_id": "bc6c33e3-774f-4dfc-99d1-a1173579263f",
          "utterance_count": 186,
          "average_confidence": 0.5468
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 180,
          "average_confidence": 0.5349
        },
        {
          "name": "윤영미",
          "commissioner_id": "da4b8d3f-9c19-4634-b897-faabeccc29cc",
          "utterance_count": 136,
          "average_confidence": 0.5388
        }
      ],
      "average_confidence": 0.5501,
      "commissioner_count": 21
    },
    {
      "tag_key": "sanction_effectiveness",
      "tag_label": "처분 실효성·제재수준 점검",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "sanction_orientation",
      "utterance_total": 1642,
      "top_commissioners": [
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 223,
          "average_confidence": 0.5753
        },
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 215,
          "average_confidence": 0.5815
        },
        {
          "name": "이희정",
          "commissioner_id": "fcb01b4e-6e0a-4302-893a-b29aff094ba8",
          "utterance_count": 149,
          "average_confidence": 0.5974
        },
        {
          "name": "염흥열",
          "commissioner_id": "a5eecd57-2c57-4ca6-beea-14b9b1428b0a",
          "utterance_count": 120,
          "average_confidence": 0.5784
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 112,
          "average_confidence": 0.5614
        }
      ],
      "average_confidence": 0.5777,
      "commissioner_count": 21
    },
    {
      "tag_key": "technical_security",
      "tag_label": "기술·보안 통제 점검",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "issue_focus",
      "utterance_total": 1539,
      "top_commissioners": [
        {
          "name": "염흥열",
          "commissioner_id": "a5eecd57-2c57-4ca6-beea-14b9b1428b0a",
          "utterance_count": 197,
          "average_confidence": 0.582
        },
        {
          "name": "김진환",
          "commissioner_id": "bc6c33e3-774f-4dfc-99d1-a1173579263f",
          "utterance_count": 182,
          "average_confidence": 0.5644
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 149,
          "average_confidence": 0.5493
        },
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 147,
          "average_confidence": 0.5919
        },
        {
          "name": "이희정",
          "commissioner_id": "fcb01b4e-6e0a-4302-893a-b29aff094ba8",
          "utterance_count": 141,
          "average_confidence": 0.565
        }
      ],
      "average_confidence": 0.5622,
      "commissioner_count": 21
    },
    {
      "tag_key": "ai_data_governance",
      "tag_label": "AI·데이터 활용 거버넌스",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "technology_policy",
      "utterance_total": 1465,
      "top_commissioners": [
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 260,
          "average_confidence": 0.5607
        },
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 170,
          "average_confidence": 0.5446
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 164,
          "average_confidence": 0.57
        },
        {
          "name": "김일환",
          "commissioner_id": "763288da-610a-4a67-8bcd-614ba181566e",
          "utterance_count": 139,
          "average_confidence": 0.5617
        },
        {
          "name": "김진욱",
          "commissioner_id": "517e6796-3163-4816-93e3-04e3178fa05e",
          "utterance_count": 131,
          "average_confidence": 0.577
        }
      ],
      "average_confidence": 0.5562,
      "commissioner_count": 21
    },
    {
      "tag_key": "data_subject_rights",
      "tag_label": "정보주체 권리·피해 관점",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "rights_focus",
      "utterance_total": 1289,
      "top_commissioners": [
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 148,
          "average_confidence": 0.5761
        },
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 140,
          "average_confidence": 0.5486
        },
        {
          "name": "이희정",
          "commissioner_id": "fcb01b4e-6e0a-4302-893a-b29aff094ba8",
          "utterance_count": 124,
          "average_confidence": 0.5545
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 108,
          "average_confidence": 0.5426
        },
        {
          "name": "염흥열",
          "commissioner_id": "a5eecd57-2c57-4ca6-beea-14b9b1428b0a",
          "utterance_count": 102,
          "average_confidence": 0.5575
        }
      ],
      "average_confidence": 0.5509,
      "commissioner_count": 21
    },
    {
      "tag_key": "public_sector_accountability",
      "tag_label": "공공부문 책임성 강조",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "sector_focus",
      "utterance_total": 1287,
      "top_commissioners": [
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 186,
          "average_confidence": 0.5979
        },
        {
          "name": "박상희",
          "commissioner_id": "f06d2965-15ee-473e-9cac-ad98574d49af",
          "utterance_count": 160,
          "average_confidence": 0.584
        },
        {
          "name": "김진환",
          "commissioner_id": "bc6c33e3-774f-4dfc-99d1-a1173579263f",
          "utterance_count": 104,
          "average_confidence": 0.5823
        },
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 101,
          "average_confidence": 0.5728
        },
        {
          "name": "최장혁",
          "commissioner_id": "f107e949-a411-48fb-870e-e7c3994c126b",
          "utterance_count": 98,
          "average_confidence": 0.5929
        }
      ],
      "average_confidence": 0.5859,
      "commissioner_count": 21
    },
    {
      "tag_key": "cross_border_global",
      "tag_label": "국외이전·글로벌 규범",
      "data_status": "auto_aggregated_rule_based",
      "tag_category": "international",
      "utterance_total": 648,
      "top_commissioners": [
        {
          "name": "윤종인",
          "commissioner_id": "d770bf77-2e11-4ed2-9dbe-2f2996eda47b",
          "utterance_count": 84,
          "average_confidence": 0.5395
        },
        {
          "name": "염흥열",
          "commissioner_id": "a5eecd57-2c57-4ca6-beea-14b9b1428b0a",
          "utterance_count": 75,
          "average_confidence": 0.546
        },
        {
          "name": "이희정",
          "commissioner_id": "fcb01b4e-6e0a-4302-893a-b29aff094ba8",
          "utterance_count": 58,
          "average_confidence": 0.5314
        },
        {
          "name": "고학수",
          "commissioner_id": "b7ef2f21-1240-4c69-b603-de1ba071143b",
          "utterance_count": 51,
          "average_confidence": 0.5629
        },
        {
          "name": "김진욱",
          "commissioner_id": "517e6796-3163-4816-93e3-04e3178fa05e",
          "utterance_count": 47,
          "average_confidence": 0.564
        }
      ],
      "average_confidence": 0.556,
      "commissioner_count": 21
    }
  ],
  "sanctionDistribution": [
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "과태료",
      "sanction_count": 400,
      "last_decision_date": "2026-03-25",
      "decision_case_count": 400,
      "first_decision_date": "2021-07-14",
      "linked_agenda_item_count": 98
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "과징금",
      "sanction_count": 154,
      "last_decision_date": "2026-03-25",
      "decision_case_count": 154,
      "first_decision_date": "2021-08-25",
      "linked_agenda_item_count": 71
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "시정명령",
      "sanction_count": 138,
      "last_decision_date": "2026-01-28",
      "decision_case_count": 138,
      "first_decision_date": "2021-07-14",
      "linked_agenda_item_count": 53
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "주의",
      "sanction_count": 129,
      "last_decision_date": "2025-12-10",
      "decision_case_count": 129,
      "first_decision_date": "2022-02-23",
      "linked_agenda_item_count": 38
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "개선권고",
      "sanction_count": 123,
      "last_decision_date": "2026-03-25",
      "decision_case_count": 123,
      "first_decision_date": "2021-01-27",
      "linked_agenda_item_count": 47
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "공표명령",
      "sanction_count": 103,
      "last_decision_date": "2026-03-25",
      "decision_case_count": 103,
      "first_decision_date": "2023-10-11",
      "linked_agenda_item_count": 41
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "고발",
      "sanction_count": 23,
      "last_decision_date": "2026-03-25",
      "decision_case_count": 23,
      "first_decision_date": "2022-02-23",
      "linked_agenda_item_count": 17
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "징계권고",
      "sanction_count": 19,
      "last_decision_date": "2026-03-25",
      "decision_case_count": 19,
      "first_decision_date": "2022-02-23",
      "linked_agenda_item_count": 13
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "경고",
      "sanction_count": 8,
      "last_decision_date": "2024-11-27",
      "decision_case_count": 8,
      "first_decision_date": "2022-02-23",
      "linked_agenda_item_count": 8
    },
    {
      "data_status": "verified_order_signal",
      "sanction_kind": "수사의뢰",
      "sanction_count": 1,
      "last_decision_date": "2024-03-27",
      "decision_case_count": 1,
      "first_decision_date": "2024-03-27",
      "linked_agenda_item_count": 1
    }
  ],
  "penaltyOutcomeSummary": [
    {
      "notes": "결정문 주문과 처분 문맥에서 최종 과징금/과태료 금액으로 분리한 값입니다.",
      "data_status": "verified_final_amount",
      "outcome_rows": 281,
      "penalty_kind": "과태료",
      "avg_amount_krw": 5569395,
      "max_amount_krw": 30000000,
      "min_amount_krw": 1000000,
      "rows_with_amount": 281,
      "total_amount_krw": 1565000000,
      "median_amount_krw": 4500000,
      "decision_case_count": 281
    },
    {
      "notes": "결정문 주문과 처분 문맥에서 최종 과징금/과태료 금액으로 분리한 값입니다.",
      "data_status": "verified_final_amount",
      "outcome_rows": 94,
      "penalty_kind": "과징금",
      "avg_amount_krw": 2963950096,
      "max_amount_krw": 134791000000,
      "min_amount_krw": 3298000,
      "rows_with_amount": 94,
      "total_amount_krw": 278611309000,
      "median_amount_krw": 96750000,
      "decision_case_count": 94
    }
  ],
  "lawArticleDistribution": [
    {
      "article_raw": "제29조",
      "data_status": "partially_mcp_verified",
      "verified_rows": 389,
      "citation_count": 423,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "개인정보 보호법 시행령",
        "개인정보 보호법 위반에 대한 과징금 부과기준",
        "개인정보 보호법 위반에 대한 과태료 부과기준",
        "개인정보보호 법규 위반에 대한 과징금 부과기준",
        "개인정보보호 법규 위반에 대한 과징금 부과기준4)",
        "중소기업기본법"
      ],
      "needs_review_rows": 19,
      "rows_with_law_name": 67,
      "decision_case_count": 356
    },
    {
      "article_raw": "제20조",
      "data_status": "mcp_verified",
      "verified_rows": 410,
      "citation_count": 410,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "질서위반행위규제법",
        "행정소송법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 48,
      "decision_case_count": 380
    },
    {
      "article_raw": "제63조",
      "data_status": "partially_mcp_verified",
      "verified_rows": 313,
      "citation_count": 363,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "개인정보 보호법 위반에 대한 과태료 부과기준",
        "개인정보 보호법 위반에 대한 과태료 부과기준(2021. 1. 27. 개인정보보호위원회 의결, 이하 ‘과태료 부과기준’이라 한다)",
        "개인정보 보호법 위반에 대한 과태료 부과기준(개인정보위 지침, ’23.9.15.시행)",
        "질서위반행위규제법",
        "舊 개인정보 보호법 위반에 대한 과태료 부과기준"
      ],
      "needs_review_rows": 49,
      "rows_with_law_name": 56,
      "decision_case_count": 312
    },
    {
      "article_raw": "제75조",
      "data_status": "mcp_verified",
      "verified_rows": 336,
      "citation_count": 336,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 18,
      "decision_case_count": 319
    },
    {
      "article_raw": "제20조제2항",
      "data_status": "mcp_verified",
      "verified_rows": 323,
      "citation_count": 323,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "질서위반행위규제법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 36,
      "decision_case_count": 323
    },
    {
      "article_raw": "제8조",
      "data_status": "partially_mcp_verified",
      "verified_rows": 224,
      "citation_count": 272,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법 위반에 대한 공표 및 공표명령 지침",
        "개인정보 보호법 위반에 대한 과태료 부과기준",
        "개인정보보호법 위반에 대한 과태료 부과기준",
        "장애인등에 대한 특수교육법",
        "舊 개인정보 보호법 위반에 대한 과태료 부과기준",
        "舊 개인정보보호법 위반에 대한 과태료 부과기준"
      ],
      "needs_review_rows": 48,
      "rows_with_law_name": 49,
      "decision_case_count": 225
    },
    {
      "article_raw": "제27조",
      "data_status": "mcp_verified",
      "verified_rows": 263,
      "citation_count": 263,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "행정심판법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 13,
      "decision_case_count": 263
    },
    {
      "article_raw": "제7조",
      "data_status": "mcp_verified",
      "verified_rows": 225,
      "citation_count": 225,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "중소기업기본법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 3,
      "decision_case_count": 222
    },
    {
      "article_raw": "제2조제5호",
      "data_status": "partially_mcp_verified",
      "verified_rows": 188,
      "citation_count": 189,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "| 지방자치법",
        "개인정보 보호법",
        "개인정보보호법",
        "민법",
        "지방자치법",
        "한국연구재단법",
        "舊 개인정보 보호법",
        "舊개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 151,
      "decision_case_count": 189
    },
    {
      "article_raw": "제24조제3항",
      "data_status": "partially_mcp_verified",
      "verified_rows": 184,
      "citation_count": 186,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "개인정보 보호법 위반에 대한 과징금 부과기준",
        "중소기업기본법"
      ],
      "needs_review_rows": 2,
      "rows_with_law_name": 3,
      "decision_case_count": 183
    },
    {
      "article_raw": "제2조",
      "data_status": "partially_mcp_verified",
      "verified_rows": 174,
      "citation_count": 175,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "개인정보 보호법 시행령",
        "개인정보 보호법 위반에 대한 공표 및 공표명령 지침(’23.10.11. 시행)",
        "중소기업 기본법",
        "중소기업기 본법",
        "중소기업기본법"
      ],
      "needs_review_rows": 1,
      "rows_with_law_name": 77,
      "decision_case_count": 165
    },
    {
      "article_raw": "제30조제1항",
      "data_status": "mcp_verified",
      "verified_rows": 156,
      "citation_count": 156,
      "pending_mcp_rows": 0,
      "sample_law_names": [],
      "needs_review_rows": 0,
      "rows_with_law_name": 0,
      "decision_case_count": 156
    },
    {
      "article_raw": "제66조",
      "data_status": "mcp_verified",
      "verified_rows": 154,
      "citation_count": 154,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 2,
      "decision_case_count": 153
    },
    {
      "article_raw": "제75조제2항제6호",
      "data_status": "mcp_verified",
      "verified_rows": 153,
      "citation_count": 153,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 5,
      "decision_case_count": 152
    },
    {
      "article_raw": "제23조제2항",
      "data_status": "mcp_verified",
      "verified_rows": 152,
      "citation_count": 152,
      "pending_mcp_rows": 0,
      "sample_law_names": [],
      "needs_review_rows": 0,
      "rows_with_law_name": 0,
      "decision_case_count": 152
    },
    {
      "article_raw": "제5조",
      "data_status": "partially_mcp_verified",
      "verified_rows": 142,
      "citation_count": 148,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법 위반에 대한 공표 및 공표명령 지침",
        "개인정보 보호법 위반에 대한 공표 및 공표명령 지침(2023.10.11. 시행)",
        "생활물류서비스산업발전법",
        "전기통신사업법"
      ],
      "needs_review_rows": 6,
      "rows_with_law_name": 8,
      "decision_case_count": 142
    },
    {
      "article_raw": "제6조",
      "data_status": "partially_mcp_verified",
      "verified_rows": 143,
      "citation_count": 147,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법 위반에 대한 공표 및 공표명령 지침(’23.10.11. 시행)",
        "개인정보 보호법 위반에 대한 과태료 부과기준(지침)",
        "개인정보보호법령 및 지침․고시 해설(이하 ‘해설서’)",
        "개인정보의 안전성 확보조치 기준(고시 제2021-2호)",
        "출입국관리법",
        "형의 실효 등에 관한 법률"
      ],
      "needs_review_rows": 2,
      "rows_with_law_name": 6,
      "decision_case_count": 144
    },
    {
      "article_raw": "제25조제6항",
      "data_status": "mcp_verified",
      "verified_rows": 146,
      "citation_count": 146,
      "pending_mcp_rows": 0,
      "sample_law_names": [],
      "needs_review_rows": 0,
      "rows_with_law_name": 0,
      "decision_case_count": 146
    },
    {
      "article_raw": "제2조제6호",
      "data_status": "partially_mcp_verified",
      "verified_rows": 145,
      "citation_count": 146,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "| 지방자치법",
        "개인정보 보호법",
        "개인정보보호법",
        "전자서명법",
        "한국연구재단법",
        "舊 개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 89,
      "decision_case_count": 143
    },
    {
      "article_raw": "제28조의4제1항",
      "data_status": "mcp_verified",
      "verified_rows": 143,
      "citation_count": 143,
      "pending_mcp_rows": 0,
      "sample_law_names": [],
      "needs_review_rows": 0,
      "rows_with_law_name": 0,
      "decision_case_count": 143
    },
    {
      "article_raw": "제66조제1항",
      "data_status": "mcp_verified",
      "verified_rows": 140,
      "citation_count": 140,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 22,
      "decision_case_count": 140
    },
    {
      "article_raw": "제64조",
      "data_status": "mcp_verified",
      "verified_rows": 139,
      "citation_count": 139,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 2,
      "decision_case_count": 139
    },
    {
      "article_raw": "제18조",
      "data_status": "partially_mcp_verified",
      "verified_rows": 120,
      "citation_count": 122,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "개인정보 보호법 및 시행령 개정사항 안내서(2023. 12. 29.)"
      ],
      "needs_review_rows": 2,
      "rows_with_law_name": 3,
      "decision_case_count": 121
    },
    {
      "article_raw": "제30조",
      "data_status": "mcp_verified",
      "verified_rows": 113,
      "citation_count": 113,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법",
        "개인정보 보호법 시행령"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 2,
      "decision_case_count": 113
    },
    {
      "article_raw": "제30조제3항",
      "data_status": "mcp_verified",
      "verified_rows": 104,
      "citation_count": 104,
      "pending_mcp_rows": 0,
      "sample_law_names": [],
      "needs_review_rows": 0,
      "rows_with_law_name": 0,
      "decision_case_count": 104
    },
    {
      "article_raw": "제8조제1항",
      "data_status": "needs_review",
      "verified_rows": 0,
      "citation_count": 92,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 92,
      "rows_with_law_name": 1,
      "decision_case_count": 91
    },
    {
      "article_raw": "제5조제3항",
      "data_status": "mcp_verified",
      "verified_rows": 89,
      "citation_count": 89,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 2,
      "decision_case_count": 87
    },
    {
      "article_raw": "제61조제2항",
      "data_status": "mcp_verified",
      "verified_rows": 83,
      "citation_count": 83,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 1,
      "decision_case_count": 82
    },
    {
      "article_raw": "제5조제1항",
      "data_status": "mcp_verified",
      "verified_rows": 76,
      "citation_count": 76,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보 보호법"
      ],
      "needs_review_rows": 0,
      "rows_with_law_name": 1,
      "decision_case_count": 75
    },
    {
      "article_raw": "제6조제3항",
      "data_status": "needs_review",
      "verified_rows": 0,
      "citation_count": 72,
      "pending_mcp_rows": 0,
      "sample_law_names": [
        "개인정보의 안전성 확보조치 기준(고시 제2021-2호)"
      ],
      "needs_review_rows": 71,
      "rows_with_law_name": 1,
      "decision_case_count": 71
    }
  ],
  "agendaCompositionYearly": [
    {
      "label": "의결",
      "ratio": 0.3846,
      "item_count": 15,
      "total_count": 39,
      "category_key": "deliberation_decision",
      "meeting_year": 2020,
      "category_type": "agenda_kind"
    },
    {
      "label": "보고",
      "ratio": 0.5641,
      "item_count": 22,
      "total_count": 39,
      "category_key": "report",
      "meeting_year": 2020,
      "category_type": "agenda_kind"
    },
    {
      "label": "미분류",
      "ratio": 0.0513,
      "item_count": 2,
      "total_count": 39,
      "category_key": "unspecified",
      "meeting_year": 2020,
      "category_type": "agenda_kind"
    },
    {
      "label": "비공개",
      "ratio": 0.2051,
      "item_count": 8,
      "total_count": 39,
      "category_key": "private",
      "meeting_year": 2020,
      "category_type": "visibility"
    },
    {
      "label": "공개",
      "ratio": 0.7949,
      "item_count": 31,
      "total_count": 39,
      "category_key": "public",
      "meeting_year": 2020,
      "category_type": "visibility"
    },
    {
      "label": "의결",
      "ratio": 0.6176,
      "item_count": 42,
      "total_count": 68,
      "category_key": "deliberation_decision",
      "meeting_year": 2021,
      "category_type": "agenda_kind"
    },
    {
      "label": "보고",
      "ratio": 0.3824,
      "item_count": 26,
      "total_count": 68,
      "category_key": "report",
      "meeting_year": 2021,
      "category_type": "agenda_kind"
    },
    {
      "label": "비공개",
      "ratio": 0.25,
      "item_count": 17,
      "total_count": 68,
      "category_key": "private",
      "meeting_year": 2021,
      "category_type": "visibility"
    },
    {
      "label": "공개",
      "ratio": 0.75,
      "item_count": 51,
      "total_count": 68,
      "category_key": "public",
      "meeting_year": 2021,
      "category_type": "visibility"
    },
    {
      "label": "의결",
      "ratio": 0.7286,
      "item_count": 51,
      "total_count": 70,
      "category_key": "deliberation_decision",
      "meeting_year": 2022,
      "category_type": "agenda_kind"
    },
    {
      "label": "보고",
      "ratio": 0.2714,
      "item_count": 19,
      "total_count": 70,
      "category_key": "report",
      "meeting_year": 2022,
      "category_type": "agenda_kind"
    },
    {
      "label": "비공개",
      "ratio": 0.2,
      "item_count": 14,
      "total_count": 70,
      "category_key": "private",
      "meeting_year": 2022,
      "category_type": "visibility"
    },
    {
      "label": "공개",
      "ratio": 0.8,
      "item_count": 56,
      "total_count": 70,
      "category_key": "public",
      "meeting_year": 2022,
      "category_type": "visibility"
    },
    {
      "label": "의결",
      "ratio": 0.7212,
      "item_count": 75,
      "total_count": 104,
      "category_key": "deliberation_decision",
      "meeting_year": 2023,
      "category_type": "agenda_kind"
    },
    {
      "label": "보고",
      "ratio": 0.2788,
      "item_count": 29,
      "total_count": 104,
      "category_key": "report",
      "meeting_year": 2023,
      "category_type": "agenda_kind"
    },
    {
      "label": "비공개",
      "ratio": 0.2212,
      "item_count": 23,
      "total_count": 104,
      "category_key": "private",
      "meeting_year": 2023,
      "category_type": "visibility"
    },
    {
      "label": "공개",
      "ratio": 0.7788,
      "item_count": 81,
      "total_count": 104,
      "category_key": "public",
      "meeting_year": 2023,
      "category_type": "visibility"
    },
    {
      "label": "의결",
      "ratio": 0.6071,
      "item_count": 51,
      "total_count": 84,
      "category_key": "deliberation_decision",
      "meeting_year": 2024,
      "category_type": "agenda_kind"
    },
    {
      "label": "보고",
      "ratio": 0.3929,
      "item_count": 33,
      "total_count": 84,
      "category_key": "report",
      "meeting_year": 2024,
      "category_type": "agenda_kind"
    },
    {
      "label": "비공개",
      "ratio": 0.4762,
      "item_count": 40,
      "total_count": 84,
      "category_key": "private",
      "meeting_year": 2024,
      "category_type": "visibility"
    },
    {
      "label": "공개",
      "ratio": 0.5238,
      "item_count": 44,
      "total_count": 84,
      "category_key": "public",
      "meeting_year": 2024,
      "category_type": "visibility"
    },
    {
      "label": "의결",
      "ratio": 0.6804,
      "item_count": 66,
      "total_count": 97,
      "category_key": "deliberation_decision",
      "meeting_year": 2025,
      "category_type": "agenda_kind"
    },
    {
      "label": "보고",
      "ratio": 0.3196,
      "item_count": 31,
      "total_count": 97,
      "category_key": "report",
      "meeting_year": 2025,
      "category_type": "agenda_kind"
    },
    {
      "label": "비공개",
      "ratio": 0.4845,
      "item_count": 47,
      "total_count": 97,
      "category_key": "private",
      "meeting_year": 2025,
      "category_type": "visibility"
    },
    {
      "label": "공개",
      "ratio": 0.5155,
      "item_count": 50,
      "total_count": 97,
      "category_key": "public",
      "meeting_year": 2025,
      "category_type": "visibility"
    },
    {
      "label": "의결",
      "ratio": 0.5882,
      "item_count": 20,
      "total_count": 34,
      "category_key": "deliberation_decision",
      "meeting_year": 2026,
      "category_type": "agenda_kind"
    },
    {
      "label": "보고",
      "ratio": 0.4118,
      "item_count": 14,
      "total_count": 34,
      "category_key": "report",
      "meeting_year": 2026,
      "category_type": "agenda_kind"
    },
    {
      "label": "비공개",
      "ratio": 0.6176,
      "item_count": 21,
      "total_count": 34,
      "category_key": "private",
      "meeting_year": 2026,
      "category_type": "visibility"
    },
    {
      "label": "공개",
      "ratio": 0.3824,
      "item_count": 13,
      "total_count": 34,
      "category_key": "public",
      "meeting_year": 2026,
      "category_type": "visibility"
    }
  ],
  "lawVerificationCoverage": [
    {
      "citation_count": 1493,
      "last_basis_date": "2026-03-25",
      "first_basis_date": "2021-01-27",
      "decision_case_count": 344,
      "verification_status": "needs_review",
      "distinct_article_raw_count": 142
    },
    {
      "citation_count": 58,
      "last_basis_date": "2026-03-25",
      "first_basis_date": "2021-08-25",
      "decision_case_count": 41,
      "verification_status": "not_found",
      "distinct_article_raw_count": 28
    },
    {
      "citation_count": 8534,
      "last_basis_date": "2026-03-25",
      "first_basis_date": "2021-01-27",
      "decision_case_count": 500,
      "verification_status": "verified",
      "distinct_article_raw_count": 360
    }
  ],
  "statusResolutionSummary": [
    {
      "rows": 496,
      "status": "verified_official_agenda",
      "table_name": "agenda_items"
    },
    {
      "rows": 21,
      "status": "auto_aggregated_rule_based",
      "table_name": "commissioner_speech_aggregates"
    },
    {
      "rows": 630,
      "status": "auto_selected_rule_based",
      "table_name": "commissioner_speech_samples"
    },
    {
      "rows": 210,
      "status": "auto_aggregated_rule_based",
      "table_name": "commissioner_tendency_stats"
    },
    {
      "rows": 3,
      "status": "needs_review_source_document",
      "table_name": "decision_cases"
    },
    {
      "rows": 503,
      "status": "verified_document_case",
      "table_name": "decision_cases"
    },
    {
      "rows": 10085,
      "status": "mcp_checked",
      "table_name": "law_citations_extraction"
    },
    {
      "rows": 1493,
      "status": "needs_review",
      "table_name": "law_citations_verification"
    },
    {
      "rows": 58,
      "status": "not_found",
      "table_name": "law_citations_verification"
    },
    {
      "rows": 8534,
      "status": "verified",
      "table_name": "law_citations_verification"
    },
    {
      "rows": 598,
      "status": "excluded_context_amount",
      "table_name": "monetary_penalties"
    },
    {
      "rows": 228,
      "status": "needs_review_not_final_amount",
      "table_name": "monetary_penalties"
    },
    {
      "rows": 327,
      "status": "needs_review_role_classification",
      "table_name": "monetary_penalties"
    },
    {
      "rows": 683,
      "status": "verified_final_amount",
      "table_name": "monetary_penalties"
    },
    {
      "rows": 1098,
      "status": "verified_order_signal",
      "table_name": "sanctions"
    },
    {
      "rows": 22282,
      "status": "auto_tagged_rule_based",
      "table_name": "utterance_tendency_tags"
    },
    {
      "rows": 375,
      "status": "verified",
      "table_name": "verified_penalty_outcomes"
    }
  ]
};