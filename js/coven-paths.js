/*
 * The paths of the covens you belong to (app: lib/covens/useCovenTraditions.ts),
 * for putting their premade workings and calendars first: each coven's
 * tradition (covens.course_tradition) read once a visit, mapped to paths by
 * the app's logic (SaltCore.<bundle>.covenTradition.pathsForCovens). None for
 * guests, or before 20261119000000_coven_tradition.sql is applied.
 */
(function (global) {
  "use strict";

  const KEY = "saltCovenTraditions";
  let pending = null;
  let last = [];

  async function traditions() {
    const db = global.db;
    if (!db?.auth) return [];
    const { data } = await db.auth.getSession();
    const userId = data?.session?.user?.id;
    if (!userId) return [];
    try {
      const kept = JSON.parse(global.sessionStorage.getItem(KEY) || "null");
      if (kept && kept.user === userId && Array.isArray(kept.traditions)) return kept.traditions;
    } catch {
      // Storage may be blocked: read afresh.
    }
    const { data: rows, error } = await db.from("coven_members").select("covens!coven_members_coven_id_fkey(course_tradition)").eq("user_id", userId).eq("status", "active");
    if (error || !rows) return [];
    const list = rows.map((r) => r.covens?.course_tradition).filter((t) => typeof t === "string");
    try {
      global.sessionStorage.setItem(KEY, JSON.stringify({ user: userId, traditions: list }));
    } catch {
      // Not kept: read again next page.
    }
    return list;
  }

  /** The paths, given the bundle that carries covenTradition (SaltCore.rituals, .today or .guides). */
  function load(core) {
    if (!pending) pending = traditions().catch(() => []);
    return pending.then((list) => (last = core?.covenTradition?.pathsForCovens(list) || []));
  }

  global.SaltCovenPaths = { load, cached: () => last };
})(typeof window !== "undefined" ? window : globalThis);
