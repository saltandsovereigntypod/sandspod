// The refs of holy-day and moon pages, worked out without loading the pages
// themselves, so Today (and the website's Today bundle) can link to them
// cheaply. lib/holy/index.ts re-exports these. Pure.

import type { MoonState } from '../moon.ts';

/**
 * The page ref for a holiday or calendar event id as Today has it: holidays
 * carry their date ("hellenic-lenaia-2026-0-30"), calendar events don't
 * ("roman-cerialia"); the southern Wheel shares the northern pages.
 */
export function holyRef(id: string): string {
  const ref = id.replace(/-\d{4}-\d{1,2}-\d{1,2}$/, '');
  return ref.startsWith('wheel_south-') ? `wheel-${ref.slice('wheel_south-'.length)}` : ref;
}

const PHASE_REF: Record<string, string> = {
  'New Moon': 'moon-new',
  'Waxing Crescent': 'moon-waxing-crescent',
  'First Quarter': 'moon-first-quarter',
  'Waxing Gibbous': 'moon-waxing-gibbous',
  'Full Moon': 'moon-full',
  'Waning Gibbous': 'moon-waning-gibbous',
  'Last Quarter': 'moon-last-quarter',
  'Waning Crescent': 'moon-waning-crescent',
};
const PRINCIPAL_REF: Record<string, string> = { new: 'moon-new', firstQuarter: 'moon-first-quarter', full: 'moon-full', lastQuarter: 'moon-last-quarter' };

/**
 * The page ref for the moon as it is: the dark moon in the day or so either
 * side of new (when there is a dark-moon page; `hasDark` says whether there is).
 */
export function moonRef(moon: Pick<MoonState, 'name' | 'illumination'>, hasDark = true): string {
  if (moon.illumination < 0.015 && hasDark) return 'moon-dark';
  return PHASE_REF[moon.name] ?? 'moon-full';
}

/** The page ref for a principal phase (new, firstQuarter, full, lastQuarter), as On the horizon has them. */
export const principalRef = (phase: string) => PRINCIPAL_REF[phase] ?? 'moon-full';
