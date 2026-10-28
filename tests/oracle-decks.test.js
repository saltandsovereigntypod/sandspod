const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Lenormand, Kipper and decks of your own on the website: the same logic as
// the app (js/core/divination.js), the same saved shapes, and the pages wired.
global.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/divination.js"), "utf8"));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/traditional-library.js"), "utf8"));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/guides.js"), "utf8"));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/divination-library.js"), "utf8"));
const Dv = globalThis.SaltCore.divination;
const G = globalThis.SaltCore.guides;
const L = globalThis.SaltCore["divination-library"];
const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("the site's bundle carries Lenormand, Kipper, their spreads and the pair helper", () => {
  assert.equal(Dv.lenormand.LENORMAND.length, 36);
  assert.equal(Dv.kipper.KIPPER.length, 36);
  assert.deepEqual(Dv.draw.spreadsFor("lenormand").map((s) => s.positions.length), [1, 2, 3, 5, 9, 36]);
  assert.deepEqual(Dv.draw.spreadsFor("kipper").map((s) => s.positions.length), [3, 9, 36]);
  assert.equal(Dv.layout.layoutOf(Dv.draw.spreadById("lenormand-grand-tableau")).slots.length, 36);
  assert.equal(Dv.pairs.readPair("Ship", "Rider").title, "Ship + Rider");
  for (const c of Dv.lenormand.LENORMAND) assert.ok(fs.existsSync(path.join(root, `assets/divination/lenormand/${c.id}.webp`)), c.id);
});

test("a deck made on the website is the shape the app keeps, and a draw from it lays out again", () => {
  // As the deck page keeps it: tidied, then added to `hedge.oracleDecks`.
  assert.equal(Dv.oracleDecks.DECKS_COLLECTION, "hedge.oracleDecks");
  const imported = Dv.oracleDecks.importCards(Dv.oracleDecks.blankOwnDeck(), "Owl — wisdom — See in the dark.\nFox — Be clever.\nHare");
  const data = Dv.oracleDecks.tidyOwnDeck({ ...imported.deck, name: "Animals" });
  assert.deepEqual(
    data.cards.map(({ name, keywords, meaning }) => ({ name, keywords, meaning })),
    [
      { name: "Owl", keywords: "wisdom", meaning: "See in the dark." },
      { name: "Fox", keywords: "", meaning: "Be clever." },
      { name: "Hare", keywords: "", meaning: "" }
    ]
  );
  assert.deepEqual(Object.keys(data).sort(), ["cards", "cover", "coverPath", "detail", "name", "reversals"]);
  assert.deepEqual(Object.keys(data.cards[0]).sort(), ["id", "keywords", "meaning", "name", "photo", "photoPath", "reversed"]);
  const decks = Dv.oracleDecks.ownDecks([{ id: "d1", data }]);
  const spread = Dv.draw.ownDeckSpreadById("past-present-future");
  const d = Dv.draw.drawSpread(spread, { reversals: false, blankRune: false }, undefined, decks[0].data);
  const reading = Dv.draw.readingFromDraw(spread, d, { now: new Date(2026, 9, 26), ownDeck: decks[0], byHand: true });
  assert.equal(reading.method, "oracle");
  assert.equal(reading.deck, "d1");
  assert.match(reading.cameUp.split("\n")[0], /^Past, present, future · Animals · pulled by hand$/);
  const back = Dv.draw.drawOfReading(reading, [], decks);
  assert.deepEqual(back.draw.items, d.items);
  assert.equal(back.deck.id, "d1");
});

test("the draw kinds can be hidden from Settings on the site, with the app's setting", () => {
  const K = G.divinationKinds;
  assert.equal(K.HIDDEN_KINDS_KEY, "divination_hidden_kinds");
  assert.equal(K.withKindShown({}, "kipper", false), "kipper");
  assert.deepEqual(Dv.kinds.shownKinds(Dv.draw.KINDS, { divination_hidden_kinds: "kipper" }).map((k) => k.id), ["tarot", "runes", "ogham", "lenormand", "oracle"]);
  const more = read("js/settings-more.js");
  assert.match(more, /data-draw-kind=/);
  assert.match(more, /K\.withKindShown\(settings, t\.dataset\.drawKind, t\.checked\)/);
});

test("Lenormand and Kipper pages in the Book of Shadows", () => {
  assert.equal(L.findDivination("lenormand", "01-rider").name, "Rider");
  assert.equal(L.readMoreHref("Main Person (Man)"), "/grimoire/?divination=kipper/01-main-person-man");
  const ui = read("grimoire/js/ui/divination.js");
  assert.match(ui, /\/assets\/divination\/lenormand\//);
  assert.match(ui, /divination-thumb--kipper/);
});

test("the pages are wired: the draw and reading pages load oracle.js before hedge.js, and the deck pages have their views", () => {
  for (const page of ["divination/draw/index.html", "divination/reading/index.html"]) {
    const html = read(page);
    assert.ok(html.indexOf("/practice/hedge/oracle.js") > -1 && html.indexOf("/practice/hedge/oracle.js") < html.indexOf("/practice/hedge/hedge.js"), page);
  }
  assert.match(read("divination/decks/index.html"), /data-view="oracle-decks"/);
  assert.match(read("divination/decks/edit/index.html"), /data-view="oracle-deck-edit"/);
  for (const page of ["divination/decks/index.html", "divination/decks/edit/index.html"]) {
    const html = read(page);
    assert.match(html, /\/js\/core\/divination\.js/);
    assert.match(html, /\/practice\/hedge\/oracle\.js/);
  }
  const hedge = read("practice/hedge/hedge.js");
  for (const act of ['"draw-own-deck"', '"draw-mode"', '"pull-put"', '"pull-lay"']) assert.ok(hedge.includes(act), act);
  assert.match(hedge, /drawOfReading\(r, custom\(\), myDecks\)/);
  assert.match(hedge, /ownDeck: currentDeck\(\),\n\s+byHand: drawState\.byHand/);
  const oracle = read("practice/hedge/oracle.js");
  assert.match(oracle, /from\("user-assets"\)/);
  assert.match(oracle, /D\.DECK_PHOTO_FOLDER/);
});

test("oracle.js draws Lenormand, Kipper and your own cards' faces", () => {
  // A small stand-in for the page, enough to load the faces.
  const kit = { esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`), root: () => null, card: (x) => x, muted: (x) => x, p: (x) => x };
  globalThis.PracticeKit = kit;
  globalThis.location = { search: "" };
  vm.runInThisContext(read("practice/hedge/oracle.js"));
  const O = globalThis.PracticeOracle;
  assert.match(O.frontHtml("lenormand", { name: "Rider", reversed: false }, null), /lenormand\/01-rider\.webp/);
  assert.match(O.frontHtml("kipper", { name: "The House", reversed: false }, null), /Haus/);
  const deck = Dv.oracleDecks.tidyOwnDeck({ ...Dv.oracleDecks.blankOwnDeck(), cards: [{ id: "a", name: "Owl", photo: "javascript:x" }] });
  const own = O.frontHtml("oracle", { name: "Owl", reversed: true }, deck);
  assert.doesNotMatch(own, /javascript/);
  assert.match(own, /dv-card--reversed/);
  assert.equal(O.frontHtml("tarot", { name: "The Fool", reversed: false }, null), null);
});
