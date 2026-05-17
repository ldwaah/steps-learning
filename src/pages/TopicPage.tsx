import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContentStep from "../components/steps/ContentStep";
import QuizStep from "../components/steps/QuizStep";
import ReflectStep from "../components/steps/ReflectStep";
import ScenarioStep from "../components/steps/ScenarioStep";
import PointsCelebration from "../components/PointsCelebration";
import { getTopic } from "../content";
import type { StepData } from "../content/types";
import { logAudit } from "../lib/audit";
import {
  completeBlock,
  getCurrentBlock,
  getTopicProgress,
  getTopicSummary,
  setStepIndex,
} from "../lib/progress";
import { blockHasQuiz, formatPointsHint } from "../lib/sessionEvidence";
import { getCurrentUser } from "../lib/authSession";
import { getUserById } from "../lib/storage";
import { isApiMode } from "../lib/api/config";

function sessionUserPoints(userId: string): number {
  if (isApiMode()) return getCurrentUser()?.points ?? 0;
  return getUserById(userId)?.points ?? 0;
}
import styles from "./TopicPage.module.css";

function StepRenderer({
  step,
  onAdvance,
  onQuizPassed,
}: {
  step: StepData;
  onAdvance: () => void;
  onQuizPassed: (score: number, total: number) => void;
}) {
  switch (step.type) {
    case "content":
      return <ContentStep step={step} onContinue={onAdvance} />;
    case "scenario":
      return <ScenarioStep step={step} onContinue={onAdvance} />;
    case "quiz":
      return (
        <QuizStep
          step={step}
          onContinue={onAdvance}
          onPassed={onQuizPassed}
        />
      );
    case "reflect":
      return <ReflectStep step={step} onContinue={onAdvance} />;
    default:
      return null;
  }
}

export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [stepIndex, setStepIndexLocal] = useState(0);
  const [celebration, setCelebration] = useState<{
    startPoints: number;
    endPoints: number;
    subline: string;
    detail?: string;
  } | null>(null);
  const [savedNoPoints, setSavedNoPoints] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const sessionRef = useRef({
    startedAt: Date.now(),
    quizPassed: false,
    quizScore: 0,
    quizTotal: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (topicId) {
      setStepIndexLocal(getTopicProgress(user.id, topicId).stepIndex);
    }
  }, [user, topicId, navigate]);

  const blockForAudit = topicId && user ? getCurrentBlock(user.id, topicId) : null;
  const topicForAudit = topicId ? getTopic(topicId) : null;

  useEffect(() => {
    if (!blockForAudit) return;
    sessionRef.current = {
      startedAt: Date.now(),
      quizPassed: false,
      quizScore: 0,
      quizTotal: 0,
    };
  }, [blockForAudit?.id]);

  useEffect(() => {
    if (!user || !topicId || !blockForAudit || !topicForAudit) return;
    const key = `steps_audit_started_${user.id}_${topicId}_${blockForAudit.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    logAudit({
      userId: user.id,
      type: "learning.session_start",
      summary: `Started session: ${blockForAudit.title}`,
      detail: topicForAudit.title,
      meta: { topicId, blockId: blockForAudit.id },
    });
  }, [user, topicId, blockForAudit?.id, topicForAudit?.title]);

  if (!user || !topicId) return null;

  const userId = user.id;
  const activeTopicId = topicId;
  const topic = getTopic(activeTopicId);
  const block = getCurrentBlock(userId, activeTopicId);
  const summary = getTopicSummary(userId, activeTopicId);

  if (!topic || !summary) {
    return (
      <div className={styles.page}>
        <p>Topic not found.</p>
        <Link to="/home">Back home</Link>
      </div>
    );
  }

  if (!block) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <Link to="/home" className={styles.back}>
            ← Home
          </Link>
          <p className={styles.kicker}>{topic.title}</p>
          <h1>
            Session {summary.blockNumber} of {summary.totalBlocks}
          </h1>
        </header>
        <div className={styles.card}>
          <p className={styles.lead}>Pathway done. Pick another.</p>
          <Link to="/home" className={styles.primaryLink}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const activeBlock = block;
  const step = activeBlock.steps[stepIndex];
  const totalSteps = activeBlock.steps.length;
  function handleQuizPassed(score: number, total: number) {
    sessionRef.current.quizPassed = true;
    sessionRef.current.quizScore = score;
    sessionRef.current.quizTotal = total;
  }

  function handleAdvance() {
    const nextIndex = stepIndex + 1;
    if (nextIndex < activeBlock.steps.length) {
      setStepIndex(userId, activeTopicId, nextIndex);
      setStepIndexLocal(nextIndex);
      return;
    }

    const startedAt = sessionRef.current.startedAt;
    const completedAt = Date.now();
    const startPoints = sessionUserPoints(userId);
    const result = completeBlock(userId, activeTopicId, {
      topicId: activeTopicId,
      blockId: activeBlock.id,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date(completedAt).toISOString(),
      durationMs: completedAt - startedAt,
      stepsTotal: totalSteps,
      quizRequired: blockHasQuiz(activeBlock),
      quizPassed: sessionRef.current.quizPassed,
      quizScore: sessionRef.current.quizScore,
      quizTotal: sessionRef.current.quizTotal,
    });

    if (result.pointsAwarded > 0) {
      const updated = isApiMode() ? getCurrentUser() : getUserById(userId);
      const detail =
        result.pointsTimeBonus > 0
          ? `+${result.pointsBase} for finishing · +${result.pointsTimeBonus} for time on task`
          : `+${result.pointsBase} for finishing`;
      setCelebration({
        startPoints,
        endPoints: updated?.points ?? startPoints + result.pointsAwarded,
        subline: activeBlock.title,
        detail,
      });
      return;
    }

    setSavedNoPoints({
      title: activeBlock.title,
      message: result.message ?? "Pass the quick check to earn points.",
    });
  }

  if (savedNoPoints) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p className={styles.kicker}>Saved</p>
          <h1 className={styles.doneTitle}>{savedNoPoints.title}</h1>
          <p className={styles.lead}>{savedNoPoints.message}</p>
          <Link to="/home" className={styles.primaryLink}>
            Home
          </Link>
        </div>
      </div>
    );
  }

  if (celebration) {
    return (
      <PointsCelebration
        startPoints={celebration.startPoints}
        endPoints={celebration.endPoints}
        pointsEarned={celebration.endPoints - celebration.startPoints}
        headline="Session done"
        subline={celebration.subline}
        detail={celebration.detail}
        onContinue={() => navigate("/home")}
      />
    );
  }

  if (!step) {
    return (
      <div className={styles.page}>
        <p>Something went wrong. Head back and try again.</p>
        <Link to="/home">Back home</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/home" className={styles.back}>
          ← Home
        </Link>
        <p className={styles.kicker}>{topic.title}</p>
        <h1 className={styles.blockTitle}>{activeBlock.title}</h1>
        <p className={styles.stepMeta}>
          {summary.blockNumber}/{summary.totalBlocks} · {stepIndex + 1}/{totalSteps}
        </p>
        <div className={styles.bar} aria-hidden>
          <span
            style={{
              width: `${((stepIndex + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </header>

      <div className={styles.card}>
        <StepRenderer
          key={stepIndex}
          step={step}
          onAdvance={handleAdvance}
          onQuizPassed={handleQuizPassed}
        />
        {blockHasQuiz(activeBlock) ? (
          <p className={styles.stepMeta}>
            {formatPointsHint()}
          </p>
        ) : null}
      </div>
    </div>
  );
}
