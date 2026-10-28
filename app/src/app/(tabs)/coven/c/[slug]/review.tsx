import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Checklist } from '../../../../../components/covens/Positions';
import { Words, useReport } from '../../../../../components/covens/ui';
import { Card, CheckRow, Field, MenuList, MenuRow, Notice, Section } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage, normalizeQuestions, relativeTime, unsignedAgreements, type Advancement, type Application, type Signature } from '../../../../../lib/covens/model';
import { placesLeft, placesLine, rankQuestions, untickedLabels, withTicks, type RequirementCheck } from '../../../../../lib/covens/positions';
import { refreshRequests } from '../../../../../lib/covens/requestsBadge';
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
  // Each request's checklist, what's ticked here, and how many hold each position.
  const [checks, setChecks] = useState<Record<string, RequirementCheck[]>>({});
  const [ticks, setTicks] = useState<Record<string, string[]>>({});
  const [holders, setHolders] = useState<Record<string, number> | null>(null);
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
      const [lists, overview] = await Promise.all([Promise.all(requests.map((r) => api.fetchChecklist(r.id))), api.fetchPositionsOverview(covenId)]);
      setChecks(Object.fromEntries(requests.map((r, i) => [r.id, lists[i]])));
      setHolders(overview?.holders ?? null);
      await loadNames([...pending, ...requests, ...all].map((r) => r.user_id));
      void refreshRequests();
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
      else await api.decideAdvancement(id, approve, notes[id] ?? '', ticks[id] ?? []);
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
  const decision = (kind: 'application' | 'advancement', id: string, block?: string | null) => (
    <>
      <Field label="Note to them (optional)" value={notes[id] ?? ''} onChangeText={(text) => setNotes((prev) => ({ ...prev, [id]: text }))} multiline maxLength={2000} />
      {!!block && <Text style={type.caption}>{block}</Text>}
      <View style={styles.row}>
        <Button label="Approve" onPress={() => void decide(kind, id, true)} disabled={busy || !!block} />
        <Button label="Decline" variant="outline" onPress={() => void decide(kind, id, false)} disabled={busy} />
      </View>
    </>
  );

  return (
    <CovenScreen title="Review" need="review" onRefresh={load}>
      {message && <Notice>{message}</Notice>}
      {covenId && coven.perms.review && coven.userId && (
        <MenuList>
          <MenuRow
            label="Notification settings ›"
            detail="New applications here, and the rest of this coven’s notifications"
            onPress={() => router.push({ pathname: '/coven/settings/notifications', params: { section: 'covens' } })}
            last
          />
        </MenuList>
      )}
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
            const ticked = ticks[a.id] ?? [];
            const list = withTicks(checks[a.id] ?? [], ticked);
            const held = holders?.[a.rank_id];
            const left = wanted && held != null ? placesLeft(wanted, held) : null;
            const mentorsThem = coven.mentors.some((m) => m.user_id === a.user_id && m.mentor_id === coven.userId);
            const toTick = (checks[a.id] ?? []).filter((c) => !c.auto && c.status !== 'met');
            const unticked = untickedLabels(checks[a.id] ?? [], ticked);
            const block = left === 0 ? `${rankName(a.rank_id)} is full. Give it more places under Manage → Positions, or decline this request.` : unticked.length ? `Tick what it asks before approving: ${unticked.join('; ')}.` : null;
            return (
              <Card key={a.id}>
                <Text style={type.cardTitle}>
                  {coven.nameOf(a.user_id)} → {rankName(a.rank_id)}
                </Text>
                <Text style={type.caption}>
                  Asked {relativeTime(a.created_at)}
                  {wanted && held != null ? ` · ${placesLine(wanted, held)}` : ''}
                </Text>
                <Checklist checks={list} />
                {toTick.map((c) => {
                  const may = c.kind !== 'mentor_approval' || coven.perms.manage || coven.perms.site || mentorsThem;
                  return may ? (
                    <CheckRow
                      key={c.id}
                      label={c.kind === 'mentor_approval' ? 'Their mentor approves' : `Confirmed: ${c.label}`}
                      value={ticked.includes(c.id)}
                      onChange={(on) => setTicks((prev) => ({ ...prev, [a.id]: on ? [...ticked, c.id] : ticked.filter((x) => x !== c.id) }))}
                    />
                  ) : (
                    <Text key={c.id} style={type.caption}>
                      Their mentor or the coven’s leaders give their mentor’s approval.
                    </Text>
                  );
                })}
                {!!wanted?.requirements && (
                  <View style={styles.answer}>
                    <Text style={type.caption}>In their words, the position asks</Text>
                    <Words text={wanted.requirements} />
                  </View>
                )}
                {rankQuestions(wanted).map((q) => (
                  <View key={q.id} style={styles.answer}>
                    <Text style={type.caption}>{q.prompt}</Text>
                    <Words text={a.answers?.[q.id] || '—'} />
                  </View>
                ))}
                <View style={styles.answer}>
                  <Text style={type.caption}>Why they’re ready</Text>
                  <Words text={a.statement || '—'} />
                </View>
                {decision('advancement', a.id, block)}
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
