const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Community Submissions uses the shared responsive navbar and safe script order", () => {
  const html = read("admin/submissions/index.html");
  for (const label of ["About", "Podcast", "Books", "Blog", "Contact", "Sanctuary"]) assert.match(html, new RegExp(`>${label}<`));
  assert.match(html, /class="nav-toggle"[^>]+aria-controls="nav-menu"/);
  assert.ok(html.indexOf("../../js/environment.js") < html.indexOf("../../js/supabase-config.js"));
  assert.match(html, /href="\.\.\/\.\.\/index\.html#about"/);
});

test("shared buttons define tiny, pill, icon, active, disabled, focus, and reduced-motion states", () => {
  const css = read("css/styles.css");
  for (const selector of [".button--tiny", ".button--pill", ".button--icon", ".button--image-action", ".button:focus-visible", "[aria-pressed=\"true\"]", ":disabled", "prefers-reduced-motion"]) assert.ok(css.includes(selector), selector);
});

test("Sanctuary destinations remain complete, compact, and moderator-conditional", () => {
  const source = read("js/living-sanctuary.js");
  for (const label of ["My Journey", "Digital Altar", "Book of Shadows", "Community Grimoire", "Offer to the Sanctuary", "My Submissions", "Community Submissions", "Settings"]) assert.ok(source.includes(`>${label}<`), label);
  assert.match(source, /moderationHref \? `<a class="button button--pill"/);
  assert.doesNotMatch(source.match(/<nav class="living-sanctuary-nav"[\s\S]+?<\/nav>/)?.[0] || "", />Apothecary<|>Rituals?</);
});

test("missing Cabinet form actions retain upload identity without broken images", () => {
  const cabinet = read("altar/js/features/cabinet.js");
  const custom = read("altar/js/features/custom-cabinet-items.js");
  assert.match(cabinet, /button--image-action cabinet-missing-form-action[^>]+data-upload-cabinet-image[^>]+data-form-label/);
  assert.doesNotMatch(cabinet.match(/function renderMissingFormAction[\s\S]+?\n}/)?.[0] || "", /<img/);
  assert.match(custom, /button--image-action[\s\S]+\$\{existing \? "Manage" : "Add"} \$\{formLabel} Image[\s\S]+name="form_image_/);
});

test("Altar header is calm: title, a short line, Personal | Coven, the picker and a compact To tend", () => {
  const html = read("altar/index.html");
  const hero = html.match(/<section class="altar-hero"[\s\S]+?<\/section>/)?.[0] || "";
  assert.match(hero, /data-altar-scope[\s\S]+data-altar-picker[\s\S]+altar-hero__tend/);
  assert.doesNotMatch(hero, /data-open-cabinet-overlay|data-open-apothecary-overlay|data-tool-guide|data-open-sanctuary-search/);
  // The old companion "−" button no longer sits in the header.
  assert.doesNotMatch(read("altar/js/ui/ui.js"), /altar-companion-toggle/);
});
