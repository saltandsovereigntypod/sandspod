// A lesson's words, drawn from the blocks lib/covens/lesson.ts reads (the
// same reading the website turns into HTML): headings, paragraphs, lists,
// bold and italic, labelled callouts and dividers.

import { StyleSheet, Text, View } from 'react-native';

import { useAccessibleText } from '../../lib/accessibility/store';
import { parseLesson, type Block, type Span } from '../../lib/covens/lesson';
import { colors, fonts, radius, type } from '../../theme';

function Spans({ spans }: { spans: Span[] }) {
  return (
    <>
      {spans.map((s, i) => (
        <Text key={i} style={[s.bold && styles.bold, s.italic && styles.italic]}>
          {s.text}
        </Text>
      ))}
    </>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  const t = useAccessibleText();
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            return (
              <Text key={i} accessibilityRole="header" style={t(b.level === 1 ? styles.h1 : b.level === 2 ? styles.h2 : styles.h3)}>
                <Spans spans={b.spans} />
              </Text>
            );
          case 'paragraph':
            return (
              <Text key={i} style={t(styles.p)}>
                <Spans spans={b.spans} />
              </Text>
            );
          case 'list':
            return (
              <View key={i} style={styles.list} accessibilityRole="list">
                {b.items.map((item, j) => (
                  <View key={j} style={styles.item}>
                    <Text style={t(b.ordered ? styles.number : styles.bullet)}>{b.ordered ? `${b.start + j}.` : '•'}</Text>
                    <Text style={[t(styles.p), styles.flex]}>
                      <Spans spans={item} />
                    </Text>
                  </View>
                ))}
              </View>
            );
          case 'callout':
            return (
              <View key={i} style={[styles.callout, b.kind === 'safety' && styles.safety, b.kind === 'coven' && styles.coven, b.kind === 'try' && styles.tryThis]}>
                {!!b.label && <Text style={[type.eyebrow, b.kind === 'safety' && styles.safetyLabel]}>{b.label}</Text>}
                <Blocks blocks={b.blocks} />
              </View>
            );
          case 'divider':
            return <View key={i} style={styles.divider} />;
        }
      })}
    </>
  );
}

export function LessonView({ body }: { body: string | null | undefined }) {
  return (
    <View style={styles.wrap}>
      <Blocks blocks={parseLesson(body)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  flex: { flex: 1 },
  h1: { fontFamily: fonts.display, fontSize: 28, color: colors.cream, marginTop: 6 },
  h2: { fontFamily: fonts.display, fontSize: 24, color: colors.cream, marginTop: 8 },
  h3: { fontFamily: fonts.bodySemi, fontSize: 17, color: colors.gold, marginTop: 4 },
  p: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.parchment },
  bold: { fontFamily: fonts.bodySemi, color: colors.cream },
  italic: { fontStyle: 'italic' },
  list: { gap: 6 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.gold, width: 14 },
  number: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 25, color: colors.gold, minWidth: 22 },
  callout: { borderLeftWidth: 3, borderLeftColor: colors.goldLine, backgroundColor: 'rgba(226,195,109,0.06)', borderRadius: radius.tile, padding: 14, gap: 8 },
  safety: { borderLeftColor: 'rgba(243,160,110,0.85)', backgroundColor: 'rgba(243,160,110,0.08)' },
  safetyLabel: { color: '#f3c29a' },
  coven: { borderLeftColor: colors.fern, backgroundColor: 'rgba(111,132,101,0.12)' },
  tryThis: { borderLeftColor: colors.gold },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline, marginVertical: 8 },
});
