import { useState } from "react";
import type { QuizStepData } from "../../content/types";
import styles from "./Steps.module.css";

type Props = {
  step: QuizStepData;
  onContinue: () => void;
  onPassed?: (score: number, total: number) => void;
};

export default function QuizStep({ step, onContinue, onPassed }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = step.questions.filter(
    (q) => answers[q.id] === q.correctId,
  ).length;
  const passed = score >= step.passCount;

  function selectAnswer(questionId: string, optionId: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleCheck() {
    setSubmitted(true);
  }

  const allAnswered = step.questions.every((q) => answers[q.id]);

  return (
    <div className={styles.step}>
      <p className={styles.prompt}>
        Quick check. Pass to earn points. More time on the session means more points.
      </p>
      {step.questions.map((q, index) => {
        const chosen = answers[q.id];
        const isCorrect = chosen === q.correctId;
        return (
          <fieldset key={q.id} className={styles.quizItem}>
            <legend>
              {index + 1}. {q.question}
            </legend>
            <div className={styles.choiceList}>
              {q.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.choice} ${chosen === opt.id ? styles.choiceActive : ""} ${
                    submitted && opt.id === q.correctId
                      ? styles.choiceCorrect
                      : ""
                  } ${
                    submitted && chosen === opt.id && !isCorrect
                      ? styles.choiceWrong
                      : ""
                  }`}
                  onClick={() => selectAnswer(q.id, opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {submitted && chosen && !isCorrect ? (
              <p className={styles.hint}>Try again.</p>
            ) : null}
          </fieldset>
        );
      })}

      {!submitted ? (
        <button
          type="button"
          className={styles.primary}
          onClick={handleCheck}
          disabled={!allAnswered}
        >
          Check answers
        </button>
      ) : passed ? (
        <button
          type="button"
          className={styles.primary}
          onClick={() => {
            onPassed?.(score, step.questions.length);
            onContinue();
          }}
        >
          Finish session
        </button>
      ) : (
        <button
          type="button"
          className={styles.primary}
          onClick={() => {
            setSubmitted(false);
            setAnswers({});
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
