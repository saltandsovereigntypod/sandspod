import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CATEGORIES,
  dialDigits,
  regionFromLocale,
  smsUrl,
  SUPPORT_LINES,
  supportSections,
  telUrl,
  textTarget,
  textWords,
} from '../src/lib/support/lines.ts';

const NUMBER_SHAPE = /^\+?[\d][\d \-()]*\d$/;

test('every line has an https url, a name, a region and a way to reach it', () => {
  for (const line of SUPPORT_LINES) {
    assert.ok(line.name.trim(), 'name');
    assert.match(line.url, /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i, `${line.name} url`);
    assert.doesNotThrow(() => new URL(line.url), `${line.name} url parses`);
    assert.ok(line.region.length > 0, `${line.name} region`);
    assert.ok(line.how.length > 0, `${line.name} how`);
    assert.ok(line.how.includes('web'), `${line.name} links to its own site`);
    assert.ok(CATEGORIES.some((c) => c.key === line.category), `${line.name} category`);
  }
});

test('numbers look valid and match how they can be used', () => {
  for (const line of SUPPORT_LINES) {
    const numbers = [line.number, line.textNumber, ...(line.alsoCall ?? []).map((a) => a.number)].filter(Boolean) as string[];
    for (const n of numbers) {
      assert.match(n, NUMBER_SHAPE, `${line.name}: ${n}`);
      const digits = dialDigits(n).replace('+', '');
      assert.ok(digits.length >= 3 && digits.length <= 15, `${line.name}: ${n} has ${digits.length} digits`);
    }
    if (line.how.includes('call')) assert.ok(line.number, `${line.name} can be called, so has a number`);
    if (line.how.includes('text')) assert.ok(textTarget(line), `${line.name} can be texted, so has a number`);
    if (line.textNumber) assert.ok(line.how.includes('text'), `${line.name} has a text number, so lists text`);
    if (line.keyword) assert.match(line.keyword, /^[A-Z]+$/, `${line.name} keyword`);
  }
});

test('the essential lines are present', () => {
  const has = (name: string, number?: string) =>
    SUPPORT_LINES.some((l) => l.name.includes(name) && (!number || l.number === number || l.textNumber === number));
  assert.ok(has('988', '988'));
  assert.ok(has('9-8-8', '9-8-8'));
  assert.ok(has('Samaritans', '116 123'));
  assert.ok(has('Shout', '85258'));
  assert.ok(has('Lifeline', '13 11 14'));
  assert.ok(has('1737', '1737'));
  assert.ok(has('Find A Helpline'));
  assert.ok(has('National Domestic Violence Hotline', '1-800-799-7233'));
  assert.ok(has('National Domestic Abuse Helpline', '0808 2000 247'));
});

test('regionFromLocale reads the region part of a locale', () => {
  assert.equal(regionFromLocale('en-GB'), 'GB');
  assert.equal(regionFromLocale('en_US'), 'US');
  assert.equal(regionFromLocale('fr-CA'), 'CA');
  assert.equal(regionFromLocale('zh-Hant-TW'), null);
  assert.equal(regionFromLocale('en-Latn-IE'), 'IE');
  assert.equal(regionFromLocale('en-UK'), 'GB');
  assert.equal(regionFromLocale('en'), null);
  assert.equal(regionFromLocale('de-DE'), null);
  assert.equal(regionFromLocale(''), null);
  assert.equal(regionFromLocale(undefined), null);
});

test('sections put the reader’s region first and anywhere-lines last', () => {
  const sections = supportSections('IE');
  assert.equal(sections[0].key, 'crisis');
  const crisis = sections[0].lines;
  assert.ok(crisis[0].region.includes('IE'));
  assert.ok(crisis.slice(0, 2).every((l) => l.region.includes('IE')));
  assert.deepEqual(crisis[crisis.length - 1].region, ['ALL']);

  const nz = supportSections('NZ')[0].lines;
  assert.equal(nz[0].name.startsWith('1737'), true);

  // No region: US then UK.
  const none = supportSections(null)[0].lines;
  assert.ok(none[0].region.includes('US'));
  const firstNonUs = none.find((l) => !l.region.includes('US'))!;
  assert.ok(firstNonUs.region.includes('GB'));

  // Nothing is lost or duplicated.
  const count = supportSections('AU').reduce((n, s) => n + s.lines.length, 0);
  assert.equal(count, SUPPORT_LINES.length);
});

test('tel and sms links', () => {
  assert.equal(telUrl('1-800-799-7233'), 'tel:18007997233');
  assert.equal(telUrl('116 123'), 'tel:116123');
  assert.equal(smsUrl('88788', 'START', 'ios'), 'sms:88788&body=START');
  assert.equal(smsUrl('88788', 'START', 'android'), 'sms:88788?body=START');
  assert.equal(smsUrl('0477 13 11 14'), 'sms:0477131114');
  const hotline = SUPPORT_LINES.find((l) => l.textNumber === '88788')!;
  assert.equal(textWords(hotline), 'Text START to 88788');
  const nz = SUPPORT_LINES.find((l) => l.number === '1737')!;
  assert.equal(textWords(nz), 'Text 1737');
});
