import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builtInCabinet, objectFromForm } from '../src/lib/altar/cabinet.ts';
import {
  altarJournalLinks,
  applyAltarEffect,
  candleColorName,
  closingPlan,
  colorsInText,
  draftForAltar,
  draftSteps,
  intentionKeyFor,
  linkSessionToAltar,
  planRitualOnAltar,
  planStep,
  ritualHistoryText,
  stepBack,
  stepProgress,
  transitionEffects,
} from '../src/lib/altar/connect/ritual.ts';
import { incenseLife } from '../src/lib/altar/incense.ts';
import { isLit } from '../src/lib/altar/livingState.ts';
import { emptyDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedObject } from '../src/lib/altar/types.ts';
import { completeStep, createSession, currentStep, journalPayload, blankAnswers } from '../src/lib/rituals/lifecycle.ts';
import { premadeById, premadeDraft, PREMADE } from '../src/lib/rituals/premade/index.ts';
import type { TemplateDraft } from '../src/lib/rituals/types.ts';

const T0 = new Date(Date.UTC(2026, 9, 16, 20));
const iso = (min = 0) => new Date(T0.getTime() + min * 60_000).toISOString();

const place = (id: string, form?: string): SavedObject => {
  const item = builtInCabinet.find((i) => i.id === id)!;
  const f = form ? item.forms.find((x) => x.form === form)! : item.forms.find((x) => !!x.image)!;
  return objectFromForm(item, f, [], iso());
};

const altar = () => [
  place('candles:white-candle', 'taper'),
  place('candles:green-candle', 'taper'),
  place('candles:pink-candle', 'tea-light'),
  place('herbs:frankincense', 'incense'),
  place('vessels:offering-bowl'),
];

const draft = (steps: TemplateDraft['steps'], extra: Partial<TemplateDraft> = {}): TemplateDraft => ({
  id: null,
  title: 'Test rite',
  intention: '',
  preparation: '',
  closing: 'Thank the four directions.',
  linked_altar_id: null,
  grimoire_page_id: null,
  steps,
  ingredients: [],
  kind: 'template',
  ...extra,
});
const step = (title: string, extra: Partial<TemplateDraft['steps'][number]> = {}) => ({ id: null, title, instructions: '', spoken_text: '', minutes: '', completion_mode: 'manual' as const, actions: [], ...extra });

test('candle colours come from the object or its label, and from step words', () => {
  assert.equal(candleColorName(place('candles:green-candle', 'taper')), 'green');
  assert.equal(candleColorName({ type: 'candle', label: 'My Black Candle' }), 'black');
  assert.deepEqual(colorsInText('Light the green candle. Hold the white stone.'), ['green']);
  assert.deepEqual(colorsInText('Set a white and a gold candle side by side'), ['white', 'gold']);
});

test('light_all lights every candle; matching lights the named or intended colour', () => {
  const objects = altar();
  const s = { id: 's1', title: 'Light the green candle', instructions: '', actions: [{ type: 'light_all', when: 'start' as const }] };
  const all = planStep(s, 0, objects, { now: T0.getTime() });
  assert.equal(all.start[0].kind, 'light');
  assert.equal(all.start[0].auto, true);
  assert.equal(all.start[0].objectIds.length, 3);

  const matching = planStep(s, 0, objects, { candleScope: 'matching', now: T0.getTime() });
  assert.equal(matching.start[0].objectIds.length, 1);
  assert.match(matching.start[0].label, /green candle/);

  const love = planStep({ id: 's2', title: 'Light the candle', actions: [{ type: 'light_all', when: 'start' }] }, 0, objects, { candleScope: 'matching', intention: 'A working for self-love', now: T0.getTime() });
  assert.equal(intentionKeyFor(null, 'A working for self-love'), 'love');
  assert.ok(love.start[0].objectIds.length >= 1 && love.start[0].objectIds.length < 3, 'only love colours');
});

test('step words offer incense, an offering and a named candle as taps', () => {
  const objects = altar();
  const plan = planStep({ id: 's', title: 'Offer and burn', instructions: 'Light the incense and the white candle, then pour a little milk as an offering.', actions: [] }, 0, objects, { now: T0.getTime() });
  const kinds = plan.start.map((e) => e.kind).sort();
  assert.deepEqual(kinds, ['light', 'light_incense', 'offering']);
  assert.ok(plan.start.every((e) => !e.auto));
  assert.equal(plan.start.find((e) => e.kind === 'offering')!.label, 'Place the offering now');
});

test('effects apply to the altar and transitions follow the website automation', () => {
  const objects = altar();
  const d = draft([
    step('Light', { actions: [{ type: 'light_all', when: 'start' }] }),
    step('Sit', { minutes: '2' }),
    step('Close', { actions: [{ type: 'extinguish_all', when: 'end' }] }),
  ]);
  const session = createSession({ kind: 'draft', draft: d }, { userId: null, now: T0, idFactory: (() => { let n = 0; return () => `id-${++n}`; })() });
  const plan = planRitualOnAltar(session.session_steps, objects, { closing: d.closing, now: T0.getTime() });
  assert.equal(plan.steps.length, 3);
  let doc = { ...emptyDocument(), objects };
  for (const e of plan.steps[0].start) doc = applyAltarEffect(doc, e, iso(1));
  assert.equal(doc.objects.filter(isLit).length, 3);

  const s1 = completeStep(session, new Date(T0.getTime() + 60_000));
  assert.deepEqual(transitionEffects(plan, session, s1), []);
  const s2 = completeStep(s1, new Date(T0.getTime() + 120_000));
  const s3 = completeStep(s2, new Date(T0.getTime() + 180_000));
  const snuff = transitionEffects(plan, s2, s3);
  assert.equal(snuff[0].kind, 'snuff');
  for (const e of snuff) doc = applyAltarEffect(doc, e, iso(4));
  assert.equal(doc.objects.filter(isLit).length, 0);

  const closing = closingPlan(doc.objects, 'Go gently.');
  assert.equal(closing.text, 'Go gently.');
  assert.equal(closing.effects.length, 0);
});

test('closing offers to put out what still burns', () => {
  let doc = { ...emptyDocument(), objects: altar() };
  const ids = doc.objects.map((o) => String(o.altarObjectId));
  doc = applyAltarEffect(doc, { id: 'x', kind: 'light', moment: 'start', stepId: null, objectIds: [ids[0]], auto: true, label: '', reason: '' }, iso());
  doc = applyAltarEffect(doc, { id: 'y', kind: 'light_incense', moment: 'start', stepId: null, objectIds: [ids[3]], auto: false, label: '', reason: '' }, iso());
  assert.ok(incenseLife(doc.objects[3], T0.getTime() + 1000).lit);
  const closing = closingPlan(doc.objects, '', T0.getTime() + 1000);
  assert.deepEqual(closing.effects.map((e) => e.kind), ['snuff', 'put_out_incense']);
  for (const e of closing.effects) doc = applyAltarEffect(doc, e, iso(5));
  assert.equal(isLit(doc.objects[0]), false);
  assert.equal(incenseLife(doc.objects[3], T0.getTime() + 6 * 60_000).lit, false);
});

test('stepping back reopens the previous step and completing it again moves on', () => {
  const d = draft([step('One'), step('Two'), step('Three')]);
  let n = 0;
  const session = createSession({ kind: 'draft', draft: d }, { userId: null, now: T0, idFactory: () => `id-${++n}` });
  const s1 = completeStep(session, new Date(T0.getTime() + 60_000));
  assert.equal(currentStep(s1)!.title, 'Two');
  const back = stepBack(s1, new Date(T0.getTime() + 90_000));
  assert.equal(currentStep(back)!.title, 'One');
  assert.equal(back.session_steps.find((s) => s.title === 'Two')!.status, 'pending');
  assert.equal(stepBack(back, new Date(T0.getTime() + 95_000)), back, 'nothing before the first');
  const again = completeStep(back, new Date(T0.getTime() + 120_000));
  assert.equal(currentStep(again)!.title, 'Two');
  assert.equal(stepProgress(again, new Date(T0.getTime() + 130_000)).index, 1);
});

test('sessions and journal entries done on an altar are linked to it', () => {
  const d = draftForAltar(premadeDraft(PREMADE[0]), 'altar-1');
  assert.equal(d.linked_altar_id, 'altar-1');
  assert.ok(draftSteps(d).length > 0);
  let n = 0;
  const session = createSession({ kind: 'free', title: 'Quiet', intention: '' }, { userId: 'u', now: T0, idFactory: () => `id-${++n}` });
  const linked = linkSessionToAltar(session, 'altar-9', T0);
  assert.equal(linked.linked_altar_id, 'altar-9');
  assert.equal(linkSessionToAltar(linked, 'altar-9', T0), linked);
  const journal = journalPayload({ session: linked, answers: blankAnswers(linked, T0), userId: 'u', id: 'j1', now: T0 });
  assert.equal(journal.linked_altar_id, 'altar-9');
  const links = altarJournalLinks(journal, 'u', 'altar-9', [{ instanceId: '123e4567-e89b-42d3-a456-426614174000', label: 'Jar' }, { instanceId: 'local' }]);
  assert.deepEqual(links.map((l) => l.link_type), ['altar', 'used_object_instance']);
  assert.match(ritualHistoryText('Full Moon Rite', 'completed'), /Full Moon Rite/);
});

test('every premade working plans without throwing on a busy altar', () => {
  const objects = altar();
  for (const p of PREMADE) {
    const plan = planRitualOnAltar(draftSteps(premadeDraft(p)), objects, { intentionKey: p.intention, closing: p.closing, now: T0.getTime() });
    assert.equal(plan.steps.length, p.steps.length, p.id);
  }
  assert.ok(premadeById(PREMADE[0].id));
});
