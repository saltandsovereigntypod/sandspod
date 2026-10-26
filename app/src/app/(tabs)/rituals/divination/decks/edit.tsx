import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, confirmAction, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, ui } from '../../../../../components/rituals/ui';
import { keepImageOnDevice, pickImage, removeUploaded, uploadImage } from '../../../../../lib/altar/images';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../lib/craft/store';
import {
  blankOwnCard,
  blankOwnDeck,
  DECK_PHOTO_FOLDER,
  deckStoragePaths,
  DECKS_COLLECTION,
  importCards,
  MAX_CARDS,
  normalizeOwnDeck,
  tidyOwnDeck,
  type OwnCard,
  type OwnDeckData,
} from '../../../../../lib/divination/oracle/decks';
import { useSession } from '../../../../../lib/session';
import { colors, fonts, radius, type } from '../../../../../theme';

// Make or change a deck of your own: its name, a cover photo, whether it's
// read reversed, and its cards, one by one or pasted in as a list. Photos go
// where the altar's photos go: uploaded for an account, on the phone for a guest.
export default function DeckEditor() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries, ready } = useCraft<unknown>(DECKS_COLLECTION);
  const existing = id ? (entries.find((e) => e.id === id) ?? null) : null;
  if (id && !existing) {
    return (
      <RitualScreen back="Your decks">
        <Title>Your deck</Title>
        <Body>{ready ? 'This deck couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  // Keyed by the entry, so the form starts from its saved copy and typing is never overwritten.
  return <Form key={existing?.id ?? 'new'} existing={existing} />;
}

function Form({ existing }: { existing: CraftEntry<unknown> | null }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [deck, setDeck] = useState<OwnDeckData>(() => (existing ? normalizeOwnDeck(existing.data) : blankOwnDeck()));
  const [open, setOpen] = useState<string | null>(null);
  const [paste, setPaste] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<OwnDeckData>) => setDeck((d) => ({ ...d, ...patch }));
  const setCard = (cardId: string, patch: Partial<OwnCard>) => setDeck((d) => ({ ...d, cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)) }));

  /** A photo, uploaded for an account (as the altar's are) or kept on this phone for a guest. */
  const choosePhoto = async (): Promise<{ url: string; path: string } | null> => {
    try {
      const picked = await pickImage();
      if (!picked) return null;
      setBusy(true);
      if (userId) {
        const saved = await uploadImage(userId, picked, DECK_PHOTO_FOLDER);
        return { url: saved.url, path: saved.storagePath };
      }
      return { url: await keepImageOnDevice(picked, DECK_PHOTO_FOLDER), path: '' };
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'The photo couldn’t be saved. Please try again.');
      return null;
    } finally {
      setBusy(false);
    }
  };
  const chooseCover = async () => {
    const photo = await choosePhoto();
    if (photo) set({ cover: photo.url, coverPath: photo.path });
  };
  const chooseCardPhoto = async (cardId: string) => {
    const photo = await choosePhoto();
    if (photo) setCard(cardId, { photo: photo.url, photoPath: photo.path });
  };

  const addCard = () => {
    if (deck.cards.length >= MAX_CARDS) return;
    const card = blankOwnCard();
    set({ cards: [...deck.cards, card] });
    setOpen(card.id);
  };
  const removeCard = (cardId: string) => set({ cards: deck.cards.filter((c) => c.id !== cardId) });
  const addPasted = () => {
    const result = importCards(deck, paste);
    setDeck(result.deck);
    setPaste('');
    setNotice(
      [
        result.added ? `${result.added} ${result.added === 1 ? 'card' : 'cards'} added.` : null,
        result.updated ? `${result.updated} filled in.` : null,
        result.skipped ? `${result.skipped} left out: a deck holds ${MAX_CARDS} at most.` : null,
      ]
        .filter(Boolean)
        .join(' ') || 'Nothing new in that list.',
    );
  };

  const save = async () => {
    const data = tidyOwnDeck(deck);
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(DECKS_COLLECTION, existing.id, data);
        // Photos taken off or replaced are removed from storage too.
        const kept = new Set(deckStoragePaths(data));
        if (userId) void removeUploaded(deckStoragePaths(normalizeOwnDeck(existing.data)).filter((p) => !kept.has(p)));
        router.back();
      } else {
        const entry = await addEntry(DECKS_COLLECTION, data);
        router.replace({ pathname: '/rituals/divination/draw', params: { kind: 'oracle', deck: entry.id } });
      }
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this deck?', 'It and its cards will be removed on every device. Readings you drew from it are kept.', 'Delete'))) return;
    await removeEntry(DECKS_COLLECTION, existing.id);
    if (userId) void removeUploaded(deckStoragePaths(normalizeOwnDeck(existing.data)));
    router.replace('/rituals/divination/decks' as Href);
  };

  return (
    <RitualScreen back={existing ? 'Your decks' : 'Back'}>
      <Title eyebrow={existing ? 'Change your deck' : 'Make a deck'}>{deck.name.trim() || 'Your deck'}</Title>

      <Field label="Its name" value={deck.name} onChange={(v) => set({ name: v })} placeholder="The deck’s name, as it’s printed or as you call it" />
      <Field label="A line about it (if you like)" value={deck.detail} onChange={(v) => set({ detail: v })} placeholder="Who made it, or what you use it for" />

      <View style={ui.gapSmall}>
        <SectionLabel>Cover</SectionLabel>
        {!!deck.cover && <Image source={{ uri: deck.cover }} style={styles.cover} accessibilityLabel={`${deck.name || 'The deck'}’s cover`} />}
        <View style={ui.actions}>
          <Button label={deck.cover ? 'Change the cover photo' : 'Add a cover photo'} variant="outline" onPress={chooseCover} disabled={busy} />
          {!!deck.cover && <Button label="Take the cover off" variant="text" onPress={() => set({ cover: '', coverPath: '' })} />}
        </View>
      </View>

      <Toggle
        label="Read reversals"
        detail="Cards can come up upside down when you draw here, with the reversed meaning you write (or the upright one, turned)."
        value={deck.reversals}
        onChange={(v) => set({ reversals: v })}
      />

      <View style={ui.gapSmall}>
        <SectionLabel>{`The cards (${deck.cards.length})`}</SectionLabel>
        {deck.cards.length === 0 && <Body muted>Add cards one at a time, or paste a list below.</Body>}
        {deck.cards.map((card, i) =>
          open === card.id ? (
            <Card key={card.id} accent>
              <Field label={`${i + 1}. Its name`} value={card.name} onChange={(v) => setCard(card.id, { name: v })} placeholder="As printed on the card" />
              <Field label="A few words" value={card.keywords} onChange={(v) => setCard(card.id, { keywords: v })} placeholder="hope, renewal, rest" />
              <Field label="What it means" value={card.meaning} onChange={(v) => setCard(card.id, { meaning: v })} placeholder="From the guidebook, or in your own words" multiline />
              {deck.reversals && (
                <Field label="Reversed (if you like)" value={card.reversed} onChange={(v) => setCard(card.id, { reversed: v })} placeholder="What it means upside down" multiline />
              )}
              {!!card.photo && <Image source={{ uri: card.photo }} style={styles.cardPhoto} accessibilityLabel={`${card.name || 'The card'}, your photo`} />}
              <View style={ui.actions}>
                <Button label={card.photo ? 'Change the photo' : 'Add a photo'} variant="outline" onPress={() => chooseCardPhoto(card.id)} disabled={busy} />
                {!!card.photo && <Button label="Take the photo off" variant="text" onPress={() => setCard(card.id, { photo: '', photoPath: '' })} />}
              </View>
              <View style={ui.actions}>
                <Button label="Done" variant="text" onPress={() => setOpen(null)} />
                <Button label="Take this card out" variant="text" onPress={() => removeCard(card.id)} />
              </View>
            </Card>
          ) : (
            <Card key={card.id}>
              <View style={styles.cardRow}>
                {card.photo ? <Image source={{ uri: card.photo }} style={styles.thumb} accessibilityIgnoresInvertColors /> : <View style={[styles.thumb, styles.thumbBlank]} />}
                <View style={styles.grow}>
                  <Text style={styles.cardName}>{card.name || `Card ${i + 1}`}</Text>
                  {!!(card.keywords || card.meaning) && (
                    <Text style={type.caption} numberOfLines={2}>
                      {card.keywords || card.meaning}
                    </Text>
                  )}
                </View>
              </View>
              <Button label="Change" variant="text" onPress={() => setOpen(card.id)} />
            </Card>
          ),
        )}
        {deck.cards.length < MAX_CARDS && <Button label="Add a card" variant="outline" onPress={addCard} />}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Paste a list of cards</SectionLabel>
        <Body muted>One card to a line: “The Moon — trust what you feel”, or “The Moon — intuition, dreams — trust what you feel” with a few words between. Numbers in front are fine.</Body>
        <Field label="The list" value={paste} onChange={setPaste} placeholder={'Ancestors — those who came before\nThe Well — rest, renewal'} multiline />
        <Button label="Add these cards" variant="outline" onPress={addPasted} disabled={!paste.trim()} />
      </View>

      {!!notice && <Notice>{notice}</Notice>}
      {!session && <Notice>Saved on this phone, photos too. Sign in to keep your decks with your account and on the website.</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Keeping it…' : existing ? 'Save changes' : 'Keep this deck'} onPress={save} disabled={saving || busy} />
        {existing && <Button label="Draw from it" variant="outline" onPress={() => router.push({ pathname: '/rituals/divination/draw', params: { kind: 'oracle', deck: existing.id } })} />}
        {existing && <Button label="Delete this deck" variant="text" onPress={remove} />}
      </View>
      {busy && <Body muted>Saving the photo…</Body>}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  cover: { width: 120, height: 180, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.goldLine },
  cardPhoto: { width: 140, height: 220, borderRadius: 8, borderWidth: 1, borderColor: colors.goldLine },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 36, height: 56, borderRadius: 4, borderWidth: 1, borderColor: colors.goldLine },
  thumbBlank: { backgroundColor: colors.surfaceRaised },
  grow: { flex: 1, gap: 2 },
  cardName: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
});
