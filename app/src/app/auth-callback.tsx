import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { supabase } from '../lib/supabase';

// Google sign-in, password recovery and email-change links return here on
// phones. The in-app browser normally catches Google's link first; links opened
// from an email arrive here with a one-time code to exchange. A recovery code
// raises PASSWORD_RECOVERY, which the root layout answers with the new-password
// prompt. Either way, go home afterwards and let the session decide.
export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [done, setDone] = useState(!code || Platform.OS === 'web');

  useEffect(() => {
    if (done || typeof code !== 'string') return;
    // An already-used code (e.g. Google finished in the in-app browser) just fails quietly.
    supabase.auth
      .exchangeCodeForSession(code)
      .catch(() => {})
      .finally(() => setDone(true));
  }, [code, done]);

  if (!done) return null;
  return <Redirect href="/" />;
}
