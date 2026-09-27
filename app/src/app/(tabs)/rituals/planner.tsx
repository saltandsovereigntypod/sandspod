import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { MoonDisc } from '../../../components/MoonDisc';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, tell, ui } from '../../../components/rituals/ui';
import { dayRuler, dayRulerLabel, fullDate } from '../../../lib/calendar';
import { moonState } from '../../../lib/moon';
import { clockTime, dayLabel } from '../../../lib/rituals/format';
import { clearDraft, peekDraft } from '../../../lib/rituals/handoff';
import { dateFromKey, localDateKey, uuid } from '../../../lib/rituals/lifecycle';
import { EVENING_HOUR, INTENTIONS, intentionByKey, nightFits, suggestIngredients, suggestNights, type NightSuggestion } from '../../../lib/rituals/planner';
import { toIngredient } from '../../../lib/rituals/spell';
import { planStart } from '../../../lib/rituals/plans';
import { useRituals } from '../../../lib/rituals/store';
import { calendarMode, savePlanWithCalendar, useCalendar } from '../../../lib/reminders/calendarStore';
import { askForRitualReminders } from '../../../lib/reminders/store';
import type { Ingredient, RitualPlan } from '../../../lib/rituals/types';
import { colors, fonts, radius, touch, type } from '../../../theme';

const TIMES = ['07:00', '12:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:30'];

type Attach = { kind: 'template'; id: string } | { kind: 'draft' } | { kind: 'none' };

export default function Planner() {
  const params = useLocalSearchParams<{ intention?: string; date?: string; templateId?: string; fromSpell?: string; planId?: string }>();
  const rituals = useRituals();
  const calendar = useCalendar();
  const editing = params.planId ? rituals.plans.find((p) => p.id === params.planId) ?? null : null;
  const draft = editing?.draft ?? (params.fromSpell ? peekDraft() : null);
  const now = useMemo(() => new Date(), []);

  const [intentionKey, setIntentionKey] = useState<string | null>(params.intention ?? null);
  const fixedDay = dateFromKey(params.date);
  const [night, setNight] = useState<Date | null>(
    fixedDay ? new Date(fixedDay.getFullYear(), fixedDay.getMonth(), fixedDay.getDate(), EVENING_HOUR) : null,
  );
  const [time, setTime] = useState('21:00');
  const [attach, setAttach] = useState<Attach>(
    draft ? { kind: 'draft' } : params.templateId ? { kind: 'template', id: params.templateId } : { kind: 'none' },
  );
  const [picked, setPicked] = useState<Ingredient[]>(draft?.ingredients ?? []);
  const [name, setName] = useState('');
  const [toCalendar, setToCalendar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Changing a plan: start from what it already says.
  const filled = useRef(false);
  useEffect(() => {
    if (!editing || filled.current) return;
    filled.current = true;
    const start = planStart(editing);
    setIntentionKey(editing.intentionKey);
    if (start) setNight(new Date(start.getFullYear(), start.getMonth(), start.getDate(), EVENING_HOUR));
    setTime(editing.time);
    setAttach(editing.templateId ? { kind: 'template', id: editing.templateId } : editing.draft ? { kind: 'draft' } : { kind: 'none' });
    setPicked(editing.ingredients);
    setName(editing.title);
    setToCalendar(!!editing.addToCalendar);
  }, [editing]);

  const intention = intentionByKey(intentionKey);
  const nights = useMemo(() => (intention ? suggestNights(intention, now) : []), [intention, now]);
  const ingredients = useMemo(() => (intention ? suggestIngredients(intention) : null), [intention]);
  const template = attach.kind === 'template' ? rituals.templates.find((t) => t.id === attach.id) ?? null : null;
  const fits = fixedDay ? nightFits(new Date(fixedDay.getFullYear(), fixedDay.getMonth(), fixedDay.getDate(), EVENING_HOUR)) : [];

  const defaultName =
    (attach.kind === 'draft' && draft?.title) || template?.title || (intention ? `${intention.label} working` : 'A working');

  const toggle = (item: Ingredient) =>
    setPicked((list) => (list.some((i) => i.ref === item.ref) ? list.filter((i) => i.ref !== item.ref) : [...list, item]));

  const save = async () => {
    if (!night) return;
    setSaving(true);
    const plan: RitualPlan = {
      ...(editing ?? {}),
      id: editing?.id ?? uuid(),
      date: localDateKey(night),
      time,
      title: name.trim() || defaultName,
      intention: intention?.label ?? (template?.intention || draft?.intention || null),
      intentionKey: intention?.key ?? null,
      templateId: attach.kind === 'template' ? attach.id : null,
      draft: attach.kind === 'draft' ? draft : null,
      ingredients: picked,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
      addToCalendar: toCalendar,
    };
    const outcome = await savePlanWithCalendar(plan);
    void askForRitualReminders();
    if (attach.kind === 'draft') clearDraft();
    setSaving(false);
    if (outcome === 'denied') tell('Calendar access is off', 'The plan is saved. Allow calendar access in Settings to add it to your calendar.');
    if (outcome === 'failed') tell("Couldn't add it to your calendar", 'The plan is saved. You can try again from the plan.');
    if (editing && router.canGoBack()) router.back();
    else router.replace({ pathname: '/rituals/plan/[id]', params: { id: plan.id } });
  };

  return (
    <RitualScreen back="Rituals">
      <Title eyebrow={editing ? 'Change the plan' : 'Planner'}>Find the night</Title>

      {fixedDay && (
        <Card accent>
          <SectionLabel>{fullDate(fixedDay)}</SectionLabel>
          <View style={styles.nightHead}>
            <MoonDisc size={44} illumination={moonState(night ?? fixedDay).illumination} waxing={moonState(night ?? fixedDay).waxing} halo={false} />
            <View style={styles.flex}>
              <Text style={type.cardTitle}>{moonState(night ?? fixedDay).name}</Text>
              <Body muted>{`${dayRulerLabel(fixedDay)} · ${dayRuler(fixedDay).themes}`}</Body>
            </View>
          </View>
          {fits.length > 0 && (
            <>
              <Body muted>A good night for</Body>
              <Chips>
                {fits.slice(0, 5).map(({ intention: fit }) => (
                  <Chip key={fit.key} label={fit.label} selected={intentionKey === fit.key} onPress={() => setIntentionKey(fit.key)} />
                ))}
              </Chips>
            </>
          )}
        </Card>
      )}

      {(attach.kind === 'draft' && draft) || template ? (
        <Body>{`Planning “${draft && attach.kind === 'draft' ? draft.title : template?.title}”.`}</Body>
      ) : null}

      <View style={ui.gapSmall}>
        <SectionLabel>What is it for?</SectionLabel>
        <Chips>
          {INTENTIONS.map((i) => (
            <Chip key={i.key} label={i.label} selected={intentionKey === i.key} onPress={() => setIntentionKey(intentionKey === i.key ? null : i.key)} />
          ))}
        </Chips>
        {intention && <Body muted>{intention.why}</Body>}
      </View>

      {intention && !fixedDay && (
        <View style={ui.gapSmall}>
          <SectionLabel>Best nights in the next month</SectionLabel>
          {nights.map((n) => (
            <NightRow key={n.date.toISOString()} night={n} now={now} selected={!!night && localDateKey(night) === localDateKey(n.date)} onPress={() => setNight(n.date)} />
          ))}
        </View>
      )}

      {!intention && !fixedDay && <Body muted>Choose an intention to see the nights whose moon and weekday suit it.</Body>}

      {night && (
        <Card>
          <SectionLabel>{`${dayLabel(night, now)} · what time?`}</SectionLabel>
          <Chips>
            {TIMES.map((t) => {
              const [h, m] = t.split(':').map(Number);
              return <Chip key={t} label={clockTime(new Date(2000, 0, 1, h, m))} selected={time === t} onPress={() => setTime(t)} />;
            })}
          </Chips>

          <SectionLabel>Which ritual?</SectionLabel>
          <Chips>
            {draft && <Chip label={draft.title} selected={attach.kind === 'draft'} onPress={() => setAttach({ kind: 'draft' })} />}
            {rituals.templates.map((t) => (
              <Chip key={t.id} label={t.title} selected={attach.kind === 'template' && attach.id === t.id} onPress={() => setAttach({ kind: 'template', id: t.id })} />
            ))}
            <Chip label="Decide later" selected={attach.kind === 'none'} onPress={() => setAttach({ kind: 'none' })} />
          </Chips>
          {!draft && (
            <Button label="Build a spell for this night instead" variant="text" onPress={() => router.push({ pathname: '/rituals/spell', params: intention ? { intention: intention.key } : {} })} />
          )}

          <Field label="Name" value={name} onChange={setName} placeholder={defaultName} />

          <Toggle
            label="Add to my calendar"
            detail={
              calendarMode === 'device'
                ? calendar.calendars.find((c) => c.id === calendar.calendarId)?.title ?? 'Asks for calendar access the first time'
                : calendarMode === 'link'
                  ? 'Opens Google Calendar from the plan'
                  : 'Download it or open Google Calendar from the plan'
            }
            value={toCalendar}
            onChange={setToCalendar}
          />
        </Card>
      )}

      {ingredients && (
        <View style={ui.gapSmall}>
          <SectionLabel>From the Library</SectionLabel>
          <Body muted>Tap to add to what you'll gather.</Body>
          <Chips>
            {[...ingredients.candle, ...ingredients.herb, ...ingredients.crystal].map((item) => (
              <Chip
                key={item.ref}
                label={item.name}
                selected={picked.some((p) => p.ref === item.ref)}
                a11yLabel={`${item.name}: ${item.uses}`}
                onPress={() => toggle(toIngredient(item))}
              />
            ))}
          </Chips>
        </View>
      )}

      {night ? (
        <Button
          label={saving ? 'Saving…' : editing ? 'Save changes' : `Plan it for ${dayLabel(night, now).toLowerCase()}`}
          disabled={saving}
          onPress={save}
        />
      ) : (
        intention && !fixedDay && <Notice>Choose one of the nights above.</Notice>
      )}
    </RitualScreen>
  );
}

function NightRow({ night, now, selected, onPress }: { night: NightSuggestion; now: Date; selected: boolean; onPress: () => void }) {
  const title = dayLabel(night.date, now);
  return (
    <Pressable
      accessibilityRole="radio"
      aria-checked={selected}
      accessibilityLabel={`${title}. ${night.phase}. ${night.reason}${night.best ? '. Best night' : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.night, selected && styles.nightOn, pressed && styles.pressed]}
    >
      <MoonDisc size={32} illumination={night.illumination} waxing={night.tide !== 'waning'} halo={false} />
      <View style={styles.flex}>
        <Text style={styles.nightTitle}>{title}</Text>
        <Text style={type.caption}>{`${night.phase} · ${night.reason.split(' · ')[1] ?? dayRulerLabel(night.date)}`}</Text>
      </View>
      {night.best && <Text style={styles.best}>Best</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  nightHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  night: {
    minHeight: touch + 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  nightOn: { borderColor: colors.gold },
  pressed: { opacity: 0.7 },
  nightTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.cream },
  best: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.forestInk, backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
});
