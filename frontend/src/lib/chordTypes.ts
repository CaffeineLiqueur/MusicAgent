export type ChordResponse = {
  symbol: string;
  key?: string | null;
  roman?: string | null;
  tones: string[];
  midi: number[];
  formula: string[];
  range: { min: number; max: number };
};

export type ChordQuery = {
  symbol: string;
  key?: string;
  inversion?: number;
  octave?: number;
  transpose?: number;
  rangeMin?: number;
  rangeMax?: number;
};

