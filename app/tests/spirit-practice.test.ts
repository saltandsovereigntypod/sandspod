// Spirit practice (November 2026): the family tree, spirits of place,
// familiars, spirit sessions, practice challenges, numerology, the printable
// Book of Shadows, the planetary seals and storm water.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { normalizeAncestor, type AncestorEntry } from '../src/lib/craft/hedge/ancestors.ts';
import { buildTree, couplesIn, generationLabel, relativesOf, wouldLoop } from '../src/lib/craft/hedge/familyTree.ts';
import { normalizeSpirit, receptionCounts, spiritTimeline, welcomeOfferings, withEncounter, blankEncounter } from '../src/lib/craft/hearth/spirits.ts';
import { normalizeNote } from '../src/lib/craft/hearth/land.ts';
import { careDue, markCareDone, memorialDay, normalizeFamiliar, petCautions, spanWords } from '../src/lib/craft/hearth/familiars.ts';
import { blankSession, normalizeSession, sessionCautions, toVerify, verifyTally } from '../src/lib/craft/hedge/sessions.ts';
import { checkIn, dayNumber, newChallenge, normalizeChallenge, progressOf, promptOn, promptsFor, readyToFinish, THEMES } from '../src/lib/yearday/challenges.ts';
import { expression, lifePath, personalDay, personalYear, readBirth, reduce, soulUrge, personality, hourFor, MEANINGS } from '../src/lib/craft/cosmic/numerology.ts';
import { printableHtml, printFileName } from '../src/lib/grimoire/printBook.ts';
import { nameSum, SEALS, squareSums, traceName } from '../src/lib/sigil/seals.ts';
import { stormWaterFor } from '../src/lib/craft/elemental/weather.ts';

const person = (id: string, data: Record<string, unknown>): AncestorEntry => ({ id, createdAt: '2026-01-01T00:00:00Z', data: normalizeAncestor({ name: id, ...data }) });

test('the tree places parents, grandparents, partners, siblings and children, and leaves the unlinked apart', () => {
  const people = [
    person('Mum', { myParent: true, parents: ['Nan', 'Grandad'], partners: ['Dad'] }),
    person('Dad', { myParent: true }),
    person('Nan', { partners: ['Grandad'] }),
    person('Grandad', {}),
    person('Aunt May', { parents: ['Nan'] }),
    person('Brother', { parents: ['Mum'] }),
    person('Teacher', { kin: 'teacher' }),
  ];
  const tree = buildTree(people);
  assert.deepEqual(tree.generations.map((g) => g.label), ['Grandparents', 'Parents', 'Your generation']);
  assert.equal(tree.levelOf.Nan, 2);
  assert.equal(tree.levelOf['Aunt May'], 1);
  assert.equal(tree.levelOf.Brother, 0);
  assert.deepEqual(tree.unplaced, ['Teacher']);
  const parents = tree.generations.find((g) => g.level === 1)!.ids;
  assert.equal(Math.abs(parents.indexOf('Mum') - parents.indexOf('Dad')), 1, 'partners sit together');
  assert.deepEqual(couplesIn(people, ['Nan', 'Grandad']), [['Nan', 'Grandad']]);
  const r = relativesOf(people, 'Mum');
  assert.deepEqual(r.parents, ['Nan', 'Grandad']);
  assert.deepEqual(r.children, ['Brother']);
  assert.deepEqual(r.siblings, ['Aunt May']);
  assert.ok(wouldLoop(people, 'Nan', 'Mum'));
  assert.ok(!wouldLoop(people, 'Mum', 'Teacher'));
  assert.equal(generationLabel(5), '3× great-grandparents');
});

test('a line with no parent marked still makes a tree', () => {
  const tree = buildTree([person('Child', { parents: ['Elder'] }), person('Elder', {})]);
  assert.equal(tree.levelOf.Elder - tree.levelOf.Child, 1);
});

test('spirits of place keep visits, read the land journal’s offerings, and tally how gifts were received', () => {
  let s = normalizeSpirit({ name: 'The thorn', kind: 'tree', placeId: 'p1' });
  s = withEncounter(s, { ...blankEncounter('2026-05-01'), offering: 'Water', received: 'welcomed' });
  s = withEncounter(s, { ...blankEncounter('2026-06-01'), offering: 'water', received: 'welcomed' });
  s = withEncounter(s, { ...blankEncounter('2026-07-01'), offering: 'Bread', received: 'refused' });
  assert.equal(s.encounters[0].on, '2026-07-01');
  assert.deepEqual(receptionCounts(s), { welcomed: 2, quiet: 0, unclear: 0, refused: 1 });
  assert.deepEqual(welcomeOfferings(s), ['water']);
  const notes = [
    { id: 'n1', data: normalizeNote({ on: '2026-06-15', placeId: 'p1', kinds: ['offering'], offering: 'A song', text: '' }) },
    { id: 'n2', data: normalizeNote({ on: '2026-06-16', placeId: 'p2', kinds: ['offering'], offering: 'Milk', text: '' }) },
  ];
  const line = spiritTimeline(s, notes);
  assert.deepEqual(line.map((t) => t.on), ['2026-07-01', '2026-06-15', '2026-06-01', '2026-05-01']);
  assert.equal(normalizeSpirit({ kind: 'nonsense' }).kind, 'unknown');
});

test('familiars: care comes due, memorials come round, and the blending lab’s pet notes warn', () => {
  const f = normalizeFamiliar({ name: 'Sooty', animal: 'cat', care: [{ what: 'Flea treatment', every: 30, last: '2026-10-01' }, { what: 'Brush', every: 7, last: '' }], around: 'Lavender oil, frankincense\nTea tree' });
  const due = careDue(f, new Date(2026, 10, 6));
  assert.deepEqual(due.map((d) => [d.what, d.inDays]), [['Flea treatment', -6], ['Brush', 0]]);
  assert.equal(careDue(markCareDone(f, 0, '2026-11-06'), new Date(2026, 10, 6)).find((d) => d.what === 'Flea treatment')!.inDays, 30);
  const cautions = petCautions(f);
  assert.match(cautions[0].text, /Lavender oil, Tea tree are on pet-safety lists as harmful to cats/);
  assert.ok(cautions.some((c) => c.title === 'Lilies'));
  assert.deepEqual(petCautions({ ...f, kind: 'spirit' }), []);
  const gone = normalizeFamiliar({ name: 'Bess', kind: 'remembered', died: '2020-11-10' });
  assert.equal(memorialDay(gone, new Date(2026, 10, 6))!.years, 6);
  assert.equal(spanWords('2024-01-15', '2026-11-06'), '2 years');
  assert.equal(spanWords('2026-03-01', '2026-11-06'), '8 months');
});

test('spirit sessions: answers to check, an honest tally, and cautions', () => {
  const s = normalizeSession({
    ...blankSession(new Date(2026, 10, 6), 'board'),
    who: 'Nan',
    closed: false,
    protections: [],
    after: 'drained',
    exchanges: [
      { q: 'Where is the ring?', a: 'Blue box', check: 'yes' },
      { q: 'Will it rain?', a: 'Yes', check: 'no' },
      { q: 'Who was there?', a: 'Her brother' },
    ],
  });
  assert.equal(s.exchanges[2].check, 'pending');
  assert.deepEqual(toVerify([{ id: 'a', data: s }]).map((x) => x.index), [2]);
  assert.deepEqual(verifyTally([{ data: s }]), { checked: 2, yes: 1, partly: 0, no: 1, rate: 50 });
  assert.equal(sessionCautions(s).length, 3);
});

test('challenges: prompts differ each day, keep first and last, and streaks count unbroken days', () => {
  for (const theme of THEMES) {
    assert.equal(theme.prompts.length, 30, theme.id);
    assert.equal(new Set(theme.prompts).size, 30, `${theme.id} prompts are all different`);
    for (const n of [7, 13, 21, 30]) {
      const p = promptsFor(theme, n);
      assert.equal(p.length, n);
      assert.equal(new Set(p).size, n);
      assert.equal(p[0], theme.prompts[0]);
      assert.equal(p[n - 1], theme.prompts[29]);
    }
  }
  assert.doesNotMatch(promptOn(THEMES[1].prompts[0], new Date(2026, 10, 6)), /\{phase\}/);
  let c = newChallenge('grounding', 7, '2026-11-01');
  for (const n of [1, 2, 4, 5, 6]) c = checkIn(c, n, 'done', '2026-11-0' + n);
  const p = progressOf(c, new Date(2026, 10, 6));
  assert.deepEqual([p.day, p.done, p.streak, p.best, p.todayDone], [6, 5, 3, 3, true]);
  assert.equal(progressOf(c, new Date(2026, 10, 7)).streak, 3, 'today not yet checked keeps yesterday’s streak');
  assert.ok(!readyToFinish(c, new Date(2026, 10, 6)));
  assert.ok(readyToFinish(c, new Date(2026, 10, 9)));
  assert.equal(dayNumber(c, new Date(2026, 9, 30)), 0);
  assert.equal(normalizeChallenge({ theme: 'nope', start: '2026-11-01' }), null);
  assert.deepEqual(Object.keys(normalizeChallenge({ ...c, checkins: { ...c.checkins, 99: { on: '2026-11-01' } } })!.checkins), ['1', '2', '4', '5', '6']);
});

test('numerology: life path keeps masters, both letter systems, and personal cycles', () => {
  assert.equal(reduce(29), 11);
  assert.equal(reduce(29, false), 2);
  // 1987-12-29: 12 → 3, 29 → 11, 1987 → 25 → 7; 3 + 11 + 7 = 21 → 3.
  assert.equal(lifePath({ year: 1987, month: 12, day: 29 }).number, 3);
  // 1993-11-11: 11 + 11 + 22 (1993 → 22) = 44 → 8.
  assert.equal(lifePath({ year: 1993, month: 11, day: 11 }).number, 8);
  assert.equal(lifePath({ year: 1984, month: 11, day: 2 }).number, 8);
  // JOHN: Pythagorean 1+6+8+5 = 20 → 2; Chaldean 1+7+5+5 = 18 → 9.
  assert.equal(expression('John', 'pythagorean').number, 2);
  assert.equal(expression('John', 'chaldean').number, 9);
  assert.equal(soulUrge('Mary', 'pythagorean').compound, 1 + 7);
  assert.equal(personality('Mary', 'pythagorean').compound, 4 + 9);
  assert.equal(expression('Siân', 'pythagorean').compound, 1 + 9 + 1 + 5);
  assert.equal(personalYear({ month: 12, day: 29 }, 2026), reduce(3 + 2 + 1, false));
  assert.ok(personalDay({ month: 12, day: 29 }, new Date(2026, 10, 6)) <= 9);
  assert.equal(readBirth('31', '2', '2000'), null);
  assert.equal(hourFor(22), 'Saturn');
  assert.equal(hourFor(6), 'Venus');
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]) assert.ok(MEANINGS[n].essay.length >= 2, String(n));
});

test('the printable book has a title page, contents, a page break per page and escaped words', () => {
  const snapshot = {
    fetchedAt: '',
    books: [{ id: 'b', title: 'My Book', created_at: null, updated_at: null }],
    sections: [{ id: 's', book_id: 'b', title: 'Herbs', sort_order: 1, created_at: null }],
    pages: [
      { id: 'p1', book_id: 'b', section_id: 's', title: 'Rosemary', page_type: 'blank', sort_order: 1, metadata: null, created_at: null, updated_at: null },
      { id: 'p2', book_id: 'b', section_id: null, title: 'Intro <me>', page_type: 'blank', sort_order: 0, metadata: null, created_at: null, updated_at: null },
    ],
    blocks: [
      { id: 'k1', page_id: 'p1', block_type: 'text', content: 'For <b>remembrance</b>', rich_content: null, metadata: null, sort_order: 0, created_at: null },
      { id: 'k2', page_id: 'p1', block_type: 'bulleted_list', content: 'One\nTwo', rich_content: null, metadata: null, sort_order: 1, created_at: null },
      { id: 'k3', page_id: 'p1', block_type: 'page_link', content: '', rich_content: null, metadata: { target_page_id: 'p2' }, sort_order: 2, created_at: null },
    ],
    links: [],
  };
  const html = printableHtml(snapshot, ['p1', 'p2'], { title: 'Shadows', subtitle: '', owner: 'Rowan', contents: true, printedOn: 'Printed 6 November 2026' });
  assert.match(html, /<h1>Shadows<\/h1>/);
  assert.match(html, /<h2>Contents<\/h2>/);
  assert.ok(html.indexOf('Intro &lt;me&gt;') < html.indexOf('Rosemary'), 'unsectioned pages first');
  assert.match(html, /<strong>remembrance<\/strong>/);
  assert.match(html, /<li>Two<\/li>/);
  assert.match(html, /See: Intro &lt;me&gt;/);
  assert.match(html, /break-before: page/);
  assert.equal(printFileName('Book of Shadows', '2026-11-06'), 'book-of-shadows-2026-11-06.html');
});

test('the seals’ names add up to their squares, and trace', () => {
  for (const seal of SEALS) {
    assert.deepEqual(squareSums(seal.planet), { line: seal.line, total: seal.total }, seal.planet);
    for (const n of seal.names) {
      assert.ok([seal.line, seal.total, 49].includes(nameSum(n)), `${n.name} ${nameSum(n)}`);
      assert.ok(traceName(seal.planet, n), n.name);
    }
  }
  assert.equal(nameSum(SEALS[0].names[0]), 45);
});

test('a storm in the forecast suggests storm water, naming the storm', () => {
  const day = { date: '2026-11-07', code: 95, tempMax: 12, tempMin: 6, rainMm: 10, rainChance: 80, windMax: 20, gustMax: 40, nightCloud: 90 };
  const s = stormWaterFor(day)!;
  assert.equal(s.name, 'Storm water');
  assert.match(s.notes, /Saturday 7 November 2026: thunderstorm/);
  assert.equal(stormWaterFor({ ...day, code: 3 }), null);
});
