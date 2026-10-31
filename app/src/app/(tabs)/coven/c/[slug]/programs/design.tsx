import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '../../../../../../components/altar/Sheet';
import { Button } from '../../../../../../components/Button';
import { covenHref, CovenScreen } from '../../../../../../components/covens/CovenScreen';
import { Pill, Pills } from '../../../../../../components/covens/ui';
import { Card, Chips, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import * as api from '../../../../../../lib/covens/api';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage } from '../../../../../../lib/covens/model';
import { alreadyCopied, awardLine, chooser, contentsLine, matchAwardRank, STEP_LABEL } from '../../../../../../lib/covens/courseCopy';
import { loadCourseCatalog, type CourseCatalog } from '../../../../../../lib/covens/courseCatalog';
import type { CourseProgram } from '../../../../../../lib/covens/courses/index';
import { assignmentLabel, mentorOf, programOutline, type Program } from '../../../../../../lib/covens/programs';
import { usePrograms } from '../../../../../../lib/covens/usePrograms';
import { colors, fonts, type } from '../../../../../../theme';

const STATUS: Record<Program['status'], string> = { draft: 'Draft', open: 'Open', archived: 'Archived' };

// Design and assign: the coven's programs, who goes through them, the
// ready-made programs to start from, and mentors.
export default function Design() {
  const coven = useCoven();
  const { data, status, error, changed } = usePrograms();
  const [message, setMessage] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<Program | null>(null);
  const [mentoring, setMentoring] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const ranks = coven.snapshot?.ranks ?? [];
  const rankName = (id: string) => ranks.find((r) => r.id === id)?.name ?? 'a position';
  const members = [...data.members].filter((m) => m.status === 'active').sort((a, b) => coven.nameOf(a.user_id).localeCompare(coven.nameOf(b.user_id)));
  // The courses hold every lesson: fetched from the website only here, when someone designs programs.
  const [course, setCourse] = useState<CourseCatalog | null>(null);
  const designing = coven.perms.programs;
  useEffect(() => {
    if (!designing) return;
    let live = true;
    loadCourseCatalog().then((catalog) => live && setCourse(catalog));
    return () => {
      live = false;
    };
  }, [designing]);
  // The coven's tradition (covenTradition.ts) puts its own course set first.
  const designFor = coven.snapshot?.coven.id;
  const [tradition, setTradition] = useState<string | null>(null);
  useEffect(() => {
    if (!designing || !designFor) return;
    let live = true;
    api.fetchCovenTradition(designFor).then((t) => live && setTradition(t));
    return () => {
      live = false;
    };
  }, [designing, designFor]);
  const choice = chooser(course?.programs ?? [], data.templates, coven.snapshot ? { ...coven.snapshot.coven, course_tradition: tradition } : null, course?.names ?? {});
  const suggested = choice.suggestedTemplates;
  const others = choice.otherTemplates;
  const [copying, setCopying] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, string>>({});
  const canAward = coven.perms.manage || coven.perms.site;
  const positionFor = (p: CourseProgram) => (p.id in positions ? positions[p.id] || null : matchAwardRank(p.award, ranks));

  /** Copy ready-made course programs into the coven as drafts, one after another. */
  const copy = async (list: CourseProgram[]) => {
    const covenId = coven.snapshot?.coven.id;
    if (!covenId) return;
    setMessage(null);
    const made: Program[] = [];
    try {
      for (const p of list) {
        setCopying(`Copying ${p.title}…`);
        made.push(await api.copyCourseProgram(covenId, p, canAward ? positionFor(p) : null, (done, of) => setCopying(`Copying ${p.title}: ${Math.round((done / of) * 100)}%`)));
      }
      await changed();
      setCopying(null);
      if (made.length === 1) router.push(`${covenHref(coven.slug, 'programs/edit')}?id=${made[0].id}` as never);
      else setMessage(`${made.length} programs copied as drafts. Look each one over, then open it.`);
    } catch (e) {
      setCopying(null);
      await changed();
      setMessage(`${made.length ? `${made.length} copied. ` : ''}${errorMessage(e)}`);
    }
  };

  const run = async (work: () => Promise<unknown>, done?: string | ((result: unknown) => string)) => {
    setMessage(null);
    try {
      const result = await work();
      await changed();
      if (done) setMessage(typeof done === 'function' ? done(result) : done);
    } catch (e) {
      setMessage(errorMessage(e));
    }
  };

  const setStatus = (p: Program, to: Program['status'] | 'deleted') => {
    if (to !== 'deleted') return void run(() => api.setProgramStatus(p.id, to));
    Alert.alert('Delete this program?', 'Everyone’s progress in it is deleted too. Archive it instead to keep the record.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void run(() => api.setProgramStatus(p.id, 'deleted')) },
    ]);
  };
  const edit = (query: string) => router.push(`${covenHref(coven.slug, 'programs/edit')}?${query}` as never);

  return (
    <CovenScreen title="Design and assign" onRefresh={changed}>
      {!coven.perms.programs && <Text style={type.body}>Only those the coven’s head has chosen design and assign its programs.</Text>}
      {status === 'loading' && <ActivityIndicator color={colors.gold} style={styles.loading} />}
      {status === 'error' && <Notice>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      {coven.perms.programs && status === 'ready' && (
        <>
          <Section label="The coven’s programs">
            {!data.programs.length && <Text style={type.caption}>No programs yet. Start from a ready-made one or make your own.</Text>}
            {data.programs.map((p) => {
              const stages = programOutline(p.id, data.stages, data.tasks);
              const assigned = data.assignments.filter((a) => a.program_id === p.id);
              const enrolled = data.enrollments.filter((e) => e.program_id === p.id && e.status !== 'withdrawn').length;
              return (
                <Card key={p.id}>
                  <Pills>
                    <Pill label={p.kind === 'initiation' ? 'Initiation' : 'Training'} />
                    <Pill label={STATUS[p.status]} tone={p.status === 'open' ? 'gold' : undefined} />
                    {p.self_enroll && <Pill label="Anyone may begin it" />}
                    {!!p.award_rank_id && <Pill label={`Leads to ${rankName(p.award_rank_id)}`} />}
                  </Pills>
                  <Text style={type.cardTitle}>{p.title}</Text>
                  <Text style={type.caption}>
                    {stages.length} stage{stages.length === 1 ? '' : 's'} · {stages.reduce((n, s) => n + s.tasks.length, 0)} tasks · {enrolled} {enrolled === 1 ? 'person' : 'people'} in it
                  </Text>
                  {assigned.map((a) => (
                    <View key={a.id} style={styles.assigned}>
                      <Text style={[type.body, styles.flex]}>{assignmentLabel(a, rankName, coven.nameOf)}</Text>
                      <Button label="Stop" variant="text" onPress={() => void run(() => api.unassignProgram(a.id))} />
                    </View>
                  ))}
                  <View style={styles.row}>
                    {p.status === 'open' && <Button label="Assign" onPress={() => setAssigning(p)} />}
                    <Button label="Edit" variant="outline" onPress={() => edit(`id=${p.id}`)} />
                    {p.status !== 'open' ? <Button label="Open it" variant="outline" onPress={() => setStatus(p, 'open')} /> : <Button label="Back to draft" variant="outline" onPress={() => setStatus(p, 'draft')} />}
                    {p.status !== 'archived' && <Button label="Archive" variant="text" onPress={() => setStatus(p, 'archived')} />}
                    <Button label="Delete" variant="text" onPress={() => setStatus(p, 'deleted')} />
                  </View>
                </Card>
              );
            })}
          </Section>

          <Section label="Start a program">
            <View style={styles.row}>
              <Button label="✦ Make your own initiation" onPress={() => edit('kind=initiation')} />
              <Button label="Make your own training" variant="outline" onPress={() => edit('kind=training')} />
            </View>
            {copying && <Notice>{copying}</Notice>}
            {!course && <ActivityIndicator color={colors.gold} />}
            {course && !course.programs.length && <Text style={type.caption}>The ready-made course programs couldn’t be fetched just now. Check your connection, or use the ones below.</Text>}
            {choice.paths.map((path) => (
              <Card key={path.tradition}>
                <Pills>
                  <Pill label={path.suggested ? 'Your coven’s calendar' : 'Ready-made'} tone={path.suggested ? 'gold' : undefined} />
                </Pills>
                <Text style={type.cardTitle}>{path.name}: the whole path</Text>
                <Text style={type.caption}>{course?.label}. Each program teaches with lessons, practice to log, and a test, and has a conversation on every step.</Text>
                {path.programs.map((p) => {
                  const done = alreadyCopied(data.programs, p.id);
                  const position = positionFor(p);
                  return (
                    <View key={p.id} style={styles.course}>
                      <Text style={type.eyebrow}>{STEP_LABEL[p.path]}</Text>
                      <Text style={styles.courseTitle}>{p.title.replace(`${path.name}: `, '')}</Text>
                      <Text style={type.body}>{p.summary}</Text>
                      <Text style={type.caption}>
                        {contentsLine(p)} · {p.id in positions ? (position ? `Raises those who finish it to ${rankName(position)}.` : 'Doesn’t change anyone’s position.') : awardLine(p.award, ranks, p.awardLabel)}
                        {done ? ' · already in the coven' : ''}
                      </Text>
                      {p.missing.length > 0 && <Text style={type.caption}>Still being written: {p.missing.length} part{p.missing.length === 1 ? '' : 's'}. What’s ready is copied now.</Text>}
                      {canAward && !!p.award && (
                        <Chips
                          label="Raises those who finish it to"
                          options={[{ value: '', label: 'No change' }, ...ranks.map((r) => ({ value: r.id, label: r.name }))]}
                          value={position ?? ''}
                          onChange={(v) => setPositions((all) => ({ ...all, [p.id]: v }))}
                        />
                      )}
                      <Button label={done ? 'Copy it again' : 'Use this'} variant="outline" onPress={() => void copy([p])} disabled={!!copying} />
                    </View>
                  );
                })}
                {path.programs.length > 1 && (
                  <Button label={`Use all ${path.programs.length === 5 ? 'five' : path.programs.length}`} onPress={() => void copy(path.programs)} disabled={!!copying} />
                )}
                {!canAward && <Text style={type.caption}>The coven’s head chooses the position each program raises people to.</Text>}
              </Card>
            ))}
            {!course ? null : suggested.length > 0 ? (
              <>
                <Text style={type.eyebrow}>Suggested for your coven’s calendar</Text>
                <MenuList>
                  {suggested.map((t, i) => (
                    <MenuRow key={t.id} label={t.title} detail={t.summary ?? ''} last={i === suggested.length - 1} onPress={() => edit(`from=${encodeURIComponent(t.id)}`)} />
                  ))}
                </MenuList>
              </>
            ) : (
              !choice.paths.some((p) => p.suggested) && <Text style={type.caption}>Choose the coven’s practice calendar under Manage to see the ready-made programs for it first.</Text>
            )}
            <Button label={showAll ? 'Hide the other ready-made programs' : suggested.length ? 'Ready-made for other calendars' : 'More ready-made programs'} variant="text" onPress={() => setShowAll((v) => !v)} />
            {showAll && (
              <MenuList>
                {others.map((t, i) => (
                  <MenuRow key={t.id} label={t.title} detail={t.summary ?? ''} last={i === others.length - 1} onPress={() => edit(`from=${encodeURIComponent(t.id)}`)} />
                ))}
              </MenuList>
            )}
          </Section>

          <Section label="Mentors">
            <Text style={type.caption}>A mentor sees their mentee’s progress and signs off the tasks and stages left to mentors.</Text>
            <MenuList>
              {members.map((m, i) => {
                const mentor = mentorOf(coven.mentors, m.user_id);
                return (
                  <MenuRow key={m.user_id} label={coven.nameOf(m.user_id)} detail={mentor ? `Mentor: ${coven.nameOf(mentor)}` : 'No mentor'} last={i === members.length - 1} onPress={() => setMentoring(m.user_id)} />
                );
              })}
            </MenuList>
          </Section>
        </>
      )}

      <Sheet visible={!!assigning} title={assigning ? `Assign ${assigning.title}` : ''} onClose={() => setAssigning(null)}>
        <Text style={type.caption}>Assigning a position enrolls everyone in it now, and anyone who takes it later.</Text>
        <MenuList>
          {ranks.map((r) => (
            <MenuRow
              key={r.id}
              label={`Everyone who is ${r.name}`}
              onPress={() => {
                const p = assigning!;
                setAssigning(null);
                void run(() => api.assignProgram(p.id, null, r.id), (n) => `Assigned. ${n} ${n === 1 ? 'person' : 'people'} enrolled now.`);
              }}
            />
          ))}
          {members.map((m, i) => (
            <MenuRow
              key={m.user_id}
              label={coven.nameOf(m.user_id)}
              last={i === members.length - 1}
              onPress={() => {
                const p = assigning!;
                setAssigning(null);
                void run(() => api.assignProgram(p.id, m.user_id, null), (n) => (n ? 'Assigned and enrolled.' : 'Assigned.'));
              }}
            />
          ))}
        </MenuList>
      </Sheet>

      <Sheet visible={!!mentoring} title={mentoring ? `A mentor for ${coven.nameOf(mentoring)}` : ''} onClose={() => setMentoring(null)}>
        <MenuList>
          <MenuRow
            label="No mentor"
            onPress={() => {
              const who = mentoring!;
              setMentoring(null);
              void run(async () => {
                await api.setMentor(coven.snapshot!.coven.id, who, null);
                coven.setMentors(await api.fetchMentors(coven.snapshot!.coven.id));
              }, 'Saved.');
            }}
          />
          {members
            .filter((m) => m.user_id !== mentoring)
            .map((m, i, list) => (
              <MenuRow
                key={m.user_id}
                label={coven.nameOf(m.user_id)}
                detail={mentorOf(coven.mentors, mentoring) === m.user_id ? 'Their mentor now' : undefined}
                last={i === list.length - 1}
                onPress={() => {
                  const who = mentoring!;
                  setMentoring(null);
                  void run(async () => {
                    await api.setMentor(coven.snapshot!.coven.id, who, m.user_id);
                    coven.setMentors(await api.fetchMentors(coven.snapshot!.coven.id));
                  }, 'Saved.');
                }}
              />
            ))}
        </MenuList>
      </Sheet>
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 20 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assigned: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flex: { flex: 1 },
  course: { gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline, paddingTop: 10 },
  courseTitle: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.cream },
});
