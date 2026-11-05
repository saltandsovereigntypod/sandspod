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

/**
 * How each kind of bond reads a planet, in an easy and a harder key. This is
 * where the relationship type changes the wording: friendship reads Venus as
 * enjoyment, family reads Mars as how you push each other, a coven reads Saturn
 * as commitment and Jupiter as shared vision. Listed in the order the bond
 * leans on them; a contact takes the first planet it involves.
 */
export const LENS: Record<RelType, Partial<Record<Planet8, { easy: string; hard: string }>>> = {
  romantic: {
    Venus: { easy: 'In love, Venus is where affection is felt, and here it is offered and received without much translation.', hard: 'In love, Venus is where affection is felt; here it needs translating, so learn how the other likes to be loved.' },
    Mars: { easy: 'In love, Mars is desire and pursuit, and here the wanting runs in step.', hard: 'In love, Mars is desire and pursuit; here heat and timing do not always match, which excites as much as it frustrates.' },
    Moon: { easy: 'In love, the Moon is how safe you feel together, and this contact helps you relax into each other.', hard: 'In love, the Moon is how safe you feel together; this contact asks you to make that safety on purpose.' },
    Sun: { easy: 'In love, the Sun is feeling seen, and here each of you tends to see the other clearly.', hard: 'In love, the Sun is feeling seen; here being seen can feel like being challenged.' },
    Ascendant: { easy: 'In love, the Ascendant is the first spark and how you look as a pair.', hard: 'In love, the Ascendant is the first spark; here the first impression may have been mixed, and the bond grew past it.' },
    Saturn: { easy: 'In love, Saturn is commitment, and here it builds a quiet loyalty.', hard: 'In love, Saturn is commitment; here it can feel like weight before it feels like safety.' },
  },
  friendship: {
    Venus: { easy: 'Between friends, Venus is not romance but enjoyment: you like the same pleasures and simply like each other’s company.', hard: 'Between friends, Venus is about enjoyment, so friction shows over plans and treats: who chooses, who pays, what counts as fun.' },
    Moon: { easy: 'In friendship, the Moon is the ease of just being together, with no performance needed.', hard: 'In friendship, the Moon is how at ease you feel; here, say when you need support rather than distraction.' },
    Mercury: { easy: 'In friendship, Mercury is what you talk about and how, and here the conversation tends to keep going.', hard: 'In friendship, Mercury is the conversation; here it sparks, so keep the debates friendly.' },
    Jupiter: { easy: 'In friendship, Jupiter is the fun and the encouragement, the friend who says yes.', hard: 'In friendship, Jupiter is fun and encouragement; here it can tip into egging each other on.' },
    Mars: { easy: 'Between friends, Mars is doing things together: sport, projects, adventures.', hard: 'Between friends, Mars is shared energy, and here it can turn into rivalry, so keep competition playful.' },
    Sun: { easy: 'In friendship, the Sun is mutual respect, and here you tend to back each other’s aims.', hard: 'In friendship, the Sun is mutual respect; here it has to make room for two strong personalities.' },
  },
  family: {
    Moon: { easy: 'In a family, the Moon is the felt sense of home and care, and here it comes naturally.', hard: 'In a family, the Moon is home and care; here old habits of caring may need updating for who you are now.' },
    Mars: { easy: 'In a family, Mars is how you push each other, and here the push tends to be encouraging.', hard: 'In a family, Mars is how you push each other; here the push can come out as nagging or old scraps, so say plainly what you are asking for.' },
    Saturn: { easy: 'In a family, Saturn is duty, boundaries and what is handed down, and here it gives a reliable backbone.', hard: 'In a family, Saturn is duty and what is handed down; here it can feel like rules from another generation.' },
    Sun: { easy: 'In a family, the Sun is recognition, being seen as who you have become, and here it is given.', hard: 'In a family, the Sun is recognition; here someone may still be seen as who they were, not who they are.' },
    Venus: { easy: 'In a family, Venus is fondness and the small kindnesses of home, here given freely.', hard: 'In a family, Venus is fondness; here it is shown in different ways, so name the kindnesses you notice.' },
    Jupiter: { easy: 'In a family, Jupiter is generosity and the faith you have in each other.', hard: 'In a family, Jupiter is generosity; here expectations can run larger than life.' },
  },
  coven: {
    Saturn: { easy: 'Working together, Saturn is commitment and structure: who keeps the calendar, holds the line and turns up.', hard: 'Working together, Saturn is commitment and structure; here it asks you to agree the rules before the rite, not during it.' },
    Jupiter: { easy: 'Working together, Jupiter is shared vision, the faith and purpose the work grows from.', hard: 'Working together, Jupiter is shared vision; here the visions differ in size or direction, so write down what the circle is for.' },
    Mercury: { easy: 'Working together, Mercury is planning and invocation, and here words come easily between you.', hard: 'Working together, Mercury is planning and invocation; here, confirm plans in writing and rehearse spoken parts.' },
    Mars: { easy: 'Working together, Mars is how you raise energy and get things done, and here it combines well.', hard: 'Working together, Mars is raising energy; here it can tip into who leads, so agree roles beforehand.' },
    Moon: { easy: 'Working together, the Moon is how safe the circle feels, and here it holds.', hard: 'Working together, the Moon is how safe the circle feels; check in with each other before and after a working.' },
    Venus: { easy: 'Working together, Venus is harmony and the beauty of the altar, here easily shared.', hard: 'Working together, Venus is harmony; here tastes differ, so take turns dressing the altar.' },
  },
};

/** How each aspect feels, phrased to follow a comma in the summary. */
export const ASPECT_TONE: Record<string, string> = {
  conjunction: 'where you blend and both feel it strongly',
  sextile: 'an opening that rewards a little effort',
  trine: 'which runs easily and naturally',
  square: 'a friction that pushes you both to act',
  opposition: 'a pull of opposites in which each of you sees something of yourself in the other',
};

export const TYPE_OPEN: Record<RelType, string> = { romantic: 'As a couple', friendship: 'As friends', family: 'As family', coven: 'As working partners' };

export const TILT_LINE: Record<'easy' | 'hard' | 'mixed' | 'none', string> = {
  easy: 'Most of your strongest contacts are easy ones, so warmth comes readily; the work is not to coast on it.',
  hard: 'Most of your strongest contacts carry friction, which keeps you awake to each other; it asks for effort and repays it.',
  mixed: 'Your strongest contacts mix ease and friction, so you have both comfort and challenge to work with.',
  none: 'Few close contacts link your planets, so the bond is shaped more by choice and circumstance than by the sky.',
};

export const TYPE_CLOSE: Record<RelType, string> = {
  romantic: 'In love, enjoy the easy parts and talk about the hard ones rather than working around them.',
  friendship: 'As friends, keep making plans; friendships live on time actually spent together.',
  family: 'In a family, remember that patterns are inherited but not fixed.',
  coven: 'In the circle, agree roles and rhythms early, and revisit them at each turning of the year.',
};

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
