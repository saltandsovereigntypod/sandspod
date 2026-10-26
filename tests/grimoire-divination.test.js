// Tarot, runes and ogham in the Book of Shadows' Traditional Information:
// the app's pages for every card and stave (js/core/divination-library.js),
// the drop-downs and page (grimoire/js/ui/divination.js), the Sanctuary
// search, and "Read more" from the draw pages.
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
  vm.runInContext(read(`js/core/${name}.js`), sandbox);
  return sandbox.SaltCore[name];
}

test("the shared bundle has a page for every card, rune and stave", () => {
  const D = loadCore("divination-library");
  const groups = D.allDivinationGroups();
  assert.equal(groups.map((g) => g.label).join(), "Tarot,Runes,Ogham,Lenormand,Kipper");
  assert.equal(groups.map((g) => D.countOf(g)).join(), "78,25,20,36,36");
  assert.equal(groups[0].subgroups.map((s) => s.label).join(), "Major Arcana,Wands,Cups,Swords,Pentacles");
  for (const entry of D.allDivinationEntries()) {
    assert.equal(entry.words.length, 3, entry.name);
    const page = D.divinationPage(entry);
    assert.ok(page.sections.length >= 5, entry.name);
    for (const section of page.sections) assert.ok(section.text.trim(), `${entry.name}: ${section.label}`);
    if (entry.cardId) assert.ok(fs.existsSync(path.join(root, `assets/divination/tarot/${entry.cardId}.webp`)), entry.cardId);
  }
  assert.equal(D.parseDivinationParam("tarot/16-the-tower").name, "The Tower");
  assert.equal(D.parseDivinationParam("ogham/ngeadal").name, "nGéadal");
  assert.ok(D.divinationGroups("salmon").some((g) => g.kind === "ogham"));
});

test("the Book of Shadows loads it, and shows it inside Traditional Information", () => {
  const html = read("grimoire/index.html");
  const at = (src) => html.indexOf(src);
  assert.ok(at("../js/core/divination-library.js") > -1);
  assert.ok(at("js/ui/divination.js") > at("../js/core/divination-library.js"));
  assert.ok(at("js/ui/divination.js") < at("js/app.js"));
  assert.match(html, /family=Noto\+Sans\+Runic&family=Noto\+Sans\+Ogham/);

  const app = read("grimoire/js/app.js");
  assert.match(app, /await renderTraditionalLibraryShelf\(\);\n\s+\/\/ Tarot[^\n]*\n\s+if \(typeof renderDivinationShelf === "function"\) renderDivinationShelf\(\);/);
  assert.match(app, /parseDivinationParam\(requestedView\.get\("divination"\)\)/);
  assert.match(app, /lastView\?\.type === "divination"/);

  const shelf = read("grimoire/js/ui/divination.js");
  // Built in: saves nothing, and only shows where the Traditional Information shelf is.
  assert.doesNotMatch(shelf, /\.from\(|supabase|Library\.updateEntity|localStorage/);
  assert.match(shelf, /\[data-traditional-library-shelf\] \[data-traditional-library-list\]/);
  assert.match(shelf, /shouldShowTraditionalLibrary/);
  const { renderDivinationShelf, renderDivinationPage } = require("../grimoire/js/ui/divination.js");
  assert.equal(typeof renderDivinationShelf, "function");
  assert.equal(typeof renderDivinationPage, "function");
});

test("the Sanctuary search finds cards and staves, and opens their pages", () => {
  const S = require("../js/sanctuary-search.js");
  const D = loadCore("divination-library");
  assert.equal(S.GROUP_LABELS.divination, "Divination");
  const results = S.createDivinationResults(D);
  assert.equal(results.length, 195);
  S.buildIndex({ divination: results });
  const tower = S.search("the tower")[0];
  assert.equal(tower.title, "The Tower");
  assert.equal(tower.href, "/grimoire/?divination=tarot/16-the-tower");
  assert.equal(S.search("aurochs")[0].title, "Uruz");
  assert.equal(S.search("hazel")[0].title, "Coll");
  assert.deepEqual(S.createDivinationResults(null), []);
  const ui = read("js/sanctuary-search-ui.js");
  assert.match(ui, /divination: divinationRecords\(\)/);
  assert.match(ui, /library_traditional_enabled === false\) return \[\]/);
});

test("a drawn card's meaning links to its page, unless Traditional Information is off", () => {
  const Dv = loadCore("divination");
  assert.equal(Dv.links.readMoreHref("The Tower"), "/grimoire/?divination=tarot/16-the-tower");
  assert.equal(Dv.links.readMoreHref("Fehu"), "/grimoire/?divination=runes/fehu");
  assert.equal(Dv.links.readMoreHref("Úr"), "/grimoire/?divination=ogham/ur");
  assert.equal(Dv.links.readMoreHref("Nobody"), null);
  const hedge = read("practice/hedge/hedge.js");
  assert.match(hedge, /settings\.library_traditional_enabled !== false && !m\.own \? Dv\.links\?\.readMoreHref\(m\.name\) : null/);
  assert.match(hedge, />Read more<\/a>/);
});
