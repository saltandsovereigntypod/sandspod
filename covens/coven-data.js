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

  const COVEN_FIELDS = "id,slug,name,tagline,description,tradition,tags,meeting_rhythm,timezone,joining,visibility,status,moderation_note,application_questions,altar_background,member_limit,practice_traditions,practice_holidays,practice_custom,practice_calendars,founder_id,created_at,updated_at,member_count";

  const ALTAR_FIELDS = "id,coven_id,name,is_main,edit_mode,locked,background,background_name,groups,active_group_id,extra,archived_at,created_by,updated_by,created_at,updated_at";

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
      const rows = await run(db().from("coven_messages").select("*").eq("coven_id", covenId).is("conversation_id", null).order("created_at", { ascending: false }).limit(limit));
      return (rows || []).reverse();
    },
    olderMessages: async (covenId, before, limit = 100) => {
      const rows = await run(db().from("coven_messages").select("*").eq("coven_id", covenId).is("conversation_id", null).lt("created_at", before).order("created_at", { ascending: false }).limit(limit));
      return (rows || []).reverse();
    },
    /** Send to the coven's chat (or a conversation), then let the others' phones know, as the app does (best effort). */
    async send(covenId, body, replyTo, conversationId) {
      const row = await run(db().from("coven_messages").insert({ coven_id: covenId, conversation_id: conversationId || null, body, reply_to: replyTo || null }).select().single());
      try {
        Promise.resolve(db().functions?.invoke?.("coven-notify", { body: { message_id: row.id } })).catch(() => {});
      } catch {
        // Phones hear about it another time; the message is sent.
      }
      return row;
    },

    // --- conversations: one-to-one chats and groups inside a coven (app/src/lib/covens/chat.ts) ---
    async conversations(covenId) {
      const [conversations, members] = await Promise.all([
        run(db().from("coven_conversations").select("*").eq("coven_id", covenId).order("last_message_at", { ascending: false, nullsFirst: false })),
        run(db().from("coven_conversation_members").select("conversation_id,coven_id,user_id,left_at,muted,last_read_at").eq("coven_id", covenId))
      ]);
      return { conversations: conversations || [], members: members || [] };
    },
    async thread(covenId, conversationId, limit = 200) {
      let query = db().from("coven_messages").select("*").eq("coven_id", covenId).order("created_at", { ascending: false }).limit(limit);
      query = conversationId ? query.eq("conversation_id", conversationId) : query.is("conversation_id", null);
      return ((await run(query)) || []).reverse();
    },
    async latestMessage(covenId, conversationId) {
      let query = db().from("coven_messages").select("*").eq("coven_id", covenId).order("created_at", { ascending: false }).limit(1);
      query = conversationId ? query.eq("conversation_id", conversationId) : query.is("conversation_id", null);
      return ((await run(query)) || [])[0] || null;
    },
    async unreadSince(covenId, conversationId, userId, since) {
      let query = db().from("coven_messages").select("id", { count: "exact", head: true }).eq("coven_id", covenId).gt("created_at", since).neq("user_id", userId).is("deleted_at", null);
      query = conversationId ? query.eq("conversation_id", conversationId) : query.is("conversation_id", null);
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    openDirect: (covenId, userId) => rpc("coven_open_direct", { p_coven: covenId, p_user: userId }),
    createGroup: (covenId, name, userIds) => rpc("coven_create_group", { p_coven: covenId, p_name: name, p_users: userIds }),
    addToGroup: (conversationId, userIds) => rpc("coven_add_to_group", { p_conversation: conversationId, p_users: userIds }),
    leaveConversation: (conversationId) => rpc("coven_leave_conversation", { p_conversation: conversationId }),
    muteConversation: (conversationId, muted) => rpc("coven_set_conversation", { p_conversation: conversationId, p_muted: muted, p_read: false }),
    markConversationRead: (conversationId) => rpc("coven_set_conversation", { p_conversation: conversationId, p_muted: null, p_read: true }),
    editMessage: (id, body) => rpc("edit_coven_message", { p_message: id, p_body: body }),
    removeMessage: (id) => rpc("remove_coven_message", { p_message: id }),

    // --- coven altars: whole altars, shared (20261028000000_coven_altars.sql; app/src/lib/covens/altarSync.ts) ---
    ALTAR_FIELDS,
    altars: (covenId) => run(db().from("coven_altars").select(ALTAR_FIELDS).eq("coven_id", covenId).order("created_at", { ascending: false })),
    altar: (altarId) => run(db().from("coven_altars").select(ALTAR_FIELDS).eq("id", altarId).maybeSingle()),
    altarObjects: (altarId) => run(db().from("coven_altar_objects").select("altar_id,object_key,coven_id,position,data,updated_by").eq("altar_id", altarId)),
    async altarCounts(covenId) {
      const rows = await run(db().from("coven_altar_objects").select("altar_id").eq("coven_id", covenId).limit(10000));
      const counts = {};
      (rows || []).forEach((r) => (counts[r.altar_id] = (counts[r.altar_id] || 0) + 1));
      return counts;
    },
    altarEditors: (altarId) => run(db().from("coven_altar_editors").select("id,altar_id,coven_id,user_id,rank_id,active").eq("altar_id", altarId)),
    createAltar: (covenId, name, editMode) => rpc("create_coven_altar", { p_coven: covenId, p_name: name, p_edit_mode: editMode }),
    setAltar: (altarId, name, editMode, locked) => rpc("set_coven_altar", { p_altar: altarId, p_name: name, p_edit_mode: editMode, p_locked: locked }),
    setAltarEditor: (altarId, who, enabled) => rpc("set_coven_altar_editor", { p_altar: altarId, p_user: who.userId || null, p_rank: who.rankId || null, p_enabled: enabled }),
    archiveAltar: (altarId, archived) => rpc("archive_coven_altar", { p_altar: altarId, p_archived: archived }),
    altarAccess: (altarId) => rpc("coven_altar_access", { p_altar: altarId }),
    setRitualAltar: (ritualId, altarId, access) => rpc("set_coven_ritual_altar", { p_ritual: ritualId, p_altar: altarId || null, p_access: access || null }),
    /** Write what changed on an altar: the scene to coven_altars, each object to its own row (altarSync.ts write). */
    async writeAltarChanges(altar, changes, positions, objects) {
      let top = Math.max(0, ...positions.values());
      for (const change of changes) {
        if (change.kind === "scene") {
          await run(db().from("coven_altars").update({ background: change.scene.background, background_name: change.scene.backgroundName, groups: change.scene.groups, active_group_id: change.scene.activeGroupId, extra: change.scene.extra }).eq("id", altar.id));
        } else if (change.data == null) {
          await run(db().from("coven_altar_objects").delete().eq("altar_id", altar.id).eq("object_key", change.key));
          positions.delete(change.key);
        } else {
          let position = positions.get(change.key);
          if (position == null) {
            // New things go on top of what's there, in the order they sit on the altar.
            const index = objects.findIndex((o) => String(o.altarObjectId || "") === change.key);
            position = Math.max(top + 1, index);
            top = position;
            positions.set(change.key, position);
          }
          await run(db().from("coven_altar_objects").upsert({ altar_id: altar.id, object_key: change.key, coven_id: altar.coven_id, position, data: change.data }, { onConflict: "altar_id,object_key" }));
        }
      }
    },
    /** Load an altar, change it with one of the app's pure functions, and save what changed (a ritual step, a petition). */
    async changeAltarOnce(altarId, change) {
      const A = global.SaltCore?.altar?.covenAltar;
      if (!A) throw new Error("The altar’s tools didn’t load. Please refresh the page.");
      const [altar, rows] = await Promise.all([CovenData.altar(altarId), CovenData.altarObjects(altarId)]);
      if (!altar) throw new Error("That altar was not found.");
      const doc = A.documentFromRows(altar, rows || []);
      const saved = new Map(doc.objects.map((o) => [A.keyOf(o), JSON.stringify(o)]));
      const positions = new Map((rows || []).map((r) => [r.object_key, r.position]));
      const next = A.keyed(change(doc));
      await CovenData.writeAltarChanges(altar, A.diff(next, saved, JSON.stringify(A.sceneOf(doc))), positions, next.objects);
    },

    /**
     * Live updates for one coven: chat messages, its altars and rituals as
     * they change, and who else is here. Returns { track(state), close() }.
     */
    live(covenId, { onMessage, onAltar, onRitual, onPetition, onPresence, onStatus } = {}) {
      const channel = db().channel(`coven:${covenId}`, { config: { presence: { key: global.getCurrentSaltUser?.()?.id || "guest" } } });
      // The coven's chat and your conversations (row-level security sends only what you may read).
      if (onMessage) channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_messages", filter: `coven_id=eq.${covenId}` }, onMessage);
      if (onAltar) {
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_altars", filter: `coven_id=eq.${covenId}` }, onAltar);
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_altar_objects", filter: `coven_id=eq.${covenId}` }, onAltar);
      }
      if (onRitual) {
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_rituals", filter: `coven_id=eq.${covenId}` }, (change) => onRitual("ritual", change));
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_ritual_steps", filter: `coven_id=eq.${covenId}` }, (change) => onRitual("step", change));
        // As with the altar, deletes can't be filtered; ids this page doesn't hold are ignored.
        channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "coven_rituals" }, (change) => onRitual("ritual", change));
        channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "coven_ritual_steps" }, (change) => onRitual("step", change));
        channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_ritual_rsvps", filter: `coven_id=eq.${covenId}` }, (change) => onRitual("rsvp", change));
        channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "coven_ritual_step_marks", filter: `coven_id=eq.${covenId}` }, (change) => onRitual("mark", change));
      }
      if (onPetition) channel.on("postgres_changes", { event: "*", schema: "public", table: "coven_petitions", filter: `coven_id=eq.${covenId}` }, onPetition);
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
    /** Active members, and whether each can be given a ritual part (signed the current agreements). */
    ritualPeople: (covenId) => rpc("coven_ritual_people", { p_coven: covenId }),
    startRitual: (ritualId) => rpc("start_coven_ritual", { p_ritual: ritualId }),
    finishStep: (stepId) => rpc("finish_coven_ritual_step", { p_step: stepId }),
    goToStep: (ritualId, stepId) => rpc("go_to_coven_ritual_step", { p_ritual: ritualId, p_step: stepId || null }),
    setRitualStatus: (ritualId, status) => rpc("set_coven_ritual_status", { p_ritual: ritualId, p_status: status }),
    async rsvps(ritualIds) {
      const ids = [...new Set((ritualIds || []).filter(Boolean))];
      if (!ids.length) return [];
      return run(db().from("coven_ritual_rsvps").select("*").in("ritual_id", ids));
    },
    rsvp: (ritualId, response) => rpc("rsvp_coven_ritual", { p_ritual: ritualId, p_response: response }),
    async stepMarks(ritualId) {
      if (!ritualId) return [];
      return run(db().from("coven_ritual_step_marks").select("*").eq("ritual_id", ritualId));
    },
    performStepAction: (stepId) => rpc("perform_coven_step_action", { p_step: stepId }),

    // --- the coven's Book of Shadows -------------------------------------------
    bookPages: (covenId) => run(db().from("coven_book_pages").select("*").eq("coven_id", covenId).order("title", { ascending: true }).limit(500)),
    bookDrafts: (covenId) => run(db().from("coven_book_drafts").select("*").eq("coven_id", covenId).neq("status", "published").order("updated_at", { ascending: false }).limit(200)),
    saveBookDraft: (covenId, draftId, pageId, fields, submit) =>
      rpc("save_coven_book_draft", { p_coven: covenId, p_draft: draftId || null, p_page: pageId || null, p_title: fields.title, p_section: fields.section || null, p_body: fields.body || "", p_submit: Boolean(submit) }),
    reviewBookDraft: (draftId, approve, note) => rpc("review_coven_book_draft", { p_draft: draftId, p_approve: approve, p_note: note || null }),
    removeBookEntry: (kind, id) => rpc("remove_coven_book_entry", { p_kind: kind, p_id: id }),

    // --- petitions ---------------------------------------------------------------
    petitions: (covenId) => run(db().from("coven_petitions").select("*").eq("coven_id", covenId).order("created_at", { ascending: false }).limit(100)),
    async petitionTendings(petitionIds) {
      const ids = [...new Set((petitionIds || []).filter(Boolean))];
      if (!ids.length) return [];
      return run(db().from("coven_petition_tendings").select("*").in("petition_id", ids).order("created_at", { ascending: false }).limit(1000));
    },
    askPetition: (covenId, title, body, color) => rpc("ask_coven_petition", { p_coven: covenId, p_title: title, p_body: body || null, p_color: color || "white" }),
    tendPetition: (petitionId, note) => rpc("tend_coven_petition", { p_petition: petitionId, p_note: note || null }),
    closePetition: (petitionId, status, note) => rpc("close_coven_petition", { p_petition: petitionId, p_status: status, p_note: note || null }),

    /** Your own saved rituals (the Rituals planner's templates), to start a coven ritual from. */
    async myRitualTemplates(userId) {
      if (!userId) return [];
      return run(db().from("ritual_templates").select("id,title,intention,description").eq("user_id", userId).order("updated_at", { ascending: false }).limit(100));
    },
    templateSteps: (templateId) => run(db().from("ritual_template_steps").select("title,instructions,spoken_text,duration_seconds,sort_order").eq("template_id", templateId).order("sort_order", { ascending: true })),

    // --- initiation and training ----------------------------------------------
    grants: (covenId) => run(db().from("coven_grants").select("coven_id,user_id,power").eq("coven_id", covenId)),
    setGrant: (covenId, userId, power, enabled) => rpc("set_coven_grant", { p_coven: covenId, p_user: userId, p_power: power, p_enabled: enabled }),
    mentors: (covenId) => run(db().from("coven_mentors").select("coven_id,user_id,mentor_id,assigned_at").eq("coven_id", covenId)),
    setMentor: (covenId, userId, mentorId) => rpc("set_coven_mentor", { p_coven: covenId, p_user: userId, p_mentor: mentorId || null }),
    programs: (covenId) => run(db().from("coven_programs").select("*").eq("coven_id", covenId).order("position", { ascending: true })),
    async programStages(programIds) {
      if (!programIds.length) return [];
      return run(db().from("coven_program_stages").select("*").in("program_id", programIds).order("position", { ascending: true }));
    },
    async programTasks(programIds) {
      if (!programIds.length) return [];
      return run(db().from("coven_program_tasks").select("*").in("program_id", programIds).order("position", { ascending: true }));
    },
    programTemplates: () => run(db().from("coven_program_templates").select("*").order("position", { ascending: true })),
    copyProgramTemplate: (covenId, templateId) => rpc("copy_coven_program_template", { p_coven: covenId, p_template: templateId }),
    saveProgram: (covenId, programId, program, stages) => rpc("save_coven_program", { p_coven: covenId, p_program_id: programId || null, p_program: program, p_stages: stages }),
    setProgramStatus: (programId, status) => rpc("set_coven_program_status", { p_program: programId, p_status: status }),
    programAssignments: (covenId) => run(db().from("coven_program_assignments").select("*").eq("coven_id", covenId)),
    assignProgram: (programId, userId, rankId) => rpc("assign_coven_program", { p_program: programId, p_user: userId || null, p_rank: rankId || null }),
    unassignProgram: (assignmentId) => rpc("unassign_coven_program", { p_assignment: assignmentId }),
    startProgram: (programId) => rpc("start_coven_program", { p_program: programId }),
    /** Enrollments this person may see: their own, their mentees', or everyone's with "sees progress". */
    enrollments: (covenId) => run(db().from("coven_program_enrollments").select("*").eq("coven_id", covenId).order("started_at", { ascending: true }).limit(1000)),
    progress: (covenId) => run(db().from("coven_program_progress").select("*").eq("coven_id", covenId).limit(5000)),
    stagePasses: (covenId) => run(db().from("coven_program_stage_passes").select("*").eq("coven_id", covenId).limit(2000)),
    recordTask: (enrollmentId, taskId, response, count) => rpc("record_coven_task", { p_enrollment: enrollmentId, p_task: taskId, p_response: response || null, p_count: count ?? 1 }),
    checkTask: (progressId, approve, feedback) => rpc("check_coven_task", { p_progress: progressId, p_approve: approve, p_feedback: feedback || null }),
    passStage: (enrollmentId, note, override) => rpc("pass_coven_stage", { p_enrollment: enrollmentId, p_note: note || null, p_override: Boolean(override) }),
    setEnrollmentStatus: (enrollmentId, status) => rpc("set_coven_enrollment_status", { p_enrollment: enrollmentId, p_status: status }),

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
