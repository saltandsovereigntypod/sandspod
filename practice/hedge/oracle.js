/*
 * Lenormand, Kipper and decks of your own on the website, as the app has
 * them (app/src/components/divination/oracle and the decks screens under
 * app/src/app/(tabs)/rituals/divination/decks). Two parts:
 *
 * - PracticeOracle: pieces the draw page and a reading's page use
 *   (practice/hedge/hedge.js): the cards' faces, Lenormand read in pairs,
 *   and logging a physical pull.
 * - The deck pages (/divination/decks/ and /divination/decks/edit/): your
 *   decks, and making or changing one with its cards, photos and a pasted
 *   list. Kept in craft_entries as `hedge.oracleDecks`, the app's shape;
 *   photos go to the `user-assets` bucket as the altar's do (signed in).
 *
 * Logic from js/core/divination.js (window.SaltCore.divination).
 */
(function (global) {
  const kit = global.PracticeKit;
  const Dv = global.SaltCore?.divination || null;
  if (!kit || !Dv) return;
  const esc = kit.esc;

  // ------------------------------------------------------------------ faces

  /** A card's front for Lenormand, Kipper or a deck of your own; null for tarot, runes and ogham. */
  function frontHtml(kind, item, deck) {
    if (kind === "lenormand") {
      const card = Dv.lenormand.lenormandCard(item.name);
      return `<span class="dv-face dv-front dv-card dv-card--lenormand"><img src="/assets/divination/lenormand/${esc(card?.id || "")}.webp" alt="" loading="lazy" /></span>`;
    }
    if (kind === "kipper") {
      const card = Dv.kipper.kipperCard(item.name);
      return `<span class="dv-face dv-front dv-card dv-kipper"><span class="dv-kipper__frame"><span class="dv-kipper__number">${esc(card?.number ?? "")}</span><span class="dv-kipper__name">${esc(
        card?.name ?? item.name
      )}</span><span class="dv-kipper__german">${esc(card?.german ?? "")}</span></span></span>`;
    }
    if (kind === "oracle") {
      const card = deck ? Dv.decks.ownCard(deck, item.name) : null;
      const photo = card && /^(https?:|data:image\/)/.test(card.photo) ? card.photo : "";
      return `<span class="dv-face dv-front dv-card dv-own${item.reversed ? " dv-card--reversed" : ""}">${
        photo
          ? `<img src="${esc(photo)}" alt="" loading="lazy" />`
          : `<span class="dv-own__plain"><span class="dv-own__name">${esc(item.name)}</span>${card?.keywords ? `<span class="dv-own__words">${esc(card.keywords)}</span>` : ""}</span>`
      }</span>`;
    }
    return null;
  }

  /** The flip's shape class for a kind of card. */
  const shapeClass = (kind) => (kind === "lenormand" ? " dv-flip--lenormand" : kind === "kipper" ? " dv-flip--kipper" : "");

  // ------------------------------------------------------------------ pairs

  /** Lenormand read in pairs under a draw (the app's PairsCard). */
  function pairsHtml(spread, draw) {
    if (spread.kind !== "lenormand") return "";
    const pairs = Dv.pairs.pairsForSpread(spread.id, draw.items.map((i) => i.name));
    if (!pairs.length) return "";
    return kit.card(
      `${kit.muted("The first card says what; the second says what kind.")}${pairs
        .map((p) => `<p class="dv-meaning__name">${esc(p.title)}</p><p class="dv-meaning__words">${esc(p.gist)}</p>${kit.p(p.text)}`)
        .join("")}`,
      { label: spread.id === "lenormand-grand-tableau" ? "Beside the Man and the Woman" : "Read in pairs" }
    );
  }

  // ------------------------------------------------------------------ a physical pull

  /**
   * Picking which card lay in each place (the app's PullPicker). Acts:
   * pull-put (data-value = name), pull-out (place), pull-turn (place);
   * input: pull-find.
   */
  function pullHtml(spread, pool, placed, reversible, query = "") {
    const next = placed.findIndex((p) => !p);
    const used = new Set(placed.filter(Boolean).map((p) => p.name));
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const choices = pool.filter((n) => !used.has(n) && words.every((w) => n.toLowerCase().includes(w)));
    const many = pool.length > 40;
    const shownChoices = many && !query.trim() ? choices.slice(0, 36) : choices;
    const rows = spread.positions.map((pos, i) => {
      const p = placed[i];
      return kit.row({
        act: "pull-out",
        data: { value: i },
        title: `${i + 1}. ${pos.name}`,
        detail: p ? `${p.name}${p.reversed ? ", reversed" : ""} · tap to take it out` : i === next ? "Next: choose the card you drew below" : "Empty"
      });
    });
    const turned =
      reversible && placed.some(Boolean)
        ? kit.section(
            "Any that came up reversed?",
            kit.chips(
              placed.map((p, i) => (p ? kit.chip({ label: `${i + 1}. ${p.name}`, act: "pull-turn", value: i, pressed: p.reversed }) : "")).filter(Boolean),
              "Reversed cards"
            ),
            { level: "h3" }
          )
        : "";
    const picking =
      next >= 0
        ? kit.section(
            `Which card is in place ${next + 1}?`,
            `${many ? kit.field({ id: "pull-find", label: "Find a card", value: query, input: "pull-find", placeholder: "Type part of its name" }) : ""}<div data-pull-choices>${kit.chips(
              shownChoices.map((n) => kit.chip({ label: n, act: "pull-put", value: n, a11y: `${n}, in place ${next + 1}` })),
              "Cards"
            )}${many && !query.trim() && choices.length > 36 ? kit.muted("Type to find the rest.") : ""}${choices.length ? "" : kit.muted("No card by that name left.")}</div>`,
            { level: "h3" }
          )
        : kit.muted("Every place is filled.");
    return `${kit.list(rows, "The places")}${turned}${picking}`;
  }

  global.PracticeOracle = { frontHtml, shapeClass, pairsHtml, pullHtml };

  // ------------------------------------------------------------------ the deck pages

  const root = kit.root();
  const view = root?.dataset.view;
  if (view !== "oracle-decks" && view !== "oracle-deck-edit") return;

  const D = Dv.decks;
  const params = new URLSearchParams(global.location.search);
  const id = params.get("id");
  const url = {
    decks: "/divination/decks/",
    edit: (x) => `/divination/decks/edit/${x ? `?id=${encodeURIComponent(x)}` : ""}`,
    draw: (x) => `/divination/draw/?kind=oracle${x ? `&deck=${encodeURIComponent(x)}` : ""}`,
    readings: "/divination/"
  };
  let user = null;
  let raw = [];
  let decks = [];
  let loaded = false;
  const form = { deck: null, open: null, paste: "", notice: "", saving: false, busy: false };

  async function load() {
    raw = await kit.entries(D.DECKS_COLLECTION);
    decks = D.ownDecks(raw);
    loaded = true;
  }

  const thumb = (src, cls) => (/^(https?:|data:image\/)/.test(src || "") ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy" />` : "");

  function decksView() {
    return [
      kit.back(url.readings, "Divination"),
      kit.head({ eyebrow: "Divination", title: "Your decks" }),
      kit.muted("Oracle decks you own or made: give each its cards (a photo of each if you like, and what it means to you), then draw from it with any spread, or log the cards you pull by hand."),
      kit.actions([kit.button({ label: "Make a deck", url: url.edit(), primary: true })]),
      !loaded
        ? kit.muted("Opening…")
        : decks.length
          ? kit.list(
              decks.map((d) =>
                kit.row({ url: url.edit(d.id), title: d.data.name, detail: kit.join([kit.plural(d.data.cards.length, "card", "cards"), d.data.detail || null]) })
              ),
              "Your decks"
            ) + kit.actions([kit.button({ label: "Draw from your decks", url: url.draw(), ghost: true })])
          : kit.card(kit.p("No decks yet. Start with its name; you can paste in a whole list of cards at once, one “Name — meaning” to a line.")),
      !user ? kit.notice("Saved in this browser. Sign in to keep your decks with your account, and in the app.") : ""
    ].join("");
  }

  function cardHtml(card, i, deck) {
    if (form.open !== card.id) {
      return kit.card(
        `<div class="dv-deck-card">${thumb(card.photo, "dv-deck-card__thumb") || '<span class="dv-deck-card__thumb dv-deck-card__thumb--blank"></span>'}<span class="dv-deck-card__text"><span class="dv-deck-card__name">${esc(
          card.name || `Card ${i + 1}`
        )}</span>${card.keywords || card.meaning ? `<span class="sp-caption">${esc(card.keywords || card.meaning)}</span>` : ""}</span></div>${kit.textButton({ label: "Change", act: "card-open", value: card.id })}`
      );
    }
    const f = (key, label, placeholder, multiline) => kit.field({ id: `card-${key}-${card.id}`, label, value: card[key], input: "card-field", placeholder, multiline });
    return kit.card(
      [
        f("name", `${i + 1}. Its name`, "As printed on the card"),
        f("keywords", "A few words", "hope, renewal, rest"),
        f("meaning", "What it means", "From the guidebook, or in your own words", true),
        deck.reversals ? f("reversed", "Reversed (if you like)", "What it means upside down", true) : "",
        thumb(card.photo, "dv-deck-card__photo"),
        user
          ? `<label class="button button--ghost dv-file">${card.photo ? "Change the photo" : "Add a photo"}<input type="file" accept="image/png,image/jpeg,image/webp" data-change="card-photo" data-card="${esc(card.id)}" /></label>`
          : kit.muted("Sign in to add photos of your cards."),
        kit.actions([
          card.photo ? kit.textButton({ label: "Take the photo off", act: "card-photo-off", value: card.id }) : "",
          kit.textButton({ label: "Done", act: "card-close" }),
          kit.textButton({ label: "Take this card out", act: "card-remove", value: card.id })
        ])
      ].join(""),
      { gold: true }
    );
  }

  function deckEditView() {
    const existing = id ? raw.find((e) => e.id === id) : null;
    const back = kit.back(url.decks, "Your decks");
    if (id && !existing) return [back, kit.head({ title: "Your deck" }), kit.p(loaded ? "This deck couldn’t be found. It may have been deleted on another device." : "Opening…")].join("");
    if (!form.deck) form.deck = existing ? D.normalizeOwnDeck(existing.data) : D.blankOwnDeck();
    const deck = form.deck;
    return [
      back,
      kit.head({ eyebrow: existing ? "Change your deck" : "Make a deck", title: deck.name.trim() || "Your deck" }),
      kit.field({ id: "deck-name", label: "Its name", value: deck.name, input: "deck-field", placeholder: "The deck’s name, as it’s printed or as you call it" }),
      kit.field({ id: "deck-detail", label: "A line about it (if you like)", value: deck.detail, input: "deck-field", placeholder: "Who made it, or what you use it for" }),
      kit.section(
        "Cover",
        `${thumb(deck.cover, "dv-deck-cover")}${
          user
            ? `<div class="sp-actions"><label class="button button--ghost dv-file">${deck.cover ? "Change the cover photo" : "Add a cover photo"}<input type="file" accept="image/png,image/jpeg,image/webp" data-change="cover-photo" /></label>${
                deck.cover ? kit.textButton({ label: "Take the cover off", act: "cover-off" }) : ""
              }</div>`
            : kit.muted("Sign in to add a cover photo.")
        }`,
        { id: "deck-cover" }
      ),
      kit.toggle({
        id: "deck-reversals",
        label: "Read reversals",
        detail: "Cards can come up upside down when you draw here, with the reversed meaning you write (or the upright one, turned).",
        checked: deck.reversals,
        change: "deck-reversals"
      }),
      kit.section(
        `The cards (${deck.cards.length})`,
        `${deck.cards.length ? "" : kit.muted("Add cards one at a time, or paste a list below.")}${deck.cards.map((c, i) => cardHtml(c, i, deck)).join("")}${
          deck.cards.length < D.MAX_CARDS ? kit.actions([kit.button({ label: "Add a card", act: "card-add", ghost: true })]) : ""
        }`,
        { id: "deck-cards" }
      ),
      kit.section(
        "Paste a list of cards",
        `${kit.muted("One card to a line: “The Moon — trust what you feel”, or “The Moon — intuition, dreams — trust what you feel” with a few words between. Numbers in front are fine.")}${kit.field({
          id: "deck-paste",
          label: "The list",
          value: form.paste,
          input: "deck-paste",
          multiline: true,
          placeholder: "Ancestors — those who came before"
        })}${kit.actions([kit.button({ label: "Add these cards", act: "deck-import", ghost: true })])}`,
        { id: "deck-paste-section" }
      ),
      kit.notice(form.notice, { live: true }),
      !user ? kit.notice("Saved in this browser. Sign in to keep your decks with your account, and in the app.") : "",
      kit.actions([
        kit.button({ label: form.saving ? "Keeping it…" : existing ? "Save changes" : "Keep this deck", act: "deck-save", primary: true, disabled: form.saving || form.busy }),
        existing ? kit.button({ label: "Draw from it", url: url.draw(existing.id), ghost: true }) : "",
        existing ? kit.textButton({ label: "Delete this deck", act: "deck-delete" }) : ""
      ])
    ].join("");
  }

  const draw = () => kit.render(root, view === "oracle-decks" ? decksView() : deckEditView());
  const card = (cardId) => form.deck.cards.find((c) => c.id === cardId);

  /** Upload a picked photo to the account's own folder, as the altar does. */
  async function upload(file) {
    if (!user || !global.db) throw new Error("Sign in to add photos.");
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Choose a PNG, JPEG or WebP picture.");
    if (file.size > 8 * 1024 * 1024) throw new Error("That picture is too large. Choose one under 8 MB.");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const name = global.crypto?.randomUUID ? global.crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const path = `${user.id}/${D.DECK_PHOTO_FOLDER}/${name}.${ext}`;
    const { error } = await global.db.storage.from("user-assets").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) throw new Error(error.message);
    return { url: global.db.storage.from("user-assets").getPublicUrl(path).data.publicUrl, path };
  }
  const removeUploaded = (paths) => (user && global.db && paths.length ? global.db.storage.from("user-assets").remove(paths).catch(() => undefined) : Promise.resolve());

  async function photo(el, apply) {
    const file = el.files?.[0];
    if (!file) return;
    form.busy = true;
    form.notice = "Saving the photo…";
    draw();
    try {
      apply(await upload(file));
      form.notice = "";
    } catch (error) {
      form.notice = error?.message || "The photo couldn’t be saved. Please try again.";
    } finally {
      form.busy = false;
      draw();
    }
  }

  kit.delegate(root, {
    "deck-field"(el) {
      form.deck[el.id === "deck-name" ? "name" : "detail"] = el.value;
    },
    "deck-reversals"(el) {
      form.deck.reversals = el.checked;
      draw();
    },
    "deck-paste"(el) {
      form.paste = el.value;
    },
    "deck-import"() {
      const result = D.importCards(form.deck, form.paste);
      form.deck = result.deck;
      form.paste = "";
      form.notice =
        kit.join(
          [
            result.added ? `${kit.plural(result.added, "card", "cards")} added.` : null,
            result.updated ? `${result.updated} filled in.` : null,
            result.skipped ? `${result.skipped} left out: a deck holds ${D.MAX_CARDS} at most.` : null
          ],
          " "
        ) || "Nothing new in that list.";
      draw();
    },
    "card-add"() {
      if (form.deck.cards.length >= D.MAX_CARDS) return;
      const c = D.blankOwnCard();
      form.deck.cards.push(c);
      form.open = c.id;
      draw();
      root.querySelector(`#card-name-${CSS.escape(c.id)}`)?.focus();
    },
    "card-open"(el) {
      form.open = el.dataset.value;
      draw();
    },
    "card-close"() {
      form.open = null;
      draw();
    },
    "card-remove"(el) {
      form.deck.cards = form.deck.cards.filter((c) => c.id !== el.dataset.value);
      draw();
    },
    "card-field"(el) {
      const [, key, ...rest] = el.id.split("-");
      const c = card(rest.join("-"));
      if (c) c[key] = el.value;
    },
    "card-photo"(el) {
      return photo(el, (saved) => Object.assign(card(el.dataset.card) || {}, { photo: saved.url, photoPath: saved.path }));
    },
    "card-photo-off"(el) {
      Object.assign(card(el.dataset.value) || {}, { photo: "", photoPath: "" });
      draw();
    },
    "cover-photo"(el) {
      return photo(el, (saved) => Object.assign(form.deck, { cover: saved.url, coverPath: saved.path }));
    },
    "cover-off"() {
      Object.assign(form.deck, { cover: "", coverPath: "" });
      draw();
    },
    async "deck-save"() {
      if (form.saving) return;
      const data = D.tidyOwnDeck(form.deck);
      form.saving = true;
      draw();
      try {
        if (id) {
          const before = raw.find((e) => e.id === id);
          await kit.update(D.DECKS_COLLECTION, id, data);
          const kept = new Set(D.deckStoragePaths(data));
          if (before) await removeUploaded(D.deckStoragePaths(D.normalizeOwnDeck(before.data)).filter((p) => !kept.has(p)));
          kit.go(url.decks);
        } else {
          const entry = await kit.add(D.DECKS_COLLECTION, data);
          kit.go(url.draw(entry.id));
        }
      } catch (error) {
        console.error(error);
        form.saving = false;
        form.notice = `It couldn’t be kept${error?.message ? ` (${error.message})` : ""}. Your words are still here.`;
        draw();
      }
    },
    async "deck-delete"() {
      if (!kit.confirm("Delete this deck? It and its cards will be removed on every device. Readings you drew from it are kept.")) return;
      const before = raw.find((e) => e.id === id);
      try {
        await kit.remove(D.DECKS_COLLECTION, id);
        if (before) await removeUploaded(D.deckStoragePaths(D.normalizeOwnDeck(before.data)));
        kit.go(url.decks);
      } catch (error) {
        console.error(error);
        form.notice = "It couldn’t be deleted. Please try again.";
        draw();
      }
    }
  });

  kit.start(async (who) => {
    user = who;
    await load();
    draw();
  });
})(window);
