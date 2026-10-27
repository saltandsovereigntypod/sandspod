import { StyleSheet, Text, View } from 'react-native';

import type { Script } from '../../../lib/covens/script';
import { colors, fonts, radius, type } from '../../../theme';
import { Words } from '../ui';

// A gathering read back (lib/covens/script.ts): the whole SCRIPT, every word
// with who says it, or the RUN-THROUGH as one person will see it, their own
// parts marked in gold. Used by the builder's preview and ritual/script.tsx.
export function ScriptView({ script, mode }: { script: Script; mode: 'script' | 'run' }) {
  const run = mode === 'run';
  return (
    <View style={styles.wrap}>
      {script.roles.length > 0 && (
        <View style={styles.block}>
          <Text style={type.eyebrow}>Roles</Text>
          {script.roles.map((r) => (
            <Text key={r.name} style={[type.body, run && r.mine && styles.mineText]}>
              {r.name}: {r.who}
              {run && r.mine ? ' · you' : ''}
            </Text>
          ))}
        </View>
      )}
      {script.checklist.length > 0 && (
        <View style={styles.block}>
          <Text style={type.eyebrow}>Before</Text>
          {script.checklist.map((c) => (
            <Text key={c} style={type.body}>
              • {c}
            </Text>
          ))}
        </View>
      )}
      {script.sections.map((section) => (
        <View key={section.id} style={styles.block}>
          <Text accessibilityRole="header" style={type.eyebrow}>
            {section.name}
          </Text>
          {section.steps.map((s) => {
            const yours = s.mine || s.lines.some((l) => l.mine);
            return (
              <View key={s.key} style={[styles.step, run && yours && styles.stepMine]} accessibilityLabel={`${s.n}. ${s.title}. ${s.who}.${run && yours ? ' This is yours.' : ''}`}>
                <Text style={type.cardTitle}>
                  {s.n}. {s.title}
                </Text>
                <Text style={type.caption}>
                  {s.who}
                  {s.how && s.how !== 'Only those named' ? ` · ${s.how.toLowerCase()}` : ''}
                  {s.minutes ? ` · about ${s.minutes} min` : ''}
                  {run && yours ? ' · yours' : ''}
                </Text>
                {(!run || yours) && !!s.directions && <Words text={s.directions} />}
                {s.facts.map((f) => (
                  <Text key={f} style={type.caption}>
                    {f}
                  </Text>
                ))}
                {!!s.asks && <Text style={type.caption}>{s.asks}</Text>}
                {s.lines.map((l, i) => (
                  <View key={i} style={[styles.line, run && l.mine && styles.lineMine]}>
                    <Text style={[styles.speaker, run && l.mine && styles.mineText]}>
                      {l.part ? `${l.part} · ` : ''}
                      {l.who}
                      {l.fromBook ? ` · from the Book: ${l.fromBook}` : ''}
                    </Text>
                    <Words text={l.words} style={styles.spoken} />
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ))}
      {script.afterwards.length > 0 && (
        <View style={styles.block}>
          <Text style={type.eyebrow}>Afterwards</Text>
          {script.afterwards.map((a) => (
            <Text key={a} style={type.body}>
              {a}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  block: { gap: 10 },
  step: { gap: 6, padding: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  stepMine: { borderColor: colors.gold, backgroundColor: 'rgba(226,195,109,0.06)' },
  line: { gap: 4, borderLeftWidth: 2, borderLeftColor: colors.hairline, paddingLeft: 12 },
  lineMine: { borderLeftColor: colors.gold },
  speaker: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.muted },
  mineText: { color: colors.gold },
  spoken: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 26 },
});
