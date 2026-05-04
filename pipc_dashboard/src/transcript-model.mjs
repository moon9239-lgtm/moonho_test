import { buildLawLookupRequest, extractLawReferences } from "./law-references.mjs";

const FIRST_2025_DATE = "2025-01-08";

function compactSpaces(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripHeadingSyntax(value) {
  return String(value || "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/[]/g, "")
    .trim();
}

function isSpeakerLine(value) {
  return /^\([^()]{2,40}\)\s*/.test(value);
}

function isSectionLine(value) {
  const line = stripHeadingSyntax(value);
  return /^(?:\d+\.\s*)?(회의개요|회의내용|성원보고|국민의례|개회선언|심의[․·ㆍ]?의결안건|보고안건|안건현황|산회|폐회|의결안건)/.test(line)
    || /^#{1,6}\s*/.test(value);
}

function cleanSectionTitle(value) {
  return stripHeadingSyntax(value)
    .replace(/^\d+\.\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSpeaker(rawSpeaker) {
  const speaker = compactSpaces(rawSpeaker).replace(/[()]/g, "");
  const roleMatch = speaker.match(/^(위원장|부위원장|위원|심사총괄담당관|기획조정관|조사조정국장|조사총괄과장|개인정보보호정책과장|대변인|사무처장)\s*(.*)$/);
  if (!roleMatch) {
    return { speaker, role: "", name: speaker };
  }
  return {
    speaker,
    role: roleMatch[1],
    name: roleMatch[2] || roleMatch[1],
  };
}

function appendJoined(parts, value) {
  const line = stripHeadingSyntax(value);
  if (!line) return;
  parts.push(line);
}

function joinPdfWrappedLines(parts) {
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.?!)\]」』”’])/g, "$1")
    .trim();
}

function parseDateText(rawText) {
  const match = rawText.match(/시\s*:\s*([^\n]+?)(?:\n|$)/);
  return compactSpaces(match?.[1] || "");
}

function parsePlace(rawText) {
  const match = rawText.match(/소\s*:\s*([^\n]+?)(?:\n|$)/);
  return compactSpaces(match?.[1] || "");
}

function parseAttendees(rawText) {
  const match = rawText.match(/출석위원\s*:\s*([\s\S]{0,220}?\(\s*\d+\s*명\s*\))/);
  const source = compactSpaces(match?.[1] || "");
  return source
    .replace(/\(\s*\d+\s*명\s*\)/, "")
    .split(/[,․·ㆍ]/)
    .map((item) => compactSpaces(item).replace(/^(위원장|부위원장|위원)\s*/, ""))
    .filter(Boolean);
}

function agendaTypeFromText(value) {
  if (/보고/.test(value)) return "보고";
  if (/의결|심의/.test(value)) return "심의·의결";
  return "절차";
}

function cleanAgendaTitle(value) {
  return compactSpaces(value)
    .replace(/^\(?위원장\s+\S+\)?\s*/, "")
    .replace(/^그러면\s*/, "")
    .slice(0, 120);
}

function deriveAgendaSegments(utterances, sections) {
  const segments = [];
  const add = (title, startUtteranceId, type = agendaTypeFromText(title)) => {
    const normalizedTitle = cleanAgendaTitle(title);
    if (!normalizedTitle || segments.some((item) => item.title === normalizedTitle)) return;
    segments.push({
      id: `agenda-${segments.length + 1}`,
      title: normalizedTitle,
      type,
      startUtteranceId,
    });
  };

  for (const section of sections) {
    if (/안건|회의록|속기록|공개여부/.test(section.title)) {
      add(section.title, section.startUtteranceId, agendaTypeFromText(section.title));
    }
  }

  for (const utterance of utterances) {
    const text = utterance.text;
    const agendaMatch = text.match(/(?:의결안건|보고안건|공개 안건|비공개 안건)\s*\d*번?[^.。]*?(?:건|결정|상정|논의|심의)/);
    if (agendaMatch) add(agendaMatch[0], utterance.id, agendaTypeFromText(agendaMatch[0]));
  }

  if (!segments.some((item) => /법원행정처/.test(item.title))) {
    const lawCourt = utterances.find((item) => /법원행정처/.test(item.text));
    if (lawCourt) add("의결안건 1: 법원행정처의 법규 위반행위에 대한 시정조치", lawCourt.id, "심의·의결");
  }
  if (!segments.some((item) => /카카오페이|애플|알리페이/.test(item.title))) {
    const kakao = utterances.find((item) => /카카오페이|애플|알리페이/.test(item.text));
    if (kakao) add("의결안건 2: 카카오페이·애플·알리페이 관련 법규 위반행위", kakao.id, "심의·의결");
  }

  return segments.slice(0, 12);
}

function attachAgendaIds(utterances, agendas) {
  let currentAgendaId = agendas[0]?.id || "";
  const startByUtterance = new Map(agendas.map((agenda) => [agenda.startUtteranceId, agenda.id]));
  return utterances.map((utterance) => {
    if (startByUtterance.has(utterance.id)) currentAgendaId = startByUtterance.get(utterance.id);
    return { ...utterance, agendaId: currentAgendaId };
  });
}

function buildReferenceKey(ref) {
  return `${ref.lawName}|${ref.article}`.replace(/\s+/g, "");
}

function fallbackLawArticle(ref) {
  const label = `${ref.lawName} ${ref.article}`.replace(/\s+/g, "");
  if (/제29조/.test(label)) {
    return {
      title: "안전조치의무",
      meetingVersion: "개인정보처리자는 개인정보가 분실·도난·유출·위조·변조 또는 훼손되지 않도록 안전성 확보에 필요한 기술적·관리적·물리적 조치를 하여야 한다는 취지입니다.",
      currentVersion: "현재도 안전조치의무의 핵심 조항으로 쓰이며, 접근통제, 암호화, 접속기록 관리 등 하위 기준과 함께 검토합니다.",
    };
  }
  if (/제24조/.test(label)) {
    return {
      title: "고유식별정보 처리 제한",
      meetingVersion: "고유식별정보 처리 시 암호화 등 안전성 확보 조치를 요구하는 근거로 검토됩니다.",
      currentVersion: "주민등록번호 등 고유식별정보 처리의 필요성, 근거, 안전조치 수준을 함께 확인합니다.",
    };
  }
  if (/제34조/.test(label)) {
    return {
      title: "개인정보 유출 통지",
      meetingVersion: "개인정보 유출을 알게 된 때 정보주체 통지와 관계기관 신고 여부를 판단하는 근거입니다.",
      currentVersion: "유출 규모, 통지 지연, 추가 피해 방지 조치와 함께 검토합니다.",
    };
  }
  if (/시행령.*제30조|제30조/.test(label)) {
    return {
      title: "개인정보의 안전성 확보 조치",
      meetingVersion: "법률상 안전조치의무를 구체화하는 시행령 근거입니다.",
      currentVersion: "내부관리계획, 접근 권한, 접속기록, 암호화 등 세부 기준과 연결해 봅니다.",
    };
  }
  return {
    title: "조문 확인 필요",
    meetingVersion: "현재 로컬 화면에는 조문 원문 캐시가 없어 MCP 조회 파라미터를 우선 표시합니다.",
    currentVersion: "korean-law-mcp get_law_text 또는 get_article_history 연동 시 현재 조문과 회의 당시 조문을 채웁니다.",
  };
}

function enrichLawReferences(refs, meetingDate) {
  const seen = new Map();
  for (const ref of refs) {
    const key = buildReferenceKey(ref);
    if (!seen.has(key)) {
      const fallback = fallbackLawArticle(ref);
      seen.set(key, {
        ...ref,
        id: `law-${seen.size + 1}`,
        meetingDate,
        title: fallback.title,
        meetingVersion: fallback.meetingVersion,
        currentVersion: fallback.currentVersion,
        lookupRequest: buildLawLookupRequest({ ...ref, meetingDate }),
        verificationStatus: "local-snapshot",
      });
    }
  }
  return [...seen.values()];
}

export function parseTranscript(rawText, meeting = {}) {
  const source = String(rawText || "").replace(/\r/g, "");
  const lines = source.split("\n");
  const title = compactSpaces(stripHeadingSyntax(lines.find((line) => stripHeadingSyntax(line)) || meeting.title || ""));
  const sections = [];
  const utterances = [];
  let current = null;
  let currentSection = { id: "section-0", title: "회의 시작", startUtteranceId: "" };

  const flush = () => {
    if (!current) return;
    const normalized = normalizeSpeaker(current.rawSpeaker);
    utterances.push({
      id: `utt-${utterances.length + 1}`,
      speaker: normalized.speaker,
      speakerName: normalized.name,
      speakerRole: normalized.role,
      text: joinPdfWrappedLines(current.parts),
      sectionId: currentSection.id,
      sectionTitle: currentSection.title,
    });
    if (!currentSection.startUtteranceId) currentSection.startUtteranceId = utterances.at(-1).id;
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const speakerMatch = line.match(/^\(([^()]{2,40})\)\s*(.*)$/);
    if (speakerMatch) {
      flush();
      current = { rawSpeaker: speakerMatch[1], parts: [] };
      appendJoined(current.parts, speakerMatch[2]);
      continue;
    }
    if (isSectionLine(line) && !isSpeakerLine(line)) {
      flush();
      const sectionTitle = cleanSectionTitle(line);
      if (sectionTitle && sectionTitle !== title) {
        currentSection = {
          id: `section-${sections.length + 1}`,
          title: sectionTitle,
          startUtteranceId: "",
        };
        sections.push(currentSection);
      }
      continue;
    }
    if (current) appendJoined(current.parts, line);
  }
  flush();

  const agendas = deriveAgendaSegments(utterances, sections);
  const utterancesWithAgenda = attachAgendaIds(utterances, agendas);
  const allRefs = [];
  for (const utterance of utterancesWithAgenda) {
    const refs = extractLawReferences(utterance.text).map((ref) => ({ ...ref, utteranceId: utterance.id }));
    utterance.lawReferences = refs;
    allRefs.push(...refs);
  }
  const lawReferences = enrichLawReferences(allRefs, meeting.date || FIRST_2025_DATE);
  const keyByReference = new Map(lawReferences.map((ref, index) => [buildReferenceKey(ref), index]));
  for (const utterance of utterancesWithAgenda) {
    utterance.lawReferences = utterance.lawReferences
      .map((ref) => ({ ...ref, globalIndex: keyByReference.get(buildReferenceKey(ref)) }))
      .filter((ref) => ref.globalIndex !== undefined);
  }

  return {
    title,
    overview: {
      title,
      date: meeting.date || FIRST_2025_DATE,
      dateText: parseDateText(source),
      place: parsePlace(source),
      attendees: parseAttendees(source),
      meetingLabel: meeting.meetingLabel || title,
    },
    sections,
    agendas,
    utterances: utterancesWithAgenda,
    lawReferences,
    transcriptText: utterancesWithAgenda.map((item) => `(${item.speaker}) ${item.text}`).join("\n\n"),
  };
}

export function buildTranscriptAnimationScenes(detail = {}) {
  const utterances = Array.isArray(detail.utterances) ? detail.utterances : [];
  const overview = detail.overview || {};
  const scenes = [
    {
      id: "opening",
      type: "opening",
      speaker: "회의장",
      text: `${overview.meetingLabel || "전체회의"} 입장과 개회를 준비합니다.`,
      stageNote: "위원 입장 · 착석",
    },
    ...utterances.map((utterance, index) => ({
      id: `scene-${index + 1}`,
      type: /개의|시작|성원/.test(utterance.text) ? "opening" : /의결|이의 없으십니까|가결/.test(utterance.text) ? "decision" : "utterance",
      utteranceId: utterance.id,
      speaker: utterance.speaker,
      speakerName: utterance.speakerName,
      speakerRole: utterance.speakerRole,
      text: utterance.text,
      agendaId: utterance.agendaId,
      stageNote: utterance.sectionTitle,
    })),
    {
      id: "closing",
      type: "closing",
      speaker: "회의장",
      text: `${overview.meetingLabel || "전체회의"} 산회와 퇴장을 재현합니다.`,
      stageNote: "산회 · 퇴장",
    },
  ];
  return scenes;
}
