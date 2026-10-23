const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

function loadBundle(...names) {
  const context = { console, Date, Math, Intl, crypto: globalThis.crypto, encodeURIComponent, decodeURIComponent };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  for (const name of names) vm.runInContext(fs.readFileSync(path.join(root, `js/core/${name}.js`), "utf8"), context);
  return context.SaltCore;
}

const plain = (value) => JSON.parse(JSON.stringify(value));

test("the website's sigil maker uses the app's own logic", () => {
  const { sigil: S } = loadBundle("sigil");
  assert.equal(S.SIGILS, "eclectic.sigils");
  assert.equal(S.reduceStatement("I sleep deeply").kept, "ISLEPDY");
  assert.deepEqual(plain(S.letterArrangements("SLPDY").map((a) => a.id)), ["woven", "turned", "spine", "nested"]);
  assert.equal(S.KAMEAS.moon.length, 9);
  const trace = S.traceKamea("SLP", "saturn");
  assert.deepEqual(plain(trace.cells), [[2, 1], [1, 0], [1, 2]]);
  assert.ok(S.sigilSvg({ d: trace.d, weight: 2.6, ring: true }).includes("<circle"));
});

test("a sigil page from the website is the same rows the app writes", () => {
  const { sigil: S } = loadBundle("sigil");
  const sigil = S.readSigil({ method: "letters", intent: "I sleep deeply", letters: "SLPDY", d: "M20 20 L80 80", weight: 2.6, ring: true });
  const snapshot = { fetchedAt: "", books: [{ id: "b", title: "Book", created_at: null, updated_at: null }], sections: [{ id: "s", book_id: "b", title: "Sigils", sort_order: 0, created_at: null }], pages: [], blocks: [], links: [] };
  let n = 0;
  const { id, ops } = S.sigilPageOps(snapshot, { userId: "u", now: "2026-10-23T00:00:00Z" }, { sigil, sectionId: "s", dateText: "23 October 2026" }, () => `id${n++}`);
  assert.equal(ops[0].row.id, id);
  assert.equal(ops[0].row.section_id, "s");
  assert.equal(ops[0].row.page_type, "sigil");
  const image = ops.find((op) => op.row.block_type === "image").row;
  assert.equal(image.content, image.metadata.url);
  assert.deepEqual(plain(image.metadata.sigil), plain(sigil));
});

test("the altar carves a kept sigil into a candle and keeps it with the carving", () => {
  const { altar: A } = loadBundle("altar");
  const candle = { id: "c", type: "candle", label: "White candle", color: "white", imagePath: "" };
  const mark = A.sigil.markOf({ d: "M20 20 L80 80", ring: true });
  const carved = A.livingState.carveCandle(candle, "I sleep deeply", "2026-10-23T00:00:00Z", mark);
  const [carving] = A.livingState.carvingsOf(carved);
  assert.equal(carving.text, "I sleep deeply");
  assert.deepEqual(plain(A.livingState.carvingMark(carving)), { d: "M20 20 L80 80", ring: true });
  assert.equal(A.dressing.carvingLine(carving, 0), "The sigil for “I sleep deeply” is carved into the wax.");
  // Carvings the site doesn't know about are kept as they were.
  const state = JSON.parse(carved.livingState);
  state.candle.carvings.push({ text: "Rest", carvedAt: "x", newField: 1 });
  const again = A.livingState.carveCandle({ ...carved, livingState: JSON.stringify(state) }, "Hope", "2026-10-23T00:00:01Z");
  assert.deepEqual(plain(JSON.parse(again.livingState).candle.carvings.map((c) => c.newField ?? null)), [null, 1, null]);
});
