// Numerology: the core numbers of a name and a birth date, in the
// Pythagorean system (A–I as 1–9, round again) and the Chaldean (Cheiro’s
// table, 1–8, no 9), with the master numbers 11, 22 and 33 kept where they
// fall, and the personal year, month and day for timing. Meanings are
// written to be read, not just looked up, and each number's planet (as the
// Chaldean tradition gives it) leads to its planetary hours.
//
// Pure, so it can be tested and shared with the website (js/core/spirit.js).

export type System = 'pythagorean' | 'chaldean';

export const SYSTEMS: { id: System; label: string; about: string }[] = [
  { id: 'pythagorean', label: 'Pythagorean', about: 'The usual modern system: A to I are 1 to 9, J starts again at 1. Life path and the name numbers are read this way in most books today.' },
  { id: 'chaldean', label: 'Chaldean', about: 'Letters are valued 1 to 8 by sound rather than order, and 9 is held back as sacred. Its followers read the name you are known by, and keep the compound total before it is reduced.' },
];

const PYTH: Record<string, number> = {};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((ch, i) => (PYTH[ch] = (i % 9) + 1));

// Cheiro’s table (Cheiro’s Book of Numbers, 1926).
const CHALD: Record<string, number> = {};
for (const [n, letters] of [
  [1, 'AIJQY'],
  [2, 'BKR'],
  [3, 'CGLS'],
  [4, 'DMT'],
  [5, 'EHNX'],
  [6, 'UVW'],
  [7, 'OZ'],
  [8, 'FP'],
] as [number, string][])
  for (const ch of letters) CHALD[ch] = n;

export const MASTERS = [11, 22, 33];

/** Letters only, accents taken off: "Siân O’Neill" → "SIANONEILL". */
export const lettersOf = (name: string) =>
  String(name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');

export const letterValue = (ch: string, system: System) => (system === 'chaldean' ? CHALD[ch] : PYTH[ch]) ?? 0;

const digitSum = (n: number) =>
  String(Math.abs(Math.round(n)))
    .split('')
    .reduce((s, d) => s + Number(d), 0);

/** Add digits until one is left, stopping at a master number when `masters` is on. */
export function reduce(n: number, masters = true): number {
  let v = Math.abs(Math.round(n));
  while (v > 9 && !(masters && MASTERS.includes(v))) v = digitSum(v);
  return v;
}

export type Birth = { year: number; month: number; day: number };

export type Reading = { number: number; compound: number; steps: string };

/**
 * Life path: month, day and year each reduced first, then added and reduced
 * (the usual method, which keeps masters hidden in the parts from being lost).
 */
export function lifePath(b: Birth): Reading {
  const m = reduce(b.month);
  const d = reduce(b.day);
  const y = reduce(b.year);
  const compound = m + d + y;
  const number = reduce(compound);
  return { number, compound, steps: `${b.month} → ${m}, ${b.day} → ${d}, ${b.year} → ${y}; ${m} + ${d} + ${y} = ${compound}${compound !== number ? ` → ${number}` : ''}` };
}

export const birthdayNumber = (b: Birth): Reading => ({ number: reduce(b.day), compound: b.day, steps: b.day > 9 && reduce(b.day) !== b.day ? `${b.day} → ${reduce(b.day)}` : String(b.day) });

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

/** Whether each letter is sounded as a vowel. Y is, when no vowel stands beside it ("Lynn", "Mary"), as most books count it. */
export function vowelMask(letters: string): boolean[] {
  return [...letters].map((ch, i) => {
    if (VOWELS.has(ch)) return true;
    if (ch !== 'Y') return false;
    return !VOWELS.has(letters[i - 1] ?? '') && !VOWELS.has(letters[i + 1] ?? '');
  });
}

function nameReading(letters: string, system: System, keep: (isVowel: boolean) => boolean): Reading {
  const mask = vowelMask(letters);
  const values = [...letters].map((ch, i) => (keep(mask[i]) ? letterValue(ch, system) : 0)).filter((v) => v > 0);
  const compound = values.reduce((s, v) => s + v, 0);
  const number = reduce(compound);
  return { number, compound, steps: values.length ? `${values.join(' + ')} = ${compound}${compound !== number ? ` → ${number}` : ''}` : '' };
}

/** Expression (destiny): every letter of the full name. */
export const expression = (name: string, system: System) => nameReading(lettersOf(name), system, () => true);
/** Soul urge (heart's desire): the vowels. */
export const soulUrge = (name: string, system: System) => nameReading(lettersOf(name), system, (v) => v);
/** Personality: the consonants. */
export const personality = (name: string, system: System) => nameReading(lettersOf(name), system, (v) => !v);

/** Personal year: your birth month and day with this year. Reduced to 1–9 (cycles run in nines). */
export function personalYear(b: Pick<Birth, 'month' | 'day'>, year: number): number {
  return reduce(reduce(b.month, false) + reduce(b.day, false) + reduce(year, false), false);
}
export const personalMonth = (b: Pick<Birth, 'month' | 'day'>, year: number, month: number) => reduce(personalYear(b, year) + reduce(month, false), false);
export const personalDay = (b: Pick<Birth, 'month' | 'day'>, date: Date) =>
  reduce(personalMonth(b, date.getFullYear(), date.getMonth() + 1) + reduce(date.getDate(), false), false);

/** The planet the Chaldean tradition gives each number, and the hour planet to time by (none for 4 and 7). */
export const NUMBER_PLANETS: Record<number, { planet: string; hour: 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | null; note?: string }> = {
  1: { planet: 'the Sun', hour: 'Sun' },
  2: { planet: 'the Moon', hour: 'Moon' },
  3: { planet: 'Jupiter', hour: 'Jupiter' },
  4: { planet: 'Uranus (Cheiro), or Rahu, the moon’s north node, in Indian numerology', hour: null, note: 'Neither has a planetary hour; Saturn’s hours suit its steady building.' },
  5: { planet: 'Mercury', hour: 'Mercury' },
  6: { planet: 'Venus', hour: 'Venus' },
  7: { planet: 'Neptune (Cheiro), or Ketu, the moon’s south node, in Indian numerology', hour: null, note: 'Neither has a planetary hour; the Moon’s hours suit its inward work.' },
  8: { planet: 'Saturn', hour: 'Saturn' },
  9: { planet: 'Mars', hour: 'Mars' },
};

/** The hour planet to time a number's work by: its own, or the stand-in for 4 and 7. Masters time by their root. */
export function hourFor(n: number): 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' {
  const root = reduce(n, false);
  return NUMBER_PLANETS[root]?.hour ?? (root === 4 ? 'Saturn' : 'Moon');
}

export type Meaning = { n: number; title: string; keywords: string; essay: string[]; shadow: string; work: string; year: string; day: string };

export const MEANINGS: Record<number, Meaning> = {
  1: {
    n: 1,
    title: 'The beginner',
    keywords: 'Will, independence, initiative, the self',
    essay: [
      'One is the first mark on an empty page: the point from which everything else is counted. People strong in one tend to start things, to go first, and to find it hard to wait for permission. Their gift is the courage to stand alone long enough for something new to exist.',
      'The lesson of one is that independence isn’t isolation. A one at their best leads by going ahead and leaving the gate open behind them.',
    ],
    shadow: 'Stubbornness, impatience, the lonely pride of never asking for help.',
    work: 'Beginnings, self-confidence, courage, a new venture or a fresh start. The Sun’s hour on a Sunday is its natural time.',
    year: 'A year of seeds: start the thing. What you begin now sets the tone for the nine years to come.',
    day: 'Begin something, speak first, act on your own judgement.',
  },
  2: {
    n: 2,
    title: 'The partner',
    keywords: 'Cooperation, sensitivity, balance, listening',
    essay: [
      'Two is the first relationship: one and another, and the space between them. Twos feel the room before they enter it. They mediate, notice, soothe; much of their strength is invisible because it is the strength of making things go well.',
      'Its lesson is to give their own voice the same care they give everyone else’s.',
    ],
    shadow: 'Over-sensitivity, people-pleasing, losing yourself in others’ needs.',
    work: 'Love, reconciliation, intuition, dreams and anything that asks patience. The Moon’s hours, Mondays.',
    year: 'A slow, patient year after last year’s start: partnerships, details, waiting well.',
    day: 'Listen more than you speak; mend, cooperate, be gentle with timing.',
  },
  3: {
    n: 3,
    title: 'The maker',
    keywords: 'Expression, joy, creativity, words',
    essay: [
      'Three is what one and two make together: the child, the song, the story. Threes need to express what’s in them, in words, art, humour or company, and they lighten rooms.',
      'The lesson of three is depth: to finish things, and to let joy be serious as well as bright.',
    ],
    shadow: 'Scattered energy, gossip, the brightness that hides a heavier feeling.',
    work: 'Creativity, good fortune, celebration, writing and speaking. Jupiter’s hours, Thursdays.',
    year: 'A sociable, expressive year: make things, say things, enjoy people.',
    day: 'Write, create, call a friend, laugh about something.',
  },
  4: {
    n: 4,
    title: 'The builder',
    keywords: 'Foundation, order, work, the earth',
    essay: [
      'Four is the square: four walls, four corners, four directions and seasons. Fours build what lasts, steadily, by turning up. They are the people who know where things are kept.',
      'Its lesson is flexibility: a foundation exists to hold a life up, not to wall it in.',
    ],
    shadow: 'Rigidity, overwork, mistaking control for safety.',
    work: 'Protection, stability, home, money kept and grown slowly, binding and boundaries. No planetary hour of its own: Saturn’s steady hours serve it.',
    year: 'A working year: lay foundations, get organised, mend the roof.',
    day: 'Put things in order; do the dull task that makes the rest possible.',
  },
  5: {
    n: 5,
    title: 'The traveller',
    keywords: 'Freedom, change, the senses, curiosity',
    essay: [
      'Five sits in the middle of the nine, looking both ways. Fives want to taste everything, go everywhere, learn by doing; they thrive on change that would exhaust others.',
      'The lesson of five is to choose: freedom used well becomes experience, not just restlessness.',
    ],
    shadow: 'Restlessness, excess, leaving before things can deepen.',
    work: 'Travel, communication, quick changes, study, trade and luck in motion. Mercury’s hours, Wednesdays.',
    year: 'A year of change and movement: say yes to what’s new, but not to everything.',
    day: 'Go somewhere different, try a new thing, adapt.',
  },
  6: {
    n: 6,
    title: 'The keeper',
    keywords: 'Love, home, responsibility, beauty',
    essay: [
      'Six is the hearth number: family, care, the home kept beautiful and the people in it fed. Sixes take responsibility naturally and often for everyone; they know how to make a place feel loved.',
      'Its lesson is that caring for others includes letting them care for themselves.',
    ],
    shadow: 'Martyrdom, meddling, perfectionism about how love should look.',
    work: 'Love, friendship, harmony at home, beauty and healing. Venus’s hours, Fridays.',
    year: 'A home year: family, commitments, care, love given and received.',
    day: 'Tend your home and your people; make something beautiful.',
  },
  7: {
    n: 7,
    title: 'The seeker',
    keywords: 'Wisdom, solitude, study, the inner life',
    essay: [
      'Seven has long been a holy number: seven old planets, seven days, the seventh son. Sevens seek beneath the surface; they need time alone to think, and they trust what they’ve tested more than what they’ve been told.',
      'The lesson of seven is to come back from the mountain and share what was found.',
    ],
    shadow: 'Aloofness, suspicion, retreating into the head.',
    work: 'Divination, study, meditation, dreams and spirit work. No planetary hour of its own: the Moon’s hours serve its inward work.',
    year: 'An inward year: study, rest, reflect, deepen your practice.',
    day: 'Spend time alone; read, meditate, draw a card.',
  },
  8: {
    n: 8,
    title: 'The steward',
    keywords: 'Power, material mastery, authority, karma',
    essay: [
      'Eight is two squares, matter doubled: money, work, power and the handling of them. Eights carry weight and are drawn to build and run things. Turned on its side, the eight is the sign of infinity; old readers saw in it the balance of what is given and what comes back.',
      'Its lesson is that power is a trust, not a possession.',
    ],
    shadow: 'Ruthlessness, materialism, work that swallows life.',
    work: 'Money, career, justice, long-term success, and binding work with care. Saturn’s hours, Saturdays.',
    year: 'A harvest year for effort: money, recognition, responsibility.',
    day: 'Deal with money, decisions and authority; be fair.',
  },
  9: {
    n: 9,
    title: 'The elder',
    keywords: 'Completion, compassion, release, the whole',
    essay: [
      'Nine is the last single number, holding all the others; multiply anything by nine and its digits add back to nine. Nines see the whole picture and tend towards service, art and the wide view.',
      'The lesson of nine is letting go: of what is finished, of grievance, of the need to have it all resolved.',
    ],
    shadow: 'Self-sacrifice, holding on to the past, grief that won’t move.',
    work: 'Endings, release, courage and protection, cutting cords. Mars’s hours, Tuesdays.',
    year: 'An ending year: finish, clear, forgive, make room for next year’s one.',
    day: 'Finish something; give something away; let something go.',
  },
  11: {
    n: 11,
    title: 'The intuitive (master 11)',
    keywords: 'Inspiration, insight, sensitivity heightened',
    essay: [
      'Eleven is two ones side by side: the beginner doubled into a doorway. In twentieth-century numerology it is the first master number, read as a two (1 + 1) with its sensitivity raised to inspiration. Elevens often feel things before they can explain them.',
      'Its lesson is grounding: inspiration needs a body, sleep and ordinary days to come through clearly.',
    ],
    shadow: 'Nervous tension, overwhelm, doubting the gift.',
    work: 'Intuition, divination, inspiration, teaching. Time it as a two, by the Moon’s hours.',
    year: 'Personal years are reduced to nine, so 11 shows as 2.',
    day: '',
  },
  22: {
    n: 22,
    title: 'The master builder (22)',
    keywords: 'Vision made real, large work, service',
    essay: [
      'Twenty-two is the four with its dream made large: the builder who can see a cathedral in a quarry. Read as a four (2 + 2), it carries vision and practicality together, and with them the weight of large responsibilities.',
      'Its lesson is patience with scale: big things are built a stone at a time.',
    ],
    shadow: 'Pressure, overreach, the fear of not living up to it.',
    work: 'Large, long-term workings; building community; making a vision practical. Time it as a four, by Saturn’s hours.',
    year: 'Personal years are reduced to nine, so 22 shows as 4.',
    day: '',
  },
  33: {
    n: 33,
    title: 'The master teacher (33)',
    keywords: 'Compassion, healing, care given widely',
    essay: [
      'Thirty-three is the six raised: the keeper whose home is wide. It is the rarest master number in a life path, and many numerologists keep it only when it comes from the total itself. Read as a six (3 + 3), it speaks of healing, teaching and care beyond one household.',
      'Its lesson is limits: even the widest heart needs rest.',
    ],
    shadow: 'Burnout, carrying everyone, losing yourself in service.',
    work: 'Healing, blessing, teaching, community care. Time it as a six, by Venus’s hours.',
    year: 'Personal years are reduced to nine, so 33 shows as 6.',
    day: '',
  },
};

/** The meaning for a number; a master's own, or the root's. */
export const meaningOf = (n: number): Meaning => MEANINGS[n] ?? MEANINGS[reduce(n, false)] ?? MEANINGS[9];

export type Core = { lifePath: Reading; birthday: Reading; expression: Reading; soulUrge: Reading; personality: Reading; personalYear: number; personalMonth: number; personalDay: number };

export function coreNumbers(name: string, birth: Birth | null, system: System, now: Date): Core | null {
  if (!birth) return null;
  return {
    lifePath: lifePath(birth),
    birthday: birthdayNumber(birth),
    expression: expression(name, system),
    soulUrge: soulUrge(name, system),
    personality: personality(name, system),
    personalYear: personalYear(birth, now.getFullYear()),
    personalMonth: personalMonth(birth, now.getFullYear(), now.getMonth() + 1),
    personalDay: personalDay(birth, now),
  };
}

/** Read typed day, month and year into a birth date, or null. */
export function readBirth(day: string, month: string, year: string): Birth | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y) || y < 1 || y > 9999 || m < 1 || m > 12 || d < 1) return null;
  if (d > new Date(y, m, 0).getDate()) return null;
  return { year: y, month: m, day: d };
}

export const NUMBER_ROLES: { key: 'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'birthday'; label: string; line: string }[] = [
  { key: 'lifePath', label: 'Life path', line: 'From your birth date: the road you walk and what it teaches.' },
  { key: 'expression', label: 'Expression', line: 'From every letter of your name: your gifts and how you show them.' },
  { key: 'soulUrge', label: 'Soul urge', line: 'From the vowels: what you want, under everything.' },
  { key: 'personality', label: 'Personality', line: 'From the consonants: how others first meet you.' },
  { key: 'birthday', label: 'Birthday', line: 'From the day of the month: a particular gift you brought.' },
];

export const NUMEROLOGY_ORIGINS = [
  'Pythagoras and his followers taught that number underlies the order of the world, but he left no writings, and nothing survives of a Pythagorean method for names or birthdays. The letters-as-numbers idea itself is ancient: Greek isopsephy and Hebrew gematria gave every letter a value, and names were added up to compare them.',
  'The system called “Pythagorean” today is modern. It took shape in America in the early twentieth century, largely through L. Dow Balliett’s books (from 1903) and later Juno Jordan; the life path, soul urge and master numbers come from that school.',
  'The “Chaldean” system owes its name and table mostly to Cheiro (William John Warner), in Cheiro’s Book of Numbers (1926). There is no evidence it comes from ancient Chaldea; the planets it gives the numbers, 4 to Uranus and 7 to Neptune, could not be older than those planets’ discovery (1781 and 1846). Indian numerology gives 4 and 7 to Rahu and Ketu instead.',
  'Use it as a mirror for reflection and as a way to choose a time, the way the rest of this app offers astrology: something to think with, not a verdict.',
];
