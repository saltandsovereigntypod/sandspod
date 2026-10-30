/*
 * Practice → Craft → Cycle & Moon on the website (its address stays /rituals/cycle/), as the app has it
 * (app/src/app/(tabs)/rituals/cycle/): the tool itself with today's exact
 * reading, then ?view=log (a day, with symptoms), past (past periods: a
 * calendar, a pasted list, editing), history (What am I?), insights
 * (symptoms, patterns and comfort), learn (inner seasons and moon patterns),
 * settings (cycle length, choices, privacy and sync, delete), share (the
 * coven status) and keep (a reflection in the Grimoire). The maths, words and encryption are the app's own
 * (js/core/cycle.js); the vault is kept by rituals/cycle/cycle-store.js.
 */
(function (global) {
  "use strict";

  const S = global.CycleMoonStore;
  const C = () => global.SaltCore.cycle;
  const esc = (text) => global.SaltPage.esc(text);
  const root = () => global.document.querySelector("[data-page-root]");
  const params = () => new URLSearchParams(global.location.search);
  const view = () => params().get("view") || "";
  const href = (v, extra = {}) => {
    const q = new URLSearchParams({ ...(v ? { view: v } : {}), ...extra });
    return `/rituals/cycle/${q.toString() ? `?${q}` : ""}`;
  };
  const SIGN_IN = "/?sanctuary=auth";
  let flash = "";
  let recovery = null;
  let busy = null;

  const SYNC_LINE = {
    synced: "Encrypted in this browser · kept with your account",
    saving: "Encrypted in this browser · saving to your account…",
    offline: "Encrypted · couldn’t reach your account just now, kept in this browser",
    unavailable: "Encrypted · kept in this browser (sync isn’t ready on the server yet)",
    device: "Encrypted · kept in this browser only",
    "signed-out": "Encrypted · kept in this browser only",
  };

  function linkHref(link) {
    if (link.kind === "premade") return `/rituals/premade/?id=${encodeURIComponent(link.id)}`;
    if (link.kind === "library") return `/library/entry/?entity=${encodeURIComponent(link.id.replace(/:/g, "/"))}`;
    return `/divination/draw/?spread=${encodeURIComponent(link.id)}`;
  }
  const suggestionHtml = (s, eyebrow) => `<section class="sp-card">
      ${eyebrow ? `<p class="sp-eyebrow sp-gold">${esc(eyebrow)}</p>` : ""}
      <h3>${esc(s.title)}</h3><p>${esc(s.line)}</p>
      <div class="sp-chips">${s.links.map((l) => `<a class="sp-chip" href="${esc(linkHref(l))}">${esc(l.label)} ›</a>`).join("")}</div>
    </section>`;
  const chipLinks = (links) => (links.length ? `<div class="sp-chips">${links.map((l) => `<a class="sp-chip" href="${esc(linkHref(l))}">${esc(l.label)} ›</a>`).join("")}</div>` : "");
  const readingHtml = (r, date) => `<section class="sp-card sp-card--gold" data-reading>
      <p class="sp-eyebrow sp-gold">Today’s reading</p><h2>${esc(r.headline)}</h2><p class="sp-caption">${esc(r.moonLine)}</p>${r.signLine ? `<p class="sp-caption">${window.SaltAstroTerms ? window.SaltAstroTerms.html(r.signLine) : esc(r.signLine)}</p>` : ""}
      <h3>${esc(r.reading.title)}</h3><p>${esc(r.reading.line)}</p><p>${esc(r.reading.practice)}</p>${chipLinks(r.reading.links)}
      <p class="sp-caption">To write about</p><h3>${esc(r.reading.prompt)}</h3>
      <p><a class="rt-text-link" href="${esc(href("log", { date }))}">Write about it</a></p></section>`;
  const comfortHtml = (c) => `<section class="sp-card"><h3>${esc(c.title)}</h3><ul class="cm-ideas">${c.ideas.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <p class="sp-caption">With care: ${esc(c.safety)}</p>${chipLinks(c.links)}</section>`;
  const longDate = (key) => `${C().model.dayMonth(key)} ${key.slice(0, 4)}`;
  const back = (label = "Cycle & Moon", to = href("")) => `<a class="sp-back" href="${esc(to)}">‹ ${esc(label)}</a>`;
  const head = (title, eyebrow = "") => `<header class="rt-head">${eyebrow ? `<p class="sp-eyebrow">${esc(eyebrow)}</p>` : ""}<h1>${esc(title)}</h1></header>`;
  const status = () => (flash ? `<p class="sp-notice" role="status" aria-live="polite">${esc(flash)}</p>` : `<p class="sp-notice" role="status" aria-live="polite" hidden></p>`);
  const notMedical = () => `<p class="sp-caption cm-note">${esc(C().content.NOT_MEDICAL)}</p>`;
  const dateLabel = (key, opts = { weekday: "long", day: "numeric", month: "long" }) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, opts);
  const passField = (name, label) => `<div class="sp-field"><label for="cm-${name}">${esc(label)}</label><input id="cm-${name}" name="${name}" type="password" autocomplete="off" autocapitalize="none" spellcheck="false" /></div>`;
  const progress = (label) => `<div class="cm-progress" data-progress hidden><p class="sp-caption">${esc(label)}</p><div class="cm-track"><div class="cm-bar" data-bar></div></div></div>`;
  const onProgress = (form) => (done) => {
    const box = form.querySelector("[data-progress]");
    if (!box) return;
    box.hidden = false;
    box.querySelector("[data-bar]").style.width = `${Math.max(4, Math.round(done * 100))}%`;
  };
  const problem = (a, b) => {
    const min = C().vault.MIN_PASSPHRASE;
    return a.normalize("NFKC").length < min ? `At least ${min} characters. A few unrelated words make a good one.` : a !== b ? "The two passphrases don’t match." : null;
  };
  const say = (message) => {
    flash = message;
    const line = root().querySelector("[role=status]");
    if (line) {
      line.textContent = message;
      line.hidden = !message;
    }
  };

  // ── The wheel ──
  function wheelSvg(wheel) {
    const M = C().model;
    const colours = C().content.SEASON_COLOURS;
    const patternColours = C().content.PATTERN_COLOURS;
    const size = 280;
    const c = size / 2;
    const ring = size * 0.36;
    const inner = size * 0.27;
    const n = wheel.days.length;
    const arcs = wheel.days
      .map((d, i) => `<path d="${M.wheelArc(i / n, (i + 1) / n - 0.002, c, c, ring)}" stroke="${colours[d.season]}" stroke-opacity="${d.byMoon ? 0.55 : 0.9}" stroke-width="${d.bleeding ? 26 : 18}" fill="none"><title>${esc(dateLabel(d.key, { day: "numeric", month: "short" }))}: ${esc(M.SEASON_NAMES[d.season])}</title></path>`)
      .join("");
    const marks = wheel.marks
      .map((m) => {
        const p = M.wheelPoint(m.fraction, c, c, size * 0.46);
        return `<circle cx="${p.x}" cy="${p.y}" r="7" fill="${m.fraction === 0 ? "#070a08" : m.fraction === 0.5 ? "#f4ecd8" : "#1c2e22"}" stroke="rgba(226,195,109,0.28)"><title>${esc(m.name)}</title></circle>`;
      })
      .join("");
    const bleeds = wheel.bleeds
      .map((b, i) => {
        const p = M.wheelPoint(b.fraction, c, c, inner);
        return `<circle cx="${p.x}" cy="${p.y}" r="${i === 0 ? 7 : 5}" fill="${patternColours[b.pattern]}" opacity="${i === 0 ? 1 : 0.7}" stroke="#070a08"><title>${esc(dateLabel(b.start, { day: "numeric", month: "short" }))}: ${esc(M.PATTERN_NAMES[b.pattern])}</title></circle>`;
      })
      .join("");
    const t = M.wheelPoint(wheel.today, c, c, ring);
    const seasons = [...new Set(wheel.days.map((d) => M.SEASON_NAMES[d.season]))].join(", ");
    const label = `The moon wheel for this lunar month: ${seasons}.${wheel.bleeds.length ? ` ${wheel.bleeds.length} recent bleeds marked.` : ""}`;
    const legend = ["winter", "spring", "summer", "autumn"].map((s) => `<span><i style="background:${colours[s]}"></i>${esc(M.SEASON_NAMES[s])}</span>`).join("");
    return `<figure class="cm-wheel"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(label)}">
        <circle cx="${c}" cy="${c}" r="${ring}" stroke="rgba(244,236,216,0.12)" stroke-width="22" fill="none" />${arcs}${marks}${bleeds}
        <circle cx="${t.x}" cy="${t.y}" r="9" fill="none" stroke="#f4ecd8" stroke-width="2.5"><title>Today</title></circle>
        <text x="${c}" y="${c - 4}" fill="#f4ecd8" font-size="15" text-anchor="middle">this lunar month</text>
        <text x="${c}" y="${c + 16}" fill="#cabf9d" font-size="12" text-anchor="middle">new at the top · full below</text>
      </svg><figcaption class="cm-legend">${legend}<span><i class="cm-today"></i>today</span>${wheel.bleeds.length ? `<span><i style="background:${patternColours[wheel.bleeds[0].pattern]}"></i>where a bleed began</span>` : ""}</figcaption></figure>`;
  }

  // ── Views ──
  function beginView() {
    const signedIn = !!S.state.userId;
    return `<section class="sp-card"><h2>Your cycle, beside the moon</h2>
        <p>Log your bleeds and how the days feel, see where each bleed falls in the lunar month, and find practice that suits your inner season. If you don’t bleed, you can follow the moon alone.</p>
        <p class="sp-muted">Everything is encrypted in this browser before it’s kept anywhere. Choose how to keep it; you can change this later.</p></section>
      ${
        signedIn
          ? `<form class="sp-card sp-card--gold" data-form="protect"><h2>Keep it with my account</h2>
        <p>Protected by a Cycle &amp; Moon passphrase only you know, so it shows on the app on any phone and here. The server only ever holds it encrypted. Not your account password: a few unrelated words are easy to remember and hard to guess.</p>
        ${passField("pass", "Passphrase")}${passField("again", "The same again")}
        <label class="cm-check"><input type="checkbox" name="remember" /> <span>Remember it on this device<br /><span class="sp-caption">Leave this off on a shared computer: you’ll enter the passphrase each visit.</span></span></label>
        ${progress("Making your key. This takes a moment on purpose.")}
        <div class="sp-actions"><button class="button button--primary" type="submit">Protect and keep with my account</button></div></form>`
          : `<section class="sp-card"><p>Sign in to keep it with your account, encrypted, so it shows in the app too.</p><div class="sp-actions"><a class="button button--ghost" href="${SIGN_IN}">Sign in</a></div></section>`
      }
      <section class="sp-card"><h2>Keep it in this browser only</h2><p>No passphrase. Nothing is sent anywhere, so it won’t show in the app or on another computer. Clearing this browser’s data deletes it.</p>
        <div class="sp-actions"><button class="button button--ghost" type="button" data-act="device">Keep it in this browser</button></div></section>`;
  }

  function unlockView() {
    const code = params().get("recover") === "1";
    return `<form class="sp-card sp-card--gold" data-form="unlock"><h2>Open your Cycle &amp; Moon</h2>
        <p class="sp-muted">Your notes are encrypted. Enter your Cycle &amp; Moon passphrase to open them here.</p>
        ${code ? `<div class="sp-field"><label for="cm-code">Recovery key (eight groups of four)</label><input id="cm-code" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" /></div>` : passField("pass", "Passphrase")}
        <label class="cm-check"><input type="checkbox" name="remember" /> <span>Remember it on this device</span></label>
        ${progress("Opening…")}
        <div class="sp-actions"><button class="button button--primary" type="submit">Open</button>
        <a class="rt-text-link" href="${esc(code ? href("") : href("", { recover: "1" }))}">${code ? "Use my passphrase" : "I forgot it: use my recovery key"}</a></div>
        <p class="sp-caption">Without the passphrase or the recovery key, nobody can open these notes, including the people who run Salt &amp; Sovereignty. You can delete them and start again in <a class="rt-text-link" href="${esc(href("settings"))}">Settings</a>.</p></form>`;
  }

  function recoveryHtml() {
    if (!recovery) return "";
    return `<section class="sp-card sp-card--gold" data-recovery><p class="sp-eyebrow sp-gold">Your recovery key</p><p class="cm-recovery">${esc(recovery)}</p>
      <p>Write this down and keep it somewhere safe. With it you can open your notes if you forget your passphrase. It won’t be shown again.</p>
      <p class="sp-caption">If both the passphrase and this key are lost, nobody can open your Cycle &amp; Moon notes again, including the people who run Salt &amp; Sovereignty.</p>
      <div class="sp-actions"><button class="button button--ghost" type="button" data-act="copy-recovery">Copy the recovery key</button><button class="button button--primary" type="button" data-act="kept-recovery">I’ve kept it safe</button></div></section>`;
  }

  function homeView() {
    const M = C().model;
    const T = C().content;
    const data = S.state.data;
    const now = new Date();
    const today = M.dayKey(now);
    const v = M.todayView(data, now);
    const info = T.SEASON_INFO[v.season];
    const reading = C().readings.exactReading(data, now);
    const past = C().history.historyReading(data);
    const insights = C().symptoms.symptomInsights(data);
    const flags = C().symptoms.redFlags(data, now);
    const summary = M.patternSummary(data);
    const patterns = M.notePatterns(data);
    const moons = M.bleedMoons(data);
    const s = data.settings;
    const a = T.ARCHETYPES[v.season];
    return `<p class="sp-caption" data-sync>${esc(SYNC_LINE[S.state.sync] || "")}</p>
      ${S.state.error ? `<p class="sp-notice">${esc(S.state.error)}</p>` : ""}
      ${S.state.guestCopy ? `<section class="sp-card"><p>You kept Cycle &amp; Moon notes in this browser before signing in. Bring them into your account’s notes?</p><div class="sp-actions"><button class="button button--ghost" type="button" data-act="guest">Bring them in</button></div></section>` : ""}
      <section class="sp-card sp-card--gold" data-today>
        <p class="sp-eyebrow sp-gold">Today</p><h2>${esc(v.line)}</h2>
        ${v.bleeding ? "<p>In moon time. Rest counts as practice.</p>" : ""}
        ${v.estimate ? `<p>${esc(v.estimate.line)}</p>` : ""}
        ${s.mode === "cycle" && !data.bleeds.length ? `<p class="sp-muted">Add your past periods, or log when your next bleed begins, and the days will count from there. Until then, the moon gives the season.</p>` : ""}
        ${s.archetypes ? `<p class="sp-muted">${esc(`${a.name} (${a.plain}): ${a.line}`)}</p>` : ""}
        <div class="sp-actions"><a class="button button--primary" href="${esc(href("log", { date: today }))}">Log today</a>${s.mode === "cycle" && data.bleeds.length < 3 ? `<a class="button button--ghost" href="${esc(href("past"))}">Add past periods</a>` : ""}</div>
      </section>
      ${readingHtml(reading, today)}
      ${v.bleeding && s.altar ? `<section class="sp-card"><h3>Your moon-time altar</h3><p>A moon bowl of water, red candles and a red cord, moonstone and red jasper, mugwort and rose. Set it out while you bleed, put it away when you’re done.</p><div class="sp-actions"><a class="button button--ghost" href="/altar/?moontime=1">Set out the moon-time altar</a></div></section>` : ""}
      <section class="sp-card"><p class="sp-eyebrow sp-gold">${esc(M.seasonTitle(v.season))}</p><p>${esc(info.feel)}</p><p>${esc(info.practice)}</p></section>
      ${s.mode === "cycle" ? `<section class="sp-card" data-whatami><p class="sp-eyebrow sp-gold">What am I?</p><h3>${esc(past.type ? past.type.headline : "Add your past periods to find out")}</h3>${past.average != null ? `<p>${esc(past.lines[0])}</p>` : ""}<p><a class="rt-text-link" href="${esc(href("history"))}">Your history, read</a></p></section>` : ""}
      <section class="sp-card" data-insights-card><p class="sp-eyebrow sp-gold">Symptoms and insights</p>${flags.length ? `<p>${esc(flags[0])}</p>` : ""}${insights.slice(0, 3).map((i) => `<p>${esc(i.text)}</p>`).join("")}
        ${!insights.length && !flags.length ? `<p class="sp-muted">Log symptoms on the days you have them, and patterns, comfort and folk remedies for them will show here.</p>` : ""}<p><a class="rt-text-link" href="${esc(href("insights"))}">Symptoms, patterns and comfort</a></p></section>
      <section class="sp-section" aria-labelledby="cm-wheel"><h2 class="sp-label" id="cm-wheel">The moon wheel</h2>${wheelSvg(M.wheelModel(data, now))}
        ${summary ? `<p>${esc(summary)}</p>` : ""}<p class="sp-caption">${esc(T.FRAMEWORK_NOTE)}</p></section>
      ${patterns.length ? `<section class="sp-card"><p class="sp-eyebrow sp-gold">Over time</p>${patterns.map((l) => `<p>${esc(l)}</p>`).join("")}</section>` : ""}
      ${
        moons.length
          ? `<section class="sp-section" aria-labelledby="cm-bleeds"><h2 class="sp-label" id="cm-bleeds">Your bleeds and the moon</h2><nav class="sp-list" aria-label="Your bleeds">${moons
              .slice(0, 12)
              .map((m) => row(href("log", { date: m.bleed.start }), dateLabel(m.bleed.start, { day: "numeric", month: "long", year: "numeric" }), `${m.phase} · ${M.PATTERN_NAMES[m.pattern]} · ${m.bleed.end ? `${M.bleedDays(m.bleed)} days` : "end not marked"}`))
              .join("")}</nav>
            ${s.grimoire && S.state.userId ? `<div class="sp-actions"><a class="button button--ghost" href="${esc(href("keep", { bleed: moons[0].bleed.id }))}">Keep a reflection in my Grimoire</a></div>` : ""}</section>`
          : ""
      }
      <nav class="sp-list" aria-label="Cycle & Moon">
        ${row(href("log", { date: today }), "Log a day", "A bleed, its flow, symptoms and how the day feels")}
        ${s.mode === "cycle" ? row(href("past"), "Past periods", "Add many at once, paste a list, or change one") + row(href("history"), "What am I?", "Your average cycle, its rhythm and your moon pattern") : ""}
        ${row(href("insights"), "Symptoms and insights", "Patterns over your cycles and the moon, and comfort for each")}
        ${row(href("learn"), "Inner seasons and moon patterns", "What suits each season, prompts, and the four moon patterns")}
        ${row(href("share"), "Share with my covens", "Only “in moon time” or “resting”, if you choose")}
        ${row(href("settings"), "Settings and privacy", "Cycle length, moon only, reminders, passphrase, delete")}
      </nav>`;
  }

  function row(to, title, detail) {
    return `<a class="sp-row" href="${esc(to)}"><span class="sp-row__text"><span class="sp-row__title">${esc(title)}</span>${detail ? `<span class="sp-row__detail">${esc(detail)}</span>` : ""}</span><span class="sp-row__chevron" aria-hidden="true">›</span></a>`;
  }
  const chip = (label, attrs, pressed) => `<button type="button" class="sp-chip" aria-pressed="${pressed ? "true" : "false"}" ${attrs}>${esc(label)}</button>`;

  function logView() {
    const M = C().model;
    const data = S.state.data;
    const today = M.dayKey(new Date());
    const asked = params().get("date");
    const date = M.isDayKey(asked) && M.daysBetween(asked, today) >= 0 ? asked : today;
    const bleed = M.bleedOn(data, date);
    const note = M.noteOn(data, date) || M.emptyNote(date);
    const season = M.seasonOn(data, date).season;
    const quarter = M.moonQuarterOn(date);
    const flows = [["none", "Not noted"], ["spotting", "Spotting"], ["light", "Light"], ["medium", "Medium"], ["heavy", "Heavy"]];
    const rating = (name, value) =>
      `<div class="sp-chips" role="group" aria-label="${esc(name)}">${[0, 1, 2, 3, 4, 5].map((n) => chip(n === 0 ? "–" : n === 1 ? "1 low" : n === 5 ? "5 high" : String(n), `data-rate="${name}" data-value="${n}"`, (value || 0) === n)).join("")}</div>`;
    return `${back()}${head(date === today ? "Today" : dateLabel(date), `${M.SEASON_NAMES[season]} · ${M.QUARTER_NAMES[quarter]}`)}
      <div class="cm-days"><a class="rt-text-link" href="${esc(href("log", { date: M.addDays(date, -1) }))}">‹ Day before</a>${date !== today ? `<a class="rt-text-link" href="${esc(href("log", { date: M.addDays(date, 1) }))}">Day after ›</a>` : ""}</div>
      ${
        data.settings.mode === "cycle"
          ? `<section class="sp-card" data-bleed><h2 class="sp-label">Bleeding</h2>${
              bleed
                ? `<p>${bleed.start === date ? "Your bleed began this day." : `Your bleed began ${esc(dateLabel(bleed.start, { day: "numeric", month: "long" }))}.`}</p>
              <p class="sp-caption">Flow this day</p><div class="sp-chips" role="group" aria-label="Flow">${flows.map(([v, l]) => chip(l, `data-flow="${v}"`, (bleed.flow[date] || "none") === v)).join("")}</div>
              <div class="sp-actions">${bleed.end === date ? `<p class="sp-muted">Marked as the last day.</p>` : `<button class="button button--ghost" type="button" data-act="end">My bleed ended this day</button>`}
              <button class="button button--ghost" type="button" data-act="remove-bleed">Remove this bleed</button></div>`
                : `<p class="sp-muted">Not bleeding this day, by what’s logged.</p><div class="sp-actions"><button class="button button--primary" type="button" data-act="start">My bleed began this day</button></div>`
            }</section>`
          : ""
      }
      <form class="sp-card" data-form="note" data-date="${esc(date)}"><h2 class="sp-label">Symptoms</h2>
        <p class="sp-muted">Tap once for mild, twice for moderate, three times for strong, and once more to clear. Kept as you tap.</p>
        ${symptomChips(note)}
        <h2 class="sp-label">How the day feels</h2>
        <p class="sp-caption">Energy</p>${rating("energy", note.energy)}
        <p class="sp-caption">Intuition</p>${rating("intuition", note.intuition)}
        <div class="sp-field"><label for="cm-mood">Mood</label><input id="cm-mood" name="mood" value="${esc(note.mood)}" placeholder="A word or two" /></div>
        <div class="sp-field"><label for="cm-body">Body</label><textarea id="cm-body" name="body" placeholder="Cramps, tender, rested, restless…">${esc(note.body)}</textarea></div>
        <div class="sp-field"><label for="cm-dreams">Dreams</label><textarea id="cm-dreams" name="dreams" placeholder="What you remember">${esc(note.dreams)}</textarea></div>
        <div class="sp-field"><label for="cm-text">Anything else</label><textarea id="cm-text" name="text" placeholder="${esc(C().content.SEASON_INFO[season].prompts[0])}">${esc(note.text)}</textarea></div>
        <input type="hidden" name="energy" value="${note.energy || 0}" /><input type="hidden" name="intuition" value="${note.intuition || 0}" />
        <div class="sp-actions"><button class="button button--primary" type="submit">Keep these notes</button></div>
      </form>`;
  }

  function symptomChips(note) {
    const Y = C().symptoms;
    const label = (name, level) => (level ? `${name} · ${Y.INTENSITY_NAMES[level]}` : name);
    const groups = [["body", "Body"], ["mood", "Mood"], ["other", "Desire and other"]];
    const own = [...new Set([...Object.keys(note.custom || {}), ...Y.customNames(S.state.data)])];
    return `${groups
      .map(([g, l]) => `<p class="sp-caption">${esc(l)}</p><div class="sp-chips" role="group" aria-label="${esc(l)}">${Y.SYMPTOMS.filter((x) => x.group === g).map((x) => chip(label(x.label, note.symptoms[x.id]), `data-symptom="${esc(x.id)}"`, !!note.symptoms[x.id])).join("")}</div>`)
      .join("")}
      <p class="sp-caption">Your own</p>${own.length ? `<div class="sp-chips">${own.map((n) => chip(label(n, note.custom[n]), `data-custom="${esc(n)}"`, !!note.custom[n])).join("")}</div>` : ""}
      <div class="sp-field"><label for="cm-own">Add a symptom of your own</label><input id="cm-own" name="own" maxlength="60" placeholder="Jaw ache, itchy eyes…" /></div>
      <div class="sp-actions"><button class="button button--ghost" type="button" data-act="add-own">Add it</button><a class="rt-text-link" href="${esc(href("insights"))}">Symptoms and insights ›</a></div>`;
  }

  // ── Past periods ──
  const pastState = { y: new Date().getFullYear(), m: new Date().getMonth(), picked: [], length: 5, order: null, read: null, text: "", result: null, editing: null, problem: null };
  function pastView() {
    const M = C().model;
    const P = C().past;
    const data = S.state.data;
    const today = M.dayKey(new Date());
    const st = pastState;
    if (!st.order) st.order = P.dateOrderFor(global.navigator.language);
    const weeks = P.calendarMonth(data, st.y, st.m, st.picked, today);
    const kept = M.sortedBleeds(data).reverse();
    const lengths = [[0, "Not sure"], ...[3, 4, 5, 6, 7, 8].map((n) => [n, `${n} days`])];
    const title = `${P.MONTH_TITLES[st.m]} ${st.y}`;
    const grid = `<div class="cm-cal">
        <div class="cm-cal__bar"><button type="button" class="cm-cal__nav" data-month="-1">‹ Earlier</button><h3 aria-live="polite">${esc(title)}</h3><button type="button" class="cm-cal__nav" data-month="1">Later ›</button></div>
        <div class="cm-cal__week" aria-hidden="true">${P.WEEKDAY_LETTERS.map((d) => `<span class="cm-cal__head">${d}</span>`).join("")}</div>
        ${weeks
          .map(
            (w) =>
              `<div class="cm-cal__week">${w
                .map(
                  (d) =>
                    `<button type="button" class="cm-day${d.inMonth ? "" : " is-outside"}${d.bleeding ? " is-bleeding" : ""}${d.picked ? " is-picked" : ""}" data-pick="${d.key}" aria-pressed="${d.picked}" aria-label="${esc(`${longDate(d.key)}${d.start ? ", a logged bleed began" : d.bleeding ? ", a logged bleed" : ""}`)}" ${d.future || d.bleeding ? "disabled" : ""}>${d.day}</button>`
                )
                .join("")}</div>`
          )
          .join("")}</div>`;
    const result = st.result ? `<p class="sp-notice" data-past-result>${esc(st.result.added ? `${st.result.added} ${st.result.added === 1 ? "period" : "periods"} added, encrypted.` : "Nothing was added.")}${st.result.problems.map((p) => `<br />${esc(p)}`).join("")}</p>` : "";
    const editing = (b) =>
      st.editing === b.id
        ? `<form class="sp-card cm-stack" data-form="edit-bleed" data-id="${esc(b.id)}">
          <div class="sp-field"><label for="cm-es">Began</label><input id="cm-es" name="start" type="date" value="${esc(b.start)}" max="${today}" required /></div>
          <div class="sp-field"><label for="cm-ee">Ended (leave empty if not known)</label><input id="cm-ee" name="end" type="date" value="${esc(b.end || "")}" max="${today}" /></div>
          ${st.problem ? `<p class="sp-notice">${esc(st.problem)}</p>` : ""}
          <div class="sp-actions"><button class="button button--primary" type="submit">Keep the change</button><button class="button button--ghost" type="button" data-act="remove-past" data-id="${esc(b.id)}">Remove this period</button></div></form>`
        : "";
    return `${back()}${head("Past periods", "Cycle & Moon")}
      <p class="sp-muted">Add the periods you remember, so Cycle &amp; Moon knows your history: your average cycle, where in the moon’s month your bleeds tend to begin, and today’s place in your cycle. Rough dates are fine.</p>
      ${result}
      <h2 class="sp-label">Pick them on the calendar</h2>
      <section class="sp-card" data-past-calendar><p class="sp-muted">Tap the day each period began. Days already logged are shaded.</p>${grid}
        ${
          st.picked.length
            ? `<p class="sp-caption">Picked (tap one to unpick it)</p><div class="sp-chips">${st.picked.map((k) => chip(`${longDate(k)} ×`, `data-unpick="${k}"`, false)).join("")}</div>
          <p class="sp-caption">Each lasted about</p><div class="sp-chips" role="group" aria-label="Each lasted about">${lengths.map(([n, l]) => chip(l, `data-plength="${n}"`, st.length === n)).join("")}</div>
          <div class="sp-actions"><button class="button button--primary" type="button" data-act="add-picked">Add ${st.picked.length} ${st.picked.length === 1 ? "period" : "periods"}</button></div>`
            : ""
        }</section>
      <h2 class="sp-label">Or paste a list of dates</h2>
      <form class="sp-card" data-form="paste"><p class="sp-muted">One period a line, from notes or another app. A start date, a start and an end (“4 May 2026 to 8 May 2026”), or a start and how long (“2026-06-01, 5 days”).</p>
        <div class="sp-field"><label for="cm-paste">Dates</label><textarea id="cm-paste" name="text" placeholder="2026-09-29&#10;1 September 2026 to 5 September 2026&#10;04/08/2026, 5 days">${esc(st.text)}</textarea></div>
        <p class="sp-caption">Dates written with slashes</p><div class="sp-chips" role="group" aria-label="Dates written with slashes">${chip("Day first (29/06)", 'data-order="dmy"', st.order === "dmy")}${chip("Month first (06/29)", 'data-order="mdy"', st.order === "mdy")}</div>
        ${
          st.read
            ? `<p class="sp-caption">${st.read.entries.length ? `Read ${st.read.entries.length}:` : "No dates could be read."}</p><ul class="cm-ideas">${st.read.entries.map((e) => `<li>${esc(`${longDate(e.start)}${e.end ? ` to ${longDate(e.end)}` : ""}`)}</li>`).join("")}</ul>
          ${st.read.unread.length ? `<p class="sp-muted">Couldn’t read: ${esc(st.read.unread.join("; "))}</p>` : ""}
          <div class="sp-actions">${st.read.entries.length ? `<button class="button button--primary" type="button" data-act="add-read">Add ${st.read.entries.length} ${st.read.entries.length === 1 ? "period" : "periods"}</button>` : ""}<button class="button button--ghost" type="submit">Read them again</button></div>`
            : `<div class="sp-actions"><button class="button button--ghost" type="submit">Read these dates</button></div>`
        }</form>
      <h2 class="sp-label">Logged (${kept.length})</h2>
      ${kept.length ? `<div class="sp-list">${kept.map((b) => `<button type="button" class="sp-row cm-row-button" data-edit-bleed="${esc(b.id)}" aria-expanded="${st.editing === b.id}"><span class="sp-row__text"><span class="sp-row__title">${esc(longDate(b.start))}</span><span class="sp-row__detail">${esc(b.end ? `To ${M.dayMonth(b.end)} · ${M.bleedDays(b)} days` : "End not marked")}</span></span><span class="sp-row__chevron" aria-hidden="true">›</span></button>${editing(b)}`).join("")}</div>` : `<p class="sp-muted">None yet.</p>`}
      <div class="sp-actions"><a class="button button--ghost" href="${esc(href("history"))}">See what your history says</a></div>`;
  }
  function addPast(entries) {
    let outcome = { added: 0, problems: [] };
    change((d) => {
      const r = C().past.addPastBleeds(d, entries, C().newId, new Date());
      outcome = { added: r.added, problems: r.problems.map((p) => p.message) };
      return r.data;
    });
    pastState.result = outcome;
    return outcome;
  }

  function historyView() {
    const M = C().model;
    const T = C().content;
    const H = C().history;
    const data = S.state.data;
    const r = H.historyReading(data);
    const used = M.cycleLength(data);
    return `${back()}${head("What am I?", "Cycle & Moon · your history")}
      <section class="sp-card sp-card--gold" data-history><p class="sp-eyebrow sp-gold">Your moon pattern</p>
        ${r.type ? `<h2>${esc(r.type.headline)}</h2><p>${esc(r.type.explain)}</p>${r.shift ? `<p>${esc(r.shift)}</p>` : ""}` : `<p>Add your past periods and this will show which moon pattern your bleeds lean to.</p>`}
        <div class="sp-actions"><a class="button button--ghost" href="${esc(href("past"))}">Add past periods</a></div></section>
      <section class="sp-card"><p class="sp-eyebrow sp-gold">Your rhythm</p>${r.lines.map((l) => `<p>${esc(l)}</p>`).join("")}
        ${r.spread != null ? `<p class="sp-muted">${esc(`It moves by about ${r.spread} ${r.spread === 1 ? "day" : "days"} either side of the average (the standard deviation).`)}</p>` : ""}
        <p class="sp-muted">${esc(`Cycle length used for your days and estimates: ${M.lengthLabel(used)}.`)} Change it in <a class="rt-text-link" href="${esc(href("settings"))}">Settings</a>.</p></section>
      ${
        r.moons.length
          ? `<h2 class="sp-label">Each bleed and the moon</h2><nav class="sp-list" aria-label="Each bleed and the moon">${r.moons
              .slice(0, 12)
              .map((m) => row(href("log", { date: m.bleed.start }), longDate(m.bleed.start), `${m.phase} · lunar day ${m.lunarDay} · ${M.PATTERN_NAMES[m.pattern]}`))
              .join("")}</nav>`
          : ""
      }
      <h2 class="sp-label">The four patterns</h2>
      ${["white", "pink", "red", "purple"].map((p) => `<section class="sp-card"><h3>${esc(T.PATTERN_INFO[p].name)}</h3><p class="sp-caption sp-gold">${esc(T.PATTERN_INFO[p].when)}</p><p>${esc(T.PATTERN_INFO[p].line)}</p></section>`).join("")}
      <p class="sp-muted">${esc(H.HISTORY_NOTE)}</p><p class="sp-muted">${esc(T.PATTERN_NOTE)}</p>`;
  }

  function insightsView() {
    const M = C().model;
    const Y = C().symptoms;
    const data = S.state.data;
    const now = new Date();
    const today = M.dayKey(now);
    const season = M.todayView(data, now).season;
    const insights = Y.symptomInsights(data);
    const notes = M.notePatterns(data);
    const flags = Y.redFlags(data, now);
    const comfort = Y.comfortNow(data, today, season);
    const recent = data.notes.filter((n) => Y.symptomLine(n)).slice(-7).reverse();
    return `${back()}${head("Symptoms and insights", "Cycle & Moon")}
      <div class="sp-actions"><a class="button button--primary" href="${esc(href("log", { date: today }))}">Log today’s symptoms</a></div>
      ${flags.length ? `<section class="sp-card sp-card--gold" data-flags><p class="sp-eyebrow sp-gold">Worth a word with a doctor</p>${flags.map((f) => `<p>${esc(f)}</p>`).join("")}</section>` : ""}
      <h2 class="sp-label">What your notes show</h2>
      <section class="sp-card" data-insights>${insights.map((i) => `<p>${esc(i.text)}<br /><span class="sp-caption">From ${esc(i.basis)}.</span></p>`).join("")}${notes.map((l) => `<p>${esc(l)}</p>`).join("")}
        ${insights.length ? "" : `<p class="sp-muted">${esc(Y.insightProgress(data))}</p>`}<p class="sp-caption">${esc(Y.INSIGHT_NOTE)}</p></section>
      <h2 class="sp-label">Comfort, the old ways</h2>
      <p class="sp-muted">${esc(comfort.from === "recent" ? "For what you’ve logged in the last few days:" : comfort.from === "season" ? `For what your ${M.SEASON_NAMES[season]} usually brings:` : "Log a symptom and comfort for it will show here.")}</p>
      ${comfort.comforts.map(comfortHtml).join("")}
      <section class="sp-card"><p>${esc(Y.SEASON_COMFORT[season])}</p></section>
      <p class="sp-notice">${esc(Y.HERB_SAFETY)}</p>
      ${recent.length ? `<h2 class="sp-label">Recent days</h2><nav class="sp-list" aria-label="Recent days">${recent.map((n) => row(href("log", { date: n.date }), M.dayMonth(n.date), Y.symptomLine(n))).join("")}</nav>` : ""}
      <p class="sp-notice">${esc(Y.SYMPTOM_NOT_MEDICAL)}</p>`;
  }

  function learnView() {
    const M = C().model;
    const T = C().content;
    const arche = !!S.state.data?.settings.archetypes;
    return `${back()}${head("Inner seasons and moon patterns", "Cycle & Moon")}<p class="sp-muted">${esc(T.FRAMEWORK_NOTE)}</p>
      <h2 class="sp-label">The inner seasons</h2>
      ${M.SEASONS.map((s) => {
        const info = T.SEASON_INFO[s];
        return `<section class="sp-card"><h3>${esc(info.title)}</h3><p class="sp-caption sp-gold">${esc(info.when)}</p><p>${esc(info.feel)}</p><p>${esc(info.practice)}</p>
          ${arche ? `<p class="sp-muted">${esc(`${T.ARCHETYPES[s].name}, or ${T.ARCHETYPES[s].plain}: ${T.ARCHETYPES[s].line}`)}</p>` : ""}
          <details class="sp-details"><summary>Journaling prompts</summary><ul>${info.prompts.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></details>
          <details class="sp-details"><summary>Practice under each moon</summary>${["dark", "waxing", "full", "waning"].map((q) => suggestionHtml(T.suggestionFor(s, q), M.QUARTER_NAMES[q])).join("")}</details></section>`;
      }).join("")}
      ${arche ? `<p class="sp-notice">${esc(T.ARCHETYPE_NOTE)}</p>` : ""}
      <section class="sp-card"><h3>Following the moon alone</h3><p>${esc(T.MOON_ONLY_NOTE)}</p></section>
      <h2 class="sp-label">The four moon patterns</h2><p class="sp-muted">${esc(T.PATTERN_NOTE)}</p>
      ${["white", "pink", "red", "purple"].map((p) => `<section class="sp-card"><h3>${esc(T.PATTERN_INFO[p].name)}</h3><p class="sp-caption sp-gold">${esc(T.PATTERN_INFO[p].when)}</p><p>${esc(T.PATTERN_INFO[p].line)}</p></section>`).join("")}
      <h2 class="sp-label">Moon time and moon blood</h2>
      ${T.FOLK_NOTES.map((n) => `<section class="sp-card"><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p></section>`).join("")}`;
  }

  function settingsView() {
    const st = S.state;
    const s = st.data?.settings;
    const T = C().content;
    const toggle = (name, label, detail, on) =>
      `<label class="cm-check"><input type="checkbox" data-setting="${name}" ${on ? "checked" : ""} /> <span>${esc(label)}<br /><span class="sp-caption">${esc(detail)}</span></span></label>`;
    const situations = [["irregular", "My cycles are irregular"], ["hormonal", "Hormonal birth control"], ["pregnant", "Pregnant"], ["postpartum", "After a birth"], ["perimenopause", "Perimenopause"]];
    const choices =
      st.phase === "open" && s
        ? `<h2 class="sp-label">Follow</h2><section class="sp-card"><div class="sp-chips" role="group" aria-label="Follow">${chip("My cycle", 'data-mode="cycle"', s.mode === "cycle")}${chip("The moon alone", 'data-mode="moon"', s.mode === "moon")}</div><p class="sp-muted">${esc(T.MOON_ONLY_NOTE)}</p></section>
      ${s.mode === "cycle" ? lengthSettings(s) : ""}
      ${
        s.mode === "cycle"
          ? `<h2 class="sp-label">About my body</h2><section class="sp-card"><p class="sp-muted">Optional. It changes the wording and when an estimate would be honest: none while pregnant, and a range rather than a day when cycles vary.</p>
        <div class="sp-chips">${situations.map(([v, l]) => chip(l, `data-situation="${v}"`, s.situations.includes(v))).join("")}</div>
        ${s.situations.includes("hormonal") ? `<p class="sp-muted">With hormonal birth control, the bleed is usually a withdrawal bleed rather than a period, and the inner seasons are a lens rather than a description. Many people follow the moon alone instead.</p>` : ""}</section>`
          : ""
      }
      <h2 class="sp-label">What it shows</h2><section class="sp-card">
        ${toggle("today", "A small card on Today", "Today’s day, season and moon, one suggestion and Log today", s.today)}
        ${toggle("archetypes", "The archetype lens", "Maiden, Mother, Enchantress and Crone, with plainer names beside them", s.archetypes)}
        ${toggle("altar", "The moon-time altar", "While you bleed, offer a starter altar: a moon bowl, red candles and a red cord", s.altar)}
        ${toggle("grimoire", "Moon Time in my Grimoire", "Offer to keep a reflection you write in a Moon Time section. Grimoire pages aren’t encrypted, so only what you write there goes there.", s.grimoire)}
      </section>
      <h2 class="sp-label">Reminders</h2><section class="sp-card">
        ${toggle("reminders", "Remind me", s.mode === "cycle" ? "A few days before your bleed may start (only when there’s an honest estimate)" : "The evening before the new and the full moon", s.reminders.on)}
        ${
          s.reminders.on
            ? `${s.mode === "cycle" ? `<p class="sp-caption">How many days ahead</p><div class="sp-chips">${C().model.REMINDER_AHEAD_CHOICES.map((n) => chip(`${n} ${n === 1 ? "day" : "days"}`, `data-ahead="${n}"`, s.reminders.ahead === n)).join("")}</div>` : ""}
          ${toggle("full", "Say what it’s about", s.reminders.full ? "Shows, for example, “Your bleed may start in about 3 days.” Anyone who sees your screen could read it." : "Off: every reminder just says “Cycle & Moon has a note for you.”", s.reminders.full)}`
            : ""
        }
        <p class="sp-muted">Reminders ring on your phone, in the app, wherever Cycle &amp; Moon is open. A browser can’t ring at a set time, and they’re never added to the website’s calendar file, to keep them private.</p>
      </section>`
        : `<p class="sp-notice">${st.phase === "locked" ? "Open Cycle & Moon to change its settings. You can still delete everything below." : "Begin Cycle & Moon to choose its settings."}</p>`;
    const privacy = `<h2 class="sp-label">Privacy and sync</h2><section class="sp-card">
        <p>${st.synced ? "Kept with your account, encrypted in this browser first with a key only your passphrase or recovery key can open. The server holds only scrambled text." : "Kept in this browser only, encrypted. Nothing is sent."}</p>
        ${st.phase === "open" && st.synced ? `<label class="cm-check"><input type="checkbox" data-act="remember" ${st.remember ? "checked" : ""} /> <span>Remember it on this device<br /><span class="sp-caption">Off: the key is kept only until you close this tab. Leave it off on a shared computer.</span></span></label>` : ""}
        ${recoveryHtml()}
        ${
          st.phase === "open"
            ? `<form data-form="${st.synced ? "change" : "protect"}" class="cm-stack" ${!st.synced && !st.userId ? "hidden" : ""}>
          <h3>${st.synced ? "Change my passphrase" : "Keep it with my account"}</h3>
          ${passField("pass", "New passphrase")}${passField("again", "The same again")}
          ${st.synced ? `<label class="cm-check"><input type="checkbox" name="newRecovery" /> <span>Make a new recovery key too<br /><span class="sp-caption">The old one stops working</span></span></label>` : `<label class="cm-check"><input type="checkbox" name="remember" /> <span>Remember it on this device</span></label>`}
          ${progress("Making your key. This takes a moment on purpose.")}
          <div class="sp-actions"><button class="button button--ghost" type="submit">${st.synced ? "Change it" : "Protect and keep with my account"}</button></div></form>
          ${st.synced ? `<div class="sp-actions"><button class="button button--ghost" type="button" data-act="lock">Close it in this browser now</button><button class="button button--ghost" type="button" data-act="device-only">Keep it in this browser only</button></div>` : ""}`
            : ""
        }
        <p class="sp-caption">If both your passphrase and recovery key are lost, nobody can open your notes again, including the people who run Salt &amp; Sovereignty. You can always delete them and start again.</p></section>`;
    return `${back()}${head("Settings and privacy", "Cycle & Moon")}${choices}${privacy}
      <h2 class="sp-label">Delete</h2><section class="sp-card"><p>Delete every Cycle &amp; Moon note, setting and shared status, from this browser and from your account. This can’t be undone.</p>
        <div class="sp-actions"><button class="button button--ghost" type="button" data-act="delete-all">Delete all my Cycle &amp; Moon data</button></div></section>`;
  }

  function lengthSettings(s) {
    const M = C().model;
    const L = s.length;
    const used = M.cycleLength(S.state.data);
    const lim = M.LENGTH_LIMITS;
    const stepper = (name, label, value, min, max) =>
      `<div class="cm-stepper"><span>${esc(label)}</span><button type="button" class="cm-step" data-len="${name}" data-delta="-1" aria-label="${esc(label)}: fewer" ${value <= min ? "disabled" : ""}>−</button><output aria-live="polite" aria-label="${esc(label)}">${value}</output><button type="button" class="cm-step" data-len="${name}" data-delta="1" aria-label="${esc(label)}: more" ${value >= max ? "disabled" : ""}>+</button></div>`;
    const auto = M.cycleStats(S.state.data).lengths.length >= 2 ? `From your history: ${M.lengthLabel(used)}.` : "With fewer than two cycles logged, 28 days is used until there’s more. Add past periods to give it a history.";
    return `<h2 class="sp-label">Cycle length</h2><section class="sp-card" data-length>
      <div class="sp-chips" role="group" aria-label="Cycle length">${chip("Work it out from my history", 'data-length-mode="auto"', L.mode === "auto")}${chip("Exactly", 'data-length-mode="exact"', L.mode === "exact")}${chip("A range", 'data-length-mode="range"', L.mode === "range")}</div>
      ${L.mode === "exact" ? stepper("exact", "Days", L.exact, lim.min, lim.max) : ""}
      ${L.mode === "range" ? stepper("min", "Shortest", L.min, lim.min, L.max) + stepper("max", "Longest", L.max, L.min, lim.max) : ""}
      <p class="sp-muted">${esc(L.mode === "auto" ? auto : `Using ${M.lengthLabel(used)}.`)} It sets today’s cycle day and inner season, when your next bleed may come (a window with a range), and where the seasons fall: the luteal side (inner autumn) is taken as about 14 days, so a longer or shorter cycle mostly changes your spring. All estimates; bodies vary.</p></section>`;
  }

  let shareState = null;
  function shareView() {
    if (!S.state.userId) return `${back()}${head("Share with my covens", "Cycle & Moon")}<section class="sp-card"><p>Sharing that you’re in moon time is for covens, so it needs an account.</p><div class="sp-actions"><a class="button button--ghost" href="${SIGN_IN}">Sign in</a></div></section>`;
    const intro = `${back()}${head("Share with my covens", "Cycle & Moon")}<p>Only if you want to: let chosen covens or people see a few words by your name, like “In moon time · resting”. Never dates, notes or anything from your Cycle &amp; Moon notes, and it clears itself after the days you choose.</p>`;
    if (!shareState) return `${intro}<p class="sp-muted">Gathering your covens…</p>`;
    const { current, choices, form } = shareState;
    if (current === "unavailable") return `${intro}<p class="sp-notice">Sharing isn’t ready on the server yet. Try again after the next update.</p>`;
    const St = C().status;
    return `${intro}
      ${current ? `<section class="sp-card sp-card--gold" data-shared><p class="sp-eyebrow sp-gold">Shared now</p><h3>☾ ${esc(St.statusLabel(current.status))}</h3><p class="sp-muted">Until ${esc(new Date(current.expiresAt).toLocaleString(undefined, { weekday: "long", hour: "numeric", minute: "2-digit" }))}</p><div class="sp-actions"><button class="button button--ghost" type="button" data-act="stop-sharing">Stop sharing now</button></div></section>` : ""}
      <h2 class="sp-label">What it says</h2><div class="sp-chips">${St.STATUS_OPTIONS.map((o) => chip(o.label, `data-status="${o.value}"`, form.status === o.value)).join("")}</div>
      <h2 class="sp-label">For how long</h2><div class="sp-chips">${St.STATUS_DAYS.map((n) => chip(`${n} ${n === 1 ? "day" : "days"}`, `data-days="${n}"`, form.days === n)).join("")}</div>
      <h2 class="sp-label">Who sees it</h2>
      ${
        choices.covens.length
          ? `<section class="sp-card"><p class="sp-caption">Everyone in these covens</p><div class="sp-chips">${choices.covens.map((c) => chip(c.name, `data-coven="${esc(c.id)}"`, form.covens.includes(c.id))).join("")}</div>
        ${choices.people.length ? `<details class="sp-details" ${form.people.length ? "open" : ""}><summary>Or only certain people</summary><div class="sp-chips">${choices.people.map((p) => chip(p.name, `data-person="${esc(p.id)}"`, form.people.includes(p.id))).join("")}</div></details>` : ""}</section>`
          : `<p class="sp-muted">You’re not in a coven yet.</p>`
      }
      <div class="sp-actions"><button class="button button--primary" type="button" data-act="share" ${!form.covens.length && !form.people.length ? "disabled" : ""}>${current ? "Update what I share" : "Share it"}</button></div>`;
  }
  async function loadShare() {
    try {
      const [current, choices] = await Promise.all([S.loadStatus(), S.shareChoices()]);
      const cur = current && current !== "unavailable" ? current : null;
      shareState = { current, choices, form: { status: cur?.status || "moon_time_resting", days: 3, covens: cur?.covens || [], people: cur?.people || [] } };
    } catch (error) {
      flash = error.message;
      shareState = { current: null, choices: { covens: [], people: [] }, form: { status: "moon_time_resting", days: 3, covens: [], people: [] } };
    }
    render();
  }

  let grimoireKept = null;
  function keepView() {
    const ref = `cycle-moon:${params().get("bleed") || ""}`;
    const on = !!S.state.data?.settings.grimoire;
    return `${back()}${head("Keep a reflection in my Grimoire", "Cycle & Moon")}
      <section class="sp-card"><p>Your Grimoire is kept with your account but isn’t encrypted. Only the words you write below go there, under Moon Time; your Cycle &amp; Moon notes stay encrypted.</p></section>
      ${!on ? `<p class="sp-notice">Turn on Moon Time in my Grimoire in Cycle &amp; Moon’s <a class="rt-text-link" href="${esc(href("settings"))}">settings</a> first.</p>` : ""}
      ${
        grimoireKept
          ? `<section class="sp-card"><p>Kept in your Grimoire as “${esc(grimoireKept.title)}”.</p><div class="sp-actions"><a class="button button--ghost" href="/grimoire/">Open my Grimoire</a></div></section>`
          : `<form class="sp-card" data-form="keep" data-ref="${esc(ref)}"><div class="sp-field"><label for="cm-title">Page title</label><input id="cm-title" name="title" value="Moon time" /></div>
        <div class="sp-field"><label for="cm-keep">What you’d like to keep</label><textarea id="cm-keep" name="text" placeholder="What this cycle taught you, a dream, a working…"></textarea></div>
        <div class="sp-actions"><button class="button button--primary" type="submit" ${on ? "" : "disabled"}>Keep it in my Grimoire</button></div></form>`
      }`;
  }
  async function keepInGrimoire(form) {
    const db = global.db;
    const u = S.state.userId;
    if (!db || !u) throw new Error("Sign in to keep it in your Grimoire.");
    const title = form.title.value.trim();
    const text = form.text.value.trim();
    if (!title || !text) throw new Error("Write something to keep first.");
    const ref = form.dataset.ref;
    const [books, sections, pages] = await Promise.all([
      db.from("grimoire_books").select("id,title,created_at,updated_at").order("created_at"),
      db.from("grimoire_sections").select("id,book_id,title,sort_order,created_at"),
      db.from("grimoire_pages").select("id,book_id,section_id,title,page_type,sort_order,metadata,created_at,updated_at"),
    ]);
    if (books.error || sections.error || pages.error) throw new Error("Your Grimoire couldn’t be opened just now.");
    const existing = (pages.data || []).find((p) => p.metadata?.holyRef === ref);
    if (existing) return existing;
    const snapshot = { fetchedAt: new Date().toISOString(), books: books.data || [], sections: sections.data || [], pages: pages.data || [], blocks: [], links: [] };
    const { ops } = C().holyOps.holyPageOps(snapshot, { userId: u, now: new Date().toISOString() }, { ref, title, sectionTitle: "Moon Time", blocks: [{ type: "text", content: text }] }, C().newId);
    for (const op of ops) {
      if (op.kind !== "insert") continue;
      const { error } = await db.from(op.table).insert(op.row);
      if (error && error.code !== "23505") throw new Error("It couldn’t be kept in your Grimoire just now.");
    }
    return { title };
  }

  // ── Drawing ──
  function render() {
    const st = S.state;
    const v = view();
    let body;
    if (st.phase === "loading") body = `<p class="sp-muted">Opening…</p>`;
    else if (v === "learn") body = learnView();
    else if (v === "settings") body = settingsView();
    else if (v === "share") body = shareView();
    else if (st.phase === "new") body = `${back("Rituals", "/rituals/")}${head("Cycle & Moon")}${beginView()}`;
    else if (st.phase === "locked") body = `${back("Rituals", "/rituals/")}${head("Cycle & Moon")}${unlockView()}`;
    else if (v === "log") body = logView();
    else if (v === "past") body = pastView();
    else if (v === "history") body = historyView();
    else if (v === "insights") body = insightsView();
    else if (v === "keep") body = keepView();
    else body = `${back("Rituals", "/rituals/")}${head("Cycle & Moon", C().model.QUARTER_NAMES[C().model.moonQuarterOn(C().model.dayKey(new Date()))])}${v === "" ? recoveryHtml() : ""}${homeView()}`;
    root().innerHTML = `${status()}${body}${notMedical()}`;
    global.document.title = `${v === "log" ? "Log a day" : v === "past" ? "Past periods" : v === "history" ? "What am I?" : v === "insights" ? "Symptoms and insights" : v === "learn" ? "Inner seasons and moon patterns" : v === "settings" ? "Cycle & Moon settings" : v === "share" ? "Share with my covens" : "Cycle & Moon"} | Salt & Sovereignty`;
  }

  async function attempt(work) {
    if (busy) return;
    busy = true;
    try {
      await work();
    } catch (error) {
      say(error?.message || "Something went wrong. Please try again.");
      busy = false;
      return;
    }
    busy = false;
  }

  function change(fn) {
    S.update(fn);
  }
  const setSettings = (patch) => change((d) => C().model.changeSettings(d, patch, new Date()));

  function onClick(event) {
    const t = event.target.closest("button, input[type=checkbox]");
    if (!t || !root().contains(t)) return;
    if (t.dataset.editBleed) {
      pastState.editing = pastState.editing === t.dataset.editBleed ? null : t.dataset.editBleed;
      pastState.problem = null;
      return render();
    }
    const M = C().model;
    const data = S.state.data;
    const now = new Date();
    const d = t.dataset;
    const logDate = root().querySelector("[data-form=note]")?.dataset.date;
    if (d.act === "device") return attempt(() => S.startOnDevice());
    if (d.act === "copy-recovery") return global.navigator.clipboard?.writeText(recovery).then(() => say("Copied."), () => say("Couldn’t copy it: write it down from the screen."));
    if (d.act === "kept-recovery") {
      recovery = null;
      flash = "";
      return render();
    }
    if (d.act === "guest") return attempt(async () => say(`${await S.bringInGuest()} entries brought in.`));
    if (d.act === "start") return change((x) => M.startBleed(x, logDate, C().newId, now));
    if (d.act === "end") return change((x) => M.endBleed(x, logDate, now));
    if (d.act === "remove-bleed") {
      if (!global.confirm("Remove this bleed? Its days and flow are removed from your notes. Your day notes stay.")) return;
      const b = M.bleedOn(data, logDate);
      return b && change((x) => M.removeBleed(x, b.id, now));
    }
    if (d.symptom || d.custom != null || d.act === "add-own") {
      const form = root().querySelector("[data-form=note]");
      const Y = C().symptoms;
      let note = noteFromForm(form);
      if (d.act === "add-own") {
        const name = form.own.value.trim().slice(0, 60);
        if (!name || note.custom[name]) return;
        note = Y.withSymptom(note, name, 1, true);
      } else {
        const custom = d.custom != null;
        const id = custom ? d.custom : d.symptom;
        note = Y.withSymptom(note, id, Y.nextIntensity((custom ? note.custom : note.symptoms)[id]), custom);
      }
      flash = "Kept, encrypted.";
      return change((x) => M.putNote(x, note, now));
    }
    if (d.pick) {
      const p = pastState.picked;
      pastState.picked = p.includes(d.pick) ? p.filter((x) => x !== d.pick) : [...p, d.pick].sort();
      return render();
    }
    if (d.unpick) {
      pastState.picked = pastState.picked.filter((x) => x !== d.unpick);
      return render();
    }
    if (d.month) {
      const m = pastState.m + Number(d.month);
      pastState.y += m < 0 ? -1 : m > 11 ? 1 : 0;
      pastState.m = (m + 12) % 12;
      return render();
    }
    if (d.plength != null) {
      pastState.length = Number(d.plength);
      return render();
    }
    if (d.order) {
      pastState.order = d.order;
      pastState.text = root().querySelector("[data-form=paste]")?.text.value ?? pastState.text;
      pastState.read = null;
      return render();
    }
    if (d.act === "add-picked") {
      const r = addPast(pastState.picked.map((k) => C().past.entryWithLength(k, pastState.length || null)));
      if (r.added) pastState.picked = [];
      return render();
    }
    if (d.act === "add-read" && pastState.read) {
      const r = addPast(pastState.read.entries);
      if (r.added) {
        pastState.read = null;
        pastState.text = "";
      }
      return render();
    }
    if (d.act === "remove-past") {
      if (!global.confirm("Remove this period? Its days and flow are removed from your notes. Your day notes stay.")) return;
      pastState.editing = null;
      return change((x) => M.removeBleed(x, d.id, now));
    }
    if (d.lengthMode) return setSettings({ length: { ...data.settings.length, mode: d.lengthMode } });
    if (d.len) {
      const L = data.settings.length;
      const lim = M.LENGTH_LIMITS;
      const v = L[d.len] + Number(d.delta);
      const lo = d.len === "max" ? L.min : lim.min;
      const hi = d.len === "min" ? L.max : lim.max;
      if (v < lo || v > hi) return;
      return setSettings({ length: { ...L, [d.len]: v } });
    }
    if (d.flow) return change((x) => M.setFlow(x, logDate, d.flow === "none" ? null : d.flow, now));
    if (d.rate) {
      const form = root().querySelector("[data-form=note]");
      form.elements[d.rate].value = d.value;
      form.querySelectorAll(`[data-rate="${d.rate}"]`).forEach((b) => b.setAttribute("aria-pressed", b === t ? "true" : "false"));
      return;
    }
    if (d.mode) return setSettings({ mode: d.mode });
    if (d.situation) return setSettings({ situations: data.settings.situations.includes(d.situation) ? data.settings.situations.filter((x) => x !== d.situation) : [...data.settings.situations, d.situation] });
    if (d.setting) {
      const r = data.settings.reminders;
      if (d.setting === "reminders") return setSettings({ reminders: { ...r, on: t.checked } });
      if (d.setting === "full") return setSettings({ reminders: { ...r, full: t.checked } });
      return setSettings({ [d.setting]: t.checked });
    }
    if (d.ahead) return setSettings({ reminders: { ...data.settings.reminders, ahead: Number(d.ahead) } });
    if (d.act === "remember") return S.setRemember(t.checked);
    if (d.act === "lock") return S.lockNow();
    if (d.act === "device-only") {
      if (!global.confirm("Keep it in this browser only? Your account’s encrypted copy is deleted. The app will no longer have it.")) return;
      return attempt(() => S.keepOnDeviceOnly());
    }
    if (d.act === "delete-all") {
      if (!global.confirm("Delete all your Cycle & Moon data? Your notes, settings and any status you share are deleted from this browser and from your account. This can’t be undone.")) return;
      return attempt(async () => {
        await S.deleteAll();
        recovery = null;
        flash = "Deleted. Your Cycle & Moon data is gone from this browser and your account.";
        global.history.replaceState(null, "", href(""));
        render();
      });
    }
    if (shareState) {
      const f = shareState.form;
      if (d.status) f.status = d.status;
      else if (d.days) f.days = Number(d.days);
      else if (d.coven) f.covens = f.covens.includes(d.coven) ? f.covens.filter((x) => x !== d.coven) : [...f.covens, d.coven];
      else if (d.person) f.people = f.people.includes(d.person) ? f.people.filter((x) => x !== d.person) : [...f.people, d.person];
      else if (d.act === "share")
        return attempt(async () => {
          await S.shareStatus(f.status, f.covens, f.people, f.days);
          flash = "Shared. Only the covens and people you chose can see it.";
          await loadShare();
        });
      else if (d.act === "stop-sharing")
        return attempt(async () => {
          await S.stopSharing();
          flash = "No longer shared.";
          await loadShare();
        });
      else return;
      return render();
    }
  }

  /** The note as the form stands, with the symptoms already kept for that day. */
  function noteFromForm(form) {
    const M = C().model;
    const date = form.dataset.date;
    const kept = M.noteOn(S.state.data, date) || M.emptyNote(date);
    const rate = (n) => Number(form.elements[n].value) || null;
    return { ...kept, energy: rate("energy"), intuition: rate("intuition"), mood: form.mood.value, body: form.body.value, dreams: form.dreams.value, text: form.text.value };
  }

  function onSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const kind = form.dataset.form;
    if (kind === "note") {
      const M = C().model;
      const note = noteFromForm(form);
      S.update((d) => M.putNote(d, note, new Date()));
      flash = "Kept, encrypted.";
      return render();
    }
    if (kind === "paste") {
      pastState.text = form.text.value;
      pastState.read = C().past.parsePastList(form.text.value, pastState.order || "dmy", C().model.dayKey(new Date()));
      return render();
    }
    if (kind === "edit-bleed") {
      let problem = null;
      change((d) => {
        const r = C().past.editBleed(d, form.dataset.id, form.start.value, form.end.value || null, new Date());
        problem = r.problem ? r.problem.message : null;
        return r.data;
      });
      pastState.problem = problem;
      if (!problem) pastState.editing = null;
      return render();
    }
    if (kind === "protect" || kind === "change") {
      const pass = form.pass.value;
      const p = problem(pass, form.again.value);
      if (p) return say(p);
      return attempt(async () => {
        const r = kind === "protect" ? await S.protect(pass, form.remember?.checked, onProgress(form)) : await S.changePassphrase(pass, form.newRecovery?.checked, onProgress(form));
        recovery = r;
        flash = kind === "protect" ? "Protected and kept with your account." : "Passphrase changed.";
        render();
      });
    }
    if (kind === "unlock") {
      return attempt(async () => {
        if (form.code) await S.unlockRecovery(form.code.value, form.remember.checked);
        else await S.unlock(form.pass.value, form.remember.checked, onProgress(form));
        flash = "";
        global.history.replaceState(null, "", href(view()));
      });
    }
    if (kind === "keep") {
      return attempt(async () => {
        grimoireKept = await keepInGrimoire(form);
        flash = "Kept in your Grimoire, under Moon Time.";
        render();
      });
    }
  }

  function start() {
    root().addEventListener("click", onClick);
    root().addEventListener("submit", onSubmit);
    S.subscribe(() => {
      // Don't redraw a form being typed into; a sync line update is enough.
      const typing = root().contains(global.document.activeElement) && /INPUT|TEXTAREA/.test(global.document.activeElement.tagName) && global.document.activeElement.type !== "checkbox";
      if (typing) {
        const line = root().querySelector("[data-sync]");
        if (line) line.textContent = SYNC_LINE[S.state.sync] || "";
        return;
      }
      render();
    });
    const go = (u) => S.load(u?.id || null).then(() => view() === "share" && loadShare());
    global.SaltPage.ready().then(go);
    global.SaltPage.onUserChange((u) => {
      shareState = null;
      go(u);
    });
    render();
  }

  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start);
  else start();
})(window);
