import { useEffect, useRef, useState } from "react";
import styles from "./BreathingExercise.module.css";

type Phase = "in" | "hold" | "out";

const PHASE_SECONDS: Record<Phase, number> = {
  in: 4,
  hold: 4,
  out: 4,
};

const CYCLES = 4;

const PHASE_LABEL: Record<Phase, string> = {
  in: "Breathe in",
  hold: "Hold",
  out: "Breathe out",
};

type Props = {
  onComplete: () => void;
};

export default function BreathingExercise({ onComplete }: Props) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [phase, setPhase] = useState<Phase>("in");
  const [secondsLeft, setSecondsLeft] = useState(PHASE_SECONDS.in);
  const [cycle, setCycle] = useState(1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running || done) return;

    if (secondsLeft > 0) {
      const timer = window.setTimeout(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
      return () => window.clearTimeout(timer);
    }

    const order: Phase[] = ["in", "hold", "out"];
    const index = order.indexOf(phase);
    const next = order[index + 1];

    if (next) {
      setPhase(next);
      setSecondsLeft(PHASE_SECONDS[next]);
      return;
    }

    if (cycle >= CYCLES) {
      setDone(true);
      setRunning(false);
      onCompleteRef.current();
      return;
    }

    setCycle((c) => c + 1);
    setPhase("in");
    setSecondsLeft(PHASE_SECONDS.in);
  }, [running, done, secondsLeft, phase, cycle]);

  if (done) {
    return (
      <div className={styles.wrap}>
        <p className={styles.doneText}>Nice. Take a moment before you head back.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.circle} ${styles[phase]} ${running ? styles.circleActive : ""}`}
        aria-hidden
      />
      <p className={styles.phase}>
        {running ? PHASE_LABEL[phase] : "Ready when you are"}
      </p>
      <p className={styles.timer}>{running ? secondsLeft : ", "}</p>
      <p className={styles.cycle}>
        Round {Math.min(cycle, CYCLES)} of {CYCLES}
      </p>
      {!running ? (
        <button
          type="button"
          className={styles.start}
          onClick={() => {
            setRunning(true);
            setPhase("in");
            setSecondsLeft(PHASE_SECONDS.in);
            setCycle(1);
          }}
        >
          Start
        </button>
      ) : null}
    </div>
  );
}
