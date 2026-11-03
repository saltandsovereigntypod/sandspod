// No step counter in a browser: a walking meditation on the web is simply timed.
import type { Steps } from './steps';

export function useSteps(): Steps {
  return { available: false, steps: 0 };
}
