import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../../components/Button';
import { BlockEditor, Field, InkButton } from '../../../../components/grimoire/BlockEditor';
import { ink, Ornament } from '../../../../components/grimoire/BlockView';
import { PagePicker } from '../../../../components/grimoire/PagePicker';
import { FailedChanges, SaveStatus } from '../../../../components/grimoire/SaveStatus';
import { useDraft } from '../../../../components/grimoire/useDraft';
import { confirmAction } from '../../../../lib/grimoire/confirm';
import { ELEMENT_GROUPS, ELEMENT_TYPES, elementLabel } from '../../../../lib/grimoire/elements';
import { useGrimoire } from '../../../../lib/grimoire/store';
import { pageBlocks, pageTypeLabel } from '../../../../lib/grimoire/structure';
import type { BlockType, PageRow } from '../../../../lib/grimoire/types';
import { colors, fonts, space, touch, type } from '../../../../theme';

export default function EditGrimoirePage() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const { snapshot, canEdit } = useGrimoire();
  const page = snapshot?.pages.find((p) => p.id === pageId) ?? null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerText}>{canEdit && <SaveStatus />}</View>
        <Button
          label="Done"
          variant="text"
          accessibilityHint="Closes the editor and shows the page"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/grimoire'))}
        />
      </View>

      {!canEdit ? (
        <View style={styles.message}>
          <Text style={type.body}>Sign in to write in your Book of Shadows.</Text>
          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        </View>
      ) : !page ? (
        <View style={styles.message}>
          <Text style={type.body}>This page couldn't be found. It may have been removed.</Text>
        </View>
      ) : (
        <Editor key={page.id} page={page} />
      )}
    </SafeAreaView>
  );
}

type Picking = { for: 'block'; blockId: string } | { for: 'link' } | null;

function Editor({ page }: { page: PageRow }) {
  const { snapshot, actions } = useGrimoire();
  const blocks = snapshot ? pageBlocks(snapshot, page.id) : [];
  const pages = snapshot?.pages ?? [];
  const links = snapshot?.links.filter((l) => l.source_page_id === page.id) ?? [];
  const title = useDraft(page.title, (value) => actions.renamePage(page.id, value));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [picking, setPicking] = useState<Picking>(null);
  const scroll = useRef<ScrollView>(null);

  // Like the website, a page always has at least one paragraph to write in.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && blocks.length === 0) {
      seeded.current = true;
      actions.addBlock(page.id, 'text');
    }
  }, [blocks.length, actions, page.id]);

  const add = (blockType: BlockType) => {
    const id = actions.addBlock(page.id, blockType);
    setAdding(false);
    if (!id) return;
    setActiveId(id);
    if (blockType === 'page_link') setPicking({ for: 'block', blockId: id });
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  const remove = async (blockId: string, label: string) => {
    const ok = await confirmAction(`Remove this ${label.toLowerCase()}?`, 'It will be taken off the page.', 'Remove');
    if (ok) actions.deleteBlock(blockId);
  };

  const returnToAshes = async () => {
    const ok = await confirmAction(
      `Return “${page.title || 'Untitled page'}” to ashes?`,
      'The page and everything on it will be deleted. This cannot be undone.',
      'Return to ashes',
    );
    if (!ok) return;
    actions.deletePage(page.id);
    router.dismissTo('/grimoire');
  };

  const linkable = pages.filter((p) => p.id !== page.id && p.book_id === page.book_id);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        alwaysBounceHorizontal={false}
      >
        <FailedChanges />
        <View style={styles.paper}>
          <View style={styles.group}>
            <Text style={styles.eyebrow}>{pageTypeLabel(page)}</Text>
            <Field
              accessibilityLabel="Page title"
              value={title.value}
              onChangeText={title.change}
              onBlur={title.flush}
              placeholder="Untitled Page"
              multiline
              submitBehavior="blurAndSubmit"
              minHeight={touch}
              textStyle={styles.titleInput}
            />
          </View>
          <Ornament />

          {blocks.map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              index={index}
              count={blocks.length}
              pages={pages}
              active={activeId === block.id}
              onFocus={() => setActiveId(block.id)}
              onMove={(direction) => actions.moveBlock(block.id, direction)}
              onRemove={() => remove(block.id, elementLabel(block.block_type))}
              onChooseLink={() => setPicking({ for: 'block', blockId: block.id })}
            />
          ))}

          {adding ? (
            <View style={styles.group}>
              <View style={styles.addHeader}>
                <Text style={styles.subheading}>Add to the page</Text>
                <InkButton label="Close" quiet onPress={() => setAdding(false)} />
              </View>
              {ELEMENT_GROUPS.map((group) => (
                <View key={group} style={styles.group}>
                  <Text style={styles.eyebrow}>{group}</Text>
                  <View style={styles.chips}>
                    {ELEMENT_TYPES.filter((e) => e.group === group).map((e) => (
                      <InkButton key={e.type} label={`+ ${e.label}`} onPress={() => add(e.type)} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add a page element"
              onPress={() => setAdding(true)}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
            >
              <Text style={styles.addText}>✦ Add page element</Text>
            </Pressable>
          )}

          <View style={styles.group}>
            <Text style={styles.subheading}>Linked pages</Text>
            {links.length === 0 && <Text style={styles.hint}>Link pages that belong together, like a herb and a ritual that uses it.</Text>}
            {links.map((link) => {
              const target = pages.find((p) => p.id === link.target_page_id);
              const name = link.link_label || target?.title || 'A page';
              return (
                <View key={link.id} style={styles.linkRow}>
                  <Text style={[styles.body, styles.flex]} numberOfLines={2}>
                    {name}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Unlink ${name}`}
                    onPress={() => actions.unlinkPage(link.id)}
                    style={({ pressed }) => [styles.unlink, pressed && styles.pressed]}
                  >
                    <Text style={styles.danger}>Unlink</Text>
                  </Pressable>
                </View>
              );
            })}
            {linkable.length > 0 && <InkButton label="Link a page" onPress={() => setPicking({ for: 'link' })} />}
          </View>
        </View>

        <Button label="Return page to ashes" variant="outline" onPress={returnToAshes} style={styles.ashes} />
      </ScrollView>

      <PagePicker
        visible={picking !== null}
        title={picking?.for === 'link' ? 'Link a page' : 'Choose linked page'}
        pages={linkable}
        onClose={() => setPicking(null)}
        onChoose={(target) => {
          if (picking?.for === 'block') {
            actions.saveBlockMetadata(picking.blockId, { target_page_id: target.id, label: target.title });
          } else if (picking?.for === 'link') {
            actions.linkPage(page.id, target.id);
          }
          setPicking(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: space.gutter, paddingRight: 4, paddingBottom: 8, minHeight: touch },
  headerText: { flex: 1 },
  message: { padding: space.gutter, gap: 16 },
  scroll: { paddingHorizontal: 12, paddingBottom: 48, gap: 16 },
  paper: { backgroundColor: ink.paper, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 20, gap: 14 },
  group: { gap: 8 },
  eyebrow: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: ink.faint },
  titleInput: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 36 },
  subheading: { fontFamily: fonts.displayBold, fontSize: 19, color: ink.text, flex: 1 },
  addHeader: { flexDirection: 'row', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: ink.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontFamily: fonts.bodySemi, fontSize: 15, color: ink.link },
  pressed: { opacity: 0.7 },
  hint: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: ink.faint },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: ink.text },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: touch },
  unlink: { minHeight: touch, justifyContent: 'center', paddingHorizontal: 8 },
  danger: { fontFamily: fonts.body, fontSize: 14, color: '#8a3b2a' },
  ashes: { marginHorizontal: 8 },
});
