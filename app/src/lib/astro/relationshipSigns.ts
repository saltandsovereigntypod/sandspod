// Sign-aware words for "How your charts meet": how each person's Moon, Venus,
// Mercury and Mars sign behaves in a bond, how two elements meet, and the
// composite Sun, Moon and Venus by sign. Pure data. Lines are built from
// element and modality, with a touch for each sign where it adds something.

import type { Element, Modality, ZodiacSign } from './signs.ts';
import type { RelType } from './relationshipText.ts';

export type SignPlanet = 'Moon' | 'Venus' | 'Mercury' | 'Mars';

/** What each sign's Moon needs to feel safe, how each Venus shows care, how each Mercury talks. Read after "{Name}’s Moon in Taurus". */
export const SIGN_TOUCH: Record<'Moon' | 'Venus' | 'Mercury', Record<ZodiacSign, string>> = {
  Moon: {
    Aries: 'needs to be free to react, to be met directly rather than tiptoed around, and for a row to be over quickly.',
    Taurus: 'needs physical comfort, good food, a steady routine and no sudden changes of plan.',
    Gemini: 'needs to talk a feeling through, and needs variety; boredom feels oddly unsafe.',
    Cancer: 'needs home and belonging, and to be looked after as carefully as it looks after others.',
    Leo: 'needs warmth, loyalty and to feel special, not merely useful.',
    Virgo: 'needs order and small practical kindnesses; a tidy space and a plan calm it.',
    Libra: 'needs harmony, fairness and company; open conflict unsettles it for days.',
    Scorpio: 'needs depth, privacy and complete trust; half-truths feel dangerous to it.',
    Sagittarius: 'needs room, honesty and something to look forward to.',
    Capricorn: 'needs reliability, respect and a sense that things are under control.',
    Aquarius: 'needs space, friendship and to be accepted as different.',
    Pisces: 'needs gentleness, quiet and someone who understands without being told.',
  },
  Venus: {
    Aries: 'shows care by acting: pursuing, protecting, doing it now rather than later.',
    Taurus: 'shows care through touch, food, gifts and simply being there, reliably.',
    Gemini: 'shows care with words: messages, jokes, questions and real interest in your day.',
    Cancer: 'shows care by looking after you: feeding you, remembering things, making a home.',
    Leo: 'shows care generously and openly, with praise, gestures and fierce loyalty.',
    Virgo: 'shows care through practical help and attention to the small details of your life.',
    Libra: 'shows care through courtesy, beauty and making things fair and pleasant.',
    Scorpio: 'shows care with intensity and devotion, and hopes for the same depth back.',
    Sagittarius: 'shows care through adventure, honesty and shared laughter.',
    Capricorn: 'shows care through commitment and reliability, building something that lasts.',
    Aquarius: 'shows care through friendship, acceptance and respect for your freedom.',
    Pisces: 'shows care through sympathy, imagination and quiet acts of sacrifice.',
  },
  Mercury: {
    Aries: 'talks fast and frankly, says it straight and moves on.',
    Taurus: 'talks slowly and practically, and once it forms a view it rarely shifts.',
    Gemini: 'talks quickly about everything, jumps between topics and loves a question.',
    Cancer: 'talks from feeling and memory, and hears tone more than words.',
    Leo: 'talks warmly and with a sense of story, and wants to be heard out.',
    Virgo: 'talks precisely, notices details and offers helpful corrections.',
    Libra: 'talks diplomatically, weighs both sides and avoids blunt edges.',
    Scorpio: 'talks sparingly and probes deep, asking the question you were avoiding.',
    Sagittarius: 'talks broadly and honestly, sometimes too honestly, in big ideas.',
    Capricorn: 'talks to the point, plans out loud and respects facts.',
    Aquarius: 'talks in ideas and principles, and enjoys a contrary view.',
    Pisces: 'talks in images and impressions, and picks up what is left unsaid.',
  },
};

/** How each element's Mars acts and argues. Read after "{Name}’s Mars in Aries". */
export const MARS_ELEMENT: Record<Element, string> = {
  fire: 'acts on impulse, flares fast and is usually over it by the next meal.',
  earth: 'acts slowly and surely, digs in when pushed and can hold a grievance quietly.',
  air: 'acts through words and plans, and fights by arguing the point.',
  water: 'acts on feeling, goes quiet or sharp when hurt, and needs the hurt named before moving on.',
};

/** One modality sentence per planet, following the person's line. */
export const MODALITY_LINE: Record<SignPlanet, Record<Modality, string>> = {
  Moon: {
    cardinal: 'As a cardinal Moon it deals with a feeling by doing something about it.',
    fixed: 'As a fixed Moon it holds feelings a long time, the warm ones and the hurt ones.',
    mutable: 'As a mutable Moon it moves through moods quickly and adapts to the room.',
  },
  Venus: {
    cardinal: 'As a cardinal Venus it tends to make the first move in affection.',
    fixed: 'As a fixed Venus it is loyal and slow to change its attachments.',
    mutable: 'As a mutable Venus it is flexible and easily delighted by something new.',
  },
  Mercury: {
    cardinal: 'As a cardinal Mercury it starts conversations and likes to reach a decision.',
    fixed: 'As a fixed Mercury it holds its view and wants to be persuaded, not hurried.',
    mutable: 'As a mutable Mercury it changes its mind readily and enjoys thinking out loud.',
  },
  Mars: {
    cardinal: 'As a cardinal Mars it starts things, arguments included, and wants them settled now.',
    fixed: 'As a fixed Mars it pushes steadily and is very hard to turn once set.',
    mutable: 'As a mutable Mars it comes in bursts and changes direction easily, which keeps fights short but scattered.',
  },
};

/** Short element phrases used when two people's placements are compared. */
export const ELEMENT_PHRASE: Record<SignPlanet, Record<Element, string>> = {
  Moon: { fire: 'freedom and enthusiasm', earth: 'routine and reliability', air: 'space and talk', water: 'closeness and being understood' },
  Venus: { fire: 'gestures and enthusiasm', earth: 'touch and practical care', air: 'words and attention', water: 'tenderness and attunement' },
  Mercury: { fire: 'fast and frankly', earth: 'carefully and practically', air: 'quickly and in ideas', water: 'intuitively, by tone' },
  Mars: { fire: 'a quick flare that clears', earth: 'a slow digging in', air: 'arguing the point', water: 'a hurt withdrawal' },
};

export type ElementRelation = 'same' | 'kin' | 'unlike';
/** Fire and air feed each other; so do earth and water. */
export const elementRelation = (x: Element, y: Element): ElementRelation =>
  x === y ? 'same' : (x === 'fire' || x === 'air') === (y === 'fire' || y === 'air') ? 'kin' : 'unlike';

/** How the two people's elements meet, per planet. {A}/{B} are names, {ea}/{eb} the ELEMENT_PHRASE for each. */
export const ELEMENT_MEET: Record<SignPlanet, Record<ElementRelation, string>> = {
  Moon: {
    same: 'Both of you feel safe through {ea}, so you can comfort each other almost without trying.',
    kin: '{A} feels safe through {ea}, and {B} through {eb}: different needs, but they feed each other.',
    unlike: '{A} feels safe through {ea}, and {B} through {eb}, so comfort needs translating; offer the other’s kind, not your own.',
  },
  Venus: {
    same: 'Both of you show care through {ea}, so affection lands without translation.',
    kin: '{A} shows care through {ea}, and {B} through {eb}: different currencies that exchange well.',
    unlike: '{A} shows care through {ea}, and {B} through {eb}, so each may miss the other’s affection unless it is pointed out.',
  },
  Mercury: {
    same: 'Both of you talk {ea}, so you tend to understand each other quickly.',
    kin: '{A} talks {ea}, {B} {eb}; the styles suit each other once you know them.',
    unlike: '{A} talks {ea}, {B} {eb}, so slow down and check what was meant before reacting.',
  },
  Mars: {
    same: 'In a disagreement you both tend towards {ea}, so you know each other’s moves; agree who will cool things down.',
    kin: 'In a disagreement {A} tends towards {ea}, and {B} towards {eb}; the styles can balance each other.',
    unlike: 'In a disagreement {A} tends towards {ea}, and {B} towards {eb}, so one row can feel like two different rows; say what each of you needs to finish it.',
  },
};

/** How a Moon of each element hears best: the bridge from one person's Mercury to the other's Moon. */
export const MOON_HEARS: Record<Element, string> = {
  fire: 'when things are said straight and warmly, without a lecture',
  earth: 'when words come calmly and with something practical done',
  air: 'when feelings are put into words and there is room to discuss them',
  water: 'when the feeling is acknowledged before any fixing starts',
};

/** The sign placements each kind of bond looks at, with a heading for each. */
export const SIGN_FOCUS: Record<RelType, { planet: SignPlanet; title: string }[]> = {
  romantic: [
    { planet: 'Moon', title: 'What each of you needs to feel safe' },
    { planet: 'Venus', title: 'How each of you loves' },
    { planet: 'Mars', title: 'How each of you acts and argues' },
  ],
  friendship: [
    { planet: 'Mercury', title: 'How each of you talks' },
    { planet: 'Moon', title: 'What each of you needs to feel at ease' },
    { planet: 'Venus', title: 'How each of you shows fondness and has fun' },
  ],
  family: [
    { planet: 'Moon', title: 'What each of you needs to feel at home' },
    { planet: 'Mars', title: 'How you push each other' },
    { planet: 'Mercury', title: 'How each of you talks' },
  ],
  coven: [
    { planet: 'Mercury', title: 'How each of you plans and speaks' },
    { planet: 'Mars', title: 'How each of you raises energy and gets things done' },
    { planet: 'Moon', title: 'What each of you needs to feel safe in the circle' },
  ],
};
export const BRIDGE_TITLE = 'Speaking to each other’s Moon';

// ── Composite ────────────────────────────────────────────────────────────

/** The composite Sun, Moon and Venus by sign: what the bond is for, what it needs, how it enjoys. */
export const COMPOSITE_SIGN: Record<'Sun' | 'Moon' | 'Venus', Record<ZodiacSign, string>> = {
  Sun: {
    Aries: 'a relationship built to start things: brave, direct and at its best when there is something new to do together.',
    Taurus: 'a relationship built to last: steady, sensual and happiest with comfort, continuity and something growing.',
    Gemini: 'a relationship made of conversation, curiosity and variety; it stays alive by learning.',
    Cancer: 'a relationship that makes a home wherever you are and protects what it loves.',
    Leo: 'a warm, generous, visible bond that wants to celebrate and to be proud of itself.',
    Virgo: 'a working partnership at heart: helpful, careful and good at improving things together.',
    Libra: 'a bond about balance, fairness and beauty, where the partnership itself is the point.',
    Scorpio: 'an intense, private bond that changes both of you and asks for complete trust.',
    Sagittarius: 'a bond for adventure, meaning and growth, which needs a horizon to head for.',
    Capricorn: 'a bond with purpose and staying power, built slowly like good stonework.',
    Aquarius: 'a bond of friendship and shared ideals that leaves each of you free.',
    Pisces: 'a gentle, imaginative and spiritual bond, rich in compassion, which needs clear boundaries.',
  },
  Moon: {
    Aries: 'the bond feels safest with honesty and quick repair; sulking does not suit it.',
    Taurus: 'the bond feels safest with routine, good food and physical comfort.',
    Gemini: 'the bond feels safest when you keep talking and keep things light.',
    Cancer: 'the bond feels safest at home, with family rituals and plenty of care.',
    Leo: 'the bond feels safest when each of you feels adored and loyalty is never in doubt.',
    Virgo: 'the bond feels safest when daily life runs smoothly and you help each other.',
    Libra: 'the bond feels safest in harmony, fairness and shared beauty.',
    Scorpio: 'the bond feels safest with total trust and emotional honesty.',
    Sagittarius: 'the bond feels safest with freedom, humour and plans ahead.',
    Capricorn: 'the bond feels safest with commitment and responsibility shared fairly.',
    Aquarius: 'the bond feels safest with space, friendship and acceptance.',
    Pisces: 'the bond feels safest with gentleness, quiet and imagination shared.',
  },
  Venus: {
    Aries: 'affection is spontaneous and bold, and you enjoy doing things on impulse.',
    Taurus: 'affection is physical and loyal, and the pleasures are simple: good food, nature, touch.',
    Gemini: 'affection is playful and chatty, and you enjoy words, games and outings.',
    Cancer: 'affection is nurturing, and you enjoy home, cooking and family.',
    Leo: 'affection is generous and openly shown, and you enjoy celebrations and romance.',
    Virgo: 'affection shows in acts of service, and you enjoy useful, well-made things.',
    Libra: 'affection is graceful, and you enjoy art, music and good company.',
    Scorpio: 'affection is deep and private, and you enjoy intensity and secrets shared.',
    Sagittarius: 'affection is free-spirited, and you enjoy travel and laughter.',
    Capricorn: 'affection is steady and earned, and you enjoy quality and tradition.',
    Aquarius: 'affection is friendly and unconventional, and you enjoy causes and groups.',
    Pisces: 'affection is tender and dreamy, and you enjoy music, water and quiet.',
  },
};

// ── Element balance between two charts ───────────────────────────────────

export const ELEMENT_MANY: Record<Element, string> = {
  fire: 'There is a lot of fire between you: energy, warmth and quick enthusiasm, with tempers that rise just as fast.',
  earth: 'There is a lot of earth between you: steadiness, practicality and comfort, with a risk of getting stuck in routine.',
  air: 'There is a lot of air between you: talk, ideas and good company, though feelings may get discussed more than felt.',
  water: 'There is a lot of water between you: deep feeling, easy empathy and strong bonds, with moods that can flood you both.',
};
export const ELEMENT_FEW: Record<Element, string> = {
  fire: 'There is little fire, so plan the fun and the adventures on purpose; spontaneity will not always arrive by itself.',
  earth: 'There is little earth, so put shared plans and money in writing; the practical side can drift.',
  air: 'There is little air, so talk things through on purpose; it is easy to assume you understand each other.',
  water: 'There is little water, so say feelings out loud; care can go unspoken.',
};
export const ELEMENT_EVEN = 'The elements are spread fairly evenly between you, so no one temperament dominates and you have a bit of everything to draw on.';
