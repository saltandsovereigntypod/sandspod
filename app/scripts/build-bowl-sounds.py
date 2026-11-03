"""Synthesise the singing bowl's tones and the lighter's click.

Nothing recorded. Each bowl tone (src/lib/altar/bowl.ts BOWL_TONES, BOWL_PARTIALS:
keep the two in step) is a struck bowl: four inharmonic partials at about 1,
2.71, 5.13 and 8.42 times the tone, each a pair of sines a fraction of a hertz
apart so it beats slowly as a real bowl wavers, fading exponentially over
seconds, with a soft mallet thump at the strike. Normalised to -3 dBFS, mono
44.1 kHz, BOWL_SECONDS long, 48 kb/s MP3 (ffmpeg), written to the app's
assets/sounds and the website's.

The lighter's click is a short burst of filtered noise and a flint tick, then a
breath of gas. The website also gets the app's match strike as MP3.

Run from app/:  python3 scripts/build-bowl-sounds.py   (needs numpy and ffmpeg)
"""
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

APP = Path(__file__).resolve().parent.parent
OUTS = [APP / "assets" / "sounds", APP.parent / "assets" / "sounds"]
RATE = 44100
SECONDS = 9

TONES = {"root": 261.63, "sacral": 293.66, "solar": 329.63, "heart": 349.23, "throat": 392.0, "third-eye": 440.0, "crown": 493.88, "432": 432.0}
PARTIALS = [(1, 1.0, 9.0, 0.6), (2.71, 0.45, 6.0, 1.4), (5.13, 0.2, 3.4, 2.3), (8.42, 0.08, 1.8, 3.1)]


def bowl(hz: float) -> np.ndarray:
    t = np.arange(int(RATE * SECONDS)) / RATE
    rng = np.random.default_rng(int(hz * 100))
    out = np.zeros_like(t)
    for ratio, gain, decay, beat in PARTIALS:
        f = hz * ratio
        if f > RATE / 2.2:
            continue
        phase = rng.uniform(0, 2 * np.pi, 2)
        env = np.exp(-t / decay * 3)
        pair = np.sin(2 * np.pi * f * t + phase[0]) + 0.8 * np.sin(2 * np.pi * (f + beat) * t + phase[1])
        out += gain * env * pair
    # The mallet: a soft, quickly fading thump of low noise.
    noise = rng.normal(0, 1, len(t))
    kernel = np.ones(40) / 40
    thump = np.convolve(noise, kernel, mode="same") * np.exp(-t / 0.03)
    out += 0.25 * thump
    attack = np.minimum(1, t / 0.004)
    tail = np.minimum(1, (SECONDS - t) / 0.4)
    return out * attack * tail


def click() -> np.ndarray:
    n = int(RATE * 0.6)
    t = np.arange(n) / RATE
    rng = np.random.default_rng(7)
    tick = rng.normal(0, 1, n) * np.exp(-t / 0.004)
    flint = np.diff(rng.normal(0, 1, n + 1)) * np.exp(-np.maximum(0, t - 0.03) / 0.02) * (t > 0.03)
    gas = np.convolve(rng.normal(0, 1, n), np.ones(12) / 12, mode="same") * 0.35 * np.exp(-np.maximum(0, t - 0.06) / 0.18) * (t > 0.06)
    return tick + 0.5 * flint + gas


def write_mp3(samples: np.ndarray, name: str, bitrate: str = "48k") -> None:
    peak = np.max(np.abs(samples)) or 1
    pcm = (samples / peak * 0.708 * 32767).astype(np.int16)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "x.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(RATE)
            w.writeframes(pcm.tobytes())
        for out in OUTS:
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", bitrate, str(out / name)], check=True)


def main() -> None:
    for tone, hz in TONES.items():
        write_mp3(bowl(hz), f"bowl-{tone}.mp3")
    write_mp3(click(), "lighter-click.mp3", "64k")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(APP / "assets" / "sounds" / "match-strike.wav"), "-ac", "1", "-b:a", "64k", str(APP.parent / "assets" / "sounds" / "match-strike.mp3")], check=True)


if __name__ == "__main__":
    main()
