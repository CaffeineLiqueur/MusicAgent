import React from "react";
import ChordPicker from "./components/ChordPicker";
import PianoKeyboard from "./components/PianoKeyboard";
import { fetchChord } from "./lib/api";
import { ChordResponse } from "./lib/chordTypes";
import { playChord, playNote } from "./lib/player";

type PlayMode = "block" | "arp";

const defaultRange = { min: 36, max: 96 };

const App: React.FC = () => {
  const [symbol, setSymbol] = React.useState("Cmaj7");
  const [musicalKey, setMusicalKey] = React.useState<string>("");
  const [inversion, setInversion] = React.useState(0);
  const [octave, setOctave] = React.useState(4);
  const [transpose, setTranspose] = React.useState(0);
  const [playMode, setPlayMode] = React.useState<PlayMode>("block");
  const [data, setData] = React.useState<ChordResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const audioCtx = React.useRef<AudioContext | null>(null);

  const doFetch = async (overrideSymbol?: string) => {
    const target = (overrideSymbol ?? symbol).trim();
    if (!target) return;
    if (overrideSymbol) {
      setSymbol(target);
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchChord({
        symbol: target,
        key: musicalKey || undefined,
        inversion,
        octave,
        transpose,
        rangeMin: defaultRange.min,
        rangeMax: defaultRange.max
      });
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "请求失败");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = async (mode: PlayMode) => {
    if (!data) return;
    await playChord(data.midi, mode);
  };

  const range = data?.range ?? defaultRange;

  const randomChord = () => {
    const roots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const qualities = ["maj7", "7", "m7", "m7b5", "dim7", "sus2", "sus4", "add9", "6/9"];
    const r = roots[Math.floor(Math.random() * roots.length)];
    const q = qualities[Math.floor(Math.random() * qualities.length)];
    const sym = `${r}${q === "maj" ? "" : q}`;
    doFetch(sym);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">MusicAgent • 工作台</p>
          <h1>🎶 MUSICAGENT WORKBENCH</h1>
        </div>
      </header>

      <div className="panel">
        <div className="panel-header">
          <h2>和弦与调性</h2>
          <div className="actions">
            <button className="button" onClick={randomChord} disabled={loading}>
              随机和弦
            </button>
          </div>
        </div>

        <ChordPicker
          symbol={symbol}
          onSymbolChange={setSymbol}
          musicalKey={musicalKey}
          onKeyChange={setMusicalKey}
          onParse={() => doFetch()}
          parsing={loading}
        />

        <div className="control-grid">
          <div className="field">
            <label>转位</label>
            <input
              className="input"
              type="number"
              min={0}
              max={3}
              value={inversion}
              onChange={(e) => setInversion(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>基准八度</label>
            <input
              className="input"
              type="number"
              min={1}
              max={7}
              value={octave}
              onChange={(e) => setOctave(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>移调(半音)</label>
            <input
              className="input"
              type="number"
              value={transpose}
              onChange={(e) => setTranspose(Number(e.target.value))}
            />
          </div>
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>

      <div className="panel highlight keyboard-panel">
        <div className="panel-header" style={{ justifyContent: "space-between", alignItems: "center" }}>
          {data ? (
            <div className="pill-row tight">
              <span className="pill strong">和弦：{data.symbol}</span>
              {data.roman && <span className="pill strong">罗马：{data.roman}</span>}
              <span className="pill">音名：{data.tones.join(", ")}</span>
              <span className="pill">公式：{data.formula.join(" ")}</span>
            </div>
          ) : (
            <div />
          )}
          <div className="actions">
            <button
              className={`chip ${playMode === "block" ? "active" : ""}`}
              onClick={() => {
                setPlayMode("block");
                handlePlay("block");
              }}
              disabled={!data}
            >
              齐奏
            </button>
            <button
              className={`chip ${playMode === "arp" ? "active" : ""}`}
              onClick={() => {
                setPlayMode("arp");
                handlePlay("arp");
              }}
              disabled={!data}
            >
              分解
            </button>
          </div>
        </div>

        {data ? (
          <>
            <div className="keyboard-shell">
              <PianoKeyboard
                highlightKeys={data.midi}
                range={range}
                onKeyPress={(m) => playNote(m)}
              />
            </div>
          </>
        ) : (
          <div className="empty">
            <p>输入和弦并点击「解析和弦」，即可查看高亮与试听。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

