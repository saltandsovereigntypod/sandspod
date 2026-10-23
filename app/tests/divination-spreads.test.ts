import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  blankCustomSpread,
  customSpread,
  customSpreadId,
  customSpreads,
  entryIdOfSpread,
  MAX_PLACES,
  normalizeCustomSpread,
  tidyCustomSpread,
} from '../src/lib/divination/custom.ts';
import {
  cameUpText,
  drawOfReading,
  drawSpread,
  fallPosition,
  groupedSpreads,
  GROUPS,
  layoutOfDraw,
  placeOf,
  readingFromDraw,
  spreadById,
  SPREADS,
  spreadsFor,
  type Spread,
} from '../src/lib/divination/draw.ts';
import { diagramOf, diagramSvg, halfBox, isSimpleRow, layoutOf, overlaps, SHAPES, type Laid } from '../src/lib/divination/layout.ts';
import { keepsSouthernWheel, SEASONAL_LABELS, seasonalSpreads } from '../src/lib/divination/seasonal.ts';

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Every place lies inside the whole, and none touches another unless the layout says they cross. */
function assertSound(l: Laid, what: string) {
  const eps = 1e-6;
  for (const [i, s] of l.slots.entries()) {
    const { hw, hh } = halfBox(l.item, s.rot);
    assert.ok(s.cx - hw >= -eps && s.cx + hw <= l.width + eps, `${what}: place ${i + 1} runs off the side`);
    assert.ok(s.cy - hh >= -eps && s.cy + hh <= l.height + eps, `${what}: place ${i + 1} runs off the top or bottom`);
  }
  for (let i = 0; i < l.slots.length; i++) {
    for (let j = i + 1; j < l.slots.length; j++) {
      const crossing = l.crossings.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
      const a = { x: l.slots[i].cx, y: l.slots[i].cy, rot: l.slots[i].rot };
      const b = { x: l.slots[j].cx, y: l.slots[j].cy, rot: l.slots[j].rot };
      if (crossing) assert.ok(overlaps(l.item, a, b, 0), `${what}: ${i + 1} and ${j + 1} should cross`);
      else assert.ok(!overlaps(l.item, a, b, 0.01), `${what}: ${i + 1} and ${j + 1} overlap`);
    }
  }
}

test('every spread has the places its layout lays out, named, with a line on what it is for', () => {
  assert.equal(new Set(SPREADS.map((s) => s.id)).size, SPREADS.length);
  assert.equal(new Set(SPREADS.map((s) => `${s.kind}|${s.label}`)).size, SPREADS.length, 'labels identify kept readings, so no two may match');
  for (const s of SPREADS) {
    assert.ok(s.detail.length > 10 && !s.detail.includes('!'), s.id);
    assert.ok(GROUPS.some((g) => g.id === s.group) && s.group !== 'yours', s.id);
    const l = layoutOf(s);
    assert.equal(l.slots.length, s.positions.length, s.id);
    for (const p of s.positions) assert.ok(p.name && p.about && !p.about.includes('!'), `${s.id}: ${p.name}`);
    assert.equal(new Set(s.positions.map((p) => p.name)).size, s.positions.length, `${s.id}: place names repeat`);
    if (s.variant) assert.equal(spreadById(s.variant.id)?.hidden, true, s.id);
  }
});

test('the asked-for spreads are all there', () => {
  const want = {
    tarot: ['daily', 'past-present-future', 'situation-action-outcome', 'celtic-cross', 'mind-body-spirit', 'you-them', 'two-paths', 'five-card-cross', 'horseshoe', 'elemental', 'new-moon', 'full-moon', 'shadow-work', 'tree-of-life', 'astro-wheel', 'year-ahead', 'samhain'],
    runes: ['one-rune', 'three-runes', 'five-rune-cross', 'nine-rune-cast', 'nine-worlds'],
    ogham: ['one-stave', 'three-staves', 'five-staves'],
  } as const;
  for (const [kind, ids] of Object.entries(want)) {
    const have = spreadsFor(kind as Spread['kind']).map((s) => s.id);
    for (const id of ids) assert.ok(have.includes(id), `${kind}: ${id}`);
  }
  const sizes: Record<string, number> = { horseshoe: 7, 'tree-of-life': 10, 'astro-wheel': 12, 'astro-wheel-centre': 13, 'year-ahead': 13, 'shadow-work': 5, elemental: 5, 'five-staves': 5, 'nine-rune-cast': 9 };
  for (const [id, n] of Object.entries(sizes)) assert.equal(spreadById(id)?.positions.length, n, id);
  const paths = spreadById('two-paths')!.positions.length;
  assert.ok(paths >= 5 && paths <= 7);
  assert.match(spreadById('nine-worlds')!.detail, /modern/i);
  assert.ok(!spreadsFor('tarot').some((s) => s.id === 'astro-wheel-centre'), 'the centre card is a choice on the wheel, not its own entry');
});

test('every built-in layout stays in bounds without overlaps, except the Celtic Cross’s crossing card', () => {
  for (const s of SPREADS) assertSound(layoutOf(s), s.id);
  const cross = layoutOf(spreadById('celtic-cross')!);
  assert.deepEqual(cross.crossings, [[0, 1]]);
  assert.equal(cross.slots[1].rot, 90, 'the crossing card lies sideways');
  assert.equal(cross.slots[0].cx, cross.slots[1].cx);
  assert.equal(cross.slots[0].cy, cross.slots[1].cy);
  for (const s of SPREADS.filter((x) => x.id !== 'celtic-cross')) assert.deepEqual(layoutOf(s).crossings, [], s.id);
});

test('layouts have the shapes they promise', () => {
  const at = (id: string) => layoutOf(spreadById(id)!).slots;
  // The horseshoe: ends high, the middle lowest, the arms leaning.
  const h = at('horseshoe');
  assert.ok(h[3].cy > h[0].cy && h[3].cy > h[6].cy);
  assert.ok(h[0].rot < 0 && h[6].rot > 0 && h[3].rot === 0);
  // The wheel and the year: twelve round a circle, the same distance out; the year's theme in the middle.
  for (const id of ['astro-wheel', 'year-ahead']) {
    const l = layoutOf(spreadById(id)!);
    const mid = { x: l.width / 2, y: l.height / 2 };
    const radii = l.slots.slice(0, 12).map((s) => Math.hypot(s.cx - mid.x, s.cy - mid.y));
    for (const r of radii) assert.ok(Math.abs(r - radii[0]) < 0.01, id);
  }
  const year = at('year-ahead');
  assert.ok(year[0].cy < year[6].cy, 'the first month at the top');
  const wheel = at('astro-wheel');
  assert.ok(wheel[0].cx < wheel[6].cx, 'the first house on the left, the seventh on the right');
  // The Tree of Life: the Crown at the top, the Kingdom at the foot, Wisdom on the right of Understanding.
  const tree = at('tree-of-life');
  assert.ok(tree[0].cy < tree[9].cy && tree.every((s) => s.cy >= tree[0].cy && s.cy <= tree[9].cy));
  assert.ok(tree[1].cx > tree[2].cx);
  // Two paths fork from where you stand at the foot.
  const paths = at('two-paths');
  assert.ok(paths.slice(1).every((s) => s.cy < paths[0].cy));
  assert.ok(paths[3].cx < paths[0].cx && paths[6].cx > paths[0].cx);
  // Elemental: earth above, fire below, spirit in the middle.
  const el = at('elemental');
  assert.ok(el[0].cy < el[4].cy && el[2].cy > el[4].cy && el[1].cx > el[4].cx && el[3].cx < el[4].cx);
  // Five staves: north and south lie across.
  const staves = at('five-staves');
  assert.equal(staves[0].rot, 90);
  assert.equal(staves[2].rot, 90);
  // Short rows keep their names beneath.
  assert.ok(isSimpleRow(layoutOf(spreadById('past-present-future')!)));
  assert.ok(!isSimpleRow(layoutOf(spreadById('you-them')!)));
  assert.ok(!isSimpleRow(layoutOf(spreadById('celtic-cross')!)));
});

test('the nine-rune cast: each rune falls in a ring, face up or down, laid out without overlaps and read back the same', () => {
  const spread = spreadById('nine-rune-cast')!;
  for (let seed = 1; seed <= 60; seed++) {
    const draw = drawSpread(spread, { reversals: true, blankRune: true }, seeded(seed));
    assert.equal(draw.items.length, 9);
    assert.ok(draw.items.every((i) => i.fall && !i.reversed));
    const l = layoutOfDraw(spread, draw);
    assertSound(l, `cast ${seed}`);
    assert.ok(l.cloth && l.cloth.rings.length === 3);
    // Each rune lies within its own ring.
    const edges = [0, ...l.cloth!.rings];
    for (const [i, item] of draw.items.entries()) {
      const r = Math.hypot(l.slots[i].cx - l.cloth!.cx, l.slots[i].cy - l.cloth!.cy);
      const k = ['centre', 'middle', 'edge'].indexOf(item.fall!.ring);
      assert.ok(r >= edges[k] - 0.01 && r <= edges[k + 1], `cast ${seed}: rune ${i + 1} out of its ring`);
    }
    // The same cast lies the same way twice.
    assert.deepEqual(layoutOfDraw(spread, draw), l);
    // Kept, and opened again.
    const reading = readingFromDraw(spread, draw, { now: new Date(2026, 9, 23) });
    assert.equal(reading.drawn.length, 9);
    const lines = reading.cameUp.split('\n');
    assert.ok(lines[1].startsWith(`${fallPosition(draw.items[0].fall!).name}: ${draw.items[0].name}`));
    const back = drawOfReading(reading);
    assert.equal(back?.spread.id, 'nine-rune-cast');
    assert.deepEqual(back?.draw.items, draw.items);
    assert.deepEqual(layoutOfDraw(spread, back!.draw), l);
    assert.equal(placeOf(spread, draw, 0)?.name, fallPosition(draw.items[0].fall!).name);
  }
  assert.match(fallPosition({ ring: 'edge', up: false }).about, /hidden/);
});

test('kept readings of the new spreads lay out again, and old ones still do', () => {
  for (const s of SPREADS) {
    const draw = drawSpread(s, { reversals: true, blankRune: false }, seeded(s.positions.length * 7));
    const reading = readingFromDraw(s, draw, { now: new Date(2026, 9, 23) });
    assert.equal(reading.cameUp.split('\n')[0], s.label);
    const back = drawOfReading(reading);
    assert.equal(back?.spread.id, s.id, s.id);
    assert.deepEqual(back?.draw.items, draw.items, s.id);
  }
  // A Celtic Cross kept before this change, in its old words.
  const old = {
    method: 'tarot' as const,
    drawn: ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit'],
    cameUp: 'Celtic Cross\nThe heart of it: The Fool (x)\nWhat crosses it: The Magician, reversed (y)',
  };
  const back = drawOfReading(old);
  assert.equal(back?.spread.id, 'celtic-cross');
  assert.equal(back?.draw.items[1].reversed, true);
});

test('custom shapes lay out cleanly for every size', () => {
  for (const kind of ['tarot', 'runes', 'ogham'] as const) {
    for (const { id: shape } of SHAPES) {
      for (let n = 1; n <= MAX_PLACES; n++) {
        const s = customSpread({ id: 'x', data: { name: 'Test', kind, detail: '', shape, positions: Array.from({ length: n }, (_, i) => ({ name: `P${i}`, about: '' })) } });
        const l = layoutOf(s);
        assert.equal(l.slots.length, n);
        assertSound(l, `${kind} ${shape} ${n}`);
      }
    }
  }
});

test('a spread of your own: kept, read back, drawn, and found again from a kept reading', () => {
  const raw = {
    name: '  Crossroads  ',
    kind: 'runes',
    detail: 'For when the way splits.',
    shape: 'arc',
    positions: [{ name: 'Behind me', about: 'Where I came from' }, { name: '' }, { name: 'Ahead', about: '' }],
  };
  const data = normalizeCustomSpread(JSON.parse(JSON.stringify(tidyCustomSpread(normalizeCustomSpread(raw)))));
  assert.deepEqual(data, {
    name: 'Crossroads',
    kind: 'runes',
    detail: 'For when the way splits.',
    shape: 'arc',
    positions: [
      { name: 'Behind me', about: 'Where I came from' },
      { name: 'Rune 2', about: '' },
      { name: 'Ahead', about: '' },
    ],
  });
  // Odd things saved elsewhere come back whole.
  const odd = normalizeCustomSpread({ kind: 'tea', shape: 'spiral', positions: 'no' });
  assert.equal(odd.kind, 'tarot');
  assert.equal(odd.shape, 'line');
  assert.equal(odd.positions.length, 1);
  assert.equal(normalizeCustomSpread({ positions: Array.from({ length: 40 }, () => ({ name: 'x' })) }).positions.length, MAX_PLACES);
  assert.equal(blankCustomSpread().positions.length, 3);

  const mine = customSpreads([
    { id: 'b2', data: raw },
    { id: 'a1', data: { name: 'Another', kind: 'tarot', shape: 'circle', positions: [{ name: 'One' }] } },
  ]);
  assert.deepEqual(
    mine.map((s) => s.label),
    ['Another', 'Crossroads'],
  );
  const spread = mine[1];
  assert.equal(spread.id, customSpreadId('b2'));
  assert.equal(entryIdOfSpread(spread.id), 'b2');
  assert.equal(entryIdOfSpread('celtic-cross'), null);
  assert.equal(spread.group, 'yours');
  assert.equal(spreadById(spread.id, mine), spread);
  assert.ok(spreadsFor('runes', mine).includes(spread));
  assert.deepEqual(groupedSpreads('runes', mine).at(-1)?.spreads, [spread]);
  assert.equal(groupedSpreads('runes').at(-1)?.group.id === 'yours', false);

  const draw = drawSpread(spread, { reversals: false, blankRune: false }, seeded(3));
  const reading = readingFromDraw(spread, draw, { now: new Date(2026, 9, 23) });
  assert.match(cameUpText(spread, draw), /^Crossroads\nBehind me: /);
  assert.equal(drawOfReading(reading), null, 'without your spreads it cannot be laid out');
  assert.equal(drawOfReading(reading, mine)?.spread.id, spread.id);
});

test('pictures of each spread fit their box', () => {
  for (const s of SPREADS) {
    const dg = diagramOf(layoutOf(s));
    assert.equal(dg.rects.length, s.positions.length);
    for (const r of dg.rects) assert.ok(r.cx > 0 && r.cx < 1 && r.cy > 0 && r.cy < 1, s.id);
    const svg = diagramSvg(dg, 64);
    assert.match(svg, /^<svg /);
    assert.equal((svg.match(/<rect /g) ?? []).length, s.positions.length);
  }
  assert.match(diagramSvg(diagramOf(layoutOf(spreadById('nine-rune-cast')!))), /<circle /);
});

test('spreads for the time: the new and full moon, and Samhain', () => {
  for (const [id, label] of Object.entries(SEASONAL_LABELS)) assert.equal(spreadById(id)?.label, label);
  // 2026: new moon 9 November, full moon 24 November (UTC); Samhain 31 October.
  const near = (d: Date) => seasonalSpreads(d).map((s) => s.spread);
  assert.ok(near(new Date(Date.UTC(2026, 10, 9, 12))).includes('new-moon'));
  assert.ok(near(new Date(Date.UTC(2026, 10, 24, 12))).includes('full-moon'));
  assert.deepEqual(near(new Date(Date.UTC(2026, 10, 16, 12))), []);
  assert.ok(near(new Date(2026, 9, 28, 12)).includes('samhain'));
  assert.equal(seasonalSpreads(new Date(2026, 9, 31, 12)).find((s) => s.spread === 'samhain')?.why, 'It’s Samhain');
  assert.ok(!near(new Date(2026, 9, 10, 12)).includes('samhain'));
  // Turned for the south: Samhain at the end of April.
  assert.ok(seasonalSpreads(new Date(2026, 3, 28, 12), { south: true }).some((s) => s.spread === 'samhain'));
  assert.ok(!seasonalSpreads(new Date(2026, 9, 31, 12), { south: true }).some((s) => s.spread === 'samhain'));
  assert.equal(keepsSouthernWheel({ calendar_traditions: 'wheel_south,celtic' }), true);
  assert.equal(keepsSouthernWheel({ calendar_traditions: 'wheel,wheel_south' }), false);
  assert.equal(keepsSouthernWheel(null), false);
});
