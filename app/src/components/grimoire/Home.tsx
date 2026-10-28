import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { parseCalendarDate, shortDate } from '../../lib/calendar';
import { kindLabel, PAGE_SORTS, pageKinds, type GrimoireLayout, type HomeItem, type PageSort } from '../../lib/grimoire/layout';
import { displayPageTitle, mundaneWords } from '../../lib/grimoire/presentation';
import { pageFacts, pageTypeLabel } from '../../lib/grimoire/structure';
import type { PageRow, SectionRow } from '../../lib/grimoire/types';
import { colors, fonts, radius, space, touch, type } from '../../theme';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Chips } from '../more/ui';
import { useGrimoireScope } from './scope';

// The pieces of a grimoire's home, your own or a coven's: each part opens and
// closes, and in Customise moves up or down, hides, and takes a new name; pages
// list in the order chosen and can be filed in a section. The rules are in
// lib/grimoire/layout.ts; the website draws the same (grimoire/js/ui/layout.js).

/** A part's heading: its name and count, opening and closing it. */
export function Disclosure({ label, note, count, open, heading, onPress }: { label: string; note?: string; count?: number; open: boolean; heading?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={count == null ? label : `${label}, ${count} ${count === 1 ? 'entry' : 'entries'}`}
      onPress={onPress}
      style={({ pressed }) => [styles.disclosure, pressed && styles.pressed]}
    >
      <View style={styles.disclosureText}>
        <Text style={heading ? type.eyebrow : styles.groupTitle}>{label}</Text>
        {!!note && <Text style={type.caption}>{note}</Text>}
      </View>
      {count != null && <Text style={type.caption}>{count}</Text>}
      <View style={open ? styles.chevronOpen : undefined}>
        <Icon name="chevron" size={14} color={colors.tabInactive} />
      </View>
    </Pressable>
  );
}

/**
 * One part of the home. Normally just its heading and, when open, what's in
 * it. While customising, a quiet row under the heading moves it, hides it
 * and renames it; opened, its pages can be put in order and filed.
 */
export function HomePartFrame({
  item,
  count,
  note,
  customising,
  first,
  last,
  onToggle,
  onMove,
  onHide,
  onRename,
  extraControls,
  children,
}: {
  item: HomeItem;
  count?: number;
  note?: string;
  customising: boolean;
  first: boolean;
  last: boolean;
  onToggle: () => void;
  onMove?: (direction: 'up' | 'down') => void;
  onHide?: (hidden: boolean) => void;
  onRename?: (title: string) => void;
  extraControls?: ReactNode;
  children: ReactNode;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(item.title);
  return (
    <View style={[styles.part, item.hidden && styles.hiddenPart]}>
      {customising ? (
        <View style={styles.customRow}>
          {renaming ? (
            <TextInput
              accessibilityLabel={`New name for ${item.title}`}
              value={draft}
              onChangeText={setDraft}
              autoFocus
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={() => {
                onRename?.(draft);
                setRenaming(false);
              }}
              onBlur={() => {
                onRename?.(draft);
                setRenaming(false);
              }}
              style={styles.renameInput}
            />
          ) : (
            <Text style={[type.eyebrow, styles.grow]} numberOfLines={1}>
              {item.title}
              {item.hidden ? ' · hidden' : ''}
            </Text>
          )}
          {onMove && (
            <>
              <SmallButton label="↑" hint={`Move ${item.title} up`} disabled={first} onPress={() => onMove('up')} />
              <SmallButton label="↓" hint={`Move ${item.title} down`} disabled={last} onPress={() => onMove('down')} />
            </>
          )}
        </View>
      ) : (
        <Disclosure label={item.title} note={note} count={count} open={item.open} heading onPress={onToggle} />
      )}
      {customising && (
        <View style={styles.customActions}>
          {onRename && !renaming && (
            <SmallButton
              label="Rename"
              onPress={() => {
                setDraft(item.title);
                setRenaming(true);
              }}
            />
          )}
          <SmallButton label={item.open ? 'Close' : 'Open'} hint={`${item.open ? 'Close' : 'Open'} ${item.title} to order and file its pages`} onPress={onToggle} />
          {onHide && <SmallButton label={item.hidden ? 'Show' : 'Hide'} hint={`${item.hidden ? 'Show' : 'Hide'} ${item.title}`} onPress={() => onHide(!item.hidden)} />}
          {extraControls}
        </View>
      )}
      {item.open && children}
    </View>
  );
}

export function SmallButton({ label, hint, disabled, onPress, tone }: { label: string; hint?: string; disabled?: boolean; onPress: () => void; tone?: 'danger' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hint ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.small, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.smallText, tone === 'danger' && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

/** Sorting and the kind of page shown, for the Customise view. */
export function SortAndFilter({ layout, pages, onChange }: { layout: GrimoireLayout; pages: PageRow[]; onChange: (next: Pick<GrimoireLayout, 'sort' | 'kind'>) => void }) {
  const kinds = useMemo(() => pageKinds(pages), [pages]);
  const kindOptions = [{ value: '', label: 'Every page' }, ...kinds.map((k) => ({ value: k.kind, label: `${k.label} (${k.count})` }))];
  return (
    <View style={styles.sortCard}>
      <Text style={type.eyebrow}>Pages in order of</Text>
      <Chips label="Sort pages" options={PAGE_SORTS} value={layout.sort} onChange={(sort: PageSort) => onChange({ sort, kind: layout.kind })} />
      {kinds.length > 1 && (
        <>
          <Text style={type.eyebrow}>Show</Text>
          <Chips label="Show pages of a kind" options={kindOptions} value={layout.kind ?? ''} onChange={(kind) => onChange({ sort: layout.sort, kind: kind || null })} />
        </>
      )}
    </View>
  );
}

/** A quiet line in the normal view when pages are sorted or filtered, with a way back. */
export function SortNote({ layout, onClear }: { layout: GrimoireLayout; onClear: () => void }) {
  if (layout.sort === 'custom' && !layout.kind) return null;
  const parts = [layout.sort !== 'custom' ? `Sorted ${PAGE_SORTS.find((s) => s.value === layout.sort)?.label.toLowerCase()}` : null, layout.kind ? `only ${kindLabel(layout.kind).toLowerCase()}` : null].filter(Boolean);
  return (
    <View style={styles.sortNote}>
      <Text style={[type.caption, styles.grow]}>{parts.join(' · ')}</Text>
      <SmallButton label="Show all, your order" onPress={onClear} />
    </View>
  );
}

/** Pages of one part, in the order chosen, each opening its page; while customising each can move and be filed. */
export function PageList({
  pages,
  mundane,
  customising,
  canMove,
  onMove,
  onFile,
  empty,
  detail,
}: {
  pages: PageRow[];
  mundane: boolean;
  customising?: boolean;
  /** Up and down only make sense in your own order. */
  canMove?: boolean;
  onMove?: (page: PageRow, direction: 'up' | 'down') => void;
  onFile?: (page: PageRow) => void;
  empty?: string;
  detail?: (page: PageRow) => string | null;
}) {
  if (!pages.length) return empty ? <Text style={type.caption}>{empty}</Text> : null;
  return (
    <View style={styles.list}>
      {pages.map((page, i) => (
        <PageRowView
          key={page.id}
          page={page}
          mundane={mundane}
          last={i === pages.length - 1}
          extra={detail?.(page) ?? null}
          controls={
            customising ? (
              <View style={styles.rowControls}>
                {canMove && onMove && <SmallButton label="↑" hint={`Move ${page.title} up`} disabled={i === 0} onPress={() => onMove(page, 'up')} />}
                {canMove && onMove && <SmallButton label="↓" hint={`Move ${page.title} down`} disabled={i === pages.length - 1} onPress={() => onMove(page, 'down')} />}
                {onFile && <SmallButton label="File in…" hint={`File ${page.title} in a section`} onPress={() => onFile(page)} />}
              </View>
            ) : null
          }
        />
      ))}
    </View>
  );
}

function PageRowView({ page, mundane, last, controls, extra }: { page: PageRow; mundane: boolean; last: boolean; controls: ReactNode; extra: string | null }) {
  const scope = useGrimoireScope();
  const facts = pageFacts(page);
  const date = parseCalendarDate(facts.date);
  const label = mundane ? mundaneWords(pageTypeLabel(page)) : pageTypeLabel(page);
  // A mundane title is already the date, so the detail line leaves it out.
  const detail = [label, date && !mundane ? shortDate(date) : null, facts.moonPhase, extra].filter(Boolean).join(' · ');
  const title = displayPageTitle(page, mundane);
  return (
    <View style={[styles.rowWrap, !last && styles.rowRule]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${detail}`}
        onPress={() => router.push(scope.page(page.id))}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.rowIcon}>
          <Icon name={['ritual_journal', 'ritual', 'spell'].includes(page.page_type ?? '') ? 'rituals' : 'grimoire'} size={18} color={colors.gold} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={type.caption} numberOfLines={1}>
            {detail}
          </Text>
        </View>
        {!controls && <Icon name="chevron" size={16} color={colors.tabInactive} />}
      </Pressable>
      {controls}
    </View>
  );
}

/** Chooses a section to file a page in (or none). */
export function SectionPicker({
  page,
  sections,
  loose = true,
  onChoose,
  onClose,
}: {
  page: PageRow | null;
  sections: SectionRow[];
  loose?: boolean;
  onChoose: (sectionId: string | null) => void;
  onClose: () => void;
}) {
  // Kept mounted; only its visibility changes (iOS sheets).
  const shown = page;
  return (
    <Modal visible={!!page} animationType="slide" presentationStyle="pageSheet" supportedOrientations={['portrait', 'landscape-left', 'landscape-right']} onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.sheetHeader}>
          <Text accessibilityRole="header" style={[type.cardTitle, styles.grow]} numberOfLines={2}>
            File “{shown?.title ?? ''}” in…
          </Text>
          <Button label="Cancel" variant="text" onPress={onClose} />
        </View>
        <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
          <View style={styles.list}>
            {loose && <SheetRow label="No section" selected={!shown?.section_id} onPress={() => onChoose(null)} />}
            {sections.map((s) => (
              <SheetRow key={s.id} label={s.title} selected={shown?.section_id === s.id} onPress={() => onChoose(s.id)} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SheetRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.sheetRow, pressed && styles.pressed]}>
      <Text style={[styles.rowTitle, styles.grow]}>{label}</Text>
      {selected && <Text style={styles.smallText}>Here now</Text>}
    </Pressable>
  );
}

/** "Customise" and, while customising, "Done" and "Back to the default". */
export function CustomiseBar({ customising, onToggle, onReset, note }: { customising: boolean; onToggle: () => void; onReset?: () => void; note?: string }) {
  return (
    <View style={styles.customiseBar}>
      <Text style={[type.caption, styles.grow]}>{customising ? (note ?? 'Move, hide and rename the parts of your book, and choose how pages are sorted.') : ''}</Text>
      {customising && onReset && <SmallButton label="Back to the default" onPress={onReset} />}
      <SmallButton label={customising ? 'Done' : 'Customise'} hint={customising ? 'Done customising' : 'Arrange your book’s contents'} onPress={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  grow: { flex: 1 },
  part: { gap: 8 },
  hiddenPart: { opacity: 0.55 },
  disclosureText: { flex: 1, gap: 2 },
  disclosure: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  chevronOpen: { transform: [{ rotate: '90deg' }] },
  customRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
  customActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: -4 },
  renameInput: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.goldLine,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.cream,
  },
  small: { minHeight: 36, minWidth: 36, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center' },
  smallText: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.gold },
  danger: { color: '#d98a74' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
  sortCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 14, gap: 8 },
  sortNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customiseBar: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: touch },
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  rowWrap: { paddingVertical: 2 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  rowControls: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 10, paddingLeft: 50 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.cream },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingLeft: space.gutter, paddingRight: 4, paddingVertical: 8 },
  sheetContent: { paddingHorizontal: space.gutter, paddingBottom: 32 },
  sheetRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
});
