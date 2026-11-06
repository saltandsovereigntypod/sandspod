import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TIMING_INTENTS } from '../src/lib/craft/cosmic/timing.ts';
import { afterwards, bathForKit, bathTendRecord, earthSafe, logTimelineItem, mixesUsing, missingToAdd, normalizeLog, normalizeMix, ownMix, shelfMatch, suggestBath, TEND_CHOICES } from '../src/lib/craft/bath/bath.ts';
import { BATH_MIXES, mixById } from '../src/lib/craft/bath/mixes.ts';
import { alwaysNotes, bathSafety, stoneWater, type BathIngredient } from '../src/lib/craft/bath/safety.ts';
import { CRAFT_TOOLS } from '../src/lib/craft/practices.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { kitFor, MOON_KIT_REFS, SABBAT_KIT_REFS } from '../src/lib/rituals/kits.ts';
import { cleanItem, newItem, type ShelfEntry } from '../src/lib/shelves/model.ts';
import { isTimelineKind, TIMELINE_KINDS } from '../src/lib/journal/timeline.ts';

const ing = (name: string, kind: BathIngredient['kind'] = 'herb'): BathIngredient => ({ name, amount: 'some', kind });
const titles = (list: BathIngredient[]) => bathSafety(list).map((n) => n.title);
const shelf = (name: string, extra: Record<string, unknown> = {}): ShelfEntry => ({ id: name, createdAt: '', item: cleanItem({ ...newItem({ name }), ...extra }) });

test('thirty premade mixes, each complete, with unique ids', () => {
  assert.ok(BATH_MIXES.length >= 24 && BATH_MIXES.length <= 30);
  assert.equal(new Set(BATH_MIXES.map((m) => m.id)).size, BATH_MIXES.length);
  const intents = new Set(TIMING_INTENTS.map((i) => i.key));
  for (const m of BATH_MIXES) {
    assert.ok(m.title && m.intention && m.prep && m.words && m.minutes > 0, m.id);
    assert.ok(m.ingredients.length >= 3, m.id);
    assert.ok(m.ingredients.every((i) => i.amount.trim()), m.id);
    assert.ok(intents.has(m.intent), `${m.id} intent`);
    assert.ok(m.when.moon && m.when.day && m.when.hour, m.id);
    assert.ok(afterwards(m).length >= 2, m.id);
    assert.doesNotMatch(JSON.stringify(m), /!|\p{Extended_Pictographic}/u, `${m.id} house voice`);
  }
});

test('every library ref used by a mix exists', () => {
  for (const m of BATH_MIXES) {
    for (const i of m.ingredients) {
      if (!i.ref) continue;
      const [, type, key] = i.ref.split('/');
      assert.ok((TRADITIONAL_LIBRARY as Record<string, Record<string, unknown>>)[type]?.[key], `${m.id}: ${i.ref}`);
    }
  }
});

test('the intentions people asked for are all covered', () => {
  const ids = BATH_MIXES.map((m) => m.id).join(' ');
  for (const want of ['cleansing', 'uncrossing', 'protection', 'self-love', 'prosperity', 'road-opener', 'courage', 'dream', 'sleep', 'grief', 'ancestor', 'new-moon', 'full-moon', 'dark-moon', 'samhain', 'beltane', 'yule', 'imbolc', 'boundaries', 'glamour', 'healing', 'banishing', 'foot-soak', 'child']) assert.match(ids, new RegExp(want), want);
});

test('safety: skin irritants, phototoxic oils, pregnancy cautions, poisons and never-pennyroyal', () => {
  for (const name of ['Cinnamon bark', 'Cloves', 'Cayenne pepper', 'Black pepper', 'Wintergreen oil']) assert.ok(bathSafety([ing(name)]).some((n) => n.group === 'skin'), name);
  assert.ok(titles([ing('Bergamot essential oil', 'oil')]).includes('Citrus oils react to sunlight'));
  assert.ok(!titles([ing('Dried orange peel', 'other')]).includes('Citrus oils react to sunlight'));
  assert.ok(titles([ing('Thyme essential oil', 'oil')]).includes('Oregano and thyme oils irritate skin'));
  assert.ok(!titles([ing('Thyme')]).includes('Oregano and thyme oils irritate skin'));
  assert.ok(bathSafety([ing('Mugwort')]).some((n) => n.group === 'pregnancy'));
  assert.ok(bathSafety([ing('Rosemary essential oil', 'oil')]).some((n) => n.group === 'pregnancy'));
  assert.ok(!bathSafety([ing('Rosemary')]).some((n) => n.group === 'pregnancy'));
  const penny = bathSafety([ing('Pennyroyal')]);
  assert.equal(penny[0].level, 'avoid');
  assert.equal(bathSafety([ing('Foxglove')])[0].level, 'avoid');
});

test('safety: any essential oil must be diluted first; the warnings come first when serious', () => {
  const notes = bathSafety([ing('Lavender essential oil', 'oil'), ing('Pennyroyal')]);
  assert.ok(notes.some((n) => n.group === 'oil' && /carrier oil|milk|salts/.test(n.text)));
  assert.equal(notes[0].level, 'avoid');
});

test('safety: stones come from Stone care, so water-safe and keep-out stones are marked', () => {
  assert.equal(stoneWater('Selenite').status, 'out');
  assert.equal(stoneWater('Malachite').status, 'out');
  assert.equal(stoneWater('Rose quartz').status, 'safe');
  assert.equal(stoneWater('A stone nobody has heard of').status, 'unknown');
  const full = BATH_MIXES.find((m) => m.id === 'full-moon')!;
  assert.ok(bathSafety(full.ingredients).some((n) => n.group === 'stone' && n.ingredient === 'Selenite'));
  for (const m of BATH_MIXES) for (const i of m.ingredients) if (i.kind === 'crystal') assert.ok(i.optional, `${m.id}: stones are optional extras`);
});

test('premade mixes show their warnings automatically', () => {
  const warn = (id: string) => bathSafety(mixById(id)!.ingredients);
  assert.ok(warn('prosperity').some((n) => /Cinnamon/.test(n.title)));
  assert.ok(warn('yule').some((n) => /Clove/.test(n.title)));
  assert.ok(warn('dream-psychic').some((n) => n.group === 'pregnancy'));
  assert.ok(warn('prosperity').some((n) => n.ingredient === 'Pyrite' && n.group === 'stone'));
  assert.ok(alwaysNotes([], 'loose').some((n) => n.id === 'drain'));
  assert.ok(alwaysNotes([], 'sachet').every((n) => n.id !== 'drain'));
  assert.ok(alwaysNotes([], 'sachet').some((n) => n.id === 'patch') && alwaysNotes([], 'sachet').some((n) => n.id === 'slip'));
});

test('no premade mix uses an essential oil or a poison, and the child mix holds no oil, salt, spice or stone', () => {
  for (const m of BATH_MIXES) {
    assert.ok(!m.ingredients.some((i) => i.kind === 'oil'), m.id);
    assert.ok(!bathSafety(m.ingredients).some((n) => n.level === 'avoid'), m.id);
  }
  const child = mixById('child-gentle')!;
  assert.ok(child.ingredients.every((i) => ['herb', 'other'].includes(i.kind)));
  assert.ok(!bathSafety(child.ingredients).some((n) => ['skin', 'pregnancy', 'oil', 'poison', 'stone'].includes(n.group)));
});

test('afterwards: salt goes down the drain, plain plant water may go to the earth, herbs never down the drain', () => {
  const salty = afterwards(mixById('cleansing')!).join(' ');
  assert.match(salty, /salt/i);
  assert.doesNotMatch(salty, /roots|crossroads/);
  const plain = mixById('child-gentle')!;
  assert.ok(earthSafe(plain));
  assert.match(afterwards(plain).join(' '), /roots|crossroads/);
  assert.match(afterwards(mixById('self-love')!).join(' '), /never go down the drain/);
  assert.ok(!earthSafe(mixById('imbolc')!), 'milk is not for the soil');
});

test('shelf matching counts required ingredients you have, and not what is running low', () => {
  const mix = mixById('protection')!;
  const entries = [shelf('Sea salt'), shelf('Rosemary'), shelf('Bay leaves', { low: true })];
  const m = shelfMatch(mix, entries);
  assert.equal(m.total, 4);
  assert.deepEqual(m.have.map((i) => i.name), ['Sea salt', 'Rosemary']);
  assert.deepEqual(m.need.map((i) => i.name), ['Bay leaves', 'Basil']);
  assert.deepEqual(m.optionalHave, []);
  assert.equal(shelfMatch(mix, []).have.length, 0);
});

test('"Add what\'s missing" adds low-marked items, skipping what is already on the list', () => {
  const mix = mixById('protection')!;
  const add = missingToAdd(mix, [shelf('Sea salt'), shelf('Bay leaves', { low: true })]);
  assert.deepEqual(add.map((i) => i.name).sort(), ['Basil', 'Rosemary']);
  assert.ok(add.every((i) => i.low && i.shelf === 'herbs'));
  assert.deepEqual(missingToAdd(mix, [shelf('Sea salt'), shelf('Rosemary'), shelf('Bay leaves'), shelf('Basil')]), []);
});

test('the Library: herbs and stones find the mixes that use them', () => {
  const rose = mixesUsing({ name: 'Rose', ref: 'traditional/herb/rose' }).map((m) => m.id);
  assert.ok(rose.includes('self-love') && rose.includes('full-moon'));
  assert.ok(mixesUsing({ name: 'Black tourmaline' }).some((m) => m.id === 'protection'));
  assert.deepEqual(mixesUsing({ name: 'Unobtainium' }), []);
});

test('build your own: suggestions follow the intention and honour the safety table', () => {
  const s = suggestBath('protection')!;
  assert.ok(s.herbs.length >= 3 && s.herbs.every((h) => h.amount && h.ref));
  assert.ok(!s.herbs.some((h) => bathSafety([h]).some((n) => n.level === 'avoid')));
  assert.equal(s.salt[0].name, 'Sea salt');
  assert.equal(suggestBath('peace')!.salt[0].name, 'Epsom salts');
  const preg = suggestBath('divination', { pregnant: true })!;
  assert.ok(!preg.herbs.some((h) => bathSafety([h]).some((n) => n.group === 'pregnancy')));
  const kid = suggestBath('peace', { child: true })!;
  assert.equal(kid.stones.length, 0);
  assert.equal(kid.salt.length, 0);
  assert.ok(kid.herbs.every((h) => bathSafety([h]).length === 0));
  assert.equal(suggestBath('nonsense'), null);
  assert.ok(kid.herbs.every((h) => !/frankincense|myrrh|copal/i.test(h.name)));
});

test('a mix of your own keeps its choices and is read back safely', () => {
  const s = suggestBath('courage')!;
  const mix = ownMix({ id: 'own-1', title: ' ', intent: 'courage', ingredients: [...s.salt, ...s.herbs.slice(0, 2)], method: 'infusion', words: '', minutes: 500 });
  assert.equal(mix.own, true);
  assert.match(mix.title, /bath/i);
  assert.equal(mix.minutes, 120);
  assert.match(mix.when.day, /Tuesday|Sunday/);
  const back = normalizeMix(JSON.parse(JSON.stringify(mix)), 'x')!;
  assert.deepEqual(back.ingredients, mix.ingredients);
  assert.equal(normalizeMix({ ingredients: [] }, 'y'), null);
  assert.equal(normalizeMix('nope', 'y'), null);
});

test('the log becomes a Journal row of its own kind', () => {
  assert.ok(isTimelineKind('bath'));
  assert.ok(TIMELINE_KINDS.some((k) => k.kind === 'bath' && k.label === 'Baths'));
  const item = logTimelineItem({ id: 'b1', data: { mixId: 'sleep', title: 'Sleep bath', at: '2026-03-02T20:15:00.000Z', felt: ['Sleepy', 'Calmer'], noticed: 'The window steamed up.\nMore' } });
  assert.equal(item.kind, 'bath');
  assert.equal(item.date, '2026-03-02');
  assert.match(item.detail, /sleepy, calmer · The window steamed up\./);
  assert.match(item.href, /bath\/log\?id=b1/);
  assert.equal(normalizeLog(null).title, 'A bath');
});

test('rhythms in To tend: new moon, weekly, one record per mix', () => {
  assert.ok(TEND_CHOICES.some((c) => c.rhythm.kind === 'moon' && c.rhythm.moon === 'new'));
  const mix = mixById('new-moon')!;
  const rec = bathTendRecord(mix, TEND_CHOICES[0].rhythm);
  assert.equal(rec.key, 'own:bath-new-moon');
  assert.equal(rec.own?.type, 'bath');
  assert.deepEqual(rec.rhythm, { kind: 'moon', moon: 'new' });
  assert.match(rec.href, /bath\/mix\?id=new-moon/);
  const again = bathTendRecord(mix, { kind: 'weekly' }, rec);
  assert.equal(again.key, rec.key);
  assert.deepEqual(again.rhythm, { kind: 'weekly' });
});

test('every moon and sabbat kit has a matching bath', () => {
  for (const ref of [...MOON_KIT_REFS, ...SABBAT_KIT_REFS]) {
    assert.ok(kitFor(ref), ref);
    assert.ok(bathForKit(ref), `no bath for ${ref}`);
  }
  assert.equal(bathForKit('wheel_south-samhain')?.id, 'samhain');
  assert.equal(bathForKit('moon-nothing'), null);
});

test('the bath tool is on the Craft list with a route', () => {
  const tool = CRAFT_TOOLS.kitchen.find((t) => t.title === 'Bath & body');
  assert.equal(tool?.href, '/rituals/craft/bath');
});
