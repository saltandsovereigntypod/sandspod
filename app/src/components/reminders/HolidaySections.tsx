// Notifications & reminders → Holidays: holiday reminders on or off, when, how far ahead, and
// each calendar; and a calendar's own page, with every holiday in it to pick
// or leave, searchable, all or none at once, and each holiday's own timing.

import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Body, Card, Chip, Chips, Field, List, Row, SectionLabel, Toggle, ui } from '../rituals/ui';
import { LeadChips, TimeRow } from './parts';
import { holidayCatalog } from '../../lib/reminders/holidays';
import { calendarOn, holidayOn, leadsLabel, leadsOf, setCalendar, setHoliday, timeLabel, withChange, type ReminderPrefs } from '../../lib/reminders/prefs';
import { usePlace } from '../../lib/location';

type Props = { prefs: ReminderPrefs; update: (next: ReminderPrefs) => void; settings: Record<string, unknown> | null; open: (section: string) => void };

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function useCatalog(settings: Props['settings']) {
  const place = usePlace();
  return useMemo(() => holidayCatalog(settings, new Date(), place ? { latitude: place.latitude, longitude: place.longitude } : null), [settings, place]);
}

export function HolidaysSection({ prefs, update, settings, open }: Props) {
  const catalog = useCatalog(settings);
  const h = prefs.holidays;
  return (
    <>
      <Card>
        <Toggle
          label="Remind me of my holidays"
          detail="From the calendars you keep and show in Settings → Calendars & holidays, Hekate’s Deipnon, and your deities’ sacred days"
          value={h.on}
          onChange={(on) => update(withChange(prefs, 'holidays.on', on))}
        />
      </Card>
      {h.on && (
        <>
          <View style={ui.gapSmall}>
            <SectionLabel>How far ahead</SectionLabel>
            <Body muted>Choose any of these. A calendar, or a single holiday, can have its own.</Body>
            <LeadChips value={h.leads} onChange={(leads) => update(withChange(prefs, 'holidays.leads', leads))} />
          </View>
          <View style={ui.gapSmall}>
            <SectionLabel>At</SectionLabel>
            <TimeRow minutes={h.at} onChange={(at) => update(withChange(prefs, 'holidays.at', at))} />
          </View>
          <View style={ui.gapSmall}>
            <SectionLabel>Calendars</SectionLabel>
            {catalog.length ? (
              <List>
                {catalog.map((group, i) => {
                  const on = calendarOn(prefs, group.id);
                  const chosen = group.items.filter((item) => holidayOn(prefs, group.id, item.baseId)).length;
                  const leads = h.calendars[group.id]?.leads;
                  return (
                    <Row
                      key={group.id}
                      icon="calendar"
                      title={group.name}
                      detail={on ? `${chosen} of ${group.items.length} · ${leadsLabel(leads ?? h.leads)}` : 'Off'}
                      onPress={() => open(`holidays:${group.id}`)}
                      last={i === catalog.length - 1}
                    />
                  );
                })}
              </List>
            ) : (
              <Body muted>No calendars yet. Choose the ones you keep in Settings → Calendars & holidays, and they’ll come here.</Body>
            )}
          </View>
        </>
      )}
    </>
  );
}

export function HolidayCalendarSection({ prefs, update, settings, group: groupId }: Props & { group: string }) {
  const catalog = useCatalog(settings);
  const group = catalog.find((g) => g.id === groupId);
  const [query, setQuery] = useState('');
  const [timing, setTiming] = useState<string | null>(null);
  if (!group) return <Body muted>This calendar isn’t among yours any more.</Body>;
  const on = calendarOn(prefs, group.id);
  const ownLeads = prefs.holidays.calendars[group.id]?.leads;
  const ids = group.items.map((i) => i.baseId);
  const shown = query.trim() ? group.items.filter((i) => fold(i.name).includes(fold(query.trim()))) : group.items;
  return (
    <>
      <Body muted>{group.detail}</Body>
      <Card>
        <Toggle label={`Remind me of the ${group.name}`} value={on && prefs.holidays.on} onChange={(next) => update(setCalendar(withChange(prefs, 'holidays.on', prefs.holidays.on || next), group.id, [], next))} />
      </Card>
      {on && (
        <View style={ui.gapSmall}>
          <SectionLabel>How far ahead</SectionLabel>
          <Chips>
            <Chip label={`As all calendars (${leadsLabel(prefs.holidays.leads)})`} selected={!ownLeads} onPress={() => update(withChange(prefs, `holidays.calendars.${group.id}`, { on: true }))} />
          </Chips>
          <LeadChips value={ownLeads ?? []} onChange={(leads) => update(withChange(prefs, `holidays.calendars.${group.id}`, { on: true, leads }))} />
          <Body muted>At {timeLabel(prefs.holidays.at)}, as all holiday reminders.</Body>
        </View>
      )}
      <View style={ui.gapSmall}>
        <SectionLabel>{`Holidays (${group.items.filter((i) => holidayOn(prefs, group.id, i.baseId)).length} of ${group.items.length})`}</SectionLabel>
        <Chips>
          <Chip label="All" onPress={() => update(setCalendar(prefs, group.id, ids, true))} />
          <Chip label="None" onPress={() => update(setCalendar(prefs, group.id, ids, false))} />
        </Chips>
        {group.items.length > 8 && <Field label="Find a holiday" value={query} onChange={setQuery} placeholder="e.g. Samhain" />}
        <Card>
          {shown.map((item) => {
            const itemOn = holidayOn(prefs, group.id, item.baseId);
            const own = prefs.holidays.leadsFor[item.baseId];
            return (
              <View key={item.baseId} style={ui.gapSmall}>
                <Toggle
                  label={item.name}
                  detail={`Next: ${item.next.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}${item.recurs === 'monthly' ? ' · every month' : ''}${itemOn ? ` · ${leadsLabel(leadsOf(prefs, group.id, item.baseId))}` : ''}`}
                  value={itemOn}
                  onChange={(next) => update(setHoliday(prefs, group.id, item.baseId, next, ids))}
                />
                {itemOn && (
                  <Chips>
                    <Chip label={timing === item.baseId ? 'Done' : own ? 'Its own timing ›' : 'Change its timing ›'} onPress={() => setTiming(timing === item.baseId ? null : item.baseId)} a11yLabel={`Timing for ${item.name}`} />
                  </Chips>
                )}
                {itemOn && timing === item.baseId && (
                  <>
                    <Chips>
                      <Chip
                        label="As its calendar"
                        selected={!own}
                        onPress={() => {
                          const leadsFor = { ...prefs.holidays.leadsFor };
                          delete leadsFor[item.baseId];
                          update(withChange(prefs, 'holidays.leadsFor', leadsFor));
                        }}
                      />
                    </Chips>
                    <LeadChips value={own ?? []} onChange={(leads) => update(withChange(prefs, 'holidays.leadsFor', { ...prefs.holidays.leadsFor, [item.baseId]: leads }))} />
                  </>
                )}
              </View>
            );
          })}
          {!shown.length && <Body muted>Nothing by that name in this calendar.</Body>}
        </Card>
      </View>
    </>
  );
}
