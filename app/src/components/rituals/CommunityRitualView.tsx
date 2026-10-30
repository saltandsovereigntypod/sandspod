import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, SectionLabel } from './ui';
import { contentFromShared, ritualFacts, stepsOf, type PublishedRitual, type SharedRitual } from '../../lib/rituals/community';
import { CLOSED_GUIDE_TITLE, closedMentions, GOOD_GUEST, mentionLine } from '../../lib/rituals/communityClosed';
import { colors, fonts, radius, type } from '../../theme';

/**
 * Everything a shared ritual holds, as its page and the review queue show
 * it: what it is, what to take care with, its roots, what you'll need, the
 * steps, the closing and the sharer's notes.
 */
export function CommunityRitualView({ row }: { row: PublishedRitual | SharedRitual }) {
  const steps = stepsOf(row);
  const mentions = closedMentions(contentFromShared(row));
  const deities = row.deities ?? [];
  const materials = row.materials ?? [];
  const tags = row.tags ?? [];
  return (
    <View style={styles.gap}>
      <Body muted>{ritualFacts(row)}</Body>
      {!!row.summary && <Body>{row.summary}</Body>}
      {deities.length > 0 && <Body muted>{`Honours: ${deities.join(', ')}`}</Body>}

      {!!row.safety_notes && (
        <Card accent>
          <SectionLabel>Take care</SectionLabel>
          <Body>{row.safety_notes}</Body>
        </Card>
      )}

      {(!!row.cultural_note || mentions.length > 0) && (
        <Card>
          <SectionLabel>Its roots</SectionLabel>
          {!!row.cultural_note && <Body>{row.cultural_note}</Body>}
          {mentions.map((m) => (
            <Body key={m.id} muted>
              {mentionLine(m)}
            </Body>
          ))}
          {mentions.length > 0 && (
            <>
              <Body>{GOOD_GUEST}</Body>
              <Button label={`Read ${CLOSED_GUIDE_TITLE}`} variant="text" onPress={() => router.push('/grimoire/library/closed')} />
            </>
          )}
        </Card>
      )}

      <Card>
        <SectionLabel>You’ll need</SectionLabel>
        {materials.length ? materials.map((item, i) => <Text key={`${item}-${i}`} style={styles.item}>{`• ${item}`}</Text>) : <Body>Nothing but yourself.</Body>}
        {!!row.preparation && <Body>{row.preparation}</Body>}
      </Card>

      <View style={styles.gapSmall}>
        <SectionLabel>Steps</SectionLabel>
        {steps.map((step, i) => (
          <View key={`${step.title}-${i}`} style={styles.step} accessible accessibilityLabel={`Step ${i + 1}: ${step.title}`}>
            <Text style={styles.number}>{i + 1}</Text>
            <View style={styles.stepText}>
              <Text style={type.cardTitle}>{step.title}</Text>
              {!!step.instructions && <Body>{step.instructions}</Body>}
              {!!step.spoken_text && <Text style={styles.spoken}>{step.spoken_text}</Text>}
              {!!step.minutes && <Body muted>{`${step.minutes} min`}</Body>}
            </View>
          </View>
        ))}
      </View>

      {!!row.closing && (
        <Card>
          <SectionLabel>Closing</SectionLabel>
          <Body>{row.closing}</Body>
        </Card>
      )}

      {!!row.notes && (
        <Card>
          <SectionLabel>Notes from the sharer</SectionLabel>
          <Body>{row.notes}</Body>
        </Card>
      )}

      {tags.length > 0 && <Body muted>{tags.join(' · ')}</Body>}
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 16 },
  gapSmall: { gap: 10 },
  item: { ...type.body, color: colors.cream },
  step: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderRadius: radius.tile, padding: 14 },
  number: { fontFamily: fonts.display, fontSize: 26, color: colors.gold, width: 24, textAlign: 'center' },
  stepText: { flex: 1, gap: 6 },
  spoken: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, color: colors.parchment },
});
