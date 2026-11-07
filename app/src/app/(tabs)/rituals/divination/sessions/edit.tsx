import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, confirmAction, ui } from '../../../../../components/rituals/ui';
import { ANCESTORS, normalizeAncestor } from '../../../../../lib/craft/hedge/ancestors';
import {
  AFTERS,
  blankSession,
  defaultClosing,
  defaultOpening,
  normalizeSession,
  PROTECTIONS,
  SESSION_METHODS,
  SPIRIT_SESSIONS,
  WHO_KINDS,
  type SessionLink,
  type SpiritSession,
} from '../../../../../lib/craft/hedge/sessions';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { dateFromKey } from '../../../../../lib/rituals/lifecycle';
import { useSession } from '../../../../../lib/session';

type Params = { id?: string; link?: string; ref?: string; title?: string };

export default function SessionEdit() {
  const params = useLocalSearchParams<Params>();
  const raw = useCraft<unknown>(SPIRIT_SESSIONS);
  const existing = params.id ? (raw.entries.find((e) => e.id === params.id) ?? null) : null;
  if (params.id && !existing) {
    return (
      <RitualScreen back="Spirit sessions">
        <Title>A session</Title>
        <Body>{raw.ready ? 'This page couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  let start = existing ? normalizeSession(existing.data) : blankSession(new Date());
  if (!existing && params.ref && ['ancestor', 'place-spirit', 'familiar'].includes(String(params.link))) {
    const link = { kind: params.link as SessionLink['kind'], id: params.ref, title: params.title ?? '' };
    start = { ...start, link, who: link.title, whoKind: link.kind === 'place-spirit' ? 'place' : link.kind };
  }
  return <Form key={existing?.id ?? 'new'} id={existing?.id ?? null} start={start} />;
}

function Form({ id, start }: { id: string | null; start: SpiritSession }) {
  const { session } = useSession();
  const [s, setS] = useState<SpiritSession>(start);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<SpiritSession>) => setS((x) => ({ ...x, ...patch }));
  const ancestors = useCraft<unknown>(ANCESTORS).entries;
  const people = useMemo(() => ancestors.map((e) => ({ id: e.id, name: normalizeAncestor(e.data).name || 'Unnamed' })), [ancestors]);
  const method = SESSION_METHODS.find((m) => m.id === s.method)!;
  const setMethod = (m: SpiritSession['method']) =>
    set({ method: m, opening: s.opening === defaultOpening(s.method) ? defaultOpening(m) : s.opening, closing: s.closing === defaultClosing(s.method) ? defaultClosing(m) : s.closing });

  const save = async () => {
    const data = normalizeSession({ ...s, date: dateFromKey(s.date) ? s.date : start.date });
    setSaving(true);
    try {
      if (id) {
        await updateEntry(SPIRIT_SESSIONS, id, data);
        router.back();
      } else {
        const e = await addEntry(SPIRIT_SESSIONS, data);
        router.replace(`/rituals/divination/sessions/session?id=${e.id}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (!id || !(await confirmAction('Delete this session?', 'It will be deleted on every device.', 'Delete'))) return;
    await removeEntry(SPIRIT_SESSIONS, id);
    router.replace('/rituals/divination/sessions' as Href);
  };

  return (
    <RitualScreen back={id ? 'Session' : 'Spirit sessions'}>
      <Title eyebrow={id ? 'Edit' : 'Spirit sessions'}>{id ? 'Edit the session' : 'Log a session'}</Title>
      <Field label="Day (YYYY-MM-DD)" value={s.date} onChange={(date) => set({ date })} />

      <View style={ui.gapSmall}>
        <SectionLabel>How</SectionLabel>
        <Chips label="How">
          {SESSION_METHODS.map((m) => (
            <Chip key={m.id} label={m.label} selected={s.method === m.id} onPress={() => setMethod(m.id)} />
          ))}
        </Chips>
        <Body muted>{method.how}</Body>
        {!!method.care && <Body muted>{`Take care: ${method.care}`}</Body>}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>With whom</SectionLabel>
        <Chips label="With whom">
          {WHO_KINDS.map((w) => (
            <Chip key={w.id} label={w.label} selected={s.whoKind === w.id} onPress={() => set({ whoKind: w.id })} />
          ))}
        </Chips>
        {s.whoKind === 'ancestor' && people.length > 0 && (
          <Chips>
            {people.map((p) => (
              <Chip key={p.id} label={p.name} selected={s.link?.id === p.id} onPress={() => set(s.link?.id === p.id ? { link: null } : { link: { kind: 'ancestor', id: p.id, title: p.name }, who: p.name })} />
            ))}
          </Chips>
        )}
        <Field label="Their name, or how they came" value={s.who} onChange={(who) => set({ who })} placeholder="Nan, Hekate, the spirit of the well, unknown" />
        <Field label="Why you sat" value={s.intention} onChange={(intention) => set({ intention })} multiline placeholder="To ask about the ring; to say goodbye; to listen" />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Protections</SectionLabel>
        <Chips multiple label="Protections">
          {PROTECTIONS.map((p) => (
            <Chip key={p.id} label={p.label} selected={s.protections.includes(p.id)} onPress={() => set({ protections: s.protections.includes(p.id) ? s.protections.filter((x) => x !== p.id) : [...s.protections, p.id] })} />
          ))}
        </Chips>
        <Field label="Opening" value={s.opening} onChange={(opening) => set({ opening })} multiline />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Questions and answers</SectionLabel>
        {s.exchanges.map((x, i) => (
          <Card key={i}>
            <Field label="Asked" value={x.q} onChange={(q) => set({ exchanges: s.exchanges.map((y, j) => (j === i ? { ...y, q } : y)) })} />
            <Field label="Answer" value={x.a} onChange={(a) => set({ exchanges: s.exchanges.map((y, j) => (j === i ? { ...y, a } : y)) })} multiline />
            <Field label="Checked later (what you found)" value={x.checkNote} onChange={(checkNote) => set({ exchanges: s.exchanges.map((y, j) => (j === i ? { ...y, checkNote } : y)) })} multiline />
            <Button label="Remove" variant="text" onPress={() => set({ exchanges: s.exchanges.filter((_, j) => j !== i) })} />
          </Card>
        ))}
        <Button label="Add a question" variant="outline" onPress={() => set({ exchanges: [...s.exchanges, { q: '', a: '', check: 'pending', checkNote: '' }] })} />
        <Body muted>Write answers down as they came, before interpreting. Whether they bore out is marked on the session’s page.</Body>
      </View>

      <Field label="Impressions" value={s.impressions} onChange={(impressions) => set({ impressions })} multiline placeholder="Images, feelings, a temperature change, a scent, nothing at all" />

      <View style={ui.gapSmall}>
        <SectionLabel>Closing</SectionLabel>
        <Field label="How you closed" value={s.closing} onChange={(closing) => set({ closing })} multiline />
        <Toggle label="Closed fully" detail="Thanked them, said it was over, put the tools away" value={s.closed} onChange={(closed) => set({ closed })} />
        <Chips label="Closing">
          {AFTERS.map((a) => (
            <Chip key={a.id} label={a.label} selected={s.after === a.id} onPress={() => set({ after: s.after === a.id ? '' : a.id })} />
          ))}
        </Chips>
        <Field label="Aftercare" value={s.aftercare} onChange={(aftercare) => set({ aftercare })} placeholder="Tea and toast, a walk, an early night" />
      </View>

      <Notice>Stop at once if anything turns threatening, cruel or demanding, or tells you to harm yourself or anyone. If voices or presences carry on outside your sessions, see a doctor: that is care, not failure.</Notice>
      {!session && <Body muted>Saved on this phone. Sign in to keep it with your account.</Body>}
      <View style={ui.actions}>
        <Button label={saving ? 'Saving…' : id ? 'Save changes' : 'Keep this session'} onPress={save} disabled={saving} />
        {!!id && <Button label="Delete" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
