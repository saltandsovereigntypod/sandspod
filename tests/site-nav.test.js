const test = require("node:test");
const assert = require("node:assert/strict");
const SiteNav = require("../js/site-nav.js");

test("the main bar has the app's tabs: Practice holds the Grimoire and Rituals", () => {
  assert.deepEqual(SiteNav.TABS.map((tab) => tab.label), ["Today", "Altar", "Practice", "Coven", "More"]);
  assert.deepEqual(SiteNav.PRACTICE.map((tab) => tab.label), ["Grimoire", "Rituals"]);
});

test("each page lights up its own tab", () => {
  assert.equal(SiteNav.activeTab("/"), "podcast");
  assert.equal(SiteNav.activeTab("/index.html"), "podcast");
  assert.equal(SiteNav.activeTab("/blog/herbs/sage-history.html"), "podcast");
  assert.equal(SiteNav.activeTab("/altar/"), "altar");
  assert.equal(SiteNav.activeTab("/altar/index.html"), "altar");
  assert.equal(SiteNav.activeTab("/altar/", "?ritual=1"), "practice");
  assert.equal(SiteNav.activeTab("/grimoire/"), "practice");
  assert.equal(SiteNav.practiceSection("/grimoire/"), "grimoire");
  assert.equal(SiteNav.practiceSection("/grimoire/dreams/"), "grimoire");
  assert.equal(SiteNav.practiceSection("/rituals/premade/"), "rituals");
  assert.equal(SiteNav.practiceSection("/today/"), null);
  assert.equal(SiteNav.activeTab("/covens/"), "coven");
  assert.equal(SiteNav.activeTab("/covens/coven/", "?c=moon"), "coven");
  assert.equal(SiteNav.activeTab("/grimoire/community-grimoire.html"), "more");
  assert.equal(SiteNav.activeTab("/privacy.html"), "more");
  assert.equal(SiteNav.activeTab("/submit/"), "more");
  assert.equal(SiteNav.activeTab("/today/"), "today");
  assert.equal(SiteNav.activeTab("/today/holy/", "?ref=wheel-samhain"), "today");
  assert.equal(SiteNav.activeTab("/rituals/premade/"), "practice");
  assert.equal(SiteNav.activeTab("/rituals/journeys/"), "practice");
  assert.equal(SiteNav.activeTab("/practice/green/garden/"), "practice");
  assert.equal(SiteNav.activeTab("/help/"), "more");
  assert.equal(SiteNav.activeTab("/more/support/"), "more");
});

test("only the home page shows the podcast sections", () => {
  assert.equal(SiteNav.isHome("/"), true);
  assert.equal(SiteNav.isHome("/index.html"), true);
  assert.equal(SiteNav.isHome("/altar/"), false);
});

test("the altar can record everything on it in the Grimoire, not only a group", () => {
  const fs = require("node:fs");
  assert.match(fs.readFileSync("altar/js/ui/ui.js", "utf8"), /data-global-action="record-in-grimoire"/);
  assert.match(fs.readFileSync("altar/js/core/events.js", "utf8"), /case "record-in-grimoire":\s*sendAltarToGrimoire\(\)/);
  assert.match(fs.readFileSync("altar/js/features/groups.js", "utf8"), /function sendAltarToGrimoire\(\)/);
});

test("a recorded working builds the same page on the website as in the app", () => {
  const fs = require("node:fs");
  const vm = require("node:vm");
  const source = fs.readFileSync("grimoire/js/app.js", "utf8");
  const fn = source.slice(source.indexOf("function buildWorkingBlocks"), source.indexOf("// The Grimoire opens the altar's handoff"));
  const context = {};
  vm.runInNewContext(`${fn}; result = buildWorkingBlocks(
    [{ groupLabel: "Candles", content: "Red Candle Vigil Candle · Color: red · Form: vigil" }],
    { intention: "Protection", kind: "Spell", time: "Dusk", moonPhase: "Waning Gibbous", day: "Saturday", deities: "Hekate",
      extraItems: "Black salt", steps: "Cast the circle\\nLit the candle", words: "By the crossroads", signs: "  ", results: "Calm house" },
    "October 12, 2026");`, context);
  // The same expectation as app/tests/altar-instances.test.ts.
  assert.deepEqual(JSON.parse(JSON.stringify(context.result.map((b) => `${b.type}:${b.content}`))), [
    "heading:Date", "text:October 12, 2026 · Dusk",
    "heading:Type of Working", "text:Spell",
    "heading:Intention", "text:Protection",
    "heading:Timing", "correspondence:Moon phase: Waning Gibbous\nDay: Saturday",
    "heading:Deities and Spirits", "text:Hekate",
    "heading:Items from the Altar", "heading:Candles", "ingredient_list:Red Candle Vigil Candle · Color: red · Form: vigil",
    "heading:Also Used", "ingredient_list:Black salt",
    "heading:What I Did", "numbered_list:Cast the circle\nLit the candle",
    "heading:Words Spoken", "quote:By the crossroads",
    "heading:Results", "text:Calm house",
    "heading:Reflection", "text:"
  ]);
});
