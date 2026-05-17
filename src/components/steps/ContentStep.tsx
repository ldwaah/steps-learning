import { useEffect, useState } from "react";
import type { ContentStepData } from "../../content/types";
import styles from "./Steps.module.css";

const READ_SECONDS = 6;

type Props = {
  step: ContentStepData;
  onContinue: () => void;
};

export default function ContentStep({ step, onContinue }: Props) {
  const [readyIn, setReadyIn] = useState(READ_SECONDS);

  useEffect(() => {
    setReadyIn(READ_SECONDS);
    const start = Date.now();
    const tick = window.setInterval(() => {
      const left = READ_SECONDS - Math.floor((Date.now() - start) / 1000);
      setReadyIn(Math.max(0, left));
    }, 250);
    return () => window.clearInterval(tick);
  }, [step.body, step.title]);

  const canContinue = readyIn === 0;

  return (
    <div className={styles.step}>
      {step.why ? <p className={styles.why}>{step.why}</p> : null}
      {step.title ? <h2 className={styles.stepTitle}>{step.title}</h2> : null}
      {step.body.split("\n\n").map((paragraph) => (
        <p key={paragraph.slice(0, 32)} className={styles.body}>
          {paragraph}
        </p>
      ))}
      <button
        type="button"
        className={styles.primary}
        onClick={onContinue}
        disabled={!canContinue}
      >
        {canContinue ? "Continue" : `Read (${readyIn}s)`}
      </button>
    </div>
  );
}
