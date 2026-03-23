import { ChordQuery, ChordResponse } from "./chordTypes";

type ParsedChord = {
  root: string;
  accidental: string;
  quality: string;
  alterations: string[];
  bass?: string | null;
};

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  "E#": 5,
  Fb: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  "B#": 0,
  Cb: 11
};

const SEMITONE_TO_NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DEFAULT_RANGE: [number, number] = [36, 96];

const QUALITY_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  "": [0, 4, 7],
  m: [0, 3, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  "+": [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  "6/9": [0, 4, 7, 9, 14],
  "69": [0, 4, 7, 9, 14],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  mMaj7: [0, 3, 7, 11],
  "9": [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  "11": [0, 4, 7, 10, 14, 17],
  "13": [0, 4, 7, 10, 14, 21],
  sus: [0, 5, 7]
};

const ALTERATION_OFFSETS: Record<string, number> = {
  b9: 13,
  "#9": 15,
  "9": 14,
  add9: 14,
  "#11": 18,
  "11": 17,
  b13: 20,
  "13": 21
};

const FORMULA_NAMES: Record<number, string> = {
  0: "1",
  1: "b2",
  2: "2",
  3: "b3",
  4: "3",
  5: "4",
  6: "b5",
  7: "5",
  8: "#5",
  9: "6",
  10: "b7",
  11: "7",
  13: "b9",
  14: "9",
  15: "#9",
  17: "11",
  18: "#11",
  20: "b13",
  21: "13"
};

const ROMAN_MAP: Record<number, string> = {
  0: "I",
  1: "bII",
  2: "II",
  3: "bIII",
  4: "III",
  5: "IV",
  6: "#IV",
  7: "V",
  8: "#V",
  9: "VI",
  10: "bVII",
  11: "VII"
};

export function computeChordLocal(query: ChordQuery): ChordResponse {
  const symbol = query.symbol?.trim();
  if (!symbol) {
    throw new Error("Chord symbol is required");
  }
  const parsed = parseChordSymbol(symbol);
  const [midi, formulas] = buildMidiNotes(parsed, {
    octave: query.octave ?? 4,
    inversion: query.inversion ?? 0,
    transpose: query.transpose ?? 0,
    fitRange: [query.rangeMin ?? DEFAULT_RANGE[0], query.rangeMax ?? DEFAULT_RANGE[1]]
  });
  const tones = midi.map(midiToName);
  const roman = toRoman(parsed, query.key);
  return {
    symbol,
    key: query.key,
    roman,
    tones,
    midi,
    formula: formulas,
    range: { min: query.rangeMin ?? DEFAULT_RANGE[0], max: query.rangeMax ?? DEFAULT_RANGE[1] }
  };
}

function parseNote(noteStr: string): string {
  const s = noteStr.trim();
  if (!s) return "";
  const root = s.charAt(0).toUpperCase();
  let accidental = s.slice(1);
  if (accidental.toLowerCase() === "b") accidental = "b";
  else if (accidental === "#") accidental = "#";
  else accidental = "";
  return root + accidental;
}

function parseChordSymbol(symbol: string): ParsedChord {
  const text = symbol.trim();
  if (!text || !"ABCDEFG".includes(text[0].toUpperCase())) {
    throw new Error("Chord must start with A-G");
  }
  const root = text[0].toUpperCase();
  let idx = 1;
  let accidental = "";
  if (idx < text.length) {
    const c = text[idx];
    if (c === "b" || c === "B") {
      accidental = "b";
      idx += 1;
    } else if (c === "#") {
      accidental = "#";
      idx += 1;
    }
  }
  let body = text.slice(idx);
  let bass: string | null = null;
  if (body.includes("/")) {
    const parts = body.split("/");
    body = parts[0] ?? "";
    bass = parts[1]?.trim() || null;
  }
  const [quality, alterations] = splitQualityAndAlterations(body);
  return { root, accidental, quality, alterations, bass };
}

function splitQualityAndAlterations(body: string): [string, string[]] {
  const token = (body || "").trim();
  const qualities = Object.keys(QUALITY_INTERVALS).sort((a, b) => b.length - a.length);
  for (const q of qualities) {
    if (token.startsWith(q)) {
      const rest = token.slice(q.length);
      const alterations = parseAlterations(rest);
      return [q, alterations];
    }
  }
  return ["", parseAlterations(token)];
}

function parseAlterations(text: string): string[] {
  if (!text) return [];
  let buf = text;
  const tokens: string[] = [];
  const ordered = ["#11", "b13", "13", "11", "add9", "#9", "b9", "9"];
  while (buf) {
    let matched = false;
    for (const t of ordered) {
      if (buf.startsWith(t)) {
        tokens.push(t);
        buf = buf.slice(t.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      buf = buf.slice(1);
    }
  }
  return tokens;
}

function buildMidiNotes(
  parsed: ParsedChord,
  opts: { octave: number; inversion: number; transpose: number; fitRange: [number, number] }
): [number[], string[]] {
  const rootNote = `${parsed.root}${parsed.accidental}`;
  const rootPc = NOTE_TO_SEMITONE[rootNote];
  if (rootPc === undefined) {
    throw new Error(`Invalid root note: ${rootNote}`);
  }
  const baseRoot = toMidiNumber(rootPc, opts.octave);
  const intervals = [...(QUALITY_INTERVALS[parsed.quality] ?? QUALITY_INTERVALS[""])];
  for (const alt of parsed.alterations) {
    const offset = ALTERATION_OFFSETS[alt];
    if (offset !== undefined && !intervals.includes(offset)) {
      intervals.push(offset);
    }
  }
  intervals.sort((a, b) => a - b);
  let notes = intervals.map((i) => baseRoot + i);

  if (parsed.bass) {
    const normalizedBass = parseNote(parsed.bass);
    const bassPc = NOTE_TO_SEMITONE[normalizedBass];
    if (bassPc !== undefined) {
      const bassNote = toMidiNumber(bassPc, opts.octave - 1);
      notes.push(bassNote);
      notes.sort((a, b) => a - b);
    }
  }

  notes = applyInversion(notes, opts.inversion);
  if (opts.transpose) {
    notes = notes.map((n) => n + opts.transpose);
  }
  notes = clampToRange(notes, opts.fitRange);
  const formulas = intervals.map((i) => FORMULA_NAMES[i % 24] ?? "?");
  return [notes, formulas];
}

function toMidiNumber(pc: number, octave: number): number {
  return pc + (octave + 1) * 12;
}

function midiToName(n: number): string {
  const pc = ((n % 12) + 12) % 12;
  const octave = Math.floor(n / 12) - 1;
  return `${SEMITONE_TO_NOTE[pc]}${octave}`;
}

function applyInversion(notes: number[], inversion: number): number[] {
  if (!notes.length) return [];
  const ordered = [...notes].sort((a, b) => a - b);
  const inv = inversion % ordered.length;
  for (let i = 0; i < inv; i += 1) {
    const top = ordered.shift();
    if (top !== undefined) {
      ordered.push(top + 12);
    }
  }
  return ordered.sort((a, b) => a - b);
}

function clampToRange(notes: number[], bounds: [number, number]): number[] {
  if (!notes.length) return [];
  let arr = [...notes];
  const [low, high] = bounds;
  while (Math.min(...arr) < low) {
    arr = arr.map((n) => n + 12);
  }
  while (Math.max(...arr) > high) {
    arr = arr.map((n) => n - 12);
  }
  return arr;
}

function toRoman(parsed: ParsedChord, key?: string | null): string | null {
  if (!key) return null;
  const rootKey = parseNote(key);
  if (!(rootKey in NOTE_TO_SEMITONE)) return null;
  const rootPc = NOTE_TO_SEMITONE[`${parsed.root}${parsed.accidental}`];
  const keyPc = NOTE_TO_SEMITONE[rootKey];
  const diff = (rootPc - keyPc + 12) % 12;
  let base = ROMAN_MAP[diff] ?? "?";
  if (["m", "min", "m7", "min7", "m7b5", "m9", "mMaj7"].includes(parsed.quality)) {
    base = base.toLowerCase();
  }
  if (["dim", "dim7", "m7b5"].includes(parsed.quality)) {
    base += "°";
  } else if (["aug", "+"].includes(parsed.quality)) {
    base += "+";
  } else if (["maj7", "M7", "maj9"].includes(parsed.quality)) {
    if (parsed.quality === "maj7" || parsed.quality === "M7") {
      base += "maj7";
    }
  }
  if (parsed.bass) {
    return `${base}/${parsed.bass}`;
  }
  return base;
}
