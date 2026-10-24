// "Did it work?" for a ritual or spell: choosing the day to look back
// (LookBackPicker, in the journal form) and answering when it comes
// (DidItWork, on the journal entry and on Today), for journal entries and for
// the things made in My Apothecary. The logic is in lib/rituals/lookBack.ts
// and lib/altar/apothecaryLookBack.ts, shared with the website.

import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, Chip, Chips, Field, SectionLabel, tell, ui } from './ui';
import { fullDate, shortDate } from '../../lib/calendar';
import { dateFromKey } from '../../lib/rituals/lifecycle';
import {
  ANSWERS,
  answerLabel,
  answerLookBack,
  chooseLookBack,
  dueQuestion,
  isDue,
  lookBackChoices,
  readLookBack,
  reopenLookBack,
  suggestedWhen,
  whenWords,
  type LookBackWhen,
  type Outcome,
} from '../../lib/rituals/lookBack';
import { saveJournalMetadata } from '../../lib/rituals/store';
import type { JournalRow } from '../../lib/rituals/types';

type EntryLike = Pick<JournalRow, 'title' | 'intention' | 'moon_phase' | 'ritual_date'>;

/** 'suggested' follows the working's intention until a choice is made. */
export type LookBackPick = LookBackWhen | 'suggested' | null;

const dayWords = (key: string) => fullDate(key) ?? key;

/** "at the full moon (November 5, 2026)" / "on November 5, 2026" */
export function lookBackWords(lookBack: { when: LookBackWhen; date: string }): string {
  const moon = lookBack.when === 'full_moon' || lookBack.when === 'new_moon';
  return moon ? `${whenWords(lookBack.when)} (${dayWords(lookBack.date)})` : `on ${dayWords(lookBack.date)}`;
}

/** Choose when to ask "Did it work?": a moon (the suiting one first), a week, a month, a day of your own, or not at all. */
export function LookBackPicker({
  entry,
  value,
  custom,
  onChange,
}: {
  entry: EntryLike;
  value: LookBackPick;
  custom: string;
  onChange: (value: LookBackPick, custom: string) => void;
}) {
  const now = new Date();
  const choices = lookBackChoices(entry as JournalRow, now);
  const chosen = value === 'suggested' ? choices[0].when : value;
  const [typed, setTyped] = useState(custom);
  const date = chosen === 'custom' ? (dateFromKey(custom) ? custom : '') : choices.find((c) => c.when === chosen)?.date ?? '';

  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Did it work? Look back</SectionLabel>
      <Chips>
        {choices.map((c) => {
          const day = dateFromKey(c.date);
          return (
            <Chip
              key={c.when}
              label={`${c.label}${day ? ` · ${shortDate(day)}` : ''}`}
              selected={chosen === c.when}
              onPress={() => onChange(c.when, custom)}
            />
          );
        })}
        <Chip label="Another day" selected={chosen === 'custom'} onPress={() => onChange('custom', custom)} />
        <Chip label="Not needed" selected={chosen === null} onPress={() => onChange(null, custom)} />
      </Chips>
      {chosen === 'custom' && (
        <Field
          label="The day (YYYY-MM-DD)"
          value={typed}
          onChange={(v) => {
            setTyped(v);
            onChange('custom', v.trim());
          }}
          placeholder="2027-01-01"
        />
      )}
      {chosen && date ? (
        <Body muted>{`On ${dayWords(date)} you’ll be asked whether it worked, here, on Today and with a reminder if they’re on.`}</Body>
      ) : chosen ? null : (
        <Body muted>You can still say whether it worked from the journal entry whenever you like.</Body>
      )}
    </View>
  );
}

/**
 * The look-back for one entry: the question when it's due, the answer once
 * given, or the day it's waiting for. `onSave` saves somewhere other than
 * the journal: a spell jar or sachet passes its item, seen as an entry
 * (lib/altar/apothecaryLookBack.ts apothecaryWorking).
 */
export function DidItWork({ entry, compact, onSave }: { entry: JournalRow; compact?: boolean; onSave?: (next: JournalRow) => Promise<unknown> }) {
  const lookBack = readLookBack(entry);
  const due = isDue(entry, new Date());
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<Outcome | null>(null);
  const [outcome, setOutcome] = useState('');
  const [waiting, setWaiting] = useState<LookBackWhen | null>(null);
  const [saving, setSaving] = useState(false);
  const writing = open || due;

  const save = async (next: JournalRow) => {
    setSaving(true);
    try {
      await (onSave ? onSave(next) : saveJournalMetadata(next));
      setOpen(false);
      setAnswer(null);
      setOutcome('');
      setWaiting(null);
    } catch (e) {
      tell('Couldn’t save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (lookBack?.answer && !open) {
    return (
      <Card>
        <SectionLabel>Did it work?</SectionLabel>
        <Body>{`${answerLabel(lookBack.answer)}${lookBack.outcome ? `. ${lookBack.outcome}` : ''}`}</Body>
        {!!lookBack.outcomeDate && <Body muted>{`Written ${dayWords(lookBack.outcomeDate)}`}</Body>}
        {(lookBack.waited ?? []).map((w, i) => (
          <Body key={i} muted>{`${dayWords(w.date)}: ${w.answer ? answerLabel(w.answer) : 'Still waiting'}${w.outcome ? `. ${w.outcome}` : ''}`}</Body>
        ))}
        {!compact && (
          <Button
            label="Change the answer"
            variant="text"
            onPress={() => {
              setAnswer(lookBack.answer ?? null);
              setOutcome(lookBack.outcome ?? '');
              setOpen(true);
            }}
          />
        )}
      </Card>
    );
  }

  if (!writing) {
    return (
      <Card>
        <SectionLabel>Did it work?</SectionLabel>
        {lookBack?.date ? (
          <Body>{`It will come back to you ${lookBackWords(lookBack)}.`}</Body>
        ) : (
          <Body muted>No look-back day is set for this one.</Body>
        )}
        {(lookBack?.waited ?? []).map((w, i) => (
          <Body key={i} muted>{`${dayWords(w.date)}: ${w.answer ? answerLabel(w.answer) : 'Still waiting'}${w.outcome ? `. ${w.outcome}` : ''}`}</Body>
        ))}
        <View style={ui.actions}>
          <Button label="Say what happened now" variant="text" onPress={() => setOpen(true)} />
          {!lookBack?.date && (
            <Button label="Look back at the next moon" variant="text" disabled={saving} onPress={() => save(chooseLookBack(entry, suggestedWhen(entry), new Date()))} />
          )}
        </View>
      </Card>
    );
  }

  const canWait = answer === 'not_yet' || answer === 'partly';
  const waitChoices = lookBackChoices(entry, new Date(), new Date());
  return (
    <Card accent={due}>
      <SectionLabel>Did it work?</SectionLabel>
      {due && <Body>{dueQuestion(entry, dayWords)}</Body>}
      {compact && !due && <Body>{entry.title || 'Untitled Ritual'}</Body>}
      <Chips>
        {ANSWERS.map((a) => (
          <Chip key={a.id} label={a.label} selected={answer === a.id} onPress={() => setAnswer(answer === a.id ? null : a.id)} />
        ))}
      </Chips>
      <Field label="What happened" value={outcome} onChange={setOutcome} placeholder="In your own words" multiline />
      {canWait && (
        <View style={ui.gapSmall}>
          <Body muted>Still waiting? Look again</Body>
          <Chips>
            {waitChoices.map((c) => (
              <Chip key={c.when} label={c.label} selected={waiting === c.when} onPress={() => setWaiting(waiting === c.when ? null : c.when)} />
            ))}
          </Chips>
        </View>
      )}
      <View style={ui.actions}>
        <Button
          label={saving ? 'Saving…' : canWait && waiting ? 'Keep waiting' : 'Save the answer'}
          disabled={saving || (!answer && !(canWait && waiting))}
          onPress={() => {
            const base = lookBack?.answer ? reopenLookBack(entry, new Date()) : entry;
            void save(answerLookBack(base, { answer, outcome, keepWaiting: canWait && waiting ? { when: waiting } : null }, new Date()));
          }}
        />
        {open && <Button label="Not now" variant="text" onPress={() => setOpen(false)} />}
      </View>
    </Card>
  );
}
