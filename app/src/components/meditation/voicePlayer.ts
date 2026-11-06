// The recorded voice on a phone (lib/meditation/voice.ts), with expo-audio:
// each section is played when the sit's clock reaches it, from where the
// clock says it should be, so it keeps in step through pauses and skips. The
// next section is made ready ahead of time. Files stream from the website the
// first time and are kept in the app's cache after, so a second sit needs no
// signal. The web build plays the voice with Web Audio (sitSound.web.ts).

import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

import { voiceAt, voiceUrl, type PlacedSection, type VoiceTimeline } from '../../lib/meditation/voice';
import { SITE_ORIGIN } from '../../lib/siteLinks';

const fetching = new Set<string>();

/** Named with its length too, so a new take (the same file name, a new length) isn't mistaken for the old one. */
const cacheFile = (trackId: string, s: PlacedSection) => new File(Paths.cache, `meditation-voice-${trackId}-${s.endMs - s.startMs}-${s.file}`.replace(/[^a-z0-9.\-_]/gi, '_'));

/** Keep a section in the cache for next time (once, quietly; a failed fetch is tried again next sit). */
function keep(trackId: string, s: PlacedSection) {
  const dest = cacheFile(trackId, s);
  if (dest.exists || fetching.has(dest.uri)) return;
  fetching.add(dest.uri);
  File.downloadFileAsync(voiceUrl(s.url, SITE_ORIGIN), dest)
    .catch(() => {
      try {
        if (dest.exists) dest.delete();
      } catch {
        // Left for the cache to clear.
      }
    })
    .finally(() => fetching.delete(dest.uri));
}

/** The section's file from the cache if it's there, else straight from the website. */
function sourceOf(trackId: string, s: PlacedSection) {
  const local = cacheFile(trackId, s);
  if (local.exists && !fetching.has(local.uri)) return { uri: local.uri };
  keep(trackId, s);
  return { uri: voiceUrl(s.url, SITE_ORIGIN) };
}

function quiet(p: AudioPlayer | undefined) {
  try {
    p?.pause();
    p?.remove();
  } catch {
    // Already gone.
  }
}

type Held = { index: number; player: AudioPlayer };

export function createVoicePlayer(timeline: VoiceTimeline) {
  let current: Held | null = null;
  let ready: Held | null = null;
  let wasPaused = false;
  const make = (s: PlacedSection): Held => {
    const player = createAudioPlayer(sourceOf(timeline.trackId, s));
    player.loop = false;
    player.volume = 1;
    return { index: s.index, player };
  };
  return {
    tick(elapsedMs: number, paused: boolean) {
      if (paused) {
        if (!wasPaused) current?.player.pause();
        wasPaused = true;
        return;
      }
      const { playing, next } = voiceAt(timeline, elapsedMs);
      if (next && ready?.index !== next.index && current?.index !== next.index) {
        quiet(ready?.player);
        ready = make(next);
      }
      if (!playing) {
        if (current) quiet(current.player);
        current = null;
        wasPaused = false;
        return;
      }
      const into = playing.intoMs / 1000;
      if (current?.index !== playing.section.index) {
        quiet(current?.player);
        current = ready?.index === playing.section.index ? ready : make(playing.section);
        if (ready === current) ready = null;
        if (into > 0.4) void current.player.seekTo(into).catch(() => {});
        current.player.play();
      } else if (wasPaused) {
        void current.player.seekTo(into).catch(() => {});
        current.player.play();
      } else if (current.player.isLoaded && !current.player.isBuffering && Math.abs(current.player.currentTime - into) > 3) {
        // Well out of step (a skip to the return, say): put it where the clock is. A short lag from loading is let be, so no words are lost.
        void current.player.seekTo(into).catch(() => {});
      }
      wasPaused = false;
    },
    stop() {
      quiet(current?.player);
      quiet(ready?.player);
      current = ready = null;
    },
  };
}
