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
 * The same Messages open in a small window over a coven altar
 * (covens/coven/chat-panel.js): mount(el, state, { panel: true }) keeps the
 * thread shown to itself, and onTotal tells the altar's chat button the count.
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
  // Reactions and reply buttons (the app's lib/covens/messageExtras.ts): what's
  // on the thread's messages, the message whose reaction row is open, and the
  // reply buttons being added to the next message.
  const MX = () => global.SaltCore?.covens?.messageExtras || null;
  let reactions = [];
  let answers = [];
  let reactingId = null;
  let emojiGrid = false;
  let draftButtons = null; // { preset, custom: [4], ritual } while "Add reply buttons" is open

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
  // In the small window over a coven altar (covens/coven/chat-panel.js) the
  // thread shown is kept here instead of in the address, which is the altar's.
  let panel = false;
  let panelThread = null;
  let totalListener = null;
  const threadId = () => (panel ? panelThread : new URLSearchParams(global.location.search).get("thread") || null);
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
    totalListener?.(total());
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
    const canReact = MX() && state.perms.member && state.standing.ok && (!threadId() || canSend(threadId()));
    return `<div class="cv-msg__actions">
        ${canReact ? `<button type="button" data-react-open="${esc(m.id)}" aria-expanded="${reactingId === m.id}">React</button>` : ""}
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

  /** The reaction row for one message: the quick ones, "More" (a searchable grid, or type any one emoji). */
  function reactRowHtml(m) {
    const X = MX();
    if (!X || reactingId !== m.id) return "";
    const quick = X.QUICK_REACTIONS.map((e) => `<button type="button" class="cv-react__pick" data-react="${esc(e)}" data-message="${esc(m.id)}" aria-label="React with ${esc(e)}">${esc(e)}</button>`).join("");
    const grid = emojiGrid
      ? `<div class="cv-react__more">
          <label class="sr-only" for="cv-emoji-search">Search emoji</label>
          <input id="cv-emoji-search" data-emoji-search placeholder="Search: moon, heart, herb…" autocomplete="off" />
          <div class="cv-react__grid" data-emoji-grid>${X.searchEmoji("").map((e) => `<button type="button" class="cv-react__pick" data-react="${esc(e)}" data-message="${esc(m.id)}" aria-label="React with ${esc(e)}">${esc(e)}</button>`).join("")}</div>
          <form class="cv-react__typed" data-emoji-typed="${esc(m.id)}"><label class="sr-only" for="cv-emoji-typed">Type any one emoji</label><input id="cv-emoji-typed" name="emoji" maxlength="16" placeholder="Or type any one emoji" /><button class="button button--ghost button--small" type="submit">React</button></form>
        </div>`
      : "";
    return `<div class="cv-react" role="group" aria-label="React to this message">${quick}<button type="button" class="cv-react__pick cv-react__morebtn" data-emoji-more aria-expanded="${emojiGrid}">More</button>${grid}</div>`;
  }

  /** Under a message: its reply buttons and tally, and its reactions (tap the emoji to add or take back yours, the number to see who). */
  function extrasHtml(m) {
    const X = MX();
    if (!X || m.deleted_at || m.hidden) return "";
    const blocks = state.context.blocks;
    const groups = X.reactionGroups(reactions, m.id, me(), blocks);
    const buttons = X.buttonsOf(m);
    if (!groups.length && !buttons) return "";
    const may = state.perms.member && state.standing.ok && (!threadId() || canSend(threadId()));
    let replies = "";
    if (buttons) {
      const tally = X.answerTally(buttons, answers, m.id, me(), blocks);
      const mine = X.myAnswer(answers, m.id, me());
      replies = `<div class="cv-replies">
          <div class="cv-replies__row">${buttons.labels.map((label, i) => `<button type="button" class="cv-reply${mine === i ? " is-on" : ""}" data-answer="${i}" data-message="${esc(m.id)}" aria-pressed="${mine === i}"${may ? "" : " disabled"}>${esc(label)}</button>`).join("")}</div>
          <button type="button" class="cv-replies__tally" data-who-answers="${esc(m.id)}" aria-expanded="false">${esc(X.tallyWords(tally))}</button>
          <div class="cv-who" data-who-for="${esc(m.id)}" hidden></div>
        </div>`;
    }
    const chips = groups.length
      ? `<div class="cv-reactions">${groups
          .map(
            (g) => `<span class="cv-reaction${g.mine ? " is-mine" : ""}"><button type="button" data-react="${esc(g.emoji)}" data-message="${esc(m.id)}" aria-label="${esc(X.reactionLabel(g))}. ${g.mine ? "Take yours back" : "Add yours"}"${may ? "" : " disabled"}>${esc(g.emoji)}</button><button type="button" class="cv-reaction__count" data-who-reacted="${esc(g.emoji)}" data-message="${esc(m.id)}" aria-label="See who reacted with ${esc(g.emoji)}">${g.count}</button></span>`
          )
          .join("")}</div><div class="cv-who" data-who-react="${esc(m.id)}" hidden></div>`
      : "";
    return `<div class="cv-extras">${replies}${chips}</div>`;
  }

  /** Load the reactions and answers on the messages shown. */
  async function loadExtras() {
    if (!MX() || !D.messageExtras) return;
    const id = threadId();
    const got = await D.messageExtras(messages.map((m) => m.id)).catch(() => null);
    if (!got || threadId() !== id) return;
    reactions = got.reactions;
    answers = got.answers;
    await UI.loadNames(state.context, [...reactions, ...answers].map((r) => r.user_id));
    render();
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
        ${m.hidden ? "" : reactRowHtml(m)}
        ${extrasHtml(m)}
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

  /** "Add reply buttons" above the composer: a preset or your own labels, and (the coven's chat) a gathering to link. */
  function buttonsPanelHtml(conversationId) {
    const X = MX();
    let buttonsPanel = "";
    if (X) {
      if (!draftButtons) buttonsPanel = `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-buttons-open>Add reply buttons</button></div>`;
      else {
        const d = draftButtons;
        const upcoming = conversationId ? [] : (state.rituals || []).filter((r) => r.status === "scheduled" && r.scheduled_for && new Date(r.scheduled_for).getTime() > Date.now()).sort((a, b) => String(a.scheduled_for).localeCompare(String(b.scheduled_for))).slice(0, 6);
        const presetChips = X.REPLY_PRESETS.map((p) => `<button type="button" class="sp-chip${d.preset === p.value ? " is-active" : ""}" data-buttons-preset="${p.value}" aria-pressed="${d.preset === p.value}">${esc(p.label)}</button>`).join("");
        const custom = d.preset === "custom"
          ? `<div class="cv-buttons__custom">${d.custom.map((label, i) => `<input data-buttons-label="${i}" maxlength="40" value="${esc(label)}" placeholder="${i < 2 ? `Button ${i + 1}` : `Button ${i + 1} (optional)`}" aria-label="Button ${i + 1}" />`).join("")}</div>`
          : `<p class="sp-caption">${esc((X.REPLY_PRESETS.find((p) => p.value === d.preset)?.labels || []).join(" · "))}</p>`;
        const link = d.preset === "gathering" && upcoming.length
          ? `<div class="sp-field"><label for="cv-buttons-ritual">Link to a gathering (answers set people’s RSVP too)</label><select id="cv-buttons-ritual" data-buttons-ritual><option value="">None</option>${upcoming.map((r) => `<option value="${esc(r.id)}"${d.ritual === r.id ? " selected" : ""}>${esc(r.title)}</option>`).join("")}</select></div>`
          : "";
        buttonsPanel = `<div class="sp-card cv-buttons" data-buttons-panel>
            <div class="cv-buttons__head"><p class="sp-label">Reply buttons</p><button class="button button--ghost button--small" type="button" data-buttons-remove>Remove</button></div>
            <div class="sp-chips">${presetChips}</div>${custom}${link}
          </div>`;
      }
    }
    return buttonsPanel;
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
    return `${begin}<div data-buttons-slot>${buttonsPanelHtml(conversationId)}</div><form class="cv-composer" data-composer>
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
    loadExtras();
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
    if (panel) {
      // The window keeps its own place; the altar's address stays as it is.
      panelThread = id || null;
      pane?.classList.remove("is-choosing");
    } else global.history.pushState(null, "", threadHref(id));
    infoOpen = false;
    editing = null;
    reactingId = null;
    draftButtons = null;
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
      const X = MX();
      const buttons = !target && draftButtons && X ? X.cleanReplyButtons({ preset: draftButtons.preset, labels: draftButtons.custom, ritual_id: draftButtons.ritual || undefined }) : null;
      if (!target && draftButtons && !buttons) {
        if (status) status.textContent = "Give at least two reply buttons a label, or remove them.";
        return;
      }
      const sent = await UI.busy(form, status, () => (target ? D.editMessage(target, body) : D.send(state.coven.id, body, null, id, buttons)));
      if (!sent) return;
      textarea.value = "";
      resetComposer();
      if (buttons) {
        draftButtons = null;
        redrawButtons();
      }
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

    // "Add reply buttons": choose a preset or your own labels, and a gathering to link (the coven's chat).
    const slot = holder.querySelector("[data-buttons-slot]");
    const redrawButtons = () => {
      if (slot) slot.innerHTML = buttonsPanelHtml(id);
    };
    slot?.addEventListener("click", (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      if (b.dataset.buttonsOpen !== undefined) draftButtons = { preset: "gathering", custom: ["", "", "", ""], ritual: "" };
      else if (b.dataset.buttonsRemove !== undefined) draftButtons = null;
      else if (b.dataset.buttonsPreset) draftButtons = { ...draftButtons, preset: b.dataset.buttonsPreset };
      else return;
      redrawButtons();
    });
    slot?.addEventListener("input", (event) => {
      const input = event.target.closest("[data-buttons-label]");
      if (input && draftButtons) draftButtons.custom = draftButtons.custom.map((l, i) => (i === Number(input.dataset.buttonsLabel) ? input.value : l));
    });
    slot?.addEventListener("change", (event) => {
      if (event.target.matches("[data-buttons-ritual]") && draftButtons) draftButtons = { ...draftButtons, ritual: event.target.value };
    });

    const log = holder.querySelector("[data-log]");
    // Reactions: toggle yours (as the app does, at once, then saved).
    const toggleReaction = async (messageId, emoji) => {
      const X = MX();
      if (!X || !me()) return;
      const on = X.reactionToggle(reactions, messageId, me(), emoji) === "add";
      const row = { message_id: messageId, user_id: me(), emoji };
      reactions = X.withReaction(reactions, row, on);
      reactingId = null;
      emojiGrid = false;
      render();
      try {
        await D.react(messageId, me(), emoji, on);
      } catch (error) {
        reactions = X.withReaction(reactions, row, !on);
        render();
        if (status) status.textContent = L.errorMessage(error);
      }
    };
    // Answers: answer, change it, or take it back; a Gathering answer on a linked message sets the RSVP too.
    const answer = async (messageId, tapped) => {
      const X = MX();
      const m = messages.find((x) => x.id === messageId);
      if (!X || !me() || !m) return;
      const before = X.myAnswer(answers, messageId, me());
      const { choice } = X.answerChange(before, tapped);
      const row = { message_id: messageId, user_id: me(), choice: choice ?? 0, updated_at: new Date().toISOString() };
      answers = X.withAnswer(answers, row, choice != null);
      render();
      try {
        await D.answerButtons(messageId, me(), choice);
        const buttons = X.buttonsOf(m);
        const response = X.rsvpFor(buttons, choice);
        if (response !== undefined && buttons?.ritual_id) await D.rsvp(buttons.ritual_id, response).catch(() => null);
      } catch (error) {
        answers = before == null ? X.withAnswer(answers, row, false) : X.withAnswer(answers, { ...row, choice: before }, true);
        render();
        if (status) status.textContent = L.errorMessage(error);
      }
    };
    const whoList = (ids) => ids.map((u) => esc(u === me() ? "You" : nameOf(u))).join(", ");
    log.addEventListener("input", (event) => {
      const search = event.target.closest("[data-emoji-search]");
      const grid = log.querySelector("[data-emoji-grid]");
      if (!search || !grid || !MX()) return;
      grid.innerHTML = MX()
        .searchEmoji(search.value)
        .map((e) => `<button type="button" class="cv-react__pick" data-react="${esc(e)}" data-message="${esc(reactingId)}" aria-label="React with ${esc(e)}">${esc(e)}</button>`)
        .join("");
    });
    log.addEventListener("submit", (event) => {
      const form_ = event.target.closest("[data-emoji-typed]");
      if (!form_) return;
      event.preventDefault();
      const emoji = MX()?.oneEmoji(form_.elements.emoji.value);
      if (emoji) toggleReaction(form_.dataset.emojiTyped, emoji);
      else if (status) status.textContent = "Type one emoji to react with it.";
    });
    log.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const d = button.dataset;
      if (d.reactOpen) {
        reactingId = reactingId === d.reactOpen ? null : d.reactOpen;
        emojiGrid = false;
        render();
        log.querySelector(`[data-id="${CSS.escape(d.reactOpen)}"] .cv-react__pick`)?.focus();
      } else if (d.emojiMore !== undefined) {
        emojiGrid = !emojiGrid;
        render();
        log.querySelector("[data-emoji-search]")?.focus();
      } else if (d.react && d.message) toggleReaction(d.message, d.react);
      else if (d.answer !== undefined && d.message) answer(d.message, Number(d.answer));
      else if (d.whoAnswers) {
        const X = MX();
        const m = messages.find((x) => x.id === d.whoAnswers);
        const box = log.querySelector(`[data-who-for="${CSS.escape(d.whoAnswers)}"]`);
        if (!X || !m || !box) return;
        const tally = X.answerTally(X.buttonsOf(m), answers, m.id, me(), state.context.blocks);
        box.hidden = !box.hidden;
        button.setAttribute("aria-expanded", String(!box.hidden));
        box.innerHTML = tally.filter((t) => t.count).map((t) => `<p><strong>${esc(t.label)}</strong>: ${whoList(t.who)}</p>`).join("") || `<p>No one yet.</p>`;
      } else if (d.whoReacted && d.message) {
        const X = MX();
        const g = X?.reactionGroups(reactions, d.message, me(), state.context.blocks).find((x) => x.emoji === d.whoReacted);
        const box = log.querySelector(`[data-who-react="${CSS.escape(d.message)}"]`);
        if (!g || !box) return;
        box.hidden = box.dataset.emoji === d.whoReacted ? !box.hidden : false;
        box.dataset.emoji = d.whoReacted;
        box.innerHTML = `<p>${esc(g.emoji)} ${whoList(g.who)}</p>`;
      }
    });

    log.addEventListener("click", async (event) => {
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
    reactions = [];
    answers = [];
    reactingId = null;
    draftButtons = null;
    // A gathering's chat reminder that is due appears now, if the scheduled run hasn't posted it.
    if (me() && state.perms.member && D.askDueReminders) D.askDueReminders(state.coven.id);
    // { panel: true }: the small window over a coven altar, starting on the coven's chat.
    if (Boolean(a?.panel) !== panel) panelThread = null;
    panel = Boolean(a?.panel);
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
    // A reaction or an answer on a message (covens/coven-data.js live: change.table).
    if (change?.table === "coven_message_reactions" || change?.table === "coven_message_answers") {
      const X = MX();
      if (!X || !pane) return;
      const isReaction = change.table === "coven_message_reactions";
      if (change.eventType === "DELETE") {
        const gone = change.old?.id;
        if (isReaction) reactions = reactions.filter((r) => r.id !== gone);
        else answers = answers.filter((a) => a.id !== gone);
      } else {
        const row = change.new || {};
        if (!messages.some((m) => m.id === row.message_id)) return;
        if (isReaction) reactions = X.withReaction(reactions, row, true);
        else answers = X.withAnswer(answers, row, true);
        if (row.user_id) await UI.loadNames(state.context, [row.user_id]);
      }
      render();
      return;
    }
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

  /** Told the unread count whenever it changes (the chat button over a coven altar). */
  function onTotal(listener) {
    totalListener = listener;
    if (state?.coven) listener(total());
  }

  global.CovenChat = { mount, unmount, onChange, onPresence: presence, onStatus, prime, onTotal, current: () => (state ? threadId() : null) };
})(window);
