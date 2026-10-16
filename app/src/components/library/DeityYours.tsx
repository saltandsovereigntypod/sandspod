import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../Button';
import { Card } from '../more/ui';
import type { LibraryEntry } from '../../lib/library';
import { TRADITIONAL_LIBRARY } from '../../lib/library/traditionalData';
import { deitiesValue, findDeity, LEVELS, MY_DEITIES_KEY, myDeities, withDeity } from '../../lib/patron/mine';
import { useMySettings } from '../../lib/settings/store';
import { colors, fonts, type } from '../../theme';

/** On a deity's Library page: where they stand in your practice, a shrine for them, and the patron guide. */
export function DeityYours({ entry }: { entry: LibraryEntry }) {
  const { settings } = useMySettings();
  const key = entry.id.split(':').pop() ?? '';
  const mine = findDeity(myDeities(settings), key, entry.name);
  const level = mine ? LEVELS.find((l) => l.value === mine.level) : null;

  return (
    <Card tone={mine?.level === 'patron' ? 'gold' : undefined}>
      {mine && level ? (
        <View style={styles.head}>
          <Text style={styles.badge}>{mine.level === 'patron' ? 'Your patron' : level.label}</Text>
          {!!mine.since && <Text style={type.caption}>{`Since ${mine.since}`}</Text>}
        </View>
      ) : (
        <Text style={type.body}>{`Drawn to ${entry.name}? You can keep them in My deities, as someone you’re exploring, dedicated to, or your patron.`}</Text>
      )}
      <View style={styles.row}>
        <Button
          label={`Set a shrine for ${entry.name}`}
          variant="outline"
          accessibilityHint="Opens a starter altar with their statue, colours, plants and stones"
          onPress={() => router.push({ pathname: '/altar/[altarId]', params: { altarId: 'shrine', deity: key } } as Href)}
        />
        <Button label={mine ? 'My deities' : 'Add to My deities'} variant="text" onPress={() => router.push('/more/settings/deities' as Href)} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { gap: 2 },
  badge: { fontFamily: fonts.bodySemi, fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.gold },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
});

/** After a dedication rite: keep the deity in My deities as Dedicated (or say it's already there). */
export function KeepDedicated({ deityRef, since }: { deityRef: string; since: string }) {
  const { settings, save } = useMySettings();
  const key = deityRef.split('/').pop() ?? '';
  const record = (TRADITIONAL_LIBRARY as unknown as Record<string, Record<string, Record<string, unknown>>>).deity?.[key];
  const name = String(record?.DisplayName ?? key);
  const list = myDeities(settings);
  const mine = findDeity(list, key, name);
  if (!key || !settings) return null;
  if (mine && mine.level !== 'exploring') {
    return <Text style={type.caption}>{`${name} is in My deities as ${mine.level === 'patron' ? 'your patron' : 'dedicated'}.`}</Text>;
  }
  return (
    <Button
      label={`Keep ${name} in My deities`}
      variant="outline"
      accessibilityHint="Adds them to Settings → My deities as Dedicated, from the day of your dedication"
      onPress={() => void save({ ...settings, [MY_DEITIES_KEY]: deitiesValue(withDeity(list, { key, name, level: 'dedicated', since: mine?.since || since.slice(0, 10), ...(mine?.note ? { note: mine.note } : {}) })) })}
    />
  );
}
