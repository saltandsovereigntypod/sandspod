import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildLibrary,
  correspondences,
  entryIntro,
  findByName,
  guestPracticeRows,
  layerFields,
  searchLibrary,
  traditionalEntries,
  visibleLayers,
} from '../src/lib/library/model.ts';
import type { PracticeRow } from '../src/lib/library/types.ts';
import { defaultSettings, normalizeSettings } from '../src/lib/settings/defaults.ts';

const row = (extra: Partial<PracticeRow>): PracticeRow => ({
  entity_id: 'e1',
  name: 'basil',
  type: 'herb',
  image: null,
  my_practice: {},
  community: {},
  updated_at: null,
  ...extra,
});

test('every Traditional Library entry is present, including candle styles and the guide', () => {
  const entries = traditionalEntries();
  assert.equal(entries.filter((e) => e.type === 'herb').length, 80);
  assert.ok(entries.some((e) => e.name === 'Jupiter') && entries.some((e) => e.name === 'Birthday Candle'));
  const names = entries.map((e) => e.name);
  assert.ok(names.includes('Basil'));
  assert.ok(names.includes('Candle Magic Guide'));
  assert.ok(names.includes('Tea Light Candle'));
  assert.equal(new Set(entries.map((e) => e.id)).size, entries.length);
});

test('search puts name matches first and needs every word', () => {
  const entries = traditionalEntries();
  assert.equal(searchLibrary(entries, 'basil')[0].name, 'Basil');
  assert.equal(searchLibrary(entries, 'BAY')[0].name, 'Bay');
  const protection = searchLibrary(entries, 'protection', { type: 'herb' });
  assert.ok(protection.length > 3);
  assert.ok(protection.every((e) => e.type === 'herb'));
  assert.deepEqual(searchLibrary(entries, 'basil zzzz'), []);
  assert.equal(searchLibrary(entries, '', { limit: 5 }).length, 5);
});

test('My Practice rows join the matching traditional entry by type and name', () => {
  const library = buildLibrary([
    row({ my_practice: { Uses: 'Money bowls', PairsWith: 'Cinnamon' } }),
    row({ entity_id: 'e2', name: 'Chamomile', my_practice: {} }),
    row({ entity_id: 'e3', name: 'Moon Water', type: 'apothecary', my_practice: { Notes: 'Charged at full moon' } }),
    row({ entity_id: 'e4', name: 'Empty thing', type: 'note', my_practice: {} }),
  ]);
  const basil = library.find((e) => e.id === 'traditional:herb:basil');
  assert.deepEqual(basil?.myPractice, { Uses: 'Money bowls', PairsWith: 'Cinnamon' });
  assert.deepEqual(basil?.practiceEntityIds, ['e1']);
  const moonWater = library.find((e) => e.id === 'practice:e3');
  assert.equal(moonWater?.category, 'Apothecary');
  assert.equal(library.some((e) => e.id === 'practice:e4'), false);
  assert.ok(searchLibrary(library, 'money', { mine: true }).some((e) => e.name === 'Basil'));
});

test('guest Library data from the website becomes practice rows', () => {
  const rows = guestPracticeRows({
    entities: { x: { id: 'x', name: 'Rosemary', type: 'herb', image: 'data:image/png;base64,AAA', myPractice: { Notes: 'Door wash' } } },
  });
  assert.deepEqual(rows[0], {
    entity_id: 'x',
    name: 'Rosemary',
    type: 'herb',
    image: null,
    my_practice: { Notes: 'Door wash' },
    community: null,
    updated_at: null,
  });
  assert.deepEqual(guestPracticeRows(null), []);
});

test('page fields follow reading order, split lists into chips and obey settings', () => {
  const basil = traditionalEntries().find((e) => e.id === 'traditional:herb:basil')!;
  const fields = layerFields(basil.traditional, 'traditional');
  assert.equal(fields[0].key, 'Overview');
  assert.equal(fields.some((f) => f.key === 'DisplayName' || f.key === 'tags'), false);
  assert.deepEqual(fields.find((f) => f.key === 'PairsWith')?.chips, ['Rosemary', 'cinnamon', 'bay', 'citrine']);

  const settings = normalizeSettings({ settings: { library_traditional_pairings: false, library_traditional_notes: false } });
  const filtered = layerFields(basil.traditional, 'traditional', settings);
  assert.equal(filtered.some((f) => f.key === 'PairsWith'), false);
  assert.equal(filtered.some((f) => f.key === 'Overview'), false); // unknown fields count as notes
  assert.ok(filtered.some((f) => f.key === 'Uses'));
});

test('layers follow the chosen order and hide disabled ones', () => {
  assert.deepEqual(visibleLayers(defaultSettings()), ['myPractice', 'traditional']);
  const settings = normalizeSettings({
    settings: { library_layer_order: 'community,myPractice,traditional', library_community_enabled: true },
  });
  assert.deepEqual(visibleLayers(settings), ['community', 'myPractice', 'traditional']);
});

test('names resolve to entries for pairing chips and ingredient suggestions', () => {
  const entries = traditionalEntries();
  assert.equal(findByName(entries, 'rosemary')?.id, 'traditional:herb:rosemary');
  assert.equal(findByName(entries, 'Citrine', 'crystal')?.type, 'crystal');
  assert.equal(findByName(entries, 'nothing like this'), null);
});

test('intro and correspondences read from the traditional layer', () => {
  const basil = traditionalEntries().find((e) => e.id === 'traditional:herb:basil')!;
  assert.match(entryIntro(basil), /^Traditionally associated with protection/);
  assert.deepEqual(correspondences(basil), [
    { label: 'Element', value: 'Fire' },
    { label: 'Planet', value: 'Mars' },
  ]);
});

test('grimoire shelves: My Practice and Traditional Information, as on the website', async () => {
  const { grimoireShelves, traditionalEntries, buildLibrary } = await import('../src/lib/library/model.ts');
  const { defaultSettings } = await import('../src/lib/settings/defaults.ts');
  const all = traditionalEntries();
  const plain = { ...defaultSettings(), library_path_mode: 'off' };
  const shelves = grimoireShelves(all, plain);
  // No practice notes yet and My path off: only the Traditional shelf.
  assert.deepEqual(shelves.map((s) => s.key), ['traditional']);
  const types = shelves[0].sections[0].groups.map((g) => g.type);
  assert.ok(types.includes('herb') && types.includes('crystal'));
  const herbs = shelves[0].sections[0].groups.find((g) => g.type === 'herb')!.entries.map((e) => e.name);
  assert.deepEqual(herbs, [...herbs].sort((a, b) => a.localeCompare(b)));

  const off = { ...defaultSettings(), library_traditional_enabled: false };
  assert.deepEqual(grimoireShelves(all, off), []);

  const searched = grimoireShelves(all, plain, 'rosemary');
  assert.ok(searched[0].sections[0].groups.every((g) => g.entries.length > 0));
  assert.ok(searched[0].sections[0].groups.flatMap((g) => g.entries).some((e) => /rosemary/i.test(e.name)));

  const mine = buildLibrary([
    { entity_id: 'herb_rosemary', name: 'Rosemary', type: 'herb', image: null, my_practice: { Notes: 'Smoke cleansing before rituals' }, community: null, updated_at: null },
  ]);
  const withPractice = grimoireShelves(mine, plain);
  assert.equal(withPractice[0].key, 'myPractice');
  assert.deepEqual(withPractice[0].sections[0].groups.map((g) => [g.type, g.entries.map((e) => e.name)]), [['herb', ['Rosemary']]]);
  const noPractice = { ...plain, library_myPractice_enabled: false };
  assert.deepEqual(grimoireShelves(mine, noPractice).map((s) => s.key), ['traditional']);
});

test('My Practice entries are written like the website’s New and Edit Entry forms', async () => {
  const { emptyPracticeInput, hasPracticeText, mergePractice, newPracticeRow, PRACTICE_FIELDS } = await import(
    '../src/lib/library/practiceModel.ts'
  );
  assert.deepEqual(
    PRACTICE_FIELDS.map((f) => f.key),
    ['Meaning', 'Uses', 'PairsWith', 'Substitutions', 'Notes'],
  );
  const input = { ...emptyPracticeInput(), Uses: '  Calm, sleep  ', Notes: 'Under my pillow' };
  assert.equal(hasPracticeText(emptyPracticeInput()), false);
  assert.equal(hasPracticeText(input), true);
  // Other keys survive, form fields are overwritten, empty ones are dropped.
  assert.deepEqual(mergePractice({ Meaning: 'old', ApothecaryItemId: 'a1', Tags: [] }, input), {
    ApothecaryItemId: 'a1',
    Uses: 'Calm, sleep',
    Notes: 'Under my pillow',
  });
  assert.deepEqual(emptyPracticeInput({ Uses: 'x', Other: 1 }).Uses, 'x');

  const row = newPracticeRow({ userId: 'u', entityId: 'e', name: ' Amethyst ', type: 'crystal', myPractice: { Uses: 'Calm' }, now: new Date('2026-10-10T00:00:00Z') });
  assert.deepEqual(row, {
    user_id: 'u',
    entity_id: 'e',
    name: 'Amethyst',
    type: 'crystal',
    image: null,
    my_practice: { Uses: 'Calm' },
    community: {},
    layout: {},
    updated_at: '2026-10-10T00:00:00.000Z',
  });
});

test('edits go to the row whose My Practice is shown (the newest)', async () => {
  const { buildLibrary } = await import('../src/lib/library/model.ts');
  const row = (entity_id: string, my_practice: Record<string, unknown>) => ({
    entity_id, name: 'Clear Quartz', type: 'crystal', image: null, my_practice, community: null, updated_at: null,
  });
  // Rows arrive newest first; an empty row in front doesn't take over.
  const quartz = buildLibrary([row('empty', {}), row('newest', { Uses: 'Amplify' }), row('older', { Uses: 'Old' })]).find(
    (e) => e.name === 'Clear Quartz' && e.traditional,
  )!;
  assert.equal(quartz.practiceSourceId, 'newest');
  assert.deepEqual(quartz.myPractice, { Uses: 'Amplify' });
  assert.deepEqual(quartz.practiceEntityIds, ['empty', 'newest', 'older']);

  const custom = buildLibrary([{ entity_id: 'c1', name: 'Grandma’s Salve', type: 'apothecary', image: null, my_practice: { Notes: 'n' }, community: null, updated_at: null }]);
  assert.equal(custom.find((e) => e.id === 'practice:c1')?.practiceSourceId, 'c1');
});

test('My path: follows the calendars, can be chosen, and puts your traditions first', async () => {
  const { myPath, entryTraditions, entryVisible, withoutHidden } = await import('../src/lib/library/traditions.ts');
  const { grimoireShelves } = await import('../src/lib/library/model.ts');
  const entries = traditionalEntries();
  const find = (name: string) => entries.find((e) => e.name === name)!;

  // The Wheel of the Year never makes a section: modern Pagan practice uses nearly everything.
  assert.deepEqual(myPath({ calendar_traditions: 'wheel_south,celtic,hellenic_monthly,custom' }).traditions, ['celtic', 'hellenic']);
  assert.deepEqual(myPath({ library_path_mode: 'custom', library_path: 'wheel,norse' }).traditions, ['norse']);
  assert.equal(grimoireShelves(entries, { calendar_traditions: 'wheel' } as never).some((s) => s.key === 'myPath'), false);
  assert.deepEqual(myPath({ library_path_mode: 'custom', library_path: 'roman,norse' }).traditions, ['norse', 'roman']);
  assert.deepEqual(myPath({ library_path_mode: 'off', calendar_traditions: 'celtic' }).traditions, []);
  // A hidden calendar is never part of the path.
  assert.deepEqual(myPath({ calendar_traditions: 'christian,celtic', calendar_hidden_traditions: 'christian' }).traditions, ['celtic']);

  assert.deepEqual(entryTraditions(find('Janus').traditional, 'deity'), ['roman']);
  assert.ok(entryTraditions(find('Jupiter').traditional, 'deity').includes('hellenic'), 'a god belongs to every tradition that honoured them');
  assert.ok(entryTraditions(find('Rowan').traditional, 'herb').includes('celtic'));

  const celtic = myPath({ calendar_traditions: 'celtic', library_path_other_deities: 'hide' });
  assert.equal(entryVisible(find('Janus'), celtic), false);
  assert.equal(entryVisible(find('Lugh'), celtic), true);
  assert.equal(entryVisible(find('Rosemary'), celtic), true, 'herbs are never hidden');

  const shelves = grimoireShelves(entries, { calendar_traditions: 'celtic' } as never);
  const path = shelves.find((s) => s.key === 'myPath')!;
  const celticSection = path.sections.find((s) => s.key === 'path:celtic')!;
  const celticNames = celticSection.groups.flatMap((g) => g.entries.map((e) => e.name));
  // The tradition's deities, what's tagged with it, and what its deities name (Brigid → white candle, rowan…).
  assert.ok(celticNames.includes('Brigid') && celticNames.includes('Rowan'));
  assert.ok(celticNames.includes('White Candle'));
  assert.ok(!celticNames.includes('Janus'));
  // Everything else holds what My Path doesn't.
  const rest = shelves.find((s) => s.key === 'traditional')!;
  assert.equal(rest.title, 'Everything Else');
  const restNames = rest.sections[0].groups.flatMap((g) => g.entries.map((e) => e.name));
  assert.ok(restNames.includes('Janus') && !restNames.includes('Brigid'));
  // Every group has its own key, so opening one never opens another.
  const keys = shelves.flatMap((s) => s.sections.flatMap((section) => section.groups.map((g) => `${s.key}:${g.key}`)));
  assert.equal(new Set(keys).size, keys.length);

  const hidden = withoutHidden({ Traditions: 'Celtic, Christian', TraditionNotes: 'Woven at Imbolc in Celtic lands. Blessed in church on Christmas Eve.' }, ['christian']);
  assert.equal(hidden.Traditions, 'Celtic');
  assert.equal(hidden.TraditionNotes, 'Woven at Imbolc in Celtic lands.');

  // Notes written a paragraph per tradition lose just the hidden tradition's paragraph.
  const perTradition = withoutHidden(
    { Traditions: 'Norse, Christian, Slavic', TraditionNotes: 'Norse: Chewed as kvann.\n\nChristian: Named for St Michael.\n\nSlavic: Hung over doorways.\n\nFolk & wider practice: Candied in cakes.' },
    ['christian'],
  );
  assert.equal(perTradition.Traditions, 'Norse, Slavic');
  assert.equal(perTradition.TraditionNotes, 'Norse: Chewed as kvann.\n\nSlavic: Hung over doorways.\n\nFolk & wider practice: Candied in cakes.');

  // A herb tagged only with a hidden tradition still shows; a deity tagged only with it does not.
  const noChristian = myPath({ calendar_hidden_traditions: 'christian' });
  const onlyChristian = (type: string) => ({ ...find('Rosemary'), type, traditional: { Traditions: 'Christian' } }) as never;
  assert.equal(entryVisible(onlyChristian('herb'), noChristian), true);
  assert.equal(entryVisible(onlyChristian('deity'), noChristian), false);
});

test('a hidden tradition is gone from the whole Library: its deities, labels and every mention', async () => {
  const { hideTraditions } = await import('../src/lib/library/traditions.ts');
  const base = traditionalEntries().find((e) => e.name === 'Rosemary')!;
  const herb = {
    ...base,
    traditional: {
      Traditions: 'Norse, Christian',
      TraditionNotes: 'Norse: Hung at doorways.\n\nChristian: Laid on the altar at Christmas.',
      Overview: 'A hardy herb that lent its scent to every room. Carried in church processions on Palm Sunday. Its oil soothes.',
      Uses: 'protection, Christmas garlands, cleansing',
      Folklore: ['Burned at Candlemas', 'Kept in the hearth'],
      Related: "Often paired with St John's wort. Blessed on St Michael's day.",
    },
  };
  const saint = { ...base, id: 'traditional:deity:saint', name: 'A Saint', type: 'deity', traditional: { Traditions: 'Christian' } };
  const brigid = { ...base, id: 'traditional:deity:brigid', name: 'Brigid', type: 'deity', traditional: { Traditions: 'Celtic, Christian', TraditionNotes: 'Celtic: Goddess of the hearth.\n\nChristian: Honoured as St Brigid.' } };

  const shown = hideTraditions([herb, saint, brigid] as never[], ['christian']) as typeof herb[];
  assert.deepEqual(shown.map((e) => e.name), ['Rosemary', 'Brigid'], 'a Christian-only figure is gone, a goddess with a Christian side stays');
  const t = shown[0].traditional;
  assert.equal(t.Traditions, 'Norse');
  assert.equal(t.TraditionNotes, 'Norse: Hung at doorways.');
  assert.equal(t.Overview, 'A hardy herb that lent its scent to every room. Its oil soothes.', '"lent" the verb stays');
  assert.equal(t.Uses, 'protection, cleansing');
  assert.deepEqual(t.Folklore, ['Kept in the hearth']);
  assert.equal(t.Related, "Often paired with St John's wort.", 'the plant St John’s wort is not a saint');
  assert.equal((shown[1].traditional as unknown as Record<string, string>).TraditionNotes, 'Celtic: Goddess of the hearth.');
  // Nothing hidden: the Library is untouched.
  assert.equal(hideTraditions([herb] as never[], [])[0], herb);
});

test('a deity you work with from outside your path gets its own section with what goes with them', async () => {
  const { grimoireShelves, buildLibrary } = await import('../src/lib/library/model.ts');
  const entries = buildLibrary([
    { entity_id: 'deity_freyja', name: 'Freyja', type: 'deity', image: null, my_practice: { Notes: 'Saturday offerings' }, community: null, updated_at: null },
  ]);
  const shelves = grimoireShelves(entries, { calendar_traditions: 'celtic' } as never);
  const piece = shelves.find((s) => s.key === 'myPath')!.sections.find((s) => s.key.startsWith('piece:'))!;
  assert.equal(piece.title, 'Freyja');
  assert.match(piece.note!, /Norse/);
  const names = piece.groups.flatMap((g) => g.entries.map((e) => e.name));
  assert.ok(names.includes('Freyja'));
  assert.ok(names.length > 1, 'brings her herbs, crystals and candles');
  // The rest of Norse stays under Everything Else.
  const rest = shelves.find((s) => s.key === 'traditional')!.sections[0].groups.flatMap((g) => g.entries.map((e) => e.name));
  assert.ok(rest.includes('Thor'));
});
