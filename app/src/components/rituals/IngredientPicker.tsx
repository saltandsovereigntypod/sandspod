import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { useLibrary } from '../../lib/library';
import { LIBRARY_TYPES, typeLabel, typeSingular } from '../../lib/library/model';
import type { LibraryEntry } from '../../lib/library/types';
import { ingredientFromEntry, isCustom, pickerMatches, samePick, togglePick } from '../../lib/rituals/ingredients';
import type { LibraryItem } from '../../lib/rituals/libraryData';
import { toIngredient } from '../../lib/rituals/spell';
import type { Ingredient } from '../../lib/rituals/types';
import { Body, Chip, Chips, Expander, Field, SectionLabel, ui } from './ui';

// Records of rituals and book sections live in the Library too, but they aren't
// things to gather.
const NOT_GATHERED = new Set(['ritual', 'ritual_template', 'section']);

type Props = {
  picked: Ingredient[];
  onChange: (next: Ingredient[]) => void;
  /** What the intention suggests, shown first. */
  suggested?: LibraryItem[];
  suggestedNote?: string;
  title?: string;
};

/**
 * What a ritual gathers: the suggestions, anything in the Living Library (every
 * type, your own entries included), or anything typed in as your own.
 */
export function IngredientPicker({ picked, onChange, suggested, suggestedNote, title = "What you'll gather" }: Props) {
  const { entries } = useLibrary();
  const [query, setQuery] = useState('');
  const gatherable = useMemo(() => entries.filter((entry) => !NOT_GATHERED.has(entry.type)), [entries]);
  const matches = useMemo(() => pickerMatches(gatherable, query), [gatherable, query]);
  const byType = useMemo(() => {
    const types = [...new Set(gatherable.map((entry) => entry.type))].sort((a, b) => {
      const ia = (LIBRARY_TYPES as readonly string[]).indexOf(a);
      const ib = (LIBRARY_TYPES as readonly string[]).indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || typeLabel(a).localeCompare(typeLabel(b));
    });
    return types.map((type) => ({
      type,
      entries: gatherable.filter((entry) => entry.type === type).sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [gatherable]);

  const has = (item: Ingredient) => picked.some((p) => samePick(p, item));
  const toggle = (item: Ingredient) => onChange(togglePick(picked, item));
  const entryChip = (entry: LibraryEntry, showType: boolean) => {
    const item = ingredientFromEntry(entry);
    return (
      <Chip
        key={entry.id}
        label={showType ? `${entry.name} · ${typeSingular(entry.type)}` : entry.name}
        selected={has(item)}
        a11yLabel={`${entry.name}, ${typeSingular(entry.type)}`}
        onPress={() => toggle(item)}
      />
    );
  };

  return (
    <View style={ui.gap}>
      <SectionLabel>{title}</SectionLabel>

      {picked.length > 0 ? (
        <View style={ui.gapSmall}>
          <Body muted>Tap one to take it away.</Body>
          <Chips>
            {picked.map((item) => (
              <Chip
                key={item.ref}
                label={`${item.name}${isCustom(item) ? ' (your own)' : ''} ×`}
                selected
                a11yLabel={`Remove ${item.name}`}
                onPress={() => toggle(item)}
              />
            ))}
          </Chips>
        </View>
      ) : (
        <Body muted>Nothing yet. Add suggestions, anything from your Library, or things of your own.</Body>
      )}

      {!!suggested?.length && (
        <View style={ui.gapSmall}>
          {!!suggestedNote && <Body muted>{suggestedNote}</Body>}
          <Chips>
            {suggested.map((item) => {
              const ingredient = toIngredient(item);
              return (
                <Chip
                  key={item.ref}
                  label={item.name}
                  selected={has(ingredient)}
                  a11yLabel={`${item.name}: ${item.uses}`}
                  onPress={() => toggle(ingredient)}
                />
              );
            })}
          </Chips>
        </View>
      )}

      <Field
        label="Add anything"
        value={query}
        onChange={setQuery}
        placeholder="Search your Library, or type something of your own"
      />
      {(matches.entries.length > 0 || matches.custom) && (
        <Chips>
          {matches.custom && (
            <Chip
              label={`+ Add “${matches.custom.name}” as your own`}
              selected={has(matches.custom)}
              onPress={() => {
                if (matches.custom && !has(matches.custom)) onChange([...picked, matches.custom]);
                setQuery('');
              }}
            />
          )}
          {matches.entries.map((entry) => entryChip(entry, true))}
        </Chips>
      )}

      {byType.map((group) => (
        <Expander key={group.type} title={`All ${typeLabel(group.type).toLowerCase()} (${group.entries.length})`}>
          <Chips>{group.entries.map((entry) => entryChip(entry, false))}</Chips>
        </Expander>
      ))}
    </View>
  );
}
