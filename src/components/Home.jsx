import { useState } from "react";
import TeamSelect from "./Utils/TeamSelect";
import GameList from "./games/GameList";
import DatePicker from "./Utils/DatePicker";

export default function Home() {
  const [selectedTeamId, setSelectedTeamId] = useState("ALL");

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 10);
  });

  return (
    <main>
      <div className="top-controls">
        <TeamSelect
          selectedTeamId={selectedTeamId}
          onChangeTeam={setSelectedTeamId}
        />
        <DatePicker date={selectedDate} onChangeDate={setSelectedDate} />
      </div>

      <GameList teamId={selectedTeamId} date={selectedDate} />
    </main>
  );
}
