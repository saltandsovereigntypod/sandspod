// Coven invitations on the website, level with the app: the join page reads
// codes and links as the app does (SaltCore.covens.invites), invitations sent
// and accepted ring phones through coven-notify, the Invite tab, Manage and
// My covens carry the same tools, and the Reminders page keeps the same
// synced choice.
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
const I = global.SaltCore.covens.invites;
const P = global.SaltCore.guides.reminderPrefs;

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

test("codes and links read the same on the website as in the app", () => {
  assert.equal(I.parseInviteCode("https://saltandsovereignty.com/covens/join/?code=k7q2mx9p4r"), "K7Q2MX9P4R");
  assert.equal(I.parseInviteCode("saltandsovereignty://coven/join/K7Q2MX9P4R"), "K7Q2MX9P4R");
  assert.equal(I.parseInviteCode("K7Q2-MX9P-4R"), "K7Q2MX9P4R");
  assert.equal(I.parseInviteCode("nope"), null);
  assert.equal(I.inviteLink("K7Q2MX9P4R"), "https://saltandsovereignty.com/covens/join/?code=K7Q2MX9P4R");
  assert.equal(I.appInviteLink("K7Q2MX9P4R"), "saltandsovereignty://coven/join/K7Q2MX9P4R");
  assert.match(I.APP_STORE_URL, /^https:\/\/apps\.apple\.com\/app\/id\d+$/);
  assert.match(I.PLAY_STORE_URL, /^https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.saltandsovereignty\.app$/);
});

test("sending and accepting an invitation ring phones (coven-notify) with its id, as the app does; declining doesn't", async () => {
  const db = fakeDb({
    "rpc:invite_to_coven": { data: { id: "i1", status: "pending" }, error: null },
    "rpc:respond_to_coven_invitation": { data: { id: "i1", status: "accepted" }, error: null }
  });
  const D = loadCovenData(db);
  await D.inviteToCoven("c1", "u2", "  Come  ");
  await D.respondToInvitation("i1", true);
  await D.respondToInvitation("i1", false);
  assert.deepEqual(
    db.calls.filter((c) => c.invoke).map((c) => c.options.body),
    [{ invitation_id: "i1" }, { invitation_id: "i1" }]
  );
  assert.deepEqual(db.calls.find((c) => c.rpc === "invite_to_coven").args, { p_coven: "c1", p_user: "u2", p_message: "Come" });
  const api = read("app/src/lib/covens/api.ts");
  assert.match(api, /invitation_id: id/);
  for (const name of ["create_coven_invite_link", "revoke_coven_invite_link", "coven_invite_preview", "accept_coven_invite_link", "search_invitable_people", "invite_to_coven", "respond_to_coven_invitation", "revoke_coven_invitation", "coven_invite_settings"]) {
    assert.match(api, new RegExp(`'${name}'`), `app calls ${name}`);
    assert.match(read("covens/coven-data.js"), new RegExp(`"${name}"`), `website calls ${name}`);
  }
});

test("a link is made with the app's choices", async () => {
  const db = fakeDb({ "rpc:create_coven_invite_link": { data: { id: "l1", code: "K7Q2MX9P4R" }, error: null } });
  const D = loadCovenData(db);
  const { days, uses } = I.linkOptions("never", "25");
  await D.createInviteLink("c1", days, uses, " ");
  assert.deepEqual(db.calls.find((c) => c.rpc).args, { p_coven: "c1", p_expires_in_days: null, p_max_uses: 25, p_note: null });
});

test("before the database has invitations, the settings read as none (no Invite tab)", async () => {
  const D = loadCovenData({ ...fakeDb(), rpc: () => Promise.resolve({ data: null, error: { message: "Could not find the function" } }) });
  assert.equal(await D.inviteSettings("c1"), null);
  assert.match(read("covens/coven/coven.js"), /state\.inviteSettings && \(state\.inviteSettings\.may_invite \|\| perms\.site\)/);
});

test("the join page: preview, open in the app, the stores, and accepting here", () => {
  const html = read("covens/join/index.html");
  assert.match(html, /<title>[^<]+\| Salt &amp; Sovereignty<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /<script src="\/js\/core\/covens\.js"><\/script>\s*<script src="\/covens\/join\/join\.js"><\/script>/);
  assert.match(html, /<script src="\/js\/site-nav\.js"><\/script>/);
  const js = read("covens/join/join.js");
  assert.match(js, /D\.previewInvite\(code\)/);
  assert.match(js, /I\.appInviteLink\(code\)/);
  assert.match(js, /Open in the app/);
  assert.match(js, /I\.APP_STORE_URL/);
  assert.match(js, /I\.PLAY_STORE_URL/);
  assert.match(js, /Accept on the website/);
  assert.match(js, /UI\.profileForm/);
  assert.match(js, /D\.sign\(d\.id, name\)/);
  assert.match(js, /D\.acceptInviteLink\(code\)/);
  assert.match(js, /D\.respondToInvitation\(invitation\.id, true\)/);
  assert.doesNotMatch(js, /referr/i);
});

test("My covens lists invitations with Accept and Decline; Find a coven takes a code or link", () => {
  const directory = read("covens/directory.js");
  assert.match(directory, /D\.myInvitations/);
  assert.match(directory, /data-invite-accept/);
  assert.match(directory, /data-invite-decline/);
  assert.match(directory, /Have an invite\?/);
  assert.match(directory, /parseInviteCode/);
  const app = read("app/src/app/(tabs)/coven/index.tsx");
  assert.match(app, /Section label="Invitations"/);
  assert.match(app, /Have an invite\?/);
});

test("the Invite tab has the app's tools, and Manage points to it", () => {
  const invite = read("covens/coven/invite.js");
  for (const words of ["Share an invite link", "Invite someone in the app", "Invite links", "Invitations waiting", "Members may invite people", "Copy link", "Revoke"]) {
    assert.ok(invite.includes(words), words);
    assert.ok(read("app/src/app/(tabs)/coven/c/[slug]/invite.tsx").includes(words), `app: ${words}`);
  }
  assert.match(read("covens/coven/index.html"), /<script src="\/covens\/coven\/invite\.js"><\/script>/);
  assert.match(read("covens/coven/manage.js"), /data-tab="invite"/);
});

test("the Reminders page keeps the invitations choice with the synced reminders", () => {
  assert.deepEqual(P.DEFAULT_PREFS.invitations, { on: true, accepted: true });
  const reminders = read("reminders/reminders.js");
  assert.match(reminders, /"invitations\.on"/);
  assert.match(reminders, /"invitations\.accepted"/);
});

test("the help guide explains inviting, and the guidelines mention invitations", () => {
  const topics = global.SaltCore.guides.help.HELP.flatMap((s) => s.topics);
  const found = topics.find((t) => t.id === "covens-invite");
  assert.equal(found?.title, "Invite people to your coven");
  assert.ok(global.SaltCore.guides.help.searchHelp("invite link").some((r) => r.topic.id === "covens-invite"));
  assert.match(read("covens/guidelines/index.html"), /Joining and invitations/);
});
