import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { PairsCard } from '../../../../components/divination/oracle/Pairs';
import { PullPicker } from '../../../../components/divination/oracle/PullPicker';
import { SpreadPicker } from '../../../../components/divination/Picker';
import { ReadMore } from '../../../../components/divination/ReadMore';
import { DeckReadingLines } from '../../../../components/divination/DeckReading';
import { SpreadTable } from '../../../../components/divination/Spread';
import { Body, Card, Chip, Chips, Field, List, Notice, RitualScreen, Row, SectionLabel, Title, Toggle, ui } from '../../../../components/rituals/ui';
import { useReducedMotion } from '../../../../lib/accessibility/store';
import { fullDate } from '../../../../lib/calendar';
import { DREAMS, normalizeDream, sortDreams } from '../../../../lib/craft/hedge/dreams';
import { lookBackFrom, normalizeReading, READINGS, type ReadingLink, type ReadingLinkKind } from '../../../../lib/craft/hedge/readings';
import { addEntry, useCraft } from '../../../../lib/craft/store';
import { customSpreads, entryIdOfSpread, SPREADS_COLLECTION } from '../../../../lib/divination/custom';
import { DECK_READING_NOTES } from '../../../../lib/divination/deckMeanings';
import { chosenDeck, DECK_SETTING, deckInfo, TAROT_DECKS, type DeckId } from '../../../../lib/divination/decks';
import { todaysCard, todaysCardLabel } from '../../../../lib/divination/daily';
import { clearDrawDraft, loadDrawDraft, saveDrawDraft } from '../../../../lib/divination/draftStore';
import { draftKey, draftSummary, isFreshDraft, opensOwnDraw, restoreDraft, stampDraft, type DrawDraft } from '../../../../lib/divination/drawDraft';
import {
  CAST_NOTE,
  canDraw,
  drawOptions,
  drawSpread,
  DRAW_LOOK_BACK,
  KINDS,
  meaningOf,
  ownDeckSpreadById,
  placeOf,
  poolFor,
  readingFromDraw,
  spreadById,
  SPREADS,
  spreadsFor,
  type Draw,
  type DrawKind,
  type Drawn,
} from '../../../../lib/divination/draw';
import { deityLink, linkFromParams, linkKindOfSpread, linkLine, linkQuestion } from '../../../../lib/divination/linked';
import { DECKS_COLLECTION, ownDeckById, ownDecks } from '../../../../lib/divination/oracle/decks';
import { KIPPER_NOTE } from '../../../../lib/divination/oracle/kipper';
import { shownKinds } from '../../../../lib/divination/oracle/kinds';
import { LENORMAND_NOTE } from '../../../../lib/divination/oracle/lenormand';
import { keepsSouthernWheel, seasonalSpreads } from '../../../../lib/divination/seasonal';
import { STAVE_NOTES } from '../../../../lib/divination/staves';
import { myDeities } from '../../../../lib/patron';
import { localDateKey } from '../../../../lib/rituals/lifecycle';
import { upcomingPlans } from '../../../../lib/rituals/plans';
import { useRituals } from '../../../../lib/rituals/store';
import { useSession } from '../../../../lib/session';
import { useMySettings } from '../../../../lib/settings/store';
import { colors, type } from '../../../../theme';

const NOTES: Partial<Record<DrawKind, string>> = { ...STAVE_NOTES, lenormand: LENORMAND_NOTE, kipper: KIPPER_NOTE };

// Draw cards, cast runes or draw ogham staves (or Lenormand, Kipper or a deck
// of your own), turn them over, read what each means, and keep the draw in
// the reading log like any other reading. Or log a pull you made with real
// cards, picking which card lay in each place.
export default function DrawScreen() {
  const params = useLocalSearchParams<{ kind?: string; spread?: string; deck?: string; dream?: string; plan?: string; deity?: string; title?: string }>();
  const askedKind = (KINDS.find((k) => k.id === params.kind)?.id ?? (params.deck ? 'oracle' : null)) as DrawKind | null;
  const { session } = useSession();
  const { settings, save } = useMySettings();
  const still = useReducedMotion();
  const { entries } = useCraft<unknown>(READINGS);
  const { entries: mine, ready: spreadsReady } = useCraft<unknown>(SPREADS_COLLECTION);
  const custom = useMemo(() => customSpreads(mine), [mine]);
  const { entries: deckEntries, ready: decksReady } = useCraft<unknown>(DECKS_COLLECTION);
  const decks = useMemo(() => ownDecks(deckEntries), [deckEntries]);

  const [kindId, setKindId] = useState<DrawKind>(askedKind ?? spreadById(params.spread)?.kind ?? 'tarot');
  const [deckId, setDeckId] = useState<string | null>(params.deck ?? null);
  const ownDeck = kindId === 'oracle' ? (ownDeckById(decks, deckId) ?? decks[0] ?? null) : null;
  // A spread of your own may not have loaded yet, so the id is kept as asked for.
  const [spreadId, setSpreadId] = useState(params.spread || spreadsFor(kindId)[0].id);
  const resolve = (id: string) => (kindId === 'oracle' ? ownDeckSpreadById(id, custom) : spreadById(id, custom));
  const fallback = spreadsFor(kindId, custom)[0];
  const found = resolve(spreadId);
  // A spread of your own asked for by link takes its own kind once it has loaded.
  const [settled, setSettled] = useState(!!askedKind || !params.spread);
  if (!settled && found) {
    setSettled(true);
    if (found.kind !== kindId) setKindId(found.kind);
  }
  const spread = found && found.kind === kindId ? found : fallback;
  const [picking, setPicking] = useState(false);
  const [question, setQuestion] = useState('');
  const [byHand, setByHand] = useState(false);
  const [placed, setPlaced] = useState<(Drawn | null)[]>([]);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState('');
  const [lookBack, setLookBack] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<Partial<Record<'divination_reversals' | 'divination_blank_rune', boolean>>>({});
  const [localDeck, setLocalDeck] = useState<DeckId | null>(null);
  // What it's drawn for, if anything: a dream, a planned working, a deity (its own spread chosen).
  const [link, setLink] = useState<ReadingLink | null>(() => linkFromParams(params));

  // A draw left unkept (the screen left, or the app closed), offered back
  // when the screen opens for no draw in particular. On this device only.
  const [opensOwn] = useState(() => opensOwnDraw(params));
  const [stored, setStored] = useState<DrawDraft | null | undefined>(opensOwn ? null : undefined);
  const [offerOpen, setOfferOpen] = useState(true);
  useEffect(() => {
    if (opensOwn) return;
    let live = true;
    void loadDrawDraft().then((d) => {
      if (!live) return;
      if (d && !isFreshDraft(d, new Date())) {
        void clearDrawDraft();
        d = null;
      }
      setStored(d);
    });
    return () => {
      live = false;
    };
  }, [opensOwn]);
  const restored = useMemo(() => (stored && spreadsReady && decksReady ? restoreDraft(stored, { custom, decks }) : null), [stored, spreadsReady, decksReady, custom, decks]);
  // Its spread, deck or cards are gone: let it go quietly.
  const lost = !!stored && spreadsReady && decksReady && !restored;
  const owned = useRef(false);
  const keptIt = useRef(false);

  const options = drawOptions({ ...(settings ?? {}), ...local });
  const setOption = (key: 'divination_reversals' | 'divination_blank_rune', value: boolean) => {
    setLocal((o) => ({ ...o, [key]: value }));
    if (settings) void save({ ...settings, [key]: value });
  };
  // The deck to draw with: your setting, changed here in a tap (and kept as your deck).
  const deck = localDeck ?? chosenDeck(settings);
  const setDeck = (id: DeckId) => {
    setLocalDeck(id);
    if (settings) void save({ ...settings, [DECK_SETTING]: id });
  };

  const now = useMemo(() => new Date(), []);
  const today = localDateKey(now);
  const kept = useMemo(() => (spread.id === 'daily' && kindId === 'tarot' ? todaysCard(entries.map((e) => ({ ...e, data: normalizeReading(e.data) })), now) : null), [entries, now, spread.id, kindId]);
  const kind = KINDS.find((k) => k.id === kindId)!;
  const kinds = shownKinds(KINDS, settings, kindId);
  const allShown = !!draw && revealed.every(Boolean);
  const chosenLookBack = lookBack ?? lookBackFrom(today, spread.lookBackDays);
  const pool = poolFor(kindId, options, ownDeck?.data);
  const reversible = kindId === 'tarot' || (kindId === 'oracle' && !!ownDeck?.data.reversals);
  const enough = canDraw(spread, options, ownDeck?.data);

  const reset = () => {
    setDraw(null);
    setSelected(null);
    setLookBack(null);
    setPicking(false);
    setPlaced([]);
  };
  const choose = (id: string) => {
    setSpreadId(id);
    reset();
  };
  const chooseKind = (k: DrawKind) => {
    if (k === kindId) return;
    setKindId(k);
    setSpreadId(spreadsFor(k, custom)[0].id);
    reset();
  };
  // Back from making a spread of your own, with it chosen.
  const [askedFor, setAskedFor] = useState(params.spread);
  if (params.spread !== askedFor) {
    setAskedFor(params.spread);
    const made = spreadById(params.spread, custom);
    // Drawn with what it was made for, unless a deck of your own is taking a spread for cards.
    if (made && made.kind !== kindId && !(kindId === 'oracle' && (made.kind === 'tarot' || made.kind === 'oracle'))) setKindId(made.kind);
    if (params.spread) choose(params.spread);
  }

  // The wheel's card in the middle is a choice on the wheel, not a spread of its own.
  const hiddenBase = spread.hidden ? SPREADS.find((s) => s.variant?.id === spread.id) : null;
  const base = hiddenBase ? (resolve(hiddenBase.id) ?? spread) : spread;
  const seasonal = useMemo(
    () => (kindId === 'tarot' ? seasonalSpreads(now, { south: keepsSouthernWheel(settings) }).filter((s) => s.spread !== spread.id) : []),
    [now, settings, spread.id, kindId],
  );
  const editing = entryIdOfSpread(spread.id);
  const start = () => {
    const next = drawSpread(spread, options, undefined, ownDeck?.data);
    setDraw(next);
    setRevealed(next.items.map(() => false));
    setSelected(null);
    setInterpretation('');
  };
  const startByHand = () => {
    setByHand(true);
    setPlaced(spread.positions.map(() => null));
  };
  const again = () => {
    setDraw(null);
    startByHand();
  };
  const lay = () => {
    if (!placed.every(Boolean)) return;
    const items = placed.map((p) => ({ ...p! }));
    setDraw({ spread: spread.id, items });
    setRevealed(items.map(() => true));
    setSelected(0);
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
      const entry = await addEntry(
        READINGS,
        readingFromDraw(spread, draw, { question, interpretation, lookBack: chosenLookBack, now: new Date(), deck, ownDeck, byHand, linkedTo }),
      );
      keptIt.current = true;
      await clearDrawDraft();
      router.replace(`/rituals/divination/${entry.id}` as Href);
    } finally {
      setSaving(false);
    }
  };

  const linkKind = linkKindOfSpread(spread.id);
  const linkedTo = link && link.kind === linkKind ? link : null;
  // A tarot card reads in the deck it's drawn with: the deck's own meaning where it has one.
  const tarotDeck = kindId === 'tarot' ? deck : null;
  const shown = selected !== null && draw && revealed[selected] ? meaningOf(draw.items[selected], ownDeck?.data, tarotDeck) : null;
  const position = selected !== null && draw ? placeOf(spread, draw, selected) : null;
  const ownWithoutCards = kindId === 'oracle' && (!ownDeck || ownDeck.data.cards.length === 0);

  // The draw as it stands, saved on every change and cleared once it's
  // kept or deliberately set aside (a new spread, Start again).
  const key = draftKey({ kind: kindId, spread: spread.id, ownDeck: ownDeck?.id ?? null, deck, question, link: linkedTo, options, byHand, placed, draw, revealed, selected, interpretation, lookBack });
  // A new draw of its own takes the old one's place.
  if (key && offerOpen) setOfferOpen(false);
  useEffect(() => {
    if (keptIt.current) return;
    if (key) {
      owned.current = true;
      const text = stampDraft(key, new Date());
      if (text) saveDrawDraft(text);
    } else if (owned.current) {
      owned.current = false;
      void clearDrawDraft();
    }
  }, [key]);
  useEffect(() => {
    if (lost && offerOpen) void clearDrawDraft();
  }, [lost, offerOpen]);
  const offer = offerOpen && !key ? restored : null;
  const carryOn = () => {
    if (!restored) return;
    const { draft, spread: s, ownDeck: od } = restored;
    setKindId(draft.kind);
    setDeckId(od?.id ?? null);
    setSpreadId(s.id);
    setSettled(true);
    setQuestion(draft.question);
    setLink(draft.link);
    setLocal({ divination_reversals: draft.options.reversals, divination_blank_rune: draft.options.blankRune });
    setLocalDeck(draft.deck);
    setByHand(draft.byHand);
    setPlaced(draft.placed);
    setDraw(draft.draw);
    setRevealed(draft.revealed);
    setSelected(draft.selected);
    setInterpretation(draft.interpretation);
    setLookBack(draft.lookBack);
    setPicking(false);
    setOfferOpen(false);
  };
  const letGo = () => {
    setOfferOpen(false);
    setStored(null);
    void clearDrawDraft();
  };

  return (
    <RitualScreen back="Back">
      <Title eyebrow="Draw · Divination">{kindId === 'oracle' && ownDeck ? ownDeck.data.name : kind.label}</Title>

      {offer && (
        <Card accent>
          <SectionLabel>Pick up where you left off?</SectionLabel>
          <Body>{draftSummary(offer, now)}</Body>
          <Body muted>A draw you hadn’t kept yet is still here, just as you left it.</Body>
          <View style={ui.actions}>
            <Button label="Carry on" onPress={carryOn} />
            <Button label="Let it go" variant="text" onPress={letGo} />
          </View>
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>What to draw</SectionLabel>
        <Chips>
          {kinds.map((k) => (
            <Chip key={k.id} label={k.label} selected={kindId === k.id} onPress={() => chooseKind(k.id)} />
          ))}
        </Chips>
        {kindId === 'oracle' && decks.length > 0 && (
          <Chips>
            {decks.map((d) => (
              <Chip key={d.id} label={d.data.name} selected={ownDeck?.id === d.id} onPress={() => {
                  if (ownDeck?.id === d.id) return;
                  setDeckId(d.id);
                  reset();
                }} />
            ))}
          </Chips>
        )}
        {kindId === 'oracle' && (
          <Button
            label={ownDeck ? 'Your decks and their cards' : 'Make a deck'}
            variant="text"
            onPress={() => router.push((ownDeck ? '/rituals/divination/decks' : '/rituals/divination/decks/edit') as Href)}
          />
        )}
        {ownWithoutCards ? (
          decksReady && (
            <Notice>
              {ownDeck ? `${ownDeck.data.name} has no cards yet. Add them, or paste in a list, and they’re ready to draw.` : 'Make a deck of your own: name it, add its cards (a photo of each if you like), and draw from it here, or log the cards you pull by hand.'}
            </Notice>
          )
        ) : (
          <>
            <SpreadPicker
              kind={kindId}
              custom={custom}
              chosen={spread}
              open={picking}
              onToggle={() => setPicking((o) => !o)}
              onChoose={(id) => (id === spread.id ? setPicking(false) : choose(id))}
              onMake={() => router.push({ pathname: '/rituals/divination/spread', params: { kind: kindId } })}
            />
            <Body muted>{spread.detail}</Body>
            {!!editing && !draw && (
              <Button label="Change this spread" variant="text" onPress={() => router.push({ pathname: '/rituals/divination/spread', params: { id: editing } })} />
            )}
          </>
        )}
      </View>

      {!draw &&
        !byHand &&
        seasonal.map((s) => (
          <List key={s.spread}>
            <Row icon={s.spread === 'samhain' ? 'samhain' : s.spread.endsWith('-moon') ? 'today' : 'wheel'} title={`${s.why}: ${s.label}`} detail="A spread for the time. Tap to choose it." last onPress={() => choose(s.spread)} />
          </List>
        ))}

      {kept && !draw && (
        <List>
          <Row
            icon="wheel"
            title={`Today’s card: ${todaysCardLabel(kept)}`}
            detail="You’ve kept a card for today already. Open it, or draw another."
            last
            onPress={() => router.push(`/rituals/divination/${kept.id}` as Href)}
          />
        </List>
      )}

      {!draw && !byHand && linkKind && <LinkChooser kind={linkKind} chosen={linkedTo} onChoose={setLink} settings={settings} />}
      {draw && linkedTo && <Body muted>{linkLine(linkedTo)}</Body>}

      {!draw && !ownWithoutCards && (
        <>
          <Field
            label="Your question (if you have one)"
            value={question}
            onChange={setQuestion}
            placeholder={linkedTo ? linkQuestion(linkedTo) : spread.id === 'daily' ? 'What do I need today?' : 'What you want to ask, as you’d ask it'}
            multiline
          />
          {!spread.cast && (
            <View style={ui.gapSmall}>
              <SectionLabel>How</SectionLabel>
              <Chips>
                <Chip label="Draw here" selected={!byHand} onPress={() => {
                  setByHand(false);
                  setPlaced([]);
                }} />
                <Chip label="Log a physical pull" selected={byHand} onPress={startByHand} />
              </Chips>
            </View>
          )}
          {kindId === 'tarot' && (
            <View style={ui.gapSmall}>
              <SectionLabel>Deck</SectionLabel>
              <Chips>
                {TAROT_DECKS.map((d) => (
                  <Chip key={d.id} label={d.name} selected={deck === d.id} onPress={() => deck !== d.id && setDeck(d.id)} />
                ))}
              </Chips>
              <Body muted>{`${deckInfo(deck).made}. ${deckInfo(deck).about}`}</Body>
              {!!DECK_READING_NOTES[deck] && <Body muted>{DECK_READING_NOTES[deck]}</Body>}
            </View>
          )}
          {kindId === 'tarot' && (
            <Toggle label="Reversed cards" detail="Some cards come up upside down, with their reversed meaning." value={options.reversals} onChange={(v) => setOption('divination_reversals', v)} />
          )}
          {kindId === 'oracle' && !byHand && !!ownDeck?.data.reversals && <Body muted>This deck is read with reversals: some cards will come up upside down.</Body>}
          {!!base.variant && (
            <Toggle label={base.variant.label} value={spread.id === base.variant.id} onChange={(v) => choose(v ? base.variant!.id : base.id)} />
          )}
          {kindId === 'runes' && (
            <Toggle label="The blank rune" detail="A modern addition to the set, standing for the unknown." value={options.blankRune} onChange={(v) => setOption('divination_blank_rune', v)} />
          )}
          {(kindId === 'tarot' || kindId === 'runes') && !byHand && (
            <View style={ui.gapSmall}>
              <Body muted>{kindId === 'tarot' ? 'The deck and reversals you choose here are saved as your default.' : 'Saved as your default.'}</Body>
              <Chips>
                <Chip label="Divination settings ›" onPress={() => router.push('/rituals/settings/divination')} a11yLabel="Divination settings: deck, reversals and what to draw" />
              </Chips>
            </View>
          )}
          {!enough && <Notice>{`This spread needs ${spread.positions.length} cards, and ${ownDeck?.data.name ?? 'the deck'} has ${pool.length}. Choose a smaller spread, or add more cards.`}</Notice>}
          {byHand ? (
            <>
              <Body muted>Lay out your own cards as the spread says, then pick which card is in each place.</Body>
              {enough && <PullPicker spread={spread} pool={pool} placed={placed.length === spread.positions.length ? placed : spread.positions.map(() => null)} onChange={setPlaced} reversible={reversible} />}
              <Button label="Lay it out" onPress={lay} disabled={!enough || placed.length !== spread.positions.length || !placed.every(Boolean)} />
            </>
          ) : (
            <Button label={kind.action} onPress={start} disabled={!enough} />
          )}
        </>
      )}

      {draw && (
        <View style={ui.gap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {!!question.trim() && <Text style={[type.cardTitle, { color: colors.parchment }]}>{question.trim()}</Text>}
          {width > 0 && <SpreadTable spread={spread} draw={draw} revealed={revealed} selected={selected} onPress={press} still={still} width={width} deck={deck} ownDeck={ownDeck?.data} />}
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
          <DeckReadingLines reading={shown.inDeck} />
          {!!shown.gloss && <Body muted>{shown.gloss}</Body>}
          {!!shown.meaning.keywords && <Text style={[type.body, { color: colors.gold }]}>{shown.meaning.keywords}</Text>}
          <Body>{shown.meaning.text}</Body>
          {!shown.own && <ReadMore name={shown.name} deck={tarotDeck} />}
        </Card>
      )}

      {draw && draw.items.length > 1 && allShown && (
        <List>
          {draw.items.map((item, i) => (
            <Row
              key={i}
              icon="wheel"
              title={`${i + 1}. ${item.name}${item.reversed ? ', reversed' : ''}`}
              detail={[placeOf(spread, draw, i)?.name, meaningOf(item, ownDeck?.data, tarotDeck)?.meaning.keywords].filter(Boolean).join(' · ')}
              last={i === draw.items.length - 1}
              onPress={() => setSelected(i)}
            />
          ))}
        </List>
      )}

      {draw && allShown && (
        <>
          {kindId === 'lenormand' && <PairsCard spread={spread} draw={draw} />}
          {spread.cast && <Body muted>{CAST_NOTE}</Body>}
          {!!NOTES[kindId] && <Body muted>{NOTES[kindId]}</Body>}
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
            <Button label={byHand ? 'Start again' : 'Draw again'} variant="text" onPress={byHand ? again : start} />
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
