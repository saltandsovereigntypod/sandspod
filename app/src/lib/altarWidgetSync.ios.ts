// Keeps the Altar widget in step with your altars, and carries out what was
// tapped on it: each light, snuff, offering and cleansing done from the home
// screen is applied to the real altar, which then saves and syncs as usual.
// Runs when the app opens or comes to the front, when your altars change, and
// straight away when the widget is tapped while the app is still running.

import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { altarImageSource } from './altar/assets';
import { altarDataFromDocument } from './altar/snapshot';
import { useAltars } from './altar/store';
import type { SavedAltar } from './altar/types';
import { altarImagePaths, applyWidgetActions, slotAltars, widgetAltar, type AltarWidgetProps, type WidgetAction } from './altarWidget';
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

/**
 * Small copies of the pictures in the folder the widget can read. iOS leaves a
 * widget blank if any picture in it has more pixels than the widget itself, so
 * the background stays well under a small widget's size and objects are thumbnails.
 * Made once and kept; ones no longer shown are cleared away.
 */
async function preparePictures(root: string, altars: SavedAltar[]): Promise<Map<string, string>> {
  const dir = new Directory(root, 'altar');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const out = new Map<string, string>();
  for (const altar of altars) {
    const paths = altarImagePaths(altar);
    for (const [i, path] of paths.entries()) {
      if (out.has(path)) continue;
      const isBackground = i === 0 && path === altar.background;
      const name = `${hash(path)}${isBackground ? '-bg480.jpg' : '-96.png'}`;
      const file = new File(dir, name);
      try {
        if (!file.exists) {
          const uri = await localUri(path);
          if (!uri) continue;
          const image = await ImageManipulator.manipulate(uri)
            .resize({ width: isBackground ? 480 : 96 })
            .renderAsync();
          const saved = await image.saveAsync(isBackground ? { format: SaveFormat.JPEG, compress: 0.8 } : { format: SaveFormat.PNG });
          new File(saved.uri).move(file);
        }
        out.set(path, file.uri);
      } catch {
        // A picture that can't be made just leaves its symbol in the widget.
      }
    }
  }
  const keep = new Set([...out.values()].map((uri) => uri.split('/').pop()));
  for (const entry of dir.list()) {
    if (entry instanceof File && !keep.has(entry.name)) {
      try {
        entry.delete();
      } catch {
        // Not worth stopping for.
      }
    }
  }
  return out;
}

async function pendingActions(widget: AltarWidgetModule['default']): Promise<WidgetAction[]> {
  try {
    const timeline = await widget.getTimeline();
    const latest = timeline[timeline.length - 1]?.props as AltarWidgetProps | undefined;
    return Array.isArray(latest?.actions) ? latest!.actions : [];
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
      const send = async (pictures: Map<string, string>) => {
        const props: AltarWidgetProps = {
          altars: placed.map((altar) => widgetAltar(altar, (path) => pictures.get(path) ?? '', new Date())),
          // Keep anything tapped while this was running, for next time.
          actions: (await pendingActions(widget)).filter((a) => !done.has(a.id)),
        };
        widget.updateSnapshot(props);
      };

      // The altars go to the widget straight away; pictures follow, so a picture
      // that can't be made never leaves the widget empty.
      await send(new Map());
      report(0, null, placed.length);
      try {
        if (!widgets.widgetsDirectory) throw new Error('the shared widget folder is unavailable');
        const pictures = await preparePictures(widgets.widgetsDirectory, placed);
        await send(pictures);
        report(pictures.size, null, placed.length);
      } catch (e) {
        report(0, `Pictures: ${e instanceof Error ? e.message : String(e)}`, placed.length);
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
