import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { listItems, plainText } from '../../lib/grimoire/richText';
import { blockMetadata, blockSource } from '../../lib/grimoire/structure';
import type { BlockRow, PageRow } from '../../lib/grimoire/types';
import { fonts } from '../../theme';
import { RichText } from './RichText';

// Ink colors for text printed on the parchment page.
export const ink = {
  paper: '#f4ecd8',
  text: '#1f1a12',
  soft: '#4a3f2a',
  faint: '#6b5a33',
  rule: '#d4c7a4',
  chip: '#e6dcc2',
  link: '#7a5f1c',
} as const;

type Props = { block: BlockRow; pages: PageRow[] };

export function BlockView({ block, pages }: Props) {
  const source = blockSource(block);
  const meta = blockMetadata(block);

  switch (block.block_type) {
    case 'heading':
      return (
        <Text accessibilityRole="header" style={styles.heading}>
          {plainText(source) || 'Untitled'}
        </Text>
      );
    case 'quote':
      return (
        <View style={styles.quote}>
          <RichText source={source} style={styles.quoteText} linkColor={ink.link} />
        </View>
      );
    case 'callout':
      return (
        <View style={styles.callout}>
          <RichText source={source || 'Callout'} style={styles.body} linkColor={ink.link} />
        </View>
      );
    case 'divider':
      return <Ornament />;
    case 'bulleted_list':
    case 'checklist':
    case 'numbered_list':
      return <List items={listItems(source)} numbered={block.block_type === 'numbered_list'} />;
    case 'ingredient_list':
      return (
        <View style={styles.group}>
          <Text style={styles.subheading}>Ingredients</Text>
          <List items={listItems(source)} />
        </View>
      );
    case 'correspondence':
      return (
        <View style={styles.callout}>
          <Text style={styles.body}>{plainText(source)}</Text>
        </View>
      );
    case 'image': {
      const url = typeof meta.url === 'string' ? meta.url : plainText(source);
      if (!/^https?:\/\//.test(url)) return null;
      const caption = typeof meta.caption === 'string' ? meta.caption : null;
      return (
        <View style={styles.group}>
          <Image
            source={{ uri: url }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={typeof meta.alt === 'string' ? meta.alt : caption ?? 'Grimoire image'}
          />
          {caption && <Text style={styles.caption}>{caption}</Text>}
        </View>
      );
    }
    case 'page_link': {
      const target = pages.find((p) => p.id === meta.target_page_id);
      if (!target) return null;
      const label = typeof meta.label === 'string' && meta.label ? meta.label : target.title;
      return <PageLinkButton page={target} label={`Turn to ${label}`} />;
    }
    default: {
      if (!plainText(source).trim()) return null;
      return <RichText source={source} style={styles.body} linkColor={ink.link} />;
    }
  }
}

function List({ items, numbered }: { items: string[]; numbered?: boolean }) {
  if (!items.length) return null;
  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <View key={i} style={styles.listRow}>
          <Text style={styles.marker}>{numbered ? `${i + 1}.` : '•'}</Text>
          <Text style={[styles.body, styles.listText]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function Ornament() {
  return (
    <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.ornament}>
      ✦ ☽ ✦ ☾ ✦
    </Text>
  );
}

export function PageLinkButton({ page, label }: { page: PageRow; label: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: page.id } })}
      style={({ pressed }) => [styles.pageLink, pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.pageLinkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 26, color: ink.text, marginTop: 6 },
  subheading: { fontFamily: fonts.displayBold, fontSize: 19, color: ink.text },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: ink.text },
  quote: { borderLeftWidth: 2, borderLeftColor: ink.rule, paddingLeft: 14 },
  quoteText: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 26, color: ink.soft },
  callout: { backgroundColor: ink.chip, borderRadius: 12, padding: 14 },
  group: { gap: 8 },
  list: { gap: 6 },
  listRow: { flexDirection: 'row', gap: 10 },
  marker: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 25, color: ink.faint, minWidth: 16 },
  listText: { flex: 1 },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: 12, backgroundColor: ink.chip },
  caption: { fontFamily: fonts.body, fontSize: 13, color: ink.faint, textAlign: 'center' },
  ornament: { textAlign: 'center', color: ink.faint, fontSize: 14, letterSpacing: 4, marginVertical: 4 },
  pageLink: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: ink.chip,
  },
  pageLinkText: { fontFamily: fonts.bodySemi, fontSize: 14, color: ink.link },
});
