import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const RAW_CHUNK_SIZE = 30000;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function uuidOrNull(value) {
  const text = String(value || "");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)
    ? text
    : null;
}

async function executeSql(query, label) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is not set.");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ query }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${label || "query"} failed (${response.status}): ${text.slice(0, 2000)}`);
  }
  return text ? JSON.parse(text) : [];
}

async function readWindowPayload(file, globalName) {
  const raw = await readFile(file, "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(raw, context, { timeout: 15000 });
  const payload = context.window[globalName];
  if (!payload) throw new Error(`${globalName} was not found in ${file}.`);
  return { raw, payload };
}

function chunkBase64(raw) {
  const buffer = Buffer.from(raw, "utf8");
  const chunks = [];
  for (let offset = 0; offset < buffer.length; offset += RAW_CHUNK_SIZE) {
    const part = buffer.subarray(offset, Math.min(offset + RAW_CHUNK_SIZE, buffer.length));
    chunks.push({
      chunk_index: chunks.length,
      chunk_text: part.toString("base64"),
      byte_size: part.length,
      sha256: sha256(part),
    });
  }
  return { chunks, byteSize: buffer.length, digest: sha256(buffer) };
}

async function uploadArtifact({ key, sourceFile, raw, payload, summary }) {
  const { chunks, byteSize, digest } = chunkBase64(raw);

  await executeSql(
    `update public.dashboard_generated_artifacts set is_current = false where artifact_key = ${sqlLiteral(key)} and is_current`,
    `clear current ${key}`,
  );

  const rows = await executeSql(
    `
      insert into public.dashboard_generated_artifacts (
        artifact_key, artifact_version, source_file, source_kind, generated_at,
        sha256, byte_size, chunk_count, status, is_current, payload_summary, metadata
      ) values (
        ${sqlLiteral(key)}, 'current', ${sqlLiteral(sourceFile)}, 'javascript',
        ${payload?.generatedAt ? `${sqlLiteral(payload.generatedAt)}::timestamptz` : "now()"},
        ${sqlLiteral(digest)}, ${byteSize}, ${chunks.length}, 'uploaded', true,
        ${sqlLiteral(JSON.stringify(summary || {}))}::jsonb,
        ${sqlLiteral(JSON.stringify({
          syncedBy: "tools/sync-dashboard-artifacts.mjs",
          syncedAt: new Date().toISOString(),
          chunkRawSize: RAW_CHUNK_SIZE,
        }))}::jsonb
      )
      on conflict (artifact_key, sha256) do update set
        artifact_version = excluded.artifact_version,
        source_file = excluded.source_file,
        source_kind = excluded.source_kind,
        generated_at = excluded.generated_at,
        byte_size = excluded.byte_size,
        chunk_count = excluded.chunk_count,
        status = excluded.status,
        is_current = true,
        payload_summary = excluded.payload_summary,
        metadata = excluded.metadata,
        updated_at = now()
      returning id::text as id
    `,
    `upsert ${key}`,
  );

  const artifactId = rows[0]?.id;
  if (!artifactId) throw new Error(`No artifact id returned for ${key}.`);

  await executeSql(
    `delete from public.dashboard_generated_artifact_chunks where artifact_id = ${sqlLiteral(artifactId)}::uuid`,
    `clear chunks ${key}`,
  );

  for (let index = 0; index < chunks.length; index += 10) {
    const batch = chunks.slice(index, index + 10);
    const values = batch
      .map((chunk) =>
        [
          `(${sqlLiteral(artifactId)}::uuid`,
          chunk.chunk_index,
          sqlLiteral(chunk.chunk_text),
          "'base64'",
          chunk.byte_size,
          `${sqlLiteral(chunk.sha256)})`,
        ].join(", "),
      )
      .join(",\n");

    await executeSql(
      `
        insert into public.dashboard_generated_artifact_chunks (
          artifact_id, chunk_index, chunk_text, encoding, byte_size, sha256
        ) values ${values}
        on conflict (artifact_id, chunk_index) do update set
          chunk_text = excluded.chunk_text,
          encoding = excluded.encoding,
          byte_size = excluded.byte_size,
          sha256 = excluded.sha256
      `,
      `upload chunks ${key} ${index}-${index + batch.length - 1}`,
    );
  }

  console.log(`${key}: artifact=${artifactId} bytes=${byteSize} chunks=${chunks.length}`);
  return artifactId;
}

async function insertJsonRows({ table, artifactId, rows, columns, conflict, batchSize = 20 }) {
  await executeSql(
    `delete from public.${table} where generated_artifact_id = ${sqlLiteral(artifactId)}::uuid`,
    `clear ${table}`,
  );
  if (!rows.length) {
    console.log(`${table}: rows=0`);
    return;
  }

  const columnNames = columns.map((column) => column.name).join(", ");
  const recordDefinition = columns.map((column) => `${column.name} ${column.type}`).join(", ");
  const updateSet = columns
    .filter((column) => !column.noUpdate)
    .map((column) => `${column.name}=excluded.${column.name}`)
    .join(", ");

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    await executeSql(
      `
        insert into public.${table} (${columnNames})
        select ${columnNames}
        from jsonb_to_recordset(${sqlLiteral(JSON.stringify(batch))}::jsonb)
          as x(${recordDefinition})
        on conflict ${conflict} do update set ${updateSet}
      `,
      `${table} ${index}-${index + batch.length - 1}`,
    );
  }

  console.log(`${table}: rows=${rows.length}`);
}

function buildMeetingRows(artifactId, payload) {
  return (payload.compactMeetings || [])
    .map((item) => ({
      generated_artifact_id: artifactId,
      meeting_id: uuidOrNull(item.id),
      meeting_date: item.date || null,
      meeting_year: item.year ?? null,
      quarter: item.quarter ?? null,
      meeting_label: item.meetingLabel || null,
      title: item.title || null,
      source_path: item.sourcePath || null,
      agenda_count: item.agendaCount ?? null,
      utterance_count: item.utteranceCount ?? null,
      law_reference_count: item.lawReferenceCount ?? null,
      targets: item.targets || [],
      keywords: item.keywords || [],
      law_articles: item.lawArticles || [],
      speakers: item.speakers || [],
      payload: item,
    }))
    .filter((row) => row.meeting_id);
}

function buildSearchRows(artifactId, payload) {
  return (payload.searchIndex || []).map((item) => {
    const compactPayload = { ...item };
    delete compactPayload.searchText;
    return {
      generated_artifact_id: artifactId,
      entry_id: item.id,
      meeting_id: uuidOrNull(item.meetingId),
      meeting_date: item.date || null,
      meeting_year: item.year ?? null,
      quarter: item.quarter ?? null,
      quarter_key: item.quarterKey || null,
      meeting_label: item.meetingLabel || null,
      title: item.title || "",
      agenda_type: item.type || null,
      start_utterance_id: item.startUtteranceId || null,
      utterance_count: item.utteranceCount ?? null,
      targets: item.targets || [],
      law_articles: item.lawArticles || [],
      issue_tags: item.issueTags || [],
      dispositions: item.dispositions || [],
      amount_total_krw: item.amountTotalKrw ?? null,
      amount_text: item.amountText || null,
      case_ids: item.caseIds || [],
      source_confidence: item.sourceConfidence || [],
      similar_agendas: item.similarAgendas || [],
      speakers: item.speakers || [],
      keywords: item.keywords || [],
      snippet: item.snippet || null,
      is_procedural: Boolean(item.isProcedural),
      search_text: item.searchText || null,
      payload: compactPayload,
    };
  });
}

function buildCharacterRows(artifactId, payload) {
  return (payload.characterAssets || []).map((item) => ({
    generated_artifact_id: artifactId,
    character_id: item.id,
    name: item.name || "",
    role: item.role || null,
    status: item.status || null,
    character_type: item.characterType || null,
    asset_path: item.asset || null,
    aliases: item.aliases || [],
    payload: item,
  }));
}

async function main() {
  const dashboard = await readWindowPayload("data/dashboard-data.js", "PIPC_DASHBOARD_DATA");
  const analysis = await readWindowPayload("data/meeting-analysis-index.js", "PIPC_MEETING_ANALYSIS_INDEX");

  await uploadArtifact({
    key: "dashboard-data",
    sourceFile: "pipc_dashboard/data/dashboard-data.js",
    raw: dashboard.raw,
    payload: dashboard.payload,
    summary: {
      keys: Object.keys(dashboard.payload),
      generatedAt: dashboard.payload.generatedAt,
    },
  });

  const analysisArtifactId = await uploadArtifact({
    key: "meeting-analysis-index",
    sourceFile: "pipc_dashboard/data/meeting-analysis-index.js",
    raw: analysis.raw,
    payload: analysis.payload,
    summary: {
      totals: analysis.payload.totals,
      generatedAt: analysis.payload.generatedAt,
      source: analysis.payload.source,
      compactMeetings: analysis.payload.compactMeetings?.length || 0,
      searchIndex: analysis.payload.searchIndex?.length || 0,
      characterAssets: analysis.payload.characterAssets?.length || 0,
    },
  });

  await insertJsonRows({
    table: "dashboard_meeting_analysis_summaries",
    artifactId: analysisArtifactId,
    rows: buildMeetingRows(analysisArtifactId, analysis.payload),
    conflict: "(generated_artifact_id, meeting_id)",
    columns: [
      { name: "generated_artifact_id", type: "uuid", noUpdate: true },
      { name: "meeting_id", type: "uuid", noUpdate: true },
      { name: "meeting_date", type: "date" },
      { name: "meeting_year", type: "integer" },
      { name: "quarter", type: "integer" },
      { name: "meeting_label", type: "text" },
      { name: "title", type: "text" },
      { name: "source_path", type: "text" },
      { name: "agenda_count", type: "integer" },
      { name: "utterance_count", type: "integer" },
      { name: "law_reference_count", type: "integer" },
      { name: "targets", type: "text[]" },
      { name: "keywords", type: "text[]" },
      { name: "law_articles", type: "text[]" },
      { name: "speakers", type: "jsonb" },
      { name: "payload", type: "jsonb" },
    ],
  });

  await insertJsonRows({
    table: "dashboard_agenda_search_entries",
    artifactId: analysisArtifactId,
    rows: buildSearchRows(analysisArtifactId, analysis.payload),
    conflict: "(generated_artifact_id, entry_id)",
    batchSize: 1,
    columns: [
      { name: "generated_artifact_id", type: "uuid", noUpdate: true },
      { name: "entry_id", type: "text", noUpdate: true },
      { name: "meeting_id", type: "uuid" },
      { name: "meeting_date", type: "date" },
      { name: "meeting_year", type: "integer" },
      { name: "quarter", type: "integer" },
      { name: "quarter_key", type: "text" },
      { name: "meeting_label", type: "text" },
      { name: "title", type: "text" },
      { name: "agenda_type", type: "text" },
      { name: "start_utterance_id", type: "text" },
      { name: "utterance_count", type: "integer" },
      { name: "targets", type: "text[]" },
      { name: "law_articles", type: "text[]" },
      { name: "issue_tags", type: "text[]" },
      { name: "dispositions", type: "text[]" },
      { name: "amount_total_krw", type: "bigint" },
      { name: "amount_text", type: "text" },
      { name: "case_ids", type: "text[]" },
      { name: "source_confidence", type: "jsonb" },
      { name: "similar_agendas", type: "jsonb" },
      { name: "speakers", type: "text[]" },
      { name: "keywords", type: "text[]" },
      { name: "snippet", type: "text" },
      { name: "is_procedural", type: "boolean" },
      { name: "search_text", type: "text" },
      { name: "payload", type: "jsonb" },
    ],
  });

  await insertJsonRows({
    table: "dashboard_commissioner_character_assets",
    artifactId: analysisArtifactId,
    rows: buildCharacterRows(analysisArtifactId, analysis.payload),
    conflict: "(generated_artifact_id, character_id)",
    columns: [
      { name: "generated_artifact_id", type: "uuid", noUpdate: true },
      { name: "character_id", type: "text", noUpdate: true },
      { name: "name", type: "text" },
      { name: "role", type: "text" },
      { name: "status", type: "text" },
      { name: "character_type", type: "text" },
      { name: "asset_path", type: "text" },
      { name: "aliases", type: "text[]" },
      { name: "payload", type: "jsonb" },
    ],
  });

  await executeSql(
    `
      update public.dashboard_commissioner_character_assets a
      set commissioner_id = c.id
      from public.commissioners c
      where a.generated_artifact_id = ${sqlLiteral(analysisArtifactId)}::uuid
        and a.commissioner_id is null
        and c.name = a.name
    `,
    "resolve commissioner ids",
  );

  const verification = await executeSql(
    `
      select 'current_artifacts' as item, count(*)::bigint as count from public.dashboard_current_generated_artifacts
      union all select 'current_chunks', count(*) from public.dashboard_generated_artifact_chunks c join public.dashboard_generated_artifacts a on a.id = c.artifact_id where a.is_current
      union all select 'meeting_summaries', count(*) from public.dashboard_current_meeting_analysis_summaries
      union all select 'agenda_search_entries', count(*) from public.dashboard_current_agenda_search_entries
      union all select 'character_assets', count(*) from public.dashboard_current_commissioner_character_assets
    `,
    "verify artifact sync",
  );
  console.log(JSON.stringify(verification, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
