// Strike a tuning fork once in the app (lib/meditation/forks.ts): made as it
// is first struck (synth.ts forkSamples), written once to the cache as a WAV
// file and played with expo-audio. Struck on purpose, so it sounds with the
// silent switch on. The web build uses forkSound.web.ts.

import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

import { holdLoud } from '../../lib/altar/feel';
import { DEFAULT_FORK_DECAY, forkKey } from '../../lib/meditation/forks';
import { wavBytes, forkSamples } from '../../lib/meditation/synth';

const players = new Map<string, AudioPlayer>();

/** Strike a fork (or a pair) at a level 0 to 1; returns nothing, and stays quiet if it can't sound. */
export function strikeFork(hz: number[], volume = 0.8, decay = DEFAULT_FORK_DECAY) {
  try {
    const key = forkKey(hz, decay);
    let p = players.get(key);
    if (!p) {
      const file = new File(Paths.cache, `meditation-${key.replace(/[^a-z0-9.]/gi, '_')}.wav`);
      if (!file.exists) file.write(wavBytes(forkSamples(hz, decay)));
      p = createAudioPlayer({ uri: file.uri });
      players.set(key, p);
    }
    const player = p;
    holdLoud(true);
    player.volume = Math.min(1, volume);
    void player.seekTo(0).then(() => player.play()).catch(() => player.play());
    setTimeout(() => holdLoud(false), decay * 1000);
  } catch {
    // A fork that can't sound is simply not heard.
  }
}
