import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchTeams } from "../../api/mlbApi.js";
import { getTeamNameKoById, getTeamLogoUrl } from "../../common/teamsNameKo";
import "./VenuesList.css";

export default function VenuesList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchTeams();
        setTeams(data || []);
      } catch (e) {
        console.error("Failed to load teams for venues:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 팀 목록으로부터 "구장" 중심 데이터 구조 만들기
  const venues = useMemo(() => {
    const map = new Map();

    teams.forEach((team) => {
      const venue = team.venue;
      if (!venue || !venue.id) return;

      const key = String(venue.id);
      if (!map.has(key)) {
        map.set(key, {
          id: venue.id,
          name: venue.name,
          teams: [],
        });
      }

      map.get(key).teams.push(team);
    });

    // 이름순 정렬
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [teams]);

  if (loading) {
    return (
      <main className="venues-page">
        <p>구장 목록을 불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="venues-page">
      <h1 className="venues-title">MLB 구장 목록</h1>
      <p className="venues-subtitle">
        현재 MLB 팀들이 홈으로 사용하는 구장 리스트입니다.
      </p>

      {venues.length === 0 ? (
        <p className="venues-empty">표시할 구장 정보가 없습니다.</p>
      ) : (
        <div className="venues-grid">
          {venues.map((v) => (
            <Link key={v.id} to={`/venues/${v.id}`} className="venue-card-link">
              <article className="venue-card">
                <header className="venue-card-header">
                  <span className="venue-card-tag">BALLPARK</span>
                  <h2 className="venue-card-name">{v.name}</h2>
                </header>

                <section className="venue-card-body">
                  <h3 className="venue-card-teams-title">홈 팀</h3>
                  <div className="venue-card-teams">
                    {v.teams.map((team) => {
                      const nameKo = getTeamNameKoById(team.id, team.name);
                      const logo = getTeamLogoUrl(team.id);
                      return (
                        <div key={team.id} className="venue-team-pill">
                          {logo && (
                            <img
                              src={logo}
                              alt={nameKo}
                              className="venue-team-logo"
                            />
                          )}
                          <div className="venue-team-text">
                            <span className="venue-team-name-ko">{nameKo}</span>
                            <span className="venue-team-name-en">
                              {team.name}
                            </span>
                            {team.league?.nameShort && (
                              <span className="venue-team-meta">
                                {team.league.nameShort} ·{" "}
                                {team.division?.nameShort}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </article>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
