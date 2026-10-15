// "Altar": one of your altars on the home or lock screen, its background
// behind it, with buttons to light and snuff the candles, tend offerings to the
// presences on it and cleanse its crystals. A tap changes the widget straight
// away and leaves an action for the app to carry out on the real altar when it
// next opens (lib/altarWidget). Long-press the widget and choose "Which altar"
// to show a different one; the app decides which altar is in each place.
//
// Runs in the widget extension's own runtime (see MoonWidget): every helper
// lives inside the function.

import { Button, HStack, Image, Rectangle, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  aspectRatio,
  background,
  buttonStyle,
  clipped,
  clipShape,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  padding,
  resizable,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { AltarWidgetProps, WidgetActionKind, WidgetAltar } from '../lib/altarWidget';

type AltarWidgetConfiguration = { altar?: string };

const AltarWidget = (props: AltarWidgetProps, environment: WidgetEnvironment<AltarWidgetConfiguration>) => {
  'widget';
  const night = '#0f1a14';
  const cream = '#f4ecd8';
  const gold = '#e2c36d';
  const muted = '#cabf9d';
  const dim = '#7d7766';
  const family = environment.widgetFamily;
  const altars = props?.altars ?? [];
  const actions = props?.actions ?? [];
  // The widget is bundled as a string, which drops backslashes: no regex escapes in here.
  const place = Math.max(1, Number(String(environment.configuration?.altar ?? 'altar1').replace('altar', '')) || 1);
  const altar: WidgetAltar | undefined = altars[place - 1] ?? altars[0];
  const fill = frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' });
  const wide = frame({ maxWidth: 10000, alignment: 'leading' });
  const lock = family === 'accessoryCircular' || family === 'accessoryRectangular' || family === 'accessoryInline';

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

  // TEMPORARY test card: each line uses one feature of the real widget, so a
  // screenshot shows which one iOS can't draw.
  if (environment.widgetFamily === 'systemLarge' || environment.widgetFamily === 'systemMedium' || environment.widgetFamily === 'systemSmall') {
    const row = (n: string, child: React.ReactNode) => (
      <HStack spacing={6}>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(gold)]}>{n}</Text>
        {child}
      </HStack>
    );
    const firstImage = altar.candles.find((c) => c.image)?.image || altar.presences.find((p) => p.image)?.image || '';
    return (
      <VStack alignment="leading" spacing={4} modifiers={[containerBackground(night, 'widget'), fill, padding({ all: 12 })]}>
        <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(cream)]}>{`TEST · ${altars.length} altars · place ${place} · ${altar.name}`}</Text>
        {row('1 text', <Text modifiers={[foregroundStyle(cream)]}>plain text</Text>)}
        {row('2 date', <Text date={new Date(Date.now() - 3600000)} dateStyle="relative" modifiers={[foregroundStyle(cream)]} />)}
        {row('3 bg', altar.background ? <Image uiImage={altar.background} modifiers={[resizable(), aspectRatio({ contentMode: 'fill' }), frame({ width: 40, height: 20 }), clipped()]} /> : <Text modifiers={[foregroundStyle(muted)]}>no background file</Text>)}
        {row('4 thumb', firstImage ? <Image uiImage={firstImage} modifiers={[resizable(), aspectRatio({ contentMode: 'fit' }), frame({ width: 20, height: 20 })]} /> : <Text modifiers={[foregroundStyle(muted)]}>no thumbnail file</Text>)}
        {row('5 gradient', <Rectangle modifiers={[foregroundStyle({ type: 'linearGradient', colors: ['#e2c36d88', '#0f1a14f5'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 0 } }), frame({ width: 60, height: 10 })]} />)}
        {row('6 zstack', <ZStack><Text modifiers={[foregroundStyle(cream)]}>in a ZStack</Text></ZStack>)}
        {row('7 pill', <Text modifiers={[foregroundStyle(cream), padding({ horizontal: 8, vertical: 2 }), background('#e2c36d33'), clipShape('capsule')]}>pill</Text>)}
        {row('8 button', <Button target="diag" onPress={() => ({ altars, actions })} modifiers={[buttonStyle('plain')]}><Text modifiers={[foregroundStyle(cream)]}>a button</Text></Button>)}
        {row('9 link', <Text modifiers={[foregroundStyle(cream), widgetURL('saltandsovereignty://altar')]}>with link</Text>)}
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
      if (kind === 'light') return { ...a, candles: a.candles.map((c) => (hit(c.key) && !c.lit ? { ...c, lit: true, since: at } : c)) };
      if (kind === 'snuff') return { ...a, candles: a.candles.map((c) => (hit(c.key) ? { ...c, lit: false, since: '' } : c)) };
      if (kind === 'offer') return { ...a, presences: a.presences.map((p) => (hit(p.key) ? { ...p, lastOffering: at } : p)) };
      return { ...a, crystals: a.crystals.map((c) => (hit(c.key) ? { ...c, lastCleansed: at } : c)) };
    });
    return { altars: next, actions: [...actions, { id: `${at}-${kind}-${key}`, altarId: altar.id, kind, key, at }] };
  };
  const toggleAll = anyLit ? act('snuff', '') : act('light', '');

  const ago = (iso: string, prefix: string, none: string, size = 11, color = muted) =>
    iso ? (
      <HStack spacing={3}>
        <Text modifiers={[font({ size }), foregroundStyle(color), lineLimit(1)]}>{prefix}</Text>
        <Text date={new Date(iso)} dateStyle="relative" modifiers={[font({ size }), foregroundStyle(color), lineLimit(1)]} />
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

  // ── Home screen pieces ─────────────────────────────────────────────────
  const backdrop = (
    <ZStack modifiers={[fill]}>
      {altar.background ? (
        <Image uiImage={altar.background} modifiers={[resizable(), aspectRatio({ contentMode: 'fill' }), frame({ maxWidth: 10000, maxHeight: 10000 }), clipped()]} />
      ) : null}
      <Rectangle
        modifiers={[
          foregroundStyle({
            type: 'linearGradient',
            colors: altar.background ? ['#0f1a1488', '#0f1a14d9', '#0f1a14f5'] : [night, night],
            startPoint: { x: 0.5, y: 0 },
            endPoint: { x: 0.5, y: 1 },
          }),
        ]}
      />
    </ZStack>
  );

  const pill = (target: string, onPress: () => AltarWidgetProps, symbol: string, text: string, strong: boolean) => (
    <Button key={target} target={target} onPress={onPress} modifiers={[buttonStyle('plain')]}>
      <HStack spacing={5} modifiers={[padding({ horizontal: 10, vertical: 6 }), wide, background(strong ? '#e2c36d' : '#f4ecd826'), clipShape('capsule')]}>
        <Image systemName={symbol as never} size={12} color={strong ? night : gold} />
        <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(strong ? night : cream), lineLimit(1)]}>{text}</Text>
      </HStack>
    </Button>
  );
  const candleButton = pill('toggle-all', toggleAll, anyLit ? 'wind' : 'flame.fill', anyLit ? 'Snuff all' : 'Light all', !anyLit);
  const offerButton = pill('offer-all', act('offer', ''), 'hands.sparkles.fill', 'Tend offerings', false);
  const cleanseButton = pill('cleanse-all', act('cleanse', ''), 'sparkles', 'Cleanse crystals', false);

  const flames = (size: number, count: number) => (
    <HStack spacing={size / 3}>
      {altar.candles.slice(0, count).map((c) => (
        <Image key={c.key} systemName={(c.lit ? 'flame.fill' : 'flame') as never} size={size} color={c.lit ? c.color : dim} />
      ))}
    </HStack>
  );

  const title = (size: number) => (
    <Text modifiers={[font({ size, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{altar.name}</Text>
  );

  const content = (children: React.ReactNode) => (
    <ZStack alignment="topLeading" modifiers={[link, containerBackground(night, 'widget'), fill]}>
      {backdrop}
      {children}
    </ZStack>
  );

  // ── Small: the candles and one button ──────────────────────────────────
  if (family === 'systemSmall') {
    return content(
      <VStack alignment="leading" spacing={5} modifiers={[fill, padding({ all: 14 })]}>
        {title(15)}
        {total ? flames(15, 5) : <Image systemName="sparkles" size={15} color={gold} />}
        <Spacer />
        {total ? (
          <VStack alignment="leading" spacing={1}>
            <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(cream)]}>{`${lit.length} of ${total} lit`}</Text>
            {earliest ? ago(earliest, 'Lit', '', 11) : <Text modifiers={[font({ size: 11 }), foregroundStyle(muted)]}>All quiet</Text>}
          </VStack>
        ) : altar.presences.length ? (
          ago(lastOffering, 'Offered', 'No offerings yet', 11)
        ) : (
          <Text modifiers={[font({ size: 11 }), foregroundStyle(muted)]}>{`${altar.items} on the altar`}</Text>
        )}
        {total ? candleButton : altar.presences.length ? offerButton : altar.crystals.length ? cleanseButton : null}
      </VStack>,
    );
  }

  const presenceLine = altar.presences.length ? (
    <VStack alignment="leading" spacing={1}>
      <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(cream), lineLimit(1)]}>{altar.presences.map((p) => p.label).join(' · ')}</Text>
      {ago(lastOffering, 'Offered', 'No offerings yet')}
    </VStack>
  ) : null;

  // ── Medium: what's happening, and the three buttons ────────────────────
  if (family === 'systemMedium') {
    return content(
      <HStack alignment="top" spacing={12} modifiers={[fill, padding({ all: 14 })]}>
        <VStack alignment="leading" spacing={5} modifiers={[wide]}>
          {title(16)}
          {total ? flames(14, 8) : null}
          {total ? (
            <VStack alignment="leading" spacing={1}>
              <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(cream)]}>{`${lit.length} of ${total} candles lit`}</Text>
              {earliest ? ago(earliest, 'Lit', '') : null}
            </VStack>
          ) : null}
          <Spacer />
          {presenceLine}
          {altar.workingsDue ? (
            <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(gold)]}>{`${altar.workingsDue} working${altar.workingsDue === 1 ? '' : 's'} to tend`}</Text>
          ) : null}
        </VStack>
        <VStack alignment="leading" spacing={6} modifiers={[frame({ width: 132, alignment: 'leading' })]}>
          {total ? candleButton : null}
          {altar.presences.length ? offerButton : null}
          {altar.crystals.length ? cleanseButton : null}
          <Spacer />
        </VStack>
      </HStack>,
    );
  }

  // ── Large: every candle, presence and crystal, each tappable ──────────
  const label = (text: string) => (
    <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold), lineLimit(1)]}>{text}</Text>
  );
  const thumb = (image: string, symbol: string, color: string, size: number) =>
    image ? (
      <Image uiImage={image} modifiers={[resizable(), aspectRatio({ contentMode: 'fit' }), frame({ width: size, height: size })]} />
    ) : (
      <Image systemName={symbol as never} size={size * 0.6} color={color} modifiers={[frame({ width: size, height: size })]} />
    );
  const showPresences = altar.crystals.length ? 2 : 3;

  return content(
    <VStack alignment="leading" spacing={8} modifiers={[fill, padding({ all: 16 })]}>
      <HStack alignment="center" spacing={6}>
        {title(19)}
        <Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(muted)]}>{`${altar.items} on the altar`}</Text>
      </HStack>

      {total ? (
        <VStack alignment="leading" spacing={4}>
          <HStack spacing={4}>
            {label(`CANDLES · ${lit.length} OF ${total} LIT`)}
            <Spacer />
            {earliest ? ago(earliest, 'since', '', 10) : null}
          </HStack>
          <HStack spacing={6}>
            {altar.candles.slice(0, 4).map((c) => (
              <Button key={c.key} target={`candle-${c.key}`} onPress={act(c.lit ? 'snuff' : 'light', c.key)} modifiers={[buttonStyle('plain')]}>
                <VStack spacing={2} modifiers={[padding({ all: 5 }), frame({ maxWidth: 10000 }), background(c.lit ? '#e2c36d2e' : '#f4ecd814'), clipShape('roundedRectangle', 10)]}>
                  <ZStack alignment="top">
                    {thumb(c.image, 'flame', c.color, 34)}
                    <Image systemName={(c.lit ? 'flame.fill' : 'flame') as never} size={12} color={c.lit ? '#ffb347' : dim} />
                  </ZStack>
                  <Text modifiers={[font({ size: 9 }), foregroundStyle(c.lit ? cream : muted), lineLimit(1)]}>{c.label.replace(/ candle$/i, '')}</Text>
                </VStack>
              </Button>
            ))}
          </HStack>
        </VStack>
      ) : null}

      {altar.presences.length ? (
        <VStack alignment="leading" spacing={4}>
          {label('PRESENCES')}
          {altar.presences.slice(0, showPresences).map((p) => (
            <HStack key={p.key} spacing={8} modifiers={[wide]}>
              {thumb(p.image, 'sparkles', gold, 26)}
              <VStack alignment="leading" spacing={0}>
                <Text modifiers={[font({ size: 13, design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{p.label}</Text>
                {ago(p.lastOffering, 'Offered', 'No offerings yet', 10)}
              </VStack>
              <Spacer />
              <Button target={`offer-${p.key}`} onPress={act('offer', p.key)} modifiers={[buttonStyle('plain')]}>
                <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(gold), padding({ horizontal: 9, vertical: 4 }), background('#e2c36d26'), clipShape('capsule')]}>Offer</Text>
              </Button>
            </HStack>
          ))}
        </VStack>
      ) : null}

      {altar.crystals.length ? (
        <VStack alignment="leading" spacing={4}>
          <HStack spacing={4}>
            {label('CRYSTALS')}
            <Spacer />
            {ago(lastCleansed, 'Cleansed', 'Not cleansed yet', 10)}
          </HStack>
          <HStack spacing={6}>
            {altar.crystals.slice(0, 6).map((c) => (
              <Button key={c.key} target={`cleanse-${c.key}`} onPress={act('cleanse', c.key)} modifiers={[buttonStyle('plain')]}>
                {thumb(c.image, 'diamond.fill', '#b9a3e3', 30)}
              </Button>
            ))}
          </HStack>
        </VStack>
      ) : null}

      <Spacer />
      {altar.workingsDue ? (
        <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(gold)]}>{`${altar.workingsDue} of ${altar.workings} workings ready to tend`}</Text>
      ) : null}
      <HStack spacing={6}>
        {total ? candleButton : null}
        {altar.presences.length ? offerButton : null}
        {altar.crystals.length ? cleanseButton : null}
      </HStack>
    </VStack>,
  );
};

export default createWidget<AltarWidgetProps, AltarWidgetConfiguration>('AltarWidget', AltarWidget);
