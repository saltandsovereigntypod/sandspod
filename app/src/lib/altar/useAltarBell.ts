// Ringing the altar bell (bell.ts) on an altar in the app: the chime (feel.ts,
// under Candle sounds and Vibration in Accessibility), a ripple from the bell
// on the stage, and on a coven altar the others hear it too. Ringing to
// cleanse is kept in this altar's own History; To tend is left alone.

import { useEffect, useRef } from 'react';

import { useAccessibility } from '../accessibility/store';
import type { SharedAltar } from '../covens/altarSync';
import { CLEANSE_GAP_MS, CLEANSE_RINGS, CLEANSED_HISTORY, CLEANSED_LINE, ringAllowed, SOUND_OFF_LINE, type RingKind } from './bell';
import { ringBell } from './feel';

/**
 * `ripple(uid)` plays the sound moment from that object; `say` shows a short
 * notice; `log` keeps a line in this altar's History.
 */
export function useAltarBell(shared: SharedAltar | undefined, me: string, ripple: (uid: string) => void, say: (line: string) => void, log: (line: string) => void) {
  const prefs = useAccessibility();
  const latest = useRef({ prefs, ripple, say, log });
  useEffect(() => {
    latest.current = { prefs, ripple, say, log };
  });
  const rung = useRef(new Map<string, number>());
  const told = useRef(false);
  const stops = useRef<(() => void)[]>([]);
  useEffect(() => () => stops.current.forEach((stop) => stop()), []);

  const sound = (kind: RingKind, uid: string) => {
    const { prefs: p } = latest.current;
    stops.current.push(ringBell(kind === 'cleanse' ? CLEANSE_RINGS : 1, CLEANSE_GAP_MS, p.candleSounds, p.haptics, () => latest.current.ripple(uid)));
  };

  // The others at a coven altar ringing (each at most once every 1.5 s).
  useEffect(() => {
    if (!shared?.onRing) return;
    return shared.onRing((ring) => {
      if (ringAllowed(rung.current, ring.from, Date.now())) sound(ring.kind, ring.key ?? '');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sound reads the latest through a ref
  }, [shared?.onRing]);

  return (kind: RingKind, uid: string) => {
    if (!ringAllowed(rung.current, me || 'me', Date.now())) return;
    sound(kind, uid);
    shared?.ring?.(kind, uid);
    const { prefs: p } = latest.current;
    if (!p.candleSounds && !told.current) {
      told.current = true;
      latest.current.say(SOUND_OFF_LINE);
    }
    if (kind !== 'cleanse') return;
    latest.current.log(CLEANSED_HISTORY);
    setTimeout(() => latest.current.say(CLEANSED_LINE), (CLEANSE_RINGS - 1) * CLEANSE_GAP_MS + 800);
  };
}
