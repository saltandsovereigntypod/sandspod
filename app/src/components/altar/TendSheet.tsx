import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import type { ApothecaryState } from '../../lib/altar/livingState';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  name: string;
  state: ApothecaryState | null;
  /** How often it asks to be tended, from its recipe. */
  intervalDays: number;
  onClose: () => void;
  onSave: (change: Partial<ApothecaryState>) => void;
};

const addDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
const day = (iso: string) => {
  const date = new Date(iso);
  return iso && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' })
    : 'Not set';
};

/** Tend a working on the altar (the website's crafted actions: Activation, Remaining, Review, Tend). */
export function TendSheet({ visible, name, state, intervalDays, onClose, onSave }: Props) {
  return (
    <Sheet visible={visible && !!state} size="half" eyebrow="Tend" title={name} onClose={onClose}>
      {state && <TendForm key={`${name}-${state.nextTendingAt}-${state.reviewAt}`} state={state} intervalDays={intervalDays} onSave={onSave} />}
    </Sheet>
  );
}

function TendForm({ state, intervalDays, onSave }: { state: ApothecaryState; intervalDays: number; onSave: Props['onSave'] }) {
  const [activation, setActivation] = useState(state.activationState);
  const [remaining, setRemaining] = useState(state.remainingAmount);
  const [openedAt] = useState(() => Date.now());
  const due = state.nextTendingAt && Date.parse(state.nextTendingAt) <= openedAt;

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <Text style={styles.label}>Next tending</Text>
        <Text style={[styles.value, due && styles.due]}>{due ? `Due · ${day(state.nextTendingAt)}` : day(state.nextTendingAt)}</Text>
      </View>
      <ChipRow>
        <Chip label="I tended it today" symbol="✓" onPress={() => onSave({ nextTendingAt: addDays(intervalDays) })} />
        {!!state.nextTendingAt && <Chip label="No reminder" onPress={() => onSave({ nextTendingAt: '' })} />}
      </ChipRow>

      <View style={styles.row}>
        <Text style={styles.label}>Review or replace by</Text>
        <Text style={styles.value}>{day(state.reviewAt)}</Text>
      </View>
      <ChipRow>
        <Chip label="In a month" onPress={() => onSave({ reviewAt: addDays(30) })} />
        <Chip label="In 3 months" onPress={() => onSave({ reviewAt: addDays(90) })} />
        <Chip label="In 6 months" onPress={() => onSave({ reviewAt: addDays(180) })} />
        {!!state.reviewAt && <Chip label="None" onPress={() => onSave({ reviewAt: '' })} />}
      </ChipRow>

      <Text style={type.eyebrow}>Activation</Text>
      <TextInput
        value={activation}
        onChangeText={setActivation}
        placeholder="Charged under the full moon, sealed with wax…"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Activation"
        style={styles.input}
      />
      <Text style={type.eyebrow}>Amount remaining</Text>
      <TextInput
        value={remaining}
        onChangeText={setRemaining}
        placeholder="Half a bottle, three sticks…"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Amount remaining"
        style={styles.input}
      />
      <Button
        label="Save"
        variant="outline"
        disabled={activation === state.activationState && remaining === state.remainingAmount}
        onPress={() => onSave({ activationState: activation.trim(), remainingAmount: remaining.trim() })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  label: { fontFamily: fonts.body, fontSize: 15, color: colors.parchment },
  value: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  due: { color: colors.gold },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.ground,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
});
