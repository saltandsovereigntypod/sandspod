// Placing several things from the cabinet without it closing, and dressing a
// candle with several things at once: the website uses the app's own logic
// (js/core/altar.js) for where each new thing is set down and what goes on the
// candle, and keeps the cabinet open until Done.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
global.window = global;
vm.runInThisContext(fs.readFileSync(path.join(root, "js/traditional-library.js"), "utf8"));
vm.runInThisContext(fs.readFileSync(path.join(root, "js/core/altar.js"), "utf8"));
const A = global.SaltCore.altar;

test("things placed one after another step aside instead of stacking", () => {
  const taken = [];
  for (let i = 0; i < 6; i += 1) {
    const next = A.cabinet.nudgedCenter({ cx: 0.5, cy: 0.5 }, taken);
    assert.ok(!taken.some((t) => t.cx === next.cx && t.cy === next.cy));
    taken.push(next);
  }
  assert.deepEqual(taken[0], { cx: 0.5, cy: 0.5 });
});

test("dress & anoint takes several oils and herbs, and dress from the altar several ingredients", () => {
  const list = A.dressing.chosenDressings({ oils: ["Rose", "Myrrh"], typedOil: "", herbs: ["Rosemary"] }, "draw", "2026-10-28T20:00:00.000Z");
  assert.deepEqual(list.map((d) => d.label), ["Rose oil", "Myrrh oil", "Rosemary"]);
  assert.equal(typeof A.livingState.dressCandleWithAll, "function");
});

test("placing from the cabinet no longer closes it; Undo and Done sit at its foot", () => {
  const events = fs.readFileSync(path.join(root, "altar/js/core/events.js"), "utf8");
  const activate = events.slice(events.indexOf("async activate("), events.indexOf("document.addEventListener(\"click\""));
  assert.ok(!activate.includes("closeAltarCabinetOverlay()"), "placing keeps the cabinet open");
  assert.ok(activate.includes("noteCabinetPlacement("));
  const html = fs.readFileSync(path.join(root, "altar/index.html"), "utf8");
  assert.match(html, /data-cabinet-undo/);
  assert.match(html, /altar-cabinet-done" data-close-cabinet-overlay>Done</);
});
