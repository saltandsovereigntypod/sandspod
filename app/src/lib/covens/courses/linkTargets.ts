// What a course link points at, looked up in the registries themselves: the
// holy pages, the Living Library, the closed & living traditions guide, the
// ready-made rituals, the journeys, the spreads and the altar's seasonal
// objects. Used when the programs are composed (the build and the tests, never
// the app's bundle: the programs reach the app as data), to name each button
// after what it opens and to find any link whose target doesn't exist.

import { COURSE_PAGES, COVEN_PAGES, holyLinkRef, type CourseLink } from '../courseLinks.ts';
import { holyPage } from '../../holy/index.ts';
import { TRADITIONAL_LIBRARY } from '../../library/traditionalData.ts';
import { CLOSED_GUIDE_TITLE, closedById } from '../../library/closed/index.ts';
import { premadeById } from '../../rituals/premade/index.ts';
import { JOURNEYS } from '../../journeys/registry.ts';
import { spreadById } from '../../divination/draw.ts';
import { seasonalObject } from '../../altar/seasonal.ts';

const TYPE_WORD: Record<string, string> = { herb: 'Herb', crystal: 'Crystal', candle: 'Candle', deity: 'Deity', tool: 'Tool', vessel: 'Vessel' };

/** The name of what a link opens ("Ritual: A Simple Blót"), or null when there is no such thing. */
export function linkTargetLabel(link: CourseLink): string | null {
  const id = link.id;
  switch (link.kind) {
    case 'holy': {
      const page = holyPage(holyLinkRef(id));
      if (!page) return null;
      return page.ref.startsWith('moon-') ? `The moon: ${page.title}` : `Holy day: ${page.title}`;
    }
    case 'library': {
      const [layer, type, key] = id.split(':');
      const entry = layer === 'traditional' ? (TRADITIONAL_LIBRARY as Record<string, Record<string, { DisplayName?: string }>>)[type]?.[key] : null;
      if (!entry || key.startsWith('_')) return null;
      return `${TYPE_WORD[type] ?? 'Library'}: ${entry.DisplayName ?? key}`;
    }
    case 'closed': {
      if (!id) return CLOSED_GUIDE_TITLE;
      const t = closedById(id);
      return t ? `${CLOSED_GUIDE_TITLE}: ${t.name}` : null;
    }
    case 'premade': {
      const p = premadeById(id);
      return p ? `Ritual: ${p.title}` : null;
    }
    case 'journey': {
      const j = JOURNEYS.find((x) => x.id === id);
      return j ? `Journey: ${j.title}` : null;
    }
    case 'spread': {
      const s = spreadById(id);
      return s ? `Spread: ${s.label}` : null;
    }
    case 'seasonal': {
      const o = seasonalObject(id);
      return o ? `For the altar: ${o.name}` : null;
    }
    case 'page':
      return COURSE_PAGES[id]?.label ?? null;
    case 'coven':
      return COVEN_PAGES[id]?.label ?? null;
  }
  return null;
}

/** The link with its button's words: the course's own, else the name of what it opens. */
export function namedLink(link: CourseLink): CourseLink {
  if (link.label) return link;
  const label = linkTargetLabel(link);
  return label ? { ...link, label } : link;
}
