// Keeps the Altar widget in step with your altars, and carries out what was
// tapped on it: each light, snuff, offering and cleansing done from the home
// screen is applied to the real altar, which then saves and syncs as usual.
// Runs when the app opens or comes to the front, when your altars change, and
// straight away when the widget is tapped while the app is still running.

import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { altarImageSource } from './altar/assets';
import { altarsAt, burnoutTimes } from './altar/burnout';
import { altarDataFromDocument } from './altar/snapshot';
import { useAltars } from './altar/store';
import type { SavedAltar } from './altar/types';
import { altarPictures, applyWidgetActions, slotAltars, widgetAltar, type AltarWidgetArt, type AltarWidgetProps, type WidgetAction } from './altarWidget';
import { reportAltarWidgetSync, useAltarWidgetSlots } from './altarWidgetSlots';

type WidgetsModule = typeof import('expo-widgets');
type AltarWidgetModule = typeof import('../widgets/AltarWidget');

// Builds without the widget extension don't have the native module.
function native(): { widget: AltarWidgetModule['default']; widgets: WidgetsModule } | string {
  try {
    /* eslint-disable @typescript-eslint/no-require-imports -- loaded lazily on purpose (see above) */
    const widget = (require('../widgets/AltarWidget') as AltarWidgetModule).default;
    const widgets = require('expo-widgets') as WidgetsModule;
    /* eslint-enable @typescript-eslint/no-require-imports */
    return { widget, widgets };
  } catch (e) {
    return `This version of the app has no widgets (${e instanceof Error ? e.message : String(e)}).`;
  }
}

function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** A local copy of a saved picture path, to shrink. */
async function localUri(path: string): Promise<string | null> {
  const source = altarImageSource(path);
  if (source == null) return null;
  if (typeof source === 'number') {
    const asset = Asset.fromModule(source);
    await asset.downloadAsync();
    return asset.localUri ?? asset.uri;
  }
  const uri = !Array.isArray(source) && typeof source === 'object' ? source.uri : undefined;
  if (!uri || uri.startsWith('data:')) return null;
  if (/^https?:/i.test(uri)) {
    const dir = new Directory(Paths.cache, 'widget-downloads');
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const target = new File(dir, `${hash(uri)}`);
    if (!target.exists) await File.downloadFileAsync(uri, target);
    return target.uri;
  }
  return uri;
}

/** The widget's own artwork: flames, light and the shading behind its words and buttons. */
const WIDGET_ART: Record<Required<keyof AltarWidgetArt>, number> = {
  flame: require('../../assets/widget/flame.png'),
  halo: require('../../assets/widget/halo.png'),
  pool: require('../../assets/widget/pool.png'),
  scrimTop: require('../../assets/widget/scrim-top.png'),
  scrimBottom: require('../../assets/widget/scrim-bottom.png'),
  panel: require('../../assets/widget/panel.png'),
  button: require('../../assets/widget/button.png'),
  buttonGold: require('../../assets/widget/button-gold.png'),
  pill: require('../../assets/widget/pill.png'),
  pillGold: require('../../assets/widget/pill-gold.png'),
};

/**
 * Copies of the pictures in the folder the widget can read, each made just big
 * enough for its size on the widget (iOS refuses pictures far bigger than the
 * widget). Made once and kept; ones no longer shown are cleared away.
 */
async function preparePictures(root: string, altars: SavedAltar[]): Promise<{ pictures: Map<string, string>; art: AltarWidgetArt }> {
  const dir = new Directory(root, 'altar');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const pictures = new Map<string, string>();
  const keep = new Set<string>();

  const art = {} as AltarWidgetArt;
  for (const [name, module] of Object.entries(WIDGET_ART) as [keyof AltarWidgetArt, number][]) {
    const file = new File(dir, `art-${name}.png`);
    keep.add(file.name);
    try {
      if (!file.exists) {
        const asset = Asset.fromModule(module);
        await asset.downloadAsync();
        new File(asset.localUri ?? asset.uri).copy(file);
      }
      art[name] = file.uri;
    } catch {
      art[name] = '';
    }
  }

  for (const altar of altars) {
    for (const { id, path, width, crop } of altarPictures(altar)) {
      if (pictures.has(id)) continue;
      const isBackground = !!crop;
      const name = `${hash(`${id}|${crop ? [crop.x, crop.y, crop.w, crop.h].map((v) => v.toFixed(4)).join(',') : ''}`)}-${width}${isBackground ? '.jpg' : '.png'}`;
      const file = new File(dir, name);
      try {
        if (!file.exists) {
          const uri = await localUri(path);
          if (!uri) continue;
          let source: string | ImageRef = uri;
          if (crop) {
            // Cut out just what this widget size shows (in the picture's own pixels).
            const full = await ImageManipulator.manipulate(uri).renderAsync();
            const x = Math.max(0, Math.round(crop.x * full.width));
            const y = Math.max(0, Math.round(crop.y * full.height));
            const w = Math.min(full.width - x, Math.round(crop.w * full.width));
            const h = Math.min(full.height - y, Math.round(crop.h * full.height));
            source = await ImageManipulator.manipulate(full).crop({ originX: x, originY: y, width: w, height: h }).renderAsync();
          }
          const image = await ImageManipulator.manipulate(source).resize({ width }).renderAsync();
          const saved = await image.saveAsync(isBackground ? { format: SaveFormat.JPEG, compress: 0.85 } : { format: SaveFormat.PNG });
          new File(saved.uri).move(file);
        }
        pictures.set(id, file.uri);
        keep.add(file.name);
      } catch {
        // A picture that can't be made is simply left out of the scene.
      }
    }
  }
  for (const entry of dir.list()) {
    if (entry instanceof File && !keep.has(entry.name)) {
      try {
        entry.delete();
      } catch {
        // Not worth stopping for.
      }
    }
  }
  return { pictures, art };
}

/** The pictures made last time, kept while the app runs. */
let lastPictures = new Map<string, string>();
let lastArt: AltarWidgetArt | undefined;

/** The widget's storage only holds plain values: drop nulls and undefined anywhere in the props. */
function withoutEmpties<T>(value: T): T {
  if (Array.isArray(value)) return value.filter((v) => v != null).map(withoutEmpties) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v != null && !(typeof v === 'number' && !Number.isFinite(v)))
        .map(([k, v]) => [k, withoutEmpties(v)]),
    ) as T;
  }
  return value;
}

async function pendingActions(widget: AltarWidgetModule['default']): Promise<WidgetAction[]> {
  try {
    // A tap is kept on whichever entry was showing; gather them from every entry.
    const timeline = await widget.getTimeline();
    const seen = new Set<string>();
    const actions: WidgetAction[] = [];
    for (const entry of timeline) {
      const list = (entry?.props as AltarWidgetProps | undefined)?.actions;
      if (!Array.isArray(list)) continue;
      for (const action of list) {
        if (!action || seen.has(action.id)) continue;
        seen.add(action.id);
        actions.push(action);
      }
    }
    return actions;
  } catch {
    return [];
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
    const parts = native();
    if (typeof parts === 'string') {
      reportAltarWidgetSync({ at: new Date().toISOString(), altars: 0, pictures: 0, error: parts });
      return;
    }
    const { widget, widgets } = parts;

    const run = async () => {
      const { altars: current, save: saveAltar, slots: chosen, ready } = latest.current;
      // Cached altars are good enough to show; wait only while nothing has loaded yet.
      if (!ready && current.length === 0) return;
      const now = new Date().toISOString();
      const report = (pictures: number, error: string | null, count: number) =>
        reportAltarWidgetSync({ at: new Date().toISOString(), altars: count, pictures, error });

      // First, what was done from the widget since last time.
      const actions = await pendingActions(widget);
      let shown = current;
      if (actions.length) {
        const changed = applyWidgetActions(current, actions, now);
        for (const { altar, doc } of changed) {
          await saveAltar({ id: altar.id, name: altar.name, doc });
        }
        // Until the store catches up, show the altars as they now are.
        const updated = new Map(changed.map(({ altar, doc }) => [altar.id, { ...altar, ...altarDataFromDocument(doc, altar.name, now) }]));
        shown = current.map((a) => updated.get(a.id) ?? a);
      }

      const placed = slotAltars(shown, chosen);
      const done = new Set(actions.map((a) => a.id));
      const send = async (pictures: Map<string, string>, art?: AltarWidgetArt) => {
        // Keep anything tapped while this was running, for next time.
        const kept = (await pendingActions(widget)).filter((a) => !done.has(a.id));
        const propsAt = (when: Date): AltarWidgetProps => {
          const props: AltarWidgetProps = {
            altars: altarsAt(placed, when).map((altar) => widgetAltar(altar, (path) => pictures.get(path) ?? '', when)),
            actions: kept,
          };
          if (art) props.art = art;
          return withoutEmpties(props);
        };
        // Now, and again at each moment a lit candle burns down, so the widget
        // shows it going out even if the app isn't opened.
        const start = new Date();
        const times = burnoutTimes(placed, start);
        if (!times.length) return widget.updateSnapshot(propsAt(start));
        widget.updateTimeline([start.getTime(), ...times].map((t) => ({ date: new Date(t), props: propsAt(new Date(t)) })));
      };

      // The altars go to the widget straight away with the pictures made last time
      // (so a tap on the widget never leaves it without its buttons and shading);
      // any new pictures follow.
      let firstError: string | null = null;
      try {
        await send(lastPictures, lastArt);
      } catch (e) {
        firstError = e instanceof Error ? e.message : String(e);
      }
      report(0, firstError, placed.length);
      try {
        if (!widgets.widgetsDirectory) throw new Error('the shared widget folder is unavailable');
        const { pictures, art } = await preparePictures(widgets.widgetsDirectory, placed);
        lastPictures = pictures;
        lastArt = art;
        await send(pictures, art);
        report(pictures.size, null, placed.length);
      } catch (e) {
        report(0, `${firstError ? `${firstError}; ` : ''}Pictures: ${e instanceof Error ? e.message : String(e)}`, placed.length);
      }
    };

    const sync = () => {
      if (running.current) {
        again.current = true;
        return;
      }
      running.current = run()
        .catch((e) => {
          // The widget is a nicety; never let it disturb the app, but say what went wrong.
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
    const taps = widgets.addUserInteractionListener((event) => {
      if (event.source === 'AltarWidget') sync();
    });
    return () => {
      appState.remove();
      taps.remove();
    };
    // Reruns whenever the altars or their places change; `latest` holds them.
  }, [altars, slots, status]);
}
