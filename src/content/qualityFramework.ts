/**
 * Alignment for school leaders, Ofsted EIF & Teachers' Standards (England).
 * Not shown on student screens; used on staff views and content design.
 */

export const OFSTED_ALIGNMENT = {
  intent:
    "Personal development and behaviour support through structured, bite-sized wellbeing and school-life sessions, not a replacement for the full curriculum.",
  implementation:
    "Short sessions with check-ins, regulation, reflection, and low-stakes checks; progress tracked without public shaming.",
  impact:
    "Students build coping skills, help-seeking, and day-structure habits measurable through completion and engagement (not exam grades).",
  eifAreas: [
    "Personal development",
    "Behaviour and attitudes",
    "Quality of education (adapted provision)",
    "Leadership and management (monitoring engagement)",
  ],
} as const;

/** Teachers' Standards 2012 (England), mapped to platform design */
export const TEACHERS_STANDARDS = [
  {
    standard: "1-2",
    title: "High expectations & progress",
    howStepsSupports:
      "Sessions reward effort and completion; unlimited quiz retries; no public failure labels.",
  },
  {
    standard: "5",
    title: "Adapt teaching",
    howStepsSupports:
      "Students work at own pace; spread 40-60 minutes across the day; optional notes on check-in.",
  },
  {
    standard: "6-7",
    title: "Assessment & behaviour",
    howStepsSupports:
      "Low-stakes checks; staff can see engagement; content frames behaviour as communication.",
  },
  {
    standard: "8",
    title: "Wider responsibilities",
    howStepsSupports:
      "Safeguarding-aware help-seeking pathways; no student-facing diagnostic labels.",
  },
] as const;

export const STUDENT_SAFE_PRINCIPLES = [
  "No SEMH or clinical labels on student screens",
  "No class league tables by default, personal progress first",
  "Trauma-informed pacing: short steps, retry allowed, exit without penalty",
  "UK English and school-realistic scenarios",
] as const;
