// Reminders for everything: holidays from every calendar (picked and timed as
// the person likes, the Deipnon folded in and never twice), tending (plants
// by thirst or by schedule, altars, offerings, crystals by the moon with safe
// care, candles), ritual planning (their holidays, their covens, leaders
// first), quiet hours, the pause, a busy day gathered into one, the phone's
// limit, Android channels, and the synced prefs worked out from the older ones.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { objectFromForm } from '../src/lib/altar/cabinet.ts';
import { lightCandle, snuffCandle } from '../src/lib/altar/livingState.ts';
import { pottedCabinetItems, setPlantDetails, waterPlant } from '../src/lib/altar/pottedPlants.ts';
import type { SavedAltar, SavedObject } from '../src/lib/altar/types.ts';
import { upcomingPhases } from '../src/lib/moon.ts';
import { CHANNELS, channelOf } from '../src/lib/reminders/channels.ts';
import { covenSources, leadsCoven } from '../src/lib/reminders/covens.ts';
import { DEIPNON_ID, holidayCatalog, holidayGroups, holidayItems } from '../src/lib/reminders/holidays.ts';
import { calendarReminders, choose, crystalAdvice, gather, outOfQuiet, planReminders, repeatDays, type CovenSource, type PlanInput } from '../src/lib/reminders/plan.ts';
import {
  DEFAULT_PREFS,
  migratePrefs,
  normalizePrefs,
  PREFS_KEY,
  prefsValue,
  readPrefs,
  setCalendar,
  setHoliday,
  summaries,
  withCalendarOn,
  withChange,
  type ReminderPrefs,
} from '../src/lib/reminders/prefs.ts';
import { DEFAULT_SETTINGS, type Reminder, type ReminderKind } from '../src/lib/reminders/schedule.ts';
import { defaultSettings, normalizeSettings, settingsRow } from '../src/lib/settings/defaults.ts';
import { EMPTY_SOURCES, tendingSources, type TendingSources } from '../src/lib/reminders/sources.ts';

const NOW = new Date(2026, 9, 26, 8, 0);
const legacy = { ...DEFAULT_SETTINGS, rituals: false, lookBacks: false };
const wheel = { calendar_traditions: 'wheel' };
const hekate = (extra: Record<string, unknown> = {}) => ({ calendar_traditions: 'wheel', my_deities: JSON.stringify([{ key: 'hekate', name: 'Hekate', level: 'patron' }]), ...extra });
const withPrefs = (settings: Record<string, unknown>, prefs: ReminderPrefs) => ({ ...settings, [PREFS_KEY]: prefsValue(prefs) });
const on = (change: (p: ReminderPrefs) => ReminderPrefs = (p) => p) => change(normalizePrefs({ holidays: { on: true } }));
const input = (appSettings: Record<string, unknown>, extra: Partial<PlanInput> = {}): PlanInput => ({ appSettings, legacy, now: NOW, ...extra });
const keys = (list: Reminder[]) => list.map((r) => r.key);
const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

// ── Holidays ──────────────────────────────────────────────────────────────

test('holiday reminders come on the day at the chosen time, for each kept calendar', () => {
  const list = calendarReminders(input(withPrefs(wheel, on())));
  const samhain = list.find((r) => r.key === 'holiday:wheel-samhain:2026-10-31')!;
  assert.ok(samhain);
  assert.equal(samhain.title, 'Samhain today');
  assert.equal(samhain.at.getTime(), local(2026, 10, 31, 9));
  assert.match(samhain.body, /witches’ new year/);
  assert.equal(channelOf(samhain.kind), 'holiday-reminders');
  // Off by default: nothing.
  assert.equal(calendarReminders(input(wheel)).length, 0);
});

test('lead times: several at once, per calendar, and per holiday', () => {
  const both = calendarReminders(input(withPrefs(wheel, on((p) => withChange(withChange(p, 'holidays.leads', [0, 1, 7]), 'holidays.at', 19 * 60 + 30)))));
  const samhain = both.filter((r) => r.key.startsWith('holiday:wheel-samhain:2026-10-31'));
  // A week before is already past on 26 October; the day before and the day remain.
  assert.deepEqual(keys(samhain), ['holiday:wheel-samhain:2026-10-31:1', 'holiday:wheel-samhain:2026-10-31']);
  assert.equal(samhain[0].title, 'Samhain tomorrow');
  assert.equal(samhain[0].at.getTime(), local(2026, 10, 30, 19, 30));
  const yule = both.filter((r) => r.key.includes('wheel-yule'));
  assert.equal(yule.length, 3);
  assert.equal(yule[0].title, 'Yule in a week');
  // The calendar's own timing over everyone's, and a holiday's own over its calendar's.
  const own = on((p) => withChange(withChange(p, 'holidays.calendars.wheel', { on: true, leads: [3] }), 'holidays.leadsFor', { 'wheel-yule': [0, 7] }));
  const list = calendarReminders(input(withPrefs(wheel, own)));
  assert.deepEqual(keys(list.filter((r) => r.key.includes('wheel-samhain'))), ['holiday:wheel-samhain:2026-10-31:3']);
  assert.ok(list.some((r) => r.key === 'holiday:wheel-yule:2026-12-21:7'));
  assert.ok(list.some((r) => r.key === 'holiday:wheel-yule:2026-12-21'));
  assert.ok(!list.some((r) => r.key === 'holiday:wheel-yule:2026-12-21:3'));
});

test('pick and choose: single holidays off, a calendar off, all and none', () => {
  const settings = { calendar_traditions: 'wheel,norse' };
  const groups = holidayGroups(settings).map((g) => g.id);
  assert.deepEqual(groups, ['wheel', 'norse']);
  const catalog = holidayCatalog(settings, NOW);
  const wheelIds = catalog.find((g) => g.id === 'wheel')!.items.map((i) => i.baseId);
  assert.equal(wheelIds.length, 8);
  let prefs = setHoliday(on(), 'wheel', 'wheel-yule', false);
  let list = calendarReminders(input(withPrefs(settings, prefs), { horizonDays: 90 }));
  assert.ok(list.some((r) => r.key.includes('wheel-samhain')));
  assert.ok(!list.some((r) => r.key.includes('wheel-yule')));
  prefs = setCalendar(prefs, 'norse', [], false);
  list = calendarReminders(input(withPrefs(settings, prefs), { horizonDays: 90 }));
  assert.ok(!list.some((r) => r.key.includes('holiday:norse-')));
  // None, then one turned on: just that one.
  prefs = setCalendar(prefs, 'wheel', wheelIds, false);
  prefs = setHoliday(prefs, 'wheel', 'wheel-yule', true, wheelIds);
  list = calendarReminders(input(withPrefs(settings, prefs), { horizonDays: 90 }));
  assert.deepEqual(keys(list), ['holiday:wheel-yule:2026-12-21']);
  // All again.
  prefs = setCalendar(prefs, 'wheel', wheelIds, true);
  list = calendarReminders(input(withPrefs(settings, prefs), { horizonDays: 90 }));
  assert.ok(list.some((r) => r.key.includes('wheel-samhain')) && list.some((r) => r.key.includes('wheel-yule')));
});

test('the traditional calendars shown beside the date remind too (Hindu, Kemetic), and their lunar days repeat', () => {
  const settings = { calendar_traditions: 'wheel', calendar_extra: 'hindu,kemetic,moon' };
  assert.deepEqual(holidayGroups(settings).map((g) => g.id), ['wheel', 'calendar:kemetic', 'calendar:hindu']);
  const items = holidayItems(settings, NOW, 60);
  const diwali = items.find((i) => i.baseId === 'hindu-diwali')!;
  assert.equal(diwali.group, 'calendar:hindu');
  assert.equal(diwali.recurs, 'yearly');
  assert.equal(items.find((i) => i.baseId === 'hindu-ekadashi-krishna')!.recurs, 'monthly');
  assert.ok(items.some((i) => i.baseId === 'kemetic-khoiak'));
  assert.ok(!items.some((i) => i.group === 'calendar:moon'));
  const list = calendarReminders(input(withPrefs(settings, on())));
  assert.ok(list.some((r) => r.key === `holiday:hindu-diwali:${'2026-11-08'}`));
});

test('patron sacred days are a calendar of their own, by deity', () => {
  const settings = hekate();
  assert.ok(holidayGroups(settings).some((g) => g.id === 'patron'));
  const catalog = holidayCatalog(settings, NOW).find((g) => g.id === 'patron')!;
  assert.deepEqual(catalog.items.map((i) => [i.baseId, i.name]), [['patron-hekate', 'Hekate’s sacred days']]);
  const list = calendarReminders(input(withPrefs(settings, on())));
  const sacred = list.filter((r) => r.kind === 'sacred');
  assert.ok(sacred.length);
  assert.match(sacred[0].key, /^sacred-hekate:\d{4}-\d{2}-\d{2}$/);
  assert.match(sacred[0].url, /traditional:deity:hekate/);
});

// ── The Deipnon, folded in ────────────────────────────────────────────────

test('Hekate’s Deipnon: migrated from before, once a day, never doubled with her sacred day, and turned off with deipnon_prompt', () => {
  const settings = hekate();
  // Before any prefs are saved: the Deipnon alone (it rang before), and her sacred days only if they were on.
  const prefs = readPrefs(settings, { sacredDays: false });
  assert.equal(prefs.holidays.on, true);
  assert.equal(prefs.holidays.calendars.wheel.on, false);
  assert.equal(prefs.holidays.calendars.hellenic_monthly.on, true);
  assert.equal(prefs.holidays.calendars.patron.on, false);
  const list = planReminders(input(settings, { legacy: { ...legacy, sacredDays: true } }), { gather: false });
  const deipna = list.filter((r) => r.kind === 'deipnon');
  assert.deepEqual(keys(deipna), ['deipnon:2026-11-09', 'deipnon:2026-12-09']);
  assert.equal(deipna[0].title, 'Hekate’s Deipnon today');
  assert.equal(deipna[0].at.getTime(), local(2026, 11, 9, 9));
  assert.equal(new Set(keys(list)).size, list.length);
  // The device's older sacred-day switch carries over as the patron calendar, and rings each day once, not twice.
  assert.deepEqual(keys(list.filter((r) => r.kind === 'sacred')), ['sacred-hekate:2026-10-31']);
  assert.ok(!planReminders(input(settings), { gather: false }).some((r) => r.kind === 'sacred'));
  // With her sacred days on too: still one note on a Deipnon.
  const both = planReminders(input(settings, { legacy: { ...legacy, sacredDays: true }, prefs: readPrefs(settings, { sacredDays: true }), horizonDays: 120 }), { gather: false });
  const deipnonDays = new Set(both.filter((r) => r.kind === 'deipnon').map((r) => r.key.slice('deipnon:'.length)));
  assert.ok(both.some((r) => r.kind === 'sacred'));
  for (const r of both.filter((x) => x.key.startsWith('sacred-hekate:'))) assert.ok(!deipnonDays.has(r.key.slice('sacred-hekate:'.length)), 'not twice');
  // Keeping the Hellenic monthly days: the Deipnon comes from them, once.
  const keeper = { calendar_traditions: 'wheel,hellenic_monthly' };
  const kept = calendarReminders(input(keeper));
  assert.deepEqual(keys(kept), ['deipnon:2026-11-09', 'deipnon:2026-12-09']);
  // Turned off on Today's calendar settings: no note, no reminder, and the prefs know it.
  assert.equal(calendarReminders(input({ ...keeper, deipnon_prompt: false })).length, 0);
  assert.ok(migratePrefs({ ...keeper, deipnon_prompt: false }, null).holidays.off.includes(DEIPNON_ID));
  const saved = withPrefs({ ...keeper, deipnon_prompt: false }, on());
  assert.ok(!calendarReminders(input(saved)).some((r) => r.kind === 'deipnon'));
  // Picked off in the list: none either.
  assert.ok(!calendarReminders(input(withPrefs(keeper, setHoliday(on(), 'hellenic_monthly', DEIPNON_ID, false)))).some((r) => r.kind === 'deipnon'));
});

// ── Settings: migration and shape ─────────────────────────────────────────

test('prefs: defaults, migration from the device’s older choices, saved prefs win, and garbage is tidied', () => {
  assert.equal(readPrefs(wheel, null).holidays.on, false, 'new people: holiday reminders off until chosen');
  const migrated = readPrefs(wheel, { offerings: true, offeringsAt: 17 * 60, watering: true, wateringAt: 8 * 60, sacredDays: true, sacredAt: 10 * 60 });
  assert.equal(migrated.tending.offerings.on, true);
  assert.equal(migrated.tending.offerings.at, 17 * 60);
  assert.equal(migrated.tending.plants.on, true);
  assert.equal(migrated.tending.plants.mode, 'thirsty');
  assert.equal(migrated.tending.plants.at, 8 * 60);
  assert.equal(migrated.holidays.at, 10 * 60);
  // Saved prefs are read as saved, whatever the device says.
  const saved = withPrefs(wheel, DEFAULT_PREFS);
  assert.equal(readPrefs(saved, { offerings: true }).tending.offerings.on, false);
  const tidy = normalizePrefs({ quiet: { on: true, start: 99999 }, holidays: { leads: [9, 'x', 1, 1], calendars: { wheel: { leads: [] } } }, bundle: { max: -2 }, tending: { crystals: { cadence: 'sometimes' }, candles: { nearEndMinutes: 7 } } });
  assert.equal(tidy.quiet.start, DEFAULT_PREFS.quiet.start);
  assert.deepEqual(tidy.holidays.leads, [1, 9]);
  assert.deepEqual(tidy.holidays.calendars.wheel, { on: true, leads: [0] });
  assert.equal(tidy.bundle.max, 3);
  assert.equal(tidy.tending.crystals.cadence, 'full');
  assert.equal(tidy.tending.candles.nearEndMinutes, 30);
  assert.deepEqual(normalizePrefs(JSON.parse(prefsValue(tidy))), tidy, 'round trip');
  assert.equal(readPrefs({ [PREFS_KEY]: '{not json' }, null).version, 2);
  // Turning one calendar on from elsewhere (My deities) while holidays were off: just that one.
  const patronOnly = withCalendarOn(DEFAULT_PREFS, hekate(), 'patron', true);
  assert.equal(patronOnly.holidays.on, true);
  assert.equal(patronOnly.holidays.calendars.wheel.on, false);
  assert.equal(patronOnly.holidays.calendars.patron.on, true);
});

test('summaries read as one line each', () => {
  const prefs = withChange(on((p) => withChange(p, 'holidays.leads', [1])), 'tending.crystals.on', true);
  const s = summaries(withChange(withChange(prefs, 'quiet.on', true), 'paused', true), { calendar_traditions: 'wheel,norse,celtic' }, NOW);
  assert.equal(s.holidays, 'All 3 calendars · the day before at 9:00 am');
  assert.equal(s.tending, 'Crystals');
  assert.match(s.quiet, /^Paused · Quiet 10:00 pm to 7:00 am/);
  assert.equal(summaries(DEFAULT_PREFS, wheel, NOW).holidays, 'Off');
});

// ── Tending ───────────────────────────────────────────────────────────────

const pic = (id: string, stage: string) => `../assets/altar/objects/plants/${id}/${id}-${stage}.png`;
const PLANT_IMAGES = { pothos: { lush: pic('pothos', 'lush') }, basil: { established: pic('basil', 'established') } };
function plant(kind: string, name: string, every: number, wateredOn: Date, id: string): SavedObject {
  const item = pottedCabinetItems(PLANT_IMAGES).find((i) => i.id === `plants:${kind}`)!;
  const iso = wateredOn.toISOString();
  const placed = { ...objectFromForm(item, item.forms[0], [], iso), altarObjectId: id };
  return setPlantDetails(waterPlant(placed, iso), { name, place: '', light: '', waterEvery: every }, iso);
}
const altar = (id: string, name: string, objects: SavedObject[]): SavedAltar => ({ id, name, objects }) as SavedAltar;
const tending = (change: (p: ReminderPrefs) => ReminderPrefs) => change(normalizePrefs({}));

test('plants: when actually thirsty, or on a fixed schedule; each its own way; gone from the altar, quiet', () => {
  const margaret = plant('pothos', 'Margaret', 7, new Date(2026, 9, 24, 12), 'p1');
  const bramble = plant('basil', 'Bramble', 2, new Date(2026, 9, 25, 12), 'p2');
  const sources = tendingSources([altar('a1', 'Kitchen', [margaret, bramble])], [], NOW);
  assert.deepEqual(sources.plants.map((p) => [p.id, p.who, p.waterEvery]), [['a1:p1', 'Margaret the pothos', 7], ['a1:p2', 'Bramble the basil', 2]]);
  const thirsty = tending((p) => withChange(p, 'tending.plants.on', true));
  let list = calendarReminders(input(wheel, { prefs: thirsty, sources }));
  assert.deepEqual(list.map((r) => [r.key, r.body]), [
    ['watering:2026-10-27T0900', 'Bramble the basil would like water.'],
    ['watering:2026-10-31T0900', 'Margaret the pothos would like water.'],
  ]);
  // A fixed schedule: every 3 days from when it was last watered, whatever its thirst.
  const fixed = withChange(withChange(thirsty, 'tending.plants.mode', 'schedule'), 'tending.plants.every', 3);
  list = calendarReminders(input(wheel, { prefs: fixed, sources }));
  const days = list.filter((r) => r.body.includes('Margaret')).map((r) => r.at.getDate());
  assert.deepEqual(days.slice(0, 3), [27, 30, 2]);
  // On chosen weekdays, at its own time, for one plant; the other turned off.
  const own = withChange(fixed, 'tending.plants.per', { 'a1:p1': { weekdays: [6], at: 18 * 60 }, 'a1:p2': { on: false } });
  list = calendarReminders(input(wheel, { prefs: own, sources }));
  assert.ok(list.length >= 2);
  assert.ok(list.every((r) => r.at.getDay() === 6 && r.at.getHours() === 18 && r.body.startsWith('Margaret')));
  // Taken off the altar: nothing.
  const gone = tendingSources([altar('a1', 'Kitchen', [])], [], NOW);
  assert.equal(calendarReminders(input(wheel, { prefs: thirsty, sources: gone })).length, 0);
});

test('altars: how often, when, and which', () => {
  const sources: TendingSources = { ...EMPTY_SOURCES, altars: [{ id: 'a1', name: 'Brigid' }, { id: 'a2', name: 'Ancestor altar' }] };
  const prefs = tending((p) => withChange(withChange(withChange(p, 'tending.altars.on', true), 'tending.altars.weekdays', [0, 3]), 'tending.altars.ids', ['a1']));
  const list = calendarReminders(input(wheel, { prefs, sources }));
  assert.ok(list.length >= 4);
  assert.ok(list.every((r) => [0, 3].includes(r.at.getDay()) && r.at.getHours() === 19 && r.kind === 'altar'));
  assert.equal(list[0].url, '/altar/a1');
  assert.match(list[0].body, /your Brigid altar/);
  // The chosen altar is gone: quiet.
  assert.equal(calendarReminders(input(wheel, { prefs, sources: { ...sources, altars: [{ id: 'a2', name: 'Ancestor altar' }] } })).length, 0);
  // Every 7 days falls on Sundays, on the phone and the website alike.
  assert.ok(repeatDays({ every: 7, weekdays: [] }, NOW, 21).every((d) => d.getDay() === 0));
});

test('offerings: going over (on the day or the day before), and a regular refresh', () => {
  const due = { altarId: 'a1', altarName: 'Brigid', objectId: 'o1', what: 'roses', kind: 'flowers' as const, stage: { name: 'Wilting', says: 'is wilting', level: 'refresh' as const, at: 0 } as never, dueAt: local(2026, 10, 28, 15) };
  const sources: TendingSources = { ...EMPTY_SOURCES, offerings: [due] };
  const onDay = tending((p) => withChange(p, 'tending.offerings.on', true));
  let list = calendarReminders(input(wheel, { prefs: onDay, sources }));
  assert.deepEqual(keys(list), ['offering:2026-10-28']);
  assert.equal(list[0].at.getTime(), local(2026, 10, 28, 18));
  list = calendarReminders(input(wheel, { prefs: withChange(onDay, 'tending.offerings.lead', 1), sources }));
  assert.equal(list[0].at.getTime(), local(2026, 10, 27, 18));
  const refresh = tending((p) => withChange(withChange(p, 'tending.offerings.refresh', true), 'tending.offerings.every', 7));
  list = calendarReminders(input(wheel, { prefs: refresh }));
  assert.ok(list.length >= 2 && list.every((r) => r.key.startsWith('offering-refresh:') && r.at.getDay() === 0 && r.at.getHours() === 9));
});

test('crystals: by the moon or every few weeks, each with safe care (no water for selenite)', () => {
  const sources: TendingSources = {
    ...EMPTY_SOURCES,
    crystals: [
      { id: 'stone:1', name: 'Selenite', key: 'selenite', where: 'My stones' },
      { id: 'stone:2', name: 'Amethyst tower', key: null, where: 'My stones' },
      { id: 'a1:c1', name: 'Malachite', key: 'malachite', where: 'Brigid' },
    ],
  };
  const full = tending((p) => withChange(p, 'tending.crystals.on', true));
  const list = calendarReminders(input(wheel, { prefs: full, sources }));
  const fulls = upcomingPhases(new Date(2026, 9, 25), 12).filter((e) => e.phase === 'full' && e.date.getTime() > NOW.getTime() - 86_400_000);
  assert.ok(list.length >= 2);
  list.forEach((r, i) => {
    assert.equal(r.at.toDateString(), fulls[i].date.toDateString());
    assert.equal(r.at.getHours(), 20);
  });
  assert.match(list[0].title, /^Full moon/);
  assert.match(list[0].body, /Selenite: moonlight or smoke, and keep it dry\./);
  assert.match(list[0].body, /Amethyst tower: moonlight or smoke, and out of strong sun\./);
  assert.match(list[0].body, /Malachite: moonlight or smoke, and keep it dry, away from heat and sun\./);
  assert.doesNotMatch(list[0].body, /Selenite[^.]*water/);
  assert.equal(crystalAdvice({ name: 'Mystery stone', key: null }, true), 'Mystery stone: moonlight, smoke or sound suit almost every stone.');
  const both = calendarReminders(input(wheel, { prefs: withChange(full, 'tending.crystals.cadence', 'both'), sources }));
  assert.ok(both.some((r) => r.title.startsWith('New moon')) && both.some((r) => r.title.startsWith('Full moon')));
  const weeks = calendarReminders(input(wheel, { prefs: withChange(withChange(full, 'tending.crystals.cadence', 'weeks'), 'tending.crystals.weeks', 2), sources }));
  assert.ok(weeks.length >= 3);
  assert.equal((weeks[1].at.getTime() - weeks[0].at.getTime()) / 86_400_000, 14);
  // One stone left out, then all: quiet.
  const off = calendarReminders(input(wheel, { prefs: withChange(full, 'tending.crystals.off', ['stone:1']), sources }));
  assert.doesNotMatch(off[0].body, /Selenite/);
  assert.equal(calendarReminders(input(wheel, { prefs: withChange(full, 'tending.crystals.off', ['stone:1', 'stone:2', 'a1:c1']), sources })).length, 0);
});

test('candles: nearly burned down, a working to light again, and a daily practice', () => {
  const start = new Date(2026, 9, 26, 7).toISOString();
  const vigil: SavedObject = { type: 'candle', form: 'vigil', color: 'white', altarObjectId: 'c1' };
  const burning = lightCandle({ type: 'candle', form: 'taper', color: 'red', altarObjectId: 'c2' }, start);
  const part = snuffCandle(lightCandle(vigil, new Date(2026, 9, 25, 20).toISOString()), new Date(2026, 9, 25, 22).toISOString());
  const sources = tendingSources([altar('a1', 'Brigid', [burning, part, { type: 'candle', form: 'taper', altarObjectId: 'c3' }])], [], NOW);
  assert.deepEqual(sources.candles.map((c) => [c.id, c.lit, c.working]), [['a1:c2', true, false], ['a1:c1', false, true]]);
  const prefs = tending((p) => withChange(withChange(withChange(p, 'tending.candles.nearEnd', true), 'tending.candles.relight', true), 'tending.candles.daily', true));
  const list = calendarReminders(input(wheel, { prefs, sources }));
  const end = list.find((r) => r.key.startsWith('candle-end:'))!;
  assert.equal(end.at.getTime(), local(2026, 10, 26, 14, 30), 'a taper burns eight hours; thirty minutes before');
  assert.match(end.title, /red taper candle is nearly burned down/);
  const relight = list.filter((r) => r.key.startsWith('candle-relight:'));
  assert.ok(relight.length >= 7);
  assert.match(relight[0].body, /Light the white vigil candle on your Brigid altar again: about 166 hours left/);
  assert.ok(list.filter((r) => r.key.startsWith('candle-daily:')).length >= 14);
});

// ── Ritual planning and covens ────────────────────────────────────────────

test('planning a ritual for a holiday, unless one is planned already', () => {
  const prefs = withChange(withChange(DEFAULT_PREFS, 'planning.holidays', true), 'planning.days', 7);
  const list = calendarReminders(input(withPrefs(wheel, prefs), { horizonDays: 90 }));
  const yule = list.find((r) => r.key === 'plan:wheel-yule:2026-12-21')!;
  assert.equal(yule.title, 'Plan a ritual for Yule');
  assert.equal(yule.at.getTime(), local(2026, 12, 14, 10));
  assert.equal(channelOf(yule.kind), 'planning-reminders');
  const planned = calendarReminders(input(withPrefs(wheel, prefs), { horizonDays: 90, plans: [{ id: 'x', date: '2026-12-21', time: '20:00', title: 'Yule', ingredients: [] } as never] }));
  assert.ok(!planned.some((r) => r.key.startsWith('plan:wheel-yule')));
  // Monthly days (the Noumenia) don't each ask to be planned.
  const monthly = calendarReminders(input(withPrefs({ calendar_traditions: 'hellenic_monthly' }, prefs), { horizonDays: 90 }));
  assert.ok(!monthly.some((r) => r.kind === 'planning'));
});

const ritual = (id: string, when: string, title = 'Samhain rite') => ({ id, title, status: 'scheduled' as const, scheduled_for: when, occasion: 'sabbat', occasion_name: 'Samhain' });
function coven(leader: boolean, extra: Partial<CovenSource> = {}): CovenSource {
  return {
    id: leader ? 'c-lead' : 'c-member',
    slug: leader ? 'moon-circle' : 'hearth',
    name: leader ? 'Moon Circle' : 'Hearth',
    leader,
    holidays: [
      { baseId: 'wheel-yule', name: 'Yule', date: new Date(2026, 11, 21), days: 1 },
      { baseId: 'wheel-samhain', name: 'Samhain', date: new Date(2026, 9, 31), days: 1 },
    ],
    rites: [],
    ...extra,
  };
}

test('covens: on for leaders, earlier; off for members unless chosen; a holiday with a rite already set needs no plan', () => {
  const prefs = normalizePrefs({});
  const list = calendarReminders(input(wheel, { prefs, covens: [coven(true), coven(false)], horizonDays: 90 }));
  const yule = list.find((r) => r.key === 'coven-plan:c-lead:wheel-yule:2026-12-21')!;
  assert.equal(yule.title, 'Plan Moon Circle’s ritual for Yule');
  assert.equal(yule.at.getTime(), local(2026, 12, 7, 10), 'two weeks ahead for a leader');
  assert.equal(yule.url, '/coven/c/moon-circle');
  assert.ok(!list.some((r) => r.key.startsWith('coven-plan:c-member')));
  // A member who asks: a week ahead, in a member's words.
  const asked = withChange(prefs, 'planning.perCoven', { 'c-member': { on: true } });
  const member = calendarReminders(input(wheel, { prefs: asked, covens: [coven(false)], horizonDays: 90 })).find((r) => r.key === 'coven-plan:c-member:wheel-yule:2026-12-21')!;
  assert.equal(member.at.getTime(), local(2026, 12, 14, 10));
  assert.equal(member.title, 'Yule with Hearth');
  // A leader who turns one coven off, or all of them.
  assert.ok(!calendarReminders(input(wheel, { prefs: withChange(prefs, 'planning.perCoven', { 'c-lead': { on: false } }), covens: [coven(true)], horizonDays: 90 })).some((r) => r.kind === 'planning'));
  assert.ok(!calendarReminders(input(wheel, { prefs: withChange(prefs, 'planning.covens', false), covens: [coven(true)], horizonDays: 90 })).some((r) => r.kind === 'planning'));
  // A rite on the calendar for Yule: no "plan" note, but the leader is asked to prepare it, and those going are reminded.
  const rite = ritual('r1', new Date(2026, 11, 21, 19).toISOString(), 'Yule rite');
  const withRite = calendarReminders(input(wheel, { prefs, covens: [coven(true, { rites: [{ ritual: rite, response: 'going' }] })], horizonDays: 90 }));
  assert.ok(!withRite.some((r) => r.key.startsWith('coven-plan:c-lead:wheel-yule')));
  assert.ok(withRite.some((r) => r.key === 'coven-prep:r1' && r.title === 'Prepare Yule rite'));
  assert.deepEqual(keys(withRite.filter((r) => r.kind === 'coven')), ['coven-rite-r1-day', 'coven-rite-r1-hour']);
});

test('who leads a coven: its head, or a position that leads or schedules rites', () => {
  const base = { id: 'c1', slug: 's', name: 'C', status: 'active', founder_id: 'founder', practice_traditions: ['wheel'] } as never;
  const member = (rank: string | null) => ({ coven_id: 'c1', user_id: 'me', rank_id: rank, status: 'active' as const, muted_until: null, joined_at: '' });
  const ranks = [
    { id: 'hp', coven_id: 'c1', name: 'High Priestess', description: null, requirements: null, level: 90, can_lead_rituals: true },
    { id: 'seeker', coven_id: 'c1', name: 'Seeker', description: null, requirements: null, level: 1 },
  ];
  assert.equal(leadsCoven({ coven: base, membership: member('hp'), ranks }, 'me'), true);
  assert.equal(leadsCoven({ coven: base, membership: member('seeker'), ranks }, 'me'), false);
  assert.equal(leadsCoven({ coven: { ...(base as object), founder_id: 'me' } as never, membership: member(null), ranks }, 'me'), true);
  const [source] = covenSources([{ coven: base, membership: member('hp'), ranks }], [], 'me', NOW);
  assert.equal(source.leader, true);
  assert.ok(source.holidays.some((h) => h.baseId === 'wheel-samhain'));
});

// ── Quiet hours, the pause, gathering, the phone's limit ──────────────────

const r = (key: string, kind: ReminderKind, at: Date, title = key): Reminder => ({ key, kind, at, title, body: '', url: '/' });

test('quiet hours move a note to when they end, and a set-time one to just before they begin', () => {
  const quiet = { on: true, start: 22 * 60, end: 7 * 60 };
  assert.equal(outOfQuiet(r('h', 'holiday', new Date(2026, 9, 27, 23)), quiet).at.getTime(), local(2026, 10, 28, 7));
  assert.equal(outOfQuiet(r('h', 'holiday', new Date(2026, 9, 28, 5)), quiet).at.getTime(), local(2026, 10, 28, 7));
  assert.equal(outOfQuiet(r('ritual:x', 'ritual', new Date(2026, 9, 28, 5)), quiet).at.getTime(), local(2026, 10, 27, 21, 45));
  assert.equal(outOfQuiet(r('h', 'holiday', new Date(2026, 9, 28, 9)), quiet).at.getTime(), local(2026, 10, 28, 9), 'outside: unmoved');
  const afternoon = { on: true, start: 13 * 60, end: 15 * 60 };
  assert.equal(outOfQuiet(r('h', 'holiday', new Date(2026, 9, 28, 14)), afternoon).at.getTime(), local(2026, 10, 28, 15));
  // Through the whole plan: the holiday at 9 moves to 10 when quiet runs to 10.
  const prefs = withChange(withChange(withChange(on(), 'quiet.on', true), 'quiet.start', 21 * 60), 'quiet.end', 10 * 60);
  const list = calendarReminders(input(withPrefs(wheel, prefs)));
  assert.equal(list.find((x) => x.key === 'holiday:wheel-samhain:2026-10-31')!.at.getTime(), local(2026, 10, 31, 10));
});

test('pause: everything, or everything until a day', () => {
  const paused = withChange(on(), 'paused', true);
  const devotions = { ...legacy, devotionMorning: true };
  assert.equal(planReminders(input(withPrefs(wheel, paused), { legacy: devotions })).length, 0);
  const until = withChange(paused, 'pausedUntil', '2026-11-01');
  const list = planReminders(input(withPrefs(wheel, until), { legacy: devotions }));
  assert.ok(list.length > 0);
  assert.ok(list.every((x) => x.at.getTime() >= local(2026, 11, 1)));
  assert.ok(!list.some((x) => x.key.includes('wheel-samhain')));
});

test('a busy day becomes one note; rituals, the moon and daily practice still come on their own', () => {
  const day = (h: number) => new Date(2026, 9, 31, h);
  const list = [
    r('holiday:a', 'holiday', day(9), 'Samhain today'),
    r('watering:x', 'watering', day(9), 'A plant would like water'),
    r('crystal:x', 'crystal', day(20), 'Full moon: cleanse'),
    r('plan:y', 'planning', day(10), 'Plan a ritual for Yule'),
    r('altar:x', 'altar', day(19), 'Tend your altar'),
    r('ritual:p', 'ritual', day(20), 'Samhain rite'),
    r('devotion-morning:x', 'devotion', day(7), 'Morning devotion'),
    r('holiday:b', 'holiday', new Date(2026, 10, 1, 9), 'All Saints'),
  ];
  const out = gather(list, 3);
  const note = out.find((x) => x.kind === 'summary')!;
  assert.equal(note.key, 'summary:2026-10-31');
  assert.equal(note.title, '5 things today');
  assert.equal(note.at.getTime(), day(9).getTime());
  assert.match(note.body, /^Plan a ritual for Yule · Samhain today/);
  assert.deepEqual(keys(out).sort(), ['devotion-morning:x', 'holiday:b', 'ritual:p', 'summary:2026-10-31']);
  assert.equal(gather(list, 5).length, list.length, 'not busy enough');
  assert.equal(channelOf('summary'), 'summary-reminders');
});

test('the phone’s limit: the next two days first, then the most important', () => {
  const list: Reminder[] = [];
  for (let d = 0; d < 40; d++) list.push(r(`devotion:${d}`, 'devotion', new Date(2026, 9, 26, 9 + (d % 12), 0), `d${d}`));
  for (let d = 3; d < 40; d++) list.push(r(`dream:${d}`, 'dream', new Date(2026, 9, 26 + d, 7)));
  list.push(r('ritual:far', 'ritual', new Date(2026, 11, 10, 20)));
  list.push(r('holiday:far', 'holiday', new Date(2026, 11, 21, 9)));
  const chosen = choose(list, 60, NOW);
  assert.equal(chosen.length, 60);
  assert.ok(keys(chosen).includes('ritual:far'), 'a planned ritual far off beats tomorrow’s dream note');
  assert.ok(keys(chosen).includes('holiday:far'));
  // Everything within two days is kept.
  assert.ok(list.filter((x) => x.at.getTime() <= NOW.getTime() + 48 * 3_600_000).every((x) => chosen.includes(x)));
  for (let i = 1; i < chosen.length; i++) assert.ok(chosen[i - 1].at.getTime() <= chosen[i].at.getTime());
  // Through the whole plan: never more than 60.
  const busy = withChange(withChange(on(), 'tending.candles.daily', true), 'tending.altars.on', true);
  const all = planReminders(input(withPrefs({ calendar_traditions: 'wheel,hellenic_monthly', calendar_extra: 'hindu' }, withChange(busy, 'tending.altars.every', 1)), { legacy: { ...legacy, devotionMorning: true, devotionEvening: true, dreamMorning: true } }));
  assert.equal(all.length, 60);
});

test('the prefs travel in Sanctuary settings, under one key the website shares', () => {
  assert.equal(defaultSettings()[PREFS_KEY], '');
  const value = prefsValue(on());
  const row = settingsRow(normalizeSettings({ [PREFS_KEY]: value }), 'u1', NOW);
  assert.equal(row.settings[PREFS_KEY], value);
  // Read back from the row as the website and the app both store it.
  assert.equal(readPrefs(normalizeSettings({ settings: row.settings }), null).holidays.on, true);
});

test('every kind rings on an Android channel of its own kind', () => {
  const kinds: ReminderKind[] = ['moon', 'ritual', 'devotion', 'sacred', 'dream', 'lookback', 'offering', 'watering', 'deipnon', 'holiday', 'altar', 'crystal', 'candle', 'planning', 'coven', 'summary'];
  const ids = new Set(CHANNELS.map((c) => c.id));
  for (const kind of kinds) assert.ok(ids.has(channelOf(kind)), kind);
  assert.equal(CHANNELS[0].id, 'moon-reminders', 'the first channel keeps its id');
  assert.equal(channelOf('watering'), channelOf('crystal'));
});
