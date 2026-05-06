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

test("buildAnimationTimeline maps 2026 fifth meeting speakers to actors", () => {
  const timeline = buildAnimationTimeline({
    meeting: { id: "a47c6ac8-3acb-4644-8048-0f5333cc3102", meetingLabel: "2026년 제5회 보호위원회" },
    characters: [
      { id: "song_kyunghee", name: "송경희", role: "위원장", status: "current", aliases: ["위원장 송경희"] },
      { id: "kim_jinwook", name: "김진욱", role: "위원", status: "current", aliases: ["위원 김진욱"] },
      { id: "park_sanghee", name: "박상희", role: "위원", status: "current", aliases: ["위원 박상희"] },
    ],
    utterances: [
      { id: "u1", speaker: "위원장 송경희", speakerName: "송경희", speakerRole: "위원장", text: "개의하겠습니다." },
      { id: "u2", speaker: "조사총괄과장 강대현", speakerName: "강대현", speakerRole: "조사총괄과장", text: "보고드리겠습니다." },
      { id: "u3", speaker: "위원 김진욱", speakerName: "김진욱", speakerRole: "위원", text: "질문드리겠습니다." },
    ],
  });

  assert.equal(timeline.completedMeetingAnimation, true);
  assert.equal(timeline.scenes[1].memberId, "song_kyunghee");
  assert.match(timeline.scenes[2].memberId, /^staff-/);
  assert.equal(timeline.scenes[3].memberId, "kim_jinwook");
  assert.equal(timeline.staffActors.length, 1);
});
