// A composed reading (tea leaves, smoke, wax, charms, geomancy) as an entry
// for the reading log (hedge.readings), so it sits with every other
// divination, can be looked back on and shows on the altar. Pure.

import { lookBackFrom, moonForReading, type Reading, type ReadingMethod } from '../craft/hedge/readings.ts';
import { localDateKey } from '../rituals/lifecycle.ts';

export type KeepInput = {
  method: ReadingMethod;
  question: string;
  /** What was seen or drawn, in order: the shapes, the charms, the figures. */
  drawn: string[];
  /** The reading as written. */
  text: string;
  date?: Date;
  /** Days until the look-back (default a week). */
  lookBackDays?: number;
};

export function readingToKeep(input: KeepInput): Reading {
  const date = localDateKey(input.date ?? new Date());
  return {
    date,
    method: input.method,
    question: input.question.trim(),
    drawn: input.drawn,
    cameUp: input.text,
    interpretation: '',
    lookBack: lookBackFrom(date, input.lookBackDays ?? 7),
    outcome: '',
    outcomeDate: '',
    moonPhase: moonForReading(date),
  };
}
