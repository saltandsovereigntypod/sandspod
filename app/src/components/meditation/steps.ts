// Steps on a walking meditation, from the phone's step counter (expo-sensors
// Pedometer), counted from when the walk began. Where there's no counter, or
// it isn't allowed, it says so and the walk is simply timed. The web build
// uses steps.web.ts.

import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';

export type Steps = { available: boolean | null; steps: number };

export function useSteps(on: boolean): Steps {
  const [state, setState] = useState<Steps>({ available: null, steps: 0 });
  useEffect(() => {
    if (!on) return;
    let sub: { remove: () => void } | null = null;
    let live = true;
    (async () => {
      try {
        const ok = (await Pedometer.isAvailableAsync()) && (await Pedometer.requestPermissionsAsync()).granted;
        if (!live) return;
        if (!ok) return setState({ available: false, steps: 0 });
        setState({ available: true, steps: 0 });
        sub = Pedometer.watchStepCount((r) => setState({ available: true, steps: r.steps }));
      } catch {
        if (live) setState({ available: false, steps: 0 });
      }
    })();
    return () => {
      live = false;
      sub?.remove();
    };
  }, [on]);
  return state;
}
