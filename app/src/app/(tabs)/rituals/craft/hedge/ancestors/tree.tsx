import { router, type Href } from 'expo-router';
import { useMemo } from 'react';

import { Button } from '../../../../../../components/Button';
import { asPeople, TreeView } from '../../../../../../components/craft/FamilyTree';
import { AncestorJournalLink } from '../../../../../../components/journals/screens';
import { Body, Card, RitualScreen, Title } from '../../../../../../components/rituals/ui';
import { ANCESTORS } from '../../../../../../lib/craft/hedge/ancestors';
import { useCraft } from '../../../../../../lib/craft/store';

// The family tree, drawn from the links on each ancestor's page.
export default function FamilyTreeScreen() {
  const { entries, ready } = useCraft<unknown>(ANCESTORS);
  const people = useMemo(() => asPeople(entries), [entries]);
  const linked = people.some((p) => p.data.myParent || p.data.parents?.length || p.data.partners?.length);
  return (
    <RitualScreen back="Ancestors">
      <Title eyebrow="Ancestors">The family tree</Title>
      <Body muted>Built from the people you remember: mark who were your parents, and give each person their parents and partners on their page. Tap anyone to open their page and their days.</Body>
      {!ready ? (
        <Body muted>Opening…</Body>
      ) : people.length === 0 ? (
        <Card>
          <Body>No one is here yet. Add the people you remember, then link them to draw the tree.</Body>
        </Card>
      ) : (
        <>
          {!linked && (
            <Card>
              <Body>Nobody is linked yet, so everyone stands together below. Open someone, choose Edit, and under “In the family tree” mark them as one of your parents or pick their parents and partners.</Body>
            </Card>
          )}
          <TreeView people={people} />
        </>
      )}
      <Body muted>Bloodlines are only one way of belonging. Adopted, fostered and step-family, chosen family, teachers and the beloved dead without a line are kin here; those not linked by blood are drawn with a dashed edge.</Body>
      <Button label="Add someone" variant="outline" onPress={() => router.push('/rituals/craft/hedge/ancestors/edit' as Href)} />
      <AncestorJournalLink />
    </RitualScreen>
  );
}
