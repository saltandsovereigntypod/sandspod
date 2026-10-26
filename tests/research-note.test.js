// A note on our research, on the website: the same words and mailto as the
// app (js/core/research.js is built from app/src/lib/research.ts), the
// "Send a note" footer on every researched page type, the Living Library's
// first-visit card, and the full note at /more/research/.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/research.js"));
const R = global.SaltCore.research;
const store = new Map();
global.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
};
vm.runInThisContext(read("js/research-note.js"));
const N = global.ResearchNote;

const subjectOf = (html) => decodeURIComponent(html.match(/subject=([^&"]+)/)[1]);

test("the website's words are the app's own", () => {
  const app = read("app/src/lib/research.ts");
  assert.ok(app.includes(`'${R.RESEARCH_LINE}'`));
  assert.ok(app.includes(`'${R.RESEARCH_CARD}'`));
  assert.ok(app.includes(`'${R.RESEARCH_NOTE[0]}'`));
  assert.equal(R.SUPPORT_EMAIL, "ashley.p@saltandsovereignty.com");
  assert.ok(read("index.html").includes(`mailto:${R.SUPPORT_EMAIL}`), "the same address as the home page's Contact");
});

test("the footer's Send a note names the page, as the app's does", () => {
  const html = N.footerHtml("Hekate", "Deity");
  assert.match(html, /data-research-note/);
  assert.ok(html.includes(R.RESEARCH_LINE));
  assert.ok(html.includes(`href="mailto:${R.SUPPORT_EMAIL}?subject=`));
  assert.equal(subjectOf(html), "Note on: Hekate");
  assert.equal(N.mailto("The Fool"), R.researchNoteUrl("The Fool", null));
  assert.ok(html.includes('href="/more/research/"'));
  assert.equal(subjectOf(N.footerHtml("Closed & living traditions")), "Note on: Closed & living traditions");
});

test("the Living Library's card shows once, then stays away", () => {
  store.clear();
  assert.match(N.cardHtml(), /data-research-card/);
  assert.match(N.cardHtml(), /href="\/more\/research\/"/);
  global.localStorage.setItem(R.RESEARCH_CARD_SEEN_KEY, "1");
  assert.equal(N.cardHtml(), "");
  store.clear();
  assert.match(read("library/library.js"), /ResearchNote\.cardHtml\(\)/);
  assert.match(read("library/library.js"), /ResearchNote\?\.bindCard\(root\)/);
});

test("the full note has its page, linked from More and About", () => {
  const page = read("more/research/index.html");
  assert.match(page, /js\/core\/research\.js[\s\S]*js\/research-note\.js[\s\S]*more\/research\/research\.js/);
  assert.match(N.noteHtml(), new RegExp(`subject=${encodeURIComponent("Note on: our research")}`));
  assert.match(read("js/my-sanctuary.js"), /href="\/more\/research\/">[^<]*A note on our research/);
  assert.match(read("index.html"), /id="about"[\s\S]*href="\/more\/research\/">A note on our research/);
  assert.equal(require("../help/web-notes.js").siteHref("/more/research"), "/more/research/");
});

test("every researched page type ends with the Send a note footer", () => {
  const pages = {
    "library/entry/entry.js": ["library/entry/index.html", /footerHtml\(model\.name/], // herbs, crystals, deities, candles…
    "grimoire/js/app.js": ["grimoire/index.html", /footerHtml\(entity\.name/], // the same entries in the Book of Shadows
    "grimoire/js/ui/divination.js": ["grimoire/index.html", /footerHtml\(entry\.name/], // tarot, runes, ogham
    "today/holy/holy.js": ["today/holy/index.html", /footerHtml\(page\.title/], // holidays and festivals
    "rituals/journeys/journeys.js": ["rituals/journeys/index.html", /footerHtml\(journey\.title/], // dedication journeys
    "rituals/journeys/patron/patron.js": ["rituals/journeys/patron/index.html", /footerHtml\(guide\.title/], // patron deities
    "library/closed/closed.js": ["library/closed/index.html", /footerHtml\(tradition\.name[\s\S]*|footerHtml\(TITLE/],
  };
  for (const [script, [html, pattern]] of Object.entries(pages)) {
    assert.match(read(script), pattern, script);
    const page = read(html);
    const core = page.indexOf("js/core/research.js");
    const helper = page.indexOf("js/research-note.js");
    const own = page.lastIndexOf(script.split("/").pop());
    assert.ok(core > 0 && helper > core && own > helper, `${html} loads the note before ${script}`);
  }
  assert.equal((read("library/closed/closed.js").match(/footerHtml\(/g) || []).length, 2, "the guide and each tradition");
});

test("How to has the correction topic, with the website's note", () => {
  const notes = require("../help/web-notes.js");
  assert.ok(notes.TOPIC_NOTES["send-a-correction"]);
  assert.match(read("js/core/guides.js"), /send-a-correction/);
});
