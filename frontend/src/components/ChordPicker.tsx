import React from "react";

type ChordPickerProps = {
  symbol: string;
  onSymbolChange: (value: string) => void;
  musicalKey?: string;
  onKeyChange?: (value: string) => void;
  onParse?: () => void;
  parsing?: boolean;
};

const ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const QUALITIES = [
  "maj",
  "min",
  "7",
  "maj7",
  "m7",
  "m7b5",
  "dim7",
  "sus2",
  "sus4",
  "add9",
  "6",
  "6/9",
  "9",
  "11",
  "13"
];

export const ChordPicker: React.FC<ChordPickerProps> = ({
  symbol,
  onSymbolChange,
  musicalKey,
  onKeyChange,
  onParse,
  parsing
}) => {
  const [root, setRoot] = React.useState("C");
  const [quality, setQuality] = React.useState("maj");

  const updateFromMenus = (r: string, q: string) => {
    setRoot(r);
    setQuality(q);
    onSymbolChange(`${r}${q === "maj" ? "" : q}`);
  };

  return (
    <div className="card chord-card" style={{ marginBottom: 16 }}>
      {onParse && (
        <button className="button parse-float" onClick={onParse} disabled={parsing}>
          解析和弦
        </button>
      )}
      <div className="row input-with-action">
        <label>和弦文本</label>
        <input
          className="input"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          placeholder="例如 Cmaj7#11/G"
          style={{ flex: 1 }}
        />
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <label>根音</label>
        <select
          className="input"
          value={root}
          onChange={(e) => updateFromMenus(e.target.value, quality)}
        >
          {ROOTS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <label>类型</label>
        <select
          className="input"
          value={quality}
          onChange={(e) => updateFromMenus(root, e.target.value)}
        >
          {QUALITIES.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
        {onKeyChange && (
          <>
            <label>调性</label>
            <select
              className="input"
              value={musicalKey}
              onChange={(e) => onKeyChange(e.target.value)}
            >
              <option value="">(无)</option>
              {ROOTS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
};

export default ChordPicker;

