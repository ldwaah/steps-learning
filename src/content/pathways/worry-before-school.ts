import { pathway, session } from "../builders";

export const worryBeforeSchool = pathway(
  "worry-before-school",
  "Worry before school",
  {
    category: "feelings",
    strapline: "Mornings, loops, and getting through the day.",
    minutesPerSession: 12,
  },
  [
    session("b1", "Morning dread", {
      category: "feelings",
      body: "The alarm goes off. Your stomach drops before your feet hit the floor.\n\nNaming the feeling can take some power out of it.",
      scenario: {
        setup: "What does morning worry feel like for you?",
        choices: [
          { id: "sick", label: "Sick or shaky", response: "Your body preparing for threat, even if school is not danger." },
          { id: "avoid", label: "Wanting to avoid going in", response: "Avoidance makes sense to your brain." },
          { id: "snap", label: "Snappy at home", response: "Often worry comes out sideways before you have words." },
        ],
      },
      quiz: [
        { id: "q1", q: "Morning worry is common in secondary school.", yes: true },
        { id: "q2", q: "Feeling sick means you are faking it.", yes: false },
        { id: "q3", q: "Naming the feeling can take some power out of it.", yes: true },
      ],
    }),
    session("b2", "What-if loops", {
      category: "feelings",
      body: "What if they laugh? What if I get pulled out? What if I lose it again?\n\nYour brain can loop before you even leave the house. You can interrupt a loop without fixing your whole life.",
      scenario: {
        setup: "When a what-if loop starts, what helps even a little?",
        choices: [
          { id: "write", label: "Write the worry down once", response: "Gets it out of your head. Does not fix everything, still helps." },
          { id: "fact", label: "Ask: what has actually happened before?", response: "Sometimes the worst case has not happened." },
          { id: "distract", label: "Music or a game for five minutes", response: "Not avoidance forever. A bridge to get moving." },
        ],
      },
      quiz: [
        { id: "q1", q: "What-if thoughts are always accurate predictions.", yes: false },
        { id: "q2", q: "Loops use up energy you need for the day.", yes: true },
        { id: "q3", q: "You can interrupt a loop without fixing your whole life.", yes: true },
      ],
    }),
    session("b3", "Body on alert", {
      category: "feelings",
      body: "Worry is not only in your head. Your body can be on alert before first lesson.\n\nHeart racing, stomach churning, shoulders up by your ears. All count.",
      scenario: {
        setup: "Which body sign shows up when you are worried?",
        choices: [
          { id: "heart", label: "Heart racing", response: "Classic alarm. A slow out-breath can nudge it down." },
          { id: "tummy", label: "Stomach churning", response: "Gut and brain are linked." },
          { id: "tense", label: "Shoulders up by your ears", response: "Tension stack. Dropping shoulders helps some people." },
        ],
      },
      quiz: [
        { id: "q1", q: "Worry can show up in the body.", yes: true },
        { id: "q2", q: "Body signs mean you are weak.", yes: false },
        { id: "q3", q: "Slow breathing can calm the alarm a little.", yes: true },
      ],
    }),
    session("b4", "Before a test or pressure", {
      category: "feelings",
      body: "Tests, presentations, or being put on the spot. Pressure stacks on top of worry.\n\nYou do not need zero nerves to do okay.",
      scenario: {
        setup: "Before something pressured, what might help?",
        choices: [
          { id: "prep", label: "One small prep: pen, water, arrive early", response: "Control the tiny bits." },
          { id: "talk", label: "Tell staff you are struggling before you snap", response: "Hard. Also brave." },
          { id: "ground", label: "Feet on floor, name three sounds", response: "Quick grounding. Works in corridors too." },
        ],
      },
      quiz: [
        { id: "q1", q: "Preparation can lower worry a notch.", yes: true },
        { id: "q2", q: "You must feel zero nerves to do well.", yes: false },
        { id: "q3", q: "Asking for support before a meltdown is allowed.", yes: true },
      ],
    }),
    session("b5", "People and groups", {
      category: "feelings",
      body: "Group chat went quiet when you joined. Someone looked at you funny. Your brain fills the gap.\n\nSocial worry is real worry. You are not the only one.",
      scenario: {
        setup: "When social worry hits, you tend to:",
        choices: [
          { id: "read", label: "Read the worst into it", response: "Brain threat scanner. Not proof it is true." },
          { id: "withdraw", label: "Go quiet or leave", response: "Protects you short term." },
          { id: "react", label: "Snap or post something", response: "Quick relief. Often regret later." },
        ],
      },
      quiz: [
        { id: "q1", q: "Social worry is real worry.", yes: true },
        { id: "q2", q: "Everyone else never feels this.", yes: false },
        { id: "q3", q: "Checking the story with someone you trust can help.", yes: true },
      ],
    }),
    session("b6", "Wind down", {
      category: "feelings",
      body: "End of day. Your body might still be buzzing even when lessons are over.\n\nSmall routines can be repeated. They do not have to be perfect.",
      scenario: {
        setup: "What could help you land after school?",
        choices: [
          { id: "move", label: "Walk, shower, sport", response: "Moves stress chemicals through your body." },
          { id: "off", label: "Screen off for twenty minutes", response: "Hard. Worth trying once." },
          { id: "one", label: "One good thing from today", response: "Tiny. Still counts." },
        ],
      },
      reflect: {
        prompt: "Tonight I will try:",
        chips: ["Move", "Quiet time", "Talk to someone", "Just survive. Fair."],
      },
      quiz: [
        { id: "q1", q: "Winding down can make tomorrow slightly easier.", yes: true },
        { id: "q2", q: "You must fix all worry before sleep.", yes: false },
        { id: "q3", q: "Small routines can be repeated.", yes: true },
      ],
    }),
  ],
);
