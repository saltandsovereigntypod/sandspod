import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../components/Button';
import { SafetyCard } from '../../../../../components/craft/BathParts';
import { Body, Card, Chip, Chips, Field, RitualScreen, SectionLabel, Title, Toggle, tell, ui } from '../../../../../components/rituals/ui';
import { BATH_HOME, BATH_OWN, METHODS, ownMix, suggestBath } from '../../../../../lib/craft/bath/bath';
import type { BathMethod } from '../../../../../lib/craft/bath/mixes';
import { type BathIngredient, type BathKind } from '../../../../../lib/craft/bath/safety';
import { addEntry } from '../../../../../lib/craft/store';
import { SPELL_INTENTS, spellIntent } from '../../../../../lib/rituals/spellcraft/suggest';
import { uuid } from '../../../../../lib/rituals/lifecycle';

const CUSTOM_KINDS: { value: BathKind; label: string }[] = [
  { value: 'herb', label: 'Herb' },
  { value: 'flower', label: 'Flower' },
  { value: 'salt', label: 'Salt' },
  { value: 'carrier', label: 'Milk, honey or carrier oil' },
  { value: 'oil', label: 'Essential oil' },
  { value: 'crystal', label: 'Stone' },
  { value: 'other', label: 'Something else' },
];

// Build your own: choose an intention, then from the herbs and stones the
// Living Library suggests for it, set the amounts and a method. The safety
// table checks it as you go, and it is saved as one of your mixes.
export default function BathBuild() {
  const params = useLocalSearchParams<{ intent?: string }>();
  const [intent, setIntent] = useState<string | null>(spellIntent(params.intent)?.key ?? null);
  const [pregnant, setPregnant] = useState(false);
  const [child, setChild] = useState(false);
  const suggested = useMemo(() => (intent ? suggestBath(intent, { pregnant, child }) : null), [intent, pregnant, child]);
  // What you have picked, by name, with its amount; it starts as the suggestions' first few and resets when the intention changes.
  const key = `${intent}|${pregnant}|${child}`;
  const [edit, setEdit] = useState<{ key: string; picked: Record<string, string> } | null>(null);
  const [custom, setCustom] = useState<BathIngredient[]>([]);
  const [cName, setCName] = useState('');
  const [cAmount, setCAmount] = useState('');
  const [cKind, setCKind] = useState<BathKind>('herb');
  const [method, setMethod] = useState<BathMethod>('sachet');
  const [title, setTitle] = useState('');
  const [words, setWords] = useState('');
  const [minutes, setMinutes] = useState('20');
  const [saving, setSaving] = useState(false);

  const options = useMemo(() => (suggested ? [...suggested.salt, ...suggested.herbs, ...suggested.stones] : []), [suggested]);
  const picked = useMemo(() => (edit?.key === key ? edit.picked : Object.fromEntries(options.filter((o) => o.kind !== 'crystal').slice(0, 5).map((o) => [o.name, o.amount]))), [edit, key, options]);
  const chosen = useMemo(() => [...options.filter((o) => o.name in picked).map((o) => ({ ...o, amount: picked[o.name] })), ...custom], [options, picked, custom]);
  const intentLabel = intent ? spellIntent(intent)?.label : '';

  const toggle = (o: BathIngredient) => {
    const next = { ...picked };
    if (o.name in next) delete next[o.name];
    else next[o.name] = o.amount;
    setEdit({ key, picked: next });
  };
  const setAmount = (o: BathIngredient, v: string) => setEdit({ key, picked: { ...picked, [o.name]: v } });
  const addCustom = () => {
    if (!cName.trim()) return;
    setCustom((c) => [...c, { name: cName.trim(), amount: cAmount.trim() || 'a little', kind: cKind }]);
    setCName('');
    setCAmount('');
  };
  const save = async () => {
    if (!intent || !chosen.length) {
      tell('Choose something first', 'Pick an intention and at least one ingredient.');
      return;
    }
    setSaving(true);
    try {
      const mix = ownMix({ id: uuid(), title, intent, ingredients: chosen, method, words, minutes: Number(minutes) });
      const entry = await addEntry(BATH_OWN, mix);
      router.replace(`${BATH_HOME}/mix?id=${encodeURIComponent(entry.id)}` as Href);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RitualScreen back="Bath & body">
      <Title eyebrow="Bath & body">Build your own</Title>
      <Body muted>Choose what the bath is for. The Living Library suggests herbs and stones that suit it, with amounts to start from. Take what you like, change the amounts, and add anything of your own.</Body>

      <View style={ui.gapSmall}>
        <SectionLabel>What it is for</SectionLabel>
        <Chips label="What it is for">
          {SPELL_INTENTS.map((i) => (
            <Chip
              key={i.key}
              label={i.label}
              selected={intent === i.key}
              onPress={() => setIntent(i.key)}
            />
          ))}
        </Chips>
      </View>

      <Card>
        <Toggle label="Someone bathing is pregnant or may be" detail="Leaves out herbs and oils usually advised against" value={pregnant} onChange={setPregnant} />
        <Toggle label="It is for a child" detail="Plain, gentle plants only: no salts, oils, spices or stones" value={child} onChange={setChild} />
      </Card>

      {!!suggested && (
        <View style={ui.gapSmall}>
          <SectionLabel>{`Suggested for ${intentLabel?.toLowerCase()}`}</SectionLabel>
          <Chips multiple>
            {options.map((o) => (
              <Chip key={o.name} label={o.kind === 'crystal' ? `${o.name} (beside the bath)` : o.name} selected={chosen.some((c) => c.name === o.name)} onPress={() => toggle(o)} />
            ))}
          </Chips>
          {suggested.candle && <Body muted>{`Candle colour: ${suggested.candle.toLowerCase()}.`}</Body>}
          <Body muted>Herbs come from the Library’s uses for this intention. Dangerous plants and resins that do not dissolve are left out.</Body>
        </View>
      )}

      {chosen.length > 0 && (
        <View style={ui.gapSmall}>
          <SectionLabel>Amounts</SectionLabel>
          {chosen.map((o) => (
            <Field key={o.name} label={o.name} value={o.amount} onChange={(v) => (custom.includes(o) ? setCustom((c) => c.map((x) => (x === o ? { ...x, amount: v } : x))) : setAmount(o, v))} />
          ))}
        </View>
      )}

      {!!intent && (
        <Card>
          <SectionLabel>Add something of your own</SectionLabel>
          <Field label="Name" value={cName} onChange={setCName} placeholder="Oat milk" />
          <Field label="Amount" value={cAmount} onChange={setCAmount} placeholder="1 cup" />
          <Chips label="Add something of your own">
            {CUSTOM_KINDS.map((k) => (
              <Chip key={k.value} label={k.label} selected={cKind === k.value} onPress={() => setCKind(k.value)} />
            ))}
          </Chips>
          <Button label="Add it" variant="outline" onPress={addCustom} disabled={!cName.trim()} />
        </Card>
      )}

      {!!intent && (
        <View style={ui.gapSmall}>
          <SectionLabel>How you will prepare it</SectionLabel>
          <Chips label="How you will prepare it">
            {METHODS.map((m) => (
              <Chip key={m.value} label={m.label} selected={method === m.value} onPress={() => setMethod(m.value)} />
            ))}
          </Chips>
          <Body muted>{METHODS.find((m) => m.value === method)?.line}</Body>
          <Field label="Name your mix (optional)" value={title} onChange={setTitle} placeholder={`${intentLabel ?? 'My'} bath`} />
          <Field label="Words to speak (optional)" value={words} onChange={setWords} multiline />
          <Field label="Minutes" value={minutes} onChange={setMinutes} keyboardType="numeric" />
        </View>
      )}

      {chosen.length > 0 && <SafetyCard ingredients={chosen} method={method} />}

      {!!intent && <Button label="Save as my mix" onPress={() => void save()} disabled={saving || !chosen.length} />}
    </RitualScreen>
  );
}
