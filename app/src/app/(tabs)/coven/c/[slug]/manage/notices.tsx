import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { SearchPicker } from '../../../../../../components/covens/SearchPicker';
import { Card, Field, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, OCCASIONS, type Member } from '../../../../../../lib/covens/model';
import { addNoticeKey, cleanScope, noticeEntries, noticeKeyLabel, noticeLabelOptions, noticeName, ruleChoices, scopeLabel, type NoticeRule } from '../../../../../../lib/covens/notices';
import { whoEntries, whoSuggestions } from '../../../../../../lib/covens/picker';
import { RITUAL_TEMPLATES } from '../../../../../../lib/covens/templates';
import { colors, type } from '../../../../../../theme';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const BASE = ['rite', 'meeting'];

// Gathering notifications: who gets a note on their phone when a rite or a
// meeting is put on the coven's calendar, moved, or taken off it, for each
// kind of gathering (lib/covens/notices.ts). Rites and meetings each have a
// rule, and an occasion (a full moon), a name (Hekate's Deipnon) or a kind
// of meeting (Officials' meetings) can have its own. With no rule, everyone
// a gathering is for hears. One gathering can choose otherwise in its
// planner. Chosen by those the coven's head allows ('notices'), as on the
// website (covens/coven/manage.js).
export default function ManageNotices() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { loadNames } = coven;
  const ranks = useMemo(() => coven.snapshot?.ranks ?? [], [coven.snapshot?.ranks]);
  const canChoose = coven.perms.notices || coven.perms.site;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [rules, setRules] = useState<NoticeRule[] | null>(null);
  // Rules being added: shown until someone is chosen for them.
  const [adding, setAdding] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!covenId) return;
    let off = false;
    void Promise.all([api.fetchMembers(covenId).catch(() => [] as Member[]), api.fetchNoticeRules(covenId)]).then(([list, saved]) => {
      if (off) return;
      setMembers(list);
      setRules(saved);
      void loadNames(list.map((m) => m.user_id));
    });
    return () => {
      off = true;
    };
  }, [covenId, loadNames]);

  const entries = useMemo(
    () => noticeEntries(whoEntries(ranks, (members ?? []).map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) }))), { parts: true }),
    [ranks, members, coven],
  );
  const suggestions = useMemo(() => [...whoSuggestions(entries, 3), 'parts', 'none'], [entries]);
  const labels = useMemo(() => noticeLabelOptions(RITUAL_TEMPLATES, coven.rituals), [coven.rituals]);
  const words = { ranks, nameOf: coven.nameOf };

  const scopes = useMemo(() => {
    const saved = (rules ?? []).map((r) => r.scope).filter((s) => !BASE.includes(s));
    return [...BASE, ...saved, ...adding.filter((s) => !saved.includes(s) && !BASE.includes(s))];
  }, [rules, adding]);
  const choices = useMemo(() => ruleChoices({ occasions: OCCASIONS, names: labels.names, series: labels.series, taken: scopes }), [labels, scopes]);

  const save = async (scope: string, who: string[]) => {
    if (!covenId) return;
    setBusy(true);
    setMessage(null);
    try {
      await api.setNoticeRule(covenId, scope, who);
      setRules(await api.fetchNoticeRules(covenId));
      if (!who.length) setAdding((list) => list.filter((s) => s !== scope));
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };
  const addScope = (scope: string | null) => {
    if (!scope) return setMessage('Give it a name to look for, such as Deipnon or Samhain.');
    setMessage(null);
    setAdding((list) => (list.includes(scope) ? list : [...list, scope]));
    setName('');
  };

  return (
    <CovenScreen title="Gathering notifications">
      <Text style={type.body}>
        When a rite or a meeting goes on the coven’s calendar, moves, or comes off it, those it’s for get a note on their phone. Choose who hears for each kind of gathering. A meeting kept to some only ever reaches them, and everyone can turn these off for themselves under Reminders.
      </Text>
      {(!members || !rules) && <ActivityIndicator color={colors.gold} />}
      {!!members && !!rules && (
        <>
          {scopes.map((scope) => {
            const rule = rules.find((r) => r.scope === scope);
            const who = rule?.who ?? [];
            const label = scopeLabel(scope, labels);
            return (
              <Card key={scope}>
                <Text style={type.eyebrow}>{label}</Text>
                {canChoose ? (
                  <SearchPicker
                    label={`Who hears about ${scope.startsWith('name:') ? label : label.charAt(0).toLowerCase() + label.slice(1)}`}
                    chips={who.map((k) => ({ key: k, label: cap(noticeKeyLabel(k, words)) }))}
                    entries={entries}
                    suggestions={suggestions}
                    onAdd={(entry) => void save(scope, addNoticeKey(who, entry.key))}
                    onRemove={(key) => void save(scope, who.filter((k) => k !== key))}
                    placeholder="The whole coven, Elders, everyone with a part…"
                    empty={BASE.includes(scope) ? 'Everyone it is for.' : 'No one chosen yet: the broader rules apply.'}
                  />
                ) : (
                  <Text style={type.body}>{who.length ? cap(who.map((k) => noticeKeyLabel(k, words)).join(', ')) : 'Everyone it is for.'}</Text>
                )}
              </Card>
            );
          })}
          {canChoose && (
            <Section label="Add a rule for an occasion">
              <Card>
                <SearchPicker
                  label="An occasion, or a kind of meeting"
                  chips={[]}
                  entries={choices.map((c) => ({ key: c.scope, label: c.label, detail: c.detail, keywords: [c.scope.replace(/^\w+:/, '')] }))}
                  suggestions={choices.slice(0, 5).map((c) => c.scope)}
                  onAdd={(entry) => addScope(entry.key)}
                  onRemove={() => {}}
                  placeholder="Full moon, Samhain, Officials’ meeting…"
                />
                <View style={styles.row}>
                  <View style={styles.grow}>
                    <Field label="Or the occasion’s name, as you write it in the planner" value={name} onChangeText={setName} maxLength={60} placeholder="Deipnon" />
                  </View>
                </View>
                <Button label="Add" variant="outline" disabled={busy || !noticeName(name)} onPress={() => addScope(cleanScope(`name:${name}`))} />
              </Card>
            </Section>
          )}
          {!canChoose && <Notice tone="muted">Those the coven’s head allows choose who hears about its gatherings.</Notice>}
          <Text style={type.caption}>A gathering’s own choice, in its planner, comes first; then the closest rule: its occasion’s name, its occasion, its kind of meeting, then rites or meetings.</Text>
        </>
      )}
      {message && <Notice>{message}</Notice>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
});
