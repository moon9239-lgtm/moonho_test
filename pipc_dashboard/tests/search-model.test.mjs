import test from "node:test";
import assert from "node:assert/strict";
import { buildSearchModel } from "../src/search-model.mjs";

const searchIndex = [
  {
    id: "row-1",
    date: "2026-03-11",
    meetingLabel: "2026년 제4회 보호위원회",
    title: "롯데카드 시정조치",
    type: "심의ㆍ의결",
    targets: ["롯데카드"],
    lawArticles: ["개인정보 보호법 제29조"],
    issueTags: ["안전조치", "접속기록"],
    dispositions: ["시정명령", "과징금"],
    snippet: "피심인 롯데카드 측 의견진술",
    searchText: "롯데카드 개인정보 보호법 제29조 안전조치 과징금",
  },
  {
    id: "row-2",
    date: "2026-02-11",
    meetingLabel: "2026년 제3회 보호위원회",
    title: "사전적정성 검토",
    type: "심의ㆍ의결",
    targets: [],
    lawArticles: ["개인정보 보호법 제15조"],
    issueTags: ["AI·자동화"],
    dispositions: [],
    snippet: "사전적정성 검토 결과",
    searchText: "사전적정성 AI 자동화",
  },
];

test("buildSearchModel filters by issue and disposition without speaker or keyword facets", () => {
  const model = buildSearchModel(
    { searchIndex, globalStats: {} },
    { issue: "안전조치", disposition: "과징금", facet: "speaker" },
  );

  assert.equal(model.rows.length, 1);
  assert.equal(model.rows[0].id, "row-1");
  assert.equal(model.filters.facet, "all");
  assert.deepEqual(new Set(model.filterOptions.issues), new Set(["AI·자동화", "안전조치", "접속기록"]));
  assert.deepEqual(new Set(model.filterOptions.dispositions), new Set(["과징금", "시정명령"]));
});
