// 혹시 쓸 곳 있을까봐 기본 맵도 하나 두고
export const DIVISION_KO_MAP = {
  "AL East": "AL 동부",
  "AL Central": "AL 중부",
  "AL West": "AL 서부",
  "NL East": "NL 동부",
  "NL Central": "NL 중부",
  "NL West": "NL 서부",

  "American League East": "아메리칸리그 동부",
  "American League Central": "아메리칸리그 중부",
  "American League West": "아메리칸리그 서부",
  "National League East": "내셔널리그 동부",
  "National League Central": "내셔널리그 중부",
  "National League West": "내셔널리그 서부",
};

export function getDivisionNameKo(groupName) {
  if (!groupName) return "";

  // 1차로 정확히 일치하는 키가 있으면 그대로 사용
  if (DIVISION_KO_MAP[groupName]) return DIVISION_KO_MAP[groupName];

  // 2차: 포함 여부로 판별 (American League American League West 같은 케이스)
  const s = groupName.toLowerCase();

  const isAL = s.includes("american") || s.includes(" al ");
  const isNL = s.includes("national") || s.includes(" nl ");
  const isEast = s.includes("east");
  const isCentral = s.includes("central");
  const isWest = s.includes("west");

  if (isAL && isEast) return "아메리칸리그 동부지구";
  if (isAL && isCentral) return "아메리칸리그 중부지구";
  if (isAL && isWest) return "아메리칸리그 서부지구";

  if (isNL && isEast) return "내셔널리그 동부지구";
  if (isNL && isCentral) return "내셔널리그 중부지구";
  if (isNL && isWest) return "내셔널리그 서부지구";

  // 그래도 못 알아먹으면 원래 문자열 그대로 노출
  return groupName;
}
