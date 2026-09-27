import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { SaveStatus } from '../../../components/grimoire/SaveStatus';
import { useDraft } from '../../../components/grimoire/useDraft';
import { confirmAction } from '../../../lib/grimoire/confirm';
import { useGrimoire } from '../../../lib/grimoire/store';
import type { SectionRow } from '../../../lib/grimoire/types';
import { colors, fonts, radius, space, touch, type } from '../../../theme';

export default function Sections() {
  const { snapshot, canEdit, actions } = useGrimoire();
  const book = snapshot?.books[0] ?? null;
  const sections = snapshot && book ? snapshot.sections.filter((s) => s.book_id === book.id) : [];
  sections.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.created_at ?? '').localeCompare(b.created_at ?? ''));
  const [name, setName] = useState('');

  const add = () => {
    if (!name.trim()) return;
    if (actions.createSection(name)) setName('');
  };

  const remove = async (section: SectionRow) => {
    const count = snapshot?.pages.filter((p) => p.section_id === section.id).length ?? 0;
    const ok = await confirmAction(
      `Delete “${section.title}”?`,
      count
        ? `Its ${count === 1 ? 'page stays' : `${count} pages stay`} in your book, without a section.`
        : 'This section has no pages.',
      'Delete section',
    );
    if (ok) actions.deleteSection(section.id);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text accessibilityRole="header" style={type.cardTitle}>
            Sections
          </Text>
          {canEdit && <SaveStatus />}
        </View>
        <Button label="Done" variant="text" onPress={() => (router.canGoBack() ? router.back() : router.replace('/grimoire'))} />
      </View>

      {!canEdit ? (
        <View style={styles.content}>
          <Text style={type.body}>Sign in, and open your book once while online, to arrange sections.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" alwaysBounceHorizontal={false}>
            <Text style={type.body}>Sections gather pages that belong together. Tap a name to rename it.</Text>

            {sections.length > 0 && (
              <View style={styles.list}>
                {sections.map((section, i) => (
                  <SectionRowEditor
                    key={section.id}
                    section={section}
                    last={i === sections.length - 1}
                    onRename={(title) => actions.renameSection(section.id, title)}
                    onDelete={() => remove(section)}
                  />
                ))}
              </View>
            )}

            <View style={styles.group}>
              <Text style={type.eyebrow}>New section</Text>
              <TextInput
                accessibilityLabel="New section name"
                value={name}
                onChangeText={setName}
                onSubmitEditing={add}
                placeholder="Herbs"
                placeholderTextColor={colors.tabInactive}
                returnKeyType="done"
                style={styles.input}
              />
              <Button label="Add section" onPress={add} disabled={!name.trim()} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function SectionRowEditor({
  section,
  last,
  onRename,
  onDelete,
}: {
  section: SectionRow;
  last: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const draft = useDraft(section.title, (value) => {
    if (value.trim()) onRename(value);
  });
  return (
    <View style={[styles.row, !last && styles.rule]}>
      <TextInput
        accessibilityLabel={`Section name, ${section.title}`}
        value={draft.value}
        onChangeText={draft.change}
        onBlur={() => {
          draft.flush();
          if (!draft.value.trim()) draft.change(section.title);
        }}
        returnKeyType="done"
        style={styles.rowInput}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete section ${section.title}`}
        onPress={onDelete}
        style={({ pressed }) => [styles.delete, pressed && styles.pressed]}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.gutter, paddingRight: 4, paddingBottom: 8, minHeight: touch },
  content: { paddingHorizontal: space.gutter, paddingTop: 8, paddingBottom: 40, gap: space.section },
  group: { gap: 10 },
  list: { backgroundColor: colors.surface, borderRadius: radius.card, paddingLeft: 6, paddingRight: 4 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 6 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  rowInput: {
    flex: 1,
    minHeight: touch,
    paddingHorizontal: 10,
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.cream,
  },
  delete: { minHeight: touch, minWidth: touch, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontFamily: fonts.body, fontSize: 14, color: colors.gold },
  pressed: { opacity: 0.7 },
  input: {
    minHeight: 52,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.cream,
  },
});
