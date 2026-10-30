const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Divination and the sigil maker are open to every practice: /divination/ and
// /sigil/ (the app's /rituals/divination and /rituals/sigil), with the old
// Hedge and Eclectic addresses sending people on.
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const Notes = require("../help/web-notes.js");
const T = require("../today/today-logic.js");
const SiteNav = require("../js/site-nav.js");

test("the app's divination and sigil routes map to the website's pages", () => {
  for (const siteHref of [Notes.siteHref, T.siteHref]) {
    assert.equal(siteHref("/rituals/divination"), "/divination/");
    assert.equal(siteHref("/rituals/divination/draw"), "/divination/draw/");
    assert.equal(siteHref("/rituals/divination/spread"), "/divination/spread/");
    assert.equal(siteHref("/rituals/divination/edit"), "/divination/edit/");
    assert.equal(siteHref("/rituals/divination/abc-1"), "/divination/reading/?id=abc-1");
    assert.equal(siteHref("/rituals/sigil"), "/sigil/");
  }
  assert.equal(T.siteHref({ pathname: "/rituals/divination/draw", params: { spread: "daily" } }), "/divination/draw/?spread=daily");
  assert.equal(T.siteHref({ pathname: "/rituals/divination/[id]", params: { id: "r 1" } }), "/divination/reading/?id=r%201");
});

test("the new pages carry the same views and scripts the practice pages did", () => {
  const views = { "divination/index.html": "hedge-readings", "divination/draw/index.html": "hedge-draw", "divination/edit/index.html": "hedge-reading-edit", "divination/reading/index.html": "hedge-reading", "divination/spread/index.html": "hedge-spread", "sigil/index.html": "eclectic-sigil" };
  for (const [file, view] of Object.entries(views)) {
    const html = read(file);
    assert.match(html, new RegExp(`data-view="${view}"`), file);
    assert.match(html, /\/js\/site-nav\.js/, file);
  }
  assert.match(read("divination/draw/index.html"), /\/js\/core\/divination\.js/);
  assert.match(read("sigil/index.html"), /\/practice\/eclectic\/sigil\.js/);
});

test("the old Hedge and Eclectic addresses send people on, keeping the query", () => {
  const moved = {
    "practice/hedge/readings/index.html": "/divination/",
    "practice/hedge/readings/draw/index.html": "/divination/draw/",
    "practice/hedge/readings/edit/index.html": "/divination/edit/",
    "practice/hedge/readings/reading/index.html": "/divination/reading/",
    "practice/hedge/readings/spread/index.html": "/divination/spread/",
    "practice/eclectic/sigil/index.html": "/sigil/"
  };
  for (const [file, to] of Object.entries(moved)) {
    const html = read(file);
    assert.ok(html.includes(`location.replace("${to}" + location.search + location.hash)`), file);
    assert.ok(html.includes(`url=${to}`), file);
  }
});

test("links point to the new pages, and they sit under Practice → Craft", () => {
  assert.match(read("practice/hedge/hedge.js"), /readings: "\/divination\/"/);
  assert.match(read("today/today.js"), /\/divination\/draw\/\?spread=daily/);
  assert.match(read("grimoire/js/ui/modals.js"), /\/sigil\/\?from=grimoire/);
  assert.match(read("practice/hub.js"), /url: "\/sigil\/"/);
  assert.match(read("js/my-sanctuary.js"), /href="\/divination\/"/);
  assert.equal(SiteNav.activeTab("/divination/draw/"), "practice");
  assert.equal(SiteNav.practiceSection("/divination/draw/"), "craft");
  assert.equal(SiteNav.activeTab("/sigil/"), "practice");
  assert.equal(SiteNav.practiceSection("/sigil/"), "craft");
});
