import { Sampler, context, now, start, PolySynth, Synth } from "tone";
import { assetPath } from "./basePath";

export type InstrumentType = "piano" | "guitar";
type PlayMode = "block" | "arp";

// 采样源类型
export type SampleSource = "official" | "self-hosted" | "custom";

// 采样源配置
const SAMPLE_SOURCES: Record<SampleSource, string> = {
  official: "https://tonejs.github.io/audio/salamander/",
  "self-hosted": "/samples/salamander/",
  custom: import.meta.env.VITE_PIANO_SAMPLES_URL || "",
};

// 当前使用的采样源 - 可以通过环境变量 VITE_PIANO_SAMPLE_SOURCE 配置
const CURRENT_SOURCE: SampleSource = (import.meta.env.VITE_PIANO_SAMPLE_SOURCE as SampleSource) || "official";

// 获取采样基础 URL
function getSampleBaseUrl(): string {
  const source = SAMPLE_SOURCES[CURRENT_SOURCE];
  if (CURRENT_SOURCE === "self-hosted") {
    return assetPath(source);
  }
  return source;
}

// 钢琴采样配置
const PIANO_CONFIG = {
  get baseUrl() {
    return getSampleBaseUrl();
  },
  samples: {
    A0: "A0.mp3",
    C1: "C1.mp3",
    "D#1": "Ds1.mp3",
    "F#1": "Fs1.mp3",
    A1: "A1.mp3",
    C2: "C2.mp3",
    "D#2": "Ds2.mp3",
    "F#2": "Fs2.mp3",
    A2: "A2.mp3",
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
    C5: "C5.mp3",
    "D#5": "Ds5.mp3",
    "F#5": "Fs5.mp3",
    A5: "A5.mp3",
    C6: "C6.mp3",
    "D#6": "Ds6.mp3",
    "F#6": "Fs6.mp3",
    A6: "A6.mp3",
    C7: "C7.mp3",
    "D#7": "Ds7.mp3",
    "F#7": "Fs7.mp3",
    A7: "A7.mp3",
    C8: "C8.mp3"
  }
};

// 获取当前采样源信息
export function getSampleSourceInfo(): { source: SampleSource; url: string } {
  return {
    source: CURRENT_SOURCE,
    url: getSampleBaseUrl(),
  };
}

// 乐器实例存储
type InstrumentInstance = Sampler | PolySynth;
const instruments: Partial<Record<InstrumentType, Promise<InstrumentInstance>>> = {};

function midiToNoteName(midi: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${names[pc]}${octave}`;
}

// 加载状态回调
type LoadingCallback = (loaded: number, total: number) => void;
let onLoadingUpdate: LoadingCallback | null = null;

// 设置加载状态回调
export function setSampleLoadingCallback(callback: LoadingCallback | null) {
  onLoadingUpdate = callback;
}

// 创建钢琴采样器
async function createPianoSampler(): Promise<Sampler> {
  return new Promise((resolve, reject) => {
    const samples = PIANO_CONFIG.samples;
    const sampleCount = Object.keys(samples).length;

    console.log(`Loading piano samples from: ${PIANO_CONFIG.baseUrl}`);

    const sampler = new Sampler({
      urls: samples,
      baseUrl: PIANO_CONFIG.baseUrl,
      release: 1.5,
      onload: () => {
        console.log("Piano samples loaded successfully");
        onLoadingUpdate?.(sampleCount, sampleCount);
        resolve(sampler);
      },
      onerror: (err) => {
        console.error("Failed to load piano samples:", err);
        reject(err);
      }
    }).toDestination();
  });
}

// 创建吉他合成器
function createGuitarSynth(): PolySynth {
  const guitar = new PolySynth(Synth, {
    polyphony: 6,
    volume: -8,
    options: {
      oscillator: {
        type: "triangle"
      },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.2,
        release: 1.5
      },
      filter: {
        type: "lowpass",
        Q: 2,
        rolloff: -12
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.3,
        release: 1.2,
        baseFrequency: 200,
        octaves: 3,
        exponent: 2
      }
    }
  }).toDestination();

  return guitar;
}

async function getInstrument(instrument: InstrumentType): Promise<InstrumentInstance> {
  if (!instruments[instrument]) {
    if (instrument === "piano") {
      instruments[instrument] = createPianoSampler();
    } else {
      instruments[instrument] = Promise.resolve(createGuitarSynth());
    }
  }
  return instruments[instrument]!;
}

async function ensureToneStarted() {
  if (context.state !== "running") {
    await start();
  }
}

export function isAudioUnlocked(): boolean {
  return context.state === "running";
}

export async function unlockAudio(): Promise<void> {
  await ensureToneStarted();
}

export async function playChord(
  midi: number[],
  mode: PlayMode = "block",
  instrument: InstrumentType = "piano",
  options?: { arpGap?: number }
): Promise<void> {
  if (!midi.length) return;
  await ensureToneStarted();
  const inst = await getInstrument(instrument);
  const t = now();
  const gap = options?.arpGap ?? (instrument === "guitar" ? 0.08 : 0.12);

  const notes = midi.map((m) => midiToNoteName(m));
  const duration = instrument === "guitar" ? 2.5 : 2;

  if (mode === "block") {
    if (inst instanceof Sampler) {
      notes.forEach((note) => {
        inst.triggerAttackRelease(note, duration, t);
      });
    } else {
      inst.triggerAttackRelease(notes, duration, t);
    }
  } else {
    // 分解模式，吉他稍微调整顺序让它听起来更像吉他扫弦
    const orderedNotes = instrument === "guitar" ? [...notes].reverse() : notes;
    orderedNotes.forEach((note, i) => {
      const ti = t + i * gap;
      if (inst instanceof Sampler) {
        inst.triggerAttackRelease(note, duration, ti);
      } else {
        inst.triggerAttackRelease(note, duration, ti);
      }
    });
  }
}

export async function playNote(
  midi: number,
  instrument: InstrumentType = "piano"
): Promise<void> {
  return playChord([midi], "block", instrument);
}

// 预加载所有乐器
export async function preloadInstruments(): Promise<void> {
  await ensureToneStarted();
  // 并行初始化所有乐器
  await Promise.allSettled([
    getInstrument("piano"),
    getInstrument("guitar")
  ]);
}
