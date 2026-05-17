import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getLevelForPoints,
  getNextLevel,
  pointsToNextLevel,
  type LevelInfo,
} from "../lib/levels";
import styles from "./PointsCelebration.module.css";

export type PointsCelebrationProps = {
  startPoints: number;
  endPoints: number;
  pointsEarned: number;
  headline: string;
  subline?: string;
  detail?: string;
  onContinue: () => void;
};

type Phase = "intro" | "points" | "level" | "ready";

function levelProgress(points: number, level: LevelInfo): number {
  const next = getNextLevel(points);
  if (!next) return 100;
  const span = next.minPoints - level.minPoints;
  if (span <= 0) return 100;
  return Math.min(100, ((points - level.minPoints) / span) * 100);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export default function PointsCelebration({
  startPoints,
  endPoints,
  pointsEarned,
  headline,
  subline,
  detail,
  onContinue,
}: PointsCelebrationProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [showContent, setShowContent] = useState(false);
  const [displayPoints, setDisplayPoints] = useState(startPoints);
  const [showEarned, setShowEarned] = useState(false);
  const rafRef = useRef<number | null>(null);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const endLevel = getLevelForPoints(endPoints);
  const startLevel = getLevelForPoints(startPoints);
  const levelUp = startLevel.id !== endLevel.id;
  const nextLevel = getNextLevel(endPoints);
  const toNext = pointsToNextLevel(endPoints);
  const ringProgress = levelProgress(endPoints, endLevel);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => setShowContent(true), 380);
    return () => {
      document.body.style.overflow = "";
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const fast = reducedMotion.current;
    const introMs = fast ? 0 : 500;
    const pointsMs = fast ? 0 : 1200;
    const levelMs = fast ? 0 : 700;

    const t1 = window.setTimeout(() => setPhase("points"), introMs);
    const t2 = window.setTimeout(() => {
      if (fast) {
        setDisplayPoints(endPoints);
        setShowEarned(true);
        setPhase("level");
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / pointsMs);
        const eased = easeOutCubic(t);
        setDisplayPoints(Math.round(startPoints + (endPoints - startPoints) * eased));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setShowEarned(true);
          setPhase("level");
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, introMs + (fast ? 0 : 200));

    const t3 = window.setTimeout(
      () => setPhase("ready"),
      introMs + pointsMs + levelMs + (fast ? 0 : 400),
    );

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startPoints, endPoints]);

  const content = (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="celebration-title">
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <p className={`${styles.kicker} ${showContent ? styles.visible : ""}`}>Done</p>
        <h1
          id="celebration-title"
          className={`${styles.headline} ${showContent ? styles.visible : ""}`}
        >
          {headline}
        </h1>
        {subline ? (
          <p className={`${styles.subline} ${showContent ? styles.visible : ""}`}>{subline}</p>
        ) : null}

        <div
          className={`${styles.pointsBlock} ${phase === "points" || phase === "level" || phase === "ready" ? styles.visible : ""}`}
        >
          <p className={styles.pointsLabel}>Your score</p>
          <p className={styles.pointsValue} aria-live="polite">
            {displayPoints}
          </p>
          <p
            className={`${styles.earned} ${showEarned ? styles.earnedPop : ""}`}
            aria-hidden={!showEarned}
          >
            +{pointsEarned}
          </p>
          {detail && showEarned ? (
            <p className={styles.pointsDetail}>{detail}</p>
          ) : null}
        </div>

        <div
          className={`${styles.levelBlock} ${phase === "level" || phase === "ready" ? styles.levelReveal : ""} ${levelUp ? styles.levelUp : ""}`}
        >
          {levelUp ? <p className={styles.levelUpTag}>New stage</p> : null}
          <div className={styles.levelRingWrap}>
            <svg className={styles.levelRing} viewBox="0 0 120 120" aria-hidden>
              <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
              <circle
                className={styles.ringFill}
                cx="60"
                cy="60"
                r="52"
                style={{
                  strokeDasharray: `${2 * Math.PI * 52}`,
                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - ringProgress / 100)}`,
                }}
              />
            </svg>
            <div className={styles.levelCore}>
              <span className={styles.levelShort}>{endLevel.shortLabel}</span>
            </div>
          </div>
          <p className={styles.levelName}>{endLevel.label}</p>
          <p className={styles.levelDesc}>{endLevel.studentDescription}</p>
          {nextLevel && toNext !== null ? (
            <p className={styles.levelNext}>{toNext} pts to {nextLevel.label}</p>
          ) : (
            <p className={styles.levelNext}>Top stage. Keep going.</p>
          )}
        </div>

        <button
          type="button"
          className={`${styles.continue} ${phase === "ready" ? styles.continueReady : ""}`}
          onClick={onContinue}
          disabled={
            !reducedMotion.current && phase !== "level" && phase !== "ready"
          }
        >
          Continue
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
