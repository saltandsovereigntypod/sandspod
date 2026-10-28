import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { InviteAccept } from '../../../../components/covens/InviteAccept';
import { Card } from '../../../../components/more/ui';
import * as api from '../../../../lib/covens/api';
import { invitationLine, invitationOpen, inviteError } from '../../../../lib/covens/invites';
import { useSession } from '../../../../lib/session';
import { type } from '../../../../theme';

type Row = NonNullable<Awaited<ReturnType<typeof api.fetchInvitation>>>;

// An invitation sent to you in the app (its phone note opens this, as does
// Accept on My covens when the coven's agreements need signing first).
export default function Invitation() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [row, setRow] = useState<Row | null>(null);
  const [inviter, setInviter] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !id) return;
    let live = true;
    api
      .fetchInvitation(id)
      .then(async (found) => {
        if (!live) return;
        if (!found || found.user_id !== userId || !found.covens) return setProblem('This invitation wasn’t found. It may have been for another account.');
        setRow(found);
        if (found.status === 'accepted') setProblem(null);
        else if (found.status === 'declined') setProblem('You declined this invitation.');
        else if (found.status === 'revoked') setProblem('This invitation was taken back.');
        else if (!invitationOpen(found)) setProblem('This invitation has expired. Ask the coven for a new one.');
        if (found.invited_by) {
          const [p] = await api.fetchProfiles([found.invited_by]).catch(() => []);
          if (live) setInviter(p?.display_name ?? null);
        }
      })
      .catch((error) => live && setProblem(inviteError(error)));
    return () => {
      live = false;
    };
  }, [id, userId]);

  return (
    <InviteAccept
      title="You’re invited"
      here={`/coven/invitation/${id}`}
      slug={row?.covens?.slug ?? null}
      problem={problem}
      intro={
        row?.covens ? (
          <Card tone="gold">
            <Text style={type.cardTitle}>{row.covens.name}</Text>
            {!!row.covens.tagline && <Text style={type.body}>{row.covens.tagline}</Text>}
            <Text style={type.body}>{invitationLine(inviter, row.message)}</Text>
            <Text style={type.caption}>An invitation lets you join without applying.</Text>
          </Card>
        ) : null
      }
      accept={() => api.respondToInvitation(id, true)}
      decline={row?.status === 'pending' ? () => api.respondToInvitation(id, false) : undefined}
    />
  );
}
