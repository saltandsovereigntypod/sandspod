// Divination study mode: every deck's cards with their meanings (each tarot
// deck in its own reading), Leitner boxes, the day's study, progress and a
// card to learn today.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BOX_DAYS, cardToLearn, deckProgress, dueCards, emptyStudy, normalizeStudy, quizChoices, review, studyCards, studyDecks } from '../src/lib/divination/study.ts';

const day = (d: number) => new Date(2026, 10, d, 10);

test('every deck has its cards, the tarot in each deck’s own reading', () => {
  const ids = studyDecks().map((d) => d.id);
  assert.deepEqual(ids, ['tarot:rws', 'tarot:marseille', 'tarot:sola-busca', 'runes', 'ogham', 'lenormand', 'kipper']);
  assert.equal(studyCards('tarot:rws').length, 78);
  assert.equal(studyCards('runes').length, 24);
  assert.equal(studyCards('ogham').length, 20);
  assert.equal(studyCards('lenormand').length, 36);
  assert.equal(studyCards('kipper').length, 36);
  const rws = studyCards('tarot:rws').find((c) => c.id === '00-the-fool')!;
  const marseille = studyCards('tarot:marseille').find((c) => c.id === '00-the-fool')!;
  assert.ok(rws.keywords && marseille.keywords);
  assert.notEqual(marseille.name + marseille.keywords, rws.name + rws.keywords, 'Marseille reads in its own way');
  for (const c of studyCards('runes')) assert.ok(c.keywords && c.glyph, c.name);
});

test('your own decks can be studied when their cards have meanings', () => {
  const own = [
    { id: 'd1', data: { name: 'Moon oracle', cards: [{ id: 'c1', name: 'Tide', keywords: 'ebb and flow', meaning: 'Things turn.', reversed: '', photo: '' }, { id: 'c2', name: 'Blank', keywords: '', meaning: '', reversed: '', photo: '' }] } },
    { id: 'd2', data: { name: 'Empty', cards: [] } },
  ];
  assert.deepEqual(studyDecks(own).slice(7).map((d) => d.id), ['own:d1']);
  assert.deepEqual(studyCards('own:d1', own).map((c) => c.name), ['Tide']);
});

test('Leitner boxes: right moves up and away, wrong back to box one', () => {
  let s = emptyStudy('runes');
  s = review(s, 'fehu', true, day(4));
  assert.deepEqual(s.cards.fehu, { box: 1, due: '2026-11-05', seen: 1, right: 1 });
  s = review(s, 'fehu', true, day(5));
  assert.equal(s.cards.fehu.box, 2);
  assert.equal(s.cards.fehu.due, '2026-11-08');
  for (let i = 0; i < 6; i++) s = review(s, 'fehu', true, day(8));
  assert.equal(s.cards.fehu.box, 5, 'never past the top box');
  assert.equal(s.cards.fehu.due, `2026-12-08`, `${BOX_DAYS[5]} days`);
  s = review(s, 'fehu', false, day(9));
  assert.deepEqual([s.cards.fehu.box, s.cards.fehu.due, s.cards.fehu.seen, s.cards.fehu.right], [1, '2026-11-10', 9, 8]);
  assert.deepEqual(normalizeStudy(JSON.parse(JSON.stringify(s)), 'x'), s, 'round trip');
});

test('the day’s study: due first, then a few new; progress and a card to learn', () => {
  const cards = studyCards('runes');
  let s = emptyStudy('runes');
  assert.deepEqual(dueCards(cards, s, day(4), 20, 7).map((c) => c.id), cards.slice(0, 7).map((c) => c.id));
  s = review(s, 'uruz', false, day(3));
  s = review(s, 'fehu', true, day(1));
  const today = dueCards(cards, s, day(4), 20, 2).map((c) => c.id);
  assert.deepEqual(today, ['fehu', 'uruz', 'thurisaz', 'ansuz']);
  const p = deckProgress(cards, s, day(4));
  assert.deepEqual([p.total, p.seen, p.known, p.due, p.boxes[0]], [24, 2, 0, 2, 2]);
  const learn = cardToLearn(cards, s, day(4))!;
  assert.ok(!s.cards[learn.id], 'an unseen card');
  assert.equal(cardToLearn(cards, s, day(4))!.id, learn.id, 'the same all day');
});

test('a quiz offers the right meaning among others', () => {
  const cards = studyCards('lenormand');
  const choices = quizChoices(cards, cards[0], 'seed');
  assert.equal(choices.length, 4);
  assert.ok(choices.includes(cards[0].keywords));
  assert.equal(new Set(choices).size, 4);
  assert.deepEqual(quizChoices(cards, cards[0], 'seed'), choices, 'steady for a seed');
});
