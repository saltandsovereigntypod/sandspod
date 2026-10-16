import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Expander, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { planetInSign } from '../../../../../lib/astro/meanings';
import { shortDate, timeOfDay } from '../../../../../lib/calendar';
import { formatOffset, formatPlacement, natalChart, natalOf, type ChartInput, type Placement } from '../../../../../lib/craft/cosmic/chart';
import { CHART } from '../../../../../lib/craft/cosmic/collections';
import {
  ASPECT_TONE,
  ASPECTS,
  midheavenMeaning,
  monthAround,
  moonInSign,
  moonMeaning,
  RISING,
  sunMeaning,
  transitLine,
  transitsAt,
} from '../../../../../lib/craft/cosmic/transits';
import { useCraft } from '../../../../../lib/craft/store';
import { colors, fonts, radius, type } from '../../../../../theme';

const EDIT = '/rituals/craft/cosmic/chart-edit' as Href;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const when = (d: Date) => `${shortDate(d)}, ${timeOfDay(d)}`;

// My chart: the big three with what they mean, the rest of the planets, and what touches them today.
export default function MyChart() {
  const { entries, ready } = useCraft<ChartInput>(CHART);
  const input = entries[0]?.data ?? null;
  const chart = useMemo(() => (input ? natalChart(input) : null), [input]);
  const now = useMemo(() => new Date(), []);
  const transits = useMemo(() => (chart ? transitsAt(chart, now) : []), [chart, now]);
  const month = monthAround(now);
  const sun = chart ? natalOf(chart, 'Sun') : null;
  const moon = chart ? natalOf(chart, 'Moon') : null;
  const spells = useMemo(() => {
    if (!sun || !moon) return [];
    const signs = sun.sign === moon.sign ? [sun.sign] : [sun.sign, moon.sign];
    return signs.map((sign) => ({
      sign,
      label: sign === sun.sign && sign === moon.sign ? 'your sun and moon sign' : sign === sun.sign ? 'your sun sign' : 'your moon sign',
      spells: moonInSign(sign, month.start, month.end),
    }));
  }, [sun?.sign, moon?.sign, month.start.getTime()]);

  if (!ready) {
    return (
      <RitualScreen back="Cosmic & celestial">
        <Title eyebrow="Cosmic & celestial">My chart</Title>
      </RitualScreen>
    );
  }

  if (!input || !chart || !sun || !moon) {
    return (
      <RitualScreen back="Cosmic & celestial">
        <Title eyebrow="Cosmic & celestial">My chart</Title>
        <Card accent>
          <Text style={type.cardTitle}>Your sun, moon and rising</Text>
          <Body>
            Add your birth date to see where the Sun, Moon and planets stood when you arrived. With a birth time and place, you’ll see your rising
            sign and Midheaven too, and each day, which planets are touching them.
          </Body>
          <Button label="Add my birth details" onPress={() => router.push(EDIT)} />
        </Card>
        {input && !chart && <Notice>Your saved birth date couldn’t be read. Edit it to try again.</Notice>}
      </RitualScreen>
    );
  }

  const others = chart.placements.filter((p) => p.body !== 'Sun' && p.body !== 'Moon');

  return (
    <RitualScreen back="Cosmic & celestial">
      <Title eyebrow="Cosmic & celestial">My chart</Title>

      <View style={ui.gap}>
        <SectionLabel>Your big three</SectionLabel>
        <BigOne title={`Sun in ${sun.sign}`} position={sun} body={sunMeaning(sun.sign)} />
        <BigOne
          title={`Moon in ${moon.sign}`}
          position={moon}
          body={moonMeaning(moon.sign)}
          caveat={
            moon.orSign
              ? `The Moon changed sign on your birthday, so without a birth time it may be in ${moon.orSign} instead.`
              : !chart.timeKnown
                ? 'Without a birth time the Moon’s degree is approximate; it moves about 13° a day.'
                : undefined
          }
        />
        {chart.ascendant ? (
          <BigOne title={`${chart.ascendant.sign} rising`} position={chart.ascendant} body={RISING[chart.ascendant.sign]} />
        ) : (
          <Card>
            <Text style={type.cardTitle}>Rising sign</Text>
            <Body muted>
              {!chart.timeKnown
                ? 'Your rising sign needs a birth time: it changes about every two hours. Add one if you know it, even roughly.'
                : 'Your rising sign needs your birthplace. Add its latitude and longitude.'}
            </Body>
            <Button label="Add birth time and place" variant="outline" onPress={() => router.push(EDIT)} />
          </Card>
        )}
        {sun.orSign && (
          <Notice>{`The Sun changed sign on your birthday. Without a birth time, you may be a ${sun.orSign} sun instead.`}</Notice>
        )}
      </View>

      <View style={ui.gap}>
        <SectionLabel>What touches your chart today</SectionLabel>
        {transits.length === 0 ? (
          <Body muted>No planet is in close aspect to your sun, moon or rising today. A quiet sky for you: good for steady, ordinary work.</Body>
        ) : (
          transits.map((t) => {
            const symbol = ASPECTS.find((a) => a.name === t.aspect)!.symbol;
            return (
              <Card key={`${t.transiting}-${t.natal}-${t.aspect}`}>
                <View style={styles.head}>
                  <Text style={[type.cardTitle, styles.flex]}>{`${t.transiting} ${symbol} ${t.natal === 'Ascendant' ? 'rising' : `natal ${t.natal}`}`}</Text>
                  <Text style={styles.orb}>{`${t.off.toFixed(1)}° ${t.applying ? 'closing' : 'parting'}`}</Text>
                </View>
                <Body>{transitLine(t)}</Body>
                <Body muted>{`${t.aspect[0].toUpperCase()}${t.aspect.slice(1)}: ${ASPECT_TONE[t.aspect]}`}</Body>
              </Card>
            );
          })
        )}
        <Body muted>
          {`Aspects within 3° (5° for the Moon) to your natal Sun, Moon${chart.ascendant ? ' and rising' : ''}. “Closing” ones are still building.`}
        </Body>
      </View>

      <View style={ui.gap}>
        <SectionLabel>{`The Moon in your signs, ${MONTHS[now.getMonth()]}`}</SectionLabel>
        {spells.map((s) => (
          <Card key={s.sign}>
            <Text style={type.cardTitle}>{`Moon in ${s.sign}`}</Text>
            <Body muted>{`When the Moon passes through ${s.label}, it’s a time many feel more themselves: good for workings that are about you.`}</Body>
            {s.spells.length === 0 && <Body muted>Not this month.</Body>}
            {s.spells.map((spell) => {
              const current = now.getTime() >= spell.start.getTime() && now.getTime() < spell.end.getTime();
              const past = spell.end.getTime() <= now.getTime();
              return (
                <View key={spell.start.toISOString()} style={[styles.spell, current && styles.spellNow]}>
                  <Text style={[type.body, current && styles.gold, past && styles.past]}>
                    {`${spell.start.getTime() === month.start.getTime() ? 'From the 1st' : when(spell.start)} – ${when(spell.end)}`}
                  </Text>
                  {(current || past) && <Text style={type.caption}>{current ? 'Now' : 'Passed'}</Text>}
                </View>
              );
            })}
          </Card>
        ))}
      </View>

      <Expander title="The rest of your chart">
        {chart.midheaven && (
          <View style={styles.planet}>
            <View style={styles.head}>
              <Text style={[styles.planetName, styles.flex]}>Midheaven</Text>
              <Text style={styles.orb}>{formatPlacement(chart.midheaven)}</Text>
            </View>
            <Text style={type.caption}>{midheavenMeaning(chart.midheaven.sign)}</Text>
          </View>
        )}
        {others.map((p) => (
          <View key={p.body} style={styles.planet} accessible accessibilityLabel={`${p.body} at ${p.degree} degrees ${p.sign}`}>
            <View style={styles.head}>
              <Text style={[styles.planetName, styles.flex]}>{p.body}</Text>
              <Text style={styles.orb}>{formatPlacement(p)}</Text>
            </View>
            <Text style={type.caption}>{planetInSign(p.body as Exclude<Placement['body'], 'Ascendant' | 'Midheaven'>, p.sign)}</Text>
            {p.orSign && <Text style={type.caption}>{`Or ${p.orSign}, depending on your birth time.`}</Text>}
          </View>
        ))}
      </Expander>

      <Card>
        <SectionLabel>Your birth details</SectionLabel>
        <Body>
          {[
            input.date,
            chart.timeKnown ? input.time : 'time unknown',
            formatOffset(input.utcOffsetMinutes) + (input.offsetFromDevice ? ' (from your phone)' : ''),
          ].join(' · ')}
        </Body>
        <Body muted>
          {chart.placeKnown
            ? `${input.placeLabel ? `${input.placeLabel}, ` : ''}${(input.latitude as number).toFixed(2)}°, ${(input.longitude as number).toFixed(2)}°`
            : 'No birthplace'}
        </Body>
        <Body muted>
          The time zone matters: an hour out shifts your rising sign by about 15°, often a whole sign, and can move the Moon’s. If you were born
          somewhere else, or summer time was in force, check the offset.
        </Body>
        {chart.polar && <Notice>You were born inside a polar circle, where the rising sign can jump or stall. Treat it lightly.</Notice>}
        {chart.outsideRange && <Notice>The planet tables are tuned for 1800 to 2050, so positions for this date are rougher.</Notice>}
        <Button label="Edit birth details" variant="outline" onPress={() => router.push(EDIT)} />
      </Card>
    </RitualScreen>
  );
}

function BigOne({ title, position, body, caveat }: { title: string; position: Placement; body: string; caveat?: string }) {
  return (
    <Card>
      <View style={styles.head}>
        <Text style={[type.cardTitle, styles.flex]}>{title}</Text>
        <Text style={styles.orb}>{formatPlacement(position)}</Text>
      </View>
      <Body>{body}</Body>
      {!!caveat && <Notice>{caveat}</Notice>}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 160 },
  orb: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  gold: { color: colors.gold },
  past: { color: colors.muted },
  spell: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  spellNow: { backgroundColor: colors.surfaceRaised },
  planet: { backgroundColor: colors.surfaceRaised, borderRadius: radius.tile, padding: 12, gap: 4 },
  planetName: { fontFamily: fonts.display, fontSize: 20, color: colors.cream },
});
