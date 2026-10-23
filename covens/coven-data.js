/*
 * Covens: every read and write the coven pages make, in one place.
 * Needs window.db (js/supabase-config.js). Each call throws on failure with
 * the database's own words; pages show them through CovenLogic.errorMessage.
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

  const COVEN_FIELDS = "id,slug,name,tagline,description,tradition,tags,meeting_rhythm,timezone,joining,visibility,status,moderation_note,application_questions,altar_background,member_limit,founder_id,created_at,updated_at,member_count";

  const CovenData = {
    // --- people -------------------------------------------------------------
    async myProfile(userId) {
      if (!userId) return null;
      return run(db().from("coven_profiles").select("*").eq("user_id", userId).maybeSingle());
    },
    async saveProfile(userId, profile, existing) {
      const row = { display_name: profile.display_name, pronouns: profile.pronouns || null, bio: profile.bio || null };
      if (existing) return run(db().from("coven_profiles").update(row).eq("user_id", userId).select().single());
      return run(db().from("coven_profiles").insert({ ...row, user_id: userId, age_confirmed_at: new Date().toISOString(), guidelines_agreed_at: new Date().toISOString() }).select().single());
    },
    async profiles(userIds) {
      const ids = [...new Set((userIds || []).filter(Boolean))];
      if (!ids.length) return [];
      return run(db().from("coven_profiles").select("user_id,display_name,pronouns,bio").in("user_id", ids));
    },
    async mySiteRoles(userId) {
      if (!userId) return [];
      const rows = await run(db().from("user_roles").select("role").eq("user_id", userId));
      return (rows || []).map((r) => r.role);
    },
    async myBan(userId) {
      if (!userId) return null;
      return run(db().from("community_bans").select("*").eq("user_id", userId).maybeSingle());
    },
    async myBlocks(userId) {
      if (!userId) return [];
      const rows = await run(db().from("user_blocks").select("blocked_id").eq("blocker_id", userId));
      return (rows || []).map((r) => r.blocked_id);
    },
    block: (userId, blockedId) => run(db().from("user_blocks").insert({ blocker_id: userId, blocked_id: blockedId })),
    unblock: (userId, blockedId) => run(db().from("user_blocks").delete().eq("blocker_id", userId).eq("blocked_id", blockedId)),

    // --- covens -------------------------------------------------------------
    directory() {
      return run(db().from("covens").select(COVEN_FIELDS).eq("status", "active").eq("visibility", "listed").order("created_at", { ascending: false }).limit(500));
    },
    async myMemberships(userId) {
      if (!userId) return [];
      return run(db().from("coven_members").select(`coven_id,status,rank_id,covens(${COVEN_FIELDS})`).eq("user_id", userId).eq("status", "active"));
    },
    async myApplications(userId) {
      if (!userId) return [];
      return run(db().from("coven_applications").select("id,coven_id,status,created_at,decided_at,reviewer_note,covens(name,slug)").eq("user_id", userId).order("created_at", { ascending: false }).limit(50));
    },
    coven: (slug) => run(db().from("covens").select(COVEN_FIELDS).eq("slug", slug).maybeSingle()),
    createCoven: (draft) =>
      rpc("create_coven", {
        p_name: draft.name,
        p_slug: draft.slug,
        p_tagline: draft.tagline || null,
        p_description: draft.description || null,
        p_tradition: draft.tradition || null,
        p_tags: draft.tags || [],
        p_joining: draft.joining,
        p_visibility: draft.visibility,
        p_meeting_rhythm: draft.meeting_rhythm || null,
        p_founder_rank: draft.founder_rank || null
      }),
    updateCoven: (id, changes) => run(db().from("covens").update(changes).eq("id", id).select(COVEN_FIELDS).single()),
    ranks: (covenId) => run(db().from("coven_ranks").select("*").eq("coven_id", covenId).order("level", { ascending: true })),
    saveRank: (rank) => (rank.id ? run(db().from("coven_ranks").update(rank).eq("id", rank.id).select().single()) : run(db().from("coven_ranks").insert(rank).select().single())),
    deleteRank: (id) => run(db().from("coven_ranks").delete().eq("id", id)),
    documents: (covenId) => run(db().from("coven_documents").select("*").eq("coven_id", covenId).order("position", { ascending: true })),
    saveDocument: (doc) => (doc.id ? run(db().from("coven_documents").update(doc).eq("id", doc.id).select().single()) : run(db().from("coven_documents").insert(doc).select().single())),
    deleteDocument: (id) => run(db().from("coven_documents").delete().eq("id", id)),
    async mySignatures(covenId, userId) {
      if (!userId) return [];
      return run(db().from("coven_signatures").select("document_id,version,user_id,signed_at").eq("coven_id", covenId).eq("user_id", userId));
    },
    covenSignatures: (covenId) => run(db().from("coven_signatures").select("document_id,version,user_id,signed_name,signed_at").eq("coven_id", covenId)),
    sign: (documentId, signedName) => run(db().from("coven_signatures").insert({ document_id: documentId, signed_name: signedName }).select().single()),

    // --- membership ---------------------------------------------------------
    async membership(covenId, userId) {
      if (!userId) return null;
      return run(db().from("coven_members").select("*").eq("coven_id", covenId).eq("user_id", userId).maybeSingle());
    },
    members: (covenId) => run(db().from("coven_members").select("*").eq("coven_id", covenId).order("joined_at", { ascending: true })),
    join: (covenId) => rpc("join_coven", { p_coven: covenId }),
    apply: (covenId, answers, message) => rpc("apply_to_coven", { p_coven: covenId, p_answers: answers, p_message: message || null }),
    withdraw: (kind, id) => rpc("withdraw_coven_request", { p_kind: kind, p_id: id }),
    leave: (covenId) => rpc("leave_coven", { p_coven: covenId }),
    transfer: (covenId, userId) => rpc("transfer_coven", { p_coven: covenId, p_user: userId }),
    updateMember: (covenId, userId, changes) =>
      rpc("update_coven_member", {
        p_coven: covenId,
        p_user: userId,
        p_rank: changes.rank_id || null,
        p_status: changes.status || null,
        p_muted_until: changes.muted_until || null,
        p_clear_mute: Boolean(changes.clear_mute)
      }),
    async myCovenApplication(covenId, userId) {
      if (!userId) return null;
      const rows = await run(db().from("coven_applications").select("*").eq("coven_id", covenId).eq("user_id", userId).order("created_at", { ascending: false }).limit(1));
      return rows?.[0] || null;
    },
    applications: (covenId, status = "pending") => {
      let query = db().from("coven_applications").select("*").eq("coven_id", covenId).order("created_at", { ascending: status === "pending" }).limit(100);
      if (status !== "all") query = query.eq("status", status);
      return run(query);
    },
    decideApplication: (id, approve, note) => rpc("decide_coven_application", { p_application: id, p_approve: approve, p_note: note || null }),
    async myAdvancements(covenId, userId) {
      if (!userId) return [];
      return run(db().from("coven_advancement_requests").select("*").eq("coven_id", covenId).eq("user_id", userId).order("created_at", { ascending: false }).limit(20));
    },
    advancements: (covenId) => run(db().from("coven_advancement_requests").select("*").eq("coven_id", covenId).eq("status", "pending").order("created_at", { ascending: true })),
    requestAdvancement: (covenId, rankId, statement) => rpc("request_coven_advancement", { p_coven: covenId, p_rank: rankId, p_statement: statement || null }),
    decideAdvancement: (id, approve, note) => rpc("decide_coven_advancement", { p_request: id, p_approve: approve, p_note: note || null }),

    // --- gathering ----------------------------------------------------------
    async recentMessages(covenId, limit = 150) {
      const rows = await run(db().from("coven_messages").select("*").eq("coven_id", covenId).order("created_at", { ascending: false }).limit(limit));
      return (rows || []).reverse();
    },
    olderMessages: async (covenId, before, limit = 100) => {
      const rows = await run(db().from("coven_messages").select("*").eq("coven_id", covenId).lt("created_at", before).order("created_at", { ascending: false }).limit(limit));
      return (rows || []).reverse();
    },
    send: (covenId, body, replyTo) => run(db().from("coven_messages").insert({ coven_id: covenId, body, reply_to: replyTo || null }).select().single()),
    editMessage: (id, body) => rpc("edit_coven_message", { p_message: id, p_body: body }),
    removeMessage: (id) => rpc("remove_coven_message", { p_message: id }),

    altarItems: (covenId) => run(db().from("coven_altar_items").select("*").eq("coven_id", covenId).order("z", { ascending: true })),
    placeOnAltar: (item) => run(db().from("coven_altar_items").insert(item).select().single()),
    tendAltarItem: (id, changes) => run(db().from("coven_altar_items").update(changes).eq("id", id).select().single()),
    clearAltarItem: (id) => run(db().from("coven_altar_items").delete().eq("id", id)),

    /**
     * Live updates for one coven: chat messages, altar items and rituals as
     * they change, and who else is here. Returns { track(state), close() }.
     */
    live(covenId, { onMessage, onAltar, onRitual, onPresence, onStatus } = {}) {
      const channel = db().channel(`coven:${covenId}`, { config: { presence: { key: global.getCurrentSaltUser?.()?.id || "guest" } } });
      if (onMessage) channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_messages", filter: `coven_id=eq.${covenId}` }, onMessage);
      if (onAltar) {
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_altar_items", filter: `coven_id=eq.${covenId}` }, onAltar);
        // Deletes can't be filtered by coven; the page ignores ids it doesn't hold.
        channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "coven_altar_items" }, onAltar);
      }
      if (onRitual) {
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_rituals", filter: `coven_id=eq.${covenId}` }, (change) => onRitual("ritual", change));
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_ritual_steps", filter: `coven_id=eq.${covenId}` }, (change) => onRitual("step", change));
        // As with the altar, deletes can't be filtered; ids this page doesn't hold are ignored.
        channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "coven_rituals" }, (change) => onRitual("ritual", change));
        channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "coven_ritual_steps" }, (change) => onRitual("step", change));
      }
      if (onPresence) channel.on("presence", { event: "sync" }, () => onPresence(channel.presenceState()));
      let tracked = null;
      channel.subscribe((status) => {
        onStatus?.(status);
        if (status === "SUBSCRIBED" && tracked) channel.track(tracked);
      });
      return {
        track(state) {
          tracked = state;
          return channel.track(state).catch(() => {});
        },
        close() {
          db().removeChannel(channel);
        }
      };
    },

    // --- coven rituals --------------------------------------------------------
    rituals: (covenId) => run(db().from("coven_rituals").select("*").eq("coven_id", covenId).order("created_at", { ascending: false }).limit(200)),
    async ritualSteps(ritualIds) {
      const ids = [...new Set((ritualIds || []).filter(Boolean))];
      if (!ids.length) return [];
      return run(db().from("coven_ritual_steps").select("*").in("ritual_id", ids).order("position", { ascending: true }));
    },
    saveRitual: (covenId, ritualId, ritual, steps) => rpc("save_coven_ritual", { p_coven: covenId, p_ritual_id: ritualId || null, p_ritual: ritual, p_steps: steps }),
    startRitual: (ritualId) => rpc("start_coven_ritual", { p_ritual: ritualId }),
    finishStep: (stepId) => rpc("finish_coven_ritual_step", { p_step: stepId }),
    goToStep: (ritualId, stepId) => rpc("go_to_coven_ritual_step", { p_ritual: ritualId, p_step: stepId || null }),
    setRitualStatus: (ritualId, status) => rpc("set_coven_ritual_status", { p_ritual: ritualId, p_status: status }),
    /** Your own saved rituals (the Rituals planner's templates), to start a coven ritual from. */
    async myRitualTemplates(userId) {
      if (!userId) return [];
      return run(db().from("ritual_templates").select("id,title,intention,description").eq("user_id", userId).order("updated_at", { ascending: false }).limit(100));
    },
    templateSteps: (templateId) => run(db().from("ritual_template_steps").select("title,instructions,spoken_text,duration_seconds,sort_order").eq("template_id", templateId).order("sort_order", { ascending: true })),

    // --- safety -------------------------------------------------------------
    report: (report) => run(db().from("coven_reports").insert({ ...report, reporter_id: global.getCurrentSaltUser?.()?.id })),

    // --- site moderation ----------------------------------------------------
    allCovens: () => run(db().from("covens").select(COVEN_FIELDS).order("created_at", { ascending: false }).limit(1000)),
    reports: (status) => {
      let query = db().from("coven_reports").select("*, covens(name,slug)").order("created_at", { ascending: false }).limit(200);
      if (status && status !== "all") query = query.eq("status", status);
      return run(query);
    },
    resolveReport: (id, status, note) => run(db().from("coven_reports").update({ status, resolution_note: note || null, resolved_by: global.getCurrentSaltUser?.()?.id, resolved_at: status === "open" || status === "reviewing" ? null : new Date().toISOString() }).eq("id", id)),
    moderateCoven: (id, status, note) => rpc("moderate_coven", { p_coven: id, p_status: status, p_note: note || null }),
    bans: () => run(db().from("community_bans").select("*").order("created_at", { ascending: false })),
    ban: (userId, reason) => run(db().from("community_bans").insert({ user_id: userId, reason: reason || null, banned_by: global.getCurrentSaltUser?.()?.id })),
    liftBan: (userId) => run(db().from("community_bans").delete().eq("user_id", userId)),
    moderators: () => rpc("list_community_moderators", {}),
    setModerator: (email, enabled) => rpc("set_community_moderator", { p_email: email, p_enabled: enabled })
  };

  global.CovenData = CovenData;
})(window);
