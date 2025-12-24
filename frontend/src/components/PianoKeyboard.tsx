import React, { useMemo } from "react";

type PianoKeyboardProps = {
  highlightKeys: number[];
  range?: { min: number; max: number };
  onKeyPress?: (midi: number) => void;
};

const BLACK_PCS = new Set([1, 3, 6, 8, 10]);

type KeySpec = {
  midi: number;
  isBlack: boolean;
  x: number;
};

const WHITE_WIDTH = 22;
const WHITE_HEIGHT = 140;
const BLACK_WIDTH = 14;
const BLACK_HEIGHT = 85;

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  highlightKeys,
  range = { min: 36, max: 96 },
  onKeyPress,
}) => {
  const highlights = useMemo(() => new Set(highlightKeys), [highlightKeys]);

  const keys = useMemo(() => buildKeys(range.min, range.max), [range.min, range.max]);
  const whiteCount = keys.filter((k) => !k.isBlack).length;
  const width = whiteCount * WHITE_WIDTH;

  return (
    <svg
      className="keyboard"
      viewBox={`0 0 ${width} ${WHITE_HEIGHT}`}
      role="img"
      aria-label="piano keyboard"
    >
      {/* White keys */}
      {keys
        .filter((k) => !k.isBlack)
        .map((k) => (
          <rect
            key={k.midi}
            x={k.x}
            y={0}
            width={WHITE_WIDTH}
            height={WHITE_HEIGHT}
            fill={highlights.has(k.midi) ? "#fbbf24" : "#fff"}
            stroke="#1f2937"
            strokeWidth="1"
            rx="2"
            onMouseDown={() => onKeyPress?.(k.midi)}
          />
        ))}
      {/* Black keys */}
      {keys
        .filter((k) => k.isBlack)
        .map((k) => (
          <rect
            key={k.midi}
            x={k.x}
            y={0}
            width={BLACK_WIDTH}
            height={BLACK_HEIGHT}
            fill={highlights.has(k.midi) ? "#f59e0b" : "#111"}
            stroke="#111"
            strokeWidth="1"
            rx="2"
            onMouseDown={() => onKeyPress?.(k.midi)}
          />
        ))}
    </svg>
  );
};

function buildKeys(min: number, max: number): KeySpec[] {
  const keys: KeySpec[] = [];
  let whiteIndex = 0;
  const blackPositions: KeySpec[] = [];
  const blackOffsetMap: Record<number, number> = {
    1: 0, // C#
    3: 1, // D#
    6: 3, // F#
    8: 4, // G#
    10: 5, // A#
  };

  // First pass: place white keys and record their x.
  const whiteXs: number[] = [];
  for (let midi = min; midi <= max; midi++) {
    const pc = ((midi % 12) + 12) % 12;
    const isBlack = BLACK_PCS.has(pc);
    if (!isBlack) {
      const x = whiteIndex * WHITE_WIDTH;
      whiteXs.push(x);
      keys.push({ midi, isBlack: false, x });
      whiteIndex += 1;
    }
  }

  // Second pass: place black keys centered between neighboring whites.
  whiteIndex = 0;
  for (let midi = min; midi <= max; midi++) {
    const pc = ((midi % 12) + 12) % 12;
    const isBlack = BLACK_PCS.has(pc);
    if (isBlack) {
      const offset = blackOffsetMap[pc];
      const leftX = whiteXs[offset + Math.floor(whiteIndex / 7) * 7] ?? 0;
      const x = leftX + (WHITE_WIDTH - BLACK_WIDTH) / 2 + WHITE_WIDTH * offsetForPc(pc);
      blackPositions.push({ midi, isBlack: true, x });
    } else {
      whiteIndex += 1;
    }
  }

  return [...keys, ...blackPositions].sort((a, b) => a.midi - b.midi || (a.isBlack ? 1 : -1));
}

function offsetForPc(pc: number): number {
  // Small tweak factors to center black keys between their adjacent whites.
  switch (pc) {
    case 1: // C#
      return 0.55;
    case 3: // D#
      return 0.55;
    case 6: // F#
      return 0.55;
    case 8: // G#
      return 0.55;
    case 10: // A#
      return 0.55;
    default:
      return 0.5;
  }
}

export default PianoKeyboard;

