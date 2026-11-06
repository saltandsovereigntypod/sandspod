// Strike a tuning fork once in a browser (Web Audio), the sound made by
// synth.ts forkSamples. See forkSound.ts for the app.

import { DEFAULT_FORK_DECAY } from '../../lib/meditation/forks';
import { forkSamples } from '../../lib/meditation/synth';

let ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();

export function strikeFork(hz: number[], volume = 0.8, decay = DEFAULT_FORK_DECAY) {
  try {
    const g = globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = g.AudioContext ?? g.webkitAudioContext;
    if (!Ctx) return;
    ctx = ctx ?? new Ctx();
    void ctx.resume().catch(() => {});
    const key = `${hz.join('+')}:${decay}`;
    let b = buffers.get(key);
    if (!b) {
      const pcm = forkSamples(hz, decay);
      b = ctx.createBuffer(1, pcm.channels[0].length, pcm.rate);
      b.getChannelData(0).set(pcm.channels[0]);
      buffers.set(key, b);
    }
    const source = ctx.createBufferSource();
    source.buffer = b;
    const gain = ctx.createGain();
    gain.gain.value = Math.min(1, volume);
    source.connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    // A fork that can't sound is simply not heard.
  }
}
