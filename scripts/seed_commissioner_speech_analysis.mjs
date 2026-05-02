import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const commissionersCsvPath = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data", "commissioners.csv");
const utterancesCsvPath = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data", "utterances.csv");
const agendaSeedPath = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data", "agenda_seed.json");
const decisionSeedPath = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data", "decision_case_candidate_seed.json");

const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const profileDir = path.join(ROOT, "pipc_knowledge_base", "04_members", "speech_profiles");
const indexDir = path.join(ROOT, "pipc_knowledge_base", "00_indexes");

const aggregateCsvPath = path.join(outDir, "commissioner_speech_aggregates.csv");
const sampleCsvPath = path.join(outDir, "commissioner_speech_samples.csv");
const utteranceTagsCsvPath = path.join(outDir, "utterance_tendency_tags.csv");
const commissionerTagStatsCsvPath = path.join(outDir, "commissioner_tendency_stats.csv");
const seedJsonPath = path.join(outDir, "commissioner_speech_analysis_seed.json");
const reportPath = path.join(indexDir, "commissioner_speech_analysis_report.md");

const shouldUpload = new Set(process.argv.slice(2)).has("--upload");
const extractorName = "scripts/seed_commissioner_speech_analysis.mjs";

const tagRules = [
  {
    key: "technical_security",
    label: "기술·보안 통제 점검",
    category: "issue_focus",
    keywords: ["안전조치", "접근권한", "접속권한", "암호화", "알고리즘", "로그", "접속기록", "취약", "해킹", "인증", "관리자", "시스템", "IP", "phpmyadmin", "보안", "권한"],
  },
  {
    key: "sanction_effectiveness",
    label: "처분 실효성·제재수준 점검",
    category: "sanction_orientation",
    keywords: ["과징금", "과태료", "공표", "공표명령", "감경", "가중", "제재", "처분", "1안", "2안", "부과", "실효성", "징계", "고발"],
  },
  {
    key: "public_sector_accountability",
    label: "공공부문 책임성 강조",
    category: "sector_focus",
    keywords: ["공공기관", "공공부문", "지자체", "구청", "시청", "공단", "공무원", "행정", "기관", "정부", "교육청", "경찰"],
  },
  {
    key: "procedure_legal_reasoning",
    label: "절차·법리·근거 검토",
    category: "legal_reasoning",
    keywords: ["법리", "근거", "조항", "해석", "위반", "절차", "사전통지", "의견제출", "재처분", "요건", "입증", "판단", "법률", "고시"],
  },
  {
    key: "data_subject_rights",
    label: "정보주체 권리·피해 관점",
    category: "rights_focus",
    keywords: ["정보주체", "피해", "유출통지", "통지", "권리", "동의", "열람", "자기결정권", "구제", "민감정보", "고유식별정보"],
  },
  {
    key: "business_burden_context",
    label: "사업자 부담·산업 맥락 고려",
    category: "market_context",
    keywords: ["사업자", "영업", "부담", "비용", "산업", "플랫폼", "자율규약", "현장", "중소", "스타트업", "서비스", "고객"],
  },
  {
    key: "remedial_prevention",
    label: "재발방지·개선·예방 지향",
    category: "remedy_orientation",
    keywords: ["재발방지", "개선", "권고", "교육", "점검", "가이드라인", "예방", "후속", "사례집", "안내", "대책", "보완"],
  },
  {
    key: "evidence_fact_clarification",
    label: "사실관계·증거 확인",
    category: "deliberation_style",
    keywords: ["사실관계", "확인", "자료", "수치", "현황", "조사", "보고서", "통계", "몇 명", "얼마나", "근거자료", "파악"],
  },
  {
    key: "ai_data_governance",
    label: "AI·데이터 활용 거버넌스",
    category: "technology_policy",
    keywords: ["AI", "인공지능", "가명정보", "데이터", "사전적정성", "알고리즘", "프로파일링", "마이데이터", "자율주행", "영상정보"],
  },
  {
    key: "cross_border_global",
    label: "국외이전·글로벌 규범",
    category: "international",
    keywords: ["국외", "해외", "이전", "CBPR", "국경", "글로벌", "구글", "페이스북", "넷플릭스", "국제"],
  },
];

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows.shift();
  return rows
    .filter((values) => values.some((value) => value !== ""))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function csvEscape(value) {
  const text = value == null ? "" : Array.isArray(value) ? value.join("; ") : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, rows, headers) {
  const body = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
  fs.writeFileSync(filePath, `${body}\n`, "utf8");
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function truncate(value, length = 420) {
  const text = compact(value);
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1)}…`;
}

function normalizeForSearch(value) {
  return compact(value).replace(/\s+/g, "").toLowerCase();
}

function unique(values, limit = Infinity) {
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    const value = compact(raw);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= limit) break;
  }
  return result;
}

function incrementMap(map, key, amount = 1) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + amount);
}

function mapToObject(map, limit = 30) {
  return Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko")).slice(0, limit));
}

function splitSemicolon(value) {
  return compact(value)
    .split(";")
    .map((part) => compact(part))
    .filter(Boolean);
}

function makeMarkdownTable(headers, rows) {
  if (rows.length === 0) return "_없음_\n";
  const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((header) => escapeCell(row[header])).join(" | ")} |`),
  ].join("\n");
}

function findTags(text) {
  const normalized = normalizeForSearch(text);
  const tags = [];
  for (const rule of tagRules) {
    const matched = rule.keywords.filter((keyword) => normalized.includes(normalizeForSearch(keyword)));
    if (matched.length === 0) continue;
    tags.push({
      tag_key: rule.key,
      tag_label: rule.label,
      tag_category: rule.category,
      confidence: Math.min(0.82, 0.45 + matched.length * 0.08),
      evidence_keywords: unique(matched, 8),
    });
  }
  return tags;
}

function caseMentionedInText(decisionCase, text) {
  const haystack = normalizeForSearch(text);
  const values = [
    decisionCase.case_no,
    decisionCase.investigation_case_no,
    decisionCase.main_entity_name,
    decisionCase.bill_number,
  ].flatMap((value) => splitSemicolon(value));
  return values.some((value) => value && haystack.includes(normalizeForSearch(value)));
}

function buildLocalLinks(agendaSeed, decisionSeed, utterances) {
  const agendaByKey = new Map(agendaSeed.agendas.map((agenda) => [`${agenda.meeting_idx_id}|${agenda.agenda_key}`, agenda]));
  const agendaLinkByUtterance = new Map(
    agendaSeed.utterance_agenda_links.map((link) => [`${link.meeting_idx_id}|${link.utterance_order}`, link])
  );
  const agendaDecisionLinksByAgenda = new Map();
  for (const link of agendaSeed.agenda_decision_links) {
    const key = `${link.meeting_idx_id}|${link.agenda_key}`;
    if (!agendaDecisionLinksByAgenda.has(key)) agendaDecisionLinksByAgenda.set(key, []);
    agendaDecisionLinksByAgenda.get(key).push(link);
  }
  const casesByDecisionIdx = new Map();
  for (const decisionCase of decisionSeed.cases) {
    if (!casesByDecisionIdx.has(decisionCase.decision_idx_id)) casesByDecisionIdx.set(decisionCase.decision_idx_id, []);
    casesByDecisionIdx.get(decisionCase.decision_idx_id).push(decisionCase);
  }
  const sanctionsByCaseKey = new Map();
  for (const sanction of decisionSeed.sanctions) {
    const key = `${sanction.decision_idx_id}|${sanction.case_key}`;
    if (!sanctionsByCaseKey.has(key)) sanctionsByCaseKey.set(key, []);
    sanctionsByCaseKey.get(key).push(sanction);
  }
  const lawsByCaseKey = new Map();
  for (const citation of decisionSeed.law_citations) {
    const key = `${citation.decision_idx_id}|${citation.case_key}`;
    if (!lawsByCaseKey.has(key)) lawsByCaseKey.set(key, []);
    lawsByCaseKey.get(key).push(citation);
  }

  const enriched = [];
  for (const utterance of utterances) {
    const agendaLink = agendaLinkByUtterance.get(`${utterance.meeting_idx_id}|${utterance.utterance_order}`);
    const agenda = agendaLink ? agendaByKey.get(`${utterance.meeting_idx_id}|${agendaLink.agenda_key}`) : null;
    const decisionLinks = agenda ? agendaDecisionLinksByAgenda.get(`${agenda.meeting_idx_id}|${agenda.agenda_key}`) ?? [] : [];
    const linkedCases = [];
    for (const decisionLink of decisionLinks) {
      const cases = casesByDecisionIdx.get(decisionLink.decision_idx_id) ?? [];
      if (cases.length === 1) {
        linkedCases.push({ ...cases[0], link_method: "agenda_decision_single_case" });
      } else {
        for (const decisionCase of cases) {
          if (caseMentionedInText(decisionCase, `${utterance.normalized_text} ${utterance.section_heading}`)) {
            linkedCases.push({ ...decisionCase, link_method: "agenda_decision_case_or_entity_mention" });
          }
        }
      }
    }
    const distinctCases = [];
    const seen = new Set();
    for (const decisionCase of linkedCases) {
      const key = `${decisionCase.decision_idx_id}|${decisionCase.case_key}`;
      if (seen.has(key)) continue;
      seen.add(key);
      distinctCases.push(decisionCase);
    }
    enriched.push({
      ...utterance,
      agenda,
      agenda_link: agendaLink ?? null,
      decision_links: decisionLinks,
      cases: distinctCases,
      sanctions: distinctCases.flatMap((decisionCase) => sanctionsByCaseKey.get(`${decisionCase.decision_idx_id}|${decisionCase.case_key}`) ?? []),
      law_citations: distinctCases.flatMap((decisionCase) => lawsByCaseKey.get(`${decisionCase.decision_idx_id}|${decisionCase.case_key}`) ?? []),
    });
  }
  return enriched;
}

function chooseSamples(rows, limit = 30) {
  return [...rows]
    .map((row) => {
      const text = row.normalized_text || row.raw_text;
      const score =
        (row.cases.length > 0 ? 40 : 0) +
        (row.agenda ? 15 : 0) +
        row.tags.length * 12 +
        Math.min(20, Math.floor(compact(text).length / 140)) +
        (row.speaker_role === "위원" ? 5 : 0);
      return { row, score };
    })
    .sort((a, b) => b.score - a.score || String(b.row.utterance_date).localeCompare(String(a.row.utterance_date)))
    .slice(0, limit)
    .map((entry, index) => ({ ...entry.row, sample_rank: index + 1, selection_score: entry.score }));
}

function writeSpeechProfile(commissioner, aggregate, tagStats, samples) {
  const safeName = commissioner.name.replace(/[\\/:*?"<>|]/g, "_");
  const profilePath = path.join(profileDir, `${safeName}_speech_profile.md`);
  const topTagRows = tagStats.slice(0, 12).map((tag) => ({
    tag: tag.tag_label,
    count: tag.utterance_count,
    confidence: tag.average_confidence.toFixed(3),
  }));
  const sampleRows = samples.slice(0, 20).map((sample) => ({
    date: sample.utterance_date,
    agenda: sample.agenda?.title ?? "",
    tags: sample.tags.map((tag) => tag.tag_label).join(", "),
    excerpt: truncate(sample.normalized_text || sample.raw_text, 180),
  }));
  const sanctionRows = Object.entries(aggregate.sanction_counts ?? {})
    .slice(0, 10)
    .map(([kind, count]) => ({ kind, count }));
  const lawRows = Object.entries(aggregate.law_article_counts ?? {})
    .slice(0, 10)
    .map(([article, count]) => ({ article, count }));

  const content = `---
type: commissioner_speech_profile
name: ${commissioner.name}
generation: "${commissioner.generation}"
source_status: candidate_rule_based
generated_at: ${new Date().toISOString()}
---

# ${commissioner.name} 발언 분석 초안

이 문서는 속기록에서 자동 추출한 발언과 규칙 기반 태그를 바탕으로 만든 1차 분석 초안입니다. 성향 판단은 확정값이 아니며, 대표 발언 원문 대조와 추가 검토가 필요합니다.

## 발언 집계

- 총 발언: ${aggregate.total_utterances}
- 발언 회의 수: ${aggregate.meeting_count}
- 안건 연결 발언: ${aggregate.agenda_utterance_count}
- 사건 연결 발언: ${aggregate.case_utterance_count}
- 연결 안건 수: ${aggregate.agenda_count}
- 연결 사건 수: ${aggregate.case_count}
- 관측 기간: ${aggregate.first_utterance_date || ""} ~ ${aggregate.last_utterance_date || ""}

## 1차 성향 태그

${makeMarkdownTable(["tag", "count", "confidence"], topTagRows)}

## 연결 처분 후보

${makeMarkdownTable(["kind", "count"], sanctionRows)}

## 연결 조항 후보

${makeMarkdownTable(["article", "count"], lawRows)}

## 대표 발언 샘플

${makeMarkdownTable(["date", "agenda", "tags", "excerpt"], sampleRows)}

## 해석 메모

- 이 단계는 키워드 기반 자동 태깅입니다.
- 태그가 많다는 것은 해당 쟁점이 발언 텍스트에 자주 등장했다는 뜻이지, 곧바로 찬반·강약 성향을 확정한다는 뜻은 아닙니다.
- 다음 단계에서 샘플 발언을 사람이 검토하거나 LLM 요약을 붙이면 페르소나 초안으로 발전시킬 수 있습니다.
`;
  fs.writeFileSync(profilePath, content, "utf8");
  return path.relative(ROOT, profilePath);
}

function buildSeed() {
  const commissioners = parseCsv(readUtf8(commissionersCsvPath));
  const commissionerNames = new Set(commissioners.map((row) => row.name));
  const utterances = parseCsv(readUtf8(utterancesCsvPath)).filter((row) => commissionerNames.has(row.speaker_name));
  const agendaSeed = JSON.parse(readUtf8(agendaSeedPath));
  const decisionSeed = JSON.parse(readUtf8(decisionSeedPath));
  const enriched = buildLocalLinks(agendaSeed, decisionSeed, utterances);

  for (const row of enriched) {
    row.tags = findTags(`${row.normalized_text || row.raw_text} ${row.agenda?.title ?? ""} ${row.section_heading ?? ""}`);
  }

  const rowsByCommissioner = new Map();
  for (const row of enriched) {
    if (!rowsByCommissioner.has(row.speaker_name)) rowsByCommissioner.set(row.speaker_name, []);
    rowsByCommissioner.get(row.speaker_name).push(row);
  }

  fs.mkdirSync(profileDir, { recursive: true });

  const aggregates = [];
  const samples = [];
  const utteranceTags = [];
  const commissionerTagStats = [];

  for (const commissioner of commissioners) {
    const rows = rowsByCommissioner.get(commissioner.name) ?? [];
    const meetingSet = new Set();
    const agendaSet = new Set();
    const caseSet = new Set();
    const agendaKindCounts = new Map();
    const visibilityCounts = new Map();
    const sanctionCounts = new Map();
    const lawArticleCounts = new Map();
    const tagCounts = new Map();
    const tagEvidence = new Map();
    let agendaUtterances = 0;
    let caseUtterances = 0;
    let charCount = 0;

    for (const row of rows) {
      meetingSet.add(row.meeting_idx_id);
      charCount += compact(row.normalized_text || row.raw_text).length;
      if (row.agenda) {
        agendaUtterances += 1;
        agendaSet.add(`${row.meeting_idx_id}|${row.agenda.agenda_key}`);
        incrementMap(agendaKindCounts, row.agenda.agenda_kind);
        incrementMap(visibilityCounts, row.agenda.visibility);
      }
      if (row.cases.length > 0) {
        caseUtterances += 1;
        for (const decisionCase of row.cases) {
          caseSet.add(`${decisionCase.decision_idx_id}|${decisionCase.case_key}`);
        }
      }
      for (const sanction of row.sanctions) incrementMap(sanctionCounts, sanction.sanction_kind);
      for (const citation of row.law_citations) incrementMap(lawArticleCounts, citation.article_raw || citation.cited_text);
      for (const tag of row.tags) {
        incrementMap(tagCounts, tag.tag_key);
        if (!tagEvidence.has(tag.tag_key)) tagEvidence.set(tag.tag_key, []);
        tagEvidence.get(tag.tag_key).push({
          meeting_idx_id: row.meeting_idx_id,
          utterance_order: Number(row.utterance_order),
          confidence: tag.confidence,
          excerpt: truncate(row.normalized_text || row.raw_text, 180),
        });
        utteranceTags.push({
          commissioner_name: commissioner.name,
          meeting_idx_id: row.meeting_idx_id,
          utterance_order: Number(row.utterance_order),
          tag_key: tag.tag_key,
          tag_label: tag.tag_label,
          tag_category: tag.tag_category,
          confidence: tag.confidence,
          evidence_text: tag.evidence_keywords.join(", "),
          extraction_status: "candidate",
          metadata: {
            extractor: extractorName,
            evidence_keywords: tag.evidence_keywords,
            rule_based: true,
          },
        });
      }
    }

    const firstDate = rows.map((row) => row.utterance_date).filter(Boolean).sort()[0] ?? null;
    const lastDate = rows.map((row) => row.utterance_date).filter(Boolean).sort().at(-1) ?? null;
    const tagStats = [...tagCounts.entries()]
      .map(([tagKey, count]) => {
        const rule = tagRules.find((item) => item.key === tagKey);
        const evidence = tagEvidence.get(tagKey) ?? [];
        const averageConfidence = evidence.reduce((sum, item) => sum + item.confidence, 0) / Math.max(1, evidence.length);
        return {
          commissioner_name: commissioner.name,
          tag_key: tagKey,
          tag_label: rule?.label ?? tagKey,
          tag_category: rule?.category ?? "unknown",
          utterance_count: count,
          evidence_count: evidence.length,
          average_confidence: averageConfidence,
          sample_utterance_refs: evidence.slice(0, 8),
          extraction_status: "candidate",
          metadata: {
            extractor: extractorName,
            rule_based: true,
          },
        };
      })
      .sort((a, b) => b.utterance_count - a.utterance_count || a.tag_key.localeCompare(b.tag_key));

    commissionerTagStats.push(...tagStats);
    const selectedSamples = chooseSamples(rows, 30);

    const aggregate = {
      commissioner_name: commissioner.name,
      total_utterances: rows.length,
      meeting_count: meetingSet.size,
      agenda_utterance_count: agendaUtterances,
      case_utterance_count: caseUtterances,
      agenda_count: agendaSet.size,
      case_count: caseSet.size,
      total_char_count: charCount,
      first_utterance_date: firstDate,
      last_utterance_date: lastDate,
      agenda_kind_counts: mapToObject(agendaKindCounts),
      visibility_counts: mapToObject(visibilityCounts),
      sanction_counts: mapToObject(sanctionCounts),
      law_article_counts: mapToObject(lawArticleCounts),
      tendency_tag_counts: mapToObject(tagCounts),
      sample_md_path: "",
      extraction_status: "candidate",
      source_confidence: rows.length > 0 ? 0.68 : 0.2,
      metadata: {
        extractor: extractorName,
        rule_based: true,
        source_files: [
          "pipc_knowledge_base/90_normalized_data/utterances.csv",
          "pipc_knowledge_base/90_normalized_data/agenda_seed.json",
          "pipc_knowledge_base/90_normalized_data/decision_case_candidate_seed.json",
        ],
      },
    };

    const profilePath = writeSpeechProfile(commissioner, aggregate, tagStats, selectedSamples);
    aggregate.sample_md_path = profilePath;
    aggregates.push(aggregate);

    samples.push(
      ...selectedSamples.map((row) => ({
        commissioner_name: commissioner.name,
        meeting_idx_id: row.meeting_idx_id,
        utterance_order: Number(row.utterance_order),
        sample_rank: row.sample_rank,
        utterance_date: row.utterance_date,
        meeting_title: row.agenda?.metadata?.meeting_title ?? "",
        agenda_title: row.agenda?.title ?? "",
        case_title: row.cases.map((decisionCase) => decisionCase.title).filter(Boolean).join("; "),
        speaker_role: row.speaker_role,
        excerpt: truncate(row.normalized_text || row.raw_text, 700),
        tag_keys: row.tags.map((tag) => tag.tag_key),
        selection_reason: row.cases.length > 0 ? "case_linked_tagged_utterance" : row.agenda ? "agenda_linked_tagged_utterance" : "commissioner_utterance",
        extraction_status: "candidate",
        source_confidence: row.cases.length > 0 ? 0.74 : row.agenda ? 0.68 : 0.5,
        metadata: {
          extractor: extractorName,
          section_heading: row.section_heading,
          selection_score: row.selection_score,
          tag_labels: row.tags.map((tag) => tag.tag_label),
          linked_cases: row.cases.map((decisionCase) => ({
            decision_idx_id: decisionCase.decision_idx_id,
            case_key: decisionCase.case_key,
            case_no: decisionCase.case_no,
            title: decisionCase.title,
          })),
        },
      }))
    );
  }

  return {
    generated_at: new Date().toISOString(),
    aggregates,
    samples,
    utterance_tags: utteranceTags,
    commissioner_tag_stats: commissionerTagStats,
  };
}

function sqlJsonLiteral(rows) {
  const tag = `seed_${crypto.randomBytes(8).toString("hex")}`;
  return `$${tag}$${JSON.stringify(rows)}$${tag}$::jsonb`;
}

function chunks(values, size) {
  const result = [];
  for (let i = 0; i < values.length; i += size) result.push(values.slice(i, i + size));
  return result;
}

async function executeSql(label, sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is not set.");
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await response.text();
  if (!response.ok) {
    const debugPath = path.join(ROOT, ".tmp_last_supabase_query.sql");
    fs.writeFileSync(debugPath, sql, "utf8");
    throw new Error(`${label} failed (${response.status}): ${body}\nQuery written to ${debugPath}`);
  }
  console.log(`[${label}] ${body.slice(0, 300)}`);
}

function cleanupSql() {
  return `
delete from public.utterance_tendency_tags where metadata->>'extractor' = '${extractorName}';
delete from public.commissioner_tendency_stats where metadata->>'extractor' = '${extractorName}';
delete from public.commissioner_speech_samples where metadata->>'extractor' = '${extractorName}';
`;
}

function aggregatesSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    commissioner_name text,
    total_utterances integer,
    meeting_count integer,
    agenda_utterance_count integer,
    case_utterance_count integer,
    agenda_count integer,
    case_count integer,
    total_char_count integer,
    first_utterance_date date,
    last_utterance_date date,
    agenda_kind_counts jsonb,
    visibility_counts jsonb,
    sanction_counts jsonb,
    law_article_counts jsonb,
    tendency_tag_counts jsonb,
    sample_md_path text,
    extraction_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
enriched as (
  select c.id as commissioner_id, p.*
  from payload p
  join public.commissioners c on c.name = p.commissioner_name
)
insert into public.commissioner_speech_aggregates (
  commissioner_id,
  total_utterances,
  meeting_count,
  agenda_utterance_count,
  case_utterance_count,
  agenda_count,
  case_count,
  total_char_count,
  first_utterance_date,
  last_utterance_date,
  agenda_kind_counts,
  visibility_counts,
  sanction_counts,
  law_article_counts,
  tendency_tag_counts,
  sample_md_path,
  extraction_status,
  source_confidence,
  metadata
)
select
  commissioner_id,
  total_utterances,
  meeting_count,
  agenda_utterance_count,
  case_utterance_count,
  agenda_count,
  case_count,
  total_char_count,
  first_utterance_date,
  last_utterance_date,
  agenda_kind_counts,
  visibility_counts,
  sanction_counts,
  law_article_counts,
  tendency_tag_counts,
  sample_md_path,
  extraction_status,
  source_confidence,
  metadata
from enriched
on conflict (commissioner_id) do update
set total_utterances = excluded.total_utterances,
    meeting_count = excluded.meeting_count,
    agenda_utterance_count = excluded.agenda_utterance_count,
    case_utterance_count = excluded.case_utterance_count,
    agenda_count = excluded.agenda_count,
    case_count = excluded.case_count,
    total_char_count = excluded.total_char_count,
    first_utterance_date = excluded.first_utterance_date,
    last_utterance_date = excluded.last_utterance_date,
    agenda_kind_counts = excluded.agenda_kind_counts,
    visibility_counts = excluded.visibility_counts,
    sanction_counts = excluded.sanction_counts,
    law_article_counts = excluded.law_article_counts,
    tendency_tag_counts = excluded.tendency_tag_counts,
    sample_md_path = excluded.sample_md_path,
    extraction_status = excluded.extraction_status,
    source_confidence = excluded.source_confidence,
    metadata = excluded.metadata,
    updated_at = now();
`;
}

function samplesSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    commissioner_name text,
    meeting_idx_id text,
    utterance_order integer,
    sample_rank integer,
    utterance_date date,
    meeting_title text,
    agenda_title text,
    case_title text,
    speaker_role text,
    excerpt text,
    tag_keys text[],
    selection_reason text,
    extraction_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
enriched as (
  select c.id as commissioner_id, u.id as utterance_id, p.*
  from payload p
  join public.commissioners c on c.name = p.commissioner_name
  left join public.meetings m on m.pipc_idx_id = p.meeting_idx_id
  left join public.utterances u on u.meeting_id = m.id and u.utterance_order = p.utterance_order
)
insert into public.commissioner_speech_samples (
  commissioner_id,
  utterance_id,
  sample_rank,
  utterance_date,
  meeting_idx_id,
  meeting_title,
  agenda_title,
  case_title,
  speaker_role,
  excerpt,
  tag_keys,
  selection_reason,
  extraction_status,
  source_confidence,
  metadata
)
select
  commissioner_id,
  utterance_id,
  sample_rank,
  utterance_date,
  meeting_idx_id,
  meeting_title,
  agenda_title,
  case_title,
  speaker_role,
  excerpt,
  coalesce(tag_keys, '{}'::text[]),
  selection_reason,
  extraction_status,
  source_confidence,
  metadata
from enriched
on conflict (commissioner_id, sample_rank) do update
set utterance_id = excluded.utterance_id,
    utterance_date = excluded.utterance_date,
    meeting_idx_id = excluded.meeting_idx_id,
    meeting_title = excluded.meeting_title,
    agenda_title = excluded.agenda_title,
    case_title = excluded.case_title,
    speaker_role = excluded.speaker_role,
    excerpt = excluded.excerpt,
    tag_keys = excluded.tag_keys,
    selection_reason = excluded.selection_reason,
    extraction_status = excluded.extraction_status,
    source_confidence = excluded.source_confidence,
    metadata = excluded.metadata;
`;
}

function utteranceTagsSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    commissioner_name text,
    meeting_idx_id text,
    utterance_order integer,
    tag_key text,
    tag_label text,
    tag_category text,
    confidence numeric,
    evidence_text text,
    extraction_status text,
    metadata jsonb
  )
),
enriched as (
  select c.id as commissioner_id, u.id as utterance_id, p.*
  from payload p
  join public.commissioners c on c.name = p.commissioner_name
  join public.meetings m on m.pipc_idx_id = p.meeting_idx_id
  join public.utterances u on u.meeting_id = m.id and u.utterance_order = p.utterance_order
)
insert into public.utterance_tendency_tags (
  utterance_id,
  commissioner_id,
  tag_key,
  tag_label,
  tag_category,
  confidence,
  evidence_text,
  extraction_status,
  metadata
)
select
  utterance_id,
  commissioner_id,
  tag_key,
  tag_label,
  tag_category,
  confidence,
  evidence_text,
  extraction_status,
  metadata
from enriched
on conflict (utterance_id, tag_key) do update
set commissioner_id = excluded.commissioner_id,
    tag_label = excluded.tag_label,
    tag_category = excluded.tag_category,
    confidence = excluded.confidence,
    evidence_text = excluded.evidence_text,
    extraction_status = excluded.extraction_status,
    metadata = excluded.metadata,
    updated_at = now();
`;
}

function commissionerTagStatsSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    commissioner_name text,
    tag_key text,
    tag_label text,
    tag_category text,
    utterance_count integer,
    evidence_count integer,
    average_confidence numeric,
    sample_utterance_refs jsonb,
    extraction_status text,
    metadata jsonb
  )
),
enriched as (
  select c.id as commissioner_id, p.*
  from payload p
  join public.commissioners c on c.name = p.commissioner_name
)
insert into public.commissioner_tendency_stats (
  commissioner_id,
  tag_key,
  tag_label,
  tag_category,
  utterance_count,
  evidence_count,
  average_confidence,
  sample_utterance_refs,
  extraction_status,
  metadata
)
select
  commissioner_id,
  tag_key,
  tag_label,
  tag_category,
  utterance_count,
  evidence_count,
  average_confidence,
  coalesce(sample_utterance_refs, '[]'::jsonb),
  extraction_status,
  metadata
from enriched
on conflict (commissioner_id, tag_key) do update
set tag_label = excluded.tag_label,
    tag_category = excluded.tag_category,
    utterance_count = excluded.utterance_count,
    evidence_count = excluded.evidence_count,
    average_confidence = excluded.average_confidence,
    sample_utterance_refs = excluded.sample_utterance_refs,
    extraction_status = excluded.extraction_status,
    metadata = excluded.metadata,
    updated_at = now();
`;
}

async function uploadSeed(seed) {
  await executeSql("cleanup", cleanupSql());
  const operations = [
    ["aggregates", seed.aggregates, 100, aggregatesSql],
    ["samples", seed.samples, 250, samplesSql],
    ["utterance_tags", seed.utterance_tags, 500, utteranceTagsSql],
    ["commissioner_tag_stats", seed.commissioner_tag_stats, 250, commissionerTagStatsSql],
  ];
  for (const [name, rows, chunkSize, sqlFn] of operations) {
    const rowChunks = chunks(rows, chunkSize);
    if (rowChunks.length === 0) {
      console.log(`[${name}] skipped empty`);
      continue;
    }
    for (let i = 0; i < rowChunks.length; i += 1) {
      await executeSql(`${name}.${i + 1}/${rowChunks.length}`, sqlFn(rowChunks[i]));
    }
  }
}

function writeOutputs(seed) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(indexDir, { recursive: true });
  fs.writeFileSync(seedJsonPath, JSON.stringify(seed, null, 2), "utf8");
  writeCsv(aggregateCsvPath, seed.aggregates, [
    "commissioner_name",
    "total_utterances",
    "meeting_count",
    "agenda_utterance_count",
    "case_utterance_count",
    "agenda_count",
    "case_count",
    "first_utterance_date",
    "last_utterance_date",
    "tendency_tag_counts",
    "sample_md_path",
  ]);
  writeCsv(sampleCsvPath, seed.samples, [
    "commissioner_name",
    "sample_rank",
    "utterance_date",
    "meeting_idx_id",
    "utterance_order",
    "agenda_title",
    "case_title",
    "tag_keys",
    "excerpt",
  ]);
  writeCsv(utteranceTagsCsvPath, seed.utterance_tags, [
    "commissioner_name",
    "meeting_idx_id",
    "utterance_order",
    "tag_key",
    "tag_label",
    "tag_category",
    "confidence",
    "evidence_text",
  ]);
  writeCsv(commissionerTagStatsCsvPath, seed.commissioner_tag_stats, [
    "commissioner_name",
    "tag_key",
    "tag_label",
    "tag_category",
    "utterance_count",
    "evidence_count",
    "average_confidence",
  ]);

  const generatedDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  const topSpeakers = [...seed.aggregates]
    .sort((a, b) => b.total_utterances - a.total_utterances)
    .slice(0, 15)
    .map((row) => ({
      name: row.commissioner_name,
      utterances: row.total_utterances,
      meetings: row.meeting_count,
      agenda_linked: row.agenda_utterance_count,
      case_linked: row.case_utterance_count,
      top_tags: Object.entries(row.tendency_tag_counts ?? {})
        .slice(0, 3)
        .map(([tag, count]) => `${tag}:${count}`)
        .join(", "),
    }));
  const tagTotals = new Map();
  for (const row of seed.commissioner_tag_stats) incrementMap(tagTotals, row.tag_label, row.utterance_count);
  const tagRows = [...tagTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  const report = `# 위원별 발언 분석 리포트

생성일: ${generatedDate}

이 리포트는 속기록 발언, 안건 연결, 결정문 사건 후보를 이용한 1차 자동 분석입니다. 성향 태그는 키워드 규칙 기반 후보이며 확정 판단이 아닙니다.

## 생성 현황

- 분석 대상 위원: ${seed.aggregates.length}
- 위원 발언 샘플: ${seed.samples.length}
- 발언 성향 태그: ${seed.utterance_tags.length}
- 위원별 성향 태그 집계: ${seed.commissioner_tag_stats.length}
- 위원별 MD 프로필 폴더: \`pipc_knowledge_base/04_members/speech_profiles\`

## 발언 수 상위

${makeMarkdownTable(["name", "utterances", "meetings", "agenda_linked", "case_linked", "top_tags"], topSpeakers)}

## 성향 태그 전체 빈도

${makeMarkdownTable(["tag", "count"], tagRows)}

## 산출물

- 집계 CSV: \`pipc_knowledge_base/90_normalized_data/commissioner_speech_aggregates.csv\`
- 샘플 CSV: \`pipc_knowledge_base/90_normalized_data/commissioner_speech_samples.csv\`
- 발언 태그 CSV: \`pipc_knowledge_base/90_normalized_data/utterance_tendency_tags.csv\`
- 위원별 태그 집계 CSV: \`pipc_knowledge_base/90_normalized_data/commissioner_tendency_stats.csv\`
- 통합 JSON: \`pipc_knowledge_base/90_normalized_data/commissioner_speech_analysis_seed.json\`

## 주의

- 태그는 키워드 매칭이므로 문맥상 부정/찬성/비판 여부를 아직 구분하지 않습니다.
- 위원별 페르소나로 쓰려면 대표 발언을 검토해 “질문 습관, 판단 축, 반복 쟁점”을 별도로 요약해야 합니다.
`;
  fs.writeFileSync(reportPath, report, "utf8");
}

const seed = buildSeed();
writeOutputs(seed);

console.log(
  JSON.stringify(
    {
      aggregates: seed.aggregates.length,
      samples: seed.samples.length,
      utterance_tags: seed.utterance_tags.length,
      commissioner_tag_stats: seed.commissioner_tag_stats.length,
      profile_dir: path.relative(ROOT, profileDir),
      report: path.relative(ROOT, reportPath),
      upload: shouldUpload,
    },
    null,
    2
  )
);

if (shouldUpload) {
  await uploadSeed(seed);
}
