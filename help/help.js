/*
 * How to (the app's More → How to): a plain guide to everything, by where it
 * lives, with search. The topics and the search are the app's own
 * (app/src/lib/help via js/core/guides.js); help/web-notes.js adds what
 * differs on the website and where each screen lives here.
 */
(function (global) {
  const root = global.document.querySelector("[data-page-root]");
  const G = global.SaltCore?.guides;
  const W = global.HelpWebNotes;
  const { esc, header, unavailable } = global.GuidesUI;
  if (!G?.help || !W) return unavailable(root, "The guide");
  const H = G.help;
  const EMAIL = G.closed?.SUPPORT_EMAIL || "";

  let query = "";
  const checked = new Map(); // site path → Promise<boolean>

  /** Whether a page exists on this site (asked once, of this site only). */
  function exists(href) {
    if (W.KNOWN.has(href) || href.startsWith("/?")) return Promise.resolve(true);
    href = href.split("?")[0] || "/";
    if (!checked.has(href)) {
      checked.set(
        href,
        global
          .fetch(href, { method: "HEAD", credentials: "same-origin", cache: "force-cache" })
          .then((response) => response.ok)
          .catch(() => false),
      );
    }
    return checked.get(href);
  }

  function topicHtml(topic, section, showWhere) {
    const note = W.TOPIC_NOTES[topic.id];
    const href = topic.href ? W.siteHref(topic.href) : null;
    return `<details class="gd-topic" data-topic="${esc(topic.id)}">
      <summary>${esc(topic.title)}</summary>
      <div class="gd-topic__body">
        ${showWhere ? `<p class="gd-where">${esc(section.title)}</p>` : ""}
        <p>${esc(topic.summary)}</p>
        <ol class="gd-steps">${topic.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol>
        ${(topic.tips || []).map((tip) => `<p class="sp-caption">${esc(tip)}</p>`).join("")}
        ${note ? `<div class="gd-web"><p class="gd-web__label">On the website</p><p>${esc(note)}</p></div>` : ""}
        ${href ? `<div class="sp-actions" data-take-me hidden><a class="button button--primary" href="${esc(href)}">Take me there</a></div>` : ""}
      </div>
    </details>`;
  }

  function bodyHtml() {
    const found = H.searchHelp(query);
    if (query.trim()) {
      const label = found.length ? `${found.length} ${found.length === 1 ? "answer" : "answers"}` : "Nothing found";
      return `<section class="sp-section" aria-labelledby="gd-help-results">
        <h2 class="sp-label" id="gd-help-results">${esc(label)}</h2>
        ${found.length === 0 ? `<p class="sp-caption">Try fewer or different words, or browse the sections below once you clear the search.</p>` : ""}
        ${found.map(({ topic, section }) => topicHtml(topic, section, true)).join("")}
      </section>`;
    }
    return H.HELP.map(
      (section) => `<section class="sp-section" aria-labelledby="gd-help-${esc(section.id)}">
        <h2 class="sp-label" id="gd-help-${esc(section.id)}">${esc(section.title)}</h2>
        <p class="sp-caption">${esc(section.intro)}</p>
        ${W.SECTION_NOTES[section.id] ? `<div class="gd-web"><p class="gd-web__label">On the website</p><p>${esc(W.SECTION_NOTES[section.id])}</p></div>` : ""}
        ${section.topics.map((topic) => topicHtml(topic, section, false)).join("")}
      </section>`,
    ).join("");
  }

  root.innerHTML = `${header({ title: "How to", eyebrow: "Help", back: "/?sanctuary=more", backLabel: "Back to More" })}
    <p class="sp-caption">The guide is written for the app. Where the website works differently, a note says how.</p>
    <div class="sp-field"><label for="gd-help-search">Search the guide</label>
      <input id="gd-help-search" type="search" placeholder="e.g. carve a candle, birth chart, backup" autocomplete="off" spellcheck="false" /></div>
    <p class="sr-only" role="status" aria-live="polite" data-help-status></p>
    <div data-help-body>${bodyHtml()}</div>
    <div class="sp-card">
      <h2>Still stuck?</h2>
      <p>Write to us and we’ll help, and improve this guide.</p>
      ${EMAIL ? `<div class="sp-actions"><a class="button button--ghost" href="mailto:${esc(EMAIL)}?subject=${encodeURIComponent("Help with the website")}">Email us</a></div>
      <p class="sp-caption gd-selectable">${esc(EMAIL)}</p>` : ""}
    </div>`;

  const body = root.querySelector("[data-help-body]");
  const status = root.querySelector("[data-help-status]");
  let timer = null;
  root.querySelector("#gd-help-search").addEventListener("input", (event) => {
    query = event.target.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      body.innerHTML = bodyHtml();
      const count = query.trim() ? H.searchHelp(query).length : 0;
      status.textContent = query.trim() ? (count ? `${count} ${count === 1 ? "answer" : "answers"}` : "Nothing found") : "";
    }, 120);
  });

  // "Take me there" shows once we know the page is on this site.
  body.addEventListener(
    "toggle",
    (event) => {
      const details = event.target;
      if (!details.open || !details.matches?.(".gd-topic")) return;
      const wrap = details.querySelector("[data-take-me]");
      const link = wrap?.querySelector("a");
      if (!link || wrap.dataset.checked) return;
      wrap.dataset.checked = "true";
      exists(link.getAttribute("href")).then((ok) => {
        wrap.hidden = !ok;
      });
    },
    true,
  );

  // Open a topic named in the address (#topic-id).
  const wanted = decodeURIComponent(global.location.hash.slice(1));
  const target = wanted && body.querySelector(`[data-topic="${CSS.escape(wanted)}"]`);
  if (target) {
    target.open = true;
    target.scrollIntoView({ block: "start" });
  }
})(window);
