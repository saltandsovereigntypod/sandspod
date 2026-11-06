import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TAROT_DECK } from '../src/lib/divination/tarot.ts';
import { SPREADS, type Draw } from '../src/lib/divination/draw.ts';
import { LENORMAND } from '../src/lib/divination/oracle/lenormand.ts';
import { KIPPER } from '../src/lib/divination/oracle/kipper.ts';
import { lenormandReading } from '../src/lib/divination/oracle/lenormandReadings.ts';
import { kipperReading } from '../src/lib/divination/oracle/kipperReadings.ts';
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

describe('Lenormand, Kipper and playing cards read together', () => {
  const spreadOf = (id: string) => SPREADS.find((s) => s.id === id)!;
  const drawOf = (id: string, names: string[], reversed = false): Draw => ({ spread: id, items: names.map((name) => ({ name, reversed })) });
  it('every Lenormand and Kipper card has a written reading with all six topics', () => {
    for (const c of LENORMAND) {
      const r = lenormandReading(c.name)!;
      assert.ok(r, c.name);
      for (const t of ['general', 'love', 'money', 'health', 'home', 'spirit'] as const) assert.ok(r.topics[t].length > 20, `${c.name} ${t}`);
      assert.ok(r.why.length > 20 && r.advice.length > 15, c.name);
    }
    for (const c of KIPPER) {
      const r = kipperReading(c.name)!;
      assert.ok(r, c.name);
      for (const t of ['health', 'home', 'spirit'] as const) assert.ok(r.topics[t].length > 30, `${c.name} ${t}`);
    }
    const whys = [...LENORMAND.map((c) => lenormandReading(c.name)!.why), ...KIPPER.map((c) => kipperReading(c.name)!.why)];
    assert.equal(new Set(whys).size, whys.length, 'no reason repeated');
  });
  it('reads a Lenormand line by its heart, its pairs and first with last', () => {
    const go = () => wholeReading(spreadOf('lenormand-three'), drawOf('lenormand-three', ['Ship', 'Rider', 'Letter']), { question: 'Will I hear back?' })!;
    const r = go();
    assert.match(r.sections[0].lines[0], /^(Yes|It depends|Not quite|No)/);
    assert.match(r.sections[0].lines[0], /The Rider, in the heart of it/);
    const pairs = r.sections.find((s) => s.title === 'Read in pairs')!.lines.join(' ');
    assert.match(pairs, /Ship \+ Rider: A journey soon/);
    assert.match(pairs, /First and last, read as a pair: Ship \+ Letter/);
    assert.match(r.text, /Hechtel/);
    assert.equal(r.text, go().text);
  });
  it('reads the Grand Tableau by houses, the cards round the significator and the four beneath', () => {
    const names = LENORMAND.map((c) => c.name);
    const r = wholeReading(spreadOf('lenormand-grand-tableau'), drawOf('lenormand-grand-tableau', names), { question: 'What about my love life?' })!;
    const houses = r.sections.find((s) => s.title === 'The houses')!.lines.join(' ');
    assert.match(houses, /The Woman lies in the House of the Woman/);
    assert.match(houses, /Touching her/);
    assert.match(houses, /look to the Heart: it lies in the House of the Heart/);
    assert.ok(r.sections.some((s) => s.title === 'The four beneath'));
  });
  it('reads Kipper outward from the main person', () => {
    const names = KIPPER.map((c) => c.name);
    const r = wholeReading(spreadOf('kipper-grand-tableau'), drawOf('kipper-grand-tableau', names), { question: 'Will he call?' })!;
    const near = r.sections.find((s) => s.title === 'Near and far')!.lines.join(' ');
    assert.match(near, /here Main Person \(Man\), in house 1/);
    assert.match(near, /Touching them, and acting now: Main Person \(Woman\)/);
  });
  it('reads playing cards by colour, suit and matching ranks', () => {
    const r = wholeReading(spreadOf('playing-three'), drawOf('playing-three', ['Ace of Spades', 'Ace of Hearts', 'Ace of Clubs']), { question: '' })!;
    const p = r.sections.find((s) => s.title === 'Patterns')!.lines.join(' ');
    assert.match(p, /Three Aces/);
    assert.match(r.text, /Etteilla/);
  });
});
