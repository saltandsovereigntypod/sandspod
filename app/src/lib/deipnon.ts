// Hekate's Deipnon, each month: on the last day of the Attic lunar month
// (holidays.ts, `hellenic_monthly`), a gentle note on Today and a reminder
// in the phone app: clean and cleanse the house, leave the supper at a
// crossroads, and draw the Crossroads spread. Shown to those who keep the
// Hellenic monthly days, or who hold Hekate as their patron (Settings → My
// deities); turned off with `deipnon_prompt` (Settings → Calendars), a
// setting the app and the website share. Pure.

import { holidayChoice, holidaysBetween } from './holidays.ts';
import { myDeities } from './patron/mine.ts';

type SettingsLike = Record<string, unknown> | null | undefined;

/** The setting that turns the note and the reminder off (on unless set to false). */
export const DEIPNON_SETTING = 'deipnon_prompt';
/** The spread it offers (draw.ts). */
export const DEIPNON_SPREAD = 'crossroads';

const isHekate = (d: { key: string | null; name: string }) => d.key === 'hekate' || /^he[ck]ate$/i.test(d.name.trim());

/** Whether you hold Hekate as a patron, or are dedicated to her (My deities). */
export const hekateIsPatron = (settings: SettingsLike) => myDeities(settings).some((d) => (d.level === 'patron' || d.level === 'dedicated') && isHekate(d));

/** Whether you keep the Hellenic monthly days, whole or the Deipnon picked into your own calendar. */
export function keepsHellenicMonthly(settings: SettingsLike): boolean {
  const choice = holidayChoice(settings);
  return choice.traditions.includes('hellenic_monthly') || (choice.picked ?? []).includes('hellenic_monthly/deipnon');
}

/** Whether to offer the Deipnon at all: you keep the monthly days or Hekate is your patron, and it isn't turned off. */
export function offersDeipnon(settings: SettingsLike): boolean {
  if (settings?.[DEIPNON_SETTING] === false) return false;
  return keepsHellenicMonthly(settings) || hekateIsPatron(settings);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** The Deipna (local days) from `from`'s day for `days` days, whoever keeps them. */
export function deipnonDays(from: Date, days: number): Date[] {
  const start = startOfDay(from);
  return holidaysBetween(start, addDays(start, days), { traditions: ['hellenic_monthly'], custom: [] })
    .filter((h) => h.id.startsWith('hellenic_monthly-deipnon-'))
    .map((h) => h.date)
    .filter((d) => d.getTime() >= start.getTime());
}

/** Whether `now` falls on a Deipnon. */
export const isDeipnon = (now: Date) => deipnonDays(now, 0).some((d) => d.getTime() === startOfDay(now).getTime());

export type DeipnonPrompt = { title: string; detail: string; steps: string[]; spread: string };

/** What the note says. */
export const DEIPNON_PROMPT: DeipnonPrompt = {
  title: 'Hekate’s Deipnon',
  detail: 'The last day of the moon’s month, when the old month is cleared away and Hekate is given her supper. Do as much or as little as suits you.',
  steps: [
    'Clean the house and cleanse it: sweep, take out what has gathered, and smoke or wash the threshold.',
    'Leave a small supper at a crossroads, or at your own door, and walk away without looking back. What is given to her is not eaten.',
    'Draw the Crossroads spread, and see what the guardian of the ways would have you know.',
  ],
  spread: DEIPNON_SPREAD,
};

/** The note for Today: on a Deipnon, for those it's offered to; otherwise null. */
export function deipnonToday(now: Date, settings: SettingsLike): DeipnonPrompt | null {
  return offersDeipnon(settings) && isDeipnon(now) ? DEIPNON_PROMPT : null;
}

export type DeipnonReminder = { key: string; date: Date; title: string; body: string; url: string };

/** The Deipnon reminders over the next `days`, for those it's offered to. */
export function deipnonReminders(settings: SettingsLike, from: Date, days: number): DeipnonReminder[] {
  if (!offersDeipnon(settings)) return [];
  return deipnonDays(from, days).map((date) => ({
    key: `deipnon:${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    date,
    title: 'Hekate’s Deipnon today',
    body: 'Clear and cleanse the house, leave her supper at a crossroads, and draw the Crossroads spread if you like.',
    url: '/today',
  }));
}
