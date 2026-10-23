// The sigil maker: a statement of intent made into one mark, by the letter
// method (Spare's: strike out repeats, put the letters left together), on a
// planetary square (the kamea), or drawn by hand. Styled as ink on aged paper.
// Kept with your sigils (craft store `eclectic.sigils`, synced like the other
// practice tools), as its own Grimoire page, and from there carved into a
// candle on the altar. The website's twin is practice/eclectic/sigil.js (at /sigil/).

import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, Chip, Chips, confirmAction, Expander, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../rituals/ui';
import { addEntry, removeEntry, useCraft } from '../../lib/craft/store';
import { useGrimoire } from '../../lib/grimoire/store';
import type { Polyline } from '../../lib/sigil/geometry';
import { digitalRoot, letterValue, PLANETS, planetById, suggestPlanet, traceKamea, type PlanetId } from '../../lib/sigil/kamea';
import { letterArrangements, reduceStatement, type ArrangementId } from '../../lib/sigil/letters';
import {
  DEFAULT_WEIGHT,
  freehandPath,
  readSigil,
  sigilName,
  SIGILS,
  WEIGHTS,
  type KeptSigil,
  type Sigil,
  type SigilMethod,
} from '../../lib/sigil/sigil';
import { colors, fonts, radius, type } from '../../theme';
import { FreehandPad } from './FreehandPad';
import { KameaUnderlay, SigilPicture } from './SigilPicture';

const METHODS: { id: SigilMethod; label: string }[] = [
  { id: 'letters', label: 'From the letters' },
  { id: 'kamea', label: 'On a planetary square' },
  { id: 'freehand', label: 'Draw it yourself' },
];

type Props = {
  /** Where Back goes, in words. */
  back: string;
  eyebrow: string;
  /** Opened from the Grimoire: the section a new page goes in. */
  sectionId?: string | null;
  /** Opened from the Grimoire: saving there takes you to the page. */
  fromGrimoire?: boolean;
};

export function SigilMaker({ back, eyebrow, sectionId, fromGrimoire }: Props) {
  const { width } = useWindowDimensions();
  const pad = Math.max(220, Math.min(width - 40, 380));
  const grimoire = useGrimoire();
  const { entries } = useCraft<KeptSigil>(SIGILS);

  const [intent, setIntent] = useState('');
  const [dropVowels, setDropVowels] = useState(false);
  const [method, setMethod] = useState<SigilMethod>('letters');
  const [seed, setSeed] = useState(0);
  const [arrangement, setArrangement] = useState<ArrangementId>('woven');
  const [chosenPlanet, setPlanet] = useState<PlanetId | null>(null);
  const [strokes, setStrokes] = useState<Polyline[]>([]);
  const [weight, setWeight] = useState(DEFAULT_WEIGHT);
  const [ring, setRing] = useState(true);
  const [name, setName] = useState('');
  const [drawing, setDrawing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [savedPage, setSavedPage] = useState<string | null>(null);

  const reduction = useMemo(() => reduceStatement(intent, dropVowels), [intent, dropVowels]);
  const letters = reduction.kept;
  const options = useMemo(() => letterArrangements(letters, seed), [letters, seed]);
  const suggested = useMemo(() => suggestPlanet(letters), [letters]);
  const planet = chosenPlanet ?? suggested ?? 'saturn';
  const trace = useMemo(() => (method === 'kamea' ? traceKamea(letters, planet) : null), [method, letters, planet]);

  const d =
    method === 'letters'
      ? (options.find((o) => o.id === arrangement)?.d ?? '')
      : method === 'kamea'
        ? (trace?.d ?? '')
        : freehandPath(strokes, pad);

  const sigil: Sigil | null = useMemo(
    () =>
      readSigil({
        version: 1,
        method,
        intent: intent.trim(),
        letters,
        planet: method === 'kamea' ? planet : null,
        d,
        weight,
        ring,
      }),
    [method, intent, letters, planet, d, weight, ring],
  );
  const fallbackName = sigil ? sigilName(sigil) : 'My sigil';
  const total = [...letters].reduce((sum, ch) => sum + letterValue(ch), 0);

  const changed = () => {
    setNotice(null);
    setSavedPage(null);
  };

  const keep = async () => {
    if (!sigil) return;
    await addEntry<KeptSigil>(SIGILS, { name: name.trim() || fallbackName, sigil });
    setNotice('Kept with your sigils. To carve it into a candle, open a candle on your altar and choose Carve.');
  };

  const toGrimoire = (s: Sigil, title?: string) => {
    const pageId = grimoire.actions.saveSigilPage({ sigil: s, title, sectionId: fromGrimoire ? (sectionId ?? null) : undefined });
    if (!pageId) {
      setNotice('Your Grimoire hasn’t loaded yet. Open it once while online, then try again.');
      return;
    }
    if (fromGrimoire) {
      router.replace({ pathname: '/grimoire/[pageId]', params: { pageId } });
      return;
    }
    setSavedPage(pageId);
    setNotice('It has its own page in your Grimoire now, with room for how you charge it.');
  };

  const remove = async (id: string, label: string) => {
    if (await confirmAction('Let this sigil go?', `“${label}” will be removed from your sigils. Pages and candles it is already on keep it.`, 'Remove')) {
      await removeEntry(SIGILS, id);
    }
  };

  const kept = entries
    .map((e) => ({ id: e.id, name: e.data?.name || 'My sigil', sigil: readSigil(e.data?.sigil) }))
    .filter((k): k is { id: string; name: string; sigil: Sigil } => !!k.sigil);

  return (
    <RitualScreen back={back} scrollEnabled={!drawing}>
      <Title eyebrow={eyebrow}>Sigil maker</Title>
      <Body muted>
        A sigil is an intent folded into a single mark. You write what you want, take the words apart, and build a shape from what is left, so
        the mind can hold the wish without turning the words over and over.
      </Body>

      <View style={ui.gap}>
        <SectionLabel>Your statement of intent</SectionLabel>
        <Field
          label="What do you want?"
          value={intent}
          onChange={(text) => {
            setIntent(text);
            changed();
          }}
          placeholder="I sleep deeply and wake rested"
          multiline
        />
        <Body muted>Write it plainly, in the present and in the positive: “I sleep deeply”, not “I want to stop lying awake”.</Body>
        <Toggle
          label="Strike out the vowels too"
          detail="Fewer letters make a simpler mark."
          value={dropVowels}
          onChange={(v) => {
            setDropVowels(v);
            changed();
          }}
        />
        {letters ? (
          <Card>
            <Text style={type.eyebrow}>Letters left</Text>
            <Text style={styles.letters} accessibilityLabel={`Letters left: ${[...letters].join(', ')}`}>
              {[...letters].join(' ')}
            </Text>
            {!!reduction.dropped && <Text style={type.caption}>{`Struck out: ${[...reduction.dropped].join(' ')}`}</Text>}
          </Card>
        ) : (
          intent.trim().length > 0 && <Notice>Only the letters A to Z are used. Try writing it in those.</Notice>
        )}
      </View>

      <View style={ui.gap}>
        <SectionLabel>How to make it</SectionLabel>
        <Chips>
          {METHODS.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              selected={method === m.id}
              onPress={() => {
                setMethod(m.id);
                changed();
              }}
            />
          ))}
        </Chips>

        {method === 'letters' && (
          <>
            <Body muted>
              Austin Osman Spare’s way: lay the letters that are left over one another, turn or stack them, and let shared lines merge until it
              no longer reads as writing. Choose the one that feels right.
            </Body>
            {options.length > 0 ? (
              <>
                <View style={styles.options}>
                  {options.map((o) => {
                    const on = o.id === arrangement;
                    return (
                      <Pressable
                        key={o.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        accessibilityLabel={`${o.label}. ${o.detail}`}
                        onPress={() => {
                          setArrangement(o.id);
                          changed();
                        }}
                        style={({ pressed }) => [styles.option, on && styles.optionOn, pressed && styles.pressed]}
                      >
                        <SigilPicture sigil={{ d: o.d, weight, ring: false }} size={Math.floor((pad - 10) / 2) - 14} />
                        <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>{o.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Button
                  label="Show other arrangements"
                  variant="outline"
                  onPress={() => {
                    setSeed(seed + 1);
                    changed();
                  }}
                />
              </>
            ) : (
              <Body muted>Write your intent above to see the letters put together.</Body>
            )}
          </>
        )}

        {method === 'kamea' && (
          <>
            <Body muted>
              {'The older, ceremonial way. Each of the seven planets has a magic square of numbers. Every letter becomes its number in the alphabet, A 1 to Z 26; where the square is too small for a number, its digits are added together until it fits. The sigil is the line traced from number to number across the square, with a small circle where it begins and a bar where it ends. Choose the planet whose nature suits the working.'}
            </Body>
            <Chips>
              {PLANETS.map((p) => (
                <Chip
                  key={p.id}
                  label={`${p.name} ${p.size}×${p.size}`}
                  selected={planet === p.id}
                  a11yLabel={`${p.name}, ${p.size} by ${p.size}: ${p.suits}`}
                  onPress={() => {
                    setPlanet(p.id);
                    changed();
                  }}
                />
              ))}
            </Chips>
            <Body muted>{`${planetById(planet)?.name}: ${planetById(planet)?.suits}. Its day is ${planetById(planet)?.day}.`}</Body>
            {suggested && letters && (
              <Body muted>{`In numerology your letters add up to ${total}, which comes down to ${digitalRoot(total)}, a number given to ${planetById(suggested)?.name}.`}</Body>
            )}
          </>
        )}

        {method === 'freehand' && (
          <>
            <Body muted>
              Put the letters together yourself. Draw them over one another, shrink some, turn others, let them go wherever your hand wants, until
              it is a shape and not a word. The letters left are above to guide you.
            </Body>
            <View style={styles.center}>
              <FreehandPad
                size={pad}
                strokes={strokes}
                onChange={(next) => {
                  setStrokes(next);
                  changed();
                }}
                onDrawing={setDrawing}
                weight={weight}
                ring={ring}
              />
            </View>
            <View style={styles.row}>
              <Button label="Undo last stroke" variant="outline" disabled={!strokes.length} onPress={() => setStrokes(strokes.slice(0, -1))} />
              <Button label="Clear" variant="text" disabled={!strokes.length} onPress={() => setStrokes([])} />
            </View>
          </>
        )}
      </View>

      <View style={ui.gap}>
        <SectionLabel>How it looks</SectionLabel>
        <Chips>
          {WEIGHTS.map((w) => (
            <Chip key={w.id} label={`${w.label} line`} selected={weight === w.value} onPress={() => setWeight(w.value)} />
          ))}
        </Chips>
        <Toggle label="A circle around it" value={ring} onChange={setRing} />
        {method !== 'freehand' && (
          <View style={styles.center}>
            {sigil ? (
              <View>
                <SigilPicture sigil={sigil} size={pad} label={`Your sigil for ${fallbackName}`} />
                {method === 'kamea' && <KameaUnderlay planet={planet} size={pad} />}
              </View>
            ) : (
              <View style={[styles.blank, { width: pad, height: pad }]}>
                <Text style={type.caption}>Your sigil will appear here.</Text>
              </View>
            )}
          </View>
        )}
        {method === 'kamea' && sigil && <Body muted>The square is shown faintly to follow the path; it is not part of the sigil.</Body>}
      </View>

      {sigil && (
        <View style={ui.gap}>
          <SectionLabel>Keep it</SectionLabel>
          <Field label="Its name" value={name} onChange={setName} placeholder={fallbackName} />
          <View style={ui.actions}>
            {!fromGrimoire && <Button label="Keep it with my sigils" onPress={keep} />}
            {grimoire.canEdit ? (
              <Button
                label={fromGrimoire ? 'Put it in my Grimoire' : 'Give it a page in my Grimoire'}
                variant={fromGrimoire ? 'primary' : 'outline'}
                onPress={() => {
                  if (fromGrimoire) void addEntry<KeptSigil>(SIGILS, { name: name.trim() || fallbackName, sigil });
                  toGrimoire(sigil, name.trim() ? name.trim() : undefined);
                }}
              />
            ) : (
              <Body muted>Sign in, and open your Grimoire once while online, to keep sigils there as pages.</Body>
            )}
          </View>
          {!!notice && <Notice>{notice}</Notice>}
          {savedPage && (
            <Button
              label="Open the page"
              variant="text"
              onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: savedPage } })}
            />
          )}
        </View>
      )}

      <Expander title="Charging it and letting go">
        <Body>
          Traditions differ, so use what suits you. Many people charge a sigil by gazing at it in a quiet, focused moment, or a heightened one,
          then put it away and set about forgetting it. Spare thought the forgetting mattered: the wish keeps working once the mind stops worrying
          at it.
        </Body>
        <Body>
          You can also carve it into a candle and let it burn down, draw it in salt or ink and burn the paper, or keep it hidden in your Grimoire
          until it has done its work.
        </Body>
      </Expander>

      {kept.length > 0 && (
        <View style={ui.gap}>
          <SectionLabel>Your sigils</SectionLabel>
          <Body muted>To carve one into a candle, open a candle on your altar and choose Carve.</Body>
          {kept.map((k) => (
            <Card key={k.id} style={styles.keptCard}>
              <SigilPicture sigil={k.sigil} size={72} label={`Sigil for ${k.name}`} />
              <View style={styles.keptText}>
                <Text style={styles.keptName} numberOfLines={2}>
                  {k.name}
                </Text>
                <View style={styles.keptActions}>
                  {grimoire.canEdit && <Button label="To my Grimoire" variant="text" onPress={() => toGrimoire(k.sigil, k.name)} />}
                  <Button label="Remove" variant="text" onPress={() => void remove(k.id, k.name)} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  letters: { fontFamily: fonts.display, fontSize: 28, letterSpacing: 4, color: colors.cream },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  option: { alignItems: 'center', gap: 6, padding: 6, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  optionOn: { borderColor: colors.gold, backgroundColor: colors.surface },
  optionLabel: { fontFamily: fonts.body, fontSize: 14, color: colors.parchment },
  optionLabelOn: { color: colors.gold, fontFamily: fonts.bodySemi },
  pressed: { opacity: 0.7 },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  blank: { borderRadius: 6, borderWidth: 1, borderColor: colors.hairline, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  keptCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  keptText: { flex: 1, gap: 2 },
  keptName: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
  keptActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
});
