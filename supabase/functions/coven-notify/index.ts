import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { answerNote, bookAnswerNote, bookNote, isFresh, requestNote, reviewersOf, wantsNotice, type Note } from "./requests.ts";
import { cleanNote, gatheringEvent, gatheringNote, manualEvent, validZone, wantsGathering, type SentNotice } from "./gatherings.ts";
import { acceptedNote, invitedNote, wantsInvitation } from "./invitations.ts";
import { trainingNote, wantsTraining } from "./training.ts";

// Phone notifications for covens: a new message, a new application or
// request to advance, and the answer to one; a personal invitation, and its
// acceptance.
//
// { message_id }: the app calls this right after sending one; it checks the caller wrote it, then
// sends it to everyone who should hear about it through Expo's push service:
// for the coven's chat, its active members who want coven chat notifications;
// for a conversation, the others in it who haven't muted it and want
// conversation notifications. No one hears from someone they've blocked, and
// devices Expo says are gone are signed off.
//
// { application_id } or { advancement_id }: called by whoever just asked
// (apply_to_coven, request_coven_advancement), it tells the coven's
// reviewers (requests.ts reviewersOf), never the one who asked; called by
// the reviewer who just decided it, it tells the one who asked. Each rings
// once (coven_request_notices, when that table exists), only while fresh,
// and only for those whose Reminders choices want it (requests.ts wantsNotice).
//
// { grimoire_submission_id }: a suggestion for a coven's Book of Shadows
// (supabase/migrations/20261106000000_coven_grimoire.sql). Called by whoever
// just sent it, it tells those who approve that part of the book
// (coven_grimoire_submission_approvers), never the sharer; called by the one
// who just decided it, it tells the sharer. Once each, while fresh, and only
// for those whose Reminders choices want coven requests.
//
// { invitation_id }: a personal coven invitation
// (supabase/migrations/20261109000000_coven_invitations.sql). Called by
// whoever just sent it, it tells the person invited ("You're invited to …");
// called by the person invited right after accepting it, it tells whoever
// sent it. Never to or from someone blocking the other. Once each
// (coven_request_notices, kind 'invitation'), while fresh, and only for those
// whose Reminders choices want invitations (invitations.ts wantsInvitation).
//
// { ritual_id, time_zone? }: a coven gathering (rite or meeting) was just
// saved, put on or taken off the calendar, or deleted. Called by whoever did
// it (someone who leads or schedules the coven's rituals), it works out what
// changed since the last note (gatherings.ts gatheringEvent) and tells those
// who should hear (public.coven_gathering_notice_recipients: the gathering's
// own choice, the coven's rules, else everyone it is for), never the caller,
// nor anyone who has blocked them (as for requests), and only those whose
// Reminders choices want coven gatherings. A move also reaches everyone told
// before; a cancellation only those who heard. Each note is claimed once
// (coven_gathering_notices). time_zone is the caller's, for the date's words
// when the coven has none.
//
// { ritual_id, manual: true, note?, who? }: "Send a notification" on a
// scheduled gathering's page, by those coven_gathering_may_send allows (those
// with 'notices', the coven's moderators and head, and whoever planned it).
// Its 'scheduled' note if it was never announced, else a reminder; the note
// (up to 200 characters) is a second line; who (WHO keys) changes who it goes
// to for this send only. One by hand per gathering each half hour (429).
//
// { program_thread_message_id }: a message on a step of a coven program
// (supabase/migrations/20261110000000_coven_courses.sql). Called by whoever
// just wrote it, it tells those who follow that step's conversation
// (public.coven_program_thread_people: the trainee, their mentor, whoever
// else has written, or else those who run the coven's programs), never the
// writer nor anyone blocking them, and only those whose "Training messages"
// choice wants it (training.ts wantsTraining). Once each (notified_at), while fresh.

const EXPO_PUSH = "https://exp.host/--/api/v2/push/send";

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply(405, { error: "method_not_allowed" });
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) return reply(401, { error: "authentication_required" });
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return reply(503, { error: "function_not_configured" });

  const verifier = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: authData, error: authError } = await verifier.auth.getUser();
  if (authError || !authData.user) return reply(401, { error: "session_expired" });
  const sender = authData.user.id;

  let messageId = "";
  let requestId = "";
  let requestKind: "application" | "advancement" = "application";
  let submissionId = "";
  let invitationId = "";
  let programMessageId = "";
  let ritualId = "";
  let timeZone = "";
  let manual: { note: string; who: string[] | null } | null = null;
  try {
    const payload = (await request.json()) || {};
    messageId = String(payload.message_id || "");
    if (payload.grimoire_submission_id) submissionId = String(payload.grimoire_submission_id);
    if (payload.invitation_id) invitationId = String(payload.invitation_id);
    if (payload.program_thread_message_id) programMessageId = String(payload.program_thread_message_id);
    if (payload.ritual_id) ritualId = String(payload.ritual_id);
    if (typeof payload.time_zone === "string") timeZone = payload.time_zone.slice(0, 64);
    if (payload.manual === true) {
      const who = Array.isArray(payload.who) ? payload.who.filter((k: unknown) => typeof k === "string").slice(0, 40).map((k: string) => k.slice(0, 80)) : null;
      manual = { note: cleanNote(payload.note), who: who && who.length ? who : null };
    }
    if (payload.application_id) requestId = String(payload.application_id);
    else if (payload.advancement_id) {
      requestId = String(payload.advancement_id);
      requestKind = "advancement";
    }
  } catch {
    return reply(400, { error: "bad_request" });
  }
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const admin = createClient(url, service, { auth: { persistSession: false } });
  if (ritualId) {
    if (!UUID.test(ritualId)) return reply(400, { error: "bad_request" });
    return covenGathering(admin, verifier, sender, ritualId, timeZone, manual);
  }
  if (programMessageId) {
    if (!UUID.test(programMessageId)) return reply(400, { error: "bad_request" });
    return covenTrainingMessage(admin, sender, programMessageId);
  }
  if (invitationId) {
    if (!UUID.test(invitationId)) return reply(400, { error: "bad_request" });
    return covenInvitation(admin, sender, invitationId);
  }
  if (submissionId) {
    if (!UUID.test(submissionId)) return reply(400, { error: "bad_request" });
    return bookSubmission(admin, sender, submissionId);
  }
  if (requestId) {
    if (!UUID.test(requestId)) return reply(400, { error: "bad_request" });
    return covenRequest(admin, sender, requestKind, requestId);
  }
  if (!UUID.test(messageId)) return reply(400, { error: "bad_request" });
  const { data: message } = await admin.from("coven_messages").select("id,coven_id,conversation_id,user_id,body,created_at,deleted_at").eq("id", messageId).maybeSingle();
  // Only the writer can ring the bell, once, for a fresh message.
  if (!message || message.user_id !== sender || message.deleted_at) return reply(404, { error: "not_found" });
  if (Date.now() - new Date(message.created_at).getTime() > 5 * 60 * 1000) return reply(409, { error: "too_old" });

  const [{ data: coven }, { data: profile }] = await Promise.all([
    admin.from("covens").select("name,slug").eq("id", message.coven_id).single(),
    admin.from("coven_profiles").select("display_name").eq("user_id", sender).maybeSingle(),
  ]);
  const who = profile?.display_name || "Someone";

  let recipients: string[] = [];
  let title = coven?.name || "Your coven";
  let wants: "notify_coven" | "notify_direct" = "notify_coven";
  if (message.conversation_id) {
    const [{ data: conversation }, { data: members }] = await Promise.all([
      admin.from("coven_conversations").select("kind,name").eq("id", message.conversation_id).single(),
      admin.from("coven_conversation_members").select("user_id,muted,left_at").eq("conversation_id", message.conversation_id),
    ]);
    recipients = (members || []).filter((m) => m.user_id !== sender && !m.muted && !m.left_at).map((m) => m.user_id);
    title = conversation?.kind === "group" ? `${conversation.name || "Group"} · ${coven?.name || "coven"}` : who;
    wants = "notify_direct";
  } else {
    const { data: members } = await admin.from("coven_members").select("user_id").eq("coven_id", message.coven_id).eq("status", "active");
    recipients = (members || []).map((m) => m.user_id).filter((id) => id !== sender);
  }
  if (!recipients.length) return reply(200, { sent: 0 });

  // Still active in the coven, not blocking the writer, and not turned off.
  const [{ data: active }, { data: blocks }, { data: settings }] = await Promise.all([
    admin.from("coven_members").select("user_id").eq("coven_id", message.coven_id).eq("status", "active").in("user_id", recipients),
    admin.from("user_blocks").select("blocker_id").eq("blocked_id", sender).in("blocker_id", recipients),
    admin.from("coven_chat_settings").select("user_id,notify_coven,notify_direct").eq("coven_id", message.coven_id).in("user_id", recipients),
  ]);
  const activeSet = new Set((active || []).map((m) => m.user_id));
  const blocking = new Set((blocks || []).map((b) => b.blocker_id));
  const off = new Set((settings || []).filter((s) => s[wants] === false).map((s) => s.user_id));
  const listeners = recipients.filter((id) => activeSet.has(id) && !blocking.has(id) && !off.has(id));
  if (!listeners.length) return reply(200, { sent: 0 });

  const { data: tokens } = await admin.from("push_tokens").select("token,user_id").in("user_id", listeners);
  if (!tokens?.length) return reply(200, { sent: 0 });

  const body = message.body.length > 180 ? `${message.body.slice(0, 177)}…` : message.body;
  const path = `/coven/c/${coven?.slug}/chat/${message.conversation_id || "coven"}`;
  const notes = tokens.map((t) => ({
    to: t.token,
    title,
    body: message.conversation_id && title === who ? body : `${who}: ${body}`,
    sound: "default",
    channelId: "coven-messages",
    threadId: message.conversation_id || message.coven_id,
    data: { source: "coven-chat", url: path, covenId: message.coven_id, conversationId: message.conversation_id },
  }));

  return reply(200, { sent: await push(admin, notes) });
});

type Push = { to: string; title: string; body: string; sound: string; channelId: string; threadId?: string; data: Record<string, unknown> };

/** Send through Expo, a hundred at a time; phones that no longer have the app stop being sent to. */
async function push(admin: SupabaseClient, notes: Push[]): Promise<number> {
  let sent = 0;
  const gone: string[] = [];
  for (let i = 0; i < notes.length; i += 100) {
    const batch = notes.slice(i, i + 100);
    const response = await fetch(EXPO_PUSH, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(batch),
    }).catch(() => null);
    if (!response?.ok) continue;
    const result = await response.json().catch(() => null);
    (result?.data || []).forEach((ticket: { status?: string; details?: { error?: string } }, j: number) => {
      if (ticket.status === "ok") sent += 1;
      else if (ticket.details?.error === "DeviceNotRegistered") gone.push(batch[j].to);
    });
  }
  if (gone.length) await admin.from("push_tokens").update({ user_id: null, updated_at: new Date().toISOString() }).in("token", gone);
  return sent;
}

/** A new application or request to advance (to the reviewers), or the answer to one (to the one who asked). */
async function covenRequest(admin: SupabaseClient, caller: string, kind: "application" | "advancement", id: string) {
  const table = kind === "application" ? "coven_applications" : "coven_advancement_requests";
  const fields = `id,coven_id,user_id,status,reviewer_id,reviewer_note,created_at,decided_at${kind === "advancement" ? ",rank_id" : ""}`;
  const { data: row } = await admin.from(table).select(fields).eq("id", id).maybeSingle();
  if (!row) return reply(404, { error: "not_found" });
  const r = row as unknown as { coven_id: string; user_id: string; status: string; reviewer_id: string | null; reviewer_note: string | null; created_at: string; decided_at: string | null; rank_id?: string };

  // Only the one who asked rings for a new request, and only the reviewer who decided it for the answer.
  let event: "new" | "answer";
  if (r.status === "pending" && r.user_id === caller) {
    if (!isFresh(r.created_at)) return reply(409, { error: "too_old" });
    event = "new";
  } else if ((r.status === "approved" || r.status === "declined") && r.reviewer_id === caller && r.user_id !== caller) {
    if (!isFresh(r.decided_at)) return reply(409, { error: "too_old" });
    event = "answer";
  } else return reply(404, { error: "not_found" });

  // Once each: the first call claims it. Before coven_request_notices exists, freshness alone limits it.
  const { error: claim } = await admin.from("coven_request_notices").insert({ request_kind: kind, request_id: id, event });
  if (claim?.code === "23505") return reply(409, { error: "already_sent" });

  const [{ data: coven }, { data: rank }] = await Promise.all([
    admin.from("covens").select("name,slug,status,founder_id").eq("id", r.coven_id).single(),
    r.rank_id ? admin.from("coven_ranks").select("name").eq("id", r.rank_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!coven) return reply(404, { error: "not_found" });
  const rankName = (rank as { name?: string } | null)?.name ?? null;

  let recipients: string[];
  let note: Note;
  let source: string;
  if (event === "new") {
    const [{ data: members }, { data: ranks }, { data: profile }] = await Promise.all([
      admin.from("coven_members").select("user_id,rank_id,status").eq("coven_id", r.coven_id).eq("status", "active"),
      admin.from("coven_ranks").select("id,can_review,can_manage").eq("coven_id", r.coven_id),
      admin.from("coven_profiles").select("display_name").eq("user_id", r.user_id).maybeSingle(),
    ]);
    // Never the one who asked, even when they could review.
    recipients = reviewersOf({ founderId: coven.founder_id, covenStatus: coven.status, members: members || [], ranks: ranks || [] }).filter((u) => u !== r.user_id);
    if (recipients.length) {
      const { data: blocks } = await admin.from("user_blocks").select("blocker_id").eq("blocked_id", r.user_id).in("blocker_id", recipients);
      const blocking = new Set((blocks || []).map((b) => b.blocker_id));
      recipients = recipients.filter((u) => !blocking.has(u));
    }
    note = requestNote({ kind, covenName: coven.name, covenSlug: coven.slug, who: profile?.display_name || "Someone", rankName });
    source = "coven-request";
  } else {
    recipients = [r.user_id];
    note = answerNote({ kind, approved: r.status === "approved", covenName: coven.name, covenSlug: coven.slug, rankName, note: r.reviewer_note });
    source = "coven-answer";
  }
  if (!recipients.length) return reply(200, { sent: 0 });

  // Their own choices (Reminders → Coven requests), saved with their settings.
  const { data: settings } = await admin.from("user_settings").select("user_id,reminders:settings->>reminders_v2").in("user_id", recipients);
  const saved = new Map((settings || []).map((s: { user_id: string; reminders: string | null }) => [s.user_id, s.reminders]));
  const now = new Date();
  const listeners = recipients.filter((u) => wantsNotice(saved.get(u) ?? null, event, r.coven_id, now));
  if (!listeners.length) return reply(200, { sent: 0 });

  const { data: tokens } = await admin.from("push_tokens").select("token,user_id").in("user_id", listeners);
  if (!tokens?.length) return reply(200, { sent: 0 });
  const notes: Push[] = tokens.map((t) => ({
    to: t.token,
    title: note.title,
    body: note.body,
    sound: "default",
    channelId: "coven-requests",
    threadId: `requests:${r.coven_id}`,
    data: { source, url: note.url, covenId: r.coven_id, kind, requestId: id },
  }));
  return reply(200, { sent: await push(admin, notes) });
}

/** A suggestion for a coven's Book (to those who approve it), or the answer to one (to whoever suggested it). */
async function bookSubmission(admin: SupabaseClient, caller: string, id: string) {
  const { data: row } = await admin
    .from("coven_grimoire_submissions")
    .select("id,coven_id,page_id,source_page_id,title,status,submitted_by,reviewer_id,reviewer_note,published_page_id,submitted_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!row) return reply(404, { error: "not_found" });
  const s = row as { coven_id: string; page_id: string | null; source_page_id: string | null; title: string; status: string; submitted_by: string; reviewer_id: string | null; reviewer_note: string | null; published_page_id: string | null; submitted_at: string | null; updated_at: string };

  // Only the sharer rings for a new one, and only the one who decided it for the answer.
  let event: "new" | "answer";
  if (s.status === "pending" && s.submitted_by === caller) {
    if (!isFresh(s.submitted_at)) return reply(409, { error: "too_old" });
    event = "new";
  } else if (["approved", "returned", "declined"].includes(s.status) && s.reviewer_id === caller && s.submitted_by !== caller) {
    if (!isFresh(s.updated_at)) return reply(409, { error: "too_old" });
    event = "answer";
  } else return reply(404, { error: "not_found" });

  // Once each (a page sent back and sent again rings again: its event key carries when).
  const claimEvent = event === "new" ? `new:${s.submitted_at}` : `${s.status}:${s.updated_at}`;
  const { error: claim } = await admin.from("coven_request_notices").insert({ request_kind: "grimoire_submission", request_id: id, event: claimEvent.slice(0, 60) });
  if (claim?.code === "23505") return reply(409, { error: "already_sent" });

  const { data: coven } = await admin.from("covens").select("name,slug,status").eq("id", s.coven_id).single();
  if (!coven || coven.status !== "active") return reply(404, { error: "not_found" });

  let recipients: string[];
  let note: Note;
  if (event === "new") {
    const [{ data: approvers }, { data: profile }] = await Promise.all([
      admin.rpc("coven_grimoire_submission_approvers", { p_submission: id }),
      admin.from("coven_profiles").select("display_name").eq("user_id", s.submitted_by).maybeSingle(),
    ]);
    recipients = [...new Set(((approvers as string[] | null) || []).map(String))].filter((u) => u !== s.submitted_by);
    if (recipients.length) {
      const { data: blocks } = await admin.from("user_blocks").select("blocker_id").eq("blocked_id", s.submitted_by).in("blocker_id", recipients);
      const blocking = new Set((blocks || []).map((b) => b.blocker_id));
      recipients = recipients.filter((u) => !blocking.has(u));
    }
    note = bookNote({ covenName: coven.name, covenSlug: coven.slug, who: profile?.display_name || "Someone", title: s.title, changes: !!s.page_id, shared: !!s.source_page_id });
  } else {
    recipients = [s.submitted_by];
    note = bookAnswerNote({ covenName: coven.name, covenSlug: coven.slug, title: s.title, status: s.status as "approved" | "returned" | "declined", note: s.reviewer_note, pageId: s.published_page_id });
  }
  if (!recipients.length) return reply(200, { sent: 0 });

  const { data: settings } = await admin.from("user_settings").select("user_id,reminders:settings->>reminders_v2").in("user_id", recipients);
  const saved = new Map((settings || []).map((x: { user_id: string; reminders: string | null }) => [x.user_id, x.reminders]));
  const now = new Date();
  const listeners = recipients.filter((u) => wantsNotice(saved.get(u) ?? null, event, s.coven_id, now));
  if (!listeners.length) return reply(200, { sent: 0 });

  const { data: tokens } = await admin.from("push_tokens").select("token,user_id").in("user_id", listeners);
  if (!tokens?.length) return reply(200, { sent: 0 });
  const notes: Push[] = tokens.map((t) => ({
    to: t.token,
    title: note.title,
    body: note.body,
    sound: "default",
    channelId: "coven-requests",
    threadId: `book:${s.coven_id}`,
    data: { source: event === "new" ? "coven-book" : "coven-book-answer", url: note.url, covenId: s.coven_id, submissionId: id },
  }));
  return reply(200, { sent: await push(admin, notes) });
}

/** A personal invitation (to the person invited), or its acceptance (to whoever sent it). */
async function covenInvitation(admin: SupabaseClient, caller: string, id: string) {
  const { data: row } = await admin.from("coven_invitations").select("id,coven_id,user_id,invited_by,message,status,created_at,decided_at").eq("id", id).maybeSingle();
  if (!row) return reply(404, { error: "not_found" });
  const inv = row as { coven_id: string; user_id: string; invited_by: string | null; message: string | null; status: string; created_at: string; decided_at: string | null };

  // Only the inviter rings for a new one, and only the person invited for its acceptance.
  let event: "new" | "answer";
  if (inv.status === "pending" && inv.invited_by === caller) {
    if (!isFresh(inv.created_at)) return reply(409, { error: "too_old" });
    event = "new";
  } else if (inv.status === "accepted" && inv.user_id === caller && inv.invited_by && inv.invited_by !== caller) {
    if (!isFresh(inv.decided_at)) return reply(409, { error: "too_old" });
    event = "answer";
  } else return reply(404, { error: "not_found" });
  const recipient = event === "new" ? inv.user_id : inv.invited_by!;

  const { error: claim } = await admin.from("coven_request_notices").insert({ request_kind: "invitation", request_id: id, event });
  if (claim?.code === "23505") return reply(409, { error: "already_sent" });

  const [{ data: coven }, { data: profile }, { data: blocks }] = await Promise.all([
    admin.from("covens").select("name,slug,status").eq("id", inv.coven_id).single(),
    admin.from("coven_profiles").select("display_name").eq("user_id", caller).maybeSingle(),
    admin.from("user_blocks").select("blocker_id").eq("blocker_id", recipient).eq("blocked_id", caller),
  ]);
  if (!coven || coven.status !== "active") return reply(404, { error: "not_found" });
  if (blocks?.length) return reply(200, { sent: 0 });

  // Their own choices (Notifications & reminders → Covens → Invitations), saved with their settings.
  const { data: settings } = await admin.from("user_settings").select("user_id,reminders:settings->>reminders_v2").eq("user_id", recipient).maybeSingle();
  if (!wantsInvitation((settings as { reminders: string | null } | null)?.reminders ?? null, event, new Date())) return reply(200, { sent: 0 });

  const { data: tokens } = await admin.from("push_tokens").select("token,user_id").eq("user_id", recipient);
  if (!tokens?.length) return reply(200, { sent: 0 });
  const who = profile?.display_name || "Someone";
  const note = event === "new"
    ? invitedNote({ covenName: coven.name, invitationId: id, who, message: inv.message })
    : acceptedNote({ covenName: coven.name, covenSlug: coven.slug, who });
  const notes: Push[] = tokens.map((t) => ({
    to: t.token,
    title: note.title,
    body: note.body,
    sound: "default",
    channelId: "coven-requests",
    threadId: `invitations:${inv.coven_id}`,
    data: { source: event === "new" ? "coven-invitation" : "coven-invitation-accepted", url: note.url, covenId: inv.coven_id, invitationId: id },
  }));
  return reply(200, { sent: await push(admin, notes) });
}

/** A message on a step of a coven program, to those who follow that step's conversation. */
async function covenTrainingMessage(admin: SupabaseClient, sender: string, id: string) {
  const { data: row, error } = await admin
    .from("coven_program_messages")
    .select("id,enrollment_id,task_id,coven_id,trainee_id,author_id,body,created_at,deleted_at,notified_at")
    .eq("id", id)
    .maybeSingle();
  // Before 20261110000000_coven_courses.sql there is nothing to send.
  if (error) return reply(503, { error: "not_ready" });
  const m = row as { enrollment_id: string; task_id: string; coven_id: string; trainee_id: string; author_id: string | null; body: string | null; created_at: string; deleted_at: string | null; notified_at: string | null } | null;
  // Only the writer rings, once, for a fresh message.
  if (!m || m.author_id !== sender || m.deleted_at || !m.body) return reply(404, { error: "not_found" });
  if (Date.now() - new Date(m.created_at).getTime() > 5 * 60 * 1000) return reply(409, { error: "too_old" });
  const { data: claimed } = await admin.from("coven_program_messages").update({ notified_at: new Date().toISOString() }).eq("id", id).is("notified_at", null).select("id");
  if (!claimed?.length) return reply(409, { error: "already_sent" });

  const [{ data: people }, { data: coven }, { data: task }, { data: enrollment }, { data: profile }] = await Promise.all([
    admin.rpc("coven_program_thread_people", { p_enrollment: m.enrollment_id, p_task: m.task_id }),
    admin.from("covens").select("name,slug,status").eq("id", m.coven_id).single(),
    admin.from("coven_program_tasks").select("title,program_id").eq("id", m.task_id).maybeSingle(),
    admin.from("coven_program_enrollments").select("program_id").eq("id", m.enrollment_id).maybeSingle(),
    admin.from("coven_profiles").select("display_name").eq("user_id", sender).maybeSingle(),
  ]);
  if (!coven || coven.status !== "active" || !task) return reply(404, { error: "not_found" });
  let recipients = [...new Set(((people as string[] | null) || []).map(String))].filter((u) => u !== sender);
  if (recipients.length) {
    const { data: blocks } = await admin.from("user_blocks").select("blocker_id").eq("blocked_id", sender).in("blocker_id", recipients);
    const blocking = new Set((blocks || []).map((b) => b.blocker_id));
    recipients = recipients.filter((u) => !blocking.has(u));
  }
  if (!recipients.length) return reply(200, { sent: 0 });

  // Their own choices (Notifications & reminders → Covens → Training messages), saved with their settings.
  const { data: settings } = await admin.from("user_settings").select("user_id,reminders:settings->>reminders_v2").in("user_id", recipients);
  const saved = new Map((settings || []).map((x: { user_id: string; reminders: string | null }) => [x.user_id, x.reminders]));
  const now = new Date();
  const listeners = recipients.filter((u) => wantsTraining(saved.get(u) ?? null, now));
  if (!listeners.length) return reply(200, { sent: 0 });

  const { data: tokens } = await admin.from("push_tokens").select("token,user_id").in("user_id", listeners);
  if (!tokens?.length) return reply(200, { sent: 0 });
  const who = profile?.display_name || "Someone";
  const programId = (enrollment as { program_id?: string } | null)?.program_id || task.program_id;
  const notes: Push[] = tokens.map((t) => {
    const note = trainingNote({ covenSlug: coven.slug, who, taskTitle: task.title, body: m.body!, programId, taskId: m.task_id, traineeId: m.trainee_id, toTrainee: t.user_id === m.trainee_id });
    return {
      to: t.token,
      title: note.title,
      body: note.body,
      sound: "default",
      channelId: "coven-messages",
      threadId: `training:${m.enrollment_id}:${m.task_id}`,
      data: { source: "coven-training", url: note.url, covenId: m.coven_id, enrollmentId: m.enrollment_id, taskId: m.task_id },
    };
  });
  return reply(200, { sent: await push(admin, notes) });
}

/** A gathering put on the calendar, moved, or taken off it (gatherings.ts), to those who should hear. */
async function covenGathering(admin: SupabaseClient, caller: SupabaseClient, sender: string, id: string, plannerZone: string, manual: { note: string; who: string[] | null } | null) {
  type Row = { coven_id: string; title: string; kind: string | null; status: string; scheduled_for: string | null };
  const { data: found } = await admin.from("coven_rituals").select("coven_id,title,kind,status,scheduled_for").eq("id", id).maybeSingle();
  let ritual = found as Row | null;
  if (!ritual && manual) return reply(404, { error: "not_found" });
  if (!ritual) {
    // Deleted: what it left behind, and only the one who deleted it rings for it.
    const { data: removed } = await admin.from("coven_gathering_removed").select("coven_id,title,kind,scheduled_for,removed_by").eq("ritual_id", id).maybeSingle();
    if (!removed || removed.removed_by !== sender) return reply(404, { error: "not_found" });
    ritual = { coven_id: removed.coven_id, title: removed.title, kind: removed.kind, status: "deleted", scheduled_for: removed.scheduled_for };
  }
  const covenId = ritual.coven_id;

  if (manual) {
    // By hand: those coven_gathering_may_send allows (asked as the caller).
    const { data: may } = await caller.rpc("coven_gathering_may_send", { p_ritual: id });
    if (may !== true) return reply(403, { error: "not_allowed" });
  } else {
    // Only those who lead or schedule the coven's rituals ring for its gatherings (asked as the caller).
    const [{ data: leads }, { data: schedules }] = await Promise.all([
      caller.rpc("coven_permission", { target: covenId, permission: "lead" }),
      caller.rpc("coven_permission", { target: covenId, permission: "schedule" }),
    ]);
    if (leads !== true && schedules !== true) return reply(403, { error: "not_allowed" });
  }

  const { data: coven } = await admin.from("covens").select("name,slug,status,timezone").eq("id", covenId).single();
  if (!coven || coven.status !== "active") return reply(404, { error: "not_found" });

  // Before coven_gathering_notices exists (20261108000000_coven_gathering_notices.sql), nothing is sent.
  const { data: notices, error: noticesError } = await admin.from("coven_gathering_notices").select("seq,event,scheduled_for,recipients").eq("ritual_id", id).order("seq");
  if (noticesError) return reply(503, { error: "not_ready" });
  const sent = (notices || []) as SentNotice[];
  const byHand = manual ? manualEvent(ritual, sent) : null;
  if (manual && !byHand) return reply(409, { error: "not_scheduled" });
  const what = byHand ? { event: byHand.event, heard: [] as string[], previous: null } : gatheringEvent(ritual.status === "deleted" ? null : ritual, sent);
  if (!what) return reply(200, { sent: 0 });

  let recipients: string[] = what.heard;
  if (what.event !== "cancelled") {
    // By hand, a one-off choice of who (checked by the database) stands in for the usual one.
    const { data: now } = await admin.rpc("coven_gathering_notice_recipients", { p_ritual: id, p_who: manual?.who ?? null });
    recipients = [...new Set([...what.heard, ...((now as string[] | null) || []).map(String)])];
  }
  // Still active in the coven, never the one who made the change, nor anyone who has blocked them.
  recipients = recipients.filter((u) => u !== sender);
  if (recipients.length) {
    const [{ data: active }, { data: blocks }] = await Promise.all([
      admin.from("coven_members").select("user_id").eq("coven_id", covenId).eq("status", "active").in("user_id", recipients),
      admin.from("user_blocks").select("blocker_id").eq("blocked_id", sender).in("blocker_id", recipients),
    ]);
    const activeSet = new Set((active || []).map((m) => m.user_id));
    const blocking = new Set((blocks || []).map((b) => b.blocker_id));
    recipients = recipients.filter((u) => activeSet.has(u) && !blocking.has(u));
  }

  // Once each: the next number for this gathering; a call racing this one is refused.
  const seq = sent.reduce((n, x) => Math.max(n, x.seq), 0) + 1;
  const { error: claim } = await admin.from("coven_gathering_notices").insert({
    ritual_id: id,
    seq,
    coven_id: covenId,
    event: what.event,
    scheduled_for: what.event === "cancelled" ? what.previous : ritual.scheduled_for,
    recipients,
    sent_by: sender,
    manual: !!manual,
    note: manual?.note || null,
  });
  // One by hand each half hour (limit_manual_coven_gathering_notices).
  if (claim?.code === "PT429") return reply(429, { error: "too_soon" });
  if (claim?.code === "23505") return reply(409, { error: "already_sent" });
  if (claim) return reply(503, { error: "not_ready" });
  if (!recipients.length) return reply(200, { sent: 0 });

  // Their own choices (Reminders → Coven gatherings), saved with their settings.
  const { data: settings } = await admin.from("user_settings").select("user_id,reminders:settings->>reminders_v2").in("user_id", recipients);
  const saved = new Map((settings || []).map((x: { user_id: string; reminders: string | null }) => [x.user_id, x.reminders]));
  const now = new Date();
  const listeners = recipients.filter((u) => wantsGathering(saved.get(u) ?? null, covenId, now));
  let delivered = 0;
  if (listeners.length) {
    const { data: tokens } = await admin.from("push_tokens").select("token,user_id").in("user_id", listeners);
    if (tokens?.length) {
      const note = gatheringNote({
        event: what.event,
        kind: ritual.kind,
        title: ritual.title,
        covenName: coven.name,
        covenSlug: coven.slug,
        ritualId: id,
        scheduledFor: ritual.scheduled_for,
        previous: what.previous,
        zones: { coven: validZone(coven.timezone) ? coven.timezone : null, planner: plannerZone || null },
        now,
        note: manual?.note,
      });
      const notes: Push[] = tokens.map((t) => ({
        to: t.token,
        title: note.title,
        body: note.body,
        sound: "default",
        channelId: "coven-gatherings",
        threadId: `gatherings:${covenId}`,
        data: { source: "coven-gathering", url: note.url, covenId, ritualId: id, event: what.event },
      }));
      delivered = await push(admin, notes);
    }
  }
  await admin.from("coven_gathering_notices").update({ sent_at: new Date().toISOString() }).eq("ritual_id", id).eq("seq", seq);
  return reply(200, { sent: delivered, event: what.event, recipients: recipients.length });
}
