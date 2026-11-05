import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ESP_MODES, espChance, nextTarget } from '../src/lib/craft/psychic/esp.ts';
import { newSession, scoredRuns, sessionTimelineItem } from '../src/lib/craft/psychic/log.ts';
import { describeCard, resolvePrecog, scorePrecog, type PrecogEntry } from '../src/lib/craft/psychic/precog.ts';
import { promptFor, INTUITION_PROMPTS } from '../src/lib/craft/psychic/prompts.ts';
import { pickExcluding, shuffle } from '../src/lib/craft/psychic/random.ts';
import { remotePool, setUpRound } from '../src/lib/craft/psychic/remote.ts';
import { binomialP, byDay, byMoonPhase, byTimeOfDay, poissonBinomialP, streaks, timeOfDay, verdict } from '../src/lib/craft/psychic/stats.ts';

const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

test('binomial p-value is exact', () => {
  assert.ok(Math.abs(binomialP(1, 1, 0.5) - 0.5) < 1e-12);
  assert.ok(Math.abs(binomialP(2, 2, 0.5) - 0.25) < 1e-12);
  assert.ok(Math.abs(binomialP(3, 10, 0.5) - 0.9453125) < 1e-9);
  assert.equal(binomialP(0, 10, 0.2), 1);
  assert.equal(binomialP(11, 10, 0.2), 0);
  // Poisson-binomial with equal chances agrees.
  assert.ok(Math.abs(poissonBinomialP(25, Array(120).fill(0.2)) - binomialP(25, 120, 0.2)) < 1e-9);
  assert.ok(Math.abs(poissonBinomialP(1, [0.5, 0.25]) - 0.625) < 1e-12);
});

test('verdict wording: few, chance, above', () => {
  assert.equal(verdict([]).level, 'none');
  assert.equal(verdict([{ trials: 10, hits: 10, chance: 0.2 }]).level, 'few');
  const chance = verdict([{ trials: 100, hits: 21, chance: 0.2 }]);
  assert.equal(chance.level, 'chance');
  assert.match(chance.words, /in line with chance/);
  const above = verdict([{ trials: 120, hits: 36, chance: 0.2 }]);
  assert.equal(above.level, 'above');
  assert.match(above.words, /above chance \(p/);
  assert.ok(!/psychic/i.test(above.words));
  // Below chance is never "above".
  assert.equal(verdict([{ trials: 100, hits: 5, chance: 0.2 }]).level, 'chance');
  // Mixed chances still resolve.
  assert.equal(verdict([{ trials: 30, hits: 6, chance: 0.2 }, { trials: 30, hits: 15, chance: 0.5 }]).trials, 60);
});

test('esp targets: fair, in range, never three alike in a row', () => {
  assert.equal(espChance('symbols'), 0.2);
  assert.equal(espChance('yesno'), 0.5);
  assert.equal(ESP_MODES.length, 4);
  const rng = seeded(7);
  const hist: string[] = [];
  for (let i = 0; i < 400; i++) hist.push(nextTarget('yesno', hist, rng));
  for (let i = 2; i < hist.length; i++) assert.ok(!(hist[i] === hist[i - 1] && hist[i] === hist[i - 2]));
  assert.ok(hist.every((t) => t === 'yes' || t === 'no'));
  assert.ok(new Set(hist).size === 2);
});

test('pickExcluding never returns an excluded item', () => {
  const rng = seeded(3);
  for (let i = 0; i < 200; i++) assert.notEqual(pickExcluding([1, 2, 3], [2], rng), 2);
  assert.equal(pickExcluding([5], [5]), 5);
  assert.deepEqual([...shuffle([1, 2, 3, 4])].sort(), [1, 2, 3, 4]);
});

test('remote viewing round: target plus three different decoys, shuffled, no recent repeat', () => {
  const pool = remotePool();
  assert.ok(pool.length > 20);
  const rng = seeded(11);
  for (let i = 0; i < 50; i++) {
    const { target, choices } = setUpRound(pool, [pool[0].id, pool[1].id], rng);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices.map((c) => c.id)).size, 4);
    assert.ok(choices.some((c) => c.id === target.id));
    assert.ok(![pool[0].id, pool[1].id].includes(target.id));
  }
});

test('precog: card description and scoring', () => {
  assert.deepEqual(describeCard('The Fool') && [describeCard('The Fool')!.suit, describeCard('The Fool')!.number], ['major', 0]);
  const c = describeCard('Seven of Cups')!;
  assert.deepEqual([c.suit, c.number], ['cups', 7]);
  const king = describeCard('King of Wands')!;
  assert.equal(king.number, 14);
  assert.equal(describeCard('Nonsense'), null);
  assert.deepEqual(scorePrecog({ suit: 'cups', number: 7, text: '' }, c), { exact: true, suit: true, number: true, arcana: true });
  assert.deepEqual(scorePrecog({ suit: 'wands', number: 7, text: '' }, c), { exact: false, suit: false, number: true, arcana: true });
  assert.deepEqual(scorePrecog({ suit: 'major', number: null, text: '' }, c), { exact: false, suit: false, number: null, arcana: false });
  assert.deepEqual(scorePrecog({ suit: '', number: null, text: 'hm' }, c), { exact: false, suit: null, number: null, arcana: null });
});

test('precog resolves against the daily card, waits, and lapses', () => {
  const e: PrecogEntry = { date: '2026-11-04', forDate: '2026-11-05', guess: { suit: 'cups', number: 7, text: '' }, status: 'waiting' };
  assert.equal(resolvePrecog(e, () => 'Seven of Cups', '2026-11-04').status, 'waiting');
  const done = resolvePrecog(e, (d) => (d === '2026-11-05' ? 'Seven of Cups' : null), '2026-11-05');
  assert.equal(done.status, 'resolved');
  assert.equal(done.score?.exact, true);
  assert.equal(resolvePrecog(e, () => null, '2026-11-06').status, 'waiting');
  assert.equal(resolvePrecog(e, () => null, '2026-11-20').status, 'missed');
});

test('streaks, time of day, moon and day aggregation', () => {
  assert.deepEqual(streaks(['2026-11-01', '2026-11-02', '2026-11-04', '2026-11-05'], '2026-11-05'), { current: 2, longest: 2 });
  assert.deepEqual(streaks(['2026-11-01', '2026-11-02', '2026-11-03'], '2026-11-05'), { current: 0, longest: 3 });
  assert.deepEqual(streaks(['2026-11-04'], '2026-11-05'), { current: 1, longest: 1 });
  assert.deepEqual(streaks([], '2026-11-05'), { current: 0, longest: 0 });
  assert.equal(timeOfDay(6), 'Morning');
  assert.equal(timeOfDay(13), 'Afternoon');
  assert.equal(timeOfDay(20), 'Evening');
  assert.equal(timeOfDay(2), 'Night');
  const runs = [
    { trials: 10, hits: 4, chance: 0.2, date: '2026-11-01', at: new Date(2026, 10, 1, 8).toISOString(), moonPhase: 'Full Moon' },
    { trials: 10, hits: 2, chance: 0.2, date: '2026-11-01', at: new Date(2026, 10, 1, 21).toISOString(), moonPhase: 'New Moon' },
    { trials: 10, hits: 3, chance: 0.2, date: '2026-11-02', at: new Date(2026, 10, 2, 9).toISOString(), moonPhase: 'Full Moon' },
  ];
  assert.deepEqual(byDay(runs).map((d) => [d.date, d.trials, d.hits]), [['2026-11-01', 20, 6], ['2026-11-02', 10, 3]]);
  const t = byTimeOfDay(runs);
  assert.deepEqual(t.map((s) => [s.label, s.trials, s.hits]), [['Morning', 20, 7], ['Evening', 10, 2]]);
  const m = byMoonPhase(runs);
  assert.deepEqual(m.map((s) => s.label), ['New Moon', 'Full Moon']);
  assert.ok(Math.abs(m[1].edge - 0.15) < 1e-9);
});

test('sessions: normalised, scored runs, journal row', () => {
  const s = newSession({ kind: 'esp', summary: '10 trials, 3 hits', trials: 10, hits: 3, chance: 0.2 }, new Date(2026, 10, 5, 9));
  assert.equal(s.date, '2026-11-05');
  assert.ok(s.moonPhase);
  const list = [{ id: 'a', data: s }, { id: 'b', data: newSession({ kind: 'intuition', summary: 'x' }) }];
  assert.equal(scoredRuns(list).length, 1);
  assert.equal(scoredRuns(list, 'remote').length, 0);
  const row = sessionTimelineItem(list[0]);
  assert.equal(row.kind, 'psychic');
  assert.match(row.href, /^\/rituals\/craft\/psychic/);
});

test('intuition prompts rotate daily', () => {
  assert.equal(INTUITION_PROMPTS.length, 12);
  assert.notEqual(promptFor('2026-11-05').index, promptFor('2026-11-06').index);
  const seen = new Set(Array.from({ length: 12 }, (_, i) => promptFor(`2026-11-${String(i + 1).padStart(2, '0')}`).index));
  assert.equal(seen.size, 12);
});
