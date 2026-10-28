// Copy a few words (an invite link) to the clipboard, with no new packages:
// the browser's clipboard on the web, React Native's own (still in core, if
// deprecated) on phones. Resolves false when it couldn't, so the screen can
// offer Share instead.

import { Clipboard, Platform } from 'react-native';

export async function copyText(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    Clipboard.setString(text);
    return true;
  } catch {
    return false;
  }
}
