import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../lib/api/client";
import { isApiMode } from "../lib/api/config";
import { hydrateStudentState } from "../lib/api/student";
import { setApiUser } from "../lib/api/session";
import { logAudit, refreshAuditFromServer } from "../lib/audit";
import { findUser, setSession } from "../lib/storage";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const apiMode = isApiMode();
  const [schoolSlug, setSchoolSlug] = useState(apiMode ? "riverside-ap" : "");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (apiMode && !schoolSlug.trim()) {
      setError("Enter your school code.");
      return;
    }
    if (!username.trim()) {
      setError("Enter username.");
      return;
    }
    if (pin.length < 4) {
      setError("PIN needs 4+ digits.");
      return;
    }

    if (apiMode) {
      try {
        const result = await apiLogin(schoolSlug.trim(), username.trim(), pin);
        if (result.user.role !== "STUDENT") {
          setError("Staff accounts use the trust dashboard (coming next).");
          return;
        }
        setApiUser(result.user);
        await hydrateStudentState();
        await refreshAuditFromServer(result.user.id);
        navigate("/home");
      } catch {
        setError("Wrong school code, username, or PIN.");
      }
      return;
    }

    const user = findUser(username.trim(), pin);
    if (!user) {
      logAudit({
        userId: "_guest",
        type: "auth.login_failed",
        summary: "Sign-in failed",
        meta: { username: username.trim().toLowerCase() },
      });
      setError("Wrong username or PIN.");
      return;
    }
    setSession(user.id);
    logAudit({
      userId: user.id,
      type: "auth.login",
      summary: `Signed in as ${user.firstName}`,
      meta: { username: user.username },
    });
    navigate("/home");
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Steps</h1>
      <form className={styles.card} onSubmit={handleSubmit}>
        {apiMode ? (
          <>
            <label htmlFor="school">School code</label>
            <input
              id="school"
              value={schoolSlug}
              onChange={(e) => setSchoolSlug(e.target.value)}
              autoCapitalize="none"
              placeholder="e.g. riverside-ap"
            />
          </>
        ) : null}
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
        />
        <label htmlFor="pin">PIN</label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <button type="submit" className={styles.submit}>
          Sign in
        </button>
      </form>
      <details className={styles.demo}>
        <summary>{apiMode ? "Trust pilot logins" : "Demo logins"}</summary>
        {apiMode ? (
          <p>
            riverside-ap · alex / 4821
            <br />
            oakfield · sam / 4821
          </p>
        ) : (
          <p>alex / 4821 · jordan / 7392</p>
        )}
      </details>
    </div>
  );
}
