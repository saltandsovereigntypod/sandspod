// Spell follow-through on a journal entry: the offer to check in a day, a
// week and four weeks on, the check-in when it's due (how it's going, signs
// noticed, and at four weeks "Did it work?" too), and what you wrote. The
// logic is in lib/rituals/checkIns.ts.

import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, Chip, Chips, Field, SectionLabel, tell, ui } from './ui';
import { fullDate } from '../../lib/calendar';
import {
  answerCheckIn,
  dayWords,
  dueCheckIn,
  FEELINGS,
  noteLine,
  offerCheckIns,
  pendingCheckIns,
  readCheckIns,
  startCheckIns,
  stopCheckIns,
  type Feeling,
} from '../../lib/rituals/checkIns';
import { ANSWERS, readLookBack, type Outcome } from '../../lib/rituals/lookBack';
import { askForRitualReminders } from '../../lib/reminders/store';
import { saveJournalMetadata } from '../../lib/rituals/store';
import type { JournalRow } from '../../lib/rituals/types';

export function SpellCheckIns({ entry }: { entry: JournalRow }) {
  const now = new Date();
  const checkIns = readCheckIns(entry);
  const due = dueCheckIn(entry, now);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [signs, setSigns] = useState('');
  const [answer, setAnswer] = useState<Outcome | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async (next: JournalRow) => {
    setSaving(true);
    try {
      await saveJournalMetadata(next);
      setFeeling(null);
      setSigns('');
      setAnswer(null);
    } catch (e) {
      tell('Couldn’t save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!checkIns) {
    if (!offerCheckIns(entry, now)) return null;
    return (
      <Card>
        <SectionLabel>Follow it through</SectionLabel>
        <Body muted>Check in a day, a week and four weeks on: how it’s going and any signs. What you write is kept here, under this working.</Body>
        <View style={ui.actions}>
          <Button
            label={saving ? 'One moment…' : 'Check in with me'}
            variant="outline"
            disabled={saving}
            onPress={() => {
              void askForRitualReminders();
              void save(startCheckIns(entry, now));
            }}
          />
        </View>
      </Card>
    );
  }

  const pending = pendingCheckIns(entry);
  return (
    <Card accent={!!due}>
      <SectionLabel>Check-ins</SectionLabel>
      {checkIns.notes.map((n) => (
        <Body key={n.day}>{noteLine(n)}</Body>
      ))}
      {due ? (
        <View style={ui.gapSmall}>
          <Body>{`${dayWords(due.day)}: how is it going? Any signs noticed?`}</Body>
          <Chips>
            {FEELINGS.map((f) => (
              <Chip key={f.id} label={f.label} selected={feeling === f.id} onPress={() => setFeeling(feeling === f.id ? null : f.id)} />
            ))}
          </Chips>
          <Field label="Signs noticed" value={signs} onChange={setSigns} placeholder="A dream, a word overheard, a door that opened…" multiline />
          {due.day === 28 && !readLookBack(entry)?.answer && (
            <>
              <Body muted>And did it work?</Body>
              <Chips>
                {ANSWERS.map((a) => (
                  <Chip key={a.id} label={a.label} selected={answer === a.id} onPress={() => setAnswer(answer === a.id ? null : a.id)} />
                ))}
              </Chips>
            </>
          )}
          <View style={ui.actions}>
            <Button
              label={saving ? 'Saving…' : 'Save the check-in'}
              disabled={saving || (!feeling && !signs.trim() && !answer)}
              onPress={() => void save(answerCheckIn(entry, due.day, { feeling, signs, answer }, new Date()))}
            />
          </View>
        </View>
      ) : checkIns.on && pending.length ? (
        <Body muted>{`Next: ${dayWords(pending[0].day).toLowerCase()}, ${fullDate(pending[0].date) ?? pending[0].date}.`}</Body>
      ) : !checkIns.on ? (
        <Body muted>Check-ins are off for this working.</Body>
      ) : null}
      <View style={ui.actions}>
        {checkIns.on && pending.length > 0 && <Button label="Stop the check-ins" variant="text" disabled={saving} onPress={() => void save(stopCheckIns(entry, now))} />}
        {!checkIns.on && offerCheckIns({ ...entry, metadata: {} }, now) && (
          <Button label="Check in again" variant="text" disabled={saving} onPress={() => void save(startCheckIns(entry, now))} />
        )}
      </View>
    </Card>
  );
}
