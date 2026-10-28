const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// The Altar page's two tabs in My Altars (Personal | Coven), as the app's
// Altar tab has them (app/src/lib/screenTabs.ts, app/src/lib/covens/altarsAcross.ts).
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

const altar = (id, extra = {}) => ({ id, coven_id: "c1", name: id, is_main: false, edit_mode: "members", locked: false, extra: {}, archived_at: null, created_by: "u2", created_at: "2026-10-01T00:00:00Z", ...extra });

test("the altar bundle carries the app's Altar tabs and the Coven tab's grouping", () => {
  const core = bundle("js/core/altar.js").altar;
  const tabs = core.screenTabs;
  assert.deepEqual(Array.from(tabs.ALTAR_TABS, (t) => t.label), ["Personal", "Coven"]);
  assert.equal(tabs.ALTAR_TAB_KEY, "saltAltarTab");
  assert.equal(tabs.asAltarTab("coven"), "coven");
  assert.equal(tabs.asAltarTab("junk"), null);

  const groups = core.altarsAcross.groupCovenAltars(
    [
      { coven: { id: "c2", slug: "hearth", name: "Hearth" }, altars: [altar("h1"), altar("h-main", { is_main: true }), altar("h-old", { archived_at: "2026-10-02T00:00:00Z" })], counts: { h1: 2 }, canStart: true, keeps: true },
      { coven: { id: "c1", slug: "circle", name: "Ash Circle" }, altars: [altar("plea", { extra: { petition_id: "p" } }), altar("a1")], counts: {}, canStart: false, keeps: false }
    ],
    "u1"
  );
  assert.deepEqual(Array.from(groups, (g) => g.coven.name), ["Ash Circle", "Hearth"]);
  assert.deepEqual(Array.from(groups[0].altars, (a) => a.id), ["a1", "plea"]);
  assert.deepEqual(Array.from(groups[1].altars, (a) => a.id), ["h-main", "h1"]);
  assert.deepEqual(Array.from(groups[1].archived, (a) => a.id), ["h-old"]);
  assert.deepEqual(Array.from(core.altarsAcross.covensToStartIn(groups), (c) => c.slug), ["hearth"]);
});

test("the altar page loads the switch and the tabs after My Altars and the app's altar logic", () => {
  const html = read("altar/index.html");
  const at = (src) => html.indexOf(`src="${src}"`);
  assert.ok(at("../js/segmented-switch.js") > 0);
  assert.ok(at("js/features/altar-tabs.js") > at("../js/segmented-switch.js"));
  assert.ok(at("js/features/altar-tabs.js") > at("js/core/storage.js"));
  assert.ok(at("js/features/altar-tabs.js") > at("../js/core/altar.js"));
  const storage = read("altar/js/core/storage.js");
  assert.match(storage, /data-saved-altars-tabs/);
  assert.match(storage, /data-coven-altars-list hidden/);
  assert.match(storage, /SaltAltarTabs\?\.opened\?\.\(\)/);
  const page = read("altar/js/features/altar-tabs.js");
  assert.match(page, /groupCovenAltars\(/);
  assert.match(page, /\/covens\/\?tab=find/, "no coven yet points to Find a coven");
  assert.match(page, /Covens need an account/);
  assert.match(page, /a\[data-site-tab="altar"\]/, "the Altar tab, pressed again, goes back to Personal");
});

test("Help's links to Altar's tabs keep the tab on the website", () => {
  const W = require("../help/web-notes.js");
  assert.equal(W.siteHref("/altar?tab=coven"), "/altar/?tab=coven");
  assert.equal(W.siteHref("/altar"), "/altar/");
});
