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

# The singing bowl and the lighter

`bowl-<tone>.mp3` (root, sacral, solar, heart, throat, third-eye, crown and
432) and `lighter-click.mp3`, also at the website's `assets/sounds/`, are
synthesised by `scripts/build-bowl-sounds.py`, nothing recorded: each bowl is
four inharmonic partials (1, 2.71, 5.13 and 8.42 times its tone), each a slowly
beating pair, fading over about 9 s after a soft mallet thump. The website's
`match-strike.mp3` is the match strike above, as MP3.

# Meditation sounds

The pink and brown noise beds (`meditation/pink.wav`, `brown.wav`, also at the website's `assets/sounds/meditation/`) are synthesised by `scripts/sounds/meditation_beds.py` with numpy; 16-bit mono WAV. Rain and fire are real recordings, see `nature/SOURCES.md`. The drone, frame drum (and its callback), singing bowls and
binaural tones depend on the key, tempo, tone or beat chosen, so they are
made as a sit begins by `app/src/lib/meditation/synth.ts`, and written to the
app's cache (not shipped).
