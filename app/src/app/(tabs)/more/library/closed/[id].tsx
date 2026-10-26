import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { CLOSED_GUIDE_VISIBLE, ClosedNotice } from '../../../../../components/library/ClosedNotice';
import { ResearchFooter } from '../../../../../components/ResearchNote';
import { Card, MenuList, MenuRow, MoreScreen, Paragraphs, Section, Tags } from '../../../../../components/more/ui';
import { CLOSED_GUIDE_TITLE, closedById, GROUP_LABELS, OPENNESS_DETAIL, OPENNESS_LABELS, relatedTo } from '../../../../../lib/library/closed';
import { colors, fonts, type } from '../../../../../theme';

const paragraphs = (text: string) => text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);

// One closed or living tradition: what it is, how people come in, and how to be a good guest.
export default function ClosedTraditionPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tradition = CLOSED_GUIDE_VISIBLE ? closedById(id) : null;

  if (!tradition) {
    return (
      <MoreScreen title="Closed & living traditions" back="/more/library/closed" backLabel="Back to the guide">
        <Text style={type.body}>
          {CLOSED_GUIDE_VISIBLE ? 'This tradition couldn’t be found.' : 'This guide isn’t open yet. It’s being read by people from the traditions it describes first.'}
        </Text>
      </MoreScreen>
    );
  }

  const related = relatedTo(tradition);

  return (
    <MoreScreen title={tradition.name} eyebrow={GROUP_LABELS[tradition.group]} back="/more/library/closed" backLabel="Back to the guide">
      <ClosedNotice tradition={tradition} />

      <Text style={styles.intro}>{tradition.summary}</Text>
      <Tags items={[OPENNESS_LABELS[tradition.openness], ...tradition.aka]} />
      <Text style={type.caption}>{`${OPENNESS_DETAIL[tradition.openness]}. ${tradition.peoples}`}</Text>

      {tradition.sections.map((section) => (
        <Section key={section.heading} label={section.heading}>
          <Card>
            <Paragraphs items={paragraphs(section.body)} />
          </Card>
        </Section>
      ))}

      <Section label="How people come in">
        <Card>
          <Paragraphs items={paragraphs(tradition.howPeopleComeIn)} />
        </Card>
      </Section>

      <Section label="Open & closed">
        <Card>
          <Paragraphs items={paragraphs(tradition.openAndClosed)} />
        </Card>
      </Section>

      {tradition.myths.length > 0 && (
        <Section label="Myths → truth">
          <Card>
            {tradition.myths.map((m, i) => (
              <View key={i} style={styles.myth}>
                <Text style={styles.mythText}>{m.myth}</Text>
                <Text style={type.body}>{m.truth}</Text>
              </View>
            ))}
          </Card>
        </Section>
      )}

      {tradition.please.length > 0 && (
        <Section label="Please">
          <Card tone="gold">
            {tradition.please.map((p, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.marker}>•</Text>
                <Text style={[type.body, styles.itemText]}>{p}</Text>
              </View>
            ))}
          </Card>
        </Section>
      )}

      <Section label="How to learn">
        <Card>
          <Paragraphs items={paragraphs(tradition.learn)} />
        </Card>
      </Section>

      {tradition.reading.length > 0 && (
        <Section label="Reading">
          <Card>
            {tradition.reading.map((r, i) => (
              <Text key={i} style={type.body} selectable>
                {r}
              </Text>
            ))}
          </Card>
        </Section>
      )}

      {!!tradition.community?.length && (
        <Section label="Community">
          <Card>
            {tradition.community.map((c, i) => (
              <Text key={i} style={type.body} selectable>
                {c}
              </Text>
            ))}
          </Card>
        </Section>
      )}

      {related.length > 0 && (
        <Section label="Related">
          <MenuList>
            {related.map((r, index) => (
              <MenuRow
                key={r.id}
                label={r.name}
                detail={OPENNESS_LABELS[r.openness]}
                last={index === related.length - 1}
                onPress={() => router.push({ pathname: '/more/library/closed/[id]', params: { id: r.id } })}
              />
            ))}
          </MenuList>
        </Section>
      )}

      <ResearchFooter page={tradition.name} kind={CLOSED_GUIDE_TITLE} />
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  intro: { fontFamily: fonts.displayItalic, fontSize: 21, lineHeight: 27, color: colors.parchment },
  myth: { gap: 4 },
  mythText: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 21, color: colors.gold },
  item: { flexDirection: 'row', gap: 8 },
  marker: { ...type.body, minWidth: 12, color: colors.gold },
  itemText: { flex: 1 },
});
