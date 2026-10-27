import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { searchItems, stepItemOf, type ItemEntry } from '../../lib/altar/itemIndex';
import {
  CONTRIBUTION_FATES,
  CONTRIBUTION_KINDS,
  CONTRIBUTION_MODES,
  CONTRIBUTION_TIMINGS,
  CONTRIBUTION_VISIBILITY,
  contributionNote,
  defaultContribution,
  kindOf,
  type ContributionKind,
  type StepContribution,
} from '../../lib/covens/contributions';
import { assigneeFromKey, assigneeKey, assigneeLabel, assigneesOf, cleanAssignees, legacyColumns, type Assignee, type PickEntry } from '../../lib/covens/picker';
import { ALTAR_ACCESS, deityName, type DraftStep } from '../../lib/covens/planner';
import { ACTION_GROUPS, actionLabel, actionOf, ALTAR_EFFECTS, applyAction, refillDeity, searchActions, type ActionGroup, type StepAction } from '../../lib/covens/stepActions';
import type { Rank } from '../../lib/covens/model';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Button } from '../Button';
import { Card, Chips, Field, Notice } from '../more/ui';
import { SearchPicker, type PickerChip } from './SearchPicker';

// One step in the coven ritual planner (ritual/plan.tsx), as the website's
// (covens/coven/rituals.js stepHtml): its action, short name, directions,
// words, who does it, how long, its items, what it does on the altar, who
// tends the altar meanwhile, and anything it asks of people.
export function StepEditor({
  index,
  count,
  step,
  onChange,
  onMove,
  onRemove,
  who,
  whoSuggest,
  items,
  itemSuggest,
  ranks,
  nameOf,
  blocked,
}: {
  index: number;
  count: number;
  step: DraftStep;
  onChange: (patch: Partial<DraftStep>) => void;
  onMove: (by: number) => void;
  onRemove: () => void;
  who: PickEntry[];
  whoSuggest: string[];
  items: ItemEntry[];
  itemSuggest: (queries?: string[]) => string[];
  ranks: Rank[];
  nameOf: (id: string) => string;
  blocked: string;
}) {
  const n = index + 1;
  const action = actionOf(step.action);
  const [choosing, setChoosing] = useState(!step.title.trim() && !step.action);
  const [group, setGroup] = useState<ActionGroup | ''>(action?.group ?? '');
  const [actionQuery, setActionQuery] = useState('');
  const actions = useMemo(() => (actionQuery.trim() ? searchActions(actionQuery) : group ? searchActions('').filter((a) => a.group === group) : []), [actionQuery, group]);

  const choose = (a: StepAction | null) => {
    setChoosing(false);
    setActionQuery('');
    if (!a) return onChange({ action: '' });
    const filled = applyAction(a, { deity: step.deity });
    onChange(filled);
  };

  const whoChips = (list: Assignee[]): PickerChip[] => cleanAssignees(list).map((a) => ({ key: assigneeKey(a), label: assigneeLabel(a, ranks, nameOf) }));
  const people = assigneesOf(step);
  const setPeople = (list: Assignee[]) => {
    const clean = cleanAssignees(list);
    onChange({ assignees: clean, ...legacyColumns(clean) });
  };
  const addWho = (list: Assignee[], entry: PickEntry) => {
    const a = assigneeFromKey(entry.key);
    if (!a) return list;
    // Choosing someone after "Whole coven" means just them; choosing the whole coven means everyone.
    return a.kind === 'coven' ? [a] : [...list.filter((x) => x.kind !== 'coven'), a];
  };
  const itemChips: PickerChip[] = step.items.map((i) => ({ key: i.key, label: i.name, image: i.image }));
  const deityChips = step.items.filter((i) => i.category === 'deities').map((i) => ({ key: i.key, label: deityName(i.name), image: i.image }));
  const setDeity = (entry: ItemEntry | null) => {
    const next = entry ? deityName(entry.label) : '';
    const rest = step.items.filter((i) => i.category !== 'deities');
    const refilled = action ? refillDeity(step, action, step.deity, next) : step;
    onChange({ deity: next, items: entry ? [stepItemOf(entry), ...rest] : rest, title: refilled.title, instructions: refilled.instructions, spoken_text: refilled.spoken_text });
  };
  const ask = step.contribution;
  const setAsk = (patch: Partial<StepContribution>) => ask && onChange({ contribution: { ...ask, ...patch } });
  const effect = ALTAR_EFFECTS.find((e) => e.value === step.altar_action) ?? ALTAR_EFFECTS[0];
  const writes = ask ? kindOf(ask.kind).verb === 'write' : false;

  return (
    <Card>
      <View style={styles.row}>
        <Text style={[type.eyebrow, styles.grow]}>Step {n}</Text>
        <Button label="↑" variant="text" onPress={() => onMove(-1)} disabled={index === 0} />
        <Button label="↓" variant="text" onPress={() => onMove(1)} disabled={index === count - 1} />
        <Button label="Remove" variant="text" onPress={onRemove} />
      </View>

      <View style={styles.block}>
        <Text style={type.eyebrow}>Action</Text>
        {!choosing ? (
          <View style={styles.row}>
            <Text style={[type.body, styles.grow]}>{action ? actionLabel(action) : step.title.trim() ? 'Your own' : 'None chosen'}</Text>
            <Button label={action ? 'Change' : 'Choose an action'} variant="text" onPress={() => setChoosing(true)} />
          </View>
        ) : (
          <View style={styles.block}>
            <Text style={type.caption}>Choosing one fills in its name, directions and words. You can change any of them after.</Text>
            <TextInput
              value={actionQuery}
              onChangeText={setActionQuery}
              placeholder="Find an action: circle, candle, libation…"
              placeholderTextColor="rgba(202,191,157,0.6)"
              accessibilityLabel={`Find an action for step ${n}`}
              autoCorrect={false}
              style={styles.input}
            />
            {!actionQuery.trim() && (
              <Chips label={`Kinds of action for step ${n}`} options={[...ACTION_GROUPS.map((g) => ({ value: g.id, label: g.label }))]} value={group as ActionGroup} onChange={setGroup} />
            )}
            <View style={styles.wrap}>
              {actions.map((a) => (
                <Pressable key={a.id} accessibilityRole="button" accessibilityLabel={actionLabel(a)} onPress={() => choose(a)} style={({ pressed }) => [styles.option, a.id === step.action && styles.optionOn, pressed && styles.pressed]}>
                  <Text style={styles.optionText}>{actionLabel(a)}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.row}>
              <Button label="Something else (write your own)" variant="text" onPress={() => choose(null)} />
              {(!!step.title.trim() || !!step.action) && <Button label="Cancel" variant="text" onPress={() => setChoosing(false)} />}
            </View>
          </View>
        )}
      </View>

      {action?.deity && (
        <SearchPicker
          label="Which deity"
          chips={deityChips}
          entries={items}
          search={(q, picked) => searchItems(items, q, { limit: 6, picked, categories: ['deities'] })}
          onAdd={(entry) => setDeity(entry as ItemEntry)}
          onRemove={() => setDeity(null)}
          max={1}
          placeholder="Hekate, Brigid, Freyja…"
          empty="No deity chosen yet."
        />
      )}

      <Field label="Step name" hint="A few words, as it shows in the list of steps." value={step.title} onChangeText={(v) => onChange({ title: v })} maxLength={120} placeholder="Cast the circle" />
      <Field
        label="Directions"
        hint="What the person doing it does. They see this when the step comes."
        value={step.instructions}
        onChangeText={(v) => onChange({ instructions: v })}
        multiline
        maxLength={4000}
      />
      <Field label="Words to speak (optional)" hint="Read aloud by whoever does the step." value={step.spoken_text} onChangeText={(v) => onChange({ spoken_text: v })} multiline maxLength={4000} />

      <SearchPicker
        label="Who does it"
        hint="Positions, people, or the whole coven, in any mix."
        chips={whoChips(people)}
        entries={who}
        suggestions={whoSuggest}
        onAdd={(entry) => setPeople(addWho(people, entry))}
        onRemove={(key) => setPeople(people.filter((a) => assigneeKey(a) !== key))}
        placeholder="Initiate, High Priestess, Rowan…"
        empty="The whole coven"
      />
      {!!blocked && <Notice>{blocked}</Notice>}
      <Field
        label="Minutes (optional)"
        value={step.duration_minutes == null ? '' : String(step.duration_minutes)}
        onChangeText={(v) => onChange({ duration_minutes: v.trim() === '' ? null : Math.max(0, Math.min(240, Math.round(Number(v) || 0))) })}
        keyboardType="number-pad"
      />

      <SearchPicker
        label="Items"
        hint="What the step uses, or sets on the altar. Type to find candles, herbs, crystals, offerings, deities and tools, or your own things."
        chips={itemChips}
        entries={items}
        search={(q, picked) => searchItems(items, q, { limit: 8, picked, suggestions: itemSuggest(action?.suggestItems) })}
        onAdd={(entry) => onChange({ items: [...step.items, stepItemOf(entry as ItemEntry)].slice(0, 24) })}
        onRemove={(key) => onChange({ items: step.items.filter((i) => i.key !== key) })}
        placeholder="White candle, rosemary, bread…"
      />

      <Chips label={`On the altar, step ${n}`} options={ALTAR_EFFECTS.map((e) => ({ value: e.value, label: e.label }))} value={step.altar_action} onChange={(v) => onChange({ altar_action: v })} />
      <Text style={type.caption}>{effect.detail}</Text>
      <Chips label={`Who tends the altar during step ${n}`} options={ALTAR_ACCESS} value={step.altar_access} onChange={(v) => onChange({ altar_access: v })} />
      {step.altar_access === 'chosen' && (
        <SearchPicker
          label="Tended by"
          chips={whoChips(step.altar_tenders)}
          entries={who}
          suggestions={whoSuggest}
          onAdd={(entry) => onChange({ altar_tenders: cleanAssignees(addWho(step.altar_tenders, entry)) })}
          onRemove={(key) => onChange({ altar_tenders: step.altar_tenders.filter((a) => assigneeKey(a) !== key) })}
          placeholder="Maiden, Rowan…"
          empty="No one chosen yet."
        />
      )}

      <Chips
        label={`Ask something of people, step ${n}`}
        options={[{ value: '', label: 'Nothing' }, ...CONTRIBUTION_KINDS.map((k) => ({ value: k.id, label: k.label }))]}
        value={(ask?.kind ?? '') as ContributionKind | ''}
        onChange={(v) => onChange({ contribution: v ? defaultContribution(v as ContributionKind, ask ? { mode: ask.mode, timing: ask.timing } : {}) : null })}
      />
      {ask && (
        <View style={styles.block}>
          <Chips label="Asked of" options={CONTRIBUTION_MODES} value={ask.mode} onChange={(v) => setAsk({ mode: v })} />
          <Chips label="When" options={CONTRIBUTION_TIMINGS} value={ask.timing} onChange={(v) => setAsk({ timing: v })} />
          <Text style={type.caption}>{CONTRIBUTION_TIMINGS.find((t) => t.value === ask.timing)?.detail}</Text>
          {writes && (
            <>
              <Chips label="Who can read it" options={CONTRIBUTION_VISIBILITY} value={ask.visibility} onChange={(v) => setAsk({ visibility: v })} />
              <Text style={type.caption}>{CONTRIBUTION_VISIBILITY.find((t) => t.value === ask.visibility)?.detail} Anyone can also mark their own private.</Text>
              <Chips
                label="What becomes of it"
                options={CONTRIBUTION_FATES.filter((f) => f.value !== 'petition' || ask.kind === 'petition')}
                value={ask.fate}
                onChange={(v) => setAsk({ fate: v })}
              />
              <Text style={type.caption}>{CONTRIBUTION_FATES.find((f) => f.value === ask.fate)?.detail}</Text>
            </>
          )}
          <Field label="A line for them (optional)" value={ask.prompt ?? ''} onChangeText={(v) => setAsk({ prompt: v })} maxLength={280} placeholder="What are you grateful for?" />
          <Text style={type.caption}>They will see: {contributionNote(ask)}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  block: { gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { minHeight: touch, justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.hairline },
  optionOn: { borderColor: colors.gold },
  optionText: { fontFamily: fonts.body, fontSize: 14, color: colors.cream },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.22)',
    backgroundColor: colors.night,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  pressed: { opacity: 0.7 },
});
