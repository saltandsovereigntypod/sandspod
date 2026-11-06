import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { SigilPicture } from '../../../../../components/sigil/SigilPicture';
import { Body, Card, Chip, Chips, Expander, Field, List, RitualScreen, Row, SectionLabel, Title, ui } from '../../../../../components/rituals/ui';
import { copyText } from '../../../../../lib/copyText';
import { addEntry } from '../../../../../lib/craft/store';
import { keptName, SCRIPTS, scriptPath, spelling, TEXT_MAX, unicodeText, writeIn, type Layout, type ScriptId } from '../../../../../lib/sigil/alphabets';
import { DEFAULT_WEIGHT, SIGILS, type KeptSigil } from '../../../../../lib/sigil/sigil';
import { type } from '../../../../../theme';

// Witch's alphabets: type a word and see it in Theban, Passing the River,
// Malachim, Celestial, the Elder Futhark and Ogham; copy it, or keep it with
// your sigils to carve on a candle.
export default function Alphabets() {
  const [text, setText] = useState('');
  const [layout, setLayout] = useState<Layout>('rows');
  const [only, setOnly] = useState<ScriptId | null>(null);
  const [notice, setNotice] = useState<Partial<Record<ScriptId, string>>>({});
  const shown = only ? SCRIPTS.filter((s) => s.id === only) : SCRIPTS;
  const written = useMemo(() => Object.fromEntries(SCRIPTS.map((s) => [s.id, writeIn(s.id, text)])) as Record<ScriptId, ReturnType<typeof writeIn>>, [text]);
  const say = (id: ScriptId, line: string) => setNotice((n) => ({ ...n, [id]: line }));

  const keep = async (id: ScriptId) => {
    const w = written[id];
    const d = scriptPath(id, w, layout);
    if (!d) return;
    await addEntry<KeptSigil>(SIGILS, { name: keptName(id, w), sigil: { version: 1, method: 'freehand', intent: `${w.text} (${SCRIPTS.find((s) => s.id === id)?.name})`, letters: '', planet: null, d, weight: DEFAULT_WEIGHT, ring: false } });
    say(id, 'Kept with your sigils. On the altar, tap a candle, choose Carve, and pick it from your sigils.');
  };
  const copy = async (id: ScriptId) => {
    const w = written[id];
    const asText = unicodeText(id, w);
    const ok = await copyText(asText ?? `${w.text}: ${spelling(w)}`);
    say(id, ok ? (asText ? 'Copied as text.' : 'This script has no letters in Unicode, so its spelling was copied instead; keep it with your sigils to carve the picture.') : 'Couldn’t copy just now.');
  };

  return (
    <RitualScreen back="Eclectic">
      <Title eyebrow="Eclectic">Witch’s alphabets</Title>
      <Body muted>Write a name, a word or a short intent in the old magical and runic scripts, then copy it or keep it to carve on a candle. Each comes with what is actually known of where it came from.</Body>

      <Field label="Your words" value={text} onChange={(t) => setText(t.slice(0, TEXT_MAX))} placeholder="A name, a word, a short intent" />
      <Chips>
        <Chip label="All six" selected={!only} onPress={() => setOnly(null)} />
        {SCRIPTS.map((s) => (
          <Chip key={s.id} label={s.name} selected={only === s.id} onPress={() => setOnly(s.id)} />
        ))}
      </Chips>
      <Chips>
        <Chip label="Across" selected={layout === 'rows'} onPress={() => setLayout('rows')} />
        <Chip label="Down a candle" selected={layout === 'column'} onPress={() => setLayout('column')} />
      </Chips>

      {shown.map((s) => {
        const w = written[s.id];
        const d = scriptPath(s.id, w, layout);
        return (
          <Card key={s.id}>
            <Text style={type.eyebrow}>{s.aka}</Text>
            <Text style={type.cardTitle}>{s.name}</Text>
            {d ? (
              <View style={{ alignItems: 'center' }}>
                <SigilPicture sigil={{ d, weight: 1.6, ring: false }} size={200} label={`${w.text} in ${s.name}`} />
              </View>
            ) : (
              <Body muted>Type above to see it here.</Body>
            )}
            {!!w.words.length && <Body muted>{spelling(w)}</Body>}
            {s.unicode && !!w.words.length && <Text style={[type.body, { fontSize: 22 }]} selectable>{unicodeText(s.id, w)}</Text>}
            {w.dropped.length > 0 && <Body muted>{`Left out: ${w.dropped.join(' ')}`}</Body>}
            {!!d && (
              <Chips>
                <Chip label="Copy" onPress={() => void copy(s.id)} />
                <Chip label="Keep for carving" onPress={() => void keep(s.id)} />
              </Chips>
            )}
            {notice[s.id] ? <Body muted>{notice[s.id]}</Body> : null}
            <Expander title="Where it comes from">
              <Body>{s.origins}</Body>
              <Body muted>{s.how}</Body>
            </Expander>
          </Card>
        );
      })}

      <Body muted>The letters are our own redrawings after the printed tables (Trithemius, 1518; Agrippa, 1533, in the English edition of 1651). Tables and hands differ, so check against one you trust before carving something that matters.</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>Alongside</SectionLabel>
        <List>
          <Row icon="grimoire" title="Sigil maker" detail="The letter method and the planetary squares" onPress={() => router.push('/rituals/sigil' as Href)} />
          <Row icon="altar" title="Carve a candle" detail="On the altar: tap a candle, then Carve" onPress={() => router.push('/altar' as Href)} />
          <Row icon="wheel" title="Draw runes or ogham" detail="Readings, with each stave’s meaning" last onPress={() => router.push('/rituals/craft/hedge/readings/draw' as Href)} />
        </List>
      </View>
    </RitualScreen>
  );
}
