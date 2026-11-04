// The duties rota's swaps: who hears, and what the note says. Pure (no Deno
// or Supabase), like together.ts.
//
// - Asked: "Hazel asks you to take Brings the candles at Full moon esbat."
//   to the one asked.
// - Answered: "Rowan will take Brings the candles at Full moon esbat." (or
//   can't) to the one who asked. A leader's reassignment tells both people.
//
// The pause in Sanctuary settings (user_settings.reminders_v2) is respected.

export type RotaNote = { title: string; body: string; url: string };
export type RotaSwapRow = { from_user: string; to_user: string; requested_by: string | null; status: string };

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const clip = (text: string, n = 80) => (text.length > n ? `${text.slice(0, n - 1)}…` : text);

/** Not while notes are paused (until the day it's paused to). */
export function wantsRota(saved: unknown, now: Date = new Date()): boolean {
  let prefs: Record<string, unknown> = {};
  if (typeof saved === "string" && saved.trim()) {
    try {
      prefs = obj(JSON.parse(saved));
    } catch {
      prefs = {};
    }
  } else prefs = obj(saved);
  if (prefs.paused !== true) return true;
  const until = typeof prefs.pausedUntil === "string" && /^\d{4}-\d{2}-\d{2}$/.test(prefs.pausedUntil) ? prefs.pausedUntil : "";
  if (!until) return false;
  const [y, m, d] = until.split("-").map(Number);
  return now.getTime() >= Date.UTC(y, m - 1, d);
}

/** Who hears about this swap event, given who did it (empty when the caller had no part in it). */
export function rotaRecipients(swap: RotaSwapRow, event: "asked" | "answered", caller: string): string[] {
  if (event === "asked") return swap.status === "pending" && swap.requested_by === caller ? [swap.to_user] : [];
  if (swap.status !== "accepted" && swap.status !== "declined") return [];
  if (caller === swap.to_user) return [swap.from_user];
  // A leader's reassignment: both people.
  if (swap.requested_by === caller && caller !== swap.from_user) return [swap.from_user, swap.to_user].filter((u) => u !== caller);
  return [];
}

export function rotaNote(args: { event: "asked" | "answered"; status: string; who: string; duty: string; gathering: string; covenName: string; covenSlug: string; ritualId: string; reassigned: boolean; toRecipient: "from" | "to" }): RotaNote {
  const url = `/coven/c/${args.covenSlug}/ritual/${args.ritualId}`;
  const at = clip(args.gathering);
  const title = `${args.covenName}: duties`;
  if (args.event === "asked") return { title, body: `${args.who} asks you to take “${args.duty}” at ${at}.`, url };
  if (args.reassigned) {
    return { title, body: args.toRecipient === "to" ? `${args.who} has given you “${args.duty}” at ${at}.` : `${args.who} has passed “${args.duty}” at ${at} to someone else.`, url };
  }
  return { title, body: args.status === "accepted" ? `${args.who} will take “${args.duty}” at ${at}.` : `${args.who} can’t take “${args.duty}” at ${at}. It stays with you.`, url };
}
