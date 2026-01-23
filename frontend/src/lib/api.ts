import { ChordQuery, ChordResponse } from "./chordTypes";
import { computeChordLocal } from "./chordLocal";

// 全离线：前端直接解析，不依赖后端
export async function fetchChord(query: ChordQuery): Promise<ChordResponse> {
  return computeChordLocal(query);
}

