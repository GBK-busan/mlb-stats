const TEAM_NAME_KO_BY_ID = {
  108: "LA 에인절스",
  109: "애리조나 다이아몬드백스",
  110: "볼티모어 오리올스",
  111: "보스턴 레드삭스",
  112: "시카고 컵스",
  113: "신시내티 레즈",
  114: "클리블랜드 가디언즈",
  115: "콜로라도 로키스",
  116: "디트로이트 타이거스",
  117: "휴스턴 애스트로스",
  118: "캔자스시티 로열스",
  119: "LA 다저스",
  120: "워싱턴 내셔널스",
  121: "뉴욕 메츠",
  133: "애슬레틱스",
  134: "피츠버그 파이리츠",
  135: "샌디에이고 파드레스",
  136: "시애틀 매리너스",
  137: "샌프란시스코 자이언츠",
  138: "세인트루이스 카디널스",
  139: "탬파베이 레이스",
  140: "텍사스 레인저스",
  141: "토론토 블루제이스",
  142: "미네소타 트윈스",
  143: "필라델피아 필리스",
  144: "애틀랜타 브레이브스",
  145: "시카고 화이트삭스",
  146: "마이애미 말린스",
  147: "뉴욕 양키스",
  158: "밀워키 브루어스",
};

const LEAGUE_NAME_KO_BY_ID = {};

/* 팀 컬러 (대충 메인 컬러 위주로) */
const TEAM_COLOR_BY_ID = {
  108: "#BA0021", // 에인절스
  109: "#A71930", // 디백스
  110: "#DF4601", // 오리올스
  111: "#BD3039", // 레드 삭스
  112: "#0E3386", // 컵스
  113: "#C6011F", // 레즈
  114: "#0C2340", // 가디언즈
  115: "#333366", // 라키즈
  116: "#0C2340", // 타이거스
  117: "#002D62", // 애스트로스
  118: "#004687", // 로얄스
  119: "#005A9C", // 다져스
  120: "#AB0003", // 네셔널스
  121: "#002D72", // 메츠
  133: "#003831", // 애슬래틱스
  134: "#FDB827", // 파이리츠
  135: "#002D62", // 파드리스
  136: "#005C5C", // 매리너스
  137: "#FD5A1E", // 자이언츠
  138: "#C41E3A", // 카디널스
  139: "#092C5C", // 레이스
  140: "#003278", // 레인져스
  141: "#134A8E", // 블루 제이스
  142: "#002B5C", // 트윈스
  143: "#E81828", // 필리스
  144: "#CE1141", // 브레이브스
  145: "#27251F", // 화이트 삭스
  146: "#00A3E0", // 말린스
  147: "#003087", // 양키스
  158: "#12284B", // 브루어스
};

// id 기반 호출 한국어 팀명 호출 함수
export function getTeamNameKoById(teamId, defaultName) {
  if (!teamId) return defaultName;
  return TEAM_NAME_KO_BY_ID[Number(teamId)] || defaultName;
}
export function getTeamNameKoById2(teamId) {
  return TEAM_NAME_KO_BY_ID[Number(teamId)];
}
// 로고 호출 함수
export function getTeamLogoUrl(teamId) {
  if (!teamId) return null;
  // 다크 배경용 캡 로고
  return `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${teamId}.svg`;
}

// 팀컬러 호출 함수
export function getTeamColor(teamId, fallback = "#4b5563") {
  if (!teamId) return fallback;
  return TEAM_COLOR_BY_ID[Number(teamId)] || fallback;
}
