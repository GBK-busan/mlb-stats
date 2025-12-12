import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSchedule } from "../../api/mlbApi.js";
import {
  getTeamNameKoById,
  getTeamLogoUrl,
  getTeamColor,
} from "../../common/teamsNameKo";
import "./GameList.css";

export default function GameList({ teamId, date }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!date) {
      setGames([]);
      return;
    }

    async function loadGames() {
      setLoading(true);
      try {
        const data = await fetchSchedule(teamId, date);
        setGames(data);
      } catch (err) {
        console.error("Failed to load games:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, [teamId, date]);

  const formatGameTime = (game) => {
    if (!game.gameDate) return "-";
    const d = new Date(game.gameDate);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  // 승/패 결과 계산
  const getResultForSide = (game, side) => {
    const teamSide = game.teams?.[side];
    if (!teamSide) return null;

    const statusCode = game.status?.statusCode;
    const detailed = game.status?.detailedState || "";

    // 경기 끝났는지 체크 (Final)
    const isFinal =
      statusCode === "F" ||
      detailed.includes("Final") ||
      detailed.includes("Completed");

    if (!isFinal || typeof teamSide.isWinner !== "boolean") return null;

    return teamSide.isWinner ? "WIN" : "LOSS";
  };

  const sortedGames = useMemo(() => {
    if (!games || games.length === 0) return [];
    return [...games].sort((a, b) => {
      const da = a.gameDate ? new Date(a.gameDate).getTime() : 0;
      const db = b.gameDate ? new Date(b.gameDate).getTime() : 0;
      return da - db;
    });
  }, [games]);

  if (!date)
    return (
      <div className="game-list">날짜를 선택하거나 오늘 버튼을 눌러주세요.</div>
    );
  if (loading) return <div className="game-list">경기 불러오는 중...</div>;

  const title =
    !teamId || teamId === "ALL"
      ? `전체 경기 일정 (${date})`
      : `경기 일정 (${date})`;

  if (sortedGames.length === 0)
    return (
      <div className="game-list">
        <h2>{title}</h2>
        <p>{date} 에 경기가 없습니다.</p>
      </div>
    );

  return (
    <div className="game-list">
      <h2>{title}</h2>
      <ul>
        {sortedGames.map((game) => {
          const away = game.teams.away.team;
          const home = game.teams.home.team;

          const awayResult = getResultForSide(game, "away");
          const homeResult = getResultForSide(game, "home");

          const awayLogo = getTeamLogoUrl(away.id);
          const homeLogo = getTeamLogoUrl(home.id);

          const awayColor = getTeamColor(away.id);
          const homeColor = getTeamColor(home.id);

          // 승팀 ID 계산
          const winnerSide =
            game.teams.away.isWinner === true
              ? "away"
              : game.teams.home.isWinner === true
              ? "home"
              : null;

          const winnerTeamId = winnerSide
            ? game.teams[winnerSide].team.id
            : null;

          // 승팀 컬러 (없으면 기본 회색)
          const winnerColor = winnerTeamId
            ? getTeamColor(winnerTeamId)
            : "#4b5563";

          return (
            <li
              key={game.gamePk}
              className="game-card clickable"
              onClick={() => navigate(`/game/${game.gamePk}`)}
              style={{ borderLeftColor: winnerColor }} // 승팀 컬러 적용
            >
              <div className="teams">
                <div className="team-row">
                  <span
                    className="team-color-dot"
                    style={{ backgroundColor: awayColor }}
                  />
                  {awayLogo && <img className="team-logo" src={awayLogo} />}
                  <span className="team-name">
                    {getTeamNameKoById(away.id, away.name)}
                  </span>
                  {awayResult && (
                    <span
                      className={`result-badge ${
                        awayResult === "WIN" ? "badge-win" : "badge-loss"
                      }`}
                    >
                      {awayResult === "WIN" ? "승" : "패"}
                    </span>
                  )}
                </div>

                <div className="team-row">
                  <span
                    className="team-color-dot"
                    style={{ backgroundColor: homeColor }}
                  />
                  {homeLogo && <img className="team-logo" src={homeLogo} />}
                  <span className="team-name">
                    {getTeamNameKoById(home.id, home.name)}
                  </span>
                  {homeResult && (
                    <span
                      className={`result-badge ${
                        homeResult === "WIN" ? "badge-win" : "badge-loss"
                      }`}
                    >
                      {homeResult === "WIN" ? "승" : "패"}
                    </span>
                  )}
                </div>
              </div>

              <div className="game-meta">
                <span className="game-time">{formatGameTime(game)}</span>
                <span className="status">{game.status.detailedState}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
