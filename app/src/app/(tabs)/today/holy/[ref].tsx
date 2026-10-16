import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Card, MoreScreen, Paragraphs, Section, Tags } from '../../../../components/more/ui';
import { MOON_CALENDAR } from '../../../../lib/calendars/moon';
import { timeOfDay } from '../../../../lib/calendar';
import { vocForDay } from '../../../../lib/craft/cosmic/hours';
import { useGrimoire } from '../../../../lib/grimoire/store';
import { findHolyGrimoirePage, grimoireSection, holyBlocks, holyPage } from '../../../../lib/holy';
import { findByName, todayLibraryHref, useLibrary } from '../../../../lib/library';
import { moonSign, moonState } from '../../../../lib/moon';
import { premadeById } from '../../../../lib/rituals/premade';
import { useSession } from '../../../../lib/session';
import { colors, fonts, type } from '../../../../theme';

// A holy day or a moon phase, opened from Today: what it is, who is honoured,
// what we know, how to keep it, a working, and its correspondences. Signed in,
// it's kept in your Grimoire (or linked, if you already have a page for it).
export default function HolyDay() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const page = holyPage(ref);
  const { entries } = useLibrary();
  const premade = page?.ritual.premade ? premadeById(page.ritual.premade) : null;

  if (!page) {
    return (
      <MoreScreen title="Not found" eyebrow="Holy days" back="/today" backLabel="Back to Today">
        <Text style={type.body}>There isn’t a page for this day yet.</Text>
      </MoreScreen>
    );
  }

  const c = page.correspondences;
  const groups: [string, string[] | undefined][] = [
    ['Deities', c.deities],
    ['Herbs', c.herbs],
    ['Crystals', c.crystals],
    ['Colours', c.colors],
    ['Foods', c.foods],
    ['Symbols', c.symbols],
  ];
  const open = (name: string) => {
    const entry = findByName(entries, name);
    return entry ? () => router.push(todayLibraryHref(entry) as Href) : undefined;
  };

  return (
    <MoreScreen title={page.title} eyebrow={page.tradition} back="/today" backLabel="Back to Today">
      <Text style={styles.summary}>{page.summary}</Text>
      {page.ref.startsWith('moon-') && <MoonTonight />}
      <KeepInGrimoire ref_={page.ref} />

      <Section label="Who is honoured, and why">
        <Paragraphs items={page.honours.split(/\n\s*\n/)} />
      </Section>

      <Section label="History">
        <Paragraphs items={page.history.split(/\n\s*\n/)} />
      </Section>

      {!!page.respect && (
        <Card tone="gold">
          <Text style={styles.label}>With respect</Text>
          <Paragraphs items={page.respect.split(/\n\s*\n/)} />
        </Card>
      )}

      {page.celebrate.length > 0 && (
        <Section label="Keeping it today">
          {page.celebrate.map((line, i) => (
            <View key={i} style={styles.bullet}>
              <Text style={[type.body, styles.dot]}>•</Text>
              <Text style={[type.body, styles.flex]}>{line}</Text>
            </View>
          ))}
        </Section>
      )}

      {(premade || page.ritual.outline?.length) && (
        <Section label="A working">
          <Card>
            <Text style={type.cardTitle}>{page.ritual.title ?? premade?.title ?? 'A working for the day'}</Text>
            {premade && <Text style={type.caption}>{premade.summary}</Text>}
            {page.ritual.outline?.map((step, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={[type.body, styles.dot]}>{`${i + 1}.`}</Text>
                <Text style={[type.body, styles.flex]}>{step}</Text>
              </View>
            ))}
            <View style={styles.row}>
              {premade && (
                <Button label="Open the working" variant="pill" onPress={() => router.push({ pathname: '/rituals/premade/[id]', params: { id: premade.id } } as Href)} />
              )}
              <Button label="Plan a ritual" variant="outline" onPress={() => router.push('/rituals/planner' as Href)} />
            </View>
          </Card>
        </Section>
      )}

      {groups.some(([, items]) => items?.length) && (
        <Section label="Correspondences">
          {groups.map(([label, items]) =>
            items?.length ? (
              <View key={label} style={styles.group}>
                <Text style={styles.label}>{label}</Text>
                <Tags items={items} onPress={open} />
              </View>
            ) : null,
          )}
          <Text style={type.caption}>Tap one the Living Library has to open it.</Text>
        </Section>
      )}

      <Section label="What we know">
        <Paragraphs items={page.knowAndDont.known.split(/\n\s*\n/)} />
      </Section>
      <Section label="What we don’t">
        <Paragraphs items={page.knowAndDont.unknown.split(/\n\s*\n/)} />
      </Section>

      {page.sources.length > 0 && (
        <Section label="Sources">
          {page.sources.map((s, i) => (
            <Text key={i} selectable style={type.caption}>
              {s}
            </Text>
          ))}
        </Section>
      )}
    </MoreScreen>
  );
}

/** The moon as it is now: phase, sign, its name this month, and any void-of-course time today. */
function MoonTonight() {
  const now = useMemo(() => new Date(), []);
  const moon = moonState(now);
  const name = useMemo(() => {
    try {
      return MOON_CALENDAR.dateOf(now, { place: null, hemisphere: 'north', options: {} }).long;
    } catch {
      return null;
    }
  }, [now]);
  const voc = useMemo(() => vocForDay(new Date(now.getFullYear(), now.getMonth(), now.getDate())), [now]);
  return (
    <Card>
      <Text style={styles.label}>Tonight</Text>
      <Text style={type.body}>{`${moon.name} in ${moonSign(now)}, ${Math.round(moon.illumination * 100)}% lit`}</Text>
      {!!name && <Text style={type.caption}>{name}</Text>}
      {voc.length > 0 ? (
        voc.map((v, i) => (
          <Text key={i} style={type.caption}>{`Void of course ${timeOfDay(v.start)}–${timeOfDay(v.end)}, until it enters ${v.nextSign}: traditionally a time to finish things, not begin them.`}</Text>
        ))
      ) : (
        <Text style={type.caption}>No void-of-course time today.</Text>
      )}
    </Card>
  );
}

/** Kept in your Grimoire: linked if you already have it, saved the first time you open it. */
function KeepInGrimoire({ ref_ }: { ref_: string }) {
  const { session } = useSession();
  const grimoire = useGrimoire();
  const page = holyPage(ref_);
  const premade = page?.ritual.premade ? premadeById(page.ritual.premade) : null;
  const existing = page && grimoire.snapshot ? findHolyGrimoirePage(grimoire.snapshot.pages, grimoire.snapshot.sections, page) : null;
  const [saved, setSaved] = useState<string | null>(null);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current || !page || !session || !grimoire.canEdit || !grimoire.snapshot || existing) return;
    tried.current = true;
    const id = grimoire.actions.saveHolyPage({ ref: page.ref, title: page.title, sectionTitle: grimoireSection(page), blocks: holyBlocks(page, premade?.title) });
    if (id) setSaved(id);
  }, [page, session, grimoire, existing, premade?.title]);

  if (!page) return null;
  if (!session) {
    return <Text style={type.caption}>Sign in to keep pages like this in your Grimoire, with room for your own notes.</Text>;
  }
  const pageId = existing?.id ?? saved;
  if (!pageId) return null;
  return (
    <Card>
      <Text style={styles.label}>{saved && !existing ? 'Saved to your Grimoire' : 'In your Grimoire'}</Text>
      <Text style={type.caption}>{`Under ${grimoireSection(page)}, with room for your own notes.`}</Text>
      <View style={styles.row}>
        <Button label="Open the page" variant="outline" onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId } } as Href)} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { fontFamily: fonts.displayItalic, fontSize: 20, lineHeight: 27, color: colors.cream },
  label: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.gold },
  bullet: { flexDirection: 'row', gap: 8 },
  dot: { color: colors.gold, minWidth: 16 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  group: { gap: 6 },
});
