import assert from 'node:assert/strict';
import { test } from 'node:test';

import { careForCrystal } from '../src/lib/altar/devotion.ts';
import {
  candleScopeFor,
  draftCandleScope,
  lastAltarCareOf,
  ritualOrigin,
  runsOnAltar,
  sessionCandleScope,
  sourceCandleScope,
  startOnAltar,
  withRitualOrigin,
} from '../src/lib/altar/connect/ritualStart.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { createSession } from '../src/lib/rituals/lifecycle.ts';
import { PREMADE, premadeDraft } from '../src/lib/rituals/premade/index.ts';
import type { TemplateRow } from '../src/lib/rituals/types.ts';

const T0 = new Date(Date.UTC(2026, 9, 16, 20));
const iso = (min = 0) => new Date(T0.getTime() + min * 60_000).toISOString();
let n = 0;
const ids = () => `id-${++n}`;

const template = (extra: Partial<TemplateRow> = {}): TemplateRow => ({
  id: 'tpl-1',
  title: 'Hearth blessing',
  intention: 'Peace at home',
  description: null,
  preparation: null,
  closing: 'Thank the hearth.',
  linked_altar_id: null,
  grimoire_page_id: null,
  estimated_duration_seconds: null,
  status: 'active',
  settings: {},
  metadata: {},
  ritual_template_steps: [],
  ...extra,
});

test('candle scope is matching only when the working names candle colours', () => {
  assert.equal(candleScopeFor(['Light the green candle'], []), 'matching');
  assert.equal(candleScopeFor(['Light the candles', 'Breathe'], []), 'all');
  assert.equal(candleScopeFor([], [{ name: 'A white candle' }]), 'matching');
  assert.equal(candleScopeFor([], [{ name: 'Salt', ref: 'traditional/candle/white' }]), 'matching');
  assert.equal(candleScopeFor(['A green leaf'], [{ name: 'Rosemary', ref: 'traditional/herb/rosemary' }]), 'all');
});

test('a premade with a coloured candle among its ingredients runs with matching candles', () => {
  const coloured = PREMADE.find((p) => p.ingredients.some((i) => /\b(white|green|red|pink|black|blue|purple|gold|silver|yellow|orange)\b.*candle/i.test(i.name)));
  assert.ok(coloured, 'a premade names a coloured candle');
  assert.equal(sourceCandleScope({ kind: 'premade', premade: coloured! }), 'matching');
  assert.equal(draftCandleScope(premadeDraft(coloured!)), 'matching');
});

test('starting on an altar links the session to it, and remembers the premade', () => {
  const p = PREMADE[0];
  const source = startOnAltar({ kind: 'premade', premade: p }, 'altar-1');
  assert.equal(source.kind, 'draft');
  const session = withRitualOrigin(createSession(source, { userId: null, now: T0, idFactory: ids }), { kind: 'premade', premade: p });
  assert.equal(session.linked_altar_id, 'altar-1');
  assert.equal(session.metadata.premadeId, p.id);
  assert.ok(runsOnAltar(session, 'altar-1'));
  assert.ok(!runsOnAltar(session, 'altar-2'));
  const origin = ritualOrigin(session, []);
  assert.equal(origin.closing, p.closing);
  assert.equal(origin.intentionKey, p.intention);
  assert.equal(origin.premade?.id, p.id);
  assert.equal(origin.candleScope, sessionCandleScope(session));
});

test('a template begun on an altar keeps its id and finds its closing again', () => {
  const t = template({
    ritual_template_steps: [
      { id: 's1', template_id: 'tpl-1', sort_order: 0, title: 'Light the red candle', instructions: '', spoken_text: '', duration_seconds: 0, completion_mode: 'manual', actions: [] } as never,
    ],
  });
  const source = startOnAltar({ kind: 'template', template: t }, 'altar-9');
  assert.equal(source.kind, 'template');
  const session = createSession(source, { userId: null, now: T0, idFactory: ids });
  assert.equal(session.linked_altar_id, 'altar-9');
  assert.equal(session.template_id, 'tpl-1');
  assert.equal(withRitualOrigin(session, { kind: 'template', template: t }), session);
  const origin = ritualOrigin(session, [t]);
  assert.equal(origin.closing, 'Thank the hearth.');
  assert.equal(origin.candleScope, 'matching');
  assert.equal(sourceCandleScope({ kind: 'template', template: t }), 'matching');
});

test('the newest crystal care on the altar is offered to the stone’s log', () => {
  const crystal: SavedObject = { type: 'crystal', label: 'Amethyst', altarObjectId: 'c1' };
  assert.equal(lastAltarCareOf(crystal), null);
  const cleansed = careForCrystal(crystal, 'cleanse', { decision: 'Routine care', purpose: 'Routine care', methods: ['Moonlight', 'Sound bath'], supports: [], occurredAt: iso(0) }, iso(0));
  const care = lastAltarCareOf(cleansed);
  assert.equal(care?.kind, 'cleansed');
  assert.equal(care?.at, iso(0));
  assert.deepEqual(care?.methods, ['Moonlight', 'Sound bath']);
  const charged = careForCrystal(cleansed, 'charge', { decision: 'General energetic charge', purpose: 'General recharge', methods: ['Sunlight'], supports: [], occurredAt: iso(30) }, iso(30));
  assert.equal(lastAltarCareOf(charged)?.kind, 'charged');
  assert.equal(lastAltarCareOf(charged)?.at, iso(30));
});
