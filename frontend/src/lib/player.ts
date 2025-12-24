import { Sampler, context, now, start } from "tone";

type PlayMode = "block" | "arp";

let samplerPromise: Promise<Sampler> | null = null;

function getSampler(): Promise<Sampler> {
  if (!samplerPromise) {
    samplerPromise = new Promise((resolve, reject) => {
      const sampler = new Sampler(
        {
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
        },
        {
          baseUrl: "https://tonejs.github.io/audio/salamander/",
          onload: () => resolve(sampler),
          onerror: (err) => reject(err)
        }
      ).toDestination();
    });
  }
  return samplerPromise;
}

function midiToNoteName(midi: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${names[pc]}${octave}`;
}

async function ensureToneStarted() {
  if (context.state !== "running") {
    await start();
  }
}

export async function playChord(
  midi: number[],
  mode: PlayMode = "block",
  options?: { arpGap?: number }
): Promise<void> {
  if (!midi.length) return;
  await ensureToneStarted();
  const sampler = await getSampler();
  const t = now();
  const gap = options?.arpGap ?? 0.12;

  if (mode === "block") {
    midi.forEach((m) => {
      const note = midiToNoteName(m);
      sampler.triggerAttackRelease(note, 2.5, t);
    });
  } else {
    midi.forEach((m, i) => {
      const note = midiToNoteName(m);
      const ti = t + i * gap;
      sampler.triggerAttackRelease(note, 2.5, ti);
    });
  }
}

export async function playNote(midi: number): Promise<void> {
  return playChord([midi], "block");
}

