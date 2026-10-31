import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { PracticeSwitch } from '../../../components/PracticeSwitch';
import { NextWorking } from '../../../components/rituals/NextWorking';
import { Body, Card, List, Notice, RitualScreen, Row, SectionLabel, Title, tell, ui } from '../../../components/rituals/ui';
import { moonState } from '../../../lib/moon';
import { APOTHECARY, APOTHECARY_SUBTITLE, WORKINGS_LIBRARY } from '../../../lib/names';
import { currentStep } from '../../../lib/rituals/lifecycle';
import { journalDetail, planWhen } from '../../../lib/rituals/format';
import { journalInsights } from '../../../lib/rituals/insights';
import { PREMADE } from '../../../lib/rituals/premade';
import { sortJournal, upcomingPlans } from '../../../lib/rituals/plans';
import { bringDeviceRitualsToAccount, refresh, useRituals } from '../../../lib/rituals/store';
import { useSession } from '../../../lib/session';
import { type } from '../../../theme';

// The Rituals home: ritual work. What's under way and next, then three
// groups — Do, Learn and Record. The tools that aren't rituals (Cycle & Moon,
// astrology, divination, the sigil maker, the craft tools) are on the Craft
// home, Practice's third section (rituals/craft/index.tsx). Reminders live in Settings (More); the website's Rituals page
// (rituals/js/home.js) is grouped the same way.
export default function RitualsHome() {
  const { session } = useSession();
  const rituals = useRituals();
  const [moving, setMoving] = useState(false);
  const now = new Date();
  const moon = moonState(now);

  const journal = useMemo(() => sortJournal(rituals.journal), [rituals.journal]);
  const insight = useMemo(() => journalInsights(rituals.journal, new Date()), [rituals.journal]);
  const laterPlans = upcomingPlans(rituals.plans, now).slice(1);
  const active = rituals.active;
  const step = active ? currentStep(active) : null;
  const stepIndex = active && step ? active.session_steps.findIndex((s) => s.id === step.id) : -1;

  return (
    <RitualScreen onRefresh={refresh}>
      <PracticeSwitch current="rituals" />
      <Title eyebrow={moon.name}>Rituals</Title>

      {rituals.status === 'offline' && <Notice>Couldn’t refresh just now · showing the copy saved on this phone</Notice>}

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

      <NextWorking now={now} variant="rituals" />

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

      <View style={ui.gapSmall}>
        <SectionLabel>Do</SectionLabel>
        <List>
          <Row
            title="Begin a ritual"
            detail="From one of your templates, or a quiet working of your own"
            onPress={() => router.push('/rituals/templates')}
          />
          <Row icon="calendar" title="Plan a ritual" detail="The moon phase and weekday for your intention" onPress={() => router.push('/rituals/planner')} />
          <Row icon="altar" title="Build a spell" detail="Purpose, form, Library ingredients, timing and words" onPress={() => router.push('/rituals/spell')} />
          <Row
            icon="wheel"
            title="Cycle, astrology, divination and more"
            detail="Now under Craft, at the top · with the sigil maker and tools for every path"
            last
            onPress={() => router.navigate('/rituals/craft' as Href)}
          />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Learn</SectionLabel>
        <List>
          <Row
            icon="grimoire"
            title={WORKINGS_LIBRARY}
            detail={`${PREMADE.length} premade rituals and spells for every practice and path`}
            onPress={() => router.push('/rituals/premade')}
          />
          <Row
            icon="coven"
            title="Community Rituals"
            detail="Rituals and spells the community has shared · search, add to yours or do once"
            onPress={() => router.push('/rituals/community')}
          />
          <Row
            icon="wheel"
            title="Dedication journeys"
            detail="Study, practice and a rite of self-dedication to a path or a god"
            last
            onPress={() => router.push('/rituals/journeys')}
          />
        </List>
      </View>

      <View style={ui.gapSmall}>
        <View style={styles.headRow}>
          <SectionLabel>Record</SectionLabel>
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
        <List>
          {journal.length > 0 && (
            <Row
              icon="grimoire"
              title="Journal"
              detail={journal.length > 5 ? `All ${journal.length} rituals you’ve kept` : 'Every ritual you’ve kept, and what worked'}
              onPress={() => router.push('/rituals/journal')}
            />
          )}
          {journal.length > 0 && (
            <Row
              icon="today"
              title="Your moon"
              detail={insight.lines[0] ?? 'Which moons you work under, and what for'}
              onPress={() => router.push('/rituals/journal/insights')}
            />
          )}
          <Row icon="altar" title={APOTHECARY} detail={APOTHECARY_SUBTITLE} onPress={() => router.push('/rituals/apothecary')} />
          <Row icon="grimoire" title="Journals" detail="Shadow work, Deity & spirit, Ancestors, and Omens & signs" last onPress={() => router.push('/rituals/journals')} />
        </List>
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
