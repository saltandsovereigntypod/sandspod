import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { pathName } from '../../../../lib/library/traditions';
import { INTENTIONS } from '../../../../lib/rituals/planner';
import { filterPremade, forYou, forYouContext, PRACTICES, practiceName, PREMADE, type Premade } from '../../../../lib/rituals/premade';
import { useMySettings } from '../../../../lib/settings/store';
import { type } from '../../../../theme';

const KINDS = [
  { value: null, label: 'All' },
  { value: 'ritual', label: 'Rituals' },
  { value: 'spell', label: 'Spells' },
] as const;

function premadeDetail(p: Premade): string {
  return [p.kind === 'spell' ? 'Spell' : 'Ritual', `${p.minutes} min`, p.practices.map(practiceName).slice(0, 2).join(', ')].filter(Boolean).join(' · ');
}

export default function PremadeBook() {
  const { settings } = useMySettings();
  const ctx = useMemo(() => forYouContext(settings, new Date()), [settings]);
  const suggested = useMemo(() => forYou(ctx), [ctx]);
  const [query, setQuery] = useState('');
  const [practice, setPractice] = useState<string | null>(null);
  const [intention, setIntention] = useState<string | null>(null);
  const [kind, setKind] = useState<'ritual' | 'spell' | null>(null);
  const [path, setPath] = useState<string | null>(null);

  // Your own practices first, then the rest.
  const practices = [...PRACTICES.filter((p) => ctx.practices.includes(p.id)), ...PRACTICES.filter((p) => !ctx.practices.includes(p.id))];
  const paths = useMemo(() => {
    const ids = [...new Set(PREMADE.flatMap((p) => p.paths))];
    return [...ids.filter((id) => ctx.paths.includes(id)), ...ids.filter((id) => !ctx.paths.includes(id))];
  }, [ctx.paths]);
  const filtering = !!(query.trim() || practice || intention || kind || path);
  const shown = useMemo(() => filterPremade(PREMADE, { query, practice, intention, kind, path }), [query, practice, intention, kind, path]);

  const open = (p: Premade) => router.push({ pathname: '/rituals/premade/[id]', params: { id: p.id } });

  return (
    <RitualScreen back="Rituals">
      <Title eyebrow="Premade">Rituals & spells</Title>
      <Body muted>
        Workings from the Wheel of the Year, the old folk ways and every kind of practice, written for you to begin, plan, or make your own.
      </Body>

      {!filtering && suggested.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>For you tonight</SectionLabel>
          <List>
            {suggested.map((p, i, all) => (
              <Row key={p.id} icon="wheel" title={p.title} detail={premadeDetail(p)} last={i === all.length - 1} onPress={() => open(p)} />
            ))}
          </List>
          {!ctx.practices.length && (
            <Body muted>Choose your practice in Settings → My practice and these will follow it.</Body>
          )}
        </View>
      )}

      <Card>
        <Field label="Search" value={query} onChange={setQuery} placeholder="Moon water, Samhain, protection jar…" />
        <Text style={type.eyebrow}>Kind</Text>
        <Chips>
          {KINDS.map((k) => (
            <Chip key={k.label} label={k.label} selected={kind === k.value} onPress={() => setKind(k.value)} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Practice</Text>
        <Chips>
          <Chip label="Any" selected={!practice} onPress={() => setPractice(null)} />
          {practices.map((p) => (
            <Chip key={p.id} label={p.name} selected={practice === p.id} onPress={() => setPractice(practice === p.id ? null : p.id)} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Intention</Text>
        <Chips>
          <Chip label="Any" selected={!intention} onPress={() => setIntention(null)} />
          {INTENTIONS.map((i) => (
            <Chip key={i.key} label={i.label} selected={intention === i.key} onPress={() => setIntention(intention === i.key ? null : i.key)} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>Path</Text>
        <Chips>
          <Chip label="Any" selected={!path} onPress={() => setPath(null)} />
          {paths.map((id) => (
            <Chip key={id} label={pathName(id)} selected={path === id} onPress={() => setPath(path === id ? null : id)} />
          ))}
        </Chips>
      </Card>

      <View style={ui.gapSmall}>
        <SectionLabel>{filtering ? `${shown.length} ${shown.length === 1 ? 'working' : 'workings'}` : `All ${PREMADE.length} workings`}</SectionLabel>
        {shown.length ? (
          <List>
            {shown.map((p, i, all) => (
              <Row key={p.id} title={p.title} detail={premadeDetail(p)} last={i === all.length - 1} onPress={() => open(p)} />
            ))}
          </List>
        ) : (
          <Card>
            <Body>Nothing matches all of those. Try fewer filters.</Body>
          </Card>
        )}
      </View>
    </RitualScreen>
  );
}
