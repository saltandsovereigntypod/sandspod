// Archived altars rest (no reminders, nudges, To tend items or widget place),
// the one To tend card on the Altar tab, and a ritual's link to a deleted altar.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { activeAltars, archiveSave, isArchived, linkedAltar, splitArchived, withArchived } from '../src/lib/altar/archive.ts';
import { altarOfferingsDue, altarWateringDue } from '../src/lib/altar/burnout.ts';
import { altarDataFromDocument } from '../src/lib/altar/snapshot.ts';
import type { SavedAltar, SavedObject } from '../src/lib/altar/types.ts';
import { slotAltars } from '../src/lib/altarWidget.ts';
import { tendingSources } from '../src/lib/reminders/sources.ts';
import { tendCard, TEND_CARD_GENERAL } from '../src/lib/tend/card.ts';
import { altarTendables } from '../src/lib/tend/gather.ts';
import { newPetition } from '../src/lib/altar/petitions.ts';

const set = '2026-10-20T09:00:00.000Z';
const sprig: SavedObject = {
  type: 'herb',
  form: 'sprig',
  label: 'Bay Sprig',
  altarObjectId: 'bay',
  livingState: JSON.stringify({ version: 1, createdAt: set, updatedAt: set }),
};
const altar = (id: string, name: string, extra: Record<string, unknown> = {}): SavedAltar => ({ id, name, objects: [sprig], savedAt: set, updatedAt: set, ...extra });
const healing = altar('a1', 'Healing & Health');
const old = altar('a2', 'Old Shrine', { archived: true, archivedAt: '2026-10-25T00:00:00.000Z' });
const older = altar('a3', 'Older', { archived: true, archivedAt: '2026-10-01T00:00:00.000Z' });
const now = new Date('2026-10-27T12:00:00.000Z');

test('archived altars go to the bottom, newest archived first, and everything is kept', () => {
  assert.equal(isArchived(old), true);
  assert.equal(isArchived(healing), false);
  const { active, archived } = splitArchived([older, healing, old]);
  assert.deepEqual(active.map((a) => a.id), ['a1']);
  assert.deepEqual(archived.map((a) => a.id), ['a2', 'a3']);
  // Archiving keeps every object; restoring says so outright, so an older copy can't bring the flag back.
  const save = archiveSave(healing, true, now.toISOString());
  const data = altarDataFromDocument(save.doc, save.name, now.toISOString());
  assert.equal(data.archived, true);
  assert.equal(data.archivedAt, now.toISOString());
  assert.equal(data.objects?.length, 1);
  assert.deepEqual(withArchived({ archived: true, archivedAt: 'x', keep: 1 }, false, ''), { archived: false, archivedAt: '', keep: 1 });
  assert.deepEqual(activeAltars([{ ...old, ...withArchived({}, false, '') }]).length, 1);
});

test('an archived altar rests: no nudges, reminders, To tend items or widget place', () => {
  const both = [healing, old];
  assert.deepEqual(altarOfferingsDue(both, now, 0).map((d) => d.altarId), ['a1']);
  assert.deepEqual(altarWateringDue(both, now, 0), []);
  assert.deepEqual(tendingSources(both, [], now).altars.map((a) => a.id), ['a1']);
  const petitions = [{ id: 'p1', data: newPetition('a2', { title: 'Resting', words: '', intention: '', timing: 'now' }, now) }];
  const items = altarTendables({ altars: both, petitions }, now);
  assert.ok(items.length > 0);
  assert.ok(items.every((i) => !JSON.stringify(i.ref).includes('a2')));
  // The widget keeps its choice, but shows the archived altar again only once it's restored.
  assert.deepEqual(slotAltars(both, ['a2', null]).map((a) => a.id), ['a1']);
});

test('the one To tend card: the most pressing line when something is due, else what the list holds', () => {
  const due = altarOfferingsDue([healing], now, 0);
  const card = tendCard(due, []);
  assert.equal(card.pressing, true);
  assert.equal(card.altarId, 'a1');
  assert.match(card.body, /^The bay sprig on your Healing & Health altar /);
  assert.deepEqual(tendCard([], []), { body: TEND_CARD_GENERAL, pressing: false, altarId: null, altarName: '' });
});

test('a link to a deleted altar says so, once the altars are known', () => {
  assert.deepEqual(linkedAltar('a1', [healing], true), { name: 'Healing & Health', deleted: false });
  assert.deepEqual(linkedAltar('gone', [healing], true), { name: 'This altar was deleted', deleted: true });
  assert.deepEqual(linkedAltar('gone', [], false), { name: 'Your altar', deleted: false });
  assert.equal(linkedAltar(null, [healing], true), null);
});
