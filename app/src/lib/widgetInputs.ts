// What the day widgets need beyond your calendars and plans (lib/widgetMore):
// your covens' rows as Today loads them, what you tend (your altars, petition
// box and your covens' part of the To tend list, with the list's records),
// your settings and today's card. Every source is one the app already keeps
// (cached queries shared with Today and To tend, so no extra requests); when
// signed out, with no covens or offline, the parts are simply empty.

import { useCallback } from 'react';

import { useCovenToday } from '../components/covens/CovenToday';
import { PETITIONS, type Petition } from './altar/petitions';
import { useAltars } from './altar/store';
import { normalizeReading, READINGS } from './craft/hedge/readings';
import { useCraft } from './craft/store';
import { todaysCard } from './divination/daily';
import { useSession } from './session';
import { useMySettings } from './settings/store';
import { useMoreCachedCovens } from './tend/covens';
import { gatherTendables } from './tend/gather';
import { useTendRecords } from './tend/store';
import type { WidgetMore } from './widgetMore';

/** A maker of the widgets' extra parts at a moment; it changes whenever what it reads does. */
export function useWidgetMore(): (now: Date) => WidgetMore {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const coven = useCovenToday();
  const { altars } = useAltars();
  const { entries: petitions } = useCraft<Petition>(PETITIONS);
  const { part } = useMoreCachedCovens(userId);
  const { records } = useTendRecords();
  const { entries: readings } = useCraft<unknown>(READINGS);
  const { settings } = useMySettings();

  return useCallback(
    (now: Date): WidgetMore => {
      let tend: WidgetMore['tend'] = null;
      try {
        // Only the altars and covens: the widgets show offerings, plants, candles and meeting actions.
        tend = { items: gatherTendables({ now, altars: { altars, petitions }, covens: userId ? part : null }), records };
      } catch {
        // Without the list, Coming Up shows the rest.
      }
      let card: WidgetMore['card'] = null;
      try {
        card = todaysCard(readings.map((e) => ({ ...e, data: normalizeReading(e.data) })), now);
      } catch {
        // No card, no line.
      }
      return { coven: userId ? coven : null, tend, settings: settings as Record<string, unknown> | null, card };
    },
    [userId, coven, altars, petitions, part, records, readings, settings],
  );
}
