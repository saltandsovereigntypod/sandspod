/*
 * Covens: daughter covens and leadership, every read and write, as the app
 * makes them (app/src/lib/covens/lineageApi.ts;
 * supabase/migrations/20261112000000_coven_lineage.sql). Reads come back null
 * or empty before that migration is applied. Needs window.db.
 */
(function (global) {
  "use strict";

  const db = () => {
    if (!global.db) throw new Error("The Sanctuary’s connection isn’t ready. Please refresh the page.");
    return global.db;
  };
  async function run(promise) {
    const { data, error } = await promise;
    if (error) throw error;
    return data;
  }
  const rpc = (name, args) => run(db().rpc(name, args));
  const trim = (text) => String(text || "").trim() || null;

  /** Tell coven-notify about what you just did (best effort), as the app does. */
  function notify(body) {
    try {
      Promise.resolve(db().functions?.invoke?.("coven-notify", { body })).catch(() => {});
    } catch {
      // Phones hear another time.
    }
  }
  const notifyLineage = (covenId) => covenId && notify({ lineage_coven_id: covenId });
  const notifyLeadership = (covenId) => covenId && notify({ leadership_coven_id: covenId });
  const tell = async (covenId, call, which = "lineage") => {
    const result = await call;
    if (which === "lineage") notifyLineage(covenId);
    else notifyLeadership(covenId);
    return result;
  };

  async function shareables(covenId) {
    const safe = (p) => run(p).catch(() => []);
    const [docs, ranks, programs, sections, pages, library] = await Promise.all([
      safe(db().from("coven_documents").select("id,title,kind").eq("coven_id", covenId).order("position")),
      safe(db().from("coven_ranks").select("id,name").eq("coven_id", covenId).order("level")),
      safe(db().from("coven_programs").select("id,title,status").eq("coven_id", covenId).neq("status", "archived").order("position")),
      safe(db().from("coven_grimoire_sections").select("id,title,shelf,access").eq("coven_id", covenId).order("sort_order")),
      safe(db().from("coven_grimoire_pages").select("id,title,section_id,access").eq("coven_id", covenId).order("sort_order").limit(500)),
      safe(db().from("coven_ritual_library").select("id,title,kind").eq("coven_id", covenId).order("title"))
    ]);
    const closed = new Set(sections.filter((s) => s.shelf === "records" || s.shelf === "minutes" || Array.isArray(s.access?.view)).map((s) => s.id));
    return [
      ...docs.filter((d) => ["creed", "rules", "requirements", "agreement"].includes(d.kind)).map((d) => ({ kind: "document", id: d.id, title: d.title })),
      ...ranks.map((r) => ({ kind: "rank", id: r.id, title: r.name })),
      ...programs.map((p) => ({ kind: "program", id: p.id, title: p.title, detail: p.status === "draft" ? "Draft" : "" })),
      ...sections.filter((s) => !closed.has(s.id)).map((s) => ({ kind: "book_section", id: s.id, title: s.title })),
      ...pages.filter((p) => !(p.section_id && closed.has(p.section_id)) && !Array.isArray(p.access?.view)).map((p) => ({ kind: "book_page", id: p.id, title: p.title })),
      ...library.map((l) => ({ kind: "ritual_library", id: l.id, title: l.title, detail: l.kind === "template" ? "Template" : l.kind === "action" ? "Action" : "Saved block" })),
      { kind: "calendar", id: covenId, title: "The practice calendar" }
    ];
  }

  global.CovenLineageData = {
    notifyLineage,
    notifyLeadership,
    lineage: (covenId) => rpc("coven_lineage", { p_coven: covenId }).catch(() => null),
    disclosure: (slug) => rpc("coven_disclosure", { p_slug: slug }).catch(() => null),
    log: (covenId) => run(db().from("coven_lineage_events").select("*").eq("coven_id", covenId).order("created_at", { ascending: false }).limit(100)).catch(() => []),

    requestDaughter: (motherId, draft, copy, membership, note) =>
      tell(motherId, rpc("request_daughter_coven", { p_mother: motherId, p_draft: draft, p_copy: copy, p_membership: membership, p_note: trim(note) })),
    withdrawRequest: (motherId, id) => tell(motherId, rpc("withdraw_daughter_request", { p_request: id })),
    decideRequest: (motherId, id, approve, note, headId, copy) =>
      tell(motherId, rpc("decide_daughter_request", { p_request: id, p_approve: approve, p_note: trim(note), p_head: headId || null, p_copy: copy || null })),
    requests: (motherId) => run(db().from("coven_daughter_requests").select("*").eq("mother_coven_id", motherId).order("created_at", { ascending: false }).limit(50)).catch(() => []),
    myRequests: (motherId, userId) =>
      run(db().from("coven_daughter_requests").select("*").eq("mother_coven_id", motherId).eq("requested_by", userId).order("created_at", { ascending: false }).limit(5)).catch(() => []),
    founders: (covenId) => run(db().from("coven_daughter_founders").select("user_id").eq("coven_id", covenId)).catch(() => []),
    setFounder: (covenId, userId, on) => rpc("set_coven_daughter_founder", { p_coven: covenId, p_user: userId, p_enabled: on }),
    setRankFounds: (rankId, on) => run(db().from("coven_ranks").update({ can_found_daughter: on }).eq("id", rankId)),

    setShared: (covenId, kind, itemId, shared) => rpc("set_coven_shared_with_daughters", { p_coven: covenId, p_kind: kind, p_item: itemId, p_shared: shared }),
    shareables,
    motherLibrary: (daughterId) => rpc("coven_mother_library", { p_daughter: daughterId }).catch(() => []),
    copyFromMother: (daughterId, kind, itemId) => tell(daughterId, rpc("copy_from_mother_coven", { p_daughter: daughterId, p_kind: kind, p_item: itemId })),
    pushPreview: (daughterId, kind, itemId) => rpc("coven_push_preview", { p_daughter: daughterId, p_kind: kind, p_item: itemId }),
    push: (daughterId, kind, itemId) => tell(daughterId, rpc("push_to_daughter_coven", { p_daughter: daughterId, p_kind: kind, p_item: itemId })),

    release: (daughterId, note) => tell(daughterId, rpc("release_daughter_coven", { p_daughter: daughterId, p_note: trim(note) })),
    askRelease: (daughterId, note) => tell(daughterId, rpc("ask_to_release_daughter_coven", { p_daughter: daughterId, p_note: trim(note) })),
    decideRelease: (daughterId, id, approve, note) => tell(daughterId, rpc("decide_release_request", { p_request: id, p_approve: approve, p_note: trim(note) })),

    /** Hand on leadership, choosing what the head who steps back keeps (transfer_coven before the migration). */
    async handOn(covenId, userId, oldHead, stepTo) {
      const result = await rpc("hand_on_coven", { p_coven: covenId, p_user: userId, p_old: oldHead, p_old_rank: oldHead === "step_down" ? stepTo : null }).catch((error) => {
        if (!/hand_on_coven/.test(error?.message || "")) throw error;
        return rpc("transfer_coven", { p_coven: covenId, p_user: userId });
      });
      notifyLeadership(covenId);
      notifyLineage(covenId);
      return result;
    },
    succession: (covenId) => run(db().from("coven_succession").select("*").eq("coven_id", covenId).maybeSingle()).catch(() => null),
    setSuccessors: (covenId, first, second) => tell(covenId, rpc("set_coven_successors", { p_coven: covenId, p_first: first || null, p_second: second || null }), "leadership"),
    reportHead: (covenId, note) => rpc("report_coven_head_unreachable", { p_coven: covenId, p_note: trim(note) }),
    myHeadReport: (covenId, userId) =>
      run(db().from("coven_head_reports").select("id,status,created_at").eq("coven_id", covenId).eq("reported_by", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()).catch(() => null),
    headReports: () => rpc("coven_head_reports_queue", {}),
    async resolveHeadReport(report, transferTo, note) {
      const result = await rpc("resolve_coven_head_report", { p_report: report.id, p_transfer_to: transferTo || null, p_note: trim(note) });
      if (transferTo) notifyLeadership(report.coven.id);
      return result;
    }
  };
})(window);
