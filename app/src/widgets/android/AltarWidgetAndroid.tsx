'use no memo';
// The Android Altar widget: the iPhone's Altar widget (src/widgets/AltarWidget.tsx)
// drawn with Android's widget building blocks. The same scene (the app's
// placements, sizes, turns, flips and layers, flames and pools of light), the
// same words and the same buttons. A tap is handled by the widget task
// (./taskHandler), which changes the widget straight away and leaves the action
// for the app to carry out on the real altar.

import { FlexWidget, ImageWidget, OverlapWidget, type ImageWidgetSource } from 'react-native-android-widget';

import { WIDGET_VIEWS, type SceneItem, type WidgetActionKind, type WidgetAltar, type WidgetSize } from '../../lib/altarWidget';
import { WIDGET_ART } from '../../lib/altarWidgetPictures';
import { cream, gold, Icon, muted, night, serif, Spacer, whenText, Words, type Box } from './look';

const src = (uri: string) => uri as unknown as ImageWidgetSource;

/** What a tap on the Altar widget asks for (read by ./taskHandler). */
export type AltarClick = { altarId: string; kind: WidgetActionKind; key: string };

// Widget parts must always draw something (the widget library can't take an empty one).
const nothing = () => <FlexWidget style={{ width: 1, height: 1 }} />;

function Picture({ uri, x, y, w, h, mode = 'contain', rotation }: { uri: string | number; x: number; y: number; w: number; h: number; mode?: 'contain' | 'cover' | 'stretch'; rotation?: number }) {
  if (!uri || w <= 0 || h <= 0) return nothing();
  return (
    <ImageWidget
      image={typeof uri === 'number' ? uri : src(uri)}
      imageWidth={Math.round(w)}
      imageHeight={Math.round(h)}
      resizeMode={mode}
      style={{ marginLeft: Math.round(x), marginTop: Math.round(y), ...(rotation ? { rotation } : {}) }}
    />
  );
}

export function AltarWidgetAndroid({ altar, box, now }: { altar: WidgetAltar | undefined; box: Box; now: Date }) {
  const { width, height, size } = box;
  if (!altar) {
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'saltandsovereignty://altar' }}
        style={{ width: 'match_parent', height: 'match_parent', backgroundColor: night, borderRadius: 22, padding: 16, flexDirection: 'column', flexGap: 4 }}
      >
        <Icon name="flame" size={26} />
        <Spacer />
        <Words text="No altar yet" size={16} weight="600" font={serif} />
        <Words text="Build and save one in the app to tend it here." size={12} color={muted} lines={2} />
      </FlexWidget>
    );
  }

  const lit = altar.candles.filter((c) => c.lit);
  const total = altar.candles.length + altar.moreCandles;
  const anyLit = lit.length > 0;
  const earliest = lit.map((c) => c.since).filter(Boolean).sort()[0] ?? '';
  const lastOffering = altar.presences.map((p) => p.lastOffering).filter(Boolean).sort().reverse()[0] ?? '';
  const lastCleansed = altar.crystals.map((c) => c.lastCleansed).filter(Boolean).sort().reverse()[0] ?? '';
  const click = (kind: WidgetActionKind, key: string): { clickAction: string; clickActionData: AltarClick } => ({
    clickAction: 'ALTAR',
    clickActionData: { altarId: altar.id, kind, key },
  });
  const toggleAll = click(anyLit ? 'snuff' : 'light', '');
  const toggleText = anyLit ? 'Snuff all' : 'Light all';

  // ── The scene, framed by the app for this size, scaled to fill the widget ──
  const view = WIDGET_VIEWS[size as WidgetSize];
  const f = altar.frames?.[size as WidgetSize];
  const s = Math.max(width / view.w, height / view.h);
  const dx = (width - view.w * s) / 2;
  const dy = size === 'large' ? 0 : (height - view.h * s) / 2;
  const W = (f?.W ?? Math.max(view.w, (view.h * 16) / 9)) * s;
  const ox = (f?.ox ?? 0) * s - dx;
  const oy = (f?.oy ?? 0) * s - dy;
  // A point on the stage (in stage widths) → a point on the widget.
  const at = (x: number, y: number) => ({ x: x * W - ox, y: y * W - oy });

  const object = (item: SceneItem) => {
    const p = at(item.box.x, item.box.y);
    const bw = item.box.w * W;
    const bh = item.box.h * W;
    const iw = bw * (1 - item.inset.x * 2);
    const ih = bh * (1 - item.inset.y * 2);
    return (
      <OverlapWidget
        key={item.key}
        {...(item.candle ? click(item.lit ? 'snuff' : 'light', item.key) : {})}
        style={{ marginLeft: Math.round(p.x), marginTop: Math.round(p.y), width: Math.round(bw), height: Math.round(bh), ...(item.rotation ? { rotation: item.rotation } : {}) }}
      >
        <Picture uri={item.image} x={bw * item.inset.x} y={bh * item.inset.y} w={iw} h={ih} />
        {item.overlays.map((o, i) => (
          <Picture key={`o${i}`} uri={o.image} x={o.rect.x * bw} y={o.rect.y * bh} w={o.rect.w * bw} h={o.rect.h * bh} />
        ))}
        {item.spent ? (
          // Burned down: shaded, as the app fades it.
          <FlexWidget style={{ marginLeft: Math.round(bw * item.inset.x), marginTop: Math.round(bh * item.inset.y), width: Math.round(iw), height: Math.round(ih), backgroundColor: '#0f1a1488', borderRadius: 4 }} />
        ) : null}
        {item.lit && item.halo ? <Picture uri={WIDGET_ART.halo} x={item.halo.x * bw} y={item.halo.y * bh} w={item.halo.w * bw} h={item.halo.h * bh} mode="stretch" /> : null}
        {item.lit && item.flame ? <Picture uri={WIDGET_ART.flame} x={item.flame.x * bw} y={item.flame.y * bh} w={item.flame.w * bw} h={item.flame.h * bh} mode="stretch" /> : null}
      </OverlapWidget>
    );
  };

  const scene = (
    <OverlapWidget style={{ width, height }}>
      {f?.background ? (
        <Picture uri={f.background} x={0} y={(f.bgY ?? 0) * s - oy} w={width} h={(f.bgH ?? view.h) * s} mode="stretch" />
      ) : altar.background ? (
        <Picture uri={altar.background} x={-ox} y={-oy} w={W} h={(W * 9) / 16} mode="cover" />
      ) : null}
      {f?.background && (f.bgY + f.bgH) * s - oy < height - 1 ? (
        <Picture uri={WIDGET_ART.scrimBottom} x={0} y={(f.bgY + f.bgH) * s - oy - 36} w={width} h={37} mode="stretch" />
      ) : null}
      {altar.scene
        .filter((item) => item.lit && item.pool)
        .map((item) => {
          const c = at(item.pool!.x - item.pool!.r, item.pool!.y - item.pool!.r);
          return <Picture key={`p${item.key}`} uri={WIDGET_ART.pool} x={c.x} y={c.y} w={item.pool!.r * 2 * W} h={item.pool!.r * 2 * W} mode="stretch" />;
        })}
      {altar.scene.map(object)}
    </OverlapWidget>
  );

  // ── Words and buttons ──────────────────────────────────────────────────
  const pill = (target: { clickAction: string; clickActionData: AltarClick }, text: string, main = false, key = text) => (
    <OverlapWidget key={key} {...target} style={{ width: 62, height: 21 }}>
      <ImageWidget image={main ? WIDGET_ART.pillGold : WIDGET_ART.pill} imageWidth={62} imageHeight={21} resizeMode="stretch" />
      <FlexWidget style={{ width: 62, height: 21, alignItems: 'center', justifyContent: 'center' }}>
        <Words text={text} size={9.5} weight="600" color={main ? night : gold} />
      </FlexWidget>
    </OverlapWidget>
  );
  const round = (target: { clickAction: string; clickActionData: AltarClick }, icon: 'hands' | 'sparkles', px: number) => (
    <OverlapWidget key={icon} {...target} style={{ width: px, height: px }}>
      <ImageWidget image={WIDGET_ART.button} imageWidth={px} imageHeight={px} resizeMode="stretch" />
      <FlexWidget style={{ width: px, height: px, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={Math.round(px * 0.42)} color={gold} />
      </FlexWidget>
    </OverlapWidget>
  );
  const buttons = (px: number) => (
    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 8 }}>
      {altar.presences.length ? round(click('offer', ''), 'hands', px) : null}
      {altar.crystals.length ? round(click('cleanse', ''), 'sparkles', px) : null}
      {total ? pill(toggleAll, toggleText, !anyLit) : null}
    </FlexWidget>
  );
  const title = (px: number) => <Words text={altar.name} size={px} weight="500" font={serif} color={cream} />;
  const status = (px: number) =>
    total ? (
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 4 }}>
        <Icon name={anyLit ? 'flameFill' : 'flame'} size={px} />
        <Words text={`${lit.length} of ${total} lit`} size={px} weight="600" />
      </FlexWidget>
    ) : null;
  const ago = (iso: string, prefix: string, none: string, px: number) => (
    <Words text={iso ? `${prefix} ${whenText(iso, now)}` : none} size={px} color={cream} />
  );
  const scrims = (top: number, bottom: number) => (
    <OverlapWidget style={{ width, height }}>
      {top ? <Picture uri={WIDGET_ART.scrimTop} x={0} y={0} w={width} h={top} mode="stretch" /> : null}
      <Picture uri={WIDGET_ART.scrimBottom} x={0} y={height - bottom} w={width} h={bottom} mode="stretch" />
    </OverlapWidget>
  );
  const root = (children: React.ReactNode[]) => (
    <OverlapWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `saltandsovereignty://altar/${altar.id}` }}
      style={{ width, height, borderRadius: 22, backgroundColor: night, overflow: 'hidden' }}
    >
      <ImageWidget image={WIDGET_ART.panel} imageWidth={width} imageHeight={height} resizeMode="stretch" />
      {scene}
      {children}
    </OverlapWidget>
  );

  if (size === 'small') {
    return root([
        scrims(48, 50),
        <FlexWidget key="words" style={{ width, height, padding: 14, flexDirection: 'column', flexGap: 2 }}>
          {title(11)}
          <Spacer />
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end', width: 'match_parent' }}>
            {status(9.5)}
            <Spacer />
            {total ? pill(toggleAll, toggleText, !anyLit) : null}
          </FlexWidget>
        </FlexWidget>,
    ]);
  }

  if (size === 'medium') {
    return root([
        scrims(44, 48),
        <FlexWidget key="words" style={{ width, height, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'column', flexGap: 2 }}>
          {title(12)}
          <Spacer />
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end', width: 'match_parent' }}>
            <FlexWidget style={{ flexDirection: 'column', flexGap: 1 }}>
              {status(9.5)}
              {altar.presences.length ? ago(lastOffering, 'Last offering', 'No offerings yet', 9) : null}
            </FlexWidget>
            <Spacer />
            {buttons(26)}
          </FlexWidget>
        </FlexWidget>,
    ]);
  }

  // Large: the altar above, and below it everything on it to tend.
  return root([
      scrims(0, 150),
      <FlexWidget key="words" style={{ width, height, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'column', flexGap: 4 }}>
        <Spacer />
        <FlexWidget style={{ paddingBottom: 4 }}>{title(10)}</FlexWidget>
        {total ? (
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6, width: 'match_parent' }}>
            {status(10)}
            {earliest ? <Words text={`· lit since ${whenText(earliest, now)}`} size={9.5} color={cream} /> : null}
            <Spacer />
            {pill(toggleAll, toggleText, !anyLit, 'toggle-all-pill')}
          </FlexWidget>
        ) : null}
        {altar.presences.slice(0, 2).map((p) => (
          <FlexWidget key={p.key} style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6, width: 'match_parent' }}>
            <Icon name="sparkles" size={10} />
            <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
              <Words text={p.offering ? `${p.label} · ${p.offering}` : p.label} size={11} font={serif} />
              {ago(p.lastOffering, 'Last offering', 'No offerings yet', 9)}
            </FlexWidget>
            {pill(click('offer', p.key), 'Offer', false, `offer-${p.key}`)}
          </FlexWidget>
        ))}
        {altar.crystals.length ? (
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6, width: 'match_parent' }}>
            <Icon name="diamond" size={9} />
            <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
              <Words
                text={
                  altar.crystals.length === 1
                    ? `${altar.crystals[0].label}${altar.crystals[0].cleansing ? ` · ${altar.crystals[0].cleansing}` : ''}`
                    : `${altar.crystals.length} crystals`
                }
                size={11}
                font={serif}
              />
              {ago(lastCleansed, 'Last cleansed', 'Not cleansed yet', 9)}
            </FlexWidget>
            {pill(click('cleanse', ''), 'Cleanse')}
          </FlexWidget>
        ) : null}
        {altar.workingsDue ? <Words text={`${altar.workingsDue} OF ${altar.workings} WORKINGS READY TO TEND`} size={10} weight="600" color={gold} /> : null}
      </FlexWidget>,
  ]);
}
