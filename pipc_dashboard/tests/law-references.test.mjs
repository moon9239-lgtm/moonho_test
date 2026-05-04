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
