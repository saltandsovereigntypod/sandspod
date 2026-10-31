import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../../components/Button';
import { CovenToday } from '../../../components/covens/CovenToday';
import { TendToday } from '../../../components/tend/TendToday';
import { CycleToday } from '../../../components/cycle/CycleToday';
import { JournalToday } from '../../../components/journals/JournalToday';
import { CalendarLineList, LeadCalendarLine } from '../../../components/CalendarLines';
import { Icon } from '../../../components/Icon';
import { MoonDisc } from '../../../components/MoonDisc';
import { Screen } from '../../../components/Screen';
import { SegmentedSwitch } from '../../../components/SegmentedSwitch';
import { preloadRememberedTab, useRememberedTab } from '../../../lib/rememberedTab';
import { asTodayTab, TODAY_TAB_KEY, TODAY_TABS, todayTabFor } from '../../../lib/screenTabs';
import { useReminderTaps } from '../../../lib/reminders/notifier';
import { PHASE_ORDER } from '../../../lib/reminders/schedule';
import { setHolidaySelection, syncSkyCalendar } from '../../../lib/reminders/calendarStore';
import { useReminders } from '../../../lib/reminders/store';
import { journalInsights } from '../../../lib/rituals/insights';
import { dueLookBacks } from '../../../lib/rituals/lookBack';
import type { JournalRow } from '../../../lib/rituals/types';
import { DidItWork } from '../../../components/rituals/DidItWork';
import { NextWorking } from '../../../components/rituals/NextWorking';
import { ItemDidItWork } from '../../../components/rituals/ItemDidItWork';
import { dueItems } from '../../../lib/altar/apothecaryLookBack';
import { useWorkshop } from '../../../lib/altar/workshop';
import { useRituals } from '../../../lib/rituals/store';
import { Field, Tags } from '../../../components/more/ui';
import { dateFrom, daysBetween, shortDate, timeOfDay } from '../../../lib/calendar';
import { calendarEventsBetween, calendarSettingsKey, hemisphereOf, todayLines } from '../../../lib/calendars';
import { holidayChoice, type Holiday } from '../../../lib/holidays';
import { findByName, todayLibraryHref, useLibrary } from '../../../lib/library';
import { usePlace } from '../../../lib/location';
import { placeSky, skyNow, type PlaceSky, type Sky } from '../../../lib/sky';
import { TermText } from '../../../components/astro/Explain';
import { todayLine } from '../../../lib/astro/craftLinks';
import { castChart } from '../../../lib/astro/natal';
import { chartOptionsFrom } from '../../../lib/astro/prefs';
import { myChart, useAstro } from '../../../lib/astro/store';
import { primaryTradition } from '../../../lib/traditionDay';
import { useMySettings } from '../../../lib/settings/store';
import { todaySettings } from '../../../lib/library/traditions';
import { buildToday, type HorizonItem, type TodayModel } from '../../../lib/today';
import { practiceToday } from '../../../lib/craft/today';
import { hearthToday } from '../../../lib/craft/hearth/today';
import { DREAMS, morningDreamPrompt, normalizeDream, quickDream } from '../../../lib/craft/hedge/dreams';
import { addEntry, useCraft } from '../../../lib/craft/store';
import { DREAM_ROUTES } from '../../../lib/grimoire/dreams';
import { dreamPromptOnToday } from '../../../lib/settings/links';
import { normalizeReading, READINGS } from '../../../lib/craft/hedge/readings';
import { drawOnToday, todaysCard, todaysCardLabel } from '../../../lib/divination/daily';
import { deipnonToday } from '../../../lib/deipnon';
import { keepsSouthernWheel, seasonalSpreads } from '../../../lib/divination/seasonal';
import { deityLines } from '../../../lib/patron';
import { hasHolyPage, holyRef, moonRef, principalRef } from '../../../lib/holy';
import { forYou, forYouContext, myPractices } from '../../../lib/rituals/premade';
import { seasonCounting, seasonLine } from '../../../lib/seasons';
import { useCovenPaths } from '../../../lib/covens/useCovenTraditions';
import type { Place } from '../../../lib/astro/rise';
import { colors, fonts, radius, space, type } from '../../../theme';

void preloadRememberedTab(TODAY_TAB_KEY);

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
  const { settings: mySettings } = useMySettings();
  // With no calendars chosen, Today follows My path.
  const settings = useMemo(() => todaySettings(mySettings), [mySettings]);
  const choiceKey = `${settings?.calendar_traditions ?? ''}|${settings?.calendar_custom_holidays ?? ''}|${settings?.calendar_picked_holidays ?? ''}`;
  const primary = primaryTradition(settings, holidayChoice(settings));
  const place = usePlace();
  const placeKey = place ? `${place.latitude.toFixed(1)},${place.longitude.toFixed(1)}` : '';
  const calendarKey = calendarSettingsKey(settings);
  // The other calendars: the moon's date when it leads, a line for each shown, and their observances.
  const lines = useMemo(
    () => todayLines(now, settings, place),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the keys stand in for the settings and place they read
    [now, calendarKey, placeKey],
  );
  const calendarEvents = useMemo(
    () => calendarEventsBetween(now, new Date(now.getFullYear(), now.getMonth(), now.getDate() + 60), settings, place),
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
  const moonReminders = PHASE_ORDER.some((p) => reminders.settings.phases[p]);

  // Under the moon when stacked; below the row when side by side, where a half is too narrow.
  const reminderButton = (
    <Button
      variant="pill"
      label={moonReminders ? 'Moon reminders on' : 'Remind me of the moon'}
      accessibilityHint="Choose which moon phases to be reminded of"
      icon={<Icon name="bell" size={16} color={colors.gold} />}
      onPress={() => router.navigate({ pathname: '/today/reminders', params: { section: 'moon' } })}
    />
  );

  // Two tabs: what's happening for you today, and the wider sky and lore.
  const [remembered, rememberTab] = useRememberedTab(TODAY_TAB_KEY, asTodayTab);
  const tab = remembered ?? 'today';
  // A link to one of Today's sections (/today?section=moon, or ?tab=sky)
  // opens the tab that holds it; the link is then cleared so it works again.
  const params = useLocalSearchParams<{ tab?: string; section?: string }>();
  const linked = todayTabFor(params);
  useEffect(() => {
    if (!linked) return;
    rememberTab(linked);
    router.setParams({ tab: undefined, section: undefined });
  }, [linked, params.tab, params.section, rememberTab]);
  // Tapping Today in the tab bar while already here goes back to the first tab.
  const navigation = useNavigation();
  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;
    return parent.addListener('tabPress' as never, () => {
      if (navigation.isFocused()) rememberTab('today');
    });
  }, [navigation, rememberTab]);

  return (
    <Screen>
      <SegmentedSwitch label="Today" options={TODAY_TABS} value={tab} onChange={rememberTab} />
      {tab === 'today' ? (
        <>
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

          <NextWorking now={now} variant="today" />

          <CovenToday />

          <TendToday />

          <CycleToday />

          <LookBackDue journal={rituals.journal} now={now} />

          <DreamCapture settings={settings} now={clock} reminderOn={reminders.settings.dreamMorning} />
          <DeipnonCard settings={settings} now={clock} />
          <JournalToday settings={settings} now={clock} />
          {drawOnToday(settings) && <CardOfTheDay now={clock} south={keepsSouthernWheel(settings)} />}
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
          <Pressable
            accessibilityRole="link"
            accessibilityHint="Choose what Today shows"
            onPress={() => router.navigate('/today/settings/today')}
            style={styles.customise}
          >
            <Text style={[type.caption, styles.gold, styles.center]}>Customise Today ›</Text>
          </Pressable>
        </>
      ) : (
        <>
          <DaySky today={today} sky={sky} here={here} now={clock} season={seasonLine(clock, hemisphereOf(settings, place), seasonCounting(settings))} />
          <CorrespondencesCard today={today} />

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

          <PracticeCard settings={settings} place={place} now={clock} />
        </>
      )}
    </Screen>
  );
}

type SettingsLike = Record<string, unknown> | null | undefined;

/**
 * In the morning hours, for someone who keeps a dream journal: catch last
 * night's dream in a line or two. It goes into the Grimoire's Dreams.
 */
function DreamCapture({ settings, now, reminderOn }: { settings: SettingsLike; now: Date; reminderOn: boolean }) {
  const { entries } = useCraft<unknown>(DREAMS);
  const [text, setText] = useState('');
  const [kept, setKept] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dreams = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const keepsHedge = myPractices(settings).includes('hedge');
  const prompt = dreamPromptOnToday(settings) ? morningDreamPrompt(now, { keepsHedge, reminderOn, dreams: kept ? [] : dreams }) : null;

  if (kept) {
    return (
      <View style={styles.working}>
        <Text style={[type.eyebrow, styles.gold]}>Last night’s dream</Text>
        <Text style={type.body}>Kept in your Grimoire, with the moon it came under.</Text>
        <Button label="Add symbols and feelings" variant="outline" onPress={() => router.navigate(DREAM_ROUTES.edit(kept) as never)} />
      </View>
    );
  }
  if (!prompt) return null;

  const keep = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const entry = await addEntry(DREAMS, quickDream(text, new Date()));
      setText('');
      setKept(entry.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.working}>
      <Text style={[type.eyebrow, styles.gold]}>{prompt.title}</Text>
      <Text style={type.caption}>{prompt.detail}</Text>
      <Field label="What you remember" value={text} onChangeText={setText} placeholder="Even a fragment: a place, a face, a feeling" multiline />
      <View style={styles.dreamActions}>
        <Button label={saving ? 'Keeping it…' : 'Keep it'} onPress={keep} disabled={!text.trim() || saving} />
        <Button label="Write it in full" variant="text" onPress={() => router.navigate(DREAM_ROUTES.write as never)} />
      </View>
    </View>
  );
}

/** For your practice: a line from each practice kept, and a working that suits tonight. */
function PracticeCard({ settings, place, now }: { settings: SettingsLike; place: Place | null; now: Date }) {
  const practices = myPractices(settings);
  const tick = now.getTime(); // Today’s clock ticks each quarter hour
  const kept = practices.join(',');
  const covenPaths = useCovenPaths();
  const lines = useMemo(
    () => practiceToday(practices, now, { place, choice: holidayChoice(settings) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recomputed as the clock ticks, and when the practices or place change
    [kept, tick, place?.latitude, place?.longitude, settings?.calendar_traditions],
  );
  // Hearth & land's seasonal nudge: a festival food that's near, or what's in the hedgerow.
  const hearth = useMemo(
    () => hearthToday(practices, now, { place, choice: holidayChoice(settings) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as above
    [kept, tick, place?.latitude, settings?.calendar_traditions],
  );
  const working = useMemo(
    () => forYou(forYouContext(settings, now, covenPaths), undefined, 1)[0] ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as above
    [kept, tick, settings?.calendar_traditions, settings?.library_path, covenPaths],
  );

  const deities = useMemo(
    () => deityLines(settings, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- as above
    [kept, tick, settings?.my_deities],
  );

  if (!practices.length && !deities.length) {
    return (
      <Pressable accessibilityRole="link" onPress={() => router.navigate('/today/settings/practice')} style={styles.working}>
        <Text style={[type.eyebrow, styles.gold]}>For your practice</Text>
        <Text style={type.body}>Choose the practices you keep, green, kitchen, hedge, cosmic and more, and Today will offer something from each.</Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.working}>
      <Text style={[type.eyebrow, styles.gold]}>For your practice</Text>
      {deities.map((line) => (
        <Pressable
          key={`deity-${line.deity.key ?? line.deity.name}`}
          accessibilityRole="link"
          accessibilityLabel={`${line.label}: ${line.line}`}
          onPress={() => router.navigate(line.href as never)}
          style={styles.practiceRow}
        >
          <View style={styles.practiceText}>
            <Text style={styles.practiceLabel}>{line.label}</Text>
            <Text style={[type.body, line.holyToday && styles.gold]}>{line.line}</Text>
            {!!line.detail && <Text style={type.caption}>{line.detail}</Text>}
          </View>
          <Icon name="chevron" size={16} color={colors.gold} />
        </Pressable>
      ))}
      {lines.map((line) => (
        <Pressable
          key={line.practice}
          accessibilityRole="link"
          accessibilityLabel={`${line.label}: ${line.line}`}
          onPress={() => router.navigate(line.href as never)}
          style={styles.practiceRow}
        >
          <View style={styles.practiceText}>
            <Text style={styles.practiceLabel}>{line.label}</Text>
            <Text style={type.body}>{line.line}</Text>
            {!!line.detail && <Text style={type.caption}>{line.detail}</Text>}
          </View>
          <Icon name="chevron" size={16} color={colors.gold} />
        </Pressable>
      ))}
      {hearth && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${hearth.label}: ${hearth.line}`}
          onPress={() => router.navigate(hearth.href as never)}
          style={styles.practiceRow}
        >
          <View style={styles.practiceText}>
            <Text style={styles.practiceLabel}>{hearth.label}</Text>
            <Text style={type.body}>{hearth.line}</Text>
            {!!hearth.detail && <Text style={type.caption}>{hearth.detail}</Text>}
          </View>
          <Icon name="chevron" size={16} color={colors.gold} />
        </Pressable>
      )}
      {working && (
        <Pressable
          accessibilityRole="link"
          onPress={() => router.navigate({ pathname: '/rituals/premade/[id]', params: { id: working.id } })}
          style={styles.practiceRow}
        >
          <View style={styles.practiceText}>
            <Text style={styles.practiceLabel}>A working for tonight</Text>
            <Text style={type.body}>{working.title}</Text>
            <Text style={type.caption}>{working.summary}</Text>
          </View>
          <Icon name="chevron" size={16} color={colors.gold} />
        </Pressable>
      )}
    </View>
  );
}

/** "Did it work?" for a ritual or spell whose look-back day has come, or else a spell jar, sachet or other working. */
function LookBackDue({ journal, now }: { journal: JournalRow[]; now: Date }) {
  const due = useMemo(() => dueLookBacks(journal, now), [journal, now]);
  const { apothecary } = useWorkshop();
  const made = useMemo(() => dueItems(apothecary, now), [apothecary, now]);
  if (!due.length && made.length) {
    const [item, ...others] = made;
    return (
      <View style={styles.lookBack}>
        <ItemDidItWork key={item.id} item={item} compact />
        <Pressable
          accessibilityRole="link"
          onPress={() => router.navigate(others.length ? '/rituals/apothecary' : { pathname: '/rituals/apothecary/[id]', params: { id: item.id } })}
          style={({ pressed }) => pressed && { opacity: 0.7 }}
        >
          <Text style={[type.caption, styles.center]}>{others.length ? `Open “${item.name}” · ${others.length} more waiting ›` : `Open “${item.name}” ›`}</Text>
        </Pressable>
      </View>
    );
  }
  if (!due.length) return null;
  const [first, ...more] = due;
  return (
    <View style={styles.lookBack}>
      <DidItWork key={first.id} entry={first} compact />
      <Pressable
        accessibilityRole="link"
        onPress={() => router.navigate({ pathname: '/today/journal/[id]', params: { id: first.id } })}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
      >
        <Text style={[type.caption, styles.center]}>
          {more.length + made.length
            ? `Open “${first.title || 'the entry'}” · ${more.length + made.length} more waiting in your journal ›`
            : `Open “${first.title || 'the entry'}” ›`}
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * On Hekate's Deipnon, the last day of the Attic month, for those who keep
 * the Hellenic monthly days or hold Hekate as patron: clear the house, leave
 * her supper, draw the Crossroads. Turned off in Settings → Today.
 */
function DeipnonCard({ settings, now }: { settings: SettingsLike; now: Date }) {
  const day = now.toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once a day, and when settings change
  const prompt = useMemo(() => deipnonToday(now, settings), [day, settings]);
  if (!prompt) return null;
  return (
    <View style={styles.working}>
      <View style={styles.workingText}>
        <Text style={[type.eyebrow, styles.gold]}>Tonight</Text>
        <Text style={type.cardTitle}>{prompt.title}</Text>
        <Text style={type.caption}>{prompt.detail}</Text>
        {prompt.steps.map((step) => (
          <Text key={step} style={type.body}>{`•  ${step}`}</Text>
        ))}
      </View>
      <Button label="Draw the Crossroads spread" onPress={() => router.navigate({ pathname: '/rituals/divination/draw', params: { spread: prompt.spread } })} />
    </View>
  );
}

/** A card for the day: one to draw, or the one you've kept today. Turned off in Settings → Today. */
function CardOfTheDay({ now, south }: { now: Date; south: boolean }) {
  const { entries } = useCraft<unknown>(READINGS);
  const day = now.toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- once a day
  const seasonal = useMemo(() => seasonalSpreads(now, { south })[0] ?? null, [day, south]);
  const kept = useMemo(
    () => todaysCard(entries.map((e) => ({ ...e, data: normalizeReading(e.data) })), now),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once a day, and when the readings change
    [entries, day],
  );
  return (
    <>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={kept ? `Today’s card: ${todaysCardLabel(kept)}. Opens the reading.` : 'Draw a card for the day'}
        onPress={() =>
          kept
            ? router.navigate({ pathname: '/rituals/divination/[id]', params: { id: kept.id } })
            : router.navigate({ pathname: '/rituals/divination/draw', params: { spread: 'daily' } })
        }
        style={({ pressed }) => [styles.lastTime, pressed && { opacity: 0.7 }]}
      >
        {kept ? (
          <Text style={type.caption}>
            {'Today’s card: '}
            <Text style={styles.gold}>{todaysCardLabel(kept)}</Text>
            {' ›'}
          </Text>
        ) : (
          <Text style={[type.caption, styles.gold]}>Draw a card for the day ›</Text>
        )}
      </Pressable>
      {seasonal && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${seasonal.why}. Draw the ${seasonal.label} spread.`}
          onPress={() => router.navigate({ pathname: '/rituals/divination/draw', params: { spread: seasonal.spread } })}
          style={({ pressed }) => [styles.lastTime, pressed && { opacity: 0.7 }]}
        >
          <Text style={type.caption}>
            {`${seasonal.why}: `}
            <Text style={styles.gold}>{seasonal.label}</Text>
            {' ›'}
          </Text>
        </Pressable>
      )}
    </>
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
    <Pressable
      style={({ pressed }) => [styles.moon, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={`${today.moon.name}. ${today.signLine}. ${today.illuminationLine}`}
      accessibilityHint="Opens what this phase of the moon means and what it's good for"
      onPress={() => router.navigate({ pathname: '/today/holy/[ref]', params: { ref: moonRef(today.moon) } })}
    >
      <MoonDisc size={compact ? 80 : 136} illumination={today.moon.illumination} waxing={today.moon.waxing} />
      <Text accessibilityRole="header" style={[styles.phase, compact && styles.phaseCompact, styles.wide]}>
        {today.moon.name}
      </Text>
      <Text style={[styles.sign, compact && styles.signCompact, styles.wide]}>{today.signLine}</Text>
      <Text style={[type.caption, styles.wide]}>{today.illuminationLine}</Text>
    </Pressable>
  );
}

/** Holidays happening today, from the chosen calendars, with what they mean. */
function HolidayPanel({ today, compact }: { today: TodayModel; compact: boolean }) {
  return (
    <View style={[styles.holiday, compact && styles.holidayCompact]}>
      {today.holidaysToday.map((holiday, i) => (
        <Pressable
          key={holiday.id}
          style={({ pressed }) => [styles.holidayItem, pressed && styles.pressed]}
          accessibilityRole="link"
          accessibilityLabel={`${today.holidayWhen[i]}: ${holiday.name}. ${holiday.meaning}`}
          accessibilityHint={hasHolyPage(holiday.id) ? 'Opens what this day is and how to keep it' : 'Opens your calendars and the holidays ahead'}
          onPress={() => openHoliday(holiday.id)}
        >
          <Text style={[type.eyebrow, styles.gold]}>{`${today.holidayWhen[i]} · ${today.holidayTerms[i]}`}</Text>
          <Text style={[styles.holidayName, compact && styles.holidayNameCompact]}>{holiday.name}</Text>
          <View style={[styles.recurs, holiday.recurs === 'yearly' && styles.recursYearly]}>
            <Text style={[styles.recursText, holiday.recurs === 'yearly' && styles.recursTextYearly]}>{RECURS[holiday.recurs]}</Text>
          </View>
          <Text style={[type.caption, compact && styles.small]}>{holiday.traditions.join(' · ')}</Text>
          <Text style={[styles.meaning, compact && styles.meaningCompact]}>{holiday.meaning}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// How often a holiday comes round, so a monthly holy day and a yearly festival
// on the same day (Apollo's Hebdomē and the Pyanepsia) read as different things.
const RECURS: Record<Holiday['recurs'], string> = { yearly: 'Once a year', monthly: 'Every month', weekly: 'Every week', once: 'This year only' };

/** A holiday's own page when it has one, else the calendars. */
function openHoliday(id: string) {
  if (hasHolyPage(id)) router.navigate({ pathname: '/today/holy/[ref]', params: { ref: holyRef(id) } });
  else router.navigate('/today/calendar');
}

const PERSONAL = ['Mercury', 'Venus', 'Mars'];

/** What today is good for, and what the sky is doing that matters for it. */
function DaySky({ today, sky, here, now, season }: { today: TodayModel; sky: Sky; here: PlaceSky | null; now: Date; season: string }) {
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
  // The season of the year, counted as chosen in Settings → Location & hemisphere (lib/seasons.ts).
  lines.push(season);

  return (
    <View style={styles.card}>
      <Text style={[type.eyebrow, styles.gold]}>Today’s sky</Text>
      <TermText style={styles.goodFor} text={today.goodFor} />
      {lines.map((line) => (
        <TermText key={line} style={type.caption} text={line} />
      ))}
      <ChartToday now={now} />
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
            <Text
              style={[type.caption, styles.gold]}
              accessibilityRole="link"
              onPress={() => router.navigate({ pathname: '/rituals/craft/cosmic/hours', params: { planet: here.hour!.planet } } as never)}
            >{`Planetary hour of ${here.hour.planet} until ${timeOfDay(here.hour.end)} ›`}</Text>
          )}
        </>
      ) : (
        <Pressable accessibilityRole="link" onPress={() => router.navigate('/today/settings/location')}>
          <Text style={[type.caption, styles.gold]}>Add your location in Settings for sunrise, moonrise and planetary hours ›</Text>
        </Pressable>
      )}
      <Button label="The sky today" variant="outline" onPress={() => router.navigate('/today/sky')} />
    </View>
  );
}

/** One line from today's sky to your own birth chart (kept privately in lib/astro/store), when you've entered it. */
function ChartToday({ now }: { now: Date }) {
  const astro = useAstro();
  const { settings } = useMySettings();
  const saved = myChart(astro.data);
  const hour = Math.floor(now.getTime() / 3_600_000);
  const line = useMemo(
    () => {
      const chart = saved ? castChart(saved.input, chartOptionsFrom(settings)) : null;
      return chart ? todayLine(chart, now) : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once an hour, and when the chart or settings change
    [saved, settings, hour],
  );
  if (!saved || !line) return null;
  return (
    <Pressable accessibilityRole="link" accessibilityHint="Opens your transits" onPress={() => router.navigate({ pathname: '/rituals/craft/cosmic/chart', params: { tab: 'transits' } } as never)}>
      <Text style={[type.caption, styles.gold]}>Your chart today</Text>
      <TermText style={type.caption} text={line.line} />
    </Pressable>
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
      <Text
        style={[type.caption, styles.gold]}
        accessibilityRole="link"
        onPress={() => router.navigate({ pathname: '/rituals/craft/cosmic/planet', params: { planet: c.planet } } as never)}
      >{`${c.planet}: its day, hours, gods and full guide ›`}</Text>
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
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      accessibilityRole="link"
      accessibilityLabel={`${item.title}, ${item.detail}`}
      onPress={() =>
        item.kind === 'holiday' ? openHoliday(item.id) : router.navigate({ pathname: '/today/holy/[ref]', params: { ref: principalRef(item.phase) } })
      }
    >
      {item.kind === 'holiday' ? (
        <Icon name={item.title.startsWith('Samhain') ? 'samhain' : 'wheel'} size={26} color={colors.gold} />
      ) : (
        <MoonDisc size={26} {...PHASE_DISC[item.phase]} halo={false} />
      )}
      <View style={styles.tileText}>
        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={type.caption}>{item.detail}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lookBack: { gap: 10 },
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
  recurs: { alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, paddingHorizontal: 10, paddingVertical: 2 },
  recursYearly: { borderColor: colors.gold, backgroundColor: 'rgba(226, 195, 109, 0.14)' },
  recursText: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.parchment },
  recursTextYearly: { color: colors.gold },
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
  customise: { minHeight: 44, justifyContent: 'center' },
  dreamActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  practiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.goldLine },
  practiceText: { flex: 1, gap: 2 },
  practiceLabel: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.gold },
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
