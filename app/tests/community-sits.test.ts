// Public sits in Community: everyone's clock from the same start time, the
// phases, the listing (hidden and blocked left out), the sound choices and
// the form's checks.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cleanSitSound, isSitHidden, listedSits, sitClock, sitElapsed, sitEnd, sitMix, sitPayload, sitPhase, sitPlanOf, sitReportUrl, soundChoiceOf, soundFromChoice, startChoices, type PublicSit } from '../src/lib/community/sits.ts';
import { DEFAULT_PLAN, elapsedOf } from '../src/lib/meditation/timer.ts';

const START = Date.parse('2026-11-04T19:30:00Z');
const sit = (extra: Partial<PublicSit> = {}): PublicSit => ({
  id: 's1',
  host_id: 'h',
  title: 'New moon sit',
  intention: null,
  starts_at: new Date(START).toISOString(),
  minutes: 20,
  plan: { settle: 1, warm: 0 },
  sound: {},
  status: 'scheduled',
  joined_count: 3,
  created_at: '2026-11-01T00:00:00Z',
  ...extra,
});

test('everyone’s timer counts from the same start, whenever they open it', () => {
  const s = sit();
  const early = sitClock(s);
  const late = sitClock(s);
  assert.equal(early.startedAt, START);
  // Two people opening it at different moments read the same elapsed time at the same instant.
  const now = START + 7 * 60_000 + 1234;
  assert.equal(elapsedOf(early, now), elapsedOf(late, now));
  assert.equal(sitElapsed(s, now), 7 * 60_000 + 1234);
  assert.equal(sitElapsed(s, START - 5000), 0);
});

test('phases follow the start and the whole length (settling included)', () => {
  const s = sit();
  assert.equal(sitPlanOf(s).minutes, 20);
  assert.equal(sitEnd(s), START + 21 * 60_000);
  assert.equal(sitPhase(s, START - 1), 'upcoming');
  assert.equal(sitPhase(s, START), 'sitting');
  assert.equal(sitPhase(s, START + 21 * 60_000), 'ended');
  assert.equal(sitPhase(sit({ status: 'cancelled' }), START), 'cancelled');
});

test('the list leaves out ended, cancelled, hidden and blocked sits', () => {
  const sits = [sit({ id: 'b', starts_at: new Date(START + 3600_000).toISOString() }), sit({ id: 'a' }), sit({ id: 'x', status: 'cancelled' }), sit({ id: 'old', starts_at: '2026-11-01T00:00:00Z' }), sit({ id: 'blk', host_id: 'bad' })];
  const hidden = { posts: [], authors: ['bad'] };
  assert.deepEqual(listedSits(sits, START - 60_000, hidden).map((s) => s.id), ['a', 'b']);
  assert.equal(isSitHidden(sit(), { posts: ['sit:s1'], authors: [] }), true);
  assert.match(sitReportUrl(sit()), /community-sit%2Fs1/);
});

test('sound: shared layers in step, binaural for each', () => {
  assert.equal(soundChoiceOf(soundFromChoice('drum')), 'drum');
  assert.equal(soundChoiceOf(soundFromChoice('binaural:alpha')), 'binaural:alpha');
  assert.deepEqual(cleanSitSound({ binaural: 'nope', shared: { layer: 'flute' } }), { shared: null, binaural: null });
  assert.equal(sitMix(soundFromChoice('')), null);
  assert.ok((sitMix(soundFromChoice('bowls'))?.levels.bowls ?? 0) > 0);
  assert.equal(sitMix(soundFromChoice('binaural:theta6'))?.binaural, 'theta6');
});

test('the form: a name, a time ahead, a length', () => {
  const now = new Date(START - 3600_000);
  const draft = { title: ' Sit ', intention: '', startsAt: new Date(START + 15_000), minutes: 20, plan: DEFAULT_PLAN, sound: soundFromChoice('') };
  const ok = sitPayload(draft, now);
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.row.title, 'Sit');
    assert.equal(ok.row.starts_at, new Date(START).toISOString());
  }
  assert.equal(sitPayload({ ...draft, title: '' }, now).ok, false);
  assert.equal(sitPayload({ ...draft, startsAt: new Date(now.getTime() - 1000) }, now).ok, false);
  assert.equal(sitPayload({ ...draft, minutes: 500 }, now).ok, false);
  const choices = startChoices(new Date(2026, 10, 4, 18, 7));
  assert.equal(choices[0].at.getMinutes() % 15, 0);
  assert.ok(choices[0].at.getTime() > new Date(2026, 10, 4, 18, 7).getTime());
});
