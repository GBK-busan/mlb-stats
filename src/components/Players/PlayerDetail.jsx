import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPlayerInfo, fetchPlayerSeasonStats } from "../../api/mlbApi";
import { getTeamNameKoById } from "../../common/teamsNameKo";
import "./PlayerDetail.css";

const currentYear = new Date().getFullYear();
// 표시할 시즌 제한
const SEASON_OPTIONS = Array.from({ length: 20 }, (_, i) => currentYear - i);

export default function PlayerDetail() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const photoUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/w_256,q_100/v1/people/${playerId}/headshot/silo/current`;

  const [player, setPlayer] = useState(null);
  const [hitting, setHitting] = useState(null);
  const [pitching, setPitching] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  // 선수 기본 정보 + 선택 시즌 스탯
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [info, hit, pit] = await Promise.all([
          fetchPlayerInfo(playerId),
          fetchPlayerSeasonStats(playerId, selectedSeason, "hitting"),
          fetchPlayerSeasonStats(playerId, selectedSeason, "pitching"),
        ]);

        setPlayer(info);
        setHitting(hit);
        setPitching(pit);
      } catch (e) {
        console.error("Failed to load player detail:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [playerId, selectedSeason]);

  if (loading) {
    return (
      <main className="player-detail">
        <p>선수 정보를 불러오는 중...</p>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="player-detail">
        <button className="back-link" onClick={() => navigate(-1)}>
          ◀ 선수 목록으로
        </button>
        <p>선수 정보를 찾을 수 없습니다.</p>
      </main>
    );
  }

  const teamNameKo = getTeamNameKoById(
    player.currentTeam?.id,
    player.currentTeam?.name || ""
  );

  const pos = player.primaryPosition?.abbreviation || "";
  const jersey = player.primaryNumber || "-";
  const bats = player.batSide?.description || "-";
  const throws = player.pitchHand?.description || "-";
  const birth = player.birthDate || "-";
  const height = player.height || "-";
  const weight = player.weight || "-";

  return (
    <main className="player-detail">
      <button className="back-link" onClick={() => navigate("/players")}>
        ◀ 선수 목록으로
      </button>

      {/* 헤더 영역 */}
      <section className="player-header">
        <img
          src={photoUrl}
          alt={player.fullName}
          className="player-detail-photo"
        />

        <div className="player-header-main">
          <h1>
            {player.fullName}
            {jersey !== "-" && <span className="player-jersey">#{jersey}</span>}
          </h1>
          <p className="player-team-pos">
            {teamNameKo} · {pos}
          </p>
        </div>

        <div className="player-meta">
          <div>
            <span className="label">타/투</span>
            <span>
              {bats} / {throws}
            </span>
          </div>
          <div>
            <span className="label">출생</span>
            <span>{birth}</span>
          </div>
          <div>
            <span className="label">신체</span>
            <span>
              {height} · {weight}
            </span>
          </div>
        </div>
      </section>

      {/* 시즌 선택 바 */}
      <section className="player-section season-section">
        <div className="season-select-wrap">
          <label htmlFor="season-select">시즌 선택:</label>
          <select
            id="season-select"
            className="season-select"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
          >
            {SEASON_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year} 시즌
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* 선택 시즌 타격 스탯 */}
      <section className="player-section">
        <h2>타격 스탯 ({selectedSeason} 시즌)</h2>
        {hitting ? (
          <table className="player-stats-table">
            <thead>
              <tr>
                <th>경기수</th>
                <th>타수</th>
                <th>안타</th>
                <th>2루타</th>
                <th>3루타</th>
                <th>홈런</th>
                <th>타점</th>
                <th>득점</th>
                <th>타율</th>
                <th>출루율</th>
                <th>장타율</th>
                <th>OPS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{hitting.gamesPlayed ?? "-"}</td>
                <td>{hitting.atBats ?? "-"}</td>
                <td>{hitting.hits ?? "-"}</td>
                <td>{hitting.doubles ?? "-"}</td>
                <td>{hitting.triples ?? "-"}</td>
                <td>{hitting.homeRuns ?? "-"}</td>
                <td>{hitting.rbi ?? "-"}</td>
                <td>{hitting.runs ?? "-"}</td>
                <td>{hitting.avg ?? "-"}</td>
                <td>{hitting.obp ?? "-"}</td>
                <td>{hitting.slg ?? "-"}</td>
                <td>{hitting.ops ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="no-stats">
            {selectedSeason} 시즌 타격 스탯이 없습니다.
          </p>
        )}
      </section>

      {/* 선택 시즌 투구 스탯 */}
      <section className="player-section">
        <h2>투구 스탯 ({selectedSeason} 시즌)</h2>
        {pitching ? (
          <table className="player-stats-table">
            <thead>
              <tr>
                <th>경기수</th>
                <th>선발 경기수</th>
                <th>IP</th>
                <th>승</th>
                <th>패</th>
                <th>세이브</th>
                <th>평균자책점</th>
                <th>탈삼진</th>
                <th>볼넷</th>
                <th>WHIP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{pitching.gamesPlayed ?? "-"}</td>
                <td>{pitching.gamesStarted ?? "-"}</td>
                <td>{pitching.inningsPitched ?? "-"}</td>
                <td>{pitching.wins ?? "-"}</td>
                <td>{pitching.losses ?? "-"}</td>
                <td>{pitching.saves ?? "-"}</td>
                <td>{pitching.era ?? "-"}</td>
                <td>{pitching.strikeOuts ?? "-"}</td>
                <td>{pitching.baseOnBalls ?? "-"}</td>
                <td>{pitching.whip ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="no-stats">
            {selectedSeason} 시즌 투구 스탯이 없습니다.
          </p>
        )}
      </section>
    </main>
  );
}
