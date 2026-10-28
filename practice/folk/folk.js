/*
 * Traditional & folk: the practice page, Folk calendar, Local lore and
 * Weather lore, as the app has them (app/src/app/(tabs)/rituals/craft/folk).
 * Lore lives in craft_entries "folk.lore".
 */
(function () {
  const PB = window.PracticeB;
  const { h, links } = PB;
  const B = window.SaltCore && window.SaltCore["practice-b"];
  const HUB = { href: "/practice/folk/", label: "Traditional & folk" };
  const LORE_URL = "/practice/folk/lore/";
  const entryUrl = (id) => `/practice/folk/lore/entry/?id=${encodeURIComponent(id)}`;
  const editUrl = (id) => `/practice/folk/lore/edit/${id ? `?id=${encodeURIComponent(id)}` : ""}`;

  // ── The practice page ─────────────────────────────────────────────────────
  async function hub(root) {
    const W = B.folkWeather;
    const about = B.premade.PRACTICES.find((p) => p.id === "folk")?.about;
    const tools = B.practices.CRAFT_TOOLS.folk;
    const place = PB.getPlace();
    const now = new Date();
    const ahead = B.folkCalendar.customsAhead(now, 30);
    const { entries: lore, problem } = await PB.listEntries(B.lore.LORE);
    const next = ahead[0];
    const month = W.seasonalMonth(now.getMonth(), place?.latitude);
    const saying = W.BY_MONTH[month][now.getDate() % W.BY_MONTH[month].length];
    const { relativeDay } = B.calendar;
    const details = [
      next ? `Next: ${next.custom.name}, ${next.inDays === 0 ? "now" : relativeDay(now, next.date)}` : null,
      lore.length ? `${lore.length} ${lore.length === 1 ? "entry" : "entries"}` : null,
      `${W.monthName(now.getMonth())}’s sayings`
    ];
    const routes = ["/practice/folk/calendar/", LORE_URL, "/practice/folk/weather/"];

    root.innerHTML = [
      h.head("Craft tools", "Traditional & folk", { href: links.hub, label: "Craft tools" }),
      about ? h.muted(about) : "",
      h.notice(problem),
      next
        ? h.card(
            `${h.label(next.inDays === 0 ? "In the old calendar now" : `In the old calendar ${relativeDay(now, next.date)}`)}${h.cardTitle(next.custom.name)}${h.muted(next.custom.region)}${h.p(next.custom.keep)}`,
            { gold: true }
          )
        : "",
      h.section("Tools", h.list(tools.map((tool, i) => h.row({ href: routes[i], title: tool.title, detail: details[i] ?? tool.detail })), "Folk tools")),
      saying ? h.card(`${h.label("An old saying")}<p class="pr-quote">${h.esc(saying.saying)}</p>`) : "",
      PB.landCard(),
      h.list([h.row({ href: links.premadeFor("folk"), title: "Folk workings", detail: "Premade rituals and spells; filter by Traditional & folk" })])
    ].join("");
  }

  // ── Folk calendar ─────────────────────────────────────────────────────────
  function when(c, now, ahead) {
    const { shortDate, longDate, relativeDay } = B.calendar;
    const end = new Date(c.date.getFullYear(), c.date.getMonth(), c.date.getDate() + c.days - 1);
    const span = c.days > 1 ? `${shortDate(c.date)}–${shortDate(end)}` : longDate(c.date);
    if (!ahead) return span;
    const running = c.date.getTime() <= now.getTime();
    return `${span} · ${running ? (c.days > 1 ? "now" : "today") : relativeDay(now, c.date)}`;
  }

  function customCard(c, now, ahead) {
    const p = c.custom;
    const premade = B.premade.premadeById(p.premade);
    return h.details(
      `${p.name} · ${ahead && c.inDays === 0 ? "now" : B.calendar.shortDate(c.date)}`,
      [
        h.muted(`${when(c, now, ahead)} · ${p.region}`),
        h.label("What people did"),
        h.p(p.did),
        h.label("Keeping it now"),
        h.p(p.keep),
        p.when ? h.muted(p.when) : "",
        p.care ? h.notice(`Take care: ${p.care}`) : "",
        premade ? h.actions([h.button(premade.title, { variant: "ghost", href: links.premade(premade.id), attrs: { "aria-label": `${premade.title}: opens a premade working for this custom` } })]) : ""
      ].join("")
    );
  }

  async function calendarPage(root) {
    const FC = B.folkCalendar;
    const W = B.folkWeather;
    const place = PB.getPlace();
    const now = new Date();
    const ahead = FC.customsAhead(now, 30);
    let month = now.getMonth() + 1;

    const monthHtml = () => {
      // Browse forward: a month already gone this year shows next year's dates.
      const year = month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
      return `${h.chips(
        Array.from({ length: 12 }, (_, i) => i + 1).map((m) => h.chip(W.monthName(m - 1).slice(0, 3), { pressed: month === m, a11y: W.monthName(m - 1), attrs: { "data-action": "month", "data-month": m, "data-focus": `month-${m}` } })),
        "Month"
      )}<p class="sp-muted" role="status">${h.esc(`${W.monthName(month - 1)} ${year}`)}</p>${FC.customsInMonth(month, year)
        .map((c) => customCard(c, now, false))
        .join("")}`;
    };

    root.innerHTML = [
      h.head("Old customs through the year", "Folk calendar", HUB),
      h.muted(
        "Customs of Britain, Ireland and wider Europe: where they were kept, what people did, and a way to keep each one now. Feasts that move with Easter are worked out for each year."
      ),
      place && place.latitude < 0 ? h.notice(FC.SOUTHERN_NOTE) : "",
      h.section("The next 30 days", ahead.length ? ahead.map((c) => customCard(c, now, true)).join("") : h.muted("A quiet stretch in the old calendar.")),
      `<section class="sp-section"><h2 class="sp-label">Through the year</h2><div class="pb-stack" data-part="month">${monthHtml()}</div></section>`,
      h.muted(
        "Dates and regions are drawn from Ronald Hutton’s The Stations of the Sun, Steve Roud’s The English Year and regional folklore collections. Customs vary from village to village; the ones near you may differ."
      )
    ].join("");

    PB.bind(root, {
      click: {
        month: (el) => {
          month = Number(el.getAttribute("data-month"));
          PB.paint(root.querySelector('[data-part="month"]'), monthHtml());
        }
      }
    });
  }

  // ── Local lore ────────────────────────────────────────────────────────────
  async function lorePage(root) {
    const L = B.lore;
    const { entries, problem } = await PB.listEntries(L.LORE);
    const all = entries.map((e) => ({ ...e, data: L.normalizeLore(e.data) }));
    const counts = L.loreCounts(all);
    const places = L.lorePlaces(all).slice(0, 10);
    let kind = null;
    let query = "";

    const resultsHtml = () => {
      const found = L.filterLore(all, kind, query);
      return [
        h.chips(
          [
            h.chip("All", { pressed: kind === null, attrs: { "data-action": "kind", "data-kind": "", "data-focus": "kind-all" } }),
            ...L.LORE_KINDS.filter((k) => counts[k.id] > 0).map((k) =>
              h.chip(`${k.label} · ${counts[k.id]}`, { pressed: kind === k.id, a11y: `${k.label}, ${counts[k.id]}`, attrs: { "data-action": "kind", "data-kind": k.id, "data-focus": `kind-${k.id}` } })
            )
          ],
          "Kind"
        ),
        places.length > 1 && !query
          ? h.section(
              "Your places",
              h.chips(places.map((p, i) => h.chip(`${p.where} · ${p.count}`, { a11y: `${p.where}, ${p.count}. Show its lore`, attrs: { "data-action": "place", "data-where": p.where, "data-focus": `place-${i}` } })), "Your places")
            )
          : "",
        found.length
          ? h.list(
              found.map((e) =>
                h.row({
                  href: entryUrl(e.id),
                  title: e.data.title || "Untitled",
                  detail: [L.loreKindLabel(e.data.kind), e.data.where, e.data.source ? `from ${e.data.source}` : null].filter(Boolean).join(" · ")
                })
              ),
              "Your lore"
            )
          : h.muted("Nothing matches that.")
      ].join("");
    };

    root.innerHTML = [
      h.head(`${all.length} ${all.length === 1 ? "entry" : "entries"}`, "Local lore", HUB),
      h.actions([h.button("Write down some lore", { href: editUrl() })]),
      h.notice(problem),
      all.length === 0
        ? h.card(
            h.p(
              "A notebook for the lore of where you live: the holy well, the stone that turns at midnight, what the old man at the allotment says about elder, the name of the field. Write down who told you. Lore like this is lost one person at a time."
            )
          )
        : `${h.field({ id: "lore-find", label: "Search your lore", placeholder: "A place, a name, a word", type: "search", attrs: { "data-input": "find", autocomplete: "off" } })}<div class="pb-stack" data-part="results" aria-live="polite">${resultsHtml()}</div>`
    ].join("");

    const results = () => PB.paint(root.querySelector('[data-part="results"]'), resultsHtml());
    PB.bind(root, {
      input: {
        find: (el) => {
          query = el.value;
          results();
        }
      },
      click: {
        kind: (el) => {
          const k = el.getAttribute("data-kind") || null;
          kind = k && kind !== k ? k : null;
          results();
        },
        place: (el) => {
          query = el.getAttribute("data-where");
          const field = root.querySelector("#lore-find");
          field.value = query;
          results();
          field.focus();
        }
      }
    });
  }

  async function loreEntry(root) {
    const L = B.lore;
    const id = PB.query("id");
    const { entries, problem } = await PB.listEntries(L.LORE);
    const raw = entries.find((e) => e.id === id) ?? null;
    const back = { href: LORE_URL, label: "Local lore" };
    if (!raw) {
      root.innerHTML = [h.head("", "Lore", back), h.notice(problem), h.p("This entry couldn’t be found. It may have been deleted on another device.")].join("");
      return;
    }
    const lore = L.normalizeLore(raw.data);
    const heard = B.calendar.fullDate(lore.heard);
    document.title = `${lore.title || "Lore"} | Salt & Sovereignty`;
    root.innerHTML = [
      h.head([L.loreKindLabel(lore.kind), lore.where].filter(Boolean).join(" · "), lore.title || "Untitled", back),
      lore.lore ? `<div class="pb-stack">${lore.lore.split(/\n+/).map((para) => h.p(para)).join("")}</div>` : "",
      lore.source || heard ? h.section("Heard from", h.muted([lore.source, heard].filter(Boolean).join(" · "))) : "",
      h.actions([h.button("Edit", { variant: "ghost", href: editUrl(raw.id) })])
    ].join("");
  }

  async function loreEdit(root) {
    const L = B.lore;
    const id = PB.query("id");
    const { entries, problem } = await PB.listEntries(L.LORE);
    const existing = id ? entries.find((e) => e.id === id) ?? null : null;
    if (id && !existing) {
      root.innerHTML = [h.head("", "Lore", { href: LORE_URL, label: "Local lore" }), h.notice(problem), h.p("This entry couldn’t be found. It may have been deleted on another device.")].join("");
      return;
    }
    const lore = existing ? L.normalizeLore(existing.data) : L.blankLore(new Date());
    const today = B.lifecycle.localDateKey(new Date());
    let typedDate = "";

    const kindHtml = () => {
      const hint = L.LORE_KINDS.find((k) => k.id === lore.kind)?.hint;
      return `${h.chips(L.LORE_KINDS.map((k) => h.chip(k.label, { pressed: lore.kind === k.id, attrs: { "data-action": "kind", "data-kind": k.id, "data-focus": `kind-${k.id}` } })), "What kind?")}${hint ? h.muted(hint) : ""}`;
    };
    const heardHtml = () =>
      h.chips(
        [
          h.chip("Today", { pressed: lore.heard === today, attrs: { "data-action": "heard", "data-heard": today, "data-focus": "heard-today" } }),
          h.chip("Not sure", { pressed: !lore.heard, attrs: { "data-action": "heard", "data-heard": "", "data-focus": "heard-none" } }),
          lore.heard && lore.heard !== today ? h.chip(B.calendar.fullDate(lore.heard) ?? lore.heard, { pressed: true, attrs: { "data-focus": "heard-other" } }) : ""
        ].filter(Boolean),
        "When you heard it"
      );

    root.innerHTML = [
      h.head(existing ? "Edit" : "Local lore", existing ? lore.title || "Lore" : "Write it down", existing ? { href: entryUrl(existing.id), label: lore.title || "Lore" } : { href: LORE_URL, label: "Local lore" }),
      h.notice(problem),
      h.section("What kind?", `<div class="pb-stack" data-part="kind">${kindHtml()}</div>`),
      `<div class="pb-stack">${[
        h.field({ id: "lore-title", label: "Title", value: lore.title, placeholder: "The Lady’s Well, the black dog of Pound Lane", attrs: { "data-input": "title" } }),
        h.field({ id: "lore-where", label: "Where", value: lore.where, placeholder: "A place, parish or landmark", attrs: { "data-input": "where" } }),
        h.field({ id: "lore-lore", label: "The lore", value: lore.lore, placeholder: "As it was told to you, in their words where you can", multiline: true, attrs: { "data-input": "lore" } }),
        h.field({ id: "lore-source", label: "Who told you, or where you found it", value: lore.source, placeholder: "A neighbour, a grandparent, a parish history, a museum", attrs: { "data-input": "source" } })
      ].join("")}</div>`,
      h.section(
        "When you heard it",
        `<div data-part="heard">${heardHtml()}</div>${h.field({ id: "lore-date", label: "Or a date (YYYY-MM-DD)", value: typedDate, placeholder: "1998-08-01", attrs: { "data-input": "date", autocomplete: "off" } })}`
      ),
      h.notice("Some places are private land or fragile. Note access with the lore, and leave offerings that won’t harm the place: no plastic, coins in wells or ribbons that won’t rot."),
      PB.signedIn() ? "" : h.muted("Saved in this browser. Sign in to keep your lore with your account."),
      '<div data-part="problem" aria-live="assertive"></div>',
      h.actions([
        h.button(existing ? "Save changes" : "Keep this lore", { attrs: { "data-action": "save" } }),
        existing ? h.button("Delete this lore", { variant: "text", attrs: { "data-action": "remove" } }) : ""
      ])
    ].join("");

    const part = (name) => root.querySelector(`[data-part="${name}"]`);
    const say = (text) => (part("problem").innerHTML = h.notice(text));
    let saving = false;
    PB.bind(root, {
      input: {
        title: (el) => (lore.title = el.value),
        where: (el) => (lore.where = el.value),
        lore: (el) => (lore.lore = el.value),
        source: (el) => (lore.source = el.value),
        date: (el) => {
          typedDate = el.value;
          if (B.lifecycle.dateFromKey(typedDate.trim())) {
            lore.heard = typedDate.trim();
            PB.paint(part("heard"), heardHtml());
          }
        }
      },
      click: {
        kind: (el) => {
          lore.kind = el.getAttribute("data-kind");
          PB.paint(part("kind"), kindHtml());
        },
        heard: (el) => {
          lore.heard = el.getAttribute("data-heard");
          PB.paint(part("heard"), heardHtml());
        },
        save: async (el) => {
          const data = { ...lore, title: lore.title.trim(), where: lore.where.trim(), lore: lore.lore.trim(), source: lore.source.trim() };
          if (!data.title && !data.lore) return say("Nothing to keep yet. Give it a title, or write down the lore itself.");
          if (saving) return;
          saving = true;
          el.disabled = true;
          say("");
          try {
            if (existing) {
              await window.SaltCraft.update(L.LORE, existing.id, data);
              window.location.href = entryUrl(existing.id);
            } else {
              const entry = await window.SaltCraft.add(L.LORE, data);
              window.location.replace(entryUrl(entry.id));
            }
          } catch {
            say("Your lore couldn’t be saved. It’s still here, so you can try again.");
          } finally {
            saving = false;
            el.disabled = false;
          }
        },
        remove: async () => {
          if (!existing) return;
          if (!PB.confirmAction("Delete this lore?", "It will be removed on every device.")) return;
          try {
            await window.SaltCraft.remove(L.LORE, existing.id);
            window.location.replace(LORE_URL);
          } catch {
            say("That couldn’t be deleted just now. Please try again.");
          }
        }
      }
    });
  }

  // ── Weather lore ──────────────────────────────────────────────────────────
  function sayingCard(s) {
    const W = B.folkWeather;
    return h.card(`<p class="pr-quote">${h.esc(s.saying)}</p><p class="pb-verdict pb-verdict--${h.esc(s.verdict)}">${h.esc(W.VERDICT_LABEL[s.verdict])}</p>${h.p(s.note)}`);
  }

  async function weatherPage(root) {
    const W = B.folkWeather;
    const now = new Date();
    let followSeason = true;
    let picked = null;
    let asking = false;
    let problem = null;

    const draw = () => {
      const place = PB.getPlace();
      const south = !!place && place.latitude < 0;
      const current = followSeason ? W.seasonalMonth(now.getMonth(), place?.latitude) : now.getMonth();
      const month = picked ?? current;
      PB.paint(
        root,
        [
          h.head("Old sayings for the month", "Weather lore", HUB),
          h.muted(
            "Sayings from the farms, fishing boats and hedgerows of Britain and Ireland, each with a plain note on whether the weather bears it out. Some are sound short-range signs, some are farming wisdom, and some are only charming."
          ),
          !place
            ? h.card(
                `${h.p("These sayings follow the northern year. If you live south of the equator, share your location so the months match your seasons.")}${h.actions([
                  h.button(asking ? "Finding you…" : "Use my location", { variant: "ghost", attrs: { "data-action": "locate", "data-focus": "locate", disabled: asking } })
                ])}${h.notice(problem)}`
              )
            : "",
          south
            ? h.toggle({
                id: "follow-season",
                label: "Follow my seasons",
                detail: `You’re south of the equator, so ${W.monthName(now.getMonth())} is shown with the sayings for ${W.monthName(W.seasonalMonth(now.getMonth(), place.latitude))}, the same point in the northern year.`,
                checked: followSeason,
                attrs: { "data-change": "follow" }
              })
            : "",
          h.section(
            picked === null ? `${W.monthName(month)}${south && followSeason ? " (your season)" : ""}` : W.monthName(month),
            `${h.chips(
              Array.from({ length: 12 }, (_, m) => h.chip(W.monthName(m).slice(0, 3), { pressed: month === m, a11y: W.monthName(m), attrs: { "data-action": "month", "data-month": m, "data-focus": `month-${m}` } })),
              "Month"
            )}${W.BY_MONTH[month].map(sayingCard).join("")}`
          ),
          h.section("Any time of year", W.ANY_MONTH.map(sayingCard).join("")),
          h.muted(
            "Saints’ days in these sayings are by today’s calendar. Many were first said under the old Julian calendar, eleven days behind, which is why some sayings seem a little early."
          )
        ].join("")
      );
    };

    PB.bind(root, {
      click: {
        month: (el) => {
          picked = Number(el.getAttribute("data-month"));
          draw();
        },
        locate: async () => {
          asking = true;
          draw();
          const result = await PB.askLocation();
          asking = false;
          problem = result === "ok" ? null : "Your location isn’t available, so the sayings follow the northern year.";
          draw();
        }
      },
      change: {
        follow: (el) => {
          followSeason = el.checked;
          picked = null;
          draw();
        }
      }
    });
    draw();
  }

  const VIEWS = { "folk-hub": hub, "folk-calendar": calendarPage, "folk-lore": lorePage, "folk-lore-entry": loreEntry, "folk-lore-edit": loreEdit, "folk-weather": weatherPage };
  const view = document.querySelector("[data-page-root]")?.getAttribute("data-view");
  if (VIEWS[view]) PB.start((root) => VIEWS[view](root));
})();
