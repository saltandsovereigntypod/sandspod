import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, Chips, Field, MenuList, MenuRow, Section } from '../../../../components/more/ui';
import { SettingsForm } from '../../../../components/more/SettingsForm';
import { TimeStepper } from '../../../../components/rituals/TimeStepper';
import { Toggle } from '../../../../components/rituals/ui';
import { remindersSupported } from '../../../../lib/reminders/notifier';
import { calendarOn, PATRON_GROUP_ID, withCalendarOn, withChange } from '../../../../lib/reminders/prefs';
import { useReminders } from '../../../../lib/reminders/store';
import { useReminderPrefs } from '../../../../lib/reminders/usePrefs';
import { traditionalEntries } from '../../../../lib/library/model';
import { deitiesValue, LEVELS, MY_DEITIES_KEY, myDeities, withDeity, withoutDeity, type DeityLevel, type MyDeity } from '../../../../lib/patron/mine';
import { colors, fonts, type } from '../../../../theme';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// My deities: the gods someone is exploring, dedicated to, or keeps as patron.
// Today, the altar, the Library and the premade suggestions follow them.
export default function DeitySettings() {
  const [query, setQuery] = useState('');
  const library = useMemo(
    () =>
      traditionalEntries()
        .filter((e) => e.type === 'deity')
        .map((e) => ({ key: e.id.split(':').pop() ?? '', name: e.name, pantheon: String(e.traditional?.Pantheon ?? '') }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  return (
    <SettingsForm title="My deities" after={() => <SacredReminders />}>
      {(draft, set) => {
        const list = myDeities(draft);
        const save = (next: MyDeity[]) => set(MY_DEITIES_KEY, deitiesValue(next));
        const kept = new Set(list.filter((d) => d.key).map((d) => d.key));
        const q = fold(query.trim());
        const matches = q ? library.filter((d) => !kept.has(d.key) && (fold(d.name).includes(q) || fold(d.pantheon).includes(q))).slice(0, 8) : [];
        const custom = query.trim() && !library.some((d) => fold(d.name) === q) && !list.some((d) => fold(d.name) === q) ? query.trim() : null;

        return (
          <>
            <Card>
              <Text style={type.body}>
                The gods you’re getting to know, have dedicated to, or keep as your patron. None is required, and one or several are both normal.
              </Text>
              <Pressable accessibilityRole="link" onPress={() => router.push('/rituals/journeys/patron')}>
                <Text style={styles.link}>What a patron is, and how to know ›</Text>
              </Pressable>
            </Card>

            {list.length > 0 && (
              <Section label="Yours">
                {list.map((deity) => (
                  <Card key={`${deity.key ?? 'own'}-${deity.name}`}>
                    <View style={styles.head}>
                      <Text style={type.cardTitle}>{deity.name}</Text>
                      {!deity.key && <Text style={type.caption}>In your own words</Text>}
                    </View>
                    <Chips<DeityLevel>
                      label={`How close you are to ${deity.name}`}
                      options={LEVELS}
                      value={deity.level}
                      onChange={(level) => save(withDeity(list, { ...deity, level }))}
                    />
                    <Text style={type.caption}>{LEVELS.find((l) => l.value === deity.level)?.note}</Text>
                    <Field
                      label="Since"
                      placeholder="YYYY-MM-DD"
                      value={deity.since}
                      onChangeText={(since) => save(withDeity(list, { ...deity, since }))}
                      autoCorrect={false}
                    />
                    <Field
                      label="A note for yourself"
                      placeholder="How it began, what you offer, what you’ve noticed"
                      value={deity.note ?? ''}
                      onChangeText={(note) => save(withDeity(list, { ...deity, note }))}
                      multiline
                    />
                    <View style={styles.row}>
                      <Button label="Remove" variant="outline" onPress={() => save(withoutDeity(list, deity))} />
                    </View>
                  </Card>
                ))}
              </Section>
            )}

            <Section label="Add a deity">
              <Field label="Search the Living Library" placeholder="e.g. Hekate, Brigid, Norse" value={query} onChangeText={setQuery} autoCorrect={false} />
              {(matches.length > 0 || custom) && (
                <MenuList>
                  {matches.map((d, i) => (
                    <MenuRow
                      key={d.key}
                      label={d.name}
                      detail={d.pantheon}
                      last={i === matches.length - 1 && !custom}
                      onPress={() => {
                        save(withDeity(list, { key: d.key, name: d.name, level: 'exploring', since: today() }));
                        setQuery('');
                      }}
                    />
                  ))}
                  {custom && (
                    <MenuRow
                      label={`Add “${custom}” in your own words`}
                      detail="For a deity, spirit or saint the Library doesn’t have"
                      last
                      onPress={() => {
                        save(withDeity(list, { key: null, name: custom, level: 'exploring', since: today() }));
                        setQuery('');
                      }}
                    />
                  )}
                </MenuList>
              )}
              {!query && list.length === 0 && <Text style={type.caption}>Start typing a name or a pantheon.</Text>}
            </Section>
          </>
        );
      }}
    </SettingsForm>
  );
}

/** Reminders on the sacred days of patron and dedicated deities: their calendar among the holiday reminders (Reminders → Holidays). */
function SacredReminders() {
  const { permission } = useReminders();
  const { prefs, update, ready, settings } = useReminderPrefs();
  if (!remindersSupported || !ready) return null;
  const on = prefs.holidays.on && calendarOn(prefs, PATRON_GROUP_ID);
  // Holiday reminders off until now: these alone, not every calendar at once.
  const turn = (next: boolean) => void update(withCalendarOn(prefs, settings, PATRON_GROUP_ID, next));
  return (
    <Card>
      <Toggle label="Remind me on their sacred days" detail="For your patron and dedicated deities, with a small devotion for the day" value={on} onChange={turn} />
      {on && <TimeStepper minutes={prefs.holidays.at} onChange={(minutes) => void update(withChange(prefs, 'holidays.at', minutes))} />}
      {on && <Text style={type.caption}>At the time chosen for holiday reminders. Choose how far ahead, and which of your other calendars remind you, in Reminders → Holidays.</Text>}
      <Button label="Holiday reminders" variant="text" onPress={() => router.push({ pathname: '/more/reminders', params: { section: 'holidays' } })} />
      {permission === 'denied' && on && <Text style={type.caption}>Notifications are off for this app. Turn them on in your phone’s Settings to hear these.</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { gap: 2 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: { fontFamily: fonts.bodySemi, color: colors.gold, marginTop: 8 },
});
