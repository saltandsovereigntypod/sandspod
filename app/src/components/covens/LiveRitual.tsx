import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { covenHref } from './CovenScreen';
import { ContributionList, MyContribution, Participation } from './Contributions';
import { StepLines, TurnBox, VoteBox } from './builder/LiveParts';
import { Spoken, Words } from './ui';
import { Card, Chips, Notice } from '../more/ui';
import * as api from '../../lib/covens/api';
import { turnLine } from '../../lib/covens/altarPanel';
import { changeAltarOnce, fetchCovenAltars, type CovenAltar } from '../../lib/covens/altarSync';
import { itemIndex } from '../../lib/altar/itemIndex';
import { useAltars } from '../../lib/altar/store';
import { cleanContribution, contributionLabel, type Contribution, type ParticipationRow, type Reader } from '../../lib/covens/contributions';
import { seedPetitionAltar } from '../../lib/covens/petitionAltar';
import { clearNamed, nameNewThings, offerPaper, paperCount, placeOffering, snuffNamed, stepAltarChange } from '../../lib/covens/ritualAltar';
import { builderStepFrom, cleanPlan, linkedEffect, stepThingName, type GatheringKind } from '../../lib/covens/builder';
import { buildScript, mayVote, voteOptions } from '../../lib/covens/script';
import { actionForStep } from '../../lib/covens/stepActions';
import { useCoven } from '../../lib/covens/CovenContext';
import { altarActionButton, altarActionNote, errorMessage, orderSteps, stepAssignee, stepIsMine, stepItemsLabel, type BookPage, type RitualStep } from '../../lib/covens/model';
import { colors, radius, type } from '../../theme';

// A rite while it's under way: the step in progress (whose it is, whose turn,
// the words, what it asks of the altar and of you), your part in it, and
// moving it on. The ritual page (coven/c/[slug]/ritual/[id].tsx) and the
// "Ritual" window over a coven altar (AltarRitual.tsx) both use these, so the
// same people can do the same things in either place.

const ALTAR_ACCESS = [
  { value: 'assigned', label: 'Whoever’s step it is' },
  { value: 'everyone', label: 'Everyone' },
  { value: 'leader', label: 'Only the leader' },
] as const;
const CHOSEN = { value: 'chosen', label: 'Chosen people' } as const;
export type AltarAccessChoice = (typeof ALTAR_ACCESS)[number]['value'] | 'chosen';

/** Everything about one ritual's live step, and the actions on it. */
export function useLiveRitual(id: string | undefined) {
  const coven = useCoven();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ritual = id ? coven.rituals.find((r) => r.id === id) ?? null : null;
  const steps = useMemo(() => (id ? orderSteps(coven.steps, id) : []), [coven.steps, id]);
  const live = ritual?.status === 'live';
  const current = steps.find((s) => s.id === ritual?.current_step_id);
  const membership = coven.snapshot?.membership ?? null;
  const mine = stepIsMine(current, membership, coven.userId) && coven.standing.ok;
  const canLead = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  const steers = canLead || (!!ritual && ritual.led_by === coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const { loadMarks, loadNames } = coven;

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
  const currentId = ritual?.current_step_id ?? null;
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
  useEffect(() => {
    if (live && id) void loadMarks(id);
  }, [live, id, loadMarks]);

  const altarStore = useAltars();
  const itemList = useMemo(() => itemIndex({ own: altarStore.customItems.filter((item) => item.forms.some((f) => /^https:/.test(f.image))), overrides: altarStore.overrides }), [altarStore.customItems, altarStore.overrides]);

  // The builder's parts: the plan, the words from the coven's Book, and votes.
  const kind: GatheringKind = ritual?.kind === 'meeting' ? 'meeting' : 'rite';
  const plan = cleanPlan(ritual?.plan, kind);
  const builderSteps = steps.map((s) => builderStepFrom(s, plan));
  const [pages, setPages] = useState<BookPage[]>([]);
  // Linked pages you can't open come back marked, so the script says only that.
  const linkedKey = builderSteps.map((s) => s.details.book_page_id).filter(Boolean).join(',');
  useEffect(() => {
    if (covenId && linkedKey) api.fetchBookPages(covenId, linkedKey.split(',')).then(setPages).catch(() => setPages([]));
  }, [covenId, linkedKey]);
  const [votes, setVotes] = useState<api.VoteRow[]>([]);
  const [votesVersion, setVotesVersion] = useState(0);
  const loadVotes = useCallback(async () => setVotesVersion((v) => v + 1), []);
  const hasVotes = steps.some((s) => s.action === 'vote');
  const currentTurnAt = current?.turn_at ?? 0;
  useEffect(() => {
    if (!id || !hasVotes) return;
    let off = false;
    void api
      .fetchVotes(id)
      .catch(() => [] as api.VoteRow[])
      .then((v) => {
        if (off) return;
        setVotes(v);
        void loadNames(v.flatMap((r) => (r.ballots ?? []).map((b) => b.user_id)));
      });
    return () => {
      off = true;
    };
  }, [id, hasVotes, currentId, currentTurnAt, votesVersion, loadNames]);

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

  // Held at its own altar, or the coven's main ritual altar.
  const altar = (ritual && altars.find((a) => a.id === ritual.altar_id)) ?? altars.find((a) => a.is_main) ?? null;
  const myName = coven.me?.profile?.display_name || 'A member';
  const doAltarAction = async (step: RitualStep) => {
    if (!ritual) return;
    await api.performStepAction(step.id);
    const done = coven.marks.filter((m) => m.ritual_id === ritual.id).length;
    const now = new Date().toISOString();
    const change = stepAltarChange(step, ritual, myName, done, now);
    // What it sets down carries the name the step gives it, for later steps to find.
    const thing = step.altar_action === 'place_item' ? stepThingName(step) : '';
    if (change && altar) await changeAltarOnce(altar.id, thing ? nameNewThings(change, thing, now) : change);
  };
  // A later step on something named earlier: put out Hekate’s candle, clear the crossroads offerings.
  const doLinked = async (step: RitualStep) => {
    const link = linkedEffect(step);
    if (!link || !altar) return;
    await changeAltarOnce(altar.id, link.kind === 'snuff' ? snuffNamed(link.name, new Date().toISOString()) : clearNamed(link.name));
    setMessage(link.kind === 'snuff' ? `${link.name === '*' ? 'Every candle' : link.name} is out.` : `${link.name} cleared from the altar.`);
  };

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
      if (!ritual) return;
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
  const support = (c: Contribution, how: 'candle' | 'holding', on: boolean) => void act(() => api.supportContribution(c.id, how, on), loadContributions);
  const tend = (c: Contribution, status: 'held' | 'answered' | 'closed', note: string) => void act(() => api.tendContribution(c.id, status, note), loadContributions);
  const askOf = (step: RitualStep) => cleanContribution(step.contribution);
  const viewer = { membership, userId: coven.userId };
  const script = ritual ? buildScript({ title: ritual.title, kind, plan, steps: builderSteps, ctx: { ranks: coven.snapshot?.ranks ?? [], nameOf: coven.nameOf }, pages, viewer }) : null;
  const scriptStep = (stepId: string) => script?.sections.flatMap((x) => x.steps).find((x) => x.key === stepId);
  const at = current ? steps.indexOf(current) : -1;

  return {
    ritual,
    steps,
    live,
    current,
    at,
    mine,
    canLead,
    steers,
    busy,
    message,
    setMessage,
    act,
    altars,
    altar,
    loadAltars,
    contributions,
    participation,
    loadContributions,
    itemList,
    kind,
    plan,
    builderSteps,
    script,
    scriptStep,
    votes,
    loadVotes,
    doAltarAction,
    doLinked,
    reader,
    mineFor,
    othersFor,
    rowFor,
    oneDone,
    writeContribution,
    offer,
    removeContribution,
    support,
    tend,
    askOf,
    viewer,
  };
}

export type LiveRitual = ReturnType<typeof useLiveRitual>;

/** Ask before ending the ritual early, then end it. */
export function askEndRitual(live: LiveRitual) {
  const { ritual } = live;
  if (!ritual) return;
  Alert.alert('End the ritual now?', 'Steps not yet reached are left undone.', [
    { text: 'Keep going', style: 'cancel' },
    { text: 'End it', style: 'destructive', onPress: () => void live.act(() => api.goToStep(ritual.id, null)) },
  ]);
}

/** Back a step or on to the next: for those who lead rituals, as on the ritual page. */
export function moveStep(live: LiveRitual, to: 'back' | 'next') {
  const { ritual, steps, at } = live;
  if (!ritual) return;
  const target = to === 'back' ? steps[at - 1] : steps[at + 1];
  if (target) void live.act(() => api.goToStep(ritual.id, target.id));
}

/**
 * The step in progress, in full: whose it is and whose turn, the words, a
 * vote, what it does on the altar, your part (write, place, draw, light), what
 * others brought, and finishing it. `atAltar` leaves out "Go to the altar".
 */
export function LiveStepCard({ live, atAltar = false }: { live: LiveRitual; atAltar?: boolean }) {
  const coven = useCoven();
  const { ritual, steps, current, at, mine, canLead, steers, busy, act, altar } = live;
  if (!ritual || !current) return null;
  const { loadMarks } = coven;
  const currentBuilder = live.builderSteps.find((s) => s.key === current.id);
  const inTurn = current.turn_mode === 'in_turn';
  const turnOrderNow = current.turn_order ?? [];
  const turnNow = inTurn ? turnOrderNow[current.turn_at ?? 0] ?? null : null;
  const waitingTurn = inTurn && turnOrderNow.length > 0 && turnNow !== coven.userId && !steers;
  const currentAsk = live.askOf(current);
  const mineNow = live.mineFor(current.id);
  const canWriteCurrent = !!currentAsk && coven.standing.ok && (mine || (currentAsk.mode === 'one' && canLead)) && (currentAsk.mode === 'each' || !!mineNow || !live.oneDone(current.id)) && !waitingTurn;
  const doneOnAltar = coven.marks.some((m) => m.step_id === current.id && m.user_id === coven.userId);
  const sharedAction = current.altar_action === 'light_candle' || current.altar_action === 'place_item';
  const showAltarButton = !!current.altar_action && mine && !(sharedAction && doneOnAltar);
  const lines = live.scriptStep(current.id);
  const link = linkedEffect(current);
  const voteRow = live.votes.find((v) => v.step_id === current.id);
  const who = stepAssignee(current, coven.snapshot?.ranks ?? [], coven.nameOf);

  return (
    <Card tone="gold">
      <Text style={type.eyebrow}>
        Step {at + 1} of {steps.length}
        {mine ? ' · Your turn' : ` · ${who.label}`}
      </Text>
      <Text style={type.cardTitle}>{current.title}</Text>
      {atAltar && <Text style={type.caption}>{`Whose step: ${who.label}${mine && who.kind !== 'everyone' ? ' (yours)' : ''}`}</Text>}
      {atAltar && <Text style={type.caption}>{turnLine(current, coven.userId, coven.nameOf)}</Text>}
      <Words text={current.instructions} />
      {lines ? <StepLines step={lines} /> : !!current.spoken_text && <Spoken text={current.spoken_text} />}
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
          row={voteRow}
          secret={(currentBuilder.details.fields ?? {}).ballot === 'secret'}
          canVote={coven.standing.ok && mayVote(currentBuilder, live.plan, live.viewer)}
          steers={steers}
          busy={busy}
          nameOf={coven.nameOf}
          onVote={(choice) => void act(() => api.castVote(current.id, choice), live.loadVotes)}
          onClose={() => void act(() => api.closeVote(current.id), live.loadVotes)}
        />
      )}
      {!!link && !!altar && (mine || canLead) && (
        <Button
          label={link.kind === 'snuff' ? `Put out ${link.name === '*' ? 'every candle' : link.name}` : `Clear ${link.name}`}
          variant="outline"
          onPress={() => void act(() => live.doLinked(current))}
          disabled={busy}
        />
      )}
      {!!current.duration_minutes && <Text style={type.caption}>About {current.duration_minutes} min</Text>}
      {!!current.items?.length && <Text style={type.caption}>Items: {stepItemsLabel(current)}</Text>}
      {!!current.altar_action && <Text style={type.caption}>{altarActionNote(current)}</Text>}
      {!!currentAsk && canWriteCurrent && (
        <MyContribution
          key={mineNow?.updated_at ?? 'new'}
          ask={currentAsk}
          mine={mineNow}
          canWrite
          canOffer
          forCoven={currentAsk.mode === 'one'}
          items={live.itemList}
          busy={busy}
          onSave={live.writeContribution(current.id)}
          onRemove={() => mineNow && live.removeContribution(mineNow)}
          onOffer={() => mineNow && live.offer(mineNow)}
        />
      )}
      {!!currentAsk && currentAsk.mode === 'one' && canLead && !live.oneDone(current.id) && !mine && <Notice>No one has done this for the coven yet. You can do it now, above.</Notice>}
      {!!currentAsk && <Participation row={live.rowFor(current.id)} ask={currentAsk} nameOf={coven.nameOf} />}
      {!!currentAsk && <ContributionList list={live.othersFor(current.id)} reader={live.reader} nameOf={coven.nameOf} busy={busy} onSupport={live.support} onTend={live.tend} />}
      {showAltarButton && <Button label={altarActionButton(current)} onPress={() => void act(() => live.doAltarAction(current), () => loadMarks(ritual.id))} disabled={busy} />}
      {!!altar && !atAltar && <Button label="Go to the altar" variant="outline" onPress={() => router.push(covenHref(coven.slug, `altars/${altar.id}`))} />}
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
  );
}

/** Back a step, skip ahead, or end the ritual: for those who lead, as on the ritual page. */
export function LeadSteps({ live, onEnd }: { live: LiveRitual; onEnd: () => void }) {
  const { canLead, at, steps, busy } = live;
  if (!canLead || !live.live) return null;
  return (
    <View style={styles.lead}>
      {at > 0 && <Button label="Back a step" variant="outline" onPress={() => moveStep(live, 'back')} disabled={busy} />}
      {at >= 0 && at < steps.length - 1 && <Button label="Skip to the next step" variant="outline" onPress={() => moveStep(live, 'next')} disabled={busy} />}
      <Button label="End the ritual" variant="text" onPress={onEnd} disabled={busy} />
    </View>
  );
}

/**
 * Every step: whose it is, done, in progress or to come, and what was brought
 * to it. With `onAccess`, those who lead choose who tends the altar during each.
 */
export function StepList({ live, onAccess }: { live: LiveRitual; onAccess?: (stepIndex: number, value: AltarAccessChoice) => void }) {
  const coven = useCoven();
  const { ritual, steps, current, canLead, busy } = live;
  const membership = coven.snapshot?.membership ?? null;
  if (!ritual) return null;
  return (
    <>
      {!steps.length && <Text style={type.caption}>This ritual has no steps yet.</Text>}
      {steps.map((step, index) => {
        const who = stepAssignee(step, coven.snapshot?.ranks ?? [], coven.nameOf);
        const yours = stepIsMine(step, membership, coven.userId);
        const now = step.id === current?.id;
        const ask = live.askOf(step);
        const action = actionForStep(step);
        const state = step.completed_at ? 'Done' : now ? 'In progress' : ritual.status === 'live' ? 'To come' : '';
        return (
          <View key={step.id} style={[styles.step, now && styles.stepNow]} accessibilityLabel={`Step ${index + 1}: ${step.title}. ${who.label}.${step.completed_at ? ' Done.' : ''}${now ? ' In progress.' : ''}`}>
            <Text style={type.body}>
              {index + 1}. {step.title}
              {step.completed_at ? ' ✓' : ''}
            </Text>
            <Text style={type.caption}>
              {onAccess ? '' : state ? `${state} · ` : ''}
              {who.label}
              {yours && who.kind !== 'everyone' ? ' · yours' : ''}
              {step.altar_action ? ` · ${altarActionButton(step).toLowerCase()}` : ''}
              {!step.altar_action && action && !step.title.includes(action.name) ? ` · ${action.name.toLowerCase()}` : ''}
            </Text>
            {!!step.items?.length && <Text style={type.caption}>Items: {stepItemsLabel(step)}</Text>}
            {!!ask && !now && (
              <>
                <Participation row={live.rowFor(step.id)} ask={ask} nameOf={coven.nameOf} />
                <ContributionList
                  list={live.contributions.filter((c) => c.step_id === step.id && (ritual.status === 'done' || c.mine || c.status !== 'written'))}
                  reader={live.reader}
                  nameOf={coven.nameOf}
                  busy={busy}
                  onSupport={live.support}
                  onTend={live.tend}
                />
              </>
            )}
            {canLead && onAccess && (
              <Chips
                label={`At the altar during step ${index + 1}`}
                options={step.altar_tenders?.length ? [...ALTAR_ACCESS, CHOSEN] : ALTAR_ACCESS}
                value={step.altar_access ?? 'assigned'}
                onChange={(v) => onAccess(index, v)}
              />
            )}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  lead: { gap: 10 },
  step: { gap: 2, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  stepNow: { borderColor: colors.gold },
});
