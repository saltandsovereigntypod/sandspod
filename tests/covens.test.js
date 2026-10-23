const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const L = require("../covens/coven-logic.js");
const root = path.join(__dirname, "..");
const migration = fs.readFileSync(path.join(root, "supabase/migrations/20261023000000_covens.sql"), "utf8");

global.window = global;
require("../js/altar-artwork.js");
const ART = global.AltarArtwork;

// The picture rule the database enforces on coven_altar_items.image.
const imageRule = (() => {
  const match = /image ~ '([^']+)' and image !~ '([^']+)'/.exec(migration);
  assert.ok(match, "the migration keeps its altar picture rule");
  const allowed = new RegExp(match[1]);
  const forbidden = new RegExp(match[2]);
  return (image) => allowed.test(image) && !forbidden.test(image);
})();

const ranks = [
  { id: "seeker", level: 1, is_default: true },
  { id: "dedicant", level: 2, open_to_applications: true },
  { id: "elder", level: 4, can_review: true, can_moderate: true, open_to_applications: true },
  { id: "hp", level: 5, can_manage: true, can_review: true, can_moderate: true }
];
const coven = { id: "c1", status: "active", founder_id: "founder" };
const perms = (userId, rankId, extra = {}) => L.permissions({ coven, membership: rankId ? { status: "active", rank_id: rankId, ...extra } : null, ranks, userId });

test("coven addresses come from their names", () => {
  assert.equal(L.slugify("The Thistle & Moon Circle"), "the-thistle-and-moon-circle");
  assert.equal(L.slugify("  Café   Noir!! "), "cafe-noir");
  assert.equal(L.slugify("x".repeat(80)).length, 60);
  assert.deepEqual(L.validateCoven({ name: "Moon Circle", slug: "moon-circle", joining: "open", visibility: "listed" }), []);
  assert.equal(L.validateCoven({ name: "Mo", slug: "Bad Slug" }).length, 2);
});

test("tags are trimmed, de-duplicated and capped at twelve", () => {
  assert.deepEqual(L.parseTags(" moon work, Moon Work ,beginners,, "), ["moon work", "beginners"]);
  assert.equal(L.parseTags(Array.from({ length: 20 }, (_, i) => `t${i}`)).length, 12);
});

test("application questions keep stable ids and required answers are checked", () => {
  const questions = L.normalizeQuestions([{ prompt: "Why join?", required: true }, { prompt: "Why join?" }, { prompt: "  " }, { id: "path", prompt: "Your path" }]);
  assert.deepEqual(questions.map((q) => q.id), ["q-why-join", "q-why-join-2", "path"]);
  assert.deepEqual(L.missingAnswers(questions, { "q-why-join": "  " }).map((q) => q.id), ["q-why-join"]);
  assert.deepEqual(L.missingAnswers(questions, { "q-why-join": "To learn" }), []);
});

test("only the current version of an agreement counts as signed", () => {
  const docs = [
    { id: "a", kind: "agreement", requires_signature: true, published: true, version: 2, title: "Member agreement" },
    { id: "r", kind: "rules", requires_signature: false, published: true, version: 1, title: "Rules" },
    { id: "d", kind: "agreement", requires_signature: true, published: false, version: 1, title: "Draft" }
  ];
  assert.deepEqual(L.unsignedAgreements(docs, [{ document_id: "a", version: 1, user_id: "u" }], "u").map((d) => d.id), ["a"]);
  assert.deepEqual(L.unsignedAgreements(docs, [{ document_id: "a", version: 2, user_id: "u" }], "u"), []);
  assert.deepEqual(L.unsignedAgreements(docs, [{ document_id: "a", version: 2, user_id: "someone-else" }], "u").map((d) => d.id), ["a"]);
  assert.deepEqual(L.orderDocuments(docs).map((d) => d.kind), ["rules", "agreement", "agreement"]);
});

test("permissions follow the coven's ranks, and the founder can do everything", () => {
  const founder = perms("founder", "seeker");
  assert.ok(founder.founder && founder.manage && founder.review && founder.moderate);
  assert.equal(founder.level, 1000);
  const elder = perms("u", "elder");
  assert.ok(elder.review && elder.moderate && !elder.manage);
  const seeker = perms("u", "seeker");
  assert.ok(seeker.member && !seeker.review && !seeker.moderate);
  assert.equal(perms("u", null).member, false);
  const paused = L.permissions({ coven: { ...coven, status: "suspended" }, membership: { status: "active", rank_id: "hp" }, ranks, userId: "u" });
  assert.ok(paused.member && !paused.manage, "a paused coven can be read but not run");
});

test("good standing needs membership, signed agreements and no pause", () => {
  assert.equal(L.standing(perms("u", "seeker"), [], false).ok, true);
  assert.equal(L.standing(perms("u", "seeker"), [{ id: "a" }], false).ok, false);
  assert.equal(L.standing(perms("u", "seeker", { muted_until: new Date(Date.now() + 60000).toISOString() }), [], false).ok, false);
  assert.equal(L.standing(perms("u", "seeker", { muted_until: new Date(Date.now() - 60000).toISOString() }), [], false).ok, true);
  assert.equal(L.standing(perms("u", "seeker"), [], true).ok, false);
  assert.equal(L.standing(perms("u", null), [], false).ok, false);
});

test("reviewers grant only junior positions without powers; leaders up to their own", () => {
  assert.deepEqual(L.grantableRanks(ranks, perms("u", "elder")).map((r) => r.id), ["seeker", "dedicant"]);
  assert.deepEqual(L.grantableRanks(ranks, perms("u", "hp")).map((r) => r.id), ["seeker", "dedicant", "elder", "hp"]);
  assert.deepEqual(L.grantableRanks(ranks, perms("u", "seeker")), []);
  assert.deepEqual(L.advancementOptions(ranks, perms("u", "seeker")).map((r) => r.id), ["dedicant", "elder"]);
  assert.deepEqual(L.advancementOptions(ranks, perms("u", "elder")), []);
});

test("the directory searches names, paths and tags", () => {
  const list = [
    { name: "Moon Circle", tradition: "Hedge", tags: ["beginners"], joining: "open" },
    { name: "Owl House", tradition: "Hellenic", tags: [], joining: "application" }
  ];
  assert.deepEqual(L.filterDirectory(list, { query: "hedge beginners" }).map((c) => c.name), ["Moon Circle"]);
  assert.deepEqual(L.filterDirectory(list, { joining: "application" }).map((c) => c.name), ["Owl House"]);
  assert.equal(L.filterDirectory(list, {}).length, 2);
});

test("candles burn down over the time they were given", () => {
  const litAt = new Date("2026-10-23T20:00:00Z").getTime();
  const candle = { kind: "candle", lit: true, lit_at: new Date(litAt).toISOString(), burn_minutes: 60 };
  assert.deepEqual(L.candleState(candle, litAt + 30 * 60000), { lit: true, burntOut: false, remaining: 0.5, minutesLeft: 30 });
  assert.equal(L.candleState(candle, litAt + 61 * 60000).burntOut, true);
  assert.equal(L.candleState({ ...candle, lit: false }, litAt).lit, false);
  assert.equal(L.candleState({ kind: "object", lit: true, lit_at: candle.lit_at }, litAt).lit, false);
});

test("every candle and cabinet picture the altar offers exists and passes the database's rule", () => {
  const images = [];
  for (const color of L.CANDLE_COLORS) for (const form of L.CANDLE_FORMS) images.push(L.candleImage(color, form.id));
  for (const shelf of ["herbs", "crystals", "deities", "tools", "vessels"]) for (const item of ART.items[shelf]) for (const form of item.forms.filter((f) => f.image)) images.push(L.sitePath(form.image));
  assert.ok(images.length > 300);
  for (const image of images) {
    assert.ok(imageRule(image), `${image} passes the database rule`);
    assert.ok(fs.existsSync(path.join(root, image)), `${image} exists`);
  }
  assert.equal(imageRule("https://example.com/x.png"), false);
  assert.equal(imageRule("/assets/altar/../../secret.png"), false);
  for (const background of ART.backgrounds) assert.ok(/^[a-z0-9-]{1,60}$/.test(background.id), background.id);
});

test("flames sit on each candle form's wick", () => {
  assert.deepEqual(L.candleWick(L.candleImage("red", "vigil")), [0.508, 0.0534]);
  for (const form of L.CANDLE_FORMS.filter((f) => f.id !== "vigil")) assert.deepEqual(L.candleWick(L.candleImage("red", form.id)), ART.candleWicks[form.id] || form.wick, form.id);
});

test("live changes insert, update and delete by id", () => {
  let list = [{ id: "1", body: "a" }];
  list = L.applyChange(list, { eventType: "INSERT", new: { id: "2", body: "b" } });
  list = L.applyChange(list, { eventType: "UPDATE", new: { id: "1", body: "a2" } });
  assert.deepEqual(list, [{ id: "1", body: "a2" }, { id: "2", body: "b" }]);
  assert.deepEqual(L.applyChange(list, { eventType: "DELETE", new: {}, old: { id: "1" } }), [{ id: "2", body: "b" }]);
  assert.deepEqual(L.applyChange(list, { eventType: "DELETE", new: {}, old: { id: "nope" } }), list);
});

test("the chat hides blocked people and marks each new day", () => {
  const messages = [
    { id: "2", user_id: "b", created_at: "2026-10-23T09:00:00Z" },
    { id: "1", user_id: "a", created_at: "2026-10-22T09:00:00Z" },
    { id: "3", user_id: "a", created_at: "2026-10-23T10:00:00Z" }
  ];
  const timeline = L.chatTimeline(messages, ["b"], "en-US");
  assert.deepEqual(timeline.map((e) => e.type), ["day", "message", "day", "message", "message"]);
  assert.deepEqual(timeline.filter((e) => e.type === "message").map((e) => [e.message.id, e.hidden]), [["1", false], ["2", true], ["3", false]]);
});

test("database refusals read as plain words", () => {
  assert.equal(L.errorMessage({ message: 'new row violates row-level security policy for table "coven_messages"' }), "You don’t have permission to do that here.");
  assert.equal(L.errorMessage({ message: "Please sign the coven's agreements first." }), "Please sign the coven's agreements first.");
  assert.equal(L.errorMessage(new TypeError("Failed to fetch")), "You seem to be offline. Please try again.");
});

test("the migration keeps covens' safety rules", () => {
  for (const table of ["covens", "coven_ranks", "coven_members", "coven_documents", "coven_signatures", "coven_applications", "coven_advancement_requests", "coven_messages", "coven_altar_items", "coven_reports", "coven_profiles", "community_bans", "user_blocks"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`), table);
  }
  assert.match(migration, /role in \('admin', 'moderator'\)/, "site moderators are admins and moderators");
  assert.match(migration, /age_confirmed_at timestamptz not null/, "profiles record the 18+ confirmation");
  assert.match(migration, /add table public\.coven_messages/);
  assert.match(migration, /add table public\.coven_altar_items/);
  // Guard triggers must run as the caller so they can tell browser writes from the functions'.
  for (const fn of ["guard_coven_update", "guard_coven_document", "fill_coven_signature", "guard_coven_message", "guard_coven_altar_item", "fill_coven_report"]) {
    const body = migration.slice(migration.indexOf(`function public.${fn}()`)).split("$$")[0];
    assert.ok(!/security definer/.test(body), `${fn} is not a security definer`);
  }
});

test("coven pages load their scripts in order", () => {
  const order = ["/js/supabase-config.js", "/js/auth.js", "/js/salt-store.js", "/js/guides-ui.js", "/covens/coven-logic.js", "/covens/coven-data.js", "/covens/coven-ui.js"];
  for (const page of ["covens/index.html", "covens/new/index.html", "covens/coven/index.html", "covens/moderation/index.html"]) {
    const html = fs.readFileSync(path.join(root, page), "utf8");
    const at = order.map((src) => html.indexOf(`src="${src}"`));
    assert.ok(at.every((i) => i > 0), `${page} loads ${order.join(", ")}`);
    assert.deepEqual([...at].sort((a, b) => a - b), at, `${page} loads them in order`);
  }
  const coven = fs.readFileSync(path.join(root, "covens/coven/index.html"), "utf8");
  assert.ok(coven.indexOf("/covens/coven/coven.js") > coven.indexOf("/covens/coven/manage.js"), "the coven page loads its tabs before starting");
});
