import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, Notice, SwitchRow } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, type Member } from '../../../../../../lib/covens/model';
import type { Grant } from '../../../../../../lib/covens/programs';
import { colors, type } from '../../../../../../theme';

// Who manages initiation and training, and who sees everyone's progress, by
// name. (Positions can carry the same powers: Manage → Positions.) These are
// the coven head's to give.
export default function ManagePowers() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { loadNames, setGrants } = coven;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const ranks = coven.snapshot?.ranks ?? [];
  const founder = coven.snapshot?.coven.founder_id;

  const load = useCallback(async () => {
    if (!covenId) return;
    const list = await api.fetchMembers(covenId).catch(() => [] as Member[]);
    setMembers(list);
    await loadNames(list.map((m) => m.user_id));
  }, [covenId, loadNames]);
  useEffect(() => {
    void load();
  }, [load]);

  const has = (userId: string, power: Grant['power']) => coven.grants.some((g) => g.user_id === userId && g.power === power);
  const toggle = async (userId: string, power: Grant['power'], on: boolean) => {
    setMessage(null);
    try {
      await api.setGrant(covenId!, userId, power, on);
      setGrants(await api.fetchGrants(covenId!));
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };
  const byPosition = (flag: 'can_manage_programs' | 'can_view_progress') => ranks.filter((r) => r[flag] || r.can_manage || (flag === 'can_view_progress' && r.can_manage_programs)).map((r) => r.name);
  const sorted = (members ?? []).filter((m) => m.user_id !== founder).sort((a, b) => coven.nameOf(a.user_id).localeCompare(coven.nameOf(b.user_id)));

  return (
    <CovenScreen title="Initiation & training" need="manage" onRefresh={load}>
      <Text style={type.body}>Choose who designs the coven’s programs, chooses who takes them, assigns mentors and signs off work; and who may see everyone’s progress. You always can.</Text>
      <Text style={type.caption}>
        By position: manages programs: {byPosition('can_manage_programs').join(', ') || 'none yet'}; sees progress: {byPosition('can_view_progress').join(', ') || 'none yet'}. Change these under Positions.
      </Text>
      {message && <Notice>{message}</Notice>}
      {!members && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {members && !sorted.length && <Text style={type.caption}>No other members yet.</Text>}
      {sorted.map((m) => (
        <Card key={m.user_id}>
          <Text style={type.cardTitle}>{coven.nameOf(m.user_id)}</Text>
          <SwitchRow label="Manages programs" value={has(m.user_id, 'manage_programs')} onChange={(v) => void toggle(m.user_id, 'manage_programs', v)} />
          <SwitchRow label="Sees everyone’s progress" value={has(m.user_id, 'view_progress')} onChange={(v) => void toggle(m.user_id, 'view_progress', v)} last />
        </Card>
      ))}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
});
