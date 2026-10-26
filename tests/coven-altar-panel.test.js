// A coven altar on the website, level with the app: the coven's Messages in a
// small window over the altar, and deleting an altar for good (its keepers
// only, with the same words asked first, and Clear it away kept beside it).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
global.CovenLogic = require("../covens/coven-logic.js");
vm.runInThisContext(read("js/core/covens.js"));
const P = global.SaltCore.covens.altarPanel;

test("the website has the app's rules for deleting an altar and its words", () => {
  assert.equal(P.canDeleteAltar({ is_main: false }, { keeper: true, ritual_id: null }).ok, true);
  assert.equal(P.canDeleteAltar({ is_main: true }, { keeper: true, ritual_id: null }).ok, false);
  assert.equal(P.canDeleteAltar({ is_main: false }, { keeper: false, ritual_id: null }).ok, false);
  assert.equal(P.canDeleteAltar({ is_main: false }, { keeper: true, ritual_id: "r1" }).ok, false);
  assert.equal(P.deleteAltarWords("Ancestors").body, "This removes the altar and everything on it for the whole coven. This can’t be undone.");
  assert.equal(P.badgeLabel(250), "99+");
});

test("deleting asks the database (delete_coven_altar), which checks the keeper and frees rituals held there", async () => {
  const calls = [];
  global.db = { rpc: (name, args) => (calls.push([name, args]), Promise.resolve({ data: true, error: null })) };
  delete global.CovenData;
  vm.runInThisContext(read("covens/coven-data.js"));
  assert.equal(await global.CovenData.deleteAltar("a1"), true);
  assert.deepEqual(calls, [["delete_coven_altar", { p_altar: "a1" }]]);

  const sql = read("supabase/migrations/20261031000000_delete_coven_altar.sql");
  assert.match(sql, /create or replace function public\.delete_coven_altar\(p_altar uuid\)/);
  assert.match(sql, /security definer/);
  assert.match(sql, /coven_altar_keeper\(a\.id\)/, "the same keepers who may clear it away");
  assert.match(sql, /if a\.is_main then raise exception/);
  assert.match(sql, /coven_altar_live_ritual/);
  assert.match(sql, /update public\.coven_rituals set altar_id = null/);
  assert.match(sql, /update public\.coven_petitions set altar_id = null/);
  assert.match(sql, /delete from public\.coven_altar_objects where altar_id = a\.id/);
  assert.match(sql, /delete from public\.coven_altar_editors where altar_id = a\.id/);
  assert.match(sql, /grant execute on function public\.delete_coven_altar\(uuid\) to authenticated/);
  assert.match(sql, /revoke execute on function public\.delete_coven_altar\(uuid\) from public, anon/);
});

test("the Altars tab offers Delete beside Clear it away, asking first", () => {
  const js = read("covens/coven/altar.js");
  assert.match(js, /data-archive=/);
  assert.match(js, /data-delete-altar/);
  assert.match(js, /UI\.confirmAction\(words\.title, words\.body, words\.confirm\)/);
  assert.match(js, /D\.deleteAltar\(altar\.id\)/);
});

test("the altar page opens the coven's own Messages in a window, not a copy of them", () => {
  const page = read("altar/js/features/coven-altar.js");
  for (const script of ["/covens/coven-logic.js", "/covens/coven-data.js", "/covens/coven-ui.js", "/js/core/covens.js", "/covens/coven/chat.js", "/covens/coven/chat-panel.js"]) {
    assert.ok(page.includes(`"${script}"`), `${script} is loaded`);
  }
  assert.ok(page.indexOf('"/covens/coven/chat.js"') < page.indexOf('"/covens/coven/chat-panel.js"'));
  // Deleted while you're there: the page says so.
  assert.match(page, /event: "DELETE", schema: "public", table: "coven_altars"/);

  const panel = read("covens/coven/chat-panel.js");
  assert.match(panel, /CovenChat\.mount\(.*\{ panel: true/);
  assert.match(panel, /UI\.loadAccess\(state\)/, "permissions from the coven page's own loader");
  assert.match(panel, /CovenChat\.onTotal/);

  const chat = read("covens/coven/chat.js");
  assert.match(chat, /if \(panel\) \{/);
  assert.match(chat, /totalListener\?\.\(total\(\)\)/);
  assert.match(read("covens/coven/coven.js"), /UI\.loadAccess\(state\)/);
});

test("in the window, choosing a thread keeps the altar's address", async () => {
  // A tiny page: enough for chat.js to mount in panel mode and switch threads.
  const pushed = [];
  const elements = new Map();
  const el = () => ({
    innerHTML: "",
    hidden: false,
    classList: { remove() {}, add() {}, toggle() {} },
    querySelector: (sel) => elements.get(sel) || null,
    querySelectorAll: () => [],
    addEventListener() {}
  });
  const pane = el();
  global.document = { querySelector: () => null, createElement: el };
  global.history = { pushState: (...args) => pushed.push(args) };
  global.location = { search: "?covenAltar=x&c=moon" };
  global.localStorage = { getItem: () => null, setItem() {} };
  global.CovenUI = { esc: (s) => String(s), prose: (s) => String(s), loadNames: async () => {}, nameOf: () => "A witch" };
  global.CovenData = { conversations: async () => ({ conversations: [], members: [] }), unreadSince: async () => 0, latestMessage: async () => null, thread: async () => [] };
  delete global.CovenChat;
  vm.runInThisContext(read("covens/coven/chat.js"));
  const state = { coven: { id: "c1" }, context: { user: { id: "me" }, blocks: [] }, perms: { member: true, chat: true }, standing: { ok: true, reasons: [] }, presence: [] };
  let total = null;
  global.CovenChat.onTotal((n) => (total = n));
  await global.CovenChat.mount(pane, state, { panel: true, covenHref: (tab) => `/covens/coven/?c=moon&tab=${tab}` });
  assert.equal(global.CovenChat.current(), null, "the coven's chat first");
  assert.equal(total, 0);
  assert.deepEqual(pushed, []);
  global.CovenChat.unmount();
});
