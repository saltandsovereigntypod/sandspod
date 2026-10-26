const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// The new spreads, readings drawn for a dream, a working or a deity, Hekate's
// Deipnon and the coven reading, as the site loads them (js/core/*.js set window.SaltCore).
global.window = globalThis;
const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
for (const name of ["divination", "today", "rituals", "covens", "guides", "practice-a", "journeys"]) vm.runInThisContext(read(`js/core/${name}.js`));
const Dv = globalThis.SaltCore.divination;
const T = globalThis.SaltCore.today;
const Rt = globalThis.SaltCore.rituals;
const Cv = globalThis.SaltCore.covens;
const G = globalThis.SaltCore.guides;
const P = globalThis.SaltCore["practice-a"];
const J = globalThis.SaltCore.journeys;

test("the site's bundle carries the new spreads and their layouts", () => {
  for (const id of ["crossroads", "dream", "before-working", "patron-deity", "yule", "imbolc", "ostara", "beltane", "litha", "lammas", "mabon"]) {
    const s = Dv.draw.spreadById(id);
    assert.ok(s, id);
    assert.equal(Dv.layout.layoutOf(s).slots.length, s.positions.length, id);
  }
  assert.equal(Dv.linked.linkKindOfSpread("dream"), "dream");
});

test("Today on the site offers each sabbat's spread near it, as the app does", () => {
  assert.ok(T.seasonal.seasonalSpreads(new Date(2026, 11, 20, 12)).some((s) => s.spread === "yule"));
  assert.ok(T.seasonal.seasonalSpreads(new Date(2027, 1, 1, 12)).some((s) => s.spread === "imbolc"));
  assert.ok(T.seasonal.seasonalSpreads(new Date(2026, 9, 29, 12), { south: true }).some((s) => s.spread === "beltane"));
});

test("a reading drawn on the site for a dream keeps the same link the app reads", () => {
  const link = Dv.linked.linkFromParams({ dream: "d1", title: "The flood" });
  const s = Dv.draw.spreadById("dream");
  const reading = Dv.draw.readingFromDraw(s, Dv.draw.drawSpread(s, { reversals: false, blankRune: false }), { now: new Date(2026, 9, 26), linkedTo: link });
  assert.deepEqual(P.readings.normalizeReading(reading).linkedTo, { kind: "dream", id: "d1", title: "The flood" });
  const list = [{ id: "r1", createdAt: "2026-10-26T00:00:00Z", data: P.readings.normalizeReading(reading) }];
  assert.equal(P.linked.linkedReadings(list, "dream", "d1").length, 1);
  assert.equal(P.linked.dreamReadingDraws([...list, { ...list[0], id: "r2" }]).length, 3);
  assert.match(read("grimoire/dreams/dreams.js"), /Read this dream/);
  assert.match(read("practice/hedge/hedge.js"), /linkedTo: drawLink\(spread\)/);
});

test("a working begun from its plan carries the plan to its journal entry, and its pre-reading is found", () => {
  assert.match(read("altar/js/features/ritual-template-start-bridge.js"), /extra\.planId = handoff\.planId/);
  assert.match(read("altar/js/features/ritual-journal.js"), /planId: session\.metadata\.planId/);
  const entry = { metadata: { planId: "p1" } };
  const readings = [{ id: "r1", createdAt: "x", data: Rt.readings.normalizeReading({ date: "2026-10-26", method: "tarot", linkedTo: { kind: "plan", id: "p1", title: "Jar" }, matched: "yes" }) }];
  assert.equal(Rt.linked.preReadingOf(readings, entry).id, "r1");
  assert.match(Rt.linked.preReadingLine(readings), /^Of the one reading you drew before a working/);
  assert.match(read("rituals/js/did-it-work.js"), /Drawn before you began/);
  assert.match(read("rituals/js/plan.js"), /Draw before you begin/);
});

test("a deity's journey offers the Patron deity spread", () => {
  assert.deepEqual(J.linked.deityLink("traditional/deity/hekate", "Hekate"), { kind: "deity", id: "hekate", title: "Hekate" });
  assert.match(read("rituals/journeys/journeys.js"), /Draw the Patron deity spread/);
});

test("Hekate's Deipnon shows on the site's Today, can be turned off, and goes into the reminders calendar", () => {
  const settings = { calendar_traditions: "wheel,hellenic_monthly" };
  const [day] = T.deipnon.deipnonDays(new Date(2026, 9, 1), 60);
  assert.ok(T.deipnon.deipnonToday(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10), settings));
  assert.equal(T.deipnon.deipnonToday(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10), { ...settings, deipnon_prompt: false }), null);
  assert.match(read("today/today.js"), /deipnonCard\(m\)/);
  assert.match(read("today/calendar/calendar.js"), /set\("deipnon_prompt", input\.checked\)/);
  const R = require("../reminders/reminders-logic.js");
  const remind = G.schedule.normalizeSettings({ sacredDays: true });
  const now = new Date(2026, 9, 1, 8);
  const hekate = { my_deities: JSON.stringify([{ key: "hekate", name: "Hekate", level: "patron", since: "" }]) };
  const events = R.reminderEvents({ settings: { ...remind, rituals: false }, plans: [], appSettings: hekate, now }, G);
  const deipna = events.filter((e) => e.key.startsWith("reminder-deipnon-"));
  assert.ok(deipna.length >= 2);
  assert.equal(deipna[0].title, "Hekate’s Deipnon today");
  const days = new Set(deipna.map((e) => e.start.toDateString()));
  assert.ok(!events.some((e) => e.key.startsWith("reminder-sacred-hekate-") && days.has(e.start.toDateString())), "not twice");
  assert.deepEqual(R.deipnonReminderEvents(remind, {}, now, G), []);
});

test("a coven reading on the site is the same messages the app sends and reads", () => {
  const R = Cv.reading;
  const opening = { id: "o", user_id: "u0", body: R.openingBody("Winter", { name: "The Star", reversed: false }), created_at: "2026-10-26T20:00:00Z", reply_to: null };
  const card = { id: "a", user_id: "u1", body: R.cardBody({ name: "The Moon", reversed: false }), created_at: "2026-10-26T20:01:00Z", reply_to: "o" };
  const [reading] = R.covenReadings([opening, card]);
  assert.equal(reading.members[0].item.name, "The Moon");
  assert.match(R.covenDiagramSvg(1), /<svg/);
  assert.match(read("covens/coven/chat.js"), /Begin a coven reading/);
  assert.match(read("covens/coven/chat.js"), /D\.send\(state\.coven\.id, body, replyTo, id\)/);
});

test("the How to guide on the site covers the new spreads, the Deipnon and coven readings", () => {
  const ids = G.help.HELP.flatMap((s) => s.topics.map((t) => t.id));
  for (const id of ["divination-crossroads", "divination-dream-reading", "divination-before-working", "divination-sabbat-spreads", "divination-patron-deity", "covens-reading", "today-deipnon"]) assert.ok(ids.includes(id), id);
});
