export type Lean = 'yes' | 'not-yet' | 'no' | 'depends';
export type ReadTopic = 'general' | 'love' | 'money' | 'health' | 'home' | 'spirit';
export type CardReading = {
  lean: Lean; // how the card answers a yes/no-ish question
  why: string; // ONE sentence: the reason behind the lean, plain words
  advice: string; // ONE practical, specific step, imperative
  topics: Record<ReadTopic, string>; // 2–3 sentences each, second person
};
export type CardReadings = Record<string, { up: CardReading; rev: CardReading }>;
