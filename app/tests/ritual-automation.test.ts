import assert from 'node:assert/strict';
import { test } from 'node:test';

import { applyCandleAction } from '../src/lib/altar/editor.ts';
import { parseLivingState } from '../src/lib/altar/livingState.ts';
import { documentFromAltar, ritualAltarSnapshot } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import {
  candleAction,
  completionActions,
  firstStepActionsDue,
  markStepActionsStarted,
  withCandleAction,
} from '../src/lib/rituals/automation.ts';
import { completeStep, createSession, skipStep, withAltarSnapshot } from '../src/lib/rituals/lifecycle.ts';
import { altarEntityLinks, journalLinks } from '../src/lib/rituals/rows.ts';
import type { JournalRow, TemplateRow, TemplateStepRow } from '../src/lib/rituals/types.ts';

const T0 = new Date('2026-10-12T20:00:00Z');
const at = (seconds: number) => new Date(T0.getTime() + seconds * 1000);
const ids = () => {
  let n = 0;
  return () => `id-${++n}`;
};

const step = (id: string, sort_order: number, actions: TemplateStepRow['actions']): TemplateStepRow => ({
  id,
  template_id: 't1',
  sort_order,
  title: id,
  instructions: null,
  spoken_text: null,
  duration_seconds: null,
  completion_mode: 'manual',
  actions,
  linked_entities: [],
  metadata: {},
});

const template: TemplateRow = {
  id: 't1',
  title: 'Candle rite',
  intention: null,
  description: null,
  preparation: null,
  closing: null,
  linked_altar_id: 'altar-1',
  grimoire_page_id: null,
  estimated_duration_seconds: null,
  status: 'active',
  settings: {},
  metadata: {},
  ritual_template_steps: [
    step('open', 0, [{ type: 'light_all', when: 'start' }]),
    step('work', 1, [{ type: 'extinguish_all', when: 'end' }]),
    step('rest', 2, [{ type: 'light_all', when: 'start' }]),
    step('close', 3, [{ type: 'extinguish_all', when: 'start' }]),
  ],
};

test('candle pickers read and write the website shape', () => {
  assert.equal(candleAction([], 'start'), 'none');
  assert.equal(candleAction([{ type: 'light_all', when: 'end' }], 'end'), 'light_all');
  let actions = withCandleAction([], 'end', 'extinguish_all');
  assert.deepEqual(actions, [{ type: 'extinguish_all', when: 'end' }]);
  actions = withCandleAction(actions, 'start', 'light_all');
  assert.deepEqual(actions, [
    { type: 'light_all', when: 'start' },
    { type: 'extinguish_all', when: 'end' },
  ]);
  assert.deepEqual(withCandleAction(actions, 'start', 'none'), [{ type: 'extinguish_all', when: 'end' }]);
});

test('completing a step runs its end actions, then the next start actions; skipping runs none', () => {
  const s0 = createSession({ kind: 'template', template }, { userId: 'u1', now: T0, idFactory: ids() });
  s0.metadata = { ...s0.metadata, app: 'mobile' };
  const s1 = completeStep(s0, at(60));
  assert.deepEqual(completionActions(s0, s1), []);
  const s2 = completeStep(s1, at(120));
  assert.deepEqual(completionActions(s1, s2), ['extinguish_all', 'light_all']);
  const s3 = skipStep(s2, at(130));
  assert.deepEqual(completionActions(s2, s3), [], 'the website only automates completion');
});

test('first step start actions run once, for sessions begun in the app', () => {
  const s0 = createSession({ kind: 'template', template }, { userId: 'u1', now: T0, idFactory: ids() });
  const due = firstStepActionsDue(s0);
  assert.equal(due?.title, 'open');
  const marked = markStepActionsStarted(s0, due!, at(1));
  assert.equal(firstStepActionsDue(marked), null);
  assert.equal(marked.event_log.at(-1)?.type, 'step_actions_started');
  assert.equal(firstStepActionsDue({ ...s0, metadata: { ...s0.metadata, app: 'website' } }), null);
  assert.equal(firstStepActionsDue(completeStep(s0, at(5))), null);
});

const candle = (lit: boolean, extra: Partial<SavedObject> = {}): SavedObject => ({ type: 'candle', label: 'White candle', lit: String(lit), ...extra });

test('candle actions light and snuff every candle on the altar', () => {
  const doc = documentFromAltar({
    objects: [candle(false), candle(true, { livingState: JSON.stringify({ candle: { currentBurnStartedAt: '2026-10-12T19:00:00.000Z' } }) }), { type: 'herb', label: 'Rosemary' }],
  });
  const lit = applyCandleAction(doc, 'light_all', '2026-10-12T20:00:00.000Z');
  assert.deepEqual(lit.objects.map((o) => o.lit), ['true', 'true', undefined]);
  assert.equal(lit.objects[1], doc.objects[1], 'an already lit candle is untouched');
  const out = applyCandleAction(lit, 'extinguish_all', '2026-10-12T20:30:00.000Z');
  assert.deepEqual(out.objects.map((o) => o.lit), ['false', 'false', undefined]);
  assert.equal(parseLivingState(out.objects[1])?.candle?.totalBurnMs, 90 * 60 * 1000);
  assert.equal(applyCandleAction(doc, 'none', '2026-10-12T20:00:00.000Z'), doc);
});

test('a ritual keeps the altar snapshot the website captures', () => {
  const doc = documentFromAltar({ id: 'altar-1', name: 'Hearth', background: 'bg.png', backgroundName: 'Hearth', objects: [candle(false)], custom: 1 });
  const snapshot = ritualAltarSnapshot(doc, 'Candle rite', '2026-10-12T20:00:00.000Z');
  assert.deepEqual(Object.keys(snapshot).sort(), ['activeGroupId', 'background', 'backgroundName', 'groups', 'name', 'objects', 'savedAt']);
  assert.equal(snapshot.name, 'Candle rite');
  const s = withAltarSnapshot(createSession({ kind: 'template', template }, { userId: 'u1', now: T0, idFactory: ids() }), snapshot, at(1));
  assert.equal(s.altar_snapshot, snapshot);
});

test('journal entries link the Library entities on the altar, once each', () => {
  const journal = {
    id: 'r1',
    linked_altar_id: 'altar-1',
    altar_snapshot: {
      objects: [
        { type: 'herb', herb: 'Rosemary', entityId: 'rosemary' },
        { type: 'herb', label: 'Rosemary sprig', entityId: 'rosemary' },
        { type: 'candle', label: 'White candle', entityId: 'white-candle' },
        { type: 'crystal', label: 'Quartz' },
      ],
    },
  } as unknown as JournalRow;
  assert.deepEqual(altarEntityLinks(journal, 'u1'), [
    { user_id: 'u1', ritual_id: 'r1', link_type: 'used_entity', entity_id: 'rosemary', label: 'Rosemary', metadata: { type: 'herb' } },
    { user_id: 'u1', ritual_id: 'r1', link_type: 'used_entity', entity_id: 'white-candle', label: 'White candle', metadata: { type: 'candle' } },
  ]);
  const links = journalLinks(journal, 'u1', [{ ref: 'rosemary', name: 'Rosemary', type: 'herb' }]);
  assert.deepEqual(
    links.map((l) => `${l.link_type}:${l.entity_id ?? l.saved_altar_id}`),
    ['used_entity:rosemary', 'used_entity:white-candle', 'altar:altar-1'],
    'an ingredient already linked is not linked again',
  );
  assert.deepEqual(altarEntityLinks({ id: 'r2', altar_snapshot: {} }, 'u1'), []);
});
