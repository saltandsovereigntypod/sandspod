import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { answerNote, isFresh, requestNote, reviewersOf, wantsNotice, type Note } from "./requests.ts";

// Phone notifications for covens: a new message, a new application or
// request to advance, and the answer to one.
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
  try {
    const payload = (await request.json()) || {};
    messageId = String(payload.message_id || "");
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
