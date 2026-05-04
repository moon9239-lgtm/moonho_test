import { extractLawReferences } from "./law-references.mjs";
import { buildTranscriptAnimationScenes } from "./transcript-model.mjs";

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

function overviewRow(data = {}) {
  return Array.isArray(data.overviewKpis) ? data.overviewKpis[0] || {} : {};
}

function ratio(value, total) {
  const denominator = toNumber(total);
  if (!denominator) return 0;
  return round(toNumber(value) / denominator, 4);
}

function latestYearlyRow(rows) {
  return [...rows].sort((left, right) => toNumber(right.meeting_year) - toNumber(left.meeting_year))[0] || {};
}

function makeShareRows(rows) {
  const total = rows.reduce((sum, row) => sum + toNumber(row.value), 0);
  return rows.map((row) => ({ ...row, ratio: ratio(row.value, total) }));
}

export function buildSituationBoardModel(data = {}) {
  const yearlyRows = data.yearlyStats?.length ? data.yearlyStats : data.meetingYearly || [];
  const overview = overviewRow(data);
  const totalMeetings = toNumber(overview.meetings_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.meetings ?? row.meeting_count), 0);
  const totalAgendas = toNumber(overview.agenda_items_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.agenda_items ?? row.agenda_count), 0);
  const meetingCards = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);
  const decisionAgendas = toNumber(overview.decision_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.decision_agendas), 0);
  const reportAgendas = toNumber(overview.report_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.report_agendas), 0);
  const publicAgendas = toNumber(overview.public_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.public_agendas), 0);
  const privateAgendas = toNumber(overview.private_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.private_agendas), 0);
  const utterances = toNumber(overview.utterances_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.utterances), 0);
  const linkedUtterances = toNumber(overview.utterances_with_agenda);
  const latest = latestYearlyRow(yearlyRows);

  return {
    updatedAt: data.generatedAt || "",
    overview,
    kpis: {
      totalMeetings: { label: "총 회의 수", value: totalMeetings },
      totalAgendas: { label: "총 안건 수", value: totalAgendas },
      averageAgendasPerMeeting: {
        label: "회의당 평균 안건 수",
        value: totalMeetings ? round(totalAgendas / totalMeetings, 1) : 0,
      },
      decisionReportRatio: {
        label: "심의·의결 / 보고",
        value: `${decisionAgendas} / ${reportAgendas}`,
        meta: `${round(ratio(decisionAgendas, totalAgendas) * 100, 1)}% / ${round(ratio(reportAgendas, totalAgendas) * 100, 1)}%`,
      },
      utteranceCoverage: {
        label: "안건 연결 발언",
        value: linkedUtterances || utterances,
        meta: `${round(ratio(linkedUtterances || utterances, utterances) * 100, 1)}%`,
      },
      latestYear: {
        label: "최근 집계 연도",
        value: latest.meeting_year || "-",
        meta: latest.meeting_year ? `${toNumber(latest.meetings)}회 · ${toNumber(latest.agenda_items)}안건` : "",
      },
    },
    yearlyRows,
    meetingCards,
    agendaSplit: makeShareRows([
      { label: "심의·의결", value: decisionAgendas, tone: "blue" },
      { label: "보고", value: reportAgendas, tone: "lavender" },
      { label: "기타·미분류", value: Math.max(totalAgendas - decisionAgendas - reportAgendas, 0), tone: "slate" },
    ]),
    visibilitySplit: makeShareRows([
      { label: "공개", value: publicAgendas, tone: "blue" },
      { label: "비공개", value: privateAgendas, tone: "coral" },
    ]),
    topicDistribution: Array.isArray(data.topicDistribution) ? data.topicDistribution.slice(0, 8) : [],
    issueTagYearly: Array.isArray(data.issueTagYearly) ? data.issueTagYearly : [],
    dataQuality: Array.isArray(data.dataQuality) ? data.dataQuality : [],
    sanctions: Array.isArray(data.sanctionDistribution) ? data.sanctionDistribution.slice(0, 6) : [],
    lawCoverage: Array.isArray(data.lawVerificationCoverage) ? data.lawVerificationCoverage : [],
    monthlyRows: Array.isArray(data.meetingYearMonth) ? data.meetingYearMonth : [],
    signals: {
      majorPenaltyCases: data.majorPenaltyCases || [],
    },
  };
}

function findEmbeddedDetail(detailIndex = {}, meetingId) {
  const meetings = detailIndex.meetings || detailIndex;
  return meetings?.[meetingId] || null;
}

export function buildMeetingDetailModel(data = {}, transcriptId, options = {}) {
  const transcripts = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);
  const meeting = transcriptId == null
    ? transcripts[0] || null
    : transcripts.find((item) => item.id === transcriptId) || null;
  const embedded = meeting ? findEmbeddedDetail(options.detailIndex, meeting.id) : null;
  const transcriptText = embedded?.transcriptText || meeting?.content || options.transcriptText || "";
  const lawReferences = embedded?.lawReferences || extractLawReferences(transcriptText).map((ref) => ({
    ...ref,
    meetingDate: meeting?.date || "",
  }));

  return {
    meeting,
    overview: embedded?.overview || null,
    transcriptText,
    utterances: embedded?.utterances || [],
    sections: embedded?.sections || [],
    agendas: embedded?.agendas || [],
    lawReferences,
    animationScenes: embedded ? buildTranscriptAnimationScenes(embedded) : [],
    relatedDocuments: meeting ? [{ label: "속기록 원문", path: meeting.path }] : [],
  };
}
