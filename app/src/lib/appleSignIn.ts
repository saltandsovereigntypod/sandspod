import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { signInThroughBrowser } from './googleSignIn';
import { supabase } from './supabase';

export type AppleSignInResult = 'signed-in' | 'cancelled';

/**
 * On Android, Apple's sign-in page opens in the browser. It needs the Supabase
 * project's Apple provider set up for the web (a Services ID and its secret),
 * so it shows only once that's done (extra.appleBrowserSignIn in app.json).
 */
export const appleInBrowser = Platform.OS === 'android' && Constants.expoConfig?.extra?.appleBrowserSignIn === true;

/** Sign in with Apple: the system sheet on iPhones and iPads, the browser on Android. */
export async function appleSignInAvailable(): Promise<boolean> {
  if (appleInBrowser) return true;
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
  if (appleInBrowser) {
    const result = await signInThroughBrowser('apple');
    return result === 'cancelled' ? 'cancelled' : 'signed-in';
  }
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
