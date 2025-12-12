import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  fetchTeamInfo,
  fetchTeamStats,
  fetchTeamLeaders,
  fetchTeamRoster,
  fetchTeamSeasonSchedule,
} from "../../api/mlbApi.js";
import { getTeamLogoUrl, getTeamNameKoById } from "../../common/teamsNameKo";
import "./TeamDetail.css";
import { getDivisionNameKo } from "../../common/divisionNameKo";

export default function TeamDetail() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [season, setSeason] = useState(currentYear);
  const [schedule, setSchedule] = useState([]); // 시즌 경기 목록
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [team, setTeam] = useState(null);
  const [hitting, setHitting] = useState(null);
  const [pitching, setPitching] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  // teamId, season 변경될 때마다 스케줄 재호출
  useEffect(() => {
    async function loadSchedule() {
      if (!teamId) return;
      setScheduleLoading(true);
      try {
        const games = await fetchTeamSeasonSchedule(teamId, season);
        setSchedule(games);
      } catch (e) {
        console.error("Failed to load team season schedule:", e);
        setSchedule([]);
      } finally {
        setScheduleLoading(false);
      }
    }

    loadSchedule();
  }, [teamId, season]);

  // 데이터 로딩
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [info, hit, pit, leaderData, rosterData] = await Promise.all([
          fetchTeamInfo(teamId),
          fetchTeamStats(teamId, season, "hitting"),
          fetchTeamStats(teamId, season, "pitching"),
          fetchTeamLeaders(teamId, season),
          fetchTeamRoster(teamId),
        ]);

        setTeam(info);
        setHitting(hit);
        setPitching(pit);
        setLeaders(leaderData);
        setRoster(rosterData);
      } catch (err) {
        console.error("Failed to load team detail:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [teamId, season]);

  // 팀 리더보드 가공 (항상 호출되도록 위에 둠)
  const { hittingLeaders, pitchingLeaders } = useMemo(() => {
    if (!leaders || leaders.length === 0)
      return { hittingLeaders: [], pitchingLeaders: [] };

    const mapDisplay = {
      homeRuns: "홈런",
      rbi: "타점",
      avg: "타율",
      ops: "OPS",
      era: "ERA",
      strikeOuts: "탈삼진",
      wins: "승",
      saves: "세이브",
    };

    const hitStatKeys = ["homeRuns", "rbi", "avg", "ops"];
    const pitStatKeys = ["era", "strikeOuts", "wins", "saves"];

    const categories = {};
    leaders.forEach((c) => {
      categories[c.leaderCategory] = c.leaders || [];
    });

    const pickTop = (keys) =>
      keys
        .map((k) => {
          const arr = categories[k];
          if (!arr || arr.length === 0) return null;

          const top = arr[0];
          return {
            key: k,
            label: mapDisplay[k] || k,
            playerId: top.person?.id,
            name: top.person?.fullName,
            value: top.value,
          };
        })
        .filter(Boolean);

    return {
      hittingLeaders: pickTop(hitStatKeys),
      pitchingLeaders: pickTop(pitStatKeys),
    };
  }, [leaders]);

  // 로스터 정렬 (이것도 항상 호출)
  const sortedRoster = useMemo(() => {
    if (!roster || roster.length === 0) return [];
    const typeRank = (pos) => (pos === "P" ? 0 : 1);

    return [...roster].sort((a, b) => {
      const pa = a.position?.abbreviation || "";
      const pb = b.position?.abbreviation || "";

      const ta = typeRank(pa);
      const tb = typeRank(pb);
      if (ta !== tb) return ta - tb;

      const ja = Number(a.jerseyNumber) || 999;
      const jb = Number(b.jerseyNumber) || 999;
      return ja - jb;
    });
  }, [roster]);

  if (loading) {
    return <main className="team-detail">불러오는 중...</main>;
  }

  if (!team) {
    return (
      <main className="team-detail">
        <button className="back-link" onClick={() => navigate("/teams")}>
          ◀ 팀 목록으로
        </button>
        <p>팀 정보를 찾을 수 없습니다.</p>
      </main>
    );
  }

  // 팀 기본 정보 계산
  const logo = getTeamLogoUrl(team.id);
  const teamNameKo = getTeamNameKoById(team.id, team.name);
  const venueName = team.venue?.name || "구장 정보 없음";
  const league = team.league?.name || "";
  const division = team.division?.name || "";
  const venue = team?.venue.id;

  // JSX
  return (
    <main className="team-detail">
      {/* 뒤로가기 버튼 */}
      <button className="back-link" onClick={() => navigate("/teams")}>
        ◀ 팀 목록으로
      </button>

      {/* 팀 기본 정보 */}
      <section className="team-header">
        {logo && (
          <img src={logo} alt={teamNameKo} className="team-detail-logo" />
        )}

        <div>
          <h1>{teamNameKo}</h1>
          <p className="team-sub">{getDivisionNameKo(division)}</p>
          <Link key={venue} to={`/venues/${venue}`} className="team-venue">
            {venueName}
          </Link>
        </div>

        <div className="team-season-box">
          <label>시즌 선택:</label>
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="season-select"
          >
            <option value={currentYear}>{currentYear} 시즌</option>
            <option value={currentYear - 1}>{currentYear - 1} 시즌</option>
            <option value={currentYear - 2}>{currentYear - 2} 시즌</option>
          </select>
        </div>
      </section>

      {/* 팀 타격 스탯 */}
      <section className="team-section">
        <h2>타격 스탯 ({season} 시즌)</h2>
        {!hitting ? (
          <p>타격 데이터 없음</p>
        ) : (
          <table className="team-stats-table">
            <thead>
              <tr>
                <th>경기수</th>
                <th>타수</th>
                <th>안타</th>
                <th>2B</th>
                <th>3B</th>
                <th>HR</th>
                <th>RBI</th>
                <th>득점</th>
                <th>AVG</th>
                <th>OPS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{hitting.gamesPlayed}</td>
                <td>{hitting.atBats}</td>
                <td>{hitting.hits}</td>
                <td>{hitting.doubles}</td>
                <td>{hitting.triples}</td>
                <td>{hitting.homeRuns}</td>
                <td>{hitting.rbi}</td>
                <td>{hitting.runs}</td>
                <td>{hitting.avg}</td>
                <td>{hitting.ops}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      {/* 팀 투구 스탯 */}
      <section className="team-section">
        <h2>투구 스탯 ({season} 시즌)</h2>
        {!pitching ? (
          <p>투구 데이터 없음</p>
        ) : (
          <table className="team-stats-table">
            <thead>
              <tr>
                <th>경기수</th>
                <th>승</th>
                <th>패</th>
                <th>세이브</th>
                <th>이닝</th>
                <th>ERA</th>
                <th>탈삼진</th>
                <th>볼넷</th>
                <th>WHIP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{pitching.gamesPlayed}</td>
                <td>{pitching.wins}</td>
                <td>{pitching.losses}</td>
                <td>{pitching.saves}</td>
                <td>{pitching.inningsPitched}</td>
                <td>{pitching.era}</td>
                <td>{pitching.strikeOuts}</td>
                <td>{pitching.baseOnBalls}</td>
                <td>{pitching.whip}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      {/* 팀 내 리더보드 */}
      {(hittingLeaders.length > 0 || pitchingLeaders.length > 0) && (
        <section className="team-section">
          <h2>팀 내 주요 선수 리더보드</h2>

          <div className="leaders-grid">
            {/* 타자 리더보드 */}
            <div className="leaders-block">
              <h3>타자</h3>
              {hittingLeaders.length === 0 ? (
                <p className="no-stats">리더보드 데이터 없음</p>
              ) : (
                <table className="leaders-table">
                  <thead>
                    <tr>
                      <th>지표</th>
                      <th>선수</th>
                      <th>기록</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hittingLeaders.map((row) => (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        <td>
                          {row.playerId ? (
                            <Link
                              to={`/players/${row.playerId}`}
                              className="leader-player-link"
                            >
                              {row.name}
                            </Link>
                          ) : (
                            row.name
                          )}
                        </td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 투수 리더보드 */}
            <div className="leaders-block">
              <h3>투수</h3>
              {pitchingLeaders.length === 0 ? (
                <p className="no-stats">리더보드 데이터 없음</p>
              ) : (
                <table className="leaders-table">
                  <thead>
                    <tr>
                      <th>지표</th>
                      <th>선수</th>
                      <th>기록</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitchingLeaders.map((row) => (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        <td>
                          {row.playerId ? (
                            <Link
                              to={`/players/${row.playerId}`}
                              className="leader-player-link"
                            >
                              {row.name}
                            </Link>
                          ) : (
                            row.name
                          )}
                        </td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 팀 로스터 */}
      <section className="team-section">
        <h2>선수 명단 (현재 로스터)</h2>
        {sortedRoster.length === 0 ? (
          <p className="no-stats">로스터 정보가 없습니다.</p>
        ) : (
          <table className="roster-table">
            <thead>
              <tr>
                <th>#</th>
                <th>이름</th>
                <th>포지션</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {sortedRoster.map((p) => {
                const pos = p.position?.abbreviation;
                return (
                  <tr key={p.person?.id}>
                    <td>{p.jerseyNumber || "-"}</td>
                    <td>
                      <Link
                        to={`/players/${p.person?.id}`}
                        className="leader-player-link"
                      >
                        {p.person?.fullName}
                      </Link>
                    </td>
                    <td>{pos}</td>
                    <td>{pos === "P" ? "투수" : "야수"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* 시즌 경기 일정 */}
      <section className="team-schedule-section">
        <div className="team-schedule-header">
          <h2>시즌 경기 일정</h2>

          <div className="team-schedule-controls">
            <label className="schedule-label">
              시즌 선택
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="schedule-select"
              >
                <option value={currentYear}>{currentYear} 시즌</option>
                <option value={currentYear - 1}>{currentYear - 1} 시즌</option>
                <option value={currentYear - 2}>{currentYear - 2} 시즌</option>
                <option value={currentYear - 3}>{currentYear - 3} 시즌</option>
              </select>
            </label>
            <span className="schedule-count">
              {schedule.length > 0 && !scheduleLoading
                ? `총 ${schedule.length}경기`
                : ""}
            </span>
          </div>
        </div>

        {scheduleLoading && (
          <p className="schedule-loading">시즌 경기 일정을 불러오는 중...</p>
        )}

        {!scheduleLoading && schedule.length === 0 && (
          <p className="schedule-empty">
            선택한 시즌에 대한 경기 정보를 찾을 수 없습니다.
          </p>
        )}

        {!scheduleLoading && schedule.length > 0 && (
          <div className="team-schedule-table-wrapper">
            <table className="team-schedule-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>상대 팀</th>
                  <th>구분</th>
                  <th>스코어</th>
                  <th>결과</th>
                  <th>상태</th>
                  <th>상세</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((game) => {
                  const isHome = game.teams?.home?.team?.id === Number(teamId);
                  const homeTeam = game.teams?.home?.team;
                  const awayTeam = game.teams?.away?.team;
                  const opponent = isHome ? awayTeam : homeTeam;

                  const dateStr = new Date(game.gameDate).toLocaleString(
                    "ko-KR",
                    {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  const status =
                    game.status?.detailedState ||
                    game.status?.abstractGameState;

                  const homeScore = game.teams?.home?.score;
                  const awayScore = game.teams?.away?.score;
                  const scoreText =
                    homeScore != null && awayScore != null
                      ? `${awayScore} - ${homeScore}`
                      : "-";
                  // 경기 결과 배지 계산
                  let resultBadge = "ND"; // No Decision
                  if (homeScore != null && awayScore != null) {
                    if (isHome) {
                      resultBadge =
                        homeScore > awayScore
                          ? "W"
                          : homeScore < awayScore
                          ? "L"
                          : "D";
                    } else {
                      resultBadge =
                        awayScore > homeScore
                          ? "W"
                          : awayScore < homeScore
                          ? "L"
                          : "D";
                    }
                  }
                  return (
                    <tr key={game.gamePk}>
                      <td>{dateStr}</td>
                      <td>{opponent?.name || "-"}</td>
                      <td>{isHome ? "홈" : "원정"}</td>
                      <td>{scoreText}</td>
                      <td>
                        <span className={`result-badge result-${resultBadge}`}>
                          {resultBadge}
                        </span>
                      </td>
                      <td>{status}</td>
                      <td>
                        <Link
                          to={`/game/${game.gamePk}`}
                          className="schedule-link"
                        >
                          경기 보기
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
