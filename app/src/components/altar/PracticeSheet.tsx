import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { SwitchRow } from '../more/ui';
import {
  ACTIVITY_TYPES,
  filterTendChoices,
  PRACTICE_ACTIVITIES,
  sameChoice,
  tendSummary,
  TEND_METHODS,
  type PracticeActivity,
  type TendChoice,
  type TendInput,
} from '../../lib/altar/instances';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

type Props = {
  visible: boolean;
  name: string;
  /** Everything that can be chosen as a support (cabinet forms and apothecary items). */
  choices: TendChoice[];
  onClose: () => void;
  onTend: (input: TendInput) => Promise<boolean>;
  onActivity: (kind: Exclude<PracticeActivity, 'tend'>, options: string[], notes: string) => Promise<boolean>;
};

/**
 * Today's Practice for a manifestation with an instance (the website's Begin
 * Practice): choose Tend, Charge, Perform Ritual or Journal, then record it.
 * One sheet switches between the menu and each form, so nothing has to wait
 * for another sheet to close.
 */
export function PracticeSheet({ visible, name, choices, onClose, onTend, onActivity }: Props) {
  const [step, setStep] = useState<PracticeActivity | null>(null);
  const close = () => {
    setStep(null);
    onClose();
  };
  const title = step === 'tend' ? "Today's Tending" : step ? ACTIVITY_TYPES[step].title : "Today's Practice";

  return (
    <Sheet visible={visible} eyebrow={name} title={title} onClose={close}>
      {visible && !step && (
        <View style={styles.form}>
          <Text style={type.body}>What would you like to do with this manifestation today?</Text>
          {PRACTICE_ACTIVITIES.map((activity) => (
            <Pressable
              key={activity.id}
              accessibilityRole="button"
              onPress={() => setStep(activity.id)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.cardTitle}>{`${activity.symbol}  ${activity.label}`}</Text>
              <Text style={type.caption}>{activity.description}</Text>
            </Pressable>
          ))}
        </View>
      )}
      {visible && step === 'tend' && <TendForm choices={choices} onBack={() => setStep(null)} onSave={async (input) => (await onTend(input)) && close()} />}
      {visible && step && step !== 'tend' && (
        <ActivityForm
          key={step}
          kind={step}
          onBack={() => setStep(null)}
          onSave={async (options, notes) => (await onActivity(step, options, notes)) && close()}
        />
      )}
    </Sheet>
  );
}

function TendForm({ choices, onBack, onSave }: { choices: TendChoice[]; onBack: () => void; onSave: (input: TendInput) => Promise<unknown> }) {
  const [methods, setMethods] = useState<string[]>([]);
  const [picked, setPicked] = useState<TendChoice[]>([]);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [resetReminder, setResetReminder] = useState(true);
  const [nextDays, setNextDays] = useState('');
  const [saveAsBlend, setSaveAsBlend] = useState(false);
  const [blendName, setBlendName] = useState('');
  const [busy, setBusy] = useState(false);
  const shown = useMemo(() => filterTendChoices(choices, methods, search), [choices, methods, search]);
  const toggleMethod = (id: string) => setMethods((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  const toggleChoice = (choice: TendChoice) =>
    setPicked((prev) => (prev.some((c) => sameChoice(c, choice)) ? prev.filter((c) => !sameChoice(c, choice)) : [...prev, choice]));
  const summary = tendSummary(picked, methods);

  const save = async () => {
    setBusy(true);
    try {
      await onSave({ choices: picked, methods, notes, resetReminder, nextDays: Math.max(0, Math.round(Number(nextDays) || 0)), saveAsBlend, blendName });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={type.caption}>
        Choose how you would like to care for this manifestation today. There is no required way to tend. Record only what feels meaningful to your
        practice.
      </Text>
      <Text style={type.eyebrow}>1. How would you like to tend it?</Text>
      <ChipRow>
        {TEND_METHODS.map((method) => (
          <Chip
            key={method.id}
            label={method.label}
            accessibilityLabel={`${method.label}: ${method.hint}`}
            active={methods.includes(method.id)}
            onPress={() => toggleMethod(method.id)}
          />
        ))}
      </ChipRow>

      <Text style={type.eyebrow}>2. What would you like to use?</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search herbs, oils, crystals, apothecary items..."
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Search supports"
        autoCorrect={false}
        style={styles.input}
      />
      {shown.length ? (
        <ChipRow>
          {shown.map((choice) => (
            <Chip
              key={`${choice.source}|${choice.label}|${choice.type}`}
              label={choice.label}
              accessibilityLabel={`${choice.label}, ${choice.source}${choice.type ? `, ${choice.type}` : ''}`}
              active={picked.some((c) => sameChoice(c, choice))}
              onPress={() => toggleChoice(choice)}
            />
          ))}
        </ChipRow>
      ) : (
        <Text style={type.caption}>No matching supports found. You can still record this tending with notes.</Text>
      )}

      <Text style={type.eyebrow}>3. Your ritual so far</Text>
      <Text style={type.body}>{summary || 'Choose one or more tending methods, then add any supports you used.'}</Text>

      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Record any thoughts, feelings, sensations, signs, or observations you'd like to remember."
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Reflections"
        multiline
        style={[styles.input, styles.multiline]}
      />

      <Text style={type.eyebrow}>4. Create a reusable blend</Text>
      <SwitchRow label="Create this combination as a reusable Apothecary item" value={saveAsBlend} onChange={setSaveAsBlend} />
      {saveAsBlend && (
        <>
          <TextInput
            value={blendName}
            onChangeText={setBlendName}
            placeholder="Dream Sachet Tending Blend, Protection Jar Feeding Oil..."
            placeholderTextColor={colors.tabInactive}
            accessibilityLabel="Apothecary item name"
            style={styles.input}
          />
          {!picked.length && <Text style={type.caption}>Choose at least one support above to save it as a blend.</Text>}
        </>
      )}

      <Text style={type.eyebrow}>5. Future tending</Text>
      <SwitchRow label="Begin the next tending cycle today" value={resetReminder} onChange={setResetReminder} />
      {resetReminder && (
        <TextInput
          value={nextDays}
          onChangeText={setNextDays}
          placeholder="Days until the next tending (its usual interval if blank)"
          placeholderTextColor={colors.tabInactive}
          accessibilityLabel="Days until the next tending reminder"
          keyboardType="number-pad"
          style={styles.input}
        />
      )}

      <Button label={busy ? 'Saving…' : 'Save Tending'} onPress={save} disabled={busy} />
      <Button label="Back" variant="text" onPress={onBack} />
    </View>
  );
}

function ActivityForm({
  kind,
  onBack,
  onSave,
}: {
  kind: Exclude<PracticeActivity, 'tend'>;
  onBack: () => void;
  onSave: (options: string[], notes: string) => Promise<unknown>;
}) {
  const config = ACTIVITY_TYPES[kind];
  const [options, setOptions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const toggle = (option: string) => setOptions((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  const save = async () => {
    setBusy(true);
    try {
      await onSave(options, notes);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={type.caption}>{config.intro}</Text>
      <Text style={type.eyebrow}>{config.optionsLabel}</Text>
      <ChipRow>
        {config.options.map((option) => (
          <Chip key={option} label={option} active={options.includes(option)} onPress={() => toggle(option)} />
        ))}
      </ChipRow>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder={config.placeholder}
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Reflections"
        multiline
        style={[styles.input, styles.multiline]}
      />
      <Button label={busy ? 'Saving…' : `Save ${config.title}`} onPress={save} disabled={busy} />
      <Button label="Back" variant="text" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  card: { gap: 4, minHeight: touch, padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  cardTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
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
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
});
