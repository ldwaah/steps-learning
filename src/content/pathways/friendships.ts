import { pathway, session } from "../builders";

export const friendships = pathway(
  "friendships",
  "When friendships fracture",
  {
    category: "relationships",
    strapline: "Fallouts, group chats, and finding your lane.",
    minutesPerSession: 12,
  },
  [
    session("b1", "Group chat", {
      body: "Screens make everything faster.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "When group chat goes wrong, you usually:",
        choices: [
          { id: "fire", label: "Fire back straight away", response: "Relief now, fallout later." },
          { id: "scroll", label: "Scroll and spiral", response: "Brain fills gaps with worst guesses." },
          { id: "leave", label: "Leave or mute", response: "Protects you." },
        ],
      },
      quiz: [
        { id: "q1", q: "Online fallout can feel as big as in-person.", yes: true },
        { id: "q2", q: "Screens always show the full story.", yes: false },
        { id: "q3", q: "Stepping away before replying can help.", yes: true },
      ],
    }),
    session("b2", "Fallouts", {
      body: "You said something.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "After a fall out, what matters most right now?",
        choices: [
          { id: "cool", label: "Cooling down before talking", response: "Words stick less when you're not boiling." },
          { id: "one", label: "One clear thing you want to say", response: "Better than a long rant in the toilet." },
          { id: "space", label: "Space, not forever, for now", response: "Valid even if mates pressure you to fix it." },
        ],
      },
      quiz: [
        { id: "q1", q: "Cooling down can prevent more damage.", yes: true },
        { id: "q2", q: "You must fix every friendship instantly.", yes: false },
        { id: "q3", q: "Adults can help without taking over.", yes: true },
      ],
    }),
    session("b3", "Left out", {
      body: "They sat without you.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "When you feel left out, you might:",
        choices: [
          { id: "blame", label: "Blame yourself", response: "Brain's quick story, not always true." },
          { id: "anger", label: "Get angry at them", response: "Protects pride." },
          { id: "ask", label: "Ask one person straight", response: "Scary." },
        ],
      },
      quiz: [
        { id: "q1", q: "Feeling left out is painful and real.", yes: true },
        { id: "q2", q: "You always know why people did something.", yes: false },
        { id: "q3", q: "Checking once can beat days of guessing.", yes: true },
      ],
    }),
    session("b4", "Saying sorry", {
      body: "Sorry doesn't have to be grovelling.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "A real sorry often includes:",
        choices: [
          { id: "what", label: "What you did, specifically", response: "Shows you get it." },
          { id: "but", label: "\"But you started it\"", response: "Undoes the sorry." },
          { id: "change", label: "What you'll try next time", response: "Optional." },
        ],
      },
      quiz: [
        { id: "q1", q: "Specific sorry can repair some damage.", yes: true },
        { id: "q2", q: "Sorry means you're weak.", yes: false },
        { id: "q3", q: "\"But you…\" can cancel an apology.", yes: true },
      ],
    }),
    session("b5", "Pressure to fit in", {
      body: "Banter that's too far.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "When pressure hits, your line might be:",
        choices: [
          { id: "jokes", label: "Jokes about stuff I care about", response: "Worth naming, even to yourself." },
          { id: "risk", label: "Stuff that gets me excluded", response: "Short win, long cost." },
          { id: "body", label: "Touch or photos I'm not okay with", response: "Hard no." },
        ],
      },
      quiz: [
        { id: "q1", q: "You can have lines even in a group.", yes: true },
        { id: "q2", q: "Going along always feels fine after.", yes: false },
        { id: "q3", q: "Leaving a situation can be strength.", yes: true },
      ],
    }),
    session("b6", "Boundaries", {
      body: "Boundary = what you'll do and won't do.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "One boundary you could practise:",
        choices: [
          { id: "name", label: "Name-calling stops with me", response: "Short." },
          { id: "chat", label: "I won't argue in group chat", response: "Takes discipline." },
          { id: "time", label: "I need time before I talk", response: "Buys space after conflict." },
        ],
      },
      reflect: {
        prompt: "Hardest part of boundaries for me:",
        chips: ["Fear they'll laugh", "FOMO", "Adults won't back me", "I'll cave"],
      },
      quiz: [
        { id: "q1", q: "Boundaries can be small actions.", yes: true },
        { id: "q2", q: "Boundaries mean you hate everyone.", yes: false },
        { id: "q3", q: "Practice makes boundaries easier.", yes: true },
      ],
    }),
  ],
);
