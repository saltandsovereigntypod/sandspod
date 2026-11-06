import type { Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { DreamShell } from '../../../../components/grimoire/dreams';
import { Body, Card, Field, SectionLabel, Title, confirmAction, tell, ui } from '../../../../components/rituals/ui';
import { DREAM_ROUTES } from '../../../../lib/grimoire/dreams';
import { deleteMeaning, saveMeaning, useDictionary } from '../../../../lib/dreams/store';

// Your own meanings: they win over the book's, and are shown first in a reading.
export default function DreamDictionary() {
  const { rows } = useDictionary();
  const [editing, setEditing] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [also, setAlso] = useState('');
  const [meaning, setMeaning] = useState('');

  const reset = () => {
    setEditing(null);
    setWord('');
    setAlso('');
    setMeaning('');
  };
  const save = async () => {
    if (!word.trim() || !meaning.trim()) {
      tell('Not yet', 'Give the word as you dream it, and what it means to you.');
      return;
    }
    const existing = rows.find((r) => r.id === editing);
    await saveMeaning(
      { word: word.trim().toLowerCase(), also: also.split(/[,;]/).map((w) => w.trim().toLowerCase()).filter(Boolean), meaning: meaning.trim(), symbolId: existing?.data.symbolId },
      editing ?? undefined,
    );
    reset();
  };

  return (
    <DreamShell back={DREAM_ROUTES.journal as Href}>
      <Title eyebrow="Your dreams">Your dream dictionary</Title>
      <Body muted>Your own meanings come first in every reading. Write “cats” and “my grandmother” and a cat in a dream will be read that way. A word the book does not know becomes a symbol of your own.</Body>

      <Card>
        <SectionLabel>{editing ? 'Edit a meaning' : 'Add a meaning'}</SectionLabel>
        <View style={ui.gap}>
          <Field label="The word, as you dream it" value={word} onChange={setWord} placeholder="cats, the red door, the lake house" />
          <Field label="Other words for it (optional)" value={also} onChange={setAlso} placeholder="Separate with commas" />
          <Field label="What it means to you" value={meaning} onChange={setMeaning} placeholder="my grandmother" multiline />
          <Button label={editing ? 'Save changes' : 'Add to my dictionary'} onPress={save} />
          {editing && <Button label="Cancel" variant="text" onPress={reset} />}
        </View>
      </Card>

      {rows.length === 0 ? (
        <Body muted>Nothing here yet. You can also add a meaning from any symbol in a reading.</Body>
      ) : (
        rows.map((r) => (
          <Card key={r.id}>
            <SectionLabel>{r.data.word}</SectionLabel>
            <Body>{r.data.meaning}</Body>
            {r.data.also.length > 0 && <Body muted>{`Also: ${r.data.also.join(', ')}`}</Body>}
            <View style={ui.actions}>
              <Button
                label="Edit"
                variant="text"
                onPress={() => {
                  setEditing(r.id);
                  setWord(r.data.word);
                  setAlso(r.data.also.join(', '));
                  setMeaning(r.data.meaning);
                }}
              />
              <Button
                label="Remove"
                variant="text"
                onPress={async () => {
                  if (await confirmAction('Remove this meaning?', 'Readings will go back to the book’s meaning.', 'Remove')) await deleteMeaning(r.id);
                }}
              />
            </View>
          </Card>
        ))
      )}
    </DreamShell>
  );
}
