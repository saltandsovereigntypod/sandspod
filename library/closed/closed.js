/*
 * Closed & living traditions (the app's More → Living Library → Closed &
 * living traditions): the guide, a search with openness filters, and one
 * page per tradition (?id=…). Content and wording come from the app's
 * app/src/lib/library/closed via js/core/guides.js.
 */
(function (global) {
  const root = global.document.querySelector("[data-page-root]");
  const G = global.SaltCore?.guides;
  const { esc, paragraphs, header, router, unavailable } = global.GuidesUI;
  if (!G?.closed) return unavailable(root, "The guide");
  const C = G.closed;

  const BASE = "/library/closed/";
  const TITLE = C.CLOSED_GUIDE_TITLE;

  // The guide's own opening words (the app's screen).
  const INTRO = [
    "Some traditions belong to a particular people. They are held by a nation, a family line or a community, often carried through times when people tried to stamp them out, and they are alive today. We call these closed: you come to them as a guest, not a practitioner, unless the people themselves bring you in.",
    "Others are initiatory. People of many backgrounds belong to them, but always through a door: a house, a godparent, an elder or a teacher who takes responsibility for you. The knowledge lives in that relationship, not on a page. And some are debated, where people inside the tradition genuinely disagree about outsiders. There we give both views rather than pick one.",
    "None of this is secrecy for its own sake. It’s about whose it is. A ceremony, a song or a relationship with a spirit is part of a people’s life; lifted out of it, learned from a book or sold, it tends to hurt the people it came from and to lose what made it matter.",
    "Being a good guest is simple: listen to the people themselves, buy from them, come when you’re invited, don’t claim a title you weren’t given, and take no as a full answer.",
    "So this guide explains these traditions, where they come from and how people really come into them, and it corrects common myths. It doesn’t teach workings, ceremonies or how to call a spirit, and it won’t. That isn’t ours to teach. If something here calls to you, the next step is to learn from them.",
  ];

  const NOT_OPEN = "This guide isn’t open yet. It’s being read by people from the traditions it describes first.";

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "closed", label: C.OPENNESS_LABELS.closed },
    { value: "initiatory", label: C.OPENNESS_LABELS.initiatory },
    { value: "debated", label: C.OPENNESS_LABELS.debated },
  ];

  let query = "";
  let filter = "all";

  /** The owner's note, with a way to send a correction (a plain mailto link). */
  function notice(tradition) {
    return `<aside class="sp-card sp-card--gold" aria-label="A note from us">
      <p>${esc(C.CLOSED_NOTICE)}</p>
      <div class="sp-actions"><a class="button button--ghost" href="${esc(C.correctionUrl(tradition || null))}" aria-describedby="gd-correction-hint">Send a correction</a></div>
      <p class="sp-caption" id="gd-correction-hint">Opens an email to <span class="gd-selectable">${esc(C.SUPPORT_EMAIL)}</span>. Or write to us there yourself.</p>
    </aside>`;
  }

  const rowHtml = (t, detail) => `<a class="sp-row" href="${BASE}?id=${encodeURIComponent(t.id)}" data-gd-nav>
      <span class="sp-row__text"><span class="sp-row__title">${esc(t.name)}</span><span class="sp-row__detail">${esc(detail)}</span></span>
      <span class="sp-row__chevron" aria-hidden="true">›</span></a>`;

  function listHtml() {
    const shown = C.searchClosed(query).filter((t) => filter === "all" || t.openness === filter);
    const groups = C.closedGroups(shown);
    const count = groups.reduce((n, g) => n + g.items.length, 0);
    const status =
      C.CLOSED_TRADITIONS.length === 0 ? "The traditions are on their way." : count === 0 ? "Nothing here matches that." : `${count} ${count === 1 ? "tradition" : "traditions"}`;
    return `<p class="sp-caption" role="status" aria-live="polite">${esc(status)}</p>
      ${groups
        .map(
          (g) => `<section class="sp-section" aria-labelledby="gd-group-${g.group}">
        <h2 class="sp-label" id="gd-group-${g.group}">${esc(g.label)}</h2>
        <div class="sp-list">${g.items.map((t) => rowHtml(t, `${C.OPENNESS_LABELS[t.openness]} · ${t.summary}`)).join("")}</div>
      </section>`,
        )
        .join("")}`;
  }

  function renderIndex() {
    global.document.title = `${TITLE} | Salt & Sovereignty`;
    if (!C.CLOSED_GUIDE_LIVE) {
      root.innerHTML = `${header({ title: TITLE, back: "/library/", backLabel: "Back to the Library" })}<p>${esc(NOT_OPEN)}</p>`;
      return;
    }
    root.innerHTML = `${header({ title: TITLE, eyebrow: "Living Library", back: "/library/", backLabel: "Back to the Library" })}
      ${notice(null)}
      <section class="sp-section" aria-labelledby="gd-why">
        <h2 class="sp-label" id="gd-why">What closed means and why it matters</h2>
        <div class="sp-card sp-card--gold">${paragraphs(INTRO)}</div>
      </section>
      ${
        C.CLOSED_TRADITIONS.length
          ? `<div class="gd-search">
        <div class="sp-field"><label for="gd-closed-search">Search the traditions</label>
          <input id="gd-closed-search" type="search" placeholder="Name or another spelling…" autocomplete="off" autocapitalize="none" spellcheck="false" value="${esc(query)}" /></div>
        <div class="sp-chips" role="group" aria-label="Openness">${FILTERS.map(
          (f) => `<button type="button" class="sp-chip" data-filter="${f.value}" aria-pressed="${filter === f.value}">${esc(f.label)}</button>`,
        ).join("")}</div>
        <p class="sp-caption" data-filter-detail ${filter === "all" ? "hidden" : ""}>${filter === "all" ? "" : esc(C.OPENNESS_DETAIL[filter])}</p>
      </div>`
          : ""
      }
      <div data-closed-list>${listHtml()}</div>
      <p class="sp-caption"><a class="gd-link" href="/library/sourcing/">Sourcing with care</a>: the plants and stones whose buying needs care.</p>`;

    const list = root.querySelector("[data-closed-list]");
    root.querySelector("#gd-closed-search")?.addEventListener("input", (event) => {
      query = event.target.value;
      list.innerHTML = listHtml();
    });
    root.querySelectorAll("[data-filter]").forEach((chip) =>
      chip.addEventListener("click", () => {
        filter = chip.dataset.filter;
        root.querySelectorAll("[data-filter]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
        const detail = root.querySelector("[data-filter-detail]");
        detail.hidden = filter === "all";
        detail.textContent = filter === "all" ? "" : C.OPENNESS_DETAIL[filter];
        list.innerHTML = listHtml();
      }),
    );
  }

  const section = (label, body, tone = "") =>
    `<section class="sp-section"><h2 class="sp-label">${esc(label)}</h2><div class="sp-card${tone ? ` sp-card--${tone}` : ""}">${body}</div></section>`;

  function renderTradition(id) {
    const tradition = C.CLOSED_GUIDE_LIVE ? C.closedById(id) : null;
    if (!tradition) {
      global.document.title = `${TITLE} | Salt & Sovereignty`;
      root.innerHTML = `${header({ title: TITLE, back: BASE, backLabel: "Back to the guide" })}
        <p>${esc(C.CLOSED_GUIDE_LIVE ? "This tradition couldn’t be found." : NOT_OPEN)}</p>`;
      return;
    }
    global.document.title = `${tradition.name} | ${TITLE} | Salt & Sovereignty`;
    const related = C.relatedTo(tradition);
    root.innerHTML = `${header({ title: tradition.name, eyebrow: C.GROUP_LABELS[tradition.group], back: BASE, backLabel: "Back to the guide" })}
      ${notice(tradition)}
      <p class="gd-intro">${esc(tradition.summary)}</p>
      <ul class="gd-tags" aria-label="Openness and other names">${[C.OPENNESS_LABELS[tradition.openness], ...tradition.aka].map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <p class="sp-caption">${esc(`${C.OPENNESS_DETAIL[tradition.openness]}. ${tradition.peoples}`)}</p>
      ${tradition.sections.map((s) => section(s.heading, paragraphs(s.body))).join("")}
      ${section("How people come in", paragraphs(tradition.howPeopleComeIn))}
      ${section("Open & closed", paragraphs(tradition.openAndClosed))}
      ${
        tradition.myths.length
          ? section(
              "Myths → truth",
              tradition.myths.map((m) => `<div class="gd-myth"><p class="gd-myth__myth">${esc(m.myth)}</p><p>${esc(m.truth)}</p></div>`).join(""),
            )
          : ""
      }
      ${tradition.please.length ? section("Please", `<ul class="gd-bullets">${tradition.please.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`, "gold") : ""}
      ${section("How to learn", paragraphs(tradition.learn))}
      ${tradition.reading.length ? section("Reading", tradition.reading.map((r) => `<p class="gd-selectable">${esc(r)}</p>`).join("")) : ""}
      ${tradition.community?.length ? section("Community", tradition.community.map((c) => `<p class="gd-selectable">${esc(c)}</p>`).join("")) : ""}
      ${
        related.length
          ? `<section class="sp-section"><h2 class="sp-label">Related</h2><div class="sp-list">${related.map((r) => rowHtml(r, C.OPENNESS_LABELS[r.openness])).join("")}</div></section>`
          : ""
      }`;
  }

  router((params) => {
    const id = params.get("id");
    if (id) renderTradition(id);
    else renderIndex();
  });
})(window);
