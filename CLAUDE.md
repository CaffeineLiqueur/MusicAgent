# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MusicAgent (SelahFlow) is a lightweight piano accompaniment and harmony practice workbench, currently focused on the "Chord Workbench" feature: chord lookup, 61-key keyboard visualization, real-time piano sample playback (block/arpeggiated), and random chord exploration.

## Tech Stack

- **Frontend**: Vite + React + TypeScript (pnpm), Tone.js for audio
- **Backend**: FastAPI (uv) - note: chord parsing is now done locally in frontend (chordLocal.ts), backend is available but not currently used
- **PWA**: Enabled with service worker for offline functionality and sample caching

## Common Commands

### Development (Windows PowerShell - One-click)
```powershell
powershell -ExecutionPolicy Bypass -File .\dev.ps1
```

### Backend Only
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend Only
```bash
cd frontend
pnpm install
pnpm dev --host --port 5173
```

### Frontend Build
```bash
cd frontend
pnpm build
```

## Architecture

### Frontend Structure
- `src/App.tsx` - Main application with state management (home view, chord workbench)
- `src/components/` - React components:
  - `PianoKeyboard.tsx` - 61-key SVG keyboard (C2-C7) with highlighting
  - `ChordForm.tsx` - Chord input form with history, inversion, octave, transpose
  - `ResultPanel.tsx` - Displays chord info and playback controls
  - `HeaderBar.tsx` - Navigation bar with back button
  - `Metronome.tsx` - Metronome component
  - `SampleCachePanel.tsx` - Sample cache management
- `src/lib/` - Core logic:
  - `chordLocal.ts` - Local chord parsing (replaces backend API)
  - `player.ts` - Tone.js piano/guitar sampler with block/arp playback
  - `api.ts` - API client (now just wraps chordLocal.ts)
  - `chordTypes.ts` - TypeScript types for chords

### Backend Structure
- `app/main.py` - FastAPI entrypoint with CORS setup
- `app/routes/chord.py` - API routes for chord parsing
- `app/services/chord.py` - Core chord parsing logic (mirrored in frontend chordLocal.ts)
- `app/schemas/chord.py` - Pydantic schemas

### Key Features
- Chord parsing: Supports triads, 7ths, extensions, sus2/sus4, add9, inversions, slash chords
- Keyboard: 61-key (C2-C7) visualization with MIDI highlighting
- Audio: Real piano samples (Salamander) via Tone.js, block/arpeggiated modes
- PWA: Offline support with sample caching (14-day cache for instrument samples)
- Mobile: Requires landscape orientation, supports HTTPS for local debugging

### Environment Variables
- `VITE_API_BASE` - Backend API URL (default: `http://localhost:8000`)
- `VITE_DEV_HTTPS` - Set to `1` for HTTPS dev server (mobile debugging)
- `VITE_SSL_KEY` / `VITE_SSL_CERT` - Paths to SSL cert files
- `VITE_API_PROXY_TARGET` - Proxy target for `/api` (default: `http://127.0.0.1:8000`)

## Important Notes
- The frontend now uses local chord parsing (`chordLocal.ts`), the backend is available but not currently integrated
- Audio requires user interaction on iOS - users must tap "Enable Audio" button
- Instrument samples are cached via service worker
- The app requires landscape orientation on mobile
