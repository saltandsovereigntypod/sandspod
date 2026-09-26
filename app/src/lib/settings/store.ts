// Reading and saving Sanctuary settings. Guests keep them on the device;
// signed-in people read and upsert their `user_settings` row, with a copy
// kept on the device so settings still open offline (as on the website).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useSession } from '../session';
import { supabase } from '../supabase';
import { normalizeSettings, settingsRow, SETTINGS_LOCAL_KEY, type Settings } from './defaults';

async function readLocal(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_LOCAL_KEY);
    return normalizeSettings(raw ? JSON.parse(raw) : {});
  } catch {
    return normalizeSettings({});
  }
}

async function writeLocal(settings: Settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(normalizeSettings(settings)));
  } catch {
    // Storage full or unavailable; the cloud copy (if any) still saved.
  }
}

/** Current settings for a person (or the device, for guests). Never throws. */
export async function getMySettings(userId: string | null): Promise<Settings> {
  if (!userId) return readLocal();
  const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
  if (error) return readLocal();
  return normalizeSettings(data ?? {});
}

export async function saveMySettings(settings: Settings, userId: string | null): Promise<Settings> {
  const normalized = normalizeSettings(settings);
  await writeLocal(normalized);
  if (!userId) return normalized;
  const { error } = await supabase.from('user_settings').upsert(settingsRow(normalized, userId), { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
  return normalized;
}

type Status = 'loading' | 'ready' | 'offline';

// One shared copy so every screen (Settings, Library, Offer) agrees.
let cached: { userId: string | null; settings: Settings } | null = null;
const listeners = new Set<() => void>();
let version = 0;
const notify = () => listeners.forEach((listener) => listener());

/** Re-read settings everywhere, e.g. after a restore wrote new ones. */
export function reloadMySettings() {
  cached = null;
  version += 1;
  notify();
}

export function useMySettings() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [, rerender] = useState(0);
  const [seen, setSeen] = useState(version);
  const [status, setStatus] = useState<Status>(cached && cached.userId === userId ? 'ready' : 'loading');

  useEffect(() => {
    const listener = () => {
      rerender((n) => n + 1);
      setSeen(version);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!cached || cached.userId !== userId) {
        cached = { userId, settings: await readLocal() };
        notify();
      }
      if (!userId) {
        if (active) setStatus('ready');
        return;
      }
      const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle();
      if (!active) return;
      if (error) {
        setStatus('offline');
        return;
      }
      cached = { userId, settings: normalizeSettings(data ?? {}) };
      await writeLocal(cached.settings);
      setStatus('ready');
      notify();
    })().catch(() => active && setStatus('offline'));
    return () => {
      active = false;
    };
  }, [userId, seen]);

  const save = useCallback(
    async (next: Settings) => {
      const saved = await saveMySettings(next, userId);
      cached = { userId, settings: saved };
      notify();
      return saved;
    },
    [userId],
  );

  const settings = cached && cached.userId === userId ? cached.settings : null;
  return { settings, status, save, signedIn: !!userId };
}
