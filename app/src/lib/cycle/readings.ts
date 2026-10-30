// Cycle & Moon: today's exact reading. The inner season (by their cycle, or
// by the moon alone) read against the moon's exact phase: one of 4 × 8 = 32
// readings, each with a practice that opens something real in the app and a
// journaling prompt, plus the moon's phase name, how much of it is lit and
// how long until its next turn. Modern spiritual meaning-making, not biology.
// Pure.

import { moonState, upcomingPhases, PRINCIPAL_NAMES, type PhaseName } from '../moon.ts';
import type { PracticeLink } from './content.ts';
import { cycleDayOn, cycleStats, dayKey, daysBetween, MOON_SEASON, PHASE_NAMES, quarterOf, SEASON_NAMES } from './model.ts';
import type { CycleData, Season } from './types.ts';

export type MoonPhaseKey = 'new' | 'waxingCrescent' | 'firstQuarter' | 'waxingGibbous' | 'full' | 'waningGibbous' | 'lastQuarter' | 'waningCrescent';

export const MOON_PHASES: MoonPhaseKey[] = ['new', 'waxingCrescent', 'firstQuarter', 'waxingGibbous', 'full', 'waningGibbous', 'lastQuarter', 'waningCrescent'];

const PHASE_KEY: Record<PhaseName, MoonPhaseKey> = {
  'New Moon': 'new',
  'Waxing Crescent': 'waxingCrescent',
  'First Quarter': 'firstQuarter',
  'Waxing Gibbous': 'waxingGibbous',
  'Full Moon': 'full',
  'Waning Gibbous': 'waningGibbous',
  'Last Quarter': 'lastQuarter',
  'Waning Crescent': 'waningCrescent',
};

/** "waning gibbous moon", "first quarter moon", "new moon": for the middle of a sentence. */
export const MOON_PHASE_WORDS: Record<MoonPhaseKey, string> = {
  new: 'new moon',
  waxingCrescent: 'waxing crescent moon',
  firstQuarter: 'first quarter moon',
  waxingGibbous: 'waxing gibbous moon',
  full: 'full moon',
  waningGibbous: 'waning gibbous moon',
  lastQuarter: 'last quarter moon',
  waningCrescent: 'waning crescent moon',
};

export type Reading = {
  title: string;
  /** What the two together suggest. */
  line: string;
  /** Something to do, which the links open. */
  practice: string;
  links: PracticeLink[];
  prompt: string;
};

const premade = (id: string, label: string): PracticeLink => ({ kind: 'premade', id, label });
const library = (id: string, label: string): PracticeLink => ({ kind: 'library', id, label });
const spread = (id: string, label: string): PracticeLink => ({ kind: 'spread', id, label });

/** Every inner season under every phase of the moon. Every link names something the app has. */
export const READINGS: Record<Season, Record<MoonPhaseKey, Reading>> = {
  winter: {
    new: {
      title: 'The double dark',
      line: 'You are bleeding under the dark of the moon, both of you at the quietest point of the turn: a rare, deep time for rest, dreaming and listening rather than doing.',
      practice: 'Let the practice be stillness: lie down by a single candle, or keep a shadow page of whatever surfaces.',
      links: [premade('cosmic-dark-moon-rest-shadow', 'Dark Moon Rest and Shadow Pages'), spread('dream', 'The dream spread')],
      prompt: 'What does the quiet tell me when I stop filling it?',
    },
    waxingCrescent: {
      title: 'First light in the dark',
      line: 'Your bleed draws you down while the first sliver of moon grows: rest now, and let a small wish form without acting on it yet.',
      practice: 'Brew a calming cup and write one wish on a slip of paper, to keep until your inner spring.',
      links: [premade('kitchen-peace-tea', 'Chamomile and Lavender Peace Tea'), library('traditional:herb:chamomile', 'Chamomile')],
      prompt: 'What small wish is forming under the tiredness?',
    },
    firstQuarter: {
      title: 'Rest against the push',
      line: 'The moon is building and pressing outward while your body asks you to slow: honour the pull both ways by doing one essential thing and resting from the rest.',
      practice: 'Ground before anything else: hands on the floor, or a stone in your palm, breathing down into your belly.',
      links: [premade('kitchen-solitary-grounding-centering', 'Grounding and Centering Basics'), library('traditional:crystal:hematite', 'Hematite')],
      prompt: 'What is the one thing that truly needs me today, and what can wait?',
    },
    waxingGibbous: {
      title: 'Clear sight, low tide',
      line: 'The moon is nearly full while you are in your winter: your energy runs low, but your inner sight can be unusually clear. A time for gentle divination and noticing, not effort.',
      practice: 'Draw a single card and sit with it for a while before reaching for its meaning.',
      links: [spread('daily', 'One card for the day'), library('traditional:crystal:moonstone', 'Moonstone')],
      prompt: 'What do I already know that I haven’t said out loud?',
    },
    full: {
      title: 'Bleeding by moonlight',
      line: 'Bleeding under the full moon, the pattern some call the Red Moon: lit from outside while you turn within. Feelings and dreams can run vivid; let them come to the page.',
      practice: 'Tuck a dream pillow by your bed and keep a notebook beside it.',
      links: [premade('hedge-dream-pillow', 'Mugwort Dream Pillow & Dream Journal'), library('traditional:crystal:selenite', 'Selenite')],
      prompt: 'What did the bright night stir up in me?',
    },
    waningGibbous: {
      title: 'Pour it out',
      line: 'The moon has begun to wane and you are bleeding: both are letting go. A natural time to release what this cycle carried, gently and without forcing.',
      practice: 'A warm ritual bath with garden herbs, or simply washing slowly while you name what you’re setting down.',
      links: [premade('green-herbal-ritual-bath', 'Garden Herb Ritual Bath'), library('traditional:herb:lavender', 'Lavender')],
      prompt: 'What did this last cycle ask me to carry that I can set down now?',
    },
    lastQuarter: {
      title: 'Clear one corner',
      line: 'Half the moon is gone and your body is clearing: a time to tidy the inner and outer rooms, slowly, a little at a time, with no rush to finish.',
      practice: 'Sweep one doorway or one corner, with the thought that what’s done goes out with the dust.',
      links: [premade('kitchen-sweeping-out-the-old', 'Sweeping Out the Old'), library('traditional:crystal:smoky_quartz', 'Smoky Quartz')],
      prompt: 'Which corner of my life needs a slow, kind clearing?',
    },
    waningCrescent: {
      title: 'Into the last dark',
      line: 'Bleeding as the moon thins to its last sliver: the deepest stretch of winter, inside and out. Scrying, dreaming and silence suit it best.',
      practice: 'Scry in a dark bowl of water by one candle, for only as long as feels easy.',
      links: [premade('hedge-dark-bowl-scrying', 'Scrying in a Dark Bowl of Water'), library('traditional:crystal:obsidian', 'Obsidian')],
      prompt: 'What image keeps returning to me lately?',
    },
  },
  spring: {
    new: {
      title: 'Seeds at the new moon',
      line: 'Your energy is returning just as the moon begins again: one of the clearest times of the month for beginnings. Plant intentions now and let them grow with the moon.',
      practice: 'Write three seed intentions, each small enough to tend.',
      links: [premade('cosmic-new-moon-intentions', 'New Moon Seed Intentions'), spread('new-moon', 'The new moon spread')],
      prompt: 'What do I want to grow this month?',
    },
    waxingCrescent: {
      title: 'Both of you rising',
      line: 'Inner spring under a young, growing moon: curiosity and fresh energy, mirrored in the sky. Start the thing you’ve been circling.',
      practice: 'Begin a growing jar and add a little to it each day until the full moon.',
      links: [premade('cosmic-waxing-moon-growth-jar', 'Waxing Moon Growing Jar'), library('traditional:crystal:carnelian', 'Carnelian')],
      prompt: 'What have I been circling that I’m ready to start?',
    },
    firstQuarter: {
      title: 'The first real step',
      line: 'The first quarter is the moon’s moment of decision, and inner spring gives you the get-up-and-go: a good day to take the first real step on an intention.',
      practice: 'Charge a stone with one clear aim and carry it while you take that step.',
      links: [premade('crystal-programming-intention', 'Programming a Crystal'), library('traditional:crystal:clear_quartz', 'Clear Quartz')],
      prompt: 'What first step have I been putting off?',
    },
    waxingGibbous: {
      title: 'Learn and refine',
      line: 'The moon is swelling towards full and your mind is quick: a time for learning, planning and polishing what you’ve begun.',
      practice: 'Bless your desk or study corner and give an hour to learning something for your practice.',
      links: [premade('cosmic-wednesday-mercury-study', 'Wednesday Mercury Desk Blessing'), library('traditional:herb:rosemary', 'Rosemary')],
      prompt: 'What am I hungry to learn right now?',
    },
    full: {
      title: 'Light on a beginning',
      line: 'Inner spring under the full moon: a new beginning held in strong light. Charge your tools and intentions, and notice what the light shows about where you’re heading.',
      practice: 'Leave water or stones out to charge under the full moon.',
      links: [premade('cosmic-full-moon-charging-moon-water', 'Full Moon Charging and Moon Water'), library('traditional:crystal:citrine', 'Citrine')],
      prompt: 'What does the full moon show me about where I’m going?',
    },
    waningGibbous: {
      title: 'Pass it on',
      line: 'The moon is giving back its light while your energy keeps rising: a good time to teach, share, or write down something you’ve learned so it isn’t lost.',
      practice: 'Make a fresh page in your Book of Shadows, or tell a friend about something that’s been helping you.',
      links: [premade('kitchen-solitary-book-of-shadows-blessing', 'Making and Blessing a Book of Shadows'), library('traditional:herb:lemon_balm', 'Lemon Balm')],
      prompt: 'What have I learned that someone else might need?',
    },
    lastQuarter: {
      title: 'Make room',
      line: 'You feel ready to begin while the moon is clearing: sweep out what stands in the way, so the new has somewhere to go.',
      practice: 'A rosemary and lemon floor wash, or one drawer cleared and blessed.',
      links: [premade('kitchen-cleansing-floor-wash', 'Rosemary and Lemon Floor Wash'), library('traditional:herb:sage', 'Sage')],
      prompt: 'What’s in the way of what I’m starting?',
    },
    waningCrescent: {
      title: 'Plan, don’t launch',
      line: 'Your energy is rising but the moon is at its thinnest: plan now, gather what you need, and keep the first move for the new moon in a few days.',
      practice: 'Plan a working of your own: its aim, its timing and what you’ll need.',
      links: [premade('folk-build-your-own-ritual', 'Build Your Own Ritual'), spread('two-paths', 'The two paths spread')],
      prompt: 'If I begin at the new moon, what will I begin with?',
    },
  },
  summer: {
    new: {
      title: 'Your own light in the dark',
      line: 'Inner summer at the new moon: you may feel bright and outward while the sky is dark. Turn that warmth towards yourself; this week you are the light.',
      practice: 'A mirror working for the self you’re growing into.',
      links: [premade('kitchen-solitary-self-love-mirror', 'Self-Love Mirror Ritual'), library('traditional:crystal:rose_quartz', 'Rose Quartz')],
      prompt: 'What do I love about who I’m becoming?',
    },
    waxingCrescent: {
      title: 'Reach out',
      line: 'Your confidence is high and the moon is building: a good time to make contact, ask for what you want, or put your work in front of people.',
      practice: 'A warming courage brew before the conversation you’ve been meaning to have.',
      links: [premade('kitchen-courage-brew', 'Cinnamon-Ginger Courage Brew'), library('traditional:herb:cinnamon', 'Cinnamon')],
      prompt: 'Who would I reach out to today if I trusted my welcome?',
    },
    firstQuarter: {
      title: 'Speak up',
      line: 'Inner summer at the first quarter: drive, voice and momentum arrive together. Strong for workings of courage and success, and for saying the thing out loud.',
      practice: 'A small courage working, whichever day of the week it falls.',
      links: [premade('cosmic-tuesday-mars-courage', 'Tuesday Mars Spark'), library('traditional:crystal:garnet', 'Garnet')],
      prompt: 'Where do I need to speak up?',
    },
    waxingGibbous: {
      title: 'Magnetic',
      line: 'Inner summer under a swelling moon: an open, drawing-in time. Workings for love, friendship and welcoming good things are well placed.',
      practice: 'A rose bath for love of every kind, or a few petals offered with a wish.',
      links: [premade('cosmic-friday-venus-love', 'Friday Venus Rose Bath'), library('traditional:herb:rose', 'Rose')],
      prompt: 'What would I like to draw closer?',
    },
    full: {
      title: 'Full and bright',
      line: 'Inner summer under the full moon: the brightest point of both cycles at once. Celebrate, charge and gather; this is the season for ritual said out loud.',
      practice: 'Hold a full moon esbat, alone or with your coven, and make moon water.',
      links: [premade('wicca-full-moon-esbat', 'Full Moon Esbat'), premade('cosmic-full-moon-charging-moon-water', 'Full Moon Charging and Moon Water')],
      prompt: 'What is flowering in my life right now?',
    },
    waningGibbous: {
      title: 'Give thanks',
      line: 'The moon has started to wane while you’re still in full summer: thank what has grown before you begin to gather it in.',
      practice: 'A ritual of thanks, with an offering of something you made.',
      links: [premade('folk-gratitude-ritual', 'A Ritual of Thanks'), spread('full-moon', 'The full moon spread')],
      prompt: 'What am I grateful to myself for this cycle?',
    },
    lastQuarter: {
      title: 'Give, but choose where',
      line: 'You have plenty to give and the moon is turning towards release: give generously, but decide where. A good time to name what you’ll keep saying yes to.',
      practice: 'Lay boundary stones, or simply write two lists: my yeses and my noes.',
      links: [premade('cosmic-saturday-saturn-boundaries', 'Saturday Saturn Boundary Stones'), library('traditional:crystal:black_tourmaline', 'Black Tourmaline')],
      prompt: 'Where is my energy best spent this month?',
    },
    waningCrescent: {
      title: 'Bright before the dark',
      line: 'Inner summer under the last of the moon: warmth outside, quiet gathering within. Spend time with people you trust, then rest before the new moon.',
      practice: 'Bless a shared meal, or a pot of tea with a friend.',
      links: [premade('kitchen-family-meal-blessing', 'Blessing the Family Meal'), library('traditional:crystal:green_aventurine', 'Green Aventurine')],
      prompt: 'Who helps me feel most like myself?',
    },
  },
  autumn: {
    new: {
      title: 'Ward and cleanse',
      line: 'Inner autumn at the dark moon: you see plainly what isn’t working, and the sky is quiet enough to act on it. Cleanse the house and set a boundary.',
      practice: 'A salt-water cleansing of the house, or a shield of black tourmaline and obsidian by the door.',
      links: [premade('sea-seawater-cleansing', 'Sea Salt & Seawater House Cleansing'), premade('crystal-tourmaline-obsidian-shield', 'Black Tourmaline and Obsidian Shield')],
      prompt: 'What do I need protecting from right now?',
    },
    waxingCrescent: {
      title: 'Honest evening',
      line: 'Your honesty is sharp and the moon is only beginning to grow: use the clarity kindly, on yourself first. Write it out by candlelight.',
      practice: 'An evening reflection by candlelight; the shadow work spread if you want to go deeper.',
      links: [premade('kitchen-solitary-evening-reflection', 'Evening Reflection by Candlelight'), spread('shadow-work', 'The shadow work spread')],
      prompt: 'What truth am I ready to look at, gently?',
    },
    firstQuarter: {
      title: 'Choose what’s worth it',
      line: 'Inner autumn at the first quarter: your fire is up and the moon pushes for action. Spend it on something you truly mean to change, not on every irritation.',
      practice: 'A crossroads working for the choice you’ve been weighing.',
      links: [premade('hedge-crossroads-choice', 'Crossroads Working for a Choice'), spread('crossroads', 'The crossroads spread')],
      prompt: 'Which change is worth my energy?',
    },
    waxingGibbous: {
      title: 'Finish what matters',
      line: 'The moon swells while you turn inward: good for finishing, editing and tying off rather than starting. Close the loose ends before your winter.',
      practice: 'Tie nine knots in a cord, one for each thing you mean to finish.',
      links: [premade('folk-nine-knots', 'Nine Knots in a Cord'), library('traditional:herb:yarrow', 'Yarrow')],
      prompt: 'What do I want finished before my bleed?',
    },
    full: {
      title: 'Burn it bright, let it go',
      line: 'Inner autumn under the full moon: feelings run high and truths come into the light. Release in the light: write what you’re done with and burn it safely.',
      practice: 'A bonfire or candle-flame release.',
      links: [premade('green-fire-safe-bonfire-release', 'Fire: Bonfire Release'), library('traditional:crystal:obsidian', 'Obsidian')],
      prompt: 'What am I done with?',
    },
    waningGibbous: {
      title: 'Turning inward with the moon',
      line: 'Your body is turning inward as the moon wanes: a strong time for release, banishing, decluttering and honest journaling.',
      practice: 'Untie the knots of what you’re letting go, or bury something spent in the compost with thanks.',
      links: [premade('cosmic-waning-moon-release', 'Waning Moon Unknotting'), premade('green-composting-release-banishing', 'Composting as Release')],
      prompt: 'What would I like to clear before my winter?',
    },
    lastQuarter: {
      title: 'Untie and cut',
      line: 'Inner autumn at the last quarter: the strongest release of the month. Cut the cord to something that drains you, or loosen what binds.',
      practice: 'A cord cutting, done slowly and with care for yourself afterwards.',
      links: [premade('folk-cord-cutting', 'Cord Cutting'), library('traditional:herb:sage', 'Sage')],
      prompt: 'What tie is ready to be cut?',
    },
    waningCrescent: {
      title: 'Soften towards winter',
      line: 'Your bleed is near and the moon is almost dark: both cycles are heading into rest. Slow down, lower the bar, and make yourself a soft landing.',
      practice: 'An amethyst and lavender sleep sachet, and an early night.',
      links: [premade('crystal-amethyst-sleep-sachet', 'Amethyst and Lavender Sleep Sachet'), library('traditional:crystal:amethyst', 'Amethyst')],
      prompt: 'How can I make my winter gentler this time?',
    },
  },
};

export const readingFor = (season: Season, phase: MoonPhaseKey): Reading => READINGS[season][phase];

export type ExactReading = {
  /** The cycle day, or null when the moon alone gives the season. */
  cycleDay: number | null;
  season: Season;
  byMoon: boolean;
  moon: {
    name: PhaseName;
    key: MoonPhaseKey;
    /** Percent of the disc lit, 0 to 100. */
    illumination: number;
    /** The next principal phase and how many days until it (0 today, 1 tomorrow). */
    next: { name: PhaseName; days: number };
  };
  /** "Cycle day 18 · inner autumn (luteal) · waning gibbous moon". */
  headline: string;
  /** "Waning gibbous, 87% lit · last quarter in 3 days". */
  moonLine: string;
  reading: Reading;
};

const inDays = (n: number) => (n <= 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`);

/** Today's reading: their inner season, the moon's exact phase, and what the two together suggest. */
export function exactReading(data: CycleData, now: Date): ExactReading {
  const today = dayKey(now);
  const state = moonState(now);
  const key = PHASE_KEY[state.name];
  const c = data.settings.mode === 'cycle' ? cycleDayOn(data, today, cycleStats(data)) : null;
  const season = c ? c.season : MOON_SEASON[quarterOf(state.fraction)];
  // Within a day of a principal phase the moon is already called by it, so the next turn is the one after.
  const [soon, after] = upcomingPhases(now, 2);
  const upcoming = PRINCIPAL_NAMES[soon.phase] === state.name ? after : soon;
  const next = { name: PRINCIPAL_NAMES[upcoming.phase], days: Math.max(0, daysBetween(today, dayKey(upcoming.date))) };
  const moonWords = MOON_PHASE_WORDS[key];
  const headline = c ? `Cycle day ${c.day} · ${SEASON_NAMES[season]} (${PHASE_NAMES[season]}) · ${moonWords}` : `${SEASON_NAMES[season].charAt(0).toUpperCase()}${SEASON_NAMES[season].slice(1)} by the moon · ${moonWords}`;
  const illumination = Math.round(state.illumination * 100);
  return {
    cycleDay: c ? c.day : null,
    season,
    byMoon: !c,
    moon: { name: state.name, key, illumination, next },
    headline,
    moonLine: `${state.name}, ${illumination}% lit · ${next.name.toLowerCase()} ${inDays(next.days)}`,
    reading: READINGS[season][key],
  };
}
