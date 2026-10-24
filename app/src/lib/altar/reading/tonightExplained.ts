// "Set tonight's altar", explained: why each piece is there, and what could
// stand in for it with the same correspondence (your own things first). Reads
// tonight.ts's output; changes nothing in it.

import { plainValue, splitList } from '../../library/model.ts';
import type { LibraryEntry } from '../../library/types.ts';
import { builtInCabinet, objectFromForm, placeableForms, shortLabel } from '../cabinet.ts';
import { boxHeightFraction, displayBox, objectSize, withCenter, withSize } from '../geometry.ts';
import type { TonightAltar } from '../tonight.ts';
import type { CabinetForm, CabinetItem, SavedObject } from '../types.ts';
import { resolveAltarEntry } from '../companion.ts';
import { festivalName, seasonalIdOf, seasonalObject } from '../seasonal.ts';
import { correspondenceOf, handleSafe, libraryOr, listing, planetName, planetOfWeekday, planetPossessive, type Planet } from './correspondence.ts';

export type TonightTheme = { planet: Planet | null; holiday: string | null; moon: 'full' | 'new' | null };

/** What tonight's altar was set for, read from its reason and date. */
export function tonightTheme(tonight: Pick<TonightAltar, 'reason'>, date: Date): TonightTheme {
  const weekday = /’s day:/.test(tonight.reason);
  return {
    planet: weekday ? planetOfWeekday(date.getDay()) : null,
    holiday: weekday ? null : tonight.reason,
    moon: /full moon/.test(tonight.reason) ? 'full' : /new moon/.test(tonight.reason) ? 'new' : null,
  };
}

const CATEGORY_OF: Record<string, string> = { candle: 'candles', herb: 'herbs', oil: 'herbs', crystal: 'crystals', tool: 'tools', deity: 'deities', vessel: 'vessels' };

const usesOf = (entry: LibraryEntry | null, n = 2) => (entry ? correspondenceOf(entry).uses.slice(0, n) : []);

/** Why one piece is on tonight's altar, in a sentence. */
export function whyThisPiece(object: SavedObject, theme: TonightTheme, entries?: LibraryEntry[] | null): string {
  const pool = libraryOr(entries);
  const entry = resolveAltarEntry(pool, object);
  const c = correspondenceOf(entry);
  const name = shortLabel(object.label, 'This piece');
  const uses = usesOf(entry);
  const forUses = uses.length ? `, for ${listing(uses)}` : '';
  const form = String(object.form || '');

  if (theme.moon === 'full' && object.type === 'candle' && form === 'tea-light') return `${name}: small lights for the full moon, set at the front corners.`;
  if (theme.moon === 'full' && object.crystal === 'selenite' && form === 'cluster') return `${name}: the moon’s own stone, set before the centrepiece under the full moon.`;
  if (theme.moon === 'new' && object.type === 'candle' && form === 'chime-spell') return `${name}: dark candles for the new moon, the quiet start of the month.`;
  if (theme.moon === 'new' && object.vessel === 'spell-jar') return `${name}: an empty jar for the new moon, ready for something to begin.`;

  // A festival's seasonal thing (seasonal.ts).
  const seasonal = seasonalObject(seasonalIdOf(object) ?? '');
  if (seasonal) {
    const festivals = seasonal.festivals.map(festivalName).filter(Boolean);
    return theme.holiday && festivals.includes(theme.holiday) ? `${name}: one of the things kept at ${theme.holiday}.` : `${name}: kept at ${listing(festivals)}.`;
  }
  if (object.type === 'deity') {
    const domains = splitList(plainValue(entry?.traditional?.Domains)).slice(0, 2).map((d) => d.toLowerCase());
    const lead = theme.planet && entry && entry.name.toLowerCase() === theme.planet.toLowerCase() ? `${planetName(theme.planet)}, in person` : `the centrepiece`;
    return `${name}: ${lead}${domains.length ? `, keeper of ${listing(domains)}` : ''}.`;
  }
  if (object.type === 'tool' || object.type === 'vessel') {
    const purpose = plainValue(entry?.traditional?.Purpose || entry?.traditional?.UsedFor || entry?.traditional?.TraditionallyUsedFor);
    const short = splitList(purpose)[0]?.toLowerCase() ?? '';
    const what = short.replace(/\.$/, '');
    return `${name}: ${!what ? 'a working tool for tonight' : what.includes(' ') ? what : `traditionally for ${what}`}${theme.holiday ? `, as is traditional for ${theme.holiday}` : ''}.`;
  }
  if (theme.planet && c.planet === theme.planet) {
    const what = object.type === 'candle' ? 'colour' : object.type === 'crystal' ? 'stone' : form === 'incense' ? 'incense' : 'herb';
    return `${name}: ${planetPossessive(theme.planet)} ${what}${forUses}.`;
  }
  if (theme.holiday) return `${name}: traditional for ${theme.holiday}${forUses}.`;
  if (theme.planet && uses.length) return `${name}: it carries tonight’s theme${forUses}.`;
  return `${name}: it rounds out the altar${forUses}.`;
}

export type PieceExplained = { index: number; label: string; why: string };

/** Every piece on tonight's altar, with why it's there. */
export function explainTonight(tonight: TonightAltar, date: Date, entries?: LibraryEntry[] | null): PieceExplained[] {
  const theme = tonightTheme(tonight, date);
  return tonight.doc.objects.map((object, index) => ({ index, label: shortLabel(object.label), why: whyThisPiece(object, theme, entries) }));
}

export type Swap = {
  itemId: string;
  label: string;
  /** In the person's own cabinet (or their practice). */
  owned: boolean;
  why: string;
  /** The replacement, standing where the original stood. */
  object: SavedObject;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, ' ').trim();

/** The replacement object, standing on the same spot at the same size and layer. */
export function swapObject(original: SavedObject, item: CabinetItem, form: CabinetForm, others: SavedObject[], now: string): SavedObject {
  const box = displayBox(original);
  const bottom = box.cy + boxHeightFraction(box) / 2;
  let next = withSize(objectFromForm(item, form, others, now, {}, { cx: box.cx, cy: box.cy }), objectSize(original));
  const height = boxHeightFraction(displayBox(next));
  next = withCenter(next, box.cx, bottom - height / 2);
  return { ...next, rotation: original.rotation ?? '0', zIndex: original.zIndex, groupId: original.groupId ?? '' };
}

/**
 * Things that could stand in for a piece with the same correspondence: the
 * same planet (or element) and kind, sharing its uses. Your own cabinet first.
 */
export function swapsFor(
  object: SavedObject,
  options: { entries?: LibraryEntry[] | null; cabinet?: CabinetItem[]; others?: SavedObject[]; now?: string; limit?: number } = {},
): Swap[] {
  const pool = libraryOr(options.entries);
  const category = CATEGORY_OF[String(object.type)];
  if (!category) return [];
  const self = correspondenceOf(resolveAltarEntry(pool, object));
  const myForm = String(object.form || '');
  const now = options.now ?? new Date().toISOString();
  const ownNames = new Set((options.cabinet ?? []).map((i) => norm(i.name)));
  const candidates: { item: CabinetItem; form: CabinetForm; owned: boolean; shared: string[]; samePlanet: boolean }[] = [];
  const items = [...(options.cabinet ?? []), ...builtInCabinet].filter((i) => i.category === category);
  const seen = new Set<string>();
  for (const item of items) {
    const forms = placeableForms(item);
    const form = forms.find((f) => f.form === myForm) ?? (object.type === 'oil' ? forms.find((f) => f.type === 'oil') : null) ?? forms[0];
    if (!form) continue;
    const probe: SavedObject = { type: form.type, herb: form.herb, color: form.color, crystal: form.crystal, tool: form.tool, vessel: form.vessel, deity: form.deity, entityId: form.entityId || item.entityId, label: item.name };
    const same =
      (object.color && probe.color === object.color) ||
      (object.herb && probe.herb === object.herb) ||
      (object.crystal && probe.crystal === object.crystal) ||
      (object.deity && probe.deity === object.deity) ||
      (object.tool && probe.tool === object.tool) ||
      (object.vessel && probe.vessel === object.vessel);
    if (same) continue;
    const entry = resolveAltarEntry(pool, probe);
    if (!handleSafe(entry)) continue;
    const c = correspondenceOf(entry);
    const key = entry?.id ?? item.id;
    if (seen.has(key)) continue;
    const samePlanet = !!self.planet && c.planet === self.planet;
    const sameElement = !!self.element && c.element === self.element;
    const shared = c.uses.filter((u) => self.uses.slice(0, 6).includes(u));
    if (!(samePlanet || (sameElement && shared.length) || shared.length >= 2)) continue;
    seen.add(key);
    candidates.push({ item, form, owned: !!item.customCabinetItemId || ownNames.has(norm(item.name)), shared, samePlanet });
  }
  candidates.sort((a, b) => Number(b.owned) - Number(a.owned) || Number(b.samePlanet) - Number(a.samePlanet) || b.shared.length - a.shared.length || a.item.name.localeCompare(b.item.name));
  return candidates.slice(0, options.limit ?? 4).map(({ item, form, owned, shared, samePlanet }) => {
    const bits = [samePlanet && self.planet ? `also ${planetPossessive(self.planet)}` : '', shared.length ? `for ${listing(shared.slice(0, 2))}` : ''].filter(Boolean);
    return {
      itemId: item.id,
      label: item.name,
      owned,
      why: `${item.name}: ${bits.join(', ') || 'the same feeling'}${owned ? ', and it’s yours' : ''}.`,
      object: swapObject(object, item, form, options.others ?? [], now),
    };
  });
}
