// Pure account rules shared with the website's js/account-data.js.

export const DELETE_CONFIRMATION = 'DELETE MY SALT AND SOVEREIGNTY ACCOUNT';

/** How recently someone must have signed in before deleting their account. */
export const RECENT_SIGN_IN_MINUTES = 30;

export const MIN_PASSWORD_LENGTH = 8;

type UserLike = {
  email?: string | null;
  identities?: { provider?: string }[] | null;
  app_metadata?: { provider?: string } | null;
  /** password_sign_in: a password added to an Apple or Google account (lib/settings/signInMethods). */
  user_metadata?: { password_sign_in?: unknown } | null;
  last_sign_in_at?: string | null;
};

export function providerSummary(user: UserLike | null | undefined): string {
  const providers = new Set((user?.identities || []).map((identity) => identity.provider).filter(Boolean));
  const primary = user?.app_metadata?.provider;
  if (primary) providers.add(primary);
  if (user?.user_metadata?.password_sign_in === true) providers.add('email');
  const labels: string[] = [];
  if (providers.has('email')) labels.push('Email and password');
  if (providers.has('google')) labels.push('Google');
  if (providers.has('apple')) labels.push('Apple');
  return labels.length ? labels.join(' and ') : 'Account sign-in';
}

/** Apple- or Google-only accounts have no password to change, until one is added. */
export function hasPasswordIdentity(user: UserLike | null | undefined): boolean {
  if (user?.user_metadata?.password_sign_in === true) return true;
  const providers = new Set((user?.identities || []).map((identity) => identity.provider));
  if (!providers.size && user?.app_metadata?.provider === 'email') return true;
  return providers.has('email');
}

export function isEmailAddress(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export type Validation = { valid: true; message: '' } | { valid: false; message: string };

export function validatePasswordPair(password: string, confirmation: string): Validation {
  if (password.length < MIN_PASSWORD_LENGTH)
    return { valid: false, message: `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.` };
  if (password !== confirmation) return { valid: false, message: 'The two passwords do not match.' };
  return { valid: true, message: '' };
}

export function validateEmailChange(
  currentEmail: string | null | undefined,
  email: string,
  confirmation: string,
): { valid: false; message: string } | { valid: true; email: string; message: '' } {
  const next = email.trim().toLowerCase();
  if (!isEmailAddress(next)) return { valid: false, message: 'Enter a complete email address.' };
  if (next !== confirmation.trim().toLowerCase()) return { valid: false, message: 'The two email addresses do not match.' };
  if (next === (currentEmail ?? '').trim().toLowerCase())
    return { valid: false, message: 'That is already the email for this account.' };
  return { valid: true, email: next, message: '' };
}

/** Friendly wording for Supabase auth errors, the same as the website's. */
export function authMessage(error: unknown, context: 'account' | 'recovery' = 'account'): string {
  const raw = error && typeof error === 'object' && 'message' in error ? (error as { message?: unknown }).message : error;
  const value = String(raw || '').toLowerCase();
  if (/invalid login|invalid credential/.test(value)) return 'That email and password did not match.';
  if (/email not confirmed/.test(value)) return 'Please confirm your email before signing in.';
  if (/expired|otp_expired/.test(value)) return 'This recovery link has expired. Please request a new one.';
  if (/invalid.*(?:token|link)|otp_disabled/.test(value)) return 'This recovery link is invalid or has already been used.';
  if (/password.*(?:short|least)|weak password/.test(value))
    return `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`;
  if (/same password|different from the old/.test(value)) return 'Choose a password you have not used for this account.';
  if (/already.*(?:registered|exists)|email.*use/.test(value)) return 'That email is already connected to an account.';
  if (/rate|too many|over_email_send_rate_limit/.test(value)) return 'Please wait a little while before trying again.';
  if (/session|jwt|signed out|not authenticated/.test(value)) return 'Your session has ended. Please sign in again.';
  if (/network|fetch|offline/.test(value)) return 'The cloud could not be reached. Check your connection and try again.';
  return context === 'recovery'
    ? 'The recovery request could not be completed. Please try again.'
    : 'That account change could not be completed. Please try again.';
}

export function isRecentSignIn(user: UserLike | null | undefined, now: Date = new Date()): boolean {
  const at = user?.last_sign_in_at ? Date.parse(user.last_sign_in_at) : NaN;
  if (Number.isNaN(at)) return false;
  return now.getTime() - at <= RECENT_SIGN_IN_MINUTES * 60 * 1000;
}

/** The typed phrase must match exactly, ignoring surrounding spaces only. */
export function deletePhraseMatches(value: string): boolean {
  return value.trim() === DELETE_CONFIRMATION;
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

/** Turns the delete-account function's JSON reply into what we tell the person. */
export function interpretDeleteResponse(status: number, body: unknown): DeleteResult {
  const reply = (body && typeof body === 'object' ? body : {}) as { complete?: boolean; error?: string };
  if (status === 200 && reply.complete === true) return { ok: true };
  if (status === 401 || reply.error === 'session_expired' || reply.error === 'authentication_required')
    return { ok: false, message: 'Your session has ended. Please sign in again, then try once more.' };
  if (reply.error === 'deletion_incomplete')
    return {
      ok: false,
      message:
        'Deletion stopped part way. Your sign-in still works, so you can try again; nothing that remains is shared with anyone.',
    };
  if (status === 403 || status === 404 || status === 503 || reply.error === 'function_not_configured')
    return { ok: false, message: 'Account deletion is not available right now. Nothing was deleted.' };
  return { ok: false, message: 'Your account could not be deleted right now. Nothing was deleted; please try again.' };
}
