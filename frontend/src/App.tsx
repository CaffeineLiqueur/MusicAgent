import React from "react";
import PianoKeyboard from "./components/PianoKeyboard";
import { fetchChord } from "./lib/api";
import { ChordResponse } from "./lib/chordTypes";
import { playChord, playNote } from "./lib/player";
import HeaderBar from "./components/HeaderBar";
import ChordForm from "./components/ChordForm";
import ResultPanel from "./components/ResultPanel";
import SampleCachePanel from "./components/SampleCachePanel";
import { clearSamples, downloadSamples } from "./lib/chordLocal";

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
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [history, setHistory] = React.useState<string[]>([]);
  const [isLandscape, setIsLandscape] = React.useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(orientation: landscape)").matches : false
  );
  const [cacheStatus, setCacheStatus] = React.useState("采样未下载，首次离线播放可能缺少部分音符");
  const [cacheBusy, setCacheBusy] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const listener = (e: MediaQueryListEvent) => setIsLandscape(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
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
      <HeaderBar />
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
            variant="plain"
            showHeader={false}
            onPlay={(mode) => {
              setPlayMode(mode);
              handlePlay(mode);
            }}
          />

          {data ? (
            <div className="keyboard-shell scrollable">
              <PianoKeyboard highlightKeys={data.midi} range={range} onKeyPress={(m) => playNote(m)} />
            </div>
          ) : (
            <div className="empty">解析后将高亮对应音，左右滑动可查看更多键。</div>
          )}
        </div>

        <SampleCachePanel
          busy={cacheBusy}
          status={cacheStatus}
          onDownload={async () => {
            setCacheBusy(true);
            try {
              await downloadSamples((done, total) => {
                setCacheStatus(`下载中 ${done}/${total} ...`);
              });
              setCacheStatus("采样已下载，离线可播放全音域（Salamander 子集）");
            } catch (err) {
              setCacheStatus(err instanceof Error ? err.message : "下载失败");
            } finally {
              setCacheBusy(false);
            }
          }}
          onClear={async () => {
            setCacheBusy(true);
            try {
              await clearSamples();
              setCacheStatus("已清理采样缓存");
            } catch (err) {
              setCacheStatus(err instanceof Error ? err.message : "清理失败");
            } finally {
              setCacheBusy(false);
            }
          }}
        />
      </div>
    </div>
  );
};

export default App;

