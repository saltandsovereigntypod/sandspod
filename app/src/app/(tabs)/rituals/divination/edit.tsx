import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../../../components/Button';
import { Body, Chip, Chips, Field, Notice, RitualScreen, SectionLabel, Title, confirmAction, tell, ui } from '../../../../components/rituals/ui';
import { fullDate } from '../../../../lib/calendar';
import {
  blankReading,
  ELDER_FUTHARK,
  LOOK_BACK_CHOICES,
  lookBackFrom,
  MAJOR_ARCANA,
  METHODS,
  moonForReading,
  normalizeReading,
  OGHAM,
  pickList,
  READINGS,
  searchTarot,
  type Reading,
} from '../../../../lib/craft/hedge/readings';
import { addEntry, removeEntry, updateEntry, useCraft, type CraftEntry } from '../../../../lib/craft/store';
import { dateFromKey, localDateKey } from '../../../../lib/rituals/lifecycle';
import { useSession } from '../../../../lib/session';

const CAME_UP_HINT: Record<string, string> = {
  tarot: 'The spread, positions, reversals, what struck you',
  oracle: 'The deck, the cards, the words or images',
  lenormand: 'The spread, the cards in order, the pairs that struck you',
  kipper: 'Where the main person lay, and what was near them',
  runes: 'How they fell, which landed face up, reversed (merkstave)',
  tea: 'Shapes near the rim (soon) or the bottom (later), and where the handle points',
  scrying: 'What you saw in the water, mirror, glass or flame',
  pendulum: 'The questions you asked and how it swung',
  ogham: 'The staves drawn, and how they lay',
  other: 'What came up',
};

export default function ReadingForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { entries, ready } = useCraft<unknown>(READINGS);
  const existing = id ? entries.find((e) => e.id === id) ?? null : null;
  if (id && !existing) {
    return (
      <RitualScreen back="Readings">
        <Title>Reading</Title>
        <Body>{ready ? 'This reading couldn’t be found. It may have been deleted on another device.' : 'Opening…'}</Body>
      </RitualScreen>
    );
  }
  // Keyed by the entry, so the form starts from its saved copy and typing is never overwritten.
  return <Form key={existing?.id ?? 'new'} existing={existing} />;
}

function Form({ existing }: { existing: CraftEntry<unknown> | null }) {
  const { session } = useSession();
  const [reading, setReading] = useState<Reading>(() => (existing ? normalizeReading(existing.data) : blankReading(new Date())));
  const [cardQuery, setCardQuery] = useState('');
  const [typedLookBack, setTypedLookBack] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<Reading>) => setReading((r) => ({ ...r, ...patch }));
  const toggleDrawn = (name: string) => set({ drawn: reading.drawn.includes(name) ? reading.drawn.filter((n) => n !== name) : [...reading.drawn, name] });

  const cards = useMemo(() => (cardQuery.trim() ? searchTarot(cardQuery).slice(0, 14) : MAJOR_ARCANA), [cardQuery]);
  const now = new Date();
  const recent = Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));

  const setDate = (date: string) => {
    // Keep the look-back the same distance away when the reading's date moves.
    const from = dateFromKey(reading.date);
    const to = dateFromKey(reading.lookBack);
    const gap = from && to ? Math.round((to.getTime() - from.getTime()) / 86_400_000) : null;
    set({ date, moonPhase: moonForReading(date), ...(gap !== null && !reading.outcome ? { lookBack: lookBackFrom(date, gap) } : {}) });
  };

  const save = async () => {
    const data: Reading = { ...reading, question: reading.question.trim(), cameUp: reading.cameUp.trim(), interpretation: reading.interpretation.trim() };
    if (!data.question && !data.cameUp && !data.drawn.length) {
      tell('Nothing to keep yet', 'Write the question, or what came up.');
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        await updateEntry(READINGS, existing.id, data);
        router.back();
      } else {
        const entry = await addEntry(READINGS, data);
        router.replace(`/rituals/divination/${entry.id}` as Href);
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!(await confirmAction('Delete this reading?', 'It will be removed on every device.', 'Delete'))) return;
    await removeEntry(READINGS, existing.id);
    router.replace('/rituals/divination' as Href);
  };

  return (
    <RitualScreen back={existing ? 'Reading' : 'Readings'}>
      <Title eyebrow={existing ? 'Edit reading' : 'Log a reading'}>{existing ? 'Your reading' : 'What did you ask?'}</Title>

      <View style={ui.gapSmall}>
        <SectionLabel>Method</SectionLabel>
        <Chips>
          {METHODS.map((m) => (
            <Chip key={m.id} label={m.label} selected={reading.method === m.id} onPress={() => set({ method: m.id })} />
          ))}
        </Chips>
      </View>

      <Field label="The question" value={reading.question} onChange={(v) => set({ question: v })} placeholder="What you asked, as you asked it" multiline />

      <View style={ui.gapSmall}>
        <SectionLabel>When?</SectionLabel>
        <Chips>
          {recent.map((day, i) => {
            const key = localDateKey(day);
            return (
              <Chip
                key={key}
                label={i === 0 ? 'Today' : i === 1 ? 'Yesterday' : fullDate(day)?.replace(/, \d{4}$/, '') ?? key}
                selected={reading.date === key}
                onPress={() => setDate(key)}
              />
            );
          })}
          {!recent.some((d) => localDateKey(d) === reading.date) && <Chip label={fullDate(reading.date) ?? reading.date} selected onPress={() => undefined} />}
        </Chips>
        <Body muted>{`Moon: ${reading.moonPhase}`}</Body>
      </View>

      {(reading.method === 'runes' || reading.method === 'ogham' || reading.method === 'tarot' || reading.method === 'lenormand' || reading.method === 'kipper') && (
        <View style={ui.gapSmall}>
          <SectionLabel>{reading.method === 'runes' ? 'Runes drawn' : reading.method === 'ogham' ? 'Staves drawn' : 'Cards drawn'}</SectionLabel>
          {reading.drawn.length > 0 && (
            <>
              <Body muted>In the order drawn. Tap one to take it out.</Body>
              <Chips>
                {reading.drawn.map((n, i) => (
                  <Chip key={n} label={`${i + 1}. ${n}`} selected a11yLabel={`${n}, drawn ${i + 1}. Remove`} onPress={() => toggleDrawn(n)} />
                ))}
              </Chips>
            </>
          )}
          {reading.method === 'tarot' && (
            <>
              <Field label="Find a card" value={cardQuery} onChange={setCardQuery} placeholder="queen cups, 3 swords, tower" />
              {!cardQuery.trim() && <Body muted>The Major Arcana; type to find the minor cards.</Body>}
              <Chips>
                {cards
                  .filter((c) => !reading.drawn.includes(c))
                  .map((c) => (
                    <Chip key={c} label={c} a11yLabel={`Add ${c}`} onPress={() => toggleDrawn(c)} />
                  ))}
              </Chips>
              {cardQuery.trim() !== '' && cards.length === 0 && <Body muted>No card by that name.</Body>}
            </>
          )}
          {reading.method === 'runes' && (
            <Chips>
              {ELDER_FUTHARK.filter((r) => !reading.drawn.includes(r.name)).map((r) => (
                <Chip key={r.name} label={r.name} a11yLabel={`Add ${r.name}, ${r.gloss}`} onPress={() => toggleDrawn(r.name)} />
              ))}
            </Chips>
          )}
          {(reading.method === 'lenormand' || reading.method === 'kipper') && (
            <Chips>
              {(pickList(reading.method) ?? [])
                .filter((n) => !reading.drawn.includes(n))
                .map((n) => (
                  <Chip key={n} label={n} a11yLabel={`Add ${n}`} onPress={() => toggleDrawn(n)} />
                ))}
            </Chips>
          )}
          {reading.method === 'ogham' && (
            <Chips>
              {OGHAM.filter((o) => !reading.drawn.includes(o.name)).map((o) => (
                <Chip key={o.name} label={o.name} a11yLabel={`Add ${o.name}, ${o.gloss}`} onPress={() => toggleDrawn(o.name)} />
              ))}
            </Chips>
          )}
        </View>
      )}

      <Field label="What came up" value={reading.cameUp} onChange={(v) => set({ cameUp: v })} placeholder={CAME_UP_HINT[reading.method]} multiline />
      <Field label="What you make of it" value={reading.interpretation} onChange={(v) => set({ interpretation: v })} placeholder="Your reading of the reading" multiline />

      <View style={ui.gapSmall}>
        <SectionLabel>Come back to it</SectionLabel>
        <Chips>
          {LOOK_BACK_CHOICES.map((c) => {
            const key = lookBackFrom(reading.date, c.days);
            return <Chip key={c.days} label={c.label} selected={reading.lookBack === key} onPress={() => set({ lookBack: key })} />;
          })}
          <Chip label="Not needed" selected={!reading.lookBack} onPress={() => set({ lookBack: '' })} />
        </Chips>
        <Field
          label="Or a date (YYYY-MM-DD)"
          value={typedLookBack}
          onChange={(v) => {
            setTypedLookBack(v);
            if (dateFromKey(v.trim())) set({ lookBack: v.trim() });
          }}
          placeholder="2027-01-01"
        />
        {!!reading.lookBack && <Body muted>{`It will wait for you in Come back to from ${fullDate(reading.lookBack)}.`}</Body>}
      </View>

      {!session && <Notice>Saved on this phone. Sign in to keep your readings with your account.</Notice>}
      <View style={ui.actions}>
        <Button label={saving ? 'Keeping it…' : existing ? 'Save changes' : 'Keep this reading'} onPress={save} disabled={saving} />
        {existing && <Button label="Delete this reading" variant="text" onPress={remove} />}
      </View>
    </RitualScreen>
  );
}
