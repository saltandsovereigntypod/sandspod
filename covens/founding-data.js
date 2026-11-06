/*
 * The founder's training and listing applications on the website: the same
 * calls the app makes (app/src/lib/covens/foundingApi.ts), against
 * supabase/migrations/20261129000000_coven_founders_live.sql. The database
 * decides who may do what; these only ask. Used by covens/leading/ and
 * covens/moderation/.
 */
(function (global) {
  "use strict";

  const db = () => {
    if (!global.db) throw new Error("The Sanctuary’s connection isn’t ready. Please refresh the page.");
    return global.db;
  };
  async function run(promise) {
    const { data, error } = await promise;
    if (error) throw new Error(error.message);
    return data;
  }
  const rpc = (name, args) => run(db().rpc(name, args));
  const ring = (body) => Promise.resolve(db().functions?.invoke?.("coven-listing-notify", { body })).catch(() => {});
  const F = () => global.SaltCore.covens.founding;

  let course = null;
  /** The founder's training, with the coven courses (js/core/course-programs.json `founder`). */
  function loadCourse() {
    if (!course) {
      course = fetch(global.CovenUI.href("/js/core/course-programs.json"))
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          const found = F().readFounderCourse(json && json.founder);
          if (!found) throw new Error("missing");
          return found;
        })
        .catch(() => {
          course = null;
          throw new Error("The lessons didn’t load. Check your connection and try again.");
        });
    }
    return course;
  }

  global.FoundingData = {
    loadCourse,
    training: (userId) => run(db().from("coven_leader_training").select("module_id,score,max,passed_at").eq("user_id", userId)).catch(() => []),
    recordTraining: (moduleId, score, max) => rpc("record_leader_training", { p_module: moduleId, p_score: score, p_max: max }),
    trainingDone: (userId) => rpc("leader_training_done", { p_user: userId }).catch(() => null),
    latest: (covenId) =>
      run(db().from("coven_listing_applications").select(F().APPLICATION_FIELDS).eq("coven_id", covenId).order("submitted_at", { ascending: false }).limit(1).maybeSingle()).catch(() => null),
    async submit(covenId, d) {
      const row = await rpc("submit_coven_listing", {
        p_coven: covenId,
        p_title: d.leader_title.trim(),
        p_path: d.path.trim(),
        p_experience: d.experience.trim(),
        p_why: d.why.trim(),
        p_safety: d.safety.trim(),
        p_agree: !!d.agree,
        p_adult: !!d.adult,
      });
      if (row && row.id) ring({ listing_application_id: row.id });
      return row;
    },
    withdraw: (id) => rpc("withdraw_coven_listing", { p_application: id }),
    forReview: () =>
      run(
        db()
          .from("coven_listing_applications")
          .select(`${F().APPLICATION_FIELDS},covens(name,slug,tagline,description,tradition,joining,created_at)`)
          .in("status", ["pending", "changes", "approved", "declined"])
          .order("submitted_at", { ascending: false })
          .limit(100)
      ),
    async review(id, decision, note) {
      const row = await rpc("review_coven_listing", { p_application: id, p_decision: decision, p_note: (note || "").trim() || null });
      ring({ listing_application_id: id });
      return row;
    },
  };
})(window);
