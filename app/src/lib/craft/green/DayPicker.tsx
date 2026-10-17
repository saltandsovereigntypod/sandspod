// Choosing a day for a garden entry: the last week as chips, or any date typed in.

import { useState } from 'react';
import { View } from 'react-native';

import { Body, Chip, Chips, Field, ui } from '../../../components/rituals/ui';
import { fullDate } from '../../calendar';
import { dateFromKey, localDateKey } from '../../rituals/lifecycle';

export function DayPicker({ label, value, onChange, allowNone }: { label: string; value: string | null; onChange: (key: string | null) => void; allowNone?: boolean }) {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
  const keys = days.map(localDateKey);
  const [typed, setTyped] = useState(value && !keys.includes(value) ? value : '');
  const typedValid = !!dateFromKey(typed.trim()) && typed.trim() <= localDateKey(now);

  return (
    <View style={ui.gapSmall}>
      <Body muted>{label}</Body>
      <Chips>
        {days.map((day, i) => (
          <Chip
            key={keys[i]}
            label={i === 0 ? 'Today' : i === 1 ? 'Yesterday' : fullDate(day)?.replace(/, \d{4}$/, '') ?? keys[i]}
            selected={value === keys[i]}
            onPress={() => {
              setTyped('');
              onChange(keys[i]);
            }}
          />
        ))}
        {allowNone && <Chip label="Not sure" selected={value === null} onPress={() => onChange(null)} />}
      </Chips>
      <Field
        label="Or another date (YYYY-MM-DD)"
        value={typed}
        onChange={(text) => {
          setTyped(text);
          const key = text.trim();
          if (dateFromKey(key) && key <= localDateKey(now)) onChange(key);
        }}
        placeholder="e.g. 2026-04-21"
      />
      {!!typed.trim() && !typedValid && <Body muted>Write the date as year-month-day, and not in the future.</Body>}
    </View>
  );
}
