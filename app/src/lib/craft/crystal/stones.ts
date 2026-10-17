// My stones: the shape of a stone in `crystal.stones`, its care log, and
// when it is due for cleansing (after a number of days, or after each full
// moon). Settings live in `crystal.settings` as a single entry.

import { nextPhase } from '../../moon.ts';

export type StoneForm = 'tumbled' | 'raw' | 'point' | 'cluster' | 'sphere' | 'jewellery' | 'other';

export const STONE_FORMS: { key: StoneForm; label: string }[] = [
  { key: 'tumbled', label: 'Tumbled' },
  { key: 'raw', label: 'Raw' },
  { key: 'point', label: 'Point' },
  { key: 'cluster', label: 'Cluster' },
  { key: 'sphere', label: 'Sphere' },
  { key: 'jewellery', label: 'Jewellery' },
  { key: 'other', label: 'Other' },
];

export type CareKind = 'cleansed' | 'charged' | 'programmed';

export type CareLog = {
  id: string;
  kind: CareKind;
  /** ISO time. */
  at: string;
  /** How it was cleansed or charged (free text, often a preset). */
  method?: string;
  /** What it was programmed for. */
  intention?: string;
  note?: string;
};

export type Stone = {
  /** Care / Library key, when picked from the list. */
  key?: string | null;
  name: string;
  form: StoneForm;
  source?: string;
  /** YYYY-MM-DD */
  acquired?: string;
  notes?: string;
  intentions: string[];
  care: CareLog[];
};

export type CleanseRule = { kind: 'days'; days: number } | { kind: 'fullMoon' };
export type CrystalSettings = { cleanse: CleanseRule };
export const DEFAULT_RULE: CleanseRule = { kind: 'days', days: 30 };

export const CHARGE_METHODS = ['Full moon', 'New moon', 'Morning sun', 'On selenite', 'Quartz cluster', 'In the earth', 'Breath and intention', 'Sound', 'On the altar', 'In a grid'];
export const CLEANSE_PRESETS = ['Smoke', 'Sound', 'Moonlight', 'Running water', 'Earth', 'Brown rice', 'On selenite', 'Breath and intention', 'Sunlight', 'Dry salt'];

export const careId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const KIND_LABEL: Record<CareKind, string> = { cleansed: 'Cleansed', charged: 'Charged', programmed: 'Programmed' };

/** A stone as saved, tolerant of older or partial entries. */
export function normaliseStone(data: Partial<Stone> | null | undefined): Stone {
  return {
    key: data?.key ?? null,
    name: (data?.name ?? '').trim() || 'Unnamed stone',
    form: STONE_FORMS.some((f) => f.key === data?.form) ? (data!.form as StoneForm) : 'other',
    source: data?.source ?? '',
    acquired: data?.acquired ?? '',
    notes: data?.notes ?? '',
    intentions: Array.isArray(data?.intentions) ? data!.intentions.filter((s) => typeof s === 'string' && s.trim()) : [],
    care: Array.isArray(data?.care) ? data!.care.filter((c) => c && typeof c.at === 'string' && !Number.isNaN(Date.parse(c.at))) : [],
  };
}

export const careHistory = (stone: Stone) => [...stone.care].sort((a, b) => (a.at < b.at ? 1 : -1));

export function lastCare(stone: Stone, kind: CareKind): CareLog | null {
  return careHistory(stone).find((c) => c.kind === kind) ?? null;
}

export function normaliseRule(rule: unknown): CleanseRule {
  const r = rule as CleanseRule | null | undefined;
  if (r?.kind === 'fullMoon') return r;
  if (r?.kind === 'days' && Number.isFinite(r.days) && r.days >= 1 && r.days <= 365) return { kind: 'days', days: Math.round(r.days) };
  return DEFAULT_RULE;
}

export type CleanseStatus = {
  due: boolean;
  last: Date | null;
  /** When it next falls due (null when already due). */
  next: Date | null;
  label: string;
};

const DAY = 86_400_000;

function whenLabel(now: Date, date: Date): string {
  const days = Math.round((date.getTime() - now.getTime()) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function cleanseStatus(stone: Stone, rule: CleanseRule, now: Date): CleanseStatus {
  const log = lastCare(stone, 'cleansed');
  if (!log) return { due: true, last: null, next: null, label: 'Not cleansed yet' };
  const last = new Date(log.at);
  const next = rule.kind === 'fullMoon' ? nextPhase(last, 'full') : new Date(last.getTime() + rule.days * DAY);
  if (next.getTime() <= now.getTime()) {
    return { due: true, last, next: null, label: rule.kind === 'fullMoon' ? 'Due: a full moon has passed since its last cleansing' : `Due: last cleansed over ${rule.days} days ago` };
  }
  return { due: false, last, next, label: rule.kind === 'fullMoon' ? `Next due after the full moon, ${whenLabel(now, next)}` : `Next due ${whenLabel(now, next)}` };
}

export const daysAgo = (now: Date, date: Date) => {
  const d = Math.floor((now.getTime() - date.getTime()) / DAY);
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`;
};

/** Stones due first, then the longest since cleansing, then by name. */
export function sortStones<T extends { data: Stone }>(list: T[], rule: CleanseRule, now: Date): T[] {
  return [...list].sort((a, b) => {
    const sa = cleanseStatus(a.data, rule, now);
    const sb = cleanseStatus(b.data, rule, now);
    if (sa.due !== sb.due) return sa.due ? -1 : 1;
    const la = sa.last?.getTime() ?? 0;
    const lb = sb.last?.getTime() ?? 0;
    if (la !== lb) return la - lb;
    return a.data.name.localeCompare(b.data.name);
  });
}

export const isDateKey = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00Z`));
