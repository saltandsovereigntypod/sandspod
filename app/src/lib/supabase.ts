import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// The app shares the website's Supabase projects so one account works in both.
// Only browser-safe publishable keys belong here; never a service-role key.
// Defaults point at the development project (same values as js/environment.js).
// Release builds set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY to production.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://aiiqyesczxrrujznwoke.supabase.co';
const key =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'sb_publishable_QWf1B9BxGQkeFQsuJ4Mn3w_NvXytwVg';

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // PKCE lets Google sign-in hand back a one-time code instead of tokens in
    // the URL. On the web the client exchanges that code when the page loads.
    flowType: 'pkce',
    detectSessionInUrl: Platform.OS === 'web',
  },
});
