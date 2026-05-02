param(
  [string]$TranscriptPath = "",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

$scriptRoot = if ([string]::IsNullOrWhiteSpace($PSScriptRoot)) {
  Join-Path (Get-Location) "pipc_knowledge_base\05_animation_prototype"
} else {
  $PSScriptRoot
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = $scriptRoot
}

$kbRoot = Resolve-Path (Join-Path $scriptRoot "..")
if ([string]::IsNullOrWhiteSpace($TranscriptPath)) {
  $TranscriptPath = Join-Path $kbRoot "99_raw\transcripts\2026\2026-03-25_2026년_제5회_보호위원회_1_제5회_전체회의_속기록.md"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$raw = Get-Content -Raw -Encoding UTF8 -LiteralPath $TranscriptPath

function Clean-Text {
  param([string]$Text)
  $value = [regex]::Replace($Text, "(?m)^\s*###\s*.*$", " ")
  $value = $value -replace "-\s*\d+\s*-", " "
  $value = $value -replace "[\uF000-\uF8FF]", ""
  $value = $value -replace "\r?\n", " "
  $value = $value -replace "\s+", " "
  return $value.Trim()
}

function Find-Index {
  param([string]$Pattern)
  $m = [regex]::Match($raw, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($m.Success) { return $m.Index }
  return [int]::MaxValue
}

function Agenda-For-Turn {
  param(
    [int]$Position,
    [string]$Body
  )
  if ($Body -match "오늘\s*회의는|비공개|공개\s*회의|공개하지|공개로\s*진행|의견\s*있으시면") {
    return "publicity"
  }
  if ($Body -match "제4회\s*회의록|회의록과\s*속기록|속기록을\s*확인|속기록에\s*대해|회의록\s*보고|접수하도록") {
    return "minutes"
  }
  if ($Body -match "차기\s*회의|회의를\s*마치겠습니다|수고\s*많으셨습니다") {
    return "next"
  }
  if ($Position -lt $script:minutesStart) { return "opening" }
  if ($Position -lt $script:publicityStart) { return "minutes" }
  if ($Position -lt $script:agendaStart) { return "publicity" }
  if ($Position -lt $script:nextStart) { return "agenda1" }
  return "next"
}

$minutesStart = Find-Index "2026년\s*제4회\s*회의록"
$publicityStart = Find-Index "안건현황\s*설명"
$agendaStart = Find-Index "심의\s*[․·\.\s]*의결안건"
$nextStart = Find-Index "차기\s*회의\s*일정"

$speakerToMember = @{
  "송경희" = "song_kyunghee"
  "이정렬" = "lee_jungryul"
  "박상희" = "park_sanghee"
  "윤영미" = "yoon_youngmi"
  "김일환" = "kim_ilwhan"
  "김진환" = "kim_jinhwan"
  "김진욱" = "kim_jinwook"
  "이문한" = "lee_munhan"
  "김휘강" = "kim_hwigang"
}

$speakerRx = [regex]"\((위원장|위원|기획조정관|심사총괄담당관|조사조정국장|조사총괄과장)\s*[^\)\r\n]*\)"
$matches = $speakerRx.Matches($raw)
$utterances = @()

for ($i = 0; $i -lt $matches.Count; $i++) {
  $m = $matches[$i]
  $start = $m.Index + $m.Length
  $end = if ($i -lt $matches.Count - 1) { $matches[$i + 1].Index } else { $raw.Length }
  $body = Clean-Text ($raw.Substring($start, $end - $start))
  if ([string]::IsNullOrWhiteSpace($body)) { continue }

  $speakerLabel = $m.Value.Trim("(", ")")
  $parts = $speakerLabel -split "\s+", 2
  $person = if ($parts.Count -gt 1) { $parts[1] } else { $speakerLabel }
  $memberId = if ($speakerToMember.ContainsKey($person)) { $speakerToMember[$person] } else { "staff" }
  $short = if ($body.Length -gt 145) { $body.Substring(0, 145) + "..." } else { $body }

  $utterances += [ordered]@{
    index = $utterances.Count + 1
    speaker = $speakerLabel
    person = $person
    memberId = $memberId
    agendaId = Agenda-For-Turn $m.Index $body
    text = $body
    short = $short
  }
}

$data = [ordered]@{
  sourceTranscript = (Resolve-Path -LiteralPath $TranscriptPath).Path
  title = "2026년 제5회 개인정보 보호위원회 속기록"
  meetingLabel = "2026년 제5회 전체회의"
  date = "2026. 3. 25.(수), 13:30-14:45"
  place = "개인정보 보호위원회 대회의실"
  attendees = "위원장 송경희, 부위원장 이정렬, 위원 박상희·윤영미·김일환·김진환·김진욱·이문한·김휘강"
  agendas = @(
    [ordered]@{ id = "opening"; type = "진행"; title = "성원보고·국민의례·개회선언" }
    [ordered]@{ id = "minutes"; type = "보고"; title = "2026년 제4회 회의록 및 속기록 보고" }
    [ordered]@{ id = "publicity"; type = "진행"; title = "안건현황 설명 및 회의 공개여부 결정" }
    [ordered]@{ id = "agenda1"; type = "의결"; title = "공공기관의 개인정보보호 법규 위반행위 시정조치" }
    [ordered]@{ id = "next"; type = "진행"; title = "차기 회의 일정 및 폐회" }
  )
  members = @(
    [ordered]@{ id = "song_kyunghee"; name = "송경희"; role = "위원장"; asset = "../04_members/character_profiles/character_assets/sd3d_members/song_kyunghee_sd3d_character.png"; seat = "chair" }
    [ordered]@{ id = "lee_jungryul"; name = "이정렬"; role = "부위원장"; asset = "../04_members/character_profiles/character_assets/sd3d_members/lee_jungryul_sd3d_character.png"; seat = "left1" }
    [ordered]@{ id = "park_sanghee"; name = "박상희"; role = "위원"; asset = "../04_members/character_profiles/character_assets/sd3d_members/park_sanghee_sd3d_character.png"; seat = "left2" }
    [ordered]@{ id = "yoon_youngmi"; name = "윤영미"; role = "위원"; asset = "../04_members/character_profiles/character_assets/sd3d_members/yoon_youngmi_sd3d_character.png"; seat = "left3" }
    [ordered]@{ id = "kim_ilwhan"; name = "김일환"; role = "위원"; asset = "../04_members/character_profiles/character_assets/sd3d_members/kim_ilwhan_sd3d_character.png"; seat = "left4" }
    [ordered]@{ id = "kim_jinhwan"; name = "김진환"; role = "위원"; asset = "../04_members/character_profiles/character_assets/sd3d_members/kim_jinhwan_sd3d_character.png"; seat = "right1" }
    [ordered]@{ id = "kim_jinwook"; name = "김진욱"; role = "위원"; asset = "../04_members/character_profiles/character_assets/sd3d_members/kim_jinwook_sd3d_character.png"; seat = "right2" }
    [ordered]@{ id = "lee_munhan"; name = "이문한"; role = "위원"; asset = "../04_members/character_profiles/character_assets/sd3d_members/lee_munhan_sd3d_character.png"; seat = "right3" }
    [ordered]@{ id = "kim_hwigang"; name = "김휘강"; role = "위원"; asset = "../04_members/character_profiles/character_assets/sd3d_members/kim_hwigang_sd3d_character.png"; seat = "right4" }
  )
  utterances = $utterances
}

$jsonPretty = $data | ConvertTo-Json -Depth 20
$jsonPath = Join-Path $OutDir "sample_2026_05_meeting_data.json"
Set-Content -Encoding UTF8 -LiteralPath $jsonPath -Value $jsonPretty

$jsonCompact = ($data | ConvertTo-Json -Depth 20 -Compress).Replace("</script>", "<\/script>")
$html = @'
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>PIPC Meeting Animation Prototype</title>
  <style>
    :root {
      --navy: #153a5f;
      --navy2: #0f2742;
      --cyan: #26a9c9;
      --ink: #101826;
      --paper: #f6f8fb;
      --wood1: #b78355;
      --wood2: #704021;
      --line: #d7dee8;
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      overflow: hidden;
      color: var(--ink);
      background: #e8edf4;
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
    }

    .app {
      height: 100vh;
      display: grid;
      grid-template-columns: minmax(780px, 1fr) 320px;
      grid-template-rows: minmax(500px, 1fr) 210px;
      gap: 12px;
      padding: 12px;
    }

    .stage {
      position: relative;
      min-width: 0;
      overflow: hidden;
      border-radius: 12px;
      background:
        linear-gradient(180deg, rgba(255,255,255,.12), rgba(0,0,0,.03)),
        linear-gradient(180deg, #b68457 0 44%, #ead6bd 44% 100%);
      box-shadow: 0 16px 46px rgba(19, 35, 56, .18);
    }

    .stage::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 2px, rgba(0,0,0,.025) 2px 72px),
        radial-gradient(circle at 50% 9%, rgba(255,255,255,.4), transparent 28%);
      pointer-events: none;
    }

    .badge {
      position: absolute;
      left: 18px;
      top: 16px;
      z-index: 30;
      max-width: 560px;
      border-radius: 10px;
      padding: 12px 20px;
      color: white;
      background: linear-gradient(90deg, #143a62, #1e527d);
      font-size: clamp(15px, 1.5vw, 20px);
      font-weight: 900;
      box-shadow: 0 10px 22px rgba(7, 24, 43, .22);
    }

    .meta {
      position: absolute;
      left: 20px;
      top: 72px;
      z-index: 30;
      max-width: 500px;
      border: 1px solid rgba(255,255,255,.7);
      border-radius: 10px;
      padding: 10px 13px;
      background: rgba(255,255,255,.86);
      color: #243449;
      font-size: 12px;
      line-height: 1.5;
      box-shadow: 0 10px 25px rgba(7, 24, 43, .1);
    }

    .emblem {
      position: absolute;
      top: 42px;
      left: 50%;
      z-index: 10;
      transform: translateX(-50%);
      text-align: center;
      color: #24303d;
      font-weight: 900;
    }

    .mark {
      width: 54px;
      height: 54px;
      margin: 0 auto 8px;
      border: 3px solid rgba(255,255,255,.45);
      border-radius: 50%;
      background: conic-gradient(#c74140 0 33%, #fafafa 33% 63%, #224d83 63%);
      box-shadow: 0 8px 18px rgba(0,0,0,.12);
    }

    .flag {
      position: absolute;
      top: 56px;
      width: 34px;
      height: 150px;
      border-radius: 17px 17px 3px 3px;
      background: linear-gradient(90deg, #fff, #f7edcd, #fff);
      box-shadow: 0 10px 20px rgba(40,24,13,.16);
    }
    .flag::before {
      content: "";
      position: absolute;
      left: 15px;
      top: -22px;
      width: 5px;
      height: 194px;
      background: #89632d;
    }
    .flag.left { left: 88px; }
    .flag.right { right: 96px; }

    .table {
      position: absolute;
      left: 4.8%;
      right: 4.8%;
      bottom: 88px;
      z-index: 4;
      height: 190px;
      background: linear-gradient(#8b532e, #60331e);
      clip-path: polygon(4% 47%, 23% 18%, 77% 18%, 96% 47%, 90% 100%, 10% 100%);
      box-shadow: inset 0 12px 18px rgba(255,255,255,.08), 0 -6px 16px rgba(0,0,0,.08);
    }

    .front-table {
      position: absolute;
      left: 25%;
      right: 25%;
      bottom: 32px;
      z-index: 16;
      height: 86px;
      border-radius: 10px 10px 0 0;
      background: linear-gradient(#86502e, #62341e);
      box-shadow: inset 0 12px 18px rgba(255,255,255,.08), 0 -4px 18px rgba(0,0,0,.2);
    }

    .staff {
      position: absolute;
      left: 50%;
      bottom: 70px;
      z-index: 18;
      width: 118px;
      height: 158px;
      transform: translateX(-50%);
    }
    .staff .head {
      width: 86px;
      height: 74px;
      margin: 0 auto;
      border-radius: 48% 48% 42% 42%;
      background: radial-gradient(circle at 55% 34%, #333844, #10151c 72%);
    }
    .staff .body {
      width: 118px;
      height: 94px;
      margin-top: -6px;
      border-radius: 38px 38px 8px 8px;
      background: linear-gradient(90deg, #1d2936, #29384a);
    }
    .staff .name {
      position: absolute;
      left: 50%;
      bottom: 4px;
      transform: translateX(-50%);
      white-space: nowrap;
      border-radius: 6px;
      padding: 5px 9px;
      background: rgba(9,18,28,.76);
      color: white;
      font-size: 12px;
      font-weight: 900;
    }
    .staff.speaking .head,
    .staff.speaking .body { animation: staffTalk .4s ease-in-out infinite alternate; }

    .member {
      position: absolute;
      z-index: 8;
      width: 116px;
      height: 184px;
      transition: filter .2s ease, transform .2s ease;
    }
    .member img {
      position: absolute;
      left: 50%;
      bottom: 24px;
      max-width: 122px;
      max-height: 166px;
      object-fit: contain;
      transform: translateX(-50%);
      filter: drop-shadow(0 10px 8px rgba(0,0,0,.18));
    }
    .member .mouth {
      display: none;
      position: absolute;
      left: 50%;
      top: 61px;
      z-index: 5;
      width: 17px;
      height: 6px;
      border-radius: 50%;
      background: #45211e;
      transform: translateX(-50%);
    }
    .member .nameplate {
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      white-space: nowrap;
      border-radius: 5px;
      padding: 4px 8px;
      background: #171e28;
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      box-shadow: 0 4px 10px rgba(0,0,0,.18);
    }
    .member.speaking {
      z-index: 24;
      filter: drop-shadow(0 0 18px rgba(38,169,201,.72));
    }
    .member.speaking img { animation: bob .48s ease-in-out infinite alternate; }
    .member.speaking .mouth { display: block; animation: mouth .18s steps(2, end) infinite; }
    .member.enter { animation: seatIn .9s ease both; }
    .member.exit { animation: seatOut .9s ease both; }

    .chair { left: 50%; top: 188px; transform: translateX(-50%); }
    .left1 { left: 10%; top: 288px; }
    .left2 { left: 18%; top: 238px; }
    .left3 { left: 27%; top: 210px; }
    .left4 { left: 37%; top: 194px; }
    .right1 { right: 37%; top: 194px; }
    .right2 { right: 27%; top: 210px; }
    .right3 { right: 18%; top: 238px; }
    .right4 { right: 10%; top: 288px; }

    .bubble {
      position: absolute;
      left: 50%;
      top: 124px;
      z-index: 35;
      min-width: 300px;
      max-width: 610px;
      transform: translateX(-50%);
      border: 2px solid rgba(38,169,201,.4);
      border-radius: 16px;
      padding: 13px 16px;
      background: rgba(255,255,255,.97);
      box-shadow: 0 18px 42px rgba(15,35,55,.2);
    }
    .bubble.staff { border-color: rgba(211,156,64,.48); }
    .bubble .speaker {
      margin-bottom: 5px;
      color: #0e4970;
      font-weight: 900;
    }
    .bubble .text {
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      font-size: 15px;
      line-height: 1.45;
    }

    .side {
      grid-row: 1 / span 2;
      display: flex;
      min-height: 0;
      flex-direction: column;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 16px;
      background: #f8fafc;
      box-shadow: 0 12px 34px rgba(18,35,55,.12);
    }
    .side h2 {
      margin: 0 0 12px;
      color: #172337;
      font-size: 18px;
    }
    .agenda {
      margin-bottom: 10px;
      border: 1px solid #d9e0eb;
      border-radius: 10px;
      padding: 12px;
      background: #fff;
      transition: .2s ease;
    }
    .agenda .type {
      color: #60758b;
      font-size: 12px;
      font-weight: 900;
    }
    .agenda .title {
      margin-top: 5px;
      font-size: 14px;
      line-height: 1.38;
    }
    .agenda.active {
      border-color: var(--cyan);
      background: #eaf8fc;
      box-shadow: 0 8px 20px rgba(38,169,201,.14);
      transform: translateX(-2px);
    }
    .note {
      margin-top: auto;
      border-top: 1px solid #d8e0ea;
      padding-top: 14px;
      color: #40566e;
      font-size: 13px;
      line-height: 1.5;
    }

    .subtitle {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 395px;
      min-height: 0;
      overflow: hidden;
      border-radius: 12px;
      background: #111923;
      color: white;
      box-shadow: 0 14px 42px rgba(10,20,35,.22);
    }
    .caption {
      min-width: 0;
      padding: 16px 18px;
      border-right: 1px solid rgba(255,255,255,.1);
    }
    .who {
      display: flex;
      gap: 10px;
      align-items: center;
      color: #88d9ef;
      font-weight: 900;
    }
    .who span:first-child {
      border-radius: 999px;
      padding: 4px 10px;
      background: #274a6c;
      color: white;
    }
    .line {
      max-height: 96px;
      margin-top: 10px;
      overflow: auto;
      font-size: 18px;
      line-height: 1.55;
    }
    .progress {
      height: 5px;
      margin-top: 10px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(255,255,255,.14);
    }
    .bar {
      height: 100%;
      width: 0;
      background: #31c0e3;
      transition: width .2s ease;
    }
    .controls {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .controls button {
      border: 0;
      border-radius: 8px;
      padding: 8px 12px;
      background: #e8f7fb;
      color: #0d4058;
      cursor: pointer;
      font-weight: 900;
    }
    .controls label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #cbd8e6;
      font-size: 13px;
      white-space: nowrap;
    }
    .flow {
      min-height: 0;
      overflow: auto;
      padding: 14px;
    }
    .flow h3 {
      margin: 0 0 8px;
      color: #c9d8e7;
      font-size: 14px;
    }
    .turn {
      margin-bottom: 8px;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      padding: 8px 10px;
      color: #aebccd;
      cursor: pointer;
    }
    .turn strong { color: #fff; }
    .turn small {
      display: block;
      overflow: hidden;
      margin-top: 4px;
      color: #8fa0b2;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .turn.active {
      border-color: #59cae8;
      background: #244c72;
    }

    @keyframes seatIn {
      from { opacity: 0; transform: translateY(70px) scale(.82); }
      to { opacity: 1; }
    }
    @keyframes seatOut {
      to { opacity: 0; transform: translateY(-35px) scale(.92); }
    }
    @keyframes bob {
      from { transform: translateX(-50%) translateY(0); }
      to { transform: translateX(-50%) translateY(-4px); }
    }
    @keyframes mouth {
      from { height: 3px; width: 13px; }
      to { height: 9px; width: 18px; }
    }
    @keyframes staffTalk {
      from { transform: translateY(0); }
      to { transform: translateY(-4px); }
    }

    @media (max-width: 1050px) {
      body { overflow: auto; }
      .app {
        height: auto;
        min-height: 100vh;
        grid-template-columns: 1fr;
        grid-template-rows: 570px 285px 300px;
      }
      .side { grid-row: 3; }
      .subtitle { grid-template-columns: 1fr; }
      .flow { display: none; }
    }
  </style>
</head>
<body>
  <div class="app">
    <main class="stage" aria-label="회의장 애니메이션">
      <div class="flag left"></div>
      <div class="flag right"></div>
      <div class="emblem"><div class="mark"></div><div>개인정보보호위원회</div></div>
      <div class="badge" id="badge"></div>
      <div class="meta" id="meta"></div>
      <div class="table"></div>
      <div id="members"></div>
      <div class="staff" id="staff">
        <div class="head"></div>
        <div class="body"></div>
        <div class="name">보고자 / 사무처</div>
      </div>
      <div class="front-table"></div>
      <div class="bubble" id="bubble"><div class="speaker"></div><div class="text"></div></div>
    </main>

    <aside class="side">
      <h2>오늘의 안건</h2>
      <div id="agendaList"></div>
      <div class="note">
        <b>샘플 프로토타입</b><br>
        실제 속기록을 순서대로 파싱해 발언자를 전환합니다. 현재 안건은 자동 하이라이트되고, 발언 흐름은 아래 타임라인에서 스크롤/클릭할 수 있습니다.
      </div>
    </aside>

    <section class="subtitle">
      <div class="caption">
        <div class="who"><span id="speakerNow">대기</span><span id="stepNow">입장 중</span></div>
        <div class="line" id="captionLine">위원들이 회의장에 입장해 착석하고 있습니다.</div>
        <div class="progress"><div class="bar" id="bar"></div></div>
        <div class="controls">
          <button id="playBtn">재생</button>
          <button id="prevBtn">이전</button>
          <button id="nextBtn">다음</button>
          <button id="resetBtn">처음</button>
          <label>속도 <input id="speed" type="range" min="0.6" max="2.4" step="0.2" value="1.4"></label>
        </div>
      </div>
      <div class="flow">
        <h3>전체 회의 흐름</h3>
        <div id="turnList"></div>
      </div>
    </section>
  </div>

  <script>
    const meeting = __MEETING_DATA__;
    let index = -1;
    let playing = false;
    let timer = null;

    const membersEl = document.getElementById("members");
    const agendaList = document.getElementById("agendaList");
    const turnList = document.getElementById("turnList");
    const bubble = document.getElementById("bubble");
    const staff = document.getElementById("staff");

    document.getElementById("badge").textContent = `${meeting.meetingLabel} · 애니메이션 보기`;
    document.getElementById("meta").innerHTML =
      `<b>${meeting.title}</b><br>${meeting.date}<br>${meeting.place}<br>${meeting.attendees}`;

    meeting.members.forEach((m, i) => {
      const el = document.createElement("div");
      el.className = `member ${m.seat} enter`;
      el.dataset.id = m.id;
      el.style.animationDelay = `${i * 0.08}s`;
      el.innerHTML = `<img src="${m.asset}" alt="${m.name}"><div class="mouth"></div><div class="nameplate">${m.role} ${m.name}</div>`;
      membersEl.appendChild(el);
    });

    meeting.agendas.forEach((agenda) => {
      const el = document.createElement("div");
      el.className = "agenda";
      el.dataset.id = agenda.id;
      el.innerHTML = `<div class="type">${agenda.type}</div><div class="title">${agenda.title}</div>`;
      agendaList.appendChild(el);
    });

    meeting.utterances.forEach((turn, i) => {
      const el = document.createElement("div");
      el.className = "turn";
      el.dataset.i = i;
      el.innerHTML = `<strong>${String(i + 1).padStart(2, "0")} ${turn.speaker}</strong><small>${turn.short}</small>`;
      el.onclick = () => go(i, true);
      turnList.appendChild(el);
    });

    function duration(text) {
      const speed = parseFloat(document.getElementById("speed").value);
      return Math.max(1700, Math.min(9000, text.length * 38)) / speed;
    }

    function activeSpeaker(id) {
      document.querySelectorAll(".member").forEach((member) => {
        member.classList.toggle("speaking", member.dataset.id === id);
      });
      staff.classList.toggle("speaking", id === "staff");
    }

    function activeAgenda(id) {
      document.querySelectorAll(".agenda").forEach((agenda) => {
        agenda.classList.toggle("active", agenda.dataset.id === id);
      });
    }

    function go(nextIndex, manual = false) {
      clearTimeout(timer);
      index = Math.max(0, Math.min(meeting.utterances.length - 1, nextIndex));
      const turn = meeting.utterances[index];

      activeSpeaker(turn.memberId);
      activeAgenda(turn.agendaId);

      document.getElementById("speakerNow").textContent = turn.speaker;
      document.getElementById("stepNow").textContent = `${index + 1} / ${meeting.utterances.length}`;
      document.getElementById("captionLine").textContent = turn.text;
      document.getElementById("bar").style.width = `${((index + 1) / meeting.utterances.length) * 100}%`;

      bubble.className = `bubble ${turn.memberId === "staff" ? "staff" : ""}`;
      bubble.querySelector(".speaker").textContent = turn.speaker;
      bubble.querySelector(".text").textContent = turn.text;

      document.querySelectorAll(".turn").forEach((el) => {
        el.classList.toggle("active", Number(el.dataset.i) === index);
      });
      const activeTurn = document.querySelector(".turn.active");
      if (activeTurn) activeTurn.scrollIntoView({ block: "nearest" });

      if (playing && !manual) {
        timer = setTimeout(() => {
          index < meeting.utterances.length - 1 ? go(index + 1) : finish();
        }, duration(turn.text));
      }
    }

    function finish() {
      playing = false;
      document.getElementById("playBtn").textContent = "재생";
      activeSpeaker("");
      document.querySelectorAll(".member").forEach((member) => member.classList.add("exit"));
      document.getElementById("captionLine").textContent = "회의가 종료되어 위원들이 퇴장합니다.";
      bubble.querySelector(".speaker").textContent = "회의 종료";
      bubble.querySelector(".text").textContent = "위원들이 회의장을 나갑니다.";
    }

    function play() {
      if (!playing) {
        playing = true;
        document.getElementById("playBtn").textContent = "일시정지";
        document.querySelectorAll(".member").forEach((member) => member.classList.remove("exit"));
        go(index < 0 ? 0 : index);
      } else {
        playing = false;
        document.getElementById("playBtn").textContent = "재생";
        clearTimeout(timer);
        activeSpeaker("");
      }
    }

    function reset() {
      playing = false;
      clearTimeout(timer);
      index = -1;
      document.getElementById("playBtn").textContent = "재생";
      document.querySelectorAll(".member").forEach((member) => {
        member.classList.remove("exit", "speaking");
        member.classList.add("enter");
      });
      staff.classList.remove("speaking");
      activeAgenda("opening");
      document.getElementById("speakerNow").textContent = "대기";
      document.getElementById("stepNow").textContent = "입장 중";
      document.getElementById("captionLine").textContent = "위원들이 회의장에 입장해 착석하고 있습니다.";
      document.getElementById("bar").style.width = "0%";
      bubble.className = "bubble";
      bubble.querySelector(".speaker").textContent = "입장";
      bubble.querySelector(".text").textContent = "위원들이 회의장에 입장해 착석합니다.";
      document.querySelectorAll(".turn").forEach((el) => el.classList.remove("active"));
    }

    document.getElementById("playBtn").onclick = play;
    document.getElementById("nextBtn").onclick = () => go(index + 1, true);
    document.getElementById("prevBtn").onclick = () => go(index - 1, true);
    document.getElementById("resetBtn").onclick = reset;
    reset();
  </script>
</body>
</html>
'@

$htmlPath = Join-Path $OutDir "pipc_meeting_animation_sample.html"
$html = $html.Replace("__MEETING_DATA__", $jsonCompact)
Set-Content -Encoding UTF8 -LiteralPath $htmlPath -Value $html

Write-Host "sample=$htmlPath"
Write-Host "data=$jsonPath"
Write-Host "utterances=$($utterances.Count)"
