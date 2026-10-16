import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, confirmAction, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import {
  deviceOffsetOn,
  formatOffset,
  formatTime,
  parseDate,
  parseOffset,
  parseTime,
  type ChartInput,
} from '../../../../../lib/craft/cosmic/chart';
import { CHART } from '../../../../../lib/craft/cosmic/collections';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { askDeviceLocation, usePlace } from '../../../../../lib/location';

const num = (s: string) => Number(s.trim().replace(',', '.'));

// The birth details behind My chart: date, time, the clock's UTC offset, and where.
export default function ChartEdit() {
  const { entries, ready } = useCraft<ChartInput>(CHART);
  const existing = entries[0] ?? null;
  const place = usePlace();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [useDevice, setUseDevice] = useState(true);
  const [offset, setOffset] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [label, setLabel] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const waitingForPlace = useRef(false);
  const filled = useRef(false);

  useEffect(() => {
    // Fill the form once, when the saved chart first arrives, so typing is never overwritten.
    if (!ready || filled.current) return;
    filled.current = true;
    const d = existing?.data;
    if (!d) return;
    setDate(d.date ?? '');
    setTime(d.time ?? '');
    setUseDevice(!!d.offsetFromDevice);
    setOffset(d.offsetFromDevice ? '' : formatOffset(d.utcOffsetMinutes).replace('UTC', '').replace('−', '-'));
    setLat(typeof d.latitude === 'number' ? String(d.latitude) : '');
    setLon(typeof d.longitude === 'number' ? String(d.longitude) : '');
    setLabel(d.placeLabel ?? '');
  }, [ready, existing]);

  useEffect(() => {
    if (waitingForPlace.current && place) {
      waitingForPlace.current = false;
      setLat(String(place.latitude));
      setLon(String(place.longitude));
      setMessage('Filled in from where you are now. Change it if you were born somewhere else.');
    }
  }, [place]);

  const validDate = parseDate(date);
  const deviceOffset = deviceOffsetOn(validDate ? date.trim() : '');

  const useHere = async () => {
    if (place) {
      setLat(String(place.latitude));
      setLon(String(place.longitude));
      setMessage('Filled in from your saved place. Change it if you were born somewhere else.');
      return;
    }
    setMessage('Finding where you are…');
    waitingForPlace.current = true;
    const result = await askDeviceLocation();
    if (result !== 'ok') {
      waitingForPlace.current = false;
      setMessage(
        result === 'denied'
          ? 'Location wasn’t allowed. You can enter your birthplace’s latitude and longitude below.'
          : 'Your phone’s location isn’t available here. Enter your birthplace’s latitude and longitude below.',
      );
    }
  };

  const save = async () => {
    setProblem(null);
    const d = parseDate(date);
    if (!d) return setProblem('Enter your birth date as year-month-day, for example 1990-06-15.');
    if (d.year < 1800 || d.year > 2050) return setProblem('Birth dates from 1800 to 2050 work best with these planet tables.');
    const t = time.trim() ? parseTime(time) : null;
    if (time.trim() && !t) return setProblem('Enter the time as hours and minutes, like 14:30 or 2:30 pm, or leave it blank.');
    const minutes = useDevice ? deviceOffset : parseOffset(offset);
    if (minutes === null) return setProblem('Enter the UTC offset at your birth, like +1, -5 or +5:30.');
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (lat.trim() || lon.trim()) {
      latitude = num(lat);
      longitude = num(lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        return setProblem('Latitude runs from -90 to 90 and longitude from -180 to 180. South and west are negative.');
      }
    }
    const data: ChartInput = {
      date: `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
      time: t ? formatTime(t) : '',
      utcOffsetMinutes: minutes,
      offsetFromDevice: useDevice,
      latitude,
      longitude,
      placeLabel: label.trim() || null,
    };
    setSaving(true);
    try {
      if (existing) await updateEntry(CHART, existing.id, data);
      else await addEntry(CHART, data);
      if (router.canGoBack()) router.back();
      else router.replace('/rituals/craft/cosmic/chart' as Href);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete your birth details?', 'Your chart will be cleared from this phone and your account.', 'Delete'))) return;
    await removeEntry(CHART, existing.id);
    if (router.canGoBack()) router.back();
  };

  return (
    <RitualScreen back="My chart">
      <Title eyebrow="My chart">Birth details</Title>
      <Body muted>Kept with your account, like the rest of your practice tools. Only the date is needed; time and place add your rising sign.</Body>

      <Card>
        <SectionLabel>When</SectionLabel>
        <Field label="Birth date (year-month-day)" value={date} onChange={setDate} placeholder="e.g. 1990-06-15" keyboardType="default" />
        <Field label="Birth time, if known" value={time} onChange={setTime} placeholder="e.g. 14:30 or 2:30 pm" />
        <Body muted>Use the clock time on your birth certificate. Leave it blank if you don’t know; your Sun and planets will still be right.</Body>
      </Card>

      <Card>
        <SectionLabel>Time zone at birth</SectionLabel>
        <Toggle
          label="Use my phone’s time zone"
          detail={validDate ? `${formatOffset(deviceOffset)} on that date, summer time included` : 'Its offset on your birth date'}
          value={useDevice}
          onChange={setUseDevice}
        />
        {!useDevice && <Field label="UTC offset at birth" value={offset} onChange={setOffset} placeholder="e.g. +1, -5 or +5:30" />}
        <Notice>
          The time zone matters. If you were born in another time zone from the one your phone is in now, or when summer time rules were different,
          enter the offset by hand: an hour out can change your rising sign. For births before standard time zones (around 1900), use local mean
          time: your longitude ÷ 15 hours.
        </Notice>
      </Card>

      <Card>
        <SectionLabel>Where</SectionLabel>
        <Button label="Use my current place" variant="outline" onPress={() => void useHere()} />
        <View style={ui.gap}>
          <Field label="Latitude" value={lat} onChange={setLat} placeholder="e.g. 51.51 (south is negative)" keyboardType="default" />
          <Field label="Longitude" value={lon} onChange={setLon} placeholder="e.g. -0.13 (west is negative)" keyboardType="default" />
          <Field label="Place name (optional)" value={label} onChange={setLabel} placeholder="e.g. London" />
        </View>
        <Body muted>Your birth town’s latitude and longitude, to two decimal places, are plenty. A map app will show them if you search the town.</Body>
        {!!message && <Notice>{message}</Notice>}
      </Card>

      {!!problem && <Notice>{problem}</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : 'Save'} onPress={() => void save()} disabled={saving} />
        {existing && <Button label="Delete birth details" variant="text" onPress={() => void remove()} />}
      </View>
    </RitualScreen>
  );
}
