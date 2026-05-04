export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(toNumber(value) * factor) / factor;
}

export function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

export function normalizeDashboardPath(value) {
  const path = normalizePath(value);
  if (!path || /^(https?:|file:|\/|\.\/|\.\.\/)/.test(path)) return path;
  return `../${path}`;
}

export function normalizeTranscriptRecord(item, index = 0) {
  const date = item.date || item.meeting_date || "";
  const year = toNumber(item.year || item.meeting_year || date.slice(0, 4));
  const meetingNo = item.meetingNo ?? item.meeting_number ?? null;
  const path = normalizeDashboardPath(item.path || item.transcript_path || item.raw_md_path || "");
  const sizeBytes = toNumber(item.size_bytes);
  return {
    id: String(item.id || item.meeting_id || `${date}-${meetingNo || index}`),
    year,
    date,
    meetingNo,
    meetingLabel: item.meetingLabel || item.meeting_label || (meetingNo ? `${year}년 제${meetingNo}회` : `${year}년`),
    title: item.title || item.transcript_title || item.meeting_title || path.split("/").pop() || "",
    path,
    sizeKb: item.sizeKb ?? item.size_kb ?? (sizeBytes ? Math.round(sizeBytes / 1024) : null),
    content: item.content || "",
  };
}

export function buildSituationBoardModel(data = {}) {
  const yearlyRows = data.yearlyStats?.length ? data.yearlyStats : data.meetingYearly || [];
  const totalMeetings = yearlyRows.reduce((sum, row) => sum + toNumber(row.meetings ?? row.meeting_count), 0);
  const totalAgendas = yearlyRows.reduce((sum, row) => sum + toNumber(row.agenda_items ?? row.agenda_count), 0);
  const meetingCards = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);

  return {
    updatedAt: data.generatedAt || "",
    kpis: {
      totalMeetings: { label: "총 회의 수", value: totalMeetings },
      totalAgendas: { label: "총 안건 수", value: totalAgendas },
      averageAgendasPerMeeting: {
        label: "회의당 평균 안건 수",
        value: totalMeetings ? round(totalAgendas / totalMeetings, 1) : 0,
      },
    },
    yearlyRows,
    meetingCards,
    signals: {
      majorPenaltyCases: data.majorPenaltyCases || [],
    },
  };
}

export function buildMeetingDetailModel(data = {}, transcriptId) {
  const transcripts = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);
  const meeting = transcriptId == null
    ? transcripts[0] || null
    : transcripts.find((item) => item.id === transcriptId) || null;
  return {
    meeting,
    transcriptText: meeting?.content || "",
    agendas: [],
    lawReferences: [],
    relatedDocuments: meeting ? [{ label: "속기록 원문", path: meeting.path }] : [],
  };
}
