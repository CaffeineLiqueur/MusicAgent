import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PRESET_PROGRESSIONS,
  ChordProgression as ProgressionType,
  KEYS,
  MINOR_KEYS,
  transposeProgression
} from "../lib/chordProgressions";
import { computeChordLocal } from "../lib/chordLocal";
import {
  playChord,
  InstrumentType,
  unlockAudio,
  isAudioUnlocked,
  ProgressionPlayer
} from "../lib/player";
import PianoKeyboard from "./PianoKeyboard";

type PlayMode = "block" | "arp";

const ChordProgression: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("pop-1");
  const [currentProgression, setCurrentProgression] = useState<ProgressionType>(
    PRESET_PROGRESSIONS.find(p => p.id === "pop-1")!
  );
  const [customChords, setCustomChords] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [currentKey, setCurrentKey] = useState<string>("C");
  const [bpm, setBpm] = useState(100);
  const [beatsPerChord, setBeatsPerChord] = useState(4);
  const [playMode, setPlayMode] = useState<PlayMode>("block");
  const [instrument, setInstrument] = useState<InstrumentType>("piano");
  const [loop, setLoop] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [audioEnabled, setAudioEnabled] = useState(() => isAudioUnlocked());
  const [parsedChords, setParsedChords] = useState<number[][]>([]);
  const [showPresets, setShowPresets] = useState(true);

  const playerRef = useRef<ProgressionPlayer | null>(null);

  // 初始化播放器
  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = new ProgressionPlayer({
        bpm,
        beatsPerChord,
        playMode,
        instrument,
        loop
      });
      playerRef.current.setOnChordChange((index) => {
        setCurrentChordIndex(index);
      });
      playerRef.current.setOnStop(() => {
        setIsPlaying(false);
        setCurrentChordIndex(-1);
      });
    }
    return () => {
      playerRef.current?.stop();
    };
  }, []);

  // 更新播放器配置
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setConfig({ bpm, beatsPerChord, playMode, instrument, loop });
    }
  }, [bpm, beatsPerChord, playMode, instrument, loop]);

  // 解析和弦
  useEffect(() => {
    const chords = isCustomMode ? customChords : currentProgression.chords;
    try {
      const parsed = chords.map(chord => {
        try {
          const result = computeChordLocal({ symbol: chord, octave: 4 });
          return result.midi;
        } catch {
          return [];
        }
      });
      setParsedChords(parsed);
    } catch {
      setParsedChords([]);
    }
  }, [isCustomMode, customChords, currentProgression]);

  // 选择预设
  const handleSelectPreset = (preset: ProgressionType) => {
    setSelectedPresetId(preset.id);
    const transposed = transposeProgression(preset, currentKey);
    setCurrentProgression(transposed);
    setIsCustomMode(false);
  };

  // 移调
  const handleKeyChange = (newKey: string) => {
    setCurrentKey(newKey);
    const original = PRESET_PROGRESSIONS.find(p => p.id === selectedPresetId);
    if (original) {
      const transposed = transposeProgression(original, newKey);
      setCurrentProgression(transposed);
    }
  };

  // 播放单个和弦
  const handlePlayChord = async (index: number) => {
    if (!audioEnabled) {
      try {
        await unlockAudio();
        setAudioEnabled(true);
      } catch (e) {
        console.error("Failed to unlock audio:", e);
        return;
      }
    }
    if (parsedChords[index] && parsedChords[index].length > 0) {
      await playChord(parsedChords[index], playMode, instrument);
    }
  };

  // 播放/暂停进行
  const handlePlayProgression = async () => {
    if (!audioEnabled) {
      try {
        await unlockAudio();
        setAudioEnabled(true);
      } catch (e) {
        console.error("Failed to unlock audio:", e);
        return;
      }
    }

    if (isPlaying) {
      playerRef.current?.stop();
    } else {
      setIsPlaying(true);
      playerRef.current?.play(parsedChords, 0);
    }
  };

  // 监听播放状态
  useEffect(() => {
    if (playerRef.current) {
      setIsPlaying(playerRef.current.getIsPlaying());
    }
  }, [isPlaying]);

  // 添加自定义和弦
  const handleAddChord = () => {
    setCustomChords([...customChords, "C"]);
  };

  // 更新自定义和弦
  const handleUpdateChord = (index: number, value: string) => {
    const newChords = [...customChords];
    newChords[index] = value;
    setCustomChords(newChords);
  };

  // 删除自定义和弦
  const handleRemoveChord = (index: number) => {
    setCustomChords(customChords.filter((_, i) => i !== index));
  };

  // 切换到自定义模式
  const handleSwitchToCustom = () => {
    if (!isCustomMode) {
      setCustomChords([...currentProgression.chords]);
    }
    setIsCustomMode(true);
  };

  const activeChords = isCustomMode ? customChords : currentProgression.chords;
  const currentHighlight = currentChordIndex >= 0 ? parsedChords[currentChordIndex] || [] : [];

  return (
    <div className="page">
      <div className="header-bar">
        <div className="header-brand">
          <button className="button ghost" onClick={onBack} style={{ padding: "8px 12px" }}>
            ← 返回
          </button>
          <h1 className="header-title">和弦进行</h1>
        </div>
      </div>

      <div className="layout column">
        {/* 预设选择 */}
        <div className="card">
          <div className="section-head" style={{ marginBottom: "12px" }}>
            <h2 className="title" style={{ fontSize: "18px", margin: 0 }}>
              预设和声进行
            </h2>
            <button
              className="button ghost"
              onClick={() => setShowPresets(!showPresets)}
              style={{ fontSize: "14px", padding: "6px 10px", minHeight: "auto" }}
            >
              {showPresets ? "收起" : "展开"}
            </button>
          </div>

          {showPresets && (
            <div className="chips" style={{ marginBottom: "12px" }}>
              {PRESET_PROGRESSIONS.map(preset => (
                <button
                  key={preset.id}
                  className={`chip ${selectedPresetId === preset.id && !isCustomMode ? "active" : ""}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
              <button
                className={`chip ${isCustomMode ? "active" : ""}`}
                onClick={handleSwitchToCustom}
              >
                + 自定义
              </button>
            </div>
          )}

          {!isCustomMode && (
            <div className="row" style={{ gap: "12px", alignItems: "flex-end" }}>
              <div className="field" style={{ flex: 1, margin: 0 }}>
                <label>移调</label>
                <select
                  className="picker-select"
                  value={currentKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                >
                  <optgroup label="大调">
                    {KEYS.map(k => (
                      <option key={k} value={k}>{k} 大调</option>
                    ))}
                  </optgroup>
                  <optgroup label="小调">
                    {MINOR_KEYS.map(k => (
                      <option key={k} value={k}>{k} 小调</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="muted" style={{ flex: 2, fontSize: "13px" }}>
                {currentProgression.description}
              </div>
            </div>
          )}
        </div>

        {/* 和弦列表 */}
        <div className="card">
          <div className="section-head" style={{ marginBottom: "12px" }}>
            <h2 className="title" style={{ fontSize: "18px", margin: 0 }}>
              和弦序列
            </h2>
            {isCustomMode && (
              <button className="button ghost" onClick={handleAddChord}>
                + 添加和弦
              </button>
            )}
          </div>

          <div className="chips" style={{ marginBottom: "12px" }}>
            {activeChords.map((chord, index) => (
              <div
                key={index}
                className={`chip ${currentChordIndex === index ? "active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: isCustomMode ? "6px 10px" : "8px 16px",
                  cursor: "pointer"
                }}
                onClick={() => handlePlayChord(index)}
              >
                <span style={{ opacity: 0.7, fontSize: "12px" }}>{index + 1}</span>
                {isCustomMode ? (
                  <input
                    value={chord}
                    onChange={(e) => handleUpdateChord(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "inherit",
                      fontSize: "16px",
                      fontWeight: "bold",
                      width: "80px",
                      outline: "none"
                    }}
                    placeholder="Cmaj7"
                  />
                ) : (
                  <span style={{ fontWeight: "bold", fontSize: "16px" }}>{chord}</span>
                )}
                {isCustomMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChord(index);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f97373",
                      cursor: "pointer",
                      padding: "0 4px"
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 播放控制 */}
        <div className="card">
          <div className="section-head" style={{ marginBottom: "12px" }}>
            <h2 className="title" style={{ fontSize: "18px", margin: 0 }}>播放控制</h2>
          </div>

          <div className="form-grid compact" style={{ marginBottom: "12px" }}>
            <div className="field">
              <label>速度 (BPM)</label>
              <input
                className="input"
                type="number"
                value={bpm}
                onChange={(e) => setBpm(Math.max(40, Math.min(240, Number(e.target.value))))}
                min={40}
                max={240}
              />
            </div>
            <div className="field">
              <label>每和弦拍数</label>
              <input
                className="input"
                type="number"
                value={beatsPerChord}
                onChange={(e) => setBeatsPerChord(Math.max(1, Math.min(8, Number(e.target.value))))}
                min={1}
                max={8}
              />
            </div>
            <div className="field">
              <label>演奏方式</label>
              <select
                className="picker-select"
                value={playMode}
                onChange={(e) => setPlayMode(e.target.value as PlayMode)}
              >
                <option value="block">柱式</option>
                <option value="arp">分解</option>
              </select>
            </div>
            <div className="field">
              <label>乐器</label>
              <select
                className="picker-select"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value as InstrumentType)}
              >
                <option value="piano">钢琴</option>
                <option value="guitar">吉他</option>
              </select>
            </div>
          </div>

          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
              />
              循环播放
            </label>
            <button
              className="button"
              onClick={handlePlayProgression}
              style={{
                background: isPlaying
                  ? "linear-gradient(120deg, #7c3aed 0%, #a855f7 55%, #c084fc 100%)"
                  : undefined
              }}
            >
              {isPlaying ? "⏸ 暂停" : "▶ 播放"}
            </button>
          </div>
        </div>

        {/* 钢琴键盘预览 */}
        <div className="card">
          <div className="keyboard-shell">
            {currentHighlight.length > 0 ? (
              <PianoKeyboard
                highlightKeys={currentHighlight}
                range={{ min: 36, max: 96 }}
                onKeyPress={() => {}}
              />
            ) : (
              <div className="empty">播放时将高亮当前和弦</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordProgression;
