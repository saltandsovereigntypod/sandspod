import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { SupportLink } from '../../../../components/SupportLink';
import { AltarChoiceSheet, useBeginOnAltar } from '../../../../components/altar/connect/BeginOnAltar';
import { IngredientCheck } from '../../../../components/altar/connect/IngredientCheck';
import { premadeNeeds } from '../../../../lib/altar/connect/ingredients';
import { Body, Card, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../components/rituals/ui';
import { ritualsLibraryHref } from '../../../../lib/library';
import { pathName } from '../../../../lib/library/traditions';
import { handOffDraft } from '../../../../lib/rituals/handoff';
import { intentionByKey } from '../../../../lib/rituals/planner';
import { premadeById, premadeDraft, practiceName } from '../../../../lib/rituals/premade';
import { saveTemplate, startRitual, useRituals } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';
import { colors, fonts, radius, type } from '../../../../theme';

const MOON_WORDS: Record<string, string> = {
  new: 'New moon',
  waxing: 'Waxing moon',
  full: 'Full moon',
  waning: 'Waning moon',
  dark: 'Dark moon',
  blue: 'Blue moon',
  eclipse: 'Eclipse',
};
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "traditional/herb/rosemary" → the Library entry id "traditional:herb:rosemary". */
const entryIdOf = (ref: string) => ref.replace(/\//g, ':');

export default function PremadeView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const premade = premadeById(id);
  const rituals = useRituals();
  const { session } = useSession();
  const [busy, setBusy] = useState<'begin' | 'save' | null>(null);
  const [choosingAltar, setChoosingAltar] = useState(false);
  const onAltar = useBeginOnAltar();
  const needs = useMemo(() => (premade ? premadeNeeds(premade) : []), [premade]);

  if (!premade) {
    return (
      <RitualScreen back="Workings library">
        <Title>Not found</Title>
        <Body>This working isn’t in the book any more.</Body>
      </RitualScreen>
    );
  }

  const intention = intentionByKey(premade.intention);
  const when = [...(premade.moon ?? []).map((m) => MOON_WORDS[m]), premade.weekday !== undefined ? WEEKDAYS[premade.weekday] : null].filter(Boolean);
  const facts = [premade.kind === 'spell' ? 'Spell' : 'Ritual', `about ${premade.minutes} min`, premade.level === 'beginner' ? 'Beginner' : 'Some experience', premade.solo ? 'Alone' : 'With others']
    .join(' · ');
  const belongs = [...premade.practices.map(practiceName), ...premade.paths.map(pathName)].join(' · ');

  const begin = async () => {
    setBusy('begin');
    try {
      await startRitual({ kind: 'draft', draft: premadeDraft(premade) });
      router.replace('/rituals/run');
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const beginOnAltar = async (altarId: string) => {
    setChoosingAltar(false);
    try {
      await onAltar.begin({ kind: 'premade', premade }, altarId);
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    }
  };

  const plan = () => {
    handOffDraft(premadeDraft(premade));
    router.push({ pathname: '/rituals/planner', params: { fromSpell: '1', ...(intention ? { intention: intention.key } : {}) } });
  };

  const save = async () => {
    setBusy('save');
    try {
      const saved = await saveTemplate(premadeDraft(premade));
      router.push({ pathname: '/rituals/templates/[id]', params: { id: saved.id } });
    } catch (e) {
      tell("Couldn't save", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <RitualScreen back="Workings library">
      <Title eyebrow={belongs}>{premade.title}</Title>
      <Body muted>{facts}</Body>
      <Body>{premade.summary}</Body>
      {when.length > 0 && <Body muted>{`Best on: ${when.join(', ')}`}</Body>}

      <View style={ui.actions}>
        <Button label={busy === 'begin' ? 'Beginning…' : 'Begin this ritual'} disabled={!!busy || !!rituals.active} onPress={begin} />
        <Button
          label={onAltar.busy ? 'Beginning…' : 'Begin on an altar'}
          variant="outline"
          disabled={!!busy || onAltar.busy || !!rituals.active}
          accessibilityHint="Choose one of your altars; the ritual runs over it and lights its candles as the steps begin"
          onPress={() => setChoosingAltar(true)}
        />
        {!!rituals.active && <Body muted>Finish the ritual that’s under way before beginning another.</Body>}
        <Button label="Plan a night for it" variant="outline" onPress={plan} />
        {session ? (
          <Button label={busy === 'save' ? 'Saving…' : 'Save a copy to my templates'} variant="outline" disabled={!!busy} onPress={save} />
        ) : (
          <Body muted>Sign in to save a copy to your own templates and change it however you like.</Body>
        )}
      </View>

      {!!premade.safety && (
        <Card accent>
          <SectionLabel>Take care</SectionLabel>
          <Body>{premade.safety}</Body>
        </Card>
      )}

      <IngredientCheck needs={needs} />

      <Card>
        <SectionLabel>You’ll need</SectionLabel>
        {premade.ingredients.length ? (
          premade.ingredients.map((item, i) => {
            const label = `${item.name}${item.optional ? ' (optional)' : ''}`;
            return item.ref ? (
              <Pressable
                key={`${item.name}-${i}`}
                accessibilityRole="link"
                accessibilityLabel={`${label}. Open in the Library`}
                onPress={() => router.push(ritualsLibraryHref({ id: entryIdOf(item.ref!) }))}
              >
                <Text style={[styles.item, styles.link]}>{`• ${label}`}</Text>
              </Pressable>
            ) : (
              <Text key={`${item.name}-${i}`} style={styles.item}>{`• ${label}`}</Text>
            );
          })
        ) : (
          <Body>Nothing but yourself.</Body>
        )}
        {!!premade.preparation && <Body>{premade.preparation}</Body>}
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Steps</SectionLabel>
        {premade.steps.map((step, i) => (
          <View key={`${step.title}-${i}`} style={styles.step} accessible accessibilityLabel={`Step ${i + 1}: ${step.title}`}>
            <Text style={styles.number}>{i + 1}</Text>
            <View style={styles.stepText}>
              <Text style={type.cardTitle}>{step.title}</Text>
              <Body>{step.instructions}</Body>
              {!!step.spoken && <Text style={styles.spoken}>{step.spoken}</Text>}
              {!!step.minutes && <Body muted>{`${step.minutes} min${step.timed ? ' · moves on when the timer ends' : ''}`}</Body>}
            </View>
          </View>
        ))}
      </View>

      <Card>
        <SectionLabel>Closing</SectionLabel>
        <Body>{premade.closing}</Body>
      </Card>

      <Card>
        <SectionLabel>About this working</SectionLabel>
        <Body>{premade.lore}</Body>
        {!!premade.sources?.length && <Body muted>{`Drawn from: ${premade.sources.join('; ')}.`}</Body>}
      </Card>

      <AltarChoiceSheet visible={choosingAltar} title={premade.title} onClose={() => setChoosingAltar(false)} onPick={(id) => void beginOnAltar(id)} />
      <SupportLink />
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  item: { ...type.body, color: colors.cream },
  link: { color: colors.gold, textDecorationLine: 'underline' },
  step: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderRadius: radius.tile, padding: 14 },
  number: { fontFamily: fonts.display, fontSize: 26, color: colors.gold, width: 24, textAlign: 'center' },
  stepText: { flex: 1, gap: 6 },
  spoken: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, color: colors.parchment },
});
