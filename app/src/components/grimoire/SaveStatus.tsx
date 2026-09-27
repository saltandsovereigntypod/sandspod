import { StyleSheet, Text, View } from 'react-native';

import { confirmAction } from '../../lib/grimoire/confirm';
import { useGrimoire } from '../../lib/grimoire/store';
import { colors, radius, type } from '../../theme';
import { Button } from '../Button';

/** One quiet line saying whether changes have reached the account. */
export function SaveStatus() {
  const { sync, pendingCount, failed } = useGrimoire();
  let text = 'Saved';
  if (failed.length) text = 'Some changes weren’t saved';
  else if (sync === 'offline' && pendingCount) text = 'Offline · kept on this device';
  else if (pendingCount || sync === 'saving') text = 'Saving…';
  return (
    <Text accessibilityLiveRegion="polite" style={[type.caption, failed.length ? styles.warn : null]} numberOfLines={1}>
      {text}
    </Text>
  );
}

/** Shown when the server refused some changes, so they're never lost silently. */
export function FailedChanges() {
  const { failed, actions } = useGrimoire();
  if (!failed.length) return null;
  const count = failed.length;
  return (
    <View style={styles.card} accessibilityRole="alert">
      <Text style={type.cardTitle}>{count === 1 ? 'A change wasn’t saved' : `${count} changes weren’t saved`}</Text>
      <Text style={type.body}>
        Your account didn't accept {count === 1 ? 'it' : 'them'}. {count === 1 ? 'It’s' : 'They’re'} kept on this
        device, so you can try again.
      </Text>
      <Text style={type.caption} numberOfLines={3}>
        {failed[0].message}
      </Text>
      <Button label="Try again" onPress={actions.retryFailed} />
      <Button
        label="Discard these changes"
        variant="text"
        onPress={async () => {
          const ok = await confirmAction(
            'Discard these changes?',
            'They\u2019ll be removed from this device and your book will show what your account has saved.',
            'Discard',
          );
          if (ok) actions.discardFailed();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  warn: { color: colors.gold },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldLine,
    padding: 16,
    gap: 12,
  },
});
