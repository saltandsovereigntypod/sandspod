// To tend: one list of everything you tend, from your altars, covens,
// journeys and journal, due today then ongoing; rhythms (daily, weekly, by
// the moon, until a day) and their reminders; endings kept in the Grimoire;
// tending your own altar from the list; and "Find mine" on an altar, which
// never names what it shouldn't.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import { appHistoryOf, isLit, lightCandle, setAppState } from '../src/lib/altar/livingState.ts';
import { offeringOf, setOffering } from '../src/lib/altar/offerings.ts';
import { newPetition, petitionObject, type Petition } from '../src/lib/altar/petitions.ts';
import { pottedCabinetItems, pottedOf, setPlantDetails } from '../src/lib/altar/pottedPlants.ts';
import { documentFromAltar, emptyDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedAltar, SavedObject } from '../src/lib/altar/types.ts';
import { contributionLabel } from '../src/lib/covens/contributions.ts';
import { tendPetitionAltar } from '../src/lib/covens/petitionAltar.ts';
import { offerPaper } from '../src/lib/covens/ritualAltar.ts';
import { planReminders } from '../src/lib/reminders/plan.ts';
import { DEFAULT_SETTINGS } from '../src/lib/reminders/schedule.ts';
import { altarListing, mineKeys, mineLine, tendAltar } from '../src/lib/tend/altar.ts';
import { altarTendables, covenTendables, gatherTendables, journeyTendables, lookBackTendables, type CovenPart } from '../src/lib/tend/gather.ts';
import {
  dayKey,
  defaultRhythm,
  dueOf,
  endingPage,
  filterList,
  moonDays,
  newRecord,
  normalizeRecord,
  recordEnded,
  recordTended,
  tendList,
  tendReminders,
  todaySummary,
  untilChoices,
  type Tendable,
  type TendRecord,
} from '../src/lib/tend/model.ts';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const NOW = new Date(2026, 9, 27, 10); // 27 October 2026, 10am local
const iso = (d: Date) => d.toISOString();

const place = (id: string, formId?: string, when = iso(NOW)): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === id);
  assert.ok(item, id);
  const form = formId ? item.forms.find((f) => f.form === formId) : item.forms[0];
  assert.ok(form);
  return objectFromForm(item, form, [], when);
};

const item = (over: Partial<Tendable> = {}): Tendable => ({
  key: 'petition:a',
  kind: 'petition',
  group: 'altar',
  title: 'For a new home',
  detail: '',
  source: 'Your altar · Hearth',
  dueAt: null,
  tendedAt: null,
  actions: ['word'],
  ends: ['burned'],
  private: true,
  keywords: [],
  href: '/altar/a',
  webHref: '/altar/',
  ref: {},
  ...over,
});

// ── Rhythms ──────────────────────────────────────────────────────────────

test('each kind keeps a sensible rhythm until one is chosen', () => {
  assert.equal(defaultRhythm('petition').kind, 'daily');
  assert.equal(defaultRhythm('coven-petition').kind, 'daily');
  assert.equal(defaultRhythm('contribution').kind, 'weekly');
  assert.equal(defaultRhythm('plant').kind, 'asks');
  assert.equal(defaultRhythm('lookback').kind, 'asks');
});

test('daily: due until tended today, then again tomorrow', () => {
  const it = item();
  assert.equal(dueOf(it, null, NOW).state, 'due');
  const tended = recordTended(newRecord(it), new Date(2026, 9, 27, 8), 'Lit for it this morning');
  const due = dueOf(it, tended, NOW);
  assert.equal(due.state, 'later');
  assert.equal(due.at, new Date(2026, 9, 28).getTime());
  assert.equal(tended.words[0].text, 'Lit for it this morning');
  // Tended at its source counts too.
  assert.equal(dueOf({ ...it, tendedAt: new Date(2026, 9, 27, 7).getTime() }, null, NOW).state, 'later');
});

test('weekly: a week from the last tending', () => {
  const it = item({ kind: 'contribution', key: 'contribution:c1' });
  const record = { ...newRecord(it), tendedAt: iso(new Date(2026, 9, 24, 20)) };
  const due = dueOf(it, record, NOW);
  assert.equal(due.state, 'later');
  assert.equal(due.at, new Date(2026, 9, 31).getTime());
  assert.equal(dueOf(it, { ...record, tendedAt: iso(new Date(2026, 9, 19)) }, NOW).state, 'due');
});

test('by the moon: due on the moon’s day, and the dark moon is the day before the new', () => {
  const full = moonDays('full', new Date(2026, 9, 1), 60);
  const news = moonDays('new', new Date(2026, 9, 1), 60);
  const dark = moonDays('dark', new Date(2026, 9, 1), 60);
  assert.ok(full.length >= 2 && news.length >= 2);
  assert.equal(dark[0].getTime(), new Date(news[0].getFullYear(), news[0].getMonth(), news[0].getDate() - 1).getTime());
  const it = item();
  const record = { ...newRecord(it), rhythm: { kind: 'moon' as const, moon: 'full' as const } };
  const onFull = new Date(full[0].getFullYear(), full[0].getMonth(), full[0].getDate(), 19);
  assert.equal(dueOf(it, record, onFull).state, 'due');
  const before = new Date(onFull.getTime() - 3 * DAY);
  const due = dueOf(it, record, before);
  assert.equal(due.state, 'later');
  assert.equal(due.at, new Date(onFull.getFullYear(), onFull.getMonth(), onFull.getDate()).getTime());
  assert.match(due.line, /full moon/);
});

test('until a day: every day until then, and on the day, time to end it', () => {
  const it = item();
  const record = { ...newRecord(it), rhythm: { kind: 'until' as const, until: '2026-11-08', untilWhy: 'The Deipnon' } };
  const before = dueOf(it, record, NOW);
  assert.equal(before.state, 'due');
  assert.match(before.line, /until The Deipnon/);
  const after = dueOf(it, record, new Date(2026, 10, 8, 9));
  assert.equal(after.state, 'ending');
  assert.match(after.line, /its day has come/);
  // The next Deipnon, dark, new and full moons are offered, soonest first.
  const choices = untilChoices(NOW);
  assert.ok(choices.some((c) => c.id === 'deipnon'));
  assert.deepEqual([...choices].map((c) => c.date), [...choices].map((c) => c.date).sort());
});

test('as it asks: its own day (a plant’s thirst, a look-back), or nothing', () => {
  const plant = item({ kind: 'plant', key: 'plant:a:p', dueAt: new Date(2026, 9, 27).getTime() });
  assert.equal(dueOf(plant, null, NOW).state, 'due');
  assert.equal(dueOf({ ...plant, dueAt: new Date(2026, 9, 30).getTime() }, null, NOW).state, 'later');
  assert.equal(dueOf({ ...plant, dueAt: null }, null, NOW).state, 'resting');
});

// ── The list ─────────────────────────────────────────────────────────────

test('the list: due today first, the rest ongoing, ended ones gone, one of each', () => {
  const a = item({ key: 'petition:a', title: 'A' });
  const b = item({ key: 'plant:x', kind: 'plant', title: 'Basil', dueAt: new Date(2026, 9, 29).getTime() });
  const c = item({ key: 'coven-petition:c', kind: 'coven-petition', title: 'For Rowan’s mother', group: 'coven' });
  const d = item({ key: 'candle:d', kind: 'candle', title: 'Brigid candle', dueAt: null });
  const ended = recordEnded(newRecord(c), 'answered', 'She is well', NOW);
  const list = tendList([a, b, c, d, a], [ended], NOW);
  assert.deepEqual(list.today.map((i) => i.key), ['petition:a']);
  assert.deepEqual(list.ongoing.map((i) => i.key), ['plant:x', 'candle:d']);
  const summary = todaySummary(list);
  assert.equal(summary.count, 1);
  assert.equal(summary.line, '1 petition wants tending today.');
  assert.match(todaySummary({ today: [], ongoing: list.ongoing }).line, /Nothing wants tending today. 2 things are in your keeping/);
});

test('search finds by title, kind, source and words', () => {
  const list = [
    item({ key: 'petition:a', title: 'For a new home', keywords: ['a safe place'] }),
    item({ key: 'plant:b', kind: 'plant', title: 'Margaret the pothos', source: 'Your altar · Kitchen' }),
    item({ key: 'coven-petition:c', kind: 'coven-petition', title: 'Healing', source: 'Coven · Deipnon, 26 Oct' }),
  ];
  assert.deepEqual(filterList(list, 'pothos').map((i) => i.key), ['plant:b']);
  assert.deepEqual(filterList(list, 'kitchen').map((i) => i.key), ['plant:b']);
  assert.deepEqual(filterList(list, 'deipnon').map((i) => i.key), ['coven-petition:c']);
  assert.deepEqual(filterList(list, 'safe').map((i) => i.key), ['petition:a']);
  assert.deepEqual(filterList(list, 'coven petition').map((i) => i.key), ['coven-petition:c']);
  assert.equal(filterList(list, '  ').length, 3);
});

test('records are cleaned from any shape, and an ending is kept', () => {
  assert.equal(normalizeRecord(null), null);
  assert.equal(normalizeRecord({ key: 'nonsense:1' }), null);
  const r = normalizeRecord({ key: 'plant:a:b', rhythm: { kind: 'until', until: 'soon' }, at: 9999, remind: 'yes' })!;
  assert.equal(r.kind, 'plant');
  assert.equal(r.rhythm, null);
  assert.equal(r.at, 9 * 60);
  assert.equal(r.remind, false);
  const ended = recordEnded({ ...r, remind: true }, 'let-go', '  ', NOW, 'page1');
  assert.equal(ended.remind, false);
  assert.deepEqual(ended.ended, { how: 'let-go', at: iso(NOW), note: '', pageId: 'page1' });
});

test('how it went is kept as a Grimoire page under its own section, escaped', () => {
  const it = item();
  const record = recordTended(newRecord(it), NOW, 'Lit <a> candle');
  const page = endingPage(it, record, 'answered', 'We found the house.\n\nIt has a garden & a gate.', NOW);
  assert.equal(page.ref, 'tend:petition:a');
  assert.equal(page.sectionTitle, 'How it went');
  assert.equal(page.title, 'For a new home');
  assert.equal(page.blocks[0].type, 'callout');
  assert.match(page.blocks[0].content, /Answered on/);
  assert.deepEqual(page.blocks.filter((b) => b.type === 'text').map((b) => b.content), ['We found the house.', 'It has a garden &amp; a gate.']);
  assert.match(page.blocks[page.blocks.length - 1].content, /Lit &lt;a&gt; candle/);
});

// ── Reminders ────────────────────────────────────────────────────────────

test('reminders ring by the rhythm at the chosen hour, and only when asked for', () => {
  const base = { ...newRecord(item()), title: 'For a new home', remind: true, at: 20 * 60 };
  const daily = tendReminders([base], NOW, 3);
  assert.deepEqual(daily.map((r) => r.at.getTime()), [0, 1, 2].map((n) => new Date(2026, 9, 27 + n, 20).getTime()));
  assert.equal(daily[0].url, '/today/tend');
  assert.match(daily[0].body, /Your altar · Hearth/);
  assert.equal(tendReminders([{ ...base, remind: false }], NOW, 3).length, 0);
  assert.equal(tendReminders([{ ...base, ended: { how: 'closed', at: '', note: '' } }], NOW, 3).length, 0);
  // Until a day: daily, then "Time to end it" on the day.
  const until = tendReminders([{ ...base, rhythm: { kind: 'until', until: '2026-10-29' } }], NOW, 7);
  assert.equal(until.length, 3);
  assert.match(until[2].title, /Time to end/);
  // As it asks: nothing here.
  assert.equal(tendReminders([{ ...base, kind: 'plant', rhythm: null }], NOW, 7).length, 0);
  // And they join the rest of the reminders, keeping the pause.
  const planned = planReminders({ appSettings: null, legacy: { ...DEFAULT_SETTINGS }, tend: [base], now: NOW, horizonDays: 3 }, { gather: false });
  assert.ok(planned.some((r) => r.kind === 'tend'));
  const paused = planReminders({ appSettings: { reminders_v2: JSON.stringify({ paused: true }) }, legacy: { ...DEFAULT_SETTINGS }, tend: [base], now: NOW, horizonDays: 3 }, { gather: false });
  assert.ok(!paused.some((r) => r.kind === 'tend'));
});

// ── Your altars ──────────────────────────────────────────────────────────

function hearth(): { altar: SavedAltar; petitions: { id: string; data: Petition }[] } {
  const candle = { ...place('candles:white-candle', 'chime-spell'), altarObjectId: 'c1', label: 'White candle' };
  const burning = { ...lightCandle({ ...place('candles:red-candle', 'chime-spell'), altarObjectId: 'c2', label: 'Red candle' }, iso(new Date(NOW.getTime() - HOUR))) };
  const bowl = { ...setOffering(place('vessels:offering-bowl'), 'water', '', iso(new Date(NOW.getTime() - 3 * DAY))), altarObjectId: 'o1' };
  const potItem = pottedCabinetItems({ basil: { established: 'basil.png' } }).find((i) => i.id === 'plants:basil')!;
  const pot = { ...setPlantDetails(objectFromForm(potItem, potItem.forms[0], [], iso(NOW)), { name: 'Bas', place: '', light: '', waterEvery: 3, lastWatered: '2026-10-23' }, iso(NOW)), altarObjectId: 'p1' };
  const petition: Petition = { ...newPetition('alt1', { title: 'For a new home', words: 'Safe and warm', intention: 'home', timing: 'now' }, NOW), place: 'candle', candleId: 'c1' };
  const paper = { ...petitionObject(petition, 'pet1', [candle], iso(NOW), candle), altarObjectId: 'paper1' };
  const doc = { ...emptyDocument(), objects: [candle, burning, bowl, pot, paper] };
  return { altar: { id: 'alt1', name: 'Hearth', objects: doc.objects }, petitions: [{ id: 'pet1', data: petition }, { id: 'pet2', data: { ...petition, title: 'Done', status: 'burned' } }] };
}

test('from your altars: petitions (with the candle they sit under), burning candles, offerings and plants', () => {
  const { altar, petitions } = hearth();
  const items = altarTendables({ altars: [altar], petitions }, NOW);
  const keys = items.map((i) => i.key);
  assert.deepEqual(keys.sort(), ['candle:alt1:c2', 'offering:alt1:o1', 'petition:pet1', 'plant:alt1:p1'].sort());
  const petition = items.find((i) => i.kind === 'petition')!;
  assert.equal(petition.source, 'Your altar · Hearth');
  assert.deepEqual(petition.actions, ['light', 'word', 'open']);
  assert.deepEqual(petition.ends, ['burned', 'buried', 'released']);
  assert.match(petition.detail, /Folded under White candle/);
  const candle = items.find((i) => i.kind === 'candle')!;
  assert.deepEqual(candle.actions, ['snuff', 'word', 'open']);
  assert.match(candle.detail, /^Burning/);
  const plant = items.find((i) => i.kind === 'plant')!;
  assert.equal(plant.title, 'Bas the basil');
  assert.deepEqual(plant.actions, ['water', 'word', 'open']);
  assert.ok(items.every((i) => i.private));
});

test('tending your own altar from the list: the same changes the altar makes', () => {
  const { altar } = hearth();
  const doc = documentFromAltar(altar);
  const now = iso(NOW);
  const lit = tendAltar(doc, { kind: 'light', objectId: 'c1' }, now);
  assert.ok(isLit(lit.objects[0]));
  assert.equal(tendAltar(lit, { kind: 'light', objectId: 'c1' }, now), lit);
  const snuffed = tendAltar(doc, { kind: 'snuff', objectId: 'c2' }, now);
  assert.ok(!isLit(snuffed.objects[1]));
  const fresh = tendAltar(doc, { kind: 'refresh', objectId: 'o1' }, now);
  assert.equal(offeringOf(fresh.objects[2])!.since, now);
  const watered = tendAltar(doc, { kind: 'water', objectId: 'p1' }, now);
  assert.equal(pottedOf(watered.objects[3]).lastWatered, dayKey(NOW));
  const word = tendAltar(doc, { kind: 'word', objectId: 'c1', text: 'For Mum' }, now);
  assert.equal(appHistoryOf(word.objects[0]).at(-1)!.text, 'For Mum');
  const burned = tendAltar(doc, { kind: 'petition', entryId: 'pet1', title: 'For a new home', candleId: 'c1', how: 'burned' }, now);
  assert.equal(burned.objects.length, 4);
  assert.match(appHistoryOf(burned.objects[0]).at(-1)!.text, /was burned/);
  assert.equal(tendAltar(doc, { kind: 'water', objectId: 'nope' }, now), doc);
});

// ── Your covens ──────────────────────────────────────────────────────────

const ME = 'me';
function covenPart(over: Partial<CovenPart> = {}): CovenPart {
  return {
    userId: ME,
    covens: [{ id: 'cv', slug: 'moonfire', name: 'Moonfire' }],
    memberships: [{ coven_id: 'cv', user_id: ME, rank_id: null, status: 'active' }],
    petitions: [
      { id: 'p1', coven_id: 'cv', user_id: ME, title: 'For my sister', body: null, color: 'blue', status: 'open', last_tended_at: null, altar_id: 'a1', source_ritual_id: 'r0', created_at: iso(NOW) },
      { id: 'p2', coven_id: 'cv', user_id: 'rowan', title: 'For Rowan’s job', body: null, color: 'green', status: 'open', last_tended_at: null, created_at: iso(NOW) },
      { id: 'p3', coven_id: 'cv', user_id: 'ash', title: 'Not mine, never tended', body: null, color: 'white', status: 'open', last_tended_at: null, created_at: iso(NOW) },
    ],
    tendings: [{ petition_id: 'p2', user_id: ME, note: null, created_at: iso(new Date(NOW.getTime() - 2 * HOUR)) }],
    contributions: [
      { id: 'k1', step_id: 's0', ritual_id: 'r0', coven_id: 'cv', kind: 'intention', body: 'To finish the book', private: true, anonymous: false, visibility: 'coven', fate: 'keep', status: 'held', petition_id: null, updated_at: iso(NOW), created_at: iso(NOW) },
      { id: 'k2', step_id: 's0b', ritual_id: 'r0', coven_id: 'cv', kind: 'petition', body: 'For my sister', private: false, anonymous: false, visibility: 'coven', fate: 'petition', status: 'offered', petition_id: 'p1', updated_at: iso(NOW), created_at: iso(NOW) },
      { id: 'k3', step_id: 's0c', ritual_id: 'r0', coven_id: 'cv', kind: 'gratitude', body: 'Thanks', private: false, anonymous: false, visibility: 'me', fate: 'burn', status: 'burned', petition_id: null, updated_at: iso(NOW), created_at: iso(NOW) },
    ],
    rituals: [
      { id: 'r0', coven_id: 'cv', title: 'Deipnon', status: 'done', scheduled_for: iso(new Date(2026, 9, 26, 20)) },
      { id: 'r1', coven_id: 'cv', title: 'Samhain', status: 'scheduled', scheduled_for: iso(new Date(2026, 9, 31, 20)) },
    ],
    steps: [
      { id: 's1', ritual_id: 'r1', title: 'The papers', contribution: { mode: 'each', kind: 'petition', timing: 'ahead', visibility: 'coven_unnamed', fate: 'burn' }, assignees: [] },
      { id: 's2', ritual_id: 'r1', title: 'Light', contribution: { mode: 'each', kind: 'light_candle', timing: 'live', visibility: 'coven', fate: 'keep' }, assignees: [] },
    ],
    mentorships: [{ coven_id: 'cv', user_id: 'wren', mentor_id: ME, assigned_at: iso(new Date(2026, 6, 1)) }],
    checkins: [{ coven_id: 'cv', user_id: 'wren', mentor_id: ME, met_on: '2026-08-01' }],
    nameOf: (id) => ({ rowan: 'Rowan', wren: 'Wren', ash: 'Ash' })[id] ?? 'A member',
    ...over,
  };
}

test('from your covens: petitions you asked or held, your own held writing, rites’ asks and check-ins', () => {
  const items = covenTendables(covenPart(), NOW);
  const keys = items.map((i) => i.key);
  assert.deepEqual(keys, ['coven-petition:p1', 'coven-petition:p2', 'contribution:k1', 'coven-task:s1', 'checkin:cv:wren']);
  const mine = items[0];
  assert.equal(mine.source, 'Coven · Deipnon, 26 Oct'.replace('26 Oct', new Date(2026, 9, 26).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })));
  assert.deepEqual(mine.ends, ['answered', 'closed']);
  assert.ok(mine.actions.includes('tend'));
  // Held for someone else: tended two hours ago, so the twelve hours aren't up; you can let it go, not close it.
  const held = items[1];
  assert.ok(!held.actions.includes('tend'));
  assert.deepEqual(held.ends, ['let-go']);
  assert.match(held.detail, /Asked by Rowan/);
  // Your own sealed writing is yours alone and says so.
  const sealed = items[2];
  assert.ok(sealed.private);
  assert.match(sealed.detail, /sealed. Only you can read it/);
  // A rite's petition to write ahead, due two days before.
  const task = items[3];
  assert.deepEqual(task.actions, ['write', 'open']);
  assert.match(task.title, /Write your petition for Samhain/);
  assert.equal(task.dueAt, new Date(2026, 9, 29, 20).getTime());
  // Wren's last check-in was 1 August: over six weeks ago.
  const checkin = items[4];
  assert.equal(checkin.title, 'Check in with Wren');
  assert.equal(dueOf(checkin, null, NOW).state, 'due');
  // With more than one coven, the coven's name leads.
  const two = covenTendables(covenPart({ covens: [{ id: 'cv', slug: 'moonfire', name: 'Moonfire' }, { id: 'x', slug: 'x', name: 'X' }] }), NOW);
  assert.match(two[0].source, /^Moonfire · Deipnon/);
});

test('a contribution is only ever its writer’s: nothing of anyone else’s comes from these rows', () => {
  // The rows come from row-level security (your own); even handed someone else's, an unheld one isn't listed.
  const items = covenTendables(covenPart({ contributions: [{ ...covenPart().contributions[0], status: 'burned' }] }), NOW);
  assert.ok(!items.some((i) => i.kind === 'contribution'));
});

test('journeys and look-backs join the list', () => {
  const journeys = journeyTendables(
    [{ entryId: 'e1', journeyId: 'hekate', title: 'Hekate', steps: [{ kind: 'practice', practice: { id: 'pr1', title: 'Keys at the threshold' }, state: { count: 1, times: 3 } }] }],
    NOW,
  );
  assert.equal(journeys[0].key, 'journey:e1:pr1');
  assert.equal(journeys[0].source, 'Journey · Hekate');
  assert.match(journeys[0].detail, /1 of 3/);
  const looks = lookBackTendables([{ id: 'j1', title: 'Money jar', metadata: { lookBack: { date: '2026-10-25', when: 'week' } } }, { id: 'j2', title: 'Done', metadata: { lookBack: { date: '2026-10-25', when: 'week', answer: 'yes' } } }], [
    { id: 'ap1', name: 'Protection sachet', metadata: { lookBack: { date: '2026-11-05', when: 'full_moon' } } },
  ]);
  assert.deepEqual(looks.map((i) => i.key), ['lookback:j1', 'lookback:apothecary:ap1']);
  const all = gatherTendables({ now: NOW, journeys: [], journal: [{ id: 'j1', title: 'Money jar', metadata: { lookBack: { date: '2026-10-25', when: 'week' } } }] });
  assert.equal(tendList(all, [], NOW).today.length, 1);
});

// ── Find mine ────────────────────────────────────────────────────────────

test('find mine: yours by id, others only as far as you may know, never a name an unnamed paper didn’t carry', () => {
  const now = iso(NOW);
  let doc = { ...emptyDocument(), objects: [] as SavedObject[] };
  doc = offerPaper({ id: 'mine1', fate: 'keep' }, 'Your intention', 0, now)(doc);
  // Someone else's, written for the coven without names: labelled without a name.
  const unnamed = contributionLabel({ kind: 'petition', private: false, mine: false, user_id: 'rowan', anonymous: false, visibility: 'coven_unnamed' }, () => 'Rowan');
  assert.equal(unnamed, 'A petition');
  assert.equal(contributionLabel({ kind: 'petition', private: true, mine: false, user_id: 'rowan', anonymous: true, visibility: 'coven' }, () => 'Rowan'), 'A private petition');
  assert.equal(contributionLabel({ kind: 'petition', private: false, mine: false, user_id: 'rowan', anonymous: false, visibility: 'coven' }, () => 'Rowan'), 'Rowan’s petition');
  doc = offerPaper({ id: 'theirs', fate: 'burn' }, unnamed, 1, now)(doc);
  // A candle tended in your name (and one in Rowan's).
  const candleItem = builtInCabinet.find((i) => i.id === 'candles:white-candle')!;
  doc = { ...doc, objects: [...doc.objects, { ...setAppState(objectFromForm(candleItem, candleItem.forms[0], [], now), { tendedBy: 'Rowan' }, now, false), altarObjectId: 'k-rowan' }] };
  doc = tendPetitionAltar({ color: 'white' }, 'Sage', now, ME)(doc);
  const rows = altarListing(doc, { userId: ME, myName: 'Sage', myContributions: ['mine1'], petitions: {}, nameOf: () => 'Someone' });
  const mine = rows.filter((r) => r.mine);
  assert.equal(mine.length, 2);
  assert.equal(rows[0].mine, true);
  const theirs = rows.find((r) => r.label === 'A petition')!;
  assert.equal(theirs.whose, '');
  assert.ok(!rows.some((r) => /Rowan/.test(r.label) && r.kind === 'paper'));
  assert.equal(rows.find((r) => r.key === 'k-rowan')!.whose, 'Rowan’s');
  assert.equal(mineKeys(rows).length, 2);
  assert.match(mineLine(rows), /2 things on this altar are yours: a candle and a paper/);
  // On your own altar, everything is yours.
  assert.ok(altarListing(doc, { userId: ME, myName: '', myContributions: [], petitions: {}, nameOf: () => '', personal: true }).every((r) => r.mine));
  assert.equal(mineLine([]), 'Nothing on this altar is yours yet.');
});

test('a coven petition’s candle and paper are its asker’s', () => {
  const rows = altarListing(
    { ...emptyDocument(), objects: [{ ...petitionObject({ ...newPetition('', { title: 'Healing', words: '', intention: '', timing: 'now' }, NOW) }, 'cp1', [], iso(NOW)), altarObjectId: 'pp' }] },
    { userId: ME, myName: 'Sage', myContributions: [], petitions: { cp1: { userId: 'rowan', title: 'Healing' } }, nameOf: (id) => (id === 'rowan' ? 'Rowan' : '') },
  );
  assert.equal(rows[0].whose, 'Rowan’s');
  assert.equal(rows[0].label, 'Petition: Healing');
});

export type { TendRecord };
