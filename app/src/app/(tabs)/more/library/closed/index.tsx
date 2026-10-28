import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { Card, Chips, Field, MenuList, MenuRow, MoreScreen, Paragraphs, Section } from '../../../../../components/more/ui';
import { ClosedNotice } from '../../../../../components/library/ClosedNotice';
import { ResearchFooter } from '../../../../../components/ResearchNote';
import {
  CLOSED_GUIDE_TITLE,
  CLOSED_TRADITIONS,
  closedGroups,
  OPENNESS_DETAIL,
  OPENNESS_LABELS,
  searchClosed,
  type Openness,
} from '../../../../../lib/library/closed';
import { type } from '../../../../../theme';

const INTRO = [
  'Some traditions belong to a particular people. They are held by a nation, a family line or a community, often carried through times when people tried to stamp them out, and they are alive today. We call these closed: you come to them as a guest, not a practitioner, unless the people themselves bring you in.',
  'Others are initiatory. People of many backgrounds belong to them, but always through a door: a house, a godparent, an elder or a teacher who takes responsibility for you. The knowledge lives in that relationship, not on a page. And some are debated, where people inside the tradition genuinely disagree about outsiders. There we give both views rather than pick one.',
  'None of this is secrecy for its own sake. It’s about whose it is. A ceremony, a song or a relationship with a spirit is part of a people’s life; lifted out of it, learned from a book or sold, it tends to hurt the people it came from and to lose what made it matter.',
  'Being a good guest is simple: listen to the people themselves, buy from them, come when you’re invited, don’t claim a title you weren’t given, and take no as a full answer.',
  'So this guide explains these traditions, where they come from and how people really come into them, and it corrects common myths. It doesn’t teach workings, ceremonies or how to call a spirit, and it won’t. That isn’t ours to teach. If something here calls to you, the next step is to learn from them.',
];

type Filter = 'all' | Openness;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'closed', label: OPENNESS_LABELS.closed },
  { value: 'initiatory', label: OPENNESS_LABELS.initiatory },
  { value: 'debated', label: OPENNESS_LABELS.debated },
];

export default function ClosedTraditionsIndex() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const groups = useMemo(
    () => closedGroups(searchClosed(query).filter((t) => filter === 'all' || t.openness === filter)),
    [query, filter],
  );
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <MoreScreen title="Closed & living traditions" eyebrow="Living Library" back="/more/library" backLabel="Back to the Library">
      <ClosedNotice />

      <Section label="What closed means and why it matters">
        <Card tone="gold">
          <Paragraphs items={INTRO} />
        </Card>
      </Section>

      {CLOSED_TRADITIONS.length > 0 && (
        <>
          <Field
            label="Search the traditions"
            value={query}
            onChangeText={setQuery}
            placeholder="Name or another spelling…"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          <Chips label="Openness" options={FILTERS} value={filter} onChange={setFilter} />
          {filter !== 'all' && <Text style={type.caption}>{OPENNESS_DETAIL[filter]}</Text>}
        </>
      )}

      <Text style={type.caption} accessibilityLiveRegion="polite">
        {CLOSED_TRADITIONS.length === 0
          ? 'The traditions are on their way.'
          : count === 0
            ? 'Nothing here matches that.'
            : `${count} ${count === 1 ? 'tradition' : 'traditions'}`}
      </Text>

      {groups.map((g) => (
        <Section key={g.group} label={g.label}>
          <MenuList>
            {g.items.map((t, index) => (
              <MenuRow
                key={t.id}
                label={t.name}
                detail={`${OPENNESS_LABELS[t.openness]} · ${t.summary}`}
                last={index === g.items.length - 1}
                onPress={() => router.push({ pathname: '/more/library/closed/[id]', params: { id: t.id } })}
              />
            ))}
          </MenuList>
        </Section>
      ))}

      <ResearchFooter page={CLOSED_GUIDE_TITLE} kind="Living Library" />
    </MoreScreen>
  );
}
