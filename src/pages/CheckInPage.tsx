import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PointsCelebration from "../components/PointsCelebration";
import { CHECK_IN_POINTS } from "../content";
import { MOOD_OPTIONS, type MoodId, hasCheckedInToday, submitCheckIn } from "../lib/checkin";
import { getCurrentUser } from "../lib/authSession";
import { getUserById } from "../lib/storage";
import styles from "./ToolPage.module.css";

export default function CheckInPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [mood, setMood] = useState<MoodId | null>(null);
  const [error, setError] = useState("");
  const [celebration, setCelebration] = useState<{
    startPoints: number;
    endPoints: number;
  } | null>(null);

  if (!user) {
    navigate("/");
    return null;
  }

  if (hasCheckedInToday(user.id)) {
    return (
      <div className={styles.page}>
        <Link to="/home" className={styles.back}>← Home</Link>
        <p>Done for today.</p>
      </div>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!mood) {
      setError("Pick one.");
      return;
    }
    const startPoints = user!.points;
    const result = submitCheckIn(user!.id, mood);
    if (!result.ok) return;
    const updated = getUserById(user!.id);
    setCelebration({
      startPoints,
      endPoints: updated?.points ?? startPoints + CHECK_IN_POINTS,
    });
  }

  if (celebration) {
    const moodLabel = MOOD_OPTIONS.find((m) => m.id === mood)?.label;
    return (
      <PointsCelebration
        startPoints={celebration.startPoints}
        endPoints={celebration.endPoints}
        pointsEarned={CHECK_IN_POINTS}
        headline="Check-in saved"
        subline={moodLabel ? `Feeling: ${moodLabel}` : undefined}
        onContinue={() => navigate("/home")}
      />
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/home" className={styles.back}>← Home</Link>
      <h1>Check-in</h1>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.chipRow}>
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`${styles.chip} ${mood === opt.id ? styles.chipActive : ""}`}
              onClick={() => {
                setMood(opt.id);
                setError("");
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <p className={styles.pointsHint}>+{CHECK_IN_POINTS} pts</p>
        <button type="submit" className={styles.primaryBtn}>Save</button>
      </form>
    </div>
  );
}
