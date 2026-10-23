/* =========================================================
   ALTAR READING & TOOLS
   The app's altar-wide tools (app/src/app/(tabs)/altar/[altarId].tsx and
   components/altar/*): the chips under the stage (petitions, sky and
   season, workings, read and arrange, why these pieces, history, share,
   light all, snuff all, full screen), the More sheets, reading the altar
   and its intention, layouts with meaning and snap to meaning, Tonight's
   altar and a deity's shrine (/altar/?tonight=1, /altar/?shrine=<deity>,
   and the app's ?altarId=tonight / ?altarId=shrine&deity=), the real sky
   and the moon window, the altar's history and its daily picture, the share
   card, things from your practice (an ancestor's candle, your stones, your
   plants, tonight's card or rune), and full screen.
   ========================================================= */

(function initializeAltarReading(global) {
  "use strict";

  const B = () => global.AltarApp;
  const A = () => global.SaltCore?.altar;
  const esc = (v) => B().esc(v);
  const nowIso = () => new Date().toISOString();
  const notice = (t) => B().notice(t);
  const label = (text) => `<p class="app-label">${esc(text)}</p>`;
  const INTENTIONS = "altar.intentions";
  const OPTIONS = "altar.options";
  const HISTORY = "altar.history";
  const PETITIONS = "altar.petitions";
  const ELEMENT_COLORS = { Fire: "#c2603a", Water: "#4f7f9f", Air: "#d8c88a", Earth: "#7a6a45" };
  const SUGGESTIONS = ["Protection for my home", "Steady money and good work", "Self-love", "Calm and good sleep", "Clear sight", "Honouring my ancestors"];

  const state = {
    tonight: null, // { altar, date }
    options: null,
    optionsEntry: null,
    unsavedOptions: null,
    intention: null, // entry
    petitionsOpen: 0,
    practice: { ancestors: [], stones: [], settings: [], plants: [], readings: [] }
  };

  const list = async (collection) => {
    try { return (await global.SaltCraft?.list(collection)) || []; } catch { return []; }
  };

  // ── This altar's options and intention ──────────────────────────────────
  async function loadAltarData() {
    const core = A();
    if (!core) return;
    const id = B().altarId();
    if (id) {
      const [options, intentions, petitions] = await Promise.all([list(OPTIONS), list(INTENTIONS), list(PETITIONS)]);
      const found = core.altarOptions.altarOptionsFor(options, id);
      state.options = found.options;
      state.optionsEntry = found.entryId;
      state.intention = core.intention.intentionFor(intentions, id);
      state.petitionsOpen = core.petitions.petitionBox(petitions, id).open.length;
    } else {
      state.options = state.unsavedOptions || core.altarOptions.defaultAltarOptions("");
      state.optionsEntry = null;
      state.intention = null;
      state.petitionsOpen = 0;
    }
    renderTools();
    renderSky();
  }
  async function changeOptions(change) {
    const id = B().altarId();
    state.options = { ...state.options, ...change, altarId: id };
    if (!id) state.unsavedOptions = state.options;
    else {
      try {
        if (state.optionsEntry) await global.SaltCraft.update(OPTIONS, state.optionsEntry, state.options);
        else state.optionsEntry = (await global.SaltCraft.add(OPTIONS, state.options))?.id || null;
      } catch { notice("Couldn’t keep that choice. Please try again."); }
    }
    renderSky();
  }

  // ── The chips under the stage ───────────────────────────────────────────
  let tools = null;
  function renderTools() {
    const core = A();
    if (!core) return;
    if (!tools) {
      tools = document.createElement("section");
      tools.className = "app-altar-tools";
      tools.setAttribute("aria-label", "Altar workings and tools");
      document.querySelector(".altar-stage-wrap")?.appendChild(tools);
    }
    const objects = B().doc().objects;
    const L = core.livingState;
    const canLight = objects.some((o) => L.isCandle(o) && !L.isLit(o) && !L.candleLife(o).spent);
    const anyLit = objects.some((o) => L.isLit(o));
    const intention = state.intention?.data?.text || "";
    tools.innerHTML = `
      ${intention ? `<p class="app-altar-tools__intention" role="button" tabindex="0" data-app-tool="intention" aria-label="${esc(`This altar’s intention: ${intention}`)}">“${esc(intention)}”</p>` : ""}
      ${B().chips([
        { label: state.petitionsOpen ? `Petitions (${state.petitionsOpen})` : "Petitions", symbol: "✉", action: "petitions", hint: `The petition box${state.petitionsOpen ? `, ${state.petitionsOpen} waiting` : ""}` },
        { label: "Sky & season", symbol: "☾", action: "options", hint: "Sky and season options for this altar" },
        { label: "Workings", symbol: "✶", action: "workings", hint: "Workings: spell jar, sachet, spell timer, scrying, the gratitude bowl, and things from your practice" },
        { label: "Read & arrange", symbol: "☉", action: "reading", hint: "Read this altar, its intention and layouts with meaning" },
        state.tonight ? { label: "Why these pieces", symbol: "✧", action: "tonight", hint: "Why each piece of tonight’s altar is there, and swaps" } : { label: "Tonight’s altar", symbol: "✧", action: "set-tonight", hint: "Set tonight’s altar from the day: its planet, moon and holidays" },
        { label: "History", symbol: "◷", action: "history", hint: "This altar’s history: what happened here and how it looked" },
        { label: "Share", symbol: "⇪", action: "share", disabled: !objects.length, hint: "Share a picture of this altar" },
        canLight ? { label: "Light all candles", symbol: "✺", action: "light-all" } : null,
        anyLit ? { label: "Snuff all", symbol: "◌", action: "snuff-all" } : null,
        { label: "Full screen", symbol: "⤢", action: "full", hint: "Fill the screen with the altar" }
      ].map((c) => c && { ...c, action: `tool:${c.action}` }))}`;
  }

  // ── More sheets (MoreSheet.tsx) ─────────────────────────────────────────
  const WORKINGS = [
    { id: "ritual", symbol: "✶", title: "Begin a ritual here", line: "A working from the book or one of your templates, its steps over the altar.", needsSave: true },
    { id: "jar", symbol: "⚱", title: "Spell jar", line: "Build a jar in layers, a word spoken with each, and seal it with wax." },
    { id: "sachet", symbol: "❦", title: "Sachet or charm bag", line: "Fill it, tie it with knots, carry it, and feed it on its day." },
    { id: "spell", symbol: "◔", title: "Spell over days", line: "A seven-day candle, nine nights, a moon’s jar: the altar keeps count.", needsSave: true },
    { id: "scry", symbol: "◉", title: "Scrying bowl", line: "A quiet, timed sit with dark water, then a few words on what came.", needsSave: true },
    { id: "gratitude", symbol: "❂", title: "Gratitude bowl", line: "A bead for each thing you’re thankful for, filling through the moon.", needsSave: true }
  ];
  const PRACTICE = [
    { id: "ancestor", symbol: "✿", title: "Ancestor", line: "A memorial candle for one of your dead, from Hedge → Ancestors." },
    { id: "stone", symbol: "◆", title: "My stone", line: "One of your own stones, with when it was last cleansed." },
    { id: "plant", symbol: "❧", title: "My plant", line: "A sprig or a pinch from your garden." },
    { id: "drawn", symbol: "ᚱ", title: "Tonight’s card or rune", line: "What you drew in your readings, laid on the altar." }
  ];
  const READING = [
    { id: "read", symbol: "☉", title: "Read this altar", line: "Its elements and planets, what it speaks of, and one thing to round it out." },
    { id: "intention", symbol: "✧", title: "Intention", line: "One line on what this altar is for, and how each piece holds it.", needsSave: true },
    { id: "layouts", symbol: "✣", title: "Layouts with meaning", line: "The four directions, a triangle, a pentacle, a grid, God and Goddess." }
  ];
  function rowsHtml(rows) {
    const saved = !!B().altarId();
    return `<div class="app-rows">${rows.map((row) => `<button type="button" class="app-row" style="text-align:left;cursor:pointer;color:inherit;font:inherit" data-more="${row.id}" aria-label="${esc(row.title)}"><span class="app-row__title"><span aria-hidden="true" style="color:var(--gold)">${esc(row.symbol)}</span> ${esc(row.title)}</span><span class="app-caption">${esc(row.needsSave && !saved ? `${row.line} Kept with the altar once it’s saved.` : row.line)}</span></button>`).join("")}</div>`;
  }
  function openMore(section) {
    const reading = section === "reading";
    const rows = reading ? (state.tonight ? [{ id: "tonight", symbol: "☾", title: "Why these pieces", line: "Why each piece of tonight’s altar is there, and what could stand in for it." }, ...READING] : READING) : WORKINGS;
    const intention = state.intention?.data?.text || "";
    const snap = !!state.options?.snapToMeaning;
    B().openSheet({
      eyebrow: reading ? "Read & arrange" : "Workings",
      title: reading ? "Read and arrange it" : "Work at this altar",
      html: `${reading && intention ? `<p class="app-living__glance">“${esc(intention)}”</p>` : ""}${rowsHtml(rows)}
        ${!reading ? `${label("From your practice")}${rowsHtml(PRACTICE)}` : `<div class="app-row" style="grid-template-columns:1fr auto;align-items:center"><span><span class="app-row__title">Snap to meaning</span><br><span class="app-caption">While you drag, things near the four directions or the centre settle onto them.</span></span><button type="button" class="app-chip" role="switch" aria-checked="${snap}" aria-label="Snap to meaning while arranging" data-snap>${snap ? "On" : "Off"}</button></div>`}`,
      onMount(body, dialog, close) {
        body.addEventListener("click", (event) => {
          const snapButton = event.target.closest("[data-snap]");
          if (snapButton) {
            const on = snapButton.getAttribute("aria-checked") !== "true";
            snapButton.setAttribute("aria-checked", String(on));
            snapButton.textContent = on ? "On" : "Off";
            changeOptions({ snapToMeaning: on });
            notice(on ? "Snap to meaning is on: drag things near a direction or the centre and they settle there." : "Snap to meaning is off.");
            return;
          }
          const row = event.target.closest("[data-more]");
          if (!row) return;
          close();
          fromMore(row.dataset.more);
        });
      }
    });
  }
  function fromMore(action) {
    const W = global.AltarWorkings;
    if (action === "jar") W?.openJar();
    else if (action === "sachet") W?.openSachet();
    else if (action === "spell") W?.openSpell(null);
    else if (action === "scry") W?.openScry();
    else if (action === "gratitude") W?.openGratitude();
    else if (action === "read") openAltarReading();
    else if (action === "intention") openIntention();
    else if (action === "layouts") openLayouts(B().selected());
    else if (action === "tonight") openTonight();
    else if (action === "ancestor") openAncestorShrine();
    else if (action === "stone") openStones();
    else if (action === "plant") openPlants();
    else if (action === "drawn") openDrawn();
    else if (action === "ritual") openRitualPicker();
  }

  // ── Reading the altar ───────────────────────────────────────────────────
  function openAltarReading() {
    const core = A();
    const objects = B().doc().objects;
    const intention = state.intention?.data?.text || "";
    const owned = (global.getApothecaryItems?.() || []).flatMap((a) => (a.ingredients || []).map((i) => i.label || i.name || "")).filter(Boolean);
    const reading = core.reading.readAltar({ objects, entries: B().library(), intention, cabinet: [], ownedNames: owned });
    const E = core.correspondence.ELEMENTS;
    const most = Math.max(1, ...E.map((e) => reading.elements[e]));
    const s = reading.suggestion;
    B().openSheet({
      eyebrow: "Reading the altar",
      title: B().altarId() ? B().altarName() : "This altar",
      html: `${reading.pieces ? `<div role="img" aria-label="${esc(`Elements: ${E.map((e) => `${e} ${reading.elements[e]}`).join(", ")}`)}" style="display:grid;gap:6px">${E.map((e) => `<div style="display:grid;grid-template-columns:52px 1fr 20px;gap:8px;align-items:center"><span class="app-caption">${e}</span><span style="height:8px;border-radius:4px;background:#1c2e22"><span style="display:block;height:8px;border-radius:4px;width:${(reading.elements[e] / most) * 100}%;background:${ELEMENT_COLORS[e]}"></span></span><span class="app-caption" style="text-align:right">${reading.elements[e]}</span></div>`).join("")}</div>` : ""}
        ${reading.sentences.map((line) => `<p>${esc(line)}</p>`).join("")}
        ${!intention && reading.pieces ? `<div class="app-row">${label("No intention set")}<p class="app-caption">Give the altar an intention and the reading will say how well it holds it.</p><button type="button" class="app-button app-button--outline" data-set-intention>Set an intention</button></div>` : ""}
        ${s?.cabinetItemId ? `<button type="button" class="app-button" data-place-suggestion>${esc(`Place ${s.name}`)}</button>` : ""}`,
      onMount(body, dialog, close) {
        body.querySelector("[data-set-intention]")?.addEventListener("click", () => { close(); openIntention(); });
        body.querySelector("[data-place-suggestion]")?.addEventListener("click", async () => {
          const item = core.cabinet.builtInCabinet.find((i) => i.id === s.cabinetItemId);
          const form = item?.forms.find((f) => f.label === s.formLabel) || item?.forms[0];
          if (!item || !form) return;
          await B().loadRatio(form.image);
          const object = core.cabinet.objectFromForm(item, form, B().doc().objects, nowIso(), {}, { cx: 0.5, cy: 0.62 });
          close();
          B().addSaved(object);
          notice(`${B().shortLabel(object.label)} is on the altar.`);
        });
      }
    });
  }

  function openIntention() {
    if (!B().altarId()) {
      notice("Save this altar first; its intention is kept with it.");
      global.saveAltar?.();
      return;
    }
    const core = A();
    const initial = state.intention?.data?.text || "";
    const supports = initial ? core.intention.scoreAltar(B().doc().objects, initial, B().library()) : [];
    B().openSheet({
      eyebrow: "This altar’s intention",
      title: initial || "What is this altar for?",
      html: `<label class="app-field"><span>The altar’s intention</span><input data-draft maxlength="${core.intention.INTENTION_MAX}" placeholder="In a few words" value="${esc(initial)}"></label>
        ${!initial ? B().chips(SUGGESTIONS.map((x) => ({ label: x, action: "suggest", data: { v: x } }))) : ""}
        <div class="app-chips" style="justify-content:flex-start"><button type="button" class="app-button" data-set disabled>${initial ? "Change it" : "Set it"}</button>${initial ? `<button type="button" class="app-button app-button--outline" data-clear>Clear</button>` : ""}</div>
        ${initial && supports.length ? `${label(`How the altar holds it · ${Math.round(core.intention.coherence(supports) * 100)}%`)}${supports.map((x) => `<div class="app-row"><span style="display:flex;justify-content:space-between;gap:8px"><span class="app-row__title">${esc(x.label)}</span><span class="app-caption" aria-label="Support ${Math.round(x.score * 100)} percent">${x.score >= 0.7 ? "Strong" : x.score > 0 ? "Some" : "Quiet"}</span></span><p class="app-caption">${esc(x.note)}</p></div>`).join("")}` : ""}`,
      onMount(body, dialog, close) {
        const input = body.querySelector("[data-draft]");
        const setButton = body.querySelector("[data-set]");
        const sync = () => { setButton.disabled = !input.value.trim() || input.value.trim() === initial; };
        input.addEventListener("input", sync);
        body.addEventListener("click", async (event) => {
          const b = event.target.closest("button");
          if (!b) return;
          if (b.dataset.appAction === "suggest") { input.value = b.dataset.v; sync(); return; }
          if (!b.hasAttribute("data-set") && !b.hasAttribute("data-clear")) return;
          const text = b.hasAttribute("data-clear") ? "" : input.value.replace(/\s+/g, " ").trim();
          try {
            if (!text) { if (state.intention) await global.SaltCraft.remove(INTENTIONS, state.intention.id); }
            else {
              const data = core.intention.intentionEntry(B().altarId(), text, nowIso());
              if (state.intention) await global.SaltCraft.update(INTENTIONS, state.intention.id, data);
              else await global.SaltCraft.add(INTENTIONS, data);
            }
          } catch { notice("Couldn’t keep the intention. Please try again."); }
          close();
          await loadAltarData();
          if (text) openIntention();
        });
      }
    });
  }

  // ── Layouts with meaning ────────────────────────────────────────────────
  function openLayouts(selectedObject = null) {
    const core = A();
    const doc = B().doc();
    const selectedSaved = selectedObject ? B().toSaved(selectedObject) : null;
    const wisdom = selectedSaved ? core.layouts.placementWisdom(selectedSaved, B().library()) : "";
    let kind = null;
    B().openSheet({
      eyebrow: "Layouts with meaning",
      title: "Arrange the altar",
      html: `${wisdom ? `<div class="app-row">${label(B().shortLabel(selectedSaved.label))}<p>${esc(wisdom)}</p></div>` : ""}<div data-kinds></div><div data-plan></div>`,
      onMount(body, dialog, close) {
        let plan = null;
        const draw = () => {
          body.querySelector("[data-kinds]").innerHTML = B().chips(core.layouts.LAYOUTS.map((l) => ({ label: l.title, action: "layout", pressed: kind === l.id, data: { id: l.id } })));
          plan = kind ? core.layouts.layoutPlan(kind, doc.objects, doc.background, B().library()) : null;
          body.querySelector("[data-plan]").innerHTML = plan
            ? `<p>${esc(plan.note)}</p>${plan.moves.length ? `${plan.moves.map((m) => `<p class="app-caption">${esc(`${m.role}: ${B().shortLabel(m.label)}`)}</p>`).join("")}<button type="button" class="app-button" data-apply>${esc(`Arrange as ${plan.title.toLowerCase()}`)}</button><p class="app-caption">Locked pieces and cloths stay where they are. Anything else without a place in it stays put too.</p>` : `<p class="app-caption">Nothing on the altar fits this layout yet.</p>`}`
            : `<p class="app-caption">Choose a layout to see where each piece would go.</p>`;
        };
        draw();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("button");
          if (!b) return;
          if (b.dataset.appAction === "layout") { kind = b.dataset.id; draw(); }
          else if (b.hasAttribute("data-apply") && plan) {
            const before = B().doc().objects;
            B().applyObjects(before, core.layouts.applyMoves(before, plan.moves));
            close();
            notice(`Arranged as ${plan.title.toLowerCase()}. Undo puts it back.`);
          }
        });
      }
    });
  }

  // Snap to meaning: near a direction or the centre, a dragged thing settles onto it.
  let guide = null;
  function stageFractions(object) {
    const stage = document.querySelector("[data-altar-stage]");
    const s = stage.getBoundingClientRect();
    const r = object.getBoundingClientRect();
    return { cx: (r.left + r.width / 2 - s.left) / s.width, cy: (r.top + r.height / 2 - s.top) / s.height, s };
  }
  function snapFor(object) {
    const core = A();
    if (!state.options?.snapToMeaning || !core) return null;
    const saved = B().toSaved(object);
    const box = core.geometry.displayBox(saved);
    const here = stageFractions(object);
    // displayBox gives the app's centre; nudge it by how far the object really moved.
    const delta = { x: here.cx - box.cx, y: here.cy - box.cy };
    const snap = core.arrange.snapToMeaning(saved, here.cx, here.cy, B().doc().background);
    return snap ? { snap, saved, delta, stage: here.s } : null;
  }
  function showGuide(found) {
    const stage = document.querySelector("[data-altar-stage]");
    if (!found) { guide?.remove(); guide = null; return; }
    if (!guide) {
      guide = document.createElement("div");
      guide.className = "altar-snap-guide";
      guide.setAttribute("aria-hidden", "true");
      stage.appendChild(guide);
    }
    const { snap, stage: s } = found;
    const r = Math.max(10, 18 * (s.width / 900));
    const x = snap.cx * s.width;
    const y = snap.cy * s.height;
    guide.style.left = `${x - r * 1.6}px`;
    guide.style.top = `${y - r * 0.55}px`;
    guide.innerHTML = `<svg width="${r * 3.2}" height="${r * 1.1}" style="overflow:visible"><ellipse cx="${r * 1.6}" cy="${r * 0.55}" rx="${r * 1.6}" ry="${r * 0.55}" stroke="#e2c36d" stroke-opacity="0.85" stroke-width="1.5" stroke-dasharray="4 4" fill="rgba(226,195,109,0.08)"/><circle cx="${r * 1.6}" cy="${r * 0.55}" r="2" fill="#e2c36d"/></svg><span style="top:${r * 1.25}px">${esc(snap.role)}</span>`;
  }
  document.addEventListener("pointermove", () => {
    const dragging = document.querySelector(".altar-object.is-dragging");
    if (!dragging || !state.options?.snapToMeaning) return;
    showGuide(snapFor(dragging));
  }, { passive: true });
  document.addEventListener("pointerup", () => {
    const dragging = document.querySelector(".altar-object.is-dragging") || (guide ? B()?.selected() : null);
    const found = dragging ? snapFor(dragging) : null;
    showGuide(null);
    if (!found) return;
    requestAnimationFrame(() => {
      const core = A();
      const { snap } = found;
      B().update(dragging, (o) => core.geometry.withCenter ? core.editor.moveObject({ ...B().doc(), objects: [o] }, 0, snap.cx, snap.cy).objects[0] : o, { undo: false });
      const [place, partner] = snap.role.split(" · ");
      notice(`Set in the ${place.toLowerCase()}${partner ? `, with ${partner}` : ""}.`);
    });
  });

  // ── Tonight's altar and shrines ─────────────────────────────────────────
  async function openTonightAltar() {
    const core = A();
    const night = new Date();
    let choice = null;
    try { choice = core.holidays.holidayChoice(await global.SaltSettings?.get?.()); } catch { choice = null; }
    const altar = core.tonight.tonightAltar(night, core.holidays.holidaysToday(night, choice), core.moon.moonState(night).name);
    await prepareRatios(altar);
    const fresh = core.tonight.tonightAltar(night, core.holidays.holidaysToday(night, choice), core.moon.moonState(night).name);
    B().setDocument(fresh.doc, "Tonight’s Altar");
    state.tonight = { altar: fresh, date: night };
    global.AltarLiving?.setTonight(state.tonight);
    global.currentSavedAltarName = "Tonight’s Altar";
    notice(`Set for ${fresh.reason}. Move, swap or add anything, then Save to keep it.`);
    renderTools();
  }
  /** Know each picture's shape first, so things stand where they should. */
  async function prepareRatios(altar) {
    const paths = [altar.doc.background, ...altar.doc.objects.map((o) => o.imagePath)].filter(Boolean);
    await Promise.all(paths.map((p) => B().loadRatio(p)));
  }
  function openTonight() {
    const core = A();
    if (!state.tonight) return;
    const objects = B().doc().objects;
    const tonight = { ...state.tonight.altar, doc: { ...state.tonight.altar.doc, objects } };
    const pieces = core.tonightExplained.explainTonight(tonight, state.tonight.date, B().library());
    let open = null;
    const reason = tonight.reason.charAt(0).toUpperCase() + tonight.reason.slice(1);
    const sheet = B().openSheet({ eyebrow: "Tonight’s altar", title: reason, html: "" });
    const draw = () => {
      const current = B().doc().objects;
      sheet.setBody(pieces.map((piece) => {
        const object = current[piece.index];
        if (!object) return "";
        const swaps = open === piece.index ? core.tonightExplained.swapsFor(object, { entries: B().library(), cabinet: [], others: current, now: nowIso() }) : [];
        sheet.body._swaps = open === piece.index ? swaps : sheet.body._swaps;
        return `<div class="app-row"><p>${esc(piece.why)}</p>${B().chips([{ label: open === piece.index ? "Hide swaps" : "Swap", symbol: "⇄", action: "swaps", data: { i: piece.index }, hint: `Swaps for ${piece.label}` }])}
          ${open === piece.index ? (swaps.length ? swaps.map((s, k) => `<p class="app-caption">${esc(s.why)}</p>${B().chips([{ label: `Use ${s.label}`, symbol: s.owned ? "★" : "", action: "use", data: { i: piece.index, k } }])}`).join("") : `<p class="app-caption">Nothing in the cabinet shares its correspondence closely enough.</p>`) : ""}</div>`;
      }).join(""));
    };
    sheet.body.addEventListener("click", async (event) => {
      const b = event.target.closest("[data-app-action]");
      if (!b) return;
      const i = Number(b.dataset.i);
      if (b.dataset.appAction === "swaps") { open = open === i ? null : i; draw(); }
      if (b.dataset.appAction === "use") {
        const swap = sheet.body._swaps[Number(b.dataset.k)];
        const el = B().objects()[i];
        await B().loadRatio(swap.object.imagePath);
        if (el) B().update(el, () => swap.object);
        open = null;
        notice(`${B().shortLabel(swap.object.label)} stands in its place.`);
        draw();
      }
    });
    draw();
  }

  // ── The sky (AltarStage SkyLayer) ───────────────────────────────────────
  let skyEl = null;
  function renderSky() {
    const core = A();
    const stage = document.querySelector("[data-altar-stage]");
    if (!core || !stage || !state.options) return;
    const { sky, moonWindow } = state.options;
    if (!sky && !moonWindow) { skyEl?.remove(); skyEl = null; return; }
    if (!skyEl) {
      skyEl = document.createElement("div");
      skyEl.className = "altar-sky";
      skyEl.setAttribute("aria-hidden", "true");
      stage.insertBefore(skyEl, stage.firstChild?.nextSibling || null);
    }
    const at = new Date();
    const here = B().place();
    const ambient = core.ambient.ambientAt(at, here);
    const mirrored = core.ambient.moonMirrored(here);
    const moon = core.moon.moonState(at);
    const size = Math.max(28, Math.min(64, stage.clientWidth * 0.075));
    const r = size * 0.36;
    const lit = core.shareCard.moonPath(size / 2, size / 2, r, moon.illumination, moon.waxing);
    skyEl.innerHTML = `${sky && ambient.tint.opacity > 0 ? `<div class="altar-sky__tint" style="background:${ambient.tint.color};opacity:${ambient.tint.opacity}"></div>` : ""}
      ${sky && ambient.accent.opacity > 0 ? `<div class="altar-sky__season" style="background:linear-gradient(to bottom, transparent 62%, ${ambient.accent.color})" data-opacity="${ambient.accent.opacity}"></div>` : ""}
      ${moonWindow ? `<div class="altar-sky__moon" title="${esc(`A ${moon.name.toLowerCase()} in the window`)}" style="width:${size}px;height:${size}px;top:4%;right:2.5%"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"${mirrored ? ' style="transform:scaleX(-1)"' : ""}><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="#1c2e22"/>${lit ? `<path d="${lit}" fill="#f4ecd8"/>` : ""}</svg></div>` : ""}`;
    const season = skyEl.querySelector(".altar-sky__season");
    if (season) season.style.opacity = String(Math.min(1, Number(season.dataset.opacity) * 2.4));
    skyEl.title = [sky ? ambient.label : "", moonWindow ? `a ${moon.name.toLowerCase()} in the window` : ""].filter(Boolean).join("; ");
  }
  // The sky looks again around your sunrise and sunset (ambient nextAmbientCheck), at least once a minute.
  let skyTimer = 0;
  function watchSky() {
    clearTimeout(skyTimer);
    const core = A();
    const wait = core ? Math.min(60000, core.ambient.nextAmbientCheck(new Date(), B().place())) : 60000;
    skyTimer = setTimeout(() => { if (!document.hidden) renderSky(); watchSky(); }, Math.max(15000, wait));
  }
  function openOptions() {
    const options = state.options || A().altarOptions.defaultAltarOptions("");
    const row = (key, title, detail) => `<div class="app-row" style="grid-template-columns:1fr auto;align-items:center"><span><span class="app-row__title">${esc(title)}</span><br><span class="app-caption">${esc(detail)}</span></span><button type="button" class="app-chip" role="switch" aria-checked="${!!options[key]}" aria-label="${esc(title)}" data-option="${key}">${options[key] ? "On" : "Off"}</button></div>`;
    B().openSheet({
      eyebrow: "This altar",
      title: "Sky and season",
      html: `${B().place()
          ? row("sky", "The real sky", "The light follows your sunrise, sunset and dusk, with a faint touch of the season.")
          : `${row("sky", "The real sky", "The light follows the time of day and the season. Add your place in Sky for your real sunrise and sunset.")}<p class="app-caption"><a href="/today/sky/">Add your place</a> (kept only in this browser).</p>`}
        ${row("moonWindow", "Tonight’s moon", "A small window showing the moon’s real phase.")}
        ${row("newMoonCharging", "Charge under the New Moon too", "Crystals and moon water sitting here through a Full Moon are charged under it. Turn this on to count New Moons as well.")}
        ${B().altarId() ? "" : `<p class="app-caption">Save this altar to keep these choices with it.</p>`}`,
      onMount(body) {
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-option]");
          if (!b) return;
          const on = b.getAttribute("aria-checked") !== "true";
          b.setAttribute("aria-checked", String(on));
          b.textContent = on ? "On" : "Off";
          changeOptions({ [b.dataset.option]: on });
        });
      }
    });
  }

  // Crystals and moon water that sat through a Full (or New) Moon while the altar was closed are charged under it.
  function settleMoons() {
    const core = A();
    if (!core) return;
    const at = nowIso();
    B().objects().forEach((el) => {
      const before = B().toSaved(el);
      const after = core.moonCharge.chargeUnderMoons(before, at, { newMoon: !!state.options?.newMoonCharging });
      if (after !== before) B().apply(el, after, before, { quiet: true });
    });
  }

  // ── History ─────────────────────────────────────────────────────────────
  function sceneSvg(scene, width, labelText) {
    const height = (width * scene.height) / scene.width;
    const tf = (i) => [i.rotation ? `rotate(${i.rotation} ${i.cx} ${i.cy})` : "", i.flipped ? `translate(${2 * i.cx} 0) scale(-1 1)` : ""].join(" ").trim();
    const src = (p) => (/^(https?:|\/|\.\.\/)/.test(p) ? p : `../${p}`);
    return `<svg role="img" aria-label="${esc(labelText)}" width="${width}" height="${height}" viewBox="0 0 ${scene.width} ${scene.height}" style="display:block;max-width:100%;height:auto;border-radius:10px">
      <defs><radialGradient id="ac-pool"><stop offset="0" stop-color="#ffc76b" stop-opacity="0.42"/><stop offset="0.5" stop-color="#ff9f40" stop-opacity="0.14"/><stop offset="1" stop-color="#ff9f40" stop-opacity="0"/></radialGradient></defs>
      <rect width="${scene.width}" height="${scene.height}" fill="#070a08"/>
      ${scene.background.path ? `<image href="${esc(src(scene.background.path))}" x="${scene.background.rect.x}" y="${scene.background.rect.y}" width="${scene.background.rect.w}" height="${scene.background.rect.h}" preserveAspectRatio="xMidYMid slice"/>` : ""}
      ${scene.pools.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="url(#ac-pool)"/>`).join("")}
      ${scene.items.map((i) => `<g transform="${tf(i)}" opacity="${i.opacity}">${i.path ? `<image href="${esc(src(i.path))}" x="${i.rect.x}" y="${i.rect.y}" width="${i.rect.w}" height="${i.rect.h}" preserveAspectRatio="xMidYMid meet"/>` : i.symbol ? `<text x="${i.cx}" y="${i.cy + i.rect.h * 0.18}" font-size="${i.rect.w * 0.49}" text-anchor="middle" fill="#f4ecd8">${esc(i.symbol)}</text>` : ""}</g>`).join("")}
    </svg>`;
  }
  async function keepSnapshot() {
    const core = A();
    const id = B().altarId();
    if (!core || !id) return;
    const entries = await list(HISTORY);
    const doc = B().doc();
    const due = core.history.snapshotDue(entries, { id, name: B().altarName(), background: doc.background, objects: doc.objects }, new Date());
    if (!due) return;
    try {
      for (const old of core.history.snapshotsToPrune(entries, id, new Date())) await global.SaltCraft.remove(HISTORY, old);
      await global.SaltCraft.add(HISTORY, due);
    } catch { /* the picture waits for the next save */ }
  }
  async function openHistory() {
    const core = A();
    const id = B().altarId();
    if (!id) {
      B().openSheet({ eyebrow: "This altar", title: "Its history", html: `<p>Save this altar first; its history is kept with it.</p>` });
      return;
    }
    const entries = await list(HISTORY);
    const now = new Date();
    const items = core.history.timeline(entries, id);
    const backs = core.history.availableLookBacks(entries, id, now);
    let chosen = null;
    let all = false;
    const when = (at) => new Date(at).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: now.getFullYear() === new Date(at).getFullYear() ? undefined : "numeric" });
    const sheet = B().openSheet({ eyebrow: B().altarName(), title: "Its history", html: "" });
    const draw = () => {
      if (!items.length) return sheet.setBody(`<p>Nothing yet. From today, a picture of the altar is kept each day it changes, with what happens on it.</p>`);
      const picked = items.find((i) => i.id === chosen && i.kind === "snapshot");
      const shown = all ? items : items.slice(0, 30);
      sheet.setBody(`${backs.length ? `${label("Look back")}${B().chips(backs.map((b) => ({ label: b.label, action: "pick", pressed: chosen === b.entry.id, data: { id: b.entry.id } })))}` : ""}
        ${picked ? `<div>${sceneSvg(core.shareCard.composeScene(core.history.snapshotObjects(picked.snapshot), picked.snapshot.background, { width: 320, height: 180, zoom: 1.2 }), 460, `The altar on ${when(picked.at)}: ${picked.snapshot.summary}`)}<p class="app-caption">${esc(`${when(picked.at)} · ${picked.snapshot.summary}`)}</p></div>` : ""}
        ${label("Timeline")}
        ${shown.map((item) => item.kind === "snapshot"
          ? `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" data-app-action="pick" data-id="${esc(item.id)}" aria-pressed="${chosen === item.id}"><span class="app-row__title">${esc(`How it looked · ${when(item.at)}`)}</span><span class="app-caption">${esc(item.text)}</span></button>`
          : `<div><p>${esc(item.text)}</p><p class="app-caption">${esc(`${when(item.at)}, ${new Date(item.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`)}</p></div>`).join("")}
        ${items.length > 30 ? B().chips([{ label: all ? "Show less" : `Show all ${items.length}`, action: "all" }]) : ""}`);
    };
    sheet.body.addEventListener("click", (event) => {
      const b = event.target.closest("[data-app-action]");
      if (!b) return;
      if (b.dataset.appAction === "pick") chosen = chosen === b.dataset.id ? null : b.dataset.id;
      if (b.dataset.appAction === "all") all = !all;
      draw();
    });
    draw();
  }

  // ── Share card ──────────────────────────────────────────────────────────
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
  async function drawCard(card, canvas) {
    const core = A();
    const ctx = canvas.getContext("2d");
    canvas.width = card.width;
    canvas.height = card.height;
    const src = (p) => (/^(https?:|\/|\.\.\/)/.test(p) ? p : `../${p}`);
    ctx.fillStyle = "#070a08";
    ctx.fillRect(0, 0, card.width, card.height);
    const bg = card.background.path ? await loadImage(src(card.background.path)) : null;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, card.width, card.sceneHeight);
    ctx.clip();
    if (bg) {
      const r = card.background.rect;
      const scale = Math.max(r.w / bg.naturalWidth, r.h / bg.naturalHeight);
      const w = bg.naturalWidth * scale;
      const h = bg.naturalHeight * scale;
      ctx.drawImage(bg, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
    }
    card.pools.forEach((p) => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      g.addColorStop(0, "rgba(255,199,107,0.42)");
      g.addColorStop(0.5, "rgba(255,159,64,0.14)");
      g.addColorStop(1, "rgba(255,159,64,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    for (const item of card.items) {
      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.translate(item.cx, item.cy);
      if (item.rotation) ctx.rotate((item.rotation * Math.PI) / 180);
      if (item.flipped) ctx.scale(-1, 1);
      ctx.translate(-item.cx, -item.cy);
      if (item.path) {
        const img = await loadImage(src(item.path));
        if (img) {
          const s = Math.min(item.rect.w / img.naturalWidth, item.rect.h / img.naturalHeight);
          const w = img.naturalWidth * s;
          const h = img.naturalHeight * s;
          ctx.drawImage(img, item.rect.x + (item.rect.w - w) / 2, item.rect.y + (item.rect.h - h) / 2, w, h);
        }
      } else if (item.symbol) {
        ctx.fillStyle = "#f4ecd8";
        ctx.font = `${item.rect.w * 0.49}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(item.symbol, item.cx, item.cy + item.rect.h * 0.18);
      }
      if (item.halo) {
        const h = item.halo;
        const g = ctx.createRadialGradient(h.x + h.w / 2, h.y + h.h / 2, 0, h.x + h.w / 2, h.y + h.h / 2, h.w / 2);
        g.addColorStop(0, "rgba(255,227,160,0.55)");
        g.addColorStop(1, "rgba(255,178,74,0)");
        ctx.fillStyle = g;
        ctx.fillRect(h.x, h.y, h.w, h.h);
      }
      if (item.flame) {
        const f = item.flame;
        const cx = f.x + f.w / 2;
        const bottom = f.y + f.h;
        const g = ctx.createRadialGradient(cx, f.y + f.h * 0.65, 0, cx, f.y + f.h * 0.65, f.h * 0.55);
        g.addColorStop(0, "rgba(255,246,214,1)");
        g.addColorStop(0.45, "rgba(255,211,107,0.95)");
        g.addColorStop(1, "rgba(255,138,42,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, f.y);
        ctx.bezierCurveTo(cx + f.w * 0.55, f.y + f.h * 0.45, cx + f.w * 0.5, bottom, cx, bottom);
        ctx.bezierCurveTo(cx - f.w * 0.5, bottom, cx - f.w * 0.55, f.y + f.h * 0.45, cx, f.y);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
    // The words beneath.
    const y = card.panelY;
    const scrim = ctx.createLinearGradient(0, y - 160, 0, y);
    scrim.addColorStop(0, "rgba(7,10,8,0)");
    scrim.addColorStop(1, "rgba(7,10,8,0.85)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, y - 160, card.width, 160);
    ctx.fillStyle = "#070a08";
    ctx.fillRect(0, y, card.width, card.height - y);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#e2c36d";
    ctx.fillRect(0, y, card.width, 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f4ecd8";
    ctx.font = "600 76px 'Cormorant Garamond', Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText(card.name.length > 26 ? `${card.name.slice(0, 25)}…` : card.name, 72, y + 110);
    ctx.fillStyle = "#cabf9d";
    ctx.font = "34px 'Source Serif 4', Georgia, serif";
    ctx.fillText(card.line, 72, y + 178);
    ctx.fillStyle = "#1c2e22";
    ctx.beginPath();
    ctx.arc(card.width - 120, y + 132, 46, 0, Math.PI * 2);
    ctx.fill();
    const path = core.shareCard.moonPath(card.width - 120, y + 132, 46, card.moon.illumination, card.moon.waxing);
    if (path) { ctx.fillStyle = "#f4ecd8"; ctx.fill(new Path2D(path)); }
    ctx.fillStyle = "#b9a05d";
    ctx.font = "24px 'Source Serif 4', Georgia, serif";
    if ("letterSpacing" in ctx) ctx.letterSpacing = "4px";
    ctx.fillText("SALT & SOVEREIGNTY", 72, card.height - 44);
  }
  async function openShare() {
    const core = A();
    const doc = B().doc();
    await Promise.all([doc.background, ...doc.objects.map((o) => o.imagePath)].filter(Boolean).map((p) => B().loadRatio(p)));
    const at = new Date();
    const card = core.shareCard.composeShareCard({ name: B().altarId() ? B().altarName() : (global.currentSavedAltarName || "My altar"), objects: doc.objects, background: doc.background, at });
    B().openSheet({
      eyebrow: "Share",
      title: "A picture of your altar",
      html: `<canvas class="app-share-preview" role="img" aria-label="${esc(`${card.name}, ${card.line}`)}"></canvas>
        <p class="app-caption">The picture is made in your browser and stays private until you choose where to send it. Nothing is uploaded.</p>
        <button type="button" class="app-button" data-download disabled>Making the picture…</button><p class="app-caption" data-share-state aria-live="polite"></p>`,
      async onMount(body) {
        const canvas = body.querySelector("canvas");
        const button = body.querySelector("[data-download]");
        try {
          await drawCard(card, canvas);
          button.disabled = false;
          button.textContent = "Download the picture";
        } catch {
          body.querySelector("[data-share-state]").textContent = "The picture couldn’t be made. Please try again, or take a screenshot of the card.";
        }
        button.addEventListener("click", () => {
          try {
            canvas.toBlob((blob) => {
              if (!blob) throw new Error("no picture");
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = core.shareCard.cardFileName(card.name, at);
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => URL.revokeObjectURL(url), 2000);
              body.querySelector("[data-share-state]").textContent = "Downloaded. If a picture of your own didn’t come through, take a screenshot of the card instead.";
            }, "image/png");
          } catch {
            body.querySelector("[data-share-state]").textContent = "The picture couldn’t be made. Please try again, or take a screenshot of the card.";
          }
        });
      }
    });
  }

  // ── From your practice ──────────────────────────────────────────────────
  async function loadPractice() {
    const core = A();
    if (!core) return;
    const [ancestors, stones, settings, plants, readings] = await Promise.all([
      list(core.ancestors.ANCESTORS), list(core.stoneCollections.STONES), list(core.stoneCollections.SETTINGS), list(core.garden.PLANTS), list(core.readings.READINGS)
    ]);
    state.practice = { ancestors, stones, settings, plants, readings };
  }
  const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  /** "2026-10-16" is a day where you are, not midnight in London. */
  const dayOf = (value) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "")); return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : value; };
  function placeFromPractice(object) {
    B().loadRatio(object.imagePath).finally(() => {
      B().addSaved(object);
      notice(`${B().shortLabel(object.label, "It")} is on your altar.`);
    });
  }
  async function openAncestorShrine() {
    await loadPractice();
    const core = A();
    const C = core.ancestor;
    const choices = C.shrineChoices(state.practice.ancestors, B().doc().objects);
    let chosen = null;
    let color = "white";
    let form = "tea-light";
    const sheet = B().openSheet({ eyebrow: "Ancestor shrine", title: "A candle for one of your dead", html: "" });
    const draw = () => {
      if (!choices.length) return sheet.setBody(`<p>Add the people you remember in Hedge → Ancestors, with their days and what they loved. Then you can set a candle for them here.</p><a class="app-button app-button--outline" href="${PAGES.ancestors}">Open Ancestors</a>`);
      const picked = choices.find((c) => c.entry.id === chosen)?.entry || null;
      sheet.setBody(`${label("Who")}<div class="app-rows">${choices.map(({ entry, placed }) => { const a = core.ancestors.normalizeAncestor(entry.data); const detail = [a.relation, placed ? "already on this altar" : ""].filter(Boolean).join(" · "); return `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" aria-pressed="${chosen === entry.id}" data-who="${esc(entry.id)}"><span class="app-row__title">${esc(a.name || "Unnamed")}</span>${detail ? `<span class="app-caption">${esc(detail)}</span>` : ""}</button>`; }).join("")}</div>
        ${picked ? `${label("The candle")}${B().chips(C.MEMORIAL_FORMS.map((f) => ({ label: f.label, action: "form", pressed: form === f.form, data: { v: f.form }, hint: `${f.label}. ${f.hint}` })))}<p class="app-caption">${esc(C.MEMORIAL_FORMS.find((f) => f.form === form)?.hint)}</p>
          ${label("Its colour")}${B().chips(C.MEMORIAL_COLORS.map((c) => ({ label: capital(c), action: "color", pressed: color === c, data: { v: c } })))}<p class="app-caption">White suits anyone; or choose a colour they loved.</p>
          <button type="button" class="app-button" data-set>${esc(`Set a candle for ${core.ancestors.normalizeAncestor(picked.data).name || "them"}`)}</button>` : ""}`);
    };
    sheet.body.addEventListener("click", (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      if (b.dataset.who) chosen = b.dataset.who;
      else if (b.dataset.appAction === "form") form = b.dataset.v;
      else if (b.dataset.appAction === "color") color = b.dataset.v;
      else if (b.hasAttribute("data-set")) {
        const picked = choices.find((c) => c.entry.id === chosen)?.entry;
        if (!picked) return;
        sheet.close();
        placeFromPractice(C.memorialObject(picked, B().doc().objects, nowIso(), { color, form }));
        return;
      } else return;
      draw();
    });
    draw();
  }
  async function openStones() {
    await loadPractice();
    const core = A();
    const rule = core.stones.normaliseRule(state.practice.settings[0]?.data?.cleanse);
    const objects = B().doc().objects;
    const entries = state.practice.stones;
    B().openSheet({
      eyebrow: "From your stones",
      title: "Set a stone on the altar",
      html: entries.length ? `<div class="app-rows">${entries.map((entry, i) => { const stone = core.stones.normaliseStone(entry.data); const status = core.practice.stonePanel(stone, rule, new Date()); const here = objects.some((o) => core.practice.stoneIdOf(o) === entry.id); return `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" data-i="${i}"><span class="app-row__title">${esc(stone.name)}</span><span class="app-caption">${esc([status.status, here ? "already on this altar" : ""].filter(Boolean).join(" · "))}</span></button>`; }).join("")}</div>`
        : `<p>Your stones live in Crystal → My stones, with when each was last cleansed. Add one there and it can sit on your altar.</p><a class="app-button app-button--outline" href="${PAGES.stones}">Open My stones</a>`,
      onMount(body, dialog, close) {
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-i]");
          if (!b) return;
          close();
          placeFromPractice(core.practice.stoneObject(entries[Number(b.dataset.i)], B().doc().objects, nowIso()));
        });
      }
    });
  }
  async function openPlants() {
    await loadPractice();
    const core = A();
    const entries = core.practice.plantChoices(state.practice.plants);
    let form = "sprig";
    B().openSheet({
      eyebrow: "From your garden",
      title: "Bring a plant to the altar",
      html: entries.length ? `<div data-forms></div><div class="app-rows">${entries.map((entry, i) => { const p = core.practice.plantPanel(core.garden.asPlant(entry.data)); const detail = [p.herb, p.place, p.growing ? "" : "gone"].filter(Boolean).join(" · "); return `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" data-i="${i}"><span class="app-row__title">${esc(p.name)}</span>${detail ? `<span class="app-caption">${esc(detail)}</span>` : ""}</button>`; }).join("")}</div>`
        : `<p>Your plants live in Green → My garden. Add what you grow there and you can bring a sprig of it here.</p><a class="app-button app-button--outline" href="${PAGES.garden}">Open My garden</a>`,
      onMount(body, dialog, close) {
        const forms = body.querySelector("[data-forms]");
        const draw = () => { if (forms) forms.innerHTML = B().chips([{ label: "A fresh sprig", action: "form", pressed: form === "sprig", data: { v: "sprig" } }, { label: "Dried, loose", action: "form", pressed: form === "loose", data: { v: "loose" } }]); };
        draw();
        body.addEventListener("click", (event) => {
          const f = event.target.closest('[data-app-action="form"]');
          if (f) { form = f.dataset.v; draw(); return; }
          const b = event.target.closest("[data-i]");
          if (!b) return;
          close();
          placeFromPractice(core.practice.plantObject(entries[Number(b.dataset.i)], B().doc().objects, nowIso(), form));
        });
      }
    });
  }
  async function openDrawn() {
    await loadPractice();
    const core = A();
    const R = core.readings;
    const entries = state.practice.readings;
    const now = new Date();
    const tonight = core.practice.tonightsReading(entries, now);
    const earlier = R.sortReadings(entries.map((e) => ({ ...e, data: R.normalizeReading(e.data) }))).filter((e) => e.id !== tonight?.id && e.data.drawn.length).slice(0, 8);
    const t = tonight ? R.normalizeReading(tonight.data) : null;
    const choices = [];
    B().openSheet({
      eyebrow: "From your readings",
      title: "Tonight’s card or rune",
      html: !t ? `<p>Draw a card or a rune and keep it in Hedge → Readings; then it can sit on your altar while you sit with it.</p><a class="app-button app-button--outline" href="${PAGES.readings}">Open Readings</a>`
        : `${label(`${R.methodLabel(t.method)} · ${B().dateShort(dayOf(t.date), { day: "numeric", month: "long", year: "numeric" }) || t.date}`)}${t.question ? `<p class="app-living__glance">${esc(t.question)}</p>` : ""}
          ${B().chips(t.drawn.map((name) => { choices.push([tonight, name]); return { label: name, symbol: "✦", action: "place", data: { i: choices.length - 1 }, hint: `Set ${name} on the altar` }; }))}
          ${earlier.length ? `${label("Earlier readings")}<div class="app-rows">${earlier.map((e) => { choices.push([e, e.data.drawn[0]]); return `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" data-app-action="place" data-i="${choices.length - 1}"><span class="app-row__title">${esc(e.data.drawn.join(", "))}</span><span class="app-caption">${esc([R.methodLabel(e.data.method), B().dateShort(dayOf(e.data.date), { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · "))}</span></button>`; }).join("")}</div>` : ""}`,
      onMount(body, dialog, close) {
        body.addEventListener("click", (event) => {
          const b = event.target.closest('[data-app-action="place"]');
          if (!b) return;
          const [entry, drawn] = choices[Number(b.dataset.i)];
          close();
          placeFromPractice(core.practice.readingObject(entry, drawn, B().doc().objects, nowIso()));
        });
      }
    });
  }
  // Each thing's own page on the site (the app's "Its page in Crystal", "Their page", …).
  const PAGES = {
    stones: "/practice/crystal/stones/",
    stone: (id) => `/practice/crystal/stone/?id=${encodeURIComponent(id)}`,
    garden: "/practice/green/garden/",
    plant: (id) => `/practice/green/plant/?id=${encodeURIComponent(id)}`,
    ancestors: "/practice/hedge/ancestors/",
    ancestor: (id) => `/practice/hedge/ancestors/person/?id=${encodeURIComponent(id)}`,
    readings: "/divination/",
    reading: (id) => `/divination/reading/?id=${encodeURIComponent(id)}`,
    grimoirePage: (id) => `/grimoire/?page=${encodeURIComponent(id)}`
  };
  const careSaved = new Map(); // stone id → "Added to its cleansing log in Crystal."

  /** The selected object's ties to your practice, for the living panel. */
  function practiceHtml(saved) {
    const core = A();
    if (!core) return "";
    const out = [];
    const block = (title, body) => `<div class="app-block"><p class="app-living__eyebrow">${esc(title)}</p>${body}</div>`;
    const cap = (t) => (t ? `<p class="app-caption">${esc(t)}</p>` : "");
    const link = core.ancestor.ancestorOf(saved);
    if (link) {
      const entry = state.practice.ancestors.find((e) => e.id === link.id);
      const panel = entry ? core.ancestor.ancestorPanel(entry, new Date()) : null;
      if (!panel) out.push(block("In memory", cap(`A candle for ${link.name || "one remembered"}. Their page in Ancestors isn’t here, or it has been removed.`)));
      else {
        const lit = core.livingState.isLit(saved);
        out.push(block("In memory", `<p>${esc([panel.name, panel.relation].filter(Boolean).join(", "))}</p>${cap([panel.born && `Born ${panel.born}`, panel.died && `died ${panel.died}`].filter(Boolean).join(", "))}${panel.today ? `<p>${esc(`Today: ${panel.today.words.toLowerCase()}.`)}</p>` : ""}${panel.days.filter((d) => d.inDays > 0).map((d) => cap(`${d.when}: ${d.words.charAt(0).toLowerCase()}${d.words.slice(1)}`)).join("")}${panel.loved ? `<p>${esc(`They loved ${panel.loved}.`)}</p>` : ""}${panel.memory ? `<p class="app-living__glance">${esc(panel.memory)}</p>` : ""}${B().chips([
          { label: lit ? "Their candle is lit" : "Light a candle for them", symbol: "🜂", action: "light", disabled: lit },
          { label: "Begin the candle rite", symbol: "❦", action: "ancestor-rite", data: { id: entry.id }, hint: `Begin the candle rite for ${panel.name || "them"} on this altar` },
          { label: "Their page", href: PAGES.ancestor(entry.id), hint: `${panel.name || "Their"} page in Ancestors` }
        ])}`));
      }
    }
    const stoneId = core.practice.stoneIdOf(saved);
    if (stoneId) {
      const entry = state.practice.stones.find((e) => e.id === stoneId);
      if (!entry) out.push(block("One of your stones", cap("This stone isn’t in My stones any more.") + B().chips([{ label: "My stones", href: PAGES.stones }])));
      else {
        const stone = core.stones.normaliseStone(entry.data);
        const panel = core.practice.stonePanel(stone, core.stones.normaliseRule(state.practice.settings[0]?.data?.cleanse), new Date());
        // The newest cleansing or charge done here, offered to the stone's own log in Crystal.
        const care = core.altarCare.lastAltarCareOf(saved);
        const logged = !!care && stone.care.some((c) => c.kind === care.kind && c.at === care.at);
        const warnings = care ? core.practice.careWarnings(stone, care.methods) : [];
        const done = careSaved.get(entry.id);
        out.push(block("One of your stones", `<p${panel.due ? ' style="color:var(--gold)"' : ""}>${esc(panel.status)}</p>${cap(panel.badges.join(" · "))}${panel.intentions.length ? cap(`Held for ${panel.intentions.join(", ")}`) : ""}${core.practice.recentCare(stone, 2).map((c) => cap(`${c.kind === "cleansed" ? "Cleansed" : c.kind === "charged" ? "Charged" : "Programmed"} ${B().dateShort(c.at, { day: "numeric", month: "long", year: "numeric" })}${c.method ? ` · ${c.method}` : ""}`)).join("")}${warnings.map((w) => `<p class="app-problem">${esc(w)}</p>`).join("")}${B().chips([
          care && !logged && !done ? { label: care.kind === "cleansed" ? "Add this cleansing to its log" : "Add this charge to its log", symbol: "✓", action: "stone-log", data: { id: entry.id } } : null,
          { label: "Its page in Crystal", href: PAGES.stone(entry.id) }
        ])}${done ? cap(done) : ""}`));
      }
    }
    const plantId = core.practice.plantIdOf(saved);
    if (plantId) {
      const entry = state.practice.plants.find((e) => e.id === plantId);
      if (!entry) out.push(block("From your garden", cap("This plant isn’t in My garden any more.") + B().chips([{ label: "My garden", href: PAGES.garden }])));
      else { const p = core.practice.plantPanel(core.garden.asPlant(entry.data)); out.push(block("From your garden", `<p>${esc(p.name)}</p>${cap([p.place, p.last].filter(Boolean).join(" · "))}${B().chips([{ label: "Its page in Green", href: PAGES.plant(entry.id) }])}`)); }
    }
    const readingId = core.practice.readingIdOf(saved);
    if (readingId) {
      const entry = state.practice.readings.find((e) => e.id === readingId);
      if (!entry) out.push(block("From a reading", cap(`${core.practice.drawnOf(saved) || "This card"}: its reading isn’t here any more.`) + B().chips([{ label: "Readings", href: PAGES.readings }])));
      else { const p = core.practice.readingPanel(entry.data, core.practice.drawnOf(saved)); out.push(block("From a reading", `<p>${esc(p.title)}</p>${cap([p.method, B().dateShort(dayOf(p.date), { day: "numeric", month: "long", year: "numeric" })].filter(Boolean).join(" · "))}${p.question ? `<p class="app-living__glance">${esc(p.question)}</p>` : ""}${cap(p.meaning)}${B().chips([{ label: "The reading", href: PAGES.reading(entry.id) }])}`)); }
    }
    return out.join("");
  }

  /** Add the cleansing or charge done here to the stone's own log in Crystal (StonePanelSection addToLog). */
  async function logStoneCare(object, stoneId) {
    const core = A();
    const entry = state.practice.stones.find((e) => e.id === stoneId);
    const care = object ? core.altarCare.lastAltarCareOf(B().toSaved(object)) : null;
    if (!entry || !care || !global.SaltCraft) return;
    try {
      const next = core.practice.stoneCareFromAltar(core.stones.normaliseStone(entry.data), { ...care, altarName: B().altarName() });
      await global.SaltCraft.update(core.stoneCollections.STONES, entry.id, next);
      entry.data = next;
      careSaved.set(entry.id, care.kind === "cleansed" ? "Added to its cleansing log in Crystal." : "Added to its care log in Crystal.");
    } catch (error) {
      notice(`Couldn’t add it: ${error?.message || "please try again."}`);
    }
    global.AltarLiving?.schedule();
  }

  // ── Beginning a ritual on this altar (the app's startRitual) ─────────────
  // The website's way: hand the altar's Ritual Companion what to begin
  // (rituals/js/rituals-logic.js beginHandoff, in sessionStorage) and begin it.
  const RITUALS_LOGIC = "/rituals/js/rituals-logic.js";
  const ritualsLogic = () => B().loadScript(RITUALS_LOGIC).then(() => global.RitualsLogic);
  function needsSavedAltar(words) {
    if (B().altarId()) return false;
    notice(words);
    global.saveAltar?.().then((id) => id && notice("Saved. Now you can begin it."));
    return true;
  }
  async function handOff(handoff) {
    const L = await ritualsLogic();
    // Keep the altar as it is now: the Companion opens the altar a ritual is linked to.
    if (B().altarId()) await global.saveAltar?.({ inPlace: true });
    try {
      global.sessionStorage.setItem(L.KEYS.begin, JSON.stringify(handoff));
    } catch {
      notice("Couldn’t begin: this browser is blocking storage for the site.");
      return;
    }
    if (typeof global.beginHandedOverRitual !== "function") {
      global.location.href = L.BEGIN_URL;
      return;
    }
    const url = new URL(global.location.href);
    url.searchParams.set("beginRitual", "1");
    global.history.replaceState(global.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    global.deselectObject?.();
    await global.beginHandedOverRitual();
  }
  /** The Hedge candle rite for one of your dead, begun here (AncestorPanelSection onBeginRite). */
  async function beginAncestorRite(entryId) {
    if (needsSavedAltar("Save this altar first; a rite begun here is kept with it.")) return;
    const entry = state.practice.ancestors.find((e) => e.id === entryId);
    if (!entry) return;
    try {
      const L = await ritualsLogic();
      const altarId = B().altarId();
      await handOff(L.beginHandoff({ kind: "draft", draft: A().ancestor.ancestorRite(entry, altarId) }, { altarId }));
    } catch (error) {
      notice(`Couldn’t begin: ${error?.message || "please try again."}`);
    }
  }

  /** On the altar: choose a working from the book or one of your templates to begin here (RitualPickerSheet). */
  async function openRitualPicker() {
    if (needsSavedAltar("Save this altar first; its ritual is kept with it.")) return;
    const sheet = B().openSheet({ eyebrow: "Begin a ritual here", title: "Which ritual?", html: `<p class="app-caption">Opening the book…</p>` });
    let R;
    let templates = [];
    let active = null;
    let pantry = null;
    try {
      await ritualsLogic();
      await Promise.all([B().loadScript("/js/core/rituals.js"), B().loadScript("/rituals/js/rituals-store.js")]);
      R = global.SaltCore.rituals;
      [templates, active, pantry] = await Promise.all([
        (typeof global.getRitualTemplates === "function" ? global.getRitualTemplates() : Promise.resolve([])).catch(() => []),
        global.RitualsStore.activeSession().catch(() => null),
        global.RitualsStore.pantry().catch(() => null)
      ]);
    } catch (error) {
      sheet.setBody(`<p>${esc(`Couldn’t open the book: ${error?.message || "please try again."}`)}</p>`);
      return;
    }
    if (!sheet.dialog.open) return;
    const PM = R.premade;
    let settings = null;
    try { settings = (await global.SaltSettings?.get?.()) || null; } catch { settings = null; }
    const suggested = PM.forYou(PM.forYouContext(settings, new Date()), PM.PREMADE, 8);
    const altarId = B().altarId();
    const altarName = B().altarName();
    let tab = "premade";
    let query = "";
    let chosen = null;
    let busy = false;
    const row = (attrs, title, detail) => `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" ${attrs}><span class="app-row__title">${esc(title)}</span>${detail ? `<span class="app-caption">${esc(detail)}</span>` : ""}</button>`;
    const listHtml = () => {
      if (tab === "premade") {
        const list = query.trim() ? PM.filterPremade(PM.PREMADE, { query }).slice(0, 40) : suggested;
        return `${label(query.trim() ? "From the book" : "Suited to tonight")}${list.length ? `<div class="app-rows">${list.map((p) => row(`data-premade="${esc(p.id)}"`, p.title, `${p.kind === "spell" ? "Spell" : "Ritual"} · about ${p.minutes} min`)).join("")}</div>` : `<p class="app-caption">Nothing in the book matches that.</p>`}`;
      }
      const q = query.trim().toLowerCase();
      const list = templates.filter((t) => t.status !== "archived" && (!q || `${t.title} ${t.intention || ""}`.toLowerCase().includes(q)));
      if (!list.length) return `<p>${esc(templates.length ? "None of your templates match that." : "Your own templates appear here once you make one in Rituals → Templates.")}</p>`;
      return `<div class="app-rows">${list.map((t) => { const n = (t.ritual_template_steps || []).length; return row(`data-template="${esc(t.id)}"`, t.title || "Untitled", `${n} ${n === 1 ? "step" : "steps"}`); }).join("")}</div>`;
    };
    const elsewhere = active && active.linked_altar_id !== altarId && active.metadata?.ranOnAltar !== altarId;
    const drawList = () => {
      sheet.dialog.querySelector(".app-sheet__eyebrow").textContent = "Begin a ritual here";
      sheet.dialog.querySelector(".app-sheet__title").textContent = "Which ritual?";
      sheet.setBody(`<div class="app-tabs">${B().chips([{ label: "From the book", action: "tab", pressed: tab === "premade", data: { v: "premade" } }, { label: "Your templates", action: "tab", pressed: tab === "templates", data: { v: "templates" } }])}</div>
        <label class="app-field"><span>Search rituals</span><input type="search" data-q value="${esc(query)}" placeholder="${esc(tab === "premade" ? "Search the book: protection, Full Moon…" : "Search your templates")}" autocomplete="off"></label>
        ${elsewhere ? `<div class="app-row"><span class="app-row__title">${esc(`“${active.title || "A ritual"}” is under way`)}</span><span class="app-caption">Finish it in the Ritual Companion before beginning another here.</span></div>` : ""}
        <div data-list>${listHtml()}</div>`);
    };
    const drawChosen = () => {
      const premade = chosen.kind === "premade" ? chosen.premade : null;
      const title = premade ? premade.title : chosen.template.title || "Untitled";
      const summary = premade ? premade.summary : chosen.template.intention || "";
      const steps = premade ? premade.steps.length : (chosen.template.ritual_template_steps || []).length;
      const needs = premade ? R.ingredients.premadeNeeds(premade) : R.ingredients.templateNeeds(chosen.template);
      const check = needs.length && pantry ? R.ingredients.checkIngredients(needs, { ...pantry, objects: B().doc().objects }) : null;
      const list = (title_, items) => (items.length ? `${label(title_)}<ul class="app-story">${items.map((i) => `<li>${esc(i.have ? `✓ ${i.name} · ${R.ingredients.foundWords(i)}` : `○ ${i.name}`)}</li>`).join("")}</ul>` : "");
      sheet.dialog.querySelector(".app-sheet__title").textContent = title;
      sheet.setBody(`${summary ? `<p>${esc(summary)}</p>` : ""}<p class="app-caption">${esc(`${steps} ${steps === 1 ? "step" : "steps"}${premade ? ` · about ${premade.minutes} min` : ""}`)}</p>
        ${check ? `<details class="app-block"><summary>${esc(check.line)} <span class="app-caption">${esc(`On ${altarName}, and among your things`)}</span></summary>${list("You have", check.have)}${list("To gather", check.missing)}${list("If you like", [...check.optionalHave, ...check.optionalMissing])}</details>` : ""}
        ${active ? `<p class="app-problem">${esc(`“${active.title || "A ritual"}” is under way. Finish it before beginning another.`)}</p>` : `<button type="button" class="app-button" data-begin${busy ? " disabled" : ""}>${esc(busy ? "Beginning…" : `Begin on ${altarName}`)}</button>`}
        <button type="button" class="app-button app-button--outline" data-another>Choose another</button>`);
    };
    sheet.body.addEventListener("input", (event) => {
      if (!event.target.matches("[data-q]")) return;
      query = event.target.value;
      sheet.body.querySelector("[data-list]").innerHTML = listHtml();
    });
    sheet.body.addEventListener("click", async (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      if (b.dataset.appAction === "tab") { tab = b.dataset.v; query = ""; drawList(); sheet.body.querySelector(`[data-v="${tab}"]`)?.focus(); return; }
      if (b.dataset.premade) { chosen = { kind: "premade", premade: PM.premadeById(b.dataset.premade) }; drawChosen(); return; }
      if (b.dataset.template) { chosen = { kind: "template", template: templates.find((t) => t.id === b.dataset.template) }; drawChosen(); return; }
      if (b.hasAttribute("data-another")) { chosen = null; drawList(); return; }
      if (b.hasAttribute("data-begin") && chosen && !busy) {
        busy = true;
        drawChosen();
        try {
          const L = global.RitualsLogic;
          const handoff = chosen.kind === "premade"
            ? L.beginHandoff({ kind: "draft", draft: { ...PM.premadeDraft(chosen.premade), linked_altar_id: altarId } }, { premadeId: chosen.premade.id, altarId })
            : L.beginHandoff({ kind: "template", templateId: chosen.template.id }, { altarId });
          sheet.close();
          await handOff(handoff);
        } catch (error) {
          busy = false;
          notice(`Couldn’t begin: ${error?.message || "please try again."}`);
        }
      }
    });
    drawList();
  }

  // ── A page in your Book of Shadows (GrimoireLink) ───────────────────────
  // The link is kept on the object (livingState.app.pageId, lib/altar/connect/grimoire);
  // the pages are read from the Grimoire, which lives with your account.
  const grimoire = { snapshot: null, status: "idle", for: null };
  async function loadGrimoire(force = false) {
    const user = typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null;
    if (!user?.id || !global.db) { Object.assign(grimoire, { snapshot: null, status: "signed-out", for: null }); return null; }
    if (!force && grimoire.for === user.id && grimoire.snapshot) return grimoire.snapshot;
    grimoire.status = "loading";
    try {
      const [sections, pages] = await Promise.all([
        global.db.from("grimoire_sections").select("id,title").eq("user_id", user.id),
        global.db.from("grimoire_pages").select("id,title,section_id,page_type").eq("user_id", user.id)
      ]);
      if (pages.error) throw pages.error;
      Object.assign(grimoire, { snapshot: { sections: sections.data || [], pages: pages.data || [] }, status: "ready", for: user.id });
    } catch {
      grimoire.status = "offline";
    }
    global.AltarLiving?.schedule();
    return grimoire.snapshot;
  }
  /** The panel row: the linked page (open it), or an offer to link one (GrimoirePageLink). */
  function pageLinkHtml(saved) {
    const G = A()?.grimoire;
    if (!G) return "";
    const link = G.pageLinkOf(saved);
    const resolved = G.resolvePageLink(link, grimoire.snapshot);
    const body = link && resolved
      ? `<p>${esc(resolved.title)}</p>${resolved.exists === false ? `<p class="app-caption">That page has been deleted from your Book of Shadows.</p>` : ""}${B().chips([
          resolved.exists !== false ? { label: "Open the page", symbol: "❧", href: PAGES.grimoirePage(link.pageId) } : null,
          { label: "Change", action: "page-link", hint: "Link a different page from your Book of Shadows" }
        ])}`
      : B().chips([{ label: "Link a page", symbol: "❧", action: "page-link", hint: "Link a page from your Book of Shadows" }]);
    return `<div class="app-block"><p class="app-living__eyebrow">Book of Shadows</p>${body}</div>`;
  }
  /** Choose the Book of Shadows page an object belongs to (GrimoireLinkSheet). */
  async function openPageLink(object) {
    if (!object) return;
    const core = A();
    const G = core.grimoire;
    const name = B().shortLabel(object.dataset.label, "this object");
    let query = "";
    const sheet = B().openSheet({ eyebrow: "Book of Shadows", title: `A page for ${name}`, html: `<p>Opening your Book of Shadows…</p>` });
    const snapshot = await loadGrimoire();
    if (!sheet.dialog.open) return;
    if (!snapshot) {
      sheet.setBody(`<p>${esc(grimoire.status === "offline" ? "Your Book of Shadows couldn’t be reached. Please try again in a moment." : "Your Book of Shadows lives with your account. Sign in, and its pages can be linked to things on your altar.")}</p>`);
      return;
    }
    const current = () => G.pageLinkOf(B().toSaved(object));
    const rowFor = (c) => `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" data-page="${esc(c.id)}" aria-pressed="${current()?.pageId === c.id}"><span class="app-row__title">${esc(c.title)}</span>${[c.section, current()?.pageId === c.id ? "linked now" : ""].filter(Boolean).length ? `<span class="app-caption">${esc([c.section, current()?.pageId === c.id ? "linked now" : ""].filter(Boolean).join(" · "))}</span>` : ""}</button>`;
    const listHtml = () => {
      const choices = G.pageChoices(snapshot, name, query);
      if (!choices.length) return `<p>${esc(query ? "No page has that in its title." : "Your Book of Shadows has no pages yet. Write one in the Grimoire, then link it here.")}</p>`;
      const suggested = choices.filter((c) => c.suggested);
      const rest = choices.filter((c) => !c.suggested);
      return `${current() ? B().chips([{ label: "Remove the link", action: "unlink", danger: true }]) : ""}
        ${suggested.length ? `${label("Might belong")}<div class="app-rows">${suggested.map(rowFor).join("")}</div>` : ""}
        ${suggested.length && rest.length ? label("Your pages") : ""}<div class="app-rows">${rest.map(rowFor).join("")}</div>`;
    };
    sheet.setBody(`<label class="app-field"><span>Search your pages</span><input type="search" data-q placeholder="Search your pages…" autocomplete="off"></label><div data-list>${listHtml()}</div>`);
    sheet.body.addEventListener("input", (event) => {
      if (!event.target.matches("[data-q]")) return;
      query = event.target.value;
      sheet.body.querySelector("[data-list]").innerHTML = listHtml();
    });
    sheet.body.addEventListener("click", (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      if (b.dataset.page) {
        const page = snapshot.pages.find((p) => p.id === b.dataset.page);
        if (!page) return;
        B().update(object, (o) => G.withPageLink(o, { id: page.id, title: page.title || "" }, nowIso()));
        sheet.close();
        notice(`Linked to “${(page.title || "").trim() || "Untitled page"}” in your Book of Shadows.`);
      } else if (b.dataset.appAction === "unlink") {
        B().update(object, (o) => G.withoutPageLink(o, nowIso()));
        sheet.close();
      }
    });
    sheet.body.querySelector("[data-q]")?.focus();
  }

  // ── Full screen ─────────────────────────────────────────────────────────
  let fullBars = null;
  function setFull(on) {
    document.body.classList.toggle("altar-full-screen", on);
    fullBars?.forEach((el) => el.remove());
    fullBars = null;
    if (on) {
      const left = document.createElement("div");
      left.className = "altar-full-bar altar-full-bar--left";
      left.innerHTML = B().chips([{ label: "Done", symbol: "✕", action: "full-off", hint: "Leave full screen" }, { label: "Undo", symbol: "↶", action: "undo" }, { label: "Redo", symbol: "↷", action: "redo" }]);
      const right = document.createElement("div");
      right.className = "altar-full-bar altar-full-bar--right";
      right.innerHTML = B().chips([{ label: "Save", symbol: "✓", action: "save" }, { label: "Cabinet", symbol: "❖", action: "cabinet", hint: "Open the cabinet" }, { label: "Tools", symbol: "☰", action: "drawer", hint: "Show the altar's tools" }]);
      document.body.append(left, right);
      fullBars = [left, right];
      // Turned sideways where the browser allows it (phones, in full screen); elsewhere it simply fills the window.
      Promise.resolve(document.documentElement.requestFullscreen?.())
        .then(() => global.screen?.orientation?.lock?.("landscape"))
        .catch(() => {});
      left.querySelector("button")?.focus();
    } else {
      try { global.screen?.orientation?.unlock?.(); } catch { /* not locked */ }
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      closeDrawer();
    }
    requestAnimationFrame(() => {
      global.repositionAllObjectsFromPercent?.();
      global.resizeLightingCanvas?.();
      global.renderLighting?.();
      renderSky();
    });
  }
  let drawer = null;
  function openDrawer() {
    closeDrawer();
    drawer = document.createElement("aside");
    drawer.className = "altar-full-drawer";
    drawer.setAttribute("aria-label", "The altar's tools");
    const object = B().selected();
    drawer.innerHTML = `<div class="altar-full-drawer__head"><p class="app-label">${esc(object ? B().shortLabel(object.dataset.label) : B().altarName())}</p><button type="button" class="app-chip" data-app-action="drawer-close">Close</button></div><div data-drawer-body></div>`;
    document.body.appendChild(drawer);
    const body = drawer.querySelector("[data-drawer-body]");
    if (object) {
      const panel = document.querySelector("[data-app-living]");
      body.innerHTML = `<section class="app-living" data-app-living>${panel ? panel.innerHTML : ""}</section>`;
    } else if (tools) body.appendChild(tools.cloneNode(true));
    drawer.querySelector("button")?.focus();
  }
  function closeDrawer() { drawer?.remove(); drawer = null; }
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && document.body.classList.contains("altar-full-screen")) setFull(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("altar-full-screen") && !document.querySelector("dialog[open]")) setFull(false);
  });

  // ── Wiring ──────────────────────────────────────────────────────────────
  function lightAll(on) {
    const core = A();
    global.pushAltarUndoSnapshot?.();
    B().objects().forEach((el) => {
      const saved = B().toSaved(el);
      if (!core.livingState.isCandle(saved)) return;
      const lit = core.livingState.isLit(saved);
      if (on && !lit && !core.livingState.candleLife(saved).spent) global.toggleLight?.(el);
      if (!on && lit) global.toggleLight?.(el);
    });
    renderTools();
  }
  const TOOLS = {
    petitions: () => global.AltarLiving?.openPetitionBox(),
    options: openOptions,
    workings: () => openMore("workings"),
    reading: () => openMore("reading"),
    tonight: openTonight,
    "set-tonight": () => {
      if (B().objects().length && !global.confirm("Set tonight’s altar? It takes the place of what’s on the stage now (Undo brings it back), and your saved altars are untouched.")) return;
      global.pushAltarUndoSnapshot?.();
      openTonightAltar();
    },
    history: openHistory,
    share: openShare,
    "light-all": () => lightAll(true),
    "snuff-all": () => lightAll(false),
    full: () => setFull(true),
    "full-off": () => setFull(false),
    undo: () => global.undoAltarChange?.(),
    redo: () => global.redoAltarChange?.(),
    save: () => global.saveAltar?.(),
    cabinet: () => document.querySelector("[data-open-cabinet-overlay]")?.click(),
    drawer: openDrawer,
    "drawer-close": closeDrawer,
    intention: openIntention
  };
  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-app-action^="tool:"], .altar-full-bar [data-app-action], .altar-full-drawer [data-app-action="drawer-close"], [data-app-tool]');
    if (!button) return;
    const name = (button.dataset.appAction || button.dataset.appTool || "").replace(/^tool:/, "");
    const action = TOOLS[name];
    if (!action) return;
    event.preventDefault();
    action();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches?.("[data-app-tool]")) { event.preventDefault(); TOOLS[event.target.dataset.appTool]?.(); }
  });
  // The drawer's copy of the living panel acts on the selected object too.
  document.addEventListener("click", (event) => {
    if (event.target.closest(".altar-full-drawer [data-app-living] [data-app-action]")) setTimeout(() => drawer && openDrawer(), 300);
  });

  function urlStart() {
    // /altar/?tonight=1 (and the app's ?altarId=tonight) opens Tonight's altar, unsaved.
    // A shrine (?shrine=<deity>) is deity-shrine.js's.
    const url = new URL(global.location.href);
    const altarId = url.searchParams.get("altarId");
    if (url.searchParams.get("tonight") === "1" || altarId === "tonight") {
      url.searchParams.delete("tonight");
      url.searchParams.delete("altarId");
      global.history.replaceState(global.history.state, "", `${url.pathname}${url.search}${url.hash}`);
      openTonightAltar();
    } else if (altarId && !["new", "draft", "shrine"].includes(altarId) && typeof global.loadAltarById === "function") {
      global.loadAltarById(altarId);
    }
  }

  function start() {
    if (!A() || !B()) return;
    loadAltarData().then(settleMoons);
    loadPractice().then(() => global.AltarLiving?.schedule());
    document.addEventListener("altar:current-changed", () => {
      if (B().altarId()) { state.tonight = null; global.AltarLiving?.setTonight(null); }
      loadAltarData();
    });
    document.addEventListener("altar:saved", () => { loadAltarData(); keepSnapshot(); });
    ["app-altar:changed", "living-object-state:changed"].forEach((name) => document.addEventListener(name, () => requestAnimationFrame(renderTools)));
    global.addEventListener("resize", renderSky);
    // A place saved on /today/sky/ in another tab.
    global.addEventListener("storage", (event) => { if (event.key === "sky.place" || event.key === "salt.sky.place") { renderSky(); watchSky(); } });
    watchSky();
    const stage = document.querySelector("[data-altar-stage]");
    if (stage) new MutationObserver(() => requestAnimationFrame(renderTools)).observe(stage, { childList: true });
    setInterval(() => { if (!document.hidden) { renderSky(); loadAltarData(); } }, 5 * 60 * 1000);
    global.SaltPage?.onUserChange?.(() => { loadAltarData(); loadPractice().then(() => global.AltarLiving?.schedule()); loadGrimoire(true); });
    Promise.resolve(global.SaltPage?.ready?.()).catch(() => null).finally(() => loadGrimoire());
    // Your own My Practice notes, once they load, reach the panel's correspondences.
    document.addEventListener("app-altar:library", () => global.AltarLiving?.schedule());
    // After the page restores its working draft.
    setTimeout(urlStart, 50);
  }
  if (document.readyState === "complete") start();
  else global.addEventListener("load", start, { once: true });

  global.AltarReading = {
    openTonight, openLayouts, openAltarReading, openIntention, openHistory, openShare, openTonightAltar, openMore, practiceHtml, renderTools, setFull, state,
    pageLinkHtml, openPageLink, logStoneCare, beginAncestorRite, openRitualPicker, PAGES
  };
})(typeof window !== "undefined" ? window : globalThis);
