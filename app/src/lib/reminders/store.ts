// Reminder choices live on the device, so they work without an account.
// Whenever the choices or the planned rituals change, the next weeks of
// reminders are rescheduled from scratch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { sacredSources } from '../patron';
import { lookBackReminder } from '../rituals/lookBack';
import { getRituals, loadPlans, subscribeRituals } from '../rituals/store';
import { cachedSettings, subscribeSettings } from '../settings/store';
import type { RitualPlan } from '../rituals/types';
import type { OfferingDue } from '../altar/offerings';
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
let lastLookBacks = '';
let syncing: Promise<void> = Promise.resolve();
/** Offerings on your altars that want tending soon (set by the altar keeper). */
let offeringsDue: OfferingDue[] = [];
let offeringsKey = '';

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
      const lookBacks = getRituals()
        .journal.map(lookBackReminder)
        .filter((r): r is NonNullable<typeof r> => !!r);
      const reminders = buildSchedule(state.settings, getRituals().plans, new Date(), undefined, sacredSources(cachedSettings()), lookBacks, offeringsDue);
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
    // Look-back days change when a ritual is journaled or answered.
    const lookBacks = getRituals()
      .journal.map((entry) => lookBackReminder(entry)?.key ?? '')
      .filter(Boolean)
      .join(',');
    if (plans !== lastPlans || lookBacks !== lastLookBacks) {
      lastPlans = plans;
      lastLookBacks = lookBacks;
      void syncReminders();
    }
  });
  // Your deities' sacred days follow Settings → My deities.
  let lastDeities = String(cachedSettings()?.my_deities ?? '');
  subscribeSettings(() => {
    const deities = String(cachedSettings()?.my_deities ?? '');
    if (deities !== lastDeities) {
      lastDeities = deities;
      if (state.settings.sacredDays) void syncReminders();
    }
  });
  // Top up the rolling window every time the app opens.
  await syncReminders();
  void syncSkyCalendar(state.settings.phases);
}

/** The altar keeper's latest list of offerings that want tending; reschedules when it changes and offering reminders are on. */
export function setOfferingsDue(due: OfferingDue[]) {
  const key = due.map((d) => `${d.altarId}:${d.objectId}:${d.dueAt}`).join('|');
  if (key === offeringsKey) return;
  offeringsKey = key;
  offeringsDue = due;
  if (state.settings.offerings) void syncReminders();
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
