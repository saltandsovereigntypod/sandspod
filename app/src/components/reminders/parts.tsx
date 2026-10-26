// Small pieces the Reminders screens share: how often, how far ahead, which
// weekdays, and a labelled time.

import { View } from 'react-native';

import { TimeStepper } from '../rituals/TimeStepper';
import { Body, Chip, Chips, ui } from '../rituals/ui';
import { EVERY_CHOICES, LEAD_DAY_CHOICES, leadLabel, repeatLabel, WEEKDAY_NAMES, type Repeat } from '../../lib/reminders/prefs';

/** How often: every few days, or on chosen weekdays. */
export function RepeatPicker({ value, onChange, choices = EVERY_CHOICES }: { value: Repeat; onChange: (next: Repeat) => void; choices?: readonly number[] }) {
  const byWeekday = value.weekdays.length > 0;
  return (
    <View style={ui.gapSmall}>
      <Chips>
        <Chip label="Every few days" selected={!byWeekday} onPress={() => onChange({ ...value, weekdays: [] })} />
        <Chip label="On chosen days" selected={byWeekday} onPress={() => onChange({ ...value, weekdays: byWeekday ? value.weekdays : [0] })} />
      </Chips>
      {byWeekday ? (
        <Chips>
          {WEEKDAY_NAMES.map((name, day) => (
            <Chip
              key={name}
              label={name.slice(0, 3)}
              a11yLabel={name}
              selected={value.weekdays.includes(day)}
              onPress={() => {
                const next = value.weekdays.includes(day) ? value.weekdays.filter((d) => d !== day) : [...value.weekdays, day];
                if (next.length) onChange({ ...value, weekdays: next });
              }}
            />
          ))}
        </Chips>
      ) : (
        <Chips>
          {choices.map((every) => (
            <Chip key={every} label={repeatLabel({ every, weekdays: [] })} selected={value.every === every} onPress={() => onChange({ ...value, every })} />
          ))}
        </Chips>
      )}
    </View>
  );
}

/** How far ahead: any of on the day, the day before, three days, a week. */
export function LeadChips({ value, onChange, choices = LEAD_DAY_CHOICES }: { value: number[]; onChange: (next: number[]) => void; choices?: readonly number[] }) {
  return (
    <Chips>
      {choices.map((days) => (
        <Chip
          key={days}
          label={leadLabel(days)}
          selected={value.includes(days)}
          onPress={() => {
            const next = value.includes(days) ? value.filter((d) => d !== days) : [...value, days];
            if (next.length) onChange(next.sort((a, b) => a - b));
          }}
        />
      ))}
    </Chips>
  );
}

/** A time of day with a word on what it's for. */
export function TimeRow({ label, minutes, onChange }: { label?: string; minutes: number; onChange: (minutes: number) => void }) {
  return (
    <View style={ui.gapSmall}>
      {!!label && <Body muted>{label}</Body>}
      <TimeStepper minutes={minutes} onChange={onChange} />
    </View>
  );
}
