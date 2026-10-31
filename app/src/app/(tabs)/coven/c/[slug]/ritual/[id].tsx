import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../components/covens/CovenScreen';
import { MyContribution } from '../../../../../../components/covens/Contributions';
import { askEndRitual, LeadSteps, LiveStepCard, StepList, useLiveRitual, type AltarAccessChoice } from '../../../../../../components/covens/LiveRitual';
import { ApologyNote } from '../../../../../../components/covens/Record';
import { MeetingScreen } from '../../../../../../components/covens/meeting/MeetingScreen';
import { SendNotice } from '../../../../../../components/covens/SendNotice';
import { KeepRitual } from '../../../../../../components/covens/KeepRitual';
import { PrepList, RecordCard } from '../../../../../../components/covens/builder/LiveParts';
import { Pill, Pills, Words } from '../../../../../../components/covens/ui';
import { Card, Chips, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { setRitualAltar } from '../../../../../../lib/covens/altarSync';
import { holdActive, holdLine, holdUntil, roleLabel } from '../../../../../../lib/covens/builder';
import { recordBlocks, scriptText, type RitualRecord } from '../../../../../../lib/covens/script';
import { recordPageBlocks, textBlocks, type Gathering } from '../../../../../../lib/grimoire/coven';
import { useGrimoire } from '../../../../../../lib/grimoire/store';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import {
  occasionLabel,
  riteTime,
  rsvpSummary,
  stepIsMine,
  type Rsvp,
} from '../../../../../../lib/covens/model';
import { ATTENDED_LABEL, attendedAs, type AttendanceRow } from '../../../../../../lib/covens/record';
import { syncCovenReminders } from '../../../../../../lib/covens/reminders';
import { colors, radius, type } from '../../../../../../theme';

const ANSWERS = [
  { value: 'going', label: 'Going' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_going', label: 'Can’t make it' },
] as const;

// One rite: when it is and who's coming, its steps and who each belongs to,
// what you're asked to bring or write before it, and, while it's under way,
// the step in progress. When the step is yours you do your part (and anything
// it asks of the shared altar, or of you) and finish it; those who lead
// rituals start it, step back or ahead, and end it. What others wrote shows as
// each step allows (contributions.ts), and the coven's head, and those the
// head chooses, see who has taken part.
export default function GatheringScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coven = useCoven();
  // A meeting has its own screen (components/covens/meeting/MeetingScreen.tsx).
  if (coven.rituals.find((r) => r.id === id)?.kind === 'meeting') return <MeetingScreen key={id} ritualId={id} />;
  return <RitualScreen />;
}

function RitualScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coven = useCoven();
  // The live step, contributions, votes, the altar and the actions on them are
  // shared with the "Ritual" window over a coven altar (LiveRitual.tsx).
  const live = useLiveRitual(id);
  const { ritual, steps, current, canLead, steers, busy, message, setMessage, act, altars, altar, loadAltars, itemList, kind, plan, script, mineFor, oneDone, askOf, writeContribution, removeContribution } = live;
  const isLive = live.live;
  const membership = coven.snapshot?.membership ?? null;
  const { track } = coven;
  const covenId = coven.snapshot?.coven.id;
  const currentId = ritual?.current_step_id ?? null;
  const { loadNames } = coven;
  // Where you are, for the others: here while it's under way.
  useEffect(() => {
    if (!isLive || !id) return;
    track('ritual');
    return () => track('coven');
  }, [isLive, id, track]);

  // Attendance (the members' record): opening a ritual while it's under way
  // counts you as there; "Can't make it" can carry a note for the leaders,
  // who see who sent word and who was there, and can correct it.
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [attendanceVersion, setAttendanceVersion] = useState(0);
  const isMember = coven.perms.member;
  const leads = canLead;
  useEffect(() => {
    if (!isLive || !id || !isMember) return;
    void api.recordPresence(id).then((row) => row && setAttendanceVersion((v) => v + 1)).catch(() => undefined);
  }, [isLive, id, isMember]);
  const ritualStatus = ritual?.status;
  useEffect(() => {
    if (!id || !ritualStatus || ritualStatus === 'draft') return;
    let off = false;
    void api.fetchAttendance(id).catch(() => [] as AttendanceRow[]).then((rows) => {
      if (off) return;
      setAttendance(rows);
      void loadNames(rows.map((r) => r.user_id));
    });
    return () => {
      off = true;
    };
  }, [id, ritualStatus, attendanceVersion, loadNames]);
  useEffect(() => {
    if (!leads || !covenId || (ritualStatus !== 'live' && ritualStatus !== 'done')) return;
    void api.fetchMembers(covenId).then((list) => {
      setPeople(list.map((m) => m.user_id));
      void loadNames(list.map((m) => m.user_id));
    }).catch(() => {});
  }, [leads, covenId, ritualStatus, loadNames]);

  // The checklist's ticks and the record.
  const [prepRows, setPrepRows] = useState<api.PrepRow[]>([]);
  const [record, setRecord] = useState<RitualRecord | null>(null);
  const [extrasVersion, setExtrasVersion] = useState(0);
  const loadExtras = useCallback(async () => setExtrasVersion((v) => v + 1), []);
  const hasPrep = plan.checklist.length > 0;
  useEffect(() => {
    if (!id) return;
    let off = false;
    void Promise.all([
      hasPrep ? api.fetchPrep(id).catch(() => [] as api.PrepRow[]) : Promise.resolve([] as api.PrepRow[]),
      ritualStatus === 'done' ? api.fetchRecord(id).catch(() => null) : Promise.resolve(null),
    ]).then(([prep, rec]) => {
      if (off) return;
      setPrepRows(prep);
      setRecord(rec);
      void loadNames([...prep.flatMap((r) => r.users ?? []), ...(rec?.attendees ?? []), rec?.led_by]);
    });
    return () => {
      off = true;
    };
  }, [id, hasPrep, ritualStatus, currentId, extrasVersion, loadNames]);
  // Your own copy in your grimoire, under Coven rites, once you were there.
  const grimoire = useGrimoire();
  const covenName = coven.snapshot?.coven.name ?? 'The coven';
  const wasThere = !!record && !!coven.userId && record.attendees.includes(coven.userId);
  const { saveCovenRite } = grimoire.actions;
  const grimoireReady = grimoire.canEdit && !!grimoire.snapshot;
  const nameOfCoven = coven.nameOf;
  const keptRite = useRef<string | null>(null);
  useEffect(() => {
    if (!wasThere || !grimoireReady || !record || keptRite.current === record.ritual_id) return;
    keptRite.current = record.ritual_id;
    saveCovenRite({ ritualId: record.ritual_id, covenName, record, nameOf: nameOfCoven });
  }, [wasThere, grimoireReady, record, covenName, saveCovenRite, nameOfCoven]);

  if (!ritual) {
    return (
      <CovenScreen title="Ritual" onRefresh={coven.refreshRituals}>
        <Text style={type.body}>{coven.rituals.length ? 'This ritual couldn’t be found. It may have been removed.' : 'Loading…'}</Text>
      </CovenScreen>
    );
  }

  const answers = rsvpSummary(coven.rsvps, ritual.id, coven.userId);
  const myAttendance = attendance.find((a) => a.user_id === coven.userId);
  const attendanceOf = (userId: string) => attendance.find((a) => a.user_id === userId);
  const withNotes = answers.notGoing.map((r) => ({ userId: r.user_id, row: attendanceOf(r.user_id) }));
  const changeAttendance = (work: () => Promise<unknown>) => void act(work, async () => setAttendanceVersion((v) => v + 1));
  const heldAt = ritual.scheduled_for ?? new Date().toISOString();
  const answer = async (response: Rsvp['response']) => {
    const next = response === answers.mine ? null : response;
    await act(
      () => api.rsvp(ritual.id, next),
      async () => {
        if (next === 'going' || next === 'maybe') {
          const set = await syncCovenReminders(coven.userId, { ask: true });
          setMessage(set ? 'We’ll remind you the day before and an hour before.' : 'Saved. Turn on notifications to get reminders.');
        } else void syncCovenReminders(coven.userId);
      },
    );
  };

  const setAccess = (stepIndex: number, value: AltarAccessChoice) =>
    void act(() => setRitualAltar(ritual.id, ritual.altar_id ?? null, steps.map((s, i) => (i === stepIndex ? value : s.altar_access ?? 'assigned'))));

  const until = holdUntil(ritual.ended_at, plan);
  const expected = answers.going.length + answers.maybe.length;
  const canBook = (coven.perms.writeBook && coven.standing.ok) || coven.perms.site;
  // Onto the Book's own shelf (Rites, Meeting minutes, Ritual records); saving again updates the same page.
  const toBook = (what: Gathering, pageTitle: string, blocks: unknown[]) => {
    if (!covenId) return;
    const shelf = what === 'rite' ? 'Rites' : what === 'record' ? 'Ritual records' : 'Meeting minutes';
    void act(async () => {
      const saved = await api.saveGathering(covenId, ritual.id, what, pageTitle, blocks);
      setMessage(saved.status === 'published' ? `It is in the coven’s Book, under ${shelf}.` : 'Sent to those who approve the Book’s pages.');
    });
  };
  // Before the rite: steps asking something ahead of time that are yours, or the coven's one no one has written yet.
  const ahead = steps.filter((s) => {
    const ask = askOf(s);
    if (!ask || ask.timing !== 'ahead' || !coven.standing.ok) return false;
    if (stepIsMine(s, membership, coven.userId)) return ask.mode === 'each' || !!mineFor(s.id) || !oneDone(s.id);
    return ask.mode === 'one' && canLead && (!!mineFor(s.id) || !oneDone(s.id));
  });
  const canSchedule = coven.perms.schedule || coven.perms.site;
  const confirmCancel = () =>
    Alert.alert('Cancel this rite?', 'Those going are told it’s off. You can put it back on the calendar later.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel it', style: 'destructive', onPress: () => void act(() => api.setRitualStatus(ritual.id, 'cancelled')) },
    ]);
  const confirmDelete = () =>
    Alert.alert('Delete this ritual?', 'Its steps and RSVPs go with it.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          void act(async () => {
            await api.setRitualStatus(ritual.id, 'deleted');
            router.replace(covenHref(coven.slug, 'rituals'));
          }),
      },
    ]);
  const confirmEnd = () => askEndRitual(live);

  return (
    <CovenScreen title={ritual.title} onRefresh={coven.refreshRituals}>
      <Pills>
        <Pill label={isLive ? 'Under way' : ritual.status === 'scheduled' ? 'On the calendar' : ritual.status === 'done' ? 'Done' : ritual.status === 'cancelled' ? 'Cancelled' : 'Draft'} tone={isLive ? 'gold' : undefined} />
        {!!occasionLabel(ritual) && <Pill label={occasionLabel(ritual)} />}
        {kind === 'meeting' && <Pill label="Meeting" />}
      </Pills>
      {!!ritual.scheduled_for && <Text style={type.caption}>{riteTime(ritual.scheduled_for)}</Text>}
      {!!ritual.intention && <Text style={type.body}>Intention: {ritual.intention}</Text>}
      <Words text={ritual.description} />
      {plan.roles.length > 0 && (
        <Section label="Roles">
          {plan.roles.map((r) => (
            <Text key={r.id} style={type.body}>
              {roleLabel(r, { ranks: coven.snapshot?.ranks ?? [], nameOf: coven.nameOf })}
            </Text>
          ))}
        </Section>
      )}
      {steps.length > 0 && (
        <View style={styles.row}>
          <Button label="The script" variant="outline" onPress={() => router.push(`${covenHref(coven.slug, 'ritual/script')}?id=${ritual.id}&mode=script` as never)} />
          <Button label="Your run-through" variant="outline" onPress={() => router.push(`${covenHref(coven.slug, 'ritual/script')}?id=${ritual.id}&mode=run` as never)} />
        </View>
      )}
      {hasPrep && ritual.status !== 'done' && ritual.status !== 'cancelled' && (
        <Section label={kind === 'meeting' ? 'Before the meeting' : 'Before the rite'}>
          <PrepList items={plan.checklist} rows={prepRows} expected={expected} canTick={coven.perms.member && coven.standing.ok} busy={busy} nameOf={coven.nameOf} onTick={(item, done) => void act(() => api.tickPrep(ritual.id, item, done), loadExtras)} />
        </Section>
      )}

      {ritual.status === 'scheduled' && (
        <Section label="Will you be there?">
          {coven.perms.member && coven.standing.ok && <Chips label="Your answer" options={ANSWERS} value={(answers.mine ?? '') as Rsvp['response']} onChange={(v) => void answer(v)} />}
          <Text style={type.caption}>
            {[`${answers.going.length} going`, answers.maybe.length ? `${answers.maybe.length} maybe` : '', answers.notGoing.length ? `${answers.notGoing.length} can’t make it` : ''].filter(Boolean).join(' · ')}
          </Text>
          {answers.going.length > 0 && <Text style={type.caption}>Going: {answers.going.map((r) => coven.nameOf(r.user_id)).join(', ')}</Text>}
          {answers.mine === 'not_going' && coven.perms.member && coven.standing.ok && (
            <ApologyNote key={myAttendance?.apology ?? ''} sent={myAttendance?.apology ?? null} busy={busy} onSend={(note) => changeAttendance(() => api.sendApology(ritual.id, note))} />
          )}
          {leads &&
            withNotes.map(({ userId, row }) => (
              <View key={userId} style={styles.sent}>
                <Text style={type.caption}>
                  {coven.nameOf(userId)} can’t make it{row?.apology ? `: “${row.apology}”` : '.'}
                  {row?.excused ? ' Excused.' : ''}
                </Text>
                <Button label={row?.excused ? 'Not excused' : 'Excuse the absence'} variant="text" disabled={busy} onPress={() => changeAttendance(() => api.excuseAbsence(ritual.id, userId, !row?.excused))} />
              </View>
            ))}
        </Section>
      )}

      {leads && (ritual.status === 'live' || ritual.status === 'done') && people.length > 0 && (
        <Section label="Who was there">
          <Text style={type.caption}>Someone counts as there when they open the ritual while it’s under way. Correct it for anyone who joined in person.</Text>
          {people.map((userId) => {
            const row = attendanceOf(userId);
            const state = attendedAs({ status: ritual.status, held_at: heldAt }, row, '1970-01-01T00:00:00Z');
            return (
              <View key={userId} style={styles.sent}>
                <Text style={type.body}>
                  {coven.nameOf(userId)} · {ATTENDED_LABEL[state === 'under_way' ? 'missed' : state]}
                  {row?.marked_by ? ' (marked)' : ''}
                </Text>
                <View style={styles.lead}>
                  {row?.present !== true && <Button label="Was there in person" variant="text" disabled={busy} onPress={() => changeAttendance(() => api.markAttendance(ritual.id, userId, true))} />}
                  {row?.present === true && <Button label="Wasn’t there" variant="text" disabled={busy} onPress={() => changeAttendance(() => api.markAttendance(ritual.id, userId, false))} />}
                  {row?.present !== true && <Button label={row?.excused ? 'Not excused' : 'Excuse the absence'} variant="text" disabled={busy} onPress={() => changeAttendance(() => api.excuseAbsence(ritual.id, userId, !row?.excused))} />}
                </View>
              </View>
            );
          })}
        </Section>
      )}

      {isLive && current && <LiveStepCard live={live} />}
      {isLive && !current && <Notice>The ritual is under way.</Notice>}

      {ritual.status === 'done' && (!!until || !!plan.afterwards.notes) && (
        <Section label="Afterwards">
          {!!until && <Text style={type.body}>{holdLine(until)}</Text>}
          {!!plan.afterwards.notes && <Words text={plan.afterwards.notes} />}
          {canLead && !!altar && holdActive(until) && <Button label="End the quiet time now" variant="text" onPress={() => void act(() => api.releaseAltarHold(altar.id))} disabled={busy} />}
        </Section>
      )}
      {ritual.status === 'done' && record && (
        <RecordCard key={record.notes ?? ''} record={record} nameOf={coven.nameOf} canNote={steers} busy={busy} onNotes={(notes) => void act(() => api.setRecordNotes(ritual.id, notes), loadExtras)} />
      )}
      {wasThere && grimoireReady && <Text style={type.caption}>A copy is in your grimoire, under Coven rites.</Text>}
      {canBook && steps.length > 0 && (
        <View style={styles.row}>
          <Button label={kind === 'meeting' ? 'Save the agenda to the Book' : 'Save the rite to the Book'} variant="outline" disabled={busy} onPress={() => toBook(kind === 'meeting' ? 'agenda' : 'rite', ritual.title, textBlocks(script ? scriptText(script) : ''))} />
          {ritual.status === 'done' && record && (
            <Button
              label={kind === 'meeting' ? 'Save the minutes to the Book' : 'Save the record to the Book'}
              variant="outline"
              disabled={busy}
              onPress={() => toBook(kind === 'meeting' ? 'minutes' : 'record', `${ritual.title} · ${new Date(record.held_at ?? record.ended_at ?? Date.now()).toLocaleDateString()}`, recordPageBlocks(recordBlocks(record, coven.nameOf)))}
            />
          )}
        </View>
      )}

      {!isLive && ritual.status === 'scheduled' && ahead.length > 0 && (
        <Section label="Before the rite">
          {ahead.map((s) => (
            <Card key={s.id}>
              <Text style={type.caption}>For step {steps.indexOf(s) + 1}: {s.title}</Text>
              <MyContribution
                key={mineFor(s.id)?.updated_at ?? 'new'}
                ask={askOf(s)!}
                mine={mineFor(s.id)}
                canWrite
                canOffer={false}
                forCoven={askOf(s)!.mode === 'one'}
                items={itemList}
                busy={busy}
                onSave={writeContribution(s.id)}
                onRemove={() => mineFor(s.id) && removeContribution(mineFor(s.id)!)}
                onOffer={() => undefined}
              />
            </Card>
          ))}
        </Section>
      )}

      {!!altar && (
        <Section label="The altar">
          <Text style={type.body}>Held at {altar.name}.</Text>
          {!isLive && <Button label="Open the altar" variant="outline" onPress={() => router.push(covenHref(coven.slug, `altars/${altar.id}`))} />}
          {canLead && altars.filter((a) => !a.archived_at).length > 1 && (
            <Chips
              label="Held at"
              options={altars.filter((a) => !a.archived_at).map((a) => ({ value: a.id, label: a.name }))}
              value={altar.id}
              onChange={(next) => void act(() => setRitualAltar(ritual.id, next, null), loadAltars)}
            />
          )}
          {canLead && <Text style={type.caption}>Its leader and the altar’s keepers can always tend it. For each step below, choose who else can.</Text>}
        </Section>
      )}

      {canLead && !isLive && ritual.status !== 'done' && (
        <View style={styles.lead}>
          <Button label="Edit the ritual" variant="outline" onPress={() => router.push(`${covenHref(coven.slug, 'ritual/plan')}?id=${ritual.id}` as never)} disabled={busy} />
          {ritual.status === 'draft' && canSchedule && <Button label="Put it on the calendar" variant="outline" onPress={() => void act(() => api.setRitualStatus(ritual.id, 'scheduled'))} disabled={busy} />}
          {ritual.status === 'scheduled' && <Button label="Back to drafts" variant="text" onPress={() => void act(() => api.setRitualStatus(ritual.id, 'draft'))} disabled={busy} />}
          {ritual.status === 'cancelled' && canSchedule && <Button label="Put it back on the calendar" variant="outline" onPress={() => void act(() => api.setRitualStatus(ritual.id, 'scheduled'))} disabled={busy} />}
          {ritual.status === 'scheduled' && <Button label="Cancel the rite" variant="text" onPress={confirmCancel} disabled={busy} />}
          <Button label="Delete the ritual" variant="text" onPress={confirmDelete} disabled={busy} />
        </View>
      )}
      {ritual.status === 'scheduled' && <SendNotice ritual={ritual} />}
      {canLead && (isLive || ritual.status === 'scheduled' || ritual.status === 'draft') && (
        <View style={styles.lead}>
          {!isLive && <Button label="Start the ritual" onPress={() => void act(() => api.startRitual(ritual.id))} disabled={busy || !steps.length} />}
          {isLive && <LeadSteps live={live} onEnd={confirmEnd} />}
        </View>
      )}
      {message && <Notice>{message}</Notice>}

      <Section label="Steps">
        <StepList live={live} onAccess={setAccess} />
      </Section>
      {!isLive && <KeepRitual ritual={ritual} steps={steps} />}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  lead: { gap: 10 },
  sent: { gap: 2 },
  step: { gap: 2, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  stepNow: { borderColor: colors.gold },
});
