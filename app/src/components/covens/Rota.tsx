// The duties rota in the coven's pages: who has each duty at a gathering
// (on its page, with asking someone to swap, answering a swap, and a leader's
// reassigning), and "Your duty for the next gathering" on the coven's home.
// The working out is lib/covens/rota.ts; the screen that sets the duties is
// app/(tabs)/coven/c/[slug]/rota.tsx.

import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, Chips, Field, Notice, Section } from '../more/ui';
import { covenHref } from './CovenScreen';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import { errorMessage, riteTime } from '../../lib/covens/model';
import { answerSwap, askSwap, fetchActiveMembers, fetchRota, type RotaData } from '../../lib/covens/sharedApi';
import { useCachedQuery } from '../../lib/more/useCachedQuery';
import { assignRota, dutiesAt, dutyNames, nextDutiesFor, swapsAskingMe, swapStillFits, tradeOptions, type DutyAssignment, type RotaSwap } from '../../lib/covens/rota';
import { type } from '../../theme';

/** The coven's rota, worked out: duties, who has each at each gathering, swaps. */
export function useCovenRota() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id ?? null;
  const { loadNames } = coven;
  const [data, setData] = useState<(RotaData & { covenId: string; members: string[] }) | null>(null);
  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const [rota, members] = await Promise.all([fetchRota([covenId]), api.fetchMembers(covenId).catch(() => [])]);
      const ids = members.map((m) => m.user_id);
      setData({ ...rota, covenId, members: ids });
      void loadNames(ids);
    } catch {
      setData({ duties: [], swaps: [], gatherings: [], away: {}, ready: false, covenId, members: [] });
    }
  }, [covenId, loadNames]);
  useEffect(() => {
    void load();
  }, [load, coven.rituals]);
  const mine = data && data.covenId === covenId ? data : null;
  const assignments = useMemo<DutyAssignment[]>(
    () => (mine ? assignRota({ duties: mine.duties, gatherings: mine.gatherings, members: mine.members, away: mine.away, swaps: mine.swaps }) : []),
    [mine],
  );
  return { data: mine, assignments, reload: load };
}

/** "Your duty for the next gathering", on the coven's home (nothing when you have none). */
export function MyDutyCard() {
  const coven = useCoven();
  const { data, assignments } = useCovenRota();
  if (!data?.ready || !coven.userId || !data.duties.length) return null;
  const next = nextDutiesFor(assignments, data.gatherings, coven.userId, new Date());
  const asking = swapsAskingMe(data.swaps, coven.userId).filter((s) => swapStillFits(s, assignments, data.members));
  if (!next && !asking.length) return null;
  const title = next ? coven.rituals.find((r) => r.id === next.gathering.id)?.title ?? 'The next gathering' : '';
  return (
    <Card>
      <Text style={type.eyebrow}>Your duty</Text>
      {next && (
        <>
          <Text style={type.cardTitle}>{dutyNames(next.dutyIds, data.duties)}</Text>
          <Text style={type.caption}>{[title, riteTime(next.gathering.scheduled_for)].filter(Boolean).join(' · ')}</Text>
          <Button label="Open the gathering" variant="outline" onPress={() => router.push(covenHref(coven.slug, `ritual/${next.gathering.id}`))} />
        </>
      )}
      {asking.length > 0 && (
        <>
          <Text style={type.body}>{`${asking.length === 1 ? 'Someone asks' : `${asking.length} ask`} you to take a duty.`}</Text>
          <Button label="See the rota" variant="text" onPress={() => router.push(covenHref(coven.slug, 'rota'))} />
        </>
      )}
    </Card>
  );
}

/** One swap waiting for your answer (or, if you asked, to withdraw). */
export function SwapRow({ swap, duties, onDone }: { swap: RotaSwap; duties: RotaData['duties']; onDone: () => void }) {
  const coven = useCoven();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dutyName = duties.find((d) => d.id === swap.duty_id)?.name ?? 'a duty';
  const trade = swap.exchange_duty_id ? duties.find((d) => d.id === swap.exchange_duty_id)?.name : null;
  const ritual = coven.rituals.find((r) => r.id === swap.ritual_id);
  const answer = async (status: 'accepted' | 'declined' | 'withdrawn') => {
    setBusy(true);
    try {
      await answerSwap(swap.id, status);
      onDone();
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  const toMe = swap.to_user === coven.userId;
  return (
    <Card>
      <Text style={type.body}>
        {toMe
          ? `${coven.nameOf(swap.from_user)} asks you to take “${dutyName}”${trade ? ` and to take “${trade}” from you in return` : ''}.`
          : `You asked ${coven.nameOf(swap.to_user)} to take “${dutyName}”${trade ? ` for “${trade}”` : ''}.`}
      </Text>
      {!!ritual && <Text style={type.caption}>{[ritual.title, riteTime(ritual.scheduled_for)].filter(Boolean).join(' · ')}</Text>}
      {!!swap.note && <Text style={type.caption}>“{swap.note}”</Text>}
      <View style={styles.row}>
        {toMe ? (
          <>
            <Button label="Accept" disabled={busy} onPress={() => void answer('accepted')} />
            <Button label="Decline" variant="outline" disabled={busy} onPress={() => void answer('declined')} />
          </>
        ) : (
          <Button label="Withdraw" variant="text" disabled={busy} onPress={() => void answer('withdrawn')} />
        )}
      </View>
      {message && <Notice>{message}</Notice>}
    </Card>
  );
}

/** The duties at one gathering, on its page. */
export function GatheringDuties({ ritualId, open }: { ritualId: string; open: boolean }) {
  const coven = useCoven();
  const { data, assignments, reload } = useCovenRota();
  const [asking, setAsking] = useState<{ dutyId: string; to: string; trade: string; note: string; reassign: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!data?.ready || !data.duties.length) return null;
  const here = dutiesAt(assignments, ritualId);
  if (!here.length) return null;
  const leads = coven.perms.lead || coven.perms.manage || coven.perms.founder;
  const may = coven.perms.member && coven.standing.ok;
  const pending = data.swaps.filter((s) => s.ritual_id === ritualId && s.status === 'pending' && (s.to_user === coven.userId || s.from_user === coven.userId));
  const nameOfDuty = (id: string) => data.duties.find((d) => d.id === id)?.name ?? '';

  const send = async () => {
    if (!asking || !coven.userId || !asking.to) return;
    const a = here.find((x) => x.dutyId === asking.dutyId);
    if (!a?.userId) return;
    setBusy(true);
    try {
      await askSwap(
        { coven_id: data.covenId, ritual_id: ritualId, duty_id: asking.dutyId, from_user: a.userId, to_user: asking.to, exchange_duty_id: asking.trade || null, note: asking.note.trim().slice(0, 280) || null },
        asking.reassign,
      );
      setAsking(null);
      setMessage(asking.reassign ? 'Reassigned.' : `Asked ${coven.nameOf(asking.to)}. The duty stays yours until they accept.`);
      await reload();
    } catch (e) {
      setMessage(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section label="Duties">
      {here.map((a) => {
        const mine = a.userId === coven.userId;
        return (
          <View key={a.dutyId} style={styles.duty}>
            <Text style={type.body}>
              {nameOfDuty(a.dutyId)}: {a.userId ? (mine ? 'you' : coven.nameOf(a.userId)) : 'nobody free'}
            </Text>
            {(a.covered || a.swapped) && (
              <Text style={type.caption}>{a.swapped ? 'Swapped' : `Covering for ${a.turnOf === coven.userId ? 'you' : coven.nameOf(a.turnOf)}`}</Text>
            )}
            {open && may && !asking && (mine || leads) && (
              <Button
                label={mine ? 'Ask someone to swap' : 'Reassign'}
                variant="text"
                onPress={() => {
                  setMessage(null);
                  setAsking({ dutyId: a.dutyId, to: '', trade: '', note: '', reassign: !mine });
                }}
              />
            )}
          </View>
        );
      })}
      {asking && (
        <Card>
          <Text style={type.cardTitle}>{asking.reassign ? `Reassign “${nameOfDuty(asking.dutyId)}”` : `Swap “${nameOfDuty(asking.dutyId)}”`}</Text>
          <Chips
            label="Who takes it"
            options={data.members.filter((u) => u !== here.find((x) => x.dutyId === asking.dutyId)?.userId).map((u) => ({ value: u, label: u === coven.userId ? 'Me' : coven.nameOf(u) }))}
            value={asking.to}
            onChange={(to) => setAsking({ ...asking, to, trade: '' })}
          />
          {!asking.reassign && !!asking.to && tradeOptions(here, ritualId, asking.to).length > 0 && (
            <Chips
              label="In return"
              options={[{ value: '', label: 'Nothing in return' }, ...tradeOptions(here, ritualId, asking.to).map((id) => ({ value: id, label: `I take “${nameOfDuty(id)}”` }))]}
              value={asking.trade}
              onChange={(trade) => setAsking({ ...asking, trade })}
            />
          )}
          {!asking.reassign && <Field label="A note (optional)" value={asking.note} onChangeText={(note) => setAsking({ ...asking, note })} maxLength={280} />}
          <View style={styles.row}>
            <Button label={busy ? 'Sending…' : asking.reassign ? 'Reassign' : 'Ask'} disabled={busy || !asking.to} onPress={() => void send()} />
            <Button label="Cancel" variant="text" onPress={() => setAsking(null)} />
          </View>
        </Card>
      )}
      {pending.map((s) => (
        <SwapRow key={s.id} swap={s} duties={data.duties} onDone={() => void reload()} />
      ))}
      {message && <Notice>{message}</Notice>}
      <Button label="The rota" variant="text" onPress={() => router.push(covenHref(coven.slug, 'rota'))} />
    </Section>
  );
}

export type DutyTodayRow = { key: string; title: string; detail: string; covenSlug: string; covenName: string; ritualId: string | null };

/** Your duties at your covens' next gatherings (a fortnight ahead), and swaps asking you, for Today (cached). */
export function useDutiesToday(userId: string | null, covens: { id: string; slug: string; name: string }[], rituals: { id: string; title: string }[]): DutyTodayRow[] {
  const ids = covens.map((c) => c.id).sort();
  const { data } = useCachedQuery(userId && ids.length ? `coven-rota-${userId}-${ids.join(',')}` : null, async () => {
    const rota = await fetchRota(ids);
    const members = rota.ready && rota.duties.length ? await fetchActiveMembers(ids) : [];
    return { rota, members };
  });
  return useMemo(() => {
    if (!userId || !data?.rota.ready || !data.rota.duties.length) return [];
    const now = new Date();
    const rows: DutyTodayRow[] = [];
    for (const c of covens) {
      const duties = data.rota.duties.filter((d) => d.coven_id === c.id);
      if (!duties.length) continue;
      const gatherings = data.rota.gatherings.filter((g) => g.coven_id === c.id);
      const members = data.members.filter((m) => m.coven_id === c.id).map((m) => m.user_id);
      const swaps = data.rota.swaps.filter((s) => s.coven_id === c.id);
      const assignments = assignRota({ duties, gatherings, members, away: data.rota.away, swaps });
      const next = nextDutiesFor(assignments, gatherings, userId, now);
      if (next && Date.parse(next.gathering.scheduled_for ?? '') - now.getTime() < 14 * 86400_000) {
        const title = rituals.find((r) => r.id === next.gathering.id)?.title ?? 'The next gathering';
        rows.push({ key: `duty-${c.id}`, title: `Your duty: ${dutyNames(next.dutyIds, duties)}`, detail: `${title} · ${riteTime(next.gathering.scheduled_for)}`, covenSlug: c.slug, covenName: c.name, ritualId: next.gathering.id });
      }
      const asking = swapsAskingMe(swaps, userId).filter((s) => swapStillFits(s, assignments, members));
      if (asking.length) {
        rows.push({ key: `swap-${c.id}`, title: asking.length === 1 ? 'Asked to take a duty' : `Asked to take ${asking.length} duties`, detail: 'Accept or decline on the rota', covenSlug: c.slug, covenName: c.name, ritualId: null });
      }
    }
    return rows;
  }, [userId, data, covens, rituals]);
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  duty: { gap: 2 },
});
