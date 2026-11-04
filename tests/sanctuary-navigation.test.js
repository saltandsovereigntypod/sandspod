const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("Book of Shadows leaves its menu to the shared side bar", () => {
  const html = fs.readFileSync("grimoire/index.html", "utf8");
  // The menu (js/site-nav.js) opens the Sanctuary from Today and More; the page keeps no launcher of its own.
  assert.doesNotMatch(html, /data-my-sanctuary-open|class="site-header"/);
  assert.match(html, /<script src="\/js\/site-nav\.js"><\/script>/);
  assert.doesNotMatch(html, /data-my-sanctuary-view-button="journey"/);
});

test("Sanctuary and moderation use one shared moderator permission path", () => {
  const auth = fs.readFileSync("js/auth.js", "utf8");
  const sanctuary = fs.readFileSync("js/living-sanctuary.js", "utf8");
  const moderation = fs.readFileSync("js/admin-submissions.js", "utf8");
  assert.match(auth, /isSaltCommunityModerator/);
  assert.match(sanctuary, /getSaltCommunityModeratorState/);
  assert.match(moderation, /getSaltCommunityModeratorState/);
  assert.doesNotMatch(sanctuary, /isSanctuaryAdmin/);
});

test("community and submission pages use the shared current Sanctuary scripts", () => {
  for (const path of ["grimoire/community-grimoire.html", "submit/index.html"]) {
    const html = fs.readFileSync(path, "utf8");
    assert.doesNotMatch(html, />\s*My Sanctuary\s*</);
    assert.match(html, /js\/living-sanctuary\.js/);
    assert.equal((html.match(/js\/my-sanctuary\.js/g) || []).length, 1);
  }
});
