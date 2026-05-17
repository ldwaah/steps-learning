import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BreathingExercise from "../components/BreathingExercise";
import PointsCelebration from "../components/PointsCelebration";
import { REGULATE_POINTS } from "../content";
import { hasRegulatedToday, markRegulatedToday } from "../lib/regulate";
import { getCurrentUser } from "../lib/authSession";
import { getUserById } from "../lib/storage";
import styles from "./ToolPage.module.css";

export default function RegulatePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [done, setDone] = useState(false);
  const [celebration, setCelebration] = useState<{
    startPoints: number;
    endPoints: number;
  } | null>(null);

  if (!user) {
    navigate("/");
    return null;
  }

  const userId = user.id;

  function handleComplete() {
    setDone(true);
    if (hasRegulatedToday(userId) || celebration) return;
    const startPoints = user!.points;
    const { awarded } = markRegulatedToday(userId);
    if (!awarded) return;
    const updated = getUserById(userId);
    setCelebration({
      startPoints,
      endPoints: updated?.points ?? startPoints + REGULATE_POINTS,
    });
  }

  if (celebration) {
    return (
      <PointsCelebration
        startPoints={celebration.startPoints}
        endPoints={celebration.endPoints}
        pointsEarned={REGULATE_POINTS}
        headline="Breathing done"
        subline="Nice work slowing down"
        onContinue={() => navigate("/home")}
      />
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/home" className={styles.back}>← Home</Link>
      <h1>Breathing</h1>
      <div className={styles.card}>
        <BreathingExercise onComplete={handleComplete} />
        {done && hasRegulatedToday(userId) && !celebration ? (
          <p className={styles.pointsHint}>Done for today</p>
        ) : null}
        <Link to="/home" className={styles.secondaryLink}>Home</Link>
      </div>
    </div>
  );
}
