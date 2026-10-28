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

test("ritual steps belong to a person, to everyone in a position, or to the whole coven", () => {
  const membership = { status: "active", rank_id: "elder" };
  const name = (id) => ({ u1: "Wren" })[id] || "A witch";
  assert.equal(L.stepIsMine({ assigned_user_id: "me" }, membership, "me"), true);
  assert.equal(L.stepIsMine({ assigned_user_id: "u1" }, membership, "me"), false);
  assert.equal(L.stepIsMine({ assigned_rank_id: "elder" }, membership, "me"), true);
  assert.equal(L.stepIsMine({ assigned_rank_id: "seeker" }, membership, "me"), false);
  assert.equal(L.stepIsMine({}, membership, "me"), true, "the whole coven's step is everyone's");
  assert.equal(L.stepIsMine({}, { status: "left", rank_id: "elder" }, "me"), false, "former members have no steps");
  assert.deepEqual(L.stepAssignee({ assigned_user_id: "u1" }, ranks, name), { kind: "person", label: "Wren" });
  assert.deepEqual(L.stepAssignee({ assigned_rank_id: "elder" }, [{ id: "elder", name: "Elder" }], name), { kind: "rank", label: "Every Elder" });
  assert.deepEqual(L.stepAssignee({}, ranks, name), { kind: "everyone", label: "The whole coven" });
});

test("those who moderate or lead the coven, or hold a ritual-leading position, lead rituals", () => {
  assert.equal(perms("founder", "seeker").lead, true);
  assert.equal(perms("u", "elder").lead, true, "Elders moderate, so they lead rituals");
  assert.equal(perms("u", "dedicant").lead, false);
  const withFlag = L.permissions({ coven, membership: { status: "active", rank_id: "x" }, ranks: [{ id: "x", level: 2, can_lead_rituals: true }], userId: "u" });
  assert.equal(withFlag.lead, true);
  assert.ok(L.rankPowers({ can_lead_rituals: true }).includes("leads rituals"));
});

test("rituals are grouped as under way, coming up, drafts and past", () => {
  const groups = L.ritualGroups([
    { id: "a", status: "scheduled", scheduled_for: "2026-11-05T20:00:00Z" },
    { id: "b", status: "scheduled", scheduled_for: "2026-10-30T20:00:00Z" },
    { id: "c", status: "scheduled", scheduled_for: null },
    { id: "d", status: "live" },
    { id: "e", status: "draft", updated_at: "2026-10-01T00:00:00Z" },
    { id: "f", status: "done", ended_at: "2026-10-01T00:00:00Z" },
    { id: "g", status: "cancelled", ended_at: null }
  ]);
  assert.deepEqual(groups.live.map((r) => r.id), ["d"]);
  assert.deepEqual(groups.upcoming.map((r) => r.id), ["b", "a", "c"]);
  assert.deepEqual(groups.drafts.map((r) => r.id), ["e"]);
  assert.deepEqual(groups.past.map((r) => r.id).sort(), ["f", "g"]);
  assert.deepEqual(L.orderSteps([{ ritual_id: "r", position: 2, id: "y" }, { ritual_id: "r", position: 1, id: "x" }, { ritual_id: "q", position: 0, id: "z" }], "r").map((s) => s.id), ["x", "y"]);
});

test("a saved personal ritual's steps become coven steps for the whole coven", () => {
  const steps = L.stepsFromTemplate([
    { title: "Close", sort_order: 3, duration_seconds: 125 },
    { title: "Cast the circle", sort_order: 1, instructions: "Walk deosil.", spoken_text: "I cast this circle." },
    { title: "  ", sort_order: 2 }
  ]);
  assert.deepEqual(steps.map((s) => s.title), ["Cast the circle", "Close"]);
  assert.equal(steps[0].spoken_text, "I cast this circle.");
  assert.equal(steps[1].duration_minutes, 2);
  assert.ok(steps.every((s) => s.assigned_user_id === null && s.assigned_rank_id === null));
});

test("ritual times round-trip through the date-and-time field", () => {
  const iso = "2026-10-30T20:15:00.000Z";
  assert.equal(L.fromLocalInput(L.toLocalInput(iso)), iso);
  assert.equal(L.toLocalInput(null), "");
  assert.equal(L.fromLocalInput(""), null);
});

test("the coven rituals migration keeps its rules", () => {
  const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261024000000_coven_rituals.sql"), "utf8");
  for (const table of ["coven_rituals", "coven_ritual_steps"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), table);
    assert.match(sql, new RegExp(`add table public\\.${table}`), `${table} is live`);
  }
  assert.doesNotMatch(sql, /for (insert|update|delete|all) to authenticated/, "rituals change only through the functions");
  assert.match(sql, /when 'lead' then coalesce\(r\.can_lead_rituals or r\.can_moderate or r\.can_manage, false\)/);
  assert.match(sql, /revoke execute on function public\.coven_ritual_leader\(uuid\), public\.coven_ritual_move\(uuid, uuid\), public\.coven_ritual_prune\(uuid, uuid\[\]\), public\.coven_ritual_remove\(uuid\) from public, anon, authenticated/);
});

test("only members who have signed the current agreements can be given a ritual part", () => {
  const people = [{ id: "a", eligible: true }, { id: "b", eligible: false }];
  const name = (id) => ({ a: "Wren", b: "Rowan", c: "Sage" })[id];
  assert.equal(L.unassignablePart({ assigned_user_id: "a" }, people, name), "");
  assert.match(L.unassignablePart({ assigned_user_id: "b" }, people, name), /^Rowan hasn’t signed the coven’s current agreements/);
  assert.match(L.unassignablePart({ assigned_user_id: "c" }, people, name), /^Sage is no longer a member/);
  assert.equal(L.unassignablePart({ assigned_rank_id: "elder" }, people, name), "", "positions and the whole coven are always fine");
  assert.equal(L.unassignablePart({}, people, name), "");
  const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261025000000_coven_ritual_signed_parts.sql"), "utf8");
  assert.match(sql, /coven_unsigned_agreements\(p_coven, person\) > 0 or public\.is_community_banned\(person\)/, "the database refuses unsigned members too");
});

test("the planner suggests coming full and new moons and sabbats", () => {
  const vm = require("node:vm");
  const sb = { window: {}, Intl, TextEncoder, console };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(root, "js/traditional-library.js"), "utf8"), sb);
  vm.runInContext(fs.readFileSync(path.join(root, "js/core/today.js"), "utf8"), sb);
  const list = L.occasionSuggestions(sb.SaltCore.today, new Date("2026-10-23T12:00:00Z"));
  assert.equal(list.length, 6);
  assert.deepEqual(Array.from(list.slice(0, 3), (s) => s.label), ["Full moon", "Samhain", "New moon"]);
  assert.ok(list.every((s, i) => i === 0 || list[i - 1].date <= s.date), "in date order");
  assert.equal(L.suggestionTime(list[1]).getHours(), 20, "sabbats suggest 8pm");
  assert.deepEqual(L.occasionSuggestions(null), [], "without the moon logic there are no suggestions");
  assert.equal(L.occasionLabel({ occasion: "sabbat", occasion_name: "Samhain" }), "Samhain");
  assert.equal(L.occasionLabel({ occasion: "full_moon", occasion_name: "Hunter’s Moon" }), "Full moon · Hunter’s Moon");
});

test("RSVPs, rites coming up, and a calendar file with a reminder", () => {
  const rsvps = [
    { ritual_id: "r", user_id: "a", response: "going" },
    { ritual_id: "r", user_id: "b", response: "maybe" },
    { ritual_id: "q", user_id: "a", response: "not_going" }
  ];
  const sum = L.rsvpSummary(rsvps, "r", "b");
  assert.equal(sum.going.length, 1);
  assert.equal(sum.mine, "maybe");
  const now = new Date("2026-10-26T12:00:00Z").getTime();
  const soon = L.ritesSoon([
    { id: "1", status: "scheduled", scheduled_for: "2026-10-26T20:00:00Z" },
    { id: "2", status: "scheduled", scheduled_for: "2026-10-29T20:00:00Z" },
    { id: "3", status: "draft", scheduled_for: "2026-10-26T20:00:00Z" }
  ], now);
  assert.deepEqual(soon.map((r) => r.id), ["1"]);
  const ics = L.riteCalendarFile({ id: "x", title: "Full moon, rite", scheduled_for: "2026-10-26T20:00:00Z", intention: "Clarity" }, "Moon; Circle", "https://example.com/c");
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /DTSTART:20261026T200000Z/);
  assert.ok(ics.includes(String.raw`SUMMARY:Full moon\, rite · Moon\; Circle`), "commas and semicolons are escaped");
  assert.match(ics, /TRIGGER:-PT1H/, "it reminds an hour before");
});

test("altar actions say what they do and who does them", () => {
  assert.equal(L.altarActionButton({ altar_action: "light_candle" }), "Light your candle");
  assert.equal(L.altarActionButton({ altar_action: "place_item", altar_label: "Rose · Petals" }), "Place Rose · Petals on the altar");
  assert.equal(L.altarActionButton({}), "");
  assert.match(L.altarActionNote({ altar_action: "light_candle", altar_color: "red" }), /red candle.*Each member lights their own/);
  assert.doesNotMatch(L.altarActionNote({ altar_action: "light_candle", assigned_user_id: "u" }), /Each member/);
  const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261026000000_coven_rites_book_petitions.sql"), "utf8");
  // The database builds candle pictures the same way the pages do.
  for (const [color, form] of [["white", "vigil"], ["red", "votive"], ["black", "vigil"], ["gold", "tea-light"]]) {
    const expected = L.candleImage(color, form);
    const built = form === "vigil" ? `/assets/altar/objects/candles/${color}-candle.${["black", "white"].includes(color) ? "PNG" : "png"}` : `/assets/altar/objects/candles/${form}/${color}-${form}.png`;
    assert.equal(built, expected, `${color} ${form}`);
  }
  assert.match(sql, /'-candle\.'\s*\|\| case when coalesce\(p_color, 'white'\) in \('black', 'white'\) then 'PNG' else 'png' end/);
});

test("the coven's book groups pages by section, and petitions are tended twice a day at most", () => {
  const sections = L.bookSections([{ title: "B", section: "Lore" }, { title: "A", section: "Lore" }, { title: "Z", section: "" }, { title: "C", section: "Correspondences" }]);
  assert.deepEqual(sections.map((s) => s.section), ["Correspondences", "Lore", "Pages"]);
  assert.deepEqual(sections[1].pages.map((p) => p.title), ["A", "B"]);
  const now = new Date("2026-10-26T12:00:00Z").getTime();
  const petition = { id: "p", status: "open" };
  assert.equal(L.canTend(petition, [], "me", now), true);
  assert.equal(L.canTend(petition, [{ petition_id: "p", user_id: "me", created_at: "2026-10-26T06:00:00Z" }], "me", now), false);
  assert.equal(L.canTend(petition, [{ petition_id: "p", user_id: "me", created_at: "2026-10-25T20:00:00Z" }], "me", now), true);
  assert.equal(L.canTend({ ...petition, status: "answered" }, [], "me", now), false);
});

test("the coven's head chooses who schedules rites and who writes and approves the book", () => {
  const custom = [{ id: "w", level: 2, can_write_book: true }, { id: "a", level: 3, can_approve_book: true }, { id: "s", level: 2, can_schedule_rites: true }];
  const as = (rank) => L.permissions({ coven, membership: { status: "active", rank_id: rank }, ranks: custom, userId: "u" });
  assert.deepEqual([as("w").writeBook, as("w").approveBook, as("w").schedule], [true, false, false]);
  assert.deepEqual([as("a").writeBook, as("a").approveBook], [true, true], "approvers can write too");
  assert.equal(as("s").schedule, true);
  assert.equal(perms("founder", "seeker").schedule && perms("founder", "seeker").approveBook, true);
  assert.equal(perms("u", "elder").schedule, false, "moderating doesn't mean scheduling");
  const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261026000000_coven_rites_book_petitions.sql"), "utf8");
  for (const table of ["coven_ritual_rsvps", "coven_ritual_step_marks", "coven_book_pages", "coven_book_drafts", "coven_petitions", "coven_petition_tendings"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), table);
  }
  assert.doesNotMatch(sql, /for (insert|update|delete|all) to authenticated/, "these change only through the functions");
});

test("program powers: by position, by name, or as the founder", () => {
  const ranks2 = [{ id: "pm", level: 3, can_manage_programs: true }, { id: "vp", level: 2, can_view_progress: true }, { id: "pl", level: 1 }];
  const p = (rankId, grants = [], userId = "u") => L.permissions({ coven, membership: { status: "active", rank_id: rankId }, ranks: ranks2, userId, grants });
  assert.deepEqual([p("pm").programs, p("pm").progress], [true, true]);
  assert.deepEqual([p("vp").programs, p("vp").progress], [false, true]);
  assert.deepEqual([p("pl").programs, p("pl").progress], [false, false]);
  assert.deepEqual([p("pl", [{ user_id: "u", power: "manage_programs" }]).programs, p("pl", [{ user_id: "u", power: "view_progress" }]).progress], [true, true]);
  assert.equal(p("pl", [{ user_id: "someone-else", power: "manage_programs" }]).programs, false, "another person's grant isn't mine");
  assert.ok(L.rankPowers({ can_manage_programs: true }).includes("manages initiation and training"));
});

test("a coven with its own calendar suggests its own holidays for rites", () => {
  const vm = require("node:vm");
  const sb = { window: {}, Intl, TextEncoder, console };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(fs.readFileSync(path.join(root, "js/traditional-library.js"), "utf8"), sb);
  vm.runInContext(fs.readFileSync(path.join(root, "js/core/today.js"), "utf8"), sb);
  vm.runInContext(fs.readFileSync(path.join(root, "js/core/covens.js"), "utf8"), sb);
  const from = new Date("2026-10-23T12:00:00Z");
  const days = sb.SaltCore.covens.programs.covenHolidaysBetween({ practice_traditions: ["norse"] }, from, new Date(from.getTime() + 200 * 86400000));
  const list = L.occasionSuggestions(sb.SaltCore.today, from, 6, days);
  assert.ok(list.some((s) => s.name === "Winter Nights (Vetrnætur)" && s.occasion === "other"), list.map((s) => s.name).join(", "));
  assert.ok(!list.some((s) => s.name === "Samhain"), "the Wheel's sabbats give way to the coven's calendar");
});

test("programs, mentors and grants change only through the database's functions", () => {
  const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261027000000_coven_programs.sql"), "utf8");
  for (const table of ["coven_grants", "coven_mentors", "coven_programs", "coven_program_stages", "coven_program_tasks", "coven_program_assignments", "coven_program_enrollments", "coven_program_progress", "coven_program_stage_passes", "coven_program_templates"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), table);
  }
  assert.doesNotMatch(sql, /for (insert|update|delete|all) to authenticated/, "no direct writes");
  const templates = fs.readFileSync(path.join(root, "supabase/migrations/20261027000100_coven_program_templates.sql"), "utf8");
  for (const id of ["wheel", "wheel_south", "celtic", "norse", "hellenic", "roman", "slavic", "christian"]) {
    assert.match(templates, new RegExp(`'${id}-initiation'`), `${id} initiation`);
    assert.match(templates, new RegExp(`'${id}-training'`), `${id} training`);
  }
});
