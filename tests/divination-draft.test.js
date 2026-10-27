const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// The draw not yet kept, as the site loads it (js/core/divination.js `draft`, the app's drawDraft.ts).
global.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/divination.js"), "utf8"));
const Dv = globalThis.SaltCore.divination;
const DF = Dv.draft;

const now = new Date(2026, 9, 27, 15, 0);
const options = { reversals: true, blankRune: false };
let x = 0.21;
const random = () => (x = (x * 9301 + 0.49297) % 1);

function state(over = {}) {
  return {
    kind: "tarot",
    spread: "past-present-future",
    ownDeck: null,
    deck: "rws",
    question: "",
    link: null,
    options,
    byHand: false,
    placed: [],
    draw: null,
    revealed: [],
    selected: null,
    interpretation: "",
    lookBack: null,
    ...over
  };
}

test("the site keeps a draw in localStorage's shape under the app's key", () => {
  assert.equal(DF.DRAW_DRAFT_KEY, "divination.drawDraft.v1");
  assert.equal(DF.serializeDraft(state(), now), null);
  const spread = Dv.draw.spreadById("past-present-future");
  const d = Dv.draw.drawSpread(spread, options, random);
  const text = DF.serializeDraft(state({ draw: d, revealed: [true, false, false], selected: 0, question: "The move?" }), now);
  const back = DF.parseDraft(text);
  assert.deepEqual(back.draw, d);
  assert.deepEqual(back.revealed, [true, false, false]);
  assert.equal(back.selected, 0);
  assert.equal(back.question, "The move?");
  const found = DF.restoreDraft(back, { custom: [], decks: [] });
  assert.equal(found.spread.id, "past-present-future");
  assert.equal(DF.draftSummary(found, new Date(now.getTime() + 25 * 60000)), `${spread.label} · 3 cards drawn, 1 turned over · 25 minutes ago`);
});

test("a stale, broken or orphaned draft is not offered", () => {
  const spread = Dv.draw.spreadById("past-present-future");
  const d = Dv.draw.drawSpread(spread, options, random);
  const back = DF.parseDraft(DF.serializeDraft(state({ draw: d, revealed: [false, false, false] }), now));
  assert.equal(DF.isFreshDraft(back, new Date(now.getTime() + 8 * 86400000)), false);
  assert.equal(DF.isFreshDraft(back, new Date(now.getTime() + 86400000)), true);
  assert.equal(DF.parseDraft("{oops"), null);
  assert.equal(DF.restoreDraft({ ...back, draw: { ...d, items: [{ name: "Nobody", reversed: false }, ...d.items.slice(1)] } }, {}), null);
  assert.equal(DF.restoreDraft({ ...back, kind: "oracle", ownDeck: "gone" }, { decks: [] }), null);
});

test("opened for a particular draw, the page offers nothing back", () => {
  assert.equal(DF.opensOwnDraw(Object.fromEntries(new URLSearchParams(""))), false);
  assert.equal(DF.opensOwnDraw(Object.fromEntries(new URLSearchParams("?spread=daily"))), true);
  assert.equal(DF.opensOwnDraw(Object.fromEntries(new URLSearchParams("?dream=abc&title=Flood"))), true);
});

test("the draw page saves, offers back and clears the draft", () => {
  const src = fs.readFileSync(path.join(__dirname, "../practice/hedge/hedge.js"), "utf8");
  assert.match(src, /Pick up where you left off\?/);
  assert.match(src, /"draft-carry-on"\(\)/);
  assert.match(src, /"draft-let-go"\(\)/);
  assert.match(src, /drawDraft\.kept = true;\s*if \(DF\) draftStore\.clear\(\);/);
  assert.doesNotMatch(src.slice(src.indexOf("Pick up where")), /!\s*["`]/, "no exclamation marks");
});
