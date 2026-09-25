import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, SignInCard, Title, confirmAction, tell, ui } from '../../../../components/rituals/ui';
import { useGrimoire } from '../../../../lib/grimoire/store';
import { blankStep, draftFromTemplate, validateDraft } from '../../../../lib/rituals/lifecycle';
import { archiveTemplate, saveTemplate, useRituals } from '../../../../lib/rituals/store';
import type { StepDraft, TemplateDraft } from '../../../../lib/rituals/types';
import { useSession } from '../../../../lib/session';
import { colors, radius, type } from '../../../../theme';

export default function TemplateEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useSession();
  const rituals = useRituals();
  const grimoire = useGrimoire();
  const existing = id ? rituals.templates.find((t) => t.id === id) ?? null : null;
  const [draft, setDraft] = useState<TemplateDraft>(() => draftFromTemplate(existing));
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Opened before the templates finished loading: fill the form once they arrive.
  useEffect(() => {
    if (existing && !draft.id) setDraft(draftFromTemplate(existing));
  }, [existing, draft.id]);

  if (!session) {
    return (
      <RitualScreen back="Templates">
        <Title>Ritual template</Title>
        <SignInCard title="Sign in to write templates" body="Templates are kept in your account, so they're here and at the website's altar." />
      </RitualScreen>
    );
  }

  const change = (patch: Partial<TemplateDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const changeStep = (index: number, patch: Partial<StepDraft>) =>
    setDraft((d) => ({ ...d, steps: d.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  const move = (index: number, by: number) =>
    setDraft((d) => {
      const steps = [...d.steps];
      const [step] = steps.splice(index, 1);
      steps.splice(index + by, 0, step);
      return { ...d, steps };
    });

  const save = async () => {
    const invalid = validateDraft(draft);
    setProblem(invalid);
    if (invalid) return;
    setSaving(true);
    try {
      const saved = await saveTemplate(draft);
      void grimoire.refresh();
      router.replace({ pathname: '/rituals/templates/[id]', params: { id: saved.id } });
    } catch (e) {
      setProblem(e instanceof Error ? `Couldn't save: ${e.message}` : "Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const archive = async () => {
    if (!draft.id) return;
    const ok = await confirmAction('Archive this template?', 'It leaves your list here and on the website. Rituals you already did keep their record.', 'Archive');
    if (!ok) return;
    try {
      await archiveTemplate(draft.id);
      router.replace('/rituals/templates');
    } catch (e) {
      tell("Couldn't archive", e instanceof Error ? e.message : 'Please try again.');
    }
  };

  return (
    <RitualScreen back={existing ? existing.title : 'Templates'}>
      <Title eyebrow="Book of Shadows">{existing ? 'Edit template' : 'New template'}</Title>

      <Card>
        <SectionLabel>The ritual</SectionLabel>
        <Field label="Ritual name" value={draft.title} onChange={(title) => change({ title })} placeholder="Deipnon, protection rite, full moon offering…" />
        <Field
          label="Purpose or intention"
          value={draft.intention}
          onChange={(intention) => change({ intention })}
          placeholder="What does this ritual hold, honor, release, or invite?"
          multiline
        />
        <Field
          label="Preparation"
          value={draft.preparation}
          onChange={(preparation) => change({ preparation })}
          placeholder="Anything to gather, prepare, cleanse, or remember before beginning."
          multiline
        />
        {rituals.altars.length > 0 && (
          <View style={ui.gapSmall}>
            <Text style={type.caption}>Linked altar setup</Text>
            <Chips>
              <Chip label="The altar as it is" selected={!draft.linked_altar_id} onPress={() => change({ linked_altar_id: null })} />
              {rituals.altars.map((altar) => (
                <Chip key={altar.id} label={altar.name} selected={draft.linked_altar_id === altar.id} onPress={() => change({ linked_altar_id: altar.id })} />
              ))}
            </Chips>
          </View>
        )}
      </Card>

      <View style={ui.gap}>
        <SectionLabel>Steps</SectionLabel>
        {draft.steps.map((step, index) => (
          <View key={index} style={styles.step}>
            <Text style={type.cardTitle}>{`Step ${index + 1}`}</Text>
            <Field label="Step title" value={step.title} onChange={(title) => changeStep(index, { title })} placeholder="Open the space" />
            <Field
              label="Guidance"
              value={step.instructions}
              onChange={(instructions) => changeStep(index, { instructions })}
              placeholder="What to do during this step"
              multiline
            />
            <Field
              label="Words to read or speak"
              value={step.spoken_text}
              onChange={(spoken_text) => changeStep(index, { spoken_text })}
              placeholder="Optional prayer, invocation or petition"
              multiline
            />
            <Field label="Timer in minutes" value={step.minutes} onChange={(minutes) => changeStep(index, { minutes })} placeholder="Optional" keyboardType="decimal-pad" />
            {!!step.minutes.trim() && (
              <Chips>
                <Chip label="I'll move on myself" selected={step.completion_mode !== 'timed'} onPress={() => changeStep(index, { completion_mode: 'manual' })} />
                <Chip label="Move on when the timer ends" selected={step.completion_mode === 'timed'} onPress={() => changeStep(index, { completion_mode: 'timed' })} />
              </Chips>
            )}
            <Chips>
              {index > 0 && <Chip label="Move up" a11yLabel={`Move step ${index + 1} up`} onPress={() => move(index, -1)} />}
              {index < draft.steps.length - 1 && (
                <Chip label="Move down" a11yLabel={`Move step ${index + 1} down`} onPress={() => move(index, 1)} />
              )}
              {draft.steps.length > 1 && (
                <Chip
                  label="Remove"
                  a11yLabel={`Remove step ${index + 1}`}
                  onPress={() => setDraft((d) => ({ ...d, steps: d.steps.filter((_, i) => i !== index) }))}
                />
              )}
            </Chips>
          </View>
        ))}
        <Button label="Add another step" variant="outline" onPress={() => change({ steps: [...draft.steps, blankStep()] })} />
      </View>

      <Card>
        <SectionLabel>Closing</SectionLabel>
        <Field
          label="Closing words or instructions"
          value={draft.closing}
          onChange={(closing) => change({ closing })}
          placeholder="Ground, give thanks, dispose of offerings, record impressions…"
          multiline
        />
      </Card>

      {!!problem && <Notice>{problem}</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving into your Book of Shadows…' : existing ? 'Save changes' : 'Save template'} disabled={saving} onPress={save} />
        {!!existing && <Button label="Archive template" variant="text" onPress={archive} />}
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  step: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 12 },
});
