from pydantic import BaseModel, Field
from typing import List, Optional


class ChordResponse(BaseModel):
    symbol: str = Field(..., description="Original chord symbol")
    key: Optional[str] = Field(None, description="Key context for Roman numeral")
    roman: Optional[str] = Field(None, description="Roman numeral notation when key is provided")
    tones: List[str] = Field(..., description="Note names with octave, e.g. C4")
    midi: List[int] = Field(..., description="MIDI note numbers for highlighted keys")
    formula: List[str] = Field(..., description="Interval formula relative to root")
    range: dict = Field(..., description="Keyboard range limits, e.g. {'min':36,'max':96}")


class HealthResponse(BaseModel):
    status: str

