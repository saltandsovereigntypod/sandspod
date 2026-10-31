import { supabase } from '../supabase';
import { createChannelHub, type ChannelClient } from './channelHub';

export type { SharedChannel } from './channelHub';

/** One realtime channel per topic for the whole app (channelHub.ts says why). */
export const joinChannel = createChannelHub(supabase as unknown as ChannelClient).join;
