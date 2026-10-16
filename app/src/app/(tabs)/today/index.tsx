import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../../components/Button';
import { CalendarLineList, LeadCalendarLine } from '../../../components/CalendarLines';
import { Icon } from '../../../components/Icon';
import { MoonDisc } from '../../../components/MoonDisc';
import { Screen } from '../../../components/Screen';
import { useReminderTaps } from '../../../lib/reminders/notifier';
import { PHASE_ORDER } from '../../../lib/reminders/schedule';
import { setHolidaySelection, syncSkyCalendar } from '../../../lib/reminders/calendarStore';
import { useReminders } from '../../../lib/reminders/store';
import { planSky, planWhen } from '../../../lib/rituals/format';
import { journalInsights } from '../../../lib/rituals/insights';
import { currentStep } from '../../../lib/rituals/lifecycle';
import { nextPlan } from '../../../lib/rituals/plans';
import { useRituals } from '../../../lib/rituals/store';
import { Tags } from '../../../components/more/ui';
import { dateFrom, daysBetween, shortDate, timeOfDay } from '../../../lib/calendar';
import { calendarEventsBetween, CALENDARS_LIVE, calendarSettingsKey, todayLines } from '../../../lib/calendars';
import { holidayChoice } from '../../../lib/holidays';
import { findByName, todayLibraryHref, useLibrary } from '../../../lib/library';
import { usePlace } from '../../../lib/location';
import { placeSky, skyNow, type PlaceSky, type Sky } from '../../../lib/sky';
import { primaryTradition } from '../../../lib/traditionDay';
import { useMySettings } from '../../../lib/settings/store';
import { buildToday, type HorizonItem, type TodayModel } from '../../../lib/today';
import { colors, fonts, radius, space, type } from '../../../theme';

/** A clock that ticks every quarter hour, for the void-of-course Moon and planetary hours. */
function useClock(): Date {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 15 * 60_000);
    return () => clearInterval(timer);
  }, []);
  return clock;
}

/** Re-render when the clock passes midnight so the date and moon stay current. */
function useToday(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const next = new Date(now);
    next.setHours(24, 0, 5, 0);
    const timer = setTimeout(() => setNow(new Date()), next.getTime() - now.getTime());
    return () => clearTimeout(timer);
  }, [now]);
  return now;
}

export default function Today() {
  const now = useToday();
  const { settings } = useMySettings();
  const choiceKey = `${settings?.calendar_traditions ?? ''}|${settings?.calendar_custom_holidays ?? ''}|${settings?.calendar_picked_holidays ?? ''}`;
  const primary = primaryTradition(settings, holidayChoice(settings));
  const place = usePlace();
  const placeKey = place ? `${place.latitude.toFixed(1)},${place.longitude.toFixed(1)}` : '';
  const calendarKey = calendarSettingsKey(settings);
  // The other calendars: the moon's date when it leads, a line for each shown, and their observances.
  const lines = useMemo(
    () => (CALENDARS_LIVE ? todayLines(now, settings, place) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the keys stand in for the settings and place they read
    [now, calendarKey, placeKey],
  );
  const calendarEvents = useMemo(
    () => !CALENDARS_LIVE ? [] : calendarEventsBetween(now, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60), settings, place),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the keys stand in for the settings and place they read
    [now, calendarKey, placeKey],
  );
  const lead = lines.find((line) => line.lead) ?? null;
  const beside = lines.filter((line) => !line.lead);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- choiceKey stands in for the calendar settings it reads
  const today = useMemo(() => buildToday(now, holidayChoice(settings), primary, calendarEvents), [now, choiceKey, primary, calendarEvents]);
  const clock = useClock();
  const sky = useMemo(() => skyNow(clock, { planets: false }), [clock]);
  const here = useMemo(() => (place ? placeSky(clock, place) : null), [clock, place]);
  const show = (settings?.today_show as string) || 'both';

  const side = show === 'both' && settings?.today_layout === 'side';
  // Side by side: each half gets an exact width from the screen, so neither
  // can grow over the other on any phone.
  const { width: screenWidth } = useWindowDimensions();
  const halfWidth = Math.floor((screenWidth - space.gutter * 2 - SIDE_GAP) / 2);
  const half = { width: halfWidth };
  const rituals = useRituals();
  const reminders = useReminders();
  useReminderTaps();
  // Keep phone-calendar holidays in step with the calendars chosen in Settings.
  useEffect(() => {
    if (settings && setHolidaySelection(holidayChoice(settings))) void syncSkyCalendar(reminders.settings.phases);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the calendar choice changes
  }, [choiceKey, settings !== null]);
  const next = nextPlan(rituals.plans, new Date());
  const active = rituals.active;
  const step = active ? currentStep(active) : null;
  const moonReminders = PHASE_ORDER.some((p) => reminders.settings.phases[p]);

  // Under the moon when stacked; below the row when side by side, where a half is too narrow.
  const reminderButton = (
    <Button
      variant="pill"
      label={moonReminders ? 'Moon reminders on' : 'Remind me of the moon'}
      accessibilityHint="Choose which moon phases to be reminded of"
      icon={<Icon name="bell" size={16} color={colors.gold} />}
      onPress={() => router.navigate('/today/reminders')}
    />
  );

  return (
    <Screen>
      <View style={styles.header}>
        {lead && <LeadCalendarLine line={lead} />}
        <Text style={[type.eyebrow, styles.date]}>{today.dateLine}</Text>
        <Text style={styles.ruler}>{today.rulerLine}</Text>
        {today.tradition && <Text style={[type.caption, styles.center]}>{today.tradition.line}</Text>}
        {today.tradition?.detail && <Text style={[type.caption, styles.center, styles.muted]}>{today.tradition.detail}</Text>}
        <CalendarLineList lines={beside} />
      </View>

      <View style={side ? styles.sideBySide : styles.stacked}>
        {show !== 'holiday' && (
          <View style={side ? half : styles.stacked}>
            <MoonPanel today={today} compact={side} />
            {!side && reminderButton}
          </View>
        )}
        {show !== 'moon' &&
          (side ? (
            // Only a holiday happening today shows here; otherwise this half stays empty.
            <View style={half}>{today.holidaysToday.length > 0 && <HolidayPanel today={today} compact />}</View>
          ) : today.holidaysToday.length > 0 ? (
            <HolidayPanel today={today} compact={false} />
          ) : show === 'holiday' ? (
            <Text style={[type.caption, styles.center]}>No holiday today</Text>
          ) : null)}
      </View>
      {side && reminderButton}


      <View style={styles.working}>
        {active ? (
          <>
            <View style={styles.workingText}>
              <Text style={[type.eyebrow, styles.gold]}>{active.status === 'paused' ? 'Paused' : 'Under way'}</Text>
              <Text style={type.cardTitle}>{active.title || 'Your ritual'}</Text>
              <Text style={type.caption}>{step ? step.title : 'Finish and journal it when you are ready.'}</Text>
            </View>
            <Button label="Continue the ritual" onPress={() => router.navigate('/rituals/run')} />
          </>
        ) : next ? (
          <>
            <View style={styles.workingText}>
              <Text style={[type.eyebrow, styles.gold]}>Your next working</Text>
              <Text style={type.cardTitle}>{next.title}</Text>
              <Text style={type.caption}>{`${planWhen(next, now)} · ${planSky(next)}`}</Text>
            </View>
            <Button
              label="Open the plan"
              onPress={() => router.navigate({ pathname: '/rituals/plan/[id]', params: { id: next.id } })}
            />
          </>
        ) : (
          <>
            <View style={styles.workingText}>
              <Text style={[type.eyebrow, styles.gold]}>Your next working</Text>
              <Text style={type.cardTitle}>Nothing planned yet</Text>
              <Text style={type.caption}>Choose an intention and we'll find the right night.</Text>
            </View>
            <Button label="Plan a ritual" onPress={() => router.navigate('/rituals/planner')} />
          </>
        )}
      </View>

      <View style={styles.horizon}>
        <Text style={type.eyebrow}>On the horizon</Text>
        <View style={styles.tiles}>
          {today.horizon.map((item) => (
            <HorizonTile key={item.title} item={item} />
          ))}
        </View>
        <Text style={[type.caption, styles.center]}>{today.nextSyzygyLine}</Text>
        {today.eclipseLine && <Text style={[type.caption, styles.center, styles.gold]}>{today.eclipseLine}</Text>}
      </View>

      <DaySky today={today} sky={sky} here={here} now={clock} />
      <CorrespondencesCard today={today} />
      <Button
        label="Set tonight’s altar"
        variant="outline"
        accessibilityHint="Opens a starter altar for today's planet, moon or holiday"
        onPress={() => router.navigate({ pathname: '/altar/[altarId]', params: { altarId: 'tonight', from: 'today' } })}
      />
      <View style={styles.prompt}>
        <Text style={[type.eyebrow, styles.gold]}>Reflect</Text>
        <Text style={styles.promptText}>{today.prompt}</Text>
      </View>
      <LastTimeLine journal={rituals.journal} now={clock} />
    </Screen>
  );
}

const PRINCIPAL = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];

/** On a new, quarter or full moon: what you did last time the moon looked like this. */
function LastTimeLine({ journal, now }: { journal: Parameters<typeof journalInsights>[0]; now: Date }) {
  const last = useMemo(() => journalInsights(journal, now).lastThisPhase, [journal, now]);
  if (!last || !PRINCIPAL.includes(last.phase)) return null;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Last ${last.phase} you kept ${last.entry.title || 'a ritual'}. Opens your journal.`}
      onPress={() => router.navigate({ pathname: '/today/journal/[id]', params: { id: last.entry.id } })}
      style={({ pressed }) => [styles.lastTime, pressed && { opacity: 0.7 }]}
    >
      <Text style={type.caption}>
        {`Last ${last.phase} you kept `}
        <Text style={styles.gold}>{`“${last.entry.title || 'a ritual'}”`}</Text>
        {' ›'}
      </Text>
    </Pressable>
  );
}

function MoonPanel({ today, compact }: { today: TodayModel; compact: boolean }) {
  return (
    <View style={styles.moon} accessible accessibilityLabel={`${today.moon.name}. ${today.signLine}. ${today.illuminationLine}`}>
      <MoonDisc size={compact ? 80 : 136} illumination={today.moon.illumination} waxing={today.moon.waxing} />
      <Text accessibilityRole="header" style={[styles.phase, compact && styles.phaseCompact, styles.wide]}>
        {today.moon.name}
      </Text>
      <Text style={[styles.sign, compact && styles.signCompact, styles.wide]}>{today.signLine}</Text>
      <Text style={[type.caption, styles.wide]}>{today.illuminationLine}</Text>
    </View>
  );
}

/** Holidays happening today, from the chosen calendars, with what they mean. */
function HolidayPanel({ today, compact }: { today: TodayModel; compact: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens your calendars and the holidays ahead"
      onPress={() => router.navigate('/today/calendar')}
      style={({ pressed }) => [styles.holiday, compact && styles.holidayCompact, pressed && styles.pressed]}
    >
      {today.holidaysToday.map((holiday, i) => (
        <View key={holiday.id} style={styles.holidayItem} accessible accessibilityLabel={`${today.holidayWhen[i]}: ${holiday.name}. ${holiday.meaning}`}>
          <Text style={[type.eyebrow, styles.gold]}>{`${today.holidayWhen[i]} · ${today.holidayTerms[i]}`}</Text>
          <Text style={[styles.holidayName, compact && styles.holidayNameCompact]}>{holiday.name}</Text>
          <Text style={[type.caption, compact && styles.small]}>{holiday.traditions.join(' · ')}</Text>
          <Text style={[styles.meaning, compact && styles.meaningCompact]}>{holiday.meaning}</Text>
        </View>
      ))}
    </Pressable>
  );
}

const PERSONAL = ['Mercury', 'Venus', 'Mars'];

/** What today is good for, and what the sky is doing that matters for it. */
function DaySky({ today, sky, here, now }: { today: TodayModel; sky: Sky; here: PlaceSky | null; now: Date }) {
  const lines: string[] = [];
  if (sky.vocNow) {
    lines.push(`Moon void of course until ${relativeTime(now, sky.voc.end)}: rest and finish things rather than begin.`);
  } else if (daysBetween(now, sky.voc.start) === 0) {
    lines.push(`Moon void of course from ${timeOfDay(sky.voc.start)} until ${relativeTime(now, sky.voc.end)}.`);
  }
  for (const r of sky.retrogrades.filter((r) => PERSONAL.includes(r.planet))) {
    lines.push(
      r.when === 'now'
        ? `${r.planet} retrograde until ${dateFrom(now, r.date)}.`
        : `${r.planet} turns retrograde ${daysBetween(now, r.date) <= 1 ? relativeTime(now, r.date) : `in ${daysBetween(now, r.date)} days (${shortDate(r.date)})`}.`,
    );
  }
  lines.push(`${sky.sunSign} season${sky.sunSignEnds ? ` until ${dateFrom(now, sky.sunSignEnds)}` : ''}: ${sky.sunSeason}.`);

  return (
    <View style={styles.card}>
      <Text style={[type.eyebrow, styles.gold]}>Today’s sky</Text>
      <Text style={styles.goodFor}>{today.goodFor}</Text>
      {lines.map((line) => (
        <Text key={line} style={type.caption}>
          {line}
        </Text>
      ))}
      {here ? (
        <>
          <Text style={type.caption}>
            {[
              here.sun.rise && `Sunrise ${timeOfDay(here.sun.rise)}`,
              here.sun.set && `sunset ${timeOfDay(here.sun.set)}`,
              here.moon.rise && `moonrise ${timeOfDay(here.moon.rise)}`,
              here.moon.set && `moonset ${timeOfDay(here.moon.set)}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {here.hour && (
            <Text style={[type.caption, styles.gold]}>{`Planetary hour of ${here.hour.planet} until ${timeOfDay(here.hour.end)}`}</Text>
          )}
        </>
      ) : (
        <Text style={type.caption}>Add your location on the Sky screen for sunrise, moonrise and planetary hours.</Text>
      )}
      <Button label="The sky today" variant="outline" onPress={() => router.navigate('/today/sky')} />
    </View>
  );
}

function relativeTime(now: Date, date: Date): string {
  const days = daysBetween(now, date);
  const day = days === 0 ? 'today' : days === 1 ? 'tomorrow' : shortDate(date);
  return `${day} at ${timeOfDay(date)}`;
}

/** The weekday's traditional correspondences, linked to the Living Library where it has them. */
function CorrespondencesCard({ today }: { today: TodayModel }) {
  const { entries } = useLibrary();
  const c = today.correspondences;
  const open = (name: string) => {
    const entry = findByName(entries, name);
    return entry ? () => router.navigate(todayLibraryHref(entry)) : undefined;
  };
  return (
    <View style={styles.card}>
      <Text style={[type.eyebrow, styles.gold]}>{`Correspondences · ${c.planet === 'Sun' || c.planet === 'Moon' ? `the ${c.planet}` : c.planet}`}</Text>
      <CorrRow label="Colors" text={c.colors.join(', ')} />
      <View style={styles.corrRow}>
        <Text style={styles.corrLabel}>Crystals</Text>
        <Tags items={c.crystals} onPress={open} />
      </View>
      <View style={styles.corrRow}>
        <Text style={styles.corrLabel}>Herbs</Text>
        <Tags items={c.herbs} onPress={open} />
      </View>
      <CorrRow label="Metal" text={c.metal} />
      <CorrRow label="Incense" text={c.incense} />
      <CorrRow label="Candle" text={c.candle} />
    </View>
  );
}

function CorrRow({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.corrRow}>
      <Text style={styles.corrLabel}>{label}</Text>
      <Text style={styles.corrText}>{text}</Text>
    </View>
  );
}

const SIDE_GAP = 10;

const PHASE_DISC: Record<string, { illumination: number; waxing: boolean }> = {
  new: { illumination: 0, waxing: true },
  firstQuarter: { illumination: 0.5, waxing: true },
  full: { illumination: 1, waxing: true },
  lastQuarter: { illumination: 0.5, waxing: false },
};

function HorizonTile({ item }: { item: HorizonItem }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${item.title}, ${item.detail}`}>
      {item.kind === 'holiday' ? (
        <Icon name={item.title.startsWith('Samhain') ? 'samhain' : 'wheel'} size={26} color={colors.gold} />
      ) : (
        <MoonDisc size={26} {...PHASE_DISC[item.phase]} halo={false} />
      )}
      <View style={styles.tileText}>
        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={type.caption}>{item.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 4, marginTop: 8 },
  date: { letterSpacing: 2.5 },
  ruler: { fontFamily: fonts.displayItalic, fontSize: 17, color: colors.gold, textAlign: 'center' },
  moon: { alignItems: 'center', gap: 6 },
  phase: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, color: colors.cream, textAlign: 'center', marginTop: 4 },
  center: { textAlign: 'center' },
  sign: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 24, color: colors.gold },
  signCompact: { fontSize: 14, lineHeight: 18 },
  phaseCompact: { fontSize: 24, lineHeight: 28 },
  wide: { alignSelf: 'stretch', textAlign: 'center' },
  stacked: { gap: 18 },
  sideBySide: { flexDirection: 'row', gap: SIDE_GAP, alignItems: 'flex-start' },
  holiday: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.5)',
    padding: 16,
    gap: 14,
  },
  holidayCompact: { padding: 12, gap: 10 },
  holidayItem: { gap: 4 },
  holidayName: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, color: colors.cream },
  holidayNameCompact: { fontSize: 19, lineHeight: 23 },
  meaning: { ...type.body, color: colors.parchment },
  meaningCompact: { fontSize: 13, lineHeight: 18 },
  small: { fontSize: 12, lineHeight: 16 },
  pressed: { opacity: 0.75 },
  muted: { color: colors.tabInactive },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 8,
  },
  goodFor: { ...type.body, color: colors.parchment },
  corrRow: { gap: 4 },
  corrLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold },
  corrText: { ...type.body, color: colors.cream },
  lastTime: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  prompt: { borderLeftWidth: 2, borderLeftColor: colors.goldLine, paddingLeft: 14, gap: 4 },
  promptText: { fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 27, color: colors.cream },
  gold: { color: colors.gold },
  working: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(226,195,109,0.24)',
    padding: 16,
    gap: 14,
  },
  workingText: { gap: 3 },
  horizon: { gap: 10 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: radius.tile,
    padding: 14,
  },
  tileText: { flexShrink: 1, gap: 2 },
  tileTitle: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.cream },
});
