import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, MoreScreen, Section } from '../../../components/more/ui';
import { eclipseMeaning, MOON_IN_SIGN, planetInSign, PHASE_GOOD_FOR, VOID_OF_COURSE_MEANING } from '../../../lib/astro/meanings';
import { retrogradePeriods } from '../../../lib/astro/forecast';
import { openTerm, TermChips, TermText } from '../../../components/astro/Explain';
import { dateFrom, relativeDay, timeOfDay } from '../../../lib/calendar';
import { usePlace } from '../../../lib/location';
import { settingsHref } from '../../../lib/settings/links';
import { moonState } from '../../../lib/moon';
import { eclipseLabel, placeSky, skyNow } from '../../../lib/sky';
import { colors, fonts, radius, type } from '../../../theme';

const RETRO_PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;

export default function SkyScreen() {
  const [now] = useState(() => new Date());
  const D = (date: Date) => dateFrom(now, date);
  const sky = useMemo(() => skyNow(now), [now]);
  const place = usePlace();
  const here = useMemo(() => (place ? placeSky(now, place) : null), [now, place]);
  const moon = moonState(now);
  const moonSign = sky.planets.find((p) => p.planet === 'Moon')!.sign;
  const year = useMemo(
    () =>
      RETRO_PLANETS.flatMap((planet) =>
        retrogradePeriods(planet, now, new Date(now.getTime() + 365 * 86_400_000)).map((r) => ({ ...r, planet })),
      ).sort((a, b) => a.start.getTime() - b.start.getTime()),
    [now],
  );

  return (
    <MoreScreen title="The sky today" eyebrow="Astrology" back="/today" backLabel="Back to Today">
      <Section label="Sun and Moon">
        <Card>
          <TermText style={type.cardTitle} text={`Sun in ${sky.sunSign}`} />
          <TermText style={type.body} skip={['sun']} text={`${sky.sunSign} season${sky.sunSignEnds ? `, until ${D(sky.sunSignEnds)}` : ''}: ${sky.sunSeason}.`} />
        </Card>
        <Card>
          <TermText style={type.cardTitle} text={`${moon.name} in ${moonSign}`} />
          <TermText style={type.body} text={`The Moon in ${moonSign} feels ${MOON_IN_SIGN[moonSign].mood}. Good for ${MOON_IN_SIGN[moonSign].goodFor}. The ${moon.name.toLowerCase()} is good for ${PHASE_GOOD_FOR[moon.name]}.`} />
          <Text style={[type.caption, sky.vocNow && styles.gold]}>
            {sky.vocNow
              ? `Void of course now, until ${relativeDay(now, sky.voc.end)} at ${timeOfDay(sky.voc.end)}, when it enters ${sky.voc.nextSign}.`
              : `Next void of course: ${D(sky.voc.start)} ${timeOfDay(sky.voc.start)} until ${timeOfDay(sky.voc.end)}, then into ${sky.voc.nextSign}.`}
          </Text>
          <TermText style={type.caption} text={VOID_OF_COURSE_MEANING} />
        </Card>
      </Section>

      <Section label="Planets">
        <View style={styles.list}>
          {sky.planets
            .filter((p) => p.planet !== 'Sun' && p.planet !== 'Moon')
            .map((p) => (
              <View key={p.planet} style={styles.row} accessible accessibilityLabel={`${p.planet} at ${p.degree} degrees ${p.sign}${p.retrograde ? ', retrograde' : ''}`}>
                <View style={styles.rowHead}>
                  <Text style={styles.planet} onPress={() => openTerm(p.planet.toLowerCase())} accessibilityRole="link">{p.planet}</Text>
                  <Text style={styles.position}>{`${p.degree}° ${p.sign}${p.retrograde ? ' ℞' : ''}`}</Text>
                </View>
                <TermText style={type.caption} skip={[p.planet.toLowerCase()]} text={planetInSign(p.planet, p.sign)} />
                {p.nextSign && <Text style={type.caption}>{`Enters ${p.nextSign.sign} ${D(p.nextSign.date)}`}</Text>}
              </View>
            ))}
        </View>
      </Section>

      <Section label="Retrogrades">
        {sky.retrogrades.length === 0 && <Text style={type.caption}>No planet is retrograde right now.</Text>}
        {sky.retrogrades.map((r) => (
          <Card key={r.planet}>
            <TermText style={type.cardTitle} text={r.when === 'now' ? `${r.planet} retrograde until ${D(r.date)}` : `${r.planet} turns retrograde ${D(r.date)}`} />
            {!!r.meaning && <Text style={type.caption}>{r.meaning}</Text>}
          </Card>
        ))}
        {year.length > 0 && (
          <View style={styles.list}>
            <Text style={type.eyebrow}>The year ahead</Text>
            {year.map((r) => (
              <Text key={`${r.planet}-${r.start.getTime()}`} style={type.caption}>
                {`${r.planet}: ${D(r.start)} – ${D(r.end)} (shadow ${D(r.shadowStart)} – ${D(r.shadowEnd)})`}
              </Text>
            ))}
            <TermText style={type.caption} text="The shadow period runs from when the planet first reaches the degree where it will turn direct, to when it passes the degree where it turned retrograde." />
          </View>
        )}
      </Section>

      <Section label="Eclipses">
        {sky.eclipses.length === 0 && <Text style={type.caption}>No eclipses in the next year.</Text>}
        {sky.eclipses.map((e) => (
          <Card key={e.date.toISOString()}>
            <Text style={type.eyebrow}>{D(e.date)}</Text>
            <TermText style={type.cardTitle} text={eclipseLabel(e)} />
            <TermText style={type.caption} text={eclipseMeaning(e.type, e.kind)} />
          </Card>
        ))}
      </Section>

      <TermChips ids={['zodiac', 'retrograde', 'shadow-period', 'void-of-course', 'eclipse', 'planetary-hours', 'natal-chart']} label="Learn the words" />
      <Button label="Your birth chart" variant="outline" onPress={() => router.push('/rituals/craft/cosmic/chart')} />

      <Section label="Where you are">
        {here ? (
          <>
            <Card>
              <Text style={type.body}>
                {[
                  here.sun.rise ? `Sunrise ${timeOfDay(here.sun.rise)}` : 'No sunrise today',
                  here.sun.set ? `sunset ${timeOfDay(here.sun.set)}` : 'no sunset today',
                ].join(' · ')}
              </Text>
              <Text style={type.body}>
                {[
                  here.moon.rise ? `Moonrise ${timeOfDay(here.moon.rise)}` : 'No moonrise today',
                  here.moon.set ? `moonset ${timeOfDay(here.moon.set)}` : 'no moonset today',
                ].join(' · ')}
              </Text>
            </Card>
            {here.hours ? (
              <View style={styles.list}>
                <Text style={type.eyebrow} onPress={() => router.push('/rituals/craft/cosmic/hours')} accessibilityRole="link">Planetary hours ›</Text>
                {here.hours.map((h) => {
                  const current = now.getTime() >= h.start.getTime() && now.getTime() < h.end.getTime();
                  return (
                    <View key={h.start.toISOString()} style={[styles.hour, current && styles.hourNow]}>
                      <Text style={[styles.hourTime, current && styles.gold]}>{`${timeOfDay(h.start)}${h.night ? ' ☾' : ''}`}</Text>
                      <Text style={[styles.hourPlanet, current && styles.gold]}>{h.planet}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={type.caption}>The sun doesn’t rise and set today where you are, so there are no planetary hours.</Text>
            )}
          </>
        ) : (
          <Text style={type.body}>Add your location for sunrise, sunset, moonrise and planetary hours.</Text>
        )}
        <Text style={type.caption}>
          {place ? `Your place is ${place.source === 'device' ? 'from your phone' : 'set by hand'}, and stays on this phone.` : 'Your place stays on this phone and is never sent anywhere.'}
        </Text>
        <Button
          label={place ? 'Change your location' : 'Add your location'}
          variant="outline"
          onPress={() => router.push(settingsHref('location', '/today'))}
        />
      </Section>
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  gold: { color: colors.gold },
  list: { gap: 10 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    padding: 14,
    gap: 4,
  },
  rowHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  planet: { flex: 1, fontFamily: fonts.display, fontSize: 21, color: colors.cream },
  position: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
  hour: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  hourNow: { backgroundColor: colors.surfaceRaised },
  hourTime: { ...type.caption, width: 110, color: colors.parchment },
  hourPlanet: { ...type.body, color: colors.cream },
});
