import { useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';

import { Button } from '../../../../../components/Button';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { Card, Field, Notice } from '../../../../../components/more/ui';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import type { Succession } from '../../../../../lib/covens/lineage';
import { fetchMyHeadReport, fetchSuccession, reportHeadUnreachable } from '../../../../../lib/covens/lineageApi';
import { errorMessage } from '../../../../../lib/covens/model';
import { type } from '../../../../../theme';

// "The head can't be reached": for the coven's elders (those who review or
// keep the gathering safe). It goes to the site moderators with the coven,
// its succession plan, and how long the head has been away; they decide.
export default function HeadUnreachable() {
  const coven = useCoven();
  const info = coven.snapshot?.coven;
  const [plan, setPlan] = useState<Succession | null>(null);
  const [sent, setSent] = useState<{ status: string; created_at: string } | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = info?.id;
  const userId = coven.userId;
  const loadNames = coven.loadNames;

  const [version, setVersion] = useState(0);
  const load = useCallback(async () => setVersion((v) => v + 1), []);
  useEffect(() => {
    if (!covenId || !userId) return;
    let live = true;
    void Promise.all([fetchSuccession(covenId), fetchMyHeadReport(covenId, userId)]).then(async ([saved, mine]) => {
      await loadNames([saved?.successor_id, saved?.second_id]);
      if (!live) return;
      setPlan(saved);
      setSent(mine);
    });
    return () => {
      live = false;
    };
  }, [covenId, userId, loadNames, version]);

  const send = async () => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      await reportHeadUnreachable(covenId, note);
      setNote('');
      await load();
      setMessage('Sent to the site moderators. They’ll look at it and decide.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const elder = (coven.perms.review || coven.perms.moderate) && !coven.perms.founder;
  return (
    <CovenScreen title="The head can’t be reached">
      {info && (
        <>
          <Text style={type.body}>
            If {coven.nameOf(info.founder_id)} has gone quiet and can’t be reached, the coven’s elders can tell the Salt & Sovereignty moderators. They see the coven, its succession plan and how long the head has been away, and they decide whether to hand the coven on.
          </Text>
          {plan?.successor_id ? (
            <Text style={type.caption}>
              The coven’s plan names {coven.nameOf(plan.successor_id)} to lead next{plan.second_id ? `, then ${coven.nameOf(plan.second_id)}` : ''}.
            </Text>
          ) : (
            <Text style={type.caption}>No successor is named, so the moderators will look at who leads with the head.</Text>
          )}
          {coven.lineage?.mother && <Text style={type.caption}>This is a daughter coven: the head of {coven.lineage.mother.name ?? 'its mother coven'} can also choose who leads it.</Text>}
          {sent?.status === 'open' ? (
            <Card>
              <Text style={type.body}>You told the moderators on {new Date(sent.created_at).toLocaleDateString()}. It’s with them.</Text>
            </Card>
          ) : elder ? (
            <>
              <Field label="What’s happened (optional)" value={note} onChangeText={setNote} multiline maxLength={2000} />
              <Button label={busy ? 'Sending…' : 'Tell the site moderators'} disabled={busy} onPress={send} />
            </>
          ) : (
            <Notice tone="muted">This is for the coven’s elders.</Notice>
          )}
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}
