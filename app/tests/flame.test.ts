import assert from 'node:assert/strict';
import test from 'node:test';

import { candleFormOf, DEFAULT_FLAME, flameLayout } from '../src/lib/altar/flame.ts';

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 0.05, `${a} ≈ ${b}`);

test('vigil candles and unknown pictures keep the website’s flame', () => {
  assert.deepEqual(flameLayout('../assets/altar/objects/candles/red-candle.png', 1536 / 500), DEFAULT_FLAME);
  assert.deepEqual(flameLayout('https://example.com/my-candle.png', 1.4), DEFAULT_FLAME);
  assert.deepEqual(flameLayout('../assets/altar/objects/candles/tea-light/red-tea-light.png', null), DEFAULT_FLAME);
  assert.equal(candleFormOf('../assets/altar/objects/candles/tea-light/red-tea-light.png'), 'tea-light');
  assert.equal(candleFormOf('../assets/altar/objects/candles/red-candle.png'), null);
});

test('a form with the vigil’s wick gets exactly the vigil’s flame', () => {
  const layout = flameLayout('candles/vigil-like/red-vigil-like.png', 1536 / 500, { 'vigil-like': [0.5, 0.0534] });
  for (const key of Object.keys(DEFAULT_FLAME) as (keyof typeof DEFAULT_FLAME)[]) near(layout[key], DEFAULT_FLAME[key]);
});

test('the flame and smoke move down onto a tea light’s wick', () => {
  const layout = flameLayout('candles/tea-light/red-tea-light.png', 1, { 'tea-light': [0.5, 0.24] });
  // The flame's foot, in box widths: down in the cup instead of at the top of the box.
  const foot = ((layout.flameTop + layout.flameHeight) / 100) * 1;
  assert.ok(foot > 0.4, `flame foot ${foot}`);
  assert.ok((layout.smokeTop + layout.smokeHeight) / 100 > 0.4);
  near(layout.centerX, 50);
  // The flame stays the same size as on a vigil candle, relative to the box's width.
  near((layout.flameHeight / 100) * 1, (DEFAULT_FLAME.flameHeight / 100) * (211 / 80));
});
