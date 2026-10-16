// The in-app "How to" guide: short, task-shaped help for everything the app
// does, grouped by where it lives. Pure data, shown by more/help.

export type HelpTopic = {
  /** Stable, kebab-case, unique across the guide. */
  id: string;
  /** A task, phrased as people search for it: "Carve a word into a candle". */
  title: string;
  /** One sentence on what it is and why you'd do it. */
  summary: string;
  /** Numbered steps naming the real tabs, buttons and labels, in order. */
  steps: string[];
  /** Optional extra notes: good to know, gotchas, where it syncs. */
  tips?: string[];
  /** A route to open it directly ("Take me there"), if there is one screen for it. */
  href?: string;
  /** Other words people might search with. */
  keywords?: string[];
};

export type HelpSection = {
  id: string;
  title: string;
  /** One or two sentences on what this part of the app is for. */
  intro: string;
  topics: HelpTopic[];
};
