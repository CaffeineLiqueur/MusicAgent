import { Sampler, context, now, start, PolySynth, Synth } from "tone";
import { assetPath } from "./basePath";

export type InstrumentType =
  | "piano"
  | "guitar-acoustic"
  | "guitar-electric"
  | "guitar-nylon"
  | "bass-electric"
  | "cello"
  | "violin"
  | "contrabass"
  | "harp"
  | "xylophone"
  | "organ"
  | "harmonium"
  | "flute"
  | "clarinet"
  | "bassoon"
  | "saxophone"
  | "trumpet"
  | "trombone"
  | "tuba"
  | "french-horn";

type PlayMode = "block" | "arp";

// 乐器显示名称
export const INSTRUMENT_NAMES: Record<InstrumentType, string> = {
  "piano": "钢琴",
  "guitar-acoustic": "原声吉他",
  "guitar-electric": "电吉他",
  "guitar-nylon": "尼龙吉他",
  "bass-electric": "电贝斯",
  "cello": "大提琴",
  "violin": "小提琴",
  "contrabass": "低音提琴",
  "harp": "竖琴",
  "xylophone": "木琴",
  "organ": "管风琴",
  "harmonium": "风琴",
  "flute": "长笛",
  "clarinet": "单簧管",
  "bassoon": "巴松管",
  "saxophone": "萨克斯",
  "trumpet": "小号",
  "trombone": "长号",
  "tuba": "大号",
  "french-horn": "圆号"
};

// Tone.js 乐器采样配置 - 来自 tonejs-instruments
const INSTRUMENT_SAMPLES: Record<InstrumentType, Record<string, string>> = {
  "bass-electric": {
    "A#1": "As1.mp3",
    "A#2": "As2.mp3",
    "A#3": "As3.mp3",
    "A#4": "As4.mp3",
    "C#1": "Cs1.mp3",
    "C#2": "Cs2.mp3",
    "C#3": "Cs3.mp3",
    "C#4": "Cs4.mp3",
    "E1": "E1.mp3",
    "E2": "E2.mp3",
    "E3": "E3.mp3",
    "E4": "E4.mp3",
    "G1": "G1.mp3",
    "G2": "G2.mp3",
    "G3": "G3.mp3",
    "G4": "G4.mp3"
  },
  "bassoon": {
    "A4": "A4.mp3",
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "E4": "E4.mp3",
    "G2": "G2.mp3",
    "G3": "G3.mp3",
    "G4": "G4.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3"
  },
  "cello": {
    "E3": "E3.mp3",
    "E4": "E4.mp3",
    "F2": "F2.mp3",
    "F3": "F3.mp3",
    "F4": "F4.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
    "G2": "G2.mp3",
    "G3": "G3.mp3",
    "G4": "G4.mp3",
    "G#2": "Gs2.mp3",
    "G#3": "Gs3.mp3",
    "G#4": "Gs4.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A#2": "As2.mp3",
    "A#3": "As3.mp3",
    "B2": "B2.mp3",
    "B3": "B3.mp3",
    "B4": "B4.mp3",
    "C2": "C2.mp3",
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C#3": "Cs3.mp3",
    "C#4": "Cs4.mp3",
    "D2": "D2.mp3",
    "D3": "D3.mp3",
    "D4": "D4.mp3",
    "D#2": "Ds2.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "E2": "E2.mp3"
  },
  "clarinet": {
    "D4": "D4.mp3",
    "D5": "D5.mp3",
    "D6": "D6.mp3",
    "F3": "F3.mp3",
    "F4": "F4.mp3",
    "F5": "F5.mp3",
    "F#6": "Fs6.mp3",
    "A#3": "As3.mp3",
    "A#4": "As4.mp3",
    "A#5": "As5.mp3",
    "D3": "D3.mp3"
  },
  "contrabass": {
    "C2": "C2.mp3",
    "C#3": "Cs3.mp3",
    "D2": "D2.mp3",
    "E2": "E2.mp3",
    "E3": "E3.mp3",
    "F#1": "Fs1.mp3",
    "F#2": "Fs2.mp3",
    "G1": "G1.mp3",
    "G#2": "Gs2.mp3",
    "G#3": "Gs3.mp3",
    "A2": "A2.mp3",
    "A#1": "As1.mp3",
    "B3": "B3.mp3"
  },
  "flute": {
    "A6": "A6.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C6": "C6.mp3",
    "C7": "C7.mp3",
    "E4": "E4.mp3",
    "E5": "E5.mp3",
    "E6": "E6.mp3",
    "A4": "A4.mp3",
    "A5": "A5.mp3"
  },
  "french-horn": {
    "D3": "D3.mp3",
    "D5": "D5.mp3",
    "D#2": "Ds2.mp3",
    "F3": "F3.mp3",
    "F5": "F5.mp3",
    "G2": "G2.mp3",
    "A1": "A1.mp3",
    "A3": "A3.mp3",
    "C2": "C2.mp3",
    "C4": "C4.mp3"
  },
  "guitar-acoustic": {
    "F4": "F4.mp3",
    "F#2": "Fs2.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
    "G2": "G2.mp3",
    "G3": "G3.mp3",
    "G4": "G4.mp3",
    "G#2": "Gs2.mp3",
    "G#3": "Gs3.mp3",
    "G#4": "Gs4.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A#2": "As2.mp3",
    "A#3": "As3.mp3",
    "A#4": "As4.mp3",
    "B2": "B2.mp3",
    "B3": "B3.mp3",
    "B4": "B4.mp3",
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C#3": "Cs3.mp3",
    "C#4": "Cs4.mp3",
    "C#5": "Cs5.mp3",
    "D2": "D2.mp3",
    "D3": "D3.mp3",
    "D4": "D4.mp3",
    "D5": "D5.mp3",
    "D#2": "Ds2.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "E2": "E2.mp3",
    "E3": "E3.mp3",
    "E4": "E4.mp3",
    "F2": "F2.mp3",
    "F3": "F3.mp3"
  },
  "guitar-electric": {
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "D#5": "Ds5.mp3",
    "E2": "E2.mp3",
    "F#2": "Fs2.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
    "F#5": "Fs5.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A5": "A5.mp3",
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C6": "C6.mp3",
    "C#2": "Cs2.mp3"
  },
  "guitar-nylon": {
    "F#2": "Fs2.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
    "F#5": "Fs5.mp3",
    "G3": "G3.mp3",
    "G#2": "Gs2.mp3",
    "G#4": "Gs4.mp3",
    "G#5": "Gs5.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A5": "A5.mp3",
    "A#5": "As5.mp3",
    "B1": "B1.mp3",
    "B2": "B2.mp3",
    "B3": "B3.mp3",
    "B4": "B4.mp3",
    "C#3": "Cs3.mp3",
    "C#4": "Cs4.mp3",
    "C#5": "Cs5.mp3",
    "D2": "D2.mp3",
    "D3": "D3.mp3",
    "D5": "D5.mp3",
    "D#4": "Ds4.mp3",
    "E2": "E2.mp3",
    "E3": "E3.mp3",
    "E4": "E4.mp3",
    "E5": "E5.mp3"
  },
  "harmonium": {
    "C2": "C2.mp3",
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C#2": "Cs2.mp3",
    "C#3": "Cs3.mp3",
    "C#4": "Cs4.mp3",
    "C#5": "Cs5.mp3",
    "D2": "D2.mp3",
    "D3": "D3.mp3",
    "D4": "D4.mp3",
    "D5": "D5.mp3",
    "D#2": "Ds2.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "E2": "E2.mp3",
    "E3": "E3.mp3",
    "E4": "E4.mp3",
    "F2": "F2.mp3",
    "F3": "F3.mp3",
    "F4": "F4.mp3",
    "F#2": "Fs2.mp3",
    "F#3": "Fs3.mp3",
    "G2": "G2.mp3",
    "G3": "G3.mp3",
    "G4": "G4.mp3",
    "G#2": "Gs2.mp3",
    "G#3": "Gs3.mp3",
    "G#4": "Gs4.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A#2": "As2.mp3",
    "A#3": "As3.mp3",
    "A#4": "As4.mp3"
  },
  "harp": {
    "C5": "C5.mp3",
    "D2": "D2.mp3",
    "D4": "D4.mp3",
    "D6": "D6.mp3",
    "D7": "D7.mp3",
    "E1": "E1.mp3",
    "E3": "E3.mp3",
    "E5": "E5.mp3",
    "F2": "F2.mp3",
    "F4": "F4.mp3",
    "F6": "F6.mp3",
    "F7": "F7.mp3",
    "G1": "G1.mp3",
    "G3": "G3.mp3",
    "G5": "G5.mp3",
    "A2": "A2.mp3",
    "A4": "A4.mp3",
    "A6": "A6.mp3",
    "B1": "B1.mp3",
    "B3": "B3.mp3",
    "B5": "B5.mp3",
    "B6": "B6.mp3",
    "C3": "C3.mp3"
  },
  "organ": {
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C6": "C6.mp3",
    "D#1": "Ds1.mp3",
    "D#2": "Ds2.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "D#5": "Ds5.mp3",
    "F#1": "Fs1.mp3",
    "F#2": "Fs2.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
    "F#5": "Fs5.mp3",
    "A1": "A1.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A5": "A5.mp3",
    "C1": "C1.mp3",
    "C2": "C2.mp3"
  },
  "piano": {
    "A7": "A7.mp3",
    "A1": "A1.mp3",
    "A2": "A2.mp3",
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A5": "A5.mp3",
    "A6": "A6.mp3",
    "A#7": "As7.mp3",
    "A#1": "As1.mp3",
    "A#2": "As2.mp3",
    "A#3": "As3.mp3",
    "A#4": "As4.mp3",
    "A#5": "As5.mp3",
    "A#6": "As6.mp3",
    "B7": "B7.mp3",
    "B1": "B1.mp3",
    "B2": "B2.mp3",
    "B3": "B3.mp3",
    "B4": "B4.mp3",
    "B5": "B5.mp3",
    "B6": "B6.mp3",
    "C7": "C7.mp3",
    "C1": "C1.mp3",
    "C2": "C2.mp3",
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C6": "C6.mp3",
    "C#7": "Cs7.mp3",
    "C#1": "Cs1.mp3",
    "C#2": "Cs2.mp3",
    "C#3": "Cs3.mp3",
    "C#4": "Cs4.mp3",
    "C#5": "Cs5.mp3",
    "C#6": "Cs6.mp3",
    "D7": "D7.mp3",
    "D1": "D1.mp3",
    "D2": "D2.mp3",
    "D3": "D3.mp3",
    "D4": "D4.mp3",
    "D5": "D5.mp3",
    "D6": "D6.mp3",
    "D#7": "Ds7.mp3",
    "D#1": "Ds1.mp3",
    "D#2": "Ds2.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "D#5": "Ds5.mp3",
    "D#6": "Ds6.mp3",
    "E7": "E7.mp3",
    "E1": "E1.mp3",
    "E2": "E2.mp3",
    "E3": "E3.mp3",
    "E4": "E4.mp3",
    "E5": "E5.mp3",
    "E6": "E6.mp3",
    "F7": "F7.mp3",
    "F1": "F1.mp3",
    "F2": "F2.mp3",
    "F3": "F3.mp3",
    "F4": "F4.mp3",
    "F5": "F5.mp3",
    "F6": "F6.mp3",
    "F#7": "Fs7.mp3",
    "F#1": "Fs1.mp3",
    "F#2": "Fs2.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
    "F#5": "Fs5.mp3",
    "F#6": "Fs6.mp3",
    "G7": "G7.mp3",
    "G1": "G1.mp3",
    "G2": "G2.mp3",
    "G3": "G3.mp3",
    "G4": "G4.mp3",
    "G5": "G5.mp3",
    "G6": "G6.mp3",
    "G#7": "Gs7.mp3",
    "G#1": "Gs1.mp3",
    "G#2": "Gs2.mp3",
    "G#3": "Gs3.mp3",
    "G#4": "Gs4.mp3",
    "G#5": "Gs5.mp3",
    "G#6": "Gs6.mp3"
  },
  "saxophone": {
    "D#5": "Ds5.mp3",
    "E3": "E3.mp3",
    "E4": "E4.mp3",
    "E5": "E5.mp3",
    "F3": "F3.mp3",
    "F4": "F4.mp3",
    "F5": "F5.mp3",
    "F#3": "Fs3.mp3",
    "F#4": "Fs4.mp3",
    "F#5": "Fs5.mp3",
    "G3": "G3.mp3",
    "G4": "G4.mp3",
    "G5": "G5.mp3",
    "G#3": "Gs3.mp3",
    "G#4": "Gs4.mp3",
    "G#5": "Gs5.mp3",
    "A4": "A4.mp3",
    "A5": "A5.mp3",
    "A#3": "As3.mp3",
    "A#4": "As4.mp3",
    "B3": "B3.mp3",
    "B4": "B4.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C#3": "Cs3.mp3",
    "C#4": "Cs4.mp3",
    "C#5": "Cs5.mp3",
    "D3": "D3.mp3",
    "D4": "D4.mp3",
    "D5": "D5.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3"
  },
  "trombone": {
    "A#3": "As3.mp3",
    "C3": "C3.mp3",
    "C4": "C4.mp3",
    "C#2": "Cs2.mp3",
    "C#4": "Cs4.mp3",
    "D3": "D3.mp3",
    "D4": "D4.mp3",
    "D#2": "Ds2.mp3",
    "D#3": "Ds3.mp3",
    "D#4": "Ds4.mp3",
    "F2": "F2.mp3",
    "F3": "F3.mp3",
    "F4": "F4.mp3",
    "G#2": "Gs2.mp3",
    "G#3": "Gs3.mp3",
    "A#1": "As1.mp3",
    "A#2": "As2.mp3"
  },
  "trumpet": {
    "C6": "C6.mp3",
    "D5": "D5.mp3",
    "D#4": "Ds4.mp3",
    "F3": "F3.mp3",
    "F4": "F4.mp3",
    "F5": "F5.mp3",
    "G4": "G4.mp3",
    "A3": "A3.mp3",
    "A5": "A5.mp3",
    "A#4": "As4.mp3",
    "C4": "C4.mp3"
  },
  "tuba": {
    "A#2": "As2.mp3",
    "A#3": "As3.mp3",
    "D3": "D3.mp3",
    "D4": "D4.mp3",
    "D#2": "Ds2.mp3",
    "F1": "F1.mp3",
    "F2": "F2.mp3",
    "F3": "F3.mp3",
    "A#1": "As1.mp3"
  },
  "violin": {
    "A3": "A3.mp3",
    "A4": "A4.mp3",
    "A5": "A5.mp3",
    "A6": "A6.mp3",
    "C4": "C4.mp3",
    "C5": "C5.mp3",
    "C6": "C6.mp3",
    "C7": "C7.mp3",
    "E4": "E4.mp3",
    "E5": "E5.mp3",
    "E6": "E6.mp3",
    "G4": "G4.mp3",
    "G5": "G5.mp3",
    "G6": "G6.mp3"
  },
  "xylophone": {
    "C8": "C8.mp3",
    "G4": "G4.mp3",
    "G5": "G5.mp3",
    "G6": "G6.mp3",
    "G7": "G7.mp3",
    "C5": "C5.mp3",
    "C6": "C6.mp3",
    "C7": "C7.mp3"
  }
};

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
export type LoadingProgress = {
  loaded: number;
  total: number;
  currentInstrument: string;
  currentFile: string;
};
type LoadingCallback = (progress: LoadingProgress) => void;
let onLoadingUpdate: LoadingCallback | null = null;

// 设置加载状态回调
export function setSampleLoadingCallback(callback: LoadingCallback | null) {
  onLoadingUpdate = callback;
}

// 计算所有需要加载的样本总数
function calculateTotalSamples(instruments: InstrumentType[]): number {
  let total = 0;
  for (const inst of instruments) {
    total += Object.keys(INSTRUMENT_SAMPLES[inst]).length;
  }
  return total;
}

// 全局加载进度追踪
let globalLoaded = 0;
let globalTotal = 0;
let isLoadingGlobal = false;

// 创建采样器乐器 - 带进度追踪
async function createSampler(instrument: InstrumentType): Promise<Sampler> {
  return new Promise(async (resolve, reject) => {
    try {
      const baseUrl = assetPath(`/samples/${instrument}/`);
      const samples = INSTRUMENT_SAMPLES[instrument];
      const sampleEntries = Object.entries(samples);

      console.log(`Loading ${instrument} samples from: ${baseUrl}`);

      // 如果是全局加载模式，进度已经在跟踪了
      // 如果不是全局加载，只跟踪这个乐器
      const isSingleInstrumentLoad = !isLoadingGlobal;
      if (isSingleInstrumentLoad) {
        globalTotal = sampleEntries.length;
        globalLoaded = 0;
      }

      // 先获取所有样本并创建 blob URLs
      const blobUrls: Record<string, string> = {};
      for (const [note, fileName] of sampleEntries) {
        try {
          const url = `${baseUrl}${fileName}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${fileName}: ${response.status}`);
          }
          const blob = await response.blob();
          blobUrls[note] = URL.createObjectURL(blob);

          // 更新进度
          globalLoaded++;
          onLoadingUpdate?.({
            loaded: globalLoaded,
            total: globalTotal,
            currentInstrument: INSTRUMENT_NAMES[instrument],
            currentFile: fileName
          });
        } catch (err) {
          console.warn(`Failed to load ${fileName}, skipping:`, err);
        }
      }

      // 使用 blob URLs 创建 Sampler
      const sampler = new Sampler({
        urls: blobUrls,
        release: 1.5,
        onload: () => {
          console.log(`${instrument} samples loaded successfully`);
          // 释放 blob URLs
          Object.values(blobUrls).forEach(url => URL.revokeObjectURL(url));
          resolve(sampler);
        },
        onerror: (err) => {
          console.error(`Failed to load ${instrument} samples:`, err);
          // 清理 blob URLs
          Object.values(blobUrls).forEach(url => URL.revokeObjectURL(url));
          reject(err);
        }
      }).toDestination();
    } catch (err) {
      console.error(`Failed to load ${instrument} samples:`, err);
      reject(err);
    }
  });
}

// 创建合成器（作为后备）
function createSynth(): PolySynth {
  const synth = new PolySynth(Synth, {
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

  return synth;
}

async function getInstrument(instrument: InstrumentType): Promise<InstrumentInstance> {
  if (!instruments[instrument]) {
    instruments[instrument] = createSampler(instrument).catch(() => {
      console.warn(`Falling back to synth for ${instrument}`);
      return createSynth();
    });
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
  const gap = options?.arpGap ?? 0.12;

  const notes = midi.map((m) => midiToNoteName(m));
  const duration = 2;

  if (mode === "block") {
    if (inst instanceof Sampler) {
      notes.forEach((note) => {
        inst.triggerAttackRelease(note, duration, t);
      });
    } else {
      inst.triggerAttackRelease(notes, duration, t);
    }
  } else {
    const orderedNotes = notes;
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

// 和弦进行播放器
export type ProgressionPlayerConfig = {
  bpm: number;
  beatsPerChord: number;
  playMode: PlayMode;
  instrument: InstrumentType;
  loop: boolean;
};

export class ProgressionPlayer {
  private isPlaying: boolean = false;
  private stopRequested: boolean = false;
  private currentIndex: number = 0;
  private config: ProgressionPlayerConfig;
  private onChordChange?: (index: number) => void;
  private onStop?: () => void;

  constructor(config: Partial<ProgressionPlayerConfig> = {}) {
    this.config = {
      bpm: 100,
      beatsPerChord: 4,
      playMode: "block",
      instrument: "piano",
      loop: true,
      ...config
    };
  }

  setConfig(config: Partial<ProgressionPlayerConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ProgressionPlayerConfig {
    return { ...this.config };
  }

  setOnChordChange(callback: (index: number) => void) {
    this.onChordChange = callback;
  }

  setOnStop(callback: () => void) {
    this.onStop = callback;
  }

  async play(
    chords: number[][],
    startIndex: number = 0
  ): Promise<void> {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.stopRequested = false;
    this.currentIndex = startIndex;

    await ensureToneStarted();

    const beatDuration = 60 / this.config.bpm;
    const chordDuration = beatDuration * this.config.beatsPerChord;

    while (!this.stopRequested && chords.length > 0) {
      const chordNotes = chords[this.currentIndex];

      // 触发和弦变化回调
      this.onChordChange?.(this.currentIndex);

      // 播放当前和弦
      if (chordNotes.length > 0) {
        await playChord(
          chordNotes,
          this.config.playMode,
          this.config.instrument
        );
      }

      // 等待下一个和弦
      const startTime = performance.now();
      while (!this.stopRequested && (performance.now() - startTime) < chordDuration * 1000) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      if (this.stopRequested) break;

      // 移动到下一个和弦
      this.currentIndex++;
      if (this.currentIndex >= chords.length) {
        if (this.config.loop) {
          this.currentIndex = 0;
        } else {
          break;
        }
      }
    }

    this.isPlaying = false;
    this.stopRequested = false;
    this.onStop?.();
  }

  stop(): void {
    this.stopRequested = true;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// 预加载主要乐器
export async function preloadInstruments(instrumentsToPreload: InstrumentType[] = ["piano"]): Promise<void> {
  await ensureToneStarted();

  // 设置全局加载状态
  isLoadingGlobal = true;
  globalLoaded = 0;
  globalTotal = calculateTotalSamples(instrumentsToPreload);

  // 初始进度更新
  onLoadingUpdate?.({
    loaded: 0,
    total: globalTotal,
    currentInstrument: INSTRUMENT_NAMES[instrumentsToPreload[0]] || "钢琴",
    currentFile: ""
  });

  try {
    // 按顺序加载乐器以获得更准确的进度
    for (const instrument of instrumentsToPreload) {
      await getInstrument(instrument);
    }
  } finally {
    isLoadingGlobal = false;
  }
}
