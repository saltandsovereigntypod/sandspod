/*
 * Green practice (/practice/green/…): planting by the moon, in season now,
 * and My garden with each plant's history. The app's screens in
 * app/src/app/(tabs)/rituals/craft/green, its logic from js/core/practice-a.js.
 * Plants are kept in craft_entries, collection `green.plants`, as the app keeps them.
 */
(function (global) {
  const kit = global.PracticeKit;
  const core = global.SaltCore?.["practice-a"];
  const root = kit?.root();
  if (!kit || !core || !root) return;

  const { garden: G, moonGarden: M, season: S, calendar, premade, practices } = core;
  const view = root.dataset.view;
  const about = premade.PRACTICES.find((p) => p.id === "green")?.about;
  const fullDate = (key) => calendar.fullDate(key) ?? key;
  const shortDay = (key) => calendar.fullDate(key)?.replace(/, \d{4}$/, "") ?? key;
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const shortDate = (d) => `${DAYS[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
  const FERTILITY_WORDS = { fruitful: "fruitful", "semi-fruitful": "half fruitful", barren: "barren" };
  const backToGreen = kit.back(kit.href.practice("green"), "Green");
  const backToGarden = kit.back(kit.href.tool("green", "garden"), "My garden");

  let user = null;
  let plants = [];
  const loadPlants = async () => {
    plants = (await kit.entries(G.PLANTS)).map((e) => ({ ...e, data: G.asPlant(e.data) }));
  };

  // ------------------------------------------------------------------ hub

  function hubView() {
    const night = M.gardenNight(M.eveningOf(new Date()));
    const growing = plants.filter((p) => G.isGrowing(p.data)).length;
    const paths = ["moon", "season", "garden"];
    const details = [`${M.QUARTERS[night.quarter].short} · ${night.phase}`, null, growing ? `${kit.plural(growing, "plant", "plants")} growing` : null];
    return [
      kit.back(kit.href.hub, "Craft"),
      kit.head({ eyebrow: "Craft tools", title: "Green", lede: about }),
      kit.card(`${kit.big(M.QUARTERS[night.quarter].headline)}${kit.muted(`${night.phase}, moon in ${night.sign}`)}`, { gold: true, label: "Tonight in the garden" }),
      kit.section("Tools", kit.list(practices.CRAFT_TOOLS.green.map((t, i) => kit.row({ url: kit.href.tool("green", paths[i]), title: t.title, detail: details[i] ?? t.detail }))), { id: "tools" }),
      kit.list([
        kit.row({ url: "/practice/hearth/forage/", title: "Foraging & garden", detail: "Hearth & land · what grows where, the hedgerow this month, and your harvests" }),
        kit.row({ url: "/practice/hearth/land/", title: "Land journal", detail: "Hearth & land · frosts, blooms and birdsong on your places, year on year" })
      ]),
      kit.landCard(),
      kit.list([kit.row({ url: kit.href.premadeList("green"), title: "Green workings", detail: "Premade rituals and spells; filter by Green" })])
    ].join("");
  }

  // ------------------------------------------------------------------ planting by the moon

  function moonView() {
    const now = new Date();
    const tonight = M.gardenNight(M.eveningOf(now));
    const nights = M.gardenNights(now, 14);
    const change = M.nextQuarterChange(M.eveningOf(now));
    const advice = M.QUARTERS[tonight.quarter];
    const sign = M.signNote(tonight.sign);
    const nightItems = nights
      .map((night, i) => {
        const label = i === 0 ? "Tonight" : i === 1 ? "Tomorrow" : shortDate(night.date);
        const line = M.nightLine(night);
        const signWords = `${night.sign}, ${FERTILITY_WORDS[night.fertility]}`;
        return `<li class="${night.turning ? "is-turning" : ""}"><div class="pr-lines__when"><span class="pr-lines__title">${kit.esc(label)}</span><span class="sp-caption">${kit.esc(
          night.phase
        )}</span></div><div class="pr-lines__what"><span class="${night.turning ? "is-gold" : ""}">${kit.esc(line)}</span><span class="sp-caption">${kit.esc(`Moon in ${signWords}`)}</span></div></li>`;
      })
      .join("");
    return [
      backToGreen,
      kit.head({ eyebrow: "Tonight’s moon tide", title: "Planting by the moon" }),
      kit.card(
        `${kit.big(advice.headline)}${kit.muted(advice.span)}${kit.p(advice.why)}${kit.bullets(advice.tasks)}${kit.muted(`For example: ${advice.examples}.`)}${
          tonight.turning ? kit.muted("The moon turns into this quarter today. Some almanacs leave the day of the change itself alone and begin tomorrow.") : ""
        }${change ? kit.muted(`From ${shortDate(change.date)}: ${M.QUARTERS[change.quarter].short.toLowerCase()}.`) : ""}`,
        { gold: true, label: `${tonight.phase} · ${Math.round(tonight.illumination * 100)}% lit` }
      ),
      kit.card(
        `${kit.big(`Moon in ${sign.sign}`)}${kit.muted(`${sign.element} sign · ${FERTILITY_WORDS[sign.fertility]} in the old almanacs`)}${kit.p(sign.note)}${kit.muted(
          "An older second layer: where the quarter and the sign disagree, gardeners who keep both usually let the quarter decide what to sow and the sign decide how keen to be."
        )}`,
        { label: "The moon’s sign" }
      ),
      kit.section("The next fourteen nights", `<ol class="pr-lines">${nightItems}</ol>`, { id: "nights" }),
      kit.details(
        "About this tradition",
        `${kit.p(
          "Gardening by the moon is folk practice, handed down in almanacs and country lore across Europe and beyond for centuries. The four-quarter rule here is the common one: leaves while the moon waxes to its first quarter, fruit and seed to the full, roots and planting out as it wanes, and rest in the last dark days."
        )}${kit.p(
          "Trials have found little firm evidence that the moon changes how plants grow; soil, warmth, water and timing for your frost dates matter far more. Many gardeners keep it anyway as a rhythm that slows them down and ties the work to the sky. Use it as a guide for the gentle choices, never over the needs of the plant."
        )}${kit.muted(
          "Moon times are worked out in your browser. The signs are tropical (as in most Western almanacs); biodynamic calendars use the constellations, so they differ."
        )}`
      ),
      kit.actions([kit.button({ label: "Log it in My garden", url: kit.href.tool("green", "garden"), primary: true }), kit.button({ label: "What’s in season now", url: kit.href.tool("green", "season"), ghost: true })])
    ].join("");
  }

  // ------------------------------------------------------------------ in season now

  const season = { month: new Date().getMonth() + 1, chosen: null, placeMessage: "" };

  function plantCard(plant, detail) {
    const body = `<div class="pr-plant__text"><h3 class="pr-big">${kit.esc(plant.name)}</h3><p>${kit.esc(detail)}</p>${kit.caption(plant.note)}${
      plant.caution ? `<p class="sp-caption pr-warn">${kit.esc(`Take care: ${plant.caution}`)}</p>` : ""
    }</div>`;
    if (!plant.library) return kit.card(`<div class="pr-plant">${body}</div>`);
    return kit.card(
      `<a class="pr-plant" href="${kit.esc(kit.href.library(`traditional:herb:${plant.key}`))}">${body}<span class="sp-row__chevron" aria-hidden="true">›</span><span class="pr-visually-hidden">, open its Living Library page</span></a>`
    );
  }

  function seasonView() {
    const place = kit.readPlace();
    const hemisphere = season.chosen ?? S.hemisphereOf(place?.latitude);
    const month = season.month;
    const now = S.inSeason(month, hemisphere);
    const thisMonth = month === new Date().getMonth() + 1;
    const monthName = S.MONTH_NAMES[month - 1];
    const year = S.SEASON_PLANTS.slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => {
        const sow = p.sow.length ? S.monthSpan(S.localMonths(p.sow, hemisphere)) : p.wild ? "Grows wild" : "—";
        const gather = S.monthSpan(S.localMonths(p.harvest, hemisphere));
        return `<li><div class="pr-lines__what"><span class="pr-lines__title">${kit.esc(p.name)}</span><span class="sp-caption">${kit.esc(`Sow ${sow} · Gather ${gather}`)}</span></div></li>`;
      })
      .join("");
    return [
      backToGreen,
      kit.head({ eyebrow: thisMonth ? "This month" : monthName, title: "In season now" }),
      kit.muted(
        `${
          hemisphere === "north"
            ? "For a temperate garden in the northern hemisphere."
            : "For a temperate garden in the southern hemisphere: the northern calendar turned by six months."
        } Your frost dates, height and rainfall can move every one of these by weeks, so take them as a guide to the season, not the day.`
      ),
      !place ? kit.notice("No location is saved, so this assumes the northern hemisphere. Choose below, or set your place.") : "",
      S.isTropical(place?.latitude)
        ? kit.notice("You’re in the tropics, where wet and dry seasons matter more than these months. Many of these herbs grow year round for you in shade, or in the cooler dry season.")
        : "",
      kit.section(
        "Hemisphere",
        kit.chips(
          [kit.chip({ label: "Northern", act: "hemisphere", value: "north", pressed: hemisphere === "north" }), kit.chip({ label: "Southern", act: "hemisphere", value: "south", pressed: hemisphere === "south" })],
          "Hemisphere"
        ),
        { id: "hemi" }
      ),
      kit.placeForm(place, season.placeMessage),
      kit.section("Month", kit.chips(MON.map((m, i) => kit.chip({ label: m, a11y: S.MONTH_NAMES[i], act: "month", value: i + 1, pressed: month === i + 1 })), "Month"), { id: "month" }),
      kit.section(
        `To sow and plant in ${monthName}`,
        now.sow.length ? now.sow.map((p) => plantCard(p, p.sowWhat)).join("") : kit.muted("A resting month: nothing on this list is sown now. Plan, order seed and tend the soil."),
        { id: "sow" }
      ),
      kit.section(
        `To gather in ${monthName}`,
        now.harvest.length ? now.harvest.map((p) => plantCard(p, p.harvestWhat)).join("") : kit.muted("Little to gather now. Use what you dried and stored."),
        { id: "gather" }
      ),
      kit.details("The whole year", `<ul class="pr-lines">${year}</ul>`),
      kit.muted(
        "Gather from plants you’re sure of, from clean ground away from roads and sprays, and with the landowner’s leave. Take no more than a third of a plant, and never anything rare. When a plant carries a warning here, read its Library page before you use it."
      )
    ].join("");
  }

  // ------------------------------------------------------------------ my garden

  function detailOf(plant) {
    const { last, harvests } = G.plantSummary(plant);
    return kit.join([plant.place || null, last ? `${G.eventLabel(last.kind)} ${shortDay(last.on)} · ${last.moon}` : "Nothing logged yet", harvests ? kit.plural(harvests, "harvest", "harvests") : null]);
  }
  const plantUrl = (id) => kit.href.tool("green", "plant", `id=${encodeURIComponent(id)}`);

  function gardenView() {
    const sorted = G.sortPlants(plants);
    const growing = sorted.filter((p) => G.isGrowing(p.data));
    const gone = sorted.filter((p) => !G.isGrowing(p.data));
    return [
      backToGreen,
      kit.head({ eyebrow: "Your plants, sowings and harvests", title: "My garden" }),
      kit.actions([kit.button({ label: "Add a plant", url: kit.href.tool("green", "plant/edit"), primary: true })]),
      !sorted.length
        ? kit.card(
            kit.p(
              "Add the herbs and flowers you grow, in the ground or in a pot on the sill. Log each sowing, feeding, harvest and offering, and the moon it happened under is kept with it, so over the seasons you can see what your garden does under each tide."
            ),
            { label: "An empty bed" }
          )
        : [
            growing.length ? kit.section("Growing", kit.list(growing.map((p) => kit.row({ url: plantUrl(p.id), title: p.data.name, detail: detailOf(p.data) }))), { id: "growing" }) : "",
            gone.length
              ? kit.details(
                  `Gone from the garden (${gone.length})`,
                  kit.list(gone.map((p) => kit.row({ url: plantUrl(p.id), title: p.data.name, detail: kit.join([p.data.goneOn ? `Gone ${shortDay(p.data.goneOn)}` : null, p.data.goneNote]) })))
                )
              : ""
          ].join(""),
      kit.muted(user ? "Saved to your account, so it’s in the app too." : "Saved in this browser. Sign in to keep your garden with your account.")
    ].join("");
  }

  // ------------------------------------------------------------------ one plant

  const today = () => kit.dateKey(new Date());
  const log = { kind: "tended", on: today(), typed: "", amount: "", note: "", goneNote: "", busy: false, saved: "" };

  function plantView() {
    const id = new URLSearchParams(global.location.search).get("id");
    const entry = plants.find((e) => e.id === id);
    if (!entry) return [backToGarden, kit.head({ title: "My garden" }), kit.p("This plant isn’t in your garden any more.")].join("");
    const plant = entry.data;
    const list = G.history(plant);
    const summary = G.plantSummary(plant);
    const now = new Date();
    const age = plant.started ? G.daysBetween(plant.started, plant.goneOn ?? today()) : null;
    const herbLabel = G.herbName(plant.herb);
    const on = log.on ?? today();
    const facts =
      kit.join([
        plant.started ? `${plant.startedBy === "sowed" ? "Sown" : "Planted"} ${fullDate(plant.started)} under the ${G.moonOn(plant.started, now).toLowerCase()}` : null,
        age !== null && age >= 0 ? `${kit.plural(age, "day", "days")}${plant.goneOn ? "" : " in your garden"}` : null,
        summary.harvests ? kit.plural(summary.harvests, "harvest", "harvests") : null
      ]) || "No start date";
    const history = list.length
      ? `<ul class="pr-lines">${list
          .map(
            (e) =>
              `<li><div class="pr-lines__what"><span class="pr-lines__title">${kit.esc(`${G.eventLabel(e.kind)}${e.amount ? `: ${e.amount}` : ""}`)}</span><span class="sp-caption">${kit.esc(
                `${fullDate(e.on)} · ${e.moon}`
              )}</span>${e.note ? `<span>${kit.esc(e.note)}</span>` : ""}</div>${kit.textButton({
                label: "Remove",
                act: "remove-event",
                value: e.id,
                a11y: `Remove ${G.eventLabel(e.kind).toLowerCase()} on ${fullDate(e.on)}`
              })}</li>`
          )
          .join("")}</ul>`
      : kit.muted("Nothing logged yet.");
    return [
      backToGarden,
      kit.head({ eyebrow: plant.place || "My garden", title: plant.name }),
      kit.muted(facts),
      plant.goneOn ? kit.notice(`Gone from the garden ${fullDate(plant.goneOn)}${plant.goneNote ? `: ${plant.goneNote}` : ""}.`) : "",
      plant.notes ? kit.p(plant.notes) : "",
      herbLabel ? kit.actions([kit.button({ label: `${herbLabel} in the Living Library`, url: kit.href.library(`traditional:herb:${plant.herb}`), ghost: true })]) : "",
      kit.card(
        [
          kit.chips(G.EVENT_KINDS.map((k) => kit.chip({ label: k.label, act: "kind", value: k.kind, pressed: log.kind === k.kind })), "What happened"),
          kit.dayPicker({ name: "log", label: "When", value: log.on, typed: log.typed }),
          log.kind === "harvested" ? kit.field({ id: "log-amount", label: "How much?", value: log.amount, input: "amount", placeholder: "A handful, 3 bundles, 40 g…" }) : "",
          kit.field({
            id: "log-note",
            label: log.kind === "blessing" ? "What did you offer or say?" : "Note",
            value: log.note,
            input: "note",
            multiline: true,
            placeholder: log.kind === "blessing" ? "Milk and honey at the roots, a few words of thanks…" : "Optional"
          }),
          kit.muted(`The moon is recorded for you: ${G.moonOn(on, now).toLowerCase()}${log.on && log.on !== today() ? " that evening" : " now"}.`),
          kit.actions([kit.button({ label: log.busy ? "Saving…" : `Log ${G.eventLabel(log.kind).toLowerCase()}`, act: "log", primary: true, disabled: log.busy, id: "log-button" })]),
          kit.notice(log.saved, { live: true })
        ].join(""),
        { gold: true, label: "Log something" }
      ),
      kit.section("History", history, { id: "history" }),
      kit.actions([
        kit.button({ label: "Edit details", url: kit.href.tool("green", "plant/edit", `id=${encodeURIComponent(entry.id)}`), ghost: true }),
        plant.goneOn ? kit.button({ label: "Bring it back to the garden", act: "bring-back", ghost: true, disabled: log.busy }) : ""
      ]),
      plant.goneOn
        ? ""
        : kit.details(
            "It’s gone from the garden",
            `${kit.muted("For a plant that died, was given away or finished its season. Its history stays.")}${kit.field({
              id: "gone-note",
              label: "What happened? (optional)",
              value: log.goneNote,
              input: "gone-note",
              placeholder: "First frost, gave it to Mum, went to seed…"
            })}${kit.actions([kit.button({ label: "Mark as gone", act: "gone", ghost: true, disabled: log.busy })])}`
          ),
      kit.actions([kit.textButton({ label: "Delete plant", act: "delete-plant", quiet: true })]),
      kit.muted(user ? "Saved to your account, so it’s in the app too." : "Saved in this browser. Sign in to keep your garden with your account.")
    ].join("");
  }

  async function savePlant(entry, next) {
    log.busy = true;
    draw();
    try {
      await kit.update(G.PLANTS, entry.id, next);
      entry.data = G.asPlant(next);
      return true;
    } catch (error) {
      console.error(error);
      log.saved = `Couldn’t save. ${error?.message || "Please try again."}`;
      return false;
    } finally {
      log.busy = false;
    }
  }
  const currentPlant = () => plants.find((e) => e.id === new URLSearchParams(global.location.search).get("id"));

  // ------------------------------------------------------------------ add or edit a plant

  const form = { ready: false, name: "", herb: null, place: "", startedBy: "planted", started: today(), typed: "", notes: "", saving: false, problem: "" };

  function formView() {
    const id = new URLSearchParams(global.location.search).get("id");
    const existing = id ? plants.find((e) => e.id === id) : null;
    if (id && !existing) return [backToGarden, kit.head({ title: "My garden" }), kit.p("This plant isn’t in your garden any more.")].join("");
    if (!form.ready) {
      form.ready = true;
      if (existing) Object.assign(form, { name: existing.data.name, herb: existing.data.herb, place: existing.data.place, notes: existing.data.notes });
    }
    const suggestions = form.herb ? [] : G.matchHerbs(form.name);
    const herbBit = form.herb
      ? `<div class="sp-section">${kit.muted("Linked to its Living Library page")}${kit.chips([
          kit.chip({ label: `${G.herbName(form.herb) ?? form.herb}  ✕`, act: "unlink-herb", a11y: `Linked to ${G.herbName(form.herb) ?? form.herb}. Remove the link` })
        ])}</div>`
      : suggestions.length
      ? `<div class="sp-section">${kit.muted("Link it to the Living Library?")}${kit.chips(
          suggestions.map((h) => kit.chip({ label: h.name, act: "link-herb", value: h.key, a11y: `Link to ${h.name}` })),
          "Living Library herbs"
        )}</div>`
      : "";
    return [
      existing ? kit.back(kit.href.tool("green", "plant", `id=${encodeURIComponent(existing.id)}`), existing.data.name) : backToGarden,
      kit.head({ eyebrow: existing ? "Edit plant" : "My garden", title: existing ? "About this plant" : "Add a plant" }),
      `<div class="sp-section">${kit.field({ id: "plant-name", label: "What is it?", value: form.name, input: "name", placeholder: "Rosemary, the old rose, windowsill basil…" })}${herbBit}${kit.field({
        id: "plant-place",
        label: "Where it grows",
        value: form.place,
        input: "place",
        placeholder: "South bed, blue pot by the door…"
      })}</div>`,
      existing
        ? ""
        : kit.section(
            "When it began",
            `${kit.chips(
              [
                kit.chip({ label: "Sowed as seed", act: "started-by", value: "sowed", pressed: form.startedBy === "sowed" }),
                kit.chip({ label: "Planted", act: "started-by", value: "planted", pressed: form.startedBy === "planted" })
              ],
              "How it began"
            )}${kit.dayPicker({ name: "start", label: "On", value: form.started, typed: form.typed, allowNone: true })}${kit.muted("The moon that day is recorded with it.")}`,
            { id: "began" }
          ),
      kit.field({ id: "plant-notes", label: "Notes", value: form.notes, input: "notes", multiline: true, placeholder: "Where the seed came from, who gave you the cutting, what it’s for…" }),
      kit.notice(form.problem, { live: true }),
      kit.actions([kit.button({ label: form.saving ? "Saving…" : existing ? "Save changes" : "Add to my garden", act: "save-plant", primary: true, disabled: form.saving, id: "save-plant" })]),
      kit.muted(user ? "Saved to your account, so it’s in the app too." : "Saved in this browser. Sign in to keep your garden with your account.")
    ].join("");
  }

  // ------------------------------------------------------------------ wiring

  const VIEWS = { green: hubView, "green-moon": moonView, "green-season": seasonView, "green-garden": gardenView, "green-plant": plantView, "green-plant-edit": formView };
  const draw = () => kit.render(root, (VIEWS[view] || hubView)());

  kit.delegate(root, {
    ...kit.placeHandlers(root, (message) => {
      season.placeMessage = message;
      season.chosen = null;
      draw();
    }),
    hemisphere(el) {
      season.chosen = el.dataset.value;
      draw();
    },
    month(el) {
      season.month = Number(el.dataset.value);
      draw();
    },
    // One plant: logging
    kind(el) {
      log.kind = el.dataset.value;
      log.saved = "";
      draw();
    },
    "log-day"(el) {
      log.on = el.dataset.value || null;
      log.typed = "";
      draw();
    },
    "log-typed"(el) {
      log.typed = el.value;
      const key = kit.typedDay(el.value);
      if (key) log.on = key;
      draw();
    },
    amount(el) {
      log.amount = el.value;
    },
    note(el) {
      log.note = el.value;
    },
    "gone-note"(el) {
      log.goneNote = el.value;
    },
    async log() {
      const entry = currentPlant();
      if (!entry || log.busy) return;
      const event = G.newEvent({ kind: log.kind, on: log.on ?? today(), amount: log.amount, note: log.note }, new Date());
      if (await savePlant(entry, G.addEvent(entry.data, event))) {
        log.amount = "";
        log.note = "";
        log.saved = `${G.eventLabel(log.kind)} logged under the ${event.moon.toLowerCase()}.`;
      }
      draw();
    },
    async "remove-event"(el) {
      const entry = currentPlant();
      if (!entry || !kit.confirm("Remove this entry? It is taken out of this plant’s history.")) return;
      await savePlant(entry, G.removeEvent(entry.data, el.dataset.value));
      draw();
    },
    async gone() {
      const entry = currentPlant();
      if (!entry) return;
      if (!kit.confirm(`Mark ${entry.data.name} as gone? It moves to the bottom of your garden with its history kept. You can bring it back.`)) return;
      await savePlant(entry, G.markGone(entry.data, today(), log.goneNote));
      draw();
    },
    async "bring-back"() {
      const entry = currentPlant();
      if (!entry) return;
      await savePlant(entry, G.bringBack(entry.data));
      draw();
    },
    async "delete-plant"() {
      const entry = currentPlant();
      if (!entry) return;
      if (!kit.confirm(`Delete ${entry.data.name}? The plant and all its history are removed from this browser and your account.`)) return;
      try {
        await kit.remove(G.PLANTS, entry.id);
        kit.go(kit.href.tool("green", "garden"));
      } catch (error) {
        log.saved = `Couldn’t delete. ${error?.message || "Please try again."}`;
        draw();
      }
    },
    // Adding or editing a plant
    name(el) {
      form.name = el.value;
      draw();
    },
    place(el) {
      form.place = el.value;
    },
    notes(el) {
      form.notes = el.value;
    },
    "link-herb"(el) {
      form.herb = el.dataset.value;
      draw();
    },
    "unlink-herb"() {
      form.herb = null;
      draw();
      root.querySelector("#plant-name")?.focus();
    },
    "started-by"(el) {
      form.startedBy = el.dataset.value;
      draw();
    },
    "start-day"(el) {
      form.started = el.dataset.value || null;
      form.typed = "";
      draw();
    },
    "start-typed"(el) {
      form.typed = el.value;
      const key = kit.typedDay(el.value);
      if (key) form.started = key;
      draw();
    },
    async "save-plant"() {
      if (form.saving) return;
      if (!form.name.trim()) {
        form.problem = "Give the plant a name first.";
        draw();
        root.querySelector("#plant-name")?.focus();
        return;
      }
      const id = new URLSearchParams(global.location.search).get("id");
      const existing = id ? plants.find((e) => e.id === id) : null;
      form.saving = true;
      form.problem = "";
      draw();
      try {
        if (existing) {
          await kit.update(G.PLANTS, existing.id, { ...existing.data, name: form.name.trim(), herb: form.herb, place: form.place.trim(), notes: form.notes.trim() });
          kit.go(plantUrl(existing.id));
        } else {
          const plant = G.newPlant({ name: form.name, herb: form.herb, place: form.place, started: form.started, startedBy: form.startedBy, notes: form.notes }, new Date());
          const entry = await kit.add(G.PLANTS, plant);
          kit.go(plantUrl(entry.id));
        }
      } catch (error) {
        form.problem = `It couldn’t be saved${error?.message ? ` (${error.message})` : ""}. Your words are still here.`;
        form.saving = false;
        draw();
      }
    }
  });

  kit.start(async (who) => {
    user = who;
    if (view !== "green-moon" && view !== "green-season") await loadPlants();
    draw();
  });
})(window);
