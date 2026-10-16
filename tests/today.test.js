const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const T = require("../today/today-logic.js");
const root = path.join(__dirname, "..");

function loadBundle(...names) {
  const context = { console, Date, Math, Intl, crypto: globalThis.crypto };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  for (const name of names) vm.runInContext(fs.readFileSync(path.join(root, `js/core/${name}.js`), "utf8"), context);
  return context.SaltCore;
}

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k)
  };
}

test("the place is kept in this browser only, rounded to about a kilometre, under the app's key", () => {
  const storage = memoryStorage();
  assert.equal(T.readPlace(storage), null);
  const place = T.savePlace(storage, 51.50735, -0.12776, "device");
  assert.deepEqual(place, { latitude: 51.51, longitude: -0.13, source: "device" });
  assert.deepEqual(JSON.parse(storage.getItem("sky.place")), place);
  assert.deepEqual(T.readPlace(storage), place);
  assert.equal(T.savePlace(storage, 91, 0, "manual"), null);
  assert.equal(T.parseCoordinate("13,4"), 13.4);
  assert.ok(Number.isNaN(T.parseCoordinate("")));
  T.clearPlace(storage);
  assert.equal(T.readPlace(storage), null);
});

test("the location is only asked for on request and handles a refusal", async () => {
  const storage = memoryStorage();
  const denied = { getCurrentPosition: (_ok, fail) => fail({ code: 1 }) };
  assert.deepEqual(await T.askBrowserLocation(storage, denied), { result: "denied" });
  assert.deepEqual(await T.askBrowserLocation(storage, undefined), { result: "unavailable" });
  const ok = { getCurrentPosition: (done) => done({ coords: { latitude: -33.8688, longitude: 151.2093 } }) };
  const found = await T.askBrowserLocation(storage, ok);
  assert.equal(found.result, "ok");
  assert.deepEqual(T.readPlace(storage), { latitude: -33.87, longitude: 151.21, source: "device" });
  // Nothing on the Today pages asks for the location without a click.
  for (const file of ["today/today.js", "today/sky/sky.js"]) {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.equal((source.match(/askBrowserLocation\(/g) || []).length, 1, file);
    assert.match(source, /data-use-location/);
  }
});

test("the app's routes open the website's pages", () => {
  assert.equal(T.siteHref("/rituals/craft/green/moon"), "/practice/green/moon/");
  assert.equal(T.siteHref("/rituals/craft/eclectic"), "/practice/eclectic/");
  assert.equal(T.siteHref("/today/reminders"), "/reminders/");
  assert.equal(T.siteHref("/more/settings/practice"), "/?sanctuary=settings");
  assert.equal(T.siteHref({ pathname: "/rituals/premade/[id]", params: { id: "folk-lararium-offering" } }), "/rituals/premade/?id=folk-lararium-offering");
  assert.equal(T.siteHref({ pathname: "/rituals/plan/[id]", params: { id: "p1" } }), "/rituals/plan/?id=p1");
  assert.equal(T.siteHref({ pathname: "/today/journal/[id]", params: { id: "j 1" } }), "/rituals/journal/?id=j%201");
  assert.equal(T.siteHref("/rituals/planner"), "/rituals/planner/");
  assert.equal(T.siteHref("/today/library/traditional:deity:hekate"), "/grimoire/?entity=traditional%2Fdeity%2Fhekate");
  assert.equal(T.siteHref("/more/settings/deities"), "/more/settings/deities/");
  assert.equal(T.siteHref({ pathname: "/altar/[altarId]", params: { altarId: "tonight" } }), "/altar/?tonight=1");
  assert.equal(T.holyHref("wheel-samhain", true), "/today/holy/?ref=wheel-samhain&from=today");
  assert.equal(T.libraryHref({ traditionalRef: "traditional/crystal/rose_quartz" }), "/grimoire/?entity=traditional%2Fcrystal%2Frose_quartz");
  assert.equal(T.libraryHref(null), null);
});

test("guests' plans and rituals are read from the keys the app and website use", () => {
  const storage = memoryStorage();
  storage.setItem("rituals.plans.v1", JSON.stringify([{ id: "a", date: "2026-10-20", time: "21:00", title: "Candle" }, null]));
  storage.setItem(
    "saltAndSovereigntyRitualLifecycle:guest",
    JSON.stringify({ activeSessionId: "s1", sessions: [{ id: "s1", status: "paused", session_steps: [] }], journals: [{ id: "j1" }] })
  );
  assert.equal(T.guestPlans(storage).length, 1);
  const rituals = T.guestRituals(storage);
  assert.equal(rituals.active.id, "s1");
  assert.equal(rituals.journal.length, 1);
  assert.equal(T.moonRemindersOn(storage), false);
  storage.setItem("reminders.settings.v1", JSON.stringify({ phases: { full: true } }));
  assert.equal(T.moonRemindersOn(storage), true);
  storage.setItem("rituals.plans.v1", "not json");
  assert.deepEqual(T.guestPlans(storage), []);
});

test("the sky card says what matters today, from the app's own sky", () => {
  const { today: C } = loadBundle("today");
  const now = new Date(2026, 9, 16, 12);
  const sky = C.sky.skyNow(now, { planets: false });
  const lines = T.daySkyLines(C, sky, now);
  assert.ok(lines.at(-1).startsWith(`${sky.sunSign} season`));
  const fake = {
    vocNow: true,
    voc: { start: now, end: new Date(2026, 9, 17, 9, 5) },
    retrogrades: [{ planet: "Mercury", when: "soon", date: new Date(2026, 9, 25) }, { planet: "Saturn", when: "now", date: now }],
    sunSign: "Libra",
    sunSeason: "a season of balance",
    sunSignEnds: null
  };
  const out = T.daySkyLines(C, fake, now);
  assert.match(out[0], /^Moon void of course until tomorrow at /);
  assert.match(out[1], /^Mercury turns retrograde in 9 days/);
  assert.equal(out.length, 3, "Saturn is not a personal planet");
  assert.equal(out[2], "Libra season: a season of balance.");
});

test("the moon disc draws nothing lit at new moon and a lit path otherwise", () => {
  assert.doesNotMatch(T.moonDiscSvg(26, 0, true, false), /<path/);
  assert.match(T.moonDiscSvg(136, 0.5, true), /<path d="M 68 /);
  assert.match(T.moonDiscSvg(80, 1, false, true, "Full Moon"), /aria-label="Full Moon"/);
});

test("Today links to holy pages by the app's refs without loading their text", () => {
  const { today: C } = loadBundle("today");
  assert.equal(C.holyRefs.holyRef("wheel_south-samhain-2026-4-1"), "wheel-samhain");
  assert.equal(C.holyRefs.moonRef({ name: "New Moon", illumination: 0.001 }), "moon-dark");
  assert.equal(C.holyRefs.moonRef({ name: "Full Moon", illumination: 1 }), "moon-full");
  assert.equal(C.holyRefs.principalRef("firstQuarter"), "moon-first-quarter");
  assert.equal(C.holy, undefined);
  const source = fs.readFileSync(path.join(root, "scripts/core/today.ts"), "utf8");
  assert.doesNotMatch(source, /lib\/holy\/index/);
});

test("keeping a holy page writes the app's rows: section, tagged page, then blocks", () => {
  const { holy: H } = loadBundle("holy");
  const page = H.holy.holyPage("wheel-samhain");
  assert.ok(page, "Samhain has a page");
  assert.equal(H.holy.holyPage("not-a-day"), null);
  const snapshot = { books: [{ id: "book" }], sections: [{ id: "s0", book_id: "book", title: "Herbs", sort_order: 0 }], pages: [{ id: "p0", book_id: "book", section_id: null, sort_order: 4 }], blocks: [], links: [] };
  let n = 0;
  const blocks = H.holy.holyBlocks(page, null);
  const { id, ops } = H.holyOps.holyPageOps(snapshot, { userId: "u", now: "2026-10-16T00:00:00Z" }, { ref: page.ref, title: page.title, sectionTitle: H.holy.grimoireSection(page), blocks }, () => `id${n++}`);
  assert.deepEqual([...ops.map((op) => op.table).slice(0, 2)], ["grimoire_sections", "grimoire_pages"]);
  assert.equal(ops[0].row.title, "Holy Days");
  assert.equal(ops[0].row.sort_order, 1);
  assert.equal(ops[1].row.id, id);
  assert.equal(ops[1].row.section_id, ops[0].row.id);
  assert.deepEqual(JSON.parse(JSON.stringify(ops[1].row.metadata)), { holyRef: "wheel-samhain" });
  assert.equal(ops.length, 2 + blocks.length);
  assert.ok(ops.slice(2).every((op, i) => op.row.page_id === id && op.row.sort_order === i && op.row.user_id === "u"));
  // Opened again, the tagged page is found instead of making another.
  const found = H.holy.findHolyGrimoirePage([{ id, title: page.title, section_id: ops[0].row.id, metadata: { holyRef: page.ref } }], [], page);
  assert.equal(found.id, id);
});
