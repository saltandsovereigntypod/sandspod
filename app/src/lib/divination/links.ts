// Where a tarot card's, rune's or ogham stave's page is in the Grimoire's
// Traditional Information → Divination, in the app and on the website. Kept
// light (no page text) so the draw screens can link to a page without
// loading every page. Pure.

import { KIPPER } from './oracle/kipper.ts';
import { LENORMAND } from './oracle/lenormand.ts';
import { BLANK_RUNE, FEDA, RUNES } from './staves.ts';
import { TAROT_DECK } from './tarot.ts';

export type DivinationKind = 'tarot' | 'runes' | 'ogham' | 'lenormand' | 'kipper';
export type DivinationRef = { kind: DivinationKind; id: string };

/** "nGéadal" → "ngeadal", "Blank rune" → "blank-rune". */
export const staveId = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '-')
    .replace(/^-|-$/g, '');

/** The page for a card, rune or stave drawn by name ("The Tower", "Fehu", "Blank rune"). */
export function refForDrawn(name: string): DivinationRef | null {
  const card = TAROT_DECK.find((c) => c.name === name);
  if (card) return { kind: 'tarot', id: card.id };
  if (name === BLANK_RUNE.name || RUNES.some((r) => r.name === name)) return { kind: 'runes', id: staveId(name) };
  if (FEDA.some((f) => f.name === name)) return { kind: 'ogham', id: staveId(name) };
  const len = LENORMAND.find((c) => c.name === name);
  if (len) return { kind: 'lenormand', id: len.id };
  const kip = KIPPER.find((c) => c.name === name);
  if (kip) return { kind: 'kipper', id: kip.id };
  return null;
}

/** Where an entry's page is in the app's Grimoire. */
export const divinationRoute = (ref: DivinationRef) => `/grimoire/divination/${ref.kind}/${encodeURIComponent(ref.id)}`;

/** Where an entry's page is in the website's Book of Shadows. */
export const divinationWebPath = (ref: DivinationRef) => `/grimoire/?divination=${ref.kind}/${encodeURIComponent(ref.id)}`;

/** The website's "Read more" link for a drawn card or stave, or null. */
export function readMoreHref(name: string): string | null {
  const ref = refForDrawn(name);
  return ref ? divinationWebPath(ref) : null;
}
