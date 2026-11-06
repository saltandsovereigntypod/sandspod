// Choosing a sit: its length (or open-ended), minutes to settle in and to
// come back, and its bells. Shared by Meditation, "Meditate here" at the
// altar and Sit together. The last plan is remembered on this device.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { cleanPlan, DEFAULT_PLAN, INTERVAL_CHOICES, LENGTHS, SETTLE_CHOICES, type SitPlan } from '../../lib/meditation/timer';
import { Body, Chip, Chips, Field, Toggle, ui } from '../rituals/ui';

const KEY = 'meditation.plan';

/** The plan last used on this device. */
export function useLastPlan(): [SitPlan, (p: SitPlan) => void] {
  const [plan, setPlan] = useState<SitPlan>(DEFAULT_PLAN);
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setPlan(cleanPlan(JSON.parse(raw))))
      .catch(() => {});
  }, []);
  const change = (p: SitPlan) => {
    setPlan(p);
    void AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
  };
  return [plan, change];
}

/** `minMinutes`: the shortest it may be (a recorded voice needs room); shorter lengths aren't offered. */
export function PlanForm({ plan, onChange, brief, minMinutes = 0 }: { plan: SitPlan; onChange: (p: SitPlan) => void; brief?: boolean; minMinutes?: number }) {
  const [custom, setCustom] = useState(plan.minutes !== null && !(LENGTHS as readonly number[]).includes(plan.minutes) ? String(plan.minutes) : '');
  const set = (patch: Partial<SitPlan>) => onChange({ ...plan, ...patch });
  const pick = (minutes: number | null) => {
    setCustom('');
    set({ minutes });
  };
  return (
    <View style={ui.gap}>
      <Body muted>How long</Body>
      <Chips>
        {LENGTHS.filter((m) => m >= minMinutes).map((m) => (
          <Chip key={m} label={`${m} min`} selected={plan.minutes === m && !custom} onPress={() => pick(m)} />
        ))}
        <Chip label="Open-ended" selected={plan.minutes === null} onPress={() => pick(null)} />
      </Chips>
      <Field
        label="Or your own length, in minutes"
        value={custom}
        keyboardType="numeric"
        onChange={(t) => {
          setCustom(t);
          const n = cleanPlan({ minutes: t }).minutes;
          if (t.trim() && n !== null && String(n) === t.trim() && n >= minMinutes) set({ minutes: n });
        }}
      />
      {!brief && (
        <>
          <Body muted>Settle in first</Body>
          <Chips>
            {SETTLE_CHOICES.map((m) => (
              <Chip key={m} label={m ? `${m} min` : 'None'} selected={plan.settle === m} onPress={() => set({ settle: m })} />
            ))}
          </Chips>
          <Body muted>Come back slowly after</Body>
          <Chips>
            {SETTLE_CHOICES.map((m) => (
              <Chip key={m} label={m ? `${m} min` : 'None'} selected={plan.warm === m} onPress={() => set({ warm: m })} />
            ))}
          </Chips>
        </>
      )}
      <Toggle label="A bell to begin" value={plan.startBell} onChange={(startBell) => set({ startBell })} />
      <Toggle label="Three bells to end" value={plan.endBell} onChange={(endBell) => set({ endBell })} />
      <Body muted>A bell along the way</Body>
      <Chips>
        {INTERVAL_CHOICES.map((m) => (
          <Chip key={m} label={m ? `Every ${m} min` : 'None'} selected={plan.every === m} onPress={() => set({ every: m })} />
        ))}
      </Chips>
      <Toggle
        label="Vibrate instead of a bell"
        detail="The bell rings even with the silent switch on, since you chose it. Candle sounds and Vibration in Accessibility still apply."
        value={plan.signal === 'vibrate'}
        onChange={(on) => set({ signal: on ? 'vibrate' : 'bell' })}
      />
    </View>
  );
}
