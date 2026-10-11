import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  APOTHECARY_TYPES,
  apothecaryObject,
  apothecaryPractice,
  apothecaryProblem,
  apothecaryRow,
  ingredientFromObject,
  normalizeApothecary,
  refreshPlaced,
} from '../src/lib/altar/apothecary.ts';
import { apothecaryStateOf, setApothecaryState } from '../src/lib/altar/livingState.ts';
import { customForms, customItemProblem, customItemRow, formId, parseKeywords, storagePathFromUrl, uploadPath } from '../src/lib/altar/custom.ts';

const now = '2026-10-11T20:00:00.000Z';

test('custom items save the forms and row the website writes', () => {
  const forms = customForms(
    'herbs',
    [
      { label: 'Powder', image: 'https://x/powder.png', storagePath: 'u/custom-cabinet-items/a.png' },
      { label: 'Loose', image: 'https://x/loose.png' },
      { label: 'Bundle', image: '' },
    ],
    'ent-1',
  );
  assert.deepEqual(forms.map((f) => f.form), ['loose', 'powder'], 'preset order, pictures only');
  assert.equal(forms[0].type, 'herb');
  assert.equal(formId('Chime / Spell Candle'), 'chime-/-spell-candle');
  const row = customItemRow('u', { category: 'herbs', name: ' My Mugwort ', keywords: parseKeywords('dreams, , moon'), entityId: 'ent-1', forms, libraryMode: 'new' }, now);
  assert.equal(row.name, 'My Mugwort');
  assert.deepEqual(row.keywords, ['dreams', 'moon']);
  assert.equal(row.item_type, 'herb');
  assert.equal(row.form_label, 'loose');
  assert.deepEqual(row.storage_paths, ['u/custom-cabinet-items/a.png']);
  assert.deepEqual(row.metadata, { libraryMode: 'new', multiForm: true });
  assert.equal(customItemProblem({ name: 'x', entityId: 'e', forms: [] }), 'Choose at least one form and add a picture.');
  assert.equal(uploadPath('u', 'id', 'image/webp'), 'u/custom-cabinet-items/id.webp');
  assert.equal(storagePathFromUrl('https://p.supabase.co/storage/v1/object/public/user-assets/u/custom-cabinet-items/a.png'), 'u/custom-cabinet-items/a.png');
});

test('apothecary items read website rows and write them back the same way', () => {
  const item = normalizeApothecary({
    id: 'a1',
    name: 'Protection Jar',
    type: 'spell-jar',
    image_url: null,
    ingredients: JSON.stringify([{ label: 'Rosemary', amount: '1 pinch' }, 'Salt']),
    living_state: { tending_enabled: true, tending_interval_days: 14 },
    details: {},
  });
  assert.equal(item.typeLabel, 'Spell Jar');
  assert.equal(item.imagePath, APOTHECARY_TYPES[0].image);
  assert.deepEqual(item.ingredients.map((i) => i.label), ['Rosemary', 'Salt']);
  assert.equal(item.livingState.tending_interval_days, 14);
  const row = apothecaryRow('u', item, now);
  assert.equal(row.type_label, 'Spell Jar');
  assert.deepEqual(row.metadata, { source: 'altar-apothecary' });
  assert.equal(apothecaryProblem({ name: 'x', ingredients: [] }), 'Add at least one ingredient.');
  assert.deepEqual(apothecaryPractice(item).Ingredients, ['Rosemary (1 pinch)', 'Salt']);
});

test('placing a working carries its recipe and starts its tending date', () => {
  const item = normalizeApothecary({ id: 'a1', name: 'Dream Oil', type: 'oil-tincture', intention: 'Dreams', ingredients: [{ label: 'Mugwort' }], living_state: { tending_enabled: true, tending_interval_days: 7, expiration_enabled: true, expiration_days: 180 } });
  const object = apothecaryObject(item, [], now);
  assert.equal(object.type, 'apothecary');
  assert.equal(object.form, 'oil-tincture');
  assert.equal(object.apothecaryItemId, 'a1');
  assert.equal(object.apothecaryType, 'Oil / Tincture');
  assert.deepEqual(JSON.parse(object.apothecaryIngredients!), [{ label: 'Mugwort', amount: '' }]);
  const state = apothecaryStateOf(object);
  assert.equal(state.nextTendingAt, '2026-10-18T20:00:00.000Z');
  assert.equal(state.reviewAt.slice(0, 10), '2027-04-09');
  const tended = setApothecaryState(object, { remainingAmount: 'Half', nextTendingAt: '' }, now);
  assert.equal(apothecaryStateOf(tended).remainingAmount, 'Half');
  assert.equal(apothecaryStateOf(tended).reviewAt, state.reviewAt);
  const renamed = refreshPlaced(tended, { ...item, name: 'Dream Oil II' });
  assert.equal(renamed.label, 'Dream Oil II');
  assert.equal(apothecaryStateOf(renamed).remainingAmount, 'Half', 'its own state is kept');
  assert.equal(ingredientFromObject({ label: 'Lavender Loose', type: 'herb', herb: 'lavender', form: 'loose' }).herb, 'lavender');
});

test('a working made from altar things takes their place, and its copies follow the recipe', async () => {
  const { placeApothecary, refreshApothecary, removeApothecary, replaceWithApothecary } = await import('../src/lib/altar/editor.ts');
  const { builtInCabinet, objectFromForm } = await import('../src/lib/altar/cabinet.ts');
  const herb = builtInCabinet.find((i) => i.id === 'herbs:rosemary')!;
  const candle = builtInCabinet.find((i) => i.id === 'candles:white-candle')!;
  const a = objectFromForm(herb, herb.forms[1], [], now, {}, { cx: 0.3, cy: 0.6 });
  const b = objectFromForm(candle, candle.forms[4], [a], now, {}, { cx: 0.5, cy: 0.6 });
  const c = objectFromForm(herb, herb.forms[0], [a, b], now, {}, { cx: 0.7, cy: 0.6 });
  const doc = { background: '', backgroundName: '', groups: [], activeGroupId: null, objects: [a, b, c], extra: {} };
  const item = normalizeApothecary({ id: 'j1', name: 'Protection Jar', type: 'spell-jar', ingredients: [{ label: 'Rosemary' }] });
  const replaced = replaceWithApothecary(doc, [0, 2], item, now);
  assert.equal(replaced.objects.length, 2);
  assert.equal(replaced.objects[0].label, b.label, 'the untouched candle stays');
  assert.equal(replaced.objects[1].apothecaryItemId, 'j1');
  const placedTwice = placeApothecary(replaced, item, now);
  const renamed = refreshApothecary(placedTwice, { ...item, name: 'House Jar' });
  assert.deepEqual(renamed.objects.filter((o) => o.apothecaryItemId === 'j1').map((o) => o.label), ['House Jar', 'House Jar']);
  assert.equal(removeApothecary(renamed, 'j1').objects.length, 1);
});
