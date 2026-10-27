import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../components/covens/CovenScreen';
import { StepEditor } from '../../../../../../components/covens/StepEditor';
import { Card, Chips, Field, Notice, Section } from '../../../../../../components/more/ui';
import { itemIndex, itemSuggestions } from '../../../../../../lib/altar/itemIndex';
import { useAltars } from '../../../../../../lib/altar/store';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, OCCASIONS, orderSteps, type Petition } from '../../../../../../lib/covens/model';
import { whoEntries, whoSuggestions } from '../../../../../../lib/covens/picker';
import {
  blankStep,
  draftFromStep,
  fromFields,
  occasionSuggestions,
  plannerProblem,
  stepsFromTemplate,
  stepsPayload,
  suggestionTime,
  toFields,
  unassignablePart,
  type Candidate,
  type DraftStep,
} from '../../../../../../lib/covens/planner';
import { covenHolidaysBetween } from '../../../../../../lib/covens/programs';
import { useRituals } from '../../../../../../lib/rituals/store';
import { colors, radius, type } from '../../../../../../theme';

const NO_OCCASION = { value: '', label: 'None' } as const;

// Plan a coven ritual, or change one, as on the website: its name, intention
// and what to bring, its occasion and time (with the coming moons and the
// coven's holidays to choose from), whether it's on the coven's calendar or a
// draft, and its steps (components/covens/StepEditor.tsx): each one's action,
// name, directions and words, who does it (any mix of the whole coven,
// positions and people), its items, what it does at the altar, and anything
// it asks of people.
// For those who lead the coven's rituals; putting rites on the calendar is for
// those the coven's head allows.
export default function PlanRitual() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const coven = useCoven();
  const ritual = id ? coven.rituals.find((r) => r.id === id) ?? null : null;
  const covenId = coven.snapshot?.coven.id;
  const ranks = useMemo(() => [...(coven.snapshot?.ranks ?? [])].sort((a, b) => b.level - a.level), [coven.snapshot?.ranks]);
  const canLead = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  const canSchedule = coven.perms.schedule || coven.perms.site;
  const keepsSchedule = ritual?.status === 'scheduled';
  const { templates } = useRituals();

  const [title, setTitle] = useState(ritual?.title ?? '');
  const [intention, setIntention] = useState(ritual?.intention ?? '');
  const [description, setDescription] = useState(ritual?.description ?? '');
  const [occasion, setOccasion] = useState<string>(ritual?.occasion ?? '');
  const [occasionName, setOccasionName] = useState(ritual?.occasion_name ?? '');
  const [date, setDate] = useState(toFields(ritual?.scheduled_for).date);
  const [time, setTime] = useState(toFields(ritual?.scheduled_for).time);
  const [status, setStatus] = useState<'scheduled' | 'draft'>(ritual ? (ritual.status === 'draft' || !(canSchedule || keepsSchedule) ? 'draft' : 'scheduled') : canSchedule ? 'scheduled' : 'draft');
  const [steps, setSteps] = useState<DraftStep[]>(() => (ritual ? orderSteps(coven.steps, ritual.id).map(draftFromStep) : [blankStep()]));
  const [people, setPeople] = useState<Candidate[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copyFrom, setCopyFrom] = useState(false);
  // Each step's own key, so moving one keeps what's typed in its fields with it.
  const [keys, setKeys] = useState<number[]>(() => steps.map((_, i) => i));
  const [counter, setCounter] = useState(1000);
  const nextKey = () => {
    setCounter((c) => c + 1);
    return counter;
  };
  const altars = useAltars();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  useEffect(() => {
    if (covenId) api.fetchPetitions(covenId).then(setPetitions).catch(() => setPetitions([]));
  }, [covenId]);
  // Everything the altar knows (your own things that are kept online, too) and the coven's open petitions.
  const itemList = useMemo(
    () =>
      itemIndex({
        own: altars.customItems.filter((item) => item.forms.some((f) => /^https:/.test(f.image))),
        overrides: altars.overrides,
        petitions: petitions.filter((p) => p.status === 'open'),
      }),
    [altars.customItems, altars.overrides, petitions],
  );
  const suggestItems = useCallback((queries?: string[]) => itemSuggestions(itemList, queries), [itemList]);

  useEffect(() => {
    if (!covenId) return;
    api
      .ritualPeople(covenId)
      .then(async (list) => {
        await coven.loadNames(list.map((p) => p.user_id));
        setPeople(list.map((p) => ({ id: p.user_id, name: '', eligible: !!p.eligible })));
      })
      .catch(() => setPeople([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per coven
  }, [covenId]);

  const named = useMemo(() => (people ?? []).map((p) => ({ ...p, name: coven.nameOf(p.id) })).sort((a, b) => a.name.localeCompare(b.name)), [people, coven]);
  const whoList = useMemo(() => whoEntries(ranks, named), [ranks, named]);
  const whoSuggest = useMemo(() => whoSuggestions(whoList), [whoList]);
  const suggestions = useMemo(() => {
    const from = new Date();
    const covenDays = covenHolidaysBetween(coven.snapshot?.coven ?? null, from, new Date(from.getTime() + 200 * 86400000));
    return occasionSuggestions(from, 6, covenDays);
  }, [coven.snapshot?.coven]);

  if (!canLead) {
    return (
      <CovenScreen title="Plan a ritual">
        <Text style={type.body}>Only those who lead the coven’s rituals plan them. The coven’s head decides who does.</Text>
      </CovenScreen>
    );
  }
  if (ritual?.status === 'live') {
    return (
      <CovenScreen title="Edit the ritual">
        <Text style={type.body}>This ritual is under way. End it before changing it.</Text>
      </CovenScreen>
    );
  }

  const change = (index: number, patch: Partial<DraftStep>) => setSteps((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const swap = <T,>(list: T[], index: number, by: number) => {
    const next = [...list];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    return next;
  };
  const move = (index: number, by: number) => {
    setSteps((list) => swap(list, index, by));
    setKeys((list) => swap(list, index, by));
  };

  const save = async () => {
    if (!covenId) return;
    const when = fromFields(date, time);
    if (when instanceof Error) return setMessage(when.message);
    const problem = plannerProblem(title, steps, named, coven.nameOf);
    if (problem) return setMessage(problem);
    setBusy(true);
    setMessage(null);
    try {
      const saved = await api.saveRitual(
        covenId,
        ritual?.id ?? null,
        { title: title.trim(), intention: intention.trim(), description: description.trim(), scheduled_for: when, status, occasion, occasion_name: occasionName.trim() },
        stepsPayload(steps),
      );
      await coven.refreshRituals();
      router.replace(covenHref(coven.slug, `ritual/${saved.id}`));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };


  return (
    <CovenScreen title={ritual ? 'Edit the ritual' : 'Plan a ritual'}>
      <Card>
        <Field label="Ritual" value={title} onChangeText={setTitle} maxLength={120} placeholder="Full moon rite" />
        <Field label="Intention (optional)" value={intention} onChangeText={setIntention} maxLength={500} />
        <Field label="What members should know or bring (optional)" value={description} onChangeText={setDescription} multiline maxLength={4000} />
        <Chips label="Occasion" options={[NO_OCCASION, ...OCCASIONS]} value={occasion} onChange={setOccasion} />
        <Field label="Its name (optional)" value={occasionName} onChangeText={setOccasionName} maxLength={80} placeholder="Samhain, Hunter’s Moon…" />
        {suggestions.length > 0 && (
          <Section label="Coming moons and holidays">
            <View style={styles.wrap}>
              {suggestions.map((sg) => (
                <Pressable
                  key={`${sg.label}-${sg.date.toISOString()}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${sg.label}, ${sg.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`}
                  onPress={() => {
                    setOccasion(sg.occasion);
                    setOccasionName(sg.name);
                    const at = toFields(suggestionTime(sg).toISOString());
                    setDate(at.date);
                    setTime(at.time);
                    if (!title.trim()) setTitle(sg.occasion === 'sabbat' ? `${sg.name} rite` : `${sg.label} esbat`);
                  }}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                >
                  <Text style={styles.chipText}>
                    {sg.label} · {sg.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Section>
        )}
        <View style={styles.row}>
          <View style={styles.grow}>
            <Field label="Date" value={date} onChangeText={setDate} placeholder="2026-10-31" autoCorrect={false} />
          </View>
          <View style={styles.grow}>
            <Field label="Time (your time)" value={time} onChangeText={setTime} placeholder="19:30" autoCorrect={false} />
          </View>
        </View>
        <Chips
          label="Show it"
          options={canSchedule || keepsSchedule ? ([{ value: 'scheduled', label: 'On the coven’s calendar' }, { value: 'draft', label: 'Only to ritual leaders (draft)' }] as const) : ([{ value: 'draft', label: 'Only to ritual leaders (draft)' }] as const)}
          value={status}
          onChange={setStatus}
        />
        {!canSchedule && (
          <Text style={type.caption}>
            {keepsSchedule ? 'You can change this rite, but only those the coven’s head allows can move it on the calendar.' : 'Only those the coven’s head allows can put rites on the calendar. Save it as a draft and they can schedule it.'}
          </Text>
        )}
        {templates.length > 0 &&
          (copyFrom ? (
            <Section label="Copy the steps of one of your rituals">
              {templates.slice(0, 12).map((t) => (
                <Button
                  key={t.id}
                  label={t.title}
                  variant="outline"
                  onPress={() => {
                    const added = stepsFromTemplate(t.ritual_template_steps ?? []);
                    const kept = steps.filter((s) => s.title.trim());
                    setSteps([...kept, ...added]);
                    setKeys([...keys.filter((_, j) => steps[j]?.title.trim()), ...added.map((_, j) => counter + j)]);
                    setCounter((c) => c + added.length);
                    if (!title.trim()) setTitle(t.title);
                    if (!intention.trim() && t.intention) setIntention(t.intention);
                    setCopyFrom(false);
                    setMessage(`${added.length} ${added.length === 1 ? 'step' : 'steps'} copied. Choose whose each one is.`);
                  }}
                />
              ))}
            </Section>
          ) : (
            <Button label="Copy steps from one of your rituals" variant="text" onPress={() => setCopyFrom(true)} />
          ))}
      </Card>

      {!people && <ActivityIndicator color={colors.gold} />}
      {steps.map((s, i) => (
        <StepEditor
          key={keys[i]}
          index={i}
          count={steps.length}
          step={s}
          onChange={(patch) => change(i, patch)}
          onMove={(by) => move(i, by)}
          onRemove={() => {
            setSteps((list) => list.filter((_, j) => j !== i));
            setKeys((list) => list.filter((_, j) => j !== i));
          }}
          who={whoList}
          whoSuggest={whoSuggest}
          items={itemList}
          itemSuggest={suggestItems}
          ranks={ranks}
          nameOf={coven.nameOf}
          blocked={unassignablePart(s, named, coven.nameOf)}
        />
      ))}
      <Button
        label="Add a step"
        variant="outline"
        onPress={() => {
          setSteps((list) => [...list, blankStep()]);
          setKeys((list) => [...list, nextKey()]);
        }}
      />
      {message && <Notice>{message}</Notice>}
      <Button label={busy ? 'Saving…' : ritual ? 'Save the ritual' : 'Plan the ritual'} onPress={() => void save()} disabled={busy} />
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.hairline },
  chipText: { ...type.caption, color: colors.cream },
  pressed: { opacity: 0.7 },
});
