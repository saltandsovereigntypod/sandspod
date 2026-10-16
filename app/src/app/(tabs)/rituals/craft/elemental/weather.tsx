import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Expander, Notice, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { timeOfDay } from '../../../../../lib/calendar';
import { useWeather } from '../../../../../lib/craft/elemental/useWeather';
import { daysAhead, describeCode, workingsFor, type DayWeather, type WeatherWorking } from '../../../../../lib/craft/elemental/weather';
import { askDeviceLocation, usePlace } from '../../../../../lib/location';
import { premadeById } from '../../../../../lib/rituals/premade';
import { dateFromKey, localDateKey } from '../../../../../lib/rituals/lifecycle';
import { colors, fonts, type } from '../../../../../theme';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dayName(key: string, todayKey: string): string {
  const date = dateFromKey(key);
  if (!date) return key;
  if (key === todayKey) return 'Today';
  const tomorrow = dateFromKey(todayKey);
  if (tomorrow) {
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (localDateKey(tomorrow) === key) return 'Tomorrow';
  }
  return WEEKDAYS[date.getDay()];
}

export default function WeatherForWorking() {
  const place = usePlace();
  const { forecast, loading, problem, refresh } = useWeather(place);
  const todayKey = localDateKey(new Date());
  const days = forecast ? daysAhead(forecast.days, todayKey, 3) : [];

  return (
    <RitualScreen back="Elemental" onRefresh={place ? refresh : undefined}>
      <Title eyebrow="The next three days">Weather for working</Title>

      {!place ? (
        <AskForPlace />
      ) : (
        <>
          {!!problem && <Notice>{problem}</Notice>}
          {!forecast && loading && <Body muted>Reading the sky ahead…</Body>}
          {days.map((day) => (
            <DayCard key={day.date} day={day} label={dayName(day.date, todayKey)} />
          ))}
          {forecast && !days.length && <Body muted>The saved forecast has run out. Pull down to fetch a new one when you’re online.</Body>}
          {forecast && (
            <Body muted>{`Forecast by Open-Meteo.com, fetched ${timeOfDay(new Date(forecast.fetchedAt))}. Pull down to refresh. Only your rounded location is sent.`}</Body>
          )}
          <Expander title="Weather and the elements">
            <Body>
              Weather was the first elemental teacher: rain and river for water, wind for air, lightning and the sun for fire, frost and stone for earth. Working with the
              weather you actually have is one of the oldest ways to keep a practice tied to the land.
            </Body>
            <Body muted>
              Safety comes first. Thunder means stay indoors; gales mean stay away from trees and the shore; flame and wind don’t mix. Rain water is for washing, offerings and
              plants, never for drinking.
            </Body>
          </Expander>
          <Button label="Change my location" variant="text" onPress={() => router.push('/today/sky')} />
        </>
      )}
    </RitualScreen>
  );
}

function AskForPlace() {
  const [message, setMessage] = useState<string | null>(null);
  const findMine = async () => {
    setMessage('Finding where you are…');
    const result = await askDeviceLocation();
    setMessage(
      result === 'ok'
        ? null
        : result === 'denied'
          ? 'Location wasn’t allowed. You can allow it in your phone’s Settings, or enter it by hand.'
          : 'Your phone’s location isn’t available in this version of the app. Enter it by hand instead.',
    );
  };
  return (
    <Card>
      <SectionLabel>Where are you?</SectionLabel>
      <Body>The forecast needs your location. It stays on this phone, rounded to about a kilometre, and only that is sent to the free weather service.</Body>
      <Button label="Use my location" onPress={() => void findMine()} />
      <Button label="Enter it by hand" variant="outline" onPress={() => router.push('/today/sky')} />
      {!!message && <Notice>{message}</Notice>}
    </Card>
  );
}

function DayCard({ day, label }: { day: DayWeather; label: string }) {
  const workings = workingsFor(day);
  const facts = [
    day.tempMin !== null && day.tempMax !== null ? `${Math.round(day.tempMin)}° to ${Math.round(day.tempMax)}°C` : null,
    day.rainMm >= 0.2 ? `${day.rainMm.toFixed(1)} mm rain${day.rainChance !== null ? ` (${day.rainChance}%)` : ''}` : 'Dry',
    `gusts ${Math.round(day.gustMax)} km/h`,
    day.nightCloud !== null ? (day.nightCloud <= 30 ? 'clear night' : day.nightCloud >= 75 ? 'cloudy night' : 'some cloud tonight') : null,
  ].filter(Boolean);

  return (
    <Card accent={workings.length > 0}>
      <SectionLabel>{label}</SectionLabel>
      <Text style={type.cardTitle}>{describeCode(day.code)}</Text>
      <Body muted>{facts.join(' · ')}</Body>
      {workings.length ? (
        workings.map((w) => <Working key={w.sign} working={w} />)
      ) : (
        <Body>Settled weather with nothing strong in it: a good day for whatever work is in front of you.</Body>
      )}
    </Card>
  );
}

function Working({ working }: { working: WeatherWorking }) {
  const premade = premadeById(working.premadeId);
  return (
    <View style={styles.working}>
      <Text style={styles.workingTitle}>{`${working.title} · ${working.element}`}</Text>
      <Body>{working.detail}</Body>
      {!!working.care && <Text style={[type.caption, styles.care]}>{`Take care: ${working.care}`}</Text>}
      {premade && (
        <View style={ui.actions}>
          <Button
            label={premade.title}
            variant="outline"
            accessibilityHint="Opens this premade working"
            onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: premade.id } })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  working: { gap: 6, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
  workingTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  care: { color: colors.gold },
});
