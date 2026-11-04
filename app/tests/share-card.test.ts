// Share as a card: wrapping, the card's layout (fits the picture, ends in …
// when there's more), its words, and the printable page (escaped, with a
// print stylesheet).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { cardFileName, cardText, layoutCard, printableHtml, SHARE_CARD, wrapText } from '../src/lib/share/card.ts';

test('text wraps at spaces, and a very long word is cut', () => {
  assert.deepEqual(wrapText('a candle for the ones I remember', 12), ['a candle for', 'the ones I', 'remember']);
  assert.deepEqual(wrapText('abcdefghijklmnop', 6), ['abcdef', 'ghijkl', 'mnop']);
  assert.deepEqual(wrapText('one\ntwo', 20), ['one', 'two']);
});

test('the card fits its picture, cutting the body with … when there is more', () => {
  const long = Array.from({ length: 80 }, (_, i) => `Step ${i + 1}: light the candle and wait a while.`);
  const lines = layoutCard({ eyebrow: 'A ritual', title: 'A candle for Nan', subtitle: 'Remembering her', lines: long, footer: '5 steps' });
  assert.equal(lines[0].text, 'A RITUAL');
  assert.equal(lines.find((l) => l.kind === 'title')!.text, 'A candle for Nan');
  const body = lines.filter((l) => l.kind === 'body');
  assert.ok(body.length > 5);
  assert.match(body[body.length - 1].text, /…$/);
  const footer = lines[lines.length - 1];
  assert.equal(footer.text, '5 steps · Salt & Sovereignty');
  assert.ok(body[body.length - 1].y < footer.y - 40, 'body stops above the footer');
  assert.ok(footer.y <= SHARE_CARD.height);
});

test('its words, a file name, and a printable page', () => {
  const card = { eyebrow: 'Living Library · Herb', title: 'Rosemary <Rosmarinus>', lines: ['For remembrance & protection.', ''] };
  assert.equal(cardText(card), 'Living Library · Herb\nRosemary <Rosmarinus>\n\nFor remembrance & protection.\n\nSalt & Sovereignty');
  assert.equal(cardFileName('A candle for Nan’s day'), 'salt-and-sovereignty-a-candle-for-nan-s-day.png');
  const html = printableHtml(card);
  assert.match(html, /<title>Rosemary &lt;Rosmarinus&gt;<\/title>/);
  assert.match(html, /<p>For remembrance &amp; protection\.<\/p>/);
  assert.match(html, /@media print/);
  assert.ok(!html.includes('<Rosmarinus>'));
});
