import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiLogin } from "../lib/api/client";
import { isApiMode } from "../lib/api/config";
import { clearApiUser, setApiStaff, isStaffRole } from "../lib/api/session";
import { setStaffSession } from "../lib/storage";
import styles from "./LoginPage.module.css";

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const apiMode = isApiMode();
  const [schoolSlug, setSchoolSlug] = useState(apiMode ? "riverside-ap" : "");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (apiMode) {
      if (!schoolSlug.trim()) {
        setError("Enter your school code.");
        return;
      }
      try {
        const result = await apiLogin(schoolSlug.trim(), username.trim(), pin);
        if (!isStaffRole(result.user.role)) {
          setError("This login is for staff only.");
          return;
        }
        clearApiUser();
        setApiStaff(result.user);
        navigate("/teacher");
      } catch {
        setError("Wrong school code, username, or PIN.");
      }
      return;
    }

    if (username.trim().toLowerCase() === "teacher" && pin === "0000") {
      setStaffSession(true);
      navigate("/teacher");
      return;
    }
    setError("Local staff: username teacher, PIN 0000");
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Teacher sign in</h1>
      <form className={styles.card} onSubmit={handleSubmit}>
        {apiMode ? (
          <>
            <label htmlFor="school">School code</label>
            <input
              id="school"
              value={schoolSlug}
              onChange={(e) => setSchoolSlug(e.target.value)}
              autoCapitalize="none"
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
      <p className={styles.demo}>
        <Link to="/">Student sign in</Link>
        {apiMode ? (
          <>
            <br />
            Demo: riverside-ap · lead.ap / 0000
          </>
        ) : null}
      </p>
    </div>
  );
}
