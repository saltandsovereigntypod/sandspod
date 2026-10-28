// Coven invitations: invite links (a ten-letter code anyone can open) and
// personal invitations sent to someone in the app
// (supabase/migrations/20261109000000_coven_invitations.sql). The words, the
// link and code shapes, the choices for a new link and how a link stands.
// Pure, so the website (js/core/covens.js, SaltCore.covens.invites) reads
// codes, words and links exactly as the app does.

/** The letters a code is made of: no 0, 1, I or O, so nothing reads as something else. */
export const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const CODE_LENGTH = 10;
const CODE = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

export const SITE_ORIGIN = 'https://saltandsovereignty.com';
/** Where to get the app (Apple ID 6821416030; package com.saltandsovereignty.app). */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6821416030';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.saltandsovereignty.app';
/** Personal invitations lapse after this many days. */
export const INVITATION_DAYS = 30;
/** Keep in step with the database. */
export const MESSAGE_MAX = 500;
export const NOTE_MAX = 80;
export const SEARCH_MIN = 2;

export type InviteLink = {
  id: string;
  coven_id: string;
  code: string;
  created_by: string | null;
  created_at: string;
  expires_at: string | null;
  max_uses: number | null;
  uses: number;
  revoked_at: string | null;
  note: string | null;
};

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';

export type Invitation = {
  id: string;
  coven_id: string;
  user_id: string;
  invited_by: string | null;
  message: string | null;
  status: InvitationStatus;
  created_at: string;
  decided_at: string | null;
};

export type PreviewReason = 'not_found' | 'revoked' | 'expired' | 'used_up' | 'coven_not_active';

/** What coven_invite_preview says about a code, to anyone. */
export type InvitePreview = {
  valid: boolean;
  reason: PreviewReason | null;
  coven: { name: string; slug: string; tagline: string | null; tradition: string | null; member_count: number } | null;
};

export type InvitePerson = { user_id: string; display_name: string; avatar_url: string | null };

// ─── Codes and links ──────────────────────────────────────────────────────

/** A code as typed: capitals, with spaces and dashes taken out. */
export const cleanCode = (text: string) => text.toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * The code in whatever someone pasted: the code itself ("K7Q2-MX9P4R"), the
 * website's link (…/covens/join/?code=K7Q2MX9P4R) or the app's own
 * (saltandsovereignty://coven/join/K7Q2MX9P4R). Null when there isn't one.
 */
export function parseInviteCode(input: string | null | undefined): string | null {
  const text = String(input ?? '').trim();
  if (!text) return null;
  const param = text.match(/[?&#]code=([^&#\s]+)/i);
  const path = text.match(/\/join\/([A-Za-z0-9-]+)/i);
  const raw = param ? decodeURIComponent(param[1]) : path ? path[1] : /[/:?=]/.test(text) ? '' : text;
  const code = cleanCode(raw);
  return CODE.test(code) ? code : null;
}

/** The link to share: the website's join page, which opens the app for those who have it. */
export const inviteLink = (code: string) => `${SITE_ORIGIN}/covens/join/?code=${encodeURIComponent(code)}`;
/** The app's own address for an invite (its scheme; there are no universal links). */
export const appInviteLink = (code: string) => `saltandsovereignty://coven/join/${encodeURIComponent(code)}`;
/** What Share sends: "Join Moon Circle on Salt & Sovereignty: https://…". */
export const shareMessage = (covenName: string, link: string) => `Join ${covenName} on Salt & Sovereignty: ${link}`;

// ─── A new link's choices ─────────────────────────────────────────────────

export const EXPIRY_CHOICES = [
  { value: '7', label: '7 days', days: 7 },
  { value: '30', label: '30 days', days: 30 },
  { value: 'never', label: 'Never', days: null },
] as const;
export const USES_CHOICES = [
  { value: '1', label: 'Once', uses: 1 },
  { value: '5', label: '5 people', uses: 5 },
  { value: '25', label: '25 people', uses: 25 },
  { value: 'unlimited', label: 'Unlimited', uses: null },
] as const;
export type ExpiryChoice = (typeof EXPIRY_CHOICES)[number]['value'];
export type UsesChoice = (typeof USES_CHOICES)[number]['value'];

/** The days and uses a choice stands for (null: never, unlimited). */
export function linkOptions(expiry: string, uses: string): { days: number | null; uses: number | null } {
  const e = EXPIRY_CHOICES.find((c) => c.value === expiry);
  const u = USES_CHOICES.find((c) => c.value === uses);
  return { days: e ? e.days : 7, uses: u ? u.uses : null };
}

// ─── How a link stands ────────────────────────────────────────────────────

export type LinkState = 'active' | 'expired' | 'used_up' | 'revoked';

export function linkState(link: Pick<InviteLink, 'expires_at' | 'max_uses' | 'uses' | 'revoked_at'>, now: number = Date.now()): LinkState {
  if (link.revoked_at) return 'revoked';
  if (link.expires_at && new Date(link.expires_at).getTime() <= now) return 'expired';
  if (link.max_uses != null && link.uses >= link.max_uses) return 'used_up';
  return 'active';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "4 Nov". */
export const shortDate = (value: string) => {
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** "Used 2 of 5 · until 4 Nov", "Used once · no end date". */
export function linkSummary(link: Pick<InviteLink, 'expires_at' | 'max_uses' | 'uses' | 'revoked_at'>, now: number = Date.now()): string {
  const used = link.max_uses != null ? `Used ${link.uses} of ${link.max_uses}` : link.uses === 1 ? 'Used once' : link.uses ? `Used ${link.uses} times` : 'Not used yet';
  const state = linkState(link, now);
  if (state === 'revoked') return `${used} · revoked`;
  if (state === 'expired') return `${used} · expired`;
  if (state === 'used_up') return `${used} · used up`;
  return `${used} · ${link.expires_at ? `until ${shortDate(link.expires_at)}` : 'no end date'}`;
}

/** Links still working, newest first. */
export const activeLinks = <T extends Pick<InviteLink, 'expires_at' | 'max_uses' | 'uses' | 'revoked_at' | 'created_at'>>(links: T[], now: number = Date.now()) =>
  links.filter((l) => linkState(l, now) === 'active').sort((a, b) => b.created_at.localeCompare(a.created_at));

/** Why a link can't be used, in words. */
export function reasonWords(reason: PreviewReason | null | undefined): string {
  switch (reason) {
    case 'revoked':
      return 'This invite link was revoked. Ask the coven for a new one.';
    case 'expired':
      return 'This invite link has expired. Ask the coven for a new one.';
    case 'used_up':
      return 'This invite link has been used as many times as it can be. Ask the coven for a new one.';
    case 'coven_not_active':
      return 'This coven isn’t open right now.';
    case 'not_found':
      return 'This invite link wasn’t found. Check the code and try again.';
    default:
      return '';
  }
}

/** A coven preview's line: "Hedge · 12 members". */
export function previewLine(coven: InvitePreview['coven']): string {
  if (!coven) return '';
  const n = Number(coven.member_count) || 0;
  return [coven.tradition, `${n} ${n === 1 ? 'member' : 'members'}`].filter(Boolean).join(' · ');
}

// ─── Personal invitations ─────────────────────────────────────────────────

/** Whether a pending invitation is still open (they lapse after 30 days). */
export function invitationOpen(inv: Pick<Invitation, 'status' | 'created_at'>, now: number = Date.now()): boolean {
  return inv.status === 'pending' && now - new Date(inv.created_at).getTime() < INVITATION_DAYS * 24 * 60 * 60 * 1000;
}

/** Your invitations still waiting for an answer, newest first, one per coven, none for covens you're in. */
export function openInvitations<T extends Pick<Invitation, 'status' | 'created_at' | 'coven_id'>>(rows: T[], memberOf: string[] = [], now: number = Date.now()): T[] {
  const seen = new Set(memberOf);
  return rows
    .filter((r) => invitationOpen(r, now))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter((r) => (seen.has(r.coven_id) ? false : (seen.add(r.coven_id), true)));
}

/** "Hazel invited you" with their message, if any. */
export function invitationLine(inviter: string | null | undefined, message: string | null | undefined): string {
  const who = inviter?.trim() || 'Someone';
  return message?.trim() ? `${who} invited you: “${message.trim()}”` : `${who} invited you to join.`;
}

/** Where sign-in goes next: back to an invitation (and only there), otherwise Today. */
export function afterSignIn(next: unknown): string {
  const path = typeof next === 'string' ? next : '';
  return /^\/coven\/(join\/[A-Za-z0-9]{1,20}|invitation\/[0-9a-f-]{36})$/i.test(path) ? path : '/today';
}

/** A search worth sending: at least two letters. */
export const searchReady = (query: string) => query.trim().length >= SEARCH_MIN;

// ─── Errors ───────────────────────────────────────────────────────────────

/** Accepting refused until the coven's agreements are signed (show them, then try again). */
export const needsAgreements = (error: unknown) => /sign the coven.s agreements/i.test(String((error as { message?: string })?.message ?? error ?? ''));
/** Accepting refused until there's a community profile. */
export const needsProfile = (error: unknown) => /community profile/i.test(String((error as { message?: string })?.message ?? error ?? ''));

/** An invitation error in words; before the database has invitations, a gentle note. */
export function inviteError(error: unknown): string {
  const text = String((error as { message?: string })?.message ?? error ?? '');
  if (/could not find the function|schema cache|does not exist|PGRST20/i.test(text)) return 'Invitations aren’t ready yet. Please try again later.';
  if (/row-level security|permission denied/i.test(text)) return 'You don’t have permission to do that here.';
  if (/Failed to fetch|Network request failed|NetworkError/i.test(text)) return 'You seem to be offline. Please try again.';
  return text || 'That didn’t work. Please try again.';
}
