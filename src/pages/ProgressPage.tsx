import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CHECK_IN_POINTS,
  REGULATE_POINTS,
  SESSION_BASE_POINTS,
  SESSION_MAX_POINTS,
  SESSION_TIME_BONUS_MAX,
} from "../content";
import { LEVELS, getLevelForPoints, getNextLevel, pointsToNextLevel } from "../lib/levels";
import {
  fetchLeaderboard,
  getYourRank,
  type LeaderboardData,
} from "../lib/leaderboard";
import { getAllPathwayProgressDetails, getOverallStats } from "../lib/progress";
import { getCurrentUser } from "../lib/authSession";
import { teamLabel } from "../lib/teams";
import styles from "./ProgressPage.module.css";

type Tab = "overview" | "sessions" | "leaderboard";

export default function ProgressPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [tab, setTab] = useState<Tab>("overview");

  if (!user) return null;

  const stats = getOverallStats(user.id);
  const level = getLevelForPoints(user.points);
  const next = getNextLevel(user.points);
  const toNext = pointsToNextLevel(user.points);
  const pathways = getAllPathwayProgressDetails(user.id);
  const [board, setBoard] = useState<LeaderboardData | null>(null);

  useEffect(() => {
    if (tab !== "leaderboard") return;
    void fetchLeaderboard(user.id).then(setBoard);
  }, [tab, user.id]);

  const rank = board ? getYourRank(board.members, user.id) : 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Progress</h1>
      </header>

      <div className={styles.tabs} role="tablist">
        {(
          [
            ["overview", "Overview"],
            ["sessions", "Sessions"],
            ["leaderboard", "Board"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? styles.tabActive : styles.tab}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className={styles.panel}>
          <section className={styles.card}>
            <p className={styles.bigPoints}>{user.points}</p>
            <p className={styles.sub}>points</p>
            <p className={styles.stage}>{level.label}</p>
            {next && toNext !== null ? (
              <p className={styles.next}>{toNext} pts to {next.label}</p>
            ) : null}
          </section>

          <section className={styles.card}>
            <h2>Stages</h2>
            <ul className={styles.levelList}>
              {LEVELS.map((l) => (
                <li key={l.id} className={l.id === level.id ? styles.levelCurrent : undefined}>
                  <strong>{l.label}</strong>
                  <span>
                    {l.minPoints}
                    {l.maxPoints !== null ? `-${l.maxPoints}` : "+"} pts
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.card}>
            <h2>Points</h2>
            <ul className={styles.earnList}>
              <li>Check-in +{CHECK_IN_POINTS}</li>
              <li>Breathing +{REGULATE_POINTS}</li>
              <li>
                Session +{SESSION_BASE_POINTS} (finish) + up to {SESSION_TIME_BONUS_MAX} (time),
                max {SESSION_MAX_POINTS}
              </li>
            </ul>
            <p className={styles.note}>Never taken away.</p>
          </section>

          <section className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.sessionsCompleted}</span>
              <span className={styles.statLabel}>sessions</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.pathwaysComplete}</span>
              <span className={styles.statLabel}>pathways done</span>
            </div>
          </section>

          <Link to="/activity" className={styles.activityLink}>
            View activity log
            <span className={styles.activityHint}>Sign-in, check-ins, sessions</span>
          </Link>
        </div>
      ) : null}

      {tab === "sessions" ? (
        <div className={styles.panel}>
          <p className={styles.note}>
            {stats.sessionsCompleted}/{stats.totalSessions} done
          </p>
          {pathways.map((pathway) => (
            <section key={pathway.topicId} className={styles.pathwayBlock}>
              <div className={styles.pathwayHead}>
                <h2>{pathway.title}</h2>
                <span>{pathway.percent}%</span>
              </div>
              <ul className={styles.sessionList}>
                {pathway.sessions.map((s) => (
                  <li
                    key={s.id}
                    className={
                      s.status === "done"
                        ? styles.sessionDone
                        : s.status === "current"
                          ? styles.sessionCurrent
                          : styles.sessionUpcoming
                    }
                  >
                    <span className={styles.sessionStatus}>
                      {s.status === "done" ? "Done" : s.status === "current" ? "Now" : ""}
                    </span>
                    {s.title}
                    {s.status === "current" ? (
                      <button
                        type="button"
                        className={styles.goBtn}
                        onClick={() => navigate(`/topic/${pathway.topicId}`)}
                      >
                        Go
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      {tab === "leaderboard" ? (
        <div className={styles.panel}>
          {!board ? (
            <p className={styles.note}>Loading leaderboard…</p>
          ) : (
            <>
              <section className={styles.card}>
                <h2>Team totals</h2>
                <p className={styles.note}>Combined points from everyone on each team.</p>
                <ol className={styles.teamBoard}>
                  {board.teams.map((team, index) => (
                    <li
                      key={team.colour}
                      className={`${styles.teamRow} ${team.isYourTeam ? styles.teamRowYou : ""} ${styles[`team${team.colour}`]}`}
                    >
                      <span className={styles.boardPos}>{index + 1}</span>
                      <div className={styles.boardBody}>
                        <span className={styles.boardName}>{team.label}</span>
                        <span className={styles.boardMeta}>
                          {team.totalPoints} pts · {team.memberCount} members
                          {team.isYourTeam ? " · your team" : ""}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              <section className={styles.card}>
                <h2>Students</h2>
                <p className={styles.rankYou}>
                  You: <strong>#{rank}</strong> of {board.members.length}
                </p>
                <ol className={styles.board}>
                  {board.members.map((entry, index) => (
                    <li key={entry.userId} className={entry.isYou ? styles.boardYou : undefined}>
                      <span className={styles.boardPos}>{index + 1}</span>
                      <div className={styles.boardBody}>
                        <span className={styles.boardName}>{entry.isYou ? "You" : entry.firstName}</span>
                        <span className={styles.boardMeta}>
                          {entry.points} pts · {teamLabel(entry.teamColour)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
