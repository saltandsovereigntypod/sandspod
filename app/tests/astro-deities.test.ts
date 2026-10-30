// The gods tied to the planets: every one says whether the link is ancient
// or modern, and a chart's suggestions put the person's patrons first.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { deitiesForChart, patronPlanets, patronsFromSettings, strongPlacements } from '../src/lib/astro/craftLinks.ts';
import { castChart, positionOf } from '../src/lib/astro/natal.ts';
import { DEITY_LINK_LABEL, GUIDE_ORDER, PLANET_GUIDES } from '../src/lib/astro/planetGuides.ts';

// Libra rising (chart ruler Venus), Sun in Gemini.
const chart = castChart({ date: '1990-06-15', time: '14:30', utcOffsetMinutes: 60, latitude: 51.5074, longitude: -0.1278 })!;
const settingsWith = (list: unknown[]) => ({ my_deities: JSON.stringify(list) });
const link = (planet: keyof typeof PLANET_GUIDES, name: string) => PLANET_GUIDES[planet].deities.find((d) => d.name === name)?.link;

test('every planet guide deity says whether its link is ancient or modern', () => {
  for (const planet of GUIDE_ORDER) {
    for (const d of PLANET_GUIDES[planet].deities) {
      assert.ok(d.link === 'ancient' || d.link === 'modern', `${planet}: ${d.name} has no link`);
      assert.ok(DEITY_LINK_LABEL[d.link]);
      // A note that says "in modern practice" is never marked ancient.
      if (/in modern practice/i.test(d.note)) assert.equal(d.link, 'modern', `${planet}: ${d.name}`);
    }
  }
  assert.equal(link('Saturn', 'Saturn'), 'ancient');
  assert.equal(link('Saturn', 'Kronos'), 'ancient');
  assert.equal(link('Saturn', 'Ninurta'), 'ancient');
  assert.equal(link('Saturn', 'Hekate'), 'modern');
  assert.equal(link('Saturn', 'The Cailleach'), 'modern');
  assert.equal(link('Moon', 'Hekate'), 'ancient');
});

test('chart deities carry their link, and nothing changes without patrons', () => {
  const plain = deitiesForChart(chart);
  assert.ok(plain.length > 0 && plain.length <= 8);
  assert.ok(plain.every((d) => d.link && !d.patron && !d.patronLine));
  assert.deepEqual(deitiesForChart(chart, patronsFromSettings(null)), plain);
  assert.deepEqual(patronPlanets(chart, []), []);
});

test('patrons are read from My deities; exploring and dedicated are not patrons', () => {
  assert.deepEqual(patronsFromSettings(undefined), []);
  assert.deepEqual(patronsFromSettings({ my_deities: 'not json' }), []);
  const list = patronsFromSettings(
    settingsWith([
      { key: 'hekate', name: 'Hekate', level: 'patron', since: '2024-01-01' },
      { key: 'zeus', name: 'Zeus', level: 'dedicated', since: '' },
      { key: null, name: 'Selene', level: 'exploring', since: '' },
    ]),
  );
  assert.deepEqual(
    list.map((d) => d.name),
    ['Hekate'],
  );
});

test('a patron among the chart deities comes first and says so', () => {
  assert.equal(chart.ruler?.traditional, 'Venus');
  const out = deitiesForChart(chart, [{ key: 'aphrodite', name: 'Aphrodite' }]);
  assert.equal(out[0].name, 'Aphrodite');
  assert.equal(out[0].patron, true);
  assert.equal(out[0].patronLine, 'Aphrodite, your patron, links to your chart ruler, Venus.');
  assert.equal(out.filter((d) => d.patron).length, 1);
  // Matched by name too (own words, different case, "The" dropped).
  assert.equal(deitiesForChart(chart, [{ key: null, name: 'aphrodite' }])[0].name, 'Aphrodite');
  // Never cut by the limit.
  const last = deitiesForChart(chart).at(-1)!;
  assert.equal(deitiesForChart(chart, [{ name: last.name }], 1)[0].name, last.name);
  // Not repeated as "elsewhere".
  assert.deepEqual(patronPlanets(chart, [{ key: 'aphrodite', name: 'Aphrodite' }]), []);
});

test('a patron tied to a planet that is not strong gets where that planet sits', () => {
  const strong = new Set(strongPlacements(chart).map((s) => s.planet));
  const shown = new Set(deitiesForChart(chart, [], Infinity).map((d) => d.name));
  const planet = GUIDE_ORDER.find((p) => !strong.has(p) && PLANET_GUIDES[p].deities.some((d) => !shown.has(d.name)))!;
  assert.ok(planet, 'the test chart has a planet that is not strong');
  const deity = PLANET_GUIDES[planet].deities.find((d) => !shown.has(d.name))!;
  const pos = positionOf(chart, planet)!;
  const out = patronPlanets(chart, [{ name: deity.name }]);
  assert.equal(out.length, 1);
  assert.equal(out[0].planet, planet);
  assert.equal(out[0].sign, pos.sign);
  assert.equal(out[0].house, pos.house);
  assert.match(out[0].line, new RegExp(`^Your patron ${deity.name} is tied to (the )?${planet}`));
  assert.match(out[0].line, new RegExp(`is in ${pos.sign}, in the \\w+ house\\.$`));
  assert.ok(!deitiesForChart(chart, [{ name: deity.name }]).some((d) => d.patron));
});

test('Apollo as patron points to the Sun when the Sun is not strong', () => {
  const sunStrong = strongPlacements(chart).some((s) => s.planet === 'Sun');
  const out = patronPlanets(chart, [{ key: 'apollo', name: 'Apollo' }]);
  if (sunStrong) assert.deepEqual(out, []);
  else assert.match(out[0].line, /^Your patron Apollo is tied to the Sun; in your chart the Sun is in Gemini/);
});
