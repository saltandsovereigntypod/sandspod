import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, countOnAltar, nudgedCenter, objectFromForm, PLACE_NUDGE } from '../src/lib/altar/cabinet.ts';
import { dressObjectWith } from '../src/lib/altar/editor.ts';
import { displayBox } from '../src/lib/altar/geometry.ts';
import { dressCandleWithAll, dressingsOf } from '../src/lib/altar/livingState.ts';
import { emptyDocument } from '../src/lib/altar/snapshot.ts';
import { chosenDressings, toggleName } from '../src/lib/altar/workings/dressing.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';

const NOW = '2026-10-28T20:00:00.000Z';
const item = (name: string) => builtInCabinet.find((i) => i.name === name)!;
const form = (name: string, f?: string) => {
  const it = item(name);
  return f ? it.forms.find((x) => x.form === f)! : it.forms[0];
};

test('the first thing goes in the middle; the next ones step aside instead of stacking', () => {
  const center = { cx: 0.5, cy: 0.5 };
  assert.deepEqual(nudgedCenter(center, []), center);
  const taken: { cx: number; cy: number }[] = [];
  for (let i = 0; i < 12; i += 1) {
    const next = nudgedCenter(center, taken);
    assert.ok(!taken.some((t) => Math.abs(t.cx - next.cx) < 1e-9 && Math.abs(t.cy - next.cy) < 1e-9), `place ${i} lands on top of another`);
    taken.push(next);
  }
  // The second is a short step right and down.
  assert.deepEqual(taken[1], { cx: 0.5 + PLACE_NUDGE.x, cy: 0.5 + PLACE_NUDGE.y });
});

test('nudging stays on the stage near its edge', () => {
  const corner = { cx: 0.93, cy: 0.91 };
  const next = nudgedCenter(corner, [corner]);
  assert.ok(next.cx <= 0.94 && next.cy <= 0.92);
  assert.notDeepEqual(next, corner);
});

test('placing the same thing twice from the cabinet sets down two, apart, and the count says so', () => {
  const rosemary = item('Rosemary');
  const sprig = rosemary.forms[0];
  let objects: SavedObject[] = [];
  for (let i = 0; i < 2; i += 1) {
    const center = nudgedCenter({ cx: 0.5, cy: 0.5 }, objects.map((o) => displayBox(o)));
    objects = [...objects, objectFromForm(rosemary, sprig, objects, NOW, {}, center)];
  }
  const [a, b] = objects.map((o) => displayBox(o));
  assert.ok(Math.abs(a.cx - b.cx) > 0.01 || Math.abs(a.cy - b.cy) > 0.01);
  assert.equal(countOnAltar(objects, objects[0].label ?? ''), 2);
  assert.equal(countOnAltar(objects, 'Something else'), 0);
});

test('dress from the altar: several ticked ingredients go on in one change', () => {
  const candle = objectFromForm(item('Pink Candle'), form('Pink Candle', 'taper'), [], NOW);
  const oils = builtInCabinet.flatMap((it) => it.forms.filter((f) => f.type === 'oil').map((f) => ({ it, f })));
  const loose = builtInCabinet.flatMap((it) => it.forms.filter((f) => f.type === 'herb' && f.form === 'loose').map((f) => ({ it, f })));
  assert.ok(oils.length && loose.length >= 2, 'the cabinet has oils and loose herbs');
  const doc = {
    ...emptyDocument(),
    objects: [candle, objectFromForm(oils[0].it, oils[0].f, [], NOW), objectFromForm(loose[0].it, loose[0].f, [], NOW), objectFromForm(loose[1].it, loose[1].f, [], NOW)],
  };
  const dressed = dressObjectWith(doc, 0, [1, 2, 3], NOW);
  assert.equal(dressingsOf(dressed.objects[0]).length, 3);
  // The ingredients stay on the altar as they were.
  assert.equal(dressed.objects[1], doc.objects[1]);
  // The same ones again add nothing; the candle itself is never its own dressing.
  assert.equal(dressObjectWith(dressed, 0, [1, 2, 0], NOW), dressed);
  assert.equal(dressingsOf(dressCandleWithAll(candle, [], NOW)).length, 0);
});

test('dress & anoint: several oils, your own blend and herbs together, without repeats', () => {
  const list = chosenDressings({ oils: ['Rose', 'Lavender'], typedOil: ' rose ', herbs: ['Rosemary'] }, 'draw', NOW);
  assert.deepEqual(
    list.map((d) => [d.type, d.label]),
    [
      ['oil', 'Rose oil'],
      ['oil', 'Lavender oil'],
      ['herb', 'Rosemary'],
    ],
  );
  assert.ok(list.every((d) => d.direction === 'draw'));
  assert.deepEqual(toggleName(['Rose'], 'rose'), []);
  assert.deepEqual(toggleName(['Rose'], 'Basil'), ['Rose', 'Basil']);
});
