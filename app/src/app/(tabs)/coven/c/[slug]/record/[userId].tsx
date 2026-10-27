import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { RecordSections } from '../../../../../../components/covens/Record';
import { Pill, Pills } from '../../../../../../components/covens/ui';
import { Card, Chips, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { openDirect } from '../../../../../../lib/covens/chat';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { actsOn, errorMessage, grantableRanks, type Member } from '../../../../../../lib/covens/model';
import { agoLabel, NOTE_MAX, REASON_MAX, recordFlags, type MemberRecord } from '../../../../../../lib/covens/record';
import { colors, type } from '../../../../../../theme';

const PAUSES = [
  { value: '24', label: '1 day' },
  { value: '168', label: '1 week' },
  { value: '720', label: '30 days' },
] as const;

// One member's record (lib/covens/record.ts): every ritual since they joined
// and whether they were there, their studies, their mentoring, what else
// they've done, the leaders' private notes, and what can be done: message
// them, change their position, pause their messages, or remove them with a
// reason kept here. As on the website (covens/coven/record.js).
export default function MemberRecordScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const info = coven.snapshot?.coven;
  const ranks = coven.snapshot?.ranks ?? [];
  const { perms, loadNames } = coven;
  const [record, setRecord] = useState<MemberRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [rankId, setRankId] = useState('');
  const [pause, setPause] = useState<(typeof PAUSES)[number]['value']>('168');

  const apply = useCallback(
    (next: MemberRecord) => {
      setRecord(next);
      setRankId((current) => current || next.rank_id || '');
      void loadNames([next.user_id, next.mentor?.mentor_id, ...next.checkins.map((c) => c.mentor_id), ...next.mentees.map((m) => m.user_id), ...next.notes.map((n) => n.author_id), ...next.removals.map((r) => r.removed_by)]);
    },
    [loadNames],
  );
  const load = useCallback(async () => {
    if (!covenId || !userId) return;
    try {
      apply(await api.fetchMemberRecord(covenId, String(userId)));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, userId, apply]);

  useEffect(() => {
    if (!covenId || !userId) return;
    let off = false;
    api.fetchMemberRecord(covenId, String(userId)).then(
      (next) => !off && apply(next),
      (error) => !off && setMessage(errorMessage(error)),
    );
    return () => {
      off = true;
    };
  }, [covenId, userId, apply]);

  const act = async (work: () => Promise<unknown>, done?: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await load();
      if (done) setMessage(done);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const name = coven.nameOf(String(userId));
  const member: Member | null = record ? { coven_id: covenId ?? '', user_id: record.user_id, rank_id: record.rank_id, status: record.status, muted_until: record.muted_until, joined_at: record.joined_at } as Member : null;
  const manageable = !!member && !!info && record?.status === 'active' && actsOn(member, perms, info, ranks, coven.userId);
  const grantable = grantableRanks(ranks, perms);
  const now = record ? Date.parse(record.now) : 0;
  const muted = !!record?.muted_until && new Date(record.muted_until).getTime() > now;
  const flags = record ? recordFlags(record, now) : [];
  const rank = ranks.find((r) => r.id === record?.rank_id);

  const remove = (status: 'removed' | 'banned') =>
    Alert.alert(
      status === 'banned' ? `Ban ${name} from the coven?` : `Remove ${name} from the coven?`,
      `${status === 'banned' ? 'They won’t be able to rejoin or apply again.' : 'They can apply again later.'}${reason.trim() ? ' Your reason is kept with their record.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: status === 'banned' ? 'Ban' : 'Remove', style: 'destructive', onPress: () => void act(() => api.removeMember(covenId!, record!.user_id, status, reason), status === 'banned' ? `${name} is banned from the coven.` : `${name} is removed.`) },
      ],
    );

  return (
    <CovenScreen title={record ? name : 'Member’s record'} onRefresh={load}>
      {!record && !message && <ActivityIndicator color={colors.gold} />}
      {record && (
        <>
          <Pills>
            {record.user_id === info?.founder_id && <Pill label="Founder" tone="gold" />}
            {!!rank && <Pill label={rank.name} />}
            {record.status !== 'active' && <Pill label={record.status === 'left' ? 'Left' : record.status === 'banned' ? 'Banned' : 'Removed'} tone="warn" />}
            {muted && <Pill label="Messages paused" tone="warn" />}
          </Pills>
          <Text style={type.caption}>Joined {new Date(record.joined_at).toLocaleDateString()}</Text>
          {flags.length > 0 && (
            <Card>
              {flags.map((f) => (
                <Text key={f} style={type.body}>
                  {f}
                </Text>
              ))}
            </Card>
          )}

          <RecordSections
            record={record}
            nameOf={coven.nameOf}
            busy={busy}
            userId={coven.userId}
            onMark={record.marks_attendance ? (ritualId, present) => void act(() => api.markAttendance(ritualId, record.user_id, present)) : undefined}
            onExcuse={record.marks_attendance ? (ritualId, excused) => void act(() => api.excuseAbsence(ritualId, record.user_id, excused)) : undefined}
            onRemoveCheckin={(id) => void act(() => api.removeCheckin(id))}
          />

          {record.keeper && !record.own && (
            <Section label="Leaders’ notes">
              <Text style={type.caption}>Private: only those who keep the record read these. {name} never sees them.</Text>
              {record.notes.map((n) => (
                <Card key={n.id}>
                  <Text style={type.body}>{n.body}</Text>
                  <Text style={type.caption}>
                    {coven.nameOf(n.author_id)} · {agoLabel(n.created_at, now)}
                  </Text>
                  {(n.author_id === coven.userId || perms.founder || perms.site) && <Button label="Remove the note" variant="text" disabled={busy} onPress={() => void act(() => api.removeMemberNote(n.id))} />}
                </Card>
              ))}
              <Field label="Add a note" value={note} onChangeText={setNote} multiline maxLength={NOTE_MAX} />
              <Button
                label="Save the note"
                variant="outline"
                disabled={busy || !note.trim()}
                onPress={() =>
                  void act(async () => {
                    await api.addMemberNote(covenId!, record.user_id, note);
                    setNote('');
                  })
                }
              />
            </Section>
          )}

          {record.removals.length > 0 && (
            <Section label="Removed before">
              {record.removals.map((r) => (
                <Text key={r.created_at} style={type.caption}>
                  {new Date(r.created_at).toLocaleDateString()}: {r.status === 'banned' ? 'banned' : 'removed'} by {coven.nameOf(r.removed_by)}
                  {r.reason ? `. “${r.reason}”` : ''}
                </Text>
              ))}
            </Section>
          )}

          {!record.own && record.status === 'active' && (
            <Section label="What you can do">
              <Button
                label={`Message ${name}`}
                variant="outline"
                disabled={busy || !coven.standing.ok}
                onPress={() =>
                  void act(async () => {
                    const conversation = await openDirect(covenId!, record.user_id);
                    router.push(covenHref(coven.slug, `chat/${conversation.id}`));
                  })
                }
              />
              {manageable && grantable.length > 0 && (perms.review || perms.site) && (
                <View style={styles.block}>
                  <Chips label="Position" options={grantable.map((r) => ({ value: r.id, label: r.name }))} value={rankId} onChange={setRankId} />
                  <Button label="Change position" variant="outline" disabled={busy || !rankId || rankId === record.rank_id} onPress={() => void act(() => api.updateMember(covenId!, record.user_id, { rank_id: rankId }), `${name}’s position is changed.`)} />
                </View>
              )}
              {manageable && (perms.moderate || perms.site) && (
                <View style={styles.block}>
                  <Chips label="Pause their messages for" options={PAUSES} value={pause} onChange={setPause} />
                  <View style={styles.row}>
                    <Button
                      label="Pause messages"
                      variant="outline"
                      disabled={busy}
                      onPress={() => void act(() => api.updateMember(covenId!, record.user_id, { muted_until: new Date(Date.now() + Number(pause) * 3600000).toISOString() }), `${name}’s messages are paused.`)}
                    />
                    {muted && <Button label="Lift the pause" variant="outline" disabled={busy} onPress={() => void act(() => api.updateMember(covenId!, record.user_id, { clear_mute: true }), 'The pause is lifted.')} />}
                  </View>
                  <Field label="Why (optional, kept with their record)" value={reason} onChangeText={setReason} multiline maxLength={REASON_MAX} />
                  <View style={styles.row}>
                    <Button label="Remove from coven" variant="text" disabled={busy} onPress={() => remove('removed')} />
                    <Button label="Ban from coven" variant="text" disabled={busy} onPress={() => remove('banned')} />
                  </View>
                </View>
              )}
            </Section>
          )}
        </>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  block: { gap: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
