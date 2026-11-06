import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { fullDate } from '../../../../../lib/calendar';
import { normalizeSession, SESSION_SAFETY, SPIRIT_SESSIONS, sessionTitle, toVerify, verifyTally } from '../../../../../lib/craft/hedge/sessions';
import { useCraft } from '../../../../../lib/craft/store';
import { type } from '../../../../../theme';

const open = (id: string) => router.push(`/rituals/divination/sessions/session?id=${id}` as Href);

// Spirit sessions: a log of sitting with spirits, ancestors and deities.
export default function Sessions() {
  const raw = useCraft<unknown>(SPIRIT_SESSIONS);
  const sessions = useMemo(() => raw.entries.map((e) => ({ ...e, data: normalizeSession(e.data) })).sort((a, b) => b.data.date.localeCompare(a.data.date)), [raw.entries]);
  const pending = toVerify(sessions);
  const tally = verifyTally(sessions);

  return (
    <RitualScreen back="Divination">
      <Title eyebrow="Divination · Hedge">Spirit sessions</Title>
      <Body muted>
        A record of the times you sit to speak with an ancestor, a deity, a spirit of place or a guide: by pendulum, spirit board, scrying, mediumship or trance. Who came, how you opened and closed, what protected you, what was asked and answered, and later, whether it bore out.
      </Body>
      <Button label="Log a session" onPress={() => router.push('/rituals/divination/sessions/edit' as Href)} />

      {pending.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Waiting to be checked</SectionLabel>
          <List>
            {pending.slice(0, 5).map((p, i, all) => (
              <Row key={`${p.id}-${p.index}`} icon="wheel" title={p.q || 'An answer'} detail={`${p.who || 'Whoever came'}, ${fullDate(p.date)}: “${p.a.slice(0, 60)}”`} last={i === all.length - 1} onPress={() => open(p.id)} />
            ))}
          </List>
        </View>
      )}
      {tally.checked > 0 && (
        <Body muted>{`Of ${tally.checked} answers checked: ${tally.yes} bore out, ${tally.partly} partly, ${tally.no} didn’t.${tally.checked >= 10 ? ` About ${tally.rate}% overall.` : ' A pattern needs more than ten to mean much.'}`}</Body>
      )}

      {!raw.ready ? (
        <Body muted>Opening…</Body>
      ) : sessions.length ? (
        <View style={ui.gapSmall}>
          <SectionLabel>Your sessions</SectionLabel>
          <List>
            {sessions.map((s, i) => (
              <Row key={s.id} icon="samhain" title={sessionTitle(s.data)} detail={[fullDate(s.data.date), s.data.moonPhase, s.data.closed ? '' : 'not closed'].filter(Boolean).join(' · ')} last={i === sessions.length - 1} onPress={() => open(s.id)} />
            ))}
          </List>
        </View>
      ) : (
        <Card>
          <Body>No sessions yet. Before your first, read the safety notes below, and decide how you’ll open and close.</Body>
        </Card>
      )}

      <Card>
        <SectionLabel>Safety</SectionLabel>
        {SESSION_SAFETY.map((s) => (
          <View key={s.title} style={ui.gapSmall}>
            <Text style={type.cardTitle}>{s.title}</Text>
            <Body>{s.text}</Body>
          </View>
        ))}
      </Card>
      <List>
        <Row icon="samhain" title="Ancestors" detail="Your beloved dead and their days" onPress={() => router.push('/rituals/craft/hedge/ancestors' as Href)} />
        <Row icon="wheel" title="Spirits of place" detail="The presences of your land" onPress={() => router.push('/rituals/craft/hearth/land/spirits' as Href)} />
        <Row icon="grimoire" title="Deity & spirit journal" detail="In your Grimoire" last onPress={() => router.push('/grimoire/journals' as Href)} />
      </List>
    </RitualScreen>
  );
}
