// Tarot, runes and ogham as Traditional Information in the Grimoire: the
// Divination drop-downs on its contents (Tarot by Major Arcana then suit;
// the runes in futhark order; the ogham Beith to Iodhadh), each entry's
// page, how a search finds them, and the way from a drawn card or stave to
// its page. Built-in, like Dreams: never a row in grimoire_sections or the
// Living Library, so nothing is saved. The website's Book of Shadows uses
// the same functions (grimoire/js/ui/divination.js via
// js/core/divination-library.js). Pure.

import { BLANK_RUNE, FEDA, RUNES, type Stave } from './staves.ts';
import { divinationRoute, divinationWebPath, readMoreHref, refForDrawn, staveId, type DivinationKind, type DivinationRef } from './links.ts';
import { STAVE_SECTIONS, staveDeep } from './stavesDeep.ts';
import type { TarotCard } from './tarot.ts';
import { TAROT_GROUPS, TAROT_SECTIONS, tarotDeep, wordsLine, type ThreeWords } from './tarotDeep.ts';

export { divinationRoute, divinationWebPath, readMoreHref, refForDrawn, staveId, wordsLine };
export type { DivinationKind, DivinationRef };
export type { ThreeWords };

export type DivinationEntry = {
  kind: DivinationKind;
  /** Stable within its kind: a tarot card's id ("cups-07"), or a stave's name made plain ("fehu", "ngeadal"). */
  id: string;
  name: string;
  words: ThreeWords;
  /** A tarot card's id, for its picture. */
  cardId: string | null;
  /** A rune's or a stave's letter (empty for the blank rune). */
  glyph: string | null;
};

export type DivinationSubgroup = { key: string; label: string; entries: DivinationEntry[] };
export type DivinationGroup = { kind: DivinationKind; label: string; note: string; subgroups: DivinationSubgroup[] };

/** The Grimoire's heading for the three drop-downs. */
export const DIVINATION_TITLE = 'Divination';

export const DIVINATION_LABELS: Record<DivinationKind, string> = { tarot: 'Tarot', runes: 'Runes', ogham: 'Ogham' };

const NOTES: Record<DivinationKind, string> = {
  tarot: 'The Rider–Waite–Smith deck of 1909: Pamela Colman Smith’s pictures, A. E. Waite’s meanings.',
  runes: 'The twenty-four runes of the Elder Futhark, and the modern blank rune.',
  ogham: 'The twenty feda of the ogham, in their four aicmí.',
};

const fromCard = (card: TarotCard): DivinationEntry => ({
  kind: 'tarot',
  id: card.id,
  name: card.name,
  words: tarotDeep(card.id)!.words,
  cardId: card.id,
  glyph: null,
});

const fromStave = (kind: 'runes' | 'ogham', stave: Stave): DivinationEntry => ({
  kind,
  id: staveId(stave.name),
  name: stave.name,
  words: staveDeep(stave.name)!.words,
  cardId: null,
  glyph: stave.glyph,
});

let groupsCache: DivinationGroup[] | null = null;

/** Every entry, grouped as the Grimoire shows them. */
export function allDivinationGroups(): DivinationGroup[] {
  if (groupsCache) return groupsCache;
  groupsCache = [
    { kind: 'tarot', label: DIVINATION_LABELS.tarot, note: NOTES.tarot, subgroups: TAROT_GROUPS.map((g) => ({ key: g.key, label: g.label, entries: g.cards.map(fromCard) })) },
    {
      kind: 'runes',
      label: DIVINATION_LABELS.runes,
      note: NOTES.runes,
      subgroups: [
        { key: 'freyr', label: 'Freyr’s aett', entries: RUNES.slice(0, 8).map((r) => fromStave('runes', r)) },
        { key: 'hagal', label: 'Hagal’s aett', entries: RUNES.slice(8, 16).map((r) => fromStave('runes', r)) },
        { key: 'tyr', label: 'Tyr’s aett', entries: RUNES.slice(16, 24).map((r) => fromStave('runes', r)) },
        { key: 'modern', label: 'Modern', entries: [fromStave('runes', BLANK_RUNE)] },
      ],
    },
    {
      kind: 'ogham',
      label: DIVINATION_LABELS.ogham,
      note: NOTES.ogham,
      subgroups: [
        { key: 'beithe', label: 'Aicme Beithe', entries: FEDA.slice(0, 5).map((f) => fromStave('ogham', f)) },
        { key: 'huatha', label: 'Aicme hÚatha', entries: FEDA.slice(5, 10).map((f) => fromStave('ogham', f)) },
        { key: 'muine', label: 'Aicme Muine', entries: FEDA.slice(10, 15).map((f) => fromStave('ogham', f)) },
        { key: 'ailme', label: 'Aicme Ailme', entries: FEDA.slice(15, 20).map((f) => fromStave('ogham', f)) },
      ],
    },
  ];
  return groupsCache;
}

export const allDivinationEntries = (): DivinationEntry[] => allDivinationGroups().flatMap((g) => g.subgroups.flatMap((s) => s.entries));

export const countOf = (group: DivinationGroup) => group.subgroups.reduce((sum, s) => sum + s.entries.length, 0);

export function findDivination(kind: string | null | undefined, id: string | null | undefined): DivinationEntry | null {
  return allDivinationEntries().find((e) => e.kind === kind && e.id === id) ?? null;
}

export type DivinationPage = {
  entry: DivinationEntry;
  /** "Major Arcana · 0", "Cups", "Freyr’s aett · 1 of 24", "Aicme Beithe · B". */
  eyebrow: string;
  /** What the stave names: "cattle, wealth", "birch". */
  gloss: string | null;
  sections: { key: string; label: string; text: string }[];
};

/** An entry's page: its place, and its sections in order (empty ones left out). */
export function divinationPage(entry: DivinationEntry): DivinationPage {
  if (entry.kind === 'tarot') {
    const deep = tarotDeep(entry.id)!;
    const n = Number(entry.id.slice(0, 2));
    const group = TAROT_GROUPS.find((g) => g.cards.some((c) => c.id === entry.id))!;
    return {
      entry,
      eyebrow: group.key === 'major' ? `Major Arcana · ${n}` : `Minor Arcana · ${group.label}`,
      gloss: null,
      sections: TAROT_SECTIONS.map((s) => ({ ...s, text: deep[s.key] })).filter((s) => s.text),
    };
  }
  const deep = staveDeep(entry.name)!;
  const group = allDivinationGroups().find((g) => g.kind === entry.kind)!;
  const sub = group.subgroups.find((s) => s.entries.some((e) => e.id === entry.id))!;
  const stave = entry.kind === 'runes' ? [...RUNES, BLANK_RUNE].find((r) => r.name === entry.name)! : FEDA.find((f) => f.name === entry.name)!;
  const position = entry.kind === 'runes' && entry.name !== BLANK_RUNE.name ? ` · ${RUNES.indexOf(stave) + 1} of 24` : '';
  return {
    entry,
    eyebrow: `${group.label} · ${sub.label}${position}`,
    gloss: stave.gloss,
    sections: STAVE_SECTIONS.map((s) => ({ ...s, text: deep[s.key] ?? '' })).filter((s) => s.text),
  };
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

let searchIndex: Map<DivinationEntry, { head: string; body: string }> | null = null;

function indexOf(): Map<DivinationEntry, { head: string; body: string }> {
  if (searchIndex) return searchIndex;
  searchIndex = new Map(
    allDivinationEntries().map((entry) => {
      const page = divinationPage(entry);
      const head = fold([entry.name, DIVINATION_LABELS[entry.kind], ...entry.words, page.gloss ?? '', page.eyebrow].join(' '));
      return [entry, { head, body: fold(page.sections.map((s) => s.text).join(' ')) }];
    }),
  );
  return searchIndex;
}

/**
 * The drop-downs for a Grimoire search: every entry when the search is
 * empty; otherwise those whose name, words or page hold every word searched
 * for, in the Grimoire's order, with the empty groups left out.
 */
export function divinationGroups(query = ''): DivinationGroup[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return allDivinationGroups();
  const index = indexOf();
  const matches = (entry: DivinationEntry) => {
    const { head, body } = index.get(entry)!;
    return terms.every((t) => head.includes(t) || body.includes(t));
  };
  return allDivinationGroups()
    .map((group) => ({
      ...group,
      subgroups: group.subgroups.map((s) => ({ ...s, entries: s.entries.filter(matches) })).filter((s) => s.entries.length > 0),
    }))
    .filter((group) => group.subgroups.length > 0);
}

/** The page for a card, rune or stave drawn by name ("The Tower", "Fehu", "Blank rune"). */
export function entryForDrawn(name: string): DivinationEntry | null {
  const ref = refForDrawn(name);
  return ref ? findDivination(ref.kind, ref.id) : null;
}

/** Read a website "?divination=tarot/cups-07" back into an entry. */
export function parseDivinationParam(value: string | null | undefined): DivinationEntry | null {
  if (!value) return null;
  const [kind, id] = decodeURIComponent(value).split('/');
  return findDivination(kind, id);
}
