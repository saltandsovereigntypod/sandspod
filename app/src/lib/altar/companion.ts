// What the altar shows about a selected object: the website's Companion panel
// (altar/js/ui/companion-v2.js), in three depths for a phone. A one-line
// glance under the object's name, a sheet with its key correspondences and
// current state, and the full Living Library page behind a link.

import { correspondences, layerFields, normalizeName, splitList } from '../library/model.ts';
import type { LibraryEntry, LibraryField } from '../library/types.ts';
import type { Settings } from '../settings/defaults.ts';
import { readLivingState } from './livingState.ts';
import type { SavedObject } from './types.ts';

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

/** e.g. "Fire · Mars · Courage, protection, passion". Empty when nothing is known. */
export function glanceLine(entry: LibraryEntry, settings?: Settings | null): string {
  const parts: string[] = [];
  if (settings?.library_traditional_correspondences !== false) {
    parts.push(
      ...correspondences(entry)
        .filter((fact) => fact.label === 'Element' || fact.label === 'Planet')
        .map((fact) => fact.value),
    );
  }
  if (settings?.library_traditional_uses !== false) {
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
  const fields = layerFields(entry.traditional, 'traditional', settings).filter((field) => !CORRESPONDENCE_KEYS.has(field.key));
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

function duration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
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

/** The object's own story so far: burns, dressings, cleansing, offerings, what's in a jar. */
export function stateRows(object: SavedObject, now: Date): StateRow[] {
  const state = readLivingState(object, now.toISOString());
  const rows: StateRow[] = [];
  const add = (label: string, value: string) => {
    if (value) rows.push({ label, value });
  };

  const candle = state.candle;
  if (object.type === 'candle' && candle) {
    if (object.lit === 'true') add('Burning since', when(candle.currentBurnStartedAt, now) || 'Now');
    const total = Number(candle.totalBurnMs) || 0;
    if (total > 0) add('Burned in all', duration(total));
    add('Last lit', when(candle.lastLitAt, now));
    add('Dressed with', (candle.dressings ?? []).map((d) => d.label).filter(Boolean).join(', '));
  }

  const crystal = state.crystal as Record<string, unknown> | undefined;
  if (object.type === 'crystal' && crystal) {
    add('Dedication', text(crystal.dedication));
    add('Last cleansed', when(crystal.lastCleansedAt, now));
    add('Last charged', when(crystal.lastChargedAt, now));
  }

  const deity = state.deity as Record<string, unknown> | undefined;
  if (object.type === 'deity' && deity) {
    add('Here because', text(deity.reasonForPresence));
    add('Offerings', text(deity.offeringStatus));
    add('Last offering', when(deity.lastOfferingAt, now));
  }

  const ingredients = ingredientList(object.apothecaryIngredients);
  if (object.type === 'apothecary' || object.apothecaryItemId || object.apothecaryType || object.apothecaryIntention || ingredients) {
    add('Kind', text(object.apothecaryType));
    add('Intention', text(object.apothecaryIntention));
    add('Inside', ingredients);
    add('Notes', text(object.apothecaryNotes));
    const apothecary = state.apothecary as Record<string, unknown> | undefined;
    if (apothecary) {
      add('Remaining', text(apothecary.remainingAmount));
      add('Next tending', when(apothecary.nextTendingAt, now));
      add('Review by', when(apothecary.reviewAt, now));
    }
  }

  add('Part of', text(state.currentRitualName));
  add('Notes', text(state.notes));
  return rows;
}
