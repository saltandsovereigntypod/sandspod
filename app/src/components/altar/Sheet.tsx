import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius, space, touch, type } from '../../theme';

type Props = {
  visible: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  /** Pinned under the title, outside the scrolling area (search fields). */
  header?: ReactNode;
};

/** A bottom sheet that scrolls vertically; the altar's cabinet, backgrounds and layers live in these. */
export function Sheet({ visible, title, eyebrow, onClose, children, header }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, 16) }]} accessibilityViewIsModal>
          <View style={styles.head}>
            <View style={styles.headText}>
              {eyebrow ? <Text style={type.eyebrow}>{eyebrow}</Text> : null}
              <Text accessibilityRole="header" style={type.cardTitle}>
                {title}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              style={({ pressed }) => [styles.close, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>
          {header}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            alwaysBounceHorizontal={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4,7,5,0.6)' },
  card: {
    maxHeight: '86%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.goldLine,
    paddingTop: 18,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.gutter, gap: 12, marginBottom: 12 },
  headText: { flex: 1, gap: 2 },
  close: { minHeight: touch, minWidth: touch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  closeText: { color: colors.gold, fontFamily: fonts.bodySemi, fontSize: 15 },
  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: space.gutter, paddingBottom: 12, gap: 16 },
});
