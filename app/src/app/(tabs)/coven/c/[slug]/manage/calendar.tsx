import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, CheckRow, Chips, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, slugify, type Coven } from '../../../../../../lib/covens/model';
import { parseCustomHolidays } from '../../../../../../lib/holidays';
import { CALENDAR_TRADITIONS } from '../../../../../../lib/covens/programs';
import { type } from '../../../../../../theme';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
type Day = { name: string; month: number; day: number; meaning: string };

// The coven's practice calendar: the same holiday choices as a person's
// Settings → Calendar. Shown on the coven's page and members' Today, used to
// suggest dates for rites, and to suggest the ready-made programs for it.
export default function ManageCalendar() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  return <CovenScreen title="Practice calendar" need="manage">{info && <CalendarForm key={info.id} info={info} />}</CovenScreen>;
}

function CalendarForm({ info }: { info: Coven }) {
  const coven = useCoven();
  const [traditions, setTraditions] = useState<string[]>(info.practice_traditions ?? []);
  const [picked, setPicked] = useState<string[]>(info.practice_holidays ?? []);
  const [days, setDays] = useState<Day[]>(parseCustomHolidays(info.practice_custom ?? []).map((d) => ({ name: d.name, month: d.month, day: d.day, meaning: d.meaning })));
  const [opened, setOpened] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const toggle = (list: string[], value: string, on: boolean) => (on ? [...new Set([...list, value])] : list.filter((v) => v !== value));
  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      // A holiday counts only under a calendar the coven keeps.
      const holidays = picked.filter((id) => traditions.includes(id.split('/')[0]));
      const custom = days.filter((d) => d.name.trim()).map((d, i) => ({ id: `coven-${i + 1}-${slugify(d.name).slice(0, 24)}`, name: d.name.trim(), month: d.month, day: d.day, meaning: d.meaning.trim() }));
      await api.saveCalendar(info.id, traditions, holidays, custom);
      await coven.refresh();
      setMessage('Saved.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <>
      <Text style={type.caption}>The holidays the coven keeps, as members choose theirs in Settings → Calendar. They show on the coven’s page and on members’ Today, rites can be planned for them, and the ready-made programs for these calendars are suggested first.</Text>
      {CALENDAR_TRADITIONS.map((t) => {
        const on = traditions.includes(t.id);
        const chosen = t.holidays.filter((h) => picked.includes(`${t.id}/${h.id}`)).length;
        return (
          <Card key={t.id}>
            <CheckRow label={t.name} value={on} onChange={(v) => setTraditions((list) => toggle(list, t.id, v))}>
              <Text style={type.caption}>{t.description}</Text>
            </CheckRow>
            {on && (
              <>
                <Button
                  label={opened === t.id ? 'Done choosing' : chosen ? `${chosen} of ${t.holidays.length} holidays chosen` : `Every holiday (choose some)`}
                  variant="text"
                  onPress={() => setOpened(opened === t.id ? null : t.id)}
                />
                {opened === t.id && (
                  <View>
                    <Text style={type.caption}>Leave every holiday unticked to keep them all, or tick only those the coven keeps.</Text>
                    {t.holidays.map((h) => (
                      <CheckRow key={h.id} label={h.name} value={picked.includes(`${t.id}/${h.id}`)} onChange={(v) => setPicked((list) => toggle(list, `${t.id}/${h.id}`, v))} />
                    ))}
                  </View>
                )}
              </>
            )}
          </Card>
        );
      })}
      <Section label="The coven’s own days">
        {days.map((d, i) => (
          <Card key={i}>
            <Field label="Name" value={d.name} onChangeText={(name) => setDays((list) => list.map((x, j) => (j === i ? { ...x, name } : x)))} maxLength={80} />
            <Chips label="Month" options={MONTHS.map((m, n) => ({ value: String(n), label: m.slice(0, 3) }))} value={String(d.month)} onChange={(v) => setDays((list) => list.map((x, j) => (j === i ? { ...x, month: Number(v) } : x)))} />
            <Field label="Day" value={String(d.day)} onChangeText={(v) => setDays((list) => list.map((x, j) => (j === i ? { ...x, day: Math.max(1, Math.min(31, Number(v.replace(/[^0-9]/g, '')) || 1)) } : x)))} keyboardType="number-pad" maxLength={2} />
            <Field label="What it’s for" value={d.meaning} onChangeText={(meaning) => setDays((list) => list.map((x, j) => (j === i ? { ...x, meaning } : x)))} maxLength={300} />
            <Button label="Remove" variant="text" onPress={() => setDays((list) => list.filter((_, j) => j !== i))} />
          </Card>
        ))}
        {days.length < 60 && <Button label="Add a day" variant="outline" onPress={() => setDays((list) => [...list, { name: '', month: new Date().getMonth(), day: 1, meaning: '' }])} />}
      </Section>
      <Button label={busy ? 'Saving…' : 'Save the calendar'} onPress={save} disabled={busy} />
      {message && <Notice>{message}</Notice>}
      <View style={styles.space} />
    </>
  );
}

const styles = StyleSheet.create({
  space: { height: 12 },
});
