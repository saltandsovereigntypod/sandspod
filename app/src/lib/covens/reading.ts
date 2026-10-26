// A coven reading: a spread drawn together. One person opens it in the
// coven's chat with a card for the coven as a whole; each member who joins
// draws a card of their own into it, up to nine. It is kept as ordinary chat
// messages (coven_messages), so it needs no new table: the opening message
// says what it is in plain words, and each member's card is a reply to it
// (`reply_to`). Anyone reading the chat without this sees readable messages;
// the app and the website gather them into one laid-out reading. Pure.

import { drawnLine, poolFor, secureRandom, shuffle, type Draw, type Drawn, type Position, type Spread } from '../divination/draw.ts';
import { COVEN_SPREAD, covenSlots, diagramOf, diagramSvg, laid, type Laid } from '../divination/layout.ts';

/** At most this many members draw into one reading (and one card more for the coven). */
export const MAX_MEMBERS = 9;

export const OPENING = 'A coven reading';
export const CARD = 'My card for the coven reading';
const FOR_COVEN = 'For the coven as a whole';
const INVITE = 'Open it to draw your own card.';

export const COVEN_POSITION: Position = { name: 'The coven as a whole', about: 'What the coven is, or needs, as one body.' };
export const memberPosition = (name: string): Position => ({ name, about: 'Their own card, drawn into the coven’s reading.' });

type MessageLike = { id: string; user_id: string | null; body: string; created_at: string; deleted_at?: string | null; reply_to?: string | null; hidden?: boolean };

/** "Reversed" or not, and the name, from "The Tower, reversed (…)" or "The Star (…)". */
function parseDrawn(text: string, pool: string[]): Drawn | null {
  const words = text.replace(/\s*\(.*\)\s*$/, '').trim();
  const reversed = /, reversed$/.test(words);
  const name = reversed ? words.replace(/, reversed$/, '') : words;
  return pool.includes(name) ? { name, reversed } : null;
}

const TAROT = () => poolFor('tarot', { reversals: true, blankRune: false });

/** The opening message: what it's for, the coven's card, and an invitation to draw. */
export function openingBody(question: string, coven: Drawn): string {
  const q = question.replace(/\s+/g, ' ').trim().slice(0, 300);
  return [`${OPENING}${q ? `: ${q}` : ''}`, `${FOR_COVEN}: ${drawnLine(null, coven, true)}`, INVITE].join('\n');
}

/** An opening message read back: the question and the coven's card. Null for any other message. */
export function parseOpening(body: string): { question: string; coven: Drawn } | null {
  const lines = body.split('\n');
  const head = lines[0] ?? '';
  if (head !== OPENING && !head.startsWith(`${OPENING}: `)) return null;
  const covenLine = lines.find((l) => l.startsWith(`${FOR_COVEN}: `));
  const coven = covenLine ? parseDrawn(covenLine.slice(FOR_COVEN.length + 2), TAROT()) : null;
  if (!coven) return null;
  return { question: head.slice(OPENING.length + 2).trim(), coven };
}

/** A member's card, as the reply they send. */
export const cardBody = (item: Drawn) => `${CARD}: ${drawnLine(null, item, true)}`;

/** A member's card read back from their reply, or null. */
export function parseCard(body: string): Drawn | null {
  return body.startsWith(`${CARD}: `) ? parseDrawn(body.slice(CARD.length + 2), TAROT()) : null;
}

export type CovenReading = {
  /** The opening message. */
  id: string;
  openedBy: string | null;
  openedAt: string;
  question: string;
  coven: Drawn;
  /** One card per member, in the order they drew; the opener may draw one too. */
  members: { userId: string; item: Drawn; messageId: string }[];
  full: boolean;
};

/** The coven readings in a thread's messages, each with the cards drawn into it so far. */
export function covenReadings(messages: MessageLike[]): CovenReading[] {
  const live = messages.filter((m) => !m.deleted_at && !m.hidden);
  const byTime = [...live].sort((a, b) => (a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0));
  const out: CovenReading[] = [];
  for (const m of byTime) {
    const opening = parseOpening(m.body);
    if (!opening) continue;
    const members: CovenReading['members'] = [];
    const taken = new Set([opening.coven.name]);
    for (const reply of byTime) {
      if (reply.reply_to !== m.id || !reply.user_id || members.length >= MAX_MEMBERS) continue;
      const item = parseCard(reply.body);
      // One card each, and never the same card twice (two drawing at once could clash).
      if (!item || taken.has(item.name) || members.some((x) => x.userId === reply.user_id)) continue;
      taken.add(item.name);
      members.push({ userId: reply.user_id, item, messageId: reply.id });
    }
    out.push({ id: m.id, openedBy: m.user_id, openedAt: m.created_at, question: opening.question, coven: opening.coven, members, full: members.length >= MAX_MEMBERS });
  }
  return out;
}

/** The message ids that belong to a reading (its members' cards), to show inside it rather than as loose messages. */
export function readingReplyIds(readings: CovenReading[]): Set<string> {
  return new Set(readings.flatMap((r) => r.members.map((m) => m.messageId)));
}

/** Whether you can still draw into it. */
export const canDraw = (reading: CovenReading, me: string | null) => !!me && !reading.full && !reading.members.some((m) => m.userId === me);

/** A card from the deck not yet in the reading; reversed half the time when reversals are on. */
export function drawCovenCard(reading: Pick<CovenReading, 'coven' | 'members'> | null, reversals: boolean, random: () => number = secureRandom): Drawn {
  const taken = new Set(reading ? [reading.coven.name, ...reading.members.map((m) => m.item.name)] : []);
  const [name] = shuffle(
    TAROT().filter((n) => !taken.has(n)),
    random,
  );
  return { name, reversed: reversals && random() < 0.5 };
}

/** The reading laid out: the coven's card in the middle, the members' round it. */
export const covenLayout = (members: number): Laid => laid('tarot', covenSlots(Math.min(members, MAX_MEMBERS)));

/** A small numbered picture of the reading's shape (for the website's chat), 1 being the coven's card. */
export const covenDiagramSvg = (members: number, size = 120) => diagramSvg(diagramOf(covenLayout(members)), size, { numbers: true });

/** The reading as a spread and a draw, to lay out like any other: the coven's card first, then each member's under their name. */
export function covenSpread(reading: Pick<CovenReading, 'question' | 'coven' | 'members'>, nameOf: (id: string) => string): { spread: Spread; draw: Draw } {
  const spread: Spread = {
    id: COVEN_SPREAD,
    kind: 'tarot',
    group: 'yours',
    label: 'A coven reading',
    detail: 'A card for the coven as a whole, and one for each member who joins.',
    positions: [COVEN_POSITION, ...reading.members.map((m) => memberPosition(nameOf(m.userId)))],
    lookBackDays: 30,
  };
  return { spread, draw: { spread: COVEN_SPREAD, items: [reading.coven, ...reading.members.map((m) => m.item)] } };
}

/** "4 of up to 9 have drawn" / "All 9 cards are in." */
export function drawnSoFar(reading: CovenReading): string {
  if (reading.full) return `All ${MAX_MEMBERS} cards are in.`;
  const n = reading.members.length;
  return n === 0 ? `No one has drawn yet. Up to ${MAX_MEMBERS} can join.` : `${n} of up to ${MAX_MEMBERS} have drawn.`;
}

/** Each card in its place, in words, the coven's first: "The coven as a whole: The Star (hope, …)". */
export function readingLines(reading: Pick<CovenReading, 'coven' | 'members'>, nameOf: (id: string) => string): string[] {
  return [drawnLine(COVEN_POSITION, reading.coven, false), ...reading.members.map((m) => drawnLine(memberPosition(nameOf(m.userId)), m.item, false))];
}
