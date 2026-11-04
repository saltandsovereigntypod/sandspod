// What the last divination at the altar answered, held in the stage's corner
// (lib/altar/divinationResult.ts): the pendulum's yes or no, the card or rune
// drawn, the scrying sit, the candle read. It stays until put away with ×, or
// another divination takes its place, and folds to a chip. "Add notes" keeps
// what you make of it on the reading itself, so the notes show wherever
// readings show, and can be changed later here or in the reading. Keyed by
// the result's time, so a new divination starts it afresh.

import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { canKeepNotes, RESULT_HELP, resultChip, type DivinationResult } from '../../lib/altar/divinationResult';
import { colors, fonts, touch, type } from '../../theme';
import { Field } from './workings/common';
import { Sheet } from './Sheet';

type Props = {
  result: DivinationResult;
  onClose: () => void;
  /** Keep the notes where they belong; resolves to the reading's id when one was made for them. */
  onSaveNotes: (notes: string) => Promise<void>;
  /** The notes as they stand now (they may have been changed in the reading since). */
  loadNotes?: () => Promise<string | null>;
};

export function DivinationResultCard({ result, onClose, onSaveNotes, loadNotes }: Props) {
  const [folded, setFolded] = useState(false);
  const [writing, setWriting] = useState(false);
  const [notes, setNotes] = useState(result.notes);
  const [saving, setSaving] = useState(false);
  const [said, setSaid] = useState<string | null>(null);

  const openNotes = () => {
    setWriting(true);
    if (loadNotes)
      void loadNotes()
        .then((n) => n != null && setNotes(n))
        .catch(() => {});
  };
  const save = async () => {
    setSaving(true);
    try {
      await onSaveNotes(notes);
      setSaid('Notes kept with the reading.');
      setWriting(false);
    } catch {
      setSaid('Your notes couldn’t be kept just now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (folded)
    return (
      <Pressable style={[styles.box, styles.chip]} onPress={() => setFolded(false)} accessibilityRole="button" accessibilityLabel={`${resultChip(result)}. Show the answer`}>
        <Text style={styles.chipText} numberOfLines={1}>
          {resultChip(result)}
        </Text>
      </Pressable>
    );

  return (
    <>
      <View style={styles.box} accessibilityLiveRegion="polite">
        <View style={styles.head}>
          <Text style={[type.eyebrow, styles.grow]} numberOfLines={1}>
            {result.eyebrow}
          </Text>
          <Pressable onPress={() => setFolded(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Fold the answer to a chip">
            <Text style={styles.icon}>–</Text>
          </Pressable>
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Put the answer away">
            <Text style={styles.icon}>×</Text>
          </Pressable>
        </View>
        <Text style={styles.answer} numberOfLines={3}>
          {result.answer}
        </Text>
        {!!result.detail && (
          <Text style={styles.detail} numberOfLines={2}>
            {result.detail}
          </Text>
        )}
        <View style={styles.links}>
          {canKeepNotes(result) && (
            <Pressable onPress={openNotes} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>{notes.trim() ? 'Your notes' : 'Add notes'}</Text>
            </Pressable>
          )}
          {!!result.readingId && (
            <Pressable onPress={() => router.push(`/rituals/divination/${result.readingId}` as Href)} accessibilityRole="link" style={styles.link}>
              <Text style={styles.linkText}>Open reading ›</Text>
            </Pressable>
          )}
        </View>
        {!!said && <Text style={styles.detail}>{said}</Text>}
      </View>
      <Sheet visible={writing} eyebrow={result.eyebrow} title={result.answer} onClose={() => setWriting(false)} size="half">
        <View style={styles.sheet}>
          {!!result.question && <Text style={type.caption}>You asked: {result.question}</Text>}
          <Field label="What you make of it" placeholder="What you make of it, what it brought to mind" value={notes} onChangeText={setNotes} multiline maxLength={4000} />
          <Text style={type.caption}>{result.candle ? 'Kept with the candle’s reading, in its story.' : RESULT_HELP}</Text>
          <Button label={saving ? 'Keeping…' : 'Keep my notes'} onPress={() => void save()} disabled={saving} />
        </View>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    top: 8,
    right: 8,
    maxWidth: 230,
    padding: 10,
    gap: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: 'rgba(12,21,16,0.88)',
  },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, minHeight: 32, justifyContent: 'center' },
  chipText: { color: colors.cream, fontFamily: fonts.bodySemi, fontSize: 13 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  grow: { flex: 1 },
  icon: { color: colors.gold, fontFamily: fonts.bodySemi, fontSize: 18, paddingHorizontal: 2 },
  answer: { color: colors.cream, fontFamily: fonts.display, fontSize: 20, lineHeight: 24 },
  detail: { color: colors.parchment, fontFamily: fonts.body, fontSize: 13 },
  links: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12 },
  link: { minHeight: Math.min(touch, 32), justifyContent: 'center' },
  linkText: { color: colors.gold, fontFamily: fonts.bodySemi, fontSize: 13 },
  sheet: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
});
