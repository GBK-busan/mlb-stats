import "./LinescoreTable.css";

export default function LinescoreTable({
  linescore,
  selectedInning,
  onInningSelect,
  homeName,
  awayName,
}) {
  const innings = linescore?.innings || [];
  const home = linescore?.teams?.home;
  const away = linescore?.teams?.away;

  const handleInningClick = (num) => {
    if (!onInningSelect) return;
    // 같은 이닝 한 번 더 누르면 해제
    if (selectedInning === num) onInningSelect(null);
    else onInningSelect(num);
  };

  return (
    <table className="linescore-table">
      <thead>
        <tr>
          <th></th>
          {innings.map((inn, idx) => {
            const num = inn.num || idx + 1;
            const isSelected = selectedInning === num;
            return (
              <th
                key={num}
                className={"inning-cell" + (isSelected ? " selected" : "")}
                onClick={() => handleInningClick(num)}
              >
                {num}
              </th>
            );
          })}
          <th>R</th>
          <th>H</th>
          <th>E</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="team-label away-label">{awayName || "AWAY"}</td>
          {innings.map((inn, idx) => (
            <td key={idx + "-a"}>{inn.away?.runs ?? "-"}</td>
          ))}
          <td>{away?.runs ?? "-"}</td>
          <td>{away?.hits ?? "-"}</td>
          <td>{away?.errors ?? "-"}</td>
        </tr>
        <tr>
          <td className="team-label home-label">{homeName || "HOME"}</td>
          {innings.map((inn, idx) => (
            <td key={idx + "-h"}>{inn.home?.runs ?? "-"}</td>
          ))}
          <td>{home?.runs ?? "-"}</td>
          <td>{home?.hits ?? "-"}</td>
          <td>{home?.errors ?? "-"}</td>
        </tr>
      </tbody>
    </table>
  );
}
