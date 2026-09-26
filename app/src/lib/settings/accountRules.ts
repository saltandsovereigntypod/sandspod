// Pure account rules shared with the website's js/account-data.js.

export const DELETE_CONFIRMATION = 'DELETE MY SALT AND SOVEREIGNTY ACCOUNT';

/** How recently someone must have signed in before deleting their account. */
export const RECENT_SIGN_IN_MINUTES = 30;

type UserLike = {
  identities?: { provider?: string }[] | null;
  app_metadata?: { provider?: string } | null;
  last_sign_in_at?: string | null;
};

export function providerSummary(user: UserLike | null | undefined): string {
  const providers = new Set((user?.identities || []).map((identity) => identity.provider).filter(Boolean));
  const primary = user?.app_metadata?.provider;
  if (primary) providers.add(primary);
  const labels: string[] = [];
  if (providers.has('email')) labels.push('Email and password');
  if (providers.has('google')) labels.push('Google');
  if (providers.has('apple')) labels.push('Apple');
  return labels.length ? labels.join(' and ') : 'Account sign-in';
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
