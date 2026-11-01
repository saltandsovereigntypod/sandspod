import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createTicker } from '../src/lib/altar/ticker.ts';

function fakeEnv() {
  let t = 0;
  let next = 1;
  const timers = new Map<number, { fn: () => void; ms: number; at: number }>();
  let created = 0;
  return {
    env: {
      setInterval: (fn: () => void, ms: number) => {
        created += 1;
        const id = next++;
        timers.set(id, { fn, ms, at: t + ms });
        return id as unknown as ReturnType<typeof setInterval>;
      },
      clearInterval: (id: ReturnType<typeof setInterval>) => void timers.delete(id as unknown as number),
      now: () => t,
    },
    advance(ms: number) {
      const end = t + ms;
      for (;;) {
        const due = [...timers.values()].filter((x) => x.at <= end).sort((a, b) => a.at - b.at)[0];
        if (!due) break;
        t = due.at;
        due.at += due.ms;
        due.fn();
      }
      t = end;
    },
    live: () => timers.size,
    created: () => created,
  };
}

test('twelve candles share one interval, and each hears every beat', () => {
  const f = fakeEnv();
  const ticker = createTicker(f.env);
  const heard = Array(12).fill(0);
  const offs = heard.map((_, i) => ticker.subscribe(10_000, () => (heard[i] += 1)));
  assert.equal(f.live(), 1); // before: one setInterval per object, 12
  f.advance(60_000);
  assert.deepEqual(heard, Array(12).fill(6));
  assert.equal(ticker.now(10_000), 60_000);
  offs.forEach((off) => off());
  assert.equal(f.live(), 0);
  assert.equal(f.created(), 1);
});

test('the clock stops in the background and catches up on return', () => {
  const f = fakeEnv();
  const ticker = createTicker(f.env);
  let beats = 0;
  ticker.subscribe(10_000, () => (beats += 1));
  ticker.setAwake(false);
  assert.equal(f.live(), 0);
  f.advance(120_000);
  assert.equal(beats, 0);
  ticker.setAwake(true);
  assert.equal(f.live(), 1);
  assert.equal(beats, 1);
  assert.equal(ticker.now(10_000), 120_000);
});

test('a first watcher reads the time now, not when the clock last ran', () => {
  const f = fakeEnv();
  const ticker = createTicker(f.env);
  const off = ticker.subscribe(20_000, () => {});
  off();
  f.advance(95_000);
  ticker.subscribe(20_000, () => {});
  assert.equal(ticker.now(20_000), 95_000);
});
