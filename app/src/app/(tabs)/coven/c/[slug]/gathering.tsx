import { useEffect } from 'react';
import { Text } from 'react-native';

import { ChatMessages } from '../../../../../components/covens/Chat';
import { CovenScreen } from '../../../../../components/covens/CovenScreen';
import { useCoven } from '../../../../../lib/covens/CovenContext';
import { markRead } from '../../../../../lib/covens/unread';
import { type } from '../../../../../theme';

// The coven's live chat, on its own screen. (It also opens over every coven
// screen from the chat bubble.)
export default function Gathering() {
  const coven = useCoven();
  const covenId = coven.snapshot?.coven.id;
  const { loadMessages, track } = coven;
  const count = coven.messages?.length ?? 0;

  useEffect(() => {
    track('gathering');
    return () => track('coven');
  }, [track]);
  useEffect(() => {
    if (!covenId) return;
    markRead(covenId, true);
    return () => markRead(covenId, false);
  }, [covenId, count]);

  const here = coven.presence.filter((p) => p.place === 'gathering' && p.user_id !== coven.userId);
  return (
    <CovenScreen title="Chat" need="member" chat={false} onRefresh={loadMessages}>
      <Text style={type.caption}>
        {here.length ? `Here now: ${here.map((p) => p.name).join(', ')}` : 'Talk with your coven here, without sharing phone numbers. Messages stay for the coven to read.'}
      </Text>
      <ChatMessages />
    </CovenScreen>
  );
}
