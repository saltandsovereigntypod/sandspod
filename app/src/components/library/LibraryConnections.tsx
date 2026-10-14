// A Library page's connections, as the website shows them: "Connected To"
// (grimoire/js/app.js renderRelatedEntriesLayer), the relationship manager
// (altar/js/ui/selection.js) and "Your Journey with …"
// (js/living-connections-view.js).

import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWorkshop } from '../../lib/altar/workshop';
import { confirmAction } from '../../lib/grimoire/confirm';
import { useGrimoire } from '../../lib/grimoire/store';
import { searchLibrary, typeSingular, type LibraryEntry } from '../../lib/library';
import {
  connectionGroups,
  editedRow,
  entryResolver,
  hasConnection,
  MANAGER_RELATIONS,
  relationLabel,
  storedConnections,
  type RelationRow,
  type RelationType,
  type StoredConnection,
} from '../../lib/library/connections';
import { buildJourney, formatJourneyDate, type JourneyItem, type JourneyTarget } from '../../lib/library/journey';
import { addRelation, disconnectRelation, replaceRelation } from '../../lib/library/store';
import { useRituals } from '../../lib/rituals/store';
import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Button } from '../Button';
import { Card, Chips, Field, Notice, Section, Tags } from '../more/ui';

/** "Connected To": every relation touching the entry, grouped by kind; each name opens its page. */
export function ConnectedTo({
  entry,
  entries,
  relations,
  hrefFor,
  onManage,
}: {
  entry: LibraryEntry;
  entries: LibraryEntry[];
  relations: RelationRow[];
  hrefFor: (entry: LibraryEntry) => Href;
  /** Signed in: opens the relationship manager. */
  onManage?: () => void;
}) {
  const groups = useMemo(() => connectionGroups(entry, entries, relations), [entry, entries, relations]);
  if (!groups.length && !onManage) return null;
  return (
    <Section label="Connected To">
      <Card>
        {groups.length === 0 && <Text style={type.body}>No connections yet.</Text>}
        {groups.map((group) => (
          <View key={group.relation} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <Tags
              items={group.entries.map((other) => other.name)}
              onPress={(name) => {
                const other = group.entries.find((candidate) => candidate.name === name);
                return other ? () => router.push(hrefFor(other)) : undefined;
              }}
            />
          </View>
        ))}
        {onManage && <Button label="Manage relationships" variant="outline" onPress={onManage} />}
      </Card>
    </Section>
  );
}

const RELATION_OPTIONS = MANAGER_RELATIONS.map((value) => ({ value, label: relationLabel(value) }));

/** Add, change or remove the entry's own relationships to other Library entries. Signed in only. */
export function RelationshipManager({
  visible,
  entry,
  entries,
  relations,
  userId,
  onClose,
}: {
  visible: boolean;
  entry: LibraryEntry;
  entries: LibraryEntry[];
  relations: RelationRow[];
  userId: string;
  onClose: () => void;
}) {
  const resolve = useMemo(() => entryResolver(entries), [entries]);
  const existing = useMemo(() => storedConnections(entry, relations, resolve), [entry, relations, resolve]);
  const [editing, setEditing] = useState<StoredConnection | null>(null);
  const [relation, setRelation] = useState<RelationType>('contains');
  const [target, setTarget] = useState<LibraryEntry | null>(null);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const matches = useMemo(
    () => (query.trim().length >= 2 ? searchLibrary(entries, query, { limit: 8 }).filter((candidate) => candidate.id !== entry.id) : []),
    [entries, query, entry.id],
  );

  const reset = () => {
    setEditing(null);
    setRelation('contains');
    setTarget(null);
    setQuery('');
    setProblem(null);
  };

  const startEdit = (connection: StoredConnection) => {
    setEditing(connection);
    setRelation((MANAGER_RELATIONS as readonly string[]).includes(connection.row.relation) ? (connection.row.relation as RelationType) : 'related_to');
    setTarget(connection.other);
    setQuery('');
    setProblem(null);
    setNotice(null);
  };

  const run = async (work: () => Promise<void>, done: string) => {
    setBusy(true);
    setProblem(null);
    try {
      await work();
      reset();
      setNotice(done);
    } catch (e) {
      setProblem(e instanceof Error ? e.message : 'That couldn’t be saved. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const submit = () => {
    setNotice(null);
    if (!target) {
      setProblem('Choose a relationship and connected entry first.');
      return;
    }
    if (hasConnection(entry, relation, target, relations, resolve, editing?.key)) {
      setProblem('That relationship already exists.');
      return;
    }
    if (editing) {
      const connection = editing;
      void run(() => replaceRelation(userId, connection.row, target, (id) => editedRow(connection, relation, id)), 'Relationship saved.');
    } else {
      void run(() => addRelation(userId, entry, relation, target), 'Relationship added.');
    }
  };

  const remove = async (connection: StoredConnection) => {
    setNotice(null);
    if (!(await confirmAction('Delete this relationship?', `${relationLabel(connection.row.relation)}: ${connection.other.name}`, 'Delete'))) return;
    void run(() => disconnectRelation(userId, connection.row), 'Relationship deleted.');
  };

  const close = () => {
    reset();
    setNotice(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={type.eyebrow}>Living Library</Text>
            <Text accessibilityRole="header" style={type.cardTitle}>
              Relationships for {entry.name}
            </Text>
          </View>
          <Button label="Done" variant="text" onPress={close} />
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="interactive"
          alwaysBounceHorizontal={false}
        >
          <Section label={editing ? `Edit relationship with ${editing.other.name}` : 'Add Relationship'}>
            <Card>
              <Chips label="Relationship" options={RELATION_OPTIONS} value={relation} onChange={setRelation} />
              {target ? (
                <View style={styles.chosen}>
                  <View style={styles.rowText}>
                    <Text style={styles.name}>{target.name}</Text>
                    <Text style={type.caption}>{typeSingular(target.type)}</Text>
                  </View>
                  <Button label="Change" variant="text" onPress={() => setTarget(null)} />
                </View>
              ) : (
                <>
                  <Field label="Connected entry" placeholder="Search the Library" value={query} onChangeText={setQuery} autoCorrect={false} />
                  {matches.map((candidate) => (
                    <Pressable
                      key={candidate.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${candidate.name}, ${typeSingular(candidate.type)}`}
                      onPress={() => {
                        setTarget(candidate);
                        setQuery('');
                      }}
                      style={({ pressed }) => [styles.pick, pressed && styles.pressed]}
                    >
                      <Text style={styles.name}>{candidate.name}</Text>
                      <Text style={type.caption}>{typeSingular(candidate.type)}</Text>
                    </Pressable>
                  ))}
                </>
              )}
              {!!problem && <Notice>{problem}</Notice>}
              <View style={styles.actions}>
                <Button label={editing ? 'Save' : 'Add Relationship'} onPress={submit} disabled={busy} />
                {editing && <Button label="Cancel" variant="text" onPress={reset} disabled={busy} />}
              </View>
            </Card>
          </Section>

          {!!notice && <Notice>{notice}</Notice>}

          <Section label="Existing Relationships">
            <Card>
              {existing.length === 0 && <Text style={type.body}>No relationships yet.</Text>}
              {existing.map((connection, index) => {
                const heading = connection.row.relation !== existing[index - 1]?.row.relation ? relationLabel(connection.row.relation) : null;
                return (
                  <View key={connection.key} style={styles.group}>
                    {heading && <Text style={styles.groupLabel}>{heading}</Text>}
                    <View style={styles.existing}>
                      <View style={styles.rowText}>
                        <Text style={styles.name}>{connection.other.name}</Text>
                        <Text style={type.caption}>{typeSingular(connection.other.type)}</Text>
                      </View>
                      <Button label="Edit" variant="text" onPress={() => startEdit(connection)} disabled={busy} />
                      <Button label="Delete" variant="text" onPress={() => void remove(connection)} disabled={busy} />
                    </View>
                  </View>
                );
              })}
              <Text style={type.caption}>Connections drawn from Traditional notes and your Pairs With and Substitutions aren’t listed here.</Text>
            </Card>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

/** "Your Journey with …": how the entry has figured in your rituals, recipes and pages. */
export function LibraryJourney({
  entry,
  entries,
  relations,
  hrefFor,
}: {
  entry: LibraryEntry;
  entries: LibraryEntry[];
  relations: RelationRow[];
  hrefFor: (entry: LibraryEntry) => Href;
}) {
  const rituals = useRituals();
  const { snapshot } = useGrimoire();
  const { apothecary } = useWorkshop();
  const [open, setOpen] = useState<string | null>(null);
  const journey = useMemo(
    () =>
      buildJourney(entry, entries, {
        journal: rituals.journal,
        ritualLinks: rituals.links,
        templates: rituals.templates,
        pages: snapshot?.pages ?? [],
        apothecary,
        relations,
      }),
    [entry, entries, rituals.journal, rituals.links, rituals.templates, snapshot?.pages, apothecary, relations],
  );

  const go = (target: JourneyTarget | null) => {
    if (!target) return undefined;
    if (target.kind === 'journal') return () => router.push({ pathname: '/rituals/journal/[id]', params: { id: target.id } });
    if (target.kind === 'template') return () => router.push({ pathname: '/rituals/templates/[id]', params: { id: target.id } });
    if (target.kind === 'page') return () => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: target.id } });
    const other = entries.find((candidate) => candidate.id === target.id);
    return other ? () => router.push(hrefFor(other)) : undefined;
  };

  const item = (record: JourneyItem, withDate: boolean) => {
    const action = go(record.target);
    const date = record.date ? formatJourneyDate(record.date, true) : '';
    const detail = [withDate ? '' : record.detail, date].filter(Boolean).join(' · ');
    const body = (
      <>
        {withDate && !!date && <Text style={styles.date}>{date}</Text>}
        <Text style={[styles.itemLabel, !!action && styles.link]}>{record.label}</Text>
        {!!(withDate ? record.detail : detail) && <Text style={type.caption}>{withDate ? record.detail : detail}</Text>}
      </>
    );
    return action ? (
      <Pressable
        key={record.key}
        accessibilityRole="link"
        accessibilityLabel={[record.label, record.detail, date].filter(Boolean).join(', ')}
        onPress={action}
        style={({ pressed }) => [styles.item, pressed && styles.pressed]}
      >
        {body}
      </Pressable>
    ) : (
      <View key={record.key} style={styles.item} accessible>
        {body}
      </View>
    );
  };

  return (
    <Section label={`Your Journey with ${entry.name}`}>
      <Card>
        {!!journey.emptyMessage && <Text style={type.body}>{journey.emptyMessage}</Text>}
        {journey.summary.length > 0 && (
          <View style={styles.facts}>
            {journey.summary.map((row) => (
              <View key={row.label} style={styles.fact} accessible accessibilityLabel={`${row.label}: ${row.value}`}>
                <Text style={type.eyebrow}>{row.label}</Text>
                <Text style={styles.factValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}

        {journey.pairings.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Frequently Paired With</Text>
            {journey.pairings.map((pairing) =>
              item(
                {
                  key: pairing.entry.id,
                  label: pairing.entry.name,
                  detail: `${typeSingular(pairing.entry.type)} · ${pairing.description}`,
                  date: null,
                  target: { kind: 'entry', id: pairing.entry.id },
                },
                false,
              ),
            )}
          </View>
        )}

        {journey.groups.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Appears Within</Text>
            {journey.groups.map((group) => {
              const expanded = open === group.key;
              return (
                <View key={group.key}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    accessibilityLabel={`${group.label}, ${group.items.length}`}
                    onPress={() => setOpen(expanded ? null : group.key)}
                    style={({ pressed }) => [styles.count, pressed && styles.pressed]}
                  >
                    <Text style={styles.countLabel}>{group.label}</Text>
                    <Text style={styles.countValue}>{group.items.length}</Text>
                  </Pressable>
                  {expanded && <View style={styles.items}>{group.items.map((record) => item(record, false))}</View>}
                </View>
              );
            })}
          </View>
        )}

        {journey.recent.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>Recent Activity</Text>
            {journey.recent.map((record) => item(record, true))}
          </View>
        )}
      </Card>
    </Section>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  groupLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.gold },
  safe: { flex: 1, backgroundColor: colors.ground },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.gutter, paddingRight: 4, paddingVertical: 8, gap: 8 },
  headerText: { flex: 1, gap: 2 },
  content: { paddingHorizontal: space.gutter, paddingBottom: 32, gap: space.section },
  chosen: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: colors.cream },
  pick: {
    minHeight: touch,
    justifyContent: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  existing: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: touch },
  pressed: { opacity: 0.7 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fact: {
    minWidth: 140,
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.tile,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  factValue: { fontFamily: fonts.display, fontSize: 17, lineHeight: 21, color: colors.cream },
  item: { minHeight: touch, justifyContent: 'center', paddingVertical: 6, gap: 2 },
  itemLabel: { fontFamily: fonts.display, fontSize: 18, lineHeight: 22, color: colors.cream },
  link: { color: colors.gold },
  date: { ...type.eyebrow },
  items: { paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: colors.hairline, marginBottom: 6 },
  count: {
    minHeight: touch,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  countLabel: { ...type.body, color: colors.cream, flex: 1 },
  countValue: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
});
