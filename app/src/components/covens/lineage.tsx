// Daughter covens on the coven's screens: the disclosure people read before
// joining, the lineage card (mother and daughters), and the choice of what
// to carry across (lib/covens/lineage.ts).

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';

import { covenHref } from './CovenScreen';
import { Card, CheckRow, MenuList, MenuRow, Section } from '../more/ui';
import { COPY_CHOICES, copyDetail, daughterDetail, daughterLabel, hivedLine, NEVER_COPIED, type CopyChoice, type Lineage } from '../../lib/covens/lineage';
import { fetchDisclosure } from '../../lib/covens/lineageApi';
import { type } from '../../theme';

/** A daughter coven's disclosure, by its address (anyone may read it, signed in or not). Null when it isn't a daughter. */
export function useDisclosure(slug: string | null | undefined): string | null {
  const [found, setFound] = useState<{ slug: string; text: string | null } | null>(null);
  useEffect(() => {
    if (!slug) return;
    let off = false;
    void fetchDisclosure(slug).then((d) => {
      if (!off) setFound({ slug, text: d?.text ?? null });
    });
    return () => {
      off = true;
    };
  }, [slug]);
  return found && found.slug === slug ? found.text : null;
}

/** "{Daughter} is a daughter coven of {Mother}. …final say over this coven." Shown before anyone joins. */
export function DisclosureCard({ text, joining }: { text: string | null | undefined; joining?: boolean }) {
  if (!text) return null;
  return (
    <Card tone="gold">
      <Text style={type.eyebrow}>A daughter coven</Text>
      <Text style={type.body}>{text}</Text>
      {joining && <Text style={type.caption}>By joining, you join under that final say. The member agreement says so too.</Text>}
    </Card>
  );
}

/** "Hived from {Mother} in {month year}" and "Daughter covens", each a link to the coven's page where you may see it. */
export function LineageSection({ lineage, slug }: { lineage: Lineage | null; slug: string }) {
  if (!lineage || (!lineage.mother && !lineage.daughters.length)) return null;
  const open = (to: string | null | undefined) => (to ? () => router.push(covenHref(to)) : undefined);
  return (
    <Section label="Lineage">
      <MenuList>
        {lineage.mother && (
          <MenuRow
            label={hivedLine(lineage)}
            detail={lineage.mother.head ? `${lineage.mother.head.title} ${lineage.mother.head.name} has final say here` : undefined}
            icon="community"
            last={!lineage.daughters.length && !lineage.above.length}
            onPress={open(lineage.mother.slug)}
          />
        )}
        {lineage.above.map((a, i) => (
          <MenuRow key={a.id} label={`Descends from ${a.name ?? 'an unlisted coven'}`} detail={a.head ? `${a.head.title} ${a.head.name} has final say too` : undefined} icon="community" last={i === lineage.above.length - 1 && !lineage.daughters.length} onPress={open(a.slug)} />
        ))}
        {lineage.daughters.map((d, i) => (
          <MenuRow key={d.id} label={daughterLabel(d)} detail={daughterDetail(d) || 'Daughter coven'} icon="community" last={i === lineage.daughters.length - 1} onPress={open(d.slug)} />
        ))}
      </MenuList>
      {lineage.daughters.length > 0 && <Text style={type.caption}>Daughter covens hived from this one. Its head has final say in each.</Text>}
      <MenuList>
        <MenuRow label="Lineage and daughter covens" detail="Found a daughter, what’s shared, the log" icon="journey" last onPress={() => router.push(covenHref(slug, 'lineage'))} />
      </MenuList>
    </Section>
  );
}

/** Choose what to carry across from the mother coven. */
export function CopyPicker({ value, onChange, mother }: { value: Partial<Record<CopyChoice, boolean>>; onChange: (next: Partial<Record<CopyChoice, boolean>>) => void; mother: string }) {
  return (
    <View style={styles.picker}>
      {COPY_CHOICES.map((c) => (
        <CheckRow key={c.key} label={c.label} value={!!value[c.key]} onChange={(on) => onChange({ ...value, [c.key]: on })}>
          <Text style={type.caption}>{copyDetail(c, mother)}</Text>
        </CheckRow>
      ))}
      <Text style={type.caption}>{NEVER_COPIED} Copies are the new coven’s own; changing one never changes the other.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: { gap: 8 },
});
