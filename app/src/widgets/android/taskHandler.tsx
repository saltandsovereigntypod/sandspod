'use no memo';
// Runs when Android asks for a widget: when one is added, resized, refreshed
// (every 30 minutes) or tapped. A tap on the Altar widget changes the widget
// straight away and leaves the action for the app (lib/altarWidgetSync), as on
// iPhone; if the app is open it carries it out at once.

import { DeviceEventEmitter } from 'react-native';
import { requestWidgetUpdate, type WidgetTaskHandlerProps } from 'react-native-android-widget';

import { previewWidgetAction, type WidgetAction } from '../../lib/altarWidget';
import type { AltarClick } from './AltarWidgetAndroid';
import { renderAndroidWidget } from './render';
import { addAction, readAltars, setPlace, writeAltars } from './store';

export const WIDGET_TAPPED = 'altarWidgetTapped';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction } = props;
  if (widgetAction === 'WIDGET_DELETED') {
    if (widgetInfo.widgetName === 'AltarWidget') await setPlace(widgetInfo.widgetId, null);
    return;
  }
  if (widgetAction === 'WIDGET_CLICK' && props.clickAction === 'ALTAR' && props.clickActionData) {
    const click = props.clickActionData as unknown as AltarClick;
    const at = new Date().toISOString();
    const action: WidgetAction = { id: `${at}-${click.kind}-${click.key}`, altarId: click.altarId, kind: click.kind, key: click.key, at };
    await addAction(action);
    // Show it now, on every moment still to come.
    const entries = await readAltars();
    await writeAltars(entries.map((e) => ({ ...e, value: previewWidgetAction(e.value, action) })));
    DeviceEventEmitter.emit(WIDGET_TAPPED);
    // Any other Altar widget showing the same altar changes too.
    await requestWidgetUpdate({ widgetName: 'AltarWidget', renderWidget: (info) => renderAndroidWidget(info) });
    return;
  }
  props.renderWidget(await renderAndroidWidget(widgetInfo));
}
