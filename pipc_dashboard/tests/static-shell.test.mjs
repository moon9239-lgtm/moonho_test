import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("dashboard shell and legacy scripts do not show removed filter affordances", async () => {
  for (const path of ["index-fixed.html", "index.html", "standalone.html", "app.js", "standalone.js"]) {
    const text = await readFile(path, "utf8");
    assert.doesNotMatch(text, /필터 초기화/);
    assert.doesNotMatch(text, /필터 없음/);
    assert.doesNotMatch(text, /clear-filter/);
    assert.doesNotMatch(text, /filter-preview/);
  }
});

test("standalone situation board does not restore removed status widgets", async () => {
  const script = await readFile("standalone.js", "utf8");
  assert.doesNotMatch(script, /속기록 발언/);
  assert.doesNotMatch(script, /검색 가능 안건 구간/);
  assert.doesNotMatch(script, /최근 분기별 회의 운영 통계/);
  assert.doesNotMatch(script, /회의 바로가기/);
});

test("commissioner character assets are deployable from the dashboard root", async () => {
  const loader = await readFile("src/character-assets.mjs", "utf8");
  const model = await readFile("src/commissioner-model.mjs", "utf8");

  assert.match(loader, /data\/commissioners\/characters\.json/);
  assert.match(model, /assets\/commissioners\/\$\{character\.id\}_sd3d_character\.png/);
  assert.doesNotMatch(loader, /\.\.\/pipc_knowledge_base/);
});

test("commissioner cards use a single-column layout with large portraits", async () => {
  const css = await readFile("styles.css", "utf8");
  assert.match(css, /\.commissioner-grid\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(css, /\.commissioner-card\s*\{[^}]*grid-template-columns:\s*minmax\(340px,\s*390px\)\s+minmax\(0,\s*1fr\);/s);
  assert.match(css, /\.commissioner-portrait\s*\{[^}]*height:\s*620px;[^}]*min-height:\s*620px;/s);
  assert.match(css, /\.commissioner-portrait img\s*\{[^}]*width:\s*min\(100%,\s*360px\);[^}]*height:\s*590px;[^}]*object-fit:\s*contain;/s);
  assert.doesNotMatch(css, /\.commissioner-portrait img\s*\{[^}]*transform:\s*scale/s);
  assert.match(css, /\.commissioner-insight-grid\s*\{[^}]*grid-template-columns:\s*1fr;/s);

  const mobileCss = css.slice(css.indexOf("@media (max-width: 760px)"));
  assert.match(mobileCss, /\.commissioner-card\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(mobileCss, /\.commissioner-portrait\s*\{[^}]*height:\s*520px;[^}]*min-height:\s*520px;/s);
  assert.match(mobileCss, /\.commissioner-portrait img\s*\{[^}]*width:\s*min\(100%,\s*310px\);[^}]*height:\s*500px;/s);
  assert.doesNotMatch(mobileCss, /\.commissioner-portrait img\s*\{[^}]*transform:\s*scale/s);
});
