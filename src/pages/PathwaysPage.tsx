import { useNavigate } from "react-router-dom";
import { getPathwayTheme, listPathwaysByCategory } from "../content";
import { getPathwayProgressPercent, getTopicSummary } from "../lib/progress";
import { getCurrentUser } from "../lib/authSession";
import styles from "./PathwaysPage.module.css";

export default function PathwaysPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  if (!user) return null;

  const groups = listPathwaysByCategory();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Pathways</h1>
        <p className={styles.lead}>Short sessions. Pick what fits today.</p>
      </header>
      {groups.map((group) => (
        <section key={group.category} className={styles.group}>
          <h2>{group.label}</h2>
          <ul className={styles.list}>
            {group.pathways.map((pathway) => {
              const pct = getPathwayProgressPercent(user.id, pathway.id);
              const summary = getTopicSummary(user.id, pathway.id);
              const theme = getPathwayTheme(pathway.id);
              const status = summary?.isFinished
                ? "Done"
                : pct > 0
                  ? `${pct}%`
                  : "Start";
              return (
                <li key={pathway.id}>
                  <button
                    type="button"
                    className={styles.card}
                    style={{
                      borderLeftColor: theme.accent,
                      background: `linear-gradient(90deg, ${theme.accentSoft} 0%, var(--bg-card) 45%)`,
                    }}
                    onClick={() => navigate(`/topic/${pathway.id}`)}
                  >
                    <span className={styles.icon} style={{ color: theme.accent }}>
                      {theme.icon}
                    </span>
                    <span className={styles.cardBody}>
                      <span className={styles.title}>{pathway.title}</span>
                      <span className={styles.strap}>{pathway.strapline}</span>
                      <span
                        className={`${styles.meta} ${pct > 0 && !summary?.isFinished ? styles.progress : ""}`}
                      >
                        {status}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
