// "Ways to sign in": the sign-ins (Apple, Google, email and password) that
// all open one account. Pure, and the same as the website's
// js/sign-in-methods.js (a test keeps them in step).
//
// Linking uses Supabase's manual identity linking, which the project owner
// switches on in the dashboard (Authentication → Sign In / Providers →
// "Allow manual linking"). Until then Supabase answers manual_linking_disabled.

import { SUPPORT_EMAIL } from '../community/model.ts';

export type SignInProvider = 'apple' | 'google' | 'email';

/** The order ways to sign in are listed and offered in. */
export const SIGN_IN_PROVIDERS: SignInProvider[] = ['apple', 'google', 'email'];

/**
 * Set on the account when someone adds a password to an Apple or Google
 * account. Supabase signs them in with it, but doesn't list it as an identity.
 */
export const PASSWORD_FLAG = 'password_sign_in';

export type IdentityLike = {
  id?: string;
  identity_id?: string;
  provider?: string;
  email?: string | null;
  identity_data?: { email?: unknown } | null;
};

type UserLike = {
  email?: string | null;
  identities?: IdentityLike[] | null;
  user_metadata?: Record<string, unknown> | null;
};

export type SignInRow = {
  key: string;
  provider: string;
  label: string;
  detail: string;
  /** The identity Supabase holds, or null for a password added to an Apple or Google account. */
  identity: IdentityLike | null;
  removable: boolean;
};

const NAMES: Record<string, string> = { apple: 'Apple', google: 'Google', email: 'Email and password' };
const ACCOUNT_NAMES: Record<string, string> = { apple: 'Apple ID', google: 'Google account', email: 'email address' };

export function providerName(provider: string | undefined): string {
  const value = String(provider || '');
  return NAMES[value] ?? (value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Sign-in');
}

/** "That Apple ID", "That Google account". */
export function accountName(provider: string | undefined): string {
  return ACCOUNT_NAMES[String(provider || '')] ?? `${providerName(provider)} account`;
}

export function identityEmail(identity: IdentityLike | null | undefined): string {
  const fromData = identity?.identity_data?.email;
  if (typeof fromData === 'string' && fromData) return fromData;
  return typeof identity?.email === 'string' ? identity.email : '';
}

const rank = (provider: string | undefined) => {
  const index = SIGN_IN_PROVIDERS.indexOf(provider as SignInProvider);
  return index === -1 ? SIGN_IN_PROVIDERS.length : index;
};

/** Whether this account has a password that isn't an identity of its own. */
export function hasPasswordFlag(user: UserLike | null | undefined): boolean {
  return user?.user_metadata?.[PASSWORD_FLAG] === true;
}

/**
 * The rows for "Ways to sign in". Any identity can be removed while another
 * remains; a password added to an Apple or Google account can't be (Supabase
 * has no way to take it off), and never counts towards keeping one.
 */
export function signInRows(identities: IdentityLike[] | null | undefined, user?: UserLike | null): SignInRow[] {
  const list = [...(identities ?? [])].filter((identity) => identity && identity.provider);
  list.sort((a, b) => rank(a.provider) - rank(b.provider));
  const rows: SignInRow[] = list.map((identity, index) => ({
    key: identity.identity_id || identity.id || `${identity.provider}-${index}`,
    provider: String(identity.provider),
    label: providerName(identity.provider),
    detail: identityEmail(identity) || (identity.provider === 'email' ? user?.email || '' : ''),
    identity,
    removable: list.length > 1,
  }));
  if (hasPasswordFlag(user) && !list.some((identity) => identity.provider === 'email')) {
    rows.push({ key: 'password', provider: 'email', label: providerName('email'), detail: user?.email || '', identity: null, removable: false });
  }
  return rows;
}

/** Never the last way in. */
export function canRemove(identities: IdentityLike[] | null | undefined, identity: IdentityLike | null | undefined): boolean {
  const list = identities ?? [];
  if (!identity || list.length < 2) return false;
  const id = identity.identity_id || identity.id;
  return list.some((item) => (item.identity_id || item.id) === id && item.provider === identity.provider);
}

/** Ways not yet on the account, among those this device can offer. Email needs the account to have an address. */
export function waysToAdd(
  rows: { provider: string }[],
  offer: { apple: boolean; google: boolean; email: boolean },
): SignInProvider[] {
  const have = new Set(rows.map((row) => row.provider));
  return SIGN_IN_PROVIDERS.filter((provider) => offer[provider] && !have.has(provider));
}

/**
 * What a browser sign-in hands back, from the query or the fragment:
 * a code to exchange, or an error Supabase sent instead.
 */
export function linkReturn(url: string): { code?: string; error?: string; errorCode?: string; errorDescription?: string } {
  const params: Record<string, string> = {};
  const value = String(url || '');
  const hashAt = value.indexOf('#');
  const beforeHash = hashAt === -1 ? value : value.slice(0, hashAt);
  const queryAt = beforeHash.indexOf('?');
  const parts = [queryAt === -1 ? '' : beforeHash.slice(queryAt + 1), hashAt === -1 ? '' : value.slice(hashAt + 1)];
  for (const part of parts) {
    for (const pair of part.split('&')) {
      if (!pair) continue;
      const equals = pair.indexOf('=');
      const name = decode(equals === -1 ? pair : pair.slice(0, equals));
      if (name && !(name in params)) params[name] = decode(equals === -1 ? '' : pair.slice(equals + 1));
    }
  }
  const result: { code?: string; error?: string; errorCode?: string; errorDescription?: string } = {};
  if (params.code) result.code = params.code;
  if (params.error) result.error = params.error;
  if (params.error_code) result.errorCode = params.error_code;
  if (params.error_description) result.errorDescription = params.error_description;
  return result;
}

function decode(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    return text;
  }
}

function parts(error: unknown): { code: string; message: string } {
  const value = (error && typeof error === 'object' ? error : { message: error }) as {
    code?: unknown;
    error_code?: unknown;
    errorCode?: unknown;
    message?: unknown;
    error_description?: unknown;
    errorDescription?: unknown;
  };
  const code = String(value.code || value.error_code || value.errorCode || '').toLowerCase();
  const message = String(value.message || value.error_description || value.errorDescription || '').toLowerCase();
  return { code, message };
}

/** True when Supabase's "Allow manual linking" is still switched off. */
export function isLinkingDisabled(error: unknown): boolean {
  const { code, message } = parts(error);
  return code === 'manual_linking_disabled' || /manual linking is disabled/.test(message);
}

/** What to say when adding a way to sign in didn't work. */
export function linkErrorMessage(error: unknown, provider: string, supportEmail: string = SUPPORT_EMAIL): string {
  const { code, message } = parts(error);
  const name = providerName(provider);
  if (isLinkingDisabled(error))
    return `Adding another way to sign in isn’t switched on yet. Nothing has changed with your account. Please try again soon, or write to ${supportEmail}.`;
  if (code === 'identity_already_exists' || /already linked|already (?:been )?(?:registered|exists)|already in use/.test(message)) {
    // Supabase says "Identity is already linked" when it's this account's own,
    // and "... to another user" when it belongs to someone else's.
    if (/already linked\.?$/.test(message.trim()) && !/another|other user/.test(message))
      return `${name} is already one of your ways to sign in.`;
    return `That ${accountName(provider)} already has its own Salt & Sovereignty account. Sign in with it and delete that account from Account settings first, or write to ${supportEmail} and we’ll help bring the two together.`;
  }
  if (code === 'provider_disabled' || /provider is not enabled|unsupported provider|not enabled/.test(message))
    return `Signing in with ${name} isn’t available right now. Please try again later.`;
  if (code === 'reauthentication_needed' || /reauthenticat/.test(message))
    return 'For your safety, please sign out and back in, then add this straight away.';
  if (/password.*(?:short|least)|weak.?password/.test(code + ' ' + message)) return 'Use at least 8 characters for your password.';
  if (/session|jwt|signed out|not authenticated/.test(message)) return 'Your session has ended. Please sign in again.';
  if (/network|fetch|offline/.test(message)) return 'The cloud could not be reached. Check your connection and try again.';
  if (/rate|too many/.test(code + ' ' + message)) return 'Please wait a little while before trying again.';
  return `${name} couldn’t be added just now. Nothing has changed; please try again.`;
}

/** What to say when removing a way to sign in didn't work. */
export function unlinkErrorMessage(error: unknown, provider: string, supportEmail: string = SUPPORT_EMAIL): string {
  const { code, message } = parts(error);
  const name = providerName(provider);
  if (isLinkingDisabled(error))
    return `Removing a way to sign in isn’t switched on yet. ${name} still works. Please try again soon, or write to ${supportEmail}.`;
  if (code === 'single_identity_not_deletable' || /at least 2 identities|only (?:one|identity)/.test(message))
    return 'This is your only way to sign in, so it has to stay. Add another way first.';
  if (code === 'email_conflict_identity_not_deletable')
    return `${name} has to stay for now: taking it off would move your account onto an email address another account already uses. Write to ${supportEmail} and we’ll help.`;
  if (code === 'identity_not_found' || /identity.*not.*(?:found|exist)/.test(message))
    return `${name} was already removed from your account.`;
  if (/session|jwt|signed out|not authenticated/.test(message)) return 'Your session has ended. Please sign in again.';
  if (/network|fetch|offline/.test(message)) return 'The cloud could not be reached. Check your connection and try again.';
  return `${name} couldn’t be removed just now. Nothing has changed; please try again.`;
}

export const linkedMessage = (provider: string) => `${providerName(provider)} is now one of your ways to sign in.`;
export const unlinkedMessage = (provider: string) =>
  `${providerName(provider)} has been removed. Your other ways to sign in still open this account.`;
export const passwordAddedMessage = (email: string) =>
  `You can now sign in with ${email || 'your email address'} and this password, in the app and on the website.`;
