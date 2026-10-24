// One coven's initiation and training: its programs with their stages and
// tasks, who is in them and how far they've come, and (for those who manage
// them) assignments, members and the ready-made programs. Row-level security
// decides what this person sees: their own progress, their mentees', or
// everyone's for those allowed.

import { useCallback, useEffect, useState } from 'react';

import * as api from './api';
import { useCoven } from './CovenContext';
import { errorMessage, type Member } from './model';
import type { Assignment, Enrollment, Program, ProgramStage, ProgramTask, ProgramTemplate, StagePass, TaskProgress } from './programs';

export type ProgramData = {
  programs: Program[];
  stages: ProgramStage[];
  tasks: ProgramTask[];
  assignments: Assignment[];
  enrollments: Enrollment[];
  progress: TaskProgress[];
  passes: StagePass[];
  members: Member[];
  templates: ProgramTemplate[];
};

const EMPTY: ProgramData = { programs: [], stages: [], tasks: [], assignments: [], enrollments: [], progress: [], passes: [], members: [], templates: [] };

export function usePrograms() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { perms, loadNames, refreshPrograms } = coven;
  const [data, setData] = useState<ProgramData>(EMPTY);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const wide = perms.programs || perms.progress;

  const reload = useCallback(async () => {
    if (!covenId) return;
    try {
      const [programs, assignments, enrollments, progress, passes, members, templates] = await Promise.all([
        api.fetchPrograms(covenId),
        api.fetchAssignments(covenId).catch(() => [] as Assignment[]),
        api.fetchEnrollments(covenId).catch(() => [] as Enrollment[]),
        api.fetchProgress(covenId).catch(() => [] as TaskProgress[]),
        api.fetchStagePasses(covenId).catch(() => [] as StagePass[]),
        wide ? api.fetchMembers(covenId).catch(() => [] as Member[]) : Promise.resolve([] as Member[]),
        perms.programs ? api.fetchProgramTemplates().catch(() => [] as ProgramTemplate[]) : Promise.resolve([] as ProgramTemplate[]),
      ]);
      const parts = await api.fetchProgramParts(programs.map((p) => p.id));
      setData({ programs, ...parts, assignments, enrollments, progress, passes, members, templates });
      setStatus('ready');
      void loadNames([...enrollments.map((e) => e.user_id), ...members.map((m) => m.user_id), ...progress.map((p) => p.checked_by), ...passes.map((p) => p.passed_by)]);
    } catch (e) {
      setError(errorMessage(e));
      setStatus('error');
    }
  }, [covenId, wide, perms.programs, loadNames]);

  useEffect(() => {
    void reload();
  }, [reload]);

  /** Reload after a change, and the coven's count of work waiting for sign-off. */
  const changed = useCallback(async () => {
    await Promise.all([reload(), refreshPrograms()]);
  }, [reload, refreshPrograms]);

  return { data, status, error, reload, changed };
}
