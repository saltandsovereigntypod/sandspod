import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

import { dismiss, guestPreview, isDismissed } from '../../lib/backup/migrate';
import { worthMoving } from '../../lib/backup/migration';
import { useSession } from '../../lib/session';

// Asked once per launch, per account.
const asked = new Set<string>();

/**
 * After signing in on a device that was used as a guest, offers to bring the
 * guest work into the account (the website shows its "Guest Sanctuary Found"
 * card in Account & Data). Renders nothing.
 */
export function GuestMigrationPrompt() {
  const { session, guest } = useSession();
  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId || !guest || asked.has(userId)) return;
    asked.add(userId);
    let active = true;
    (async () => {
      const preview = await guestPreview();
      if (!active || !preview || !worthMoving(preview.counts)) return;
      if (await isDismissed(userId, preview.fingerprint)) return;
      const title = 'Bring your guest work with you?';
      const message =
        'This device still holds what you made as a guest. You can move it into your account now, or later from More → Settings → Account.';
      const review = () => router.push('/more/guest-data');
      if (Platform.OS === 'web') {
        const ask = (globalThis as { confirm?: (text: string) => boolean }).confirm;
        if (ask?.(`${title}\n\n${message}`)) review();
        return;
      }
      Alert.alert(title, message, [
        { text: 'Don’t ask again', style: 'destructive', onPress: () => void dismiss(userId, preview.fingerprint) },
        { text: 'Not now', style: 'cancel' },
        { text: 'Review', onPress: review },
      ]);
    })().catch(() => {});
    return () => {
      active = false;
    };
  }, [userId, guest]);

  return null;
}
