// The day in the other calendars (lib/calendars): the moon's date when it
// leads Today, and a short line for each calendar shown beside it. Tap a line
// for its full sentence and the day's marks.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CONFIDENCE_LABEL, type CalendarLine, type Confidence } from '../lib/calendars';
import { colors, fonts, radius, type } from '../theme';

const CONFIDENCE_NOTE: Record<Confidence, string> = {
  historical: 'Kept historically and known from good sources.',
  reconstructed: 'Rebuilt by scholars from partial evidence.',
  modern: 'A modern creation.',
};

export function ConfidenceChip({ confidence }: { confidence: Confidence }) {
  return (
    <View style={[styles.chip, confidence === 'historical' ? styles.chipHistorical : confidence === 'reconstructed' ? styles.chipReconstructed : styles.chipModern]} accessible accessibilityLabel={`${CONFIDENCE_LABEL[confidence]}. ${CONFIDENCE_NOTE[confidence]}`}>
      <Text style={styles.chipText}>{CONFIDENCE_LABEL[confidence]}</Text>
    </View>
  );
}

function Details({ line }: { line: CalendarLine }) {
  return (
    <View style={styles.details}>
      <Text style={[type.body, styles.center]}>{line.long}</Text>
      {line.marks.map((mark) => (
        <Text key={mark.name} style={[type.caption, styles.center]}>
          <Text style={styles.gold}>{mark.name}</Text>
          {mark.meaning ? ` · ${mark.meaning}` : ''}
        </Text>
      ))}
      {!!line.date.year?.label && <Text style={[type.caption, styles.center, styles.muted]}>{line.date.year.label}</Text>}
      <View style={styles.chipRow}>
        <Text style={[type.caption, styles.muted]}>{line.name}</Text>
        <ConfidenceChip confidence={line.confidence} />
      </View>
    </View>
  );
}

/** The moon's date at the top of Today, when it leads; the ordinary date goes beneath. */
/** `marks`: show the day's marks under the date (off when Today's holiday card already lists them). */
export function LeadCalendarLine({ line, marks = true }: { line: CalendarLine; marks?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={`${line.short}. ${line.name}.`}
      accessibilityHint={open ? 'Hides the details' : 'Shows the full date and the day’s marks'}
      onPress={() => setOpen(!open)}
      style={({ pressed }) => [styles.lead, pressed && styles.pressed]}
    >
      <Text style={styles.leadText}>{line.short}</Text>
      {marks && line.marks.length > 0 && !open && <Text style={[type.caption, styles.gold, styles.center]}>{line.marks.map((m) => m.name).join(' · ')}</Text>}
      {open && <Details line={line} />}
    </Pressable>
  );
}

/** One short line per calendar shown beside the date. */
export function CalendarLineList({ lines, marks = true }: { lines: CalendarLine[]; marks?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!lines.length) return null;
  return (
    <View style={styles.list}>
      {lines.map((line) => {
        const expanded = open === line.id;
        return (
          <Pressable
            key={line.id}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={`${line.name}: ${line.short}`}
            accessibilityHint={expanded ? 'Hides the details' : 'Shows the full date and the day’s marks'}
            onPress={() => setOpen(expanded ? null : line.id)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Text style={[type.caption, styles.center]}>
              <Text style={styles.cream}>{line.short}</Text>
              {marks && line.marks.length > 0 && !expanded ? <Text style={styles.gold}>{` · ${line.marks[0].name}`}</Text> : null}
              <Text style={styles.muted}>{expanded ? '  ▾' : '  ▸'}</Text>
            </Text>
            {expanded && <Details line={line} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { alignItems: 'center', gap: 4, alignSelf: 'stretch', minHeight: 44, justifyContent: 'center' },
  leadText: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, color: colors.cream, textAlign: 'center' },
  list: { alignSelf: 'stretch', gap: 2 },
  item: { minHeight: 32, justifyContent: 'center', gap: 4, paddingVertical: 4 },
  details: { gap: 6, paddingTop: 4, paddingHorizontal: 8, alignItems: 'center' },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  chip: { borderRadius: radius.chip, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 2 },
  chipHistorical: { borderColor: colors.gold },
  chipReconstructed: { borderColor: colors.fern },
  chipModern: { borderColor: colors.tabInactive },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.5, color: colors.parchment },
  center: { textAlign: 'center' },
  gold: { color: colors.gold },
  cream: { color: colors.cream },
  muted: { color: colors.tabInactive },
  pressed: { opacity: 0.7 },
});
