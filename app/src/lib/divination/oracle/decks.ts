// Decks of your own: an oracle deck you own (or made), its cards with their
// names, a photo of each if you like, a few words and a meaning, and a
// reversed meaning if you read them that way. Kept as craft entries in
// `hedge.oracleDecks`, synced like the reading log, so the app and the
// website both have them; photos go where the altar's photos go (uploaded
// for an account, on the device for a guest). A whole list of cards can be
// pasted in at once, one "Name — meaning" to a line. Pure, so it can be
// tested.

export const DECKS_COLLECTION = 'hedge.oracleDecks';
/** The storage folder for deck and card photos, under the account's own folder. */
export const DECK_PHOTO_FOLDER = 'oracle-decks';

/** The most cards a deck can hold. */
export const MAX_CARDS = 120;

export type OwnCard = {
  /** Stable within its deck. */
  id: string;
  name: string;
  keywords: string;
  meaning: string;
  /** The meaning reversed (blank when you don't read reversals, or haven't written one). */
  reversed: string;
  /** A photo of the card: a public URL when uploaded, a file or data URL on a guest's device, or blank. */
  photo: string;
  /** Where an uploaded photo is kept, to remove it again (blank otherwise). */
  photoPath: string;
};

export type OwnDeckData = {
  name: string;
  /** Who made it, or a line about it (may be blank). */
  detail: string;
  cover: string;
  coverPath: string;
  /** Whether cards can come up reversed when you draw here. */
  reversals: boolean;
  cards: OwnCard[];
};

export type OwnDeckEntry = { id: string; data: OwnDeckData };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
/** A photo address worth keeping: web, file or a small enough data URL. */
const photo = (v: unknown) => (typeof v === 'string' && /^(https?:|file:|data:image\/)/.test(v) && v.length < 3_000_000 ? v : '');

let counter = 0;
/** A short id for a new card, unique enough within one deck. */
export function newCardId(): string {
  counter = (counter + 1) % 1296;
  return `c${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}${counter.toString(36)}`;
}

export function blankOwnCard(name = ''): OwnCard {
  return { id: newCardId(), name, keywords: '', meaning: '', reversed: '', photo: '', photoPath: '' };
}

export function blankOwnDeck(): OwnDeckData {
  return { name: '', detail: '', cover: '', coverPath: '', reversals: false, cards: [] };
}

function normalizeCard(raw: unknown, i: number): OwnCard {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: str(o.id, 40) || `card-${i + 1}`,
    name: str(o.name, 80),
    keywords: str(o.keywords, 160),
    meaning: str(o.meaning, 2000),
    reversed: str(o.reversed, 2000),
    photo: photo(o.photo),
    photoPath: str(o.photoPath, 300),
  };
}

/** Whatever was saved (on this device, the other one, or an older version), made whole. */
export function normalizeOwnDeck(raw: unknown): OwnDeckData {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const list = Array.isArray(r.cards) ? r.cards.slice(0, MAX_CARDS) : [];
  const seen = new Set<string>();
  const cards = list.map(normalizeCard).map((c, i) => {
    // Ids stay unique, so a card can always be found again.
    const id = seen.has(c.id) ? `${c.id}-${i + 1}` : c.id;
    seen.add(id);
    return { ...c, id };
  });
  return {
    name: str(r.name, 80),
    detail: str(r.detail, 240),
    cover: photo(r.cover),
    coverPath: str(r.coverPath, 300),
    reversals: r.reversals === true,
    cards,
  };
}

/**
 * Tidied for keeping: a blank deck name becomes "My deck", blank cards are
 * dropped, and two cards never share a name (a second "Moon" becomes
 * "Moon (2)"), since a reading keeps its cards by name.
 */
export function tidyOwnDeck(data: OwnDeckData): OwnDeckData {
  const d = normalizeOwnDeck(data);
  const taken = new Map<string, number>();
  const cards = d.cards
    .filter((c) => c.name || c.meaning || c.keywords || c.photo)
    .map((c, i) => {
      const base = c.name || `Card ${i + 1}`;
      const key = base.toLowerCase();
      const n = (taken.get(key) ?? 0) + 1;
      taken.set(key, n);
      return { ...c, name: n === 1 ? base : `${base} (${n})` };
    });
  return { ...d, name: d.name || 'My deck', cards };
}

/** Your decks, A to Z, from the collection's entries. */
export function ownDecks(entries: { id: string; data: unknown }[]): OwnDeckEntry[] {
  return entries.map((e) => ({ id: e.id, data: tidyOwnDeck(normalizeOwnDeck(e.data)) })).sort((a, b) => a.data.name.localeCompare(b.data.name));
}

export const ownDeckById = (decks: OwnDeckEntry[], id: string | null | undefined): OwnDeckEntry | null => decks.find((d) => d.id === id) ?? null;

export const ownCard = (deck: OwnDeckData, name: string): OwnCard | null => deck.cards.find((c) => c.name === name) ?? null;

// ─── Pasting a list of cards ─────────────────────────────────────────────

/** Between a card's name and its meaning: a dash of any length with spaces, a colon, a bar or a tab. */
const SEPARATOR = /\s+[—–-]\s+|\s*:\s+|\s*\|\s*|\t+/;

/**
 * Cards from pasted lines, one to a line: "Name — meaning", or
 * "Name — keywords — meaning" with three parts. Numbers in front ("12.",
 * "12)") and bullets are dropped; blank lines are skipped.
 */
export function parseCardList(text: string): { name: string; keywords: string; meaning: string }[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•·]\s+|\d+\s*[.)]\s*)/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(SEPARATOR).map((p) => p.trim());
      const name = parts[0].slice(0, 80);
      if (parts.length >= 3) return { name, keywords: parts[1].slice(0, 160), meaning: parts.slice(2).join(' — ').slice(0, 2000) };
      return { name, keywords: '', meaning: (parts[1] ?? '').slice(0, 2000) };
    })
    .filter((c) => c.name);
}

/**
 * The deck with pasted cards added: a card whose name is already in the
 * deck gets the pasted words where its own are blank; new ones go on the
 * end, up to the most a deck holds. Says how many were added and updated.
 */
export function importCards(deck: OwnDeckData, text: string): { deck: OwnDeckData; added: number; updated: number; skipped: number } {
  const cards = deck.cards.map((c) => ({ ...c }));
  let added = 0;
  let updated = 0;
  let skipped = 0;
  for (const p of parseCardList(text)) {
    const same = cards.find((c) => c.name.toLowerCase() === p.name.toLowerCase());
    if (same) {
      const next = { ...same, keywords: same.keywords || p.keywords, meaning: same.meaning || p.meaning };
      if (next.keywords !== same.keywords || next.meaning !== same.meaning) updated++;
      Object.assign(same, next);
    } else if (cards.length >= MAX_CARDS) {
      skipped++;
    } else {
      cards.push({ ...blankOwnCard(p.name), keywords: p.keywords, meaning: p.meaning });
      added++;
    }
  }
  return { deck: { ...deck, cards }, added, updated, skipped };
}

/** A card's meaning for a draw, upright or reversed (falling back to upright when no reversed meaning is written). */
export function ownMeaning(card: OwnCard, reversed: boolean): { keywords: string; text: string } {
  if (reversed && card.reversed) return { keywords: card.keywords ? `${card.keywords}, reversed` : 'reversed', text: card.reversed };
  return { keywords: card.keywords, text: card.meaning || (reversed ? 'Reversed. You haven’t written a meaning for this card yet: what does it say to you?' : 'You haven’t written a meaning for this card yet: what does it say to you?') };
}

/** The photos a deck holds in storage, to remove when it's deleted. */
export const deckStoragePaths = (deck: OwnDeckData): string[] => [deck.coverPath, ...deck.cards.map((c) => c.photoPath)].filter(Boolean);
