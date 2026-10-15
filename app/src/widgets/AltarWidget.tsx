// "Altar": one of your altars on the home or lock screen, drawn as the app
// draws it: its background, every object where you placed it (size, turn,
// flip and layer), and lit candles with their flame and pool of light. Tap a
// candle to light or snuff it; the buttons light or snuff them all, tend
// offerings and cleanse crystals. A tap changes the widget straight away and
// leaves an action for the app to carry out on the real altar when it next
// opens (lib/altarWidget). Long-press the widget and choose "Which altar" to
// show a different one; the app decides which altar is in each place.
//
// Everything you see is a picture marked full colour, so the altar looks the
// same on regular, tinted and clear home screens (only words take the tint).
//
// Runs in the widget extension's own runtime (see MoonWidget): every helper
// lives inside the function, and the code is stored as a string, so no
// backslashes (regex escapes) in here.

import { Button, HStack, Image, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  aspectRatio,
  buttonStyle,
  clipped,
  containerBackground,
  fixedSize,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  offset,
  opacity,
  padding,
  resizable,
  rotationEffect,
  scaleEffect,
  shadow,
  widgetAccentedRenderingMode,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { AltarWidgetProps, SceneItem, WidgetActionKind, WidgetAltar, WidgetSize } from '../lib/altarWidget';

type AltarWidgetConfiguration = { altar?: string };

const AltarWidget = (props: AltarWidgetProps, environment: WidgetEnvironment<AltarWidgetConfiguration>) => {
  'widget';
  const night = '#0f1a14';
  const cream = '#f4ecd8';
  const gold = '#e2c36d';
  const muted = '#cabf9d';
  const family = environment.widgetFamily;
  const altars = props?.altars ?? [];
  const actions = props?.actions ?? [];
  const art = props?.art ?? null;
  const place = Math.max(1, Number(String(environment.configuration?.altar ?? 'altar1').replace('altar', '')) || 1);
  const altar: WidgetAltar | undefined = altars[place - 1] ?? altars[0];
  const fill = frame({ maxWidth: 10000, maxHeight: 10000 });
  const lock = family === 'accessoryCircular' || family === 'accessoryRectangular' || family === 'accessoryInline';
  // Pictures keep their own colours on tinted and clear home screens.
  const own = widgetAccentedRenderingMode('fullColor');

  if (!altar) {
    if (lock) return <Text modifiers={[widgetURL('saltandsovereignty://altar'), containerBackground('clear', 'widget')]}>No altar yet</Text>;
    return (
      <VStack alignment="leading" spacing={4} modifiers={[widgetURL('saltandsovereignty://altar'), containerBackground(night, 'widget'), fill, padding({ all: 16 })]}>
        <Image systemName="flame" size={26} color={gold} />
        <Spacer />
        <Text modifiers={[font({ size: 16, weight: 'semibold', design: 'serif' }), foregroundStyle(cream)]}>No altar yet</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>Build and save one in the app to tend it here.</Text>
      </VStack>
    );
  }

  const link = widgetURL(`saltandsovereignty://altar/${altar.id}`);
  const lit = altar.candles.filter((c) => c.lit);
  const total = altar.candles.length + altar.moreCandles;
  const anyLit = lit.length > 0;
  const earliest = lit.map((c) => c.since).filter(Boolean).sort()[0] ?? '';
  const lastOffering = altar.presences.map((p) => p.lastOffering).filter(Boolean).sort().reverse()[0] ?? '';
  const lastCleansed = altar.crystals.map((c) => c.lastCleansed).filter(Boolean).sort().reverse()[0] ?? '';

  // What a tap does: change this widget now and leave the action for the app.
  const act = (kind: WidgetActionKind, key: string) => (): AltarWidgetProps => {
    const at = new Date().toISOString();
    const hit = (k: string) => !key || k === key;
    const next = altars.map((a) => {
      if (a.id !== altar.id) return a;
      if (kind === 'light' || kind === 'snuff') {
        const on = kind === 'light';
        return {
          ...a,
          candles: a.candles.map((c) => (hit(c.key) && c.lit !== on ? { ...c, lit: on, since: on ? at : '' } : c)),
          scene: a.scene.map((s) => (s.candle && hit(s.key) ? { ...s, lit: on } : s)),
        };
      }
      if (kind === 'offer') return { ...a, presences: a.presences.map((p) => (hit(p.key) ? { ...p, lastOffering: at } : p)) };
      return { ...a, crystals: a.crystals.map((c) => (hit(c.key) ? { ...c, lastCleansed: at } : c)) };
    });
    return { altars: next, art, actions: [...actions, { id: `${at}-${kind}-${key}`, altarId: altar.id, kind, key, at }] };
  };
  const toggleAll = anyLit ? act('snuff', '') : act('light', '');

  const ago = (iso: string, prefix: string, none: string, size = 11, color = muted) =>
    iso ? (
      <HStack spacing={3}>
        <Text modifiers={[font({ size }), foregroundStyle(color), lineLimit(1)]}>{prefix}</Text>
        <Text date={new Date(iso)} dateStyle="relative" modifiers={[font({ size }), foregroundStyle(color), lineLimit(1), fixedSize({ horizontal: true })]} />
        <Text modifiers={[font({ size }), foregroundStyle(color), lineLimit(1)]}>ago</Text>
      </HStack>
    ) : (
      <Text modifiers={[font({ size }), foregroundStyle(color), lineLimit(1)]}>{none}</Text>
    );

  // ── Lock screen ────────────────────────────────────────────────────────
  if (family === 'accessoryInline') {
    return <Text modifiers={[link]}>{total ? `${lit.length} of ${total} lit · ${altar.name}` : altar.name}</Text>;
  }
  if (family === 'accessoryCircular') {
    return (
      <Button target="toggle-all" onPress={toggleAll} modifiers={[buttonStyle('plain'), containerBackground('clear', 'widget')]}>
        <VStack spacing={1}>
          <Image systemName={anyLit ? 'flame.fill' : 'flame'} size={22} />
          <Text modifiers={[font({ size: 11, weight: 'semibold' })]}>{`${lit.length}/${total}`}</Text>
        </VStack>
      </Button>
    );
  }
  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[link, containerBackground('clear', 'widget')]}>
        <Text modifiers={[font({ size: 14, weight: 'semibold' }), lineLimit(1)]}>{altar.name}</Text>
        <HStack spacing={4}>
          <Image systemName={anyLit ? 'flame.fill' : 'flame'} size={11} />
          <Text modifiers={[font({ size: 12 }), lineLimit(1)]}>{total ? `${lit.length} of ${total} lit` : 'No candles'}</Text>
        </HStack>
        {altar.presences.length ? ago(lastOffering, 'Offered', 'No offerings yet', 12, 'primary') : null}
      </VStack>
    );
  }

  // ── The altar, as the app draws it ─────────────────────────────────────
  // A picture placed at (x, y) points from its container's top-left, w × h points.
  const picture = (uri: string, x: number, y: number, w: number, h: number, mode: 'fit' | 'fill' | 'stretch') =>
    uri ? (
      <Image
        uiImage={uri}
        modifiers={[
          resizable(),
          ...(mode === 'stretch' ? [] : [aspectRatio({ contentMode: mode })]),
          frame({ width: w, height: h }),
          ...(mode === 'fill' ? [clipped()] : []),
          offset({ x, y }),
          own,
        ]}
      />
    ) : null;

  const objectView = (item: SceneItem, W: number) => {
    const bw = item.box.w * W;
    const bh = item.box.h * W;
    const iw = bw * (1 - item.inset.x * 2);
    const ih = bh * (1 - item.inset.y * 2);
    return (
      <ZStack alignment="topLeading" modifiers={[frame({ width: bw, height: bh, alignment: 'topLeading' })]}>
        {picture(item.image, bw * item.inset.x, bh * item.inset.y, iw, ih, 'fit')}
        {item.overlays.map((o, i) => (
          <ZStack key={`o${i}`} alignment="topLeading" modifiers={[opacity(o.opacity)]}>
            {picture(o.image, o.rect.x * bw, o.rect.y * bh, o.rect.w * bw, o.rect.h * bh, 'fit')}
          </ZStack>
        ))}
        {item.lit && art && item.halo ? picture(art.halo, item.halo.x * bw, item.halo.y * bh, item.halo.w * bw, item.halo.h * bh, 'stretch') : null}
        {item.lit && art && item.flame ? picture(art.flame, item.flame.x * bw, item.flame.y * bh, item.flame.w * bw, item.flame.h * bh, 'stretch') : null}
      </ZStack>
    );
  };

  // The altar filling a widget size, framed by the app (lib/altarWidget sceneFrame):
  // the 16:9 stage W points wide, slid by (ox, oy) so your objects fill the widget.
  const scene = (size: WidgetSize, viewW: number, viewH: number) => {
    const f = altar.frames?.[size];
    const W = f?.W ?? Math.max(viewW, (viewH * 16) / 9);
    const H = (W * 9) / 16;
    const ox = f?.ox ?? 0;
    const oy = f?.oy ?? 0;
    return (
      <ZStack alignment="topLeading" modifiers={[frame({ width: viewW, height: viewH, alignment: 'topLeading' }), clipped()]}>
        <ZStack alignment="topLeading" modifiers={[frame({ width: W, height: H, alignment: 'topLeading' }), offset({ x: -ox, y: -oy })]}>
          {f?.background ? picture(f.background, ox, oy, viewW, viewH, 'stretch') : picture(altar.background, 0, 0, W, H, 'fill')}
          {art
            ? altar.scene
                .filter((s) => s.lit && s.pool)
                .map((s) => (
                  <ZStack key={`p${s.key}`} alignment="topLeading">
                    {picture(art.pool, (s.pool!.x - s.pool!.r) * W, (s.pool!.y - s.pool!.r) * W, s.pool!.r * 2 * W, s.pool!.r * 2 * W, 'stretch')}
                  </ZStack>
                ))
            : null}
          {altar.scene.map((item) => {
            const transform = [rotationEffect(item.rotation), scaleEffect({ x: item.flipped ? -1 : 1, y: 1 }), offset({ x: item.box.x * W, y: item.box.y * W })];
            return item.candle ? (
              <Button key={item.key} target={`candle-${item.key}`} onPress={act(item.lit ? 'snuff' : 'light', item.key)} modifiers={[buttonStyle('plain'), ...transform]}>
                {objectView(item, W)}
              </Button>
            ) : (
              <ZStack key={item.key} alignment="topLeading" modifiers={transform}>
                {objectView(item, W)}
              </ZStack>
            );
          })}
        </ZStack>
      </ZStack>
    );
  };

  // A round button: a dark glass disc (gold when it's the main action) with a symbol.
  const round = (target: string, onPress: () => AltarWidgetProps, symbol: string, main: boolean, size: number) => (
    <Button key={target} target={target} onPress={onPress} modifiers={[buttonStyle('plain')]}>
      <ZStack modifiers={[frame({ width: size, height: size })]}>
        {art ? <Image uiImage={main ? art.buttonGold : art.button} modifiers={[resizable(), frame({ width: size, height: size }), own]} /> : null}
        <Image systemName={symbol as never} size={size * 0.42} color={main ? night : gold} modifiers={[own]} />
      </ZStack>
    </Button>
  );
  const buttons = (size: number) => (
    <HStack spacing={8}>
      {altar.presences.length ? round('offer-all', act('offer', ''), 'hands.sparkles.fill', false, size) : null}
      {altar.crystals.length ? round('cleanse-all', act('cleanse', ''), 'sparkles', false, size) : null}
      {total ? round('toggle-all', toggleAll, anyLit ? 'wind' : 'flame.fill', !anyLit, size) : null}
    </HStack>
  );

  const title = (size: number) => (
    <Text modifiers={[font({ size, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(1), shadow({ radius: 3, x: 0, y: 1, color: '#000000' })]}>
      {altar.name}
    </Text>
  );
  const status = (size: number) =>
    total ? (
      <HStack spacing={4}>
        <Image systemName={(anyLit ? 'flame.fill' : 'flame') as never} size={size} color={gold} modifiers={[own]} />
        <Text modifiers={[font({ size, weight: 'semibold' }), foregroundStyle(cream), lineLimit(1)]}>{`${lit.length} of ${total} lit`}</Text>
      </HStack>
    ) : null;

  // Shading so words read over any background (pictures, so it's the same tinted or not).
  const scrims = (top: number, bottom: number) =>
    art ? (
      <VStack spacing={0} modifiers={[fill]}>
        <Image uiImage={art.scrimTop} modifiers={[resizable(), frame({ maxWidth: 10000, minHeight: top, maxHeight: top }), own]} />
        <Spacer />
        <Image uiImage={art.scrimBottom} modifiers={[resizable(), frame({ maxWidth: 10000, minHeight: bottom, maxHeight: bottom }), own]} />
      </VStack>
    ) : null;

  // TEMPORARY test card: each line draws one piece of the design from your real
  // altar, so a screenshot shows which piece iOS can't draw.
  if (String(family).startsWith('system')) {
    const rows: [string, () => unknown][] = [
      ['1 title', () => title(12)],
      ['2 art button', () => (art ? <Image uiImage={art.button} modifiers={[resizable(), frame({ width: 20, height: 20 }), own]} /> : <Text>no art</Text>)],
      ['3 symbol', () => <Image systemName="flame.fill" size={14} color={gold} modifiers={[own]} />],
      ['4 date', () => ago(earliest || new Date(Date.now() - 600000).toISOString(), 'lit', 'none', 11, cream)],
      ['5 bg cut', () => (altar.frames?.small?.background ? picture(altar.frames.small.background, 0, 0, 50, 24, 'stretch') : <Text>no bg cut</Text>)],
      ['6 object', () => (altar.scene[0] ? <ZStack modifiers={[frame({ width: 40, height: 30 }), clipped()]}>{objectView(altar.scene[0], 170)}</ZStack> : <Text>no objects</Text>)],
      ['7 scene', () => <ZStack modifiers={[frame({ width: 60, height: 30 }), clipped()]}><ZStack modifiers={[scaleEffect(0.3)]}>{scene('small', 170, 170)}</ZStack></ZStack>],
      ['8 scrims', () => <ZStack modifiers={[frame({ width: 50, height: 24 })]}>{scrims(10, 10)}</ZStack>],
      ['9 pill', () => (art ? <Image uiImage={art.pill} modifiers={[resizable({ leading: 20, trailing: 20 }), frame({ width: 60, height: 20 }), own]} /> : <Text>no art</Text>)],
      ['10 round', () => round('dbg-round', toggleAll, 'flame.fill', true, 24)],
    ];
    return (
      <VStack alignment="leading" spacing={2} modifiers={[containerBackground(night, 'widget'), fill, padding({ all: 10 })]}>
        <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(cream)]}>
          {`TEST v4 · ${altars.length} altars · art ${art ? 'yes' : 'no'} · ${altar.scene?.length ?? 'no'} objects · frames ${altar.frames ? 'yes' : 'no'}`}
        </Text>
        {rows.map(([name, make]) => {
          let view: unknown;
          try {
            view = make();
          } catch (e) {
            view = <Text modifiers={[font({ size: 9 }), foregroundStyle('#ff8080')]}>{`ERROR ${String(e)}`}</Text>;
          }
          return (
            <HStack key={name} spacing={6}>
              <Text modifiers={[font({ size: 9 }), foregroundStyle(gold)]}>{name}</Text>
              {view as never}
            </HStack>
          );
        })}
      </VStack>
    );
  }

  // ── Small: the altar, its name and one button ─────────────────────────
  if (family === 'systemSmall') {
    return (
      <ZStack modifiers={[link, containerBackground(night, 'widget'), fill]}>
        {scene('small', 170, 170)}
        {scrims(56, 64)}
        <VStack alignment="leading" spacing={2} modifiers={[fill, padding({ all: 12 })]}>
          {title(14)}
          <Spacer />
          <HStack alignment="bottom">
            {status(11)}
            <Spacer />
            {total ? round('toggle-all', toggleAll, anyLit ? 'wind' : 'flame.fill', !anyLit, 36) : null}
          </HStack>
        </VStack>
      </ZStack>
    );
  }

  // ── Medium: the whole altar, with its buttons along the bottom ────────
  if (family === 'systemMedium') {
    return (
      <ZStack modifiers={[link, containerBackground(night, 'widget'), fill]}>
        {scene('medium', 364, 170)}
        {scrims(52, 60)}
        <VStack alignment="leading" spacing={2} modifiers={[fill, padding({ horizontal: 14, vertical: 12 })]}>
          {title(15)}
          <Spacer />
          <HStack alignment="bottom">
            <VStack alignment="leading" spacing={1}>
              {status(11)}
              {altar.presences.length ? ago(lastOffering, 'Offered', 'No offerings yet', 10, cream) : null}
            </VStack>
            <Spacer />
            {buttons(34)}
          </HStack>
        </VStack>
      </ZStack>
    );
  }

  // ── Large: the altar above, and below it everything on it to tend ─────
  const label = (text: string) => <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold), lineLimit(1)]}>{text}</Text>;
  const pill = (target: string, onPress: () => AltarWidgetProps, text: string) => (
    <Button key={target} target={target} onPress={onPress} modifiers={[buttonStyle('plain')]}>
      <ZStack>
        {art ? <Image uiImage={art.pill} modifiers={[resizable({ leading: 20, trailing: 20 }), frame({ width: 76, height: 26 }), own]} /> : null}
        <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(gold)]}>{text}</Text>
      </ZStack>
    </Button>
  );

  return (
    <ZStack modifiers={[link, containerBackground(night, 'widget'), fill]}>
      {scene('large', 364, 382)}
      {scrims(64, 210)}
      <VStack alignment="leading" spacing={7} modifiers={[fill, padding({ horizontal: 16, vertical: 14 })]}>
        {title(19)}
        <Spacer />
        {total ? (
          <HStack spacing={6}>
            {status(12)}
            {earliest ? ago(earliest, '· lit', '', 11, cream) : null}
            <Spacer />
            {pill('toggle-all-pill', toggleAll, anyLit ? 'Snuff all' : 'Light all')}
          </HStack>
        ) : null}
        {altar.presences.slice(0, 2).map((p) => (
          <HStack key={p.key} spacing={6}>
            <Image systemName="sparkles" size={12} color={gold} modifiers={[own]} />
            <VStack alignment="leading" spacing={0}>
              <Text modifiers={[font({ size: 13, design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{p.label}</Text>
              {ago(p.lastOffering, 'Offered', 'No offerings yet', 10, cream)}
            </VStack>
            <Spacer />
            {pill(`offer-${p.key}`, act('offer', p.key), 'Offer')}
          </HStack>
        ))}
        {altar.crystals.length ? (
          <HStack spacing={6}>
            <Image systemName="diamond.fill" size={11} color={gold} modifiers={[own]} />
            <VStack alignment="leading" spacing={0}>
              <Text modifiers={[font({ size: 13, design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>
                {altar.crystals.length === 1 ? altar.crystals[0].label : `${altar.crystals.length} crystals`}
              </Text>
              {ago(lastCleansed, 'Cleansed', 'Not cleansed yet', 10, cream)}
            </VStack>
            <Spacer />
            {pill('cleanse-all', act('cleanse', ''), 'Cleanse')}
          </HStack>
        ) : null}
        {altar.workingsDue ? label(`${altar.workingsDue} OF ${altar.workings} WORKINGS READY TO TEND`) : null}
      </VStack>
    </ZStack>
  );
};

export default createWidget<AltarWidgetProps, AltarWidgetConfiguration>('AltarWidget', AltarWidget);
