import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { Body, Card, Chip, Chips, Field, List, RitualScreen, Row, SectionLabel, Title, confirmAction, ui } from '../../../../../components/rituals/ui';
import {
  addPart,
  AS_LABEL,
  BLEND_SECTION,
  blendBlocks,
  blendName,
  blendProblem,
  blendRef,
  BLENDS,
  blendSafety,
  CARRIERS,
  defaultAs,
  dilution,
  emptyBlend,
  findBlendPage,
  FORMS,
  normaliseBlend,
  readBlend,
  removePart,
  setParts,
  STRENGTHS,
  type Blend,
  type BlendForm,
  type PartAs,
} from '../../../../../lib/craft/kitchen/blend';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../lib/craft/store';
import { useGrimoire } from '../../../../../lib/grimoire/store';
import { useLibrary } from '../../../../../lib/library';
import { useShelves } from '../../../../../lib/shelves/store';
import { colors, type } from '../../../../../theme';

const INTENTS = ['Protection', 'Cleansing', 'Love', 'Prosperity', 'Calm', 'Sleep', 'Courage', 'Healing', 'Divination', 'Banishing'];
const LEVEL_MARK = { stop: 'Stop', care: 'Take care', info: 'Good to know' } as const;

// The blending lab: herbs, resins and oils from the Living Library and your
// shelves, put together by intent into an incense, an oil, a powder or a tea,
// with what they share, where they pull apart, their elements and planets,
// and the safety of each part for the form. Kept as blends, and in the Grimoire.
export default function BlendingLab() {
  const { id: openId } = useLocalSearchParams<{ id?: string }>();
  const { entries: library } = useLibrary();
  const { entries: shelves } = useShelves();
  const { entries: kept } = useCraft<Blend>(BLENDS);
  const grimoire = useGrimoire();
  const [id, setId] = useState<string | null>(openId ?? null);
  const start = useMemo(() => (openId ? kept.find((e) => e.id === openId) : null), [openId, kept]);
  const [blend, setBlend] = useState<Blend>(() => (start ? normaliseBlend(start.data) : emptyBlend()));
  const [loaded, setLoaded] = useState(!!start);
  if (!loaded && start) {
    setLoaded(true);
    setBlend(normaliseBlend(start.data));
  }
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const herbs = useMemo(() => library.filter((e) => e.type === 'herb').map((e) => e.name).sort(), [library]);
  const mine = useMemo(() => shelves.filter((s) => s.item.shelf === 'herbs' || s.item.shelf === 'oils').map((s) => ({ id: s.id, name: s.item.name })), [shelves]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const taken = new Set(blend.parts.map((p) => p.name.toLowerCase()));
    const fromShelves = mine.filter((m) => !taken.has(m.name.toLowerCase()) && (!q || m.name.toLowerCase().includes(q))).slice(0, 6);
    const fromLibrary = herbs.filter((h) => !taken.has(h.toLowerCase()) && q && h.toLowerCase().includes(q)).slice(0, 8);
    return { fromShelves, fromLibrary };
  }, [query, mine, herbs, blend.parts]);

  const reading = useMemo(() => readBlend(blend, library), [blend, library]);
  const safety = useMemo(() => blendSafety(blend), [blend]);
  const drops = useMemo(() => dilution(blend), [blend]);
  const problem = blendProblem(blend);
  const page = id && grimoire.snapshot ? findBlendPage(grimoire.snapshot.pages, id) : null;

  const add = (name: string, shelfId?: string) => {
    const entry = library.find((e) => e.name.toLowerCase() === name.toLowerCase());
    setBlend((b) => addPart(b, { name, as: defaultAs(name, b.form), parts: 1, ...(entry ? { entryId: entry.id } : {}), ...(shelfId ? { shelfId } : {}) }));
    setQuery('');
  };
  const setAs = (i: number, as: PartAs) => setBlend((b) => ({ ...b, parts: b.parts.map((p, j) => (j === i ? { ...p, as } : p)) }));

  const save = async () => {
    const data = { ...blend, name: blendName(blend) };
    if (id) await updateEntry<Blend>(BLENDS, id, data);
    else setId((await addEntry<Blend>(BLENDS, data)).id);
    setBlend(data);
    setNotice('Kept with your blends.');
  };
  const toGrimoire = async () => {
    if (page) return router.push({ pathname: '/grimoire/[pageId]', params: { pageId: page.id } });
    const data = { ...blend, name: blendName(blend) };
    const entryId = id ?? (await addEntry<Blend>(BLENDS, data)).id;
    setId(entryId);
    const pageId = grimoire.actions.saveHolyPage({ ref: blendRef(entryId), title: data.name, sectionTitle: BLEND_SECTION, blocks: blendBlocks(data, library) });
    if (pageId) router.push({ pathname: '/grimoire/[pageId]', params: { pageId } });
  };
  const fresh = () => {
    setId(null);
    setBlend(emptyBlend(blend.form));
    setNotice(null);
  };

  return (
    <RitualScreen back="Kitchen & hearth">
      <Title eyebrow="Kitchen & hearth">Blending lab</Title>
      <Body muted>Put herbs, resins and oils together for one intent and see what they share, where they pull apart, and what each asks of you to use safely.</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>Make it as</SectionLabel>
        <Chips>
          {FORMS.map((f) => (
            <Chip key={f.key} label={f.label} selected={blend.form === f.key} onPress={() => setBlend((b) => ({ ...b, form: f.key as BlendForm, parts: b.parts.map((p) => ({ ...p, as: defaultAs(p.name, f.key) })) }))} />
          ))}
        </Chips>
        <Body muted>{FORMS.find((f) => f.key === blend.form)?.line}</Body>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>For</SectionLabel>
        <Chips>
          {INTENTS.map((i) => (
            <Chip key={i} label={i} selected={blend.intent === i} onPress={() => setBlend((b) => ({ ...b, intent: i }))} />
          ))}
        </Chips>
        <Field label="Intent, in your words" value={blend.intent} onChange={(intent) => setBlend((b) => ({ ...b, intent: intent.slice(0, 80) }))} placeholder="Or your own" />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>What goes in</SectionLabel>
        <Field label="Find a herb, resin or oil" value={query} onChange={setQuery} placeholder="Rosemary, frankincense, lavender…" />
        {matches.fromShelves.length > 0 && (
          <>
            <Body muted>From your shelves</Body>
            <Chips>
              {matches.fromShelves.map((m) => (
                <Chip key={m.id} label={`+ ${m.name}`} a11yLabel={`Add ${m.name} from your shelves`} onPress={() => add(m.name, m.id)} />
              ))}
            </Chips>
          </>
        )}
        {matches.fromLibrary.length > 0 && (
          <>
            <Body muted>From the Living Library</Body>
            <Chips>
              {matches.fromLibrary.map((h) => (
                <Chip key={h} label={`+ ${h}`} a11yLabel={`Add ${h}`} onPress={() => add(h)} />
              ))}
            </Chips>
          </>
        )}
        {!!query.trim() && !matches.fromLibrary.some((h) => h.toLowerCase() === query.trim().toLowerCase()) && <Button label={`Add “${query.trim()}”`} variant="outline" onPress={() => add(query.trim())} />}
        {blend.parts.map((p, i) => (
          <Card key={`${p.name}-${i}`}>
            <Text style={type.cardTitle}>{`${p.parts} part${p.parts === 1 ? '' : 's'} ${p.name}`}</Text>
            <Chips>
              {(['herb', 'resin', 'oil'] as const).map((as) => (
                <Chip key={as} label={AS_LABEL[as]} selected={p.as === as} onPress={() => setAs(i, as)} />
              ))}
            </Chips>
            <Chips>
              <Chip label="One part less" onPress={() => setBlend((b) => setParts(b, i, p.parts - 1))} />
              <Chip label="One part more" onPress={() => setBlend((b) => setParts(b, i, p.parts + 1))} />
              <Chip label="Take out" onPress={() => setBlend((b) => removePart(b, i))} />
            </Chips>
          </Card>
        ))}
      </View>

      {blend.form === 'oil' && (
        <View style={ui.gapSmall}>
          <SectionLabel>Carrier and strength</SectionLabel>
          <Chips>
            {CARRIERS.map((c) => (
              <Chip key={c} label={c} selected={blend.carrier === c} onPress={() => setBlend((b) => ({ ...b, carrier: c }))} />
            ))}
          </Chips>
          <Chips>
            {[5, 10, 30, 50].map((ml) => (
              <Chip key={ml} label={`${ml} ml`} selected={blend.carrierMl === ml} onPress={() => setBlend((b) => ({ ...b, carrierMl: ml }))} />
            ))}
          </Chips>
          <Chips>
            {STRENGTHS.map((s) => (
              <Chip key={s.value} label={s.label} selected={blend.strength === s.value} onPress={() => setBlend((b) => ({ ...b, strength: s.value }))} />
            ))}
          </Chips>
          <Body muted>{STRENGTHS.find((s) => s.value === blend.strength)?.line}</Body>
          {drops && (
            <Card accent>
              <Body>{drops.line}</Body>
              {drops.parts.map((d) => (
                <Body key={d.name}>{d.drops ? `${d.name}: ${d.drops} drop${d.drops === 1 ? '' : 's'}${d.capped ? ' (held low for skin)' : ''}` : `${d.name}: none, it isn’t for skin`}</Body>
              ))}
              <Body muted>Drops vary with the dropper; 20 to the millilitre is the usual reckoning.</Body>
            </Card>
          )}
        </View>
      )}

      {blend.parts.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>What they say together</SectionLabel>
          <Card>
            <Body>{reading.balance}</Body>
            {reading.planets.length > 0 && <Body muted>{`Planets: ${reading.planets.map((p) => `${p.key}${p.count > 1 ? ` ×${p.count}` : ''}`).join(', ')}.${reading.day ? ` Make or use it on ${reading.day}.` : ''}`}</Body>}
            {blend.intent.trim() ? <Body muted>{reading.forIntent.length ? `Known for ${blend.intent.trim().toLowerCase()}: ${reading.forIntent.join(', ')}.` : `None of these is known in the Library for ${blend.intent.trim().toLowerCase()}; that may be fine if it’s yours.`}</Body> : null}
          </Card>
          {reading.shared.length > 0 && (
            <Card>
              <Text style={type.cardTitle}>Shared</Text>
              {reading.shared.map((s) => (
                <Body key={s.use}>{`${s.use[0].toUpperCase()}${s.use.slice(1)}: ${s.names.join(', ')}`}</Body>
              ))}
            </Card>
          )}
          {reading.pulls.length > 0 && (
            <Card>
              <Text style={type.cardTitle}>Pulling apart</Text>
              {reading.pulls.map((p) => (
                <Body key={p.why}>{`Between ${p.why}: ${p.a.join(', ')} against ${p.b.join(', ')}.`}</Body>
              ))}
              <Body muted>Not wrong in itself: a cleansing that clears and then draws in is an old shape. Decide which you mean.</Body>
            </Card>
          )}
        </View>
      )}

      {blend.parts.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Safety</SectionLabel>
          {safety.map((n, i) => (
            <Card key={`${n.title}-${i}`} accent={n.level === 'stop'}>
              <Text style={[type.eyebrow, n.level === 'stop' && { color: colors.gold }]}>{LEVEL_MARK[n.level]}</Text>
              <Text style={type.cardTitle}>{n.title}</Text>
              <Body>{n.text}</Body>
            </Card>
          ))}
          <Body muted>General guidance from published essential-oil safety (Tisserand and Young) and the ASPCA’s plant lists, not medical advice.</Body>
        </View>
      )}

      <View style={ui.gapSmall}>
        <Field label="Name it" value={blend.name} onChange={(name) => setBlend((b) => ({ ...b, name }))} placeholder={blendName({ ...blend, name: '' })} />
        <Field label="Notes" value={blend.notes} onChange={(notes) => setBlend((b) => ({ ...b, notes }))} multiline placeholder="How it smelled, how it burned, what you’d change" />
        {problem ? <Body muted>{problem}</Body> : null}
        {notice ? <Body muted>{notice}</Body> : null}
        <Button label={id ? 'Save changes' : 'Keep this blend'} onPress={() => void save()} disabled={!!problem} />
        <Button label={page ? 'Open its Grimoire page' : 'Write it in my Grimoire'} variant="outline" onPress={() => void toGrimoire()} disabled={!!problem || (!page && !grimoire.canEdit)} />
        {id && <Button label="Start a new blend" variant="text" onPress={fresh} />}
      </View>

      {kept.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Your blends</SectionLabel>
          <List>
            {kept.map((e, i) => {
              const b = normaliseBlend(e.data);
              return (
                <Row
                  key={e.id}
                  icon="grimoire"
                  title={b.name || blendName(b)}
                  detail={`${FORMS.find((f) => f.key === b.form)?.label} · ${b.parts.map((p) => p.name).join(', ')}`}
                  last={i === kept.length - 1}
                  onPress={() => {
                    setId(e.id);
                    setBlend(b);
                    setNotice(null);
                  }}
                />
              );
            })}
          </List>
          {id && (
            <Button
              label="Delete this blend"
              variant="text"
              onPress={async () => {
                if (!(await confirmAction('Delete this blend?', 'Its Grimoire page, if any, stays.', 'Delete'))) return;
                await removeEntry(BLENDS, id);
                fresh();
              }}
            />
          )}
        </View>
      )}

      <List>
        <Row icon="grimoire" title="Pantry correspondences" detail="Salt, honey, spices and the cupboard" onPress={() => router.push('/rituals/craft/kitchen/pantry')} />
        <Row icon="altar" title="Bath & body" detail="Bath mixes, with their own safety notes" onPress={() => router.push('/rituals/craft/bath')} />
        <Row icon="grimoire" title="My Shelves" detail="What you keep, and what’s running low" onPress={() => router.push('/rituals/shelves')} />
        <Row icon="altar" title="Incense on the altar" detail="Burn what you’ve made, from the cabinet" last onPress={() => router.push('/altar')} />
      </List>
    </RitualScreen>
  );
}
