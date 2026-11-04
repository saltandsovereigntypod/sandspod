// The calendar feed (supabase/functions/ical-feed): its text (escaped, folded,
// CRLF), planned rituals at their own hour, coven gatherings, the holidays and
// moon phases the app keeps for it, ancestors' days every year; and the app's
// side: the secret link, the parts chosen, and the snapshot it writes.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ancestorEvents, buildCalendar, covenEvents, escapeText, feedParts, foldLine, isFeedToken, planEvents, skyEvents } from '../../supabase/functions/ical-feed/ics.ts';
import { feedPartsOf, feedPartsValue, feedUrl, googleSubscribeUrl, newFeedToken, skySnapshot, webcalUrl } from '../src/lib/reminders/calendarFeed.ts';

const NOW = new Date(Date.UTC(2026, 10, 4, 12));

test('text is escaped and long lines folded at 75 octets', () => {
  assert.equal(escapeText('Salt, ash; and\\ a\nnew line'), 'Salt\\, ash\\; and\\\\ a\\nnew line');
  const folded = foldLine(`SUMMARY:${'é'.repeat(60)}`);
  for (const line of folded.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75);
  assert.equal(folded.replace(/\r\n /g, ''), `SUMMARY:${'é'.repeat(60)}`);
});

test('a whole feed: plans, coven rites, sky and ancestors', () => {
  const events = [
    ...planEvents(
      [
        { id: 'p1', planned_date: '2026-11-08', planned_time: '9:30', title: 'Candle for Nan', intention: 'Remembering', done_at: null },
        { id: 'old', planned_date: '2026-01-01', planned_time: '21:00', title: 'Long ago', intention: null, done_at: null },
      ],
      NOW,
    ),
    ...covenEvents(
      [
        { id: 'r1', coven_id: 'c1', title: 'Full moon rite', scheduled_for: '2026-11-24T19:00:00+00:00', status: 'scheduled', kind: 'rite' },
        { id: 'r2', coven_id: 'c1', title: 'Draft', scheduled_for: '2026-11-25T19:00:00Z', status: 'draft' },
        { id: 'r3', coven_id: 'c1', title: 'Called off', scheduled_for: '2026-11-26T19:00:00Z', status: 'cancelled' },
      ],
      { c1: 'Hearth Coven' },
    ),
    ...skyEvents(
      { events: [{ key: 'holiday-samhain-2026-10-31', title: 'Samhain', date: '2026-10-31', days: 1, notes: 'Summer’s end', kind: 'holiday' }, { key: 'moon-full-2026-11-24', title: 'Full Moon in Gemini', date: '2026-11-24', kind: 'moon' }, { title: 'no key' }] },
      feedParts('holidays,ancestors'),
    ),
    ...ancestorEvents(
      [
        { id: 'nan', data: { name: 'Nan', born: { year: 1932, month: 11, day: 10 }, died: { year: null, month: null, day: null }, days: [{ month: 6, day: 24, name: 'Name day' }] } },
        { id: 'leap', data: { name: 'Leap', born: { year: 1960, month: 2, day: 29 } } },
      ],
      NOW,
    ),
  ];
  const ics = buildCalendar(events, NOW);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  assert.ok(!/[^\r]\n/.test(ics), 'CRLF only');
  assert.match(ics, /UID:plan-p1@app\.saltandsovereignty\.com\r\nDTSTAMP:20261104T120000Z\r\nDTSTART:20261108T093000\r\nDTEND:20261108T103000\r\n/);
  assert.ok(!ics.includes('Long ago'));
  assert.match(ics, /DTSTART:20261124T190000Z\r\nDTEND:20261124T203000Z\r\nSUMMARY:Full moon rite · Hearth Coven/);
  assert.ok(!ics.includes('Draft'));
  assert.match(ics, /SUMMARY:Called off · Hearth Coven/);
  assert.match(ics, /STATUS:CANCELLED/);
  assert.match(ics, /DTSTART;VALUE=DATE:20261031\r\nDTEND;VALUE=DATE:20261101/);
  assert.ok(!ics.includes('Full Moon in Gemini'), 'moon phases left out when not chosen');
  assert.match(ics, /UID:ancestor-nan-birth@[^\r]+\r\nDTSTAMP:[^\r]+\r\nDTSTART;VALUE=DATE:20251110\r\nDTEND;VALUE=DATE:20251111\r\nRRULE:FREQ=YEARLY\r\n/);
  assert.match(ics, /SUMMARY:Nan’s birthday\r\nDESCRIPTION:Born in 1932\./);
  assert.match(ics, /SUMMARY:Nan: Name day/);
  assert.ok(!ics.includes('ancestor-nan-death'), 'no day, no event');
  assert.match(ics, /DTSTART;VALUE=DATE:20240229\r\nDTEND;VALUE=DATE:20240301\r\nRRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1/);
  assert.match(ics, /X-WR-CALNAME:Salt & Sovereignty/);
});

test('parts and tokens', () => {
  assert.deepEqual([...feedParts('')], ['rituals', 'covens', 'holidays', 'moon', 'ancestors']);
  assert.deepEqual([...feedParts('moon, nonsense,rituals')], ['moon', 'rituals']);
  assert.equal(isFeedToken('short'), false);
  assert.equal(isFeedToken('a'.repeat(31)), false);
  assert.equal(isFeedToken(`${'a'.repeat(40)}'; drop`), false);
  const token = newFeedToken();
  assert.equal(token.length, 43);
  assert.ok(isFeedToken(token), 'the app’s tokens are ones the feed accepts');
  assert.notEqual(newFeedToken(), token);
  assert.equal(newFeedToken({ getRandomValues: (a) => a.fill(255) }), `${'_'.repeat(42)}8`);
});

test('the app’s side: link, parts and snapshot', () => {
  const url = feedUrl('https://x.supabase.co/', 'abc_DEF-123');
  assert.equal(url, 'https://x.supabase.co/functions/v1/ical-feed?t=abc_DEF-123');
  assert.equal(webcalUrl(url), 'webcal://x.supabase.co/functions/v1/ical-feed?t=abc_DEF-123');
  assert.match(googleSubscribeUrl(url), /^https:\/\/calendar\.google\.com\/calendar\/r\?cid=webcal%3A%2F%2F/);
  assert.deepEqual(feedPartsOf(undefined), ['rituals', 'covens', 'holidays', 'moon', 'ancestors']);
  assert.equal(feedPartsValue(['moon', 'rituals']), 'rituals,moon');
  const snap = skySnapshot({ new: false, firstQuarter: false, full: false, lastQuarter: false }, { traditions: ['wheel'], custom: [] }, new Date(2026, 10, 4), 60);
  const moons = snap.events.filter((e) => e.kind === 'moon');
  assert.ok(moons.length >= 3 && moons.every((e) => /New|Full/.test(e.title)), 'new and full when none chosen');
  assert.ok(snap.events.some((e) => e.kind === 'holiday' && e.title === 'Yule'));
  const ics = buildCalendar(skyEvents(snap, feedParts('')), NOW);
  assert.match(ics, /SUMMARY:Yule/);
});
