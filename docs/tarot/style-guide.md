# Salt & Sovereignty Tarot: Style Guide

Version 3.0. v3 keeps the v2 forest, light and Hekate direction but makes every card **simpler**: one centred subject, flatter illustration, fewer gold lines and a plainer frame (owner, round 2: *"getting there, but I'm still wanting a little more simple of cards"*). v1.0, the candlelit oil-painting direction, was rejected. Art is generated with Canva AI. The frame, numerals and names are added in code.

Owner brief: *"Needs to feel S&S but witchy, and less realistic looking. I would be happier without using people at all. A mossy wooded forest with sunshine and moonlight, and Hekate as an undertone but not prominent. Wandering Moon tarot meets the attached image."* The attached image is the owner's own Moon/Sun pair, and it is the visual anchor for this guide.

---

## 1. Principles

1. **An illustrated forest, not a photograph.** Every card looks like a hand-drawn ink illustration, washed with watercolour and gouache and picked out in gold leaf. Nothing photoreal and no glossy 3D.
2. **No people, ever.** No human figures, faces, hands, silhouettes or statues of people. Majors and courts are shown through landscapes, creatures, plants, objects and light.
3. **Meaning first.** Each card keeps its Rider-Waite-Smith (RWS) meaning, carried by symbols and creatures that a reader can still recognise.
4. **One forest.** Every card is a place in the same mossy wood: the same moss, stones, light and gold linework. Each suit has its own corner of that forest.
5. **Hekate is felt, not seen.** She appears only through quiet signs (section 6), never as a figure.
6. **AI paints, code finishes.** The AI makes only the art panel. The border, top ornament, name plate and back are drawn in code, so they are crisp and identical on every card.

Mood reference: Wandering Moon tarot (whimsical, botanical, hand-illustrated, nature instead of people). Use it for mood only. Never copy its compositions, creatures-per-card or designs.

### Suit and court vocabulary

| Traditional | S&S name | Object |
|---|---|---|
| Wands | **Wands** | The owner's wand: pale aspen shaft, labradorite tip flashing blue and gold |
| Cups | **Cauldrons** | Small black iron cauldrons, brimming or steaming |
| Swords | **Athames** | Selenite athame: translucent white-gold blade, plain dark handle |
| Pentacles | **Pentacles** | Gold or brass discs engraved with a pentagram |
| Page / Knight / Queen / King | **Seeker / Wanderer / Witch / Elder** | Shown as creatures or places (section 5) |

The app keeps traditional ids and names (`cups-13` = Queen of Cups). The S&S names are used on the card face and in art briefs. Rank numbers in ids: 01 = Ace, 11 = Seeker, 12 = Wanderer, 13 = Witch, 14 = Elder.

---

## 2. Visual language

### Technique

- **Simple first:** a flat, clean storybook illustration that reads at phone thumbnail size. Less texture and fine detail, more calm space.
- **Ink line:** confident, even dark outlines on the subject and the few supporting shapes. Background trees can be flat silhouettes with no outline.
- **Washes:** soft flat watercolour or gouache washes with gentle gradients in sky and mist. No dense granulation, hatching or busy texture.
- **Gold:** in the art, only as small glints (moonlight on water, a crystal, a sunlit rim). All gold ornament is drawn by the frame code.

### Palette

| Role | Colour | Hex |
|---|---|---|
| Moss green (main mid-tone) | deep and olive mosses | `#4F6B3A` / `#7A8C4E` |
| Bark brown | trunks, earth, roots | `#5A4330` |
| Dusk violet | skies, shadows, heather | `#5B4A6E` |
| Moonlit silver | moon, mist, water | `#C9CED6` |
| Sunlit gold | sun, gold leaf, highlights | `#D8B25A` |
| Deep forest black | edges, deepest shadows | `#0E110D` |
| Frame gold (code only) | border, ornaments, type | `#C9A54C` |

Each card uses **3 or 4 of these colours plus gold**, chosen by its light (below). Accents allowed in very small amounts: foxglove pink, heather purple, labradorite blue, ember orange (Wands only), and pale mushroom cream.

### Light logic

| Card type | Light |
|---|---|
| Sun-ruled cards (The Sun, Strength, The Empress, Wands) | Warm sunlit gold: shafts through the canopy, golden haze |
| Moon-ruled cards (The Moon, The High Priestess, Cauldrons, The Star) | Silver-violet moonlight, cool mist, glints on water |
| Most other cards | **Dusk or dawn blend:** gold on one side, silver-violet on the other, with the change visible in the sky |
| Athames | Cool, clear dawn or windy grey-violet daylight |
| Pentacles | Dappled late-afternoon gold on the forest floor |

There is always a visible light source (moon, sun, lantern, glow-worms, fireflies, glowing fungi). The edges fall off into deep forest black, so the gold frame sits on darkness, as in the reference.

### Composition

- Vertical panel, ratio about 0.58 (62 x 107 mm). **One focal subject, centred**, filling about the middle half of the panel.
- **Generous empty space** around it: open sky, mist, still water or dark forest silhouette. The top fifth stays clear for the frame ornament.
- **At most 2 or 3 supporting elements** (for example a few ferns, one mushroom cluster, one moth). No clutter of flowers, crystals or hanging things.
- Keep the bottom 8% plain (ferns or moss in silhouette), because the name plate overlaps it.
- Creatures are softly stylised, not cartoon. No clothes, no human expressions, and no anthropomorphic poses.
- Count matters: numbered minors show the exact number of suit objects, arranged simply (a row, arc or stack) so they can be counted at a glance.

### Avoid on every card

People or any part of a person; text or letters in the art; painted borders or frames; photoreal rendering; neon or saturated digital glow; busy texture, hanging ornaments or clutter in the art; gore; skulls as a focal point; closed-practice regalia; copied Wandering Moon or RWS compositions.

---

## 3. Frame spec (built in code)

The frame is drawn with Pillow (`tarot3-frame.py` in the session scratchpad; a production copy belongs in `scripts/tarot/`). It is deliberately plain so the art carries the card.

- **Card:** 70 x 120 mm. App export 600 x 1030 px, rendered at 4x and downsampled.
- **Ground:** deep forest black `#0E110D`, rounded outer corners (radius about 3 mm).
- **Border:** a **single thin gold line** (`#C9A54C`, 0.25 mm) 1.8 mm from the edge, with a small gold corner mark (a dot and two short ticks) inside each corner. No double lines, arch or chains.
- **Art panel:** a plain rectangle inside the border with a 1 mm black margin and a soft vignette into black at the edges.
- **Numeral:** small gold serif Roman numeral (Majors) or rank (minors) centred at the top, sitting in a short gap in the border line.
- **Top ornament:** one small gold emblem centred just under the numeral, and nothing else: a crescent for moon cards, a rayed sun for sun cards, or the suit emblem for minors.
- **Name plate:** a plain dark band (`#14170F`, about 90% opaque) across the bottom 10%, with one thin gold rule on top. The name is centred in **gold serif capitals** (Cormorant Garamond SemiBold, tracking +12%). Long names go on two lines ("WITCH" / "OF WANDS"). No side emblems.

| Group | Top ornament |
|---|---|
| Moon Majors (High Priestess, Moon, Star, Hermit, Death, Hanged One) | Crescent moon |
| Sun Majors (Sun, Empress, Emperor, Strength, Chariot, Lovers, Fool) | Rayed sun |
| Remaining Majors | Eight-point star |
| Wands / Cauldrons / Athames / Pentacles | Wand with lozenge tip / cauldron with steam / upright blade / circled pentagram |

- **Card back:** deep forest black, single gold border with corner marks, one centred triple moon. Symmetric so it reads the same reversed. No text.

Exports: `00-the-fool.webp` and similar at 600 x 1030 (WebP q85), thumbnails at 200 x 343, and print masters at 898 x 1488 px minimum (76 x 126 mm with bleed, 300 dpi; AI-upscale 2x and check softness first).

---

## 4. Suit settings

| Suit | Element | Corner of the forest | Recurring flora and fauna |
|---|---|---|---|
| **Wands** | Fire | Sunlit oak-and-aspen edge, bracken slopes, a hearth-stone clearing | Foxglove, sunflower, gorse, embers, salamanders, foxes |
| **Cauldrons** | Water | Moss-banked springs, pools, waterfalls, mist | Water lily, willow, iris, frogs, swans, herons, moths |
| **Athames** | Air | High birch-and-yew ridge, wind-bent pines, standing stones, mist | Thistle, heather, feathers, ravens, hawks, owls |
| **Pentacles** | Earth | Deep old-growth floor, roots, hollow logs, a wild herb garden | Mushrooms, acorns, ivy, crystals, badgers, rabbits, deer |

Majors may sit in any corner of the forest that suits their meaning, and may borrow from two corners.

---

## 5. Court scheme (no people)

Each rank keeps one rule across every suit, and each suit picks the creature or place that fits it:

- **Seeker** (Page): a young creature or a sprouting thing, curious and new.
- **Wanderer** (Knight): a creature in motion, or a path being travelled.
- **Witch** (Queen): a familiar creature at rest beside a spell-laden still life (the suit object, herbs, a lantern).
- **Elder** (King): an ancient tree, stone or elder beast that holds the ground.

| Card | Wands (fire) | Cauldrons (water) | Athames (air) | Pentacles (earth) |
|---|---|---|---|---|
| **Seeker** | Young fire salamander curled on a sprouting wand | Small green frog on a lily pad beside a thimble-sized cauldron | Fledgling raven on a birch twig, an athame in the moss below | Oak seedling sprouting from a split acorn beside a pentacle |
| **Wanderer** | Red fox at full run through sunlit bracken, a wand fallen across the path | White swan gliding downstream, a cauldron borne on a lily raft | Hawk diving through wind-torn mist, an athame stuck in the crag | Badger on a slow root path, a pentacle on the trail ahead |
| **Witch** | Black cat seated on a sun-warmed stone with the wand and a lantern | Grey heron still at a moonlit pool, a steaming cauldron on the bank | Barn owl on a yew bough above a selenite athame and feathers | Brown rabbit in a wild herb garden, a pentacle among the roots |
| **Elder** | Lightning-split oak still crowned in leaf, a wand in its fork | Ancient willow over a waterfall, a cauldron cradled in its roots | Wind-carved standing stone on the ridge, an athame set upright before it | Old red stag in a mossy glade, a pentacle hung in its antlers |

---

## 6. Hekate undertone and recurring motifs

Hekate is a quiet presence that a reader notices on the second look. Use **at most one or two** of these signs per card, and leave most numbered minors without any:

- Keys: an old iron key on a ledge, or a keyhole in a stone.
- Torches or lanterns, often as a pair.
- Three-way paths: a crossroads where three trails meet.
- Strophalos or triple-moon marks, carved faintly into stone or bark.
- Yew and cypress trees, and dark berries.
- A black dog or polecat, used **rarely**, half in shadow (The Moon, Death, Three of Athames or similar; no more than four cards in the deck).

Recurring S&S motifs:

- Moss-covered standing stones and stepping stones.
- Glowing pale mushrooms and fireflies.
- Small quartz and amethyst crystals.
- Ferns.
- Still water that reflects the sky.

The owner's wand (aspen and labradorite) appears whenever a wand is shown.

---

## 7. Prompt template (Canva AI generate-image, `PORTRAIT_9_16`)

```
Simple flat illustrated tarot card art, clean confident ink outlines, soft flat
watercolour washes, limited palette of [3-4 COLOURS] with small gold accents;
minimal detail, lots of empty space, readable as a small thumbnail; storybook
illustration, not photorealistic. NO people, no figures, no faces, no hands, no
text, no letters, no border, no frame.
Scene: [CARD NAME]. One clear centred subject: [SUBJECT, suit objects counted].
[EMPTY SPACE: sky, mist, water or dark forest silhouette around it].
Only two supporting details: [e.g. a few ferns at the bottom edge, one moth].
[OPTIONAL: one Hekate sign]. Quiet, witchy, [serene | warm], vertical composition.
```

Rules: generate once per card, and regenerate at most once, only when the result is clearly off-brief (a person, text, photorealism, clutter, or a wrong count). Crop to 0.58 in code.

### Test-card prompts (subject lines)

- **The High Priestess (II, moon; teal-black, moss, violet, silver):** two simple moss-topped standing stones, one pale and one dark, either side of a small round pool reflecting a large full moon in an empty night sky; a few ferns; a faint crescent carved on one stone.
- **Ace of Cauldrons (dawn mist; same palette):** one small black iron cauldron on a round mossy stone, brimming with glowing silver water spilling into a still pool; one pale moth; a few ferns.
- **Witch of Wands (sun; black, moss, sunlit gold, violet):** a black cat with amber eyes sitting upright on a smooth mossy stone, the aspen-and-labradorite wand leaning against it; golden haze behind; a few ferns and one foxglove.

---

## 8. Major Arcana direction (no people)

| # | Card | Subject | Light |
|---|---|---|---|
| 0 | The Fool | A young white hare mid-leap over a stream at a cliff-edge path, a bundle of wildflowers on the bank | Dawn gold |
| I | The Magician | A moss altar stone holding wand, cauldron, athame and pentacle, with a figure-eight vine above | Sun |
| II | The High Priestess | Two standing stones, a moon pool and a veil of moss (test card) | Moon |
| III | The Empress | A blooming meadow glade, a wheat sheaf and pomegranate tree, a doe resting | Sun |
| IV | The Emperor | A mountain crag with a ram on its throne-like ledge | Sun |
| V | The Hierophant | A three-tiered yew grove around an old stone with two crossed keys | Dusk |
| VI | The Lovers | Two intertwined trees, one oak and one hawthorn, under a single sun | Sun |
| VII | The Chariot | A pale stag and a black stag drawing apart on a forest track, with a crescent canopy overhead | Sun |
| VIII | Strength | A lynx resting its head beside a ring of flowers | Sun |
| IX | The Hermit | A lantern on a mossy peak at night, a single trail winding up | Moon |
| X | Wheel of Fortune | A fairy ring of mushrooms turning around a tree stump, with four creatures at the four quarters | Dusk |
| XI | Justice | A balanced stone cairn and an athame upright, with scales made of acorn cups | Dawn |
| XII | The Hanged One | A bat hanging calm from a yew branch, an upside-down view of the forest | Moon |
| XIII | Death | A skeletal old tree shedding leaves, with a white rose and new shoots at its foot and a black dog half in shadow | Dusk |
| XIV | Temperance | Water poured between two pools by a waterfall, with irises and a rainbow in the mist | Dawn |
| XV | The Devil | A tangle of briars and chains around two goats in a dark hollow, with the chains loose | Dusk, ember |
| XVI | The Tower | A lightning-struck hollow tree on a hill, with crows scattering | Storm |
| XVII | The Star | A clear star-lit pool with eight stars, an ibis at the edge | Moon |
| XVIII | The Moon | Standing stones and a moon path over water, with a dog and a wolf on either bank (reference card) | Moon |
| XIX | The Sun | A sunburst over a mossy stone with a waterfall and sunflowers (reference card) | Sun |
| XX | Judgement | A horn of light over a mossy ravine, with moths rising from the moss | Dawn |
| XXI | The World | A wreath of ivy and laurel around a forest pool, with the four suit creatures at the corners | Dusk blend |

Numbered minors follow their RWS meanings, set in the suit's corner with the exact count of objects. For example, Five of Pentacles shows five pentacles half-buried in snow beside a closed, lit hollow tree.

---

## 9. Production checklist

1. Fill the template (one subject, two supporting details), then generate once (`PORTRAIT_9_16`).
2. Reject and regenerate (once) only for people, text, photorealism or a wrong count.
3. Crop to 0.58 and frame with the frame script; check the plate wording against `app` ids.
4. Check at thumbnail size: does the subject read at once, with clear space around it?
5. Export WebP 600 x 1030 plus a thumbnail; make print masters later from the upscaled art.
