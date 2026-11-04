import assert from 'node:assert/strict';
import { test } from 'node:test';

import { VESSELS } from '../src/lib/altar/vesselLabel.ts';
import { jarTendingAt, jarWantsShaking } from '../src/lib/altar/workings/jarTending.ts';
import { addLayer, emptyJar, type JarDraft, jarArt, jarLayer, jarObject, jarStateOf, PETITION_COLOR, petitionLayer, sealJar, shakeToRenew } from '../src/lib/altar/workings/spellJar.ts';
import { gatherTendables } from '../src/lib/tend/gather.ts';

const NOW = '2026-11-04T20:00:00.000Z';
const day = (n: number) => new Date(Date.parse(NOW) + n * 86_400_000);

function built(vessel: 'jar' | 'bottle' = 'jar', seal = true) {
  let jar: JarDraft = { ...emptyJar('Protection'), vessel };
  jar = addLayer(jar, jarLayer({ label: 'Black salt', source: 'salt' }, NOW));
  jar = addLayer(jar, jarLayer({ label: 'Rosemary', source: 'library', herb: 'rosemary' }, NOW));
  jar = addLayer(jar, petitionLayer('  Keep this house   safe ', NOW));
  return seal ? sealJar(jar, 'black', NOW) : jar;
}

test('a petition goes in as rolled paper with its words', () => {
  const p = petitionLayer('  Keep this house   safe ', NOW);
  assert.equal(p.label, 'Petition');
  assert.equal(p.color, PETITION_COLOR);
  assert.equal(p.spoken, 'Keep this house safe');
});

test('the chosen glass is the jar’s picture, and its layers are drawn inside it, bottom first', () => {
  const { item, object } = jarObject(built('bottle'), [], NOW);
  assert.equal(item.imagePath, VESSELS.bottle.image);
  assert.equal(object.imagePath, VESSELS.bottle.image);
  assert.equal(jarStateOf(object)?.vessel, 'bottle');
  const art = jarArt(object, 80, 160)!;
  assert.equal(art.bands.length, 3);
  // Bottom layer lowest; every band inside the glass.
  assert.ok(art.bands[0].y > art.bands[2].y);
  for (const b of art.bands) {
    assert.ok(b.y >= art.inside.y - 1e-6 && b.y + b.h <= art.inside.y + art.inside.h + 1e-6);
    assert.ok(b.x >= 0 && b.x + b.w <= 80);
  }
  assert.ok(art.cork.y < art.inside.y);
  assert.match(art.seal!, /^#/);
});

test('a jar without a glass of its own keeps its old picture and isn’t drawn over', () => {
  const { object } = jarObject({ ...built(), vessel: undefined }, [], NOW);
  assert.equal(jarArt(object, 80, 160), null);
});

test('a sealed jar asks for a shake when its day comes, and a shake moves it on', () => {
  const { object } = jarObject(built(), [], NOW);
  const due = jarTendingAt(object)!;
  assert.ok(due > Date.parse(NOW));
  assert.equal(jarWantsShaking(object, day(1)), false);
  assert.equal(jarWantsShaking(object, day(31)), true);
  const shaken = shakeToRenew(object, day(31).toISOString());
  assert.equal(jarWantsShaking(shaken, day(32)), false);
  const unsealed = jarObject(built('jar', false), [], NOW).object;
  assert.equal(jarTendingAt(unsealed), null);
});

test('a jar due a shake is on the To tend list', () => {
  const { object } = jarObject(built(), [], NOW);
  const altar = { id: 'a1', name: 'Home', objects: [object] } as never;
  const later = gatherTendables({ now: day(31), altars: { altars: [altar], petitions: [] } });
  const jar = later.find((t) => t.kind === 'jar');
  assert.ok(jar);
  assert.equal(jar!.href, '/altar/a1');
  assert.equal(gatherTendables({ now: day(1), altars: { altars: [altar], petitions: [] } }).some((t) => t.kind === 'jar'), false);
});
