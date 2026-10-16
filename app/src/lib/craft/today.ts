// "For your practice" on Today: one line a day for each practice someone
// keeps, drawn from that practice's own tools (the garden moon, the home's
// tide of the month, the hour's planet, the spring and neap tides, the
// customs and ancestor days coming up, the day's devotion…), each opening
// the tool it came from. Pure: the place and calendar choice come in.

import type { Place } from '../astro/rise.ts';
import type { HolidayChoice } from '../holidays.ts';
import { moonState } from '../moon.ts';
import type { PracticeId } from '../rituals/premade/types.ts';
import { HOUR_SUITS, isNow } from './cosmic/hours.ts';
import { planetaryHours } from '../astro/hours.ts';
import { sampler } from './eclectic/correspondences.ts';
import { dayElement } from './elemental/balance.ts';
import { customsAhead } from './folk/calendar.ts';
import { eveningOf, gardenNight, QUARTERS } from './green/moonGarden.ts';
import { hemisphereOf, inSeason } from './green/season.ts';
import { ancestorDays } from './hedge/ancestors.ts';
import { homeTide, lunationKey, tasksFor, TIDE_GUIDES } from './kitchen/moonhome.ts';
import { rangeStage } from './sea/tides.ts';
import { dateKey, devotionFor, eveningFirst } from './solitary/devotion.ts';

export type PracticeLine = {
  practice: PracticeId;
  /** The practice, as a small label: "Green". */
  label: string;
  /** The day's line. */
  line: string;
  /** A little more, when there's something useful to add. */
  detail?: string;
  /** The tool it comes from. */
  href: string;
};

export type PracticeDayContext = { place: Place | null; choice: HolidayChoice };

const DAY = 86_400_000;
const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const list = (names: string[], n = 3) => names.slice(0, n).join(', ');
const firstSentence = (text: string) => (text.match(/^[^.!?]*[.!?]/)?.[0] ?? text).trim();

/** "today", "tomorrow", "in 5 days", "on Friday" for something `inDays` away. */
export function whenWords(inDays: number, date: Date): string {
  if (inDays <= 0) return 'today';
  if (inDays === 1) return 'tomorrow';
  if (inDays < 7) return `on ${WEEKDAY[date.getDay()]}`;
  return `in ${inDays} days`;
}

const LINES: Record<PracticeId, (now: Date, ctx: PracticeDayContext) => Omit<PracticeLine, 'practice'> | null> = {
  green(now, { place }) {
    const night = gardenNight(eveningOf(now));
    const quarter = QUARTERS[night.quarter];
    const season = inSeason(now.getMonth() + 1, hemisphereOf(place?.latitude));
    const sow = season.sow.map((p) => p.name);
    const gather = season.harvest.map((p) => p.name);
    const detail = [sow.length ? `Sow: ${list(sow)}` : '', gather.length ? `Gather: ${list(gather)}` : ''].filter(Boolean).join(' · ');
    return { label: 'Green', line: quarter.headline, detail: detail || undefined, href: '/rituals/craft/green/moon' };
  },
  kitchen(now) {
    const tide = homeTide(now);
    const task = tasksFor(tide, lunationKey(now), 1)[0];
    return {
      label: 'Kitchen & hearth',
      line: task ? `${TIDE_GUIDES[tide].label}: ${task.title}` : TIDE_GUIDES[tide].summary,
      detail: task?.detail,
      href: '/rituals/craft/kitchen/moon',
    };
  },
  hedge(now, { choice }) {
    const day = ancestorDays(choice, now, 21)[0];
    if (day) return { label: 'Hedge', line: `${day.name} ${whenWords(day.inDays, day.date)}`, detail: firstSentence(day.meaning), href: '/rituals/craft/hedge/ancestors' };
    return { label: 'Hedge', line: 'Keep your dream journal by the bed tonight', detail: 'Write down whatever comes as soon as you wake.', href: '/rituals/craft/hedge/dreams' };
  },
  cosmic(now, { place }) {
    const hour = place ? planetaryHours(now, place)?.find((h) => isNow(h, now)) : null;
    if (hour) {
      return { label: 'Cosmic', line: `${hour.planet}’s hour until ${time(hour.end)}`, detail: `Good for ${HOUR_SUITS[hour.planet].short}.`, href: '/rituals/craft/cosmic/hours' };
    }
    const { planet } = dayElement(now);
    return { label: 'Cosmic', line: `${WEEKDAY[now.getDay()]} is ${planet}’s day`, detail: 'Add your place in Settings to see the planetary hours.', href: '/rituals/craft/cosmic/hours' };
  },
  crystal(now) {
    const moon = moonState(now);
    const line =
      moon.illumination > 0.96
        ? 'Full moon: set your stones out to charge tonight'
        : moon.illumination < 0.04
        ? 'New moon: a good night to cleanse your stones and set intentions'
        : moon.waxing
        ? 'The moon is waxing: a time to charge stones for growth'
        : 'The moon is waning: a time to cleanse stones and let go';
    return { label: 'Crystal', line, detail: 'Check which stones are due their care.', href: '/rituals/craft/crystal/care' };
  },
  eclectic(now) {
    const items = sampler(now);
    if (!items.length) return null;
    const item = items[Math.floor(now.getTime() / DAY) % items.length];
    return { label: 'Eclectic', line: `Borrow from ${item.practiceName}: ${item.tool.title}`, detail: item.tool.detail, href: `/rituals/craft/${item.practice}` };
  },
  elemental(now) {
    const { planet, element } = dayElement(now);
    return { label: 'Elemental', line: `${planet}’s day leans to ${element}`, detail: 'See which element your work has been missing.', href: '/rituals/craft/elemental/balance' };
  },
  folk(now) {
    const next = customsAhead(now, 21)[0];
    if (!next) return null;
    return { label: 'Traditional & folk', line: `${next.custom.name} ${whenWords(next.inDays, next.date)}`, detail: firstSentence(next.custom.keep), href: '/rituals/craft/folk/calendar' };
  },
  sea(now) {
    const { stage, peak } = rangeStage(now);
    const words: Record<typeof stage, string> = {
      spring: 'Spring tides: the biggest range, lowest lows for beachcombing',
      easing: 'The tides are easing from springs toward neaps',
      neap: 'Neap tides: a gentle range, the sea quieter',
      building: 'The tides are building toward springs',
    };
    const day = peak.toLocaleDateString(undefined, { weekday: 'long' });
    const peakWords: Record<typeof stage, string> = { spring: `Biggest around ${day}.`, easing: `Neaps around ${day}.`, neap: `Smallest around ${day}.`, building: `Springs around ${day}.` };
    const at = peak.getTime() > now.getTime() ? ` ${peakWords[stage]}` : '';
    return { label: 'Sea', line: words[stage], detail: `Check your local tide times.${at}`, href: '/rituals/craft/sea/tides' };
  },
  solitary(now) {
    const prompt = devotionFor(dateKey(now))[eveningFirst(now) ? 'evening' : 'morning'];
    return { label: 'Solitary', line: prompt.title, detail: firstSentence(prompt.text), href: '/rituals/craft/solitary/devotion' };
  },
};

/** A line for each practice kept, in the order given. */
export function practiceToday(practices: PracticeId[], now: Date, ctx: PracticeDayContext): PracticeLine[] {
  const out: PracticeLine[] = [];
  for (const practice of practices) {
    const make = LINES[practice];
    if (!make) continue;
    try {
      const line = make(now, ctx);
      if (line) out.push({ practice, ...line });
    } catch {
      // A tool that can't say anything today is left out rather than breaking Today.
    }
  }
  return out;
}
