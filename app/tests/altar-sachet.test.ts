import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseLivingState } from '../src/lib/altar/livingState.ts';
import {
  addFilling,
  emptySachet,
  feedingDue,
  feedSachet,
  filling,
  nextFeeding,
  sachetObject,
  sachetPlanet,
  sachetProblem,
  sachetStateOf,
  setCarried,
} from '../src/lib/altar/workings/sachet.ts';

// 2026-10-16 is a Friday.
const friday = new Date(2026, 9, 16, 9);
const iso = (d: Date) => d.toISOString();

test('fillings read their planet from the Library, and the bag takes the one they share', () => {
  const rose = filling('Rose', 'herb', { herb: 'rose' });
  assert.equal(rose.planet, 'Venus');
  const quartz = filling('Rose quartz', 'stone', { crystal: 'rose_quartz' });
  assert.equal(quartz.planet, 'Venus');
  const key = filling('A small key', 'item');
  assert.equal(sachetPlanet([rose, quartz, key, filling('Basil', 'herb', { herb: 'basil' })]), 'Venus');
  assert.equal(sachetPlanet([key]), 'Moon');
});

test('a bag needs a purpose and something in it; the same thing twice goes in once', () => {
  assert.equal(sachetProblem(emptySachet()), 'Say what the bag is for first.');
  let bag = emptySachet('Love');
  assert.equal(sachetProblem(bag), 'Put at least one thing in it.');
  bag = addFilling(bag, filling('Rose', 'herb', { herb: 'rose' }));
  bag = addFilling(bag, filling('rose', 'herb', { herb: 'rose' }));
  assert.equal(bag.fillings.length, 1);
  assert.equal(sachetProblem(bag), null);
});

test('it is fed on its planet’s day: today if that’s today and not yet fed, else the next', () => {
  const venusToday = nextFeeding('Venus', friday);
  assert.equal(venusToday.getDay(), 5);
  assert.equal(venusToday.getDate(), 16);
  const fedToday = nextFeeding('Venus', friday, [{ at: iso(friday), with: 'oil' }]);
  assert.equal(fedToday.getDate(), 23);
  const moon = nextFeeding('Moon', friday);
  assert.equal(moon.getDay(), 1);
  assert.equal(moon.getDate(), 19);
  const saturn = nextFeeding('Saturn', friday);
  assert.equal(saturn.getDate(), 17);
  assert.equal(feedingDue({ planet: 'Venus', feedings: [] }, friday), true);
  assert.equal(feedingDue({ planet: 'Mars', feedings: [] }, friday), false);
});

test('the tied bag is an apothecary sachet the website shows, with its feedings in livingState.app.sachet', () => {
  let bag = { ...emptySachet('Love'), knots: 7, name: 'Heart bag' };
  bag = addFilling(bag, filling('Rose', 'herb', { herb: 'rose' }));
  bag = addFilling(bag, filling('Rose quartz', 'stone', { crystal: 'rose_quartz' }));
  const { item, object } = sachetObject(bag, [], iso(friday), undefined, 'bag-1');
  assert.equal(object.type, 'apothecary');
  assert.equal(object.form, 'sachet');
  assert.equal(object.apothecaryType, 'Sachet');
  assert.equal(item.details.sachet_purpose, 'Love');
  assert.equal(item.details.kept_location, 'Carried with me');
  assert.equal(item.livingState.tending_interval_days, 7);
  const state = sachetStateOf(object)!;
  assert.equal(state.knots, 7);
  assert.equal(state.planet, 'Venus');
  const apothecary = parseLivingState(object)!.apothecary as { activationState: string; nextTendingAt: string };
  assert.equal(apothecary.activationState, 'Tied with 7 knots');
  assert.equal(new Date(apothecary.nextTendingAt).getDate(), 16);

  const fed = feedSachet(object, iso(friday), 'A drop of rose oil');
  const after = sachetStateOf(fed)!;
  assert.equal(after.feedings.length, 1);
  assert.equal(after.feedings[0].with, 'A drop of rose oil');
  const next = (parseLivingState(fed)!.apothecary as { nextTendingAt: string }).nextTendingAt;
  assert.equal(new Date(next).getDate(), 23);
  assert.equal(sachetStateOf(setCarried(fed, false, iso(friday)))!.carried, false);
});
