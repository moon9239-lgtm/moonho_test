export const dashboardFixture = {
  generatedAt: "2026-05-05T00:00:00.000Z",
  meetingYearly: [
    { meeting_year: 2024, meeting_count: 20, agenda_count: 82 },
    { meeting_year: 2025, meeting_count: 24, agenda_count: 96 },
  ],
  overviewKpis: [
    { metric_key: "meetings", value_text: "44회", label: "전체회의 개최" },
  ],
  yearlyStats: [
    { meeting_year: 2024, meetings: 20, agenda_items: 82, decision_agendas: 50, report_agendas: 20 },
    { meeting_year: 2025, meetings: 24, agenda_items: 96, decision_agendas: 60, report_agendas: 22 },
  ],
  majorPenaltyCases: [
    { decision_date: "2025-08-27", agenda_title: "대형 유출 관련 건", amount_total_krw: 134800600000, target_name: "예시기관" },
  ],
  meetingTranscripts: [
    {
      id: "2025-24",
      meeting_date: "2025-11-26",
      meeting_year: 2025,
      meeting_number: 24,
      meeting_title: "2025년 제24회 전체회의",
      raw_md_path: "pipc_knowledge_base/99_raw/transcripts/2025/example.md",
      size_bytes: 10240,
    },
  ],
};
