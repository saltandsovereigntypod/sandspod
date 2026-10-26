// Reminder choices live on the device, so they work without an account.
// Whenever the choices or the planned rituals change, the next weeks of
// reminders are rescheduled from scratch.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { deipnonReminders, offersDeipnon } from '../deipnon';
import { sacredSources } from '../patron';
import { itemLookBackReminder } from '../altar/apothecaryLookBack';
import { getWorkshop, subscribeWorkshop } from '../altar/workshop';
import { lookBackReminder } from '../rituals/lookBack';
import { getRituals, loadPlans, subscribeRituals } from '../rituals/store';
import { cachedSettings, subscribeSettings } from '../settings/store';
import type { RitualPlan } from '../rituals/types';
import type { OfferingDue } from '../altar/offerings';
import type { WateringDue } from '../altar/pottedPlants';
import { syncSkyCalendar } from './calendarStore';
import { applySchedule, permissionState, remindersSupported, requestPermission, type PermissionState } from './notifier';
import { anyReminders, buildSchedule, DEFAULT_SETTINGS, DEVOTION_DAYS, normalizeSettings, type ReminderSettings } from './schedule';

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
/** Potted plants on your altars that would like water soon (set by the altar keeper). */
let wateringDue: WateringDue[] = [];
let wateringKey = '';

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
      // Rituals and spells in the journal, and the spell jars, sachets and the rest of My Apothecary.
      const lookBacks = [...getRituals().journal.map(lookBackReminder), ...getWorkshop().apothecary.map(itemLookBackReminder)].filter(
        (r): r is NonNullable<typeof r> => !!r,
      );
      const now = new Date();
      const deipna = deipnonReminders(cachedSettings(), now, DEVOTION_DAYS + 1);
      const reminders = buildSchedule(state.settings, getRituals().plans, now, undefined, sacredSources(cachedSettings()), lookBacks, offeringsDue, wateringDue, deipna);
      const permission = remindersSupported ? await permissionState() : 'unavailable';
      const scheduled = await applySchedule(permission === 'granted' ? reminders : []);
      set({ permission, scheduled });
    } catch {
      // Scheduling is best effort; the settings are still saved.
    }
  });
  return syncing;
}

/** Every look-back day waiting to be asked, as one string, to notice when it changes. */
function lookBackKeys(): string {
  return [...getRituals().journal.map((entry) => lookBackReminder(entry)?.key ?? ''), ...getWorkshop().apothecary.map((item) => itemLookBackReminder(item)?.key ?? '')]
    .filter(Boolean)
    .join(',');
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
    const lookBacks = lookBackKeys();
    if (plans !== lastPlans || lookBacks !== lastLookBacks) {
      lastPlans = plans;
      lastLookBacks = lookBacks;
      void syncReminders();
    }
  });
  // A spell jar or sachet's look-back day changes when it's made or answered.
  subscribeWorkshop(() => {
    const lookBacks = lookBackKeys();
    if (lookBacks !== lastLookBacks) {
      lastLookBacks = lookBacks;
      if (state.settings.lookBacks) void syncReminders();
    }
  });
  // Your deities' sacred days follow Settings → My deities; Hekate's Deipnon follows them and your calendars.
  const deipnonKey = () => String(offersDeipnon(cachedSettings()));
  let lastDeities = String(cachedSettings()?.my_deities ?? '');
  let lastDeipnon = deipnonKey();
  subscribeSettings(() => {
    const deities = String(cachedSettings()?.my_deities ?? '');
    const deipnon = deipnonKey();
    if (deities !== lastDeities || deipnon !== lastDeipnon) {
      const changedDeipnon = deipnon !== lastDeipnon;
      lastDeities = deities;
      lastDeipnon = deipnon;
      if (state.settings.sacredDays || changedDeipnon) void syncReminders();
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

/** The altar keeper's latest list of potted plants that would like water; reschedules when it changes and watering reminders are on. */
export function setWateringDue(due: WateringDue[]) {
  const key = due.map((d) => `${d.altarId}:${d.objectId}:${d.dueAt}`).join('|');
  if (key === wateringKey) return;
  wateringKey = key;
  wateringDue = due;
  if (state.settings.watering) void syncReminders();
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
