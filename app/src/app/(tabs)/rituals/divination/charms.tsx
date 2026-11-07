import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { Button } from '../../../../components/Button';
import { ReadingBody } from '../../../../components/divination/ReadingBody';
import { Body, Card, Chip, Chips, Field, RitualScreen, SectionLabel, Title, tell, ui } from '../../../../components/rituals/ui';
import { addEntry } from '../../../../lib/craft/store';
import { READINGS } from '../../../../lib/craft/hedge/readings';
import { CHARMS, classify, ownCharm, readCast, throwCharms, touching, type Cast, type Charm } from '../../../../lib/divination/charms';
import { readingToKeep } from '../../../../lib/divination/keep';
import { localDateKey } from '../../../../lib/rituals/lifecycle';
import { colors, fonts } from '../../../../theme';

const DEFAULT_SET = ['key', 'coin', 'bone', 'shell', 'ring', 'star', 'moon', 'heart'];

// Charm casting: build a set, then place each charm on the mat where it would
// land (or throw them at random), and read the pattern by where they lie.
export default function CharmCasting() {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 32, 380);
  const [own, setOwn] = useState<Charm[]>([]);
  const [setIds, setSetIds] = useState<string[]>(DEFAULT_SET);
  const [casts, setCasts] = useState<Cast[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [meaning, setMeaning] = useState('');
  const [question, setQuestion] = useState('');
  const [shown, setShown] = useState(false);
  const [saving, setSaving] = useState(false);

  const all = useMemo(() => [...CHARMS, ...own], [own]);
  const set = useMemo(() => setIds.map((id) => all.find((c) => c.id === id)).filter((c): c is Charm => !!c), [setIds, all]);
  const date = useMemo(() => localDateKey(new Date()), []);
  const reading = useMemo(() => (shown && casts.length ? readCast(casts, all, question, date) : null), [shown, casts, all, question, date]);
  const touches = useMemo(() => new Set(touching(casts).flat()), [casts]);

  const toggle = (id: string) => {
    setSetIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    setCasts((c) => c.filter((x) => x.charmId !== id));
    setShown(false);
  };
  const addOwn = () => {
    if (!name.trim()) return tell('A name first', 'Give the charm a name, and what it means to you.');
    const c = ownCharm(name, meaning);
    if (all.some((x) => x.id === c.id)) return tell('Already in the set', 'A charm of that name is already there.');
    setOwn((o) => [...o, c]);
    setSetIds((s) => [...s, c.id]);
    setName('');
    setMeaning('');
  };
  const place = (x: number, y: number) => {
    const id = active ?? set.find((c) => !casts.some((k) => k.charmId === c.id))?.id;
    if (!id) return;
    setCasts((list) => [...list.filter((k) => k.charmId !== id), { charmId: id, x, y, up: list.find((k) => k.charmId === id)?.up ?? true }]);
    setActive(null);
    setShown(false);
  };
  const flip = (id: string) => {
    setCasts((list) => list.map((k) => (k.charmId === id ? { ...k, up: !k.up } : k)));
    setShown(false);
  };
  const throwAll = () => {
    setCasts(throwCharms(set));
    setShown(false);
  };

  const keep = async () => {
    if (!reading) return;
    setSaving(true);
    try {
      const drawn = casts.map((c) => {
        const z = classify(c);
        return `${all.find((a) => a.id === c.charmId)?.name} (${z.inside ? z.ring : 'outside'}, ${z.up ? 'face up' : 'face down'})`;
      });
      const entry = await addEntry(READINGS, readingToKeep({ method: 'charms', question, drawn, text: reading.text, lookBackDays: 14 }));
      router.replace(`/rituals/divination/${entry.id}` as Href);
    } catch {
      tell('Could not keep it', 'Try again in a moment.');
    } finally {
      setSaving(false);
    }
  };

  const half = size / 2;
  const next = set.find((c) => !casts.some((k) => k.charmId === c.id));

  return (
    <RitualScreen back="Readings">
      <Title eyebrow="Casting">Charms and bones</Title>
      <Body muted>
        Choose the charms you cast with, then lay each one on the mat where it fell, or throw them for you. Left of centre is the past and right is the future; the middle is you and now; the rim is further off; outside the circle is outside the matter. Face down is hidden or unfinished. Charms that touch are read together.
      </Body>
      <Field label="The question" value={question} onChange={setQuestion} placeholder="What you asked as you cast" multiline />

      <View style={ui.gapSmall}>
        <SectionLabel>Your set</SectionLabel>
        <Chips multiple label="Your set">
          {all.map((c) => (
            <Chip key={c.id} label={c.name} selected={setIds.includes(c.id)} onPress={() => toggle(c.id)} />
          ))}
        </Chips>
        <Field label="Add a charm of your own" value={name} onChange={setName} placeholder="A name: the button from Nan’s coat" />
        <Field label="What it means to you" value={meaning} onChange={setMeaning} placeholder="Home, and being looked after" />
        <Button label="Add to the set" variant="outline" onPress={addOwn} />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>The mat</SectionLabel>
        <Body muted>{next ? `Tap the mat to lay ${active ? all.find((c) => c.id === active)?.name : next.name}. Tap a charm below first to choose another.` : 'Every charm is down. Tap a charm below to move it.'}</Body>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="The casting mat. Tap to lay the chosen charm where it fell"
          onPress={(e) => place(((e.nativeEvent.locationX - half) / (half * 0.88)) , -((e.nativeEvent.locationY - half) / (half * 0.88)))}
          style={{ width: size, height: size, alignSelf: 'center', borderRadius: half, borderWidth: 0, backgroundColor: 'transparent' }}
        >
          <View style={{ position: 'absolute', left: half * 0.12, top: half * 0.12, width: half * 1.76, height: half * 1.76, borderRadius: half, borderWidth: 2, borderColor: colors.gold, backgroundColor: 'rgba(0,0,0,0.18)' }} />
          <View style={{ position: 'absolute', left: half - half * 0.88 * 0.22, top: half - half * 0.88 * 0.22, width: half * 0.88 * 0.44, height: half * 0.88 * 0.44, borderRadius: half, borderWidth: 1, borderColor: colors.hairline }} />
          <View style={{ position: 'absolute', left: half, top: half * 0.12, width: 1, height: half * 1.76, backgroundColor: colors.hairline }} />
          <View style={{ position: 'absolute', top: half, left: half * 0.12, height: 1, width: half * 1.76, backgroundColor: colors.hairline }} />
          <Text style={{ position: 'absolute', left: half * 0.2, top: half - 9, color: colors.cream, fontFamily: fonts.body, fontSize: 12, opacity: 0.7 }}>past</Text>
          <Text style={{ position: 'absolute', right: half * 0.2, top: half - 9, color: colors.cream, fontFamily: fonts.body, fontSize: 12, opacity: 0.7 }}>future</Text>
          {casts.map((k) => {
            const c = all.find((a) => a.id === k.charmId);
            const r = half * 0.88;
            return (
              <View
                key={k.charmId}
                pointerEvents="none"
                style={{ position: 'absolute', left: half + k.x * r - 18, top: half - k.y * r - 18, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: k.up ? colors.gold : colors.surface, borderWidth: touches.has(casts.indexOf(k)) ? 3 : 1, borderColor: touches.has(casts.indexOf(k)) ? colors.cream : colors.gold }}
              >
                <Text style={{ fontFamily: fonts.display, fontSize: 13, color: k.up ? colors.ground : colors.gold }}>{c?.name.slice(0, 2)}</Text>
              </View>
            );
          })}
        </Pressable>
        <Chips>
          {set.map((c) => {
            const k = casts.find((x) => x.charmId === c.id);
            return <Chip key={c.id} label={`${c.name}${k ? (k.up ? ' · up' : ' · down') : ''}`} selected={active === c.id} onPress={() => setActive(active === c.id ? null : c.id)} />;
          })}
        </Chips>
        {active && casts.some((k) => k.charmId === active) && <Button label="Turn it over" variant="outline" onPress={() => flip(active)} />}
        <Button label="Throw them for me" variant="outline" onPress={throwAll} />
      </View>

      <Button label={casts.length ? 'Read the casting' : 'Cast something first'} onPress={() => (casts.length ? setShown(true) : tell('Nothing cast yet', 'Lay at least one charm on the mat, or throw them.'))} />

      {reading && (
        <View style={ui.gap}>
          <ReadingBody sections={reading.sections} blocksId="charms" blocks={reading.reads.map((r) => ({ title: `${r.charm.name} · ${r.zone.inside ? r.zone.ring : 'outside'}, ${r.zone.up ? 'face up' : 'face down'}`, paragraphs: r.paragraphs }))} />
          <Card accent>
            <Body>Keep this in your readings, with a day to come back to it.</Body>
          </Card>
          <Button label={saving ? 'Keeping it…' : 'Keep this reading'} onPress={keep} disabled={saving} />
        </View>
      )}
    </RitualScreen>
  );
}
