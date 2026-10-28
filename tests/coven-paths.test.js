// Paths in the coven on the website, level with the app: the app's own rules
// (lib/covens/paths.ts, through js/core/covens.js), the same database calls,
// the tab, the opt-out in Settings, and a migration that keeps the same rules
// and hands over only counts.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/covens.js"));
const P = global.SaltCore.covens.paths;

const deities = (list) => JSON.stringify(list.map((d) => ({ key: d.key || null, name: d.name, level: d.level || "exploring", since: "" })));

test("the website folds rare answers into Other and rounds as the database does", () => {
  assert.equal(P.MIN_SHARED, 5);
  assert.equal(P.MIN_COUNT, 3);
  assert.equal(P.percent(1, 8), 13);
  assert.equal(P.percent(3, 40), 8);
  const rows = [
    ...["u1", "u2", "u3"].map((user) => ({ user, key: "hekate", name: "Hekate" })),
    { user: "u4", key: "brigid", name: "Brigid" },
    { user: "u4", key: "own:the green man", name: "The Green Man" }
  ];
  const s = P.section(rows, 4);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), { shared: 4, items: [{ key: "hekate", name: "Hekate", count: 3, pct: 75 }], other: { count: 1, pct: 25 } });
  assert.deepEqual(P.sectionBars(s).map((b) => b.name), ["Hekate", "Other (fewer than 3)"]);
  assert.deepEqual(JSON.parse(JSON.stringify(P.section(rows, 2))), { shared: 2, items: [], other: { count: 0, pct: 0 } });
});

test("the website sums up a coven as the app and the database do, never who", () => {
  const people = [
    { user: "u1", settings: { my_practice: "green", library_path_mode: "custom", library_path: "hellenic", my_deities: deities([{ key: "hekate", name: "Hekate", level: "patron" }]) } },
    { user: "u2", settings: { my_practice: "green", calendar_traditions: "hellenic_monthly", my_deities: deities([{ key: "hekate", name: "Hekate", level: "patron" }]) } },
    { user: "u3", settings: { my_practice: "green,sea", library_path_mode: "custom", library_path: "hellenic,wicca", my_deities: deities([{ key: "hekate", name: "Hekate", level: "dedicated" }]) } },
    { user: "u4", settings: { my_practice: "kitchen", my_deities: deities([{ key: "hekate", name: "Hekate", level: "patron" }]) } },
    { user: "u5", settings: { my_practice: "green", library_path_mode: "off", library_path: "norse" } },
    { user: "u6", settings: { my_practice: "green", coven_paths_count_me: false } }
  ];
  const o = JSON.parse(JSON.stringify(P.aggregatePaths(people)));
  assert.equal(o.enough, true);
  assert.equal(o.shared, 5);
  assert.deepEqual(o.practices.items, [{ key: "green", name: "Green", count: 4, pct: 80 }]);
  assert.deepEqual(o.practices.other, { count: 2, pct: 40 });
  assert.deepEqual(o.paths.items, [{ key: "hellenic", name: "Hellenic", count: 3, pct: 100 }]);
  assert.deepEqual(o.patrons.items, [{ key: "hekate", name: "Hekate", count: 3, pct: 75 }]);
  assert.deepEqual(o.deities.items, [{ key: "hekate", name: "Hekate", count: 4, pct: 100 }]);
  assert.equal(JSON.stringify(o).includes("u1"), false);
  // Four sharing is not enough yet.
  assert.deepEqual(JSON.parse(JSON.stringify(P.aggregatePaths(people.slice(0, 4)))), { enough: false, members: 4, shared: 4 });
});

test("the website asks the database with the app's calls, and shows the tab to those it's for", async () => {
  const calls = [];
  global.db = { rpc: (name, args) => (calls.push([name, args]), Promise.resolve({ data: { enough: false, members: 3, shared: 1 }, error: null })) };
  delete global.CovenData;
  vm.runInThisContext(read("covens/coven-data.js"));
  const D = global.CovenData;
  await D.pathsOverview("c1");
  await D.setPathsVisible("c1", true);
  assert.deepEqual(calls, [
    ["coven_paths_overview", { p_coven: "c1" }],
    ["set_coven_paths_visible", { p_coven: "c1", p_visible: true }]
  ]);
  const api = read("app/src/lib/covens/api.ts");
  for (const [name] of calls) assert.ok(api.includes(`'${name}'`), name);
  assert.ok(api.includes("'coven_id,paths_visible_to_all'"));
  assert.match(read("covens/coven-data.js"), /select\("coven_id,paths_visible_to_all"\)/);

  const page = read("covens/coven/index.html");
  assert.ok(page.indexOf('"/covens/coven-data.js"') < page.indexOf('"/covens/coven/paths.js"'));
  assert.ok(page.indexOf('"/covens/coven/paths.js"') < page.indexOf('"/covens/coven/coven.js"'));
  const coven = read("covens/coven/coven.js");
  assert.match(coven, /key: "paths", label: "Paths in the coven"/);
  assert.match(coven, /paths: \(\) => mount\(global\.CovenPaths\)/);
  // Manage holds settings only; Paths in the coven is its own tab, not repeated there.
  assert.doesNotMatch(read("covens/coven/manage.js"), /data-tab="paths"/);

  const base = { founder: false, site: false, member: true, record: { record_viewers: [] }, paths: { paths_visible_to_all: false }, membership: { status: "active", rank_id: "r1" }, userId: "u2" };
  assert.equal(P.seesPaths(base), false);
  assert.equal(P.seesPaths({ ...base, founder: true }), true);
  assert.equal(P.seesPaths({ ...base, paths: { paths_visible_to_all: true } }), true);
  assert.equal(P.seesPaths({ ...base, record: { record_viewers: [{ kind: "user", id: "u2" }] } }), true);
});

test("members can leave themselves out, in Settings as in the app, and the guidelines say so", () => {
  const more = read("js/settings-more.js");
  assert.match(more, /COVEN_PATHS_KEY = "coven_paths_count_me"/);
  assert.match(more, /Count me in my covens’ paths overview/);
  assert.match(read("app/src/app/(tabs)/more/settings/covens.tsx"), /Count me in my covens’ paths overview/);
  assert.equal(P.COUNT_ME_KEY, "coven_paths_count_me");
  assert.equal(P.countsMe({ coven_paths_count_me: false }), false);
  assert.equal(P.countsMe({}), true);
  assert.match(read("covens/guidelines/index.html"), /Count me in my covens’ paths overview/);
});

test("the migration counts only, checks who is asking, and keeps the same thresholds", () => {
  const sql = read("supabase/migrations/20261105000000_coven_paths_overview.sql");
  for (const fn of ["coven_paths_overview", "coven_sees_paths", "set_coven_paths_visible", "coven_paths_section"]) {
    assert.match(sql, new RegExp(`create or replace function public\\.${fn}\\(`), fn);
  }
  assert.match(sql, /if not public\.coven_sees_paths\(p_coven\) then/);
  assert.match(sql, /if shared < 5 then/);
  assert.match(sql, /where t\.c >= 3/);
  assert.doesNotMatch(sql.slice(sql.indexOf("if shared < 5 then")), /'user_id'/, "no user ids in the answer");
  assert.match(sql, /grant execute on function[\s\S]*public\.coven_paths_overview\(uuid\)[\s\S]*to authenticated/);
  assert.match(sql, /revoke execute on function[\s\S]*public\.coven_paths_section\(jsonb, integer\)[\s\S]*from public, anon, authenticated/);
});
