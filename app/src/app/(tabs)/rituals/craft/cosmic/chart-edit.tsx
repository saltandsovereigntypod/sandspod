import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Term, TermText } from '../../../../../components/astro/Explain';
import { Body, Card, Chip, Chips, confirmAction, Expander, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { offsetForBirth, offsetLabel, offsetNote } from '../../../../../lib/astro/birth';
import { placeLabel, PLACES_CREDIT, searchPlaces, type Place } from '../../../../../lib/astro/places';
import { cityData } from '../../../../../lib/astro/placesData';
import { deleteChart, saveChart, useAstro } from '../../../../../lib/astro/store';
import { localMeanTimeOffset, zonesWork } from '../../../../../lib/astro/time';
import type { SavedChart } from '../../../../../lib/astro/vault';
import { formatTime, parseDate, parseOffset, parseTime, type ChartInput } from '../../../../../lib/craft/cosmic/chart';
import { colors, fonts, type } from '../../../../../theme';

const num = (s: string) => Number(s.trim().replace(',', '.'));

// Birth details for a chart: whose it is, the date, the time if known, and
// the birthplace from the bundled list of towns (which brings its time
// zone, so the offset at that moment is worked out, summer time included).
export default function ChartEdit() {
  const { id, relation } = useLocalSearchParams<{ id?: string; relation?: string }>();
  const astro = useAstro();
  if (astro.phase === 'loading') {
    return (
      <RitualScreen back="Charts">
        <Title eyebrow="Charts">Birth details</Title>
      </RitualScreen>
    );
  }
  if (astro.phase === 'locked') {
    return (
      <RitualScreen back="Charts">
        <Title eyebrow="Charts">Birth details</Title>
        <Card>
          <Body>Your charts are kept with your account under a passphrase. Open them first.</Body>
          <Button label="Open my charts" onPress={() => router.replace('/rituals/craft/cosmic/keep' as Href)} />
        </Card>
      </RitualScreen>
    );
  }
  const existing = id ? (astro.data.charts.find((c) => c.id === id) ?? null) : null;
  const hasMe = astro.data.charts.some((c) => c.relation === 'me' && c.id !== id);
  return <ChartForm key={existing?.id ?? 'new'} existing={existing} startAsMe={existing ? existing.relation === 'me' : relation === 'me' || (!hasMe && relation !== 'other')} />;
}

function ChartForm({ existing, startAsMe }: { existing: SavedChart | null; startAsMe: boolean }) {
  const d = existing?.input;
  const [name, setName] = useState(existing?.name ?? (startAsMe ? 'Me' : ''));
  const [me, setMe] = useState(startAsMe);
  const [date, setDate] = useState(d?.date ?? '');
  const [time, setTime] = useState(d?.time ?? '');
  const [noTime, setNoTime] = useState(!!d && !d.time);
  const [query, setQuery] = useState('');
  const [place, setPlace] = useState<{ label: string; latitude: number; longitude: number; zone: string | null; country: string | null } | null>(
    d && typeof d.latitude === 'number' && typeof d.longitude === 'number'
      ? { label: d.placeLabel ?? `${d.latitude.toFixed(2)}°, ${d.longitude.toFixed(2)}°`, latitude: d.latitude, longitude: d.longitude, zone: d.zone ?? null, country: d.country ?? null }
      : null,
  );
  const [override, setOverride] = useState(!!d?.offsetOverridden || (!!d && !d.zone));
  const [offsetText, setOffsetText] = useState(d ? offsetLabel(d.utcOffsetMinutes).replace('UTC', '').replace('−', '-') : '');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const zonesOk = useMemo(() => zonesWork(), []);
  const results = useMemo(() => (query.trim().length >= 2 ? searchPlaces(cityData(), query, 8) : []), [query]);
  const validDate = parseDate(date);
  const validTime = noTime ? null : parseTime(time);
  const fromZone = useMemo(
    () => (place?.zone && validDate && zonesOk ? offsetForBirth(date, validTime ? formatTime(validTime) : null, place.zone) : null),
    [place, date, validDate, validTime, zonesOk],
  );
  const note = fromZone ? offsetNote(fromZone) : null;
  const preStandard = !!validDate && validDate.year < 1890;

  const choose = (p: Place) => {
    setPlace({ label: placeLabel(p), latitude: p.latitude, longitude: p.longitude, zone: p.zone, country: p.countryCode });
    setQuery('');
  };
  const useCoordinates = () => {
    const la = num(lat);
    const lo = num(lon);
    if (!Number.isFinite(la) || !Number.isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) {
      setProblem('Latitude runs from -90 to 90 and longitude from -180 to 180. South and west are negative.');
      return;
    }
    setProblem(null);
    setPlace({ label: `${la.toFixed(2)}°, ${lo.toFixed(2)}°`, latitude: la, longitude: lo, zone: null, country: null });
    setOverride(true);
  };

  const save = async () => {
    setProblem(null);
    const dd = parseDate(date);
    if (!dd) return setProblem('Enter the birth date as year-month-day, for example 1990-06-15.');
    if (dd.year < 1800 || dd.year > 2050) return setProblem('Birth dates from 1800 to 2050 work with these planet tables.');
    const t = noTime || !time.trim() ? null : parseTime(time);
    if (!noTime && time.trim() && !t) return setProblem('Enter the time as hours and minutes, like 14:30 or 2:30 pm, or choose “I don’t know the time”.');
    let minutes: number | null = null;
    if (override || !fromZone) minutes = parseOffset(offsetText);
    else minutes = fromZone.offsetMinutes;
    if (minutes === null) {
      if (place && !place.zone) return setProblem('Enter the UTC offset at the birth, like +1, -5 or +5:30.');
      if (!place) return setProblem('Choose the birthplace, or enter the UTC offset at the birth, like +1 or -5.');
      return setProblem('Enter the UTC offset at the birth, like +1, -5 or +5:30.');
    }
    const input: ChartInput = {
      date: `${dd.year}-${String(dd.month).padStart(2, '0')}-${String(dd.day).padStart(2, '0')}`,
      time: t ? formatTime(t) : '',
      utcOffsetMinutes: minutes,
      offsetFromDevice: false,
      zone: place?.zone ?? null,
      offsetOverridden: override,
      country: place?.country ?? null,
      latitude: place?.latitude ?? null,
      longitude: place?.longitude ?? null,
      placeLabel: place?.label ?? null,
    };
    setSaving(true);
    try {
      const id = await saveChart({ id: existing?.id, name: name.trim() || (me ? 'Me' : 'A chart'), relation: me ? 'me' : 'other', input, note: existing?.note });
      router.replace({ pathname: '/rituals/craft/cosmic/chart', params: { id } } as unknown as Href);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'Couldn’t save just now.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction(`Delete ${existing.name}’s chart?`, 'The birth details are deleted from this device, and from your account if you keep your charts there.', 'Delete'))) return;
    await deleteChart(existing.id);
    router.replace('/rituals/craft/cosmic/charts' as Href);
  };

  return (
    <RitualScreen back="Charts">
      <Title eyebrow="Charts">{existing ? `${existing.name}’s birth details` : 'A new chart'}</Title>
      <Body muted>Birth details are private: encrypted on this device, and only sent to your account if you choose a passphrase (see How your charts are kept).</Body>

      <Card>
        <SectionLabel>Whose chart</SectionLabel>
        <Field label="Name" value={name} onChange={setName} placeholder="e.g. Me, or a friend’s name" />
        <Chips>
          <Chip label="Mine" selected={me} onPress={() => setMe(true)} />
          <Chip label="Someone else’s" selected={!me} onPress={() => setMe(false)} />
        </Chips>
        {!me && <Body muted>Only add someone’s chart with their blessing. It stays with you; nobody else can see it.</Body>}
      </Card>

      <Card>
        <SectionLabel>When</SectionLabel>
        <Field label="Birth date (year-month-day)" value={date} onChange={setDate} placeholder="e.g. 1990-06-15" />
        <Toggle label="I don’t know the time" detail="The planets will still be right; there are no houses or rising sign" value={noTime} onChange={setNoTime} />
        {!noTime && <Field label="Birth time" value={time} onChange={setTime} placeholder="e.g. 14:30 or 2:30 pm" />}
        {!noTime && (
          <TermText
            style={type.caption}
            text="Use the clock time on the birth certificate if you can. Four minutes of clock time move the Ascendant about a degree, and the Moon moves about half a degree an hour."
          />
        )}
      </Card>

      <Card>
        <SectionLabel>Where</SectionLabel>
        {place ? (
          <View style={styles.place}>
            <Text style={type.cardTitle}>{place.label}</Text>
            <Body muted>{`${place.latitude.toFixed(3)}°, ${place.longitude.toFixed(3)}°${place.zone ? ` · ${place.zone}` : ''}`}</Body>
            <Button label="Choose another place" variant="text" onPress={() => setPlace(null)} />
          </View>
        ) : (
          <>
            <Field label="Search for the town or city" value={query} onChange={setQuery} placeholder="e.g. Manchester, or Springfield, Illinois" />
            {results.map((p) => (
              <Pressable key={`${p.name}-${p.latitude}-${p.longitude}`} accessibilityRole="button" onPress={() => choose(p)} style={({ pressed }) => [styles.result, pressed && { opacity: 0.7 }]}>
                <Text style={styles.resultName}>{p.name}</Text>
                <Text style={type.caption}>{[p.region, p.country].filter(Boolean).join(', ')}</Text>
              </Pressable>
            ))}
            {query.trim().length >= 2 && results.length === 0 && <Body muted>No town by that name in the list (towns of 15,000 people or more). Try the nearest larger town, or enter the coordinates.</Body>}
            <Expander title="Enter coordinates instead">
              <Field label="Latitude" value={lat} onChange={setLat} placeholder="e.g. 51.51 (south is negative)" />
              <Field label="Longitude" value={lon} onChange={setLon} placeholder="e.g. -0.13 (west is negative)" />
              <Button label="Use these coordinates" variant="outline" onPress={useCoordinates} />
              <Body muted>With coordinates you’ll need to enter the UTC offset at the birth yourself.</Body>
            </Expander>
          </>
        )}
        <Text style={type.caption}>{PLACES_CREDIT}</Text>
      </Card>

      <Card>
        <SectionLabel>Time zone at the birth</SectionLabel>
        {fromZone && !override ? (
          <>
            <Text style={type.cardTitle}>{offsetLabel(fromZone.offsetMinutes)}</Text>
            <Body muted>{`Worked out from ${place?.zone} for that date${validTime ? ' and time' : ''}, summer time included.`}</Body>
            {!!note && <Notice>{note}</Notice>}
          </>
        ) : (
          <>
            <Field label="UTC offset at the birth" value={offsetText} onChange={setOffsetText} placeholder="e.g. +1, -5 or +5:30" />
            {!zonesOk && <Notice>This device can’t look up historical time zones, so enter the offset by hand.</Notice>}
          </>
        )}
        {fromZone && (
          <Toggle
            label="Set the offset myself"
            detail="If the record shows a different clock time (wartime or local time), enter it by hand"
            value={override}
            onChange={(v) => {
              setOverride(v);
              if (v && fromZone) setOffsetText(offsetLabel(fromZone.offsetMinutes).replace('UTC', '').replace('−', '-'));
            }}
          />
        )}
        {preStandard && place && (
          <Body muted>{`Before standard time zones, most places kept local mean time. Here that is about ${offsetLabel(localMeanTimeOffset(place.longitude))}.`}</Body>
        )}
        <Text style={type.caption}>
          {'An hour out moves the '}
          <Term id="ascendant">rising sign</Term>
          {' about 15°, often a whole sign. The offset comes from the world time-zone database, which is very good from 1970 and good before; if a family record says otherwise, trust the record.'}
        </Text>
      </Card>

      {!!problem && <Notice>{problem}</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : 'Save'} onPress={() => void save()} disabled={saving} />
        {existing && <Button label="Delete this chart" variant="text" onPress={() => void remove()} />}
      </View>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  place: { gap: 4 },
  result: { minHeight: 52, justifyContent: 'center', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  resultName: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
});
