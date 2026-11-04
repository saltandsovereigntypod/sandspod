/*
 * My Shelves (app: Practice → Rituals → My Shelves): the real things you keep
 * on painted shelves or as a list, each thing's page (how much is left,
 * tending, its story, placing it on the altar), adding and changing things,
 * and the shopping list. The logic is the app's (js/core/shelves.js); the
 * things are the craft collection `shelves.items` and each one's tending a
 * record in `tend.rhythms`, both through SaltCraft, exactly as the app keeps
 * them. Guests keep them in this browser.
 */
(function (global) {
  "use strict";

  const C = global.SaltCore?.shelves;
  const M = C?.model;
  const T = C?.tend;
  const root = global.document.querySelector("[data-page-root]");
  const esc = (text) => global.SaltPage.esc(text);
  if (!C || !M || !T || !global.SaltCraft) {
    if (root) root.innerHTML = `<p class="sp-notice">My Shelves couldn’t be opened. Please refresh the page.</p>`;
    return;
  }
  const params = new URLSearchParams(global.location.search);
  const VIEW_KEY = "salt.shelves.view";
  const state = { account: null, entries: [], records: [], altars: [], view: "shelves", sort: "shelf", query: "", draft: null, editing: null, found: [], message: "" };
  try {
    state.view = global.localStorage.getItem(VIEW_KEY) === "list" ? "list" : "shelves";
  } catch {
    /* storage blocked */
  }

  const picture = (image) => (/^(https?|data|blob):/i.test(image || "") ? image : image ? C.sitePicture(image) : "");
  const thumb = (item, cls = "") =>
    picture(item.image) ? `<img class="${cls}" src="${esc(picture(item.image))}" alt="" loading="lazy" />` : `<span class="sh-letter ${cls}" aria-hidden="true">${esc(item.name.trim().charAt(0).toUpperCase() || "·")}</span>`;
  const chip = (label, pressed, attrs) => `<button type="button" class="sp-chip" aria-pressed="${pressed ? "true" : "false"}" ${attrs}>${esc(label)}</button>`;
  const row = (href, title, detail) => `<a class="sp-row" href="${esc(href)}"><span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
  const itemHref = (id) => `/rituals/shelves/?item=${encodeURIComponent(id)}`;
  const day = (iso) => {
    const d = new Date(String(iso).length === 10 ? `${iso}T12:00:00` : iso);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  };
  const todayKey = () => T.dayKey(new Date());

  // ── Loading and saving ─────────────────────────────────────────────────

  async function load() {
    state.account = await global.SaltPage.ready();
    const [entries, records] = await Promise.all([global.SaltCraft.list(M.SHELVES_COLLECTION), global.SaltCraft.list(T.TEND_COLLECTION).catch(() => [])]);
    state.entries = entries.map((e) => ({ id: e.id, createdAt: e.createdAt, item: M.cleanItem(e.data) }));
    state.records = records.map((e) => ({ id: e.id, record: T.normalizeRecord(e.data) })).filter((x) => x.record);
  }

  async function loadAltars() {
    const S = C.snapshot;
    try {
      if (state.account && global.db) {
        const { data } = await global.db.from("saved_altars").select("id,name,altar_data,created_at,updated_at").eq("user_id", state.account.id);
        state.altars = (data || []).map(S.altarFromRow);
      } else state.altars = S.parseLocalAltars(global.localStorage.getItem(S.LOCAL_ALTARS_KEY));
    } catch {
      state.altars = [];
    }
  }

  const recordOf = (id) => state.records.find((x) => x.record.key === M.tendKeyOf(id)) || null;

  /** Its To tend record in step with it, as the app's shelves store does. */
  async function syncTend(id, item) {
    const existing = recordOf(id);
    const next = item ? M.shelfTendRecord(id, item, existing?.record) : null;
    if (next && existing) await global.SaltCraft.update(T.TEND_COLLECTION, existing.id, next);
    else if (next) await global.SaltCraft.add(T.TEND_COLLECTION, next);
    else if (existing) await global.SaltCraft.remove(T.TEND_COLLECTION, existing.id);
  }

  async function save(id, item) {
    await global.SaltCraft.update(M.SHELVES_COLLECTION, id, item);
    await syncTend(id, item);
    await load();
  }

  async function add(item) {
    const entry = await global.SaltCraft.add(M.SHELVES_COLLECTION, item);
    await syncTend(entry.id, item);
    return entry.id;
  }

  async function attempt(work) {
    try {
      await work();
    } catch (error) {
      console.error(error);
      state.message = "That couldn’t be kept. Please try again.";
    }
    render();
  }

  // ── The shelves ────────────────────────────────────────────────────────

  function dueAt(id) {
    const x = recordOf(id);
    if (!x) return null;
    const item = T.ownTendables([x.record])[0];
    return item ? T.dueOf(item, x.record, new Date()).at : null;
  }

  function home() {
    const { entries } = state;
    const cabinet = M.byShelf(entries)
      .map(
        (s) => `<div class="sh-shelf"><p class="sh-plaque">${esc(s.label)}</p><div class="sh-back">${
          s.entries.length
            ? s.entries.map(({ id, item }) => `<a class="sh-thing" href="${itemHref(id)}" aria-label="${esc(`${item.name}${M.isLow(item) ? ", running low" : ""}`)}">${thumb(item)}<span>${esc(item.name)}</span>${M.isLow(item) ? `<span class="sh-low" aria-hidden="true">Low</span>` : ""}</a>`).join("")
            : `<span class="sh-empty">Nothing here yet</span>`
        }</div><div class="sh-plank" aria-hidden="true"></div></div>`
      )
      .join("");
    const listed = M.sortShelf(entries, state.sort, state.query, dueAt);
    const list = `
      <div class="sp-field"><label for="sh-search">Search</label><input id="sh-search" type="search" value="${esc(state.query)}" placeholder="Name, shelf, where it’s kept…" data-search /></div>
      <div class="sp-chips">${M.SORTS.map((s) => chip(s.label, state.sort === s.value, `data-sort="${s.value}"`)).join("")}</div>
      ${listed.length ? `<div class="sp-list">${listed.map(({ id, item }) => row(itemHref(id), item.name, [M.shelfLabel(item.shelf), M.qtyLabel(item.qty), M.isLow(item) ? "running low" : "", item.where].filter(Boolean).join(" · "))).join("")}</div>` : `<p class="sp-muted">Nothing matches that.</p>`}`;
    const shopping = M.shoppingList(entries);
    return `
      <a class="sp-back" href="/rituals/">‹ Rituals</a>
      <header class="rt-head"><p class="sp-eyebrow">What you keep</p><h1>My Shelves</h1>
        <p class="sp-muted">Your crystals, herbs, oils, candles, tools, decks, books and statues: what you have, where it’s kept, how it’s tended and what’s running low.</p></header>
      ${state.message ? `<p class="sp-notice" role="status">${esc(state.message)}</p>` : ""}
      <div class="sp-chips">${chip("Shelves", state.view === "shelves", 'data-view="shelves"')}${chip("List", state.view === "list", 'data-view="list"')}</div>
      ${
        !entries.length
          ? `<section class="sp-card"><p>Nothing on your shelves yet. Add what you own from the altar cabinet or the Living Library with “I own this”, or add your own with a photo.</p></section>`
          : state.view === "shelves"
            ? `<div class="sh-cabinet">${cabinet}</div>`
            : `<div class="sp-stack">${list}</div>`
      }
      <div class="sp-actions"><a class="button" href="/rituals/shelves/?add=1">Add something</a></div>
      <section class="sp-stack"><p class="sp-eyebrow">Shopping list</p>
        ${
          shopping.length
            ? shopping
                .map((g) => `<section class="sp-card"><h2 class="sp-card__title">${esc(g.label)}</h2>${g.items.map(({ id, item }) => `<div class="sh-shop"><a href="${itemHref(id)}">${esc(item.name)}</a><button type="button" class="button button--ghost" data-restock="${esc(id)}" title="${esc(`Takes ${item.name} off the list and brings it back up`)}">Restocked</button></div>`).join("")}</section>`)
                .join("")
            : `<p class="sp-muted">Nothing running low. Mark something low from its page and it comes here, by shelf.</p>`
        }</section>
      <div class="sp-list">
        ${row("/today/tend/", "To tend", "Your shelves’ cleansing, best-by days and check-ins, with everything else you tend")}
        ${row("/rituals/journal/insights/#did-it-work-made", "Apothecary", "Jars and sachets you’ve made, and whether they worked")}
        ${row("/practice/hearth/forage/harvests/", "Your harvests and store cupboard", "What you’ve gathered and dried")}
      </div>
      ${state.account ? "" : `<p class="sp-caption">Your shelves are kept in this browser. Sign in to keep them with your account and see them in the app.</p>`}`;
  }

  // ── One thing ──────────────────────────────────────────────────────────

  function thing(id) {
    const entry = state.entries.find((e) => e.id === id);
    if (!entry) return `<a class="sp-back" href="/rituals/shelves/">‹ My Shelves</a><p class="sp-muted">This isn’t on your shelves any more.</p>`;
    const { item } = entry;
    const x = recordOf(id);
    const tendable = x ? T.ownTendables([x.record])[0] : null;
    const due = tendable ? T.dueOf(tendable, x.record, new Date()) : null;
    const plan = M.tendPlanFor(item.shelf, item.name);
    const best = M.bestBy(item);
    const placed = M.placedObjects(state.altars, id);
    const story = M.shelfStory(item, x?.record, placed.flatMap((p) => C.story.storyLines(p.object).map((l) => ({ at: l.at, text: `On ${p.altarName}: ${l.text}` }))));
    const source = M.SOURCES.find((s) => s.value === item.source)?.label || "";
    const ref = item.ref.startsWith("traditional/") ? `traditional:${item.ref.split("/")[1]}:${item.ref.split("/").slice(2).join("/")}` : "";
    const qty =
      item.qty.kind === "count"
        ? `${chip("One fewer", null, 'data-count="-1"').replace(' aria-pressed="false"', "")}${chip("One more", null, 'data-count="1"').replace(' aria-pressed="false"', "")}`
        : M.LEVELS.map((l) => chip(l.label, item.qty.level === l.value, `data-level="${l.value}"`)).join("");
    return `
      <a class="sp-back" href="/rituals/shelves/">‹ My Shelves</a>
      <header class="rt-head"><p class="sp-eyebrow">${esc(M.shelfLabel(item.shelf))}</p><h1>${esc(item.name)}</h1></header>
      ${state.message ? `<p class="sp-notice" role="status">${esc(state.message)}</p>` : ""}
      <div class="sh-head">${thumb(item)}<div>
        <p>How much: ${esc(M.qtyLabel(item.qty))}${M.isLow(item) ? " · running low" : ""}</p>
        ${item.where ? `<p class="sp-caption">Kept: ${esc(item.where)}</p>` : ""}
        <p class="sp-caption">${esc([source, item.sourceText].filter(Boolean).join(": "))}</p>
        ${item.acquired ? `<p class="sp-caption">Got it ${esc(day(item.acquired))}</p>` : ""}
      </div></div>
      ${item.intention ? `<p>Intention: ${esc(item.intention)}</p>` : ""}
      ${item.notes ? `<p>${esc(item.notes)}</p>` : ""}
      <section class="sp-card"><h2 class="sp-card__title">How much is left</h2>
        <div class="sp-chips">${qty}</div>
        <div class="sp-actions">${M.isLow(item) ? `<button type="button" class="button button--ghost" data-restock="${esc(id)}">Restocked</button>` : `<button type="button" class="button button--ghost" data-low>Running low: add to my shopping list</button>`}</div>
      </section>
      <section class="sp-card"><h2 class="sp-card__title">Tending</h2>
        ${
          x && due
            ? `<p>${esc(`${T.rhythmLabel(x.record.rhythm || { kind: "weekly" })}. ${due.line}`)}</p>${plan ? `<p class="sp-caption">${esc(plan.line)}.</p>` : ""}
               <div class="sp-actions"><button type="button" class="button button--ghost" data-tended>${item.shelf === "herbs" || (item.shelf === "oils" && best) ? "Checked or replaced today" : "Tended today"}</button></div>`
            : `<p class="sp-muted">${item.shelf === "decks" ? "Decks are cleansed when they need it, after heavy use. Turn tending on from Change if you’d like a rhythm." : "Not tended in To tend. Turn it on from Change."}</p>`
        }
        ${best ? `<p class="sp-caption">${M.pastBest(item, new Date()) ? esc(`Past its best-by day (${day(best)}). Many keep it longer if it still smells and looks right.`) : esc(`Best by about ${day(best)}.`)}</p>` : ""}
      </section>
      <div class="sp-actions">
        <a class="button" href="/altar/?shelf=${encodeURIComponent(id)}" title="Opens your altar with it set down">Place on my altar</a>
        <a class="button button--ghost" href="/rituals/shelves/?edit=${encodeURIComponent(id)}">Change</a>
      </div>
      <div class="sp-list">
        ${ref ? row(`/library/entry/?entity=${encodeURIComponent(ref)}`, "In the Living Library", "What it’s known for") : ""}
        ${row("/rituals/spell/", "Spell builder", "Build a working; what you have is shown as you go")}
        ${row("/today/tend/", "To tend", "Everything you tend, this among it")}
      </div>
      <section class="sp-stack"><p class="sp-eyebrow">Its story</p>
        ${story.length ? `<section class="sp-card"><ul class="sh-story">${story.slice(0, 40).map((l) => `<li>${esc(day(l.at))} · ${esc(l.text)}</li>`).join("")}</ul></section>` : `<p class="sp-muted">Its story begins here: tending, restocking, placing it on your altar and using it in a working are all kept.</p>`}
      </section>
      <div class="sp-actions"><button type="button" class="button button--ghost" data-remove>Take it off my shelves</button></div>`;
  }

  // ── Adding and changing ────────────────────────────────────────────────

  function startDraft() {
    if (params.get("edit")) {
      const entry = state.entries.find((e) => e.id === params.get("edit"));
      state.editing = entry ? entry.id : null;
      state.draft = entry ? { ...entry.item } : null;
      return;
    }
    const name = params.get("name") || "";
    if (!name && !params.get("key")) return;
    const key = params.get("key") || "";
    const found = key ? C.cabinetFormOf(key) : null;
    const nm = name || found?.item.name || "";
    state.draft = M.newItem({
      name: nm,
      shelf: M.SHELVES.some((s) => s.key === params.get("shelf")) ? params.get("shelf") : M.shelfFor(found?.item.category || params.get("type") || "", nm, found?.form.type || params.get("type") || ""),
      image: params.get("image") || found?.form.image || "",
      cabinetKey: key,
      ref: params.get("ref") || "",
      acquired: todayKey()
    });
  }

  function form() {
    const d = state.draft;
    if (!d) {
      return `
        <a class="sp-back" href="/rituals/shelves/">‹ My Shelves</a>
        <header class="rt-head"><p class="sp-eyebrow">My Shelves</p><h1>Add something</h1>
          <p class="sp-muted">Find it in the altar cabinet, so it keeps the cabinet’s picture and can be placed on your altar, or add your own with a photo.</p></header>
        <div class="sp-field"><label for="sh-find">Find it in the cabinet</label><input id="sh-find" type="search" value="${esc(state.query)}" placeholder="Rose quartz, bay, white candle…" data-find /></div>
        <div class="sp-list" data-found>${foundRows()}</div>
        <div class="sp-actions"><button type="button" class="button button--ghost" data-own>Add my own</button></div>`;
    }
    const plan = M.tendPlanFor(d.shelf, d.name);
    const places = M.whereSuggestions(state.entries.map((e) => e.item));
    const field = (id, label, value, attrs = "", tag = "input") =>
      `<div class="sp-field"><label for="${id}">${esc(label)}</label>${tag === "textarea" ? `<textarea id="${id}" ${attrs}>${esc(value)}</textarea>` : `<input id="${id}" value="${esc(value)}" ${attrs} />`}</div>`;
    return `
      <a class="sp-back" href="${state.editing ? itemHref(state.editing) : "/rituals/shelves/"}">‹ Back</a>
      <header class="rt-head"><p class="sp-eyebrow">My Shelves</p><h1>${state.editing ? esc(`Change ${d.name}`) : "I own this"}</h1></header>
      ${state.message ? `<p class="sp-notice" role="status">${esc(state.message)}</p>` : ""}
      <div class="sh-head">${thumb(d)}<div class="sp-field"><label for="sh-photo">${d.image ? "Use my own photo instead" : "Add a photo"}</label><input id="sh-photo" type="file" accept="image/png,image/jpeg,image/webp" data-photo /></div></div>
      ${field("sh-name", "Name", d.name, 'data-f="name" placeholder="What it is"')}
      <p class="sp-eyebrow">Shelf</p><div class="sp-chips">${M.SHELVES.map((s) => chip(s.label, d.shelf === s.key, `data-shelf="${s.key}"`)).join("")}</div>
      <p class="sp-eyebrow">How much</p>
      <div class="sp-chips">${chip("A count", d.qty.kind === "count", 'data-qty="count"')}${chip("Full, half or low", d.qty.kind === "level", 'data-qty="level"')}</div>
      ${d.qty.kind === "count" ? field("sh-n", "How many", String(d.qty.n), 'type="number" min="0" inputmode="numeric" data-n') : `<div class="sp-chips">${M.LEVELS.map((l) => chip(l.label, d.qty.level === l.value, `data-set-level="${l.value}"`)).join("")}</div>`}
      ${field("sh-where", "Where it’s kept", d.where, 'data-f="where" list="sh-places" placeholder="Kitchen shelf, altar drawer…"')}
      <datalist id="sh-places">${places.map((p) => `<option value="${esc(p)}"></option>`).join("")}</datalist>
      ${places.length ? `<div class="sp-chips">${places.map((p) => chip(p, d.where === p, `data-place="${esc(p)}"`)).join("")}</div>` : ""}
      <p class="sp-eyebrow">Where it came from</p>
      <div class="sp-chips">${M.SOURCES.map((s) => chip(s.label, d.source === s.value, `data-source="${s.value}"`)).join("")}</div>
      ${field("sh-from", "More about where it came from", d.sourceText, 'data-f="sourceText" placeholder="The shop, who gave it, where you found it"')}
      ${field("sh-when", "When you got it", d.acquired, 'type="date" data-f="acquired"')}
      ${field("sh-intent", "Intention", d.intention, 'data-f="intention" placeholder="What it’s for, if anything"')}
      ${field("sh-notes", "Notes", d.notes, 'data-f="notes"', "textarea")}
      <section class="sp-card"><h2 class="sp-card__title">Tending</h2>
        <label class="sp-check"><input type="checkbox" data-tend ${d.tend.on ? "checked" : ""} /> Tend it in To tend</label>
        <p class="sp-caption">${esc(plan ? plan.line : "This shelf asks nothing by itself; choose a rhythm if you’d like one.")}</p>
        ${d.tend.on ? `<div class="sp-chips">${M.SHELF_RHYTHMS.filter((r) => r.rhythm || plan).map((r, i) => chip(r.label, M.sameRhythm(d.tend.rhythm, r.rhythm), `data-rhythm="${i}"`)).join("")}</div>` : ""}
        ${d.qty.kind === "count" ? `<label class="sp-check"><input type="checkbox" data-countdown ${d.countDown ? "checked" : ""} /> Count down when used in a spell</label>` : ""}
      </section>
      <div class="sp-actions"><button type="button" class="button" data-save>${state.editing ? "Save changes" : "Put it on my shelves"}</button></div>`;
  }

  let index = null;
  function foundRows() {
    if (!state.query.trim()) return "";
    index = index || C.itemIndex();
    state.found = C.searchItems(index, state.query, { limit: 20 });
    return state.found.map((e, i) => `<button type="button" class="sp-row" data-pick="${i}"><span class="sp-row__text"><span class="sp-row__title">${esc(e.label)}</span><span class="sp-row__detail">${esc(e.detail)}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></button>`).join("");
  }

  /** A photo: uploaded to your account (as the altar's own pictures are), or kept small in this browser for a guest. */
  async function keepPhoto(file) {
    if (!file || !/^image\//.test(file.type)) return "";
    if (file.size > 8 * 1024 * 1024) throw new Error("That picture is too large. Choose one under 8 MB.");
    const bitmap = await global.createImageBitmap(file);
    const size = state.account ? 900 : 320;
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
    const canvas = global.document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (!state.account || !global.db) return canvas.toDataURL("image/webp", 0.8);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    const path = `${state.account.id}/shelves/${global.SaltCraft.uuid()}.webp`;
    const { error } = await global.db.storage.from("user-assets").upload(path, blob, { cacheControl: "31536000", upsert: false, contentType: "image/webp" });
    if (error) throw error;
    return global.db.storage.from("user-assets").getPublicUrl(path).data.publicUrl || "";
  }

  // ── Showing it ─────────────────────────────────────────────────────────

  function render() {
    const id = params.get("item");
    root.innerHTML = params.get("add") || params.get("edit") ? form() : id ? thing(id) : home();
    state.message = "";
  }

  const draftChanged = (change) => {
    state.draft = { ...state.draft, ...change };
    render();
  };

  root.addEventListener("input", (event) => {
    const t = event.target;
    if (t.matches("[data-search]")) {
      state.query = t.value;
      render();
      const input = root.querySelector("[data-search]");
      input?.focus();
      input?.setSelectionRange(input.value.length, input.value.length);
    } else if (t.matches("[data-find]")) {
      state.query = t.value;
      root.querySelector("[data-found]").innerHTML = foundRows();
    } else if (t.matches("[data-f]") && state.draft) state.draft = { ...state.draft, [t.dataset.f]: t.value };
    else if (t.matches("[data-n]") && state.draft) state.draft = { ...state.draft, qty: { kind: "count", n: Math.max(0, Math.round(Number(t.value) || 0)) } };
  });

  root.addEventListener("change", async (event) => {
    const t = event.target;
    if (t.matches("[data-photo]") && t.files?.[0]) {
      try {
        const image = await keepPhoto(t.files[0]);
        if (image) draftChanged({ image });
      } catch (error) {
        state.message = error?.message || "The photo couldn’t be kept. Please try again.";
        render();
      }
    } else if (t.matches("[data-tend]")) {
      const plan = M.tendPlanFor(state.draft.shelf, state.draft.name);
      draftChanged({ tend: { on: t.checked, rhythm: t.checked && !plan && !state.draft.tend.rhythm ? { kind: "every", every: 30 } : state.draft.tend.rhythm } });
    } else if (t.matches("[data-countdown]")) draftChanged({ countDown: t.checked });
  });

  root.addEventListener("click", (event) => {
    const t = event.target.closest("button");
    if (!t) return;
    const id = params.get("item");
    const entry = id ? state.entries.find((e) => e.id === id) : null;
    const d = state.draft;
    if (t.dataset.view) {
      state.view = t.dataset.view;
      try {
        global.localStorage.setItem(VIEW_KEY, state.view);
      } catch {
        /* storage blocked */
      }
      render();
    } else if (t.dataset.sort) {
      state.sort = t.dataset.sort;
      render();
    } else if (t.dataset.restock) {
      const e = state.entries.find((x) => x.id === t.dataset.restock);
      if (e) void attempt(() => save(e.id, M.restock(e.item, new Date())));
    } else if (t.hasAttribute("data-low") && entry) void attempt(() => save(entry.id, M.markLow(entry.item)));
    else if (t.dataset.count && entry && entry.item.qty.kind === "count") void attempt(() => save(entry.id, { ...entry.item, qty: { kind: "count", n: Math.max(0, entry.item.qty.n + Number(t.dataset.count)) } }));
    else if (t.dataset.level && entry) void attempt(() => save(entry.id, { ...entry.item, qty: { kind: "level", level: t.dataset.level }, low: t.dataset.level === "low" ? true : entry.item.low }));
    else if (t.hasAttribute("data-tended") && entry) {
      const x = recordOf(entry.id);
      if (x)
        void attempt(async () => {
          await global.SaltCraft.update(T.TEND_COLLECTION, x.id, T.recordDone(x.record, new Date()));
          await load();
          state.message = "Kept in its story and in To tend.";
        });
    } else if (t.hasAttribute("data-remove") && entry) {
      if (!global.confirm(`Take ${entry.item.name} off your shelves? Its tending in To tend will be removed too. Anything on your altar stays.`)) return;
      void attempt(async () => {
        await global.SaltCraft.remove(M.SHELVES_COLLECTION, entry.id);
        await syncTend(entry.id, null);
        global.location.href = "/rituals/shelves/";
      });
    } else if (t.dataset.pick) {
      const e = state.found[Number(t.dataset.pick)];
      const placed = e ? C.cabinetFormOf(e.key) : null;
      if (e) state.draft = M.newItem({ name: placed?.item.name || e.label, shelf: M.shelfFor(e.category, e.label, placed?.form.type || ""), image: placed?.form.image || e.image || "", cabinetKey: e.key, acquired: todayKey() });
      render();
    } else if (t.hasAttribute("data-own")) {
      state.draft = M.newItem({ name: "", shelf: "other", acquired: todayKey() });
      render();
    } else if (d && t.dataset.shelf) draftChanged({ shelf: t.dataset.shelf, tend: { ...d.tend, on: d.tend.rhythm ? d.tend.on : !!M.tendPlanFor(t.dataset.shelf, d.name) } });
    else if (d && t.dataset.qty) draftChanged({ qty: t.dataset.qty === "count" ? { kind: "count", n: d.qty.kind === "count" ? d.qty.n : 1 } : { kind: "level", level: d.qty.kind === "level" ? d.qty.level : "full" } });
    else if (d && t.dataset.setLevel) draftChanged({ qty: { kind: "level", level: t.dataset.setLevel } });
    else if (d && t.dataset.place) draftChanged({ where: t.dataset.place });
    else if (d && t.dataset.source) draftChanged({ source: t.dataset.source });
    else if (d && t.dataset.rhythm) draftChanged({ tend: { on: true, rhythm: M.SHELF_RHYTHMS[Number(t.dataset.rhythm)].rhythm } });
    else if (d && t.hasAttribute("data-save")) {
      if (!d.name.trim()) {
        state.message = "Give it a name first.";
        render();
        return;
      }
      const item = M.cleanItem(d);
      void attempt(async () => {
        if (state.editing) {
          await save(state.editing, item);
          global.location.href = itemHref(state.editing);
        } else {
          const newId = await add(item);
          global.location.href = itemHref(newId);
        }
      });
    }
  });

  (async () => {
    try {
      await load();
      if (params.get("item")) await loadAltars();
      if (params.get("add") || params.get("edit")) startDraft();
    } catch (error) {
      console.error(error);
      state.message = "Your shelves couldn’t be opened. Please try again.";
    }
    render();
  })();
  global.SaltPage.onUserChange(() => global.location.reload());
})(window);
