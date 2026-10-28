// Your location (`sky.place`, kept on this phone only): from the phone, or
// typed by hand. Used by Today, the sky, tides, weather, seasons and
// planetary hours. Shown in Settings → Location & hemisphere.

import { useState } from 'react';
import { Text } from 'react-native';

import { askDeviceLocation, clearPlace, setManualPlace } from '../../lib/location';
import { type } from '../../theme';
import { Button } from '../Button';
import { Card, Field, Notice } from './ui';

export function LocationForm({ hasPlace, source }: { hasPlace: boolean; source?: 'device' | 'manual' }) {
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
