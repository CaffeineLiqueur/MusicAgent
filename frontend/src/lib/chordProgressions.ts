export type ChordProgression = {
  id: string;
  name: string;
  description: string;
  key: string;
  chords: string[];
};

export const PRESET_PROGRESSIONS: ChordProgression[] = [
  {
    id: "pop-1",
    name: "流行经典 I-V-vi-IV",
    description: "最常用的流行歌和弦进行，适用于无数歌曲",
    key: "C",
    chords: ["C", "G", "Am", "F"]
  },
  {
    id: "pop-2",
    name: "抒情 I-V-vi-IV (大调变体)",
    description: "稍作变化的流行进行，更加柔和",
    key: "G",
    chords: ["G", "D", "Em", "C"]
  },
  {
    id: "jazz-1",
    name: "爵士 ii-V-I",
    description: "爵士和声中最经典的终止式",
    key: "C",
    chords: ["Dm7", "G7", "Cmaj7"]
  },
  {
    id: "jazz-2",
    name: "爵士蓝调 I-IV-V",
    description: "12小节蓝调的核心进行",
    key: "F",
    chords: ["F7", "Bb7", "F7", "F7", "Bb7", "Bb7", "F7", "F7", "C7", "Bb7", "F7", "C7"]
  },
  {
    id: "rnb-1",
    name: "R&B vi-IV-I-V",
    description: "现代 R&B 和流行常用的进行",
    key: "D",
    chords: ["Bm", "G", "D", "A"]
  },
  {
    id: "rock-1",
    name: "摇滚 I-V-vi-IV (重摇滚)",
    description: "带力量感的摇滚进行",
    key: "E",
    chords: ["E", "B", "C#m", "A"]
  },
  {
    id: "soul-1",
    name: "灵魂乐 I-vi-IV-V",
    description: "60年代灵魂乐经典进行",
    key: "C",
    chords: ["C", "Am", "F", "G"]
  },
  {
    id: "lofi-1",
    name: "Lo-fi 爵士进行",
    description: "适合 Lo-fi 嘻哈的和弦进行",
    key: "Am",
    chords: ["Am7", "D7", "Gmaj7", "Cmaj7"]
  },
  {
    id: "gospel-1",
    name: "福音 I-IV-V-vi",
    description: "充满希望感的福音进行",
    key: "D",
    chords: ["D", "G", "A", "Bm"]
  },
  {
    id: "ballad-1",
    name: "抒情小调 i-VI-III-VII",
    description: "情感丰富的小调抒情进行",
    key: "Am",
    chords: ["Am", "F", "C", "G"]
  }
];

export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const MINOR_KEYS = ["Am", "A#m", "Bm", "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m"];

// 半音移调函数
export function transposeChord(chord: string, semitones: number): string {
  const noteMatch = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!noteMatch) return chord;

  const [, rootNote, rest] = noteMatch;
  const noteIndex = KEYS.indexOf(rootNote);
  if (noteIndex === -1) {
    // 尝试小调
    const minorRoot = rootNote.replace(/m$/, "");
    const minorIndex = MINOR_KEYS.indexOf(rootNote);
    if (minorIndex !== -1) {
      const newIndex = (minorIndex + semitones + 12) % 12;
      return MINOR_KEYS[newIndex] + rest;
    }
    return chord;
  }

  const newIndex = (noteIndex + semitones + 12) % 12;
  return KEYS[newIndex] + rest;
}

export function transposeProgression(progression: ChordProgression, newKey: string): ChordProgression {
  const originalKey = progression.key;
  const originalIsMinor = originalKey.toLowerCase().endsWith("m");
  const newIsMinor = newKey.toLowerCase().endsWith("m");

  // 获取原调根音
  let originalRoot = originalIsMinor ? originalKey.slice(0, -1) : originalKey;
  let newRoot = newIsMinor ? newKey.slice(0, -1) : newKey;

  const originalIndex = KEYS.indexOf(originalRoot);
  const newIndex = KEYS.indexOf(newRoot);

  if (originalIndex === -1 || newIndex === -1) return progression;

  const semitones = newIndex - originalIndex;

  return {
    ...progression,
    key: newKey,
    chords: progression.chords.map(chord => transposeChord(chord, semitones))
  };
}
