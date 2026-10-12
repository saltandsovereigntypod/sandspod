import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Button } from '../Button';
import { Card, Chips, Field, MenuList, MenuRow, MoreScreen, Notice, Section } from '../more/ui';
import { confirmAction } from '../../lib/grimoire/confirm';
import { clearPractice, savePractice, searchLibrary, typeSingular, useLibrary, type LibraryEntry } from '../../lib/library';
import {
  emptyPracticeInput,
  hasPracticeText,
  PRACTICE_FIELDS,
  PRACTICE_TYPE_OPTIONS,
  type PracticeInput,
} from '../../lib/library/practiceModel';
import { useSession } from '../../lib/session';
import { colors, type } from '../../theme';

type Props = {
  /** Edit this entry's My Practice; leave out to make a new entry. */
  entryId?: string;
  back: Href;
  backLabel: string;
  /** Where a newly made entry opens. */
  hrefFor: (entry: Pick<LibraryEntry, 'id'>) => Href;
};

type Choice = { entry: LibraryEntry | null; name: string };

/**
 * New Practice Entry and Edit Entry from the website's Book of Shadows:
 * choose a category, find the Traditional entry (or name a custom one), then
 * write My Practice. Saved to living_library_entries in the website's format.
 */
export function PracticeEditor({ entryId, back, backLabel, hrefFor }: Props) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const { entries, getEntry } = useLibrary();
  const editing = entryId ? getEntry(entryId) : null;

  const [category, setCategory] = useState<string>(editing?.type ?? 'herb');
  const [query, setQuery] = useState('');
  const [choice, setChoice] = useState<Choice | null>(editing ? { entry: editing, name: editing.name } : null);
  const [input, setInput] = useState<PracticeInput>(() => emptyPracticeInput(editing?.myPractice));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const matches = useMemo(
    () => (query.trim() ? searchLibrary(entries, query, { type: category, limit: 8 }) : []),
    [entries, query, category],
  );
  const exact = matches.some((entry) => entry.name.trim().toLowerCase() === query.trim().toLowerCase());

  if (!userId) {
    return (
      <MoreScreen title="My Practice" back={back} backLabel={backLabel}>
        <Text style={type.body}>Sign in to add to My Practice. Entries are saved to your account and appear on the website too.</Text>
        <Button label="Sign in" onPress={() => router.push('/sign-in')} />
      </MoreScreen>
    );
  }

  if (entryId && !editing) {
    return (
      <MoreScreen title="My Practice" back={back} backLabel={backLabel}>
        <Text style={type.body}>This entry couldn’t be found.</Text>
      </MoreScreen>
    );
  }

  const pick = (next: Choice) => {
    setChoice(next);
    setInput(emptyPracticeInput(next.entry?.myPractice));
    setMessage(null);
  };

  const save = async () => {
    if (!choice) return;
    if (!hasPracticeText(input) && !editing) {
      setMessage('Write something in at least one field.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const id = await savePractice({ userId, entry: choice.entry, type: category, name: choice.name, input });
      if (editing) router.back();
      else router.replace(hrefFor({ id: id || choice.entry?.id || '' }));
    } catch {
      setSaving(false);
      setMessage('It couldn’t be saved. Check your connection and try again.');
    }
  };

  const remove = async () => {
    if (!editing) return;
    const ok = await confirmAction(
      `Remove ${editing.name} from My Practice?`,
      'Your My Practice notes for this entry will be cleared here and on the website.',
      'Remove',
    );
    if (!ok) return;
    setSaving(true);
    try {
      await clearPractice(userId, editing);
      router.replace(back);
    } catch {
      setSaving(false);
      setMessage('It couldn’t be removed. Check your connection and try again.');
    }
  };

  return (
    <MoreScreen
      title={editing ? editing.name : 'New entry'}
      eyebrow={editing ? `My Practice · ${editing.category}` : 'My Practice'}
      back={back}
      backLabel={backLabel}
    >
      {!editing && (
        <>
          <Section label="1. Category">
            <Chips
              label="Category"
              options={PRACTICE_TYPE_OPTIONS}
              value={category as (typeof PRACTICE_TYPE_OPTIONS)[number]['value']}
              onChange={(value) => {
                setCategory(value);
                setChoice(null);
              }}
            />
          </Section>

          <Section label={`2. Which ${typeSingular(category).toLowerCase()}?`}>
            {choice ? (
              <Card>
                <Text style={type.cardTitle}>{choice.name}</Text>
                <Text style={type.caption}>
                  {choice.entry?.traditional
                    ? 'My Practice will sit beside its Traditional Information.'
                    : 'A custom entry of your own, without Traditional Information.'}
                </Text>
                <Button label="Choose another" variant="text" onPress={() => setChoice(null)} />
              </Card>
            ) : (
              <>
                <Field
                  label="Search the Library, or type a new name"
                  value={query}
                  onChangeText={setQuery}
                  placeholder={category === 'crystal' ? 'Amethyst, moonstone…' : 'Start typing…'}
                  autoCorrect={false}
                />
                {(matches.length > 0 || query.trim().length > 0) && (
                  <MenuList>
                    {matches.map((entry, index) => (
                      <MenuRow
                        key={entry.id}
                        label={entry.name}
                        detail={entry.myPractice ? 'Already in My Practice · edit it' : entry.category}
                        last={exact && index === matches.length - 1}
                        onPress={() => pick({ entry, name: entry.name })}
                      />
                    ))}
                    {!exact && (
                      <MenuRow
                        label={`Create “${query.trim()}”`}
                        detail={`A custom ${typeSingular(category).toLowerCase()}`}
                        last
                        onPress={() => pick({ entry: null, name: query.trim() })}
                      />
                    )}
                  </MenuList>
                )}
              </>
            )}
          </Section>
        </>
      )}

      {choice && (
        <Section label={editing ? undefined : '3. My Practice'}>
          {PRACTICE_FIELDS.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              value={input[field.key]}
              onChangeText={(text) => setInput((current) => ({ ...current, [field.key]: text }))}
              multiline
              numberOfLines={field.lines}
            />
          ))}
          {!!message && <Notice>{message}</Notice>}
          <Button label={saving ? 'Saving…' : editing ? 'Save' : 'Create entry'} disabled={saving} onPress={() => void save()} />
          {editing?.myPractice && editing.type !== 'apothecary' && (
            <Pressable accessibilityRole="button" onPress={() => void remove()} disabled={saving} style={styles.remove}>
              <Text style={styles.removeText}>Remove from My Practice</Text>
            </Pressable>
          )}
        </Section>
      )}
    </MoreScreen>
  );
}

const styles = StyleSheet.create({
  remove: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  removeText: { ...type.caption, color: colors.muted, textDecorationLine: 'underline' },
});
