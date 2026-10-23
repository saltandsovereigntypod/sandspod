/*
 * The sigil maker (/practice/eclectic/sigil/): a statement of intent made into
 * one mark, by the letter method, on a planetary square, or drawn by hand; ink
 * on aged paper. The app's screen is app/src/components/sigil/SigilMaker.tsx;
 * the logic is the app's own, from js/core/sigil.js. Sigils are kept in
 * craft_entries, collection `eclectic.sigils` ({ name, sigil }), as the app
 * keeps them, so the altar on either can carve them into a candle. A Grimoire
 * page is the same rows the app's saveSigilPage writes. Opened from the
 * Grimoire (?from=grimoire&section=…), saving there goes back to the new page.
 */
(function (global) {
  const kit = global.PracticeKit;
  const S = global.SaltCore?.sigil;
  const root = kit?.root();
  if (!kit || !S || !root) return;

  const params = new URLSearchParams(global.location.search);
  const fromGrimoire = params.get("from") === "grimoire";
  const sectionId = params.get("section") || null;
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const METHODS = [
    { id: "letters", label: "From the letters" },
    { id: "kamea", label: "On a planetary square" },
    { id: "freehand", label: "Draw it yourself" }
  ];

  const state = {
    intent: "",
    dropVowels: false,
    method: "letters",
    seed: 0,
    arrangement: "woven",
    planet: null,
    strokes: [],
    weight: S.DEFAULT_WEIGHT,
    ring: true,
    name: "",
    notice: "",
    savedPage: null,
    saving: false
  };
  let user = null;
  let kept = [];

  // ------------------------------------------------------------------ the sigil

  const reduction = () => S.reduceStatement(state.intent, state.dropVowels);
  const letters = () => reduction().kept;
  const planet = () => state.planet || S.suggestPlanet(letters()) || "saturn";
  function currentPath() {
    if (state.method === "letters") return S.letterArrangements(letters(), state.seed).find((o) => o.id === state.arrangement)?.d || "";
    if (state.method === "kamea") return S.traceKamea(letters(), planet())?.d || "";
    return S.freehandPath(state.strokes, 100);
  }
  function currentSigil() {
    return S.readSigil({
      version: 1,
      method: state.method,
      intent: state.intent.trim(),
      letters: letters(),
      planet: state.method === "kamea" ? planet() : null,
      d: currentPath(),
      weight: state.weight,
      ring: state.ring
    });
  }

  let ids = 0;
  const picture = (sigil, size, label) =>
    `<span class="sg-picture" style="width:${size}px;height:${size}px"${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'}>${S.sigilSvg(sigil, { size, id: `sg${ids++}` })}</span>`;

  /** The planet's square, faint, laid over the picture while it's being made. */
  function kameaOverlay(id) {
    const square = S.KAMEAS[id];
    const n = square.length;
    const box = S.SQUARE_BOX;
    const cell = (box.max - box.min) / n;
    const lines = [];
    for (let i = 0; i <= n; i++) {
      const v = box.min + i * cell;
      lines.push(`<line x1="${box.min}" y1="${v}" x2="${box.max}" y2="${v}"/><line x1="${v}" y1="${box.min}" x2="${v}" y2="${box.max}"/>`);
    }
    const numbers = square
      .map((row, r) => row.map((value, c) => `<text x="${box.min + (c + 0.5) * cell}" y="${box.min + (r + 0.5) * cell + cell * 0.14}" font-size="${cell * 0.38}">${value}</text>`).join(""))
      .join("");
    return `<svg class="sg-overlay" viewBox="0 0 100 100" aria-hidden="true"><g stroke="#6b4a2b" stroke-width="0.3" opacity="0.4">${lines.join("")}</g><g fill="#6b4a2b" opacity="0.4" text-anchor="middle" font-family="'Source Serif 4', serif">${numbers}</g></svg>`;
  }

  // ------------------------------------------------------------------ drawing

  function view() {
    ids = 0;
    const r = reduction();
    const L = r.kept;
    const sigil = currentSigil();
    const name = sigil ? S.sigilName(sigil) : "My sigil";
    const p = S.planetById(planet());
    const suggested = S.suggestPlanet(L);
    const total = [...L].reduce((sum, ch) => sum + S.letterValue(ch), 0);

    const intentPart = kit.section(
      "Your statement of intent",
      [
        kit.field({ id: "sg-intent", label: "What do you want?", value: state.intent, input: "sg-intent", multiline: true, placeholder: "I sleep deeply and wake rested" }),
        kit.muted("Write it plainly, in the present and in the positive: “I sleep deeply”, not “I want to stop lying awake”."),
        kit.toggle({ id: "sg-vowels", label: "Strike out the vowels too", detail: "Fewer letters make a simpler mark.", checked: state.dropVowels, change: "sg-vowels" }),
        `<div data-letters>${lettersCard(r)}</div>`
      ].join(""),
      { id: "intent" }
    );

    let methodBody = "";
    if (state.method === "letters") {
      const options = S.letterArrangements(L, state.seed);
      methodBody = [
        kit.muted("Austin Osman Spare’s way: lay the letters that are left over one another, turn or stack them, and let shared lines merge until it no longer reads as writing. Choose the one that feels right."),
        options.length
          ? `<div class="sg-options" role="radiogroup" aria-label="Arrangements">${options
              .map(
                (o) =>
                  `<button type="button" class="sg-option" role="radio" aria-checked="${o.id === state.arrangement}" data-act="sg-arrange" data-value="${esc(o.id)}" aria-label="${esc(`${o.label}. ${o.detail}`)}">${picture({ d: o.d, weight: state.weight, ring: false }, 140)}<span>${esc(o.label)}</span></button>`
              )
              .join("")}</div>${kit.actions([kit.button({ label: "Show other arrangements", act: "sg-shuffle", ghost: true })])}`
          : kit.muted("Write your intent above to see the letters put together.")
      ].join("");
    } else if (state.method === "kamea") {
      methodBody = [
        kit.muted(
          "The older, ceremonial way. Each of the seven planets has a magic square of numbers. Every letter becomes its number in the alphabet, A 1 to Z 26; where the square is too small for a number, its digits are added together until it fits. The sigil is the line traced from number to number across the square, with a small circle where it begins and a bar where it ends. Choose the planet whose nature suits the working."
        ),
        kit.chips(
          S.PLANETS.map((pl) => kit.chip({ label: `${pl.name} ${pl.size}×${pl.size}`, act: "sg-planet", value: pl.id, pressed: pl.id === planet(), a11y: `${pl.name}, ${pl.size} by ${pl.size}: ${pl.suits}` })),
          "Planet"
        ),
        kit.muted(`${p.name}: ${p.suits}. Its day is ${p.day}.`),
        suggested && L ? kit.muted(`In numerology your letters add up to ${total}, which comes down to ${S.digitalRoot(total)}, a number given to ${S.planetById(suggested).name}.`) : ""
      ].join("");
    } else {
      methodBody = [
        kit.muted("Put the letters together yourself. Draw them over one another, shrink some, turn others, let them go wherever your hand wants, until it is a shape and not a word. The letters left are above to guide you."),
        `<div class="sg-pad" data-pad role="img" aria-label="Drawing pad. Draw your sigil with a finger or the mouse.">${padPicture()}</div>`,
        kit.actions([kit.button({ label: "Undo last stroke", act: "sg-undo", ghost: true, disabled: !state.strokes.length }), kit.textButton({ label: "Clear", act: "sg-clear", disabled: !state.strokes.length })])
      ].join("");
    }

    const methodPart = kit.section(
      "How to make it",
      `${kit.chips(METHODS.map((m) => kit.chip({ label: m.label, act: "sg-method", value: m.id, pressed: state.method === m.id })), "How to make it")}${methodBody}`,
      { id: "method" }
    );

    const preview =
      state.method === "freehand"
        ? ""
        : sigil
          ? `<div class="sg-preview">${picture(sigil, 340, `Your sigil for ${name}`)}${state.method === "kamea" ? kameaOverlay(planet()) : ""}</div>${
              state.method === "kamea" ? kit.muted("The square is shown faintly to follow the path; it is not part of the sigil.") : ""
            }`
          : `<div class="sg-preview sg-preview--blank"><p class="sp-caption">Your sigil will appear here.</p></div>`;
    const lookPart = kit.section(
      "How it looks",
      `${kit.chips(S.WEIGHTS.map((w) => kit.chip({ label: `${w.label} line`, act: "sg-weight", value: String(w.value), pressed: state.weight === w.value })), "Line weight")}${kit.toggle({
        id: "sg-ring",
        label: "A circle around it",
        checked: state.ring,
        change: "sg-ring"
      })}${preview}`,
      { id: "look" }
    );

    const keepPart = sigil
      ? kit.section(
          "Keep it",
          [
            kit.field({ id: "sg-name", label: "Its name", value: state.name, input: "sg-name", placeholder: name }),
            kit.actions([
              fromGrimoire ? "" : kit.button({ label: "Keep it with my sigils", act: "sg-keep", primary: true, disabled: state.saving }),
              user
                ? kit.button({ label: fromGrimoire ? "Put it in my Grimoire" : "Give it a page in my Grimoire", act: "sg-grimoire", primary: fromGrimoire, ghost: !fromGrimoire, disabled: state.saving })
                : ""
            ]),
            user ? "" : kit.muted("Sign in to keep sigils in your Grimoire as pages, and with your account."),
            kit.notice(state.notice, { live: true }),
            state.savedPage ? kit.actions([kit.button({ label: "Open the page", url: `/grimoire/?page=${encodeURIComponent(state.savedPage)}`, ghost: true })]) : ""
          ].join(""),
          { id: "keep" }
        )
      : "";

    const charging = kit.details(
      "Charging it and letting go",
      `${kit.p(
        "Traditions differ, so use what suits you. Many people charge a sigil by gazing at it in a quiet, focused moment, or a heightened one, then put it away and set about forgetting it. Spare thought the forgetting mattered: the wish keeps working once the mind stops worrying at it."
      )}${kit.p("You can also carve it into a candle and let it burn down, draw it in salt or ink and burn the paper, or keep it hidden in your Grimoire until it has done its work.")}`,
      { id: "charging" }
    );

    const keptPart = kept.length
      ? kit.section(
          "Your sigils",
          `${kit.muted("To carve one into a candle, open a candle on your altar and choose Carve.")}<ul class="sg-kept">${kept
            .map(
              (k, i) =>
                `<li>${picture(k.sigil, 72, `Sigil for ${k.name}`)}<div><p class="sg-kept__name">${esc(k.name)}</p><div class="pr-row-actions">${
                  user ? kit.textButton({ label: "To my Grimoire", act: "sg-kept-grimoire", value: String(i) }) : ""
                }${kit.textButton({ label: "Remove", act: "sg-kept-remove", value: String(i), quiet: true })}</div></div></li>`
            )
            .join("")}</ul>${kit.muted(kit.savedLine(user, "your sigils"))}`,
          { id: "kept" }
        )
      : "";

    return [
      fromGrimoire ? kit.back("/grimoire/", "Your Grimoire") : kit.back(kit.href.practice("eclectic"), "Eclectic"),
      kit.head({
        eyebrow: fromGrimoire ? "Grimoire" : "Eclectic",
        title: "Sigil maker",
        lede: "A sigil is an intent folded into a single mark. You write what you want, take the words apart, and build a shape from what is left, so the mind can hold the wish without turning the words over and over."
      }),
      intentPart,
      methodPart,
      lookPart,
      keepPart,
      charging,
      keptPart
    ].join("");
  }

  function lettersCard(r) {
    if (r.kept)
      return kit.card(
        `<p class="sg-letters" aria-label="${esc(`Letters left: ${[...r.kept].join(", ")}`)}">${esc([...r.kept].join(" "))}</p>${r.dropped ? kit.caption(`Struck out: ${[...r.dropped].join(" ")}`) : ""}`,
        { label: "Letters left" }
      );
    return state.intent.trim() ? kit.notice("Only the letters A to Z are used. Try writing it in those.") : "";
  }

  function padPicture(live) {
    const d = S.freehandPath(live ? [...state.strokes, live] : state.strokes, 100);
    return S.sigilSvg({ d: d || "M50 50", weight: d ? state.weight : 0.8, ring: state.ring }, { size: 340, id: "sgpad" });
  }

  const draw = () => kit.render(root, view());
  const changed = () => {
    state.notice = "";
    state.savedPage = null;
  };

  // ------------------------------------------------------------------ saving

  async function loadKept() {
    const entries = await kit.entries(S.SIGILS);
    kept = (entries || [])
      .map((e) => ({ id: e.id, name: (e.data && e.data.name) || "My sigil", sigil: S.readSigil(e.data && e.data.sigil) }))
      .filter((k) => k.sigil);
  }

  async function saveToGrimoire(sigil, title) {
    const db = global.db;
    if (!user || !db) {
      state.notice = "Sign in to keep sigils in your Grimoire as pages.";
      return null;
    }
    // Row-level security limits these to your own rows.
    const [books, sections, pages] = await Promise.all([
      db.from("grimoire_books").select("id,title,created_at,updated_at").eq("user_id", user.id).order("created_at"),
      db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at").eq("user_id", user.id),
      db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at").eq("user_id", user.id)
    ]);
    const failed = [books, sections, pages].find((r) => r.error);
    if (failed) throw failed.error;
    const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
    const dateText = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    const { id, ops } = S.sigilPageOps(snapshot, { userId: user.id, now: new Date().toISOString() }, { sigil, title, sectionId: fromGrimoire ? sectionId : null, dateText }, S.newId);
    // In order: the book if there's none yet, the page, then its blocks.
    for (const op of ops) {
      if (op.kind !== "insert") continue;
      const { error } = await db.from(op.table).insert(op.row);
      if (error && error.code !== "23505") throw error;
    }
    return id;
  }

  async function toGrimoire(sigil, title) {
    if (state.saving) return;
    state.saving = true;
    draw();
    try {
      const id = await saveToGrimoire(sigil, title);
      if (id && fromGrimoire) {
        kit.go(`/grimoire/?page=${encodeURIComponent(id)}`);
        return;
      }
      if (id) {
        state.savedPage = id;
        state.notice = "It has its own page in your Grimoire now, with room for how you charge it.";
      }
    } catch (error) {
      console.error(error);
      state.notice = "It couldn’t be put in your Grimoire just now. Please try again in a moment.";
    } finally {
      state.saving = false;
      draw();
    }
  }

  // ------------------------------------------------------------------ wiring

  kit.delegate(root, {
    "sg-intent"(el) {
      state.intent = el.value;
      changed();
      draw();
    },
    "sg-vowels"(el) {
      state.dropVowels = el.checked;
      changed();
      draw();
    },
    "sg-method"(el) {
      state.method = el.dataset.value;
      changed();
      draw();
    },
    "sg-arrange"(el) {
      state.arrangement = el.dataset.value;
      changed();
      draw();
    },
    "sg-shuffle"() {
      state.seed += 1;
      changed();
      draw();
    },
    "sg-planet"(el) {
      state.planet = el.dataset.value;
      changed();
      draw();
    },
    "sg-undo"() {
      state.strokes = state.strokes.slice(0, -1);
      changed();
      draw();
    },
    "sg-clear"() {
      state.strokes = [];
      changed();
      draw();
    },
    "sg-weight"(el) {
      state.weight = Number(el.dataset.value);
      draw();
    },
    "sg-ring"(el) {
      state.ring = el.checked;
      draw();
    },
    "sg-name"(el) {
      state.name = el.value;
    },
    async "sg-keep"() {
      const sigil = currentSigil();
      if (!sigil || state.saving) return;
      state.saving = true;
      try {
        await kit.add(S.SIGILS, { name: state.name.trim() || S.sigilName(sigil), sigil });
        await loadKept();
        state.notice = "Kept with your sigils. To carve it into a candle, open a candle on your altar and choose Carve.";
      } catch (error) {
        console.error(error);
        state.notice = "It couldn’t be kept just now. Please try again.";
      } finally {
        state.saving = false;
        draw();
      }
    },
    async "sg-grimoire"() {
      const sigil = currentSigil();
      if (!sigil) return;
      const title = state.name.trim() || undefined;
      if (fromGrimoire) {
        try {
          await kit.add(S.SIGILS, { name: title || S.sigilName(sigil), sigil });
        } catch (error) {
          console.error(error);
        }
      }
      await toGrimoire(sigil, title);
    },
    async "sg-kept-grimoire"(el) {
      const k = kept[Number(el.dataset.value)];
      if (k) await toGrimoire(k.sigil, k.name);
    },
    async "sg-kept-remove"(el) {
      const k = kept[Number(el.dataset.value)];
      if (!k || !kit.confirm(`Let “${k.name}” go from your sigils? Pages and candles it is already on keep it.`)) return;
      await kit.remove(S.SIGILS, k.id);
      await loadKept();
      draw();
    }
  });

  // Drawing on the pad: pointer events, so a finger, a pen or a mouse all work.
  let live = null;
  const padAt = (pad, event) => {
    const rect = pad.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return [Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y))];
  };
  root.addEventListener("pointerdown", (event) => {
    const pad = event.target.closest?.("[data-pad]");
    if (!pad) return;
    event.preventDefault();
    pad.setPointerCapture?.(event.pointerId);
    live = [padAt(pad, event)];
    pad.innerHTML = padPicture(live);
  });
  root.addEventListener("pointermove", (event) => {
    const pad = event.target.closest?.("[data-pad]");
    if (!pad || !live) return;
    const p = padAt(pad, event);
    const last = live[live.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.5) return;
    live.push(p);
    pad.innerHTML = padPicture(live);
  });
  const finish = () => {
    if (!live) return;
    state.strokes = [...state.strokes, live].slice(-S.MAX_STROKES);
    live = null;
    changed();
    draw();
  };
  root.addEventListener("pointerup", finish);
  root.addEventListener("pointercancel", finish);

  kit.start(async (who) => {
    user = who;
    draw();
    await loadKept();
    draw();
  });
})(window);
