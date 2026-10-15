// "Coming Up": the next moon phases and the next holidays, side by side when
// medium and as two lists when large. Runs in the widget extension's own
// runtime (see MoonWidget).

import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetDayProps } from '../lib/widgetTimeline';

const ComingUpWidget = (props: WidgetDayProps, environment: WidgetEnvironment) => {
  'widget';
  const sky = { type: 'linearGradient' as const, colors: ['#1a2c21', '#0f1a14', '#0a120d'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } };
  const cream = '#f4ecd8';
  const gold = '#e2c36d';
  const muted = '#cabf9d';
  const wide = frame({ maxWidth: 10000, alignment: 'leading' });
  const link = widgetURL('saltandsovereignty://today');
  const label = (text: string) => <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold)]}>{text}</Text>;
  const none = (text: string) => <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{text}</Text>;

  if (environment.widgetFamily === 'systemLarge') {
    const row = (key: string, symbol: string | null, name: string, date: string, when: string) => (
      <HStack key={key} spacing={8} modifiers={[wide]}>
        {symbol ? <Image systemName={symbol as never} size={16} color={cream} /> : null}
        <Text modifiers={[font({ size: 14, design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{name}</Text>
        <Spacer />
        <VStack alignment="trailing" spacing={0}>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(muted), lineLimit(1)]}>{date}</Text>
          <Text modifiers={[font({ size: 10 }), foregroundStyle(gold), lineLimit(1)]}>{when}</Text>
        </VStack>
      </HStack>
    );
    return (
      <VStack
        alignment="leading"
        spacing={8}
        modifiers={[link, containerBackground(sky, 'widget'), frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' })]}
      >
        {label('MOON PHASES')}
        {props.phases.slice(0, 4).map((p) => row(`m${p.date}`, p.symbol, p.name, p.date, p.when))}
        <Spacer />
        {label('HOLIDAYS')}
        {props.holidays.length ? props.holidays.slice(0, 4).map((h) => row(`h${h.name}${h.date}`, null, h.name, h.date, h.when)) : none('None in your calendars')}
        <Spacer />
      </VStack>
    );
  }

  // systemMedium
  const item = (key: string, symbol: string | null, name: string, when: string) => (
    <HStack key={key} spacing={5} modifiers={[wide]}>
      {symbol ? <Image systemName={symbol as never} size={12} color={cream} /> : null}
      <VStack alignment="leading" spacing={0}>
        <Text modifiers={[font({ size: 12, design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{name}</Text>
        <Text modifiers={[font({ size: 10 }), foregroundStyle(muted), lineLimit(1)]}>{when}</Text>
      </VStack>
    </HStack>
  );
  return (
    <HStack
      alignment="top"
      spacing={12}
      modifiers={[link, containerBackground(sky, 'widget'), frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' })]}
    >
      <VStack alignment="leading" spacing={5} modifiers={[wide]}>
        {label('MOON')}
        {props.phases.slice(0, 3).map((p) => item(`m${p.date}`, p.symbol, p.name, p.when))}
      </VStack>
      <VStack alignment="leading" spacing={5} modifiers={[wide]}>
        {label('HOLIDAYS')}
        {props.holidays.length ? props.holidays.slice(0, 3).map((h) => item(`h${h.name}${h.date}`, null, h.name, h.when)) : none('None ahead')}
      </VStack>
    </HStack>
  );
};

export default createWidget('ComingUpWidget', ComingUpWidget);
