import assert from 'node:assert/strict';
import { test } from 'node:test';

import { foldLine, googleCalendarUrl, icsText, moonEvents, planEvent, sabbatEvents, toIcs } from '../src/lib/reminders/calendarEvent.ts';
import type { RitualPlan, TemplateRow } from '../src/lib/rituals/types.ts';

const plan: RitualPlan = {
  id: 'p1',
  date: '2026-09-29',
  time: '21:30',
  title: 'Love working',
  intention: 'Love',
  intentionKey: 'love',
  templateId: null,
  draft: null,
  ingredients: [
    { ref: 'traditional/candle/pink', name: 'Pink Candle', type: 'candle' },
    { ref: 'traditional/herb/rose', name: 'Rose', type: 'herb' },
  ],
  createdAt: '',
};

test('a planned ritual becomes an event with its moon and what to bring', () => {
  const event = planEvent(plan)!;
  assert.equal(event.key, 'plan-p1');
  assert.equal(event.title, 'Love working');
  assert.equal(event.allDay, false);
  assert.deepEqual([event.start.getDate(), event.start.getHours(), event.start.getMinutes()], [29, 21, 30]);
  assert.equal((event.end.getTime() - event.start.getTime()) / 60_000, 60, 'an hour by default');
  assert.match(event.notes, /^Moon: Waning Gibbous$/m);
  assert.match(event.notes, /^Intention: Love$/m);
  assert.match(event.notes, /^Bring: Pink Candle, Rose$/m);
});

test('a template sets the length and fills in what to bring', () => {
  const template = {
    id: 't1',
    title: 'Full moon offering',
    estimated_duration_seconds: 3600,
    preparation: 'Milk and honey',
    metadata: {},
  } as unknown as TemplateRow;
  const event = planEvent({ ...plan, ingredients: [], templateId: 't1' }, template)!;
  assert.equal((event.end.getTime() - event.start.getTime()) / 60_000, 80, 'timers plus time to open and close');
  assert.match(event.notes, /^Ritual: Full moon offering$/m);
  assert.match(event.notes, /^Preparation: Milk and honey$/m);
  assert.equal(planEvent({ ...plan, date: 'someday' }), null);
});

test('moon phase and sabbat events are all-day, stable and chosen', () => {
  const from = new Date(2026, 8, 20);
  const fulls = moonEvents({ new: false, firstQuarter: false, full: true, lastQuarter: false }, from, 90);
  assert.equal(fulls.length, 3);
  assert.ok(fulls.every((e) => e.allDay && /^Full Moon in \w+$/.test(e.title) && e.key.startsWith('moon-full-')));
  assert.equal(fulls[0].end.getTime() - fulls[0].start.getTime() >= 23 * 3_600_000, true);
  assert.equal(moonEvents({ new: false, firstQuarter: false, full: false, lastQuarter: false }, from).length, 0);

  const sabbats = sabbatEvents(from, 365);
  assert.deepEqual(sabbats.map((s) => s.title), ['Mabon', 'Samhain', 'Yule', 'Imbolc', 'Ostara', 'Beltane', 'Litha', 'Lammas']);
  assert.equal(sabbats[1].key, 'sabbat-samhain-2026');
  assert.equal(sabbats[1].start.getMonth(), 9);
  assert.equal(sabbats[1].start.getDate(), 31);
});

test('.ics output follows RFC 5545', () => {
  const now = new Date(Date.UTC(2026, 8, 25, 12, 0, 0));
  const ics = toIcs([planEvent(plan)!, ...sabbatEvents(new Date(2026, 9, 1), 40)], now);
  const lines = ics.split('\r\n');
  assert.equal(lines[0], 'BEGIN:VCALENDAR');
  assert.equal(lines.at(-2), 'END:VCALENDAR');
  assert.ok(ics.endsWith('\r\n'));
  assert.ok(lines.includes('UID:plan-p1@app.saltandsovereignty.com'), 'a stable UID so re-importing updates');
  assert.ok(lines.includes('DTSTAMP:20260925T120000Z'));
  const start = planEvent(plan)!.start;
  const utc = `${start.getUTCFullYear()}${String(start.getUTCMonth() + 1).padStart(2, '0')}${String(start.getUTCDate()).padStart(2, '0')}T${String(start.getUTCHours()).padStart(2, '0')}${String(start.getUTCMinutes()).padStart(2, '0')}00Z`;
  assert.ok(lines.includes(`DTSTART:${utc}`));
  assert.ok(lines.includes('DTSTART;VALUE=DATE:20261031'));
  assert.ok(lines.includes('DTEND;VALUE=DATE:20261101'));
  assert.ok(lines.includes('SUMMARY:Samhain'));
  assert.ok(lines.every((l) => new TextEncoder().encode(l).length <= 75), 'lines are folded');
  assert.equal(lines.filter((l) => l === 'BEGIN:VEVENT').length, 2);
});

test('text is escaped and long lines fold on character boundaries', () => {
  assert.equal(icsText('Salt, sage; and \\ a\nnew line'), 'Salt\\, sage\\; and \\\\ a\\nnew line');
  const long = `DESCRIPTION:${'🌙 moon '.repeat(20)}`;
  const folded = foldLine(long);
  const parts = folded.split('\r\n');
  assert.ok(parts.length > 1);
  assert.ok(parts.slice(1).every((p) => p.startsWith(' ')));
  assert.equal(parts.map((p, i) => (i ? p.slice(1) : p)).join(''), long);
  assert.ok(parts.every((p) => new TextEncoder().encode(p).length <= 75));
});

test('the Google Calendar link carries the title, times and notes', () => {
  const url = new URL(googleCalendarUrl(planEvent(plan)!));
  assert.equal(url.hostname, 'calendar.google.com');
  assert.equal(url.searchParams.get('action'), 'TEMPLATE');
  assert.equal(url.searchParams.get('text'), 'Love working');
  assert.match(url.searchParams.get('dates') ?? '', /^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/);
  assert.match(url.searchParams.get('details') ?? '', /Bring: Pink Candle, Rose/);
  const allDay = new URL(googleCalendarUrl(sabbatEvents(new Date(2026, 9, 1), 40)[0]));
  assert.equal(allDay.searchParams.get('dates'), '20261031/20261101');
});
