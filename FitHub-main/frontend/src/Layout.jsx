import { NavLink, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="logo">
          🏃 FitHub
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/">
            🏠 Home
          </NavLink>

          <NavLink to="/food">
            🍴 Food
          </NavLink>

          <NavLink to="/activity">
            📈 Activity
          </NavLink>

          <NavLink to="/profile">
            👤 Profile
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