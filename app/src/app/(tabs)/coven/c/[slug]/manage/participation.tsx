import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { SearchPicker } from '../../../../../../components/covens/SearchPicker';
import { Card, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, type Member } from '../../../../../../lib/covens/model';
import { assigneeFromKey, assigneeKey, assigneeLabel, cleanAssignees, whoEntries, whoSuggestions, type Assignee } from '../../../../../../lib/covens/picker';
import { colors, type } from '../../../../../../theme';

// Who sees ritual participation: for each step that asks something, how many
// have written (or placed, or done) theirs, and who has and hasn't, never what
// they wrote. The coven's head always sees it and chooses who else does, as on
// the website (covens/coven/manage.js).
export default function ManageParticipation() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { loadNames } = coven;
  const ranks = useMemo(() => coven.snapshot?.ranks ?? [], [coven.snapshot?.ranks]);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [viewers, setViewers] = useState<Assignee[]>([]);
  const [saved, setSaved] = useState<string>('[]');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const head = coven.perms.founder || coven.perms.site;

  useEffect(() => {
    if (!covenId) return;
    let off = false;
    void Promise.all([api.fetchMembers(covenId).catch(() => [] as Member[]), api.fetchRitualSettings(covenId).catch(() => null)]).then(([list, settings]) => {
      if (off) return;
      setMembers(list);
      const current = cleanAssignees(settings?.participation_viewers ?? []);
      setViewers(current);
      setSaved(JSON.stringify(current));
      void loadNames(list.map((m) => m.user_id));
    });
    return () => {
      off = true;
    };
  }, [covenId, loadNames]);

  const entries = useMemo(
    () => whoEntries(ranks, (members ?? []).filter((m) => m.user_id !== coven.snapshot?.coven.founder_id).map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) })), { coven: false }),
    [ranks, members, coven],
  );

  const save = async () => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      const done = await api.setParticipationViewers(covenId, viewers);
      setSaved(JSON.stringify(cleanAssignees(done.participation_viewers)));
      setMessage('Saved.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  return (
    <CovenScreen title="Ritual participation" need="manage">
      <Text style={type.body}>
        When a step asks people to write, place or do something, some may see how many have, and who has and hasn’t. They never see what anyone wrote, and private ones stay sealed.
      </Text>
      {!members && <ActivityIndicator color={colors.gold} />}
      {!!members && (
        <Card>
          <Text style={type.caption}>You, as the coven’s head, always see it. Choose positions and people who see it too.</Text>
          <SearchPicker
            label="Who also sees participation"
            chips={viewers.map((a) => ({ key: assigneeKey(a), label: assigneeLabel(a, ranks, coven.nameOf) }))}
            entries={entries}
            suggestions={whoSuggestions(entries, 3)}
            onAdd={(entry) => {
              const a = assigneeFromKey(entry.key);
              if (a) setViewers((list) => cleanAssignees([...list, a]));
            }}
            onRemove={(key) => setViewers((list) => list.filter((a) => assigneeKey(a) !== key))}
            placeholder="Maiden, Elder, Rowan…"
            empty="Only you."
          />
          {head ? (
            <Button label={busy ? 'Saving…' : 'Save'} onPress={() => void save()} disabled={busy || JSON.stringify(viewers) === saved} />
          ) : (
            <Text style={type.caption}>Only the coven’s head chooses this.</Text>
          )}
        </Card>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}
