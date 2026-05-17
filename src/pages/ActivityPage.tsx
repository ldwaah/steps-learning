import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_LABELS,
  type AuditCategory,
  exportAuditJson,
  formatAuditTime,
  getAuditByDay,
  getAuditStats,
  refreshAuditFromServer,
} from "../lib/audit";
import { isApiMode } from "../lib/api/config";
import { getCurrentUser } from "../lib/authSession";
import styles from "./ActivityPage.module.css";

type Filter = "all" | AuditCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "auth", label: "Sign in" },
  { id: "wellbeing", label: "Wellbeing" },
  { id: "learning", label: "Sessions" },
];

export default function ActivityPage() {
  const user = getCurrentUser();
  const [filter, setFilter] = useState<Filter>("all");
  const [copied, setCopied] = useState(false);
  const [auditReady, setAuditReady] = useState(!isApiMode());

  useEffect(() => {
    if (!user || !isApiMode()) return;
    refreshAuditFromServer(user.id)
      .then(() => setAuditReady(true))
      .catch(() => setAuditReady(true));
  }, [user?.id]);

  const stats = user && auditReady ? getAuditStats(user.id) : null;

  const days = user && auditReady ? getAuditByDay(user.id) : [];
  const groups =
    filter === "all"
      ? days
      : days
          .map((day) => ({
            ...day,
            events: day.events.filter((e) => e.category === filter),
          }))
          .filter((day) => day.events.length > 0);

  if (!user) return null;

  async function handleExport() {
    const json = exportAuditJson(user!.id);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/menu" className={styles.back}>
          ← Menu
        </Link>
        <p className={styles.kicker}>Your record</p>
        <h1>Activity log</h1>
        <p className={styles.lead}>
          A clear trail of what you did on this device. Nothing is sent online.
        </p>
      </header>

      {stats ? (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.today}</span>
            <span className={styles.statLabel}>today</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.sessionsCompleted}</span>
            <span className={styles.statLabel}>sessions</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{stats.pointsEarned}</span>
            <span className={styles.statLabel}>pts logged</span>
          </div>
        </div>
      ) : null}

      <div className={styles.filters} role="tablist" aria-label="Filter activity">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={filter === f.id ? styles.filterActive : styles.filter}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <button type="button" className={styles.exportBtn} onClick={handleExport}>
          {copied ? "Copied" : "Copy log (JSON)"}
        </button>
      </div>

      {groups.length === 0 ? (
        <section className={styles.empty}>
          <p>No activity yet.</p>
          <p className={styles.emptyHint}>
            Sign in, check in, breathe, or finish a session and it will show here.
          </p>
          <Link to="/home" className={styles.emptyLink}>
            Go to home
          </Link>
        </section>
      ) : (
        <div className={styles.timeline}>
          {groups.map((day) => (
            <section key={day.dateKey} className={styles.dayGroup}>
              <h2 className={styles.dayLabel}>{day.label}</h2>
              <ol className={styles.list}>
                {day.events.map((event) => (
                  <li key={event.id} className={styles.item}>
                    <span
                      className={`${styles.dot} ${styles[`dot_${event.category}`]}`}
                      aria-hidden
                    />
                    <div className={styles.itemBody}>
                      <div className={styles.itemTop}>
                        <span className={styles.time}>
                          {formatAuditTime(event.timestamp)}
                        </span>
                        <span className={styles.badge}>
                          {CATEGORY_LABELS[event.category]}
                        </span>
                        {event.pointsDelta && event.pointsDelta > 0 ? (
                          <span className={styles.points}>+{event.pointsDelta}</span>
                        ) : null}
                      </div>
                      <p className={styles.summary}>{event.summary}</p>
                      {event.detail ? (
                        <p className={styles.detail}>{event.detail}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
