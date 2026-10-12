import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { IngredientPicker } from '../../../components/rituals/IngredientPicker';
import { StepsEditor } from '../../../components/rituals/StepsEditor';
import { Body, Card, Chip, Chips, Expander, Field, Notice, RitualScreen, SectionLabel, Title, tell, ui } from '../../../components/rituals/ui';
import { useGrimoire } from '../../../lib/grimoire/store';
import { refToParam } from '../../../lib/rituals/format';
import { handOffDraft } from '../../../lib/rituals/handoff';
import { isCustom, samePick } from '../../../lib/rituals/ingredients';
import { INTENTIONS, intentionByKey, suggestIngredients } from '../../../lib/rituals/planner';
import { buildSpell, defaultSpellName, toIngredient } from '../../../lib/rituals/spell';
import { saveTemplate, startRitual, useRituals } from '../../../lib/rituals/store';
import type { Ingredient, StepDraft } from '../../../lib/rituals/types';
import { useSession } from '../../../lib/session';
import { type } from '../../../theme';

const FOCUS = ['', '5', '10', '15'];

function starters(key: string | null): Ingredient[] {
  const intention = intentionByKey(key);
  if (!intention) return [];
  const s = suggestIngredients(intention);
  return [...s.candle.slice(0, 1), ...s.herb.slice(0, 2), ...s.crystal.slice(0, 1)].map(toIngredient);
}

export default function SpellBuilder() {
  const params = useLocalSearchParams<{ intention?: string }>();
  const { session } = useSession();
  const rituals = useRituals();
  const grimoire = useGrimoire();

  const [intentionKey, setIntentionKey] = useState<string | null>(params.intention ?? null);
  const [picked, setPicked] = useState<Ingredient[]>(() => starters(params.intention ?? null));
  const [purpose, setPurpose] = useState('');
  const [petition, setPetition] = useState('');
  const [focus, setFocus] = useState('10');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const intention = intentionByKey(intentionKey);
  const suggested = useMemo(() => (intention ? suggestIngredients(intention) : null), [intention]);
  const [customSteps, setCustomSteps] = useState<StepDraft[] | null>(null);
  const draft = useMemo(() => {
    const built = buildSpell({ name, intention, purpose, petition, ingredients: picked, focusMinutes: focus });
    return customSteps ? { ...built, steps: customSteps } : built;
  }, [name, intention, purpose, petition, picked, focus, customSteps]);
  const readable = picked.filter((item) => !isCustom(item));

  const choose = (key: string) => {
    const next = intentionKey === key ? null : key;
    setIntentionKey(next);
    // Swap the old intention's starters for the new one's; keep what you added.
    const previous = starters(intentionKey);
    setPicked((list) => {
      const kept = list.filter((item) => !previous.some((s) => samePick(s, item)));
      return [...kept, ...starters(next).filter((s) => !kept.some((item) => samePick(item, s)))];
    });
  };

  const begin = async () => {
    setBusy(true);
    try {
      await startRitual({ kind: 'draft', draft });
      router.replace('/rituals/run');
    } catch (e) {
      tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const keep = async () => {
    setBusy(true);
    try {
      const saved = await saveTemplate(draft);
      void grimoire.refresh();
      router.replace({ pathname: '/rituals/templates/[id]', params: { id: saved.id } });
    } catch (e) {
      tell("Couldn't save", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const plan = () => {
    handOffDraft(draft);
    router.push({ pathname: '/rituals/planner', params: { fromSpell: '1', ...(intention ? { intention: intention.key } : {}) } });
  };

  return (
    <RitualScreen back="Rituals">
      <Title eyebrow="Spell builder">{draft.title}</Title>

      <View style={ui.gapSmall}>
        <SectionLabel>What is it for?</SectionLabel>
        <Chips>
          {INTENTIONS.map((i) => (
            <Chip key={i.key} label={i.label} selected={intentionKey === i.key} onPress={() => choose(i.key)} />
          ))}
        </Chips>
      </View>

      <Field label="In your own words" value={purpose} onChange={setPurpose} placeholder="Steady work that pays the rent" multiline />

      <View style={ui.gap}>
        <IngredientPicker
          picked={picked}
          onChange={setPicked}
          suggested={suggested ? [...suggested.candle, ...suggested.herb, ...suggested.crystal] : undefined}
          suggestedNote={
            intention
              ? `Suggested from the Library for ${intention.label.toLowerCase()}. They're only suggestions: add anything you like.`
              : undefined
          }
        />
        {readable.length > 0 && (
          <View style={ui.gapSmall}>
            <Body muted>Read about them in the Library</Body>
            <Chips>
              {readable.map((item) => (
                <Chip
                  key={item.ref}
                  label={`${item.name} ›`}
                  a11yLabel={`About ${item.name}`}
                  onPress={() => router.push({ pathname: '/rituals/ingredient/[ref]', params: { ref: refToParam(item.ref) } })}
                />
              ))}
            </Chips>
          </View>
        )}
      </View>

      <Field
        label="Your words"
        value={petition}
        onChange={setPetition}
        placeholder="The petition, charm or prayer you'll speak over the flame"
        multiline
      />

      <View style={ui.gapSmall}>
        <SectionLabel>Time to sit with it</SectionLabel>
        <Chips>
          {FOCUS.map((m) => (
            <Chip key={m || 'none'} label={m ? `${m} minutes` : 'No timer'} selected={focus === m} onPress={() => setFocus(m)} />
          ))}
        </Chips>
      </View>

      <Field label="Name" value={name} onChange={setName} placeholder={defaultSpellName(intention)} />

      {customSteps ? (
        <View style={ui.gap}>
          <SectionLabel>{`Your steps (${customSteps.length})`}</SectionLabel>
          <Body muted>These are yours to change. Ingredients you add now won't rewrite them.</Body>
          <StepsEditor steps={customSteps} onChange={setCustomSteps} />
          <Button label="Go back to the suggested steps" variant="text" onPress={() => setCustomSteps(null)} />
        </View>
      ) : (
        <Expander title={`The steps (${draft.steps.length})`}>
          {draft.steps.map((step, i) => (
            <View key={i} style={ui.gapSmall}>
              <Text style={type.cardTitle}>{`${i + 1}. ${step.title}`}</Text>
              {!!step.instructions && <Body>{step.instructions}</Body>}
              {!!step.spoken_text && <Body muted>{`“${step.spoken_text}”`}</Body>}
            </View>
          ))}
          <Button label="Change the steps" variant="outline" onPress={() => setCustomSteps(draft.steps)} />
        </Expander>
      )}

      <Card>
        <View style={ui.actions}>
          <Button label={busy ? 'One moment…' : 'Begin now'} disabled={busy || !!rituals.active} onPress={begin} />
          <Button label="Plan a night for it" variant="outline" onPress={plan} />
          {session ? (
            <Button label="Keep as a template" variant="outline" disabled={busy} onPress={keep} />
          ) : (
            <Body muted>Sign in to keep spells as templates in your account and Book of Shadows.</Body>
          )}
        </View>
        {!!rituals.active && <Notice>A ritual is under way. Finish it before beginning this one.</Notice>}
      </Card>
    </RitualScreen>
  );
}
