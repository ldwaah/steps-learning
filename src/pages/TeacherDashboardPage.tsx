import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveStudent,
  getPendingStudents,
  rejectStudent,
  type PendingStudent,
} from "../lib/accounts";
import {
  approveStudentApi,
  fetchPendingStudents,
  rejectStudentApi,
} from "../lib/api/staff";
import { isApiMode } from "../lib/api/config";
import { getCurrentStaff, signOut } from "../lib/authSession";
import { teamLabel } from "../lib/teams";
import styles from "./TeacherDashboardPage.module.css";

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const staff = getCurrentStaff();
  const [pending, setPending] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    if (isApiMode()) {
      setPending(await fetchPendingStudents());
    } else {
      setPending(getPendingStudents());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!staff) {
      navigate("/staff-login");
      return;
    }
    void load();
  }, [staff, load, navigate]);

  async function handleApprove(id: string) {
    if (isApiMode()) await approveStudentApi(id);
    else approveStudent(id);
    setMessage("Student approved.");
    await load();
  }

  async function handleReject(id: string) {
    if (isApiMode()) await rejectStudentApi(id);
    else rejectStudent(id);
    setMessage("Account declined.");
    await load();
  }

  if (!staff) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Teacher dashboard</h1>
        <p className={styles.sub}>Approve new student accounts for your school.</p>
        <button
          type="button"
          className={styles.signOut}
          onClick={() => {
            signOut();
            navigate("/staff-login");
          }}
        >
          Sign out
        </button>
      </header>

      {message ? <p className={styles.flash}>{message}</p> : null}

      {loading ? (
        <p className={styles.muted}>Loading…</p>
      ) : pending.length === 0 ? (
        <section className={styles.card}>
          <p className={styles.muted}>No accounts waiting for approval.</p>
        </section>
      ) : (
        <ul className={styles.list}>
          {pending.map((p) => (
            <li key={p.id} className={styles.row}>
              <div>
                <strong>{p.firstName}</strong>
                <span className={styles.meta}>
                  @{p.username} · {teamLabel(p.teamColour)}
                </span>
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.approve} onClick={() => handleApprove(p.id)}>
                  Approve
                </button>
                <button type="button" className={styles.reject} onClick={() => handleReject(p.id)}>
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
