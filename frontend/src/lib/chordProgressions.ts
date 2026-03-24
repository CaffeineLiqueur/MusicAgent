export type ChordProgression = {
  id: string;
  name: string;
  description: string;
  key: string;
  chords: string[];
};

export const PRESET_PROGRESSIONS: ChordProgression[] = [
  {
    id: "50s-1",
    name: "50s Progression / 灵歌进行",
    description: "50-60年代经典，结构对称，复古纯真欢快，适用于早期摇滚乐、灵魂乐及复古风格乐曲",
    key: "C",
    chords: ["C", "Am", "Dm", "G"]
  },
  {
    id: "golden-1",
    name: "黄金进行",
    description: "流行音乐的基石，包含主音、属音、下属音以及关系小调，完美闭环情感，听感稳重且向上（Let It Be, Someone Like You）",
    key: "C",
    chords: ["C", "G", "Am", "F"]
  },
  {
    id: "canon-1",
    name: "卡农进行",
    description: "源自巴洛克时期帕海贝尔《卡农》，低音音阶式下行，线性逻辑让听感极其顺滑（华语经典抒情歌如《勇气》、《红豆》）",
    key: "C",
    chords: ["C", "G", "Am", "Em", "F", "C", "Dm", "G"]
  },
  {
    id: "4536251-1",
    name: "4536251 进行",
    description: "基于五度循环的强力解决，每个和弦向下一个四度/五度推进，层层递进、情感升华，华语流行乐的“催泪神套路”",
    key: "C",
    chords: ["F", "G", "Em", "Am", "Dm", "G", "C"]
  },
  {
    id: "jazz-251-1",
    name: "2-5-1 进行",
    description: "爵士乐和 R&B 的核心灵魂，通过 ii 级到 V 级的紧张感最终完美“解决”到 I 级，慵懒高级的现代都市感",
    key: "C",
    chords: ["Dm7", "G7", "Cmaj7"]
  },
  {
    id: "sad-1",
    name: "悲凉下行进行",
    description: "黄金进行的变体，从关系小调开始，忧郁叙事性基调，现代 EDM 和摇滚乐的宠儿（Faded, Apologize）",
    key: "Am",
    chords: ["Am", "F", "C", "G"]
  },
  {
    id: "japanese-1",
    name: "日系感“王道”进行",
    description: "在 vi 级上使用离调大和弦，突然的明亮感和强烈倾向性，大量动漫音乐中热血又带点感伤的味道",
    key: "C",
    chords: ["F", "G", "Em", "A"]
  },
  {
    id: "line-cliche-1",
    name: "浪漫主义：下行半音进行",
    description: "保持和弦主干不变，内声部半音下行，极其细腻、充满电影感的纠葛情绪（肖邦、电影配乐、Autumn Leaves）",
    key: "Am",
    chords: ["Am", "Am(maj7)", "Am7", "Am6"]
  },
  {
    id: "plagal-1",
    name: "圣咏进行",
    description: "又称“变格终止”，神圣宽恕的感觉；若用 Fm 则利用降 E 到 E 的半音趋近，产生极度治愈的色彩，梦幻怀旧",
    key: "C",
    chords: ["F", "C"]
  },
  {
    id: "folk-1",
    name: "现代民谣进行",
    description: "阶梯式低音下行，通过转位和弦 G/B 让低音线从 C 顺滑降到 G，听感通透清新，适合木吉他风格的钢琴伴奏",
    key: "C",
    chords: ["C", "G/B", "Am", "G"]
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
