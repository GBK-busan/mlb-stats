import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchGameDetail, fetchGameHighlights } from "../../api/mlbApi";
import {
  getTeamNameKoById,
  getTeamLogoUrl,
  getTeamColor,
} from "../../common/teamsNameKo";
import PlayLog from "./PlayLog";
import LinescoreTable from "../Utils/LinescoreTable";
import "./GameDetail.css";

export default function GameDetail() {
  const { gamePk } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInning, setSelectedInning] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [hlLoading, setHlLoading] = useState(false);
  const allPlays = gameData?.liveData?.plays?.allPlays || [];
  const [hlPage, setHlPage] = useState(0);
  const HIGHLIGHTS_PER_PAGE = 3;
  const [activeHighlight, setActiveHighlight] = useState(null);

  useEffect(() => {
    async function loadGame() {
      setLoading(true);
      setHlLoading(true);
      try {
        const [detail, hl] = await Promise.all([
          fetchGameDetail(gamePk),
          fetchGameHighlights(gamePk),
        ]);
        setGameData(detail);
        setHighlights(hl || []);
        setHlPage(0);
      } catch (err) {
        console.error("Failed to load game detail or highlights:", err);
      } finally {
        setLoading(false);
        setHlLoading(false);
      }
    }

    loadGame();
  }, [gamePk, highlights.length]);

  const gameInfo = gameData?.gameData;
  const linescore = gameData?.liveData?.linescore;
  const boxscore = gameData?.liveData?.boxscore;
  const decisions = gameData?.liveData?.decisions || {};

  const statusText = gameInfo?.status?.detailedState;

  const away = gameInfo?.teams?.away;
  const home = gameInfo?.teams?.home;

  const awayNameKo = away ? getTeamNameKoById(away.id, away.name) : "AWAY";
  const homeNameKo = home ? getTeamNameKoById(home.id, home.name) : "HOME";

  const awayLogo = away ? getTeamLogoUrl(away.id) : null;
  const homeLogo = home ? getTeamLogoUrl(home.id) : null;

  const startTimeStr = useMemo(() => {
    const datetime = gameInfo?.datetime?.dateTime;
    if (!datetime) return "-";
    const d = new Date(datetime);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }, [gameInfo]);

  // 공통: playerId로 boxscore에서 선수 찾기
  const findPlayerById = (playerId) => {
    if (!boxscore || !playerId) return null;
    const key = `ID${playerId}`;
    return (
      boxscore.teams?.home?.players?.[key] ||
      boxscore.teams?.away?.players?.[key] ||
      null
    );
  };

  //  승/패/세이브 투수 요약
  const pitchingSummary = useMemo(() => {
    if (!boxscore) return [];

    const result = [];
    const types = [
      { key: "winner", label: "승리 투수" },
      { key: "loser", label: "패전 투수" },
      { key: "save", label: "세이브" },
    ];

    types.forEach(({ key, label }) => {
      const info = decisions[key];
      if (!info) return;

      const player = findPlayerById(info.id);
      const pitching = player?.stats?.pitching;
      if (!pitching) {
        result.push({
          id: info.id,
          type: label,
          name: info.fullName,
          teamName: "", // 필요하면 채움
        });
        return;
      }

      // 홈/원정 어느 팀인지
      const inHome =
        boxscore.teams?.home?.players?.[`ID${info.id}`] !== undefined;
      const teamSide = inHome ? "home" : "away";
      const teamMeta = gameInfo?.teams?.[teamSide];

      result.push({
        id: info.id,
        type: label,
        name: info.fullName,
        teamName: teamMeta ? getTeamNameKoById(teamMeta.id, teamMeta.name) : "",
        ip: pitching.inningsPitched,
        h: pitching.hits,
        r: pitching.runs,
        so: pitching.strikeOuts,
      });
    });

    return result;
  }, [boxscore, decisions, gameInfo]);

  // 하이라이트 리스트 만들기
  const pagedHighlights = useMemo(() => {
    const start = hlPage * HIGHLIGHTS_PER_PAGE;
    return highlights.slice(start, start + HIGHLIGHTS_PER_PAGE);
  }, [highlights, hlPage]);

  const totalHlPages = Math.max(
    1,
    Math.ceil(highlights.length / HIGHLIGHTS_PER_PAGE || 1)
  );

  // 타자 주요 기록 (HR>0 or RBI≥2 or H≥3)
  const battingHighlights = useMemo(() => {
    if (!boxscore) return { away: [], home: [] };

    const makeHighlights = (side) => {
      const teamBox = boxscore.teams?.[side];
      if (!teamBox) return [];
      const { players, batters } = teamBox;
      if (!players || !batters) return [];

      const arr = [];
      batters.forEach((pid) => {
        const key = `ID${pid}`;
        const p = players[key];
        if (!p) return;
        const bat = p.stats?.batting;
        if (!bat) return;

        const hits = bat.hits ?? 0;
        const hr = bat.homeRuns ?? 0;
        const rbi = bat.rbi ?? 0;

        // 조건: 홈런 / 타점 / 3안타 이상
        if (hr > 0 || rbi >= 2 || hits >= 3) {
          arr.push({
            id: pid,
            name: p.person?.fullName,
            hits,
            hr,
            rbi,
          });
        }
      });

      // 간단 정렬: 타점 > 홈런 > 안타
      arr.sort((a, b) => b.rbi - a.rbi || b.hr - a.hr || b.hits - a.hits);

      return arr.slice(0, 3); // 팀당 최대 3명만
    };

    return {
      away: makeHighlights("away"),
      home: makeHighlights("home"),
    };
  }, [boxscore]);

  if (loading) return <main className="game-detail">로딩 중...</main>;

  if (!gameData)
    return (
      <main className="game-detail">
        <p>경기 정보를 불러오지 못했습니다.</p>
        <Link to="/" className="back-link">
          ← 경기 목록으로
        </Link>
      </main>
    );

  const awayColor = away ? getTeamColor(away.id) : "#4b5563";
  const homeColor = home ? getTeamColor(home.id) : "#4b5563";

  return (
    <main className="game-detail">
      <Link to="/" className="back-link">
        ← 경기 목록으로
      </Link>

      {/* 상단 기본 정보 */}
      <header className="detail-header">
        <div className="header-left">
          <p className="game-date">
            {gameInfo?.datetime?.originalDate
              ? new Date(gameInfo.datetime.originalDate).toLocaleDateString(
                  "ko-KR"
                )
              : "날짜 정보 없음"}
          </p>
        </div>

        <div className="header-right">
          <p className="status">{statusText}</p>
          <p className="time">시작 시간: {startTimeStr}</p>
        </div>
      </header>

      {/* 점수 요약 */}
      {linescore && (
        <section className="score-summary">
          <div className="team-score" style={{ borderLeftColor: awayColor }}>
            <div className="team-info">
              {awayLogo && (
                <img className="detail-logo" src={awayLogo} alt={awayNameKo} />
              )}
              <span className="team-name">
                <Link className="team-link" to={`/teams/${away.id}`}>
                  {awayNameKo}
                </Link>
              </span>
            </div>
            <span className="score">{linescore.teams?.away?.runs ?? "-"}</span>
          </div>
          <div className="team-score" style={{ borderLeftColor: homeColor }}>
            <div className="team-info">
              {homeLogo && (
                <img className="detail-logo" src={homeLogo} alt={homeNameKo} />
              )}
              <span className="team-name">
                <Link className="team-link" to={`/teams/${home.id}`}>
                  {homeNameKo}
                </Link>
              </span>
            </div>
            <span className="score">{linescore.teams?.home?.runs ?? "-"}</span>
          </div>
        </section>
      )}

      {/* 이닝별 점수 */}
      <section className="linescore-section">
        <h2>이닝별 점수</h2>
        <LinescoreTable
          linescore={linescore}
          selectedInning={selectedInning}
          onInningSelect={setSelectedInning}
          homeName={homeNameKo}
          awayName={awayNameKo}
        />
      </section>

      {/* 투수 요약 (승/패/세이브) */}
      {pitchingSummary.length > 0 && (
        <section className="pitching-summary">
          <h3>투수 기록</h3>
          <div className="pitching-grid">
            {pitchingSummary.map((p) => (
              <div key={p.type + p.name} className="pitching-card">
                <div className="pitching-header">
                  <span className="pitching-role">{p.type}</span>
                  <span className="pitching-name">
                    <Link to={`/players/${p.id}`} className="player-link">
                      {p.name}
                    </Link>
                  </span>
                  {p.teamName && (
                    <span className="pitching-team">{p.teamName}</span>
                  )}
                </div>
                {p.ip && (
                  <div className="pitching-stats">
                    <span>IP {p.ip}</span>
                    <span>피안타 {p.h}</span>
                    <span>실점 {p.r}</span>
                    <span>삼진 {p.so}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 타자 주요 기록 */}
      {(battingHighlights.away.length > 0 ||
        battingHighlights.home.length > 0) && (
        <section className="batting-highlights">
          <h3>타자 주요 기록</h3>
          <div className="batting-grid">
            <div className="batting-team">
              <h4>{awayNameKo}</h4>
              {battingHighlights.away.length === 0 ? (
                <p className="no-data">주요 기록 없음</p>
              ) : (
                <ul>
                  {battingHighlights.away.map((b) => (
                    <li key={b.id}>
                      <span className="batter-name">
                        <Link
                          to={`/players/${b.id}`}
                          className="player-link batter-name"
                        >
                          {b.name}
                        </Link>
                      </span>
                      <span className="batter-stats">
                        {b.hits - b.hr > 0 && `${b.hits - b.hr}안타`}{" "}
                        {b.hr > 0 && `· ${b.hr}홈런`}{" "}
                        {b.rbi > 0 && `· ${b.rbi}타점`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="batting-team">
              <h4>{homeNameKo}</h4>
              {battingHighlights.home.length === 0 ? (
                <p className="no-data">주요 기록 없음</p>
              ) : (
                <ul>
                  {battingHighlights.home.map((b) => (
                    <li key={b.id}>
                      <span className="batter-name">
                        <Link
                          to={`/players/${b.id}`}
                          className="player-link batter-name"
                        >
                          {b.name}
                        </Link>
                      </span>
                      <span className="batter-stats">
                        {b.hits}안타 {b.hr > 0 && `· ${b.hr}홈런`}{" "}
                        {b.rbi > 0 && `· ${b.rbi}타점`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
      {/* 경기 하이라이트 섹션 */}
      <section className="highlights-section">
        <h2>경기 하이라이트</h2>

        {hlLoading && (
          <p className="highlights-loading">하이라이트 불러오는 중...</p>
        )}

        {!hlLoading && highlights.length === 0 && (
          <p className="highlights-empty">
            이 경기의 하이라이트 영상이 없습니다.
          </p>
        )}

        {!hlLoading && highlights.length > 0 && (
          <>
            <div className="highlights-carousel-header">
              <span className="highlights-count">
                총 {highlights.length}개 중 {hlPage * HIGHLIGHTS_PER_PAGE + 1}–
                {Math.min(
                  highlights.length,
                  (hlPage + 1) * HIGHLIGHTS_PER_PAGE
                )}{" "}
                하이라이트
              </span>

              <div className="highlights-nav">
                <button
                  type="button"
                  className="hl-nav-btn"
                  onClick={() => setHlPage((p) => Math.max(0, p - 1))}
                  disabled={hlPage === 0}
                >
                  ◀
                </button>
                <span className="hl-page-indicator">
                  {hlPage + 1} / {totalHlPages}
                </span>
                <button
                  type="button"
                  className="hl-nav-btn"
                  onClick={() =>
                    setHlPage((p) => Math.min(totalHlPages - 1, p + 1))
                  }
                  disabled={hlPage >= totalHlPages - 1}
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="highlights-grid">
              {pagedHighlights.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className="highlight-card"
                  onClick={() => {
                    if (!h.videoUrl) return;
                    setActiveHighlight(h);
                  }}
                >
                  <div className="highlight-thumb-wrapper">
                    {h.imageUrl ? (
                      <img
                        src={h.imageUrl}
                        alt={h.title}
                        className="highlight-thumb"
                      />
                    ) : (
                      <div className="highlight-thumb placeholder">
                        하이라이트
                      </div>
                    )}
                    <div className="highlight-play-badge">▶</div>
                  </div>
                  <div className="highlight-body">
                    <h3 className="highlight-title">{h.title}</h3>
                    {h.blurb && <p className="highlight-blurb">{h.blurb}</p>}
                    {h.duration && (
                      <span className="highlight-duration">⏱ {h.duration}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {activeHighlight && (
        <div
          className="highlight-modal-backdrop"
          onClick={() => setActiveHighlight(null)}
        >
          <div
            className="highlight-modal"
            onClick={(e) => e.stopPropagation()} // 안쪽 클릭 시 백드롭 클릭 막기
          >
            <div className="highlight-modal-header">
              <h3 className="highlight-modal-title">{activeHighlight.title}</h3>
              <button
                type="button"
                className="highlight-modal-close"
                onClick={() => setActiveHighlight(null)}
              >
                ✕
              </button>
            </div>

            <div className="highlight-modal-body">
              {activeHighlight.videoUrl ? (
                <video
                  key={activeHighlight.id}
                  src={activeHighlight.videoUrl}
                  controls
                  autoPlay
                  className="highlight-modal-video"
                />
              ) : (
                <p>영상 URL을 불러올 수 없습니다.</p>
              )}

              {activeHighlight.blurb && (
                <p className="highlight-modal-blurb">{activeHighlight.blurb}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="game-log-section">
        <h2>
          게임 플레이 로그
          {selectedInning && ` – ${selectedInning}회`}
        </h2>
        <PlayLog plays={allPlays} selectedInning={selectedInning} />
      </section>
    </main>
  );
}
