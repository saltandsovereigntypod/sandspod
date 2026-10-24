import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Phone notifications for a coven message. The app calls this right after
// sending one (with the message's id); it checks the caller wrote it, then
// sends it to everyone who should hear about it through Expo's push service:
// for the coven's chat, its active members who want coven chat notifications;
// for a conversation, the others in it who haven't muted it and want
// conversation notifications. No one hears from someone they've blocked, and
// devices Expo says are gone are signed off.

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
  try {
    messageId = String((await request.json())?.message_id || "");
  } catch {
    return reply(400, { error: "bad_request" });
  }
  if (!/^[0-9a-f-]{36}$/i.test(messageId)) return reply(400, { error: "bad_request" });

  const admin = createClient(url, service, { auth: { persistSession: false } });
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
  // Phones that no longer have the app stop being sent to.
  if (gone.length) await admin.from("push_tokens").update({ user_id: null, updated_at: new Date().toISOString() }).in("token", gone);
  return reply(200, { sent });
});
