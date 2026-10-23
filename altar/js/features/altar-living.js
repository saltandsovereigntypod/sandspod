/* =========================================================
   ALTAR LIVING PANEL
   The app's object panel for the selected object (app/src/app/(tabs)/altar/
   [altarId].tsx ObjectPanel), shown at the top of the Companion: a candle's
   life (lighting, how long it burns, what's left, a fresh candle in a spent
   one's place), dressing and anointing, carving, reading how it burned and
   its remnant; offerings that wilt; incense; petitions; a charge; jars and
   sachets; spells worked with it; a deity's relationship; its story; where
   tradition puts it; and Look closer.

   Everything is the app's own logic (js/core/altar.js) on the object's saved
   shape (app-altar-bridge.js), so what the app writes (livingState.candle,
   livingState.app, carvings) is what this reads and keeps.
   ========================================================= */

(function initializeAltarLiving(global) {
  "use strict";

  const B = () => global.AltarApp;
  const A = () => global.SaltCore?.altar;
  const esc = (v) => B().esc(v);
  const nowIso = () => new Date().toISOString();
  const HOUR = 3600000;
  const MIN = 60000;
  const DAY = 24 * HOUR;
  const CANDLE_LENGTHS = [10 * MIN, 30 * MIN, HOUR, 2 * HOUR, 3 * HOUR, 4 * HOUR, 6 * HOUR, 8 * HOUR, 12 * HOUR, DAY, 2 * DAY, 3 * DAY, 5 * DAY, 7 * DAY, 9 * DAY];
  const COMMON_OILS = ["Rose", "Lavender", "Cinnamon", "Frankincense", "Rosemary", "Sandalwood", "Myrrh", "Jasmine", "Patchouli", "Vanilla", "Basil", "Bay"];
  const PETITIONS = "altar.petitions";
  const SPELLS = "altar.spells";

  const selected = () => B()?.selected?.() || null;
  const short = (label, fallback) => B().shortLabel(label, fallback);
  const day = (iso) => B().dateShort(iso, { weekday: "short", day: "numeric", month: "short" });

  // ── Craft entries (petitions, spells) ───────────────────────────────────
  const cache = { petitions: [], spells: [], loaded: false };
  async function loadEntries() {
    if (!global.SaltCraft) return;
    try {
      const [petitions, spells] = await Promise.all([global.SaltCraft.list(PETITIONS), global.SaltCraft.list(SPELLS)]);
      cache.petitions = petitions;
      cache.spells = spells;
      cache.loaded = true;
    } catch {
      /* offline or signed out mid-way: the panel shows what it has */
    }
  }
  global.AltarLivingEntries = cache;

  // ── The panel ───────────────────────────────────────────────────────────
  let now = new Date();
  let showAllStory = false;
  let storyFor = "";
  let tonight = null; // { altar, date } while tonight's altar is open (altar-reading.js sets it)

  function panelHtml(object) {
    const core = A();
    const saved = B().toSaved(object);
    const t = now.getTime();
    const minute = Math.floor(t / 60000) * 60000;
    const L = core.livingState;
    const candle = L.isCandle(saved);
    const lit = L.isLit(saved);
    const label = short(saved.label);
    const locked = saved.locked === "true";
    const dressings = candle ? L.dressingsOf(saved) : [];
    const carvings = candle ? L.carvingsOf(saved) : [];
    const incense = core.incense.isIncense(saved) ? core.incense.incenseLife(saved, t) : null;
    const life = candle ? L.candleLife(saved, now) : null;
    const burned = candle ? core.companion.burnedSoFar(saved, now) : 0;
    const toRead = candle && !lit ? core.ceromancy.burnToRead(saved, t) : null;
    const read = candle && !lit && !!core.ceromancy.lastBurn(saved);
    const offering = core.offerings.canHoldOffering(saved) ? core.offerings.offeringFreshness(saved, t) : null;
    const contents = offering ? core.offerings.offeringOf(saved) : null;
    const deityAging = saved.type === "deity" ? core.offerings.agingDeityOffering(core.devotion.offeringsOf(saved, now.toISOString()), t) : null;
    const moonCharge = saved.type === "crystal" || offering?.kind === "water" ? core.moonCharge.moonChargesOf(saved)[0] || null : null;
    const story = core.story.storyLines(saved);
    const summary = core.story.storySummary(saved, now);
    const wax = candle ? core.wax.waxLook(saved, minute) : null;
    const nights = candle ? core.wax.nightCandle(saved, minute) : null;
    const charge = core.charge.chargeOf(saved, minute);
    const attunement = core.attunement.attunementOf(saved);
    const jar = core.spellJar.jarStateOf(saved);
    const sachet = core.sachet.sachetStateOf(saved);
    const relationship = saved.type === "deity" ? core.relationship.deityRelationship(saved, B().doc().objects, now) : null;
    const uid = String(saved.altarObjectId || "");
    const altarId = B().altarId();
    const spells = altarId && uid ? cache.spells.filter((e) => e.data?.altarId === altarId && e.data.objectUid === uid && !e.data.closedAt) : [];
    const petition = core.petitions.isPetitionPaper(saved) ? cache.petitions.find((e) => e.id === core.petitions.petitionEntryOf(saved))?.data || null : null;
    const wisdom = core.layouts.placementWisdom(saved, B().library());
    const canMirror = (() => {
      const objects = B().doc().objects;
      const index = B().objects().indexOf(object);
      return index >= 0 && core.arrange.mirrorPartner(objects, index) != null;
    })();
    const tonightWhy = tonight ? core.tonightExplained.whyThisPiece(saved, core.tonightExplained.tonightTheme(tonight.altar, tonight.date), B().library()) : "";
    if (storyFor !== uid) {
      storyFor = uid;
      showAllStory = false;
    }

    const eyebrow = locked ? "Locked in place" : lit || incense?.lit ? "Burning" : life?.spent ? "Spent" : incense?.ash ? "Ash" : "Living";
    const candleCaption = candle ? [
      lit ? `Burning time ${core.companion.burnDuration(burned)}` : burned > 0 ? `Burned ${core.companion.burnDuration(burned)} in all` : null,
      life?.spent ? "Burned all the way down" : life?.expectedMs ? (burned > 0 || lit ? `About ${core.companion.lifeDuration(life.remainingMs)} left` : `Burns about ${core.companion.lifeDuration(life.expectedMs)}`) : null,
      dressings.length ? `Dressed with ${core.companion.dressingNames(dressings).join(", ")}` : null,
      carvings.length ? `Carved with ${carvings.map((c) => (L.carvingMark(c) ? `the sigil for “${c.text}”` : `“${c.text}”`)).join(", ")}` : null,
      nights && !life?.spent ? nights.line : null
    ].filter(Boolean).join(" · ") : "";
    const chips = B().chips;
    const block = (eyebrowText, body, extra = "") => `<div class="app-block${extra}">${eyebrowText ? `<p class="app-living__eyebrow">${esc(eyebrowText)}</p>` : ""}${body}</div>`;
    const caption = (text) => (text ? `<p class="app-caption">${esc(text)}</p>` : "");
    const out = [];

    out.push(`<div><p class="app-living__eyebrow">${esc(eyebrow)}</p><h3 class="app-living__title">${esc(label)}</h3>
      ${attunement.attuned ? `<p class="app-living__attuned">✦ ${esc(attunement.line)}</p>` : ""}
      ${caption(core.shelf.shelfDescription(saved))}
      ${caption(candleCaption)}</div>`);
    out.push(chips([
      { label: "Look closer", symbol: "◎", action: "closer", hint: `Look closer at ${label}: shown large, with every mark on it` },
      { label: "Spell over days", symbol: "◔", action: "spell", hint: `Start a spell timer with ${label}` }
    ]));

    out.push(global.AltarReading?.practiceHtml?.(saved) || "");
    if (core.frame.isFrame(saved)) out.push(frameHtml(saved));
    if (tonightWhy) out.push(block("Why it’s here tonight", caption(tonightWhy) + chips([{ label: "Swap it", symbol: "⇄", action: "tonight-swap", hint: `Swap ${label} for something with the same correspondence` }])));
    if (charge) out.push(block(core.charge.chargeLine(charge), caption(core.charge.chargeDetail(charge)), charge.level === "faded" ? " app-block--faded" : ""));
    spells.forEach((entry) => {
      const today = core.spells.spellToday(entry.data, now);
      out.push(block(`${entry.data.title} · ${today.label}`, caption([today.instruction, today.waited].filter(Boolean).join(" ")) + (today.status === "tend" ? chips([{ label: "Tended today", symbol: "✓", action: "tend-spell", data: { entry: entry.id }, hint: `Mark today’s tending of ${entry.data.title} done` }]) : "")));
    });
    if (moonCharge) out.push(caption(`Charged under the ${moonCharge.moon || "moon"}, ${B().dateShort(moonCharge.at)}, sitting here.`));
    if (relationship) {
      out.push(block("Your relationship", caption(relationship.summary) + (relationship.reason ? caption(`Here for ${relationship.reason}.`) : "") + relationship.feasts.map((f) => caption(`${f.date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · ${f.name}${f.tradition ? ` (${f.tradition})` : ""}`)).join("")));
    }
    if (deityAging) {
      out.push(block(`Your offering · ${core.offerings.freshnessWord(deityAging.fresh)}`, caption(core.offerings.freshnessLine(deityAging.kind, deityAging.fresh)) + chips([
        { label: "Refresh", symbol: "↻", action: "deity-offering", data: { how: "refresh" }, hint: "Refresh the offering with a fresh one" },
        { label: "Return to nature", symbol: "❧", action: "deity-offering", data: { how: "returned" } },
        { label: "Remove", symbol: "⌫", action: "deity-offering", data: { how: "removed" }, hint: "Clear the offering away" }
      ])));
    }
    if (offering && contents) {
      const holds = core.offerings.holdsOfferings(saved);
      const line = contents.leftAt ? `${offering.stage.name}. Left as it is; refresh it whenever you like.` : core.offerings.freshnessLine(offering.kind, offering);
      out.push(block(`${contents.label || core.offerings.offeringKind(contents.kind)?.label} · ${core.offerings.freshnessWord(offering)}`, caption(line) + chips([
        offering.level !== "lasting" ? { label: "Refresh", symbol: "↻", action: "offering-refresh", pressed: offering.level === "refresh" } : null,
        offering.level !== "lasting" && offering.level !== "fresh" && !contents.leftAt ? { label: "Leave it be", symbol: "☙", action: "offering-leave", hint: "Leave it as it is, and stop asking to tend it" } : null,
        { label: "Return to nature", symbol: "❧", action: "offering-end", data: { how: "returned" } },
        { label: "Remove", symbol: "⌫", action: "offering-end", data: { how: "removed" }, hint: holds ? "Empty the vessel" : "Clear it away" },
        { label: holds ? "Something else" : "What it is", symbol: "✎", action: "offer" }
      ])));
    } else if (core.offerings.holdsOfferings(saved)) {
      out.push(`<button type="button" class="app-button app-button--outline" data-app-action="offer">Set out an offering</button>`);
    }
    if (jar) {
      const since = core.spellJar.daysSinceRenewal(jar, now);
      out.push(block(`Spell jar${jar.intention ? ` · for ${jar.intention.toLowerCase()}` : ""}`, caption(jar.renewals.length ? `Last shaken ${since === 0 ? "today" : `${since} days ago`}.` : "Not shaken yet. A shake now and then wakes it.") + `<button type="button" class="app-button app-button--outline" data-app-action="renew">Shake to renew</button>`));
    }
    if (sachet) {
      const due = core.sachet.feedingDue(sachet, now);
      out.push(block(sachet.carried ? "Sachet · carried" : "Sachet · on the altar", caption(core.sachet.feedingLine(sachet, now)) + chips([
        { label: "Feed it", symbol: "❦", action: "feed", pressed: due, hint: `Feed ${label}${due ? ", it’s due" : ""}` },
        { label: sachet.carried ? "Back on the altar" : "Carry it", symbol: "◌", action: "carry" }
      ])));
    }
    if (incense) {
      const what = incense.lit
        ? `Burning · about ${core.companion.lifeDuration(incense.remainingMs)} left`
        : incense.ash ? "Burned down to ash."
        : incense.burnedMs > 0 ? `Partly burned · about ${core.companion.lifeDuration(incense.remainingMs)} left`
        : `${incense.form === "resin" ? "Resin on charcoal" : incense.form === "cone" ? "A cone" : "A stick"} · burns about ${core.companion.lifeDuration(incense.burnMs)}`;
      out.push(block("", caption(what) + `<button type="button" class="app-button" data-app-action="incense">${incense.lit ? "Put it out" : incense.ash ? "Clear the ash" : "Light the incense"}</button>` + (incense.adjustable ? chips([{ label: "Stick, cone or resin", symbol: "⧗", action: "incense-kind", hint: "Choose what kind of incense it is and how long it burns" }]) : "")));
    }
    if (core.petitions.isPetitionPaper(saved)) {
      const words = petition ? `${petition.words ? `<p class="app-living__glance">${esc(petition.words)}</p>` : ""}${caption([petition.intention ? `For ${petition.intention}` : "", petition.status === "scheduled" ? `To be released ${day(petition.releaseOn)}` : "Waiting in the petition box"].filter(Boolean).join(" · "))}` : caption("A folded petition. Its words are kept in the petition box.");
      out.push(block("", words + `<button type="button" class="app-button app-button--outline" data-app-action="petitions">Burn, bury or release it</button>`));
    }
    if (candle) {
      const parts = [];
      if (life?.spent) {
        parts.push(caption("This candle has burned down. Put a fresh candle in its place to light it again; this one’s burns stay in its history."));
        parts.push(`<button type="button" class="app-button" data-app-action="fresh">Put a fresh candle here</button>`);
      } else {
        parts.push(`<button type="button" class="app-button" data-app-action="light">${lit ? "Snuff the candle" : "Light the candle"}</button>`);
      }
      if (toRead) {
        parts.push(block("How did it burn?", caption("While it’s fresh in your mind: the flame, the smoke and the wax. Candle-readers have long looked to them.") + `<button type="button" class="app-button app-button--outline" data-app-action="read">Read the candle</button>`));
      } else if (read) {
        parts.push(chips([{ label: life?.spent ? "How it burned · its remnant" : "How it burned", symbol: "✧", action: "read" }]));
      }
      if (wax?.line) parts.push(caption(wax.line));
      parts.push(chips([
        life?.adjustable ? { label: "How long it burns", symbol: "⧗", action: "length" } : null,
        !life?.spent ? { label: "Dress & anoint", symbol: "❦", action: "anoint", hint: `Dress and anoint ${label} with oil and herbs` } : null,
        { label: "Dress from the altar", symbol: "❧", action: "dress", hint: "Dress it with a loose herb or oil that’s on the altar" },
        { label: "Carve", symbol: "✎", action: "carve" },
        dressings.length ? { label: "Undress", symbol: "⌫", action: "undress" } : null
      ]));
      out.push(`<div class="app-block">${parts.join("")}</div>`);
    }
    if (story.length || summary) {
      const lines = showAllStory ? story : story.slice(0, 5);
      out.push(block("Its story", caption(summary) + `<ul class="app-story">${lines.map((line) => `<li>${esc(`${B().dateShort(line.at)} · ${line.text}`)}</li>`).join("")}</ul>` + (story.length > 5 ? chips([{ label: showAllStory ? "Show less" : `Show all ${story.length}`, action: "story-all" }]) : "")));
    }
    out.push(global.AltarReading?.pageLinkHtml?.(saved) || "");
    out.push(block("Arrange", caption(wisdom) + chips([
      canMirror ? { label: "Mirror its pair", symbol: "⇆", action: "mirror", disabled: locked, hint: `Move its twin to mirror ${label} across the altar` } : null,
      { label: "Layouts", symbol: "✣", action: "layouts", hint: "Layouts with meaning" }
    ])));
    return out.join("");
  }

  function render() {
    const object = selected();
    const content = document.querySelector(".altar-companion-panel [data-companion-content]");
    let panel = document.querySelector("[data-app-living]");
    if (!object || !A() || !content) {
      panel?.remove();
      return;
    }
    if (!panel || !content.contains(panel)) {
      panel?.remove();
      panel = document.createElement("section");
      panel.className = "app-living";
      panel.dataset.appLiving = "";
      panel.setAttribute("aria-label", "Living state and workings");
      content.prepend(panel);
    }
    now = new Date();
    const focused = panel.contains(document.activeElement) ? document.activeElement?.dataset?.appAction : "";
    try {
      panel.innerHTML = panelHtml(object);
    } catch (error) {
      console.error("Altar living panel", error);
      panel.innerHTML = "";
    }
    if (focused) panel.querySelector(`[data-app-action="${focused}"]`)?.focus();
  }

  let queued = 0;
  function schedule() {
    if (queued) return;
    queued = requestAnimationFrame(() => {
      queued = 0;
      render();
    });
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  const change = (fn, options) => {
    const object = selected();
    if (!object) return null;
    const next = B().update(object, fn, options);
    schedule();
    return next;
  };
  const notice = (text) => B().notice(text);

  function lightSelected() {
    const object = selected();
    if (!object) return;
    const core = A();
    const saved = B().toSaved(object);
    const lighting = core.livingState.isCandle(saved) && !core.livingState.isLit(saved) && !core.livingState.candleLife(saved).spent;
    global.pushAltarUndoSnapshot?.();
    if (core.livingState.isLit(saved) && typeof global.extinguishCandleObject === "function") {
      // The panel asks how it burned, as the app does, in place of the summary dialog.
      global.extinguishCandleObject(object, "manual_extinguish", { showSummary: false });
      global.renderLighting?.();
    } else global.toggleLight?.(object);
    // A candle kept over nights: lighting it is tonight's tending of its spell.
    if (lighting) {
      const uid = saved.altarObjectId;
      cache.spells.filter((e) => e.data?.altarId === B().altarId() && e.data.objectUid === uid && !e.data.closedAt).forEach((e) => tendSpell(e, true));
    }
    schedule();
  }

  async function tendSpell(entry, quiet = false) {
    const core = A();
    const date = new Date();
    if (core.spells.spellToday(entry.data, date).status !== "tend") return;
    const next = core.spells.tickSpell(entry.data, date);
    if (next === entry.data) return;
    entry.data = next;
    try { await global.SaltCraft?.update(SPELLS, entry.id, next); } catch { notice("Couldn’t save that tending. Please try again."); return; }
    const today = core.spells.spellToday(next, date);
    notice(`${quiet ? "Lit for tonight. " : ""}${today.label} of “${next.title}” is tended.`);
    schedule();
  }

  function freshCandle() {
    const object = selected();
    if (!object) return;
    const next = B().update(object, (o) => A().livingState.freshCandle(o, nowIso()));
    if (next) {
      object.classList.remove("is-candle-spent");
      notice(`A fresh ${short(next.label, "candle").toLowerCase()} stands in its place.`);
    }
    schedule();
  }

  function openLength() {
    const object = selected();
    const core = A();
    const saved = B().toSaved(object);
    const life = core.livingState.candleLife(saved);
    const usual = core.livingState.CANDLE_LIFE[life.form] || 0;
    B().openSheet({
      eyebrow: short(saved.label, "Candle"),
      title: "How long it burns",
      html: `<p>${esc(usual ? `A candle like this usually burns about ${core.companion.lifeDuration(usual)}. If yours is bigger or smaller, choose its length before you first light it. Once lit, it goes out on its own when its time is up.` : "Choose about how long your candle burns. Once lit, it goes out on its own when its time is up.")}</p>
        ${B().chips(CANDLE_LENGTHS.map((ms) => ({ label: core.companion.lifeDuration(ms), action: "pick", pressed: ms === life.expectedMs, data: { ms } })))}`,
      onMount(body, dialog, close) {
        body.addEventListener("click", (event) => {
          const button = event.target.closest('[data-app-action="pick"]');
          if (!button) return;
          change((o) => A().livingState.setCandleLife(o, Number(button.dataset.ms), nowIso()));
          close();
        });
      }
    });
  }

  function openCarve() {
    const object = selected();
    const core = A();
    const draw = (body) => {
      const carvings = core.livingState.carvingsOf(B().toSaved(object));
      const isSigil = (c) => !!core.livingState.carvingMark(c);
      body.querySelector("[data-carvings]").innerHTML = carvings.length ? `<p class="app-label">Carved into it</p>${B().chips(carvings.map((c, i) => ({ label: isSigil(c) ? `Sigil: ${c.text}  ×` : `“${c.text}”  ×`, action: "smooth", data: { index: i }, hint: `Smooth away ${isSigil(c) ? `the sigil for ${c.text}` : c.text}` })))}<p class="app-caption">Tap a carving to smooth it away.</p>` : "";
      // Sigils kept from the sigil maker (craft store `eclectic.sigils`, as the app keeps them), ready to carve.
      const carved = new Set(carvings.map((c) => core.livingState.carvingMark(c)?.d).filter(Boolean));
      const box = body.querySelector("[data-carve-sigils]");
      if (box) {
        box.innerHTML = sigils.length
          ? `<div class="app-sigils">${sigils
              .map((k, i) => {
                const mark = core.sigil.markOf(k.sigil);
                const done = !!mark && carved.has(mark.d);
                return `<button type="button" class="app-sigil" data-app-action="carve-sigil" data-index="${i}"${done ? " disabled" : ""} aria-label="${esc(done ? `${k.name}, already carved` : `Carve the sigil for ${k.name}`)}">${core.sigil.sigilSvg(k.sigil, { size: 64, id: `carve-sigil-${i}` })}<span>${esc(done ? "Carved" : k.name)}</span></button>`;
              })
              .join("")}</div>`
          : `<p class="app-caption">Sigils you keep from the <a href="/practice/eclectic/sigil/">sigil maker</a> wait here, ready to carve.</p>`;
      }
    };
    let sigils = [];
    const loadSigils = async (body) => {
      try {
        const entries = global.SaltCraft ? await global.SaltCraft.list(core.sigil.SIGILS) : [];
        sigils = (entries || [])
          .map((e) => ({ name: (e.data && e.data.name) || "My sigil", sigil: core.sigil.readSigil(e.data && e.data.sigil) }))
          .filter((k) => k.sigil);
      } catch {
        sigils = [];
      }
      draw(body);
    };
    B().openSheet({
      eyebrow: "Carve the candle",
      title: short(object.dataset.label, "Candle"),
      html: `<p class="app-caption">A name, a word, a date or a sigil’s name. Keep it short enough to hold in mind.</p>
        <form class="app-field" data-carve-form><label for="carve-word">Word to carve</label>
          <div style="display:flex;gap:8px"><input id="carve-word" name="word" maxlength="${core.livingState.CARVING_MAX}" placeholder="Abundance" autocapitalize="words" autocomplete="off"><button class="app-button" type="submit">Carve</button></div></form>
        <p class="app-label">Or carve a sigil</p>
        <div data-carve-sigils></div>
        <div data-carvings></div>`,
      onMount(body) {
        draw(body);
        loadSigils(body);
        body.querySelector("[data-carve-form]").addEventListener("submit", (event) => {
          event.preventDefault();
          const input = body.querySelector("#carve-word");
          if (!input.value.trim()) return;
          change((o) => core.livingState.carveCandle(o, input.value, nowIso()));
          input.value = "";
          draw(body);
        });
        body.addEventListener("click", (event) => {
          const sigilButton = event.target.closest('[data-app-action="carve-sigil"]');
          if (sigilButton) {
            const kept = sigils[Number(sigilButton.dataset.index)];
            const mark = kept && core.sigil.markOf(kept.sigil);
            if (mark) change((o) => core.livingState.carveCandle(o, kept.name, nowIso(), mark));
            draw(body);
            return;
          }
          const button = event.target.closest('[data-app-action="smooth"]');
          if (!button) return;
          change((o) => core.livingState.uncarveCandle(o, nowIso(), Number(button.dataset.index)));
          draw(body);
        });
      }
    });
  }

  /** Dress & anoint: an oil and herbs, toward you or away (DressingSheet). */
  function openAnoint() {
    const object = selected();
    const core = A();
    const state = { oil: null, typedOil: "", herbs: [], direction: "draw" };
    const apothecaryOils = (Array.isArray(global.apothecaryItems) ? global.apothecaryItems : []).filter((a) => /oil/i.test(String(a.type || a.apothecaryType || ""))).map((a) => a.name).filter(Boolean);
    const oils = [...new Set([...apothecaryOils, ...COMMON_OILS])];
    const herbNames = (() => {
      try {
        return Object.values(core.TRADITIONAL_LIBRARY.herb || {}).map((h) => String(h.DisplayName || h.Name || "")).filter(Boolean).sort();
      } catch {
        return [];
      }
    })();
    const chosen = () => {
      const at = nowIso();
      const list = [];
      const oilName = state.typedOil.trim() || state.oil;
      if (oilName) list.push(core.dressing.dressingEntry("oil", oilName, state.direction, at, B().library()));
      state.herbs.forEach((h) => list.push(core.dressing.dressingEntry("herb", h, state.direction, at, B().library())));
      return list;
    };
    const draw = (body) => {
      const existing = core.livingState.dressingsOf(B().toSaved(object));
      const reading = core.dressing.dressingCorrespondences([...existing, ...chosen()], B().library());
      body.querySelector("[data-oils]").innerHTML = B().chips(oils.map((name) => ({ label: name, action: "oil", pressed: !state.typedOil.trim() && state.oil === name, data: { name } })));
      body.querySelector("[data-herbs]").innerHTML = state.herbs.length ? B().chips(state.herbs.map((h) => ({ label: `${h}  ×`, action: "unherb", data: { name: h }, hint: `Remove ${h}` }))) : "";
      body.querySelector("[data-direction]").innerHTML = B().chips(core.dressing.DIRECTIONS.map((d) => ({ label: d.label, action: "direction", pressed: state.direction === d.id, data: { id: d.id } }))) + `<p class="app-caption">${esc(core.dressing.DIRECTIONS.find((d) => d.id === state.direction)?.how)}</p>`;
      body.querySelector("[data-together]").innerHTML = `<p class="app-label">Together</p><p>${esc(reading.summary)}</p>${existing.length ? `<p class="app-caption">Already on it: ${esc(existing.map((d) => d.label).join(", "))}.</p>` : ""}`;
      body.querySelector("[data-dress]").disabled = !chosen().length;
    };
    B().openSheet({
      eyebrow: "Dress & anoint",
      title: short(object.dataset.label, "Candle"),
      html: `<p class="app-label">An oil</p><div data-oils></div>
        <label class="app-field"><span>Or your own oil</span><input data-typed-oil maxlength="40" placeholder="Or type your own blend"></label>
        <p class="app-label">Herbs to roll it in</p>
        <label class="app-field"><span>Search herbs</span><input data-herb-search list="anoint-herbs" placeholder="Search herbs…" autocomplete="off"></label>
        <datalist id="anoint-herbs">${herbNames.map((h) => `<option value="${esc(h)}"></option>`).join("")}</datalist>
        <div data-herbs></div>
        <p class="app-label">Which way</p><div data-direction></div>
        <div class="app-row" data-together></div>
        <button type="button" class="app-button" data-dress>Dress the candle</button>`,
      onMount(body, dialog, close) {
        draw(body);
        body.querySelector("[data-typed-oil]").addEventListener("input", (event) => { state.typedOil = event.target.value; draw(body); });
        const search = body.querySelector("[data-herb-search]");
        const addHerb = () => {
          const value = search.value.trim();
          if (!value) return;
          if (!state.herbs.some((x) => x.toLowerCase() === value.toLowerCase())) state.herbs = [...state.herbs, value].slice(0, 6);
          search.value = "";
          draw(body);
        };
        search.addEventListener("change", addHerb);
        search.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); addHerb(); } });
        body.addEventListener("click", (event) => {
          const button = event.target.closest("[data-app-action]");
          if (button?.dataset.appAction === "oil") { state.typedOil = ""; body.querySelector("[data-typed-oil]").value = ""; state.oil = state.oil === button.dataset.name ? null : button.dataset.name; draw(body); }
          if (button?.dataset.appAction === "unherb") { state.herbs = state.herbs.filter((h) => h !== button.dataset.name); draw(body); }
          if (button?.dataset.appAction === "direction") { state.direction = button.dataset.id; draw(body); }
          if (event.target.closest("[data-dress]")) {
            const list = chosen();
            if (!list.length) return;
            change((o) => core.dressing.dressWith(o, list, nowIso()));
            close();
            notice("Dressed and anointed. The oil and herbs show on the wax.");
          }
        });
      }
    });
  }

  /** Dress it with a loose herb or oil that's on the altar (DressSheet). */
  function openDressFromAltar() {
    const object = selected();
    const core = A();
    const els = B().objects();
    const ingredients = els.map((el) => ({ el, saved: B().toSaved(el) })).filter(({ saved }) => core.livingState.canDressWith(saved));
    B().openSheet({
      eyebrow: short(object.dataset.label, "Candle"),
      title: "Dress from the altar",
      html: ingredients.length
        ? `<p class="app-caption">A loose herb or an oil that’s on the altar, rubbed onto the candle.</p>${B().chips(ingredients.map(({ saved }, i) => ({ label: short(saved.label, "Ingredient"), action: "ingredient", data: { i } })))}`
        : `<p class="app-caption">Set a loose herb or an oil on the altar first (from the cabinet), then dress the candle with it.</p>`,
      onMount(body, dialog, close) {
        body.addEventListener("click", (event) => {
          const button = event.target.closest('[data-app-action="ingredient"]');
          if (!button) return;
          const ingredient = ingredients[Number(button.dataset.i)];
          change((o) => core.livingState.dressCandle(o, ingredient.saved, nowIso()));
          close();
        });
      }
    });
  }

  /** How did it burn? Its reading, and what's left of it (FlameReadingSheet). */
  function openReading() {
    const object = selected();
    const core = A();
    const C = core.ceromancy;
    const saved = B().toSaved(object);
    const spent = core.livingState.candleLife(saved).spent;
    const input = { flame: "", smoke: [], wax: [], notes: "" };
    const toggle = (key, id) => {
      let list = input[key].includes(id) ? input[key].filter((x) => x !== id) : [...input[key], id];
      if (key === "smoke") list = id === "none" ? (list.includes("none") ? ["none"] : list) : list.filter((x) => x !== "none");
      if (key === "smoke" && id === "toward" && list.includes("away")) list = list.filter((x) => x !== "away");
      if (key === "smoke" && id === "away" && list.includes("toward")) list = list.filter((x) => x !== "toward");
      input[key] = list;
    };
    const draw = (body) => {
      const group = (title, key, signs, picked) => `<div><p class="app-label">${esc(title)}</p>${B().chips(signs.map((s) => ({ label: s.label, action: "sign", pressed: picked(s.id), data: { key, id: s.id } })))}</div>`;
      body.querySelector("[data-signs]").innerHTML = group("The flame", "flame", C.FLAME_SIGNS, (id) => input.flame === id) + group("The smoke", "smoke", C.SMOKE_SIGNS, (id) => input.smoke.includes(id)) + group("The wax", "wax", C.WAX_SIGNS, (id) => input.wax.includes(id));
      const any = !!input.flame || input.smoke.length || input.wax.length;
      const summary = C.readingSummary(input);
      body.querySelector("[data-meaning]").innerHTML = any ? `<div class="app-row" aria-live="polite"><p class="app-label">What readers would say</p>${summary ? `<p class="app-living__glance">${esc(summary)}</p>` : ""}${C.readingLines(input).map((line) => `<p>${esc(line)}</p>`).join("")}</div>` : "";
      const can = any || input.notes.trim();
      body.querySelectorAll("[data-keep]").forEach((b) => { b.disabled = !can; });
      const remnant = C.remnantOf(B().toSaved(object))?.choice || null;
      const rem = body.querySelector("[data-remnant]");
      if (rem) rem.innerHTML = B().chips(C.REMNANT_CHOICES.map((c) => ({ label: c.label, action: "remnant", pressed: remnant === c.id, data: { id: c.id }, hint: `${c.label}: ${c.detail}` })));
    };
    B().openSheet({
      eyebrow: short(saved.label, "Candle"),
      title: "How did it burn?",
      html: `<p class="app-caption">Candle reading is an old folk practice: a way to reflect on a working, not a prophecy. Drafts, wicks and wax explain a lot, and your own sense of it matters most.</p>
        <div data-signs style="display:grid;gap:12px"></div><div data-meaning></div>
        <label class="app-field"><span>Your notes on the burn</span><textarea data-notes placeholder="What you noticed, or felt (optional)"></textarea></label>
        <div class="app-chips" style="justify-content:flex-start"><button type="button" class="app-button" data-keep="candle">Keep this reading</button><button type="button" class="app-button app-button--outline" data-keep="journal">Save to my journal</button></div>
        ${spent ? `<div><p class="app-label">What’s left of it</p><p class="app-caption">A burned-down candle can leave a little wax behind. What will you do with it?</p><div data-remnant></div></div>` : ""}`,
      onMount(body, dialog, close) {
        draw(body);
        body.querySelector("[data-notes]").addEventListener("input", (event) => { input.notes = event.target.value; draw(body); });
        body.addEventListener("click", async (event) => {
          const button = event.target.closest("[data-app-action], [data-keep]");
          if (!button) return;
          if (button.dataset.appAction === "sign") {
            if (button.dataset.key === "flame") input.flame = input.flame === button.dataset.id ? "" : button.dataset.id;
            else toggle(button.dataset.key, button.dataset.id);
            draw(body);
          } else if (button.dataset.appAction === "remnant") {
            const choice = button.dataset.id;
            change((o) => C.setRemnant(o, choice, nowIso()));
            notice(choice === "keep" ? "The remnant is kept." : choice === "bury" ? "The remnant is to be buried." : "The remnant is thrown away.");
            draw(body);
          } else if (button.dataset.keep) {
            await saveReading(object, { ...input }, button.dataset.keep === "journal");
            close();
          }
        });
      }
    });
  }

  async function saveReading(object, input, journal) {
    const core = A();
    const before = B().toSaved(object);
    const label = short(before.label, "Candle");
    B().update(object, (o) => core.ceromancy.recordReading(o, input, nowIso()));
    schedule();
    if (!journal) return notice("Reading kept with the candle. You’ll find it in its story.");
    const reading = core.ceromancy.readingsOf(B().toSaved(object)).slice(-1)[0];
    try {
      const last = core.ceromancy.lastBurn(before);
      const row = await saveJournal({
        title: `Candle reading: ${label}`,
        intention: core.livingState.carvingsOf(before).map((c) => c.text).join(", "),
        signs_and_symbols: core.ceromancy.readingText(input),
        what_happened_during: last ? `The candle burned for ${core.companion.burnDuration(Number(last.durationMs) || 0)}.` : ""
      });
      if (reading && row?.id) B().update(object, (o) => core.ceromancy.linkReadingJournal(o, reading.id, row.id, nowIso()), { undo: false });
      notice("Reading kept with the candle and saved to your journal.");
    } catch {
      notice("Reading kept with the candle, but it couldn’t be saved to your journal. Please try again later.");
    }
  }

  /** A journal entry in My Rituals, as the app's saveJournal writes it. */
  async function saveJournal(answers) {
    const core = A();
    const date = new Date();
    const full = { ...core.ritualLifecycle.blankAnswers(null, date), ...answers };
    const user = typeof global.getCurrentSaltUser === "function" ? global.getCurrentSaltUser() : null;
    const id = global.SaltCraft?.uuid?.() || (global.crypto?.randomUUID ? global.crypto.randomUUID() : String(Date.now()));
    const entry = core.ritualLifecycle.journalPayload({ session: null, answers: full, userId: user?.id || null, id, existing: null, now: date });
    if (!user || !global.db) {
      if (typeof global.saveMyRitual === "function") return global.saveMyRitual(entry);
      throw new Error("Journal unavailable");
    }
    const { data, error } = await global.db.from("user_rituals").upsert(core.ritualRows.journalRow(entry, user.id)).select("*").single();
    if (error) throw error;
    await global.db.from("living_library_entries").upsert(core.ritualRows.journalLibraryEntry(data, user.id, date), { onConflict: "user_id,entity_id" });
    return data;
  }

  function openOffering() {
    const object = selected();
    const core = A();
    const saved = B().toSaved(object);
    const state = { kind: core.offerings.offeringOf(saved)?.kind || null };
    B().openSheet({
      eyebrow: short(saved.label),
      title: "Set out an offering",
      html: `<p class="app-caption">Water and drink last a day or two, bread a few days, fruit a little longer, cut flowers about a week, whole apples and gourds a couple of weeks. Food and flowers are drawn in the bowl, and go over there. Stones, coins and dried herbs keep.</p><div data-kinds></div>
        <label class="app-field"><span>What the offering is</span><input data-label maxlength="60" placeholder="What exactly (optional): red wine, an apple, honey in the comb"></label>
        <button type="button" class="app-button" data-set>Set it out</button>`,
      onMount(body, dialog, close) {
        const draw = () => {
          body.querySelector("[data-kinds]").innerHTML = B().chips(core.offerings.OFFERING_KINDS.map((k) => ({ label: k.label, action: "kind", pressed: state.kind === k.id, data: { id: k.id } })));
          body.querySelector("[data-set]").disabled = !state.kind;
        };
        draw();
        body.addEventListener("click", (event) => {
          const kind = event.target.closest('[data-app-action="kind"]');
          if (kind) { state.kind = kind.dataset.id; draw(); }
          if (event.target.closest("[data-set]") && state.kind) {
            const label = body.querySelector("[data-label]").value;
            change((o) => core.offerings.setOffering(o, state.kind, label, nowIso()));
            close();
          }
        });
      }
    });
  }

  function endOffering(how) {
    const object = selected();
    const core = A();
    const saved = B().toSaved(object);
    const contents = core.offerings.offeringOf(saved);
    if (!contents) return;
    const what = contents.label || core.offerings.offeringKind(contents.kind)?.label.toLowerCase() || "offering";
    if (core.offerings.holdsOfferings(saved)) {
      change((o) => core.offerings.endOffering(o, how, nowIso()));
      notice(how === "returned" ? `Returned the ${what} to nature. The vessel is empty now.` : `Cleared away the ${what}.`);
      return;
    }
    // A sprig is the offering itself: it leaves the altar, and the altar's log remembers it.
    const name = short(saved.label, "Sprig");
    B().removeEl(object);
    logAltar(how === "returned" ? `${name} was returned to nature.` : `${name} was cleared away.`);
    notice(how === "returned" ? `${name} is returned to nature and off the altar.` : `${name} is cleared away.`);
  }

  function logAltar(text) {
    const id = B().altarId();
    if (id) global.SaltCraft?.add("altar.history", { altarId: id, text, at: nowIso() }).catch(() => {});
  }

  function deityOffering(action) {
    const core = A();
    const object = selected();
    const saved = B().toSaved(object);
    const current = core.offerings.agingDeityOffering(core.devotion.offeringsOf(saved, nowIso()), Date.now());
    if (!current) return;
    const { offering } = current;
    const status = action === "refresh" ? "Completed" : action === "returned" ? "Returned to nature" : "Removed";
    change((o) => {
      const at = nowIso();
      const done = core.devotion.updateOffering(o, offering.id, {
        status, customStatus: "",
        response: offering.perceivedResponse ? core.devotion.humanize(offering.perceivedResponse) : "",
        responseNotes: offering.responseNotes || "",
        followUpNotes: action === "refresh" ? "Refreshed with a fresh offering." : offering.followUpNotes || "",
        completedAt: at
      }, at);
      if (action !== "refresh") return done;
      const items = offering.items || [];
      return core.devotion.recordOffering(done, {
        types: offering.types || [],
        supports: items.filter((i) => !i.custom).map((i) => ({ id: String(i.id || i.label), label: i.label })),
        customItems: items.filter((i) => i.custom).map((i) => i.label).join(", "),
        intention: offering.intention || "",
        message: "A fresh offering in place of the last.",
        status: "Present on altar", customStatus: "", response: "", responseNotes: "", occurredAt: at
      }, at);
    });
    notice(action === "refresh" ? "A fresh offering is set out." : action === "returned" ? "The offering is returned to nature." : "The offering is cleared away.");
  }

  function toggleIncense() {
    const core = A();
    const object = selected();
    const life = core.incense.incenseLife(B().toSaved(object));
    change((o) => (life.lit ? core.incense.putOutIncense(o, nowIso()) : life.ash ? core.incense.clearAsh(o, nowIso()) : core.incense.lightIncense(o, nowIso())));
    if (life.ash) notice("The ash is cleared. Fresh incense is ready to light.");
    scheduleIncense();
  }

  function openIncenseKind() {
    const core = A();
    const object = selected();
    B().openSheet({
      eyebrow: short(object.dataset.label, "Incense"),
      title: "The incense",
      html: `<p class="app-caption">A stick usually burns half an hour or more, a cone about twenty minutes, and resin on charcoal close to an hour. Once lit, it goes out on its own and leaves ash.</p><div data-incense></div>`,
      onMount(body, dialog, close) {
        const draw = () => {
          const saved = B().toSaved(object);
          const form = core.incense.incenseFormOf(saved);
          const info = core.incense.incenseFormInfo(form);
          const burnMs = core.incense.incenseLife(saved).burnMs;
          body.querySelector("[data-incense]").innerHTML = `<p class="app-label">What it is</p>${B().chips(core.incense.INCENSE_FORMS.map((f) => ({ label: f.label, action: "form", pressed: f.id === form, data: { id: f.id } })))}<p class="app-label">How long it burns</p>${B().chips(info.lengths.map((ms) => ({ label: core.companion.lifeDuration(ms), action: "length", pressed: ms === burnMs, data: { ms } })))}`;
        };
        draw();
        body.addEventListener("click", (event) => {
          const button = event.target.closest("[data-app-action]");
          if (button?.dataset.appAction === "form") { change((o) => core.incense.setIncenseForm(o, button.dataset.id, nowIso())); draw(); }
          if (button?.dataset.appAction === "length") { change((o) => core.incense.setIncenseLength(o, Number(button.dataset.ms), nowIso())); close(); }
        });
      }
    });
  }

  // Incense goes out on its own and leaves ash; candles are the lifecycle's.
  let incenseTimer = 0;
  function scheduleIncense() {
    clearTimeout(incenseTimer);
    const core = A();
    if (!core) return;
    const lit = B().objects().map((el) => ({ el, saved: B().toSaved(el) })).filter(({ saved }) => core.incense.isIncense(saved) && core.incense.incenseLife(saved).lit);
    if (!lit.length) return;
    const next = Math.min(...lit.map(({ saved }) => Date.now() + core.incense.incenseLife(saved).remainingMs));
    incenseTimer = setTimeout(() => {
      const ash = [];
      lit.forEach(({ el }) => {
        const before = B().toSaved(el);
        const after = core.incense.settleIncense(before, nowIso());
        if (after !== before) {
          B().apply(el, after, before);
          if (core.incense.incenseLife(after).ash) ash.push(short(before.label, "Incense"));
        }
      });
      if (ash.length) notice(`${ash.join(" and ")} burned down to ash.`);
      schedule();
      scheduleIncense();
    }, Math.min(Math.max(250, next - Date.now() + 250), 6 * HOUR));
  }

  // ── Petitions ───────────────────────────────────────────────────────────
  function needSaved(what) {
    if (B().altarId()) return false;
    notice(`Save this altar first; its ${what} is kept with it.`);
    global.saveAltar?.().then((id) => id && notice("Saved. Now you can open it again."));
    return true;
  }

  function openWritePetition() {
    if (needSaved("petition box")) return;
    const core = A();
    const P = core.petitions;
    const candles = B().objects().map((el) => B().toSaved(el)).filter((o) => core.livingState.isCandle(o) && !core.livingState.candleLife(o).spent && o.altarObjectId);
    const state = { timing: "now", candle: null };
    B().openSheet({
      eyebrow: "Petition paper",
      title: "Write a petition",
      html: `<p class="app-caption">Write plainly, in the present tense, as if it’s already on its way. Fold it toward you to draw something in, away from you to send something off.</p>
        <label class="app-field"><span>Petition title</span><input data-title maxlength="${P.TITLE_MAX}" placeholder="A name for it: Open roads"></label>
        <label class="app-field"><span>The words of your petition</span><textarea data-words maxlength="${P.WORDS_MAX}" placeholder="The words of your petition"></textarea></label>
        <label class="app-field"><span>Intention</span><input data-intention maxlength="60" placeholder="Its intention, in a word or two (optional)"></label>
        <p class="app-label">Moon timing</p><div data-timing></div>
        <p class="app-label">Where it goes</p><div data-place></div>
        <button type="button" class="app-button" data-place-it>Place the petition</button>`,
      onMount(body, dialog, close) {
        const draw = () => {
          body.querySelector("[data-timing]").innerHTML = B().chips(P.PETITION_TIMINGS.map((t) => ({ label: t.label, action: "timing", pressed: state.timing === t.id, data: { id: t.id }, hint: `${t.label}: ${t.detail}` }))) + `<p class="app-caption">${esc(P.PETITION_TIMINGS.find((t) => t.id === state.timing)?.detail)}</p>`;
          body.querySelector("[data-place]").innerHTML = B().chips([{ label: "In the petition box", action: "candle", pressed: state.candle == null, data: { id: "" } }, ...candles.map((c) => ({ label: `Under ${short(c.label, "Candle")}`, action: "candle", pressed: state.candle === c.altarObjectId, data: { id: c.altarObjectId } }))]);
          body.querySelector("[data-place-it]").disabled = !body.querySelector("[data-title]").value.trim() && !body.querySelector("[data-words]").value.trim();
        };
        draw();
        body.addEventListener("input", draw);
        body.addEventListener("click", async (event) => {
          const button = event.target.closest("[data-app-action]");
          if (button?.dataset.appAction === "timing") { state.timing = button.dataset.id; draw(); }
          if (button?.dataset.appAction === "candle") { state.candle = button.dataset.id || null; draw(); }
          if (event.target.closest("[data-place-it]")) {
            const input = { title: body.querySelector("[data-title]").value, words: body.querySelector("[data-words]").value, intention: body.querySelector("[data-intention]").value, timing: state.timing };
            close();
            await writePetition(input, state.candle);
          }
        });
      }
    });
  }

  async function writePetition(input, candleId) {
    const core = A();
    const P = core.petitions;
    const altarId = B().altarId();
    const date = new Date();
    const candleEl = candleId ? B().findById(candleId) : null;
    const candle = candleEl ? B().toSaved(candleEl) : null;
    const petition = { ...P.newPetition(altarId, input, date), place: candle ? "candle" : "box", candleId: candle ? candleId : "" };
    let entry;
    try {
      entry = await global.SaltCraft.add(PETITIONS, petition);
    } catch {
      notice("Couldn’t keep that petition. Please try again.");
      return;
    }
    const paper = P.petitionObject(petition, entry.id, B().doc().objects, date.toISOString(), candle);
    B().addSaved(paper, { select: false });
    if (candleEl) B().update(candleEl, (o) => core.livingState.logAppEvent(o, { kind: "petition", text: `The petition “${petition.title}” was folded beneath it.` }, date.toISOString()), { undo: false });
    try { await global.SaltCraft.update(PETITIONS, entry.id, { ...petition, objectId: paper.altarObjectId }); } catch { /* the paper still finds it by its entry */ }
    await loadEntries();
    notice(candle ? `“${petition.title}” is folded under ${short(candle.label, "the candle")}.` : `“${petition.title}” is on the altar and in the petition box.`);
    schedule();
  }

  async function finishPetition(entry, how) {
    const core = A();
    const date = new Date();
    try { await global.SaltCraft.update(PETITIONS, entry.id, core.petitions.finishPetition(entry.data, how, date)); } catch { notice("Couldn’t update the petition box. Please try again."); return; }
    const words = how === "burned" ? "burned" : how === "buried" ? "buried" : "released";
    // The paper leaves the altar; the candle it sat under remembers it.
    const candleEl = entry.data.candleId ? B().findById(entry.data.candleId) : null;
    if (candleEl) B().update(candleEl, (o) => core.livingState.logAppEvent(o, { kind: "petition", text: `The petition “${entry.data.title}” was ${words}.` }, date.toISOString()));
    const paperEl = B().objects().find((el) => {
      const saved = B().toSaved(el);
      return core.petitions.isPetitionPaper(saved) && core.petitions.petitionEntryOf(saved) === entry.id;
    });
    if (paperEl) B().removeEl(paperEl, { undo: false });
    await loadEntries();
    notice(`“${entry.data.title}” is ${words}. It stays in the box’s history.`);
    schedule();
  }

  async function openPetitionBox() {
    if (needSaved("petition box")) return;
    await loadEntries();
    const core = A();
    const P = core.petitions;
    let mode = { kind: "list" };
    const sheet = B().openSheet({ eyebrow: "This altar", title: "Petition box", html: "" });
    const titleEl = sheet.dialog.querySelector(".app-sheet__title");
    const draw = () => {
      const box = P.petitionBox(cache.petitions, B().altarId());
      const date = new Date();
      titleEl.textContent = mode.kind === "burn" ? "The burn bowl" : mode.kind === "night" ? "Choose a night" : mode.kind === "bury" ? "Bury it" : "Petition box";
      if (mode.kind === "night") {
        const nights = P.releaseNights(date, B().place()?.latitude ?? null);
        sheet.setBody(`<p>${esc(`When will you release “${mode.entry.data.title}”? It stays in the box until then.`)}</p>${nights.map((n, i) => `<div class="app-row"><span class="app-row__title">${esc(n.label)}</span><span class="app-caption">${esc(`${n.why}. ${day(n.date.toISOString())}`)}</span><button type="button" class="app-button app-button--outline" data-night="${i}">Choose</button></div>`).join("")}<button type="button" class="app-chip" data-back>Back to the box</button>`);
        sheet.body.querySelectorAll("[data-night]").forEach((b) => b.addEventListener("click", async () => {
          const night = nights[Number(b.dataset.night)];
          try { await global.SaltCraft.update(PETITIONS, mode.entry.id, P.schedulePetition(mode.entry.data, night.date, night.why)); } catch { notice("Couldn’t save that. Please try again."); }
          notice(`“${mode.entry.data.title}” will wait for ${night.label.toLowerCase()}.`);
          await loadEntries();
          mode = { kind: "list" };
          draw();
        }));
      } else if (mode.kind === "bury") {
        sheet.setBody(`<p>Burying gives a petition to the earth to work slowly: good for growth, healing and things that need time. Fold it small, use plain paper with no plastic or glitter, and bury it where it can rot down, in a garden, a pot of soil or at the foot of a tree you know.</p><button type="button" class="app-button" data-buried>I’ve buried it</button><button type="button" class="app-chip" data-back>Not yet</button>`);
        sheet.body.querySelector("[data-buried]").addEventListener("click", async () => { const e = mode.entry; mode = { kind: "list" }; await finishPetition(e, "buried"); draw(); });
      } else if (mode.kind === "burn") {
        burnBowl(sheet.body, mode.entry.data, async () => { const e = mode.entry; mode = { kind: "list" }; await finishPetition(e, "burned"); draw(); }, () => { mode = { kind: "list" }; draw(); });
        return;
      } else {
        const cards = box.open.map((entry) => {
          const p = entry.data;
          const due = P.releaseDue(p, date);
          const timing = P.PETITION_TIMINGS.find((t) => t.id === p.timing);
          return `<div class="app-row"><span class="app-row__title">${esc(p.title)}</span>${p.words ? `<p class="app-living__glance">${esc(p.words)}</p>` : ""}
            <p class="app-caption">${esc([p.intention ? `For ${p.intention}` : "", p.timing !== "now" && timing ? `Timed for the ${timing.label}${p.timingAt ? `, ${day(p.timingAt)}` : ""}` : "", p.place === "candle" ? "Folded under a candle" : "", `Written ${day(p.writtenAt)}`].filter(Boolean).join(" · "))}</p>
            ${p.status === "scheduled" ? `<p class="app-caption"${due ? ' style="color:var(--gold)"' : ""}>${esc(due ? `Its night has come: ${p.releaseWhy.toLowerCase()}.` : `To be released ${day(p.releaseOn)}: ${p.releaseWhy.toLowerCase()}.`)}</p>` : ""}
            ${B().chips([
              { label: "Burn", symbol: "✺", action: "burn", data: { id: entry.id }, hint: `Burn ${p.title}` },
              { label: "Bury", symbol: "◒", action: "bury", data: { id: entry.id }, hint: `Bury ${p.title}` },
              ...(p.status === "scheduled"
                ? [{ label: due ? "Release it now" : "Release now", symbol: "☾", action: "release", pressed: due, data: { id: entry.id } }, { label: "Another night", symbol: "☽", action: "night", data: { id: entry.id } }]
                : [{ label: "Release on a night", symbol: "☽", action: "night", data: { id: entry.id }, hint: `Choose a night to release ${p.title}` }])
            ])}</div>`;
        }).join("");
        sheet.setBody(`<button type="button" class="app-button" data-write>Write a petition</button>
          ${box.open.length ? cards : `<p class="app-caption">The box is empty. Petitions you write wait here, and on the altar, until you burn, bury or release them.</p>`}
          ${box.history.length ? `<div><p class="app-label">Done</p>${box.history.map((entry) => `<p class="app-caption">${esc(`${P.PETITION_ENDS[entry.data.status] || "Done"} ${day(entry.data.doneAt)}: ${entry.data.title}`)}</p>`).join("")}</div>` : ""}`);
        sheet.body.querySelector("[data-write]").addEventListener("click", () => { sheet.close(); openWritePetition(); });
        sheet.body.querySelectorAll("[data-app-action]").forEach((b) => b.addEventListener("click", async () => {
          const entry = box.open.find((e) => e.id === b.dataset.id);
          if (!entry) return;
          const action = b.dataset.appAction;
          if (action === "release") { await finishPetition(entry, "released"); draw(); return; }
          mode = { kind: action, entry };
          draw();
        }));
      }
      sheet.body.querySelector("[data-back]")?.addEventListener("click", () => { mode = { kind: "list" }; draw(); });
    };
    draw();
  }

  /** Burn the petition in a heatproof bowl here, with the fire-safety words for doing it for real. */
  function burnBowl(body, petition, onBurned, onBack) {
    const core = A();
    const reduce = global.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    body.innerHTML = `<div class="app-burn" role="img" aria-label="${esc(`The petition “${petition.title}” in a heatproof bowl.`)}">
        <svg viewBox="0 0 220 150" width="220" height="150" aria-hidden="true"><defs><radialGradient id="bowl-in" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="rgb(70,66,60)"/><stop offset="1" stop-color="rgb(30,28,26)"/></radialGradient>
          <radialGradient id="bowl-fire" cx="50%" cy="75%" r="70%"><stop offset="0" stop-color="rgb(255,250,220)"/><stop offset="0.35" stop-color="rgb(255,190,70)"/><stop offset="0.75" stop-color="rgb(240,100,30)" stop-opacity="0.7"/><stop offset="1" stop-color="rgb(240,100,30)" stop-opacity="0"/></radialGradient></defs>
          <ellipse cx="110" cy="92" rx="92" ry="26" fill="url(#bowl-in)"/>
          <ellipse class="app-burn__ash" cx="110" cy="96" rx="34" ry="8" fill="rgb(150,146,138)" opacity="0"/>
          <g class="app-burn__paper" transform="translate(110 84) rotate(-8)"><path d="M-35 -13 L35 -15 L37 12 L-33 14 Z" fill="rgb(236,224,192)"/><path d="M-25 -6 L18 -7 M-25 0 L13 -1 M-25 6 L20 5" stroke="rgba(110,60,40,0.5)" stroke-width="1.2" stroke-linecap="round"/></g>
          <path class="app-burn__fire" d="M110 30 C124 52 134 62 131 80 C128 94 92 94 89 80 C86 66 100 56 110 30 Z" fill="url(#bowl-fire)" opacity="0"/>
          <path d="M18 92 Q24 140 110 142 Q196 140 202 92 Q196 118 110 118 Q24 118 18 92 Z" fill="rgb(54,50,46)" stroke="rgba(226,195,109,0.3)"/>
        </svg></div>
      <div data-burn-words><p>Hold the words in mind once more, then let the fire carry them.</p>
        <button type="button" class="app-button" data-burn>Burn it here</button>
        <div class="app-honesty"><p class="app-label">To do it for real</p><p>${esc(core.petitions.FIRE_SAFETY)}</p></div>
        <button type="button" class="app-chip" data-back>Back to the box</button></div>`;
    body.querySelector("[data-back]").addEventListener("click", onBack);
    body.querySelector("[data-burn]").addEventListener("click", () => {
      const words = body.querySelector("[data-burn-words]");
      words.innerHTML = `<p class="app-caption" aria-live="polite">Burning…</p>`;
      const art = body.querySelector(".app-burn");
      art.setAttribute("aria-label", "The petition is burning in the bowl.");
      const paper = body.querySelector(".app-burn__paper");
      const fire = body.querySelector(".app-burn__fire");
      const ash = body.querySelector(".app-burn__ash");
      const finish = () => {
        art.setAttribute("aria-label", "The petition has burned to ash in the bowl.");
        paper.style.opacity = "0";
        fire.style.opacity = "0";
        ash.style.opacity = "1";
        words.innerHTML = `<p aria-live="polite">It’s ash now. Scatter the cooled ash to the wind, bury it, or wash it away with water, and let it go.</p><button type="button" class="app-button" data-done>It’s done</button>`;
        words.querySelector("[data-done]").addEventListener("click", onBurned);
        words.querySelector("[data-done]").focus();
      };
      if (reduce || !paper.animate) return finish();
      const BURN_MS = 4200;
      paper.animate([{ opacity: 1, transform: "translate(110px,84px) rotate(-8deg) scale(1)" }, { opacity: 0.35, offset: 0.75 }, { opacity: 0, transform: "translate(110px,84px) rotate(-8deg) scale(0.25)" }], { duration: BURN_MS, easing: "ease-in-out", fill: "forwards" });
      fire.animate([{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0.9, offset: 0.8 }, { opacity: 0 }], { duration: BURN_MS, fill: "forwards" });
      fire.animate([{ transform: "scaleY(0.9)" }, { transform: "scaleY(1.12)" }], { duration: 290, iterations: Math.ceil(BURN_MS / 290), direction: "alternate", transformOrigin: "110px 90px" });
      fire.style.transformOrigin = "110px 90px";
      ash.animate([{ opacity: 0 }, { opacity: 0.2, offset: 0.6 }, { opacity: 1 }], { duration: BURN_MS, fill: "forwards" }).onfinish = finish;
    });
  }

  // ── Jars and sachets ────────────────────────────────────────────────────
  function shakeJar() {
    const core = A();
    B().openSheet({
      eyebrow: short(selected()?.dataset.label, "Spell jar"),
      title: "Shake to renew",
      html: `<p class="app-caption">Hold it, shake it, and say again what it’s for. A note of how it feels now, if you like.</p><label class="app-field"><span>A note (optional)</span><input data-note maxlength="200" placeholder="Still warm; the herbs have settled"></label><button type="button" class="app-button" data-shake>Shaken and renewed</button>`,
      onMount(body, dialog, close) {
        body.querySelector("[data-shake]").addEventListener("click", () => {
          change((o) => core.spellJar.shakeToRenew(o, nowIso(), body.querySelector("[data-note]").value));
          close();
          notice("Shaken and renewed.");
        });
      }
    });
  }
  function feedSachet() {
    const core = A();
    B().openSheet({
      eyebrow: short(selected()?.dataset.label, "Sachet"),
      title: "Feed it",
      html: `<p class="app-caption">A drop of oil, a breath, a pinch of something it likes: given on its day, it keeps the charm awake.</p>${B().chips(core.sachet.FEEDING_CHOICES.map((c) => ({ label: c, action: "feed", data: { what: c } })))}`,
      onMount(body, dialog, close) {
        body.addEventListener("click", (event) => {
          const b = event.target.closest('[data-app-action="feed"]');
          if (!b) return;
          change((o) => core.sachet.feedSachet(o, nowIso(), b.dataset.what));
          close();
          notice("Fed.");
        });
      }
    });
  }

  // ── An ancestor frame (connect/FrameSheets.tsx) ─────────────────────────
  function frameHtml(saved) {
    const core = A();
    const frame = core.frame.frameOf(saved);
    const known = !!core.frame.frameArtOf(saved)?.opening;
    const line = frame.photo
      ? frame.name ? `In memory of ${frame.name}${frame.dates ? `, ${frame.dates}` : ""}.` : "Add a name and dates to show beneath it."
      : "Choose a photo of your own to set in the frame. It is cropped to fill the opening.";
    return `<div class="app-block"><p class="app-living__eyebrow">The photo</p><p class="app-caption">${esc(line)}</p>${known ? "" : `<p class="app-caption">${esc("This frame’s picture has no opening the altar knows of, so the photo can’t be shown in it yet.")}</p>`}${B().chips([
      { label: frame.photo ? "Change the photo" : "Choose a photo", symbol: "▣", action: "frame-photo" },
      frame.photo ? { label: "Old sepia", symbol: "☙", action: "frame-aged", pressed: frame.aged, hint: frame.aged ? "Show the photo as it is" : "Give the photo an old sepia look" } : null,
      { label: frame.name ? "Name and dates" : "Add a name", symbol: "✎", action: "frame-name" },
      frame.photo ? { label: "Take the photo out", symbol: "⌫", action: "frame-remove" } : null
    ])}</div>`;
  }

  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn’t read that picture."));
    reader.readAsDataURL(file);
  });

  /** A photo of your own for the frame: uploaded when signed in, as other pictures are; a guest's is kept in the altar itself. */
  function chooseFramePhoto() {
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
          ? await global.uploadUserAsset(file, A().frame.FRAME_PHOTO_FOLDER, { maxWidth: 1200, maxHeight: 1200 })
          : { url: await readAsDataUrl(typeof global.compressImageFile === "function" ? await global.compressImageFile(file, { maxWidth: 700, maxHeight: 700 }) : file), path: "" };
        if (!kept?.url) return;
        const target = B().objects().find((o) => o.dataset.altarObjectId === id) || object;
        B().update(target, (o) => A().frame.setFramePhoto(o, kept.url, kept.path || "", nowIso()));
        schedule();
        notice(user ? "The photo is in the frame." : "The photo is in the frame, kept with this altar on this device. Sign in to keep it with your account.");
      } catch (error) {
        console.error("Frame photo", error);
        notice("The photo couldn’t be saved. Please try again.");
      }
    });
    input.click();
  }

  /** Name the frame and give its dates, or take both from one of your Ancestors (FrameNameSheet). */
  async function openFrameName() {
    const object = selected();
    if (!object) return;
    const core = A();
    const saved = B().toSaved(object);
    const frame = core.frame.frameOf(saved);
    const link = core.livingState.appStateOf(saved).ancestor;
    let linked = link?.id ? { id: link.id, name: String(link.name || "") } : null;
    let people = [];
    try { people = (await global.SaltCraft?.list(core.ancestors.ANCESTORS)) || []; } catch { people = []; }
    people.sort((a, b) => core.ancestors.normalizeAncestor(a.data).name.localeCompare(core.ancestors.normalizeAncestor(b.data).name));
    const rows = people.map((entry) => {
      const caption = core.frame.captionFromAncestor(entry);
      const detail = [core.ancestors.normalizeAncestor(entry.data).relation, caption.dates].filter(Boolean).join(" · ");
      return `<button type="button" class="app-row" style="text-align:left;color:inherit;font:inherit;cursor:pointer" aria-pressed="${linked?.id === entry.id}" data-who="${esc(entry.id)}"><span class="app-row__title">${esc(caption.name || "Unnamed")}</span>${detail ? `<span class="app-caption">${esc(detail)}</span>` : ""}</button>`;
    }).join("");
    B().openSheet({
      eyebrow: "Ancestor frame",
      title: "In memory of",
      html: `<label class="app-field"><span>Their name</span><input data-name maxlength="80" placeholder="Their name" value="${esc(frame.name)}"></label>
        <label class="app-field"><span>Their dates</span><input data-dates maxlength="60" placeholder="Their dates (optional): 1932–2019" value="${esc(frame.dates)}"></label>
        <p class="app-caption">Shown beneath the photo when you look closer.</p>
        ${people.length ? `<p class="app-living__eyebrow">From your Ancestors</p><div class="app-rows">${rows}</div>` : ""}
        <button type="button" class="app-button" data-save>Save</button>`,
      onMount(body, dialog, close) {
        body.addEventListener("click", (event) => {
          const who = event.target.closest("[data-who]");
          if (who) {
            const entry = people.find((e) => e.id === who.dataset.who);
            if (!entry) return;
            const caption = core.frame.captionFromAncestor(entry);
            body.querySelector("[data-name]").value = caption.name;
            body.querySelector("[data-dates]").value = caption.dates;
            linked = caption.ancestor;
            body.querySelectorAll("[data-who]").forEach((row) => row.setAttribute("aria-pressed", String(row === who)));
            return;
          }
          if (!event.target.closest("[data-save]")) return;
          const name = body.querySelector("[data-name]").value;
          const dates = body.querySelector("[data-dates]").value;
          // Typing a different name unlinks it from the ancestor it was chosen from.
          const ancestor = linked && linked.name === name.trim() ? linked : null;
          change((o) => core.frame.setFrameCaption(o, { name, dates, ancestor }, nowIso()));
          close();
          notice(name.trim() ? `The frame is named for ${name.trim()}.` : "The name is taken from the frame.");
        });
      }
    });
  }

  // ── Look closer (CloseUpSheet) ──────────────────────────────────────────
  function closeUpLines(saved, t) {
    const core = A();
    const lines = [];
    if (core.livingState.isCandle(saved)) {
      lines.push(core.wax.burnedDownLine(saved, t));
      const melt = core.wax.meltLine(saved, t);
      if (melt) lines.push(melt);
      const wax = core.wax.waxLook(saved, t);
      if (wax.line) lines.push(wax.line);
      const progress = core.wax.burnProgress(saved, t);
      core.livingState.carvingsOf(saved).forEach((carving) => lines.push(core.dressing.carvingLine(carving, progress)));
      const dressings = core.livingState.dressingsOf(saved);
      if (dressings.length) lines.push(`Dressed with ${dressings.map((d) => d.label).filter(Boolean).join(", ")}.`);
    }
    if (core.incense.isIncense(saved)) {
      const incense = core.incense.incenseLife(saved, t);
      if (incense.lit) lines.push("Smoke is rising from it.");
      else if (incense.ash) lines.push("Burned to ash.");
    }
    const fresh = core.offerings.offeringFreshness(saved, t);
    if (fresh) lines.push(core.offerings.freshnessLine(fresh.kind, fresh));
    const charge = core.charge.chargeOf(saved, t);
    if (charge && charge.strength > 0) lines.push(`A ${charge.level === "strong" ? "strong" : "settling"} charge glows about it. ${core.charge.chargeDetail(charge)}`);
    return lines.filter(Boolean);
  }

  function openCloser(object = selected()) {
    if (!object) return;
    const saved = B().toSaved(object);
    const lines = closeUpLines(saved, Date.now());
    const label = short(saved.label);
    // In memory of…: an ancestor frame's name and dates, set beneath it.
    const memory = A().frame.frameCaption(saved);
    const memoryWords = memory ? [memory.title, memory.dates].filter(Boolean).join(", ") : "";
    const stage = document.querySelector("[data-altar-stage]");
    const background = stage?.dataset.background || "";
    let refresh = 0;
    B().openSheet({
      eyebrow: "Look closer",
      title: label,
      html: `<div class="app-closeup" role="img" aria-label="${esc(`${label}, close up. ${memoryWords ? `${memoryWords}. ` : ""}${lines.join(" ")}`)}" style="position:relative;overflow:hidden;border-radius:14px;${background ? `background:linear-gradient(rgba(5,8,6,.55),rgba(5,8,6,.55)),url('${esc(background)}') center/cover` : "background:#0b0f0c"}"><div data-closeup-stage style="position:relative"></div></div>
        ${memory ? `<div class="app-closeup__caption"><p>${esc(memory.title)}</p>${memory.dates ? `<p class="app-caption">${esc(memory.dates)}</p>` : ""}</div>` : ""}
        ${lines.length ? `<div>${lines.map((line) => `<p class="app-caption">${esc(line)}</p>`).join("")}</div>` : ""}`,
      onMount(body) {
        const holder = body.querySelector("[data-closeup-stage]");
        const copy = global.createSavedObject?.({ ...saved, zIndex: "1" });
        if (!copy) return;
        copy.removeAttribute("aria-label");
        copy.tabIndex = -1;
        copy.setAttribute("aria-hidden", "true");
        copy.disabled = true;
        const big = Math.min(3.2, Math.max(1.6, 220 / Math.max(80, object.offsetHeight)));
        copy.style.transform = `scale(${big})${saved.flipped === "true" ? " scaleX(-1)" : ""}`;
        copy.style.transformOrigin = "50% 100%";
        copy.style.position = "relative";
        holder.style.height = `${Math.round(object.offsetHeight * big + 20)}px`;
        holder.style.display = "grid";
        holder.style.placeItems = "end center";
        holder.appendChild(copy);
        const draw = () => global.LivingArt?.render(copy, Date.now());
        requestAnimationFrame(draw);
        copy.querySelector("img")?.addEventListener("load", draw);
        refresh = setInterval(draw, 20000);
      },
      onClose() { clearInterval(refresh); }
    });
  }

  function storyAll() {
    showAllStory = !showAllStory;
    render();
  }

  function mirror() {
    const core = A();
    const object = selected();
    const before = B().doc().objects;
    const index = B().objects().indexOf(object);
    const result = core.arrange.mirrorPair(before, index);
    if (!result) return;
    B().applyObjects(before, result.objects);
    notice(`${short(before[result.partner].label)} now mirrors it across the altar.`);
  }

  // ── Wiring ──────────────────────────────────────────────────────────────
  const ACTIONS = {
    closer: () => openCloser(),
    spell: () => global.AltarWorkings?.openSpell(selected()),
    "tonight-swap": () => global.AltarReading?.openTonight(),
    "tend-spell": (button) => { const e = cache.spells.find((x) => x.id === button.dataset.entry); if (e) tendSpell(e); },
    "deity-offering": (button) => deityOffering(button.dataset.how),
    "offering-refresh": () => { change((o) => A().offerings.refreshOffering(o, nowIso())); notice("Refreshed."); },
    "offering-leave": () => { change((o) => A().offerings.leaveOffering(o, nowIso())); notice("Left as it is. It won’t ask to be tended again until you refresh it."); },
    "offering-end": (button) => endOffering(button.dataset.how),
    offer: openOffering,
    "frame-photo": chooseFramePhoto,
    "frame-name": () => void openFrameName(),
    "frame-aged": () => { const f = A().frame.frameOf(B().toSaved(selected())); change((o) => A().frame.setFrameAged(o, !f.aged, nowIso())); },
    "frame-remove": () => { change((o) => A().frame.removeFramePhoto(o, nowIso())); notice("The photo is out of the frame."); },
    renew: shakeJar,
    feed: feedSachet,
    carry: () => { const s = A().sachet.sachetStateOf(B().toSaved(selected())); change((o) => A().sachet.setCarried(o, !s?.carried, nowIso())); },
    incense: toggleIncense,
    "incense-kind": openIncenseKind,
    petitions: openPetitionBox,
    fresh: freshCandle,
    light: lightSelected,
    read: openReading,
    length: openLength,
    anoint: openAnoint,
    dress: openDressFromAltar,
    carve: openCarve,
    undress: () => change((o) => A().livingState.undressCandle(o, nowIso())),
    "story-all": storyAll,
    mirror,
    layouts: () => global.AltarReading?.openLayouts(selected()),
    "stone-log": (button) => global.AltarReading?.logStoneCare(selected(), button.dataset.id),
    "ancestor-rite": (button) => global.AltarReading?.beginAncestorRite(button.dataset.id),
    "page-link": () => global.AltarReading?.openPageLink(selected())
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-app-living] [data-app-action]");
    if (!button) return;
    const action = ACTIONS[button.dataset.appAction];
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      action(button);
    } catch (error) {
      console.error("Altar action", error);
      notice("That didn’t work. Please try again.");
    }
  });

  // Crystal care from the Companion plays its moment on the stage (StageEffects Moment).
  const careBefore = global.setLivingCrystalCare;
  if (typeof careBefore === "function") {
    global.setLivingCrystalCare = function setLivingCrystalCareWithMoment(object, care = {}) {
      const result = careBefore.apply(this, arguments);
      const record = care.chargingRecord || care.cleansingRecord;
      if (record && A()) {
        const kind = A().charge.momentFor((record.methods || []).map(String));
        global.LivingArt?.playMoment(object, kind);
        const charged = care.chargingRecord ? B().update(object, (o) => A().livingState.logAppEvent(o, { kind: "charge", text: `Charged: ${(record.methods || []).join(", ").toLowerCase() || "by hand"}.` }, nowIso()), { undo: false, quiet: true }) : null;
        void charged;
        setTimeout(() => B().notice(A().charge.MOMENT_WORDS[kind]), 50);
      }
      return result;
    };
  }

  // Offerings that went over while you were away ask, gently, to be tended (once each time an altar opens).
  const tendingNoted = new Set();
  function noteTending() {
    const core = A();
    if (!core || !B()) return;
    const id = B().altarId() || "unsaved";
    if (tendingNoted.has(id)) return;
    const objects = B().objects().map((el) => B().toSaved(el));
    if (!objects.length) return;
    tendingNoted.add(id);
    const due = core.offerings.tendingNote(core.offerings.offeringsDue([{ id, name: B().altarName(), objects }], Date.now()), { oneAltar: true });
    if (due) notice(`${due} Select it to refresh it, give it back, or leave it as it is.`);
  }

  function watch() {
    const panel = document.querySelector(".altar-companion-panel [data-companion-content]");
    if (panel) new MutationObserver(() => { if (!panel.querySelector("[data-app-living]") && selected()) schedule(); }).observe(panel, { childList: true });
    ["app-altar:changed", "living-object-state:changed", "companion:refreshed"].forEach((name) => document.addEventListener(name, schedule));
    document.addEventListener("altar:current-changed", () => { loadEntries().then(schedule); setTimeout(noteTending, 600); });
    global.SaltPage?.onUserChange?.(() => loadEntries().then(schedule));
    // The burning time counts up; offerings age by the minute.
    setInterval(() => { if (!document.hidden && selected()) render(); }, 10000);
    loadEntries().then(schedule);
    setTimeout(noteTending, 1500);
    scheduleIncense();
    document.addEventListener("app-altar:changed", scheduleIncense);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watch, { once: true });
  else watch();

  global.AltarLiving = {
    render, schedule, openCloser, openPetitionBox, openWritePetition, saveJournal, loadEntries, notice,
    setTonight(value) { tonight = value; schedule(); },
    getTonight: () => tonight
  };
})(typeof window !== "undefined" ? window : globalThis);
