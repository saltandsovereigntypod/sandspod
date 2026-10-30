import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '../../../../components/Button';
import { Body, Card, Field, Notice, RitualScreen, Title } from '../../../../components/rituals/ui';
import { useCycle } from '../../../../lib/cycle/store';
import { useGrimoire } from '../../../../lib/grimoire/store';

const MOON_TIME_SECTION = 'Moon Time';

// A reflection on one cycle, kept in the Grimoire's Moon Time section (when
// chosen in Cycle & Moon's settings). Grimoire pages aren't encrypted, so
// only what's written here goes there: nothing is filled in from the
// encrypted notes, not even a date, unless the person types it.
export default function CycleKeep() {
  const { bleed } = useLocalSearchParams<{ bleed?: string }>();
  const cycle = useCycle();
  const grimoire = useGrimoire();
  const [title, setTitle] = useState('Moon time');
  const [text, setText] = useState('');
  const ref = `cycle-moon:${bleed ?? ''}`;
  const kept = grimoire.snapshot?.pages.find((p) => (p.metadata as { holyRef?: string } | null)?.holyRef === ref);

  return (
    <RitualScreen back="Cycle & Moon">
      <Title eyebrow="Cycle & Moon">Keep a reflection in my Grimoire</Title>
      <Card>
        <Body>Your Grimoire is kept with your account but isn’t encrypted. Only the words you write below go there, under Moon Time; your Cycle &amp; Moon notes stay encrypted.</Body>
      </Card>
      {!cycle.data?.settings.grimoire && <Notice>Turn on Moon Time in my Grimoire in Cycle &amp; Moon’s settings first.</Notice>}
      {!grimoire.canEdit && <Notice>Your Grimoire opens once you’re signed in and it has loaded.</Notice>}
      {kept ? (
        <Card>
          <Body>{`This cycle is already kept in your Grimoire as “${kept.title}”.`}</Body>
          <Button label="Open it" onPress={() => router.navigate({ pathname: '/grimoire/[pageId]', params: { pageId: kept.id } })} />
        </Card>
      ) : (
        <Card>
          <Field label="Page title" value={title} onChange={setTitle} />
          <Field label="What you’d like to keep" value={text} onChange={setText} placeholder="What this cycle taught you, a dream, a working…" multiline />
          <Button
            label="Keep it in my Grimoire"
            disabled={!text.trim() || !title.trim() || !grimoire.canEdit || !cycle.data?.settings.grimoire}
            onPress={() => {
              const id = grimoire.actions.saveHolyPage({ ref, title: title.trim(), sectionTitle: MOON_TIME_SECTION, blocks: [{ type: 'text', content: text.trim() }] });
              if (id) router.replace({ pathname: '/grimoire/[pageId]', params: { pageId: id } });
            }}
          />
        </Card>
      )}
    </RitualScreen>
  );
}
