import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Bars, PHASE_LIGHT } from '../../../../components/charts/Bars';
import { Progress } from '../../../../components/cycle/ui';
import { Body, Card, Chip, Chips, Expander, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { fullDate } from '../../../../lib/calendar';
import { normalizeReading, READINGS } from '../../../../lib/craft/hedge/readings';
import { useCraft } from '../../../../lib/craft/store';
import { divinationReadingRoute, type DivinationRef } from '../../../../lib/divination/links';
import {
  cardCountLine,
  divinationPatterns,
  ELEMENTS_NOTE,
  isRange,
  LEARN,
  MIN_READINGS,
  patternLines,
  RANGES,
  readingsInRange,
  type PatternRange,
} from '../../../../lib/divination/patterns';

const openCard = (ref: DivinationRef | null, deck?: string | null) => {
  if (ref) router.push(divinationReadingRoute(ref, deck) as Href);
};

/**
 * Your patterns, from Craft → Divination: what your own draw log says over
 * time (lib/divination/patterns.ts). The website has the same page at
 * /divination/patterns/.
 */
export default function DivinationPatterns() {
  const params = useLocalSearchParams<{ range?: string }>();
  const { entries, ready } = useCraft<unknown>(READINGS);
  const [range, setRange] = useState<PatternRange>(isRange(params.range) ? params.range : 'all');
  const now = useMemo(() => new Date(), []);
  const all = useMemo(() => entries.map((e) => ({ ...e, data: normalizeReading(e.data) })), [entries]);
  const list = useMemo(() => readingsInRange(all, range, now), [all, range, now]);
  const p = useMemo(() => divinationPatterns(list, now), [list, now]);
  const lines = patternLines(p);
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  return (
    <RitualScreen back="Divination">
      <Title eyebrow="Divination">Your patterns</Title>
      <Body muted>What your own readings say over time: the cards that come most, where they lean, and the ones you haven’t met yet. Only you see this.</Body>
      <Chips>
        {RANGES.map((r) => (
          <Chip key={r.id} label={r.label} selected={range === r.id} onPress={() => setRange(r.id)} />
        ))}
      </Chips>

      {!ready ? (
        <Body muted>Opening…</Body>
      ) : p.readings < MIN_READINGS ? (
        <Card>
          <Body>
            {all.length < MIN_READINGS
              ? 'Draw or log a few readings and your patterns will gather here: the cards that keep coming, the suits and elements they lean to, the moons you draw under, and the cards you haven’t met yet.'
              : 'Not enough readings in this time to show patterns. Try a longer time.'}
          </Body>
          <Row icon="wheel" title="Draw a card for the day" last onPress={() => router.push({ pathname: '/rituals/divination/draw', params: { spread: 'daily' } })} />
        </Card>
      ) : (
        <>
          {lines.length > 0 && (
            <Card accent>
              {lines.map((line) => (
                <Body key={line}>{line}</Body>
              ))}
            </Card>
          )}

          <View style={ui.gapSmall}>
            <SectionLabel>Drawn most</SectionLabel>
            <Card>
              <Bars
                wideLabel
                unit={['time', 'times']}
                rows={p.top.map((c) => ({
                  key: c.name,
                  label: c.name,
                  count: c.count,
                  detail: [c.title, c.reversed ? `${c.reversed} reversed` : null, c.readings < c.count ? `in ${plural(c.readings, 'reading', 'readings')}` : null].filter(Boolean).join(' · ') || null,
                  onPress: c.ref ? () => openCard(c.ref, c.deck) : undefined,
                }))}
              />
              <Body muted>Tap a card for its page, in the deck you drew it with most.</Body>
            </Card>
          </View>

          {p.byMethod.length > 1 && (
            <View style={ui.gapSmall}>
              <SectionLabel>How you read</SectionLabel>
              <Card>
                <Bars unit={['reading', 'readings']} rows={p.byMethod.map((m) => ({ key: m.id, label: m.label, count: m.count }))} />
              </Card>
            </View>
          )}

          {p.tarotDecks.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Your tarot decks</SectionLabel>
              <Card>
                <Bars wideLabel unit={['reading', 'readings']} rows={p.tarotDecks.map((d) => ({ key: d.deck, label: d.label, count: d.count }))} />
                <Body muted>Each card’s page reads in the deck it was drawn with: Waite’s for the Rider–Waite–Smith, the Marseille’s and the Sola Busca’s own.</Body>
                <Row icon="wheel" title="Your decks and their meanings" last onPress={() => router.push('/rituals/divination/decks' as Href)} />
              </Card>
            </View>
          )}

          {p.balances.map((b) => (
            <View key={b.kind} style={ui.gapSmall}>
              <SectionLabel>{b.kind === 'tarot' ? 'Suits and elements' : b.kind === 'runes' ? 'The three aettir' : b.kind === 'ogham' ? 'The four aicmí' : 'Lenormand’s playing suits'}</SectionLabel>
              <Card>
                <Bars unit={['draw', 'draws']} wideLabel rows={b.bars.map((bar) => ({ key: bar.key, label: bar.label, note: bar.note, count: bar.count }))} />
                {!!b.line && <Body>{b.line}</Body>}
                {b.kind === 'tarot' && <Body muted>{ELEMENTS_NOTE}</Body>}
              </Card>
            </View>
          ))}

          {p.reversals && (
            <View style={ui.gapSmall}>
              <SectionLabel>Reversals</SectionLabel>
              <Card>
                <Progress done={p.reversals.share} label={`${p.reversals.reversed} of ${plural(p.reversals.reversible, 'tarot or oracle card', 'tarot and oracle cards')} came reversed (${Math.round(p.reversals.share * 100)}%)`} />
                <Body muted>Only draws with reversals turned on, and readings logged by hand that say “reversed”, can show here. Settings for the draw are on the draw page.</Body>
              </Card>
            </View>
          )}

          {p.themes.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Around your questions</SectionLabel>
              <Body muted>The cards that came more than once for a kind of question, by the words in it, or what you drew for.</Body>
              {p.themes.map((t) => (
                <Card key={t.key}>
                  <Body>{`${t.label} · ${plural(t.readings, 'reading', 'readings')}`}</Body>
                  {t.cards.length ? (
                    <Chips>
                      {t.cards.map((c) => (
                        <Chip key={c.name} label={`${c.name} · ${c.count}`} a11yLabel={`${c.name}, ${c.count} times. Opens its page`} onPress={c.ref ? () => openCard(c.ref) : undefined} />
                      ))}
                    </Chips>
                  ) : (
                    <Body muted>No card has come twice for these yet.</Body>
                  )}
                </Card>
              ))}
            </View>
          )}

          <View style={ui.gapSmall}>
            <SectionLabel>By the moon</SectionLabel>
            <Card>
              <Bars
                unit={['reading', 'readings']}
                rows={p.byPhase.map((r) => ({ key: r.phase, label: r.phase, count: r.readings, moon: PHASE_LIGHT[r.phase], detail: r.top ? `Most often: ${r.top}` : null }))}
              />
              <Row icon="today" title="The moon’s phases and what they’re for" last onPress={() => router.push({ pathname: '/today/holy/[ref]', params: { ref: 'moon-full' } })} />
            </Card>
          </View>

          <View style={ui.gapSmall}>
            <SectionLabel>By the day and its planet</SectionLabel>
            <Card>
              <Bars unit={['reading', 'readings']} rows={p.byDay.map((r) => ({ key: r.day, label: r.day, note: r.planet, count: r.readings, detail: r.top ? `Most often: ${r.top}` : null }))} />
              <Row icon="calendar" title="Timing by planet and moon" last onPress={() => router.push('/rituals/craft/cosmic/timing' as Href)} />
            </Card>
          </View>

          <View style={ui.gapSmall}>
            <SectionLabel>Streaks</SectionLabel>
            <Card>
              <Body>{p.streaks.current ? `${plural(p.streaks.current, 'day', 'days')} running, now.` : 'No streak running just now.'}</Body>
              <Body>{`Longest: ${plural(p.streaks.longest, 'day', 'days')}${p.streaks.longestEnd ? `, to ${fullDate(p.streaks.longestEnd) ?? p.streaks.longestEnd}` : ''}. ${plural(p.streaks.days, 'day', 'days')} with a reading in all.`}</Body>
              {p.streaks.card && (
                <Row
                  icon="wheel"
                  title={`${p.streaks.card.name} came ${p.streaks.card.run} readings in a row`}
                  detail="Its page"
                  last
                  onPress={() => openCard(p.streaks.card!.ref)}
                />
              )}
              <Body muted>A streak is for noticing, not for keeping up. A day without a draw is a day too.</Body>
            </Card>
          </View>

          {p.notMet.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>Cards you haven’t met yet</SectionLabel>
              {p.notMet.map((m) => (
                <Card key={m.kind}>
                  <Progress done={m.met / m.total} label={`${m.label}: ${m.met} of ${m.total} met`} />
                  {m.missing.length ? (
                    <Expander title={`${plural(m.missing.length, 'still to meet', 'still to meet')}`}>
                      <Chips>
                        {m.missing.map((c) => (
                          <Chip key={c.name} label={c.name} a11yLabel={`${c.name}. Opens its page`} onPress={() => openCard(c.ref)} />
                        ))}
                      </Chips>
                    </Expander>
                  ) : (
                    <Body>You’ve met every one.</Body>
                  )}
                  <Row icon="grimoire" title={LEARN[m.kind].label} last onPress={() => router.push(LEARN[m.kind].app as Href)} />
                </Card>
              ))}
            </View>
          )}

          <View style={ui.gapSmall}>
            <SectionLabel>Every card counted</SectionLabel>
            <Expander title={plural(p.all.length, 'card, rune or stave', 'cards, runes and staves')}>
              <List>
                {p.all
                  .filter((c) => c.ref)
                  .map((c, i, linked) => (
                    <Row key={c.name} icon="wheel" title={cardCountLine(c)} last={i === linked.length - 1} onPress={() => openCard(c.ref, c.deck)} />
                  ))}
              </List>
              {p.all.some((c) => !c.ref) && <Body muted>{`From your own decks: ${p.all.filter((c) => !c.ref).map(cardCountLine).join('; ')}.`}</Body>}
            </Expander>
          </View>
        </>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>Keep going</SectionLabel>
        <List>
          <Row icon="wheel" title="Draw cards, runes or ogham" onPress={() => router.push('/rituals/divination/draw' as Href)} />
          <Row icon="grimoire" title="Card meanings" detail="Tarot, runes, ogham, Lenormand and Kipper" onPress={() => router.push('/rituals/divination/meanings' as Href)} />
          <Row icon="grimoire" title="Your year in review" detail="The cards in it, beside your rituals, moons and dreams" onPress={() => router.push('/grimoire/year' as Href)} />
          <Row icon="more" title="How to: divination" last onPress={() => router.push('/more/help' as Href)} />
        </List>
      </View>
    </RitualScreen>
  );
}
