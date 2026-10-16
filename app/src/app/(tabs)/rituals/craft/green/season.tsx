import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../../../../components/Icon';
import { Body, Chip, Chips, Expander, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import {
  hemisphereOf,
  inSeason,
  isTropical,
  localMonths,
  MONTH_NAMES,
  monthSpan,
  SEASON_PLANTS,
  type Hemisphere,
  type SeasonPlant,
} from '../../../../../lib/craft/green/season';
import { ritualsLibraryHref } from '../../../../../lib/library';
import { usePlace } from '../../../../../lib/location';
import { colors, fonts, radius, type } from '../../../../../theme';

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function InSeasonNow() {
  const place = usePlace();
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  // The saved place decides, unless the person picks one here.
  const [chosen, setHemisphere] = useState<Hemisphere | null>(null);
  const hemisphere = chosen ?? hemisphereOf(place?.latitude);

  const now = useMemo(() => inSeason(month, hemisphere), [month, hemisphere]);
  const thisMonth = month === new Date().getMonth() + 1;

  return (
    <RitualScreen back="Green">
      <Title eyebrow={thisMonth ? 'This month' : MONTH_NAMES[month - 1]}>In season now</Title>
      <Body muted>
        {hemisphere === 'north'
          ? 'For a temperate garden in the northern hemisphere.'
          : 'For a temperate garden in the southern hemisphere: the northern calendar turned by six months.'}{' '}
        Your frost dates, height and rainfall can move every one of these by weeks, so take them as a guide to the season, not the day.
      </Body>

      {!place && (
        <Notice>No location is saved, so this assumes the northern hemisphere. Choose below, or set your place on Today → The sky today.</Notice>
      )}
      {isTropical(place?.latitude) && (
        <Notice>You’re in the tropics, where wet and dry seasons matter more than these months. Many of these herbs grow year round for you in shade, or in the cooler dry season.</Notice>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Hemisphere</SectionLabel>
        <Chips>
          <Chip label="Northern" selected={hemisphere === 'north'} onPress={() => setHemisphere('north')} />
          <Chip label="Southern" selected={hemisphere === 'south'} onPress={() => setHemisphere('south')} />
        </Chips>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Month</SectionLabel>
        <Chips>
          {SHORT.map((m, i) => (
            <Chip key={m} label={m} a11yLabel={MONTH_NAMES[i]} selected={month === i + 1} onPress={() => setMonth(i + 1)} />
          ))}
        </Chips>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`To sow and plant in ${MONTH_NAMES[month - 1]}`}</SectionLabel>
        {now.sow.length ? (
          now.sow.map((p) => <PlantCard key={p.key} plant={p} detail={p.sowWhat} />)
        ) : (
          <Body muted>A resting month: nothing on this list is sown now. Plan, order seed and tend the soil.</Body>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`To gather in ${MONTH_NAMES[month - 1]}`}</SectionLabel>
        {now.harvest.length ? (
          now.harvest.map((p) => <PlantCard key={p.key} plant={p} detail={p.harvestWhat} />)
        ) : (
          <Body muted>Little to gather now. Use what you dried and stored.</Body>
        )}
      </View>

      <Expander title="The whole year">
        {SEASON_PLANTS.slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((p) => {
            const sow = p.sow.length ? monthSpan(localMonths(p.sow, hemisphere)) : p.wild ? 'Grows wild' : '—';
            const gather = monthSpan(localMonths(p.harvest, hemisphere));
            return (
              <View key={p.key} accessible accessibilityLabel={`${p.name}. Sow: ${sow}. Gather: ${gather}.`} style={styles.yearRow}>
                <Text style={styles.yearName}>{p.name}</Text>
                <Text style={type.caption}>{`Sow ${sow} · Gather ${gather}`}</Text>
              </View>
            );
          })}
      </Expander>

      <Body muted>
        Gather from plants you’re sure of, from clean ground away from roads and sprays, and with the landowner’s leave. Take no more than a third of a plant, and never anything
        rare. When a plant carries a warning here, read its Library page before you use it.
      </Body>
    </RitualScreen>
  );
}

function PlantCard({ plant, detail }: { plant: SeasonPlant; detail: string }) {
  const body = (
    <>
      <View style={styles.cardText}>
        <Text style={styles.name}>{plant.name}</Text>
        <Text style={type.body}>{detail}</Text>
        <Text style={type.caption}>{plant.note}</Text>
        {!!plant.caution && <Text style={[type.caption, styles.caution]}>{`Take care: ${plant.caution}`}</Text>}
      </View>
      {plant.library && <Icon name="chevron" size={16} color={colors.tabInactive} />}
    </>
  );
  if (!plant.library) {
    return (
      <View accessible style={styles.card}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${plant.name}. ${detail}. ${plant.caution ? `Take care: ${plant.caution}` : ''}`}
      accessibilityHint="Opens its Living Library page"
      onPress={() => router.push(ritualsLibraryHref({ id: `traditional:herb:${plant.key}` }))}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    padding: 14,
  },
  pressed: { opacity: 0.7 },
  cardText: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
  caution: { color: colors.gold },
  yearRow: { gap: 2, paddingVertical: 4 },
  yearName: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
});
