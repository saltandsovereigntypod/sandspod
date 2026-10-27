// The website's altar offers what's on it and writes it down for the Grimoire
// with the app's own logic (js/core/altar.js offerFromAltar and altarRecord),
// so an offering or a record made on either side has the same shape.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function core() {
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.runInNewContext(fs.readFileSync("js/core/altar.js", "utf8"), sandbox);
  return sandbox.SaltCore.altar;
}

const placed = "2026-10-20T09:00:00.000Z";
const living = JSON.stringify({ version: 1, createdAt: placed, updatedAt: placed });
const obj = (o) => ({ leftPercent: 0.5, topPercent: 0.5, sizePercent: 0.09, zIndex: "3", livingState: living, ...o });
const apollo = obj({ type: "deity", deity: "apollo", label: "Apollo Statue", altarObjectId: "apollo" });
const comb = obj({ type: "offering", form: "honeycomb", label: "Honeycomb", imagePath: "../assets/altar/objects/offerings/honeycomb/honeycomb.png", altarObjectId: "comb" });

test("a honeycomb on the altar can be chosen and offered to Apollo by name", () => {
  const A = core();
  const gifts = A.offerFromAltar.altarGifts([apollo, comb], apollo);
  assert.equal(gifts.length, 1);
  assert.equal(gifts[0].offeringType, "Food");
  const input = { types: ["food"], supports: [], customItems: "", intention: "", message: "", status: "offered", customStatus: "", response: "", responseNotes: "", occurredAt: placed, id: "o1" };
  const { objects, line } = A.offerFromAltar.giveFromAltar([apollo, comb], 0, input, gifts, { atFeet: false }, placed);
  assert.equal(line, "Honeycomb, offered to Apollo.");
  const offering = A.devotion.offeringsOf(objects[0], placed)[0];
  assert.equal(offering.items[0].label, "Honeycomb");
  assert.equal(offering.items[0].fromAltar, true);
  assert.equal(offering.status, "offered");
  assert.equal(A.offerFromAltar.offeredToOf(objects[1]).name, "Apollo");
});

test("the altar's record lists everything under its kind, with the petitions", () => {
  const A = core();
  const petition = A.petitions.newPetition("alt1", { title: "Steady work", words: "Let the right work find me.", intention: "", timing: "now" }, new Date(placed));
  const blocks = A.altarRecord.altarRecordBlocks([apollo, comb], { now: new Date("2026-10-27T12:00:00Z"), altarId: "alt1", petitions: [{ id: "p1", data: petition }], tendings: [], since: "", formatDate: (iso) => iso.slice(0, 10) });
  assert.deepEqual([...blocks.filter((b) => b.type === "heading").map((b) => b.content)], ["Deities and Statues", "Offerings", "Petitions"]);
  assert.deepEqual({ ...blocks.at(-1) }, { type: "quote", content: "Let the right work find me." });
});

test("the Grimoire puts the altar's record under Items from the Altar", () => {
  const source = fs.readFileSync("grimoire/js/app.js", "utf8");
  const fn = source.slice(source.indexOf("function buildWorkingBlocks"), source.indexOf("// The Grimoire opens the altar's handoff"));
  const sandbox = {};
  vm.runInNewContext(`${fn}; result = buildWorkingBlocks([{ groupLabel: "Candles", content: "Red" }], "", "Oct 27", [{ type: "heading", content: "Petitions" }, { type: "quote", content: "Words" }]);`, sandbox);
  const at = sandbox.result.findIndex((b) => b.content === "Items from the Altar");
  assert.deepEqual(JSON.parse(JSON.stringify(sandbox.result.slice(at + 1, at + 3))), [{ type: "heading", content: "Petitions" }, { type: "quote", content: "Words" }]);
  assert.ok(!sandbox.result.some((b) => b.content === "Candles"));
});
