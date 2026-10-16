import assert from 'node:assert/strict';
import { test } from 'node:test';

import { findHolyGrimoirePage, holyBlocks, holyPage, holyRef, HOLY_PAGES, moonRef, principalRef } from '../src/lib/holy/index.ts';
import { premadeById } from '../src/lib/rituals/premade/index.ts';

test('pages are well formed, unique, and their workings exist', () => {
  const refs = new Set<string>();
  for (const p of HOLY_PAGES) {
    assert.ok(!refs.has(p.ref), `duplicate ${p.ref}`);
    refs.add(p.ref);
    assert.ok(p.title && p.summary && p.honours && p.history && p.knowAndDont.known && p.knowAndDont.unknown, p.ref);
    if (p.ritual.premade) assert.ok(premadeById(p.ritual.premade), `${p.ref}: no premade ${p.ritual.premade}`);
  }
  for (const phase of ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent', 'dark']) {
    assert.ok(refs.has(`moon-${phase}`), `moon-${phase}`);
  }
});

test('refs from Today ids', () => {
  assert.equal(holyRef('hellenic-lenaia-2026-0-30'), 'hellenic-lenaia');
  assert.equal(holyRef('wheel_south-samhain-2026-3-30'), 'wheel-samhain');
  assert.equal(holyRef('roman-cerialia'), 'roman-cerialia');
  assert.equal(moonRef({ name: 'Full Moon', illumination: 1 }), 'moon-full');
  assert.equal(moonRef({ name: 'New Moon', illumination: 0.001 }), 'moon-dark');
  assert.equal(principalRef('firstQuarter'), 'moon-first-quarter');
  assert.ok(holyPage('roman-carmentalia-2') || holyPage('roman-carmentalia'));
});

test('grimoire blocks and finding an existing page', () => {
  const page = holyPage('moon-full')!;
  const blocks = holyBlocks(page);
  assert.equal(blocks[0].type, 'callout');
  assert.ok(blocks.some((b) => b.type === 'heading' && b.content === 'My notes'));
  assert.ok(!blocks.some((b) => b.type === 'text' && /<script/i.test(b.content)));
  const sections = [{ id: 's1', title: 'The Moon' }];
  const pages = [
    { id: 'a', title: page.title, section_id: 'other', metadata: null },
    { id: 'b', title: page.title, section_id: 's1', metadata: null },
  ];
  assert.equal(findHolyGrimoirePage(pages, sections, page)?.id, 'b');
  assert.equal(findHolyGrimoirePage([...pages, { id: 'c', title: 'x', section_id: null, metadata: { holyRef: page.ref } }], sections, page)?.id, 'c');
  assert.equal(findHolyGrimoirePage([], sections, page), null);
});
