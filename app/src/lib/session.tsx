import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from './supabase';

const GUEST_KEY = 'sanctuary.guest';

type SessionState = {
  ready: boolean;
  session: Session | null;
  /** True once someone chose "Continue as a guest" on this device. */
  guest: boolean;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([supabase.auth.getSession(), AsyncStorage.getItem(GUEST_KEY)])
      .then(([{ data }, storedGuest]) => {
        if (!active) return;
        setSession(data.session);
        setGuest(storedGuest === 'true');
      })
      .catch(() => {
        // Offline or storage unavailable: start signed out, never block launch.
      })
      .finally(() => active && setReady(true));

    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      ready,
      session,
      guest,
      continueAsGuest: async () => {
        setGuest(true);
        await AsyncStorage.setItem(GUEST_KEY, 'true');
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setGuest(false);
        await AsyncStorage.removeItem(GUEST_KEY);
      },
    }),
    [ready, session, guest],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
