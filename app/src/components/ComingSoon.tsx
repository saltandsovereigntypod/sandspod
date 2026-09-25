import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, type } from '../theme';
import { Screen } from './Screen';

/** Placeholder for tabs whose full screens are built in later milestones. */
export function ComingSoon({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <Screen>
      <Text accessibilityRole="header" style={type.title}>
        {title}
      </Text>
      <View style={styles.card}>
        <Text style={type.eyebrow}>In progress</Text>
        <Text style={type.body}>{description}</Text>
      </View>
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 8,
  },
});
