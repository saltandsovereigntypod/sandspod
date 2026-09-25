import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/Button';
import { PAGE_TEMPLATES } from '../../../lib/grimoire/elements';
import { useGrimoire } from '../../../lib/grimoire/store';
import { colors, fonts, radius, space, touch, type } from '../../../theme';

export default function NewPage() {
  const params = useLocalSearchParams<{ sectionId?: string }>();
  const { snapshot, canEdit, actions } = useGrimoire();
  const book = snapshot?.books[0] ?? null;
  const sections = snapshot && book ? snapshot.sections.filter((s) => s.book_id === book.id) : [];
  sections.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const [title, setTitle] = useState('');
  const [sectionId, setSectionId] = useState<string | null>(
    params.sectionId && sections.some((s) => s.id === params.sectionId) ? params.sectionId : null,
  );
  const [templateKey, setTemplateKey] = useState('blank');

  const create = () => {
    const id = actions.createPage({ title, sectionId, templateKey });
    if (id) router.replace({ pathname: '/grimoire/edit/[pageId]', params: { pageId: id } });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[type.cardTitle, styles.flex]}>
          New page
        </Text>
        <Button label="Cancel" variant="text" onPress={() => (router.canGoBack() ? router.back() : router.replace('/grimoire'))} />
      </View>

      {!canEdit ? (
        <View style={styles.content}>
          <Text style={type.body}>Sign in, and open your book once while online, to add pages.</Text>
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" alwaysBounceHorizontal={false}>
            <View style={styles.group}>
              <Text style={type.eyebrow}>Name</Text>
              <TextInput
                accessibilityLabel="Page name"
                value={title}
                onChangeText={setTitle}
                placeholder="Untitled Page"
                placeholderTextColor={colors.tabInactive}
                autoFocus
                returnKeyType="done"
                style={styles.input}
              />
            </View>

            {sections.length > 0 && (
              <View style={styles.group}>
                <Text style={type.eyebrow}>Section</Text>
                <View style={styles.chips}>
                  <Chip label="No section" selected={sectionId === null} onPress={() => setSectionId(null)} />
                  {sections.map((s) => (
                    <Chip key={s.id} label={s.title} selected={sectionId === s.id} onPress={() => setSectionId(s.id)} />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.group}>
              <Text style={type.eyebrow}>Begin with</Text>
              <View style={styles.list} accessibilityRole="radiogroup">
                {PAGE_TEMPLATES.map((t, i) => {
                  const selected = t.key === templateKey;
                  return (
                    <Pressable
                      key={t.key}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={t.label}
                      onPress={() => setTemplateKey(t.key)}
                      style={({ pressed }) => [styles.row, i < PAGE_TEMPLATES.length - 1 && styles.rule, pressed && styles.pressed]}
                    >
                      <View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>
                      <View style={styles.flex}>
                        <Text style={styles.rowTitle}>{t.label}</Text>
                        {t.key !== 'blank' && (
                          <Text style={type.caption} numberOfLines={2}>
                            {t.blocks
                              .filter((b) => b.type === 'heading')
                              .map((b) => b.content)
                              .join(' · ')}
                          </Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Button label="Create page" onPress={create} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.gutter, paddingRight: 4, paddingBottom: 8, minHeight: touch },
  content: { paddingHorizontal: space.gutter, paddingTop: 8, paddingBottom: 40, gap: space.section },
  group: { gap: 10 },
  input: {
    minHeight: 52,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.cream,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: touch,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchment },
  chipTextOn: { color: colors.forestInk, fontFamily: fonts.bodySemi },
  list: { backgroundColor: colors.surface, borderRadius: radius.card, paddingHorizontal: 16 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.gold },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.gold },
});
