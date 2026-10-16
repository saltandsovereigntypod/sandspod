// "Closed & living traditions": respectful explanations of traditions the app
// does not teach, because they belong to particular peoples or are entered
// through initiation and community. Each entry explains what the tradition is,
// where it comes from, how people actually come into it, what's open and what
// isn't, common myths, and how to learn properly. Nothing here teaches a
// working, a ceremony or how to call a spirit.

export type ClosedGroup = 'indigenous' | 'african-diaspora' | 'other';

export type Openness =
  /** Held by a people or nation; outsiders are guests, not practitioners. */
  | 'closed'
  /** Open to those who join through initiation, a house or a teacher. */
  | 'initiatory'
  /** The community itself disagrees about outsiders; both views are given. */
  | 'debated';

export type ClosedSection = { heading: string; body: string };

export type ClosedTradition = {
  /** Stable, kebab-case. */
  id: string;
  name: string;
  /** Other names and spellings people search for. */
  aka: string[];
  group: ClosedGroup;
  openness: Openness;
  /** Where and whose: peoples, nations, regions. */
  peoples: string;
  /** One or two sentences for the list. */
  summary: string;
  /** A few short sections: what it is, its history, core ideas at a general level. */
  sections: ClosedSection[];
  /** How people actually come into it: family, initiation, godparents, elders, houses. */
  howPeopleComeIn: string;
  /** What's open to outsiders and what isn't, including where the community disagrees. */
  openAndClosed: string;
  /** Common misconceptions, each corrected. */
  myths: { myth: string; truth: string }[];
  /** What not to do, plainly. */
  please: string[];
  /** How to learn properly and support the community. */
  learn: string;
  /** Works by practitioners and scholars (author, title, year). */
  reading: string[];
  /** Organisations and community resources run by the people themselves, if well established. */
  community?: string[];
  /** Related traditions in this guide (ids). */
  related?: string[];
};

/** Plants and stones whose sourcing raises real concerns. */
export type SourcingNote = {
  /** Living Library ref when the app has the entry, e.g. "traditional/herb/sandalwood". */
  ref?: string;
  name: string;
  /** Why care is needed: overharvesting, sacred status, labour, habitat. */
  concern: string;
  /** What to do instead, or how to buy well. */
  instead: string;
  /** Closed-tradition entry it relates to, if any. */
  tradition?: string;
};
