import { useEffect, useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, type ModalProps, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibleText, useReducedMotion } from '../../lib/accessibility/store';
import { colors, fonts, radius, space, touch, type } from '../../theme';

// Sheets open over the sideways full-screen altar too.
const ORIENTATIONS: ModalProps['supportedOrientations'] = ['portrait', 'landscape-left', 'landscape-right'];

type Props = {
  visible: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  /** Pinned under the title, outside the scrolling area (search fields). */
  header?: ReactNode;
  /** 'half' keeps the altar in view above a shorter sheet. */
  size?: 'full' | 'half';
  /** Come back to the same place in the list when the sheet is closed and opened again (the cabinet). */
  keepScroll?: boolean;
};

/** A bottom sheet that scrolls vertically; the altar's cabinet, backgrounds and layers live in these. */
export function Sheet({ visible, title, eyebrow, onClose, children, header, size = 'full', keepScroll = false }: Props) {
  const insets = useSafeAreaInsets();
  // A closed Modal drops its contents, so where the list was is kept here and
  // put back once the reopened list has laid out.
  const scroll = useRef<ScrollView>(null);
  const offset = useRef(0);
  const restored = useRef(true);
  useEffect(() => {
    if (visible) restored.current = !keepScroll || offset.current === 0;
  }, [visible, keepScroll]);
  const reduceMotion = useReducedMotion();
  const t = useAccessibleText();
  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={onClose} supportedOrientations={ORIENTATIONS}>
      {/* The sheet rises with the keyboard, so the field being typed in stays in view. */}
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={[styles.backdrop, size === 'half' && styles.backdropLight]} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.card, size === 'half' && styles.cardHalf, { paddingBottom: Math.max(insets.bottom, 16) }]} accessibilityViewIsModal>
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
              <Text style={t(styles.closeText)}>Done</Text>
            </Pressable>
          </View>
          {header}
          <ScrollView
            ref={scroll}
            onScroll={keepScroll ? (e) => {
              if (restored.current) offset.current = e.nativeEvent.contentOffset.y;
            } : undefined}
            scrollEventThrottle={keepScroll ? 32 : undefined}
            onContentSizeChange={keepScroll ? (_w, h) => {
              if (restored.current || h === 0) return;
              restored.current = true;
              scroll.current?.scrollTo({ y: offset.current, animated: false });
            } : undefined}
            style={styles.scroll}
            contentContainerStyle={styles.content}
            alwaysBounceHorizontal={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4,7,5,0.6)' },
  backdropLight: { backgroundColor: 'rgba(4,7,5,0.25)' },
  cardHalf: { maxHeight: '58%' },
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
