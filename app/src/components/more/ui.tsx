// Building blocks for the More screens: a back header, cards, menu rows,
// wrapping chips, labelled fields, switches and check rows. Everything is at
// least 44pt tall and labelled for screen readers.

import { router, type Href } from 'expo-router';
import type { ReactElement, ReactNode } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAccessibility, useAccessibleText } from '../../lib/accessibility/store';
import { richTextBlocks } from '../../lib/library/richText';
import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Icon } from '../Icon';
import { MoreIcon, type MoreIconName } from './MoreIcon';

export function MoreScreen({
  title,
  eyebrow,
  back,
  backLabel = 'Back',
  onBack,
  children,
  refreshControl,
}: {
  title: string;
  eyebrow?: string;
  /** Where "back" goes when there's no history (deep links, web reloads). */
  back?: Href;
  backLabel?: string;
  /** Overrides what "back" does (a screen with its own inner views). */
  onBack?: () => void;
  children: ReactNode;
  refreshControl?: ReactElement<React.ComponentProps<typeof RefreshControl>>;
}) {
  // Redraws the title when More → Accessibility changes.
  useAccessibility();
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {back && (
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace(back))}
            style={styles.back}
            hitSlop={6}
          >
            <View style={styles.flip}>
              <Icon name="chevron" size={22} color={colors.cream} />
            </View>
          </Pressable>
        </View>
      )}
      <ScrollView
        contentContainerStyle={[styles.content, !back && styles.contentTop]}
        refreshControl={refreshControl}
        alwaysBounceHorizontal={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          {!!eyebrow && <Text style={type.eyebrow}>{eyebrow}</Text>}
          <Text accessibilityRole="header" style={type.title}>
            {title}
          </Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, tone }: { children: ReactNode; tone?: 'gold' }) {
  return <View style={[styles.card, tone === 'gold' && styles.cardGold]}>{children}</View>;
}

export function Section({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      {!!label && (
        <Text accessibilityRole="header" style={type.eyebrow}>
          {label}
        </Text>
      )}
      {children}
    </View>
  );
}

export function Notice({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'muted' }) {
  return (
    <Text accessibilityLiveRegion="polite" role="status" style={[type.caption, tone === 'gold' && styles.noticeGold]}>
      {children}
    </Text>
  );
}

export function MenuList({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

export function MenuRow({
  label,
  detail,
  icon,
  onPress,
  last,
  accessibilityLabel,
  disabled,
  count,
}: {
  label: string;
  detail?: string;
  icon?: MoreIconName;
  onPress?: () => void;
  last?: boolean;
  accessibilityLabel?: string;
  disabled?: boolean;
  /** A small gold count before the chevron (requests waiting), shown when above 0. */
  count?: number;
}) {
  const t = useAccessibleText();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [label, detail].filter(Boolean).join('. ')}
      accessibilityState={{ disabled: !!disabled || !onPress }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.rowRule, pressed && styles.pressed, disabled && styles.dim]}
    >
      {icon && (
        <View style={styles.rowIcon}>
          <MoreIcon name={icon} size={18} color={colors.gold} />
        </View>
      )}
      <View style={styles.rowText}>
        <Text style={t(styles.rowTitle)}>{label}</Text>
        {!!detail && <Text style={type.caption}>{detail}</Text>}
      </View>
      {!!count && count > 0 && (
        <View style={styles.count}>
          <Text style={styles.countText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
      {!!onPress && <Icon name="chevron" size={16} color={colors.tabInactive} />}
    </Pressable>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const t = useAccessibleText();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.chips}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && styles.pressed]}
          >
            <Text style={[t(styles.chipText), selected && t(styles.chipTextOn)]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Read-only chips; tappable when onPress is given (e.g. a pairing that has a page). */
export function Tags({ items, onPress }: { items: string[]; onPress?: (item: string) => (() => void) | undefined }) {
  const t = useAccessibleText();
  return (
    <View style={styles.chips}>
      {items.map((item, index) => {
        const action = onPress?.(item);
        return action ? (
          <Pressable
            key={`${item}-${index}`}
            accessibilityRole="link"
            accessibilityLabel={`${item}, open its Library page`}
            onPress={action}
            style={({ pressed }) => [styles.chip, styles.chipLink, pressed && styles.pressed]}
          >
            <Text style={[t(styles.chipText), t(styles.chipTextLink)]}>{item}</Text>
          </Pressable>
        ) : (
          <View key={`${item}-${index}`} style={[styles.chip, styles.tag]}>
            <Text style={t(styles.chipText)}>{item}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  hint,
  ...input
}: TextInputProps & { label: string; hint?: string }) {
  const t = useAccessibleText();
  return (
    <View style={styles.field}>
      <Text style={t(styles.fieldLabel)}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor="rgba(202,191,157,0.6)"
        {...input}
        style={[t(styles.input), input.multiline && styles.inputMulti, input.style]}
      />
      {!!hint && <Text style={type.caption}>{hint}</Text>}
    </View>
  );
}

export function SwitchRow({
  label,
  detail,
  value,
  onChange,
  last,
  accessory,
}: {
  label: string;
  detail?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
  /** Something else to press, beside the switch (a Hide button). */
  accessory?: ReactNode;
}) {
  const t = useAccessibleText();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={detail}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.row, !last && styles.rowRule]}
    >
      <View style={styles.rowText}>
        <Text style={t(styles.switchLabel)}>{label}</Text>
        {!!detail && <Text style={type.caption}>{detail}</Text>}
      </View>
      {accessory}
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceRaised, true: colors.goldDeep }}
        thumbColor={value ? colors.gold : colors.parchment}
        // react-native-web colours the "on" thumb with its own prop.
        {...({ activeThumbColor: colors.gold } as object)}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

export function CheckRow({ label, value, onChange, children }: { label: string; value: boolean; onChange: (v: boolean) => void; children?: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.check}
    >
      <View style={[styles.box, value && styles.boxOn]}>{value && <Text style={styles.tick}>✓</Text>}</View>
      <View style={styles.rowText}>
        <Text style={type.body}>{label}</Text>
        {children}
      </View>
    </Pressable>
  );
}

export function Paragraphs({ items, style }: { items: string[]; style?: object }) {
  return (
    <View style={styles.paragraphs}>
      {items.map((text, index) => (
        <Text key={index} style={[type.body, style]}>
          {text}
        </Text>
      ))}
    </View>
  );
}

/**
 * Text that may be rich-text HTML from the website (My Practice): bold,
 * italic and underline, bullet and numbered lists, and quotes. Plain text
 * shows one paragraph per line, as Paragraphs does.
 */
export function RichText({ text, style }: { text: string; style?: object }) {
  const t = useAccessibleText();
  const blocks = richTextBlocks(text);
  return (
    <View style={styles.paragraphs}>
      {blocks.map((block, index) => {
        const marker = block.kind === 'bullet' ? '•' : block.kind === 'number' ? `${block.number}.` : null;
        return (
          <View key={index} style={[marker ? styles.richItem : null, block.kind === 'quote' && styles.richQuote]}>
            {marker && <Text style={[type.body, style, styles.richMarker]}>{marker}</Text>}
            <Text style={[type.body, style, marker ? styles.richItemText : null, block.kind === 'quote' && styles.richQuoteText]}>
              {block.runs.map((run, runIndex) => (
                <Text
                  key={runIndex}
                  style={[run.bold && t(styles.richBold), run.italic && t(styles.richItalic), run.underline && styles.richUnderline]}
                >
                  {run.text}
                </Text>
              ))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export const moreStyles = StyleSheet.create({
  gap: { gap: 12 },
  rowGap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardTitle: type.cardTitle,
  bodyCream: { ...type.body, color: colors.cream },
  loading: { marginTop: 32 },
  danger: { borderColor: 'rgba(226,120,100,0.6)' },
  dangerText: { color: '#f0b3a4' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 4 },
  back: { width: touch, height: touch, alignItems: 'center', justifyContent: 'center' },
  flip: { transform: [{ scaleX: -1 }] },
  content: { paddingHorizontal: space.gutter, paddingTop: 4, paddingBottom: 40, gap: space.section },
  contentTop: { paddingTop: 16 },
  titleBlock: { gap: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    gap: 12,
  },
  cardGold: { borderColor: colors.goldLine },
  section: { gap: 8 },
  noticeGold: { color: colors.gold },
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  dim: { opacity: 0.55 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  count: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  countText: { fontFamily: fonts.body, fontSize: 12, color: colors.night, fontWeight: '700' },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
  switchLabel: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.cream },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: touch,
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipLink: { borderColor: 'rgba(226,195,109,0.5)' },
  tag: { minHeight: 32, backgroundColor: colors.surfaceRaised, borderColor: 'transparent' },
  chipText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchment, textAlign: 'center', flexShrink: 1 },
  chipTextOn: { color: colors.forestInk, fontFamily: fonts.bodySemi },
  chipTextLink: { color: colors.gold },
  field: { gap: 6 },
  fieldLabel: { ...type.eyebrow },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.22)',
    backgroundColor: colors.night,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputMulti: { minHeight: 140, textAlignVertical: 'top' },
  check: { minHeight: touch, flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  box: {
    width: 24,
    height: 24,
    marginTop: 1,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.goldDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  tick: { color: colors.forestInk, fontSize: 15, lineHeight: 18, fontFamily: fonts.bodySemi },
  paragraphs: { gap: 12 },
  richItem: { flexDirection: 'row', gap: 8 },
  richMarker: { minWidth: 16, color: colors.gold },
  richItemText: { flex: 1 },
  richQuote: { borderLeftWidth: 2, borderLeftColor: colors.goldLine, paddingLeft: 12 },
  richQuoteText: { fontStyle: 'italic' },
  richBold: { fontFamily: fonts.bodySemi },
  richItalic: { fontStyle: 'italic' },
  richUnderline: { textDecorationLine: 'underline' },
});
