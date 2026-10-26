// The tarot decks on the website: the shared bundles carry them, every card
// of every deck is there, the setting is in the settings form (so saving the
// form keeps it), and the draw, a reading's page and the Book of Shadows
// show the deck chosen or drawn with.
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

test("both divination bundles carry the decks, and every card of every deck is on the site", () => {
  const Dv = loadCore("divination");
  const Lib = loadCore("divination-library");
  assert.deepEqual(Array.from(Dv.decks.TAROT_DECKS, (d) => d.id), ["rws", "marseille", "sola-busca"]);
  assert.deepEqual(Array.from(Lib.decks.TAROT_DECKS, (d) => d.id), ["rws", "marseille", "sola-busca"]);
  for (const deck of Dv.decks.TAROT_DECKS) {
    for (const card of Dv.tarot.TAROT_DECK) {
      const file = path.join(root, Dv.decks.deckImagePath(deck.id, card.id));
      assert.ok(fs.existsSync(file), `${deck.id} ${card.id}`);
      assert.ok(fs.statSync(file).size < 200 * 1024, `${deck.id} ${card.id} is too big for the web`);
    }
  }
  assert.equal(Dv.decks.deckCardTitle("marseille", "08-strength"), "XI · La Force");
});

test("a draw keeps its deck, and the reading's page shows that deck", () => {
  const Dv = loadCore("divination");
  const R = loadCore("practice-a").readings;
  const spread = Dv.draw.spreadById("daily");
  const reading = Dv.draw.readingFromDraw(spread, { spread: "daily", items: [{ name: "The Star", reversed: false }] }, { now: new Date(2026, 9, 26), deck: "sola-busca" });
  const back = R.normalizeReading(JSON.parse(JSON.stringify(reading)));
  assert.equal(back.deck, "sola-busca");
  assert.equal(Dv.decks.deckOfReading(back), "sola-busca");
  assert.equal(Dv.decks.deckOfReading(R.normalizeReading({ ...back, deck: "" })), "rws");

  const hedge = read("practice/hedge/hedge.js");
  assert.match(hedge, /Dv\.decks\.deckImagePath\(/);
  assert.match(hedge, /deck: drawDeck\(\)/);
  assert.match(hedge, /Dv\.decks\.deckOfReading\(r\)/);
  assert.match(hedge, /"draw-deck"\(el\)/);
  assert.doesNotMatch(hedge, /\/assets\/divination\/tarot\//);
});

test("the deck is a setting in the form (saving the form keeps it), under Divination", () => {
  const sanctuary = read("js/my-sanctuary.js");
  const select = sanctuary.match(/<select name="tarot_deck">([\s\S]*?)<\/select>/);
  assert.ok(select);
  assert.deepEqual([...select[1].matchAll(/value="([^"]+)"/g)].map((m) => m[1]), ["rws", "marseille", "sola-busca"]);
  const context = { window: { addEventListener() {} }, document: { addEventListener() {} } };
  vm.runInNewContext(`${read("js/my-settings.js")}\nthis.defaults = getDefaultMySettings();`, context);
  assert.equal(context.defaults.tarot_deck, "rws");
  assert.match(read("js/settings-view.js"), /name === "tarot_deck" \? "divination"/);
});

test("the Book of Shadows shows a card in your deck, the others a tap away", () => {
  const shelf = read("grimoire/js/ui/divination.js");
  assert.match(shelf, /core\.decks\.deckImagePath\(/);
  assert.match(shelf, /data-divination-deck/);
  assert.doesNotMatch(shelf, /\/assets\/divination\/tarot\//);
});
