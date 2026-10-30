// Sharing "in moon time" with a coven: a separate, deliberate status, never
// drawn from the encrypted notes. Only one of these few words is ever
// published (the database refuses anything else: 20261117000000_cycle_moon.sql),
// to the covens and people chosen, for a few days. No dates, no notes. Pure.

export type MoonStatus = 'moon_time' | 'moon_time_resting' | 'resting' | 'quiet';

export const STATUS_OPTIONS: { value: MoonStatus; label: string }[] = [
  { value: 'moon_time', label: 'In moon time' },
  { value: 'moon_time_resting', label: 'In moon time · resting' },
  { value: 'resting', label: 'Resting · gentle days' },
  { value: 'quiet', label: 'Keeping quiet for a few days' },
];

/** How long it shows before it clears itself. */
export const STATUS_DAYS = [1, 3, 5, 7] as const;

export const isMoonStatus = (value: unknown): value is MoonStatus => STATUS_OPTIONS.some((o) => o.value === value);
export const statusLabel = (value: unknown) => STATUS_OPTIONS.find((o) => o.value === value)?.label ?? '';

/** The row that shares it (`cycle_moon_status`). */
export function statusRow(userId: string, status: MoonStatus, covens: string[], people: string[], days: number, now: Date) {
  const until = new Date(now.getTime() + Math.max(1, Math.min(7, days)) * 86_400_000);
  return { user_id: userId, status, shared_covens: [...new Set(covens)], shared_people: [...new Set(people)].filter((id) => id !== userId), expires_at: until.toISOString() };
}

/** Whether a shared status still shows. */
export const statusLive = (row: { expires_at?: string | null } | null | undefined, now: Date) => !!row?.expires_at && Date.parse(row.expires_at) > now.getTime();
