# Candle sounds

Real recordings, all released as CC0 (public domain: free for any use, no
credit required), from Freesound and OpenGameArt.org. Each file here is a short cut from
one of them: trimmed, filtered and faded, nothing synthesized.

| Files | Cut from | Page |
| --- | --- | --- |
| `pop-1` … `pop-5`, `sputter-1` … `sputter-4` | "Fire Crackling" (`fire-1.wav`) | https://opengameart.org/content/fire-crackling |
| `candle-burning` (a 38 s loop), `crackle-1` … `crackle-10` | "Candle Buzz 3" by unfa | https://freesound.org/people/unfa/sounds/185419/ |
| `match-strike` | "Flare ignition" (`ignition.flac`) | https://opengameart.org/content/flare-ignition |

# The altar bell

`bell-chime.mp3` (also at the website's `assets/sounds/`) is synthesised, not
recorded: six inharmonic partials of a small bell (0.5, 1, 2.76, 5.40, 8.93 and
13.34 times 880 Hz), each a slowly beating pair, decaying over about 3.5 s,
with a 6 ms attack, normalised to -3 dBFS, mono 44.1 kHz, 4 s, 64 kb/s.

# Meditation sounds

Everything is synthesised, nothing recorded. `meditation/pink.wav`,
`brown.wav`, `rain.wav`, `wind.wav` and `fire.wav` (also at the website's
`assets/sounds/meditation/`) are made by `scripts/sounds/meditation_beds.py`
with numpy: shaped noise, filtered bursts for raindrops and crackles, and slow
whole-loop gusts for the wind, each 6 to 10 s, its tail crossfaded into its
head so it loops without a seam; 16-bit mono WAV at 22.05 or 16 kHz, about
1.5 MB together. The drone, frame drum (and its callback), singing bowls and
binaural tones depend on the key, tempo, tone or beat chosen, so they are
made as a sit begins by `app/src/lib/meditation/synth.ts`, and written to the
app's cache (not shipped).
