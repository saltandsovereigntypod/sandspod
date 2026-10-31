import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { HEARTH, q } from '../../../../../../components/craft/hearth';
import { Body, Chip, Chips, Field, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import {
  ALLERGENS,
  blankRecipe,
  FESTIVAL_NAMES,
  INTENT_CHOICES,
  linesOf,
  linkIngredient,
  normalizeRecipe,
  OFFERING_NAMES,
  RECIPES,
  SEASONAL_NAMES,
  starterRecipe,
  type Recipe,
} from '../../../../../../lib/craft/hearth/recipes';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../../../lib/craft/store';
import { useSession } from '../../../../../../lib/session';

export default function RecipeEdit() {
  const params = useLocalSearchParams<{ id?: string; from?: string }>();
  const { entries, ready } = useCraft<unknown>(RECIPES);
  const existing = params.id ? (entries.find((e) => e.id === params.id) ?? null) : null;
  if (params.id && !existing) {
    return (
      <RitualScreen back="Kitchen witchery">
        <Title>A recipe</Title>
        <Body>{ready ? 'This recipe couldn’t be found.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  const from = starterRecipe(params.from);
  const start = (): Recipe => (from ? { ...normalizeRecipe(from), title: `${from.title} (my version)`, origin: 'mine' } : blankRecipe());
  return <Form key={existing?.id ?? params.from ?? 'new'} existing={existing} start={start} />;
}

function Form({ existing, start }: { existing: CraftEntry<unknown> | null; start: () => Recipe }) {
  const { session } = useSession();
  const [r, setR] = useState<Recipe>(() => (existing ? normalizeRecipe(existing.data) : start()));
  const [ingredients, setIngredients] = useState(() => r.ingredients.map((x) => x.text).join('\n'));
  const [method, setMethod] = useState(() => r.method.join('\n'));
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<Recipe>) => setR((x) => ({ ...x, ...p }));
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const save = async () => {
    const title = r.title.trim();
    if (!title) {
      tell('Name it first', 'Give your recipe a title.');
      return;
    }
    // A line kept from before keeps its links; a new line is linked by name.
    const lines = linesOf(ingredients).map((text) => r.ingredients.find((x) => x.text === text) ?? linkIngredient(text));
    const data: Recipe = { ...r, title, ingredients: lines, method: linesOf(method) };
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(RECIPES, existing.id, data);
        router.back();
      } else {
        const entry = await addEntry(RECIPES, data);
        router.replace(`${HEARTH}/recipes/recipe${q({ id: entry.id })}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!existing || !(await confirmAction('Delete this recipe?', 'It will be removed on every device. A copy kept in your Grimoire stays there.', 'Delete'))) return;
    await removeEntry(RECIPES, existing.id);
    router.replace(`${HEARTH}/recipes` as Href);
  };

  return (
    <RitualScreen back="Kitchen witchery">
      <Title eyebrow="Kitchen witchery">{existing ? 'Edit your recipe' : 'Write a recipe'}</Title>
      <Field label="Title" value={r.title} onChange={(title) => set({ title })} placeholder="Grandmother’s seed cake" />
      <View style={ui.gapSmall}>
        <SectionLabel>What it’s for</SectionLabel>
        <Chips>
          <Chip label="Just good food" selected={!r.intent} onPress={() => set({ intent: null })} />
          {INTENT_CHOICES.map((i) => (
            <Chip key={i.key} label={i.label} selected={r.intent === i.key} onPress={() => set({ intent: i.key })} />
          ))}
        </Chips>
      </View>
      <View style={ui.gap}>
        <Field label="Serves" value={r.serves} onChange={(serves) => set({ serves })} placeholder="4" />
        <Field label="Time" value={r.time} onChange={(time) => set({ time })} placeholder="1 hour" />
        <Field label="Ingredients, one to a line" value={ingredients} onChange={setIngredients} placeholder={'250 g flour\n3 sprigs of rosemary\nA pinch of sea salt'} multiline />
        <Body muted>Herbs and pantry things are linked to the Living Library and their correspondences by name.</Body>
        <Field label="Method, one step to a line" value={method} onChange={setMethod} placeholder={'Rub the butter into the flour.\nStir clockwise, thinking of…'} multiline />
        <Field label="Words to say (optional)" value={r.words} onChange={(words) => set({ words })} multiline />
      </View>
      <View style={ui.gapSmall}>
        <SectionLabel>For the festivals</SectionLabel>
        <Chips>
          {Object.entries(FESTIVAL_NAMES).map(([ref, name]) => (
            <Chip key={ref} label={name} selected={r.festivals.includes(ref)} onPress={() => set({ festivals: toggle(r.festivals, ref) })} />
          ))}
        </Chips>
        <SectionLabel>On the altar with it</SectionLabel>
        <Chips>
          {Object.entries(SEASONAL_NAMES).map(([id, name]) => (
            <Chip key={id} label={name} selected={r.seasonal.includes(id)} onPress={() => set({ seasonal: toggle(r.seasonal, id) })} />
          ))}
        </Chips>
        <SectionLabel>As an offering</SectionLabel>
        <Chips>
          <Chip label="Not an offering" selected={!r.offering} onPress={() => set({ offering: null })} />
          {Object.entries(OFFERING_NAMES).map(([id, name]) => (
            <Chip key={id} label={name} selected={r.offering === id} onPress={() => set({ offering: id })} />
          ))}
        </Chips>
        <SectionLabel>Allergens</SectionLabel>
        <Chips>
          {ALLERGENS.map((a) => (
            <Chip key={a.id} label={a.label} selected={r.allergens.includes(a.id)} onPress={() => set({ allergens: toggle(r.allergens, a.id) as Recipe['allergens'] })} />
          ))}
        </Chips>
      </View>
      <View style={ui.gap}>
        <Field label="Safety notes" value={r.safety} onChange={(safety) => set({ safety })} placeholder="Anything to take care with" multiline />
        <Field label="Where it comes from" value={r.about} onChange={(about) => set({ about })} placeholder="Your family, a book, your own making" multiline />
        <Field label="Your notes" value={r.notes} onChange={(notes) => set({ notes })} multiline />
      </View>
      {!session && <Body muted>Saved on this phone. Sign in to keep your recipes with your account.</Body>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : existing ? 'Save changes' : 'Keep this recipe'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete this recipe" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
