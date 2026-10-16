import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Chip, Chips, Expander, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { careBadges, findCare } from '../../../../../lib/craft/crystal/care';
import { SETTINGS, STONES } from '../../../../../lib/craft/crystal/collections';
import {
  cleanseStatus,
  daysAgo,
  normaliseRule,
  normaliseStone,
  sortStones,
  STONE_FORMS,
  type CleanseRule,
  type CrystalSettings,
  type Stone,
} from '../../../../../lib/craft/crystal/stones';
import { addEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { colors, fonts, radius, type } from '../../../../../theme';

const RULES: { label: string; rule: CleanseRule }[] = [
  { label: 'Every week', rule: { kind: 'days', days: 7 } },
  { label: 'Every 2 weeks', rule: { kind: 'days', days: 14 } },
  { label: 'Every 30 days', rule: { kind: 'days', days: 30 } },
  { label: 'Every 3 months', rule: { kind: 'days', days: 90 } },
  { label: 'After each full moon', rule: { kind: 'fullMoon' } },
];

const sameRule = (a: CleanseRule, b: CleanseRule) => a.kind === b.kind && (a.kind === 'fullMoon' || (b.kind === 'days' && a.days === b.days));

// My stones: the collection, those due for cleansing first.
export default function MyStones() {
  const { entries, ready } = useCraft<Stone>(STONES);
  const { entries: settings } = useCraft<CrystalSettings>(SETTINGS);
  const rule = useMemo(() => normaliseRule(settings[0]?.data?.cleanse), [settings]);
  const now = useMemo(() => new Date(), []);
  const stones = useMemo(
    () => sortStones(entries.map((e) => ({ id: e.id, data: normaliseStone(e.data) })), rule, now),
    [entries, rule, now],
  );
  const due = stones.filter((s) => cleanseStatus(s.data, rule, now).due).length;

  const chooseRule = async (next: CleanseRule) => {
    const data: CrystalSettings = { cleanse: next };
    if (settings[0]) await updateEntry(SETTINGS, settings[0].id, data);
    else await addEntry(SETTINGS, data);
  };

  return (
    <RitualScreen back="Crystal">
      <Title eyebrow="Crystal">My stones</Title>
      <Button label="Add a stone" onPress={() => router.push('/rituals/craft/crystal/stone-edit' as Href)} />

      {ready && stones.length === 0 && (
        <Body muted>
          Your collection lives here: each stone, where it came from, what it’s working on, and when you last cleansed, charged or programmed it.
        </Body>
      )}

      {stones.length > 0 && (
        <View style={ui.gap}>
          <SectionLabel>{due ? `${due} due for cleansing` : 'All cleansed'}</SectionLabel>
          {stones.map((s) => {
            const status = cleanseStatus(s.data, rule, now);
            const care = findCare(s.data.key, s.data.name);
            const form = STONE_FORMS.find((f) => f.key === s.data.form)?.label;
            const detail = status.last ? `Cleansed ${daysAgo(now, status.last)}` : status.label;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={[s.data.name, form, status.due ? 'Due for cleansing' : null, detail, care ? careBadges(care).join(', ') : null].filter(Boolean).join('. ')}
                onPress={() => router.push({ pathname: '/rituals/craft/crystal/stone', params: { id: s.id } } as Href)}
                style={({ pressed }) => [styles.stone, status.due && styles.due, pressed && styles.pressed]}
              >
                <View style={styles.head}>
                  <Text style={styles.name} numberOfLines={2}>
                    {s.data.name}
                  </Text>
                  {!!form && <Text style={type.caption}>{form}</Text>}
                </View>
                <Text style={[type.caption, status.due && styles.gold]}>{status.due && status.last ? `Due · ${detail}` : detail}</Text>
                {s.data.intentions.length > 0 && <Text style={type.caption} numberOfLines={1}>{`Working on: ${s.data.intentions.join(', ')}`}</Text>}
                {care && (
                  <View aria-hidden>
                    <Chips>
                      {careBadges(care)
                        .slice(1)
                        .map((b) => (
                          <Chip key={b} label={b} />
                        ))}
                    </Chips>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      <Expander title="When stones fall due">
        <Body muted>A stone shows as due for cleansing when its last cleansing is older than this. Charging and programming don’t count.</Body>
        <Chips>
          {RULES.map((r) => (
            <Chip key={r.label} label={r.label} selected={sameRule(r.rule, rule)} onPress={() => void chooseRule(r.rule)} />
          ))}
        </Chips>
        <Notice>{rule.kind === 'fullMoon' ? 'Due once a full moon has passed since the last cleansing.' : `Due ${rule.days} days after the last cleansing.`}</Notice>
      </Expander>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  stone: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 14, gap: 6, minHeight: 64 },
  due: { borderColor: colors.goldLine },
  pressed: { opacity: 0.7 },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  name: { flexShrink: 1, fontFamily: fonts.display, fontSize: 21, lineHeight: 25, color: colors.cream },
  gold: { color: colors.gold },
});
