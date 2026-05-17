import { useState } from "react";
import type { ReflectStepData } from "../../content/types";
import styles from "./Steps.module.css";

type Props = {
  step: ReflectStepData;
  onContinue: () => void;
};

export default function ReflectStep({ step, onContinue }: Props) {
  const [chip, setChip] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const noteOk = note.trim().length >= step.minChars;
  const canContinue = chip !== null && noteOk;

  return (
    <div className={styles.step}>
      <p className={styles.prompt}>{step.prompt}</p>
      <div className={styles.chipRow}>
        {step.chips.map((label) => (
          <button
            key={label}
            type="button"
            className={`${styles.chip} ${chip === label ? styles.chipActive : ""}`}
            onClick={() => setChip(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <label className={styles.noteLabel} htmlFor="reflect-note">
        {step.minChars > 0
          ? `A few words (${step.minChars}+ characters)`
          : "Anything else? (optional)"}
      </label>
      <textarea
        id="reflect-note"
        className={styles.textarea}
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="A few words, if you want."
      />
      <button
        type="button"
        className={styles.primary}
        onClick={onContinue}
        disabled={!canContinue}
      >
        Continue
      </button>
    </div>
  );
}
