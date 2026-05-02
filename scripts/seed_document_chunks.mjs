import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "yfrjdbsaulawwqmuozao";
const API_BASE = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const args = new Set(process.argv.slice(2));
const shouldUpload = args.has("--upload");
const shouldReset = args.has("--reset");

const outDir = path.join(ROOT, "pipc_knowledge_base", "90_normalized_data");
const indexDir = path.join(ROOT, "pipc_knowledge_base", "00_indexes");
const manifestPath = path.join(outDir, "document_chunks_manifest.csv");
const samplePath = path.join(outDir, "document_chunks_sample.jsonl");
const reportPath = path.join(indexDir, "document_chunks_seed_report.md");

const MAX_CHARS = Number(process.env.DOCUMENT_CHUNK_MAX_CHARS || 1800);
const OVERLAP_CHARS = Number(process.env.DOCUMENT_CHUNK_OVERLAP_CHARS || 220);
const MIN_CHARS = Number(process.env.DOCUMENT_CHUNK_MIN_CHARS || 260);
const INSERT_BATCH_SIZE = Number(process.env.DOCUMENT_CHUNK_INSERT_BATCH_SIZE || 40);
const DELETE_BATCH_SIZE = Number(process.env.DOCUMENT_CHUNK_DELETE_BATCH_SIZE || 250);

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeRelPath(value) {
  return String(value ?? "").replace(/\\/g, "/").replace(/^\.?\//, "");
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

function sqlJsonLiteral(rows) {
  const tag = `doc_chunks_${Math.random().toString(16).slice(2)}`;
  return `$${tag}$${JSON.stringify(rows)}$${tag}$::jsonb`;
}

function chunks(values, size) {
  const result = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
}

async function querySql(label, sql) {
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

  if (!body.trim()) return [];
  try {
    return JSON.parse(body);
  } catch {
    return [{ raw_body: body }];
  }
}

function sourceDocumentsSql() {
  return `
select
  d.id::text as source_document_id,
  d.source_system,
  d.document_type,
  d.external_id,
  d.title,
  d.document_date::text as document_date,
  d.published_date::text as published_date,
  d.source_url,
  d.local_path,
  d.raw_md_path,
  d.file_name,
  d.file_ext,
  d.parse_status,
  target.source_type,
  target.source_id::text as source_id
from public.source_documents d
left join lateral (
  select source_type, source_id
  from (
    select 'meeting'::text as source_type, m.id as source_id, 1 as priority
    from public.meetings m
    where m.transcript_document_id = d.id
       or m.minutes_document_id = d.id
       or m.source_document_id = d.id
    union all
    select 'meeting'::text, mf.meeting_id, 2
    from public.meeting_files mf
    where mf.source_document_id = d.id
    union all
    select 'decision_case'::text, df.decision_case_id, 3
    from public.decision_files df
    where df.source_document_id = d.id
      and df.decision_case_id is not null
    union all
    select 'decision_post'::text, df.decision_post_id, 4
    from public.decision_files df
    where df.source_document_id = d.id
      and df.decision_post_id is not null
    union all
    select 'decision_post'::text, dp.id, 5
    from public.decision_posts dp
    where dp.source_document_id = d.id
    union all
    select 'decision_case'::text, dc.id, 6
    from public.decision_cases dc
    where dc.source_document_id = d.id
  ) candidates
  order by priority
  limit 1
) target on true
where d.raw_md_path is not null
  and d.raw_md_path <> ''
  and d.parse_status = 'converted'
order by d.document_type, d.document_date nulls last, d.external_id;
`;
}

function cleanMarkdown(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function headingOf(block) {
  const match = block.match(/^(#{1,6})\s+(.+)$/m);
  return match ? compact(match[2]).slice(0, 180) : "";
}

function splitIntoBlocks(text) {
  const normalized = cleanMarkdown(text);
  if (!normalized) return [];

  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const blocks = [];
  for (const block of rawBlocks) {
    if (block.length <= MAX_CHARS * 1.3) {
      blocks.push(block);
      continue;
    }

    const sentences = block
      .split(/(?<=[.!?。！？]|다\.|요\.|함\.|임\.)\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    if (sentences.length <= 1) {
      for (let i = 0; i < block.length; i += MAX_CHARS) {
        blocks.push(block.slice(i, i + MAX_CHARS).trim());
      }
      continue;
    }

    let buffer = "";
    for (const sentence of sentences) {
      const candidate = buffer ? `${buffer} ${sentence}` : sentence;
      if (candidate.length > MAX_CHARS && buffer.length >= MIN_CHARS) {
        blocks.push(buffer.trim());
        buffer = sentence;
      } else {
        buffer = candidate;
      }
    }
    if (buffer.trim()) blocks.push(buffer.trim());
  }

  return blocks;
}

function makeOverlap(text) {
  const compacted = text.replace(/\s+/g, " ").trim();
  if (compacted.length <= OVERLAP_CHARS) return compacted;
  return compacted.slice(-OVERLAP_CHARS);
}

function buildChunksForDocument(doc, text) {
  const blocks = splitIntoBlocks(text);
  const result = [];
  let buffer = "";
  let heading = "";

  function flush() {
    const chunkText = buffer.trim();
    if (!chunkText) return;
    result.push({
      source_document_id: doc.source_document_id,
      source_type: doc.source_type || doc.document_type,
      source_id: doc.source_id || null,
      chunk_index: result.length,
      chunk_text: chunkText,
      summary: compact(chunkText).slice(0, 260),
      token_count: Math.ceil(chunkText.length / 2),
      metadata: {
        document_type: doc.document_type,
        external_id: doc.external_id,
        title: doc.title,
        raw_md_path: doc.raw_md_path,
        document_date: doc.document_date,
        heading,
        char_count: chunkText.length,
        chunk_method: "markdown_block_v1",
        chunk_max_chars: MAX_CHARS,
        overlap_chars: OVERLAP_CHARS,
      },
    });
  }

  for (const block of blocks) {
    const blockHeading = headingOf(block);
    if (blockHeading) heading = blockHeading;

    if (!buffer) {
      buffer = block;
      continue;
    }

    const candidate = `${buffer}\n\n${block}`;
    if (candidate.length > MAX_CHARS && buffer.length >= MIN_CHARS) {
      const previous = buffer;
      flush();
      const overlap = makeOverlap(previous);
      buffer = overlap ? `${overlap}\n\n${block}` : block;
    } else {
      buffer = candidate;
    }
  }

  flush();
  return result;
}

function deleteChunksSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(source_document_id uuid)
)
delete from public.document_chunks dc
using payload p
where dc.source_document_id = p.source_document_id
returning dc.id;
`;
}

function insertChunksSql(rows) {
  return `
with payload as (
  select *
  from jsonb_to_recordset(${sqlJsonLiteral(rows)}) as x(
    source_document_id uuid,
    source_type text,
    source_id uuid,
    chunk_index integer,
    chunk_text text,
    summary text,
    token_count integer,
    metadata jsonb
  )
)
insert into public.document_chunks (
  source_document_id,
  source_type,
  source_id,
  chunk_index,
  chunk_text,
  summary,
  token_count,
  metadata
)
select
  source_document_id,
  source_type,
  source_id,
  chunk_index,
  chunk_text,
  summary,
  token_count,
  metadata
from payload
on conflict (source_document_id, chunk_index) do update
set source_type = excluded.source_type,
    source_id = excluded.source_id,
    chunk_text = excluded.chunk_text,
    summary = excluded.summary,
    token_count = excluded.token_count,
    metadata = excluded.metadata
returning id;
`;
}

function makeMarkdownTable(headers, rows) {
  if (rows.length === 0) return "_None_\n";
  const escapeCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, "<br>");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((header) => escapeCell(row[header])).join(" | ")} |`),
  ].join("\n") + "\n";
}

function countBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(indexDir, { recursive: true });

  const docs = await querySql("source_documents", sourceDocumentsSql());
  const manifestRows = [];
  const allChunks = [];
  const missingRows = [];

  for (const doc of docs) {
    const relPath = normalizeRelPath(doc.raw_md_path);
    const absolutePath = path.join(ROOT, relPath);
    if (!fs.existsSync(absolutePath)) {
      missingRows.push({ ...doc, absolute_path: absolutePath });
      manifestRows.push({
        source_document_id: doc.source_document_id,
        document_type: doc.document_type,
        external_id: doc.external_id,
        title: doc.title,
        raw_md_path: relPath,
        source_type: doc.source_type || doc.document_type,
        source_id: doc.source_id || "",
        chunk_count: 0,
        char_count: 0,
        status: "missing_file",
      });
      continue;
    }

    const text = readUtf8(absolutePath);
    const docChunks = buildChunksForDocument({ ...doc, raw_md_path: relPath }, text);
    allChunks.push(...docChunks);
    manifestRows.push({
      source_document_id: doc.source_document_id,
      document_type: doc.document_type,
      external_id: doc.external_id,
      title: doc.title,
      raw_md_path: relPath,
      source_type: doc.source_type || doc.document_type,
      source_id: doc.source_id || "",
      chunk_count: docChunks.length,
      char_count: text.length,
      status: docChunks.length > 0 ? "chunked" : "empty",
    });
  }

  writeCsv(manifestPath, manifestRows, [
    "source_document_id",
    "document_type",
    "external_id",
    "title",
    "raw_md_path",
    "source_type",
    "source_id",
    "chunk_count",
    "char_count",
    "status",
  ]);

  const samples = allChunks
    .filter((row, index) => index % Math.max(1, Math.floor(allChunks.length / 50)) === 0)
    .slice(0, 50)
    .map((row) => ({
      source_document_id: row.source_document_id,
      source_type: row.source_type,
      source_id: row.source_id,
      chunk_index: row.chunk_index,
      title: row.metadata.title,
      raw_md_path: row.metadata.raw_md_path,
      chunk_text_sample: row.chunk_text.slice(0, 500),
      token_count: row.token_count,
    }));
  fs.writeFileSync(samplePath, samples.map((row) => JSON.stringify(row)).join("\n") + "\n", "utf8");

  if (shouldUpload) {
    const docsToDelete = manifestRows
      .filter((row) => row.status === "chunked" || shouldReset)
      .map((row) => ({ source_document_id: row.source_document_id }));
    const deleteBatches = chunks(docsToDelete, DELETE_BATCH_SIZE);
    for (let i = 0; i < deleteBatches.length; i += 1) {
      await querySql(`delete.${i + 1}/${deleteBatches.length}`, deleteChunksSql(deleteBatches[i]));
      console.log(`[delete.${i + 1}/${deleteBatches.length}] ${deleteBatches[i].length} source docs`);
    }

    const insertBatches = chunks(allChunks, INSERT_BATCH_SIZE);
    for (let i = 0; i < insertBatches.length; i += 1) {
      await querySql(`insert.${i + 1}/${insertBatches.length}`, insertChunksSql(insertBatches[i]));
      if ((i + 1) % 25 === 0 || i + 1 === insertBatches.length) {
        console.log(`[insert.${i + 1}/${insertBatches.length}] uploaded`);
      }
    }
  }

  const byDocumentType = countBy(manifestRows, (row) => row.document_type)
    .map((row) => ({
      document_type: row.key,
      source_documents: row.count,
      chunked_documents: manifestRows.filter((item) => item.document_type === row.key && item.status === "chunked").length,
      chunks: allChunks.filter((item) => item.metadata.document_type === row.key).length,
    }));

  const bySourceType = countBy(allChunks, (row) => row.source_type)
    .map((row) => ({ source_type: row.key, chunks: row.count }));

  const report = [
    "# Document Chunks Seed Report",
    "",
    `- generated_at: ${new Date().toISOString()}`,
    `- upload: ${shouldUpload ? "yes" : "no"}`,
    `- source_documents_queried: ${docs.length}`,
    `- source_documents_chunked: ${manifestRows.filter((row) => row.status === "chunked").length}`,
    `- source_documents_missing_file: ${missingRows.length}`,
    `- chunks_generated: ${allChunks.length}`,
    `- max_chars: ${MAX_CHARS}`,
    `- overlap_chars: ${OVERLAP_CHARS}`,
    "",
    "## By Document Type",
    "",
    makeMarkdownTable(["document_type", "source_documents", "chunked_documents", "chunks"], byDocumentType),
    "## By Source Type",
    "",
    makeMarkdownTable(["source_type", "chunks"], bySourceType),
    "## Notes",
    "",
    "- Embeddings are not generated in this pass. The `embedding` column remains null.",
    "- Chunks are built only from converted source documents with `raw_md_path`.",
    "- Meeting pages, decision post pages, pending minutes files, and source-failed files remain unchunked by design.",
    "- Chunk text can be used for keyword/full-text style search now; semantic search needs the next embedding pass.",
    "",
  ].join("\n");
  fs.writeFileSync(reportPath, report, "utf8");

  console.log(`Docs queried: ${docs.length}`);
  console.log(`Docs chunked: ${manifestRows.filter((row) => row.status === "chunked").length}`);
  console.log(`Chunks generated: ${allChunks.length}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
