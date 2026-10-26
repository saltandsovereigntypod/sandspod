// Coven requests on the website, level with the app: applying, asking to
// advance and deciding tell phones through coven-notify (as the app does),
// reviewers see what's waiting (never their own) on the coven's Review tab
// and their covens list, and the Reminders page keeps the same synced choice.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
global.CovenLogic = require("../covens/coven-logic.js");
vm.runInThisContext(read("js/core/covens.js"));
vm.runInThisContext(read("js/core/guides.js"));
const R = global.SaltCore.covens.requests;
const P = global.SaltCore.guides.reminderPrefs;

// A pretend Supabase client that records what it's asked.
function fakeDb(answers = {}) {
  const calls = [];
  const builder = (table) => {
    const call = { table, ops: [] };
    calls.push(call);
    const chain = new Proxy(
      {},
      {
        get(_, name) {
          if (name === "then") {
            const result = typeof answers[table] === "function" ? answers[table](call) : answers[table] ?? { data: [], error: null };
            return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
          }
          return (...args) => {
            call.ops.push([name, ...args]);
            return chain;
          };
        }
      }
    );
    return chain;
  };
  return {
    calls,
    from: builder,
    rpc: (name, args) => {
      calls.push({ rpc: name, args });
      return Promise.resolve(answers[`rpc:${name}`] ?? { data: null, error: null });
    },
    functions: {
      invoke: (name, options) => {
        calls.push({ invoke: name, options });
        return Promise.resolve({ data: null, error: null });
      }
    }
  };
}

function loadCovenData(db) {
  global.db = db;
  delete global.CovenData;
  vm.runInThisContext(read("covens/coven-data.js"));
  return global.CovenData;
}

test("applying, asking to advance and deciding tell phones (coven-notify) with the request's id, as the app does", async () => {
  const db = fakeDb({
    "rpc:apply_to_coven": { data: { id: "app1" }, error: null },
    "rpc:request_coven_advancement": { data: { id: "adv1" }, error: null },
    "rpc:decide_coven_application": { data: { id: "app1", status: "declined" }, error: null },
    "rpc:decide_coven_advancement": { data: { id: "adv1", status: "approved" }, error: null }
  });
  const D = loadCovenData(db);
  assert.equal((await D.apply("c1", {}, "hello")).id, "app1");
  await D.requestAdvancement("c1", "r1", "ready");
  await D.decideApplication("app1", false, "not yet");
  await D.decideAdvancement("adv1", true, "");
  assert.deepEqual(
    db.calls.filter((c) => c.invoke).map((c) => [c.invoke, c.options.body]),
    [
      ["coven-notify", { application_id: "app1" }],
      ["coven-notify", { advancement_id: "adv1" }],
      ["coven-notify", { application_id: "app1" }],
      ["coven-notify", { advancement_id: "adv1" }]
    ]
  );
  // The app makes the very same calls.
  const api = read("app/src/lib/covens/api.ts");
  assert.match(api, /application_id: id/);
  assert.match(api, /advancement_id: id/);
  for (const name of ["apply_to_coven", "request_coven_advancement", "decide_coven_application", "decide_coven_advancement"]) assert.match(api, new RegExp(`andNotify\\('(application|advancement)', rpc\\('${name}'`), name);
});

test("a failed request rings no one", async () => {
  const db = fakeDb({ "rpc:apply_to_coven": { data: null, error: { message: "The coven is full." } } });
  const D = loadCovenData(db);
  await assert.rejects(D.apply("c1", {}, ""));
  assert.equal(db.calls.filter((c) => c.invoke).length, 0);
});

test("reviewers' counts: only covens they review, never their own request", async () => {
  const ranks = [
    { id: "r-member", coven_id: "c1", level: 1 },
    { id: "r-elder", coven_id: "c2", level: 5, can_review: true }
  ];
  const db = fakeDb({
    coven_members: {
      data: [
        { coven_id: "c1", user_id: "me", status: "active", rank_id: "r-member", covens: { id: "c1", status: "active", founder_id: "someone" } },
        { coven_id: "c2", user_id: "me", status: "active", rank_id: "r-elder", covens: { id: "c2", status: "active", founder_id: "someone" } }
      ],
      error: null
    },
    coven_ranks: { data: ranks, error: null },
    coven_applications: { data: [{ coven_id: "c2", user_id: "a" }, { coven_id: "c2", user_id: "b" }], error: null },
    coven_advancement_requests: { data: [{ coven_id: "c2", user_id: "me" }, { coven_id: "c2", user_id: "c" }], error: null }
  });
  const D = loadCovenData(db);
  const counts = await D.pendingForReview("me");
  assert.deepEqual(counts, { c2: { applications: 2, advancements: 1 } });
  const asked = db.calls.find((c) => c.table === "coven_applications");
  assert.deepEqual(asked.ops.find(([op]) => op === "in"), ["in", "coven_id", ["c2"]], "only covens they review are read");
  assert.equal(R.pendingIn(counts), 3);
  assert.equal(R.pendingLabel(counts.c2), "2 applications and a request to advance waiting");
});

test("the coven page's Review tab and the covens list show what's waiting, kept current while open", () => {
  const coven = read("covens/coven/coven.js");
  assert.match(coven, /R\.countPending\(apps, advs, \[coven\.id\], me\)/);
  assert.match(coven, /watchPending\(\)/);
  assert.match(coven, /D\.watchRequests/);
  const directory = read("covens/directory.js");
  assert.match(directory, /D\.pendingForReview/);
  assert.match(directory, /cv-count--row/);
  assert.match(read("covens/index.html"), /<script src="\/js\/core\/covens\.js"><\/script>\s*<script src="\/covens\/directory\.js">/);
  const manage = read("covens/coven/manage.js");
  assert.match(manage, /requestsWanted/);
  assert.match(manage, /\/reminders\/#gd-requests/);
});

test("the Reminders page keeps the same coven requests choice as the app", () => {
  const page = read("reminders/reminders.js");
  for (const key of ['"requests.on"', '"requests.answers"', "data-req-coven=", 'id="gd-requests"', "P.setRequestsFor("]) assert.ok(page.includes(key), key);
  const app = read("app/src/components/reminders/MoreSections.tsx");
  for (const key of ["'requests.on'", "'requests.answers'", "setRequestsFor("]) assert.ok(app.includes(key), key);
  // The website's bundle saves and reads it exactly as the app does.
  const prefs = P.setRequestsFor(P.normalizePrefs({}), "c1", false);
  const saved = P.prefsValue(prefs);
  assert.deepEqual(JSON.parse(saved).requests, { on: true, off: ["c1"], answers: true });
  assert.equal(P.requestsOn(P.normalizePrefs(JSON.parse(saved)), "c1"), false);
  assert.equal(R.requestsWanted(saved, "c1"), false);
  assert.equal(R.requestsWanted(saved, "c2"), true);
  assert.equal(R.requestsWanted("", "c1"), true, "nothing saved: on");
});

test("the edge function checks who may ring, once, and reads the same choices", () => {
  const fn = read("supabase/functions/coven-notify/index.ts");
  assert.match(fn, /r\.status === "pending" && r\.user_id === caller/, "only the one who asked rings for a new request");
  assert.match(fn, /r\.reviewer_id === caller && r\.user_id !== caller/, "only the reviewer who decided rings the answer");
  assert.match(fn, /filter\(\(u\) => u !== r\.user_id\)/, "never the one who asked");
  assert.match(fn, /coven_request_notices/, "once each");
  assert.match(fn, /wantsNotice\(/);
  assert.match(fn, /user_blocks/);
  assert.match(fn, /channelId: "coven-requests"/);
  assert.match(read("app/src/lib/covens/push.ts"), /REQUEST_CHANNEL[\s\S]*setNotificationChannelAsync\(REQUEST_CHANNEL/);
});
