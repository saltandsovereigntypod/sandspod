// The words for "How your charts meet": compact, warm and open-ended. Charts
// describe tendencies and invitations, never verdicts. Pure data.

export type RelType = 'romantic' | 'friendship' | 'family' | 'coven';
export type Family = 'harm' | 'hard' | 'conj';
export type Planet8 = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Ascendant';

export const REL_TYPES: { key: RelType; label: string; blurb: string }[] = [
  { key: 'romantic', label: 'Romantic', blurb: 'Attraction, affection and how you share a life.' },
  { key: 'friendship', label: 'Friendship', blurb: 'Ease, conversation and shared interests.' },
  { key: 'family', label: 'Family', blurb: 'Belonging, care and old patterns.' },
  { key: 'coven', label: 'Coven or working partners', blurb: 'How you work, hold space and balance each other.' },
];

/** The planets each kind of bond leans on. */
export const TYPE_FOCUS: Record<RelType, Planet8[]> = {
  romantic: ['Venus', 'Mars', 'Moon', 'Sun', 'Ascendant'],
  friendship: ['Moon', 'Mercury', 'Jupiter'],
  family: ['Moon', 'Saturn'],
  coven: ['Saturn', 'Jupiter'],
};

export type GroupKey = 'flows' | 'grow' | 'talk' | 'bring' | 'watch';
export const GROUP_TITLE: Record<GroupKey, string> = {
  flows: 'Where it flows',
  grow: 'Where you’ll grow each other',
  talk: 'How you talk',
  bring: 'What you each bring',
  watch: 'Watch for',
};
export const GROUP_ORDER: Record<RelType, GroupKey[]> = {
  romantic: ['flows', 'grow', 'talk', 'bring', 'watch'],
  friendship: ['talk', 'flows', 'bring', 'grow', 'watch'],
  family: ['grow', 'flows', 'talk', 'bring', 'watch'],
  coven: ['bring', 'grow', 'flows', 'talk', 'watch'],
};

export const FEEL: Record<Planet8, string> = {
  Sun: 'core self and vitality',
  Moon: 'feelings and need for safety',
  Mercury: 'way of thinking and speaking',
  Venus: 'affection and what is valued',
  Mars: 'drive and desire',
  Jupiter: 'generosity and hope',
  Saturn: 'steadiness and limits',
  Ascendant: 'first impression and manner',
};

const GENERIC: Record<Family, string> = {
  harm: 'meet kindly: each tends to support what the other is doing, so it can feel easy, and may be taken for granted.',
  hard: 'rub against each other. It can feel like friction, and it is also where each of you is asked to stretch.',
  conj: 'sit close together, so you may recognise each other here, for better and for intensity.',
};

/** Specific lines for the pairs that matter most (key: the two planets in alphabetical order). */
export const PAIR_LINES: Record<string, Record<Family, string>> = {
  'Moon|Sun': { harm: 'Your needs and your sense of purpose fit well; one feels nourished by the other.', hard: 'What one wants to do and what the other needs to feel can pull apart. Naming it helps.', conj: 'A classic pairing of inner and outer self, often a strong sense of belonging.' },
  'Moon|Moon': { harm: 'You tend to read each other’s moods easily and feel at home together.', hard: 'Your comfort habits differ, so you may need to say what soothes you rather than hope it is guessed.', conj: 'Feelings run in step, which is comforting and can amplify mood in both directions.' },
  'Mars|Venus': { harm: 'Affection and desire tend to answer each other warmly.', hard: 'A lively, sometimes prickly attraction: want and tenderness take turns leading.', conj: 'A strong pull, with warmth and drive in the same place.' },
  'Venus|Venus': { harm: 'You enjoy and value similar things, which makes shared pleasure simple.', hard: 'You show care in different languages; curiosity about each other’s helps.', conj: 'Similar tastes and ways of loving, with an easy mutual fondness.' },
  'Mercury|Mercury': { harm: 'Conversation tends to flow and you finish each other’s thoughts.', hard: 'You approach ideas from different angles; good for debate, tiring when tired.', conj: 'You think alike, which makes talk quick and sometimes echo-like.' },
  'Moon|Saturn': { harm: 'One steadies the other’s feelings, a quiet kind of dependability.', hard: 'One may feel held back or the other unheard; patience and kindness carry a long way.', conj: 'Serious commitment is felt here, and a risk of coolness when it is tired.' },
  'Saturn|Venus': { harm: 'Affection grows into something lasting and loyal.', hard: 'Love may feel restricted at times; slow trust-building pays back.', conj: 'A bond that asks for commitment, often deepening with the years.' },
  'Jupiter|Moon': { harm: 'A generous, encouraging pairing; you tend to lift each other’s spirits.', hard: 'Enthusiasm may overshoot someone’s need for quiet; check in.', conj: 'Warmth and optimism meet, and it feels good to be around each other.' },
  'Sun|Sun': { harm: 'You respect each other’s aims and tend to pull the same way.', hard: 'Two strong wills; room for each to shine keeps it friendly.', conj: 'Alike at the core, so you may understand each other at once.' },
  'Mars|Mars': { harm: 'Your energy and pace suit each other, good for doing things together.', hard: 'Tempers and tempo can clash; physical activity or a shared project helps.', conj: 'Similar drive, a strong team when aimed outward.' },
};

/** A short line for the bond type when one of its planets is involved. */
export const TYPE_LINES: Record<RelType, Partial<Record<Planet8, string>>> = {
  romantic: { Venus: 'In love, this is where affection is felt.', Mars: 'In love, this is where attraction and heat show.', Moon: 'In love, this shapes how safe you feel together.', Sun: 'In love, this is where you feel seen.', Ascendant: 'This often shapes the first spark and how you come across to each other.' },
  friendship: { Moon: 'In friendship, this is the ease of just being together.', Mercury: 'In friendship, this is what you talk about and how.', Jupiter: 'In friendship, this is the fun and the encouragement.' },
  family: { Moon: 'In a family, this is the felt sense of home and care.', Saturn: 'In a family, this touches duty, boundaries and what is handed down.' },
  coven: { Saturn: 'Working together, this is structure, reliability and who holds the line.', Jupiter: 'Working together, this is shared faith, generosity and growth.' },
};

export function pairLine(p1: Planet8, p2: Planet8, family: Family): string {
  const key = [p1, p2].sort().join('|');
  return PAIR_LINES[key]?.[family] ?? `Their ${FEEL[p1]} and ${FEEL[p2]} ${GENERIC[family]}`;
}

export const HOUSE_THEME: Record<number, string> = {
  1: 'identity and presence', 2: 'money and what is valued', 3: 'everyday talk and nearby things', 4: 'home and family',
  5: 'play, romance and creativity', 6: 'daily routine and care', 7: 'partnership', 8: 'depth, trust and shared resources',
  9: 'travel, belief and learning', 10: 'work and public life', 11: 'friends and hopes', 12: 'rest, privacy and the unseen',
};

/** Short flavour for each sign, for the composite reading. */
export const SIGN_FLAVOUR: Record<string, string> = {
  Aries: 'bold and direct', Taurus: 'steady and sensual', Gemini: 'curious and talkative', Cancer: 'tender and protective',
  Leo: 'warm and expressive', Virgo: 'practical and caring', Libra: 'balanced and courteous', Scorpio: 'intense and private',
  Sagittarius: 'adventurous and honest', Capricorn: 'ambitious and dependable', Aquarius: 'independent and friendly', Pisces: 'dreamy and compassionate',
};

export const ELEMENT_ROLE: Record<string, string> = {
  fire: 'raising energy and lighting the candles',
  earth: 'grounding, the altar and the practical side',
  air: 'words, invocations and reading aloud',
  water: 'the cup, blessing and holding the feeling of the circle',
};

/** What the relationship asks for, mapped to the timing advisor's intents. */
export const GOOD_DAY_INTENTS: { key: string; label: string; intent: string }[] = [
  { key: 'date', label: 'A date night', intent: 'love' },
  { key: 'talk', label: 'A heart-to-heart talk', intent: 'communication' },
  { key: 'ritual', label: 'A ritual together', intent: 'beginnings' },
  { key: 'mend', label: 'Reconciliation', intent: 'peace' },
];

/** Finder / spell intentions that suit each kind of bond. */
export const MAGIC_INTENTS: Record<RelType, { intent: string; label: string }[]> = {
  romantic: [{ intent: 'love', label: 'Love' }, { intent: 'peace', label: 'Harmony and reconciliation' }],
  friendship: [{ intent: 'love', label: 'Friendship and warmth' }, { intent: 'communication', label: 'Open, kind talk' }],
  family: [{ intent: 'peace', label: 'Harmony at home' }, { intent: 'protection', label: 'Protection of the household' }],
  coven: [{ intent: 'peace', label: 'Harmony in the circle' }, { intent: 'beginnings', label: 'Working together' }],
};
