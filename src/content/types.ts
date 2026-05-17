export type PathwayCategory =
  | "feelings"
  | "relationships"
  | "calm"
  | "school-life";

export type ContentStepData = {
  type: "content";
  title?: string;
  body: string;
  why?: string;
};

export type ScenarioChoice = {
  id: string;
  label: string;
  response: string;
};

export type ScenarioStepData = {
  type: "scenario";
  setup: string;
  choices: ScenarioChoice[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  correctId: string;
};

export type QuizStepData = {
  type: "quiz";
  questions: QuizQuestion[];
  passCount: number;
};

export type ReflectStepData = {
  type: "reflect";
  prompt: string;
  chips: string[];
  minChars: number;
};

export type StepData =
  | ContentStepData
  | ScenarioStepData
  | QuizStepData
  | ReflectStepData;

/** A session, short touchpoints (~10 min each), ~40-50 min if all steps in one go */
export type BlockData = {
  id: string;
  title: string;
  steps: StepData[];
};

/** Full pathway, spread across days, not a single lesson */
export type PathwayData = {
  id: string;
  title: string;
  category: PathwayCategory;
  strapline: string;
  minutesPerSession: number;
  blocks: BlockData[];
};

/** @deprecated use PathwayData */
export type TopicData = PathwayData;
