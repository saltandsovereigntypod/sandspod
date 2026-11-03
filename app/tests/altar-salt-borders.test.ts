// Salt circles and salt rectangles: they can grow to frame the whole altar,
// are set down under what's already there, and are hollow (only the salt line
// is touched); and the crystal wand and selenite athame link to their stones.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { hitTest, isSaltBorder, onSaltLine, saltLineOf, saltLinePath, sizeLimitsOf, withSize } from '../src/lib/altar/geometry.ts';
import { layerOf } from '../src/lib/altar/layers.ts';
import { libraryLinksOf, SHELF_TOOLS } from '../src/lib/altar/shelf.ts';

const NOW = '2026-11-03T12:00:00.000Z';
const item = (name: string) => {
  const found = builtInCabinet.find((i) => i.name === name);
  assert.ok(found, `${name} is in the cabinet`);
  return found;
};

test('the cabinet has white and black salt circles and rectangles', () => {
  for (const name of ['Salt Circle', 'Black Salt Circle', 'Salt Rectangle', 'Black Salt Rectangle']) {
    const it = item(name);
    for (const form of it.forms) assert.ok(isSaltBorder({ type: form.type, tool: form.tool }), `${name} ${form.label}`);
  }
  assert.deepEqual(item('Salt Rectangle').forms.map((f) => f.form), ['square', 'altar']);
});

test('a salt border can grow past the altar; other things keep their limits', () => {
  const circle = item('Salt Circle');
  const placed = objectFromForm(circle, circle.forms[0], [], NOW);
  assert.ok(sizeLimitsOf(placed).max >= 1.5);
  assert.ok(Number(withSize(placed, 1.6).sizePercent) >= 1.5);
  assert.equal(sizeLimitsOf({ type: 'tool', tool: 'athame' }).max, sizeLimitsOf({ type: 'tool', tool: 'key' }).max);
  assert.ok(sizeLimitsOf({ type: 'tool', tool: 'athame' }).max < 0.5);
});

test('a salt border is set down under everything but the cloths', () => {
  const key = item('Key');
  const a = { ...objectFromForm(key, key.forms[0], [], NOW), zIndex: '12' };
  const b = { ...objectFromForm(key, key.forms[0], [a], NOW), zIndex: '14' };
  const rect = item('Black Salt Rectangle');
  const salt = objectFromForm(rect, rect.forms[1], [a, b], NOW);
  assert.equal(layerOf(salt), 11);
});

test('a salt border is hollow: a tap inside goes to what lies within', () => {
  const rect = item('Salt Rectangle');
  const salt = { ...objectFromForm(rect, rect.forms[0], [], NOW, {}, { cx: 0.5, cy: 0.5 }), zIndex: '5' };
  const key = item('Key');
  const inside = { ...objectFromForm(key, key.forms[0], [], NOW, {}, { cx: 0.5, cy: 0.5 }), zIndex: '20' };
  const stageWidth = 900;
  const order = [{ index: 0, object: salt }, { index: 1, object: inside }];
  // The very middle: the key.
  assert.equal(hitTest(order, 450, 253, stageWidth)?.index, 1);
  // Inside the salt but away from the key: nothing.
  const onlySalt = [{ index: 0, object: salt }];
  assert.equal(hitTest(onlySalt, 450 + 60, 253, stageWidth), null);
  // On the line itself: the salt.
  const line = saltLineOf(salt)!;
  assert.equal(line.kind, 'rect');
  if (line.kind !== 'rect') throw new Error('rect');
  // Seen in perspective: the near line (bottom) is the full width, the far line (top) is narrower.
  const w = 200;
  const h = w * line.ratio;
  const nearY = h / 2 - line.insetY * w * (line.ratio / line.flat);
  assert.ok(onSaltLine(line, w / 2 - line.inset * w, h / 2 - 1, w));
  assert.ok(onSaltLine(line, 0, nearY, w));
  assert.equal(line.taper, line.flat === 1 ? 0.68 : 0.6, 'far edge: 0.60 of the near edge altar-wide, 0.68 square');
  assert.ok(onSaltLine(line, (w / 2 - line.inset * w) * line.taper, -h / 2 + 1, w));
  assert.ok(!onSaltLine(line, w / 2 - line.inset * w, -h / 2 + 1, w), 'the far corner is drawn in');
  assert.ok(!onSaltLine(line, 0, 0, w));
  assert.match(saltLinePath(line), /^M.*Z.*M.*Z$/);
});

test('the circle is hollow too', () => {
  const line = saltLineOf({ type: 'tool', tool: 'black-salt-circle', form: 'pile' })!;
  assert.equal(line.kind, 'ellipse');
  const w = 1000;
  const h = w * line.ratio;
  const cx = (line.kind === 'ellipse' ? line.cx - 0.5 : 0) * w;
  const cy = (line.kind === 'ellipse' ? line.cy - 0.5 : 0) * h;
  assert.ok(!onSaltLine(line, cx, cy, w));
  if (line.kind === 'ellipse') assert.ok(onSaltLine(line, cx + line.rx * w, cy, w));
});

test('the crystal wand and selenite athame link to their Living Library pages', () => {
  const wand = SHELF_TOOLS.find((o) => o.id === 'crystal-wand');
  assert.equal(wand?.name, 'Labradorite & Aspen Crystal Wand');
  for (const word of ['aspen', 'copper', 'labradorite', 'black tourmaline', 'clear quartz', 'triple moon']) assert.match(wand!.description.toLowerCase(), new RegExp(word));
  assert.deepEqual(
    libraryLinksOf({ type: 'tool', tool: 'crystal-wand', form: 'standard' }).map((l) => l.entity),
    ['traditional:tool:wand', 'traditional:crystal:labradorite', 'traditional:crystal:black_tourmaline', 'traditional:crystal:clear_quartz'],
  );
  assert.ok(libraryLinksOf({ type: 'tool', tool: 'selenite-athame', form: 'standard' }).some((l) => l.entity === 'traditional:crystal:selenite'));
  assert.ok(libraryLinksOf({ type: 'tool', tool: 'black-salt-rectangle', form: 'square' }).some((l) => l.entity === 'traditional:tool:black_salt'));
  assert.ok(item('Selenite Athame') && item('Labradorite & Aspen Crystal Wand'));
});
