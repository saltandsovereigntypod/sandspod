import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../components/covens/CovenScreen';
import { Card, Chips, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { CANDLE_COLORS, CANDLE_FORMS, errorMessage, OCCASIONS, orderSteps } from '../../../../../../lib/covens/model';
import {
  ALTAR_ACTIONS,
  blankStep,
  draftFromStep,
  fromFields,
  occasionSuggestions,
  plannerProblem,
  searchPlaceable,
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
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Plan a coven ritual, or change one, as on the website: its name, intention
// and what to bring, its occasion and time (with the coming moons and the
// coven's holidays to choose from), whether it's on the coven's calendar or a
// draft, and its steps: what happens, whose step it is (the whole coven, a
// position, or one person), the words, and what the step does at the altar.
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
  const move = (index: number, by: number) =>
    setSteps((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });

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

  const whoOptions = [
    { value: '', label: 'The whole coven' },
    ...ranks.map((r) => ({ value: `rank:${r.id}`, label: `Every ${r.name}` })),
    ...named.filter((p) => p.eligible).map((p) => ({ value: `user:${p.id}`, label: p.name })),
  ];
  const whoValue = (s: DraftStep) => (s.assigned_user_id ? `user:${s.assigned_user_id}` : s.assigned_rank_id ? `rank:${s.assigned_rank_id}` : '');

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
                    setSteps((list) => [...list.filter((s) => s.title.trim()), ...added]);
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
      {steps.map((s, i) => {
        const blocked = unassignablePart(s, named, coven.nameOf);
        const found = s.altar_action === 'place_item' ? searchPlaceable(s.altar_label && !s.altar_image ? s.altar_label : '') : [];
        return (
          <Card key={i}>
            <View style={styles.row}>
              <Text style={[type.eyebrow, styles.grow]}>Step {i + 1}</Text>
              <Button label="↑" variant="text" onPress={() => move(i, -1)} disabled={i === 0} />
              <Button label="↓" variant="text" onPress={() => move(i, 1)} disabled={i === steps.length - 1} />
              <Button label="Remove" variant="text" onPress={() => setSteps((list) => list.filter((_, j) => j !== i))} />
            </View>
            <Field label="What happens" value={s.title} onChangeText={(v) => change(i, { title: v })} maxLength={120} placeholder="Cast the circle" />
            <Chips
              label={`Whose step ${i + 1} is`}
              options={blocked ? [...whoOptions, { value: whoValue(s), label: `${coven.nameOf(s.assigned_user_id)} (can’t take a part)` }] : whoOptions}
              value={whoValue(s)}
              onChange={(v) => {
                const [kind, value] = v.split(':');
                change(i, { assigned_user_id: kind === 'user' ? value : null, assigned_rank_id: kind === 'rank' ? value : null });
              }}
            />
            {!!blocked && <Notice>{blocked}</Notice>}
            <Field
              label="Minutes (optional)"
              value={s.duration_minutes == null ? '' : String(s.duration_minutes)}
              onChangeText={(v) => change(i, { duration_minutes: v.trim() === '' ? null : Math.max(0, Math.min(240, Math.round(Number(v) || 0))) })}
              keyboardType="number-pad"
            />
            <Field label="Instructions (shown to them when the step comes)" value={s.instructions} onChangeText={(v) => change(i, { instructions: v })} multiline maxLength={4000} />
            <Field label="Words to speak (optional)" value={s.spoken_text} onChangeText={(v) => change(i, { spoken_text: v })} multiline maxLength={4000} />
            <Chips label={`At the altar, step ${i + 1}`} options={ALTAR_ACTIONS} value={s.altar_action} onChange={(v) => change(i, { altar_action: v })} />
            {s.altar_action === 'light_candle' && (
              <>
                <Chips label="Candle colour" options={CANDLE_COLORS.map((c) => ({ value: c, label: cap(c) }))} value={s.altar_color as (typeof CANDLE_COLORS)[number]} onChange={(v) => change(i, { altar_color: v })} />
                <Chips label="Candle" options={CANDLE_FORMS.map((f) => ({ value: f.id, label: f.label }))} value={s.altar_form as (typeof CANDLE_FORMS)[number]['id']} onChange={(v) => change(i, { altar_form: v })} />
                <Text style={type.caption}>
                  {s.assigned_user_id || s.assigned_rank_id ? 'Whoever this step belongs to lights it when the step comes.' : 'Each member lights their own when the step comes, and the candles gather in a circle.'}
                </Text>
              </>
            )}
            {s.altar_action === 'place_item' && (
              <>
                {s.altar_image ? (
                  <View style={styles.row}>
                    <Text style={[type.body, styles.grow]}>Places: {s.altar_label || 'an offering'}</Text>
                    <Button label="Choose another" variant="text" onPress={() => change(i, { altar_image: '', altar_label: '' })} />
                  </View>
                ) : (
                  <>
                    <Field label="What is placed" value={s.altar_label} onChangeText={(v) => change(i, { altar_label: v })} placeholder="Search: apple, rose, salt, bowl…" />
                    <View style={styles.wrap}>
                      {found.map((p) => (
                        <Pressable
                          key={p.image}
                          accessibilityRole="button"
                          accessibilityLabel={`Place ${p.name}`}
                          onPress={() => change(i, { altar_image: p.image, altar_label: p.name })}
                          style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                        >
                          <Text style={styles.chipText}>{p.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </Card>
        );
      })}
      <Button label="Add a step" variant="outline" onPress={() => setSteps((list) => [...list, blankStep()])} />
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
