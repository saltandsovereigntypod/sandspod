// Reminder choices live on the device, so they work without an account.
// Whenever the choices or the planned rituals change, the next weeks of
// reminders are rescheduled from scratch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { getRituals, loadPlans, subscribeRituals } from '../rituals/store';
import type { RitualPlan } from '../rituals/types';
import { syncSkyCalendar } from './calendarStore';
import { applySchedule, permissionState, remindersSupported, requestPermission, type PermissionState } from './notifier';
import { anyReminders, buildSchedule, DEFAULT_SETTINGS, normalizeSettings, type ReminderSettings } from './schedule';

const SETTINGS_KEY = 'reminders.settings.v1';

type RemindersState = {
  loaded: boolean;
  settings: ReminderSettings;
  permission: PermissionState;
  /** How many reminders are waiting on this phone. */
  scheduled: number;
};

let state: RemindersState = { loaded: false, settings: DEFAULT_SETTINGS, permission: 'undetermined', scheduled: 0 };
const listeners = new Set<() => void>();
let started = false;
let lastPlans: RitualPlan[] | null = null;
let syncing: Promise<void> = Promise.resolve();

function set(patch: Partial<RemindersState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => state;

/** Reschedule everything. Serialized so two quick changes can't interleave. */
export function syncReminders(): Promise<void> {
  syncing = syncing.then(async () => {
    if (!state.loaded) return;
    try {
      const reminders = buildSchedule(state.settings, getRituals().plans, new Date());
      const permission = remindersSupported ? await permissionState() : 'unavailable';
      const scheduled = await applySchedule(permission === 'granted' ? reminders : []);
      set({ permission, scheduled });
    } catch {
      // Scheduling is best effort; the settings are still saved.
    }
  });
  return syncing;
}

async function start() {
  if (started) return;
  started = true;
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    set({ settings: normalizeSettings(raw ? JSON.parse(raw) : null) });
  } catch {
    // Keep the defaults.
  }
  await loadPlans();
  set({ loaded: true });
  lastPlans = getRituals().plans;
  subscribeRituals(() => {
    const plans = getRituals().plans;
    if (plans !== lastPlans) {
      lastPlans = plans;
      void syncReminders();
    }
  });
  // Top up the rolling window every time the app opens.
  await syncReminders();
  void syncSkyCalendar(state.settings.phases);
}

export async function updateReminderSettings(change: Partial<ReminderSettings>): Promise<PermissionState> {
  const settings = normalizeSettings({ ...state.settings, ...change });
  set({ settings });
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Still applied for this session.
  }
  let permission = state.permission;
  if (remindersSupported && anyReminders(settings) && permission !== 'granted') {
    permission = await requestPermission();
    set({ permission });
  }
  await syncReminders();
  if (change.phases) void syncSkyCalendar(settings.phases);
  return permission;
}

/** After planning a ritual: ask once for notifications so its reminder can ring. */
export async function askForRitualReminders() {
  await start();
  if (!remindersSupported || !state.settings.rituals || state.permission === 'granted') return;
  if ((await permissionState()) === 'undetermined') set({ permission: await requestPermission() });
  await syncReminders();
}

export function useReminders(): RemindersState {
  useEffect(() => {
    void start();
  }, []);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
