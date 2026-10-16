// Keeps the Android Altar widget in step with your altars, and carries out what
// was tapped on it: each light, snuff, offering and cleansing done from the
// home screen is applied to the real altar, which then saves and syncs. Runs
// when the app opens or comes to the front, when your altars change, and
// straight away when the widget is tapped while the app is running.

import { Directory, File, Paths } from 'expo-file-system';
import { FlipType, ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useRef } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

import { altarsAt, burnoutTimes } from './altar/burnout';
import { altarDataFromDocument } from './altar/snapshot';
import { useAltars } from './altar/store';
import { applyWidgetActions, slotAltars, widgetAltar, type WidgetAltar } from './altarWidget';
import { hash, preparePictures, withoutEmpties } from './altarWidgetPictures';
import { reportAltarWidgetSync, useAltarWidgetSlots } from './altarWidgetSlots';
import { redrawAndroidWidgets } from './widgetSync.android';

/** Android phones draw widgets at about 3× (the iPhone's are made at 2×). */
const SCALE = 3;

/** A mirrored copy of a picture, for objects flipped on the altar. */
async function flipped(dir: Directory, uri: string, cache: Map<string, string>): Promise<string> {
  if (!uri) return uri;
  const known = cache.get(uri);
  if (known) return known;
  const file = new File(dir, `flip-${hash(uri)}.png`);
  try {
    if (!file.exists) {
      const image = await ImageManipulator.manipulate(uri).flip(FlipType.Horizontal).renderAsync();
      const saved = await image.saveAsync({ format: SaveFormat.PNG });
      new File(saved.uri).move(file);
    }
    cache.set(uri, file.uri);
    return file.uri;
  } catch {
    return uri;
  }
}

export function useAltarWidgetSync() {
  const { altars, save, status } = useAltars();
  const slots = useAltarWidgetSlots();
  const latest = useRef({ altars, save, slots, ready: false });
  useEffect(() => {
    latest.current = { altars, save, slots, ready: status === 'ready' || status === 'offline' || status === 'error' };
  });
  const running = useRef<Promise<void> | null>(null);
  const again = useRef(false);

  useEffect(() => {
    const run = async () => {
      const store = await import('../widgets/android/store');
      const { altars: current, save: saveAltar, slots: chosen, ready } = latest.current;
      if (!ready && current.length === 0) return;
      const now = new Date().toISOString();

      // First, what was done from the widget since last time.
      const actions = await store.readActions();
      let shown = current;
      if (actions.length) {
        const changed = applyWidgetActions(current, actions, now);
        for (const { altar, doc } of changed) await saveAltar({ id: altar.id, name: altar.name, doc });
        const updated = new Map(changed.map(({ altar, doc }) => [altar.id, { ...altar, ...altarDataFromDocument(doc, altar.name, now) }]));
        shown = current.map((a) => updated.get(a.id) ?? a);
        await store.clearActions(new Set(actions.map((a) => a.id)));
      }

      const placed = slotAltars(shown, chosen);
      const root = new Directory(Paths.document, 'widget');
      if (!root.exists) root.create({ intermediates: true, idempotent: true });
      const { pictures } = await preparePictures(root.uri, placed, SCALE);
      const dir = new Directory(root, 'flips');
      if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
      const flips = new Map<string, string>();

      // Now, and again at each moment a lit candle burns down.
      const start = new Date();
      const times = [start.getTime(), ...burnoutTimes(placed, start)];
      const entries: { date: string; value: WidgetAltar[] }[] = [];
      for (const t of times) {
        const when = new Date(t);
        const value: WidgetAltar[] = [];
        for (const altar of altarsAt(placed, when)) {
          const shownAltar = widgetAltar(altar, (path) => pictures.get(path) ?? '', when);
          for (const item of shownAltar.scene) if (item.flipped) item.image = await flipped(dir, item.image, flips);
          value.push(shownAltar);
        }
        entries.push({ date: when.toISOString(), value: withoutEmpties(value) });
      }
      await store.writeAltars(entries);
      await redrawAndroidWidgets(['AltarWidget']);
      reportAltarWidgetSync({ at: new Date().toISOString(), altars: placed.length, pictures: pictures.size, error: null });
    };

    const sync = () => {
      if (running.current) {
        again.current = true;
        return;
      }
      running.current = run()
        .catch((e) => {
          reportAltarWidgetSync({ at: new Date().toISOString(), altars: 0, pictures: 0, error: e instanceof Error ? e.message : String(e) });
        })
        .finally(() => {
          running.current = null;
          if (again.current) {
            again.current = false;
            sync();
          }
        });
    };

    sync();
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    const taps = DeviceEventEmitter.addListener('altarWidgetTapped', sync);
    return () => {
      appState.remove();
      taps.remove();
    };
  }, [altars, slots, status]);
}
