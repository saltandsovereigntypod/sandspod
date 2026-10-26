// "Ways to sign in" in More → Account: the account's identities, and adding
// or removing Apple, Google, or email and password. Matches the website's
// js/sign-in-methods.js; the wording and rules are in ./signInMethods.

import type { UserIdentity } from '@supabase/supabase-js';

import { linkApple } from '../appleSignIn';
import { linkThroughBrowser, type LinkResult } from '../googleSignIn';
import { supabase } from '../supabase';
import { validatePasswordPair } from './accountRules';
import { PASSWORD_FLAG } from './signInMethods';

export async function loadIdentities(): Promise<UserIdentity[]> {
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) throw error;
  return data.identities;
}

/** Adds Apple or Google. Throws Supabase's error for linkErrorMessage. */
export function addWay(provider: 'apple' | 'google'): Promise<LinkResult> {
  return provider === 'apple' ? linkApple() : linkThroughBrowser('google');
}

/** Takes one identity off the account, then refreshes the session so the account screen shows it. */
export async function removeWay(identity: UserIdentity): Promise<void> {
  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) throw error;
  await supabase.auth.refreshSession().catch(() => {});
}

/**
 * Gives an Apple or Google account a password, so its email address and that
 * password open it too. Supabase doesn't list this as an identity, so the
 * account remembers it in its metadata (PASSWORD_FLAG), as the website does.
 */
export async function addPassword(password: string, confirmation: string): Promise<void> {
  const validation = validatePasswordPair(password, confirmation);
  if (!validation.valid) throw new Error(validation.message);
  const { error } = await supabase.auth.updateUser({ password, data: { [PASSWORD_FLAG]: true } });
  if (error) throw error;
}
