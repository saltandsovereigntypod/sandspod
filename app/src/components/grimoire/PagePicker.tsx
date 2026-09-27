import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PageRow } from '../../lib/grimoire/types';
import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Button } from '../Button';

type Props = {
  visible: boolean;
  title: string;
  pages: PageRow[];
  onChoose: (page: PageRow) => void;
  onClose: () => void;
};

/** Chooses another page of the book, for page links. */
export function PagePicker({ visible, title, pages, onChoose, onClose }: Props) {
  const sorted = [...pages].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={[type.cardTitle, styles.title]}>
            {title}
          </Text>
          <Button label="Cancel" variant="text" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={styles.content} alwaysBounceHorizontal={false}>
          {sorted.length === 0 ? (
            <Text style={type.body}>There are no other pages to link yet.</Text>
          ) : (
            <View style={styles.list}>
              {sorted.map((page, i) => (
                <Pressable
                  key={page.id}
                  accessibilityRole="button"
                  accessibilityLabel={page.title || 'Untitled page'}
                  onPress={() => onChoose(page)}
                  style={({ pressed }) => [styles.row, i < sorted.length - 1 && styles.rule, pressed && styles.pressed]}
                >
                  <Text style={styles.rowText} numberOfLines={2}>
                    {page.title || 'Untitled page'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.gutter, paddingRight: 4, paddingVertical: 8 },
  title: { flex: 1 },
  content: { paddingHorizontal: space.gutter, paddingBottom: 32, gap: 12 },
  list: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 16 },
  row: { minHeight: Math.max(touch, 56), justifyContent: 'center', paddingVertical: 10 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  rowText: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
});
