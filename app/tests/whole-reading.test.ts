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
    const heads = story.map((l) => l.split(' ').slice(0, 2).join(' ').replace(/Place \d+/, 'P'));
    assert.equal(new Set(heads).size, heads.length);
  });
  it('has the sections, and one card stays short', () => {
    const r = composeReading('', [item('The Fool')])!;
    assert.deepEqual(r.sections.map((s) => s.title), ['Opening', 'The story', 'What it advises', 'To close']);
  });
  it('reads a real draw', () => {
    const spread = SPREADS.find((s) => s.kind === 'tarot' && s.positions.length === 3)!;
    const draw: Draw = { spread: spread.id, items: spread.positions.map((_, i) => ({ name: ['The Tower', 'The Star', 'Two of Cups'][i], reversed: false })) };
    assert.match(wholeReading(spread, draw, { question: 'love?' })?.text ?? '', /The Tower/);
  });
});
