import { pathway, session } from "../builders";

export const schoolDay = pathway(
  "school-day",
  "Getting through the day",
  {
    category: "school-life",
    strapline: "Doors, lessons, breaks, and getting home.",
    minutesPerSession: 12,
  },
  [
    session("b1", "Through the door", {
      body: "Gate.\n\nSmall steps across the day add up.",
      scenario: {
        setup: "Hardest part of arriving is usually:",
        choices: [
          { id: "people", label: "People and noise", response: "Sensory load, real, not dramatic." },
          { id: "staff", label: "How staff greet you", response: "One sharp comment can stick till lunch." },
          { id: "worry", label: "What's coming later", response: "Brain time-travelling, common with worry." },
        ],
      },
      quiz: [
        { id: "q1", q: "Arrival can be the hardest slice of the day.", yes: true },
        { id: "q2", q: "If start is rough the whole day is ruined.", yes: false },
        { id: "q3", q: "One small routine can help arrival.", yes: true },
      ],
    }),
    session("b2", "Between lessons", {
      body: "Four minutes.\n\nSmall steps across the day add up.",
      scenario: {
        setup: "Between lessons, what helps?",
        choices: [
          { id: "route", label: "Same route each time", response: "Less decision fatigue." },
          { id: "avoid", label: "Avoid one hotspot", response: "Valid strategy, not cowardice." },
          { id: "adult", label: "Check in with one adult", response: "Thirty seconds." },
        ],
      },
      quiz: [
        { id: "q1", q: "Transitions can trigger reactions.", yes: true },
        { id: "q2", q: "You should always take the busiest route.", yes: false },
        { id: "q3", q: "Planning a route can reduce friction.", yes: true },
      ],
    }),
    session("b3", "When you're out of class", {
      body: "Sent out.\n\nSmall steps across the day add up.",
      scenario: {
        setup: "When you're out of lesson, best move is often:",
        choices: [
          { id: "breathe", label: "Use a tool, breathe, water, walk", response: "Body first." },
          { id: "argue", label: "Argue your case at the door", response: "Sometimes makes it longer." },
          { id: "plan", label: "Agree how you'll go back in", response: "With staff, one step." },
        ],
      },
      quiz: [
        { id: "q1", q: "Time out can be for regulation, not just punishment.", yes: true },
        { id: "q2", q: "You must storm back in to prove a point.", yes: false },
        { id: "q3", q: "A clear return plan can help.", yes: true },
      ],
    }),
    session("b4", "Lunch and break", {
      body: "Loud.\n\nSmall steps across the day add up.",
      scenario: {
        setup: "Break time is hardest when:",
        choices: [
          { id: "lonely", label: "No one to sit with", response: "Painful." },
          { id: "chaos", label: "Too much chaos", response: "Sensory overload, real." },
          { id: "drama", label: "Drama from earlier", response: "Morning follows you to the canteen." },
        ],
      },
      quiz: [
        { id: "q1", q: "Breaks can be stressful, not relaxing.", yes: true },
        { id: "q2", q: "Everyone loves lunch.", yes: false },
        { id: "q3", q: "A quieter spot can be a valid choice.", yes: true },
      ],
    }),
    session("b5", "Last period slump", {
      body: "Energy crashes.\n\nSmall steps across the day add up.",
      scenario: {
        setup: "When you're flagging last period:",
        choices: [
          { id: "water", label: "Water and a slow breath", response: "Small fuel." },
          { id: "task", label: "One tiny task only", response: "Finish one thing, not the whole sheet." },
          { id: "tell", label: "Tell staff you're struggling", response: "Adjustments exist in many AP settings." },
        ],
      },
      quiz: [
        { id: "q1", q: "End-of-day slump is common.", yes: true },
        { id: "q2", q: "You should have the same energy at 3pm as 9am.", yes: false },
        { id: "q3", q: "Small goals can get you through.", yes: true },
      ],
    }),
    session("b6", "Heading home", {
      body: "Bell goes.\n\nSmall steps across the day add up.",
      scenario: {
        setup: "After school you need most:",
        choices: [
          { id: "quiet", label: "Quiet before questions", response: "Fair to ask for twenty minutes." },
          { id: "move", label: "Movement", response: "Walk." },
          { id: "talk", label: "One person to decompress", response: "Not a full debrief, a check-in." },
        ],
      },
      reflect: {
        prompt: "After school I usually feel:",
        chips: ["Wrecked", "Buzzing", "Numb", "Okay", "Depends"],
      },
      quiz: [
        { id: "q1", q: "After-school landing can affect tomorrow.", yes: true },
        { id: "q2", q: "You must be chatty as soon as you get home.", yes: false },
        { id: "q3", q: "Small routines after school can help.", yes: true },
      ],
    }),
  ],
);
