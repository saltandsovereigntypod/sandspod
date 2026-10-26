/*
 * A coven's Messages, as in the app (coven/c/[slug]/chat/…): the whole
 * coven's chat first, then your own conversations inside the coven, one to
 * one or in small groups (coven_conversations, 20261029000000_…). They read
 * like a phone's messages (bubbles, yours on the right, a time between runs:
 * the app's own app/src/lib/covens/thread.ts, via js/core/covens.js).
 *
 * New messages, edits and removals arrive live (covens/coven/coven.js holds
 * the coven's connection and passes every message change here, even while
 * another tab is open, so the Messages tab can count what you haven't read).
 * When you last read the coven's chat is kept in this browser; for a
 * conversation it's also kept with the conversation (last_read_at), so it
 * follows you to the app. Positions that may chat (can_chat) can send.
 * Members can edit their words for a day, remove them, report a message or
 * block its writer; the coven's moderators and the site's can remove any.
 * After sending, the coven-notify function tells the others' phones.
 *
 * Address: ?tab=gathering (the coven's chat) or &thread=<conversation id>.
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, prose } = UI;
  const T = () => global.SaltCore?.covens?.thread || null;
  const U = () => global.SaltCore?.covens?.unreadCount || null;
  // Coven readings (the app's lib/covens/reading.ts): a spread drawn together, kept as chat messages.
  const RD = () => global.SaltCore?.covens?.reading || null;
  let readings = new Map();
  let beginning = false;

  let pane = null;
  let state = null;
  let api = null;
  let messages = [];
  let editing = null;
  let connection = "";
  let picking = null; // "new" | "add" | null
  let infoOpen = false;
  // Your conversations in this coven, and who's in each.
  let conversations = [];
  let members = [];
  let previews = {};
  // Unread counts per thread (threadKey: the coven's id, or "<coven>:<conversation>").
  let counts = {};
  let read = {};
  let primedFor = "";

  const me = () => state?.context.user?.id || null;
  const nameOf = (id) => UI.nameOf(state.context, id);
  const threadId = () => new URLSearchParams(global.location.search).get("thread") || null;
  const key = (conversationId) => (U() ? U().threadKey(state.coven.id, conversationId) : conversationId ? `${state.coven.id}:${conversationId}` : state.coven.id);
  const conversationOf = (id) => conversations.find((c) => c.id === id) || null;
  const myRow = (id) => members.find((m) => m.conversation_id === id && m.user_id === me()) || null;
  const nearBottom = (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  const threadHref = (id) => `${api.covenHref("gathering")}${id ? `&thread=${encodeURIComponent(id)}` : ""}`;
  const readKey = () => `coven.chat.read.${me()}`;

  // --- unread --------------------------------------------------------------------

  function loadRead() {
    try {
      read = JSON.parse(global.localStorage.getItem(readKey()) || "{}") || {};
    } catch {
      read = {};
    }
  }

  function storeRead() {
    try {
      global.localStorage.setItem(readKey(), JSON.stringify(read));
    } catch {
      // Private windows may refuse; the counts start again next visit.
    }
  }

  const total = () => (U() ? U().covenTotal(counts, state.coven.id) : Object.values(counts).reduce((a, b) => a + b, 0));

  function showTotal() {
    const tab = global.document.querySelector('.cv-tab[data-tab="gathering"]');
    if (!tab) return;
    let badge = tab.querySelector(".cv-count");
    const n = total();
    if (!n) return badge?.remove();
    if (!badge) {
      badge = global.document.createElement("span");
      badge.className = "cv-count";
      tab.appendChild(badge);
    }
    badge.textContent = String(n);
    badge.setAttribute("aria-label", `${n} unread`);
  }

  /** Count what's unread in the coven's chat and each conversation (coven.js calls this once the coven loads). */
  async function prime(s) {
    state = s;
    if (!me() || !(s.perms.member || s.perms.site) || primedFor === s.coven.id) return;
    primedFor = s.coven.id;
    loadRead();
    try {
      const list = await D.conversations(s.coven.id);
      conversations = list.conversations;
      members = list.members;
    } catch {
      conversations = [];
      members = [];
    }
    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    const covenKey = key(null);
    // First time in this browser: only the last day counts as new in the coven's chat.
    if (!read[covenKey]) read[covenKey] = dayAgo;
    const open = pane ? key(threadId()) : null;
    const jobs = [[null, read[covenKey]], ...conversations.filter((c) => myRow(c.id) && !myRow(c.id).left_at).map((c) => [c.id, [myRow(c.id).last_read_at, read[key(c.id)], c.created_at].filter(Boolean).sort().pop()])];
    await Promise.all(
      jobs.map(async ([id, since]) => {
        counts[key(id)] = key(id) === open ? 0 : await D.unreadSince(s.coven.id, id, me(), since).catch(() => 0);
      })
    );
    storeRead();
    showTotal();
    if (pane) drawList();
  }

  function markRead(conversationId) {
    const k = key(conversationId);
    read[k] = new Date().toISOString();
    counts[k] = 0;
    storeRead();
    showTotal();
    if (conversationId) D.markConversationRead(conversationId).catch(() => {});
  }

  // --- the list of threads ---------------------------------------------------------

  function threadTitle(c) {
    if (!c) return "The coven’s chat";
    return T() ? T().conversationTitle(c, members, me(), nameOf) : c.name || "Conversation";
  }

  function listHtml() {
    const current = threadId();
    const time = (iso) => (T() ? T().listTime(iso) : "");
    const preview = (id, group) => (T() ? T().previewLine(previews[id || "coven"], me(), nameOf, group) : "");
    const mine = conversations.filter((c) => myRow(c.id) && !myRow(c.id).left_at);
    const row = (id, title, group, extra = "") => {
      const n = counts[key(id)] || 0;
      const last = previews[id || "coven"];
      return `<a class="cv-thread${(current || null) === id ? " is-current" : ""}" href="${esc(threadHref(id))}" data-thread="${esc(id || "")}"${(current || null) === id ? ' aria-current="true"' : ""}>
          <span class="cv-thread__title">${esc(title)}${extra}</span>
          <span class="cv-thread__time">${esc(time(last?.created_at))}</span>
          <span class="cv-thread__preview">${esc(preview(id, group))}</span>
          ${n ? `<span class="cv-count" aria-label="${n} unread">${n}</span>` : ""}
        </a>`;
    };
    return `<nav class="cv-threads" aria-label="Conversations">
        ${row(null, "The coven’s chat", true)}
        ${mine.map((c) => row(c.id, threadTitle(c), c.kind === "group", myRow(c.id)?.muted ? ` <span class="sp-caption">· muted</span>` : "")).join("")}
        ${mine.length ? "" : `<p class="sp-caption">Your one-to-one chats and groups in this coven will be listed here.</p>`}
      </nav>
      ${canSend(null) ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-new>New message</button></div>` : ""}
      <p class="sp-caption">Phone notifications for messages are chosen in the app.</p>`;
  }

  function drawList() {
    const holder = pane?.querySelector("[data-list]");
    if (holder) holder.innerHTML = listHtml();
    wireList();
  }

  async function loadPreviews() {
    const ids = [null, ...conversations.filter((c) => myRow(c.id) && !myRow(c.id).left_at).map((c) => c.id)];
    await Promise.all(
      ids.map(async (id) => {
        const last = await D.latestMessage(state.coven.id, id).catch(() => null);
        if (last) previews[id || "coven"] = last;
      })
    );
    await UI.loadNames(state.context, [...Object.values(previews).map((m) => m.user_id), ...members.map((m) => m.user_id)]);
  }

  // --- one thread ------------------------------------------------------------------

  function canSend(conversationId) {
    if (!state.perms.member || !state.standing.ok || !state.perms.chat) return false;
    if (!conversationId) return true;
    const row = myRow(conversationId);
    return Boolean(row && !row.left_at);
  }

  function actions(m) {
    if (m.deleted_at) return "";
    const own = m.user_id === me();
    const canRemove = own || (!threadId() && (state.perms.moderate || state.perms.site)) || state.perms.site;
    const editable = own && Date.now() - new Date(m.created_at).getTime() < 86400000 && state.standing.ok;
    const blocked = state.context.blocks.includes(m.user_id);
    return `<div class="cv-msg__actions">
        ${editable ? `<button type="button" data-edit="${esc(m.id)}">Edit</button>` : ""}
        ${canRemove ? `<button type="button" data-remove="${esc(m.id)}">${own ? "Delete" : "Remove"}</button>` : ""}
        ${own ? "" : `<button type="button" data-report="${esc(m.id)}">Report</button>`}
        ${own || !m.user_id ? "" : `<button type="button" data-block="${esc(m.user_id)}">${blocked ? "Unblock" : "Block"}</button>`}
      </div>`;
  }

  /** A coven reading under its opening message: the shape, each card in its place, and a button to draw yours (the app's CovenReadingCard). */
  function readingHtml(reading) {
    const R = RD();
    const who = (id) => (id === me() ? "You" : nameOf(id));
    const mayDraw = state.perms.member && state.standing.ok && state.perms.chat && (!threadId() || canSend(threadId())) && R.canDraw(reading, me());
    return `<section class="sp-card cv-reading" aria-label="A coven reading">
        <p class="sp-eyebrow">A coven reading</p>
        ${reading.question ? `<h3 class="cv-reading__question">${esc(reading.question)}</h3>` : ""}
        <div class="cv-reading__shape">${R.covenDiagramSvg(reading.members.length, 120)}</div>
        <ol class="cv-reading__cards">${R.readingLines(reading, who)
          .map((line) => `<li>${esc(line)}</li>`)
          .join("")}</ol>
        <p class="sp-caption">${esc(R.drawnSoFar(reading))}</p>
        ${mayDraw ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-reading-draw="${esc(reading.id)}">Draw my card</button></div>` : ""}
      </section>`;
  }

  function bubbleHtml(item) {
    if (item.kind === "time") return `<p class="cv-day">${esc(item.label)}</p>`;
    const m = item.message;
    const body = m.deleted_at
      ? `<p class="cv-msg__body cv-msg__body--gone">${m.deleted_by && m.deleted_by !== m.user_id ? "Removed by a moderator." : "Message deleted."}</p>`
      : m.hidden
        ? `<p class="cv-msg__body cv-msg__body--gone">A message from someone you’ve blocked.</p>`
        : `<p class="cv-msg__body">${prose(m.body)}</p>`;
    const time = new Date(m.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `<article class="cv-bubble${item.mine ? " cv-bubble--mine" : ""}${item.first ? " is-first" : ""}${item.last ? " is-last" : ""}" data-id="${esc(m.id)}">
        ${item.showName ? `<p class="cv-bubble__name">${esc(m.hidden ? "Blocked" : nameOf(m.user_id))}</p>` : ""}
        <div class="cv-bubble__inner">${body}<time class="cv-bubble__time" datetime="${esc(m.created_at)}">${esc(time)}${m.edited_at && !m.deleted_at ? " · edited" : ""}</time></div>
        ${m.hidden ? "" : actions(m)}
      </article>${readings.has(m.id) ? readingHtml(readings.get(m.id)) : ""}`;
  }

  function render({ stick } = {}) {
    const log = pane?.querySelector("[data-log]");
    if (!log) return;
    const keep = stick || nearBottom(log);
    const group = !threadId() || conversationOf(threadId())?.kind === "group";
    const shown = messages.map((m) => ({ ...m, hidden: state.context.blocks.includes(m.user_id) }));
    readings = RD() ? new Map(RD().covenReadings(shown).map((r) => [r.id, r])) : new Map();
    const items = T() ? T().threadItems(shown, me(), group) : shown.map((message) => ({ kind: "message", key: message.id, message, mine: message.user_id === me(), first: true, last: true, showName: group }));
    log.innerHTML = items.length ? items.map(bubbleHtml).join("") : `<p class="sp-empty">${threadId() ? "No messages yet. Say hello." : "No one has spoken yet. Light the way."}</p>`;
    if (keep) log.scrollTop = log.scrollHeight;
  }

  function presence(list) {
    const el = pane?.querySelector("[data-presence]");
    if (!el) return;
    const names = (list || []).map((p) => p.name).filter(Boolean);
    el.innerHTML = threadId()
      ? ""
      : names.length
        ? `<span class="cv-presence__dot" aria-hidden="true"></span> In the coven now: ${names.map(esc).join(", ")}`
        : connection === "SUBSCRIBED" ? "Connected." : "Connecting…";
  }

  function composerHtml(conversationId) {
    if (!state.perms.member) return `<p class="sp-caption">${state.perms.site ? "You’re reading as a site moderator. Join the coven to speak." : "Only members can speak here."}</p>`;
    if (!state.standing.ok) return `<p class="sp-notice">${esc(state.standing.reasons.join(" "))}</p>`;
    if (!state.perms.chat) return `<p class="sp-notice">Your position doesn’t talk in the coven’s chat. The coven’s head can change that under Manage → Positions.</p>`;
    if (conversationId && !canSend(conversationId)) return `<p class="sp-caption">You’ve left this conversation.</p>`;
    const placeholder = conversationId ? "Message" : "Speak to the coven…";
    const begin = RD()
      ? beginning
        ? `<form class="sp-card cv-reading-begin" data-reading-begin>
            <p class="sp-caption">A card is drawn for the coven as a whole and shared here. Each member who joins draws their own, up to nine.</p>
            <div class="sp-field"><label for="cv-reading-question">What it’s about (if you like)</label><input id="cv-reading-question" name="question" maxlength="300" placeholder="The coming season, a working, the coven itself" /></div>
            <div class="sp-actions"><button class="button button--primary button--small" type="submit">Draw the coven’s card and share it</button><button class="button button--ghost button--small" type="button" data-reading-cancel>Not now</button></div>
          </form>`
        : `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-reading-open>Begin a coven reading</button></div>`
      : "";
    return `${begin}<form class="cv-composer" data-composer>
        <label class="sr-only" for="cv-message">Message</label>
        <textarea id="cv-message" name="body" maxlength="2000" rows="2" placeholder="${esc(placeholder)}" data-placeholder="${esc(placeholder)}" required></textarea>
        <button class="button button--primary" type="submit">Send</button>
      </form>
      <p class="cv-status" role="status" aria-live="polite" data-status></p>`;
  }

  function infoHtml(c) {
    if (!c || !infoOpen) return "";
    const row = myRow(c.id);
    const others = T() ? T().othersIn(c.id, members, me()) : [];
    return `<div class="sp-card cv-thread-info">
        <p class="sp-label">${c.kind === "group" ? "In this group" : "This conversation"}</p>
        <p>${others.length ? others.map((id) => esc(nameOf(id))).join(", ") : "No one else is here now."}</p>
        <div class="sp-actions">
          <button class="button button--ghost button--small" type="button" data-mute>${row?.muted ? "Unmute" : "Mute"}</button>
          ${c.kind === "group" && canSend(c.id) ? `<button class="button button--ghost button--small" type="button" data-add-people>Add people</button>` : ""}
          ${row && !row.left_at ? `<button class="button button--ghost button--small" type="button" data-leave-thread>Leave</button>` : ""}
        </div>
        <p class="sp-caption">Muting stops this conversation notifying your phone (in the app).</p>
        <p class="cv-status" role="status" aria-live="polite" data-info-status></p>
      </div>`;
  }

  async function drawThread() {
    const holder = pane?.querySelector("[data-thread-pane]");
    if (!holder) return;
    const id = threadId();
    const c = id ? conversationOf(id) : null;
    if (id && !c) {
      holder.innerHTML = `<p class="sp-notice">That conversation isn’t here. It may have been one you left.</p>`;
      return;
    }
    holder.innerHTML = `<header class="cv-thread-head">
        <h2>${esc(threadTitle(c))}</h2>
        ${c ? `<button class="button button--ghost button--small" type="button" data-info aria-expanded="${infoOpen}">ⓘ Details</button>` : ""}
      </header>
      ${infoHtml(c)}
      <p class="cv-presence" data-presence aria-live="polite"></p>
      ${id ? "" : `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-older hidden>Show earlier messages</button></div>`}
      <div class="cv-chat cv-chat--bubbles" role="log" aria-live="polite" aria-relevant="additions" data-log><p class="sp-caption">Opening…</p></div>
      ${composerHtml(id)}
      <p class="sp-caption">${id ? "Only the people in this conversation can read it. Site moderators can read any to keep the covens safe." : "Be kind. What’s shared here stays in the coven. Moderators can read every coven to keep it safe."}</p>`;
    presence(state.presence);
    try {
      messages = await D.thread(state.coven.id, id, id ? 200 : 150);
      await UI.loadNames(state.context, messages.map((m) => m.user_id));
    } catch (error) {
      const log = holder.querySelector("[data-log]");
      if (log) log.innerHTML = `<p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
      return;
    }
    if (!pane || threadId() !== id) return;
    const older = holder.querySelector("[data-older]");
    if (older) older.hidden = messages.length < 150;
    render({ stick: true });
    markRead(id);
    drawList();
    wireThread();
  }

  // --- choosing people -------------------------------------------------------------

  async function picker(mode) {
    const holder = pane?.querySelector("[data-picker]");
    if (!holder) return;
    picking = mode;
    holder.hidden = false;
    holder.innerHTML = `<p class="sp-caption">Finding the coven’s members…</p>`;
    const all = await D.members(state.coven.id).catch(() => []);
    const current = mode === "add" ? new Set(T() ? T().othersIn(threadId(), members, me()) : []) : new Set();
    const people = (all || []).filter((m) => m.status === "active" && m.user_id !== me() && !current.has(m.user_id) && !state.context.blocks.includes(m.user_id));
    await UI.loadNames(state.context, people.map((m) => m.user_id));
    if (picking !== mode || !pane) return;
    people.sort((a, b) => nameOf(a.user_id).localeCompare(nameOf(b.user_id)));
    holder.innerHTML = `<form class="sp-card" data-pick>
        <p class="sp-label">${mode === "add" ? "Add people to this group" : "New message"}</p>
        ${mode === "new" ? `<p class="sp-caption">Choose one person for a one-to-one chat, or several for a group.</p>` : ""}
        <div class="cv-chosen">${people.map((m) => `<label class="cv-check"><input type="checkbox" name="person" value="${esc(m.user_id)}" /> <span>${esc(nameOf(m.user_id))}</span></label>`).join("") || `<span class="sp-caption">No one else to choose.</span>`}</div>
        ${mode === "new" ? `<div class="sp-field" data-group-name hidden><label for="cv-group-name">Name the group</label><input id="cv-group-name" name="name" maxlength="60" placeholder="New moon circle" /></div>` : ""}
        <div class="sp-actions"><button class="button button--primary button--small" type="submit">${mode === "add" ? "Add them" : "Start"}</button><button class="button button--ghost button--small" type="button" data-pick-cancel>Cancel</button></div>
        <p class="cv-status" role="status" aria-live="polite" data-status></p>
      </form>`;
    const form = holder.querySelector("[data-pick]");
    const chosen = () => [...form.querySelectorAll('input[name="person"]:checked')].map((i) => i.value);
    form.addEventListener("change", () => {
      const name = form.querySelector("[data-group-name]");
      if (name) name.hidden = chosen().length < 2;
    });
    holder.querySelector("[data-pick-cancel]").addEventListener("click", closePicker);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const people_ = chosen();
      const status = form.querySelector("[data-status]");
      if (!people_.length) return UI.setStatus(status, "Choose someone first.", true);
      if (mode === "add") {
        const ok = await UI.busy(form, status, () => D.addToGroup(threadId(), people_).then(() => true));
        if (!ok) return;
        await refreshConversations();
        closePicker();
        drawThread();
        return;
      }
      const name = form.elements.name?.value.trim() || "";
      if (people_.length > 1 && !name) return UI.setStatus(status, "Give the group a name.", true);
      const made = await UI.busy(form, status, () => (people_.length === 1 ? D.openDirect(state.coven.id, people_[0]) : D.createGroup(state.coven.id, name, people_)));
      if (!made?.id) return;
      await refreshConversations();
      closePicker();
      go(made.id);
    });
  }

  function closePicker() {
    picking = null;
    const holder = pane?.querySelector("[data-picker]");
    if (holder) {
      holder.hidden = true;
      holder.innerHTML = "";
    }
  }

  async function refreshConversations() {
    try {
      const list = await D.conversations(state.coven.id);
      conversations = list.conversations;
      members = list.members;
      await loadPreviews();
    } catch {
      // Keep what we had.
    }
    drawList();
  }

  // --- wiring ----------------------------------------------------------------------

  function go(id) {
    global.history.pushState(null, "", threadHref(id));
    infoOpen = false;
    editing = null;
    drawThread();
  }

  function wireList() {
    pane?.querySelectorAll("[data-thread]").forEach((link) =>
      link.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button) return;
        event.preventDefault();
        event.stopPropagation();
        go(link.dataset.thread || null);
      })
    );
    pane?.querySelector("[data-new]")?.addEventListener("click", () => (picking === "new" ? closePicker() : picker("new")));
  }

  function wireThread() {
    const holder = pane.querySelector("[data-thread-pane]");
    const form = holder.querySelector("[data-composer]");
    const status = holder.querySelector("[data-status]");
    const textarea = form?.elements.body;
    const id = threadId();

    const resetComposer = () => {
      editing = null;
      if (textarea) textarea.placeholder = textarea.dataset.placeholder;
    };

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const body = textarea.value.trim();
      if (!body) return;
      const target = editing;
      const sent = await UI.busy(form, status, () => (target ? D.editMessage(target, body) : D.send(state.coven.id, body, null, id)));
      if (!sent) return;
      textarea.value = "";
      resetComposer();
      messages = L.applyChange(messages, { eventType: target ? "UPDATE" : "INSERT", new: sent });
      if (!target) previews[id || "coven"] = sent;
      render({ stick: true });
      markRead(id);
      drawList();
      textarea.focus();
    });
    textarea?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
      if (event.key === "Escape" && editing) {
        textarea.value = "";
        resetComposer();
      }
    });

    // Coven readings: begin one, or draw your card into one.
    const sendReading = async (el, body, replyTo) => {
      const sent = await UI.busy(el, status, () => D.send(state.coven.id, body, replyTo, id));
      if (!sent) return false;
      messages = L.applyChange(messages, { eventType: "INSERT", new: sent });
      previews[id || "coven"] = sent;
      render({ stick: true });
      drawList();
      return true;
    };
    holder.querySelector("[data-reading-open]")?.addEventListener("click", () => {
      beginning = true;
      drawThread();
    });
    holder.querySelector("[data-reading-cancel]")?.addEventListener("click", () => {
      beginning = false;
      drawThread();
    });
    holder.querySelector("[data-reading-begin]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const R = RD();
      const formEl = event.currentTarget;
      if (await sendReading(formEl, R.openingBody(formEl.elements.question.value, R.drawCovenCard(null, false)), null)) {
        beginning = false;
        drawThread();
      }
    });
    holder.querySelector("[data-log]")?.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-reading-draw]");
      if (!button) return;
      const R = RD();
      const reading = readings.get(button.dataset.readingDraw);
      if (!reading || !R.canDraw(reading, me())) return;
      await sendReading(button, R.cardBody(R.drawCovenCard(reading, false)), reading.id);
    });

    holder.querySelector("[data-older]")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const first = messages[0];
      if (!first) return;
      const older = await UI.busy(button, null, () => D.olderMessages(state.coven.id, first.created_at));
      if (!older) return;
      await UI.loadNames(state.context, older.map((m) => m.user_id));
      messages = [...older, ...messages];
      button.hidden = older.length < 100;
      const log = holder.querySelector("[data-log]");
      const height = log.scrollHeight;
      render();
      log.scrollTop = log.scrollHeight - height;
    });

    holder.querySelector("[data-info]")?.addEventListener("click", () => {
      infoOpen = !infoOpen;
      drawThread();
    });
    holder.querySelector("[data-mute]")?.addEventListener("click", async (event) => {
      const row = myRow(id);
      const ok = await UI.busy(event.currentTarget, holder.querySelector("[data-info-status]"), () => D.muteConversation(id, !row?.muted).then(() => true));
      if (!ok) return;
      members = members.map((m) => (m.conversation_id === id && m.user_id === me() ? { ...m, muted: !row?.muted } : m));
      drawThread();
    });
    holder.querySelector("[data-add-people]")?.addEventListener("click", () => picker("add"));
    holder.querySelector("[data-leave-thread]")?.addEventListener("click", async (event) => {
      const c = conversationOf(id);
      if (!(await UI.confirmAction(`Leave ${threadTitle(c)}?`, c?.kind === "group" ? "You won’t see new messages in this group. Someone in it can add you again." : "You won’t see new messages here unless you start a new one.", "Leave"))) return;
      const ok = await UI.busy(event.currentTarget, holder.querySelector("[data-info-status]"), () => D.leaveConversation(id).then(() => true));
      if (!ok) return;
      await refreshConversations();
      go(null);
    });

    holder.querySelector("[data-log]").addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const messageId = button.dataset.edit || button.dataset.remove || button.dataset.report;
      const message = messages.find((m) => m.id === messageId);
      if (button.dataset.edit && message && textarea) {
        editing = message.id;
        textarea.value = message.body;
        textarea.placeholder = "Edit your message (Esc to cancel)";
        textarea.focus();
      } else if (button.dataset.remove) {
        const own = message?.user_id === me();
        if (!(await UI.confirmAction(own ? "Delete your message?" : "Remove this message?", own ? "" : "Its words are removed for everyone. If it breaks the guidelines, report it as well so the site moderators keep a copy.", own ? "Delete" : "Remove"))) return;
        const done = await UI.busy(button, status, () => D.removeMessage(messageId).then(() => true));
        if (done) {
          messages = L.applyChange(messages, { eventType: "UPDATE", new: { id: messageId, body: "", deleted_at: new Date().toISOString(), deleted_by: me() } });
          render();
        }
      } else if (button.dataset.report && message) {
        UI.report({ target_type: "message", target_id: message.id, coven_id: state.coven.id, target_user_id: message.user_id, label: "this message" });
      } else if (button.dataset.block) {
        const who = button.dataset.block;
        const blocked = state.context.blocks.includes(who);
        if (!blocked && !(await UI.confirmAction(`Block ${nameOf(who)}?`, "You won’t see their messages in any coven. They aren’t told.", "Block"))) return;
        const done = await UI.busy(button, status, () => (blocked ? D.unblock(me(), who) : D.block(me(), who)).then(() => true));
        if (done) {
          state.context.blocks = blocked ? state.context.blocks.filter((b) => b !== who) : [...state.context.blocks, who];
          render();
        }
      }
    });
  }

  // --- mounting and live changes --------------------------------------------------

  async function mount(el, s, a) {
    pane = el;
    state = s;
    api = a || api;
    editing = null;
    picking = null;
    infoOpen = false;
    pane.innerHTML = `<section class="cv-messages" aria-label="Messages">
        <div class="cv-messages__list" data-list><p class="sp-caption">Opening your messages…</p></div>
        <div class="cv-messages__thread">
          <div data-picker hidden></div>
          <div data-thread-pane></div>
        </div>
      </section>`;
    if (me()) {
      await prime(s);
      if (pane !== el) return;
      await loadPreviews();
      if (pane !== el) return;
    }
    drawList();
    drawThread();
  }

  /** A message changed anywhere in this coven (coven.js passes every change, whichever tab is open). */
  async function onChange(change) {
    if (!state) return;
    const row = change?.new && Object.keys(change.new).length ? change.new : change?.old || {};
    if (row.coven_id && row.coven_id !== state.coven.id) return;
    const conversationId = row.conversation_id || null;
    if (conversationId && !conversationOf(conversationId) && change.eventType === "INSERT") {
      // Someone started a conversation with you.
      await refreshConversations();
    }
    const viewing = pane && (threadId() || null) === conversationId;
    if (change.eventType === "INSERT" && row.user_id) {
      previews[conversationId || "coven"] = row;
      if (!viewing && U()) counts = U().countMessage(counts, row, me(), read, null);
      else if (!viewing && !U() && row.user_id !== me()) counts[key(conversationId)] = (counts[key(conversationId)] || 0) + 1;
      showTotal();
    }
    if (!pane) return;
    if (viewing) {
      messages = L.applyChange(messages, change);
      if (row.user_id) await UI.loadNames(state.context, [row.user_id]);
      render();
      if (change.eventType === "INSERT") markRead(conversationId);
    }
    drawList();
  }

  function onStatus(status) {
    connection = status;
    if (pane) presence(state.presence);
  }

  function unmount() {
    pane = null;
    picking = null;
  }

  global.CovenChat = { mount, unmount, onChange, onPresence: presence, onStatus, prime };
})(window);
