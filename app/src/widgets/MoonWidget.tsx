// "Tonight's Moon": the moon on its own when small; with today's holiday and
// what it means when medium or large; and on the lock screen. It runs inside
// iOS's widget extension, in its own JavaScript runtime: no hooks, no imports at
// run time, nothing from outside the function. The app sends it a month of
// days (lib/widgetTimeline).

import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetDayProps } from '../lib/widgetTimeline';

const MoonWidget = (props: WidgetDayProps, environment: WidgetEnvironment) => {
  'widget';
  const sky = { type: 'linearGradient' as const, colors: ['#1a2c21', '#0f1a14', '#0a120d'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } };
  const cream = '#f4ecd8';
  const gold = '#e2c36d';
  const muted = '#cabf9d';
  const fill = frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' });
  const family = environment.widgetFamily;
  const link = widgetURL('saltandsovereignty://today');
  const lit = `${props.percent}%`;
  const label = (text: string) => <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold)]}>{text}</Text>;

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

  // Today's holiday, or a quiet note and the next one.
  const today = (lines: number) =>
    props.holidayToday ? (
      <VStack alignment="leading" spacing={2}>
        {label('TODAY')}
        <Text modifiers={[font({ size: lines > 3 ? 20 : 15, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(2)]}>{props.holiday}</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(lines)]}>{props.holidayMeaning}</Text>
      </VStack>
    ) : (
      <VStack alignment="leading" spacing={2}>
        {label('TODAY')}
        <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>No holiday today</Text>
        {props.nextHoliday ? (
          <VStack alignment="leading" spacing={1}>
            {label('NEXT HOLIDAY')}
            <Text modifiers={[font({ size: lines > 3 ? 17 : 14, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{props.nextHoliday.name}</Text>
            <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(1)]}>{`${props.nextHoliday.date} · ${props.nextHoliday.when}`}</Text>
            {lines > 3 ? <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(lines)]}>{props.holidayMeaning}</Text> : null}
          </VStack>
        ) : null}
      </VStack>
    );

  if (family === 'systemLarge') {
    return (
      <VStack alignment="leading" spacing={14} modifiers={[link, containerBackground(sky, 'widget'), fill]}>
        {label("TONIGHT'S MOON")}
        <HStack alignment="center" spacing={16}>
          <Image systemName={props.symbol as never} size={64} color={cream} />
          <VStack alignment="leading" spacing={3}>
            <Text modifiers={[font({ size: 24, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(1)]}>{props.phase}</Text>
            <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>{`in ${props.sign} · ${lit} lit`}</Text>
            <Text modifiers={[font({ size: 13 }), foregroundStyle(gold), lineLimit(1)]}>{`Next: ${props.next}`}</Text>
          </VStack>
        </HStack>
        {today(4)}
        <Spacer />
        <HStack spacing={0} modifiers={[frame({ maxWidth: 10000 })]}>
          {props.phases.slice(0, 4).map((p) => (
            <VStack key={p.date} spacing={3} modifiers={[frame({ maxWidth: 10000 })]}>
              <Image systemName={p.symbol as never} size={20} color={cream} />
              <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(cream), lineLimit(1)]}>{p.name.split(' in ')[0]}</Text>
              <Text modifiers={[font({ size: 10 }), foregroundStyle(muted), lineLimit(1)]}>{p.date.split(', ').slice(1).join(', ')}</Text>
            </VStack>
          ))}
        </HStack>
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
      <HStack alignment="top" spacing={14} modifiers={[link, containerBackground(sky, 'widget'), fill]}>
        {moonColumn}
        <VStack alignment="leading" spacing={8} modifiers={[frame({ maxWidth: 10000, alignment: 'leading' })]}>
          {today(3)}
        </VStack>
      </HStack>
    );
  }

  // systemSmall: the moon on its own.
  return (
    <VStack alignment="leading" spacing={3} modifiers={[link, containerBackground(sky, 'widget'), fill]}>
      {moonColumn}
      <Text modifiers={[font({ size: 11 }), foregroundStyle(gold), lineLimit(1)]}>{`Next: ${props.next}`}</Text>
    </VStack>
  );
};

export default createWidget('MoonWidget', MoonWidget);
