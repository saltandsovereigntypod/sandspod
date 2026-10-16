// Stone care: hardness, and whether a stone is safe in water, sun and salt,
// whether it needs careful handling, and which cleansing methods suit it.
// Every Library crystal is here (same keys as `traditional:crystal:<key>`),
// with common stones the Library doesn't hold yet.
//
// This is safety data. Where sources disagree we take the cautious side:
// "brief" for water means a quick rinse and dry is fine but never a soak.
// Salt means resting in dry salt or salt water; salt is abrasive and draws
// moisture, so soft, porous or metallic stones stay out of it.

export type Level = 'yes' | 'brief' | 'no';
/** 'fades' loses colour in strong sun; 'heat' is harmed by heat or strong light (cracks, dulls or darkens). */
export type SunCare = 'ok' | 'fades' | 'heat';
/** 'care': don't make direct elixirs, wash hands after raw pieces. 'toxic': contains a toxic element; handle little, never cut, sand or lick. */
export type Handling = 'none' | 'care' | 'toxic';

export type CleanseMethod =
  | 'smoke'
  | 'sound'
  | 'moonlight'
  | 'sunlight'
  | 'water'
  | 'salt'
  | 'earth'
  | 'rice'
  | 'selenite'
  | 'breath';

export const CLEANSE_METHODS: { key: CleanseMethod; label: string; detail: string }[] = [
  { key: 'smoke', label: 'Smoke', detail: 'Pass it through the smoke of incense or a herb bundle, with a window open.' },
  { key: 'sound', label: 'Sound', detail: 'A bell, singing bowl, tuning fork or your own voice.' },
  { key: 'moonlight', label: 'Moonlight', detail: 'A night on a windowsill or outside under the moon. Bring it in before the sun is strong.' },
  { key: 'sunlight', label: 'Sunlight', detail: 'An hour or two of morning sun, for stones that don’t fade.' },
  { key: 'water', label: 'Running water', detail: 'A rinse under the tap or in a clean stream, then dry it well.' },
  { key: 'salt', label: 'Salt', detail: 'Rest it in a bowl of dry salt, or beside it in a dish for softer stones.' },
  { key: 'earth', label: 'Earth', detail: 'Bury it in soil or a pot of earth for a day or a moon. Mark the spot.' },
  { key: 'rice', label: 'Brown rice', detail: 'Rest it overnight in a bowl of dry brown rice, then compost the rice.' },
  { key: 'selenite', label: 'Selenite or quartz', detail: 'Rest it on a selenite plate or beside a clear quartz cluster overnight.' },
  { key: 'breath', label: 'Breath and intention', detail: 'Hold it, breathe over it and picture it clear. Suits every stone.' },
];

export type StoneCare = {
  key: string;
  name: string;
  /** Other names people type for it. */
  aliases?: string[];
  /** What it is, in a few words. */
  mineral: string;
  /** Mohs hardness, as a range where it varies. */
  mohs: string;
  water: Level;
  salt: Level;
  sun: SunCare;
  handling: Handling;
  /** In the Living Library (so it can be linked). */
  library: boolean;
  /** Methods that suit it best, gentlest first. */
  cleanse: CleanseMethod[];
  note: string;
};

type Row = Omit<StoneCare, 'key' | 'library'>;

// Stones in the Living Library.
const LIBRARY: Record<string, Row> = {
  amethyst: { name: 'Amethyst', mineral: 'Purple quartz', mohs: '7', water: 'yes', salt: 'yes', sun: 'fades', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water', 'earth'], note: 'Its purple fades in strong sun, so keep it off sunny windowsills.' },
  black_tourmaline: { name: 'Black Tourmaline', aliases: ['schorl'], mineral: 'Tourmaline (schorl)', mohs: '7–7.5', water: 'yes', salt: 'brief', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'water', 'moonlight'], note: 'Raw pieces are often cracked along their length and can splinter; rinse rather than soak those.' },
  carnelian: { name: 'Carnelian', mineral: 'Orange-red chalcedony', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['sunlight', 'smoke', 'sound', 'water'], note: 'Hardy. Very bright, even orange can be dyed agate, which may bleed in water.' },
  citrine: { name: 'Citrine', mineral: 'Yellow quartz', mohs: '7', water: 'yes', salt: 'yes', sun: 'fades', handling: 'none', cleanse: ['smoke', 'sound', 'moonlight', 'water'], note: 'Natural citrine can pale in strong sun. Much citrine is heat-treated amethyst; treat both the same.' },
  clear_quartz: { name: 'Clear Quartz', aliases: ['quartz', 'rock crystal'], mineral: 'Quartz', mohs: '7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water', 'sunlight', 'earth'], note: 'Doesn’t fade, but spheres and clear points can focus sunlight and scorch or start a fire. Never leave one in sun near cloth, paper or wood.' },
  fluorite: { name: 'Fluorite', mineral: 'Calcium fluoride', mohs: '4', water: 'brief', salt: 'no', sun: 'fades', handling: 'care', cleanse: ['smoke', 'moonlight', 'sound', 'breath'], note: 'Soft and splits easily along flat planes. Colours fade in sun. Not for direct elixirs, as it contains fluorine.' },
  garnet: { name: 'Garnet', mineral: 'Garnet group silicate', mohs: '6.5–7.5', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'water', 'moonlight', 'earth'], note: 'Hardy. Avoid sudden changes of temperature.' },
  green_aventurine: { name: 'Green Aventurine', aliases: ['aventurine'], mineral: 'Quartz with fuchsite (mica)', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'fades', handling: 'none', cleanse: ['smoke', 'moonlight', 'sound', 'water'], note: 'The green can soften in long sun.' },
  hematite: { name: 'Hematite', aliases: ['haematite', 'magnetic hematite', 'hematine'], mineral: 'Iron oxide', mohs: '5.5–6.5', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Keep dry: water and salt can leave rust marks, and magnetic “hematite” is man-made and rusts readily. Very heavy, and brittle if dropped.' },
  labradorite: { name: 'Labradorite', mineral: 'Feldspar', mohs: '6–6.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'Splits along cleavage if knocked. A quick rinse is fine; don’t soak or salt it.' },
  lapis_lazuli: { name: 'Lapis Lazuli', aliases: ['lapis'], mineral: 'Rock of lazurite, calcite and pyrite', mohs: '5–5.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Porous, often waxed or dyed, and its pyrite flecks can tarnish. Wipe with a damp cloth rather than soaking.' },
  malachite: { name: 'Malachite', mineral: 'Copper carbonate', mohs: '3.5–4', water: 'no', salt: 'no', sun: 'heat', handling: 'toxic', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Contains copper. Polished pieces are fine to hold, but never cut, sand or polish it yourself (the dust is toxic), never put it in water or elixirs, and wash hands after raw pieces. Keep from children and pets. Soft and dulled by heat and acids.' },
  moonstone: { name: 'Moonstone', mineral: 'Feldspar', mohs: '6–6.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'Splits along cleavage if knocked. A quick rinse is fine; keep it out of salt.' },
  moss_agate: { name: 'Moss Agate', mineral: 'Chalcedony with mineral inclusions', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'moonlight', 'earth', 'water', 'sound'], note: 'Hardy and happy buried in garden soil.' },
  obsidian: { name: 'Obsidian', aliases: ['black obsidian', 'snowflake obsidian', 'rainbow obsidian'], mineral: 'Volcanic glass', mohs: '5–5.5', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'water', 'earth', 'moonlight'], note: 'Broken edges are sharper than a blade. Keep raw pieces away from small hands.' },
  pyrite: { name: 'Pyrite', aliases: ["fool's gold", 'fools gold'], mineral: 'Iron sulfide', mohs: '6–6.5', water: 'no', salt: 'no', sun: 'ok', handling: 'care', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Keep dry: damp makes it tarnish and slowly break down, giving off acidic sulfates. Never use it in water or elixirs, and wash hands after handling raw pieces.' },
  rose_quartz: { name: 'Rose Quartz', mineral: 'Pink quartz', mohs: '7', water: 'yes', salt: 'yes', sun: 'fades', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water', 'earth'], note: 'Its pink fades in sun. Moonlight suits it best.' },
  selenite: { name: 'Selenite', aliases: ['satin spar', 'gypsum'], mineral: 'Gypsum', mohs: '2', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Dissolves and flakes in water and is scratched by a fingernail. Keep it dry and dust it with a soft cloth. Often said never to need cleansing itself.' },
  smoky_quartz: { name: 'Smoky Quartz', mineral: 'Brown quartz', mohs: '7', water: 'yes', salt: 'yes', sun: 'fades', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'water', 'moonlight'], note: 'Can pale in long sun or heat.' },
  tiger_eye: { name: 'Tiger Eye', aliases: ["tiger's eye", 'tigers eye', 'tiger’s eye'], mineral: 'Quartz replacing crocidolite fibres', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'care', cleanse: ['smoke', 'sunlight', 'sound', 'water'], note: 'Polished stones are safe to hold and rinse. Never cut, crush or sand it: the fibres locked inside are a form of asbestos.' },
  jet: { name: 'Jet', mineral: 'Fossilised wood (organic)', mohs: '2.5–4', water: 'brief', salt: 'no', sun: 'heat', handling: 'none', cleanse: ['smoke', 'sound', 'breath'], note: 'Soft and organic. Heat and sudden temperature changes crack it. Wipe clean; never soak.' },
  bloodstone: { name: 'Bloodstone', aliases: ['heliotrope'], mineral: 'Green chalcedony with red jasper', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'water', 'moonlight'], note: 'Hardy.' },
  onyx: { name: 'Onyx', aliases: ['black onyx'], mineral: 'Banded chalcedony', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'water'], note: 'Most black onyx is dyed; if colour comes off on a damp cloth, keep it out of water.' },
  red_jasper: { name: 'Red Jasper', aliases: ['jasper'], mineral: 'Opaque chalcedony', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'sunlight', 'water'], note: 'Hardy.' },
  sunstone: { name: 'Sunstone', mineral: 'Feldspar', mohs: '6–6.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['sunlight', 'smoke', 'sound', 'breath'], note: 'Splits along cleavage if knocked. A quick rinse is fine; keep it out of salt.' },
  shungite: { name: 'Shungite', mineral: 'Carbon-rich rock', mohs: '3.5–4', water: 'brief', salt: 'no', sun: 'ok', handling: 'care', cleanse: ['smoke', 'sound', 'earth', 'breath'], note: 'Soft, and raw pieces shed black dust. Don’t drink water it has stood in or use it as a filter, whatever sellers claim.' },
  kyanite: { name: 'Kyanite', aliases: ['blue kyanite', 'black kyanite'], mineral: 'Aluminium silicate', mohs: '4.5–7', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['sound', 'moonlight', 'breath'], note: 'Its blades split into thin, sharp slivers, and water works into the splits. Keep it dry. Often said never to need cleansing.' },
  rhodonite: { name: 'Rhodonite', mineral: 'Manganese silicate', mohs: '5.5–6.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'A quick rinse is fine; don’t soak it.' },
  rhodochrosite: { name: 'Rhodochrosite', mineral: 'Manganese carbonate', mohs: '3.5–4', water: 'no', salt: 'no', sun: 'heat', handling: 'none', cleanse: ['smoke', 'sound', 'breath'], note: 'Soft and sensitive to heat, acids and knocks. Keep dry and out of strong sun.' },
  amber: { name: 'Amber', mineral: 'Fossilised resin (organic)', mohs: '2–2.5', water: 'brief', salt: 'no', sun: 'heat', handling: 'none', cleanse: ['smoke', 'sound', 'breath'], note: 'Soft, and burns. Heat and long sun darken and craze it, and perfume and alcohol damage it. Keep it away from candle flames.' },
  aquamarine: { name: 'Aquamarine', mineral: 'Blue beryl', mohs: '7.5–8', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'water', 'smoke', 'sound'], note: 'Hardy. Avoid heat and sudden temperature changes.' },
  blue_lace_agate: { name: 'Blue Lace Agate', mineral: 'Banded chalcedony', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Vivid blue agate is dyed and can bleed in water and fade in sun; keep those dry and shaded.' },
  chrysocolla: { name: 'Chrysocolla', mineral: 'Hydrated copper silicate', mohs: '2–4', water: 'no', salt: 'no', sun: 'heat', handling: 'care', cleanse: ['smoke', 'sound', 'breath'], note: 'Contains copper and is soft and porous. Keep it dry, never use it in elixirs, and wash hands after raw pieces.' },
  emerald: { name: 'Emerald', mineral: 'Green beryl', mohs: '7.5–8', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'Nearly always oiled to fill its cracks. Warm soapy water briefly is fine; no soaking, heat or salt.' },
  peridot: { name: 'Peridot', aliases: ['olivine'], mineral: 'Olivine', mohs: '6.5–7', water: 'yes', salt: 'brief', sun: 'ok', handling: 'none', cleanse: ['sunlight', 'smoke', 'sound', 'water'], note: 'Avoid acids and sudden heat.' },
  turquoise: { name: 'Turquoise', mineral: 'Copper aluminium phosphate', mohs: '5–6', water: 'no', salt: 'no', sun: 'fades', handling: 'care', cleanse: ['smoke', 'sound', 'breath'], note: 'Porous and contains copper. Water, oils, perfume and sun change its colour. Never use it in elixirs.' },
  ruby: { name: 'Ruby', mineral: 'Red corundum', mohs: '9', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['sunlight', 'smoke', 'sound', 'water'], note: 'Very hard. Cheap “glass-filled” rubies are damaged by salt and acids; keep those dry.' },
  sapphire: { name: 'Sapphire', mineral: 'Corundum', mohs: '9', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Very hard and hardy.' },
  opal: { name: 'Opal', mineral: 'Hydrated silica', mohs: '5.5–6.5', water: 'no', salt: 'no', sun: 'heat', handling: 'none', cleanse: ['moonlight', 'sound', 'breath'], note: 'Holds water inside; heat and dry air craze it, and doublets and triplets come apart if wet. Wipe with a damp cloth only.' },
  howlite: { name: 'Howlite', mineral: 'Calcium borosilicate', mohs: '3.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'Soft and porous; brightly coloured howlite is dyed and its colour can run.' },
  lepidolite: { name: 'Lepidolite', mineral: 'Lithium mica', mohs: '2.5–3', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'Soft and flaky; water works between its layers. Keep it dry and wash hands after raw pieces.' },
  sodalite: { name: 'Sodalite', mineral: 'Sodium aluminium silicate', mohs: '5.5–6', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'A quick rinse is fine; don’t soak it.' },
  unakite: { name: 'Unakite', mineral: 'Rock of epidote, feldspar and quartz', mohs: '6–7', water: 'yes', salt: 'brief', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'moonlight', 'water'], note: 'Fairly hardy.' },
  jade: { name: 'Jade', aliases: ['nephrite', 'jadeite'], mineral: 'Nephrite or jadeite', mohs: '6–7', water: 'yes', salt: 'brief', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Tough. Treated jade (resin-filled or dyed) shouldn’t soak or be heated.' },
  chrysoprase: { name: 'Chrysoprase', mineral: 'Green chalcedony (nickel)', mohs: '6.5–7', water: 'yes', salt: 'brief', sun: 'fades', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Its apple green can pale with heat and sun; some keep it on a damp cloth now and then.' },
  apache_tear: { name: 'Apache Tear', mineral: 'Obsidian nodule', mohs: '5–5.5', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'water'], note: 'Hardy, but can chip to a sharp edge if dropped.' },
  celestite: { name: 'Celestite', aliases: ['celestine'], mineral: 'Strontium sulfate', mohs: '3–3.5', water: 'no', salt: 'no', sun: 'fades', handling: 'none', cleanse: ['moonlight', 'sound', 'breath'], note: 'Fragile, soft and its blue fades in sun. Keep it in one shaded place and dust it with a soft brush.' },
  herkimer_diamond: { name: 'Herkimer Diamond', aliases: ['herkimer'], mineral: 'Double-terminated quartz', mohs: '7.5', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Hardy, but small and easily lost.' },
  angelite: { name: 'Angelite', mineral: 'Blue anhydrite', mohs: '3.5', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'sound', 'breath'], note: 'Water slowly turns anhydrite to gypsum, clouding and softening it. Keep it dry.' },
  ametrine: { name: 'Ametrine', mineral: 'Quartz (amethyst and citrine)', mohs: '7', water: 'yes', salt: 'yes', sun: 'fades', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Like amethyst, fades in strong sun.' },
};

// Common stones the Library doesn't hold.
const OTHERS: Record<string, Row> = {
  kunzite: { name: 'Kunzite', aliases: ['spodumene'], mineral: 'Pink spodumene', mohs: '6.5–7', water: 'yes', salt: 'brief', sun: 'fades', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Famously fades in sunlight, which is why it’s called the evening stone. Splits easily along its length.' },
  calcite: { name: 'Calcite', aliases: ['honey calcite', 'orange calcite', 'optical calcite', 'mangano calcite'], mineral: 'Calcium carbonate', mohs: '3', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Soft and dissolved by acids, even vinegar or lemon. A quick rinse at most.' },
  azurite: { name: 'Azurite', mineral: 'Copper carbonate', mohs: '3.5–4', water: 'no', salt: 'no', sun: 'heat', handling: 'toxic', cleanse: ['smoke', 'sound', 'breath'], note: 'Contains copper; the dust is toxic. Never cut, sand or use in elixirs, and wash hands after handling. Heat and light can dull it.' },
  cinnabar: { name: 'Cinnabar', mineral: 'Mercury sulfide', mohs: '2–2.5', water: 'no', salt: 'no', sun: 'heat', handling: 'toxic', cleanse: ['sound', 'breath'], note: 'Contains mercury. Never heat, cut, lick or use in elixirs; keep it in a closed box, wash hands after touching, and keep it far from children and pets. Light darkens it.' },
  galena: { name: 'Galena', mineral: 'Lead sulfide', mohs: '2.5', water: 'no', salt: 'no', sun: 'ok', handling: 'toxic', cleanse: ['sound', 'breath'], note: 'Contains lead. Handle as little as possible, wash hands after, never use in elixirs, and keep it from children and pets.' },
  orpiment: { name: 'Orpiment', mineral: 'Arsenic sulfide', mohs: '1.5–2', water: 'no', salt: 'no', sun: 'heat', handling: 'toxic', cleanse: ['sound', 'breath'], note: 'Contains arsenic. Keep it in a closed container out of light, which makes it crumble, and don’t handle it bare-handed.' },
  realgar: { name: 'Realgar', mineral: 'Arsenic sulfide', mohs: '1.5–2', water: 'no', salt: 'no', sun: 'heat', handling: 'toxic', cleanse: ['sound', 'breath'], note: 'Contains arsenic. Light turns it to yellow powder. Keep it closed away in the dark and don’t handle it bare-handed.' },
  stibnite: { name: 'Stibnite', mineral: 'Antimony sulfide', mohs: '2', water: 'no', salt: 'no', sun: 'ok', handling: 'toxic', cleanse: ['sound', 'breath'], note: 'Contains antimony and its needles snap easily. Handle little, wash hands after, never use in elixirs.' },
  vanadinite: { name: 'Vanadinite', mineral: 'Lead vanadate', mohs: '3–4', water: 'no', salt: 'no', sun: 'heat', handling: 'toxic', cleanse: ['sound', 'breath'], note: 'Contains lead. Wash hands after handling and keep it from children and pets. Long light can darken it.' },
  chalcanthite: { name: 'Chalcanthite', mineral: 'Copper sulfate', mohs: '2.5', water: 'no', salt: 'no', sun: 'heat', handling: 'toxic', cleanse: ['breath'], note: 'Dissolves in water and is poisonous; most sold is lab-grown. Keep it sealed and dry, and never touch your mouth after handling.' },
  halite: { name: 'Halite', aliases: ['rock salt', 'pink halite', 'himalayan salt'], mineral: 'Rock salt', mohs: '2–2.5', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['sound', 'moonlight', 'breath'], note: 'It is salt: water and damp air dissolve it. Keep it somewhere dry.' },
  amazonite: { name: 'Amazonite', mineral: 'Green feldspar', mohs: '6–6.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'care', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'Its colour comes from traces of lead, so no direct elixirs. Splits along cleavage if knocked.' },
  moldavite: { name: 'Moldavite', mineral: 'Natural glass from a meteorite impact', mohs: '5.5–6', water: 'yes', salt: 'brief', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Brittle; its edges can be sharp. Many sold are green glass fakes.' },
  apophyllite: { name: 'Apophyllite', mineral: 'Phyllosilicate', mohs: '4.5–5', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'sound', 'breath'], note: 'Its points are brittle and split easily. Rinse only, then dry.' },
  desert_rose: { name: 'Desert Rose', mineral: 'Gypsum or baryte with sand', mohs: '2–3.5', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Crumbles and dissolves with water. Keep it dry.' },
  larimar: { name: 'Larimar', aliases: ['pectolite'], mineral: 'Blue pectolite', mohs: '4.5–5', water: 'brief', salt: 'no', sun: 'fades', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'Its sea blue fades with sun and heat.' },
  prehnite: { name: 'Prehnite', mineral: 'Calcium aluminium silicate', mohs: '6–6.5', water: 'yes', salt: 'brief', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Fairly hardy.' },
  fuchsite: { name: 'Fuchsite', mineral: 'Chromium mica', mohs: '2–3', water: 'no', salt: 'no', sun: 'ok', handling: 'care', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Soft and flaky, and contains chromium. Keep dry, no elixirs, and wash hands after.' },
  magnetite: { name: 'Magnetite', aliases: ['lodestone'], mineral: 'Iron oxide', mohs: '5.5–6.5', water: 'no', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'breath'], note: 'Rusts. Keep it dry and away from cards, phones and pacemakers if magnetic.' },
  pearl: { name: 'Pearl', mineral: 'Nacre (organic)', mohs: '2.5–4.5', water: 'brief', salt: 'no', sun: 'heat', handling: 'none', cleanse: ['moonlight', 'sound', 'breath'], note: 'Soft and porous; acids, perfume and sweat dull it. Wipe with a soft damp cloth and store flat.' },
  coral: { name: 'Coral', mineral: 'Calcium carbonate (organic)', mohs: '3–4', water: 'brief', salt: 'no', sun: 'heat', handling: 'none', cleanse: ['moonlight', 'sound', 'breath'], note: 'Soft, porous and dissolved by acids; heat and sun fade it. Buy old or certified pieces: living reefs are protected.' },
  chalcopyrite: { name: 'Chalcopyrite', aliases: ['peacock ore'], mineral: 'Copper iron sulfide', mohs: '3.5–4', water: 'no', salt: 'no', sun: 'ok', handling: 'care', cleanse: ['smoke', 'sound', 'breath'], note: 'Contains copper; “peacock ore” is often acid-treated. Keep dry, no elixirs, wash hands after.' },
  serpentine: { name: 'Serpentine', mineral: 'Serpentine group', mohs: '2.5–5.5', water: 'brief', salt: 'no', sun: 'ok', handling: 'care', cleanse: ['smoke', 'sound', 'moonlight', 'breath'], note: 'Some serpentine is fibrous asbestos. Polished pieces are fine to hold; never cut, sand or crush it.' },
  aragonite: { name: 'Aragonite', aliases: ['aragonite star cluster'], mineral: 'Calcium carbonate', mohs: '3.5–4', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'breath'], note: 'Soft and dissolved by acids. A quick rinse at most.' },
  charoite: { name: 'Charoite', mineral: 'Silicate rock', mohs: '5–6', water: 'brief', salt: 'no', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'breath'], note: 'A quick rinse is fine; don’t soak it.' },
  agate: { name: 'Agate', aliases: ['crazy lace agate', 'banded agate', 'tree agate'], mineral: 'Banded chalcedony', mohs: '6.5–7', water: 'yes', salt: 'yes', sun: 'ok', handling: 'none', cleanse: ['smoke', 'sound', 'earth', 'water', 'moonlight'], note: 'Hardy. Brightly coloured agate is usually dyed and can bleed or fade.' },
  tourmaline: { name: 'Tourmaline', aliases: ['pink tourmaline', 'green tourmaline', 'watermelon tourmaline'], mineral: 'Tourmaline', mohs: '7–7.5', water: 'yes', salt: 'brief', sun: 'ok', handling: 'none', cleanse: ['moonlight', 'smoke', 'sound', 'water'], note: 'Hardy, but sudden heat can crack it.' },
};

export const STONE_CARE: StoneCare[] = [
  ...Object.entries(LIBRARY).map(([key, row]) => ({ key, library: true, ...row })),
  ...Object.entries(OTHERS).map(([key, row]) => ({ key, library: false, ...row })),
].sort((a, b) => a.name.localeCompare(b.name));

const byKey = new Map(STONE_CARE.map((s) => [s.key, s]));
const tidy = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const byName = new Map<string, StoneCare>();
for (const s of STONE_CARE) for (const n of [s.name, ...(s.aliases ?? [])]) byName.set(tidy(n), s);

export const careByKey = (key: string | null | undefined) => (key ? byKey.get(key) ?? null : null);

/** Care for a stone by its key, or by what the person typed ("tigers eye", "Rose quartz tower"). */
export function findCare(key: string | null | undefined, name?: string | null): StoneCare | null {
  const exact = careByKey(key);
  if (exact) return exact;
  if (!name) return null;
  const t = tidy(name);
  if (byName.has(t)) return byName.get(t)!;
  // Longest known name inside what was typed, so "raw rose quartz" finds rose quartz, not quartz.
  let best: StoneCare | null = null;
  let length = 0;
  for (const [n, s] of byName) {
    if (n.length > length && new RegExp(`(^| )${n}( |$)`).test(t)) {
      best = s;
      length = n.length;
    }
  }
  return best;
}

export const LEVEL_LABEL: Record<Level, string> = { yes: 'Safe', brief: 'Brief only', no: 'Not safe' };
export const SUN_LABEL: Record<SunCare, string> = { ok: 'Sun safe', fades: 'Fades in sun', heat: 'Keep from heat and sun' };
export const HANDLING_LABEL: Record<Handling, string> = { none: '', care: 'Handle with care', toxic: 'Toxic' };

/** Short badges for a stone, in the order the screens show them. */
export function careBadges(c: StoneCare): string[] {
  const out = [`Mohs ${c.mohs}`, `Water: ${LEVEL_LABEL[c.water].toLowerCase()}`, `Salt: ${LEVEL_LABEL[c.salt].toLowerCase()}`, SUN_LABEL[c.sun]];
  if (c.handling !== 'none') out.push(HANDLING_LABEL[c.handling]);
  return out;
}

/** Why a cleansing or charging method would harm this stone, or null when it is fine. */
export function methodWarning(c: StoneCare | null, method: string): string | null {
  if (!c) return null;
  const m = method.toLowerCase();
  if (/water|rinse|stream|rain|river|sea|bath/.test(m)) {
    if (c.water === 'no') return `${c.name} shouldn’t go in water.`;
    if (c.water === 'brief') return `${c.name} can take a quick rinse only: no soaking, and dry it straight away.`;
  }
  if (/salt/.test(m) && c.salt !== 'yes') {
    return c.salt === 'no' ? `${c.name} shouldn’t go in salt. Set it beside a dish of salt instead.` : `Only briefly in dry salt for ${c.name}.`;
  }
  if (/sun/.test(m) && c.sun !== 'ok') return c.sun === 'fades' ? `${c.name} fades in sunlight. Moonlight is kinder.` : `Keep ${c.name} out of heat and strong sun.`;
  if (/earth|bury|soil/.test(m) && (c.water === 'no' || c.handling === 'toxic')) {
    return c.handling === 'toxic' ? `Don’t bury ${c.name}: it can leach into the soil.` : `Damp soil can harm ${c.name}; bury it in a dry pot or a cloth bag.`;
  }
  return null;
}

export const ELIXIR_NOTE =
  'If you make a gem elixir, use the indirect method only: the stone sits in a small sealed glass jar or vial, set inside the water, so the stone never touches anything you drink. Never with toxic, soft or porous stones, and never if you’re unsure what the stone is.';
