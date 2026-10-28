"""
AI Voice — Local Piper TTS Backend
FastAPI server that generates MP3 audio from text using Piper neural TTS
and FFmpeg. No external APIs, no paid services, no API keys.

Endpoints:
  GET  /health       — health check (reports piper + ffmpeg availability)
  GET  /voices       — list locally installed voice models
  GET  /tts          — generate MP3 from text
    ?text=Hello world&voice_id=en_US-amy-medium&speed=1.0

Voice models live in ./voices/*.onnx (+ matching *.json config).
"""

import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# ---------------------------------------------------------------------------
# Configuration (override with environment variables — no hardcoded paths)
# ---------------------------------------------------------------------------
VOICES_DIR = Path(os.environ.get("PIPER_VOICES_DIR", "./voices")).resolve()
PIPER_BIN = os.environ.get("PIPER_BIN", "piper")
FFMPEG_BIN = os.environ.get("FFMPEG_BIN", "ffmpeg")
HOST = os.environ.get("PIPER_HOST", "0.0.0.0")
PORT = int(os.environ.get("PIPER_PORT", "8000"))
MAX_TEXT_LENGTH = int(os.environ.get("PIPER_MAX_TEXT", "5000"))
CHUNK_CHARS = int(os.environ.get("PIPER_CHUNK_CHARS", "500"))
CORS_ORIGINS = os.environ.get("PIPER_CORS_ORIGIN", "*")

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="AI Voice — Local TTS", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGINS] if CORS_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def check_piper() -> bool:
    """Return True if the piper executable is available."""
    if Path(PIPER_BIN).is_file():
        return True
    return shutil.which(PIPER_BIN) is not None


def check_ffmpeg() -> bool:
    """Return True if ffmpeg is available."""
    if Path(FFMPEG_BIN).is_file():
        return True
    return shutil.which(FFMPEG_BIN) is not None


def discover_voices() -> list[dict]:
    """Scan VOICES_DIR for .onnx voice models and return their metadata."""
    voices = []
    if not VOICES_DIR.exists():
        return voices

    for onnx_file in sorted(VOICES_DIR.glob("*.onnx")):
        model_id = onnx_file.stem  # e.g. en_US-amy-medium
        json_config = onnx_file.with_suffix(".json")

        # Parse language and name from the filename convention:
        # <lang>_<country>-<name>-<quality>.onnx  e.g. en_US-amy-medium
        parts = re.split(r"[_\-]", model_id)
        if len(parts) >= 3:
            lang_part = f"{parts[0]}_{parts[1]}"
            name_part = parts[2]
            quality = parts[3] if len(parts) > 3 else ""
        else:
            lang_part = parts[0] if parts else "unknown"
            name_part = model_id
            quality = ""

        # Human-readable language name
        lang_names = {
            "en_US": "English (US)",
            "en_GB": "English (UK)",
            "es_ES": "Spanish",
            "fr_FR": "French",
            "de_DE": "German",
            "it_IT": "Italian",
            "pt_BR": "Portuguese (Brazil)",
            "pt_PT": "Portuguese",
            "nl_NL": "Dutch",
            "pl_PL": "Polish",
            "ru_RU": "Russian",
            "tr_TR": "Turkish",
            "cs_CZ": "Czech",
            "zh_CN": "Chinese",
            "vi_VN": "Vietnamese",
            "ar_JO": "Arabic",
            "ca_ES": "Catalan",
            "cy_GB": "Welsh",
        }
        language = lang_names.get(lang_part, lang_part)

        voices.append(
            {
                "id": model_id,
                "name": name_part.capitalize(),
                "language": language,
                "language_code": lang_part,
                "quality": quality,
                "model_path": str(onnx_file),
                "config_path": str(json_config) if json_config.exists() else None,
            }
        )

    return voices


def get_voice_path(voice_id: str) -> Path:
    """Return the .onnx path for a voice_id, or raise 404."""
    safe = re.sub(r"[^a-zA-Z0-9_\-]", "", voice_id)
    if safe != voice_id:
        raise HTTPException(status_code=400, detail="Invalid voice_id.")
    onnx = VOICES_DIR / f"{voice_id}.onnx"
    if not onnx.exists():
        available = [v["id"] for v in discover_voices()]
        raise HTTPException(
            status_code=404,
            detail=f"Voice model '{voice_id}' not found. Available: {available}",
        )
    return onnx


def split_text(text: str, max_chars: int = CHUNK_CHARS) -> list[str]:
    """Split text into chunks, preferring sentence/word boundaries."""
    clean = text.strip()
    if len(clean) <= max_chars:
        return [clean] if clean else []
    chunks: list[str] = []
    rest = clean
    while len(rest) > max_chars:
        cut = max_chars
        sentence = rest.rfind(".", 0, max_chars)
        comma = rest.rfind(",", 0, max_chars)
        space = rest.rfind(" ", 0, max_chars)
        if sentence > max_chars * 0.5:
            cut = sentence + 1
        elif comma > max_chars * 0.5:
            cut = comma + 1
        elif space > max_chars * 0.4:
            cut = space
        chunks.append(rest[:cut].strip())
        rest = rest[cut:].strip()
    if rest:
        chunks.append(rest)
    return chunks


def synthesize_chunk(text: str, model_path: Path, speed: float, out_wav: Path) -> None:
    """Run Piper to synthesize a single chunk to a WAV file."""
    cmd = [PIPER_BIN, "--model", str(model_path), "--output_file", str(out_wav)]
    if speed and speed != 1.0:
        cmd.extend(["--length-scale", str(1.0 / speed)])
    try:
        proc = subprocess.run(
            cmd,
            input=text,
            capture_output=True,
            text=True,
            timeout=60,
        )
    except FileNotFoundError:
        raise RuntimeError(
            f"Piper executable not found at '{PIPER_BIN}'. "
            "Install Piper or set the PIPER_BIN environment variable."
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("Piper took too long to respond. The text may be too complex.")

    if proc.returncode != 0:
        detail = proc.stderr.strip()[:500] if proc.stderr else "Unknown Piper error"
        raise RuntimeError(f"Piper failed: {detail}")

    if not out_wav.exists() or out_wav.stat().st_size == 0:
        raise RuntimeError("Piper produced no audio output.")


def wav_to_mp3(wav_path: Path, mp3_path: Path) -> None:
    """Convert a WAV file to MP3 using FFmpeg."""
    cmd = [
        FFMPEG_BIN,
        "-y",
        "-i", str(wav_path),
        "-codec:a", "libmp3lame",
        "-b:a", "128k",
        "-ar", "44100",
        str(mp3_path),
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except FileNotFoundError:
        raise RuntimeError(
            f"FFmpeg not found at '{FFMPEG_BIN}'. "
            "Install FFmpeg or set the FFMPEG_BIN environment variable."
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("FFmpeg conversion timed out.")

    if proc.returncode != 0:
        detail = proc.stderr.strip()[:500] if proc.stderr else "Unknown FFmpeg error"
        raise RuntimeError(f"FFmpeg failed: {detail}")


def concat_mp3s(mp3_files: list[Path], output: Path) -> None:
    """Concatenate MP3 files using FFmpeg concat demuxer."""
    if len(mp3_files) == 1:
        shutil.copy2(mp3_files[0], output)
        return

    list_file = output.parent / "concat_list.txt"
    try:
        with open(list_file, "w", encoding="utf-8") as f:
            for mp3 in mp3_files:
                # Escape single quotes for the concat demuxer
                safe = str(mp3).replace("'", "'\\''")
                f.write(f"file '{safe}'\n")

        cmd = [
            FFMPEG_BIN,
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(list_file),
            "-c", "copy",
            str(output),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if proc.returncode != 0:
            # Fallback: re-encode concat
            cmd_reencode = [
                FFMPEG_BIN, "-y",
                "-f", "concat", "-safe", "0",
                "-i", str(list_file),
                "-codec:a", "libmp3lame",
                "-b:a", "128k",
                str(output),
            ]
            proc = subprocess.run(cmd_reencode, capture_output=True, text=True, timeout=120)
            if proc.returncode != 0:
                detail = proc.stderr.strip()[:300] if proc.stderr else "Unknown error"
                raise RuntimeError(f"FFmpeg concat failed: {detail}")
    finally:
        list_file.unlink(missing_ok=True)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "message": "AI Voice local TTS backend is running",
        "piper": check_piper(),
        "ffmpeg": check_ffmpeg(),
        "voices_dir": str(VOICES_DIR),
        "voices_count": len(discover_voices()),
    }


@app.get("/voices")
async def list_voices():
    voices = discover_voices()
    if not voices:
        return JSONResponse(
            content={
                "voices": [],
                "message": (
                    f"No voice models found in {VOICES_DIR}. "
                    "Download Piper voice files (.onnx + .json) and place them there. "
                    "See the README for instructions."
                ),
            },
            status_code=200,
        )
    return {"voices": voices}


@app.get("/tts")
async def text_to_speech(
    text: str = Query(..., description="Text to convert to speech"),
    voice_id: str = Query(..., description="Voice model ID (e.g. en_US-amy-medium)"),
    speed: float = Query(1.0, ge=0.5, le=2.0, description="Speech speed multiplier"),
):
    # Validate
    if not text or not text.strip():
        raise HTTPException(status_code=422, detail="Text must not be empty.")
    if len(text) > MAX_TEXT_LENGTH:
        raise HTTPException(
            status_code=413,
            detail=f"Text too long ({len(text)} chars). Maximum is {MAX_TEXT_LENGTH}.",
        )

    # Check dependencies
    if not check_piper():
        raise HTTPException(
            status_code=503,
            detail="Piper is not installed or not found. Set PIPER_BIN or install Piper.",
        )
    if not check_ffmpeg():
        raise HTTPException(
            status_code=503,
            detail="FFmpeg is not installed or not found. Set FFMPEG_BIN or install FFmpeg.",
        )

    model_path = get_voice_path(voice_id)

    # Split into chunks and synthesize each
    chunks = split_text(text)
    if not chunks:
        raise HTTPException(status_code=422, detail="Text must not be empty.")

    tmp_dir = Path(tempfile.mkdtemp(prefix="aivoice_"))
    mp3_parts: list[Path] = []

    try:
        for i, chunk in enumerate(chunks):
            wav_path = tmp_dir / f"chunk_{i:04d}.wav"
            mp3_path = tmp_dir / f"chunk_{i:04d}.mp3"

            synthesize_chunk(chunk, model_path, speed, wav_path)
            wav_to_mp3(wav_path, mp3_path)
            mp3_parts.append(mp3_path)

            # Clean up WAV to save disk
            wav_path.unlink(missing_ok=True)

        # Concatenate all MP3 parts in order
        final_mp3 = tmp_dir / "output.mp3"
        concat_mp3s(mp3_parts, final_mp3)

        if not final_mp3.exists() or final_mp3.stat().st_size == 0:
            raise HTTPException(
                status_code=500,
                detail="Generated MP3 file is empty. Check Piper and FFmpeg installation.",
            )

        return FileResponse(
            path=str(final_mp3),
            media_type="audio/mpeg",
            filename=f"aivoice_{voice_id}.mp3",
            # FileResponse handles cleanup after sending, but we use a background task
            # by relying on the fact that tmp_dir is a tempfile that OS will clean.
            background=None,
        )

    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
    finally:
        # Schedule cleanup of temp files (after response is sent)
        import threading
        def cleanup():
            import time
            time.sleep(2)
            shutil.rmtree(tmp_dir, ignore_errors=True)
        threading.Thread(target=cleanup, daemon=True).start()


if __name__ == "__main__":
    print(f"AI Voice TTS Backend")
    print(f"  Voices dir: {VOICES_DIR}")
    print(f"  Piper:      {PIPER_BIN} ({'found' if check_piper() else 'NOT FOUND'})")
    print(f"  FFmpeg:     {FFMPEG_BIN} ({'found' if check_ffmpeg() else 'NOT FOUND'})")
    print(f"  Starting server at http://{HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)
