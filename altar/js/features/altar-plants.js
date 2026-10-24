/* =========================================================
   ALTAR PLANTS
   A potted plant on the altar, for one of your real houseplants: the
   living panel's section for it (water, the picture that matches it, its
   name and details, a photo of the real plant, notes on its lore and pet
   safety, a moon-gardening hint, its care journal), and the sheets for its
   details, a harvest and a journal entry. The app's PottedSheets.tsx.

   Everything is the app's own logic (js/core/altar.js pottedPlants and
   pottedSprig) on the object's saved shape, so what's kept in
   livingState.app.potted is the same here and in the app. Drawn into the
   panel by altar-living.js, which also runs these actions.
   ========================================================= */

(function initializeAltarPlants(global) {
  "use strict";

  const B = () => global.AltarApp;
  const A = () => global.SaltCore?.altar;
  const P = () => A()?.pottedPlants;
  const esc = (v) => B().esc(v);
  const nowIso = () => new Date().toISOString();
  const selected = () => B()?.selected?.() || null;
  const notice = (text) => B().notice(text);
  const schedule = () => global.AltarLiving?.schedule?.();
  const change = (fn) => {
    const object = selected();
    if (!object) return null;
    const next = B().update(object, fn);
    schedule();
    return next;
  };
  const caption = (text) => (text ? `<p class="app-caption">${esc(text)}</p>` : "");
  const block = (title, body) => `<div class="app-block"><p class="app-living__eyebrow">${esc(title)}</p>${body}</div>`;
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const daysAgo = (n) => { const d = new Date(); return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - n)); };
  const dayLabel = (on) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(on || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : String(on || "");
  };
  const validDay = (on) => /^\d{4}-\d{2}-\d{2}$/.test(on) && on <= daysAgo(0);

  let showAll = "";

  /** The panel's sections for a potted plant. */
  function panelHtml(saved, now = new Date()) {
    const core = P();
    if (!core?.isPottedPlant(saved)) return "";
    const t = now.getTime();
    const kind = core.kindOf(saved);
    const potted = core.pottedOf(saved);
    const thirst = core.thirstOf(saved, t);
    const stages = core.stagesOf(kind.id);
    const notes = core.plantNotes(saved);
    const hint = core.moonGardenHint(saved, now);
    const journal = core.journalOf(saved);
    const all = showAll === String(saved.altarObjectId || "");
    const shown = all ? journal : journal.slice(0, 5);
    const title = core.plantTitle(saved);
    const wants = thirst.level !== "unknown" && thirst.level !== "fine";
    const chips = B().chips;
    const out = [];

    out.push(block(potted.name ? title : `Your ${kind.name.toLowerCase()}`, [
      caption([potted.place, potted.light].filter(Boolean).join(" · ")),
      potted.photo ? `<img class="app-plant__photo" src="${esc(potted.photo)}" alt="${esc(`A photo of ${title}`)}">` : "",
      `<p class="app-caption"${wants ? ' style="color:var(--gold)"' : ""}>${esc(core.thirstLine(saved, t))}</p>`,
      chips([
        { label: "Watered", symbol: "☂", action: "plant-water", hint: `Mark ${title} watered today` },
        core.canHarvest(kind) ? { label: "Harvest", symbol: "✂", action: "plant-harvest", hint: `Harvest from ${title}` } : null,
        { label: "Add to its journal", symbol: "✎", action: "plant-journal" },
        { label: potted.name ? "Its details" : "Name it", symbol: "❦", action: "plant-details", hint: `Name, place, light and watering for ${title}` },
        { label: potted.photo ? "Change the photo" : "Add a photo", symbol: "▣", action: "plant-photo", hint: `${potted.photo ? "Change the" : "Add a"} photo of the real ${kind.name.toLowerCase()}` },
        potted.photo ? { label: "Take the photo away", symbol: "⌫", action: "plant-photo-remove" } : null
      ]),
      stages.length > 1
        ? caption("Which picture matches it now?") + chips(core.PLANT_STAGES.filter((s) => stages.includes(s.id)).map((s) => ({ label: s.label, action: "plant-stage", pressed: potted.stage === s.id, data: { stage: s.id }, hint: `Show it ${s.label.toLowerCase()}` })))
        : ""
    ].join("")));

    if (notes) {
      out.push(block("Notes", [
        caption(notes.folk),
        notes.herb ? caption("Its page in the Living Library opens from the Companion below.") : "",
        `<p class="app-caption"${notes.toxic ? ' style="color:var(--gold)"' : ""}>${esc(`Pets: ${notes.pets}`)}</p>`,
        caption(hint)
      ].join("")));
    }

    out.push(block("Its journal", journal.length
      ? `<div class="app-rows">${shown.map((e) => `<div class="app-plant__entry">${caption(`${dayLabel(e.on)} · ${e.moon} · ${core.journalLine(e)}${e.note ? `. ${e.note}` : ""}`)}${chips([{ label: "Remove", symbol: "⌫", action: "plant-journal-remove", data: { id: e.id }, hint: `Remove the entry for ${dayLabel(e.on)}: ${core.journalLine(e)}` }])}</div>`).join("")}</div>${journal.length > 5 ? chips([{ label: all ? "Show fewer" : `Show all ${journal.length}`, action: "plant-journal-all" }]) : ""}`
      : caption("Waterings, feeds, repotting, new leaves, cuttings and harvests go here, each with that day’s moon.")));
    return out.join("");
  }

  const dayChoiceHtml = (label, value) => `<p class="app-living__eyebrow">${esc(label)}</p>
    <div class="app-chips"><button type="button" class="app-chip" data-day="${daysAgo(0)}">Today</button><button type="button" class="app-chip" data-day="${daysAgo(1)}">Yesterday</button></div>
    <label class="app-field"><span>${esc(label)}, as year-month-day</span><input data-on maxlength="10" placeholder="Or a date: 2026-10-20" value="${esc(value)}"></label>`;
  function wireDayChoice(body) {
    const input = body.querySelector("[data-on]");
    const mark = () => body.querySelectorAll("[data-day]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.day === input.value)));
    body.addEventListener("click", (event) => {
      const b = event.target.closest("[data-day]");
      if (!b) return;
      input.value = b.dataset.day;
      mark();
    });
    input.addEventListener("input", mark);
    mark();
    return input;
  }

  /** Her name for it, where it lives, its light, how often it's watered and when it last was (PlantDetailsSheet). */
  function openDetails() {
    const object = selected();
    const core = P();
    if (!object || !core) return;
    const saved = B().toSaved(object);
    const kind = core.kindOf(saved);
    const p = core.pottedOf(saved);
    let every = p.waterEvery;
    B().openSheet({
      eyebrow: kind.name,
      title: "Its details",
      html: `<label class="app-field"><span>Its name</span><input data-name maxlength="60" placeholder="Its name (optional): Margaret" value="${esc(p.name)}"></label>
        <label class="app-field"><span>Where it lives</span><input data-place maxlength="80" placeholder="Where it lives: the kitchen windowsill" value="${esc(p.place)}"></label>
        <p class="app-living__eyebrow">Its light</p>
        <div class="app-chips">${core.LIGHT_CHOICES.map((l) => `<button type="button" class="app-chip" data-light="${esc(l)}" aria-pressed="${p.light === l}">${esc(l)}</button>`).join("")}</div>
        <label class="app-field"><span>Its light, in your words</span><input data-light-text maxlength="60" placeholder="Or in your words" value="${esc(p.light)}"></label>
        <p class="app-living__eyebrow">How often you water it</p>
        <div class="app-chips"><button type="button" class="app-chip" data-step="-1" aria-label="Water it a day more often">−</button><span class="app-caption" data-every></span><button type="button" class="app-chip" data-step="1" aria-label="Water it a day less often">+</button><button type="button" class="app-chip" data-reset>Back to ${kind.waterEvery}</button></div>
        ${caption(kind.waterNote)}
        ${dayChoiceHtml("Last watered", p.lastWatered)}
        <p class="app-problem" data-problem hidden>That date isn’t one I can read. Write it as 2026-10-20, and not in the future.</p>
        <button type="button" class="app-button" data-save>Save</button>`,
      onMount(body, dialog, close) {
        const lightText = body.querySelector("[data-light-text]");
        const draw = () => {
          body.querySelector("[data-every]").textContent = every === 1 ? "Every day" : `Every ${every} days`;
          body.querySelector("[data-reset]").hidden = every === kind.waterEvery;
          body.querySelectorAll("[data-light]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.light === lightText.value)));
        };
        const last = wireDayChoice(body);
        lightText.addEventListener("input", draw);
        body.addEventListener("click", (event) => {
          const light = event.target.closest("[data-light]");
          if (light) { lightText.value = lightText.value === light.dataset.light ? "" : light.dataset.light; draw(); return; }
          const step = event.target.closest("[data-step]");
          if (step) { every = Math.min(core.WATER_EVERY_MAX, Math.max(core.WATER_EVERY_MIN, every + Number(step.dataset.step))); draw(); return; }
          if (event.target.closest("[data-reset]")) { every = kind.waterEvery; draw(); return; }
          if (!event.target.closest("[data-save]")) return;
          const lastWatered = last.value.trim();
          if (lastWatered && !validDay(lastWatered)) { body.querySelector("[data-problem]").hidden = false; return; }
          change((o) => core.setPlantDetails(o, { name: body.querySelector("[data-name]").value, place: body.querySelector("[data-place]").value, light: lightText.value, waterEvery: every, lastWatered }, nowIso()));
          close();
        });
        draw();
      }
    });
  }

  /** How much, and where it goes: on the altar as a fresh sprig, or into a working (HarvestSheet). */
  function openHarvest() {
    const object = selected();
    const core = P();
    if (!object || !core) return;
    const saved = B().toSaved(object);
    const kind = core.kindOf(saved);
    if (!core.canHarvest(kind)) return;
    const herb = kind.name.toLowerCase();
    const who = core.plantTitle(saved);
    let to = "altar";
    const id = object.dataset.altarObjectId;
    B().openSheet({
      eyebrow: who,
      title: `Harvest the ${herb}`,
      html: `<p class="app-living__eyebrow">How much</p>
        <div class="app-chips">${["A sprig", "A few sprigs", "A handful", "A bundle"].map((a) => `<button type="button" class="app-chip" data-amount="${esc(a.toLowerCase())}">${esc(a)}</button>`).join("")}</div>
        <label class="app-field"><span>How much, in your words</span><input data-amount-text maxlength="60" placeholder="Or in your words: 20 g"></label>
        <p class="app-living__eyebrow">Where it goes</p>
        <div class="app-chips"><button type="button" class="app-chip" data-to="altar">Set it on the altar</button><button type="button" class="app-chip" data-to="working">Into a working</button></div>
        <p class="app-caption" data-to-line></p>
        <label class="app-field"><span>A note</span><input data-note maxlength="400" placeholder="A note (optional)"></label>
        <button type="button" class="app-button" data-save>Harvest</button>`,
      onMount(body, dialog, close) {
        const amount = body.querySelector("[data-amount-text]");
        const draw = () => {
          body.querySelectorAll("[data-to]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.to === to)));
          body.querySelectorAll("[data-amount]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.amount === amount.value)));
          body.querySelector("[data-to-line]").textContent = to === "altar"
            ? `A fresh sprig of ${herb} is set beside the pot. It goes over as any cut sprig does.`
            : `Kept in its journal, for the spell jar or sachet you’re making. Add the ${herb} when you fill it.`;
        };
        amount.addEventListener("input", draw);
        body.addEventListener("click", (event) => {
          const a = event.target.closest("[data-amount]");
          if (a) { amount.value = a.dataset.amount; draw(); return; }
          const where = event.target.closest("[data-to]");
          if (where) { to = where.dataset.to; draw(); return; }
          if (!event.target.closest("[data-save]")) return;
          const harvest = { amount: amount.value, to, note: body.querySelector("[data-note]").value };
          close();
          const target = B().findById(id) || object;
          const plant = B().update(target, (o) => core.harvestPlant(o, harvest, nowIso()));
          schedule();
          if (to === "altar") {
            const sprig = A().pottedSprig.harvestSprig(plant || B().toSaved(target), B().doc().objects, nowIso());
            if (sprig) B().addSaved(sprig, { undo: false, select: false });
            notice(sprig ? `A fresh sprig of ${herb} from ${who} is on the altar.` : `The harvest is in ${who}’s journal.`);
          } else notice(`The harvest is in ${who}’s journal. Add the ${herb} when you fill your spell jar or sachet (Workings).`);
        });
        draw();
      }
    });
  }

  /** A dated entry in its care journal (PlantJournalSheet). */
  function openJournal() {
    const object = selected();
    const core = P();
    if (!object || !core) return;
    const saved = B().toSaved(object);
    let kind = "watered";
    B().openSheet({
      eyebrow: core.plantTitle(saved),
      title: "Add to its journal",
      html: `<div class="app-chips">${core.JOURNAL_KINDS.filter((k) => k.kind !== "harvested").map((k) => `<button type="button" class="app-chip" data-kind="${k.kind}">${esc(k.label)}</button>`).join("")}</div>
        ${caption("A harvest is added with Harvest, so it can go on the altar or into a working.")}
        ${dayChoiceHtml("When", daysAgo(0))}
        <label class="app-field"><span>A note</span><textarea data-note maxlength="400" placeholder="A note (optional)"></textarea></label>
        ${caption("The moon that day is kept with it.")}
        <p class="app-problem" data-problem hidden></p>
        <button type="button" class="app-button" data-save>Add to the journal</button>`,
      onMount(body, dialog, close) {
        const on = wireDayChoice(body);
        const note = body.querySelector("[data-note]");
        const draw = () => {
          body.querySelectorAll("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kind === kind)));
          note.placeholder = kind === "note" ? "Your note" : "A note (optional)";
        };
        body.addEventListener("click", (event) => {
          const k = event.target.closest("[data-kind]");
          if (k) { kind = k.dataset.kind; draw(); return; }
          if (!event.target.closest("[data-save]")) return;
          const problem = body.querySelector("[data-problem]");
          if (!validDay(on.value.trim())) { problem.textContent = "That date isn’t one I can read. Write it as 2026-10-20, and not in the future."; problem.hidden = false; return; }
          if (kind === "note" && !note.value.trim()) { problem.textContent = "Write the note first."; problem.hidden = false; return; }
          change((o) => core.addJournal(o, { kind, on: on.value.trim(), note: note.value }, nowIso()));
          close();
        });
        draw();
      }
    });
  }

  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn’t read that picture."));
    reader.readAsDataURL(file);
  });

  /** A photo of the real plant: uploaded when signed in, as the frame's photo is; a guest's is kept in the altar itself. */
  function choosePhoto() {
    const object = selected();
    if (!object) return;
    const id = object.dataset.altarObjectId;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) return notice("That picture is too large. Choose one under 8 MB.");
      notice("Saving the photo.");
      try {
        const user = typeof global.getCurrentAssetUser === "function" ? await global.getCurrentAssetUser() : null;
        const kept = user && typeof global.uploadUserAsset === "function"
          ? await global.uploadUserAsset(file, P().PLANT_PHOTO_FOLDER, { maxWidth: 1200, maxHeight: 1200 })
          : { url: await readAsDataUrl(typeof global.compressImageFile === "function" ? await global.compressImageFile(file, { maxWidth: 700, maxHeight: 700 }) : file), path: "" };
        if (!kept?.url) return;
        const target = B().findById(id) || object;
        B().update(target, (o) => P().setPlantPhoto(o, kept.url, kept.path || "", nowIso()));
        schedule();
        notice(user ? "The photo is kept with it." : "The photo is kept with it, in this altar on this device. Sign in to keep it with your account.");
      } catch (error) {
        console.error("Plant photo", error);
        notice("The photo couldn’t be saved. Please try again.");
      }
    });
    input.click();
  }

  const actions = {
    "plant-water": () => {
      const saved = change((o) => P().waterPlant(o, nowIso()));
      if (saved) notice(`${P().plantTitle(saved)} is watered.`);
    },
    "plant-stage": (button) => change((o) => P().setPlantStage(o, button.dataset.stage, nowIso())),
    "plant-details": openDetails,
    "plant-harvest": openHarvest,
    "plant-journal": openJournal,
    "plant-journal-remove": (button) => change((o) => P().removeJournal(o, button.dataset.id, nowIso())),
    "plant-journal-all": () => {
      const id = String(selected()?.dataset.altarObjectId || "");
      showAll = showAll === id ? "" : id;
      schedule();
    },
    "plant-photo": choosePhoto,
    "plant-photo-remove": () => change((o) => P().removePlantPhoto(o, nowIso()))
  };

  global.AltarPlants = { panelHtml, actions };
})(typeof window !== "undefined" ? window : globalThis);
