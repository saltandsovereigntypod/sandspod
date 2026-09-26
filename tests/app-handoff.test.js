const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Handoff = require("../js/app-handoff.js");

function storage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key), values };
}

function win({ phone = true, host = "saltandsovereignty.com" } = {}) {
  return {
    location: { hostname: host },
    matchMedia: (query) => ({ matches: phone && (query.includes("max-width") || query.includes("coarse")) })
  };
}

test("phones open the app; computers keep the website sanctuary", () => {
  assert.equal(Handoff.shouldOpenApp({ win: win(), storage: storage(), signedIn: false }), true);
  assert.equal(Handoff.shouldOpenApp({ win: win({ phone: false }), storage: storage(), signedIn: true }), false);
});

test("a guest with work saved in this browser stays until they sign in", () => {
  const withWork = storage({ saltAndSovereigntySavedAltars: JSON.stringify([{ id: "a1" }]) });
  assert.equal(Handoff.hasGuestWork(withWork), true);
  assert.equal(Handoff.shouldOpenApp({ win: win(), storage: withWork, signedIn: false }), false);
  assert.equal(Handoff.shouldOpenApp({ win: win(), storage: withWork, signedIn: true }), true);
});

test("empty guest collections and settings alone do not count as work", () => {
  const empty = storage({ saltAndSovereigntySavedAltars: "[]", saltAndSovereigntyLibrary: "{}", saltAndSovereigntyUserSettings: JSON.stringify({ preferred_name: "Rowan" }) });
  assert.equal(Handoff.hasGuestWork(empty), false);
});

test("choosing the website version on a phone is remembered and can be undone", () => {
  const store = storage();
  Handoff.setPrefersWebsite(store, true);
  assert.equal(Handoff.shouldOpenApp({ win: win(), storage: store, signedIn: true }), false);
  Handoff.setPrefersWebsite(store, false);
  assert.equal(Handoff.shouldOpenApp({ win: win(), storage: store, signedIn: true }), true);
});

test("local development never leaves for the app, and blocked storage is safe", () => {
  assert.equal(Handoff.shouldOpenApp({ win: win({ host: "localhost" }), storage: storage(), signedIn: true }), false);
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(Handoff.hasGuestWork(blocked), false);
  assert.doesNotThrow(() => Handoff.setPrefersWebsite(blocked, true));
});

test("every page with My Sanctuary loads the hand-off first, and the panel keeps an Open the app choice", () => {
  for (const page of ["index.html", "altar/index.html", "grimoire/index.html", "grimoire/community-grimoire.html", "submit/index.html"]) {
    const html = fs.readFileSync(page, "utf8");
    const handoff = html.indexOf("js/app-handoff.js");
    assert.ok(handoff > -1 && handoff < html.indexOf("js/my-sanctuary.js"), `${page} loads app-handoff.js before my-sanctuary.js`);
  }
  const source = fs.readFileSync("js/my-sanctuary.js", "utf8");
  assert.match(source, /shouldOpenApp/);
  assert.match(source, /data-my-sanctuary-open-app/);
});
