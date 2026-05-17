import type {
  BlockData,
  PathwayCategory,
  PathwayData,
  ScenarioChoice,
} from "./types";
import { defaultSessionWhy } from "./pathwayThemes";

type QuizSpec = { id: string; q: string; yes: boolean };

export function quizStep(questions: QuizSpec[]) {
  return {
    type: "quiz" as const,
    passCount: Math.min(questions.length, Math.max(2, questions.length - 1)),
    questions: questions.map(({ id, q, yes }) => ({
      id,
      question: q,
      options: [
        { id: "true", label: "True" },
        { id: "false", label: "False" },
      ],
      correctId: yes ? "true" : "false",
    })),
  };
}

export function session(
  id: string,
  title: string,
  opts: {
    body: string;
    why?: string;
    category?: PathwayCategory;
    scenario: { setup: string; choices: ScenarioChoice[] };
    reflect?: { prompt: string; chips: string[]; minChars?: number };
    quiz: QuizSpec[];
  },
): BlockData {
  const why =
    opts.why ??
    (opts.category ? defaultSessionWhy(opts.category) : "Worth a few focused minutes.");

  return {
    id,
    title,
    steps: [
      { type: "content", title, body: opts.body, why },
      {
        type: "scenario",
        setup: opts.scenario.setup,
        choices: opts.scenario.choices,
      },
      {
        type: "reflect",
        prompt: opts.reflect?.prompt ?? "Right now, what fits best?",
        chips: opts.reflect?.chips ?? ["Okay", "A lot", "Not sure", "Shut down"],
        minChars: opts.reflect?.minChars ?? 10,
      },
      quizStep(opts.quiz),
    ],
  };
}

export function pathway(
  id: string,
  title: string,
  meta: {
    category: PathwayCategory;
    strapline: string;
    minutesPerSession: number;
  },
  sessions: BlockData[],
): PathwayData {
  return {
    id,
    title,
    category: meta.category,
    strapline: meta.strapline,
    minutesPerSession: meta.minutesPerSession,
    blocks: sessions,
  };
}
