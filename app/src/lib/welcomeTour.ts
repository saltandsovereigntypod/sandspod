// The welcome tour: one page for each main part of the app, shown once the
// first time someone reaches the tabs, and again whenever they ask for it
// from More → How to use the app. Pure: the pages, the key that remembers the
// tour was seen, and a tiny signal the How to screen uses to replay it.

import type { IconName } from '../components/Icon';
import type { MoreIconName } from '../components/more/MoreIcon';

/** Bumped when the tour changes, so everyone sees the new one once. */
export const TOUR_SEEN_KEY = 'welcome.tour.v2';

/** The moon drawn as a disc, a tab icon, or one of More's icons. */
export type TourIcon = 'moon' | { tab: IconName } | { more: MoreIconName };

export type TourPage = { icon: TourIcon; title: string; body: string };

export const TOUR_PAGES: TourPage[] = [
  {
    icon: 'moon',
    title: 'Each day begins on Today',
    body: 'Tonight’s moon and its sign, the holidays from the calendars you keep, and what the day is good for. Tap the moon or a holiday to read what it means and how to keep it.',
  },
  {
    icon: { tab: 'altar' },
    title: 'Your altar, piece by piece',
    body: 'Open the cabinet’s drawers for candles, herbs, crystals, tools, deities, vessels, natural finds and offerings. Tap anything you place to learn its correspondences.',
  },
  {
    icon: { tab: 'samhain' },
    title: 'An altar that keeps time',
    body: 'Candles and incense burn in real time, offerings freshen and fade, and pots for your real houseplants ask for water. Before a festival you keep, the Seasonal drawer brings its things to the top.',
  },
  {
    icon: { more: 'offer' },
    title: 'Workings at the altar',
    body: 'Build a spell jar or a sachet, fold a petition under a candle, or keep a spell over days. “Set tonight’s altar” on Today starts one for you, and a widget puts an altar on your home screen.',
  },
  {
    icon: { tab: 'rituals' },
    title: 'Rituals by the moon',
    body: 'Begin a premade ritual or spell, or plan your own for the right night and run it step by step. Journal it afterwards, and on the day you chose it asks: did it work?',
  },
  {
    icon: { tab: 'wheel' },
    title: 'Cards, runes and sigils',
    body: 'Draw tarot, runes or ogham in a spread laid out in its shape, and come back to the reading later. The sigil maker turns an intent into one mark, and both are open to every practice.',
  },
  {
    icon: { tab: 'grimoire' },
    title: 'Your Book of Shadows',
    body: 'Practice → Grimoire keeps your pages beside the Living Library: herbs, crystals, deities and candle colours with their traditional lore. Your dreams live there too, with pages for the holidays and moons.',
  },
  {
    icon: { more: 'journey' },
    title: 'Your practice, your path',
    body: 'My practice gathers tools for green, kitchen, hedge, cosmic, crystal, sea and folk craft. Dedication journeys, patron deities and the Closed & living traditions guide help you walk a path with care.',
  },
  {
    icon: { tab: 'calendar' },
    title: 'Calendars and reminders',
    body: 'Keep the holidays of the calendars you follow, count your days by the moon, and show old calendars such as the Athenian or the Roman. Reminders can ring for the moon, your plans and your look-back days.',
  },
  {
    icon: { tab: 'coven' },
    title: 'Practise with a coven',
    body: 'Find or found a coven in the Coven tab. Tend its altars together, talk in its chat, hold rites as a circle, and walk its initiation and training.',
  },
  {
    icon: { more: 'account' },
    title: 'Yours on every screen',
    body: 'Sign in and your altars, Book of Shadows, rituals and settings stay in step with the Salt & Sovereignty website. As a guest, everything stays on this phone.',
  },
  {
    icon: { more: 'search' },
    title: 'Every step, when you need it',
    body: 'More → How to use the app explains each of these with the real buttons, and has a search. You can watch this tour again from there.',
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

/** Called by the tour so it can be shown again on request. Returns the unsubscribe. */
export function onReplayTour(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Show the welcome tour again from its first page. False if no tour is listening. */
export function replayWelcomeTour(): boolean {
  listeners.forEach((listener) => listener());
  return listeners.size > 0;
}
