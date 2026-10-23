/*
 * A coven's Gathering: live chat over Supabase Realtime. New messages, edits
 * and removals arrive as they happen (covens/coven/coven.js holds the live
 * connection and passes changes here). Members in good standing can speak;
 * the coven's moderators and the site's can remove messages; anyone can
 * report a message or block its author so they no longer see their words.
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;

  let pane = null;
  let state = null;
  let messages = [];
  let editing = null;
  let connection = "";

  const nearBottom = (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 80;

  function actions(m) {
    const me = state.context.user?.id;
    if (m.deleted_at) return "";
    const own = m.user_id === me;
    const canRemove = own || state.perms.moderate || state.perms.site;
    const editable = own && Date.now() - new Date(m.created_at).getTime() < 86400000 && state.standing.ok;
    const blocked = state.context.blocks.includes(m.user_id);
    return `<div class="cv-msg__actions">
        ${editable ? `<button type="button" data-edit="${esc(m.id)}">Edit</button>` : ""}
        ${canRemove ? `<button type="button" data-remove="${esc(m.id)}">${own ? "Delete" : "Remove"}</button>` : ""}
        ${own ? "" : `<button type="button" data-report="${esc(m.id)}">Report</button>`}
        ${own || !m.user_id ? "" : `<button type="button" data-block="${esc(m.user_id)}">${blocked ? "Unblock" : "Block"}</button>`}
      </div>`;
  }

  function messageHtml(entry) {
    if (entry.type === "day") return `<p class="cv-day">${esc(entry.label)}</p>`;
    const m = entry.message;
    const time = new Date(m.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const body = m.deleted_at
      ? `<p class="cv-msg__body cv-msg__body--gone">${m.deleted_by && m.deleted_by !== m.user_id ? "Removed by a moderator." : "Message deleted."}</p>`
      : entry.hidden
        ? `<p class="cv-msg__body cv-msg__body--gone">A message from someone you’ve blocked.</p>`
        : `<p class="cv-msg__body">${prose(m.body)}</p>`;
    return `<article class="cv-msg" data-id="${esc(m.id)}">
        <div class="cv-msg__head"><span class="cv-msg__name">${esc(entry.hidden ? "Blocked" : UI.nameOf(state.context, m.user_id))}</span>
          <time class="cv-msg__time" datetime="${esc(m.created_at)}">${esc(time)}${m.edited_at && !m.deleted_at ? " · edited" : ""}</time></div>
        ${body}${entry.hidden ? "" : actions(m)}
      </article>`;
  }

  function render({ stick } = {}) {
    if (!pane) return;
    const log = pane.querySelector("[data-log]");
    const keep = stick || nearBottom(log);
    const timeline = L.chatTimeline(messages, state.context.blocks);
    log.innerHTML = timeline.length ? timeline.map(messageHtml).join("") : `<p class="sp-empty">No one has spoken yet. Light the way.</p>`;
    if (keep) log.scrollTop = log.scrollHeight;
  }

  function presence(list) {
    if (!pane) return;
    const el = pane.querySelector("[data-presence]");
    const names = (list || []).map((p) => p.name).filter(Boolean);
    el.innerHTML = names.length
      ? `<span class="cv-presence__dot" aria-hidden="true"></span> Here now: ${names.map(esc).join(", ")}`
      : connection === "SUBSCRIBED" ? "Connected." : "Connecting to the gathering…";
  }

  function composerHtml() {
    if (!state.perms.member) return `<p class="sp-caption">${state.perms.site ? "You’re reading as a site moderator. Join the coven to speak." : "Only members can speak here."}</p>`;
    if (!state.standing.ok) return `<p class="sp-notice">${esc(state.standing.reasons.join(" "))}</p>`;
    return `<form class="cv-composer" data-composer>
        <label class="sr-only" for="cv-message">Message</label>
        <textarea id="cv-message" name="body" maxlength="2000" rows="2" placeholder="Speak to the coven…" required></textarea>
        <button class="button button--primary" type="submit">Send</button>
      </form>
      <p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  }

  async function mount(el, s) {
    pane = el;
    state = s;
    editing = null;
    pane.innerHTML = `<section class="cv-gathering" aria-label="Gathering">
        <p class="cv-presence" data-presence aria-live="polite"></p>
        <div class="sp-actions"><button class="button button--ghost button--small" type="button" data-older hidden>Show earlier messages</button></div>
        <div class="cv-chat" role="log" aria-live="polite" aria-relevant="additions" data-log><p class="sp-caption">Opening the gathering…</p></div>
        ${composerHtml()}
        <p class="sp-caption">Be kind. What’s shared here stays in the coven. Moderators can read every coven to keep it safe.</p>
      </section>`;
    presence(s.presence);

    try {
      messages = await D.recentMessages(s.coven.id);
      await UI.loadNames(s.context, messages.map((m) => m.user_id));
    } catch (error) {
      pane.querySelector("[data-log]").innerHTML = `<p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
      return;
    }
    if (pane !== el) return;
    pane.querySelector("[data-older]").hidden = messages.length < 150;
    render({ stick: true });
    wire();
  }

  function wire() {
    const form = pane.querySelector("[data-composer]");
    const status = pane.querySelector("[data-status]");
    const textarea = form?.elements.body;

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const body = textarea.value.trim();
      if (!body) return;
      const target = editing;
      const sent = await UI.busy(form, status, () => (target ? D.editMessage(target, body) : D.send(state.coven.id, body)));
      if (!sent) return;
      textarea.value = "";
      editing = null;
      textarea.placeholder = "Speak to the coven…";
      messages = L.applyChange(messages, { eventType: target ? "UPDATE" : "INSERT", new: sent });
      render({ stick: true });
      textarea.focus();
    });
    textarea?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
      if (event.key === "Escape" && editing) {
        editing = null;
        textarea.value = "";
        textarea.placeholder = "Speak to the coven…";
      }
    });

    pane.querySelector("[data-older]").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const first = messages[0];
      if (!first) return;
      const older = await UI.busy(button, null, () => D.olderMessages(state.coven.id, first.created_at));
      if (!older) return;
      await UI.loadNames(state.context, older.map((m) => m.user_id));
      messages = [...older, ...messages];
      button.hidden = older.length < 100;
      const log = pane.querySelector("[data-log]");
      const height = log.scrollHeight;
      render();
      log.scrollTop = log.scrollHeight - height;
    });

    pane.querySelector("[data-log]").addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const id = button.dataset.edit || button.dataset.remove || button.dataset.report;
      const message = messages.find((m) => m.id === id);
      if (button.dataset.edit && message && textarea) {
        editing = message.id;
        textarea.value = message.body;
        textarea.placeholder = "Edit your message (Esc to cancel)";
        textarea.focus();
      } else if (button.dataset.remove) {
        const own = message?.user_id === state.context.user.id;
        if (!(await UI.confirmAction(own ? "Delete your message?" : "Remove this message?", own ? "" : "Its words are removed for everyone. If it breaks the guidelines, report it as well so the site moderators keep a copy.", own ? "Delete" : "Remove"))) return;
        const done = await UI.busy(button, status, () => D.removeMessage(id).then(() => true));
        if (done) {
          messages = L.applyChange(messages, { eventType: "UPDATE", new: { id, body: "", deleted_at: new Date().toISOString(), deleted_by: state.context.user.id } });
          render();
        }
      } else if (button.dataset.report && message) {
        UI.report({ target_type: "message", target_id: message.id, coven_id: state.coven.id, target_user_id: message.user_id, label: "this message" });
      } else if (button.dataset.block) {
        const who = button.dataset.block;
        const blocked = state.context.blocks.includes(who);
        if (!blocked && !(await UI.confirmAction(`Block ${UI.nameOf(state.context, who)}?`, "You won’t see their messages in any coven. They aren’t told.", "Block"))) return;
        const done = await UI.busy(button, status, () => (blocked ? D.unblock(state.context.user.id, who) : D.block(state.context.user.id, who)).then(() => true));
        if (done) {
          state.context.blocks = blocked ? state.context.blocks.filter((b) => b !== who) : [...state.context.blocks, who];
          render();
        }
      }
    });
  }

  async function onChange(change) {
    if (!state || change?.new?.coven_id && change.new.coven_id !== state.coven.id) return;
    messages = L.applyChange(messages, change);
    if (change?.new?.user_id) await UI.loadNames(state.context, [change.new.user_id]);
    render();
  }

  function onStatus(status) {
    connection = status;
    if (pane) presence(state.presence);
  }

  function unmount() {
    pane = null;
  }

  global.CovenChat = { mount, unmount, onChange, onPresence: presence, onStatus };
})(window);
