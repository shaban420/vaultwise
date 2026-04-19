import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Overview", icon: "◈", end: true },
  { to: "/history", label: "History", icon: "↕" },
  { to: "/apply", label: "Apply Loan", icon: "✦" },
  { to: "/portfolio", label: "Portfolio", icon: "⬡" },
  { to: "/calculator", label: "Calculator", icon: "◎" },
];

export default function TopNav() {
  return (
    <nav className="topnav">
      <NavLink to="/" className="nav-brand">
        <div className="nav-brand-icon">⬡</div>
        <span className="nav-brand-name">VaultWise</span>
      </NavLink>

      <div className="nav-items">
        {NAV_LINKS.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="nav-actions">
        <button className="theme-pill">⬡ PKR Account</button>
      </div>
    </nav>
  );
}
