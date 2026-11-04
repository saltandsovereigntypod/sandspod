import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fitStageWidth, STAGE_ASPECT } from '../src/lib/altar/geometry.ts';
import { PRIVACY_URL, SITE_LINKS, sitePage, TERMS_URL } from '../src/lib/siteLinks.ts';

test('the website pages are full addresses, and can become paths on the same site', () => {
  assert.equal(sitePage('/'), 'https://saltandsovereignty.com/');
  assert.equal(sitePage('blog/'), 'https://saltandsovereignty.com/blog/');
  assert.equal(sitePage('/help/', ''), '/help/');
  assert.equal(sitePage('/submit/', 'https://example.org/'), 'https://example.org/submit/');
  assert.deepEqual(
    SITE_LINKS.map((l) => l.label),
    ['Home', 'Blog & podcast', 'Submit', 'Help'],
  );
  assert.equal(PRIVACY_URL, 'https://saltandsovereignty.com/privacy.html');
  assert.equal(TERMS_URL, 'https://saltandsovereignty.com/submission-terms.html');
});

test('the desktop stage fits its box at the altar’s shape', () => {
  // A wide, short box: the height decides.
  assert.equal(fitStageWidth(1200, 450), Math.floor(450 * STAGE_ASPECT));
  // A narrow, tall box: the width decides.
  assert.equal(fitStageWidth(600, 900), 600);
  // Not laid out yet: the width alone.
  assert.equal(fitStageWidth(640, 0), 640);
  assert.equal(fitStageWidth(0, 0), 0);
});
