const test = require("node:test");
const assert = require("node:assert/strict");
const SiteNav = require("../js/site-nav.js");

test("the main bar has the app's tabs plus Podcast", () => {
  assert.deepEqual(SiteNav.TABS.map((tab) => tab.label), ["Today", "Altar", "Grimoire", "Rituals", "Podcast", "More"]);
});

test("each page lights up its own tab", () => {
  assert.equal(SiteNav.activeTab("/"), "podcast");
  assert.equal(SiteNav.activeTab("/index.html"), "podcast");
  assert.equal(SiteNav.activeTab("/blog/herbs/sage-history.html"), "podcast");
  assert.equal(SiteNav.activeTab("/altar/"), "altar");
  assert.equal(SiteNav.activeTab("/altar/index.html"), "altar");
  assert.equal(SiteNav.activeTab("/altar/", "?ritual=1"), "rituals");
  assert.equal(SiteNav.activeTab("/grimoire/"), "grimoire");
  assert.equal(SiteNav.activeTab("/grimoire/community-grimoire.html"), "more");
  assert.equal(SiteNav.activeTab("/privacy.html"), "more");
  assert.equal(SiteNav.activeTab("/submit/"), "more");
});

test("only the home page shows the podcast sections", () => {
  assert.equal(SiteNav.isHome("/"), true);
  assert.equal(SiteNav.isHome("/index.html"), true);
  assert.equal(SiteNav.isHome("/altar/"), false);
});
