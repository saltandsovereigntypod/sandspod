// Waiting lists for full positions: your place in line (My standing), a
// position's list for its leaders (Manage → Positions → the position), and
// the card on Review when a place frees ("A place is free in Initiate. Rowan
// is next in line." Promote, Choose someone else, Not now). The logic is
// lib/covens/queue.ts; the website's is covens/coven/queue.js.

import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card, CheckRow, Field, MenuList, MenuRow, Notice, Section } from '../more/ui';
import * as api from '../../lib/covens/api';
import { useCoven } from '../../lib/covens/CovenContext';
import { errorMessage, type Member, type Rank } from '../../lib/covens/model';
import { entryLine, eventLine, moved, myPlaceLine, othersInLine, proposalLine, proposals, type QueueEntry, type QueueList } from '../../lib/covens/queue';
import { type } from '../../theme';

/** Ask before something that can't be undone (web: the browser's confirm). */
function confirmThen(title: string, words: string, yes: string, go: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title} ${words}`)) go();
    return;
  }
  Alert.alert(title, words, [
    { text: 'Not now', style: 'cancel' },
    { text: yes, onPress: go },
  ]);
}

/** Members who could be given a position (or added to its list): active, below it, never the founder or you. */
export function candidatesFor(rank: Rank, members: Member[], ranks: Rank[], founderId: string | null | undefined, me: string | null): Member[] {
  const level = (id: string | null) => ranks.find((r) => r.id === id)?.level ?? 0;
  return members.filter((m) => m.status === 'active' && m.user_id !== founderId && m.user_id !== me && level(m.rank_id) < rank.level);
}

/** A short search over members, for choosing someone. */
function MemberPicker({ people, onPick, label }: { people: Member[]; onPick: (m: Member) => void; label: string }) {
  const coven = useCoven();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const shown = people.filter((m) => !q || coven.nameOf(m.user_id).toLowerCase().includes(q)).slice(0, 8);
  return (
    <View style={styles.gap}>
      <Field label={label} value={query} onChangeText={setQuery} maxLength={60} />
      {shown.length ? (
        <MenuList>
          {shown.map((m, i) => (
            <MenuRow key={m.user_id} label={coven.nameOf(m.user_id)} last={i === shown.length - 1} onPress={() => onPick(m)} />
          ))}
        </MenuList>
      ) : (
        <Text style={type.caption}>No one else could hold it just now.</Text>
      )}
    </View>
  );
}

// ─── The member: "You're 2nd in line for Initiate" ─────────────────────

export function MyQueuePlaces() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [mine, setMine] = useState<QueueEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (covenId) setMine(await api.fetchMyQueue(covenId));
  }, [covenId]);
  useEffect(() => {
    if (!covenId || !coven.perms.member) return;
    let off = false;
    api.fetchMyQueue(covenId).then((list) => !off && setMine(list));
    return () => {
      off = true;
    };
  }, [covenId, coven.perms.member]);
  if (!mine.length && !message) return null;
  const rankName = (id: string) => coven.snapshot?.ranks.find((r) => r.id === id)?.name ?? 'the position';
  const withdraw = (e: QueueEntry) =>
    confirmThen('Leave the waiting list?', `You’ll lose your place in line for ${rankName(e.rank_id)}. To come back, you’d need to qualify or be added again.`, 'Leave the list', async () => {
      setBusy(true);
      setMessage(null);
      try {
        await api.withdrawFromQueue(covenId!, e.id);
        await load();
        setMessage('You’ve left the waiting list.');
      } catch (error) {
        setMessage(errorMessage(error));
      }
      setBusy(false);
    });
  return (
    <Section label="Waiting lists">
      {mine.map((e) => (
        <Card key={e.id} tone={e.status === 'proposed' ? 'gold' : undefined}>
          <Text style={type.cardTitle}>{myPlaceLine(e, rankName(e.rank_id))}</Text>
          <Text style={type.caption}>{entryLine(e)}</Text>
          <Button label="Leave the waiting list" variant="text" onPress={() => withdraw(e)} disabled={busy} />
        </Card>
      ))}
      {message && <Notice>{message}</Notice>}
    </Section>
  );
}

// ─── The leaders: a position's list ────────────────────────────────────

export function QueuePanel({ rank, members, onChanged }: { rank: Rank; members: Member[] | null; onChanged?: () => void }) {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const [list, setList] = useState<QueueList | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);
  const [history, setHistory] = useState(false);
  const load = useCallback(async () => setList(await api.fetchQueueList(rank.id).catch(() => null)), [rank.id]);
  useEffect(() => {
    let off = false;
    api.fetchQueueList(rank.id).then(
      (next) => !off && setList(next),
      () => !off && setList(null),
    );
    return () => {
      off = true;
    };
  }, [rank.id]);
  if (list === undefined || list === null || rank.is_default) return null;

  const act = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await load();
      onChanged?.();
      setMessage(done);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  const ids = list.entries.map((e) => e.id);
  const onList = new Set(list.entries.map((e) => e.user_id));
  const people = candidatesFor(rank, members ?? [], coven.snapshot?.ranks ?? [], coven.snapshot?.coven.founder_id, coven.userId).filter((m) => !onList.has(m.user_id));

  return (
    <Section label="Waiting list">
      <Text style={type.caption}>
        {list.entries.length
          ? `${list.entries.length} in line, in order. When a place frees, the first is proposed to you on Review; nobody is moved until you confirm.`
          : 'No one is waiting. When the position is full, those who finish a program that leads to it, and requests you approve onto the list, wait here in order.'}
      </Text>
      {list.entries.map((e, i) => (
        <Card key={e.id} tone={e.status === 'proposed' ? 'gold' : undefined}>
          <Text style={type.cardTitle}>
            {i + 1}. {e.name}
          </Text>
          <Text style={type.caption}>{entryLine(e)}</Text>
          {!!e.note && <Text style={type.caption}>“{e.note}”</Text>}
          <View style={styles.row}>
            <Button label="Move up" variant="outline" onPress={() => void act(() => api.reorderQueue(rank.id, moved(ids, e.id, -1)), `${e.name} moved up.`)} disabled={busy || i === 0} />
            <Button label="Move down" variant="outline" onPress={() => void act(() => api.reorderQueue(rank.id, moved(ids, e.id, 1)), `${e.name} moved down.`)} disabled={busy || i === ids.length - 1} />
            <Button label="Take off the list" variant="text" onPress={() => (setRemoving(removing === e.id ? null : e.id), setReason(''))} disabled={busy} />
          </View>
          {removing === e.id && (
            <View style={styles.gap}>
              <Field label="Why (kept with the list)" value={reason} onChangeText={setReason} maxLength={500} />
              <Button
                label={`Take ${e.name} off`}
                onPress={() =>
                  reason.trim() ? void act(() => api.removeFromQueue(covenId!, e.id, reason).then(() => setRemoving(null)), `${e.name} is off the list.`) : setMessage('Say why they’re taken off the list.')
                }
                disabled={busy}
              />
            </View>
          )}
        </Card>
      ))}
      {adding ? (
        <MemberPicker
          label={`Find someone to add to the list for ${rank.name}`}
          people={people}
          onPick={(m) => void act(() => api.addToQueue(covenId!, rank.id, m.user_id, '').then(() => setAdding(false)), `${coven.nameOf(m.user_id)} is on the list.`)}
        />
      ) : (
        <Button label="Add someone to the list" variant="outline" onPress={() => setAdding(true)} disabled={busy} />
      )}
      {message && <Notice>{message}</Notice>}
      {list.history.length > 0 && (
        <>
          <Button label={history ? 'Hide what happened' : 'What happened'} variant="text" onPress={() => setHistory(!history)} />
          {history && (
            <MenuList>
              {list.history.map((h, i) => (
                <MenuRow key={`${h.at}-${i}`} label={eventLine(h)} detail={new Date(h.at).toLocaleString(undefined, { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })} last={i === list.history.length - 1} />
              ))}
            </MenuList>
          )}
        </>
      )}
    </Section>
  );
}

// ─── Review: a place is free ───────────────────────────────────────────

export function useQueues() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const manage = coven.perms.manage || coven.perms.site;
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const load = useCallback(async () => {
    if (covenId && manage) setEntries(await api.fetchQueues(covenId));
  }, [covenId, manage]);
  useEffect(() => {
    if (!covenId || !manage) return;
    let off = false;
    api.fetchQueues(covenId).then((list) => !off && setEntries(list));
    return () => {
      off = true;
    };
  }, [covenId, manage]);
  return { entries, reload: load };
}

export function ProposalCards({ entries, members, onChanged }: { entries: QueueEntry[]; members: Member[] | null; onChanged: () => void }) {
  const list = proposals(entries);
  if (!list.length) return null;
  return (
    <Section label="Places to fill">
      {list.map((p) => (
        <ProposalCard key={p.id} proposal={p} entries={entries} members={members} onChanged={onChanged} />
      ))}
    </Section>
  );
}

function ProposalCard({ proposal, entries, members, onChanged }: { proposal: QueueEntry; entries: QueueEntry[]; members: Member[] | null; onChanged: () => void }) {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const rank = coven.snapshot?.ranks.find((r) => r.id === proposal.rank_id);
  const [choosing, setChoosing] = useState(false);
  const [passOver, setPassOver] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!rank) return null;
  const act = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      onChanged();
    } catch (error) {
      setMessage(errorMessage(error));
      setBusy(false);
    }
  };
  const fill = (userId: string, name: string) => {
    if (passOver && !note.trim()) return setMessage(`Say why ${proposal.name} is taken off the list.`);
    confirmThen(`Give ${rank.name} to ${name}?`, passOver ? `${proposal.name} comes off the waiting list.` : `${proposal.name} keeps their place in line.`, 'Give it', () => void act(() => api.fillPosition(covenId!, rank.id, userId, note, passOver)));
  };
  const inLine = othersInLine(entries, proposal);
  const onList = new Set(entries.filter((e) => e.rank_id === rank.id).map((e) => e.user_id));
  const others = candidatesFor(rank, members ?? [], coven.snapshot?.ranks ?? [], coven.snapshot?.coven.founder_id, coven.userId).filter((m) => !onList.has(m.user_id));
  const held = proposal.held ?? 0;
  return (
    <Card tone={proposal.deferred_at ? undefined : 'gold'}>
      <Text style={type.cardTitle}>{proposalLine(rank.name, proposal.name)}</Text>
      <Text style={type.caption}>
        {entryLine(proposal)}
        {rank.seat_limit != null ? ` · ${held} of ${rank.seat_limit} places held` : ''}
        {proposal.deferred_at ? ' · you chose "Not now"' : ''}
      </Text>
      <View style={styles.row}>
        <Button label={`Promote ${proposal.name}`} onPress={() => confirmThen(`Make ${proposal.name} ${rank.name}?`, 'They’re told on their phone.', 'Promote', () => void act(() => api.fillPosition(covenId!, rank.id, proposal.user_id, note)))} disabled={busy} />
        <Button label="Choose someone else" variant="outline" onPress={() => setChoosing(!choosing)} disabled={busy} />
        {!proposal.deferred_at && <Button label="Not now" variant="text" onPress={() => void act(() => api.holdProposal(proposal.id))} disabled={busy} />}
      </View>
      {choosing && (
        <View style={styles.gap}>
          <CheckRow label={`Take ${proposal.name} off the list`} value={passOver} onChange={setPassOver} />
          <Field label={passOver ? 'Why (kept with the list)' : 'A note for the list (optional)'} value={note} onChangeText={setNote} maxLength={500} />
          {inLine.length > 0 && (
            <MenuList>
              {inLine.map((e, i) => (
                <MenuRow key={e.id} label={`${e.place ?? i + 2}. ${e.name}`} detail={entryLine(e)} last={i === inLine.length - 1} onPress={() => fill(e.user_id, e.name)} />
              ))}
            </MenuList>
          )}
          <MemberPicker label="Or find any member who could hold it" people={others} onPick={(m) => fill(m.user_id, coven.nameOf(m.user_id))} />
        </View>
      )}
      {message && <Notice>{message}</Notice>}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gap: { gap: 8 },
});
