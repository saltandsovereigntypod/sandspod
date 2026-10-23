import assert from 'node:assert/strict';
import { test } from 'node:test';

import { carveCandle, carvingMark, carvingsOf, uncarveCandle } from '../src/lib/altar/livingState.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { applyOps } from '../src/lib/grimoire/edits.ts';
import { sigilPageOps } from '../src/lib/grimoire/sigilOps.ts';
import type { GrimoireSnapshot } from '../src/lib/grimoire/types.ts';
import {
  ARRANGEMENTS,
  bounds,
  cellOf,
  cleanPath,
  digitalRoot,
  fitToBox,
  freehandPath,
  KAMEAS,
  LETTER_SHAPES,
  letterArrangements,
  letterNumber,
  letterValue,
  fitNumber,
  lettersOf,
  markOf,
  mergeStrokes,
  PLANETS,
  readSigil,
  reduceStatement,
  sigilDataUrl,
  sigilName,
  sigilSvg,
  simplify,
  suggestPlanet,
  traceKamea,
  type Sigil,
} from '../src/lib/sigil/index.ts';

// ── The letter method ─────────────────────────────────────────────────────

test('a statement loses its spaces, marks, accents and repeated letters, in order', () => {
  assert.equal(lettersOf('I am café-calm, 3 times!'), 'IAMCAFECALMTIMES');
  const r = reduceStatement('I sleep deeply');
  assert.equal(r.all, 'ISLEEPDEEPLY');
  assert.equal(r.kept, 'ISLEPDY');
  assert.equal(r.dropped, 'EEEPL');
});

test('vowels can be struck out too, but never every letter', () => {
  assert.equal(reduceStatement('I sleep deeply', true).kept, 'SLPDY');
  assert.equal(reduceStatement('Aeiou', true).kept, 'AEIOU');
  assert.equal(reduceStatement('').kept, '');
});

test('every letter A to Z has a shape on the 4 × 4 grid', () => {
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const shape = LETTER_SHAPES[ch];
    assert.ok(shape?.length, ch);
    for (const line of shape) for (const [x, y] of line) assert.ok(x >= -0.01 && x <= 4.01 && y >= -0.01 && y <= 4.01, `${ch} ${x},${y}`);
  }
});

test('lines letters share are drawn once', () => {
  const merged = mergeStrokes([...LETTER_SHAPES.E, ...LETTER_SHAPES.F]);
  const segments = merged.reduce((n, l) => n + l.length - 1, 0);
  // E has 4 straight pieces; F adds nothing new.
  assert.equal(segments, 4);
});

test('the arrangements are offered for the letters left, each fitted inside the circle', () => {
  const options = letterArrangements('SLPDY');
  assert.deepEqual(options.map((o) => o.id), ARRANGEMENTS.map((a) => a.id));
  for (const o of options) {
    assert.ok(cleanPath(o.d), o.id);
    const nums = o.d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    assert.ok(Math.min(...nums) >= 19.9 && Math.max(...nums) <= 80.1, o.id);
  }
  assert.equal(new Set(options.map((o) => o.d)).size, options.length);
  // The same letters always give the same sigils; another seed gives others.
  assert.deepEqual(letterArrangements('SLPDY'), options);
  assert.notDeepEqual(letterArrangements('SLPDY', 3).map((o) => o.d), options.map((o) => o.d));
  assert.deepEqual(letterArrangements(''), []);
});

test('fitting keeps the drawing’s shape and centres it', () => {
  const fitted = fitToBox([[[0, 0], [4, 2]]]);
  assert.deepEqual(bounds(fitted), { minX: 20, minY: 35, maxX: 80, maxY: 65 });
});

// ── The planetary squares ─────────────────────────────────────────────────

test('each planet’s square is a true magic square of 1 to n²', () => {
  assert.deepEqual(PLANETS.map((p) => p.size), [3, 4, 5, 6, 7, 8, 9]);
  for (const p of PLANETS) {
    const sq = KAMEAS[p.id];
    const n = p.size;
    const magic = (n * (n * n + 1)) / 2;
    assert.equal(sq.length, n, p.id);
    assert.deepEqual([...sq.flat()].sort((a, b) => a - b), Array.from({ length: n * n }, (_, i) => i + 1), p.id);
    for (let i = 0; i < n; i++) {
      assert.equal(sq[i].reduce((a, b) => a + b, 0), magic, `${p.id} row ${i}`);
      assert.equal(sq.reduce((a, row) => a + row[i], 0), magic, `${p.id} column ${i}`);
    }
    assert.equal(sq.reduce((a, row, i) => a + row[i], 0), magic, `${p.id} diagonal`);
    assert.equal(sq.reduce((a, row, i) => a + row[n - 1 - i], 0), magic, `${p.id} other diagonal`);
  }
});

test('letters take their Pythagorean numbers, and add up to a suggested planet', () => {
  assert.deepEqual([...'AIJRSZ'].map(letterValue), [1, 9, 1, 9, 1, 8]);
  assert.equal(letterValue('?'), 0);
  assert.equal(digitalRoot(38), 2);
  assert.equal(digitalRoot(9), 9);
  assert.equal(digitalRoot(0), 0);
  // L3 O6 V4 E5 = 18 → 9, Mars.
  assert.equal(suggestPlanet('LOVE'), 'mars');
  assert.equal(suggestPlanet(''), null);
  assert.equal(letterNumber('z'), 26);
  assert.equal(fitNumber(26, 4), 8);
  assert.equal(fitNumber(26, 5), 8);
  assert.equal(fitNumber(26, 6), 26);
  assert.equal(fitNumber(19, 3), 1);
});

test('the trace starts with a circle, goes number to number, and ends in a bar', () => {
  // On Saturn's square: S=1 (bottom middle), L=3 (middle left), P=7 (middle right).
  const trace = traceKamea('SLP', 'saturn')!;
  assert.deepEqual(trace.values, [1, 3, 7]);
  assert.deepEqual(trace.cells, [[2, 1], [1, 0], [1, 2]]);
  assert.deepEqual(cellOf(KAMEAS.saturn, 5), [1, 1]);
  assert.deepEqual(trace.points[0], [50, 70]);
  // A circle (two arcs), the line, then the bar.
  assert.equal((trace.d.match(/A/g) ?? []).length, 2);
  assert.equal((trace.d.match(/M/g) ?? []).length, 3);
  assert.ok(cleanPath(trace.d));
  // The bar crosses the last point, square to the last stroke (which runs left to right).
  const bar = trace.d.split('M').pop()!.trim();
  assert.match(bar, /^70 \d+(\.\d+)? L70 \d+/);
});

test('a number repeated in a row is visited once; a single number still makes a mark', () => {
  // On Saturn's square J (10) and S (19) both come down to 1, like A.
  assert.equal(traceKamea('AJS', 'saturn')!.cells.length, 1);
  // Mars's square has room for 10, so J is a square of its own there.
  assert.equal(traceKamea('AJ', 'mars')!.cells.length, 2);
  const one = traceKamea('A', 'moon')!;
  assert.equal(one.points.length, 1);
  assert.ok(cleanPath(one.d));
  assert.equal(traceKamea('', 'sun'), null);
});

// ── Saving ────────────────────────────────────────────────────────────────

const sigil = (patch: Partial<Sigil> = {}): Sigil => ({
  version: 1,
  method: 'letters',
  intent: 'I sleep deeply',
  letters: 'SLPDY',
  planet: null,
  d: 'M20 20 L80 80',
  weight: 2.6,
  ring: true,
  ...patch,
});

test('saved sigils are read back carefully; anything that could break a picture is refused', () => {
  assert.deepEqual(readSigil(sigil()), sigil());
  assert.equal(readSigil({ ...sigil(), d: 'M0 0"/><script>' }), null);
  assert.equal(readSigil({ d: '' }), null);
  assert.equal(readSigil(null), null);
  const odd = readSigil({ d: 'M1 1 L2 2', method: 'other', weight: 99, planet: 'pluto', letters: 'ab<C>', extra: 1 })!;
  assert.equal(odd.method, 'letters');
  assert.equal(odd.weight, 6);
  assert.equal(odd.planet, null);
  assert.equal(odd.letters, 'C');
  assert.ok(!('extra' in odd));
});

test('the picture is ink on aged paper, with a circle when asked', () => {
  const svg = sigilSvg(sigil());
  assert.match(svg, /<rect width="100" height="100" fill="url\(#p\)"\/>/);
  assert.match(svg, /<circle cx="50" cy="50" r="44"/);
  assert.match(svg, /<path d="M20 20 L80 80" fill="none" stroke="#2a1c12"/);
  assert.ok(!/rect/.test(sigilSvg(sigil({ ring: false }), { paper: false })));
  assert.ok(!/r="44"/.test(sigilSvg(sigil({ ring: false }))));
  const url = sigilDataUrl(sigil());
  assert.ok(url.startsWith('data:image/svg+xml;charset=utf-8,%3Csvg'));
  assert.ok(!/[<>"]/.test(url));
  assert.equal(decodeURIComponent(url.split(',').slice(1).join(',')), svg);
});

test('names come from the intent, cut at a word', () => {
  assert.equal(sigilName(sigil()), 'I sleep deeply');
  assert.equal(sigilName(sigil({ intent: 'My home is warm, safe and full of laughter all year round' })), 'My home is warm, safe and full of…');
  assert.equal(sigilName(sigil({ intent: ' ' })), 'Sigil of SLPDY');
});

test('hand-drawn strokes are scaled into the box and smoothed', () => {
  const d = freehandPath([[[0, 0], [100, 100], [200, 200]], [[50, 50]]], 200);
  assert.equal(d, 'M0 0 L100 100 M25 25 L25.3 25');
  assert.deepEqual(simplify([[0, 0], [1, 0.1], [2, 0], [3, 3]], 0.5), [[0, 0], [2, 0], [3, 3]]);
  assert.equal(freehandPath([], 300), '');
});

test('a sigil page: intent, the picture with the sigil in its metadata, how it was made, room for notes', () => {
  const snapshot: GrimoireSnapshot = { fetchedAt: '', books: [], sections: [], pages: [], blocks: [], links: [] };
  let n = 0;
  const { id, ops } = sigilPageOps(
    snapshot,
    { userId: 'u', now: '2026-10-23T00:00:00Z' },
    { sigil: sigil({ method: 'kamea', planet: 'venus', intent: 'Peace <here> & now' }), sectionId: 'missing', dateText: '23 October 2026' },
    () => `id${n++}`,
  );
  assert.equal(ops[0].table, 'grimoire_books');
  const page = ops[1];
  assert.equal(page.kind === 'insert' && page.row.page_type, 'sigil');
  assert.equal(page.kind === 'insert' && page.row.section_id, null);
  assert.equal(page.kind === 'insert' && page.row.title, 'Sigil: Peace <here> & now');
  const next = applyOps(snapshot, ops);
  const blocks = next.blocks.filter((b) => b.page_id === id);
  assert.deepEqual(blocks.map((b) => b.block_type), ['heading', 'quote', 'image', 'heading', 'correspondence', 'heading', 'text']);
  assert.equal(blocks[1].content, 'Peace &lt;here&gt; &amp; now');
  const image = blocks[2];
  const meta = image.metadata as Record<string, unknown>;
  assert.equal(image.content, meta.url);
  assert.ok(String(meta.url).startsWith('data:image/svg+xml'));
  assert.deepEqual(readSigil(meta.sigil)?.planet, 'venus');
  assert.equal(blocks[4].content, 'Method: A planetary square\nLetters: S L P D Y\nSquare: Venus, 7 × 7\nDay: Friday\nMade: 23 October 2026');
});

// ── On a candle ───────────────────────────────────────────────────────────

const candle = (): SavedObject => ({ id: 'c1', type: 'candle', label: 'White candle', imagePath: '', color: 'white' }) as unknown as SavedObject;

test('a sigil carved into a candle keeps its mark and its name; words still carve as before', () => {
  const mark = markOf(sigil())!;
  assert.deepEqual(mark, { d: 'M20 20 L80 80', ring: true });
  let c = carveCandle(candle(), 'I sleep deeply', '2026-10-23T00:00:00Z', mark);
  c = carveCandle(c, 'Rest', '2026-10-23T00:00:01Z');
  // The same sigil twice changes nothing, even under another name.
  assert.equal(carveCandle(c, 'Again', '2026-10-23T00:00:02Z', mark), c);
  const carvings = carvingsOf(c);
  assert.deepEqual(carvings.map((x) => x.text), ['I sleep deeply', 'Rest']);
  assert.deepEqual(carvingMark(carvings[0]), mark);
  assert.equal(carvingMark(carvings[1]), null);
  // A word the same as a sigil's name still carves.
  assert.equal(carvingsOf(carveCandle(c, 'I sleep deeply', '2026-10-23T00:00:03Z')).length, 3);
  // A bad mark carves nothing extra.
  assert.equal(carveCandle(c, '', '2026-10-23T00:00:04Z', { d: '<x>' }), c);
  assert.deepEqual(carvingsOf(uncarveCandle(c, '2026-10-23T00:00:05Z', 0)).map((x) => x.text), ['Rest']);
});
