// The app's copy of the world-cities list, loaded the first time the place
// search runs rather than when the app starts. scripts/build-core.mjs copies
// the same file to js/core/cities.json for the website.

import type { CityData } from './places';

let data: CityData | null = null;

export function cityData(): CityData {
  if (!data) {
    // Required here, not imported at the top, so the module is only evaluated when a search is made.
    data = require('./data/cities.json') as CityData;
  }
  return data;
}
