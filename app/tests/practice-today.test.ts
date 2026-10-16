import assert from 'node:assert/strict';
import { test } from 'node:test';

import { practiceToday, whenWords } from '../src/lib/craft/today.ts';
import { holidayChoice } from '../src/lib/holidays.ts';

const ALL = ['eclectic', 'green', 'kitchen', 'hedge', 'solitary', 'cosmic', 'crystal', 'elemental', 'sea', 'folk'] as const;
const ctx = { place: { latitude: 51.5, longitude: -0.12 }, choice: holidayChoice({}) };

test('a line for every practice, each opening a real tool', async () => {
  const { existsSync } = await import('node:fs');
  for (const day of ['2026-01-05T08:00:00', '2026-06-21T13:00:00', '2026-10-16T21:00:00']) {
    const lines = practiceToday([...ALL], new Date(day), ctx);
    assert.equal(lines.length, ALL.length, day);
    for (const l of lines) {
      assert.ok(l.line && l.label, `${day} ${l.practice}`);
      const base = `src/app/(tabs)${l.href}`;
      assert.ok(existsSync(`${base}.tsx`) || existsSync(`${base}/index.tsx`), `${l.practice}: ${l.href}`);
    }
  }
});

test('only the practices kept, in order; no place still works', () => {
  const lines = practiceToday(['sea', 'cosmic'], new Date('2026-10-16T09:00:00'), { ...ctx, place: null });
  assert.deepEqual(lines.map((l) => l.practice), ['sea', 'cosmic']);
  assert.match(lines[1].line, /’s day$/);
  assert.deepEqual(practiceToday([], new Date(), ctx), []);
});

test('when words', () => {
  const d = new Date('2026-10-23T12:00:00'); // a Friday
  assert.equal(whenWords(0, d), 'today');
  assert.equal(whenWords(1, d), 'tomorrow');
  assert.equal(whenWords(4, d), 'on Friday');
  assert.equal(whenWords(12, d), 'in 12 days');
});
