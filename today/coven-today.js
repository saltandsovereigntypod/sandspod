/*
 * Today's coven section: your turn in a ritual under way, rituals happening
 * now, your covens' holidays, rites coming up, your next initiation or
 * training task, and work waiting for you to sign off. What to show is
 * SaltCore.covens.today (shared with the app); this loads the rows and
 * draws them into Today's [data-coven-today] (today/today.js redraws it from
 * CovenToday.html()).
 */
(function (global) {
  "use strict";

  const esc = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const href = (path) => global.SaltEnvironment?.resolvePath?.(path) || path;
  const COVEN_FIELDS = "id,slug,name,founder_id,practice_traditions,practice_holidays,practice_custom,practice_calendars,status";
  let html = "";
  let input = null;

  async function rows(query) {
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function load() {
    const db = global.db;
    const core = global.SaltCore?.covens;
    if (!db || !core) return null;
    const { data } = await db.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return null;
    const memberships = await rows(db.from("coven_members").select("coven_id,user_id,rank_id,status").eq("user_id", userId).eq("status", "active"));
    const ids = memberships.map((m) => m.coven_id);
    if (!ids.length) return { userId, empty: true };
    const [covens, ranks, grants, rituals, rsvps, enrollments, progress, mentors] = await Promise.all([
      rows(db.from("covens").select(COVEN_FIELDS).in("id", ids).eq("status", "active")),
      rows(db.from("coven_ranks").select("id,coven_id,name,can_manage,can_manage_programs").in("coven_id", ids)),
      rows(db.from("coven_grants").select("coven_id,user_id,power").eq("user_id", userId)).catch(() => []),
      rows(db.from("coven_rituals").select("id,coven_id,title,status,scheduled_for,current_step_id,occasion,occasion_name,kind").in("coven_id", ids).in("status", ["scheduled", "live"]).limit(100)),
      rows(db.from("coven_ritual_rsvps").select("ritual_id,user_id,response").eq("user_id", userId)).catch(() => []),
      rows(db.from("coven_program_enrollments").select("*").in("coven_id", ids).limit(500)).catch(() => []),
      rows(db.from("coven_program_progress").select("*").in("coven_id", ids).limit(3000)).catch(() => []),
      rows(db.from("coven_mentors").select("coven_id,user_id,mentor_id,assigned_at").in("coven_id", ids)).catch(() => [])
    ]);
    const live = rituals.filter((r) => r.status === "live").map((r) => r.id);
    const programIds = [...new Set([...enrollments.filter((e) => e.user_id === userId).map((e) => e.program_id), ...progress.filter((p) => p.status === "submitted").map((p) => p.program_id)])];
    const [steps, programs, stages, tasks] = await Promise.all([
      live.length ? rows(db.from("coven_ritual_steps").select("id,ritual_id,assigned_user_id,assigned_rank_id,title").in("ritual_id", live)) : [],
      programIds.length ? rows(db.from("coven_programs").select("*").in("id", programIds)) : [],
      programIds.length ? rows(db.from("coven_program_stages").select("*").in("program_id", programIds)) : [],
      programIds.length ? rows(db.from("coven_program_tasks").select("*").in("program_id", programIds)) : []
    ]);
    const programCovens = covens
      .filter((c) => {
        const m = memberships.find((x) => x.coven_id === c.id);
        const rank = ranks.find((r) => r.id === m?.rank_id);
        return c.founder_id === userId || rank?.can_manage || rank?.can_manage_programs || grants.some((g) => g.coven_id === c.id && g.power === "manage_programs");
      })
      .map((c) => c.id);
    return { userId, covens, memberships, programCovens, rituals, steps, rsvps, programs, stages, tasks, enrollments, progress, mentors, ranks };
  }

  function linkFor(item) {
    const base = `/covens/coven/?c=${encodeURIComponent(item.covenSlug)}`;
    if (item.target.ritual) return href(`${base}&tab=rituals&ritual=${encodeURIComponent(item.target.ritual)}`);
    if (item.target.program) return href(`${base}&tab=programs&program=${encodeURIComponent(item.target.program)}`);
    if (item.target.programs) return href(`${base}&tab=programs`);
    return href(base);
  }

  function draw(loaded) {
    input = loaded;
    const core = global.SaltCore.covens;
    if (!input || input.empty) {
      html = "";
      return;
    }
    const items = core.today.covenTodayItems(input, new Date());
    const soon = items.length < 3 ? core.today.covenHolidaysSoon(input.covens, new Date()) : [];
    if (!items.length && !soon.length) {
      html = `<section class="sp-card td-covens" aria-label="Your covens"><p class="sp-eyebrow">Your covens</p><p class="sp-caption">Nothing from your covens today. <a href="${esc(href("/covens/"))}">Visit your covens</a></p></section>`;
    } else {
      const icon = { turn: "✦", live: "☾", holiday: "❋", rite: "☽", task: "✧", review: "✓" };
      html = `<section class="sp-card td-covens" aria-label="Your covens"><p class="sp-eyebrow">Your covens</p><ul class="td-coven-list">${items
        .map((i) => `<li class="td-coven-item td-coven-item--${i.kind}"><a href="${esc(linkFor(i))}"><span class="td-coven-icon" aria-hidden="true">${icon[i.kind]}</span><span><strong>${esc(i.title)}</strong>${i.detail ? `<span class="sp-caption"> ${esc(i.detail)}</span>` : ""}${i.kind !== "review" && input.covens.length > 1 ? `<span class="sp-caption"> · ${esc(i.covenName)}</span>` : ""}</span></a></li>`)
        .join("")}${soon
        .map((s) => `<li class="td-coven-item"><a href="${esc(href(`/covens/coven/?c=${encodeURIComponent(s.coven.slug)}`))}"><span class="td-coven-icon" aria-hidden="true">❋</span><span><strong>${esc(s.holiday.name)}</strong><span class="sp-caption"> ${esc(s.holiday.date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }))} · ${esc(s.coven.name)}</span></span></a></li>`)
        .join("")}</ul></section>`;
    }
    document.querySelectorAll("[data-coven-today]").forEach((el) => (el.innerHTML = html));
    // "Your next working" weighs the covens' rites against your own plans.
    global.dispatchEvent(new Event("covenTodayLoaded"));
  }

  // The soonest rite or meeting on your covens' calendars, with its link (SaltCore.covens.today.nextCovenRite).
  function nextRite(now = new Date()) {
    const core = global.SaltCore?.covens;
    if (!core || !input || input.empty) return null;
    const rite = core.today.nextCovenRite(input, now);
    return rite ? { ...rite, href: linkFor({ covenSlug: rite.covenSlug, target: { ritual: rite.ritualId } }) } : null;
  }

  async function start() {
    try {
      draw(await load());
    } catch (error) {
      console.warn("Couldn’t load your covens for Today", error);
    }
  }

  // The loaded rows, for the Covens page's cards (SaltCore.covens.today.covenGlance): null until loaded.
  global.CovenToday = { html: () => html, nextRite, refresh: start, input: () => input };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(start, 0));
  else setTimeout(start, 0);
})(window);
