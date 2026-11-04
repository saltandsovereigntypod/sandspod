// Reminders → Your ancestors' days: birthdays, death days and the days kept
// for each person in Hedge → Ancestors, rung with the sacred days.

import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Body, Card, List, Row, SectionLabel, Toggle, ui } from '../rituals/ui';
import { LeadChips, TimeRow } from './parts';
import { relativeDay } from '../../lib/calendar';
import { ANCESTORS, anniversaryTitle, normalizeAncestor, upcomingAnniversaries } from '../../lib/craft/hedge/ancestors';
import { useCraft } from '../../lib/craft/store';
import { withChange, type ReminderPrefs } from '../../lib/reminders/prefs';

export function AncestorsSection({ prefs, update }: { prefs: ReminderPrefs; update: (next: ReminderPrefs) => void }) {
  const a = prefs.ancestors;
  const set = (path: string, value: unknown) => update(withChange(prefs, `ancestors.${path}`, value));
  const { entries } = useCraft<unknown>(ANCESTORS);
  const now = useMemo(() => new Date(), []);
  const coming = useMemo(() => upcomingAnniversaries(entries.map((e) => ({ ...e, data: normalizeAncestor(e.data) })), now, 60), [entries, now]);
  return (
    <>
      <Card>
        <Toggle
          label="Remind me of their days"
          detail="Birthdays, the days they died, and the days you keep for them"
          value={a.on}
          onChange={(on) => set('on', on)}
        />
        {a.on && (
          <>
            <LeadChips value={a.leads} onChange={(leads) => set('leads', leads)} />
            <TimeRow label="At" minutes={a.at} onChange={(at) => set('at', at)} />
          </>
        )}
        <Body muted>Only days with a day and month are reminded of. Add them on each person’s page.</Body>
      </Card>
      <View style={ui.gapSmall}>
        <SectionLabel>In the next two months</SectionLabel>
        {coming.length ? (
          <List>
            {coming.map((x, i) => (
              <Row
                key={`${x.id}:${x.kind}:${x.label ?? ''}`}
                icon="samhain"
                title={anniversaryTitle(x)}
                detail={relativeDay(now, x.date)}
                onPress={() => router.push(`/rituals/craft/hedge/ancestors/${x.id}` as Href)}
                last={i === coming.length - 1}
              />
            ))}
          </List>
        ) : (
          <Body muted>None of your ancestors’ days fall in the next two months.</Body>
        )}
      </View>
      <List>
        <Row icon="samhain" title="Your ancestors" detail="Hedge → Ancestors: their dates, photos, stories and days" onPress={() => router.push('/rituals/craft/hedge/ancestors' as Href)} last />
      </List>
    </>
  );
}
