import test from "node:test";
import assert from "node:assert/strict";
import { formatHistoricalLawArticle, lawVersionsDiffer, selectEffectiveLawIdentityFromXml } from "../src/law-version-history.mjs";

test("selectEffectiveLawIdentityFromXml chooses exact law version effective on meeting date", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <LawSearch>
      <law>
        <법령명한글>개인정보 보호를 위한 상가건물 임대차보호법 시행령 등 일부개정령</법령명한글>
        <법령일련번호>125568</법령일련번호>
        <법령ID>011622</법령ID>
        <시행일자>20120523</시행일자>
      </law>
      <law>
        <법령명한글>개인정보 보호법</법령명한글>
        <법령일련번호>283839</법령일련번호>
        <법령ID>011357</법령ID>
        <시행일자>20260911</시행일자>
      </law>
      <law>
        <법령명한글>개인정보 보호법</법령명한글>
        <법령일련번호>270351</법령일련번호>
        <법령ID>011357</법령ID>
        <시행일자>20251002</시행일자>
      </law>
      <law>
        <법령명한글>개인정보 보호법</법령명한글>
        <법령일련번호>248613</법령일련번호>
        <법령ID>011357</법령ID>
        <시행일자>20250313</시행일자>
      </law>
    </LawSearch>`;

  assert.deepEqual(selectEffectiveLawIdentityFromXml(xml, "개인정보 보호법", "2026-03-11"), {
    lawName: "개인정보 보호법",
    mst: "270351",
    lawId: "011357",
    effectiveDate: "20251002",
  });
});

test("formatHistoricalLawArticle renders article text from lawService target=law JSON", () => {
  const json = JSON.stringify({
    법령: {
      기본정보: {
        법령명한글: "개인정보 보호법",
        공포일자: "20250401",
        시행일자: "20251002",
      },
      조문: {
        조문단위: [
          { 조문번호: "15", 조문여부: "전문", 조문내용: "제3장 개인정보의 처리" },
          {
            조문번호: "15",
            조문여부: "조문",
            조문제목: "개인정보의 수집ㆍ이용",
            조문내용: "제15조(개인정보의 수집ㆍ이용)",
            조문시행일자: "20251002",
            항: [
              {
                항번호: "①",
                항내용: "① 개인정보처리자는 다음 각 호의 어느 하나에 해당하는 경우 개인정보를 수집할 수 있다.",
                호: [
                  { 호번호: "1.", 호내용: "1. 정보주체의 동의를 받은 경우" },
                  { 호번호: "2.", 호내용: "2. 법률에 특별한 규정이 있는 경우" },
                ],
              },
            ],
          },
        ],
      },
    },
  });

  const result = formatHistoricalLawArticle(json, {
    lawName: "개인정보 보호법",
    article: "제15조",
    effectiveDate: "2026-03-11",
  });

  assert.equal(result.isError, false);
  assert.equal(result.lawName, "개인정보 보호법");
  assert.equal(result.effectiveDate, "20251002");
  assert.match(result.articleText, /법령명: 개인정보 보호법/);
  assert.match(result.articleText, /제15조\(개인정보의 수집ㆍ이용\)/);
  assert.match(result.articleText, /1\. 정보주체의 동의를 받은 경우/);
});

test("lawVersionsDiffer treats identical effective law versions as unchanged", () => {
  const meeting = {
    lawName: "개인정보 보호법",
    mst: "270351",
    effectiveDate: "20251002",
    articleText: "법령명: 개인정보 보호법\n시행일: 20251002\n제15조 개인정보의 수집ㆍ이용\n제15조(개인정보의 수집ㆍ이용) 본문",
  };
  const current = {
    lawName: "개인정보 보호법",
    mst: "270351",
    effectiveDate: "20251002",
    articleText: "법령명: 개인정보 보호법 공포일: 20250401 시행일: 20251002 제15조 개인정보의 수집ㆍ이용 제15조(개인정보의 수집ㆍ이용) 본문",
  };

  assert.equal(lawVersionsDiffer(meeting, current), false);
});
