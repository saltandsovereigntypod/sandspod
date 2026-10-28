import { Text } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, Chips, MenuList, MoreScreen, Section, SwitchRow } from '../../../components/more/ui';
import { TEXT_SCALES, type AccessibilityPrefs } from '../../../lib/accessibility/prefs';
import { resetAccessibility, updateAccessibility, useAccessibility } from '../../../lib/accessibility/store';
import { useSession } from '../../../lib/session';
import { type } from '../../../theme';

const SCALE_OPTIONS = TEXT_SCALES.map((scale) => ({ value: String(scale), label: `${Math.round(scale * 100)}%` }));

type Toggle = { key: keyof AccessibilityPrefs; label: string; detail: string };

const READING: Toggle[] = [
  { key: 'lineSpacing', label: 'Line spacing', detail: 'More room between lines of text.' },
  { key: 'letterSpacing', label: 'Letter spacing', detail: 'A little more room between letters.' },
  { key: 'readableFont', label: 'Readable font', detail: 'Your phone’s plain system font instead of the decorative ones.' },
];

const ALTAR: Toggle[] = [
  { key: 'candleSounds', label: 'Candle sounds', detail: 'A match as you light, and quiet crackles while candles burn; herbs pop and oil sputters. Silent when your ring switch is off.' },
  { key: 'haptics', label: 'Vibration', detail: 'A soft tap as a candle is lit or snuffed, and as dressed candles pop.' },
  { key: 'tiltDepth', label: 'Tilt depth', detail: 'The altar shifts a little as you tilt your phone, and flames lean against it.' },
];

const DISPLAY: Toggle[] = [
  { key: 'highContrast', label: 'High contrast', detail: 'Brighter text against the dark background.' },
  { key: 'reduceMotion', label: 'Reduce motion', detail: 'Steady candle flames, and screens and sheets appear without sliding.' },
];

/**
 * The website's Accessibility Options (js/accessibility.js), kept on this
 * device for the guest or for each account, as the website keeps them.
 */
export default function AccessibilityScreen() {
  const prefs = useAccessibility();
  const { session } = useSession();

  const toggles = (rows: Toggle[]) => (
    <MenuList>
      {rows.map((row, index) => (
        <SwitchRow
          key={row.key}
          label={row.label}
          detail={row.detail}
          value={prefs[row.key] === true}
          onChange={(on) => updateAccessibility({ [row.key]: on })}
          last={index === rows.length - 1}
        />
      ))}
    </MenuList>
  );

  return (
    <MoreScreen title="Accessibility" eyebrow="Settings" back="/more/settings" backLabel="Back to Settings">
      <Section label="Text size">
        <Chips
          label="Text size"
          options={SCALE_OPTIONS}
          value={String(prefs.textScale)}
          onChange={(value) => updateAccessibility({ textScale: Number(value) })}
        />
        <Card>
          <Text style={type.cardTitle}>Rosemary</Text>
          <Text style={type.body}>For remembrance, protection and clarity. Burn a sprig before study, or keep it by the door.</Text>
          <Text style={type.caption}>Your phone’s own text size setting still applies on top of this.</Text>
        </Card>
      </Section>
      <Section label="Reading">{toggles(READING)}</Section>
      <Section label="Display">{toggles(DISPLAY)}</Section>
      <Section label="The altar">{toggles(ALTAR)}</Section>
      <Button label="Reset all" variant="outline" onPress={() => resetAccessibility()} />
      <Text style={type.caption}>
        {session
          ? 'Kept on this device for your account, as the website keeps them in each browser.'
          : 'Kept on this device. Signing in keeps a separate set for your account.'}
      </Text>
    </MoreScreen>
  );
}
