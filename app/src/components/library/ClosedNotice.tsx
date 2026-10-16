import { useState } from 'react';
import { Linking, StyleSheet, Text } from 'react-native';

import { CLOSED_GUIDE_LIVE, CLOSED_NOTICE, correctionUrl, SUPPORT_EMAIL, type ClosedTradition } from '../../lib/library/closed';
import { colors, type } from '../../theme';
import { Button } from '../Button';
import { Card } from '../more/ui';

/**
 * Whether the Closed & living traditions screens show their content. Release
 * builds follow CLOSED_GUIDE_LIVE; development builds can open the screens by
 * URL so the guide can be read before it goes live.
 */
export const CLOSED_GUIDE_VISIBLE = CLOSED_GUIDE_LIVE || __DEV__;

/** The owner's note at the top of the guide and each entry, with a way to send a correction. */
export function ClosedNotice({ tradition }: { tradition?: Pick<ClosedTradition, 'id' | 'name'> | null }) {
  const [failed, setFailed] = useState(false);
  const send = async () => {
    try {
      await Linking.openURL(correctionUrl(tradition));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <Card tone="gold">
      <Text style={styles.notice}>{CLOSED_NOTICE}</Text>
      <Button
        label="Send a correction"
        variant="outline"
        accessibilityHint={`Opens an email to ${SUPPORT_EMAIL}`}
        onPress={send}
      />
      <Text style={type.caption} selectable>
        {failed ? `Couldn't open your mail app. You can write to ${SUPPORT_EMAIL}` : `Or write to ${SUPPORT_EMAIL}`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  notice: { ...type.body, color: colors.cream },
});
