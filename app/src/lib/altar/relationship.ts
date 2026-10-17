// A relationship with a presence on the altar: how many offerings, the
// crystals dedicated to them, the signs and responses you recorded, when it
// began and when you last came, and the traditional feast days of their own
// tradition coming up (from holidays.ts, only where the festival is theirs).
// And making an offering as an act: a short guided moment (pour, set it down,
// speak) before it's recorded. Pure.

import { shortLabel } from './cabinet.ts';
import { crystalState, deityState, offeringsOf, type Offering } from './devotion.ts';
import { holidaysBetween, TRADITIONS, type Holiday } from '../holidays.ts';
import type { SavedObject } from './types.ts';

type Rec = Record<string, unknown>;
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const DAY = 86_400_000;

/**
 * Feast days kept for a deity in their own tradition's calendar, as
 * "<tradition>/<holiday>" ids from holidays.ts. Only festivals that are the
 * deity's own (Athena's Panathenaia, Brigid's Imbolc, Lugh's Lughnasadh), not
 * every festival of the pantheon.
 */
export const FEASTS: Record<string, string[]> = {
  athena: ['hellenic/panathenaia', 'hellenic/plynteria'],
  demeter: ['hellenic/eleusinia', 'hellenic/thesmophoria', 'hellenic/haloa', 'hellenic/skira'],
  persephone: ['hellenic/eleusinia', 'hellenic/thesmophoria', 'hellenic/skira'],
  apollo: ['hellenic/pyanepsia', 'hellenic/thargelia'],
  artemis: ['hellenic/mounichia', 'hellenic/thargelia'],
  dionysus: ['hellenic/haloa', 'hellenic/lenaia', 'hellenic/anthesteria', 'hellenic/dionysia'],
  hekate: ['hellenic_monthly/deipnon'],
  brigid: ['celtic/la_fheile_bride', 'wheel/imbolc'],
  lugh: ['celtic/lughnasadh', 'wheel/lammas'],
  juno: ['roman/matronalia'],
  vesta: ['roman/vestalia'],
  morana: ['slavic/marzanna'],
  dazhbog: ['slavic/koliada'],
};

export type Feast = { name: string; date: Date; tradition: string; meaning: string; days: number };

/** The deity's key (hekate, brigid…) from the object. */
export const deityKeyOf = (object: SavedObject) => String(object.deity || '').toLowerCase().replace(/_/g, '-');

/** Their name, as you'd say it: "Hekate" from "Hekate Statue". */
export function deityName(object: SavedObject): string {
  const label = shortLabel(object.label, '').replace(/\s+(statue|figure|image|idol|icon)$/i, '').trim();
  if (label) return label;
  const key = deityKeyOf(object);
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : 'this presence';
}

/** Their feast days from `from`, soonest first, the next of each (up to `limit`). */
export function feastDays(object: SavedObject, from: Date, limit = 3): Feast[] {
  const picks = FEASTS[deityKeyOf(object)] ?? [];
  if (!picks.length) return [];
  const traditions = [...new Set(picks.map((p) => p.split('/')[0]))];
  const to = new Date(from.getTime() + 400 * DAY);
  const all = holidaysBetween(from, to, { traditions, custom: [] });
  const out: Feast[] = [];
  const seen = new Set<string>();
  for (const pick of picks) {
    const [traditionId, holidayId] = pick.split('/');
    const def = TRADITIONS.find((t) => t.id === traditionId)?.holidays.find((h) => h.id === holidayId);
    if (!def) continue;
    const next = all.find((h: Holiday) => h.id.startsWith(`${traditionId}-${holidayId}-`) || (h.traditionIds.includes(traditionId) && h.name === def.name));
    if (!next) continue;
    const key = `${next.name}|${next.date.getTime()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: next.name, date: next.date, tradition: next.traditions[0] ?? '', meaning: next.meaning, days: next.days });
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}

export type Relationship = {
  name: string;
  offerings: number;
  /** Crystals on this altar dedicated to them. */
  dedications: string[];
  /** Offerings where you recorded a response or a sign. */
  signs: number;
  firstAt: string | null;
  lastAt: string | null;
  reason: string;
  feasts: Feast[];
  /** "12 offerings since 3 March; the last 4 days ago. 2 signs recorded." */
  summary: string;
};

const NO_RESPONSE = new Set(['', 'not-yet-known']);
const hasSign = (o: Offering) => !NO_RESPONSE.has(str(o.perceivedResponse)) || !!str(o.responseNotes);

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });

/** The relationship with a deity on the altar, read from its own state and the other objects'. */
export function deityRelationship(deity: SavedObject, objects: SavedObject[], now: Date): Relationship {
  const at = now.toISOString();
  const name = deityName(deity);
  const offerings = offeringsOf(deity, at).filter((o) => Number.isFinite(Date.parse(String(o.occurredAt || ''))));
  const firstAt = offerings.length ? String(offerings[offerings.length - 1].occurredAt) : null;
  const lastAt = offerings.length ? String(offerings[0].occurredAt) : null;
  const signs = offerings.filter(hasSign).length;
  const id = String(deity.altarObjectId || '');
  const entity = String(deity.entityId || '');
  const lowerName = name.toLowerCase();
  const dedications = objects
    .filter((o) => o !== deity && o.type === 'crystal')
    .filter((o) => {
      const details = (crystalState(o, at).dedicationDetails ?? null) as Rec | null;
      if (!details) return false;
      const to = str(details.dedicatedTo).toLowerCase();
      const ent = str(details.entityId);
      return (!!ent && (ent === id || ent === entity)) || (!!to && lowerName.length > 1 && to.includes(lowerName));
    })
    .map((o) => shortLabel(o.label, 'A crystal'));
  const reason = str(deityState(deity, at).reasonForPresence);

  const bits: string[] = [];
  if (offerings.length) {
    const days = Math.floor((now.getTime() - Date.parse(lastAt!)) / DAY);
    const last = days <= 0 ? 'the last today' : days === 1 ? 'the last yesterday' : `the last ${days} days ago`;
    bits.push(offerings.length === 1 ? `One offering, on ${shortDate(firstAt!)}.` : `${offerings.length} offerings since ${shortDate(firstAt!)}; ${last}.`);
  } else {
    bits.push(`No offerings to ${name} recorded yet.`);
  }
  if (signs) bits.push(`${signs === 1 ? 'One sign or response' : `${signs} signs and responses`} recorded.`);
  if (dedications.length) bits.push(`${dedications.length === 1 ? `${dedications[0]} is` : `${dedications.length} crystals are`} dedicated to ${name}.`);

  return { name, offerings: offerings.length, dedications, signs, firstAt, lastAt, reason, feasts: feastDays(deity, now), summary: bits.join(' ') };
}

// ── Making an offering ─────────────────────────────────────────────────────

export type OfferingStep = { id: 'pour' | 'set' | 'speak'; title: string; line: string };

const POURED = /water|wine|milk|honey|mead|whisk(e)?y|rum|beer|ale|coffee|tea|oil|libation|juice|spirits?/i;

/**
 * The guided moment before an offering is recorded: pour (when something is
 * poured), set it down (when something is set out), and speak (always).
 */
export function offeringSteps(input: { types: string[]; items: string[]; message: string; name: string }): OfferingStep[] {
  const types = input.types.map((t) => t.toLowerCase());
  const items = input.items.filter(Boolean);
  const who = input.name || 'them';
  const steps: OfferingStep[] = [];
  const poured = types.includes('drink') || types.includes('oils') || items.some((i) => POURED.test(i));
  const intangible = types.length > 0 && types.every((t) => ['written prayer', 'song or music', 'devotional act'].includes(t)) && !items.length;
  if (poured) steps.push({ id: 'pour', title: 'Pour', line: `Pour it slowly. The first of it is ${who === 'them' ? 'theirs' : `${who}’s`}; let it run as long as it wants to.` });
  if (!intangible) {
    const what = items.length ? items.slice(0, 3).join(', ') : 'the offering';
    steps.push({ id: 'set', title: 'Set it down', line: `Set ${what} before ${who} with both hands. Take a breath and let it settle.` });
  }
  const message = input.message.trim();
  const sung = types.includes('song or music');
  steps.push({
    id: 'speak',
    title: sung ? 'Sing' : 'Speak',
    line: message
      ? `Say it aloud, or in your heart: “${message}”`
      : sung
        ? `Sing it for ${who}, however it comes out.`
        : `Speak to ${who} plainly: who you are, what this is, and that it is freely given.`,
  });
  return steps;
}
