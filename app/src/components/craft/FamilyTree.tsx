// The family tree's pieces: the links on an ancestor's form (their parents,
// partners, kin and whether they were one of your parents), the family on
// their page, and the tree itself. The logic is lib/craft/hedge/familyTree.ts.

import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Body, Chip, Chips, List, Row, SectionLabel, Toggle, ui } from '../rituals/ui';
import { KIN_KINDS, normalizeAncestor, type Ancestor, type AncestorEntry } from '../../lib/craft/hedge/ancestors';
import { buildTree, couplesIn, linkChoices, relativesOf, treeDetail, wouldLoop } from '../../lib/craft/hedge/familyTree';
import { colors, fonts, type } from '../../theme';

export const ANCESTOR_HREF = (id: string) => `/rituals/craft/hedge/ancestors/${id}` as Href;
export const TREE_HREF = '/rituals/craft/hedge/ancestors/tree' as Href;

export const asPeople = (entries: { id: string; createdAt: string; data: unknown }[]): AncestorEntry[] => entries.map((e) => ({ id: e.id, createdAt: e.createdAt, data: normalizeAncestor(e.data) }));

/** On the form: how they're kin, and who their parents and partners are. */
export function FamilyFields({ people, selfId, person, set }: { people: AncestorEntry[]; selfId: string | null; person: Ancestor; set: (patch: Partial<Ancestor>) => void }) {
  const choices = useMemo(() => linkChoices(people, selfId), [people, selfId]);
  const parents = person.parents ?? [];
  const partners = person.partners ?? [];
  const toggle = (list: string[], id: string, max: number) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id].slice(-max));
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>In the family tree (optional)</SectionLabel>
      <Chips label="In the family tree (optional)">
        {KIN_KINDS.map((k) => (
          <Chip key={k.id} label={k.label} selected={person.kin === k.id} onPress={() => set({ kin: person.kin === k.id ? '' : k.id })} />
        ))}
      </Chips>
      <Toggle label="One of my parents" detail="Someone who gave you life or raised you: the tree’s first generation up." value={!!person.myParent} onChange={(myParent) => set({ myParent })} />
      {choices.length > 0 ? (
        <>
          <Body muted>Their parents, among the people you remember</Body>
          <Chips>
            {choices.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                selected={parents.includes(c.id)}
                a11yLabel={`${c.name} as their parent`}
                onPress={() => !wouldLoop(people, selfId, c.id) && set({ parents: toggle(parents, c.id, 4) })}
              />
            ))}
          </Chips>
          <Body muted>Their partners</Body>
          <Chips multiple>
            {choices.map((c) => (
              <Chip key={c.id} label={c.name} selected={partners.includes(c.id)} a11yLabel={`${c.name} as their partner`} onPress={() => set({ partners: toggle(partners, c.id, 6) })} />
            ))}
          </Chips>
        </>
      ) : (
        <Body muted>Once you’ve added others, you can link parents and partners here and they’ll find their places in the tree.</Body>
      )}
      <Body muted>Chosen family, teachers and friends needn’t be linked: they keep their own place beside the tree.</Body>
    </View>
  );
}

/** On their page: parents, partners, children and siblings, each a tap away. */
export function FamilySection({ people, id }: { people: AncestorEntry[]; id: string }) {
  const r = useMemo(() => relativesOf(people, id), [people, id]);
  const name = (x: string) => people.find((p) => p.id === x)?.data.name || 'Unnamed';
  const rows = [
    ...r.parents.map((x) => ({ x, role: 'Parent' })),
    ...r.partners.map((x) => ({ x, role: 'Partner' })),
    ...r.siblings.map((x) => ({ x, role: 'Sibling' })),
    ...r.children.map((x) => ({ x, role: 'Child' })),
  ];
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Family</SectionLabel>
      {rows.length > 0 && (
        <List>
          {rows.map((row, i) => (
            <Row key={`${row.role}-${row.x}`} icon="samhain" title={name(row.x)} detail={row.role} last={i === rows.length - 1} onPress={() => router.push(ANCESTOR_HREF(row.x))} />
          ))}
        </List>
      )}
      <List>
        <Row icon="wheel" title="The family tree" detail="Generations up, partners side by side, and chosen family beside" last onPress={() => router.push(TREE_HREF)} />
      </List>
    </View>
  );
}

function Person({ entry }: { entry: AncestorEntry }) {
  const detail = treeDetail(entry.data);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[entry.data.name || 'Unnamed', detail].filter(Boolean).join('. ')}
      onPress={() => router.push(ANCESTOR_HREF(entry.id))}
      style={({ pressed }) => [styles.person, entry.data.kin && entry.data.kin !== 'blood' && styles.chosen, pressed && styles.pressed]}
    >
      <Text style={styles.name}>{entry.data.name || 'Unnamed'}</Text>
      {!!detail && <Text style={type.caption}>{detail}</Text>}
    </Pressable>
  );
}

/** The tree: oldest generation at the top, couples joined, the unlinked beside. */
export function TreeView({ people }: { people: AncestorEntry[] }) {
  const tree = useMemo(() => buildTree(people), [people]);
  const byId = (id: string) => people.find((p) => p.id === id)!;
  return (
    <View style={ui.gap}>
      {tree.generations.map((g, gi) => (
        <View key={g.level} style={ui.gapSmall}>
          <SectionLabel>{g.label}</SectionLabel>
          <View style={styles.generation}>
            {couplesIn(people, g.ids).map((couple) => (
              <View key={couple.join('+')} style={[styles.couple, couple.length > 1 && styles.joined]} accessibilityLabel={couple.length > 1 ? 'Partners' : undefined}>
                {couple.map((id) => (
                  <Person key={id} entry={byId(id)} />
                ))}
              </View>
            ))}
          </View>
          {gi < tree.generations.length - 1 && <Text style={styles.down} accessibilityElementsHidden importantForAccessibility="no">│</Text>}
        </View>
      ))}
      {tree.unplaced.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>{tree.generations.length ? 'Beside the tree' : 'Your people'}</SectionLabel>
          <Body muted>Chosen family, teachers, friends and the beloved dead not linked by blood: kin all the same.</Body>
          <View style={styles.generation}>
            {tree.unplaced.map((id) => (
              <Person key={id} entry={byId(id)} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  generation: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  couple: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  joined: { borderWidth: 1, borderColor: colors.hairline, borderRadius: 14, padding: 4 },
  person: { minWidth: 120, maxWidth: 220, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, gap: 2 },
  chosen: { borderStyle: 'dashed' },
  pressed: { opacity: 0.7 },
  name: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
  down: { color: colors.gold, textAlign: 'center' },
});
