import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from '../theme';

/**
 * Standard screen shell. Scrolls vertically only: the app never scrolls
 * sideways, so nothing inside should be wider than the screen.
 */
export function Screen({ children, centered }: { children: ReactNode; centered?: boolean }) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, centered && styles.centered]}
        showsVerticalScrollIndicator={false}
        alwaysBounceHorizontal={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  content: { paddingHorizontal: space.gutter, paddingTop: 16, paddingBottom: 32, gap: space.section },
  centered: { flexGrow: 1, justifyContent: 'center' },
});
