import { useEffect, useState, useMemo } from "react";
import { fetchTeams } from "../../api/mlbApi";
import { getTeamNameKoById, getTeamLogoUrl } from "../../common/teamsNameKo";
import { Link, useNavigate } from "react-router-dom";
import { getDivisionNameKo } from "../../common/divisionNameKo";
import "./TeamsList.css";

export default function TeamsList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchTeams();
        setTeams(data);
      } catch (e) {
        console.error("Failed to load teams:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  // 리그 + 지구별 그룹핑
  const grouped = useMemo(() => {
    const result = {};

    teams.forEach((team) => {
      const league = team.league?.nameShort || team.league?.name || "기타";
      const division = team.division?.nameShort || team.division?.name || "";
      const key = `${league} ${division}`.trim(); // 예: "AL East"

      if (!result[key]) result[key] = [];
      result[key].push(team);
    });

    return result;
  }, [teams]);

  if (loading) {
    return (
      <main className="teams-page">
        <p>팀 목록을 불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="teams-page">
      <h1 className="teams-title">MLB 팀 목록</h1>
      <p className="teams-subtitle">
        리그와 지구별로 정렬된 MLB 팀 리스트입니다.
      </p>

      <div className="teams-groups">
        {Object.entries(grouped).map(([groupName, groupTeams]) => (
          <section key={groupName} className="teams-group">
            <h2 className="teams-group-title">
              {getDivisionNameKo(groupName)}
            </h2>
            <div className="teams-grid">
              {groupTeams.map((team) => {
                const nameKo = getTeamNameKoById(team.id, team.name);
                const logo = getTeamLogoUrl(team.id);

                return (
                  <Link
                    key={team.id}
                    to={`/teams/${team.id}`}
                    className="team-card"
                  >
                    <div className="team-card-main">
                      {logo && (
                        <img
                          src={logo}
                          alt={nameKo}
                          className="team-card-logo"
                        />
                      )}
                      <div className="team-card-names">
                        <div className="team-name-ko">{nameKo}</div>
                        <div className="team-name-en">{team.name}</div>
                      </div>
                    </div>

                    <div className="team-card-meta">
                      {team.venue?.id && team.venue?.name && (
                        <button
                          type="button"
                          className="venue-name"
                          title={team.venue.name}
                          onClick={(e) => {
                            e.preventDefault(); // 카드 링크 기본 동작 막기
                            e.stopPropagation(); // 부모 Link 클릭 이벤트 막기
                            navigate(`/venues/${team.venue.id}`);
                          }}
                        >
                          <span className="venue-icon">📍</span>
                          {team.venue.name}
                        </button>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
