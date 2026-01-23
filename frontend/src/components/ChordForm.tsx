import React from "react";
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
  onParse: () => void;
  onRandom: () => void;
  advancedOpen: boolean;
  onToggleAdvanced: () => void;
  history: string[];
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
  onParse,
  onRandom,
  advancedOpen,
  onToggleAdvanced,
  history
}) => {
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
          <button className="button" onClick={onParse} disabled={loading || !symbol.trim()}>
            {loading ? "解析中..." : "解析和弦"}
          </button>
          <button className="button ghost" onClick={onRandom} disabled={loading}>
            随机和弦
          </button>
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
