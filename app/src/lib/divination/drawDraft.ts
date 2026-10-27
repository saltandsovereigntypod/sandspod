// A draw not yet kept, held on this device only (never synced) so that
// leaving the draw screen, the app being closed or the page reloading
// doesn't lose it. The app keeps it in AsyncStorage and the website in
// localStorage, under the same key and in the same shape. One at a time.
// Pure: reading and writing storage is the caller's.

import { readLink, type ReadingLink } from '../craft/hedge/readings.ts';
import { placeWord } from './custom.ts';
import { DEFAULT_DECK, isDeckId, type DeckId } from './decks.ts';
import { KINDS, ownDeckSpreadById, poolFor, spreadById, type Draw, type DrawKind, type DrawOptions, type Drawn, type Spread } from './draw.ts';
import { RINGS, type Fall } from './layout.ts';
import { ownDeckById, type OwnDeckEntry } from './oracle/decks.ts';

export const DRAW_DRAFT_KEY = 'divination.drawDraft.v1';
/** How long an unkept draw is offered back before it's let go. */
export const DRAFT_DAYS = 7;
const DAY = 86_400_000;

/** Everything on the draw screen that makes the draw what it is. */
export type DrawDraftState = {
  kind: DrawKind;
  spread: string;
  /** The deck of your own drawn from (kind 'oracle'), by its entry id. */
  ownDeck: string | null;
  /** The tarot deck the cards are pictured from. */
  deck: DeckId;
  question: string;
  link: ReadingLink | null;
  options: DrawOptions;
  byHand: boolean;
  /** A physical pull being logged: the card in each place so far. */
  placed: (Drawn | null)[];
  draw: Draw | null;
  revealed: boolean[];
  selected: number | null;
  interpretation: string;
  lookBack: string | null;
};

export type DrawDraft = DrawDraftState & { v: 1; savedAt: string };

/** The draft for the screen as it stands, or null when there's no draw (or pull begun) worth keeping. */
export function draftOf(state: DrawDraftState): DrawDraftState | null {
  const hasDraw = !!state.draw && state.draw.items.length > 0;
  const hasPull = state.byHand && state.placed.some(Boolean);
  if (!hasDraw && !hasPull) return null;
  return {
    kind: state.kind,
    spread: state.spread,
    ownDeck: state.kind === 'oracle' ? state.ownDeck : null,
    deck: state.deck,
    question: state.question,
    link: state.link,
    options: { reversals: !!state.options.reversals, blankRune: !!state.options.blankRune },
    byHand: state.byHand,
    placed: state.byHand && !hasDraw ? state.placed.map((p) => (p ? copyDrawn(p) : null)) : [],
    draw: hasDraw ? { spread: state.draw!.spread, items: state.draw!.items.map(copyDrawn) } : null,
    revealed: hasDraw ? state.draw!.items.map((_, i) => !!state.revealed[i]) : [],
    selected: hasDraw ? state.selected : null,
    interpretation: hasDraw ? state.interpretation : '',
    lookBack: hasDraw ? state.lookBack : null,
  };
}

/** A key that changes whenever the draft would (so a screen saves only on a real change). '' when there is none. */
export const draftKey = (state: DrawDraftState): string => {
  const d = draftOf(state);
  return d ? JSON.stringify(d) : '';
};

/** The stored text for a draft key (from draftKey), stamped with when it was saved. */
export function stampDraft(key: string, now: Date): string | null {
  if (!key) return null;
  const out: DrawDraft = { v: 1, savedAt: now.toISOString(), ...(JSON.parse(key) as DrawDraftState) };
  return JSON.stringify(out);
}

/** The stored text for the screen as it stands, or null when there's nothing to keep. */
export const serializeDraft = (state: DrawDraftState, now: Date): string | null => stampDraft(draftKey(state), now);

function copyDrawn(item: Drawn): Drawn {
  return item.fall ? { name: item.name, reversed: !!item.reversed, fall: { ring: item.fall.ring, up: !!item.fall.up } } : { name: item.name, reversed: !!item.reversed };
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

function readFall(raw: unknown): Fall | null | undefined {
  if (raw === undefined) return undefined;
  if (!isObject(raw) || !RINGS.includes(raw.ring as Fall['ring']) || typeof raw.up !== 'boolean') return null;
  return { ring: raw.ring as Fall['ring'], up: raw.up };
}

function readDrawn(raw: unknown): Drawn | null {
  if (!isObject(raw) || typeof raw.name !== 'string' || !raw.name) return null;
  const fall = readFall(raw.fall);
  if (fall === null) return null;
  return fall ? { name: raw.name, reversed: raw.reversed === true, fall } : { name: raw.name, reversed: raw.reversed === true };
}

/** A stored draft read back, or null when it's missing, unreadable or out of shape. */
export function parseDraft(raw: string | null | undefined): DrawDraft | null {
  if (!raw) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObject(v) || v.v !== 1) return null;
  if (typeof v.savedAt !== 'string' || Number.isNaN(Date.parse(v.savedAt))) return null;
  if (!KINDS.some((k) => k.id === v.kind) || typeof v.spread !== 'string' || !v.spread) return null;
  const options = isObject(v.options) ? v.options : {};
  let draw: Draw | null = null;
  if (v.draw !== null && v.draw !== undefined) {
    if (!isObject(v.draw) || typeof v.draw.spread !== 'string' || !Array.isArray(v.draw.items) || !v.draw.items.length) return null;
    const items = v.draw.items.map(readDrawn);
    if (items.some((i) => !i)) return null;
    draw = { spread: v.draw.spread, items: items as Drawn[] };
  }
  const placedRaw = Array.isArray(v.placed) ? v.placed : [];
  const placed = placedRaw.map((p) => (p === null ? null : readDrawn(p) ?? undefined));
  if (placed.some((p) => p === undefined)) return null;
  const revealedRaw = Array.isArray(v.revealed) ? v.revealed : [];
  const revealed = draw ? draw.items.map((_, i) => revealedRaw[i] === true) : [];
  const selected = draw && typeof v.selected === 'number' && Number.isInteger(v.selected) && v.selected >= 0 && v.selected < draw.items.length ? v.selected : null;
  const out: DrawDraft = {
    v: 1,
    savedAt: v.savedAt,
    kind: v.kind as DrawKind,
    spread: v.spread,
    ownDeck: v.kind === 'oracle' && typeof v.ownDeck === 'string' && v.ownDeck ? v.ownDeck : null,
    deck: isDeckId(v.deck) ? v.deck : DEFAULT_DECK,
    question: typeof v.question === 'string' ? v.question : '',
    link: readLink(v.link) ?? null,
    options: { reversals: options.reversals === true, blankRune: options.blankRune === true },
    byHand: v.byHand === true,
    placed: placed as (Drawn | null)[],
    draw,
    revealed,
    selected,
    interpretation: typeof v.interpretation === 'string' ? v.interpretation : '',
    lookBack: typeof v.lookBack === 'string' ? v.lookBack : null,
  };
  // Nothing in it worth offering back.
  return draftOf(out) ? out : null;
}

/** Whether a draft is recent enough to offer back (saved within DRAFT_DAYS, and not from the future). */
export function isFreshDraft(draft: Pick<DrawDraft, 'savedAt'>, now: Date): boolean {
  const at = Date.parse(draft.savedAt);
  if (Number.isNaN(at)) return false;
  const age = now.getTime() - at;
  // A little leeway for a clock set slightly differently.
  return age > -5 * 60_000 && age < DRAFT_DAYS * DAY;
}

/** The draw screen was opened to start a particular draw (a spread, kind, deck, or one drawn for a dream, plan or deity), so no draft is offered. */
export function opensOwnDraw(params: Record<string, string | string[] | null | undefined>): boolean {
  return ['kind', 'spread', 'deck', 'dream', 'plan', 'deity'].some((k) => {
    const v = params[k];
    return Array.isArray(v) ? v.some((x) => !!x) : !!v;
  });
}

export type RestoredDraft = { draft: DrawDraft; spread: Spread; ownDeck: OwnDeckEntry | null };

/**
 * A draft checked against what exists now: its spread (a spread of your own
 * may have been deleted or changed), its deck of your own, and every card in
 * it. Null when anything is missing, so the draft can be let go quietly.
 */
export function restoreDraft(draft: DrawDraft, { custom = [], decks = [] }: { custom?: Spread[]; decks?: OwnDeckEntry[] } = {}): RestoredDraft | null {
  const ownDeck = draft.kind === 'oracle' ? ownDeckById(decks, draft.ownDeck) : null;
  if (draft.kind === 'oracle' && !ownDeck) return null;
  const spread = draft.kind === 'oracle' ? ownDeckSpreadById(draft.spread, custom) : spreadById(draft.spread, custom);
  if (!spread || spread.kind !== draft.kind) return null;
  const pool = new Set(poolFor(draft.kind, draft.options, ownDeck?.data));
  const fits = (item: Drawn) => pool.has(item.name) && (!item.fall || !!spread.cast);
  const places = spread.positions.length;
  if (draft.draw) {
    if (draft.draw.spread !== spread.id || draft.draw.items.length !== places || !draft.draw.items.every(fits)) return null;
    if (spread.cast && !draft.draw.items.every((i) => !!i.fall)) return null;
  } else {
    if (!draft.byHand || spread.cast || draft.placed.length !== places || !draft.placed.every((p) => !p || fits(p))) return null;
  }
  return { draft, spread, ownDeck };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** When it was saved, in plain words: "just now", "20 minutes ago", "yesterday", "3 days ago". */
export function draftWhen(savedAt: string, now: Date): string {
  const at = new Date(savedAt);
  const ms = now.getTime() - at.getTime();
  if (Number.isNaN(ms) || ms < 2 * 60_000) return 'just now';
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes} minutes ago`;
  const days = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()) / DAY);
  if (days <= 0) {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  }
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

/** A line on what's waiting: "Celtic Cross · 10 cards drawn, 4 turned over · 2 hours ago". */
export function draftSummary({ draft, spread, ownDeck }: RestoredDraft, now: Date): string {
  const word = placeWord(draft.kind).toLowerCase();
  const many = word === 'stave' ? 'staves' : `${word}s`;
  const name = ownDeck ? `${spread.label}, ${ownDeck.data.name}` : spread.label;
  let what: string;
  if (draft.draw) {
    const n = draft.draw.items.length;
    const turned = draft.revealed.filter(Boolean).length;
    const verb = spread.cast ? 'cast' : draft.byHand ? 'laid out' : 'drawn';
    what = `${plural(n, word, many)} ${verb}${draft.byHand || turned === n ? '' : turned ? `, ${turned} turned over` : ', none turned over yet'}`;
  } else {
    what = `${draft.placed.filter(Boolean).length} of ${plural(draft.placed.length, word, many)} placed by hand`;
  }
  return [name, what, draftWhen(draft.savedAt, now)].join(' · ');
}
