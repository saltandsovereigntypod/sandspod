import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { SearchPicker } from '../../../../../../components/covens/SearchPicker';
import { useCovenBook } from '../../../../../../components/grimoire/covenBook';
import { Card, Chips, Notice } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { errorMessage, type Member } from '../../../../../../lib/covens/model';
import { assigneeFromKey, assigneeKey, assigneeLabel, cleanAssignees, whoEntries, whoSuggestions, type Assignee } from '../../../../../../lib/covens/picker';
import { ACCESS_WHATS, cleanAccess, ruleFor, ruleLabel, ruleSource, setRule, WHAT_LABEL, type Access, type AccessWhat, type Level } from '../../../../../../lib/grimoire/access';
import { bookChain, pageChain, sectionChain } from '../../../../../../lib/grimoire/coven';
import { colors, type } from '../../../../../../theme';

const NOTES: Record<AccessWhat, string> = {
  view: 'Only those named here see it at all: it’s left out of the contents, searches, links and the ritual builder for everyone else.',
  write: 'They edit it directly. No one writes in what they can’t open.',
  approve: 'They decide what members suggest for it, and choose who can open it.',
};

// Who can open, write in and approve one part of the coven's book: the whole
// book, a section or a page. Each power is set here or follows the level
// above (a page its section, a section the book, the book the coven's own
// powers). The coven's head and the site's moderators always can.
export default function CovenBookAccess() {
  const params = useLocalSearchParams<{ kind: Level; id: string }>();
  const kind: Level = params.kind === 'book' || params.kind === 'section' ? params.kind : 'page';
  const id = String(params.id ?? '');
  const { coven, snapshot, canPage, canSection, canBook, grimoire } = useCovenBook();
  const ranks = useMemo(() => coven.snapshot?.ranks ?? [], [coven.snapshot?.ranks]);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [draft, setDraft] = useState<Access | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const covenId = coven.snapshot?.coven.id;
  const { loadNames } = coven;

  const page = kind === 'page' ? (snapshot?.pages.find((p) => p.id === id) ?? null) : null;
  const section = kind === 'section' ? (snapshot?.sections.find((s) => s.id === id) ?? null) : null;
  const target = kind === 'book' ? snapshot?.books[0] : page ?? section;
  const chain = kind === 'page' ? pageChain(snapshot, page) : kind === 'section' ? sectionChain(snapshot, section) : bookChain(snapshot);
  const own = cleanAccess(chain[0]);
  const access = draft ?? own;
  const above = chain.slice(1);
  const may = kind === 'page' ? canPage(page, 'approve') : kind === 'section' ? canSection(section, 'approve') : canBook('approve');

  useEffect(() => {
    if (!covenId) return;
    void api.fetchMembers(covenId).then((list) => {
      setMembers(list);
      void loadNames(list.map((m) => m.user_id));
    });
  }, [covenId, loadNames]);

  const entries = useMemo(() => whoEntries(ranks, (members ?? []).map((m) => ({ id: m.user_id, name: coven.nameOf(m.user_id) }))), [ranks, members, coven]);

  const save = async () => {
    if (!target) return;
    setBusy(true);
    setMessage(null);
    try {
      await api.setBookAccess(kind, target.id, access);
      await grimoire.refresh();
      setDraft(null);
      setMessage('Saved.');
    } catch (e) {
      setMessage(errorMessage(e));
    }
    setBusy(false);
  };

  const title = kind === 'book' ? 'The whole book' : (page?.title ?? section?.title ?? '');

  return (
    <CovenScreen title="Who can open it">
      {!snapshot || !members ? (
        <ActivityIndicator color={colors.gold} />
      ) : !target ? (
        <Text style={type.body}>That part of the book isn’t here, or isn’t open to you.</Text>
      ) : (
        <>
          <Text style={type.cardTitle}>{title}</Text>
          <Text style={type.caption}>The coven’s head and the site’s moderators can always open, write in and approve everything.</Text>
          {ACCESS_WHATS.map((what) => {
            const set = !!access[what];
            const inherited = ruleFor(above, what);
            const list: Assignee[] = access[what] ?? [];
            return (
              <Card key={what}>
                <Text style={type.eyebrow}>{WHAT_LABEL[what]}</Text>
                <Text style={type.caption}>{NOTES[what]}</Text>
                {may && (
                  <Chips
                    label={WHAT_LABEL[what]}
                    options={[
                      { value: 'above', label: kind === 'book' ? 'The coven’s own powers' : kind === 'section' ? 'As the whole book' : 'As its section' },
                      { value: 'here', label: 'Chosen here' },
                    ]}
                    value={set ? 'here' : 'above'}
                    onChange={(v) => setDraft(setRule(access, what, v === 'here' ? (inherited.list ?? [{ kind: 'coven', id: 'coven' }]) : null))}
                  />
                )}
                {set ? (
                  may ? (
                    <SearchPicker
                      label="Who"
                      chips={list.map((a) => ({ key: assigneeKey(a), label: assigneeLabel(a, ranks, coven.nameOf) }))}
                      entries={entries}
                      suggestions={whoSuggestions(entries, 4)}
                      onAdd={(entry) => {
                        const a = assigneeFromKey(entry.key);
                        if (a) setDraft(setRule(access, what, cleanAssignees([...list, a])));
                      }}
                      onRemove={(key) => setDraft(setRule(access, what, list.filter((a) => assigneeKey(a) !== key)))}
                      placeholder="Whole coven, Elder, Rowan…"
                      empty="Only the coven’s head."
                    />
                  ) : (
                    <Text style={type.body}>{ruleLabel(list, what, ranks, coven.nameOf)}</Text>
                  )
                ) : (
                  <Text style={type.body}>
                    {ruleLabel(inherited.list, what, ranks, coven.nameOf)} <Text style={type.caption}>({ruleSource(inherited.from, kind).toLowerCase()})</Text>
                  </Text>
                )}
              </Card>
            );
          })}
          {may ? (
            <View style={styles.row}>
              <Button label={busy ? 'Saving…' : 'Save'} onPress={() => void save()} disabled={busy || !draft} />
              {draft && <Button label="Undo changes" variant="text" onPress={() => setDraft(null)} />}
            </View>
          ) : (
            <Text style={type.caption}>Only those who approve for this part of the book choose who can open it.</Text>
          )}
          {message && <Notice>{message}</Notice>}
        </>
      )}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 } });
