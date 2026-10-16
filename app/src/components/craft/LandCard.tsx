import { useState } from 'react';
import { Linking, Text } from 'react-native';

import { type } from '../../theme';
import { Button } from '../Button';
import { Body, Card, SectionLabel } from '../rituals/ui';

// Opened as a plain link: nothing about the person (place, account, practice)
// is added to it or sent anywhere.
export const NATIVE_LAND_URL = 'https://native-land.ca';

/** "Whose land are you on?": a short, warm prompt to learn the Indigenous history of where you practise. */
export function LandCard() {
  const [failed, setFailed] = useState(false);
  const open = async () => {
    try {
      await Linking.openURL(NATIVE_LAND_URL);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <Card>
      <SectionLabel>Whose land are you on?</SectionLabel>
      <Text style={type.cardTitle}>Every place has a longer story</Text>
      <Body>
        The ground you garden, walk and gather on has Indigenous history, and often living Nations who still care for it.
        Learning whose land it is, its names and its stories is part of knowing a place well. Where you can, support
        Indigenous-led land and language work there.
      </Body>
      <Body muted>
        Native Land is a map of Indigenous territories, languages and treaties, run by Native Land Digital, an
        Indigenous-led not-for-profit. Its lines are a starting point, not legal borders; the Nations themselves are the
        best source. The app sends nothing about you; you search the map yourself.
      </Body>
      <Button
        label="Open the Native Land map"
        variant="outline"
        accessibilityHint="Opens native-land.ca in your browser"
        onPress={open}
      />
      {failed && <Body muted>{`Couldn't open the link. You can visit ${NATIVE_LAND_URL.replace('https://', '')} in your browser.`}</Body>}
    </Card>
  );
}
