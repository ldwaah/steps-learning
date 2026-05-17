import { useState } from "react";
import { Link } from "react-router-dom";
import {
  SESSION_BASE_POINTS,
  SESSION_TIME_BONUS_MAX,
} from "../content";
import {
  OFSTED_ALIGNMENT,
  TEACHERS_STANDARDS,
} from "../content/qualityFramework";
import {
  exportAllAuditJson,
  formatAuditTime,
  getAllAuditEventsForStaff,
  GUEST_USER_ID,
} from "../lib/audit";
import {
  formatEvidenceLine,
  getSessionCompletionsForStaff,
} from "../lib/sessionEvidence";
import { resetDemoParticipants } from "../lib/resetDemo";
import { DEFAULT_USERS, getUsers } from "../lib/storage";
import styles from "./StaffQualityPage.module.css";

export default function StaffQualityPage() {
  const [copied, setCopied] = useState(false);
  const [resetTick, setResetTick] = useState(0);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  void resetTick;
  const events = getAllAuditEventsForStaff(80);
  const sessions = getSessionCompletionsForStaff(25);
  const users = getUsers();
  const nameById = new Map(users.map((u) => [u.id, u.firstName]));

  function displayName(userId: string): string {
    if (userId === GUEST_USER_ID) return "Failed sign-in";
    return nameById.get(userId) ?? userId;
  }

  function handleResetDemo() {
    const names = DEFAULT_USERS.map((u) => u.username).join(" & ");
    if (
      !window.confirm(
        `Reset demo accounts (${names}) to starting scores and clear their progress, check-ins, and logs on this device?`,
      )
    ) {
      return;
    }
    const result = resetDemoParticipants();
    setResetMsg(
      `Done. ${result.users.map((u) => `${u.username}: ${u.points} pts (${u.level})`).join(" · ")}`,
    );
    setResetTick((t) => t + 1);
  }

  async function handleExportAll() {
    try {
      await navigator.clipboard.writeText(exportAllAuditJson());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/menu" className={styles.back}>
        ← Menu
      </Link>
      <h1>Quality alignment (staff)</h1>
      <p className={styles.lead}>
        How Steps is designed against Ofsted EIF themes and the Teachers&apos;
        Standards (England). Not shown to students.
      </p>

      <section className={styles.card}>
        <h2>Ofsted Education Inspection Framework</h2>
        <p>{OFSTED_ALIGNMENT.intent}</p>
        <p>{OFSTED_ALIGNMENT.implementation}</p>
        <p>{OFSTED_ALIGNMENT.impact}</p>
        <h3>Relevant EIF areas</h3>
        <ul>
          {OFSTED_ALIGNMENT.eifAreas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Teachers&apos; Standards</h2>
        <ul className={styles.stdList}>
          {TEACHERS_STANDARDS.map((s) => (
            <li key={s.standard}>
              <strong>
                Standard {s.standard}: {s.title}
              </strong>
              <p>{s.howStepsSupports}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Demo accounts (staff)</h2>
        <p className={styles.auditNote}>
          alex and jordan go back to starting scores. Pathway progress, check-ins,
          breathing, and their log entries on this browser are cleared.
        </p>
        <button type="button" className={styles.resetBtn} onClick={handleResetDemo}>
          Reset demo scores
        </button>
        {resetMsg ? <p className={styles.resetOk}>{resetMsg}</p> : null}
      </section>

      <section className={styles.card}>
        <h2>Session evidence (staff)</h2>
        <p className={styles.auditNote}>
          {SESSION_BASE_POINTS} pts for a passed session, plus up to {SESSION_TIME_BONUS_MAX}{" "}
          more for time (full bonus around 8 min). No points if the quick check is not
          passed.
        </p>
        {sessions.length === 0 ? (
          <p className={styles.auditEmpty}>No completed sessions on this device yet.</p>
        ) : (
          <ol className={styles.auditList}>
            {sessions.map((s) => (
              <li key={`${s.userId}-${s.completedAt}`} className={styles.auditItem}>
                <span className={styles.auditMeta}>
                  {new Date(s.completedAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {displayName(s.userId)}
                </span>
                <span className={styles.auditSummary}>
                  {s.blockTitle} ({s.topicId})
                </span>
                <span className={styles.auditDetail}>{formatEvidenceLine(s)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className={styles.card}>
        <h2>Device activity log (staff)</h2>
        <p className={styles.auditNote}>
          Append-only record stored on this browser. Copy for records or
          safeguarding notes. Not tamper-proof without a server.
        </p>
        <button type="button" className={styles.exportBtn} onClick={handleExportAll}>
          {copied ? "Copied all" : "Copy full log (JSON)"}
        </button>
        {events.length === 0 ? (
          <p className={styles.auditEmpty}>No events yet on this device.</p>
        ) : (
          <ol className={styles.auditList}>
            {events.map((e) => (
              <li key={e.id} className={styles.auditItem}>
                <span className={styles.auditMeta}>
                  {formatAuditTime(e.timestamp)} · {displayName(e.userId)}
                </span>
                <span className={styles.auditSummary}>{e.summary}</span>
                {e.detail ? (
                  <span className={styles.auditDetail}>{e.detail}</span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
