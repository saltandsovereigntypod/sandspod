// Short guided tune-in scripts to take before an exercise, one line at a time:
// grounding, opening, third-eye visualisation, aura sensing and closing. Our own
// words. Auras and the third eye are traditions of modern spiritual practice,
// not measured things; the scripts are a way to settle attention. Pure.

export type Warmup = { id: string; title: string; minutes: number; line: string; lines: string[] };

export const WARMUPS: Warmup[] = [
  {
    id: 'grounding',
    title: 'Grounding',
    minutes: 2,
    line: 'Settle into your body and the ground first.',
    lines: [
      'Sit comfortably with both feet on the floor. Let your shoulders drop.',
      'Breathe in through your nose, and out slowly through your mouth, three times.',
      'Feel the weight of your body in the chair, and the floor holding your feet.',
      'Imagine a line running from the base of your spine down into the earth.',
      'Let any busy thoughts run down that line. You can pick them up again later.',
    ],
  },
  {
    id: 'opening',
    title: 'Opening',
    minutes: 2,
    line: 'Soften your attention and become receptive.',
    lines: [
      'Let your breath find its own pace. There is nothing to get right.',
      'Soften your forehead, your jaw and the muscles around your eyes.',
      'Let your attention widen, as if listening to a room rather than to one sound.',
      'Say quietly to yourself: I am willing to notice what comes, and to record it honestly.',
      'Rest here for a few breaths, curious and unhurried.',
    ],
  },
  {
    id: 'third-eye',
    title: 'Third-eye visualisation',
    minutes: 3,
    line: 'A quiet image behind the brow.',
    lines: [
      'With your eyes closed, rest your attention at the point between your eyebrows.',
      'Imagine a small indigo light there, as steady as a candle in a still room.',
      'Let it grow a little with each in-breath, and soften with each out-breath.',
      'If images, colours or words drift across it, let them come and go without chasing them.',
      'Notice the dark behind your eyelids as a screen, waiting.',
      'When you are ready, let the light settle back to a small point.',
    ],
  },
  {
    id: 'aura',
    title: 'Aura sensing',
    minutes: 3,
    line: 'Feel the edge of your own energy field, as a modern practice describes it.',
    lines: [
      'Rub your palms together briskly for ten seconds, then hold them a hand-width apart.',
      'Slowly bring them closer and move them apart. Notice any warmth, pressure or tingling between them.',
      'That may be your circulation and your attention; either way it is a useful thing to notice.',
      'Now imagine a soft field around your whole body, an arm’s length wide.',
      'Sense whether it feels bright, dim, even or ragged today. Write nothing yet; just notice.',
    ],
  },
  {
    id: 'closing',
    title: 'Closing',
    minutes: 1,
    line: 'Come back, and let the work go.',
    lines: [
      'Let any images or sensations fade, thanking them if that feels right.',
      'Feel your hands, your feet, the weight of your body.',
      'Breathe in deeply, stretch, and open your eyes.',
      'Have something to drink, and write down anything you want to keep.',
    ],
  },
];

export const warmupOf = (id: unknown) => WARMUPS.find((w) => w.id === id) ?? null;

/** The minutes a chosen set of warm-ups takes. */
export const warmupMinutes = (ids: readonly string[]) => ids.reduce((n, id) => n + (warmupOf(id)?.minutes ?? 0), 0);
