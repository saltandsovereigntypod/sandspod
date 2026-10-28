// Notifications & reminders → Tending: plants (each its own way if you like), altars,
// offerings, crystals (with how to cleanse each safely) and candles, each on
// its own schedule.

import { useState } from 'react';
import { View } from 'react-native';

import { Body, Card, Chip, Chips, SectionLabel, Toggle, ui } from '../rituals/ui';
import { RepeatPicker, TimeRow } from './parts';
import { altarPhrase } from '../../lib/altar/offerings';
import { crystalAdvice } from '../../lib/reminders/plan';
import { CRYSTAL_CADENCES, NEAR_END_CHOICES, repeatLabel, timeLabel, withChange, type PlantPrefs, type ReminderPrefs } from '../../lib/reminders/prefs';
import type { TendingSources } from '../../lib/reminders/sources';

type Props = { prefs: ReminderPrefs; update: (next: ReminderPrefs) => void; sources: TendingSources };

export function TendingSection({ prefs, update, sources }: Props) {
  const t = prefs.tending;
  const [plantOpen, setPlantOpen] = useState<string | null>(null);
  const set = (path: string, value: unknown) => update(withChange(prefs, `tending.${path}`, value));
  const setPlant = (id: string, change: PlantPrefs) => set('plants.per', { ...t.plants.per, [id]: { ...t.plants.per[id], ...change } });

  return (
    <>
      <View style={ui.gapSmall}>
        <SectionLabel>Plants</SectionLabel>
        <Card>
          <Toggle label="Remind me to water my plants" detail="The potted plants on your altars. A plant taken off its altar stops asking." value={t.plants.on} onChange={(on) => set('plants.on', on)} />
          {t.plants.on && (
            <>
              <Chips>
                <Chip label="When it’s thirsty" selected={t.plants.mode === 'thirsty'} onPress={() => set('plants.mode', 'thirsty')} />
                <Chip label="On a schedule" selected={t.plants.mode === 'schedule'} onPress={() => set('plants.mode', 'schedule')} />
              </Chips>
              <Body muted>
                {t.plants.mode === 'thirsty'
                  ? 'Each plant asks on the day it comes due, by how often you water it and when you last did. Mark it watered on the altar and it waits for its next day.'
                  : 'On a fixed schedule, whether or not it was watered lately.'}
              </Body>
              {t.plants.mode === 'schedule' && <RepeatPicker value={t.plants} onChange={(r) => update(withChange(withChange(prefs, 'tending.plants.every', r.every), 'tending.plants.weekdays', r.weekdays))} />}
              <TimeRow minutes={t.plants.at} onChange={(at) => set('plants.at', at)} />
              {sources.plants.map((plant) => {
                const own = t.plants.per[plant.id] ?? {};
                const mode = own.mode ?? t.plants.mode;
                const open = plantOpen === plant.id;
                const detail =
                  own.on === false
                    ? 'No reminders'
                    : `${mode === 'thirsty' ? `When thirsty (every ${plant.waterEvery} ${plant.waterEvery === 1 ? 'day' : 'days'})` : repeatLabel({ every: own.every ?? t.plants.every, weekdays: own.weekdays ?? t.plants.weekdays })} at ${timeLabel(own.at ?? t.plants.at)} · ${altarPhrase(plant.altarName)}`;
                return (
                  <View key={plant.id} style={ui.gapSmall}>
                    <Toggle label={plant.who[0].toUpperCase() + plant.who.slice(1)} detail={detail} value={own.on !== false} onChange={(on) => setPlant(plant.id, { on })} />
                    {own.on !== false && (
                      <Chips>
                        <Chip label={open ? 'Done' : 'Its own way ›'} onPress={() => setPlantOpen(open ? null : plant.id)} a11yLabel={`Reminders for ${plant.who}`} />
                        {(own.mode || own.every || own.weekdays || own.at != null) && (
                          <Chip label="As the others" onPress={() => set('plants.per', { ...t.plants.per, [plant.id]: { on: true } })} />
                        )}
                      </Chips>
                    )}
                    {open && own.on !== false && (
                      <>
                        <Chips>
                          <Chip label="When it’s thirsty" selected={mode === 'thirsty'} onPress={() => setPlant(plant.id, { mode: 'thirsty' })} />
                          <Chip label="On a schedule" selected={mode === 'schedule'} onPress={() => setPlant(plant.id, { mode: 'schedule' })} />
                        </Chips>
                        {mode === 'schedule' && (
                          <RepeatPicker
                            value={{ every: own.every ?? t.plants.every, weekdays: own.weekdays ?? t.plants.weekdays }}
                            onChange={(r) => setPlant(plant.id, { every: r.every, weekdays: r.weekdays })}
                          />
                        )}
                        <TimeRow minutes={own.at ?? t.plants.at} onChange={(at) => setPlant(plant.id, { at })} />
                      </>
                    )}
                  </View>
                );
              })}
              {!sources.plants.length && <Body muted>No potted plants on your altars yet. Place one from the cabinet’s Plants and it will come here.</Body>}
            </>
          )}
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Altars</SectionLabel>
        <Card>
          <Toggle label="Remind me to tend my altar" detail="Dust it, refresh its water, light what wants lighting" value={t.altars.on} onChange={(on) => set('altars.on', on)} />
          {t.altars.on && (
            <>
              <RepeatPicker value={t.altars} onChange={(r) => update(withChange(withChange(prefs, 'tending.altars.every', r.every), 'tending.altars.weekdays', r.weekdays))} />
              <TimeRow minutes={t.altars.at} onChange={(at) => set('altars.at', at)} />
              {sources.altars.length > 1 && (
                <>
                  <Body muted>Which altars (none chosen means all of them)</Body>
                  <Chips>
                    {sources.altars.map((a) => (
                      <Chip
                        key={a.id}
                        label={a.name || 'Unnamed altar'}
                        selected={t.altars.ids.includes(a.id)}
                        onPress={() => set('altars.ids', t.altars.ids.includes(a.id) ? t.altars.ids.filter((id) => id !== a.id) : [...t.altars.ids, a.id])}
                      />
                    ))}
                  </Chips>
                </>
              )}
            </>
          )}
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Offerings</SectionLabel>
        <Card>
          <Toggle label="When an offering is going over" detail="Water drying, flowers wilting, bread going stale. Offerings you’ve chosen to leave as they are won’t ask." value={t.offerings.on} onChange={(on) => set('offerings.on', on)} />
          {t.offerings.on && (
            <>
              <Chips>
                <Chip label="On the day" selected={t.offerings.lead === 0} onPress={() => set('offerings.lead', 0)} />
                <Chip label="The day before" selected={t.offerings.lead === 1} onPress={() => set('offerings.lead', 1)} />
              </Chips>
              <TimeRow minutes={t.offerings.at} onChange={(at) => set('offerings.at', at)} />
            </>
          )}
          <Toggle label="A regular refresh" detail="Fresh water, a flower or a little food, on a rhythm you choose" value={t.offerings.refresh} onChange={(on) => set('offerings.refresh', on)} />
          {t.offerings.refresh && (
            <>
              <RepeatPicker value={t.offerings} onChange={(r) => update(withChange(withChange(prefs, 'tending.offerings.every', r.every), 'tending.offerings.weekdays', r.weekdays))} />
              <TimeRow minutes={t.offerings.refreshAt} onChange={(at) => set('offerings.refreshAt', at)} />
            </>
          )}
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Crystals</SectionLabel>
        <Card>
          <Toggle label="Remind me to cleanse and charge my crystals" detail="With how to care for each: no water for soft stones, no sun for those that fade" value={t.crystals.on} onChange={(on) => set('crystals.on', on)} />
          {t.crystals.on && (
            <>
              <Chips>
                {CRYSTAL_CADENCES.map((c) => (
                  <Chip key={c.value} label={c.label} selected={t.crystals.cadence === c.value} onPress={() => set('crystals.cadence', c.value)} />
                ))}
              </Chips>
              {t.crystals.cadence === 'weeks' && (
                <Chips>
                  {[1, 2, 4, 6, 8].map((w) => (
                    <Chip key={w} label={w === 1 ? 'Every week' : `Every ${w} weeks`} selected={t.crystals.weeks === w} onPress={() => set('crystals.weeks', w)} />
                  ))}
                </Chips>
              )}
              <TimeRow minutes={t.crystals.at} onChange={(at) => set('crystals.at', at)} />
              {sources.crystals.map((c) => (
                <Toggle
                  key={c.id}
                  label={c.name}
                  detail={`${c.where} · ${crystalAdvice(c, t.crystals.cadence !== 'weeks').replace(/^[^:]+: /, '')}`}
                  value={!t.crystals.off.includes(c.id)}
                  onChange={(on) => set('crystals.off', on ? t.crystals.off.filter((id) => id !== c.id) : [...t.crystals.off, c.id])}
                />
              ))}
              {!sources.crystals.length && <Body muted>Your stones from My stones and the crystals on your altars will be listed here, each with how to cleanse it safely.</Body>}
            </>
          )}
        </Card>
      </View>

      <View style={ui.gapSmall}>
        <SectionLabel>Candles</SectionLabel>
        <Card>
          <Toggle label="When a candle is nearly burned down" detail="A candle burning on one of your altars in the app, so you can be there at the end" value={t.candles.nearEnd} onChange={(on) => set('candles.nearEnd', on)} />
          {t.candles.nearEnd && (
            <Chips>
              {NEAR_END_CHOICES.map((m) => (
                <Chip key={m} label={m === 60 ? 'An hour before' : `${m} minutes before`} selected={t.candles.nearEndMinutes === m} onPress={() => set('candles.nearEndMinutes', m)} />
              ))}
            </Chips>
          )}
          <Toggle label="To light a candle working again" detail="A candle you’ve burned part-way, a day at a time (a novena or a seven-day candle)" value={t.candles.relight} onChange={(on) => set('candles.relight', on)} />
          {t.candles.relight && <TimeRow minutes={t.candles.relightAt} onChange={(at) => set('candles.relightAt', at)} />}
          <Toggle label="A daily candle practice" detail="Each day, a nudge to light a candle and sit with its flame" value={t.candles.daily} onChange={(on) => set('candles.daily', on)} />
          {t.candles.daily && <TimeRow minutes={t.candles.dailyAt} onChange={(at) => set('candles.dailyAt', at)} />}
        </Card>
      </View>
    </>
  );
}
