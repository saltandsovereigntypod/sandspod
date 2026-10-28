// Settings save themselves: each change is gathered for a moment and then
// saved, so a run of typing becomes one save. Leaving the screen saves
// straight away (flush), and a save that fails keeps its changes to try
// again with the next one. Pure (timers are passed in), so it can be tested.

export type AutosaveState = 'idle' | 'waiting' | 'saving' | 'saved' | 'failed';

type Timer = unknown;

export type AutosaveOptions<T extends Record<string, unknown>> = {
  /** Saves the changed keys (only those), merged onto the latest settings by the caller. */
  save: (changes: Partial<T>) => Promise<void>;
  /** How long after the last change to save, in ms. */
  delay?: number;
  onState?: (state: AutosaveState) => void;
  setTimer?: (run: () => void, ms: number) => Timer;
  clearTimer?: (timer: Timer) => void;
};

export type Autosave<T extends Record<string, unknown>> = {
  /** Note a change; saved after `delay` unless more follow. */
  change: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Save anything waiting now (leaving the screen, or Try again). Resolves when saved or failed. */
  flush: () => Promise<void>;
  /** Whether a change is waiting or being saved. */
  pending: () => boolean;
  state: () => AutosaveState;
};

export const AUTOSAVE_DELAY = 700;

export function createAutosave<T extends Record<string, unknown>>({
  save,
  delay = AUTOSAVE_DELAY,
  onState,
  setTimer = (run, ms) => setTimeout(run, ms),
  clearTimer = (timer) => clearTimeout(timer as ReturnType<typeof setTimeout>),
}: AutosaveOptions<T>): Autosave<T> {
  let waiting: Partial<T> = {};
  let hasWaiting = false;
  let timer: Timer | null = null;
  let inFlight = 0;
  let chain: Promise<void> = Promise.resolve();
  let state: AutosaveState = 'idle';
  const setState = (next: AutosaveState) => {
    state = next;
    onState?.(next);
  };

  const flush = (): Promise<void> => {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
    if (!hasWaiting) return chain;
    const changes = waiting;
    waiting = {};
    hasWaiting = false;
    inFlight += 1;
    setState('saving');
    // One save at a time, in order, so an older save never lands after a newer one.
    chain = chain.then(async () => {
      try {
        await save(changes);
        inFlight -= 1;
        if (!inFlight && !hasWaiting) setState('saved');
      } catch {
        inFlight -= 1;
        // Keep what failed, under anything changed since, to try again.
        waiting = { ...changes, ...waiting };
        hasWaiting = true;
        setState('failed');
      }
    });
    return chain;
  };

  return {
    change(key, value) {
      waiting = { ...waiting, [key]: value };
      hasWaiting = true;
      if (timer !== null) clearTimer(timer);
      timer = setTimer(() => {
        timer = null;
        void flush();
      }, delay);
      if (state !== 'saving') setState('waiting');
    },
    flush,
    pending: () => hasWaiting || inFlight > 0,
    state: () => state,
  };
}

/** The words shown under a settings screen for each state (quiet, and only when there's something to say). */
export function autosaveNote(state: AutosaveState, signedIn: boolean): string | null {
  if (state === 'saving' || state === 'waiting') return 'Saving…';
  if (state === 'saved') return signedIn ? 'Saved to your account.' : 'Saved on this device.';
  if (state === 'failed') return 'Your last change couldn’t be saved. Check your connection; it will try again.';
  return null;
}
