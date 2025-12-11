import { useEffect, useMemo, useState } from "react";
import { fetchStandings } from "../../api/mlbApi";
import {
  getTeamNameKoById,
  getTeamColor,
  getTeamLogoUrl,
} from "../../common/teamsNameKo";
import "./StandingsPage.css";
import { Link } from "react-router-dom";

const DIVISION_META = {
  200: { league: "AL", division: "West", label: "서부지구" },
  201: { league: "AL", division: "East", label: "동부지구" },
  202: { league: "AL", division: "Central", label: "중부지구" },
  203: { league: "NL", division: "West", label: "서부지구" },
  204: { league: "NL", division: "East", label: "동부지구" },
  205: { league: "NL", division: "Central", label: "중부지구" },
};

const DIVISION_ORDER = [
  "AL 동부",
  "AL 중부",
  "AL 서부",
  "NL 동부",
  "NL 중부",
  "NL 서부",
];

const currentYear = new Date().getFullYear();

export default function StandingsPage() {
  const [season, setSeason] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 순위 데이터 불러오기
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchStandings(season);
        setData(res);
      } catch (e) {
        console.error("Failed to load standings:", e);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [season]);

  // records → divisions 배열로 정리
  const divisions = useMemo(() => {
    if (!data?.records) return [];

    return data.records
      .map((rec) => {
        const divId = rec.division?.id;
        const meta = DIVISION_META[divId] || {};
        const league = meta.league || "";
        const division = meta.division || "";
        const label = meta.label || `${league} ${division}`;

        return {
          league, // "AL" / "NL"
          division, // "East" / "Central" / "West"
          label, // "AL East" 같은 문자열
          teams: rec.teamRecords || [],
        };
      })
      .sort((a, b) => {
        const ai = DIVISION_ORDER.indexOf(a.label);
        const bi = DIVISION_ORDER.indexOf(b.label);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });
  }, [data]);

  // 리그별로 나누기
  const grouped = useMemo(
    () => ({
      AL: divisions.filter((d) => d.league === "AL"),
      NL: divisions.filter((d) => d.league === "NL"),
    }),
    [divisions]
  );

  // 표시할 시즌 제한
  const seasonOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <main className="standings-page">
        <div className="standings-controls">
          <h1>MLB 순위</h1>
        </div>
        <p>순위 데이터를 불러오는 중...</p>
      </main>
    );
  }

  const hasData =
    (grouped.AL && grouped.AL.length > 0) ||
    (grouped.NL && grouped.NL.length > 0);

  return (
    <main className="standings-page">
      <div className="standings-controls">
        <h1>MLB 순위</h1>
        <div className="season-select">
          <label htmlFor="season">시즌</label>
          <select
            id="season"
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
          >
            {seasonOptions.map((y) => (
              <option key={y} value={y}>
                {y} 시즌
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasData ? (
        <p>표시할 순위 데이터가 없습니다.</p>
      ) : (
        <div className="standings-league-wrap">
          {/* AMERICAN LEAGUE */}
          {grouped.AL && grouped.AL.length > 0 && (
            <section className="league-section">
              <h2 className="league-title">AMERICAN LEAGUE</h2>

              <div className="standings-division-list">
                {grouped.AL.map((div) => (
                  <section key={div.label} className="standings-division">
                    <h3>{div.label}</h3>
                    <StandingsTable division={div} />
                  </section>
                ))}
              </div>
            </section>
          )}

          {/* NATIONAL LEAGUE */}
          {grouped.NL && grouped.NL.length > 0 && (
            <section className="league-section">
              <h2 className="league-title">NATIONAL LEAGUE</h2>

              <div className="standings-division-list">
                {grouped.NL.map((div) => (
                  <section key={div.label} className="standings-division">
                    <h3>{div.label}</h3>
                    <StandingsTable division={div} />
                  </section>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

// 🔹 지구 하나의 테이블 렌더링 컴포넌트
function StandingsTable({ division }) {
  return (
    <table className="standings-table">
      <thead>
        <tr>
          <th className="col-team">팀</th>
          <th>W</th>
          <th>L</th>
          <th>PCT</th>
          <th>GB</th>
          <th>RDiff</th>
          <th>L10</th>
          <th>STRK</th>
        </tr>
      </thead>
      <tbody>
        {division.teams.map((tr) => {
          const team = tr.team;
          const nameKo = getTeamNameKoById(team?.id, team?.name || "");
          const logo = getTeamLogoUrl(team?.id);
          const color = getTeamColor(team?.id);

          const wins = tr.wins ?? 0;
          const losses = tr.losses ?? 0;
          const pctRaw =
            tr.winningPercentage ??
            tr.pct ??
            (wins + losses > 0 ? (wins / (wins + losses)).toFixed(3) : "0.000");
          const pct = typeof pctRaw === "string" ? pctRaw : pctRaw.toString();

          const gb =
            tr.gamesBack ?? tr.divisionGamesBack ?? tr.sportGamesBack ?? "-";

          const runDiff =
            tr.runDifferential ??
            (tr.runsScored != null && tr.runsAllowed != null
              ? tr.runsScored - tr.runsAllowed
              : null);

          // lastTen 안전하게 처리
          let lastTen = tr.lastTen ?? "-";
          if (Array.isArray(tr.records)) {
            const recLastTen = tr.records.find((r) => r.type === "lastTen");
            if (recLastTen?.summary) {
              lastTen = recLastTen.summary;
            }
          }

          const streak =
            tr.streak?.streakCode ??
            (tr.streak?.streakNumber && tr.streak?.streakType
              ? `${tr.streak.streakType}${tr.streak.streakNumber}`
              : "-");

          return (
            <tr key={team?.id}>
              <td className="team-cell">
                <span
                  className="team-color-dot"
                  style={{ backgroundColor: color }}
                />
                {logo && <img src={logo} alt={nameKo} className="team-logo" />}
                <span className="team-name">
                  <Link to={`/teams/${team?.id}`} className="team-link">
                    {nameKo}
                  </Link>
                </span>
              </td>
              <td>{wins}</td>
              <td>{losses}</td>
              <td>{pct}</td>
              <td>{gb}</td>
              <td>{runDiff != null ? runDiff : "-"}</td>
              <td>{lastTen}</td>
              <td>{streak}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
