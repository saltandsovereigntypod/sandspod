// Small follow-ups: Cycle & Moon's one card for today, the Sumbel, rune
// meanings on the website, Hearth & land in the website's Grimoire, and the
// ancestor frame's photo on the website's Ancestors page.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { courseLinkAppHref, courseLinkSiteHref } from '../src/lib/covens/courseLinks.ts';
import { traditionPath } from '../src/lib/covens/courses/index.ts';
import { todayView } from '../src/lib/cycle/model.ts';
import { exactReading, homeHeadline } from '../src/lib/cycle/readings.ts';
import { runeMeaningsHref } from '../src/lib/divination/links.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';

const read = (p: string) => readFileSync(p, 'utf8');

test('Cycle & Moon: one card for today, every line said once', () => {
  const now = new Date(2026, 9, 31, 12);
  const moonOnly = { settings: { mode: 'moon' }, bleeds: [], days: {} } as never;
  const view = todayView(moonOnly, now);
  const reading = exactReading(moonOnly, now);
  const headline = homeHeadline(view, reading);
  assert.match(headline, /^Moon day \d+ · inner \w+ by the moon · [a-z ]+moon$/, headline);
  assert.ok(headline.includes(view.line.split(' · ')[0]), 'the moon’s day is kept');
  assert.ok(!reading.moonDetail.includes(reading.moon.name), 'the detail leaves out the phase the headline names');
  assert.ok(reading.moonLine.endsWith(reading.moonDetail));
  assert.equal(homeHeadline({ line: 'Day 3 · inner winter · dark moon', byMoon: false }, { headline: 'Cycle day 3 · inner winter (menstrual) · new moon', byMoon: false }), 'Cycle day 3 · inner winter (menstrual) · new moon');
  // One card on both: no separate "Today" card repeating the line above the reading.
  const app = read('src/app/(tabs)/rituals/cycle/index.tsx');
  assert.match(app, /<ReadingCard reading=\{reading\} headline=\{homeHeadline\(view, reading\)\}/);
  assert.doesNotMatch(app, /\{view\.line\}/);
  const site = read('../rituals/cycle/cycle.js');
  assert.match(site, /readingHtml\(reading, today, C\(\)\.readings\.homeHeadline\(v, reading\)/);
  assert.doesNotMatch(site, /<h2>\$\{esc\(v\.line\)\}<\/h2>/);
});

test('a premade Sumbel, alcohol-free welcome, linked from the Norse sumbel lessons', () => {
  const s = premadeById('folk-sumbel')!;
  assert.ok(s);
  assert.deepEqual(s.paths, ['norse']);
  assert.match(s.summary, /alcohol-free/);
  assert.ok(s.ingredients.some((i) => /alcohol-free/i.test(i.name)));
  assert.match(s.safety!, /Alcohol is never required/);
  assert.match(s.lore, /modern Heathen pattern/, 'says what is modern');
  assert.doesNotMatch(JSON.stringify(s), /!/);
  const links = traditionPath('norse').flatMap((p) => [...p.docs.flatMap((d) => (d.links ?? []).map((l) => [d.title, l] as const)), ...p.stages.flatMap((st) => st.tasks.flatMap((t) => (t.links ?? []).map((l) => [t.title, l] as const)))]);
  const sumbel = links.filter(([title]) => /sumbel/i.test(title));
  assert.ok(sumbel.length >= 3);
  for (const [title, l] of sumbel) assert.ok(!(l.kind === 'seasonal' && l.id === 'drinking-horn'), `${title}: the Sumbel, not the drinking horn`);
  assert.ok(sumbel.every(([title]) => sumbel.some(([t, l]) => t === title && l.kind === 'premade' && l.id === 'folk-sumbel')), 'each sumbel lesson opens the Sumbel');
});

test('rune meanings: a website page, opened from rune draws and the Norse course’s rune lessons', () => {
  assert.equal(runeMeaningsHref('Fehu'), '/divination/runes/#fehu');
  assert.equal(runeMeaningsHref('The Tower'), null);
  assert.equal(runeMeaningsHref(null), '/divination/runes/');
  const page = { kind: 'page' as const, id: 'runes' };
  assert.equal(courseLinkSiteHref(page), '/divination/runes/');
  assert.equal(courseLinkAppHref(page), '/rituals/divination/meanings?kind=runes');
  const runeLessons = traditionPath('norse').flatMap((p) => p.docs).filter((d) => /^The runes|^Reading the runes/.test(d.title));
  assert.equal(runeLessons.length, 2);
  for (const d of runeLessons) assert.ok(d.links?.some((l) => l.kind === 'page' && l.id === 'runes'), d.title);
  const html = read('../divination/runes/index.html');
  assert.match(html, /\/js\/core\/divination-library\.js[\s\S]*\/divination\/runes\/runes\.js/);
  const js = read('../divination/runes/runes.js');
  assert.match(js, /L\.divinationPage\(entry\)/, 'the app’s own pages');
  assert.match(read('../practice/hedge/hedge.js'), /runeMeaningsHref\(m\.name\)/);
  assert.match(read('../practice/hedge/hedge.js'), /url: "\/divination\/runes\/", title: "Rune meanings"/);
  assert.match(read('src/app/(tabs)/rituals/divination/index.tsx'), /title="Rune meanings"/);
});

test('the website’s Grimoire has Hearth & land, and its Ancestors page shows the ancestor frame’s photo', () => {
  assert.match(read('../grimoire/js/ui/journals.js'), /data-hearth-hub[\s\S]*href="\/practice\/hearth\/"/);
  assert.match(read('src/app/(tabs)/grimoire/index.tsx'), /router\.push\('\/rituals\/craft\/hearth'\)/);
  const hedge = read('../practice/hedge/hedge.js');
  assert.match(hedge, /core\.journals\.framesFor\(altars, personId\)\[0\]/);
  assert.match(hedge, /From the ancestor frame on \$\{photo\.altarName\}\./);
  assert.match(read('src/components/journals/screens.tsx'), /From the ancestor frame on \$\{photo\.altarName\}\./);
});
