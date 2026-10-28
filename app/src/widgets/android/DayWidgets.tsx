'use no memo';
// The Android Moon, Holiday, Coming Up and Ritual widgets: the iPhone widgets'
// layouts (src/widgets/*Widget.tsx) in Android's widget building blocks. Each
// gets the same day (lib/widgetTimeline) and the widget's size.

import { FlexWidget } from 'react-native-android-widget';

import type { WidgetDayProps } from '../../lib/widgetTimeline';
import { cream, gold, Icon, iconFor, Label, Moon, muted, serif, sky, Spacer, untilText, Words, type Box } from './look';

const TODAY = 'saltandsovereignty://today?tab=today';
// The Coming Up widget opens Today's Sky & Lore tab, where "On the horizon" is.
const HORIZON = 'saltandsovereignty://today?section=horizon';

function Frame({ box, uri = TODAY, row = false, children, gap = 0 }: { box: Box; uri?: string; row?: boolean; children: React.ReactNode; gap?: number }) {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri }}
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundGradient: sky,
        borderRadius: 22,
        padding: box.size === 'small' ? 14 : 16,
        flexDirection: row ? 'row' : 'column',
        flexGap: gap,
      }}
    >
      {children}
    </FlexWidget>
  );
}

const Col = ({ children, gap = 0, flex }: { children: React.ReactNode; gap?: number; flex?: number }) => (
  <FlexWidget style={{ flexDirection: 'column', flexGap: gap, ...(flex ? { flex } : {}) }}>{children}</FlexWidget>
);
const Row = ({ children, gap = 0, center }: { children: React.ReactNode; gap?: number; center?: boolean }) => (
  <FlexWidget style={{ flexDirection: 'row', flexGap: gap, alignItems: center ? 'center' : 'flex-start', width: 'match_parent' }}>{children}</FlexWidget>
);

// ── Tonight's Moon ───────────────────────────────────────────────────────
export function MoonWidgetAndroid({ day, box }: { day: WidgetDayProps; box: Box }) {
  const lit = `${day.percent}%`;
  const today = (lines: number) =>
    day.holidayToday ? (
      <Col gap={2}>
        <Label text="TODAY" />
        <Words text={day.holiday} size={lines > 3 ? 20 : 15} weight="600" font={serif} lines={2} />
        <Words text={day.holidayMeaning} size={12} color={muted} lines={lines} />
      </Col>
    ) : (
      <Col gap={2}>
        <Label text="TODAY" />
        <Words text="No holiday today" size={13} color={muted} />
        {day.nextHoliday ? (
          <Col gap={1}>
            <Label text="NEXT HOLIDAY" />
            <Words text={day.nextHoliday.name} size={lines > 3 ? 17 : 14} weight="600" font={serif} />
            <Words text={`${day.nextHoliday.date} · ${day.nextHoliday.when}`} size={12} color={muted} />
            {lines > 3 ? <Words text={day.holidayMeaning} size={12} color={muted} lines={lines} /> : null}
          </Col>
        ) : null}
      </Col>
    );

  if (box.size === 'large') {
    return (
      <Frame box={box} gap={14}>
        <Label text="TONIGHT'S MOON" />
        <Row gap={16} center>
          <Moon symbol={day.symbol} percent={day.percent} size={64} />
          <Col gap={3} flex={1}>
            <Words text={day.phase} size={24} weight="600" font={serif} />
            <Words text={`in ${day.sign} · ${lit} lit`} size={13} color={muted} />
            <Words text={`Next: ${day.next}`} size={13} color={gold} />
            {day.calendarLine ? <Words text={day.calendarLine} size={13} font={serif} /> : null}
          </Col>
        </Row>
        {today(4)}
        {day.observance || day.card ? (
          <Col gap={3}>
            {day.observance ? (
              <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 5 }}>
                <Icon name="moonStars" size={11} />
                <Words text={day.observance} size={12} font={serif} />
              </FlexWidget>
            ) : null}
            {day.card ? (
              <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 5 }}>
                <Icon name="diamond" size={11} />
                <Words text={`Today’s card: ${day.card}`} size={12} color={muted} />
              </FlexWidget>
            ) : null}
          </Col>
        ) : null}
        <Spacer />
        <Row>
          {day.phases.slice(0, 4).map((p) => (
            <FlexWidget key={p.date} style={{ flex: 1, flexDirection: 'column', alignItems: 'center', flexGap: 3 }}>
              <Moon symbol={p.symbol} size={20} />
              <Words text={p.name.split(' in ')[0]} size={10} weight="600" align="center" />
              <Words text={p.date.split(', ').slice(1).join(', ')} size={10} color={muted} align="center" />
            </FlexWidget>
          ))}
        </Row>
      </Frame>
    );
  }

  const moonColumn = (
    <Col gap={3} flex={box.size === 'small' ? 1 : undefined}>
      <Moon symbol={day.symbol} percent={day.percent} size={32} />
      <Spacer />
      <Words text={day.phase} size={17} weight="600" font={serif} lines={2} />
      <Words text={`in ${day.sign} · ${lit}`} size={12} color={muted} />
    </Col>
  );
  if (box.size === 'medium') {
    return (
      <Frame box={box} row gap={14}>
        {moonColumn}
        <Col gap={8} flex={1}>
          {day.calendarLine ? <Words text={day.calendarLine} size={12} weight="600" font={serif} /> : null}
          {today(day.calendarLine ? 2 : 3)}
        </Col>
      </Frame>
    );
  }
  return (
    <Frame box={box} gap={3}>
      {moonColumn}
      <Words text={`Next: ${day.next}`} size={11} color={gold} />
    </Frame>
  );
}

// ── Next Holiday ─────────────────────────────────────────────────────────
export function HolidayWidgetAndroid({ day, box }: { day: WidgetDayProps; box: Box }) {
  const next = day.nextHoliday;
  return (
    <Frame box={box} gap={2}>
      <Words text={day.holidayToday ? `TODAY: ${day.holiday.toUpperCase()}` : 'NEXT HOLIDAY'} size={10} weight="600" color={gold} />
      <Spacer />
      {next ? (
        <Col gap={2}>
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end', flexGap: 4 }}>
            <Words text={String(next.days)} size={40} weight="600" font={serif} />
            <FlexWidget style={{ paddingBottom: 8 }}>
              <Words text={next.days === 1 ? 'day' : 'days'} size={13} color={muted} />
            </FlexWidget>
          </FlexWidget>
          <Words text={next.name} size={16} weight="600" font={serif} lines={2} />
          <Words text={next.date} size={11} color={muted} />
          {next.from ? <Words text={`Kept by ${next.from}`} size={11} color={gold} /> : null}
        </Col>
      ) : (
        <Words text="None in your calendars" size={13} color={muted} lines={2} />
      )}
    </Frame>
  );
}

// ── Coming Up ────────────────────────────────────────────────────────────
export function ComingUpWidgetAndroid({ day, box }: { day: WidgetDayProps; box: Box }) {
  const none = (text: string) => <Words text={text} size={12} color={muted} />;
  // What's coming (lib/widgetMore), or (from an older app) the holidays alone.
  const coming = day.comingUp ?? day.holidays.map((h) => ({ kind: 'holiday', name: h.name, detail: '', date: h.date, when: h.when, symbol: 'sparkles' }));
  const onlyHolidays = coming.every((c) => c.kind === 'holiday');
  const heading = onlyHolidays ? 'HOLIDAYS' : 'COMING UP';
  if (box.size === 'large') {
    const row = (key: string, symbol: string, name: string, detail: string, date: string, when: string) => (
      <FlexWidget key={key} style={{ flexDirection: 'row', alignItems: 'center', flexGap: 8, width: 'match_parent' }}>
        <Icon name={iconFor(symbol)} size={14} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <Words text={name} size={14} font={serif} />
          {detail ? <Words text={detail} size={11} color={muted} /> : null}
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Words text={date} size={11} color={muted} />
          <Words text={when} size={10} color={gold} />
        </FlexWidget>
      </FlexWidget>
    );
    return (
      <Frame box={box} uri={HORIZON} gap={8}>
        <Label text="MOON PHASES" />
        <Row>
          {day.phases.slice(0, 4).map((p) => (
            <FlexWidget key={p.date} style={{ flex: 1, flexDirection: 'column', alignItems: 'center', flexGap: 2 }}>
              <Moon symbol={p.symbol} size={18} />
              <Words text={p.name.split(' in ')[0]} size={10} weight="600" align="center" />
              <Words text={p.when} size={10} color={muted} align="center" />
            </FlexWidget>
          ))}
        </Row>
        <Spacer />
        <Label text={heading} />
        {coming.length ? coming.slice(0, 5).map((c, i) => row(`c${i}${c.name}`, c.symbol, c.name, c.detail, c.date, c.when)) : none('Nothing in your calendars')}
        <Spacer />
      </Frame>
    );
  }
  const item = (key: string, name: string, when: string, mark: React.ReactNode) => (
    <FlexWidget key={key} style={{ flexDirection: 'row', alignItems: 'center', flexGap: 5, width: 'match_parent' }}>
      {mark}
      <Col>
        <Words text={name} size={12} font={serif} />
        <Words text={when} size={10} color={muted} />
      </Col>
    </FlexWidget>
  );
  return (
    <Frame box={box} uri={HORIZON} row gap={12}>
      <Col gap={5} flex={1}>
        <Label text="MOON" />
        {day.phases.slice(0, 3).map((p) => item(`m${p.date}`, p.name, p.when, <Moon symbol={p.symbol} size={12} />))}
      </Col>
      <Col gap={5} flex={1}>
        <Label text={heading} />
        {coming.length
          ? coming.slice(0, 3).map((c, i) => item(`c${i}${c.name}`, c.name, c.when, onlyHolidays ? null : <Icon name={iconFor(c.symbol)} size={12} color={cream} />))
          : none('None ahead')}
      </Col>
    </Frame>
  );
}

// ── Next Ritual ──────────────────────────────────────────────────────────
export function RitualWidgetAndroid({ day, box, now }: { day: WidgetDayProps; box: Box; now: Date }) {
  const has = !!day.ritualId;
  const uri = day.ritualUrl || (has ? `saltandsovereignty://rituals/plan/${day.ritualId}` : 'saltandsovereignty://rituals/planner');
  const title = day.ritualKind === 'meeting' ? 'COVEN MEETING' : day.ritualKind === 'rite' ? 'COVEN RITE' : 'NEXT RITUAL';
  const small = (text: string, lines: number) => <Words text={text} size={12} color={muted} lines={lines} />;
  if (!has) {
    return (
      <Frame box={box} uri={uri} gap={4}>
        <Label text="NEXT RITUAL" />
        <Spacer />
        <Words text="Nothing planned" size={16} weight="600" font={serif} />
        {small('Tap to plan a working.', 2)}
      </Frame>
    );
  }
  const heading = (size: number) => (
    <Col gap={2}>
      <Label text={title} />
      <Words text={day.ritualTitle} size={size} weight="600" font={serif} lines={2} />
      <Words text={day.ritualWhen} size={12} weight="600" color={gold} />
      {day.ritualFrom && size > 16 ? <Words text={day.ritualFrom} size={12} /> : null}
      {day.ritualStart && size > 16 ? (
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flexGap: 3 }}>
          <Icon name="hourglass" size={10} color={muted} />
          <Words text={untilText(day.ritualStart, now)} size={11} color={muted} />
        </FlexWidget>
      ) : null}
    </Col>
  );
  if (box.size === 'large') {
    return (
      <Frame box={box} uri={uri} gap={10}>
        {heading(22)}
        {small(day.ritualMoon, 1)}
        {day.ritualIntention ? (
          <Col gap={2}>
            <Label text="INTENTION" />
            <Words text={day.ritualIntention} size={13} lines={3} />
          </Col>
        ) : null}
        {day.ritualNeeds.length ? (
          <Col gap={3}>
            <Label text="YOU'LL NEED" />
            {day.ritualNeeds.map((name) => (
              <FlexWidget key={name} style={{ flexDirection: 'row', alignItems: 'center', flexGap: 6 }}>
                <Icon name="circle" size={9} />
                <Words text={name} size={13} />
              </FlexWidget>
            ))}
          </Col>
        ) : day.ritualPrep ? (
          <Col gap={2}>
            <Label text="PREPARATION" />
            <Words text={day.ritualPrep} size={13} lines={6} />
          </Col>
        ) : null}
        <Spacer />
      </Frame>
    );
  }
  if (box.size === 'medium') {
    const needs = day.ritualNeeds.join(', ');
    return (
      <Frame box={box} uri={uri} row gap={14}>
        <Col gap={4} flex={1}>
          {heading(17)}
          <Spacer />
          {small(day.ritualIntention || day.ritualMoon, 2)}
        </Col>
        <Col gap={2} flex={1}>
          <Label text={needs ? "YOU'LL NEED" : day.ritualPrep ? 'PREPARATION' : 'THE MOON'} />
          <Words text={needs || day.ritualPrep || day.ritualMoon} size={12} lines={6} />
        </Col>
      </Frame>
    );
  }
  return (
    <Frame box={box} uri={uri} gap={3}>
      {heading(16)}
      <Spacer />
      {small(day.ritualFrom || (day.ritualNeeds.length ? `${day.ritualNeeds.length} thing${day.ritualNeeds.length === 1 ? '' : 's'} to gather` : day.ritualMoon), 2)}
    </Frame>
  );
}

/** Shown before the app has sent its first day. */
export function OpenAppWidget({ box, title }: { box: Box; title: string }) {
  return (
    <Frame box={box} gap={4}>
      <Label text={title.toUpperCase()} />
      <Spacer />
      <Words text="Open Salt & Sovereignty" size={15} weight="600" font={serif} lines={2} color={cream} />
      <Words text="to fill this in." size={12} color={muted} />
    </Frame>
  );
}
