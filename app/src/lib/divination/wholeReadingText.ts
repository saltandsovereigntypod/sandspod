// The words behind "The whole reading": topic cues, lenses and phrasings.
// Pure data. A modern, plain-language way of reading; not a historical rule.

export type Topic = 'love' | 'money' | 'health' | 'home' | 'spirit' | 'decision' | 'person' | 'timing' | 'general';
export type LensGroup = 'major' | 'Cups' | 'Wands' | 'Swords' | 'Pentacles';

/** Checked in this order; the first topic with a match wins. */
export const TOPIC_CUES: { topic: Exclude<Topic, 'general'>; re: RegExp }[] = [
  { topic: 'love', re: /\b(love|loves|loved|lover|romance|romantic|relationship|relationships|partner|dating|date|marriage|marry|crush|soulmate|heart|affair)\b/i },
  { topic: 'money', re: /\b(money|job|work|career|income|salary|pay|debt|business|finance|finances|financial|rent|savings|afford|promotion|boss|client|clients|profession)\b/i },
  { topic: 'health', re: /\b(health|healing|heal|body|sleep|tired|energy|rest|illness|ill|pain|stress|anxiety|wellbeing|well-being|recovery|recover|diet|fitness)\b/i },
  { topic: 'home', re: /\b(home|house|family|mother|father|mum|mom|dad|parent|parents|child|children|kids|sister|brother|move|moving|flat|household|roots|ancestors)\b/i },
  { topic: 'spirit', re: /\b(spirit|spiritual|path|magic|magick|spell|ritual|practice|craft|witch|witchcraft|deity|goddess|god|gods|calling|purpose|meaning|intuition|psychic)\b/i },
  { topic: 'decision', re: /\b(or|should|shall|which|whether|choose|choice|decide|decision|option|options)\b/i },
  { topic: 'person', re: /\b(he|she|they|them|him|her|his|their|ex|friend|colleague|someone|person)\b/i },
  { topic: 'timing', re: /\b(when|how long|soon|timing|time|until|by when)\b/i },
];

export const TOPIC_NAME: Record<Topic, string> = {
  love: 'love and relationships',
  money: 'money and work',
  health: 'health and the body',
  home: 'home and family',
  spirit: 'your spiritual path',
  decision: 'a decision',
  person: 'another person',
  timing: 'timing',
  general: 'your situation in general',
};

/** One short clause per topic and suit (or Major Arcana), carried into each card's paragraph. */
export const LENS: Record<Topic, Record<LensGroup, string>> = {
  love: {
    major: 'in love, this is a large, defining matter of the heart',
    Cups: 'in love, this is the heart speaking most plainly',
    Wands: 'in love, this brings heat, attraction and the pull to act',
    Swords: 'in love, this is about what is said, thought and left unsaid between you',
    Pentacles: 'in love, this asks what steadiness and real care look like day to day',
  },
  money: {
    major: 'for work and money, this is bigger than the practical details',
    Cups: 'for work and money, this asks what you actually want from it, not only what pays',
    Wands: 'for work and money, this is ambition, drive and where to put your effort',
    Swords: 'for work and money, this is about plans, contracts, and clear thinking',
    Pentacles: 'for work and money, this is the practical ground: earning, saving and building',
  },
  health: {
    major: 'for the body, this reads as a whole-life theme, not one symptom',
    Cups: 'for the body, this speaks of feeling, mood and what your emotions are carrying',
    Wands: 'for the body, this is energy, vitality and how much you are spending',
    Swords: 'for the body, this is the mind at work: worry, rest and what you tell yourself',
    Pentacles: 'for the body, this is the physical routine: food, sleep and ordinary care',
  },
  home: {
    major: 'for home and family, this is a deep, long-running pattern',
    Cups: 'for home and family, this is the emotional weather of the household',
    Wands: 'for home and family, this is movement, change and who takes the lead',
    Swords: 'for home and family, this is what is said, argued or needs saying plainly',
    Pentacles: 'for home and family, this is the house itself, its money and its upkeep',
  },
  spirit: {
    major: 'on your path, this is a teaching larger than any one practice',
    Cups: 'on your path, this is intuition, dreams and what you feel drawn towards',
    Wands: 'on your path, this is will and the fire to practise',
    Swords: 'on your path, this is study, discernment and honest questioning',
    Pentacles: 'on your path, this is the embodied side: tools, routine and the earth',
  },
  decision: {
    major: 'as a choice, this weighs heavily; it touches more than the immediate matter',
    Cups: 'as a choice, this asks what your heart would choose if no one were watching',
    Wands: 'as a choice, this leans towards the option with energy and momentum',
    Swords: 'as a choice, this asks you to think it through and name the real trade-offs',
    Pentacles: 'as a choice, this asks which option is practical and can be sustained',
  },
  person: {
    major: 'about them, this suggests something larger than a passing mood',
    Cups: 'about them, this is their feeling, as far as the cards can say',
    Wands: 'about them, this is their drive and what they are chasing',
    Swords: 'about them, this is their thinking and how they speak',
    Pentacles: 'about them, this is their circumstances and what they can reliably give',
  },
  timing: {
    major: 'on timing, this is a turning point rather than a date',
    Cups: 'on timing, this moves at the pace of feeling, often slowly',
    Wands: 'on timing, this tends to move fast',
    Swords: 'on timing, this can arrive suddenly, or stall until something is said',
    Pentacles: 'on timing, this builds slowly and steadily',
  },
  general: {
    major: 'in the wider picture, this is a significant theme',
    Cups: 'in the wider picture, this is about feeling and connection',
    Wands: 'in the wider picture, this is about drive and action',
    Swords: 'in the wider picture, this is about thought, truth and conflict',
    Pentacles: 'in the wider picture, this is about the practical and material',
  },
};

/** Phrasings for each card's first sentence. No two share their first words, so a reading never repeats an opener. */
export const OPENERS: ((p: string, a: string, c: string, k: string) => string)[] = [
  (p, a, c, k) => `In ${p} (${a}), ${c} speaks of ${k}.`,
  (p, a, c, k) => `Standing for ${a}, ${p} shows ${c}, which brings ${k}.`,
  (p, a, c, k) => `${p} (${a}) is held by ${c}: ${k}.`,
  (p, a, c, k) => `Here, in ${p}, ${c} arrives with ${k}.`,
  (p, a, c, k) => `Looking at ${p} (${a}), ${c} points to ${k}.`,
  (p, a, c, k) => `Next comes ${p}, which is ${a}. ${c} is here for ${k}.`,
  (p, a, c, k) => `For ${p} (${a}), the card is ${c}, carrying ${k}.`,
  (p, a, c, k) => `Moving on to ${p} (${a}), ${c} brings ${k}.`,
  (p, a, c, k) => `Under ${p} (${a}) sits ${c}, a card of ${k}.`,
  (p, a, c, k) => `Turning to ${p} (${a}), you find ${c} and its ${k}.`,
  (p, a, c, k) => `As for ${p} (${a}), ${c} answers with ${k}.`,
  (p, a, c, k) => `Then there is ${p} (${a}), where ${c} stands for ${k}.`,
  (p, a, c, k) => `Over in ${p} (${a}), ${c} offers ${k}.`,
  (p, a, c, k) => `Finally, or nearly, ${p} (${a}) gives ${c}, with ${k}.`,
];

export const ELEMENT: Record<Exclude<LensGroup, 'major'>, { word: string; theme: string; absent: string }> = {
  Cups: { word: 'water', theme: 'feeling, relationships and intuition', absent: 'feeling and connection have little voice here, so it may be worth asking how you really feel' },
  Wands: { word: 'fire', theme: 'drive, desire and action', absent: 'little fire here: motivation and initiative may be low, or not the point just now' },
  Swords: { word: 'air', theme: 'thought, truth and conflict', absent: 'little air here: the matter may not need more analysis, or the plain truth is not yet being faced' },
  Pentacles: { word: 'earth', theme: 'the material, the body and the practical', absent: 'little earth here: practical matters are not the centre of this, or are being overlooked' },
};

export const NUMBER_THEME: Record<number, string> = {
  1: 'beginnings and seeds',
  2: 'choice, balance and partnership',
  3: 'growth and first results',
  4: 'stability, and sometimes stagnation',
  5: 'conflict, loss and change',
  6: 'harmony and passing through difficulty',
  7: 'testing, patience and assessment',
  8: 'movement, mastery and effort',
  9: 'near-completion and what it has taken',
  10: 'completion and the end of a cycle',
};

export const COURT_TITLE: Record<string, string> = {
  Page: 'a messenger or newcomer',
  Knight: 'someone in motion, or a pursuit',
  Queen: 'a nurturing, inward authority',
  King: 'a settled, outward authority',
};

/** Pairings worth a line; order does not matter. */
export const PAIRINGS: { a: string; b: string; line: string }[] = [
  { a: 'The Tower', b: 'The Star', line: 'The Tower with The Star: after the collapse comes hope.' },
  { a: 'Death', b: 'The Sun', line: 'Death with The Sun: an ending that clears the way for joy.' },
  { a: 'The Lovers', b: 'The Devil', line: 'The Lovers with The Devil: a bond that asks whether it is chosen or clung to.' },
  { a: 'The Moon', b: 'The Sun', line: 'The Moon with The Sun: confusion lifting into clarity.' },
  { a: 'The Hermit', b: 'The Hanged Man', line: 'The Hermit with The Hanged Man: a time for withdrawing and seeing differently.' },
  { a: 'The Fool', b: 'The World', line: 'The Fool with The World: the end of one journey and the start of another.' },
  { a: 'Justice', b: 'Judgement', line: 'Justice with Judgement: a reckoning, and a call to answer honestly.' },
  { a: 'Wheel of Fortune', b: 'The Tower', line: 'Wheel of Fortune with The Tower: change that is not in your hands.' },
];
