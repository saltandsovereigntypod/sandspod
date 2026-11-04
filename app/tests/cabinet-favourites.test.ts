import assert from 'node:assert/strict';
import { test } from 'node:test';

import { encodeFavourites, favouriteItems, readFavourites, toggleFavourite } from '../src/lib/altar/cabinetFavourites.ts';

test('toggling adds at the end and removes again', () => {
  assert.deepEqual(toggleFavourite([], 'herbs:rosemary'), ['herbs:rosemary']);
  assert.deepEqual(toggleFavourite(['herbs:rosemary'], 'tools:wand'), ['herbs:rosemary', 'tools:wand']);
  assert.deepEqual(toggleFavourite(['herbs:rosemary', 'tools:wand'], 'herbs:rosemary'), ['tools:wand']);
});

test('saved favourites read back from a JSON string, array or rubbish', () => {
  assert.deepEqual(readFavourites(encodeFavourites(['a', 'b', 'a'])), ['a', 'b']);
  assert.deepEqual(readFavourites(['a', 3, '', 'b']), ['a', 'b']);
  assert.deepEqual(readFavourites('not json'), []);
  assert.deepEqual(readFavourites(undefined), []);
});

test('favourite items keep the order added and drop unknown ids and backgrounds', () => {
  const items = [{ id: 'herbs:rosemary' }, { id: 'tools:wand' }, { id: 'custom:1' }, { id: 'bg:forest', background: 'x' }];
  const ids = ['custom:1', 'gone:item', 'herbs:rosemary', 'bg:forest'];
  assert.deepEqual(favouriteItems(items, ids).map((i) => i.id), ['custom:1', 'herbs:rosemary']);
});
