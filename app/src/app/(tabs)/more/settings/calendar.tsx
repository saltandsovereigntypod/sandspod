import type { Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { CalendarCounting } from '../../../../components/more/CalendarCounting';
import { Card, Chips, Field, MenuList, Notice, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { shortDate } from '../../../../lib/calendar';
import { calendarEventsBetween, CALENDARS_LIVE, calendarSettingsKey, mergeCalendarEvents } from '../../../../lib/calendars';
import { usePlace } from '../../../../lib/location';
import { customRepeat, HIDEABLE_TRADITIONS, hiddenTraditions, holidayChoice, holidaysBetween, pickId, TRADITIONS, type CustomHoliday, type Recurrence } from '../../../../lib/holidays';
import { primaryTradition } from '../../../../lib/traditionDay';
import { newId } from '../../../../lib/altar/uid';
import type { Settings } from '../../../../lib/settings/defaults';
import { colors, fonts, type } from '../../../../theme';

const SHOW_OPTIONS = [
  { value: 'both', label: 'Moon and holiday' },
  { value: 'moon', label: 'Moon only' },
  { value: 'holiday', label: 'Holiday only' },
] as const;

const LAYOUT_OPTIONS = [
  { value: 'stacked', label: 'One above the other' },
  { value: 'side', label: 'Side by side' },
] as const;

const REPEAT_OPTIONS = [
  { value: 'yearly', label: 'Every year' },
  { value: 'monthly', label: 'Every month' },
  { value: 'weekly', label: 'Every week' },
  { value: 'once', label: 'Once' },
] as const;

const WEEKDAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

function repeatLabel(holiday: CustomHoliday): string {
  const date = `${MONTHS[holiday.month].label} ${holiday.day}`;
  switch (customRepeat(holiday)) {
    case 'once':
      return `${date}, ${holiday.year}`;
    case 'monthly':
      return `the ${holiday.day}${ordinal(holiday.day)} of every month`;
    case 'weekly':
      return `${WEEKDAYS[new Date(holiday.year ?? new Date().getFullYear(), holiday.month, holiday.day).getDay()]}, from ${date}${holiday.year ? `, ${holiday.year}` : ''}`;
    default:
      return `${date} · every year`;
  }
}

const ordinal = (n: number) => (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((label, i) => ({
  value: String(i) as `${number}`,
  label,
}));

export default function CalendarSettings() {
  return <CalendarSettingsScreen />;
}

/** Also opened from Today's holiday card, inside the Today tab (then Back returns to Today). */
export function CalendarSettingsScreen({ back }: { back?: Href }) {
  return (
    <SettingsForm title="Calendar & holidays" back={back} after={(draft) => <YearAhead draft={draft} />}>
      {(draft, set) => <CalendarForm draft={draft} set={set} />}
    </SettingsForm>
  );
}

function CalendarForm({ draft, set }: { draft: Settings; set: <K extends keyof Settings>(key: K, value: Settings[K]) => void }) {
  const choice = holidayChoice(draft);
  const chosen = new Set(choice.traditions);
  const toggle = (id: string, on: boolean) => {
    const next = new Set(chosen);
    if (on) next.add(id);
    else next.delete(id);
    set('calendar_traditions', [...next].join(','));
  };
  const setCustom = (list: CustomHoliday[]) => set('calendar_custom_holidays', JSON.stringify(list));
  const setPicked = (ids: string[]) => set('calendar_picked_holidays', ids.join(','));

  const hidden = hiddenTraditions(draft);
  const shown = TRADITIONS.filter((t) => !hidden.includes(t.id));
  // Hiding a calendar turns it off too, and drops any holidays picked from it.
  const setHidden = (id: string, hide: boolean) => {
    const next = hide ? [...new Set([...hidden, id])] : hidden.filter((h) => h !== id);
    set('calendar_hidden_traditions', next.join(','));
    if (!hide) return;
    const kept = typeof draft.calendar_traditions === 'string' ? draft.calendar_traditions.split(',').filter((t) => t.trim() !== id) : null;
    if (kept) set('calendar_traditions', kept.join(','));
    if (typeof draft.calendar_picked_holidays === 'string')
      set('calendar_picked_holidays', draft.calendar_picked_holidays.split(',').filter((p) => p.split('/')[0] !== id).join(','));
    if (draft.calendar_primary === id) set('calendar_primary', '');
  };

  const show = (draft.today_show as string) || 'both';
  const mainOptions = shown.filter((t) => chosen.has(t.id)).map((t) => ({ value: t.id, label: t.name }));

  return (
    <>
      <Text style={type.body}>Choose the calendars you keep. Their holidays show on Today on the day, with what they mean, and On the horizon shows the next one.</Text>

      {CALENDARS_LIVE && <CalendarCounting draft={draft} set={(key, value) => set(key, value)} />}

      <Section label="Your calendars">
        <MenuList>
          {shown.map((tradition) => (
            <SwitchRow
              key={tradition.id}
              label={tradition.name}
              detail={tradition.description}
              value={chosen.has(tradition.id)}
              onChange={(on) => toggle(tradition.id, on)}
              accessory={
                HIDEABLE_TRADITIONS.includes(tradition.id) ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Hide the ${tradition.name} calendar`}
                    accessibilityHint="Removes it from view everywhere in the app. You can show it again here."
                    onPress={() => setHidden(tradition.id, true)}
                    hitSlop={8}
                    style={({ pressed }) => [styles.hide, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={styles.hideLabel}>Hide</Text>
                  </Pressable>
                ) : undefined
              }
            />
          ))}
          <SwitchRow
            label="Your own calendar"
            detail="Your own events, plus single holidays picked from any calendar."
            value={chosen.has('custom')}
            onChange={(on) => toggle('custom', on)}
            last
          />
        </MenuList>
        {hidden.length > 0 && (
          <View style={styles.hiddenRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => set('calendar_hidden_traditions', '')}
              hitSlop={8}
              style={({ pressed }) => [styles.hide, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.hideLabel}>{hidden.length > 1 ? 'Show hidden calendars' : 'Show hidden calendar'}</Text>
            </Pressable>
          </View>
        )}
      </Section>

      {mainOptions.length > 1 && (
        <Section label="Main calendar">
          <Text style={type.caption}>Names the day at the top of Today: the Athenian date, the Norse weekday gods, the Roman date and so on.</Text>
          <Chips
            label="Main calendar"
            options={mainOptions}
            value={primaryTradition(draft, choice)}
            onChange={(v) => set('calendar_primary', v)}
          />
        </Section>
      )}

      <Section label="On Today">
        <Chips label="Show on Today" options={SHOW_OPTIONS} value={show as (typeof SHOW_OPTIONS)[number]['value']} onChange={(v) => set('today_show', v)} />
        {show === 'both' && (
          <Chips
            label="Layout"
            options={LAYOUT_OPTIONS}
            value={(draft.today_layout as (typeof LAYOUT_OPTIONS)[number]['value']) || 'stacked'}
            onChange={(v) => set('today_layout', v)}
          />
        )}
        <Text style={type.caption}>On the horizon always shows the next moon phase and the next holiday.</Text>
        <MenuList>
          <SwitchRow
            label="A card for the day"
            detail="A small “Draw a card for the day” line, and the card once you’ve kept it."
            value={draft.today_draw !== false}
            onChange={(on) => set('today_draw', on)}
          />
          <SwitchRow
            label="Hekate’s Deipnon"
            detail="On the last day of each Attic month, if you keep the Hellenic monthly days or Hekate is your patron: a gentle note on Today, and a reminder in the phone app (choose when in Reminders → Holidays). Off turns off both."
            value={draft.deipnon_prompt !== false}
            onChange={(on) => set('deipnon_prompt', on)}
            last
          />
        </MenuList>
      </Section>

      {chosen.has('custom') && (
        <>
          <CustomHolidays list={choice.custom} onChange={setCustom} />
          <PickHolidays picked={choice.picked ?? []} whole={chosen} hidden={hidden} onChange={setPicked} />
        </>
      )}

    </>
  );
}

/** Every holiday from the chosen calendars for the next twelve months (below Save). */
function YearAhead({ draft }: { draft: Settings }) {
  const place = usePlace();
  const calendarKey = calendarSettingsKey(draft);
  const year = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    // The other calendars' observances too; of the moon's, just each month's first day.
    const events = (CALENDARS_LIVE ? calendarEventsBetween(now, end, draft, place) : []).filter((e) => e.calendar !== 'moon' || e.id.startsWith('moon-new-'));
    return mergeCalendarEvents(holidaysBetween(now, end, holidayChoice(draft)), events);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when the calendar choice changes
  }, [draft.calendar_traditions, draft.calendar_custom_holidays, draft.calendar_picked_holidays, calendarKey, place]);

  return (
    <Section label="The year ahead">
      {year.length === 0 ? (
        <Text style={type.caption}>Choose a calendar above to see its holidays.</Text>
      ) : (
        <View style={styles.year}>
          {year.map((holiday) => (
            <View key={holiday.id} style={styles.yearRow} accessible accessibilityLabel={`${shortDate(holiday.date)}: ${holiday.name}. ${holiday.meaning}`}>
              <Text style={styles.yearDate}>
                {shortDate(holiday.date)}
                {holiday.days > 1 ? ` · ${holiday.days} days` : ''}
              </Text>
              <Text style={styles.yearName}>{holiday.name}</Text>
              <Text style={type.caption}>{holiday.traditions.join(' · ')}</Text>
              {!!holiday.meaning && <Text style={styles.yearMeaning}>{holiday.meaning}</Text>}
            </View>
          ))}
        </View>
      )}
    </Section>
  );
}

function CustomHolidays({ list, onChange }: { list: CustomHoliday[]; onChange: (list: CustomHoliday[]) => void }) {
  const [name, setName] = useState('');
  const [month, setMonth] = useState<`${number}`>(String(new Date().getMonth()) as `${number}`);
  const [day, setDay] = useState('');
  const [meaning, setMeaning] = useState('');
  const [repeat, setRepeat] = useState<Recurrence>('yearly');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [message, setMessage] = useState<string | null>(null);

  const add = () => {
    const dayNumber = Number(day);
    const yearNumber = Number(year);
    if (!name.trim()) return setMessage('Give the event a name.');
    const needsYear = repeat === 'once' || repeat === 'weekly';
    if (needsYear && (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2200)) return setMessage('Enter the year, such as 2027.');
    // Yearly events may fall on Feb 29 (shown on leap years); one-time ones must exist that year.
    // Yearly events may fall on Feb 29 (leap years); monthly ones on any day up to 31.
    const daysInMonth = repeat === 'monthly' ? 31 : new Date(needsYear ? yearNumber : 2024, Number(month) + 1, 0).getDate();
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > daysInMonth) return setMessage(`Choose a day from 1 to ${daysInMonth}.`);
    onChange([
      ...list,
      { id: newId(), name: name.trim(), month: Number(month), day: dayNumber, meaning: meaning.trim(), year: needsYear ? yearNumber : null, repeat },
    ]);
    setName('');
    setDay('');
    setMeaning('');
    setMessage('Added. Save changes to keep it.');
  };

  return (
    <Section label="Your own events">
      {list.length > 0 && (
        <View style={styles.year}>
          {list.map((holiday) => (
            <View key={holiday.id} style={styles.customRow}>
              <View style={styles.grow}>
                <Text style={styles.yearName}>{holiday.name}</Text>
                <Text style={type.caption}>
                  {`${repeatLabel(holiday)}${holiday.meaning ? ` · ${holiday.meaning}` : ''}`}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${holiday.name}`}
                onPress={() => onChange(list.filter((item) => item.id !== holiday.id))}
                hitSlop={8}
              >
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      <Card>
        <Text style={type.cardTitle}>Add an event</Text>
        <Field label="Name" value={name} onChangeText={setName} placeholder="My dedication day, a coven gathering…" />
        <Chips label="Repeats" options={REPEAT_OPTIONS} value={repeat} onChange={setRepeat} />
        {repeat !== 'monthly' && <Chips label="Month" options={MONTHS} value={month} onChange={setMonth} />}
        <Field label="Day of the month" value={day} onChangeText={setDay} keyboardType="number-pad" maxLength={2} placeholder="1–31" />
        {(repeat === 'once' || repeat === 'weekly') && (
          <Field label={repeat === 'weekly' ? 'Year it starts' : 'Year'} value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />
        )}
        <Text style={type.caption}>
          {repeat === 'yearly'
            ? 'Comes round on this date every year.'
            : repeat === 'monthly'
              ? 'Comes round on this day of every month (skipping months too short for it).'
              : repeat === 'weekly'
                ? 'Comes round every week on the weekday of this date, starting from it.'
                : 'Happens once, on this date.'}
        </Text>
        <Field label="What it means to you (optional)" value={meaning} onChangeText={setMeaning} multiline />
        {!!message && <Notice>{message}</Notice>}
        <Button label="Add event" variant="outline" onPress={add} />
      </Card>
    </Section>
  );
}

/** Single holidays from any calendar, added to your own calendar one by one. */
function PickHolidays({ picked, whole, hidden, onChange }: { picked: string[]; whole: Set<string>; hidden: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const chosen = new Set(picked);
  const toggle = (id: string, on: boolean) => {
    const next = new Set(chosen);
    if (on) next.add(id);
    else next.delete(id);
    onChange([...next]);
  };

  return (
    <Section label="Holidays from other calendars">
      <Text style={type.caption}>Add single holidays to your own calendar without turning on the whole calendar.</Text>
      {TRADITIONS.filter((t) => !hidden.includes(t.id)).map((tradition) => {
        const count = tradition.holidays.filter((h) => chosen.has(pickId(tradition.id, h.id))).length;
        const all = whole.has(tradition.id);
        const expanded = open === tradition.id;
        return (
          <View key={tradition.id} style={styles.pickGroup}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : tradition.id)}
              style={styles.pickHeader}
            >
              <Text style={[styles.yearName, styles.grow]}>{tradition.name}</Text>
              <Text style={type.caption}>{all ? 'All on' : count ? `${count} added` : ''}</Text>
              <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
            </Pressable>
            {expanded &&
              (all ? (
                <Text style={type.caption}>This whole calendar is on above, so all its holidays already show.</Text>
              ) : (
                <MenuList>
                  {tradition.holidays.map((holiday, index) => (
                    <SwitchRow
                      key={holiday.id}
                      label={holiday.name}
                      detail={holiday.meaning}
                      value={chosen.has(pickId(tradition.id, holiday.id))}
                      onChange={(on) => toggle(pickId(tradition.id, holiday.id), on)}
                      last={index === tradition.holidays.length - 1}
                    />
                  ))}
                </MenuList>
              ))}
          </View>
        );
      })}
    </Section>
  );
}

const styles = StyleSheet.create({
  hide: { minHeight: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.goldLine, alignItems: 'center', justifyContent: 'center' },
  hideLabel: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold },
  hiddenRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 10 },
  year: { gap: 14 },
  yearRow: { gap: 2, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hairline },
  yearDate: { ...type.eyebrow, color: colors.gold },
  yearName: { fontFamily: fonts.display, fontSize: 21, lineHeight: 25, color: colors.cream },
  yearMeaning: { ...type.caption, color: colors.parchment, marginTop: 2 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  grow: { flex: 1, gap: 2 },
  remove: { ...type.caption, color: colors.gold, textDecorationLine: 'underline' },
  pickGroup: { gap: 8 },
  pickHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chevron: { ...type.caption, color: colors.tabInactive },
});
