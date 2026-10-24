import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, Field, MoreScreen, Section } from '../../../components/more/ui';
import { Expander } from '../../../components/rituals/ui';
import { SUPPORT_EMAIL } from '../../../lib/community/model';
import { HELP, searchHelp, type HelpTopic } from '../../../lib/help';
import { replayWelcomeTour } from '../../../lib/welcomeTour';
import { colors, type } from '../../../theme';

// How to: a plain guide to everything in the app, by where it lives, with search.
export default function Help() {
  const [query, setQuery] = useState('');
  const found = useMemo(() => searchHelp(query), [query]);
  const searching = query.trim().length > 0;

  return (
    <MoreScreen title="How to" eyebrow="Help" back="/more" backLabel="Back to More">
      <Field
        label="Search the guide"
        placeholder="e.g. carve a candle, birth chart, backup"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {searching ? (
        <Section label={found.length ? `${found.length} ${found.length === 1 ? 'answer' : 'answers'}` : 'Nothing found'}>
          {found.length === 0 && <Text style={type.caption}>Try fewer or different words, or browse the sections below once you clear the search.</Text>}
          {found.map(({ topic, section }) => (
            <Expander key={topic.id} title={topic.title}>
              <Text style={[type.caption, styles.where]}>{section.title}</Text>
              <TopicBody topic={topic} />
            </Expander>
          ))}
        </Section>
      ) : (
        <>
          <View style={styles.row}>
            <Button label="Watch the welcome tour again" variant="pill" onPress={() => void replayWelcomeTour()} />
          </View>
          {HELP.map((section) => (
            <Section key={section.id} label={section.title}>
              <Text style={type.caption}>{section.intro}</Text>
              {section.topics.map((topic) => (
                <Expander key={topic.id} title={topic.title}>
                  <TopicBody topic={topic} />
                </Expander>
              ))}
            </Section>
          ))}
        </>
      )}

      <Card>
        <Text style={type.cardTitle}>Still stuck?</Text>
        <Text style={type.body}>Write to us and we’ll help, and improve this guide.</Text>
        <View style={styles.row}>
          <Button label="Email us" variant="outline" onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Help with the app')}`)} />
        </View>
      </Card>
    </MoreScreen>
  );
}

function TopicBody({ topic }: { topic: HelpTopic }) {
  return (
    <View style={styles.body}>
      <Text style={type.body}>{topic.summary}</Text>
      {topic.steps.map((step, i) => (
        <View key={i} style={styles.step}>
          <Text style={[type.body, styles.number]}>{i + 1}.</Text>
          <Text style={[type.body, styles.stepText]}>{step}</Text>
        </View>
      ))}
      {topic.tips?.map((tip, i) => (
        <Text key={`t${i}`} style={type.caption}>
          {tip}
        </Text>
      ))}
      {topic.href && (
        <View style={styles.row}>
          <Button label="Take me there" variant="pill" onPress={() => router.push(topic.href as Href)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: 8 },
  step: { flexDirection: 'row', gap: 8 },
  number: { color: colors.gold, minWidth: 18 },
  stepText: { flex: 1 },
  where: { color: colors.gold },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
