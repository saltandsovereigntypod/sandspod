import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { RecordSections } from '../../../../../components/covens/Record';
import { Card, Notice } from '../../../../../components/more/ui';
import * as api from '../../../../../lib/covens/api';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../lib/covens/model';
import { recordFlags, type MemberRecord } from '../../../../../lib/covens/record';
import { colors, type } from '../../../../../theme';

// My standing: what the coven's leaders see of your taking part (lib/covens/record.ts),
// so nothing about it is hidden from you: the rituals you came to or sent word
// about, your studies, your mentoring, and how much else you've done. Leaders'
// notes aren't shown here. If you mentor someone, you log your check-ins here.
// As on the website's My path (covens/coven/record.js).
export default function MyStanding() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { userId, loadNames } = coven;
  const [record, setRecord] = useState<MemberRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apply = useCallback(
    (next: MemberRecord) => {
      setRecord(next);
      void loadNames([next.mentor?.mentor_id, ...next.checkins.map((c) => c.mentor_id), ...next.mentees.map((m) => m.user_id)]);
    },
    [loadNames],
  );
  const load = useCallback(async () => {
    if (!covenId || !userId) return;
    try {
      apply(await api.fetchMemberRecord(covenId, userId));
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }, [covenId, userId, apply]);

  useEffect(() => {
    if (!covenId || !userId) return;
    let off = false;
    api.fetchMemberRecord(covenId, userId).then(
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

  const flags = record ? recordFlags(record, Date.parse(record.now)) : [];

  return (
    <CovenScreen title="My standing" onRefresh={load}>
      <Text style={type.body}>
        The coven’s head, and those they choose, keep a record of how each member takes part: which rituals you came to or sent word about, how your studies and mentoring are going, and how much else you’ve done. This is what they see of yours. They never see what you wrote privately, or your own conversations.
      </Text>
      {!record && !message && <ActivityIndicator color={colors.gold} />}
      {record && flags.length > 0 && (
        <Card>
          <Text style={type.caption}>What the record notices</Text>
          {flags.map((f) => (
            <Text key={f} style={type.body}>
              {f}
            </Text>
          ))}
        </Card>
      )}
      {record && (
        <RecordSections
          record={record}
          nameOf={coven.nameOf}
          busy={busy}
          userId={userId}
          onLogCheckin={coven.standing.ok ? (menteeId, metOn, note) => void act(() => api.logCheckin(covenId!, menteeId, metOn, note), 'The check-in is logged.') : undefined}
          onRemoveCheckin={(id) => void act(() => api.removeCheckin(id))}
        />
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}
