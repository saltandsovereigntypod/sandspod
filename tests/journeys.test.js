const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const L = require("../rituals/journeys/journeys-logic.js");
const DeityYours = require("../js/deity-yours.js");
const root = path.join(__dirname, "..");

/** The built bundles, run as the browser runs them (window.SaltCore). */
function loadCore(...names) {
  const context = { console, URLSearchParams, Intl, Date };
  context.window = context;
  vm.createContext(context);
  for (const name of names) vm.runInContext(fs.readFileSync(path.join(root, "js/core", `${name}.js`), "utf8"), context);
  return context.SaltCore;
}

const core = loadCore("journeys", "journey-deity-hekate", "journey-path-wicca");
const J = core.journeys;
const hekate = core["journey-deity-hekate"].journey;

test("each view has its own query string, and the URL picks it", () => {
  assert.equal(L.href.journey("deity-hekate"), "/rituals/journeys/?id=deity-hekate");
  assert.deepEqual(L.route(""), { view: "home" });
  assert.deepEqual(L.route("?id=deity-hekate"), { view: "journey", id: "deity-hekate" });
  assert.deepEqual(L.route(L.href.stage("x", 2).split("?")[1]), { view: "stage", id: "x", stage: 2 });
  assert.deepEqual(L.route(L.href.rite("x", 4).split("?")[1]), { view: "rite", id: "x", stage: 4 });
  assert.deepEqual(L.route(L.href.lesson("x", "a b").split("?")[1]), { view: "lesson", id: "x", lesson: "a b" });
  assert.deepEqual(L.route(L.href.practice("x", "p").split("?")[1]), { view: "practice", id: "x", practice: "p" });
  assert.equal(L.route(L.href.discern("x").split("?")[1]).view, "discern");
  assert.equal(L.route(L.href.ongoing("x").split("?")[1]).view, "ongoing");
  assert.equal(L.route("?id=x&stage=-1").view, "journey");
  assert.equal(L.href.library("traditional:deity:hekate"), "/library/entry/?entity=traditional%2Fdeity%2Fhekate");
});

test("the app's words for lengths, cadences and steps", () => {
  assert.equal(L.lengthWords(1), "a day");
  assert.equal(L.lengthWords(14), "about 2 weeks");
  assert.equal(L.lengthWords(10), "about 10 days");
  assert.equal(L.lengthWords(365), "a year");
  assert.equal(L.everyWords("esbat"), "at the full moon");
  assert.equal(L.everyWords(undefined), "when you choose");
  assert.deepEqual(L.paragraphs("One\n\n  Two \n \nThree"), ["One", "Two", "Three"]);
  assert.equal(L.libraryName("traditional/deity/morrigan", () => null), "Morrigan");
  assert.equal(L.libraryName("traditional/herb/x", () => ({ name: "Rosemary" })), "Rosemary");
});

test("the catalog is small, and each journey loads on its own", () => {
  assert.equal(J.JOURNEY_CATALOG.length, 74);
  assert.ok(J.JOURNEY_CATALOG.every((j) => j.id && j.title && j.summary && !("stages" in j)));
  assert.ok(fs.statSync(path.join(root, "js/core/journeys.js")).size < 250 * 1024);
  for (const j of J.JOURNEY_CATALOG) assert.ok(fs.existsSync(path.join(root, "js/core", `journey-${j.id}.js`)), j.id);
  assert.equal(hekate.id, "deity-hekate");
  assert.equal(J.lookup.journeyForDeityRefIn(J.JOURNEY_CATALOG, "traditional:deity:hekate").id, "deity-hekate");
  assert.equal(J.lookup.searchJourneysIn(J.JOURNEY_CATALOG, "hekate")[0].id, "deity-hekate");
});

test("a begun journey's progress and next step, as the app keeps them", () => {
  const P = J.progress;
  const now = new Date(2026, 9, 16, 12);
  let p = P.newProgress(hekate.id, now);
  assert.deepEqual(Object.keys(p).sort(), ["journeyId", "lessonsRead", "practiceLog", "rededications", "stage", "stageDoneAt", "stageStartedAt", "startedAt"]);
  const step = P.nextStep(hekate, p, now, {});
  const href = L.stepHref(hekate, step);
  assert.ok(href.startsWith("/rituals/journeys/?id=deity-hekate"));
  assert.ok(L.STEP_ACTION[step.kind]);
  assert.equal(typeof L.stepDetail(step, (d) => String(d)), "string");
  const lesson = hekate.stages.find((s) => s.lessons.length).lessons[0];
  p = P.markRead(p, lesson.id, now);
  assert.ok(p.lessonsRead[lesson.id]);
  const entries = [{ id: "a", createdAt: "2026-10-01", data: p }];
  assert.equal(L.journeysUnderWay(entries, P.journeyStatus, () => true).length, 1);
  const stopped = P.decide(hekate, p, "stop", now);
  assert.equal(L.journeysUnderWay([{ id: "b", createdAt: "2026-10-02", data: stopped }], P.journeyStatus, () => true).length, 0);
});

test("a rite begun here is matched to the ritual the altar started, and done when it's finished", () => {
  const at = Date.parse("2026-10-16T20:00:00Z");
  const pending = { journeyId: "deity-hekate", kind: "dedication", title: "Self-dedication", at };
  const sessions = [
    { id: "old", title: "Self-dedication", started_at: "2026-10-15T20:00:00Z" },
    { id: "other", title: "Something else", started_at: "2026-10-16T20:01:00Z" },
    { id: "ours", title: "Self-dedication", started_at: "2026-10-16T20:00:30Z" }
  ];
  assert.equal(L.matchPendingSession(pending, sessions).id, "ours");
  assert.equal(L.matchPendingSession(pending, sessions.slice(0, 2)), null);

  const progress = { riteSessions: { dedication: "ours", threshold: "t" }, ritesDoneAt: { threshold: "2026-10-01" } };
  assert.deepEqual(L.waitingRites(progress), [["dedication", "ours"]]);
  assert.equal(L.riteFinishedAt("ours", { sessions: [{ id: "ours", status: "active" }] }), null);
  assert.equal(L.riteFinishedAt("ours", { sessions: [{ id: "ours", status: "completed", ended_at: "X" }] }), "X");
  assert.equal(L.riteFinishedAt("ours", { journals: [{ session_id: "ours", started_at: "J" }] }), "J");
  assert.equal(L.riteFinishedAt("ours", { journals: [{ session_id: "ours", started_at: "J" }], activeId: "ours" }), null);

  const done = J.progress.riteDone(J.progress.newProgress(hekate.id, new Date()), "dedication", new Date("2026-10-16T21:00:00Z"));
  assert.equal(done.dedicatedAt, "2026-10-16T21:00:00.000Z");
});

test("a rite becomes the template the Ritual Companion begins", () => {
  const stage = hekate.stages.find((s) => s.kind === "dedication");
  const draft = J.progress.riteDraft(stage.rite, hekate);
  assert.equal(draft.title, stage.rite.title);
  assert.equal(draft.steps.length, stage.rite.steps.length);
  const R = require("../rituals/js/rituals-logic.js");
  const handoff = R.beginHandoff({ kind: "draft", draft });
  assert.equal(handoff.kind, "draft");
  assert.equal(handoff.template.id, null);
  assert.equal(handoff.template.ritual_template_steps.length, stage.rite.steps.length);
});

test("discernment answers kept in the journal: only the answered questions", () => {
  assert.equal(L.answersText(["One?", "Two?", "Three?"], { 0: " yes ", 2: "" }), "One?\nyes");
  assert.deepEqual(L.CHOICES.map((c) => c.kind), ["continue", "pause", "stop", "another"]);
});

test("a reflection is a journal entry shaped as the app writes it", () => {
  const now = new Date(2026, 9, 16, 21);
  const answers = { ...J.blankAnswers(null, now), title: "Hekate: The oldest Hekate", notes: "Q\n\nA" };
  const entry = J.journalPayload({ session: null, answers, userId: "u1", id: "j1", existing: null, now });
  assert.equal(entry.source, "manual");
  assert.equal(entry.session_id, null);
  assert.equal(entry.title, "Hekate: The oldest Hekate");
  const row = J.journalRow(entry, "u1");
  assert.equal(row.user_id, "u1");
  assert.ok(!("created_at" in row));
  assert.equal(J.journalLibraryEntry(row, "u1", now).entity_id, "ritual:j1");
});

test("My deities: the search, and keeping a deity after a dedication", () => {
  const M = J.mine;
  const library = L.libraryDeities({ deity: { hekate: { DisplayName: "Hekate", Pantheon: "Greek" }, brigid: { DisplayName: "Brigid", Pantheon: "Celtic" } } });
  assert.deepEqual(library.map((d) => d.key), ["brigid", "hekate"]);
  assert.deepEqual(L.deitySearch(library, [], "greek").matches.map((d) => d.key), ["hekate"]);
  assert.equal(L.deitySearch(library, [], "Grandmother Oak").custom, "Grandmother Oak");
  assert.equal(L.deitySearch(library, [{ key: "hekate", name: "Hekate" }], "hek").matches.length, 0);
  assert.match(L.todayKey(new Date(2026, 0, 5)), /^2026-01-05$/);

  const fresh = L.keepDedicated(M, {}, "traditional/deity/hekate", "Hekate", "2026-10-16T21:00:00Z");
  assert.equal(fresh.kept, false);
  assert.deepEqual(JSON.parse(fresh.value), [{ key: "hekate", name: "Hekate", level: "dedicated", since: "2026-10-16" }]);
  const exploring = { my_deities: JSON.stringify([{ key: "hekate", name: "Hekate", level: "exploring", since: "2025-01-01", note: "first" }]) };
  assert.deepEqual(JSON.parse(L.keepDedicated(M, exploring, "traditional/deity/hekate", "Hekate", "2026-10-16").value)[0], {
    key: "hekate", name: "Hekate", level: "dedicated", since: "2025-01-01", note: "first"
  });
  const patron = { my_deities: JSON.stringify([{ key: "hekate", name: "Hekate", level: "patron", since: "2025-01-01" }]) };
  assert.deepEqual(L.keepDedicated(M, patron, "traditional/deity/hekate", "Hekate", "2026-10-16"), { key: "hekate", name: "Hekate", kept: true, level: "patron" });
});

test("the deity card on a Library page: your patron, a shrine, My deities and their journey", () => {
  const patron = { my_deities: JSON.stringify([{ key: "hekate", name: "Hekate", level: "patron", since: "2025-01-01" }]) };
  const html = DeityYours.markup(J, patron, { key: "hekate", name: "Hekate" });
  assert.match(html, /Your patron/);
  assert.match(html, /Since 2025-01-01/);
  assert.match(html, /href="\/altar\/\?shrine=hekate"/);
  assert.match(html, />My deities</);
  assert.match(html, /\/rituals\/journeys\/\?id=deity-hekate/);
  const stranger = DeityYours.markup(J, {}, { key: null, name: "Grandmother Oak" });
  assert.match(stranger, /Drawn to Grandmother Oak\?/);
  assert.match(stranger, /Add to My deities/);
  assert.doesNotMatch(stranger, /shrine=/);
});

test("each Hindu deity's Library and patron card offers its devotional journey, built for the website", () => {
  for (const key of ["ganesha", "durga", "lakshmi", "shiva", "saraswati", "kali", "krishna"]) {
    const id = `deity-${key}`;
    const entry = J.lookup.journeyForDeityRefIn(J.JOURNEY_CATALOG, `traditional:deity:${key}`);
    assert.equal(entry && entry.id, id, key);
    assert.deepEqual([...entry.paths], ["hindu"]);
    const html = DeityYours.markup(J, {}, { key, name: key });
    assert.match(html, new RegExp(`/rituals/journeys/\\?id=${id}"`), key);
    const journey = loadCore(`journey-${id}`)[`journey-${id}`].journey;
    assert.equal(journey.id, id);
    assert.match(journey.welcome, /This is not an initiation/);
    assert.equal(journey.stages.length, 6);
  }
});

test("the pages load what they need, and the altar takes a shrine", () => {
  const page = fs.readFileSync(path.join(root, "rituals/journeys/index.html"), "utf8");
  for (const src of ["/js/salt-store.js", "/js/core/journeys.js", "/rituals/js/rituals-logic.js", "/rituals/journeys/journeys-store.js"]) assert.ok(page.includes(`src="${src}"`), src);
  const altar = fs.readFileSync(path.join(root, "altar/index.html"), "utf8");
  assert.ok(altar.indexOf("js/features/deity-shrine.js") > altar.indexOf("js/features/app-altar-bridge.js"));
  const grimoire = fs.readFileSync(path.join(root, "grimoire/index.html"), "utf8");
  assert.ok(grimoire.indexOf("../js/deity-yours.js") < grimoire.indexOf('src="js/app.js"'));
});
