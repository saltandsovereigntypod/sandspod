// Your covens as the planning reminders need them: whether you lead (the
// head of the coven, or a position that leads or schedules its rites), the
// coven's own holidays to come, and its rites with your answer. Pure, so the
// website builds the same from the same rows.

import { permissions, type Coven, type Member, type Rank, type Ritual, type Rsvp } from '../covens/model.ts';
import { covenHolidaysBetween } from '../covens/programs.ts';
import { baseIdOf } from './holidays.ts';
import type { CovenSource } from './plan.ts';

export type Standing = { coven: Coven; membership: Member | null; ranks: Rank[] };
export type RiteEntry = { coven: Pick<Coven, 'id'>; ritual: Ritual; response: Rsvp['response'] | null };

/** Whether you lead this coven's rites. */
export function leadsCoven(standing: Standing, userId: string | null): boolean {
  const p = permissions({ coven: standing.coven, membership: standing.membership, ranks: standing.ranks, userId });
  return p.founder || p.manage || p.lead || p.schedule;
}

/** Whether you decide this coven's applications and requests to advance (the head, or a position that reviews or leads). */
export function reviewsCoven(standing: Standing, userId: string | null): boolean {
  return permissions({ coven: standing.coven, membership: standing.membership, ranks: standing.ranks, userId }).review;
}

/** Each coven you're in, with its holidays over the next `days` and its rites to come. */
export function covenSources(standings: Standing[], rites: RiteEntry[], userId: string | null, now: Date, days = 90): CovenSource[] {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return standings.map((standing) => ({
    id: standing.coven.id,
    slug: standing.coven.slug,
    name: standing.coven.name,
    leader: leadsCoven(standing, userId),
    reviewer: reviewsCoven(standing, userId),
    holidays: covenHolidaysBetween(standing.coven, from, to)
      .filter((h) => h.date.getTime() >= from.getTime())
      .map((h) => ({ baseId: baseIdOf(h.id), name: h.name, date: h.date, days: h.days })),
    rites: rites.filter((r) => r.coven.id === standing.coven.id).map(({ ritual, response }) => ({ ritual, response })),
  }));
}
