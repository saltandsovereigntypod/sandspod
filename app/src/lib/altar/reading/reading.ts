// Reading an altar: what its pieces add up to in the Living Library. Element
// and planetary balance, the intentions it speaks of most, how well it holds
// the altar's own intention, a light note where traditional opposites meet,
// and one suggestion to round it out (preferring something you already own).
// Pure; the sheet shows `sentences`.

import { hasMyPractice } from '../../library/model.ts';
import type { LibraryEntry } from '../../library/types.ts';
import { builtInCabinet, placeableForms } from '../cabinet.ts';
import type { CabinetItem, SavedObject } from '../types.ts';
import {
  correspondenceOf,
  ELEMENTS,
  libraryOr,
  listing,
  objectCorrespondences,
  planetName,
  tally,
  type Correspondence,
  type Element,
  type Planet,
} from './correspondence.ts';
import { coherence, intentionKeywords, scoreAltar, usesThemes, type Support } from './intention.ts';

export type Suggestion = {
  name: string;
  /** Library type: herb or crystal. */
  type: string;
  entryId: string;
  element: Element;
  /** Already in the person's cabinet or practice. */
  owned: boolean;
  /** Where to place it from: a built-in or custom cabinet item and form, when it has a picture. */
  cabinetItemId?: string;
  formLabel?: string;
  why: string;
};

export type AltarReading = {
  pieces: number;
  elements: Record<Element, number>;
  spirit: number;
  planets: { key: Planet; count: number }[];
  /** The themes it speaks of most ("love", "protection"…). */
  dominant: string[];
  intention: { text: string; score: number; supports: Support[] } | null;
  clashes: string[];
  suggestion: Suggestion | null;
  /** The reading, in order, ready to show. */
  sentences: string[];
};

export type ReadingInput = {
  objects: SavedObject[];
  entries?: LibraryEntry[] | null;
  intention?: string | null;
  /** The person's own cabinet items (workshop.customItems). */
  cabinet?: CabinetItem[];
  /** Other names the person owns (apothecary ingredients, things they keep). */
  ownedNames?: string[];
};

/** Traditional opposites: Fire and Water, Air and Earth. */
const ELEMENT_OPPOSITES: [Element, Element][] = [
  ['Fire', 'Water'],
  ['Air', 'Earth'],
];

/**
 * Planets in traditional detriment to each other (each rules the sign opposite
 * the other's): Mars and Venus, the Sun and Saturn, the Moon and Saturn,
 * Jupiter and Mercury.
 */
const PLANET_OPPOSITES: [Planet, Planet, string][] = [
  ['Mars', 'Venus', 'drive and ease; many love workings pair them on purpose'],
  ['Sun', 'Saturn', 'shining out and holding in; good for steady, lasting work'],
  ['Moon', 'Saturn', 'feeling and form; a fine pairing for boundaries'],
  ['Jupiter', 'Mercury', 'the big picture and the fine print; useful for study and contracts'],
];

const DRAWING = ['love', 'attraction', 'prosperity', 'abundance', 'luck', 'money', 'success', 'fertility'];
const BANISHING = ['banishing', 'hex breaking', 'uncrossing', 'exorcism', 'binding'];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim();

function ownedSet(input: ReadingInput, pool: LibraryEntry[]): Set<string> {
  const names = new Set<string>();
  for (const item of input.cabinet ?? []) names.add(norm(item.name));
  for (const n of input.ownedNames ?? []) names.add(norm(n));
  for (const e of pool) if (hasMyPractice(e)) names.add(norm(e.name));
  return names;
}

/** A cabinet item (yours first) and form to place a Library herb or crystal from. */
export function cabinetFor(entry: LibraryEntry, cabinet: CabinetItem[] = []): { item: CabinetItem; formLabel: string } | null {
  const key = entry.id.split(':')[2] ?? '';
  const name = norm(entry.name);
  const own = cabinet.find((i) => norm(i.name) === name && placeableForms(i).length);
  if (own) return { item: own, formLabel: placeableForms(own)[0].label };
  const builtIn = builtInCabinet.find(
    (i) => (entry.type === 'herb' ? i.category === 'herbs' : i.category === 'crystals') && i.forms.some((f) => (f.herb || f.crystal) === key),
  );
  if (!builtIn) return null;
  const forms = placeableForms(builtIn);
  const preferred = forms.find((f) => f.form === 'tumbled' || f.form === 'sprig') ?? forms[0];
  return preferred ? { item: builtIn, formLabel: preferred.label } : null;
}

function suggest(
  counts: Record<Element, number>,
  themes: string[],
  present: Set<string>,
  owned: Set<string>,
  pool: LibraryEntry[],
  cabinet: CabinetItem[],
): Suggestion | null {
  // The quietest element, in the traditional order when tied.
  const gap = [...ELEMENTS].sort((a, b) => counts[a] - counts[b])[0];
  const candidates = pool
    .filter((e) => (e.type === 'herb' || e.type === 'crystal') && !present.has(norm(e.name)))
    .map((e) => ({ e, c: correspondenceOf(e) }))
    .filter(({ c }) => c.element === gap);
  if (!candidates.length) return null;
  const scored = candidates
    .map(({ e, c }) => {
      const fit = usesThemes(c.uses).filter((t) => themes.includes(t)).length;
      const own = owned.has(norm(e.name));
      const place = cabinetFor(e, cabinet);
      return { e, c, fit, own, place, score: (own ? 10 : 0) + fit * 2 + (place ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name));
  const best = scored[0];
  const fitThemes = usesThemes(best.c.uses).filter((t) => themes.includes(t));
  const lead = counts[gap] === 0 ? `${gap} is missing` : `${gap} is the quietest element here`;
  const suits = fitThemes.length ? `, and it suits ${listing(fitThemes.slice(0, 2))}` : best.c.uses.length ? `; it’s traditionally used for ${listing(best.c.uses.slice(0, 2))}` : '';
  const why = `To round it out: ${lead}. ${best.e.name} would bring it${suits}.${best.own ? ' It’s already in your cabinet.' : ''}`;
  const suggestion: Suggestion = { name: best.e.name, type: best.e.type, entryId: best.e.id, element: gap, owned: best.own, why };
  if (best.place) {
    suggestion.cabinetItemId = best.place.item.id;
    suggestion.formLabel = best.place.formLabel;
  }
  return suggestion;
}

/** Read an altar. */
export function readAltar(input: ReadingInput): AltarReading {
  const pool = libraryOr(input.entries);
  const objects = input.objects.filter((o) => o && o.type !== 'cloth');
  const perObject: Correspondence[][] = objects.map((o) => objectCorrespondences(o, pool));
  const all = perObject.flat();
  const elements = Object.fromEntries(ELEMENTS.map((e) => [e, 0])) as Record<Element, number>;
  let spirit = 0;
  for (const c of all) {
    if (c.element === 'Spirit') spirit += 1;
    else if (c.element) elements[c.element] += 1;
  }
  const planets = tally(all.map((c) => c.planet));
  const themeTally = tally(perObject.flatMap((parts) => [...new Set(parts.flatMap((c) => usesThemes(c.uses.slice(0, 5))))]));
  const dominant = themeTally.slice(0, 3).map((t) => t.key);
  const intentionText = (input.intention ?? '').trim();
  const supports = intentionText ? scoreAltar(objects, intentionText, pool) : [];
  const intention = intentionText ? { text: intentionText, score: coherence(supports), supports } : null;

  const sentences: string[] = [];
  if (!objects.length) {
    return { pieces: 0, elements, spirit, planets, dominant, intention, clashes: [], suggestion: null, sentences: ['The altar is bare. Place a first piece and it will have something to say.'] };
  }

  // Elements.
  const ranked = [...ELEMENTS].filter((e) => elements[e] > 0).sort((a, b) => elements[b] - elements[a]);
  const quiet = ELEMENTS.filter((e) => elements[e] === 0);
  if (!ranked.length) {
    sentences.push(`Your altar holds ${objects.length} piece${objects.length === 1 ? '' : 's'}, none the Library ties to an element yet.`);
  } else {
    const lead = ranked[0];
    const second = ranked[1] && elements[ranked[1]] === elements[lead] ? ` and ${ranked[1]} together` : ranked[1] ? `, with ${ranked[1]} close behind` : '';
    const leads = ranked[1] && elements[ranked[1]] === elements[lead] ? `${lead}${second} lead` : `${lead} leads${second}`;
    const quietLine = quiet.length === 4 ? '' : quiet.length ? ` ${listing(quiet)} ${quiet.length === 1 ? 'is' : 'are'} quiet.` : ' All four elements are here.';
    sentences.push(`Your altar holds ${objects.length} piece${objects.length === 1 ? '' : 's'}. ${leads}.${quietLine}`);
  }
  if (spirit) sentences.push('There’s Spirit here too, holding the centre.');

  // Planets.
  if (planets.length) {
    const top = planets.filter((p) => p.count === planets[0].count).map((p) => planetName(p.key));
    sentences.push(top.length > 1 ? `${listing(top.slice(0, 3))} share the strongest pull.` : `${top[0].charAt(0).toUpperCase()}${top[0].slice(1)} has the strongest pull.`);
  }

  // What it speaks of.
  if (dominant.length) sentences.push(`Taken together it speaks of ${listing(dominant)}.`);

  // The intention.
  if (intention) {
    const speaking = supports.filter((s) => s.score > 0);
    if (!speaking.length) {
      sentences.push(`For “${intention.text}”, nothing here is traditionally tied to it yet; your own meaning counts, and the suggestion below may help.`);
    } else {
      const clearest = speaking.slice(0, 2).map((s) => s.label);
      sentences.push(`For “${intention.text}”, ${speaking.length} of ${supports.length} pieces speak to it, ${listing(clearest)} most clearly.`);
    }
  }

  // Gentle clash notes.
  const clashes: string[] = [];
  for (const [a, b] of ELEMENT_OPPOSITES) {
    if (elements[a] >= 2 && elements[b] >= 2) {
      clashes.push(`${a} and ${b} both run strong. They’re traditional opposites, which can be balance as easily as tension; something of ${a === 'Fire' ? 'Earth or Air' : 'Fire or Water'} between them steadies it.`);
    }
  }
  const planetKeys = new Set(planets.map((p) => p.key));
  for (const [a, b, note] of PLANET_OPPOSITES) {
    if (planetKeys.has(a) && planetKeys.has(b) && clashes.length < 2) {
      const an = planetName(a);
      clashes.push(`${an.charAt(0).toUpperCase()}${an.slice(1)} and ${planetName(b)} sit together: traditional opposites, ${note}.`);
    }
  }
  const usesAll = new Set(all.flatMap((c) => c.uses));
  if ([...usesAll].some((u) => BANISHING.includes(u)) && [...usesAll].some((u) => DRAWING.includes(u)) && clashes.length < 2) {
    clashes.push('There’s both banishing and drawing here. That works for clearing space to make room; if not, let one lead.');
  }
  sentences.push(...clashes.slice(0, 2));

  // One suggestion.
  const intentThemes = intention ? intentionKeywords(intention.text).themes : [];
  const themes = [...new Set([...intentThemes, ...dominant])];
  const present = new Set(objects.flatMap((o, i) => [norm(String(o.label || '')), ...perObject[i].map((c) => norm(c.name))]));
  const suggestion = suggest(elements, themes, present, ownedSet(input, pool), pool, input.cabinet ?? []);
  if (suggestion) sentences.push(suggestion.why);

  return { pieces: objects.length, elements, spirit, planets, dominant, intention, clashes: clashes.slice(0, 2), suggestion, sentences };
}
