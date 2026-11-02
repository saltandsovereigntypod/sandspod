// Reactions and reply buttons on coven messages on the website, level with
// the app: the same logic through SaltCore (grouping, toggling, the tally and
// changing an answer, the RSVP a Gathering answer sets, the plan's chat
// reminder, when it is due, and the phone notes' batching and choices), and
// the pages wired to it.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

global.window = global;
vm.runInThisContext(read("js/core/covens.js"));
vm.runInThisContext(read("js/traditional-library.js"));
vm.runInThisContext(read("js/core/guides.js"));
const X = global.SaltCore.covens.messageExtras;
const N = global.SaltCore.covens.messageNotes;
const P = global.SaltCore.guides.reminderPrefs;

test("reactions group and toggle as in the app", () => {
  let list = [
    { message_id: "m", user_id: "a", emoji: "🔥" },
    { message_id: "m", user_id: "b", emoji: "🔥" }
  ];
  assert.equal(X.reactionGroups(list, "m", "a")[0].count, 2);
  assert.equal(X.reactionToggle(list, "m", "a", "🔥"), "remove");
  list = X.withReaction(list, { message_id: "m", user_id: "a", emoji: "🔥" }, false);
  assert.equal(X.reactionGroups(list, "m", "a")[0].mine, false);
});

test("the tally, changing an answer, and the RSVP it sets", () => {
  const buttons = X.cleanReplyButtons({ preset: "gathering", ritual_id: "r1" });
  let answers = [{ message_id: "m", user_id: "a", choice: 0 }, { message_id: "m", user_id: "b", choice: 2 }];
  assert.equal(X.tallyWords(X.answerTally(buttons, answers, "m", "a")), "Coming 1 · Can’t 1");
  const { choice } = X.answerChange(X.myAnswer(answers, "m", "a"), 1);
  answers = X.withAnswer(answers, { message_id: "m", user_id: "a", choice }, true);
  assert.equal(X.tallyWords(X.answerTally(buttons, answers, "m", "a")), "Late 1 · Can’t 1");
  assert.equal(X.rsvpFor(buttons, choice), "going");
  assert.equal(X.rsvpFor(buttons, 2), "not_going");
});

test("the plan's chat reminder, when it is due, and the summary's batching", () => {
  const plan = X.withChatReminder(global.SaltCore.covens.builder.cleanPlan({}), 30);
  assert.equal(X.chatReminder(global.SaltCore.covens.builder.cleanPlan(plan)), 30);
  const ritual = { status: "scheduled", scheduled_for: "2026-11-02T20:00:00Z", plan };
  assert.equal(N.reminderDue(ritual, new Date("2026-11-02T19:29:00Z")), false);
  assert.equal(N.reminderDue(ritual, new Date("2026-11-02T19:30:00Z")), true);
  assert.equal(N.answerPushDue("2026-11-02T19:58:00Z", new Date("2026-11-02T20:00:00Z")), false);
  assert.deepEqual(N.GATHERING_LABELS, X.GATHERING_LABELS);
});

test("each person's choices, the same in Reminders on the website", () => {
  const prefs = P.normalizePrefs({});
  assert.deepEqual(prefs.messages, { reactions: false, answers: true });
  assert.equal(N.wantsMessageNote(JSON.stringify(P.withChange(prefs, "messages.reactions", true)), "reactions"), true);
  const page = read("reminders/reminders.js");
  assert.match(page, /"messages\.reactions"/);
  assert.match(page, /"messages\.answers"/);
});

test("the chat, its data and the builder are wired to it", () => {
  const chat = read("covens/coven/chat.js");
  for (const hook of ["data-react-open", "data-emoji-more", "data-answer", "data-who-answers", "data-who-reacted", "data-buttons-open", "coven_message_reactions"]) assert.ok(chat.includes(hook), hook);
  const data = read("covens/coven-data.js");
  for (const call of ["messageExtras(", "react(", "answerButtons(", "askDueReminders(", "reply_buttons"]) assert.ok(data.includes(call), call);
  assert.ok(read("covens/coven/builder.js").includes('"chat-reminder"'));
});
