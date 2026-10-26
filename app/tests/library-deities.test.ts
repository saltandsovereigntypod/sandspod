import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

import { ALTAR_ARTWORK } from '../src/lib/altar/artworkData.ts';
import { builtInCabinet } from '../src/lib/altar/cabinet.ts';
import { SEASONAL_OBJECTS } from '../src/lib/altar/seasonal.ts';
import { shrineAltar } from '../src/lib/altar/tonight.ts';
import { holyPage } from '../src/lib/holy/index.ts';
import { findByName, searchLibrary, traditionalEntries } from '../src/lib/library/model.ts';
import { entryTraditions, PATH_TRADITIONS } from '../src/lib/library/traditions.ts';
import { TRADITIONAL_LIBRARY } from '../src/lib/library/traditionalData.ts';
import { ruleDates, upcomingSacred } from '../src/lib/patron/days.ts';
import { DEITY_DEVOTIONS } from '../src/lib/patron/devotions.ts';

type Deity = Record<string, string | string[]>;
const deities = TRADITIONAL_LIBRARY.deity as unknown as Record<string, Deity>;

// The deities the festivals name that had no Library entry, by pantheon. None has a statue picture yet.
const NEW_DEITIES: Record<string, string[]> = {
  Roman: ['saturn', 'flora', 'neptune', 'faunus', 'sol'],
  Greek: ['zeus', 'hera', 'poseidon'],
  Egyptian: ['horus', 'set', 'nephthys', 'maat'],
  Hindu: ['lakshmi', 'shiva', 'saraswati', 'kali', 'krishna'],
};
const ALL_NEW = Object.values(NEW_DEITIES).flat();
// The rest of the gods people ask for, by pantheon. None has a statue picture either.
const MORE_DEITIES: Record<string, string[]> = {
  Greek: ['ares', 'hephaestus', 'pan', 'gaia', 'helios', 'eros', 'asclepius'],
  Roman: ['fortuna', 'bacchus', 'pluto', 'proserpina', 'vulcan', 'pomona', 'bona_dea', 'lares_penates', 'mithras'],
  Egyptian: ['amun', 'ptah', 'bes', 'nut', 'neith', 'sobek', 'khonsu', 'taweret'],
  Norse: ['njord', 'heimdall', 'sif', 'bragi', 'ullr', 'eir', 'sunna', 'mani', 'norns'],
  'Celtic (Irish)': ['danu', 'aine', 'aengus', 'boann', 'ogma', 'nuada', 'cailleach'],
  'Celtic (Welsh)': ['gwydion', 'blodeuwedd', 'lleu', 'bran'],
  'Celtic (Gaulish)': ['taranis', 'sucellos', 'belenus'],
  'Celtic (British)': ['sulis'],
  Slavic: ['svarog', 'stribog', 'jarilo', 'zorya', 'rod'],
};
const ALL_MORE = Object.values(MORE_DEITIES).flat();
const text = (d: Deity, ...fields: string[]) => fields.map((f) => String(d[f] ?? '')).join(' ');

test('every new deity is in the Library with every field the others have', () => {
  const older = Object.entries(deities).filter(([key]) => !ALL_NEW.includes(key) && key !== 'lilith');
  const fields = new Set(older.flatMap(([, d]) => Object.keys(d)));
  for (const [pantheon, keys] of Object.entries(NEW_DEITIES)) {
    for (const key of keys) {
      const d = deities[key];
      assert.ok(d, `${key} is missing`);
      for (const field of fields) {
        const value = d[field];
        assert.ok(Array.isArray(value) ? value.length : String(value ?? '').trim(), `${key} has no ${field}`);
      }
      assert.deepEqual(Object.keys(d).filter((f) => !fields.has(f)), [], `${key} has fields the others don't`);
      assert.equal(d.Category, 'Deity');
      assert.equal(d.Pantheon, pantheon, key);
      assert.match(String(d.DevotionalApproach), /^Start here: /, key);
      assert.equal((d.tags as string[]).length, 6, `${key} tags`);
      assert.ok(String(d.Overview).length > 120 && String(d.CulturalContext).length > 120, key);
      assert.doesNotMatch(JSON.stringify(d), /!/, `${key}: no exclamation marks`);
    }
  }
  assert.equal(Object.keys(deities).length, 61 + ALL_NEW.length + ALL_MORE.length);
});

test('deity ids are unique, in the source as well as the data', () => {
  // A repeated key in the website's object literal would silently replace the first entry.
  const source = readFileSync(new URL('../../js/traditional-library.js', import.meta.url), 'utf8');
  const block = source.slice(source.indexOf('\n    deity: {'), source.indexOf('\n    tool: {'));
  const keys = [...block.matchAll(/^ {8}([a-z_]+): \{$/gm)].map((m) => m[1]);
  assert.equal(keys.length, Object.keys(deities).length);
  assert.equal(new Set(keys).size, keys.length);
  const names = Object.values(deities).map((d) => String(d.DisplayName).toLowerCase());
  assert.equal(new Set(names).size, names.length);
  const ids = traditionalEntries().map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('the app and the website hold the same entries', () => {
  const source = readFileSync(new URL('../../js/traditional-library.js', import.meta.url), 'utf8');
  const context: { TraditionalLibrary?: { deity: Record<string, Deity> } } = {};
  vm.runInNewContext(`${source}\nthis.TraditionalLibrary = TraditionalLibrary;`, context);
  for (const key of ALL_NEW) assert.deepEqual(JSON.parse(JSON.stringify(context.TraditionalLibrary!.deity[key])), deities[key], key);
});

test('each tradition named has its own note, and living religions are framed as living', () => {
  const known = new Set(PATH_TRADITIONS.map((t) => t.name));
  for (const key of ALL_NEW) {
    const d = deities[key];
    const listed = String(d.Traditions).split(',').map((t) => t.trim());
    for (const name of listed) assert.ok(known.has(name), `${key}: ${name}`);
    assert.equal(entryTraditions(d, 'deity').length, listed.length, key);
    const labels = String(d.TraditionNotes).split('\n\n').map((p) => p.slice(0, p.indexOf(':')));
    assert.deepEqual(labels, listed, key);
    assert.match(String(d.CulturalContext), /living/, key);
  }
  for (const key of NEW_DEITIES.Hindu) {
    const d = deities[key];
    assert.equal(d.Traditions, 'Hindu');
    assert.match(String(d.TraditionalWarnings), /living deity in Hindu religious practice/, key);
    assert.match(String(d.DevotionalApproach), /learn about (him|her) from Hindu.*sources/, key);
    assert.match(String(d.CulturalContext), /Hindu teacher/, key);
    // Devotion, not magic: no spellwork in how they are honoured.
    assert.doesNotMatch(text(d, 'DevotionalApproach', 'OfferingNotes', 'AltarIdeas', 'TraditionNotes', 'Overview'), /spell|magic|initiat/i, key);
    assert.match(String(d.AltarIdeas), /murti/, key);
  }
  // Kali in her own tradition's terms, not the Western "dark goddess".
  assert.match(text(deities.kali, 'TraditionalWarnings'), /not a ‘dark goddess’/);
  assert.match(text(deities.kali, 'Overview', 'CulturalContext', 'TraditionalMeaning'), /Divine Mother/);
  assert.match(text(deities.kali, 'CulturalContext'), /Ramakrishna/);
  // Set's history, both sides.
  assert.match(text(deities.set, 'Overview'), /Ra’s sun boat/);
  assert.match(text(deities.set, 'CulturalContext'), /later periods/);
  assert.match(text(deities.set, 'TraditionalWarnings'), /not the Christian Satan/);
});

test('the festivals that name them link to their pages', () => {
  const entries = traditionalEntries();
  const named: [string, string][] = [
    ['roman-saturnalia', 'saturn'],
    ['roman-floralia', 'flora'],
    ['roman-neptunalia', 'neptune'],
    ['roman-lupercalia', 'faunus'],
    ['roman-sol_invictus', 'sol'],
    ['attic-poseidon-theseus', 'poseidon'],
    ['kemetic-birth-horus', 'horus'],
    ['kemetic-birth-set', 'set'],
    ['kemetic-birth-nephthys', 'nephthys'],
    ['hindu-diwali', 'lakshmi'],
    ['hindu-diwali', 'kali'],
    ['hindu-maha-shivaratri', 'shiva'],
    ['hindu-navaratri', 'saraswati'],
    ['hindu-holi', 'krishna'],
  ];
  for (const [ref, key] of named) {
    const page = holyPage(ref);
    assert.ok(page, ref);
    const linked = (page.correspondences.deities ?? []).map((name) => findByName(entries, name)?.id);
    assert.ok(linked.includes(`traditional:deity:${key}`), `${ref} → ${key}`);
  }
  // The seasonal things kept for their festivals name them, so a search for one finds them.
  const gods = new Set(SEASONAL_OBJECTS.flatMap((o) => o.deities ?? []));
  for (const name of ['Saturn', 'Flora', 'Neptune', 'Faunus', 'Sol', 'Zeus', 'Horus', 'Set', 'Nephthys', 'Lakshmi', 'Shiva', 'Krishna', 'Kali', 'Saraswati']) {
    assert.ok(gods.has(name), name);
  }
});

test('search finds them by name, other names and what they keep', () => {
  const entries = traditionalEntries();
  for (const key of ALL_NEW) {
    const name = String(deities[key].DisplayName);
    assert.equal(searchLibrary(entries, name)[0]?.id, `traditional:deity:${key}`, name);
    assert.equal(findByName(entries, name)?.id, `traditional:deity:${key}`, name);
  }
  const first = (q: string) => searchLibrary(entries, q, { type: 'deity' }).map((e) => e.id.split(':')[2]);
  assert.ok(first('Sol Invictus').includes('sol'));
  assert.ok(first("Ma’at").includes('maat') || first('maat').includes('maat'));
  assert.ok(first('Nebet-Het').includes('nephthys'));
  assert.ok(first('saturnalia').includes('saturn'));
  assert.ok(first('Shivaratri').includes('shiva'));
  assert.ok(first('Janmashtami').includes('krishna'));
  assert.ok(first('Vasant Panchami').includes('saraswati'));
  assert.ok(first('Diwali').includes('lakshmi'));
  assert.ok(first('epagomenal').includes('horus'));
});

test('without a statue picture: no cabinet tile, no broken picture, and a shrine that still sets', () => {
  const pictured = new Set(Object.values(ALTAR_ARTWORK.items.deities ?? {}).flatMap((d: unknown) => (d as { forms?: { deity?: string }[] }).forms?.map((f) => f.deity) ?? []));
  for (const key of ALL_NEW) {
    // The Library entries carry no picture of their own.
    assert.equal(deities[key].image, undefined, key);
    assert.ok(!pictured.has(key), `${key} has no statue yet`);
    // The cabinet's Deities drawer only holds deities it has pictures for.
    assert.ok(!builtInCabinet.some((i) => i.category === 'deities' && i.forms?.some((f) => f.deity === key)), `${key} in the cabinet`);
    // Their shrine centres on an offering bowl instead of a statue, and everything set out has a picture.
    const shrine = shrineAltar(key, String(deities[key].DisplayName), deities[key] as Record<string, unknown>, new Date(2026, 9, 26));
    assert.ok(shrine.doc.objects.length >= 8, key);
    assert.ok(!shrine.doc.objects.some((o) => o.type === 'deity'), key);
    for (const o of shrine.doc.objects) assert.ok(String(o.imagePath ?? '').trim(), `${key}: ${o.label}`);
  }
  // A deity with a statue still gets it.
  const osiris = shrineAltar('osiris', 'Osiris', deities.osiris as Record<string, unknown>, new Date(2026, 9, 26));
  assert.ok(osiris.doc.objects.some((o) => o.type === 'deity' && o.deity === 'osiris'));
});

test('each has sacred days and devotions for the patron page', () => {
  const keys = new Set(DEITY_DEVOTIONS.map((d) => d.key));
  assert.equal(keys.size, DEITY_DEVOTIONS.length);
  for (const key of keys) assert.ok(deities[key], `${key} has a devotion but no Library entry`);
  for (const key of Object.keys(deities)) assert.ok(keys.has(key), `${key} has no devotion`);
  const from = new Date(2026, 0, 1);
  for (const key of ALL_NEW) {
    const d = DEITY_DEVOTIONS.find((x) => x.key === key)!;
    assert.ok(upcomingSacred(d, from, 400).length > 0, key);
    assert.ok(d.sources.length > 0, key);
  }
  // A day of one Attic month falls once a year (or twice, in a 400-day window), not every month.
  const gamelion = ruleDates({ kind: 'attic', month: 'Gamelion', day: 27 }, from, 365);
  assert.equal(gamelion.length, 1);
  assert.ok(gamelion[0].getMonth() <= 1, String(gamelion[0]));
  assert.ok(ruleDates({ kind: 'attic', day: 8 }, from, 365).length >= 12);
});

// ─── The rest of the gods people ask for ────────────────────────────────

// Festival pages that name them, so each links to its Library page.
const MORE_LINKS: [string, string][] = [
  ['hellenic-panathenaia', 'hephaestus'],
  ['hellenic-pyanepsia', 'helios'],
  ['attic-tetras', 'eros'],
  ['roman-fors-fortuna', 'fortuna'],
  ['roman-liberalia', 'bacchus'],
  ['roman-cerialia', 'proserpina'],
  ['roman-volcanalia', 'vulcan'],
  ['roman-compitalia', 'lares_penates'],
  ['roman-caristia', 'lares_penates'],
  ['kemetic-opet', 'amun'],
  ['kemetic-opet', 'khonsu'],
  ['kemetic-valley', 'amun'],
  ['kemetic-birth-osiris', 'nut'],
  ['norse-jol', 'njord'],
  ['icelandic-heyannir', 'sif'],
  ['icelandic-tvimanudur', 'sif'],
  ['icelandic-aukanaetur', 'sunna'],
  ['icelandic-aukanaetur', 'mani'],
  ['celtic-samhain_gaelic', 'cailleach'],
  ['celtic-samhain_gaelic', 'aengus'],
  ['wheel-yule', 'aengus'],
  ['wheel-yule', 'boann'],
  ['celtic-lughnasadh', 'lleu'],
  ['slavic-dziady', 'rod'],
  ['slavic-koliada', 'svarog'],
];
// Seasonal things kept for festivals that honour them.
const MORE_SEASONAL: string[] = ['Lares', 'Njord'];
// Other names, festivals and things they keep, each finding them.
const MORE_SEARCH: [string, string][] = [
  ['Enyalios', 'ares'],
  ['Chalkeia', 'hephaestus'],
  ['syrinx', 'pan'],
  ['Kourotrophos', 'gaia'],
  ['Phaethon', 'helios'],
  ['Psyche', 'eros'],
  ['Epidaurus', 'asclepius'],
  ['Praeneste', 'fortuna'],
  ['Liber', 'bacchus'],
  ['Liberalia', 'bacchus'],
  ['Dis Pater', 'pluto'],
  ['Enna', 'proserpina'],
  ['Volcanalia', 'vulcan'],
  ['Vertumnus', 'pomona'],
  ['Good Goddess', 'bona_dea'],
  ['lararium', 'lares_penates'],
  ['Lares', 'lares_penates'],
  ['tauroctony', 'mithras'],
  ['Karnak', 'amun'],
  ['Memphis', 'ptah'],
  ['Sokar', 'ptah'],
  ['Saqqara', 'bes'],
  ['Geb', 'nut'],
  ['Sais', 'neith'],
  ['Kom Ombo', 'sobek'],
  ['Bentresh', 'khonsu'],
  ['hippopotamus', 'taweret'],
  ['Skadi', 'njord'],
  ['Gjallarhorn', 'heimdall'],
  ['Bifröst', 'heimdall'],
  ['golden hair', 'sif'],
  ['bragarfull', 'bragi'],
  ['skiing', 'ullr'],
  ['Lyfjaberg', 'eir'],
  ['Sunna', 'sunna'],
  ['Hjúki', 'mani'],
  ['Urðr', 'norns'],
  ['Skuld', 'norns'],
  ['Anu', 'danu'],
  ['Tuatha', 'danu'],
  ['Knockainy', 'aine'],
  ['Caer', 'aengus'],
  ['Newgrange', 'aengus'],
  ['Segais', 'boann'],
  ['ogham', 'ogma'],
  ['silver arm', 'nuada'],
  ['Nodens', 'nuada'],
  ['Beare', 'cailleach'],
  ['Mabinogi', 'gwydion'],
  ['Flower-face', 'blodeuwedd'],
  ['Lleu', 'lleu'],
  ['Bendigeidfran', 'bran'],
  ['Thunderer', 'taranis'],
  ['Nantosuelta', 'sucellos'],
  ['Aquileia', 'belenus'],
  ['Aquae Sulis', 'sulis'],
  ['Sulis Minerva', 'sulis'],
  ['Svarozhich', 'svarog'],
  ['Igor', 'stribog'],
  ['Yarilo', 'jarilo'],
  ['dawn', 'zorya'],
  ['Rozhanitsy', 'rod'],
];
// Living religions: devotion, not magic.
const LIVING_PANTHEONS = ['Hindu', 'Shinto', 'Chinese'];

test('the rest of the gods: every field, in the right pantheon, with no picture of their own', () => {
  const older = Object.entries(deities).filter(([key]) => !ALL_NEW.includes(key) && !ALL_MORE.includes(key) && key !== 'lilith');
  const fields = new Set(older.flatMap(([, d]) => Object.keys(d)));
  for (const [pantheon, keys] of Object.entries(MORE_DEITIES)) {
    for (const key of keys) {
      const d = deities[key];
      assert.ok(d, `${key} is missing`);
      for (const field of fields) {
        const value = d[field];
        assert.ok(Array.isArray(value) ? value.length : String(value ?? '').trim(), `${key} has no ${field}`);
      }
      assert.deepEqual(Object.keys(d).filter((f) => !fields.has(f)), [], `${key} has fields the others don't`);
      assert.equal(d.Category, 'Deity');
      assert.equal(d.Pantheon, pantheon, key);
      assert.match(String(d.DevotionalApproach), /^Start here: /, key);
      assert.equal((d.tags as string[]).length, 6, `${key} tags`);
      assert.ok(String(d.Overview).length > 120 && String(d.CulturalContext).length > 120, key);
      assert.doesNotMatch(JSON.stringify(d), /!/, `${key}: no exclamation marks`);
      assert.equal(d.image, undefined, key);
    }
  }
  assert.equal(new Set(ALL_MORE).size, ALL_MORE.length);
  for (const key of ALL_MORE) assert.ok(!ALL_NEW.includes(key), key);
});

test('the rest of the gods: the app holds what the website holds', () => {
  const source = readFileSync(new URL('../../js/traditional-library.js', import.meta.url), 'utf8');
  const context: { TraditionalLibrary?: { deity: Record<string, Deity> } } = {};
  vm.runInNewContext(`${source}\nthis.TraditionalLibrary = TraditionalLibrary;`, context);
  for (const key of ALL_MORE) assert.deepEqual(JSON.parse(JSON.stringify(context.TraditionalLibrary!.deity[key])), deities[key], key);
});

test('the rest of the gods: a note for each tradition named, and living religions honoured as living', () => {
  const known = new Set(PATH_TRADITIONS.map((t) => t.name));
  for (const key of ALL_MORE) {
    const d = deities[key];
    const listed = String(d.Traditions).split(',').map((t) => t.trim());
    for (const name of listed) assert.ok(known.has(name), `${key}: ${name}`);
    assert.equal(entryTraditions(d, 'deity').length, listed.length, key);
    const labels = String(d.TraditionNotes).split('\n\n').map((p) => p.slice(0, p.indexOf(':')));
    assert.deepEqual(labels, listed, key);
    assert.match(String(d.CulturalContext), /living/, key);
  }
  for (const key of ALL_MORE.filter((k) => LIVING_PANTHEONS.includes(String(deities[k].Pantheon)))) {
    const d = deities[key];
    // Devotion, not magic: no spellwork or claims of initiation in how they are honoured.
    assert.doesNotMatch(text(d, 'DevotionalApproach', 'OfferingNotes', 'AltarIdeas', 'TraditionNotes', 'Overview', 'TraditionalMeaning'), /spell|magic|initiat|working/i, key);
  }
  for (const key of MORE_DEITIES.Hindu ?? []) {
    const d = deities[key];
    assert.equal(d.Traditions, 'Hindu');
    assert.match(String(d.TraditionalWarnings), /living deity in Hindu religious practice/, key);
    assert.match(String(d.DevotionalApproach), /learn about (him|her) from Hindu.*sources/, key);
    assert.match(String(d.CulturalContext), /Hindu teacher/, key);
    assert.match(String(d.AltarIdeas), /murti/, key);
  }
});

test('the rest of the gods: festival pages link to them and search finds them', () => {
  const entries = traditionalEntries();
  for (const [ref, key] of MORE_LINKS) {
    const page = holyPage(ref);
    assert.ok(page, ref);
    const linked = (page.correspondences.deities ?? []).map((name) => findByName(entries, name)?.id);
    assert.ok(linked.includes(`traditional:deity:${key}`), `${ref} → ${key}`);
  }
  const gods = new Set(SEASONAL_OBJECTS.flatMap((o) => o.deities ?? []));
  for (const name of MORE_SEASONAL) assert.ok(gods.has(name), name);
  for (const key of ALL_MORE) {
    const name = String(deities[key].DisplayName);
    assert.equal(searchLibrary(entries, name)[0]?.id, `traditional:deity:${key}`, name);
    assert.equal(findByName(entries, name)?.id, `traditional:deity:${key}`, name);
  }
  for (const [query, key] of MORE_SEARCH) {
    assert.ok(searchLibrary(entries, query, { type: 'deity' }).some((e) => e.id === `traditional:deity:${key}`), `${query} → ${key}`);
  }
});

test('the rest of the gods: no cabinet tile or broken picture, and a shrine that still sets', () => {
  const pictured = new Set(Object.values(ALTAR_ARTWORK.items.deities ?? {}).flatMap((d: unknown) => (d as { forms?: { deity?: string }[] }).forms?.map((f) => f.deity) ?? []));
  for (const key of ALL_MORE) {
    assert.ok(!pictured.has(key), `${key} has no statue yet`);
    assert.ok(!builtInCabinet.some((i) => i.category === 'deities' && i.forms?.some((f) => f.deity === key)), `${key} in the cabinet`);
    const shrine = shrineAltar(key, String(deities[key].DisplayName), deities[key] as Record<string, unknown>, new Date(2026, 9, 26));
    assert.ok(shrine.doc.objects.length >= 8, key);
    assert.ok(!shrine.doc.objects.some((o) => o.type === 'deity'), key);
    for (const o of shrine.doc.objects) assert.ok(String(o.imagePath ?? '').trim(), `${key}: ${o.label}`);
  }
});

test('the rest of the gods: sacred days and devotions for the patron page', () => {
  const from = new Date(2026, 0, 1);
  for (const key of ALL_MORE) {
    const d = DEITY_DEVOTIONS.find((x) => x.key === key);
    assert.ok(d, `${key} has no devotion`);
    assert.ok(upcomingSacred(d, from, 400).length > 0, key);
    assert.ok(d.sources.length > 0 && d.devotions.length >= 4 && d.approach.trim(), key);
    for (const day of d.sacred) assert.ok(day.why.trim() && day.name.trim(), key);
  }
});
