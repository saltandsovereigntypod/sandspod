// Reading Lenormand cards in pairs, as the deck is meant to be read: the
// first card names the matter, the second describes it ("Ship + Rider": a
// journey, quick). A handful of pairs have meanings of their own that most
// readers share; the rest are put together from the two cards. Also the
// pairs to read in a line of cards. Pure.

import { lenormandCard, type LenormandCard } from './lenormand.ts';

export type PairReading = {
  subject: LenormandCard;
  modifier: LenormandCard;
  /** "Ship + Rider" */
  title: string;
  /** The two put together in a line: "A journey, or something far away: quick, on its way." */
  gist: string;
  /** A fuller reading, in two or three sentences. */
  text: string;
  /** True when the pair has a meaning of its own that most readers share. */
  known: boolean;
};

/** Pairs with a reading of their own, by "First + Second". */
const KNOWN: Record<string, string> = {
  'Ship + Rider': 'A journey soon, or news from far away.',
  'Rider + Letter': 'A message arriving: written news is on its way.',
  'Letter + Rider': 'A letter or email sent on quickly, or a reply soon.',
  'Heart + Ring': 'Love that commits: an engagement, a promise made from the heart.',
  'Ring + Heart': 'A commitment made for love.',
  'Ring + Coffin': 'A commitment that ends: a contract or a relationship closing.',
  'Ring + Scythe': 'An agreement cut short, or a sudden proposal.',
  'Fish + Bear': 'A great deal of money, or wealth held in reserve.',
  'Bear + Fish': 'A boss or strong person with money; big business.',
  'Fish + Mice': 'Money slipping away: spending, losses, a leak to find.',
  'House + Stork': 'Moving house, or changes at home.',
  'Stork + House': 'A move to a new home.',
  'Dog + Fox': 'A false friend, or a friend from work.',
  'Fox + Dog': 'A colleague you can trust.',
  'Letter + Tower': 'An official letter: from an office, a court or a company.',
  'Book + Letter': 'A secret letter, or paperwork you have not seen yet.',
  'Heart + Book': 'A secret love, or feelings kept hidden.',
  'Book + Garden': 'A secret that gets out, or study made public.',
  'Child + Stork': 'A new beginning arriving; for some readers, a pregnancy.',
  'Stork + Child': 'A birth, or a new start that changes things.',
  'Tree + Coffin': 'Illness to take seriously: see to your health.',
  'Clouds + Sun': 'The weather clears: confusion giving way to success.',
  'Sun + Clouds': 'Success dimmed for a while by doubt or trouble.',
  'Key + Cross': 'A destiny that is certain, or faith that opens the way.',
  'Anchor + Fox': 'Steady work, a job that lasts.',
  'Fox + Anchor': 'A job, settled; or self-interest that holds on.',
  'Mountain + Key': 'The obstacle is overcome: there is a way through.',
  'Scythe + Heart': 'A sudden love, or a heartbreak cut quickly.',
  'Birds + Whip': 'A quarrel, heated words.',
  'Moon + Sun': 'Recognition and success together: honour well earned.',
  // More pairs that today's readers broadly share. None of these comes from
  // the 1799 game's own instructions, which gave each card a single meaning;
  // pair-reading grew up among German and French cartomancers in the 1800s
  // and later, and readers still differ on many of them.
  'Heart + Coffin': 'Love that has ended, or a heart shut for now.',
  'Fox + Tower': 'A job with a large company or a public body.',
  'Tree + Snake': 'A health matter that winds on: see it through with care.',
  'Coffin + Stork': 'Recovery after an ending; life picks up again.',
  'House + Fish': 'Money from property, or a family business.',
  'House + Key': 'A home secured: buying, or truly settling in.',
  'Key + House': 'The right home found.',
  'Fish + Letter': 'A statement, invoice or written offer about money.',
  'Letter + Fish': 'A bill or a payment that comes in writing.',
  'Child + Book': 'Study, school, or a young person’s learning.',
  'Book + Child': 'Learning something new; a beginner’s course.',
  'Dog + Heart': 'A loving friend; friendship turning into love.',
  'Heart + Dog': 'Love that is loyal and faithful.',
  'Crossroads + Mountain': 'A decision held up by an obstacle.',
  'Mountain + Crossroads': 'One route blocked, so take another.',
  'Scythe + Tree': 'A sudden health matter, or surgery: have it seen to.',
  'Moon + Stars': 'Wide recognition; success in creative work.',
  'Sun + Key': 'A certain success: as plain a yes as the deck gives.',
  'Birds + Letter': 'Messages and chatter in writing: texts, group chats.',
  'Rider + Ship': 'A visitor from far away, or news about travel.',
  'Lily + Heart': 'Mature, contented love, and sensual love.',
  'Ring + Anchor': 'A commitment that lasts; marriage for the long haul.',
  'Anchor + Ring': 'A lasting contract or a secure job agreement.',
  'Cross + Stork': 'A burden lifting; hard times improving.',
  'Mice + Heart': 'Worry eating at love; heartache.',
  'Clover + Fish': 'A small windfall; lucky money.',
  'Bear + House': 'A strong family; property and savings.',
  'Clouds + Snake': 'Confusion around a complicated person or situation.',
  'Whip + Heart': 'Passion with friction, or love bruised by quarrels.',
  'Tower + Coffin': 'An institution closing, or a long isolation ending.',
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Read two cards as a pair: the first as the subject, the second as the modifier. Null if either isn't a Lenormand card. */
export function readPair(first: string, second: string): PairReading | null {
  const subject = lenormandCard(first);
  const modifier = lenormandCard(second);
  if (!subject || !modifier) return null;
  const title = `${subject.name} + ${modifier.name}`;
  const gist = `${cap(subject.noun)}: ${modifier.adjective}.`;
  const known = KNOWN[title];
  const text = known
    ? `${known} ${subject.name} names the matter (${subject.noun}); ${modifier.name} says what kind (${modifier.adjective}).`
    : `${subject.name} names the matter: ${subject.noun}. ${modifier.name} says what kind: ${modifier.adjective}. Put together, ${subject.noun.split(',')[0]} that is ${modifier.adjective.split(',')[0]}.`;
  return { subject, modifier, title, gist, text, known: !!known };
}

/** The pairs to read along a line of cards: one and two, two and three, and so on. */
export function pairsAlong(names: string[]): PairReading[] {
  const out: PairReading[] = [];
  for (let i = 0; i + 1 < names.length; i++) {
    const p = readPair(names[i], names[i + 1]);
    if (p) out.push(p);
  }
  return out;
}

/**
 * The pairs worth reading in a Lenormand draw, in order: along a line;
 * along each row of the 3×3 box; in the Grand Tableau, the cards either
 * side of the Man and the Woman in their row (the four beneath stand apart).
 */
export function pairsForSpread(spreadId: string, names: string[]): PairReading[] {
  if (!spreadId.startsWith('lenormand-') || spreadId === 'lenormand-one') return [];
  if (spreadId === 'lenormand-box') return [0, 3, 6].flatMap((r) => pairsAlong(names.slice(r, r + 3)));
  if (spreadId === 'lenormand-grand-tableau') {
    const out: PairReading[] = [];
    for (const who of ['Man', 'Woman']) {
      const at = names.indexOf(who);
      if (at < 0 || at >= 32) continue;
      const col = at % 8;
      if (col > 0) out.push(readPair(names[at - 1], who)!);
      if (col < 7) out.push(readPair(who, names[at + 1])!);
    }
    return out;
  }
  return pairsAlong(names);
}

/** How many known pairs there are (for tests and the help page). */
export const KNOWN_PAIRS = Object.keys(KNOWN);
