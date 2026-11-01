// Explanations for astrology, anywhere in the app:
// * <TermText text="…"/> makes every glossary term in a sentence tappable.
// * <Term id="…">…</Term> makes one bit of text a term.
// * Tapping opens the one TermSheet (mounted once, in the tabs layout), with
//   the term's Simple or Detailed explanation, its related terms and where it
//   leads in the app (planet guides, moon pages, the Living Library, tools).
// * <ExplainCard/> shows a reading or a term with its own Simple · Detailed
//   switch; the global choice is Settings → Explanations (astro_explanations).

import { router, type Href } from 'expo-router';
import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

import { DETAIL_SECTIONS, linkTerms, term, type GlossaryEntry, type TermLink } from '../../lib/astro/glossary';
import type { Interpretation } from '../../lib/astro/interpret/types';
import { explainLevel, type ExplainLevel } from '../../lib/astro/prefs';
import { holyRef } from '../../lib/holy/refs';
import { findByName } from '../../lib/library/model';
import { libraryHref } from '../../lib/library';
import { useLibrary } from '../../lib/library/store';
import { patchMySettings, useMySettings } from '../../lib/settings/store';
import { colors, fonts, radius, touch, type } from '../../theme';
import { Sheet } from '../altar/Sheet';
import { Chip, Chips } from '../rituals/ui';

// ── Which term is open ───────────────────────────────────────────────────

let openId: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function openTerm(id: string) {
  if (!term(id)) return;
  openId = id;
  emit();
}
const closeTerm = () => {
  openId = null;
  emit();
};
const useOpenTerm = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => openId,
    () => openId,
  );

// ── The level ────────────────────────────────────────────────────────────

/** The chosen explanation level, and a way to change it for everywhere. */
export function useExplainLevel(): [ExplainLevel, (level: ExplainLevel) => void] {
  const { settings } = useMySettings();
  const level = explainLevel(settings);
  const set = (next: ExplainLevel) => {
    void patchMySettings({ astro_explanations: next }).catch(() => {});
  };
  return [level, set];
}

/** A small Simple · Detailed switch. */
export function LevelSwitch({ value, onChange, label = 'Explanation' }: { value: ExplainLevel; onChange: (v: ExplainLevel) => void; label?: string }) {
  return (
    <View style={styles.switch} accessibilityRole="tablist" accessibilityLabel={label}>
      {(['simple', 'detailed'] as const).map((k) => (
        <Pressable
          key={k}
          accessibilityRole="tab"
          aria-selected={value === k}
          onPress={() => onChange(k)}
          style={[styles.switchItem, value === k && styles.switchOn]}
        >
          <Text style={[styles.switchText, value === k && styles.switchTextOn]}>{k === 'simple' ? 'Simple' : 'Detailed'}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ── Tappable terms ───────────────────────────────────────────────────────

/** A sentence with its astrology terms tappable. */
export function TermText({ text, style, skip, numberOfLines }: { text: string; style?: StyleProp<TextStyle>; skip?: string[]; numberOfLines?: number }) {
  const pieces = linkTerms(text, { skip });
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {pieces.map((p, i) =>
        p.term ? (
          <Text key={i} style={styles.term} onPress={() => openTerm(p.term!)} accessibilityRole="link" accessibilityHint="Explains this astrology term">
            {p.text}
          </Text>
        ) : (
          p.text
        ),
      )}
    </Text>
  );
}

/** One bit of text as a term. */
export function Term({ id, children, style }: { id: string; children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[styles.term, style]} onPress={() => openTerm(id)} accessibilityRole="link" accessibilityHint="Explains this astrology term">
      {children}
    </Text>
  );
}

/** A row of chips that open terms ("Learn: Ascendant · Placidus"). */
export function TermChips({ ids, label = 'What these mean' }: { ids: string[]; label?: string }) {
  const entries = ids.map((id) => term(id)).filter((e): e is GlossaryEntry => !!e);
  if (!entries.length) return null;
  return (
    <View style={styles.chipsBlock}>
      <Text style={type.caption}>{label}</Text>
      <Chips>
        {entries.map((e) => (
          <Chip key={e.id} label={`${e.symbol ? `${e.symbol} ` : ''}${e.term}`} onPress={() => openTerm(e.id)} a11yLabel={`What ${e.term} means`} />
        ))}
      </Chips>
    </View>
  );
}

// ── Explained text ───────────────────────────────────────────────────────

/** The Detailed parts of a term, with headings. */
export function TermDetail({ entry }: { entry: GlossaryEntry }) {
  return (
    <View style={styles.detail}>
      {DETAIL_SECTIONS.filter((s) => entry.detailed[s.key]).map((s) => (
        <View key={s.key} style={styles.detailPart}>
          <Text style={styles.detailHead}>{s.label}</Text>
          <TermText text={entry.detailed[s.key]!} style={type.body} skip={[entry.id]} />
        </View>
      ))}
    </View>
  );
}

/** Paragraphs separated by blank lines, terms tappable. */
export function Paragraphs({ text, skip, muted }: { text: string; skip?: string[]; muted?: boolean }) {
  return (
    <View style={styles.paras}>
      {text.split(/\n\s*\n/).map((para, i) => (
        <TermText key={i} text={para.trim()} style={muted ? type.caption : type.body} skip={skip} />
      ))}
    </View>
  );
}

/**
 * A card with its own Simple · Detailed switch, starting at the global
 * level. Shows an interpretation (simple / detailed / magic), or a term.
 */
export function ExplainCard({
  title,
  eyebrow,
  reading,
  entry,
  right,
  terms,
  children,
}: {
  title: string;
  eyebrow?: string;
  reading?: Interpretation | null;
  entry?: GlossaryEntry | null;
  right?: ReactNode;
  terms?: string[];
  children?: ReactNode;
}) {
  const [global] = useExplainLevel();
  const [own, setOwn] = useState<ExplainLevel | null>(null);
  const level = own ?? global;
  return (
    <View style={styles.card}>
      {!!eyebrow && <Text style={type.eyebrow}>{eyebrow}</Text>}
      <View style={styles.cardHead}>
        <Text style={[type.cardTitle, styles.flex]}>{title}</Text>
        {right}
      </View>
      {reading ? (
        level === 'simple' ? (
          <TermText text={reading.simple} style={type.body} skip={terms} />
        ) : (
          <>
            <Paragraphs text={reading.detailed} skip={terms} />
            {!!reading.shadow && (
              <View style={styles.detailPart}>
                <Text style={styles.detailHead}>The harder side</Text>
                <TermText text={reading.shadow} style={type.body} />
              </View>
            )}
            {!!reading.sources && <Text style={type.caption}>{reading.sources}</Text>}
          </>
        )
      ) : entry ? (
        level === 'simple' ? (
          <TermText text={entry.simple} style={type.body} skip={[entry.id]} />
        ) : (
          <TermDetail entry={entry} />
        )
      ) : null}
      {reading && (
        <View style={styles.magic}>
          <Text style={styles.detailHead}>In the craft</Text>
          {level === 'detailed' && reading.magicDetailed ? (
            <Paragraphs text={reading.magicDetailed} skip={terms} />
          ) : (
            <TermText text={reading.magic} style={type.body} skip={terms} />
          )}
          {!!reading.links?.length && <TermLinks links={reading.links} />}
        </View>
      )}
      {children}
      {(reading || entry) && <LevelSwitch value={level} onChange={setOwn} label={`How much to explain ${title}`} />}
      {!!terms?.length && <TermChips ids={terms} />}
    </View>
  );
}

// ── The sheet ────────────────────────────────────────────────────────────

/** Leave the sheet for somewhere else in the app. */
function goFromSheet(href: Href) {
  closeTerm();
  // Let the sheet close before moving on (iOS).
  setTimeout(() => router.push(href), 250);
}

/** Where a term leads (its own component, so the Living Library loads only when a sheet with links is open). */
function TermLinks({ links }: { links: TermLink[] }) {
  const { entries } = useLibrary();
  const linkHref = (link: TermLink): Href | null => {
    if (link.kind === 'planet-guide') return { pathname: '/rituals/craft/cosmic/planet', params: { planet: link.planet } } as unknown as Href;
    if (link.kind === 'moon-phase') return { pathname: '/today/holy/[ref]', params: { ref: holyRef(PHASE_REF[link.phase]) } };
    if (link.kind === 'tool') return TOOL_HREF[link.tool] as Href;
    if (link.kind === 'premade') return { pathname: '/rituals/premade/[id]', params: { id: link.id } } as unknown as Href;
    if (link.kind === 'journey') return { pathname: '/rituals/journeys/[id]', params: { id: link.id } } as unknown as Href;
    const found = findByName(entries, link.name);
    return found ? libraryHref(found) : null;
  };
  const label = (link: TermLink) =>
    link.label ?? (link.kind === 'planet-guide' ? `${link.planet}: the full guide` : link.kind === 'library' ? `${link.name} in the Living Library` : 'Open');
  return (
    <>
      {links.map((link) => {
        const href = linkHref(link);
        if (!href) return null;
        return (
          <Pressable key={label(link)} accessibilityRole="link" onPress={() => goFromSheet(href)} style={styles.link}>
            <Text style={styles.linkText}>{`${label(link)} ›`}</Text>
          </Pressable>
        );
      })}
    </>
  );
}

const PHASE_REF: Record<string, string> = { new: 'moon-new', firstQuarter: 'moon-first-quarter', full: 'moon-full', lastQuarter: 'moon-last-quarter' };
const TOOL_HREF: Record<string, string> = {
  hours: '/rituals/craft/cosmic/hours',
  chart: '/rituals/craft/cosmic/chart',
  charts: '/rituals/craft/cosmic/charts',
  sky: '/today/sky',
  learn: '/rituals/craft/cosmic/learn',
};

/** The one explanation sheet; mounted once in the tabs layout and never unmounted. */
export function TermSheet() {
  const id = useOpenTerm();
  const [shown, setShown] = useState<string | null>(id);
  if (id && id !== shown) setShown(id);
  const entry = shown ? term(shown) : null;
  const [global, setGlobal] = useExplainLevel();
  const [own, setOwn] = useState<ExplainLevel | null>(null);
  const level = own ?? global;

  return (
    <Sheet visible={!!id && !!entry} eyebrow={entry ? `Astrology · ${entry.category === 'basics' ? 'the basics' : entry.category.replace('-', ' ')}` : 'Astrology'} title={entry ? `${entry.symbol ? `${entry.symbol} ` : ''}${entry.term}` : ''} onClose={closeTerm}>
      {entry && (
        <View style={styles.sheetBody}>
          <LevelSwitch
            value={level}
            onChange={(v) => {
              setOwn(v);
              setGlobal(v);
            }}
          />
          {level === 'simple' ? <TermText text={entry.simple} style={type.body} skip={[entry.id]} /> : <TermDetail entry={entry} />}
          {level === 'simple' && <Text style={type.caption}>Detailed adds the astronomy, the history, how traditions read it, its use in the craft, and what to take care over.</Text>}
          {!!entry.links?.length && <TermLinks links={entry.links} />}
          {!!entry.related?.length && (
            <View style={styles.chipsBlock}>
              <Text style={type.eyebrow}>Read next</Text>
              <Chips>
                {entry.related
                  .map((r) => term(r))
                  .filter((e): e is GlossaryEntry => !!e)
                  .map((e) => (
                    <Chip key={e.id} label={e.term} onPress={() => openTerm(e.id)} a11yLabel={`What ${e.term} means`} />
                  ))}
              </Chips>
            </View>
          )}
          <Pressable accessibilityRole="link" onPress={() => goFromSheet({ pathname: '/rituals/craft/cosmic/learn', params: { term: entry.id } } as unknown as Href)} style={styles.link}>
            <Text style={styles.linkText}>All of astrology, explained ›</Text>
          </Pressable>
          <Text style={type.caption}>Traditional meanings, offered for reflection. Nothing in a chart decides who you are.</Text>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  term: { color: colors.gold, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: colors.goldLine },
  switch: { flexDirection: 'row', alignSelf: 'flex-start', borderRadius: radius.chip, borderWidth: 1, borderColor: colors.goldLine, overflow: 'hidden' },
  switchItem: { minHeight: touch - 8, minWidth: 92, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  switchOn: { backgroundColor: colors.gold },
  switchText: { fontFamily: fonts.body, fontSize: 14, color: colors.parchment },
  switchTextOn: { fontFamily: fonts.bodySemi, color: colors.forestInk },
  chipsBlock: { gap: 6 },
  detail: { gap: 12 },
  detailPart: { gap: 4 },
  detailHead: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.gold },
  paras: { gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: 16, gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  flex: { flex: 1, minWidth: 160 },
  magic: { gap: 4, borderLeftWidth: 2, borderLeftColor: colors.goldLine, paddingLeft: 12 },
  sheetBody: { gap: 14 },
  link: { minHeight: touch, justifyContent: 'center' },
  linkText: { fontFamily: fonts.bodySemi, fontSize: 15, color: colors.gold },
});
