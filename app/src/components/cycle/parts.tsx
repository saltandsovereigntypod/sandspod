// More pieces the Cycle & Moon screens share: today's exact reading, the
// month to pick past periods on, a number stepper, and the comfort cards for
// symptoms. The website draws the same from the same words
// (rituals/cycle/cycle.js).

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ExactReading } from '../../lib/cycle/readings';
import { MONTH_TITLES, WEEKDAY_LETTERS, type CalendarDay } from '../../lib/cycle/past';
import type { Comfort } from '../../lib/cycle/symptoms';
import { colors, fonts, touch, type } from '../../theme';
import { Button } from '../Button';
import { TermText } from '../astro/Explain';
import { Card, Chip, Chips } from '../rituals/ui';
import { practiceHref } from './ui';

/** Today's exact reading: the line, the moon, what the two suggest, a practice with its links and a prompt. */
export function ReadingCard({ reading, onWrite }: { reading: ExactReading; onWrite: () => void }) {
  const r = reading.reading;
  return (
    <Card accent>
      <Text style={[type.eyebrow, styles.gold]}>Today’s reading</Text>
      <Text style={type.cardTitle}>{reading.headline}</Text>
      <Text style={type.caption}>{reading.moonLine}</Text>
      <TermText style={type.caption} text={reading.signLine} />
      <Text style={[type.body, styles.title]}>{r.title}</Text>
      <Text style={type.body}>{r.line}</Text>
      <Text style={type.body}>{r.practice}</Text>
      <Chips>
        {r.links.map((link) => (
          <Chip key={`${link.kind}:${link.id}`} label={`${link.label} ›`} hint="Opens it" onPress={() => router.push(practiceHref(link))} />
        ))}
      </Chips>
      <Text style={type.caption}>To write about</Text>
      <Text style={type.cardTitle}>{r.prompt}</Text>
      <Button label="Write about it" variant="text" onPress={onWrite} />
    </Card>
  );
}

/** A month of days to tap: logged bleeds shaded, picked days filled, future days not tappable. */
export function MonthGrid({ year, month, weeks, onPick, onMonth }: { year: number; month: number; weeks: CalendarDay[][]; onPick: (key: string) => void; onMonth: (delta: number) => void }) {
  return (
    <View style={styles.grid}>
      <View style={styles.monthBar}>
        <Button label="‹ Earlier" variant="text" onPress={() => onMonth(-1)} />
        <Text style={type.cardTitle} accessibilityRole="header">{`${MONTH_TITLES[month]} ${year}`}</Text>
        <Button label="Later ›" variant="text" onPress={() => onMonth(1)} />
      </View>
      <View style={styles.week}>
        {WEEKDAY_LETTERS.map((d, i) => (
          <Text key={i} style={[type.caption, styles.cell, styles.head]}>
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((week) => (
        <View key={week[0].key} style={styles.week}>
          {week.map((d) => {
            const label = `${d.day} ${MONTH_TITLES[Number(d.key.slice(5, 7)) - 1]}${d.start ? ', a logged bleed began' : d.bleeding ? ', a logged bleed' : ''}${d.picked ? ', picked' : ''}`;
            return (
              <Pressable
                key={d.key}
                accessibilityRole="checkbox"
                aria-checked={d.picked}
                accessibilityLabel={label}
                disabled={d.future || d.bleeding}
                onPress={() => onPick(d.key)}
                style={[styles.cell, styles.day, d.bleeding && styles.bleeding, d.picked && styles.picked, !d.inMonth && styles.outside, d.future && styles.off]}
              >
                <Text style={[styles.dayText, d.picked && styles.pickedText]}>{d.day}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** A number with − and + beside it. */
export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.stepper}>
      <Text style={[type.body, styles.stepLabel]}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: fewer`} disabled={value <= min} onPress={() => onChange(value - 1)} style={[styles.step, value <= min && styles.off]}>
        <Text style={styles.stepText}>−</Text>
      </Pressable>
      <Text style={styles.value} accessibilityLabel={`${label}: ${value} days`}>
        {value}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: more`} disabled={value >= max} onPress={() => onChange(value + 1)} style={[styles.step, value >= max && styles.off]}>
        <Text style={styles.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

/** Folk and herbal comfort for a symptom, with its safety note and Library links. */
export function ComfortCard({ comfort }: { comfort: Comfort }) {
  return (
    <Card>
      <Text style={type.cardTitle}>{comfort.title}</Text>
      {comfort.ideas.map((idea) => (
        <Text key={idea} style={type.body}>
          {`· ${idea}`}
        </Text>
      ))}
      <Text style={type.caption}>{`With care: ${comfort.safety}`}</Text>
      {comfort.links.length > 0 && (
        <Chips>
          {comfort.links.map((link) => (
            <Chip key={`${link.kind}:${link.id}`} label={`${link.label} ›`} hint="Opens it" onPress={() => router.push(practiceHref(link))} />
          ))}
        </Chips>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  gold: { color: colors.gold },
  title: { fontFamily: fonts.bodySemi, color: colors.cream },
  grid: { gap: 4 },
  monthBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { flex: 1, textAlign: 'center', marginHorizontal: 2 },
  head: { paddingVertical: 4 },
  day: { minHeight: touch - 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  bleeding: { backgroundColor: 'rgba(155,59,74,0.45)' },
  picked: { backgroundColor: colors.gold },
  pickedText: { color: colors.ground, fontFamily: fonts.bodySemi },
  outside: { opacity: 0.45 },
  off: { opacity: 0.35 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepLabel: { flex: 1 },
  step: { width: touch, height: touch, borderRadius: touch / 2, borderWidth: 1, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised },
  stepText: { fontSize: 22, color: colors.cream, fontFamily: fonts.bodySemi },
  value: { minWidth: 32, textAlign: 'center', fontSize: 18, color: colors.cream, fontFamily: fonts.bodySemi },
});
