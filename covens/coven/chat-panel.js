/*
 * The coven's Messages in a small window over a coven altar, as in the app
 * (components/covens/ChatPanel.tsx): talk with the others without leaving the
 * altar. A Messages button sits in the corner with how many you haven't read;
 * it opens the window along the bottom of the screen (down the side on a wide
 * one), leaving the altar in view and still tendable. The coven's chat first;
 * "Chats" switches to one of your conversations and "Open" goes to the full
 * Messages tab.
 *
 * The window is the Messages tab itself (covens/coven/chat.js, mounted with
 * { panel: true }), so who may write (members in good standing whose position
 * talks in the chat), blocks, reports, signing the agreements and coven
 * readings work exactly as they do there. What you may do in the coven comes
 * from the same loader as the coven's page (CovenUI.loadAccess).
 *
 * The altar page (altar/js/features/coven-altar.js) loads this, and the
 * coven scripts it needs, only when a coven altar is open.
 */
(function (global) {
  "use strict";

  const doc = global.document;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, href } = UI;
  const P = () => global.SaltCore?.covens?.altarPanel || null;
  const badge = (n) => (P() ? P().badgeLabel(n) : n > 99 ? "99+" : String(n));
  const buttonLabel = (n, open) => (P() ? P().chatButtonLabel(n, open) : `${open ? "Close messages" : "Messages"}${n > 0 ? `, ${badge(n)} unread` : ""}`);

  let state = null;
  let live = null;
  let button = null;
  let panel = null;
  let open = false;
  let unread = 0;
  let slug = "";

  const covenHref = (tab) => href(`/covens/coven/?c=${encodeURIComponent(slug)}${tab && tab !== "about" ? `&tab=${tab}` : ""}`);

  function showCount() {
    if (!button) return;
    const count = button.querySelector("[data-count]");
    count.hidden = !unread;
    count.textContent = badge(unread);
    button.setAttribute("aria-label", buttonLabel(unread, open));
    const chats = panel?.querySelector("[data-chats]");
    if (chats) chats.textContent = unread ? `Chats ${badge(unread)}` : "Chats";
  }

  // iOS Safari lays the keyboard over fixed things; keep the window above it.
  function keepAboveKeyboard() {
    const vv = global.visualViewport;
    if (!panel || !vv) return;
    const covered = Math.max(0, global.innerHeight - vv.height - vv.offsetTop);
    panel.style.setProperty("--cv-keyboard", `${covered}px`);
  }

  function openPanel() {
    if (open) return;
    open = true;
    panel.hidden = false;
    button.hidden = true;
    panel.classList.remove("is-choosing");
    global.CovenChat.mount(panel.querySelector("[data-pane]"), state, { panel: true, covenHref });
    keepAboveKeyboard();
    showCount();
    panel.querySelector("[data-close]").focus();
  }

  function closePanel() {
    if (!open) return;
    open = false;
    global.CovenChat.unmount();
    panel.hidden = true;
    button.hidden = false;
    showCount();
    button.focus();
  }

  function build() {
    button = doc.createElement("button");
    button.type = "button";
    button.className = "cv-altar-chat-button";
    button.innerHTML = `<span aria-hidden="true">✉</span> Messages <span class="cv-count" data-count hidden></span>`;
    button.addEventListener("click", openPanel);

    panel = doc.createElement("aside");
    panel.className = "cv-altar-chat";
    panel.setAttribute("aria-label", `Messages in ${state.coven.name}`);
    panel.hidden = true;
    panel.innerHTML = `<div class="cv-altar-chat__bar">
        <p class="cv-altar-chat__title">${esc(state.coven.name)}</p>
        <button class="button button--ghost button--small" type="button" data-chats aria-label="Your chats">Chats</button>
        <button class="button button--ghost button--small" type="button" data-full aria-label="Open the full Messages tab">Open</button>
        <button class="button button--small" type="button" data-close aria-label="Close messages and go back to the altar">Close</button>
      </div>
      <div class="cv-altar-chat__pane" data-pane></div>`;
    panel.querySelector("[data-close]").addEventListener("click", closePanel);
    panel.querySelector("[data-chats]").addEventListener("click", () => panel.classList.toggle("is-choosing"));
    panel.querySelector("[data-full]").addEventListener("click", () => {
      const thread = global.CovenChat.current();
      global.location.assign(`${covenHref("gathering")}${thread ? `&thread=${encodeURIComponent(thread)}` : ""}`);
    });
    panel.addEventListener("keydown", (event) => {
      // Escape closes the window, unless it's cancelling an edit in the box.
      if (event.key === "Escape" && !event.target.closest?.("textarea")) closePanel();
    });
    doc.body.append(panel, button);
    global.visualViewport?.addEventListener("resize", keepAboveKeyboard);
    global.visualViewport?.addEventListener("scroll", keepAboveKeyboard);
  }

  /** Start the button and its window for the coven altar open on this page. */
  async function start({ covenSlug, altarId }) {
    if (state || !covenSlug || !global.CovenChat) return false;
    slug = covenSlug;
    const context = await UI.boot();
    if (!context.user) return false;
    const coven = await D.coven(slug).catch(() => null);
    if (!coven) return false;
    state = { context, coven, ranks: [], documents: [], signatures: [], unsigned: [], presence: [] };
    await UI.loadAccess(state);
    if (!(state.perms.member || state.perms.site)) return false;
    build();
    global.CovenChat.onTotal((n) => {
      unread = n;
      showCount();
    });
    live = D.live(coven.id, {
      onMessage: (change) => global.CovenChat.onChange(change),
      onPresence: (presence) => {
        state.presence = Object.values(presence).map((list) => list[0]).filter(Boolean);
        global.CovenChat.onPresence(state.presence);
      },
      onStatus: (status) => global.CovenChat.onStatus(status)
    });
    // Where you are in the coven, as the app says it (place "altar:<id>").
    live.track({ user_id: context.user.id, name: UI.nameOf(context, context.user.id), place: `altar:${altarId}` });
    global.addEventListener("pagehide", () => live?.close());
    await global.CovenChat.prime(state);
    showCount();
    return true;
  }

  global.CovenAltarChat = { start, open: () => openPanel(), close: () => closePanel(), state: () => ({ open, unread, ready: Boolean(state) }) };
})(window);
