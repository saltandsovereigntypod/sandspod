import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  aggregatePaths,
  countsMe,
  MIN_COUNT,
  MIN_SHARED,
  OTHER_LABEL,
  percent,
  readOverview,
  section,
  sectionBars,
  sectionLine,
  seesPaths,
  sharedLine,
  sortItems,
} from '../src/lib/covens/paths.ts';

const deities = (list: { key?: string | null; name: string; level?: string }[]) => JSON.stringify(list.map((d) => ({ key: d.key ?? null, name: d.name, level: d.level ?? 'exploring', since: '' })));
const member = (user: string, settings: Record<string, unknown> | null) => ({ user, settings });

test('only counts the members who have not turned it off', () => {
  assert.equal(countsMe({}), true);
  assert.equal(countsMe(null), true);
  assert.equal(countsMe({ coven_paths_count_me: true }), true);
  assert.equal(countsMe({ coven_paths_count_me: false }), false);
  assert.equal(countsMe({ coven_paths_count_me: 'false' }), false);
});

test('percentages are of those who shared, rounded half up as Postgres rounds', () => {
  assert.equal(percent(1, 8), 13); // 12.5
  assert.equal(percent(3, 40), 8); // 7.5
  assert.equal(percent(1, 3), 33);
  assert.equal(percent(2, 3), 67);
  assert.equal(percent(5, 0), 0);
});

test('sorts most first, then by name', () => {
  const sorted = sortItems([
    { key: 'b', name: 'Hedge', count: 3, pct: 30 },
    { key: 'a', name: 'Green', count: 5, pct: 50 },
    { key: 'c', name: 'Cosmic', count: 3, pct: 30 },
  ]);
  assert.deepEqual(sorted.map((i) => i.name), ['Green', 'Cosmic', 'Hedge']);
});

test('anything fewer than three share goes under Other, counted once per member', () => {
  const rows = [
    ...['u1', 'u2', 'u3', 'u4'].map((user) => ({ user, key: 'green', name: 'Green' })),
    { user: 'u1', key: 'sea', name: 'Sea' },
    { user: 'u1', key: 'crystal', name: 'Crystal' },
    { user: 'u5', key: 'crystal', name: 'Crystal' },
  ];
  const s = section(rows, 5);
  assert.deepEqual(s.items, [{ key: 'green', name: 'Green', count: 4, pct: 80 }]);
  assert.deepEqual(s.other, { count: 2, pct: 40 });
  assert.deepEqual(sectionBars(s).map((b) => b.name), ['Green', OTHER_LABEL]);
  // A section fewer than three shared shows nothing at all.
  assert.deepEqual(section(rows.slice(0, 2), 2), { shared: 2, items: [], other: { count: 0, pct: 0 } });
});

test('waits until five members have shared anything', () => {
  const four = ['u1', 'u2', 'u3', 'u4'].map((u) => member(u, { my_practice: 'green' }));
  const o = aggregatePaths([...four, member('u5', null), member('u6', { my_practice: 'green', coven_paths_count_me: false })]);
  assert.deepEqual(o, { enough: false, members: 6, shared: 4 });
  assert.equal(o.shared < MIN_SHARED, true);
  assert.match(sharedLine(o), /Not enough yet/);
});

test('sums up practices, paths and deities as the database does, never who', () => {
  const hekate = { key: 'hekate', name: 'Hekate' };
  const o = aggregatePaths([
    member('u1', { my_practice: 'green,hedge', library_path_mode: 'custom', library_path: 'hellenic,norse', my_deities: deities([{ ...hekate, level: 'patron' }, { key: 'brigid', name: 'Brigid', level: 'dedicated' }]) }),
    member('u2', { my_practice: 'green', library_path_mode: 'custom', library_path: 'hellenic', my_deities: deities([{ ...hekate, level: 'patron' }]) }),
    member('u3', { my_practice: 'green, kitchen', calendar_traditions: 'wheel,hellenic_monthly', my_deities: deities([{ ...hekate, level: 'dedicated' }]) }),
    member('u4', { my_practice: 'kitchen,green', calendar_traditions: 'celtic,christian', calendar_hidden_traditions: 'christian', my_deities: deities([{ ...hekate, level: 'patron' }, { name: 'The Green Man ' }]) }),
    member('u5', { my_practice: 'sea', library_path_mode: 'off', calendar_traditions: 'norse', my_deities: deities([{ name: 'the green man' }, { key: null, name: 'Grandmother Oak' }]) }),
    member('u6', { my_deities: 'not json', my_practice: 'unknown' }),
    member('u7', { my_practice: 'green', my_deities: deities([{ name: 'The Green Man', level: 'dedicated' }]), coven_paths_count_me: false }),
    member('u8', null),
  ]);
  assert.equal(o.enough, true);
  assert.equal(o.members, 8);
  assert.equal(o.shared, 5);
  // How they practise: 5 shared; Green 4 (80%); Kitchen 2 and Hedge 1 and Sea 1 fold into Other (u1, u3, u4, u5).
  assert.deepEqual(o.practices, { shared: 5, items: [{ key: 'green', name: 'Green', count: 4, pct: 80 }], other: { count: 4, pct: 80 } });
  // Paths: u1 hellenic+norse, u2 hellenic, u3 hellenic (from the Hellenic months), u4 celtic (Christian hidden); u5's path is off.
  assert.deepEqual(o.paths, { shared: 4, items: [{ key: 'hellenic', name: 'Hellenic', count: 3, pct: 75 }], other: { count: 2, pct: 50 } });
  // Deities: 5 keep them; Hekate patron to 3, dedicated to 1, honoured by 4. The Green Man (named in their own words) by 2.
  assert.deepEqual(o.patrons, { shared: 5, items: [{ key: 'hekate', name: 'Hekate', count: 3, pct: 60 }], other: { count: 0, pct: 0 } });
  assert.deepEqual(o.dedicated, { shared: 5, items: [], other: { count: 2, pct: 40 } });
  assert.deepEqual(o.deities, { shared: 5, items: [{ key: 'hekate', name: 'Hekate', count: 4, pct: 80 }], other: { count: 3, pct: 60 } });
  assert.equal(JSON.stringify(o).includes('u1'), false);
});

test('reads the database answer safely: names, order, and no small counts', () => {
  const o = readOverview({
    enough: true,
    members: 9,
    shared: 6,
    practices: { shared: 6, items: [{ key: 'kitchen', name: null, count: 3, pct: 50 }, { key: 'green', name: null, count: 5, pct: 83 }, { key: 'sea', count: 1 }], other: { count: 1, pct: 17 } },
    paths: { shared: 2, items: [{ key: 'norse', count: 2 }], other: { count: 0, pct: 0 } },
    deities: { shared: 6, items: [{ key: 'own:the morrigan', name: 'The Morrígan', count: 3, pct: 50 }], other: { count: 0, pct: 0 } },
  })!;
  assert.deepEqual(o.practices!.items.map((i) => [i.name, i.pct]), [['Green', 83], ['Kitchen & hearth', 50]]);
  assert.equal(o.practices!.other.count, 2);
  assert.deepEqual(o.paths, { shared: 2, items: [], other: { count: 0, pct: 0 } });
  assert.equal(sectionLine(o.paths!, 'paths'), 'Fewer than three have chosen their path yet.');
  assert.equal(sectionLine(o.deities!, 'deities'), 'Of the 6 who keep deities.');
  assert.equal(o.deities!.items[0].name, 'The Morrígan');
  assert.equal(o.patrons, undefined);
  assert.equal(readOverview({ enough: true, members: 9, shared: 3 })!.enough, false);
  assert.equal(readOverview(null), null);
  assert.equal(MIN_COUNT, 3);
});

test('the head, the record keepers, and everyone when the head shows it', () => {
  const base = { founder: false, site: false, member: true, record: { record_viewers: [] }, paths: { paths_visible_to_all: false }, membership: { status: 'active', rank_id: 'r1' }, userId: 'u2' };
  assert.equal(seesPaths(base), false);
  assert.equal(seesPaths({ ...base, founder: true }), true);
  assert.equal(seesPaths({ ...base, record: { record_viewers: [{ kind: 'rank', id: 'r1' }] } }), true);
  assert.equal(seesPaths({ ...base, paths: { paths_visible_to_all: true } }), true);
  assert.equal(seesPaths({ ...base, member: false, paths: { paths_visible_to_all: true } }), false);
});

test('the migration keeps the same rules and hands over only counts', () => {
  const sql = readFileSync(new URL('../../supabase/migrations/20261105000000_coven_paths_overview.sql', import.meta.url), 'utf8');
  assert.match(sql, /add column if not exists paths_visible_to_all boolean not null default false/);
  assert.match(sql, /function public\.coven_paths_overview\(p_coven uuid\)[\s\S]*security definer/);
  assert.match(sql, /if not public\.coven_sees_paths\(p_coven\)/);
  assert.match(sql, /public\.coven_sees_record\(p_coven\)/);
  assert.match(sql, /status = 'active'/);
  assert.match(sql, /'coven_paths_count_me'/);
  assert.match(sql, /if shared < 5 then/);
  assert.match(sql, /coalesce\(p_shared, 0\) < 3/);
  assert.match(sql, /where t\.c >= 3/);
  assert.match(sql, /where t\.c < 3/);
  assert.match(sql, /round\(t\.c \* 100\.0 \/ p_shared\)/);
  assert.match(sql, /Only the coven''s head chooses who sees the paths in the coven/);
  // The answer names no one: no user ids leave the overview.
  const answer = sql.slice(sql.indexOf('if shared < 5 then'));
  assert.doesNotMatch(answer, /'user_id'/);
  // Every practice and path the app offers is one the database counts.
  for (const id of ['eclectic', 'green', 'kitchen', 'hedge', 'solitary', 'cosmic', 'crystal', 'elemental', 'sea', 'folk', 'wicca', 'hellenic', 'anglo-saxon', 'chinese']) assert.match(sql, new RegExp(`'${id}'`));
});
