/*
 * Cosmic & celestial: the practice page, My chart, Birth details and
 * Planetary hours, as the app has them (app/src/app/(tabs)/rituals/craft/cosmic).
 * The birth details live in craft_entries, collection "cosmic.chart".
 */
(function () {
  const PB = window.PracticeB;
  const { h, links } = PB;
  const B = window.SaltCore && window.SaltCore["practice-b"];
  const HUB = { href: "/practice/cosmic/", label: "Cosmic & celestial" };
  const CHART_URL = "/practice/cosmic/chart/";
  const EDIT_URL = "/practice/cosmic/chart-edit/";
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const chartOf = (entries) => {
    const input = entries[0]?.data ?? null;
    return { input, chart: input ? B.chart.natalChart(input) : null };
  };

  // ── The practice page ─────────────────────────────────────────────────────
  async function hub(root) {
    const about = B.premade.PRACTICES.find((p) => p.id === "cosmic")?.about;
    const tools = B.practices.CRAFT_TOOLS.cosmic;
    const { entries, problem } = await PB.listEntries(B.cosmicCollections.CHART);
    const { chart } = chartOf(entries);
    const place = PB.getPlace();
    const now = new Date();
    const hour = place ? B.hoursAstro.currentHour(now, place) : null;
    const { timeOfDay } = B.calendar;
    const bigThree = chart
      ? [`Sun ${B.chart.natalOf(chart, "Sun").sign}`, `Moon ${B.chart.natalOf(chart, "Moon").sign}`, chart.ascendant ? `${chart.ascendant.sign} rising` : null].filter(Boolean).join(" · ")
      : null;
    const details = [bigThree, hour ? `${hour.planet} hour until ${timeOfDay(hour.end)}` : null];
    const routes = [CHART_URL, "/practice/cosmic/hours/"];

    root.innerHTML = [
      h.head("My practice", "Cosmic & celestial", { href: links.hub, label: "My practice" }),
      about ? h.muted(about) : "",
      h.notice(problem),
      hour
        ? h.card(`${h.label("This hour")}${h.cardTitle(`The hour of ${hour.planet}`)}${h.muted(`Until ${timeOfDay(hour.end)}. Good for ${B.hours.HOUR_SUITS[hour.planet].short}.`)}`, { gold: true })
        : "",
      h.section("Tools", h.list(tools.map((tool, i) => h.row({ href: routes[i], title: tool.title, detail: details[i] ?? tool.detail })), "Cosmic tools")),
      h.list([
        h.row({ href: "/today/sky/", title: "The sky today", detail: "Planets, retrogrades and eclipses" }),
        h.row({ href: links.premadeFor("cosmic"), title: "Cosmic workings", detail: "Premade rituals and spells; filter by Cosmic & celestial" })
      ])
    ].join("");
  }

  // ── My chart ──────────────────────────────────────────────────────────────
  function moonInMySigns(chart, month) {
    const sunSign = B.chart.natalOf(chart, "Sun").sign;
    const moonSign = B.chart.natalOf(chart, "Moon").sign;
    const signs = sunSign === moonSign ? [sunSign] : [sunSign, moonSign];
    return signs.map((sign) => ({
      sign,
      label: sign === sunSign && sign === moonSign ? "your sun and moon sign" : sign === sunSign ? "your sun sign" : "your moon sign",
      spells: B.transits.moonInSign(sign, month.start, month.end)
    }));
  }

  function bigOne(title, position, body, caveat) {
    return h.card(
      `<div class="pb-head">${h.cardTitle(title)}<span class="pb-orb">${h.esc(B.chart.formatPlacement(position))}</span></div>${h.p(body)}${caveat ? h.notice(caveat) : ""}`
    );
  }

  async function chartPage(root) {
    const { entries, problem } = await PB.listEntries(B.cosmicCollections.CHART);
    const { input, chart } = chartOf(entries);
    const head = h.head("Cosmic & celestial", "My chart", HUB);
    const { shortDate, timeOfDay } = B.calendar;
    const T = B.transits;

    if (!input || !chart) {
      root.innerHTML = [
        head,
        h.notice(problem),
        h.card(
          `${h.cardTitle("Your sun, moon and rising")}${h.p(
            "Add your birth date to see where the Sun, Moon and planets stood when you arrived. With a birth time and place, you’ll see your rising sign and Midheaven too, and each day, which planets are touching them."
          )}${h.actions([h.button("Add my birth details", { href: EDIT_URL })])}`,
          { gold: true }
        ),
        input && !chart ? h.notice("Your saved birth date couldn’t be read. Edit it to try again.") : ""
      ].join("");
      return;
    }

    const now = new Date();
    const sun = B.chart.natalOf(chart, "Sun");
    const moon = B.chart.natalOf(chart, "Moon");
    const transits = T.transitsAt(chart, now);
    const month = T.monthAround(now);
    const spells = moonInMySigns(chart, month);
    const others = chart.placements.filter((p) => p.body !== "Sun" && p.body !== "Moon");
    const when = (d) => `${shortDate(d)}, ${timeOfDay(d)}`;

    const bigThree = [
      bigOne(`Sun in ${sun.sign}`, sun, T.sunMeaning(sun.sign)),
      bigOne(
        `Moon in ${moon.sign}`,
        moon,
        T.moonMeaning(moon.sign),
        moon.orSign
          ? `The Moon changed sign on your birthday, so without a birth time it may be in ${moon.orSign} instead.`
          : !chart.timeKnown
            ? "Without a birth time the Moon’s degree is approximate; it moves about 13° a day."
            : undefined
      ),
      chart.ascendant
        ? bigOne(`${chart.ascendant.sign} rising`, chart.ascendant, T.RISING[chart.ascendant.sign])
        : h.card(
            `${h.cardTitle("Rising sign")}${h.muted(
              !chart.timeKnown
                ? "Your rising sign needs a birth time: it changes about every two hours. Add one if you know it, even roughly."
                : "Your rising sign needs your birthplace. Add its latitude and longitude."
            )}${h.actions([h.button("Add birth time and place", { variant: "ghost", href: EDIT_URL })])}`
          ),
      sun.orSign ? h.notice(`The Sun changed sign on your birthday. Without a birth time, you may be a ${sun.orSign} sun instead.`) : ""
    ].join("");

    const touching = transits.length
      ? transits
          .map((t) => {
            const symbol = T.ASPECTS.find((a) => a.name === t.aspect).symbol;
            const target = t.natal === "Ascendant" ? "rising" : `natal ${t.natal}`;
            return h.card(
              `<div class="pb-head">${h.cardTitle(`${t.transiting} ${symbol} ${target}`)}<span class="pb-orb">${h.esc(`${t.off.toFixed(1)}° ${t.applying ? "closing" : "parting"}`)}</span></div>${h.p(
                T.transitLine(t)
              )}${h.muted(`${t.aspect[0].toUpperCase()}${t.aspect.slice(1)}: ${T.ASPECT_TONE[t.aspect]}`)}`
            );
          })
          .join("")
      : h.muted("No planet is in close aspect to your sun, moon or rising today. A quiet sky for you: good for steady, ordinary work.");

    const moonCards = spells
      .map((s) => {
        const lines = s.spells
          .map((spell) => {
            const current = now >= spell.start && now < spell.end;
            const past = spell.end <= now;
            const from = spell.start.getTime() === month.start.getTime() ? "From the 1st" : when(spell.start);
            return `<li class="pb-spell${current ? " is-now" : ""}"><span class="${current ? "pb-gold" : past ? "pb-past" : ""}">${h.esc(`${from} – ${when(spell.end)}`)}</span>${current || past ? `<span class="sp-caption">${current ? "Now" : "Passed"}</span>` : ""}</li>`;
          })
          .join("");
        return h.card(
          `${h.cardTitle(`Moon in ${s.sign}`)}${h.muted(`When the Moon passes through ${s.label}, it’s a time many feel more themselves: good for workings that are about you.`)}${
            s.spells.length ? `<ul class="pb-plain">${lines}</ul>` : h.muted("Not this month.")
          }`
        );
      })
      .join("");

    const rest = [
      chart.midheaven
        ? `<div class="pb-planet-row"><div class="pb-head"><h3>Midheaven</h3><span class="pb-orb">${h.esc(B.chart.formatPlacement(chart.midheaven))}</span></div>${h.caption(T.midheavenMeaning(chart.midheaven.sign))}</div>`
        : "",
      ...others.map(
        (p) =>
          `<div class="pb-planet-row" aria-label="${h.esc(`${p.body} at ${p.degree} degrees ${p.sign}`)}" role="group"><div class="pb-head"><h3>${h.esc(p.body)}</h3><span class="pb-orb">${h.esc(
            B.chart.formatPlacement(p)
          )}</span></div>${h.caption(B.meanings.planetInSign(p.body, p.sign))}${p.orSign ? h.caption(`Or ${p.orSign}, depending on your birth time.`) : ""}</div>`
      )
    ].join("");

    const birth = h.card(
      [
        h.label("Your birth details"),
        h.p([input.date, chart.timeKnown ? input.time : "time unknown", B.chart.formatOffset(input.utcOffsetMinutes) + (input.offsetFromDevice ? " (from your device)" : "")].join(" · ")),
        h.muted(chart.placeKnown ? `${input.placeLabel ? `${input.placeLabel}, ` : ""}${input.latitude.toFixed(2)}°, ${input.longitude.toFixed(2)}°` : "No birthplace"),
        h.muted(
          "The time zone matters: an hour out shifts your rising sign by about 15°, often a whole sign, and can move the Moon’s. If you were born somewhere else, or summer time was in force, check the offset."
        ),
        chart.polar ? h.notice("You were born inside a polar circle, where the rising sign can jump or stall. Treat it lightly.") : "",
        chart.outsideRange ? h.notice("The planet tables are tuned for 1800 to 2050, so positions for this date are rougher.") : "",
        h.actions([h.button("Edit birth details", { variant: "ghost", href: EDIT_URL })])
      ].join("")
    );

    root.innerHTML = [
      head,
      h.notice(problem),
      h.section("Your big three", bigThree),
      h.section(
        "What touches your chart today",
        `${touching}${h.muted(`Aspects within 3° (5° for the Moon) to your natal Sun, Moon${chart.ascendant ? " and rising" : ""}. “Closing” ones are still building.`)}`
      ),
      h.section(`The Moon in your signs, ${MONTHS[now.getMonth()]}`, moonCards),
      h.details("The rest of your chart", rest),
      birth
    ].join("");
  }

  // ── Birth details ─────────────────────────────────────────────────────────
  async function chartEdit(root) {
    const C = B.chart;
    const { entries, problem: loadProblem } = await PB.listEntries(B.cosmicCollections.CHART);
    const existing = entries[0] ?? null;
    const d = existing?.data;
    const state = {
      date: d?.date ?? "",
      time: d?.time ?? "",
      useDevice: d ? !!d.offsetFromDevice : true,
      offset: d && !d.offsetFromDevice ? C.formatOffset(d.utcOffsetMinutes).replace("UTC", "").replace("−", "-") : "",
      lat: typeof d?.latitude === "number" ? String(d.latitude) : "",
      lon: typeof d?.longitude === "number" ? String(d.longitude) : "",
      label: d?.placeLabel ?? "",
      saving: false
    };

    const zoneHtml = () => {
      const valid = C.parseDate(state.date);
      const deviceOffset = C.deviceOffsetOn(valid ? state.date.trim() : "");
      return [
        h.toggle({
          id: "chart-use-device",
          label: "Use my device’s time zone",
          detail: valid ? `${C.formatOffset(deviceOffset)} on that date, summer time included` : "Its offset on your birth date",
          checked: state.useDevice,
          attrs: { "data-change": "device" }
        }),
        state.useDevice ? "" : h.field({ id: "chart-offset", label: "UTC offset at birth", value: state.offset, placeholder: "e.g. +1, -5 or +5:30", attrs: { "data-input": "offset", autocomplete: "off" } })
      ].join("");
    };

    root.innerHTML = [
      h.head("My chart", "Birth details", { href: CHART_URL, label: "My chart" }),
      h.muted("Kept with your account, like the rest of your practice tools. Only the date is needed; time and place add your rising sign."),
      PB.signedIn() ? "" : h.muted("Saved in this browser. Sign in to keep your chart with your account."),
      h.notice(loadProblem),
      h.card(
        [
          h.label("When"),
          h.field({ id: "chart-date", label: "Birth date (year-month-day)", value: state.date, placeholder: "e.g. 1990-06-15", attrs: { "data-input": "date", autocomplete: "off" } }),
          h.field({ id: "chart-time", label: "Birth time, if known", value: state.time, placeholder: "e.g. 14:30 or 2:30 pm", attrs: { "data-input": "time", autocomplete: "off" } }),
          h.muted("Use the clock time on your birth certificate. Leave it blank if you don’t know; your Sun and planets will still be right.")
        ].join("")
      ),
      h.card(
        [
          h.label("Time zone at birth"),
          `<div class="pb-stack" data-part="zone">${zoneHtml()}</div>`,
          h.notice(
            "The time zone matters. If you were born in another time zone from the one your device is in now, or when summer time rules were different, enter the offset by hand: an hour out can change your rising sign. For births before standard time zones (around 1900), use local mean time: your longitude ÷ 15 hours."
          )
        ].join("")
      ),
      h.card(
        [
          h.label("Where"),
          h.actions([h.button("Use my current place", { variant: "ghost", attrs: { "data-action": "here" } })]),
          `<div class="sp-grid-2">${h.field({ id: "chart-lat", label: "Latitude", value: state.lat, placeholder: "e.g. 51.51 (south is negative)", attrs: { "data-input": "lat", inputmode: "decimal", autocomplete: "off" } })}${h.field({
            id: "chart-lon",
            label: "Longitude",
            value: state.lon,
            placeholder: "e.g. -0.13 (west is negative)",
            attrs: { "data-input": "lon", inputmode: "decimal", autocomplete: "off" }
          })}</div>`,
          h.field({ id: "chart-label", label: "Place name (optional)", value: state.label, placeholder: "e.g. London", attrs: { "data-input": "label", autocomplete: "off" } }),
          h.muted("Your birth town’s latitude and longitude, to two decimal places, are plenty. A map will show them if you search the town."),
          '<div data-part="message" aria-live="polite"></div>'
        ].join("")
      ),
      '<div data-part="problem" aria-live="assertive"></div>',
      h.actions([
        h.button("Save", { attrs: { "data-action": "save", "data-focus": "save" } }),
        existing ? h.button("Delete birth details", { variant: "text", attrs: { "data-action": "remove" } }) : ""
      ])
    ].join("");

    const part = (name) => root.querySelector(`[data-part="${name}"]`);
    const say = (name, text) => (part(name).innerHTML = h.notice(text));
    const fillPlace = (place, text) => {
      state.lat = String(place.latitude);
      state.lon = String(place.longitude);
      root.querySelector("#chart-lat").value = state.lat;
      root.querySelector("#chart-lon").value = state.lon;
      say("message", text);
    };

    const save = async () => {
      say("problem", "");
      const date = C.parseDate(state.date);
      if (!date) return say("problem", "Enter your birth date as year-month-day, for example 1990-06-15.");
      if (date.year < 1800 || date.year > 2050) return say("problem", "Birth dates from 1800 to 2050 work best with these planet tables.");
      const t = state.time.trim() ? C.parseTime(state.time) : null;
      if (state.time.trim() && !t) return say("problem", "Enter the time as hours and minutes, like 14:30 or 2:30 pm, or leave it blank.");
      const minutes = state.useDevice ? C.deviceOffsetOn(state.date.trim()) : C.parseOffset(state.offset);
      if (minutes === null) return say("problem", "Enter the UTC offset at your birth, like +1, -5 or +5:30.");
      let latitude = null;
      let longitude = null;
      if (state.lat.trim() || state.lon.trim()) {
        latitude = PB.parseNumber(state.lat);
        longitude = PB.parseNumber(state.lon);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
          return say("problem", "Latitude runs from -90 to 90 and longitude from -180 to 180. South and west are negative.");
        }
      }
      const data = {
        date: `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`,
        time: t ? C.formatTime(t) : "",
        utcOffsetMinutes: minutes,
        offsetFromDevice: state.useDevice,
        latitude,
        longitude,
        placeLabel: state.label.trim() || null
      };
      if (state.saving) return;
      state.saving = true;
      const button = root.querySelector('[data-action="save"]');
      button.textContent = "Saving…";
      button.disabled = true;
      try {
        if (existing) await window.SaltCraft.update(B.cosmicCollections.CHART, existing.id, data);
        else await window.SaltCraft.add(B.cosmicCollections.CHART, data);
        window.location.href = CHART_URL;
      } catch (error) {
        console.warn("[practice]", error);
        say("problem", "Your birth details couldn’t be saved. They’re still here, so you can try again.");
      } finally {
        state.saving = false;
        button.textContent = "Save";
        button.disabled = false;
      }
    };

    PB.bind(root, {
      input: {
        date: (el) => {
          state.date = el.value;
          PB.paint(part("zone"), zoneHtml());
        },
        time: (el) => (state.time = el.value),
        offset: (el) => (state.offset = el.value),
        lat: (el) => (state.lat = el.value),
        lon: (el) => (state.lon = el.value),
        label: (el) => (state.label = el.value)
      },
      change: {
        device: (el) => {
          state.useDevice = el.checked;
          PB.paint(part("zone"), zoneHtml());
        }
      },
      click: {
        here: async () => {
          const saved = PB.getPlace();
          if (saved) return fillPlace(saved, "Filled in from your saved place. Change it if you were born somewhere else.");
          say("message", "Finding where you are…");
          const result = await PB.askLocation();
          if (result === "ok") fillPlace(PB.getPlace(), "Filled in from where you are now. Change it if you were born somewhere else.");
          else
            say(
              "message",
              result === "denied"
                ? "Location wasn’t allowed. You can enter your birthplace’s latitude and longitude below."
                : "Your browser’s location isn’t available here. Enter your birthplace’s latitude and longitude below."
            );
        },
        save,
        remove: async () => {
          if (!existing) return;
          if (!PB.confirmAction("Delete your birth details?", "Your chart will be cleared from this browser and your account.")) return;
          try {
            await window.SaltCraft.remove(B.cosmicCollections.CHART, existing.id);
            window.location.href = CHART_URL;
          } catch {
            say("problem", "Your birth details couldn’t be deleted just now. Please try again.");
          }
        }
      }
    });
  }

  // ── Planetary hours ───────────────────────────────────────────────────────
  async function hoursPage(root) {
    const { timeOfDay, relativeDay } = B.calendar;
    const span = (a, b) => `${timeOfDay(a)} – ${timeOfDay(b)}`;
    const suits = B.hours.HOUR_SUITS;
    let pick = null;

    root.innerHTML = [
      h.head("Cosmic & celestial", "Planetary hours", HUB),
      h.muted(
        "Day and night are each split into twelve hours, longer or shorter with the seasons. Each is ruled in turn by one of the seven old planets, starting at sunrise with the planet that rules the day."
      ),
      '<div class="pb-stack" data-part="body"></div>',
      '<div data-part="place"></div>',
      h.list([h.row({ href: "/today/sky/", title: "The sky today", detail: "Planets, retrogrades, eclipses and your place" })])
    ].join("");
    const body = root.querySelector('[data-part="body"]');
    const placeBox = root.querySelector('[data-part="place"]');

    const drawPlace = () => {
      const place = PB.getPlace();
      placeBox.innerHTML = place
        ? h.details("Change my place", PB.placeForm("hours", { intro: "Planetary hours run from your sunrise and sunset. Your place stays in this browser, rounded to about a kilometre.", place }))
        : h.card(
            `${h.cardTitle("Where are you?")}${PB.placeForm("hours", {
              intro: "Planetary hours run from your sunrise and sunset, so they need your place. It stays in this browser, rounded to about a kilometre."
            })}`
          );
    };

    const draw = () => {
      const now = new Date();
      const place = PB.getPlace();
      const hours = place ? B.hoursAstro.planetaryHours(now, place) : null;
      const isNow = (x) => B.hours.isNow(x, now);
      const current = hours?.find(isNow) ?? null;
      const upcoming = current && hours ? hours[hours.indexOf(current) + 1] ?? null : null;
      const dayStart = B.hours.startOfLocalDay(now);
      const voc = B.hours.vocForDay(dayStart);
      const nextVoc = voc.length ? null : B.voidOfCourse.voidOfCourse(dayStart);
      const picked = pick && place ? B.hours.nextHoursOf(pick, now, place, 3) : [];

      const out = [];
      if (place && !hours) out.push(h.card(h.p("The sun doesn’t rise and set today where you are, so there are no planetary hours. They return when sunrise does.")));
      if (current) {
        out.push(
          h.card(
            `${h.label("Now")}${h.cardTitle(`The hour of ${current.planet}`)}${h.muted(`${span(current.start, current.end)}${current.night ? " · night" : ""}`)}${h.p(suits[current.planet].suits)}${
              upcoming ? h.muted(`Next: ${upcoming.planet}, for ${suits[upcoming.planet].short}, from ${timeOfDay(upcoming.start)}.`) : ""
            }`,
            { gold: true }
          )
        );
      }
      const vocLines = voc.length
        ? voc
            .map((v) => {
              const live = now >= v.start && now < v.end;
              return `<p class="${live ? "pb-gold" : ""}">${h.esc(
                `${live ? "Void of course now" : "Void of course"}: ${relativeDay(now, v.start)} ${timeOfDay(v.start)} until ${relativeDay(now, v.end)} ${timeOfDay(v.end)}, when it enters ${v.nextSign}.`
              )}</p>`;
            })
            .join("")
        : h.p(
            nextVoc
              ? `The Moon isn’t void of course today. Next: ${relativeDay(now, nextVoc.start)} at ${timeOfDay(nextVoc.start)}, until it enters ${nextVoc.nextSign} at ${timeOfDay(nextVoc.end)}.`
              : "The Moon isn’t void of course today."
          );
      out.push(h.section("The Moon today", h.card(`${vocLines}${h.muted(B.meanings.VOID_OF_COURSE_MEANING)}`)));

      if (place) {
        const chips = B.hours.HOUR_PLANETS.map((p) => h.chip(p, { pressed: pick === p, a11y: `Next hours of ${p}`, attrs: { "data-action": "pick", "data-planet": p, "data-focus": `pick-${p}` } }));
        out.push(
          h.section(
            "Find the next hour of",
            `${h.chips(chips, "Planets")}${
              pick
                ? h.card(
                    `${h.cardTitle(`${pick} hours`)}${h.muted(suits[pick].suits)}${picked.length ? "" : h.muted("None in the coming week where you are.")}${picked
                      .map((x) => `<p class="${isNow(x) ? "pb-gold" : ""}">${h.esc(`${isNow(x) ? "Now" : relativeDay(now, x.start)}: ${span(x.start, x.end)}`)}</p>`)
                      .join("")}`
                  )
                : ""
            }`
          )
        );
      }

      if (hours) {
        for (const night of [false, true]) {
          const items = hours
            .filter((x) => x.night === night)
            .map((x) => {
              const on = isNow(x);
              const past = x.end <= now;
              const tone = on ? "pb-gold" : past ? "pb-past" : "";
              return `<li class="${on ? "is-now" : ""}" aria-label="${h.esc(`${on ? "Now. " : ""}${x.planet} hour, ${span(x.start, x.end)}. Good for ${suits[x.planet].short}.`)}"><span class="pb-time ${tone}" aria-hidden="true">${h.esc(
                timeOfDay(x.start)
              )}</span><span class="pb-what" aria-hidden="true"><span class="pb-planet ${tone}">${h.esc(x.planet)}</span><span class="sp-caption">${h.esc(suits[x.planet].short)}</span></span>${on ? '<span class="pb-now" aria-hidden="true">Now</span>' : ""}</li>`;
            })
            .join("");
          out.push(h.section(night ? "Night hours, sunset to sunrise" : "Day hours, sunrise to sunset", `<ul class="pb-timeline">${items}</ul>`));
        }
        out.push(h.muted(`Worked out for ${place.latitude.toFixed(2)}°, ${place.longitude.toFixed(2)}°. Change your place below.`));
      }
      PB.paint(body, out.join(""));
    };

    const refresh = () => {
      drawPlace();
      draw();
    };
    PB.bind(root, {
      click: {
        pick: (el) => {
          const planet = el.getAttribute("data-planet");
          pick = pick === planet ? null : planet;
          draw();
        },
        ...PB.placeHandlers(root, "hours", refresh)
      }
    });
    refresh();
    clearInterval(root._pbTimer);
    root._pbTimer = setInterval(draw, 60000);
  }

  const VIEWS = { "cosmic-hub": hub, "cosmic-chart": chartPage, "cosmic-chart-edit": chartEdit, "cosmic-hours": hoursPage };
  const view = document.querySelector("[data-page-root]")?.getAttribute("data-view");
  if (VIEWS[view]) PB.start((root) => VIEWS[view](root));
})();
