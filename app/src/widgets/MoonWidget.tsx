// The home and lock screen widget. It runs inside iOS's widget extension, in
// its own JavaScript runtime: no hooks, no imports at run time, nothing from
// outside the function. The app sends it a month of days (lib/widgetTimeline).

import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, padding, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { MoonWidgetProps } from '../lib/widgetTimeline';

const MoonWidget = (props: MoonWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  const night = '#0f1a14';
  const cream = '#f4ecd8';
  const gold = '#e2c36d';
  const muted = '#cabf9d';
  const family = environment.widgetFamily;
  const link = widgetURL('saltandsovereignty://today');
  const lit = `${props.percent}%`;

  if (family === 'accessoryInline') {
    return <Text modifiers={[link]}>{`${props.phase} · ${lit}`}</Text>;
  }

  if (family === 'accessoryCircular') {
    return (
      <VStack spacing={2} modifiers={[link, containerBackground('clear', 'widget')]}>
        <Image systemName={props.symbol as never} size={22} />
        <Text modifiers={[font({ size: 12, weight: 'semibold' })]}>{lit}</Text>
      </VStack>
    );
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[link, containerBackground('clear', 'widget')]}>
        <HStack spacing={4}>
          <Image systemName={props.symbol as never} size={13} />
          <Text modifiers={[font({ size: 14, weight: 'semibold' }), lineLimit(1)]}>{props.phase}</Text>
        </HStack>
        <Text modifiers={[font({ size: 12 }), lineLimit(1)]}>{`in ${props.sign} · ${lit}`}</Text>
        <Text modifiers={[font({ size: 12 }), lineLimit(1)]}>{props.holidayToday ? props.holiday : props.next}</Text>
      </VStack>
    );
  }

  const moonColumn = (
    <VStack alignment="leading" spacing={3}>
      <Image systemName={props.symbol as never} size={32} color={cream} />
      <Spacer />
      <Text modifiers={[font({ size: 17, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(2)]}>{props.phase}</Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(1)]}>{`in ${props.sign} · ${lit}`}</Text>
    </VStack>
  );

  if (family === 'systemMedium') {
    return (
      <HStack
        alignment="top"
        spacing={14}
        modifiers={[link, containerBackground(night, 'widget'), frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' })]}
      >
        {moonColumn}
        <VStack alignment="leading" spacing={8} modifiers={[frame({ maxWidth: 10000, alignment: 'leading' })]}>
          <VStack alignment="leading" spacing={1}>
            <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold)]}>{props.holidayToday ? 'TODAY' : 'NEXT HOLIDAY'}</Text>
            <Text modifiers={[font({ size: 13 }), foregroundStyle(cream), lineLimit(2)]}>{props.holiday || 'None in your calendars'}</Text>
          </VStack>
          <VStack alignment="leading" spacing={1}>
            <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold)]}>NEXT MOON</Text>
            <Text modifiers={[font({ size: 13 }), foregroundStyle(cream), lineLimit(1)]}>{props.next}</Text>
          </VStack>
          {props.ritual ? (
            <VStack alignment="leading" spacing={1}>
              <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold)]}>YOUR NEXT RITUAL</Text>
              <Text modifiers={[font({ size: 13 }), foregroundStyle(cream), lineLimit(2)]}>{props.ritual}</Text>
            </VStack>
          ) : null}
        </VStack>
      </HStack>
    );
  }

  // systemSmall
  return (
    <VStack
      alignment="leading"
      spacing={3}
      modifiers={[link, containerBackground(night, 'widget'), frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' }), padding({ all: 0 })]}
    >
      {moonColumn}
      <Text modifiers={[font({ size: 11 }), foregroundStyle(gold), lineLimit(1)]}>{props.holidayToday ? props.holiday : props.next}</Text>
    </VStack>
  );
};

export default createWidget('MoonWidget', MoonWidget);
