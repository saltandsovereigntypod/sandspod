import type { RealtimeChannel } from "@supabase/supabase-js";

// One realtime channel per topic, shared by every screen that wants it.
//
// supabase.channel(topic) hands back the channel already open on that topic,
// if there is one. Adding listeners to it once it has joined throws ("cannot
// add postgres_changes callbacks … after subscribe()"), which closes the app.
// That happened when the same altar was open twice in the stack (ritual page,
// altar, ritual page, altar again), and a channel being closed when the screen
// came straight back was reused half-closed and never synced again. So each
// topic has one channel, opened once with listeners that pass every event on
// to whoever has joined; the last to leave closes it, and a new one waits for
// the old one to finish closing first.

type Listener = (event: string, payload: unknown) => void;
type Hub = {
  listeners: Set<Listener>;
  channel: RealtimeChannel | null;
  subscribed: boolean;
  meta: Record<string, unknown> | null;
  closeTimer: ReturnType<typeof setTimeout> | null;
};

export type SharedChannel = {
  /** Send a broadcast to the others on the channel. */
  send: (event: string, payload: unknown) => void;
  /** Tell the others who you are (presence); kept and sent again on reconnect. */
  track: (meta: Record<string, unknown>) => void;
  /** Who is here, by presence key. */
  presence: () => Record<string, unknown[]>;
  /** Whether the channel is connected now. */
  subscribed: () => boolean;
  leave: () => void;
};

/** What the hub needs of the Supabase client (sharedChannel.ts passes the app's own). */
export type ChannelClient = {
  channel: (
    topic: string,
    params: { config: Record<string, unknown> },
  ) => RealtimeChannel;
  removeChannel: (channel: RealtimeChannel) => Promise<unknown>;
};

// A short wait before closing, so leaving a screen and coming straight back keeps the same channel.
const CLOSE_AFTER_MS = 3000;

/** A hub over one client: `join` as below. Kept apart from the client so it can be tested. */
export function createChannelHub(
  supabase: ChannelClient,
  closeAfterMs = CLOSE_AFTER_MS,
) {
  const hubs = new Map<string, Hub>();
  const closing = new Map<string, Promise<unknown>>();

  /**
   * Join `topic`. `bind` adds the channel's listeners (once, for everyone),
   * calling `emit(event, payload)`; each joiner's `listen` hears every event,
   * plus `status` (SUBSCRIBED, CLOSED, …) and `presence` (after a presence sync).
   */
  function joinChannel(
    topic: string,
    config: Record<string, unknown>,
    bind: (
      channel: RealtimeChannel,
      emit: (event: string, payload: unknown) => void,
    ) => void,
    listen: Listener,
  ): SharedChannel {
    let hub = hubs.get(topic);
    if (!hub) {
      const created: Hub = {
        listeners: new Set(),
        channel: null,
        subscribed: false,
        meta: null,
        closeTimer: null,
      };
      hub = created;
      hubs.set(topic, created);
      const emit = (event: string, payload: unknown) => {
        for (const l of [...created.listeners]) {
          try {
            l(event, payload);
          } catch {
            // One screen's trouble mustn't stop the others hearing.
          }
        }
      };
      const open = () => {
        if (hubs.get(topic) !== created) return;
        try {
          const channel = supabase.channel(topic, { config });
          created.channel = channel;
          bind(channel, emit);
          channel.on("presence", { event: "sync" }, () =>
            emit("presence", null),
          );
          channel.subscribe((status) => {
            created.subscribed = status === "SUBSCRIBED";
            if (status === "SUBSCRIBED" && created.meta)
              void channel.track(created.meta).catch(() => {});
            emit("status", status);
          });
        } catch {
          // A channel left over on this topic: live updates are lost, but nothing breaks.
          created.channel = null;
          emit("status", "CHANNEL_ERROR");
        }
      };
      const before = closing.get(topic);
      if (before) void before.finally(open);
      else open();
    } else if (hub.closeTimer) {
      clearTimeout(hub.closeTimer);
      hub.closeTimer = null;
    }
    const own = hub;
    own.listeners.add(listen);
    // Joining a channel that's already connected: hear that it is, and who's here.
    if (own.subscribed) {
      queueMicrotask(() => {
        if (!own.listeners.has(listen)) return;
        listen("status", "SUBSCRIBED");
        listen("presence", null);
      });
    }
    let left = false;
    return {
      send: (event, payload) => {
        void own.channel
          ?.send({ type: "broadcast", event, payload })
          .catch(() => {});
      },
      track: (meta) => {
        own.meta = meta;
        if (own.subscribed) void own.channel?.track(meta).catch(() => {});
      },
      presence: () =>
        (own.channel?.presenceState() as
          | Record<string, unknown[]>
          | undefined) ?? {},
      subscribed: () => own.subscribed,
      leave: () => {
        if (left) return;
        left = true;
        own.listeners.delete(listen);
        if (own.listeners.size || own.closeTimer) return;
        own.closeTimer = setTimeout(() => {
          own.closeTimer = null;
          if (own.listeners.size || hubs.get(topic) !== own) return;
          hubs.delete(topic);
          const channel = own.channel;
          own.channel = null;
          own.subscribed = false;
          if (!channel) return;
          const done = supabase
            .removeChannel(channel)
            .catch(() => undefined)
            .finally(() => {
              if (closing.get(topic) === done) closing.delete(topic);
            });
          closing.set(topic, done);
        }, closeAfterMs);
      },
    };
  }
  return { join: joinChannel, open: () => [...hubs.keys()] };
}
