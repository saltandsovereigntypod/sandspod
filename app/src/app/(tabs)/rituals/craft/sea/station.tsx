import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { loadChosenStation, loadStations, OfflineError, saveChosenStation } from '../../../../../lib/craft/sea/noaa';
import { NEAR_ENOUGH_KM, nearestStations, searchStations, stationLabel, type Station } from '../../../../../lib/craft/sea/tides';
import { askDeviceLocation, usePlace } from '../../../../../lib/location';

const kmWords = (km: number) => (km < 1 ? 'under 1 km away' : `${Math.round(km)} km away`);

// Choose the NOAA tide station for your shore: nearest to your place, or by name.
export default function TideStation() {
  const place = usePlace();
  const [stations, setStations] = useState<Station[] | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<Station | null>(null);
  const [locating, setLocating] = useState(false);
  const [locateNote, setLocateNote] = useState<string | null>(null);

  const fetchList = useCallback(
    () =>
      loadStations().then(
        (list) => {
          setStations(list);
          setProblem(null);
        },
        (e) =>
          setProblem(
            e instanceof OfflineError
              ? 'Couldn’t reach NOAA for the station list. Check your connection and try again; once it’s fetched it stays on your phone.'
              : 'NOAA’s station list didn’t come back as expected. Try again in a little while.',
          ),
      ),
    [],
  );

  useEffect(() => {
    void fetchList();
    void loadChosenStation().then(setChosen);
  }, [fetchList]);

  const nearest = useMemo(() => (stations && place ? nearestStations(stations, place.latitude, place.longitude, 6) : []), [stations, place]);
  const results = useMemo(() => (stations ? searchStations(stations, query) : []), [stations, query]);
  const farAway = nearest.length > 0 && nearest[0].km > NEAR_ENOUGH_KM;

  const pick = async (s: Station) => {
    const { id, name, state, lat, lng, tz } = s;
    await saveChosenStation({ id, name, state, lat, lng, tz });
    if (router.canGoBack()) router.back();
    else router.replace('/rituals/craft/sea/tides');
  };

  const locate = async () => {
    setLocating(true);
    setLocateNote(null);
    const r = await askDeviceLocation();
    setLocating(false);
    if (r === 'denied') setLocateNote('Location wasn’t allowed. You can search by name instead, or set your place in Today → Sky.');
    if (r === 'unavailable') setLocateNote('Your phone’s location isn’t available here. Search by name instead, or set your place in Today → Sky.');
  };

  return (
    <RitualScreen back="Tides">
      <Title eyebrow="Tides">Tide station</Title>
      <Body muted>NOAA predicts the tides at about 3,500 places on US coasts, islands and territories. Choose the one nearest the shore you work at.</Body>

      {chosen && <Body muted>Now using {stationLabel(chosen)}.</Body>}

      {!stations && !problem && <Body muted>Fetching NOAA’s station list…</Body>}
      {!!problem && (
        <Card>
          <Notice>{problem}</Notice>
          <Button
            label="Try again"
            variant="outline"
            onPress={() => {
              setProblem(null);
              void fetchList();
            }}
          />
        </Card>
      )}

      {stations && (
        <>
          {place ? (
            <View style={ui.gapSmall}>
              <SectionLabel>Nearest to you</SectionLabel>
              {farAway && (
                <Notice>
                  The closest NOAA station is {Math.round(nearest[0].km)} km away, so its times won’t match your shore. Predictions are US-only for now; the springs and neaps on the Tides page still hold wherever you are, and your national tide service or harbour office will have local times.
                </Notice>
              )}
              <List>
                {nearest.map((s, i, all) => (
                  <Row
                    key={s.id}
                    icon="calendar"
                    title={stationLabel(s)}
                    detail={`${kmWords(s.km)}${chosen?.id === s.id ? ' · chosen' : ''}`}
                    last={i === all.length - 1}
                    onPress={() => pick(s)}
                  />
                ))}
              </List>
            </View>
          ) : (
            <Card>
              <Body>Share your location to see the stations nearest you. It stays on this phone, rounded to about a kilometre.</Body>
              <Button label={locating ? 'Finding you…' : 'Use my location'} disabled={locating} onPress={locate} />
              {!!locateNote && <Notice>{locateNote}</Notice>}
            </Card>
          )}

          <View style={ui.gap}>
            <SectionLabel>Search by name</SectionLabel>
            <Field label="Station, bay or town" value={query} onChange={setQuery} placeholder="Monterey, The Battery, Bar Harbor…" />
            {!!query.trim() &&
              (results.length ? (
                <List>
                  {results.map((s, i, all) => (
                    <Row
                      key={s.id}
                      icon="calendar"
                      title={stationLabel(s)}
                      detail={`Station ${s.id}${chosen?.id === s.id ? ' · chosen' : ''}`}
                      last={i === all.length - 1}
                      onPress={() => pick(s)}
                    />
                  ))}
                </List>
              ) : (
                <Body muted>No NOAA station by that name. Try a nearby town or bay.</Body>
              ))}
          </View>

          {chosen && (
            <Button
              label="Stop using a station"
              variant="text"
              onPress={async () => {
                await saveChosenStation(null);
                setChosen(null);
              }}
            />
          )}
        </>
      )}
    </RitualScreen>
  );
}
