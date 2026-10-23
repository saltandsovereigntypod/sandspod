import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { CovenScreen, openOnWebsite } from '../../../../../components/covens/CovenScreen';
import { Pill, Pills, useReport } from '../../../../../components/covens/ui';
import { Button } from '../../../../../components/Button';
import { Card, Notice } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage, type Member } from '../../../../../lib/covens/model';
import { colors, type } from '../../../../../theme';

// Who's in the circle, highest position first. Press and hold someone to
// report or block them. Changing positions and removing members happen on
// the website (Manage).
export default function Members() {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const ranks = coven.snapshot?.ranks ?? [];
  const { loadNames } = coven;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const list = await api.fetchMembers(covenId);
      setMembers(list);
      await loadNames(list.map((m) => m.user_id));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, loadNames]);

  useEffect(() => {
    void load();
  }, [load]);

  const founder = coven.snapshot?.coven.founder_id;
  const level = (m: Member) => (m.user_id === founder ? 1000 : ranks.find((r) => r.id === m.rank_id)?.level ?? 0);
  const sorted = [...(members ?? [])].sort((a, b) => level(b) - level(a) || coven.nameOf(a.user_id).localeCompare(coven.nameOf(b.user_id)));
  const here = new Set(coven.presence.map((p) => p.user_id));
  const blocked = new Set(coven.me?.blocks ?? []);

  const actions = (m: Member) => {
    const name = coven.nameOf(m.user_id);
    const isBlocked = blocked.has(m.user_id);
    Alert.alert(name, undefined, [
      { text: 'Report', onPress: () => report.open({ target_type: 'member', target_id: m.user_id, coven_id: m.coven_id, target_user_id: m.user_id, label: name }) },
      {
        text: isBlocked ? `Unblock ${name}` : `Block ${name}`,
        onPress: async () => {
          try {
            if (isBlocked) await api.unblock(coven.userId!, m.user_id);
            else await api.block(coven.userId!, m.user_id);
            if (coven.me) coven.setMe({ ...coven.me, blocks: isBlocked ? coven.me.blocks.filter((id) => id !== m.user_id) : [...coven.me.blocks, m.user_id] });
          } catch (error) {
            setMessage(errorMessage(error));
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <CovenScreen title="Members" onRefresh={load}>
      {!members && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {members && <Text style={type.caption}>{members.length} {members.length === 1 ? 'member' : 'members'}</Text>}
      {sorted.map((m) => {
        const me = m.user_id === coven.userId;
        const profile = coven.profileOf(m.user_id);
        const rank = ranks.find((r) => r.id === m.rank_id);
        return (
          <Pressable
            key={m.user_id}
            onLongPress={me ? undefined : () => actions(m)}
            accessibilityRole={me ? undefined : 'button'}
            accessibilityHint={me ? undefined : 'Press and hold to report or block'}
            accessibilityActions={me ? undefined : [{ name: 'longpress', label: 'Report or block' }]}
            onAccessibilityAction={me ? undefined : () => actions(m)}
          >
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
                {blocked.has(m.user_id) && <Pill label="Blocked" tone="warn" />}
              </Pills>
              {!!profile?.bio && <Text style={type.caption}>{profile.bio}</Text>}
            </Card>
          </Pressable>
        );
      })}
      {(coven.perms.manage || coven.perms.moderate || coven.perms.site) && (
        <Button label="Manage members on the website" variant="outline" onPress={() => openOnWebsite(coven.slug, 'manage')} />
      )}
      {message && <Notice>{message}</Notice>}
      {report.sheet}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  head: { gap: 2 },
});
