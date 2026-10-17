import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Expander, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { shortDate } from '../../../../../lib/calendar';
import { loadChosenStation, loadTides, loadUnits, OfflineError, saveUnits, type TideResult } from '../../../../../lib/craft/sea/noaa';
import {
  dayKey,
  eventsByDay,
  inWords,
  RANGE_WORDS,
  rangeStage,
  sameClock,
  SEA_SAFETY,
  stationLabel,
  TIDE_TIMING,
  tideNow,
  upcomingRanges,
  type Station,
  type TideEvent,
  type Units,
} from '../../../../../lib/craft/sea/tides';
import { usePlace } from '../../../../../lib/location';
import { colors, fonts, type } from '../../../../../theme';

const PHASE_WORDS = { new: 'new moon', full: 'full moon', firstQuarter: 'first quarter', lastQuarter: 'last quarter' } as const;

function dayHeading(day: string, now: Date): string {
  const today = dayKey(now);
  const tomorrow = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  if (day === today) return 'Today';
  if (day === tomorrow) return 'Tomorrow';
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}

const height = (e: TideEvent, units: Units) => `${e.height < 0 ? '−' : ''}${Math.abs(e.height).toFixed(1)} ${units === 'metric' ? 'm' : 'ft'}`;

const NOW_WORDS = { rising: 'Rising', falling: 'Falling', high: 'High water', low: 'Low water' } as const;

export default function Tides() {
  const now = useMemo(() => new Date(), []);
  const place = usePlace();
  const stage = rangeStage(now);
  const ranges = useMemo(() => upcomingRanges(now, 4), [now]);
  const words = RANGE_WORDS[stage.stage];

  const [station, setStation] = useState<Station | null>(null);
  const [stationReady, setStationReady] = useState(false);
  const [units, setUnits] = useState<Units>('english');
  const [result, setResult] = useState<TideResult | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFor = useCallback(async (s: Station | null, u: Units, force = false) => {
    if (!s) return;
    setLoading(true);
    setProblem(null);
    try {
      setResult(await loadTides(s, u, new Date(), force));
    } catch (e) {
      setResult(null);
      setProblem(
        e instanceof OfflineError
          ? 'Couldn’t reach NOAA, and there’s no saved copy for this station yet. The moon guide above still holds; try again when you’re online.'
          : `NOAA couldn’t give predictions for this station${e instanceof Error && e.message ? `: ${e.message}` : '.'}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Coming back from choosing a station picks it up.
  useFocusEffect(
    useCallback(() => {
      let live = true;
      void Promise.all([loadChosenStation(), loadUnits()]).then(([s, u]) => {
        if (!live) return;
        setStation(s);
        setUnits(u);
        setStationReady(true);
        void fetchFor(s, u);
      });
      return () => {
        live = false;
      };
    }, [fetchFor]),
  );

  const changeUnits = (u: Units) => {
    if (u === units) return;
    setUnits(u);
    void saveUnits(u);
    void fetchFor(station, u);
  };

  const days = result ? eventsByDay(result.events).slice(0, 3) : [];
  const clockMatches = station ? sameClock(station.tz, now.getTimezoneOffset()) : false;
  const water = result && clockMatches ? tideNow(result.events, new Date()) : null;
  const choose = () => router.push('/rituals/craft/sea/station' as Href);

  return (
    <RitualScreen back="Sea" onRefresh={station ? () => fetchFor(station, units, true) : undefined}>
      <Title eyebrow="Sea">Tides</Title>
      <Body muted>The moon sets the rhythm of every shore. Springs and neaps hold anywhere in the world; high and low water times come from NOAA for US coasts.</Body>

      <Card accent>
        <Text style={type.eyebrow}>By the moon, everywhere</Text>
        <Text style={type.cardTitle}>{words.title}</Text>
        <Body>{words.body}</Body>
        <Body muted>
          Since the {PHASE_WORDS[stage.phase.phase]} on {shortDate(stage.phase.date)}.
        </Body>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>Springs and neaps ahead</SectionLabel>
        <Card>
          {ranges.map((r) => {
            const live = r.from.getTime() <= now.getTime();
            return (
              <View key={r.from.toISOString()} style={styles.range} accessible accessibilityLabel={`${r.range === 'spring' ? 'Spring tides' : 'Neap tides'}${live ? ', now' : ''}, biggest around ${shortDate(r.peak)}, after the ${PHASE_WORDS[r.phase.phase]}.${r.perigean ? ' King tides likely.' : ''}`}>
                <Text style={styles.rangeTitle}>
                  {r.range === 'spring' ? 'Springs' : 'Neaps'}
                  {live ? ' · now' : ''}
                </Text>
                <Body>
                  {r.range === 'spring' ? 'Biggest' : 'Smallest'} around {shortDate(r.peak)}, after the {PHASE_WORDS[r.phase.phase]} on {shortDate(r.phase.date)}.
                </Body>
                {r.perigean && <Notice>The moon is near its closest too: expect king tides, higher and lower than usual.</Notice>}
              </View>
            );
          })}
          <Body muted>Springs come a day or two after the new and full moon, neaps a day or two after the quarters. The exact day shifts a little from shore to shore.</Body>
        </Card>
      </View>

      <Expander title="Working with the tide">
        {TIDE_TIMING.map((t) => (
          <View key={t.title} style={ui.gapSmall}>
            <Text style={styles.rangeTitle}>{t.title}</Text>
            <Body>{t.body}</Body>
          </View>
        ))}
        <Body muted>Pair the two rhythms: a rising spring tide for the strongest drawing-in, an ebbing spring for the deepest release, and the neaps for slow, steady work.</Body>
      </Expander>

      <View style={ui.gap}>
        <SectionLabel>High and low water</SectionLabel>
        {!stationReady ? (
          <Body muted>Looking for your station…</Body>
        ) : !station ? (
          <Card>
            <Text style={type.cardTitle}>Choose a tide station</Text>
            <Body>
              Pick the NOAA station nearest your shore to see today’s and the next two days’ highs and lows.
              {place ? '' : ' Add your place and we’ll suggest the closest.'}
            </Body>
            <Body muted>NOAA predictions cover US coasts and territories for now. Elsewhere, the moon guide above still applies: check your national tide service or harbour office for times.</Body>
            <Button label="Choose a station" onPress={choose} />
          </Card>
        ) : (
          <>
            <List>
              <Row icon="calendar" title={stationLabel(station)} detail={`NOAA station ${station.id} · tap to change`} last onPress={choose} />
            </List>
            <Chips>
              <Chip label="Feet" selected={units === 'english'} onPress={() => changeUnits('english')} />
              <Chip label="Metres" selected={units === 'metric'} onPress={() => changeUnits('metric')} />
            </Chips>

            {water && (
              <Card accent>
                <Text style={type.eyebrow}>Now</Text>
                <Text style={type.cardTitle}>{NOW_WORDS[water.state]}</Text>
                <Body>
                  {water.state === 'rising' || water.state === 'falling'
                    ? `${water.next.kind === 'high' ? 'High' : 'Low'} water at ${water.next.clock}, in ${inWords(water.minutes)}. ${water.state === 'rising' ? 'A time to draw in.' : 'A time to let go.'}`
                    : `The water is turning (${water.next.clock}). A threshold hour.`}
                </Body>
              </Card>
            )}

            {loading && !result && <Body muted>Asking NOAA for the tides…</Body>}
            {!!problem && <Notice>{problem}</Notice>}
            {result?.offline && (
              <Notice>Offline: showing the copy saved {shortDate(result.fetchedAt)}. Pull down to try again.</Notice>
            )}

            {days.map((d) => (
              <Card key={d.day}>
                <Text style={type.eyebrow}>{dayHeading(d.day, now)}</Text>
                {d.events.map((e) => (
                  <View
                    key={e.time}
                    style={styles.event}
                    accessible
                    accessibilityLabel={`${e.kind === 'high' ? 'High' : 'Low'} water at ${e.clock}, ${height(e, units)}`}
                  >
                    <Text style={styles.clock}>{e.clock}</Text>
                    <Text style={[styles.kind, e.kind === 'high' && styles.high]}>{e.kind === 'high' ? 'High' : 'Low'}</Text>
                    <Text style={styles.height}>{height(e, units)}</Text>
                  </View>
                ))}
              </Card>
            ))}

            {!!result && (
              <Body muted>
                Times are local to the station{clockMatches ? '' : ', which keeps a different clock from your phone'}. Heights are above mean lower low water, the usual chart zero; a minus tide uncovers more shore than usual. NOAA predictions don’t include wind or storm surge.
              </Body>
            )}
          </>
        )}
      </View>

      <Card>
        <Text style={type.cardTitle}>Safe at the water</Text>
        {SEA_SAFETY.map((line) => (
          <Body key={line}>• {line}</Body>
        ))}
      </Card>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  range: { gap: 4 },
  rangeTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  event: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 32 },
  clock: { fontFamily: fonts.display, fontSize: 24, color: colors.cream, minWidth: 72 },
  kind: { fontFamily: fonts.body, fontSize: 15, color: colors.muted, flex: 1 },
  high: { color: colors.gold },
  height: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.parchment },
});
