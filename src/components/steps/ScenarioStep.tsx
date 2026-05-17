import { useState } from "react";
import type { ScenarioStepData } from "../../content/types";
import styles from "./Steps.module.css";

type Props = {
  step: ScenarioStepData;
  onContinue: () => void;
};

export default function ScenarioStep({ step, onContinue }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = step.choices.find((c) => c.id === selectedId);

  return (
    <div className={styles.step}>
      <p className={styles.prompt}>{step.setup}</p>
      <div className={styles.choiceList}>
        {step.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={`${styles.choice} ${selectedId === choice.id ? styles.choiceActive : ""}`}
            onClick={() => setSelectedId(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {selected ? (
        <p className={styles.feedback}>{selected.response}</p>
      ) : null}
      <button
        type="button"
        className={styles.primary}
        onClick={onContinue}
        disabled={!selectedId}
      >
        Continue
      </button>
    </div>
  );
}
