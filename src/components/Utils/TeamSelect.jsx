import { useEffect, useState } from "react";
import { fetchTeams } from "../../api/mlbApi.js";
import { getTeamNameKoById } from "../../common/teamsNameKo";
import "./TeamSelect.css";

export default function TeamSelect({ selectedTeamId, onChangeTeam }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await fetchTeams();
        // MLB만 필터 (league / active 옵션 조정 가능)
        const mlbTeams = data.filter((t) => t.sport?.id === 1 && t.active);
        setTeams(mlbTeams);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTeams();
  }, []);

  if (loading) return <div className="team-select">팀 목록 불러오는 중...</div>;

  return (
    <div className="team-select">
      <label htmlFor="team-select">팀 선택: </label>
      <select
        id="team-select"
        value={selectedTeamId || "ALL"} // 값 없으면 ALL로
        onChange={(e) => onChangeTeam(e.target.value)}
      >
        {/* 모든 팀 옵션 */}
        <option value="ALL">모든 팀</option>

        {/* 개별 팀들 */}
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {getTeamNameKoById(team.id, team.name)}
          </option>
        ))}
      </select>
    </div>
  );
}
