import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export type GoogleSignInResult = 'signed-in' | 'redirecting' | 'cancelled';

/**
 * Where Supabase sends people back to after Google, a recovery link or an
 * email change: the site root on the web, the app's auth-callback link on a phone.
 */
export function authReturnUrl(): string {
  return Platform.OS === 'web' ? `${window.location.origin}/` : Linking.createURL('auth-callback');
}

/**
 * Signs in with the same Google account as the website.
 * On the web the page leaves for Google and comes back with a code, which the
 * Supabase client exchanges on load. On a phone Google opens in an in-app
 * browser that hands the code back through the app's link.
 * Every return address must be on the Supabase project's redirect allow-list.
 */
export function signInWithGoogle(): Promise<GoogleSignInResult> {
  return signInThroughBrowser('google');
}

/** The browser sign-in Google uses, for any provider (Apple uses it on Android). */
export async function signInThroughBrowser(provider: 'google' | 'apple'): Promise<GoogleSignInResult> {
  const name = provider === 'google' ? 'Google' : 'Apple';
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: authReturnUrl() },
    });
    if (error) throw error;
    return 'redirecting';
  }

  const redirectTo = authReturnUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return 'cancelled';

  const { queryParams } = Linking.parse(result.url);
  const failure = queryParams?.error_description ?? queryParams?.error;
  if (failure) throw new Error(String(failure));
  const code = queryParams?.code;
  if (typeof code !== 'string') throw new Error(`${name} did not return a sign-in code.`);

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    // The auth-callback screen may have opened the same link and used the code first.
    const { data: current } = await supabase.auth.getSession();
    if (!current.session) throw exchangeError;
  }
  return 'signed-in';
}
