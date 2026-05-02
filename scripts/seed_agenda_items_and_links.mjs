import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const meetingsCsvPath = path.join(ROOT, "pipc_minutes_crawler", "data", "meetings.csv");
const decisionsCsvPath = path.join(ROOT, "pipc_committee_decisions_crawler", "data", "decisions.csv");
const decisionSeedPath = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data", "decision_case_candidate_seed.json");
const utterancesCsvPath = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data", "utterances.csv");

const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const indexDir = path.join(ROOT, "pipc_knowledge_base", "00_indexes");
const agendaCsvPath = path.join(outDir, "agenda_item_candidates.csv");
const agendaDecisionCsvPath = path.join(outDir, "agenda_decision_link_candidates.csv");
const utteranceAgendaCsvPath = path.join(outDir, "utterance_agenda_link_candidates.csv");
const seedJsonPath = path.join(outDir, "agenda_seed.json");
const reportPath = path.join(indexDir, "agenda_seed_report.md");

const shouldUpload = new Set(process.argv.slice(2)).has("--upload");

const circled = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
const koreanNumbers = new Map([
  ["일", 1],
  ["이", 2],
  ["삼", 3],
  ["사", 4],
  ["오", 5],
  ["육", 6],
  ["칠", 7],
  ["팔", 8],
  ["구", 9],
  ["십", 10],
]);

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
  const text = value == null ? "" : String(value);
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

function normalizeTitle(value) {
  return compact(value)
    .replace(/\[[^\]]+\]/g, "")
    .replace(/[「」『』｢｣〈〉<>()（）\[\]·ㆍ.,:;'"“”‘’\s_-]/g, "")
    .replace(/개인정보보호법규위반행위에대한시정조치에관한건/g, "법규위반시정조치")
    .replace(/개인정보보호위원회/g, "")
    .toLowerCase();
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

function normalizeCaseNumber(value) {
  const text = compact(value).replace(/\s+/g, "").replace(/-/g, "");
  const match = text.match(/^(20\d{2}조[가-힣]{1,4})(\d{3,4})$/);
  if (!match) return text;
  return `${match[1]}${match[2].padStart(4, "0")}`;
}

function expandCaseRange(prefix, start, end) {
  const s = Number(start);
  const e = Number(end);
  if (!Number.isFinite(s) || !Number.isFinite(e) || e < s || e - s > 80) return [];
  const width = Math.max(start.length, end.length, 4);
  const values = [];
  for (let n = s; n <= e; n += 1) values.push(`${prefix}${String(n).padStart(width, "0")}`);
  return values;
}

function extractCaseNumbers(...texts) {
  const found = [];
  for (const text of texts) {
    const source = compact(text).replace(/\s+/g, "");
    const fullPattern =
      /(20\d{2}조[가-힣]{1,4})(\d{3,4})(?:[~∼～-]((?:20\d{2}조[가-힣]{1,4})?)(\d{3,4}))?/g;
    let match;
    while ((match = fullPattern.exec(source))) {
      const prefix = match[1];
      const start = match[2];
      found.push(normalizeCaseNumber(`${prefix}${start}`));
      if (match[4]) {
        const endPrefix = match[3] || prefix;
        const expanded = expandCaseRange(endPrefix, start, match[4]);
        found.push(...expanded.map(normalizeCaseNumber));
      }
    }

    const shorthandPattern = /(20\d{2}조[가-힣]{1,4})(\d{3,4})((?:[,，](?!20\d{2}조)\d{3,4})+)/g;
    while ((match = shorthandPattern.exec(source))) {
      const prefix = match[1];
      found.push(normalizeCaseNumber(`${prefix}${match[2]}`));
      for (const tail of match[3].split(/[,，]/).filter(Boolean)) {
        found.push(normalizeCaseNumber(`${prefix}${tail}`));
      }
    }
  }
  return unique(found, 200);
}

function normalizeBillNumber(value) {
  const text = compact(value).replace(/\s+/g, "").replace(/[–—]/g, "-");
  const match = text.match(/(?:제)?(\d{4}-\d{3}-\d{3})(?:호)?/);
  return match ? `제${match[1]}호` : "";
}

function inferAgendaKind(sectionLabel, rawTitle) {
  const section = compact(sectionLabel);
  const title = compact(rawTitle);
  if (/보고/.test(section)) return "report";
  if (/심의|의결/.test(section)) return "deliberation_decision";
  if (/보고안건/.test(title)) return "report";
  if (/의결안건|심의/.test(title)) return "deliberation_decision";
  return "unspecified";
}

function kindLabel(kind) {
  if (kind === "report") return "보고안건";
  if (kind === "deliberation_decision") return "심의의결안건";
  return "안건";
}

function parseItemMarker(line) {
  const trimmed = compact(line);
  const circledIndex = circled.indexOf(trimmed[0]);
  if (circledIndex >= 0) {
    return { originalNo: trimmed[0], itemOrder: circledIndex + 1, title: compact(trimmed.slice(1)) };
  }
  const numeric = trimmed.match(/^(\d{1,2})[.)]\s*(.+)$/);
  if (numeric) return { originalNo: numeric[1], itemOrder: Number(numeric[1]), title: compact(numeric[2]) };
  const dash = trimmed.match(/^[-ㆍ]\s*(.+)$/);
  if (dash) return { originalNo: "-", itemOrder: 1, title: compact(dash[1]) };
  return null;
}

function cleanAgendaTitle(value) {
  return compact(value)
    .replace(/^\((서면)\)\s*/, "")
    .replace(/\s*\[비공개\]\s*/g, "")
    .replace(/\s*\[공개\]\s*/g, "")
    .trim();
}

function parseAgendasFromMeeting(row) {
  const content = String(row.content ?? "").replace(/\r/g, "\n");
  const lines = content.split(/\n+/).map((line) => compact(line)).filter(Boolean);
  const items = [];
  let sectionLabel = "상정안건";
  let sectionOrder = 0;
  let current = null;
  let globalNo = 0;

  const flush = () => {
    if (!current) return;
    const rawTitle = compact(current.rawTitleParts.join(" "));
    const title = cleanAgendaTitle(rawTitle);
    if (!title || /기타 문의|상정 예정/.test(title)) {
      current = null;
      return;
    }
    globalNo += 1;
    const agendaKind = inferAgendaKind(current.sectionLabel, rawTitle);
    const visibility = /\[비공개\]|비공개/.test(rawTitle) ? "private" : "public";
    const isWritten = /\(?서면\)?/.test(rawTitle);
    const caseNumbers = extractCaseNumbers(rawTitle);
    const agendaKey = `${agendaKind}:${String(current.itemOrder).padStart(2, "0")}:${globalNo}`;
    items.push({
      meeting_idx_id: row.idx_id,
      meeting_date: row.meeting_date,
      agenda_key: agendaKey,
      agenda_no: globalNo,
      original_agenda_no: current.originalNo,
      section_order: current.sectionOrder,
      item_order: current.itemOrder,
      agenda_kind: agendaKind,
      visibility,
      title,
      case_numbers: caseNumbers,
      source_status: "parsed_from_schedule",
      extraction_status: "candidate",
      source_confidence: 0.88,
      metadata: {
        extractor: "scripts/seed_agenda_items_and_links.mjs",
        extraction_version: 1,
        source: "pipc_minutes_crawler/data/meetings.csv",
        meeting_title: row.title,
        section_label: current.sectionLabel,
        raw_title: rawTitle,
        is_written: isWritten,
        has_private_marker: visibility === "private",
      },
    });
    current = null;
  };

  for (const line of lines) {
    if (/기타 문의|상정 예정된 안건/.test(line)) {
      flush();
      break;
    }
    const sectionMatch = line.match(/^[<〈]\s*([^<〉>]+?안건)\s*[>〉]$/);
    if (sectionMatch) {
      flush();
      sectionOrder += 1;
      sectionLabel = sectionMatch[1];
      continue;
    }
    if (/^\(?상정안건\)?$/.test(line) || /^\(일\s*시\)|^\(장\s*소\)/.test(line) || /^□/.test(line)) {
      continue;
    }
    const marker = parseItemMarker(line);
    if (marker) {
      flush();
      current = {
        sectionLabel,
        sectionOrder,
        originalNo: marker.originalNo,
        itemOrder: marker.itemOrder,
        rawTitleParts: [marker.title],
      };
      continue;
    }
    if (current) {
      current.rawTitleParts.push(line);
    } else if (!/[()]/.test(line) && !/^＊/.test(line)) {
      const fallback = parseItemMarker(`- ${line}`);
      if (fallback) {
        current = {
          sectionLabel,
          sectionOrder,
          originalNo: fallback.originalNo,
          itemOrder: fallback.itemOrder,
          rawTitleParts: [fallback.title],
        };
      }
    }
  }
  flush();
  return items;
}

function parseAllAgendas() {
  const meetings = parseCsv(readUtf8(meetingsCsvPath));
  const agendas = [];
  for (const meeting of meetings) {
    agendas.push(...parseAgendasFromMeeting(meeting));
  }
  return agendas;
}

function buildDecisionLinks(agendas) {
  const decisions = parseCsv(readUtf8(decisionsCsvPath));
  const decisionSeed = JSON.parse(readUtf8(decisionSeedPath));
  const casesByDecisionIdx = new Map();
  for (const dc of decisionSeed.cases) {
    if (!casesByDecisionIdx.has(dc.decision_idx_id)) casesByDecisionIdx.set(dc.decision_idx_id, []);
    casesByDecisionIdx.get(dc.decision_idx_id).push(dc);
  }

  const links = [];
  for (const agenda of agendas) {
    const agendaCases = new Set(agenda.case_numbers);
    const agendaTitleNorm = normalizeTitle(agenda.title);
    const sameDateDecisions = decisions.filter((decision) => decision.decision_date === agenda.meeting_date);

    for (const decision of sameDateDecisions) {
      const caseRows = casesByDecisionIdx.get(decision.idx_id) ?? [];
      const decisionCases = new Set([
        ...extractCaseNumbers(decision.title, decision.decision_content),
        ...caseRows.flatMap((row) => extractCaseNumbers(row.case_no, row.investigation_case_no, row.title)),
      ]);
      const overlap = [...agendaCases].filter((caseNo) => decisionCases.has(caseNo));
      const decisionTitleNorm = normalizeTitle(decision.title);
      const titleContains =
        agendaTitleNorm.length > 8 &&
        decisionTitleNorm.length > 8 &&
        (agendaTitleNorm.includes(decisionTitleNorm.slice(0, Math.min(24, decisionTitleNorm.length))) ||
          decisionTitleNorm.includes(agendaTitleNorm.slice(0, Math.min(24, agendaTitleNorm.length))));

      let confidence = 0;
      const methods = ["same_decision_date"];
      if (overlap.length > 0) {
        confidence = 0.98;
        methods.push("case_number_overlap");
      } else if (titleContains && agenda.agenda_kind !== "report") {
        confidence = 0.82;
        methods.push("title_similarity");
      } else if (sameDateDecisions.length === 1 && agenda.agenda_kind !== "report" && agendaTitleNorm.includes("법규위반시정조치")) {
        confidence = 0.72;
        methods.push("single_same_date_decision_post");
      }

      if (confidence >= 0.8) {
        links.push({
          meeting_idx_id: agenda.meeting_idx_id,
          agenda_key: agenda.agenda_key,
          decision_idx_id: decision.idx_id,
          link_method: methods.join("+"),
          confidence,
          notes: overlap.length > 0 ? `case overlap: ${overlap.join(", ")}` : "title/date candidate",
          metadata: {
            agenda_title: agenda.title,
            decision_title: decision.title,
            overlap_case_numbers: overlap,
          },
        });
      }
    }
  }
  return uniqueLinks(links);
}

function uniqueLinks(links) {
  const map = new Map();
  for (const link of links) {
    const key = `${link.meeting_idx_id}|${link.agenda_key}|${link.decision_idx_id}`;
    if (!map.has(key)) map.set(key, link);
  }
  return [...map.values()];
}

function parseNumberToken(value) {
  const text = compact(value).replace(/\s+/g, "");
  if (/^\d+$/.test(text)) return Number(text);
  if (koreanNumbers.has(text)) return koreanNumbers.get(text);
  return null;
}

function agendaKindFromMarker(value) {
  if (/보고/.test(value)) return "report";
  if (/의결|심의/.test(value)) return "deliberation_decision";
  return null;
}

function shouldIgnoreAgendaMarker(text) {
  return /공개\s*회의|비공개|공개로\s*진행|공개하지|회의록|속기록|상정되었습니다/.test(text) && !/상정하겠습니다|보고해 주시기|심의하겠습니다/.test(text);
}

function buildUtteranceAgendaLinks(agendas) {
  const utterances = parseCsv(readUtf8(utterancesCsvPath));
  const agendasByMeeting = new Map();
  for (const agenda of agendas) {
    if (!agendasByMeeting.has(agenda.meeting_idx_id)) agendasByMeeting.set(agenda.meeting_idx_id, []);
    agendasByMeeting.get(agenda.meeting_idx_id).push(agenda);
  }
  for (const rows of agendasByMeeting.values()) {
    rows.sort((a, b) => a.agenda_no - b.agenda_no);
  }

  const utterancesByMeeting = new Map();
  for (const utterance of utterances) {
    if (!utterancesByMeeting.has(utterance.meeting_idx_id)) utterancesByMeeting.set(utterance.meeting_idx_id, []);
    utterancesByMeeting.get(utterance.meeting_idx_id).push(utterance);
  }
  for (const rows of utterancesByMeeting.values()) {
    rows.sort((a, b) => Number(a.utterance_order) - Number(b.utterance_order));
  }

  const links = [];
  for (const [meetingIdx, meetingUtterances] of utterancesByMeeting.entries()) {
    const meetingAgendas = agendasByMeeting.get(meetingIdx) ?? [];
    if (meetingAgendas.length === 0) continue;

    const starts = [];
    for (const utterance of meetingUtterances) {
      const text = compact(utterance.normalized_text || utterance.raw_text);
      if (shouldIgnoreAgendaMarker(text)) continue;

      const marker = text.match(/(의결안건|심의[․·ㆍ]?의결안건|보고안건)\s*([0-9일이삼사오육칠팔구십]+)\s*번/);
      if (marker && /상정|보고|심의|논의|진행|검토/.test(text)) {
        const kind = agendaKindFromMarker(marker[1]);
        const itemOrder = parseNumberToken(marker[2]);
        const agenda = meetingAgendas.find((row) => row.agenda_kind === kind && row.item_order === itemOrder);
        if (agenda) {
          starts.push({
            agenda,
            start: Number(utterance.utterance_order),
            reason: "agenda_number_marker",
          });
          continue;
        }
      }

      const titleHit = meetingAgendas.find((agenda) => {
        if (agenda.visibility === "private") return false;
        const title = normalizeTitle(agenda.title);
        if (title.length < 12) return false;
        return normalizeTitle(text).includes(title.slice(0, Math.min(28, title.length)));
      });
      if (titleHit && /상정|보고|심의|논의|설명/.test(text)) {
        starts.push({
          agenda: titleHit,
          start: Number(utterance.utterance_order),
          reason: "title_marker",
        });
      }
    }

    const dedupedStarts = [];
    const seenAgenda = new Set();
    for (const start of starts.sort((a, b) => a.start - b.start)) {
      if (seenAgenda.has(start.agenda.agenda_key)) continue;
      seenAgenda.add(start.agenda.agenda_key);
      dedupedStarts.push(start);
    }
    if (dedupedStarts.length === 0 && meetingAgendas.length === 1) {
      const firstSubstantive = meetingUtterances.find((row) => !/개회|성원|회의록|속기록|공개여부/.test(row.section_heading));
      if (firstSubstantive) {
        dedupedStarts.push({
          agenda: meetingAgendas[0],
          start: Number(firstSubstantive.utterance_order),
          reason: "single_agenda_fallback",
        });
      }
    }

    for (let i = 0; i < dedupedStarts.length; i += 1) {
      const current = dedupedStarts[i];
      const next = dedupedStarts[i + 1];
      const end = next ? next.start - 1 : Number(meetingUtterances.at(-1)?.utterance_order ?? current.start);
      for (const utterance of meetingUtterances) {
        const order = Number(utterance.utterance_order);
        if (order < current.start || order > end) continue;
        links.push({
          meeting_idx_id: meetingIdx,
          agenda_key: current.agenda.agenda_key,
          utterance_order: order,
          link_method: current.reason,
          confidence: current.reason === "single_agenda_fallback" ? 0.55 : 0.72,
        });
      }
    }
  }
  return links;
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

function agendaItemsSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    meeting_idx_id text,
    agenda_key text,
    agenda_no integer,
    original_agenda_no text,
    section_order integer,
    item_order integer,
    agenda_kind text,
    visibility text,
    title text,
    case_numbers text[],
    source_status text,
    extraction_status text,
    source_confidence numeric,
    metadata jsonb
  )
),
enriched as (
  select p.*, m.id as meeting_id
  from payload p
  join public.meetings m on m.pipc_idx_id = p.meeting_idx_id
)
insert into public.agenda_items (
  meeting_id,
  agenda_no,
  agenda_kind,
  visibility,
  title,
  case_numbers,
  source_status,
  agenda_key,
  original_agenda_no,
  section_order,
  item_order,
  extraction_status,
  source_confidence,
  metadata
)
select
  meeting_id,
  agenda_no,
  agenda_kind,
  visibility,
  title,
  coalesce(case_numbers, '{}'::text[]),
  source_status,
  agenda_key,
  original_agenda_no,
  section_order,
  item_order,
  extraction_status,
  source_confidence,
  metadata
from enriched
on conflict (meeting_id, agenda_key) where agenda_key is not null do update
set agenda_no = excluded.agenda_no,
    agenda_kind = excluded.agenda_kind,
    visibility = excluded.visibility,
    title = excluded.title,
    case_numbers = excluded.case_numbers,
    source_status = excluded.source_status,
    original_agenda_no = excluded.original_agenda_no,
    section_order = excluded.section_order,
    item_order = excluded.item_order,
    extraction_status = excluded.extraction_status,
    source_confidence = excluded.source_confidence,
    metadata = public.agenda_items.metadata || excluded.metadata,
    updated_at = now();

with counts as (
  select
    meeting_id,
    count(*)::integer as agenda_count,
    count(*) filter (where visibility = 'public')::integer as public_agenda_count,
    count(*) filter (where visibility = 'private')::integer as private_agenda_count
  from public.agenda_items
  group by meeting_id
)
update public.meetings m
set agenda_count = c.agenda_count,
    public_agenda_count = c.public_agenda_count,
    private_agenda_count = c.private_agenda_count,
    updated_at = now()
from counts c
where m.id = c.meeting_id;
`;
}

function agendaDecisionLinksSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    meeting_idx_id text,
    agenda_key text,
    decision_idx_id text,
    link_method text,
    confidence numeric,
    notes text,
    metadata jsonb
  )
),
enriched as (
  select ai.id as agenda_item_id, dp.id as decision_post_id, p.link_method, p.confidence, p.notes, p.metadata
  from payload p
  join public.meetings m on m.pipc_idx_id = p.meeting_idx_id
  join public.agenda_items ai on ai.meeting_id = m.id and ai.agenda_key = p.agenda_key
  join public.decision_posts dp on dp.pipc_idx_id = p.decision_idx_id
)
insert into public.agenda_decision_links (agenda_item_id, decision_post_id, link_method, confidence, notes)
select agenda_item_id, decision_post_id, link_method, confidence, notes
from enriched
on conflict (agenda_item_id, decision_post_id) do update
set link_method = excluded.link_method,
    confidence = excluded.confidence,
    notes = excluded.notes;
`;
}

function utteranceAgendaLinksSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    meeting_idx_id text,
    agenda_key text,
    utterance_order integer,
    link_method text,
    confidence numeric
  )
),
enriched as (
  select u.id as utterance_id, ai.id as agenda_item_id, p.link_method, p.confidence
  from payload p
  join public.meetings m on m.pipc_idx_id = p.meeting_idx_id
  join public.agenda_items ai on ai.meeting_id = m.id and ai.agenda_key = p.agenda_key
  join public.utterances u on u.meeting_id = m.id and u.utterance_order = p.utterance_order
)
update public.utterances u
set agenda_item_id = e.agenda_item_id,
    confidence = greatest(coalesce(u.confidence, 0), e.confidence),
    metadata = u.metadata || jsonb_build_object(
      'agenda_link_method', e.link_method,
      'agenda_link_confidence', e.confidence
    ),
    updated_at = now()
from enriched e
where u.id = e.utterance_id;
`;
}

async function uploadSeed(seed) {
  const operations = [
    ["agenda_items", seed.agendas, 250, agendaItemsSql],
    ["agenda_decision_links", seed.agenda_decision_links, 250, agendaDecisionLinksSql],
    ["utterance_agenda_links", seed.utterance_agenda_links, 500, utteranceAgendaLinksSql],
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

function countBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function topEntries(map, limit = 20) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "ko")).slice(0, limit);
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

function writeOutputs(seed) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(indexDir, { recursive: true });
  fs.writeFileSync(seedJsonPath, JSON.stringify(seed, null, 2), "utf8");

  writeCsv(agendaCsvPath, seed.agendas, [
    "meeting_idx_id",
    "meeting_date",
    "agenda_key",
    "agenda_no",
    "original_agenda_no",
    "agenda_kind",
    "visibility",
    "title",
    "case_numbers",
    "source_status",
    "source_confidence",
  ]);
  writeCsv(agendaDecisionCsvPath, seed.agenda_decision_links, [
    "meeting_idx_id",
    "agenda_key",
    "decision_idx_id",
    "link_method",
    "confidence",
    "notes",
  ]);
  writeCsv(utteranceAgendaCsvPath, seed.utterance_agenda_links, [
    "meeting_idx_id",
    "agenda_key",
    "utterance_order",
    "link_method",
    "confidence",
  ]);

  const byKind = countBy(seed.agendas, (row) => row.agenda_kind);
  const byVisibility = countBy(seed.agendas, (row) => row.visibility);
  const byMeeting = countBy(seed.agendas, (row) => row.meeting_idx_id);
  const meetingsWithAgenda = byMeeting.size;
  const generatedDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  const sampleRows = seed.agendas.slice(0, 20).map((row) => ({
    date: row.meeting_date,
    meeting: row.meeting_idx_id,
    no: row.agenda_no,
    kind: kindLabel(row.agenda_kind),
    visibility: row.visibility,
    title: row.title,
  }));

  const report = `# 회의 안건 Seed 리포트

생성일: ${generatedDate}

회의 페이지 의사일정에서 공식 상정안건 후보를 추출하고, 같은 날짜/사건번호/제목을 기준으로 결정문 게시글과 1차 연결했습니다. 속기록 발언은 안건번호 상정 멘트를 기준으로 안건 구간에 연결했습니다.

## 생성 현황

- 안건 후보: ${seed.agendas.length}
- 안건이 추출된 회의: ${meetingsWithAgenda}
- 결정문 게시글 링크 후보: ${seed.agenda_decision_links.length}
- 발언-안건 링크 후보: ${seed.utterance_agenda_links.length}

## 안건 종류별

${makeMarkdownTable(
  ["agenda_kind", "count"],
  topEntries(byKind).map(([agenda_kind, count]) => ({ agenda_kind, count }))
)}

## 공개 여부별

${makeMarkdownTable(
  ["visibility", "count"],
  topEntries(byVisibility).map(([visibility, count]) => ({ visibility, count }))
)}

## 안건 샘플

${makeMarkdownTable(["date", "meeting", "no", "kind", "visibility", "title"], sampleRows)}

## 산출물

- 안건 CSV: \`pipc_knowledge_base/90_normalized_data/agenda_item_candidates.csv\`
- 결정문 링크 CSV: \`pipc_knowledge_base/90_normalized_data/agenda_decision_link_candidates.csv\`
- 발언-안건 링크 CSV: \`pipc_knowledge_base/90_normalized_data/utterance_agenda_link_candidates.csv\`
- JSON: \`pipc_knowledge_base/90_normalized_data/agenda_seed.json\`

## 주의

- 회의 페이지의 의사일정은 상정 예정안 기준입니다. 실제 회의 진행 결과는 회의록/속기록과 결정문으로 후속 검증해야 합니다.
- 발언-안건 연결은 공개적으로 진행된 안건의 상정 멘트를 기준으로 한 1차 구간 추정입니다.
- 비공개 안건은 속기록에 상세 발언이 없거나 생략될 수 있으므로 없는 내용을 있는 것처럼 보강하지 않습니다.
`;

  fs.writeFileSync(reportPath, report, "utf8");
}

const agendas = parseAllAgendas();
const agendaDecisionLinks = buildDecisionLinks(agendas);
const utteranceAgendaLinks = buildUtteranceAgendaLinks(agendas);
const seed = {
  generated_at: new Date().toISOString(),
  agendas,
  agenda_decision_links: agendaDecisionLinks,
  utterance_agenda_links: utteranceAgendaLinks,
};

writeOutputs(seed);

console.log(
  JSON.stringify(
    {
      agendas: agendas.length,
      meetings_with_agendas: new Set(agendas.map((row) => row.meeting_idx_id)).size,
      agenda_decision_links: agendaDecisionLinks.length,
      utterance_agenda_links: utteranceAgendaLinks.length,
      csv: path.relative(ROOT, agendaCsvPath),
      decision_links_csv: path.relative(ROOT, agendaDecisionCsvPath),
      utterance_links_csv: path.relative(ROOT, utteranceAgendaCsvPath),
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
