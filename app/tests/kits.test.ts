import assert from 'node:assert/strict';
import { test } from 'node:test';

import { spreadById } from '../src/lib/divination/draw.ts';
import { kitAltar, kitFor, kitTonight, MOON_KIT_REFS, SABBAT_KIT_REFS } from '../src/lib/rituals/kits.ts';

test('every moon phase and every sabbat has a whole kit', () => {
  assert.equal(MOON_KIT_REFS.length, 9);
  assert.equal(SABBAT_KIT_REFS.length, 8);
  for (const ref of [...MOON_KIT_REFS, ...SABBAT_KIT_REFS]) {
    const kit = kitFor(ref);
    assert.ok(kit, ref);
    assert.ok(kit!.premade, `${ref} has a ritual`);
    assert.ok(spreadById(kit!.spread.id), `${ref} spread ${kit!.spread.id} exists`);
    assert.notEqual(kit!.spread.label, kit!.spread.id);
    assert.ok(kit!.prompt.endsWith('?') || kit!.prompt.endsWith('.'), ref);
    assert.ok(kit!.correspondences.herbs.length > 0 && kit!.correspondences.crystals.length > 0, ref);
  }
  assert.equal(kitFor('wheel-samhain')!.kind, 'sabbat');
  assert.equal(kitFor('wheel_south-samhain')!.ref, 'wheel-samhain');
  assert.equal(kitFor('hellenic-lenaia'), null);
});

test('tonight’s kit is the sabbat’s near its day, otherwise the moon’s', () => {
  assert.equal(kitTonight(new Date(2026, 9, 31, 20)).ref, 'wheel-samhain');
  assert.equal(kitTonight(new Date(2026, 10, 1, 20)).ref, 'wheel-samhain');
  const later = kitTonight(new Date(2026, 10, 10, 20));
  assert.equal(later.kind, 'moon');
});

test('a kit’s altar is set in one go, for the sabbat or the moon', () => {
  const date = new Date(2026, 9, 31, 20);
  const samhain = kitAltar(kitFor('wheel-samhain')!, date);
  assert.ok(samhain.doc.objects.length >= 8);
  assert.match(samhain.reason, /Samhain/);
  const full = kitAltar(kitFor('moon-full')!, new Date(2026, 10, 10, 20));
  assert.match(full.reason, /full moon/);
});
