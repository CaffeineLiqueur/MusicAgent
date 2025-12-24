from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chord

app = FastAPI(title="MusicAgent Chord API", version="0.1.0")

# Open CORS for dev; tighten in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chord.router)


@app.get("/")
def root():
    return {"status": "ok"}

