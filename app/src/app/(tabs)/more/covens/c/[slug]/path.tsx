import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Words } from '../../../../../../components/covens/ui';
import { Card, Chips, Field, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { advancementOptions, errorMessage, rankPowers, relativeTime, type Advancement } from '../../../../../../lib/covens/model';
import { type } from '../../../../../../theme';

const STATUS: Record<string, string> = { approved: 'approved', declined: 'declined', withdrawn: 'withdrawn' };

// My path: your place in the coven, your agreements, asking to rise to a
// higher position, and leaving.
export default function MyPath() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const userId = coven.userId;
  const [requests, setRequests] = useState<Advancement[] | null>(null);
  const [rankId, setRankId] = useState<string>('');
  const [statement, setStatement] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!covenId || !userId) return;
    setRequests(await api.fetchMyAdvancements(covenId, userId).catch(() => []));
  }, [covenId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const { perms, snapshot } = coven;
  const ranks = snapshot?.ranks ?? [];
  const options = advancementOptions(ranks, perms);
  const chosen = options.find((r) => r.id === rankId) ?? options[0];
  const pending = requests?.find((a) => a.status === 'pending');
  const history = (requests ?? []).filter((a) => a.status !== 'pending').slice(0, 5);
  const rankName = (id: string) => ranks.find((r) => r.id === id)?.name ?? 'a position';
  const powers = rankPowers(perms.rank);

  const run = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      setMessage(done);
      setStatement('');
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const leave = () =>
    Alert.alert(`Leave ${snapshot?.coven.name ?? 'the coven'}?`, 'You’ll lose your position. You can apply again later.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.leave(covenId!);
            await coven.refresh();
            router.replace(covenHref(coven.slug));
          } catch (error) {
            setMessage(errorMessage(error));
          }
        },
      },
    ]);

  return (
    <CovenScreen title="My path" onRefresh={load}>
      {perms.member && snapshot?.membership && (
        <>
          <Card>
            <Text style={type.cardTitle}>{perms.founder ? `${perms.rank?.name ?? 'Leader'} · founder` : perms.rank?.name ?? 'Member'}</Text>
            {!!perms.rank?.description && <Words text={perms.rank.description} />}
            {powers.length > 0 && <Text style={type.caption}>Your position {powers.join(', ')}.</Text>}
            <Text style={type.caption}>
              Member since {new Date(snapshot.membership.joined_at).toLocaleDateString()}
              {perms.muted && snapshot.membership.muted_until ? ` · messages paused until ${new Date(snapshot.membership.muted_until).toLocaleString()}` : ''}
            </Text>
          </Card>

          <Section label="Agreements">
            {coven.unsigned.length ? (
              <>
                <Text style={type.body}>The coven’s agreements have changed. Sign them to keep taking part.</Text>
                <Button label="Read and sign" onPress={() => router.push(covenHref(coven.slug, 'join'))} />
              </>
            ) : (
              <Text style={type.caption}>You’ve signed everything the coven asks.</Text>
            )}
          </Section>

          <Section label="Rise to a higher position">
            {pending ? (
              <Card>
                <Text style={type.body}>You’ve asked to become {rankName(pending.rank_id)}. The coven’s reviewers will decide.</Text>
                <Words text={pending.statement} />
                <Button label="Withdraw this request" variant="outline" onPress={() => void run(() => api.withdrawAdvancement(pending.id), 'Withdrawn.')} disabled={busy} />
              </Card>
            ) : !options.length ? (
              <Text style={type.caption}>No higher positions are open to apply for right now.</Text>
            ) : (
              <Card>
                <Chips label="Position" options={options.map((r) => ({ value: r.id, label: r.name }))} value={chosen?.id ?? ''} onChange={setRankId} />
                {!!(chosen?.description || chosen?.requirements) && <Text style={type.caption}>{[chosen?.description, chosen?.requirements ? `Asks: ${chosen.requirements}` : ''].filter(Boolean).join(' ')}</Text>}
                <Field label="Why you’re ready, and how you’ve met what it asks" value={statement} onChangeText={setStatement} multiline maxLength={4000} />
                <Button
                  label={busy ? 'Sending…' : 'Ask to advance'}
                  onPress={() => (statement.trim() ? void run(() => api.requestAdvancement(covenId!, chosen!.id, statement), 'Sent to the coven’s reviewers.') : setMessage('Say why you’re ready.'))}
                  disabled={busy || !coven.standing.ok}
                />
                {!coven.standing.ok && <Text style={type.caption}>{coven.standing.reasons.join(' ')}</Text>}
              </Card>
            )}
            {history.length > 0 && (
              <MenuList>
                {history.map((a, i) => (
                  <MenuRow key={a.id} label={`${rankName(a.rank_id)} · ${STATUS[a.status] ?? a.status}`} detail={[a.reviewer_note, relativeTime(a.decided_at ?? a.created_at)].filter(Boolean).join(' · ')} last={i === history.length - 1} />
                ))}
              </MenuList>
            )}
          </Section>
          {message && <Notice>{message}</Notice>}
          {!perms.founder && (
            <Section label="Leaving">
              <Button label={`Leave ${snapshot.coven.name}`} variant="outline" onPress={leave} />
            </Section>
          )}
        </>
      )}
      {!perms.member && <Text style={type.body}>This is for the coven’s members.</Text>}
    </CovenScreen>
  );
}
