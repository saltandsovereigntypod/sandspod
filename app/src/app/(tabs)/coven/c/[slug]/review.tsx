import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Words, useReport } from '../../../../../components/covens/ui';
import { Card, Field, MenuList, MenuRow, Notice, Section } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage, normalizeQuestions, relativeTime, unsignedAgreements, type Advancement, type Application, type Signature } from '../../../../../lib/covens/model';
import { colors, type } from '../../../../../theme';

const STATUS: Record<string, string> = { approved: 'Approved', declined: 'Declined', withdrawn: 'Withdrawn', pending: 'Waiting' };

// Review: applications to join and requests to rise to a higher position.
export default function Review() {
  const coven = useCoven();
  const report = useReport(coven.userId);
  const covenId = coven.snapshot?.coven.id;
  const { loadNames } = coven;
  const [apps, setApps] = useState<Application[] | null>(null);
  const [advs, setAdvs] = useState<Advancement[]>([]);
  const [past, setPast] = useState<Application[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!covenId) return;
    try {
      const [pending, requests, sigs, all] = await Promise.all([
        api.fetchApplications(covenId),
        api.fetchAdvancements(covenId),
        api.fetchCovenSignatures(covenId).catch(() => [] as Signature[]),
        api.fetchApplications(covenId, 'all').catch(() => [] as Application[]),
      ]);
      setApps(pending);
      setAdvs(requests);
      setSignatures(sigs);
      setPast(all.filter((a) => a.status !== 'pending').slice(0, 30));
      await loadNames([...pending, ...requests, ...all].map((r) => r.user_id));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, loadNames]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (kind: 'application' | 'advancement', id: string, approve: boolean) => {
    setBusy(true);
    setMessage(null);
    try {
      if (kind === 'application') await api.decideApplication(id, approve, notes[id] ?? '');
      else await api.decideAdvancement(id, approve, notes[id] ?? '');
      setMessage(approve ? 'Approved.' : 'Declined.');
      await Promise.all([load(), coven.refresh()]);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const snap = coven.snapshot;
  const questions = normalizeQuestions(snap?.coven.application_questions ?? []);
  const rankName = (id: string) => snap?.ranks.find((r) => r.id === id)?.name ?? 'a position';
  const decision = (kind: 'application' | 'advancement', id: string) => (
    <>
      <Field label="Note to them (optional)" value={notes[id] ?? ''} onChangeText={(text) => setNotes((prev) => ({ ...prev, [id]: text }))} multiline maxLength={2000} />
      <View style={styles.row}>
        <Button label="Approve" onPress={() => void decide(kind, id, true)} disabled={busy} />
        <Button label="Decline" variant="outline" onPress={() => void decide(kind, id, false)} disabled={busy} />
      </View>
    </>
  );

  return (
    <CovenScreen title="Review" need="review" onRefresh={load}>
      {message && <Notice>{message}</Notice>}
      {!apps && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {apps && (
        <Section label="Applications to join">
          {!apps.length && <Text style={type.caption}>No applications are waiting.</Text>}
          {apps.map((a) => {
            const profile = coven.profileOf(a.user_id);
            const missing = snap ? unsignedAgreements(snap.documents, signatures.filter((s) => s.user_id === a.user_id), a.user_id) : [];
            const extra = Object.entries(a.answers ?? {}).filter(([key]) => !questions.some((q) => q.id === key));
            return (
              <Card key={a.id}>
                <Text style={type.cardTitle}>
                  {profile?.display_name ?? 'A witch'}
                  {profile?.pronouns ? ` (${profile.pronouns})` : ''}
                </Text>
                <Text style={type.caption}>
                  Applied {relativeTime(a.created_at)} · {missing.length ? `hasn’t signed the current ${missing.map((d) => d.title).join(', ')}` : 'has signed the agreements'}
                </Text>
                {!!profile?.bio && <Words text={profile.bio} />}
                {questions.map((q) => (
                  <View key={q.id} style={styles.answer}>
                    <Text style={type.caption}>{q.prompt}</Text>
                    <Words text={a.answers?.[q.id] || '—'} />
                  </View>
                ))}
                {extra.map(([key, value]) => (
                  <Words key={key} text={value} />
                ))}
                {!!a.message && (
                  <View style={styles.answer}>
                    <Text style={type.caption}>Their note</Text>
                    <Words text={a.message} />
                  </View>
                )}
                {decision('application', a.id)}
                <Button label="Report" variant="text" onPress={() => report.open({ target_type: 'application', target_id: a.id, coven_id: a.coven_id, target_user_id: a.user_id, label: 'this application' })} />
              </Card>
            );
          })}
        </Section>
      )}
      {apps && (
        <Section label="Requests to advance">
          {!advs.length && <Text style={type.caption}>No requests are waiting.</Text>}
          {advs.map((a) => {
            const wanted = snap?.ranks.find((r) => r.id === a.rank_id);
            return (
              <Card key={a.id}>
                <Text style={type.cardTitle}>
                  {coven.nameOf(a.user_id)} → {rankName(a.rank_id)}
                </Text>
                <Text style={type.caption}>Asked {relativeTime(a.created_at)}</Text>
                {!!wanted?.requirements && <Text style={type.caption}>The position asks: {wanted.requirements}</Text>}
                <Words text={a.statement} />
                {decision('advancement', a.id)}
              </Card>
            );
          })}
        </Section>
      )}
      {past.length > 0 && (
        <Section label="Decided applications">
          <MenuList>
            {past.map((a, i) => (
              <MenuRow
                key={a.id}
                label={`${coven.nameOf(a.user_id)} · ${STATUS[a.status] ?? a.status}`}
                detail={[relativeTime(a.decided_at ?? a.created_at), a.reviewer_note ? `“${a.reviewer_note}”` : ''].filter(Boolean).join(' · ')}
                last={i === past.length - 1}
              />
            ))}
          </MenuList>
        </Section>
      )}
      {report.sheet}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  answer: { gap: 2 },
});
