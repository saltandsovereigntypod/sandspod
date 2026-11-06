// The home warding map: the rooms, doors, windows and thresholds of your
// house as a list (no drawing), what ward is set at each (a salt line, a
// witch bottle, iron, rowan, a mirror, a sigil, a herb bundle), when it was
// last renewed, and when it next wants renewing. Each place is a craft entry
// in `hearth.wards`. A ward you ask to be reminded about becomes a thing of
// your own in To tend (kind `own`, type warding, keyed `own:ward-<id>`), so
// it rings through the reminders the To tend list already keeps, and marking
// it renewed in either place counts in both. Pure.

import { editOwn, newOwnRecord, type Rhythm, type TendRecord } from '../../tend/model.ts';

export const WARDS = 'hearth.wards';

export type SpotKind = 'front-door' | 'back-door' | 'door' | 'window' | 'threshold' | 'room' | 'hearth' | 'boundary' | 'other';

export const SPOT_KINDS: { key: SpotKind; label: string; line: string }[] = [
  { key: 'front-door', label: 'Front door', line: 'The main way in, and the old focus of house protection.' },
  { key: 'back-door', label: 'Back door', line: 'The second way in, often forgotten.' },
  { key: 'door', label: 'Inner door', line: 'Between rooms: a bedroom, a study.' },
  { key: 'window', label: 'Window', line: 'Glass is an opening too.' },
  { key: 'threshold', label: 'Threshold', line: 'Doorsteps, gates and the line of a path.' },
  { key: 'room', label: 'Room', line: 'A whole room held as one place.' },
  { key: 'hearth', label: 'Hearth or chimney', line: 'The fire and the open flue, where many old house charms were hidden.' },
  { key: 'boundary', label: 'Boundary', line: 'The garden edge, a fence, the four corners of the land.' },
  { key: 'other', label: 'Somewhere else', line: 'Under the bed, the car, a shed.' },
];

export type WardKind = 'salt' | 'witch-bottle' | 'iron' | 'rowan' | 'mirror' | 'sigil' | 'herbs' | 'other';

/** Each ward, how long it's commonly kept before renewing (days), and where it comes from. */
export const WARD_KINDS: { key: WardKind; label: string; days: number; line: string; source: string }[] = [
  {
    key: 'salt',
    label: 'Salt line',
    days: 30,
    line: 'A thin line of salt along a sill or under a doormat, swept away and laid fresh.',
    source: 'Salt against harm is very widely recorded in European folk custom. The swept-and-renewed salt line across a threshold is mostly modern witchcraft practice.',
  },
  {
    key: 'witch-bottle',
    label: 'Witch bottle',
    days: 365,
    line: 'A sealed bottle of pins, nails and the householder’s own taglocks, buried by the door or hidden in the hearth.',
    source: 'Real ones survive: stoneware Bartmann jugs of the 1600s, found under English hearths and thresholds, holding bent pins, nails and urine (Merrifield, The Archaeology of Ritual and Magic, 1987). They were meant to stay buried; renewing yearly is a modern habit.',
  },
  {
    key: 'iron',
    label: 'Iron',
    days: 365,
    line: 'A horseshoe over the door, a nail in the frame, an old key.',
    source: 'Iron against fairies and ill-wishing is common across British and Irish folklore; the horseshoe over the door is one of the best-recorded house charms. Which way up it hangs varies by region.',
  },
  {
    key: 'rowan',
    label: 'Rowan',
    days: 365,
    line: 'A sprig or an equal-armed cross of rowan twigs tied with red thread.',
    source: 'Rowan and red thread is a Scottish and northern English charm (“rowan tree and red thread put the witches to their speed”), renewed traditionally at Beltane or the Quarter Days.',
  },
  {
    key: 'mirror',
    label: 'Mirror',
    days: 90,
    line: 'A small mirror facing out, to turn back what comes.',
    source: 'Turning mirrors outward is found in many places (the bagua mirror of Chinese practice is a living tradition of its own); here it is used in a general, modern way.',
  },
  {
    key: 'sigil',
    label: 'Sigil',
    days: 90,
    line: 'A sigil drawn on the door frame, under a mat or on the back of a picture.',
    source: 'Sigils as made today follow Austin Osman Spare (early 1900s); apotropaic marks cut into doorframes and beams (“witch marks”) are well recorded in English houses of the 1500s to 1700s.',
  },
  {
    key: 'herbs',
    label: 'Herb bundle',
    days: 30,
    line: 'A bundle hung by the door: rosemary, bay, rowan, St John’s wort, garlic.',
    source: 'Herbs hung over doors are widespread in folk custom, St John’s wort at Midsummer especially. Dried bundles fade; a month or a season is the usual turn.',
  },
  { key: 'other', label: 'Something else', days: 30, line: 'Your own: a charm, a word, a stone.', source: '' },
];

export const wardKind = (key: string) => WARD_KINDS.find((w) => w.key === key) ?? WARD_KINDS[WARD_KINDS.length - 1];
export const spotKind = (key: string) => SPOT_KINDS.find((s) => s.key === key) ?? SPOT_KINDS[SPOT_KINDS.length - 1];

export type PlacedWard = {
  id: string;
  kind: WardKind;
  /** For "Something else", or a few words of detail ("horseshoe, points up"). */
  detail: string;
  /** When it was set or last renewed, YYYY-MM-DD. */
  renewed: string;
  /** Renew every so many days. */
  every: number;
  /** Ring a reminder through To tend. */
  remind: boolean;
  history: string[];
};

export type WardSpot = {
  name: string;
  kind: SpotKind;
  /** Floor or part of the house ("Upstairs", "Kitchen"), to group by. */
  area: string;
  notes: string;
  wards: PlacedWard[];
};

export const SPOT_NAME_MAX = 60;
export const WARDS_PER_SPOT = 8;
export const HISTORY_MAX = 24;

const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isDateKey = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00`));
const clampEvery = (n: unknown) => Math.max(1, Math.min(730, Math.round(Number(n)) || 30));

export const wardId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function newWard(kind: WardKind, today: Date, id = wardId()): PlacedWard {
  return { id, kind, detail: '', renewed: dateKey(today), every: wardKind(kind).days, remind: false, history: [dateKey(today)] };
}

export function emptySpot(kind: SpotKind = 'front-door'): WardSpot {
  return { name: '', kind, area: '', notes: '', wards: [] };
}

export function normaliseSpot(raw: unknown): WardSpot {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<WardSpot>;
  const kind = SPOT_KINDS.some((k) => k.key === s.kind) ? (s.kind as SpotKind) : 'other';
  const wards = Array.isArray(s.wards)
    ? s.wards
        .filter((w) => w && typeof w.id === 'string')
        .slice(0, WARDS_PER_SPOT)
        .map((w) => ({
          id: String(w.id),
          kind: WARD_KINDS.some((k) => k.key === w.kind) ? (w.kind as WardKind) : 'other',
          detail: String(w.detail ?? '').slice(0, 80),
          renewed: isDateKey(w.renewed) ? w.renewed : '',
          every: clampEvery(w.every),
          remind: w.remind === true,
          history: Array.isArray(w.history) ? w.history.filter(isDateKey).slice(-HISTORY_MAX) : [],
        }))
    : [];
  return { name: String(s.name ?? '').slice(0, SPOT_NAME_MAX), kind, area: String(s.area ?? '').slice(0, 40), notes: String(s.notes ?? '').slice(0, 2000), wards };
}

export const spotName = (spot: Pick<WardSpot, 'name' | 'kind'>) => spot.name.trim() || spotKind(spot.kind).label;
export const wardLabel = (w: Pick<PlacedWard, 'kind' | 'detail'>) => (w.kind === 'other' ? w.detail.trim() || 'A ward' : w.detail.trim() ? `${wardKind(w.kind).label} (${w.detail.trim()})` : wardKind(w.kind).label);

const DAY = 86_400_000;
const noon = (key: string) => new Date(`${key}T12:00:00`);

export type WardDue = { dueOn: string | null; days: number | null; due: boolean; line: string };

/** When it next wants renewing, and how it stands today. */
export function wardDue(w: Pick<PlacedWard, 'renewed' | 'every'>, now: Date): WardDue {
  if (!w.renewed) return { dueOn: null, days: null, due: true, line: 'Not yet set: mark it when it’s in place.' };
  const due = new Date(noon(w.renewed).getTime() + w.every * DAY);
  const days = Math.round((noon(dateKey(due)).getTime() - noon(dateKey(now)).getTime()) / DAY);
  const when = days === 0 ? 'today' : days === 1 ? 'tomorrow' : days < 0 ? `${-days} day${days === -1 ? '' : 's'} ago` : `in ${days} days`;
  return { dueOn: dateKey(due), days, due: days <= 0, line: days <= 0 ? `Due for renewing (${when}).` : `Renew ${when}.` };
}

export function renewWard(w: PlacedWard, on: Date): PlacedWard {
  const key = dateKey(on);
  return { ...w, renewed: key, history: [...w.history.filter((h) => h !== key), key].sort().slice(-HISTORY_MAX) };
}

/** Every ward across the house, soonest due first. */
export function wardsByDue<T extends { id: string; data: WardSpot }>(spots: T[], now: Date): { spotId: string; spot: WardSpot; ward: PlacedWard; due: WardDue }[] {
  return spots
    .flatMap((s) => normaliseSpot(s.data).wards.map((ward) => ({ spotId: s.id, spot: normaliseSpot(s.data), ward, due: wardDue(ward, now) })))
    .sort((a, b) => (a.due.days ?? -9999) - (b.due.days ?? -9999));
}

/** The house in groups by area, then by spot kind in the order above. */
export function groupSpots<T extends { id: string; data: WardSpot }>(spots: T[]): { area: string; spots: T[] }[] {
  const order = (k: SpotKind) => SPOT_KINDS.findIndex((x) => x.key === k);
  const groups = new Map<string, T[]>();
  for (const s of spots) {
    const area = normaliseSpot(s.data).area.trim() || 'The house';
    groups.set(area, [...(groups.get(area) ?? []), s]);
  }
  return [...groups.entries()]
    .map(([area, list]) => ({ area, spots: list.sort((a, b) => order(a.data.kind) - order(b.data.kind) || spotName(a.data).localeCompare(spotName(b.data))) }))
    .sort((a, b) => (a.area === 'The house' ? -1 : b.area === 'The house' ? 1 : a.area.localeCompare(b.area)));
}

export const wardTendKey = (wardIdValue: string) => `own:ward-${wardIdValue}`;

/**
 * The ward's record in To tend: a thing of your own (warding), renewed every
 * so many days, reminding you. Null when no reminder is wanted. An existing
 * record keeps its history and hour; the last renewal counts as its last time.
 */
export function wardTendRecord(spotId: string, spot: WardSpot, w: PlacedWard, existing: TendRecord | null | undefined): TendRecord | null {
  if (!w.remind) return null;
  const rhythm: Rhythm = { kind: 'every', every: w.every };
  const input = { name: `${wardLabel(w)} · ${spotName(spot)}`, type: 'warding' as const, notes: wardKind(w.kind).line, rhythm };
  const base = existing ?? { ...newOwnRecord(input, `ward-${w.id}`), remind: true };
  const record = editOwn(base, input);
  const renewedAt = w.renewed ? noon(w.renewed).toISOString() : '';
  return {
    ...record,
    remind: true,
    ended: null,
    source: 'Home wards',
    href: `/rituals/craft/hearth/wards/spot?id=${encodeURIComponent(spotId)}`,
    tendedAt: renewedAt && renewedAt > (record.tendedAt || '') ? renewedAt : record.tendedAt,
  };
}

/** A renewal marked in To tend, brought back to the ward: the later of the two wins. */
export function wardFromRecord(w: PlacedWard, record: TendRecord | null | undefined): PlacedWard {
  if (!record?.tendedAt) return w;
  const key = dateKey(new Date(record.tendedAt));
  return !w.renewed || key > w.renewed ? { ...w, renewed: key, history: [...w.history, key].sort().slice(-HISTORY_MAX) } : w;
}
