import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Body, Card, List, Notice, RitualScreen, Row, SectionLabel, Title, tell, ui } from '../../../components/rituals/ui';
import { moonState } from '../../../lib/moon';
import { useReminders } from '../../../lib/reminders/store';
import { PHASE_ORDER } from '../../../lib/reminders/schedule';
import { currentStep } from '../../../lib/rituals/lifecycle';
import { journalDetail, planSky, planWhen } from '../../../lib/rituals/format';
import { sortJournal, upcomingPlans } from '../../../lib/rituals/plans';
import { bringDeviceRitualsToAccount, refresh, useRituals } from '../../../lib/rituals/store';
import { useSession } from '../../../lib/session';
import { type } from '../../../theme';

export default function RitualsHome() {
  const { session } = useSession();
  const rituals = useRituals();
  const reminders = useReminders();
  const [moving, setMoving] = useState(false);
  const now = new Date();
  const moon = moonState(now);

  const journal = useMemo(() => sortJournal(rituals.journal), [rituals.journal]);
  const plans = upcomingPlans(rituals.plans, now);
  const [next, ...laterPlans] = plans;
  const active = rituals.active;
  const step = active ? currentStep(active) : null;
  const stepIndex = active && step ? active.session_steps.findIndex((s) => s.id === step.id) : -1;

  const moonChoices = PHASE_ORDER.filter((p) => reminders.settings.phases[p]).length;
  const reminderDetail = moonChoices
    ? `${moonChoices} moon ${moonChoices === 1 ? 'phase' : 'phases'}${reminders.settings.rituals ? ' and planned rituals' : ''}`
    : reminders.settings.rituals
      ? 'Before planned rituals'
      : 'Off';

  return (
    <RitualScreen onRefresh={refresh}>
      <Title eyebrow={moon.name}>Rituals</Title>

      {rituals.status === 'offline' && <Notice>Offline · showing the copy saved on this phone</Notice>}

      {active && (
        <Card accent>
          <Text style={[type.eyebrow, ui.gold]}>{active.status === 'paused' ? 'Paused' : 'Under way'}</Text>
          <Text style={type.cardTitle}>{active.title || 'Your ritual'}</Text>
          <Body muted>
            {step && active.session_steps.length
              ? `Step ${stepIndex + 1} of ${active.session_steps.length} · ${step.title}`
              : 'Take the time you need, then finish and journal it.'}
          </Body>
          <Button label="Continue the ritual" onPress={() => router.push('/rituals/run')} />
        </Card>
      )}

      <Card accent>
        <Text style={[type.eyebrow, ui.gold]}>Your next working</Text>
        {next ? (
          <>
            <Text style={type.cardTitle}>{next.title}</Text>
            <Body muted>{`${planWhen(next, now)} · ${planSky(next)}`}</Body>
            <Button
              label="Open the plan"
              variant="outline"
              onPress={() => router.push({ pathname: '/rituals/plan/[id]', params: { id: next.id } })}
            />
          </>
        ) : (
          <>
            <Text style={type.cardTitle}>Nothing planned yet</Text>
            <Body muted>Choose an intention and we'll find the right night.</Body>
            <Button label="Plan a ritual" onPress={() => router.push('/rituals/planner')} />
          </>
        )}
      </Card>

      {laterPlans.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Also planned</SectionLabel>
          <List>
            {laterPlans.slice(0, 4).map((plan, i, all) => (
              <Row
                key={plan.id}
                icon="calendar"
                title={plan.title}
                detail={planWhen(plan, now)}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/plan/[id]', params: { id: plan.id } })}
              />
            ))}
          </List>
        </View>
      )}

      <List>
        <Row
          title="Begin a ritual"
          detail="From one of your templates, or a quiet working of your own"
          onPress={() => router.push('/rituals/templates')}
        />
        <Row icon="calendar" title="Plan a night" detail="Moon phase and weekday for your intention" onPress={() => router.push('/rituals/planner')} />
        <Row icon="altar" title="Build a spell" detail="Ingredients from the Library, steps to follow" onPress={() => router.push('/rituals/spell')} />
        <Row icon="bell" title="Moon reminders" detail={reminderDetail} last onPress={() => router.push('/rituals/reminders')} />
      </List>

      <View style={ui.gapSmall}>
        <View style={styles.headRow}>
          <SectionLabel>Journal</SectionLabel>
          <Button label="Record a ritual" variant="text" onPress={() => router.push('/rituals/journal/new')} />
        </View>
        {journal.length === 0 ? (
          <Card>
            <Body>Rituals you finish here or at the website's altar are kept in your journal.</Body>
          </Card>
        ) : (
          <List>
            {journal.slice(0, 5).map((entry, i, all) => (
              <Row
                key={entry.id}
                icon="grimoire"
                title={entry.title || 'Untitled Ritual'}
                detail={journalDetail(entry)}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/journal/[id]', params: { id: entry.id } })}
              />
            ))}
          </List>
        )}
        {journal.length > 5 && <Button label={`See all ${journal.length} rituals`} variant="outline" onPress={() => router.push('/rituals/journal')} />}
      </View>

      {!session && (
        <Card>
          <Body>Your rituals are kept on this phone. Sign in to keep them with your Salt &amp; Sovereignty account and see them on the website.</Body>
          <Button label="Sign in to sync" variant="outline" onPress={() => router.push('/sign-in')} />
        </Card>
      )}

      {session && rituals.deviceCount > 0 && (
        <Card>
          <Text style={type.cardTitle}>Rituals from this phone</Text>
          <Body>
            {`You kept ${rituals.deviceCount} ${rituals.deviceCount === 1 ? 'ritual record' : 'ritual records'} here before signing in. Bring them into your account?`}
          </Body>
          <Button
            label={moving ? 'Bringing them over…' : 'Bring them into my account'}
            variant="outline"
            disabled={moving}
            onPress={async () => {
              setMoving(true);
              try {
                const count = await bringDeviceRitualsToAccount();
                tell('Rituals synced', `${count} ${count === 1 ? 'record is' : 'records are'} now in your account.`);
              } catch (e) {
                tell("Couldn't bring them over", e instanceof Error ? e.message : 'Please try again.');
              } finally {
                setMoving(false);
              }
            }}
          />
        </Card>
      )}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
