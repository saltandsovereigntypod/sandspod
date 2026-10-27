import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { Sheet } from '../../../../../components/altar/Sheet';
import { Button } from '../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Pill, Pills, useReport } from '../../../../../components/covens/ui';
import { Card, Chips, MenuList, MenuRow, Notice, Section } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { actsOn, errorMessage, grantableRanks, unsignedAgreements, type Member, type Signature } from '../../../../../lib/covens/model';
import { seesRecord, type RecordSettings } from '../../../../../lib/covens/record';
import { colors, type } from '../../../../../theme';

const PAUSES = [
  { value: '1', label: '1 hour' },
  { value: '24', label: '1 day' },
  { value: '168', label: '1 week' },
] as const;
const FORMER: Record<string, string> = { left: 'Left', removed: 'Removed', banned: 'Banned from the coven' };

// Who's in the circle, highest position first. Tap someone to report or
// block them; the coven's reviewers can also change their position, its
// moderators pause, remove or ban them, and the founder can hand the coven on.
export default function Members() {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const ranks = coven.snapshot?.ranks ?? [];
  const { perms, loadNames } = coven;
  const keeper = perms.review || perms.moderate || perms.site;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [signatures, setSignatures] = useState<Signature[] | null>(null);
  const [open, setOpen] = useState<Member | null>(null);
  const [rankId, setRankId] = useState('');
  const [pause, setPause] = useState<(typeof PAUSES)[number]['value']>('24');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [recordSettings, setRecordSettings] = useState<RecordSettings | null>(null);

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const [list, sigs] = await Promise.all([keeper ? api.fetchAllMembers(covenId) : api.fetchMembers(covenId), keeper ? api.fetchCovenSignatures(covenId).catch(() => null) : Promise.resolve(null)]);
      setMembers(list);
      setSignatures(sigs);
      await loadNames(list.map((m) => m.user_id));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, keeper, loadNames]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (covenId) void api.fetchRecordSettings(covenId).then(setRecordSettings).catch(() => {});
  }, [covenId]);

  const info = coven.snapshot?.coven;
  const founder = info?.founder_id;
  const level = (m: Member) => (m.user_id === founder ? 1000 : ranks.find((r) => r.id === m.rank_id)?.level ?? 0);
  const active = (members ?? []).filter((m) => m.status === 'active').sort((a, b) => level(b) - level(a) || coven.nameOf(a.user_id).localeCompare(coven.nameOf(b.user_id)));
  const former = (members ?? []).filter((m) => m.status !== 'active');
  const here = new Set(coven.presence.map((p) => p.user_id));
  const blocked = new Set(coven.me?.blocks ?? []);
  const grantable = grantableRanks(ranks, perms);
  const needsToSign = (userId: string) => (signatures && coven.snapshot ? unsignedAgreements(coven.snapshot.documents, signatures.filter((s) => s.user_id === userId), userId).length > 0 : false);

  const show = (m: Member) => {
    setOpen(m);
    setRankId(m.rank_id ?? grantable[0]?.id ?? '');
    setMessage(null);
  };

  const act = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      setMessage(done);
      setOpen(null);
      await Promise.all([load(), coven.refresh()]);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  const confirm = (title: string, body: string, label: string, work: () => Promise<unknown>, done: string) =>
    Alert.alert(title, body, [
      { text: 'Cancel', style: 'cancel' },
      { text: label, style: 'destructive', onPress: () => void act(work, done) },
    ]);

  const keepsRecord = seesRecord({ founder: perms.founder, site: perms.site, settings: recordSettings, membership: coven.snapshot?.membership, userId: coven.userId });
  const selected = open;
  const name = selected ? coven.nameOf(selected.user_id) : '';
  const manageable = !!selected && !!info && actsOn(selected, perms, info, ranks, coven.userId) && keeper;
  const muted = !!selected?.muted_until && new Date(selected.muted_until).getTime() > Date.now();
  const isBlocked = !!selected && blocked.has(selected.user_id);

  return (
    <CovenScreen title="Members" onRefresh={load}>
      {!members && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {members && <Text style={type.caption}>{active.length} {active.length === 1 ? 'member' : 'members'} · tap someone for more</Text>}
      {members && coven.perms.member && (
        <MenuList>
          {keepsRecord && <MenuRow label="Members’ record" detail="Who has been taking part and who hasn’t" icon="community" onPress={() => router.push(covenHref(coven.slug, 'record'))} />}
          <MenuRow label="My standing" detail="Your own record, as the coven’s leaders see it" icon="journey" last onPress={() => router.push(covenHref(coven.slug, 'standing'))} />
        </MenuList>
      )}
      {members && !coven.perms.member && coven.perms.site && (
        <MenuList>
          <MenuRow label="Members’ record" detail="Who has been taking part and who hasn’t" icon="community" last onPress={() => router.push(covenHref(coven.slug, 'record'))} />
        </MenuList>
      )}
      {message && !open && <Notice>{message}</Notice>}
      {active.map((m) => {
        const me = m.user_id === coven.userId;
        const profile = coven.profileOf(m.user_id);
        const rank = ranks.find((r) => r.id === m.rank_id);
        const paused = !!m.muted_until && new Date(m.muted_until).getTime() > Date.now();
        return (
          <Pressable key={m.user_id} disabled={me} onPress={() => show(m)} accessibilityRole={me ? undefined : 'button'} accessibilityHint={me ? undefined : 'Opens what you can do'}>
            <Card>
              <View style={styles.head}>
                <Text style={type.cardTitle}>
                  {profile?.display_name ?? 'A witch'}
                  {me ? ' (you)' : ''}
                </Text>
                {!!profile?.pronouns && <Text style={type.caption}>{profile.pronouns}</Text>}
              </View>
              <Pills>
                {m.user_id === founder && <Pill label="Founder" tone="gold" />}
                {rank && <Pill label={rank.name} />}
                {here.has(m.user_id) && <Pill label="Here now" />}
                {paused && <Pill label="Paused" tone="warn" />}
                {needsToSign(m.user_id) && <Pill label="Needs to sign" tone="warn" />}
                {blocked.has(m.user_id) && <Pill label="Blocked" tone="warn" />}
              </Pills>
              {!!profile?.bio && <Text style={type.caption}>{profile.bio}</Text>}
            </Card>
          </Pressable>
        );
      })}

      {former.length > 0 && (perms.moderate || perms.site) && (
        <Section label={`Former members (${former.length})`}>
          <MenuList>
            {former.map((m, i) => (
              <MenuRow
                key={m.user_id}
                label={coven.nameOf(m.user_id)}
                detail={`${FORMER[m.status] ?? m.status}${m.status === 'banned' ? ' · tap to lift the ban' : ''}`}
                last={i === former.length - 1}
                onPress={
                  m.status === 'banned'
                    ? () =>
                        confirm(`Lift ${coven.nameOf(m.user_id)}’s ban?`, 'They may apply to the coven again.', 'Lift the ban', () => api.updateMember(covenId!, m.user_id, { status: 'removed' }), 'The ban is lifted.')
                    : undefined
                }
              />
            ))}
          </MenuList>
        </Section>
      )}

      <Sheet visible={!!selected} title={name} onClose={() => setOpen(null)}>
        {selected && (
          <View style={styles.sheet}>
            <Text style={type.caption}>
              Joined {new Date(selected.joined_at).toLocaleDateString()}
              {muted ? ` · messages paused until ${new Date(selected.muted_until!).toLocaleString()}` : ''}
            </Text>
            {keepsRecord && (
              <Button
                label="Their record"
                variant="outline"
                onPress={() => {
                  setOpen(null);
                  router.push(covenHref(coven.slug, `record/${selected.user_id}`));
                }}
              />
            )}
            {manageable && grantable.length > 0 && (perms.review || perms.site) && (
              <Section label="Position">
                <Chips label="Position" options={grantable.map((r) => ({ value: r.id, label: r.name }))} value={rankId} onChange={setRankId} />
                <Button
                  label="Change position"
                  variant="outline"
                  disabled={busy || !rankId || rankId === selected.rank_id}
                  onPress={() => void act(() => api.updateMember(covenId!, selected.user_id, { rank_id: rankId }), `${name}’s position is changed.`)}
                />
              </Section>
            )}
            {manageable && (perms.moderate || perms.site) && (
              <Section label="Keeping the gathering safe">
                <Chips label="Pause their messages for" options={PAUSES} value={pause} onChange={setPause} />
                <View style={styles.row}>
                  <Button
                    label="Pause messages"
                    variant="outline"
                    disabled={busy}
                    onPress={() => void act(() => api.updateMember(covenId!, selected.user_id, { muted_until: new Date(Date.now() + Number(pause) * 3600000).toISOString() }), `${name}’s messages are paused.`)}
                  />
                  {muted && <Button label="Lift the pause" variant="outline" disabled={busy} onPress={() => void act(() => api.updateMember(covenId!, selected.user_id, { clear_mute: true }), 'The pause is lifted.')} />}
                </View>
                <View style={styles.row}>
                  <Button
                    label="Remove from coven"
                    variant="text"
                    disabled={busy}
                    onPress={() => confirm(`Remove ${name} from the coven?`, 'They can apply again later.', 'Remove', () => api.updateMember(covenId!, selected.user_id, { status: 'removed' }), `${name} is removed.`)}
                  />
                  <Button
                    label="Ban from coven"
                    variant="text"
                    disabled={busy}
                    onPress={() => confirm(`Ban ${name} from the coven?`, 'They won’t be able to rejoin or apply again.', 'Ban', () => api.updateMember(covenId!, selected.user_id, { status: 'banned' }), `${name} is banned from the coven.`)}
                  />
                </View>
              </Section>
            )}
            {manageable && (perms.founder || perms.site) && (
              <Button
                label="Hand on leadership"
                variant="text"
                disabled={busy}
                onPress={() =>
                  confirm(`Make ${name} the coven’s leader?`, 'They become its founder, with every power over the coven. You stay a member in your current position.', 'Hand on', () => api.transferCoven(covenId!, selected.user_id), `${name} now leads the coven.`)
                }
              />
            )}
            <Section label="You">
              <View style={styles.row}>
                <Button
                  label="Report"
                  variant="outline"
                  onPress={() => {
                    setOpen(null);
                    report.open({ target_type: 'member', target_id: selected.user_id, coven_id: selected.coven_id, target_user_id: selected.user_id, label: name });
                  }}
                />
                <Button
                  label={isBlocked ? 'Unblock' : 'Block'}
                  variant="outline"
                  onPress={async () => {
                    try {
                      if (isBlocked) await api.unblock(coven.userId!, selected.user_id);
                      else await api.block(coven.userId!, selected.user_id);
                      if (coven.me) coven.setMe({ ...coven.me, blocks: isBlocked ? coven.me.blocks.filter((id) => id !== selected.user_id) : [...coven.me.blocks, selected.user_id] });
                      setOpen(null);
                    } catch (error) {
                      setMessage(errorMessage(error));
                    }
                  }}
                />
              </View>
            </Section>
            {message && <Notice>{message}</Notice>}
          </View>
        )}
      </Sheet>
      {report.sheet}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  head: { gap: 2 },
  sheet: { gap: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
