"""The meditation sound beds: pink and brown noise. (Rain and fire are now recordings, see assets/sounds/nature.)
Synthesised here with numpy (nothing recorded), each made a little
longer than it needs to be and its tail crossfaded into its head, so it loops
without a seam. 16-bit mono WAV, written to the app (app/assets/sounds/
meditation/) and the website (assets/sounds/meditation/). Run from the repo
root: python3 scripts/sounds/meditation_beds.py. Seeded, so it makes the same
files every time. The drone, drum, bowls and binaural tones depend on what
you choose (key, tempo, beat), so they are made as you begin, from
app/src/lib/meditation/synth.ts.
"""

import os
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = [os.path.join(ROOT, "app/assets/sounds/meditation"), os.path.join(ROOT, "assets/sounds/meditation")]
rng = np.random.default_rng(20261103)


def shaped(n, power):
    """White noise with its spectrum shaped to 1/f^power (pink 0.5, brown 1)."""
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.arange(len(spec), dtype=float)
    f[0] = 1.0
    spec /= f**power
    spec[:3] = 0  # no drift
    return np.fft.irfft(spec, n)


def bandpass(x, rate, lo, hi):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / rate)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, len(x))


def pink(n, rate):
    return shaped(n, 0.5)


def brown(n, rate):
    return shaped(n, 1.0)


def seamless(x, rate, seconds, fade):
    """Keep `seconds` and fold the extra tail over the head with an equal-power crossfade."""
    n = int(seconds * rate)
    f = int(fade * rate)
    w = np.linspace(0, 1, f)
    out = x[:n].copy()
    out[:f] = x[:f] * np.sqrt(w) + x[n : n + f] * np.sqrt(1 - w)
    return out


def make(name, gen, rate, seconds, peak=0.7, fade=0.8):
    x = seamless(gen(int((seconds + fade + 0.1) * rate), rate), rate, seconds, fade)
    x = x - x.mean()
    x = x / (np.abs(x).max() + 1e-9) * peak
    data = (x * 32767).astype("<i2").tobytes()
    for folder in OUT:
        os.makedirs(folder, exist_ok=True)
        with wave.open(os.path.join(folder, f"{name}.wav"), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes(data)


make("pink", pink, 22050, 6)
make("brown", brown, 16000, 6, peak=0.8)
