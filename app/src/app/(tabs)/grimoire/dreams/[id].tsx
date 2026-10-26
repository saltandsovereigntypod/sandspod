import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { ink, Ornament } from '../../../../components/grimoire/BlockView';
import { LinkedReadings } from '../../../../components/divination/Linked';
import { DreamShell } from '../../../../components/grimoire/dreams';
import { MoonDisc } from '../../../../components/MoonDisc';
import { SupportLink } from '../../../../components/SupportLink';
import { MOON_IN_SIGN } from '../../../../lib/astro/meanings';
import { fullDate } from '../../../../lib/calendar';
import { symbolReference } from '../../../../lib/craft/hedge/dreamSymbols';
import { DREAMS, dreamMoonDisc, normalizeDream, returningSymbols, VIVIDNESS } from '../../../../lib/craft/hedge/dreams';
import { useCraft } from '../../../../lib/craft/store';
import { DREAM_ROUTES } from '../../../../lib/grimoire/dreams';
import { fonts, type } from '../../../../theme';

// One dream, written on a page of the Grimoire like any other page.
export default function DreamPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, ready } = useCraft<unknown>(DREAMS);
  const all = useMemo(() => entries.map((e) => ({ ...e, data: normalizeDream(e.data) })), [entries]);
  const entry = all.find((e) => e.id === id) ?? null;

  if (!entry) {
    return (
      <DreamShell back={DREAM_ROUTES.journal as Href}>
        <Text style={type.body}>{ready ? 'This dream couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Text>
      </DreamShell>
    );
  }

  const d = entry.data;
  const disc = dreamMoonDisc(d.date);
  const back = returningSymbols(all, entry);
  const refs = d.symbols.map((s) => ({ s, ref: symbolReference(s) })).filter((x) => x.ref);
  const marks = [d.lucid ? 'Lucid' : null, d.recurring ? 'Recurring' : null, `Vividness ${d.vividness} · ${VIVIDNESS[d.vividness - 1]?.label ?? ''}`].filter(Boolean) as string[];
  const mood = MOON_IN_SIGN[d.moonSign]?.mood;

  return (
    <DreamShell
      back={DREAM_ROUTES.journal as Href}
      right={<Button label="Edit" variant="pill" accessibilityHint="Opens this dream for writing" onPress={() => router.push(DREAM_ROUTES.edit(entry.id) as Href)} />}
    >
      <View style={styles.paper}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Dream</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {d.title || 'Untitled dream'}
          </Text>
          <Text style={styles.details}>{fullDate(d.date) ?? d.date}</Text>
        </View>
        <Ornament />

        <View style={styles.moon} accessible accessibilityLabel={`The moon that night: ${d.moonPhase} in ${d.moonSign}.${mood ? ` ${mood}` : ''}`}>
          <MoonDisc size={52} illumination={disc.illumination} waxing={disc.waxing} halo={false} />
          <View style={styles.moonText}>
            <Text style={styles.subheading}>{`${d.moonPhase} in ${d.moonSign}`}</Text>
            <Text style={styles.soft}>{mood ?? 'The moon that night'}</Text>
          </View>
        </View>

        {!!d.dream && (
          <View style={styles.group}>
            <Text style={styles.subheading}>The dream</Text>
            <Text style={styles.body}>{d.dream}</Text>
          </View>
        )}
        {!!d.feelings && (
          <View style={styles.group}>
            <Text style={styles.subheading}>Feelings</Text>
            <Text style={styles.body}>{d.feelings}</Text>
          </View>
        )}
        <View style={styles.chips}>
          {marks.map((m) => (
            <View key={m} style={styles.chip}>
              <Text style={styles.chipText}>{m}</Text>
            </View>
          ))}
        </View>

        {d.symbols.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.subheading}>Symbols</Text>
            <View style={styles.chips}>
              {d.symbols.map((s) => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>{s}</Text>
                </View>
              ))}
            </View>
            {back.length > 0 && <Text style={styles.soft}>{`Returning from other dreams: ${back.join(', ')}.`}</Text>}
          </View>
        )}

        {refs.length > 0 && (
          <View style={styles.group}>
            <Text style={styles.subheading}>Places to start</Text>
            {refs.map(({ s, ref }) => (
              <View key={s} style={styles.callout}>
                <Text style={styles.calloutTitle}>{s}</Text>
                <Text style={styles.body}>{ref!.notes}</Text>
                <Text style={styles.soft}>{ref!.ask}</Text>
              </View>
            ))}
            <Text style={styles.soft}>Your own associations matter most: what does this mean to you?</Text>
          </View>
        )}
      </View>
      <LinkedReadings
        link={{ kind: 'dream', id: entry.id, title: d.title }}
        label="Readings of this dream"
        drawLabel="Read this dream"
        empty="Three cards for a dream that stays with you: what it shows, what it stirs in you, and what it asks of you."
      />
      <SupportLink />
    </DreamShell>
  );
}

const styles = StyleSheet.create({
  paper: { backgroundColor: ink.paper, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 24, gap: 14, marginHorizontal: -8 },
  titleBlock: { gap: 6 },
  eyebrow: { fontFamily: fonts.body, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: ink.faint },
  title: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 37, color: ink.text },
  details: { fontFamily: fonts.displayItalic, fontSize: 17, color: ink.soft },
  moon: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: ink.chip, borderRadius: 12, padding: 12 },
  moonText: { flex: 1, gap: 2 },
  group: { gap: 8 },
  subheading: { fontFamily: fonts.displayBold, fontSize: 19, color: ink.text },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: ink.text },
  soft: { fontFamily: fonts.displayItalic, fontSize: 16, lineHeight: 22, color: ink.soft },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 32, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 999, backgroundColor: ink.chip },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: ink.text },
  callout: { backgroundColor: ink.chip, borderRadius: 12, padding: 14, gap: 6 },
  calloutTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: ink.text, textTransform: 'capitalize' },
});
