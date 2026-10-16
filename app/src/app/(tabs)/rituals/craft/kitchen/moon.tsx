import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Card, Chip, Chips, Expander, List, RitualScreen, Row, SectionLabel, Title, tell, ui } from '../../../../../components/rituals/ui';
import { homeTide, lunationKey, nextTurn, TIDE_GUIDES, TIDE_ORDER, tasksFor, toggleTick, type TaskTicks } from '../../../../../lib/craft/kitchen/moonhome';
import { addEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { moonState } from '../../../../../lib/moon';
import { filterPremade, PREMADE } from '../../../../../lib/rituals/premade';
import { colors, fonts, touch, type } from '../../../../../theme';

const COLLECTION = 'kitchen.tasks';
const TIDE_INTENTION = { waxing: 'prosperity', full: 'protection', waning: 'cleansing', dark: 'peace' } as const;

const dayWords = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

export default function HomeByTheMoon() {
  const now = useMemo(() => new Date(), []);
  const moon = useMemo(() => moonState(now), [now]);
  const tide = useMemo(() => homeTide(now), [now]);
  const lunation = useMemo(() => lunationKey(now), [now]);
  const turn = useMemo(() => nextTurn(now), [now]);
  const guide = TIDE_GUIDES[tide];
  const tasks = useMemo(() => tasksFor(tide, lunation), [tide, lunation]);
  const { entries, ready } = useCraft<TaskTicks>(COLLECTION);
  const entry = entries.find((e) => e.data?.lunation === lunation && e.data?.tide === tide);
  const done = entry?.data.done ?? [];
  const [saving, setSaving] = useState(false);
  const workings = useMemo(() => filterPremade(PREMADE, { practice: 'kitchen', intention: TIDE_INTENTION[tide] }).slice(0, 3), [tide]);

  const toggle = async (id: string) => {
    if (saving) return;
    setSaving(true);
    try {
      const next = toggleTick(done, id);
      if (entry) await updateEntry<TaskTicks>(COLLECTION, entry.id, { ...entry.data, done: next });
      else await addEntry<TaskTicks>(COLLECTION, { lunation, tide, done: next });
    } catch {
      tell("Couldn't save", 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const kept = tasks.filter((t) => done.includes(t.id)).length;

  return (
    <RitualScreen back="Kitchen & hearth">
      <Title eyebrow={`${moon.name} · ${Math.round(moon.illumination * 100)}% lit`}>Home by the moon</Title>
      <Card accent>
        <SectionLabel>{guide.label}</SectionLabel>
        <Body>{guide.summary}</Body>
        <Chips>
          {guide.suits.map((s) => (
            <Chip key={s} label={s} />
          ))}
        </Chips>
        <Body muted>{`Next: ${turn.phase === 'full' ? 'full moon' : 'new moon'} on ${dayWords(turn.date)}.`}</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>{`For this ${guide.label.toLowerCase()} · ${kept} of ${tasks.length} done`}</SectionLabel>
        <View style={styles.list}>
          {tasks.map((task, i) => {
            const on = done.includes(task.id);
            return (
              <Pressable
                key={task.id}
                accessibilityRole="checkbox"
                aria-checked={on}
                accessibilityLabel={`${task.title}. ${task.detail}`}
                disabled={!ready}
                onPress={() => toggle(task.id)}
                style={({ pressed }) => [styles.task, i < tasks.length - 1 && styles.rule, pressed && styles.pressed]}
              >
                <View style={[styles.box, on && styles.boxOn]}>{on && <Text style={styles.tick}>✓</Text>}</View>
                <View style={styles.text}>
                  <Text style={[styles.title, on && styles.titleDone]}>{task.title}</Text>
                  <Text style={type.caption}>{task.detail}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Body muted>A new list comes with each part of the moon’s month. Do what suits you; none of it is required.</Body>
      </View>

      {workings.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Workings that suit tonight</SectionLabel>
          <List>
            {workings.map((p, i, all) => (
              <Row
                key={p.id}
                icon="wheel"
                title={p.title}
                detail={`${p.kind === 'spell' ? 'Spell' : 'Ritual'} · ${p.minutes} min`}
                last={i === all.length - 1}
                onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: p.id } })}
              />
            ))}
          </List>
        </View>
      )}

      <Expander title="Through the month">
        {TIDE_ORDER.map((t) => (
          <View key={t} style={ui.gapSmall}>
            <Text style={type.cardTitle}>{`${TIDE_GUIDES[t].label}${t === tide ? ' · now' : ''}`}</Text>
            <Body>{TIDE_GUIDES[t].summary}</Body>
          </View>
        ))}
        <Body muted>
          Drawing in on the growing moon and clearing out on the waning one is a widely kept modern rhythm, built on older farming and household
          lore about the moon’s pull.
        </Body>
      </Expander>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  task: { minHeight: touch + 20, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  box: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.goldDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tick: { color: colors.forestInk, fontFamily: fonts.bodySemi, fontSize: 16 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
  titleDone: { color: colors.muted },
});
