import axios from "axios";

const BASE_URL = "https://statsapi.mlb.com/api/v1";
const LIVE_BASE_URL = "https://statsapi.mlb.com/api/v1.1";

// 팀 목록
export async function fetchTeams() {
  const res = await axios.get("https://statsapi.mlb.com/api/v1/teams", {
    params: {
      sportId: 1, // MLB
      activeStatus: "Y", // 활동 중인 팀만
    },
  });

  return res.data.teams || [];
}

//  팀Id가 있으면 팀 일정, "ALL"이거나 없으면 전체 일정
export async function fetchSchedule(teamId, date) {
  if (!date) {
    console.warn("fetchSchedule called without date", { teamId, date });
    return [];
  }

  const params = {
    sportId: 1,
    date,
  };

  if (teamId && teamId !== "ALL") {
    params.teamId = Number(teamId);
  }

  try {
    const res = await axios.get(`${BASE_URL}/schedule`, { params });
    return res.data.dates?.[0]?.games ?? [];
  } catch (error) {
    console.error("Schedule API error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      teamId,
      date,
    });
    throw error;
  }
}

// 팀의 한 시즌 전체 경기 스케줄
export async function fetchTeamSeasonSchedule(teamId, season) {
  const res = await axios.get(`${BASE_URL}/schedule`, {
    params: {
      sportId: 1, // MLB
      teamId, // 팀 ID
      season, // "2025" 이런 문자열 또는 숫자
    },
  });

  const dates = res.data?.dates || [];
  const games = [];

  dates.forEach((d) => {
    (d.games || []).forEach((g) => games.push(g));
  });

  // 날짜순 정렬(혹시나 뒤섞여 있을 경우 대비)
  games.sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));

  return games;
}

// 팀 로스터
export async function fetchTeamRoster(teamId) {
  const res = await axios.get(`${BASE_URL}/teams/${teamId}/roster`);
  return res.data.roster;
}

// 경기 상세
export async function fetchGameDetail(gamePk) {
  if (!gamePk) return null;

  try {
    const res = await axios.get(`${LIVE_BASE_URL}/game/${gamePk}/feed/live`);
    return res.data;
  } catch (error) {
    console.error("Failed to load game detail:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      gamePk,
    });
    throw error;
  }
}

export async function fetchAllRosters() {
  // 모든 MLB 팀 목록 가져오기
  const teamsRes = await axios.get(`${BASE_URL}/teams`, {
    params: { sportId: 1 },
  });

  const mlbTeams = teamsRes.data.teams.filter(
    (t) => t.sport?.id === 1 && t.active
  );

  // 각 팀의 로스터를 병렬로 요청
  const rosterPromises = mlbTeams.map(async (team) => {
    const res = await axios.get(`${BASE_URL}/teams/${team.id}/roster`);
    const roster = res.data.roster || [];

    // 각 선수에 team 정보 붙여서 반환
    return roster.map((player) => ({
      ...player,
      team,
    }));
  });

  const rostersByTeam = await Promise.all(rosterPromises);
  return rostersByTeam.flat(); // 하나의 배열로 합치기
}

// 순위표
export async function fetchStandings(season) {
  const res = await axios.get(`${BASE_URL}/standings`, {
    params: {
      leagueId: "103,104", // AL, NL
      season,
      standingsType: "regularSeason",
    },
  });
  return res.data;
}

// 선수 시즌 스탯 (타격 or 투구)
export async function fetchPlayerSeasonStats(personId, season, group) {
  // group: "hitting" | "pitching"
  const res = await axios.get(`${BASE_URL}/people/${personId}/stats`, {
    params: {
      stats: "season",
      group,
      season,
    },
  });
  const statsArr = res.data.stats || [];
  const splits = statsArr[0]?.splits;
  if (!splits || !splits.length) return null;

  return splits[0].stat; // stat 객체만 리턴 (avg, hr, rbi 등)
}

// 선수 기본 정보 (프로필)
export async function fetchPlayerInfo(personId) {
  const res = await axios.get(`${BASE_URL}/people/${personId}`);
  return res.data.people?.[0] || null;
}

/** 팀 기본 정보 */
export async function fetchTeamInfo(teamId) {
  const res = await axios.get(`${BASE_URL}/teams/${teamId}`, {
    params: {
      sportId: 1,
    },
  });
  return res.data.teams?.[0] || null;
}

/** 팀 시즌 스탯 (group: "hitting" | "pitching" | "fielding") */
export async function fetchTeamStats(teamId, season, group = "hitting") {
  const res = await axios.get(`${BASE_URL}/teams/${teamId}/stats`, {
    params: {
      stats: "season",
      group,
      season,
    },
  });

  const stat = res.data?.stats?.[0]?.splits?.[0]?.stat || null;

  return stat;
}

/** 팀 리더보드 (타자/투수 주요 지표) */
export async function fetchTeamLeaders(teamId, season) {
  const res = await axios.get(`${BASE_URL}/teams/${teamId}/leaders`, {
    params: {
      leaderCategories: "homeRuns,avg,rbi,ops,era,strikeOuts,wins,saves",
      season,
      leaderGameTypes: "R", // 정규시즌
    },
  });

  return res.data.teamLeaders || [];
}

export async function fetchVenue(venueId) {
  try {
    const res = await axios.get(`${BASE_URL}/venues/${venueId}`);
    const venues = res.data?.venues || [];
    return venues[0] || null;
  } catch (err) {
    console.error("Failed to fetch venue:", err);
    throw err;
  }
}

export async function fetchWikipediaSummary(title) {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title
      )}`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to load Wikipedia summary:", err);
    return null;
  }
}

// 경기 하이라이트 가져오기
export async function fetchGameHighlights(gamePk) {
  const res = await axios.get(`${BASE_URL}/game/${gamePk}/content`);
  const data = res.data;

  // 안전하게 여러 케이스 대비
  let items = [];
  if (data.highlights?.highlights?.items) {
    items = data.highlights.highlights.items;
  } else if (data.highlights?.live?.items) {
    items = data.highlights.live.items;
  } else if (Array.isArray(data.highlights?.items)) {
    items = data.highlights.items;
  }

  // 우리 앱에서 쓰기 편한 형태로 매핑
  return items.map((item, idx) => {
    const imageCuts = item.image?.cuts || {};
    const firstCut =
      imageCuts["320x180"] ||
      imageCuts["480x270"] ||
      Object.values(imageCuts)[0] ||
      null;

    const videoUrl =
      (item.playbacks || []).find(
        (p) =>
          p.name === "HTTP_CLOUD_MOBILE" ||
          p.name === "HTTP_CLOUD_TABLET" ||
          p.name === "FLASH_2500K_1280X720"
      )?.url || (item.playbacks || [])[0]?.url;

    return {
      id: item.id || item.guid || item.slug || idx,
      title: item.title || "하이라이트",
      blurb: item.blurb || item.description || "",
      duration: item.duration || null,
      imageUrl: firstCut?.src || null,
      videoUrl: videoUrl || null,
    };
  });
}
