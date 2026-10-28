const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Today's tabs (Today | Sky & Lore) and the Covens page's (My covens | Find a
// coven), as the app has them (app/src/lib/screenTabs.ts), with the switch
// they share (js/segmented-switch.js).
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function bundle(file) {
  const sb = { window: {}, Intl, TextEncoder, console };
  sb.window = sb;
  vm.createContext(sb);
  vm.runInContext(read("js/traditional-library.js"), sb); // read by the bundles (scripts/build-core.mjs)
  vm.runInContext(read(file), sb);
  return sb.SaltCore;
}

const SW = require("../js/segmented-switch.js");

test("the site's bundles carry the app's tabs, under the app's storage keys", () => {
  const today = bundle("js/core/today.js").today.screenTabs;
  const covens = bundle("js/core/covens.js").covens.screenTabs;
  assert.deepEqual(Array.from(today.TODAY_TABS, (t) => t.label), ["Today", "Sky & Lore"]);
  assert.deepEqual(Array.from(covens.COVEN_TABS, (t) => t.label), ["My covens", "Find a coven"]);
  assert.equal(today.TODAY_TAB_KEY, "saltTodayTab");
  assert.equal(covens.COVEN_TAB_KEY, "saltCovenTab");
  assert.equal(today.todayTabFor({ section: "#correspondences" }), "sky");
  assert.equal(today.todayTabFor({ section: "moon" }), "today");
  assert.equal(covens.covenTabFor({ signedIn: true, covenCount: 0 }), "find");
  assert.equal(covens.covenTabFor({ signedIn: true, covenCount: 3 }), "mine");
  assert.equal(typeof bundle("js/core/covens.js").covens.today.covenGlance, "function");
});

test("the switch is a tablist with the chosen tab selected, and survives blocked storage", () => {
  const html = SW.html({ id: "td-tabs", label: "Today", options: [{ key: "today", label: "Today" }, { key: "sky", label: "Sky & Lore" }], value: "sky" });
  assert.match(html, /role="tablist" aria-label="Today"/);
  assert.match(html, /id="td-tabs-today" aria-selected="false"[^>]*tabindex="-1"/);
  assert.match(html, /id="td-tabs-sky" aria-selected="true"[^>]*tabindex="0"/);
  assert.match(html, /Sky &amp; Lore/);
  assert.match(SW.panel({ id: "td-tabs", value: "sky" }, "x"), /role="tabpanel" id="td-tabs-panel" aria-labelledby="td-tabs-sky"/);

  const saved = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("blocked"); } });
  try {
    assert.equal(SW.remembered("saltTodayTab", (v) => v), null);
    assert.doesNotThrow(() => SW.remember("saltTodayTab", "sky"));
  } finally {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, writable: true, value: saved });
  }
});

test("Today and Covens load the switch and draw their tabs with it", () => {
  for (const page of ["today/index.html", "covens/index.html"]) assert.match(read(page), /<script src="\/js\/segmented-switch\.js"><\/script>/, page);
  const today = read("today/today.js");
  assert.match(today, /SW\.html\(tabs\)/);
  assert.match(today, /todayTabFor\(/);
  assert.match(today, /a\[data-site-tab="today"\]/, "the Today tab, pressed again, goes back to the first tab");
  const directory = read("covens/directory.js");
  assert.match(directory, /covenTabFor\(/);
  assert.match(directory, /covenGlance/);
  assert.match(directory, /data-go-find/, "an empty My covens points to Find a coven");
  assert.match(read("covens/index.html"), /<script src="\/today\/coven-today\.js"><\/script>/);
});

test("Help's links to Today's and Coven's tabs keep the tab on the website", () => {
  const W = require("../help/web-notes.js");
  assert.equal(W.siteHref("/today?section=horizon"), "/today/?section=horizon");
  assert.equal(W.siteHref("/coven?tab=find"), "/covens/?tab=find");
  assert.equal(W.siteHref("/today"), "/today/");
});
