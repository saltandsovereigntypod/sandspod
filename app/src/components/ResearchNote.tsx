import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import {
  RESEARCH_CARD,
  RESEARCH_CARD_SEEN_KEY,
  RESEARCH_LINE,
  RESEARCH_NOTE_HREF,
  RESEARCH_NOTE_TITLE,
  researchNoteUrl,
  SUPPORT_EMAIL,
} from '../lib/research';
import { colors, fonts, type } from '../theme';
import { Button } from './Button';
import { Card } from './more/ui';

/** Opens a "Send a note" email, saying where to write if no mail app opens. */
function useSendNote(page?: string | null, kind?: string | null) {
  const [failed, setFailed] = useState(false);
  const send = async () => {
    try {
      await Linking.openURL(researchNoteUrl(page, kind));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return { failed, send };
}

/**
 * The one-line note at the foot of a researched page (a Library entry, a
 * deity, a holiday, a journey, a card): "Send a note" emails the owner with
 * the page's name in the subject. The same line as the website's
 * js/research-note.js.
 */
export function ResearchFooter({ page, kind }: { page: string; kind?: string }) {
  const { failed, send } = useSendNote(page, kind);
  return (
    <View style={styles.footer} accessibilityLabel={RESEARCH_NOTE_TITLE}>
      <Text style={styles.line}>{RESEARCH_LINE}</Text>
      <View style={styles.links}>
        <Button label="Send a note" variant="text" accessibilityHint={`Opens an email to ${SUPPORT_EMAIL} about ${page}`} onPress={send} />
        <Button label={RESEARCH_NOTE_TITLE} variant="text" onPress={() => router.push(RESEARCH_NOTE_HREF as Href)} />
      </View>
      {failed && (
        <Text style={type.caption} selectable>
          {`Couldn't open your mail app. You can write to ${SUPPORT_EMAIL}`}
        </Text>
      )}
    </View>
  );
}

/** Whether the Living Library's research card has been put away on this device. */
function useCardSeen(): [boolean | null, () => void] {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(RESEARCH_CARD_SEEN_KEY)
      .then((value) => live && setSeen(value === '1'))
      .catch(() => live && setSeen(false));
    return () => {
      live = false;
    };
  }, []);
  const dismiss = () => {
    setSeen(true);
    AsyncStorage.setItem(RESEARCH_CARD_SEEN_KEY, '1').catch(() => {});
  };
  return [seen, dismiss];
}

/** A gentle card the first time someone opens the Living Library, pointing to the full note. */
export function ResearchCard() {
  const [seen, dismiss] = useCardSeen();
  if (seen !== false) return null;
  return (
    <Card tone="gold">
      <Text style={type.eyebrow}>{RESEARCH_NOTE_TITLE}</Text>
      <Text style={styles.card}>{RESEARCH_CARD}</Text>
      <View style={styles.links}>
        <Button
          label="Read the note"
          variant="outline"
          onPress={() => {
            dismiss();
            router.push(RESEARCH_NOTE_HREF as Href);
          }}
        />
        <Button label="Got it" variant="text" accessibilityHint="Puts this note away" onPress={dismiss} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  footer: { gap: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.hairline, marginTop: 8 },
  line: { fontFamily: fonts.displayItalic, fontSize: 16, lineHeight: 22, color: colors.parchment },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  card: { ...type.body, color: colors.cream },
});
