import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { isApiMode } from "../lib/api/config";
import { registerSchool } from "../lib/registration";
import styles from "./RegisterPage.module.css";

export default function RegisterSchoolPage() {
  const apiMode = isApiMode();
  const [schoolName, setSchoolName] = useState("");
  const [schoolSlug, setSchoolSlug] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{
    inviteUrl: string;
    schoolSlug: string;
    adminUsername: string;
    schoolName: string;
    message: string;
  } | null>(null);

  if (!apiMode) {
    return <Navigate to="/register" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!schoolName.trim() || !schoolSlug.trim() || !city.trim() || !postcode.trim()) {
      setError("Complete all school fields.");
      return;
    }
    if (!adminFirstName.trim()) {
      setError("Enter the lead contact name.");
      return;
    }
    if (adminPin.length < 4) {
      setError("Admin PIN needs at least 4 digits.");
      return;
    }
    if (adminPin !== confirmPin) {
      setError("PINs do not match.");
      return;
    }

    try {
      const result = await registerSchool({
        schoolName: schoolName.trim(),
        schoolSlug: schoolSlug.trim(),
        city: city.trim(),
        postcode: postcode.trim(),
        adminFirstName: adminFirstName.trim(),
        adminPin,
      });
      setDone({
        inviteUrl: result.inviteUrl,
        schoolSlug: result.schoolSlug,
        adminUsername: result.adminUsername,
        schoolName: result.schoolName,
        message: result.message,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register school.");
    }
  }

  if (done) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>School registered</h1>
        <div className={styles.card}>
          <p>{done.message}</p>
          <p className={styles.usernameBox}>
            School code: <strong>{done.schoolSlug}</strong>
          </p>
          <p className={styles.usernameBox}>
            Teacher login: <strong>{done.adminUsername}</strong> + your PIN
          </p>
          <p className={styles.fieldLabel}>Pupil link (share this)</p>
          <p className={styles.linkBox}>{done.inviteUrl}</p>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigator.clipboard.writeText(done.inviteUrl)}
          >
            Copy pupil link
          </button>
          <p className={styles.hint}>
            Students open this link to create accounts and sign in. Approve them on the teacher
            dashboard.
          </p>
          <Link to="/staff-login" className={styles.footerLink}>
            Go to teacher sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Register your school</h1>
      <p className={styles.lead}>We generate a pupil link when you are done.</p>
      <form className={styles.card} onSubmit={handleSubmit}>
        <label htmlFor="schoolName">School name</label>
        <input
          id="schoolName"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          placeholder="e.g. Riverside AP School"
        />
        <label htmlFor="schoolSlug">School code (for sign-in)</label>
        <input
          id="schoolSlug"
          value={schoolSlug}
          onChange={(e) => setSchoolSlug(e.target.value)}
          autoCapitalize="none"
          placeholder="e.g. riverside-ap"
        />
        <p className={styles.hintInline}>Lowercase letters, numbers, and hyphens only.</p>
        <label htmlFor="city">City</label>
        <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
        <label htmlFor="postcode">Postcode</label>
        <input
          id="postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          autoCapitalize="characters"
        />
        <hr className={styles.divider} />
        <label htmlFor="adminName">Your name (school lead)</label>
        <input
          id="adminName"
          value={adminFirstName}
          onChange={(e) => setAdminFirstName(e.target.value)}
        />
        <label htmlFor="adminPin">Choose admin PIN (4+ digits)</label>
        <input
          id="adminPin"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={adminPin}
          onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ""))}
        />
        <label htmlFor="adminPin2">Confirm admin PIN</label>
        <input
          id="adminPin2"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
        />
        {error ? <p className={styles.error}>{error}</p> : null}
        <button type="submit" className={styles.submit}>
          Register school
        </button>
      </form>
      <p className={styles.footer}>
        <Link to="/register">Back</Link>
      </p>
    </div>
  );
}
