// Reminders → Your calendar → Subscribe in your calendar: a private link to
// a calendar feed (supabase/functions/ical-feed) with your planned rituals,
// coven gatherings, holidays, moon phases and ancestors' days, which Google,
// Apple and other calendars keep up to date. Copy it, open it, choose what it
// carries, or reset it so the old link stops working.

import { useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';

import { Button } from '../Button';
import { Body, Card, SectionLabel, Toggle, confirmAction, tell, ui } from '../rituals/ui';
import { copyText } from '../../lib/copyText';
import { FEED_PART_CHOICES, FEED_PARTS_KEY, FEED_TOKEN_KEY, feedPartsOf, feedPartsValue, feedUrl, googleSubscribeUrl, newFeedToken, webcalUrl } from '../../lib/reminders/calendarFeed';
import { patchMySettings, useMySettings } from '../../lib/settings/store';
import { SUPABASE_URL } from '../../lib/supabase';
import { colors, type } from '../../theme';

export function CalendarFeedSection() {
  const { settings, signedIn } = useMySettings();
  const [busy, setBusy] = useState(false);
  const token = typeof settings?.[FEED_TOKEN_KEY] === 'string' ? (settings[FEED_TOKEN_KEY] as string) : '';
  const parts = feedPartsOf(settings?.[FEED_PARTS_KEY]);
  const url = token ? feedUrl(SUPABASE_URL, token) : '';

  const save = async (changes: Record<string, string>) => {
    setBusy(true);
    try {
      await patchMySettings(changes);
    } catch {
      tell('Couldn’t save', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!signedIn) {
    return (
      <View style={ui.gapSmall}>
        <SectionLabel>Subscribe in your calendar</SectionLabel>
        <Card>
          <Body muted>Sign in to make a private calendar link that Google, Apple and other calendars keep up to date.</Body>
        </Card>
      </View>
    );
  }

  return (
    <View style={ui.gapSmall}>
      <SectionLabel>Subscribe in your calendar</SectionLabel>
      <Card>
        <Body muted>
          A private link your calendar app checks every few hours, so your planned rituals, coven gatherings, holidays, moon phases and ancestors’ days appear there and stay up
          to date. Anyone with the link can see these, so keep it to yourself.
        </Body>
        {!token ? (
          <Button label={busy ? 'Making the link…' : 'Make my calendar link'} disabled={busy} onPress={() => void save({ [FEED_TOKEN_KEY]: newFeedToken() })} />
        ) : (
          <>
            <Text selectable style={[type.caption, { color: colors.parchment }]}>
              {url}
            </Text>
            <View style={ui.actions}>
              <Button
                label="Copy the link"
                onPress={async () => {
                  if (await copyText(url)) tell('Copied', 'In Google Calendar choose Other calendars, then From URL, and paste it. In Apple Calendar choose File, then New Calendar Subscription.');
                  else tell('Couldn’t copy', url);
                }}
              />
              <Button label="Open in your calendar" variant="outline" onPress={() => void Linking.openURL(webcalUrl(url)).catch(() => tell('Couldn’t open it', 'Copy the link and add it in your calendar app instead.'))} />
              {Platform.OS === 'web' && <Button label="Add to Google Calendar" variant="outline" onPress={() => void Linking.openURL(googleSubscribeUrl(url))} />}
            </View>
            <Body muted>Calendars refresh a subscription on their own schedule: Apple’s every few hours, Google’s up to a day.</Body>
          </>
        )}
      </Card>
      {!!token && (
        <Card>
          <Text style={type.cardTitle}>What it carries</Text>
          {FEED_PART_CHOICES.map((p) => (
            <Toggle
              key={p.id}
              label={p.label}
              detail={p.detail}
              value={parts.includes(p.id)}
              onChange={(on) => {
                const next = on ? [...parts, p.id] : parts.filter((x) => x !== p.id);
                if (next.length) void save({ [FEED_PARTS_KEY]: feedPartsValue(next) });
              }}
            />
          ))}
          <View style={ui.actions}>
            <Button
              label="Reset the link"
              variant="outline"
              disabled={busy}
              onPress={async () => {
                if (await confirmAction('Reset the link?', 'The old link stops working, so calendars subscribed to it stop updating. Subscribe again with the new one.', 'Reset')) {
                  void save({ [FEED_TOKEN_KEY]: newFeedToken() });
                }
              }}
            />
            <Button
              label="Turn the link off"
              variant="text"
              disabled={busy}
              onPress={async () => {
                if (await confirmAction('Turn the link off?', 'Calendars subscribed to it stop updating.', 'Turn off')) void save({ [FEED_TOKEN_KEY]: '' });
              }}
            />
          </View>
        </Card>
      )}
    </View>
  );
}
