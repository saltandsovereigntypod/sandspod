import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { prepLine, turnState, type PrepItem } from '../../../lib/covens/builder';
import type { PrepRow, VoteRow } from '../../../lib/covens/api';
import { countsLine, recordMoon, tallyVotes, voteResult, type RitualRecord, type ScriptStep } from '../../../lib/covens/script';
import { colors, fonts, radius, type } from '../../../theme';
import { Button } from '../../Button';
import { Card, CheckRow, Field } from '../../more/ui';
import { Words } from '../ui';

// The live ritual's new parts (ritual/[id].tsx), as on the website
// (covens/coven/rituals.js): the checklist before the rite, the words and
// parts of the step under way (with yours marked), whose turn it is in a
// one-at-a-time step, a vote, and what the gathering left behind.

/** Each thing to do before the rite, ticked off; those who see participation see who has. */
export function PrepList({ items, rows, expected, canTick, busy, nameOf, onTick }: { items: PrepItem[]; rows: PrepRow[]; expected: number; canTick: boolean; busy: boolean; nameOf: (id: string) => string; onTick: (item: string, done: boolean) => void }) {
  return (
    <View style={styles.gap}>
      {items.map((item) => {
        const row = rows.find((r) => r.item_id === item.id);
        return (
          <View key={item.id} style={styles.gapSmall}>
            {canTick ? (
              <CheckRow label={item.text} value={!!row?.mine} onChange={(v) => !busy && onTick(item.id, v)}>
                {!!row && <Text style={type.caption}>{prepLine(row.done, expected)}</Text>}
              </CheckRow>
            ) : (
              <Text style={type.body}>• {item.text}</Text>
            )}
            {!!row?.users?.length && <Text style={type.caption}>Done: {row.users.map(nameOf).join(', ')}</Text>}
          </View>
        );
      })}
    </View>
  );
}

/** The words and parts of a step as the script reads them, yours marked. */
export function StepLines({ step }: { step: ScriptStep }) {
  if (!step.lines.length && !step.facts.length) return null;
  return (
    <View style={styles.gap}>
      {step.facts.map((f) => (
        <Text key={f} style={type.caption}>
          {f}
        </Text>
      ))}
      {step.lines.map((l, i) => (
        <View key={i} style={[styles.line, l.mine && styles.lineMine]}>
          <Text style={[styles.speaker, l.mine && styles.mine]}>
            {l.part ? `${l.part} · ` : ''}
            {l.who}
            {l.mine ? ' · you' : ''}
            {l.fromBook ? ` · from the Book: ${l.fromBook}` : ''}
          </Text>
          <Words text={l.words} style={styles.spoken} />
        </View>
      ))}
    </View>
  );
}

/** A one-at-a-time step: whose turn it is, and the buttons to move on. */
export function TurnBox({
  order,
  at,
  me,
  steers,
  busy,
  nameOf,
  onDone,
  onSkip,
  onRestart,
}: {
  order: string[];
  at: number;
  me: string | null;
  steers: boolean;
  busy: boolean;
  nameOf: (id: string) => string;
  onDone: () => void;
  onSkip: () => void;
  onRestart: () => void;
}) {
  const t = turnState(order, at);
  if (!t.total) return <Text style={type.caption}>Turns begin when people open the ritual. The leader can start them again.</Text>;
  const mine = !!me && t.current === me;
  return (
    <Card tone={mine ? 'gold' : undefined}>
      <Text style={type.eyebrow}>{t.done ? 'Everyone has had their turn' : `Turn ${t.position} of ${t.total}`}</Text>
      {!t.done && <Text style={type.cardTitle}>{mine ? 'Your turn' : `${nameOf(t.current!)}’s turn`}</Text>}
      {!t.done && !!t.next && <Text style={type.caption}>Next: {t.next === me ? 'you' : nameOf(t.next)}</Text>}
      <View style={styles.row}>
        {mine && !t.done && <Button label="I’ve done mine" onPress={onDone} disabled={busy} />}
        {steers && !t.done && !mine && <Button label="Next person" variant="outline" onPress={onSkip} disabled={busy} />}
        {steers && <Button label="Start the turns again" variant="text" onPress={onRestart} disabled={busy} />}
      </View>
    </Card>
  );
}

/** A vote under way: the motion, the answers to choose from, and the count as it may be shown. */
export function VoteBox({ motion, options, row, secret, canVote, steers, busy, nameOf, onVote, onClose, result }: { motion: string; options: string[]; row: VoteRow | undefined; secret: boolean; canVote: boolean; steers: boolean; busy: boolean; nameOf: (id: string) => string; onVote: (choice: string) => void; onClose: () => void; /** The result in words once closed (a meeting's motion: its threshold and quorum). */ result?: (counts: Record<string, number>) => string }) {
  const closed = !!row?.closed;
  const counts = row?.counts ?? null;
  return (
    <Card>
      <Text style={type.eyebrow}>{secret ? 'A secret ballot' : 'An open vote'}</Text>
      {!!motion && <Words text={motion} />}
      {canVote && !closed ? (
        <View style={styles.gapSmall}>
          {options.map((o) => (
            <Button key={o} label={row?.mine === o ? `${o} (your vote)` : o} variant={row?.mine === o ? 'primary' : 'outline'} onPress={() => onVote(o)} disabled={busy} />
          ))}
          <Text style={type.caption}>{row?.mine ? 'You can change your vote until it closes.' : 'Choose one.'}</Text>
        </View>
      ) : (
        !closed && <Text style={type.caption}>This vote is for those named on it.</Text>
      )}
      <Text style={type.caption}>{row ? `${row.total} ${row.total === 1 ? 'vote' : 'votes'} cast.` : ''}</Text>
      {counts && <Text style={type.body}>{closed && result ? result(counts) : closed ? voteResult(tallyVotes(options, Object.entries(counts).flatMap(([choice, n]) => Array.from({ length: n }, () => ({ choice }))))) : options.map((o) => `${o}: ${counts[o] ?? 0}`).join(' · ')}</Text>}
      {!secret && !!row?.ballots?.length && <Text style={type.caption}>{row.ballots.map((b) => `${nameOf(b.user_id)}: ${b.choice}`).join(' · ')}</Text>}
      {steers && !closed && <Button label="Close the vote" variant="text" onPress={onClose} disabled={busy} />}
    </Card>
  );
}

/** What the gathering left behind: when, the moon, who was there, the steps, how many took part, and its leader's notes. */
export function RecordCard({ record, nameOf, canNote, busy, onNotes }: { record: RitualRecord; nameOf: (id: string) => string; canNote: boolean; busy: boolean; onNotes: (notes: string) => void }) {
  const [notes, setNotes] = useState(record.notes ?? '');
  const date = record.held_at ?? record.ended_at;
  const counts = countsLine(record.counts);
  return (
    <Card>
      <Text style={type.eyebrow}>The record</Text>
      <Text style={type.body}>{[date ? new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '', recordMoon(record)].filter(Boolean).join(' · ')}</Text>
      <Text style={type.caption}>Who was there: {record.attendees.length ? record.attendees.map(nameOf).join(', ') : 'not recorded'}</Text>
      <Text style={type.caption}>
        {record.steps.filter((s) => s.done).length} of {record.steps.length} steps done{counts ? ` · ${counts}` : ''}
      </Text>
      {record.votes.map((v) => (
        <Text key={v.title} style={type.caption}>
          {v.title}: {voteResult({ options: v.options, counts: v.counts, total: v.total })}
        </Text>
      ))}
      {canNote ? (
        <>
          <Field label={record.kind === 'meeting' ? 'Minutes and notes' : 'Notes and reflection'} value={notes} onChangeText={setNotes} multiline maxLength={8000} placeholder="What happened, what was felt, what to remember" />
          <Button label="Save the notes" variant="outline" onPress={() => onNotes(notes)} disabled={busy || notes === (record.notes ?? '')} />
        </>
      ) : (
        !!record.notes && <Words text={record.notes} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 10 },
  gapSmall: { gap: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  line: { gap: 4, borderLeftWidth: 2, borderLeftColor: colors.hairline, paddingLeft: 12 },
  lineMine: { borderLeftColor: colors.gold },
  speaker: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
  mine: { color: colors.gold },
  spoken: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 27 },
  card: { borderRadius: radius.tile },
});
