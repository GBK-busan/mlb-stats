import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTeamRoster,
  fetchAllRosters,
  fetchPlayerSeasonStats,
} from "../../api/mlbApi.js";
import { getTeamNameKoById } from "../../common/teamsNameKo";
import "./PlayerTable.css";

const currentYear = new Date().getFullYear();
const defaultSeason = currentYear;

export default function PlayerTable({ teamId }) {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL / BAT / PIT
  const [search, setSearch] = useState("");
  const [statsMap, setStatsMap] = useState({}); // personId -> stat
  const [statsLoading, setStatsLoading] = useState(false);
  const [sortKey, setSortKey] = useState("default"); // 정렬 기준

  const navigate = useNavigate();

  const isAllTeams = !teamId || teamId === "ALL";

  // 투수 판별
  const isPitcher = (p) => {
    const pos = p.position;
    if (!pos) return false;
    const type = pos.type;
    const abbr = pos.abbreviation;
    return type === "Pitcher" || abbr === "P";
  };

  // 로스터 불러오기
  useEffect(() => {
    async function loadRoster() {
      setLoading(true);
      try {
        if (isAllTeams) {
          const data = await fetchAllRosters();
          const sorted = [...data].sort((a, b) => {
            const teamA = getTeamNameKoById(a.team?.id, a.team?.name || "");
            const teamB = getTeamNameKoById(b.team?.id, b.team?.name || "");
            if (teamA !== teamB) return teamA.localeCompare(teamB, "ko");

            const numA = Number(a.jerseyNumber) || 999;
            const numB = Number(b.jerseyNumber) || 999;
            return numA - numB;
          });
          setRoster(sorted);
        } else {
          const data = await fetchTeamRoster(teamId);
          const sorted = [...data].sort((a, b) => {
            const numA = Number(a.jerseyNumber) || 999;
            const numB = Number(b.jerseyNumber) || 999;
            return numA - numB;
          });
          setRoster(sorted);
        }
      } catch (err) {
        console.error("Failed to load roster:", err);
        setRoster([]);
      } finally {
        setLoading(false);
      }
    }

    loadRoster();
  }, [teamId, isAllTeams]);

  // 시즌 스탯 불러오기
  useEffect(() => {
    async function loadStats() {
      // 포지션 필터가 꺼져 있거나 로스터가 없으면 스탯 안 불러옴
      if (filter === "ALL" || roster.length === 0) {
        setStatsMap({});
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        const promises = roster.map(async (p) => {
          const id = p.person?.id;
          if (!id) return null;

          const pitcher = isPitcher(p);
          if (filter === "BAT" && pitcher) return null;
          if (filter === "PIT" && !pitcher) return null;

          const group = pitcher ? "pitching" : "hitting";
          const stat = await fetchPlayerSeasonStats(id, defaultSeason, group);
          return { id, stat };
        });

        const results = await Promise.all(promises);
        const map = {};
        results.forEach((r) => {
          if (!r) return;
          map[r.id] = r.stat;
        });
        setStatsMap(map);
      } catch (e) {
        console.error("Failed to load player stats:", e);
        setStatsMap({});
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [roster, filter]);

  // 포지션 + 검색 필터
  const filteredRoster = useMemo(() => {
    if (!roster) return [];

    let list = roster;

    if (filter === "BAT") {
      list = list.filter((p) => !isPitcher(p));
    } else if (filter === "PIT") {
      list = list.filter((p) => isPitcher(p));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.person?.fullName || "").toLowerCase();
        return name.includes(q);
      });
    }

    // 정렬 적용
    const sorted = [...list].sort((a, b) => {
      // 기본 정렬: 팀 + 등번호
      if (sortKey === "default" || filter === "ALL") {
        const teamA = getTeamNameKoById(a.team?.id, a.team?.name || "");
        const teamB = getTeamNameKoById(b.team?.id, b.team?.name || "");
        if (teamA !== teamB) return teamA.localeCompare(teamB, "ko");

        const numA = Number(a.jerseyNumber) || 999;
        const numB = Number(b.jerseyNumber) || 999;
        return numA - numB;
      }

      const statA = statsMap[a.person?.id];
      const statB = statsMap[b.person?.id];

      // 스탯 없으면 뒤로 밀기
      if (!statA && !statB) return 0;
      if (!statA) return 1;
      if (!statB) return -1;

      const getVal = (stat, key) => {
        switch (key) {
          // 타자
          case "AVG":
            return Number(stat.avg);
          case "OBP":
            return Number(stat.obp);
          case "SLG":
            return Number(stat.slg);
          case "OPS":
            return Number(stat.ops);
          case "HR":
            return stat.homeRuns ?? 0;
          case "RBI":
            return stat.rbi ?? 0;
          // 투수
          case "ERA":
            return Number(stat.era);
          case "SO":
            return stat.strikeOuts ?? 0;
          case "WHIP":
            return Number(stat.whip);
          case "K9": {
            const ip = stat.inningsPitched
              ? parseFloat(stat.inningsPitched)
              : 0;
            if (!ip) return 0;
            return ((stat.strikeOuts ?? 0) * 9) / ip;
          }
          default:
            return 0;
        }
      };

      const aVal = getVal(statA, sortKey);
      const bVal = getVal(statB, sortKey);

      // ERA, WHIP는 낮을수록 좋은 → 오름차순
      const ascKeys = ["ERA", "WHIP"];
      const dir = ascKeys.includes(sortKey) ? 1 : -1; // 나머지는 내림차순

      if (aVal === bVal) {
        // 동률이면 이름순
        const nameA = a.person?.fullName || "";
        const nameB = b.person?.fullName || "";
        return nameA.localeCompare(nameB);
      }

      return (aVal - bVal) * dir;
    });

    return sorted;
  }, [roster, filter, search, sortKey, statsMap]);

  const showHittingStats = filter === "BAT";
  const showPitchingStats = filter === "PIT";

  if (loading) {
    return (
      <div className="player-table">
        <p>선수 명단 불러오는 중...</p>
      </div>
    );
  }

  if (!filteredRoster.length) {
    return (
      <div className="player-table">
        <div className="player-table-header">
          <h2>선수 명단 {isAllTeams && "(전체 팀)"}</h2>
          <div className="player-header-right">
            <div className="player-search">
              <input
                type="text"
                placeholder="선수 이름 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <p>표시할 선수 데이터가 없습니다.</p>
      </div>
    );
  }

  // 타자/투수일 때 보여줄 정렬 옵션
  const battingSortOptions = [
    { value: "default", label: "기본 (팀/등번호)" },
    { value: "AVG", label: "타율 AVG" },
    { value: "OBP", label: "출루율 OBP" },
    { value: "SLG", label: "장타율 SLG" },
    { value: "OPS", label: "OPS" },
    { value: "HR", label: "홈런 HR" },
    { value: "RBI", label: "타점 RBI" },
  ];

  const pitchingSortOptions = [
    { value: "default", label: "기본 (팀/등번호)" },
    { value: "ERA", label: "평균자책 ERA" },
    { value: "SO", label: "탈삼진 SO" },
    { value: "WHIP", label: "WHIP" },
    { value: "K9", label: "K/9" },
  ];

  const currentSortOptions =
    filter === "BAT"
      ? battingSortOptions
      : filter === "PIT"
      ? pitchingSortOptions
      : [{ value: "default", label: "기본 (팀/등번호)" }];

  return (
    <div className="player-table">
      <div className="player-table-header">
        <h2>선수 명단 {isAllTeams && "(전체 팀)"}</h2>

        <div className="player-header-right">
          {/* 검색창 */}
          <div className="player-search">
            <input
              type="text"
              placeholder="선수 이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 정렬 셀렉트 */}
          <div className="player-sort">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              {currentSortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 포지션 필터 */}
          <div className="player-filters">
            <button
              className={filter === "ALL" ? "active" : ""}
              onClick={() => setFilter("ALL")}
            >
              전체
            </button>
            <button
              className={filter === "BAT" ? "active" : ""}
              onClick={() => setFilter("BAT")}
            >
              타자
            </button>
            <button
              className={filter === "PIT" ? "active" : ""}
              onClick={() => setFilter("PIT")}
            >
              투수
            </button>
          </div>
        </div>
      </div>

      {statsLoading && (showHittingStats || showPitchingStats) && (
        <p className="stats-loading-text">시즌 스탯 불러오는 중...</p>
      )}

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>이름</th>
            <th>포지션</th>
            {isAllTeams && <th>팀</th>}

            {showHittingStats && (
              <>
                <th>G</th>
                <th>AVG</th>
                <th>OBP</th>
                <th>SLG</th>
                <th>OPS</th>
                <th>HR</th>
                <th>RBI</th>
              </>
            )}

            {showPitchingStats && (
              <>
                <th>G</th>
                <th>IP</th>
                <th>ERA</th>
                <th>SO</th>
                <th>WHIP</th>
                <th>K/9</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredRoster.map((p) => {
            const jersey = p.jerseyNumber || "-";
            const name = p.person?.fullName || "-";
            const pos = p.position?.abbreviation || p.position?.name || "-";
            const teamName = isAllTeams
              ? getTeamNameKoById(p.team?.id, p.team?.name || "")
              : "";

            const stat = statsMap[p.person?.id];

            let k9 = null;
            if (showPitchingStats && stat?.inningsPitched) {
              const ip = parseFloat(stat.inningsPitched);
              if (ip > 0) {
                k9 = ((stat.strikeOuts ?? 0) * 9) / ip;
              }
            }

            return (
              <tr
                key={p.person?.id + "-" + (p.team?.id || "")}
                className="player-row"
                onClick={() => navigate(`/players/${p.person?.id}`)}
              >
                <td>{jersey}</td>
                <td>{name}</td>
                <td>{pos}</td>
                {isAllTeams && <td>{teamName}</td>}

                {showHittingStats && (
                  <>
                    <td>{stat?.gamesPlayed ?? "-"}</td>
                    <td>{stat?.avg ?? "-"}</td>
                    <td>{stat?.obp ?? "-"}</td>
                    <td>{stat?.slg ?? "-"}</td>
                    <td>{stat?.ops ?? "-"}</td>
                    <td>{stat?.homeRuns ?? "-"}</td>
                    <td>{stat?.rbi ?? "-"}</td>
                  </>
                )}

                {showPitchingStats && (
                  <>
                    <td>{stat?.gamesPlayed ?? "-"}</td>
                    <td>{stat?.inningsPitched ?? "-"}</td>
                    <td>{stat?.era ?? "-"}</td>
                    <td>{stat?.strikeOuts ?? "-"}</td>
                    <td>{stat?.whip ?? "-"}</td>
                    <td>{k9 != null ? k9.toFixed(1) : "-"}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
