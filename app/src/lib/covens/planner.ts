// The coven ritual planner's rules, shared with the website (js/core/covens.js
// and covens/coven-logic.js): what a step is (its name, action, directions,
// words, who does it, how long, its items and what it does on the altar, and
// anything it asks of people), who can be given a part, dates to suggest from
// the moon and the sabbats (or the coven's own calendar), copying steps from
// one of your own rituals, and the form's date and time. Pure, so it can be
// tested.

import { builtInCabinet } from '../altar/cabinet.ts';
import { cleanStepItems, stepCandle, type StepItem } from '../altar/itemIndex.ts';
import { nextSabbat } from '../calendar.ts';
import type { Holiday } from '../holidays.ts';
import { upcomingPhases } from '../moon.ts';
import { cleanContribution, type StepContribution } from './contributions.ts';
import { stepItemsLabel, type RitualStep } from './model.ts';
import { assigneesOf, cleanAssignees, legacyColumns, type Assignee } from './picker.ts';
import { ALTAR_EFFECTS, type AltarEffect } from './stepActions.ts';

/** What a step can do on the altar (the original four, and releasing the papers). */
export const ALTAR_ACTIONS = ALTAR_EFFECTS.map((e) => ({ value: e.value, label: e.label }));
export type StepAltarAction = AltarEffect;

export type AltarAccess = 'assigned' | 'everyone' | 'leader' | 'chosen';

export const ALTAR_ACCESS: { value: AltarAccess; label: string }[] = [
  { value: 'assigned', label: 'Whoever does the step' },
  { value: 'everyone', label: 'Everyone' },
  { value: 'leader', label: 'Only the leader' },
  { value: 'chosen', label: 'Chosen people' },
];

/** One step as the planner edits it. */
export type DraftStep = {
  id?: string | null;
  /** The step's short name. */
  title: string;
  /** Directions: what the person doing it does, shown when the step comes. */
  instructions: string;
  /** Words to speak (optional). */
  spoken_text: string;
  duration_minutes: number | null;
  /** Older steps' one person or one position (kept in step with assignees). */
  assigned_user_id: string | null;
  assigned_rank_id: string | null;
  /** Who does it (empty: read from the two above). */
  assignees: Assignee[];
  /** The action it was made from (stepActions.ts), or ''. */
  action: string;
  /** For actions that name a deity. */
  deity: string;
  items: StepItem[];
  contribution: StepContribution | null;
  altar_action: StepAltarAction;
  altar_color: string;
  altar_form: string;
  altar_image: string;
  altar_label: string;
  altar_access: AltarAccess;
  altar_tenders: Assignee[];
};

export const blankStep = (): DraftStep => ({
  title: '',
  instructions: '',
  spoken_text: '',
  duration_minutes: null,
  assigned_user_id: null,
  assigned_rank_id: null,
  assignees: [],
  action: '',
  deity: '',
  items: [],
  contribution: null,
  altar_action: '',
  altar_color: 'white',
  altar_form: 'votive',
  altar_image: '',
  altar_label: '',
  altar_access: 'assigned',
  altar_tenders: [],
});

/** A deity's name from the picker's entry: "Hekate Statue" reads as "Hekate". */
export const deityName = (label: string) => label.replace(/\s+(statue|figure|idol|icon)\b.*$/i, '').trim();

export function draftFromStep(step: RitualStep): DraftStep {
  const saved = cleanStepItems(step.items);
  // A step planned before items: its one picture becomes its item.
  const items = !saved.length && step.altar_action === 'place_item' && step.altar_image ? [{ key: `legacy|${step.altar_image}`, name: step.altar_label || 'Offering', image: step.altar_image, category: '' }] : saved;
  const deity = items.find((i) => i.category === 'deities');
  return {
    ...blankStep(),
    id: step.id,
    title: step.title,
    instructions: step.instructions ?? '',
    spoken_text: step.spoken_text ?? '',
    duration_minutes: step.duration_minutes,
    assigned_user_id: step.assigned_user_id,
    assigned_rank_id: step.assigned_rank_id,
    assignees: assigneesOf(step),
    action: step.action ?? '',
    deity: deity ? deityName(deity.name) : '',
    items,
    contribution: cleanContribution(step.contribution),
    altar_action: (step.altar_action ?? '') as StepAltarAction,
    altar_color: step.altar_color || 'white',
    altar_form: step.altar_form || 'votive',
    altar_image: step.altar_image ?? '',
    altar_label: step.altar_label ?? '',
    altar_access: step.altar_access ?? 'assigned',
    altar_tenders: cleanAssignees(step.altar_tenders),
  };
}

/** What save_coven_ritual takes for the steps (blank ones left out). */
export function stepsPayload(steps: DraftStep[]) {
  return steps
    .filter((s) => s.title.trim())
    .map((s) => {
      const assignees = assigneesOf(s);
      const items = cleanStepItems(s.items);
      const candle = stepCandle(items, { color: s.altar_color, form: s.altar_form });
      const placing = s.altar_action === 'place_item';
      const firstPicture = items.find((i) => i.image)?.image ?? '';
      return {
        id: s.id || null,
        title: s.title.trim(),
        instructions: s.instructions,
        spoken_text: s.spoken_text,
        duration_minutes: s.duration_minutes,
        ...legacyColumns(assignees),
        assignees,
        action: s.action || null,
        items,
        contribution: cleanContribution(s.contribution),
        altar_action: s.altar_action,
        altar_color: s.altar_action === 'light_candle' ? candle.color : '',
        altar_form: s.altar_action === 'light_candle' ? candle.form : '',
        altar_image: placing ? (items.length ? firstPicture : s.altar_image) : '',
        altar_label: placing ? (items.length ? stepItemsLabel({ items, altar_label: '' }).slice(0, 80) : s.altar_label) : '',
        altar_access: s.altar_access,
        altar_tenders: s.altar_access === 'chosen' ? cleanAssignees(s.altar_tenders) : [],
      };
    });
}

export type Candidate = { id: string; name: string; eligible: boolean };

/** Why a step can't go to someone it names (no longer a member, or not signed up to date), or ''. */
export function unassignablePart(step: Pick<DraftStep, 'assigned_user_id'> & { assignees?: Assignee[] | null; assigned_rank_id?: string | null }, people: Candidate[], nameOf: (id: string) => string): string {
  const users = assigneesOf(step).filter((a) => a.kind === 'user');
  for (const { id } of users) {
    const person = people.find((p) => p.id === id);
    const name = nameOf(id);
    if (!person) return `${name} is no longer a member. Give this step to someone else.`;
    if (!person.eligible) return `${name} hasn’t signed the coven’s current agreements, so can’t be given a part. Give this step to someone else.`;
  }
  return '';
}

/** What stops the ritual being saved, or ''. */
export function plannerProblem(title: string, steps: DraftStep[], people: Candidate[], nameOf: (id: string) => string): string {
  if (!title.trim()) return 'Give the ritual a name.';
  const kept = steps.filter((s) => s.title.trim());
  if (kept.length > 60) return 'A ritual can have up to 60 steps.';
  const noItem = kept.findIndex((s) => s.altar_action === 'place_item' && !s.altar_image && !(s.items ?? []).some((i) => i.image));
  if (noItem >= 0) return `Step ${noItem + 1}: choose what is placed on the altar.`;
  const blocked = kept.findIndex((s) => unassignablePart(s, people, nameOf));
  if (blocked >= 0) return `Step ${blocked + 1}: ${unassignablePart(kept[blocked], people, nameOf)}`;
  const noTenders = kept.findIndex((s) => s.altar_access === 'chosen' && !cleanAssignees(s.altar_tenders).length);
  if (noTenders >= 0) return `Step ${noTenders + 1}: choose who tends the altar during it.`;
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
