// A calendar feed to subscribe to in Google, Apple or any other calendar:
// GET /functions/v1/ical-feed?t=<token> returns text/calendar with the
// person's planned rituals, the gatherings of covens they belong to, the
// holidays and moon phases the app last worked out for them, and their
// ancestors' days, as they chose in Settings → Reminders → Your calendar.
//
// The token is a long random secret the app keeps in the person's settings
// (`user_settings.settings.calendar_feed_token`); "Reset the link" replaces
// it, and the old link stops working. Calendars can't sign in, so this
// function runs without a JWT and reads with the service role, only ever for
// the one person whose token it is.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

import { ancestorEvents, buildCalendar, covenEvents, feedParts, isFeedToken, planEvents, skyEvents, type CovenRitualRow, type FeedEvent, type PlanRow } from "./ics.ts";

const text = (status: number, body: string) => new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

type Assignee = { kind?: string; id?: string };

/** A meeting kept to some: shown only when it's for the whole coven or names this person. */
function forThem(audience: unknown, userId: string): boolean {
  if (!Array.isArray(audience) || !audience.length) return true;
  return (audience as Assignee[]).some((a) => a?.kind === "coven" || (a?.kind === "user" && a.id === userId));
}

Deno.serve(async (request) => {
  if (request.method !== "GET" && request.method !== "HEAD") return text(405, "Method not allowed");
  const token = new URL(request.url).searchParams.get("t");
  if (!isFeedToken(token)) return text(404, "Not found");

  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !service) return text(503, "Not configured");
  const admin = createClient(url, service, { auth: { persistSession: false } });

  const { data: owners, error: ownerError } = await admin.from("user_settings").select("user_id,settings").eq("settings->>calendar_feed_token", token).limit(2);
  if (ownerError) return text(500, "Could not read the calendar");
  if (!owners || owners.length !== 1) return text(404, "Not found");
  const userId = owners[0].user_id as string;
  const raw = owners[0].settings;
  const settings = (typeof raw === "string" ? JSON.parse(raw) : raw ?? {}) as Record<string, unknown>;
  // Belt and braces: the row found must hold exactly this token.
  if (settings.calendar_feed_token !== token) return text(404, "Not found");
  const parts = feedParts(settings.calendar_feed_parts);
  const now = new Date();
  const events: FeedEvent[] = [];

  try {
    if (parts.has("rituals")) {
      const { data, error } = await admin.from("ritual_plans").select("id,planned_date,planned_time,title,intention,done_at").eq("user_id", userId).limit(1000);
      if (error) throw error;
      events.push(...planEvents((data ?? []) as PlanRow[], now));
    }

    if (parts.has("covens")) {
      const { data: memberships, error } = await admin.from("coven_members").select("coven_id").eq("user_id", userId).eq("status", "active");
      if (error) throw error;
      const covenIds = [...new Set((memberships ?? []).map((m) => m.coven_id as string))];
      if (covenIds.length) {
        const since = new Date(now.getTime() - 31 * 86_400_000).toISOString();
        const [{ data: rites, error: riteError }, { data: covens, error: covenError }] = await Promise.all([
          admin.from("coven_rituals").select("id,coven_id,title,scheduled_for,status,kind,occasion_name,intention,audience").in("coven_id", covenIds).gte("scheduled_for", since).limit(1000),
          admin.from("covens").select("id,name").in("id", covenIds),
        ]);
        if (riteError || covenError) throw riteError ?? covenError;
        const names = Object.fromEntries((covens ?? []).map((c) => [c.id as string, c.name as string]));
        const mine = (rites ?? []).filter((r) => forThem((r as { audience?: unknown }).audience, userId)) as CovenRitualRow[];
        events.push(...covenEvents(mine, names));
      }
    }

    const collections = [...(parts.has("holidays") || parts.has("moon") ? ["calendar.feed"] : []), ...(parts.has("ancestors") ? ["hedge.ancestors"] : [])];
    if (collections.length) {
      const { data, error } = await admin.from("craft_entries").select("id,collection,data,updated_at").eq("user_id", userId).in("collection", collections).is("deleted_at", null).limit(2000);
      if (error) throw error;
      const rows = data ?? [];
      const snapshot = rows.filter((r) => r.collection === "calendar.feed").sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0];
      events.push(...skyEvents(snapshot?.data as never, parts));
      if (parts.has("ancestors")) events.push(...ancestorEvents(rows.filter((r) => r.collection === "hedge.ancestors").map((r) => ({ id: r.id as string, data: r.data })), now));
    }
  } catch {
    return text(500, "Could not read the calendar");
  }

  const body = buildCalendar(events, now);
  return new Response(request.method === "HEAD" ? null : body, {
    status: 200,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="salt-and-sovereignty.ics"',
      "cache-control": "private, max-age=900",
    },
  });
});
