import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeReading, type ReadingEntry } from '../src/lib/craft/hedge/readings.ts';
import { canDraw, cardBody, covenReadings, covenSpread, drawCovenCard, MAX_MEMBERS, openingBody, parseCard, parseOpening, readingLines } from '../src/lib/covens/reading.ts';
import { DEIPNON_PROMPT, deipnonDays, deipnonReminders, deipnonToday, hekateIsPatron, isDeipnon, offersDeipnon } from '../src/lib/deipnon.ts';
import { drawSpread, layoutOfDraw, readingFromDraw, spreadById, spreadsFor, SPREADS } from '../src/lib/divination/draw.ts';
import { hasOwnLayout, layoutOf, overlaps } from '../src/lib/divination/layout.ts';
import {
  cardsLine,
  deityLink,
  drawParams,
  drawQuery,
  dreamReadingDraws,
  dreamsRead,
  LINK_SPREAD,
  linkedReadings,
  linkFromParams,
  linkKindOfSpread,
  linkLine,
  linkRoute,
  linkUrl,
  planIdOf,
  preReadingLine,
  preReadingOf,
  preReadingTally,
  withPlanId,
} from '../src/lib/divination/linked.ts';
import { nearSabbat, SABBAT_SPREADS, SEASONAL_LABELS, seasonalSpreads } from '../src/lib/divination/seasonal.ts';
import { holidaysBetween } from '../src/lib/holidays.ts';
import { buildSchedule, DEFAULT_SETTINGS } from '../src/lib/reminders/schedule.ts';
import { blankAnswers, createSession, finishSession, journalPayload } from '../src/lib/rituals/lifecycle.ts';

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NEW = ['crossroads', 'dream', 'before-working', 'patron-deity', 'yule', 'imbolc', 'ostara', 'beltane', 'litha', 'lammas', 'mabon'];

// ─── The spreads ─────────────────────────────────────────────────────────

test('the new spreads are tarot spreads with places that each say what they are for', () => {
  for (const id of NEW) {
    const s = spreadById(id);
    assert.ok(s, id);
    assert.equal(s.kind, 'tarot', id);
    assert.ok(s.positions.length >= 3 && s.positions.length <= 5, `${id} has ${s.positions.length} places`);
    for (const p of s.positions) {
      assert.ok(p.name.trim() && p.about.trim(), `${id}: ${p.name}`);
      assert.ok(!/!/.test(p.name + p.about), `${id}: no exclamation marks`);
    }
    assert.ok(spreadsFor('tarot').some((x) => x.id === id), `${id} can be chosen`);
  }
  assert.deepEqual(
    spreadById('crossroads')!.positions.map((p) => p.name),
    ['Where you stand', 'The road to the left', 'The road to the right', 'The road behind', 'What the guardian would have you know'],
  );
  assert.match(spreadById('crossroads')!.positions[4].about, /Hekate/);
  assert.equal(spreadById('crossroads')!.group, 'deep');
  assert.deepEqual(spreadById('dream')!.positions.map((p) => p.name), ['What the dream shows', 'What it stirs in you', 'What it asks of you']);
  assert.deepEqual(spreadById('before-working')!.positions.map((p) => p.name), ['The working itself', 'What to watch for', 'The likely outcome']);
  assert.deepEqual(spreadById('patron-deity')!.positions.map((p) => p.name), ['What this god asks of me', 'What they offer', 'How to honour them', 'What stands between us']);
  for (const id of SABBAT_SPREADS) assert.equal(spreadById(id)!.group, 'moon', id);
});

test('each new spread but Before a working has a layout of its own, and every one lays out without touching', () => {
  for (const id of NEW) {
    const s = spreadById(id)!;
    if (id !== 'before-working') assert.ok(hasOwnLayout(id), id);
    const l = layoutOf(s);
    assert.equal(l.slots.length, s.positions.length, id);
    for (let i = 0; i < l.slots.length; i++)
      for (let j = i + 1; j < l.slots.length; j++)
        assert.ok(!overlaps(l.item, { x: l.slots[i].cx, y: l.slots[i].cy, rot: l.slots[i].rot }, { x: l.slots[j].cx, y: l.slots[j].cy, rot: l.slots[j].rot }, 0.01), `${id}: ${i + 1} and ${j + 1}`);
  }
});

test('the crossroads is laid as three roads meeting, with the guardian set apart', () => {
  const [stand, left, right, behind, guardian] = layoutOf(spreadById('crossroads')!).slots;
  assert.ok(left.cx < stand.cx && right.cx > stand.cx && Math.abs(left.cy - stand.cy) < 1e-6 && Math.abs(right.cy - stand.cy) < 1e-6);
  assert.ok(behind.cy > stand.cy && Math.abs(behind.cx - stand.cx) < 1e-6);
  assert.ok(guardian.cy < stand.cy, 'the guardian above');
  // Further from where you stand than the roads are.
  assert.ok(stand.cy - guardian.cy > behind.cy - stand.cy + 0.3);
});

test('no two spreads share a label, so kept readings find their spread again', () => {
  assert.equal(new Set(SPREADS.map((s) => `${s.kind}|${s.label}`)).size, SPREADS.length);
  const random = seeded(7);
  for (const id of NEW) {
    const s = spreadById(id)!;
    const d = drawSpread(s, { reversals: true, blankRune: false }, random);
    assert.equal(layoutOfDraw(s, d).slots.length, s.positions.length);
  }
});

// ─── Sabbat spreads near their sabbat ────────────────────────────────────

test('each sabbat’s spread is offered in the days around it, and not far from it', () => {
  for (const id of SABBAT_SPREADS) assert.equal(spreadById(id)?.label, SEASONAL_LABELS[id], id);
  const wheel = holidaysBetween(new Date(2027, 0, 1), new Date(2027, 11, 31), { traditions: ['wheel'], custom: [] });
  assert.equal(wheel.length, 8);
  for (const h of wheel) {
    const id = h.id.split('-')[1];
    const on = (offset: number) => seasonalSpreads(new Date(h.date.getFullYear(), h.date.getMonth(), h.date.getDate() + offset, 12)).map((s) => s.spread);
    assert.ok(on(0).includes(id), `${id} on the day`);
    assert.ok(on(-5).includes(id), `${id} five days before`);
    assert.ok(on(4).includes(id), `${id} four days after`);
    assert.ok(!on(-20).includes(id), `${id} not three weeks before`);
  }
  assert.equal(seasonalSpreads(new Date(2026, 11, 21, 12)).find((s) => s.spread === 'yule')?.why, 'It’s Yule');
  assert.equal(seasonalSpreads(new Date(2027, 0, 31, 12)).find((s) => s.spread === 'imbolc')?.why, 'Imbolc is tomorrow');
  assert.equal(seasonalSpreads(new Date(2027, 4, 4, 12)).find((s) => s.spread === 'beltane')?.why, 'Beltane has just passed');
  // In the south, Beltane is at the end of October and Imbolc in August.
  assert.equal(nearSabbat(new Date(2026, 9, 30, 12), { south: true })?.spread, 'beltane');
  assert.equal(nearSabbat(new Date(2026, 7, 1, 12), { south: true })?.spread, 'imbolc');
  assert.equal(nearSabbat(new Date(2026, 6, 10, 12)), null);
});

// ─── Readings drawn for something ────────────────────────────────────────

const entry = (id: string, data: Partial<ReturnType<typeof normalizeReading>> & Record<string, unknown>, createdAt = '2026-10-01T10:00:00Z'): ReadingEntry => ({
  id,
  createdAt,
  data: normalizeReading({ date: '2026-10-01', method: 'tarot', drawn: [], cameUp: '', ...data }),
});

test('a reading keeps what it was drawn for, and whether it bore out; bad links are dropped', () => {
  const r = normalizeReading({ date: '2026-10-01', method: 'tarot', linkedTo: { kind: 'dream', id: 'd1', title: 'The flood' }, matched: 'partly' });
  assert.deepEqual(r.linkedTo, { kind: 'dream', id: 'd1', title: 'The flood' });
  assert.equal(r.matched, 'partly');
  const bad = normalizeReading({ date: '2026-10-01', method: 'tarot', linkedTo: { kind: 'altar', id: 'x' }, matched: 'maybe' });
  assert.equal('linkedTo' in bad, false);
  assert.equal('matched' in bad, false);
  assert.equal('linkedTo' in normalizeReading({ date: '2026-10-01', method: 'tarot' }), false, 'older readings have none');
});

test('a draw for a dream, plan or deity is kept with its link', () => {
  const link = linkFromParams({ dream: 'd1', title: 'The flood' })!;
  assert.deepEqual(link, { kind: 'dream', id: 'd1', title: 'The flood' });
  assert.equal(linkFromParams({}), null);
  assert.deepEqual(drawParams(link), { spread: 'dream', dream: 'd1', title: 'The flood' });
  assert.equal(drawQuery(link), '?spread=dream&dream=d1&title=The%20flood');
  assert.equal(linkKindOfSpread('before-working'), 'plan');
  assert.equal(linkKindOfSpread('celtic-cross'), null);
  for (const [kind, spread] of Object.entries(LINK_SPREAD)) assert.ok(spreadById(spread), kind);
  const s = spreadById('dream')!;
  const reading = readingFromDraw(s, drawSpread(s, { reversals: false, blankRune: false }, seeded(1)), { now: new Date(2026, 9, 26, 9), linkedTo: link });
  assert.deepEqual(normalizeReading(reading).linkedTo, link);
  assert.equal(linkLine(link), 'Drawn for the dream “The flood”');
  assert.equal(linkRoute(link), '/grimoire/dreams/d1');
  assert.equal(linkUrl(link), '/grimoire/dreams/dream/?id=d1');
  assert.equal(linkRoute({ kind: 'plan', id: 'p1', title: '' }), '/rituals/plan/p1');
  assert.equal(linkLine({ kind: 'plan', id: 'p1', title: 'Money jar' }), 'Drawn before “Money jar”');
  assert.equal(cardsLine(reading).split('\n').length, 3);
  assert.ok(cardsLine(reading).startsWith('What the dream shows: '));
});

test('a dream’s readings are found on its page, and the cards that recur across dream readings are counted', () => {
  const list = [
    entry('a', { linkedTo: { kind: 'dream', id: 'd1', title: '' }, drawn: ['The Moon', 'The Star', 'Death'], date: '2026-10-01' }),
    entry('b', { linkedTo: { kind: 'dream', id: 'd2', title: '' }, drawn: ['The Moon', 'Ace of Cups', 'Death'], date: '2026-10-03' }),
    entry('c', { linkedTo: { kind: 'dream', id: 'd1', title: '' }, drawn: ['The Moon'], date: '2026-10-05' }),
    entry('d', { drawn: ['Ace of Cups', 'Ace of Cups'], date: '2026-10-06' }),
    entry('e', { linkedTo: { kind: 'plan', id: 'd1', title: '' }, drawn: ['The Moon'] }),
  ];
  assert.deepEqual(linkedReadings(list, 'dream', 'd1').map((e) => e.id), ['c', 'a']);
  assert.deepEqual(linkedReadings(list, 'dream', null), []);
  assert.deepEqual(dreamReadingDraws(list), [
    { name: 'The Moon', count: 3 },
    { name: 'Death', count: 2 },
  ]);
  assert.equal(dreamsRead(list), 2);
});

test('a working’s journal entry knows its plan, and finds the reading drawn before it', () => {
  const session = createSession({ kind: 'free', title: 'Money jar', intention: 'Plenty' }, { userId: null, now: new Date(2026, 9, 26, 20), idFactory: () => 's1' });
  const withPlan = { ...session, metadata: withPlanId(session.metadata, 'plan-1') };
  const done = finishSession(withPlan, 'completed', new Date(2026, 9, 26, 21));
  const journal = journalPayload({ session: done, answers: blankAnswers(done, new Date(2026, 9, 26, 21)), userId: null, id: 'j1', now: new Date(2026, 9, 26, 21) });
  assert.equal(planIdOf(journal), 'plan-1');
  assert.equal(planIdOf(journalPayload({ session: null, answers: blankAnswers(null, new Date()), userId: null, id: 'j2', now: new Date() })), null);
  const list = [
    entry('r1', { linkedTo: { kind: 'plan', id: 'plan-1', title: 'Money jar' }, date: '2026-10-25' }),
    entry('r2', { linkedTo: { kind: 'plan', id: 'plan-1', title: 'Money jar' }, date: '2026-10-26' }),
    entry('r3', { linkedTo: { kind: 'plan', id: 'plan-2', title: 'Other' }, date: '2026-10-26' }),
  ];
  assert.equal(preReadingOf(list, journal)?.id, 'r2', 'the newest one');
  assert.equal(preReadingOf(list, { metadata: {} }), null);
});

test('What works says how often pre-readings bore out, plainly, once any has been weighed', () => {
  assert.equal(preReadingLine([entry('x', { linkedTo: { kind: 'plan', id: 'p', title: '' } })]), null);
  const list = [
    entry('a', { linkedTo: { kind: 'plan', id: 'p1', title: '' }, matched: 'yes' }),
    entry('b', { linkedTo: { kind: 'plan', id: 'p2', title: '' }, matched: 'yes' }),
    entry('c', { linkedTo: { kind: 'plan', id: 'p3', title: '' }, matched: 'no' }),
    entry('d', { linkedTo: { kind: 'plan', id: 'p4', title: '' }, matched: 'partly' }),
    entry('e', { linkedTo: { kind: 'dream', id: 'd', title: '' }, matched: 'yes' }),
  ];
  assert.deepEqual(preReadingTally(list), { total: 4, yes: 2, partly: 1, no: 1 });
  assert.equal(preReadingLine(list), 'Of the 4 readings you drew before a working and looked back on, 2 bore out, 1 partly, 1 didn’t.');
  assert.equal(preReadingLine(list.slice(0, 1)), 'Of the one reading you drew before a working and looked back on, 1 bore out. Only a few so far, so it’s early to say.');
});

test('a deity is drawn for by its Living Library key, or its name', () => {
  assert.deepEqual(deityLink('traditional/deity/hekate', 'Hekate'), { kind: 'deity', id: 'hekate', title: 'Hekate' });
  assert.deepEqual(deityLink(null, ' My Lady '), { kind: 'deity', id: 'my lady', title: 'My Lady' });
  assert.equal(linkRoute(deityLink('hekate', 'Hekate')), '/rituals/library/traditional:deity:hekate');
  assert.equal(linkRoute(deityLink(null, 'My Lady')), '/more/settings/deities');
});

// ─── Hekate's Deipnon ────────────────────────────────────────────────────

const hellenic = { calendar_traditions: 'wheel,hellenic_monthly' };
const hekate = (level: string) => ({ my_deities: JSON.stringify([{ key: 'hekate', name: 'Hekate', level, since: '2025-01-01' }]) });

test('the Deipnon falls on the last day of each Attic month, the day before the Noumenia', () => {
  const from = new Date(2026, 0, 1);
  const days = deipnonDays(from, 365);
  assert.ok(days.length >= 12 && days.length <= 13, `${days.length}`);
  const noumenia = holidaysBetween(from, new Date(2027, 0, 31), { traditions: ['hellenic_monthly'], custom: [] })
    .filter((h) => h.id.startsWith('hellenic_monthly-noumenia-'))
    .map((h) => h.date.getTime());
  for (const d of days) assert.ok(noumenia.includes(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime()), d.toDateString());
  // About a lunation apart.
  for (let i = 1; i < days.length; i++) {
    const gap = Math.round((days[i].getTime() - days[i - 1].getTime()) / 86_400_000);
    assert.ok(gap === 29 || gap === 30, `${gap}`);
  }
  assert.ok(isDeipnon(new Date(days[0].getTime() + 15 * 3_600_000)));
  assert.ok(!isDeipnon(new Date(days[0].getTime() + 39 * 3_600_000)));
});

test('the Deipnon is offered to those who keep the monthly days or hold Hekate as patron, and can be turned off', () => {
  assert.equal(offersDeipnon(hellenic), true);
  assert.equal(offersDeipnon({ calendar_traditions: 'wheel,custom', calendar_picked_holidays: 'hellenic_monthly/deipnon' }), true);
  assert.equal(offersDeipnon(hekate('patron')), true);
  assert.equal(hekateIsPatron({ my_deities: JSON.stringify([{ key: null, name: 'Hecate', level: 'patron' }]) }), true);
  assert.equal(offersDeipnon(hekate('dedicated')), false);
  assert.equal(offersDeipnon({ calendar_traditions: 'wheel,hellenic' }), false);
  assert.equal(offersDeipnon(null), false);
  assert.equal(offersDeipnon({ ...hellenic, deipnon_prompt: false }), false);
  assert.equal(offersDeipnon({ ...hekate('patron'), deipnon_prompt: false }), false);
});

test('Today shows the Deipnon note only on the day, with the Crossroads to draw', () => {
  const [day] = deipnonDays(new Date(2026, 9, 1), 60);
  const on = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10);
  const before = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, 10);
  assert.equal(deipnonToday(on, hellenic), DEIPNON_PROMPT);
  assert.equal(deipnonToday(before, hellenic), null);
  assert.equal(deipnonToday(on, {}), null);
  assert.equal(DEIPNON_PROMPT.spread, 'crossroads');
  assert.ok(spreadById(DEIPNON_PROMPT.spread));
  assert.equal(DEIPNON_PROMPT.steps.length, 3);
  assert.match(DEIPNON_PROMPT.steps.join(' '), /clean/i);
  assert.match(DEIPNON_PROMPT.steps.join(' '), /crossroads/);
  assert.match(DEIPNON_PROMPT.steps.join(' '), /Crossroads spread/);
});

test('the Deipnon reminder comes on the morning of the day, in place of Hekate’s own sacred-day reminder', () => {
  const now = new Date(2026, 9, 1, 8);
  assert.deepEqual(deipnonReminders({}, now, 30), []);
  const deipna = deipnonReminders(hekate('patron'), now, 30);
  assert.ok(deipna.length >= 1);
  const settings = { ...DEFAULT_SETTINGS, sacredDays: true, sacredAt: 9 * 60 };
  const sacred = [{ key: 'hekate', name: 'Hekate', devotion: { key: 'hekate', sacred: [{ rule: { kind: 'holiday', tradition: 'hellenic_monthly', id: 'deipnon' }, name: 'The Deipnon', why: '', basis: 'ancient' }], devotions: [], approach: '', sources: [] } }];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schedule = buildSchedule(settings, [], now, 30, sacred as any, [], [], [], deipna);
  const ours = schedule.filter((r) => r.kind === 'deipnon');
  assert.equal(ours.length, deipna.length);
  assert.equal(ours[0].at.getHours(), 9);
  assert.equal(ours[0].url, '/today');
  assert.ok(!schedule.some((r) => r.kind === 'sacred' && r.key.startsWith('sacred-hekate:') && ours.some((o) => o.at.toDateString() === r.at.toDateString())), 'not twice');
  // Without the Deipnon reminder, Hekate's own sacred day still comes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assert.ok(buildSchedule(settings, [], now, 30, sacred as any).some((r) => r.kind === 'sacred'));
});

// ─── A coven reading ─────────────────────────────────────────────────────

const msg = (id: string, user: string, body: string, minute: number, reply_to: string | null = null) => ({
  id,
  user_id: user,
  body,
  created_at: `2026-10-26T20:${String(minute).padStart(2, '0')}:00Z`,
  deleted_at: null,
  reply_to,
});

test('a coven reading’s messages read plainly and read back', () => {
  const coven = { name: 'The Star', reversed: false };
  const body = openingBody('  The winter ahead ', coven);
  assert.match(body, /^A coven reading: The winter ahead\nFor the coven as a whole: The Star \(/);
  assert.deepEqual(parseOpening(body), { question: 'The winter ahead', coven });
  assert.deepEqual(parseOpening(openingBody('', { name: 'The Tower', reversed: true })), { question: '', coven: { name: 'The Tower', reversed: true } });
  assert.equal(parseOpening('Hello all'), null);
  assert.deepEqual(parseCard(cardBody({ name: 'Ten of Cups', reversed: true })), { name: 'Ten of Cups', reversed: true });
  assert.equal(parseCard('My card for the coven reading: Not a card'), null);
});

test('members’ cards gather under the reading: one each, never the same card twice, up to nine', () => {
  const messages = [
    msg('o', 'u0', openingBody('Winter', { name: 'The Star', reversed: false }), 0),
    msg('a', 'u1', cardBody({ name: 'The Moon', reversed: false }), 1, 'o'),
    msg('b', 'u1', cardBody({ name: 'The Sun', reversed: false }), 2, 'o'), // a second from the same person
    msg('c', 'u2', cardBody({ name: 'The Moon', reversed: true }), 3, 'o'), // a card already in it
    msg('d', 'u3', cardBody({ name: 'Death', reversed: false }), 4, 'o'),
    msg('e', 'u4', 'Lovely', 5, 'o'),
    msg('f', 'u5', cardBody({ name: 'Justice', reversed: false }), 6, null), // not a reply
  ];
  const [reading] = covenReadings(messages);
  assert.equal(reading.question, 'Winter');
  assert.deepEqual(reading.members.map((m) => [m.userId, m.item.name]), [
    ['u1', 'The Moon'],
    ['u3', 'Death'],
  ]);
  assert.equal(canDraw(reading, 'u1'), false);
  assert.equal(canDraw(reading, 'u2'), true);
  assert.equal(canDraw(reading, null), false);
  assert.deepEqual(readingLines(reading, (id) => id)[1].split(':')[0], 'u1');

  const many = [msg('o', 'u0', openingBody('', { name: 'The Star', reversed: false }), 0)];
  const names = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit'];
  names.forEach((name, i) => many.push(msg(`m${i}`, `u${i + 1}`, cardBody({ name, reversed: false }), i + 1, 'o')));
  const [full] = covenReadings(many);
  assert.equal(full.members.length, MAX_MEMBERS);
  assert.equal(full.full, true);
  assert.equal(canDraw(full, 'u99'), false);
  assert.equal(covenReadings([{ ...many[0], deleted_at: '2026-10-27T00:00:00Z' }]).length, 0);
});

test('a member’s card is drawn from what’s left, and the reading lays out round the coven’s card', () => {
  const reading = { coven: { name: 'The Star', reversed: false }, members: [{ userId: 'u1', item: { name: 'The Moon', reversed: false }, messageId: 'a' }] };
  const random = seeded(3);
  for (let i = 0; i < 200; i++) assert.ok(!['The Star', 'The Moon'].includes(drawCovenCard(reading, false, random).name));
  assert.equal(drawCovenCard(null, false, random).reversed, false);
  for (let n = 0; n <= MAX_MEMBERS; n++) {
    const members = Array.from({ length: n }, (_, i) => ({ userId: `u${i}`, item: { name: `x${i}`, reversed: false }, messageId: `m${i}` }));
    const { spread, draw } = covenSpread({ question: '', coven: reading.coven, members }, (id) => id);
    const l = layoutOfDraw(spread, draw);
    assert.equal(l.slots.length, n + 1);
    // The coven's card in the middle: every member's card the same distance from it.
    const dist = l.slots.slice(1).map((m) => Math.hypot(m.cx - l.slots[0].cx, m.cy - l.slots[0].cy));
    assert.ok(dist.every((d) => Math.abs(d - dist[0]) < 0.01), `the coven’s card in the middle with ${n}`);
    for (let i = 0; i < l.slots.length; i++)
      for (let j = i + 1; j < l.slots.length; j++)
        assert.ok(!overlaps(l.item, { x: l.slots[i].cx, y: l.slots[i].cy }, { x: l.slots[j].cx, y: l.slots[j].cy }, 0.01), `${n}: ${i} and ${j}`);
  }
});
