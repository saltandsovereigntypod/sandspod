import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export type AppleSignInResult = 'signed-in' | 'cancelled';

/** Sign in with Apple is offered on iPhones and iPads only. */
export async function appleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Signs in with the person's Apple ID through the system sheet, then hands
 * Apple's identity token to Supabase. The Supabase project's Apple provider
 * must list the app's bundle ID (com.saltandsovereignty.app) as a client ID.
 */
export async function signInWithApple(): Promise<AppleSignInResult> {
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return 'cancelled';
    throw error;
  }
  if (!credential.identityToken) throw new Error('Apple did not return a sign-in token.');

  const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
  if (error) throw error;

  // Apple shares the name only on the very first sign-in, so keep it then.
  const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
  if (name) await supabase.auth.updateUser({ data: { full_name: name } });
  return 'signed-in';
}
