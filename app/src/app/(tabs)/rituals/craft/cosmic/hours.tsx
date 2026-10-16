import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { planetaryHours, type HourPlanet } from '../../../../../lib/astro/hours';
import { VOID_OF_COURSE_MEANING } from '../../../../../lib/astro/meanings';
import { voidOfCourse } from '../../../../../lib/astro/voidOfCourse';
import { relativeDay, timeOfDay } from '../../../../../lib/calendar';
import { HOUR_PLANETS, HOUR_SUITS, isNow, nextHoursOf, startOfLocalDay, vocForDay } from '../../../../../lib/craft/cosmic/hours';
import { askDeviceLocation, setManualPlace, usePlace } from '../../../../../lib/location';
import { colors, fonts, type } from '../../../../../theme';

const span = (a: Date, b: Date) => `${timeOfDay(a)} – ${timeOfDay(b)}`;

// Planetary hours: today's 24 hours where you are, the one you're in, and the void-of-course Moon.
export default function PlanetaryHours() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const minute = Math.floor(now.getTime() / 60_000);
  const place = usePlace();
  const [pick, setPick] = useState<HourPlanet | null>(null);

  // Recomputed each minute, so the list rolls over at sunrise.
  const hours = useMemo(() => (place ? planetaryHours(new Date(minute * 60_000), place) : null), [place, minute]);
  const current = hours?.find((h) => isNow(h, now)) ?? null;
  const upcoming = current && hours ? hours[hours.indexOf(current) + 1] ?? null : null;
  const dayKey = startOfLocalDay(now).getTime();
  const voc = useMemo(() => vocForDay(new Date(dayKey)), [dayKey]);
  const nextVoc = useMemo(() => (voc.length ? null : voidOfCourse(new Date(dayKey))), [voc, dayKey]);
  const picked = useMemo(() => (pick && place ? nextHoursOf(pick, new Date(minute * 60_000), place, 3) : []), [pick, place, minute]);

  return (
    <RitualScreen back="Cosmic & celestial">
      <Title eyebrow="Cosmic & celestial">Planetary hours</Title>
      <Body muted>
        Day and night are each split into twelve hours, longer or shorter with the seasons. Each is ruled in turn by one of the seven old planets,
        starting at sunrise with the planet that rules the day.
      </Body>

      {!place && <PlaceCard />}

      {place && !hours && (
        <Card>
          <Body>The sun doesn’t rise and set today where you are, so there are no planetary hours. They return when sunrise does.</Body>
        </Card>
      )}

      {current && (
        <Card accent>
          <SectionLabel>Now</SectionLabel>
          <Text style={type.cardTitle}>{`The hour of ${current.planet}`}</Text>
          <Body muted>{`${span(current.start, current.end)}${current.night ? ' · night' : ''}`}</Body>
          <Body>{HOUR_SUITS[current.planet].suits}</Body>
          {upcoming && <Body muted>{`Next: ${upcoming.planet}, for ${HOUR_SUITS[upcoming.planet].short}, from ${timeOfDay(upcoming.start)}.`}</Body>}
        </Card>
      )}

      <View style={ui.gap}>
        <SectionLabel>The Moon today</SectionLabel>
        <Card>
          {voc.length === 0 ? (
            <Body>
              {nextVoc
                ? `The Moon isn’t void of course today. Next: ${relativeDay(now, nextVoc.start)} at ${timeOfDay(nextVoc.start)}, until it enters ${nextVoc.nextSign} at ${timeOfDay(nextVoc.end)}.`
                : 'The Moon isn’t void of course today.'}
            </Body>
          ) : (
            voc.map((v) => {
              const live = now.getTime() >= v.start.getTime() && now.getTime() < v.end.getTime();
              return (
                <Text key={v.start.toISOString()} style={[type.body, live && styles.gold]}>
                  {`${live ? 'Void of course now' : 'Void of course'}: ${relativeDay(now, v.start)} ${timeOfDay(v.start)} until ${relativeDay(now, v.end)} ${timeOfDay(v.end)}, when it enters ${v.nextSign}.`}
                </Text>
              );
            })
          )}
          <Body muted>{VOID_OF_COURSE_MEANING}</Body>
        </Card>
      </View>

      {place && (
        <View style={ui.gap}>
          <SectionLabel>Find the next hour of</SectionLabel>
          <Chips>
            {HOUR_PLANETS.map((p) => (
              <Chip key={p} label={p} selected={pick === p} onPress={() => setPick(pick === p ? null : p)} a11yLabel={`Next hours of ${p}`} />
            ))}
          </Chips>
          {pick && (
            <Card>
              <Text style={type.cardTitle}>{`${pick} hours`}</Text>
              <Body muted>{HOUR_SUITS[pick].suits}</Body>
              {picked.length === 0 && <Body muted>None in the coming week where you are.</Body>}
              {picked.map((h) => (
                <Text key={h.start.toISOString()} style={[type.body, isNow(h, now) && styles.gold]}>
                  {`${isNow(h, now) ? 'Now' : relativeDay(now, h.start)}: ${span(h.start, h.end)}`}
                </Text>
              ))}
            </Card>
          )}
        </View>
      )}

      {hours && (
        <>
          {[false, true].map((night) => (
            <View key={String(night)} style={ui.gapSmall}>
              <SectionLabel>{night ? 'Night hours, sunset to sunrise' : 'Day hours, sunrise to sunset'}</SectionLabel>
              <View style={styles.list}>
                {hours
                  .filter((h) => h.night === night)
                  .map((h, i, all) => {
                    const on = isNow(h, now);
                    const past = h.end.getTime() <= now.getTime();
                    return (
                      <View
                        key={h.start.toISOString()}
                        style={[styles.hour, i < all.length - 1 && styles.rule, on && styles.hourNow]}
                        accessible
                        accessibilityLabel={`${on ? 'Now. ' : ''}${h.planet} hour, ${span(h.start, h.end)}. Good for ${HOUR_SUITS[h.planet].short}.`}
                      >
                        <Text style={[styles.time, on && styles.gold, past && styles.past]}>{timeOfDay(h.start)}</Text>
                        <View style={styles.flex}>
                          <Text style={[styles.planet, on && styles.gold, past && styles.past]}>{h.planet}</Text>
                          <Text style={type.caption}>{HOUR_SUITS[h.planet].short}</Text>
                        </View>
                        {on && <Text style={styles.now}>Now</Text>}
                      </View>
                    );
                  })}
              </View>
            </View>
          ))}
          <Body muted>{`Worked out for ${place!.latitude.toFixed(2)}°, ${place!.longitude.toFixed(2)}°. Change your place on The sky today.`}</Body>
        </>
      )}

      <List>
        <Row icon="today" title="The sky today" detail="Planets, retrogrades, eclipses and your place" last onPress={() => router.push('/today/sky' as Href)} />
      </List>
    </RitualScreen>
  );
}

function PlaceCard() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const findMine = async () => {
    setMessage('Finding where you are…');
    const result = await askDeviceLocation();
    setMessage(
      result === 'ok'
        ? null
        : result === 'denied'
          ? 'Location wasn’t allowed. You can allow it in your phone’s Settings, or enter it below.'
          : 'Your phone’s location isn’t available here yet. Enter it below.',
    );
  };
  const save = () => {
    const ok = setManualPlace(Number(latitude.replace(',', '.')), Number(longitude.replace(',', '.')));
    setMessage(ok ? null : 'Enter a latitude from -90 to 90 and a longitude from -180 to 180 (south and west are negative).');
  };

  return (
    <Card>
      <Text style={type.cardTitle}>Where are you?</Text>
      <Body muted>Planetary hours run from your sunrise and sunset, so they need your place. It stays on this phone, rounded to about a kilometre.</Body>
      <Button label="Use my location" variant="outline" onPress={() => void findMine()} />
      <Field label="Latitude" value={latitude} onChange={setLatitude} placeholder="e.g. 51.51" />
      <Field label="Longitude" value={longitude} onChange={setLongitude} placeholder="e.g. -0.13 (west is negative)" />
      <Button label="Save place" variant="outline" onPress={save} />
      {!!message && <Notice>{message}</Notice>}
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 12 },
  hour: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 6 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  hourNow: { backgroundColor: colors.surfaceRaised, borderRadius: 10 },
  time: { width: 76, fontFamily: fonts.body, fontSize: 14, color: colors.parchment },
  planet: { fontFamily: fonts.display, fontSize: 19, color: colors.cream },
  flex: { flex: 1 },
  gold: { color: colors.gold },
  past: { color: colors.muted },
  now: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold },
});
