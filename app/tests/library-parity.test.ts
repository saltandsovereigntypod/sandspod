import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildLibrary, grimoireShelves, layerFields, normalizeLayout, typeLabel } from '../src/lib/library/model.ts';
import { emptyPracticeInput, mergePractice } from '../src/lib/library/practiceModel.ts';
import { formatRitualDuration, ritualRecord } from '../src/lib/library/records.ts';
import { decodeEntities, richTextBlocks, richTextToPlain } from '../src/lib/library/richText.ts';
import type { PracticeRow } from '../src/lib/library/types.ts';

const row = (extra: Partial<PracticeRow>): PracticeRow => ({
  entity_id: 'e1',
  name: 'Protection Jar',
  type: 'apothecary',
  image: null,
  my_practice: {},
  community: {},
  updated_at: null,
  ...extra,
});

test('ingredients saved as objects on the website show as "amount name" chips', () => {
  const fields = layerFields(
    {
      Ingredients: [
        { label: 'Rosemary Loose', libraryName: 'rosemary', amount: '1 pinch' },
        { label: 'Salt', amount: '' },
        { amount: '2' },
        'Bay leaf',
      ],
      Single: { label: 'Altar Mist' },
    },
    'myPractice',
  );
  const ingredients = fields.find((f) => f.key === 'Ingredients')!;
  assert.deepEqual(ingredients.chips, ['1 pinch rosemary', 'Salt', '2 Ingredient', 'Bay leaf']);
  assert.deepEqual(ingredients.chipNames, ['rosemary', 'Salt', '2 Ingredient', 'Bay leaf'], 'chips open the entry without the amount');
  assert.equal(ingredients.text, '1 pinch rosemary, Salt, 2 Ingredient, Bay leaf');
  assert.equal(fields.find((f) => f.key === 'Single')?.text, 'Altar Mist');
});

test('website rich text reads as paragraphs, lists and quotes with styled runs', () => {
  const blocks = richTextBlocks(
    '<div>Burn on a <b>Sunday</b> &amp; <i>pray</i></div><div><br></div><ul><li>Rosemary</li><li><u>Salt</u></li></ul><ol><li>One</li><li>Two<br>more</li></ol><blockquote>As above</blockquote><script>alert(1)</script>Tail &#8212; done',
  );
  assert.deepEqual(blocks[0], {
    kind: 'paragraph',
    runs: [{ text: 'Burn on a ' }, { text: 'Sunday', bold: true }, { text: ' & ' }, { text: 'pray', italic: true }],
  });
  assert.deepEqual(
    blocks.slice(1).map((b) => [b.kind, b.number ?? null, b.runs.map((r) => r.text).join('')]),
    [
      ['bullet', null, 'Rosemary'],
      ['bullet', null, 'Salt'],
      ['number', 1, 'One'],
      ['number', 2, 'Two\nmore'],
      ['quote', null, 'As above'],
      ['paragraph', null, 'Tail — done'],
    ],
  );
  assert.equal(blocks[2].runs[0].underline, true);
  assert.equal(richTextToPlain('<p>Line one</p><ul><li>a</li></ul>'), 'Line one\n• a');
  assert.equal(richTextToPlain('Plain & simple <3'), 'Plain & simple <3', 'plain text is left alone');
  assert.deepEqual(richTextBlocks('first\n\nsecond').map((b) => b.runs[0].text), ['first', 'second']);
  assert.equal(decodeEntities('&lt;b&gt; &quot;x&quot; &#x27;y&#39; &bogus;'), '<b> "x" \'y\' &bogus;');
});

test('editing keeps website formatting on fields left as they were', () => {
  const existing = { Meaning: '<b>Courage</b>', Notes: '<ul><li>Sun</li></ul>', Custom: 'kept' };
  const input = emptyPracticeInput(existing);
  assert.equal(input.Meaning, 'Courage');
  assert.equal(input.Notes, '• Sun');
  const saved = mergePractice(existing, { ...input, Notes: 'Moon too' });
  assert.equal(saved.Meaning, '<b>Courage</b>');
  assert.equal(saved.Notes, 'Moon too');
  assert.equal(saved.Custom, 'kept');
});

test('page layouts from the website hide and order fields', () => {
  assert.equal(normalizeLayout({ sectionOrder: ['myPractice'], hiddenFields: {}, fieldOrder: {}, customFields: [] }), null);
  assert.equal(normalizeLayout('nope'), null);
  const layout = normalizeLayout({
    hiddenFields: { myPractice: ['Uses', 3], traditional: [] },
    fieldOrder: { myPractice: ['Notes', 'Missing', 'Meaning'] },
    customFields: [{ key: 'Moon', label: 'Moon Phase' }, { label: 'no key' }],
  })!;
  assert.deepEqual(layout.hiddenFields, { myPractice: ['Uses'] });
  const fields = layerFields({ Meaning: 'm', Uses: 'u', Notes: 'n', Moon: 'full', PairsWith: 'basil' }, 'myPractice', null, layout);
  assert.deepEqual(fields.map((f) => f.key), ['Notes', 'Meaning', 'PairsWith', 'Moon']);
  assert.equal(fields.at(-1)!.label, 'Moon Phase');
  const entries = buildLibrary([row({ my_practice: { Notes: 'x' }, layout: { hiddenFields: { myPractice: ['Notes'] } } })]);
  assert.deepEqual(entries.find((e) => e.id === 'practice:e1')?.layout?.hiddenFields, { myPractice: ['Notes'] });
});

test('ritual templates have their own My Practice shelf, "Templates"', () => {
  assert.equal(typeLabel('ritual_template'), 'Templates');
  const entries = buildLibrary([row({ entity_id: 'ritual-template:t1', name: 'Full Moon', type: 'ritual_template', my_practice: { Purpose: 'Release' } })]);
  const mine = grimoireShelves(entries).find((s) => s.key === 'myPractice')!;
  assert.deepEqual(mine.sections[0].groups.map((g) => g.label), ['Templates']);
});

test('ritual entries read as a record, as on the website', () => {
  assert.equal(formatRitualDuration(3900), '1 hr 5 min');
  assert.equal(formatRitualDuration(0), 'Not recorded');
  assert.equal(formatRitualDuration(7200), '2 hr');
  const record = ritualRecord(
    'ritual',
    {
      Date: '2026-10-12',
      TimeOfDay: 'Evening',
      DurationSeconds: 1800,
      Intention: 'Protection',
      AltarItems: ['White Candle', ''],
      WhatHappenedDuring: 'Flame leapt',
      WhatHappenedAfter: 'Calm',
      FeelingsDuring: 'Steady',
      Results: 'Good',
      ChangesForNextTime: 'More salt',
      Notes: '',
    },
    'en-US',
  )!;
  assert.deepEqual(record.facts, [
    { label: 'Date', value: 'October 12, 2026' },
    { label: 'Time of day', value: 'Evening' },
    { label: 'Duration', value: '30 min' },
  ]);
  assert.deepEqual(
    record.sections.map((s) => [s.title, s.chips ?? s.text]),
    [
      ['Intention', 'Protection'],
      ['The Altar', ['White Candle']],
      ['What Happened', 'Flame leapt\n\nCalm'],
      ['Feelings and Impressions', 'Steady'],
      ['Results and Follow-Up', 'Good\n\nMore salt'],
    ],
  );
  const template = ritualRecord('ritual_template', { Purpose: 'Release', Closing: 'Thank the moon' })!;
  assert.deepEqual(template.sections.map((s) => [s.title, s.text]), [
    ['Purpose and Intention', 'Release'],
    ['Estimated Duration', 'Not recorded'],
    ['Closing', 'Thank the moon'],
  ]);
  assert.equal(ritualRecord('herb', {}), null);
});
