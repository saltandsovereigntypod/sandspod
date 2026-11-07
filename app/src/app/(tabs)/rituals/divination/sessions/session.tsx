import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { fullDate } from '../../../../../lib/calendar';
import { AFTERS, CHECKS, normalizeSession, PROTECTIONS, SESSION_METHODS, sessionCautions, SPIRIT_SESSIONS, sessionTitle, WHO_KINDS, type Check } from '../../../../../lib/craft/hedge/sessions';
import { updateEntry, useCraft } from '../../../../../lib/craft/store';
import { type } from '../../../../../theme';

const LINK_HREF: Record<string, (id: string) => string> = {
  ancestor: (id) => `/rituals/craft/hedge/ancestors/${id}`,
  'place-spirit': (id) => `/rituals/craft/hearth/land/spirit?id=${id}`,
  familiar: (id) => `/rituals/craft/hearth/familiars/familiar?id=${id}`,
};

export default function SessionPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const raw = useCraft<unknown>(SPIRIT_SESSIONS);
  const entry = raw.entries.find((e) => e.id === id) ?? null;
  const s = useMemo(() => (entry ? normalizeSession(entry.data) : null), [entry]);
  if (!entry || !s) {
    return (
      <RitualScreen back="Spirit sessions">
        <Title>A session</Title>
        <Body>{raw.ready ? 'This page couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const method = SESSION_METHODS.find((m) => m.id === s.method);
  const setCheck = (i: number, check: Check) => void updateEntry(SPIRIT_SESSIONS, entry.id, { ...s, exchanges: s.exchanges.map((x, j) => (j === i ? { ...x, check } : x)) });
  const linkHref = s.link && LINK_HREF[s.link.kind]?.(s.link.id);

  return (
    <RitualScreen back="Spirit sessions">
      <Title eyebrow={`${fullDate(s.date)} · ${s.moonPhase}`}>{sessionTitle(s)}</Title>
      <Body muted>{[WHO_KINDS.find((w) => w.id === s.whoKind)?.label, method?.label].filter(Boolean).join(' · ')}</Body>
      {!!s.intention && <Body>{s.intention}</Body>}
      {sessionCautions(s).map((c) => (
        <Card key={c} accent>
          <Body>{c}</Body>
        </Card>
      ))}

      {s.protections.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Protections</SectionLabel>
          <Chips label="Protections">
            {s.protections.map((p) => (
              <Chip key={p} label={PROTECTIONS.find((x) => x.id === p)?.label ?? p} />
            ))}
          </Chips>
        </View>
      )}
      {!!s.opening && (
        <View style={ui.gapSmall}>
          <SectionLabel>Opening</SectionLabel>
          <Body>{s.opening}</Body>
        </View>
      )}

      {s.exchanges.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Questions and answers</SectionLabel>
          {s.exchanges.map((x, i) => (
            <Card key={i}>
              {!!x.q && <Text style={type.cardTitle}>{x.q}</Text>}
              <Body>{x.a || '(no answer)'}</Body>
              <Body muted>Did it bear out?</Body>
              <Chips>
                {CHECKS.map((c) => (
                  <Chip key={c.id} label={c.label} selected={x.check === c.id} onPress={() => setCheck(i, c.id)} />
                ))}
              </Chips>
              {!!x.checkNote && <Body muted>{x.checkNote}</Body>}
            </Card>
          ))}
        </View>
      )}
      {!!s.impressions && (
        <View style={ui.gapSmall}>
          <SectionLabel>Impressions</SectionLabel>
          <Body>{s.impressions}</Body>
        </View>
      )}
      {!!s.closing && (
        <View style={ui.gapSmall}>
          <SectionLabel>{s.closed ? 'Closing' : 'Closing (not completed)'}</SectionLabel>
          <Body>{s.closing}</Body>
        </View>
      )}
      {(!!s.after || !!s.aftercare) && <Body muted>{[s.after ? `Afterwards: ${AFTERS.find((a) => a.id === s.after)?.label.toLowerCase()}` : '', s.aftercare].filter(Boolean).join('. ')}</Body>}

      <Button label="Edit" variant="outline" onPress={() => router.push(`/rituals/divination/sessions/edit?id=${entry.id}` as Href)} />
      <List>
        {!!linkHref && <Row icon="samhain" title={s.link!.title || 'Who came'} detail="Their page" onPress={() => router.push(linkHref as Href)} />}
        {s.method === 'cards' && <Row icon="wheel" title="Log the cards drawn" detail="As a reading in Divination" onPress={() => router.push('/rituals/divination/edit' as Href)} />}
        <Row icon="wheel" title="All sessions" last onPress={() => router.push('/rituals/divination/sessions' as Href)} />
      </List>
      {!!method?.history && <Body muted>{method.history}</Body>}
    </RitualScreen>
  );
}
