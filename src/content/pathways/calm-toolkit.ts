import { pathway, session } from "../builders";

export const calmToolkit = pathway(
  "calm-toolkit",
  "Your calm toolkit",
  {
    category: "calm",
    strapline: "Breathing, grounding, movement. Pick what works.",
    minutesPerSession: 10,
  },
  [
    session("b1", "Why tools matter", {
      body: "You can't think your way out of a fired-up nervous system.\n\nTry it slowly. It counts even if it feels odd at first.",
      scenario: {
        setup: "When you're overloaded, what do you usually do.",
        choices: [
          { id: "react", label: "React, shout, walk, hit something", response: "Release, sometimes makes the day harder." },
          { id: "shut", label: "Shut down", response: "Quiet on the outside, storm inside." },
          { id: "scroll", label: "Scroll or game hard", response: "Distracts." },
        ],
      },
      quiz: [
        { id: "q1", q: "Body tools can come before problem-solving.", yes: true },
        { id: "q2", q: "Calm tools are only for little kids.", yes: false },
        { id: "q3", q: "Different tools work on different days.", yes: true },
      ],
    }),
    session("b2", "Breathing", {
      body: "Longer out-breath than in-breath nudges your body toward calm.\n\nTry it slowly. It counts even if it feels odd at first.",
      scenario: {
        setup: "When could you try slow breathing?",
        choices: [
          { id: "door", label: "Before walking into school", response: "Private." },
          { id: "lesson", label: "When a lesson feels too much", response: "Feet on floor, one slow out-breath." },
          { id: "bed", label: "Before sleep", response: "When the day replays in your head." },
        ],
      },
      quiz: [
        { id: "q1", q: "Slow out-breaths can lower intensity a notch.", yes: true },
        { id: "q2", q: "You must feel calm instantly or it failed.", yes: false },
        { id: "q3", q: "Breathing can be done without anyone noticing.", yes: true },
      ],
    }),
    session("b3", "Grounding", {
      body: "5 things you see.\n\nTry it slowly. It counts even if it feels odd at first.",
      scenario: {
        setup: "Where could you run a quick grounding?",
        choices: [
          { id: "corridor", label: "Corridor between lessons", response: "Eyes open." },
          { id: "toilet", label: "Toilet break", response: "Two minutes." },
          { id: "outside", label: "Outside at break", response: "Nature helps, even a wall and sky." },
        ],
      },
      quiz: [
        { id: "q1", q: "Grounding uses your senses to anchor you.", yes: true },
        { id: "q2", q: "Grounding fixes the whole problem.", yes: false },
        { id: "q3", q: "You can use part of the list, not all five.", yes: true },
      ],
    }),
    session("b4", "Movement", {
      body: "Stress chemicals are built to be used.\n\nTry it slowly. It counts even if it feels odd at first.",
      scenario: {
        setup: "What movement is realistic for you?",
        choices: [
          { id: "walk", label: "Walk the long way to lesson", response: "Burns a bit of charge." },
          { id: "shake", label: "Shake out arms by your locker", response: "Looks casual." },
          { id: "sport", label: "PE or club after school", response: "Regular outlet, if you can access it." },
        ],
      },
      quiz: [
        { id: "q1", q: "Movement can lower built-up tension.", yes: true },
        { id: "q2", q: "You must do sport to regulate.", yes: false },
        { id: "q3", q: "Small movement beats none.", yes: true },
      ],
    }),
    session("b5", "Temperature and senses", {
      body: "Cold water on wrists.\n\nTry it slowly. It counts even if it feels odd at first.",
      scenario: {
        setup: "Which sensory tool could you actually use?",
        choices: [
          { id: "water", label: "Cold water", response: "Toilet tap." },
          { id: "mint", label: "Mint or strong flavour", response: "Wakes the brain a little." },
          { id: "fidget", label: "Fidget or stress ball", response: "If school allow, worth asking." },
        ],
      },
      quiz: [
        { id: "q1", q: "Sensory tools can interrupt overwhelm.", yes: true },
        { id: "q2", q: "Only one tool works for everyone.", yes: false },
        { id: "q3", q: "School may allow some sensory items.", yes: true },
      ],
    }),
    session("b6", "Build your kit", {
      body: "Pick three tools.\n\nTry it slowly. It counts even if it feels odd at first.",
      scenario: {
        setup: "Your school tool could be:",
        choices: [
          { id: "breath", label: "Slow breathing", response: "Always with you." },
          { id: "ground", label: "5-4-3-2-1 grounding", response: "Silent." },
          { id: "move", label: "Walk + water", response: "Combo works for many." },
        ],
      },
      reflect: {
        prompt: "My three tools:",
        chips: ["Breathing", "Grounding", "Movement", "Cold water", "Music"],
      },
      quiz: [
        { id: "q1", q: "A personal kit can be three items.", yes: true },
        { id: "q2", q: "You need every tool on every list.", yes: false },
        { id: "q3", q: "Trying tools on calm days helps on hard days.", yes: true },
      ],
    }),
  ],
);
