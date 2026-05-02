import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const SUPABASE_API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

const args = new Set(process.argv.slice(2));
const shouldDryRun = args.has("--dry-run");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

const MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const DIMENSIONS = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 1536);
const OPENAI_BATCH_SIZE = Number(process.env.OPENAI_EMBEDDING_BATCH_SIZE || 64);
const UPDATE_BATCH_SIZE = Number(process.env.EMBEDDING_UPDATE_BATCH_SIZE || 32);
const MAX_RETRIES = Number(process.env.EMBEDDING_MAX_RETRIES || 6);

const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const indexDir = path.join(ROOT, "pipc_knowledge_base", "00_indexes");
const runLogPath = path.join(outDir, "document_embeddings_run.json");
const reportPath = path.join(indexDir, "document_embeddings_seed_report.md");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sqlJsonLiteral(rows) {
  const tag = `emb_${Math.random().toString(16).slice(2)}`;
  return `$${tag}$${JSON.stringify(rows)}$${tag}$::jsonb`;
}

function chunks(values, size) {
  const result = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
}

async function supabaseSql(label, sql) {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) throw new Error("SUPABASE_ACCESS_TOKEN is not set.");

  const response = await fetch(SUPABASE_API_BASE, {
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

  if (!body.trim()) return [];
  try {
    return JSON.parse(body);
  } catch {
    return [{ raw_body: body }];
  }
}

function missingChunksSql() {
  const limitSql = Number.isFinite(limit) && limit > 0 ? `limit ${Math.floor(limit)}` : "";
  return `
select
  chunk_id::text,
  source_document_id::text,
  source_type,
  source_id::text,
  chunk_index,
  document_type,
  document_title,
  document_date::text,
  raw_md_path,
  coalesce(heading, '') as heading,
  token_count,
  chunk_text
from public.dashboard_document_chunk_search_index
where has_embedding = false
order by document_type, document_date nulls last, source_document_id, chunk_index
${limitSql};
`;
}

function coverageSql() {
  return `
select
  count(*)::bigint as total_chunks,
  count(*) filter (where embedding is not null)::bigint as chunks_with_embedding,
  count(*) filter (where embedding is null)::bigint as chunks_missing_embedding,
  count(distinct source_document_id) filter (where embedding is not null)::bigint as source_documents_with_embedding
from public.document_chunks;
`;
}

function coverageByDocumentTypeSql() {
  return `
select *
from public.dashboard_document_chunk_coverage
order by chunk_rows desc;
`;
}

function embeddingToVectorLiteral(embedding) {
  return `[${embedding.map((value) => {
    if (!Number.isFinite(value)) return "0";
    return Number(value).toPrecision(8);
  }).join(",")}]`;
}

function updateEmbeddingsSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    chunk_id uuid,
    embedding_text text,
    embedding_model text,
    embedding_dimensions integer,
    embedding_generated_at timestamptz
  )
)
update public.document_chunks dc
set embedding = p.embedding_text::extensions.vector,
    metadata = dc.metadata || jsonb_build_object(
      'embedding_status', 'ready',
      'embedding_model', p.embedding_model,
      'embedding_dimensions', p.embedding_dimensions,
      'embedding_generated_at', p.embedding_generated_at
    )
from payload p
where dc.id = p.chunk_id
returning dc.id;
`;
}

async function embedBatch(batch, batchLabel) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

  const body = {
    model: MODEL,
    input: batch.map((row) => row.chunk_text),
    dimensions: DIMENSIONS,
    encoding_format: "float",
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(`${OPENAI_API_BASE}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    if (response.ok) {
      const json = JSON.parse(text);
      if (!Array.isArray(json.data) || json.data.length !== batch.length) {
        throw new Error(`${batchLabel} returned unexpected embedding count.`);
      }
      return json.data
        .sort((a, b) => a.index - b.index)
        .map((item) => item.embedding);
    }

    let errorCode = "";
    try {
      errorCode = JSON.parse(text)?.error?.code ?? "";
    } catch {
      errorCode = "";
    }
    const quotaBlocked = errorCode === "insufficient_quota";
    const retryable = !quotaBlocked && (response.status === 429 || response.status >= 500);
    if (!retryable || attempt === MAX_RETRIES) {
      throw new Error(`${batchLabel} OpenAI request failed (${response.status}): ${text.slice(0, 1000)}`);
    }

    const waitMs = Math.min(60_000, 1500 * 2 ** (attempt - 1));
    console.log(`[${batchLabel}] retry ${attempt}/${MAX_RETRIES} after ${waitMs}ms`);
    await sleep(waitMs);
  }

  throw new Error(`${batchLabel} exhausted retries.`);
}

function makeMarkdownTable(headers, rows) {
  if (!rows.length) return "_None_\n";
  const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((header) => escapeCell(row[header])).join(" | ")} |`),
  ].join("\n") + "\n";
}

async function writeReport(startedAt, finishedAt, targetRows, coverage, coverageByType) {
  const total = coverage[0] ?? {};
  const report = [
    "# Document Embeddings Seed Report",
    "",
    `- started_at: ${startedAt}`,
    `- finished_at: ${finishedAt}`,
    `- model: ${MODEL}`,
    `- dimensions: ${DIMENSIONS}`,
    `- dry_run: ${shouldDryRun ? "yes" : "no"}`,
    `- target_chunks_this_run: ${targetRows}`,
    `- total_chunks: ${total.total_chunks ?? ""}`,
    `- chunks_with_embedding: ${total.chunks_with_embedding ?? ""}`,
    `- chunks_missing_embedding: ${total.chunks_missing_embedding ?? ""}`,
    `- source_documents_with_embedding: ${total.source_documents_with_embedding ?? ""}`,
    "",
    "## Coverage By Document Type",
    "",
    makeMarkdownTable(
      [
        "document_type",
        "source_documents_total",
        "eligible_documents",
        "chunked_documents",
        "chunk_rows",
        "chunks_with_embedding",
        "chunked_eligible_ratio",
      ],
      coverageByType,
    ),
    "## Notes",
    "",
    "- Embeddings are generated only for chunks where `embedding is null`.",
    "- The script is resumable; rerunning it skips already embedded chunks.",
    "- The vector column is `extensions.vector(1536)`, so the embedding dimension is pinned to 1536.",
    "",
  ].join("\n");

  fs.writeFileSync(reportPath, report, "utf8");
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(indexDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const rows = await supabaseSql("missing_chunks", missingChunksSql());
  const tokenEstimate = rows.reduce((sum, row) => sum + Number(row.token_count ?? 0), 0);

  console.log(`Target chunks: ${rows.length}`);
  console.log(`Estimated tokens: ${tokenEstimate}`);
  console.log(`Model: ${MODEL}, dimensions: ${DIMENSIONS}`);

  if (shouldDryRun) {
    const coverage = await supabaseSql("coverage", coverageSql());
    const coverageByType = await supabaseSql("coverage_by_type", coverageByDocumentTypeSql());
    await writeReport(startedAt, new Date().toISOString(), rows.length, coverage, coverageByType);
    console.log(`Dry run report: ${reportPath}`);
    return;
  }

  const batches = chunks(rows, OPENAI_BATCH_SIZE);
  let embedded = 0;
  let updated = 0;
  const runState = {
    started_at: startedAt,
    model: MODEL,
    dimensions: DIMENSIONS,
    target_chunks: rows.length,
    estimated_tokens: tokenEstimate,
    batches_total: batches.length,
    batches_completed: 0,
    chunks_updated: 0,
  };

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    const batchLabel = `embed.${i + 1}/${batches.length}`;
    const embeddings = await embedBatch(batch, batchLabel);
    embedded += embeddings.length;

    const updateRows = batch.map((row, index) => ({
      chunk_id: row.chunk_id,
      embedding_text: embeddingToVectorLiteral(embeddings[index]),
      embedding_model: MODEL,
      embedding_dimensions: DIMENSIONS,
      embedding_generated_at: new Date().toISOString(),
    }));

    const updateBatches = chunks(updateRows, UPDATE_BATCH_SIZE);
    for (let j = 0; j < updateBatches.length; j += 1) {
      const result = await supabaseSql(`update.${i + 1}.${j + 1}`, updateEmbeddingsSql(updateBatches[j]));
      updated += result.length;
    }

    runState.batches_completed = i + 1;
    runState.chunks_updated = updated;
    runState.last_completed_at = new Date().toISOString();
    fs.writeFileSync(runLogPath, JSON.stringify(runState, null, 2), "utf8");

    if ((i + 1) % 10 === 0 || i + 1 === batches.length) {
      console.log(`[${batchLabel}] embedded=${embedded}, updated=${updated}`);
    }
  }

  const coverage = await supabaseSql("coverage", coverageSql());
  const coverageByType = await supabaseSql("coverage_by_type", coverageByDocumentTypeSql());
  const finishedAt = new Date().toISOString();
  await writeReport(startedAt, finishedAt, rows.length, coverage, coverageByType);

  console.log(`Updated embeddings: ${updated}`);
  console.log(`Run log: ${runLogPath}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
