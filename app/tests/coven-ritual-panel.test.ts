// The live ritual at the altar's panel (lib/covens/ritualPanel.ts, deedTargets.ts).
import assert from 'node:assert/strict';
import test from 'node:test';

import { AT_ALTAR, atAltarStep } from '../src/lib/covens/altarActions.ts';
import { deedTargetKeys, stepItemForm } from '../src/lib/covens/deedTargets.ts';
import {
  DEED_HOWTO,
  defaultHowTo,
  glowsForMe,
  opensPanel,
  panelBarLine,
  panelCue,
  ritualSitMix,
  ritualSitPlan,
  ritualSitPrefs,
  RITUAL_SIT_DEFAULTS,
  SIT_HOWTO,
  sitSync,
  stepHowTo,
  withLayer,
} from '../src/lib/covens/ritualPanel.ts';
import { PRESETS, presetParams } from '../src/lib/meditation/scripts.ts';

test('every altar deed and every sit has a plain default how-to', () => {
  for (const row of AT_ALTAR) assert.ok(DEED_HOWTO[row.action], `${row.action} has a how-to`);
  for (const p of PRESETS) assert.ok(SIT_HOWTO[p.id], `${p.id} has a how-to`);
  assert.match(SIT_HOWTO.candle, /lit candle on the altar/);
});

test('the builder’s own directions win over the default', () => {
  const step = atAltarStep('light_candle')!;
  assert.deepEqual(stepHowTo({ ...step, instructions: 'Light the black candle for Hekate.' }, 'turns'), { text: 'Light the black candle for Hekate.', builder: true });
  const blank = stepHowTo({ ...step, instructions: '  ' }, 'turns');
  assert.equal(blank.builder, false);
  assert.equal(blank.text, DEED_HOWTO.light_candle);
  assert.equal(defaultHowTo({ details: { sit_preset: 'ground' } }, 'together'), SIT_HOWTO.ground);
  assert.match(defaultHowTo({ contribution: { kind: 'vow' } }, 'together'), /vow/);
  assert.match(defaultHowTo({}, 'one'), /One person/);
  assert.match(defaultHowTo({}, 'together'), /together/);
});

test('the altar glows only for the person whose turn it is, never for watchers', () => {
  const base = { hasOrder: true, iDone: false, complete: false };
  assert.equal(glowsForMe({ ...base, kind: 'turns', mine: true, myTurn: true }), true);
  assert.equal(glowsForMe({ ...base, kind: 'turns', mine: true, myTurn: false }), false, 'waiting for your turn');
  assert.equal(glowsForMe({ ...base, kind: 'together', mine: true, myTurn: false }), true, 'everyone doing it together');
  assert.equal(glowsForMe({ ...base, kind: 'together', mine: false, myTurn: false }), false, 'a watcher');
  assert.equal(glowsForMe({ ...base, kind: 'one', mine: false, myTurn: false }), false);
  assert.equal(
    glowsForMe({
      ...base,
      kind: 'together',
      mine: true,
      myTurn: false,
      iDone: true,
    }),
    false,
    'done already',
  );
  assert.equal(
    glowsForMe({
      ...base,
      kind: 'turns',
      mine: true,
      myTurn: true,
      complete: true,
    }),
    false,
  );
});

test('what glows on the altar for a deed', () => {
  const objects = [
    { altarObjectId: 'c1', type: 'candle', lit: 'true' },
    { altarObjectId: 'c2', type: 'candle' },
    { altarObjectId: 'ch', type: 'tool', tool: 'chalice' },
    { altarObjectId: 'b', type: 'tool', tool: 'bell' },
  ] as never[];
  assert.deepEqual(deedTargetKeys('light', objects), ['c2']);
  assert.deepEqual(deedTargetKeys('toast', objects), ['ch']);
  assert.deepEqual(deedTargetKeys('bell', objects), ['b']);
  assert.deepEqual(deedTargetKeys('gaze', objects), ['c1']);
  assert.deepEqual(deedTargetKeys('petition', objects), []);
  assert.deepEqual(deedTargetKeys(null, objects), []);
});

test('a step’s item is found in the cabinet for its tile', () => {
  const cabinet = [
    {
      id: 'rosemary',
      category: 'herb',
      name: 'Rosemary',
      keywords: [],
      forms: [{ label: 'Sprig', image: 'herbs/rosemary.png', form: 'sprig' }],
    },
  ];
  assert.equal(stepItemForm({ key: 'rosemary|sprig', name: 'x' }, cabinet)?.form.label, 'Sprig');
  assert.equal(stepItemForm({ name: 'x', image: 'herbs/rosemary.png' }, cabinet)?.item.id, 'rosemary');
  assert.equal(stepItemForm({ name: 'rosemary' }, cabinet)?.item.id, 'rosemary');
  assert.equal(stepItemForm({ name: 'thyme' }, cabinet), null);
});

test('the panel opens by itself for a new step, your turn, and moving on', () => {
  const flow = { myTurn: false, isEnder: false, progress: { complete: false } };
  const a = panelCue('s1', flow);
  assert.equal(opensPanel('', a), true);
  assert.equal(opensPanel(a, panelCue('s1', flow)), false, 'nothing new');
  assert.equal(opensPanel(a, panelCue('s1', { ...flow, myTurn: true })), true, 'your turn');
  assert.equal(opensPanel(a, panelCue('s1', { ...flow, isEnder: true, progress: { complete: true } })), true, 'the ender moves on');
  assert.equal(opensPanel(a, panelCue('s2', flow)), true, 'the next step');
  assert.equal(panelCue(null, flow), '');
  assert.equal(
    panelBarLine({
      index: 2,
      title: 'Call the East',
      mine: true,
      myTurn: true,
      kind: 'turns',
      iDone: false,
      complete: false,
      isEnder: false,
    }),
    'Step 3 · Your turn: Call the East',
  );
  assert.equal(
    panelBarLine({
      index: 0,
      title: 'Breathe',
      mine: false,
      myTurn: false,
      kind: 'together',
      iDone: false,
      complete: false,
      isEnder: false,
    }),
    'Step 1 · Breathe',
  );
});

test('a sit runs in step from the step’s own start, never early', () => {
  const start = Date.parse('2026-11-03T20:00:00Z');
  assert.equal(sitSync({ startedAt: null, minutes: 3, now: start }).phase, 'waiting');
  assert.equal(sitSync({ startedAt: start, minutes: 3, now: start - 2000 }).phase, 'waiting', 'a clock a little ahead does not start it early');
  const running = sitSync({
    startedAt: '2026-11-03T20:00:00Z',
    minutes: 3,
    now: start + 60_000,
  });
  assert.deepEqual(running, {
    phase: 'running',
    startMs: start,
    elapsedMs: 60_000,
    leftMs: 120_000,
  });
  assert.equal(sitSync({ startedAt: start, minutes: 3, now: start + 200_000 }).phase, 'over');
});

test('each person’s sit choices, with defaults', () => {
  assert.deepEqual(ritualSitPrefs(null), RITUAL_SIT_DEFAULTS);
  const prefs = ritualSitPrefs({
    ritual_sit_bells: false,
    ritual_sit_sound: 'true',
    ritual_sit_layers: 'rain,nope',
  });
  assert.deepEqual(prefs.layers, ['rain']);
  assert.equal(ritualSitPlan('ground', prefs).startBell, false);
  assert.equal(ritualSitPlan('ground', RITUAL_SIT_DEFAULTS).startBell, true);
  assert.deepEqual(ritualSitMix(prefs)?.levels, { rain: 0.5 });
  assert.equal(ritualSitMix(RITUAL_SIT_DEFAULTS), null);
  assert.equal(withLayer(prefs, 'drone', true), 'drone,rain');
  assert.equal(presetParams('candle').focus, 'candle');
  assert.equal(presetParams('candle').kind, 'candle');
});
