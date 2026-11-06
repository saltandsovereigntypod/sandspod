#!/usr/bin/env node
// Turns one raw recording of a guided meditation into the app's voice track
// (app/src/lib/meditation/voice.ts): splits it where Ashley paused for
// 2.5 seconds or more, trims each part, evens the loudness to about -16 LUFS
// (measured once over the whole take, so the parts keep their level against
// each other), and saves each as a mono AAC file (~64 kbps) in
// audio/meditation/<trackId>/01.m4a, 02.m4a, ... Then it prints the entry
// to paste into app/src/lib/meditation/voiceTracks.ts, with each part's
// length. Needs ffmpeg and ffprobe.
//
//   node scripts/ingest-voice.mjs <recording> <trackId> [options]
//
//   --script <id>      the written script it reads (scripts.ts), e.g. grounding
//   --program <id>     or the binaural program whose cues it voices (programs.ts)
//   --expect <n>       how many parts there should be (a script's sections); warns if not
//   --silence <s>      the shortest pause that splits, in seconds (default 2.5)
//   --noise <dB>       how quiet counts as a pause (default -38; try -45 in a very quiet room, -32 in a noisy one)
//   --out <dir>        where the folders go (default audio/meditation)
//   --dry              find the parts and print them, but write nothing
//
// docs/meditation/recording-scripts.md has what to read and how to record it.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const opts = { silence: 2.5, noise: -38, out: join(root, "audio/meditation"), dry: false };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") opts.dry = true;
    else if (a.startsWith("--")) opts[a.slice(2)] = argv[++i];
    else rest.push(a);
  }
  return { input: rest[0], trackId: rest[1], ...opts, silence: Number(opts.silence), noise: Number(opts.noise), expect: opts.expect ? Number(opts.expect) : null };
}

const run = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
/** ffmpeg writes its findings to stderr; run it and keep that. */
function ffmpegLog(args) {
  try {
    execFileSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
    return "";
  } catch (e) {
    if (e.status === 0 || e.stderr) return String(e.stderr ?? "");
    throw e;
  }
}
function ffmpegQuiet(args) {
  const r = execFileSync("ffmpeg", ["-hide_banner", "-nostats", "-loglevel", "info", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
  return r;
}

const durationOf = (file) => Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]).trim());

/** The pauses: [start, end] in seconds, from ffmpeg's silencedetect. */
function findSilences(input, noise, minSilence) {
  const log = ffmpegLogStderr(["-i", input, "-af", `silencedetect=noise=${noise}dB:d=${minSilence}`, "-f", "null", "-"]);
  const out = [];
  let start = null;
  for (const line of log.split("\n")) {
    const s = line.match(/silence_start: (-?[\d.]+)/);
    const e = line.match(/silence_end: (-?[\d.]+)/);
    if (s) start = Math.max(0, Number(s[1]));
    if (e && start !== null) {
      out.push([start, Number(e[1])]);
      start = null;
    }
  }
  if (start !== null) out.push([start, Infinity]); // Quiet to the end.
  return out;
}

/** Run ffmpeg and return what it wrote to stderr (where its filters report). */
function ffmpegLogStderr(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  return String(r.stderr ?? "");
}

/** The speech between the pauses, padded a little each side (a breath in, a word's tail), never into the next. */
export function speechParts(silences, total, { pad = 0.3, minPart = 0.6 } = {}) {
  const parts = [];
  let from = 0;
  for (const [s, e] of silences) {
    if (s - from >= minPart) parts.push([from, s]);
    from = e;
  }
  if (Number.isFinite(from) && total - from >= minPart) parts.push([from, total]);
  return parts.map(([a, b], i) => {
    const prevEnd = i > 0 ? parts[i - 1][1] : 0;
    const nextStart = i < parts.length - 1 ? parts[i + 1][0] : total;
    return [Math.max(prevEnd, a - pad, 0), Math.min(nextStart, b + pad, total)];
  });
}

/** Trim the first part's lead-in and the last part's tail where they're quiet (a short pause of 0.4 s or more at the take's edge). */
export function trimEdges(parts, shortSilences, total, pad = 0.3) {
  if (!parts.length) return parts;
  const out = parts.map((p) => [...p]);
  const first = out[0];
  const last = out[out.length - 1];
  for (const [s, e] of shortSilences) {
    if (s <= first[0] + 0.05 && e > first[0] && e < first[1]) first[0] = Math.max(first[0], e - pad);
    const end = Math.min(e, total);
    if (end >= last[1] - 0.05 && s > last[0] && s < last[1]) last[1] = Math.min(last[1], s + pad);
  }
  return out;
}

/** Loudness of the whole take (loudnorm's first pass), to even every part by the same measure. */
function measure(input) {
  const log = ffmpegLogStderr(["-i", input, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]);
  const json = log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!o.input || !o.trackId || !/^[a-z0-9-]+$/.test(o.trackId)) {
    console.error("Usage: node scripts/ingest-voice.mjs <recording> <trackId> [--script id | --program id] [--expect n] [--silence 2.5] [--noise -38] [--out dir] [--dry]\nThe track id is lower case letters, numbers and dashes, e.g. grounding.");
    process.exit(1);
  }
  if (!existsSync(o.input)) {
    console.error(`No such file: ${o.input}`);
    process.exit(1);
  }
  const total = durationOf(o.input);
  const silences = findSilences(o.input, o.noise, o.silence);
  // Shorter quiet at the very start and end of the take is trimmed too.
  const edges = findSilences(o.input, o.noise, 0.4);
  const parts = trimEdges(speechParts(silences, total), edges, total);
  console.error(`${o.input}: ${total.toFixed(1)} s, ${silences.length} pauses of ${o.silence} s or more, ${parts.length} parts.`);
  if (!parts.length) {
    console.error(`No speech found. Try a lower --noise (now ${o.noise}).`);
    process.exit(1);
  }
  if (o.expect && parts.length !== o.expect) {
    console.error(`Expected ${o.expect} parts but found ${parts.length}. ${parts.length > o.expect ? "A pause inside a section was long enough to split it: try --silence 3, or a lower --noise." : "Two sections ran together: try --silence 2, or a higher --noise."} The parts:`);
    parts.forEach(([a, b], i) => console.error(`  ${String(i + 1).padStart(2, "0")}  ${a.toFixed(1)}–${b.toFixed(1)} s`));
    if (!o.dry) process.exit(2);
  }

  const dir = join(o.out, o.trackId);
  const sections = [];
  if (o.dry) {
    parts.forEach(([a, b], i) => sections.push({ file: `${String(i + 1).padStart(2, "0")}.m4a`, ms: Math.round((b - a) * 1000) }));
  } else {
    const m = measure(o.input);
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(dir)) if (f.endsWith(".m4a")) rmSync(join(dir, f));
    const norm = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
    parts.forEach(([a, b], i) => {
      const file = `${String(i + 1).padStart(2, "0")}.m4a`;
      const len = b - a;
      const fade = Math.min(0.08, len / 4);
      // loudnorm works at 192 kHz inside; back to 44.1 kHz mono for AAC.
      ffmpegQuiet(["-y", "-ss", a.toFixed(3), "-t", len.toFixed(3), "-i", o.input, "-af", `${norm},afade=t=in:d=${fade},afade=t=out:st=${(len - fade).toFixed(3)}:d=${fade}`, "-ac", "1", "-ar", "44100", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", join(dir, file)]);
      sections.push({ file, ms: Math.round(durationOf(join(dir, file)) * 1000) });
    });
    console.error(`Wrote ${sections.length} files to ${dir}.`);
  }

  const owner = o.script ? `    scriptId: '${o.script}',\n` : o.program ? `    programId: '${o.program}',\n` : "";
  const lines = sections.map((s) => `      { file: '${s.file}', ms: ${s.ms}${o.program ? ", cue: 0 /* the cue it starts on */" : ""} },`);
  console.log(`  // Add to VOICE_TRACKS in app/src/lib/meditation/voiceTracks.ts (import cleanMix from './sound.ts'). Set the mix from the recording notes, and \`rest\` on any section that should have a longer quiet after it.
  {
    id: '${o.trackId}',
${owner}    title: '${o.trackId}',
    base: '/audio/meditation/${o.trackId}/',
    minGapMs: 4000,
    suggestedMix: cleanMix({ levels: {} }),
    sections: [
${lines.join("\n")}
    ],
  },`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
