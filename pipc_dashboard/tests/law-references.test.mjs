import test from "node:test";
import assert from "node:assert/strict";
import { extractLawReferences, buildLawLookupRequest } from "../src/law-references.mjs";

test("extractLawReferences finds Korean law article citations", () => {
  const refs = extractLawReferences("개인정보 보호법 제29조 및 같은 법 제34조 제1항 위반 여부를 검토하였다.");

  assert.equal(refs.length, 2);
  assert.equal(refs[0].lawName, "개인정보 보호법");
  assert.equal(refs[0].article, "제29조");
  assert.equal(refs[1].article, "제34조 제1항");
});

test("extractLawReferences skips same-law references without prior law context", () => {
  const refs = extractLawReferences("같은 법 제29조 위반 여부를 검토하였다.");

  assert.deepEqual(refs, []);
});

test("extractLawReferences keeps enforcement decree context for same-law references", () => {
  const refs = extractLawReferences("개인정보 보호법 시행령 제30조 및 같은 법 제32조");

  assert.equal(refs.length, 2);
  assert.equal(refs[0].lawName, "개인정보 보호법 시행령");
  assert.equal(refs[0].article, "제30조");
  assert.equal(refs[1].lawName, "개인정보 보호법 시행령");
  assert.equal(refs[1].article, "제32조");
});

test("extractLawReferences resolves credit information law context", () => {
  const refs = extractLawReferences("신용정보법 제32조와 같은 법 시행령 제37조의2 위반 여부를 검토합니다.");

  assert.equal(refs.length, 2);
  assert.equal(refs[0].lawName, "신용정보의 이용 및 보호에 관한 법률");
  assert.equal(refs[0].article, "제32조");
  assert.equal(refs[1].lawName, "신용정보의 이용 및 보호에 관한 법률 시행령");
  assert.equal(refs[1].article, "제37조의2");
});

test("extractLawReferences resolves PIPC operating rule citations", () => {
  const refs = extractLawReferences("개인정보 보호위원회 운영규칙 제12조 제1항 제4호에 의한 의사결정 과정에 있는 사항입니다.");

  assert.equal(refs.length, 1);
  assert.equal(refs[0].lawName, "개인정보 보호위원회 운영규칙");
  assert.equal(refs[0].article, "제12조 제1항 제4호");
});

test("extractLawReferences keeps research innovation law context across adjacent articles", () => {
  const refs = extractLawReferences("연구개발혁신법 제19조와 제20조에 따른 연구개발성과 관리 기준을 검토합니다.");

  assert.equal(refs.length, 2);
  assert.equal(refs[0].lawName, "국가연구개발혁신법");
  assert.equal(refs[0].article, "제19조");
  assert.equal(refs[1].lawName, "국가연구개발혁신법");
  assert.equal(refs[1].article, "제20조");
});

test("extractLawReferences keeps safety standard notice context across adjacent articles", () => {
  const refs = extractLawReferences("개인정보 보호법 제29조 및 개인정보의 안전성 확보조치 기준 고시 제5조, 제6조, 제8조 위반 여부를 검토합니다.");

  assert.equal(refs.length, 4);
  assert.equal(refs[0].lawName, "개인정보 보호법");
  assert.equal(refs[0].article, "제29조");
  assert.equal(refs[1].lawName, "개인정보의 안전성 확보조치 기준");
  assert.equal(refs[1].article, "제5조");
  assert.equal(refs[2].lawName, "개인정보의 안전성 확보조치 기준");
  assert.equal(refs[2].article, "제6조");
  assert.equal(refs[3].lawName, "개인정보의 안전성 확보조치 기준");
  assert.equal(refs[3].article, "제8조");
});

test("extractLawReferences does not invent privacy law for bare articles", () => {
  const refs = extractLawReferences("이 사안은 제19조와 제20조를 함께 검토해야 합니다.");

  assert.deepEqual(refs, []);
});

test("buildLawLookupRequest keeps meeting date and current comparison target", () => {
  const request = buildLawLookupRequest({
    lawName: "개인정보 보호법",
    article: "제29조",
    meetingDate: "2025-08-27",
  });

  assert.deepEqual(request, {
    lawName: "개인정보 보호법",
    article: "제29조",
    versions: [
      { label: "회의 당시", effectiveDate: "2025-08-27" },
      { label: "현재", effectiveDate: "current" },
    ],
  });
});
