export type Feeling = 'fear' | 'calm' | 'joy' | 'sad' | 'anger' | 'confused';
export type DreamSymbol = {
  id: string;
  name: string;
  words: string[];
  category: 'nature' | 'elements' | 'places' | 'animals' | 'body' | 'actions' | 'people' | 'objects' | 'spirit';
  folk: string;
  psyche: string;
  craft?: string;
  byFeeling: Record<Feeling, string>;
  questions: string[];
  action?: string;
  library?: string;
};
