/*
 * Support (the app's More → Support): crisis and support lines by category,
 * the lines for where you are first. The lines, their checking date and the
 * region logic come from app/src/lib/support/lines.ts via js/core/guides.js.
 * Where you are is read from this browser's language settings, here only;
 * nothing is sent anywhere.
 */
(function (global) {
  const root = global.document.querySelector("[data-page-root]");
  const G = global.SaltCore?.guides;
  const { esc, paragraphs, header, unavailable } = global.GuidesUI;
  if (!G?.support) return unavailable(root, "The support lines");
  const S = G.support;

  const REGION_OPTIONS = [
    { value: "US", label: "US" },
    { value: "GB", label: "UK" },
    { value: "IE", label: "Ireland" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "NZ", label: "New Zealand" },
    { value: "none", label: "Elsewhere" },
  ];

  function browserRegion() {
    try {
      const locales = [Intl.DateTimeFormat().resolvedOptions().locale, ...(global.navigator?.languages || [])];
      for (const locale of locales) {
        const region = S.regionFromLocale(locale);
        if (region) return region;
      }
    } catch {
      /* fall through */
    }
    return null;
  }

  // iOS reads an sms: body after '&', other phones after '?'.
  const platform = /iPad|iPhone|iPod|Macintosh/.test(global.navigator?.userAgent || "") ? "ios" : "android";

  let region = browserRegion() || "none";

  function lineCard(line) {
    const target = S.textTarget(line);
    const texting = S.textWords(line);
    const where = line.region.map((r) => S.REGION_NAMES[r]).join(" & ");
    const reach = [line.number ? `Call ${line.number}` : null, texting].filter(Boolean).join(" · ");
    const shortUrl = line.url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
    const buttons = [
      line.number && line.how.includes("call")
        ? `<a class="button button--primary" href="${esc(S.telUrl(line.number))}" aria-label="Call ${esc(line.name)} on ${esc(line.number)}">Call</a>`
        : "",
      ...(line.alsoCall || []).map(
        (also) => `<a class="button button--ghost" href="${esc(S.telUrl(also.number))}" aria-label="Call ${esc(line.name)} ${esc(also.label)} on ${esc(also.number)}">Call ${esc(also.label)}</a>`,
      ),
      target ? `<a class="button button--primary" href="${esc(S.smsUrl(target, line.keyword, platform))}" aria-label="${esc(texting)}: opens your messages app">Text</a>` : "",
      `<a class="button button--ghost" href="${esc(line.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(line.name)} website (opens in a new tab)">Website</a>`,
    ].filter(Boolean);
    return `<article class="sp-card gd-line">
      <div class="gd-line__head"><h3>${esc(line.name)}</h3><p class="sp-caption">${esc([where, line.hours].filter(Boolean).join(" · "))}</p></div>
      ${reach ? `<p class="gd-line__reach gd-selectable">${esc(reach)}</p>` : ""}
      ${(line.alsoCall || []).map((also) => `<p class="gd-selectable">${esc(`${also.label}: ${also.number}`)}</p>`).join("")}
      ${line.note ? `<p>${esc(line.note)}</p>` : ""}
      <p class="gd-line__url gd-selectable">${esc(shortUrl)}</p>
      <div class="sp-actions">${buttons.join("")}</div>
    </article>`;
  }

  function linesHtml() {
    const sections = S.supportSections(region === "none" ? null : region);
    return sections
      .map(
        (section) => `<section class="sp-section" aria-labelledby="gd-support-${section.key}">
        <h2 class="sp-label" id="gd-support-${section.key}">${esc(section.label)}</h2>
        <p class="sp-caption">${esc(section.blurb)}</p>
        ${section.lines.map(lineCard).join("")}
      </section>`,
      )
      .join("");
  }

  const regionCaption = () =>
    region === "none" ? "Find A Helpline, under Crisis, lists free lines in more than 175 countries." : `${S.REGION_NAMES[region]} lines come first. Others follow.`;

  root.innerHTML = `${header({ title: "Support", eyebrow: "You don’t have to hold it alone", back: "/?sanctuary=more", backLabel: "Back to More" })}
    <div class="sp-card sp-card--gold">${paragraphs([
      "The practices in the Sanctuary can stir deep things: grief, old wounds, the ones we’ve lost. That’s part of the work, and it can still be a lot to carry. Reaching out to another person is a strong thing to do.",
      `If you’re in danger now, call your local emergency number (${S.EMERGENCY_NUMBERS.join(", ")}).`,
    ])}</div>
    <section class="sp-section" aria-labelledby="gd-region">
      <h2 class="sp-label" id="gd-region">Show lines for</h2>
      <div class="sp-chips" role="group" aria-label="Where you are">${REGION_OPTIONS.map(
        (o) => `<button type="button" class="sp-chip" data-region="${o.value}" aria-pressed="${region === o.value}">${esc(o.label)}</button>`,
      ).join("")}</div>
      <p class="sp-caption" data-region-caption role="status" aria-live="polite">${esc(regionCaption())}</p>
    </section>
    <div data-support-lines>${linesHtml()}</div>
    <p class="sp-caption">Each line was checked against its own website in October 2026. Numbers sometimes change: if one doesn’t connect, its website will have the latest. The buttons open your phone, messages app or browser; this site doesn’t send anything.</p>`;

  root.querySelectorAll("[data-region]").forEach((chip) =>
    chip.addEventListener("click", () => {
      region = chip.dataset.region;
      root.querySelectorAll("[data-region]").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      root.querySelector("[data-region-caption]").textContent = regionCaption();
      root.querySelector("[data-support-lines]").innerHTML = linesHtml();
    }),
  );
})(window);
