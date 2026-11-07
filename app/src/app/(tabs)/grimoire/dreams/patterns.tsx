import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DreamShell } from '../../../../components/grimoire/dreams';
import { Body, Card, Chip, Chips, Expander, Field, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { shortDate } from '../../../../lib/calendar';
import { DREAMS, dreamStats, normalizeDream, phaseClusterNote, phaseCounts, symbolCounts } from '../../../../lib/craft/hedge/dreams';
import { normalizeReading, READINGS } from '../../../../lib/craft/hedge/readings';
import { useCraft } from '../../../../lib/craft/store';
import { dreamReadingDraws } from '../../../../lib/divination/linked';
import { DREAM_ROUTES } from '../../../../lib/grimoire/dreams';
import { ALL_SYMBOLS, cameTrueRate, dreamPatterns, questionsOf } from '../../../../lib/dreams/reader';
import { useDictionary } from '../../../../lib/dreams/store';
import { dateFromKey } from '../../../../lib/rituals/lifecycle';
import { colors, fonts, type } from '../../../../theme';

// The one Patterns page for your dreams: what keeps returning, the moons you
// dream under, this month's symbols and pairings, what came true, and the
// dream dictionary the reader uses (the old "Symbols and moons" page and its
// shorter symbol list are folded in here; /grimoire/dreams/symbols redirects).
export default function DreamPatterns() {
  const { entries: dictionary } = useDictionary();
  const [query, setQuery] = useState('');
  const { entries } = useCraft<unknown>(DREAMS);
  const { entries: readingEntries } = useCraft<unknown>(READINGS);
  const cards = useMemo(() => dreamReadingDraws(readingEntries.map((e) => ({ ...e, data: normalizeReading(e.data) }))), [readingEntries]);
  const dreams = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const symbols = useMemo(() => symbolCounts(dreams).slice(0, 15), [dreams]);
  const phases = useMemo(() => phaseCounts(dreams), [dreams]);
  const stats = dreamStats(dreams);
  const note = phaseClusterNote(dreams);
  const most = Math.max(1, ...phases.map((p) => p.count));
  const patterns = useMemo(
    () => dreamPatterns(dreams.map((d) => ({ id: d.id, date: d.data.date, text: `${d.data.title}. ${d.data.dream}`, moonPhase: d.data.moonPhase })), new Date(), dictionary),
    [dreams, dictionary],
  );
  const rate = cameTrueRate(dreams.map((d) => d.data));
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_SYMBOLS.slice(0, 12);
    return ALL_SYMBOLS.filter((s) => s.name.toLowerCase().includes(q) || s.words.some((w) => w.includes(q))).slice(0, 30);
  }, [query]);

  return (
    <DreamShell back={DREAM_ROUTES.journal as Href}>
      <Title eyebrow="Your dreams">Patterns</Title>

      {dreams.length >= 2 && (
        <>
          {patterns.lines.length > 0 ? (
            <Card>
              {patterns.lines.map((l) => (
                <Body key={l}>{l}</Body>
              ))}
            </Card>
          ) : (
            <Body muted>Nothing has come up more than once this month yet.</Body>
          )}
          {patterns.symbols.length > 0 && (
            <Card>
              <SectionLabel>This month</SectionLabel>
              {patterns.symbols.slice(0, 10).map((s) => (
                <Body key={s.key}>{`${s.name} · ${s.count}`}</Body>
              ))}
            </Card>
          )}
          {patterns.pairings.length > 0 && (
            <Card>
              <SectionLabel>Often together</SectionLabel>
              {patterns.pairings.map((p) => (
                <Body key={`${p.a}|${p.b}`}>{`${p.a} and ${p.b} · ${p.count} dreams`}</Body>
              ))}
            </Card>
          )}
          <Card>
            <SectionLabel>Came true</SectionLabel>
            <Body>{rate.line}</Body>
          </Card>
        </>
      )}
      {dreams.length < 2 && <Body muted>Patterns appear once you have written a few dreams.</Body>}

      {stats.total > 0 && (
        <Card>
          <Body>
            {[
              `${stats.total} ${stats.total === 1 ? 'dream' : 'dreams'}`,
              stats.lucid ? `${stats.lucid} lucid` : null,
              stats.recurring ? `${stats.recurring} recurring` : null,
              stats.vividness ? `vividness ${stats.vividness} on average` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Body>
        </Card>
      )}

      {symbols.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>What keeps returning</SectionLabel>
          <Chips label="What keeps returning">
            {symbols.map((s) => {
              const last = dateFromKey(s.last);
              return (
                <Chip
                  key={s.symbol}
                  label={`${s.symbol} · ${s.count}`}
                  a11yLabel={`${s.symbol}, in ${s.count} ${s.count === 1 ? 'dream' : 'dreams'}${last ? `, last on ${shortDate(last)}` : ''}`}
                />
              );
            })}
          </Chips>
        </View>
      )}

      {stats.total > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>The moons you dream under</SectionLabel>
          <Card>
            {phases.map((p) => (
              <View key={p.phase} style={styles.bar} accessible accessibilityLabel={`${p.phase}: ${p.count}`}>
                <Text style={styles.barLabel}>{p.phase}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(p.count / most) * 100}%` }]} />
                </View>
                <Text style={[type.caption, styles.count]}>{p.count}</Text>
              </View>
            ))}
          </Card>
          {note ? (
            <Body muted>{`${note} The crescents and gibbous moons last about a week each and the four main phases only a day or so, so that’s taken into account.`}</Body>
          ) : (
            <Body muted>After a few more dreams you’ll see whether they gather around a phase.</Body>
          )}
        </View>
      )}

      {cards.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Cards that keep coming up</SectionLabel>
          <Body muted>Across the readings of your dreams (Read this dream, on a dream’s page).</Body>
          <Chips label="Cards that keep coming up">
            {cards.map((c) => (
              <Chip key={c.name} label={`${c.name} · ${c.count}`} a11yLabel={`${c.name}, in ${c.count} dream readings`} />
            ))}
          </Chips>
        </View>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>The dream dictionary</SectionLabel>
        <Body muted>Starting points, not answers: what people have often taken these to mean. Begin with what the thing means to you and how the dream felt. Your own meanings, kept in your dream dictionary, come first in every reading.</Body>
        <Field label="Find a symbol" value={query} onChange={setQuery} placeholder="Water, teeth, a house…" />
        {shown.map((s) => {
          const qs = questionsOf(s);
          return (
            <Expander key={s.id} title={s.name}>
              <Body>{s.psyche}</Body>
              <Body muted>{s.folk}</Body>
              {qs.length > 0 && <Body muted>{`Ask yourself: ${qs[0]}`}</Body>}
            </Expander>
          );
        })}
        {!query.trim() && <Body muted>{`${ALL_SYMBOLS.length} symbols in all: search for the one you dreamed of.`}</Body>}
        <Chips label="Your dream dictionary">
          <Chip label="Your own meanings" onPress={() => router.push(DREAM_ROUTES.dictionary as Href)} />
        </Chips>
      </View>
    </DreamShell>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 124, fontFamily: fonts.body, fontSize: 13, color: colors.parchment },
  track: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.gold },
  count: { width: 24, textAlign: 'right' },
});
