// Account deletion goes through the website's `delete-account` Edge Function
// (supabase/functions/delete-account). The app never holds a privileged key:
// the function reads who you are from your session and deletes only you.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { authReturnUrl } from '../googleSignIn';
import { supabase } from '../supabase';
import {
  authMessage,
  interpretDeleteResponse,
  isEmailAddress,
  validateEmailChange,
  validatePasswordPair,
  type DeleteResult,
} from './accountRules';

export * from './accountRules';

/**
 * On now that `delete-account` is deployed on sandspod-dev and accepts the app
 * (phones send no Origin; the web app's address is allowed). A build can still
 * switch it off with EXPO_PUBLIC_ACCOUNT_DELETION=off.
 */
export const ACCOUNT_DELETION_ENABLED = process.env.EXPO_PUBLIC_ACCOUNT_DELETION !== 'off';

export async function requestAccountDeletion(): Promise<DeleteResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return interpretDeleteResponse(401, { error: 'authentication_required' });
  try {
    const { data, error, response } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
      body: {},
    });
    if (!error) return interpretDeleteResponse(200, data);
    const status = response?.status ?? 0;
    let body: unknown = null;
    try {
      body = response ? await response.clone().json() : null;
    } catch {
      body = null;
    }
    return interpretDeleteResponse(status, body);
  } catch {
    return interpretDeleteResponse(0, null);
  }
}

/** After a completed deletion: drop this person's copies kept on the device. */
export async function forgetAccountOnDevice(userId: string): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const mine = keys.filter((key) => key.includes(userId));
    if (mine.length) await AsyncStorage.multiRemove(mine);
  } catch {
    // Nothing more to do; the account itself is already gone.
  }
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // The server session is gone with the account.
  }
}

// Password and email changes, matching the website's js/account-data.js.
// Each throws an Error whose message is ready to show.

export async function requestRecovery(email: string): Promise<string> {
  const address = email.trim();
  if (!isEmailAddress(address)) throw new Error('Enter a complete email address.');
  const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: authReturnUrl() });
  if (error) throw new Error(authMessage(error, 'recovery'));
  return 'If an account exists for that email, a recovery link has been sent.';
}

export async function updatePassword(password: string, confirmation: string): Promise<void> {
  const validation = validatePasswordPair(password, confirmation);
  if (!validation.valid) throw new Error(validation.message);
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(authMessage(error));
}

export async function requestEmailChange(
  currentEmail: string | null | undefined,
  email: string,
  confirmation: string,
): Promise<void> {
  const validation = validateEmailChange(currentEmail, email, confirmation);
  if (!validation.valid) throw new Error(validation.message);
  const { error } = await supabase.auth.updateUser({ email: validation.email }, { emailRedirectTo: authReturnUrl() });
  if (error) throw new Error(authMessage(error));
}
