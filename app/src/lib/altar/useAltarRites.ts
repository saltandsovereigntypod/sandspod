// The altar's other working tools in the app, as useAltarBell does for the
// bell: the singing bowl struck once or every few minutes (bowl.ts, sounding
// through feel.ts under Candle sounds and Vibration in Accessibility), a match
// struck or a lighter clicked, a toast, a libation and a sweep (toolRites.ts).
// Each plays its moment on the stage, and on a coven altar the others there
// see and hear it too (the altar channel's "rite" broadcast, nothing saved:
// the circle, the quarters, the cup and the debris are kept with the altar
// itself and reach them as any change does).

import { useEffect, useRef, useState } from 'react';

import { useAccessibility } from '../accessibility/store';
import type { SharedAltar } from '../covens/altarSync';
import { ringAllowed } from './bell';
import { BOWL_SOUND_OFF, bowlTone, clampEvery, everyLine, nextStrikeAt, STRIKE_GAP_MS, strikeLine, type BowlToneId } from './bowl';
import { fireSound, strikeBowl } from './feel';
import { CRAFT_HEARD } from './craftTools';
import type { RiteWire } from './toolRites';

/** What a moment from someone else looks like on the stage (charge.ts momentFor methods). */
const HEARD: Record<RiteWire['kind'], { methods: string[]; line: string }> = {
  bowl: { methods: ['Sound'], line: 'The singing bowl rings.' },
  strike: { methods: ['Candle'], line: '' },
  click: { methods: ['Candle'], line: '' },
  toast: { methods: ['Moon'], line: 'The chalice is raised.' },
  pour: { methods: ['Water'], line: 'A libation is poured.' },
  sweep: { methods: ['Salt'], line: 'The altar is swept.' },
  ...CRAFT_HEARD,
};

export type BowlRinging = { tone: BowlToneId; every: number; startedAt: number; uid: string } | null;

/**
 * `moment(uid, methods)` plays a moment from that object; `say` shows a short
 * notice; `log` keeps a line in this altar's History.
 */
export function useAltarRites(
  shared: SharedAltar | undefined,
  me: string,
  moment: (uid: string, methods: string[]) => void,
  say: (line: string) => void,
  log: (line: string) => void,
) {
  const prefs = useAccessibility();
  const latest = useRef({ prefs, moment, say, log });
  useEffect(() => {
    latest.current = { prefs, moment, say, log };
  });
  const struck = useRef(new Map<string, number>());
  const told = useRef(false);
  const [ringing, setRinging] = useState<BowlRinging>(null);

  const sound = (tone: BowlToneId, uid: string) => {
    const { prefs: p } = latest.current;
    strikeBowl(tone, p.candleSounds, p.haptics);
    latest.current.moment(uid, ['Sound']);
  };
  const soundOff = () => {
    if (latest.current.prefs.candleSounds || told.current) return;
    told.current = true;
    latest.current.say(BOWL_SOUND_OFF);
  };

  // Ringing every few minutes: each strike when it falls, until stopped (or the altar is left).
  useEffect(() => {
    if (!ringing) return;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      const now = Date.now();
      const at = nextStrikeAt(ringing.startedAt, ringing.every, now + 1);
      timer = setTimeout(() => {
        sound(ringing.tone, ringing.uid);
        shared?.rite?.({ kind: 'bowl', key: ringing.uid, tone: ringing.tone });
        next();
      }, Math.max(250, at - now));
    };
    next();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sound reads the latest through a ref
  }, [ringing, shared?.rite]);

  // The others at a coven altar.
  useEffect(() => {
    if (!shared?.onRite) return;
    return shared.onRite((wire) => {
      if (!ringAllowed(struck.current, `${wire.from}:${wire.kind}`, Date.now(), STRIKE_GAP_MS)) return;
      const { prefs: p } = latest.current;
      if (wire.kind === 'bowl') return sound(bowlTone(wire.tone).id, wire.key ?? '');
      if (wire.kind === 'strike' || wire.kind === 'click') return fireSound(wire.kind === 'strike' ? 'match' : 'lighter', p.candleSounds, p.haptics);
      latest.current.moment(wire.key ?? '', HEARD[wire.kind].methods);
      if (HEARD[wire.kind].line) latest.current.say(HEARD[wire.kind].line);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sound reads the latest through a ref
  }, [shared?.onRite]);

  return {
    ringing,
    /** Strike the bowl once. */
    strike(tone: BowlToneId, uid: string) {
      if (!ringAllowed(struck.current, me || 'me', Date.now(), STRIKE_GAP_MS)) return;
      sound(tone, uid);
      shared?.rite?.({ kind: 'bowl', key: uid, tone });
      soundOff();
      latest.current.log(strikeLine(bowlTone(tone)));
    },
    /** Ring it every `every` minutes from now (the first strike now), or null to stop. */
    every(tone: BowlToneId, uid: string, every: number | null) {
      if (every == null) {
        if (ringing) latest.current.say('The bowl is still.');
        return setRinging(null);
      }
      const n = clampEvery(every);
      sound(tone, uid);
      shared?.rite?.({ kind: 'bowl', key: uid, tone });
      soundOff();
      setRinging({ tone, every: n, startedAt: Date.now(), uid });
      latest.current.log(everyLine(bowlTone(tone), n));
      latest.current.say(`The bowl will ring every ${n} minute${n === 1 ? '' : 's'} until you stop it.`);
    },
    /** A match struck or a lighter clicked (the sound here comes with the candle catching: feel.ts useCandleFeel). */
    fire(how: 'match' | 'lighter', uid: string) {
      shared?.rite?.({ kind: how === 'match' ? 'strike' : 'click', key: uid });
    },
    /** A toast, a libation, a sweep or a round-two tool's moment (craftTools.ts): here, and for the others. */
    show(kind: Exclude<RiteWire['kind'], 'bowl' | 'strike' | 'click'>, uid: string) {
      latest.current.moment(uid, HEARD[kind].methods);
      shared?.rite?.({ kind, key: uid });
    },
  };
}
