import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Body, Card, Chip, Chips, Expander, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../components/rituals/ui';
import { adviseTiming, scoreWord, windowWhen } from '../../../lib/craft/cosmic/timing';
import { CORRESPONDENCES, type MyCorrespondence } from '../../../lib/craft/eclectic/correspondences';
import { useCraft } from '../../../lib/craft/store';
import { ritualsLibraryHref } from '../../../lib/library';
import {
  builderParams,
  FINDER_COLOURS,
  FINDER_PLANETS,
  FINDER_TIDES,
  FINDER_TYPES,
  findCorrespondences,
  pairingsOf,
  suggestedTiming,
  type FinderHit,
  type FinderQuery,
} from '../../../lib/rituals/spellcraft/finder';
import { SPELL_INTENTS, spellIntent, TIDE_LABELS, WEEKDAY_OF } from '../../../lib/rituals/spellcraft/suggest';
import type { MoonTide } from '../../../lib/rituals/planner';
import { type } from '../../../theme';

const entryIdOf = (ref: string) => ref.replace(/\//g, ':');

// The correspondence finder: an intention, or a herb, stone, colour, planet,
// day or moon, and what the Living Library and your own correspondences hold
// for it. "Build a spell" opens the spell builder with what you chose.
export default function CorrespondenceFinder() {
  const params = useLocalSearchParams<{ intent?: string; moon?: string; planet?: string; q?: string }>();
  const { entries: mine } = useCraft<MyCorrespondence>(CORRESPONDENCES);
  const [query, setQuery] = useState<FinderQuery>(() => ({
    intent: spellIntent(params.intent)?.key ?? null,
    moon: FINDER_TIDES.includes(params.moon as MoonTide) ? (params.moon as MoonTide) : null,
    planet: params.planet && WEEKDAY_OF[params.planet] ? params.planet : null,
    text: params.q ?? '',
  }));
  const [chosen, setChosen] = useState<FinderHit[]>([]);
  const [own, setOwn] = useState<string[]>([]);

  const set = (patch: Partial<FinderQuery>) => setQuery((q) => ({ ...q, ...patch }));
  const result = useMemo(() => findCorrespondences(query, { mine }), [query, mine]);
  const timing = useMemo(() => suggestedTiming(query), [query]);
  const intent = spellIntent(timing.intent);
  const next = useMemo(() => (intent ? adviseTiming(intent, { from: new Date(), days: 7, count: 1 }).windows[0] ?? null : null), [intent]);

  const has = (hit: FinderHit) => chosen.some((c) => c.ref === hit.ref);
  const toggle = (hit: FinderHit) => setChosen((list) => (list.some((c) => c.ref === hit.ref) ? list.filter((c) => c.ref !== hit.ref) : [...list, hit]));
  const toggleOwn = (name: string) => setOwn((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));
  const pairs = [...new Set(chosen.flatMap((c) => pairingsOf(mine, entryIdOf(c.ref))))].filter((n) => !own.includes(n));

  const build = () => router.push({ pathname: '/rituals/spell', params: builderParams(chosen, own, timing) } as Href);

  return (
    <RitualScreen back="Spell builder">
      <Title eyebrow="Spell builder">Correspondence finder</Title>
      <Body muted>Choose what the work is for, or look by a herb, stone, colour, planet, day or moon. Tap what suits you, then build a spell from it. These are traditional and modern correspondences, not rules.</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>What is it for?</SectionLabel>
        <Chips label="What is it for?">
          {SPELL_INTENTS.map((i) => (
            <Chip key={i.key} label={i.label} selected={query.intent === i.key} onPress={() => set({ intent: query.intent === i.key ? null : i.key })} />
          ))}
        </Chips>
      </View>
      <Field label="Or search" value={query.text ?? ''} onChange={(text) => set({ text })} placeholder="Rosemary, sleep, amethyst, a word of your own…" />

      <Expander title="By planet, day, colour or moon" initiallyOpen={!!(query.planet || query.day || query.colour || query.moon)}>
        <Text style={type.eyebrow}>Planet</Text>
        <Chips>
          {FINDER_PLANETS.map((p) => (
            <Chip key={p} label={p} selected={query.planet === p} onPress={() => set({ planet: query.planet === p ? null : p })} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Day</Text>
        <Chips>
          {FINDER_PLANETS.map((p) => WEEKDAY_OF[p]).map((d) => (
            <Chip key={d} label={d} selected={query.day === d} onPress={() => set({ day: query.day === d ? null : d })} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Colour</Text>
        <Chips>
          {FINDER_COLOURS.map((c) => (
            <Chip key={c} label={c} selected={query.colour === c} onPress={() => set({ colour: query.colour === c ? null : c })} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Moon</Text>
        <Chips>
          {FINDER_TIDES.map((t) => (
            <Chip key={t} label={TIDE_LABELS[t]} selected={query.moon === t} onPress={() => set({ moon: query.moon === t ? null : t })} />
          ))}
        </Chips>
      </Expander>

      {result.empty ? (
        <Body muted>Nothing asked yet. Choose an intention or type a word to begin.</Body>
      ) : (
        <>
          {FINDER_TYPES.map(({ type: t, label }) =>
            result[t].length ? (
              <View key={t} style={ui.gapSmall}>
                <SectionLabel>{label}</SectionLabel>
                <List>
                  {result[t].map((hit, i, all) => (
                    <Row
                      key={hit.ref}
                      icon={has(hit) ? 'chevron' : 'grimoire'}
                      title={has(hit) ? `${hit.name} · chosen` : hit.name}
                      detail={hit.danger ? `Not for spellwork: ${hit.caution}` : [hit.why || hit.uses, hit.mine.length ? `Yours: ${hit.mine.join('; ')}` : ''].filter(Boolean).join(' · ')}
                      label={`${hit.name}${has(hit) ? ', chosen' : ''}. ${hit.why || hit.uses}`}
                      last={i === all.length - 1}
                      onPress={() => (hit.danger ? router.push(ritualsLibraryHref({ id: entryIdOf(hit.ref) }) as Href) : toggle(hit))}
                    />
                  ))}
                </List>
              </View>
            ) : null,
          )}
          {result.mine.length > 0 && (
            <View style={ui.gapSmall}>
              <SectionLabel>From your own correspondences</SectionLabel>
              <Chips multiple label="From your own correspondences">
                {result.mine.map((m) => (
                  <Chip key={m.id} label={m.name} selected={own.includes(m.name)} a11yLabel={`${m.name}: ${m.meaning}`} onPress={() => toggleOwn(m.name)} />
                ))}
              </Chips>
            </View>
          )}
          {!FINDER_TYPES.some(({ type: t }) => result[t].length) && !result.mine.length && <Body muted>Nothing matches all of that. Clear a choice to see more.</Body>}
        </>
      )}

      {(chosen.length > 0 || own.length > 0) && (
        <Card accent>
          <SectionLabel>{`Chosen (${chosen.length + own.length})`}</SectionLabel>
          <Chips>
            {chosen.map((c) => (
              <Chip key={c.ref} label={c.name} selected onPress={() => toggle(c)} a11yLabel={`${c.name}, chosen. Tap to remove`} />
            ))}
            {own.map((n) => (
              <Chip key={n} label={n} selected onPress={() => toggleOwn(n)} a11yLabel={`${n}, chosen. Tap to remove`} />
            ))}
          </Chips>
          {pairs.length > 0 && (
            <>
              <Body muted>You pair these with:</Body>
              <Chips>
                {pairs.map((n) => (
                  <Chip key={n} label={`+ ${n}`} onPress={() => toggleOwn(n)} />
                ))}
              </Chips>
            </>
          )}
          <Body muted>
            {[
              intent ? `For ${intent.label.toLowerCase()}` : null,
              timing.moon ? TIDE_LABELS[timing.moon].toLowerCase() : null,
              timing.planet ? `${WEEKDAY_OF[timing.planet]} (${timing.planet})` : null,
            ]
              .filter(Boolean)
              .join(' · ') || 'Choose an intention to have a time suggested.'}
          </Body>
          {next && <Body muted>{`The timing advisor’s best time this week: ${windowWhen(next, new Date())}, ${scoreWord(next.score).toLowerCase()}.`}</Body>}
          <View style={ui.actions}>
            <Button label="Build a bath" variant="outline" accessibilityHint="Opens the bath builder with this intention, to choose herbs, stones and amounts" onPress={() => router.push({ pathname: '/rituals/craft/bath/build', params: intent ? { intent: intent.key } : {} } as Href)} />
            <Button label="Build a spell" onPress={build} accessibilityHint="Opens the spell builder with these chosen, and the suggested moon and day" />
            {intent && (
              <Button
                label="Find a good time"
                variant="outline"
                onPress={() => router.push({ pathname: '/rituals/craft/cosmic/timing', params: { intent: intent.key } } as Href)}
              />
            )}
          </View>
        </Card>
      )}

      <Button label="My correspondences" variant="text" accessibilityHint="Your own meanings and pairings, which the finder uses" onPress={() => router.push('/rituals/craft/eclectic/correspondences' as Href)} />
    </RitualScreen>
  );
}
