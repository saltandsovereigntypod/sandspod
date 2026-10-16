import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../../../components/Button';
import { Body, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, Toggle, confirmAction, tell, ui } from '../../../../../../components/rituals/ui';
import { fullDate } from '../../../../../../lib/calendar';
import {
  addSymbol,
  blankDream,
  DREAMS,
  dreamMoon,
  normalizeDream,
  parseSymbols,
  symbolCounts,
  VIVIDNESS,
  type Dream,
} from '../../../../../../lib/craft/hedge/dreams';
import { addEntry, removeEntry, updateEntry, useCraft } from '../../../../../../lib/craft/store';
import { dateFromKey, localDateKey } from '../../../../../../lib/rituals/lifecycle';
import { useSession } from '../../../../../../lib/session';

export default function DreamForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useSession();
  const { entries, ready } = useCraft<unknown>(DREAMS);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;
  const [dream, setDream] = useState<Dream>(() => (existing ? normalizeDream(existing.data) : blankDream(new Date())));
  const [symbolText, setSymbolText] = useState('');
  const [typedDate, setTypedDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Only when the entry first arrives, so typing is never overwritten.
    if (existing) setDream(normalizeDream(existing.data));
  }, [existing?.id]);

  const set = (patch: Partial<Dream>) => setDream((d) => ({ ...d, ...patch }));
  const setDate = (date: string) => set({ date, ...dreamMoon(date) });

  const known = useMemo(
    () =>
      symbolCounts(entries.map((e) => ({ ...e, data: normalizeDream(e.data) })))
        .map((s) => s.symbol)
        .filter((s) => !dream.symbols.includes(s))
        .slice(0, 12),
    [entries, dream.symbols],
  );

  const now = new Date();
  const recent = Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));

  const addTyped = () => {
    let next = dream.symbols;
    for (const s of parseSymbols(symbolText)) next = addSymbol(next, s);
    set({ symbols: next });
    setSymbolText('');
  };

  const save = async () => {
    // Symbols typed but not yet added are kept too.
    let symbols = dream.symbols;
    for (const s of parseSymbols(symbolText)) symbols = addSymbol(symbols, s);
    const data: Dream = { ...dream, symbols, title: dream.title.trim(), dream: dream.dream.trim(), feelings: dream.feelings.trim() };
    if (!data.title && !data.dream) {
      tell('Nothing to keep yet', 'Give the dream a title or write a little of it first.');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(DREAMS, existing.id, data);
        router.back();
      } else {
        const entry = await addEntry(DREAMS, data);
        router.replace(`/rituals/craft/hedge/dreams/${entry.id}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this dream?', 'It will be removed from your journal on every device.', 'Delete'))) return;
    await removeEntry(DREAMS, existing.id);
    router.replace('/rituals/craft/hedge/dreams' as Href);
  };

  if (id && !existing) {
    return (
      <RitualScreen back="Dream journal">
        <Title>Dream</Title>
        <Body>{ready ? 'This dream couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }

  return (
    <RitualScreen back={existing ? dream.title || 'Dream' : 'Dream journal'}>
      <Title eyebrow={existing ? 'Edit dream' : 'Before it fades'}>{existing ? 'Your dream' : 'Write down a dream'}</Title>

      <View style={ui.gap}>
        <Field label="The dream" value={dream.dream} onChange={(v) => set({ dream: v })} placeholder="Everything you remember, even fragments. Present tense helps." multiline />
        <Field label="Title" value={dream.title} onChange={(v) => set({ title: v })} placeholder="A few words to find it by" />
        <Field label="Feelings" value={dream.feelings} onChange={(v) => set({ feelings: v })} placeholder="In the dream, and on waking" multiline />
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Which morning?</SectionLabel>
        <Chips>
          {recent.map((day, i) => {
            const key = localDateKey(day);
            return (
              <Chip
                key={key}
                label={i === 0 ? 'This morning' : i === 1 ? 'Yesterday' : fullDate(day)?.replace(/, \d{4}$/, '') ?? key}
                selected={dream.date === key}
                onPress={() => setDate(key)}
              />
            );
          })}
          {!recent.some((d) => localDateKey(d) === dream.date) && <Chip label={fullDate(dream.date) ?? dream.date} selected onPress={() => undefined} />}
        </Chips>
        <Field
          label="Or another date (YYYY-MM-DD)"
          value={typedDate}
          onChange={(v) => {
            setTypedDate(v);
            if (dateFromKey(v.trim())) setDate(v.trim());
          }}
          placeholder="2026-03-14"
        />
        <Body muted>{`The moon that night: ${dream.moonPhase}, in ${dream.moonSign}.`}</Body>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Symbols</SectionLabel>
        {dream.symbols.length > 0 && (
          <Chips>
            {dream.symbols.map((s) => (
              <Chip key={s} label={`${s}  ×`} a11yLabel={`Remove ${s}`} onPress={() => set({ symbols: dream.symbols.filter((x) => x !== s) })} />
            ))}
          </Chips>
        )}
        <Field label="Add symbols" value={symbolText} onChange={setSymbolText} placeholder="river, black dog, a key (commas between)" />
        <Button label="Add" variant="outline" onPress={addTyped} disabled={!symbolText.trim()} />
        {known.length > 0 && (
          <>
            <Body muted>From your other dreams</Body>
            <Chips>
              {known.map((s) => (
                <Chip key={s} label={s} a11yLabel={`Add ${s}`} onPress={() => set({ symbols: addSymbol(dream.symbols, s) })} />
              ))}
            </Chips>
          </>
        )}
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>How vivid?</SectionLabel>
        <Chips>
          {VIVIDNESS.map((v) => (
            <Chip key={v.value} label={`${v.value} · ${v.label}`} selected={dream.vividness === v.value} onPress={() => set({ vividness: v.value })} />
          ))}
        </Chips>
      </View>

      <View>
        <Toggle label="Lucid" detail="You knew you were dreaming" value={dream.lucid} onChange={(lucid) => set({ lucid })} />
        <Toggle label="Recurring" detail="You’ve had this dream before" value={dream.recurring} onChange={(recurring) => set({ recurring })} />
      </View>

      {!session && <Notice>Saved on this phone. Sign in to keep your dreams with your account.</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Keeping it…' : existing ? 'Save changes' : 'Keep this dream'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete this dream" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
