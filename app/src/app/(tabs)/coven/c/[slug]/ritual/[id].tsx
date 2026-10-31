import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../components/covens/CovenScreen';
import { ContributionList, MyContribution, Participation } from '../../../../../../components/covens/Contributions';
import { ApologyNote } from '../../../../../../components/covens/Record';
import { MeetingScreen } from '../../../../../../components/covens/meeting/MeetingScreen';
import { SendNotice } from '../../../../../../components/covens/SendNotice';
import { GatheringTogether } from '../../../../../../components/together/GatheringTogether';
import { KeepRitual } from '../../../../../../components/covens/KeepRitual';
import { PrepList, RecordCard, StepLines, TurnBox, VoteBox } from '../../../../../../components/covens/builder/LiveParts';
import { Pill, Pills, Spoken, Words } from '../../../../../../components/covens/ui';
import { Card, Chips, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { changeAltarOnce, fetchCovenAltars, setRitualAltar, type CovenAltar } from '../../../../../../lib/covens/altarSync';
import { itemIndex } from '../../../../../../lib/altar/itemIndex';
import { useAltars } from '../../../../../../lib/altar/store';
import { cleanContribution, contributionLabel, type Contribution, type ParticipationRow, type Reader } from '../../../../../../lib/covens/contributions';
import { seedPetitionAltar } from '../../../../../../lib/covens/petitionAltar';
import { clearNamed, nameNewThings, offerPaper, paperCount, placeOffering, snuffNamed, stepAltarChange } from '../../../../../../lib/covens/ritualAltar';
import { builderStepFrom, cleanPlan, holdActive, holdLine, holdUntil, linkedEffect, roleLabel, stepThingName, type GatheringKind } from '../../../../../../lib/covens/builder';
import { buildScript, mayVote, recordBlocks, scriptText, voteOptions, type RitualRecord } from '../../../../../../lib/covens/script';
import { recordPageBlocks, textBlocks, type Gathering } from '../../../../../../lib/grimoire/coven';
import { useGrimoire } from '../../../../../../lib/grimoire/store';
import { actionForStep } from '../../../../../../lib/covens/stepActions';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import {
  altarActionButton,
  altarActionNote,
  errorMessage,
  occasionLabel,
  orderSteps,
  riteTime,
  rsvpSummary,
  stepAssignee,
  stepItemsLabel,
  stepIsMine,
  type BookPage,
  type Rsvp,
} from '../../../../../../lib/covens/model';
import { ATTENDED_LABEL, attendedAs, type AttendanceRow } from '../../../../../../lib/covens/record';
import { syncCovenReminders } from '../../../../../../lib/covens/reminders';
import { colors, radius, type } from '../../../../../../theme';

const ALTAR_ACCESS = [
  { value: 'assigned', label: 'Whoever’s step it is' },
  { value: 'everyone', label: 'Everyone' },
  { value: 'leader', label: 'Only the leader' },
] as const;
const CHOSEN = { value: 'chosen', label: 'Chosen people' } as const;

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
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ritual = coven.rituals.find((r) => r.id === id);
  const steps = orderSteps(coven.steps, id);
  const live = ritual?.status === 'live';
  const current = steps.find((s) => s.id === ritual?.current_step_id);
  const membership = coven.snapshot?.membership ?? null;
  const mine = stepIsMine(current, membership, coven.userId) && coven.standing.ok;
  const canLead = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  const { loadMarks, track } = coven;
  const covenId = coven.snapshot?.coven.id;
  const [altars, setAltars] = useState<CovenAltar[]>([]);
  const loadAltars = useCallback(async () => {
    if (covenId) setAltars(await fetchCovenAltars(covenId).catch(() => []));
  }, [covenId]);

  useEffect(() => {
    void loadAltars();
  }, [loadAltars]);

  // What people brought to each step, and who has (for those allowed to see it).
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [participation, setParticipation] = useState<ParticipationRow[]>([]);
  const asking = steps.some((s) => !!s.contribution);
  const [version, setVersion] = useState(0);
  const loadContributions = useCallback(async () => setVersion((v) => v + 1), []);
  const currentId = coven.rituals.find((r) => r.id === id)?.current_step_id ?? null;
  const { loadNames } = coven;
  useEffect(() => {
    if (!id || !asking) return;
    let off = false;
    void Promise.all([api.fetchContributions(id).catch(() => [] as Contribution[]), api.fetchParticipation(id).catch(() => [] as ParticipationRow[])]).then(([list, rows]) => {
      if (off) return;
      setContributions(list);
      setParticipation(rows);
      void loadNames(list.flatMap((c) => [c.user_id, ...(c.supporters ?? [])]).concat(rows.flatMap((r) => [...(r.done_users ?? []), ...(r.waiting_users ?? [])])));
    });
    return () => {
      off = true;
    };
  }, [id, asking, currentId, version, loadNames]);
  const altarStore = useAltars();
  const itemList = useMemo(() => itemIndex({ own: altarStore.customItems.filter((item) => item.forms.some((f) => /^https:/.test(f.image))), overrides: altarStore.overrides }), [altarStore.customItems, altarStore.overrides]);
  useEffect(() => {
    if (!live || !id) return;
    void loadMarks(id);
    track('ritual');
    return () => track('coven');
  }, [live, id, loadMarks, track]);

  // Attendance (the members' record): opening a ritual while it's under way
  // counts you as there; "Can't make it" can carry a note for the leaders,
  // who see who sent word and who was there, and can correct it.
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [attendanceVersion, setAttendanceVersion] = useState(0);
  const isMember = coven.perms.member;
  const leads = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  useEffect(() => {
    if (!live || !id || !isMember) return;
    void api.recordPresence(id).then((row) => row && setAttendanceVersion((v) => v + 1));
  }, [live, id, isMember]);
  const ritualStatus = coven.rituals.find((r) => r.id === id)?.status;
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

  // The builder's parts: the plan (roles, checklist, afterwards), the words
  // from the coven's Book, the checklist's ticks, votes, and the record.
  const ritualNow = coven.rituals.find((r) => r.id === id);
  const kind: GatheringKind = ritualNow?.kind === 'meeting' ? 'meeting' : 'rite';
  const plan = cleanPlan(ritualNow?.plan, kind);
  const builderSteps = steps.map((s) => builderStepFrom(s, plan));
  const [pages, setPages] = useState<BookPage[]>([]);
  // Linked pages you can't open come back marked, so the script says only that.
  const linkedKey = builderSteps.map((s) => s.details.book_page_id).filter(Boolean).join(',');
  useEffect(() => {
    if (covenId && linkedKey) api.fetchBookPages(covenId, linkedKey.split(',')).then(setPages).catch(() => setPages([]));
  }, [covenId, linkedKey]);
  const [prepRows, setPrepRows] = useState<api.PrepRow[]>([]);
  const [votes, setVotes] = useState<api.VoteRow[]>([]);
  const [record, setRecord] = useState<RitualRecord | null>(null);
  const [extrasVersion, setExtrasVersion] = useState(0);
  const loadExtras = useCallback(async () => setExtrasVersion((v) => v + 1), []);
  const hasPrep = plan.checklist.length > 0;
  const hasVotes = steps.some((s) => s.action === 'vote');
  const currentTurnAt = steps.find((s) => s.id === currentId)?.turn_at ?? 0;
  useEffect(() => {
    if (!id) return;
    let off = false;
    void Promise.all([
      hasPrep ? api.fetchPrep(id) : Promise.resolve([] as api.PrepRow[]),
      hasVotes ? api.fetchVotes(id) : Promise.resolve([] as api.VoteRow[]),
      ritualStatus === 'done' ? api.fetchRecord(id) : Promise.resolve(null),
    ]).then(([prep, v, rec]) => {
      if (off) return;
      setPrepRows(prep);
      setVotes(v);
      setRecord(rec);
      void loadNames([...prep.flatMap((r) => r.users ?? []), ...v.flatMap((r) => (r.ballots ?? []).map((b) => b.user_id)), ...(rec?.attendees ?? []), rec?.led_by]);
    });
    return () => {
      off = true;
    };
  }, [id, hasPrep, hasVotes, ritualStatus, currentId, currentTurnAt, extrasVersion, loadNames]);
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

  const act = async (work: () => Promise<unknown>, after?: () => Promise<unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await coven.refreshRituals();
      await after?.();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

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

  // Held at its own altar, or the coven's main ritual altar.
  const altar = altars.find((a) => a.id === ritual.altar_id) ?? altars.find((a) => a.is_main) ?? null;
  const myName = coven.me?.profile?.display_name || 'A member';
  const doAltarAction = async (step: NonNullable<typeof current>) => {
    await api.performStepAction(step.id);
    const done = coven.marks.filter((m) => m.ritual_id === ritual.id).length;
    const now = new Date().toISOString();
    const change = stepAltarChange(step, ritual, myName, done, now);
    // What it sets down carries the name the step gives it, for later steps to find.
    const thing = step.altar_action === 'place_item' ? stepThingName(step) : '';
    if (change && altar) await changeAltarOnce(altar.id, thing ? nameNewThings(change, thing, now) : change);
  };
  // A later step on something named earlier: put out Hekate’s candle, clear the crossroads offerings.
  const doLinked = async (step: NonNullable<typeof current>) => {
    const link = linkedEffect(step);
    if (!link || !altar) return;
    await changeAltarOnce(altar.id, link.kind === 'snuff' ? snuffNamed(link.name, new Date().toISOString()) : clearNamed(link.name));
    setMessage(link.kind === 'snuff' ? `${link.name === '*' ? 'Every candle' : link.name} is out.` : `${link.name} cleared from the altar.`);
  };
  const setAccess = (stepIndex: number, value: (typeof ALTAR_ACCESS)[number]['value'] | 'chosen') =>
    void act(() => setRitualAltar(ritual.id, ritual.altar_id ?? null, steps.map((s, i) => (i === stepIndex ? value : s.altar_access ?? 'assigned'))));

  const reader: Reader = { userId: coven.userId, member: coven.perms.member || coven.perms.site, leads: canLead };
  const mineFor = (stepId: string) => contributions.find((c) => c.step_id === stepId && c.mine);
  const othersFor = (stepId: string) => contributions.filter((c) => c.step_id === stepId && !c.mine);
  const rowFor = (stepId: string) => participation.find((r) => r.step_id === stepId);
  const oneDone = (stepId: string) => (rowFor(stepId)?.done ?? 0) > 0 || contributions.some((c) => c.step_id === stepId);
  const writeContribution = (stepId: string) => (body: string, items: unknown[], isPrivate: boolean, anonymous: boolean) =>
    void act(() => api.saveContribution(stepId, body, items, isPrivate, anonymous), loadContributions);
  // Offering sets a folded paper on the ritual's altar for something written (sealed and nameless as it should be),
  // and a petition the coven will hold gets its own altar's candle and paper.
  const offer = (c: Contribution) =>
    void act(async () => {
      const done = await api.offerContribution(c.id);
      const now = new Date().toISOString();
      const label = contributionLabel({ ...c, mine: false, user_id: c.anonymous ? null : c.user_id }, coven.nameOf);
      if (altar && ['petition', 'intention', 'gratitude', 'vow', 'ancestor', 'question', 'reflection'].includes(c.kind) && c.visibility !== 'me') {
        await changeAltarOnce(altar.id, (doc) => offerPaper({ id: c.id, fate: c.fate }, label, paperCount(doc), now)(doc)).catch(() => undefined);
      }
      // Something placed (an offering, a candle) is set on the altar, named as its step names it.
      const placed = steps.find((s) => s.id === c.step_id);
      if (altar && placed && (c.kind === 'offering' || c.kind === 'candle') && c.items?.length) {
        const count = coven.marks.filter((m) => m.ritual_id === ritual.id).length + contributions.filter((x) => x.status !== 'written').length;
        await changeAltarOnce(altar.id, placeOffering(c.items, label, stepThingName(placed), `${ritual.title} · ${placed.title}`, count, now)).catch(() => undefined);
      }
      if (done.petition?.altar_id) await changeAltarOnce(done.petition.altar_id, seedPetitionAltar(done.petition, now)).catch(() => undefined);
    }, loadContributions);
  const removeContribution = (c: Contribution) => void act(() => api.removeContribution(c.id), loadContributions);
  const support = (c: Contribution, kind: 'candle' | 'holding', on: boolean) => void act(() => api.supportContribution(c.id, kind, on), loadContributions);
  const tend = (c: Contribution, status: 'held' | 'answered' | 'closed', note: string) => void act(() => api.tendContribution(c.id, status, note), loadContributions);
  const askOf = (step: (typeof steps)[number]) => cleanContribution(step.contribution);
  const viewer = { membership, userId: coven.userId };
  const script = buildScript({ title: ritual.title, kind, plan, steps: builderSteps, ctx: { ranks: coven.snapshot?.ranks ?? [], nameOf: coven.nameOf }, pages, viewer });
  const scriptStep = (stepId: string) => script.sections.flatMap((x) => x.steps).find((x) => x.key === stepId);
  const steers = canLead || ritual.led_by === coven.userId;
  const currentBuilder = builderSteps.find((s) => s.key === current?.id);
  const inTurn = current?.turn_mode === 'in_turn';
  const turnOrderNow = current?.turn_order ?? [];
  const turnNow = inTurn ? turnOrderNow[current?.turn_at ?? 0] ?? null : null;
  const waitingTurn = inTurn && turnOrderNow.length > 0 && turnNow !== coven.userId && !steers;
  const voteRow = (stepId: string) => votes.find((v) => v.step_id === stepId);
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
  const currentAsk = current ? askOf(current) : null;
  const canWriteCurrent = !!current && !!currentAsk && coven.standing.ok && (mine || (currentAsk.mode === 'one' && canLead)) && (currentAsk.mode === 'each' || !!mineFor(current.id) || !oneDone(current.id)) && !waitingTurn;

  const doneOnAltar = !!current && coven.marks.some((m) => m.step_id === current.id && m.user_id === coven.userId);
  const sharedAction = current?.altar_action === 'light_candle' || current?.altar_action === 'place_item';
  const showAltarButton = !!current?.altar_action && mine && !(sharedAction && doneOnAltar);
  const at = current ? steps.indexOf(current) : -1;
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
  const confirmEnd = () =>
    Alert.alert('End the ritual now?', 'Steps not yet reached are left undone.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'End it', style: 'destructive', onPress: () => void act(() => api.goToStep(ritual.id, null)) },
    ]);

  return (
    <CovenScreen title={ritual.title} onRefresh={coven.refreshRituals}>
      <Pills>
        <Pill label={live ? 'Under way' : ritual.status === 'scheduled' ? 'On the calendar' : ritual.status === 'done' ? 'Done' : ritual.status === 'cancelled' ? 'Cancelled' : 'Draft'} tone={live ? 'gold' : undefined} />
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

      {live && current && (
        <Card tone="gold">
          <Text style={type.eyebrow}>
            Step {at + 1} of {steps.length}
            {mine ? ' · Your turn' : ` · ${stepAssignee(current, coven.snapshot?.ranks ?? [], coven.nameOf).label}`}
          </Text>
          <Text style={type.cardTitle}>{current.title}</Text>
          <Words text={current.instructions} />
          {scriptStep(current.id) ? <StepLines step={scriptStep(current.id)!} /> : !!current.spoken_text && <Spoken text={current.spoken_text} />}
          {inTurn && (
            <TurnBox
              order={turnOrderNow}
              at={current.turn_at ?? 0}
              me={coven.userId}
              steers={steers}
              busy={busy}
              nameOf={coven.nameOf}
              onDone={() => void act(() => api.nextTurn(current.id))}
              onSkip={() => void act(() => api.nextTurn(current.id, true))}
              onRestart={() => void act(() => api.restartTurns(current.id))}
            />
          )}
          {current.action === 'vote' && currentBuilder && (
            <VoteBox
              motion={String((currentBuilder.details.fields ?? {}).motion ?? '')}
              options={voteOptions(currentBuilder.details.fields ?? {})}
              row={voteRow(current.id)}
              secret={(currentBuilder.details.fields ?? {}).ballot === 'secret'}
              canVote={coven.standing.ok && mayVote(currentBuilder, plan, viewer)}
              steers={steers}
              busy={busy}
              nameOf={coven.nameOf}
              onVote={(choice) => void act(() => api.castVote(current.id, choice), loadExtras)}
              onClose={() => void act(() => api.closeVote(current.id), loadExtras)}
            />
          )}
          {!!linkedEffect(current) && !!altar && (mine || canLead) && (
            <Button
              label={linkedEffect(current)!.kind === 'snuff' ? `Put out ${linkedEffect(current)!.name === '*' ? 'every candle' : linkedEffect(current)!.name}` : `Clear ${linkedEffect(current)!.name}`}
              variant="outline"
              onPress={() => void act(() => doLinked(current))}
              disabled={busy}
            />
          )}
          {!!current.duration_minutes && <Text style={type.caption}>About {current.duration_minutes} min</Text>}
          {!!current.items?.length && <Text style={type.caption}>Items: {stepItemsLabel(current)}</Text>}
          {!!current.altar_action && <Text style={type.caption}>{altarActionNote(current)}</Text>}
          {!!currentAsk && canWriteCurrent && (
            <MyContribution
              key={mineFor(current.id)?.updated_at ?? 'new'}
              ask={currentAsk}
              mine={mineFor(current.id)}
              canWrite
              canOffer
              forCoven={currentAsk.mode === 'one'}
              items={itemList}
              busy={busy}
              onSave={writeContribution(current.id)}
              onRemove={() => mineFor(current.id) && removeContribution(mineFor(current.id)!)}
              onOffer={() => mineFor(current.id) && offer(mineFor(current.id)!)}
            />
          )}
          {!!currentAsk && currentAsk.mode === 'one' && canLead && !oneDone(current.id) && !mine && <Notice>No one has done this for the coven yet. You can do it now, above.</Notice>}
          {!!currentAsk && <Participation row={rowFor(current.id)} ask={currentAsk} nameOf={coven.nameOf} />}
          {!!currentAsk && (
            <ContributionList list={othersFor(current.id)} reader={reader} nameOf={coven.nameOf} busy={busy} onSupport={support} onTend={tend} />
          )}
          {showAltarButton && <Button label={altarActionButton(current)} onPress={() => void act(() => doAltarAction(current), () => loadMarks(ritual.id))} disabled={busy} />}
          {!!altar && <Button label="Go to the altar" variant="outline" onPress={() => router.push(covenHref(coven.slug, `altars/${altar.id}`))} />}
          <Text style={type.caption}>
            {current.altar_access === 'everyone'
              ? 'During this step, everyone can tend the altar.'
              : current.altar_access === 'leader'
                ? 'During this step, only the ritual’s leader tends the altar.'
                : current.altar_access === 'chosen'
                  ? 'During this step, the people the leader chose tend the altar.'
                  : 'During this step, the altar is tended by whoever the step belongs to.'}
          </Text>
          {sharedAction && doneOnAltar && <Text style={type.caption}>You’ve done this on the altar.</Text>}
          {(mine || canLead) && (
            <Button
              label={`${mine ? 'I’ve finished this step' : 'Finish this step'}${at === steps.length - 1 ? ' and close the ritual' : ''}`}
              variant={showAltarButton ? 'outline' : 'primary'}
              onPress={() => void act(() => api.finishStep(current.id))}
              disabled={busy}
            />
          )}
          {!mine && !canLead && <Text style={type.caption}>Follow along; the ritual moves on when this step is finished.</Text>}
        </Card>
      )}
      {live && !current && <Notice>The ritual is under way.</Notice>}

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
          <Button label={kind === 'meeting' ? 'Save the agenda to the Book' : 'Save the rite to the Book'} variant="outline" disabled={busy} onPress={() => toBook(kind === 'meeting' ? 'agenda' : 'rite', ritual.title, textBlocks(scriptText(script)))} />
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

      {!live && ritual.status === 'scheduled' && ahead.length > 0 && (
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
          {!live && <Button label="Open the altar" variant="outline" onPress={() => router.push(covenHref(coven.slug, `altars/${altar.id}`))} />}
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

      {canLead && !live && ritual.status !== 'done' && (
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
      {!live && <GatheringTogether ritual={ritual} steps={steps} covenSlug={coven.slug} canLead={canLead} />}
      {canLead && (live || ritual.status === 'scheduled' || ritual.status === 'draft') && (
        <View style={styles.lead}>
          {!live && <Button label="Start the ritual" onPress={() => void act(() => api.startRitual(ritual.id))} disabled={busy || !steps.length} />}
          {live && at > 0 && <Button label="Back a step" variant="outline" onPress={() => void act(() => api.goToStep(ritual.id, steps[at - 1].id))} disabled={busy} />}
          {live && at >= 0 && at < steps.length - 1 && <Button label="Skip to the next step" variant="outline" onPress={() => void act(() => api.goToStep(ritual.id, steps[at + 1].id))} disabled={busy} />}
          {live && <Button label="End the ritual" variant="text" onPress={confirmEnd} disabled={busy} />}
        </View>
      )}
      {message && <Notice>{message}</Notice>}

      <Section label="Steps">
        {!steps.length && <Text style={type.caption}>This ritual has no steps yet.</Text>}
        {steps.map((step, index) => {
          const who = stepAssignee(step, coven.snapshot?.ranks ?? [], coven.nameOf);
          const yours = stepIsMine(step, membership, coven.userId);
          const now = step.id === current?.id;
          return (
            <View key={step.id} style={[styles.step, now && styles.stepNow]} accessibilityLabel={`Step ${index + 1}: ${step.title}. ${who.label}.${step.completed_at ? ' Done.' : ''}${now ? ' In progress.' : ''}`}>
              <Text style={type.body}>
                {index + 1}. {step.title}
                {step.completed_at ? ' ✓' : ''}
              </Text>
              <Text style={type.caption}>
                {who.label}
                {yours && who.kind !== 'everyone' ? ' · yours' : ''}
                {step.altar_action ? ` · ${altarActionButton(step).toLowerCase()}` : ''}
                {!step.altar_action && actionForStep(step) && !step.title.includes(actionForStep(step)!.name) ? ` · ${actionForStep(step)!.name.toLowerCase()}` : ''}
              </Text>
              {!!step.items?.length && <Text style={type.caption}>Items: {stepItemsLabel(step)}</Text>}
              {!!askOf(step) && !now && (
                <>
                  <Participation row={rowFor(step.id)} ask={askOf(step)!} nameOf={coven.nameOf} />
                  <ContributionList list={contributions.filter((c) => c.step_id === step.id && (ritual.status === 'done' || c.mine || c.status !== 'written'))} reader={reader} nameOf={coven.nameOf} busy={busy} onSupport={support} onTend={tend} />
                </>
              )}
              {canLead && (
                <Chips
                  label={`At the altar during step ${index + 1}`}
                  options={step.altar_tenders?.length ? [...ALTAR_ACCESS, CHOSEN] : ALTAR_ACCESS}
                  value={step.altar_access ?? 'assigned'}
                  onChange={(v) => setAccess(index, v)}
                />
              )}
            </View>
          );
        })}
      </Section>
      {!live && <KeepRitual ritual={ritual} steps={steps} />}
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
