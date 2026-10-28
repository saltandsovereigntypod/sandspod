// "Next Ritual": your next working, your own plan or your coven's rite or
// meeting, whichever comes first (as on Today); when medium or large, with its
// intention, the moon that night and what you need to gather, or for a coven's
// rite whether you're going. Runs in the widget extension's own runtime (see
// MoonWidget).

import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, lineLimit, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

import type { WidgetDayProps } from '../lib/widgetTimeline';

const RitualWidget = (props: WidgetDayProps, environment: WidgetEnvironment) => {
  'widget';
  const sky = { type: 'linearGradient' as const, colors: ['#1a2c21', '#0f1a14', '#0a120d'], startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 } };
  const cream = '#f4ecd8';
  const gold = '#e2c36d';
  const muted = '#cabf9d';
  const family = environment.widgetFamily;
  const has = !!props.ritualId;
  const link = widgetURL(props.ritualUrl || (has ? `saltandsovereignty://rituals/plan/${props.ritualId}` : 'saltandsovereignty://rituals/planner'));
  const title = props.ritualKind === 'meeting' ? 'COVEN MEETING' : props.ritualKind === 'rite' ? 'COVEN RITE' : 'NEXT RITUAL';
  const fill = frame({ maxWidth: 10000, maxHeight: 10000, alignment: 'topLeading' });
  const label = (text: string) => <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(gold)]}>{text}</Text>;
  const small = (text: string, lines: number) => <Text modifiers={[font({ size: 12 }), foregroundStyle(muted), lineLimit(lines)]}>{text}</Text>;

  if (family === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[link, containerBackground('clear', 'widget')]}>
        <Text modifiers={[font({ size: 12, weight: 'semibold' })]}>{props.ritualKind === 'meeting' ? 'Coven meeting' : props.ritualKind === 'rite' ? 'Coven rite' : 'Next ritual'}</Text>
        <Text modifiers={[font({ size: 14, weight: 'semibold' }), lineLimit(1)]}>{has ? props.ritualTitle : 'Nothing planned'}</Text>
        <Text modifiers={[font({ size: 12 }), lineLimit(1)]}>{props.ritualWhen}</Text>
      </VStack>
    );
  }

  if (!has) {
    return (
      <VStack alignment="leading" spacing={4} modifiers={[link, containerBackground(sky, 'widget'), fill]}>
        {label('NEXT RITUAL')}
        <Spacer />
        <Text modifiers={[font({ size: 16, weight: 'semibold', design: 'serif' }), foregroundStyle(cream)]}>Nothing planned</Text>
        {small('Tap to plan a working.', 2)}
      </VStack>
    );
  }

  const heading = (size: number) => (
    <VStack alignment="leading" spacing={2}>
      {label(title)}
      <Text modifiers={[font({ size, weight: 'semibold', design: 'serif' }), foregroundStyle(cream), lineLimit(2)]}>{props.ritualTitle}</Text>
      <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(gold), lineLimit(1)]}>{props.ritualWhen}</Text>
      {props.ritualFrom && size > 16 ? <Text modifiers={[font({ size: 12 }), foregroundStyle(cream), lineLimit(1)]}>{props.ritualFrom}</Text> : null}
      {props.ritualStart && size > 16 ? (
        <HStack spacing={3}>
          <Image systemName="hourglass" size={10} color={muted} />
          <Text modifiers={[font({ size: 11 }), foregroundStyle(muted)]}>in</Text>
          <Text date={new Date(props.ritualStart)} dateStyle="relative" modifiers={[font({ size: 11 }), foregroundStyle(muted), lineLimit(1)]} />
        </HStack>
      ) : null}
    </VStack>
  );

  if (family === 'systemLarge') {
    return (
      <VStack alignment="leading" spacing={10} modifiers={[link, containerBackground(sky, 'widget'), fill]}>
        {heading(22)}
        {small(props.ritualMoon, 1)}
        {props.ritualIntention ? (
          <VStack alignment="leading" spacing={2}>
            {label('INTENTION')}
            <Text modifiers={[font({ size: 13 }), foregroundStyle(cream), lineLimit(3)]}>{props.ritualIntention}</Text>
          </VStack>
        ) : null}
        {props.ritualNeeds.length ? (
          <VStack alignment="leading" spacing={3}>
            {label("YOU'LL NEED")}
            {props.ritualNeeds.map((name) => (
              <HStack key={name} spacing={6}>
                <Image systemName="circle" size={9} color={gold} />
                <Text modifiers={[font({ size: 13 }), foregroundStyle(cream), lineLimit(1)]}>{name}</Text>
              </HStack>
            ))}
          </VStack>
        ) : props.ritualPrep ? (
          <VStack alignment="leading" spacing={2}>
            {label('PREPARATION')}
            <Text modifiers={[font({ size: 13 }), foregroundStyle(cream), lineLimit(6)]}>{props.ritualPrep}</Text>
          </VStack>
        ) : null}
        <Spacer />
      </VStack>
    );
  }

  if (family === 'systemMedium') {
    const needs = props.ritualNeeds.join(', ');
    return (
      <HStack alignment="top" spacing={14} modifiers={[link, containerBackground(sky, 'widget'), fill]}>
        <VStack alignment="leading" spacing={4} modifiers={[frame({ maxWidth: 10000, alignment: 'leading' })]}>
          {heading(17)}
          <Spacer />
          {small(props.ritualIntention || props.ritualMoon, 2)}
        </VStack>
        <VStack alignment="leading" spacing={2} modifiers={[frame({ maxWidth: 10000, alignment: 'leading' })]}>
          {label(needs ? "YOU'LL NEED" : props.ritualPrep ? 'PREPARATION' : 'THE MOON')}
          <Text modifiers={[font({ size: 12 }), foregroundStyle(cream), lineLimit(6)]}>{needs || props.ritualPrep || props.ritualMoon}</Text>
        </VStack>
      </HStack>
    );
  }

  // systemSmall
  return (
    <VStack alignment="leading" spacing={3} modifiers={[link, containerBackground(sky, 'widget'), fill]}>
      {heading(16)}
      <Spacer />
      {small(props.ritualFrom || (props.ritualNeeds.length ? `${props.ritualNeeds.length} thing${props.ritualNeeds.length === 1 ? '' : 's'} to gather` : props.ritualMoon), 2)}
    </VStack>
  );
};

export default createWidget('RitualWidget', RitualWidget);
