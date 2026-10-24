// The coven ritual planner's rules, as the website's (covens/coven-logic.js):
// what a step can do at the altar, who can be given a part, dates to suggest
// from the moon and the sabbats (or the coven's own calendar), copying steps
// from one of your own rituals, and the form's date and time. Pure, so it can
// be tested.

import { builtInCabinet } from '../altar/cabinet.ts';
import { nextSabbat } from '../calendar.ts';
import type { Holiday } from '../holidays.ts';
import { upcomingPhases } from '../moon.ts';
import type { RitualStep } from './model.ts';

export const ALTAR_ACTIONS = [
  { value: '', label: 'Nothing on the altar' },
  { value: 'light_candle', label: 'Light a candle on the altar' },
  { value: 'place_item', label: 'Place something on the altar' },
  { value: 'light_all', label: 'Light every candle on the altar' },
  { value: 'snuff_all', label: 'Put out the altar’s candles' },
] as const;
export type StepAltarAction = (typeof ALTAR_ACTIONS)[number]['value'];

/** One step as the planner edits it. */
export type DraftStep = {
  id?: string | null;
  title: string;
  instructions: string;
  spoken_text: string;
  duration_minutes: number | null;
  assigned_user_id: string | null;
  assigned_rank_id: string | null;
  altar_action: StepAltarAction;
  altar_color: string;
  altar_form: string;
  altar_image: string;
  altar_label: string;
};

export const blankStep = (): DraftStep => ({
  title: '',
  instructions: '',
  spoken_text: '',
  duration_minutes: null,
  assigned_user_id: null,
  assigned_rank_id: null,
  altar_action: '',
  altar_color: 'white',
  altar_form: 'votive',
  altar_image: '',
  altar_label: '',
});

export function draftFromStep(step: RitualStep): DraftStep {
  return {
    ...blankStep(),
    id: step.id,
    title: step.title,
    instructions: step.instructions ?? '',
    spoken_text: step.spoken_text ?? '',
    duration_minutes: step.duration_minutes,
    assigned_user_id: step.assigned_user_id,
    assigned_rank_id: step.assigned_rank_id,
    altar_action: (step.altar_action ?? '') as StepAltarAction,
    altar_color: step.altar_color || 'white',
    altar_form: step.altar_form || 'votive',
    altar_image: step.altar_image ?? '',
    altar_label: step.altar_label ?? '',
  };
}

/** What save_coven_ritual takes for the steps (blank ones left out). */
export function stepsPayload(steps: DraftStep[]) {
  return steps
    .filter((s) => s.title.trim())
    .map((s) => ({
      id: s.id || null,
      title: s.title.trim(),
      instructions: s.instructions,
      spoken_text: s.spoken_text,
      duration_minutes: s.duration_minutes,
      assigned_user_id: s.assigned_user_id,
      assigned_rank_id: s.assigned_rank_id,
      altar_action: s.altar_action,
      altar_color: s.altar_action === 'light_candle' ? s.altar_color : '',
      altar_form: s.altar_action === 'light_candle' ? s.altar_form : '',
      altar_image: s.altar_action === 'place_item' ? s.altar_image : '',
      altar_label: s.altar_action === 'place_item' ? s.altar_label : '',
    }));
}

export type Candidate = { id: string; name: string; eligible: boolean };

/** Why a step can't go to the person it names (no longer a member, or not signed up to date), or ''. */
export function unassignablePart(step: Pick<DraftStep, 'assigned_user_id'>, people: Candidate[], nameOf: (id: string) => string): string {
  if (!step.assigned_user_id) return '';
  const person = people.find((p) => p.id === step.assigned_user_id);
  const name = nameOf(step.assigned_user_id);
  if (!person) return `${name} is no longer a member. Give this step to someone else.`;
  if (!person.eligible) return `${name} hasn’t signed the coven’s current agreements, so can’t be given a part. Give this step to someone else.`;
  return '';
}

/** What stops the ritual being saved, or ''. */
export function plannerProblem(title: string, steps: DraftStep[], people: Candidate[], nameOf: (id: string) => string): string {
  if (!title.trim()) return 'Give the ritual a name.';
  const kept = steps.filter((s) => s.title.trim());
  if (kept.length > 60) return 'A ritual can have up to 60 steps.';
  const noItem = kept.findIndex((s) => s.altar_action === 'place_item' && !s.altar_image);
  if (noItem >= 0) return `Step ${noItem + 1}: choose what is placed on the altar.`;
  const blocked = kept.findIndex((s) => unassignablePart(s, people, nameOf));
  if (blocked >= 0) return `Step ${blocked + 1}: ${unassignablePart(kept[blocked], people, nameOf)}`;
  return '';
}

/** One of your own rituals' steps, ready to become coven ritual steps. */
export function stepsFromTemplate(steps: { title: string; instructions: string | null; spoken_text: string | null; duration_seconds: number | null; sort_order: number }[]): DraftStep[] {
  return [...steps]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .filter((s) => String(s.title || '').trim())
    .slice(0, 60)
    .map((s) => ({
      ...blankStep(),
      title: String(s.title).trim().slice(0, 120),
      instructions: s.instructions ? String(s.instructions).slice(0, 4000) : '',
      spoken_text: s.spoken_text ? String(s.spoken_text).slice(0, 4000) : '',
      duration_minutes: s.duration_seconds ? Math.min(240, Math.max(0, Math.round(s.duration_seconds / 60))) : null,
    }));
}

export type Suggestion = { occasion: 'full_moon' | 'new_moon' | 'sabbat' | 'other'; name: string; label: string; date: Date };

/**
 * Coming full and new moons and the next sabbats, to suggest dates for a
 * rite. When the coven keeps its own calendar, its next holidays take the
 * sabbats' place.
 */
export function occasionSuggestions(from: Date, count = 6, covenHolidays: Holiday[] = []): Suggestion[] {
  const out: Suggestion[] = upcomingPhases(from, 12)
    .filter((p) => p.phase === 'full' || p.phase === 'new')
    .slice(0, 4)
    .map((p) => ({ occasion: p.phase === 'full' ? 'full_moon' : 'new_moon', name: '', label: p.phase === 'full' ? 'Full moon' : 'New moon', date: new Date(p.date) }));
  if (covenHolidays.length) {
    for (const h of covenHolidays.slice(0, 3)) {
      out.push({ occasion: h.traditionIds.some((id) => /^wheel/.test(id)) ? 'sabbat' : 'other', name: h.name, label: h.name, date: new Date(h.date) });
    }
  } else {
    let cursor = from;
    for (let i = 0; i < 2; i++) {
      const s = nextSabbat(cursor);
      out.push({ occasion: 'sabbat', name: s.name, label: s.name, date: new Date(s.date) });
      cursor = new Date(s.date.getTime() + 86400000 * 2);
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, count);
}

/** A suggestion's date at a sensible hour: moons at their own time (to the quarter hour), sabbats at 8pm. */
export function suggestionTime(suggestion: Pick<Suggestion, 'occasion' | 'date'>): Date {
  const d = new Date(suggestion.date);
  if (suggestion.occasion === 'sabbat') d.setHours(20, 0, 0, 0);
  else d.setMinutes(Math.round(d.getMinutes() / 15) * 15, 0, 0);
  return d;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** A time as the form's date ("2026-10-31") and time ("20:00") fields, in local time. */
export function toFields(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** The form's date and time as an ISO time (null when there's no date; an error when it doesn't read). */
export function fromFields(date: string, time: string): string | null | Error {
  const day = date.trim();
  if (!day) return null;
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(day);
  const t = /^(\d{1,2}):(\d{2})$/.exec(time.trim() || '19:00');
  if (!m) return new Error('Write the date as year-month-day, like 2026-10-31.');
  if (!t) return new Error('Write the time as hours and minutes, like 19:30.');
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(t[1]), Number(t[2]));
  if (Number.isNaN(d.getTime()) || d.getMonth() !== Number(m[2]) - 1 || Number(t[1]) > 23) return new Error('That date or time doesn’t exist.');
  return d.toISOString();
}

/** Things a step can set on the altar: every picture in the cabinet but candles (they're lit instead). */
export const PLACEABLE = builtInCabinet
  .filter((item) => item.category !== 'candles' && item.category !== 'backgrounds')
  .flatMap((item) => {
    const forms = item.forms.filter((f) => f.image);
    return forms.map((f) => ({
      name: forms.length > 1 ? `${item.name} · ${f.label}` : item.name,
      image: f.image.replace(/^(\.\.\/)+/, '/'),
      category: String(item.category),
      keywords: item.keywords,
    }));
  })
  .filter((p) => /^\/assets\/altar\/[A-Za-z0-9/_.-]+\.(png|PNG|jpg|jpeg|webp)$/.test(p.image));

export function searchPlaceable(query: string, limit = 24) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const list = words.length ? PLACEABLE.filter((p) => words.every((w) => [p.name, p.category, ...p.keywords].join(' ').toLowerCase().includes(w))) : PLACEABLE;
  return list.slice(0, limit);
}
