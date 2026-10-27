import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../../Button';
import { Card, Chips, Field, MenuList, Notice, Section } from '../../more/ui';
import { Composer, ThreadRow, useMessageActions } from '../Chat';
import { CovenScreen, covenHref } from '../CovenScreen';
import { ApologyNote } from '../Record';
import { SearchPicker } from '../SearchPicker';
import { SendNotice } from '../SendNotice';
import { Pill, Pills, Words } from '../ui';
import { PrepList, StepLines, TurnBox, VoteBox } from '../builder/LiveParts';
import * as api from '../../../lib/covens/api';
import * as meet from '../../../lib/covens/meetingApi';
import { builderStepFrom, cleanPlan, isVoteAction, roleLabel, specsOf, stepSummary, type BuilderStep } from '../../../lib/covens/builder';
import { useCoven } from '../../../lib/covens/CovenContext';
import { cleanValues } from '../../../lib/covens/fields';
import {
  actionDueLine,
  actionIsMine,
  actionLine,
  audienceLabel,
  chatAccess,
  chatLine,
  composeMinutes,
  floorState,
  historyEntries,
  historyKeys,
  historyLabel,
  inAudience,
  itemTimer,
  maySecond,
  meetingPowers,
  minutesPageBlocks,
  outstandingActions,
  stepResult,
  voteCalled,
  type MeetingAction,
  type MeetingState,
} from '../../../lib/covens/meetings';
import { chatMessages, errorMessage, orderSteps, riteTime, rsvpSummary, type BookPage, type Member, type Rsvp } from '../../../lib/covens/model';
import { assigneeFromKey, assigneeKey, cleanAssignees, whoEntries, type Assignee } from '../../../lib/covens/picker';
import type { AttendanceRow } from '../../../lib/covens/record';
import { buildScript, mayVote, voteOptions } from '../../../lib/covens/script';
import { threadItems } from '../../../lib/covens/thread';
import { colors, radius, type } from '../../../theme';

const ANSWERS = [
  { value: 'going', label: 'Going' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'not_going', label: 'Can’t make it' },
] as const;

const WIDE = 900;

// A coven meeting (lib/covens/meetings.ts), as on the website
// (covens/coven/meeting.js): who it is for, its agenda, and while it's under
// way the item in hand (its time, the floor, a motion seconded and amended,
// the vote, a round, the roll call), the Secretary's notes and the actions
// agreed. Its own chat sits beside it (below, and folded away if you like,
// on a phone), never in the coven's chat. When it ends the minutes are
// written into the coven's Book. The Chair steers; the Secretary keeps the
// notes; the coven's head chooses who reads the whole chat afterwards.
export function MeetingScreen({ ritualId }: { ritualId: string }) {
  const coven = useCoven();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE;
  const ritual = coven.rituals.find((r) => r.id === ritualId);
  const covenId = coven.snapshot?.coven.id ?? null;
  const ranks = useMemo(() => coven.snapshot?.ranks ?? [], [coven.snapshot?.ranks]);
  const membership = coven.snapshot?.membership ?? null;
  const { loadNames } = coven;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [state, setState] = useState<MeetingState | null>(null);
  const [messages, setMessages] = useState<meet.MeetingMessage[] | null>(null);
  const [actions, setActions] = useState<MeetingAction[]>([]);
  const [votes, setVotes] = useState<api.VoteRow[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [prepRows, setPrepRows] = useState<api.PrepRow[]>([]);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [defaults, setDefaults] = useState<string[] | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const status = ritual?.status;
  const currentId = ritual?.current_step_id ?? null;
  // What the meeting needs: its state, chat, actions, votes, who came, the coven's members and Book.
  useEffect(() => {
    if (!covenId || !ritual) return;
    let off = false;
    void Promise.all([
      meet.fetchMeetingState(ritualId),
      meet.fetchMeetingMessages(ritualId).catch(() => [] as meet.MeetingMessage[]),
      meet.fetchActions(covenId),
      api.fetchVotes(ritualId),
      status === 'draft' ? Promise.resolve([] as AttendanceRow[]) : api.fetchAttendance(ritualId).catch(() => [] as AttendanceRow[]),
      api.fetchPrep(ritualId),
    ]).then(([st, msgs, acts, v, att, prep]) => {
      if (off) return;
      setState(st);
      setMessages(msgs);
      setActions(acts);
      setVotes(v);
      setAttendance(att);
      setPrepRows(prep);
      void loadNames([...msgs.map((m) => m.user_id), ...att.map((a) => a.user_id), st.floor_user, ...st.hands, ...acts.flatMap((a) => cleanAssignees(a.assignees).filter((x) => x.kind === 'user').map((x) => x.id)), ...v.flatMap((r) => (r.ballots ?? []).map((b) => b.user_id))]);
    });
    return () => {
      off = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reloads when the meeting moves on
  }, [covenId, ritualId, status, currentId, version]);
  useEffect(() => {
    if (!covenId) return;
    void api.fetchMembers(covenId).then((list) => {
      setMembers(list);
      void loadNames(list.map((m) => m.user_id));
    }).catch(() => {});
    api.fetchBookPages(covenId).then(setPages).catch(() => setPages([]));
    void meet.fetchMeetingDefaults(covenId).then(setDefaults);
  }, [covenId, loadNames]);
  // Live: the chat, the state and the actions as others change them.
  useEffect(
    () =>
      meet.listenMeeting(ritualId, (change) => {
        if (change.table === 'coven_meeting_messages') {
          const m = change.new as unknown as meet.MeetingMessage;
          if (!m.id) return;
          void loadNames([m.user_id]);
          setMessages((list) => (list ? (list.some((x) => x.id === m.id) ? list.map((x) => (x.id === m.id ? { ...x, ...m } : x)) : [...list, m]) : list));
        } else reload();
      }),
    [ritualId, reload, loadNames],
  );
  // Opening the meeting while it's under way counts you as there.
  useEffect(() => {
    if (status !== 'live' || !coven.perms.member) return;
    void api.recordPresence(ritualId).then((row) => row && reload());
  }, [status, ritualId, coven.perms.member, reload]);

  const plan = useMemo(() => cleanPlan(ritual?.plan, 'meeting'), [ritual?.plan]);
  const steps = useMemo(() => orderSteps(coven.steps, ritualId), [coven.steps, ritualId]);
  const builderSteps = useMemo(() => steps.map((s) => builderStepFrom(s, plan)), [steps, plan]);
  const viewer = { userId: coven.userId, membership, head: coven.perms.founder, site: coven.perms.site };
  const standingOk = coven.standing.ok;
  const leads = (coven.perms.lead && standingOk) || coven.perms.site;

  if (!ritual) {
    return (
      <CovenScreen title="Meeting" onRefresh={coven.refreshRituals}>
        <Text style={type.body}>{coven.rituals.length ? 'This meeting couldn’t be found. It may have been removed, or kept to others.' : 'Loading…'}</Text>
      </CovenScreen>
    );
  }

  const powers = meetingPowers(ritual, { ...viewer, leads, standing: standingOk });
  const keys = historyKeys(ritual.chat_readers, defaults);
  const access = chatAccess(ritual, state, keys, { ...viewer, standing: standingOk }, now);
  const live = ritual.status === 'live';
  const current = builderSteps.find((s) => s.key === ritual.current_step_id) ?? null;
  const currentRow = steps.find((s) => s.id === ritual.current_step_id) ?? null;
  const at = current ? builderSteps.indexOf(current) : -1;
  const item = current ? state?.items[current.key] : undefined;
  const ctx = { ranks, nameOf: coven.nameOf };
  const whoCtx = { ...ctx, roles: plan.roles };
  const pageTitle = (pid: string) => {
    const p = pages.find((x) => x.id === pid);
    return p ? (p.hidden ? 'A page you can’t open' : p.title) : 'A page of the Book';
  };
  const script = buildScript({ title: ritual.title, kind: 'meeting', plan, steps: builderSteps, ctx, pages, viewer: { membership, userId: coven.userId } });
  const scriptStep = (key: string) => script.sections.flatMap((x) => x.steps).find((x) => x.key === key);
  const mine = actions.filter((a) => a.ritual_id === ritual.id);
  const outstanding = outstandingActions(actions, coven.rituals, ritual);
  const answers = rsvpSummary(coven.rsvps, ritual.id, coven.userId);
  const myAttendance = attendance.find((a) => a.user_id === coven.userId);
  const audienceMembers = members.filter((m) => inAudience(ritual, { userId: m.user_id, membership: m, head: m.user_id === coven.snapshot?.coven.founder_id }));
  const present = attendance.filter((a) => a.present).map((a) => a.user_id);
  const floor = floorState(state, coven.userId, coven.nameOf);
  const voteRow = (key: string) => votes.find((v) => v.step_id === key);

  const act = async (work: () => Promise<unknown>, done?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await coven.refreshRituals();
      reload();
      if (done) setMessage(done);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  // The minutes, from what the meeting left behind, onto the Book's Meeting minutes shelf.
  const writeMinutes = async (view: 'audience' | 'coven' | null = null) => {
    const [record, freshVotes, freshAttendance, freshActions, freshState, freshSteps] = await Promise.all([
      api.fetchRecord(ritual.id),
      api.fetchVotes(ritual.id),
      api.fetchAttendance(ritual.id).catch(() => [] as AttendanceRow[]),
      meet.fetchActions(ritual.coven_id),
      meet.fetchMeetingState(ritual.id),
      api.fetchSteps([ritual.id]),
    ]);
    const done = coven.rituals.find((r) => r.id === ritual.id) ?? ritual;
    const minutes = composeMinutes({
      ritual: { ...done, status: 'done' },
      steps: orderSteps(freshSteps, ritual.id).map((s) => ({ ...builderStepFrom(s, plan), completed_at: s.completed_at, started_at: s.started_at ?? null })),
      attendees: record?.attendees ?? freshAttendance.filter((a) => a.present).map((a) => a.user_id),
      apologies: freshAttendance.filter((a) => !!a.apology || a.excused).map((a) => ({ user_id: a.user_id, note: a.apology ?? null, excused: !!a.excused })),
      state: freshState,
      votes: freshVotes,
      actions: freshActions.filter((a) => a.ritual_id === ritual.id),
      outstanding: outstandingActions(freshActions, coven.rituals, done),
      ranks,
      nameOf: coven.nameOf,
      pageTitle,
    });
    await meet.saveMinutes(ritual.id, minutes.title, minutesPageBlocks(minutes.blocks), view);
  };

  const endMeeting = () =>
    Alert.alert('End the meeting?', 'Items not yet reached are left as they are. The minutes are written into the coven’s Book.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'End it',
        style: 'destructive',
        onPress: () =>
          void act(async () => {
            await api.goToStep(ritual.id, null);
            await coven.refreshRituals();
            await writeMinutes().catch(() => setMessage('The meeting has ended. The minutes couldn’t be written just now; try again below.'));
          }, 'The meeting has ended. Its minutes are in the coven’s Book, under Meeting minutes.'),
      },
    ]);

  const chat = (
    <MeetingChat
      ritualId={ritual.id}
      covenId={ritual.coven_id}
      line={chatLine(ritual, access, now)}
      access={access}
      messages={messages}
      setMessages={setMessages}
      steers={powers.steers}
      status={ritual.status}
      busy={busy}
      onChat={(what) => void act(() => meet.setChat(ritual.id, what, what === 'extend' ? 15 : 15))}
    />
  );

  const main = (
    <View style={styles.gap}>
      <Pills>
        <Pill label={live ? 'Under way' : ritual.status === 'scheduled' ? 'On the calendar' : ritual.status === 'done' ? 'Done' : ritual.status === 'cancelled' ? 'Cancelled' : 'Draft'} tone={live ? 'gold' : undefined} />
        <Pill label="Meeting" />
        {!!ritual.audience && <Pill label="Kept to some" />}
      </Pills>
      {!!ritual.scheduled_for && <Text style={type.caption}>{riteTime(ritual.scheduled_for)}</Text>}
      <Text style={type.caption}>For: {audienceLabel(ritual.audience, ranks, coven.nameOf)}</Text>
      {!!ritual.intention && <Text style={type.body}>Purpose: {ritual.intention}</Text>}
      <Words text={ritual.description} />
      {plan.roles.length > 0 && (
        <Section label="Roles">
          {plan.roles.map((r) => (
            <Text key={r.id} style={type.body}>
              {roleLabel(r, ctx)}
            </Text>
          ))}
        </Section>
      )}

      {ritual.status === 'scheduled' && (
        <Section label="Will you be there?">
          {coven.perms.member && standingOk && (
            <Chips label="Your answer" options={ANSWERS} value={(answers.mine ?? '') as Rsvp['response']} onChange={(v) => void act(() => api.rsvp(ritual.id, v === answers.mine ? null : v))} />
          )}
          <Text style={type.caption}>{[`${answers.going.length} going`, answers.maybe.length ? `${answers.maybe.length} maybe` : '', answers.notGoing.length ? `${answers.notGoing.length} can’t make it` : ''].filter(Boolean).join(' · ')}</Text>
          {answers.mine === 'not_going' && coven.perms.member && standingOk && (
            <ApologyNote key={myAttendance?.apology ?? ''} sent={myAttendance?.apology ?? null} busy={busy} onSend={(note) => void act(() => api.sendApology(ritual.id, note))} />
          )}
        </Section>
      )}
      {plan.checklist.length > 0 && (ritual.status === 'scheduled' || ritual.status === 'draft') && (
        <Section label="Before the meeting">
          <PrepList items={plan.checklist} rows={prepRows} expected={answers.going.length + answers.maybe.length} canTick={coven.perms.member && standingOk} busy={busy} nameOf={coven.nameOf} onTick={(itemId, done) => void act(() => api.tickPrep(ritual.id, itemId, done))} />
        </Section>
      )}

      {outstanding.length > 0 && (
        <Section label="Outstanding from last time">
          <ActionList list={outstanding} nameOf={coven.nameOf} ranks={ranks} now={now} canMark={(a) => powers.keepsNotes || (standingOk && actionIsMine(a, membership, coven.userId))} busy={busy} onStatus={(a, s) => void act(() => meet.setActionStatus(a.id, s))} />
        </Section>
      )}

      {live && current && currentRow && (
        <Card tone="gold">
          <Text style={type.eyebrow}>
            Item {at + 1} of {builderSteps.length}
            {plan.sections.find((s) => s.id === current.section) ? ` · ${plan.sections.find((s) => s.id === current.section)!.name}` : ''}
          </Text>
          <Text style={type.cardTitle}>{current.title}</Text>
          <TimerLine startedAt={currentRow.started_at ?? null} minutes={current.duration_minutes} extra={item?.extra_minutes ?? 0} now={now} />
          <Words text={current.instructions} />
          {scriptStep(current.key) && <StepLines step={scriptStep(current.key)!} />}
          <Floor floor={floor} state={state} steers={powers.steers} canAsk={powers.open && standingOk && coven.perms.member} present={present} nameOf={coven.nameOf} busy={busy} onRaise={(up) => void act(() => meet.raiseHand(ritual.id, up))} onGive={(uid) => void act(() => meet.setFloor(ritual.id, uid))} />
          {current.action === 'motion' && (
            <MotionBox step={current} item={item} me={coven.userId} standing={standingOk && powers.open} steers={powers.steers} busy={busy} nameOf={coven.nameOf} whoKeyLabel={(k) => (k.startsWith('role:') ? plan.roles.find((r) => `role:${r.id}` === k)?.name ?? 'A role' : coven.nameOf(assigneeFromKey(k)?.id ?? ''))}
              onSecond={(on) => void act(() => meet.secondMotion(current.key, on))}
              onAmend={(text) => void act(() => meet.proposeAmendment(current.key, text))}
              onDecide={(id, s) => void act(() => meet.decideAmendment(current.key, id, s))}
            />
          )}
          {isVoteAction(current.action) && !voteCalled(current, item) && (
            <View style={styles.gapSmall}>
              <Text style={type.caption}>{current.action === 'election' ? 'Voting opens when the Chair calls it.' : 'The vote opens when the Chair calls it.'}</Text>
              {powers.steers && <Button label="Call the vote" variant="outline" disabled={busy || (current.action === 'motion' && !item?.seconded_by)} onPress={() => void act(() => meet.callVote(current.key))} />}
              {powers.steers && current.action === 'motion' && !item?.seconded_by && <Text style={type.caption}>A motion needs a seconder before the vote.</Text>}
            </View>
          )}
          {isVoteAction(current.action) && voteCalled(current, item) && (
            <VoteBox
              motion={current.action === 'election' ? `Position: ${String((current.details.fields ?? {}).position ?? '')}` : String((current.details.fields ?? {}).motion ?? '')}
              options={voteOptions(cleanValues(specsOf(current), current.details.fields))}
              row={voteRow(current.key)}
              secret={(current.details.fields ?? {}).ballot === 'secret'}
              canVote={standingOk && powers.open && mayVote(current, plan, { membership, userId: coven.userId })}
              steers={powers.steers}
              busy={busy}
              nameOf={coven.nameOf}
              onVote={(choice) => void act(() => api.castVote(current.key, choice))}
              onClose={() => void act(() => api.closeVote(current.key))}
              result={(counts) => stepResult(current, counts).line}
            />
          )}
          {currentRow.turn_mode === 'in_turn' && (
            <TurnBox
              order={currentRow.turn_order ?? []}
              at={currentRow.turn_at ?? 0}
              me={coven.userId}
              steers={powers.steers}
              busy={busy}
              nameOf={coven.nameOf}
              onDone={() => void act(() => api.nextTurn(current.key))}
              onSkip={() => void act(() => api.nextTurn(current.key, true))}
              onRestart={() => void act(() => api.restartTurns(current.key))}
            />
          )}
          {current.action === 'roll_call' && (
            <RollCall people={audienceMembers.map((m) => m.user_id)} attendance={attendance} canMark={powers.keepsNotes} busy={busy} nameOf={coven.nameOf} onMark={(uid, here) => void act(() => api.markAttendance(ritual.id, uid, here))} />
          )}
          {current.action === 'review_actions' && !outstanding.length && <Text style={type.caption}>Nothing is outstanding from last time.</Text>}
          <Notes key={`${current.key}-${item?.notes ?? ''}`} notes={item?.notes ?? ''} canEdit={powers.keepsNotes} busy={busy} onSave={(text) => void act(() => meet.setNotes(current.key, text), 'Notes kept.')} />
          {powers.keepsNotes && <AddAction people={audienceMembers.map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) }))} ranks={ranks} busy={busy} onAdd={(body, who, due) => act(() => meet.addAction(ritual.id, current.key, body, who, due), 'Added. It is on their To tend list.')} />}
          {mine.filter((a) => a.step_id === current.key).length > 0 && (
            <ActionList list={mine.filter((a) => a.step_id === current.key)} nameOf={coven.nameOf} ranks={ranks} now={now} canMark={() => powers.keepsNotes} busy={busy} onStatus={(a, s) => void act(() => meet.setActionStatus(a.id, s))} />
          )}
          {powers.steers && (
            <View style={styles.row}>
              {at > 0 && <Button label="Back an item" variant="text" disabled={busy} onPress={() => void act(() => api.goToStep(ritual.id, builderSteps[at - 1].key))} />}
              <Button label="Five more minutes" variant="text" disabled={busy} onPress={() => void act(() => meet.extendItem(current.key, 5))} />
              {at < builderSteps.length - 1 ? <Button label="Next item" disabled={busy} onPress={() => void act(() => api.finishStep(current.key))} /> : <Button label="End the meeting" disabled={busy} onPress={endMeeting} />}
            </View>
          )}
          {!powers.steers && <Text style={type.caption}>The Chair moves the meeting on.</Text>}
        </Card>
      )}
      {live && !current && <Notice>The meeting is under way.</Notice>}

      {ritual.status === 'done' && (
        <Card>
          <Text style={type.eyebrow}>The minutes</Text>
          {state?.minutes_page_id ? (
            <>
              <Text style={type.body}>The minutes are in the coven’s Book, under Meeting minutes{powers.keepsNotes ? '. The Chair and Secretary can change them there, and every change is kept.' : '.'}</Text>
              <Button label="Read the minutes" variant="outline" onPress={() => router.push(covenHref(coven.slug, `book/${state.minutes_page_id}`))} />
            </>
          ) : (
            <Text style={type.body}>{powers.keepsNotes ? 'The minutes haven’t been written into the Book yet.' : 'The minutes will be in the coven’s Book, under Meeting minutes.'}</Text>
          )}
          {powers.keepsNotes && (
            <>
              <Button label={state?.minutes_page_id ? 'Write the minutes again from the meeting' : 'Write the minutes'} variant="outline" disabled={busy} onPress={() => void act(() => writeMinutes(), 'The minutes are in the coven’s Book.')} />
              {!!ritual.audience && (
                <Chips
                  label="Who reads the minutes"
                  options={[{ value: 'audience', label: 'Those it was for' }, { value: 'coven', label: 'The whole coven' }] as const}
                  value={plan.meeting?.minutes_view ?? 'audience'}
                  onChange={(v) => void act(() => writeMinutes(v), v === 'coven' ? 'The whole coven can read the minutes now.' : 'Only those it was for can read the minutes now.')}
                />
              )}
              {!!state?.minutes_page_id && <Text style={type.caption}>Writing them again replaces the page with what the meeting recorded. Changes made in the Book stay in its history.</Text>}
            </>
          )}
        </Card>
      )}

      {mine.length > 0 && (
        <Section label="Actions">
          <ActionList list={mine} nameOf={coven.nameOf} ranks={ranks} now={now} canMark={(a) => powers.keepsNotes || (standingOk && actionIsMine(a, membership, coven.userId))} canRemove={powers.keepsNotes} busy={busy} onStatus={(a, s) => void act(() => meet.setActionStatus(a.id, s))} onRemove={(a) => void act(() => meet.removeAction(a.id))} />
        </Section>
      )}
      {ritual.status === 'done' && powers.keepsNotes && (
        <AddAction people={audienceMembers.map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) }))} ranks={ranks} busy={busy} onAdd={(body, who, due) => act(() => meet.addAction(ritual.id, null, body, who, due), 'Added. It is on their To tend list.')} />
      )}

      {(coven.perms.founder || coven.perms.site) && (
        <HistoryReaders
          keys={keys}
          own={!!ritual.chat_readers}
          label={historyLabel(keys, plan, ranks, coven.nameOf)}
          entries={historyEntries(plan, whoEntries(ranks, members.map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) }))))}
          labelOf={(k) => historyLabel([k], plan, ranks, coven.nameOf).replace(/ and the coven’s head$/, '')}
          busy={busy}
          onSet={(next) => void act(() => meet.setChatReaders(ritual.id, next), 'Saved.')}
          onDefault={() => covenId && void act(() => meet.setMeetingDefaults(covenId, keys), 'This is now the coven’s default for every meeting that hasn’t its own.')}
        />
      )}
      {!(coven.perms.founder || coven.perms.site) && <Text style={type.caption}>Afterwards, the whole chat is read by: {historyLabel(keys, plan, ranks, coven.nameOf).replace(/^./, (c) => c.toLowerCase())}. Everyone else has the minutes.</Text>}

      <Section label="The agenda">
        {!builderSteps.length && <Text style={type.caption}>Nothing on the agenda yet.</Text>}
        {plan.sections.map((section) => {
          const list = builderSteps.filter((s) => s.section === section.id);
          if (!list.length) return null;
          return (
            <View key={section.id} style={styles.gapSmall}>
              <Text style={type.eyebrow}>{section.name}</Text>
              {list.map((s) => {
                const row = steps.find((x) => x.id === s.key);
                const now_ = s.key === ritual.current_step_id;
                const vote = isVoteAction(s.action) ? voteRow(s.key) : undefined;
                return (
                  <View key={s.key} style={[styles.item, now_ && styles.itemNow]}>
                    <Text style={type.body}>
                      {builderSteps.indexOf(s) + 1}. {stepSummary(s, whoCtx)}
                      {row?.completed_at ? ' ✓' : ''}
                    </Text>
                    {!!state?.items[s.key]?.notes && !now_ && <Text style={type.caption}>Notes: {state.items[s.key].notes}</Text>}
                    {vote?.closed && <Text style={type.caption}>{stepResult(s, vote.counts).line}</Text>}
                    {Array.isArray((s.details.fields ?? {}).pages) && <Text style={type.caption}>Papers: {((s.details.fields ?? {}).pages as string[]).map(pageTitle).join(', ')}</Text>}
                  </View>
                );
              })}
            </View>
          );
        })}
      </Section>

      {message && <Notice>{message}</Notice>}
      {(leads || powers.steers) && ritual.status !== 'done' && ritual.status !== 'cancelled' && (
        <View style={styles.gapSmall}>
          {!live && leads && <Button label="Start the meeting" disabled={busy || !steps.length} onPress={() => void act(() => api.startRitual(ritual.id))} />}
          {!live && !leads && powers.steers && <Text style={type.caption}>Those who lead the coven’s rituals start the meeting; then you chair it.</Text>}
          {live && powers.steers && current && at === builderSteps.length - 1 ? null : live && powers.steers && <Button label="End the meeting" variant="text" disabled={busy} onPress={endMeeting} />}
          {!live && leads && <Button label="Edit the meeting" variant="outline" onPress={() => router.push(`${covenHref(coven.slug, 'ritual/plan')}?id=${ritual.id}` as never)} />}
          {!live && leads && ritual.status === 'draft' && (coven.perms.schedule || coven.perms.site) && <Button label="Put it on the calendar" variant="outline" disabled={busy} onPress={() => void act(() => api.setRitualStatus(ritual.id, 'scheduled'))} />}
          {!live && leads && ritual.status === 'scheduled' && <Button label="Cancel the meeting" variant="text" disabled={busy} onPress={() => void act(() => api.setRitualStatus(ritual.id, 'cancelled'))} />}
        </View>
      )}
      {!live && ritual.status === 'scheduled' && <SendNotice ritual={ritual} />}
    </View>
  );

  return (
    <CovenScreen title={ritual.title} onRefresh={async () => {
      await coven.refreshRituals();
      reload();
    }}>
      {wide ? (
        <View style={styles.columns}>
          <View style={styles.mainCol}>{main}</View>
          <View style={styles.chatCol}>{chat}</View>
        </View>
      ) : (
        <>
          <Card>
            <View style={styles.row}>
              <Text style={[type.eyebrow, styles.grow]}>The meeting’s chat</Text>
              <Button label={chatOpen ? 'Fold it away' : 'Show it'} variant="text" onPress={() => setChatOpen(!chatOpen)} />
            </View>
            {chatOpen ? chat : <Text style={type.caption}>{chatLine(ritual, access, now)}</Text>}
          </Card>
          {main}
        </>
      )}
    </CovenScreen>
  );
}

// ─── The chat ────────────────────────────────────────────────────────────

function MeetingChat({
  ritualId,
  covenId,
  line,
  access,
  messages,
  setMessages,
  steers,
  status,
  busy,
  onChat,
}: {
  ritualId: string;
  covenId: string;
  line: string;
  access: ReturnType<typeof chatAccess>;
  messages: meet.MeetingMessage[] | null;
  setMessages: (fn: (list: meet.MeetingMessage[] | null) => meet.MeetingMessage[] | null) => void;
  steers: boolean;
  status: string;
  busy: boolean;
  onChat: (what: 'open' | 'close' | 'extend') => void;
}) {
  const coven = useCoven();
  const [problem, setProblem] = useState<string | null>(null);
  const scroll = useRef<ScrollView>(null);
  const blocked = useMemo(() => coven.me?.blocks ?? [], [coven.me?.blocks]);
  const items = useMemo(() => threadItems(chatMessages(messages ?? [], blocked).slice(-300), coven.userId, true), [messages, blocked, coven.userId]);
  const actions = useMessageActions(
    (id) => setMessages((list) => (list ? list.map((x) => (x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x)) : list)),
    setProblem,
    { remove: meet.removeMeetingMessage, reportType: 'meeting_message' },
  );
  const send = async (body: string) => {
    setProblem(null);
    try {
      const row = await meet.sendMeetingMessage(ritualId, covenId, body);
      setMessages((list) => (list && !list.some((m) => m.id === row.id) ? [...list, row] : list));
      return true;
    } catch (error) {
      setProblem(errorMessage(error));
      return false;
    }
  };
  const note = access.write ? null : !coven.standing.ok ? coven.standing.reasons[0] : line;
  return (
    <View style={styles.gapSmall}>
      <Text style={type.caption}>{line} Only those the meeting is for see this chat. It isn’t part of the coven’s chat.</Text>
      {access.read ? (
        <ScrollView ref={scroll} style={styles.chat} contentContainerStyle={styles.chatInner} nestedScrollEnabled onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
          {!messages ? <Text style={type.caption}>Loading…</Text> : !items.length ? <Text style={type.caption}>No one has written yet.</Text> : items.map((item) => <ThreadRow key={item.key} item={item} nameOf={(id) => coven.nameOf(id ?? '')} onLongPress={actions.open} />)}
        </ScrollView>
      ) : (
        <Text style={type.caption}>You have the minutes, in the coven’s Book.</Text>
      )}
      {problem && <Notice>{problem}</Notice>}
      {access.read && <Composer onSend={send} disabled={!access.write} note={note} />}
      {steers && status !== 'cancelled' && (
        <View style={styles.row}>
          {!access.open && <Button label={status === 'done' ? 'Open it again for a while' : 'Open the chat now'} variant="text" disabled={busy} onPress={() => onChat('open')} />}
          {access.open && <Button label="Close the chat" variant="text" disabled={busy} onPress={() => onChat('close')} />}
          {access.open && <Button label="Fifteen minutes more" variant="text" disabled={busy} onPress={() => onChat('extend')} />}
        </View>
      )}
      {actions.sheet}
    </View>
  );
}

// ─── Parts of the item under way ─────────────────────────────────────────

function TimerLine({ startedAt, minutes, extra, now }: { startedAt: string | null; minutes: number | null; extra: number; now: number }) {
  const t = itemTimer(startedAt, minutes, extra, now);
  if (!t) return null;
  return <Text style={[type.caption, t.over && styles.over]}>{t.line}</Text>;
}

function Floor({
  floor,
  state,
  steers,
  canAsk,
  present,
  nameOf,
  busy,
  onRaise,
  onGive,
}: {
  floor: ReturnType<typeof floorState>;
  state: MeetingState | null;
  steers: boolean;
  canAsk: boolean;
  present: string[];
  nameOf: (id: string) => string;
  busy: boolean;
  onRaise: (up: boolean) => void;
  onGive: (userId: string | null) => void;
}) {
  const others = present.filter((id) => id !== floor.holder && !floor.queue.includes(id));
  return (
    <View style={styles.floor} accessibilityLabel={floor.line}>
      <Text style={type.body}>{floor.line}</Text>
      {floor.queue.length > 0 && <Text style={type.caption}>Asking for the floor: {floor.queue.map(nameOf).join(', ')}</Text>}
      <View style={styles.row}>
        {canAsk && !floor.speaking && <Button label={floor.handUp ? 'Put my hand down' : 'Ask for the floor'} variant="text" disabled={busy} onPress={() => onRaise(!floor.handUp)} />}
        {steers && floor.queue.map((id) => <Button key={id} label={`Give the floor to ${nameOf(id)}`} variant="text" disabled={busy} onPress={() => onGive(id)} />)}
        {steers && !!floor.holder && <Button label="Take the floor back" variant="text" disabled={busy} onPress={() => onGive(null)} />}
      </View>
      {steers && others.length > 0 && !state?.floor_user && (
        <Chips label="Give the floor to" options={others.map((id) => ({ value: id, label: nameOf(id) }))} value={'' as string} onChange={(id) => onGive(id)} />
      )}
    </View>
  );
}

function MotionBox({
  step,
  item,
  me,
  standing,
  steers,
  busy,
  nameOf,
  whoKeyLabel,
  onSecond,
  onAmend,
  onDecide,
}: {
  step: BuilderStep;
  item: MeetingState['items'][string] | undefined;
  me: string | null;
  standing: boolean;
  steers: boolean;
  busy: boolean;
  nameOf: (id: string) => string;
  whoKeyLabel: (key: string) => string;
  onSecond: (on: boolean) => void;
  onAmend: (text: string) => void;
  onDecide: (id: string, status: 'accepted' | 'rejected') => void;
}) {
  const [text, setText] = useState('');
  const fields = step.details.fields ?? {};
  const proposer = Array.isArray(fields.proposer) ? (fields.proposer as string[]).map(whoKeyLabel).join(', ') : '';
  const called = !!item?.vote_called_at;
  return (
    <Card>
      <Text style={type.eyebrow}>The motion</Text>
      <Words text={String(fields.motion ?? '')} />
      {!!proposer && <Text style={type.caption}>Proposed by {proposer}</Text>}
      <Text style={type.caption}>{item?.seconded_by ? `Seconded by ${item.seconded_by === me ? 'you' : nameOf(item.seconded_by)}` : 'Not seconded yet'}</Text>
      {maySecond(step, item, me, standing) && <Button label={item?.seconded_by === me ? 'Take back my seconding' : 'Second it'} variant={item?.seconded_by === me ? 'text' : 'outline'} disabled={busy} onPress={() => onSecond(item?.seconded_by !== me)} />}
      {(item?.amendments ?? []).map((a) => (
        <View key={a.id} style={styles.gapSmall}>
          <Text style={type.body}>
            Amendment{a.by ? ` from ${nameOf(a.by)}` : ''}: {a.text} <Text style={type.caption}>({a.status === 'accepted' ? 'accepted' : a.status === 'rejected' ? 'set aside' : 'proposed'})</Text>
          </Text>
          {steers && !called && a.status === 'proposed' && (
            <View style={styles.row}>
              <Button label="Accept it" variant="text" disabled={busy} onPress={() => onDecide(a.id, 'accepted')} />
              <Button label="Set it aside" variant="text" disabled={busy} onPress={() => onDecide(a.id, 'rejected')} />
            </View>
          )}
        </View>
      ))}
      {standing && !called && (
        <>
          <Field label="Propose an amendment" value={text} onChangeText={setText} multiline maxLength={1000} placeholder="Every second month instead" />
          <Button
            label="Propose it"
            variant="outline"
            disabled={busy || !text.trim()}
            onPress={() => {
              onAmend(text);
              setText('');
            }}
          />
        </>
      )}
    </Card>
  );
}

function RollCall({ people, attendance, canMark, busy, nameOf, onMark }: { people: string[]; attendance: AttendanceRow[]; canMark: boolean; busy: boolean; nameOf: (id: string) => string; onMark: (userId: string, here: boolean | null) => void }) {
  return (
    <View style={styles.gapSmall}>
      <Text style={type.eyebrow}>Roll call</Text>
      {people.map((id) => {
        const row = attendance.find((a) => a.user_id === id);
        const line = row?.present ? 'Here' : row?.apology ? `Sent apologies: “${row.apology}”` : row?.present === false ? 'Not here' : 'Not here yet';
        return (
          <View key={id} style={styles.rowBetween}>
            <Text style={[type.body, styles.grow]}>
              {nameOf(id)} · <Text style={type.caption}>{line}</Text>
            </Text>
            {canMark && !row?.present && <Button label="Here" variant="text" disabled={busy} onPress={() => onMark(id, true)} />}
            {canMark && row?.present && <Button label="Not here" variant="text" disabled={busy} onPress={() => onMark(id, false)} />}
          </View>
        );
      })}
    </View>
  );
}

function Notes({ notes, canEdit, busy, onSave }: { notes: string; canEdit: boolean; busy: boolean; onSave: (text: string) => void }) {
  const [text, setText] = useState(notes);
  if (!canEdit) return notes ? <Words text={`Notes: ${notes}`} /> : null;
  return (
    <View style={styles.gapSmall}>
      <Field label="The Secretary’s notes for this item" value={text} onChangeText={setText} multiline maxLength={8000} placeholder="What was said, and what was agreed" />
      <Button label="Keep the notes" variant="outline" disabled={busy || text === notes} onPress={() => onSave(text)} />
    </View>
  );
}

function AddAction({ people, ranks, busy, onAdd }: { people: { id: string; name: string }[]; ranks: { id: string; name: string; level: number }[]; busy: boolean; onAdd: (body: string, who: Assignee[], due: string | null) => Promise<unknown> }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [who, setWho] = useState<Assignee[]>([]);
  const [due, setDue] = useState('');
  const entries = whoEntries(ranks, people, { coven: true });
  const label = (k: string) => entries.find((e) => e.key === k)?.label ?? 'Someone';
  const badDate = !!due.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(due.trim());
  if (!open) return <Button label="Add an action" variant="outline" onPress={() => setOpen(true)} />;
  return (
    <Card>
      <Text style={type.eyebrow}>An action</Text>
      <Field label="What is to be done" value={body} onChangeText={setBody} maxLength={500} placeholder="Book the hall for Yule" />
      <SearchPicker
        label="Who does it"
        chips={who.map((a) => ({ key: assigneeKey(a), label: label(assigneeKey(a)) }))}
        entries={entries}
        onAdd={(entry) => {
          const a = assigneeFromKey(entry.key);
          if (a) setWho(a.kind === 'coven' ? [a] : cleanAssignees([...who.filter((x) => x.kind !== 'coven'), a]));
        }}
        onRemove={(key) => setWho(who.filter((a) => assigneeKey(a) !== key))}
        placeholder="A person or a position"
        empty="No one yet"
      />
      <Field label="By when (optional)" value={due} onChangeText={setDue} placeholder="2026-12-12" autoCorrect={false} />
      {badDate && <Text style={type.caption}>Write the date as year-month-day, like 2026-12-12.</Text>}
      <Text style={type.caption}>It goes on their To tend list, with a reminder the day before it’s due.</Text>
      <View style={styles.row}>
        <Button
          label="Add it"
          disabled={busy || !body.trim() || !who.length || badDate}
          onPress={() =>
            void onAdd(body, who, due.trim() || null).then(() => {
              setBody('');
              setWho([]);
              setDue('');
              setOpen(false);
            })
          }
        />
        <Button label="Cancel" variant="text" onPress={() => setOpen(false)} />
      </View>
    </Card>
  );
}

function ActionList({
  list,
  nameOf,
  ranks,
  now,
  canMark,
  canRemove,
  busy,
  onStatus,
  onRemove,
}: {
  list: MeetingAction[];
  nameOf: (id: string) => string;
  ranks: { id: string; name: string }[];
  now: number;
  canMark: (a: MeetingAction) => boolean;
  canRemove?: boolean;
  busy: boolean;
  onStatus: (a: MeetingAction, status: MeetingAction['status']) => void;
  onRemove?: (a: MeetingAction) => void;
}) {
  return (
    <MenuList>
      {list.map((a, i) => (
        <View key={a.id} style={[styles.action, i === list.length - 1 && styles.actionLast]}>
          <Text style={[type.body, a.status !== 'open' && styles.doneText]}>{actionLine({ ...a, due_on: null, status: 'open' }, ranks, nameOf)}</Text>
          <Text style={type.caption}>{actionDueLine(a, now)}</Text>
          <View style={styles.row}>
            {canMark(a) && a.status === 'open' && <Button label="Done" variant="text" disabled={busy} onPress={() => onStatus(a, 'done')} />}
            {canMark(a) && a.status !== 'open' && <Button label="Open it again" variant="text" disabled={busy} onPress={() => onStatus(a, 'open')} />}
            {canRemove && a.status === 'open' && <Button label="Drop it" variant="text" disabled={busy} onPress={() => onStatus(a, 'dropped')} />}
            {canRemove && onRemove && <Button label="Remove" variant="text" disabled={busy} onPress={() => onRemove(a)} />}
          </View>
        </View>
      ))}
    </MenuList>
  );
}

/** The coven's head chooses who reads the whole chat once the meeting is over (for this meeting, or for every meeting). */
function HistoryReaders({
  keys,
  own,
  label,
  entries,
  labelOf,
  busy,
  onSet,
  onDefault,
}: {
  keys: string[];
  own: boolean;
  label: string;
  entries: ReturnType<typeof historyEntries>;
  labelOf: (key: string) => string;
  busy: boolean;
  onSet: (keys: string[] | null) => void;
  onDefault: () => void;
}) {
  return (
    <Card>
      <Text style={type.eyebrow}>Who reads the whole chat afterwards</Text>
      <Text style={type.caption}>Once the meeting is over, only these read its chat. Everyone else it was for has the minutes. You decide, as the coven’s head.</Text>
      <SearchPicker
        label="Who reads the whole chat afterwards"
        chips={keys.map((k) => ({ key: k, label: labelOf(k).replace(/^./, (c) => c.toUpperCase()) }))}
        entries={entries}
        onAdd={(entry) => onSet([...new Set([...keys, entry.key])])}
        onRemove={(key) => onSet(keys.filter((k) => k !== key))}
        placeholder="The Chair, the Elders, Rowan…"
        empty="Only you"
      />
      <Text style={type.caption}>Now: {label}.</Text>
      <View style={styles.row}>
        {own && <Button label="Follow the coven’s default" variant="text" disabled={busy} onPress={() => onSet(null)} />}
        <Button label="Make this the coven’s default" variant="text" disabled={busy} onPress={onDefault} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  gapSmall: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  columns: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  mainCol: { flex: 3, minWidth: 0 },
  chatCol: { flex: 2, minWidth: 0 },
  chat: { maxHeight: 420, minHeight: 160, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  chatInner: { padding: 8, gap: 2 },
  floor: { gap: 6, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.hairline },
  over: { color: colors.gold },
  item: { gap: 2, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  itemNow: { borderColor: colors.gold },
  action: { gap: 2, paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  actionLast: { borderBottomWidth: 0 },
  doneText: { textDecorationLine: 'line-through', color: colors.muted },
});

