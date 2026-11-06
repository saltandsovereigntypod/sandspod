# Salt & Sovereignty Tarot: Style Guide

Version 2.0 (replaces v1.0, the candlelit oil-painting direction, which the owner rejected). Art is generated with Canva AI. The frame, numerals and names are added in code.

Owner brief: *"Needs to feel S&S but witchy, and less realistic looking. I would be happier without using people at all. A mossy wooded forest with sunshine and moonlight, and Hekate as an undertone but not prominent. Wandering Moon tarot meets the attached image."* The attached image is the owner's own Moon/Sun pair, and it is the visual anchor for this guide.

---

## 1. Principles

1. **An illustrated forest, not a photograph.** Every card looks like a hand-drawn ink illustration, washed with watercolour and gouache and picked out in gold leaf. Nothing photoreal and no glossy 3D.
2. **No people, ever.** No human figures, faces, hands, silhouettes or statues of people. Majors and courts are shown through landscapes, creatures, plants, objects and light.
3. **Meaning first.** Each card keeps its Rider-Waite-Smith (RWS) meaning, carried by symbols and creatures that a reader can still recognise.
4. **One forest.** Every card is a place in the same mossy wood: the same moss, stones, light and gold linework. Each suit has its own corner of that forest.
5. **Hekate is felt, not seen.** She appears only through quiet signs (section 6), never as a figure.
6. **AI paints, code finishes.** The AI makes only the art panel. The border, hanging ornaments, name plate and back are drawn in code, so they are crisp and identical on every card.

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

- **Ink line:** fine, slightly irregular sepia-black outlines on stones, bark, leaves and creatures. It should look drawn, not traced.
- **Watercolour and gouache:** soft washes with visible paper grain, granulation in shadows, and opaque gouache highlights on moss, petals and water glints.
- **Gold leaf:** thin gold linework for celestial things (moon and sun halos, stars, hanging chains, carved symbols). It is used as accent, never as a flat fill.
- **Detail density:** rich in the foreground (ferns, mushrooms, small crystals, flowers) and simpler in the background, so the subject reads at thumbnail size.

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

Accents allowed in small amounts: foxglove pink, heather purple, labradorite blue, ember orange (Wands only), and pale mushroom cream.

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

- Vertical panel, ratio about 0.58 (62 x 107 mm). One clear subject sits in the middle third. The sky or canopy sits in the top quarter, and stays fairly clear so the code-drawn hanging ornaments read against it.
- Foreground framing of ferns, moss mounds and mushrooms in the bottom quarter. Keep the bottom 8% simple, because the name plate overlaps that zone slightly.
- Creatures are naturalistic in anatomy but softly stylised, not cartoon. No clothes, no human expressions, and no anthropomorphic poses.
- Count matters: numbered minors show the exact number of suit objects, and they must be countable.

### Avoid on every card

People or any part of a person; text or letters in the art; painted borders or frames; photoreal rendering; neon or saturated digital glow; gore; skulls as a focal point; closed-practice regalia; copied Wandering Moon or RWS compositions.

---

## 3. Frame spec (built in code)

The frame follows the owner's reference and is drawn with Pillow (`tarot2-frame.py` in the session scratchpad; a production copy belongs in `scripts/tarot/`).

- **Card:** 70 x 120 mm. App export 600 x 1030 px, rendered at 4x and downsampled.
- **Ground:** deep forest black `#0E110D` behind everything, with rounded outer corners (radius about 3 mm).
- **Border:** a thin gold double line, outer line 1.5 mm from the edge and inner line 0.6 mm inside it, in `#C9A54C`, with a 0.2 mm `#6E5524` shadow. The corners are softly rounded, with a small dot-and-dash at each corner.
- **Art panel:** inset inside the inner line, with a top arch rising slightly at the centre, as in the reference. A soft 3 mm vignette at the edges blends into black.
- **Hanging ornaments:** code draws four thin gold chains from the top arch, set symmetrically: two long ones ending in crescents facing outward, and two short ones ending in four-point stars. The **centre ornament is painted by the AI** (prompt slot `[ornament]`): a triple moon or crescent for moon cards, a rayed sun for sun cards, and a sun-and-crescent for dawn or dusk cards. That way it can glow into the scene. Code never adds a second centre emblem.
- **Name plate:** a dark band (`#14170F`, 88% opaque over the art) across the bottom 11% of the card, with gold double-line top and bottom rules. The name is centred in **gold serif capitals** (Cormorant Garamond SemiBold, tracking +12%). Long names go on two lines ("WITCH" / "OF WANDS").
- **Plate emblems:** one gold emblem left and one right of the name.

| Group | Emblem |
|---|---|
| Moon Majors (High Priestess, Moon, Star, Hermit, Death, Hanged One) | Crescent moons facing inward |
| Sun Majors (Sun, Empress, Emperor, Strength, Chariot, Lovers, Fool) | Rayed suns |
| Remaining Majors | Eight-point star |
| Wands | Wand: shaft with a lozenge crystal tip |
| Cauldrons | Small cauldron with three steam lines |
| Athames | Upright blade with crossguard |
| Pentacles | Circled pentagram |

- **Numeral:** a small gold Roman numeral (Majors) or rank (minors) is set centred on the top border, on a tiny black cartouche between the hanging chains.
- **Card back:** deep forest black, double gold border, a centred triple moon over a three-way path mark, mirrored top and bottom so it reads the same reversed. No text.

The frame script `tarot2-frame.py` implements this spec; the test cards were framed with it.

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
- Gold celestial linework (crescents, stars, rayed suns).

The owner's wand (aspen and labradorite) appears whenever a wand is shown.

---

## 7. Prompt template (Canva AI generate-image, `PORTRAIT_9_16`)

```
Hand-illustrated tarot card art in ink linework with watercolour and gouache
texture and fine gold-leaf linework; storybook botanical illustration, not
photorealistic. NO people, no human figures, no faces, no hands, no text, no
letters, no border, no frame.
Scene: [CARD NAME]. [SUBJECT: creature, place or object, with suit objects counted].
[SETTING: suit corner of the mossy forest]. [2-4 FOREGROUND DETAILS: ferns,
mushrooms, crystals, flowers]. [OPTIONAL: one Hekate sign].
[LIGHT: moonlit silver-violet | warm sunlit gold | dusk/dawn blend].
Palette moss green, bark brown, dusk violet, moonlit silver, sunlit gold, deep
forest black. Fine gold celestial linework: [ornament] hanging on a thin gold
chain from the top of the picture. Quiet, witchy, whimsical, richly detailed,
vertical composition.
```

Rules: generate once per card, and regenerate at most once, only when the result is clearly off-brief (a person appears, text appears, it looks photoreal, or the count is wrong). Crop to 0.58 in code.

### Test-card prompts (the slots filled)

**The High Priestess (II, moon).** Scene: The High Priestess as a place. Deep in a mossy wooded forest at night, two tall moss-covered standing stones, one pale grey and one near-black, flank a still dark forest pool that mirrors a full silver moon above. Between the stones hangs a veil of trailing moss and silver ivy strung with small pomegranates. A closed old leather book with a crescent-moon clasp rests on a mossy ledge at the foot of the pale stone. A faint triple-moon symbol is carved into the dark stone. White lilies and ferns at the water's edge, glowing pale mushrooms, small quartz crystals, fireflies. Moonlit silver-violet light. Gold ornament: a crescent and tiny stars.

**Ace of Cauldrons (water, dawn).** Scene: Ace of Cauldrons. In a mossy wooded forest beside a small waterfall, a single small black iron cauldron sits on a moss-covered rock, brimming over with clear glowing water that spills in five thin streams into a pool with water lilies. A pale moth hovers above the rim; dew on ferns; a crescent moon reflected in the pool; tiny mushrooms and small crystals. Dawn light: soft sunlit gold blending into silver-violet mist. Gold ornament: a sun-and-crescent.

**Witch of Wands (fire, sun).** Scene: Witch of Wands. A sleek black cat with amber eyes sits upright on a sun-warmed mossy stone in a clearing at the edge of an oak and aspen forest. Leaning against the stone is a wand of pale aspen wood tipped with a labradorite crystal flashing blue and gold. Tall sunflowers and foxgloves, ferns and small mushrooms, a small old iron lantern glowing on the stone, golden embers and dandelion seeds drifting. Warm late-afternoon sunlight. Gold ornament: a radiant sun.

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

1. Fill the template, then generate once (`PORTRAIT_9_16`).
2. Reject and regenerate (once) only for people, text, photorealism or a wrong count.
3. Crop to 0.58 and frame with the frame script; check the plate wording against `app` ids.
4. Check at thumbnail size: does the subject still read?
5. Export WebP 600 x 1030 plus a thumbnail; make print masters later from the upscaled art.
