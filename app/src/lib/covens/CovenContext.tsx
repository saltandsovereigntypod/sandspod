// One coven's state, shared by its screens (app/(tabs)/coven/c/[slug]/):
// the coven, its positions and pages, your membership and signatures, its
// rituals and rites, and, once a screen asks for them, its gathering and
// altar. One live connection keeps it all current while any of its screens
// is open, and says who else is here.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useSession } from '../session';
import * as api from './api';
import { menteesOf, waitingForMe as waitingFor, type Grant, type Mentorship } from './programs';
import {
  applyChange,
  myTurn,
  permissions,
  standing,
  unsignedAgreements,
  type AltarItem,
  type Message,
  type Permissions,
  type Profile,
  type Ritual,
  type RitualStep,
  type Rsvp,
  type StepMark,
} from './model';

type Presence = { user_id: string; name: string; place?: string };

type CovenState = {
  slug: string;
  status: 'loading' | 'ready' | 'missing' | 'offline';
  snapshot: api.CovenSnapshot | null;
  me: api.Me | null;
  perms: Permissions;
  unsigned: ReturnType<typeof unsignedAgreements>;
  standing: { ok: boolean; reasons: string[] };
  userId: string | null;
  nameOf: (id: string | null | undefined) => string;
  profileOf: (id: string) => Profile | undefined;
  loadNames: (ids: (string | null | undefined)[]) => Promise<void>;
  refresh: () => Promise<void>;
  setMe: (me: api.Me) => void;
  rituals: Ritual[];
  steps: RitualStep[];
  rsvps: Rsvp[];
  marks: StepMark[];
  setRitualState: (next: { rituals?: Ritual[]; steps?: RitualStep[]; rsvps?: Rsvp[]; marks?: StepMark[] }) => void;
  refreshRituals: () => Promise<void>;
  loadMarks: (ritualId: string) => Promise<void>;
  turn: ReturnType<typeof myTurn>;
  messages: Message[] | null;
  setMessages: (update: (list: Message[]) => Message[]) => void;
  loadMessages: () => Promise<void>;
  altar: AltarItem[] | null;
  setAltar: (update: (list: AltarItem[]) => AltarItem[]) => void;
  loadAltar: () => Promise<void>;
  petitionsVersion: number;
  grants: Grant[];
  setGrants: (grants: Grant[]) => void;
  mentors: Mentorship[];
  setMentors: (mentors: Mentorship[]) => void;
  waitingForMe: number;
  refreshPrograms: () => Promise<void>;
  presence: Presence[];
  track: (place: string) => void;
};

const Context = createContext<CovenState | null>(null);

export function CovenProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [status, setStatus] = useState<CovenState['status']>('loading');
  const [snapshot, setSnapshot] = useState<api.CovenSnapshot | null>(null);
  const [me, setMe] = useState<api.Me | null>(null);
  const [names, setNames] = useState<Record<string, Profile>>({});
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [steps, setSteps] = useState<RitualStep[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [marks, setMarks] = useState<StepMark[]>([]);
  const [messages, setMessagesState] = useState<Message[] | null>(null);
  const [altar, setAltarState] = useState<AltarItem[] | null>(null);
  const [petitionsVersion, setPetitionsVersion] = useState(0);
  const [presence, setPresence] = useState<Presence[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [mentors, setMentors] = useState<Mentorship[]>([]);
  const [waitingForMe, setWaitingForMe] = useState(0);
  const namesRef = useRef(names);
  namesRef.current = names;
  const liveRef = useRef<ReturnType<typeof api.listen> | null>(null);

  const loadNames = useCallback(async (ids: (string | null | undefined)[]) => {
    const missing = [...new Set(ids.filter((id): id is string => !!id && !namesRef.current[id]))];
    if (!missing.length) return;
    const rows = await api.fetchProfiles(missing).catch(() => [] as Profile[]);
    setNames((prev) => {
      const next = { ...prev };
      for (const row of rows) next[row.user_id] = row;
      for (const id of missing) if (!next[id]) next[id] = { user_id: id, display_name: 'A witch' };
      return next;
    });
  }, []);

  const refreshRituals = useCallback(async () => {
    const covenId = snapshot?.coven.id;
    if (!covenId) return;
    const list = await api.fetchRituals(covenId).catch(() => null);
    if (!list) return;
    const ids = list.map((r) => r.id);
    const [nextSteps, nextRsvps] = await Promise.all([api.fetchSteps(ids).catch(() => []), api.fetchRsvps(list.filter((r) => r.status === 'scheduled' || r.status === 'live').map((r) => r.id)).catch(() => [])]);
    setRituals(list);
    setSteps(nextSteps);
    setRsvps(nextRsvps);
    void loadNames([...list.map((r) => r.led_by), ...nextSteps.flatMap((s) => [s.assigned_user_id, s.completed_by]), ...nextRsvps.map((r) => r.user_id)]);
  }, [snapshot?.coven.id, loadNames]);

  const refresh = useCallback(async () => {
    try {
      const [snap, mine] = await Promise.all([api.fetchCoven(slug, userId), userId ? api.fetchMe(userId) : Promise.resolve(null)]);
      if (!snap) {
        setStatus('missing');
        return;
      }
      const insiderNow = snap.membership?.status === 'active' || !!mine?.siteModerator;
      setGrants(insiderNow ? await api.fetchGrants(snap.coven.id).catch(() => []) : []);
      setSnapshot(snap);
      setMe(mine);
      if (mine?.profile && userId) setNames((prev) => ({ ...prev, [userId]: mine.profile! }));
      void loadNames([snap.coven.founder_id]);
      setStatus('ready');
    } catch {
      setStatus((prev) => (prev === 'ready' ? prev : 'offline'));
    }
  }, [slug, userId, loadNames]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const perms = useMemo(
    () => permissions({ coven: snapshot?.coven ?? null, membership: snapshot?.membership ?? null, ranks: snapshot?.ranks ?? [], userId, siteModerator: me?.siteModerator, grants }),
    [snapshot, userId, me?.siteModerator, grants],
  );
  const unsigned = useMemo(() => (snapshot ? unsignedAgreements(snapshot.documents, snapshot.signatures, userId) : []), [snapshot, userId]);
  const stand = useMemo(() => standing(perms, unsigned, !!me?.banned), [perms, unsigned, me?.banned]);
  const insider = perms.member || perms.site;

  // Rituals load for members (and site moderators) once the coven is known.
  useEffect(() => {
    if (insider) void refreshRituals();
  }, [insider, refreshRituals]);

  // Mentors, and work waiting for this person to sign off (for the menu's count).
  const refreshPrograms = useCallback(async () => {
    const covenId = snapshot?.coven.id;
    if (!covenId || !insider) return;
    const [list, progress] = await Promise.all([api.fetchMentors(covenId).catch(() => [] as Mentorship[]), api.fetchProgress(covenId).catch(() => [])]);
    setMentors(list);
    const submitted = progress.filter((p) => p.status === 'submitted' && p.user_id !== userId);
    const { tasks } = submitted.length ? await api.fetchProgramParts([...new Set(submitted.map((p) => p.program_id))]).catch(() => ({ tasks: [] })) : { tasks: [] };
    setWaitingForMe(waitingFor(submitted, tasks, { userId, mentees: menteesOf(list, userId), programs: perms.programs }).length);
  }, [snapshot?.coven.id, insider, userId, perms.programs]);
  useEffect(() => {
    void refreshPrograms();
  }, [refreshPrograms]);

  // One live connection while any of this coven's screens is open.
  useEffect(() => {
    const covenId = snapshot?.coven.id;
    if (!covenId || !insider || !userId) return;
    const name = namesRef.current[userId]?.display_name ?? 'A witch';
    const live = api.listen(
      covenId,
      { userId, name },
      (change) => {
        const row = change.new as Record<string, unknown> & { id?: string };
        const asChange = <T,>() => ({ eventType: change.eventType, new: row as Partial<T> & { id?: string }, old: change.old as { id?: string } });
        if (row.user_id) void loadNames([row.user_id as string]);
        switch (change.table) {
          case 'coven_messages':
            setMessagesState((list) => (list ? applyChange(list, asChange<Message>()) : list));
            break;
          case 'coven_altar_items':
            setAltarState((list) => (list ? applyChange(list, asChange<AltarItem>()) : list));
            break;
          case 'coven_rituals':
            setRituals((list) => applyChange(list, asChange<Ritual>()));
            break;
          case 'coven_ritual_steps':
            setSteps((list) => applyChange(list, asChange<RitualStep>()));
            break;
          case 'coven_ritual_rsvps': {
            const r = (change.eventType === 'DELETE' ? change.old : change.new) as Rsvp;
            setRsvps((list) => [...list.filter((x) => !(x.ritual_id === r.ritual_id && x.user_id === r.user_id)), ...(change.eventType === 'DELETE' ? [] : [change.new as Rsvp])]);
            break;
          }
          case 'coven_ritual_step_marks':
            if (change.eventType === 'INSERT') setMarks((list) => [...list.filter((m) => !(m.step_id === row.step_id && m.user_id === row.user_id)), row as unknown as StepMark]);
            break;
          case 'coven_petitions':
            setPetitionsVersion((v) => v + 1);
            break;
        }
      },
      setPresence,
    );
    liveRef.current = live;
    return () => {
      live.stop();
      liveRef.current = null;
    };
  }, [snapshot?.coven.id, insider, userId, loadNames]);

  const covenId = snapshot?.coven.id;
  const loadMessages = useCallback(async () => {
    if (!covenId) return;
    const list = await api.fetchMessages(covenId);
    setMessagesState(list);
    void loadNames(list.map((m) => m.user_id));
  }, [covenId, loadNames]);
  const loadAltar = useCallback(async () => {
    if (!covenId) return;
    const list = await api.fetchAltar(covenId);
    setAltarState(list);
    void loadNames(list.flatMap((i) => [i.placed_by, i.lit_by]));
  }, [covenId, loadNames]);
  const loadMarks = useCallback(async (ritualId: string) => {
    const list = await api.fetchMarks(ritualId).catch(() => [] as StepMark[]);
    setMarks((prev) => [...prev.filter((m) => m.ritual_id !== ritualId), ...list]);
  }, []);

  const value = useMemo<CovenState>(
    () => ({
      slug,
      status,
      snapshot,
      me,
      perms,
      unsigned,
      standing: stand,
      userId,
      nameOf: (id) => (id ? names[id]?.display_name ?? 'A witch' : 'A witch'),
      profileOf: (id) => names[id],
      loadNames,
      refresh,
      setMe,
      rituals,
      steps,
      rsvps,
      marks,
      setRitualState: (next) => {
        if (next.rituals) setRituals(next.rituals);
        if (next.steps) setSteps(next.steps);
        if (next.rsvps) setRsvps(next.rsvps);
        if (next.marks) setMarks(next.marks);
      },
      refreshRituals,
      loadMarks,
      turn: myTurn(rituals, steps, snapshot?.membership ?? null, userId),
      messages,
      setMessages: (update) => setMessagesState((list) => update(list ?? [])),
      loadMessages,
      altar,
      setAltar: (update) => setAltarState((list) => update(list ?? [])),
      loadAltar,
      petitionsVersion,
      grants,
      setGrants,
      mentors,
      setMentors,
      waitingForMe,
      refreshPrograms,
      presence,
      track: (place) => liveRef.current?.track(place),
    }),
    [slug, status, snapshot, me, perms, unsigned, stand, userId, names, loadNames, refresh, rituals, steps, rsvps, marks, refreshRituals, loadMarks, messages, loadMessages, altar, loadAltar, petitionsVersion, grants, mentors, waitingForMe, refreshPrograms, presence],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCoven(): CovenState {
  const value = useContext(Context);
  if (!value) throw new Error('useCoven must be used inside CovenProvider');
  return value;
}
