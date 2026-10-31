import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../../components/rituals/ui';
import { partLibraryId, SEASONS, seasonAt, SIMMER_SAFETY, simmerDraft, suggestSimmer, type Season, type SimmerPot } from '../../../../../lib/craft/kitchen/simmer';
import { ritualsLibraryHref } from '../../../../../lib/library';
import { usePlace } from '../../../../../lib/location';
import { INTENTIONS, intentionByKey } from '../../../../../lib/rituals/planner';
import { startRitual, useRituals } from '../../../../../lib/rituals/store';
import { seasonCounting } from '../../../../../lib/seasons';
import { useMySettings } from '../../../../../lib/settings/store';
import { colors, type } from '../../../../../theme';

export default function SimmerPotScreen() {
  const params = useLocalSearchParams<{ intention?: string }>();
  const place = usePlace();
  // Counted as chosen in Settings → Location & hemisphere (lib/seasons.ts).
  const { settings } = useMySettings();
  const counting = seasonCounting(settings);
  const guess = useMemo(() => seasonAt(new Date(), place?.latitude, counting), [place?.latitude, counting]);
  const [intention, setIntention] = useState<string>(intentionByKey(params.intention)?.key ?? 'peace');
  const [picked, setPicked] = useState<Season | null>(null);
  const season = picked ?? guess.season;
  const pots = useMemo(() => suggestSimmer(intention, season), [intention, season]);
  const label = intentionByKey(intention)?.label ?? 'Peace & rest';
  const rituals = useRituals();
  const [busy, setBusy] = useState<string | null>(null);

  const begin = async (pot: SimmerPot) => {
    setBusy(pot.id);
    try {
      await startRitual({ kind: 'draft', draft: simmerDraft(pot, intention, label) });
      router.replace('/rituals/run');
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <RitualScreen back="Kitchen & hearth">
      <Title eyebrow="Kitchen & hearth">Simmer pot</Title>
      <Body muted>
        A pan of water, peel, spice and herbs kept barely simmering to scent and bless the house. Choose what it’s for and the season, and use
        what’s in the cupboard.
      </Body>

      <Card>
        <Text style={type.eyebrow}>What’s it for?</Text>
        <Chips>
          {INTENTIONS.map((i) => (
            <Chip key={i.key} label={i.label} selected={intention === i.key} onPress={() => setIntention(i.key)} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Season</Text>
        <Chips>
          {SEASONS.map((s) => (
            <Chip key={s.key} label={s.label} selected={season === s.key} onPress={() => setPicked(s.key)} />
          ))}
        </Chips>
        {guess.assumed ? (
          <View style={ui.gapSmall}>
            <Body muted>No place is saved, so the season assumes the northern hemisphere. Pick another above, or set your place.</Body>
            <Button label="Set my place" variant="outline" onPress={() => router.push('/today/sky' as Href)} />
          </View>
        ) : (
          !picked && <Body muted>{`It’s ${guess.season} where you are (${guess.hemisphere === 'south' ? 'southern' : 'northern'} hemisphere).`}</Body>
        )}
      </Card>

      <View style={ui.gap}>
        <SectionLabel>{`For ${label.toLowerCase()} in ${season}`}</SectionLabel>
        {pots.map((pot) => (
          <Card key={pot.id}>
            <Text style={type.cardTitle} accessibilityRole="header">
              {pot.name}
            </Text>
            <Body muted>{pot.why}</Body>
            <View style={styles.parts}>
              {pot.parts.map((part, i) => {
                const id = partLibraryId(part);
                const text = `• ${part.amount} ${part.name}${part.optional ? ' (optional)' : ''}`;
                return id ? (
                  <Pressable
                    key={`${part.name}-${i}`}
                    accessibilityRole="link"
                    accessibilityLabel={`${part.amount} ${part.name}. Open in the Library`}
                    onPress={() => router.push(ritualsLibraryHref({ id }))}
                    style={styles.partLink}
                  >
                    <Text style={[styles.part, styles.link]}>{text}</Text>
                  </Pressable>
                ) : (
                  <Text key={`${part.name}-${i}`} style={styles.part}>
                    {text}
                  </Text>
                );
              })}
            </View>
            <Body muted>A medium pan two-thirds full of water. Bring to the boil, then down to the lowest simmer.</Body>
            <Button
              label={busy === pot.id ? 'Beginning…' : 'Begin as a ritual'}
              disabled={!!busy || !!rituals.active}
              accessibilityHint="Starts a short guided working for this pot"
              onPress={() => begin(pot)}
            />
          </Card>
        ))}
        {!!rituals.active && <Body muted>Finish the ritual that’s under way before beginning another.</Body>}
      </View>

      <Card accent>
        <SectionLabel>At the stove</SectionLabel>
        {SIMMER_SAFETY.map((line) => (
          <Body key={line}>{`• ${line}`}</Body>
        ))}
      </Card>
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  parts: { gap: 2 },
  part: { ...type.body, color: colors.cream },
  partLink: { minHeight: 44, justifyContent: 'center' },
  link: { color: colors.gold, textDecorationLine: 'underline' },
});
