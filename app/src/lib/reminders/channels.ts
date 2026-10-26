// Android notification channels, one for each kind of reminder, so people
// can mute or change any of them in the phone's own settings. Pure.

import type { ReminderKind } from './schedule.ts';

export type Channel = { id: string; name: string; description: string; quiet?: boolean };

export const CHANNELS: Channel[] = [
  // The first channel keeps its id, so reminders set before there were others stay where they were.
  { id: 'moon-reminders', name: 'Moon and ritual reminders', description: 'Moon phases, planned rituals and look-back days.' },
  { id: 'holiday-reminders', name: 'Holidays and sacred days', description: 'Holidays from your calendars, Hekate’s Deipnon and your deities’ sacred days.' },
  { id: 'tending-reminders', name: 'Tending', description: 'Plants, altars, offerings, crystals and candles.', quiet: true },
  { id: 'planning-reminders', name: 'Ritual planning and coven rites', description: 'Time to plan a ritual for a holiday, and your covens’ rites.' },
  { id: 'practice-reminders', name: 'Daily practice', description: 'Morning and evening devotion, and the dream journal.', quiet: true },
  { id: 'summary-reminders', name: 'The day’s reminders together', description: 'One note for a busy day, in place of many.' },
];

const BY_KIND: Record<ReminderKind, string> = {
  moon: 'moon-reminders',
  ritual: 'moon-reminders',
  lookback: 'moon-reminders',
  holiday: 'holiday-reminders',
  deipnon: 'holiday-reminders',
  sacred: 'holiday-reminders',
  watering: 'tending-reminders',
  offering: 'tending-reminders',
  altar: 'tending-reminders',
  crystal: 'tending-reminders',
  candle: 'tending-reminders',
  planning: 'planning-reminders',
  coven: 'planning-reminders',
  devotion: 'practice-reminders',
  dream: 'practice-reminders',
  summary: 'summary-reminders',
};

/** The channel a reminder rings on. */
export const channelOf = (kind: ReminderKind): string => BY_KIND[kind] ?? CHANNELS[0].id;
