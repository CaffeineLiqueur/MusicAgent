import React, { useState } from "react";
import { ChordResponse } from "../lib/chordTypes";
import { InstrumentType, INSTRUMENT_NAMES } from "../lib/player";

type PlayMode = "block" | "arp";

type ResultPanelProps = {
  data: ChordResponse | null;
  playMode: PlayMode;
  instrument: InstrumentType;
  onPlay: (mode: PlayMode) => void;
  onInstrumentChange: (inst: InstrumentType) => void;
  variant?: "card" | "plain";
  showHeader?: boolean;
};

// 乐器分组
const INSTRUMENT_GROUPS: { name: string; instruments: InstrumentType[] }[] = [
  {
    name: "键盘/弹拨",
    instruments: ["piano", "organ", "harmonium", "harp", "xylophone"]
  },
  {
    name: "吉他",
    instruments: ["guitar-acoustic", "guitar-electric", "guitar-nylon"]
  },
  {
    name: "弦乐",
    instruments: ["violin", "cello", "contrabass"]
  },
  {
    name: "木管",
    instruments: ["flute", "clarinet", "bassoon", "saxophone"]
  },
  {
    name: "铜管",
    instruments: ["trumpet", "trombone", "tuba", "french-horn"]
  },
  {
    name: "低音",
    instruments: ["bass-electric"]
  }
];

const ResultPanel: React.FC<ResultPanelProps> = ({
  data,
  playMode,
  instrument,
  onPlay,
  onInstrumentChange,
  variant = "card",
  showHeader = true
}) => {
  const [showInstruments, setShowInstruments] = useState(false);
  const Container: keyof JSX.IntrinsicElements = variant === "card" ? "section" : "div";
  const cls = variant === "card" ? "card section" : "section";

  return (
    <Container className={cls}>
      {data ? (
        <>
          <div className="result-row">
            <div className="pill-column">
              <div className="pill strong">和弦：{data.symbol}</div>
              {data.roman && <div className="pill strong">罗马：{data.roman}</div>}
              <div className="pill">音名：{data.tones.join(", ")}</div>
              <div className="pill">公式：{data.formula.join(" ")}</div>
            </div>
          </div>
          <div className="row" style={{ marginTop: "12px", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div className="row" style={{ alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>乐器：</span>
                <span style={{ fontSize: "14px", fontWeight: 500 }}>{INSTRUMENT_NAMES[instrument]}</span>
                <button
                  className="button ghost"
                  onClick={() => setShowInstruments(!showInstruments)}
                  style={{ fontSize: "12px", padding: "4px 8px", minHeight: "auto" }}
                  type="button"
                >
                  {showInstruments ? "收起" : "选择"}
                </button>
              </div>
              {showInstruments && (
                <div style={{ marginBottom: "12px" }}>
                  {INSTRUMENT_GROUPS.map((group) => (
                    <div key={group.name} style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, opacity: 0.7, marginBottom: "4px" }}>
                        {group.name}
                      </div>
                      <div className="chips" style={{ flexWrap: "wrap" }}>
                        {group.instruments.map((inst) => (
                          <button
                            key={inst}
                            className={`chip ${instrument === inst ? "active" : ""}`}
                            onClick={() => {
                              onInstrumentChange(inst);
                              setShowInstruments(false);
                            }}
                            type="button"
                            style={{ fontSize: "12px", padding: "4px 10px" }}
                          >
                            {INSTRUMENT_NAMES[inst]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="chips">
              <span style={{ fontWeight: 600, fontSize: "14px", padding: "8px 0" }}>播放：</span>
              <button
                className={`chip ${playMode === "block" ? "active" : ""}`}
                onClick={() => onPlay("block")}
                disabled={!data}
                type="button"
              >
                齐奏
              </button>
              <button
                className={`chip ${playMode === "arp" ? "active" : ""}`}
                onClick={() => onPlay("arp")}
                disabled={!data}
                type="button"
              >
                分解
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty">输入和弦并点击「解析和弦」，即可查看高亮与试听。</div>
      )}
    </Container>
  );
};

export default ResultPanel;
