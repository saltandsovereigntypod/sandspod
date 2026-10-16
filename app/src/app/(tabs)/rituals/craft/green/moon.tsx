import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Expander, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { eveningOf, gardenNight, gardenNights, nextQuarterChange, nightLine, QUARTERS, signNote, type GardenNight } from '../../../../../lib/craft/green/moonGarden';
import { colors, fonts, radius, type } from '../../../../../theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (d: Date) => `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

const FERTILITY_WORDS = { fruitful: 'fruitful', 'semi-fruitful': 'half fruitful', barren: 'barren' } as const;

export default function PlantingByTheMoon() {
  const now = useMemo(() => new Date(), []);
  const tonight = useMemo(() => gardenNight(eveningOf(now)), [now]);
  const nights = useMemo(() => gardenNights(now, 14), [now]);
  const change = useMemo(() => nextQuarterChange(eveningOf(now)), [now]);
  const advice = QUARTERS[tonight.quarter];
  const sign = signNote(tonight.sign);

  return (
    <RitualScreen back="Green">
      <Title eyebrow="Tonight’s moon tide">Planting by the moon</Title>

      <Card accent>
        <SectionLabel>{`${tonight.phase} · ${Math.round(tonight.illumination * 100)}% lit`}</SectionLabel>
        <Text style={type.cardTitle}>{advice.headline}</Text>
        <Body muted>{advice.span}</Body>
        <Body>{advice.why}</Body>
        <View style={ui.gapSmall} accessibilityRole="list">
          {advice.tasks.map((task) => (
            <Text key={task} style={type.body}>{`•  ${task}`}</Text>
          ))}
        </View>
        <Body muted>{`For example: ${advice.examples}.`}</Body>
        {tonight.turning && (
          <Body muted>The moon turns into this quarter today. Some almanacs leave the day of the change itself alone and begin tomorrow.</Body>
        )}
        {!!change && <Body muted>{`From ${shortDate(change.date)}: ${QUARTERS[change.quarter].short.toLowerCase()}.`}</Body>}
      </Card>

      <Card>
        <SectionLabel>The moon’s sign</SectionLabel>
        <Text style={type.cardTitle}>{`Moon in ${sign.sign}`}</Text>
        <Body muted>{`${sign.element} sign · ${FERTILITY_WORDS[sign.fertility]} in the old almanacs`}</Body>
        <Body>{sign.note}</Body>
        <Body muted>An older second layer: where the quarter and the sign disagree, gardeners who keep both usually let the quarter decide what to sow and the sign decide how keen to be.</Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>The next fourteen nights</SectionLabel>
        <View style={styles.list}>
          {nights.map((night, i) => (
            <NightRow key={night.date.toISOString()} night={night} label={i === 0 ? 'Tonight' : i === 1 ? 'Tomorrow' : shortDate(night.date)} />
          ))}
        </View>
      </View>

      <Expander title="About this tradition">
        <Body>
          Gardening by the moon is folk practice, handed down in almanacs and country lore across Europe and beyond for centuries. The four-quarter rule here is the common
          one: leaves while the moon waxes to its first quarter, fruit and seed to the full, roots and planting out as it wanes, and rest in the last dark days.
        </Body>
        <Body>
          Trials have found little firm evidence that the moon changes how plants grow; soil, warmth, water and timing for your frost dates matter far more. Many gardeners
          keep it anyway as a rhythm that slows them down and ties the work to the sky. Use it as a guide for the gentle choices, never over the needs of the plant.
        </Body>
        <Body muted>Moon times are worked out on your phone. The signs are tropical (as in most Western almanacs); biodynamic calendars use the constellations, so they differ.</Body>
      </Expander>

      <View style={ui.actions}>
        <Button label="Log it in My garden" onPress={() => router.push('/rituals/craft/green/garden' as Href)} />
        <Button label="What’s in season now" variant="outline" onPress={() => router.push('/rituals/craft/green/season' as Href)} />
      </View>
    </RitualScreen>
  );
}

function NightRow({ night, label }: { night: GardenNight; label: string }) {
  const line = nightLine(night);
  const sign = `${night.sign}, ${FERTILITY_WORDS[night.fertility]}`;
  return (
    <View accessible accessibilityLabel={`${label}. ${night.phase}. ${line}. Moon in ${sign}.`} style={[styles.row, night.turning && styles.turning]}>
      <View style={styles.when}>
        <Text style={styles.day}>{label}</Text>
        <Text style={type.caption}>{night.phase}</Text>
      </View>
      <View style={styles.what}>
        <Text style={[type.body, night.turning && styles.gold]}>{line}</Text>
        <Text style={type.caption}>{`Moon in ${sign}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.surface, borderRadius: radius.tile, paddingHorizontal: 14 },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  turning: { borderTopWidth: 1, borderTopColor: colors.goldLine },
  when: { width: 112, gap: 2 },
  what: { flex: 1, gap: 2 },
  day: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  gold: { color: colors.gold },
});
