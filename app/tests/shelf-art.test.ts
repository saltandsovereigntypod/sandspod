import assert from 'node:assert/strict';
import { test } from 'node:test';

import { apothecaryLabel, apothecaryObject, apothecaryVessel, normalizeApothecary, refreshPlaced, withApothecaryLabel } from '../src/lib/altar/apothecary.ts';
import { cleanVesselLabel, containedRect, labelFontSize, labelText, VESSELS, vesselForApothecary, vesselForShelf } from '../src/lib/altar/vesselLabel.ts';
import { layoutShelf, SHELF_ART, shelfArtFor, shelfThing, toView, viewOf } from '../src/lib/shelves/art.ts';
import { cleanItem, newItem } from '../src/lib/shelves/model.ts';

test('each shelf has its painted furniture, measured', () => {
  assert.equal(shelfArtFor('crystals').key, 'crystal');
  assert.equal(shelfArtFor('herbs').key, 'herb');
  assert.equal(shelfArtFor('jars').key, 'herb');
  assert.equal(shelfArtFor('oils').key, 'oil');
  assert.equal(shelfArtFor('candles').key, 'candle');
  assert.equal(shelfArtFor('books').key, 'book');
  assert.equal(shelfArtFor('decks').key, 'book');
  for (const s of ['statues', 'tools', 'other', 'nonsense']) assert.equal(shelfArtFor(s).key, 'wall');
  for (const a of Object.values(SHELF_ART)) {
    assert.ok(a.left < a.right && a.left > 0 && a.right < 1, `${a.key} bounds`);
    assert.ok(a.crop[0] < a.left && a.crop[1] > a.right, `${a.key} crop shows the uprights`);
    assert.ok(a.top < a.planks[0], `${a.key} opening above the first plank`);
    a.planks.forEach((y, i) => assert.ok(y > (i ? a.planks[i - 1] + 0.14 : 0) && y <= 1, `${a.key} plank ${i}`));
    assert.match(a.image, /^\.\.\/assets\/altar\/shelves\/[a-z]+-shelf\.png$/);
  }
});

test('which container each thing is kept in', () => {
  assert.equal(vesselForShelf('herbs', 'Rosemary'), 'jar');
  assert.equal(vesselForShelf('oils', 'Lavender oil'), 'dropper');
  assert.equal(vesselForShelf('oils', 'Moon water'), 'bottle');
  assert.equal(vesselForShelf('oils', 'Florida Water'), 'bottle');
  assert.equal(vesselForShelf('decks', 'Rider–Waite'), 'deck');
  assert.equal(vesselForShelf('books', 'Herbal'), 'book');
  for (const s of ['crystals', 'candles', 'statues', 'tools', 'jars', 'other']) assert.equal(vesselForShelf(s, 'Anything'), null);
  assert.equal(vesselForApothecary('herb-mix', 'Protection blend'), 'jar');
  assert.equal(vesselForApothecary('tending-blend', 'Feed'), 'jar');
  assert.equal(vesselForApothecary('oil-tincture', 'Dream oil'), 'dropper');
  assert.equal(vesselForApothecary('oil-tincture', 'Rose water'), 'bottle');
  assert.equal(vesselForApothecary('spell-jar', 'Sweetening jar'), null);
  assert.equal(vesselForApothecary('spray', 'Moon water spray'), null);
  assert.equal(vesselForApothecary('poppet', 'Me'), null);
  assert.equal(shelfThing({ shelf: 'books', name: 'x' }).vessel, 'book');
  assert.equal(shelfThing({ shelf: 'crystals', name: 'x' }).vessel, null);
});

test('labels say the name unless you write your own', () => {
  assert.equal(labelText('', 'Rosemary'), 'Rosemary');
  assert.equal(labelText('  ', 'Rosemary'), 'Rosemary');
  assert.equal(labelText('Ros. off. 2026', 'Rosemary'), 'Ros. off. 2026');
  assert.equal(labelText(undefined, 'x'.repeat(80)).length, 60);
  assert.equal(cleanVesselLabel(''), null);
  assert.equal(cleanVesselLabel('not json'), null);
  assert.deepEqual(cleanVesselLabel({}), { text: '', style: 'paper', font: 'ink' });
  assert.deepEqual(cleanVesselLabel('{"vessel":"jar","text":"Mugwort","style":"gold","font":"hand"}'), { vessel: 'jar', text: 'Mugwort', style: 'gold', font: 'hand' });
  assert.deepEqual(cleanVesselLabel({ vessel: 'urn', style: 'neon', font: 'comic' }), { text: '', style: 'paper', font: 'ink' });

  const fresh = newItem({ name: 'Rosemary', shelf: 'herbs' });
  assert.equal(fresh.label, '');
  assert.equal(fresh.labelStyle, 'paper');
  assert.equal(fresh.labelFont, 'ink');
  const kept = cleanItem({ name: 'Rosemary', shelf: 'herbs', label: 'Rosmarinus', labelStyle: 'kraft', labelFont: 'script' });
  assert.deepEqual([kept.label, kept.labelStyle, kept.labelFont], ['Rosmarinus', 'kraft', 'script']);
  assert.deepEqual([cleanItem({ name: 'x', labelStyle: 'pink' }).labelStyle, cleanItem({ name: 'x', labelFont: 2 }).labelFont], ['paper', 'ink']);
});

test('the label sits on the container wherever it is drawn, and its words fit', () => {
  // A 2:1 jar in a square box is drawn half as wide, centred.
  const r = containedRect(100, 100, 2, { x: 0, y: 0, w: 1, h: 1 });
  assert.deepEqual(r, { x: 25, y: 0, w: 50, h: 100 });
  const lab = containedRect(100, 100, VESSELS.jar.ratio, VESSELS.jar.label);
  assert.ok(lab.x > 25 && lab.x + lab.w < 75 && lab.y > 40 && lab.y + lab.h < 80);
  // Set on the floor of a tall box.
  assert.equal(containedRect(10, 40, 2, { x: 0, y: 0, w: 1, h: 1 }, true).y, 20);
  const short = labelFontSize('Sage', 40, 12);
  const long = labelFontSize('Mugwort, wormwood and a little rue', 40, 12);
  assert.ok(short <= 12 * 0.62 + 1e-9);
  assert.ok(long < short);
  assert.ok(long * 0.52 * Math.ceil(34 / 2) <= 40 * 0.92 + 1e-9, 'two lines fit across');
  assert.ok(labelFontSize('Book of Shadows', 8, 60, true) <= 8 * 0.62 + 1e-9, 'up a spine it fits the spine’s width');
});

test('things are set out on the planks, wrapping and shrinking to fit', () => {
  const a = SHELF_ART.crystal;
  const crystal = shelfThing({ shelf: 'crystals', name: 'Rose quartz' });
  const few = layoutShelf(a, Array(3).fill(crystal));
  assert.equal(few.length, 1);
  assert.deepEqual(few[0].map((p) => p.plank), [0, 0, 0]);
  for (const p of few[0]) {
    assert.equal(p.y, a.planks[0], 'stands on the front edge');
    assert.ok(p.x - p.w / 2 >= a.left && p.x + p.w / 2 <= a.right, 'between the uprights');
  }
  // The row is centred.
  const mid = (few[0][0].x + few[0][2].x) / 2;
  assert.ok(Math.abs(mid - (a.left + a.right) / 2) < 0.01);
  // More than a plank holds wraps to the next.
  const many = layoutShelf(a, Array(20).fill(crystal));
  assert.equal(many.length, 1);
  assert.ok(new Set(many[0].map((p) => p.plank)).size > 1);
  assert.deepEqual(many[0].map((p) => p.index), [...Array(20).keys()]);
  // Planks fill in order, never going back up.
  many[0].forEach((p, i) => i && assert.ok(p.plank >= many[0][i - 1].plank));
  // Too many for one cabinet: they shrink, then carry on in another.
  const books = layoutShelf(SHELF_ART.book, Array(200).fill(shelfThing({ shelf: 'books', name: 'x' })));
  assert.ok(books.length > 1);
  assert.equal(books.flat().length, 200);
  assert.ok(books[0][0].h < books[1][0].h * 1.01 && books[0][0].h <= (SHELF_ART.book.planks[0] - SHELF_ART.book.top) * 0.88 * 0.6 + 1e-9);
  assert.deepEqual(layoutShelf(a, []), [[]]);
  // In pixels on a 390px-wide view, the crop fills the width.
  const view = viewOf(a, 390);
  assert.ok(Math.abs(view.imageWidth * (a.crop[1] - a.crop[0]) - 390) < 1e-6);
  const px = toView(a, few[0][0], 390);
  assert.ok(px.left > 0 && px.left + px.width < 390 && Math.abs(px.top + px.height - a.planks[0] * view.height) < 1e-6);
});

test('Apothecary blends, oils and waters carry their label onto the altar', () => {
  const now = '2026-11-04T10:00:00.000Z';
  const oil = normalizeApothecary({ id: 'a1', name: 'Dream Oil', type: 'oil-tincture', ingredients: [{ label: 'Mugwort' }] });
  assert.deepEqual(apothecaryLabel(oil), { text: '', style: 'paper', font: 'ink' });
  const placed = apothecaryObject(oil, [], now);
  assert.equal(placed.imagePath, VESSELS.dropper.image);
  assert.deepEqual(cleanVesselLabel(placed.vesselLabel), { vessel: 'dropper', text: 'Dream Oil', style: 'paper', font: 'ink' });
  const relabelled = withApothecaryLabel(oil, { text: 'Artemisia, for dreaming', style: 'gold', font: 'script' });
  assert.equal(relabelled.metadata?.vesselLabel && (relabelled.metadata.vesselLabel as { style: string }).style, 'gold');
  const refreshed = refreshPlaced(placed, relabelled);
  assert.deepEqual(cleanVesselLabel(refreshed.vesselLabel), { vessel: 'dropper', text: 'Artemisia, for dreaming', style: 'gold', font: 'script' });
  const jar = normalizeApothecary({ id: 'a2', name: 'Sweetening jar', type: 'spell-jar', ingredients: [{ label: 'Honey' }] });
  assert.equal(apothecaryVessel(jar), null);
  const placedJar = apothecaryObject(jar, [], now);
  assert.equal(placedJar.vesselLabel, undefined);
  assert.equal(placedJar.imagePath, jar.imagePath);
  assert.equal(apothecaryVessel(normalizeApothecary({ id: 'a3', name: 'Moon water', type: 'oil-tincture' }))?.vessel, 'bottle');
});
