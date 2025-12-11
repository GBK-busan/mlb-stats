import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar/Navbar";
import GameDetail from "./components/Games/GameDetail";
import PlayersPage from "./components/Players/PlayersPage";
import StandingsPage from "./components/Games/StandingsPage";
import PlayerDetail from "./components/Players/PlayerDetail";
import TeamsList from "./components/Teams/TeamsList";
import TeamDetail from "./components/Teams/TeamDetail";
import VenueDetail from "./components/Venues/VenueDetail";
import VenuesList from "./components/Venues/VenuesList";

function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/game/:gamePk" element={<GameDetail />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:playerId" element={<PlayerDetail />} />
        <Route path="/teams" element={<TeamsList />} />
        <Route path="/teams/:teamId" element={<TeamDetail />} />
        <Route path="/venues" element={<VenuesList />} />
        <Route path="/venues/:venueId" element={<VenueDetail />} />
      </Routes>
    </div>
  );
}

export default App;
