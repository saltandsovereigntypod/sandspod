// The Grimoire home as you arrange it, and a coven's Book of Shadows on the
// grimoire's own model, on the website level with the app: the app's own rules
// (lib/grimoire/layout.ts, access.ts, submissions.ts, history.ts, coven.ts,
// through js/core/grimoire.js), the same settings key, the same database
// calls, and a migration that keeps changes behind its functions.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/grimoire.js"));
const Gr = global.SaltCore.grimoire;
const plain = (value) => JSON.parse(JSON.stringify(value));

test("the website arranges the Grimoire home by the app's rules, saved in the same setting", () => {
  const L = Gr.layout;
  const parts = L.personalParts({
    sections: [{ id: "a", title: "Hekate", sort_order: 0, created_at: "2026" }],
    loose: true,
    shelves: [{ key: "traditional", title: "Traditional Information" }, { key: "myPractice", title: "My Practice" }, { key: "dreams", title: "Dreams" }]
  });
  const home = L.arrangeHome(L.emptyLayout(), parts);
  assert.deepEqual(home.map((i) => i.key), ["pages", "section:a", "myPractice", "dreams", "traditional"]);
  assert.equal(home.at(-1).open, false, "the reference shelf starts closed");
  let layout = L.moveHomePart(L.emptyLayout(), parts, "dreams", "up");
  layout = L.setPartHidden(L.renamePart(layout, "myPractice", "Herbs and stones", "My Practice"), "traditional", true);
  assert.deepEqual(L.arrangeHome(layout, parts).map((i) => i.title), ["Pages", "Hekate", "Dreams", "Herbs and stones"]);
  assert.deepEqual(plain(L.parseLayout(L.serializeLayout(layout))), plain(layout));
  assert.equal(L.LAYOUT_SETTING, "grimoire_layout");
  assert.match(read("js/my-settings.js"), /grimoire_layout: ""/);
  assert.match(read("app/src/lib/settings/defaults.ts"), /grimoire_layout: ''/);
  const pages = [{ id: "b", title: "Beltane", sort_order: 1, created_at: "2026-05-01", page_type: "ritual" }, { id: "a", title: "ash", sort_order: 0, created_at: "2026-01-01", page_type: null }];
  assert.deepEqual(L.shownPages(pages, { sort: "newest", kind: null }).map((p) => p.id), ["b", "a"]);
  assert.deepEqual(L.shownPages(pages, { sort: "custom", kind: "ritual" }).map((p) => p.id), ["b"]);
});

test("the Book of Shadows page loads the arranging and suggesting scripts with the app's rules", () => {
  const html = read("grimoire/index.html");
  const at = (src) => html.indexOf(src);
  assert.ok(at("../js/core/grimoire.js") > 0 && at("../js/core/grimoire.js") < at("js/ui/layout.js"));
  assert.ok(at("js/ui/layout.js") < at("js/app.js"));
  assert.ok(at("js/ui/suggest.js") > 0);
  const layout = read("grimoire/js/ui/layout.js");
  for (const needle of ["arrangeHome", "moveHomePart", "setPartHidden", "renamePart", "setPartOpen", "shownPages", "grimoire_layout", "saveMySettings", "data-layout-customise"]) assert.ok(layout.includes(needle), needle);
  const suggest = read("grimoire/js/ui/suggest.js");
  for (const needle of ["submit_coven_grimoire_page", "submissionBlocks", "p_source_page", "coven-notify", "Suggest to a coven"]) assert.ok(suggest.includes(needle), needle);
});

test("who may open, write in and approve each part reads the same on the website", () => {
  const A = Gr.access;
  const viewer = (extra = {}) => ({ userId: "u", member: true, rankId: "initiate", head: false, site: false, writeBook: false, approveBook: false, goodStanding: true, ...extra });
  const elders = [{ kind: "rank", id: "elder" }];
  assert.equal(A.allows(viewer(), [{}, {}, {}], "view"), true);
  assert.equal(A.allows(viewer(), [{}, { view: elders }, {}], "view"), false);
  assert.equal(A.allows(viewer(), [{ view: [{ kind: "user", id: "u" }] }, { view: elders }, {}], "view"), true);
  assert.equal(A.allows(viewer({ writeBook: true }), [{ view: elders }], "write"), false, "no one writes in what they can't open");
  assert.equal(A.allows(viewer({ head: true }), [{ view: [] }], "approve"), true);
  assert.equal(A.HIDDEN_PAGE, "A page you can’t open");
  assert.deepEqual(plain(A.ruleFor([{}, { write: [] }, {}], "write")), { list: [], from: "section" });
});

test("suggestions, history and the coven's shelves read the same on the website", () => {
  const S = Gr.submissions;
  const blocks = S.submissionBlocks([
    { id: "1", page_id: "p", block_type: "page_link", content: "", rich_content: null, metadata: { label: "Moon water", target_page_id: "x" }, sort_order: 1, created_at: null },
    { id: "0", page_id: "p", block_type: "text", content: "<b>Rue</b>", rich_content: { html: "<b>Rue</b>" }, metadata: {}, sort_order: 0, created_at: null }
  ]);
  assert.deepEqual(blocks.map((b) => b.content), ["<b>Rue</b>", "See also: Moon water"]);
  assert.equal(S.decide("pending", "return"), "returned");
  assert.equal(S.decide("declined", "approve"), null);
  const H = Gr.history;
  const v = (id, at, list) => ({ id, page_id: "p", title: "T", page_type: null, blocks: list.map((c) => ({ block_type: "text", content: c, rich_content: null, metadata: {} })), saved_by: "u", saved_at: at, restored_from: null });
  assert.equal(H.changesLine(v("1", "1", ["a", "b"]), v("2", "2", ["a", "c", "d"])), "1 changed, 1 added");
  const C = Gr.coven;
  assert.deepEqual(C.COVEN_SHELVES.map((s) => s.shelf), ["rites", "records", "minutes", "study"]);
  assert.deepEqual(C.textBlocks("OPENING\nHail\n\nSo be it").map((b) => b.block_type), ["heading", "text", "text"]);
  const id = "0f8fad5b-d9cb-469f-a165-70867728950e";
  assert.deepEqual(plain(C.studyLinks(`Read: ${C.studyLink({ id, title: "Tools" })}`)), [{ id, title: "Tools" }]);
});

test("the coven's book on the website makes the same calls as the app", () => {
  const data = read("covens/coven-data.js");
  const app = read("app/src/lib/covens/api.ts") + read("app/src/lib/grimoire/covenStore.tsx");
  for (const rpc of ["open_coven_grimoire", "apply_coven_grimoire_op", "set_coven_grimoire_access", "set_coven_grimoire_layout", "restore_coven_grimoire_version", "submit_coven_grimoire_page", "review_coven_grimoire_submission", "remove_coven_grimoire_submission", "save_coven_grimoire_gathering", "coven_grimoire_page_texts", "coven_grimoire_submissions", "coven_grimoire_versions", "grimoire_submission_id"]) {
    assert.ok(data.includes(rpc), `website: ${rpc}`);
    assert.ok(app.includes(rpc), `app: ${rpc}`);
  }
  assert.doesNotMatch(data, /coven_book_pages|save_coven_book_draft/, "the old book is only read by the migration now");
  const book = read("covens/coven/book.js");
  for (const needle of ["D.grimoireOp", "G().edits.pageInsert", "blockTextPatch", "templateAppend", "pageLinkInsert", "D.setBookAccess", "D.restoreVersion", "D.reviewSubmission", "D.submitPage", "D.setBookLayout", "HIDDEN_PAGE", "arrangeHome", "unsavedRecords"]) assert.ok(book.includes(needle), needle);
  const html = read("covens/coven/index.html");
  assert.ok(html.indexOf("/js/core/grimoire.js") < html.indexOf("/covens/coven/book.js"));
  assert.match(read("covens/coven/rituals.js"), /D\.saveGathering\(state\.coven\.id, ritual\.id, what/);
  assert.match(read("covens/coven/builder.js"), /HIDDEN_PAGE/);
  assert.match(read("covens/coven/programs.js"), /studyLinks/);
});

test("the migration keeps every change behind its functions, hides what can't be opened, and keeps the old book", () => {
  const sql = read("supabase/migrations/20261106000000_coven_grimoire.sql");
  for (const table of ["coven_grimoire_books", "coven_grimoire_sections", "coven_grimoire_pages", "coven_grimoire_blocks", "coven_grimoire_page_links", "coven_grimoire_versions", "coven_grimoire_submissions"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`), table);
  }
  assert.doesNotMatch(sql, /for (insert|update|delete|all) to authenticated/, "these change only through the functions");
  assert.doesNotMatch(sql, /drop table/i, "nothing old is removed");
  assert.match(sql, /using \(public\.coven_grimoire_page_can\(id, 'view'\)\)/);
  assert.match(sql, /using \(public\.coven_grimoire_page_can\(source_page_id, 'view'\) and public\.coven_grimoire_page_can\(target_page_id, 'view'\)\)/);
  // Old pages keep their ids, so words the builder links still find them.
  assert.match(sql, /select p\.id, p\.coven_id, b\.id, public\.coven_grimoire_section_named\(b\.id, p\.section\)/);
  for (const fn of ["coven_grimoire_allows", "coven_grimoire_chain_can", "apply_coven_grimoire_op", "submit_coven_grimoire_page", "review_coven_grimoire_submission", "restore_coven_grimoire_version", "save_coven_grimoire_gathering", "coven_grimoire_page_texts", "coven_grimoire_submission_approvers"]) {
    assert.match(sql, new RegExp(`function public\\.${fn}\\(`), fn);
  }
  // The same defaults as access.ts: the coven's book powers when nothing is set.
  assert.match(sql, /when 'write' then coalesce\(r\.can_write_book or r\.can_approve_book or r\.can_manage, false\)/);
  assert.match(sql, /when 'approve' then coalesce\(r\.can_approve_book or r\.can_manage, false\)/);
});
