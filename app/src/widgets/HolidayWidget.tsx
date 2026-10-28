// "Next Holiday": a countdown to the next holiday in your calendars or your
// covens' (saying which coven keeps it, when it isn't in yours). Runs in the
// widget extension's own runtime (see MoonWidget).

import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetDayProps } from '../lib/widgetTimeline';

const HolidayWidget = (props: WidgetDayProps, environment: WidgetEnvironment) => {
  'widget';
  const sky = { type: 'linearGradient' as const, colors: ['#1a2c21', '#0f1a14', '#0a120d'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } };
  const cream = '#f4ecd8';
  const gold = '#e2c36d';
  const muted = '#cabf9d';
  const link = widgetURL('saltandsovereignty://today');
  const next = props.nextHoliday;
  const family = environment.widgetFamily;

  if (family === 'accessoryInline') {
    return <Text modifiers={[link]}>{next ? `${next.name} ${next.when}` : 'No holidays ahead'}</Text>;
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[link, containerBackground('clear', 'widget')]}>
        <Text modifiers={[font({ size: 12, weight: 'semibold' })]}>{props.holidayToday ? `Today: ${props.holiday}` : 'Next holiday'}</Text>
        <Text modifiers={[font({ size: 14, weight: 'semibold' }), lineLimit(1)]}>{next ? next.name : 'None in your calendars'}</Text>
        <Text modifiers={[font({ size: 12 }), lineLimit(1)]}>{next ? `${next.date} · ${next.from ? next.from : next.when}` : ''}</Text>
      </VStack>
    );
  }

  // systemSmall
  return (
    <VStack
      alignment="leading"
      spacing={2}
      modifiers={[link, containerBackground(sky, 'widget'), frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' })]}
    >
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold), lineLimit(1)]}>
        {props.holidayToday ? `TODAY: ${props.holiday.toUpperCase()}` : 'NEXT HOLIDAY'}
      </Text>
      <Spacer />
      {next ? (
        <VStack alignment="leading" spacing={2}>
          <HStack alignment="firstTextBaseline" spacing={4}>
            <Text modifiers={[font({ size: 40, weight: 'semibold', design: 'serif' }), foregroundStyle(cream)]}>{String(next.days)}</Text>
            <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>{next.days === 1 ? 'day' : 'days'}</Text>
          </HStack>
          <Text modifiers={[font({ size: 16, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(2)]}>{next.name}</Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(muted), lineLimit(1)]}>{next.date}</Text>
          {next.from ? <Text modifiers={[font({ size: 11 }), foregroundStyle(gold), lineLimit(1)]}>{`Kept by ${next.from}`}</Text> : null}
        </VStack>
      ) : (
        <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>None in your calendars</Text>
      )}
    </VStack>
  );
};

export default createWidget('HolidayWidget', HolidayWidget);
