from fastapi import APIRouter, Query

from app.schemas.chord import ChordResponse, HealthResponse
from app.services import chord as chord_service

router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/chord", response_model=ChordResponse)
def get_chord(
    symbol: str = Query(..., description="Chord symbol, e.g. Cmaj7#11/G"),
    key: str | None = Query(None, description="Optional key for Roman numeral"),
    inversion: int = Query(0, ge=0, description="Inversion number"),
    octave: int = Query(4, ge=0, le=8, description="Base octave for root, C4=60"),
    transpose: int = Query(0, description="Semitone transpose"),
    range_min: int = Query(36, description="Keyboard range min MIDI"),
    range_max: int = Query(96, description="Keyboard range max MIDI"),
) -> ChordResponse:
    parsed = chord_service.parse_chord_symbol(symbol)
    notes, formulas = chord_service.build_midi_notes(
        parsed,
        octave=octave,
        inversion=inversion,
        transpose=transpose,
        fit_range=(range_min, range_max),
    )
    tones = [chord_service.midi_to_name(n) for n in notes]
    roman = chord_service.to_roman(parsed, key)
    return ChordResponse(
        symbol=symbol,
        key=key,
        roman=roman,
        tones=tones,
        midi=notes,
        formula=formulas,
        range={"min": range_min, "max": range_max},
    )

