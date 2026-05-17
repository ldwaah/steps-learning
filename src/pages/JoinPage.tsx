import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiLogin } from "../lib/api/client";
import { isApiMode } from "../lib/api/config";
import { clearApiStaff, setApiUser } from "../lib/api/session";
import { hydrateStudentState } from "../lib/api/student";
import { refreshAuditFromServer } from "../lib/audit";
import {
  fetchSchoolByInvite,
  registerPupil,
  type SchoolInviteInfo,
} from "../lib/registration";
import { TEAM_OPTIONS, type TeamColour } from "../lib/teams";
import styles from "./RegisterPage.module.css";

type Tab = "register" | "signin";

export default function JoinPage() {
  const { token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTab = searchParams.get("tab") === "signin" ? "signin" : "register";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [school, setSchool] = useState<SchoolInviteInfo | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token || !isApiMode()) return;
    void fetchSchoolByInvite(token)
      .then(setSchool)
      .catch(() => setLoadError("This school link is not valid."));
  }, [token]);

  if (!isApiMode()) {
    return (
      <OfflineMessage />
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Invalid link</h1>
        <p className={styles.lead}>{loadError}</p>
        <p className={styles.footer}>
          <Link to="/register">Register</Link>
        </p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className={styles.page}>
        <p className={styles.lead}>Loading…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{school.name}</h1>
      <p className={styles.lead}>
        {school.city}, {school.postcode}
      </p>
      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === "register" ? styles.tabActive : styles.tab}
          onClick={() => setTab("register")}
        >
          Create account
        </button>
        <button
          type="button"
          className={tab === "signin" ? styles.tabActive : styles.tab}
          onClick={() => setTab("signin")}
        >
          Sign in
        </button>
      </div>
      {tab === "register" ? (
        <PupilRegisterForm token={token} school={school} onDone={() => navigate(`/?school=${school.slug}`)} />
      ) : (
        <PupilSignInForm schoolSlug={school.slug} onSuccess={() => navigate("/home")} />
      )}
    </div>
  );
}

function OfflineMessage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>School link</h1>
      <p className={styles.lead}>Pupil links work in online mode only.</p>
      <p className={styles.footer}>
        <Link to="/">Back</Link>
      </p>
    </div>
  );
}

function PupilRegisterForm({
  token,
  school,
  onDone,
}: {
  token: string;
  school: SchoolInviteInfo;
  onDone: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [teamColour, setTeamColour] = useState<TeamColour>("RED");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ username: string; message: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (pin.length < 4) {
      setError("PIN needs at least 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }
    try {
      const result = await registerPupil({
        inviteToken: token,
        firstName: firstName.trim(),
        teamColour,
        pin,
      });
      setDone({ username: result.username, message: result.message });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    }
  }

  if (done) {
    return (
      <div className={styles.card}>
        <p>{done.message}</p>
        <p className={styles.usernameBox}>
          Your username: <strong>{done.username}</strong>
        </p>
        <p className={styles.hint}>School code: {school.slug}</p>
        <button type="button" className={styles.submit} onClick={onDone}>
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <label htmlFor="name">Your name</label>
      <input
        id="name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
      />
      <span className={styles.fieldLabel}>Team colour</span>
      <div className={styles.teamRow} role="radiogroup" aria-label="Team colour">
        {TEAM_OPTIONS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={teamColour === t.id}
            className={`${styles.teamBtn} ${styles[`team${t.id}`]} ${teamColour === t.id ? styles.teamActive : ""}`}
            onClick={() => setTeamColour(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <label htmlFor="pin">Choose a PIN (4+ digits)</label>
      <input
        id="pin"
        type="password"
        inputMode="numeric"
        maxLength={6}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
      />
      <label htmlFor="pin2">Confirm PIN</label>
      <input
        id="pin2"
        type="password"
        inputMode="numeric"
        maxLength={6}
        value={confirmPin}
        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
      />
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.submit}>
        Create account
      </button>
    </form>
  );
}

function PupilSignInForm({
  schoolSlug,
  onSuccess,
}: {
  schoolSlug: string;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const result = await apiLogin(schoolSlug, username.trim(), pin);
      if (result.user.role !== "STUDENT") {
        setError("Use teacher sign in for staff accounts.");
        return;
      }
      clearApiStaff();
      setApiUser(result.user);
      await hydrateStudentState();
      await refreshAuditFromServer(result.user.id);
      onSuccess();
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      if (code === "PENDING_APPROVAL") {
        setError("Your account is waiting for teacher approval.");
        return;
      }
      if (code === "REJECTED") {
        setError("This account was not approved. Speak to your teacher.");
        return;
      }
      setError("Wrong username or PIN.");
    }
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <p className={styles.hintInline}>School code: {schoolSlug}</p>
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
  );
}
