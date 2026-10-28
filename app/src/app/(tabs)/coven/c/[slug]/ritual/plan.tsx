import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { CovenScreen, covenHref } from '../../../../../../components/covens/CovenScreen';
import { Outline } from '../../../../../../components/covens/builder/Outline';
import { AfterwardsPanel, ChecklistPanel, CustomActionForm, MeetingPanel, RolesPanel, SectionsPanel } from '../../../../../../components/covens/builder/Panels';
import { ScriptView } from '../../../../../../components/covens/builder/ScriptView';
import { StepFocus } from '../../../../../../components/covens/builder/StepFocus';
import { NoticeWho } from '../../../../../../components/covens/NoticeWho';
import { Card, Chips, Field, MenuList, MenuRow, Notice, Section } from '../../../../../../components/more/ui';
import { itemIndex, itemSuggestions } from '../../../../../../lib/altar/itemIndex';
import { useAltars } from '../../../../../../lib/altar/store';
import * as api from '../../../../../../lib/covens/api';
import {
  blankBuilderStep,
  blankPlan,
  builderPayload,
  builderProblem,
  builderStepFrom,
  builderWarnings,
  cleanCustomAction,
  cleanPlan,
  defaultSectionFor,
  freshSteps,
  GATHERING_KINDS,
  insertStep,
  libraryStep,
  moveStep,
  namedThings,
  orderBySections,
  roleEntries,
  ritualPayload,
  shortId,
  specsOf,
  stepsFromLibrary,
  whoLabel as whoLabelOf,
  withFieldColumns,
  type BuilderStep,
  type CustomAction,
  type GatheringKind,
  type RitualPlan,
} from '../../../../../../lib/covens/builder';
import { useCoven } from '../../../../../../lib/covens/CovenContext';
import { errorMessage, OCCASIONS, orderSteps, type BookPage, type Petition } from '../../../../../../lib/covens/model';
import { noticeLabelOptions, type NoticeRule } from '../../../../../../lib/covens/notices';
import { assigneesLabel, cleanAssignees, whoEntries, whoSuggestions, type Assignee } from '../../../../../../lib/covens/picker';
import { fetchMeetingDefaults } from '../../../../../../lib/covens/meetingApi';
import { historyKeys, historyLabel } from '../../../../../../lib/covens/meetings';
import { fromFields, occasionSuggestions, stepsFromTemplate, suggestionTime, toFields, unassignablePart, type Candidate } from '../../../../../../lib/covens/planner';
import { covenHolidaysBetween } from '../../../../../../lib/covens/programs';
import { buildScript } from '../../../../../../lib/covens/script';
import { draftFromTemplate, RITUAL_TEMPLATES } from '../../../../../../lib/covens/templates';
import { confirmAction } from '../../../../../../lib/grimoire/confirm';
import { useRituals } from '../../../../../../lib/rituals/store';
import { colors, radius, type } from '../../../../../../theme';

const NO_OCCASION = { value: '', label: 'None' } as const;

type View_ = 'start' | 'outline' | 'details' | 'roles' | 'sections' | 'prep' | 'after' | 'preview' | 'action' | 'meeting' | { step: string };

// The coven ritual builder (lib/covens/builder.ts), as on the website
// (covens/coven/builder.js). A gathering, a rite or a meeting, starts from a
// ready-made template, a copy of one of the coven's rituals, one of the
// coven's own templates, or nothing, and is shown as an OUTLINE: its sections
// with one-line step cards. Each step opens on its own (components/covens/
// builder/StepFocus.tsx); roles, the checklist for before, what happens
// afterwards, and the sections themselves each have their own panel. The
// preview reads the whole script, or the run-through for you.
// For those who lead the coven's rituals; putting rites on the calendar is
// for those the coven's head allows.
export default function PlanRitual() {
  const { id, kind: kindParam } = useLocalSearchParams<{ id?: string; kind?: string }>();
  const coven = useCoven();
  const ritual = id ? coven.rituals.find((r) => r.id === id) ?? null : null;
  const covenId = coven.snapshot?.coven.id;
  const ranks = useMemo(() => [...(coven.snapshot?.ranks ?? [])].sort((a, b) => b.level - a.level), [coven.snapshot?.ranks]);
  const canLead = (coven.perms.lead && coven.standing.ok) || coven.perms.site;
  const canSchedule = coven.perms.schedule || coven.perms.site;
  const keepsSchedule = ritual?.status === 'scheduled';
  const { templates: ownRituals } = useRituals();

  const initialKind: GatheringKind = ritual ? (ritual.kind === 'meeting' ? 'meeting' : 'rite') : kindParam === 'meeting' ? 'meeting' : 'rite';
  // A meeting kept to some (meetings.ts): none is the whole coven.
  const [audience, setAudience] = useState<Assignee[]>(() => cleanAssignees(ritual?.audience));
  const [chatDefaults, setChatDefaults] = useState<string[] | null>(null);
  const [kind, setKind] = useState<GatheringKind>(initialKind);
  const [plan, setPlan] = useState<RitualPlan>(() => cleanPlan(ritual?.plan, initialKind));
  const [steps, setSteps] = useState<BuilderStep[]>(() => (ritual ? orderBySections(orderSteps(coven.steps, ritual.id).map((s) => builderStepFrom(s, cleanPlan(ritual.plan, initialKind))), cleanPlan(ritual.plan, initialKind).sections) : []));
  const [title, setTitle] = useState(ritual?.title ?? '');
  const [intention, setIntention] = useState(ritual?.intention ?? '');
  const [description, setDescription] = useState(ritual?.description ?? '');
  const [occasion, setOccasion] = useState<string>(ritual?.occasion ?? '');
  const [occasionName, setOccasionName] = useState(ritual?.occasion_name ?? '');
  const [date, setDate] = useState(toFields(ritual?.scheduled_for).date);
  const [time, setTime] = useState(toFields(ritual?.scheduled_for).time);
  const [view, setView] = useState<View_>(ritual ? 'outline' : 'start');
  const [people, setPeople] = useState<Candidate[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [library, setLibrary] = useState<api.LibraryRow[]>([]);
  const [tidying, setTidying] = useState(false);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [previewMode, setPreviewMode] = useState<'script' | 'run'>('script');
  const [rules, setRules] = useState<NoticeRule[]>([]);
  const [actionDraft, setActionDraft] = useState<{ name: string; section?: string; directions: string; words: string; minutes: number | null; fields: CustomAction['fields'] } | null>(null);
  const altars = useAltars();

  const loadLibrary = useCallback(async () => {
    if (covenId) setLibrary(await api.fetchLibrary(covenId));
  }, [covenId]);
  useEffect(() => {
    if (!covenId) return;
    void api.fetchLibrary(covenId).then(setLibrary);
    api.fetchBookPages(covenId).then(setPages).catch(() => setPages([]));
    api.fetchPetitions(covenId).then(setPetitions).catch(() => setPetitions([]));
    void fetchMeetingDefaults(covenId).then(setChatDefaults);
    void api.fetchNoticeRules(covenId).then(setRules);
  }, [covenId]);
  useEffect(() => {
    if (!covenId) return;
    api
      .ritualPeople(covenId)
      .then(async (list) => {
        await coven.loadNames(list.map((p) => p.user_id));
        setPeople(list.map((p) => ({ id: p.user_id, name: '', eligible: !!p.eligible })));
      })
      .catch(() => setPeople([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per coven
  }, [covenId]);

  const custom = useMemo(() => library.filter((l) => l.kind === 'action').map((l) => cleanCustomAction(l.id, l.body)).filter((a): a is CustomAction => !!a), [library]);
  const blocks = useMemo(() => library.filter((l) => l.kind === 'block'), [library]);
  const savedTemplates = useMemo(() => library.filter((l) => l.kind === 'template'), [library]);
  const itemList = useMemo(
    () => itemIndex({ own: altars.customItems.filter((item) => item.forms.some((f) => /^https:/.test(f.image))), overrides: altars.overrides, petitions: petitions.filter((p) => p.status === 'open') }),
    [altars.customItems, altars.overrides, petitions],
  );
  const suggestItems = useCallback((queries?: string[]) => itemSuggestions(itemList, queries), [itemList]);
  const named = useMemo(() => (people ?? []).map((p) => ({ ...p, name: coven.nameOf(p.id) })).sort((a, b) => a.name.localeCompare(b.name)), [people, coven]);
  const who = useMemo(() => [...roleEntries(plan.roles), ...whoEntries(ranks, named)], [plan.roles, ranks, named]);
  const whoSuggest = useMemo(() => [...plan.roles.map((r) => `role:${r.id}`), ...whoSuggestions(whoEntries(ranks, named))], [plan.roles, ranks, named]);
  const ctx = useMemo(() => ({ roles: plan.roles, ranks, nameOf: coven.nameOf }), [plan.roles, ranks, coven.nameOf]);
  const whoLabel = useCallback((key: string) => whoLabelOf(key, ctx), [ctx]);
  const suggestions = useMemo(() => {
    const from = new Date();
    return occasionSuggestions(from, 6, covenHolidaysBetween(coven.snapshot?.coven ?? null, from, new Date(from.getTime() + 200 * 86400000)));
  }, [coven.snapshot?.coven]);
  const ordered = useMemo(() => orderBySections(steps, plan.sections), [steps, plan.sections]);
  const labelOptions = useMemo(() => noticeLabelOptions(RITUAL_TEMPLATES, coven.rituals), [coven.rituals]);
  const problems = useMemo(() => {
    const out: Record<string, string> = {};
    for (const s of ordered) {
      const blocked = unassignablePart(withFieldColumns(s, plan, custom), named, coven.nameOf);
      if (blocked) out[s.key] = blocked;
    }
    return out;
  }, [ordered, plan, custom, named, coven.nameOf]);

  // Inside a step or panel, Back (the arrow, Android's back, a swipe) goes
  // to the outline rather than out of the planner.
  const inner = view !== 'start' && view !== 'outline';
  const toOutline = useCallback(() => {
    setView('outline');
    setMessage(null);
  }, []);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !inner });
    if (!inner) return;
    return navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      toOutline();
    });
  }, [navigation, inner, toOutline]);
  // Each view (the outline, a step, roles…) opens at its top, and the outline comes back where you left it.
  const scrollKey = typeof view === 'object' ? `step:${view.step}` : view;
  const backTo = inner ? { onBack: toOutline, backLabel: 'Back to the outline', scrollKey } : { scrollKey };

  if (!canLead) {
    return (
      <CovenScreen title="Plan a gathering" {...backTo}>
        <Text style={type.body}>Only those who lead the coven’s rituals plan them. The coven’s head decides who does.</Text>
      </CovenScreen>
    );
  }
  if (ritual?.status === 'live') {
    return (
      <CovenScreen title="Edit the ritual" {...backTo}>
        <Text style={type.body}>This ritual is under way. End it before changing it.</Text>
      </CovenScreen>
    );
  }

  const change = (key: string, patch: Partial<BuilderStep>) => setSteps((list) => list.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const addStep = (section: string) => {
    const step = blankBuilderStep(section);
    setSteps((list) => insertStep(plan, list, step, section));
    setView({ step: step.key });
  };
  const begin = (next: { kind: GatheringKind; plan: RitualPlan; steps: BuilderStep[]; title?: string; intention?: string; description?: string; occasion?: string; occasionName?: string }) => {
    setKind(next.kind);
    setPlan(next.plan);
    setSteps(orderBySections(next.steps, next.plan.sections));
    if (next.title !== undefined) setTitle(next.title);
    if (next.intention) setIntention(next.intention);
    if (next.description) setDescription(next.description);
    if (next.occasion !== undefined) setOccasion(next.occasion);
    if (next.occasionName !== undefined) setOccasionName(next.occasionName);
    setView('outline');
  };
  const keep = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await work();
      await loadLibrary();
      setMessage(done);
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };
  const removeKept = async (row: api.LibraryRow) => {
    const what = row.kind === 'template' ? 'template' : row.kind === 'block' ? 'block' : 'action';
    if (!(await confirmAction(`Remove “${row.title}”?`, `This takes the ${what} out of the coven’s library. Gatherings already planned from it stay as they are.`, 'Remove'))) return;
    void keep(() => api.removeLibrary(row.id), `“${row.title}” is removed.`);
  };
  const saveBlock = (list: BuilderStep[], name: string) => covenId && void keep(() => api.saveLibrary(covenId, null, 'block', name, { steps: list.map(libraryStep) }), `“${name}” is kept with the coven’s blocks.`);

  const save = async (as: 'draft' | 'scheduled') => {
    if (!covenId) return;
    const when = fromFields(date, time);
    if (when instanceof Error) return setMessage(when.message);
    const problem = builderProblem(title, plan, steps, named, coven.nameOf, custom);
    if (problem) return setMessage(problem);
    setBusy(true);
    setMessage(null);
    try {
      const saved = await api.saveRitual(
        covenId,
        ritual?.id ?? null,
        ritualPayload({ title, intention, description, scheduled_for: when, status: as, occasion, occasion_name: occasionName }, kind, plan, kind === 'meeting' ? audience : undefined),
        builderPayload(plan, steps, custom) as unknown as Record<string, unknown>[],
      );
      await coven.refreshRituals();
      router.replace(covenHref(coven.slug, `ritual/${saved.id}`));
    } catch (error) {
      setMessage(errorMessage(error));
    }
    setBusy(false);
  };

  const back = <Button label="← Back to the outline" variant="outline" onPress={toOutline} />;
  // Who hears about it (components/covens/NoticeWho.tsx): a rite's Details, a meeting's panel.
  const noticeCard = (
    <NoticeWho
      plan={plan}
      kind={kind}
      occasion={occasion}
      occasionName={occasionName}
      audience={kind === 'meeting' ? audience : undefined}
      rules={rules}
      words={{ ranks, nameOf: coven.nameOf }}
      names={labelOptions.names}
      series={labelOptions.series}
      who={who}
      whoSuggest={whoSuggest}
      canChoose={coven.perms.notices || coven.perms.site}
      onChange={(notify) =>
        setPlan((p) => {
          const next = { ...p };
          if (notify) next.notify = notify;
          else delete next.notify;
          return next;
        })
      }
    />
  );
  const screenTitle = ritual ? `Edit ${kind === 'meeting' ? 'the meeting' : 'the rite'}` : kind === 'meeting' ? 'Plan a meeting' : 'Plan a rite';

  // ── Start from ──────────────────────────────────────────────────────────
  if (view === 'start') {
    const ready = RITUAL_TEMPLATES.filter((t) => t.kind === kind);
    const copies = coven.rituals.filter((r) => (r.kind ?? 'rite') === kind).slice(0, 12);
    return (
      <CovenScreen title="Plan a gathering" {...backTo}>
        <Chips label="What kind of gathering" options={GATHERING_KINDS} value={kind} onChange={(k) => { setKind(k); setPlan(blankPlan(k)); }} />
        <Text style={type.caption}>{GATHERING_KINDS.find((k) => k.value === kind)?.detail}</Text>
        <Button label={kind === 'meeting' ? 'Start with an empty agenda' : 'Start with an empty outline'} variant="outline" onPress={() => begin({ kind, plan: blankPlan(kind), steps: [] })} />
        <Section label="Ready-made">
          <MenuList>
            {ready.map((t, i) => (
              <MenuRow key={t.id} label={t.name} detail={`${t.tradition} · ${t.summary}`} last={i === ready.length - 1} onPress={() => begin(draftFromTemplate(t))} />
            ))}
          </MenuList>
        </Section>
        {savedTemplates.length > 0 && (
          <Section label="The coven’s own templates">
            <MenuList>
              {savedTemplates.map((t, i) => {
                const body = t.body as { kind?: GatheringKind; plan?: unknown; steps?: unknown; intention?: string; description?: string; occasion?: string; occasion_name?: string };
                return (
                  <MenuRow
                    key={t.id}
                    label={t.title}
                    last={i === savedTemplates.length - 1}
                    onPress={() => {
                      const k = body.kind === 'meeting' ? 'meeting' : 'rite';
                      const p = cleanPlan(body.plan, k);
                      begin({ kind: k, plan: p, steps: stepsFromLibrary(body.steps, p), title: t.title, intention: body.intention, description: body.description, occasion: body.occasion ?? '', occasionName: body.occasion_name ?? '' });
                    }}
                  />
                );
              })}
            </MenuList>
          </Section>
        )}
        {copies.length > 0 && (
          <Section label="A copy of one of the coven’s">
            <MenuList>
              {copies.map((r, i) => (
                <MenuRow
                  key={r.id}
                  label={r.title}
                  last={i === copies.length - 1}
                  onPress={() => {
                    const k = r.kind === 'meeting' ? 'meeting' : 'rite';
                    const p = cleanPlan(r.plan, k);
                    begin({ kind: k, plan: p, steps: freshSteps(orderSteps(coven.steps, r.id).map((s) => builderStepFrom(s, p))), title: r.title, intention: r.intention ?? '', description: r.description ?? '', occasion: r.occasion ?? '', occasionName: r.occasion_name ?? '' });
                  }}
                />
              ))}
            </MenuList>
          </Section>
        )}
        {ownRituals.length > 0 && (
          <Section label="One of your own rituals">
            <MenuList>
              {ownRituals.slice(0, 12).map((t, i) => (
                <MenuRow
                  key={t.id}
                  label={t.title}
                  last={i === Math.min(ownRituals.length, 12) - 1}
                  onPress={() => {
                    const p = blankPlan(kind);
                    const work = defaultSectionFor('', p.sections);
                    begin({ kind, plan: p, steps: stepsFromTemplate(t.ritual_template_steps ?? []).map((s) => ({ ...blankBuilderStep(work), ...s, key: shortId('k') })), title: t.title, intention: t.intention ?? '' });
                  }}
                />
              ))}
            </MenuList>
          </Section>
        )}
        {library.length > 0 && (
          <Section label="The coven’s library">
            <Button
              label={tidying ? 'Done tidying' : 'Remove saved templates, blocks or actions'}
              variant="outline"
              onPress={() => setTidying((t) => !t)}
            />
            {tidying && (
              <MenuList>
                {library.map((row) => (
                  <View key={row.id} style={[styles.row, styles.tidyRow]}>
                    <View style={styles.grow}>
                      <Text style={type.body}>{row.title}</Text>
                      <Text style={type.caption}>{row.kind === 'template' ? 'Template' : row.kind === 'block' ? 'Block of steps' : 'Action'}</Text>
                    </View>
                    <Button label="Remove" variant="text" disabled={busy} onPress={() => void removeKept(row)} />
                  </View>
                ))}
              </MenuList>
            )}
            {message && <Notice>{message}</Notice>}
          </Section>
        )}
      </CovenScreen>
    );
  }

  // ── One step ────────────────────────────────────────────────────────────
  if (typeof view === 'object') {
    const index = ordered.findIndex((s) => s.key === view.step);
    const step = ordered[index];
    if (!step) return <CovenScreen title="A step" {...backTo}>{back}</CovenScreen>;
    return (
      <CovenScreen title={step.title.trim() || 'A new step'} {...backTo}>
        {back}
        <StepFocus
          key={step.key}
          step={step}
          number={index + 1}
          plan={plan}
          onChange={(patch) => change(step.key, patch)}
          onDone={() => setView('outline')}
          onRemove={() => {
            setSteps((list) => list.filter((s) => s.key !== step.key));
            setView('outline');
          }}
          onDuplicate={() => {
            const copy = { ...step, id: null, key: shortId('k') };
            setSteps((list) => insertStep(plan, list, copy, step.section, step.key));
            setView({ step: copy.key });
          }}
          onSaveBlock={() => saveBlock([step], step.title.trim() || 'A step')}
          onMakeAction={() => {
            setActionDraft({ name: step.title, section: step.section, directions: step.instructions, words: step.spoken_text, minutes: step.duration_minutes, fields: specsOf(step, custom) });
            setView('action');
          }}
          onPickBlock={(blockId) => {
            const block = blocks.find((b) => b.id === blockId);
            if (!block) return;
            const added = stepsFromLibrary((block.body as { steps?: unknown }).steps, plan, step.section);
            setSteps((list) => {
              let next = list;
              let after = step.key;
              for (const s of added) {
                next = insertStep(plan, next, s, step.section, after);
                after = s.key;
              }
              return next.filter((s) => s.key !== step.key);
            });
            setView('outline');
          }}
          who={who}
          whoSuggest={whoSuggest}
          whoLabel={whoLabel}
          items={itemList}
          itemSuggest={suggestItems}
          custom={custom}
          blocks={blocks.map((b) => ({ id: b.id, title: b.title }))}
          named={namedThings(ordered, custom, index)}
          pages={pages}
          blocked={problems[step.key] ?? ''}
          kind={kind}
        />
        {message && <Notice>{message}</Notice>}
      </CovenScreen>
    );
  }

  const setFromPanel = (next: { plan: RitualPlan; steps?: BuilderStep[] }) => {
    setPlan(next.plan);
    if (next.steps) setSteps(next.steps);
  };

  if (view === 'roles')
    return (
      <CovenScreen title="Roles" {...backTo}>
        {back}
        <RolesPanel plan={plan} steps={steps} kind={kind} who={who} whoSuggest={whoSuggest} whoLabel={whoLabel} onChange={setFromPanel} />
      </CovenScreen>
    );
  if (view === 'sections')
    return (
      <CovenScreen title="Sections" {...backTo}>
        {back}
        <SectionsPanel plan={plan} steps={steps} onChange={setFromPanel} onSaveBlock={(sectionId) => saveBlock(ordered.filter((s) => s.section === sectionId), plan.sections.find((s) => s.id === sectionId)?.name ?? 'Steps')} />
        {message && <Notice>{message}</Notice>}
      </CovenScreen>
    );
  if (view === 'prep')
    return (
      <CovenScreen title="Before the rite" {...backTo}>
        {back}
        <ChecklistPanel plan={plan} onChange={setFromPanel} />
      </CovenScreen>
    );
  if (view === 'after')
    return (
      <CovenScreen title="Afterwards" {...backTo}>
        {back}
        <AfterwardsPanel plan={plan} kind={kind} onChange={setFromPanel} />
      </CovenScreen>
    );
  if (view === 'meeting')
    return (
      <CovenScreen title="How the meeting runs" scrollKey={scrollKey}>
        {back}
        <MeetingPanel
          plan={plan}
          audience={audience}
          onAudience={setAudience}
          who={who}
          whoSuggest={whoSuggest}
          whoLabel={whoLabel}
          historyLine={historyLabel(historyKeys(ritual?.chat_readers, chatDefaults), plan, ranks, coven.nameOf).replace(/^./, (c) => c.toLowerCase())}
          onChange={setFromPanel}
        />
        {noticeCard}
      </CovenScreen>
    );
  if (view === 'action' && actionDraft)
    return (
      <CovenScreen title="One of the coven’s own" {...backTo}>
        <CustomActionForm
          plan={plan}
          initial={actionDraft}
          onCancel={() => setView('outline')}
          onSave={(a) => {
            if (!covenId) return;
            void keep(() => api.saveLibrary(covenId, null, 'action', a.name, a as unknown as Record<string, unknown>), `“${a.name}” is now one of the coven’s own.`).then(() => setView('outline'));
          }}
        />
        {message && <Notice>{message}</Notice>}
      </CovenScreen>
    );
  if (view === 'preview') {
    const script = buildScript({ title: title || 'This gathering', kind, plan, steps: ordered.map((s) => withFieldColumns(s, plan, custom)), ctx: { ranks, nameOf: coven.nameOf }, custom, pages, viewer: { membership: coven.snapshot?.membership ?? null, userId: coven.userId } });
    return (
      <CovenScreen title={previewMode === 'script' ? 'The script' : 'Your run-through'} {...backTo}>
        {back}
        <Chips label="Read it as" options={[{ value: 'script', label: 'The whole script' }, { value: 'run', label: 'Your run-through' }] as const} value={previewMode} onChange={setPreviewMode} />
        <ScriptView script={script} mode={previewMode} />
      </CovenScreen>
    );
  }

  // ── Details ─────────────────────────────────────────────────────────────
  if (view === 'details') {
    return (
      <CovenScreen title="Details" {...backTo}>
        {back}
        <Card>
          <Field label={kind === 'meeting' ? 'The meeting' : 'The rite'} value={title} onChangeText={setTitle} maxLength={120} placeholder={kind === 'meeting' ? 'Autumn business meeting' : 'Full moon rite'} />
          <Field label="Intention (optional)" value={intention} onChangeText={setIntention} maxLength={500} />
          <Field label="What members should know or bring (optional)" value={description} onChangeText={setDescription} multiline maxLength={4000} />
          <Chips label="Kind of gathering" options={GATHERING_KINDS} value={kind} onChange={setKind} />
        </Card>
        <Card>
          <Text style={type.eyebrow}>Occasion</Text>
          <Chips label="Occasion" options={[NO_OCCASION, ...OCCASIONS]} value={occasion} onChange={setOccasion} />
          <Field label="Its name (optional)" value={occasionName} onChangeText={setOccasionName} maxLength={80} placeholder="Samhain, Hunter’s Moon…" />
          {suggestions.length > 0 && (
            <View style={styles.wrap}>
              {suggestions.map((sg) => (
                <Pressable
                  key={`${sg.label}-${sg.date.toISOString()}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${sg.label}, ${sg.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`}
                  onPress={() => {
                    setOccasion(sg.occasion);
                    setOccasionName(sg.name);
                    const at = toFields(suggestionTime(sg).toISOString());
                    setDate(at.date);
                    setTime(at.time);
                    if (!title.trim()) setTitle(sg.occasion === 'sabbat' ? `${sg.name} rite` : `${sg.label} esbat`);
                  }}
                  style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
                >
                  <Text style={styles.chipText}>
                    {sg.label} · {sg.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.row}>
            <View style={styles.grow}>
              <Field label="Date" value={date} onChangeText={setDate} placeholder="2026-10-31" autoCorrect={false} />
            </View>
            <View style={styles.grow}>
              <Field label="Time (your time)" value={time} onChangeText={setTime} placeholder="19:30" autoCorrect={false} />
            </View>
          </View>
        </Card>
        {kind === 'rite' && noticeCard}
        <Button
          label="Keep this as one of the coven’s templates"
          variant="outline"
          disabled={busy || !title.trim()}
          onPress={() =>
            covenId &&
            void keep(
              () => api.saveLibrary(covenId, null, 'template', title, { kind, intention, description, occasion, occasion_name: occasionName, plan, steps: ordered.map(libraryStep) }),
              `“${title.trim()}” is kept with the coven’s templates.`,
            )
          }
        />
        {message && <Notice>{message}</Notice>}
      </CovenScreen>
    );
  }

  // ── The outline ─────────────────────────────────────────────────────────
  const warnings = builderWarnings(plan, steps, custom);
  const rolesLine = plan.roles.length ? plan.roles.map((r) => `${r.name}${r.cast.length ? '' : ' (no one yet)'}`).join(', ') : 'None yet';
  const afterLine = [plan.afterwards.hold_hours ? `Altar left for ${plan.afterwards.hold_hours} hours` : '', plan.afterwards.notes ? 'Notes' : '', plan.afterwards.follow_up ? 'A follow-up' : ''].filter(Boolean).join(' · ') || 'Nothing set';
  const whenLine = [date ? `${date}${time ? ` ${time}` : ''}` : 'No date yet', occasionName || OCCASIONS.find((o) => o.value === occasion)?.label || ''].filter(Boolean).join(' · ');
  return (
    <CovenScreen title={screenTitle} {...backTo}>
      <MenuList>
        <MenuRow label={title.trim() || 'Name it'} detail={whenLine} onPress={() => setView('details')} />
        {kind === 'meeting' && <MenuRow label="Who it’s for, and how it runs" detail={`${audience.length ? assigneesLabel(audience, ranks, coven.nameOf) : 'Everyone in the coven'} · chair, secretary, chat, minutes`} onPress={() => setView('meeting')} />}
        <MenuRow label="Roles" detail={rolesLine} onPress={() => setView('roles')} />
        <MenuRow label={kind === 'meeting' ? 'Before the meeting' : 'Before the rite'} detail={plan.checklist.length ? plan.checklist.map((c) => c.text).join(' · ') : 'Nothing to do yet'} onPress={() => setView('prep')} />
        <MenuRow label="Afterwards" detail={afterLine} onPress={() => setView('after')} />
        <MenuRow label="Sections" detail={plan.sections.map((s) => s.name).join(' · ')} last onPress={() => setView('sections')} />
      </MenuList>

      {!people && <ActivityIndicator color={colors.gold} />}
      <Outline plan={plan} steps={steps} ctx={ctx} custom={custom} problems={problems} onOpen={(key) => setView({ step: key })} onAdd={addStep} onMove={(key, by) => setSteps((list) => moveStep(plan, list, key, by))} />

      {warnings.map((w) => (
        <Notice key={w} tone="muted">
          {w}
        </Notice>
      ))}
      {ordered.length > 0 && <Button label="Read it through" variant="outline" onPress={() => setView('preview')} />}
      {!canSchedule && (
        <Text style={type.caption}>
          {keepsSchedule ? 'You can change this rite, but only those the coven’s head allows can move it on the calendar.' : 'Only those the coven’s head allows can put rites on the calendar. Save it as a draft and they can schedule it.'}
        </Text>
      )}
      {message && <Notice>{message}</Notice>}
      {(canSchedule || keepsSchedule) && <Button label={busy ? 'Saving…' : 'Save it on the coven’s calendar'} onPress={() => void save('scheduled')} disabled={busy} />}
      <Button label={busy ? 'Saving…' : 'Save as a draft'} variant={canSchedule || keepsSchedule ? 'outline' : 'primary'} onPress={() => void save('draft')} disabled={busy} />
      {ritual?.status === 'scheduled' && <Text style={type.caption}>It is on the coven’s calendar now. Saving it as a draft takes it off.</Text>}
    </CovenScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.chip, borderWidth: 1, borderColor: colors.hairline, minHeight: 40, justifyContent: 'center' },
  chipText: { ...type.caption, color: colors.cream },
  pressed: { opacity: 0.7 },
  tidyRow: { paddingVertical: 10, paddingHorizontal: 14 },
});
