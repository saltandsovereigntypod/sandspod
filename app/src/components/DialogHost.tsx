import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { answerDialog, useCurrentDialog } from '../lib/dialog';
import { colors, fonts, radius, type } from '../theme';
import { Button } from './Button';

/** Draws the app's own confirmations and notices on the web (see lib/dialog.ts). */
export function DialogHost() {
  const dialog = useCurrentDialog();
  if (!dialog) return null;
  const asks = !!dialog.confirmLabel;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => answerDialog(false)}>
      <View style={styles.center}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={asks ? 'Cancel' : 'Close'}
          style={StyleSheet.absoluteFill}
          onPress={() => answerDialog(false)}
        >
          <View style={styles.backdrop} />
        </Pressable>
        <View accessibilityRole="alert" aria-modal style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            {dialog.title}
          </Text>
          {!!dialog.message && <Text style={styles.message}>{dialog.message}</Text>}
          <View style={styles.actions}>
            {asks ? (
              <>
                <Button label={dialog.confirmLabel as string} onPress={() => answerDialog(true)} style={styles.button} />
                <Button label="Cancel" variant="outline" onPress={() => answerDialog(false)} style={styles.button} />
              </>
            ) : (
              <Button label="OK" onPress={() => answerDialog(true)} style={styles.button} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  backdrop: { flex: 1, backgroundColor: 'rgba(7,10,8,0.78)' },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldLine,
    padding: 22,
    gap: 12,
  },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, color: colors.cream },
  message: { ...type.body, color: colors.parchment },
  actions: { gap: 10, marginTop: 6 },
  button: { minHeight: 48 },
});
