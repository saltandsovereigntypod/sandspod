// The website's links in the app's menu: same-site paths when the web app
// runs on saltandsovereignty.com (the site's Worker serves it there), full
// addresses on a phone or the app's other web address.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isSiteOrigin, SITE_LINKS, SITE_ORIGIN, siteLinkOrigin, sitePage } from '../src/lib/siteLinks.ts';

test('on saltandsovereignty.com the website links are paths on this site', () => {
  assert.equal(isSiteOrigin('https://saltandsovereignty.com'), true);
  assert.equal(isSiteOrigin('https://www.saltandsovereignty.com'), true);
  assert.equal(siteLinkOrigin('https://saltandsovereignty.com'), '');
  assert.equal(sitePage('/help/', siteLinkOrigin('https://saltandsovereignty.com')), '/help/');
  assert.equal(sitePage('privacy.html', ''), '/privacy.html');
});

test('elsewhere they are full addresses on the website', () => {
  for (const origin of ['https://saltandsovereignty.expo.app', 'http://localhost:8081', 'https://saltandsovereignty.com.evil.example', null, undefined]) {
    assert.equal(isSiteOrigin(origin), false, String(origin));
    assert.equal(siteLinkOrigin(origin), SITE_ORIGIN);
  }
  assert.equal(sitePage('/#about', siteLinkOrigin(null)), 'https://saltandsovereignty.com/#about');
  // Under Node (as on a phone) there is no page origin: full addresses.
  assert.equal(SITE_LINKS[0].url, 'https://saltandsovereignty.com/#about');
});
