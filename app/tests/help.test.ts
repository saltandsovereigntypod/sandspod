import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

import { fold, HELP, searchHelp, type HelpSection } from '../src/lib/help/index.ts';

const screen = (href: string) => {
  const base = `src/app/(tabs)${href.replace(/\/$/, '')}`;
  return existsSync(`${base}.tsx`) || existsSync(`${base}/index.tsx`);
};

test('the guide is well formed, and every "Take me there" opens a real screen', () => {
  assert.ok(HELP.length >= 5);
  const ids = new Set<string>();
  for (const section of HELP) {
    assert.ok(section.title && section.intro && section.topics.length, section.id);
    for (const topic of section.topics) {
      assert.match(topic.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, topic.id);
      assert.ok(!ids.has(topic.id), `duplicate ${topic.id}`);
      ids.add(topic.id);
      assert.ok(topic.title && topic.summary && topic.steps.length, topic.id);
      if (topic.href) assert.ok(screen(topic.href), `${topic.id}: no screen at ${topic.href}`);
    }
  }
});

test('search finds by title, keyword and steps, best first', () => {
  const sample: HelpSection[] = [
    {
      id: 'altar',
      title: 'Altar',
      intro: 'Your altars.',
      topics: [
        { id: 'carve', title: 'Carve a word into a candle', summary: 'Mark the wax.', steps: ['Tap "Carve".'], keywords: ['inscribe'] },
        { id: 'light', title: 'Light a candle', summary: 'Burn it.', steps: ['Tap the candle, then carve nothing.'] },
      ],
    },
  ];
  assert.deepEqual(searchHelp('carve', sample).map((r) => r.topic.id), ['carve', 'light']);
  assert.deepEqual(searchHelp('INSCRIBE', sample).map((r) => r.topic.id), ['carve']);
  assert.deepEqual(searchHelp('candle carve', sample)[0].topic.id, 'carve');
  assert.deepEqual(searchHelp('  ', sample), []);
  assert.deepEqual(searchHelp('zzz', sample), []);
  assert.equal(fold('Book of Shadows!'), 'book of shadows');
});

test('the guide covers every main feature, in the house voice', () => {
  const sections = new Set(HELP.map((s) => s.id));
  for (const id of ['getting-started', 'today', 'calendars', 'reminders', 'altar', 'grimoire', 'rituals', 'journeys', 'divination', 'my-practice', 'living-library', 'covens', 'community', 'sanctuary', 'widgets']) {
    assert.ok(sections.has(id), `section ${id}`);
  }
  const topics = new Map(HELP.flatMap((s) => s.topics.map((t) => [t.id, t] as const)));
  for (const id of [
    'replay-welcome-tour',
    'today-holy-pages',
    'today-card-of-the-day',
    'calendar-count-by-moon',
    'calendar-old-calendars',
    'reminders-everything',
    'altar-offerings-drawer',
    'altar-potted-plants',
    'altar-seasonal',
    'altar-tonights-altar',
    'altar-widget',
    'altar-crystal-care',
    'practice-dream-journal',
    'grimoire-divination-pages',
    'divination-own-spread',
    'practice-sigil',
    'ritual-did-it-work',
    'apothecary-did-it-work',
    'ritual-what-works',
    'journeys-patron',
    'practice-my-deities',
    'covens-found',
    'covens-rituals',
    'covens-book',
    'covens-my-path',
  ]) {
    assert.ok(topics.has(id), `topic ${id}`);
  }
  for (const topic of topics.values()) {
    const text = [topic.title, topic.summary, ...topic.steps, ...(topic.tips ?? [])].join(' ');
    assert.doesNotMatch(text, /!/, `${topic.id}: no exclamation marks`);
    if (topic.href) assert.doesNotMatch(topic.href, /[[\]]/, `${topic.id}: a whole route, not a pattern`);
  }
  assert.equal(searchHelp('welcome tour')[0].topic.id, 'replay-welcome-tour');
});
