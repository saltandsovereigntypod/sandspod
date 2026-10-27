import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { searchItems, stepItemOf, type ItemEntry } from '../../../lib/altar/itemIndex';
import {
  applyCustomAction,
  forWholeCoven,
  specsOf,
  stepActionName,
  TURN_MODES,
  type BuilderStep,
  type CustomAction,
  type GatheringKind,
  type NamedThing,
  type RitualPlan,
} from '../../../lib/covens/builder';
import { CONTRIBUTION_FATES, CONTRIBUTION_KINDS, CONTRIBUTION_TIMINGS, CONTRIBUTION_VISIBILITY, contributionNote, defaultContribution, kindOf, type ContributionKind, type StepContribution } from '../../../lib/covens/contributions';
import { ALTAR_ACCESS } from '../../../lib/covens/draft';
import { cleanValues, partsOf, type FieldValues } from '../../../lib/covens/fields';
import { assigneeFromKey, assigneeKey, cleanAssignees, type Assignee, type PickEntry } from '../../../lib/covens/picker';
import { actionLabel, ALTAR_EFFECTS, applyAction, groupsFor, searchActions, type ActionGroup, type StepAction } from '../../../lib/covens/stepActions';
import { HIDDEN_PAGE } from '../../../lib/grimoire/access';
import { colors, fonts, radius, touch, type } from '../../../theme';
import { Button } from '../../Button';
import { Card, Chips, Field, Notice, Section } from '../../more/ui';
import { SearchPicker } from '../SearchPicker';
import { FieldRenderer, MultiChips, type FieldContext } from './FieldRenderer';

type BookPageLike = { id: string; title: string; section: string | null; hidden?: boolean };

// One step, on its own (ritual/plan.tsx opens it from the outline): what it
// is (an action, or one of the coven's own), its name, who does it and how
// (together, one at a time, those named only, one for all), what its action
// asks (fields.ts: directions and callers, the candle and its name, what is
// poured and to whom), and its words, written here or linked from a page of
// the coven's Book. Everything else (directions, timing, items, the altar,
// what it asks of people) waits under More options. The website's twin is
// covens/coven/builder.js.
export function StepFocus({
  step,
  number,
  plan,
  onChange,
  onDone,
  onRemove,
  onDuplicate,
  onSaveBlock,
  onMakeAction,
  onPickBlock,
  who,
  whoSuggest,
  whoLabel,
  items,
  itemSuggest,
  custom,
  blocks,
  named,
  pages,
  blocked,
  kind,
}: {
  kind?: GatheringKind;
  step: BuilderStep;
  number: number;
  plan: RitualPlan;
  onChange: (patch: Partial<BuilderStep>) => void;
  onDone: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onSaveBlock: () => void;
  onMakeAction: () => void;
  onPickBlock: (id: string) => void;
  who: PickEntry[];
  whoSuggest: string[];
  whoLabel: (key: string) => string;
  items: ItemEntry[];
  itemSuggest: (queries?: string[]) => string[];
  custom: CustomAction[];
  blocks: { id: string; title: string }[];
  named: NamedThing[];
  pages: BookPageLike[];
  blocked: string;
}) {
  const fresh = !step.title.trim() && !step.action;
  const [choosing, setChoosing] = useState(fresh);
  const [group, setGroup] = useState<ActionGroup | ''>('');
  const [query, setQuery] = useState('');
  const [more, setMore] = useState(false);
  const [linking, setLinking] = useState(false);
  const [pageQuery, setPageQuery] = useState('');
  const found = useMemo(() => (query.trim() ? searchActions(query, kind) : group ? searchActions('', kind).filter((a) => a.group === group) : []), [query, group, kind]);
  const specs = specsOf(step, custom);
  const values = cleanValues(specs, step.details.fields);
  // Each part (a direction) has its own words, so the step's own aren't asked for.
  const partsSpec = specs.find((x) => x.type === 'parts');
  const partsWords = !!partsSpec && partsOf(partsSpec, values, specs).length > 0;
  const fieldCtx: FieldContext = { who, whoSuggest, whoLabel, items, named, actionId: step.action, pages };
  const setFields = (next: FieldValues) => onChange({ details: { ...step.details, fields: next } });
  const sectionName = plan.sections.find((s) => s.id === step.section)?.name ?? '';

  const choose = (a: StepAction | null) => {
    setChoosing(false);
    setQuery('');
    if (!a) return onChange({ action: '', details: { ...step.details, custom_action: undefined } });
    onChange({ ...applyAction(a), details: { ...step.details, custom_action: undefined, fields: {} } });
  };
  const chooseCustom = (c: CustomAction) => {
    setChoosing(false);
    onChange({ ...applyCustomAction(c), details: { ...step.details, custom_action: c.id, fields: {} } });
  };

  // Who: the gathering's roles (toggled), and positions, people or the whole coven.
  const whole = forWholeCoven(step);
  const people = cleanAssignees(step.assignees).filter((a) => a.kind !== 'coven');
  const setPeople = (list: Assignee[]) => onChange({ assignees: cleanAssignees(list) });
  const toggleRole = (id: string) => onChange({ roles: step.roles.includes(id) ? step.roles.filter((r) => r !== id) : [...step.roles, id] });
  const nonRole = who.filter((e) => !e.key.startsWith('role:'));

  const ask = step.contribution;
  const setAsk = (patch: Partial<StepContribution>) => ask && onChange({ contribution: { ...ask, ...patch } });
  const writes = ask ? kindOf(ask.kind).verb === 'write' : false;
  // A linked page you can't open (or that's gone) shows only that; its title stays with those who can.
  const linkedPage = step.details.book_page_id ? pages.find((p) => p.id === step.details.book_page_id) : undefined;
  const linked = step.details.book_page_id ? (linkedPage && !linkedPage.hidden ? linkedPage : { id: step.details.book_page_id, title: linkedPage?.hidden || pages.length ? HIDDEN_PAGE : (step.details.book_page_title ?? 'A page of the Book'), section: null }) : null;
  const pageMatches = pages.filter((p) => !p.hidden).filter((p) => !pageQuery.trim() || `${p.title} ${p.section ?? ''}`.toLowerCase().includes(pageQuery.trim().toLowerCase())).slice(0, 8);
  const effect = ALTAR_EFFECTS.find((e) => e.value === step.altar_action) ?? ALTAR_EFFECTS[0];

  if (choosing) {
    return (
      <View style={styles.gap}>
        <Text style={type.eyebrow}>
          Step {number}
          {sectionName ? ` · ${sectionName}` : ''}
        </Text>
        <Text style={type.title}>What happens here?</Text>
        <Text style={type.caption}>Choose what the step is. It fills in a name and words you can change.</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={kind === 'meeting' ? 'Find one: motion, report, election, round…' : 'Find one: quarters, candle, libation, vote…'}
          placeholderTextColor="rgba(202,191,157,0.6)"
          accessibilityLabel="Find what the step is"
          autoCorrect={false}
          style={styles.input}
        />
        {!query.trim() && <Chips label="Kinds of step" options={groupsFor(kind).map((g) => ({ value: g.id, label: g.label }))} value={group as ActionGroup} onChange={(g) => setGroup(g === group ? '' : g)} />}
        <View style={styles.list}>
          {found.map((a) => (
            <Pressable key={a.id} accessibilityRole="button" accessibilityLabel={actionLabel(a)} onPress={() => choose(a)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <Text style={styles.optionText}>{actionLabel(a)}</Text>
            </Pressable>
          ))}
        </View>
        {custom.length > 0 && (
          <Section label="The coven’s own">
            <View style={styles.list}>
              {custom
                .filter((c) => !query.trim() || c.name.toLowerCase().includes(query.trim().toLowerCase()))
                .map((c) => (
                  <Pressable key={c.id} accessibilityRole="button" accessibilityLabel={c.name} onPress={() => chooseCustom(c)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                    <Text style={styles.optionText}>{c.name}</Text>
                  </Pressable>
                ))}
            </View>
          </Section>
        )}
        {fresh && blocks.length > 0 && (
          <Section label="The coven’s saved blocks">
            <View style={styles.list}>
              {blocks.map((b) => (
                <Pressable key={b.id} accessibilityRole="button" accessibilityLabel={`Add ${b.title}`} onPress={() => onPickBlock(b.id)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
                  <Text style={styles.optionText}>{b.title}</Text>
                </Pressable>
              ))}
            </View>
          </Section>
        )}
        <Button label="Something else (write it yourself)" variant="outline" onPress={() => choose(null)} />
        {fresh ? <Button label="Never mind" variant="text" onPress={onRemove} /> : <Button label="Keep it as it was" variant="text" onPress={() => setChoosing(false)} />}
      </View>
    );
  }

  return (
    <View style={styles.gap}>
      <Text style={type.eyebrow}>
        Step {number}
        {sectionName ? ` · ${sectionName}` : ''}
      </Text>
      <Field label="Step name" value={step.title} onChangeText={(v) => onChange({ title: v })} maxLength={120} placeholder="Call the quarters" />
      <View style={styles.row}>
        <Text style={[type.caption, styles.grow]}>{stepActionName(step, custom) || 'Written by you'}</Text>
        <Button label="Change what it is" variant="text" onPress={() => setChoosing(true)} />
      </View>

      <Card>
        <Text style={type.eyebrow}>Who</Text>
        {plan.roles.length > 0 && (
          <MultiChips label="Roles" options={plan.roles.map((r) => ({ value: r.id, label: r.name }))} value={step.roles} onChange={(next) => onChange({ roles: next })} />
        )}
        <SearchPicker
          label={plan.roles.length ? 'And people or positions' : 'People or positions'}
          chips={people.map((a) => ({ key: assigneeKey(a), label: whoLabel(assigneeKey(a)) }))}
          entries={nonRole}
          suggestions={whoSuggest.filter((k) => !k.startsWith('role:'))}
          onAdd={(entry) => {
            if (entry.key.startsWith('role:')) return toggleRole(entry.key.slice(5));
            const a = assigneeFromKey(entry.key);
            if (!a) return;
            setPeople(a.kind === 'coven' ? [a] : [...people, a]);
          }}
          onRemove={(key) => setPeople(people.filter((a) => assigneeKey(a) !== key))}
          placeholder="Maiden, Initiate, Rowan…"
          empty={whole ? 'The whole coven' : 'No one else'}
        />
        {!!blocked && <Notice>{blocked}</Notice>}
        <Text style={type.eyebrow}>How</Text>
        <Chips label="How it is done" options={TURN_MODES} value={step.turn_mode} onChange={(v) => onChange({ turn_mode: v })} />
        <Text style={type.caption}>{TURN_MODES.find((t) => t.value === step.turn_mode)?.detail}</Text>
      </Card>

      {specs.some((s) => s.essential) && (
        <Card>
          <FieldRenderer specs={specs} values={values} onChange={setFields} ctx={fieldCtx} only="essential" />
        </Card>
      )}

      {!partsWords && <Card>
        <Text style={type.eyebrow}>Words</Text>
        {linked ? (
          <>
            <Text style={type.body}>From the coven’s Book: {linked.title}</Text>
            <Text style={type.caption}>The words are read from the page as it stands, so changes to the page show here too.</Text>
            <Button label="Unlink the page" variant="text" onPress={() => onChange({ details: { ...step.details, book_page_id: undefined, book_page_title: undefined } })} />
          </>
        ) : (
          <>
            <Field label="Words to speak" value={step.spoken_text} onChangeText={(v) => onChange({ spoken_text: v })} multiline maxLength={4000} placeholder="Leave empty if nothing is said" />
            {pages.length > 0 &&
              (linking ? (
                <View style={styles.block}>
                  <Field label="Find a page in the coven’s Book" value={pageQuery} onChangeText={setPageQuery} placeholder="Opening prayer" autoCorrect={false} />
                  {pageMatches.map((p) => (
                    <Pressable
                      key={p.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Link ${p.title}`}
                      onPress={() => {
                        setLinking(false);
                        onChange({ details: { ...step.details, book_page_id: p.id, book_page_title: p.title } });
                      }}
                      style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                    >
                      <Text style={styles.optionText}>
                        {p.title}
                        {p.section ? <Text style={type.caption}> · {p.section}</Text> : null}
                      </Text>
                    </Pressable>
                  ))}
                  <Button label="Cancel" variant="text" onPress={() => setLinking(false)} />
                </View>
              ) : (
                <Button label="Link a page of the coven’s Book instead" variant="text" onPress={() => setLinking(true)} />
              ))}
          </>
        )}
      </Card>}

      <Button label={more ? 'Fewer options' : 'More options'} variant="outline" onPress={() => setMore(!more)} />
      {more && (
        <View style={styles.gap}>
          <Card>
            <Field label="Directions" hint="What the person doing it does. They see this when the step comes." value={step.instructions} onChangeText={(v) => onChange({ instructions: v })} multiline maxLength={4000} />
            <Field
              label="Minutes (optional)"
              value={step.duration_minutes == null ? '' : String(step.duration_minutes)}
              onChangeText={(v) => onChange({ duration_minutes: v.trim() === '' ? null : Math.max(0, Math.min(240, Math.round(Number(v) || 0))) })}
              keyboardType="number-pad"
            />
            {specs.some((s) => !s.essential) && <FieldRenderer specs={specs} values={values} onChange={setFields} ctx={fieldCtx} only="more" />}
            {plan.roles.length > 0 && !!step.spoken_text.trim() && (
              <>
                <Text style={type.eyebrow}>Who speaks the words</Text>
                <MultiChips label="Who speaks the words" options={plan.roles.map((r) => ({ value: r.id, label: r.name }))} value={step.details.speakers ?? []} onChange={(next) => onChange({ details: { ...step.details, speakers: next } })} />
              </>
            )}
          </Card>

          <Card>
            <SearchPicker
              label="Items"
              hint="What the step uses, or sets on the altar."
              chips={step.items.map((i) => ({ key: i.key, label: i.name, image: i.image }))}
              entries={items}
              search={(q, picked) => searchItems(items, q, { limit: 8, picked, suggestions: itemSuggest() })}
              onAdd={(entry) => onChange({ items: [...step.items, stepItemOf(entry as ItemEntry)].slice(0, 24) })}
              onRemove={(key) => onChange({ items: step.items.filter((i) => i.key !== key) })}
              placeholder="White candle, rosemary, bread…"
            />
            <Text style={type.eyebrow}>On the altar</Text>
            <Chips label="On the altar" options={ALTAR_EFFECTS.map((e) => ({ value: e.value, label: e.label }))} value={step.altar_action} onChange={(v) => onChange({ altar_action: v })} />
            <Text style={type.caption}>{effect.detail}</Text>
            <Text style={type.eyebrow}>Who tends the altar during it</Text>
            <Chips label="Who tends the altar during it" options={ALTAR_ACCESS} value={step.altar_access} onChange={(v) => onChange({ altar_access: v })} />
            {step.altar_access === 'chosen' && (
              <SearchPicker
                label="Tended by"
                chips={cleanAssignees(step.altar_tenders).map((a) => ({ key: assigneeKey(a), label: whoLabel(assigneeKey(a)) }))}
                entries={nonRole}
                suggestions={whoSuggest.filter((k) => !k.startsWith('role:'))}
                onAdd={(entry) => {
                  const a = assigneeFromKey(entry.key);
                  if (a) onChange({ altar_tenders: cleanAssignees([...step.altar_tenders, a]) });
                }}
                onRemove={(key) => onChange({ altar_tenders: step.altar_tenders.filter((a) => assigneeKey(a) !== key) })}
                placeholder="Maiden, Rowan…"
                empty="No one chosen yet."
              />
            )}
          </Card>

          <Card>
            <Text style={type.eyebrow}>Ask something of people</Text>
            <Chips
              label="Ask something of people"
              options={[{ value: '', label: 'Nothing' }, ...CONTRIBUTION_KINDS.map((k) => ({ value: k.id, label: k.label }))]}
              value={(ask?.kind ?? '') as ContributionKind | ''}
              onChange={(v) => onChange({ contribution: v ? defaultContribution(v as ContributionKind, ask ? { timing: ask.timing } : {}) : null })}
            />
            {ask && (
              <View style={styles.block}>
                <Chips label="When" options={CONTRIBUTION_TIMINGS} value={ask.timing} onChange={(v) => setAsk({ timing: v })} />
                <Text style={type.caption}>{CONTRIBUTION_TIMINGS.find((t) => t.value === ask.timing)?.detail}</Text>
                {writes && (
                  <>
                    <Text style={type.eyebrow}>Who can read it</Text>
                    <Chips label="Who can read it" options={CONTRIBUTION_VISIBILITY} value={ask.visibility} onChange={(v) => setAsk({ visibility: v })} />
                    <Text style={type.eyebrow}>What becomes of it</Text>
                    <Chips label="What becomes of it" options={CONTRIBUTION_FATES.filter((f) => f.value !== 'petition' || ask.kind === 'petition')} value={ask.fate} onChange={(v) => setAsk({ fate: v })} />
                    <Text style={type.caption}>{CONTRIBUTION_FATES.find((f) => f.value === ask.fate)?.detail}</Text>
                  </>
                )}
                <Field label="A line for them (optional)" value={ask.prompt ?? ''} onChangeText={(v) => setAsk({ prompt: v })} maxLength={280} placeholder="What are you grateful for?" />
                <Text style={type.caption}>
                  {step.turn_mode === 'on_behalf' ? 'One person does it for everyone. ' : ''}They will see: {contributionNote({ ...ask, mode: step.turn_mode === 'on_behalf' ? 'one' : 'each' })}
                </Text>
              </View>
            )}
          </Card>

          <Card>
            <Text style={type.eyebrow}>Section</Text>
            <Chips label="Section" options={plan.sections.map((s) => ({ value: s.id, label: s.name }))} value={step.section} onChange={(v) => onChange({ section: v })} />
            <View style={styles.wrap}>
              <Button label="Duplicate" variant="outline" onPress={onDuplicate} />
              <Button label="Save as a block" variant="outline" onPress={onSaveBlock} />
              {!step.details.custom_action && <Button label="Make it one of the coven’s own" variant="outline" onPress={onMakeAction} />}
            </View>
            <Text style={type.caption}>A block can be added to any of the coven’s rituals. One of the coven’s own shows with the steps you choose from.</Text>
          </Card>
        </View>
      )}

      <Button label="Done" onPress={onDone} />
      <Button label="Remove this step" variant="text" onPress={onRemove} />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  block: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  list: { gap: 6 },
  option: { minHeight: touch, justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.tile, borderWidth: 1, borderColor: colors.hairline },
  optionText: { fontFamily: fonts.body, fontSize: 15, color: colors.cream },
  input: {
    minHeight: touch,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'rgba(244,236,216,0.22)',
    backgroundColor: colors.night,
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  pressed: { opacity: 0.7 },
});
