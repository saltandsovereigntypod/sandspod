// One shared clock for everything on an altar that counts time (a lit
// candle's burn, incense, the close-up): a single interval per period however
// many things are watching, stopped while nothing is or the app is in the
// background, and caught up the moment it's back. Kept free of React Native
// so the tests can drive it; ./useTicker.ts is the hook.

type Clock = { listeners: Set<() => void>; timer: ReturnType<typeof setInterval> | null; now: number };

export type TickerEnv = {
  setInterval: (fn: () => void, ms: number) => ReturnType<typeof setInterval>;
  clearInterval: (t: ReturnType<typeof setInterval>) => void;
  now: () => number;
};

export function createTicker(env: TickerEnv = { setInterval: (f, ms) => setInterval(f, ms), clearInterval: (t) => clearInterval(t), now: () => Date.now() }) {
  const clocks = new Map<number, Clock>();
  let awake = true;

  const clock = (period: number): Clock => {
    let c = clocks.get(period);
    if (!c) clocks.set(period, (c = { listeners: new Set(), timer: null, now: env.now() }));
    return c;
  };
  const beat = (c: Clock) => {
    c.now = env.now();
    c.listeners.forEach((l) => l());
  };
  const start = (period: number, c: Clock) => {
    if (c.timer == null && awake && c.listeners.size) c.timer = env.setInterval(() => beat(c), period);
  };
  const stop = (c: Clock) => {
    if (c.timer != null) env.clearInterval(c.timer);
    c.timer = null;
  };

  return {
    subscribe(period: number, listener: () => void): () => void {
      const c = clock(period);
      if (!c.listeners.size) c.now = env.now();
      c.listeners.add(listener);
      start(period, c);
      return () => {
        c.listeners.delete(listener);
        if (!c.listeners.size) stop(c);
      };
    },
    now: (period: number) => clock(period).now,
    /** The app went to the background (false) or came back (true). */
    setAwake(on: boolean) {
      if (on === awake) return;
      awake = on;
      clocks.forEach((c, period) => {
        if (on) {
          start(period, c);
          beat(c);
        } else stop(c);
      });
    },
    /** How many intervals are running (for the tests). */
    running: () => [...clocks.values()].filter((c) => c.timer != null).length,
  };
}
