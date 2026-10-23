/*
 * A coven's shared altar: one altar the whole coven tends together, live.
 * Members in good standing set candles and things from the altar cabinet on
 * it, move them, light and snuff candles (each burns down over the time it
 * was given) and leave an intention with what they place. Changes arrive for
 * everyone at once over Supabase Realtime (covens/coven/coven.js passes them
 * here), and the people at the altar show beside it.
 */
(function (global) {
  "use strict";

  const L = global.CovenLogic;
  const D = global.CovenData;
  const UI = global.CovenUI;
  const { esc, href } = UI;
  const ART = global.AltarArtwork || { items: {}, backgrounds: [] };

  const CATEGORIES = [
    { key: "herbs", label: "Herbs" },
    { key: "crystals", label: "Crystals" },
    { key: "deities", label: "Deities" },
    { key: "tools", label: "Tools" },
    { key: "vessels", label: "Vessels" }
  ];
  const SWATCH = { white: "#f4efe2", black: "#1b1b1b", red: "#b3261e", orange: "#e07b24", yellow: "#e8c547", green: "#2f7d44", blue: "#2f5fa8", indigo: "#3b2f7a", purple: "#6b3fa0", pink: "#e58fb4", magenta: "#b0277a", brown: "#6b4426", grey: "#8a8a8a", silver: "#c9ccd1", gold: "#c9a64a", rainbow: "linear-gradient(135deg,#e53935,#fb8c00,#fdd835,#43a047,#1e88e5,#8e24aa)" };

  let pane = null;
  let state = null;
  let items = [];
  let selected = null;
  let timer = null;
  let candle = { color: "white", form: "vigil", burn: 60 };
  let category = "herbs";
  let search = "";

  const stage = () => pane?.querySelector("[data-stage]");
  const canTend = () => state.standing.ok || state.perms.site;
  const canClear = (item) => state.perms.site || state.perms.moderate || (item.placed_by === state.context.user?.id && state.standing.ok);

  function cabinet() {
    // Some forms have no picture yet; the coven altar only offers those that do.
    const list = (ART.items?.[category] || []).flatMap((item) => {
      const forms = (item.forms || []).filter((form) => form.image);
      return forms.map((form) => ({ name: forms.length > 1 ? `${item.name} · ${form.label}` : item.name, image: L.sitePath(form.image), keywords: item.keywords || [] }));
    });
    const words = search.toLowerCase().split(/\s+/).filter(Boolean);
    return list.filter((entry) => words.every((w) => `${entry.name} ${entry.keywords.join(" ")}`.toLowerCase().includes(w))).slice(0, 60);
  }

  function itemHtml(item) {
    const flame = L.candleState(item);
    const [wx, wy] = item.kind === "candle" ? L.candleWick(item.image) : [0.5, 0];
    const label = `${item.label || (item.kind === "candle" ? "Candle" : "Offering")}${item.kind === "candle" ? (flame.lit ? `, lit, ${flame.minutesLeft} minutes left` : flame.burntOut ? ", burnt down" : ", unlit") : ""}`;
    return `<button type="button" class="cv-altar__item${selected === item.id ? " is-selected" : ""}${flame.burntOut ? " is-burnt" : ""}" data-item="${esc(item.id)}"
        style="left:${(item.x * 100).toFixed(2)}%;top:${(item.y * 100).toFixed(2)}%;z-index:${10 + (item.z || 0)};--scale:${item.scale};--rot:${item.rotation}deg;--wick-x:${(wx * 100).toFixed(2)}%;--wick-y:${(wy * 100).toFixed(2)}%;--life:${flame.remaining.toFixed(3)}"
        aria-label="${esc(label)}" aria-pressed="${selected === item.id}">
        <img src="${esc(href(item.image))}" alt="" loading="lazy" decoding="async" />
        ${flame.lit ? `<span class="cv-flame" aria-hidden="true"></span>` : ""}
      </button>`;
  }

  function drawStage() {
    const el = stage();
    if (!el) return;
    const background = ART.backgrounds?.find((b) => b.id === state.coven.altar_background);
    el.style.backgroundImage = background ? `url("${href(background.assetPath)}")` : "";
    el.innerHTML = items.map(itemHtml).join("") + (items.length ? "" : `<p class="cv-altar__empty">The coven altar is bare.${canTend() ? " Set a candle or an offering on it." : ""}</p>`);
  }

  function selectedHtml() {
    const item = items.find((i) => i.id === selected);
    if (!item) return `<p class="sp-caption">Choose something on the altar to tend it.${canTend() ? " Drag to move it; arrow keys nudge it." : ""}</p>`;
    const flame = L.candleState(item);
    const placedBy = item.placed_by ? UI.nameOf(state.context, item.placed_by) : "A member";
    const litBy = item.lit_by ? UI.nameOf(state.context, item.lit_by) : "";
    return `<h3>${esc(item.label || (item.kind === "candle" ? "Candle" : "Offering"))}</h3>
      <p class="sp-caption">Set here by ${esc(placedBy)}</p>
      ${item.intention ? `<p class="cv-doc">“${esc(item.intention)}”</p>` : ""}
      ${item.kind === "candle" ? `<p class="sp-caption">${flame.lit ? `Lit by ${esc(litBy || "a member")} · ${flame.minutesLeft} min left` : flame.burntOut ? "Burnt down" : "Unlit"}</p>` : ""}
      ${canTend() ? `<div class="sp-actions">
        ${item.kind === "candle" ? `<button class="button button--small ${flame.lit ? "button--ghost" : "button--primary"}" type="button" data-act="light">${flame.lit ? "Snuff" : flame.burntOut ? "Light a fresh flame" : "Light"}</button>` : ""}
        <button class="button button--ghost button--small" type="button" data-act="bigger" aria-label="Larger">＋</button>
        <button class="button button--ghost button--small" type="button" data-act="smaller" aria-label="Smaller">－</button>
        <button class="button button--ghost button--small" type="button" data-act="left" aria-label="Turn left">↺</button>
        <button class="button button--ghost button--small" type="button" data-act="right" aria-label="Turn right">↻</button>
        <button class="button button--ghost button--small" type="button" data-act="front">Bring forward</button>
      </div>` : ""}
      <div class="sp-actions">
        ${canClear(item) ? `<button class="button button--ghost button--small" type="button" data-act="clear">Clear away</button>` : ""}
        ${item.placed_by && item.placed_by !== state.context.user?.id ? `<button class="button button--ghost button--small" type="button" data-act="report">Report</button>` : ""}
      </div>`;
  }

  function drawPanel() {
    const el = pane?.querySelector("[data-selected]");
    if (el) el.innerHTML = selectedHtml();
  }

  function drawPicker() {
    const el = pane?.querySelector("[data-picker]");
    if (!el) return;
    const list = cabinet();
    el.innerHTML = list.length ? list.map((entry) => `<button type="button" data-place="${esc(entry.image)}" data-name="${esc(entry.name)}"><img src="${esc(href(entry.image))}" alt="" loading="lazy" /><span>${esc(entry.name)}</span></button>`).join("") : `<p class="sp-empty">Nothing matches.</p>`;
  }

  function presence(list) {
    const el = pane?.querySelector("[data-presence]");
    if (!el) return;
    const here = (list || []).filter((p) => p.place === "altar").map((p) => p.name);
    const elsewhere = (list || []).length - here.length;
    el.innerHTML = here.length ? `<span class="cv-presence__dot" aria-hidden="true"></span> At the altar: ${here.map(esc).join(", ")}${elsewhere ? ` · ${elsewhere} in the coven` : ""}` : "No one else is at the altar right now.";
  }

  function addPanel() {
    if (!canTend()) return `<p class="sp-notice">${esc(state.perms.member ? state.standing.reasons.join(" ") : "Only members can tend the coven altar.")}</p>`;
    return `<details class="sp-details" open><summary>Set a candle</summary>
        <form class="sp-section" data-candle>
          <div class="cv-swatches" role="group" aria-label="Candle colour">${L.CANDLE_COLORS.map((c) => `<button type="button" class="cv-swatch" style="background:${SWATCH[c]}" data-color="${c}" aria-label="${c}" aria-pressed="${candle.color === c}"></button>`).join("")}</div>
          <div class="sp-grid-2">
            <div class="sp-field"><label for="cv-candle-form">Candle</label><select id="cv-candle-form" name="form">${L.CANDLE_FORMS.map((f) => `<option value="${f.id}"${f.id === candle.form ? " selected" : ""}>${esc(f.label)}</option>`).join("")}</select></div>
            <div class="sp-field"><label for="cv-candle-burn">Burns for</label><select id="cv-candle-burn" name="burn">${L.BURN_CHOICES.map((m) => `<option value="${m}"${m === candle.burn ? " selected" : ""}>${m < 60 ? `${m} minutes` : `${m / 60} hour${m === 60 ? "" : "s"}`}</option>`).join("")}</select></div>
          </div>
          <div class="sp-field"><label for="cv-candle-intention">Intention (optional)</label><input id="cv-candle-intention" name="intention" maxlength="280" placeholder="For Rowan’s healing" /></div>
          <label class="cv-check"><input type="checkbox" name="lit" checked /> <span>Light it now</span></label>
          <div class="sp-actions"><button class="button button--primary button--small" type="submit">Set the candle</button></div>
        </form></details>
      <details class="sp-details"><summary>From the altar cabinet</summary>
        <div class="sp-section">
          <div class="sp-chips" role="group" aria-label="Cabinet shelf">${CATEGORIES.map((c) => `<button type="button" class="sp-chip" data-category="${c.key}" aria-pressed="${c.key === category}">${esc(c.label)}</button>`).join("")}</div>
          <div class="sp-field"><label for="cv-cabinet-search">Search the cabinet</label><input id="cv-cabinet-search" type="search" value="${esc(search)}" placeholder="Rose, protection, Hekate…" /></div>
          <div class="sp-field"><label for="cv-offering-intention">Intention (optional)</label><input id="cv-offering-intention" maxlength="280" /></div>
          <div class="cv-picker" data-picker></div>
        </div></details>
      ${state.perms.manage || state.perms.site ? `<div class="sp-field"><label for="cv-altar-bg">Altar setting</label><select id="cv-altar-bg" data-background><option value="">Candlelit dark</option>${(ART.backgrounds || []).map((b) => `<option value="${esc(b.id)}"${b.id === state.coven.altar_background ? " selected" : ""}>${esc(b.name)}</option>`).join("")}</select></div>` : ""}`;
  }

  async function mount(el, s) {
    pane = el;
    state = s;
    selected = null;
    pane.innerHTML = `<section class="cv-altar-layout" aria-label="Coven altar">
        <div class="sp-section">
          <p class="cv-presence" data-presence aria-live="polite"></p>
          <div class="cv-altar" data-stage role="group" aria-label="The coven altar"><p class="cv-altar__empty">Setting the altar…</p></div>
          <p class="cv-status" role="status" aria-live="polite" data-status></p>
        </div>
        <aside class="cv-altar-panel">
          <div class="sp-card" data-selected></div>
          ${addPanel()}
        </aside>
      </section>`;
    presence(s.presence);
    try {
      items = await D.altarItems(s.coven.id);
      await UI.loadNames(s.context, items.flatMap((i) => [i.placed_by, i.lit_by]));
    } catch (error) {
      stage().innerHTML = `<p class="cv-altar__empty">${esc(L.errorMessage(error))}</p>`;
      return;
    }
    if (pane !== el) return;
    drawStage();
    drawPanel();
    drawPicker();
    wire();
    clearInterval(timer);
    // Candles burn down while the page is open.
    timer = setInterval(() => {
      if (!pane) return;
      drawStage();
      drawPanel();
    }, 30000);
  }

  const status = (message, isError) => UI.setStatus(pane?.querySelector("[data-status]"), message, isError);

  async function save(id, changes) {
    const before = items.find((i) => i.id === id);
    items = L.applyChange(items, { eventType: "UPDATE", new: { id, ...changes } });
    drawStage();
    drawPanel();
    try {
      const saved = await D.tendAltarItem(id, changes);
      items = L.applyChange(items, { eventType: "UPDATE", new: saved });
      status("");
    } catch (error) {
      if (before) items = L.applyChange(items, { eventType: "UPDATE", new: before });
      status(L.errorMessage(error), true);
    }
    drawStage();
    drawPanel();
  }

  async function place(row) {
    try {
      const saved = await D.placeOnAltar({ coven_id: state.coven.id, z: Math.max(0, ...items.map((i) => i.z || 0)) + 1, x: 0.35 + Math.random() * 0.3, y: 0.78 + Math.random() * 0.12, ...row });
      items = L.applyChange(items, { eventType: "INSERT", new: saved });
      selected = saved.id;
      status("");
      drawStage();
      drawPanel();
    } catch (error) {
      status(L.errorMessage(error), true);
    }
  }

  function wire() {
    const el = stage();
    let drag = null;

    el.addEventListener("pointerdown", (event) => {
      const button = event.target.closest("[data-item]");
      if (!button) return;
      selected = button.dataset.item;
      el.querySelectorAll("[data-item]").forEach((b) => {
        b.classList.toggle("is-selected", b === button);
        b.setAttribute("aria-pressed", String(b === button));
      });
      drawPanel();
      if (!canTend()) return;
      drag = { button, id: selected, startX: event.clientX, startY: event.clientY, moved: false };
      button.setPointerCapture(event.pointerId);
      button.classList.add("is-dragging");
    });
    el.addEventListener("pointermove", (event) => {
      if (!drag) return;
      if (Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY) > 4) drag.moved = true;
      if (!drag.moved) return;
      const rect = el.getBoundingClientRect();
      const { x, y } = L.clampPosition((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
      drag.x = x;
      drag.y = Math.max(0.08, y);
      drag.button.style.left = `${x * 100}%`;
      drag.button.style.top = `${drag.y * 100}%`;
    });
    const drop = () => {
      if (!drag) return;
      const { id, moved, x, y, button } = drag;
      button.classList.remove("is-dragging");
      drag = null;
      if (moved && x !== undefined) save(id, { x, y });
    };
    el.addEventListener("pointerup", drop);
    el.addEventListener("pointercancel", drop);

    let nudge = null;
    el.addEventListener("keydown", (event) => {
      const id = event.target.closest("[data-item]")?.dataset.item;
      const steps = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] };
      if (!id || !steps[event.key] || !canTend()) return;
      event.preventDefault();
      const item = items.find((i) => i.id === id);
      const next = L.clampPosition(item.x + steps[event.key][0], Math.max(0.08, item.y + steps[event.key][1]));
      items = L.applyChange(items, { eventType: "UPDATE", new: { id, ...next } });
      selected = id;
      drawStage();
      el.querySelector(`[data-item="${CSS.escape(id)}"]`)?.focus();
      clearTimeout(nudge);
      nudge = setTimeout(() => save(id, next), 500);
    });
    el.addEventListener("click", (event) => {
      if (!event.target.closest("[data-item]")) {
        selected = null;
        drawStage();
        drawPanel();
      }
    });

    pane.querySelector("[data-selected]").addEventListener("click", async (event) => {
      const act = event.target.closest("[data-act]")?.dataset.act;
      const item = items.find((i) => i.id === selected);
      if (!act || !item) return;
      const flame = L.candleState(item);
      if (act === "light") {
        // A burnt-down candle is still marked lit; put it out first so the new flame gets a fresh start.
        if (flame.burntOut) await save(item.id, { lit: false });
        return save(item.id, { lit: !flame.lit });
      }
      if (act === "bigger") return save(item.id, { scale: Math.min(2.5, Math.round((item.scale + 0.15) * 100) / 100) });
      if (act === "smaller") return save(item.id, { scale: Math.max(0.4, Math.round((item.scale - 0.15) * 100) / 100) });
      if (act === "left" || act === "right") {
        let rotation = item.rotation + (act === "left" ? -15 : 15);
        if (rotation > 180) rotation -= 360;
        if (rotation < -180) rotation += 360;
        return save(item.id, { rotation });
      }
      if (act === "front") return save(item.id, { z: Math.max(0, ...items.map((i) => i.z || 0)) + 1 });
      if (act === "report") return UI.report({ target_type: "altar_item", target_id: item.id, coven_id: state.coven.id, target_user_id: item.placed_by, label: "this altar offering" });
      if (act === "clear") {
        try {
          await D.clearAltarItem(item.id);
          items = items.filter((i) => i.id !== item.id);
          selected = null;
          drawStage();
          drawPanel();
        } catch (error) {
          status(L.errorMessage(error), true);
        }
      }
    });

    const candleForm = pane.querySelector("[data-candle]");
    candleForm?.addEventListener("click", (event) => {
      const swatch = event.target.closest("[data-color]");
      if (!swatch) return;
      candle.color = swatch.dataset.color;
      candleForm.querySelectorAll("[data-color]").forEach((b) => b.setAttribute("aria-pressed", String(b === swatch)));
    });
    candleForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      candle.form = candleForm.elements.form.value;
      candle.burn = Number(candleForm.elements.burn.value) || 60;
      const formLabel = L.CANDLE_FORMS.find((f) => f.id === candle.form)?.label || "Candle";
      place({ kind: "candle", image: L.candleImage(candle.color, candle.form), label: `${candle.color[0].toUpperCase()}${candle.color.slice(1)} ${formLabel.toLowerCase()} candle`, burn_minutes: candle.burn, lit: candleForm.elements.lit.checked, intention: candleForm.elements.intention.value.trim() || null });
      candleForm.elements.intention.value = "";
    });

    pane.querySelectorAll("[data-category]").forEach((b) => b.addEventListener("click", () => {
      category = b.dataset.category;
      pane.querySelectorAll("[data-category]").forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
      drawPicker();
    }));
    pane.querySelector("#cv-cabinet-search")?.addEventListener("input", (event) => {
      search = event.target.value;
      drawPicker();
    });
    pane.querySelector("[data-picker]")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-place]");
      if (!button) return;
      const intention = pane.querySelector("#cv-offering-intention");
      place({ kind: "object", image: button.dataset.place, label: button.dataset.name, intention: intention.value.trim() || null });
      intention.value = "";
    });
    pane.querySelector("[data-background]")?.addEventListener("change", async (event) => {
      try {
        state.coven = { ...state.coven, ...(await D.updateCoven(state.coven.id, { altar_background: event.target.value || null })) };
        drawStage();
      } catch (error) {
        status(L.errorMessage(error), true);
      }
    });
  }

  async function onChange(change) {
    if (!state) return;
    const record = change?.new;
    if (record?.coven_id && record.coven_id !== state.coven.id) return;
    if (change?.eventType === "DELETE" && !items.some((i) => i.id === change.old?.id)) return;
    // Don't snap a piece back while it's being dragged here.
    if (record?.id && pane?.querySelector(".is-dragging")?.dataset.item === record.id) return;
    items = L.applyChange(items, change);
    if (change?.eventType === "DELETE" && selected === change.old?.id) selected = null;
    if (record) await UI.loadNames(state.context, [record.placed_by, record.lit_by]);
    if (!pane) return;
    drawStage();
    drawPanel();
  }

  function unmount() {
    pane = null;
    clearInterval(timer);
  }

  global.CovenAltar = { mount, unmount, onChange, onPresence: presence };
})(window);
