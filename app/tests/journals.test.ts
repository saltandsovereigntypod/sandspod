import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { personalParts } from '../src/lib/grimoire/layout.ts';
import {
  blankEntry,
  checkOnChoices,
  deityChoices,
  deityLog,
  entriesAbout,
  entryTitle,
  fieldsFor,
  framesFor,
  grimoireJournals,
  journalPlace,
  journalRoutes,
  journalSettingDefaults,
  journalWebRoutes,
  JOURNALS,
  linkingTo,
  matchingNames,
  normalizeEntry,
  omensToCheck,
  promptOfDay,
  PROMPTS,
  readyToKeep,
  searchEntries,
  SHADOW_NOTE,
  tagCounts,
  todayJournalPrompt,
  withTags,
  type JournalEntry,
} from '../src/lib/journals/journals.ts';
import { defaultSettings } from '../src/lib/settings/defaults.ts';
import { searchEverything } from '../src/lib/search.ts';

const entry = (id: string, data: Partial<JournalEntry['data']>, kind: 'shadow' | 'devotion' | 'ancestors' | 'omens' = 'shadow'): JournalEntry => ({
  id,
  createdAt: '2026-10-01T00:00:00.000Z',
  data: { ...blankEntry(kind, new Date(2026, 9, 1, 21, 0)), ...data },
});

test('four journals, each its own private collection, kept in the Grimoire until moved', () => {
  assert.deepEqual(JOURNALS.map((j) => j.kind), ['shadow', 'devotion', 'ancestors', 'omens']);
  assert.equal(new Set(JOURNALS.map((j) => j.collection)).size, 4);
  const defaults = defaultSettings();
  for (const [key, value] of Object.entries(journalSettingDefaults())) assert.equal(defaults[key], value, key);
  assert.equal(journalPlace(defaults, 'shadow'), 'grimoire');
  const moved = { ...defaults, journal_omens_place: 'journal' };
  assert.equal(journalPlace(moved, 'omens'), 'journal');
  assert.deepEqual(grimoireJournals(moved).map((j) => j.kind), ['shadow', 'devotion', 'ancestors']);
  // The website's settings start the same.
  const site = readFileSync('../js/my-settings.js', 'utf8');
  for (const j of JOURNALS) assert.match(site, new RegExp(`${j.setting}: "grimoire"`));
});

test('routes in both tabs, on the app and the website', () => {
  assert.equal(journalRoutes('shadow', 'grimoire').list, '/grimoire/journals/shadow');
  assert.equal(journalRoutes('omens', 'journal').entry('a b'), '/rituals/journals/omens/a%20b');
  assert.equal(journalRoutes('devotion', 'grimoire').write({ deity: 'hekate' }), '/grimoire/journals/devotion/edit?deity=hekate');
  assert.equal(journalWebRoutes('ancestors', 'journal').entry('x'), '/rituals/journals/entry/?j=ancestors&id=x');
  for (const tab of ['grimoire', 'rituals']) {
    for (const f of ['index.tsx', '[kind]/index.tsx', '[kind]/edit.tsx', '[kind]/[id].tsx']) assert.ok(existsSync(`src/app/(tabs)/${tab}/journals/${f}`), `${tab}/${f}`);
    for (const f of ['index.html', 'journal/index.html', 'entry/index.html', 'edit/index.html']) assert.ok(existsSync(`../${tab}/journals/${f}`), `website ${tab}/${f}`);
  }
});

test('the journals sit after Dreams in the Grimoire home', () => {
  const parts = personalParts({ sections: [], loose: false, shelves: [{ key: 'traditional', title: 'T' }, { key: 'omenJournal', title: 'O' }, { key: 'dreams', title: 'D' }, { key: 'shadowJournal', title: 'S' }, { key: 'myPractice', title: 'M' }] });
  assert.deepEqual(parts.map((p) => p.key), ['myPractice', 'dreams', 'shadowJournal', 'omenJournal', 'traditional']);
});

test('entries are read defensively, with the moon noted from the day and time', () => {
  const d = normalizeEntry({ date: '2026-10-31', time: '23:00', tags: ['Grief', 7, ''], links: [{ type: 'page', id: 'p1', title: 'Hekate' }, { type: 'nope', id: 'x' }], outcome: 'odd' });
  assert.equal(d.date, '2026-10-31');
  assert.deepEqual(d.tags, ['grief']);
  assert.deepEqual(d.links, [{ type: 'page', id: 'p1', title: 'Hekate' }]);
  assert.equal(d.outcome, 'waiting');
  assert.ok(d.moonPhase && d.moonSign);
  assert.equal(readyToKeep('shadow', blankEntry('shadow', new Date())), null);
  assert.equal(readyToKeep('devotion', { ...blankEntry('devotion', new Date()), text: 'Candle lit' }), null, 'a deity is needed');
  assert.ok(readyToKeep('devotion', { ...blankEntry('devotion', new Date()), text: ' Candle lit ', deityName: 'Hekate' })?.text === 'Candle lit');
});

test('fields follow what an entry is', () => {
  const recipe = { ...blankEntry('ancestors', new Date()), about: 'recipe' };
  assert.ok(fieldsFor('ancestors', recipe).some((f) => f.key === 'recipe'));
  assert.ok(!fieldsFor('ancestors', { ...recipe, about: 'story' }).some((f) => f.key === 'recipe'));
  const keys = fieldsFor('shadow', blankEntry('shadow', new Date())).map((f) => f.key);
  for (const k of ['text', 'trigger', 'pattern', 'integration']) assert.ok(keys.includes(k as never), k);
});

test('search, tags, deities, people and backlinks', () => {
  const list = [
    entry('a', { text: 'Anger at my sister', tags: ['family', 'anger'] }),
    entry('b', { text: 'Quiet', tags: ['family'], links: [{ type: 'page', id: 'p1', title: 'Rose' }] }),
  ];
  assert.deepEqual(searchEntries('shadow', list, 'sister').map((e) => e.id), ['a']);
  assert.deepEqual(searchEntries('shadow', list, 'ROSE').map((e) => e.id), ['b'], 'linked titles are searchable');
  assert.deepEqual(tagCounts(list)[0], { tag: 'family', count: 2 });
  assert.deepEqual(withTags(['family'], 'Grief, family; moon'), ['family', 'grief', 'moon']);
  assert.deepEqual(linkingTo({ shadow: list }, 'page', 'p1').map((x) => x.entry.id), ['b']);

  const dev = [entry('d1', { deityKey: 'hekate', deityName: 'Hekate', acts: ['offering'], date: '2026-10-29' }, 'devotion'), entry('d2', { deityName: 'River spirit', date: '2026-10-30' }, 'devotion')];
  assert.deepEqual(deityLog(dev).map((d) => [d.name, d.count, d.offerings]), [['River spirit', 1, 0], ['Hekate', 1, 1]]);
  const choices = deityChoices([{ key: 'hekate', name: 'Hekate', level: 'patron' }], [{ key: 'hekate', name: 'Hekate' }, { key: 'brigid', name: 'Brigid' }]);
  assert.deepEqual(choices.map((c) => [c.name, c.note]), [['Hekate', 'Your patron'], ['Brigid', '']]);
  assert.equal(entryTitle('devotion', dev[0].data), 'Hekate · Offering');

  const anc = [entry('n1', { people: ['nan'], about: 'recipe' }, 'ancestors')];
  assert.equal(entriesAbout(anc, 'nan').length, 1);
  assert.equal(entryTitle('ancestors', anc[0].data, { people: { nan: 'Nan' } }), 'Family recipe · Nan');
  assert.ok(searchEntries('ancestors', anc, 'nan', { people: { nan: 'Nan' } }).length === 1, 'found by a person’s name');
});

test('omens: look back, and places to start', () => {
  const now = new Date(2026, 9, 30, 9);
  const list = [
    entry('o1', { what: 'A heron by the road', checkOn: '2026-10-29' }, 'omens'),
    entry('o2', { what: 'Crows', checkOn: '2026-11-20' }, 'omens'),
    entry('o3', { what: 'A hare', checkOn: '2026-10-01', outcome: 'yes' }, 'omens'),
  ];
  assert.deepEqual(omensToCheck(list, now).map((e) => e.id), ['o1']);
  assert.deepEqual(checkOnChoices('2026-10-30').map((c) => c.value), ['2026-11-06', '2026-11-28', '2027-01-29', '']);
  const refs = [{ name: 'Water', also: ['river'] }, { name: 'Snake', also: [] }];
  assert.deepEqual(matchingNames('I saw a river and snakes', refs, (r) => [r.name, ...r.also]).map((r) => r.name), ['Water', 'Snake']);
  const hit = todayJournalPrompt(now, { omensDue: [{ id: 'o1', title: 'A heron' }] });
  assert.equal(hit?.kind, 'omens');
});

test('ancestor photos come from altar frames linked to them', () => {
  const frame = (ancestor: string, photo: string) => ({ id: 'f', type: 'tool', tool: 'ancestor-frame', livingState: JSON.stringify({ app: { ancestor: { id: ancestor, name: 'Nan' }, frame: { photo, aged: true } } }) });
  const altars = [{ id: 'a1', name: 'Hearth', altar_data: { objects: [frame('nan', 'https://x/nan.jpg'), frame('other', 'https://x/o.jpg')] as never } }];
  assert.deepEqual(framesFor(altars, 'nan'), [{ photo: 'https://x/nan.jpg', aged: true, altarId: 'a1', altarName: 'Hearth' }]);
  assert.deepEqual(framesFor(altars, 'nobody'), []);
});

test('prompts: gentle, honest about shadow work, the same all day', () => {
  assert.match(SHADOW_NOTE, /isn’t therapy/);
  assert.match(SHADOW_NOTE, /Support/);
  for (const list of Object.values(PROMPTS)) for (const p of list) assert.doesNotMatch(p.text, /!/);
  const a = promptOfDay('ancestors', new Date(2026, 9, 30, 8));
  assert.equal(a.id, promptOfDay('ancestors', new Date(2026, 9, 30, 22)).id);
  assert.equal(todayJournalPrompt(new Date(2026, 9, 30, 12), { ancestorDay: 'Samhain' })?.kind, 'ancestors');
});

test('the Sanctuary search finds journal entries', () => {
  const hits = searchEverything({ library: [], pages: [], blocks: [], journal: [], templates: [], journals: [{ kind: 'omens', entries: [entry('o1', { what: 'A white hare at dusk' }, 'omens')] }] }, 'hare');
  assert.equal(hits.practiceJournal[0].id, 'omens/o1');
});
