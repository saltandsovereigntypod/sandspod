import { useState } from 'react';
import { Linking, Text } from 'react-native';

import { Button } from '../../../components/Button';
import { Card, MoreScreen, Paragraphs } from '../../../components/more/ui';
import { RESEARCH_NOTE, RESEARCH_NOTE_TITLE, researchNoteUrl, SUPPORT_EMAIL } from '../../../lib/research';
import { type } from '../../../theme';

// A note on our research: the owner's word on how everything here was
// researched, and how to send a note. Reached from More → Help, the Living
// Library's first-visit card and the foot of every researched page. The
// website's twin is /more/research/.
export default function ResearchNote() {
  const [failed, setFailed] = useState(false);
  const send = async () => {
    try {
      await Linking.openURL(researchNoteUrl());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <MoreScreen title={RESEARCH_NOTE_TITLE} eyebrow="From Salt & Sovereignty" back="/more" backLabel="Back to More">
      <Card tone="gold">
        <Paragraphs items={RESEARCH_NOTE} />
        <Button label="Send a note" variant="outline" accessibilityHint={`Opens an email to ${SUPPORT_EMAIL}`} onPress={send} />
        <Text style={type.caption} selectable>
          {failed ? `Couldn't open your mail app. You can write to ${SUPPORT_EMAIL}` : `Or write to ${SUPPORT_EMAIL}`}
        </Text>
      </Card>
      <Text style={type.caption}>
        Every Library entry, deity, holiday, journey and card page has a Send a note link at its foot, which names the page for me.
      </Text>
    </MoreScreen>
  );
}
