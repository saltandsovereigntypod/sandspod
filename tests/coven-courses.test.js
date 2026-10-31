// Coven courses on the website, level with the app: lessons read through the
// same Markdown (SaltCore.covens.lesson), tests, practice and each step's
// conversation call the same database functions, a message rings phones
// through coven-notify as in the app, the ready-made course programs come
// from the same bundle (js/core/courses.js, loaded only when needed), and the
// Reminders page keeps the same "Training messages" choice.
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
vm.runInThisContext(read("js/traditional-library.js"));
vm.runInThisContext(read("js/core/guides.js"));
const K = global.SaltCore.covens;

function fakeDb(answers = {}) {
  const calls = [];
  const builder = (table) => {
    const call = { table, ops: [] };
    calls.push(call);
    const chain = new Proxy(
      {},
      {
        get(_, name) {
          if (name === "then") {
            const result = answers[table] ?? { data: [], error: null };
            return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
          }
          return (...args) => {
            call.ops.push([name, ...args]);
            return chain;
          };
        }
      }
    );
    return chain;
  };
  return {
    calls,
    from: builder,
    rpc: (name, args) => {
      calls.push({ rpc: name, args });
      return Promise.resolve(answers[`rpc:${name}`] ?? { data: null, error: null });
    },
    functions: {
      invoke: (name, options) => {
        calls.push({ invoke: name, options });
        return Promise.resolve({ data: null, error: null });
      }
    }
  };
}

function loadCovenData(db) {
  global.db = db;
  delete global.CovenData;
  vm.runInThisContext(read("covens/coven-data.js"));
  return global.CovenData;
}

test("a lesson reads the same on the website as in the app", () => {
  const html = K.lesson.lessonHtml("## Khernips\n\nWash your **hands**.\n\n> **Safety:** Keep fire away from hair.\n\n1. Fill a bowl.\n2. Pour.");
  assert.match(html, /<h4 class="ls-h ls-h2">Khernips<\/h4>/);
  assert.match(html, /<strong>hands<\/strong>/);
  assert.match(html, /ls-callout--safety/);
  assert.match(html, /<ol class="ls-list"><li>Fill a bowl.<\/li><li>Pour.<\/li><\/ol>/);
  assert.equal(K.lesson.lessonHtml("<script>x</script>"), "<p>&lt;script&gt;x&lt;/script&gt;</p>");
  assert.equal(K.lesson.readingTime({ minutes: 9, body: "" }), "About 9 minutes");
});

test("tests, practice and conversations call the app's database functions", async () => {
  const db = fakeDb({ "rpc:post_coven_program_message": { data: { id: "m1" }, error: null } });
  const D = loadCovenData(db);
  await D.submitQuiz("e1", "t1", { q1: [1] });
  await D.scoreQuiz("a1", { q4: { points: 2, comment: "" } }, "", true);
  await D.logPractice("e1", "t1", "2026-10-28", 10, "");
  await D.postProgramMessage("e1", "t1", "  Hello  ");
  assert.deepEqual(db.calls.find((c) => c.rpc === "submit_coven_quiz").args, { p_enrollment: "e1", p_task: "t1", p_answers: { q1: [1] } });
  assert.deepEqual(db.calls.find((c) => c.rpc === "score_coven_quiz").args, { p_attempt: "a1", p_scores: { q4: { points: 2, comment: "" } }, p_feedback: null, p_final: true });
  assert.deepEqual(db.calls.find((c) => c.rpc === "log_coven_practice").args, { p_enrollment: "e1", p_task: "t1", p_on: "2026-10-28", p_minutes: 10, p_note: null });
  assert.equal(db.calls.find((c) => c.rpc === "post_coven_program_message").args.p_body, "Hello");
  assert.deepEqual(db.calls.filter((c) => c.invoke).map((c) => c.options.body), [{ program_thread_message_id: "m1" }], "rings phones as the app does");
  const api = read("app/src/lib/covens/api.ts");
  assert.match(api, /program_thread_message_id: saved\.id/);
  for (const name of [
    "save_coven_program_document", "delete_coven_program_document", "mark_coven_doc_read", "coven_quiz_view", "save_coven_program_quiz",
    "import_coven_course", "coven_quiz_standing", "submit_coven_quiz", "score_coven_quiz", "allow_coven_quiz_retake", "log_coven_practice",
    "remove_coven_practice", "post_coven_program_message", "remove_coven_program_message", "read_coven_program_thread", "coven_program_unread"
  ]) {
    assert.match(api, new RegExp(`'${name}'`), `app calls ${name}`);
    assert.match(read("covens/coven-data.js"), new RegExp(`"${name}"`), `website calls ${name}`);
  }
});

test("copying a course program sends its lessons and tests first, then the program", async () => {
  const db = fakeDb({ "rpc:save_coven_program": { data: { id: "p1" }, error: null } });
  const D = loadCovenData(db);
  const doc = { id: "d1", title: "One", summary: "s", minutes: 5, body: "b" };
  const program = {
    id: "hellenic-seeker", kind: "training", title: "Hellenic: Your first thirty days", summary: "s", description: "d", award: null,
    stages: [{ title: "S", intro: "i", passed_by: "mentor", tasks: [{ title: "T", kind: "study", instructions: "x", times: 1, response: "none", checked_by: "self", docs: ["d1"], quiz: null }] }],
    docs: [doc], quizzes: []
  };
  const saved = await D.copyCourseProgram("c1", program, null);
  assert.equal(saved.id, "p1");
  const rpcs = db.calls.filter((c) => c.rpc).map((c) => c.rpc);
  assert.deepEqual(rpcs, ["import_coven_course", "save_coven_program"]);
  assert.deepEqual(db.calls.find((c) => c.rpc === "save_coven_program").args.p_stages[0].tasks[0].docs, [{ source_id: "d1" }]);
});

test("the ready-made courses are data of their own, fetched only when chosen", () => {
  const page = read("covens/coven/index.html");
  assert.match(page, /<script src="\/covens\/coven\/course\.js"><\/script>\s*<script src="\/covens\/coven\/programs\.js"><\/script>/);
  assert.doesNotMatch(page, /course-programs/, "not on every coven page");
  assert.match(read("covens/coven/course.js"), /\/js\/core\/course-programs\.json/);
  assert.match(read("app/src/lib/covens/courseCatalog.ts"), /\/js\/core\/course-programs\.json/, "the app fetches the same file");
  const catalog = JSON.parse(read("js/core/course-programs.json"));
  const path = (t) => ["seeker", "devotee", "initiate", "elder", "high-priestess"].map((step) => `${t}-${step}`);
  assert.deepEqual(catalog.programs.map((p) => p.id), [...path("hellenic"), ...path("wheel"), ...path("wheel_south"), ...path("wicca"), ...path("celtic"), ...path("norse")]);
  assert.equal(catalog.label, "Seeker → Devotee → Initiate → Elder → High Priestess");
  assert.deepEqual(catalog.traditions, [
    { id: "hellenic", name: "Hellenic" },
    { id: "wheel", name: "Wheel of the Year" },
    { id: "wheel_south", name: "Wheel of the Year (Southern Hemisphere)" },
    { id: "wicca", name: "Wicca" },
    { id: "celtic", name: "Celtic" },
    { id: "norse", name: "Norse & Heathen" },
  ]);
});

test("a course step's links into the Sanctuary show as buttons on the website, opening the same pages as the app", () => {
  const programs = read("covens/coven/programs.js");
  assert.match(programs, /SaltCore\?\.covens\?\.courseLinks/);
  assert.match(programs, /courseLinkSiteHref\(l, \(tab\) => helpers\.covenHref\(tab\)\)/);
  assert.match(programs, /withoutCourseLinks/, "the markers never show as text");
  assert.match(read("scripts/core/covens.ts"), /export \* as courseLinks from '\.\.\/\.\.\/app\/src\/lib\/covens\/courseLinks\.ts'/);
  // The built bundle carries the same logic the app uses.
  const CL = K.courseLinks;
  const links = CL.courseLinks("[[go:holy:wheel_south/imbolc|Holy day: Imbolc]]\n[[go:coven:ritual-builder|Plan a coven ritual]]");
  assert.deepEqual(links.map((l) => CL.courseLinkSiteHref(l, (tab) => `/covens/coven/?c=x&tab=${tab}`)), ["/today/holy/?ref=wheel-imbolc", "/covens/coven/?c=x&tab=rituals"]);
  // Every course step's links survive into the catalog the website copies from.
  const catalog = JSON.parse(read("js/core/course-programs.json"));
  const wheel = catalog.programs.find((p) => p.id === "wheel-initiate");
  const samhain = wheel.stages.flatMap((s) => s.tasks).find((t) => t.holiday === "wheel/samhain");
  assert.ok(samhain.links.some((l) => l.kind === "holy" && l.id === "wheel/samhain" && l.label === "Holy day: Samhain"));
  assert.ok(samhain.links.some((l) => l.kind === "spread" && l.id === "samhain"));
});

test("the Reminders page keeps the Training messages choice with the synced reminders", () => {
  assert.deepEqual(global.SaltCore.guides.reminderPrefs.DEFAULT_PREFS.training, { on: true });
  assert.match(read("reminders/reminders.js"), /"training\.on"/);
  assert.equal(K.trainingNotes.wantsTraining(JSON.stringify({ training: { on: false } })), false);
});

test("the help guide explains lessons, tests, scoring and talking with a trainee", () => {
  const topics = global.SaltCore.guides.help.HELP.flatMap((s) => s.topics);
  for (const [id, title] of [["covens-course-lessons", "Course lessons and tests"], ["covens-score-test", "Scoring a test"], ["covens-training-talk", "Talking with your trainee"]]) {
    assert.equal(topics.find((t) => t.id === id)?.title, title);
  }
});
