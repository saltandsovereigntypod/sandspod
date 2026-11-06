import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compile, programById } from '../src/lib/meditation/programs.ts';
import { cleanMix } from '../src/lib/meditation/sound.ts';
import { captionAt, DUCK_GAIN, DUCK_RAMP_MS, duckAt, LEAD_MS, OPEN_STRETCH, programVoiceAt, programVoiceLengths, sitVoiceTimeline, trackOk, voiceAt, voiceLengths, voiceMinMinutes, voiceMinMs, voiceUrl, type VoiceTrack } from '../src/lib/meditation/voice.ts';
import { programVoice, scriptVoice, VOICE_TRACKS, voiceTrack } from '../src/lib/meditation/voiceTracks.ts';

const MIN = 60_000;
const mix = cleanMix({ levels: { brown: 0.25 } });
// A made-up track: three sections of 20, 30 and 10 seconds.
const fake: VoiceTrack = {
  id: 'fake',
  scriptId: 'grounding',
  title: 'Fake',
  base: '/audio/meditation/fake/',
  sections: [
    { file: '01.m4a', ms: 20_000 },
    { file: '02.m4a', ms: 30_000, rest: 3 },
    { file: '03.m4a', ms: 10_000 },
  ],
  minGapMs: 5_000,
  suggestedMix: mix,
};

test('no tracks ship yet, so no script or program offers a voice', () => {
  assert.equal(VOICE_TRACKS.length, 0);
  assert.equal(scriptVoice('grounding'), null);
  assert.equal(programVoice('grounding'), null);
  assert.equal(scriptVoice('grounding', [fake]), fake);
  assert.equal(scriptVoice('rest', [fake]), null);
  // A program's version of a script's recording is the program's, not the script's.
  assert.equal(scriptVoice('grounding', [{ ...fake, programId: 'grounding' }]), null);
  assert.equal(programVoice('grounding', [{ ...fake, programId: 'grounding' }])?.id, 'fake');
  assert.equal(voiceTrack('fake', [fake]), fake);
  assert.equal(trackOk({ ...fake, sections: [] }), false);
  assert.equal(scriptVoice('grounding', [{ ...fake, sections: [{ file: '01.m4a', ms: 0 }] }]), null);
});

test('the shortest sit holds the lead-in, all the audio and the shortest gap after each section', () => {
  assert.equal(voiceMinMs(fake), LEAD_MS + 60_000 + 3 * 5_000);
  assert.equal(voiceMinMinutes(fake), 2);
  assert.deepEqual(voiceLengths(fake, [1, 2, 5, 10]), [2, 5, 10]);
});

test('a longer sit stretches only the quiet, by each section’s rest, and the audio stays whole', () => {
  const t = sitVoiceTimeline(fake, 10 * MIN, 2 * MIN);
  assert.equal(t.fits, true);
  const [a, b, c] = t.sections;
  assert.equal(a.startMs, 2 * MIN + LEAD_MS);
  assert.deepEqual(t.sections.map((s) => s.endMs - s.startMs), [20_000, 30_000, 10_000]);
  const spare = 10 * MIN - voiceMinMs(fake);
  // Rests 1, 3 and (the last, by default) 0: a quarter after the first, three quarters after the second.
  assert.equal(b.startMs - a.endMs, Math.round(5_000 + spare / 4));
  assert.equal(c.startMs - b.endMs, Math.round(5_000 + (spare * 3) / 4));
  // The last words end the shortest gap before the sit does.
  assert.ok(Math.abs(c.endMs + 5_000 - (2 * MIN + 10 * MIN)) <= 2);
  assert.equal(a.url, '/audio/meditation/fake/01.m4a');
  assert.deepEqual(t.sections.map((s) => s.line), [0, 1, 2]);
});

test('too short a sit is laid out at its shortest and says so; open-ended goes at an unhurried pace', () => {
  const short = sitVoiceTimeline(fake, MIN);
  assert.equal(short.fits, false);
  assert.equal(short.minMs, voiceMinMs(fake));
  assert.equal(short.sections[1].startMs - short.sections[0].endMs, 5_000);
  const open = sitVoiceTimeline(fake, null);
  assert.equal(open.fits, true);
  assert.equal(open.sections[1].startMs - open.sections[0].endMs, 5_000 * OPEN_STRETCH);
});

test('the other layers dip by 6 dB while she speaks, with smooth ramps either side', () => {
  const t = sitVoiceTimeline(fake, 10 * MIN);
  const a = t.sections[0];
  assert.equal(duckAt(null, 0), 1);
  assert.equal(duckAt(t, a.startMs - DUCK_RAMP_MS - 1), 1);
  assert.equal(duckAt(t, a.startMs), DUCK_GAIN);
  assert.equal(duckAt(t, a.startMs + 10_000), DUCK_GAIN);
  assert.equal(duckAt(t, a.endMs), DUCK_GAIN);
  assert.equal(duckAt(t, a.startMs - DUCK_RAMP_MS / 2), 0.75);
  assert.equal(duckAt(t, a.endMs + DUCK_RAMP_MS / 2), 0.75);
  assert.equal(duckAt(t, a.endMs + DUCK_RAMP_MS + 1), 1);
  // Never a jump: 10 ms steps through the ramp move it by little.
  for (let ms = a.startMs - DUCK_RAMP_MS; ms < a.startMs; ms += 10) assert.ok(Math.abs(duckAt(t, ms + 10) - duckAt(t, ms)) < 0.025);
  assert.ok(Math.abs(20 * Math.log10(DUCK_GAIN) + 6) < 0.1);
});

test('what to play, what to make ready, and which words to show', () => {
  const t = sitVoiceTimeline(fake, 10 * MIN);
  const [a, b] = t.sections;
  assert.equal(voiceAt(t, 0).playing, null);
  assert.equal(voiceAt(t, 0).next?.index, 0);
  assert.deepEqual(voiceAt(t, a.startMs + 1500).playing, { section: a, intoMs: 1500 });
  assert.equal(voiceAt(t, a.endMs + 1).playing, null);
  assert.equal(voiceAt(t, b.startMs - 5_000).next, b);
  assert.equal(voiceAt(t, b.startMs - 60_000).next, null);
  assert.equal(captionAt(t, a.startMs - 1), null);
  assert.equal(captionAt(t, b.startMs - 1), a);
  assert.equal(captionAt(t, 99 * MIN), t.sections[2]);
});

test('a program track starts its sections on their cues, and offers only the lengths it fits', () => {
  const program = programById('grounding')!;
  const track: VoiceTrack = {
    ...fake,
    scriptId: undefined,
    programId: 'grounding',
    sections: [
      { file: '01.m4a', ms: 15_000, cue: 0, text: 'Feel where you are held.' },
      { file: '02.m4a', ms: 20_000 },
      { file: '03.m4a', ms: 40_000, cue: 2 },
      { file: '04.m4a', ms: 20_000, cue: 4 },
    ],
  };
  const c = compile(program, 10);
  const t = programVoiceAt(track, program, 10);
  assert.equal(t.fits, true);
  assert.equal(t.sections[0].startMs, Math.round(c.cues[0].atMs));
  // The section without a cue shares the time before the next cue: the quiet before and after it is even.
  assert.ok(Math.abs(t.sections[1].startMs - t.sections[0].endMs - (t.sections[2].startMs - t.sections[1].endMs)) <= 2);
  assert.ok(t.sections[1].startMs - t.sections[0].endMs > 5_000);
  assert.equal(t.sections[2].startMs, Math.round(c.cues[2].atMs));
  assert.equal(t.sections[3].startMs, Math.round(c.cues[4].atMs));
  assert.equal(t.sections[0].text, 'Feel where you are held.');
  // Made from a script's recording, the script's own lines are its words.
  const fromScript = programVoiceAt({ ...track, scriptId: 'grounding', sections: track.sections.map((s, i) => ({ ...s, text: undefined, line: [0, 1, 3, 11][i] })) }, program, 10);
  assert.equal(fromScript.sections[2].text, 'Imagine roots growing from the base of your spine, down through the floor.');
  assert.deepEqual(programVoiceLengths(track, program), [10, 15, 20]);
  // A section too long to finish before the next cue: that length doesn't fit.
  const long = { ...track, sections: track.sections.map((s, i) => (i === 2 ? { ...s, ms: 5 * MIN } : s)) };
  assert.equal(programVoiceAt(long, program, 10).fits, false);
  assert.deepEqual(programVoiceLengths(long, program), [15, 20]);
  // A cue the program hasn't got.
  assert.equal(programVoiceAt({ ...track, sections: [{ file: '01.m4a', ms: 1000, cue: 40 }] }, program, 10).fits, false);
});

test('a site path is played from the website; a full address as it is', () => {
  assert.equal(voiceUrl('/audio/meditation/x/01.m4a', 'https://saltandsovereignty.com'), 'https://saltandsovereignty.com/audio/meditation/x/01.m4a');
  assert.equal(voiceUrl('/audio/meditation/x/01.m4a', ''), '/audio/meditation/x/01.m4a');
  assert.equal(voiceUrl('https://cdn.example/01.m4a', 'https://saltandsovereignty.com'), 'https://cdn.example/01.m4a');
});
