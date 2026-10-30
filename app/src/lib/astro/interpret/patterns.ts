// Aspect patterns. Key: keys.pattern(name). Complete: every pattern the chart
// engine finds (lib/astro/aspects.ts PATTERN_NAMES).

import type { InterpretationTable } from './types.ts';

export const PATTERN_READINGS: InterpretationTable = {
  'grand-trine': {
    simple: 'Three planets in the same element, each 120° from the others: a closed circle of ease and natural talent in that element.',
    detailed:
      'A grand trine joins three planets in the three signs of one element, fire, earth, air or water. Energy flows round it without resistance, so it shows a gift that comes so naturally you may not notice it: inspiration in fire, practical skill in earth, ideas and social ease in air, feeling and intuition in water.\n\nThe classic caution is that a grand trine is self-contained. Because nothing pushes against it, it can make for comfort rather than achievement. Planets that square or oppose the trine (a kite, or a T-square elsewhere) are often what put the gift to work. Read the three planets for what the gift is about, and the houses for where it shows.',
    magic: 'A grand trine is a ready-made triangle of power: work it with three candles in a triangle, one for each planet, in the element\'s colours (red for fire, green for earth, yellow for air, blue for water). It is excellent for blessing others, since the energy circulates easily.',
    shadow: 'Complacency, and gifts left unused because they never had to be fought for.',
  },
  't-square': {
    simple: 'Two planets opposite each other, both square a third: a driving tension that pushes you to act, with the third planet as the outlet.',
    detailed:
      'A T-square is made of an opposition and two squares meeting at one planet, the apex. The opposed planets pull against each other and both press on the apex, which becomes the place where the tension is released: the area of life you keep returning to, and where you achieve most.\n\nThe empty point opposite the apex (the "missing leg") is often read as the key to balance: the sign and house there show what to develop to ease the pressure. T-squares are common in the charts of people who get things done; the energy is restless but productive. Note whether the planets are cardinal (crisis and action), fixed (endurance and stubbornness) or mutable (scattered, adaptable) signs.',
    magic: 'Treat the apex planet as the focus of your workings: its day, hour and correspondences turn the chart\'s pressure into power. A three-cornered working with the apex candle taller than the other two suits it, and so does building up the empty leg\'s sign with its element.',
    shadow: 'Stress, overwork and pushing through when the answer is to step back to the missing leg.',
  },
  'grand-cross': {
    simple: 'Four planets in a square, each opposite one and square two others: great strength under constant tension, often in one modality.',
    detailed:
      'A grand cross, or grand square, is two oppositions crossing at right angles, so four planets square one another all round. It usually falls in signs of one modality: cardinal (action and crisis), fixed (will and endurance) or mutable (adaptability and nerves).\n\nIt is a demanding pattern: pulled four ways at once, you may feel there is no easy direction. It is also a pattern of immense resilience and capacity; people with it often carry heavy loads well and achieve a great deal. The work is to move round the cross rather than being stuck at one arm, giving each planet its turn.',
    magic: 'Four is the number of the quarters: a grand cross loves circle work with each planet at a direction. Call each in turn, and balance them deliberately; it is a strong pattern for protection and grounding.',
    shadow: 'Feeling trapped or torn, and exhaustion from carrying too much.',
  },
  yod: {
    simple: 'Two planets sextile each other, both 150° from a third: the "finger of fate", a pointed sense of mission at the third planet.',
    detailed:
      'A yod is two planets in sextile, each making a quincunx (150°) to a third, the apex. The quincunxes join signs with nothing in common, so the apex planet feels awkward, special or constantly adjusting, and it becomes the focus of a sense of calling. Modern astrologers nicknamed it the finger of God or the finger of fate.\n\nThe sextile base gives skills and resources; the apex shows what they are for. Many people with a yod describe a life of course-corrections that eventually reveal a purpose. The point opposite the apex (the "reaction point") is often sensitive when transits touch it. Read it as vocation and adjustment, never doom.',
    magic: 'A yod suits divination about purpose and workings of dedication: the apex planet\'s correspondences are your strongest tools. Draw the yod as a long triangle and place your intention at its point.',
    shadow: 'A feeling of being out of step, and pressure to find "the" purpose all at once.',
  },
  kite: {
    simple: 'A grand trine with a fourth planet opposite one corner: the trine\'s natural gifts given a direction and a reason to use them.',
    detailed:
      'A kite is a grand trine plus a fourth planet that opposes one of its corners and sextiles the other two. The opposition supplies the tension the grand trine lacks, so its easy flow is pulled toward one point, the kite\'s tail (opposite the corner it faces).\n\nIt is read as one of the most productive patterns: talent plus motivation. The tail planet shows where the gifts are aimed; the corner opposite it shows the main resource. People with a kite often have a clear area in which they excel.',
    magic: 'Fly it like a kite: anchor your working on the tail planet and let the trine lift it. Four candles, the tail apart from the triangle, lit last.',
    shadow: 'Over-reliance on talent, if the tail\'s pull is ignored.',
  },
  stellium: {
    simple: 'Three or more planets in one sign or one house: a concentration of energy that makes that sign or area central to your life.',
    detailed:
      'A stellium gathers three or more planets in one sign or house. That sign\'s qualities, or that house\'s matters, become a theme you cannot avoid: everything you do passes through it. People often identify more with a stellium sign than with their Sun sign.\n\nThe gift is depth and focus; the care is imbalance, since other areas may be neglected. Look for the sign\'s ruler, which becomes very strong (it governs all those planets), and at how the stellium planets relate to each other: a mix of personal and outer planets reads differently from a group of personal ones.',
    magic: 'A stellium is a power base: work in its element and sign\'s season, with the ruler\'s day and hour. When the transiting Moon passes through it each month, your workings there are amplified.',
    shadow: 'Tunnel vision, and neglecting the rest of the chart.',
  },
};
