import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { TermChips, TermText } from '../../../../../components/astro/Explain';
import { countdown, HourWheel } from '../../../../../components/astro/HourWheel';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, tell, Title, ui } from '../../../../../components/rituals/ui';
import { planetaryHours, type HourPlanet, type PlanetaryHour } from '../../../../../lib/astro/hours';
import { VOID_OF_COURSE_MEANING } from '../../../../../lib/astro/meanings';
import { PLANET_GUIDES } from '../../../../../lib/astro/planetGuides';
import { POINT_GLYPH } from '../../../../../lib/astro/signs';
import { voidOfCourse } from '../../../../../lib/astro/voidOfCourse';
import { relativeDay, shortDate, timeOfDay } from '../../../../../lib/calendar';
import { HOUR_PLANETS, HOUR_SUITS, isNow, nextHourOnItsDay, nextHoursOf, planFields, startOfLocalDay, vocForDay } from '../../../../../lib/craft/cosmic/hours';
import { askDeviceLocation, setManualPlace, usePlace } from '../../../../../lib/location';
import { askForRitualReminders } from '../../../../../lib/reminders/store';
import { uuid } from '../../../../../lib/rituals/lifecycle';
import { savePlan } from '../../../../../lib/rituals/store';
import { colors, fonts, type } from '../../../../../theme';

const span = (a: Date, b: Date) => `${timeOfDay(a)} – ${timeOfDay(b)}`;
const DAY_RULER: HourPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// Planetary days and hours: the day's ruler, the 24 hours as a wheel from
// your real sunrise and sunset with the one you're in and how long it has
// left, each planet's guide, and a way to plan a working (with a reminder)
// in the next hour of any planet, on its own day if you like.
export default function PlanetaryHours() {
  const params = useLocalSearchParams<{ planet?: string }>();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const minute = Math.floor(now.getTime() / 60_000);
  const place = usePlace();
  const [pick, setPick] = useState<HourPlanet | null>(HOUR_PLANETS.includes(params.planet as HourPlanet) ? (params.planet as HourPlanet) : null);
  const [tapped, setTapped] = useState<PlanetaryHour | null>(null);
  const { width } = useWindowDimensions();

  const hours = useMemo(() => (place ? planetaryHours(new Date(minute * 60_000), place) : null), [place, minute]);
  const current = hours?.find((h) => isNow(h, now)) ?? null;
  const upcoming = current && hours ? (hours[hours.indexOf(current) + 1] ?? null) : null;
  const dayKey = startOfLocalDay(now).getTime();
  const voc = useMemo(() => vocForDay(new Date(dayKey)), [dayKey]);
  const nextVoc = useMemo(() => (voc.length ? null : voidOfCourse(new Date(dayKey))), [voc, dayKey]);
  const picked = useMemo(() => (pick && place ? nextHoursOf(pick, new Date(minute * 60_000), place, 3) : []), [pick, place, minute]);
  const onItsDay = useMemo(() => (pick && place ? nextHourOnItsDay(pick, new Date(minute * 60_000), place) : null), [pick, place, minute]);
  const dayRuler = hours ? hours[0].planet : DAY_RULER[now.getDay()];

  const remind = async (planet: HourPlanet, h: PlanetaryHour) => {
    const { date, time } = planFields(h.start);
    await savePlan({
      id: uuid(),
      date,
      time,
      title: `${planet} hour working`,
      intention: HOUR_SUITS[planet].short,
      intentionKey: null,
      templateId: null,
      draft: null,
      ingredients: [],
      createdAt: new Date().toISOString(),
    });
    void askForRitualReminders();
    tell('Planned', `A ${planet} hour working on ${shortDate(h.start)} at ${timeOfDay(h.start)} is in your planner, and you’ll be reminded (if ritual reminders are on in Settings → Reminders).`);
  };
  const plan = (planet: HourPlanet, h: PlanetaryHour) => {
    const { date, time } = planFields(h.start);
    router.push({ pathname: '/rituals/planner', params: { date, time, hour: planet } } as unknown as Href);
  };

  return (
    <RitualScreen back="Cosmic & celestial">
      <Title eyebrow="Cosmic & celestial">Planetary days and hours</Title>
      <TermText
        style={type.caption}
        text="Each day of the week belongs to one of the seven classical planets, and day and night are each split into twelve planetary hours, longer or shorter with the seasons, ruled in turn in the Chaldean order from the planet of the day."
      />

      {!place && <PlaceCard />}
      {place && !hours && (
        <Card>
          <Body>The sun doesn’t rise and set today where you are, so there are no planetary hours. They return when sunrise does.</Body>
        </Card>
      )}

      <Card accent>
        <SectionLabel>{`Today is ${PLANET_GUIDES[dayRuler].day}`}</SectionLabel>
        <TermText style={type.cardTitle} text={`${POINT_GLYPH[dayRuler]} The day of ${dayRuler === 'Sun' || dayRuler === 'Moon' ? `the ${dayRuler}` : dayRuler}`} />
        <Body>{PLANET_GUIDES[dayRuler].suits}</Body>
        <Button label={`${dayRuler}: the full guide`} variant="text" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/planet', params: { planet: dayRuler } } as unknown as Href)} />
      </Card>

      {hours && (
        <View style={styles.wheel}>
          <HourWheel hours={hours} now={now} size={Math.min(width - 40, 360)} onPick={setTapped} />
        </View>
      )}
      {tapped && (
        <Card>
          <TermText style={type.cardTitle} text={`The hour of ${tapped.planet}`} />
          <Body muted>{`${span(tapped.start, tapped.end)}${tapped.night ? ' · night' : ' · day'}${isNow(tapped, now) ? ` · ${countdown(tapped.end.getTime() - now.getTime())} left` : tapped.start.getTime() > now.getTime() ? ` · in ${countdown(tapped.start.getTime() - now.getTime())}` : ''}`}</Body>
          <Body>{HOUR_SUITS[tapped.planet].suits}</Body>
          {tapped.start.getTime() > now.getTime() && (
            <View style={ui.actions}>
              <Button label="Remind me then" variant="outline" onPress={() => void remind(tapped.planet, tapped)} />
              <Button label="Plan a working then" variant="text" onPress={() => plan(tapped.planet, tapped)} />
            </View>
          )}
        </Card>
      )}

      {current && (
        <Card accent>
          <SectionLabel>Now</SectionLabel>
          <TermText style={type.cardTitle} text={`The hour of ${current.planet}`} />
          <Body muted>{`${span(current.start, current.end)}${current.night ? ' · night' : ''} · ${countdown(current.end.getTime() - now.getTime())} left`}</Body>
          <Body>{HOUR_SUITS[current.planet].suits}</Body>
          {upcoming && <Body muted>{`Next: ${upcoming.planet}, for ${HOUR_SUITS[upcoming.planet].short}, in ${countdown(upcoming.start.getTime() - now.getTime())}.`}</Body>}
        </Card>
      )}

      {place && (
        <View style={ui.gap}>
          <SectionLabel>Find the next hour of</SectionLabel>
          <Chips>
            {HOUR_PLANETS.map((p) => (
              <Chip key={p} label={`${POINT_GLYPH[p]} ${p}`} selected={pick === p} onPress={() => setPick(pick === p ? null : p)} a11yLabel={`Next hours of ${p}`} />
            ))}
          </Chips>
          {pick && (
            <Card>
              <TermText style={type.cardTitle} text={`${pick} hours`} />
              <Body muted>{HOUR_SUITS[pick].suits}</Body>
              {picked.length === 0 && <Body muted>None in the coming week where you are.</Body>}
              {picked.map((h) => (
                <Text key={h.start.toISOString()} style={[type.body, isNow(h, now) && styles.gold]}>
                  {`${isNow(h, now) ? 'Now' : relativeDay(now, h.start)}: ${span(h.start, h.end)}`}
                </Text>
              ))}
              {onItsDay && (
                <>
                  <TermText
                    style={type.body}
                    text={`On its own day (${PLANET_GUIDES[pick].day}), the strongest time the old books give: ${isNow(onItsDay, now) ? 'now' : relativeDay(now, onItsDay.start)}, ${span(onItsDay.start, onItsDay.end)}.`}
                  />
                  {onItsDay.start.getTime() > now.getTime() && (
                    <View style={ui.actions}>
                      <Button label={`Remind me at the next ${pick} hour on ${PLANET_GUIDES[pick].day}`} variant="outline" onPress={() => void remind(pick, onItsDay)} />
                      <Button label="Plan a working then" variant="text" onPress={() => plan(pick, onItsDay)} />
                    </View>
                  )}
                </>
              )}
              <Button label={`${pick}: the full guide`} variant="text" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/planet', params: { planet: pick } } as unknown as Href)} />
            </Card>
          )}
        </View>
      )}

      <View style={ui.gap}>
        <SectionLabel>The Moon today</SectionLabel>
        <Card>
          {voc.length === 0 ? (
            <TermText
              style={type.body}
              text={nextVoc ? `The Moon isn’t void of course today. Next: ${relativeDay(now, nextVoc.start)} at ${timeOfDay(nextVoc.start)}, until it enters ${nextVoc.nextSign} at ${timeOfDay(nextVoc.end)}.` : 'The Moon isn’t void of course today.'}
            />
          ) : (
            voc.map((v) => {
              const live = now.getTime() >= v.start.getTime() && now.getTime() < v.end.getTime();
              return (
                <TermText
                  key={v.start.toISOString()}
                  style={[type.body, live && styles.gold]}
                  text={`${live ? 'Void of course now' : 'Void of course'}: ${relativeDay(now, v.start)} ${timeOfDay(v.start)} until ${relativeDay(now, v.end)} ${timeOfDay(v.end)}, when it enters ${v.nextSign}.`}
                />
              );
            })
          )}
          <Body muted>{VOID_OF_COURSE_MEANING}</Body>
        </Card>
      </View>

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
                          <Text style={[styles.planet, on && styles.gold, past && styles.past]}>{`${POINT_GLYPH[h.planet]} ${h.planet}`}</Text>
                          <Text style={type.caption}>{HOUR_SUITS[h.planet].short}</Text>
                        </View>
                        {on && <Text style={styles.now}>Now</Text>}
                      </View>
                    );
                  })}
              </View>
            </View>
          ))}
          <Body muted>{`Worked out for ${place!.latitude.toFixed(2)}°, ${place!.longitude.toFixed(2)}° from your real sunrise and sunset. Change your place on The sky today.`}</Body>
        </>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>The seven planets</SectionLabel>
        <List>
          {HOUR_PLANETS.map((p, i) => (
            <Row
              key={p}
              icon="calendar"
              title={`${POINT_GLYPH[p]} ${p} · ${PLANET_GUIDES[p].day}`}
              detail={HOUR_SUITS[p].short}
              last={i === HOUR_PLANETS.length - 1}
              onPress={() => router.push({ pathname: '/rituals/craft/cosmic/planet', params: { planet: p } } as unknown as Href)}
            />
          ))}
        </List>
      </View>

      <TermChips ids={['planetary-days', 'planetary-hours', 'chaldean-order', 'void-of-course']} />
      <List>
        <Row icon="calendar" title="The ritual planner" detail="Find the night, then the hour" onPress={() => router.push('/rituals/planner' as Href)} />
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
  wheel: { alignItems: 'center' },
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
