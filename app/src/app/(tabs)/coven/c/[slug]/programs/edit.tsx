import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '../../../../../../components/altar/Sheet';
import { Button } from '../../../../../../components/Button';
import { CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Card, CheckRow, Chips, Field, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import {
  CALENDAR_TRADITIONS,
  CHECKED_BY,
  draftFromOutline,
  emptyStage,
  emptyTask,
  holidayName,
  kindLabel,
  PASSED_BY,
  PROGRAM_KINDS,
  programOutline,
  stagesPayload,
  TASK_KINDS,
  validateProgram,
  type DraftStage,
  type DraftTask,
  type ProgramKind,
} from '../../../../../../lib/covens/programs';
import { usePrograms, type ProgramData } from '../../../../../../lib/covens/usePrograms';
import { colors, radius, type } from '../../../../../../theme';

type Head = { kind: ProgramKind; title: string; summary: string; description: string; award_rank_id: string | null; self_enroll: boolean; template_id: string | null };

// The program editor: the program, its stages, and each stage's tasks (each
// opens in a sheet). ?id= edits a program; ?from= starts from a ready-made
// one; ?kind= starts a blank initiation or training.
export default function EditProgram() {
  const params = useLocalSearchParams<{ id?: string; from?: string; kind?: string }>();
  const { data, status } = usePrograms();
  const coven = useCoven();
  if (status === 'loading' || !coven.snapshot) {
    return (
      <CovenScreen title="Program" need="member">
        <ActivityIndicator color={colors.gold} style={styles.loading} />
      </CovenScreen>
    );
  }
  return <Editor key={`${params.id ?? ''}|${params.from ?? ''}|${params.kind ?? ''}`} data={data} id={params.id ?? null} from={params.from ?? null} kind={params.kind === 'training' ? 'training' : 'initiation'} />;
}

function start(data: ProgramData, id: string | null, from: string | null, kind: ProgramKind): { head: Head; stages: DraftStage[] } | null {
  if (id) {
    const p = data.programs.find((x) => x.id === id);
    if (!p) return null;
    return {
      head: { kind: p.kind, title: p.title, summary: p.summary ?? '', description: p.description ?? '', award_rank_id: p.award_rank_id, self_enroll: p.self_enroll, template_id: p.template_id },
      stages: draftFromOutline(programOutline(p.id, data.stages, data.tasks)),
    };
  }
  const tpl = from ? data.templates.find((t) => t.id === from) : null;
  if (tpl) {
    return {
      head: { kind: tpl.kind, title: tpl.title, summary: tpl.summary ?? '', description: tpl.description ?? '', award_rank_id: null, self_enroll: false, template_id: tpl.id },
      stages: JSON.parse(JSON.stringify(tpl.stages)) as DraftStage[],
    };
  }
  return { head: { kind, title: '', summary: '', description: '', award_rank_id: null, self_enroll: kind === 'training', template_id: null }, stages: [emptyStage()] };
}

function Editor({ data, id, from, kind }: { data: ProgramData; id: string | null; from: string | null; kind: ProgramKind }) {
  const coven = useCoven();
  const initial = start(data, id, from, kind);
  const [head, setHead] = useState<Head | null>(initial?.head ?? null);
  const [stages, setStages] = useState<DraftStage[]>(initial?.stages ?? []);
  const [openStage, setOpenStage] = useState(0);
  const [editing, setEditing] = useState<{ stage: number; task: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const ranks = coven.snapshot?.ranks ?? [];
  const head_ = head!;
  const canAward = coven.perms.manage || coven.perms.site;

  if (!coven.perms.programs) {
    return (
      <CovenScreen title="Program">
        <Text style={type.body}>Only those the coven’s head has chosen design its programs.</Text>
      </CovenScreen>
    );
  }
  if (!head) {
    return (
      <CovenScreen title="Program">
        <Text style={type.body}>That program was not found.</Text>
      </CovenScreen>
    );
  }

  const setStage = (i: number, next: Partial<DraftStage>) => setStages((list) => list.map((s, j) => (j === i ? { ...s, ...next } : s)));
  const setTask = (si: number, ti: number, next: Partial<DraftTask>) =>
    setStages((list) => list.map((s, j) => (j === si ? { ...s, tasks: s.tasks.map((t, k) => (k === ti ? { ...t, ...next } : t)) } : s)));
  const move = <T,>(list: T[], i: number, by: number) => {
    const to = i + by;
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    [next[i], next[to]] = [next[to], next[i]];
    return next;
  };

  const save = async (status: 'draft' | 'open') => {
    const errors = validateProgram({ title: head_.title, status }, stages);
    if (errors.length) return setMessage(errors.slice(0, 4).join(' '));
    setBusy(true);
    setMessage(null);
    try {
      const program: Record<string, unknown> = {
        kind: head_.kind,
        title: head_.title,
        summary: head_.summary,
        description: head_.description,
        self_enroll: head_.self_enroll,
        status,
        template_id: head_.template_id,
      };
      if (canAward) program.award_rank_id = head_.award_rank_id;
      await api.saveProgram(coven.snapshot!.coven.id, id, program, stagesPayload(stages));
      await coven.refreshPrograms();
      if (router.canGoBack()) router.back();
    } catch (e) {
      setMessage(errorMessage(e));
      setBusy(false);
    }
  };

  const task = editing ? stages[editing.stage]?.tasks[editing.task] : null;

  return (
    <CovenScreen title={id ? 'Edit the program' : 'A new program'}>
      {!!head_.template_id && !id && <Notice>Starting from a ready-made program. Change anything you like; it’s saved as a draft until you open it.</Notice>}
      <Chips label="Kind" options={PROGRAM_KINDS} value={head_.kind} onChange={(k) => setHead({ ...head_, kind: k })} />
      <Field label="Title" value={head_.title} onChangeText={(title) => setHead({ ...head_, title })} maxLength={120} />
      <Field label="In a line" value={head_.summary} onChangeText={(summary) => setHead({ ...head_, summary })} maxLength={500} />
      <Field label="About the program (what it is, who it’s for, how it works)" value={head_.description} onChangeText={(description) => setHead({ ...head_, description })} multiline maxLength={8000} />
      {canAward ? (
        <Chips
          label="Those who finish it become"
          options={[{ value: '', label: 'No change' }, ...ranks.map((r) => ({ value: r.id, label: r.name }))]}
          value={head_.award_rank_id ?? ''}
          onChange={(v) => setHead({ ...head_, award_rank_id: v || null })}
        />
      ) : (
        <Text style={type.caption}>Only the coven’s head chooses a position for those who finish a program.</Text>
      )}
      <CheckRow label="Any member may begin it themselves (otherwise only those you assign)" value={head_.self_enroll} onChange={(self_enroll) => setHead({ ...head_, self_enroll })} />

      {stages.map((s, si) => (
        <Card key={si}>
          <View style={styles.stageHead}>
            <Text style={[type.cardTitle, styles.flex]} onPress={() => setOpenStage(openStage === si ? -1 : si)}>
              Stage {si + 1}: {s.title || 'Untitled'}
            </Text>
            <Button label={openStage === si ? 'Close' : 'Open'} variant="text" onPress={() => setOpenStage(openStage === si ? -1 : si)} />
          </View>
          {openStage !== si && <Text style={type.caption}>{s.tasks.length} task{s.tasks.length === 1 ? '' : 's'}</Text>}
          {openStage === si && (
            <View style={styles.gap}>
              <Field label="Title" value={s.title} onChangeText={(title) => setStage(si, { title })} maxLength={120} />
              <Field label="What this stage is about" value={s.intro ?? ''} onChangeText={(intro) => setStage(si, { intro })} multiline maxLength={6000} />
              <Field
                label="Least time in the stage (days; a year and a day is 366)"
                value={s.min_days === null || s.min_days === undefined ? '' : String(s.min_days)}
                onChangeText={(v) => setStage(si, { min_days: v.replace(/[^0-9]/g, '') === '' ? null : Number(v.replace(/[^0-9]/g, '')) })}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Chips label="Who confirms it’s passed" options={PASSED_BY} value={s.passed_by} onChange={(passed_by) => setStage(si, { passed_by })} />
              <Section label="Tasks">
                <MenuList>
                  {s.tasks.map((t, ti) => (
                    <MenuRow
                      key={ti}
                      label={t.title || 'Untitled task'}
                      detail={[kindLabel(t.kind), t.times > 1 ? `${t.times} times` : '', CHECKED_BY.find((c) => c.value === t.checked_by)?.label, holidayName(t.holiday)].filter(Boolean).join(' · ')}
                      last={ti === s.tasks.length - 1}
                      onPress={() => setEditing({ stage: si, task: ti })}
                    />
                  ))}
                </MenuList>
                <Button
                  label="Add a task"
                  variant="outline"
                  onPress={() => {
                    setStage(si, { tasks: [...s.tasks, emptyTask()] });
                    setEditing({ stage: si, task: s.tasks.length });
                  }}
                />
              </Section>
              <View style={styles.row}>
                <Button label="Move up" variant="text" onPress={() => setStages((list) => move(list, si, -1))} />
                <Button label="Move down" variant="text" onPress={() => setStages((list) => move(list, si, 1))} />
                <Button label="Remove stage" variant="text" onPress={() => setStages((list) => list.filter((_, j) => j !== si))} />
              </View>
            </View>
          )}
        </Card>
      ))}
      <Button
        label="Add a stage"
        variant="outline"
        onPress={() => {
          setStages((list) => [...list, emptyStage()]);
          setOpenStage(stages.length);
        }}
      />
      <View style={styles.row}>
        <Button label={busy ? 'Saving…' : 'Save as draft'} onPress={() => void save('draft')} disabled={busy} />
        <Button label="Save and open" variant="outline" onPress={() => void save('open')} disabled={busy} />
      </View>
      {message && <Notice>{message}</Notice>}

      <Sheet visible={!!task} title={task?.title || 'A task'} onClose={() => setEditing(null)}>
        {task && editing && <TaskEditor task={task} onChange={(next) => setTask(editing.stage, editing.task, next)} onMove={(by) => {
          setStages((list) => list.map((s, j) => (j === editing.stage ? { ...s, tasks: move(s.tasks, editing.task, by) } : s)));
          setEditing({ ...editing, task: Math.max(0, Math.min(stages[editing.stage].tasks.length - 1, editing.task + by)) });
        }} onRemove={() => {
          setStages((list) => list.map((s, j) => (j === editing.stage ? { ...s, tasks: s.tasks.filter((_, k) => k !== editing.task) } : s)));
          setEditing(null);
        }} />}
      </Sheet>
    </CovenScreen>
  );
}

function TaskEditor({ task, onChange, onMove, onRemove }: { task: DraftTask; onChange: (next: Partial<DraftTask>) => void; onMove: (by: number) => void; onRemove: () => void }) {
  const coven = useCoven();
  const [allCalendars, setAllCalendars] = useState(false);
  const own = new Set(coven.snapshot?.coven.practice_traditions ?? []);
  const shown = CALENDAR_TRADITIONS.filter((t) => allCalendars || own.has(t.id) || task.holiday?.startsWith(`${t.id}/`));
  return (
    <View style={styles.gap}>
      <Field label="Title" value={task.title} onChangeText={(title) => onChange({ title })} maxLength={160} />
      <Chips label="Kind" options={TASK_KINDS} value={task.kind} onChange={(kind) => onChange({ kind })} />
      <Field label="Instructions" value={task.instructions ?? ''} onChangeText={(instructions) => onChange({ instructions })} multiline maxLength={8000} />
      <Field label="Resources (books, links, people to ask)" value={task.resources ?? ''} onChangeText={(resources) => onChange({ resources })} multiline maxLength={4000} />
      <Field label="Times to do it" value={String(task.times)} onChangeText={(v) => onChange({ times: Math.max(1, Math.min(400, Number(v.replace(/[^0-9]/g, '')) || 1)) })} keyboardType="number-pad" maxLength={3} />
      <Field
        label="About how long (minutes)"
        value={task.minutes === null || task.minutes === undefined ? '' : String(task.minutes)}
        onChangeText={(v) => onChange({ minutes: v.replace(/[^0-9]/g, '') === '' ? null : Number(v.replace(/[^0-9]/g, '')) })}
        keyboardType="number-pad"
        maxLength={4}
      />
      <Chips label="Signed off by" options={CHECKED_BY} value={task.checked_by} onChange={(checked_by) => onChange({ checked_by })} />
      <CheckRow label="They write a response (a reflection, an essay, notes)" value={task.response === 'text'} onChange={(v) => onChange({ response: v ? 'text' : 'none' })} />
      <CheckRow label="Optional (not needed to pass the stage)" value={!!task.optional} onChange={(optional) => onChange({ optional })} />
      <Text style={type.eyebrow}>Belongs to a holiday</Text>
      <Text style={type.caption}>{task.holiday ? holidayName(task.holiday) : 'None'}</Text>
      <View style={styles.holidays}>
        <Button label="None" variant={task.holiday ? 'pill' : 'primary'} onPress={() => onChange({ holiday: null })} />
        {shown.flatMap((t) =>
          t.holidays.map((h) => {
            const ref = `${t.id}/${h.id}`;
            return <Button key={ref} label={h.name} variant={task.holiday === ref ? 'primary' : 'pill'} onPress={() => onChange({ holiday: ref })} />;
          }),
        )}
      </View>
      {!allCalendars && <Button label={own.size ? 'Holidays from other calendars' : 'Choose from every calendar'} variant="text" onPress={() => setAllCalendars(true)} />}
      <View style={styles.row}>
        <Button label="Move up" variant="text" onPress={() => onMove(-1)} />
        <Button label="Move down" variant="text" onPress={() => onMove(1)} />
        <Button label="Remove task" variant="text" onPress={onRemove} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  flex: { flex: 1 },
  gap: { gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stageHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  holidays: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, borderRadius: radius.tile },
});
