import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { isFresh, wantsNotice } from "../coven-notify/requests.ts";
import { listingAnswerNote, listingAskedNote, type Note } from "../coven-notify/founding.ts";

// Phone notes for coven listing applications
// (supabase/migrations/20261129000000_coven_founders_live.sql; the words in
// coven-notify/founding.ts). Kept apart from coven-notify because its
// audience is the site's moderators, not a coven's people.
//
// { listing_application_id }: called by the founder who just sent it (status
// 'pending'), it tells the Salt & Sovereignty moderators (user_roles 'admin'
// or 'moderator'); called by the moderator who just answered it ('approved',
// 'changes' or 'declined'), it tells the founder. Only while fresh (the
// application's own time, so an old one can't be rung again), and only for
// those whose Reminders choices want coven requests (requests.ts wantsNotice).
//
// Deploy: supabase functions deploy coven-listing-notify (it reads two files
// from ../coven-notify).

const EXPO_PUSH = "https://exp.host/--/api/v2/push/send";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

// The website calls from the browser, so it needs CORS (the app sends no Origin).
const ALLOWED_ORIGINS = new Set([
  "https://saltandsovereignty.com",
  "https://www.saltandsovereignty.com",
  "https://dev.saltandsovereignty.com",
  "https://app.saltandsovereignty.com",
  "https://saltandsovereigntypod.github.io",
]);

Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  const cors: Record<string, string> = ALLOWED_ORIGINS.has(origin)
    ? { "access-control-allow-origin": origin, "access-control-allow-headers": "authorization, content-type, apikey, x-client-info", "access-control-allow-methods": "POST, OPTIONS", "vary": "Origin" }
    : {};
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const res = await handle(request);
  for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
  return res;
});

async function handle(request: Request): Promise<Response> {
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
  const caller = authData.user.id;
  const payload = await request.json().catch(() => null);
  const id = String(payload?.listing_application_id || "");
  if (!UUID.test(id)) return reply(400, { error: "bad_request" });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  return listingApplication(admin, caller, id);
}

type Push = { to: string; title: string; body: string; sound: string; channelId: string; threadId?: string; data: Record<string, unknown> };

async function listingApplication(admin: SupabaseClient, caller: string, id: string) {
  const { data: row } = await admin
    .from("coven_listing_applications")
    .select("id,coven_id,user_id,status,moderator_note,reviewer_id,submitted_at,decided_at")
    .eq("id", id)
    .maybeSingle();
  if (!row) return reply(404, { error: "not_found" });
  const a = row as { coven_id: string; user_id: string; status: string; moderator_note: string | null; reviewer_id: string | null; submitted_at: string; decided_at: string | null };
  let event: "new" | "answer";
  if (a.status === "pending" && a.user_id === caller) {
    if (!isFresh(a.submitted_at)) return reply(409, { error: "too_old" });
    event = "new";
  } else if (["approved", "changes", "declined"].includes(a.status) && a.reviewer_id === caller && a.user_id !== caller) {
    if (!isFresh(a.decided_at)) return reply(409, { error: "too_old" });
    event = "answer";
  } else return reply(404, { error: "not_found" });

  const { data: coven } = await admin.from("covens").select("name,slug").eq("id", a.coven_id).maybeSingle();
  if (!coven) return reply(404, { error: "not_found" });
  let recipients: string[];
  let note: Note;
  if (event === "new") {
    const [{ data: roles }, { data: profile }] = await Promise.all([
      admin.from("user_roles").select("user_id").in("role", ["admin", "moderator"]),
      admin.from("coven_profiles").select("display_name").eq("user_id", a.user_id).maybeSingle(),
    ]);
    recipients = [...new Set((roles || []).map((r: { user_id: string }) => r.user_id))].filter((u) => u !== caller);
    // A note from the moderators means it was sent back once and is coming again.
    note = listingAskedNote({ covenName: coven.name, who: profile?.display_name || "A founder", again: !!a.moderator_note });
  } else {
    recipients = [a.user_id];
    note = listingAnswerNote({ covenName: coven.name, covenSlug: coven.slug, status: a.status as "approved" | "changes" | "declined", note: a.moderator_note });
  }
  if (!recipients.length) return reply(200, { sent: 0 });

  const { data: settings } = await admin.from("user_settings").select("user_id,reminders:settings->>reminders_v2").in("user_id", recipients);
  const saved = new Map((settings || []).map((x: { user_id: string; reminders: string | null }) => [x.user_id, x.reminders]));
  const now = new Date();
  const listeners = recipients.filter((u) => wantsNotice(saved.get(u) ?? null, event, a.coven_id, now));
  if (!listeners.length) return reply(200, { sent: 0 });
  const { data: tokens } = await admin.from("push_tokens").select("token,user_id").in("user_id", listeners);
  if (!tokens?.length) return reply(200, { sent: 0 });
  const notes: Push[] = tokens.map((t: { token: string }) => ({
    to: t.token,
    title: note.title,
    body: note.body,
    sound: "default",
    channelId: "coven-requests",
    threadId: `listing:${a.coven_id}`,
    data: { source: event === "new" ? "coven-listing" : "coven-listing-answer", url: note.url, covenId: a.coven_id, applicationId: id },
  }));
  return reply(200, { sent: await push(admin, notes) });
}

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
