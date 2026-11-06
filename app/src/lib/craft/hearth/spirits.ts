// Spirits of place: the presences you come to know on your land journal's
// places (an old tree, a spring, the house itself, the dead of a hill), what
// you have sensed of them and where, and each time you went to them: what
// you gave and how it seemed to be received. Offering notes already written
// in the land journal (land.notes with the "offering" kind) are read in
// beside them, so nothing is written twice.
//
// Kept as craft entries (collection land.spirits), like the places. Pure, so
// it can be tested and shared with the website (js/core/spirit.js).

import { dateFromKey } from '../../rituals/lifecycle.ts';
import type { LandNote } from './land.ts';

export const LAND_SPIRITS = 'land.spirits';

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const day = (v: unknown) => (dateFromKey(str(v)) ? str(v) : '');

export type SpiritKind = 'genius' | 'house' | 'tree' | 'water' | 'stone' | 'hill' | 'animal' | 'dead' | 'good-folk' | 'unknown';

export const SPIRIT_KINDS: { id: SpiritKind; label: string; hint: string }[] = [
  { id: 'genius', label: 'The spirit of the whole place', hint: 'The Romans called it the genius loci: the place’s own life and character, honoured at its own small shrine.' },
  { id: 'house', label: 'A house or hearth spirit', hint: 'The household spirits of folk belief: the brownie of Scotland and the north of England, the Slavic domovoi, the Norse tomte or nisse. Kept with small courtesies and a clean hearth.' },
  { id: 'tree', label: 'A tree', hint: 'A particular tree with presence: a lone thorn, an old yew, an oak at a boundary.' },
  { id: 'water', label: 'A spring, well or river', hint: 'Waters were among the most widely honoured places in Britain and Ireland: rag wells and pins dropped in holy wells carry the custom on.' },
  { id: 'stone', label: 'A stone', hint: 'A standing stone, a boulder, a cairn, a rock you always touch in passing.' },
  { id: 'hill', label: 'A hill, crossroads or boundary', hint: 'High places, meeting places and the edges of things.' },
  { id: 'animal', label: 'An animal presence', hint: 'A hare that is always there, the rooks of a particular wood: the land speaking through its creatures.' },
  { id: 'dead', label: 'The dead of the place', hint: 'Those who lived and died there before you, known by name or not.' },
  { id: 'good-folk', label: 'The Good Folk', hint: 'The fairies of Irish and British belief, not small or sweet in the old tales. Courtesy, kept promises, and leaving their places (forts, lone thorns) alone are the old advice.' },
  { id: 'unknown', label: 'Not yet known', hint: 'Something is there; you don’t yet know what. Most honest beginnings start here.' },
];
export const spiritKindLabel = (id: string) => SPIRIT_KINDS.find((k) => k.id === id)?.label ?? 'A presence';

export type Sense = 'seen' | 'heard' | 'felt' | 'smelt' | 'dreamt' | 'sign';
export const SENSES: { id: Sense; label: string }[] = [
  { id: 'felt', label: 'Felt' },
  { id: 'seen', label: 'Seen' },
  { id: 'heard', label: 'Heard' },
  { id: 'smelt', label: 'Smelt' },
  { id: 'dreamt', label: 'Dreamt' },
  { id: 'sign', label: 'A sign or omen' },
];

export type Reception = 'welcomed' | 'quiet' | 'unclear' | 'refused';
export const RECEPTIONS: { id: Reception; label: string; hint: string }[] = [
  { id: 'welcomed', label: 'Welcomed', hint: 'Warmth, ease, a sign that felt like thanks' },
  { id: 'quiet', label: 'Quiet', hint: 'Nothing marked; the place carried on' },
  { id: 'unclear', label: 'Hard to say', hint: 'Mixed, or you couldn’t settle enough to tell' },
  { id: 'refused', label: 'Not welcome', hint: 'Unease, a turn in the weather, a wish to leave. Listen to it.' },
];
export const receptionLabel = (id: string) => RECEPTIONS.find((r) => r.id === id)?.label ?? '';

export type Encounter = {
  /** YYYY-MM-DD. */
  on: string;
  /** What you sensed this time. */
  sensed: string;
  senses: Sense[];
  /** What you gave, if anything. */
  offering: string;
  received: Reception | null;
  notes: string;
};

export type PlaceSpirit = {
  /** What you call it, or a description ("the one by the gate"). */
  name: string;
  kind: SpiritKind;
  /** The land.places entry it lives in, or null. */
  placeId: string | null;
  /** Where in the place: "the thorn at the field corner". */
  spot: string;
  /** How it shows itself, in your words. */
  sensed: string;
  /** How you greet it, and what seems welcome. */
  greeting: string;
  likes: string;
  /** What not to do there. */
  avoid: string;
  /** First known, YYYY-MM-DD, or blank. */
  since: string;
  encounters: Encounter[];
  resting: boolean;
};

export const blankSpirit = (placeId: string | null = null): PlaceSpirit => ({
  name: '',
  kind: 'unknown',
  placeId,
  spot: '',
  sensed: '',
  greeting: '',
  likes: '',
  avoid: '',
  since: '',
  encounters: [],
  resting: false,
});

export const blankEncounter = (on: string): Encounter => ({ on, sensed: '', senses: [], offering: '', received: null, notes: '' });

function normalizeEncounter(raw: unknown): Encounter | null {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const on = day(r.on);
  if (!on) return null;
  return {
    on,
    sensed: str(r.sensed),
    senses: Array.isArray(r.senses) ? (r.senses.filter((s) => SENSES.some((x) => x.id === s)) as Sense[]) : [],
    offering: str(r.offering),
    received: RECEPTIONS.some((x) => x.id === r.received) ? (r.received as Reception) : null,
    notes: str(r.notes),
  };
}

export function normalizeSpirit(raw: unknown): PlaceSpirit {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const encounters = (Array.isArray(r.encounters) ? r.encounters : []).map(normalizeEncounter).filter((e): e is Encounter => !!e);
  return {
    name: str(r.name).trim() || 'A presence',
    kind: SPIRIT_KINDS.some((k) => k.id === r.kind) ? (r.kind as SpiritKind) : 'unknown',
    placeId: typeof r.placeId === 'string' && r.placeId ? r.placeId : null,
    spot: str(r.spot),
    sensed: str(r.sensed),
    greeting: str(r.greeting),
    likes: str(r.likes),
    avoid: str(r.avoid),
    since: day(r.since),
    encounters: encounters.sort((a, b) => b.on.localeCompare(a.on)).slice(0, 400),
    resting: r.resting === true,
  };
}

/** Add or replace a visit (same day and index), newest first. */
export function withEncounter(spirit: PlaceSpirit, encounter: Encounter, index: number | null = null): PlaceSpirit {
  const list = [...spirit.encounters];
  if (index !== null && index >= 0 && index < list.length) list[index] = encounter;
  else list.push(encounter);
  return { ...spirit, encounters: list.sort((a, b) => b.on.localeCompare(a.on)) };
}

export const withoutEncounter = (spirit: PlaceSpirit, index: number): PlaceSpirit => ({ ...spirit, encounters: spirit.encounters.filter((_, i) => i !== index) });

export type TimelineItem = { on: string; kind: 'visit' | 'note'; title: string; detail: string; index?: number; noteId?: string; received: Reception | null };

/**
 * A spirit's visits, with the offering notes from the land journal at the
 * same place, newest first. A note is the land journal's; a visit is the
 * spirit's own.
 */
export function spiritTimeline(spirit: PlaceSpirit, notes: { id: string; data: LandNote }[]): TimelineItem[] {
  const out: TimelineItem[] = spirit.encounters.map((e, index) => ({
    on: e.on,
    kind: 'visit',
    title: e.offering ? `Gave ${e.offering}` : 'A visit',
    detail: [e.received ? receptionLabel(e.received) : '', e.sensed].filter(Boolean).join(' · '),
    index,
    received: e.received,
  }));
  if (spirit.placeId) {
    for (const n of notes) {
      if (n.data.placeId !== spirit.placeId || !n.data.kinds.includes('offering')) continue;
      out.push({ on: n.data.on, kind: 'note', title: n.data.offering ? `Offered ${n.data.offering}` : 'An offering', detail: n.data.text.slice(0, 120), noteId: n.id, received: null });
    }
  }
  return out.sort((a, b) => b.on.localeCompare(a.on));
}

/** How offerings have been received, counted: the pattern says more than any one visit. */
export function receptionCounts(spirit: PlaceSpirit): Record<Reception, number> {
  const counts: Record<Reception, number> = { welcomed: 0, quiet: 0, unclear: 0, refused: 0 };
  for (const e of spirit.encounters) if (e.received) counts[e.received] += 1;
  return counts;
}

/** What was given and well received, most often first: what seems welcome. */
export function welcomeOfferings(spirit: PlaceSpirit): string[] {
  const tally = new Map<string, number>();
  for (const e of spirit.encounters) {
    if (e.received !== 'welcomed' || !e.offering.trim()) continue;
    const key = e.offering.trim().toLowerCase();
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k]) => k);
}

/** The line under a spirit in a list: its kind, the place, the last visit. */
export function spiritLine(spirit: PlaceSpirit, placeName: string | null): string {
  const last = spirit.encounters[0];
  return [spiritKindLabel(spirit.kind), placeName, last ? `last visited ${last.on}` : ''].filter(Boolean).join(' · ');
}

/** Spirits at a place, or all; resting ones last, then by name. */
export function spiritsAt<T extends { data: PlaceSpirit }>(spirits: T[], placeId: string | null = null): T[] {
  return spirits
    .filter((s) => placeId === null || s.data.placeId === placeId)
    .sort((a, b) => Number(a.data.resting) - Number(b.data.resting) || a.data.name.localeCompare(b.data.name));
}

/** Shown on the spirits page and with each place. */
export const LAND_RESPECT = [
  'Most land has been known, named and cared for long before you. Where you live on the land of Indigenous peoples, its spirits have relationships with them that you were not part of: learn whose land it is, and don’t borrow their names for its spirits, their ceremonies or their sacred places. Listening, cleaning up, giving to the people of that land and keeping your own tradition’s courtesies are good ways to begin.',
  'Some places are someone else’s holy ground: a churchyard, a shrine, a well still visited. Leave what is there as you found it.',
  'Offer what can’t harm: clean water, a song, your time, litter picked up. Food left outside feeds wildlife and can poison pets (chocolate, grapes, onion, alcohol); bread is bad for ducks, and nothing should go into a spring or pond.',
  'If a place doesn’t want you, believe it. Go, and come back another day, or don’t.',
];
