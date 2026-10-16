const test = require("node:test");
const assert = require("node:assert/strict");
const Candle = require("../altar/js/features/candle-lifecycle.js");
const AltarArtwork = require("../js/altar-artwork.js");
const AssetCatalog = require("../js/sanctuary-asset-catalog.js");

const minute = 60_000;
const start = Date.parse("2026-01-01T00:00:00.000Z");
const hour = 60 * minute;
const day = 24 * hour;

// Shared with the phone app; both must use exactly these values.
const EXPECTED_DEFAULTS = {
  "chime-spell": 2 * hour,
  taper: 8 * hour,
  "tea-light": 4 * hour,
  pillar: 60 * hour,
  vigil: 7 * day,
  votive: 12 * hour,
  jar: 40 * hour,
  novena: 7 * day,
  floating: 4 * hour,
  birthday: 10 * minute,
  figure: 4 * hour,
  "figure-male": 4 * hour,
  "figure-female": 4 * hour,
  "figure-couple": 5 * hour,
  "beeswax-rolled": 2 * hour,
  "seven-knob": 7 * hour,
  "double-action": 6 * hour,
  reversible: 6 * hour
};

const siteCandleForms = () => [
  ...AssetCatalog.getForms("candle"),
  ...(AltarArtwork.candleStyleForms || [])
];

test("every candle form the site offers has a default expected life", () => {
  const forms = siteCandleForms();
  assert.ok(forms.length >= 18);
  for (const { id, label } of forms) {
    const definition = Candle.formDefinition(id);
    assert.ok(definition, `missing default for ${id}`);
    assert.ok(definition.defaultBurnMs > 0, id);
    assert.equal(definition.label, label, `label for ${id} comes from the catalog`);
    assert.match(definition.sourceNote, /Approximate/);
  }
});

test("the defaults table matches the shared values exactly", () => {
  const actual = Object.fromEntries(Object.values(Candle.FORMS).map((form) => [form.form, form.defaultBurnMs]));
  assert.deepEqual(actual, EXPECTED_DEFAULTS);
});

test("a burn longer than the candle's life auto-snuffs as spent, for every form", () => {
  for (const [form, lifeMs] of Object.entries(EXPECTED_DEFAULTS)) {
    const fresh = Candle.fresh(form);
    assert.equal(fresh.expectedBurnMs, lifeMs, form);
    const lit = Candle.light(fresh, start, { instanceId: form }).candle;
    assert.equal(lit.status, "burning");
    assert.equal(lit.estimatedBurnoutAt, new Date(start + lifeMs).toISOString());
    const result = Candle.reconcile(lit, start + lifeMs + 5 * minute, { instanceId: form });
    assert.equal(result.changed, true, form);
    assert.equal(result.candle.status, "spent", form);
    assert.equal(result.candle.currentBurnStartedAt, "");
    assert.equal(result.candle.totalBurnMs, lifeMs);
    assert.equal(result.candle.spentAt, new Date(start + lifeMs).toISOString());
    assert.equal(result.candle.burnHistory.length, 1);
    assert.equal(result.candle.burnHistory[0].endReason, "candle_life_reached");
    assert.equal(result.candle.burnHistory[0].extinguishedAt, new Date(start + lifeMs).toISOString());
    assert.throws(() => Candle.light(result.candle, start + lifeMs + 6 * minute), /spent/);
  }
});

test("a burn shorter than the candle's life does not snuff it", () => {
  const lit = Candle.light(Candle.fresh("birthday"), start, { instanceId: "b" }).candle;
  const result = Candle.reconcile(lit, start + 9 * minute, { instanceId: "b" });
  assert.equal(result.changed, false);
  assert.equal(result.candle.status, "burning");
});

test("form alone determines default duration", () => {
  const plain = Candle.normalize({}, { form: "vigil", color: "white" });
  const dressed = Candle.normalize({ dressings: [{ type: "oil" }] }, { form: "vigil", color: "purple" });
  assert.equal(plain.expectedBurnMs, dressed.expectedBurnMs);
});

test("unknown custom form has no default and burns with no limit", () => {
  assert.equal(Candle.normalize({}, { form: "handmade" }).expectedBurnMs, 0);
  const lit = Candle.light({}, start, { form: "handmade", instanceId: "h" }).candle;
  assert.equal(lit.status, "burning");
  assert.equal(lit.estimatedBurnoutAt, "");
  const later = Candle.reconcile(lit, start + 400 * day, { form: "handmade", instanceId: "h" });
  assert.equal(later.changed, false);
  assert.equal(later.candle.status, "burning");
  assert.equal(Candle.remainingMs(lit, start + minute), Infinity);
  const stopped = Candle.extinguish(lit, start + 3 * hour, "manual_extinguish", { form: "handmade", instanceId: "h" }).candle;
  assert.equal(stopped.status, "unlit");
  assert.equal(stopped.totalBurnMs, 3 * hour);
  assert.equal(stopped.burnHistory[0].endReason, "manual_extinguish");
  assert.equal(Candle.formatDuration(Infinity), "No set limit");
});

test("an unknown form with a custom life set before lighting is limited", () => {
  const custom = Candle.setExpectedDuration(Candle.normalize({}, { form: "handmade" }), 2 * minute);
  const lit = Candle.light(custom, start, { instanceId: "c" }).candle;
  const result = Candle.reconcile(lit, start + 5 * minute, { instanceId: "c" });
  assert.equal(result.candle.status, "spent");
  assert.equal(result.candle.burnHistory[0].endReason, "candle_life_reached");
});

test("duration edits are valid only before first lighting", () => {
  const edited = Candle.setExpectedDuration(Candle.fresh("tea-light"), 90 * minute, { now: start });
  assert.equal(edited.expectedBurnMs, 90 * minute);
  const lit = Candle.light(edited, start, { instanceId: "one" }).candle;
  assert.equal(lit.durationLocked, true);
  assert.equal(lit.firstLitAt, "2026-01-01T00:00:00.000Z");
  assert.throws(() => Candle.setExpectedDuration(lit, 2 * minute), /locked/);
});

test("a failed light does not create a duration lock", () => {
  const archived = Candle.archive(Candle.fresh("taper"), "next");
  assert.throws(() => Candle.light(archived, start, { instanceId: "archived" }), /Archived/);
  assert.equal(archived.durationLocked, false);
});

test("multiple burn intervals accumulate and stop while unlit", () => {
  let candle = Candle.setExpectedDuration(Candle.fresh("tea-light"), 60 * minute);
  candle = Candle.light(candle, start, { instanceId: "one" }).candle;
  candle = Candle.extinguish(candle, start + 5 * minute, "manual_extinguish", { instanceId: "one" }).candle;
  assert.equal(candle.totalBurnMs, 5 * minute);
  candle = Candle.light(candle, start + 20 * minute, { instanceId: "one" }).candle;
  candle = Candle.extinguish(candle, start + 30 * minute, "ritual_ended", { instanceId: "one", ritualId: "ritual" }).candle;
  assert.equal(candle.totalBurnMs, 15 * minute);
  assert.equal(candle.burnHistory.length, 2);
  assert.equal(candle.burnHistory[1].endReason, "ritual_ended");
});

test("closing and reopening uses timestamps and burns out exactly once", () => {
  let candle = Candle.setExpectedDuration(Candle.fresh("tea-light"), 2 * minute);
  candle = Candle.light(candle, start, { instanceId: "one" }).candle;
  const first = Candle.reconcile(candle, start + 3 * minute, { instanceId: "one" });
  assert.equal(first.candle.status, "spent");
  assert.equal(first.candle.totalBurnMs, 2 * minute);
  assert.equal(first.candle.burnHistory.length, 1);
  assert.equal(first.notificationNeeded, true);
  const second = Candle.reconcile(first.candle, start + 4 * minute, { instanceId: "one" });
  assert.equal(second.changed, false);
  assert.equal(second.candle.burnHistory.length, 1);
  assert.equal(Candle.remainingMs(second.candle), 0);
});

test("duplicate light and extinguish events are idempotent", () => {
  let candle = Candle.light(Candle.fresh("tea-light"), start, { instanceId: "one" }).candle;
  assert.equal(Candle.light(candle, start + minute, { instanceId: "one" }).duplicate, true);
  const stopped = Candle.extinguish(candle, start + minute, "manual_extinguish", { instanceId: "one" });
  const duplicate = Candle.extinguish(stopped.candle, start + 2 * minute, "manual_extinguish", { instanceId: "one" });
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.candle.burnHistory.length, 1);
});

test("spent candles cannot be revived", () => {
  const spent = Candle.normalize({ form: "tea-light", expectedBurnMs: minute, totalBurnMs: minute, spentAt: new Date(start).toISOString() });
  assert.throws(() => Candle.light(spent, start + minute), /spent/);
  assert.equal(Candle.normalize({ ...spent, status: "unlit", totalBurnMs: 0 }).status, "spent");
});

test("fresh duplicates and replacements never copy burn state", () => {
  const duplicate = Candle.fresh("vigil", { dressings: [{ type: "oil" }] });
  const replacement = Candle.fresh("vigil", { replacesInstanceId: "old", dressings: [] });
  for (const candle of [duplicate, replacement]) {
    assert.equal(candle.status, "unlit");
    assert.equal(candle.totalBurnMs, 0);
    assert.deepEqual(candle.burnHistory, []);
    assert.equal(candle.durationLocked, false);
  }
  assert.equal(replacement.replacesInstanceId, "old");
  assert.deepEqual(replacement.dressings, []);
});

test("archive preserves history and is distinct from spent", () => {
  const spent = Candle.normalize({ form: "tea-light", expectedBurnMs: minute, totalBurnMs: minute, spentAt: new Date(start).toISOString() });
  const archived = Candle.archive(spent, "new");
  assert.equal(archived.status, "archived");
  assert.equal(archived.replacedByInstanceId, "new");
  assert.equal(archived.totalBurnMs, minute);
});

test("event identity deduplicates merged histories", () => {
  const record = { eventId: "same", litAt: new Date(start).toISOString(), extinguishedAt: new Date(start + minute).toISOString(), durationMs: minute };
  const merged = Candle.normalize({ form: "tea-light", burnHistory: [record, record] });
  assert.equal(merged.burnHistory.length, 1);
  assert.equal(merged.totalBurnMs, minute);
});

test("ritual warnings include only explicitly linked insufficient candles", () => {
  const warnings = Candle.ritualWarnings([
    { instanceId: "linked", label: "Linked", ritualIncluded: true, form: "tea-light", candle: { form: "tea-light", expectedBurnMs: 5 * minute } },
    { instanceId: "decorative", label: "Decorative", ritualIncluded: false, form: "tea-light", candle: { form: "tea-light", expectedBurnMs: minute } },
    { instanceId: "enough", label: "Enough", ritualIncluded: true, form: "vigil", candle: { form: "vigil" } }
  ], 10 * minute, start);
  assert.deepEqual(warnings.map((warning) => warning.instanceId), ["linked"]);
});

test("ritual candle end behavior values are constrained", () => {
  assert.deepEqual(Candle.END_BEHAVIORS, ["keep_burning", "extinguish_at_end", "ask_at_end"]);
});

test("precise expanded and compact durations preserve seconds without milliseconds", () => {
  assert.equal(Candle.formatDuration(30_000), "30 seconds");
  assert.equal(Candle.formatDuration(90_000), "1 minute, 30 seconds");
  assert.equal(Candle.formatDuration(7_448_000), "2 hours, 4 minutes, 8 seconds");
  assert.equal(Candle.formatDuration(30_000, { compact: true }), "30s");
  assert.equal(Candle.formatDuration(90_000, { compact: true }), "1m 30s");
  assert.equal(Candle.formatDuration(7_448_999, { compact: true }), "2h 4m 8s");
  assert.doesNotMatch(Candle.formatDuration(30_999), /\.|millisecond/);
});

test("duration formatting clamps zero and negative values", () => {
  assert.equal(Candle.formatDuration(0), "0 seconds");
  assert.equal(Candle.formatDuration(-30_000), "0 seconds");
  assert.equal(Candle.formatDuration(0, { compact: true }), "0s");
});

test("effective display time includes one active interval without mutating state", () => {
  const candle = {
    form: "tea-light",
    expectedBurnMs: 60 * minute,
    totalBurnMs: 30_000,
    currentBurnStartedAt: new Date(start).toISOString(),
    status: "burning"
  };
  const original = structuredClone(candle);
  assert.equal(Candle.effectiveBurnedMs(candle, start + 15_000), 45_000);
  assert.equal(Candle.remainingMs(candle, start + 15_000), 60 * minute - 45_000);
  assert.deepEqual(candle, original);
});

test("remaining display preserves one-minute and seven-day second precision", () => {
  const oneMinute = { form: "custom", expectedBurnMs: minute, currentBurnStartedAt: new Date(start).toISOString(), status: "burning" };
  const vigil = { form: "vigil", expectedBurnMs: 7 * 24 * 60 * minute, currentBurnStartedAt: new Date(start).toISOString(), status: "burning" };
  assert.equal(Candle.formatDuration(Candle.remainingMs(oneMinute, start + 30_000)), "30 seconds");
  assert.equal(Candle.formatDuration(Candle.remainingMs(vigil, start + 30_000)), "6 days, 23 hours, 59 minutes, 30 seconds");
  assert.equal(Candle.formatDuration(Candle.remainingMs(vigil, start + 30_000), { compact: true }), "6d 23h 59m 30s");
});

test("spent display is full burned life with zero remaining", () => {
  const spent = { form: "tea-light", expectedBurnMs: minute, totalBurnMs: minute, status: "spent", spentAt: new Date(start).toISOString() };
  assert.equal(Candle.effectiveBurnedMs(spent, start + minute), minute);
  assert.equal(Candle.remainingMs(spent, start + minute), 0);
});

test("Companion candle titles are display-only and preserve custom names", () => {
  const label = "Black Candle Vigil Candle";
  assert.equal(Candle.displayTitle({ label, color: "black" }), "Black Candle");
  assert.equal(Candle.displayTitle({ label: "Purple Candle Taper Candle", color: "purple" }), "Purple Candle");
  assert.equal(Candle.displayTitle({ label: "White Tea Light Candle", color: "white" }), "White Candle");
  assert.equal(Candle.displayTitle({ label, color: "black", customDisplayName: "Midnight Watch" }), "Midnight Watch");
  assert.equal(label, "Black Candle Vigil Candle");
});

test("history entries from the phone app ({startedAt, endedAt} and both key sets) are accepted", () => {
  const litAt = new Date(start).toISOString();
  const outAt = new Date(start + 30 * minute).toISOString();
  const later = new Date(start + hour).toISOString();
  const laterOut = new Date(start + hour + 10 * minute).toISOString();
  const candle = Candle.normalize({
    version: 2,
    form: "tea-light",
    expectedBurnMs: 4 * hour,
    totalBurnMs: 0,
    burnHistory: [
      { startedAt: litAt, endedAt: outAt, durationMs: 30 * minute },
      { litAt: later, extinguishedAt: laterOut, startedAt: later, endedAt: laterOut, durationMs: 10 * minute, appNote: "kept" }
    ]
  });
  assert.equal(candle.burnHistory.length, 2);
  assert.equal(candle.totalBurnMs, 40 * minute);
  assert.equal(candle.burnHistory[0].litAt, litAt);
  assert.equal(candle.burnHistory[0].extinguishedAt, outAt);
  assert.equal(candle.burnHistory[0].startedAt, litAt, "original keys are preserved");
  assert.equal(candle.burnHistory[1].appNote, "kept", "extra fields on entries are preserved");
  assert.equal(candle.durationLocked, true);
});

test("the same wall-clock start written by web and app is counted once", () => {
  const litAt = new Date(start).toISOString();
  const outAt = new Date(start + 30 * minute).toISOString();
  const candle = Candle.normalize({
    form: "tea-light",
    burnHistory: [
      { eventId: "candle-burn:obj-1:" + litAt, litAt, extinguishedAt: outAt, durationMs: 30 * minute, endReason: "manual_extinguish" },
      { startedAt: litAt, endedAt: outAt, durationMs: 30 * minute }
    ]
  });
  assert.equal(candle.burnHistory.length, 1);
  assert.equal(candle.totalBurnMs, 30 * minute);
});

test("unknown fields on the candle object survive normalize, light, extinguish and reconcile", () => {
  let candle = Candle.normalize({ form: "votive", appSyncedAt: "2026-01-02T00:00:00.000Z", futureField: { nested: true } });
  assert.equal(candle.appSyncedAt, "2026-01-02T00:00:00.000Z");
  assert.deepEqual(candle.futureField, { nested: true });
  candle = Candle.light(candle, start, { instanceId: "v" }).candle;
  candle = Candle.extinguish(candle, start + minute, "manual_extinguish", { instanceId: "v" }).candle;
  candle = Candle.light(candle, start + 2 * minute, { instanceId: "v" }).candle;
  candle = Candle.reconcile(candle, start + 13 * hour, { instanceId: "v" }).candle;
  assert.equal(candle.status, "spent");
  assert.deepEqual(candle.futureField, { nested: true });
  assert.equal(candle.appSyncedAt, "2026-01-02T00:00:00.000Z");
});

test("saved state keeps the version 2 shape", () => {
  const candle = Candle.light(Candle.fresh("jar"), start, { instanceId: "j" }).candle;
  for (const key of ["version", "form", "expectedBurnMs", "durationLocked", "firstLitAt", "totalBurnMs", "currentBurnStartedAt", "lastLitAt", "estimatedBurnoutAt", "spentAt", "status", "archived", "replacedByInstanceId", "replacesInstanceId", "burnHistory", "durationHistory", "dressings", "burnoutNotificationEventId"]) {
    assert.ok(key in candle, key);
  }
  assert.equal(candle.version, 2);
  assert.equal(candle.expectedBurnMs, 40 * hour);
});

test("a legacy lit candle with no form is not marked spent on reconcile", () => {
  const legacy = Candle.normalize({ totalBurnMs: 5 * minute, currentBurnStartedAt: new Date(start).toISOString() });
  const result = Candle.reconcile(legacy, start + 10 * day);
  assert.equal(result.candle.status, "burning");
  assert.equal(result.changed, false);
});
