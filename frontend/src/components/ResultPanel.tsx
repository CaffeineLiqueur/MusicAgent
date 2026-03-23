import React from "react";
import { ChordResponse } from "../lib/chordTypes";
import { InstrumentType } from "../lib/player";

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

const ResultPanel: React.FC<ResultPanelProps> = ({
  data,
  playMode,
  instrument,
  onPlay,
  onInstrumentChange,
  variant = "card",
  showHeader = true
}) => {
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
            <div className="chips">
              <span style={{ fontWeight: 600, fontSize: "14px", padding: "8px 0" }}>乐器：</span>
              <button
                className={`chip ${instrument === "piano" ? "active" : ""}`}
                onClick={() => onInstrumentChange("piano")}
                type="button"
              >
                🎹 钢琴
              </button>
              <button
                className={`chip ${instrument === "guitar" ? "active" : ""}`}
                onClick={() => onInstrumentChange("guitar")}
                type="button"
              >
                🎸 吉他
              </button>
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
