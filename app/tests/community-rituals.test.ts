import assert from 'node:assert/strict';
import { test } from 'node:test';

import { builderStepFrom, cleanPlan, stepsFromLibrary } from '../src/lib/covens/builder.ts';
import {
  canChange,
  canSendUpdate,
  canWithdraw,
  cleanContent,
  communityFacets,
  communityOrigin,
  contentFromCovenTemplate,
  contentFromShared,
  contentFromTemplate,
  covenBodyFromCommunity,
  creditLine,
  draftFromCommunity,
  draftFromCoven,
  filterCommunity,
  inRitualFolder,
  isRitualHidden,
  mySharesLine,
  personName,
  reviewActionsFor,
  ritualFacts,
  ritualReportUrl,
  savesLabel,
  shareArgs,
  sharerKey,
  sharerName,
  splitList,
  templateCredit,
  type PublishedRitual,
} from '../src/lib/rituals/community.ts';
import { closedMentions } from '../src/lib/rituals/communityClosed.ts';
import { createSession, draftFromSession, draftFromTemplate } from '../src/lib/rituals/lifecycle.ts';
import { templatePayload } from '../src/lib/rituals/rows.ts';
import type { TemplateRow } from '../src/lib/rituals/types.ts';

function published(over: Partial<PublishedRitual> = {}): PublishedRitual {
  return {
    id: 'r1',
    sharer_id: 'u1',
    coven_id: null,
    share_as: 'person',
    display_name: 'Clover',
    title: 'Moon water at the full',
    kind: 'esbat',
    summary: 'Charge water under the full moon.',
    tradition: 'Wicca',
    deities: ['Selene'],
    occasion: null,
    moon_phase: 'full',
    duration_minutes: 20,
    difficulty: 'beginner',
    materials: ['A glass jar', 'Spring water'],
    preparation: 'Wash the jar.',
    steps: [
      { title: 'Fill the jar', instructions: 'Pour the water.', spoken_text: '', minutes: 2 },
      { title: 'Set it in moonlight', instructions: 'Leave it overnight.', spoken_text: 'By the light of the moon', minutes: null },
    ],
    closing: 'Thank the moon.',
    notes: 'A blue jar works well.',
    safety_notes: 'Don’t drink water left outdoors.',
    cultural_note: null,
    tags: ['moon'],
    version: 1,
    save_count: 3,
    published_at: '2026-10-20T10:00:00Z',
    created_at: '2026-10-19T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
    ...over,
  };
}

const template: TemplateRow = {
  id: 't1',
  user_id: 'me',
  title: 'Hearth blessing',
  intention: 'Bless the home',
  description: null,
  preparation: 'Sweep the hearth.',
  closing: 'Bank the fire.',
  linked_altar_id: 'altar-1',
  grimoire_page_id: 'page-1',
  estimated_duration_seconds: 900,
  status: 'active',
  settings: {},
  metadata: { kind: 'spell', ingredients: [{ ref: 'traditional/herb/rosemary', name: 'Rosemary', type: 'herb' }] },
  ritual_template_steps: [
    { id: 's2', template_id: 't1', sort_order: 1, title: 'Light', instructions: 'Light the candle.', spoken_text: null, duration_seconds: 300, completion_mode: 'timed', actions: [], linked_entities: [], metadata: {} },
    { id: 's1', template_id: 't1', sort_order: 0, title: 'Sweep', instructions: null, spoken_text: 'Out with the old', duration_seconds: 90, completion_mode: 'manual', actions: [], linked_entities: [], metadata: {} },
  ],
};

test('a personal template becomes shareable content without its altar or Grimoire links', () => {
  const c = contentFromTemplate(template);
  assert.equal(c.title, 'Hearth blessing');
  assert.equal(c.kind, 'spell');
  assert.equal(c.duration_minutes, 15);
  assert.deepEqual(c.materials, ['Rosemary']);
  assert.deepEqual(c.steps.map((s) => s.title), ['Sweep', 'Light']);
  assert.equal(c.steps[0].minutes, 1.5);
  assert.equal(JSON.stringify(c).includes('altar-1'), false);
  assert.equal(JSON.stringify(c).includes('page-1'), false);
});

test('a coven template shares only the rite: never roles, people, checklists or notes', () => {
  const body = {
    kind: 'rite',
    intention: 'Honour the ancestors',
    description: 'Our Samhain rite',
    occasion_name: 'Samhain',
    plan: { roles: [{ id: 'hp', name: 'High Priestess', cast: [{ kind: 'user', id: 'secret-user' }] }], checklist: [{ id: 'c', text: 'Bring Hazel’s drum' }], afterwards: { notes: 'Private' } },
    steps: [
      { title: 'Open', instructions: 'Cast the circle.', spoken_text: 'We gather', duration_minutes: 5, roles: ['hp'], assignees: [{ kind: 'user', id: 'secret-user' }], deity: 'The Morrígan', items: [{ name: 'A black candle' }], details: { who: { people: ['secret-user'] } } },
      { title: '', instructions: 'Untitled steps are dropped' },
    ],
  };
  const c = contentFromCovenTemplate('Our Samhain', body);
  const text = JSON.stringify(c);
  assert.equal(c.kind, 'seasonal');
  assert.equal(c.occasion, 'Samhain');
  assert.deepEqual(c.deities, ['The Morrígan']);
  assert.deepEqual(c.materials, ['A black candle']);
  assert.equal(c.steps.length, 1);
  for (const secret of ['secret-user', 'High Priestess', 'drum', 'Private', 'roles', 'assignees']) assert.equal(text.includes(secret), false, secret);
  assert.equal(contentFromCovenTemplate('Business', { kind: 'meeting', steps: [{ title: 'Roll call' }] }).kind, 'meeting');
});

test('cleanContent trims, bounds and says what is missing', () => {
  const base = contentFromTemplate(template);
  assert.deepEqual(cleanContent({ ...base, title: '  ' }), { ok: false, message: 'Give the ritual a title.' });
  assert.deepEqual(cleanContent({ ...base, steps: [] }), { ok: false, message: 'Add at least one step.' });
  assert.deepEqual(cleanContent({ ...base, steps: [{ title: '', instructions: 'Do it', spoken_text: '', minutes: null }] }), { ok: false, message: 'Each step needs a title.' });
  const ok = cleanContent({ ...base, deities: ['Brigid', 'brigid', ' '], moon_phase: 'blue', kind: 'nonsense' as never, duration_minutes: 99999 });
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.deepEqual(ok.value.deities, ['Brigid']);
    assert.equal(ok.value.moon_phase, '');
    assert.equal(ok.value.kind, 'ritual');
    assert.equal(ok.value.duration_minutes, 1440);
  }
});

test('shareArgs: crediting, coven checks and agreement', () => {
  const c = contentFromTemplate(template);
  const names = { preferred_name: 'Ash', magical_name: 'Willow' };
  assert.deepEqual(shareArgs(c, { shareAs: 'preferred_name', names, source: 'template', agreed: false }), { ok: false, message: 'Please agree to the Submission Terms and the community guidelines.' });
  assert.equal(shareArgs(c, { shareAs: 'coven', names, source: 'template', agreed: true }).ok, false);
  const person = shareArgs(c, { shareAs: 'magical_name', names, source: 'template', agreed: true });
  assert.ok(person.ok);
  if (person.ok) {
    assert.equal(person.value.p_share_as, 'person');
    assert.equal(person.value.p_display_name, 'Willow');
    assert.equal(person.value.p_id, null);
  }
  const anon = shareArgs(c, { shareAs: 'anonymous', names, source: 'template', agreed: true });
  assert.ok(anon.ok && anon.value.p_share_as === 'anonymous' && anon.value.p_display_name === null);
  const coven = shareArgs(c, { shareAs: 'coven', names, covenId: 'cv', source: 'coven_template', agreed: true });
  assert.ok(coven.ok && coven.value.p_coven === 'cv' && coven.value.p_share_as === 'coven');
  // Changing a waiting one never also replaces a published one.
  const edit = shareArgs(c, { id: 'x', replaces: 'y', shareAs: 'anonymous', names, source: 'template', agreed: true });
  assert.ok(edit.ok && edit.value.p_id === 'x' && edit.value.p_replaces === null);
  assert.equal(personName('preferred_name', {}), 'Community member');
  assert.equal(personName('magical_name', { preferred_name: 'Ash' }), 'Ash');
});

test('attribution: anonymous, person, coven; credit lines and keys', () => {
  assert.equal(sharerName(published({ share_as: 'anonymous', display_name: 'Anonymous', sharer_id: null })), 'Anonymous');
  assert.equal(creditLine(published({ share_as: 'coven', display_name: 'Moon Circle', coven_id: 'cv', sharer_id: null })), 'From Moon Circle in Community Rituals');
  assert.equal(sharerKey(published()), 'person:u1');
  assert.equal(sharerKey(published({ share_as: 'coven', coven_id: 'cv', sharer_id: null })), 'coven:cv');
  assert.equal(sharerKey(published({ share_as: 'anonymous', sharer_id: null })), null);
  assert.equal(ritualFacts(published()), 'Moon rite · Wicca · Full moon · about 20 min · Beginner');
  assert.equal(savesLabel(1), 'Saved once');
  assert.equal(savesLabel(0), '');
  assert.ok(ritualReportUrl(published()).startsWith('mailto:'));
  assert.equal(isRitualHidden(published(), { posts: [], authors: ['u1'] }), true);
  assert.equal(isRitualHidden(published({ share_as: 'coven', coven_id: 'cv', sharer_id: null }), { posts: [], authors: ['coven:cv'] }), true);
  assert.equal(isRitualHidden(published(), { posts: ['r1'], authors: [] }), true);
  assert.equal(isRitualHidden(published(), { posts: [], authors: [] }), false);
});

test('search by sharer, title, kind, tradition, deity, occasion, moon and materials; sort', () => {
  const rows = [
    published(),
    published({ id: 'r2', title: 'Samhain supper', kind: 'seasonal', occasion: 'Samhain', moon_phase: null, deities: ['Hekate'], materials: ['Apples'], tradition: 'Hellenic', display_name: 'Moon Circle', share_as: 'coven', coven_id: 'cv', sharer_id: null, save_count: 9, published_at: '2026-10-01T00:00:00Z' }),
    published({ id: 'r3', title: 'Doorway salt line', kind: 'protection', moon_phase: 'waning', deities: [], materials: ['Salt'], tradition: 'Folk', display_name: 'Rowan', sharer_id: 'u3', save_count: 0, published_at: '2026-10-25T00:00:00Z' }),
  ];
  const ids = (f: Parameters<typeof filterCommunity>[1]) => filterCommunity(rows, f).map((r) => r.id);
  assert.deepEqual(ids({ query: 'moon circle' }), ['r2']);
  assert.deepEqual(ids({ query: 'hekate' }), ['r2']);
  assert.deepEqual(ids({ query: 'salt' }), ['r3']);
  assert.deepEqual(ids({ query: 'samhain' }), ['r2']);
  assert.deepEqual(ids({ query: 'moon rite' }), ['r1', 'r2']); // Moon Circle's holiday rite too
  assert.deepEqual(ids({ query: '', kind: 'protection' }), ['r3']);
  assert.deepEqual(ids({ query: '', moon: 'full' }), ['r1']);
  assert.deepEqual(ids({ query: '', tradition: 'hellenic' }), ['r2']);
  assert.deepEqual(ids({ query: '', deity: 'Selene' }), ['r1']);
  assert.deepEqual(ids({ query: '', occasion: 'Samhain' }), ['r2']);
  assert.deepEqual(ids({ query: '', material: 'apples' }), ['r2']);
  assert.deepEqual(ids({ query: '', sharer: 'person:u3' }), ['r3']);
  assert.deepEqual(ids({ query: '' }), ['r3', 'r1', 'r2']);
  assert.deepEqual(ids({ query: '', sort: 'saved' }), ['r2', 'r1', 'r3']);
  assert.deepEqual(ids({ query: '', sort: 'title' }), ['r3', 'r1', 'r2']);
  assert.deepEqual(communityFacets(rows).traditions, ['Folk', 'Hellenic', 'Wicca']);
});

test('Add to my rituals: an independent copy, credited, that survives editing', () => {
  const draft = draftFromCommunity(published());
  assert.equal(draft.id, null);
  assert.equal(draft.title, 'Moon water at the full');
  assert.equal(draft.steps.length, 2);
  assert.equal(draft.steps[0].minutes, '2');
  assert.match(draft.preparation, /^Gather: A glass jar, Spring water\./);
  assert.match(draft.preparation, /Take care: Don’t drink/);
  assert.match(draft.preparation, /Notes from the sharer: A blue jar/);
  assert.equal(draft.from?.credit, 'From Clover in Community Rituals');
  const { template: row } = templatePayload(draft, { userId: 'me', id: 'new', stepIds: ['a', 'b'] });
  assert.equal(templateCredit(row.metadata), 'From Clover in Community Rituals');
  // Editing the copy keeps the credit (the editor starts from the saved row).
  const again = draftFromTemplate({ ...row, description: null, ritual_template_steps: [] } as TemplateRow);
  assert.equal(templatePayload(again, { userId: 'me', id: 'new', stepIds: [] }).template.metadata.from !== undefined, true);
  assert.equal(templateCredit({}), null);
});

test('Do it once: the session remembers where it came from, to offer saving at the end', () => {
  const session = createSession({ kind: 'draft', draft: draftFromCommunity(published()) }, { userId: null, now: new Date('2026-10-30T20:00:00Z') });
  assert.deepEqual(communityOrigin(session.metadata), { id: 'r1', credit: 'From Clover in Community Rituals' });
  assert.equal(session.template_id, null);
  assert.equal(communityOrigin({}), null);
  const back = draftFromSession(session);
  assert.deepEqual(back.steps.map((s) => s.title), ['Fill the jar', 'Set it in moonlight']);
});

test('Add to a coven’s rituals: a coven template the builder can plan from', () => {
  const { title, body } = covenBodyFromCommunity(published({ kind: 'meeting' }));
  assert.equal(title, 'Moon water at the full');
  assert.equal(body.kind, 'meeting');
  assert.match(String(body.description), /^From Clover in Community Rituals/);
  const plan = cleanPlan(body.plan, 'meeting');
  const steps = stepsFromLibrary(body.steps, plan);
  assert.deepEqual(steps.map((s) => s.title), ['Fill the jar', 'Set it in moonlight']);
  assert.equal(steps[0].duration_minutes, 2);
  assert.ok(steps.every((s) => plan.sections.some((x) => x.id === s.section)));
});

test('a coven rite or template as a member’s own template', () => {
  const plan = cleanPlan({}, 'rite');
  const stored = { id: 'st', ritual_id: 'rt', coven_id: 'cv', position: 0, title: 'Call the quarters', instructions: 'Face east.', spoken_text: 'Hail', duration_minutes: 3, assigned_user_id: 'someone', assigned_rank_id: null, completed_at: null, completed_by: null, altar_action: null, altar_color: null, altar_form: null, altar_label: null };
  builderStepFrom(stored as never, plan);
  const draft = draftFromCoven('Full moon esbat', { kind: 'rite', intention: 'Honour the moon', steps: [stored] }, 'Moon Circle');
  assert.equal(draft.intention, 'Honour the moon');
  assert.deepEqual(draft.steps.map((s) => [s.title, s.minutes]), [['Call the quarters', '3']]);
  assert.equal(draft.from?.credit, 'From Moon Circle');
  assert.equal(JSON.stringify(draft).includes('someone'), false);
});

test('your shares: what can be changed, updated or withdrawn; the review folders', () => {
  assert.equal(canChange({ status: 'needs_revision' }), true);
  assert.equal(canChange({ status: 'published' }), false);
  assert.equal(canSendUpdate({ status: 'published' }), true);
  assert.equal(canWithdraw({ status: 'rejected' }), false);
  assert.equal(mySharesLine([{ status: 'needs_revision' }, { status: 'published' }, { status: 'published' }]), '1 returned for changes · 2 published');
  assert.equal(mySharesLine([]), 'Nothing shared yet');
  assert.deepEqual(reviewActionsFor({ status: 'pending' }), ['publish', 'return', 'decline']);
  assert.deepEqual(reviewActionsFor({ status: 'published' }), ['decline']);
  assert.deepEqual(reviewActionsFor({ status: 'withdrawn' }), []);
  assert.equal(inRitualFolder({ status: 'superseded' }, 'all'), false);
  assert.equal(inRitualFolder({ status: 'pending' }, 'pending'), true);
  const back = contentFromShared({ ...published(), user_id: 'u1', source: 'template', status: 'needs_revision', reviewer_note: 'x', reviewed_at: null, replaces_id: null, submitted_at: null });
  assert.equal(back.steps.length, 2);
  assert.equal(back.kind, 'esbat');
  assert.deepEqual(splitList('Rosemary, a white candle\nrosemary'), ['Rosemary', 'a white candle']);
});

test('closed and initiatory traditions named in a ritual are noticed; everyday words are not', () => {
  const base = { title: '', summary: '', tradition: '', deities: [], occasion: '', materials: [], preparation: '', closing: '', notes: '', steps: [] };
  assert.deepEqual(closedMentions({ ...base, title: 'A hoodoo road opener' }).map((m) => m.id), ['hoodoo']);
  assert.equal(closedMentions({ ...base, tradition: 'Lucumí' }).length > 0, true);
  assert.deepEqual(closedMentions({ ...base, title: 'Kale soup for the science fair', summary: 'Conjure a feast; honour Roma, goddess of Rome' }), []);
  assert.deepEqual(closedMentions({ ...base, title: 'Full moon water', summary: 'Cleanse the house and call the quarters' }), []);
});
