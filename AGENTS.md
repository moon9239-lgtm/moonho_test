# Project Instructions

## Scope

This project builds and maintains the 개인정보 보호위원회 전체회의 dashboard and its source document knowledge base.

## Source Documents

- Treat `pipc_knowledge_base/99_raw` and `analysis_members` as source material unless the user says otherwise.
- For converted Korean Markdown, repair PDF/OCR line-break artifacts before using the text downstream. Examples include `ㅁ 일` + `시` -> `ㅁ 일시`, split speaker turns, broken Korean words, and headings split across lines.
- Preserve the original legal/meeting wording. Do not summarize, modernize, or reinterpret transcript content while cleaning formatting.

## Tooling

- Prefer oh-my-codex/OMX capabilities when available, especially project memory/wiki/state/code-intel/explore workflows for recovery, navigation, and durable notes.
- If the `omx` CLI shim is unavailable on PATH, use the configured package path or native Codex tools, and record durable project context in this file or `docs/`.
- Use Kordoc MCP when document conversion or Korean document structure extraction is needed. Prefer it for Korean official PDFs/HWP-style sources when available; fall back to existing converted Markdown, local scripts, or PDF extraction tools only when Kordoc is not exposed in the current session.

## Verification

- Dashboard tests: from `pipc_dashboard`, run `node --test --test-isolation=none tests\*.test.mjs`.
- For static preview, use `node pipc_dashboard\tools\static-server.mjs` from the project root, then open `http://127.0.0.1:5174/`.
