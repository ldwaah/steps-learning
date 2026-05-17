import { Link, useNavigate } from "react-router-dom";
import { CHECK_IN_POINTS, REGULATE_POINTS } from "../content";
import { getDailyPlanStatus } from "../lib/dailyPlan";
import { getLevelForPoints, getNextLevel, pointsToNextLevel } from "../lib/levels";
import { getInProgressTopics } from "../lib/progress";
import { hasRegulatedToday } from "../lib/regulate";
import { getCurrentUser } from "../lib/authSession";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  if (!user) return null;

  const { plan, isComplete, sessionsDoneToday, sessionTarget } =
    getDailyPlanStatus(user.id);
  const inProgress = getInProgressTopics(user.id);
  const primary = inProgress[0];
  const level = getLevelForPoints(user.points);
  const nextLevel = getNextLevel(user.points);
  const toNext = pointsToNextLevel(user.points);
  const regulated = hasRegulatedToday(user.id);

  const doneCount =
    (plan.items.find((i) => i.kind === "check-in")?.done ? 1 : 0) +
    (regulated ? 1 : 0) +
    sessionsDoneToday;
  const totalCount = 2 + sessionTarget;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Hi, {user.firstName}</h1>
      </header>

      {isComplete ? (
        <section className={styles.doneBanner} aria-label="Today complete">
          <p className={styles.doneTitle}>You are done for today</p>
          <p className={styles.doneText}>
            Check-in, breathing, and your sessions are in. Come back tomorrow or
            explore another pathway if you want.
          </p>
        </section>
      ) : null}

      <Link to="/progress" className={styles.pointsCard}>
        <p className={styles.pointsLabel}>{user.points} pts</p>
        <p className={styles.levelName}>{level.label}</p>
        {nextLevel && toNext !== null ? (
          <p className={styles.levelHint}>{toNext} pts to {nextLevel.label}</p>
        ) : null}
      </Link>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Today</h2>
          <span className={styles.todayProgress}>
            {doneCount}/{totalCount}
          </span>
        </div>
        <p className={styles.hint}>
          Spread about {plan.target.min}–{plan.target.max} minutes across the day.
        </p>
        <ul className={styles.taskList}>
          {plan.items.map((item) => {
            if (item.kind === "check-in") {
              if (item.done) return <li key="ci" className={styles.taskDone}>Check-in done</li>;
              return (
                <li key="ci">
                  <button type="button" className={styles.taskBtn} onClick={() => navigate("/check-in")}>
                    Check-in <span>+{CHECK_IN_POINTS} pts</span>
                  </button>
                </li>
              );
            }
            if (item.kind === "regulate") {
              if (regulated) return <li key="reg" className={styles.taskDone}>Breathing done</li>;
              return (
                <li key="reg">
                  <button type="button" className={styles.taskBtn} onClick={() => navigate("/regulate")}>
                    Breathing <span>+{REGULATE_POINTS} pts</span>
                  </button>
                </li>
              );
            }
            return (
              <li key={item.topicId}>
                <button type="button" className={styles.taskBtn} onClick={() => navigate(`/topic/${item.topicId}`)}>
                  {item.sessionTitle} <span>{item.pathwayTitle}</span>
                </button>
              </li>
            );
          })}
          {sessionsDoneToday > 0 && sessionsDoneToday >= sessionTarget ? (
            <li className={styles.taskDone}>Sessions done for today</li>
          ) : null}
        </ul>
      </section>

      {primary && !isComplete ? (
        <section className={styles.section}>
          <h2>Continue</h2>
          <article className={styles.continueCard}>
            <h3>{primary.title}</h3>
            <p>Session {primary.blockNumber}/{primary.totalBlocks}</p>
            <button type="button" className={styles.primary} onClick={() => navigate(`/topic/${primary.topicId}`)}>
              Go
            </button>
          </article>
        </section>
      ) : !isComplete ? (
        <Link to="/pathways" className={styles.primaryLink}>Pick a pathway</Link>
      ) : (
        <Link to="/pathways" className={styles.moreLink}>Browse pathways</Link>
      )}
    </div>
  );
}
