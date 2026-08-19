import { NavLink, Outlet } from "react-router-dom";
import logoImg from "./assets/fithub_logo.png";

function Layout() {
  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="logo" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
          <img
            src={logoImg}
            alt="FitHub Logo"
            style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
          />
          <span style={{ fontWeight: "700", fontSize: "20px", color: "#ffffff", letterSpacing: "0.5px" }}>
            Fit<span style={{ color: "#00d68f" }}>Hub</span>
          </span>
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/">
            🏠 Home
          </NavLink>

          <NavLink to="/food">
            🍴 Food & Water
          </NavLink>

          <NavLink to="/activity">
            📈 Activity
          </NavLink>

          <NavLink to="/progress">
            📊 Progress & BMI
          </NavLink>

          <NavLink to="/profile">
            👤 Profile
          </NavLink>

          <NavLink to="/admin">
            🛡️ Admin
          </NavLink>

        </nav>

      </aside>

      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default Layout;