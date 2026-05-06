let mountedRoot = null;
let resetTimer = null;

function safeActors(timeline = {}) {
  const members = Array.isArray(timeline.members) ? timeline.members : [];
  const characters = !members.length && Array.isArray(timeline.characters) ? timeline.characters.slice(0, 10) : [];
  const staffActors = Array.isArray(timeline.staffActors) ? timeline.staffActors : [
    { id: "staff", name: "사무처", role: "보고자", seat: "staff-center", asset: "" },
  ];
  return [...members, ...characters, ...staffActors].filter((actor) => actor && typeof actor === "object");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeCssValue(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value || "").replace(/["\\]/g, "\\$&");
}

function actorKey(actor = {}) {
  return actor.id || actor.name || actor.seat || "";
}

function actorInitial(actor = {}) {
  return String(actor.name || actor.role || "참").slice(0, 1);
}

function cameraClass(scene = {}) {
  if (scene.camera === "wide") return "camera-wide";
  if (scene.camera === "close") return "camera-close";
  if (scene.camera === "side") return "camera-speaker";
  if (scene.camera === "close" || scene.type === "decision") return "camera-close";
  if (scene.camera === "side" || scene.type === "utterance") return "camera-speaker";
  return "camera-wide";
}

function actorHtml(actor, index) {
  const key = actorKey(actor);
  const x = Number.isFinite(Number(actor.x)) ? Number(actor.x) : 16 + (index % 5) * 17;
  const y = Number.isFinite(Number(actor.y)) ? Number(actor.y) : index < 5 ? 42 : 70;
  const z = Number.isFinite(Number(actor.z)) ? Number(actor.z) : 76;
  return `
    <button class="css3d-actor" type="button" data-3d-actor="${escapeHtml(key)}" data-seat="${escapeHtml(actor.seat || "")}" style="--seat-x:${x}%; --seat-y:${y}%; --seat-z:${z}px; --walk-delay:${Math.min(index * 90, 720)}ms">
      <span class="css3d-seat-shadow" aria-hidden="true"></span>
      <span class="css3d-actor-card">
        ${actor.asset ? `<img src="${escapeHtml(actor.asset)}" alt="${escapeHtml(actor.name || "참석자")} 캐릭터">` : `<b>${escapeHtml(actorInitial(actor))}</b>`}
        <i class="css3d-mouth" aria-hidden="true"></i>
        <i class="css3d-speech-wave" aria-hidden="true"></i>
        <strong>${escapeHtml(actor.name || "참석자")}</strong>
        <small>${escapeHtml(actor.role || "")}</small>
      </span>
    </button>
  `;
}

export function mountMeeting3DView(timeline = {}) {
  const root = document.querySelector("[data-meeting-3d-scene]");
  if (!root) return;
  const actors = safeActors(timeline);
  mountedRoot = root;
  root.innerHTML = `
    <div class="css3d-stage camera-wide scene-enter" data-3d-stage>
      <div class="css3d-room-back" aria-hidden="true"></div>
      <div class="css3d-floor" aria-hidden="true"></div>
      <div class="css3d-table" aria-hidden="true">
        <span></span>
      </div>
      <div class="css3d-actor-orbit">
        ${actors.map((actor, index) => actorHtml(actor, index)).join("")}
      </div>
      <div class="css3d-camera-label">
        <span data-3d-camera-label>와이드</span>
        <strong data-3d-speaker>회의장</strong>
      </div>
    </div>
  `;
  resetTimer = window.setTimeout(() => {
    root.querySelector("[data-3d-stage]")?.classList.remove("scene-enter");
  }, 1300);
}

export function updateMeeting3DScene(scene = {}) {
  if (!mountedRoot) return;
  const stage = mountedRoot.querySelector("[data-3d-stage]");
  if (!stage) return;
  stage.classList.remove("camera-wide", "camera-speaker", "camera-close");
  stage.classList.remove("scene-enter", "scene-seat", "scene-speak", "scene-decision", "scene-exit");
  stage.classList.add(cameraClass(scene));
  if (scene.action === "enter" || scene.type === "enter") stage.classList.add("scene-enter");
  else if (scene.action === "sit" || scene.type === "seat") stage.classList.add("scene-seat");
  else if (scene.type === "decision") stage.classList.add("scene-decision");
  else if (scene.type === "closing" || scene.action === "exit") stage.classList.add("scene-exit");
  else stage.classList.add("scene-speak");
  stage.dataset.sceneType = scene.type || "";
  stage.dataset.sceneAction = scene.action || "";

  mountedRoot.querySelectorAll("[data-3d-actor].speaking").forEach((node) => node.classList.remove("speaking"));
  if (scene.memberId) {
    mountedRoot.querySelector(`[data-3d-actor="${escapeCssValue(scene.memberId)}"]`)?.classList.add("speaking");
  }

  const cameraLabel = mountedRoot.querySelector("[data-3d-camera-label]");
  const speaker = mountedRoot.querySelector("[data-3d-speaker]");
  if (cameraLabel) cameraLabel.textContent = scene.phase || scene.stageNote || "장면";
  if (speaker) speaker.textContent = scene.speakerName || scene.speaker || "회의장";
}

export function disposeMeeting3DView() {
  if (resetTimer) window.clearTimeout(resetTimer);
  resetTimer = null;
  mountedRoot = null;
}
