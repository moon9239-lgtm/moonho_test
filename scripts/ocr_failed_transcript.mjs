import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const canvasModule = require('../pipc_minutes_crawler/node_modules/@napi-rs/canvas');
const { createCanvas, DOMMatrix, ImageData, Path2D } = canvasModule;

globalThis.DOMMatrix = globalThis.DOMMatrix || DOMMatrix;
globalThis.ImageData = globalThis.ImageData || ImageData;
globalThis.Path2D = globalThis.Path2D || Path2D;

const pdfjsLib = await import('../pipc_minutes_crawler/node_modules/pdfjs-dist/legacy/build/pdf.mjs');
const { createWorker } = await import('../pipc_minutes_crawler/node_modules/tesseract.js/src/index.js');

const inputPdf = path.join(
  root,
  'pipc_minutes_crawler',
  'downloads',
  '2020',
  '2020-09-23_2020년_제4회_보호위원회_1_제4회_보호위원회_속기록.pdf',
);

const outputMd = path.join(
  root,
  'pipc_knowledge_base',
  '99_raw',
  'transcripts',
  '2020',
  '2020-09-23_2020년_제4회_보호위원회_1_제4회_보호위원회_속기록.md',
);

const cachePath = path.join(root, '.cache', 'tesseract');
const scale = Number(process.env.OCR_SCALE || '2.6');

class CanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    return { canvas, context };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
    canvasAndContext.context.fillStyle = '#ffffff';
    canvasAndContext.context.fillRect(0, 0, width, height);
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  }
}

function cleanOcrText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function renderPageToPng(page) {
  const viewport = page.getViewport({ scale });
  const canvasFactory = new CanvasFactory();
  const canvasAndContext = canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
  await page.render({
    canvasContext: canvasAndContext.context,
    viewport,
    canvasFactory,
    background: 'white',
  }).promise;
  const buffer = canvasAndContext.canvas.toBuffer('image/png');
  canvasFactory.destroy(canvasAndContext);
  return buffer;
}

await fs.mkdir(path.dirname(outputMd), { recursive: true });
await fs.mkdir(cachePath, { recursive: true });

const pdfData = new Uint8Array(await fs.readFile(inputPdf));
const loadingTask = pdfjsLib.getDocument({
  data: pdfData,
  disableWorker: true,
  useSystemFonts: true,
});
const pdf = await loadingTask.promise;

console.log(`OCR target: ${path.relative(root, inputPdf)}`);
console.log(`Pages: ${pdf.numPages}, scale=${scale}`);

const worker = await createWorker('kor+eng', 1, {
  cachePath,
  logger: (message) => {
    if (message.status === 'recognizing text') {
      const pct = Math.round((message.progress || 0) * 100);
      process.stdout.write(`\r  OCR progress ${pct}%`);
    }
  },
});

await worker.setParameters({
  preserve_interword_spaces: '1',
});

const parts = [
  '2020년 제4회 개인정보 보호위원회 속기록',
  '',
  '> OCR generated from an image-based PDF. Source: `pipc_minutes_crawler/downloads/2020/2020-09-23_2020년_제4회_보호위원회_1_제4회_보호위원회_속기록.pdf`',
  '',
];

for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
  const page = await pdf.getPage(pageNo);
  console.log(`\n[${pageNo}/${pdf.numPages}] render`);
  const png = await renderPageToPng(page);
  console.log(`[${pageNo}/${pdf.numPages}] recognize`);
  const result = await worker.recognize(png);
  process.stdout.write('\n');
  const text = cleanOcrText(result.data.text || '');
  parts.push(`## Page ${pageNo}`);
  parts.push('');
  parts.push(text || '[OCR text not detected]');
  parts.push('');
}

await worker.terminate();

const md = `${parts.join('\n').trim()}\n`;
await fs.writeFile(outputMd, md, 'utf8');

console.log(`OCR markdown written: ${path.relative(root, outputMd)}`);
