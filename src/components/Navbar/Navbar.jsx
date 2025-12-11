import { Link, NavLink } from "react-router-dom";
import MLB from "/img/mlb.png"; // 경로 맞게 변경
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo-link">
        <img src={MLB} alt="MLB Logo" className="navbar-logo" />
      </Link>
      <p className="navbar-desc">MLB Stats Dashboard</p>

      <nav className="navbar-menu">
        <NavLink
          to="/"
          className={({ isActive }) =>
            "navbar-item" + (isActive ? " active" : "")
          }
        >
          경기
        </NavLink>
        <NavLink
          to="/players"
          className={({ isActive }) =>
            "navbar-item" + (isActive ? " active" : "")
          }
        >
          선수
        </NavLink>
        <NavLink
          to="/standings"
          className={({ isActive }) =>
            "navbar-item" + (isActive ? " active" : "")
          }
        >
          순위
        </NavLink>
        <NavLink
          to="/teams"
          className={({ isActive }) =>
            "navbar-item" + (isActive ? " active" : "")
          }
        >
          팀
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            "navbar-item" + (isActive ? " active" : "")
          }
          to="/venues"
        >
          구장
        </NavLink>
      </nav>
    </header>
  );
}
