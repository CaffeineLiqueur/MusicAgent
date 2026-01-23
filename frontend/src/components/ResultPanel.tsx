import React from "react";
import { ChordResponse } from "../lib/chordTypes";

type PlayMode = "block" | "arp";

type ResultPanelProps = {
  data: ChordResponse | null;
  playMode: PlayMode;
  onPlay: (mode: PlayMode) => void;
  variant?: "card" | "plain";
  showHeader?: boolean;
};

const ResultPanel: React.FC<ResultPanelProps> = ({ data, playMode, onPlay, variant = "card", showHeader = true }) => {
  const Container: keyof JSX.IntrinsicElements = variant === "card" ? "section" : "div";
  const cls = variant === "card" ? "card section" : "section";

  return (
    <Container className={cls}>
      {data ? (
        <div className="result-row">
          <div className="pill-column">
            <div className="pill strong">和弦：{data.symbol}</div>
            {data.roman && <div className="pill strong">罗马：{data.roman}</div>}
            <div className="pill">音名：{data.tones.join(", ")}</div>
            <div className="pill">公式：{data.formula.join(" ")}</div>
          </div>
          <div className="row">
            <button className={`chip ${playMode === "block" ? "active" : ""}`} onClick={() => onPlay("block")} disabled={!data}>
              齐奏
            </button>
            <button className={`chip ${playMode === "arp" ? "active" : ""}`} onClick={() => onPlay("arp")} disabled={!data}>
              分解
            </button>
          </div>
        </div>
      ) : (
        <div className="empty">输入和弦并点击「解析和弦」，即可查看高亮与试听。</div>
      )}
    </Container>
  );
};

export default ResultPanel;
