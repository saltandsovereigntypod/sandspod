/*
 * Reminders on the website, worked out from the app's own rules
 * (app/src/lib/reminders/schedule.ts and calendarEvent.ts, via
 * js/core/guides.js). A browser can't ring at a set time, so each reminder
 * becomes a calendar event with alerts, handed over as an .ics file or a
 * Google Calendar link. Pure: every function takes the app's modules (`G`)
 * and the time, so it can be tested under node.
 *
 * Choices are kept in this browser under the app's own keys and shapes
 * ("reminders.settings.v1", "calendar.settings.v1"), as the app keeps them
 * on the phone.
 */
(function (global) {
  const KEYS = Object.freeze({ reminders: "reminders.settings.v1", calendar: "calendar.settings.v1", plans: "rituals.plans.v1" });
  const SKY_KINDS = ["moon", "holiday", "astro"];
  const DAY = 86400000;
  /** How far ahead each kind goes into the reminders file. */
  const HORIZON = Object.freeze({ moon: 180, sacred: 90 });
  const FOOTER = "From Salt & Sovereignty.";

  function readJson(storage, key) {
    try {
      const raw = storage?.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function writeJson(storage, key, value) {
    try {
      storage?.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  const loadReminders = (storage, G) => G.schedule.normalizeSettings(readJson(storage, KEYS.reminders));

  function saveReminders(storage, G, current, change) {
    const next = G.schedule.normalizeSettings({ ...current, ...change });
    writeJson(storage, KEYS.reminders, next);
    return next;
  }

  /** The app's calendar choices: which sky events go in, and how each kind is laid out. */
  function loadCalendar(storage, G) {
    const saved = readJson(storage, KEYS.calendar) || {};
    return {
      ...saved,
      phases: saved.phases !== false,
      sabbats: saved.sabbats !== false,
      astro: saved.astro !== false,
      styles: Object.fromEntries(SKY_KINDS.map((kind) => [kind, G.calendarEvent.normalizeStyle(saved.styles?.[kind])])),
    };
  }

  function saveCalendar(storage, G, current, change) {
    const next = { ...current, ...change };
    next.styles = Object.fromEntries(SKY_KINDS.map((kind) => [kind, G.calendarEvent.normalizeStyle(next.styles?.[kind])]));
    writeJson(storage, KEYS.calendar, next);
    return next;
  }

  function clock(date) {
    const h = date.getHours();
    return `${h % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  }

  /** "7:00 pm" for minutes after midnight. */
  const minutesLabel = (minutes) => clock(new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60));

  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isoDay = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  /**
   * The chosen moon phases as all-day events, with an alert for each
   * reminder the app would send: on the day at your time, the day before,
   * days ahead, and at the exact moment.
   */
  function moonReminderEvents(settings, now, G, days = HORIZON.moon) {
    const phases = G.schedule.PHASE_ORDER.filter((p) => settings.phases[p]);
    if (!phases.length) return [];
    const until = now.getTime() + days * DAY;
    const at = settings.phaseHour * 60 + settings.phaseMinute;
    return G.moon
      .upcomingPhases(now, Math.ceil(days / 7) + 4)
      .filter((e) => settings.phases[e.phase] && e.date.getTime() <= until)
      .map((e) => {
        const name = G.moon.PRINCIPAL_NAMES[e.phase];
        const title = e.phase === "new" || e.phase === "full" ? `${name} in ${G.moon.signAtSyzygy(e.date, e.phase)}` : name;
        const start = startOfDay(e.date);
        const exact = Math.round((e.date.getTime() - start.getTime()) / 60000);
        const alarms = [at, settings.dayBefore ? at - 1440 : null, ...settings.daysAhead.map((d) => at - d * 1440), settings.atExact ? exact : null];
        const note = (settings.notes[e.phase] || "").trim();
        return {
          key: `reminder-moon-${e.phase}-${isoDay(start)}`,
          title,
          start,
          end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1),
          allDay: true,
          exact: e.date,
          notes: [`Exact at ${clock(e.date)}.`, note || "A good time to plan or begin a working.", FOOTER].join("\n"),
          alarms: [...new Set(alarms.filter((a) => a != null))].sort((a, b) => a - b),
        };
      });
  }

  /** Planned rituals still to come, each with an alert before it begins. */
  function ritualReminderEvents(settings, plans, now, G, templateFor = () => null) {
    if (!settings.rituals) return [];
    return (plans || [])
      .filter((plan) => plan && !plan.doneAt)
      .map((plan) => G.calendarEvent.planEvent(plan, templateFor(plan) || null))
      .filter((spec) => spec && spec.start.getTime() > now.getTime())
      .map((spec) => ({ ...spec, key: spec.key.replace(/^plan-/, "reminder-plan-"), alarms: [-settings.ritualLeadMinutes], notes: spec.notes.replace("Planned in the Salt & Sovereignty app.", FOOTER) }));
  }

  /** Daily devotions (two weeks, as the app keeps them) as short events at your times. */
  function devotionReminderEvents(settings, now, G) {
    if (!settings.devotionMorning && !settings.devotionEvening) return [];
    const only = { ...G.schedule.DEFAULT_SETTINGS, rituals: false, devotionMorning: settings.devotionMorning, devotionMorningAt: settings.devotionMorningAt, devotionEvening: settings.devotionEvening, devotionEveningAt: settings.devotionEveningAt };
    return G.schedule.buildSchedule(only, [], now).map((r) => ({
      key: `reminder-${r.key.replace(/:/g, "-")}`,
      title: r.title,
      start: r.at,
      end: new Date(r.at.getTime() + 15 * 60000),
      allDay: false,
      notes: `${r.body}\n${FOOTER}`,
      alarms: [0],
    }));
  }

  /** The morning nudge to write down last night's dream (two weeks, as the app keeps it). */
  function dreamReminderEvents(settings, now, G) {
    if (!settings.dreamMorning) return [];
    const only = { ...G.schedule.DEFAULT_SETTINGS, rituals: false, dreamMorning: true, dreamMorningAt: settings.dreamMorningAt };
    return G.schedule.buildSchedule(only, [], now).map((r) => ({
      key: `reminder-${r.key.replace(/:/g, "-")}`,
      title: r.title,
      start: r.at,
      end: new Date(r.at.getTime() + 15 * 60000),
      allDay: false,
      notes: `${r.body}\nhttps://saltandsovereignty.com/grimoire/dreams/edit/\n${FOOTER}`,
      alarms: [0],
    }));
  }

  /** Your deities' sacred days (Settings → My deities) at your time of day. */
  function sacredReminderEvents(settings, appSettings, now, G, days = HORIZON.sacred) {
    if (!settings.sacredDays) return [];
    const sources = G.patron.sacredSources(appSettings || {});
    if (!sources.length) return [];
    return G.patron.sacredReminders(sources, now, days).map((r) => {
      const start = new Date(r.date.getFullYear(), r.date.getMonth(), r.date.getDate(), Math.floor(settings.sacredAt / 60), settings.sacredAt % 60);
      return { key: `reminder-sacred-${r.key}-${isoDay(start)}`.replace(/[^a-z0-9-]+/gi, "-"), title: r.title, start, end: new Date(start.getTime() + 30 * 60000), allDay: false, notes: `${r.body}\n${FOOTER}`, alarms: [0] };
    }).filter((e) => e.start.getTime() > now.getTime());
  }

  /**
   * Hekate's Deipnon each month (the app's deipnon reminders), for those who
   * keep the Hellenic monthly days or hold Hekate as patron, at the time chosen
   * for sacred days. Turned off in Today's calendar settings (deipnon_prompt).
   */
  function deipnonReminderEvents(settings, appSettings, now, G, days = HORIZON.sacred) {
    if (!G.deipnon) return [];
    return G.deipnon
      .deipnonReminders(appSettings || {}, now, days)
      .map((r) => {
        const start = new Date(r.date.getFullYear(), r.date.getMonth(), r.date.getDate(), Math.floor(settings.sacredAt / 60), settings.sacredAt % 60);
        return {
          key: `reminder-${r.key}`.replace(/[^a-z0-9-]+/gi, "-"),
          title: r.title,
          start,
          end: new Date(start.getTime() + 30 * 60000),
          allDay: false,
          notes: `${r.body}\nhttps://saltandsovereignty.com/divination/draw/?spread=crossroads\n${FOOTER}`,
          alarms: [0],
        };
      })
      .filter((e) => e.start.getTime() > now.getTime());
  }

  /** Every reminder as a calendar event, soonest first. */
  function reminderEvents({ settings, plans, appSettings, now, templateFor }, G) {
    const deipna = deipnonReminderEvents(settings, appSettings, now, G);
    const deipnonDays = new Set(deipna.map((e) => isoDay(e.start)));
    // The Deipnon stands in for itself among Hekate's sacred days, so the day isn't in the calendar twice.
    const sacred = sacredReminderEvents(settings, appSettings, now, G).filter((e) => !(e.key.startsWith("reminder-sacred-hekate-") && deipnonDays.has(isoDay(e.start))));
    return [
      ...moonReminderEvents(settings, now, G),
      ...ritualReminderEvents(settings, plans, now, G, templateFor),
      ...devotionReminderEvents(settings, now, G),
      ...dreamReminderEvents(settings, now, G),
      ...sacred,
      ...deipna,
    ].sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  /** Holidays, eclipses and moon phases, laid out by your event settings (the app's downloadSky). */
  function skyEvents({ calendar, phases, appSettings, now }, G) {
    const E = G.calendarEvent;
    const styled = (kind, specs) => specs.map((spec) => E.styleEvent(spec, calendar.styles[kind]));
    return [
      ...(calendar.phases ? styled("moon", E.moonEvents(phases, now)) : []),
      ...(calendar.sabbats ? styled("holiday", E.holidayEvents(now, 365, G.holidays.holidayChoice(appSettings || {}))) : []),
      ...(calendar.astro ? styled("astro", E.astroEvents(now, 365)) : []),
    ].sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  /** The next event of a kind as it would go into the calendar, for the event settings preview. */
  function sampleEvent(kind, style, { phases, appSettings, now }, G) {
    const E = G.calendarEvent;
    const anyPhase = Object.values(phases || {}).some(Boolean) ? phases : { new: true, firstQuarter: true, full: true, lastQuarter: true };
    const specs = kind === "moon" ? E.moonEvents(anyPhase, now, 40) : kind === "holiday" ? E.holidayEvents(now, 365, G.holidays.holidayChoice(appSettings || {})) : E.astroEvents(now, 365);
    return specs[0] ? E.styleEvent(specs[0], style) : null;
  }

  /** Plans as the app keeps them, from `ritual_plans` rows (signed in) or this browser (guest). */
  function plansFrom({ rows, local }, G) {
    if (Array.isArray(rows)) return rows.map((row) => G.planSync.planFromRow(row));
    return Array.isArray(local) ? local.filter((plan) => plan && typeof plan.id === "string") : [];
  }

  /** How an event reads in a list: "Sat 18 Oct · 7:00 pm" or "Sat 18 Oct". */
  function whenLabel(event) {
    const day = event.start.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
    return event.allDay ? day : `${day} · ${clock(event.start)}`;
  }

  /** How an alert reads, for the list. */
  function alarmLabel(offset, allDay) {
    if (allDay) {
      const dayShift = Math.floor(offset / 1440);
      const minutes = ((offset % 1440) + 1440) % 1440;
      const when = dayShift === 0 ? "On the day" : dayShift === -1 ? "The day before" : `${-dayShift} days before`;
      return `${when}, ${minutesLabel(minutes)}`;
    }
    if (offset === 0) return "At the time";
    const before = -offset;
    if (before < 60) return `${before} minutes before`;
    if (before % 1440 === 0) return before === 1440 ? "A day before" : `${before / 1440} days before`;
    return before === 60 ? "An hour before" : `${Math.round(before / 60)} hours before`;
  }

  const api = { KEYS, SKY_KINDS, HORIZON, readJson, writeJson, loadReminders, saveReminders, loadCalendar, saveCalendar, clock, minutesLabel, moonReminderEvents, ritualReminderEvents, devotionReminderEvents, dreamReminderEvents, sacredReminderEvents, deipnonReminderEvents, reminderEvents, skyEvents, sampleEvent, plansFrom, whenLabel, alarmLabel };
  global.RemindersLogic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
