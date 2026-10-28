import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { CopyPicker } from '../../../../../../components/covens/lineage';
import { Card, Chips, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { copySummary, MEMBERSHIP_CHOICES, type CopyChoice, type DaughterRequest } from '../../../../../../lib/covens/lineage';
import { decideDaughterRequest, fetchDaughterRequests } from '../../../../../../lib/covens/lineageApi';
import { errorMessage, type Member } from '../../../../../../lib/covens/model';
import { colors, type } from '../../../../../../theme';

// Requests to found a daughter coven, for this coven's head to answer:
// approve (choosing the new coven's High Priestess, usually whoever asked,
// and what carries across) or decline.
export default function DaughterRequests() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const [requests, setRequests] = useState<DaughterRequest[] | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = info?.id;
  const loadNames = coven.loadNames;

  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId) return;
    let live = true;
    void Promise.all([fetchDaughterRequests(covenId), api.fetchMembers(covenId).catch(() => [] as Member[])]).then(async ([list, people]) => {
      await loadNames([...list.map((r) => r.requested_by), ...people.map((m) => m.user_id)]);
      if (!live) return;
      setRequests(list);
      setMembers(people);
    });
    return () => {
      live = false;
    };
  }, [covenId, loadNames, version]);

  const pending = (requests ?? []).filter((r) => r.status === 'pending');
  const decided = (requests ?? []).filter((r) => r.status !== 'pending').slice(0, 10);

  return (
    <CovenScreen title="Requests to found" need="manage" onRefresh={load}>
      {!requests && <ActivityIndicator color={colors.gold} />}
      {requests && !pending.length && <Text style={type.caption}>No requests are waiting.</Text>}
      {info &&
        pending.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            members={members}
            covenId={info.id}
            mother={info.name}
            onDone={async (done) => {
              setMessage(done);
              await Promise.all([load(), coven.refresh()]);
            }}
          />
        ))}
      {decided.length > 0 && (
        <Section label="Answered">
          {decided.map((r) => (
            <Text key={r.id} style={type.caption}>
              {r.name} · {r.status === 'approved' ? 'founded' : r.status} · {coven.nameOf(r.requested_by)}
            </Text>
          ))}
        </Section>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

function RequestCard({ request, members, covenId, mother, onDone }: { request: DaughterRequest; members: Member[]; covenId: string; mother: string; onDone: (message: string) => Promise<void> }) {
  const coven = useCoven();
  const [head, setHead] = useState(request.requested_by);
  const [copy, setCopy] = useState<Partial<Record<CopyChoice, boolean>>>(request.copy ?? {});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const choice = MEMBERSHIP_CHOICES.find((c) => c.value === request.membership);
  const heads = [request.requested_by, ...(coven.userId ? [coven.userId] : []), ...members.filter((m) => m.status === 'active').map((m) => m.user_id)]
    .filter((id, i, all) => all.indexOf(id) === i)
    .slice(0, 16)
    .map((id) => ({ value: id, label: `${coven.nameOf(id)}${id === request.requested_by ? ' (asked)' : id === coven.userId ? ' (you)' : ''}` }));

  const decide = async (approve: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await decideDaughterRequest(covenId, request.id, approve, note, approve ? head : null, approve ? copy : null);
      await onDone(approve ? `${request.name} is founded, led by ${coven.nameOf(head)}.` : 'The request is declined.');
    } catch (e) {
      setError(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <Card>
      <Text style={type.eyebrow}>{coven.nameOf(request.requested_by)} asks to found</Text>
      <Text style={type.cardTitle}>{request.name}</Text>
      <Text style={type.caption}>
        {request.slug} · {request.visibility === 'unlisted' ? 'unlisted' : 'listed'}
        {request.tradition ? ` · ${request.tradition}` : ''}
      </Text>
      {!!request.note && <Text style={type.body}>“{request.note}”</Text>}
      {choice && <Text style={type.caption}>In {mother}, they chose: {choice.label.toLowerCase()}. {choice.detail(mother)}</Text>}
      <Section label="Its High Priestess">
        <Chips label="Its High Priestess" options={heads} value={head} onChange={setHead} />
        <Text style={type.caption}>They run it day to day, with full head powers, under your final say. You can change who leads it later.</Text>
      </Section>
      <Section label="Carry across">
        <Text style={type.caption}>{copySummary(request.copy)} You can change it.</Text>
        <CopyPicker value={copy} onChange={setCopy} mother={mother} />
      </Section>
      <Field label="A note to them (optional)" value={note} onChangeText={setNote} multiline maxLength={2000} />
      <View style={styles.row}>
        <Button label="Approve and found it" disabled={busy} onPress={() => void decide(true)} />
        <Button label="Decline" variant="outline" disabled={busy} onPress={() => void decide(false)} />
      </View>
      {error && <Notice>{error}</Notice>}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
