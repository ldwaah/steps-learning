import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { isApiMode } from "../lib/api/config";
import { getCurrentUser } from "../lib/authSession";
import { syncStoredLevel } from "../lib/storage";
import styles from "./StudentLayout.module.css";

const NAV = [
  { to: "/home", label: "Home", end: true },
  { to: "/pathways", label: "Pathways", end: false },
  { to: "/progress", label: "Progress", end: false },
  { to: "/menu", label: "Menu", end: false },
] as const;

export default function StudentLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    navigate("/");
    return null;
  }

  if (!isApiMode()) syncStoredLevel(user.id);

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <nav className={styles.nav} aria-label="Main">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
