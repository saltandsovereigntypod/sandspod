// Small building blocks shared by the Rituals screens. They follow the app's
// rules: vertical scrolling only, chips that wrap, 44pt targets, real labels.

import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Button } from '../Button';
import { Icon, type IconName } from '../Icon';

type ShellProps = {
  children: ReactNode;
  /** Shows a back button; the label says where it goes. */
  back?: string;
  onRefresh?: () => Promise<void>;
};

/** A Rituals screen: optional back bar, then one vertical scroll. */
export function RitualScreen({ children, back, onRefresh }: ShellProps) {
  const [pulling, setPulling] = useState(false);
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {back && (
          <View style={styles.bar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Back to ${back}`}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/rituals'))}
              style={styles.back}
            >
              <View style={styles.flip}>
                <Icon name="chevron" size={22} color={colors.cream} />
              </View>
              <Text style={[type.caption, styles.backText]} numberOfLines={1}>
                {back}
              </Text>
            </Pressable>
          </View>
        )}
        <ScrollView
          contentContainerStyle={styles.content}
          alwaysBounceHorizontal={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={pulling}
                tintColor={colors.gold}
                onRefresh={async () => {
                  setPulling(true);
                  await onRefresh();
                  setPulling(false);
                }}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Title({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <View style={styles.title}>
      {!!eyebrow && <Text style={type.eyebrow}>{eyebrow}</Text>}
      <Text accessibilityRole="header" style={type.title}>
        {children}
      </Text>
    </View>
  );
}

export function Card({ children, style, accent }: { children: ReactNode; style?: StyleProp<ViewStyle>; accent?: boolean }) {
  return <View style={[styles.card, accent && styles.accent, style]}>{children}</View>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={type.eyebrow}>
      {children}
    </Text>
  );
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={muted ? type.caption : type.body}>{children}</Text>;
}

/** A tappable list row with an icon, two lines of text and a chevron. */
export function Row({
  title,
  detail,
  icon = 'rituals',
  onPress,
  last,
  label,
  right,
}: {
  title: string;
  detail?: string | null;
  icon?: IconName;
  onPress: () => void;
  last?: boolean;
  label?: string;
  right?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? [title, detail].filter(Boolean).join('. ')}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowRule, pressed && styles.pressed]}
    >
      <View style={styles.rowIcon}>
        <Icon name={icon} size={18} color={colors.gold} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        {!!detail && (
          <Text style={type.caption} numberOfLines={2}>
            {detail}
          </Text>
        )}
      </View>
      {right}
      <Icon name="chevron" size={16} color={colors.tabInactive} />
    </Pressable>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

/** Wrapping chips; never a sideways scroll. */
export function Chips({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

export function Chip({
  label,
  selected,
  onPress,
  hint,
  a11yLabel,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  hint?: string;
  a11yLabel?: string;
}) {
  const content = <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>;
  if (!onPress) {
    return (
      <View accessible accessibilityLabel={a11yLabel ?? label} style={[styles.chip, styles.chipStatic]}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole={selected === undefined ? 'button' : 'checkbox'}
      aria-checked={selected === undefined ? undefined : selected}
      accessibilityLabel={a11yLabel ?? label}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(202,191,157,0.6)"
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.multiline]}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

export function Toggle({ label, detail, value, onChange }: { label: string; detail?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      aria-checked={value}
      accessibilityLabel={detail ? `${label}. ${detail}` : label}
      onPress={() => onChange(!value)}
      style={styles.toggle}
    >
      <View style={styles.rowText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {!!detail && <Text style={type.caption}>{detail}</Text>}
      </View>
      {/* The whole row is the switch; the visual one only shows the state. */}
      <View style={{ pointerEvents: 'none' }} aria-hidden>
        <Switch
          value={value}
          trackColor={{ false: colors.surfaceRaised, true: colors.goldDeep }}
          thumbColor={value ? colors.gold : colors.parchment}
          // react-native-web colours the "on" thumb with its own prop (teal otherwise).
          {...({ activeThumbColor: colors.gold } as object)}
        />
      </View>
    </Pressable>
  );
}

/** Tells guests what an account adds, with a way to sign in. */
export function SignInCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <Text style={type.cardTitle}>{title}</Text>
      <Text style={type.body}>{body}</Text>
      <Button label="Sign in" onPress={() => router.push('/sign-in')} />
    </Card>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <Text style={[type.caption, styles.notice]}>{children}</Text>;
}

/** A disclosure that keeps longer forms calm: closed until asked for. */
export function Expander({ title, children, initiallyOpen }: { title: string; children: ReactNode; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(!!initiallyOpen);
  return (
    <View style={styles.expander}>
      <Pressable
        accessibilityRole="button"
        aria-expanded={open}
        accessibilityLabel={title}
        onPress={() => setOpen(!open)}
        style={styles.expanderHead}
      >
        <Text style={styles.expanderTitle}>{title}</Text>
        <View style={{ transform: [{ rotate: open ? '-90deg' : '90deg' }] }}>
          <Icon name="chevron" size={16} color={colors.gold} />
        </View>
      </Pressable>
      {open && <View style={styles.expanderBody}>{children}</View>}
    </View>
  );
}

// Confirmations and notices use the app's own dialog on the web, because the
// browser's confirm() and alert() can be blocked (see lib/dialog.ts).
export { confirmAction, tell } from '../../lib/dialog';

export const ui = StyleSheet.create({
  gap: { gap: 12 },
  gapSmall: { gap: 6 },
  gold: { color: colors.gold },
  center: { textAlign: 'center' },
  actions: { gap: 10 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  fill: { flex: 1 },
  bar: { paddingHorizontal: 8, paddingTop: 4 },
  back: { minHeight: touch, minWidth: touch, flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', paddingRight: 12 },
  flip: { transform: [{ scaleX: -1 }], width: touch - 8, alignItems: 'center' },
  backText: { color: colors.cream },
  content: { paddingHorizontal: space.gutter, paddingTop: 12, paddingBottom: 40, gap: space.section },
  title: { gap: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 12,
  },
  accent: { borderColor: 'rgba(226,195,109,0.24)' },
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: touch,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.22)',
    backgroundColor: colors.surface,
  },
  chipStatic: { minHeight: 34, paddingHorizontal: 12 },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchment },
  chipTextOn: { color: colors.forestInk, fontFamily: fonts.bodySemi },
  field: { gap: 6 },
  fieldLabel: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.parchment },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.2)',
    backgroundColor: colors.night,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  multiline: { minHeight: 96 },
  toggle: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  toggleLabel: { fontFamily: fonts.body, fontSize: 16, color: colors.cream },
  notice: { color: colors.gold },
  expander: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline },
  expanderHead: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  expanderTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.cream },
  expanderBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
});
