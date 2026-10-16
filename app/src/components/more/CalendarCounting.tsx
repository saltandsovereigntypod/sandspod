// Settings → Calendar & holidays: how the days are counted (the ordinary date
// or the moon's months) and which other calendars are shown beside it, each
// with how solid it is, what it is, and its choices. Calendars of the
// person's own path come first.

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { longDate } from '../../lib/calendar';
import {
  calendarChoices,
  calendarPathName,
  calendarsForSettings,
  COUNT_KEY,
  EXTRA_KEY,
  HEMISPHERE_KEY,
  hemisphereOf,
  MOON_CALENDAR,
  optionKey,
  primaryCalendar,
  shownCalendars,
  todayLines,
  withShown,
  type CalendarDef,
} from '../../lib/calendars';
import { myPath } from '../../lib/library/traditions';
import { usePlace } from '../../lib/location';
import type { Settings } from '../../lib/settings/defaults';
import { colors, fonts, type } from '../../theme';
import { CalendarLineList, ConfidenceChip, LeadCalendarLine } from '../CalendarLines';
import { Card, Chips, MenuList, Section } from './ui';

type SetValue = (key: string, value: string) => void;

const COUNT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'moon', label: 'The moon' },
] as const;

const HEMISPHERE_OPTIONS = [
  { value: 'auto', label: 'From my place' },
  { value: 'north', label: 'Northern' },
  { value: 'south', label: 'Southern' },
] as const;

/** A calendar's choices as chips, with the chosen option's note beneath. */
function ChoiceList({ def, draft, set }: { def: CalendarDef; draft: Settings; set: SetValue }) {
  const values = calendarChoices(draft, def.id);
  return (
    <>
      {(def.choices ?? []).map((choice) => {
        const value = values[choice.key];
        const note = choice.options.find((o) => o.value === value)?.note;
        return (
          <View key={choice.key} style={styles.choice}>
            <Text style={styles.choiceLabel}>{choice.label}</Text>
            <Chips label={choice.label} options={choice.options} value={value} onChange={(v) => set(optionKey(def.id, choice.key), v)} />
            {!!note && <Text style={type.caption}>{note}</Text>}
          </View>
        );
      })}
    </>
  );
}

function About({ def }: { def: CalendarDef }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.about}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`About the ${def.name}`}
        onPress={() => setOpen(!open)}
        hitSlop={8}
        style={styles.aboutToggle}
      >
        <Text style={styles.link}>{open ? 'About this calendar ▾' : 'About this calendar ▸'}</Text>
      </Pressable>
      {open && <Text style={type.caption}>{def.about}</Text>}
    </View>
  );
}

function CalendarRow({ def, on, onToggle, draft, set, last }: { def: CalendarDef; on: boolean; onToggle: (on: boolean) => void; draft: Settings; set: SetValue; last: boolean }) {
  const path = calendarPathName(def);
  return (
    <View style={[styles.row, !last && styles.rule]}>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={def.name}
        accessibilityState={{ checked: on }}
        onPress={() => onToggle(!on)}
        style={styles.rowHead}
      >
        <View style={styles.grow}>
          <Text style={styles.name}>{def.name}</Text>
          <View style={styles.meta}>
            <ConfidenceChip confidence={def.confidence} />
            {!!path && <Text style={type.caption}>{path}</Text>}
          </View>
        </View>
        <View style={[styles.box, on && styles.boxOn]}>{on && <Text style={styles.tick}>✓</Text>}</View>
      </Pressable>
      <About def={def} />
      {on && <ChoiceList def={def} draft={draft} set={set} />}
    </View>
  );
}

export function CalendarCounting({ draft, set }: { draft: Settings; set: SetValue }) {
  const place = usePlace();
  const lead = primaryCalendar(draft);
  const shown = new Set<string>(shownCalendars(draft));
  const path = myPath(draft).traditions;
  const list = calendarsForSettings(draft, path);
  const hemisphere = (draft[HEMISPHERE_KEY] as string) || 'auto';
  const lines = useMemo(() => todayLines(new Date(), draft, place), [draft, place]);
  const leadLine = lines.find((l) => l.lead);

  return (
    <>
      {lines.length > 0 && (
        <Card>
          {leadLine && <LeadCalendarLine line={leadLine} />}
          <Text style={[type.eyebrow, styles.center, !leadLine && styles.dateFirst]}>{longDate(new Date())}</Text>
          <CalendarLineList lines={lines.filter((l) => !l.lead)} />
        </Card>
      )}

      <Section label="Count my days by">
        <Chips label="Count my days by" options={COUNT_OPTIONS} value={lead} onChange={(v) => set(COUNT_KEY, v)} />
        <Text style={type.caption}>
          {lead === 'moon'
            ? 'Today leads with the moon’s date: its month, from new moon to new moon, and the day of it. The ordinary date shows beneath.'
            : 'Today leads with the ordinary date. You can still show the moon’s months beside it below.'}
        </Text>
        {lead === 'moon' && (
          <Card>
            <View style={styles.meta}>
              <Text style={styles.name}>{MOON_CALENDAR.name}</Text>
              <ConfidenceChip confidence={MOON_CALENDAR.confidence} />
            </View>
            <About def={MOON_CALENDAR} />
            <ChoiceList def={MOON_CALENDAR} draft={draft} set={set} />
          </Card>
        )}
        <Chips label="Hemisphere" options={HEMISPHERE_OPTIONS} value={hemisphere as (typeof HEMISPHERE_OPTIONS)[number]['value']} onChange={(v) => set(HEMISPHERE_KEY, v)} />
        <Text style={type.caption}>
          {`Seasons and moon names follow the ${hemisphereOf(draft, place)}ern hemisphere${hemisphere === 'auto' ? (place ? ', from your place' : '; add your place on the Sky screen to set it') : ''}.`}
        </Text>
      </Section>

      <Section label="Also show">
        <Text style={type.caption}>Other ways of counting the day, shown under the date on Today. Tap a line there for more. Calendars of your path come first.</Text>
        <MenuList>
          {list.map((def, index) => (
            <CalendarRow
              key={def.id}
              def={def}
              on={shown.has(def.id)}
              onToggle={(on) => set(EXTRA_KEY, withShown(draft, def.id, on))}
              draft={draft}
              set={set}
              last={index === list.length - 1}
            />
          ))}
        </MenuList>
      </Section>

    </>
  );
}

const styles = StyleSheet.create({
  choiceLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.parchment },
  row: { paddingVertical: 12, gap: 6 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  grow: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.display, fontSize: 21, lineHeight: 25, color: colors.cream },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  about: { gap: 4 },
  aboutToggle: { minHeight: 32, justifyContent: 'center', alignSelf: 'flex-start' },
  link: { ...type.caption, color: colors.gold },
  choice: { gap: 4, paddingTop: 4 },
  box: { width: 26, height: 26, borderRadius: 6, borderWidth: 1.5, borderColor: colors.goldLine, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tick: { color: colors.forestInk, fontFamily: fonts.bodySemi, fontSize: 15 },
  center: { textAlign: 'center' },
  dateFirst: { color: colors.cream },
  cream: { color: colors.cream },
});
