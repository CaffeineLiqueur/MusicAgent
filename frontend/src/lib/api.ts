import { ChordQuery, ChordResponse } from "./chordTypes";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function fetchChord(query: ChordQuery): Promise<ChordResponse> {
  const params = new URLSearchParams();
  params.set("symbol", query.symbol);
  if (query.key) params.set("key", query.key);
  if (query.inversion !== undefined) params.set("inversion", String(query.inversion));
  if (query.octave !== undefined) params.set("octave", String(query.octave));
  if (query.transpose !== undefined) params.set("transpose", String(query.transpose));
  if (query.rangeMin !== undefined) params.set("range_min", String(query.rangeMin));
  if (query.rangeMax !== undefined) params.set("range_max", String(query.rangeMax));

  const res = await fetch(`${API_BASE}/api/chord?${params.toString()}`);
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Chord fetch failed");
  }
  return res.json();
}

