import { normalizeCommissionerCharacters } from "./commissioner-model.mjs";

export async function loadCommissionerCharacters(url = "../pipc_knowledge_base/04_members/character_profiles/characters.json") {
  if (typeof fetch !== "function") return [];

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return normalizeCommissionerCharacters(data);
  } catch (error) {
    console.warn("위원 캐릭터 프로필을 읽지 못했습니다.", error);
    return [];
  }
}
