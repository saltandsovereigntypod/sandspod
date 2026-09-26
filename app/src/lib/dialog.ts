// Confirmations and notices drawn by the app itself on the web.
//
// The browser's own confirm() and alert() can be blocked or silently suppressed
// (iPhone Safari does this), and a blocked confirm() answers "cancel", so a
// button like "Return page to ashes" would do nothing at all. On the web every
// confirmation goes through <DialogHost />, which is mounted in the root layout;
// on phones the native Alert is used, which always works.

import { useSyncExternalStore } from 'react';
import { Alert, Platform } from 'react-native';

export type DialogRequest = {
  title: string;
  message: string;
  /** Label of the confirming button; absent for a notice with a single OK. */
  confirmLabel?: string;
  destructive?: boolean;
  resolve: (confirmed: boolean) => void;
};

let queue: DialogRequest[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function enqueue(request: Omit<DialogRequest, 'resolve'>): Promise<boolean> {
  return new Promise((resolve) => {
    queue = [...queue, { ...request, resolve }];
    emit();
  });
}

/** The dialog to show now, if any. */
export function useCurrentDialog(): DialogRequest | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => queue[0] ?? null,
    () => null,
  );
}

/** Answer the dialog on screen and move to the next one. */
export function answerDialog(confirmed: boolean) {
  const [current, ...rest] = queue;
  if (!current) return;
  queue = rest;
  emit();
  current.resolve(confirmed);
}

/** Ask before something that can't be undone. Resolves true only if confirmed. */
export function confirmAction(title: string, message: string, confirmLabel: string, destructive = true): Promise<boolean> {
  if (Platform.OS === 'web') return enqueue({ title, message, confirmLabel, destructive });
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Tell the person something, with a single OK. */
export function tell(title: string, message: string): Promise<void> {
  if (Platform.OS === 'web') return enqueue({ title, message }).then(() => undefined);
  return new Promise((resolve) => Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }], { onDismiss: () => resolve() }));
}
