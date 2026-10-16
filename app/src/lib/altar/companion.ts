// What the altar shows about a selected object: the website's Companion panel
// (altar/js/ui/companion-v2.js), in three depths for a phone. A one-line
// glance under the object's name, a sheet with its key correspondences and
// current state, and the full Living Library page behind a link.

import { correspondences, layerFields, normalizeName, splitList } from '../library/model.ts';
import type { LibraryEntry, LibraryField } from '../library/types.ts';
import { LIBRARY_CATEGORIES, type Settings } from '../settings/defaults.ts';
import { crystalHistory, crystalIntention, humanize as humanizeValue, offeringsOf } from './devotion.ts';
import { carvingsOf, readLivingState } from './livingState.ts';
import { TRADITIONAL_LIBRARY } from '../library/traditionalData.ts';
import type { CabinetForm, CabinetItem, SavedObject } from './types.ts';

type Identity = [type: string, value: string | undefined];

/**
 * The Living Library entry an altar object stands for, as the website's
 * Library.resolveObjectEntity picks it: an explicit entity that points at
 * traditional information wins, then the object's herb, crystal, deity,
 * candle colour, tool or vessel, then the explicit entity on its own.
 */
export function resolveAltarEntry(entries: LibraryEntry[], object: SavedObject): LibraryEntry | null {
  const entityId = String(object.entityId || '').trim();
  const explicit = entityId
    ? (entries.find((entry) => entry.practiceEntityIds.includes(entityId) || entry.id === `practice:${entityId}`) ??
      (entityId.startsWith('traditional/')
        ? entries.find((entry) => entry.traditionalRef?.toLowerCase() === entityId.toLowerCase())
        : undefined) ??
      null)
    : null;
  if (explicit?.traditional) return explicit;

  const identities: Identity[] = [
    ['herb', object.herb],
    ['crystal', object.crystal],
    ['deity', object.deity],
    ['candle', object.color],
    ['tool', object.tool],
    ['vessel', object.vessel],
    ['tool', object.vessel],
  ];
  for (const [type, value] of identities) {
    const key = String(value || '').trim().toLowerCase();
    if (!key) continue;
    const match =
      entries.find((entry) => entry.id.toLowerCase() === `traditional:${type}:${key}`) ??
      entries.find((entry) => entry.type === type && normalizeName(entry.name) === normalizeName(key));
    if (match) return match;
  }
  return explicit;
}

const COMPANION_LAYERS = [
  ['my', 'myPractice'],
  ['traditional', 'traditional'],
  ['community', 'community'],
] as const;

/**
 * The settings the Companion panel reads, as the website's
 * getCompanionDisplaySettings (altar/js/ui/selection.js) builds them: the
 * Living Library page settings when "Copy my Living Library page settings"
 * is on, otherwise the companion_* choices written over the library_* keys,
 * so layerFields and visibleLayers read them unchanged. A key the website
 * never set (companion_traditional_notes, say) reads as off, as it does there.
 */
export function companionSettings<T extends Settings | null | undefined>(settings: T): T {
  // Only an explicit "off" maps; saved settings always carry the flag, so this matches the website's truthiness check.
  if (!settings || settings.companion_copy_grimoire_settings !== false) return settings;
  const mapped: Record<string, unknown> = { ...settings };
  mapped.library_layer_order = settings.companion_layer_order || 'myPractice,traditional,community';
  for (const [companion, library] of COMPANION_LAYERS) {
    mapped[`library_${library}_enabled`] = Boolean(settings[`companion_${companion}_enabled`]);
    for (const category of LIBRARY_CATEGORIES) {
      mapped[`library_${library}_${category}`] = Boolean(settings[`companion_${companion}_${category}`]);
    }
  }
  return mapped as T;
}

/** Which Living State rows to show (getLivingStateDisplaySettings): everything unless switched off. */
export function livingStateDisplay(settings?: Settings | null) {
  const on = (key: string) => settings?.[`living_state_show_${key}`] !== false;
  return {
    status: on('status'),
    created: on('created'),
    source: on('source'),
    lastTended: on('last_tended'),
    expiration: on('expiration'),
    futureTending: on('future_tending'),
    remaining: on('remaining'),
    recentActivity: on('recent_activity'),
  };
}

/** e.g. "Fire · Mars · Courage, protection, passion". Empty when nothing is known. */
export function glanceLine(entry: LibraryEntry, librarySettings?: Settings | null): string {
  const settings = companionSettings(librarySettings);
  const parts: string[] = [];
  // The glance reads the Traditional layer (as the About sheet's facts do), so it follows that layer being shown.
  const traditional = settings?.library_traditional_enabled !== false;
  if (traditional && settings?.library_traditional_correspondences !== false) {
    parts.push(
      ...correspondences(entry)
        .filter((fact) => fact.label === 'Element' || fact.label === 'Planet')
        .map((fact) => fact.value),
    );
  }
  if (traditional && settings?.library_traditional_uses !== false) {
    const source = { ...(entry.traditional ?? {}), ...(entry.myPractice ?? {}) } as Record<string, unknown>;
    const raw = source.Uses ?? source.Domains ?? source.Purpose;
    const uses = Array.isArray(raw) ? raw.map(String) : typeof raw === 'string' ? splitList(raw) : [];
    if (uses.length) {
      const list = uses.slice(0, 3).join(', ').toLowerCase();
      parts.push(list.charAt(0).toUpperCase() + list.slice(1));
    }
  }
  return parts.join(' · ');
}

const CORRESPONDENCE_KEYS = new Set(['Element', 'Planet', 'Chakra', 'Pantheon']);
const WARNING_KEYS = new Set(['TraditionalWarnings', 'Warnings', 'SafetyAndRespect']);
const LEAD_FIELDS = 2;

/**
 * The Traditional fields for the sheet: a couple to read first and any
 * warnings (always in view), with the rest folded away under "More".
 */
export function traditionalSplit(
  entry: LibraryEntry,
  settings?: Settings | null,
): { lead: LibraryField[]; warnings: LibraryField[]; rest: LibraryField[] } {
  const fields = layerFields(entry.traditional, 'traditional', companionSettings(settings), entry.layout).filter((field) => !CORRESPONDENCE_KEYS.has(field.key));
  const warnings = fields.filter((field) => WARNING_KEYS.has(field.key));
  const others = fields.filter((field) => !WARNING_KEYS.has(field.key));
  return { lead: others.slice(0, LEAD_FIELDS), warnings, rest: others.slice(LEAD_FIELDS) };
}

export type StateRow = { label: string; value: string };

function when(iso: unknown, now: Date): string {
  const date = new Date(String(iso || ''));
  if (!iso || Number.isNaN(date.getTime())) return '';
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000,
  );
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

/** How long a candle has burned, as the website words it (companion-current-state.js formatBurnDuration). */
export function burnDuration(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 1) return 'Less than 1 minute';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}
const duration = burnDuration;

/** A candle's whole life or what's left of it: "7 days", "2 days 5 hr", "3 hr 20 min", "10 min". */
export function lifeDuration(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  if (minutes < 1) return 'under a minute';
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return [`${days} day${days === 1 ? '' : 's'}`, hours ? `${hours} hr` : ''].filter(Boolean).join(' ');
  if (hours > 0) return [`${hours} hr`, mins ? `${mins} min` : ''].filter(Boolean).join(' ');
  return `${mins} min`;
}

/** Every minute a candle has burned, counting the burn going on now. */
export function burnedSoFar(object: SavedObject, now: Date): number {
  const candle = readLivingState(object, now.toISOString()).candle;
  const total = Math.max(0, Number(candle?.totalBurnMs) || 0);
  const started = Date.parse(candle?.currentBurnStartedAt || '');
  return object.lit === 'true' && Number.isFinite(started) ? total + Math.max(0, now.getTime() - started) : total;
}

/** A date with its time: "Today, 9:14 PM", "Oct 12, 9:14 PM". */
export function whenWithTime(value: unknown, now: Date): string {
  const date = typeof value === 'string' && value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${when(value, now)}, ${time}`;
}

// The Library candle style for each cabinet candle form.
const STYLE_OF_FORM: Record<string, string> = { 'chime-spell': 'chime', taper: 'taper', 'tea-light': 'tea_light', pillar: 'pillar', vigil: 'seven_day', votive: 'votive' };

/** How long this kind of candle usually burns, from the Library's candle styles. */
export function typicalBurn(object: SavedObject): string {
  const style = STYLE_OF_FORM[String(object.form || '')];
  const record = style ? (TRADITIONAL_LIBRARY.candle?.styles as Record<string, Record<string, unknown>> | undefined)?.[style] : undefined;
  return typeof record?.TypicalBurnTime === 'string' ? record.TypicalBurnTime : '';
}

const FORM_WORDS = ['loose', 'powder', 'powdered', 'oil', 'whole', 'dried', 'fresh', 'leaf', 'leaves', 'root', 'bark', 'flower', 'flowers', 'petal', 'petals', 'resin', 'seed', 'seeds', 'crushed', 'sprig'];
const humanize = (value: string) => value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** What a candle is dressed with, by plant rather than form: "Basil", not "Basil Loose" (formatCandleDressingIdentity). */
export function dressingNames(dressings: { type?: string; herb?: string; form?: string; label?: string; name?: string }[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const d of dressings) {
    let name = String(d.herb || d.name || '').trim();
    if (!name) {
      let label = String(d.label || '').trim();
      const form = String(d.form || d.type || '').trim().toLowerCase();
      const suffixes = [...new Set([form, ...FORM_WORDS].filter(Boolean))].sort((a, b) => b.length - a.length);
      for (const suffix of suffixes) {
        const pattern = new RegExp(`(?:\\s+|\\s*[·—–-]\\s*)${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
        if (pattern.test(label)) {
          label = label.replace(pattern, '').trim();
          break;
        }
      }
      name = label || String(d.type || '');
    }
    name = humanize(name);
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      names.push(name);
    }
  }
  return names;
}

/** Cleansings, charges and offerings, newest first, for the About sheet's history. */
export function careHistory(object: SavedObject, now: Date): { label: string; detail: string }[] {
  const iso = now.toISOString();
  const rows = [
    ...crystalHistory(object, iso).map((r) => ({ at: r.at, label: r.label, detail: [r.detail, whenWithTime(r.at, now)].filter(Boolean).join(' · ') })),
    ...(object.type === 'deity'
      ? offeringsOf(object, iso).map((o) => ({
          at: String(o.occurredAt || ''),
          label: 'Offering',
          detail: [(o.items ?? []).map((i) => (typeof i === 'string' ? i : i.label)).join(', ') || (o.types ?? []).map(humanizeValue).join(', '), humanizeValue(o.status), whenWithTime(o.occurredAt, now)]
            .filter(Boolean)
            .join(' · '),
        }))
      : []),
  ];
  return rows.sort((a, b) => b.at.localeCompare(a.at)).map(({ label, detail }) => ({ label, detail }));
}

/** Each burn, newest first (companion-v2.js flame history). */
export function burnHistory(object: SavedObject, now: Date): { label: string; detail: string }[] {
  const history = readLivingState(object, now.toISOString()).candle?.burnHistory ?? [];
  return [...history]
    .filter((burn) => burn && burn.startedAt)
    .reverse()
    .map((burn) => ({ label: `Burned ${burnDuration(Number(burn.durationMs) || 0)}`, detail: whenWithTime(burn.startedAt, now) }));
}

/** The website saves ingredients as a JSON list ("[]" on every object); plain text is kept as is. */
function ingredientList(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw.startsWith('[')) return raw;
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return '';
    return list
      .map((item) => (typeof item === 'string' ? item : String(item?.name ?? item?.label ?? '')))
      .map((name) => name.trim())
      .filter(Boolean)
      .join(', ');
  } catch {
    return '';
  }
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/**
 * The object's own story so far: burns, dressings, cleansing, offerings, what's in a jar.
 * With settings, rows follow the Living State panel switches (living_state_show_*):
 * status, last tended, remaining, future tending and expiration each hide their rows.
 */
export function stateRows(object: SavedObject, now: Date, settings?: Settings | null): StateRow[] {
  const state = readLivingState(object, now.toISOString());
  const show = livingStateDisplay(settings);
  const rows: StateRow[] = [];
  const add = (label: string, value: string, shown = true) => {
    if (value && shown) rows.push({ label, value });
  };

  const candle = state.candle;
  if (object.type === 'candle' && candle) {
    if (object.lit === 'true') add('Burning since', whenWithTime(candle.currentBurnStartedAt, now) || 'Now', show.status);
    const total = burnedSoFar(object, now);
    if (total > 0 || object.lit === 'true') add('Burning time', duration(total), show.remaining);
    add('Last burned', whenWithTime(candle.lastLitAt, now), show.lastTended);
    add('Typical burn', typicalBurn(object));
    add('Dressed with', dressingNames(candle.dressings ?? []).join(', '));
    add('Carved with', carvingsOf(object).map((c) => `“${c.text}”`).join(', '));
  }

  const crystal = state.crystal as Record<string, unknown> | undefined;
  if (object.type === 'crystal' && crystal) {
    const details = (crystal.dedicationDetails ?? {}) as Record<string, unknown>;
    add('Current intention', crystalIntention(object, now.toISOString()) || 'No recorded intention');
    add('Dedicated to', text(details.dedicatedTo));
    add('Last cleansed', whenWithTime(crystal.lastCleansedAt, now), show.lastTended);
    add('Last charged', whenWithTime(crystal.lastChargedAt, now), show.lastTended);
  }

  const deity = state.deity as Record<string, unknown> | undefined;
  if (object.type === 'deity' && deity) {
    add('Here because', text(deity.reasonForPresence));
    add('Offering status', humanizeValue(text(deity.offeringStatus)), show.status);
    add('Last offering', whenWithTime(deity.lastOfferingAt, now), show.lastTended);
  }

  const ingredients = ingredientList(object.apothecaryIngredients);
  if (object.type === 'apothecary' || object.apothecaryItemId || object.apothecaryType || object.apothecaryIntention || ingredients) {
    add('Kind', text(object.apothecaryType));
    add('Intention', text(object.apothecaryIntention));
    add('Inside', ingredients);
    add('Notes', text(object.apothecaryNotes));
    const apothecary = state.apothecary as Record<string, unknown> | undefined;
    if (apothecary) {
      add('Remaining', text(apothecary.remainingAmount), show.remaining);
      add('Next tending', when(apothecary.nextTendingAt, now), show.futureTending);
      add('Review by', when(apothecary.reviewAt, now), show.expiration);
    }
  }

  add('Part of', text(state.currentRitualName));
  add('Notes', text(state.notes));
  return rows;
}

const USE_KEYS = ['Uses', 'Domains', 'Purpose', 'UsedFor', 'TraditionallyUsedFor', 'BestFor'];

/** The first two traditional uses of an entry, lower case: "passion · courage". */
export function topUses(entry: LibraryEntry | null, count = 2): string {
  if (!entry) return '';
  const source = { ...(entry.traditional ?? {}), ...(entry.myPractice ?? {}) } as Record<string, unknown>;
  for (const key of USE_KEYS) {
    const raw = source[key];
    const list = Array.isArray(raw) ? raw.map(String) : typeof raw === 'string' ? splitList(raw) : [];
    const uses = list.map((use) => use.trim().toLowerCase()).filter((use) => use && use.length <= 28);
    if (uses.length) return uses.slice(0, count).join(' · ');
  }
  return '';
}

/** What a cabinet item would be on the altar, for finding its Living Library entry before it's placed. */
export function cabinetEntry(entries: LibraryEntry[], item: CabinetItem, form: CabinetForm): LibraryEntry | null {
  return resolveAltarEntry(entries, {
    type: form.type,
    herb: form.herb,
    color: form.color,
    crystal: form.crystal,
    tool: form.tool,
    vessel: form.vessel,
    deity: form.deity,
    entityId: form.entityId || item.entityId,
    label: item.name,
  });
}
