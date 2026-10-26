// Reminder choices: the moon, planned rituals, devotions and dreams live on
// the device (`reminders.settings.v1`), so they work without an account; the
// newer kinds (holidays, tending, ritual planning, quiet hours and the pause)
// live in Sanctuary settings (`reminders_v2`, prefs.ts) and follow you to the
// website. Whenever the choices, your calendars, your altars or your covens
// change, and every time the app comes to the front, the next weeks of
// reminders are worked out again (plan.ts) and rescheduled from scratch, so
// the phone's limit is a rolling window rather than a wall.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { offersDeipnon } from '../deipnon';
import { itemLookBackReminder } from '../altar/apothecaryLookBack';
import { getWorkshop, subscribeWorkshop } from '../altar/workshop';
import { readPlace } from '../location';
import { lookBackReminder } from '../rituals/lookBack';
import { getRituals, loadPlans, subscribeRituals } from '../rituals/store';
import { cachedSettings, subscribeSettings } from '../settings/store';
import type { RitualPlan } from '../rituals/types';
import { syncSkyCalendar } from './calendarStore';
import { applySchedule, permissionState, remindersSupported, requestPermission, type PermissionState } from './notifier';
import { anyPlanned, planReminders, type CovenSource } from './plan';
import { PREFS_KEY, readPrefs, type ReminderPrefs } from './prefs';
import { anyReminders, DEFAULT_SETTINGS, normalizeSettings, type ReminderSettings } from './schedule';
import { EMPTY_SOURCES, type TendingSources } from './sources';

const SETTINGS_KEY = 'reminders.settings.v1';

type RemindersState = {
  loaded: boolean;
  settings: ReminderSettings;
  /** The synced choices (prefs.ts), as read from settings (or worked out from the older ones). */
  prefs: ReminderPrefs;
  permission: PermissionState;
  /** How many reminders are waiting on this phone. */
  scheduled: number;
  /** The altars, plants, crystals and candles the tending reminders are about. */
  sources: TendingSources;
  /** Your covens, for planning reminders and rites. */
  covens: CovenSource[];
};

let state: RemindersState = {
  loaded: false,
  settings: DEFAULT_SETTINGS,
  prefs: readPrefs(null, DEFAULT_SETTINGS),
  permission: 'undetermined',
  scheduled: 0,
  sources: EMPTY_SOURCES,
  covens: [],
};
const listeners = new Set<() => void>();
let started = false;
let lastPlans: RitualPlan[] | null = null;
let lastLookBacks = '';
let syncing: Promise<void> = Promise.resolve();
let sourcesKey = '';
let covensKey = '';

function set(patch: Partial<RemindersState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => state;

/** The prefs as settings hold them now. */
const currentPrefs = () => readPrefs(cachedSettings(), state.settings);

/** Reschedule everything. Serialized so two quick changes can't interleave. */
export function syncReminders(): Promise<void> {
  syncing = syncing.then(async () => {
    if (!state.loaded) return;
    try {
      // Rituals and spells in the journal, and the spell jars, sachets and the rest of My Apothecary.
      const lookBacks = [...getRituals().journal.map(lookBackReminder), ...getWorkshop().apothecary.map(itemLookBackReminder)].filter(
        (r): r is NonNullable<typeof r> => !!r,
      );
      const prefs = currentPrefs();
      const place = await readPlace().catch(() => null);
      const reminders = planReminders({
        appSettings: cachedSettings(),
        legacy: state.settings,
        prefs,
        plans: getRituals().plans,
        lookBacks,
        sources: state.sources,
        covens: state.covens,
        place: place ? { latitude: place.latitude, longitude: place.longitude } : null,
        now: new Date(),
      });
      const permission = remindersSupported ? await permissionState() : 'unavailable';
      const scheduled = await applySchedule(permission === 'granted' ? reminders : []);
      set({ permission, scheduled, prefs });
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

/** The settings the reminders read, as one string, to notice when any of them changes. */
function settingsKey(): string {
  const s = cachedSettings();
  if (!s) return '';
  return [PREFS_KEY, 'my_deities', 'deipnon_prompt', 'calendar_traditions', 'calendar_picked_holidays', 'calendar_custom_holidays', 'calendar_hidden_traditions', 'calendar_extra', 'calendar_hemisphere']
    .map((key) => `${key}=${String(s[key] ?? '')}`)
    .concat(Object.keys(s).filter((k) => k.startsWith('calendar_opt_')).sort().map((k) => `${k}=${String(s[k])}`))
    .concat(String(offersDeipnon(s)))
    .join('|');
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
  set({ loaded: true, prefs: currentPrefs() });
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
  // Holidays follow your calendars, your deities, the Deipnon and the reminder choices themselves.
  let lastSettings = settingsKey();
  subscribeSettings(() => {
    const next = settingsKey();
    if (next === lastSettings) return;
    lastSettings = next;
    set({ prefs: currentPrefs() });
    void syncReminders();
  });
  // Top up the rolling window every time the app opens or comes back to the front.
  AppState.addEventListener('change', (next) => {
    if (next === 'active') void syncReminders();
  });
  await syncReminders();
  void syncSkyCalendar(state.settings.phases);
}

/** The altar keeper's latest view of your altars and stones; reschedules when it changes. */
export function setTendingSources(sources: TendingSources) {
  const key = JSON.stringify([
    sources.altars.map((a) => `${a.id}:${a.name}`),
    sources.plants.map((p) => `${p.id}:${p.dueAt}:${p.lastWatered}:${p.who}`),
    sources.offerings.map((d) => `${d.altarId}:${d.objectId}:${d.dueAt}`),
    sources.crystals.map((c) => `${c.id}:${c.key}:${c.name}`),
    sources.candles.map((c) => `${c.id}:${c.lit}:${c.burnoutAt}:${c.working}`),
  ]);
  if (key === sourcesKey) return;
  sourcesKey = key;
  set({ sources });
  void syncReminders();
}

/** Your covens, their holidays and rites (covens/reminders.ts); reschedules when they change. */
export function setCovenSources(covens: CovenSource[]) {
  const key = JSON.stringify(covens.map((c) => [c.id, c.leader, !!c.reviewer, c.name, c.holidays.map((h) => `${h.baseId}:${h.date.getTime()}`), c.rites.map((r) => `${r.ritual.id}:${r.ritual.status}:${r.ritual.scheduled_for}:${r.response}`)]));
  if (key === covensKey) return;
  covensKey = key;
  set({ covens });
  void syncReminders();
}

/** Ask for notifications if something is now chosen that could ring. */
async function askIfNeeded(settings: ReminderSettings, prefs: ReminderPrefs): Promise<PermissionState> {
  let permission = state.permission;
  if (remindersSupported && (anyReminders(settings) || anyPlanned(prefs)) && permission !== 'granted') {
    permission = await requestPermission();
    set({ permission });
  }
  return permission;
}

export async function updateReminderSettings(change: Partial<ReminderSettings>): Promise<PermissionState> {
  const settings = normalizeSettings({ ...state.settings, ...change });
  set({ settings });
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Still applied for this session.
  }
  const permission = await askIfNeeded(settings, currentPrefs());
  await syncReminders();
  if (change.phases) void syncSkyCalendar(settings.phases);
  return permission;
}

/** After the synced prefs were saved (screens save them with the rest of settings): ask for notifications if needed, and reschedule. */
export async function remindersPrefsChanged(prefs: ReminderPrefs): Promise<PermissionState> {
  set({ prefs });
  const permission = await askIfNeeded(state.settings, prefs);
  await syncReminders();
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
