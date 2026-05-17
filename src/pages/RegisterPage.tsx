import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAccount } from "../lib/accounts";
import { isApiMode } from "../lib/api/config";
import { TEAM_OPTIONS, type TeamColour } from "../lib/teams";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const apiMode = isApiMode();
  const [schoolSlug, setSchoolSlug] = useState(apiMode ? "riverside-ap" : "local");
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
      const result = await registerAccount({
        schoolSlug: apiMode ? schoolSlug.trim() : undefined,
        firstName: firstName.trim(),
        teamColour,
        pin,
      });
      setDone(result);
    } catch {
      setError("Could not create account. Check your school code and try again.");
    }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Almost there</h1>
        <DoneCard username={done.username} message={done.message} onBack={() => navigate("/")} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Create account</h1>
      <p className={styles.lead}>Pick your team. Your teacher approves new accounts.</p>
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
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="name"
          placeholder="First name"
        />
        <span className={styles.fieldLabel}>Team colour</span>
        <TeamPicker teamColour={teamColour} setTeamColour={setTeamColour} />
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
      <p className={styles.footer}>
        <Link to="/">Back to sign in</Link>
      </p>
    </div>
  );
}

function DoneCard({
  username,
  message,
  onBack,
}: {
  username: string;
  message: string;
  onBack: () => void;
}) {
  return (
    <div className={styles.card}>
      <p>{message}</p>
      <p className={styles.usernameBox}>
        Your username: <strong>{username}</strong>
      </p>
      <p className={styles.hint}>Save this. You need it to sign in after approval.</p>
      <button type="button" className={styles.submit} onClick={onBack}>
        Back to sign in
      </button>
    </div>
  );
}

function TeamPicker({
  teamColour,
  setTeamColour,
}: {
  teamColour: TeamColour;
  setTeamColour: (c: TeamColour) => void;
}) {
  return (
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
  );
}
