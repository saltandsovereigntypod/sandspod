// "Coming Up": the next moon phases, and beside them what's coming, soonest
// first: what wants tending today, your covens' rites and meetings, meeting
// actions due, and the holidays, yours and your covens' (`comingUp`, from
// lib/widgetMore). Side by side when medium; the phases in a row above the
// list when large. Without `comingUp` it shows the holidays alone, as it
// first did. Runs in the widget extension's own runtime (see MoonWidget).

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
  const link = widgetURL('saltandsovereignty://today?section=horizon');
  const label = (text: string) => <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold)]}>{text}</Text>;
  const none = (text: string) => <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{text}</Text>;
  // What's coming, or (from an older app) the holidays alone.
  const coming = props.comingUp ?? props.holidays.map((h) => ({ kind: 'holiday', name: h.name, detail: '', date: h.date, when: h.when, symbol: 'sparkles' }));
  const onlyHolidays = coming.every((c) => c.kind === 'holiday');
  const heading = onlyHolidays ? 'HOLIDAYS' : 'COMING UP';

  if (environment.widgetFamily === 'systemLarge') {
    const row = (key: string, symbol: string, name: string, detail: string, date: string, when: string) => (
      <HStack key={key} spacing={8} modifiers={[wide]}>
        <Image systemName={symbol as never} size={14} color={gold} />
        <VStack alignment="leading" spacing={0}>
          <Text modifiers={[font({ size: 14, design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{name}</Text>
          {detail ? <Text modifiers={[font({ size: 11 }), foregroundStyle(muted), lineLimit(1)]}>{detail}</Text> : null}
        </VStack>
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
        <HStack spacing={0} modifiers={[frame({ maxWidth: 10000 })]}>
          {props.phases.slice(0, 4).map((p) => (
            <VStack key={p.date} spacing={2} modifiers={[frame({ maxWidth: 10000 })]}>
              <Image systemName={p.symbol as never} size={18} color={cream} />
              <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(cream), lineLimit(1)]}>{p.name.split(' in ')[0]}</Text>
              <Text modifiers={[font({ size: 10 }), foregroundStyle(muted), lineLimit(1)]}>{p.when}</Text>
            </VStack>
          ))}
        </HStack>
        <Spacer />
        {label(heading)}
        {coming.length ? coming.slice(0, 5).map((c, i) => row(`c${i}${c.name}`, c.symbol, c.name, c.detail, c.date, c.when)) : none('Nothing in your calendars')}
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
        {label(heading)}
        {coming.length
          ? coming.slice(0, 3).map((c, i) => item(`c${i}${c.name}`, onlyHolidays ? null : c.symbol, c.name, c.when))
          : none('None ahead')}
      </VStack>
    </HStack>
  );
};

export default createWidget('ComingUpWidget', ComingUpWidget);
