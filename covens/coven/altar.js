/*
 * A coven's Altars, as in the app (coven/c/[slug]/altar.tsx): whole altars,
 * shared. The main ritual altar comes first (kept by the coven's head), then
 * the altars members have started, newest first. Each opens in the altar
 * editor itself (/altar/?covenAltar=<id>, altar/js/features/coven-altar.js),
 * where everyone at it sees changes as they happen and changes save by
 * themselves.
 *
 * Here: start an altar, and "Who tends it" (its name, who may tend it, a
 * lock, chosen people and positions, clearing it away and bringing it back,
 * and deleting it for good).
 * The database decides every change (coven_altar_can_edit and the
 * set_coven_altar* functions); this page only asks and shows why not.
 * Rules shared with the app come from js/core/altar.js (SaltCore.altar.covenAltar),
 * loaded when the tab opens.
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, href } = UI;

  // Who tends an altar: the app's choices (altarDoc.ts TEND_CHOICES), with these if the core hasn't loaded.
  const FALLBACK_CHOICES = [
    { value: "members", label: "Everyone in the coven" },
    { value: "chosen", label: "People I choose" },
    { value: "keeper", label: "Only me" }
  ];

  let pane = null;
  let state = null;
  let altars = [];
  let counts = {};
  let objects = {};
  let open = "";
  let redraw = null;

  const A = () => global.SaltCore?.altar?.covenAltar || null;
  const choices = () => A()?.TEND_CHOICES || FALLBACK_CHOICES;
  const tendedBy = (altar) => A()?.tendedBy(altar) || "";
  const altarHref = (altar) => href(`/altar/?covenAltar=${encodeURIComponent(altar.id)}&c=${encodeURIComponent(state.coven.slug)}`);

  /** The altar page's own pictures, wherever this page sits. */
  const picture = (path) => {
    const value = String(path || "");
    if (!value || /^(https?:|data:|blob:)/i.test(value)) return value;
    return href(L.sitePath(value.startsWith("/") || value.startsWith("../") ? value : `/${value.replace(/^\.\//, "")}`));
  };

  /** A still picture of an altar: its setting and what's on it, where it stands. */
  function previewHtml(altar, rows, { label } = {}) {
    const list = [...(rows || [])].sort((a, b) => a.position - b.position).map((r) => r.data || {});
    const background = altar.background ? ` style="background-image:url('${esc(picture(altar.background))}')"` : "";
    const items = list
      .map((o) => {
        const left = Number(o.leftPercent);
        const top = Number(o.topPercent);
        const size = Number(o.sizePercent) || 0.08;
        if (!Number.isFinite(left) || !Number.isFinite(top)) return "";
        const image = o.imagePath ? `<img src="${esc(picture(o.imagePath))}" alt="" loading="lazy" decoding="async" />` : `<span>${esc(o.fallbackSymbol || "✦")}</span>`;
        const lit = String(o.lit) === "true" && o.type === "candle";
        return `<span class="cv-still__item${lit ? " is-lit" : ""}" style="left:${(left * 100).toFixed(2)}%;top:${(top * 100).toFixed(2)}%;width:${(size * 100).toFixed(2)}%;z-index:${Number(o.zIndex) || 10};--rot:${Number(o.rotation) || 0}deg">${image}${lit ? `<span class="cv-flame" aria-hidden="true"></span>` : ""}</span>`;
      })
      .join("");
    return `<div class="cv-still" role="img" aria-label="${esc(label || `${altar.name}, with ${list.length} ${list.length === 1 ? "thing" : "things"} on it`)}"${background}>${items}${list.length ? "" : `<p class="cv-altar__empty">Nothing on it yet.</p>`}</div>`;
  }

  function altarCard(altar) {
    const count = counts[altar.id] || 0;
    const petition = A()?.petitionOf(altar);
    const archived = Boolean(altar.archived_at);
    return `<article class="sp-card cv-altar-card" data-altar="${esc(altar.id)}">
        <div class="cv-altar-card__head">
          <h3>${esc(altar.name)}</h3>
          <div class="cv-meta">
            ${altar.is_main ? `<span class="cv-pill cv-pill--gold">Ritual altar</span>` : ""}
            ${petition ? `<span class="cv-pill">A petition’s altar</span>` : ""}
            ${archived ? `<span class="cv-pill">Cleared away</span>` : ""}
            <span class="cv-pill">${count} ${count === 1 ? "thing" : "things"} on it</span>
          </div>
          <p class="sp-caption">${esc(tendedBy(altar))}${altar.created_by && !altar.is_main ? ` · started by ${esc(UI.nameOf(state.context, altar.created_by))}` : ""}</p>
        </div>
        ${archived ? "" : `<a class="cv-still-link" href="${esc(altarHref(altar))}" aria-label="Open ${esc(altar.name)}">${objects[altar.id] ? previewHtml(altar, objects[altar.id]) : `<div class="cv-still"><p class="cv-altar__empty">Opening…</p></div>`}</a>`}
        <div class="sp-actions">
          ${archived ? "" : `<a class="button button--primary button--small" href="${esc(altarHref(altar))}">Open the altar</a>`}
          ${petition ? `<a class="button button--ghost button--small" href="${esc(href(`/covens/coven/?c=${encodeURIComponent(state.coven.slug)}&tab=petitions`))}" data-tab="petitions">See the petition</a>` : ""}
          <button class="button button--ghost button--small" type="button" data-tends="${esc(altar.id)}" aria-expanded="${open === altar.id}">Who tends it</button>
        </div>
        <div data-tends-panel="${esc(altar.id)}"${open === altar.id ? "" : " hidden"}></div>
      </article>`;
  }

  function startForm() {
    const { perms } = state;
    if (!perms.member) return "";
    if (!perms.startAltars) return `<p class="sp-caption">Your position doesn’t start altars. The coven’s head can change that under Manage → Positions.</p>`;
    if (!state.standing.ok) return `<p class="sp-caption">${esc(state.standing.reasons.join(" "))}</p>`;
    return `<details class="sp-details"><summary>Start an altar</summary>
        <form class="sp-section" data-start-altar>
          <div class="sp-field"><label for="cv-new-altar">Its name</label><input id="cv-new-altar" name="name" required maxlength="80" placeholder="Healing altar, Ancestors, Full moon…" /></div>
          <fieldset class="sp-field"><legend>Who tends it</legend>
            ${choices().map((c, i) => `<label class="cv-check"><input type="radio" name="edit_mode" value="${c.value}"${i === 0 ? " checked" : ""} /> <span>${esc(c.label)}</span></label>`).join("")}
          </fieldset>
          <p class="sp-caption">You keep the altars you start: you choose who tends them, lock them and clear them away. The coven’s head and those who keep altars can too.</p>
          <div class="sp-actions"><button class="button button--primary" type="submit">Start the altar</button></div>
          <p class="cv-status" role="status" aria-live="polite" data-status></p>
        </form></details>`;
  }

  function draw() {
    if (!pane) return;
    const current = altars.filter((a) => !a.archived_at);
    const cleared = altars.filter((a) => a.archived_at);
    pane.innerHTML = `<section class="cv-altars" aria-label="Altars">
        <p>Each of the coven’s altars is a whole altar, like your own: the cabinet, candles that burn down, offerings and workings. Open one and everyone there sees it change as it happens; changes save for the coven by themselves.</p>
        <p class="cv-presence" data-presence aria-live="polite"></p>
        ${startForm()}
        ${current.length ? current.map(altarCard).join("") : `<p class="sp-empty">The coven has no altars yet.</p>`}
        ${cleared.length ? `<details class="sp-details"><summary>Cleared away (${cleared.length})</summary>${cleared.map(altarCard).join("")}</details>` : ""}
      </section>`;
    presence(state.presence);
    wire();
  }

  function presence(list) {
    const el = pane?.querySelector("[data-presence]");
    if (!el) return;
    const names = (list || []).filter((p) => p.place === "altar" || p.place === "altars").map((p) => p.name).filter(Boolean);
    el.innerHTML = names.length ? `<span class="cv-presence__dot" aria-hidden="true"></span> Looking at the altars: ${names.map(esc).join(", ")}` : "";
  }

  // --- deleting an altar for good -----------------------------------------------

  // The app's rules and words (lib/covens/altarPanel.ts, via js/core/covens.js), with these if it hasn't loaded.
  const P = () => global.SaltCore?.covens?.altarPanel || null;
  const deleteWords = (name) =>
    P()?.deleteAltarWords(name) || {
      title: `Delete ${name || "this altar"}?`,
      body: "This removes the altar and everything on it for the whole coven. This can’t be undone.",
      confirm: "Delete the altar",
      gentler: "Clearing it away hides it instead, and its keepers can bring it back."
    };

  /** For an altar's keepers: delete it for good, beside the gentler clearing away. */
  function deleteHtml(altar, access) {
    if (altar.is_main) return "";
    const check = P() ? P().canDeleteAltar(altar, access) : { ok: Boolean(access?.keeper) && !access?.ritual_id, reason: null };
    const words = deleteWords(altar.name);
    return `<div class="sp-section">
        <p class="sp-label">Delete it for good</p>
        <p class="sp-caption">${esc(words.body)} ${esc(words.gentler)}</p>
        ${check.ok ? `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-delete-altar>Delete this altar</button></div><p class="cv-status" role="status" aria-live="polite" data-delete-status></p>` : check.reason ? `<p class="sp-caption">${esc(check.reason)}</p>` : ""}
      </div>`;
  }

  // --- who tends it -------------------------------------------------------------

  async function tendsPanel(holder, altar) {
    holder.innerHTML = `<p class="sp-caption">Asking who tends it…</p>`;
    let access = null;
    try {
      access = await D.altarAccess(altar.id);
    } catch {
      access = null;
    }
    const keeper = Boolean(access?.keeper || state.perms.site);
    const why = access && !access.can_edit && access.reason ? `<p class="sp-caption">${esc(access.reason)}</p>` : access?.can_edit ? `<p class="sp-caption">You can tend it.</p>` : "";
    if (!keeper) {
      holder.innerHTML = `<div class="sp-section"><p>${esc(tendedBy(altar))}.</p>${why}<p class="sp-caption">Its keeper chooses who tends it.</p></div>`;
      return;
    }
    const [editors, members] = await Promise.all([D.altarEditors(altar.id).catch(() => []), D.members(state.coven.id).catch(() => [])]);
    const active = (members || []).filter((m) => m.status === "active");
    await UI.loadNames(state.context, active.map((m) => m.user_id));
    const chosenPerson = (id) => editors.some((e) => e.user_id === id && e.active !== false);
    const chosenRank = (id) => editors.some((e) => e.rank_id === id && e.active !== false);
    const ranks = [...state.ranks].sort((a, b) => b.level - a.level);
    holder.innerHTML = `<form class="sp-section" data-altar-settings>
        ${why}
        <div class="sp-field"><label for="alt-name-${esc(altar.id)}">Its name</label><input id="alt-name-${esc(altar.id)}" name="name" required maxlength="80" value="${esc(altar.name)}" /></div>
        <fieldset class="sp-field"><legend>Who tends it</legend>
          ${choices().map((c) => `<label class="cv-check"><input type="radio" name="edit_mode" value="${c.value}"${c.value === altar.edit_mode ? " checked" : ""} /> <span>${esc(altar.is_main && c.value === "chosen" ? "Those the coven’s head chooses" : c.value === "keeper" ? "Only its keepers" : c.label)}</span></label>`).join("")}
        </fieldset>
        <label class="cv-check"><input type="checkbox" name="locked"${altar.locked ? " checked" : ""} /> <span>Lock it: only its keepers can change it</span></label>
        <div class="sp-actions"><button class="button button--primary button--small" type="submit">Save</button></div>
        <p class="cv-status" role="status" aria-live="polite" data-status></p>
      </form>
      <div class="sp-section" data-chosen${altar.edit_mode === "chosen" ? "" : " hidden"}>
        <p class="sp-label">Chosen to tend it</p>
        <p class="sp-caption">${altar.is_main ? "Positions that tend altars always can." : "Positions that tend altars always can, as well as those you tick."}</p>
        ${ranks.length ? `<p class="sp-caption">Positions</p><div class="cv-chosen">${ranks.map((r) => `<label class="cv-check"><input type="checkbox" data-editor-rank="${esc(r.id)}"${chosenRank(r.id) ? " checked" : ""} /> <span>${esc(r.name)}</span></label>`).join("")}</div>` : ""}
        <p class="sp-caption">People</p>
        <div class="cv-chosen">${active.filter((m) => m.user_id !== state.context.user?.id).map((m) => `<label class="cv-check"><input type="checkbox" data-editor-user="${esc(m.user_id)}"${chosenPerson(m.user_id) ? " checked" : ""} /> <span>${esc(UI.nameOf(state.context, m.user_id))}</span></label>`).join("") || `<span class="sp-caption">No one else yet.</span>`}</div>
        <p class="cv-status" role="status" aria-live="polite" data-chosen-status></p>
      </div>
      ${altar.is_main ? "" : `<div class="sp-actions"><button class="button button--ghost button--small" type="button" data-archive="${altar.archived_at ? "0" : "1"}">${altar.archived_at ? "Bring it back" : "Clear it away"}</button></div><p class="cv-status" role="status" aria-live="polite" data-archive-status></p>`}
      ${deleteHtml(altar, access)}`;

    const form = holder.querySelector("[data-altar-settings]");
    form.addEventListener("change", (event) => {
      if (event.target.name === "edit_mode") holder.querySelector("[data-chosen]").hidden = event.target.value !== "chosen";
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const saved = await UI.busy(form, form.querySelector("[data-status]"), () => D.setAltar(altar.id, name, form.elements.edit_mode.value, form.elements.locked.checked), { done: "Saved." });
      if (saved) {
        altars = altars.map((a) => (a.id === altar.id ? { ...a, ...saved } : a));
        const head = holder.closest("[data-altar]")?.querySelector(".cv-altar-card__head .sp-caption");
        if (head) head.textContent = tendedBy({ ...altar, ...saved });
      }
    });
    holder.querySelectorAll("[data-editor-rank], [data-editor-user]").forEach((box) =>
      box.addEventListener("change", async () => {
        const who = box.dataset.editorRank ? { rankId: box.dataset.editorRank } : { userId: box.dataset.editorUser };
        const ok = await UI.busy(box, holder.querySelector("[data-chosen-status]"), () => D.setAltarEditor(altar.id, who, box.checked).then(() => true), { done: "Saved." });
        if (!ok) box.checked = !box.checked;
      })
    );
    holder.querySelector("[data-delete-altar]")?.addEventListener("click", async (event) => {
      const words = deleteWords(altar.name);
      if (!(await UI.confirmAction(words.title, words.body, words.confirm))) return;
      const ok = await UI.busy(event.currentTarget, holder.querySelector("[data-delete-status]"), () => D.deleteAltar(altar.id).then(() => true));
      if (!ok) return;
      open = "";
      await reload();
    });
    holder.querySelector("[data-archive]")?.addEventListener("click", async (event) => {
      const archive = event.currentTarget.dataset.archive === "1";
      if (archive && !(await UI.confirmAction(`Clear away ${altar.name}?`, "It leaves the coven’s altars. Its keepers can bring it back.", "Clear it away"))) return;
      const ok = await UI.busy(event.currentTarget, holder.querySelector("[data-archive-status]"), () => D.archiveAltar(altar.id, archive).then(() => true));
      if (ok) await reload();
    });
  }

  // --- wiring --------------------------------------------------------------------

  function wire() {
    const start = pane.querySelector("[data-start-altar]");
    start?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const made = await UI.busy(start, start.querySelector("[data-status]"), () => D.createAltar(state.coven.id, start.elements.name.value.trim(), start.elements.edit_mode.value));
      if (made?.id) global.location.assign(altarHref(made));
    });
    pane.querySelectorAll("[data-tends]").forEach((button) =>
      button.addEventListener("click", () => {
        const id = button.dataset.tends;
        const holder = pane.querySelector(`[data-tends-panel="${CSS.escape(id)}"]`);
        const opening = holder.hidden;
        holder.hidden = !opening;
        button.setAttribute("aria-expanded", String(opening));
        open = opening ? id : "";
        if (opening) tendsPanel(holder, altars.find((a) => a.id === id));
      })
    );
  }

  async function reload() {
    const [list, countMap] = await Promise.all([D.altars(state.coven.id), D.altarCounts(state.coven.id).catch(() => ({}))]);
    altars = A() ? A().sortAltars(list || []) : list || [];
    counts = countMap || {};
    draw();
    // A still picture of each altar, a few at a time.
    const showing = altars.filter((a) => !a.archived_at).slice(0, 12);
    await Promise.all(
      showing.map(async (altar) => {
        objects[altar.id] = await D.altarObjects(altar.id).catch(() => []);
        const link = pane?.querySelector(`[data-altar="${CSS.escape(altar.id)}"] .cv-still-link`);
        if (link) link.innerHTML = previewHtml(altar, objects[altar.id]);
      })
    );
  }

  async function mount(el, s) {
    pane = el;
    state = s;
    open = "";
    pane.innerHTML = `<p class="sp-caption">Opening the coven’s altars…</p>`;
    try {
      await UI.altarCore();
      await reload();
    } catch (error) {
      if (pane === el) pane.innerHTML = `<p class="sp-notice">${esc(L.errorMessage(error))}</p>`;
    }
  }

  /** An altar or something on one changed (coven.js passes coven_altars and coven_altar_objects changes). */
  function onChange(change) {
    if (!pane || !state) return;
    const row = change?.new && Object.keys(change.new).length ? change.new : change?.old;
    if (!row) return;
    global.clearTimeout(redraw);
    // Several people tending at once send many changes; gather them.
    redraw = global.setTimeout(() => {
      if (!pane) return;
      if (open) {
        // Keep "Who tends it" open as it is; just refresh the counts quietly.
        D.altarCounts(state.coven.id).then((c) => (counts = c || counts)).catch(() => {});
        return;
      }
      reload().catch(() => {});
    }, 1200);
  }

  function unmount() {
    pane = null;
    global.clearTimeout(redraw);
  }

  /**
   * A still picture of a coven altar, for a ritual under way: holder gets the
   * picture and a link to open the altar. Loads what it needs.
   */
  async function preview(holder, altarId, s) {
    state = state || s;
    if (!holder || !altarId) return;
    try {
      const [altar, rows] = await Promise.all([D.altar(altarId), D.altarObjects(altarId)]);
      if (!altar) return (holder.innerHTML = `<p class="sp-caption">The ritual’s altar has been cleared away.</p>`);
      const link = href(`/altar/?covenAltar=${encodeURIComponent(altar.id)}&c=${encodeURIComponent(s.coven.slug)}`);
      holder.innerHTML = `<a class="cv-still-link" href="${esc(link)}">${previewHtml(altar, rows)}</a><div class="sp-actions"><a class="button button--ghost button--small" href="${esc(link)}">Open ${esc(altar.name)}</a></div>`;
    } catch (error) {
      holder.innerHTML = `<p class="sp-caption">${esc(L.errorMessage(error))}</p>`;
    }
  }

  global.CovenAltar = { mount, unmount, onChange, onPresence: presence, preview, previewHtml };
})(window);
