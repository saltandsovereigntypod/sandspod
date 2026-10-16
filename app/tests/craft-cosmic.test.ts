import assert from 'node:assert/strict';
import { test } from 'node:test';

import { planetaryHours } from '../src/lib/astro/hours.ts';
import {
  ascendant,
  birthInstant,
  formatOffset,
  formatPlacement,
  greenwichSiderealTime,
  midheaven,
  natalChart,
  parseOffset,
  parseTime,
} from '../src/lib/craft/cosmic/chart.ts';
import { HOUR_PLANETS, HOUR_SUITS, nextHoursOf, vocForDay } from '../src/lib/craft/cosmic/hours.ts';
import { aspectBetween, moonInSign, RISING, separation, transitsAt } from '../src/lib/craft/cosmic/transits.ts';
import { moonSign, SIGNS } from '../src/lib/moon.ts';

const close = (actual: number, expected: number, tolerance: number, label = '') =>
  assert.ok(Math.abs(((actual - expected + 540) % 360) - 180) <= tolerance, `${label} ${actual} vs ${expected}`);

test('parses birth times, offsets and dates', () => {
  assert.deepEqual(parseTime('14:30'), { hour: 14, minute: 30 });
  assert.deepEqual(parseTime('2:05 pm'), { hour: 14, minute: 5 });
  assert.deepEqual(parseTime('12 am'), { hour: 0, minute: 0 });
  assert.deepEqual(parseTime('0905'), { hour: 9, minute: 5 });
  assert.equal(parseTime('25:00'), null);
  assert.equal(parseTime(''), null);
  assert.equal(parseOffset('+1'), 60);
  assert.equal(parseOffset('-5'), -300);
  assert.equal(parseOffset('UTC+5:30'), 330);
  assert.equal(parseOffset('GMT-03:00'), -180);
  assert.equal(parseOffset('0'), 0);
  assert.equal(parseOffset('+15'), null);
  assert.equal(formatOffset(330), 'UTC+5:30');
  assert.equal(formatOffset(-300), 'UTC−5');
  assert.equal(birthInstant({ date: '1990-02-30', time: '10:00', utcOffsetMinutes: 0 }), null);
  assert.equal(birthInstant({ date: '2000-01-01', time: '01:00', utcOffsetMinutes: 120 })!.toISOString(), '1999-12-31T23:00:00.000Z');
});

test('sidereal time matches Meeus example 12.a', () => {
  // 1987 April 10, 0h UT: mean sidereal time 13h10m46.3668s = 197.693195°.
  close(greenwichSiderealTime(new Date(Date.UTC(1987, 3, 10))), 197.693195, 0.0005, 'GMST');
});

test('ascendant and midheaven hold at simple points', () => {
  // On the equator with 0° Aries culminating, 0° Cancer rises.
  close(ascendant(0, 0, 23.44), 90, 1e-9, 'asc');
  close(midheaven(0, 23.44), 0, 1e-9, 'mc');
  close(midheaven(90, 23.44), 90, 1e-9, 'mc 90');
  close(ascendant(180, 0, 23.44), 270, 1e-9, 'asc 180');
  // The ascendant always lies in the half of the zodiac just ahead of the midheaven.
  for (const lat of [-45, -10, 10, 51.5]) {
    for (let lst = 0; lst < 360; lst += 15) {
      const ahead = (ascendant(lst, lat, 23.44) - midheaven(lst, 23.44) + 360) % 360;
      assert.ok(ahead > 0 && ahead < 180, `lat ${lat} lst ${lst}: ${ahead}`);
    }
  }
});

test('Albert Einstein’s chart matches published values', () => {
  // 14 March 1879, 11:30 local mean time, Ulm (48°24′N, 9°59′E; LMT = UTC+0:40).
  // Published (Astrotheme): Sun 23°30′ Pisces, Moon 14°32′ Sagittarius, Asc 11°38′ Cancer, MC 12°50′ Pisces.
  const chart = natalChart({ date: '1879-03-14', time: '11:30', utcOffsetMinutes: 40, latitude: 48.398, longitude: 9.992 })!;
  assert.equal(chart.instant.toISOString(), '1879-03-14T10:50:00.000Z');
  const sun = chart.placements.find((p) => p.body === 'Sun')!;
  const moon = chart.placements.find((p) => p.body === 'Moon')!;
  close(sun.longitude, 330 + 23.5, 0.1, 'sun');
  close(moon.longitude, 240 + 14.53, 0.1, 'moon');
  close(chart.ascendant!.longitude, 90 + 11.633, 0.1, 'asc');
  close(chart.midheaven!.longitude, 330 + 12.833, 0.1, 'mc');
  assert.equal(formatPlacement(chart.ascendant!), '11°38′ Cancer');
  assert.equal(chart.placements.find((p) => p.body === 'Mars')!.sign, 'Capricorn');
  assert.equal(chart.placements.find((p) => p.body === 'Saturn')!.sign, 'Aries');
});

test('without a time there is no rising sign, and an uncertain Moon is flagged', () => {
  const chart = natalChart({ date: '1879-03-14', time: '', utcOffsetMinutes: 40, latitude: 48.4, longitude: 10 })!;
  assert.equal(chart.timeKnown, false);
  assert.equal(chart.ascendant, null);
  // Find a day the Moon changes sign and check it offers both.
  let day = Date.UTC(2024, 0, 1);
  while (moonSign(new Date(day)) === moonSign(new Date(day + 86_340_000))) day += 86_400_000;
  const d = new Date(day).toISOString().slice(0, 10);
  const flagged = natalChart({ date: d, utcOffsetMinutes: 0 })!;
  assert.ok(flagged.placements.find((p) => p.body === 'Moon')!.orSign);
});

test('aspects and transits', () => {
  assert.equal(separation(350, 10), 20);
  assert.deepEqual(aspectBetween(10, 100.5, 3), { aspect: 'square', off: 0.5 });
  assert.equal(aspectBetween(10, 50, 3), null);
  assert.equal(aspectBetween(359, 181, 3)?.aspect, 'opposition');
  const chart = natalChart({ date: '1990-06-15', time: '08:00', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.1 })!;
  const now = new Date(Date.UTC(2026, 9, 16, 12));
  const transits = transitsAt(chart, now);
  for (const t of transits) assert.ok(t.off <= (t.transiting === 'Moon' ? 5 : 3));
  for (let i = 1; i < transits.length; i++) assert.ok(transits[i].off >= transits[i - 1].off);
  // A chart cast for this very moment has the transiting Sun on its natal Sun.
  const self = natalChart({ date: '2026-10-16', time: '12:00', utcOffsetMinutes: 0, latitude: 0, longitude: 0 })!;
  assert.ok(transitsAt(self, now).some((t) => t.transiting === 'Sun' && t.natal === 'Sun' && t.aspect === 'conjunction'));
});

test('moon passes through each sign within a month, in short spells', () => {
  const from = new Date(Date.UTC(2026, 9, 1));
  const to = new Date(Date.UTC(2026, 10, 1));
  for (const sign of SIGNS) {
    const spells = moonInSign(sign, from, to);
    assert.ok(spells.length >= 1 && spells.length <= 2, `${sign}: ${spells.length}`);
    for (const s of spells) {
      assert.ok(s.end.getTime() - s.start.getTime() < 3 * 86_400_000);
      assert.equal(moonSign(new Date((s.start.getTime() + s.end.getTime()) / 2)), sign);
    }
  }
  assert.equal(Object.keys(RISING).length, 12);
});

test('planetary hours helpers', () => {
  const place = { latitude: 51.5, longitude: -0.12 };
  const now = new Date(Date.UTC(2026, 9, 16, 12));
  for (const p of HOUR_PLANETS) {
    assert.ok(HOUR_SUITS[p].suits.length > 20);
    const next = nextHoursOf(p, now, place, 3);
    assert.equal(next.length, 3, p);
    for (const h of next) assert.equal(h.planet, p);
    assert.ok(next[0].end.getTime() > now.getTime());
  }
  assert.equal(planetaryHours(now, place)!.length, 24);
  const day = new Date(Date.UTC(2026, 9, 16));
  for (const v of vocForDay(day)) {
    assert.ok(v.start.getTime() < day.getTime() + 86_400_000 && v.end.getTime() > day.getTime());
    assert.ok(v.end.getTime() > v.start.getTime());
  }
});
