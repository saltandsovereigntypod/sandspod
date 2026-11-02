// Ringing the altar bell (bell.ts) on an altar in the app: the chime (feel.ts,
// under Candle sounds and Vibration in Accessibility), a ripple from the bell
// on the stage, and on a coven altar the others hear it too. Ringing to
// cleanse marks your own Cleansing thing on the To tend list done today.

import { useEffect, useRef } from 'react';

import { useAccessibility } from '../accessibility/store';
import { saveRecord, useTendRecords } from '../tend/store';
import { recordDone } from '../tend/model';
import type { SharedAltar } from '../covens/altarSync';
import { BELL_HOW, CLEANSE_GAP_MS, CLEANSE_RINGS, cleansedLine, cleansingToMark, ringAllowed, SOUND_OFF_LINE, type RingKind } from './bell';
import { ringBell } from './feel';

/** `ripple(uid)` plays the sound moment from that object; `say` shows a short notice. */
export function useAltarBell(shared: SharedAltar | undefined, me: string, ripple: (uid: string) => void, say: (line: string) => void) {
  const prefs = useAccessibility();
  const { entries, records } = useTendRecords();
  const latest = useRef({ prefs, entries, records, ripple, say });
  useEffect(() => {
    latest.current = { prefs, entries, records, ripple, say };
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
    const { prefs: p, entries: e, records: r } = latest.current;
    if (!p.candleSounds && !told.current) {
      told.current = true;
      latest.current.say(SOUND_OFF_LINE);
    }
    if (kind !== 'cleanse') return;
    const now = new Date();
    const target = cleansingToMark(r, now);
    const done = target ? saveRecord(e, recordDone(target, now, [BELL_HOW])).then(() => target.title || 'Cleansing', () => null) : Promise.resolve(null);
    const wait = new Promise((resolve) => setTimeout(resolve, (CLEANSE_RINGS - 1) * CLEANSE_GAP_MS + 800));
    void Promise.all([done, wait]).then(([marked]) => latest.current.say(cleansedLine(marked)));
  };
}
