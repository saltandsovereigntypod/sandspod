// Account deletion goes through the website's `delete-account` Edge Function
// (supabase/functions/delete-account). The app never holds a privileged key:
// the function reads who you are from your session and deletes only you.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../supabase';
import { interpretDeleteResponse, type DeleteResult } from './accountRules';

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
