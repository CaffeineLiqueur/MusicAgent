from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Tuple

NOTE_TO_SEMITONE: Dict[str, int] = {
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
}

SEMITONE_TO_NOTE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

DEFAULT_RANGE = (36, 96)  # C2 to C7 for 61-key


@dataclass
class ParsedChord:
    root: str
    accidental: str
    quality: str
    alterations: List[str]
    bass: Optional[str]


def parse_chord_symbol(symbol: str) -> ParsedChord:
    """
    Parse chord symbol like Cmaj7#11/G.
    Returns ParsedChord with root, accidental, quality token, alterations list, bass.
    """
    if not symbol:
        raise ValueError("Chord symbol is required")
    text = symbol.strip()
    # Root and accidental
    if len(text) < 1 or text[0].upper() not in "ABCDEFG":
        raise ValueError("Chord must start with A-G")
    root = text[0].upper()
    idx = 1
    accidental = ""
    if idx < len(text) and text[idx] in ("b", "#"):
        accidental = text[idx]
        idx += 1

    body = text[idx:]
    bass = None
    if "/" in body:
        body, bass = body.split("/", 1)
        bass = bass.strip()

    quality, alterations = _split_quality_and_alterations(body)
    return ParsedChord(root=root, accidental=accidental, quality=quality, alterations=alterations, bass=bass)


QUALITY_INTERVALS: Dict[str, List[int]] = {
    "maj": [0, 4, 7],
    "": [0, 4, 7],
    "m": [0, 3, 7],
    "min": [0, 3, 7],
    "dim": [0, 3, 6],
    "aug": [0, 4, 8],
    "+": [0, 4, 8],
    "sus2": [0, 2, 7],
    "sus4": [0, 5, 7],
    "6": [0, 4, 7, 9],
    "6/9": [0, 4, 7, 9, 14],
    "69": [0, 4, 7, 9, 14],
    "7": [0, 4, 7, 10],
    "maj7": [0, 4, 7, 11],
    "M7": [0, 4, 7, 11],
    "m7": [0, 3, 7, 10],
    "min7": [0, 3, 7, 10],
    "m7b5": [0, 3, 6, 10],
    "dim7": [0, 3, 6, 9],
    "mMaj7": [0, 3, 7, 11],
    "9": [0, 4, 7, 10, 14],
    "maj9": [0, 4, 7, 11, 14],
    "m9": [0, 3, 7, 10, 14],
    "11": [0, 4, 7, 10, 14, 17],
    "13": [0, 4, 7, 10, 14, 21],
    "sus": [0, 5, 7],
}

ALTERATION_OFFSETS: Dict[str, int] = {
    "b9": 13,
    "#9": 15,
    "9": 14,
    "add9": 14,
    "#11": 18,
    "11": 17,
    "b13": 20,
    "13": 21,
}

FORMULA_NAMES: Dict[int, str] = {
    0: "1",
    1: "b2",
    2: "2",
    3: "b3",
    4: "3",
    5: "4",
    6: "b5",
    7: "5",
    8: "#5",
    9: "6",
    10: "b7",
    11: "7",
    13: "b9",
    14: "9",
    15: "#9",
    17: "11",
    18: "#11",
    20: "b13",
    21: "13",
}


def _split_quality_and_alterations(body: str) -> Tuple[str, List[str]]:
    """Split the main quality token and alteration tokens."""
    token = body or ""
    token = token.strip()
    # Identify slash-already-removed, so only quality + extensions remain
    for q in sorted(QUALITY_INTERVALS.keys(), key=len, reverse=True):
        if token.startswith(q):
            rest = token[len(q) :]
            alterations = _parse_alterations(rest)
            return q, alterations
    # default major triad
    alterations = _parse_alterations(token)
    return "", alterations


def _parse_alterations(text: str) -> List[str]:
    """Parse alteration tokens in remaining text."""
    if not text:
        return []
    buf = text
    tokens: List[str] = []
    # check ordered list to avoid partial match (#11 before 11)
    ordered = ["#11", "b13", "13", "11", "add9", "#9", "b9", "9"]
    while buf:
        matched = False
        for t in ordered:
            if buf.startswith(t):
                tokens.append(t)
                buf = buf[len(t) :]
                matched = True
                break
        if not matched:
            # unrecognized text
            buf = buf[1:]
    return tokens


def build_midi_notes(
    parsed: ParsedChord,
    *,
    octave: int = 4,
    inversion: int = 0,
    transpose: int = 0,
    fit_range: Tuple[int, int] = DEFAULT_RANGE,
) -> Tuple[List[int], List[str]]:
    """Return midi list and formula names for the chord."""
    root_pc = NOTE_TO_SEMITONE[f"{parsed.root}{parsed.accidental}"]
    base_root = to_midi_number(root_pc, octave)
    intervals = list(QUALITY_INTERVALS.get(parsed.quality, QUALITY_INTERVALS[""]))
    # add alterations
    for alt in parsed.alterations:
        offset = ALTERATION_OFFSETS.get(alt)
        if offset is None:
            continue
        if offset not in intervals:
            intervals.append(offset)
    intervals = sorted(intervals)
    notes = [base_root + i for i in intervals]

    # slash bass handling
    if parsed.bass:
        bass_pc = NOTE_TO_SEMITONE[parsed.bass]
        bass_note = to_midi_number(bass_pc, octave - 1)
        notes.append(bass_note)
        notes = sorted(notes)

    notes = apply_inversion(notes, inversion)
    if transpose:
        notes = [n + transpose for n in notes]
    notes = clamp_to_range(notes, fit_range)
    formulas = [FORMULA_NAMES.get(i % 24, "?") for i in intervals]
    return notes, formulas


def to_midi_number(pc: int, octave: int) -> int:
    """Map pitch class and octave to midi. C4=60."""
    return pc + (octave + 1) * 12


def midi_to_name(n: int) -> str:
    pc = n % 12
    octave = (n // 12) - 1
    return f"{SEMITONE_TO_NOTE[pc]}{octave}"


def apply_inversion(notes: Sequence[int], inversion: int) -> List[int]:
    if not notes:
        return []
    ordered = sorted(notes)
    inv = inversion % len(ordered)
    for _ in range(inv):
        top = ordered.pop(0)
        ordered.append(top + 12)
    return sorted(ordered)


def clamp_to_range(notes: Sequence[int], bounds: Tuple[int, int]) -> List[int]:
    if not notes:
        return []
    low, high = bounds
    arr = list(notes)
    # Try lifting if too low
    while min(arr) < low:
        arr = [n + 12 for n in arr]
    while max(arr) > high:
        arr = [n - 12 for n in arr]
    return arr


def to_roman(parsed: ParsedChord, key: Optional[str]) -> Optional[str]:
    if not key:
        return None
    key_root = key.strip().capitalize()
    if key_root not in NOTE_TO_SEMITONE:
        return None
    root_pc = NOTE_TO_SEMITONE[f"{parsed.root}{parsed.accidental}"]
    key_pc = NOTE_TO_SEMITONE[key_root]
    diff = (root_pc - key_pc) % 12
    roman_base = _roman_for_pc(diff, parsed.quality)
    if parsed.bass:
        return f"{roman_base}/{parsed.bass}"
    return roman_base


ROMAN_MAP = {
    0: "I",
    1: "bII",
    2: "II",
    3: "bIII",
    4: "III",
    5: "IV",
    6: "#IV",
    7: "V",
    8: "#V",
    9: "VI",
    10: "bVII",
    11: "VII",
}


def _roman_for_pc(pc: int, quality: str) -> str:
    base = ROMAN_MAP.get(pc, "?")
    if quality in ("m", "min", "m7", "min7", "m7b5", "m9", "mMaj7"):
        base = base.lower()
    if quality in ("dim", "dim7", "m7b5"):
        base += "°"
    elif quality in ("aug", "+"):
        base += "+"
    elif quality in ("maj7", "M7", "maj9"):
        base += "maj7" if quality.startswith("maj7") or quality == "M7" else ""
    return base

