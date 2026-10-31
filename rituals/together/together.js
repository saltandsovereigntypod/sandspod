/*
 * Rituals together on the website, as the app's rituals/together screens have
 * them. /rituals/together/ is the hub: begin one (handed over by a Begin
 * together button: sessionStorage "together.start"), join with a code or link
 * (?code=…), and the ones you're in. /rituals/together/?id=… is the ritual
 * itself: the same step for everyone as the leader moves on, the shared
 * candle, who's here, the chat (or quiet), and the shared ending with a note
 * to your own journal. The rules are the app's (SaltCore.together.live), the
 * database applies them again (live_ritual_act), and the page follows along
 * on Supabase Realtime, checking in every 20 seconds for "who's here".
 */
(function (global) {
  "use strict";

  const doc = global.document;
  const root = doc.querySelector("[data-page-root]");
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;
  const { header } = global.GuidesUI;
  const T = global.SaltCore.together;
  const LV = T.live;
  const START_KEY = "together.start";
  const params = new URLSearchParams(global.location.search);
  const liveId = /^[0-9a-f-]{36}$/i.test(params.get("id") || "") ? params.get("id") : null;

  let context = null;
  const db = () => global.db;
  const rpc = async (name, args) => {
    const { data, error } = await db().rpc(name, args);
    if (error) throw new Error(error.message);
    return data;
  };
  const ring = (body) => db().functions.invoke("coven-notify", { body }).catch(() => {});
  const nameOf = (id) => UI.nameOf(context, id);

  function status(message) {
    const el = root.querySelector("[data-tg-status]");
    if (el) el.textContent = message || "";
  }
  async function attempt(work) {
    status("");
    try {
      return await work();
    } catch (error) {
      status(error?.message || "Something went wrong. Please try again.");
      return null;
    }
  }
  const guidance = () => `<section class="sp-section"><h2 class="sp-label">Good to know</h2>${LV.TOGETHER_GUIDANCE.map((l) => `<p class="sp-caption">${esc(l)}</p>`).join("")}</section>`;

  /** Keep what's typed (and where the cursor was) across a redraw. */
  function redraw(html) {
    const kept = {};
    root.querySelectorAll("textarea[name], input[name]").forEach((el) => (kept[el.name] = el.value));
    const focused = doc.activeElement?.name;
    root.innerHTML = html;
    Object.entries(kept).forEach(([name, value]) => {
      const el = root.querySelector(`[name="${name}"]`);
      if (el && el.type !== "checkbox") el.value = value;
    });
    if (focused) root.querySelector(`[name="${focused}"]`)?.focus();
  }

  function readStart() {
    try {
      const raw = JSON.parse(global.sessionStorage.getItem(START_KEY) || "null");
      if (!raw) return null;
      if (raw.kind === "draft") return { ...LV.startFromDraft(raw.draft, raw.source || { kind: "free" }) };
      if (raw.kind === "gathering") return { ...LV.startFromGathering(raw.ritual, raw.steps || [], raw.slug), coven_id: raw.ritual.coven_id, gathering_id: raw.ritual.id };
    } catch {
      // Nothing usable handed over.
    }
    return null;
  }

  // ─── The hub ────────────────────────────────────────────────────────────

  async function hub() {
    const start = params.get("start") ? readStart() : null;
    const code = LV.parseLiveCode(params.get("code") || "");
    let preview = null;
    let mine = [];
    if (context.user && context.profile) {
      if (code) preview = await rpc("live_ritual_preview", { p_code: code }).catch(() => null);
      const { data: rows } = await db().from("live_ritual_people").select("live_id").eq("user_id", context.user.id).is("removed_at", null).is("left_at", null);
      const ids = (rows || []).map((r) => r.live_id);
      if (ids.length) mine = ((await db().from("live_rituals").select("*").in("id", ids).neq("status", "ended")).data || []).filter((l) => !LV.isOver(l));
    }
    const appLink = code ? LV.appLiveLink(code) : null;
    redraw(`${header({ title: "Rituals together", eyebrow: "Rituals", back: "/rituals/", backLabel: "Rituals" })}
      <p>Do a ritual live with others, each from where you are. The one leading moves everyone through the same steps; you light a candle together, see who’s here, talk quietly in the chat or not at all, and close it together.</p>
      ${!context.user ? `<div class="sp-card"><p>Sign in to do a ritual together with your coven or friends.</p><a class="button button--primary" href="/?sanctuary=auth">Sign in</a></div>` : ""}
      ${context.user && !context.profile ? `<p class="sp-notice">Rituals together use your community profile, the name others see. Making one asks you to confirm you are 18 or older.</p><div data-tg-profile></div>` : ""}
      ${context.banned ? `<p class="sp-notice">Your community access is paused, so rituals together aren’t open to you.</p>` : ""}
      ${
        start && context.profile && !context.banned
          ? `<section class="sp-section"><h2 class="sp-label">Begin together</h2><article class="sp-card">
              <h3>${esc(start.title)}</h3>${start.intention ? `<p>${esc(start.intention)}</p>` : ""}
              <p class="sp-caption">${start.steps.length} ${start.steps.length === 1 ? "step" : "steps"}${start.gathering_id ? " · everyone the gathering is for can join from its page, and hears it has begun" : " · you’ll have a link to invite people"}</p>
              <div class="sp-actions"><button type="button" class="button button--primary" data-tg-open>Open the ritual for others to join</button></div></article></section>`
          : ""
      }
      ${
        context.profile && !context.banned
          ? `<section class="sp-section"><h2 class="sp-label">Join with a code</h2>
              <form class="sp-field" data-tg-code><label for="tg-code">The code or link you were sent</label>
                <input id="tg-code" name="code" autocomplete="off" value="${esc(code || "")}" />
                <div class="sp-actions"><button class="button button--ghost" type="submit">Look it up</button></div></form>
              ${code && preview && !preview.found ? `<p class="sp-caption">That ritual together wasn’t found, or it has ended.</p>` : ""}
              ${
                preview?.found
                  ? `<article class="sp-card"><h3>${esc(preview.title)}</h3><p class="sp-caption">Hosted by ${esc(preview.host_name || "a witch")}${preview.coven_name ? ` · ${esc(preview.coven_name)}` : ""} · ${preview.people || 0} here</p>
                      <div class="sp-actions"><button type="button" class="button button--primary" data-tg-join="${esc(preview.id)}">Join</button>${appLink ? `<a class="button button--ghost" href="${esc(appLink)}">Open in the app</a>` : ""}</div></article>`
                  : ""
              }</section>`
          : ""
      }
      ${
        mine.length
          ? `<section class="sp-section"><h2 class="sp-label">Yours now</h2><ul class="sp-list">${mine
              .map((l) => `<li><a href="/rituals/together/?id=${esc(l.id)}">${esc(l.title)}</a> <span class="sp-caption">${l.host_id === context.user.id ? "Hosting" : "Joined"} · ${esc(LV.statusLine(l))}</span></li>`)
              .join("")}</ul></section>`
          : ""
      }
      <section class="sp-section"><h2 class="sp-label">Begin one from</h2><ul class="sp-list">
        <li><a href="/rituals/premade/">Workings library</a> <span class="sp-caption">Open one, then Begin together</span></li>
        <li><a href="/rituals/spell/">The spell builder</a> <span class="sp-caption">Write a spell, then Begin together</span></li>
        <li><a href="/covens/">Your covens’ gatherings</a> <span class="sp-caption">A coven rite: Begin together on its page</span></li>
      </ul></section>
      ${guidance()}
      <p class="cv-status" role="status" aria-live="polite" data-tg-status></p>`);
    const holder = root.querySelector("[data-tg-profile]");
    if (holder) UI.profileForm(holder, context, { onSaved: () => hub() });
    root.querySelector("[data-tg-code]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const next = LV.parseLiveCode(event.target.elements.code.value);
      if (!next) return status("That doesn’t look like a ritual together code.");
      global.location.search = `?code=${encodeURIComponent(next)}`;
    });
    root.querySelector("[data-tg-join]")?.addEventListener("click", async (event) => {
      const row = await attempt(() => rpc("join_live_ritual", { p_live: event.target.dataset.tgJoin, p_code: code }));
      if (row) global.location.href = `/rituals/together/?id=${encodeURIComponent(row.id)}`;
    });
    root.querySelector("[data-tg-open]")?.addEventListener("click", async (event) => {
      event.target.disabled = true;
      const row = await attempt(() =>
        rpc("start_live_ritual", { p_title: start.title, p_intention: start.intention, p_steps: start.steps, p_source: start.source, p_coven: start.coven_id || null, p_gathering: start.gathering_id || null })
      );
      event.target.disabled = false;
      if (!row) return;
      try {
        global.sessionStorage.removeItem(START_KEY);
      } catch {
        // Fine.
      }
      if (row.coven_ritual_id) await ring({ live_ritual_id: row.id });
      global.location.href = `/rituals/together/?id=${encodeURIComponent(row.id)}`;
    });
  }

  // ─── The ritual ─────────────────────────────────────────────────────────

  const state = { live: null, people: [], messages: [], online: [], saved: false, missing: false };

  async function load() {
    const [live, people, messages] = await Promise.all([
      db().from("live_rituals").select("*").eq("id", liveId).maybeSingle(),
      db().from("live_ritual_people").select("*").eq("live_id", liveId),
      db().from("live_ritual_messages").select("*").eq("live_id", liveId).is("deleted_at", null).order("created_at", { ascending: true }).limit(300),
    ]);
    state.live = live.data || null;
    state.missing = !state.live;
    state.people = people.data || [];
    state.messages = messages.data || [];
    if (state.live) await UI.loadNames(context, [state.live.host_id, ...state.people.map((p) => p.user_id), ...state.messages.map((m) => m.user_id)]);
    render();
  }

  const act = (action) =>
    attempt(() =>
      rpc("live_ritual_act", {
        p_live: liveId,
        p_action: action.type,
        p_version: state.live.version,
        p_step: action.type === "go" ? action.step : null,
        p_to: action.type === "pass" ? action.to : null,
        p_on: action.type === "quiet" ? action.on : null,
      })
    ).then(load);

  function render() {
    const back = { back: "/rituals/together/", backLabel: "Rituals together" };
    const live = state.live;
    if (!live) {
      redraw(`${header({ title: "Ritual together", eyebrow: "Rituals", ...back })}<p class="sp-notice">That ritual together wasn’t found. It may have ended, or the host may have asked you to leave.</p>`);
      return;
    }
    global.document.title = `${live.title} | Salt & Sovereignty`;
    const me = context.user.id;
    const now = new Date();
    const mine = state.people.find((p) => p.user_id === me) || null;
    const inIt = !!mine && !mine.left_at && !mine.removed_at;
    const over = LV.isOver(live, now);
    const hosts = live.host_id === me;
    const leader = LV.leaderOf(live);
    const leads = leader === me;
    const step = live.status === "live" ? live.steps[live.current_step] : null;
    const ending = LV.endingCount(state.people);
    const here = LV.whoIsHere(state.people, state.online, now);
    const blocks = new Set(context.blocks || []);
    const shown = state.messages.filter((m) => !blocks.has(m.user_id));
    const from = LV.sourceHref(live.source, false);
    const link = LV.liveLink(live.invite_code);
    const btn = (label, attrs, kind = "ghost") => `<button type="button" class="button button--${kind}" ${attrs}>${esc(label)}</button>`;
    const small = (label, attrs) => `<button type="button" class="tg-link" ${attrs}>${esc(label)}</button>`;

    const body = !inIt
      ? mine?.removed_at
        ? `<p class="sp-notice">The host has asked you to leave this ritual.</p>`
        : over
          ? ""
          : `<article class="sp-card"><p>Hosted by ${esc(nameOf(live.host_id))}. Join to follow the steps with everyone.</p><div class="sp-actions">${btn("Join", "data-tg-act=join", "primary")}</div></article>`
      : `
        <article class="sp-card tg-candle"><span class="tg-flame${live.candle_lit_at ? " is-lit" : ""}" aria-hidden="true"></span>
          <p>${esc(live.candle_lit_at ? `The candle is lit${live.candle_lit_by ? ` by ${nameOf(live.candle_lit_by)}` : ""}. Light yours now, wherever you are.` : "When the leader lights the candle, everyone lights their own together.")}</p></article>
        ${(leads || hosts) && !live.candle_lit_at && !over ? `<div class="sp-actions">${btn("Light the candle together", 'data-tg-act="light"')}</div>` : ""}
        ${live.status === "gathering" && live.source?.preparation ? `<section class="sp-section"><h2 class="sp-label">Before you begin</h2><p>${prose(live.source.preparation)}</p></section>` : ""}
        ${
          step
            ? `<article class="sp-card tg-step" aria-live="polite"><p class="sp-eyebrow">Step ${live.current_step + 1} of ${live.steps.length}</p><h2>${esc(step.title)}</h2>
                ${step.body ? `<p>${prose(step.body)}</p>` : ""}${step.spoken ? `<blockquote class="rt-spoken">${prose(step.spoken)}</blockquote>` : ""}${step.minutes ? `<p class="sp-caption">About ${esc(step.minutes)} min</p>` : ""}</article>`
            : ""
        }
        ${
          !over && leads
            ? `<div class="sp-actions">${live.status === "gathering" ? btn("Begin the ritual", 'data-tg-act="begin"', "primary") : ""}${
                live.status === "live" ? btn(live.current_step >= live.steps.length - 1 ? "To the ending" : "Next step", 'data-tg-act="next"', "primary") : ""
              }${(live.status === "live" && live.current_step > 0) || live.status === "closing" ? btn("Back a step", 'data-tg-act="back"') : ""}</div>`
            : ""
        }
        ${!over && !leads && live.status !== "closing" ? `<p class="sp-caption">${esc(nameOf(leader))} is leading. The steps move on for everyone together.</p>` : ""}
        ${
          live.status === "closing"
            ? `<section class="sp-section"><h2 class="sp-label">The ending</h2>${live.source?.closing ? `<p>${prose(live.source.closing)}</p>` : ""}
                <p>${ending.done} of ${ending.of} ${ending.all ? "· it is done, for all of you." : "have said it is done."}</p>
                ${mine.done_at ? `<p class="sp-caption">You said it is done.</p>` : `<div class="sp-actions">${btn("It is done", 'data-tg-act="done"', "primary")}</div>`}</section>`
            : ""
        }
        ${
          live.status === "closing" || over
            ? `<section class="sp-section"><h2 class="sp-label">For your own journal</h2>${
                state.saved
                  ? `<p class="sp-notice">Kept in your ritual journal.</p><p><a href="/rituals/journal/">Open your journal</a> · <a href="/grimoire/">Open your Grimoire</a></p>`
                  : `<p class="sp-caption">Only you see this. It goes into your ritual journal, with the ritual’s steps.</p>
                     <div class="sp-field"><label for="tg-note">A note (optional)</label><textarea id="tg-note" name="note" maxlength="${LV.NOTE_MAX}"></textarea></div>
                     <div class="sp-actions">${btn("Keep in my journal", 'data-tg-act="journal"')}</div>`
              }</section>`
            : ""
        }
        ${!over && (leads || hosts) && live.status === "live" ? `<p>${small("Open the ending now", 'data-tg-act="close"')}</p>` : ""}
        <section class="sp-section"><h2 class="sp-label">Who’s here · ${here.length}</h2><ul class="tg-people">${here
          .map(
            (p) => `<li><span class="tg-name">${esc(nameOf(p.user_id))}</span>${p.role === "host" ? `<span class="tg-pill">Host</span>` : ""}${leader === p.user_id ? `<span class="tg-pill">Leading</span>` : ""}${
              live.status === "closing" && p.done_at ? `<span class="tg-pill">Done</span>` : ""
            }${
              !over && p.user_id !== me
                ? `${(leads || hosts) && leader !== p.user_id ? small("Pass the lead", `data-tg-pass="${esc(p.user_id)}"`) : ""}${hosts ? small("Ask to leave", `data-tg-remove="${esc(p.user_id)}"`) : ""}${small("Report", `data-tg-report-person="${esc(p.user_id)}"`)}${
                    blocks.has(p.user_id) ? "" : small("Block", `data-tg-block="${esc(p.user_id)}"`)
                  }`
                : ""
            }</li>`
          )
          .join("")}</ul>
          ${hosts && leader !== me && !over ? `<div class="sp-actions">${btn("Take the lead back", `data-tg-pass="${esc(live.host_id)}"`)}</div>` : ""}</section>
        <section class="sp-section"><h2 class="sp-label">Chat</h2>
          <label class="cv-check"><input type="checkbox" data-tg-quiet-me ${mine.quiet ? "checked" : ""} /> <span>Quiet mode: hide the chat for me</span></label>
          ${hosts && !over ? `<label class="cv-check"><input type="checkbox" data-tg-quiet-all ${live.quiet ? "checked" : ""} /> <span>Quiet for everyone (no chat)</span></label>` : ""}
          ${live.quiet ? `<p class="sp-caption">The host has asked for quiet. The chat is closed.</p>` : ""}
          ${
            mine.quiet
              ? ""
              : `<div class="tg-chat" aria-live="polite">${shown.length ? "" : `<p class="sp-caption">Nothing said yet.</p>`}${shown
                  .map(
                    (m) => `<div class="tg-message${m.user_id === me ? " is-mine" : ""}"><strong>${esc(nameOf(m.user_id))}</strong>${esc(m.body)}<div>${m.user_id !== me ? small("Report", `data-tg-report-message="${esc(m.id)}"`) : ""}${
                      m.user_id === me || hosts ? small("Take down", `data-tg-hide="${esc(m.id)}"`) : ""
                    }</div></div>`
                  )
                  .join("")}</div>
                ${
                  LV.canChat(live, mine)
                    ? `<form data-tg-say><div class="sp-field"><label for="tg-say">Say something</label><textarea id="tg-say" name="say" maxlength="${LV.MESSAGE_MAX}"></textarea></div><div class="sp-actions"><button class="button button--ghost" type="submit">Send</button></div></form>`
                    : ""
                }`
          }</section>
        ${
          !over
            ? `<section class="sp-section"><h2 class="sp-label">Invite</h2><p class="sp-caption">Code ${esc(live.invite_code)}${live.coven_ritual_id ? " · everyone the gathering is for can also join from its page" : ""}</p>
                <div class="sp-actions">${btn("Copy the link", `data-tg-copy="${esc(link)}"`)}<a class="button button--ghost" href="${esc(LV.appLiveLink(live.invite_code))}">Open in the app</a></div></section>`
            : ""
        }
        <div class="sp-actions">${!over && hosts ? btn("End the ritual for everyone", 'data-tg-act="end"') : ""}${!over && !hosts ? btn("Leave", 'data-tg-act="leave"') : ""}${
          !hosts ? small("Report this ritual", "data-tg-report-ritual") : ""
        }</div>`;

    redraw(`${header({ title: live.title, eyebrow: "Ritual together", ...back })}
      <p class="sp-caption">${esc(over ? "This ritual has ended." : LV.statusLine(live))}</p>
      ${live.intention ? `<p>${prose(live.intention)}</p>` : ""}
      ${body}
      ${from ? `<p><a href="${esc(from)}">Open the ritual it came from</a></p>` : ""}
      <p class="cv-status" role="status" aria-live="polite" data-tg-status></p>`);
  }

  function wireRitual() {
    root.addEventListener("click", async (event) => {
      const el = event.target.closest("button");
      if (!el || el.disabled || !state.live) return;
      const live = state.live;
      const me = context.user.id;
      const a = el.dataset.tgAct;
      if (a === "join") {
        if (await attempt(() => rpc("join_live_ritual", { p_live: liveId, p_code: null }))) {
          await load();
          follow();
        }
      } else if (a === "done") await attempt(() => rpc("live_ritual_mine", { p_live: liveId, p_done: true, p_quiet: null })).then(load);
      else if (a === "leave") {
        if (await attempt(() => rpc("live_ritual_leave", { p_live: liveId }))) global.location.href = "/rituals/together/";
      } else if (a === "end") {
        if (await UI.confirmAction("End the ritual for everyone?", "Everyone’s page shows that it has ended. Each of you can still keep a note in your journal.", "End it")) await act({ type: "end" });
      } else if (a === "journal") {
        const note = root.querySelector('[name="note"]')?.value || "";
        const saved = await attempt(async () => {
          const at = new Date();
          const answers = { ...T.blankAnswers(null, at), ...LV.journalAnswers(live, note, Math.max(1, LV.endingCount(state.people).of), at) };
          const entry = T.journalPayload({ session: null, answers, userId: me, id: global.crypto.randomUUID(), existing: null, now: at });
          const { data, error } = await db().from("user_rituals").insert(T.journalRow(entry, me)).select("*").single();
          if (error) throw new Error(error.message);
          await db().from("living_library_entries").upsert(T.journalLibraryEntry(data, me, at), { onConflict: "user_id,entity_id" });
          return true;
        });
        if (saved) {
          state.saved = true;
          render();
        }
      } else if (a) await act({ type: a });
      else if (el.dataset.tgPass) await act({ type: "pass", to: el.dataset.tgPass });
      else if (el.dataset.tgRemove) {
        if (await UI.confirmAction(`Ask ${nameOf(el.dataset.tgRemove)} to leave?`, "They won’t be able to come back to this ritual.", "Ask to leave"))
          await attempt(() => rpc("live_ritual_remove", { p_live: liveId, p_user: el.dataset.tgRemove })).then(load);
      } else if (el.dataset.tgBlock) {
        await attempt(() => D.block(me, el.dataset.tgBlock));
        context.blocks = await D.myBlocks(me).catch(() => context.blocks);
        render();
      } else if (el.dataset.tgReportPerson) UI.report({ target_type: "member", target_user_id: el.dataset.tgReportPerson, coven_id: live.coven_id, label: nameOf(el.dataset.tgReportPerson) });
      else if (el.dataset.tgReportMessage) UI.report({ target_type: "live_message", target_id: el.dataset.tgReportMessage, label: "this message" });
      else if (el.hasAttribute("data-tg-report-ritual")) UI.report({ target_type: "live_ritual", target_id: live.id, label: "this ritual" });
      else if (el.dataset.tgHide) await attempt(() => rpc("live_ritual_hide_message", { p_message: el.dataset.tgHide })).then(load);
      else if (el.dataset.tgCopy) {
        const ok = await global.navigator.clipboard?.writeText(el.dataset.tgCopy).then(() => true, () => false);
        status(ok ? "Link copied." : el.dataset.tgCopy);
      }
    });
    root.addEventListener("change", async (event) => {
      if (event.target.matches("[data-tg-quiet-me]")) await attempt(() => rpc("live_ritual_mine", { p_live: liveId, p_done: null, p_quiet: event.target.checked })).then(load);
      else if (event.target.matches("[data-tg-quiet-all]")) await act({ type: "quiet", on: event.target.checked });
    });
    root.addEventListener("submit", async (event) => {
      if (!event.target.matches("[data-tg-say]")) return;
      event.preventDefault();
      const box = event.target.elements.say;
      const body = box.value.trim();
      if (!body) return;
      const done = await attempt(async () => {
        const { error } = await db().from("live_ritual_messages").insert({ live_id: liveId, user_id: context.user.id, body });
        if (error) throw new Error(error.message);
        return true;
      });
      if (done) {
        box.value = "";
        await load();
      }
    });
  }

  let channel = null;
  function follow() {
    const mine = state.people.find((p) => p.user_id === context.user.id);
    if (channel || !mine || mine.left_at || mine.removed_at) return;
    channel = db().channel(`live-ritual:${liveId}`, { config: { presence: { key: context.user.id } } });
    for (const [table, column] of [["live_rituals", "id"], ["live_ritual_people", "live_id"], ["live_ritual_messages", "live_id"]]) {
      channel.on("postgres_changes", { event: "*", schema: "public", table, filter: `${column}=eq.${liveId}` }, () => load());
    }
    channel.on("presence", { event: "sync" }, () => {
      state.online = Object.keys(channel.presenceState());
      render();
    });
    channel.subscribe((s) => {
      if (s === "SUBSCRIBED") channel.track({ user_id: context.user.id, name: nameOf(context.user.id) });
    });
    const beat = () => rpc("live_ritual_here", { p_live: liveId }).catch(() => {});
    beat();
    global.setInterval(() => {
      beat();
      render();
    }, 20000);
    global.setInterval(load, 30000);
  }

  async function start() {
    context = await UI.boot();
    if (!liveId) return hub();
    if (!context.user) {
      redraw(`${header({ title: "Ritual together", eyebrow: "Rituals", back: "/rituals/together/", backLabel: "Rituals together" })}<div class="sp-card"><p>Sign in to join this ritual together.</p><a class="button button--primary" href="/?sanctuary=auth">Sign in</a></div>`);
      return;
    }
    wireRitual();
    await load();
    follow();
  }

  start().catch((error) => {
    root.innerHTML = `<h1>Rituals together</h1><p class="sp-notice">${esc(error?.message || "This page couldn’t open. Please refresh.")}</p>`;
  });
})(window);
