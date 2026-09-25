import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Autosave delay, the same as the website's AUTOSAVE_DELAY.
const DELAY = 700;

/**
 * A text field's value, saved a moment after typing stops, and straight away
 * when the field loses focus, the screen closes or the browser tab is hidden.
 * Only real changes are saved, so opening a page never rewrites it.
 */
export function useDraft(initial: string, save: (value: string) => void) {
  const [value, setValue] = useState(initial);
  const saved = useRef(initial);
  const latest = useRef(initial);
  const saveRef = useRef(save);
  saveRef.current = save;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (latest.current !== saved.current) {
      saved.current = latest.current;
      saveRef.current(latest.current);
    }
  }, []);

  const change = useCallback(
    (next: string) => {
      latest.current = next;
      setValue(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, DELAY);
    },
    [flush],
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return flush;
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  return { value, change, flush };
}
