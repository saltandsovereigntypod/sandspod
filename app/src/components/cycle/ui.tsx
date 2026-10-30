// Small pieces the Cycle & Moon screens share: the passphrase field, the
// unlock and set-up forms, a practice suggestion with its links, and the
// recovery key shown once.

import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { copyText } from '../../lib/copyText';
import type { PracticeLink, Suggestion } from '../../lib/cycle/content';
import { ritualsLibraryHref } from '../../lib/library';
import { MIN_PASSPHRASE, VaultError } from '../../lib/cycle/vault';
import { colors, fonts, radius, type } from '../../theme';
import { Button } from '../Button';
import { Card, Chip, Chips } from '../rituals/ui';

export function PassphraseInput({ label, value, onChange, hint, autoFocus }: { label: string; value: string; onChange: (v: string) => void; hint?: string; autoFocus?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        value={value}
        onChangeText={onChange}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        textContentType="none"
        autoFocus={autoFocus}
        style={styles.input}
        placeholderTextColor="rgba(202,191,157,0.6)"
      />
    </View>
  );
}

export function Progress({ done, label }: { done: number; label: string }) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(done * 100) }} style={styles.progressWrap}>
      <Text style={type.caption}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${Math.max(4, Math.round(done * 100))}%` }]} />
      </View>
    </View>
  );
}

export const errorText = (e: unknown) => (e instanceof VaultError || e instanceof Error ? e.message : 'Something went wrong. Please try again.');

/** Where a practice link opens in the app. */
export function practiceHref(link: PracticeLink): Href {
  if (link.kind === 'premade') return { pathname: '/rituals/premade/[id]', params: { id: link.id } } as Href;
  if (link.kind === 'library') return ritualsLibraryHref({ id: link.id }) as Href;
  return { pathname: '/rituals/divination/draw', params: { spread: link.id } } as Href;
}

export function SuggestionCard({ suggestion, eyebrow }: { suggestion: Suggestion; eyebrow?: string }) {
  return (
    <Card>
      {!!eyebrow && <Text style={[type.eyebrow, styles.gold]}>{eyebrow}</Text>}
      <Text style={type.cardTitle}>{suggestion.title}</Text>
      <Text style={type.body}>{suggestion.line}</Text>
      <Chips>
        {suggestion.links.map((link) => (
          <Chip key={`${link.kind}:${link.id}`} label={`${link.label} ›`} hint="Opens it" onPress={() => router.push(practiceHref(link))} />
        ))}
      </Chips>
    </Card>
  );
}

/** The recovery key, shown once, with a way to copy it. */
export function RecoveryCard({ recovery, onDone }: { recovery: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card accent>
      <Text style={[type.eyebrow, styles.gold]}>Your recovery key</Text>
      <Text selectable style={styles.recovery} accessibilityLabel={`Recovery key: ${recovery.split('').join(' ')}`}>
        {recovery}
      </Text>
      <Text style={type.body}>
        Write this down and keep it somewhere safe, away from this phone. With it you can open your notes if you forget your passphrase. It won’t be shown again.
      </Text>
      <Text style={type.caption}>
        If both the passphrase and this key are lost, nobody can open your Cycle &amp; Moon notes again, including the people who run Salt &amp; Sovereignty.
      </Text>
      <Button
        label={copied ? 'Copied' : 'Copy the recovery key'}
        variant="outline"
        onPress={async () => {
          setCopied(await copyText(recovery));
        }}
      />
      <Button label="I’ve kept it safe" onPress={onDone} />
    </Card>
  );
}

export const passphraseProblem = (a: string, b: string) =>
  a.normalize('NFKC').length < MIN_PASSPHRASE ? `At least ${MIN_PASSPHRASE} characters. A few unrelated words make a good one.` : a !== b ? 'The two passphrases don’t match.' : null;

export function ChoiceChips<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <Chips>
      {options.map((o) => (
        <Chip key={String(o.value)} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </Chips>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.parchment },
  input: {
    minHeight: 44,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceRaised,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 12,
    ...(Platform.OS === 'web' ? { outlineColor: colors.gold } : {}),
  },
  progressWrap: { gap: 6 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  bar: { height: 8, backgroundColor: colors.gold },
  gold: { color: colors.gold },
  recovery: { fontFamily: fonts.bodySemi, fontSize: 18, letterSpacing: 1, color: colors.cream, lineHeight: 28 },
});
