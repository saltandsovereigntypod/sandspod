import { StyleSheet, Text, View } from 'react-native';

import { blankStep } from '../../lib/rituals/lifecycle';
import type { StepDraft } from '../../lib/rituals/types';
import { colors, radius, type } from '../../theme';
import { Button } from '../Button';
import { Chip, Chips, Field } from './ui';

/** Every step of a ritual, editable: words, timers, order, adding and removing. */
export function StepsEditor({ steps, onChange }: { steps: StepDraft[]; onChange: (steps: StepDraft[]) => void }) {
  const changeStep = (index: number, patch: Partial<StepDraft>) => onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const move = (index: number, by: number) => {
    const next = [...steps];
    const [step] = next.splice(index, 1);
    next.splice(index + by, 0, step);
    onChange(next);
  };

  return (
    <>
      {steps.map((step, index) => (
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
            {index < steps.length - 1 && (
              <Chip label="Move down" a11yLabel={`Move step ${index + 1} down`} onPress={() => move(index, 1)} />
            )}
            {steps.length > 1 && (
              <Chip
                label="Remove"
                a11yLabel={`Remove step ${index + 1}`}
                onPress={() => onChange(steps.filter((_, i) => i !== index))}
              />
            )}
          </Chips>
        </View>
      ))}
      <Button label="Add another step" variant="outline" onPress={() => onChange([...steps, blankStep()])} />
    </>
  );
}

const styles = StyleSheet.create({
  step: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 12 },
});
