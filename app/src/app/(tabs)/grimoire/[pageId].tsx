import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockView, ink, Ornament, PageLinkButton } from '../../../components/grimoire/BlockView';
import { Icon } from '../../../components/Icon';
import { fullDate } from '../../../lib/calendar';
import { plainText } from '../../../lib/grimoire/richText';
import { useGrimoire } from '../../../lib/grimoire/store';
import { blockSource, pageBlocks, pageFacts, pageTypeLabel } from '../../../lib/grimoire/structure';
import { colors, fonts, touch, type } from '../../../theme';

export default function GrimoirePage() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const { snapshot } = useGrimoire();
  const page = snapshot?.pages.find((p) => p.id === pageId) ?? null;
  const book = page ? snapshot?.books.find((b) => b.id === page.book_id) : null;
  const section = page?.section_id ? snapshot?.sections.find((s) => s.id === page.section_id) : null;

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
          accessibilityLabel="Back to your grimoire"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/grimoire'))}
          style={styles.back}
        >
          <View style={styles.flip}>
            <Icon name="chevron" size={22} color={colors.cream} />
          </View>
        </Pressable>
        <Text style={[type.caption, styles.crumb]} numberOfLines={1}>
          {[book?.title, section?.title].filter(Boolean).join(' · ')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} alwaysBounceHorizontal={false}>
        {!page ? (
          <Text style={[type.body, styles.missing]}>This page couldn't be found. It may have been removed on the website.</Text>
        ) : (
          <View style={styles.paper}>
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>{pageTypeLabel(page)}</Text>
              <Text accessibilityRole="header" style={styles.title}>
                {page.title || 'Untitled page'}
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
  scroll: { paddingHorizontal: 12, paddingBottom: 32 },
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
