# Salt & Sovereignty Tarot: Style Guide

Version 1.0. Owner-approved art direction for the 78-card deck. Art is generated with Canva AI; frame, numerals and names are added programmatically.

---

## 1. Purpose and principles

This guide lets any session produce one consistent 78-card deck, one card at a time, without re-deciding the look.

1. **A candlelit altar painting.** Every card should look like it belongs with the app's existing altar object paintings: warm candlelight in a dark room, rich but painterly.
2. **Meaning first.** Each card keeps its Rider-Waite-Smith (RWS) core meaning in recognisable symbols, reinterpreted in our vocabulary (wand, cauldron, athame, pentacle).
3. **One hand.** Palette, light, brushwork and framing never change between cards, so the deck reads as one set.
4. **People are honoured.** The 38 people cards show a deliberate range of skin tones, bodies, genders and ages. Respectful, dignified, never stereotyped or sexualised, and no regalia from closed traditions.
5. **AI paints, code finishes.** The AI makes only the inner art panel. Text, numerals, frame and card back are made in code so they are crisp and identical everywhere.

### Suit and court vocabulary

| Traditional | Salt & Sovereignty | Object |
|---|---|---|
| Wands | **Wands** | The owner's own wand: aspen wood shaft, labradorite crystal tip (blue-gold flash) |
| Cups | **Cauldrons** | Black iron cauldrons, sometimes small, some steaming or brewing |
| Swords | **Athames** | Selenite athame: translucent white-gold blade, simple dark handle |
| Pentacles | **Pentacles** | Gold or brass discs engraved with a pentagram |
| Page | **Seeker** | Youth, any gender |
| Knight | **Wanderer** | Traveller, any gender |
| Queen | **Witch** | Any gender; the app keeps the traditional mapping |
| King | **Elder** | Any gender; the app keeps the traditional mapping |

The app keeps traditional ids and names ("Queen of Cups", `cups-13`). The S&S names are display and art names. Rank numbers in ids: 01 = Ace, 11 = Seeker (Page), 12 = Wanderer (Knight), 13 = Witch (Queen), 14 = Elder (King).

---

## 2. Visual language

### Palette

| Role | Name | Hex |
|---|---|---|
| Deepest background | Altar black | `#0B0D0A` |
| Background green | Forest night | `#10261C` |
| Mid green | Deep forest | `#1D4130` |
| Moss highlight | Lit moss | `#4C6B3E` |
| Metal | Antique gold | `#C9A54C` |
| Metal shadow | Old brass | `#8A6A2B` |
| Highlight | Cream | `#F0E4C8` |
| Flame core | Candle amber | `#F2B24A` |
| Flame glow | Ember | `#D9772B` |
| Accent (rare) | Labradorite blue | `#3F6F8C` |
| Accent (rare) | Wine | `#5A1F2B` |

Rule of thumb: about 60% dark greens/black, 25% warm gold/amber light, 10% cream, 5% accent. Accents (labradorite blue flash, wine cloth) appear only where the symbolism needs them.

### Lighting

- One dominant warm light source: a candle (or a few), low and slightly off-centre. Never flat or even lighting.
- Warm light falls off into deep shadow; faces and key objects sit in the pool of light.
- Gold and brass catch small highlights; selenite and crystal glow softly from within.
- A soft vignette darkens all four corners.
- Moonlight, where used, is a cool minor fill, never stronger than the candle.

### Texture and technique

- Painterly oil/gouache feel: visible but soft brushwork, slight canvas grain, rich glazed shadows.
- Realistic proportions and materials (iron, wax, wood, brass, cloth), but with painted rather than photographic edges.
- No hard digital outlines, no cartoon or anime look, no glossy 3D render look, no photographic noise.

### Composition rules

- **Vertical, single focal point**, readable at thumbnail size (the app shows small thumbs).
- Dark, simple backgrounds: a table edge, plain stone, foliage in shadow, or night sky. Few background elements.
- Keep the subject centred in the upper two-thirds with a calm lower third; the name plate sits over the bottom margin.
- Strong silhouette first, detail second.
- Majors and courts: one main figure (or the pair/group the card requires), mid or three-quarter length, filling the panel.
- Numbered cards: still-life tableau seen at a slight downward angle on the altar, objects clearly countable.

### Art panel size and safe margin

- Card: 70 x 120 mm (portrait). The frame, numeral band and name plate take the border, leaving an **inner art panel of about 62 x 107 mm, ratio about 0.58 (w:h)**.
- Generate art at a **0.58 ratio** (e.g. 1160 x 2000 px or larger). If Canva only offers fixed ratios, generate the closest taller portrait and crop to 0.58, keeping the subject in the safe area.
- **Safe margin:** keep every important element (faces, hands, key objects, symbols) at least **8% inside each edge** (about 5 mm on the card). The bottom **12%** is partly covered by the name plate's shadow/fade, so keep it calm.
- Let the background extend 3% past the safe area so cropping never reveals blank edges.

### What to avoid (all cards)

- **Any text, letters, numerals, runes or pseudo-writing** in the art (the AI garbles them).
- **Borders, frames, ornamental edges or card outlines** inside the art (the frame is added in code).
- Extra or missing fingers, merged limbs, duplicate faces, distorted hands. Prefer hands partly hidden, holding objects, or in shadow if they fail.
- Modern objects (phones, plastic, electric light, zippers), logos, watermarks, signatures.
- Cluttered or bright backgrounds; flat even lighting; neon or oversaturated colour.
- Skeletons or gore, nudity or sexualised poses, stereotyped portrayal, sacred regalia from closed traditions (no feather war bonnets, no specific ceremonial dress of living cultures).
- Cartoon, anime, 3D render, stock-photo, pixel-perfect vector look.

---

## 3. Prompt templates (Canva AI)

### 3a. Master template: Majors and courts (paste, fill the slots)

> Painterly candlelit altar painting, rich oil and gouache feel with soft visible brushwork and a gentle vignette, vertical tarot illustration for the card "{subject}". {composition}. {figure}. {motif}. {moon phase}. Warm candlelight is the main light source, falling into deep shadow; palette of deep forest green, near-black, antique gold, brass and cream, with a faint amber glow on faces and gold. Dark, simple background. Realistic proportions, dignified and respectful rendering, hands naturally formed. Aspect ratio 0.58 portrait, subject kept well inside the edges.

**Avoid line (append to every prompt or use the negative field):**

> Avoid: any text, letters, numbers or runes; borders, frames or card edges; extra or missing fingers, distorted hands; modern objects; logos or watermarks; cluttered or bright background; cartoon, anime, 3D render, photo look; skeletons, gore, nudity; cultural or religious regalia of any living tradition.

**Slots**

| Slot | What goes in it |
|---|---|
| `{subject}` | The traditional card name plus S&S name, e.g. "The High Priestess" or "Witch of Wands (Queen of Wands)" |
| `{composition}` | Framing and layout from section 6, e.g. "Seated figure, symmetrical, frontal, between two dark pillars" |
| `{figure}` | The cast line from section 5, turned into a description, plus clothing and pose |
| `{motif}` | The S&S motif(s) for this card (brand mark, salt circle, crossroads, key, torch, suit object) |
| `{moon phase}` | "A {phase} moon visible in the {place}" for Majors; for courts write "No moon" or a small phase if it suits |

### 3b. Still-life variant: numbered cards (Ace to 10)

> Painterly candlelit altar still life, rich oil and gouache feel with soft visible brushwork and a gentle vignette, vertical tarot illustration for the card "{subject}". A dark wooden altar table seen from a slight downward angle, with {composition}. {motif}. No people. The objects are arranged so that {meaning cue}. Warm candlelight from a single lit candle is the main light source, glinting on brass, iron and crystal and falling into deep forest-green and near-black shadow; palette of deep forest green, black, antique gold, cream and amber. Dark, simple background. Aspect ratio 0.58 portrait, objects kept well inside the edges, exactly {count} {object} clearly countable.

Same avoid line as 3a (the "No people" instruction is already in the template).

**Object rules for still lifes**

- Wands: the labradorite-tipped aspen wand, always with the same look (pale aspen shaft, faceted blue-gold crystal tip).
- Cauldrons: black iron, three-legged, from thimble-small to large; steam, brews, spills as the meaning requires.
- Athames: selenite blades, translucent white-gold, plain dark handles.
- Pentacles: gold or brass discs with a pentagram.
- Always countable: the number on the card equals the number of suit objects (Ace to 10). Other objects (candles, keys, salt, herbs, cloth) are props and must not be confused with the count.

---

## 4. Frame, typography, back and exports

### Frame (added in code, not painted)

- Thin gold Art Nouveau frame: slim double line with soft whiplash curves at the corners, small leaf or crescent flourishes at mid-edges. Line colour **`#C9A54C`**, with a subtle `#8A6A2B` shadow line. Outer margin about 3 mm; frame width about 0.6 mm at print size.
- Inside the frame, the art panel with rounded inner corners (about 2 mm radius).
- Behind frame and plates, a near-black fill `#0B0D0A` so that any art edge imperfections are hidden.

### Layout (70 x 120 mm)

| Zone | Content |
|---|---|
| Top plate (about 8 mm) | Numeral, centred: Roman numerals for Majors (0 to XXI, "0" for the Fool); for minors the rank ("Ace", "II" to "X") and a small suit glyph (wand, cauldron, athame, pentacle); courts show "Seeker", "Wanderer", "Witch", "Elder" |
| Art panel | About 62 x 107 mm, ratio 0.58 |
| Bottom plate (about 11 mm) | Card name centred, in a slightly lighter green plate `#10261C` with a gold hairline border and a tiny crescent-and-candle mark flanking the name where space allows |

### Typography

- **Names:** Cormorant Garamond (Medium or SemiBold), title case or small caps, letter-spacing +2%, colour `#C9A54C` (cream `#F0E4C8` for the second line).
- **Numerals and ranks:** Cormorant Garamond small caps (or Cormorant SC), colour `#C9A54C`.
- Long names break on two lines: main name large, S&S court name or "of Cauldrons" on a second, smaller line. Example: "Witch" / "of Cauldrons".
- The app displays the traditional name in readings; the card face shows the S&S names.
- Minimum text size: 9 pt at print size, with the plate wide enough for "Wheel of Fortune" and "Wanderer of Cauldrons" on one or two lines.

### Card back

- Deep green field (`#10261C` with a gentle `#1D4130` radial lift), fine gold border `#C9A54C` about 0.5 mm, inset 3 mm.
- Centre: the brand mark, a gold crescent moon cradling a lit candle (flame in amber), about 40% of the card width.
- **Symmetric and reversible:** the design must read identically when rotated 180 degrees (mirror the mark's ornament top/bottom; the mark itself sits on the centre point, with a small identical flourish above and below).
- No text. Optional faint salt-circle ring of dots around the mark.
- Built in code from vector shapes, not AI-painted.

### Exports

| Use | Size | Format |
|---|---|---|
| App card | **600 x 1030 px** | WebP (quality about 85) |
| App thumbnail | **about 200 x 343 px** (same ratio) | WebP |
| Print master | 70 x 120 mm plus 3 mm bleed = **76 x 126 mm at 300 dpi = 898 x 1488 px minimum** | PNG or PDF, sRGB (convert to CMYK at the printer) |

- File names follow the app ids: `00-the-fool.webp`, `wands-01.webp`, thumbs with a `-thumb` suffix.
- **Print note:** AI art from Canva may be below the pixel size the print master needs for the 62 x 107 mm art panel (about 733 x 1264 px at 300 dpi, more once the bleed area is included). Upscale (2x AI upscaler) and check for softness at 100% before approving for print; the app sizes are fine without upscaling.
- Extend the background colour into the bleed; keep the frame and plates inside the trim.

---

## 5. Figure casting (38 people cards)

Deck order: 22 Majors, then Wands, Cauldrons, Athames, Pentacles courts (Seeker, Wanderer, Witch, Elder each). Casting rules:

- No two **adjacent** cards (in deck order) share the same skin-tone band, gender presentation or age band; each is different in at least two of these.
- Across the deck: genders about one-third women, one-third men, one-third nonbinary/androgynous; ages spread from child to 80s; at least one crone (Witch or Hermit/Death) and one Elder of each suit above 60; a range of body types (slender, athletic, broad, round, plus-size, short, tall, one wheelchair or cane user).
- Skin tone is described by name, e.g. deep brown, warm brown, golden tan, olive, fair freckled, pale ruddy. Use the lighting to keep every tone luminous; never let dark skin disappear into the dark background (add warm rim light).
- Courts: Seekers are youthful (teens to 20s), Wanderers 20s to 40s, Witches 40s to 70s, Elders 60s to 80s. Any gender on any court; the table below is the deck's assignment.
- Clothing: simple robes, coats, aprons, cloaks, work clothes in the palette, plain and timeless; no sacred dress of any living tradition.

| Code | Card | Age | Skin tone | Body | Presentation |
|---|---|---|---|---|---|
| C01 | 0 Fool | 20s | warm light brown, freckled | lean, light | androgynous |
| C02 | I Magician | 40s | deep brown | broad, tall | man |
| C03 | II High Priestess | 50s | warm olive | tall, slender | woman |
| C04 | III Empress | 30s | rich umber | full-figured, soft | woman |
| C05 | IV Emperor | 60s | fair, ruddy, silver beard | stocky | man |
| C06 | V Hierophant | 50s | golden tan | medium, upright | nonbinary |
| C07 | VI Lovers | 30s | pair: copper-brown and fair with dark hair | one sturdy, one slight | woman and nonbinary person |
| C08 | VII Chariot | 20s | deep brown-black | athletic | woman |
| C09 | VIII Strength | 40s | pale, rosy | soft, gentle | man |
| C10 | IX Hermit | 70s | weathered tan-brown | thin, stooped, cane | androgynous elder, long white hair |
| C11 | X Wheel of Fortune | 30s | olive-brown | wiry, mid | woman |
| C12 | XI Justice | 50s | warm medium brown | broad, seated | man |
| C13 | XII Hanged Man | 30s | pale, cool | wiry | nonbinary |
| C14 | XIII Death | 60s | deep umber, silver locks | tall, gaunt (living person) | woman, crone, cowled |
| C15 | XIV Temperance | 30s | golden light brown | tall, graceful | androgynous (winged) |
| C16 | XV The Devil | 40s | ruddy fair | muscular, heavy | man; chained pair are two adults, mixed tones |
| C17 | XVI Tower | 20s | pair of falling figures: tan and brown | slight | woman and man |
| C18 | XVII Star | 20s | warm dark brown | slender, kneeling | woman |
| C19 | XVIII Moon | 50s | light brown | round, short | nonbinary |
| C20 | XIX Sun | 7 to 9 | medium brown, curly hair | small child | child, any |
| C21 | XX Judgement | all ages | varied: group of five to six, tones from pale to deep brown | varied | trumpeter androgynous, rest mixed |
| C22 | XXI World | 30s | golden olive | strong, dancer | androgynous |
| C23 | Seeker of Wands | teen | fair, sunburnt | thin, gangly | boy |
| C24 | Wanderer of Wands | 30s | deep brown | athletic | man |
| C25 | Witch of Wands | 50s | warm olive-tan | strong, medium | woman |
| C26 | Elder of Wands | 70s | pale, white beard | tall, lean | man |
| C27 | Seeker of Cauldrons | late teen | brown-black | slight | girl |
| C28 | Wanderer of Cauldrons | 20s | light brown | soft, medium | nonbinary |
| C29 | Witch of Cauldrons | 40s | rich warm brown | full-figured | woman |
| C30 | Elder of Cauldrons | 60s | golden tan | stocky, short | man |
| C31 | Seeker of Athames | teen | olive | slim | nonbinary |
| C32 | Wanderer of Athames | 40s | pale freckled | wiry, tall | woman |
| C33 | Witch of Athames | 70s | deep umber, white locks | tall, spare, crone | woman |
| C34 | Elder of Athames | 60s | warm brown | broad, wheelchair or cane | nonbinary |
| C35 | Seeker of Pentacles | 20s | golden tan | sturdy | woman |
| C36 | Wanderer of Pentacles | 30s | fair, ruddy | heavy, strong | man |
| C37 | Witch of Pentacles | 60s | medium brown | round, short | woman |
| C38 | Elder of Pentacles | 80s | pale, weathered | slight | androgynous |

---

## 6. Card-by-card art direction

Common to all: the S&S motifs (brand mark = gold crescent moon cradling a lit candle; salt circles; crossroads; keys and torches for the quiet Hekate thread) appear where listed. Moon phases per Major are listed in the Moon column; courts add a small moon only if listed. Cast codes refer to section 5.

### Major Arcana (22)

| Id | Card | Scene and key RWS symbols | S&S motif | Moon | Cast |
|---|---|---|---|---|---|
| `00-the-fool` | The Fool | Young traveller at a cliff edge at dawn-dusk, small bundle on a staff, white rose, small dog at heel; step into the unknown | Brand mark stitched on the pack; faint crossroads at the foot of the path | New moon, thin first rim | C01 |
| `01-the-magician` | The Magician | Standing at an altar with all four tools laid out (wand, cauldron, athame, pentacle), one hand raised with the wand, one pointing down; roses and lilies | Own labradorite wand raised; candle on altar; infinity-shaped salt loop | Waxing crescent | C02 |
| `02-the-high-priestess` | The High Priestess | Seated frontal between a dark pillar and a pale pillar, veil of pomegranates behind, scroll (blank) in lap, crescent at her feet | Key at her belt; salt circle round the seat | Full | C03 |
| `03-the-empress` | The Empress | Reclining on cushions in a lush glade, wheat at her feet, crown of stars, heart-shaped shield (plain), forest stream | Sheaf of grain tied with a key; candle in a bowl of fruit | Waxing gibbous | C04 |
| `04-the-emperor` | The Emperor | Enthroned on a stone seat carved with ram heads, red-gold robe, orb and sceptre, mountains behind | Torch bracketed beside the throne; salt line at the threshold | First quarter | C05 |
| `05-the-hierophant` | The Hierophant | Seated teacher between two pillars blessing two seated students, crossed keys at their feet | Crossed keys (Hekate thread); candle held by a student | Waning gibbous | C06 |
| `06-the-lovers` | The Lovers | Two figures facing each other under a bright winged presence (a lit sun-candle), tree of fruit and tree of flame behind them | Brand mark rising as the light above them; salt circle round their feet | Waxing gibbous | C07 |
| `07-the-chariot` | The Chariot | Driver in a stone-canopied chariot, one black and one white sphinx at rest, city wall behind, star canopy, wand | Torch in the driver's hand; crossroads on the road ahead | Waxing crescent | C08 |
| `08-strength` | Strength | Gently closing the jaws of a lion with bare hands; lemniscate above her head, flowers, mountain | Candle lit between them on a stone; salt circle ring | First quarter | C09 |
| `09-the-hermit` | The Hermit | Standing alone on a snowy peak, cloak and staff, lantern with a six-pointed star inside | Lantern is a candle lantern; faint crossroads and a torch trail below | Waning crescent | C10 |
| `10-wheel-of-fortune` | Wheel of Fortune | A great wheel on a dark sky, four winged creatures in the corners (lion, eagle, bull, angel as shapes), sphinx on top, serpent and jackal at sides | Wheel is a salt-and-gold circle; keys as spokes | All eight phases around the rim | C11 |
| `11-justice` | Justice | Seated between pillars holding upright athame and scales, crown, curtain behind | Selenite athame; scale pans hold a candle and a feather | Last quarter | C12 |
| `12-the-hanged-man` | The Hanged Man | Hung by one foot from a living branch, other leg crossed, hands behind back, calm face lit by a halo of candle light | Branch is aspen; brand mark glows as the halo | Waning gibbous (seen upside down) | C13 |
| `13-death` | Death | A tall cowled crone on a pale horse carrying a black flag with a white rose; sun rising between two towers; kneeling and standing small figures yield to her; living face, not a skull | Torch lit at dawn; salt circle where she passes; cauldron at the river | Waning crescent | C14 |
| `14-temperance` | Temperance | Winged figure with one foot on land, one in a pool, pouring water between two vessels (cauldron and cup), path to a glowing crown | Pouring between two small cauldrons; crossroads path to the light | Waxing and waning crescent, mirrored | C15 |
| `15-the-devil` | The Devil | Horned, bat-winged figure on a block, lit torch inverted; two chained figures below with loose chains (they can leave) | Inverted torch; chains with a broken key; salt circle drawn open | Last quarter | C16 |
| `16-the-tower` | The Tower | Lightning strikes a stone tower at night, crown blown off, two figures falling, flames and falling sparks | Torch flame becomes lightning; tower-top crowned by a snuffed candle; shattered salt circle | Dark moon (new moon, unlit) | C17 |
| `17-the-star` | The Star | Kneeling beside a pool, pouring water from two vessels (one onto land, one into water), one great eight-pointed star and seven small stars, ibis in a tree | Two vessels are small cauldrons; star is the candle flame reflected | Waxing crescent | C18 |
| `18-the-moon` | The Moon | Dog and wolf howling at the moon beside a pool, crayfish rising, a path between two towers; a lone figure walks the path | Moon holds the crescent-and-candle brand mark; crossroads; salt line along the path | Full, with a gentle halo | C19 |
| `19-the-sun` | The Sun | Child on a white horse with a red banner, sunflowers over a wall, great sun above | Candle-sun burst; sunflowers around a salt ring | Faint pale ghost of the last quarter in the day sky | C20 |
| `20-judgement` | Judgement | Angel with trumpet in the sky, figures rising from graves and arms raised, mountains | Trumpet's flame as torch; keys and salt scattered at the graves | Waning gibbous | C21 |
| `21-the-world` | The World | A dancer within a wreath holding two wands, four creatures in the corners, red ribbons | Wreath is aspen leaves with a gold key at each point; salt circle underfoot | Full at the centre, with four small marks for quarters | C22 |

### Wands (14)

Cards still-life unless a court. Wand = labradorite-tipped aspen.

| Id | Card | Scene and key RWS symbols | S&S motif |
|---|---|---|---|
| `wands-01` | Ace of Wands | One wand upright on the altar, budding with three new leaves, sparks at the crystal tip | Candle beside it; salt circle round its base |
| `wands-02` | Two of Wands | Two wands crossed upright in iron stands, a small globe of brass between them, a window of dark horizon | Key resting on a rolled map |
| `wands-03` | Three of Wands | Three wands planted in a row in a bowl of earth, looking out over a tiny harbour scene (painted ship model) | Candle at the water edge as lighthouse |
| `wands-04` | Four of Wands | Four wands as a garland-hung canopy over the altar, ribbons, a feast of fruit and bread under it | Candle at centre; crescent-and-candle mark on the cloth |
| `wands-05` | Five of Wands | Five wands crossed and clashing in a heap, scuffed, sparks flying | A salt circle scuffed and broken |
| `wands-06` | Six of Wands | One wand bound with a laurel wreath, five others laid as a victory fan, a ribbon | Brand mark pin on the ribbon |
| `wands-07` | Seven of Wands | One wand set high, defending against six lower wands rising at it | Torch lit among the six |
| `wands-08` | Eight of Wands | Eight wands flying in parallel across the panel like arrows, blue-gold tips trailing sparks | Candle flame tilted by speed |
| `wands-09` | Nine of Wands | Eight wands upright as a fence behind one wand leaning, a bandage-wrapped candle stub | Salt line along the fence |
| `wands-10` | Ten of Wands | Ten wands bundled in a heavy sheaf on the altar, strained cord, a sunken candle | Key tied to the bundle |
| `wands-11` | Seeker of Wands (Page of Wands) | Boy in a plain tunic holding a wand and studying its tip; desert dunes at dusk; salamander-pattern hem | Small torch at his feet; candle-lit wand tip | 
| `wands-12` | Wanderer of Wands (Knight of Wands) | On a rearing horse, wand held aloft, windswept cloak, desert and pyramids shapes in distance | Torch behind the saddle; crossroads sign |
| `wands-13` | Witch of Wands (Queen of Wands) | Enthroned with sunflower and wand, black cat at her feet, lions on the throne, confident | Own labradorite wand; candle in a sunflower |
| `wands-14` | Elder of Wands (King of Wands) | Throne with lion and salamander motifs, wand held like a staff, cloak flowing | Torch bracket; salt circle on the floor |

### Cauldrons (14)

Cups = cauldrons. Cauldrons are black iron; sizes and steam as noted.

| Id | Card | Scene and key RWS symbols | S&S motif |
|---|---|---|---|
| `cups-01` | Ace of Cauldrons | One black iron cauldron full to the brim, bright water overflowing in four streams onto the altar, a white dove-shaped steam above | Brand mark pressed on the cauldron's side |
| `cups-02` | Two of Cauldrons | Two small cauldrons touching rims, twin wisps of steam joining, two roses | Single candle between them |
| `cups-03` | Three of Cauldrons | Three cauldrons raised together in a triangle, harvest fruit and ribbons | Three candles lit |
| `cups-04` | Four of Cauldrons | Three cauldrons in a row, a fourth offered from the dark edge unnoticed, empty-handed shadow | Candle turned away |
| `cups-05` | Five of Cauldrons | Three spilled cauldrons on their sides, two still upright behind, spreading stain | Cracked salt circle; a path (bridge) behind |
| `cups-06` | Six of Cauldrons | Six small cauldrons each holding a flower or small gift, tidy, nostalgic glow | Candle in a toy-sized lantern |
| `cups-07` | Seven of Cauldrons | Seven cauldrons on a shelf of cloud-like steam, each with a different vision (jewels, wreath, serpent, tower, dragon-shape, veiled shape, laurel) | Candle behind a veil of steam |
| `cups-08` | Eight of Cauldrons | Eight cauldrons stacked neatly in the foreground, a path of moonlit dark leading off | Torch at the path's edge; crossroads |
| `cups-09` | Nine of Cauldrons | Nine cauldrons in a proud semicircle on a curved shelf, brews glowing, a plump contented arrangement | Candle at the centre |
| `cups-10` | Ten of Cauldrons | Ten cauldrons in a rainbow arc over a table with a little house shape of cloth, steam as a rainbow | Brand mark at the keystone |
| `cups-11` | Seeker of Cauldrons (Page of Cups) | Youth by water holding a cauldron from which a small fish peeks | Candle floating in the water |
| `cups-12` | Wanderer of Cauldrons (Knight of Cups) | Rides slowly on a pale horse holding a small cauldron level, stream and winged helm | Torch carried; crossroads at the bridge |
| `cups-13` | Witch of Cauldrons (Queen of Cups) | Seated on a driftwood throne at the shore, ornate lidded cauldron held in both hands, absorbed | Seashell-and-candle on the throne; salt line at the tide |
| `cups-14` | Elder of Cauldrons (King of Cups) | Throne afloat on gentle water, large cauldron in one hand, sceptre in the other, a fish and a ship behind | Salt circle on the water; candle on the ship |

### Athames (14)

Swords = athames. Selenite blades.

| Id | Card | Scene and key RWS symbols | S&S motif |
|---|---|---|---|
| `swords-01` | Ace of Athames | One selenite athame held up on a pale mountain peak (or upright on the altar), crowned with a wreath of laurel and olive | Candle behind the blade lights it |
| `swords-02` | Two of Athames | Two athames crossed on the altar over a blindfold, a still pool and a crescent behind | Single candle snuffed |
| `swords-03` | Three of Athames | Three athames piercing a dark red heart-shaped stone, rain falling | Candle drowned in a dish |
| `swords-04` | Four of Athames | Three athames hung on the wall, one laid flat on a stone slab; stained glass pane of a candle | Candle at the head |
| `swords-05` | Five of Athames | Three athames gathered in a fist-like bundle, two cast away on the ground, stormy sky | Torn salt circle |
| `swords-06` | Six of Athames | Six athames standing upright in a small boat on dark water, a far shore with a light | Torch on the far shore |
| `swords-07` | Seven of Athames | Five athames carried off bundled, two left behind in the ground; a shadow-tent | Key slipped from a pocket |
| `swords-08` | Eight of Athames | Eight athames planted in a loose ring around an empty bound cloth, puddles, a distant castle | Gap in the ring (way out); candle at the gap |
| `swords-09` | Nine of Athames | Nine athames hung on the dark wall above a bed with a quilt of astrological patches, a snuffed candle | Brand mark on the quilt, half-hidden |
| `swords-10` | Ten of Athames | Ten athames across a flat dark back-cloth, a dawn glow at the horizon | New candle lit on the horizon |
| `swords-11` | Seeker of Athames (Page of Swords) | Youth on a windy hill holding an athame raised, clouds racing, alert stance | Small torch at their feet |
| `swords-12` | Wanderer of Athames (Knight of Swords) | Charging on a horse through wind, athame forward, trees bending | Torch flame streaming back |
| `swords-13` | Witch of Athames (Queen of Swords) | Seated high on a throne with butterfly carvings, athame upright, hand raised in a cool, clear gesture, clouds | Key on a chain; salt line at the base |
| `swords-14` | Elder of Athames (King of Swords) | Throne with butterfly and crescent motifs, athame upright, stern clear gaze | Torch bracket; crossroads carpet pattern |

### Pentacles (14)

| Id | Card | Scene and key RWS symbols | S&S motif |
|---|---|---|---|
| `pentacles-01` | Ace of Pentacles | One gold pentacle disc resting on the altar, a garden gate arch and lilies painted behind it | Candle flame reflected on the disc |
| `pentacles-02` | Two of Pentacles | Two discs linked by a lemniscate of ribbon, a small ship on rolling waves painted behind | Candle swaying with the ribbon |
| `pentacles-03` | Three of Pentacles | Three discs set as arch-stones in a cathedral-like window frame | Brand mark carved on the keystone |
| `pentacles-04` | Four of Pentacles | One disc on a crown-shaped stand, one beneath it, two held at the sides, closed fingers | Key padlocked to the stack |
| `pentacles-05` | Five of Pentacles | Five discs set as a cut-out in a stained-glass window glowing in the snow outside | Candle in the window |
| `pentacles-06` | Six of Pentacles | Scales with six discs, some given, some received | Candle at the balance point |
| `pentacles-07` | Seven of Pentacles | Seven discs growing on a vine, a hoe leaning, tending | Candle watered by the vine |
| `pentacles-08` | Eight of Pentacles | Eight discs being engraved at a bench, tools laid out, a finished row | Candle as the workshop light |
| `pentacles-09` | Nine of Pentacles | Nine discs on vines in a walled garden, a hooded falcon perch (empty), a snail | Candle in a lantern at the gate |
| `pentacles-10` | Ten of Pentacles | Ten discs forming an arch over an old family altar, an archway and a hearth | Brand mark on the lintel |
| `pentacles-11` | Seeker of Pentacles (Page of Pentacles) | Youth in a green field holding one disc up and studying it, plough lines | Candle at the field edge |
| `pentacles-12` | Wanderer of Pentacles (Knight of Pentacles) | Rides a heavy dark horse slowly in a ploughed field, disc held steady | Torch at the field edge; crossroads of furrows |
| `pentacles-13` | Witch of Pentacles (Queen of Pentacles) | Seated in a garden throne wreathed in roses, holding a disc in her lap, a rabbit at her feet | Candle among roses; salt ring at the roots |
| `pentacles-14` | Elder of Pentacles (King of Pentacles) | Throne carved with bulls and vines, castle behind, disc in hand, grapes at his robe | Torch on the wall; key on the belt |

---

## 7. Style-test cards

Generate these three first to lock the look. Approve all three before any other card is made.

### 7a. The High Priestess (`02-the-high-priestess`, cast C03, full moon)

> Painterly candlelit altar painting, rich oil and gouache feel with soft visible brushwork and a gentle vignette, vertical tarot illustration for the card "The High Priestess". A woman in her fifties with warm olive skin, tall and slender, silver streaks in long dark hair, seated frontal and perfectly symmetrical on a plain stone seat between two tall pillars, one near-black and one pale cream, with a veil of embroidered pomegranates in deep green and gold hanging between them. She wears a long flowing robe in deep forest green with a pale cream inner layer; a blank scroll rests in her lap; a small gold key hangs at her belt. A thin ring of white salt is drawn on the floor around the seat. A full moon glows softly in the dark sky above her, a gold crescent resting at her feet. Warm candlelight from a single candle at her side is the main light source, falling into deep shadow; palette of deep forest green, near-black, antique gold, brass and cream, with a faint amber glow on her face and the gold. Dark, simple background. Realistic proportions, dignified and respectful rendering, hands naturally formed. Aspect ratio 0.58 portrait, subject kept well inside the edges.
>
> Avoid: any text, letters, numbers or runes; borders, frames or card edges; extra or missing fingers, distorted hands; modern objects; logos or watermarks; cluttered or bright background; cartoon, anime, 3D render, photo look; skeletons, gore, nudity; cultural or religious regalia of any living tradition.

### 7b. Ace of Cauldrons (`cups-01`, still life)

> Painterly candlelit altar still life, rich oil and gouache feel with soft visible brushwork and a gentle vignette, vertical tarot illustration for the card "Ace of Cauldrons". A dark wooden altar table seen from a slight downward angle, with a single black iron three-legged cauldron at the centre, filled to the brim with luminous clear water that spills over the rim in four gentle streams onto the dark wood, a soft white wisp of steam rising above it shaped like a dove, a pressed gold crescent-moon-and-candle mark on the cauldron's side. A few white rose petals on the table. No people. The objects are arranged so that the cauldron reads as a gift offered from above: new love, overflowing feeling, a beginning. Warm candlelight from a single lit candle is the main light source, glinting on iron and gold and falling into deep forest-green and near-black shadow; palette of deep forest green, black, antique gold, cream and amber. Dark, simple background. Aspect ratio 0.58 portrait, objects kept well inside the edges, exactly one cauldron clearly visible.
>
> Avoid: any text, letters, numbers or runes; borders, frames or card edges; extra or missing fingers, distorted hands; modern objects; logos or watermarks; cluttered or bright background; cartoon, anime, 3D render, photo look; skeletons, gore, nudity; cultural or religious regalia of any living tradition.

### 7c. Witch of Wands (`wands-13`, cast C25)

> Painterly candlelit altar painting, rich oil and gouache feel with soft visible brushwork and a gentle vignette, vertical tarot illustration for the card "Witch of Wands (Queen of Wands)". Enthroned on a carved dark wooden throne decorated with lions and sunflowers, seated three-quarter length, confident and warm, one hand holding an aspen-wood wand with a faceted labradorite crystal tip that flashes blue and gold, the other hand holding a single sunflower. A woman in her fifties with warm olive-tan skin, strong medium build, short grey-streaked dark hair, a calm direct gaze and a half smile, wearing a rich amber-gold cloak over deep forest green. A black cat sits at her feet. A lit candle burns in a sunflower-shaped brass holder beside the throne. No moon in the scene. Warm candlelight is the main light source, falling into deep shadow; palette of deep forest green, near-black, antique gold, brass and cream, with a faint amber glow on her face and gold. Dark, simple background. Realistic proportions, dignified and respectful rendering, hands naturally formed. Aspect ratio 0.58 portrait, subject kept well inside the edges.
>
> Avoid: any text, letters, numbers or runes; borders, frames or card edges; extra or missing fingers, distorted hands; modern objects; logos or watermarks; cluttered or bright background; cartoon, anime, 3D render, photo look; skeletons, gore, nudity; cultural or religious regalia of any living tradition.

---

## 8. Production checklist

Work on **one complete card at a time**, start to finish, before the next.

1. **Pick the card** and read its row (section 6), cast code (section 5) and any moon phase.
2. **Write the prompt** from template 3a (or 3b for numbered cards) with the slots filled. Save the exact prompt text.
3. **Log every Canva call** in a production log (`docs/tarot/production-log.md`): date, card id, prompt (or prompt version), Canva design or asset id, number of variants, which was picked, and why.
4. **Generate 3 to 4 variants.** Pick the best; reject any with text, extra fingers, borders in art, modern objects, or wrong object counts (numbered cards).
5. **Check the casting:** age, skin tone, body and presentation match the cast row; respectful, no stereotypes; dark skin is clearly lit.
6. **Art approval gate (owner):** show the raw art and ask for approval. No compositing until approved.
7. **Crop and prepare locally:** crop to ratio 0.58 with the 8% safe margin; colour-match to the palette; upscale if needed for print.
8. **Composite locally** (script, not Canva): thin gold frame, numeral plate, name plate, rounded corners, bleed.
9. **Export:** app 600 x 1030 WebP and thumb; print master 898 x 1488 px PNG at 300 dpi (when requested).
10. **Final approval gate (owner):** show the finished card at app size and in a mock-up next to the style-test cards. Only then copy into the app's picture folder named by card id (`00-the-fool.webp`, `cups-07.webp`, thumbs with suffix).
11. **Record** the final status in the log (approved, revised, redo) and move on.

Order of work: the three style-test cards first (approval gate on the look), then the remaining Majors (22), then court cards by suit (16), then numbered cards by suit (40), then the card back. After every ten cards, lay them out side by side and check that palette, light and casting variety are still consistent.
