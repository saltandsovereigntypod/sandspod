import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

import { normalizeReading } from '../src/lib/craft/hedge/readings.ts';
import {
  cardLabelIn,
  chosenDeck,
  DECK_SETTING,
  deckCardTitle,
  deckImagePath,
  deckInfo,
  deckOfReading,
  DEFAULT_DECK,
  TAROT_DECKS,
  type DeckId,
} from '../src/lib/divination/decks.ts';
import { drawOfReading, readingFromDraw, spreadById } from '../src/lib/divination/draw.ts';
import { TAROT_DECK } from '../src/lib/divination/tarot.ts';
import { defaultSettings, normalizeSettings, settingsRow } from '../src/lib/settings/defaults.ts';

const appFile = (rel: string) => new URL(`../${rel.replace(/^(\.\.\/)+/, '')}`, import.meta.url);
const siteFile = (path: string) => new URL(`../..${path}`, import.meta.url);
const manifest = readFileSync(new URL('../src/lib/divination/tarotAssets.ts', import.meta.url), 'utf8');
const DECK_IDS = TAROT_DECKS.map((d) => d.id);

/** One deck's block of the generated manifest: its sheets and its cards' places. */
function manifestFor(deck: DeckId) {
  const key = deck.includes('-') ? `'${deck}'` : deck;
  const sheetsBlock = manifest.match(new RegExp(`\\n  ${key}: \\[\\n([\\s\\S]*?)\\n  \\],`))?.[1] ?? '';
  const sheets = [...sheetsBlock.matchAll(/require\('([^']+)'\)/g)].map((m) => m[1]);
  const placesBlock = manifest.match(new RegExp(`\\n  ${key}: \\{\\n([\\s\\S]*?)\\n  \\},`))?.[1] ?? '';
  const places = [...placesBlock.matchAll(/'([^']+)': \{ sheet: sheets(?:\.\w+|\['[\w-]+'\])\[(\d+)\], col: (\d+), row: (\d+) \}/g)].map((m) => ({
    id: m[1],
    sheet: Number(m[2]),
    col: Number(m[3]),
    row: Number(m[4]),
  }));
  return { sheets, places };
}

/** A WebP's width and height, from its header (VP8, VP8L or VP8X). */
function webpSize(bytes: Buffer): { width: number; height: number } {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === 'VP8L') {
    const b = bytes.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  assert.equal(chunk, 'VP8 ');
  return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
}

test('three public-domain decks, the Rider–Waite–Smith first and the default', () => {
  assert.deepEqual(DECK_IDS, ['rws', 'marseille', 'sola-busca']);
  assert.equal(DEFAULT_DECK, 'rws');
  for (const d of TAROT_DECKS) {
    assert.ok(d.name && d.made && d.about && d.credit, d.id);
    assert.match(d.credit, /[Pp]ublic domain/, d.id);
    assert.doesNotMatch(`${d.about} ${d.credit}`, /!/, d.id);
  }
});

test('every deck maps all 78 card ids onto its own six sheets, each place in the grid', () => {
  const ids = TAROT_DECK.map((c) => c.id).sort();
  const grid = manifest.match(/cols: (\d+), rows: (\d+), cellWidth: (\d+), cellHeight: (\d+)/)!.slice(1).map(Number);
  const [cols, rows, cellW, cellH] = grid;
  const seen = new Set<string>();
  for (const deck of DECK_IDS) {
    const { sheets, places } = manifestFor(deck);
    assert.equal(sheets.length, 6, deck);
    assert.deepEqual(places.map((p) => p.id).sort(), ids, deck);
    const spots = new Set<string>();
    for (const p of places) {
      assert.ok(p.sheet < sheets.length && p.col < cols && p.row < rows, `${deck} ${p.id}`);
      spots.add(`${p.sheet}/${p.col}/${p.row}`);
    }
    assert.equal(spots.size, 78, `${deck}: two cards share a place`);
    for (const sheet of sheets) {
      assert.ok(!seen.has(sheet), `${sheet} is used by two decks`);
      seen.add(sheet);
      assert.ok(existsSync(appFile(sheet)), sheet);
      assert.deepEqual(webpSize(readFileSync(appFile(sheet))), { width: cols * cellW, height: rows * cellH }, sheet);
    }
  }
  assert.match(manifest, /export const tarotImages = deckImages\.rws;/);
});

test('the website has every card of every deck, and each deck its sources', () => {
  for (const deck of DECK_IDS) {
    for (const card of TAROT_DECK) assert.ok(existsSync(siteFile(deckImagePath(deck, card.id))), `${deck} ${card.id}`);
    if (deck === 'rws') continue;
    const sources = readFileSync(appFile(`assets/divination/decks/${deck}/SOURCES.md`), 'utf8');
    // A source line for every card, by id.
    for (const card of TAROT_DECK) assert.match(sources, new RegExp(`\`${card.id}\``), `${deck} SOURCES.md: ${card.id}`);
    assert.match(sources, /upload\.wikimedia\.org/);
  }
  assert.equal(deckImagePath('rws', '16-the-tower'), '/assets/divination/tarot/16-the-tower.webp');
  assert.equal(deckImagePath('marseille', '16-the-tower'), '/assets/divination/decks/marseille/16-the-tower.webp');
});

test('each deck’s own titles: the Marseille’s Justice VIII and Strength XI, the Sola Busca’s named trumps and suits', () => {
  assert.equal(deckCardTitle('rws', '08-strength'), null);
  assert.equal(deckCardTitle('marseille', '08-strength'), 'XI · La Force');
  assert.equal(deckCardTitle('marseille', '11-justice'), 'VIII · La Justice');
  assert.equal(deckCardTitle('marseille', 'The Fool'), 'Le Mat');
  assert.equal(deckCardTitle('marseille', 'Ace of Swords'), 'As d’Épée');
  assert.equal(deckCardTitle('marseille', 'King of Pentacles'), 'Roy de Deniers');
  assert.equal(deckCardTitle('sola-busca', '00-the-fool'), 'Mato');
  assert.equal(deckCardTitle('sola-busca', '08-strength'), 'VIII · Nerone');
  assert.equal(deckCardTitle('sola-busca', '21-the-world'), 'XXI · Nabuchodenasor');
  assert.equal(deckCardTitle('sola-busca', 'Three of Pentacles'), 'Three of Coins');
  assert.equal(deckCardTitle('sola-busca', 'Page of Wands'), 'Page of Batons');
  assert.equal(deckCardTitle('sola-busca', 'Two of Cups'), null);
  assert.equal(cardLabelIn('marseille', 'Strength'), 'Strength (XI · La Force)');
  assert.equal(cardLabelIn('rws', 'Strength'), 'Strength');
  for (const deck of ['marseille', 'sola-busca'] as const)
    for (const card of TAROT_DECK.filter((c) => c.arcana === 'major')) assert.ok(deckCardTitle(deck, card.id), `${deck} ${card.id}`);
});

test('the deck setting: a default the website shares, kept through the row and back, anything unknown read as the default', () => {
  assert.equal(defaultSettings()[DECK_SETTING], 'rws');
  assert.equal(chosenDeck(defaultSettings()), 'rws');
  assert.equal(chosenDeck(null), 'rws');
  assert.equal(chosenDeck({ tarot_deck: 'thoth' }), 'rws');
  const row = settingsRow({ ...defaultSettings(), tarot_deck: 'sola-busca' }, 'u1');
  assert.equal(row.settings.tarot_deck, 'sola-busca');
  const back = normalizeSettings(JSON.parse(JSON.stringify(row)));
  assert.equal(chosenDeck(back), 'sola-busca');
  assert.equal(chosenDeck(normalizeSettings({ settings: { tarot_deck: 'marseille' } })), 'marseille');
  assert.equal(deckInfo('nope').id, 'rws');
});

test('a reading remembers its deck and reopens in it; older readings and runes stay as they were', () => {
  const spread = spreadById('past-present-future')!;
  const draw = { spread: spread.id, items: [{ name: 'Strength', reversed: false }, { name: 'The Star', reversed: true }, { name: 'Ace of Cups', reversed: false }] };
  const now = new Date(2026, 9, 26, 20);
  const kept = readingFromDraw(spread, draw, { now, deck: 'marseille' });
  assert.equal(kept.deck, 'marseille');
  // Through storage (JSON) and the normalizing both app and website do on reading it back.
  const reopened = normalizeReading(JSON.parse(JSON.stringify(kept)));
  assert.equal(deckOfReading(reopened), 'marseille');
  assert.deepEqual(drawOfReading(reopened)?.draw.items.map((i) => i.name), ['Strength', 'The Star', 'Ace of Cups']);
  // Edited and saved again, it keeps the deck.
  assert.equal(normalizeReading({ ...reopened, interpretation: 'Patience.' }).deck, 'marseille');

  const older = normalizeReading({ ...kept, deck: undefined });
  assert.equal('deck' in older, false);
  assert.equal(deckOfReading(older), 'rws');
  assert.equal(readingFromDraw(spread, draw, { now }).deck, undefined);
  const runes = spreadById('one-rune')!;
  assert.equal(readingFromDraw(runes, { spread: runes.id, items: [{ name: 'Fehu', reversed: false }] }, { now, deck: 'sola-busca' }).deck, undefined);
});
