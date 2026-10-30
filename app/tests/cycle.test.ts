import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

import { moonTimeAltar } from '../src/lib/altar/tonight.ts';
import { SPREADS } from '../src/lib/divination/draw.ts';
import { traditionalEntries } from '../src/lib/library/model.ts';
import { moonState, nextPhase } from '../src/lib/moon.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';
import { SUGGESTIONS } from '../src/lib/cycle/content.ts';
import {
  addDays,
  bleedMoon,
  changeSettings,
  cycleDayOn,
  cycleStats,
  dayKey,
  emptyData,
  endBleed,
  isIrregular,
  mergeData,
  nextBleedEstimate,
  normalizeData,
  notePatterns,
  patternSummary,
  putNote,
  quarterOf,
  removeBleed,
  seasonForCycleDay,
  startBleed,
  todayCardRelevant,
  todayView,
  wheelModel,
  emptyNote,
} from '../src/lib/cycle/model.ts';
import { cycleReminders, DISCREET_BODY } from '../src/lib/cycle/reminders.ts';
import { isMoonStatus, statusRow } from '../src/lib/cycle/status.ts';
import {
  changePassphrase,
  decryptData,
  deviceVault,
  formatRecovery,
  newDataKey,
  parseRecovery,
  passphraseKeySync,
  protectVault,
  unlockWithPassphrase,
  unlockWithRecovery,
  VaultError,
  withData,
  type Vault,
} from '../src/lib/cycle/vault.ts';
import type { CycleData } from '../src/lib/cycle/types.ts';

let n = 0;
const id = () => `b${++n}`;
const at = (key: string, hour = 12) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, hour);
};
/** Bleeds beginning on these days, each five days long. */
function withBleeds(starts: string[], base: CycleData = emptyData()): CycleData {
  let data = base;
  for (const s of starts) {
    data = startBleed(data, s, id, at(s));
    data = endBleed(data, addDays(s, 4), at(s));
  }
  return data;
}
const every = (start: string, gaps: number[]) => gaps.reduce<string[]>((list, g) => [...list, addDays(list[list.length - 1], g)], [start]);
// Cheap scrypt for the tests; the real cost is checked once on its own.
const CHEAP = { N: 2 ** 10, r: 8, p: 1 };

test('cycle maths: a steady 28-day rhythm, the day, and a gentle estimate', () => {
  const data = withBleeds(every('2026-06-01', [28, 28, 28]));
  const stats = cycleStats(data);
  assert.deepEqual(stats.lengths, [28, 28, 28]);
  assert.equal(stats.typical, 28);
  assert.equal(stats.varies, false);
  const last = '2026-08-24';
  const c = cycleDayOn(data, addDays(last, 2), stats)!;
  assert.equal(c.day, 3);
  assert.equal(c.bleeding, true);
  assert.equal(c.season, 'winter');
  const est = nextBleedEstimate(data, at(addDays(last, 24)))!;
  assert.equal(est.daysAway, 4);
  assert.equal(est.line, 'Your bleed may start in about 4 days, around 21 September.');
  assert.equal(est.from, '2026-09-21');
  assert.equal(est.span, null);
  // While bleeding there's nothing to estimate.
  assert.equal(nextBleedEstimate(data, at(addDays(last, 1))), null);
});

test('inner seasons map onto cycle days, whatever the length', () => {
  const mark = { winter: 'w', spring: 's', summer: 'u', autumn: 'a' } as const;
  const seasons = (len: number, blen = 5) => Array.from({ length: len }, (_, i) => mark[seasonForCycleDay(i + 1, len, blen)]).join('');
  assert.equal(seasons(28), 'wwwww' + 'sssssss' + 'uuuuuuu' + 'aaaaaaaaa');
  assert.equal(seasonForCycleDay(1, 28, 5), 'winter');
  assert.equal(seasonForCycleDay(6, 28, 5), 'spring');
  assert.equal(seasonForCycleDay(13, 28, 5), 'summer');
  assert.equal(seasonForCycleDay(20, 28, 5), 'autumn');
  // Short and long cycles still have every season, in order.
  for (const len of [21, 24, 35, 45]) {
    const s = seasons(len);
    assert.match(s, /^w+s+u+a+$/, `${len}: ${s}`);
  }
  // A late day stays autumn.
  assert.equal(seasonForCycleDay(40, 28, 5), 'autumn');
});

test('irregular cycles: a range instead of a day, and long gaps left out', () => {
  const data = withBleeds(every('2026-01-03', [24, 35, 29, 41, 120, 30]));
  const stats = cycleStats(data);
  // The 120-day gap (a pause) isn't a cycle.
  assert.deepEqual(stats.lengths, [24, 35, 29, 41, 30]);
  assert.equal(stats.varies, true);
  assert.ok(isIrregular(data, stats));
  const last = data.bleeds[data.bleeds.length - 1].start;
  const est = nextBleedEstimate(data, at(addDays(last, 9)))!;
  assert.ok(est.span);
  assert.match(est.line, /^Your bleed may start between \d+ (\w+ )?and \d+ \w+\.$/);
  // Told they're irregular, even a steady log is read gently; told they're pregnant, no estimate at all.
  const told = changeSettings(withBleeds(every('2026-06-01', [28, 28])), { situations: ['pregnant'] }, new Date());
  assert.equal(nextBleedEstimate(told, at('2026-07-10')), null);
  // After a birth, no estimate until a rhythm returns.
  const after = changeSettings(withBleeds(every('2026-06-01', [30])), { situations: ['postpartum'] }, new Date());
  assert.equal(nextBleedEstimate(after, at('2026-07-10')), null);
  // Much later than usual: no countdown, a gentle word instead.
  const late = withBleeds(every('2026-06-01', [28]));
  assert.match(nextBleedEstimate(late, at('2026-08-05'))!.line, /later than your usual rhythm/);
  // Long after the last bleed, no day is counted.
  assert.equal(cycleDayOn(late, '2026-12-01'), null);
});

test('moon-only mode: the moon gives the season, and nothing is estimated', () => {
  const data = changeSettings(withBleeds(every('2026-06-01', [28, 28])), { mode: 'moon' }, new Date());
  const now = new Date(2026, 9, 30, 12);
  const view = todayView(data, now);
  assert.equal(view.byMoon, true);
  const q = quarterOf(moonState(now).fraction);
  assert.equal(view.quarter, q);
  assert.equal(view.season, { dark: 'winter', waxing: 'spring', full: 'summer', waning: 'autumn' }[q]);
  assert.match(view.line, /^Moon day \d+ · inner (winter|spring|summer|autumn) · (dark|waxing|full|waning) moon$/);
  assert.equal(nextBleedEstimate(data, now), null);
  assert.equal(todayCardRelevant(data, now), true);
  // With no bleeds logged and following their cycle, Today has no card.
  assert.equal(todayCardRelevant(emptyData(), now), false);
});

test('moon patterns: where in the lunar month a bleed began', () => {
  const newMoon = nextPhase(new Date(2026, 0, 1), 'new');
  const full = nextPhase(new Date(2026, 0, 1), 'full');
  const onNew = bleedMoon({ id: 'x', start: dayKey(newMoon), end: null, flow: {}, updatedAt: '' });
  assert.equal(onNew.pattern, 'white');
  assert.ok(onNew.fromNew <= 1);
  const onFull = bleedMoon({ id: 'y', start: dayKey(full), end: null, flow: {}, updatedAt: '' });
  assert.equal(onFull.pattern, 'red');
  const waxing = bleedMoon({ id: 'z', start: addDays(dayKey(newMoon), 7), end: null, flow: {}, updatedAt: '' });
  assert.equal(waxing.pattern, 'pink');
  const waning = bleedMoon({ id: 'w', start: addDays(dayKey(full), 7), end: null, flow: {}, updatedAt: '' });
  assert.equal(waning.pattern, 'purple');

  // Three bleeds a day or two after three new moons.
  let from = new Date(2026, 3, 1);
  const starts: string[] = [];
  for (let i = 0; i < 3; i++) {
    const nm = nextPhase(from, 'new');
    starts.push(addDays(dayKey(nm), i === 1 ? 2 : 1));
    from = new Date(nm.getTime() + 86_400_000 * 3);
  }
  const data = withBleeds(starts);
  assert.equal(patternSummary(data), 'Your last 3 bleeds began within 2 days of the new moon.');
  assert.equal(patternSummary(emptyData()), null);
  const wheel = wheelModel(data, at(starts[2]));
  assert.ok(wheel.days.length >= 29 && wheel.days.length <= 31, String(wheel.days.length));
  assert.equal(wheel.bleeds.length, 3);
  assert.ok(wheel.bleeds.every((b) => b.pattern === 'white'));
  assert.equal(wheel.days[0].fraction < 0.1 || wheel.days[0].fraction > 0.95, true);
});

test('notes show their patterns by season', () => {
  let data = withBleeds(every('2026-06-01', [28, 28, 28]));
  const now = new Date(2026, 8, 1);
  for (const start of ['2026-06-01', '2026-06-29', '2026-07-27']) {
    data = putNote(data, { ...emptyNote(addDays(start, 1)), intuition: 5, energy: 2, dreams: 'a river' }, now);
    data = putNote(data, { ...emptyNote(addDays(start, 8)), intuition: 2, energy: 4 }, now);
    data = putNote(data, { ...emptyNote(addDays(start, 14)), intuition: 3, energy: 5 }, now);
  }
  const lines = notePatterns(data);
  assert.ok(lines.includes('Your intuition notes peak in inner winter.'), lines.join(' | '));
  assert.ok(lines.includes('Your energy notes peak in inner summer.'), lines.join(' | '));
  assert.ok(lines.includes('You write down more dreams in inner winter.'), lines.join(' | '));
});

test('merging two copies keeps the newer of each and every deletion', () => {
  const base = withBleeds(['2026-06-01', '2026-06-29']);
  const phone = putNote(base, { ...emptyNote('2026-06-03'), text: 'from the phone' }, new Date('2026-07-01T10:00:00Z'));
  const site = removeBleed(putNote(base, { ...emptyNote('2026-06-03'), text: 'from the website' }, new Date('2026-07-01T11:00:00Z')), base.bleeds[0].id, new Date('2026-07-01T11:00:00Z'));
  const merged = mergeData(phone, site);
  assert.equal(merged.notes[0].text, 'from the website');
  assert.equal(merged.bleeds.length, 1);
  assert.deepEqual(mergeData(site, phone), merged);
  // A shape that came from storage is cleaned, not trusted.
  const odd = normalizeData({ bleeds: [{ id: 1, start: 'x' }, { id: 'a', start: '2026-01-01', end: '2025-12-01', flow: { '2026-01-01': 'heavy', bad: 'x' } }], notes: [{ date: '2026-01-02', energy: 9 }] });
  assert.equal(odd.bleeds.length, 1);
  assert.equal(odd.bleeds[0].end, null);
  assert.deepEqual(odd.bleeds[0].flow, { '2026-01-01': 'heavy' });
  assert.equal(odd.notes[0].energy, null);
  assert.equal(odd.settings.reminders.on, false);
  assert.equal(odd.settings.archetypes, false);
});

test('encryption: round trip, wrong passphrase, recovery key, tampering', async () => {
  const data = withBleeds(['2026-06-01']);
  const key = newDataKey();
  const { vault, recovery } = await protectVault(key, data, 'a quiet river at dusk', new Date(), { cost: CHEAP });
  assert.match(recovery, /^([0-9A-HJKMNP-TV-Z]{4}-){7}[0-9A-HJKMNP-TV-Z]{4}$/);
  assert.ok(!vault.data.includes('2026-06-01'));
  const opened = await unlockWithPassphrase(vault, 'a quiet river at dusk');
  assert.deepEqual(decryptData(opened, vault.data), data);
  await assert.rejects(() => unlockWithPassphrase(vault, 'a quiet river at dawn'), (e: unknown) => e instanceof VaultError && e.code === 'wrong-passphrase');
  // The recovery key works however it's typed.
  assert.deepEqual(unlockWithRecovery(vault, recovery.toLowerCase().replace(/-/g, ' ')), key);
  assert.throws(() => unlockWithRecovery(vault, recovery.replace(/^./, (c) => (c === 'A' ? 'B' : 'A'))), (e: unknown) => e instanceof VaultError && e.code === 'wrong-recovery');
  // Changed ciphertext doesn't open.
  const bytes = vault.data.split('');
  bytes[60] = bytes[60] === 'A' ? 'B' : 'A';
  assert.throws(() => decryptData(key, bytes.join('')), (e: unknown) => e instanceof VaultError && e.code === 'damaged');
  // A new passphrase; the old recovery key still opens it.
  const changed = await changePassphrase(vault, key, 'stars over the hill', new Date(), { cost: CHEAP });
  assert.equal(changed.recovery, null);
  assert.deepEqual(await unlockWithPassphrase(changed.vault, 'stars over the hill'), key);
  await assert.rejects(() => unlockWithPassphrase(changed.vault, 'a quiet river at dusk'));
  assert.deepEqual(unlockWithRecovery(changed.vault, recovery), key);
  // Too short a passphrase is refused.
  await assert.rejects(() => protectVault(key, data, 'short', new Date(), { cost: CHEAP }), (e: unknown) => e instanceof VaultError && e.code === 'no-passphrase');
  // Kept on this device: no passphrase at all, still encrypted.
  const local = deviceVault(key, data, new Date());
  assert.equal(local.kdf, null);
  assert.deepEqual(decryptData(key, withData(local, key, data, new Date()).data), data);
  // A recovery key reads back to the same bytes.
  const raw = new Uint8Array(20).map((_, i) => i * 13);
  assert.deepEqual(parseRecovery(formatRecovery(raw)), raw);
});

test('encryption: the real scrypt cost, and a stored vault asking too much is refused', () => {
  const started = performance.now();
  passphraseKeySync('correct horse battery staple', { name: 'scrypt', N: 2 ** 15, r: 8, p: 1, salt: 'AAAAAAAAAAAAAAAAAAAAAA==' });
  const ms = performance.now() - started;
  // Generous: a desktop takes about a quarter of a second.
  assert.ok(ms < 10_000, `${ms}ms`);
  assert.throws(() => passphraseKeySync('x', { name: 'scrypt', N: 2 ** 24, r: 8, p: 1, salt: 'AAAAAAAAAAAAAAAAAAAAAA==' }), VaultError);
});

/** The website's build (js/core/cycle.js), in a sandbox like a browser's. */
function websiteCycle() {
  const code = readFileSync(new URL('../../js/core/cycle.js', import.meta.url), 'utf8');
  const window: Record<string, unknown> = {};
  const context: Record<string, unknown> = { window, crypto: globalThis.crypto, TextEncoder, TextDecoder, console, setTimeout, clearTimeout };
  vm.runInNewContext(code, context);
  return ((context.SaltCore ?? window.SaltCore) as Record<string, Record<string, Record<string, (...args: never[]) => unknown>>>).cycle;
}

test('the same ciphertext opens on the phone and on the website', async () => {
  const site = websiteCycle();
  const data = changeSettings(putNote(withBleeds(['2026-06-01', '2026-06-29']), { ...emptyNote('2026-06-02'), dreams: 'an owl' }, new Date()), { archetypes: true }, new Date());
  const key = newDataKey();
  const { vault, recovery } = await protectVault(key, data, 'moon over the water', new Date(), { cost: CHEAP });
  // The phone's vault, opened by the website's code.
  const siteKey = (await (site.vault.unlockWithPassphrase as unknown as (v: Vault, p: string) => Promise<Uint8Array>)(vault, 'moon over the water')) as Uint8Array;
  assert.deepEqual(Array.from(siteKey), Array.from(key));
  const siteData = JSON.parse(JSON.stringify(site.vault.decryptData(siteKey as never, vault.data as never)));
  assert.deepEqual(siteData, JSON.parse(JSON.stringify(data)));
  assert.deepEqual(Array.from((site.vault.unlockWithRecovery as unknown as (v: Vault, r: string) => Uint8Array)(vault, recovery)), Array.from(key));
  // The website's vault, opened by the phone's code.
  const theirs = (await (site.vault.protectVault as unknown as (k: Uint8Array, d: CycleData, p: string, n: Date, o: object) => Promise<{ vault: Vault }>)(key, data, 'written on the website', new Date(), { cost: CHEAP })).vault;
  const k2 = await unlockWithPassphrase(JSON.parse(JSON.stringify(theirs)), 'written on the website');
  assert.deepEqual(JSON.parse(JSON.stringify(decryptData(k2, theirs.data))), JSON.parse(JSON.stringify(data)));
  await assert.rejects(() => unlockWithPassphrase(JSON.parse(JSON.stringify(theirs)), 'written on the phone'));
  // And the website works out the same day and season.
  const now = new Date(2026, 6, 3, 12);
  assert.deepEqual(JSON.parse(JSON.stringify(site.model.todayView(data as never, now as never))), JSON.parse(JSON.stringify(todayView(data, now))));
});

test('reminders are off by default, and discreet unless asked', () => {
  const data = withBleeds(every('2026-06-01', [28]));
  const now = at('2026-07-05');
  assert.deepEqual(cycleReminders(data, now), []);
  const on = changeSettings(data, { reminders: { on: true, full: false, ahead: 3, at: 9 * 60 } }, now);
  const quiet = cycleReminders(on, now);
  assert.equal(quiet.length, 1);
  assert.equal(quiet[0].title, 'Cycle & Moon');
  assert.equal(quiet[0].body, DISCREET_BODY);
  assert.equal(dayKey(quiet[0].at), '2026-07-24');
  assert.ok(!/bleed|period|moon time/i.test(`${quiet[0].title} ${quiet[0].body}`));
  const full = cycleReminders(changeSettings(on, { reminders: { on: true, full: true, ahead: 3, at: 9 * 60 } }, now), now);
  assert.equal(full[0].body, 'Your bleed may start in about 3 days. Inner autumn: time to slow down.');
  const moon = cycleReminders(changeSettings(on, { mode: 'moon' }, now), now);
  assert.ok(moon.length >= 4);
  assert.ok(moon.every((r) => r.body === DISCREET_BODY));
});

test('every practice suggestion opens something real', () => {
  const library = new Set(traditionalEntries().map((e) => e.id));
  const spreads = new Set(SPREADS.map((s) => s.id));
  for (const season of Object.values(SUGGESTIONS)) {
    for (const s of Object.values(season)) {
      assert.ok(s.links.length > 0);
      for (const link of s.links) {
        if (link.kind === 'premade') assert.ok(premadeById(link.id), link.id);
        if (link.kind === 'library') assert.ok(library.has(link.id), link.id);
        if (link.kind === 'spread') assert.ok(spreads.has(link.id), link.id);
      }
    }
  }
});

test('the moon-time altar sets out a red candle, a moon bowl and a red cord from the cabinet', () => {
  const altar = moonTimeAltar(new Date(2026, 9, 30));
  const ids = altar.doc.objects.map((o) => String(o.id ?? o.itemId ?? o.label));
  assert.equal(altar.doc.objects.length, 10, altar.labels.join(', '));
  assert.ok(altar.labels.some((l) => /red/i.test(l) && /candle|pillar/i.test(l)), altar.labels.join(', '));
  assert.ok(altar.labels.some((l) => /bowl of water/i.test(l)), altar.labels.join(', '));
  assert.ok(altar.labels.some((l) => /red cord/i.test(l)), altar.labels.join(', '));
  assert.ok(ids.length);
});

test('the coven status is one of a few words, for a few days', () => {
  const now = new Date('2026-10-30T12:00:00Z');
  const row = statusRow('me', 'moon_time_resting', ['c1', 'c1'], ['p1', 'me'], 30, now);
  assert.deepEqual(row.shared_covens, ['c1']);
  assert.deepEqual(row.shared_people, ['p1']);
  assert.equal(row.expires_at, '2026-11-06T12:00:00.000Z');
  assert.ok(isMoonStatus('moon_time'));
  assert.ok(!isMoonStatus('day 3 of my period'));
});
