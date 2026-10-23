import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../Button';
import { SwitchRow } from '../more/ui';
import type { AltarOptions } from '../../lib/altar/altarOptions';
import {
  FLAME_SIGNS,
  readingLines,
  readingSummary,
  REMNANT_CHOICES,
  SMOKE_SIGNS,
  WAX_SIGNS,
  type ReadingInput,
  type RemnantChoice,
  type Sign,
} from '../../lib/altar/ceromancy';
import { lifeDuration } from '../../lib/altar/companion';
import { INCENSE_FORMS, incenseFormInfo, type IncenseForm } from '../../lib/altar/incense';
import { OFFERING_KINDS, type OfferingKindId } from '../../lib/altar/offerings';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Chip, ChipRow } from './Chip';
import { Sheet } from './Sheet';

// ── How did it burn? ─────────────────────────────────────────────────────

const EMPTY: ReadingInput = { flame: '', smoke: [], wax: [], notes: '' };

/**
 * After a candle is snuffed or burns out: what the flame, smoke and wax did,
 * and what folk candle-readers have made of such signs. Kept with that burn.
 */
export function FlameReadingSheet({
  visible,
  candle,
  spent,
  remnant,
  canJournal,
  onClose,
  onSave,
  onRemnant,
}: {
  visible: boolean;
  candle: string;
  spent: boolean;
  remnant: RemnantChoice | null;
  canJournal: boolean;
  onClose: () => void;
  onSave: (input: ReadingInput, journal: boolean) => void;
  onRemnant: (choice: RemnantChoice) => void;
}) {
  const [input, setInput] = useState<ReadingInput>(EMPTY);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a fresh reading each time it opens
    if (visible) setInput(EMPTY);
  }, [visible]);
  const toggle = (key: 'smoke' | 'wax', id: string) =>
    setInput((v) => {
      let list = v[key].includes(id) ? v[key].filter((x) => x !== id) : [...v[key], id];
      // Smoke is either barely there or it has a colour and a direction.
      if (key === 'smoke') list = id === 'none' ? (list.includes('none') ? ['none'] : list) : list.filter((x) => x !== 'none');
      if (key === 'smoke' && id === 'toward' && list.includes('away')) list = list.filter((x) => x !== 'away');
      if (key === 'smoke' && id === 'away' && list.includes('toward')) list = list.filter((x) => x !== 'toward');
      return { ...v, [key]: list };
    });
  const any = !!input.flame || input.smoke.length > 0 || input.wax.length > 0;
  const summary = readingSummary(input);
  const lines = readingLines(input);

  const group = (title: string, signs: Sign[], picked: (id: string) => boolean, pick: (id: string) => void) => (
    <View style={styles.group}>
      <Text style={type.eyebrow}>{title}</Text>
      <ChipRow>
        {signs.map((s) => (
          <Chip key={s.id} label={s.label} active={picked(s.id)} onPress={() => pick(s.id)} />
        ))}
      </ChipRow>
    </View>
  );

  return (
    <Sheet visible={visible} eyebrow={candle} title="How did it burn?" onClose={onClose}>
      <Text style={type.caption}>
        Candle reading is an old folk practice: a way to reflect on a working, not a prophecy. Drafts, wicks and wax explain a lot, and your own sense of it matters most.
      </Text>
      {group('The flame', FLAME_SIGNS, (id) => input.flame === id, (id) => setInput((v) => ({ ...v, flame: v.flame === id ? '' : id })))}
      {group('The smoke', SMOKE_SIGNS, (id) => input.smoke.includes(id), (id) => toggle('smoke', id))}
      {group('The wax', WAX_SIGNS, (id) => input.wax.includes(id), (id) => toggle('wax', id))}

      {any && (
        <View style={styles.reading} accessibilityLiveRegion="polite">
          <Text style={type.eyebrow}>What readers would say</Text>
          {!!summary && <Text style={styles.summary}>{summary}</Text>}
          {lines.map((line) => (
            <Text key={line} style={type.body}>
              {line}
            </Text>
          ))}
        </View>
      )}

      <TextInput
        value={input.notes}
        onChangeText={(notes) => setInput((v) => ({ ...v, notes }))}
        placeholder="What you noticed, or felt (optional)"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="Your notes on the burn"
        multiline
        style={[styles.input, styles.multiline]}
      />
      <View style={styles.buttons}>
        <Button label="Keep this reading" onPress={() => onSave(input, false)} disabled={!any && !input.notes.trim()} />
        {canJournal && (
          <Button label="Save to my journal" variant="outline" onPress={() => onSave(input, true)} disabled={!any && !input.notes.trim()} />
        )}
      </View>

      {spent && (
        <View style={styles.group}>
          <Text style={type.eyebrow}>What’s left of it</Text>
          <Text style={type.caption}>A burned-down candle can leave a little wax behind. What will you do with it?</Text>
          <ChipRow>
            {REMNANT_CHOICES.map((c) => (
              <Chip key={c.id} label={c.label} accessibilityLabel={`${c.label}: ${c.detail}`} active={remnant === c.id} onPress={() => onRemnant(c.id)} />
            ))}
          </ChipRow>
        </View>
      )}
    </Sheet>
  );
}

// ── What's in the bowl ───────────────────────────────────────────────────

/** Set an offering out in a bowl, dish or chalice (or say what a sprig is). */
export function OfferingSheet({
  visible,
  name,
  current,
  onClose,
  onChoose,
}: {
  visible: boolean;
  name: string;
  current: OfferingKindId | null;
  onClose: () => void;
  onChoose: (kind: OfferingKindId, label: string) => void;
}) {
  const [kind, setKind] = useState<OfferingKindId | null>(current);
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start from what it holds each time it opens
    setKind(current);
    setLabel('');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when it opens
  }, [visible]);
  return (
    <Sheet visible={visible} eyebrow={name} title="Set out an offering" onClose={onClose} size="half">
      <Text style={type.caption}>Water and drink last a day or two, bread a few days, fruit a little longer, cut flowers about a week, whole apples and gourds a couple of weeks. Food and flowers are drawn in the bowl, and go over there. Stones, coins and dried herbs keep.</Text>
      <ChipRow>
        {OFFERING_KINDS.map((k) => (
          <Chip key={k.id} label={k.label} active={kind === k.id} onPress={() => setKind(k.id)} />
        ))}
      </ChipRow>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="What exactly (optional): red wine, an apple, honey in the comb"
        placeholderTextColor={colors.tabInactive}
        accessibilityLabel="What the offering is"
        maxLength={60}
        style={styles.input}
      />
      <Button label="Set it out" onPress={() => kind && onChoose(kind, label)} disabled={!kind} />
    </Sheet>
  );
}

// ── Incense ──────────────────────────────────────────────────────────────

/** What kind of incense this is and how long it burns, before it's lit. */
export function IncenseSheet({
  visible,
  name,
  form,
  burnMs,
  onClose,
  onForm,
  onLength,
}: {
  visible: boolean;
  name: string;
  form: IncenseForm;
  burnMs: number;
  onClose: () => void;
  onForm: (form: IncenseForm) => void;
  onLength: (ms: number) => void;
}) {
  const info = incenseFormInfo(form);
  return (
    <Sheet visible={visible} eyebrow={name} title="The incense" onClose={onClose} size="half">
      <Text style={type.caption}>A stick usually burns half an hour or more, a cone about twenty minutes, and resin on charcoal close to an hour. Once lit, it goes out on its own and leaves ash.</Text>
      <Text style={type.eyebrow}>What it is</Text>
      <ChipRow>
        {INCENSE_FORMS.map((f) => (
          <Chip key={f.id} label={f.label} active={f.id === form} onPress={() => onForm(f.id)} />
        ))}
      </ChipRow>
      <Text style={type.eyebrow}>How long it burns</Text>
      <ChipRow>
        {info.lengths.map((ms) => (
          <Chip key={ms} label={lifeDuration(ms)} active={ms === burnMs} onPress={() => onLength(ms)} />
        ))}
      </ChipRow>
    </Sheet>
  );
}

// ── The altar's options ──────────────────────────────────────────────────

export function AltarOptionsSheet({
  visible,
  options,
  placeKnown,
  saved,
  onClose,
  onChange,
}: {
  visible: boolean;
  options: AltarOptions;
  placeKnown: boolean;
  saved: boolean;
  onClose: () => void;
  onChange: (change: Partial<AltarOptions>) => void;
}) {
  return (
    <Sheet visible={visible} eyebrow="This altar" title="Sky and season" onClose={onClose} size="half">
      <View>
        <SwitchRow
          label="The real sky"
          detail={
            placeKnown
              ? 'The light follows your sunrise, sunset and dusk, with a faint touch of the season.'
              : 'The light follows the time of day and the season. Add your place in Settings for your real sunrise and sunset.'
          }
          value={options.sky}
          onChange={(sky) => onChange({ sky })}
        />
        <SwitchRow label="Tonight’s moon" detail="A small window showing the moon’s real phase." value={options.moonWindow} onChange={(moonWindow) => onChange({ moonWindow })} />
        <SwitchRow
          label="Charge under the New Moon too"
          detail="Crystals and moon water sitting here through a Full Moon are charged under it. Turn this on to count New Moons as well."
          value={options.newMoonCharging}
          onChange={(newMoonCharging) => onChange({ newMoonCharging })}
          last
        />
      </View>
      {!saved && <Text style={type.caption}>Save this altar to keep these choices with it.</Text>}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  reading: { gap: 8, padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.goldLine, backgroundColor: colors.ground },
  summary: { fontFamily: fonts.displayItalic, fontSize: 18, lineHeight: 24, color: colors.parchment },
  buttons: { gap: 10 },
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
    paddingVertical: 10,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top' },
});
