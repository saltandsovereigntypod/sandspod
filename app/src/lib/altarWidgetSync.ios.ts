// Keeps the Altar widget in step with your altars, and carries out what was
// tapped on it: each light, snuff, offering and cleansing done from the home
// screen is applied to the real altar, which then saves and syncs as usual.
// Runs when the app opens or comes to the front, when your altars change, and
// straight away when the widget is tapped while the app is still running.

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { altarsAt, burnoutTimes } from './altar/burnout';
import { altarDataFromDocument } from './altar/snapshot';
import { useAltars } from './altar/store';
import { applyWidgetActions, burnStepTimes, slotAltars, widgetAltar, type AltarWidgetArt, type AltarWidgetProps, type WidgetAction } from './altarWidget';
import { preparePictures, withoutEmpties } from './altarWidgetPictures';
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

/** The pictures made last time, kept while the app runs. */
let lastPictures = new Map<string, string>();
let lastArt: AltarWidgetArt | undefined;

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
        // Now, and again as each lit candle burns shorter and at the moment it
        // burns down, so the widget shows it even if the app isn't opened.
        const times = timelineTimes(new Date());
        if (times.length === 1) return widget.updateSnapshot(propsAt(new Date(times[0])));
        widget.updateTimeline(times.map((t) => ({ date: new Date(t), props: propsAt(new Date(t)) })));
      };
      const timelineTimes = (start: Date) =>
        [...new Set([start.getTime(), ...burnoutTimes(placed, start), ...burnStepTimes(placed, start)])].sort((a, b) => a - b);

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
        const { pictures, art } = await preparePictures(widgets.widgetsDirectory, placed, undefined, timelineTimes(new Date()));
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
