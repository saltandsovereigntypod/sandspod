import assert from 'node:assert/strict';
import { test } from 'node:test';

import { customSpreads } from '../src/lib/divination/custom.ts';
import { drawSpread, spreadById, type DrawOptions } from '../src/lib/divination/draw.ts';
import {
  DRAFT_DAYS,
  draftKey,
  draftOf,
  draftSummary,
  draftWhen,
  isFreshDraft,
  opensOwnDraw,
  parseDraft,
  restoreDraft,
  serializeDraft,
  stampDraft,
  type DrawDraftState,
} from '../src/lib/divination/drawDraft.ts';
import { ownDecks } from '../src/lib/divination/oracle/decks.ts';

const options: DrawOptions = { reversals: true, blankRune: false };
const seq = (start = 0.11) => {
  let x = start;
  return () => (x = (x * 9301 + 0.49297) % 1);
};

function state(over: Partial<DrawDraftState> = {}): DrawDraftState {
  return {
    kind: 'tarot',
    spread: 'celtic-cross',
    ownDeck: null,
    deck: 'marseille',
    question: 'What is ahead at work?',
    link: null,
    options,
    byHand: false,
    placed: [],
    draw: null,
    revealed: [],
    selected: null,
    interpretation: '',
    lookBack: null,
    ...over,
  };
}

const cross = spreadById('celtic-cross')!;
const drawn = drawSpread(cross, options, seq());
const now = new Date(2026, 9, 27, 15, 0);

test('nothing is kept until there is a draw, or a pull begun by hand', () => {
  assert.equal(draftOf(state()), null);
  assert.equal(draftKey(state()), '');
  assert.equal(serializeDraft(state(), now), null);
  assert.equal(draftOf(state({ byHand: true, placed: cross.positions.map(() => null) })), null);
  assert.ok(draftOf(state({ byHand: true, placed: [{ name: 'The Moon', reversed: false }, ...cross.positions.slice(1).map(() => null)] })));
  assert.ok(draftOf(state({ draw: drawn, revealed: drawn.items.map(() => false) })));
});

test('a draft goes into storage and comes back exactly: same cards, same turned and chosen', () => {
  const revealed = drawn.items.map((_, i) => i < 4);
  const s = state({ draw: drawn, revealed, selected: 3, interpretation: 'Patience.', lookBack: '2026-11-03', link: { kind: 'dream', id: 'd1', title: 'The flood' } });
  const text = serializeDraft(s, now)!;
  const back = parseDraft(text)!;
  assert.equal(back.savedAt, now.toISOString());
  assert.deepEqual(back.draw, drawn);
  assert.deepEqual(back.revealed, revealed);
  assert.equal(back.selected, 3);
  assert.equal(back.question, 'What is ahead at work?');
  assert.equal(back.deck, 'marseille');
  assert.deepEqual(back.options, options);
  assert.deepEqual(back.link, { kind: 'dream', id: 'd1', title: 'The flood' });
  assert.equal(back.interpretation, 'Patience.');
  assert.equal(back.lookBack, '2026-11-03');
  // The key is the draft without its stamp, so a screen saves only on a real change.
  assert.equal(stampDraft(draftKey(s), now), text);
  assert.equal(draftKey(s), draftKey({ ...s, revealed: [...revealed] }));
  assert.notEqual(draftKey(s), draftKey({ ...s, selected: 2 }));
});

test('unreadable or out-of-shape drafts are let go', () => {
  assert.equal(parseDraft(null), null);
  assert.equal(parseDraft('{not json'), null);
  assert.equal(parseDraft('[]'), null);
  const good = JSON.parse(serializeDraft(state({ draw: drawn, revealed: drawn.items.map(() => true) }), now)!);
  assert.ok(parseDraft(JSON.stringify(good)));
  assert.equal(parseDraft(JSON.stringify({ ...good, v: 2 })), null);
  assert.equal(parseDraft(JSON.stringify({ ...good, kind: 'tea-leaves' })), null);
  assert.equal(parseDraft(JSON.stringify({ ...good, savedAt: 'whenever' })), null);
  assert.equal(parseDraft(JSON.stringify({ ...good, draw: { spread: 'celtic-cross', items: [{ name: 7 }] } })), null);
  assert.equal(parseDraft(JSON.stringify({ ...good, draw: null })), null);
  // A chosen card out of range is simply not chosen.
  assert.equal(parseDraft(JSON.stringify({ ...good, selected: 40 }))!.selected, null);
});

test('a draft is offered for a week', () => {
  const at = (ms: number) => ({ savedAt: new Date(now.getTime() - ms).toISOString() });
  assert.ok(isFreshDraft(at(0), now));
  assert.ok(isFreshDraft(at(6 * 86_400_000), now));
  assert.equal(isFreshDraft(at(DRAFT_DAYS * 86_400_000 + 1), now), false);
  assert.equal(isFreshDraft(at(-86_400_000), now), false);
  assert.equal(isFreshDraft({ savedAt: 'soon' }, now), false);
});

test('opened for a draw in particular, no draft is offered', () => {
  assert.equal(opensOwnDraw({}), false);
  assert.equal(opensOwnDraw({ spread: '', title: 'x' }), false);
  for (const k of ['kind', 'spread', 'deck', 'dream', 'plan', 'deity']) assert.ok(opensOwnDraw({ [k]: 'x' }), k);
});

test('restoring checks the spread, the deck and every card still exist', () => {
  const s = state({ draw: drawn, revealed: drawn.items.map(() => true) });
  const draft = parseDraft(serializeDraft(s, now))!;
  const ok = restoreDraft(draft);
  assert.equal(ok!.spread.id, 'celtic-cross');
  // A card that is no longer in the deck.
  const odd = { ...draft, draw: { ...drawn, items: drawn.items.map((it, i) => (i === 0 ? { ...it, name: 'The Bus Stop' } : it)) } };
  assert.equal(restoreDraft(odd), null);
  // A spread that no longer exists, or the wrong number of cards for it.
  assert.equal(restoreDraft({ ...draft, spread: 'custom-gone', draw: { ...drawn, spread: 'custom-gone' } }), null);
  assert.equal(restoreDraft({ ...draft, draw: { ...drawn, items: drawn.items.slice(1) } }), null);
});

test('a spread of your own, changed since, lets the draft go', () => {
  const entry = { id: 'e1', data: { name: 'The well', kind: 'tarot', detail: '', shape: 'line', positions: [{ name: 'Water', about: '' }, { name: 'Stone', about: '' }] } };
  const custom = customSpreads([entry]);
  const d = drawSpread(custom[0], options, seq(0.3));
  const draft = parseDraft(serializeDraft(state({ spread: 'custom-e1', draw: d, revealed: [true, false] }), now))!;
  assert.ok(restoreDraft(draft, { custom }));
  assert.equal(restoreDraft(draft), null);
  const fewer = customSpreads([{ ...entry, data: { ...entry.data, positions: [{ name: 'Water', about: '' }] } }]);
  assert.equal(restoreDraft(draft, { custom: fewer }), null);
});

test('a deck of your own must still be there, with the cards drawn', () => {
  const decks = ownDecks([{ id: 'deck1', data: { name: 'Hedge cards', cards: [{ name: 'Oak' }, { name: 'Ash' }, { name: 'Thorn' }] } }]);
  const single = spreadById('daily')!;
  const draft = parseDraft(
    serializeDraft(state({ kind: 'oracle', ownDeck: 'deck1', spread: single.id, draw: { spread: single.id, items: [{ name: 'Ash', reversed: false }] }, revealed: [false] }), now),
  )!;
  const ok = restoreDraft(draft, { decks });
  assert.equal(ok!.ownDeck!.id, 'deck1');
  assert.equal(ok!.spread.kind, 'oracle');
  assert.equal(restoreDraft(draft, { decks: [] }), null);
  const renamed = ownDecks([{ id: 'deck1', data: { name: 'Hedge cards', cards: [{ name: 'Oak' }] } }]);
  assert.equal(restoreDraft(draft, { decks: renamed }), null);
});

test('a pull being logged by hand comes back with its places', () => {
  const placed = cross.positions.map((_, i) => (i === 0 ? { name: 'The Star', reversed: true } : null));
  const draft = parseDraft(serializeDraft(state({ byHand: true, placed }), now))!;
  assert.deepEqual(draft.placed, placed);
  assert.ok(restoreDraft(draft));
  assert.equal(draftSummary(restoreDraft(draft)!, now), 'Celtic Cross · 1 of 10 cards placed by hand · just now');
  assert.equal(restoreDraft({ ...draft, placed: placed.slice(2) }), null);
});

test('a cast keeps where each rune fell', () => {
  const cast = spreadById('nine-rune-cast')!;
  const d = drawSpread(cast, options, seq(0.7));
  const draft = parseDraft(serializeDraft(state({ kind: 'runes', spread: cast.id, draw: d, revealed: d.items.map(() => false) }), now))!;
  assert.deepEqual(draft.draw, d);
  assert.ok(restoreDraft(draft));
  assert.equal(restoreDraft({ ...draft, draw: { ...d, items: d.items.map(({ name, reversed }) => ({ name, reversed })) } }), null);
});

test('the summary says what is waiting, and when', () => {
  const s = state({ draw: drawn, revealed: drawn.items.map((_, i) => i < 4) });
  const later = new Date(now.getTime() + 2 * 3_600_000);
  const r = restoreDraft(parseDraft(serializeDraft(s, now))!)!;
  assert.equal(draftSummary(r, later), 'Celtic Cross · 10 cards drawn, 4 turned over · 2 hours ago');
  const none = restoreDraft(parseDraft(serializeDraft({ ...s, revealed: [] }, now))!)!;
  assert.match(draftSummary(none, later), /10 cards drawn, none turned over yet/);
  assert.equal(draftWhen(now.toISOString(), new Date(now.getTime() + 20 * 60_000)), '20 minutes ago');
  assert.equal(draftWhen(now.toISOString(), new Date(now.getTime() + 70 * 60_000)), 'an hour ago');
  assert.equal(draftWhen(now.toISOString(), new Date(2026, 9, 28, 9)), 'yesterday');
  assert.equal(draftWhen(now.toISOString(), new Date(2026, 9, 30, 9)), '3 days ago');
});
