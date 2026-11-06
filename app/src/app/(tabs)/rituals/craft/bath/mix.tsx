import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { AfterwardsCard, go, IngredientList, SafetyCard, ShelfCard, TendCard, timingHref } from '../../../../../components/craft/BathParts';
import { Body, Card, confirmAction, RitualScreen, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { BATH_HOME, BATH_OWN, methodOf, normalizeMix } from '../../../../../lib/craft/bath/bath';
import { mixById } from '../../../../../lib/craft/bath/mixes';
import { addEntry, removeEntry, useCraft } from '../../../../../lib/craft/store';
import { type } from '../../../../../theme';

export default function BathMixScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries, ready } = useCraft<unknown>(BATH_OWN);
  const mix = useMemo(() => {
    const premade = mixById(id);
    if (premade) return premade;
    const e = entries.find((x) => x.id === id);
    return e ? normalizeMix(e.data, e.id) : null;
  }, [id, entries]);

  if (!mix) {
    return (
      <RitualScreen back="Bath & body">
        <Title>A bath mix</Title>
        <Body>{ready ? 'This mix couldn’t be found.' : 'Opening…'}</Body>
        <Button label="All the mixes" variant="text" onPress={go(BATH_HOME)} />
      </RitualScreen>
    );
  }
  const method = methodOf(mix.method);
  const copy = async () => {
    const entry = await addEntry(BATH_OWN, { ...mix, title: `${mix.title} (my version)`, own: true });
    router.replace(`${BATH_HOME}/mix?id=${encodeURIComponent(entry.id)}` as Href);
  };
  const remove = async () => {
    if (!(await confirmAction('Delete this mix?', 'It will be removed from every device. Baths you logged stay in your Journal.', 'Delete'))) return;
    await removeEntry(BATH_OWN, mix.id);
    router.replace(BATH_HOME as Href);
  };

  return (
    <RitualScreen back="Bath & body">
      <Title eyebrow={mix.own ? 'Your mix' : 'Bath mix'}>{mix.title}</Title>
      <Body>{mix.intention}</Body>
      <Body muted>{[`About ${mix.minutes} minutes`, mix.candle ? `Candle: ${mix.candle.toLowerCase()}` : null, method.label].filter(Boolean).join(' · ')}</Body>

      <SafetyCard ingredients={mix.ingredients} method={mix.method} />

      <View style={ui.gapSmall}>
        <SectionLabel>Ingredients</SectionLabel>
        <IngredientList ingredients={mix.ingredients} />
        <Body muted>Tap one with a Library page to read about it. Stones: only the ones marked water-safe may go in the water.</Body>
      </View>

      <Card>
        <SectionLabel>Preparing it</SectionLabel>
        <Text style={type.cardTitle}>{method.label}</Text>
        {method.steps.map((s, i) => (
          <Body key={s}>{`${i + 1}. ${s}`}</Body>
        ))}
        <Body muted>{mix.prep}</Body>
      </Card>

      <Card>
        <SectionLabel>Best timing</SectionLabel>
        <Body>{`Moon: ${mix.when.moon}.`}</Body>
        <Body>{`Day: ${mix.when.day}.`}</Body>
        <Body>{`Hour: ${mix.when.hour}.`}</Body>
        <Button label="Find a good time" variant="outline" accessibilityHint="Opens the spell timing advisor for this intention" onPress={go(timingHref(mix))} />
      </Card>

      <Card accent>
        <SectionLabel>Words to speak</SectionLabel>
        <Text style={type.body}>{mix.words}</Text>
        <Body muted>Say them aloud or in your head, in your own words if you prefer.</Body>
      </Card>

      <AfterwardsCard mix={mix} />

      {!!mix.note && <Body muted>{mix.note}</Body>}

      <ShelfCard mix={mix} />
      <TendCard mix={mix} />

      <View style={ui.gapSmall}>
        <Button label="Log this bath" onPress={go(`${BATH_HOME}/log?mix=${encodeURIComponent(mix.id)}`)} accessibilityHint="Record how it felt and what you noticed, in your Journal" />
        <Button label="Make it a spell" variant="outline" accessibilityHint="Opens the spell builder with a bath for this intention" onPress={() => router.push({ pathname: '/rituals/spell', params: { method: 'bath', intent: mix.intent } } as Href)} />
        {!mix.own && <Button label="Make my own version" variant="text" onPress={() => void copy()} />}
        {mix.own && <Button label="Delete this mix" variant="text" onPress={() => void remove()} />}
      </View>
    </RitualScreen>
  );
}
