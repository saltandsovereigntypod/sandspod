import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  addPrep,
  addRole,
  addSection,
  castRole,
  HOLD_CHOICES,
  moveSection,
  PREP_REMIND,
  removeRole,
  removeSection,
  renameRole,
  renameSection,
  ROLE_SUGGESTIONS,
  type BuilderStep,
  type GatheringKind,
  type MeetingSettings,
  type RitualPlan,
} from '../../../lib/covens/builder';
import { meetingRoleId, meetingSettings } from '../../../lib/covens/meetings';
import { FIELD_TYPES, optionsFromLines, type FieldSpec, type FieldType } from '../../../lib/covens/fields';
import { assigneeFromKey, assigneeKey, cleanAssignees, type Assignee, type PickEntry } from '../../../lib/covens/picker';
import { type } from '../../../theme';
import { Button } from '../../Button';
import { Card, Chips, Field, Notice } from '../../more/ui';
import { SearchPicker } from '../SearchPicker';

type Change = (next: { plan: RitualPlan; steps?: BuilderStep[] }) => void;

// The builder's panels (ritual/plan.tsx), each one thing at a time: the
// gathering's sections, its roles and who plays them, the checklist for
// before, what happens afterwards, and a new action of the coven's own.
// The website's twins are in covens/coven/builder.js.

export function SectionsPanel({ plan, steps, onChange, onSaveBlock }: { plan: RitualPlan; steps: BuilderStep[]; onChange: Change; onSaveBlock: (sectionId: string) => void }) {
  const [name, setName] = useState('');
  return (
    <View style={styles.gap}>
      <Text style={type.caption}>Name the parts of the gathering as your tradition does, and put them in order. Removing a section moves its steps into the one before.</Text>
      {plan.sections.map((s, i) => {
        const count = steps.filter((x) => x.section === s.id).length;
        return (
          <Card key={s.id}>
            <Field label={`Section ${i + 1}`} value={s.name} onChangeText={(v) => onChange({ plan: renameSection(plan, s.id, v) })} maxLength={60} />
            <Text style={type.caption}>{count === 1 ? '1 step' : `${count} steps`}</Text>
            <View style={styles.row}>
              <Button label="Up" variant="outline" disabled={i === 0} onPress={() => onChange({ plan: moveSection(plan, s.id, -1) })} />
              <Button label="Down" variant="outline" disabled={i === plan.sections.length - 1} onPress={() => onChange({ plan: moveSection(plan, s.id, 1) })} />
              {plan.sections.length > 1 && <Button label="Remove" variant="text" onPress={() => onChange(removeSection(plan, steps, s.id))} />}
              {count > 0 && <Button label="Save its steps as a block" variant="text" onPress={() => onSaveBlock(s.id)} />}
            </View>
          </Card>
        );
      })}
      <Card>
        <Field label="A new section" value={name} onChangeText={setName} maxLength={60} placeholder="Invocation, Aarti, Prasad, Reports…" />
        <Button
          label="Add the section"
          variant="outline"
          disabled={!name.trim()}
          onPress={() => {
            onChange({ plan: addSection(plan, name) });
            setName('');
          }}
        />
      </Card>
    </View>
  );
}

export function RolesPanel({
  plan,
  steps,
  kind,
  who,
  whoSuggest,
  whoLabel,
  onChange,
}: {
  plan: RitualPlan;
  steps: BuilderStep[];
  kind: GatheringKind;
  who: PickEntry[];
  whoSuggest: string[];
  whoLabel: (key: string) => string;
  onChange: Change;
}) {
  const [name, setName] = useState('');
  const suggestions = ROLE_SUGGESTIONS[kind].filter((r) => !plan.roles.some((x) => x.name.toLowerCase() === r.toLowerCase())).slice(0, 8);
  const entries = who.filter((e) => !e.key.startsWith('role:'));
  const add = (n: string) => {
    if (!n.trim()) return;
    onChange({ plan: addRole(plan, n).plan });
    setName('');
  };
  return (
    <View style={styles.gap}>
      <Text style={type.caption}>Name each role once and cast someone in it. Steps are given to roles, so when someone else takes a role, every step goes with it.</Text>
      {plan.roles.map((role) => {
        const used = steps.filter((s) => s.roles.includes(role.id)).length;
        return (
          <Card key={role.id}>
            <Field label="Role" value={role.name} onChangeText={(v) => onChange({ plan: renameRole(plan, role.id, v) })} maxLength={60} />
            <SearchPicker
              label="Played by"
              chips={cleanAssignees(role.cast).map((a) => ({ key: assigneeKey(a), label: whoLabel(assigneeKey(a)) }))}
              entries={entries}
              suggestions={whoSuggest.filter((k) => !k.startsWith('role:'))}
              onAdd={(entry) => {
                const a = assigneeFromKey(entry.key);
                if (a) onChange({ plan: castRole(plan, role.id, a.kind === 'coven' ? [a] : [...role.cast.filter((c) => c.kind !== 'coven'), a]) });
              }}
              onRemove={(key) => onChange({ plan: castRole(plan, role.id, role.cast.filter((a) => assigneeKey(a) !== key)) })}
              placeholder="A person or a position"
              empty="No one yet"
            />
            <Text style={type.caption}>{used === 1 ? 'In 1 step.' : `In ${used} steps.`}</Text>
            <Button label="Remove the role" variant="text" onPress={() => onChange(removeRole(plan, steps, role.id))} />
          </Card>
        );
      })}
      <Card>
        <Text style={type.eyebrow}>Add a role</Text>
        {suggestions.length > 0 && <Chips label="Suggested roles" options={suggestions.map((s) => ({ value: s, label: s }))} value={'' as string} onChange={add} />}
        <Field label="Or name your own" value={name} onChangeText={setName} maxLength={60} placeholder="Keeper of the flame" />
        <Button label="Add the role" variant="outline" disabled={!name.trim()} onPress={() => add(name)} />
      </Card>
    </View>
  );
}

export function ChecklistPanel({ plan, onChange }: { plan: RitualPlan; onChange: Change }) {
  const [text, setText] = useState('');
  return (
    <View style={styles.gap}>
      <Text style={type.caption}>Things everyone does before the rite. They show on each person’s Before the rite list with a reminder, and each ticks them off. The coven’s head, and those the head chooses, see who has.</Text>
      {plan.checklist.map((item) => (
        <Card key={item.id}>
          <Field label="To do" value={item.text} onChangeText={(v) => onChange({ plan: { ...plan, checklist: plan.checklist.map((c) => (c.id === item.id ? { ...c, text: v } : c)) } })} maxLength={200} />
          <Chips label="Remind them" options={PREP_REMIND} value={item.remind} onChange={(v) => onChange({ plan: { ...plan, checklist: plan.checklist.map((c) => (c.id === item.id ? { ...c, remind: v } : c)) } })} />
          <Button label="Remove" variant="text" onPress={() => onChange({ plan: { ...plan, checklist: plan.checklist.filter((c) => c.id !== item.id) } })} />
        </Card>
      ))}
      <Card>
        <Field label="Something to do before" value={text} onChangeText={setText} maxLength={200} placeholder="Wash your hands before you arrive." />
        <Button
          label="Add it"
          variant="outline"
          disabled={!text.trim()}
          onPress={() => {
            onChange({ plan: addPrep(plan, text) });
            setText('');
          }}
        />
      </Card>
    </View>
  );
}

export function AfterwardsPanel({ plan, kind = 'rite', onChange }: { plan: RitualPlan; kind?: GatheringKind; onChange: Change }) {
  const a = plan.afterwards;
  const set = (patch: Partial<RitualPlan['afterwards']>) => onChange({ plan: { ...plan, afterwards: { ...a, ...patch } } });
  const hold = a.hold_hours ? String(a.hold_hours) : '';
  return (
    <View style={styles.gap}>
      {kind !== 'meeting' && <Card>
        <Text style={type.eyebrow}>Leave the altar untouched</Text>
        <Chips label="Leave the altar untouched" options={HOLD_CHOICES.some((h) => h.value === hold) ? HOLD_CHOICES : [...HOLD_CHOICES, { value: hold, label: `${hold} hours` }]} value={hold} onChange={(v) => set({ hold_hours: v ? Number(v) : null })} />
        <Text style={type.caption}>For that long after the rite no one tends or clears the ritual’s altar, its keepers included. Then its leader is reminded to clear it.</Text>
      </Card>}
      <Card>
        <Field label="Notes for afterwards" value={a.notes} onChangeText={(v) => set({ notes: v })} multiline maxLength={2000} placeholder="Leave the offerings at the crossroads overnight." />
      </Card>
      <Card>
        <Field label="A follow-up reminder (optional)" value={a.follow_up?.text ?? ''} onChangeText={(v) => set({ follow_up: v.trim() ? { text: v, after_hours: a.follow_up?.after_hours ?? 24 } : null })} maxLength={200} placeholder="Keep the Noumenia today" />
        {!!a.follow_up && (
          <Field
            label="Hours after the rite"
            value={String(a.follow_up.after_hours)}
            onChangeText={(v) => set({ follow_up: { text: a.follow_up!.text, after_hours: Math.max(1, Math.min(1440, Math.round(Number(v) || 1))) } })}
            keyboardType="number-pad"
          />
        )}
        <Text style={type.caption}>Everyone in the coven is reminded, on the app.</Text>
      </Card>
    </View>
  );
}

const LEAD_CHOICES = [0, 5, 10, 15, 30, 60].map((n) => ({ value: String(n), label: n ? `${n} min before` : 'At the start' }));
const LENGTH_CHOICES = [30, 45, 60, 90, 120, 180].map((n) => ({ value: String(n), label: n < 60 ? `${n} min` : n % 60 ? `${Math.floor(n / 60)}½ hours` : n === 60 ? '1 hour' : `${n / 60} hours` }));
const MINUTES_VIEW = [
  { value: 'audience', label: 'Those it is for' },
  { value: 'coven', label: 'The whole coven' },
] as const;

/**
 * A meeting's own settings (meetings.ts): who it is for, its Chair and
 * Secretary, when its chat opens and how long it runs, which meetings it
 * follows on from, and who reads its minutes. Only meetings show this.
 */
export function MeetingPanel({
  plan,
  audience,
  onAudience,
  who,
  whoSuggest,
  whoLabel,
  historyLine,
  onChange,
}: {
  plan: RitualPlan;
  audience: Assignee[];
  onAudience: (next: Assignee[]) => void;
  who: PickEntry[];
  whoSuggest: string[];
  whoLabel: (key: string) => string;
  /** Who reads the whole chat afterwards, as it stands. */
  historyLine: string;
  onChange: Change;
}) {
  const s = meetingSettings(plan);
  const set = (patch: Partial<MeetingSettings>) => onChange({ plan: { ...plan, meeting: { ...(plan.meeting ?? {}), ...patch } } });
  const entries = who.filter((e) => !e.key.startsWith('role:'));
  const roleOptions = plan.roles.map((r) => ({ value: r.id, label: r.name }));
  return (
    <View style={styles.gap}>
      <Card>
        <Text style={type.eyebrow}>Who it’s for</Text>
        <SearchPicker
          label="Who it’s for"
          chips={audience.map((a) => ({ key: assigneeKey(a), label: whoLabel(assigneeKey(a)) }))}
          entries={entries}
          suggestions={whoSuggest.filter((k) => !k.startsWith('role:'))}
          onAdd={(entry) => {
            const a = assigneeFromKey(entry.key);
            if (a) onAudience(a.kind === 'coven' ? [] : cleanAssignees([...audience, a]));
          }}
          onRemove={(key) => onAudience(audience.filter((a) => assigneeKey(a) !== key))}
          placeholder="The High Priestess, Elders, the Maiden…"
          empty="Everyone in the coven"
        />
        <Text style={type.caption}>
          {audience.length
            ? 'No one else sees this meeting: not its agenda, votes, notes, actions, chat or minutes. Those cast in its roles, whoever plans it and the coven’s head always do.'
            : 'Everyone in the coven sees it. Choose positions or people to keep it to them.'}
        </Text>
      </Card>
      {plan.roles.length > 0 && (
        <Card>
          <Text style={type.eyebrow}>The Chair</Text>
          <Chips label="The Chair" options={roleOptions} value={meetingRoleId(plan, 'chair') ?? ''} onChange={(v) => set({ chair_role: v })} />
          <Text style={type.caption}>Whoever plays this role moves the meeting on, gives the floor, calls votes and opens or closes the chat.</Text>
          <Text style={type.eyebrow}>The Secretary</Text>
          <Chips label="The Secretary" options={roleOptions} value={meetingRoleId(plan, 'secretary') ?? ''} onChange={(v) => set({ secretary_role: v })} />
          <Text style={type.caption}>Whoever plays this role keeps the notes for each item, adds the actions, and writes the minutes.</Text>
        </Card>
      )}
      {!plan.roles.length && <Notice tone="muted">Add a Chair and a Secretary under Roles, and they will run the meeting and keep its notes.</Notice>}
      <Card>
        <Text style={type.eyebrow}>The meeting’s chat opens</Text>
        <Chips label="The meeting’s chat opens" options={LEAD_CHOICES.some((c) => c.value === String(s.lead_minutes)) ? LEAD_CHOICES : [...LEAD_CHOICES, { value: String(s.lead_minutes), label: `${s.lead_minutes} min before` }]} value={String(s.lead_minutes)} onChange={(v) => set({ lead_minutes: Number(v) })} />
        <Text style={type.eyebrow}>It runs for about</Text>
        <Chips label="It runs for about" options={LENGTH_CHOICES.some((c) => c.value === String(s.length_minutes)) ? LENGTH_CHOICES : [...LENGTH_CHOICES, { value: String(s.length_minutes), label: `${s.length_minutes} min` }]} value={String(s.length_minutes)} onChange={(v) => set({ length_minutes: Number(v) })} />
        <Text style={type.caption}>
          The meeting has its own chat, apart from the coven’s. Those it is for can write in it from then until the meeting ends; the Chair can open it early, close it, or keep it open a while longer.
        </Text>
        <Text style={type.caption}>Afterwards, the whole chat is read by: {historyLine}. The coven’s head chooses this, on the meeting’s page. Everyone else has the minutes.</Text>
      </Card>
      <Card>
        <Text style={type.eyebrow}>The minutes are read by</Text>
        <Chips label="The minutes are read by" options={MINUTES_VIEW} value={s.minutes_view} onChange={(v) => set({ minutes_view: v })} />
        <Field
          label="Which meetings it follows on from"
          hint="Actions not yet done carry forward to the next meeting with the same name here."
          value={plan.meeting?.series ?? ''}
          onChangeText={(v) => set({ series: v })}
          maxLength={60}
          placeholder={s.series}
        />
      </Card>
    </View>
  );
}

/** A step of the coven's own: its name, where it usually goes, directions and words, and fields from the same kinds as every step. */
export function CustomActionForm({
  plan,
  initial,
  onSave,
  onCancel,
}: {
  plan: RitualPlan;
  initial: { name: string; section?: string; directions: string; words: string; minutes: number | null; fields: FieldSpec[] };
  onSave: (action: { name: string; section?: string; directions: string; words: string; minutes: number | null; fields: FieldSpec[] }) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldOptions, setFieldOptions] = useState('');
  const needsOptions = fieldType === 'choice' || fieldType === 'multi';
  return (
    <View style={styles.gap}>
      <Text style={type.caption}>An action of the coven’s own shows with the steps you choose from, in every ritual.</Text>
      <Card>
        <Field label="Its name" value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} maxLength={80} placeholder="Our quarter call" />
        <Text style={type.eyebrow}>Where it usually goes</Text>
        <Chips label="Where it usually goes" options={plan.sections.map((s) => ({ value: s.id, label: s.name }))} value={draft.section ?? ''} onChange={(v) => setDraft({ ...draft, section: v })} />
        <Field label="Directions" value={draft.directions} onChangeText={(v) => setDraft({ ...draft, directions: v })} multiline maxLength={4000} />
        <Field label="Words to speak (optional)" value={draft.words} onChangeText={(v) => setDraft({ ...draft, words: v })} multiline maxLength={4000} />
      </Card>
      <Card>
        <Text style={type.eyebrow}>What it asks for</Text>
        {draft.fields.length === 0 && <Text style={type.caption}>Nothing yet. Add a field for each thing the step needs to know.</Text>}
        {draft.fields.map((f) => (
          <View key={f.key} style={styles.row}>
            <Text style={[type.body, styles.grow]}>
              {f.label} <Text style={type.caption}>· {FIELD_TYPES.find((t) => t.value === f.type)?.label}</Text>
            </Text>
            <Button label="Remove" variant="text" onPress={() => setDraft({ ...draft, fields: draft.fields.filter((x) => x.key !== f.key) })} />
          </View>
        ))}
        <Chips label="Kind of field" options={FIELD_TYPES} value={fieldType} onChange={setFieldType} />
        <Field label="Its label" value={fieldLabel} onChangeText={setFieldLabel} maxLength={80} placeholder="Which herb" />
        {needsOptions && <Field label="The choices, one per line" value={fieldOptions} onChangeText={setFieldOptions} multiline maxLength={1000} />}
        <Button
          label="Add the field"
          variant="outline"
          disabled={!fieldLabel.trim() || (needsOptions && !optionsFromLines(fieldOptions).length)}
          onPress={() => {
            const key = `${fieldLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)}_${draft.fields.length + 1}`;
            setDraft({ ...draft, fields: [...draft.fields, { key, type: fieldType, label: fieldLabel.trim(), essential: true, ...(needsOptions ? { options: optionsFromLines(fieldOptions) } : {}) }] });
            setFieldLabel('');
            setFieldOptions('');
          }}
        />
      </Card>
      {!draft.name.trim() && <Notice tone="muted">Give it a name to keep it.</Notice>}
      <Button label="Keep it for the coven" disabled={!draft.name.trim()} onPress={() => onSave(draft)} />
      <Button label="Cancel" variant="text" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
});
