import React, { useState, useEffect, useRef, useCallback } from "react";
import { context, start } from "tone";

type MetronomeProps = {
  className?: string;
};

const Metronome: React.FC<MetronomeProps> = ({ className }) => {
  const [bpm, setBpm] = useState(80);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [volume, setVolume] = useState(-10);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // 确保音频上下文已启动
  const ensureAudio = useCallback(async () => {
    if (context.state !== "running") {
      await start();
    }
    if (!audioContextRef.current) {
      audioContextRef.current = context.rawContext;
    }
  }, []);

  // 播放节拍声音
  const playClick = useCallback(
    (time: number, isAccent: boolean) => {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isAccent ? "sine" : "triangle";
      osc.frequency.value = isAccent ? 1200 : 800;

      gain.gain.value = 0;
      const normalizedVol = Math.max(0, Math.min(1, (volume + 40) / 40));
      const targetVol = normalizedVol * (isAccent ? 0.5 : 0.3);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(targetVol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.1);
    },
    [volume]
  );

  // 调度下一个节拍
  const nextNote = useCallback(() => {
    const secondsPerBeat = 60 / bpm;
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasure;
  }, [bpm, beatsPerMeasure]);

  // 调度音符
  const scheduleNote = useCallback(
    (beatNumber: number, time: number) => {
      const isAccent = beatNumber === 0;
      playClick(time, isAccent);
      // 更新UI显示
      const delay = (time - context.currentTime) * 1000;
      setTimeout(() => {
        if (isPlayingRef.current) {
          setCurrentBeat(beatNumber);
        }
      }, Math.max(0, delay));
    },
    [playClick]
  );

  // 调度器
  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    while (nextNoteTimeRef.current < context.currentTime + 0.1) {
      scheduleNote(currentBeatRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(scheduler, 25);
  }, [nextNote, scheduleNote]);

  // 开始/停止
  const togglePlay = useCallback(async () => {
    await ensureAudio();
    if (isPlaying) {
      // 停止
      isPlayingRef.current = false;
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
        timerIDRef.current = null;
      }
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      // 开始
      isPlayingRef.current = true;
      currentBeatRef.current = 0;
      nextNoteTimeRef.current = context.currentTime + 0.1;
      setIsPlaying(true);
      scheduler();
    }
  }, [isPlaying, ensureAudio, scheduler]);

  // 清理
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerIDRef.current) {
        clearTimeout(timerIDRef.current);
      }
    };
  }, []);

  return (
    <div className={`card section ${className || ""}`}>
      <div className="section-head">
        <div>
          <p className="eyebrow">节拍器</p>
          <h3 style={{ margin: "4px 0", color: "#e2e8f0" }}>节奏控制</h3>
        </div>
        <button
          className="button"
          onClick={togglePlay}
          style={{
            background: isPlaying
              ? "linear-gradient(120deg, #dc2626 0%, #ea580c 100%)"
              : undefined
          }}
        >
          {isPlaying ? "停止" : "开始"}
        </button>
      </div>

      <div className="row" style={{ gap: "20px", flexWrap: "wrap" }}>
        {/* BPM 控制 */}
        <div className="field" style={{ flex: "1", minWidth: "180px" }}>
          <label style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0" }}>
            BPM: {bpm}
          </label>
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="input"
            style={{ padding: "6px 12px" }}
          />
        </div>

        {/* 拍子控制 */}
        <div className="field" style={{ minWidth: "120px" }}>
          <label style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0" }}>
            每小节拍数
          </label>
          <div className="chips">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className={`chip ${beatsPerMeasure === n ? "active" : ""}`}
                onClick={() => setBeatsPerMeasure(n)}
                type="button"
              >
                {n}/4
              </button>
            ))}
          </div>
        </div>

        {/* 音量控制 */}
        <div className="field" style={{ minWidth: "140px" }}>
          <label style={{ fontWeight: 600, fontSize: "14px", color: "#e2e8f0" }}>
            音量
          </label>
          <input
            type="range"
            min="-40"
            max="0"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="input"
            style={{ padding: "6px 12px" }}
          />
        </div>
      </div>

      {/* 节拍指示器 */}
      {isPlaying && (
        <div className="row" style={{ justifyContent: "center", gap: "8px", marginTop: "8px" }}>
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: currentBeat === i
                  ? (i === 0 ? "#f97373" : "#60a5fa")
                  : "#1e293b",
                transition: "background 0.1s ease",
                boxShadow: currentBeat === i
                  ? (i === 0 ? "0 0 16px rgba(248, 113, 113, 0.6)" : "0 0 16px rgba(96, 165, 250, 0.6)")
                  : "none"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Metronome;
