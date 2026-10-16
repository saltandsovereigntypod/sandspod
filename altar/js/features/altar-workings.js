/* =========================================================
   ALTAR WORKINGS
   The app's workings at the altar (app/src/components/altar/workings/*):
   a spell jar built in layers and sealed with wax, a sachet or charm bag
   filled, knotted and fed on its day, spells kept over days, a timed sit
   with the scrying bowl, and the gratitude bowl filling through the moon.
   Jars and sachets go into My Apothecary and onto the altar; spells,
   scrying notes and gratitude beads are the app's craft collections.
   ========================================================= */

(function initializeAltarWorkings(global) {
  "use strict";

  const B = () => global.AltarApp;
  const A = () => global.SaltCore?.altar;
  const esc = (v) => B().esc(v);
  const nowIso = () => new Date().toISOString();
  const JAR_INTENTIONS = ["Money", "Love", "Protection", "Healing", "Calm", "Clarity", "Courage", "Cleansing", "A sweeter home"];
  const PURPOSES = ["Protection", "Love", "Luck", "Calm", "Good sleep", "Courage", "Travel", "Healing"];
  const reduce = () => !!global.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const notice = (t) => B().notice(t);
  const label = (text) => `<p class="app-label">${esc(text)}</p>`;

  /** Where new things are set down: the middle of the stage. */
  const center = () => ({ cx: 0.5, cy: 0.62 });

  // ── Pictures ────────────────────────────────────────────────────────────
  const BODY = "M30 22 h40 v8 q0 4 6 8 q14 9 14 26 v52 q0 16 -16 16 h-48 q-16 0 -16 -16 v-52 q0 -17 14 -26 q6 -4 6 -8 z";
  function jarSvg(bands, seal, size = 120) {
    const top = 40;
    const bottom = 130;
    const height = bottom - top;
    const name = bands.length ? `A spell jar with ${bands.length} layer${bands.length === 1 ? "" : "s"}: ${bands.map((b) => b.label).join(", ")}${seal ? ", sealed with wax" : ""}` : "An empty spell jar";
    const id = `jar-${Math.random().toString(36).slice(2, 7)}`;
    return `<svg class="app-jar-visual" role="img" aria-label="${esc(name)}" width="${size}" height="${size * 1.4}" viewBox="0 0 100 140">
      <defs><clipPath id="${id}-in"><path d="${BODY}"/></clipPath><linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.16"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.03"/><stop offset="1" stop-color="#fff" stop-opacity="0.1"/></linearGradient></defs>
      <g clip-path="url(#${id}-in)">${bands.map((band) => { const y1 = bottom - band.to * height; const y0 = bottom - band.from * height; return `<rect x="0" y="${y1}" width="100" height="${Math.max(0, y0 - y1) + 0.6}" fill="${esc(band.color)}" opacity="0.92"/>`; }).join("")}</g>
      <path d="${BODY}" fill="url(#${id}-glass)" stroke="rgba(226,195,109,0.55)" stroke-width="1.6"/>
      <rect x="33" y="10" width="34" height="14" rx="3" fill="#a07a4f" stroke="#7a5a38"/>
      ${seal ? `<g><ellipse cx="50" cy="13" rx="21" ry="8" fill="${esc(seal)}"/><path d="M32 15 q-2 8 1 10 q3 -2 2 -10 z M62 16 q0 9 3 9 q2 -3 0 -10 z M46 18 q-1 6 2 7 q2 -2 1 -7 z" fill="${esc(seal)}"/><ellipse cx="45" cy="10" rx="6" ry="2" fill="#fff" opacity="0.18"/></g>` : ""}
      <path d="M22 62 q-2 20 0 44" stroke="#fff" stroke-opacity="0.18" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`;
  }
  function shake(el) {
    if (!el || reduce() || !el.animate) return;
    el.style.transformOrigin = "50% 90%";
    el.animate([0, 6, -6, 4, -4, 2, 0].map((d) => ({ transform: `rotate(${d}deg)` })), { duration: 540 });
  }
  function pouchSvg(colors, knots) {
    const k = Math.min(9, knots);
    return `<svg role="img" aria-label="${esc(`A charm bag with ${colors.length} thing${colors.length === 1 ? "" : "s"} in it, tied with ${knots} knot${knots === 1 ? "" : "s"}`)}" width="110" height="110" viewBox="0 0 100 100" style="display:block;margin:0 auto">
      ${colors.slice(0, 7).map((c, i) => `<circle cx="${34 + i * 5.5}" cy="${30 - (i % 2) * 4}" r="5" fill="${esc(c)}"/>`).join("")}
      <path d="M28 34 q22 -8 44 0 q10 26 4 46 q-26 12 -52 0 q-6 -20 4 -46 z" fill="#8a6a4a" stroke="#5c4632" stroke-width="1.5"/>
      <path d="M30 38 q20 6 40 0" stroke="#e2c36d" stroke-width="2" fill="none"/>
      ${Array.from({ length: k }, (_, i) => `<circle cx="${50 - ((k - 1) * 4) / 2 + i * 4}" cy="39" r="1.8" fill="#e2c36d"/>`).join("")}
    </svg>`;
  }

  // ── Picking ingredients (IngredientPicker) ──────────────────────────────
  const keyOf = (id) => String(id || "").split(":")[2] || "";
  // The Library with your own My Practice notes once it loads (app-altar-bridge.js), the built-in one until then.
  let entriesCache = null;
  const entries = () => B().library() || (entriesCache ||= A().traditionalEntries());
  const apothecary = () => (typeof global.getApothecaryItems === "function" ? global.getApothecaryItems() : []) || [];
  function pickerResults(query, kinds, suggestFor) {
    const core = A();
    const q = query.trim().toLowerCase();
    const out = [];
    ["herb", "crystal"].filter((k) => kinds.includes(k)).forEach((t) => {
      const found = q ? core.searchLibrary(entries(), q, { type: t, limit: 6 }) : suggestFor ? core.searchLibrary(entries(), suggestFor, { type: t, limit: 4 }) : [];
      found.forEach((e) => {
        if (!core.correspondence.handleSafe(e)) return;
        const key = keyOf(e.id);
        out.push({ label: e.name, source: "library", type: t, ...(t === "herb" ? { herb: key || undefined } : { crystal: key || undefined }) });
      });
    });
    if (kinds.includes("apothecary") && q) {
      apothecary().filter((item) => String(item.name || "").toLowerCase().includes(q)).forEach((item) => out.push({ label: item.name, source: "apothecary", apothecaryItemId: item.id, note: item.typeLabel }));
    }
    if (kinds.includes("salt")) {
      core.spellJar.JAR_SALTS.forEach((salt) => { if (!q ? !suggestFor : salt.label.toLowerCase().includes(q)) out.push({ label: salt.label, source: "salt", note: salt.note }); });
      if (!q && suggestFor) core.spellJar.JAR_SALTS.slice(0, 3).forEach((salt) => out.push({ label: salt.label, source: "salt", note: salt.note }));
    }
    if (!q && !suggestFor && out.length < 6) {
      ["herbs:rosemary", "herbs:lavender", "herbs:bay", "crystals:clear-quartz"].forEach((id) => {
        const item = core.cabinet.builtInCabinet.find((i) => i.id === id);
        const form = item ? core.cabinet.placeableForms(item)[0] : null;
        if (item && form && kinds.includes(form.crystal ? "crystal" : "herb")) out.push({ label: item.name, source: "library", type: form.crystal ? "crystal" : "herb", herb: form.herb, crystal: form.crystal });
      });
    }
    const seen = new Set();
    return out.filter((p) => (seen.has(p.label.toLowerCase()) ? false : (seen.add(p.label.toLowerCase()), true))).slice(0, 14);
  }
  /** A search box and chips; calls onPick(picked). */
  function mountPicker(host, { kinds = ["herb", "crystal", "salt", "apothecary", "cabinet"], suggestFor = () => "", placeholder = "Search herbs, stones, salts…", chosen = () => [], onPick }) {
    host.innerHTML = `<label class="app-field"><span>Search ingredients</span><input data-picker-q placeholder="${esc(placeholder)}" autocomplete="off"></label><div data-picker-results></div>`;
    const input = host.querySelector("[data-picker-q]");
    let results = [];
    const draw = () => {
      results = pickerResults(input.value, kinds, suggestFor());
      const typed = input.value.replace(/\s+/g, " ").trim();
      const picked = new Set(chosen().map((c) => c.toLowerCase()));
      const list = results.map((p, i) => ({ label: p.label, symbol: picked.has(p.label.toLowerCase()) ? "✓" : p.source === "salt" ? "◇" : p.source === "apothecary" ? "⚗" : p.type === "crystal" ? "◆" : "❦", action: "pick", data: { i }, hint: `Add ${p.label}${p.note ? `, ${p.note}` : ""}` }));
      if (typed && !results.some((p) => p.label.toLowerCase() === typed.toLowerCase())) list.push({ label: `Add “${typed}”`, symbol: "+", action: "pick-typed", hint: `Add ${typed} as typed` });
      host.querySelector("[data-picker-results]").innerHTML = B().chips(list);
    };
    input.addEventListener("input", draw);
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const typed = input.value.replace(/\s+/g, " ").trim();
      if (typed) { onPick({ label: typed, source: "typed" }); input.value = ""; draw(); }
    });
    host.addEventListener("click", (event) => {
      const b = event.target.closest("[data-app-action]");
      if (!b) return;
      if (b.dataset.appAction === "pick") onPick(results[Number(b.dataset.i)]);
      else if (b.dataset.appAction === "pick-typed") onPick({ label: input.value.replace(/\s+/g, " ").trim(), source: "typed" });
      else return;
      input.value = "";
      draw();
    });
    draw();
    return { redraw: draw };
  }

  /** Into My Apothecary (the site's own store), then onto the altar. */
  async function keepInApothecary(item) {
    try {
      if (typeof global.saveApothecaryItems === "function" && typeof global.getApothecaryItems === "function") {
        // Never hold the jar back waiting on the account: it saves with the altar either way.
        return await Promise.race([
          global.saveApothecaryItems([item, ...global.getApothecaryItems().filter((i) => i.id !== item.id)]),
          new Promise((resolve) => setTimeout(() => resolve(false), 5000))
        ]);
      }
    } catch { /* still placed; it saves with the altar */ }
    return false;
  }
  function placeWorking(object) {
    B().addSaved(object);
    notice(`${B().shortLabel(object.label, "It")} is on your altar and saved to My Apothecary.`);
  }

  // ── Spell jar ───────────────────────────────────────────────────────────
  function openJar() {
    const core = A();
    const J = core.spellJar;
    let jar = J.emptyJar();
    let step = "intention";
    let spoken = "";
    const sheet = B().openSheet({ eyebrow: "Spell jar", title: "Build a jar in layers", html: "" });
    const draw = () => {
      const bands = J.layerBands(jar.layers);
      const visual = `<div data-jar>${jarSvg(bands, J.sealHex(jar.seal), 120)}</div>`;
      if (step === "intention") {
        sheet.setBody(`${visual}${label("What is it for?")}${B().chips(JAR_INTENTIONS.map((i) => ({ label: i, action: "intention", pressed: jar.intention === i, data: { v: i } })))}
          <label class="app-field"><span>The jar’s intention, in your words</span><input data-intention maxlength="120" placeholder="Or in your own words" value="${esc(jar.intention)}"></label>
          <button type="button" class="app-button" data-next${jar.intention.trim() ? "" : " disabled"}>Begin the layers</button>`);
        sheet.body.querySelector("[data-intention]").addEventListener("input", (e) => { jar = { ...jar, intention: e.target.value }; sheet.body.querySelector("[data-next]").disabled = !jar.intention.trim(); });
      } else if (step === "layers") {
        sheet.setBody(`${visual}<p class="app-caption">For ${esc(jar.intention.trim().toLowerCase())}. Add each thing one at a time, bottom first. Say a line as it goes in, if you like.</p>
          <label class="app-field"><span>Words to say as it goes in</span><input data-spoken maxlength="${J.SPOKEN_MAX}" placeholder="As this goes in, I ask…" value="${esc(spoken)}"></label>
          ${jar.layers.length < J.JAR_LAYER_MAX ? `<div data-picker></div>` : `<p class="app-caption">The jar is full to its neck.</p>`}
          ${jar.layers.length ? `${label("In the jar, top first")}${B().chips([...jar.layers].reverse().map((layer, r) => ({ label: `${layer.label}  ×`, action: "unlayer", data: { i: jar.layers.length - 1 - r }, hint: `Take out ${layer.label}${layer.spoken ? `, spoken: ${layer.spoken}` : ""}` })))}` : ""}
          <div class="app-chips" style="justify-content:flex-start"><button type="button" class="app-button app-button--outline" data-back>Back</button><button type="button" class="app-button" data-seal${jar.layers.length ? "" : " disabled"}>Seal it</button></div>`);
        sheet.body.querySelector("[data-spoken]").addEventListener("input", (e) => { spoken = e.target.value; });
        const host = sheet.body.querySelector("[data-picker]");
        if (host) mountPicker(host, {
          suggestFor: () => jar.intention,
          chosen: () => jar.layers.map((l) => l.label),
          onPick: (p) => {
            jar = J.addLayer(jar, J.jarLayer({ label: p.label, source: p.source, herb: p.herb, crystal: p.crystal, type: p.type, apothecaryItemId: p.apothecaryItemId, spoken }, nowIso(), B().library()));
            spoken = "";
            draw();
          }
        });
      } else {
        const drips = J.dripCandles(B().doc().objects);
        sheet.setBody(`${visual}${label("Seal with wax")}${B().chips((global.AltarArtwork?.candleColors || ["white", "black", "red", "green"]).map((color) => ({ label: color.charAt(0).toUpperCase() + color.slice(1), action: "seal-color", pressed: !jar.seal?.dripFromUid && jar.seal?.color === color, data: { v: color } })))}
          ${drips.length ? `${label("Or drip from a lit candle on the altar")}${B().chips(drips.map((c, i) => ({ label: B().shortLabel(c.label), symbol: "✦", action: "seal-drip", pressed: !!jar.seal?.dripFromUid && jar.seal.dripFromUid === c.altarObjectId, data: { i }, hint: `Drip wax from ${B().shortLabel(c.label)}` })))}` : ""}
          <p class="app-caption">${esc(J.sealLine(jar.seal))}.</p>
          <label class="app-field"><span>Name the jar</span><input data-name maxlength="60" placeholder="${esc(`${jar.intention.trim() || "Intention"} jar`)}" value="${esc(jar.name || "")}"></label>
          <p class="app-caption" data-problem role="alert"></p>
          <div class="app-chips" style="justify-content:flex-start"><button type="button" class="app-button app-button--outline" data-unseal>Back</button><button type="button" class="app-button" data-place${jar.seal ? "" : " disabled"}>Place on the altar</button></div>`);
        sheet.body.querySelector("[data-name]").addEventListener("input", (e) => { jar = { ...jar, name: e.target.value }; });
        sheet.body._drips = drips;
      }
    };
    sheet.body.addEventListener("click", async (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      const a = b.dataset.appAction;
      if (a === "intention") { jar = { ...jar, intention: b.dataset.v }; draw(); }
      else if (b.hasAttribute("data-next")) { step = "layers"; draw(); }
      else if (a === "unlayer") { jar = J.removeLayer(jar, Number(b.dataset.i)); draw(); }
      else if (b.hasAttribute("data-back")) { step = "intention"; draw(); }
      else if (b.hasAttribute("data-seal")) { step = "seal"; draw(); }
      else if (b.hasAttribute("data-unseal")) { jar = J.unsealJar(jar); step = "layers"; draw(); }
      else if (a === "seal-color") { jar = J.sealJar(jar, b.dataset.v, nowIso()); draw(); shake(sheet.body.querySelector("[data-jar] svg")); }
      else if (a === "seal-drip") { const c = sheet.body._drips[Number(b.dataset.i)]; jar = J.sealJar(jar, String(c.color || "white"), nowIso(), c); draw(); }
      else if (b.hasAttribute("data-place")) {
        const why = J.jarProblem(jar);
        if (why) { sheet.body.querySelector("[data-problem]").textContent = why; return; }
        b.disabled = true;
        b.textContent = "Placing…";
        const at = nowIso();
        const item = J.jarItem(jar, at);
        await keepInApothecary(item);
        const result = J.jarObject(jar, B().doc().objects, at, center(), item);
        sheet.close();
        placeWorking(result.object);
      }
    });
    draw();
  }

  function openJarRenew(object) {
    const core = A();
    const J = core.spellJar;
    let note = "";
    const sheet = B().openSheet({ eyebrow: "Spell jar", title: B().shortLabel(object.dataset.label, "Spell jar"), html: "" });
    const draw = () => {
      const jar = J.jarStateOf(B().toSaved(object));
      if (!jar) return sheet.close();
      const since = J.daysSinceRenewal(jar);
      sheet.setBody(`<div data-jar>${jarSvg(J.layerBands(jar.layers), J.sealHex(jar.seal), 96)}</div>
        <p class="app-caption">For ${esc(jar.intention.toLowerCase() || "its intention")}. ${esc(J.sealLine(jar.seal))}. ${jar.renewals.length ? `Last renewed ${since === 0 ? "today" : `${since} days ago`}.` : "Not renewed yet."}</p>
        <label class="app-field"><span>A word as you shake it</span><input data-note maxlength="${J.SPOKEN_MAX}" placeholder="Still growing…" value="${esc(note)}"></label>
        <button type="button" class="app-button" data-renew>Shake to renew</button>
        ${jar.layers.some((l) => l.spoken) ? `${label("What was said")}${jar.layers.filter((l) => l.spoken).map((l) => `<p>${esc(`${l.label}: “${l.spoken}”`)}</p>`).join("")}` : ""}`);
      sheet.body.querySelector("[data-note]").addEventListener("input", (e) => { note = e.target.value; });
    };
    sheet.body.addEventListener("click", (event) => {
      if (!event.target.closest("[data-renew]")) return;
      B().update(object, (o) => J.shakeToRenew(o, nowIso(), note));
      note = "";
      draw();
      shake(sheet.body.querySelector("[data-jar] svg"));
      notice("Shaken and renewed.");
    });
    draw();
  }

  // ── Sachet ──────────────────────────────────────────────────────────────
  function openSachet() {
    const core = A();
    const S = core.sachet;
    const C = core.correspondence;
    let bag = S.emptySachet();
    let kind = "herb";
    const sheet = B().openSheet({ eyebrow: "Sachet & charm bag", title: "Fill a bag", html: "" });
    const draw = () => {
      const planet = bag.planet ?? S.sachetPlanet(bag.fillings);
      sheet.setBody(`${pouchSvg(bag.fillings.map((f) => f.color), bag.knots)}
        ${label("What is it for?")}${B().chips(PURPOSES.map((p) => ({ label: p, action: "purpose", pressed: bag.purpose === p, data: { v: p } })))}
        <label class="app-field"><span>The bag’s purpose, in your words</span><input data-purpose maxlength="120" placeholder="Or in your own words" value="${esc(bag.purpose)}"></label>
        ${label("Fill it")}${B().chips(["herb", "stone", "item"].map((k) => ({ label: k === "herb" ? "Herbs" : k === "stone" ? "Stones" : "Small things", action: "kind", pressed: kind === k, data: { v: k } })))}
        <div data-picker></div>
        ${bag.fillings.length ? B().chips(bag.fillings.map((f, i) => ({ label: `${f.label}  ×`, action: "unfill", data: { i }, hint: `Take out ${f.label}` }))) : ""}
        ${label("Tie it")}${B().chips(S.KNOT_CHOICES.map((n) => ({ label: `${n} knot${n === 1 ? "" : "s"}`, action: "knots", pressed: bag.knots === n, data: { v: n } })))}
        <p class="app-caption">${esc(S.KNOT_MEANING[bag.knots])}.</p>
        ${label("Keep it")}${B().chips([{ label: "Carry it with me", action: "carry", pressed: bag.carried, data: { v: "1" } }, { label: "Keep it on the altar", action: "carry", pressed: !bag.carried, data: { v: "" } }])}
        ${label("Feed it on")}${B().chips(C.PLANETS.map((p) => ({ label: `${C.WEEKDAY_NAMES[C.PLANET_DAY[p]]} · ${p}`, action: "planet", pressed: planet === p, data: { v: p } })))}
        <p class="app-caption">${bag.planet ? "Your choice." : "Chosen from what’s inside; tap another to change it."}</p>
        <label class="app-field"><span>Name the bag</span><input data-name maxlength="60" placeholder="${esc(`${bag.purpose.trim() || "Charm"} bag`)}" value="${esc(bag.name || "")}"></label>
        <p class="app-caption" data-problem role="alert"></p>
        <button type="button" class="app-button" data-tie>Tie it and place it</button>`);
      sheet.body.querySelector("[data-purpose]").addEventListener("input", (e) => { bag = { ...bag, purpose: e.target.value }; });
      sheet.body.querySelector("[data-name]").addEventListener("input", (e) => { bag = { ...bag, name: e.target.value }; });
      mountPicker(sheet.body.querySelector("[data-picker]"), {
        kinds: kind === "herb" ? ["herb", "cabinet"] : kind === "stone" ? ["crystal", "cabinet"] : ["salt", "apothecary"],
        suggestFor: () => bag.purpose,
        placeholder: kind === "item" ? "A coin, a key, a written name…" : kind === "stone" ? "Search stones…" : "Search herbs…",
        chosen: () => bag.fillings.map((f) => f.label),
        onPick: (p) => {
          const k = p.type === "crystal" ? "stone" : p.type === "herb" ? "herb" : kind;
          bag = S.addFilling(bag, S.filling(p.label, k, { herb: p.herb, crystal: p.crystal }, B().library()));
          draw();
        }
      });
    };
    sheet.body.addEventListener("click", async (event) => {
      const b = event.target.closest("button");
      if (!b || b.closest("[data-picker]")) return;
      const a = b.dataset.appAction;
      if (a === "purpose") bag = { ...bag, purpose: b.dataset.v };
      else if (a === "kind") kind = b.dataset.v;
      else if (a === "unfill") bag = S.removeFilling(bag, Number(b.dataset.i));
      else if (a === "knots") bag = { ...bag, knots: Number(b.dataset.v) };
      else if (a === "carry") bag = { ...bag, carried: !!b.dataset.v };
      else if (a === "planet") bag = { ...bag, planet: b.dataset.v };
      else if (b.hasAttribute("data-tie")) {
        const why = S.sachetProblem(bag);
        if (why) { sheet.body.querySelector("[data-problem]").textContent = why; return; }
        b.disabled = true;
        b.textContent = "Tying…";
        const at = nowIso();
        const item = S.sachetItem(bag, at);
        await keepInApothecary(item);
        const result = S.sachetObject(bag, B().doc().objects, at, center(), item);
        sheet.close();
        placeWorking(result.object);
        return;
      } else return;
      draw();
    });
    draw();
  }

  function openSachetFeed(object) {
    const S = A().sachet;
    let withWhat = S.FEEDING_CHOICES[0];
    const sheet = B().openSheet({ eyebrow: "Charm bag", title: B().shortLabel(object.dataset.label, "Charm bag"), html: "" });
    const draw = () => {
      const state = S.sachetStateOf(B().toSaved(object));
      if (!state) return sheet.close();
      const now = new Date();
      const due = S.feedingDue(state, now);
      const last = state.feedings[state.feedings.length - 1];
      sheet.setBody(`${pouchSvg(state.fillings.map((f) => f.color), state.knots)}
        <p>${esc(state.fillings.map((f) => f.label).join(", "))}.</p><p class="app-caption">${esc(S.feedingLine(state, now))}</p>
        ${B().chips(S.FEEDING_CHOICES.map((c) => ({ label: c, action: "with", pressed: withWhat === c, data: { v: c } })))}
        <button type="button" class="app-button${due ? "" : " app-button--outline"}" data-feed>${due ? "Feed it today" : "Feed it anyway"}</button>
        <button type="button" class="app-chip" role="switch" aria-checked="${state.carried}" data-carried>${state.carried ? "✓ Carried with me" : "Kept on the altar"} · tap to change</button>
        ${state.feedings.length ? `<p class="app-caption">${esc(`Fed ${state.feedings.length} time${state.feedings.length === 1 ? "" : "s"}, last on ${new Date(last.at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}.`)}</p>` : ""}`);
    };
    sheet.body.addEventListener("click", (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      if (b.dataset.appAction === "with") withWhat = b.dataset.v;
      else if (b.hasAttribute("data-feed")) { B().update(object, (o) => S.feedSachet(o, nowIso(), withWhat)); notice("Fed."); }
      else if (b.hasAttribute("data-carried")) { const s = S.sachetStateOf(B().toSaved(object)); B().update(object, (o) => S.setCarried(o, !s?.carried, nowIso())); }
      else return;
      draw();
    });
    draw();
  }

  // ── Spells over days ────────────────────────────────────────────────────
  const SPELLS = "altar.spells";
  function ring(progress, text) {
    const r = 18;
    const c = 2 * Math.PI * r;
    return `<svg role="progressbar" aria-label="${esc(text)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress * 100)}" width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="${r}" stroke="rgba(194,200,196,0.24)" stroke-width="4" fill="none"/><circle cx="23" cy="23" r="${r}" stroke="var(--gold)" stroke-width="4" fill="none" stroke-dasharray="${c * progress} ${c}" stroke-linecap="round" transform="rotate(-90 23 23)"/></svg>`;
  }
  async function openSpell(object = null) {
    if (needSaved("spell timer")) return;
    const core = A();
    const SP = core.spells;
    const altarId = B().altarId();
    const objectUid = object?.dataset.altarObjectId || "";
    const objectLabel = object ? B().shortLabel(object.dataset.label) : "";
    let starting = false;
    let closing = new Set();
    let start = { kind: "seven-day-candle", title: "", days: "7", intention: "" };
    const sheet = B().openSheet({ eyebrow: "Spells over days", title: objectLabel ? `With ${objectLabel}` : "Spells on this altar", html: `<p class="app-caption">Loading…</p>` });
    let entries = [];
    const reload = async () => {
      try { entries = await global.SaltCraft.list(SPELLS); } catch { entries = []; }
      if (global.AltarLivingEntries) global.AltarLivingEntries.spells = entries;
    };
    const draw = () => {
      const now = new Date();
      const list = SP.spellsForAltar(entries, altarId, now).filter((e) => !objectUid || e.data.objectUid === objectUid || !e.data.objectUid);
      const open = list.filter((e) => !e.data.closedAt);
      const closed = list.filter((e) => e.data.closedAt).slice(0, 5);
      const cards = open.map((e) => {
        const today = SP.spellToday(e.data, now);
        const ending = today.status === "complete" || closing.has(e.id);
        return `<div class="app-row" data-spell="${esc(e.id)}"><div style="display:flex;gap:10px;align-items:center">${ring(SP.spellProgress(e.data), `${e.data.title}: ${today.label}`)}<div><span class="app-row__title">${esc(e.data.title)}</span><p class="app-caption">${esc(today.label)}</p></div></div>
          ${today.waited ? `<p class="app-caption">${esc(today.waited)}</p>` : ""}<p>${esc(today.instruction)}</p>
          ${today.status === "tend" ? `<label class="app-field"><span>A note on today, optional</span><input data-note maxlength="280" placeholder="How it felt, what you noticed…"></label><button type="button" class="app-button" data-tend>Tended today</button>` : ""}
          ${ending ? `<label class="app-field"><span>Closing reflection</span><textarea data-reflection maxlength="1000" placeholder="How did it go? What changed?"></textarea></label><button type="button" class="app-button" data-close-spell>Close the spell</button>` : `<button type="button" class="app-chip" data-end>End it early</button>`}
        </div>`;
      }).join("");
      const info = SP.SPELL_KINDS[start.kind];
      const startForm = `<div style="display:grid;gap:10px">${label("Which kind")}${B().chips(Object.keys(SP.SPELL_KINDS).map((k) => ({ label: SP.SPELL_KINDS[k].label, action: "kind", pressed: start.kind === k, data: { v: k } })))}
        <p class="app-caption">${esc(info.blurb)}</p>
        ${start.kind === "custom" ? `<label class="app-field"><span>How many days</span><input data-days inputmode="numeric" maxlength="2" placeholder="7" value="${esc(start.days)}"></label>` : ""}
        <label class="app-field"><span>Name it</span><input data-title maxlength="60" placeholder="${esc(info.label)}" value="${esc(start.title)}"></label>
        <label class="app-field"><span>What it’s for</span><input data-intention maxlength="160" placeholder="Steady work, a calmer home…" value="${esc(start.intention)}"></label>
        <p class="app-caption">Miss a day and it simply waits for you; nothing breaks.</p>
        <div class="app-chips" style="justify-content:flex-start"><button type="button" class="app-button app-button--outline" data-not-now>Not now</button><button type="button" class="app-button" data-begin>Begin today</button></div></div>`;
      sheet.setBody(`${cards}${!open.length && !starting ? `<p>Some workings take days: a candle burned a little each evening, a jar tended for a moon. Start one and the altar will keep count.</p>` : ""}
        ${starting ? startForm : `<button type="button" class="app-button${open.length ? " app-button--outline" : ""}" data-start>Start a spell</button>`}
        ${closed.length ? `${label("Closed")}${closed.map((e) => `<div class="app-row"><span class="app-row__title">${esc(e.data.title)}</span>${e.data.reflection ? `<p class="app-caption">“${esc(e.data.reflection)}”</p>` : ""}</div>`).join("")}` : ""}`);
      ["title", "intention", "days"].forEach((key) => sheet.body.querySelector(`[data-${key}]`)?.addEventListener("input", (e) => { start[key] = key === "days" ? e.target.value.replace(/[^0-9]/g, "") : e.target.value; }));
    };
    sheet.body.addEventListener("click", async (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      const card = b.closest("[data-spell]");
      const entry = card ? entries.find((e) => e.id === card.dataset.spell) : null;
      try {
        if (b.dataset.appAction === "kind") start.kind = b.dataset.v;
        else if (b.hasAttribute("data-start")) starting = true;
        else if (b.hasAttribute("data-not-now")) starting = false;
        else if (b.hasAttribute("data-begin")) {
          if (start.kind === "custom" && !(Number(start.days) > 0)) return;
          await global.SaltCraft.add(SPELLS, SP.newSpell({ altarId, kind: start.kind, title: start.title, days: Number(start.days), objectUid: objectUid || undefined, intention: start.intention }, nowIso()));
          starting = false;
          start = { kind: "seven-day-candle", title: "", days: "7", intention: "" };
          await reload();
        } else if (entry && b.hasAttribute("data-tend")) {
          await global.SaltCraft.update(SPELLS, entry.id, SP.tickSpell(entry.data, new Date(), card.querySelector("[data-note]")?.value || ""));
          await reload();
        } else if (entry && b.hasAttribute("data-end")) closing.add(entry.id);
        else if (entry && b.hasAttribute("data-close-spell")) {
          await global.SaltCraft.update(SPELLS, entry.id, SP.closeSpell(entry.data, card.querySelector("[data-reflection]")?.value || "", new Date()));
          await reload();
        } else return;
      } catch {
        notice("Couldn’t save that. Please try again.");
      }
      draw();
      global.AltarLiving?.schedule();
    });
    await reload();
    draw();
  }

  // ── Scrying bowl ────────────────────────────────────────────────────────
  function bowlHtml(still) {
    const paths = A().scrying.reflectionPaths(4);
    return `<div class="app-scry__water" role="img" aria-label="A dark bowl of still water, faint light moving on its surface" style="position:relative;width:min(420px,86vw);aspect-ratio:100/62">
      <svg viewBox="0 0 100 62" width="100%" height="100%" style="position:absolute;inset:0"><defs><radialGradient id="scry-water" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#0d1a22"/><stop offset="1" stop-color="#030607"/></radialGradient><radialGradient id="scry-bowl" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#3a3a36"/><stop offset="1" stop-color="#141412"/></radialGradient></defs>
        <ellipse cx="50" cy="34" rx="48" ry="26" fill="url(#scry-bowl)"/><ellipse cx="50" cy="26" rx="46" ry="18" fill="#2a2a27"/><ellipse cx="50" cy="27" rx="41" ry="15" fill="url(#scry-water)"/>
        ${paths.map((p, i) => `<ellipse cx="${9 + p.cx * 82}" cy="${12 + p.cy * 30}" rx="${p.rx * 82}" ry="${p.ry * 82}" fill="#cfe3ea" opacity="${p.opacity}">${still ? "" : `<animateTransform attributeName="transform" type="translate" values="0 0; ${p.driftX * 82} ${p.driftY * 82}; 0 0" dur="${(p.period * 2) / 1000}s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"/><animate attributeName="opacity" values="${p.opacity};${p.opacity * 1.8};${p.opacity}" dur="${(p.period * 2) / 1000}s" repeatCount="indefinite"/>`}</ellipse>`).join("")}
      </svg></div>`;
  }
  function openScry() {
    if (needSaved("scrying")) return;
    const core = A();
    const SC = core.scrying;
    let phase = "choose";
    let minutes = SC.SCRYING_MINUTES[0];
    let startedAt = 0;
    let sat = 0;
    let timer = 0;
    const notes = { saw: "", symbols: "", feelings: "" };
    const sheet = B().openSheet({ eyebrow: "Water-bowl scrying", title: "The scrying bowl", wide: true, html: "", onClose: () => clearInterval(timer) });
    sheet.dialog.classList.add("app-sheet--scry");
    const draw = () => {
      if (phase === "choose") {
        sheet.setBody(`<div class="app-scry">${bowlHtml(true)}<p>Dim the lights. Let your eyes soften on the water, and let whatever comes, come.</p>${B().chips(SC.SCRYING_MINUTES.map((m) => ({ label: `${m} minutes`, action: "minutes", pressed: minutes === m, data: { v: m } })))}<button type="button" class="app-button" data-begin>Begin</button></div>`);
      } else if (phase === "sit") {
        const left = SC.secondsLeft(minutes, startedAt, Date.now());
        sheet.setBody(`<div class="app-scry">${bowlHtml(reduce())}<p class="app-scry__clock" aria-live="polite" aria-label="${Math.ceil(left / 60)} minutes left" data-clock>${esc(SC.clock(left))}</p><button type="button" class="app-chip" data-finished>I’m finished</button></div>`);
      } else if (phase === "write") {
        sheet.setBody(`<p>Before it fades: a few words.</p>${SC.SCRYING_PROMPTS.map((p) => `<label class="app-field"><span class="app-label">${esc(p.label)}</span><textarea data-prompt="${esc(p.key)}" maxlength="2000" placeholder="${esc(p.placeholder)}">${esc(notes[p.key])}</textarea></label>`).join("")}
          <button type="button" class="app-button" data-save${SC.hasNotes(notes) ? "" : " disabled"}>Save to my journal</button><button type="button" class="app-chip" data-sheet-close>Close without saving</button>`);
        sheet.body.querySelectorAll("[data-prompt]").forEach((t) => t.addEventListener("input", () => { notes[t.dataset.prompt] = t.value; sheet.body.querySelector("[data-save]").disabled = !SC.hasNotes(notes); }));
      }
    };
    sheet.body.addEventListener("click", async (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      if (b.dataset.appAction === "minutes") { minutes = Number(b.dataset.v); draw(); }
      else if (b.hasAttribute("data-begin")) {
        startedAt = Date.now();
        phase = "sit";
        draw();
        timer = setInterval(() => {
          const left = SC.secondsLeft(minutes, startedAt, Date.now());
          const clock = sheet.body.querySelector("[data-clock]");
          if (clock) clock.textContent = SC.clock(left);
          if (left <= 0) { clearInterval(timer); sat = minutes; phase = "write"; draw(); }
        }, 1000);
      } else if (b.hasAttribute("data-finished")) { clearInterval(timer); sat = (Date.now() - startedAt) / 60000; phase = "write"; draw(); }
      else if (b.hasAttribute("data-save")) {
        b.disabled = true;
        b.textContent = "Saving…";
        const at = new Date();
        const moonPhase = core.moon.moonState(at).name;
        let where = "journal";
        try {
          await global.AltarLiving.saveJournal(SC.scryingJournalAnswers(notes, { minutes: Math.max(1, Math.round(sat)), moonPhase, altarName: B().altarName(), date: at }));
        } catch {
          where = "craft";
          try { await global.SaltCraft.add(SC.SCRYING_COLLECTION, SC.scryingEntry(notes, { altarId: B().altarId(), minutes, satMinutes: sat, moonPhase, at: at.toISOString() })); } catch { /* nothing more to try */ }
        }
        sheet.setBody(`<p>${where === "journal" ? "Saved to your ritual journal." : "Saved with this altar."} Drink some water, and come back to the room.</p><button type="button" class="app-button" data-sheet-close>Close</button>`);
        notice(where === "journal" ? "What came in the water is in your journal." : "What came in the water is kept with this altar.");
      }
    });
    draw();
  }

  // ── Gratitude bowl ──────────────────────────────────────────────────────
  function bowlSvg(colors) {
    const spots = A().gratitude.beadPositions(colors.length);
    return `<svg role="img" aria-label="${esc(colors.length ? `A bowl holding ${colors.length} bead${colors.length === 1 ? "" : "s"}` : "An empty bowl")}" width="220" height="198" viewBox="0 0 100 90" style="display:block;margin:0 auto">
      <defs><radialGradient id="grat-in" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#2a2620"/><stop offset="1" stop-color="#14120f"/></radialGradient></defs>
      <path d="M8 34 q42 70 84 0 z" fill="#5c4632" stroke="rgba(226,195,109,0.55)" stroke-width="1.2"/>
      <ellipse cx="50" cy="34" rx="42" ry="9" fill="url(#grat-in)" stroke="rgba(226,195,109,0.55)"/>
      ${spots.map((s, i) => `<circle cx="${10 + s.x * 80}" cy="${34 + ((s.y - 0.35) / 0.55) * 32}" r="${s.r * 80}" fill="${esc(colors[i])}" stroke="#000" stroke-opacity="0.25" stroke-width="0.5"/>`).join("")}
      <ellipse cx="50" cy="34" rx="42" ry="9" fill="none" stroke="rgba(226,195,109,0.55)"/></svg>`;
  }
  async function openGratitude() {
    if (needSaved("gratitude bowl")) return;
    const G = A().gratitude;
    const COLL = G.GRATITUDE_COLLECTION;
    const altarId = B().altarId();
    let entries = [];
    let bead = G.BEADS[0].label;
    let text = "";
    let history = false;
    const sheet = B().openSheet({ eyebrow: "Gratitude bowl", title: "Something to be thankful for", html: `<p class="app-caption">Loading…</p>` });
    const reload = async () => { try { entries = await global.SaltCraft.list(COLL); } catch { entries = []; } };
    const draw = () => {
      const now = new Date();
      const month = G.lunarMonth(now);
      const current = G.beadsThisMoon(entries, altarId, now);
      const past = G.gratitudeHistory(entries, altarId, now);
      sheet.setBody(`${bowlSvg(current.map((e) => e.data.color))}<p class="app-caption" style="text-align:center">${esc(G.bowlLine(current.length, month))}</p>
        <form data-add class="app-field"><label for="grat-text">What you’re grateful for</label><input id="grat-text" maxlength="${G.GRATITUDE_MAX}" placeholder="The rain this morning, a kind word…" value="${esc(text)}"></form>
        ${label("A bead or stone for it")}${B().chips(G.BEADS.map((b) => ({ label: b.label, action: "bead", pressed: bead === b.label, data: { v: b.label } })))}
        <button type="button" class="app-button" data-drop${text.trim() ? "" : " disabled"}>Drop it in the bowl</button>
        ${current.length ? `${label("This moon")}${[...current].reverse().map((e) => `<div class="app-row" style="grid-template-columns:auto 1fr auto;align-items:center"><span style="width:12px;height:12px;border-radius:50%;background:${esc(e.data.color)}"></span><span><span>${esc(e.data.text)}</span><br><span class="app-caption">${esc(new Date(e.data.at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }))}</span></span><button type="button" class="app-chip" data-out="${esc(e.id)}" aria-label="${esc(`Take out ${e.data.text}`)}">×</button></div>`).join("")}` : ""}
        ${past.length ? `<button type="button" class="app-chip" data-history>${history ? "Hide earlier moons" : `Earlier moons (${past.length})`}</button>${history ? past.map((h) => `<div class="app-row"><span class="app-row__title">${esc(`Moon of ${new Date(`${h.moon}T12:00:00Z`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} · ${h.entries.length} bead${h.entries.length === 1 ? "" : "s"}`)}</span>${h.entries.map((e) => `<p class="app-caption">${esc(e.data.text)}</p>`).join("")}</div>`).join("") : ""}` : ""}`);
      const input = sheet.body.querySelector("#grat-text");
      input.addEventListener("input", () => { text = input.value; sheet.body.querySelector("[data-drop]").disabled = !text.trim(); });
      sheet.body.querySelector("[data-add]").addEventListener("submit", (e) => { e.preventDefault(); add(); });
    };
    const add = async () => {
      if (!text.trim()) return;
      try { await global.SaltCraft.add(COLL, G.gratitudeEntry({ altarId, text, bead }, new Date())); } catch { notice("Couldn’t add that. Please try again."); return; }
      text = "";
      await reload();
      draw();
      sheet.body.querySelector("#grat-text")?.focus();
    };
    sheet.body.addEventListener("click", async (event) => {
      const b = event.target.closest("button");
      if (!b) return;
      if (b.dataset.appAction === "bead") { bead = b.dataset.v; draw(); }
      else if (b.hasAttribute("data-drop")) add();
      else if (b.dataset.out) { try { await global.SaltCraft.remove(COLL, b.dataset.out); } catch { /* keep it */ } await reload(); draw(); }
      else if (b.hasAttribute("data-history")) { history = !history; draw(); }
    });
    await reload();
    draw();
  }

  function needSaved(what) {
    if (B().altarId()) return false;
    notice(`Save this altar first; its ${what} is kept with it.`);
    global.saveAltar?.();
    return true;
  }

  // The panel's jar and sachet buttons open these richer sheets.
  document.addEventListener("click", (event) => {
    const button = event.target.closest('[data-app-living] [data-app-action="renew"], [data-app-living] [data-app-action="feed"]');
    if (!button) return;
    const object = B()?.selected?.();
    if (!object) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (button.dataset.appAction === "renew") openJarRenew(object);
    else openSachetFeed(object);
  }, true);

  global.AltarWorkings = { openJar, openJarRenew, openSachet, openSachetFeed, openSpell, openScry, openGratitude, jarSvg, pouchSvg, mountPicker };
})(typeof window !== "undefined" ? window : globalThis);
