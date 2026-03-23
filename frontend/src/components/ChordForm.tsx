import React, { useMemo } from "react";
import { ChordResponse } from "../lib/chordTypes";

type ChordFormProps = {
  symbol: string;
  musicalKey: string;
  inversion: number;
  octave: number;
  transpose: number;
  loading: boolean;
  onSymbolChange: (v: string) => void;
  onKeyChange: (v: string) => void;
  onInversionChange: (v: number) => void;
  onOctaveChange: (v: number) => void;
  onTransposeChange: (v: number) => void;
  onRandom: () => void;
  advancedOpen: boolean;
  onToggleAdvanced: () => void;
  history: string[];
};

const NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const ACCIDENTALS = ["", "#", "b"];
const QUALITIES = [
  { value: "", label: "大三" },
  { value: "m", label: "小三" },
  { value: "7", label: "属七" },
  { value: "maj7", label: "大七" },
  { value: "m7", label: "小七" },
  { value: "m7b5", label: "半减七" },
  { value: "dim7", label: "减七" },
  { value: "sus2", label: "挂二" },
  { value: "sus4", label: "挂四" },
  { value: "add9", label: "加九" },
  { value: "6/9", label: "六九" },
  { value: "6", label: "六" },
  { value: "m6", label: "小六" },
  { value: "maj9", label: "大九" },
  { value: "9", label: "属九" },
  { value: "m9", label: "小九" },
];

// 从和弦符号解析出根音、变音记号、和弦性质
const parseSymbol = (symbol: string) => {
  if (!symbol) return { note: "C", accidental: "", quality: "" };

  // 匹配根音（CDEFGAB）
  const noteMatch = symbol.match(/^[A-G]/);
  if (!noteMatch) return { note: "C", accidental: "", quality: "" };

  const note = noteMatch[0];
  const remaining = symbol.slice(note.length);

  // 匹配变音记号（#或b）
  let accidental = "";
  let qualityStart = 0;
  if (remaining.startsWith("#")) {
    accidental = "#";
    qualityStart = 1;
  } else if (remaining.startsWith("b")) {
    accidental = "b";
    qualityStart = 1;
  }

  const quality = remaining.slice(qualityStart);

  // 验证quality是否在我们的列表中
  const validQuality = QUALITIES.find(q => q.value === quality);
  return {
    note,
    accidental,
    quality: validQuality ? quality : ""
  };
};

const ChordForm: React.FC<ChordFormProps> = ({
  symbol,
  musicalKey,
  inversion,
  octave,
  transpose,
  loading,
  onSymbolChange,
  onKeyChange,
  onInversionChange,
  onOctaveChange,
  onTransposeChange,
  onRandom,
  advancedOpen,
  onToggleAdvanced,
  history
}) => {
  const parsed = useMemo(() => parseSymbol(symbol), [symbol]);

  const handlePickerChange = (note: string, accidental: string, quality: string) => {
    const newSymbol = note + accidental + quality;
    onSymbolChange(newSymbol);
  };

  return (
    <section className="section">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="chips">
          {history.length > 0 && (
            <>
              {history.map((item) => (
                <button key={item} className="chip" onClick={() => onSymbolChange(item)} disabled={loading}>
                  {item}
                </button>
              ))}
            </>
          )}
        </div>
        <div className="row">
          <button className="button ghost" onClick={onRandom} disabled={loading}>
            随机和弦
          </button>
        </div>
      </div>

      {/* 和弦选择器 */}
      <div className="chord-picker">
        <label className="picker-label">快速选择和弦</label>
        <div className="picker-row">
          <select
            className="picker-select"
            value={parsed.note}
            onChange={(e) => handlePickerChange(e.target.value, parsed.accidental, parsed.quality)}
          >
            {NOTES.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select
            className="picker-select"
            value={parsed.accidental}
            onChange={(e) => handlePickerChange(parsed.note, e.target.value, parsed.quality)}
          >
            <option value="">原调</option>
            <option value="#"># (升)</option>
            <option value="b">b (降)</option>
          </select>
          <select
            className="picker-select quality-select"
            value={parsed.quality}
            onChange={(e) => handlePickerChange(parsed.note, parsed.accidental, e.target.value)}
          >
            {QUALITIES.map(q => (
              <option key={q.value} value={q.value}>{q.label}{q.value ? ` (${q.value})` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>和弦符号</label>
          <input
            className="input"
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            placeholder="如 Cmaj7 / G7 / Fm7b5"
          />
        </div>
        <div className="field">
          <label>调性（可选）</label>
          <input
            className="input"
            value={musicalKey}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="如 C / G / F#"
          />
        </div>
      </div>

      <button className="link-button" onClick={onToggleAdvanced}>
        {advancedOpen ? "收起高级参数" : "展开高级参数"}
      </button>
      {advancedOpen && (
        <div className="form-grid compact">
          <NumberField label="转位" value={inversion} onChange={onInversionChange} min={0} max={3} />
          <NumberField label="基准八度" value={octave} onChange={onOctaveChange} min={1} max={7} />
          <NumberField label="移调(半音)" value={transpose} onChange={onTransposeChange} />
        </div>
      )}

    </section>
  );
};

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, min, max }) => (
  <div className="field">
    <label>{label}</label>
    <input
      className="input"
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

export default ChordForm;
