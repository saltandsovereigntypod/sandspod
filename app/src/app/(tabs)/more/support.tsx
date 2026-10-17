import { useMemo, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, Chips, MoreScreen, moreStyles, Paragraphs, Section } from '../../../components/more/ui';
import { useAccessibleText } from '../../../lib/accessibility/store';
import {
  REGION_NAMES,
  regionFromLocale,
  smsUrl,
  supportSections,
  telUrl,
  textTarget,
  textWords,
  type SupportLine,
  type SupportRegion,
} from '../../../lib/support/lines';
import { colors, fonts, type } from '../../../theme';

type RegionChoice = SupportRegion | 'none';

const REGION_OPTIONS: readonly { value: RegionChoice; label: string }[] = [
  { value: 'US', label: 'US' },
  { value: 'GB', label: 'UK' },
  { value: 'IE', label: 'Ireland' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'none', label: 'Elsewhere' },
];

/** The device's region, read on the device; nothing is sent anywhere. */
function deviceRegion(): SupportRegion | null {
  try {
    return regionFromLocale(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return null;
  }
}

async function open(url: string, fallback: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Couldn’t open that', fallback);
  }
}

export default function Support() {
  const [region, setRegion] = useState<RegionChoice>(() => deviceRegion() ?? 'none');
  const sections = useMemo(() => supportSections(region === 'none' ? null : region), [region]);

  return (
    <MoreScreen title="Support" eyebrow="You don’t have to hold it alone" back="/more" backLabel="Back to More">
      <Card tone="gold">
        <Paragraphs
          items={[
            'The practices in this app can stir deep things: grief, old wounds, the ones we’ve lost. That’s part of the work, and it can still be a lot to carry. Reaching out to another person is a strong thing to do.',
            'If you’re in danger now, call your local emergency number (911, 999, 112, 000).',
          ]}
          style={moreStyles.bodyCream}
        />
      </Card>

      <Section label="Show lines for">
        <Chips label="Where you are" options={REGION_OPTIONS} value={region} onChange={setRegion} />
        <Text style={type.caption}>
          {region === 'none'
            ? 'Find A Helpline, under Crisis, lists free lines in more than 175 countries.'
            : `${REGION_NAMES[region]} lines come first. Others follow.`}
        </Text>
      </Section>

      {sections.map((section) => (
        <Section key={section.key} label={section.label}>
          <Text style={type.caption}>{section.blurb}</Text>
          {section.lines.map((line) => (
            <LineCard key={`${line.name}-${line.region.join('')}`} line={line} />
          ))}
        </Section>
      ))}

      <Text style={type.caption}>
        Each line was checked against its own website in October 2026. Numbers sometimes change: if one doesn’t connect, its website will
        have the latest. The buttons open your phone or browser; this app doesn’t send anything.
      </Text>
    </MoreScreen>
  );
}

function LineCard({ line }: { line: SupportLine }) {
  const t = useAccessibleText();
  const target = textTarget(line);
  const texting = textWords(line);
  const where = line.region.map((r) => REGION_NAMES[r]).join(' & ');
  const numberWords = line.number ? `Call ${line.number}` : null;
  const reach = [numberWords, texting].filter(Boolean).join(' · ');

  return (
    <Card>
      <View style={styles.head}>
        <Text style={type.cardTitle}>{line.name}</Text>
        <Text style={type.caption}>{[where, line.hours].filter(Boolean).join(' · ')}</Text>
      </View>

      {!!reach && (
        <Text selectable style={t(styles.number)} accessibilityLabel={reach}>
          {reach}
        </Text>
      )}
      {line.alsoCall?.map((also) => (
        <Text key={also.number} selectable style={type.body}>
          {`${also.label}: ${also.number}`}
        </Text>
      ))}
      {!!line.note && <Text style={type.body}>{line.note}</Text>}
      <Text selectable style={[type.caption, styles.url]}>
        {line.url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '')}
      </Text>

      <View style={moreStyles.rowGap}>
        {line.number && line.how.includes('call') && (
          <Button
            label="Call"
            variant="pill"
            accessibilityHint={`Calls ${line.name} on ${line.number}`}
            onPress={() => void open(telUrl(line.number!), `You can dial ${line.number} yourself.`)}
          />
        )}
        {line.alsoCall?.map((also) => (
          <Button
            key={also.number}
            label={`Call ${also.label}`}
            variant="outline"
            accessibilityHint={`Calls ${line.name} ${also.label} on ${also.number}`}
            onPress={() => void open(telUrl(also.number), `You can dial ${also.number} yourself.`)}
          />
        ))}
        {target && (
          <Button
            label="Text"
            variant="pill"
            accessibilityHint={`Opens Messages to ${texting}`}
            onPress={() => void open(smsUrl(target, line.keyword, Platform.OS), `${texting} from your messages app.`)}
          />
        )}
        <Button
          label="Website"
          variant="outline"
          accessibilityHint={`Opens ${line.url}`}
          onPress={() => void open(line.url, `The address is ${line.url}`)}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { gap: 4 },
  number: { fontFamily: fonts.bodySemi, fontSize: 18, lineHeight: 24, color: colors.gold },
  url: { color: colors.parchment },
});
