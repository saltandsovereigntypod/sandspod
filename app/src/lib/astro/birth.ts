// From what a person types (a date, maybe a time, a place with its time
// zone) to the offset the clocks kept there at that moment. Pure.

import { parseDate, parseTime } from '../craft/cosmic/chart.ts';
import { localToUtc, type LocalToUtc } from './time.ts';

/** The birthplace's UTC offset at the birth moment (local noon without a time), with any summer-time note. */
export function offsetForBirth(date: string, time: string | null | undefined, zone: string): LocalToUtc | null {
  const d = parseDate(date);
  if (!d || !zone) return null;
  const t = parseTime(time) ?? { hour: 12, minute: 0 };
  return localToUtc(Date.UTC(d.year, d.month - 1, d.day, t.hour, t.minute), zone);
}

/** "UTC−4:56" with seconds rounded, for local mean time offsets too. */
export function offsetLabel(minutes: number): string {
  const sign = minutes < 0 ? '−' : '+';
  const abs = Math.round(Math.abs(minutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

/** Plain words for a summer-time note. */
export function offsetNote(result: LocalToUtc): string | null {
  if (result.note === 'gap') return 'That clock time didn’t exist there: the clocks jumped forward over it that night. The time before the change is used; check the birth certificate.';
  if (result.note === 'overlap' && result.otherOffset !== null)
    return `That clock time happened twice there: the clocks went back that night. The first (${offsetLabel(result.offsetMinutes)}) is used; if you were born in the second hour, choose ${offsetLabel(result.otherOffset)}.`;
  return null;
}
