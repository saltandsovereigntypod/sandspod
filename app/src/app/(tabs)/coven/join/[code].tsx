import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { InviteAccept } from '../../../../components/covens/InviteAccept';
import { Card } from '../../../../components/more/ui';
import * as api from '../../../../lib/covens/api';
import { inviteError, parseInviteCode, previewLine, reasonWords, type InvitePreview } from '../../../../lib/covens/invites';
import { type } from '../../../../theme';

// An invite link: saltandsovereignty://coven/join/CODE (the website's
// covens/join/?code=CODE page opens it), or a code typed on Find a coven.
// Shows the coven the link is for, then sign-in, profile, agreements, Accept.
export default function JoinByInvite() {
  const params = useLocalSearchParams<{ code?: string }>();
  const code = parseInviteCode(params.code) ?? '';
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let live = true;
    api
      .previewInvite(code)
      .then((p) => live && setPreview(p))
      .catch((error) => live && setFailed(inviteError(error)));
    return () => {
      live = false;
    };
  }, [code]);

  const coven = preview?.coven ?? null;
  const problem = !code ? reasonWords('not_found') : failed ?? (preview && !preview.valid ? reasonWords(preview.reason) : null);
  return (
    <InviteAccept
      title="You’re invited"
      here={`/coven/join/${code}`}
      slug={preview?.valid ? coven?.slug ?? null : null}
      problem={problem}
      intro={
        coven ? (
          <Card tone="gold">
            <Text style={type.cardTitle}>{coven.name}</Text>
            {!!coven.tagline && <Text style={type.body}>{coven.tagline}</Text>}
            <Text style={type.caption}>{previewLine(coven)}</Text>
            <Text style={type.caption}>An invitation lets you join without applying.</Text>
          </Card>
        ) : null
      }
      accept={() => api.acceptInviteLink(code)}
    />
  );
}
