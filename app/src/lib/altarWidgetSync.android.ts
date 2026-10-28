// Keeps the Android Altar widget in step with your altars (and the coven altars
// you've put on it), and carries out what was tapped on it: each light, snuff,
// offering and cleansing done from the home screen is applied to the real
// altar, which then saves and syncs (lib/altarWidgetPlan). Runs
// when the app opens or comes to the front, when your altars change, and
// straight away when the widget is tapped while the app is running.

import { Directory, File, Paths } from 'expo-file-system';
import { FlipType, ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useRef } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

import { altarsAt, burnoutTimes } from './altar/burnout';
import { useAltars } from './altar/store';
import { burnStepTimes, widgetAltar, type WidgetAltar } from './altarWidget';
import { planAltarWidget } from './altarWidgetPlan';
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
  // Coven altars are fetched again when the app opens or comes to the front, or the widget is tapped.
  const fresh = useRef(true);

  useEffect(() => {
    const run = async () => {
      const store = await import('../widgets/android/store');
      const { altars: current, save: saveAltar, slots: chosen, ready } = latest.current;
      if (!ready && current.length === 0) return;

      // First, what was done from the widget since last time; then the altars for each place.
      const actions = await store.readActions();
      const wantFresh = fresh.current;
      fresh.current = false;
      const { placed, done, dress } = await planAltarWidget({ altars: current, chosen, actions, save: saveAltar, fresh: wantFresh });
      if (done.size) await store.clearActions(done);

      const root = new Directory(Paths.document, 'widget');
      if (!root.exists) root.create({ intermediates: true, idempotent: true });
      // Now, and again as each lit candle burns shorter and at the moment it burns down.
      const start = new Date();
      const times = [...new Set([start.getTime(), ...burnoutTimes(placed, start), ...burnStepTimes(placed, start)])].sort((a, b) => a - b);
      const { pictures } = await preparePictures(root.uri, placed, SCALE, times);
      const dir = new Directory(root, 'flips');
      if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
      const flips = new Map<string, string>();

      const entries: { date: string; value: WidgetAltar[] }[] = [];
      for (const t of times) {
        const when = new Date(t);
        const value: WidgetAltar[] = [];
        for (const altar of altarsAt(placed, when)) {
          const shownAltar = dress(widgetAltar(altar, (path) => pictures.get(path) ?? '', when));
          for (const item of shownAltar.scene) {
            if (!item.flipped) continue;
            item.image = await flipped(dir, item.image, flips);
            // Its pieces and dressings too, mirrored across the box.
            for (const o of item.overlays) {
              o.image = await flipped(dir, o.image, flips);
              o.rect = { ...o.rect, x: 1 - o.rect.x - o.rect.w };
            }
          }
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
      if (state !== 'active') return;
      fresh.current = true;
      sync();
    });
    const taps = DeviceEventEmitter.addListener('altarWidgetTapped', () => {
      fresh.current = true;
      sync();
    });
    return () => {
      appState.remove();
      taps.remove();
    };
  }, [altars, slots, status]);
}
