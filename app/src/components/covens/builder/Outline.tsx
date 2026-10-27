import { Pressable, StyleSheet, Text, View } from 'react-native';

import { outline, stepSummary, stepWhoLine, type BuilderStep, type CustomAction, type RitualPlan, type WhoContext } from '../../../lib/covens/builder';
import { colors, fonts, radius, touch, type } from '../../../theme';
import { Button } from '../../Button';

// The gathering as an outline (ritual/plan.tsx): each section with its steps
// as one-line cards ("Call the quarters · East: Rowan, South: Ash", and who
// below). Tapping a card opens that step on its own; the small arrows move it
// up or down, across into the next section at the edges.
export function Outline({
  plan,
  steps,
  ctx,
  custom,
  problems,
  onOpen,
  onAdd,
  onMove,
}: {
  plan: RitualPlan;
  steps: BuilderStep[];
  ctx: WhoContext;
  custom: CustomAction[];
  /** Steps with something to fix, by key. */
  problems: Record<string, string>;
  onOpen: (key: string) => void;
  onAdd: (section: string) => void;
  onMove: (key: string, by: -1 | 1) => void;
}) {
  const parts = outline(plan, steps);
  const last = steps.length - 1;
  return (
    <View style={styles.wrap}>
      {parts.map(({ section, steps: list }) => {
        const minutes = list.reduce((sum, { step }) => sum + (step.duration_minutes ?? 0), 0);
        return (
          <View key={section.id} style={styles.section}>
            <View style={styles.head}>
              <Text accessibilityRole="header" style={[type.eyebrow, styles.grow]}>
                {section.name}
              </Text>
              {minutes > 0 && <Text style={type.caption}>about {minutes} min</Text>}
            </View>
            {list.map(({ step, index }) => (
              <View key={step.key} style={[styles.card, !!problems[step.key] && styles.cardWarn]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Step ${index + 1}: ${stepSummary(step, ctx, custom)}. ${stepWhoLine(step, ctx)}. Open it.`}
                  onPress={() => onOpen(step.key)}
                  style={({ pressed }) => [styles.cardBody, pressed && styles.pressed]}
                >
                  <Text style={styles.title} numberOfLines={2}>
                    <Text style={styles.n}>{index + 1}. </Text>
                    {stepSummary(step, ctx, custom)}
                  </Text>
                  <Text style={type.caption} numberOfLines={1}>
                    {problems[step.key] || stepWhoLine(step, ctx)}
                  </Text>
                </Pressable>
                <View style={styles.arrows}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Move step ${index + 1} up`} disabled={index === 0} onPress={() => onMove(step.key, -1)} style={({ pressed }) => [styles.arrow, (pressed || index === 0) && styles.dim]}>
                    <Text style={styles.arrowText}>↑</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Move step ${index + 1} down`} disabled={index === last} onPress={() => onMove(step.key, 1)} style={({ pressed }) => [styles.arrow, (pressed || index === last) && styles.dim]}>
                    <Text style={styles.arrowText}>↓</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <Button label={list.length ? `Add a step to ${section.name}` : `Add the first step to ${section.name}`} variant="text" onPress={() => onAdd(section.id)} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 18 },
  section: { gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  card: { flexDirection: 'row', alignItems: 'stretch', borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.surface },
  cardWarn: { borderColor: 'rgba(243,160,110,0.7)' },
  cardBody: { flex: 1, minHeight: 72, justifyContent: 'center', gap: 2, paddingVertical: 10, paddingLeft: 14, paddingRight: 6 },
  title: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.cream },
  n: { color: colors.gold, fontFamily: fonts.bodySemi },
  arrows: { justifyContent: 'center', paddingRight: 4 },
  arrow: { width: touch, height: 36, alignItems: 'center', justifyContent: 'center' },
  arrowText: { fontSize: 18, color: colors.parchment },
  dim: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
