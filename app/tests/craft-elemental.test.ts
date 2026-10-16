import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ALL_FOUR_PREMADE,
  balanceOf,
  dayElement,
  ELEMENT_GUIDES,
  elementOfObject,
  elementOfRef,
  ELEMENTS,
  gatherUses,
  isBalanced,
  leastUsed,
} from '../src/lib/craft/elemental/balance.ts';
import { cacheFresh, daysAhead, describeCode, forecastUrl, parseForecast, workingsFor, type DayWeather } from '../src/lib/craft/elemental/weather.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';

test('Library refs resolve to their element in either spelling', () => {
  assert.equal(elementOfRef('traditional/herb/basil')?.element, 'Fire');
  assert.equal(elementOfRef('traditional:crystal:moonstone')?.element, 'Water');
  assert.equal(elementOfRef('traditional/candle/purple')?.element, 'Spirit');
  assert.equal(elementOfRef('traditional/vessel/bowl'), null);
  assert.equal(elementOfRef('practice:abc'), null);
  assert.equal(elementOfRef(null), null);
});

test('altar objects resolve by entity, herb, stone, candle colour and tool', () => {
  assert.equal(elementOfObject({ entityId: 'traditional/herb/lavender' })?.element, 'Air');
  assert.equal(elementOfObject({ type: 'herb', herb: 'rosemary' })?.element, 'Fire');
  assert.equal(elementOfObject({ type: 'crystal', crystal: 'smoky-quartz' })?.element, 'Earth');
  assert.equal(elementOfObject({ type: 'candle', color: 'blue' })?.element, 'Water');
  assert.equal(elementOfObject({ type: 'cloth', color: 'blue' }), null);
  assert.equal(elementOfObject({ type: 'tool', tool: 'raven-skull' })?.element, 'Air');
  assert.equal(elementOfObject({ type: 'herb', herb: 'Lemon Balm' })?.element, 'Water');
  assert.equal(elementOfObject(null), null);
});

test('uses are gathered from altars, links and rows without counting a ritual twice', () => {
  const uses = gatherUses({
    altars: [{ objects: [{ type: 'candle', color: 'red' }, { type: 'crystal', crystal: 'moonstone' }, { type: 'deity', deity: 'brigid' }] }],
    links: [
      { ritual_id: 'j1', link_type: 'used_entity', entity_id: 'traditional/herb/sage' },
      { template_id: 't1', link_type: 'suggested_entity', entity_id: 'traditional/herb/patchouli' },
      { ritual_id: 'j1', link_type: 'altar', entity_id: null },
    ],
    templates: [
      { id: 't1', metadata: { ingredients: [{ ref: 'traditional/herb/patchouli' }] } },
      { id: 't2', metadata: { ingredients: [{ ref: 'traditional/herb/rose' }, { ref: 'nonsense' }] } },
      { id: 't3', status: 'archived', metadata: { ingredients: [{ ref: 'traditional/herb/rose' }] } },
    ],
    journal: [
      { id: 'j1', altar_snapshot: { objects: [{ type: 'herb', herb: 'sage' }] } },
      { id: 'j2', altar_snapshot: { objects: [{ type: 'herb', herb: 'mint' }] } },
    ],
  });
  const b = balanceOf(uses);
  assert.deepEqual(b.counts, { Earth: 1, Air: 2, Fire: 1, Water: 2 });
  assert.equal(b.total, 6);
  assert.equal(leastUsed(b), 'Earth');
  assert.ok(b.top.Air.includes('Sage') && b.top.Air.includes('Mint'));
});

test('nothing to read means no least-used element and no balance claim', () => {
  const b = balanceOf([]);
  assert.equal(b.total, 0);
  assert.equal(leastUsed(b), null);
  assert.equal(isBalanced(b), false);
  const even = balanceOf(ELEMENTS.flatMap((element) => Array.from({ length: 3 }, () => ({ id: 'x', name: 'x', element, source: 'altar' as const }))));
  assert.equal(isBalanced(even), true);
});

test('every suggestion points at a real premade working tagged elemental, and real Library entries', () => {
  for (const e of ELEMENTS) {
    const g = ELEMENT_GUIDES[e];
    const p = premadeById(g.premadeId);
    assert.ok(p, g.premadeId);
    assert.ok(p!.practices.includes('elemental'), `${g.premadeId} isn’t tagged elemental`);
    for (const ex of g.examples) assert.equal(elementOfRef(ex.id)?.element, e, ex.id);
  }
  assert.ok(premadeById(ALL_FOUR_PREMADE)?.practices.includes('elemental'));
});

test('the weekday’s planet gives the day’s element', () => {
  assert.deepEqual(dayElement(new Date(2026, 9, 18)), { planet: 'Sun', element: 'Fire' }); // Sunday
  assert.deepEqual(dayElement(new Date(2026, 9, 19)), { planet: 'Moon', element: 'Water' });
  assert.deepEqual(dayElement(new Date(2026, 9, 21)), { planet: 'Mercury', element: 'Air' });
  assert.deepEqual(dayElement(new Date(2026, 9, 24)), { planet: 'Saturn', element: 'Earth' });
});

const reply = {
  daily: {
    time: ['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19'],
    weather_code: [63, 95, 0, 3],
    temperature_2m_max: [12, 14, 9, 8],
    temperature_2m_min: [6, 8, -2, 3],
    precipitation_sum: [8.2, 15, 0, 0.1],
    precipitation_probability_max: [90, 80, 5, 10],
    wind_speed_10m_max: [20, 45, 8, 12],
    wind_gusts_10m_max: [35, 80, 15, 20],
    sunset: ['2026-10-16T18:10', '2026-10-17T18:08', '2026-10-18T18:06', '2026-10-19T18:04'],
  },
  hourly: {
    time: [] as string[],
    cloud_cover: [] as number[],
  },
};
for (const date of reply.daily.time) {
  for (let h = 0; h < 24; h++) {
    reply.hourly.time.push(`${date}T${String(h).padStart(2, '0')}:00`);
    reply.hourly.cloud_cover.push(date === '2026-10-18' || (date === '2026-10-19' && h < 4) ? 10 : 90);
  }
}

test('the Open-Meteo reply is read into days with night cloud', () => {
  const days = parseForecast(reply);
  assert.equal(days.length, 4);
  assert.equal(days[0].rainMm, 8.2);
  assert.equal(days[2].nightCloud, 10);
  assert.equal(days[0].nightCloud, 90);
  assert.equal(days[3].nightCloud, 90);
  assert.throws(() => parseForecast({ error: true, reason: 'limit' }));
});

test('each kind of weather maps to its elemental work, with safety for storm and gale', () => {
  const [rain, storm, clear] = parseForecast(reply);
  assert.deepEqual(workingsFor(rain).map((w) => w.sign), ['rain']);
  const s = workingsFor(storm);
  assert.deepEqual(s.map((w) => w.sign), ['storm', 'gale', 'rain']);
  assert.match(s[0].care!, /indoors/i);
  assert.ok(s[1].care);
  const c = workingsFor(clear).map((w) => w.sign);
  assert.deepEqual(c, ['frost', 'clear-night']);
  const windy: DayWeather = { ...clear, tempMin: 5, nightCloud: 80, gustMax: 55 };
  assert.deepEqual(workingsFor(windy).map((w) => w.element), ['Air']);
  for (const day of parseForecast(reply)) for (const w of workingsFor(day)) if (w.premadeId) assert.ok(premadeById(w.premadeId), w.premadeId);
});

test('codes, url, cache freshness and days ahead', () => {
  assert.equal(describeCode(0), 'Clear');
  assert.equal(describeCode(95), 'Thunderstorm');
  assert.equal(describeCode(61), 'Rain');
  const url = forecastUrl(51.507, -0.128);
  assert.match(url, /^https:\/\/api\.open-meteo\.com\/v1\/forecast\?latitude=51\.51&longitude=-0\.13&/);
  assert.match(url, /timezone=auto/);
  const now = new Date('2026-10-16T12:00:00Z');
  const cache = { fetchedAt: '2026-10-16T10:30:00Z', latitude: 51.51, longitude: -0.13, days: parseForecast(reply) };
  assert.equal(cacheFresh(cache, 51.51, -0.13, now), true);
  assert.equal(cacheFresh(cache, 48.85, 2.35, now), false);
  assert.equal(cacheFresh(cache, 51.51, -0.13, new Date('2026-10-16T14:00:00Z')), false);
  assert.equal(cacheFresh(null, 1, 1, now), false);
  assert.deepEqual(daysAhead(cache.days, '2026-10-17').map((d) => d.date), ['2026-10-17', '2026-10-18', '2026-10-19']);
});
