import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Expander, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../../components/rituals/ui';
import { useAltars } from '../../../../../lib/altar/store';
import {
  ALL_FOUR_PREMADE,
  balanceOf,
  dayElement,
  ELEMENT_GUIDES,
  ELEMENTS,
  gatherUses,
  isBalanced,
  leastUsed,
  type Element,
} from '../../../../../lib/craft/elemental/balance';
import { ritualsLibraryHref } from '../../../../../lib/library';
import { premadeById, premadeDraft } from '../../../../../lib/rituals/premade';
import { startRitual, useRituals } from '../../../../../lib/rituals/store';
import { colors, fonts, radius, type } from '../../../../../theme';

export default function ElementsInYourWork() {
  const { altars } = useAltars();
  const rituals = useRituals();
  const [busy, setBusy] = useState(false);

  const uses = useMemo(
    () => gatherUses({ altars, links: rituals.links, templates: rituals.templates, journal: rituals.journal }),
    [altars, rituals.links, rituals.templates, rituals.journal],
  );
  const balance = useMemo(() => balanceOf(uses), [uses]);
  const low = leastUsed(balance);
  const even = isBalanced(balance);
  const today = dayElement(new Date());
  const from = {
    altar: uses.filter((u) => u.source === 'altar').length,
    ritual: uses.filter((u) => u.source === 'ritual').length,
    template: uses.filter((u) => u.source === 'template').length,
  };

  const begin = async (premadeId: string) => {
    const premade = premadeById(premadeId);
    if (!premade) return;
    setBusy(true);
    try {
      await startRitual({ kind: 'draft', draft: premadeDraft(premade) });
      router.replace('/rituals/run');
    } catch (e) {
      tell('Couldn’t begin', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const suggest = (element: Element, why: string) => {
    const guide = ELEMENT_GUIDES[element];
    const premade = premadeById(guide.premadeId);
    return (
      <Card accent>
        <SectionLabel>{why}</SectionLabel>
        <Text style={type.cardTitle}>{`Bring in ${element.toLowerCase()}`}</Text>
        <Body>{guide.invite}</Body>
        <Body muted>{guide.small}</Body>
        <Chips>
          {guide.examples.map((ex) => (
            <Chip key={ex.id} label={ex.name} hint="Opens its Living Library page" onPress={() => router.push(ritualsLibraryHref({ id: ex.id }))} />
          ))}
        </Chips>
        {premade && (
          <View style={ui.actions}>
            <Button label={busy ? 'Beginning…' : `Begin ${premade.title}`} disabled={busy} onPress={() => void begin(premade.id)} />
            <Button label="Read it first" variant="outline" onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: premade.id } })} />
          </View>
        )}
      </Card>
    );
  };

  return (
    <RitualScreen back="Elemental">
      <Title eyebrow="Earth, air, fire and water">Elements in your work</Title>

      {balance.total === 0 ? (
        <>
          <Card>
            <SectionLabel>Nothing to read yet</SectionLabel>
            <Body>
              This reads the element of each herb, stone, candle colour and tool you place on your altars, and of the Living Library ingredients in your rituals and
              templates. Once there are a few, you’ll see which elements you lean on and which you leave out.
            </Body>
            <Body muted>Objects of your own, deities and plain vessels have no element in the Library, so they aren’t counted.</Body>
          </Card>
          {suggest(today.element, `Today’s element: ${today.planet === 'Sun' || today.planet === 'Moon' ? `the ${today.planet}` : today.planet} rules the day`)}
        </>
      ) : (
        <>
          <Card>
            <SectionLabel>Your balance</SectionLabel>
            {ELEMENTS.map((e) => (
              <Bar key={e} element={e} count={balance.counts[e]} share={balance.share[e]} max={Math.max(...ELEMENTS.map((x) => balance.share[x]))} names={balance.top[e]} low={!even && e === low} />
            ))}
            <Body muted>
              {[
                from.altar ? `${from.altar} on your altars` : null,
                from.ritual ? `${from.ritual} in rituals you’ve done` : null,
                from.template ? `${from.template} in your templates` : null,
              ]
                .filter(Boolean)
                .join(', ')}
              {balance.spirit ? `. ${balance.spirit} more belong to spirit, the fifth, and sit outside the four.` : '.'}
            </Body>
          </Card>

          {even ? (
            <Card accent>
              <SectionLabel>In balance</SectionLabel>
              <Text style={type.cardTitle}>All four are with you</Text>
              <Body>No element is far behind the others in your work. A rite that honours all four together keeps it so.</Body>
              <Button label="Read the balancing rite" variant="outline" onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: ALL_FOUR_PREMADE } })} />
            </Card>
          ) : (
            low && suggest(low, 'The quietest element')
          )}

          {balance.total < 8 && <Body muted>This is drawn from only a few things so far; it grows truer the more you record.</Body>}

          <Expander title="How this is worked out">
            <Body>
              Each object on your saved altars counts once, and so does each Living Library ingredient on your journal entries and active templates. Its element is the one
              the Living Library gives it.
            </Body>
            <Body muted>
              Lean is not wrong: many practitioners work mostly with one element on purpose. This is only a mirror, for when you want all four in your practice.
            </Body>
          </Expander>
        </>
      )}
    </RitualScreen>
  );
}

function Bar({ element, count, share, max, names, low }: { element: Element; count: number; share: number; max: number; names: string[]; low: boolean }) {
  const pct = Math.round(share * 100);
  const width = max > 0 ? Math.max(share / max, count ? 0.04 : 0) : 0;
  return (
    <View accessible accessibilityLabel={`${element}: ${count}, ${pct} percent.${names.length ? ` Mostly ${names.join(', ')}.` : ''}${low ? ' The least used.' : ''}`} style={styles.bar}>
      <View style={styles.barHead}>
        <Text style={[styles.barName, low && styles.gold]}>{element}</Text>
        <Text style={type.caption}>{`${count} · ${pct}%`}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${width * 100}%` }, low && styles.fillLow]} />
      </View>
      {names.length > 0 && <Text style={type.caption}>{names.join(', ')}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { gap: 4 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  barName: { fontFamily: fonts.display, fontSize: 20, color: colors.cream },
  gold: { color: colors.gold },
  track: { height: 10, borderRadius: radius.chip, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: 10, borderRadius: radius.chip, backgroundColor: colors.fern },
  fillLow: { backgroundColor: colors.gold },
});
