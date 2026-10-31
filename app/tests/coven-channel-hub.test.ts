import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createChannelHub, type ChannelClient } from '../src/lib/covens/channelHub.ts';

// A stand-in for the realtime client that behaves as realtime-js 2.117 does:
// channel(topic) returns the channel already on that topic, adding
// postgres/presence listeners after subscribe() throws, and removeChannel
// takes a moment (the server's answer) before the topic is free again.
function fakeClient() {
  type Fake = { topic: string; state: 'closed' | 'joining' | 'joined' | 'leaving'; handlers: { type: string; event: string; cb: (p: unknown) => void }[]; subscribes: number; tracked: unknown[] };
  const channels: Fake[] = [];
  let created = 0;
  const client = {
    channel(topic: string) {
      const found = channels.find((c) => c.topic === topic);
      if (found) return found as never;
      created += 1;
      const ch: Fake & Record<string, unknown> = {
        topic,
        state: 'closed',
        handlers: [],
        subscribes: 0,
        tracked: [],
        on(type: string, filter: { event?: string }, cb: (p: unknown) => void) {
          if ((ch.state === 'joined' || ch.state === 'joining') && type !== 'broadcast') throw new Error(`cannot add \`${type}\` callbacks for ${topic} after \`subscribe()\`.`);
          ch.handlers.push({ type, event: filter?.event ?? '*', cb });
          return ch;
        },
        subscribe(cb: (status: string) => void) {
          ch.subscribes += 1;
          if (ch.state !== 'closed') return ch;
          ch.state = 'joining';
          setTimeout(() => {
            ch.state = 'joined';
            cb('SUBSCRIBED');
          }, 1);
          return ch;
        },
        track(meta: unknown) {
          ch.tracked.push(meta);
          return Promise.resolve('ok');
        },
        send() {
          return Promise.resolve('ok');
        },
        presenceState() {
          return {};
        },
      };
      channels.push(ch);
      return ch as never;
    },
    removeChannel(ch: Fake) {
      ch.state = 'leaving';
      return new Promise((resolve) =>
        setTimeout(() => {
          ch.state = 'closed';
          channels.splice(channels.indexOf(ch), 1);
          resolve('ok');
        }, 5),
      );
    },
  };
  return { client: client as unknown as ChannelClient, channels, created: () => created };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const bind = (ch: { on: (...a: unknown[]) => unknown }, emit: (e: string, p: unknown) => void) => {
  ch.on('postgres_changes', { event: '*' }, (p: unknown) => emit('row', p));
};

test('the same topic joined twice shares one channel instead of throwing', async () => {
  const fake = fakeClient();
  const hub = createChannelHub(fake.client, 0);
  const heard: string[] = [];
  const first = hub.join('coven-altar:a', {}, bind as never, (e) => heard.push(`1:${e}`));
  await wait(5);
  // The bug: a second open of the same altar re-added listeners to the joined channel and threw.
  const second = hub.join('coven-altar:a', {}, bind as never, (e) => heard.push(`2:${e}`));
  await wait(1);
  assert.equal(fake.created(), 1);
  assert.equal(fake.channels[0].subscribes, 1);
  assert.ok(heard.includes('1:status') && heard.includes('2:status'));
  // An event reaches both.
  fake.channels[0].handlers[0].cb({ x: 1 });
  assert.ok(heard.includes('1:row') && heard.includes('2:row'));
  // The first leaving keeps it open for the second.
  first.leave();
  await wait(10);
  assert.equal(fake.channels.length, 1);
  second.leave();
  await wait(10);
  assert.equal(fake.channels.length, 0);
});

test('coming straight back waits for the old channel to close, then opens a fresh one', async () => {
  const fake = fakeClient();
  const hub = createChannelHub(fake.client, 0);
  const one = hub.join('coven:c', {}, bind as never, () => {});
  await wait(5);
  one.leave();
  await wait(1); // closing, not yet closed
  assert.equal(fake.channels[0]?.state, 'leaving');
  let subscribed = false;
  hub.join('coven:c', {}, bind as never, (e, p) => {
    if (e === 'status' && p === 'SUBSCRIBED') subscribed = true;
  });
  await wait(20);
  assert.equal(fake.created(), 2);
  assert.ok(subscribed, 'the new screen is live again');
});

test('a short absence keeps the channel, and presence is sent once connected', async () => {
  const fake = fakeClient();
  const hub = createChannelHub(fake.client, 50);
  const one = hub.join('coven:d', {}, bind as never, () => {});
  one.track({ place: 'ritual' });
  await wait(5);
  assert.deepEqual(fake.channels[0].tracked, [{ place: 'ritual' }]);
  one.leave();
  const two = hub.join('coven:d', {}, bind as never, () => {});
  await wait(60);
  assert.equal(fake.created(), 1);
  two.leave();
  await wait(70);
  assert.deepEqual(hub.open(), []);
});
