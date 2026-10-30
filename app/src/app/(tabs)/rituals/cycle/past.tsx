import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { MonthGrid } from '../../../../components/cycle/parts';
import { ChoiceChips } from '../../../../components/cycle/ui';
import { Body, Card, Chip, Chips, confirmAction, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { bleedDays, dayKey, dayMonth, removeBleed, sortedBleeds } from '../../../../lib/cycle/model';
import { addPastBleeds, calendarMonth, dateOrderFor, editBleed, entryWithLength, parsePastList, type PastEntry } from '../../../../lib/cycle/past';
import { cycleId, updateCycle, useCycle } from '../../../../lib/cycle/store';
import type { CycleData } from '../../../../lib/cycle/types';
import { type } from '../../../../theme';

const LENGTHS: { value: number; label: string }[] = [
  { value: 0, label: 'Not sure' },
  ...[3, 4, 5, 6, 7, 8].map((n) => ({ value: n, label: `${n} days` })),
];
const ORDERS: { value: 'dmy' | 'mdy'; label: string }[] = [
  { value: 'dmy', label: 'Day first (29/06)' },
  { value: 'mdy', label: 'Month first (06/29)' },
];
const locale = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return 'en-GB';
  }
})();
const longDate = (key: string) => `${dayMonth(key)} ${key.slice(0, 4)}`;

// Past periods: many at once, on a calendar or from a pasted list, and each
// one kept can be changed or removed. Everything is checked first (no future
// days, no overlaps) and kept encrypted like the rest of Cycle & Moon. The
// website's twin is /rituals/cycle/?view=past.
export default function CyclePast() {
  const cycle = useCycle();
  if (cycle.phase !== 'open' || !cycle.data) {
    return (
      <RitualScreen back="Cycle & Moon">
        <Title>Past periods</Title>
        <Body>Open Cycle &amp; Moon first.</Body>
        <Button label="Open Cycle & Moon" onPress={() => router.replace('/rituals/cycle')} />
      </RitualScreen>
    );
  }
  return <PastPeriods data={cycle.data} />;
}

function PastPeriods({ data }: { data: CycleData }) {
  const today = dayKey(new Date());
  const [view, setView] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }));
  const [picked, setPicked] = useState<string[]>([]);
  const [length, setLength] = useState(5);
  const [text, setText] = useState('');
  const [order, setOrder] = useState<'dmy' | 'mdy'>(dateOrderFor(locale));
  const [read, setRead] = useState<{ entries: PastEntry[]; unread: string[] } | null>(null);
  const [result, setResult] = useState<{ added: number; problems: string[] } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const weeks = useMemo(() => calendarMonth(data, view.y, view.m, picked, today), [data, view, picked, today]);
  const kept = sortedBleeds(data).reverse();

  const add = (entries: PastEntry[]) => {
    let outcome: { added: number; problems: string[] } = { added: 0, problems: [] };
    updateCycle((d) => {
      const r = addPastBleeds(d, entries, cycleId, new Date());
      outcome = { added: r.added, problems: r.problems.map((p) => p.message) };
      return r.data;
    });
    setResult(outcome);
    return outcome;
  };

  return (
    <RitualScreen back="Cycle & Moon">
      <Title eyebrow="Cycle & Moon">Past periods</Title>
      <Body muted>Add the periods you remember, so Cycle &amp; Moon knows your history: your average cycle, where in the moon’s month your bleeds tend to begin, and today’s place in your cycle. Rough dates are fine.</Body>

      {result && (
        <Notice>
          {[result.added ? `${result.added} ${result.added === 1 ? 'period' : 'periods'} added, encrypted.` : 'Nothing was added.', ...result.problems].join('\n')}
        </Notice>
      )}

      <SectionLabel>Pick them on the calendar</SectionLabel>
      <Card>
        <Body muted>Tap the day each period began. Days already logged are shaded.</Body>
        <MonthGrid
          year={view.y}
          month={view.m}
          weeks={weeks}
          onPick={(k) => setPicked(picked.includes(k) ? picked.filter((x) => x !== k) : [...picked, k].sort())}
          onMonth={(delta) => setView(({ y, m }) => ({ y: m + delta < 0 ? y - 1 : m + delta > 11 ? y + 1 : y, m: (m + delta + 12) % 12 }))}
        />
        {picked.length > 0 && (
          <View style={ui.gap}>
            <Text style={type.caption}>Picked (tap one to unpick it)</Text>
            <Chips>
              {picked.map((k) => (
                <Chip key={k} label={`${longDate(k)} ×`} onPress={() => setPicked(picked.filter((x) => x !== k))} />
              ))}
            </Chips>
            <Text style={type.caption}>Each lasted about</Text>
            <ChoiceChips options={LENGTHS} value={length} onChange={setLength} />
            <Button
              label={`Add ${picked.length} ${picked.length === 1 ? 'period' : 'periods'}`}
              onPress={() => {
                const r = add(picked.map((k) => entryWithLength(k, length || null)));
                if (r.added) setPicked([]);
              }}
            />
          </View>
        )}
      </Card>

      <SectionLabel>Or paste a list of dates</SectionLabel>
      <Card>
        <Body muted>One period a line, from notes or another app. A start date, a start and an end (“4 May 2026 to 8 May 2026”), or a start and how long (“2026-06-01, 5 days”).</Body>
        <Field
          label="Dates"
          value={text}
          onChange={(t) => {
            setText(t);
            setRead(null);
          }}
          placeholder={'2026-09-29\n1 September 2026 to 5 September 2026\n04/08/2026, 5 days'}
          multiline
        />
        <Text style={type.caption}>Dates written with slashes</Text>
        <ChoiceChips
          options={ORDERS}
          value={order}
          onChange={(o) => {
            setOrder(o);
            setRead(null);
          }}
        />
        {!read ? (
          <Button label="Read these dates" variant="outline" disabled={!text.trim()} onPress={() => setRead(parsePastList(text, order, today))} />
        ) : (
          <View style={ui.gap}>
            <Text style={type.caption}>{read.entries.length ? `Read ${read.entries.length}:` : 'No dates could be read.'}</Text>
            {read.entries.map((e) => (
              <Body key={`${e.start}:${e.end}`}>{`${longDate(e.start)}${e.end ? ` to ${longDate(e.end)}` : ''}`}</Body>
            ))}
            {read.unread.length > 0 && <Body muted>{`Couldn’t read: ${read.unread.join('; ')}`}</Body>}
            {read.entries.length > 0 && (
              <Button
                label={`Add ${read.entries.length} ${read.entries.length === 1 ? 'period' : 'periods'}`}
                onPress={() => {
                  const r = add(read.entries);
                  if (r.added) {
                    setText('');
                    setRead(null);
                  }
                }}
              />
            )}
          </View>
        )}
      </Card>

      <SectionLabel>{`Logged (${kept.length})`}</SectionLabel>
      {kept.length ? (
        <List>
          {kept.map((b, i) => (
            <View key={b.id}>
              <Row
                icon="calendar"
                title={longDate(b.start)}
                detail={b.end ? `To ${dayMonth(b.end)} · ${bleedDays(b)} days` : 'End not marked'}
                last={i === kept.length - 1 && editing !== b.id}
                onPress={() => setEditing(editing === b.id ? null : b.id)}
              />
              {editing === b.id && <EditBleed id={b.id} start={b.start} end={b.end} onDone={() => setEditing(null)} />}
            </View>
          ))}
        </List>
      ) : (
        <Body muted>None yet.</Body>
      )}
      <Button label="See what your history says" variant="outline" onPress={() => router.push('/rituals/cycle/history')} />
    </RitualScreen>
  );
}

function EditBleed({ id, start, end, onDone }: { id: string; start: string; end: string | null; onDone: () => void }) {
  const [s, setS] = useState(start);
  const [e, setE] = useState(end ?? '');
  const [problem, setProblem] = useState<string | null>(null);
  return (
    <View style={[ui.gap, { paddingBottom: 16 }]}>
      <Field label="Began (year-month-day)" value={s} onChange={setS} placeholder="2026-09-29" />
      <Field label="Ended (leave empty if not known)" value={e} onChange={setE} placeholder="2026-10-03" />
      {problem && <Notice>{problem}</Notice>}
      <Button
        label="Keep the change"
        onPress={() => {
          let p: string | null = null;
          updateCycle((d) => {
            const r = editBleed(d, id, s.trim(), e.trim() || null, new Date());
            p = r.problem?.message ?? null;
            return r.data;
          });
          setProblem(p);
          if (!p) onDone();
        }}
      />
      <Button
        label="Remove this period"
        variant="text"
        onPress={async () => {
          if (await confirmAction('Remove this period?', 'Its days and flow are removed from your notes. Your day notes stay.', 'Remove')) {
            updateCycle((d) => removeBleed(d, id, new Date()));
            onDone();
          }
        }}
      />
    </View>
  );
}
