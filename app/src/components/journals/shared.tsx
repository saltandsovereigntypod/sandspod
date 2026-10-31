// Pieces shared by the four practice journals (lib/journals/journals.ts):
// which tab a screen is in, the journal's entries read and tidied, the shell,
// rows, and where a journal lives (the Grimoire or Rituals → Journal).

import { router, usePathname, type Href } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ANCESTORS, normalizeAncestor } from '../../lib/craft/hedge/ancestors';
import { useCraft } from '../../lib/craft/store';
import {
  entryDetail,
  entryMoonDisc,
  entryTitle,
  journalDef,
  journalPlace,
  journalRoutes,
  normalizeEntry,
  PLACE_OPTIONS,
  type JournalEntry,
  type JournalKind,
  type JournalPlace,
} from '../../lib/journals/journals';
import { patchMySettings, useMySettings } from '../../lib/settings/store';
import { colors, fonts, type } from '../../theme';
import { DreamShell } from '../grimoire/dreams';
import { Icon } from '../Icon';
import { MoonDisc } from '../MoonDisc';
import { Chip, Chips, SectionLabel, tell } from '../rituals/ui';

/** The tab a journal screen is open in: under Rituals it is "its own journal", otherwise the Grimoire's. */
export function useTabPlace(): JournalPlace {
  const path = usePathname();
  return path.startsWith('/rituals') ? 'journal' : 'grimoire';
}

/** A journal's entries, tidied, newest first as stored; and its routes in this tab. */
export function useJournal(kind: JournalKind) {
  const def = journalDef(kind);
  const tab = useTabPlace();
  const { entries, ready } = useCraft<unknown>(def.collection);
  const list = useMemo<JournalEntry[]>(() => entries.map((e) => ({ id: e.id, createdAt: e.createdAt, data: normalizeEntry(e.data) })), [entries]);
  return { def, list, raw: entries, ready, tab, routes: journalRoutes(kind, tab) };
}

/** Your people from Hedge → Ancestors, by id, for names in the ancestor journal. */
export function usePeople() {
  const { entries } = useCraft<unknown>(ANCESTORS);
  return useMemo(() => {
    const people = entries.map((e) => ({ id: e.id, createdAt: e.createdAt, data: normalizeAncestor(e.data) })).sort((a, b) => a.data.name.localeCompare(b.data.name));
    const names = Object.fromEntries(people.map((p) => [p.id, p.data.name || 'Unnamed']));
    return { people, names };
  }, [entries]);
}

/** A journal screen: the back bar with where you are ("Grimoire · Shadow work"), then one scroll. */
export function JournalShell({ kind, children, right, back }: { kind?: JournalKind; children: ReactNode; right?: ReactNode; back?: string }) {
  const tab = useTabPlace();
  const where = tab === 'journal' ? 'Rituals · Journal' : 'Grimoire';
  const crumb = kind ? `${where} · ${journalDef(kind).title}` : `${where} · Journals`;
  const fallback = back ?? (kind ? journalRoutes(kind, tab).list : tab === 'journal' ? '/rituals/journal' : '/grimoire');
  return (
    <DreamShell crumb={crumb} back={fallback as Href} right={right}>
      {children}
    </DreamShell>
  );
}

/** One entry in a list, with the moon it was written under. */
export function EntryRow({ kind, entry, last, names, href }: { kind: JournalKind; entry: JournalEntry; last: boolean; names?: Record<string, string>; href: string }) {
  const disc = entryMoonDisc(entry.data);
  const title = entryTitle(kind, entry.data, { people: names });
  const detail = entryDetail(kind, entry.data);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${detail}`}
      onPress={() => router.push(href as Href)}
      style={({ pressed }) => [styles.row, !last && styles.rowRule, pressed && styles.pressed]}
    >
      <View accessibilityElementsHidden importantForAccessibility="no">
        <MoonDisc size={30} illumination={disc.illumination} waxing={disc.waxing} halo={false} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text style={type.caption} numberOfLines={2}>
          {detail}
        </Text>
      </View>
      <Icon name="chevron" size={16} color={colors.tabInactive} />
    </Pressable>
  );
}

export function EntryList({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

/** "Keep this journal": in the Grimoire or as its own. Moving it keeps every entry. */
export function PlaceChooser({ kind }: { kind: JournalKind }) {
  const { settings } = useMySettings();
  const def = journalDef(kind);
  const place = journalPlace(settings, kind);
  const choose = async (value: JournalPlace) => {
    if (value === place) return;
    try {
      await patchMySettings({ [def.setting]: value });
      router.replace(journalRoutes(kind, value).list as Href);
    } catch {
      tell('Couldn’t move it just now', 'Your entries are safe. Try again in a moment.');
    }
  };
  return (
    <View style={styles.gapSmall}>
      <SectionLabel>Where this journal lives</SectionLabel>
      <Chips>
        {PLACE_OPTIONS.map((o) => (
          <Chip key={o.value} label={o.label} selected={place === o.value} onPress={() => void choose(o.value)} />
        ))}
      </Chips>
      <Text style={type.caption}>{`${PLACE_OPTIONS.find((o) => o.value === place)?.note ?? ''} Moving it keeps every entry.`}</Text>
    </View>
  );
}

/** A labelled piece of an entry's page. */
export function Part({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.gapSmall}>
      <Text style={styles.subheading}>{label}</Text>
      {children}
    </View>
  );
}

export const journalStyles = StyleSheet.create({
  paper: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 22, gap: 14 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 25, color: colors.cream },
  soft: { fontFamily: fonts.displayItalic, fontSize: 16, lineHeight: 22, color: colors.muted },
  title: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 34, color: colors.cream },
  moon: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceRaised, borderRadius: 12, padding: 12 },
  grow: { flex: 1, gap: 2 },
  photo: { width: 72, height: 90, borderRadius: 8, backgroundColor: colors.surfaceRaised },
  people: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});

const styles = StyleSheet.create({
  list: { backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16 },
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  rowRule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(244,236,216,0.14)' },
  pressed: { opacity: 0.7 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fonts.displayBold, fontSize: 18, color: colors.cream },
  gapSmall: { gap: 8 },
  subheading: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.cream },
});
