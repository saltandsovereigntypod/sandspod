import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../components/Button';
import { StaveGlyph, TarotFace } from '../../../../components/divination/Faces';
import { Body, Card, Chip, Chips, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../components/rituals/ui';
import { addEntry, updateEntry, useCraft } from '../../../../lib/craft/store';
import { chosenDeck, isDeckId } from '../../../../lib/divination/decks';
import { DECKS_COLLECTION, ownDecks } from '../../../../lib/divination/oracle/decks';
import {
  cardToLearn,
  deckProgress,
  dueCards,
  emptyStudy,
  normalizeStudy,
  quizChoices,
  review,
  STUDY_COLLECTION,
  studyCards,
  studyDecks,
  type StudyCard,
  type StudyState,
} from '../../../../lib/divination/study';
import { useMySettings } from '../../../../lib/settings/store';
import { colors, fonts, radius, type } from '../../../../theme';

type Mode = 'cards' | 'quiz';

// Study mode (Divination → Learn the cards): flashcards and a quiz for each
// deck, by Leitner boxes, with your progress per deck and a card to learn today.
export default function Study() {
  const { deck: deckParam } = useLocalSearchParams<{ deck?: string }>();
  const { settings } = useMySettings();
  const { entries } = useCraft<unknown>(STUDY_COLLECTION);
  const own = ownDecks(useCraft<unknown>(DECKS_COLLECTION).entries);
  const decks = useMemo(() => studyDecks(own), [own]);
  const today = useMemo(() => new Date(), []);
  const states = useMemo(() => {
    const map = new Map<string, { id: string; state: StudyState }>();
    for (const e of entries) {
      const s = normalizeStudy(e.data, '');
      if (s.deck && !map.has(s.deck)) map.set(s.deck, { id: e.id, state: s });
    }
    return map;
  }, [entries]);

  const tarot = `tarot:${chosenDeck(settings as Record<string, unknown> | null)}`;
  const deckId = deckParam && decks.some((d) => d.id === deckParam) ? deckParam : null;

  if (!deckId) {
    const cards = studyCards(tarot, own);
    const state = states.get(tarot)?.state ?? emptyStudy(tarot);
    const learn = cardToLearn(cards, state, today);
    return (
      <RitualScreen back="Divination">
        <Title eyebrow="Divination">Learn the cards</Title>
        <Body muted>Flashcards and a short quiz for each deck. A card you know moves up a box and comes back less often; one you miss comes back tomorrow. A few minutes a day is enough.</Body>
        {learn && <LearnCard card={learn} deck={tarot} />}
        <SectionLabel>Your decks</SectionLabel>
        <List>
          {decks.map((d, i) => {
            const p = deckProgress(studyCards(d.id, own), states.get(d.id)?.state ?? emptyStudy(d.id), today);
            const line = p.seen ? `${p.known} of ${p.total} known · ${p.due} due today` : d.detail;
            return <Row key={d.id} icon="wheel" title={d.name} detail={line} onPress={() => router.setParams({ deck: d.id })} last={i === decks.length - 1} />;
          })}
        </List>
      </RitualScreen>
    );
  }

  const found = states.get(deckId);
  return <DeckStudy key={deckId} deckId={deckId} name={decks.find((d) => d.id === deckId)!.name} cards={studyCards(deckId, own)} saved={found ?? null} today={today} />;
}

function LearnCard({ card, deck }: { card: StudyCard; deck: string }) {
  return (
    <Card accent>
      <SectionLabel>A card to learn today</SectionLabel>
      <Front card={card} deck={deck} />
      <Text style={type.cardTitle}>{card.keywords}</Text>
      <Body>{card.text}</Body>
      {!!card.reversed && <Body muted>{`Reversed: ${card.reversed}`}</Body>}
    </Card>
  );
}

function Front({ card, deck }: { card: StudyCard; deck: string }) {
  const tarotDeck = deck.startsWith('tarot:') ? deck.slice(6) : null;
  return (
    <View style={styles.front}>
      {tarotDeck && isDeckId(tarotDeck) ? (
        <View style={styles.tarot}>
          <TarotFace name={card.id} reversed={false} deck={tarotDeck} />
        </View>
      ) : (deck === 'runes' || deck === 'ogham') && card.glyph ? (
        <StaveGlyph glyph={card.glyph} kind={deck} size={64} />
      ) : null}
      <Text style={styles.name}>{card.name}</Text>
      {!!card.glyph && deck === 'lenormand' && <Text style={type.caption}>{card.glyph}</Text>}
    </View>
  );
}

function DeckStudy({ deckId, name, cards, saved, today }: { deckId: string; name: string; cards: StudyCard[]; saved: { id: string; state: StudyState } | null; today: Date }) {
  const [state, setState] = useState<StudyState>(saved?.state ?? emptyStudy(deckId));
  const idRef = useRef<string | null>(saved?.id ?? null);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const [mode, setMode] = useState<Mode | null>(null);
  const [queue, setQueue] = useState<StudyCard[]>([]);
  const [shown, setShown] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState({ right: 0, wrong: 0 });

  const progress = deckProgress(cards, state, today);
  const learn = cardToLearn(cards, state, today);
  const card = queue[0] ?? null;
  const choices = useMemo(() => (card && mode === 'quiz' ? quizChoices(cards, card, `${deckId}:${done.right + done.wrong}`) : []), [card, mode, cards, deckId, done]);

  const persist = (next: StudyState) => {
    chain.current = chain.current.then(async () => {
      if (idRef.current) await updateEntry(STUDY_COLLECTION, idRef.current, next);
      else idRef.current = (await addEntry(STUDY_COLLECTION, next)).id;
    });
  };

  const begin = (m: Mode) => {
    setMode(m);
    setQueue(dueCards(cards, state, new Date()));
    setShown(false);
    setPicked(null);
    setDone({ right: 0, wrong: 0 });
  };

  const answer = (right: boolean) => {
    if (!card) return;
    const next = review(state, card.id, right, new Date());
    setState(next);
    persist(next);
    setDone((d) => ({ right: d.right + (right ? 1 : 0), wrong: d.wrong + (right ? 0 : 1) }));
    // A missed card comes round once more at the end of this sitting.
    setQueue((q) => (right || q.slice(1).some((c) => c.id === card.id) ? q.slice(1) : [...q.slice(1), card]));
    setShown(false);
    setPicked(null);
  };

  if (mode && card) {
    return (
      <RitualScreen back={name}>
        <Title eyebrow={`${name} · ${queue.length} to go`}>{mode === 'quiz' ? 'What does it mean?' : 'Do you know it?'}</Title>
        <Card>
          <Front card={card} deck={deckId} />
          {mode === 'cards' ? (
            shown ? (
              <>
                <Text style={type.cardTitle}>{card.keywords}</Text>
                <Body>{card.text}</Body>
                {!!card.reversed && <Body muted>{`Reversed: ${card.reversed}`}</Body>}
                <View style={ui.actions}>
                  <Button label="I knew it" onPress={() => answer(true)} />
                  <Button label="Not yet" variant="outline" onPress={() => answer(false)} />
                </View>
              </>
            ) : (
              <Button label="Show the meaning" onPress={() => setShown(true)} />
            )
          ) : (
            <>
              <Chips>
                {choices.map((c) => (
                  <Chip key={c} label={c} selected={picked === c} onPress={() => !picked && setPicked(c)} />
                ))}
              </Chips>
              {picked && (
                <>
                  <Body>{picked === card.keywords ? 'Yes.' : `Not quite: ${card.keywords}.`}</Body>
                  <Body muted>{card.text}</Body>
                  <Button label="Next" onPress={() => answer(picked === card.keywords)} />
                </>
              )}
            </>
          )}
        </Card>
        <Button label="Stop for now" variant="text" onPress={() => setMode(null)} />
      </RitualScreen>
    );
  }

  const due = dueCards(cards, state, today).length;
  return (
    <RitualScreen back="Learn the cards">
      <Title eyebrow="Learn the cards">{name}</Title>
      {mode && <Body>{`Done for now: ${done.right} known, ${done.wrong} to see again.`}</Body>}
      <Card>
        <Text style={type.cardTitle}>{`${progress.known} of ${progress.total} known`}</Text>
        <Body muted>{`${progress.seen} seen · ${progress.learning} still learning · ${progress.due} due today`}</Body>
        <View style={styles.boxes} accessible accessibilityLabel={`In each box, first to fifth: ${progress.boxes.join(', ')}`}>
          {progress.boxes.map((n, i) => (
            <View key={i} style={styles.box}>
              <Text style={styles.boxCount}>{n}</Text>
              <Text style={type.caption}>{`Box ${i + 1}`}</Text>
            </View>
          ))}
        </View>
        <View style={ui.actions}>
          <Button label={due ? `Flashcards (${due})` : 'Nothing due today'} onPress={() => begin('cards')} disabled={!due} />
          <Button label="Quiz" variant="outline" onPress={() => begin('quiz')} disabled={!due} />
        </View>
      </Card>
      {learn && <LearnCard card={learn} deck={deckId} />}
      <Button label="Card meanings" variant="text" onPress={() => router.push('/rituals/divination/meanings' as Href)} />
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  front: { alignItems: 'center', gap: 8 },
  tarot: { width: 120, height: 207 },
  name: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, color: colors.cream, textAlign: 'center' },
  boxes: { flexDirection: 'row', gap: 6 },
  box: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.button, backgroundColor: colors.surfaceRaised },
  boxCount: { fontFamily: fonts.bodySemi, fontSize: 18, color: colors.gold },
});
