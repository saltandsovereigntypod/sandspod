// The website kept level with the app (October 2026): coven altars shared
// whole and live, coven conversations, the altar and chat powers, a ritual's
// altar, petitions' altars, and the site-wide welcome on Today.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
const L = require("../covens/coven-logic.js");
vm.runInThisContext(read("js/traditional-library.js"));
vm.runInThisContext(read("js/core/altar.js"));
vm.runInThisContext(read("js/core/covens.js"));
const SaltCore = global.SaltCore;

// ── A pretend Supabase client that records what it's asked ────────────────
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

// ── Position powers ─────────────────────────────────────────────────────────
const coven = { id: "c1", status: "active", founder_id: "founder" };
const perms = (userId, rank) => L.permissions({ coven, membership: { status: "active", rank_id: rank?.id || null }, ranks: rank ? [rank] : [], userId });

test("positions carry the app's altar and chat powers; starting altars and chat are on unless turned off", () => {
  const plain = perms("u1", { id: "r1", level: 1 });
  assert.equal(plain.startAltars, true);
  assert.equal(plain.chat, true);
  assert.equal(plain.tendAltars, false);
  assert.equal(plain.keepAltars, false);

  const quiet = perms("u1", { id: "r1", level: 1, can_chat: false, can_start_altars: false });
  assert.equal(quiet.chat, false);
  assert.equal(quiet.startAltars, false);
  assert.equal(perms("u1", { id: "r1", level: 1, can_chat: false, can_moderate: true }).chat, true, "moderators always talk");

  const keeper = perms("u1", { id: "r1", level: 3, can_keep_altars: true, can_start_altars: false });
  assert.equal(keeper.keepAltars, true);
  assert.equal(keeper.tendAltars, true);
  assert.equal(keeper.startAltars, true);
  assert.equal(perms("u1", { id: "r1", level: 2, can_tend_altars: true }).tendAltars, true);

  const founder = perms("founder", { id: "r1", level: 1, can_chat: false });
  assert.ok(founder.chat && founder.keepAltars && founder.startAltars);
  assert.deepEqual(L.rankPowers({ can_keep_altars: true }), ["keeps the coven’s altars"]);
  assert.deepEqual(L.rankPowers({ can_tend_altars: true }), ["tends the coven’s altars"]);
});

test("every power the app's positions carry can be set on the website, in the app's order", () => {
  const model = read("app/src/lib/covens/model.ts");
  const block = model.slice(model.indexOf("export const RANK_POWERS"));
  const appKeys = [...block.slice(0, block.indexOf("] as const")).matchAll(/key: '([a-z_]+)'/g)].map((m) => m[1]);
  assert.deepEqual(L.RANK_POWERS.map((p) => p.key), appKeys);
  // A new position starts as the database makes it: start altars and chat on.
  assert.equal(L.powerOn({}, L.RANK_POWERS.find((p) => p.key === "can_chat")), true);
  assert.equal(L.powerOn({ can_chat: false }, L.RANK_POWERS.find((p) => p.key === "can_chat")), false);
  assert.equal(L.powerOn({}, L.RANK_POWERS.find((p) => p.key === "can_keep_altars")), false);
  const manage = read("covens/coven/manage.js");
  assert.match(manage, /L\.RANK_POWERS\.map\(\(p\) => power\(p\)\)/, "the position form lists every power");
  assert.match(manage, /\.\.\.L\.RANK_POWERS\.map\(\(p\) => p\.key\)/, "and saves every power");
});

// ── Shared logic ────────────────────────────────────────────────────────────
test("the website's bundles carry the app's coven altar, ritual, petition and conversation logic", () => {
  for (const name of ["documentFromRows", "diff", "keyed", "sceneOf", "sortAltars", "tendedBy", "petitionOf", "sceneFromAltar"]) assert.equal(typeof SaltCore.altar.covenAltar[name], "function", name);
  assert.equal(typeof SaltCore.altar.ritualAltar.stepAltarChange, "function");
  assert.equal(typeof SaltCore.altar.petitionAltar.seedPetitionAltar, "function");
  const T = SaltCore.covens.thread;
  const conversation = { id: "k1", kind: "direct", name: null };
  const members = [{ conversation_id: "k1", user_id: "me" }, { conversation_id: "k1", user_id: "ana" }];
  assert.equal(T.conversationTitle(conversation, members, "me", (id) => (id === "ana" ? "Ana" : "?")), "Ana");
  assert.equal(T.conversationTitle({ ...conversation, kind: "group", name: "Circle" }, members, "me", () => ""), "Circle");
  assert.deepEqual(T.othersIn("k1", members, "me"), ["ana"]);
  const U = SaltCore.covens.unreadCount;
  const counts = U.countMessage({}, { coven_id: "c1", conversation_id: "k1", user_id: "ana", created_at: "2026-10-26T10:00:00Z" }, "me", {}, null);
  assert.equal(U.covenTotal(counts, "c1"), 1);
});

test("a ritual step's candle and a petition's altar change the coven altar's document as in the app", () => {
  const A = SaltCore.altar.covenAltar;
  const altar = { id: "a1", coven_id: "c1", name: "Ritual altar", is_main: true, edit_mode: "chosen", locked: false, background: "", background_name: "", groups: [], active_group_id: null, extra: {}, archived_at: null, created_at: "", updated_at: "" };
  const doc = A.documentFromRows(altar, []);
  const step = { altar_action: "light_candle", altar_color: "green", altar_form: "votive", altar_label: "", altar_image: "", title: "Light your candle" };
  const next = SaltCore.altar.ritualAltar.stepAltarChange(step, { title: "Full moon" }, "Ana", 0, "2026-10-26T20:00:00Z")(doc);
  assert.equal(next.objects.length, 1);
  assert.equal(next.objects[0].label, "Ana’s candle");
  const changes = A.diff(A.keyed(next), new Map(), JSON.stringify(A.sceneOf(doc)));
  assert.equal(changes.filter((c) => c.kind === "object").length, 1);
  const seeded = SaltCore.altar.petitionAltar.seedPetitionAltar({ id: "p1", title: "Healing", color: "blue", body: "" }, "2026-10-26T20:00:00Z")(doc);
  assert.ok(seeded.objects.length >= 2, "the petition's candle and its paper");
});

// ── Coven data: altars as rows, conversations, sending ─────────────────────
test("coven altars are written as the app writes them: the scene to coven_altars, each object to its own row", async () => {
  const altar = { id: "a1", coven_id: "c1", name: "Healing", is_main: false, edit_mode: "members", locked: false, background: "", background_name: "", groups: [], active_group_id: null, extra: {}, archived_at: null };
  const db = fakeDb({
    coven_altars: { data: altar, error: null },
    coven_altar_objects: (call) => (call.ops.some(([op]) => op === "select") ? { data: [{ altar_id: "a1", object_key: "o1", coven_id: "c1", position: 3, data: { altarObjectId: "o1", label: "Old candle" } }], error: null } : { data: null, error: null })
  });
  const D = loadCovenData(db);
  await D.changeAltarOnce("a1", (doc) => ({ ...doc, background: "/assets/altar/backgrounds/ocean.png", objects: [{ altarObjectId: "o2", label: "New candle" }] }));
  const writes = db.calls.filter((c) => c.ops?.some(([op]) => ["upsert", "delete", "update"].includes(op)));
  const upsert = writes.find((c) => c.ops.some(([op]) => op === "upsert"));
  const [, row, options] = upsert.ops.find(([op]) => op === "upsert");
  assert.deepEqual(row, { altar_id: "a1", object_key: "o2", coven_id: "c1", position: 4, data: { altarObjectId: "o2", label: "New candle" } });
  assert.deepEqual(options, { onConflict: "altar_id,object_key" });
  const removed = writes.find((c) => c.table === "coven_altar_objects" && c.ops.some(([op]) => op === "delete"));
  assert.deepEqual(removed.ops.filter(([op]) => op === "eq").map(([, k, v]) => [k, v]), [["altar_id", "a1"], ["object_key", "o1"]]);
  const scene = writes.find((c) => c.table === "coven_altars");
  assert.equal(scene.ops.find(([op]) => op === "update")[1].background, "/assets/altar/backgrounds/ocean.png");
});

test("messages go to the coven's chat or a conversation, and phones are told (coven-notify) as the app does", async () => {
  const db = fakeDb({ coven_messages: { data: { id: "m1", coven_id: "c1", conversation_id: "k1", body: "hello" }, error: null } });
  const D = loadCovenData(db);
  const sent = await D.send("c1", "hello", null, "k1");
  assert.equal(sent.id, "m1");
  const insert = db.calls.find((c) => c.table === "coven_messages").ops.find(([op]) => op === "insert")[1];
  assert.deepEqual(insert, { coven_id: "c1", conversation_id: "k1", body: "hello", reply_to: null });
  assert.deepEqual(db.calls.find((c) => c.invoke), { invoke: "coven-notify", options: { body: { message_id: "m1" } } });
  await D.openDirect("c1", "u2");
  await D.createGroup("c1", "Circle", ["u2", "u3"]);
  await D.markConversationRead("k1");
  assert.deepEqual(db.calls.filter((c) => c.rpc).map((c) => c.rpc), ["coven_open_direct", "coven_create_group", "coven_set_conversation"]);
  assert.deepEqual(db.calls.find((c) => c.rpc === "coven_set_conversation").args, { p_conversation: "k1", p_muted: null, p_read: true });
});

test("the coven page has Messages and Altars, and its live channel carries conversations and the new altars", () => {
  const coven = read("covens/coven/coven.js");
  assert.match(coven, /key: "gathering", label: "Messages"/);
  assert.match(coven, /key: "altar", label: "Altars"/);
  assert.match(coven, /CovenChat\?\.prime\?\.\(state\)/);
  const data = read("covens/coven-data.js");
  assert.match(data, /table: "coven_altar_objects", filter: `coven_id=eq\.\$\{covenId\}`/);
  assert.doesNotMatch(data, /coven_altar_items/, "the earlier single altar is gone from the website");
  assert.doesNotMatch(read("covens/coven/rituals.js"), /altarItems/);
  assert.match(read("covens/coven/petitions.js"), /seedPetitionAltar/);
  assert.match(read("covens/coven/petitions.js"), /tendWithSeed/, "tending sets the candle in the tender’s name (petitionAltar.ts tendWithSeed, which also sets out a bare altar)");
  assert.match(read("covens/coven/rituals.js"), /stepAltarChange/);
  assert.match(read("covens/coven/rituals.js"), /setRitualAltar/);
});

// ── The altar page as a coven altar ───────────────────────────────────────
test("the altar page opens a coven altar after the app bridge, and leaves your own working altar alone otherwise", () => {
  const html = read("altar/index.html");
  const at = (src) => html.indexOf(`src="${src}"`);
  assert.ok(at("js/features/coven-altar.js") > at("js/features/app-altar-bridge.js"));
  assert.ok(at("js/features/coven-altar.js") > at("js/core/storage.js"));
  assert.ok(at("js/features/coven-altar.js") > at("../js/core/altar.js"));

  const run = (search) => {
    const listeners = [];
    const sandbox = {
      location: { search, href: `https://example.test/altar/${search}` },
      document: { readyState: "loading", body: { classList: { add() {}, toggle() {} } }, addEventListener: (...a) => listeners.push(a), querySelector: () => null },
      addEventListener: (...a) => listeners.push(a),
      setTimeout,
      clearTimeout,
      URLSearchParams,
      restoreWorkingAltarDraft: "original",
      persistWorkingAltarDraft: "original"
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(read("altar/js/features/coven-altar.js"), sandbox);
    return sandbox;
  };
  const own = run("");
  assert.equal(own.restoreWorkingAltarDraft, "original");
  assert.equal(own.CovenAltarPage, undefined);

  const shared = run("?covenAltar=0f8fad5b-d9cb-469f-a165-70867728950e&c=moon-circle");
  assert.equal(typeof shared.restoreWorkingAltarDraft, "function");
  assert.notEqual(shared.persistWorkingAltarDraft, "original", "drafts go to the coven, not your working altar");
  const P = shared.CovenAltarPage;
  assert.equal(P.slug, "moon-circle");
  // Positions are compared to five places, so a picture redrawn on another screen isn't a change.
  const a = P.norm({ altarObjectId: "o1", leftPercent: 0.123456789, topPercent: 0.5, sizePercent: 0.08 });
  assert.equal(a.leftPercent, 0.12346);
  const known = new Map([["o1", JSON.stringify(a)], ["o2", "{}"]]);
  const scene = { background: "", backgroundName: "", groups: [], activeGroupId: null, extra: {} };
  const changes = P.changesFrom({ ...scene, objects: [P.norm({ altarObjectId: "o1", leftPercent: 0.1234561, topPercent: 0.5, sizePercent: 0.08 }), { altarObjectId: "o3" }] }, known, JSON.stringify(scene));
  assert.equal(JSON.stringify(changes.map((c) => [c.key, c.data == null])), JSON.stringify([["o3", false], ["o2", true]]));
});

// ── The welcome ─────────────────────────────────────────────────────────────
test("the website's welcome has a page for each page of the app's tour, in the same order", () => {
  const W = require("../js/welcome-discovery.js");
  const tour = read("app/src/lib/welcomeTour.ts");
  const appTitles = [...tour.matchAll(/title: '([^']+)'/g)].map((m) => m[1].replace(/’/g, "’"));
  const webTitles = W.GUIDES.welcome.steps.map(([title]) => title);
  assert.deepEqual(webTitles, appTitles);
  for (const [, body] of W.GUIDES.welcome.steps) {
    assert.doesNotMatch(body, /\b(tap|phone|widget|swipe)\b/i, "written for the website");
    assert.doesNotMatch(body, /!/);
  }
  assert.match(tour, /TOUR_SEEN_KEY = 'welcome\.tour\.v2'/, "bump the website's welcome version with the app's");
  assert.equal(W.GUIDE_VERSIONS.welcome, "2");
});

test("the welcome opens once on Today, survives blocked storage, and can be watched again from How to", () => {
  const W = require("../js/welcome-discovery.js");
  const values = new Map();
  const storage = { getItem: (k) => (values.has(k) ? values.get(k) : null), setItem: (k, v) => values.set(k, String(v)), removeItem: (k) => values.delete(k) };
  assert.equal(W.shouldOpenWelcome(storage, ""), true);
  W.completeGuide(storage, "welcome");
  assert.equal(W.shouldOpenWelcome(storage, ""), false);
  assert.equal(W.shouldOpenWelcome(storage, "?welcome=1"), true);
  assert.equal(W.isGuideComplete(storage, "altar"), false, "each guide is its own");

  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(W.isGuideComplete(blocked, "welcome"), false);
  assert.equal(W.completeGuide(blocked, "welcome"), true);

  const today = read("today/index.html");
  assert.match(today, /data-welcome-tour/);
  assert.match(today, /<script src="\/js\/welcome-discovery\.js"><\/script>/);
  assert.match(read("help/help.js"), /href="\/today\/\?welcome=1"/);
  const notes = require("../help/web-notes.js");
  assert.match(notes.TOPIC_NOTES["replay-welcome-tour"], /Watch the welcome again/);
  for (const id of ["covens-altars", "covens-chat"]) assert.ok(notes.TOPIC_NOTES[id], id);
});

test("the Altar and Book of Shadows guides know the drawers, workings, dreams and the app", () => {
  const W = require("../js/welcome-discovery.js");
  const altar = W.GUIDES.altar.steps.map((s) => s.join(" ")).join(" ");
  for (const word of ["Seasonal drawer", "potted plants", "offerings", "spell jar", "tonight’s altar", "did it work", "Coven → Altars"]) assert.ok(altar.toLowerCase().includes(word.toLowerCase()), word);
  const book = W.GUIDES.grimoire.steps.map((s) => s.join(" ")).join(" ");
  for (const word of ["dreams", "ogham", "Practice → Rituals", "app"]) assert.ok(book.includes(word), word);
});
