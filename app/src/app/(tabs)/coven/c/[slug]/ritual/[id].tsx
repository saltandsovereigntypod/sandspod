import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../components/covens/CovenScreen';
import { ContributionList, MyContribution, Participation } from '../../../../../../components/covens/Contributions';
import { Pill, Pills, Spoken, Words } from '../../../../../../components/covens/ui';
import { Card, Chips, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { changeAltarOnce, fetchCovenAltars, setRitualAltar, type CovenAltar } from '../../../../../../lib/covens/altarSync';
import { itemIndex } from '../../../../../../lib/altar/itemIndex';
import { useAltars } from '../../../../../../lib/altar/store';
import { cleanContribution, contributionLabel, type Contribution, type ParticipationRow, type Reader } from '../../../../../../lib/covens/contributions';
import { seedPetitionAltar } from '../../../../../../lib/covens/petitionAltar';
import { offerPaper, paperCount, stepAltarChange } from '../../../../../../lib/covens/ritualAltar';
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
  type Rsvp,
} from '../../../../../../lib/covens/model';
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
export default function RitualScreen() {
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
    const change = stepAltarChange(step, ritual, myName, done, new Date().toISOString());
    if (change && altar) await changeAltarOnce(altar.id, change);
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
      if (done.petition?.altar_id) await changeAltarOnce(done.petition.altar_id, seedPetitionAltar(done.petition, now)).catch(() => undefined);
    }, loadContributions);
  const removeContribution = (c: Contribution) => void act(() => api.removeContribution(c.id), loadContributions);
  const support = (c: Contribution, kind: 'candle' | 'holding', on: boolean) => void act(() => api.supportContribution(c.id, kind, on), loadContributions);
  const tend = (c: Contribution, status: 'held' | 'answered' | 'closed', note: string) => void act(() => api.tendContribution(c.id, status, note), loadContributions);
  const askOf = (step: (typeof steps)[number]) => cleanContribution(step.contribution);
  // Before the rite: steps asking something ahead of time that are yours, or the coven's one no one has written yet.
  const ahead = steps.filter((s) => {
    const ask = askOf(s);
    if (!ask || ask.timing !== 'ahead' || !coven.standing.ok) return false;
    if (stepIsMine(s, membership, coven.userId)) return ask.mode === 'each' || !!mineFor(s.id) || !oneDone(s.id);
    return ask.mode === 'one' && canLead && (!!mineFor(s.id) || !oneDone(s.id));
  });
  const currentAsk = current ? askOf(current) : null;
  const canWriteCurrent = !!current && !!currentAsk && coven.standing.ok && (mine || (currentAsk.mode === 'one' && canLead)) && (currentAsk.mode === 'each' || !!mineFor(current.id) || !oneDone(current.id));

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
      </Pills>
      {!!ritual.scheduled_for && <Text style={type.caption}>{riteTime(ritual.scheduled_for)}</Text>}
      {!!ritual.intention && <Text style={type.body}>Intention: {ritual.intention}</Text>}
      <Words text={ritual.description} />

      {ritual.status === 'scheduled' && (
        <Section label="Will you be there?">
          {coven.perms.member && coven.standing.ok && <Chips label="Your answer" options={ANSWERS} value={(answers.mine ?? '') as Rsvp['response']} onChange={(v) => void answer(v)} />}
          <Text style={type.caption}>
            {[`${answers.going.length} going`, answers.maybe.length ? `${answers.maybe.length} maybe` : '', answers.notGoing.length ? `${answers.notGoing.length} can’t make it` : ''].filter(Boolean).join(' · ')}
          </Text>
          {answers.going.length > 0 && <Text style={type.caption}>Going: {answers.going.map((r) => coven.nameOf(r.user_id)).join(', ')}</Text>}
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
          {!!current.spoken_text && <Spoken text={current.spoken_text} />}
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
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  lead: { gap: 10 },
  step: { gap: 2, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  stepNow: { borderColor: colors.gold },
});
