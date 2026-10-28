import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, Field, Notice, Section } from '../more/ui';
import { Pill, Pills } from './ui';
import { riteTime } from '../../lib/covens/model';
import {
  agoLabel,
  APOLOGY_MAX,
  ATTENDED_LABEL,
  attendanceLine,
  checkinDate,
  cleanCheckinDate,
  NOTE_MAX,
  recordRituals,
  ritualPartLine,
  RSVP_LABEL,
  studyLine,
  studyStalled,
  todayIso,
  type Checkin,
  type MemberRecord,
  type StudyRow,
} from '../../lib/covens/record';
import { colors, type } from '../../theme';

const SHOWN = 12;

// One member's record, as its keepers read it and as the member reads their
// own standing (lib/covens/record.ts; the website's twin is
// covens/coven/record.js): every ritual since they joined, their studies,
// their mentoring and how much else they've done. Never what anyone wrote.
export function RecordSections({
  record,
  nameOf,
  busy,
  onMark,
  onExcuse,
  onLogCheckin,
  onRemoveCheckin,
  onOpenStudy,
  userId,
}: {
  record: MemberRecord;
  nameOf: (id: string | null | undefined) => string;
  busy?: boolean;
  /** Correct attendance (those who lead rituals or keep the record). */
  onMark?: (ritualId: string, present: boolean | null) => void;
  onExcuse?: (ritualId: string, excused: boolean) => void;
  /** A mentor logging a check-in with their mentee. */
  onLogCheckin?: (menteeId: string, metOn: string, note: string) => void;
  onRemoveCheckin?: (id: string) => void;
  /** Open their path through a program (where steps are signed off). */
  onOpenStudy?: (study: StudyRow) => void;
  userId?: string | null;
}) {
  const [all, setAll] = useState(false);
  const { rows, summary } = recordRituals(record);
  const shown = all ? rows : rows.slice(0, SHOWN);
  const now = Date.parse(record.now);
  return (
    <>
      <Section label="Rituals">
        <Text style={type.body}>{attendanceLine(summary, 'since joining')}</Text>
        {summary.unrecorded > 0 && <Text style={type.caption}>Attendance was kept from {new Date(record.attendance_since).toLocaleDateString()}. Before that, what they answered and did in each ritual still shows.</Text>}
        {!rows.length && <Text style={type.caption}>No rituals since joining.</Text>}
        {shown.map((r) => {
          const part = ritualPartLine(r);
          const held = r.status === 'done' || r.status === 'live';
          return (
            <Card key={r.id}>
              <Text style={type.cardTitle}>{r.title}</Text>
              <Text style={type.caption}>{riteTime(r.held_at)}</Text>
              <Pills>
                <Pill label={ATTENDED_LABEL[r.attended]} tone={r.attended === 'present' ? 'gold' : r.attended === 'missed' ? 'warn' : undefined} />
                {!!r.rsvp && <Pill label={RSVP_LABEL[r.rsvp]} />}
                {r.corrected && <Pill label="Marked by a leader" />}
                {r.excused && r.attended !== 'excused' && <Pill label="Excused" />}
              </Pills>
              {r.rsvp === 'not_going' && !!r.apology && <Text style={type.caption}>{record.own ? 'Your' : 'Their'} note: {r.apology}</Text>}
              {!!part && <Text style={type.caption}>{part}</Text>}
              {(onMark || onExcuse) && (
                <View style={styles.row}>
                  {onMark && held && r.present !== true && <Button label="Was there in person" variant="outline" disabled={busy} onPress={() => onMark(r.id, true)} />}
                  {onMark && held && r.present !== false && r.attended !== 'not_recorded' && <Button label="Wasn’t there" variant="text" disabled={busy} onPress={() => onMark(r.id, false)} />}
                  {onMark && held && r.corrected && <Button label="Undo the correction" variant="text" disabled={busy} onPress={() => onMark(r.id, null)} />}
                  {onExcuse && r.attended !== 'present' && (
                    <Button label={r.excused ? 'Not excused' : 'Excuse the absence'} variant="text" disabled={busy} onPress={() => onExcuse(r.id, !r.excused)} />
                  )}
                </View>
              )}
            </Card>
          );
        })}
        {rows.length > SHOWN && <Button label={all ? 'Show fewer' : `Show all ${rows.length}`} variant="text" onPress={() => setAll(!all)} />}
      </Section>

      <Section label="Training">
        {!record.studies.length && <Text style={type.caption}>Not in any initiation or training.</Text>}
        {record.studies.map((s) => (
          <StudyCard key={s.id} study={s} now={now} onOpen={onOpenStudy ? () => onOpenStudy(s) : undefined} />
        ))}
      </Section>

      <Section label="Mentoring">
        <Text style={type.body}>{record.mentor ? `Mentored by ${nameOf(record.mentor.mentor_id)} since ${new Date(record.mentor.assigned_at).toLocaleDateString()}` : 'No mentor'}</Text>
        {!!record.mentor && (record.checkins_hidden ? <Text style={type.caption}>{record.own ? 'Your' : 'Their'} mentor’s check-ins are kept for the coven’s head.</Text> : <Checkins list={record.checkins} nameOf={nameOf} userId={userId} onRemove={onRemoveCheckin} busy={busy} />)}
        {record.mentees.map((m) => (
          <Card key={m.user_id}>
            <Text style={type.cardTitle}>Mentoring {nameOf(m.user_id)}</Text>
            <Text style={type.caption}>
              Since {new Date(m.assigned_at).toLocaleDateString()} · {m.checkins.length ? `${m.checkins.length} ${m.checkins.length === 1 ? 'check-in' : 'check-ins'}, the last ${agoLabel(m.checkins[0].met_on, now)}` : 'no check-ins yet'}
            </Text>
            {m.studies.map((s) => (
              <Text key={s.id} style={type.caption}>
                {s.title}: {studyLine(s)}
              </Text>
            ))}
            <Checkins list={m.checkins} nameOf={nameOf} userId={userId} onRemove={onRemoveCheckin} busy={busy} hideMentor />
            {onLogCheckin && <LogCheckin busy={busy} onLog={(metOn, note) => onLogCheckin(m.user_id, metOn, note)} />}
          </Card>
        ))}
      </Section>

      <Section label={record.own ? 'Other ways you’ve taken part' : 'Other ways they’ve taken part'}>
        <Text style={type.body}>
          Tended {record.activity.tendings} {record.activity.tendings === 1 ? 'petition' : 'petitions'}
          {record.activity.last_tending ? `, the last ${agoLabel(record.activity.last_tending, now)}` : ''}
        </Text>
        <Text style={type.body}>
          {record.activity.messages} {record.activity.messages === 1 ? 'message' : 'messages'} in the coven’s chat
          {record.activity.last_message ? `, the last ${agoLabel(record.activity.last_message, now)}` : ''}
        </Text>
        <Text style={type.caption}>Counts only. What was said, and one-to-one and group conversations, aren’t part of the record.</Text>
      </Section>
    </>
  );
}

export function StudyCard({ study, now, onOpen }: { study: StudyRow; now: number; onOpen?: () => void }) {
  const stalled = studyStalled(study, now);
  return (
    <Card>
      <Text style={type.cardTitle}>{study.title}</Text>
      <Pills>
        <Pill label={study.kind === 'initiation' ? 'Initiation' : 'Training'} />
        {stalled && <Pill label="Stalled" tone="warn" />}
        {study.waiting > 0 && <Pill label="Waiting for sign-off" tone="gold" />}
      </Pills>
      <Text style={type.caption}>{studyLine(study)}</Text>
      <Text style={type.caption}>Last moved {agoLabel(study.last_activity ?? study.started_at, now)} · began {new Date(study.started_at).toLocaleDateString()}</Text>
      {onOpen && <Button label="Open the path" variant="text" onPress={onOpen} />}
    </Card>
  );
}

function Checkins({ list, nameOf, userId, onRemove, busy, hideMentor }: { list: Checkin[]; nameOf: (id: string) => string; userId?: string | null; onRemove?: (id: string) => void; busy?: boolean; hideMentor?: boolean }) {
  if (!list.length) return <Text style={type.caption}>No check-ins logged yet.</Text>;
  return (
    <View style={styles.list}>
      {list.map((c) => (
        <View key={c.id} style={styles.checkin}>
          <Text style={type.caption}>
            {checkinDate(c.met_on)}
            {hideMentor ? '' : ` · ${nameOf(c.mentor_id)}`}
          </Text>
          {!!c.note && <Text style={type.body}>{c.note}</Text>}
          {onRemove && c.mentor_id === userId && <Button label="Take it back" variant="text" disabled={busy} onPress={() => onRemove(c.id)} />}
        </View>
      ))}
    </View>
  );
}

function LogCheckin({ busy, onLog }: { busy?: boolean; onLog: (metOn: string, note: string) => void }) {
  const [metOn, setMetOn] = useState(todayIso());
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <View style={styles.list}>
      <Field label="Met on" hint="Year, month, day: 2026-10-31" value={metOn} onChangeText={setMetOn} autoCapitalize="none" />
      <Field label="How it went (optional)" value={note} onChangeText={setNote} multiline maxLength={NOTE_MAX} />
      <Button
        label="Log the check-in"
        variant="outline"
        disabled={busy}
        onPress={() => {
          const day = cleanCheckinDate(metOn);
          if (!day) return setError('Write the day as year-month-day, on or before today.');
          setError(null);
          onLog(day, note);
          setNote('');
        }}
      />
      {!!error && <Notice>{error}</Notice>}
    </View>
  );
}

/** "Can't make it": the short note a member can send with that answer. */
export function ApologyNote({ sent, busy, onSend }: { sent: string | null; busy?: boolean; onSend: (note: string | null) => void }) {
  const [note, setNote] = useState(sent ?? '');
  return (
    <View style={styles.list}>
      <Field
        label="A note for the leaders (optional)"
        hint="Only those who lead the coven’s rituals see it."
        value={note}
        onChangeText={setNote}
        maxLength={APOLOGY_MAX}
        multiline
      />
      <View style={styles.row}>
        <Button label={sent ? 'Change the note' : 'Send the note'} variant="outline" disabled={busy || note.trim() === (sent ?? '')} onPress={() => onSend(note)} />
        {!!sent && (
          <Button
            label="Take it back"
            variant="text"
            disabled={busy}
            onPress={() => {
              setNote('');
              onSend(null);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  list: { gap: 8 },
  checkin: { gap: 2, borderLeftWidth: 2, borderLeftColor: colors.gold, paddingLeft: 10 },
});
