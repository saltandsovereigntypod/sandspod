import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Connections } from '../../../../components/rituals/Connections';
import { Body, Card, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../components/rituals/ui';
import { minutesLabel } from '../../../../lib/rituals/format';
import { startRitual, useRituals } from '../../../../lib/rituals/store';
import type { Ingredient } from '../../../../lib/rituals/types';
import { colors, fonts, radius, type } from '../../../../theme';

export default function TemplateView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rituals = useRituals();
  const template = rituals.templates.find((t) => t.id === id) ?? null;
  const [starting, setStarting] = useState(false);

  if (!template) {
    return (
      <RitualScreen back="Templates">
        <Title>Template</Title>
        <Body>{rituals.status === 'loading' || rituals.status === 'idle' ? 'Opening…' : "This template couldn't be found. It may have been archived on the website."}</Body>
      </RitualScreen>
    );
  }

  const steps = template.ritual_template_steps ?? [];
  const ingredients = Array.isArray(template.metadata?.ingredients) ? (template.metadata.ingredients as Ingredient[]) : [];
  const facts = [`${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`, minutesLabel(template.estimated_duration_seconds)].filter(Boolean).join(' · ');

  const begin = async () => {
    setStarting(true);
    try {
      await startRitual({ kind: 'template', template });
      router.replace('/rituals/run');
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <RitualScreen back="Templates">
      <Title eyebrow={template.metadata?.kind === 'spell' ? 'Spell' : 'Ritual template'}>{template.title}</Title>
      <Body muted>{facts}</Body>
      {!!template.intention && <Body>{template.intention}</Body>}

      <View style={ui.actions}>
        <Button label={starting ? 'Beginning…' : 'Begin this ritual'} disabled={starting || !!rituals.active} onPress={begin} />
        {!!rituals.active && <Body muted>Finish the ritual that's under way before beginning another.</Body>}
        <Button
          label="Plan a night for it"
          variant="outline"
          onPress={() => router.push({ pathname: '/rituals/planner', params: { templateId: template.id } })}
        />
      </View>

      {!!template.preparation && (
        <Card>
          <SectionLabel>Preparation</SectionLabel>
          <Body>{template.preparation}</Body>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Steps</SectionLabel>
        {steps.map((step, i) => (
          <View key={step.id} style={styles.step} accessible accessibilityLabel={`Step ${i + 1}: ${step.title}`}>
            <Text style={styles.number}>{i + 1}</Text>
            <View style={styles.stepText}>
              <Text style={type.cardTitle}>{step.title}</Text>
              {!!step.instructions && <Body>{step.instructions}</Body>}
              {!!step.spoken_text && <Text style={styles.spoken}>{step.spoken_text}</Text>}
              {!!step.duration_seconds && (
                <Body muted>{`${minutesLabel(step.duration_seconds)}${step.completion_mode === 'timed' ? ' · moves on when the timer ends' : ''}`}</Body>
              )}
            </View>
          </View>
        ))}
      </View>

      {!!template.closing && (
        <Card>
          <SectionLabel>Closing</SectionLabel>
          <Body>{template.closing}</Body>
        </Card>
      )}

      <Connections
        grimoirePageId={template.grimoire_page_id}
        altarId={template.linked_altar_id}
        altars={rituals.altars}
        ingredients={ingredients}
      />

      <Button
        label="Edit template"
        variant="outline"
        onPress={() => router.push({ pathname: '/rituals/templates/edit', params: { id: template.id } })}
      />
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderRadius: radius.tile, padding: 14 },
  number: { fontFamily: fonts.display, fontSize: 26, color: colors.gold, width: 24, textAlign: 'center' },
  stepText: { flex: 1, gap: 6 },
  spoken: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, color: colors.parchment },
});
