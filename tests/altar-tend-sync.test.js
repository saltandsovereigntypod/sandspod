const test = require("node:test");
const assert = require("node:assert/strict");
const Sync = require("../altar/js/features/altar-tend-sync.js");

const saved = {
  name: "Hearth",
  background: "wood",
  objects: [
    { altarObjectId: "a", type: "offering", leftPercent: 0.2, topPercent: 0.5, scale: "1", livingState: '{"offering":{"status":"stale"}}', lit: "false" },
    { altarObjectId: "b", type: "candle", leftPercent: 0.6, topPercent: 0.4, scale: "1", livingState: "{}", lit: "false" }
  ]
};

test("tending is merged into saved objects by id, layout untouched", () => {
  const draft = [
    // moved and resized in the draft, and refreshed
    { altarObjectId: "a", type: "offering", leftPercent: 0.9, topPercent: 0.1, scale: "2", livingState: '{"offering":{"status":"fresh"}}', lit: "false" },
    // lit, also moved
    { altarObjectId: "b", type: "candle", leftPercent: 0.1, topPercent: 0.1, scale: "1", livingState: '{"candle":{"status":"burning"}}', lit: "true" },
    // new in the draft: not published by tending
    { altarObjectId: "c", type: "herb", livingState: "{}", lit: "false" }
  ];
  const { data, mergedIds } = Sync.mergeTending(saved, draft);
  assert.deepEqual(mergedIds, ["a", "b"]);
  assert.equal(data.objects.length, 2);
  assert.equal(data.objects[0].livingState, '{"offering":{"status":"fresh"}}');
  assert.equal(data.objects[0].leftPercent, 0.2);
  assert.equal(data.objects[0].topPercent, 0.5);
  assert.equal(data.objects[0].scale, "1");
  assert.equal(data.objects[1].lit, "true");
  assert.equal(data.objects[1].leftPercent, 0.6);
  assert.equal(data.name, "Hearth");
  assert.equal(data.background, "wood");
  // the saved row itself is not mutated
  assert.equal(saved.objects[0].livingState, '{"offering":{"status":"stale"}}');
});

test("onlyIds limits the merge to the tended objects", () => {
  const draft = saved.objects.map((o) => ({ ...o, livingState: '{"x":1}' }));
  const { data, mergedIds } = Sync.mergeTending(saved, draft, ["b"]);
  assert.deepEqual(mergedIds, ["b"]);
  assert.equal(data.objects[0].livingState, saved.objects[0].livingState);
  assert.equal(data.objects[1].livingState, '{"x":1}');
});

test("hasLayoutChanges ignores tending but notices moves and new things", () => {
  const tendedOnly = { ...saved, objects: saved.objects.map((o) => ({ ...o, livingState: '{"y":2}', lit: "true" })) };
  assert.equal(Sync.hasLayoutChanges(saved, tendedOnly), false);
  const moved = { ...saved, objects: [{ ...saved.objects[0], leftPercent: 0.7 }, saved.objects[1]] };
  assert.equal(Sync.hasLayoutChanges(saved, moved), true);
  const added = { ...saved, objects: [...saved.objects, { altarObjectId: "c" }] };
  assert.equal(Sync.hasLayoutChanges(saved, added), true);
});
