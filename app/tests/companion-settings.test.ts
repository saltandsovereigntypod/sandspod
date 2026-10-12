import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

import {
  ACCESSIBILITY_DEFAULTS,
  accessibilityScope,
  accessibilityStorageKey,
  accessibilityToSave,
  accessibleTextStyle,
  normalizeAccessibility,
  stepTextScale,
  TEXT_SCALES,
} from '../src/lib/accessibility/prefs.ts';
import { builtInBackgrounds, defaultAltarBackground } from '../src/lib/altar/cabinet.ts';
import { companionSettings, glanceLine, livingStateDisplay, resolveAltarEntry, stateRows } from '../src/lib/altar/companion.ts';
import { buildLibrary } from '../src/lib/library/model.ts';
import { defaultSettings, normalizeSettings, type Settings } from '../src/lib/settings/defaults.ts';

const website = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

// The website's getCompanionDisplaySettings, lifted out of altar/js/ui/selection.js.
function websiteCompanion(settings: Settings): Record<string, unknown> {
  const source = website('altar/js/ui/selection.js');
  const start = source.indexOf('function getCompanionDisplaySettings()');
  const end = source.indexOf('\nfunction ', start + 1);
  const context: Record<string, unknown> = { saved: settings };
  vm.runInNewContext(`function getLocalMySettings() { return saved; }\n${source.slice(start, end)}\nthis.out = getCompanionDisplaySettings();`, context);
  return context.out as Record<string, unknown>;
}

test('companion settings map exactly as the website maps them', () => {
  const copying = defaultSettings();
  assert.equal(companionSettings(copying), copying);
  assert.deepEqual({ ...companionSettings(copying) }, websiteCompanion(copying));

  const own = normalizeSettings({ companion_copy_grimoire_settings: false, companion_layer_order: 'traditional,myPractice,community', companion_traditional_enabled: true });
  const mapped = companionSettings(own);
  assert.deepEqual({ ...mapped }, { ...websiteCompanion(own) });
  assert.equal(mapped.library_layer_order, 'traditional,myPractice,community');
  assert.equal(mapped.library_traditional_enabled, true);
  assert.equal(mapped.library_traditional_correspondences, false);
  // Keys the website never set read as off there, so here too.
  assert.equal(mapped.library_traditional_notes, false);
  assert.equal(mapped.library_myPractice_notes, true);
  // Mapping twice changes nothing (the About sheet hands mapped settings on).
  assert.deepEqual(companionSettings(mapped), mapped);
});

test('the glance follows the companion settings', () => {
  const entries = buildLibrary([]);
  const red = resolveAltarEntry(entries, { type: 'candle', color: 'red' })!;
  assert.match(glanceLine(red, defaultSettings()), /Fire/);
  // Companion defaults keep Traditional off.
  assert.equal(glanceLine(red, normalizeSettings({ companion_copy_grimoire_settings: false })), '');
});

test('living state switches hide their rows', () => {
  const now = new Date('2026-03-10T12:00:00Z');
  const candle = {
    type: 'candle',
    color: 'red',
    lit: 'true',
    livingState: JSON.stringify({ candle: { totalBurnMs: 600000, currentBurnStartedAt: '2026-03-10T11:00:00Z', lastLitAt: '2026-03-09T11:00:00Z' } }),
  };
  const all = stateRows(candle, now, defaultSettings()).map((row) => row.label);
  assert.ok(all.includes('Burning since') && all.includes('Burning time') && all.includes('Last burned'));
  const quiet = stateRows(
    candle,
    now,
    normalizeSettings({ living_state_show_status: false, living_state_show_remaining: false, living_state_show_last_tended: false }),
  ).map((row) => row.label);
  assert.ok(!quiet.includes('Burning since') && !quiet.includes('Burning time') && !quiet.includes('Last burned'));
  assert.deepEqual(stateRows(candle, now), stateRows(candle, now, defaultSettings()));
  assert.equal(livingStateDisplay(normalizeSettings({ living_state_show_recent_activity: false })).recentActivity, false);
  assert.equal(livingStateDisplay(null).recentActivity, true);
});

test('the default altar background matches by name or path, as the website does', () => {
  const [forest, shelf] = builtInBackgrounds;
  assert.equal(defaultAltarBackground(''), null);
  assert.equal(defaultAltarBackground('forest altar'), forest);
  assert.equal(defaultAltarBackground(shelf.background), shelf);
  assert.equal(defaultAltarBackground('Moonlit Grove'), null);
  const mine = { id: 'c1', name: 'My Garden', background: 'https://example.com/garden.png', custom: true };
  assert.equal(defaultAltarBackground('My Garden', [mine]), mine);
});

// The website's accessibility module, loaded without a page.
function websiteAccessibility() {
  const context: Record<string, unknown> = { module: { exports: {} }, console };
  vm.runInNewContext(website('js/accessibility.js'), context);
  return (context.module as { exports: Record<string, (...args: unknown[]) => unknown> & { DEFAULTS: object; SCALES: number[] } }).exports;
}

test('accessibility choices share the website’s defaults, scales, storage key and shape', () => {
  const site = websiteAccessibility();
  assert.deepEqual({ ...ACCESSIBILITY_DEFAULTS }, { ...site.DEFAULTS });
  assert.deepEqual([...TEXT_SCALES], [...site.SCALES]);
  assert.equal(accessibilityStorageKey(accessibilityScope('abc')), 'saltAndSovereigntyAccessibility:user:abc');
  assert.equal(accessibilityStorageKey(accessibilityScope(null)), 'saltAndSovereigntyAccessibility:guest');
  for (const candidate of [{}, { textScale: 1.2, highContrast: true, readingRuler: true }, { textScale: 5, reduceMotion: 'yes' }, null]) {
    assert.deepEqual(normalizeAccessibility(candidate), { ...(site.normalize(candidate) as object) });
  }
  assert.equal(JSON.parse(accessibilityToSave({ ...ACCESSIBILITY_DEFAULTS, focusMode: true })).focusMode, false);
  assert.equal(stepTextScale(1.3, 1), 1.3);
  assert.equal(stepTextScale(1, -1), 0.9);
});

test('text styles take the accessibility choices', () => {
  const body: { fontFamily: string; fontSize: number; lineHeight: number; color: string; letterSpacing?: number } = {
    fontFamily: 'SourceSerif4_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#e6dcc2',
  };
  assert.deepEqual(accessibleTextStyle(body, ACCESSIBILITY_DEFAULTS), body);
  const big = accessibleTextStyle(body, { ...ACCESSIBILITY_DEFAULTS, textScale: 1.2 });
  assert.equal(big.fontSize, 18);
  assert.equal(big.lineHeight, 26.4);
  assert.equal(accessibleTextStyle(body, { ...ACCESSIBILITY_DEFAULTS, lineSpacing: true }).lineHeight, 26);
  assert.equal(accessibleTextStyle(body, { ...ACCESSIBILITY_DEFAULTS, letterSpacing: true }).letterSpacing, 0.6);
  const plain = accessibleTextStyle({ fontFamily: 'SourceSerif4_600SemiBold', fontSize: 15 }, { ...ACCESSIBILITY_DEFAULTS, readableFont: true }) as Record<string, unknown>;
  assert.equal(plain.fontFamily, undefined);
  assert.equal(plain.fontWeight, '600');
  assert.equal(accessibleTextStyle(body, { ...ACCESSIBILITY_DEFAULTS, highContrast: true }).color, '#fff8e8');
  // Headings keep their own line height when line spacing is on.
  const title = { fontSize: 34, lineHeight: 36 };
  assert.equal(accessibleTextStyle(title, { ...ACCESSIBILITY_DEFAULTS, lineSpacing: true }).lineHeight, 36);
});
