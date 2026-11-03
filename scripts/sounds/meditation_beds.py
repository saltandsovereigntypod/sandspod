"""The meditation sound beds: pink and brown noise, rain, wind and a fire's
crackle. Synthesised here with numpy (nothing recorded), each made a little
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


def rain(n, rate):
    # A soft wash of high noise, and many small drops over it.
    bed = bandpass(rng.standard_normal(n), rate, 900, 7000) * 0.35
    drops = np.zeros(n)
    for _ in range(int(n / rate * 140)):
        at = rng.integers(0, n - 400)
        length = int(rng.integers(60, 300))
        env = np.exp(-np.arange(length) / (length / 5))
        drops[at : at + length] += rng.standard_normal(length) * env * rng.uniform(0.2, 1.0)
    return bed + bandpass(drops, rate, 1500, 9000) * 0.9


def wind(n, rate):
    # Noise through low and higher bands, with gusts that rise and fall in
    # whole cycles of the loop, so they meet themselves at the seam.
    base = shaped(n, 0.5)
    t = np.arange(n) / rate
    seconds = n / rate
    gust = 0.55 + 0.25 * np.sin(2 * np.pi * t * 2 / seconds) + 0.2 * np.sin(2 * np.pi * t * 5 / seconds + 1.3)
    low = bandpass(base, rate, 120, 700)
    high = bandpass(base, rate, 500, 1800) * (gust - 0.3).clip(0)
    return (low * 1.4 + high) * gust


def fire(n, rate):
    # A low roar and its crackles: sharp clicks and small pops at random.
    roar = bandpass(shaped(n, 1.0), rate, 40, 400) * 1.2 + bandpass(rng.standard_normal(n), rate, 200, 1200) * 0.08
    crack = np.zeros(n)
    for _ in range(int(n / rate * 9)):
        at = int(rng.integers(0, n - 2000))
        length = int(rng.integers(40, 900))
        env = np.exp(-np.arange(length) / rng.uniform(8, 120))
        crack[at : at + length] += rng.standard_normal(length) * env * rng.uniform(0.3, 1.0)
        if rng.random() < 0.3:  # now and then a little run of them together
            for _k in range(int(rng.integers(2, 5))):
                off = at + int(rng.uniform(0.01, 0.12) * rate)
                if off + 200 < n:
                    crack[off : off + 200] += rng.standard_normal(200) * np.exp(-np.arange(200) / 25) * rng.uniform(0.2, 0.7)
    return roar + bandpass(crack, rate, 700, 9000) * 0.8


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
make("rain", rain, 22050, 8, peak=0.6)
make("wind", wind, 16000, 10, peak=0.7, fade=1.5)
make("fire", fire, 22050, 8, peak=0.75, fade=0.5)
