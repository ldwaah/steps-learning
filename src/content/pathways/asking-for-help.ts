import { pathway, session } from "../builders";

export const askingForHelp = pathway(
  "asking-for-help",
  "Asking for help",
  {
    category: "relationships",
    strapline: "Who to tell. How to start. Without the shame.",
    minutesPerSession: 12,
  },
  [
    session("b1", "Not weak", {
      body: "Asking for help isn't snitching and it isn't giving up.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "What stops you asking for help most?",
        choices: [
          { id: "trust", label: "Don't trust they'll get it", response: "Fair." },
          { id: "tough", label: "Supposed to be tough", response: "Tough and struggling can exist together." },
          { id: "worse", label: "Scared it'll make it worse", response: "Sometimes it has before." },
        ],
      },
      quiz: [
        { id: "q1", q: "Needing help is part of being human.", yes: true },
        { id: "q2", q: "You must sort everything alone to be respected.", yes: false },
        { id: "q3", q: "The right adult can change how a day goes.", yes: true },
      ],
    }),
    session("b2", "Who to tell", {
      body: "Form tutor.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "Who feels safest to try first?",
        choices: [
          { id: "ta", label: "TA or support staff", response: "Often more time, less performance." },
          { id: "pastoral", label: "Pastoral / year lead", response: "It's their job, even when they're busy." },
          { id: "home", label: "Someone at home", response: "School and home don't always match, pick what." },
        ],
      },
      quiz: [
        { id: "q1", q: "You can start with one trusted person.", yes: true },
        { id: "q2", q: "You must tell everyone at once.", yes: false },
        { id: "q3", q: "If one person fails you, another might not.", yes: true },
      ],
    }),
    session("b3", "Starting the sentence", {
      body: "You don't need a speech.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "Which opener feels most doable?",
        choices: [
          { id: "notok", label: "\"I'm not okay\"", response: "Clear." },
          { id: "five", label: "\"I need five minutes\"", response: "Buys time without explaining everything in the corridor." },
          { id: "after", label: "\"Can we talk after?\"", response: "Gets it on their radar when you're not." },
        ],
      },
      quiz: [
        { id: "q1", q: "Short sentences count as asking for help.", yes: true },
        { id: "q2", q: "You need the perfect words or it doesn't count.", yes: false },
        { id: "q3", q: "Writing it down first can make it easier to say.", yes: true },
      ],
    }),
    session("b4", "When trust is low", {
      body: "Some adults have let you down.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "If trust is low, what might still be possible?",
        choices: [
          { id: "small", label: "Small ask, time, seat, break", response: "Practical." },
          { id: "other", label: "Different adult than last time", response: "Second chances on people, not infinite, but." },
          { id: "outside", label: "Support outside school", response: "Counsellor, helpline, relative, still counts." },
        ],
      },
      quiz: [
        { id: "q1", q: "Low trust is a reason to go careful, not to suffer alone.", yes: true },
        { id: "q2", q: "All adults are the same.", yes: false },
        { id: "q3", q: "Practical asks are still asks for help.", yes: true },
      ],
    }),
    session("b5", "After a bad chat", {
      body: "You tried.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "After a bad response, what now?",
        choices: [
          { id: "another", label: "Try another adult", response: "Not fair you have to, still an option." },
          { id: "document", label: "Note what was said", response: "Date, who, what, for someone higher up if." },
          { id: "pause", label: "Pause, don't write off all help", response: "One bad chat isn't every future chat." },
        ],
      },
      quiz: [
        { id: "q1", q: "One bad response means help never works.", yes: false },
        { id: "q2", q: "You deserved to be dismissed.", yes: false },
        { id: "q3", q: "Another person or route can exist.", yes: true },
      ],
    }),
    session("b6", "One safe adult", {
      body: "Build one line to one person.\n\nPick what feels closest. You can change your mind.",
      scenario: {
        setup: "Your safe adult might be:",
        choices: [
          { id: "school", label: "Someone in school", response: "Best when they'll act, not just listen." },
          { id: "home", label: "Someone at home", response: "Best when home is stable enough." },
          { id: "both", label: "One of each", response: "School for day, home for night, works for some." },
        ],
      },
      reflect: {
        prompt: "I'm willing to try asking when:",
        chips: ["Before I blow", "After I cool down", "Mornings", "Not sure yet"],
      },
      quiz: [
        { id: "q1", q: "One trusted adult is a solid goal.", yes: true },
        { id: "q2", q: "You need a perfect relationship first.", yes: false },
        { id: "q3", q: "Help can be small and repeated.", yes: true },
      ],
    }),
  ],
);
