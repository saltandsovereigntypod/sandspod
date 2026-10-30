import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExplainCard, LevelSwitch, openTerm, TermText, useExplainLevel } from '../../../../../components/astro/Explain';
import { Body, Expander, Field, RitualScreen, Title, ui } from '../../../../../components/rituals/ui';
import { CATEGORY_LABEL, CATEGORY_ORDER, searchTerms, term, termsIn } from '../../../../../lib/astro/glossary';
import { colors, fonts, radius, type } from '../../../../../theme';

// Learn astrology: every term the app uses, from the basics up, each with a
// Simple and a Detailed explanation. Searchable; a term can be opened from
// a link (?term=…).
export default function Learn() {
  const params = useLocalSearchParams<{ term?: string }>();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useExplainLevel();
  const focus = params.term ? term(params.term) : null;
  const found = useMemo(() => searchTerms(query).slice(0, 20), [query]);

  return (
    <RitualScreen back="Cosmic & celestial">
      <Title eyebrow="Cosmic & celestial">Learn astrology</Title>
      <TermText
        style={type.body}
        text="Everything in a birth chart, explained from the beginning. Start with The basics, then the planets, signs and houses; every underlined word anywhere in the app opens its own explanation."
      />
      <Body muted>Simple gives a sentence or two. Detailed adds the astronomy, the history, how different traditions read it, its use in the craft, and what to take care over.</Body>
      <LevelSwitch value={level} onChange={setLevel} label="Explanations everywhere" />
      <Field label="Search" value={query} onChange={setQuery} placeholder="e.g. retrograde, Placidus, Scorpio" />

      {focus && !query && <ExplainCard eyebrow={CATEGORY_LABEL[focus.category]} title={`${focus.symbol ? `${focus.symbol} ` : ''}${focus.term}`} entry={focus} terms={focus.related} />}

      {query.trim() ? (
        <View style={ui.gapSmall}>
          {found.length === 0 && <Body muted>Nothing by that name yet.</Body>}
          {found.map((e) => (
            <TermRow key={e.id} id={e.id} />
          ))}
        </View>
      ) : (
        CATEGORY_ORDER.map((c, i) => (
          <Expander key={c} title={CATEGORY_LABEL[c]} initiallyOpen={i === 0 && !focus}>
            {termsIn(c).map((e) => (
              <TermRow key={e.id} id={e.id} />
            ))}
          </Expander>
        ))
      )}

      <Pressable accessibilityRole="link" onPress={() => router.push('/rituals/craft/cosmic/charts')} style={styles.link}>
        <Text style={styles.linkText}>See it all in your own chart ›</Text>
      </Pressable>
      <Body muted>These are traditional meanings and tools for reflection, not destiny. Astrology has many schools; where they differ, the Detailed explanations say so.</Body>
    </RitualScreen>
  );
}

function TermRow({ id }: { id: string }) {
  const e = term(id)!;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${e.term}. ${e.simple}`} onPress={() => openTerm(id)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Text style={styles.symbol}>{e.symbol ?? '✦'}</Text>
      <View style={styles.flex}>
        <Text style={styles.name}>{e.term}</Text>
        <Text style={type.caption} numberOfLines={2}>
          {e.simple}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.surfaceRaised, borderRadius: radius.tile },
  symbol: { width: 28, fontSize: 18, color: colors.gold, textAlign: 'center' },
  name: { fontFamily: fonts.display, fontSize: 19, color: colors.cream },
  flex: { flex: 1 },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
});
