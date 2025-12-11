import "./PlayLog.css";

export default function PlayLog({ plays, selectedInning }) {
  // 선택된 이닝이 있으면 그 이닝만 필터링
  const filteredPlays = selectedInning
    ? (plays || []).filter((p) => p.about?.inning === selectedInning)
    : plays || [];

  if (!filteredPlays.length) {
    return (
      <p className="no-plays">
        {selectedInning
          ? `${selectedInning}회에 기록된 플레이 로그가 없습니다.`
          : "게임 플레이 로그가 없습니다."}
      </p>
    );
  }

  // 이하 로직은 기존과 동일하되 filteredPlays 사용
  const grouped = filteredPlays.reduce((acc, play) => {
    const inning = play.about?.inning;
    const half = play.about?.halfInning; // 'top' | 'bottom'
    if (!inning || !half) return acc;

    const key = `${inning}-${half}`;
    if (!acc[key]) {
      acc[key] = {
        inning,
        half,
        plays: [],
      };
    }
    acc[key].plays.push(play);
    return acc;
  }, {});

  const orderedInnings = Object.values(grouped).sort((a, b) => {
    if (a.inning === b.inning) {
      const orderHalf = (h) => (h === "top" ? 0 : 1);
      return orderHalf(a.half) - orderHalf(b.half);
    }
    return a.inning - b.inning;
  });

  const halfLabel = (half) => (half === "top" ? "초" : "말");

  return (
    <div className="playbyplay">
      {orderedInnings.map((block) => (
        <section key={`${block.inning}-${block.half}`} className="inning-block">
          <h3 className="inning-title">
            {block.inning}회 {halfLabel(block.half)}
          </h3>
          <ul className="play-list">
            {block.plays.map((play) => {
              const id = play.playId || play.atBatIndex;
              const desc = play.result?.description || "상세 설명 없음";
              const batter = play.matchup?.batter?.fullName;
              const pitchCount = play.count
                ? `${play.count.balls}-${play.count.strikes}`
                : null;
              const outs = play.count?.outs ?? play.about?.outsAfterPlay;
              const isScoring =
                play.result?.isScoringPlay || play.about?.isScoringPlay;

              return (
                <li
                  key={id}
                  className={"play-item" + (isScoring ? " scoring-play" : "")}
                >
                  <div className="play-main">
                    <div className="play-meta">
                      {outs != null && (
                        <span className="tag outs">{outs} 아웃</span>
                      )}
                      {pitchCount && (
                        <span className="tag count">볼카운트 {pitchCount}</span>
                      )}
                      {isScoring && (
                        <span className="tag scoring">득점 플레이</span>
                      )}
                    </div>
                    <p className="play-desc">{desc}</p>
                  </div>
                  {batter && (
                    <div className="play-sub">
                      타자: <span className="batter-name">{batter}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
