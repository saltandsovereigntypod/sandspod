// "Which altar": opens when an Altar widget is added (or long-pressed and
// reconfigured), like the iPhone widget's settings. Places 1–6 hold the altars
// chosen in the app (open an altar and tap Home screen).

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { WidgetConfigurationScreenProps } from 'react-native-android-widget';
import { useEffect, useState } from 'react';

import { ALTAR_WIDGET_SLOTS, altarAtPlace } from '../../lib/altarWidget';
import { renderAndroidWidget } from './render';
import { entryAt, readAltars, readPlaces, setPlace } from './store';

const ground = '#0c1510';
const cream = '#f4ecd8';
const gold = '#e2c36d';
const muted = '#cabf9d';

export function AltarWidgetConfigScreen({ widgetInfo, renderWidget, setResult }: WidgetConfigurationScreenProps) {
  const [names, setNames] = useState<string[]>([]);
  const [current, setCurrent] = useState(1);
  useEffect(() => {
    void (async () => {
      const [entries, places] = await Promise.all([readAltars(), readPlaces()]);
      const altars = entryAt(entries, new Date()) ?? [];
      setNames(Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => altarAtPlace(altars, i + 1)?.name ?? ''));
      setCurrent(places[String(widgetInfo.widgetId)] ?? 1);
    })();
  }, [widgetInfo.widgetId]);

  const choose = async (place: number) => {
    await setPlace(widgetInfo.widgetId, place);
    renderWidget(await renderAndroidWidget(widgetInfo));
    setResult('ok');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.eyebrow}>ALTAR WIDGET</Text>
      <Text style={styles.title}>Which altar</Text>
      <Text style={styles.body}>
        Choose which altar this widget shows. In the app, open an altar and tap Home screen to choose its place.
      </Text>
      <ScrollView contentContainerStyle={styles.list}>
        {Array.from({ length: ALTAR_WIDGET_SLOTS }, (_, i) => i + 1).map((place) => (
          <Pressable
            key={place}
            onPress={() => void choose(place)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, place === current && styles.rowOn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.place}>{`Altar ${place}`}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {names[place - 1] || 'Empty'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={() => setResult('cancel')} accessibilityRole="button" style={styles.cancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ground, padding: 24, paddingTop: 48, gap: 8 },
  eyebrow: { color: gold, letterSpacing: 2, fontSize: 12 },
  title: { color: cream, fontSize: 28, fontFamily: 'serif' },
  body: { color: muted, fontSize: 15, lineHeight: 21, marginBottom: 8 },
  list: { gap: 10, paddingVertical: 8 },
  row: { borderWidth: 1, borderColor: 'rgba(226,195,109,0.35)', borderRadius: 14, padding: 16, backgroundColor: '#13211a' },
  rowOn: { borderColor: gold },
  place: { color: gold, fontSize: 13, letterSpacing: 1 },
  name: { color: cream, fontSize: 18, fontFamily: 'serif', marginTop: 2 },
  cancel: { alignSelf: 'center', padding: 16 },
  cancelText: { color: gold, fontSize: 16 },
});
