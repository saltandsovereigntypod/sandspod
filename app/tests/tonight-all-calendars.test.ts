// "Set tonight's altar" on every calendar's festivals: the same festivals the
// Seasonal drawer finds (festivalsTonight), the Hindu and Kemetic ones only
// when that calendar is shown, a hidden Christian calendar never, and one
// seasonal thing however many festivals share the night.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { festivalsTonight } from '../src/lib/altar/seasonal.ts';
import { tonightAltar } from '../src/lib/altar/tonight.ts';
import { explainTonight, tonightTheme } from '../src/lib/altar/reading/tonightExplained.ts';
import { holidayChoice, holidaysToday, type HolidayChoice } from '../src/lib/holidays.ts';

const night = (y: number, m: number, d: number) => new Date(y, m, d, 20);
const shows = (calendars: string, more: Record<string, string> = {}) => ({ settings: { calendar_extra: calendars, ...more }, place: null });
const wheel: HolidayChoice = { traditions: ['wheel'], custom: [] };

function tonight(date: Date, choice: HolidayChoice, calendars: ReturnType<typeof shows> | null, moon = 'x') {
  const altar = tonightAltar(date, holidaysToday(date, choice), moon, festivalsTonight(date, choice, calendars));
  const seasonal = altar.doc.objects.filter((o) => o.type === 'seasonal').map((o) => String(o.form));
  const why = explainTonight(altar, date).filter((_, i) => altar.doc.objects[i].type === 'seasonal').map((p) => p.why);
  return { altar, seasonal, why };
}

test('Diwali, Holi, Navaratri, Maha Shivaratri and Ganesh Chaturthi set out their first thing when the Hindu calendar is shown', () => {
  const hindu = shows('hindu');
  for (const [date, id, name] of [
    [night(2026, 10, 8), 'diya-lamps', 'Diwali'],
    [night(2026, 2, 4), 'holi-colours', 'Holi'],
    // Day 4 of Navaratri's nine nights: while it runs, not only on its first.
    [night(2026, 9, 14), 'kalash', 'Navaratri'],
    [night(2026, 1, 15), 'bilva-leaves', 'Maha Shivaratri'],
    [night(2026, 8, 14), 'modak', 'Ganesh Chaturthi'],
  ] as const) {
    const { altar, seasonal, why } = tonight(date, wheel, hindu);
    assert.deepEqual(seasonal, [id], name);
    assert.equal(altar.festival, name);
    // The day's own altar still, with the festival named beside it.
    assert.match(altar.reason, new RegExp(`’s day: .*, on ${name}$`));
    assert.equal(tonightTheme(altar, date).festival, name);
    assert.ok(tonightTheme(altar, date).planet);
    assert.match(why[0], new RegExp(`kept at ${name}\\.$`));
    // Without the calendar shown: the weekday's altar, nothing seasonal.
    const without = tonight(date, wheel, shows(''));
    assert.deepEqual(without.seasonal, [], name);
    assert.equal(without.altar.festival, undefined);
    assert.doesNotMatch(without.altar.reason, new RegExp(name));
    assert.deepEqual(tonight(date, wheel, null).seasonal, []);
  }
});

test('the Epagomenal Days set out their lamps all through, and Wep Ronpet its offering table, when the Kemetic calendar is shown', () => {
  const kemetic = shows('kemetic');
  // 2026's days upon the year run 30 July to 3 August (Sirius at Cairo); Wep Ronpet is 4 August.
  for (const d of [30, 31]) {
    const { altar, seasonal, why } = tonight(night(2026, 6, d), wheel, kemetic);
    assert.deepEqual(seasonal, ['epagomenal-lamps']);
    assert.equal(altar.festival, 'Epagomenal Days');
    assert.match(altar.reason, /, on the Epagomenal Days$/);
    assert.match(why[0], /: one of the things kept at the Epagomenal Days\.$/);
  }
  const last = tonight(night(2026, 7, 3), wheel, kemetic);
  assert.deepEqual(last.seasonal, ['epagomenal-lamps']);
  const wep = tonight(night(2026, 7, 4), wheel, kemetic);
  assert.deepEqual(wep.seasonal, ['hetep-table']);
  assert.match(wep.altar.reason, /, on Wep Ronpet$/);
  assert.match(wep.why[0], /kept at Wep Ronpet\.$/);
  // Not shown: nothing seasonal on either.
  assert.deepEqual(tonight(night(2026, 6, 31), wheel, shows('hindu')).seasonal, []);
  assert.deepEqual(tonight(night(2026, 7, 4), wheel, null).seasonal, []);
});

test('a hidden Christian calendar never sets out its things', () => {
  const kept = holidayChoice({ calendar_traditions: 'wheel,christian' });
  const hidden = holidayChoice({ calendar_traditions: 'wheel,christian', calendar_hidden_traditions: 'christian' });
  const epiphany = night(2026, 0, 6);
  const shown = tonight(epiphany, kept, null);
  assert.deepEqual(shown.seasonal, ['epiphany-chalk']);
  assert.match(shown.altar.reason, /, on Epiphany$/);
  const gone = tonight(epiphany, hidden, null);
  assert.deepEqual(gone.seasonal, []);
  assert.doesNotMatch(gone.altar.reason, /Epiphany/);
  // At Lammas the Wheel's own thing still, as it would be.
  assert.deepEqual(tonight(night(2026, 7, 1), hidden, null).seasonal, ['wheat-sheaf']);
});

test('two calendars on one night: the holiday whose altar is set first, and only one seasonal thing', () => {
  // Lammas (the Wheel's altar) on day 3 of the Epagomenal Days.
  const lammas = tonight(night(2026, 7, 1), wheel, shows('kemetic'));
  assert.equal(lammas.altar.reason, 'Lammas');
  assert.deepEqual(lammas.seasonal, ['wheat-sheaf']);
  assert.equal(lammas.why[0], 'Wheat Sheaf: one of the things kept at Lammas.');
  // The Noumenia (its own altar) on the first night of Navaratri.
  const monthly: HolidayChoice = { traditions: ['wheel', 'hellenic_monthly'], custom: [] };
  const noumenia = tonight(night(2026, 9, 11), monthly, shows('hindu'));
  assert.equal(noumenia.altar.reason, 'Noumenia');
  assert.deepEqual(noumenia.seasonal, ['thymiaterion']);
  // Without an altar of its own on either side, the first of tonight's (the Parentalia, already running) and no more.
  const roman: HolidayChoice = { traditions: ['roman'], custom: [] };
  const feb = tonight(night(2026, 1, 15), roman, shows('hindu'));
  assert.equal(feb.seasonal.length, 1);
  assert.deepEqual(feb.seasonal, ['parentalia-tile']);
  // Alone, Maha Shivaratri's.
  assert.deepEqual(tonight(night(2026, 1, 15), wheel, shows('hindu')).seasonal, ['bilva-leaves']);
});

test('every calendar kept: the Wheel north and south, Celtic, Norse, Greek (monthly days too), Roman and Slavic', () => {
  const only = (id: string): HolidayChoice => ({ traditions: [id], custom: [] });
  for (const [choice, date, id] of [
    [only('wheel'), night(2026, 9, 31), 'pumpkin-lantern'],
    // South of the equator Samhain is 30 April.
    [only('wheel_south'), night(2026, 3, 30), 'pumpkin-lantern'],
    // The Celtic year alone names it Bealtaine and sets out its own May bush, as the drawer puts it first.
    [only('celtic'), night(2026, 4, 1), 'may-bush'],
    [{ traditions: ['wheel', 'celtic'], custom: [] } as HolidayChoice, night(2026, 4, 1), 'flower-crown'],
    [only('norse'), night(2026, 11, 21), 'yule-goat'],
    [only('hellenic'), night(2026, 9, 17), 'eiresione'],
    [only('hellenic_monthly'), night(2026, 9, 11), 'thymiaterion'],
    [only('roman'), night(2026, 11, 17), 'saturnalia-cerei'],
    [only('slavic'), night(2026, 11, 21), 'didukh'],
  ] as const) {
    const { altar, seasonal, why } = tonight(date, choice, null);
    assert.deepEqual(seasonal, [id], `${choice.traditions[0]}: ${altar.reason}`);
    assert.ok(altar.festival && why[0].includes(altar.festival), why[0]);
  }
});

test('the same count of things as before: the festival’s thing keeps the moon’s centre spot', () => {
  const plain = tonightAltar(night(2026, 10, 8), [], 'New Moon');
  const diwali = tonight(night(2026, 10, 8), wheel, shows('hindu'), 'New Moon');
  assert.equal(diwali.altar.doc.objects.length, plain.doc.objects.length);
  assert.ok(!diwali.altar.doc.objects.some((o) => o.vessel === 'spell-jar'));
  assert.match(diwali.altar.reason, /, on Diwali, at the new moon$/);
  assert.equal(tonightTheme(diwali.altar, night(2026, 10, 8)).moon, 'new');
});
