import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, Field, MoreScreen, Notice, Section } from '../../../components/more/ui';
import { eclipseMeaning, MOON_IN_SIGN, planetInSign, PHASE_GOOD_FOR, VOID_OF_COURSE_MEANING } from '../../../lib/astro/meanings';
import { retrogradesBetween } from '../../../lib/astro/planets';
import { dateFrom, relativeDay, timeOfDay } from '../../../lib/calendar';
import { askDeviceLocation, clearPlace, setManualPlace, usePlace } from '../../../lib/location';
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
        retrogradesBetween(planet, now, new Date(now.getTime() + 365 * 86_400_000)).map((r) => ({ planet, ...r })),
      ).sort((a, b) => a.start.getTime() - b.start.getTime()),
    [now],
  );

  return (
    <MoreScreen title="The sky today" eyebrow="Astrology" back="/today" backLabel="Back to Today">
      <Section label="Sun and Moon">
        <Card>
          <Text style={type.cardTitle}>{`Sun in ${sky.sunSign}`}</Text>
          <Text style={type.body}>{`${sky.sunSign} season${sky.sunSignEnds ? `, until ${D(sky.sunSignEnds)}` : ''}: ${sky.sunSeason}.`}</Text>
        </Card>
        <Card>
          <Text style={type.cardTitle}>{`${moon.name} in ${moonSign}`}</Text>
          <Text style={type.body}>{`The Moon in ${moonSign} feels ${MOON_IN_SIGN[moonSign].mood}. Good for ${MOON_IN_SIGN[moonSign].goodFor}. The ${moon.name.toLowerCase()} is good for ${PHASE_GOOD_FOR[moon.name]}.`}</Text>
          <Text style={[type.caption, sky.vocNow && styles.gold]}>
            {sky.vocNow
              ? `Void of course now, until ${relativeDay(now, sky.voc.end)} at ${timeOfDay(sky.voc.end)}, when it enters ${sky.voc.nextSign}.`
              : `Next void of course: ${D(sky.voc.start)} ${timeOfDay(sky.voc.start)} until ${timeOfDay(sky.voc.end)}, then into ${sky.voc.nextSign}.`}
          </Text>
          <Text style={type.caption}>{VOID_OF_COURSE_MEANING}</Text>
        </Card>
      </Section>

      <Section label="Planets">
        <View style={styles.list}>
          {sky.planets
            .filter((p) => p.planet !== 'Sun' && p.planet !== 'Moon')
            .map((p) => (
              <View key={p.planet} style={styles.row} accessible accessibilityLabel={`${p.planet} at ${p.degree} degrees ${p.sign}${p.retrograde ? ', retrograde' : ''}`}>
                <View style={styles.rowHead}>
                  <Text style={styles.planet}>{p.planet}</Text>
                  <Text style={styles.position}>{`${p.degree}° ${p.sign}${p.retrograde ? ' ℞' : ''}`}</Text>
                </View>
                <Text style={type.caption}>{planetInSign(p.planet, p.sign)}</Text>
                {p.nextSign && <Text style={type.caption}>{`Enters ${p.nextSign.sign} ${D(p.nextSign.date)}`}</Text>}
              </View>
            ))}
        </View>
      </Section>

      <Section label="Retrogrades">
        {sky.retrogrades.length === 0 && <Text style={type.caption}>No planet is retrograde right now.</Text>}
        {sky.retrogrades.map((r) => (
          <Card key={r.planet}>
            <Text style={type.cardTitle}>
              {r.when === 'now' ? `${r.planet} retrograde until ${D(r.date)}` : `${r.planet} turns retrograde ${D(r.date)}`}
            </Text>
            {!!r.meaning && <Text style={type.caption}>{r.meaning}</Text>}
          </Card>
        ))}
        {year.length > 0 && (
          <View style={styles.list}>
            <Text style={type.eyebrow}>The year ahead</Text>
            {year.map((r) => (
              <Text key={`${r.planet}-${r.start.getTime()}`} style={type.caption}>
                {`${r.planet}: ${D(r.start)} – ${D(r.end)}`}
              </Text>
            ))}
          </View>
        )}
      </Section>

      <Section label="Eclipses">
        {sky.eclipses.length === 0 && <Text style={type.caption}>No eclipses in the next year.</Text>}
        {sky.eclipses.map((e) => (
          <Card key={e.date.toISOString()}>
            <Text style={type.eyebrow}>{D(e.date)}</Text>
            <Text style={type.cardTitle}>{eclipseLabel(e)}</Text>
            <Text style={type.caption}>{eclipseMeaning(e.type, e.kind)}</Text>
          </Card>
        ))}
      </Section>

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
                <Text style={type.eyebrow}>Planetary hours</Text>
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
        <LocationForm hasPlace={!!place} source={place?.source} />
      </Section>
    </MoreScreen>
  );
}

function LocationForm({ hasPlace, source }: { hasPlace: boolean; source?: 'device' | 'manual' }) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const findMine = async () => {
    setMessage('Finding where you are…');
    const result = await askDeviceLocation();
    setMessage(
      result === 'ok'
        ? 'Location set. It stays on this phone.'
        : result === 'denied'
          ? 'Location wasn’t allowed. You can allow it in your phone’s Settings, or enter it below.'
          : 'Using your phone’s location arrives with the next app update. For now, enter it below.',
    );
  };
  const saveManual = () => {
    const ok = setManualPlace(Number(latitude.replace(',', '.')), Number(longitude.replace(',', '.')));
    setMessage(ok ? 'Location saved. It stays on this phone.' : 'Enter a latitude from -90 to 90 and a longitude from -180 to 180 (west and south are negative).');
  };

  return (
    <Card>
      <Text style={type.cardTitle}>Your location</Text>
      <Text style={type.caption}>
        {hasPlace
          ? `Set ${source === 'device' ? 'from your phone' : 'by hand'}. It stays on this phone, rounded to about a kilometre, and is never sent anywhere.`
          : 'Used only on this phone to work out the sky where you are. It is never sent anywhere.'}
      </Text>
      <Button label="Use my location" variant="outline" onPress={() => void findMine()} />
      <Field label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numbers-and-punctuation" placeholder="e.g. 52.52" />
      <Field label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numbers-and-punctuation" placeholder="e.g. 13.40 (west is negative)" />
      <Button label="Save location" variant="outline" onPress={saveManual} />
      {hasPlace && <Button label="Forget my location" variant="text" onPress={clearPlace} />}
      {!!message && <Notice>{message}</Notice>}
    </Card>
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
