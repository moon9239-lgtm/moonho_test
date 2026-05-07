import { buildLawLookupRequest, extractLawReferences } from "./law-references.mjs";
import { attachAgendaIds, deriveAgendaSegments } from "./transcript-model.mjs";

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
  const meetingTitle = item.meetingTitle || item.meeting_title || "";
  const path = normalizeDashboardPath(item.path || item.transcript_path || item.raw_md_path || "");
  const sizeBytes = toNumber(item.size_bytes);
  return {
    id: String(item.id || item.meeting_id || `${date}-${meetingNo || index}`),
    year,
    date,
    meetingNo,
    meetingLabel: item.meetingLabel || item.meeting_label || meetingTitle || (meetingNo ? `${year}년 제${meetingNo}회` : `${year}년`),
    title: item.title || item.transcript_title || meetingTitle || path.split("/").pop() || "",
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

function makeShareRows(rows) {
  const total = rows.reduce((sum, row) => sum + toNumber(row.value), 0);
  return rows.map((row) => ({ ...row, ratio: ratio(row.value, total) }));
}

export function buildSituationBoardModel(data = {}, analysisIndex = {}) {
  const yearlyRows = data.yearlyStats?.length ? data.yearlyStats : data.meetingYearly || [];
  const overview = overviewRow(data);
  const totalMeetings = toNumber(overview.meetings_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.meetings ?? row.meeting_count), 0);
  const totalAgendas = toNumber(overview.agenda_items_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.agenda_items ?? row.agenda_count), 0);
  const meetingCards = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);
  const decisionAgendas = toNumber(overview.decision_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.decision_agendas), 0);
  const reportAgendas = toNumber(overview.report_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.report_agendas), 0);
  const publicAgendas = toNumber(overview.public_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.public_agendas), 0);
  const privateAgendas = toNumber(overview.private_agendas_total) || yearlyRows.reduce((sum, row) => sum + toNumber(row.private_agendas), 0);
  const analysisTotals = analysisIndex.totals || {};
  const quarterlyStats = Array.isArray(analysisIndex.quarterlyStats) ? analysisIndex.quarterlyStats : [];

  return {
    updatedAt: analysisIndex.generatedAt || data.generatedAt || "",
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
    },
    yearlyRows,
    quarterlyStats,
    globalStats: analysisIndex.globalStats || {},
    analysisTotals,
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
    lawCoverage: Array.isArray(data.lawVerificationCoverage) ? data.lawVerificationCoverage : [],
    monthlyRows: Array.isArray(data.meetingYearMonth) ? data.meetingYearMonth : [],
  };
}

function findEmbeddedDetail(detailIndex = {}, meetingId) {
  const meetings = detailIndex.meetings || detailIndex;
  return meetings?.[meetingId] || null;
}

function isProceduralSection(title = "") {
  return /(개회|폐회|국민의례|성원보고|회의록|속기록|안건현황|공개여부|차기 회의|일정)/.test(title);
}

function deriveAgendaSectionsFromUtterances(utterances = [], meeting = {}) {
  const groups = [];
  for (const utterance of utterances) {
    const title = String(utterance?.sectionTitle || "").trim();
    if (!title) continue;
    let group = groups[groups.length - 1];
    if (!group || group.title !== title) {
      group = {
        id: `${meeting?.id || "meeting"}-section-${groups.length + 1}`,
        meetingId: meeting?.id || "",
        date: meeting?.date || "",
        year: meeting?.year || null,
        meetingLabel: meeting?.meetingLabel || "",
        title,
        type: isProceduralSection(title) ? "절차" : "안건",
        startUtteranceId: utterance.id || "",
        utteranceCount: 0,
      };
      groups.push(group);
    }
    group.utteranceCount += 1;
  }
  return groups;
}

function lawReferenceKey(ref = {}) {
  return `${ref.lawName}|${ref.article}`.replace(/\s+/g, "");
}

function rebuildLawReferencesFromUtterances(utterances = [], meetingDate = "") {
  const seen = new Map();
  const updatedUtterances = utterances.map((utterance) => {
    const refs = extractLawReferences(utterance.text || "").map((ref) => {
      const key = lawReferenceKey(ref);
      if (!seen.has(key)) {
        seen.set(key, {
          ...ref,
          id: `law-${seen.size + 1}`,
          utteranceId: utterance.id,
          meetingDate,
          lookupRequest: buildLawLookupRequest({ ...ref, meetingDate }),
        });
      }
      return {
        ...ref,
        utteranceId: utterance.id,
        globalIndex: [...seen.keys()].indexOf(key),
      };
    });
    return { ...utterance, lawReferences: refs };
  });

  return {
    utterances: updatedUtterances,
    lawReferences: [...seen.values()],
  };
}

export function buildMeetingDetailModel(data = {}, transcriptId, options = {}) {
  const transcripts = (data.meetingTranscripts || []).map(normalizeTranscriptRecord);
  const meeting = transcriptId == null
    ? transcripts[0] || null
    : transcripts.find((item) => item.id === transcriptId) || null;
  const embedded = meeting ? findEmbeddedDetail(options.detailIndex, meeting.id) : null;
  const normalizedMeeting = embedded?.meeting ? { ...meeting, ...embedded.meeting, id: meeting.id } : meeting;
  const transcriptText = embedded?.transcriptText || meeting?.content || options.transcriptText || "";
  const rawUtterances = embedded?.utterances || [];
  const repairedAgendas = embedded?.sections?.length ? deriveAgendaSegments(rawUtterances, embedded.sections) : [];
  const agendaUtterances = repairedAgendas.length ? attachAgendaIds(rawUtterances, repairedAgendas) : rawUtterances;
  const rebuiltLaw = rawUtterances.length
    ? rebuildLawReferencesFromUtterances(agendaUtterances, normalizedMeeting?.date || meeting?.date || "")
    : null;
  const utterances = rebuiltLaw?.utterances || agendaUtterances;
  const agendas = repairedAgendas.length
    ? repairedAgendas
    : embedded?.agendas?.length
    ? embedded.agendas
    : deriveAgendaSectionsFromUtterances(utterances, normalizedMeeting);
  const lawReferences = rebuiltLaw?.lawReferences.length ? rebuiltLaw.lawReferences : embedded?.lawReferences || extractLawReferences(transcriptText).map((ref) => ({
    ...ref,
    meetingDate: meeting?.date || "",
    lookupRequest: buildLawLookupRequest({ ...ref, meetingDate: meeting?.date || "" }),
  }));

  return {
    meeting: normalizedMeeting,
    overview: embedded?.overview || null,
    transcriptText,
    utterances,
    sections: embedded?.sections || [],
    agendas,
    lawReferences,
    meetingOptions: transcripts.map((item) => ({
      id: item.id,
      meetingLabel: item.meetingLabel,
      date: item.date,
      title: item.title,
      selected: Boolean(meeting && item.id === meeting.id),
    })),
    analysis: embedded?.analysis || null,
    relatedDocuments: meeting ? [{ label: "속기록 원문", path: meeting.path }] : [],
  };
}
