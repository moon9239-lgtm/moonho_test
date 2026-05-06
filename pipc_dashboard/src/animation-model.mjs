const PIPC_2026_FIFTH_MEETING_ID = "a47c6ac8-3acb-4644-8048-0f5333cc3102";

const CURRENT_COMMISSIONER_IDS = [
  "song_kyunghee",
  "lee_jungryul",
  "yoon_youngmi",
  "kim_hwigang",
  "kim_ilwhan",
  "lee_munhan",
  "kim_jinwook",
  "kim_jinhwan",
  "park_sanghee",
];

const COMMISSIONER_SEATS = {
  song_kyunghee: { seat: "chair", x: 50, y: 27, z: 132 },
  lee_jungryul: { seat: "left-1", x: 28, y: 38, z: 108 },
  yoon_youngmi: { seat: "left-2", x: 20, y: 50, z: 96 },
  kim_hwigang: { seat: "left-3", x: 20, y: 62, z: 90 },
  kim_ilwhan: { seat: "left-4", x: 30, y: 74, z: 92 },
  lee_munhan: { seat: "right-1", x: 72, y: 38, z: 108 },
  kim_jinwook: { seat: "right-2", x: 80, y: 50, z: 96 },
  kim_jinhwan: { seat: "right-3", x: 80, y: 62, z: 90 },
  park_sanghee: { seat: "right-4", x: 70, y: 74, z: 92 },
};

function compact(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase();
}

function speakerLabel(utterance = {}) {
  return utterance.speakerName || utterance.speaker || "발언자";
}

function speakerRole(utterance = {}) {
  const label = String(utterance.speaker || "");
  const name = String(utterance.speakerName || "");
  return utterance.speakerRole || label.replace(name, "").trim();
}

function characterKeys(character = {}) {
  return [character.name, character.id, character.role, ...(Array.isArray(character.aliases) ? character.aliases : [])]
    .map(compact)
    .filter(Boolean);
}

function matchCharacter(characters = [], utterance = {}) {
  const label = compact(`${utterance.speaker || ""} ${utterance.speakerName || ""}`);
  if (!label) return null;
  return characters.find((character) => {
    const keys = characterKeys(character);
    return keys.some((key) => key && (label.includes(key) || key.includes(label)));
  }) || null;
}

function staffActorId(index) {
  return `staff-${index + 1}`;
}

function makeStaffActor(utterance, index) {
  const name = speakerLabel(utterance);
  return {
    id: staffActorId(index),
    name,
    role: speakerRole(utterance) || "사무처",
    status: "meeting-staff",
    characterType: "회의 발언자",
    seat: `staff-${index + 1}`,
    x: 30 + (index % 4) * 13.5,
    y: 86 + Math.floor(index / 4) * 7,
    z: 104,
    aliases: [name, utterance.speaker].filter(Boolean),
  };
}

function buildActors({ meeting = {}, utterances = [], characters = [] } = {}) {
  const knownCharacters = Array.isArray(characters) ? characters : [];
  const commissionerSource = meeting.id === PIPC_2026_FIFTH_MEETING_ID
    ? CURRENT_COMMISSIONER_IDS
        .map((id) => knownCharacters.find((character) => character.id === id))
        .filter(Boolean)
    : knownCharacters.filter((character) => character.status === "current").slice(0, 9);

  const members = commissionerSource.map((character, index) => ({
    ...character,
    ...(COMMISSIONER_SEATS[character.id] || {
      seat: `member-${index + 1}`,
      x: 18 + (index % 5) * 16,
      y: index < 5 ? 42 : 68,
      z: 82,
    }),
    actorKind: "commissioner",
  }));

  const staffBySpeaker = new Map();
  for (const utterance of utterances) {
    if (matchCharacter(members, utterance)) continue;
    const key = compact(speakerLabel(utterance));
    if (!key || staffBySpeaker.has(key)) continue;
    staffBySpeaker.set(key, makeStaffActor(utterance, staffBySpeaker.size));
  }

  return {
    members,
    staffActors: [...staffBySpeaker.values()],
  };
}

function actorForUtterance(utterance, actors) {
  const commissioner = matchCharacter(actors.members, utterance);
  if (commissioner) return commissioner;
  const key = compact(speakerLabel(utterance));
  return actors.staffActors.find((actor) => characterKeys(actor).some((actorKey) => actorKey === key || actorKey.includes(key) || key.includes(actorKey))) || null;
}

function sceneType(utterance = {}) {
  const text = String(utterance.text || "");
  if (/개의|시작|성원|국민의례|입장|착석/.test(text)) return "opening";
  if (/의결|이의 없으십니까|동의하신 대로|접수하도록|마치겠습니다|산회/.test(text)) return "decision";
  if (/[?？]\s*$/.test(text) || /말씀|질문|의견/.test(text)) return "utterance";
  return "utterance";
}

function cameraFor(actor, type) {
  if (type === "opening" || type === "closing") return "wide";
  if (actor?.actorKind === "commissioner") return "side";
  return "close";
}

function shortText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 92);
}

function sceneDuration(text) {
  return Math.min(Math.max(String(text || "").length * 42, 2200), 9000);
}

function openingSpeaker(members = []) {
  return members.find((member) => member.seat === "chair") || members[0] || null;
}

export function buildAnimationTimeline({ meeting = {}, utterances = [], characters = [] } = {}) {
  const safeUtterances = Array.isArray(utterances) ? utterances : [];
  const meetingLabel = meeting.meetingLabel || "";
  const actors = buildActors({ meeting, utterances: safeUtterances, characters });
  const chair = openingSpeaker(actors.members);
  const scenes = [
    {
      id: "opening",
      type: "opening",
      action: "enter",
      camera: "wide",
      memberId: chair?.id || "",
      speaker: chair?.name || "회의장",
      speakerName: chair?.name || "회의장",
      speakerRole: chair?.role || "",
      text: `${meetingLabel} 회의장 입장과 착석을 시작합니다.`,
      shortText: "위원 입장과 착석",
      stageNote: "입장",
      phase: "위원 입장",
      durationMs: 2600,
    },
    ...safeUtterances.map((utterance, index) => {
      const actor = actorForUtterance(utterance, actors);
      const type = sceneType(utterance);
      const text = utterance.text || "";
      return {
        id: `scene-${index + 1}`,
        type,
        action: "speak",
        camera: cameraFor(actor, type),
        utteranceId: utterance.id,
        memberId: actor?.id || "",
        speaker: speakerLabel(utterance),
        speakerName: utterance.speakerName || speakerLabel(utterance),
        speakerRole: speakerRole(utterance),
        actorKind: actor?.actorKind || actor?.status || "meeting-staff",
        text,
        shortText: shortText(text),
        agendaId: utterance.agendaId,
        stageNote: utterance.sectionTitle || "발언",
        phase: utterance.sectionTitle || "발언",
        durationMs: sceneDuration(text),
      };
    }),
    {
      id: "closing",
      type: "closing",
      action: "exit",
      camera: "wide",
      memberId: chair?.id || "",
      speaker: chair?.name || "회의장",
      speakerName: chair?.name || "회의장",
      speakerRole: chair?.role || "",
      text: `${meetingLabel} 산회와 퇴장을 재현합니다.`,
      shortText: "산회와 퇴장",
      stageNote: "산회 · 퇴장",
      phase: "산회",
      durationMs: 2600,
    },
  ];

  return {
    meetingId: meeting.id || "",
    meetingLabel,
    completedMeetingAnimation: meeting.id === PIPC_2026_FIFTH_MEETING_ID,
    characters: Array.isArray(characters) ? characters : [],
    members: actors.members,
    staffActors: actors.staffActors,
    scenes,
  };
}

export function findSceneIndexByUtteranceId(timeline, utteranceId) {
  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  return scenes.findIndex((scene) => scene.utteranceId === utteranceId);
}
