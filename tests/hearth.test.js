// Hearth & land on the website: the land journal, foraging & garden and
// kitchen witchery (/practice/hearth/), kept level with the app's
// rituals/craft/hearth/ screens and their links in from elsewhere.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/traditional-library.js"));
vm.runInThisContext(read("js/core/hearth.js"));
vm.runInThisContext(read("js/core/hearth-altar.js"));
vm.runInThisContext(read("js/hearth-links.js"));
const H = global.SaltCore.hearth;

test("every app Hearth & land screen has its website page, and the script draws each view", () => {
  const appDir = path.join(root, "app/src/app/(tabs)/rituals/craft/hearth");
  const screens = [];
  const walk = (dir, rel) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) walk(full, rel ? `${rel}/${name}` : name);
      else screens.push(name === "index.tsx" ? rel : rel ? `${rel}/${name.replace(/\.tsx$/, "")}` : name.replace(/\.tsx$/, ""));
    }
  };
  walk(appDir, "");
  const script = read("practice/hearth/hearth.js");
  for (const screen of screens) {
    const view = `hearth${screen ? `-${screen.replace(/\//g, "-")}` : ""}`;
    const html = read(`practice/hearth/${screen ? `${screen}/` : ""}index.html`);
    assert.match(html, new RegExp(`data-view="${view}"`), screen);
    assert.ok(html.indexOf("/js/core/hearth.js") < html.indexOf("/practice/hearth/hearth.js"), screen);
    assert.ok(script.includes(`"${view}"`), `hearth.js draws ${view}`);
  }
  assert.ok(screens.length >= 16);
});

test("the website reads the app's logic: festival food, the hedgerow, the Wheel and the potted plants", () => {
  const choice = H.holidays.holidayChoice({});
  const line = global.SaltHearthLinks.todayLine(["kitchen"], new Date(2026, 9, 30), { place: null, choice });
  assert.equal(line.line, "Samhain tomorrow: soul cakes");
  assert.equal(line.href, "/practice/hearth/recipes/recipe/?id=soul-cakes");
  assert.equal(global.SaltHearthLinks.siteHref("/rituals/craft/hearth/forage"), "/practice/hearth/forage/");
  assert.equal(H.land.wheelWords(H.land.wheelOn("2026-11-15", true)), "Between Beltane and Litha");
  assert.equal(typeof H.holyOps.holyPageOps, "function");
  assert.deepEqual(global.SaltCore["hearth-altar"].potted.pottedRefs([]), []);
});

test("Craft, Green, Kitchen, Cycle & Moon, Today, holy days and the Library link in", () => {
  assert.match(read("practice/hub.js"), /\/practice\/hearth\/land\//);
  assert.match(read("practice/green/green.js"), /\/practice\/hearth\/forage\//);
  assert.match(read("practice/kitchen/kitchen.js"), /\/practice\/hearth\/recipes\//);
  assert.match(read("rituals/cycle/cycle.js"), /\/practice\/hearth\/land\//);
  assert.match(read("today/today.js"), /SaltHearthLinks\?\.todayLine/);
  assert.match(read("today/holy/holy.js"), /mountHoly/);
  assert.match(read("library/entry/entry.js"), /mountHerb/);
  for (const page of ["today/index.html", "today/holy/index.html", "library/entry/index.html"]) {
    const html = read(page);
    assert.ok(html.indexOf("/js/traditional-library.js") < html.indexOf("/js/core/hearth.js") && html.indexOf("/js/core/hearth.js") < html.indexOf("/js/hearth-links.js"), page);
  }
});
