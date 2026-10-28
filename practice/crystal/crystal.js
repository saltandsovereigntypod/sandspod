/*
 * Crystal: the practice page, My stones, a stone, adding or editing one, and
 * Stone care, as the app has them (app/src/app/(tabs)/rituals/craft/crystal).
 * Stones live in craft_entries "crystal.stones"; how often they fall due in
 * "crystal.settings" (a single entry).
 */
(function () {
  const PB = window.PracticeB;
  const { h, links } = PB;
  const B = window.SaltCore && window.SaltCore["practice-b"];
  const HUB = { href: "/practice/crystal/", label: "Crystal" };
  const STONES_URL = "/practice/crystal/stones/";
  const stoneUrl = (id) => `/practice/crystal/stone/?id=${encodeURIComponent(id)}`;
  const editUrl = (id) => `/practice/crystal/stone-edit/${id ? `?id=${encodeURIComponent(id)}` : ""}`;
  const careUrl = (key) => `/practice/crystal/care/${key ? `?key=${encodeURIComponent(key)}` : ""}`;
  const tidy = (s) => String(s || "").toLowerCase().replace(/[’'`]/g, "").trim();

  async function loadAll() {
    const C = B.crystalCollections;
    const [stones, settings] = await Promise.all([PB.listEntries(C.STONES), PB.listEntries(C.SETTINGS)]);
    return {
      entries: stones.entries,
      settings: settings.entries,
      rule: B.stones.normaliseRule(settings.entries[0]?.data?.cleanse),
      problem: stones.problem || settings.problem
    };
  }

  // ── The practice page ─────────────────────────────────────────────────────
  async function hub(root) {
    const S = B.stones;
    const about = B.premade.PRACTICES.find((p) => p.id === "crystal")?.about;
    const tools = B.practices.CRAFT_TOOLS.crystal;
    const { entries, rule, problem } = await loadAll();
    const now = new Date();
    const due = entries.filter((e) => S.cleanseStatus(S.normaliseStone(e.data), rule, now).due).length;
    const moon = B.moon.moonState(now);
    const full = B.moon.nextPhase(now, "full");
    const details = [
      entries.length ? `${entries.length} ${entries.length === 1 ? "stone" : "stones"}${due ? ` · ${due} due for cleansing` : " · all cleansed"}` : null,
      `${B.care.STONE_CARE.length} stones: water, sun, salt and handling`
    ];
    const routes = [STONES_URL, careUrl()];

    root.innerHTML = [
      h.head("Craft tools", "Crystal", { href: links.hub, label: "Craft tools" }),
      about ? h.muted(about) : "",
      h.notice(problem),
      h.card(
        `${h.label("The moon for your stones")}${h.cardTitle(moon.name === "Full Moon" ? "Full moon: a night for charging" : `Full moon ${B.calendar.relativeDay(now, full)}`)}${h.muted(
          moon.name === "Full Moon"
            ? "Set your stones out on a windowsill or outside tonight. Bring sun-fading ones in before morning."
            : moon.waxing
              ? "The moon is waxing: a time to programme stones for what you’re drawing in."
              : "The moon is waning: a time to cleanse stones and let go of what they’ve held."
        )}`,
        { gold: true }
      ),
      h.section("Tools", h.list(tools.map((tool, i) => h.row({ href: routes[i], title: tool.title, detail: details[i] ?? tool.detail })), "Crystal tools")),
      h.list([h.row({ href: links.premadeFor("crystal"), title: "Crystal workings", detail: "Premade rituals and spells; filter by Crystal" })])
    ].join("");
  }

  // ── My stones ─────────────────────────────────────────────────────────────
  const RULES = [
    { label: "Every week", rule: { kind: "days", days: 7 } },
    { label: "Every 2 weeks", rule: { kind: "days", days: 14 } },
    { label: "Every 30 days", rule: { kind: "days", days: 30 } },
    { label: "Every 3 months", rule: { kind: "days", days: 90 } },
    { label: "After each full moon", rule: { kind: "fullMoon" } }
  ];
  const sameRule = (a, b) => a.kind === b.kind && (a.kind === "fullMoon" || (b.kind === "days" && a.days === b.days));

  async function stonesPage(root) {
    const S = B.stones;
    let { entries, settings, rule, problem } = await loadAll();

    const draw = () => {
      const now = new Date();
      const stones = S.sortStones(entries.map((e) => ({ id: e.id, data: S.normaliseStone(e.data) })), rule, now);
      const due = stones.filter((s) => S.cleanseStatus(s.data, rule, now).due).length;
      const cards = stones
        .map((s) => {
          const status = S.cleanseStatus(s.data, rule, now);
          const care = B.care.findCare(s.data.key, s.data.name);
          const form = S.STONE_FORMS.find((f) => f.key === s.data.form)?.label;
          const detail = status.last ? `Cleansed ${S.daysAgo(now, status.last)}` : status.label;
          const label = [s.data.name, form, status.due ? "Due for cleansing" : null, detail, care ? B.care.careBadges(care).join(", ") : null].filter(Boolean).join(". ");
          return `<a class="pb-stone${status.due ? " is-due" : ""}" href="${h.esc(stoneUrl(s.id))}" aria-label="${h.esc(label)}"><span class="pb-head"><span class="pb-stone__name">${h.esc(s.data.name)}</span>${
            form ? `<span class="sp-caption">${h.esc(form)}</span>` : ""
          }</span><span class="sp-caption${status.due ? " pb-gold" : ""}">${h.esc(status.due && status.last ? `Due · ${detail}` : detail)}</span>${
            s.data.intentions.length ? `<span class="sp-caption">${h.esc(`Working on: ${s.data.intentions.join(", ")}`)}</span>` : ""
          }${care ? h.tags(B.care.careBadges(care).slice(1), true) : ""}</a>`;
        })
        .join("");

      PB.paint(
        root,
        [
          h.head("Crystal", "My stones", HUB),
          h.actions([h.button("Add a stone", { href: editUrl() })]),
          h.notice(problem),
          stones.length
            ? h.section(due ? `${due} due for cleansing` : "All cleansed", cards)
            : h.muted("Your collection lives here: each stone, where it came from, what it’s working on, and when you last cleansed, charged or programmed it."),
          h.details(
            "When stones fall due",
            `${h.muted("A stone shows as due for cleansing when its last cleansing is older than this. Charging and programming don’t count.")}${h.chips(
              RULES.map((r, i) => h.chip(r.label, { pressed: sameRule(r.rule, rule), attrs: { "data-action": "rule", "data-rule": i, "data-focus": `rule-${i}` } })),
              "When stones fall due"
            )}${h.notice(rule.kind === "fullMoon" ? "Due once a full moon has passed since the last cleansing." : `Due ${rule.days} days after the last cleansing.`)}`,
            { open: root.querySelector("details")?.open }
          )
        ].join("")
      );
    };

    PB.bind(root, {
      click: {
        rule: async (el) => {
          const next = RULES[Number(el.getAttribute("data-rule"))].rule;
          const data = { cleanse: next };
          const C = B.crystalCollections;
          try {
            if (settings[0]) await window.SaltCraft.update(C.SETTINGS, settings[0].id, data);
            else settings = [await window.SaltCraft.add(C.SETTINGS, data)];
            settings[0] = { ...settings[0], data };
            rule = B.stones.normaliseRule(next);
            problem = null;
          } catch {
            problem = "That couldn’t be saved just now. Please try again.";
          }
          draw();
        }
      }
    });
    draw();
  }

  // ── One stone ─────────────────────────────────────────────────────────────
  const KINDS = ["cleansed", "charged", "programmed"];

  async function stonePage(root) {
    const S = B.stones;
    const C = B.crystalCollections;
    const { fullDate, shortDate } = B.calendar;
    const id = PB.query("id");
    const { entries, rule, problem: loadProblem } = await loadAll();
    const entry = entries.find((e) => e.id === id) ?? null;
    if (!entry) {
      root.innerHTML = [h.head("My stones", "Stone", { href: STONES_URL, label: "My stones" }), h.notice(loadProblem), h.muted("This stone isn’t in your collection any more.")].join("");
      return;
    }
    let stone = S.normaliseStone(entry.data);
    const log = { kind: "cleansed", method: "", intention: "", note: "", earlier: "", problem: null, saved: null };
    const care = B.care.findCare(stone.key, stone.name);
    const careBlock = care
      ? h.card(
          `${h.label("Care")}${h.tags(B.care.careBadges(care))}${h.p(care.note)}${h.muted(
            `Suits: ${care.cleanse.map((m) => B.care.CLEANSE_METHODS.find((x) => x.key === m).label.toLowerCase()).join(", ")}.`
          )}${care.handling !== "none" ? h.notice(B.care.ELIXIR_NOTE) : h.muted(B.care.ELIXIR_NOTE)}`
        )
      : h.card(
          `${h.label("Care")}${h.muted(
            "Stone care has no notes for this name. Until you know it’s hardy, keep it out of water, salt and strong sun; smoke, sound and moonlight are safe for every stone."
          )}`
        );

    const save = async (data) => {
      await window.SaltCraft.update(C.STONES, entry.id, data);
      stone = data;
    };

    const logHtml = () => {
      const warning = log.kind !== "programmed" && log.method ? B.care.methodWarning(care, log.method) : null;
      const presets = log.kind === "cleansed" ? S.CLEANSE_PRESETS : log.kind === "charged" ? S.CHARGE_METHODS : [];
      return [
        h.chips(KINDS.map((k) => h.chip(S.KIND_LABEL[k], { pressed: log.kind === k, attrs: { "data-action": "kind", "data-kind": k, "data-focus": `kind-${k}` } })), "What you did"),
        log.kind === "programmed"
          ? h.field({ id: "log-intention", label: "Programmed for", value: log.intention, placeholder: "e.g. Steady sleep", attrs: { "data-input": "intention" } })
          : `${h.chips(
              presets.map((p) => {
                const unsafe = B.care.methodWarning(care, p);
                return h.chip(unsafe ? `${p} ⚠` : p, { pressed: log.method === p, a11y: unsafe ? `${p}, not advised for this stone` : undefined, attrs: { "data-action": "preset", "data-method": p, "data-focus": `preset-${p}` } });
              }),
              "Methods"
            )}${h.field({
              id: "log-method",
              label: log.kind === "cleansed" ? "How you cleansed it" : "How you charged it",
              value: log.method,
              placeholder: "Pick one above or describe your own",
              attrs: { "data-input": "method" }
            })}`,
        `<div data-part="warning" aria-live="polite">${warning ? h.notice(warning) : ""}</div>`,
        h.field({ id: "log-note", label: "Note (optional)", value: log.note, placeholder: "Anything you noticed", attrs: { "data-input": "note" } }),
        h.field({ id: "log-earlier", label: "On an earlier day? (year-month-day)", value: log.earlier, placeholder: "Leave blank for now", attrs: { "data-input": "earlier", autocomplete: "off" } }),
        `<div aria-live="polite">${h.notice(log.problem)}${h.notice(log.saved)}</div>`,
        h.actions([h.button(`Log ${S.KIND_LABEL[log.kind].toLowerCase()}`, { attrs: { "data-action": "log", "data-focus": "log" } })])
      ].join("");
    };

    const draw = () => {
      const now = new Date();
      const status = S.cleanseStatus(stone, rule, now);
      const history = S.careHistory(stone);
      const form = S.STONE_FORMS.find((f) => f.key === stone.form)?.label;
      const lastCharged = S.lastCare(stone, "charged");
      const lastProgrammed = S.lastCare(stone, "programmed");
      const about = stone.intentions.length || stone.source || stone.acquired || stone.notes;
      const linkRows = care
        ? [
            h.row({ href: careUrl(care.key), title: "Stone care", detail: `${care.name} and similar stones` }),
            care.library ? h.row({ href: links.library(`traditional:crystal:${care.key}`), title: `${care.name} in the Library`, detail: "Correspondences, uses and lore" }) : ""
          ].filter(Boolean)
        : [h.row({ href: careUrl(), title: "Stone care", detail: "Which stones are safe in water, sun and salt" })];

      PB.paint(
        root,
        [
          h.head(form ?? "Stone", stone.name, { href: STONES_URL, label: "My stones" }),
          h.notice(loadProblem),
          h.card(
            `${h.label("Cleansing")}${h.cardTitle(status.due ? "Due for cleansing" : "Cleansed", status.due ? "pb-gold" : "")}${h.muted(
              status.last ? `Last cleansed ${fullDate(status.last)}. ${status.label}.` : "Not cleansed yet."
            )}${lastCharged ? h.muted(`Last charged ${fullDate(lastCharged.at)}${lastCharged.method ? ` · ${lastCharged.method}` : ""}`) : ""}${
              lastProgrammed ? h.muted(`Programmed for ${lastProgrammed.intention} · ${fullDate(lastProgrammed.at)}`) : ""
            }`,
            { gold: status.due }
          ),
          careBlock,
          h.section("Log care", h.card(`<div class="pb-stack" data-part="log">${logHtml()}</div>`)),
          about
            ? h.card(
                `${h.label("About this stone")}${stone.intentions.length ? h.p(`Working on: ${stone.intentions.join(", ")}`) : ""}${stone.source ? h.muted(`From ${stone.source}`) : ""}${
                  stone.acquired ? h.muted(`Acquired ${fullDate(stone.acquired) ?? stone.acquired}`) : ""
                }${stone.notes ? h.p(stone.notes) : ""}`
              )
            : "",
          h.section(
            "History",
            history.length
              ? `<ul class="pb-history">${history
                  .map(
                    (c) =>
                      `<li><span class="pb-what"><strong>${h.esc(`${S.KIND_LABEL[c.kind]}${c.method ? ` · ${c.method}` : ""}${c.intention ? ` for ${c.intention}` : ""}`)}</strong><span class="sp-caption">${h.esc(
                        fullDate(c.at)
                      )}</span>${c.note ? `<span class="sp-caption">${h.esc(c.note)}</span>` : ""}</span>${h.button("Remove", {
                        variant: "text",
                        attrs: { "data-action": "forget", "data-id": c.id, "aria-label": `Remove ${S.KIND_LABEL[c.kind].toLowerCase()} on ${fullDate(c.at)}` }
                      })}</li>`
                  )
                  .join("")}</ul>`
              : h.muted("Nothing logged yet.")
          ),
          h.list(linkRows),
          h.actions([h.button("Edit stone", { variant: "ghost", href: editUrl(entry.id) }), h.button("Delete from my collection", { variant: "text", attrs: { "data-action": "remove" } })])
        ].join("")
      );
    };

    const part = (name) => root.querySelector(`[data-part="${name}"]`);
    const redrawLog = () => PB.paint(part("log"), logHtml());

    PB.bind(root, {
      input: {
        intention: (el) => (log.intention = el.value),
        method: (el) => {
          log.method = el.value;
          const warning = log.method ? B.care.methodWarning(care, log.method) : null;
          part("warning").innerHTML = warning ? h.notice(warning) : "";
          root.querySelectorAll('[data-action="preset"]').forEach((chip) => chip.setAttribute("aria-pressed", chip.getAttribute("data-method") === log.method ? "true" : "false"));
        },
        note: (el) => (log.note = el.value),
        earlier: (el) => (log.earlier = el.value)
      },
      click: {
        kind: (el) => {
          log.kind = el.getAttribute("data-kind");
          log.method = "";
          redrawLog();
        },
        preset: (el) => {
          const p = el.getAttribute("data-method");
          log.method = log.method === p ? "" : p;
          redrawLog();
        },
        log: async () => {
          log.problem = null;
          log.saved = null;
          const earlier = log.earlier.trim();
          if (log.kind === "programmed" && !log.intention.trim()) log.problem = "What are you programming it for?";
          else if (earlier && !S.isDateKey(earlier)) log.problem = "Enter the date as year-month-day, or leave it blank for now.";
          const at = earlier ? new Date(`${earlier}T12:00:00`) : new Date();
          if (!log.problem && at.getTime() > Date.now() + 60000) log.problem = "That date is still to come.";
          if (log.problem) return redrawLog();
          const item = {
            id: S.careId(),
            kind: log.kind,
            at: at.toISOString(),
            ...(log.kind === "programmed" ? { intention: log.intention.trim() } : log.method.trim() ? { method: log.method.trim() } : {}),
            ...(log.note.trim() ? { note: log.note.trim() } : {})
          };
          const intentions = log.kind === "programmed" && !stone.intentions.includes(item.intention) ? [...stone.intentions, item.intention] : stone.intentions;
          try {
            await save({ ...stone, intentions, care: [item, ...stone.care] });
            const kind = log.kind;
            Object.assign(log, { method: "", intention: "", note: "", earlier: "", saved: `${S.KIND_LABEL[kind]} ${earlier ? `on ${shortDate(at)}` : "today"}.` });
            draw();
            root.querySelector('[data-action="log"]')?.focus();
          } catch {
            log.problem = "That couldn’t be saved just now. Please try again.";
            redrawLog();
          }
        },
        forget: async (el) => {
          const item = stone.care.find((c) => c.id === el.getAttribute("data-id"));
          if (!item) return;
          if (!PB.confirmAction("Remove this from the history?", `${S.KIND_LABEL[item.kind]} on ${fullDate(item.at)}.`)) return;
          try {
            await save({ ...stone, care: stone.care.filter((c) => c.id !== item.id) });
            draw();
          } catch {
            window.alert("That couldn’t be removed just now. Please try again.");
          }
        },
        remove: async () => {
          if (!PB.confirmAction(`Delete ${stone.name}?`, "It and its care history are deleted from your collection. This can’t be undone.")) return;
          try {
            await window.SaltCraft.remove(C.STONES, entry.id);
            window.location.href = STONES_URL;
          } catch {
            window.alert("That couldn’t be removed just now. Please try again.");
          }
        }
      }
    });
    draw();
  }

  // ── Add or edit a stone ───────────────────────────────────────────────────
  const POPULAR = ["amethyst", "clear_quartz", "rose_quartz", "black_tourmaline", "citrine", "selenite", "carnelian", "moonstone", "labradorite", "smoky_quartz", "obsidian", "tiger_eye"];

  async function stoneEdit(root) {
    const S = B.stones;
    const K = B.care;
    const C = B.crystalCollections;
    const id = PB.query("id");
    const { entries, problem: loadProblem } = await PB.listEntries(C.STONES);
    const existing = id ? entries.find((e) => e.id === id) ?? null : null;
    if (id && !existing) {
      root.innerHTML = [h.head("My stones", "Edit stone", { href: STONES_URL, label: "My stones" }), h.notice(loadProblem), h.muted("This stone isn’t in your collection any more.")].join("");
      return;
    }
    const start = existing ? S.normaliseStone(existing.data) : null;
    const st = {
      name: start?.name ?? "",
      key: start?.key ?? null,
      form: start?.form ?? "tumbled",
      source: start?.source ?? "",
      acquired: start?.acquired ?? "",
      notes: start?.notes ?? "",
      intentions: start ? start.intentions.join("\n") : ""
    };

    const matchHtml = () => {
      const picked = K.careByKey(st.key);
      const q = tidy(st.name);
      const matches = q ? K.STONE_CARE.filter((c) => [c.name, ...(c.aliases ?? [])].some((n) => tidy(n).includes(q))).slice(0, 12) : POPULAR.map((k) => K.careByKey(k)).filter(Boolean);
      const guessed = !picked ? K.findCare(null, st.name) : null;
      const care = picked ?? guessed;
      return `${h.chips(
        matches.map((c) => h.chip(c.name, { pressed: st.key === c.key, a11y: `${c.name}${c.library ? ", in the Library" : ""}`, attrs: { "data-action": "pick", "data-key": c.key, "data-focus": `pick-${c.key}` } })),
        "Stones"
      )}${
        care
          ? `${h.muted(`${picked ? "" : "Looks like "}${care.name}: ${K.careBadges(care).join(" · ")}`)}${care.handling === "toxic" ? h.notice(care.note) : ""}`
          : st.name.trim()
            ? h.muted("A stone of your own. Stone care has no notes for it, so check before using water, salt or sun.")
            : ""
      }`;
    };
    const formHtml = () =>
      h.chips(S.STONE_FORMS.map((f) => h.chip(f.label, { pressed: st.form === f.key, attrs: { "data-action": "form", "data-form": f.key, "data-focus": `form-${f.key}` } })), "Form");

    root.innerHTML = [
      h.head("My stones", existing ? "Edit stone" : "Add a stone", existing ? { href: stoneUrl(existing.id), label: "Stone" } : { href: STONES_URL, label: "My stones" }),
      h.notice(loadProblem),
      PB.signedIn() ? "" : h.muted("Saved in this browser. Sign in to keep your stones with your account."),
      h.card(
        `${h.label("Which stone")}${h.field({ id: "stone-name", label: "Name", value: st.name, placeholder: "Search the Library, or type your own", attrs: { "data-input": "name", autocomplete: "off" } })}<div class="pb-stack" data-part="match" aria-live="polite">${matchHtml()}</div>`
      ),
      h.card(`${h.label("Form")}<div data-part="form">${formHtml()}</div>`),
      h.card(
        [
          h.label("Its story"),
          h.field({ id: "stone-source", label: "Where it came from", value: st.source, placeholder: "A shop, a gift, a beach, a friend", attrs: { "data-input": "source" } }),
          h.field({ id: "stone-acquired", label: "Date acquired (year-month-day)", value: st.acquired, placeholder: "e.g. 2025-10-31", attrs: { "data-input": "acquired", autocomplete: "off" } }),
          h.field({ id: "stone-intentions", label: "Intentions it’s working on (one per line)", value: st.intentions, placeholder: "e.g. Calm sleep", multiline: true, attrs: { "data-input": "intentions" } }),
          h.field({ id: "stone-notes", label: "Notes", value: st.notes, placeholder: "How it feels, where it lives, what it’s paired with", multiline: true, attrs: { "data-input": "notes" } })
        ].join("")
      ),
      '<div data-part="problem" aria-live="assertive"></div>',
      h.actions([h.button("Save stone", { attrs: { "data-action": "save" } })])
    ].join("");

    const part = (name) => root.querySelector(`[data-part="${name}"]`);
    let saving = false;
    PB.bind(root, {
      input: {
        name: (el) => {
          st.name = el.value;
          const picked = K.careByKey(st.key);
          // A typed name that no longer matches the picked stone unpicks it.
          if (picked && tidy(st.name) !== tidy(picked.name)) st.key = null;
          PB.paint(part("match"), matchHtml());
        },
        source: (el) => (st.source = el.value),
        acquired: (el) => (st.acquired = el.value),
        intentions: (el) => (st.intentions = el.value),
        notes: (el) => (st.notes = el.value)
      },
      click: {
        pick: (el) => {
          const c = K.careByKey(el.getAttribute("data-key"));
          st.key = c.key;
          st.name = c.name;
          root.querySelector("#stone-name").value = c.name;
          PB.paint(part("match"), matchHtml());
        },
        form: (el) => {
          st.form = el.getAttribute("data-form");
          PB.paint(part("form"), formHtml());
        },
        save: async (el) => {
          const say = (text) => (part("problem").innerHTML = h.notice(text));
          say("");
          if (!st.name.trim()) return say("Name your stone first.");
          if (st.acquired.trim() && !S.isDateKey(st.acquired.trim())) return say("Enter the date as year-month-day, for example 2025-10-31, or leave it blank.");
          if (saving) return;
          const guessed = !K.careByKey(st.key) ? K.findCare(null, st.name) : null;
          const before = existing ? S.normaliseStone(existing.data) : null;
          const data = {
            key: st.key ?? guessed?.key ?? null,
            name: st.name.trim(),
            form: st.form,
            source: st.source.trim(),
            acquired: st.acquired.trim(),
            notes: st.notes.trim(),
            intentions: st.intentions
              .split(/\n|,/)
              .map((s) => s.trim())
              .filter(Boolean),
            care: before?.care ?? []
          };
          saving = true;
          el.disabled = true;
          el.textContent = "Saving…";
          try {
            if (existing) {
              await window.SaltCraft.update(C.STONES, existing.id, data);
              window.location.href = stoneUrl(existing.id);
            } else {
              const entry = await window.SaltCraft.add(C.STONES, data);
              window.location.replace(stoneUrl(entry.id));
            }
          } catch {
            say("Your stone couldn’t be saved. It’s still here, so you can try again.");
          } finally {
            saving = false;
            el.disabled = false;
            el.textContent = "Save stone";
          }
        }
      }
    });
  }

  // ── Stone care ────────────────────────────────────────────────────────────
  const FILTERS = [
    { key: "all", label: "All", test: () => true },
    { key: "water", label: "Not for water", test: (c) => c.water !== "yes" },
    { key: "sun", label: "Keep from sun", test: (c) => c.sun !== "ok" },
    { key: "salt", label: "Not for salt", test: (c) => c.salt !== "yes" },
    { key: "handling", label: "Handle with care", test: (c) => c.handling !== "none" }
  ];

  function stoneCard(care, open) {
    const K = B.care;
    return h.details(
      `${care.name}${care.handling === "toxic" ? " · toxic" : ""}`,
      [
        h.muted(`${care.mineral} · Mohs ${care.mohs}`),
        h.tags(K.careBadges(care).slice(1)),
        h.p(care.note),
        h.muted([`Water: ${K.LEVEL_LABEL[care.water].toLowerCase()}`, `salt: ${K.LEVEL_LABEL[care.salt].toLowerCase()}`, K.SUN_LABEL[care.sun].toLowerCase()].join(" · ")),
        `<div class="pb-stack">${h.label("Cleanse with")}${care.cleanse
          .map((m) => {
            const method = K.CLEANSE_METHODS.find((x) => x.key === m);
            return h.muted(`${method.label}: ${method.detail}`);
          })
          .join("")}</div>`,
        care.library ? h.actions([h.button(`${care.name} in the Library`, { variant: "ghost", href: links.library(`traditional:crystal:${care.key}`) })]) : ""
      ].join(""),
      { open }
    );
  }

  async function carePage(root) {
    const K = B.care;
    const opened = K.careByKey(PB.query("key"));
    let query = "";
    let filter = "all";

    const listHtml = () => {
      const q = tidy(query);
      const test = FILTERS.find((f) => f.key === filter).test;
      const list = K.STONE_CARE.filter((c) => test(c) && (!q || [c.name, c.mineral, ...(c.aliases ?? [])].some((n) => tidy(n).includes(q))));
      return `${h.chips(FILTERS.map((f) => h.chip(f.label, { pressed: filter === f.key, attrs: { "data-action": "filter", "data-filter": f.key, "data-focus": `filter-${f.key}` } })), "Filter stones")}<p class="sp-label" role="status">${h.esc(
        `${list.length} ${list.length === 1 ? "stone" : "stones"}`
      )}</p>${list.length ? "" : h.muted("No stones match. Try another name, or the gentle methods above.")}${list.map((c) => stoneCard(c, false)).join("")}`;
    };

    root.innerHTML = [
      h.head("Crystal", "Stone care", HUB),
      h.muted("What each stone can take. When in doubt, choose the gentle ways: smoke, sound, moonlight and your own breath are safe for every stone."),
      opened ? stoneCard(opened, true) : "",
      h.card(
        `${h.label("Reading the badges")}${h.muted(
          `Mohs is hardness, from talc (1) to diamond (10); anything under about 5 scratches easily, and a fingernail (about 2.5) marks the softest. Water: “${K.LEVEL_LABEL.brief.toLowerCase()}” means a quick rinse and a thorough dry, never a soak. Salt means a bowl of dry salt or salt water; it’s abrasive and draws moisture. “${K.HANDLING_LABEL.toxic}” stones contain lead, mercury, arsenic, copper or similar: polished pieces are fine to look at and hold briefly, but wash your hands, never cut or sand them, and keep them from children and pets.`
        )}${h.notice(K.ELIXIR_NOTE)}`
      ),
      `<section class="sp-section">${h.field({ id: "care-find", label: "Find a stone", placeholder: "e.g. selenite, quartz, copper", type: "search", attrs: { "data-input": "find", autocomplete: "off" } })}<div class="pb-stack" data-part="list">${listHtml()}</div></section>`,
      h.muted("Gathered from mineral references and gem care guidance, taking the cautious side where sources differ. Dyed, stabilised and treated stones can be more delicate than the natural mineral.")
    ].join("");

    const list = root.querySelector('[data-part="list"]');
    PB.bind(root, {
      input: {
        find: (el) => {
          query = el.value;
          PB.paint(list, listHtml());
        }
      },
      click: {
        filter: (el) => {
          filter = el.getAttribute("data-filter");
          PB.paint(list, listHtml());
        }
      }
    });
  }

  const VIEWS = { "crystal-hub": hub, "crystal-stones": stonesPage, "crystal-stone": stonePage, "crystal-stone-edit": stoneEdit, "crystal-care": carePage };
  const view = document.querySelector("[data-page-root]")?.getAttribute("data-view");
  if (VIEWS[view]) PB.start((root) => VIEWS[view](root));
})();
