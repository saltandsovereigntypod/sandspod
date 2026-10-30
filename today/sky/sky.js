/*
 * The sky today, as the app's Sky screen has it (app/src/app/(tabs)/today/sky.tsx):
 * the sun and moon, the planets, retrogrades and the year ahead, eclipses, and
 * where you are: sunrise, moonrise and planetary hours. The place stays in
 * this browser and is only asked for when you press "Use my location".
 */
(function () {
  "use strict";

  const C = window.SaltCore && window.SaltCore.today;
  const T = window.SaltToday;
  const root = document.querySelector("[data-page-root]");
  const esc = (text) => (window.SaltPage ? window.SaltPage.esc(text) : String(text ?? ""));
  if (!root) return;
  if (!C || !T) {
    root.innerHTML = '<p class="sp-notice">The sky could not load. Check your connection and refresh the page.</p>';
    return;
  }
  const storage = (() => {
    try {
      return window.localStorage;
    } catch {
      return { getItem: () => null, setItem() {}, removeItem() {} };
    }
  })();

  const RETRO_PLANETS = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  const now = new Date();
  const D = (date) => C.calendar.dateFrom(now, date);
  const t = C.calendar.timeOfDay;
  const M = C.meanings;
  const sky = C.sky.skyNow(now);
  const moon = C.moon.moonState(now);
  const moonSign = sky.planets.find((p) => p.planet === "Moon").sign;
  // With js/core/astro.js, each retrograde comes with its shadow period, as in the app.
  const AF = window.SaltCore && window.SaltCore.astro && window.SaltCore.astro.forecast;
  const year = RETRO_PLANETS.flatMap((planet) =>
    (AF ? AF.retrogradePeriods(planet, now, new Date(now.getTime() + 365 * 86400000)) : C.planets.retrogradesBetween(planet, now, new Date(now.getTime() + 365 * 86400000))).map((r) => ({ ...r, planet }))
  ).sort((a, b) => a.start.getTime() - b.start.getTime());

  let place = T.readPlace(storage);
  let message = "";
  const draft = { latitude: "", longitude: "" };

  const tx = (text) => (window.SaltAstroTerms ? window.SaltAstroTerms.html(text) : esc(text));
  const section = (label, body) => `<section class="sp-section"><h2 class="sp-label">${esc(label)}</h2>${body}</section>`;
  const card = (body) => `<div class="td-card">${body}</div>`;

  function render() {
    const here = place ? C.sky.placeSky(now, place) : null;
    const sunMoon =
      card(
        `<h3 class="td-card__title">${tx(`Sun in ${sky.sunSign}`)}</h3>` +
          `<p>${tx(`${sky.sunSign} season${sky.sunSignEnds ? `, until ${D(sky.sunSignEnds)}` : ""}: ${sky.sunSeason}.`)}</p>`
      ) +
      card(
        `<h3 class="td-card__title">${tx(`${moon.name} in ${moonSign}`)}</h3>` +
          `<p>${tx(`The Moon in ${moonSign} feels ${M.MOON_IN_SIGN[moonSign].mood}. Good for ${M.MOON_IN_SIGN[moonSign].goodFor}. The ${moon.name.toLowerCase()} is good for ${M.PHASE_GOOD_FOR[moon.name]}.`)}</p>` +
          `<p class="sp-caption${sky.vocNow ? " td-gold" : ""}">${esc(
            sky.vocNow
              ? `Void of course now, until ${C.calendar.relativeDay(now, sky.voc.end)} at ${t(sky.voc.end)}, when it enters ${sky.voc.nextSign}.`
              : `Next void of course: ${D(sky.voc.start)} ${t(sky.voc.start)} until ${t(sky.voc.end)}, then into ${sky.voc.nextSign}.`
          )}</p>` +
          `<p class="sp-caption">${tx(M.VOID_OF_COURSE_MEANING)}</p>`
      );

    const planets =
      `<div class="td-planets">` +
      sky.planets
        .filter((p) => p.planet !== "Sun" && p.planet !== "Moon")
        .map(
          (p) =>
            `<div class="td-planet"><div class="td-planet__head"><h3 class="td-planet__name">${esc(p.planet)}</h3>` +
            `<span class="td-planet__pos"><span aria-hidden="true">${esc(`${p.degree}° ${p.sign}${p.retrograde ? " ℞" : ""}`)}</span><span class="sr-only">${esc(`${p.degree} degrees ${p.sign}${p.retrograde ? ", retrograde" : ""}`)}</span></span></div>` +
            `<p class="sp-caption">${tx(M.planetInSign(p.planet, p.sign))}</p>` +
            (p.nextSign ? `<p class="sp-caption">${esc(`Enters ${p.nextSign.sign} ${D(p.nextSign.date)}`)}</p>` : "") +
            `</div>`
        )
        .join("") +
      `</div>`;

    const retro =
      (sky.retrogrades.length ? "" : `<p class="sp-caption">No planet is retrograde right now.</p>`) +
      sky.retrogrades
        .map((r) =>
          card(
            `<h3 class="td-card__title">${tx(r.when === "now" ? `${r.planet} retrograde until ${D(r.date)}` : `${r.planet} turns retrograde ${D(r.date)}`)}</h3>` +
              (r.meaning ? `<p class="sp-caption">${esc(r.meaning)}</p>` : "")
          )
        )
        .join("") +
      (year.length
        ? `<div class="td-planets"><p class="sp-eyebrow" style="color:var(--muted)">The year ahead</p>` +
          year.map((r) => `<p class="sp-caption">${esc(`${r.planet}: ${D(r.start)} – ${D(r.end)}${r.shadowStart ? ` (shadow ${D(r.shadowStart)} – ${D(r.shadowEnd)})` : ""}`)}</p>`).join("") +
          (AF ? `<p class="sp-caption">${tx("The shadow period runs from when the planet first reaches the degree where it will turn direct, to when it passes the degree where it turned retrograde.")}</p>` : "") +
          `</div>`
        : "");

    const eclipses =
      (sky.eclipses.length ? "" : `<p class="sp-caption">No eclipses in the next year.</p>`) +
      sky.eclipses
        .map((e) =>
          card(
            `<p class="sp-eyebrow" style="color:var(--muted)">${esc(D(e.date))}</p><h3 class="td-card__title">${tx(C.sky.eclipseLabel(e))}</h3>` +
              `<p class="sp-caption">${tx(M.eclipseMeaning(e.type, e.kind))}</p>`
          )
        )
        .join("");

    let where;
    if (here) {
      where =
        card(
          `<p>${esc([here.sun.rise ? `Sunrise ${t(here.sun.rise)}` : "No sunrise today", here.sun.set ? `sunset ${t(here.sun.set)}` : "no sunset today"].join(" · "))}</p>` +
            `<p>${esc([here.moon.rise ? `Moonrise ${t(here.moon.rise)}` : "No moonrise today", here.moon.set ? `moonset ${t(here.moon.set)}` : "no moonset today"].join(" · "))}</p>`
        ) +
        (here.hours
          ? `<div class="td-planets"><h3 class="sp-eyebrow" style="color:var(--muted);font-family:inherit;font-size:0.75rem;font-weight:400">Planetary hours</h3><ol class="td-hours">` +
            here.hours
              .map((h) => {
                const current = now.getTime() >= h.start.getTime() && now.getTime() < h.end.getTime();
                return `<li class="td-hour${current ? " td-hour--now" : ""}"${current ? ' aria-current="time"' : ""}><span class="td-hour__time">${esc(t(h.start))}${h.night ? ' <span aria-label="night">☾</span>' : ""}</span><span>${esc(h.planet)}</span>${current ? '<span class="sr-only"> (now)</span>' : ""}</li>`;
              })
              .join("") +
            `</ol></div>`
          : `<p class="sp-caption">The sun doesn’t rise and set today where you are, so there are no planetary hours.</p>`);
    } else {
      where = `<p>Add your location for sunrise, sunset, moonrise and planetary hours.</p>`;
    }

    const form = card(
      `<h3 class="td-card__title">Your location</h3>` +
        `<p class="sp-caption">${esc(
          place
            ? `Set ${place.source === "device" ? "from this browser" : "by hand"}. It stays in this browser, rounded to about a kilometre, and is never sent anywhere.`
            : "Used only in this browser to work out the sky where you are. It is never sent anywhere."
        )}</p>` +
        `<div class="sp-actions"><button type="button" class="button button--ghost" data-use-location>Use my location</button></div>` +
        `<form class="td-form-grid" data-place-form novalidate>` +
        `<div class="sp-field"><label for="sky-lat">Latitude</label><input id="sky-lat" name="latitude" inputmode="decimal" autocomplete="off" placeholder="e.g. 52.52" value="${esc(draft.latitude)}" /></div>` +
        `<div class="sp-field"><label for="sky-lon">Longitude</label><input id="sky-lon" name="longitude" inputmode="decimal" autocomplete="off" placeholder="e.g. 13.40 (west is negative)" value="${esc(draft.longitude)}" /></div>` +
        `<div class="sp-actions"><button type="submit" class="button button--ghost">Save location</button>${place ? '<button type="button" class="button button--ghost" data-forget>Forget my location</button>' : ""}</div>` +
        `</form>` +
        (message ? `<p class="sp-notice" role="status">${esc(message)}</p>` : "")
    );

    root.innerHTML =
      `<p><a class="sp-back" href="/today/">‹ Back to Today</a></p>` +
      `<header><p class="sp-eyebrow">Astrology</p><h1>The sky today</h1></header>` +
      section("Sun and Moon", sunMoon) +
      section("Planets", planets) +
      section("Retrogrades", retro) +
      section("Eclipses", eclipses) +
      section("Where you are", where + form);
  }

  root.addEventListener("input", (event) => {
    if (event.target.name === "latitude" || event.target.name === "longitude") draft[event.target.name] = event.target.value;
  });
  root.addEventListener("submit", (event) => {
    if (!event.target.matches("[data-place-form]")) return;
    event.preventDefault();
    const saved = T.savePlace(storage, T.parseCoordinate(draft.latitude), T.parseCoordinate(draft.longitude), "manual");
    if (saved) {
      place = saved;
      message = "Location saved. It stays in this browser.";
    } else {
      message = "Enter a latitude from -90 to 90 and a longitude from -180 to 180 (west and south are negative).";
    }
    render();
    root.querySelector("[role=status]")?.focus?.();
  });
  root.addEventListener("click", async (event) => {
    if (event.target.closest("[data-forget]")) {
      T.clearPlace(storage);
      place = null;
      message = "Location forgotten.";
      render();
      return;
    }
    const button = event.target.closest("[data-use-location]");
    if (!button) return;
    button.disabled = true;
    message = "Finding where you are…";
    const status = root.querySelector("[role=status]");
    if (status) status.textContent = message;
    const { result, place: found } = await T.askBrowserLocation(storage, navigator.geolocation);
    if (result === "ok") place = found;
    message =
      result === "ok"
        ? "Location set. It stays in this browser."
        : result === "denied"
          ? "Location wasn’t allowed. You can allow it in your browser’s settings, or enter it below."
          : "This browser couldn’t find your location. Enter it below.";
    render();
  });

  render();
})();
