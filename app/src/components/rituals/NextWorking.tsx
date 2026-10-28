import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { covenHref } from '../covens/CovenScreen';
import { useCovenToday } from '../covens/CovenToday';
import { nextCovenRite, nextWorkingFirst } from '../../lib/covens/today';
import { currentStep } from '../../lib/rituals/lifecycle';
import { nextWorkingCard, type NextWorkingTarget } from '../../lib/rituals/nextWorking';
import { planSky, planWhen } from '../../lib/rituals/format';
import { nextPlan, planStart } from '../../lib/rituals/plans';
import { useRituals } from '../../lib/rituals/store';
import { colors, radius, type } from '../../theme';

const hrefOf = (target: NextWorkingTarget): Href => {
  switch (target.kind) {
    case 'run':
      return '/rituals/run';
    case 'rite':
      return covenHref(target.covenSlug, `ritual/${target.ritualId}`);
    case 'plan':
      return { pathname: '/rituals/plan/[id]', params: { id: target.id } };
    default:
      return '/rituals/planner';
  }
};

/**
 * "Your next working", shared by Today and the Rituals home: a ritual under
 * way, your own next plan or your covens' next rite, whichever comes first.
 *
 * - `today`: Today's card, with the ritual under way in it.
 * - `rituals`: the Rituals home, which shows a ritual under way in a card of
 *   its own, and keeps "Plan a ritual" in its Do list rather than here.
 */
export function NextWorking({ now, variant }: { now: Date; variant: 'today' | 'rituals' }) {
  const rituals = useRituals();
  const plan = nextPlan(rituals.plans, new Date());
  // A coven's rite or meeting counts as your next working too, whichever comes first.
  const covenToday = useCovenToday();
  const rite = nextCovenRite(covenToday, now);
  const first = nextWorkingFirst(plan ? planStart(plan) : null, rite);
  const active = variant === 'today' ? rituals.active : null;
  const step = active ? currentStep(active) : null;
  const card = nextWorkingCard({
    active: active ? { status: active.status, title: active.title, step: step?.title ?? null } : null,
    plan: plan ? { id: plan.id, title: plan.title, when: planWhen(plan, now), sky: planSky(plan) } : null,
    rite,
    first,
  });

  if (variant === 'rituals' && card.kind === 'none') {
    return (
      <View style={[styles.working, styles.compact]}>
        <View style={styles.workingText}>
          <Text style={[type.eyebrow, styles.gold]}>{card.eyebrow}</Text>
          <Text style={type.cardTitle}>{card.title}</Text>
          <Text style={type.caption}>Tap “Plan a ritual” below, and we’ll find the right night.</Text>
        </View>
      </View>
    );
  }

  const open = () => (variant === 'today' ? router.navigate(hrefOf(card.action.target)) : router.push(hrefOf(card.action.target)));
  return (
    <View style={styles.working}>
      <View style={styles.workingText}>
        <Text style={[type.eyebrow, styles.gold]}>{card.eyebrow}</Text>
        <Text style={type.cardTitle}>{card.title}</Text>
        {card.lines.map((line) => (
          <Text key={line} style={type.caption}>
            {line}
          </Text>
        ))}
      </View>
      <Button label={card.action.label} variant={variant === 'rituals' ? 'outline' : undefined} onPress={open} />
    </View>
  );
}

const styles = StyleSheet.create({
  gold: { color: colors.gold },
  working: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.24)',
    padding: 16,
    gap: 14,
  },
  compact: { paddingVertical: 14 },
  workingText: { gap: 3 },
});
