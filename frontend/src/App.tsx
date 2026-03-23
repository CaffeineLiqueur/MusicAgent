import React, { useEffect, useState } from "react";
import PianoKeyboard from "./components/PianoKeyboard";
import { fetchChord } from "./lib/api";
import { ChordResponse } from "./lib/chordTypes";
import { playChord, playNote, InstrumentType, preloadInstruments, unlockAudio, isAudioUnlocked } from "./lib/player";
import HeaderBar from "./components/HeaderBar";
import ChordForm from "./components/ChordForm";
import ResultPanel from "./components/ResultPanel";
import Metronome from "./components/Metronome";
import { assetPath } from "./lib/basePath";

type PlayMode = "block" | "arp";
type ViewMode = "home" | "chord";

const defaultRange = { min: 36, max: 96 };

const App: React.FC = () => {
  const [view, setView] = React.useState<ViewMode>("home");
  const [symbol, setSymbol] = React.useState("Cmaj7");
  const [musicalKey, setMusicalKey] = React.useState<string>("");
  const [inversion, setInversion] = React.useState(0);
  const [octave, setOctave] = React.useState(4);
  const [transpose, setTranspose] = React.useState(0);
  const [playMode, setPlayMode] = React.useState<PlayMode>("block");
  const [instrument, setInstrument] = React.useState<InstrumentType>("piano");
  const [data, setData] = React.useState<ChordResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [history, setHistory] = React.useState<string[]>([]);
  const [isLandscape, setIsLandscape] = React.useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(orientation: landscape)").matches : false
  );
  const [preloading, setPreloading] = React.useState(true);
  const [audioEnabled, setAudioEnabled] = useState(() => isAudioUnlocked());

  React.useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const listener = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  // 预加载乐器采样
  useEffect(() => {
    const load = async () => {
      try {
        await preloadInstruments();
      } catch {
        // 忽略预加载错误，按需加载
      } finally {
        setPreloading(false);
      }
    };
    load();
  }, []);

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
      setHistory((prev) => {
        const next = [target, ...prev.filter((v) => v !== target)];
        return next.slice(0, 5);
      });
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
    await playChord(data.midi, mode, instrument);
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

  const handleEnableAudio = async () => {
    try {
      await unlockAudio();
      setAudioEnabled(true);
    } catch (e) {
      console.error("Failed to unlock audio:", e);
    }
  };

  if (view === "home") {
    return (
      <div className="home">
        <div className="home-content">
          <div className="home-brand">
            <img className="home-logo" src={assetPath("/icons/icon-gemini.png")} alt="SelahFlow" />
            <h1 className="home-title">SelahFlow</h1>
          </div>
          <div className="home-actions">
            {!audioEnabled && (
              <button className="button home-button" type="button" onClick={handleEnableAudio} style={{ marginBottom: "12px", background: "#10b981" }}>
                🔊 启用音频
              </button>
            )}
            <button className="button home-button" type="button" onClick={() => setView("chord")}>
              和弦查询
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLandscape) {
    return (
      <div className="orientation-block">
        <div className="orientation-card">
          <p className="eyebrow">温馨提示</p>
          <h2>请横屏使用</h2>
          <p className="muted">为获得完整的键盘与控制体验，请旋转设备到横屏。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <HeaderBar onBack={() => setView("home")} />
      <div className="layout column">
        <div className="card combo-card">
          <ChordForm
            symbol={symbol}
            musicalKey={musicalKey}
            inversion={inversion}
            octave={octave}
            transpose={transpose}
            loading={loading}
            onSymbolChange={setSymbol}
            onKeyChange={setMusicalKey}
            onInversionChange={setInversion}
            onOctaveChange={setOctave}
            onTransposeChange={setTranspose}
            onParse={() => doFetch()}
            onRandom={randomChord}
            advancedOpen={advancedOpen}
            onToggleAdvanced={() => setAdvancedOpen((v) => !v)}
            history={history}
          />

          {error && <div className="error-text">{error}</div>}

          <ResultPanel
            data={data}
            playMode={playMode}
            instrument={instrument}
            variant="plain"
            showHeader={false}
            onPlay={(mode) => {
              setPlayMode(mode);
              handlePlay(mode);
            }}
            onInstrumentChange={setInstrument}
          />

          {data ? (
            <div className="keyboard-shell scrollable">
              <PianoKeyboard highlightKeys={data.midi} range={range} onKeyPress={(m) => playNote(m, instrument)} />
            </div>
          ) : (
            <div className="empty">解析后将高亮对应音，左右滑动可查看更多键。</div>
          )}
          {preloading && (
            <div className="muted" style={{ textAlign: "center", padding: "8px" }}>
              正在预加载乐器采样...
            </div>
          )}
        </div>

        <Metronome />
      </div>
    </div>
  );
};

export default App;

