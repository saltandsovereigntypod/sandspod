import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { AltarChoiceSheet, useBeginOnAltar } from '../../../components/altar/connect/BeginOnAltar';
import { IngredientCheck } from '../../../components/altar/connect/IngredientCheck';
import { Body, Card, Chip, Chips, Expander, Field, Notice, RitualScreen, SectionLabel, Title, tell, ui } from '../../../components/rituals/ui';
import { templateNeeds, type Pantry } from '../../../lib/altar/connect/ingredients';
import { useWorkshop } from '../../../lib/altar/workshop';
import { DEITY_LINK_LABEL } from '../../../lib/astro/planetGuides';
import { STONES } from '../../../lib/craft/crystal/collections';
import type { Stone } from '../../../lib/craft/crystal/stones';
import { PLANTS, type Plant } from '../../../lib/craft/green/garden';
import { useCraft } from '../../../lib/craft/store';
import { useGrimoire } from '../../../lib/grimoire/store';
import { ritualsLibraryHref } from '../../../lib/library';
import { handOffDraft } from '../../../lib/rituals/handoff';
import { premadeById } from '../../../lib/rituals/premade';
import {
  allDeities,
  allMaterials,
  blankSpec,
  defaultName,
  deityOf,
  GENERAL_SUBSTITUTES,
  methodOf,
  methodSteps,
  openTemplate,
  ownedFirst,
  ownedRefs,
  plannerKeyOf,
  SPELL_INTENTS,
  SPELL_METHODS,
  specFromParams,
  specFromPremade,
  specSteps,
  specToDraft,
  spellHistory,
  spellIntent,
  spellSafety,
  spellText,
  starterIngredients,
  substitutesFor,
  suggestDays,
  suggestDeities,
  suggestMaterials,
  suggestMoons,
  WORDS_STARTERS,
  migrateSpec,
  type SpellSpec,
  type SuggestType,
} from '../../../lib/rituals/spellcraft';
import { blankStep } from '../../../lib/rituals/lifecycle';
import { saveTemplate, startRitual, useRituals } from '../../../lib/rituals/store';
import type { Ingredient, StepDraft } from '../../../lib/rituals/types';
import { useSession } from '../../../lib/session';
import { colors, fonts, radius, type } from '../../../theme';

const AUTOSAVE = 'rituals.spellBuilder.v2';
const OWN_CATEGORY: Record<string, SuggestType> = { candles: 'candle', herbs: 'herb', crystals: 'crystal' };
const TYPE_LABELS: Record<SuggestType, string> = { candle: 'Candles', herb: 'Herbs', crystal: 'Stones' };
const FOCUS = ['', '5', '10', '15', '30'];

type Params = {
  intention?: string;
  intent?: string;
  method?: string;
  add?: string;
  deity?: string;
  planet?: string;
  templateId?: string;
  premade?: string;
  fresh?: string;
};

const entryIdOf = (ref: string) => ref.replace(/\//g, ':');
const deityName = (key: string) => deityOf(key)?.name ?? null;
const starters = (intent: string | null) => starterIngredients(spellIntent(intent));

/** A spell from the link that opened the builder, or null to restore the last one. */
function fromLink(params: Params): SpellSpec | null {
  const premade = premadeById(params.premade);
  if (premade) return specFromPremade(premade);
  if (params.intent || params.intention || params.method || params.add || params.deity || params.planet || params.fresh) return specFromParams(params, starters, deityName);
  return null;
}

export default function SpellBuilder() {
  const params = useLocalSearchParams<Params>();
  const { session } = useSession();
  const rituals = useRituals();
  const grimoire = useGrimoire();
  const workshop = useWorkshop();
  const { entries: stones } = useCraft<Stone>(STONES);
  const { entries: plants } = useCraft<Plant>(PLANTS);
  const onAltar = useBeginOnAltar();

  const [spec, setSpec] = useState<SpellSpec>(() => fromLink(params) ?? blankSpec());
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [other, setOther] = useState('');
  const [choosingAltar, setChoosingAltar] = useState(false);
  const loaded = useRef(false);

  // Open a saved spell once the templates are in; otherwise pick up where you left off.
  useEffect(() => {
    if (loaded.current) return;
    if (params.templateId) {
      const template = rituals.templates.find((t) => t.id === params.templateId);
      if (!template) return;
      loaded.current = true;
      // After this render, like the restore below.
      void Promise.resolve().then(() => {
        setSpec(openTemplate(template));
        setTemplateId(template.id);
      });
      return;
    }
    loaded.current = true;
    if (fromLink(params)) return;
    void AsyncStorage.getItem(AUTOSAVE)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as { spec?: unknown; templateId?: string | null };
        setSpec(migrateSpec(saved.spec));
        setTemplateId(saved.templateId ?? null);
      })
      .catch(() => undefined);
  }, [params, rituals.templates]);

  // Nothing typed here is lost if the app closes.
  useEffect(() => {
    if (!loaded.current) return;
    const timer = setTimeout(() => void AsyncStorage.setItem(AUTOSAVE, JSON.stringify({ spec, templateId })).catch(() => undefined), 400);
    return () => clearTimeout(timer);
  }, [spec, templateId]);

  const update = (patch: Partial<SpellSpec>) => setSpec((s) => ({ ...s, ...patch }));
  const intent = spellIntent(spec.intent);
  const method = methodOf(spec.method);
  const draft = useMemo(() => specToDraft(spec, { id: templateId }), [spec, templateId]);
  const steps = specSteps(spec);
  const saved = templateId ? rituals.templates.find((t) => t.id === templateId) ?? null : null;

  const pantry = useMemo<Pantry>(
    () => ({ objects: [], apothecary: workshop.apothecary, customItems: workshop.customItems, stones: stones.map((s) => s.data), plants: plants.map((p) => p.data) }),
    [workshop.apothecary, workshop.customItems, stones, plants],
  );
  const suggested = useMemo(() => (intent ? suggestMaterials(intent, { planet: spec.planet }) : null), [intent, spec.planet]);
  const owned = useMemo(
    () => ownedRefs([...(suggested ? [...suggested.candle, ...suggested.herb, ...suggested.crystal] : []), ...spec.ingredients], pantry),
    [suggested, spec.ingredients, pantry],
  );
  const ownItems = useMemo<Ingredient[]>(
    () =>
      workshop.customItems
        .filter((item) => OWN_CATEGORY[item.category])
        .map((item) => ({ ref: `custom/${item.customCabinetItemId ?? item.id}`, name: item.name, type: OWN_CATEGORY[item.category] })),
    [workshop.customItems],
  );
  const deities = useMemo(() => (intent ? suggestDeities(intent, { planet: spec.planet }) : []), [intent, spec.planet]);
  const safety = useMemo(() => spellSafety(spec), [spec]);
  const history = useMemo(() => spellHistory(rituals.journal, spec, { templateId, title: draft.title }), [rituals.journal, spec, templateId, draft.title]);

  const has = (ref: string) => spec.ingredients.some((i) => i.ref === ref);
  const toggle = (item: Ingredient) =>
    update({ ingredients: has(item.ref) ? spec.ingredients.filter((i) => i.ref !== item.ref) : [...spec.ingredients, { ref: item.ref, name: item.name, type: item.type }] });
  const swap = (from: Ingredient, to: { name: string; ref: string }) =>
    update({ ingredients: spec.ingredients.map((i) => (i.ref === from.ref ? { ref: to.ref, name: to.name, type: from.type } : i)).filter((i, n, all) => all.findIndex((x) => x.ref === i.ref) === n) });
  const chooseIntent = (key: string) => {
    const next = spec.intent === key ? null : key;
    // Starter ingredients follow the intent until you've chosen your own.
    const untouched = !spec.ingredients.length || spec.ingredients.every((i) => starters(spec.intent).some((s) => s.ref === i.ref));
    update({ intent: next, ...(untouched ? { ingredients: starters(next) } : {}) });
  };
  const toggleDeity = (key: string, name: string) =>
    update({ deities: spec.deities.some((d) => d.key === key) ? spec.deities.filter((d) => d.key !== key) : [...spec.deities, { key, name }] });

  // The steps editor: the first change makes the form's steps your own.
  const setSteps = (next: StepDraft[]) => update({ steps: next });
  const editStep = (i: number, patch: Partial<StepDraft>) =>
    setSteps(steps.map((s, n) => (n === i ? { ...s, ...patch, completion_mode: (patch.minutes ?? s.minutes) ? s.completion_mode : 'manual' } : s)));
  const moveStep = (i: number, by: number) => {
    const next = [...steps];
    const [s] = next.splice(i, 1);
    next.splice(i + by, 0, s);
    setSteps(next);
    setEditing(null);
  };

  const begin = async () => {
    setBusy(true);
    try {
      await startRitual(saved ? { kind: 'template', template: saved } : { kind: 'draft', draft });
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
      const row = await saveTemplate({ ...draft, grimoire_page_id: saved?.grimoire_page_id ?? null, from: (saved?.metadata?.from as Record<string, unknown>) ?? null });
      setTemplateId(row.id);
      void grimoire.refresh();
      tell(templateId ? 'Saved' : 'Kept in your Grimoire', templateId ? 'Your changes are saved.' : 'It is with your templates and has a page in your Grimoire.');
    } catch (e) {
      tell("Couldn't save", e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const plan = () => {
    handOffDraft(draft);
    const key = plannerKeyOf(spec);
    router.push({ pathname: '/rituals/planner', params: saved ? { templateId: saved.id } : { fromSpell: '1', ...(key ? { intention: key } : {}) } });
  };

  // The timing advisor, which hands the chosen time to the planner with this spell.
  const findTime = () => {
    handOffDraft(draft);
    const moon = spec.moon ? { moon: spec.moon } : {};
    const weekday = spec.planet ? { weekday: String(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].indexOf(spec.planet)) } : {};
    router.push({
      pathname: '/rituals/craft/cosmic/timing',
      params: { ...(saved ? { templateId: saved.id } : { fromSpell: '1' }), title: draft.title, ...(intent ? { intent: intent.key } : {}), ...moon, ...weekday },
    } as never);
  };

  const startOver = () => {
    setSpec(blankSpec());
    setTemplateId(null);
    setEditing(null);
  };

  const pickList = (items: Ingredient[], label: string) => (
    <Chips>
      {items.map((item) => (
        <Chip
          key={item.ref}
          label={owned.has(item.ref) ? `${item.name} · yours` : item.name}
          selected={has(item.ref)}
          a11yLabel={`${item.name}${owned.has(item.ref) ? ', you have it' : ''}. ${label}`}
          onPress={() => toggle(item)}
        />
      ))}
    </Chips>
  );

  return (
    <RitualScreen back="Rituals">
      <Title eyebrow={saved ? 'Spell builder · saved spell' : 'Spell builder'}>{draft.title}</Title>
      <Body muted>Work through it in order or jump about: every choice can be changed, and the steps follow along until you make them your own.</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>1 · What is it for?</SectionLabel>
        <Chips>
          {SPELL_INTENTS.map((i) => (
            <Chip key={i.key} label={i.label} selected={spec.intent === i.key} onPress={() => chooseIntent(i.key)} />
          ))}
        </Chips>
        {!!intent && <Body muted>{intent.why}</Body>}
      </View>
      <Field label="In your own words" value={spec.purpose} onChange={(purpose) => update({ purpose })} placeholder="Steady work that pays the rent" multiline />

      <View style={ui.gapSmall}>
        <SectionLabel>2 · Its form</SectionLabel>
        <Chips>
          {SPELL_METHODS.map((m) => (
            <Chip key={m.key} label={m.label} selected={spec.method === m.key} a11yLabel={`${m.label}: ${m.line}`} onPress={() => update({ method: m.key })} />
          ))}
        </Chips>
        <Body>{method.line}</Body>
        {method.needs.length > 0 && <Body muted>{`You'll also need: ${method.needs.join('; ').toLowerCase()}.`}</Body>}
        {!!method.history && <Body muted>{method.history}</Body>}
        {spec.method === 'sigil' && <Button label="Open the sigil maker" variant="text" onPress={() => router.push('/rituals/sigil')} />}
        {spec.method === 'simmer' && <Button label="Simmer pot ideas in the kitchen" variant="text" onPress={() => router.push('/rituals/craft/kitchen/simmer' as Href)} />}
      </View>

      <View style={ui.gap}>
        <SectionLabel>3 · What goes in</SectionLabel>
        {suggested ? (
          <>
            <Body muted>{`From the Living Library for ${intent?.label.toLowerCase()}${spec.planet ? `, leaning to ${spec.planet}` : ''}. Things you have are marked and come first.`}</Body>
            {(['candle', 'herb', 'crystal'] as SuggestType[]).map((t) =>
              suggested[t].length ? (
                <View key={t} style={ui.gapSmall}>
                  <Text style={type.eyebrow}>{TYPE_LABELS[t]}</Text>
                  {pickList(ownedFirst(suggested[t], owned), suggested[t].map((s) => s.why).join(''))}
                </View>
              ) : null,
            )}
          </>
        ) : (
          <Body muted>{`Choose what it's for and the Library will suggest candles, herbs and stones. Or choose freely below.`}</Body>
        )}
        {ownItems.length > 0 && (
          <View style={ui.gapSmall}>
            <Text style={type.eyebrow}>Your own cabinet</Text>
            {pickList(ownItems, 'From your own cabinet')}
          </View>
        )}
        {(['candle', 'herb', 'crystal'] as SuggestType[]).map((t) => (
          <Expander key={t} title={`All ${TYPE_LABELS[t].toLowerCase()} in the Library`}>
            {pickList(
              allMaterials(t).map((s) => ({ ref: s.ref, name: s.danger ? `${s.name} (poisonous)` : s.name, type: s.type })),
              'From the Living Library',
            )}
          </Expander>
        ))}
        <View style={styles.addRow}>
          <View style={styles.flex}>
            <Field label="Something else" value={other} onChange={setOther} placeholder="Salt, a coin, a photograph, ribbon…" />
          </View>
        </View>
        <Button
          label="Add it"
          variant="outline"
          disabled={!other.trim()}
          onPress={() => {
            const name = other.trim();
            const ref = `own/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            if (!has(ref)) update({ ingredients: [...spec.ingredients, { ref, name, type: 'item' }] });
            setOther('');
          }}
        />

        {spec.ingredients.length > 0 && (
          <Card>
            <SectionLabel>Chosen</SectionLabel>
            {spec.ingredients.map((item) => {
              const subs = item.ref.startsWith('traditional/') ? substitutesFor(item.ref) : [];
              return (
                <View key={item.ref} style={styles.chosen}>
                  <Text style={type.cardTitle}>{`${item.name}${owned.has(item.ref) ? ' · you have it' : ''}`}</Text>
                  {subs.length > 0 && (
                    <>
                      <Body muted>Or use instead:</Body>
                      <Chips>
                        {subs.map((s) =>
                          s.ref ? <Chip key={s.name} label={`${s.name} ⇄`} a11yLabel={`Use ${s.name} instead of ${item.name}`} onPress={() => swap(item, { name: s.name, ref: s.ref! })} /> : <Chip key={s.name} label={s.name} />,
                        )}
                      </Chips>
                    </>
                  )}
                  <View style={styles.inline}>
                    {item.ref.startsWith('traditional/') && (
                      <Button label="In the Library" variant="text" onPress={() => router.push(ritualsLibraryHref({ id: entryIdOf(item.ref) }))} />
                    )}
                    <Button label="Remove" variant="text" onPress={() => toggle(item)} />
                  </View>
                </View>
              );
            })}
            <Body muted>{`${GENERAL_SUBSTITUTES.candle} ${GENERAL_SUBSTITUTES.crystal}`}</Body>
          </Card>
        )}
        <IngredientCheck needs={templateNeeds({ ingredients: spec.ingredients })} />
      </View>

      <View style={ui.gap}>
        <SectionLabel>4 · Who you honour (if anyone)</SectionLabel>
        <Body muted>{`Optional. Deities aren't ingredients: approach them through their own tradition, with an offering, and ask rather than command.`}</Body>
        {deities.map((d) => (
          <Card key={d.name}>
            <Text style={type.cardTitle}>{`${d.name}${d.tradition ? ` · ${d.tradition}` : ''}`}</Text>
            {!!d.link && <Body muted>{`${DEITY_LINK_LABEL[d.link]} to ${d.planet}`}</Body>}
            {!!d.note && <Body>{d.note}</Body>}
            {d.days.length > 0 && <Body muted>{`Their days: ${d.days.map((x) => `${x.name} (${x.basis})`).join('; ')}`}</Body>}
            {!!d.respect && <Body muted>{d.respect}</Body>}
            <View style={styles.inline}>
              <Button
                label={spec.deities.some((x) => x.key === d.key) ? 'Honouring' : 'Honour in this spell'}
                variant={spec.deities.some((x) => x.key === d.key) ? 'primary' : 'outline'}
                onPress={() => d.key && toggleDeity(d.key, d.name)}
              />
              {!!d.key && <Button label="In the Library" variant="text" onPress={() => router.push(ritualsLibraryHref({ id: `traditional:deity:${d.key}` }))} />}
            </View>
          </Card>
        ))}
        <Expander title="All deities in the Library">
          <Chips>
            {allDeities().map((d) => (
              <Chip key={d.key} label={d.name} selected={spec.deities.some((x) => x.key === d.key)} a11yLabel={`${d.name}, ${d.tradition}`} onPress={() => toggleDeity(d.key, d.name)} />
            ))}
          </Chips>
        </Expander>
        <Button label="Closed & living traditions" variant="text" onPress={() => router.push('/more/library/closed' as Href)} />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>5 · When</SectionLabel>
        <Text style={type.eyebrow}>The moon</Text>
        <Chips>
          {(intent ? suggestMoons(intent) : (['new', 'waxing', 'full', 'waning'] as const).map((tide) => ({ tide, label: tide, best: false }))).map((m) => (
            <Chip key={m.tide} label={`${m.label}${m.best ? ' · best' : ''}`} selected={spec.moon === m.tide} onPress={() => update({ moon: spec.moon === m.tide ? null : m.tide })} />
          ))}
        </Chips>
        <Text style={type.eyebrow}>The day and its planet</Text>
        <Chips>
          {(intent ? suggestDays(intent) : suggestDays({ ...SPELL_INTENTS[0], planets: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] })).map((d) => (
            <Chip key={d.planet} label={`${d.day} · ${d.planet}`} selected={spec.planet === d.planet} onPress={() => update({ planet: spec.planet === d.planet ? null : d.planet })} />
          ))}
        </Chips>
        {!!spec.planet && (
          <Button label={`About ${spec.planet}: colours, herbs, stones`} variant="text" onPress={() => router.push({ pathname: '/rituals/craft/cosmic/planet', params: { planet: spec.planet! } } as Href)} />
        )}
        <Button label="Find a good time" variant="outline" accessibilityHint="The timing advisor's best times ahead, then plan it" onPress={findTime} />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>6 · Your words</SectionLabel>
        <Field label="Words, chant or petition" value={spec.words} onChange={(words) => update({ words })} placeholder={method.wordsHint} multiline />
        {!!intent && WORDS_STARTERS[intent.key] && spec.words.trim() !== WORDS_STARTERS[intent.key] && (
          <Button label="Start from a simple line" variant="text" accessibilityHint={WORDS_STARTERS[intent.key]} onPress={() => update({ words: spec.words.trim() ? `${spec.words.trim()}\n${WORDS_STARTERS[intent.key]}` : WORDS_STARTERS[intent.key] })} />
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>{`7 · The steps (${steps.length})`}</SectionLabel>
        <Body muted>{spec.steps ? 'These are your own steps now.' : `Following the ${method.label.toLowerCase()} form. Change anything and they become yours.`}</Body>
        <Text style={type.eyebrow}>Time to sit with it</Text>
        <Chips>
          {FOCUS.map((m) => (
            <Chip key={m || 'none'} label={m ? `${m} minutes` : 'No timer'} selected={spec.focusMinutes === m} onPress={() => update({ focusMinutes: m })} />
          ))}
        </Chips>
        {steps.map((s, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.number}>{i + 1}</Text>
            <View style={styles.flex}>
              {editing === i ? (
                <View style={ui.gapSmall}>
                  <Field label="Title" value={s.title} onChange={(title) => editStep(i, { title })} />
                  <Field label="What to do" value={s.instructions} onChange={(instructions) => editStep(i, { instructions })} multiline />
                  <Field label="Words to say (optional)" value={s.spoken_text} onChange={(spoken_text) => editStep(i, { spoken_text })} multiline />
                  <Field label="Minutes (optional)" value={s.minutes} onChange={(minutes) => editStep(i, { minutes: minutes.replace(/[^0-9]/g, '') })} />
                  <Button label="Done" variant="outline" onPress={() => setEditing(null)} />
                </View>
              ) : (
                <>
                  <Text style={type.cardTitle}>{s.title || 'Untitled step'}</Text>
                  {!!s.instructions && <Body>{s.instructions}</Body>}
                  {!!s.spoken_text && <Text style={styles.spoken}>{s.spoken_text}</Text>}
                  {!!s.minutes && <Body muted>{`${s.minutes} min`}</Body>}
                </>
              )}
              <View style={styles.inline}>
                {editing !== i && <Button label="Edit" variant="text" onPress={() => setEditing(i)} />}
                {i > 0 && <Button label="Up" variant="text" accessibilityHint="Move this step earlier" onPress={() => moveStep(i, -1)} />}
                {i < steps.length - 1 && <Button label="Down" variant="text" accessibilityHint="Move this step later" onPress={() => moveStep(i, 1)} />}
                <Button label="Remove" variant="text" onPress={() => (setSteps(steps.filter((_, n) => n !== i)), setEditing(null))} />
              </View>
            </View>
          </View>
        ))}
        <View style={styles.inline}>
          <Button label="Add a step" variant="outline" onPress={() => (setSteps([...steps, { ...blankStep(), title: 'A step of my own' }]), setEditing(steps.length))} />
          {!!spec.steps && (
            <Button label={`Use the ${method.label.toLowerCase()} steps again`} variant="text" onPress={() => (update({ steps: null }), setEditing(null))} />
          )}
        </View>
        {!!spec.steps && <Body muted>{`The ${method.label.toLowerCase()} form starts with ${methodSteps({ ...spec, steps: null }).length} steps.`}</Body>}
      </View>

      {safety.length > 0 && (
        <Card accent>
          <SectionLabel>8 · Take care</SectionLabel>
          {safety.map((n, i) => (
            <Body key={i}>{`${n.level === 'danger' ? 'Danger: ' : ''}${n.text}`}</Body>
          ))}
        </Card>
      )}

      <View style={ui.gapSmall}>
        <SectionLabel>9 · Name, notes and altar</SectionLabel>
        <Field label="Name" value={spec.name} onChange={(name) => update({ name })} placeholder={defaultName(spec)} />
        <Field label="Notes of your own" value={spec.notes} onChange={(notes) => update({ notes })} placeholder="Where it came from, what to change next time…" multiline />
        {rituals.altars.length > 0 && (
          <>
            <Text style={type.eyebrow}>Belongs to an altar</Text>
            <Chips>
              {rituals.altars.map((a) => (
                <Chip key={a.id} label={a.name} selected={spec.altarId === a.id} onPress={() => update({ altarId: spec.altarId === a.id ? null : a.id })} />
              ))}
            </Chips>
          </>
        )}
      </View>

      <Card>
        <SectionLabel>Did it work?</SectionLabel>
        {history.workings.length ? (
          <>
            <Body>{history.line ?? `Worked ${history.workings.length} ${history.workings.length === 1 ? 'time' : 'times'}, still waiting to look back.`}</Body>
            {history.workings.slice(0, 5).map((w) => (
              <Button
                key={w.id}
                label={`${w.date ?? ''} · ${w.answerLabel || (w.waitingUntil ? `look back ${w.waitingUntil}` : 'no look-back yet')}`}
                variant="text"
                onPress={() => router.push({ pathname: '/rituals/journal/[id]', params: { id: w.id } } as Href)}
              />
            ))}
          </>
        ) : (
          <Body muted>{`After you've done it, the journal asks when to look back, and then whether it worked. The answers gather here and in What works for you.`}</Body>
        )}
        {history.materials.map((m) => (
          <Body key={m.name} muted>{`${m.name}: ${m.tally.yes} of ${m.tally.total} workings with it worked${m.tally.caveat ? ` (${m.tally.caveat})` : ''}.`}</Body>
        ))}
        <Button label="What works for you" variant="text" onPress={() => router.push('/rituals/journal/insights' as Href)} />
      </Card>

      <Card>
        <View style={ui.actions}>
          <Button label={busy ? 'One moment…' : 'Begin now'} disabled={busy || !!rituals.active} onPress={begin} />
          {saved && (
            <Button label={onAltar.busy ? 'Beginning…' : 'Begin on an altar'} variant="outline" disabled={busy || onAltar.busy || !!rituals.active} onPress={() => setChoosingAltar(true)} />
          )}
          <Button label="Plan a night for it" variant="outline" onPress={plan} />
          {session ? (
            <Button label={busy ? 'Saving…' : saved ? 'Save changes' : 'Keep in my Grimoire'} variant="outline" disabled={busy} onPress={keep} />
          ) : (
            <Body muted>Sign in to keep spells in your Grimoire, begin them on an altar and share them.</Body>
          )}
          {saved && (
            <>
              <Button label="Open the saved spell" variant="text" onPress={() => router.push({ pathname: '/rituals/templates/[id]', params: { id: saved.id } })} />
              {!!saved.grimoire_page_id && (
                <Button label="Its Grimoire page" variant="text" onPress={() => router.push({ pathname: '/grimoire/[pageId]', params: { pageId: saved.grimoire_page_id! } } as Href)} />
              )}
              <Button
                label="Share with the community"
                variant="text"
                accessibilityHint="Offers a copy to Community Rituals, reviewed before it appears"
                onPress={() => router.push({ pathname: '/rituals/community/share', params: { templateId: saved.id } })}
              />
            </>
          )}
          <Button label="Share or print as text" variant="text" onPress={() => void Share.share({ title: draft.title, message: spellText(spec) }).catch(() => undefined)} />
          <Button label="Start a new spell" variant="text" onPress={startOver} />
        </View>
        {!!rituals.active && <Notice>A ritual is under way. Finish it before beginning this one.</Notice>}
      </Card>

      {saved && (
        <AltarChoiceSheet
          visible={choosingAltar}
          title={saved.title}
          onClose={() => setChoosingAltar(false)}
          onPick={(id) => {
            setChoosingAltar(false);
            void onAltar.begin({ kind: 'template', template: saved }, id).catch((e: unknown) => tell("Couldn't begin", e instanceof Error ? e.message : 'Please try again.'));
          }}
        />
      )}
    </RitualScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 6 },
  addRow: { flexDirection: 'row', gap: 8 },
  inline: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  chosen: { gap: 4, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.goldLine },
  step: { flexDirection: 'row', gap: 14, backgroundColor: colors.surface, borderRadius: radius.tile, padding: 14 },
  number: { fontFamily: fonts.display, fontSize: 26, color: colors.gold, width: 24, textAlign: 'center' },
  spoken: { fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 25, color: colors.parchment },
});
