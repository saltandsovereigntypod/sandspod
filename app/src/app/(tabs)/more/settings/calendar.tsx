import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, Chips, Field, MenuList, Notice, Section, SwitchRow } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { shortDate } from '../../../../lib/calendar';
import { holidayChoice, holidaysBetween, pickId, TRADITIONS, type CustomHoliday } from '../../../../lib/holidays';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((label, i) => ({
  value: String(i) as `${number}`,
  label,
}));

export default function CalendarSettings() {
  return (
    <SettingsForm title="Calendar & holidays">
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

  const year = useMemo(() => {
    const now = new Date();
    return holidaysBetween(now, new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()), choice);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when the saved choice changes
  }, [draft.calendar_traditions, draft.calendar_custom_holidays, draft.calendar_picked_holidays]);

  const show = (draft.today_show as string) || 'both';

  return (
    <>
      <Text style={type.body}>Choose the calendars you keep. Today shows the next holiday from them, with its meaning.</Text>

      <Section label="Your calendars">
        <MenuList>
          {TRADITIONS.map((tradition) => (
            <SwitchRow
              key={tradition.id}
              label={tradition.name}
              detail={tradition.description}
              value={chosen.has(tradition.id)}
              onChange={(on) => toggle(tradition.id, on)}
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
      </Section>

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
      </Section>

      {chosen.has('custom') && (
        <>
          <CustomHolidays list={choice.custom} onChange={setCustom} />
          <PickHolidays picked={choice.picked ?? []} whole={chosen} onChange={setPicked} />
        </>
      )}

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
    </>
  );
}

function CustomHolidays({ list, onChange }: { list: CustomHoliday[]; onChange: (list: CustomHoliday[]) => void }) {
  const [name, setName] = useState('');
  const [month, setMonth] = useState<`${number}`>(String(new Date().getMonth()) as `${number}`);
  const [day, setDay] = useState('');
  const [meaning, setMeaning] = useState('');
  const [yearly, setYearly] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [message, setMessage] = useState<string | null>(null);

  const add = () => {
    const dayNumber = Number(day);
    const yearNumber = Number(year);
    if (!name.trim()) return setMessage('Give the event a name.');
    if (!yearly && (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2200)) return setMessage('Enter the year it happens, such as 2027.');
    // Yearly events may fall on Feb 29 (shown on leap years); one-time ones must exist that year.
    const daysInMonth = new Date(yearly ? 2024 : yearNumber, Number(month) + 1, 0).getDate();
    if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > daysInMonth) return setMessage(`Choose a day from 1 to ${daysInMonth}.`);
    onChange([
      ...list,
      { id: newId(), name: name.trim(), month: Number(month), day: dayNumber, meaning: meaning.trim(), year: yearly ? null : yearNumber },
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
                  {`${MONTHS[holiday.month].label} ${holiday.day}${holiday.year ? `, ${holiday.year}` : ' · every year'}${holiday.meaning ? ` · ${holiday.meaning}` : ''}`}
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
        <Chips label="Month" options={MONTHS} value={month} onChange={setMonth} />
        <Field label="Day of the month" value={day} onChangeText={setDay} keyboardType="number-pad" maxLength={2} placeholder="1–31" />
        <MenuList>
          <SwitchRow label="Every year" detail={yearly ? 'Repeats on this date each year.' : 'Happens once, in the year below.'} value={yearly} onChange={setYearly} last />
        </MenuList>
        {!yearly && <Field label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />}
        <Field label="What it means to you (optional)" value={meaning} onChangeText={setMeaning} multiline />
        {!!message && <Notice>{message}</Notice>}
        <Button label="Add event" variant="outline" onPress={add} />
      </Card>
    </Section>
  );
}

/** Single holidays from any calendar, added to your own calendar one by one. */
function PickHolidays({ picked, whole, onChange }: { picked: string[]; whole: Set<string>; onChange: (ids: string[]) => void }) {
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
      {TRADITIONS.map((tradition) => {
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
