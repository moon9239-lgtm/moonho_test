import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTranscript } from "../src/transcript-model.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const transcriptPath = "pipc_knowledge_base/99_raw/transcripts/2025/2025-01-08_2025년_제1회_보호위원회_1_제1회_전체회의_속기록.md";
const outputPath = "pipc_dashboard/data/meeting-detail-2025-first.js";
const meeting = {
  id: "a800f391-4093-4ea9-8e20-74c4b12c4ee1",
  date: "2025-01-08",
  meetingLabel: "2025년 제1회 보호위원회",
};

const rawText = await readFile(resolve(root, transcriptPath), "utf8");
const parsed = parseTranscript(rawText, meeting);

const payload = {
  generatedAt: new Date().toISOString(),
  source: "kordoc-converted markdown + local transcript parser",
  mcpNotes: {
    koreanLawMcp: "korean-law-mcp@3.5.4 확인. LAW_OC 미설정 환경에서는 로컬 스냅샷과 조회 파라미터를 우선 표시합니다.",
    kordoc: "kordoc@2.4.0 변환 산출물 Markdown을 입력으로 사용했습니다.",
  },
  meetings: {
    [meeting.id]: {
      meetingId: meeting.id,
      sourcePath: transcriptPath,
      ...parsed,
    },
  },
};

const body = `window.PIPC_MEETING_DETAIL_INDEX = ${JSON.stringify(payload, null, 2)};\n`;
await writeFile(resolve(root, outputPath), body, "utf8");
console.log(`${outputPath} written: ${parsed.utterances.length} utterances, ${parsed.agendas.length} agendas, ${parsed.lawReferences.length} law references`);
