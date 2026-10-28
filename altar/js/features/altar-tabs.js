/*
 * My Altars in two tabs, as the app's Altar tab has them
 * (app/src/app/(tabs)/altar/index.tsx): "Personal", your saved altars as
 * before (altar/js/core/storage.js draws them), and "Coven", every coven altar
 * you can see across the covens you belong to, grouped under each coven's
 * name, the ritual altar first (SaltCore.altar.altarsAcross, shared with the
 * app). Each opens in this editor (/altar/?covenAltar=<id>&c=<slug>,
 * altar/js/features/coven-altar.js). Start a coven altar where your position
 * starts them; archived ones wait, folded, for those who may restore them.
 *
 * The website has no separate altar list page: My Altars (the Library button)
 * is where your saved altars are listed, so the switch lives there. The last
 * tab used is kept in this browser (saltAltarTab, as in the app), and
 * /altar/?tab=coven opens My Altars on the Coven tab. The coven scripts
 * (covens/coven-logic.js, covens/coven-data.js) load only when the Coven tab
 * is first opened. The database decides every change.
 */
(function (global) {
  "use strict";

  const SW = global.SaltSwitch;
  const core = () => global.SaltCore?.altar || null;
  const modal = document.querySelector(".saved-altars-modal");
  const tabsHost = modal?.querySelector("[data-saved-altars-tabs]");
  const personal = modal?.querySelector("[data-saved-altars-list]");
  const covenList = modal?.querySelector("[data-coven-altars-list]");
  if (!SW || !modal || !tabsHost || !personal || !covenList) return;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const resolve = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;

  const TAB_KEY = "saltAltarTab";
  const TABS = [
    { key: "personal", label: "Personal" },
    { key: "coven", label: "Coven" }
  ];
  const asTab = (value) => core()?.screenTabs?.asAltarTab?.(value) ?? (value === "personal" || value === "coven" ? value : null);
  const tabKey = () => core()?.screenTabs?.ALTAR_TAB_KEY || TAB_KEY;
  const tabList = () => core()?.screenTabs?.ALTAR_TABS || TABS;

  let tab = SW.remembered(tabKey(), asTab) || "personal";
  // { status: "idle" | "loading" | "ready" | "error", user, groups, message }
  let coven = { status: "idle", user: null, groups: [], message: "" };
  let starting = false;
  let startIn = "";

  function drawTabs() {
    tabsHost.innerHTML = SW.html({ id: "altar-tabs", label: "Altar", options: tabList(), value: tab });
    personal.hidden = tab !== "personal";
    covenList.hidden = tab !== "coven";
    personal.setAttribute("role", "tabpanel");
    personal.setAttribute("aria-labelledby", "altar-tabs-personal");
    covenList.setAttribute("role", "tabpanel");
    covenList.setAttribute("aria-labelledby", "altar-tabs-coven");
  }

  function setTab(next, { focus = false } = {}) {
    tab = next;
    SW.remember(tabKey(), next);
    drawTabs();
    if (focus) SW.focus(tabsHost, "altar-tabs");
    if (next === "coven") showCoven();
  }

  // ── The coven scripts, loaded when first needed ────────────────────────
  let loadingScripts = null;
  function addScript(path) {
    return new Promise((done, fail) => {
      const script = document.createElement("script");
      script.src = resolve(path);
      script.onload = done;
      script.onerror = () => fail(new Error(`${path} didn't load`));
      document.head.appendChild(script);
    });
  }
  function covenScripts() {
    if (global.CovenLogic && global.CovenData) return Promise.resolve();
    if (!loadingScripts) {
      loadingScripts = (async () => {
        if (!global.CovenLogic) await addScript("/covens/coven-logic.js");
        if (!global.CovenData) await addScript("/covens/coven-data.js");
      })();
      loadingScripts.catch(() => (loadingScripts = null));
    }
    return loadingScripts;
  }

  /** Every coven you belong to, with its altars and what you may do there (as the app's fetchAltarsAcrossCovens). */
  async function fetchCovens(userId) {
    const L = global.CovenLogic;
    const D = global.CovenData;
    const memberships = (await D.myMemberships(userId)).filter((m) => m.covens && m.covens.status === "active");
    if (!memberships.length) return [];
    const [roles, ban] = await Promise.all([D.mySiteRoles(userId).catch(() => []), D.myBan(userId).catch(() => null)]);
    const siteModerator = roles.includes("admin") || roles.includes("moderator");
    return Promise.all(
      memberships.map(async (m) => {
        const c = m.covens;
        const [altars, counts, ranks, documents, signatures] = await Promise.all([
          D.altars(c.id),
          D.altarCounts(c.id).catch(() => ({})),
          D.ranks(c.id).catch(() => []),
          D.documents(c.id).catch(() => []),
          D.mySignatures(c.id, userId).catch(() => [])
        ]);
        const perms = L.permissions({ coven: c, membership: { ...m, user_id: userId }, ranks, userId, siteModerator });
        const unsigned = L.unsignedAgreements(documents, signatures, userId);
        return {
          coven: { id: c.id, slug: c.slug, name: c.name },
          altars: altars || [],
          counts: counts || {},
          canStart: Boolean(perms.startAltars && L.standing(perms, unsigned, Boolean(ban)).ok),
          keeps: Boolean(perms.founder || perms.manage || perms.keepAltars || perms.site)
        };
      })
    );
  }

  async function load() {
    coven = { ...coven, status: "loading", message: "" };
    drawCoven();
    try {
      const user = typeof global.ensureAltarUser === "function" ? await global.ensureAltarUser() : null;
      if (!user) {
        coven = { status: "ready", user: null, groups: [], message: "" };
      } else {
        await covenScripts();
        const A = core()?.altarsAcross;
        if (!A) throw new Error("The altar’s tools didn’t load. Please refresh the page.");
        coven = { status: "ready", user, groups: A.groupCovenAltars(await fetchCovens(user.id), user.id), message: "" };
      }
    } catch (error) {
      console.warn("The covens' altars couldn't load.", error);
      coven = { ...coven, status: "error" };
    }
    drawCoven();
  }

  function showCoven() {
    if (coven.status === "idle" || coven.status === "error") void load();
    else drawCoven();
  }

  const altarHref = (group, altar) => resolve(`/altar/?covenAltar=${encodeURIComponent(altar.id)}&c=${encodeURIComponent(group.coven.slug)}`);
  const tendedBy = (altar) => core()?.covenAltar?.tendedBy?.(altar) || "";

  function card(group, altar) {
    const A = core().altarsAcross;
    return `<article class="saved-altar-card coven-altar-card${altar.is_main ? " is-main" : ""}">
        <div class="saved-altar-symbol" aria-hidden="true">${altar.is_main ? "✦" : "🕯"}</div>
        <div class="saved-altar-body">
          <p class="eyebrow">${esc(A.altarKind(altar))}</p>
          <h3>${esc(altar.name)}</h3>
          <p>${esc(A.thingsLabel(group.counts[altar.id]))} · ${esc(tendedBy(altar))}</p>
        </div>
        <div class="saved-altar-actions">
          <a class="button button--small" href="${esc(altarHref(group, altar))}" data-open-coven-altar>Open</a>
        </div>
      </article>`;
  }

  function archivedCard(group, altar) {
    return `<article class="saved-altar-card coven-altar-card">
        <div class="saved-altar-symbol" aria-hidden="true">🕯</div>
        <div class="saved-altar-body">
          <h3>${esc(altar.name)}</h3>
          <p>Kept whole. You can restore it.</p>
        </div>
        <div class="saved-altar-actions">
          <button type="button" data-restore-coven-altar="${esc(altar.id)}">Restore</button>
        </div>
      </article>`;
  }

  function startForm(startable) {
    if (!startable.length) return "";
    if (!starting) return `<div class="coven-altars-start"><button type="button" class="button button--ghost" data-coven-start>Start a coven altar</button></div>`;
    const chosen = startable.find((c) => c.id === startIn) || (startable.length === 1 ? startable[0] : null);
    const choices = core()?.covenAltar?.TEND_CHOICES || [];
    return `<form class="saved-altar-card coven-altars-form" data-coven-start-form>
        <div class="saved-altar-body">
          <h3>Start a coven altar</h3>
          ${
            startable.length > 1
              ? `<fieldset><legend>Which coven?</legend>${startable
                  .map((c) => `<label class="coven-altars-choice"><input type="radio" name="coven" value="${esc(c.id)}"${chosen?.id === c.id ? " checked" : ""} required /> <span>${esc(c.name)}</span></label>`)
                  .join("")}</fieldset>`
              : ""
          }
          <label class="coven-altars-field">Its name <input name="name" maxlength="80" placeholder="Healing altar, Ancestors, Full moon…" /></label>
          <fieldset><legend>Who tends it</legend>${choices
            .map((c, i) => `<label class="coven-altars-choice"><input type="radio" name="edit_mode" value="${esc(c.value)}"${i === 0 ? " checked" : ""} /> <span>${esc(c.label)}</span></label>`)
            .join("")}</fieldset>
          <p>You keep it: you can change who tends it, lock it, or archive it later. The coven’s head keeps every altar too.</p>
        </div>
        <div class="saved-altar-actions">
          <button type="submit">Start the altar</button>
          <button type="button" data-coven-start-cancel>Not now</button>
        </div>
      </form>`;
  }

  function drawCoven() {
    if (tab !== "coven") return;
    const A = core()?.altarsAcross;
    const message = coven.message ? `<p class="saved-altars-archived-note" role="status">${esc(coven.message)}</p>` : "";
    if (coven.status === "loading" && !coven.groups.length) {
      covenList.innerHTML = `<p class="saved-altars-archived-note" role="status">Opening your covens’ altars…</p>`;
      return;
    }
    if (coven.status === "error") {
      covenList.innerHTML = `<div class="saved-altars-empty"><h3>Your covens’ altars couldn’t be loaded.</h3><p>Check your connection and try again.</p><button type="button" class="button button--ghost" data-coven-retry>Try again</button></div>`;
      return;
    }
    if (!coven.user) {
      covenList.innerHTML = `<div class="saved-altars-empty"><h3>Covens need an account.</h3><p>A coven’s altars are tended together, so they live with your account. Sign in to see the altars of the covens you belong to.</p><button type="button" class="button button--ghost" data-coven-signin>Sign in</button></div>`;
      return;
    }
    if (!coven.groups.length || !A) {
      covenList.innerHTML = `<div class="saved-altars-empty"><h3>Join or found a coven</h3><p>When you belong to a coven, its altars are here: the ritual altar and the others its members tend together.</p><a class="button button--ghost" href="${esc(resolve("/covens/?tab=find"))}">Find a coven</a></div>`;
      return;
    }
    const startable = A.covensToStartIn(coven.groups);
    covenList.innerHTML =
      message +
      startForm(startable) +
      coven.groups
        .map(
          (group) => `<section class="coven-altars-group" aria-label="${esc(group.coven.name)}">
            <h3 class="coven-altars-name">${esc(group.coven.name)}</h3>
            ${group.altars.length ? group.altars.map((a) => card(group, a)).join("") : `<p class="saved-altars-archived-note">No altars here yet.</p>`}
            ${
              group.archived.length
                ? `<details class="saved-altars-archived"><summary>Archived (${group.archived.length})</summary>${group.archived.map((a) => archivedCard(group, a)).join("")}</details>`
                : ""
            }
          </section>`
        )
        .join("");
  }

  // Leaving for a coven altar: Back comes back here, to My Altars on the Coven tab.
  function rememberWayBack() {
    try {
      const params = new URLSearchParams(global.location.search);
      params.set("tab", "coven");
      global.history.replaceState(global.history.state, "", `${global.location.pathname}?${params.toString()}${global.location.hash}`);
    } catch {
      // Back still returns to the altar page.
    }
  }

  async function start(form) {
    const A = core()?.altarsAcross;
    const startable = A ? A.covensToStartIn(coven.groups) : [];
    const data = new FormData(form);
    const chosen = startable.find((c) => c.id === (data.get("coven") || startIn)) || (startable.length === 1 ? startable[0] : null);
    if (!chosen) return;
    const button = form.querySelector('[type="submit"]');
    if (button) button.disabled = true;
    try {
      const made = await global.CovenData.createAltar(chosen.id, String(data.get("name") || "").trim() || "An altar", String(data.get("edit_mode") || "members"));
      rememberWayBack();
      global.location.assign(altarHref({ coven: chosen }, made));
    } catch (error) {
      coven = { ...coven, message: global.CovenLogic?.errorMessage?.(error) || error?.message || "The altar couldn’t be started." };
      if (button) button.disabled = false;
      drawCoven();
    }
  }

  async function restore(altarId) {
    const group = coven.groups.find((g) => g.archived.some((a) => a.id === altarId));
    const altar = group?.archived.find((a) => a.id === altarId);
    if (!altar) return;
    try {
      await global.CovenData.archiveAltar(altarId, false);
      await load();
      coven = { ...coven, message: `${altar.name.trim() || "The altar"} is back among the coven’s altars.` };
    } catch (error) {
      coven = { ...coven, message: global.CovenLogic?.errorMessage?.(error) || error?.message || "The altar couldn’t be restored." };
    }
    drawCoven();
  }

  SW.bind(tabsHost, "altar-tabs", (next, { focus }) => setTab(next, { focus }));

  covenList.addEventListener("click", (event) => {
    const t = event.target;
    if (t.closest("[data-open-coven-altar]")) return rememberWayBack();
    if (t.closest("[data-coven-retry]")) return void load();
    if (t.closest("[data-coven-signin]")) return typeof global.openSanctuaryModal === "function" ? global.openSanctuaryModal() : global.location.assign(resolve("/?sanctuary=auth"));
    if (t.closest("[data-coven-start]")) {
      starting = true;
      return drawCoven();
    }
    if (t.closest("[data-coven-start-cancel]")) {
      starting = false;
      startIn = "";
      return drawCoven();
    }
    const restoreButton = t.closest("[data-restore-coven-altar]");
    if (restoreButton) {
      restoreButton.disabled = true;
      void restore(restoreButton.dataset.restoreCovenAltar);
    }
  });
  covenList.addEventListener("change", (event) => {
    if (event.target.name === "coven") startIn = event.target.value;
  });
  covenList.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-coven-start-form]");
    if (!form) return;
    event.preventDefault();
    void start(form);
  });
  // Signing in from here shows your covens.
  document.addEventListener("saltAuthSuccess", () => {
    coven = { status: "idle", user: null, groups: [], message: "" };
    if (!modal.hidden && tab === "coven") showCoven();
  });

  global.SaltAltarTabs = {
    /** My Altars has just opened: draw the switch, and the Coven tab if it's the one chosen. */
    opened() {
      drawTabs();
      if (tab === "coven") showCoven();
    },
    /** Open My Altars on a tab ("personal" or "coven"): the switch at the top of the page (altar-toolbar.js). */
    async open(next) {
      const chosen = asTab(next);
      if (chosen) {
        tab = chosen;
        SW.remember(tabKey(), chosen);
      }
      if (typeof global.openSavedAltarsManager === "function") await global.openSavedAltarsManager();
    },
    current: () => tab
  };

  drawTabs();

  // A link to a tab (/altar/?tab=coven) opens My Altars on it; the link is then cleared so it works again.
  try {
    const params = new URLSearchParams(global.location.search);
    const linked = asTab(params.get("tab"));
    if (linked) {
      params.delete("tab");
      const search = params.toString();
      global.history.replaceState(global.history.state, "", `${global.location.pathname}${search ? `?${search}` : ""}${global.location.hash}`);
      tab = linked;
      SW.remember(tabKey(), linked);
      if (!params.has("covenAltar") && typeof global.openSavedAltarsManager === "function") {
        global.setTimeout(() => void global.openSavedAltarsManager(), 600);
      }
    }
  } catch {
    // The page works without the link.
  }

  // The Altar tab in the site's bar, pressed while already here, goes back to Personal.
  document.addEventListener("click", (event) => {
    if (!event.target.closest?.('a[data-site-tab="altar"]')) return;
    tab = "personal";
    SW.remember(tabKey(), "personal");
    drawTabs();
  });
})(window);
