// Dreams as a section of the Grimoire (/grimoire/dreams/…): the same
// `hedge.dreams` the app keeps, the Book of Shadows shelf, the Sanctuary
// search, the morning reminder as a calendar file and Today's morning prompt.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function loadCore(name) {
  const sandbox = { window: {}, console, TextEncoder, Intl, Date, Math };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(read("js/traditional-library.js"), sandbox); // read by the bundles (scripts/build-core.mjs)
  vm.runInContext(read(`js/core/${name}.js`), sandbox);
  return sandbox.SaltCore[name];
}

test("the Grimoire's dream pages load the shared kit, the app's logic and the dreams script", () => {
  const pages = { "grimoire/dreams/index.html": "grimoire-dreams", "grimoire/dreams/dream/index.html": "grimoire-dream", "grimoire/dreams/edit/index.html": "grimoire-dream-edit", "grimoire/dreams/symbols/index.html": "grimoire-dream-symbols" };
  for (const [page, view] of Object.entries(pages)) {
    const html = read(page);
    assert.match(html, new RegExp(`data-page-root data-view="${view}"`), page);
    for (const script of ["/js/salt-store.js", "/js/core/practice-a.js", "/practice/practice.js", "/grimoire/dreams/dreams.js"]) assert.ok(html.includes(`src="${script}"`), `${page}: ${script}`);
    for (const ref of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) assert.ok(fs.existsSync(path.join(root, ref[1])), `${page}: ${ref[1]}`);
  }
  const script = read("grimoire/dreams/dreams.js");
  for (const view of Object.values(pages)) assert.ok(script.includes(`"${view}"`), view);
  assert.match(script, /kit\.entries\(D\.DREAMS\)/);
});

test("the old Hedge dream pages send people to the Grimoire, keeping the dream's id", () => {
  const to = { "": "/grimoire/dreams/", "dream/": "/grimoire/dreams/dream/", "edit/": "/grimoire/dreams/edit/", "symbols/": "/grimoire/dreams/symbols/" };
  for (const [from, target] of Object.entries(to)) {
    const html = read(`practice/hedge/dreams/${from}index.html`);
    assert.ok(html.includes(`location.replace("${target}" + location.search`), from || "index");
  }
  const hedge = read("practice/hedge/hedge.js");
  assert.match(hedge, /dreams: "\/grimoire\/dreams\/"/);
  assert.doesNotMatch(hedge, /dreamEditView|symbolsView/);
});

test("the Book of Shadows has a Dreams shelf after My Practice, outside grimoire_sections", () => {
  const html = read("grimoire/index.html");
  assert.ok(html.indexOf("../js/salt-store.js") > -1 && html.indexOf("../js/core/practice-a.js") > -1);
  assert.ok(html.indexOf("js/ui/dreams.js") < html.indexOf("js/app.js"));
  const shelf = read("grimoire/js/ui/dreams.js");
  assert.doesNotMatch(shelf, /from\("grimoire_sections"\)/);
  assert.match(read("grimoire/js/app.js"), /await renderMyPracticeShelf\(\);\n\s+\/\/ Dreams[^\n]*\n\s+if \(typeof renderDreamsShelf === "function"\) await renderDreamsShelf\(\);/);

  // Placement, with a tiny stand-in for the contents element.
  const { placeDreamsShelf } = require("../grimoire/js/ui/dreams.js");
  const placed = [];
  const myPractice = { insertAdjacentElement: (where, el) => placed.push(["after-my-practice", where, el]) };
  placeDreamsShelf({ querySelector: () => myPractice, prepend: (el) => placed.push(["first", el]) }, "shelf");
  placeDreamsShelf({ querySelector: () => null, prepend: (el) => placed.push(["first", el]) }, "shelf");
  assert.deepEqual(placed, [["after-my-practice", "afterend", "shelf"], ["first", "shelf"]]);
});

test("dreams show in the Sanctuary search, by their words, symbols and moon", () => {
  const S = require("../js/sanctuary-search.js");
  assert.equal(S.GROUP_LABELS.dreams, "Dreams");
  const result = S.createDreamResult({
    id: "d1",
    createdAt: "2026-10-20T07:00:00.000Z",
    data: { date: "2026-10-20", title: "The flooded house", dream: "Water rising in the cellar", feelings: "calm", symbols: ["water", "house"], moonPhase: "Waxing Gibbous", moonSign: "Pisces" }
  });
  assert.equal(result.group, "dreams");
  assert.equal(result.href, "/grimoire/dreams/dream/?id=d1");
  assert.equal(result.subtitle, "2026-10-20 · Waxing Gibbous in Pisces");
  S.buildIndex({ dreams: [result] });
  assert.equal(S.search("water")[0].id, "d1");
  assert.equal(S.search("pisces")[0].id, "d1");
  assert.equal(S.search("cellar")[0].id, "d1");
  assert.equal(S.createDreamResult({ id: "d2", data: {} }).title, "Untitled dream");
  assert.match(read("js/sanctuary-search-ui.js"), /SaltCraft\.list\("hedge\.dreams"\)/);
});

test("the morning dream reminder is off by default and becomes two weeks of calendar events", () => {
  const G = loadCore("guides");
  const R = require("../reminders/reminders-logic.js");
  const now = new Date(2026, 9, 23, 9, 0);
  const off = G.schedule.normalizeSettings({});
  assert.equal(off.dreamMorning, false);
  assert.deepEqual(R.dreamReminderEvents(off, now, G), []);
  const on = G.schedule.normalizeSettings({ dreamMorning: true, dreamMorningAt: 6 * 60 + 30 });
  const events = R.dreamReminderEvents(on, now, G);
  assert.equal(events.length, 14);
  assert.equal(events[0].title, "Last night’s dream");
  assert.equal(events[0].start.getHours(), 6);
  assert.equal(events[0].start.getMinutes(), 30);
  assert.ok(R.reminderEvents({ settings: { ...on, rituals: false }, plans: [], appSettings: {}, now }, G).some((e) => e.title === "Last night’s dream"));
  assert.match(read("reminders/reminders.js"), /dreamsHtml\(\)/);
});

test("Today's morning prompt and quick capture use the app's own dream logic", () => {
  const C = loadCore("today");
  const morning = new Date(2026, 9, 23, 7, 0);
  assert.ok(C.dreams.morningDreamPrompt(morning, { keepsHedge: true, reminderOn: false, dreams: [] }));
  assert.equal(C.dreams.morningDreamPrompt(new Date(2026, 9, 23, 15, 0), { keepsHedge: true, reminderOn: false, dreams: [] }), null);
  const quick = C.dreams.quickDream("A hare on the hill", morning);
  assert.equal(quick.date, "2026-10-23");
  assert.equal(quick.title, "A hare on the hill");
  assert.equal(C.practiceDay.practiceToday(["hedge"], new Date(2026, 1, 3), { place: null, choice: { traditions: [], custom: [], picked: [] } })[0]?.href.startsWith("/"), true);
  const T = require("../today/today-logic.js");
  const store = new Map([["reminders.settings.v1", JSON.stringify({ dreamMorning: true })]]);
  assert.equal(T.dreamReminderOn({ getItem: (k) => store.get(k) ?? null }), true);
  assert.equal(T.dreamReminderOn({ getItem: () => null }), false);
  const today = read("today/today.js");
  assert.match(today, /dreamCard\(m\)/);
  assert.match(today, /C\.dreams\.quickDream\(text, new Date\(\)\)/);
  assert.ok(read("today/index.html").includes("/js/salt-store.js"));
  // The practice-a bundle the dream pages load has the same logic.
  assert.equal(loadCore("practice-a").dreams.quickDream("x", morning).date, "2026-10-23");
});
