// Ritual and ritual template entries get their own page layout instead of the
// usual field list, as on the website (renderRitualRecord and
// renderRitualTemplateRecord in grimoire/js/app.js). The My Practice keys are
// the ones app/src/lib/rituals/rows.ts and the website write. Pure, so it can
// be tested.

export type RecordFact = { label: string; value: string };
export type RecordSection = { title: string; text: string; chips?: string[] };
export type RitualRecord = { facts: RecordFact[]; sections: RecordSection[] };

/** "1 hr 5 min", or "Not recorded" (formatRitualDuration). */
export function formatRitualDuration(seconds: unknown): string {
  const totalMinutes = Math.max(0, Math.round(Number(seconds || 0) / 60));
  if (!totalMinutes) return 'Not recorded';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [hours ? `${hours} hr` : '', minutes ? `${minutes} min` : ''].filter(Boolean).join(' ');
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '');
const joined = (...values: unknown[]) => values.map(text).filter(Boolean).join('\n\n');

/** "2026-10-12" as a long date ("October 12, 2026"), read at midday so it never slips a day. */
export function longDate(value: string, locale?: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
}

/** The record page for a ritual or ritual template's My Practice, or null for other types. */
export function ritualRecord(type: string, practice: Record<string, unknown> | null, locale?: string): RitualRecord | null {
  const p = practice ?? {};
  const sections = (rows: RecordSection[]) => rows.filter((row) => row.text || row.chips?.length);

  if (type === 'ritual') {
    const facts: RecordFact[] = [];
    if (text(p.Date)) facts.push({ label: 'Date', value: longDate(text(p.Date), locale) });
    if (text(p.TimeOfDay)) facts.push({ label: 'Time of day', value: text(p.TimeOfDay) });
    facts.push({ label: 'Duration', value: formatRitualDuration(p.DurationSeconds) });
    const altarItems = Array.isArray(p.AltarItems) ? p.AltarItems.map(text).filter(Boolean) : [];
    return {
      facts,
      sections: sections([
        { title: 'Intention', text: text(p.Intention) },
        { title: 'The Altar', text: '', chips: altarItems },
        { title: 'What Happened', text: joined(p.WhatHappenedDuring, p.WhatHappenedAfter) },
        { title: 'Feelings and Impressions', text: joined(p.FeelingsBefore, p.FeelingsDuring, p.FeelingsAfter) },
        { title: 'Signs and Symbols', text: text(p.SignsAndSymbols) },
        { title: 'Results and Follow-Up', text: joined(p.Results, p.DreamsAndFollowUp, p.ChangesForNextTime) },
        { title: 'Private Notes', text: text(p.Notes) },
      ]),
    };
  }

  if (type === 'ritual_template') {
    return {
      facts: [],
      sections: sections([
        { title: 'Purpose and Intention', text: text(p.Purpose) },
        { title: 'Preparation', text: text(p.Preparation) },
        { title: 'Estimated Duration', text: formatRitualDuration(p.EstimatedDurationSeconds) },
        { title: 'Closing', text: text(p.Closing) },
      ]),
    };
  }
  return null;
}
