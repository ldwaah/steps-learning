import { pathway, session } from "../builders";

export const angerShowsUp = pathway(
  "anger-shows-up",
  "When anger shows up",
  {
    category: "feelings",
    strapline: "Notice it early. Choose what happens next.",
    minutesPerSession: 12,
  },
  [
    session("b1", "A rough lesson", {
      category: "feelings",
      why: "Spotting anger early is the first step to changing what happens next.",
      body: "Sam is in last period. Something small already went wrong at lunch.\n\nYou are not Sam. You might still recognise the build-up.",
      scenario: {
        setup: "What do you think shows up first for Sam?",
        choices: [
          {
            id: "anger",
            label: "Anger",
            response: "Could be. The body gears up fast.",
          },
          {
            id: "worry",
            label: "Worry",
            response: "Could be that too. Anger and worry often sit close.",
          },
          {
            id: "numb",
            label: "Going quiet",
            response: "Some people shut down. That still counts.",
          },
        ],
      },
      reflect: {
        prompt: "Closest to you right now?",
        chips: ["Okay", "On edge", "Angry", "Shut down"],
      },
      quiz: [
        { id: "q1", q: "Anger often gives you early warning signs in your body.", yes: true },
        { id: "q2", q: "The best first move is always to shout back.", yes: false },
        {
          id: "q3",
          q: "At school, reacting without thinking often makes the rest of the day harder.",
          yes: true,
        },
      ],
    }),
    session("b2", "Spot it early", {
      category: "feelings",
      why: "Early signs give you a few seconds to choose a different move.",
      body: "Your body often knows something is building before you speak or act.\n\nHot face, tight jaw, buzzing hands, or going quiet all count.",
      scenario: {
        setup: "Which early sign shows up for you most?",
        choices: [
          {
            id: "hot",
            label: "Hot face or ears",
            response: "Noticing it early gives you a few seconds to pause.",
          },
          {
            id: "tight",
            label: "Tight chest or jaw",
            response: "Your body gearing up, even when you are trying to stay calm.",
          },
          {
            id: "buzz",
            label: "Buzzing legs or fists",
            response: "Energy looking for a way out.",
          },
          {
            id: "quiet",
            label: "Going quiet or blank",
            response: "Shutdown counts as a sign too.",
          },
        ],
      },
      reflect: {
        prompt: "Pick one that fits today and say why in a line.",
        chips: ["Okay", "On edge", "Angry", "Worried", "Shut down"],
      },
      quiz: [
        { id: "q1", q: "Noticing an early sign can help you pause before reacting.", yes: true },
        { id: "q2", q: "Early signs only happen when you are about to get a detention.", yes: false },
        {
          id: "q3",
          q: "Going quiet can be an early sign, not just shouting or walking out.",
          yes: true,
        },
      ],
    }),
    session("b3", "Create space", {
      category: "feelings",
      body: "You do not have to win the moment. You only need a little space to think.\n\nSpace can be a breath, a step away, or a signal to an adult.",
      scenario: {
        setup: "What could create space without making it worse?",
        choices: [
          {
            id: "pause",
            label: "Pause, look down, breathe once",
            response: "Simple. Hard in the moment, worth practising.",
          },
          {
            id: "move",
            label: "Move: toilet, drink, corridor",
            response: "Leaving with permission beats walking out.",
          },
          {
            id: "signal",
            label: "Signal an adult you trust",
            response: "A look, a hand up, or a word agreed beforehand.",
          },
        ],
      },
      reflect: {
        prompt: "One space-maker you could try this week:",
        chips: ["Pause", "Move", "Ask adult", "Not sure yet"],
      },
      quiz: [
        { id: "q1", q: "A short pause can change what happens next.", yes: true },
        { id: "q2", q: "Creating space means you are weak.", yes: false },
        { id: "q3", q: "Walking off without telling anyone always helps.", yes: false },
      ],
    }),
    session("b4", "Words that heat it up", {
      category: "feelings",
      body: "Some phrases pour petrol on it, for you and for them.\n\nTone matters as much as the words. Sarcasm counts.",
      scenario: {
        setup: "Which line would heat things up fastest in a corridor?",
        choices: [
          {
            id: "make",
            label: "\"Make me then\"",
            response: "Challenge voice. Adults hear defiance. Mates might push more.",
          },
          {
            id: "whatever",
            label: "\"Whatever\" with a shrug",
            response: "Sounds like you do not care. Often makes it worse.",
          },
          {
            id: "fine",
            label: "\"I'm fine\" through gritted teeth",
            response: "Your body says otherwise.",
          },
        ],
      },
      quiz: [
        { id: "q1", q: "Tone matters as much as the actual words.", yes: true },
        { id: "q2", q: "Sarcasm never affects how a situation goes.", yes: false },
        { id: "q3", q: "You can practise calmer words before you are in it.", yes: true },
      ],
    }),
    session("b5", "After it goes wrong", {
      category: "feelings",
      body: "You shouted. Or walked out. Or went cold and rude.\n\nOne bad moment does not have to own the whole day.",
      scenario: {
        setup: "What might repair look like at school?",
        choices: [
          {
            id: "own",
            label: "Owning one part: \"I should not have…\"",
            response: "One honest line can land better than a long speech.",
          },
          {
            id: "restorative",
            label: "Restorative chat with staff",
            response: "Common in AP settings. Awkward, useful.",
          },
          {
            id: "time",
            label: "Giving it time, then a short check-in",
            response: "Sometimes today is not the day. Tomorrow can start cleaner.",
          },
        ],
      },
      reflect: {
        prompt: "Repair is hard when you feel:",
        chips: ["Ashamed", "Angry still", "Numb", "Ready to try"],
      },
      quiz: [
        { id: "q1", q: "One bad moment defines the whole day.", yes: false },
        { id: "q2", q: "Repair can start with a small step.", yes: true },
        { id: "q3", q: "Adults only want to punish, never help.", yes: false },
      ],
    }),
    session("b6", "Your plan", {
      category: "feelings",
      body: "Plans work when they are short and real, not perfect.\n\nPick one early sign and one space move. That is enough.",
      scenario: {
        setup: "Pick your first space move:",
        choices: [
          { id: "breathe", label: "One slow breath out", response: "Free. Always available." },
          {
            id: "count",
            label: "Count four things I can see",
            response: "Grounding. Pulls your brain back a notch.",
          },
          {
            id: "ask",
            label: "Ask to step out",
            response: "Needs a teacher who will back you. Worth agreeing in advance.",
          },
        ],
      },
      reflect: {
        prompt: "My early sign is probably:",
        chips: ["Hot face", "Tight chest", "Buzzing", "Going quiet"],
      },
      quiz: [
        { id: "q1", q: "A short personal plan can be used more than once.", yes: true },
        { id: "q2", q: "Plans have to be long to work.", yes: false },
        { id: "q3", q: "Telling one trusted adult your plan can help.", yes: true },
      ],
    }),
  ],
);
