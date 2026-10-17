import assert from 'node:assert/strict';
import { test } from 'node:test';

import { moonState, upcomingPhases } from '../src/lib/moon.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { INTENTIONS } from '../src/lib/rituals/planner.ts';
import { filterPremade, PREMADE } from '../src/lib/rituals/premade/index.ts';
import { filterPantry, LIBRARY_KITCHEN_HERBS, PANTRY, pantryItem, pantryLibraryId } from '../src/lib/craft/kitchen/pantry.ts';
import { homeTide, homeTideOf, lunationKey, lunationStart, nextTurn, TIDE_GUIDES, TIDE_ORDER, tasksFor, toggleTick } from '../src/lib/craft/kitchen/moonhome.ts';
import { partLibraryId, SEASONS, seasonAt, SIMMER_POTS, simmerDraft, simmerPot, stirsAway, suggestSimmer } from '../src/lib/craft/kitchen/simmer.ts';

const herbs = TRADITIONAL_LIBRARY.herb as unknown as Record<string, unknown>;
const intentionKeys = new Set(INTENTIONS.map((i) => i.key));
const ELEMENTS = new Set(['Earth', 'Water', 'Fire', 'Air']);
const PLANETS = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']);

test('the pantry has about 45 items, each complete and unique', () => {
  assert.ok(PANTRY.length >= 44, `${PANTRY.length} items`);
  const keys = new Set<string>();
  for (const p of PANTRY) {
    assert.ok(!keys.has(p.key), `duplicate ${p.key}`);
    keys.add(p.key);
    assert.ok(p.name && p.kitchen.trim() && p.safety.trim(), p.key);
    assert.ok(ELEMENTS.has(p.element), `${p.key} element ${p.element}`);
    assert.ok(PLANETS.has(p.planet), `${p.key} planet ${p.planet}`);
    assert.ok(p.uses.length > 0, `${p.key} uses`);
    assert.ok(p.intentions.length > 0, `${p.key} intentions`);
    for (const i of p.intentions) assert.ok(intentionKeys.has(i), `${p.key} intention ${i}`);
    if (p.library) {
      assert.ok(herbs[p.library], `${p.key} links to a missing Library herb ${p.library}`);
      assert.equal(p.about, '', `${p.key} is in the Library, so it shouldn’t duplicate the meaning`);
    } else {
      assert.ok(p.about.length > 80, `${p.key} about`);
    }
  }
});

test('items the Library covers link there instead of duplicating', () => {
  for (const key of ['cinnamon', 'cloves', 'garlic', 'ginger', 'black_pepper', 'star_anise', 'allspice', 'vanilla', 'peppermint']) {
    const item = pantryItem(key);
    assert.ok(item?.library, key);
    assert.equal(pantryLibraryId(item!), `traditional:herb:${item!.library}`);
  }
  assert.equal(pantryLibraryId(pantryItem('salt')!), null);
  for (const key of LIBRARY_KITCHEN_HERBS) assert.ok(herbs[key], key);
  // Nothing in the pantry duplicates a Library herb without linking it.
  for (const p of PANTRY) if (!p.library) assert.ok(!herbs[p.key], `${p.key} is in the Library; link it`);
});

test('pantry search matches names, aliases and uses, and filters combine', () => {
  assert.deepEqual(filterPantry(PANTRY, { query: 'treacle' }).map((p) => p.key), ['molasses']);
  assert.ok(filterPantry(PANTRY, { query: 'Honey' }).some((p) => p.key === 'honey'));
  const fireProtection = filterPantry(PANTRY, { element: 'Fire', intention: 'protection' });
  assert.ok(fireProtection.length > 0);
  assert.ok(fireProtection.every((p) => p.element === 'Fire' && p.intentions.includes('protection')));
  assert.ok(filterPantry(PANTRY, { group: 'spices' }).every((p) => p.group === 'spices'));
  assert.equal(filterPantry(PANTRY, { query: 'zzzz' }).length, 0);
});

test('safety notes cover the known hazards', () => {
  assert.match(pantryItem('honey')!.safety, /12 months/);
  assert.match(pantryItem('nutmeg')!.safety, /pinch/i);
  assert.match(pantryItem('chocolate')!.safety, /dogs/);
  assert.match(pantryItem('vinegar')!.safety, /bleach/);
  assert.match(pantryItem('beans')!.safety, /kidney/);
  assert.match(pantryItem('star_anise')!.safety, /Japanese/);
});

test('every simmer pot uses real pantry items and Library herbs, and every intention has two or more', () => {
  const ids = new Set<string>();
  for (const pot of SIMMER_POTS) {
    assert.ok(!ids.has(pot.id), pot.id);
    ids.add(pot.id);
    assert.ok(pot.parts.length >= 3, pot.id);
    for (const part of pot.parts) {
      assert.ok(part.amount && part.name, pot.id);
      if (part.pantry) assert.ok(pantryItem(part.pantry), `${pot.id} ${part.pantry}`);
      if (part.herb) assert.ok(herbs[part.herb], `${pot.id} ${part.herb}`);
      assert.ok(part.pantry || part.herb, `${pot.id} ${part.name} has no source`);
      // Nothing that's unsafe to heat and breathe.
      assert.ok(!/chil|cayenne|mugwort|essential oil/i.test(part.name + part.amount), `${pot.id} ${part.name}`);
    }
    for (const i of pot.intentions) assert.ok(intentionKeys.has(i), `${pot.id} ${i}`);
  }
  for (const intention of INTENTIONS) {
    for (const { key: season } of SEASONS) {
      const found = suggestSimmer(intention.key, season);
      assert.ok(found.length >= 2, `${intention.key} in ${season}: ${found.length}`);
      assert.ok(found.length <= 3);
      assert.ok(found.every((p) => p.intentions.includes(intention.key as never)));
    }
  }
});

test('simmer suggestions prefer the season', () => {
  const winter = suggestSimmer('prosperity', 'winter');
  assert.ok(winter[0].seasons.includes('winter') || winter[0].seasons.length === 0);
  const summer = suggestSimmer('prosperity', 'summer');
  assert.equal(summer[0].id, 'green-growth');
});

test('the season flips for the southern hemisphere and assumes north without a place', () => {
  const october = new Date(2026, 9, 16);
  assert.deepEqual(seasonAt(october, 51.5), { season: 'autumn', hemisphere: 'north', assumed: false });
  assert.deepEqual(seasonAt(october, -33.9), { season: 'spring', hemisphere: 'south', assumed: false });
  assert.deepEqual(seasonAt(october, null), { season: 'autumn', hemisphere: 'north', assumed: true });
  assert.equal(seasonAt(new Date(2026, 0, 10), -37).season, 'summer');
  assert.equal(seasonAt(new Date(2026, 6, 10), 40).season, 'summer');
  assert.equal(seasonAt(new Date(2026, 11, 1), 40).season, 'winter');
});

test('a simmer pot becomes a guided working with its safety and Library herbs', () => {
  const pot = simmerPot('sweep-out')!;
  const draft = simmerDraft(pot, 'banishing', 'Banishing');
  assert.equal(draft.kind, 'spell');
  assert.ok(draft.steps.length >= 5);
  assert.match(draft.preparation, /unattended/);
  assert.match(draft.preparation, /essential oils/);
  assert.ok(draft.steps.some((s) => /anticlockwise/.test(s.instructions)));
  assert.ok(draft.steps.some((s) => s.spoken_text));
  const refs = draft.ingredients.map((i) => i.ref);
  assert.ok(refs.includes('traditional/herb/rosemary'));
  assert.ok(refs.includes('traditional/herb/clove'), 'pantry cloves link to the Library clove');
  assert.equal(new Set(refs).size, refs.length);
  assert.ok(simmerDraft(simmerPot('golden-door')!, 'prosperity', 'Prosperity').steps.some((s) => / clockwise/.test(s.instructions)));
  assert.equal(stirsAway('love'), false);
  assert.equal(partLibraryId({ amount: '1', name: 'salt', pantry: 'salt' }), null);
});

test('home tides follow the moon, with the last sliver as dark', () => {
  assert.equal(homeTideOf('Full Moon', 0.5), 'full');
  assert.equal(homeTideOf('New Moon', 0.01), 'dark');
  assert.equal(homeTideOf('Waning Crescent', 0.95), 'dark');
  assert.equal(homeTideOf('Waxing Crescent', 0.1), 'waxing');
  assert.equal(homeTideOf('Waning Gibbous', 0.6), 'waning');
  const full = upcomingPhases(new Date('2026-10-01T00:00:00Z'), 8).find((e) => e.phase === 'full')!;
  assert.equal(homeTide(full.date), 'full');
  const later = new Date(full.date.getTime() + 5 * 86_400_000);
  assert.equal(homeTide(later), 'waning', moonState(later).name);
});

test('a lunation is keyed by the new moon that began it', () => {
  const news = upcomingPhases(new Date('2026-09-01T00:00:00Z'), 12).filter((e) => e.phase === 'new');
  const [a, b] = news;
  const mid = new Date((a.date.getTime() + b.date.getTime()) / 2);
  assert.equal(lunationStart(mid).getTime(), a.date.getTime());
  const justBefore = new Date(b.date.getTime() - 3_600_000);
  assert.equal(lunationStart(justBefore).getTime(), a.date.getTime());
  assert.equal(lunationStart(new Date(b.date.getTime() + 60_000)).getTime(), b.date.getTime());
  assert.match(lunationKey(mid), /^\d{4}-\d{2}-\d{2}$/);
});

test('each tide offers three to five tasks, rotating by lunation', () => {
  for (const tide of TIDE_ORDER) {
    const guide = TIDE_GUIDES[tide];
    assert.ok(guide.summary && guide.suits.length, tide);
    const ids = new Set(guide.tasks.map((t) => t.id));
    assert.equal(ids.size, guide.tasks.length, `${tide} task ids`);
    const shown = tasksFor(tide, '2026-10-10');
    assert.ok(shown.length >= 3 && shown.length <= 5, tide);
    assert.equal(new Set(shown.map((t) => t.id)).size, shown.length);
    assert.deepEqual(tasksFor(tide, '2026-10-10'), shown, 'stable within a lunation');
  }
  assert.notDeepEqual(tasksFor('waning', '2026-10-10'), tasksFor('waning', '2026-11-09'));
  assert.deepEqual(toggleTick([], 'a'), ['a']);
  assert.deepEqual(toggleTick(['a', 'b'], 'a'), ['b']);
  const turn = nextTurn(new Date('2026-10-16T12:00:00Z'));
  assert.ok(turn.date.getTime() > Date.parse('2026-10-16T12:00:00Z'));
});

test('the kitchen spell book has workings for the practice', () => {
  const book = filterPremade(PREMADE, { practice: 'kitchen' });
  assert.ok(book.length >= 10);
  assert.ok(filterPremade(PREMADE, { practice: 'kitchen', intention: 'protection' }).length >= 2);
});
