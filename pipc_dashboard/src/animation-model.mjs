export function buildAnimationTimeline({ meeting = {}, utterances = [], characters = [] } = {}) {
  const meetingLabel = meeting.meetingLabel || "";
  const scenes = [
    {
      id: "opening",
      type: "opening",
      speaker: "system",
      text: `${meetingLabel} 회의를 시작합니다.`,
    },
    ...utterances.map((utterance, index) => ({
      id: `scene-${index + 1}`,
      type: "utterance",
      utteranceId: utterance.id,
      speaker: utterance.speaker,
      text: utterance.text,
    })),
    {
      id: "closing",
      type: "closing",
      speaker: "system",
      text: `${meetingLabel} 회의를 마칩니다.`,
    },
  ];

  return {
    meetingId: meeting.id || "",
    meetingLabel,
    characters,
    scenes,
  };
}

export function findSceneIndexByUtteranceId(timeline, utteranceId) {
  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  return scenes.findIndex((scene) => scene.utteranceId === utteranceId);
}
