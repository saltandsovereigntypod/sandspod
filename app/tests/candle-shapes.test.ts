import assert from 'node:assert/strict';
import { test } from 'node:test';

import { candleShape, FIGURE_FORMS, halfAt } from '../src/lib/altar/wax.ts';

// Every candle form a picture is painted for, and how it burns down.
const FORMS: Record<string, string> = {
  vigil: 'cap', taper: 'cap', 'chime-spell': 'cap', pillar: 'cap', 'seven-knob': 'cap', 'beeswax-rolled': 'cap', birthday: 'cap',
  'double-action': 'crop', reversible: 'crop',
  figure: 'crop', 'figure-male': 'crop', 'figure-female': 'crop', 'figure-couple': 'crop',
  novena: 'glass', jar: 'glass',
};

test('every painted candle form has a shape, and the small cups have none', () => {
  for (const [form, mode] of Object.entries(FORMS)) assert.equal(candleShape(form)?.mode, mode, form);
  for (const form of ['tea-light', 'votive', 'floating']) assert.equal(candleShape(form), null, form);
});

test('figures carry their outline; cylinders do not', () => {
  for (const form of Object.keys(FORMS)) {
    const s = candleShape(form)!;
    assert.equal(!!s.outline, FIGURE_FORMS.has(form), form);
    if (s.outline) {
      assert.equal(s.outline.length, 41, form);
      for (const [l, r] of s.outline) assert.ok(l <= r && l >= -0.5 && r <= 0.5, form);
    }
  }
});

test("a figure's melted top spans its head, not a cylinder wider than it", () => {
  for (const form of ['figure', 'figure-male', 'figure-female']) {
    const s = candleShape(form)!;
    const head = halfAt(s, s.top);
    const shoulders = halfAt(s, 0.3);
    assert.ok(head < s.half * 0.8, `${form} head ${head} vs body ${s.half}`);
    assert.ok(shoulders > head, `${form} shoulders wider than head`);
  }
});

test('the couple stays on the head the wick is in', () => {
  const s = candleShape('figure-couple')!;
  // Off-centre wick: never wider than its distance to the nearer edge.
  const wick = -0.08;
  const i = Math.round(0.2 * 40);
  const [l, r] = s.outline![i];
  assert.ok(halfAt(s, 0.2, wick) <= Math.max(wick - l, r - wick) + 1e-9);
});

test('cylinders keep their measured width at every height', () => {
  for (const form of Object.keys(FORMS).filter((f) => !FIGURE_FORMS.has(f))) {
    const s = candleShape(form)!;
    assert.equal(halfAt(s, s.top), s.half, form);
    assert.equal(halfAt(s, 0.7), s.half, form);
  }
});
