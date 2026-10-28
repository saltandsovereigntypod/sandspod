const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("altar/index.html", "utf8");
const ui = fs.readFileSync("altar/js/ui/ui.js", "utf8");
const main = html.match(/<main[\s\S]+?<\/main>/)?.[0] || "";
const tools = main.match(/<section class="altar-tools"[\s\S]+?<\/section>/)?.[0] || "";
const count = (source, pattern) => (source.match(pattern) || []).length;

test("the altar page has one toolbar: each action appears exactly once", () => {
  const once = [
    /data-global-action="undo"/g,
    /data-global-action="redo"/g,
    /data-global-action="save-altar"/g,
    /data-global-action="select-ritual-items"/g,
    /data-global-action="group-ritual-items"/g,
    /data-global-action="start-ritual"/g,
    /data-global-action="save-as-ritual"/g,
    /data-global-action="record-in-grimoire"/g,
    /data-global-action="clear-altar"/g,
    /data-app-action="tool:light-all"/g,
    /data-app-action="tool:snuff-all"/g,
    /data-app-action="tool:full"/g,
    /data-app-action="tool:background"/g,
    /data-open-cabinet-overlay/g,
    /data-open-apothecary-overlay/g,
    /data-tool-guide="altar"/g,
    /data-open-sanctuary-search/g,
    /data-altar-picker(?![-\w])/g
  ];
  for (const pattern of once) assert.equal(count(main, pattern), 1, `${pattern} in the altar page`);
  // The old emoji action bar is gone: ui.js only makes the selected object's bar.
  assert.doesNotMatch(ui, /data-global-action=/);
  assert.doesNotMatch(main, /data-global-action="(load-altar|light-all|extinguish-all)"/);
});

test("the toolbar is grouped as the app's editor, with the rest under More", () => {
  assert.match(tools, /altar-tools__quick[\s\S]+"undo"[\s\S]+"redo"[\s\S]+tool:full[\s\S]+save-altar[\s\S]+data-altar-more-menu/);
  const more = tools.match(/data-altar-more-menu[\s\S]+?<\/div>/)?.[0] || "";
  for (const action of ["start-ritual", "save-as-ritual", "select-ritual-items", "group-ritual-items", "clear-altar"]) assert.match(more, new RegExp(`data-global-action="${action}"`));
  assert.match(more, /data-tool-guide="altar"[\s\S]+data-open-sanctuary-search/);
  const groups = [...tools.matchAll(/class="altar-tools__label"[^>]*>([^<]+)</g)].map((m) => m[1]);
  assert.deepEqual(groups, ["Add", "Tend", "Read", "Share &amp; keep"]);
});

test("the toolbar and header use line icons, never emoji", () => {
  const hero = main.match(/<section class="altar-hero"[\s\S]+?<\/section>/)?.[0] || "";
  assert.doesNotMatch(tools + hero, /\p{Extended_Pictographic}/u);
  const icons = new Set([...main.matchAll(/data-icon="([\w-]+)"/g)].map((m) => m[1]));
  const { ICONS } = require("../altar/js/ui/altar-toolbar.js");
  for (const name of icons) assert.ok(ICONS[name], `icon ${name} is drawn`);
});
