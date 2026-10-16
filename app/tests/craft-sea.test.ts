import assert from 'node:assert/strict';
import { test } from 'node:test';

import { beaches, blankFind, byFound, filterFinds, findTitle, parseDay, suggestRange, type ShoreFind } from '../src/lib/craft/sea/finds.ts';
import {
  distanceKm,
  eventsByDay,
  moonDistanceKm,
  nearestStations,
  nextRange,
  parsePredictions,
  predictionsUrl,
  rangeOnDay,
  rangeStage,
  sameClock,
  searchStations,
  slimStations,
  tideNow,
  upcomingRanges,
} from '../src/lib/craft/sea/tides.ts';

// The shape NOAA sent for San Francisco (9414290) on 16 October 2026.
const SAMPLE = {
  predictions: [
    { t: '2026-10-16 05:32', v: '4.24', type: 'H' },
    { t: '2026-10-16 09:28', v: '3.671', type: 'L' },
    { t: '2026-10-16 15:11', v: '5.212', type: 'H' },
    { t: '2026-10-16 22:32', v: '0.514', type: 'L' },
    { t: '2026-10-17 06:48', v: '4.25', type: 'H' },
    { t: '2026-10-17 10:56', v: '3.721', type: 'L' },
  ],
};

test('parses NOAA high/low predictions and groups them by day', () => {
  const events = parsePredictions(SAMPLE);
  assert.equal(events.length, 6);
  assert.deepEqual(events[0], { time: '2026-10-16 05:32', day: '2026-10-16', clock: '05:32', height: 4.24, kind: 'high' });
  const days = eventsByDay(events);
  assert.deepEqual(days.map((d) => [d.day, d.events.length]), [['2026-10-16', 4], ['2026-10-17', 2]]);
});

test('passes on NOAA’s error message and rejects junk', () => {
  assert.throws(() => parsePredictions({ error: { message: ' The station is not a valid station or there is system error.' } }), /not a valid station/);
  assert.throws(() => parsePredictions(null));
  assert.deepEqual(parsePredictions({ predictions: [{ t: 'bad', v: '1', type: 'H' }, { t: '2026-10-16 05:32', v: 'x', type: 'H' }] }), []);
});

test('builds the documented NOAA request', () => {
  const url = predictionsUrl('9414290', 'metric', new Date(2026, 9, 30));
  for (const part of ['product=predictions', 'interval=hilo', 'datum=MLLW', 'units=metric', 'time_zone=lst_ldt', 'format=json', 'station=9414290', 'begin_date=20261030', 'end_date=20261101'])
    assert.ok(url.includes(part), part);
  assert.ok(url.startsWith('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?'));
});

test('reads what the water is doing now', () => {
  const events = parsePredictions(SAMPLE);
  const rising = tideNow(events, new Date(2026, 9, 16, 12, 0));
  assert.equal(rising?.state, 'rising');
  assert.equal(rising?.next.clock, '15:11');
  assert.equal(rising?.minutes, 191);
  assert.equal(tideNow(events, new Date(2026, 9, 16, 16, 0))?.state, 'falling');
  assert.equal(tideNow(events, new Date(2026, 9, 16, 15, 20))?.state, 'high');
  assert.equal(tideNow(events, new Date(2026, 9, 18, 12, 0)), null);
});

test('only trusts station times on the same clock as the phone', () => {
  // Pacific standard is -8; in daylight time a phone there reports offset 420 minutes.
  assert.equal(sameClock(-8, 480), true);
  assert.equal(sameClock(-8, 420), true);
  assert.equal(sameClock(-5, 420), false);
  assert.equal(sameClock(null, 0), false);
});

test('slims the station list and finds the nearest and by name', () => {
  const stations = slimStations({
    stations: [
      { id: '9414290', name: 'San Francisco', state: 'CA', lat: 37.8063, lng: -122.4659, timezonecorr: -8 },
      { id: '9410170', name: 'San Diego, San Diego Bay', state: 'CA', lat: 32.7142, lng: -117.1736, timezonecorr: -8 },
      { id: '8518750', name: 'The Battery', state: 'NY', lat: 40.7006, lng: -74.0142, timezonecorr: -5 },
      { id: 'x', name: 'Broken', lat: 'nope', lng: 1 },
    ],
  });
  assert.equal(stations.length, 3);
  assert.equal(nearestStations(stations, 37.77, -122.42, 1)[0].id, '9414290');
  assert.ok(nearestStations(stations, 37.77, -122.42, 1)[0].km < 10);
  assert.deepEqual(searchStations(stations, 'san').map((s) => s.id), ['9410170', '9414290']);
  assert.deepEqual(searchStations(stations, 'battery ny').map((s) => s.id), ['8518750']);
  assert.deepEqual(searchStations(stations, '  '), []);
  assert.throws(() => slimStations({}));
});

test('distance is sensible', () => {
  // London to Paris is about 344 km.
  assert.ok(Math.abs(distanceKm(51.5074, -0.1278, 48.8566, 2.3522) - 344) < 5);
});

test('moon distance matches the November 2016 perigee', () => {
  // 14 Nov 2016 11:23 UTC, 356,509 km.
  assert.ok(Math.abs(moonDistanceKm(new Date(Date.UTC(2016, 10, 14, 11, 23))) - 356509) < 300);
  assert.ok(moonDistanceKm(new Date(Date.UTC(2016, 9, 31))) > 404000);
});

test('springs follow new and full moons, neaps the quarters', () => {
  // Full moon 26 Oct 2026 about 04:12 UTC; first quarter 18 Oct.
  const springs = nextRange(new Date(Date.UTC(2026, 9, 20)), 'spring');
  assert.equal(springs.phase.phase, 'full');
  assert.equal(springs.from.toISOString().slice(0, 10), '2026-10-26');
  assert.equal(springs.peak.toISOString().slice(0, 10), '2026-10-27');
  const neaps = nextRange(new Date(Date.UTC(2026, 9, 16)), 'neap');
  assert.equal(neaps.phase.phase, 'firstQuarter');
  assert.equal(rangeStage(new Date(Date.UTC(2026, 9, 27, 12))).stage, 'spring');
  assert.equal(rangeStage(new Date(Date.UTC(2026, 9, 24, 12))).stage, 'building');
  assert.equal(rangeStage(new Date(Date.UTC(2026, 9, 16, 12))).stage, 'easing');
  const list = upcomingRanges(new Date(Date.UTC(2026, 9, 16)), 4);
  assert.deepEqual(list.map((r) => r.range), ['neap', 'spring', 'neap', 'spring']);
  for (let i = 1; i < list.length; i++) assert.ok(list[i].from > list[i - 1].from);
});

test('flags perigean springs', () => {
  // The full moon of 24 Nov 2026 comes about a day before perigee.
  const r = upcomingRanges(new Date(Date.UTC(2026, 10, 20)), 4).find((x) => x.range === 'spring');
  assert.equal(r?.perigean, true);
  // The new moon of 9 Nov 2026 is near apogee.
  const far = upcomingRanges(new Date(Date.UTC(2026, 10, 5)), 4).find((x) => x.range === 'spring');
  assert.equal(far?.perigean, false);
});

test('suggests spring or neap for a find’s day', () => {
  assert.equal(rangeOnDay(new Date(2026, 9, 27)), 'spring');
  assert.equal(suggestRange('2026-10-27'), 'spring');
  assert.equal(suggestRange('2026-10-23'), null);
  assert.equal(suggestRange('not a date'), null);
  assert.equal(parseDay('2026-02-30'), null);
  assert.equal(blankFind(new Date(2026, 9, 27)).range, 'spring');
});

const find = (patch: Partial<ShoreFind>, createdAt = '2026-10-01T00:00:00Z') => ({
  createdAt,
  data: { ...blankFind(new Date(2026, 9, 1)), ...patch },
});

test('filters, names and sorts finds', () => {
  const list = [
    find({ kind: 'seaglass', colour: 'Cobalt', where: 'Seaham', date: '2026-10-02', purpose: 'Calm' }),
    find({ kind: 'hagstone', where: 'seaham ', date: '2026-10-05', notes: 'Hung by the door' }),
    find({ kind: 'shell', where: 'Whitby', date: '2026-09-30', name: 'Little cowrie' }),
  ];
  assert.equal(filterFinds(list, { kind: 'seaglass' }).length, 1);
  assert.equal(filterFinds(list, { where: 'Seaham' }).length, 2);
  assert.equal(filterFinds(list, { query: 'door' }).length, 1);
  assert.equal(filterFinds(list, { query: 'cobalt glass' }).length, 1);
  assert.deepEqual(beaches(list), ['Seaham', 'Whitby']);
  assert.equal(findTitle(list[0].data), 'Cobalt sea glass');
  assert.equal(findTitle(list[2].data), 'Little cowrie');
  assert.equal(findTitle(list[1].data), 'Hagstone');
  assert.deepEqual(byFound(list).map((f) => f.data.date), ['2026-10-05', '2026-10-02', '2026-09-30']);
});
