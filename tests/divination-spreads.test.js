const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// The draws as the site loads them (js/core/divination.js and today.js set window.SaltCore).
global.window = globalThis;
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/divination.js"), "utf8"));
vm.runInThisContext(fs.readFileSync(path.join(__dirname, "../js/core/today.js"), "utf8"));
const Dv = globalThis.SaltCore.divination;
const T = globalThis.SaltCore.today;

test("the site's bundle carries the spreads, their layouts and spreads of your own", () => {
  for (const id of ["horseshoe", "tree-of-life", "astro-wheel", "year-ahead", "samhain", "nine-rune-cast", "five-staves", "nine-worlds"]) {
    const s = Dv.draw.spreadById(id);
    assert.ok(s, id);
    assert.equal(Dv.layout.layoutOf(s).slots.length, s.positions.length, id);
  }
  const cross = Dv.layout.layoutOf(Dv.draw.spreadById("celtic-cross"));
  assert.equal(cross.slots[1].rot, 90);
  assert.match(Dv.layout.diagramSvg(Dv.layout.diagramOf(cross)), /rotate\(90 /);
  assert.equal(Dv.custom.SPREADS_COLLECTION, "hedge.spreads");
});

test("a spread made on the website is the shape the app keeps, and lays out a kept reading again", () => {
  // As hedge.js keeps it: tidied, then added to `hedge.spreads`.
  const data = Dv.custom.tidyCustomSpread({ name: "The well", kind: "tarot", detail: "", shape: "circle", positions: [{ name: "Water", about: "" }, { name: "", about: "" }, { name: "Stone", about: "Below" }] });
  assert.deepEqual(data, {
    name: "The well",
    kind: "tarot",
    detail: "",
    shape: "circle",
    positions: [
      { name: "Water", about: "" },
      { name: "Card 2", about: "" },
      { name: "Stone", about: "Below" }
    ]
  });
  const mine = Dv.custom.customSpreads([{ id: "abc", data }]);
  const spread = Dv.draw.spreadById("custom-abc", mine);
  assert.equal(spread.label, "The well");
  assert.ok(Dv.draw.groupedSpreads("tarot", mine).some((g) => g.group.id === "yours" && g.spreads[0] === spread));
  const d = Dv.draw.drawSpread(spread, { reversals: false, blankRune: false });
  const reading = Dv.draw.readingFromDraw(spread, d, { now: new Date(2026, 9, 23) });
  assert.equal(Dv.draw.drawOfReading(reading, mine).spread.id, "custom-abc");
  assert.equal(Dv.layout.layoutOf(spread).slots.length, 3);
});

test("Today on the site can offer a spread for the time", () => {
  assert.equal(typeof T.seasonal.seasonalSpreads, "function");
  assert.ok(T.seasonal.seasonalSpreads(new Date(2026, 9, 30, 12)).some((s) => s.spread === "samhain"));
});

test("the spread page is wired to the editor view", () => {
  const html = fs.readFileSync(path.join(__dirname, "../practice/hedge/readings/spread/index.html"), "utf8");
  assert.match(html, /data-view="hedge-spread"/);
  assert.match(html, /\/js\/core\/divination\.js/);
  const hedge = fs.readFileSync(path.join(__dirname, "../practice/hedge/hedge.js"), "utf8");
  assert.match(hedge, /"hedge-spread": spreadEditView/);
});
