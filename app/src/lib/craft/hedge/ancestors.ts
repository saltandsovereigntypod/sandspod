// Ancestors: your beloved dead, the days that come round for them (their
// birth and death days, and the ancestor festivals in your calendars), and a
// short candle rite for one person. Pure, so it can be tested.

import { startOfDay } from '../../calendar.ts';
import { holidaysBetween, type HolidayChoice } from '../../holidays.ts';
import type { Ingredient, StepDraft, TemplateDraft } from '../../rituals/types.ts';

export const ANCESTORS = 'hedge.ancestors';

/** A date known in part: a year alone, a month and year, a day and month, or all three. */
export type PartialDate = { year: number | null; month: number | null; day: number | null };

export type Ancestor = {
  name: string;
  /** "Grandmother", "great-uncle on my mother’s side", "my teacher". */
  relation: string;
  born: PartialDate;
  died: PartialDate;
  /** What they loved, and what you offer them. */
  loved: string;
  memory: string;
};

export type AncestorEntry = { id: string; createdAt: string; data: Ancestor };

export const emptyDate = (): PartialDate => ({ year: null, month: null, day: null });

export const blankAncestor = (): Ancestor => ({ name: '', relation: '', born: emptyDate(), died: emptyDate(), loved: '', memory: '' });

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Read typed day, month and year boxes into a partial date. Anything out of
 * range is dropped rather than guessed; a day needs its month.
 */
export function partialDate(day: string, month: string, year: string): PartialDate {
  const num = (s: string) => (/^\s*\d+\s*$/.test(s) ? Number(s) : null);
  const y = num(year);
  const m = num(month);
  const d = num(day);
  const yearOk = y !== null && y >= 1 && y <= 9999 ? y : null;
  const monthOk = m !== null && m >= 1 && m <= 12 ? m : null;
  const dayOk = monthOk && d !== null && d >= 1 && d <= DAYS_IN_MONTH[monthOk - 1] ? d : null;
  // 29 February in a year that wasn't a leap year can't have happened.
  const leapOk = !(dayOk === 29 && monthOk === 2 && yearOk !== null && !isLeap(yearOk));
  return { year: yearOk, month: monthOk, day: leapOk ? dayOk : null };
}

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function normalizeDate(raw: unknown): PartialDate {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const s = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : '');
  return partialDate(s(r.day), s(r.month), s(r.year));
}

export function normalizeAncestor(raw: unknown): Ancestor {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Ancestor>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  return { name: str(r.name), relation: str(r.relation), born: normalizeDate(r.born), died: normalizeDate(r.died), loved: str(r.loved), memory: str(r.memory) };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "14 May 1932", "May 1932", "14 May", "1932", or "" when nothing is known. */
export function formatPartial(d: PartialDate): string {
  const parts: string[] = [];
  if (d.day && d.month) parts.push(String(d.day));
  if (d.month) parts.push(MONTHS[d.month - 1]);
  if (d.year) parts.push(String(d.year));
  return parts.join(' ');
}

/** "1932–2019", "b. 1932", "d. 2019", or "". */
export function lifespan(a: Ancestor): string {
  const b = a.born.year;
  const d = a.died.year;
  if (b && d) return `${b}–${d}`;
  if (b) return `born ${b}`;
  if (d) return `died ${d}`;
  return '';
}

export type Anniversary = {
  id: string;
  name: string;
  kind: 'birth' | 'death';
  date: Date;
  /** Whole days from today (0 = today). */
  inDays: number;
  /** Years since the birth or death, when the year is known. */
  years: number | null;
};

/** The next time a day and month comes round, on or after `from`'s day. 29 February keeps the 28th in other years. */
export function nextOccurrence(month: number, day: number, from: Date): Date {
  const today = startOfDay(from);
  for (let year = today.getFullYear(); ; year++) {
    const d = month === 2 && day === 29 && !isLeap(year) ? 28 : day;
    const date = new Date(year, month - 1, d);
    if (date.getTime() >= today.getTime()) return date;
  }
}

/** Birth and death days in the next `days` days (today included), soonest first. */
export function upcomingAnniversaries(people: AncestorEntry[], from: Date, days = 30): Anniversary[] {
  const today = startOfDay(from);
  const out: Anniversary[] = [];
  for (const p of people) {
    for (const kind of ['birth', 'death'] as const) {
      const d = kind === 'birth' ? p.data.born : p.data.died;
      if (!d.month || !d.day) continue;
      const date = nextOccurrence(d.month, d.day, today);
      const inDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);
      if (inDays > days) continue;
      out.push({ id: p.id, name: p.data.name || 'Unnamed', kind, date, inDays, years: d.year ? date.getFullYear() - d.year : null });
    }
  }
  return out.sort((a, b) => a.inDays - b.inDays || a.name.localeCompare(b.name));
}

/** "Her 94th birthday", "3 years since he died": plain words for an anniversary. */
export function anniversaryWords(a: Anniversary): string {
  if (a.kind === 'birth') return a.years ? `Born ${a.years} years ago` : 'Birthday';
  if (a.years === 0) return 'Died this year';
  if (a.years === 1) return 'One year since they died';
  return a.years ? `${a.years} years since they died` : 'The day they died';
}

/** Holiday ids ("<tradition>-<holiday>") from lib/holidays.ts that are days for the dead. */
export const ANCESTOR_HOLIDAYS = [
  'wheel-samhain',
  'wheel_south-samhain',
  'celtic-samhain_gaelic',
  'slavic-dziady',
  'christian-all_hallows_eve',
  'christian-all_souls',
  'roman-parentalia',
  'roman-lemuria',
  'hellenic-anthesteria',
  'norse-vetrnaetur',
  'norse-disablot',
];

export type AncestorDay = { name: string; meaning: string; date: Date; days: number; inDays: number };

/** Ancestor festivals from your chosen calendars in the next `days` days, soonest first. */
export function ancestorDays(choice: HolidayChoice, from: Date, days = 30): AncestorDay[] {
  const today = startOfDay(from);
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  return holidaysBetween(today, to, choice)
    .filter((h) => ANCESTOR_HOLIDAYS.includes(h.id.replace(/-\d+-\d+-\d+$/, '')))
    .map((h) => ({ name: h.name, meaning: h.meaning, date: h.date, days: h.days, inDays: Math.max(0, Math.round((h.date.getTime() - today.getTime()) / 86_400_000)) }));
}

const WHITE_CANDLE: Ingredient = { ref: 'traditional/candle/white', name: 'White candle', type: 'candle' };

const step = (title: string, instructions: string, extra: Partial<StepDraft> = {}): StepDraft => ({
  id: null,
  title,
  instructions,
  spoken_text: '',
  minutes: '',
  completion_mode: 'manual',
  actions: [],
  ...extra,
});

/** A short, gentle candle rite for one of your dead, to begin as a guided ritual. */
export function candleDraft(a: Ancestor): TemplateDraft {
  const name = a.name.trim() || 'the one I remember';
  const who = a.relation.trim() ? `${name}, my ${a.relation.trim().replace(/^my\s+/i, '')}` : name;
  const loved = a.loved.trim();
  const memory = a.memory.trim();
  const steps: StepDraft[] = [
    step(
      'Make a little room',
      `Find a quiet place and set down the candle in a sturdy holder, on something that won’t burn. Put beside it anything of ${name}’s you have, a photograph, or simply their name written on paper.${loved ? ` If you’d like to give them something, set out a little of what they loved: ${loved}.` : ''}`,
    ),
    step('Light the candle', 'Light the candle and watch the flame settle.', {
      spoken_text: `${who}, I light this for you. You are remembered here.`,
      actions: [{ type: 'light_all', when: 'start' }],
    }),
    step(
      'Remember them',
      memory
        ? `Say their name aloud. Then let this memory come back to you, slowly, in as much detail as you can: ${memory}`
        : 'Say their name aloud. Let a memory of them come: their voice, their hands, a place you shared. If you never met them, think of the life they lived that led to yours.',
      { minutes: '3' },
    ),
    step('Tell them', 'Tell them, aloud or quietly, what has happened since, or anything you wish you had said. Then sit with the flame and listen.', {
      minutes: '5',
    }),
    step('Say goodnight', 'Thank them. Snuff the candle rather than blowing it out, or let it burn on while you stay in the room with it.', {
      spoken_text: `Go gently, ${name}. I carry you with me.`,
      actions: [{ type: 'extinguish_all', when: 'end' }],
    }),
  ];
  return {
    id: null,
    title: `A candle for ${name}`,
    intention: `Remembering ${who}.`,
    preparation: [
      'Gather a candle (white, or a colour they loved), a holder and a lighter.',
      loved ? `If you have it, something they loved: ${loved}.` : '',
      'Take care: never leave a flame unattended, and keep it clear of photographs and paper. Grief can come up strongly; stop whenever you need to.',
    ]
      .filter(Boolean)
      .join('\n\n'),
    closing: loved
      ? 'Leave any food or drink offering until morning, then give it to the garden or the birds rather than the bin.'
      : 'Sit a moment longer before you go back to the evening. Write down anything that came to you.',
    linked_altar_id: null,
    grimoire_page_id: null,
    steps,
    ingredients: [WHITE_CANDLE],
    kind: 'template',
  };
}
