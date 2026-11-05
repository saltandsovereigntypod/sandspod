import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TAROT_DECK } from '../src/lib/divination/tarot.ts';
import { SPREADS, type Draw } from '../src/lib/divination/draw.ts';
import { composeReading, countPatterns, detectTopic, patternLines, wholeReading, type WholeItem } from '../src/lib/divination/wholeReading.ts';

const item = (name: string, reversed = false, pos = 'P'): WholeItem => ({
  name,
  reversed,
  position: { name: pos, about: 'About it.' },
  keywords: 'a, b',
  text: 'First sentence. Second.',
  card: TAROT_DECK.find((c) => c.name === name)!,
});

describe('detectTopic', () => {
  for (const [q, t] of [
    ['Will he come back, my ex?', 'person'],
    ['What does my love life need?', 'love'],
    ['Is this job right for me', 'money'],
    ['How can I rest and heal?', 'health'],
    ['My family and the house move', 'home'],
    ['Where is my path with magic going', 'spirit'],
    ['Should I go or stay', 'decision'],
    ['When will it change', 'timing'],
    ['Tell me something', 'general'],
    ['', 'general'],
  ] as const) it(`${q} -> ${t}`, () => assert.equal(detectTopic(q), t));
});

describe('patterns', () => {
  const items = [item('The Tower', true), item('The Star'), item('Death'), item('Two of Cups'), item('Two of Wands'), item('Queen of Cups')];
  it('counts majors, suits, reversals, numbers and courts', () => {
    const s = countPatterns(items);
    assert.equal(s.majors, 3);
    assert.equal(s.suits.Cups, 2);
    assert.equal(s.reversed, 1);
    assert.equal(s.numbers[2], 2);
    assert.equal(s.courts.length, 1);
  });
  it('writes lines for majors, pairs, courts and pairings', () => {
    const t = patternLines(items).join(' ');
    assert.match(t, /Major Arcana/);
    assert.match(t, /pair of Twos/i);
    assert.match(t, /Court cards/);
    assert.match(t, /Tower with The Star/);
  });
});

describe('composeReading', () => {
  const ten = ['The Fool', 'The Magician', 'Ace of Cups', 'Three of Wands', 'Five of Swords', 'Nine of Pentacles', 'The Sun', 'Judgement', 'King of Cups', 'Ten of Wands'].map((n, i) => item(n, i % 3 === 0, `Place ${i}`));
  it('never repeats an opener and is deterministic', () => {
    const a = composeReading('Should I move?', ten)!;
    const b = composeReading('Should I move?', ten)!;
    assert.equal(a.text, b.text);
    const story = a.sections.find((s) => s.title === 'The story')!.lines;
    assert.equal(new Set(story).size, story.length);
    assert.equal(story.length, ten.length);
  });
  it('has the sections, and one card stays short', () => {
    const r = composeReading('', [item('The Fool')])!;
    assert.deepEqual(r.sections.map((s) => s.title), ['Opening', 'What it advises', 'To close']);
  });
  it('answers a yes/no question first and merges a single card into the opening', () => {
    const r = composeReading('Is my magic getting stronger?', [{ ...item('Three of Pentacles', true), position: null }])!;
    assert.match(r.sections[0].lines[0], /^Not quite yet\. The Three of Pentacles reversed says /);
    assert.match(r.sections[0].lines[0], /the craft needs tending/);
    assert.match(r.sections[1].lines[0], /^Return to the fundamentals/);
    assert.ok(!r.sections.some((s) => s.title === 'The story'));
    assert.match(r.text, /Ask again after a moon cycle of practice\./);
  });
  it('tarot spreads use topic paragraphs, no repeated sentences, deterministic', () => {
    const cards = [item('The Tower', false, 'Past'), item('The Star', false, 'Present'), item('Two of Cups', false, 'Outcome')];
    const a = composeReading('Will we last?', cards)!;
    assert.equal(a.text, composeReading('Will we last?', cards)!.text);
    assert.match(a.sections[0].lines[0], /^(Yes\.|Yes, with care\.|Not quite yet\.|No, not as things stand\.|It depends on you\.)/);
    const story = a.sections.find((s) => s.title === 'The story')!.lines;
    assert.match(story[0], /^Past: The Tower \u2014 /);
    const sentences = a.text.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter((x) => x.length > 20);
    assert.equal(new Set(sentences).size, sentences.length);
  });
  it('without a yes/no question opens with the overall tone', () => {
    const r = composeReading('Tell me something', [item('The Tower'), item('The Star', false, 'Outcome')])!;
    assert.match(r.sections[0].lines[0], /^Overall the cards/);
  });
  it('reads a real draw', () => {
    const spread = SPREADS.find((s) => s.kind === 'tarot' && s.positions.length === 3)!;
    const draw: Draw = { spread: spread.id, items: spread.positions.map((_, i) => ({ name: ['The Tower', 'The Star', 'Two of Cups'][i], reversed: false })) };
    assert.match(wholeReading(spread, draw, { question: 'love?' })?.text ?? '', /The Tower/);
  });
});
