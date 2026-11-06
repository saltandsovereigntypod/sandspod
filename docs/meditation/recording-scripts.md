# Recording the guided meditations

Ashley, these are the seven written meditations from the app's Meditation screen, set out for reading aloud. Once you've recorded one, it becomes "Guided by voice" in the app: your voice plays as a layer in the sound mixer, over whatever rain, fire, drone or noise the listener chooses, and the quiet between your sections stretches to fit any length of sit. A 10 minute sit and a 45 minute sit use the same recording. Your words are never cut or sped up; only the silences grow.

Nothing goes live until a recording has been through the ingest step and added to the app, so there's no rush and no wrong first take.

## How to record

- **One take per meditation.** Start recording, read the whole thing from section 1 to the end, stop. No need to cut anything yourself.
- **About 3 seconds of quiet between sections.** That pause is how the app finds where one section ends and the next begins. Count three slow breaths in your head if it helps. Longer is fine; shorter than about 2½ seconds and two sections may run together.
- **Inside a section, keep pauses short.** A `[pause]` mark means one easy breath, a second or so. Not the full three seconds, or the section will be split in two.
- **Fluffed a line?** Just pause, take a breath, and say the whole section again from its start. Leave the mistake in; tell me which section it was (or roughly when), and I'll take out the wrong one.
- **Any mic, any format.** Your podcast mic is ideal, a phone's voice memo app is fine. WAV, M4A, MP3, whatever it saves. A quiet room with soft things in it (a bedroom with curtains drawn, a wardrobe of clothes behind you) matters more than the mic.
- **Keep the same distance from the mic** throughout, and a little further back than for the podcast: these are quiet and close, not presenting.
- **Leave a couple of seconds of room quiet** at the start and end of the file.
- **Upload to Google Drive** and send me the link, one file per meditation, named after it (for example `grounding.m4a`).

The words below match what shows on screen as you speak them. If a phrase doesn't sit right in your mouth, say it your way; tell me, and I'll change the words on screen to match.

### What the marks mean

- `[pause]` one easy breath, inside a section (keep it under 2 seconds)
- `[long rest]` after a section: the app gives this silence a larger share of the spare time in a long sit, so the listener can stay there. You don't need to pause any longer when recording; it's done in the app.
- Each numbered section is one recorded part. Leave about 3 seconds before the next number.

### How it's put together (for me)

`node scripts/ingest-voice.mjs <recording> <trackId> --script <id> --expect <sections>` splits the take on the 3 second pauses, trims, evens the loudness to about -16 LUFS, saves mono AAC files to `audio/meditation/<trackId>/` and prints the entry for `app/src/lib/meditation/voiceTracks.ts`. Add the suggested mix below and a `rest` of 3 on each `[long rest]` section. For a program, add a second entry with the same `base` folder and both `scriptId` and `programId`, its own `id` (say `grounding-program`), and `cue` on the sections listed under "With a program" (numbered from 0 in the order the program's cues are written). The script's words then show as the captions.

---

## 1. Grounding & centring

`--script grounding --expect 13`

**Pace and tone:** slow and low, heavy like the earth. Let each breath-out be longer than you'd think. Warm, steady, unhurried: you're the solid thing in the room.

1. Sit with your feet flat on the floor [pause] and let your hands rest.
2. Breathe in slowly, [pause] and let the breath out a little longer than it came in.
3. Feel the weight of your body, held by the ground beneath you.
4. Imagine roots growing from the base of your spine, [pause] down through the floor.
5. They reach into the cool, dark soil, [pause] past stones and water, [pause] deeper with each breath.
6. Let anything you don't need sink down along them, into the earth, [pause] to be made new. `[long rest]`
7. Now draw the earth's steady strength up through the roots, [pause] as a tree draws water.
8. Let it rise through your legs and spine [pause] and settle in your belly.
9. Feel branches reach up from the crown of your head towards the sky.
10. Draw down light from above, through the branches, [pause] to meet the earth's strength at your heart.
11. Rest here, between earth and sky, [pause] steady and whole. `[long rest]`
12. Let the roots and branches draw gently back. [pause] Keep the steadiness.
13. When you're ready, open your eyes. [pause] You are here.

**Suggested mix:** Drone in D, soft · Brown noise, soft.

**With a program:** *Grounding* (binaural, 10 to 20 minutes). Section 1 on its first cue, 3 on the second, 4 on the third, 6 on the fourth, 12 on the last ("Come back gently"). The other sections fall between.

---

## 2. Clearing

`--script clearing --expect 10`

**Pace and tone:** a little brighter and lighter than grounding, with a sense of air moving. Let the out-breaths be audible on "breathe out". Clean, plain, quietly firm on the salt ring: this is setting a space, not asking.

1. Settle where you are [pause] and let your shoulders drop.
2. Breathe in through your nose, slowly, [pause] and out through your mouth.
3. With each breath out, let go of the day: [pause] its errands, its noise, its worries.
4. Imagine them leaving you as grey smoke, [pause] carried away and thinning to nothing.
5. Breathe in clear, bright air, [pause] and feel it fill you from your feet to your crown.
6. Notice anything still clinging: [pause] a thought, a tightness. [pause] Breathe it out too. `[long rest]`
7. Picture a ring of salt, or of soft light, [pause] around the place where you sit.
8. Inside it, only what you invite may stay.
9. Breathe in clean and steady. [pause] Breathe out what remains. `[long rest]`
10. You are clear, and ready to begin.

**Suggested mix:** Pink noise, soft · Singing bowls, 432 Hz only, every 60 seconds, soft.

**With a program:** *Clearing & cleansing* (10 to 20 minutes). Section 1 on its first cue, 5 on the second ("a clean light ... rising"), 7 on the third, 8 on the fourth, 10 on the last.

---

## 3. The three cauldrons

`--script cauldrons --expect 13`

**Pace and tone:** storytelling. Section 2 is the only place we name the source, so give it a little weight, as if passing on something old. Then slow and curious, especially "There is no wrong way": gentle, reassuring, no judgement in the voice.

1. Settle, [pause] and let your breathing slow.
2. The old Irish poem tells of three cauldrons within each of us. [pause] Find them now.
3. Low in your belly sits the cauldron of warming: [pause] the cauldron of the body, of health and strength.
4. See how it sits. [pause] Upright, tilted, or on its side. [pause] There is no wrong way.
5. Breathe warmth into it, [pause] and feel it settle on its base, gently filling. `[long rest]`
6. In your chest is the cauldron of motion, [pause] turned by joy and by sorrow.
7. Notice how it sits today. [pause] Let your breath steady it, a little at a time. `[long rest]`
8. In your head is the cauldron of knowledge, [pause] where inspiration is poured.
9. Imagine it turning upright to receive, [pause] and something bright beginning to fill it. `[long rest]`
10. Feel all three together: [pause] body, heart and mind, each held and warming.
11. Rest with them, [pause] and notice what each one asks of you. `[long rest]`
12. Let the images fade, [pause] and keep the warmth.
13. Breathe deeply, move your fingers, [pause] and come back.

**Suggested mix:** Fire, medium · Drone in A, soft.

**With a program:** none of the binaural programs follows the three cauldrons, so this one is for a timed sit.

The poem is "The Cauldron of Poesy", early medieval Irish. Using it as a meditation is modern; the app says so under the title.

---

## 4. Meeting a guide

`--script guide --expect 13`

**Pace and tone:** the slowest of the seven. A pathworking lives on the space you leave: let the pictures land before moving on. Calm and safe; on section 9 stay just as calm, it's permission, not a warning.

1. Close your eyes, [pause] and breathe until your body feels heavy and calm.
2. Before you is a path into a quiet wood. [pause] It is safe, and you can leave it whenever you wish.
3. Walk slowly. [pause] Notice the ground underfoot, [pause] the light through the leaves, [pause] the smell of the air.
4. The path opens into a clearing, [pause] with somewhere to sit.
5. Sit, and ask, silently, [pause] for a guide who has your good at heart to come.
6. Wait without hurrying. [pause] Something may come: a figure, an animal, a light, a feeling. [pause] Or nothing yet. `[long rest]`
7. If something comes, greet it with courtesy. [pause] Ask its name, if it will give one.
8. Ask if it has anything to show or tell you. [pause] Listen without forcing an answer. `[long rest]`
9. If anything feels wrong, thank it, stand, [pause] and walk back the way you came.
10. When it's time, thank whatever came, [pause] or the clearing itself.
11. Walk back along the path, out of the wood, [pause] the way you came in.
12. Feel your body in the chair again. [pause] Wriggle your fingers and toes.
13. Open your eyes. [pause] Note what you met before it fades.

**Suggested mix:** Rain, soft · Drone in E, soft. (A frame drum is lovely for journeying, but under speech it's busy; the listener can add it.)

**With a program:** *Trance & journeying* (20 to 60 minutes). Section 1 on its first cue, 2 on the second ("Find your way in"), 3 on the third, 6 on the fourth, 10 on the fifth ("Thank who you have met"), 12 on the sixth, 13 on the last.

---

## 5. Elemental journey

`--script elements --expect 12`

**Pace and tone:** let each element change your voice a touch. Earth low and still; air lighter, a little more breath in it; fire warmer, a bit more lift on "burn bright"; water soft and slow. Then even again for the close.

1. Settle, [pause] and breathe slowly and evenly.
2. Begin with earth. [pause] Feel your weight, your bones, the ground holding you.
3. Imagine a cave of cool stone around you, quiet and still. [pause] Rest in its steadiness. `[long rest]`
4. Now air. [pause] Feel the breath moving in and out of you, cool on its way in.
5. Imagine a hilltop and a wide sky, [pause] wind moving through your thoughts and clearing them. `[long rest]`
6. Now fire. [pause] Feel the warmth of your own body, your heart beating.
7. Imagine a hearth fire before you, its light and heat. [pause] What do you want to burn bright? `[long rest]`
8. Now water. [pause] Feel the moisture of your breath, the tides of your feeling.
9. Imagine a still pool. [pause] Look into it and let it show you what it will. `[long rest]`
10. Hold all four together: [pause] steady, clear, bright and deep.
11. Thank each element in turn, [pause] and let the images go.
12. Feel your body in the room. [pause] Breathe, and open your eyes.

**Suggested mix:** Rain, soft · Fire, soft.

**With a program:** none fits it closely, so this one is for a timed sit.

---

## 6. Body scan

`--script body --expect 13`

**Pace and tone:** plain and kind, almost matter-of-fact: noticing, not fixing. Very even. Let the list sections (3, 8, 10) move slowly, with a beat between each body part. Section 12 is the most important line in it; say it like you mean it.

1. Lie down or sit comfortably, [pause] and let your eyes close.
2. Bring your attention to your feet. [pause] Notice whatever is there, without changing it.
3. Move up to your ankles, [pause] your calves, [pause] your knees. [pause] Just noticing.
4. Your thighs and hips. [pause] Let them be heavy.
5. Your belly, rising and falling with the breath.
6. Your lower back, [pause] your upper back. [pause] Let them soften where they can.
7. Your chest, [pause] and the heart beating within it.
8. Your hands, [pause] your arms, [pause] your shoulders. [pause] Let your shoulders drop.
9. Your neck and throat. [pause] Your jaw: let it loosen.
10. Your face, [pause] your eyes, [pause] your forehead, [pause] the crown of your head.
11. Now feel the whole body at once, breathing. `[long rest]`
12. If your mind wandered, that is fine. [pause] You came back.
13. Take a deeper breath, stretch gently, [pause] and open your eyes.

**Suggested mix:** Brown noise, soft.

**With a program:** none. It ends by opening the eyes, so it doesn't suit *Sleep*; it's best in a timed sit.

---

## 7. Deep rest

`--script rest --expect 14`

**Pace and tone:** the quietest and slowest, almost half-asleep yourself, but clear enough to follow. Low volume, close to the mic. In section 3, leave a real breath after "a short, kind wish" so the listener can find theirs. Counting in section 8 is theirs to do: don't count aloud.

1. Lie down on your back, with something soft under your head and knees. [pause] Cover yourself if you'll be cool.
2. Let your body be completely still. [pause] You are resting, and you are awake.
3. Say to yourself a short, kind wish, [pause] in the present tense, as though it is already true. `[long rest]`
4. Bring your attention to your right hand: [pause] thumb, fingers, palm, wrist. [pause] Then your whole right arm.
5. Now your left hand and arm. [pause] Then your right leg, [pause] and your left.
6. Your back against the floor. [pause] Your belly. [pause] Your chest. [pause] Your face.
7. Feel the whole body as one, [pause] heavy and at ease.
8. Notice the breath without changing it. [pause] Count ten breaths backwards, slowly. `[long rest]`
9. If you lose count, simply begin again. [pause] There is nothing to achieve.
10. Imagine warmth, [pause] then coolness. [pause] Heaviness, [pause] then lightness.
11. Rest in the stillness that's left. [pause] Let it hold you. `[long rest]`
12. Say your wish to yourself again.
13. Begin to notice the room: [pause] the sounds, the air on your skin.
14. Move slowly, roll to one side, [pause] and sit up when you're ready.

**Suggested mix:** Brown noise, soft · Binaural layers, delta 2 Hz, soft (headphones; the app shows its usual note).

**With a program:** *Healing rest* (15 to 45 minutes). Section 2 on its first cue, 4 on the second, 8 on the third, 10 on the fourth, 13 on the last ("Slowly come back").

This is our own simple version in the style of yoga nidra, not a teaching of that tradition; the app says so under the title.

---

## Programs at a glance

| Script | Program | Section on each cue, in order |
| --- | --- | --- |
| Grounding & centring | Grounding | 1, 3, 4, 6, 12 |
| Clearing | Clearing & cleansing | 1, 5, 7, 8, 10 |
| Meeting a guide | Trance & journeying | 1, 2, 3, 6, 10, 12, 13 |
| Deep rest | Healing rest | 2, 4, 8, 10, 13 |
| The three cauldrons, Elemental journey, Body scan | none | timed sits only |

The same recording serves both: the program's version points at the same files. In a program your words show in place of the program's own cue text. The app only offers the program lengths your recording fits in, so the very shortest may drop out.
