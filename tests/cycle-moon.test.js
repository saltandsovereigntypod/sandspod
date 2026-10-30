const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

// A vault encrypted by the app's own code (app/src/lib/cycle/vault.ts, run in
// Node), with a light scrypt cost so the test is quick. The website's build
// must open it, and refuse the wrong passphrase.
const APP_VAULT = {"vault": {"version": 1, "kdf": {"name": "scrypt", "N": 1024, "r": 8, "p": 1, "salt": "NQUXT6ub7MBbbqC67XxlfA=="}, "passKey": "BAawwZCqv+PyeSf/LRZFbZgdX0tNRmUfXEW/3APbG76PsdR1jZVLIAa+s7UYlfjik3owDekau5JHRoYXT69Cqamjhxbx27q2", "recoveryKey": "dX1v9V1saeukJUQ0UTnCIeqcACpeq0PHaNWwzB5RBsMu7PuN5aMD0cWLetw6mYIfbDiwDmEFUKV1NBlmVimTVcf7alD1S1dg", "data": "uMqWoy+v0CMDu0O28XHBUz4GIDkR7sG84AqucfSjFqFGtdKxkqwcj3hWFhpTGT5xSiC/xqgsY5veHQZ8zPDe9lmoPs8QvDP9MhJPXdR6GzYbYYzARprnlsSWbaTJ9fpcQCa6sGfX3nYkbbsUAoEKHGZxDNVIoZUolWMnHKPh25zlBvXte/afF8S9eNvCngqbKuz7MSIRWD8/yI/NlvQbia9Y5jYpRlcI4Tr+UpXPeySiUtMP10AanJMC/a9CIxrIM+zNZyBc/dkrH2ep3VZFQaj+gYtdRpj9lfZ1QscKkwrAVVvL5e9YwumAnwwjRQ4vVYK+nEf8DlrXOxB6cVN+hURaOZkbq6Euyh7cw20QzuIhy4mqq7kfHTfCHirYtOWqcdguQw1uT6VHk3J7hr3ayT86CR0wGtBXQBopkDIXLVNpm/T0+ozT48h73neewOTzBcA2zV7CrXMpWpK8t5ebPsv3ixKhg73pLu+d1XvDWzO3rZ+r/4ZBSQpu8IpBVrrSM0qi2d7RgbCZ/qC7Yd22S2O0gD0s2B5bKukyMqYBL8XPUSv/9BVOBHi82keO9+BH5yUaCSxt4I4PszgATvN01i7791p6HKwuB3DgrPxrwYq6jXWBlVOAi81H+BH7Be0G5zXRuE9oeh/+0o67/FhstB0NCpkYrP04z171qyUtPD5+njiLRUkYXHrYQYtdn60/EhuvC/Lc2NK0cElY5wVd", "updatedAt": "2026-10-30T12:00:00.000Z"}, "recovery": "JWCP-XJA5-GK8M-XPCY-NS8Z-20VZ-3Z3S-D003", "data": {"version": 1, "bleeds": [{"id": "bleed-1", "start": "2026-10-03", "end": "2026-10-07", "flow": {}, "updatedAt": "2026-10-30T12:00:00.000Z"}], "notes": [{"date": "2026-10-04", "energy": null, "intuition": 5, "mood": "", "body": "", "dreams": "an owl over water", "text": "", "updatedAt": "2026-10-30T12:00:00.000Z"}], "settings": {"mode": "cycle", "situations": [], "archetypes": true, "today": true, "altar": false, "grimoire": false, "reminders": {"on": false, "full": false, "ahead": 3, "at": 540}, "updatedAt": "2026-10-30T12:00:00.000Z"}, "removed": {}}};

function cycleCore() {
  const window = {};
  const context = { window, crypto: globalThis.crypto, TextEncoder, TextDecoder, console, setTimeout, clearTimeout };
  vm.runInNewContext(fs.readFileSync("js/core/cycle.js", "utf8"), context);
  return (context.SaltCore || window.SaltCore).cycle;
}
const plain = (value) => JSON.parse(JSON.stringify(value));

test("the website opens a Cycle & Moon vault the app encrypted, and only with the right passphrase", async () => {
  const C = cycleCore();
  const key = await C.vault.unlockWithPassphrase(APP_VAULT.vault, "moon over the water");
  // The first release's notes (content version 1) open as version 2: nothing lost, symptoms empty, the cycle length worked out from history.
  const opened = plain(C.vault.decryptData(key, APP_VAULT.vault.data));
  assert.equal(opened.version, 2);
  assert.deepEqual(opened.bleeds, APP_VAULT.data.bleeds);
  assert.deepEqual(opened.notes, APP_VAULT.data.notes.map((n) => ({ ...n, symptoms: {}, custom: {} })));
  assert.deepEqual(opened.settings, { ...APP_VAULT.data.settings, length: { mode: "auto", exact: 28, min: 26, max: 30 } });
  assert.deepEqual(Array.from(C.vault.unlockWithRecovery(APP_VAULT.vault, APP_VAULT.recovery)), Array.from(key));
  await assert.rejects(() => C.vault.unlockWithPassphrase(APP_VAULT.vault, "moon over the waves"), (e) => e.code === "wrong-passphrase");
  // Nothing readable is in what's stored.
  const stored = JSON.stringify(APP_VAULT.vault);
  for (const word of ["2026-10-03", "owl", "bleed", "intuition"]) assert.ok(!stored.includes(word), word);
  // And the website's own vault round-trips.
  const made = await C.vault.protectVault(C.vault.newDataKey(), C.model.emptyData(), "written on the website", new Date(), { cost: { N: 1024, r: 8, p: 1 } });
  const k2 = await C.vault.unlockWithPassphrase(plain(made.vault), "written on the website");
  assert.equal(C.vault.decryptData(k2, made.vault.data).version, 2);
});

test("Cycle & Moon keeps to its own storage, its own words and the private reminder rules", () => {
  const store = fs.readFileSync("rituals/cycle/cycle-store.js", "utf8");
  // Never under "salt.", so guest backups and the guest move leave it alone.
  assert.match(store, /cycleMoon\.\$\{what\}\.\$\{scope\}/);
  assert.doesNotMatch(store, /["'`]salt\.craft/);
  // The coven page's words are the app's.
  const C = cycleCore();
  const manage = fs.readFileSync("covens/coven/manage.js", "utf8");
  for (const o of C.status.STATUS_OPTIONS) assert.ok(manage.includes(`${o.value}: "${o.label}"`), o.value);
  assert.match(manage, /rpc\("cycle_moon_statuses"/);
  // Today loads the card, which loads the rest only when there's a key.
  assert.match(fs.readFileSync("today/index.html", "utf8"), /\/today\/cycle-today\.js/);
  assert.match(fs.readFileSync("today/today.js", "utf8"), /data-cycle-today/);
  assert.match(fs.readFileSync("today/cycle-today.js", "utf8"), /cycleMoon\.key\./);
  // Practice → Rituals links it, and help can take you there.
  assert.match(fs.readFileSync("rituals/js/home.js", "utf8"), /\/rituals\/cycle\//);
  const notes = require("../help/web-notes.js");
  assert.equal(notes.siteHref("/rituals/cycle"), "/rituals/cycle/");
  assert.equal(notes.siteHref("/rituals/cycle/settings"), "/rituals/cycle/?view=settings");
  assert.equal(notes.siteHref("/rituals/cycle/share"), "/rituals/cycle/?view=share");
  // The moon-time altar on the website.
  assert.match(fs.readFileSync("altar/js/features/deity-shrine.js", "utf8"), /moonTimeAltar/);
});

test("the website has past periods, What am I?, today's exact reading and symptoms, from the app's own code", () => {
  const C = cycleCore();
  const today = "2026-10-30";
  const now = new Date(2026, 9, 30, 12);
  let data = C.model.emptyData();
  const starts = ["2026-05-04", "2026-06-01", "2026-06-30", "2026-07-27", "2026-08-26", "2026-09-23"];
  data = C.past.addPastBleeds(data, starts.map((s) => C.past.entryWithLength(s, 5)), C.newId, now).data;
  assert.equal(data.bleeds.length, 6);
  assert.equal(C.past.parsePastList("2026-09-23\n4 May 2026", "dmy", today).entries.length, 2);
  assert.match(C.history.historyReading(data).type.headline, /^Based on 6 cycles: /);
  data = C.model.changeSettings(data, { length: { mode: "range", exact: 28, min: 27, max: 31 } }, now);
  assert.match(C.model.nextBleedEstimate(data, new Date(2026, 9, 10, 12)).line, /^Your bleed may start between /);
  assert.match(C.readings.exactReading(data, now).headline, /^Cycle day \d+ · inner \w+ \(\w+\) · /);
  let count = 0;
  for (const season of Object.values(C.readings.READINGS)) count += Object.keys(season).length;
  assert.equal(count, 32);
  assert.ok(C.symptoms.SYMPTOMS.some((s) => s.id === "cramps"));
  // The page has each view, and help can take you to them.
  const page = fs.readFileSync("rituals/cycle/cycle.js", "utf8");
  for (const view of ["past", "history", "insights"]) assert.ok(page.includes(`v === "${view}"`), view);
  assert.match(page, /data-symptom=/);
  assert.match(page, /data-length-mode=/);
  assert.match(fs.readFileSync("today/cycle-today.js", "utf8"), /readings\.exactReading/);
  const notes = require("../help/web-notes.js");
  assert.equal(notes.siteHref("/rituals/cycle/past"), "/rituals/cycle/?view=past");
  assert.equal(notes.siteHref("/rituals/cycle/history"), "/rituals/cycle/?view=history");
  assert.equal(notes.siteHref("/rituals/cycle/insights"), "/rituals/cycle/?view=insights");
  for (const id of ["cycle-moon-past", "cycle-moon-history", "cycle-moon-symptoms"]) assert.ok(notes.TOPIC_NOTES[id], id);
});

test("deleting an account deletes Cycle & Moon, and the policy says how it's kept", () => {
  const edge = fs.readFileSync("supabase/functions/delete-account/index.ts", "utf8");
  for (const table of ["cycle_moon_vault", "cycle_moon_status"]) assert.match(edge, new RegExp(`"${table}"`), table);
  const sql = fs.readFileSync("supabase/migrations/20261117000000_cycle_moon.sql", "utf8");
  assert.match(sql, /alter table public\.cycle_moon_vault enable row level security/);
  assert.match(sql, /alter table public\.cycle_moon_status enable row level security/);
  assert.match(sql, /on delete cascade/);
  // No new link between existing tables.
  assert.doesNotMatch(sql, /alter table public\.coven/);
  const privacy = fs.readFileSync("privacy.html", "utf8");
  assert.match(privacy, /Cycle &amp; Moon/);
  assert.match(privacy, /encrypted on your phone or in your browser/);
  assert.match(fs.readFileSync("delete-account.html", "utf8"), /Cycle &amp; Moon/);
});
