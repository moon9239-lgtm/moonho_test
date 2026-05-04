import test from "node:test";
import assert from "node:assert/strict";
import { buildAnimationTimeline, findSceneIndexByUtteranceId } from "../src/animation-model.mjs";

test("buildAnimationTimeline converts utterances into ordered scenes", () => {
  const timeline = buildAnimationTimeline({
    meeting: { id: "m1", meetingLabel: "2026년 제5회" },
    utterances: [
      { id: "u1", speaker: "위원장", text: "개의하겠습니다." },
      { id: "u2", speaker: "위원", text: "질문드리겠습니다." },
    ],
  });

  assert.equal(timeline.meetingId, "m1");
  assert.equal(timeline.scenes.length, 4);
  assert.equal(timeline.scenes[0].type, "opening");
  assert.equal(timeline.scenes[1].utteranceId, "u1");
  assert.equal(timeline.scenes[3].type, "closing");
});

test("findSceneIndexByUtteranceId supports transcript click jump", () => {
  const timeline = buildAnimationTimeline({
    meeting: { id: "m1", meetingLabel: "2026년 제5회" },
    utterances: [{ id: "u1", speaker: "위원장", text: "개의하겠습니다." }],
  });

  assert.equal(findSceneIndexByUtteranceId(timeline, "u1"), 1);
});

test("findSceneIndexByUtteranceId tolerates invalid scenes", () => {
  assert.equal(findSceneIndexByUtteranceId({ scenes: {} }, "u1"), -1);
  assert.equal(findSceneIndexByUtteranceId({ scenes: "bad" }, "u1"), -1);
});
