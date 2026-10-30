/*
 * Solitary (/practice/solitary/…): daily devotion, a morning and an evening
 * practice, kept gently. The app's screens in
 * app/src/app/(tabs)/rituals/craft/solitary; logic from js/core/practice-a.js.
 * Days are kept in craft_entries, collection `solitary.devotions`
 * ({ date, morning, evening, note }), as the app keeps them. The app's
 * reminders become a calendar file (.ics) here: a website can't nudge you.
 */
(function (global, factory) {
  const pure = factory();
  if (typeof module === "object" && module.exports) module.exports = pure;
  else pure.mount(global);
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const COLLECTION = "solitary.devotions";
  const REMINDER_KEY = "salt.practice.devotionReminders";
  const DEFAULT_REMINDERS = { morning: true, morningAt: 7 * 60, evening: true, eveningAt: 21 * 60, days: 30 };
  const pad = (n) => String(n).padStart(2, "0");

  /** "07:00" ⇄ minutes after midnight. */
  const toClock = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
  function fromClock(text, fallback) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(text || "").trim());
    if (!m || +m[1] > 23 || +m[2] > 59) return fallback;
    return +m[1] * 60 + +m[2];
  }

  /**
   * Calendar events for the devotion nudges, one a day for `days` days from
   * today, worded as the app's notifications are (title "Morning devotion",
   * the day's practice as the note), each with an alert at its start. Pure.
   */
  function devotionEvents(devotion, opts, now) {
    const out = [];
    const days = Math.max(1, Math.min(90, Number(opts.days) || 30));
    for (const [on, at, which] of [
      [opts.morning, opts.morningAt, "morning"],
      [opts.evening, opts.eveningAt, "evening"]
    ]) {
      if (!on) continue;
      for (let d = 0; d < days; d++) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, Math.floor(at / 60), at % 60, 0, 0);
        if (start.getTime() < now.getTime()) continue;
        const key = devotion.dateKey(start);
        const prompt = devotion.devotionFor(key)[which];
        out.push({
          key: `devotion-${which}-${key}`,
          title: which === "morning" ? "Morning devotion" : "Evening devotion",
          start,
          end: new Date(start.getTime() + 10 * 60_000),
          allDay: false,
          notes: `${prompt.title}\n\n${prompt.reading ? `${prompt.reading}\n\n` : ""}${prompt.text}`,
          alarms: [0]
        });
      }
    }
    return out.sort((a, b) => a.start - b.start);
  }

  function readReminders(storage) {
    try {
      return { ...DEFAULT_REMINDERS, ...(JSON.parse(storage.getItem(REMINDER_KEY) || "null") || {}) };
    } catch {
      return { ...DEFAULT_REMINDERS };
    }
  }
  function saveReminders(storage, value) {
    try {
      storage.setItem(REMINDER_KEY, JSON.stringify(value));
    } catch {
      /* this visit still works */
    }
  }

  function mount(global) {
    const kit = global.PracticeKit;
    const core = global.SaltCore?.["practice-a"];
    const root = kit?.root();
    if (!kit || !core || !root) return;
    const { devotion: V, practices, premade, calendarEvent } = core;
    const view = root.dataset.view;
    const longDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    let user = null;
    let entries = [];
    let ready = false;
    const state = { busy: false, note: null, problem: "", reminders: readReminders(global.localStorage), icsMessage: "" };

    function hubView() {
      const about = premade.PRACTICES.find((p) => p.id === "solitary");
      const now = new Date();
      const key = V.dateKey(now);
      const today = V.devotionFor(key);
      const kept = V.daysByDate(entries).get(key);
      const evening = V.eveningFirst(now);
      const prompt = evening ? today.evening : today.morning;
      const words = kit.join([kept?.morning ? "Morning kept" : null, kept?.evening ? "Evening kept" : null]);
      return [
        kit.back(kit.href.hub, "Craft"),
        kit.head({ eyebrow: "Craft tools", title: about?.name ?? "Solitary", lede: about?.about }),
        kit.card(`${kit.p(prompt.title)}${kit.muted(words || "Waiting for you, whenever you’re ready.")}`, { gold: true, label: evening ? "This evening" : "This morning" }),
        kit.section("Tools", kit.list(practices.CRAFT_TOOLS.solitary.map((t) => kit.row({ url: kit.href.tool("solitary", "devotion"), title: t.title, detail: t.detail }))), { id: "tools" }),
        kit.list([
          kit.row({ url: "/rituals/journeys/", title: "Dedication journeys", detail: "On Rituals · study, practice and a rite of self-dedication to a path or a god" }),
          kit.row({ url: kit.href.premadeList("solitary"), title: "Premade workings", detail: "Every ritual and spell, filter by Solitary" })
        ])
      ].join("");
    }

    function devotionView() {
      const now = new Date();
      const key = V.dateKey(now);
      const today = V.devotionFor(key);
      const days = V.daysByDate(entries);
      const record = days.get(key);
      const dots = V.weekDots(days, now);
      if (state.note === null) state.note = record?.note ?? "";
      const part = (when) => {
        const prompt = today[when];
        const done = !!record?.[when];
        const word = when === "morning" ? "Morning" : "Evening";
        return kit.card(
          `<h2 class="pr-big">${kit.esc(prompt.title)}</h2>${prompt.reading ? `<p class="pr-quote">${kit.esc(prompt.reading)}</p>` : ""}${kit.p(prompt.text)}${
            done
              ? `${kit.muted(`${word} kept. Thank you for coming.`)}${kit.textButton({ label: `Not yet: unmark ${when}`, act: "mark", value: `${when}:0`, disabled: state.busy || !ready })}`
              : kit.actions([kit.button({ label: `I kept my ${when} practice`, act: "mark", value: `${when}:1`, primary: true, disabled: state.busy || !ready })])
          }`,
          { gold: !done, label: `${word} · ${V.KIND_LABELS[prompt.kind]}` }
        );
      };
      const order = V.eveningFirst(now) ? ["evening", "morning"] : ["morning", "evening"];
      const week = `<ul class="pr-week">${dots
        .map(
          (d) =>
            `<li aria-label="${kit.esc(`${longDate(d.date)}${d.today ? ", today" : ""}: morning ${d.morning ? "kept" : "not kept"}, evening ${d.evening ? "kept" : "not kept"}`)}"><span class="pr-week__day${
              d.today ? " is-today" : ""
            }" aria-hidden="true">${d.weekday}</span><span class="pr-dot${d.morning ? " is-on" : ""}" aria-hidden="true"></span><span class="pr-dot pr-dot--evening${d.evening ? " is-on" : ""}" aria-hidden="true"></span></li>`
        )
        .join("")}</ul>`;
      const earlier = [...days.values()]
        .filter((d) => d.date !== key && d.note?.trim())
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 14);
      const r = state.reminders;
      const noteChanged = state.note.trim() !== (record?.note ?? "").trim();
      return [
        kit.back(kit.href.practice("solitary"), "Solitary"),
        kit.head({ eyebrow: longDate(key), title: "Daily devotion", lede: "A few minutes in the morning and a few at night. There’s no wrong way to do it, and no day you can fall behind on." }),
        order.map(part).join(""),
        kit.notice(state.problem, { live: true }),
        kit.card(`${week}${kit.p(V.weekWords(dots))}${kit.muted("Top dot for morning, lower for evening.")}`, { label: "Kept this week" }),
        kit.card(
          `${kit.field({
            id: "devotion-note",
            label: "A note for today (optional)",
            value: state.note,
            input: "note",
            multiline: true,
            maxlength: V.NOTE_MAX,
            placeholder: "What came up, what you noticed, a line to remember…"
          })}${kit.actions([
            kit.button({ label: state.busy ? "Saving…" : "Save note", act: "save-note", primary: true, disabled: state.busy || !ready || !noteChanged, id: "save-note" }),
            record?.note ? kit.button({ label: "Clear note", act: "clear-note", ghost: true, disabled: state.busy }) : ""
          ])}${kit.caption(kit.savedLine(user, "your practice"))}`
        ),
        kit.card(
          [
            kit.muted(
              "A website can’t nudge you, so the reminders come as a calendar file instead: add it to your phone’s or computer’s calendar and each day’s practice arrives as an event with an alert. Download a new one when it runs out."
            ),
            kit.toggle({ id: "rem-morning", label: "Morning devotion", detail: "A gentle nudge with the morning’s practice", checked: r.morning, change: "rem-toggle" }),
            r.morning ? kit.field({ id: "rem-morning-at", label: "Morning time", type: "time", value: toClock(r.morningAt), change: "rem-time" }) : "",
            kit.toggle({ id: "rem-evening", label: "Evening devotion", detail: "A nudge to close the day", checked: r.evening, change: "rem-toggle" }),
            r.evening ? kit.field({ id: "rem-evening-at", label: "Evening time", type: "time", value: toClock(r.eveningAt), change: "rem-time" }) : "",
            `<div class="sp-field"><label for="rem-days">How far ahead</label><select id="rem-days" data-change="rem-days">${[14, 30, 60, 90]
              .map((n) => `<option value="${n}"${Number(r.days) === n ? " selected" : ""}>${n} days</option>`)
              .join("")}</select></div>`,
            kit.actions([kit.button({ label: "Download calendar file (.ics)", act: "ics", primary: true, disabled: !r.morning && !r.evening, id: "ics" })]),
            kit.notice(state.icsMessage, { live: true }),
            kit.caption("The file is made in your browser; nothing is sent anywhere. Adding it again updates the same events rather than doubling them.")
          ].join(""),
          { label: "Remind me" }
        ),
        earlier.length
          ? kit.details("Earlier notes", earlier.map((d) => `<div class="sp-section"><p class="sp-eyebrow">${kit.esc(longDate(d.date))}</p>${kit.p(d.note)}</div>`).join(""))
          : ""
      ].join("");
    }

    async function save(patch) {
      const key = V.dateKey(new Date());
      const record = V.daysByDate(entries).get(key);
      state.busy = true;
      state.problem = "";
      draw();
      try {
        const base = { date: key, morning: !!record?.morning, evening: !!record?.evening, note: record?.note ?? "" };
        const next = { ...base, ...patch };
        if (record) {
          const [first, ...extra] = record.ids;
          await kit.update(COLLECTION, first, next);
          // Fold any second copy made on another device into this one.
          for (const x of extra) await kit.remove(COLLECTION, x);
        } else {
          await kit.add(COLLECTION, next);
        }
        entries = await kit.entries(COLLECTION);
      } catch (error) {
        console.error(error);
        state.problem = "Couldn’t save. Please try again.";
      } finally {
        state.busy = false;
        draw();
      }
    }

    const VIEWS = { solitary: hubView, "solitary-devotion": devotionView };
    const draw = () => kit.render(root, (VIEWS[view] || hubView)());
    const keepReminders = () => saveReminders(global.localStorage, state.reminders);

    kit.delegate(root, {
      mark(el) {
        const [when, on] = el.dataset.value.split(":");
        void save({ [when]: on === "1" });
      },
      note(el) {
        state.note = el.value;
        const record = V.daysByDate(entries).get(V.dateKey(new Date()));
        const btn = root.querySelector("#save-note");
        if (btn) btn.disabled = state.busy || !ready || el.value.trim() === (record?.note ?? "").trim();
      },
      "save-note"() {
        void save({ note: state.note.trim().slice(0, V.NOTE_MAX) });
      },
      "clear-note"() {
        if (!kit.confirm("Clear today’s note? The note for today will be removed from every device.")) return;
        state.note = "";
        void save({ note: "" });
      },
      "rem-toggle"(el) {
        state.reminders[el.id === "rem-morning" ? "morning" : "evening"] = el.checked;
        keepReminders();
        draw();
      },
      "rem-time"(el) {
        const which = el.id === "rem-morning-at" ? "morningAt" : "eveningAt";
        state.reminders[which] = fromClock(el.value, state.reminders[which]);
        keepReminders();
      },
      "rem-days"(el) {
        state.reminders.days = Number(el.value);
        keepReminders();
      },
      ics() {
        const events = devotionEvents(V, state.reminders, new Date());
        if (!events.length) return;
        kit.downloadFile("daily-devotion.ics", calendarEvent.toIcs(events, new Date()));
        state.icsMessage = `Made ${kit.plural(events.length, "reminder", "reminders")}. Open the file to add them to your calendar.`;
        draw();
      }
    });

    kit.start(async (who) => {
      user = who;
      entries = await kit.entries(COLLECTION);
      ready = true;
      draw();
    });
  }

  return { COLLECTION, DEFAULT_REMINDERS, toClock, fromClock, devotionEvents, readReminders, saveReminders, mount };
});
