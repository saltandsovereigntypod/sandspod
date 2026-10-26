import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { SpreadPicker } from '../../../../components/divination/Picker';
import { ReadMore } from '../../../../components/divination/ReadMore';
import { SpreadTable } from '../../../../components/divination/Spread';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../components/rituals/ui';
import { useReducedMotion } from '../../../../lib/accessibility/store';
import { fullDate } from '../../../../lib/calendar';
import { DREAMS, normalizeDream, sortDreams } from '../../../../lib/craft/hedge/dreams';
import { lookBackFrom, normalizeReading, READINGS, type ReadingLink, type ReadingLinkKind } from '../../../../lib/craft/hedge/readings';
import { addEntry, useCraft } from '../../../../lib/craft/store';
import { customSpreads, entryIdOfSpread, SPREADS_COLLECTION } from '../../../../lib/divination/custom';
import { todaysCard } from '../../../../lib/divination/daily';
import {
  CAST_NOTE,
  drawOptions,
  drawSpread,
  DRAW_LOOK_BACK,
  KINDS,
  meaningOf,
  placeOf,
  readingFromDraw,
  spreadById,
  SPREADS,
  spreadsFor,
  type Draw,
  type DrawKind,
} from '../../../../lib/divination/draw';
import { deityLink, linkFromParams, linkKindOfSpread, linkLine, linkQuestion } from '../../../../lib/divination/linked';
import { keepsSouthernWheel, seasonalSpreads } from '../../../../lib/divination/seasonal';
import { STAVE_NOTES } from '../../../../lib/divination/staves';
import { myDeities } from '../../../../lib/patron';
import { localDateKey } from '../../../../lib/rituals/lifecycle';
import { upcomingPlans } from '../../../../lib/rituals/plans';
import { useRituals } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';
import { useMySettings } from '../../../../lib/settings/store';
import { colors, type } from '../../../../theme';

// Draw cards, cast runes or draw ogham staves, turn them over, read what each
// means, and keep the draw in the reading log like any other reading.
export default function DrawScreen() {
  const params = useLocalSearchParams<{ kind?: string; spread?: string; dream?: string; plan?: string; deity?: string; title?: string }>();
  const first = spreadById(params.spread) ?? spreadsFor((KINDS.find((k) => k.id === params.kind)?.id ?? 'tarot') as DrawKind)[0];
  const { session } = useSession();
  const { settings, save } = useMySettings();
  const still = useReducedMotion();
  const { entries } = useCraft<unknown>(READINGS);
  const { entries: mine } = useCraft<unknown>(SPREADS_COLLECTION);
  const custom = useMemo(() => customSpreads(mine), [mine]);

  // A spread of your own may not have loaded yet, so the id is kept as asked for.
  const [spreadId, setSpreadId] = useState(params.spread || first.id);
  const spread = spreadById(spreadId, custom) ?? first;
  const [picking, setPicking] = useState(false);
  const [question, setQuestion] = useState('');
  const [draw, setDraw] = useState<Draw | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [lookBack, setLookBack] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<Partial<Record<'divination_reversals' | 'divination_blank_rune', boolean>>>({});
  // What it's drawn for, if anything: a dream, a planned working, a deity (its own spread chosen).
  const [link, setLink] = useState<ReadingLink | null>(() => linkFromParams(params));

  const options = drawOptions({ ...(settings ?? {}), ...local });
  const setOption = (key: 'divination_reversals' | 'divination_blank_rune', value: boolean) => {
    setLocal((o) => ({ ...o, [key]: value }));
    if (settings) void save({ ...settings, [key]: value });
  };

  const now = useMemo(() => new Date(), []);
  const today = localDateKey(now);
  const kept = useMemo(() => (spread.id === 'daily' ? todaysCard(entries.map((e) => ({ ...e, data: normalizeReading(e.data) })), now) : null), [entries, now, spread.id]);
  const kind = KINDS.find((k) => k.id === spread.kind)!;
  const allShown = !!draw && revealed.every(Boolean);
  const chosenLookBack = lookBack ?? lookBackFrom(today, spread.lookBackDays);

  const choose = (id: string) => {
    setSpreadId(id);
    setDraw(null);
    setSelected(null);
    setLookBack(null);
    setPicking(false);
  };
  // Back from making a spread of your own, with it chosen.
  const [askedFor, setAskedFor] = useState(params.spread);
  if (params.spread !== askedFor) {
    setAskedFor(params.spread);
    if (params.spread) choose(params.spread);
  }

  // The wheel's card in the middle is a choice on the wheel, not a spread of its own.
  const base = spread.hidden ? (SPREADS.find((s) => s.variant?.id === spread.id) ?? spread) : spread;
  const seasonal = useMemo(
    () => (spread.kind === 'tarot' ? seasonalSpreads(now, { south: keepsSouthernWheel(settings) }).filter((s) => s.spread !== spread.id) : []),
    [now, settings, spread.id, spread.kind],
  );
  const editing = entryIdOfSpread(spread.id);
  const start = () => {
    const next = drawSpread(spread, options);
    setDraw(next);
    setRevealed(next.items.map(() => false));
    setSelected(null);
    setInterpretation('');
  };
  const press = (i: number) => {
    if (!revealed[i]) setRevealed((r) => r.map((v, j) => v || j === i));
    setSelected(i);
  };
  const turnAll = () => {
    setRevealed((r) => r.map(() => true));
    setSelected((s) => s ?? 0);
  };

  const keep = async () => {
    if (!draw) return;
    setSaving(true);
    try {
      const entry = await addEntry(READINGS, readingFromDraw(spread, draw, { question, interpretation, lookBack: chosenLookBack, now: new Date(), linkedTo }));
      router.replace(`/rituals/divination/${entry.id}` as Href);
    } finally {
      setSaving(false);
    }
  };

  const linkKind = linkKindOfSpread(spread.id);
  const linkedTo = link && link.kind === linkKind ? link : null;
  const shown = selected !== null && draw && revealed[selected] ? meaningOf(draw.items[selected]) : null;
  const position = selected !== null && draw ? placeOf(spread, draw, selected) : null;

  return (
    <RitualScreen back="Back">
      <Title eyebrow="Draw · Divination">{kind.label}</Title>

      <View style={ui.gapSmall}>
        <SectionLabel>What to draw</SectionLabel>
        <Chips>
          {KINDS.map((k) => (
            <Chip key={k.id} label={k.label} selected={spread.kind === k.id} onPress={() => spread.kind !== k.id && choose(spreadsFor(k.id)[0].id)} />
          ))}
        </Chips>
        <SpreadPicker
          kind={spread.kind}
          custom={custom}
          chosen={spread}
          open={picking}
          onToggle={() => setPicking((o) => !o)}
          onChoose={(id) => (id === spread.id ? setPicking(false) : choose(id))}
          onMake={() => router.push({ pathname: '/rituals/divination/spread', params: { kind: spread.kind } })}
        />
        <Body muted>{spread.detail}</Body>
        {!!editing && !draw && (
          <Button label="Change this spread" variant="text" onPress={() => router.push({ pathname: '/rituals/divination/spread', params: { id: editing } })} />
        )}
      </View>

      {!draw &&
        seasonal.map((s) => (
          <List key={s.spread}>
            <Row icon={s.spread === 'samhain' ? 'samhain' : s.spread.endsWith('-moon') ? 'today' : 'wheel'} title={`${s.why}: ${s.label}`} detail="A spread for the time. Tap to choose it." last onPress={() => choose(s.spread)} />
          </List>
        ))}

      {kept && !draw && (
        <List>
          <Row
            icon="wheel"
            title={`Today’s card: ${kept.name}${kept.reversed ? ', reversed' : ''}`}
            detail="You’ve kept a card for today already. Open it, or draw another."
            last
            onPress={() => router.push(`/rituals/divination/${kept.id}` as Href)}
          />
        </List>
      )}

      {!draw && linkKind && <LinkChooser kind={linkKind} chosen={linkedTo} onChoose={setLink} settings={settings} />}
      {draw && linkedTo && <Body muted>{linkLine(linkedTo)}</Body>}

      {!draw && (
        <>
          <Field
            label="Your question (if you have one)"
            value={question}
            onChange={setQuestion}
            placeholder={linkedTo ? linkQuestion(linkedTo) : spread.id === 'daily' ? 'What do I need today?' : 'What you want to ask, as you’d ask it'}
            multiline
          />
          {spread.kind === 'tarot' && (
            <Toggle label="Reversed cards" detail="Some cards come up upside down, with their reversed meaning." value={options.reversals} onChange={(v) => setOption('divination_reversals', v)} />
          )}
          {!!base.variant && (
            <Toggle label={base.variant.label} value={spread.id === base.variant.id} onChange={(v) => choose(v ? base.variant!.id : base.id)} />
          )}
          {spread.kind === 'runes' && (
            <Toggle label="The blank rune" detail="A modern addition to the set, standing for the unknown." value={options.blankRune} onChange={(v) => setOption('divination_blank_rune', v)} />
          )}
          <Button label={kind.action} onPress={start} />
        </>
      )}

      {draw && (
        <View style={ui.gap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {!!question.trim() && <Text style={[type.cardTitle, { color: colors.parchment }]}>{question.trim()}</Text>}
          {width > 0 && <SpreadTable spread={spread} draw={draw} revealed={revealed} selected={selected} onPress={press} still={still} width={width} />}
          {!allShown && (
            <>
              <Body muted>{draw.items.length === 1 ? 'Tap it to turn it over.' : 'Tap each one to turn it over, in your own time.'}</Body>
              {draw.items.length > 1 && <Button label="Turn them all over" variant="outline" onPress={turnAll} />}
            </>
          )}
        </View>
      )}

      {draw && shown && (
        <Card accent>
          <SectionLabel>{position && spread.positions.length > 1 ? `${(selected ?? 0) + 1} · ${position.name}` : spread.label}</SectionLabel>
          {position && spread.positions.length > 1 && <Body muted>{position.about}</Body>}
          <Text style={type.cardTitle}>{`${shown.glyph ? `${shown.glyph}  ` : ''}${shown.name}${shown.reversed ? ', reversed' : ''}`}</Text>
          {!!shown.gloss && <Body muted>{shown.gloss}</Body>}
          <Text style={[type.body, { color: colors.gold }]}>{shown.meaning.keywords}</Text>
          <Body>{shown.meaning.text}</Body>
          <ReadMore name={shown.name} />
        </Card>
      )}

      {draw && draw.items.length > 1 && allShown && (
        <List>
          {draw.items.map((item, i) => (
            <Row
              key={i}
              icon="wheel"
              title={`${i + 1}. ${item.name}${item.reversed ? ', reversed' : ''}`}
              detail={`${placeOf(spread, draw, i)?.name} · ${meaningOf(item)?.meaning.keywords ?? ''}`}
              last={i === draw.items.length - 1}
              onPress={() => setSelected(i)}
            />
          ))}
        </List>
      )}

      {draw && allShown && (
        <>
          {spread.cast && <Body muted>{CAST_NOTE}</Body>}
          {spread.kind !== 'tarot' && <Body muted>{STAVE_NOTES[spread.kind]}</Body>}
          <Field label="What you make of it" value={interpretation} onChange={setInterpretation} placeholder="Your reading of the reading" multiline />
          <View style={ui.gapSmall}>
            <SectionLabel>Come back to it</SectionLabel>
            <Chips>
              {DRAW_LOOK_BACK.map((c) => {
                const key = lookBackFrom(today, c.days);
                return <Chip key={c.days} label={c.label} selected={chosenLookBack === key} onPress={() => setLookBack(key)} />;
              })}
              <Chip label="Not needed" selected={!chosenLookBack} onPress={() => setLookBack('')} />
            </Chips>
            {!!chosenLookBack && <Body muted>{`It will wait for you in Come back to from ${fullDate(chosenLookBack)}.`}</Body>}
          </View>
          {!session && <Notice>Saved on this phone. Sign in to keep your readings with your account.</Notice>}
          <View style={ui.actions}>
            <Button label={saving ? 'Keeping it…' : 'Keep this reading'} onPress={keep} disabled={saving} />
            <Button label="Draw again" variant="text" onPress={start} />
          </View>
        </>
      )}
    </RitualScreen>
  );
}

/** For a Dream reading, Before a working or Patron deity: which dream, plan or deity it's drawn for (or none). */
function LinkChooser({
  kind,
  chosen,
  onChoose,
  settings,
}: {
  kind: ReadingLinkKind;
  chosen: ReadingLink | null;
  onChoose: (link: ReadingLink | null) => void;
  settings: Record<string, unknown> | null | undefined;
}) {
  const { entries } = useCraft<unknown>(DREAMS);
  const rituals = useRituals();
  const choices: ReadingLink[] = useMemo(() => {
    if (kind === 'dream') return sortDreams(entries.map((e) => ({ ...e, data: normalizeDream(e.data) }))).slice(0, 6).map((e) => ({ kind, id: e.id, title: e.data.title || 'Untitled dream' }));
    if (kind === 'plan') return upcomingPlans(rituals.plans, new Date()).slice(0, 6).map((p) => ({ kind, id: p.id, title: p.title }));
    return myDeities(settings).map((d) => deityLink(d.key, d.name));
  }, [kind, entries, rituals.plans, settings]);
  const all = chosen && !choices.some((c) => c.id === chosen.id) ? [chosen, ...choices] : choices;
  const label = kind === 'dream' ? 'The dream it’s for' : kind === 'plan' ? 'The working it’s for' : 'The god it’s for';
  const none =
    kind === 'dream'
      ? 'No dreams written yet. Write one in Grimoire → Dreams, or draw without one.'
      : kind === 'plan'
        ? 'No workings planned. Plan one, or draw without one.'
        : 'No deities kept yet. Add them in Settings → My deities, or draw without one.';
  return (
    <View style={ui.gapSmall}>
      <SectionLabel>{label}</SectionLabel>
      {all.length ? (
        <Chips>
          {all.map((c) => (
            <Chip key={c.id} label={c.title || c.id} selected={chosen?.id === c.id} onPress={() => onChoose(chosen?.id === c.id ? null : c)} />
          ))}
        </Chips>
      ) : (
        <Body muted>{none}</Body>
      )}
      {!!chosen && <Body muted>{`${linkLine(chosen)}. It will show there too.`}</Body>}
    </View>
  );
}
