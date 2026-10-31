// On a coven gathering's page: its rituals together under way (anyone the
// gathering is for can join from here), and, for those who lead it, Begin
// together, so members far apart can do the rite live at the same time.

import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../Button';
import { Section } from '../more/ui';
import type { Ritual, RitualStep } from '../../lib/covens/model';
import { covenLive } from '../../lib/together/api';
import { isOver, startFromGathering, statusLine, type LiveRitual } from '../../lib/together/live';
import { type } from '../../theme';
import { beginTogether } from './BeginTogether';

export function GatheringTogether({ ritual, steps, covenSlug, canLead }: { ritual: Ritual; steps: RitualStep[]; covenSlug: string; canLead: boolean }) {
  const [open, setOpen] = useState<LiveRitual[]>([]);
  useEffect(() => {
    let live = true;
    covenLive(ritual.coven_id)
      .then((list) => live && setOpen(list.filter((l) => l.coven_ritual_id === ritual.id && !isOver(l))))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [ritual.coven_id, ritual.id]);
  if (!open.length && !(canLead && steps.length && ritual.status !== 'cancelled')) return null;
  return (
    <Section label="Together from afar">
      <View style={{ gap: 8 }}>
        {open.map((l) => (
          <View key={l.id} style={{ gap: 4 }}>
            <Text style={type.body}>
              {l.title} · {statusLine(l)}
            </Text>
            <Button label="Join the ritual together" variant="outline" onPress={() => router.push(`/rituals/together/${l.id}` as Href)} />
          </View>
        ))}
        {canLead && steps.length > 0 && ritual.status !== 'cancelled' && (
          <>
            <Text style={type.caption}>Do this rite live with members wherever they are: everyone follows the same step as you lead, lights a candle together and closes it together.</Text>
            <Button label="Begin together" variant="outline" onPress={() => beginTogether(startFromGathering(ritual, steps, covenSlug), { coven_id: ritual.coven_id, gathering_id: ritual.id })} />
          </>
        )}
      </View>
    </Section>
  );
}
