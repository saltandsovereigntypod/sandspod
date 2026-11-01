// "Your chart in plain words" (lib/astro/interpret/plainWords.ts): five
// parts, in depth at Detailed, short at Simple, deterministic, jargon always
// explained, no sentence said twice, and charts without a birth time read
// plainly from what there is.

import assert from 'node:assert/strict';
import test from 'node:test';

import { castChart, type Chart } from '../src/lib/astro/natal.ts';
import { GLOSSES, plainWords } from '../src/lib/astro/interpret/plainWords.ts';

const cast = (input: Parameters<typeof castChart>[0]) => castChart(input)!;
const CHARTS: Record<string, () => Chart> = {
  london: () => cast({ date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5, longitude: -0.13 }),
  newYork: () => cast({ date: '1972-01-08', time: '23:45', utcOffsetMinutes: -300, latitude: 40.7, longitude: -74 }),
  sydney: () => cast({ date: '2003-09-27', time: '06:10', utcOffsetMinutes: 600, latitude: -33.87, longitude: 151.21 }),
  noTime: () => cast({ date: '1985-11-02', utcOffsetMinutes: 0, latitude: 51.5, longitude: -0.13 }),
};
const IDS = ['big-picture', 'runs-the-show', 'energy', 'tensions-gifts', 'fits-together'];
const TABS = ['wheel', 'placements', 'aspects', 'balance', 'reading', 'transits', 'craft'];

// Jargon that must be explained wherever it is used (ordinary words such as "fixed" and "house" are left out).
const CHECKED = ['rising sign', 'chart ruler', 'stellium', 'T-square', 'grand trine', 'grand cross', 'yod', 'kite pattern', 'conjunction', 'opposition', 'trine', 'sextile', 'quincunx', 'cardinal', 'mutable', 'retrograde', 'exalted', 'in detriment', 'in fall', 'Midheaven', 'on an angle', 'modality'];

const sentences = (text: string) => text.split(/(?<=[.?])\s+/).map((s) => s.trim()).filter((s) => s.length > 40);

for (const [name, make] of Object.entries(CHARTS)) {
  test(`plain words: ${name}`, () => {
    const chart = make();
    const w = plainWords(chart);
    assert.deepEqual(plainWords(make()), w, 'deterministic');
    assert.deepEqual(w.parts.map((p) => p.id), IDS);
    for (const level of ['simple', 'detailed'] as const) {
      const all: string[] = [];
      for (const p of w.parts) {
        const text = p[level];
        assert.ok(!/undefined|null|NaN|\[object|!|\(\(|\)\s\(| {2}| [,.;]/.test(text), `${name} ${p.id} ${level} is clean: ${text.match(/undefined|null|NaN|\[object|!|\(\(|\)\s\(| {2}| [,.;]/)?.[0]}`);
        // Every piece of jargon explained in the same part.
        // (The explanations themselves may use another term, explained in turn: leave them out of the search.)
        let rest = Object.values(GLOSSES).reduce((t, gloss) => t.split(gloss).join(''), text);
        for (const term of [...CHECKED].sort((a, b) => b.length - a.length)) {
          const re = new RegExp(`(^|[^\\w-])${term.replace('-', '\\-')}(?![\\w-])`, 'i');
          if (re.test(rest)) assert.ok(text.includes(GLOSSES[term]), `${name} ${p.id} ${level}: "${term}" is explained`);
          rest = rest.replace(new RegExp(term.replace('-', '\\-'), 'gi'), '');
        }
        all.push(...sentences(text));
      }
      const seen = new Set<string>();
      for (const s of all) {
        assert.ok(!seen.has(s), `${name} ${level}: said twice: ${s}`);
        seen.add(s);
      }
    }
    for (const p of w.parts) {
      assert.ok(p.detailed.length >= 900, `${name} ${p.id} is in depth (${p.detailed.length})`);
      assert.ok(p.detailed.split('\n\n').length >= 3, `${name} ${p.id} has several paragraphs`);
      assert.ok(p.simple.length >= 120 && p.simple.length < p.detailed.length / 2, `${name} ${p.id} has a short version (${p.simple.length})`);
      assert.ok(!p.simple.includes('\n'), 'the short version is one paragraph');
      assert.ok(p.links.length >= 2);
      for (const l of p.links) if ('tab' in l) assert.ok(TABS.includes(l.tab));
    }
  });
}

test('plain words: a chart with a time reads the rising sign, ruler and houses', () => {
  const w = plainWords(CHARTS.london());
  const part = (id: string) => w.parts.find((p) => p.id === id)!;
  assert.match(part('big-picture').detailed, /Your rising sign is Libra/);
  assert.match(part('big-picture').detailed, /Your Sun \(Gemini\) and your rising sign \(Libra\) are both air signs/);
  assert.match(part('runs-the-show').detailed, /Your chart ruler \(the planet that rules your rising sign, and so steers the whole chart\) is Venus/);
  assert.match(part('runs-the-show').detailed, /Venus is at home in Taurus/);
  assert.match(part('energy').detailed, /Your busiest area is your third house/);
  assert.match(part('tensions-gifts').detailed, /two T-squares/);
  assert.match(part('fits-together').detailed, /air and cardinal \(starting: the signs that begin each season\), which makes you a diplomat/);
  assert.match(part('fits-together').detailed, /its day is Friday/);
  assert.deepEqual(part('fits-together').links.find((l) => 'hours' in l), { label: 'Venus: days and hours', hours: 'Venus' });
});

test('plain words: without a birth time it says so and adapts', () => {
  const chart = CHARTS.noTime();
  assert.equal(chart.houses, null);
  const w = plainWords(chart);
  assert.match(w.intro, /Without a birth time/);
  const part = (id: string) => w.parts.find((p) => p.id === id)!;
  assert.match(part('big-picture').detailed, /Without a birth time there is no rising sign/);
  assert.doesNotMatch(part('big-picture').detailed, /Your rising sign is/);
  assert.match(part('runs-the-show').detailed, /ruler of the Sun's sign\. For you that is Mars/);
  assert.match(part('energy').detailed, /Without a birth time there are no houses/);
  assert.match(part('fits-together').detailed, /the ruler of your Sun sign/);
  for (const p of w.parts) for (const level of ['simple', 'detailed'] as const) assert.doesNotMatch(p[level], /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth) house/, `${p.id} names no house`);
  assert.ok(!w.parts.some((p) => p.links.some((l) => 'tab' in l && l.label.includes('houses'))));
});
