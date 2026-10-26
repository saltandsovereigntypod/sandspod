# Sources for the divination pictures

## Tarot: `tarot/*.webp`

The 78 cards of the Rider–Waite–Smith deck, drawn by Pamela Colman Smith
under the direction of A. E. Waite and first published by William Rider &
Son, London, in December 1909. Smith died in 1951 and the 1909 drawings are
in the public domain in the United States (published before 1930) and in
countries where copyright lasts the author's life plus 70 years or less.

The scans are Wikimedia Commons' public-domain files, downloaded in
October 2026 directly from `upload.wikimedia.org`:

- Major Arcana: `RWS Tarot 00 Fool.jpg` … `RWS Tarot 21 World.jpg`
- Minor Arcana: `Wands01.jpg` … `Wands14.jpg`, `Cups01.jpg` … `Cups14.jpg`,
  `Swords01.jpg` … `Swords14.jpg`, `Pents01.jpg` … `Pents14.jpg`

Every card was checked by eye against its name before it was kept.

Each was resized to 600 px tall and saved as WebP. File names are the card
ids in `app/src/lib/divination/tarot.ts` (`00-the-fool`, `cups-07`, …).
The app bundles copies made by `app/scripts/build-divination-assets.py`.

## Tarot: the other decks, `decks/<deck>/*.webp`

Two more public-domain decks can be chosen instead (Settings → Divination,
the `tarot_deck` setting), with the same 78 card ids and the same meanings:

- `decks/marseille/`: the Tarot de Marseille after Nicolas Conver (1760), in
  A. Camoin's printing (Marseille, about 1890–1900), scanned by the
  Bibliothèque nationale de France (public domain).
- `decks/sola-busca/`: the Sola Busca tarot, engraved in Italy about 1491 and
  coloured by hand (PD-Art).

Every card's source file, author or holder and licence is listed in
`app/assets/divination/decks/marseille/SOURCES.md` and
`app/assets/divination/decks/sola-busca/SOURCES.md`. Each card is 350 × 600
px WebP, the scan scaled to 600 px tall and its sides filled with its own
edge colour, so every deck has the same shape.

The card backs are drawn in code (`app/src/components/divination/Faces.tsx`,
`practice/hedge/hedge.js`), not taken from any deck.

## Runes and ogham

No pictures: they are the Unicode letters themselves (Runic and Ogham
blocks), styled as stones and staves. The app bundles Noto Sans Runic and
Noto Sans Ogham (`app/assets/fonts/`, SIL Open Font License 1.1, from
Google Fonts) so every phone can show them; the website loads the same fonts
from Google Fonts.

## Meanings

Written for Salt & Sovereignty, after the divinatory meanings in A. E.
Waite's *The Pictorial Key to the Tarot* (1910, public domain), the Old
English, Norwegian and Icelandic rune poems, and the medieval ogham
word-lists, with the modern readings most people use today.

## Lenormand: `lenormand/*.webp`

The thirty-six cards of a Petit Lenormand published by Geûens-Seaux of
Bruges, about 1895–1901, scanned by the Bibliothèque nationale de France
(Gallica btv1b10529584r) and shared on Wikimedia Commons as public domain
(anonymous art published before 1931; faithful scans of two-dimensional
public-domain work). Downloaded in October 2026 from `upload.wikimedia.org`.
The full account, and how the files were made, is in
`app/assets/divination/decks/lenormand/SOURCES.md`.

## Kipper

No pictures: no complete public-domain printing could be found, so the
cards are drawn in words. See `app/assets/divination/decks/kipper/SOURCES.md`.

## Decks of your own

Photos of your own cards are yours: uploaded to your account's own folder
(`user-assets/<you>/oracle-decks/`) when you're signed in, as the altar's
photos are, and kept on your device otherwise.
