// Puts out candles (and incense) on your saved altars when their life runs
// out, as the website does, records moon charges for crystals and moon water
// that sat through a Full Moon, and saves the altar so it syncs. It also
// tells the reminders which offerings will want tending (if you asked for
// those reminders). Runs when the
// app opens or comes to the front, when your altars change, and at the next burnout.

import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useCraft } from '../craft/store';
import { ALTAR_OPTIONS, altarOptionsFor, type AltarOptions } from './altarOptions';
import { altarOfferingsDue, nextAltarBurnout, settleAltars } from './burnout';
import { setOfferingsDue } from '../reminders/store';
import { useAltars } from './store';

export function useCandleKeeper() {
  const { altars, save, status } = useAltars();
  const [wake, setWake] = useState(0);
  const busy = useRef(false);
  const { entries: optionEntries, ready: optionsReady } = useCraft<AltarOptions>(ALTAR_OPTIONS);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') setWake((w) => w + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (status === 'loading' || status === 'idle' || busy.current) return;
    setOfferingsDue(altarOfferingsDue(altars, new Date()));
    const changed = settleAltars(altars, new Date().toISOString(), {
      // Moon charges wait until each altar's options are known (New Moons are its choice).
      moon: optionsReady,
      newMoon: (id) => altarOptionsFor(optionEntries, id).options.newMoonCharging,
    });
    if (changed.length) {
      busy.current = true;
      void (async () => {
        for (const { altar, doc } of changed) {
          try {
            await save({ id: altar.id, name: altar.name, doc });
          } catch {
            // Tried again next time the app comes to the front.
          }
        }
      })().finally(() => {
        busy.current = false;
      });
      return;
    }
    const next = nextAltarBurnout(altars);
    if (next == null) return;
    const timer = setTimeout(() => setWake((w) => w + 1), Math.min(Math.max(0, next - Date.now()) + 1000, 6 * 60 * 60 * 1000));
    return () => clearTimeout(timer);
  }, [altars, save, status, wake, optionEntries, optionsReady]);
}
