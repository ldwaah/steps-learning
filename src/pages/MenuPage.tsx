import { Link, useNavigate } from "react-router-dom";
import { logAudit } from "../lib/audit";
import { getCurrentUser, signOut } from "../lib/authSession";
import styles from "./MenuPage.module.css";

const LINKS = [
  { label: "Check-in", path: "/check-in" },
  { label: "Breathing", path: "/regulate" },
  { label: "Activity log", path: "/activity" },
] as const;

export default function MenuPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  if (!user) return null;

  return (
    <div className={styles.page}>
      <h1>Menu</h1>
      <nav className={styles.nav}>
        {LINKS.map((item) => (
          <button
            key={item.path}
            type="button"
            className={styles.link}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <Link to="/staff-quality" className={styles.staffLink}>
        Staff: quality notes
      </Link>
      <button
        type="button"
        className={styles.logout}
        onClick={() => {
          logAudit({
            userId: user.id,
            type: "auth.logout",
            summary: "Signed out",
          });
          signOut();
          navigate("/");
        }}
      >
        Log out
      </button>
    </div>
  );
}
