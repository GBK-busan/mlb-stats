import { useState } from "react";
import TeamSelect from "../Utils/TeamSelect";
import PlayerTable from "./PlayerTable";

export default function PlayersPage() {
  const [selectedTeamId, setSelectedTeamId] = useState("ALL");

  return (
    <main className="home">
      <div className="top-controls">
        <TeamSelect
          selectedTeamId={selectedTeamId}
          onChangeTeam={setSelectedTeamId}
        />
      </div>

      <PlayerTable teamId={selectedTeamId} />
    </main>
  );
}
