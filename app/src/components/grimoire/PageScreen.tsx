import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockView, ink, Ornament, PageLinkButton } from './BlockView';
import { useLeave } from './leave';
import { MundaneToggle, PageFaceContext, useMundaneMode } from './presentation';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { fullDate } from '../../lib/calendar';
import { bookTitle, displayPageTitle, mundaneWords, pageFace } from '../../lib/grimoire/presentation';
import { plainText } from '../../lib/grimoire/richText';
import { useGrimoire } from '../../lib/grimoire/store';
import { blockSource, pageBlocks, pageFacts, pageTypeLabel } from '../../lib/grimoire/structure';
import type { PageRow } from '../../lib/grimoire/types';
import { colors, fonts, touch, type } from '../../theme';
import { useGrimoireScope } from './scope';

/**
 * One page of a grimoire, to read: your own (the Grimoire tab) or a coven's
 * (its Book), as the scope says. `extras` adds what belongs to that book
 * under the page (suggesting it to a coven; a coven page's history and who
 * can open it).
 */
export function GrimoirePageScreen({ pageId, extras }: { pageId: string; extras?: (page: PageRow) => ReactNode }) {
  const scope = useGrimoireScope();
  const { snapshot, canEdit, actions } = useGrimoire();
  const { mundane, setMundane, settings } = useMundaneMode();
  const face = pageFace(settings?.grimoire_page_font);
  const back = useLeave(scope.home);
  const page = snapshot?.pages.find((p) => p.id === pageId) ?? null;
  const book = page ? snapshot?.books.find((b) => b.id === page.book_id) : null;
  const section = page?.section_id ? snapshot?.sections.find((s) => s.id === page.section_id) : null;

  // Reading a page opens its section, as on the website (activeSectionId).
  const pageFound = !!page;
  const pageSectionId = page?.section_id ?? null;
  useEffect(() => {
    if (pageFound) actions.setOpenSection(pageSectionId);
  }, [actions, pageFound, pageSectionId]);

  const blocks = snapshot && page ? pageBlocks(snapshot, page.id) : [];
  const visible = blocks.filter((b) => b.block_type === 'divider' || plainText(blockSource(b)).trim());
  const links = snapshot && page ? snapshot.links.filter((l) => l.source_page_id === page.id) : [];
  const facts = page ? pageFacts(page) : null;
  const date = fullDate(facts?.date);
  const details = [date, facts?.moonPhase, facts?.minutes ? `${facts.minutes} min` : null].filter(Boolean).join(' · ');

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={scope.kind === 'coven' ? 'Back to the coven’s book' : 'Back to your grimoire'}
          onPress={back}
          style={styles.back}
        >
          <View style={styles.flip}>
            <Icon name="chevron" size={22} color={colors.cream} />
          </View>
        </Pressable>
        <Text style={[type.caption, styles.crumb]} numberOfLines={1}>
          {[book ? bookTitle(book.title, mundane) : null, section?.title].filter(Boolean).join(' · ')}
        </Text>
        {page && <MundaneToggle mundane={mundane} onChange={setMundane} />}
        {page && canEdit && scope.canWrite(page) && (
          <Button label="Edit" variant="pill" accessibilityHint="Opens this page for writing" onPress={() => router.push(scope.edit(page.id))} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} alwaysBounceHorizontal={false} keyboardShouldPersistTaps="handled">
        {!page ? (
          <Text style={[type.body, styles.missing]}>
            {scope.kind === 'coven' ? 'This page isn’t in the coven’s book, or isn’t open to you.' : 'This page couldn’t be found. It may have been removed on the website.'}
          </Text>
        ) : (
          <PageFaceContext.Provider value={face}>
            <View style={styles.paper}>
              <View style={styles.titleBlock}>
                <Text style={styles.eyebrow}>{mundane ? mundaneWords(pageTypeLabel(page)) : pageTypeLabel(page)}</Text>
                <Text accessibilityRole="header" style={styles.title}>
                  {displayPageTitle(page, mundane)}
                </Text>
                {!!details && <Text style={styles.details}>{details}</Text>}
              </View>
              <Ornament />

              {facts && facts.altarItems.length > 0 && (
                <View style={styles.group}>
                  <Text style={styles.subheading}>On the altar</Text>
                  <View style={styles.chips}>
                    {facts.altarItems.map((label) => (
                      <View key={label} style={styles.chip}>
                        <Text style={styles.chipText}>{label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {visible.length === 0 ? (
                <Text style={styles.placeholder}>This page is waiting for your words.</Text>
              ) : (
                visible.map((block) => <BlockView key={block.id} block={block} pages={snapshot?.pages ?? []} />)
              )}

              {links.length > 0 && (
                <View style={styles.group}>
                  <Text style={styles.subheading}>Linked pages</Text>
                  {links.map((link) => {
                    const target = snapshot?.pages.find((p) => p.id === link.target_page_id);
                    return target ? <PageLinkButton key={link.id} page={target} label={link.link_label || target.title} /> : null;
                  })}
                </View>
              )}
            </View>
            {extras?.(page)}
          </PageFaceContext.Provider>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingBottom: 8 },
  back: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' },
  flip: { transform: [{ scaleX: -1 }] },
  crumb: { flex: 1 },
  scroll: { paddingHorizontal: 12, paddingBottom: 32, gap: 16 },
  missing: { padding: 20 },
  paper: { backgroundColor: ink.paper, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 24, gap: 14 },
  titleBlock: { gap: 6 },
  eyebrow: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: ink.faint },
  title: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 37, color: ink.text },
  details: { fontFamily: fonts.displayItalic, fontSize: 17, color: ink.soft },
  group: { gap: 8 },
  subheading: { fontFamily: fonts.displayBold, fontSize: 19, color: ink.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 32, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 999, backgroundColor: ink.chip },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: ink.text },
  placeholder: { fontFamily: fonts.displayItalic, fontSize: 17, color: ink.faint, textAlign: 'center', marginVertical: 12 },
});
