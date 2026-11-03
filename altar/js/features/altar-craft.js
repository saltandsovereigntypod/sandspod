/* =========================================================
   ALTAR CRAFT
   The altar's round-two tools, as the app has them (components/altar/
   useCraftTools.tsx, CraftPanels.tsx, CraftLayer.tsx):

   - The pendulum: shown once how it says yes, no and maybe (kept in your
     settings, pendulum_calibration, shared with the app), then asked; it
     swings its answer, kept in your readings and the altar's History.
   - The scrying mirror (or crystal ball): the scrying sit with black glass
     and the altar's candlelight in it (altar-workings.js openScry).
   - The mortar and pestle: herbs and resins added, ground into a loose
     blend to set on the altar, burn, bag as a sachet, or keep in My Apothecary.
   - The bolline: cut a tied cord by hand, harvest a sprig, carve a candle.
   - The cauldron: a simmer pot steaming for about three hours, a petition
     burned in it (the petition box), or filled with water to scry.
   - Crystals set to charge under the moon, in the sun or on selenite, their
     glow building (living-art.js), and the crystal grid lit with the wand:
     lines of light between its stones, kept with the altar (`grid`).
   - A tarot deck, rune bag or ogham staves drawn from where it sits.
   - Ritual mode: the page dark round the altar, one small bar, softer sounds.

   Everything is the app's own logic (js/core/altar.js craftTools). On a
   coven altar the moments go to everyone there (the "rite" broadcast,
   coven-altar.js); the grid, mortar, simmer pot and charging travel with
   the altar. Everything done is kept in the altar's History.
   ========================================================= */

(function initializeAltarCraft(global) {
  "use strict";

  const B = () => global.AltarApp;
  const K = () => global.SaltCore?.altar || null;
  const T = () => K()?.craftTools;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const nowIso = () => new Date().toISOString();
  const stage = () => document.querySelector("[data-altar-stage]");
  const say = (line) => (typeof global.showAltarToast === "function" ? global.showAltarToast(line) : B()?.notice?.(line));
  const reduce = () => !!global.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const extra = () => ({ ...(global.altarExtraFields || {}) });
  const uidOf = (el) => el?.dataset?.altarObjectId || "";
  const saved = (el) => B()?.toSaved?.(el) || null;
  const els = () => B()?.objects?.() || [];
  const find = (test) => els().find((el) => { const o = saved(el); return o && test(o); }) || null;
  const pick = (el) => global.selectObject?.(el);
  const send = (kind, el) => global.CovenAltarPage?.sendRite?.({ kind, key: uidOf(el) });
  const moment = (el, kind) => { if (el?.isConnected) global.LivingArt?.playMoment?.(el, kind); };
  const show = (kind, el) => {
    const heard = T()?.CRAFT_HEARD?.[kind];
    if (heard) moment(el, K().charge.momentFor(heard.methods));
    send(kind, el);
  };

  function logAltar(text) {
    const id = B()?.altarId?.() || global.currentSavedAltarId || global.CovenAltarPage?.altarId || "";
    if (id) global.SaltCraft?.add?.("altar.history", { altarId: id, text, at: nowIso() })?.catch?.(() => {});
  }
  function setExtra(next) {
    if (!next) return;
    global.pushAltarUndoSnapshot?.();
    global.altarExtraFields = next;
    global.saveWorkingAltarDraft?.();
    document.dispatchEvent(new CustomEvent("altar:rites-changed"));
    document.dispatchEvent(new CustomEvent("altar:cords-changed"));
    redraw();
  }

  // ── A coven ritual step done here ────────────────────────────────────
  let pending = null;
  function finish(kind) {
    if (pending?.kind !== kind) return;
    const done = pending.done;
    pending = null;
    done?.();
  }

  // ── Drawing: the grid's lines and a simmer pot's steam ─────────────────
  let layer = null;
  function ensureLayer() {
    const root = stage();
    if (!root) return null;
    if (layer && root.contains(layer)) return layer;
    layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.setAttribute("class", "altar-craft");
    layer.setAttribute("aria-hidden", "true");
    root.appendChild(layer);
    return layer;
  }
  function draw() {
    const t = T();
    const el = ensureLayer();
    const root = stage();
    if (!t || !el || !root) return;
    const w = root.clientWidth;
    const h = root.clientHeight;
    const doc = B()?.doc?.();
    if (!doc) return;
    el.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const unit = w / 600;
    const lines = t.gridLines(doc);
    const now = Date.now();
    const still = reduce();
    const pots = doc.objects.filter((o) => t.isCauldron(o) && t.simmerSteam(o, now) > 0);
    el.innerHTML = `${lines.map((l) => `<line x1="${l.x1 * w}" y1="${l.y1 * h}" x2="${l.x2 * w}" y2="${l.y2 * h}" stroke="rgb(230,236,255)" stroke-opacity="0.25" stroke-width="${6 * unit}" stroke-linecap="round"/><line x1="${l.x1 * w}" y1="${l.y1 * h}" x2="${l.x2 * w}" y2="${l.y2 * h}" stroke="rgb(245,248,255)" stroke-opacity="0.85" stroke-width="${1.2 * unit}" stroke-linecap="round"/>`).join("")}
      ${pots.map((o) => {
        const b = K().geometry.displayBox(o);
        const s = b.size * w;
        const x = b.cx * w;
        const y = (b.cy - (b.size * b.aspect * K().geometry.STAGE_ASPECT) / 2) * h;
        const strength = t.simmerSteam(o, now);
        return [0, 1, 2].map((i) => `<ellipse cx="${x + (i - 1) * s * 0.12}" cy="${y - s * 0.15}" rx="${s * 0.16}" ry="${s * 0.2}" fill="#e8ece8" opacity="${still ? 0.3 * strength : 0}">${still ? "" : `<animate attributeName="opacity" values="0;${0.45 * strength};0" dur="2.7s" begin="${i * 0.9}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0; ${(i - 1) * s * 0.16} ${-s * 0.9}" dur="2.7s" begin="${i * 0.9}s" repeatCount="indefinite"/>`}</ellipse>`).join("");
      }).join("")}`;
  }
  let raf = 0;
  function redraw() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; draw(); });
  }

  // ── The pendulum ─────────────────────────────────────────────────────
  async function calibration() {
    try { return T().readCalibration((await global.SaltSettings?.get?.())?.[T().PENDULUM_SETTING]); } catch { return null; }
  }
  let ownCalibration = null;
  function swingSvg() {
    return `<svg viewBox="-60 -10 120 110" width="140" height="128" role="img" aria-label="The pendulum" data-swing style="display:block;margin:0 auto"><circle cx="0" cy="0" r="3" fill="rgba(226,195,109,0.5)"/><line x1="0" y1="0" x2="0" y2="62" stroke="rgba(226,195,109,0.55)" stroke-width="1" data-cord/><circle cx="0" cy="62" r="8" fill="rgb(226,195,109)" data-bob/></svg>`;
  }
  function animateSwing(root, swing) {
    const bob = root.querySelector("[data-bob]");
    const cord = root.querySelector("[data-cord]");
    if (!bob) return;
    const place = (p) => { bob.setAttribute("cx", p.x * 38); bob.setAttribute("cy", 62 + p.y * 38); cord?.setAttribute("x2", p.x * 38); cord?.setAttribute("y2", 62 + p.y * 38); };
    if (reduce()) return place(T().swingAt(swing, 0.25));
    const start = performance.now();
    const step = (t) => {
      if (!bob.isConnected) return;
      const k = (t - start) / 1500;
      place(T().swingAt(swing, k % 1));
      if (t - start < 3200) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  async function openPendulum(el) {
    const t = T();
    const ui = B();
    let cal = ownCalibration || (await calibration());
    let changing = !cal;
    let choice = { ...(cal || {}) };
    let answer = null;
    ui.openSheet({
      eyebrow: "Pendulum",
      title: "Ask the pendulum",
      label: "the pendulum",
      onMount(body) {
        const render = () => {
          if (changing) {
            const problem = t.calibrationProblem(choice);
            body.innerHTML = `<p class="app-caption">Hold your pendulum still, ask it to show you yes, then no, then maybe, and note how it moves for each. Set the same here. It’s kept for next time, here and in the app.</p>
              ${t.ANSWERS.map((a) => `<p class="app-label">${esc(a.label)}</p>${ui.chips(t.SWINGS.map((s) => ({ label: s.label, action: "swing", data: { answer: a.id, swing: s.id }, pressed: choice[a.id] === s.id })))}`).join("")}
              ${problem ? `<p class="app-caption">${esc(problem)}</p>` : ""}
              ${ui.chips([{ label: "Keep these", action: "keep", primary: true, disabled: !!problem }, { label: "Use the usual ones", action: "usual" }])}`;
            return;
          }
          body.innerHTML = `<label class="app-field"><span class="app-label">Your question, for a yes or no</span><input type="text" maxlength="200" data-question></label>
            ${swingSvg()}
            <p class="app-caption" aria-live="polite" data-answer>${answer ? esc(t.answerLabel(answer.answer)) : ""}</p>
            ${ui.chips([{ label: "Ask", action: "ask", primary: true }, { label: "Change how it answers", action: "change" }])}
            <p class="app-caption">Each answer is kept in your readings and in the altar’s History. ${esc(t.PENDULUM_NOTE)}</p>`;
        };
        render();
        body.addEventListener("click", async (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          if (action === "swing") { choice = { ...choice, [b.dataset.answer]: b.dataset.swing }; return render(); }
          if (action === "keep" || action === "usual") {
            cal = action === "usual" ? t.USUAL_CALIBRATION : choice;
            ownCalibration = cal;
            changing = false;
            let kept = false;
            try { if (global.SaltSettings?.patch) { await global.SaltSettings.patch({ [t.PENDULUM_SETTING]: t.encodeCalibration(cal) }); kept = true; } } catch { kept = false; }
            say(kept ? "The pendulum’s answers are kept. Ask it whenever you like." : "The pendulum’s answers are set for now. Sign in to keep them for next time.");
            return render();
          }
          if (action === "change") { changing = true; choice = { ...(cal || {}) }; return render(); }
          if (action === "ask" && cal) {
            const question = body.querySelector("[data-question]")?.value || "";
            answer = t.askPendulum(cal);
            const out = body.querySelector("[data-answer]");
            if (out) out.textContent = "";
            animateSwing(body, answer.swing);
            global.setTimeout(() => { if (out?.isConnected) out.textContent = t.answerLabel(answer.answer); }, reduce() ? 0 : 3200);
            global.SaltCraft?.add?.("hedge.readings", t.pendulumReading(question, answer.answer, answer.swing, new Date()))?.catch?.(() => {});
            logAltar(t.pendulumLine(question, answer.answer, answer.swing));
            show("swing", el);
            finish("pendulum");
          }
        });
      }
    });
  }

  // ── The mortar and pestle ────────────────────────────────────────────
  function openMortar(el) {
    const t = T();
    const ui = B();
    let search = "";
    const herbs = (K().cabinet.builtInCabinet || []).filter((c) => c.category === "herbs").map((c) => ({ name: c.name, id: c.id }));
    ui.openSheet({
      eyebrow: "Mortar and pestle",
      title: "Grind herbs and resins",
      label: "the mortar and pestle",
      onMount(body) {
        const render = () => {
          const m = t.mortarOf(saved(el));
          const q = search.trim().toLowerCase();
          const choices = t.mortarChoices(els().map(saved), herbs).filter((c) => !m.items.some((i) => i.label.toLowerCase() === c.label.toLowerCase()) && (!q || c.label.toLowerCase().includes(q))).slice(0, 18);
          body.innerHTML = `<p class="app-label">In the mortar</p>
            ${m.items.length ? ui.chips(m.items.map((i) => ({ label: i.label, symbol: "✕", action: "take", data: { label: i.label }, hint: `Take out ${i.label}` }))) : `<p class="app-caption">Nothing yet. Add herbs and resins from the altar or the cabinet.</p>`}
            ${m.ground ? `<p class="app-caption">Ground into a loose blend. What will you do with it?</p>
              ${ui.chips([{ label: "Set the blend on the altar", action: "place", primary: true }, { label: "Burn it as loose incense", action: "burn" }, { label: "Bag it as a sachet", action: "bag" }, { label: "Save as an Apothecary recipe", action: "save" }, { label: "Empty the mortar", action: "empty" }])}`
              : `<label class="app-field"><span class="app-label">Find a herb or resin</span><input type="search" data-search value="${esc(search)}"></label>
              ${ui.chips([...choices.map((c) => ({ label: c.label, symbol: "+", action: "add", data: { label: c.label, herb: c.herb || "", type: c.type || "herb" } })), q && !choices.some((c) => c.label.toLowerCase() === q) ? { label: `Add “${search.trim()}”`, symbol: "+", action: "add", data: { label: search.trim(), herb: "", type: "herb" } } : null])}
              <div data-grinding></div>
              ${ui.chips([{ label: "Grind", action: "grind", primary: true, disabled: !m.items.length }])}`}`;
          body.querySelector("[data-search]")?.addEventListener("input", (e) => {
            search = e.target.value;
            const pos = e.target.selectionStart;
            render();
            const box = body.querySelector("[data-search]");
            box?.focus();
            try { box?.setSelectionRange(pos, pos); } catch { /* not a text box */ }
          });
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          const at = nowIso();
          if (action === "add") { ui.update(el, (o) => t.addToMortar(o, { label: b.dataset.label, herb: b.dataset.herb, type: b.dataset.type }, at)); search = ""; }
          else if (action === "take") ui.update(el, (o) => t.takeFromMortar(o, b.dataset.label, at));
          else if (action === "grind") {
            const items = t.mortarOf(saved(el)).items;
            const spot = body.querySelector("[data-grinding]");
            if (spot) spot.innerHTML = `<p class="app-caption" aria-live="polite"><span class="altar-craft__pestle" aria-hidden="true">⟋</span> Grinding…</p>`;
            b.disabled = true;
            global.setTimeout(() => {
              ui.update(el, (o) => t.grindMortar(o, nowIso()));
              logAltar(t.grindLine(items));
              show("grind", el);
              finish("grind");
              say("Ground into a loose blend.");
              if (body.isConnected) render();
            }, reduce() ? 0 : t.GRIND_MS);
            return;
          } else if (action === "place" || action === "bag") {
            const items = t.mortarOf(saved(el)).items;
            const item = t.blendItem(items, action === "bag" ? "sachet" : "loose");
            const object = K().apothecary.apothecaryObject(item, els().map(saved), at, t.drawSpot(saved(el)));
            ui.update(el, (o) => t.emptyMortar(o, at));
            ui.addSaved(object, { undo: false });
            const line = action === "bag" ? `Bagged the ground blend as a sachet: ${item.name}.` : `Set the ground blend on the altar: ${item.name}.`;
            logAltar(line);
            say(line);
          } else if (action === "burn") {
            const items = t.mortarOf(saved(el)).items;
            const line = t.burnBlendLine(items);
            const pot = find((o) => t.isCauldron(o) || /incense-burner|censer/.test(String(o.tool || o.imagePath || "")));
            ui.update(el, (o) => t.emptyMortar(o, at));
            logAltar(line);
            show("cauldron", pot || el);
            say(line);
          } else if (action === "save") saveBlend(t.blendItem(t.mortarOf(saved(el)).items, "loose"));
          else if (action === "empty") ui.update(el, (o) => t.emptyMortar(o, at));
          render();
        });
      }
    });
  }
  async function saveBlend(item) {
    if (typeof global.saveApothecaryItems !== "function") return say("My Apothecary isn’t ready yet. Try again in a moment.");
    const now = nowIso();
    const next = { ...item, id: global.SaltCraft?.uuid?.() || global.crypto?.randomUUID?.() || `blend-${Date.now()}`, createdAt: now, updatedAt: now };
    const list = typeof global.getApothecaryItems === "function" ? global.getApothecaryItems() : [];
    const ok = await global.saveApothecaryItems([next, ...list]).catch(() => false);
    say(ok === false ? "That couldn’t be saved just now. Try again in a moment." : `“${next.name}” is in My Apothecary.`);
  }

  // ── The bolline ──────────────────────────────────────────────────────
  function openBolline(el) {
    const t = T();
    const ui = B();
    ui.openSheet({
      eyebrow: "Bolline",
      title: "Cut, harvest or carve",
      label: "the bolline",
      onMount(body) {
        const render = () => {
          const doc = ui.doc();
          const label = (id) => ui.shortLabel(doc.objects.find((o) => o.altarObjectId === id)?.label, "the candle");
          const cords = t.cuttableCords(doc);
          body.innerHTML = `<p class="app-label">Cut a cord</p>
            ${cords.length ? ui.chips(cords.map((c) => ({ label: `${label(c.a)} and ${label(c.b)}`, symbol: "╳", action: "cut", data: { id: c.id } }))) : `<p class="app-caption">No cord is tied on the altar. Tie one between two candles in Workings.</p>`}
            ${ui.chips([{ label: "Harvest a sprig", action: "harvest" }, { label: "Carve a candle", action: "carve" }])}`;
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          if (action === "cut") return cut(el, b.dataset.id, () => body.isConnected && render());
          b.closest("dialog")?.close?.();
          if (action === "harvest") harvest();
          else carve();
        });
      }
    });
  }
  function cut(el, id, after) {
    const t = T();
    const doc = B().doc();
    const cord = K().cord.cordsOf(doc).find((c) => c.id === id);
    if (!cord) return;
    const next = t.cutCord(doc, id, nowIso());
    if (next === doc) return;
    setExtra(next.extra);
    const label = (x) => B().shortLabel(doc.objects.find((o) => o.altarObjectId === x)?.label, "the candle");
    const line = t.cutLine(label(cord.a), label(cord.b));
    logAltar(line);
    show("cut", el);
    say(`${line} The besom will sweep it away.`);
    finish("cut_cord");
    after?.();
  }
  function harvest() {
    const plant = find((o) => o.type === "plant");
    if (!plant) return say("There’s no potted plant on the altar yet. Set one down from the cabinet first.");
    pick(plant);
    global.AltarPlants?.actions?.["plant-harvest"]?.();
  }
  function carve() {
    const L = K().livingState;
    const candle = find((o) => L.isCandle(o) && !L.isLit(o));
    if (!candle) return say("There’s no unlit candle on the altar to carve. Set one down from the cabinet first.");
    pick(candle);
    global.AltarLiving?.act?.("carve");
  }

  // ── The cauldron ─────────────────────────────────────────────────────
  function openCauldron(el) {
    const t = T();
    const ui = B();
    let chosen = [];
    ui.openSheet({
      eyebrow: "Cauldron",
      title: "Simmer, burn or scry",
      label: "the cauldron",
      onMount(body) {
        const render = () => {
          const o = saved(el);
          const simmer = t.simmerOf(o);
          const dry = t.simmeredDry(o);
          const water = K().offerings.offeringOf(o)?.kind === "water";
          body.innerHTML = `${simmer && !dry ? `<p class="app-caption">A simmer pot is steaming${simmer.items.length ? ` with ${esc(simmer.items.join(", ").toLowerCase())}` : ""}.</p>${ui.chips([{ label: "Take it off", action: "off" }])}`
            : `<p class="app-caption">${dry ? "The simmer pot has simmered dry. Start it again to top it up." : "A simmer pot: water and a few things from the kitchen, steaming gently to scent the room."}</p>
              ${ui.chips(t.SIMMER_SUGGESTIONS.map((s) => ({ label: s, action: "pick", data: { v: s }, pressed: chosen.includes(s) })))}
              ${ui.chips([{ label: "Start the simmer pot", action: "simmer", primary: true }])}`}
            ${ui.chips([{ label: "Burn a petition in it", action: "petition" }, water ? { label: "Scry in the water", action: "scry" } : { label: "Fill it with water to scry", action: "fill" }])}
            <p class="app-caption">For real fire, keep a cauldron on a heatproof surface, with sand or salt in the bottom, and never leave a simmer pot on the stove unattended.</p>`;
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          const at = nowIso();
          if (action === "pick") chosen = chosen.includes(b.dataset.v) ? chosen.filter((x) => x !== b.dataset.v) : [...chosen, b.dataset.v];
          else if (action === "simmer") {
            ui.update(el, (o) => t.startSimmer(o, chosen, at));
            logAltar(t.simmerLine(chosen));
            show("cauldron", el);
            say("The simmer pot is steaming. It runs about three hours before it wants topping up.");
            finish("simmer");
            redraw();
          } else if (action === "off") {
            ui.update(el, (o) => t.stopSimmer(o, at));
            logAltar("Took the simmer pot off.");
            redraw();
          } else if (action === "petition") {
            b.closest("dialog")?.close?.();
            say("Choose a petition in the box and burn it; the cauldron takes the ash.");
            global.AltarLiving?.openPetitionBox?.();
            return;
          } else if (action === "fill" || action === "scry") {
            if (action === "fill") {
              ui.update(el, (o) => t.fillForScrying(o, at));
              logAltar("Filled the cauldron with water to scry in.");
            }
            b.closest("dialog")?.close?.();
            global.AltarWorkings?.openScry?.("cauldron");
            return;
          }
          render();
        });
      }
    });
  }

  // ── Crystals: charging by light, and the grid ────────────────────────
  function openCrystal(el) {
    const t = T();
    const ui = B();
    ui.openSheet({
      eyebrow: "Crystal",
      title: "Charge by moon, sun or selenite",
      label: "charging the crystal",
      onMount(body) {
        const render = () => {
          const o = saved(el);
          const c = t.chargingOf(o);
          const glow = t.chargingGlow(o);
          const grid = t.gridOf(extra());
          const inGrid = !!grid?.ids.includes(uidOf(el));
          const crystals = els().map(saved).filter((x) => x?.type === "crystal").length;
          body.innerHTML = `${c ? `<p class="app-caption">Charging ${esc(t.chargePlace(c.how).label.toLowerCase())}: ${glow >= 1 ? "fully charged. Take it up when you’re ready." : `about ${Math.round(glow * 100)}% so far; the glow builds as it sits.`}</p>${ui.chips([{ label: "Take it up", action: "up", primary: true }])}`
            : `<p class="app-label">Charge it</p>${ui.chips(t.CHARGE_PLACES.map((p) => ({ label: p.label, action: "charge", data: { how: p.id } })))}<p class="app-caption">${esc(t.CHARGE_NOTE)}</p>`}
            ${inGrid ? ui.chips([{ label: "Let the grid rest", action: "rest" }]) : crystals >= t.GRID_MIN ? `<p class="app-caption">For a crystal grid, choose ${t.GRID_MIN} or more crystals with Select and activate them with the wand.</p>` : ""}`;
        };
        render();
        body.addEventListener("click", (event) => {
          const b = event.target.closest("[data-app-action]");
          if (!b) return;
          const action = b.dataset.appAction;
          const at = nowIso();
          const name = ui.shortLabel(el.dataset.label, "The crystal");
          if (action === "charge") {
            ui.update(el, (o) => t.startCharging(o, b.dataset.how, at));
            const line = t.chargeLineFor(name, b.dataset.how);
            logAltar(line);
            show("charge", el);
            say(`${line} Its glow builds as it sits.`);
          } else if (action === "up") {
            const full = t.chargingGlow(saved(el)) >= 1;
            ui.update(el, (o) => t.finishCharging(o, at));
            logAltar(`${name} was taken up${full ? ", fully charged" : ""}.`);
            say(`${name} is charged. It’s kept in its charging history.`);
            finish("charge_crystal");
          } else if (action === "rest") releaseGrid();
          render();
        });
      }
    });
  }
  /** Light a grid of these stones (elements), with the wand when there is one. */
  function gridOf(list) {
    const t = T();
    const stones = (list || []).map(saved).filter(Boolean);
    const problem = t.gridProblem(stones);
    if (problem) return say(problem);
    const wand = find((o) => t.isWand(o));
    const n = stones.filter((o) => o.type === "crystal").length;
    setExtra(t.activateGrid(extra(), stones, nowIso(), global.CovenAltarPage?.me?.id || undefined));
    logAltar(t.gridLine(n, !!wand));
    show("grid", wand || list[0]);
    say(wand ? `The grid is lit: ${n} stones, joined by lines of light.` : `The grid is lit: ${n} stones. Set a wand on the altar to activate the next one with it.`);
    finish("grid");
  }
  function releaseGrid() {
    setExtra(T().releaseGrid(extra()));
    logAltar(T().GRID_RELEASED);
    say("The grid rests.");
  }
  const crystalEls = () => els().filter((el) => saved(el)?.type === "crystal");

  // ── Drawing from the deck where it sits ──────────────────────────────
  async function drawFrom(el, question = "") {
    const t = T();
    const kind = t.deckKindOf(saved(el));
    if (!kind) return;
    try { await B().loadScript("../js/core/divination.js"); } catch { return say("The cards couldn’t be fetched just now. Try again in a moment."); }
    const D = global.SaltCore?.divination;
    const spread = D?.draw?.spreadById(t.DECK_SPREAD[kind]);
    if (!spread) return;
    let settings = {};
    try { settings = (await global.SaltSettings?.get?.()) || {}; } catch { settings = {}; }
    const drawn = D.draw.drawSpread(spread, D.draw.drawOptions(settings));
    const now = new Date();
    const reading = D.draw.readingFromDraw(spread, drawn, { question, now, deck: kind === "tarot" ? D.decks.chosenDeck(settings) : undefined });
    let entry = { id: "", createdAt: now.toISOString(), data: reading };
    try { entry = (await global.SaltCraft?.add?.("hedge.readings", reading)) || entry; } catch { /* kept on the altar all the same */ }
    const first = drawn.items[0] || { name: "", reversed: false };
    const laid = els().map(saved).filter((o) => o?.tool === "reading" || o?.tool === "rune").length;
    const card = K().practice.readingObject(entry, `${first.name}${first.reversed ? ", reversed" : ""}`, els().map(saved), now.toISOString(), t.drawSpot(saved(el), laid % 4));
    B().addSaved(card);
    const line = t.drawLine(kind, first.name);
    logAltar(line);
    show("draw", el);
    say(`${line} It’s laid beside it and kept in your readings.`);
    finish("draw_deck");
  }
  function openDeck(el) {
    const t = T();
    const kind = t.deckKindOf(saved(el));
    B().openSheet({
      eyebrow: "Draw",
      title: t.DRAW_LABEL[kind],
      label: "drawing",
      html: `<label class="app-field"><span class="app-label">Your question (or leave it open)</span><input type="text" maxlength="200" data-question></label>${B().chips([{ label: t.DRAW_LABEL[kind], action: "draw", primary: true }])}<p class="app-caption">It’s laid beside the ${kind === "tarot" ? "deck" : kind === "runes" ? "bag" : "staves"} and kept in your readings.</p>`,
      onMount(body) {
        body.addEventListener("click", (event) => {
          if (!event.target.closest("[data-app-action='draw']")) return;
          const q = body.querySelector("[data-question]")?.value || "";
          event.target.closest("dialog")?.close?.();
          drawFrom(el, q);
        });
      }
    });
  }

  // ── The scrying mirror ───────────────────────────────────────────────
  function scryMirror(el) {
    const L = K().livingState;
    const lit = els().map(saved).filter((o) => o && L.isCandle(o) && L.isLit(o)).length;
    if (el) pick(el);
    global.AltarWorkings?.openScry?.("mirror", lit, () => finish("scry_mirror"));
  }

  // ── Ritual mode ──────────────────────────────────────────────────────
  let ritualBar = null;
  function setRitual(on) {
    document.body.classList.toggle("altar-ritual-mode", on);
    global.AltarSoftSounds = on ? T()?.RITUAL_SOFT || 0.45 : 1;
    ritualBar?.remove();
    ritualBar = null;
    if (on) {
      ritualBar = document.createElement("div");
      ritualBar.className = "altar-ritual-bar";
      ritualBar.setAttribute("role", "toolbar");
      ritualBar.setAttribute("aria-label", "Ritual mode");
      ritualBar.innerHTML = B().chips([{ label: "Leave ritual mode", symbol: "✕", action: "ritual-off" }, { label: "Tools", symbol: "☰", action: "ritual-tools", hint: "Show or hide what the chosen thing can do" }]);
      ritualBar.addEventListener("click", (event) => {
        const b = event.target.closest("[data-app-action]");
        if (!b) return;
        if (b.dataset.appAction === "ritual-off") setRitual(false);
        else document.body.classList.toggle("altar-ritual-tools");
      });
      document.body.appendChild(ritualBar);
      say(T()?.RITUAL_ON || "Ritual mode.");
      ritualBar.querySelector("button")?.focus();
    } else {
      document.body.classList.remove("altar-ritual-tools");
    }
    requestAnimationFrame(() => { global.repositionAllObjectsFromPercent?.(); global.resizeLightingCanvas?.(); global.renderLighting?.(); redraw(); });
  }
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-ritual-mode]")) setRitual(!document.body.classList.contains("altar-ritual-mode"));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("altar-ritual-mode") && !document.querySelector("dialog[open]")) setRitual(false);
  });

  // ── A coven ritual step's deed (altar-rites.js passes on what it doesn't take) ──
  function deed(kind, done, toCabinet) {
    const t = T();
    if (!t) return false;
    const need = (test, what) => {
      const el = find(test);
      if (!el) toCabinet(what);
      else pick(el);
      return el;
    };
    pending = { kind, done };
    switch (kind) {
      case "pendulum": { const el = need(t.isPendulum, "pendulum"); if (el) openPendulum(el); return true; }
      case "scry_mirror": scryMirror(find(t.isScryingGlass)); return true;
      case "grind": { const el = need(t.isMortar, "mortar and pestle"); if (el) openMortar(el); return true; }
      case "cut_cord": { const el = need(t.isBolline, "bolline"); if (el) openBolline(el); return true; }
      case "simmer": { const el = need(t.isCauldron, "cauldron"); if (el) openCauldron(el); return true; }
      case "grid": {
        const stones = crystalEls();
        if (stones.length < t.GRID_MIN) { toCabinet(`crystal for a grid (it takes ${t.GRID_MIN})`); return true; }
        gridOf(stones);
        return true;
      }
      case "draw_deck": { const el = need((o) => !!t.deckKindOf(o), "tarot deck, rune bag or ogham staves"); if (el) drawFrom(el, ""); return true; }
    }
    pending = null;
    return false;
  }

  /** A live ritual step's deed, waiting: done by hand with the tool, it counts (coven-altar.js arm). */
  function arm(kind, done) {
    if (!["pendulum", "scry_mirror", "grind", "cut_cord", "simmer", "grid", "draw_deck"].includes(kind)) return false;
    pending = { kind, done };
    return true;
  }
  global.AltarCraft = { deed, arm, gridOf, redraw, setRitual };

  // ── In the object's actions ──────────────────────────────────────────
  const registry = global.altarObjectActionRegistry;
  if (Array.isArray(registry)) {
    const is = (fn) => (o) => !!T()?.[fn]?.(saved(o));
    registry.push(
      { id: "pendulum-ask", label: "Ask the pendulum", icon: "◉", priority: 11, types: ["tool"], available: is("isPendulum"), handler: (o) => openPendulum(o) },
      { id: "scry-mirror", label: "Scry in the mirror", icon: "◐", priority: 11, types: ["tool"], available: is("isScryingGlass"), handler: (o) => scryMirror(o) },
      { id: "mortar-grind", label: "Grind herbs", icon: "⟋", priority: 11, types: ["tool"], available: is("isMortar"), handler: (o) => openMortar(o) },
      { id: "bolline", label: "Cut, harvest or carve", icon: "╳", priority: 11, types: ["tool"], available: is("isBolline"), handler: (o) => openBolline(o) },
      { id: "cauldron", label: "Simmer, burn or scry", icon: "≋", priority: 11, types: ["vessel", "tool"], available: is("isCauldron"), handler: (o) => openCauldron(o) },
      { id: "crystal-light", label: "Charge by moon, sun or selenite", icon: "◑", priority: 12, types: ["crystal"], available: (o) => saved(o)?.type === "crystal", handler: (o) => openCrystal(o) },
      { id: "wand-grid", label: "Activate the crystals as a grid", icon: "✧", priority: 13, types: ["tool"], available: (o) => !!T()?.isWand(saved(o)) && !T().gridOf(extra()) && crystalEls().length >= (T().GRID_MIN || 3), handler: () => gridOf(crystalEls()) },
      { id: "wand-grid-rest", label: "Let the crystal grid rest", icon: "✧", priority: 13, types: ["tool"], available: (o) => !!T()?.isWand(saved(o)) && !!T().gridOf(extra()), handler: () => releaseGrid() },
      { id: "deck-draw", label: "Draw from it", icon: "✦", priority: 11, types: ["tool"], available: (o) => !!T()?.deckKindOf(saved(o)), handler: (o) => openDeck(o) }
    );
  }

  function start() {
    redraw();
    ["app-altar:changed", "altar:rites-changed", "altar:objects-moved", "altar:current-changed", "living-object-state:changed"].forEach((name) => document.addEventListener(name, redraw));
    global.addEventListener("resize", redraw);
    // A simmer pot goes dry in its own time.
    global.setInterval(redraw, 60_000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})(window);
