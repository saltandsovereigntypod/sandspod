import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { usePotted } from '../../../../../components/craft/hearth';
import { Icon } from '../../../../../components/Icon';
import { Body, Chip, Chips, Expander, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { calendarHemisphere, gardenCalendar, yearGrid, type YoursKind } from '../../../../../lib/craft/green/calendar';
import { asPlant, PLANTS } from '../../../../../lib/craft/green/garden';
import { isTropical, MONTH_NAMES, type Hemisphere, type SeasonPlant } from '../../../../../lib/craft/green/season';
import { FORAGE_FIRST, LAND_GROWING, normalizePatch, worstLookAlike } from '../../../../../lib/craft/hearth/forage';
import { useCraft } from '../../../../../lib/craft/store';
import { ritualsLibraryHref } from '../../../../../lib/library';
import { usePlace } from '../../../../../lib/location';
import { useMySettings } from '../../../../../lib/settings/store';
import { useShelves } from '../../../../../lib/shelves/store';
import { colors, fonts, radius, type } from '../../../../../theme';

const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const KIND_WORDS: Record<YoursKind, string> = { gather: 'Gather', forage: 'Forage', sow: 'Sow', restock: 'Restock' };

// The garden and foraging calendar (Green → In season): month by month, what
// to sow, gather and forage where you are, and what of your own is ready.
export default function GardenCalendar() {
  const place = usePlace();
  const { settings } = useMySettings();
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  // Settings and the saved place decide, unless the person picks one here.
  const [chosen, setHemisphere] = useState<Hemisphere | null>(null);
  const hemisphere = chosen ?? calendarHemisphere(settings as Record<string, unknown> | null, place?.latitude);

  const garden = useCraft<unknown>(PLANTS).entries;
  const patches = useCraft<unknown>(LAND_GROWING).entries;
  const { entries: shelves } = useShelves();
  const potted = usePotted();
  const mine = useMemo(
    () => ({
      garden: garden.map((e) => ({ id: e.id, data: asPlant(e.data) })),
      patches: patches.map((e) => ({ id: e.id, data: normalizePatch(e.data) })),
      shelves,
      potted,
    }),
    [garden, patches, shelves, potted],
  );
  const cal = useMemo(() => gardenCalendar(month, hemisphere, mine), [month, hemisphere, mine]);
  const grid = useMemo(() => yearGrid(hemisphere), [hemisphere]);
  const thisMonth = month === new Date().getMonth() + 1;
  const name = MONTH_NAMES[month - 1];

  return (
    <RitualScreen back="Green">
      <Title eyebrow={thisMonth ? 'This month' : name}>Garden & foraging calendar</Title>
      <Body muted>
        {hemisphere === 'north'
          ? 'For a temperate garden in the northern hemisphere.'
          : 'For a temperate garden in the southern hemisphere: the northern calendar turned by six months.'}{' '}
        Your frost dates, height and rainfall can move every one of these by weeks, so take them as a guide to the season, not the day.
      </Body>

      {!place && !settings?.calendar_hemisphere && (
        <Notice>No location is saved, so this assumes the northern hemisphere. Choose below, or set your place in Settings → Location.</Notice>
      )}
      {isTropical(place?.latitude) && (
        <Notice>You’re in the tropics, where wet and dry seasons matter more than these months. Many of these herbs grow year round for you in shade, or in the cooler dry season.</Notice>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Hemisphere</SectionLabel>
        <Chips label="Hemisphere">
          <Chip label="Northern" selected={hemisphere === 'north'} onPress={() => setHemisphere('north')} />
          <Chip label="Southern" selected={hemisphere === 'south'} onPress={() => setHemisphere('south')} />
        </Chips>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Month</SectionLabel>
        <Chips label="Month">
          {SHORT.map((m, i) => (
            <Chip key={m} label={m} a11yLabel={MONTH_NAMES[i]} selected={month === i + 1} onPress={() => setMonth(i + 1)} />
          ))}
        </Chips>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`Yours in ${name}`}</SectionLabel>
        {cal.yours.length ? (
          <List>
            {cal.yours.map((y, i) => (
              <Row key={y.key} icon="wheel" title={`${KIND_WORDS[y.kind]}: ${y.name}`} detail={y.detail} onPress={() => router.push(y.href as Href)} last={i === cal.yours.length - 1} />
            ))}
          </List>
        ) : (
          <Body muted>Nothing of your own is in season this month. Log the plants you grow and the patches you know, and they show here in their months.</Body>
        )}
        <View style={ui.actions}>
          <Button label="Log a plant" variant="outline" onPress={() => router.push('/rituals/craft/green/plant/new' as Href)} />
          <Button label="Log a find" variant="outline" onPress={() => router.push('/rituals/craft/hearth/forage/harvest-edit' as Href)} />
        </View>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`To sow and plant in ${name}`}</SectionLabel>
        {cal.sow.length ? (
          cal.sow.map((p) => <PlantCard key={p.key} plant={p} detail={p.sowWhat} />)
        ) : (
          <Body muted>A resting month: nothing on this list is sown now. Plan, order seed and tend the soil.</Body>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`To gather in ${name}`}</SectionLabel>
        {cal.harvest.length ? (
          cal.harvest.map((p) => <PlantCard key={p.key} plant={p} detail={p.harvestWhat} />)
        ) : (
          <Body muted>Little to gather now. Use what you dried and stored.</Body>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`To forage in ${name}`}</SectionLabel>
        <Body muted>{FORAGE_FIRST}</Body>
        {cal.forage.length ? (
          <List>
            {cal.forage.map((p, i) => {
              const worst = worstLookAlike(p);
              return (
                <Row
                  key={p.key}
                  icon="wheel"
                  title={p.name}
                  detail={`${p.parts} · ${p.when}${worst ? ` · Not to be confused with ${worst.name.toLowerCase()}` : ''}`}
                  onPress={() => router.push(`/rituals/craft/hearth/forage/plant?key=${encodeURIComponent(p.key)}` as Href)}
                  last={i === cal.forage.length - 1}
                />
              );
            })}
          </List>
        ) : (
          <Body muted>Little grows wild to gather this month.</Body>
        )}
      </View>

      <Expander title="The whole year, month by month">
        <View style={styles.legend}>
          <View style={[styles.cell, styles.sow]} />
          <Text style={type.caption}>Sow or plant</Text>
          <View style={[styles.cell, styles.gather]} />
          <Text style={type.caption}>Gather or forage</Text>
        </View>
        <View style={styles.gridHead} importantForAccessibility="no-hide-descendants">
          {SHORT.map((m, i) => (
            <Text key={m} style={[styles.headCell, i + 1 === month && styles.headNow]}>
              {m[0]}
            </Text>
          ))}
        </View>
        {grid.map((row) => {
          const sow = row.sow.map((on, i) => (on ? SHORT[i] : '')).filter(Boolean).join(', ');
          const gather = row.gather.map((on, i) => (on ? SHORT[i] : '')).filter(Boolean).join(', ');
          return (
            <View key={row.key} accessible accessibilityLabel={`${row.name}${row.source === 'forage' ? ', wild' : ''}. ${sow ? `Sow: ${sow}. ` : ''}Gather: ${gather || 'none'}.`} style={styles.yearRow}>
              <Text style={styles.yearName}>{row.source === 'forage' ? `${row.name} · wild` : row.name}</Text>
              <View style={styles.cells}>
                {SHORT.map((m, i) => (
                  <View key={m} style={[styles.cell, row.gather[i] ? styles.gather : row.sow[i] ? styles.sow : null, i + 1 === month && styles.now]} />
                ))}
              </View>
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
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  gridHead: { flexDirection: 'row', gap: 3 },
  headCell: { width: 18, textAlign: 'center', fontFamily: fonts.bodySemi, fontSize: 12, color: colors.muted },
  headNow: { color: colors.gold },
  yearRow: { gap: 3, paddingVertical: 4 },
  yearName: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
  cells: { flexDirection: 'row', gap: 3 },
  cell: { width: 18, height: 12, borderRadius: 3, backgroundColor: colors.surfaceRaised },
  sow: { backgroundColor: colors.fern },
  gather: { backgroundColor: colors.goldDeep },
  now: { borderWidth: 1, borderColor: colors.cream },
});
