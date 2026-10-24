import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { onReplayTour, replayWelcomeTour, TOUR_PAGES, TOUR_SEEN_KEY } from '../src/lib/welcomeTour.ts';

test('the welcome tour: one calm page per main feature, ending at How to', () => {
  assert.equal(TOUR_SEEN_KEY, 'welcome.tour.v2');
  assert.ok(TOUR_PAGES.length >= 8 && TOUR_PAGES.length <= 12, `${TOUR_PAGES.length} pages`);
  assert.equal(new Set(TOUR_PAGES.map((p) => p.title)).size, TOUR_PAGES.length, 'titles are unique');
  for (const page of TOUR_PAGES) {
    assert.ok(page.title.length <= 40, page.title);
    // One or two sentences, in the house voice.
    const sentences = page.body.split(/[.?:](?=\s|$)/).filter((s) => s.trim()).length;
    assert.ok(sentences >= 1 && sentences <= 3, `${page.title}: ${sentences} sentences`);
    assert.doesNotMatch(page.body + page.title, /!/, `${page.title}: no exclamation marks`);
  }
  const all = TOUR_PAGES.map((p) => `${p.title} ${p.body}`).join(' ');
  for (const feature of ['Today', 'cabinet', 'Seasonal', 'houseplants', 'offerings', 'spell jar', 'petition', 'tonight’s altar', 'widget', 'did it work', 'tarot', 'runes', 'ogham', 'sigil', 'Grimoire', 'Living Library', 'dreams', 'My practice', 'Dedication journeys', 'patron', 'Closed & living traditions', 'calendars', 'Reminders', 'coven', 'website', 'guest']) {
    assert.ok(all.toLowerCase().includes(feature.toLowerCase()), `the tour mentions ${feature}`);
  }
  // The last page sends people to the guide by its real name on the More screen.
  assert.match(TOUR_PAGES[TOUR_PAGES.length - 1].body, /More → How to use the app/);
  assert.match(readFileSync('src/app/(tabs)/more/index.tsx', 'utf8'), /label="How to use the app"/);
});

test('the tour can be replayed while one is listening', () => {
  assert.equal(replayWelcomeTour(), false);
  let shown = 0;
  const stop = onReplayTour(() => shown++);
  assert.equal(replayWelcomeTour(), true);
  assert.equal(shown, 1);
  stop();
  assert.equal(replayWelcomeTour(), false);
  assert.equal(shown, 1);
});
