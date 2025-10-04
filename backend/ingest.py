# backend/ingest.py
import os
import json
import uuid
from pathlib import Path
from typing import List, Dict

# Extraction libraries
import fitz  # PyMuPDF
import docx
from PIL import Image
import easyocr

# Whisper (OpenAI) - ensure installed via pip
try:
    import whisper
    WHISPER_AVAILABLE = True
except Exception:
    WHISPER_AVAILABLE = False

# ----------------- Config -----------------
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "data" / "uploads"
INGESTED_DIR = BASE_DIR / "data" / "ingested"
INGESTED_DIR.mkdir(parents=True, exist_ok=True)

# Chunking parameters
CHUNK_CHARS = 800
CHUNK_OVERLAP = 200

# ----------------- EasyOCR -----------------
_reader = None
def get_easyocr_reader(langs: list = ["en"], gpu: bool = False):
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(langs, gpu=gpu)  # English only
    return _reader

def ocr_image(path: str) -> dict:
    reader = get_easyocr_reader()
    results = reader.readtext(path)  # list of (bbox, text, prob)
    texts = []
    for bbox, text, prob in results:
        # Convert bbox coordinates to native Python floats/ints
        bbox_native = [[float(coord) for coord in point] for point in bbox]
        texts.append({"text": text, "prob": float(prob), "bbox": bbox_native})
    full_text = "\n".join([t["text"] for t in texts])
    return {"type": "image", "ocr": texts, "full_text": full_text}

# ----------------- Whisper -----------------
def transcribe_audio(path: str, model_size: str="tiny") -> Dict:
    if not WHISPER_AVAILABLE:
        raise RuntimeError("Whisper not installed. Install via: pip install git+https://github.com/openai/whisper.git")
    model = whisper.load_model(model_size)
    # force English transcription
    res = model.transcribe(path, language="en")
    return {"type": "audio", "text": res.get("text",""), "segments": res.get("segments", [])}

# ----------------- PDF / DOCX -----------------
def extract_text_from_pdf(path: str) -> Dict:
    doc = fitz.open(path)
    pages = []
    for pno, page in enumerate(doc, start=1):
        txt = page.get_text("text") or ""
        pages.append({"page": pno, "text": txt})
    return {"type": "pdf", "pages": pages}

def extract_text_from_docx(path: str) -> Dict:
    d = docx.Document(path)
    paragraphs = [p.text for p in d.paragraphs if p.text.strip()]
    return {"type": "docx", "text": "\n\n".join(paragraphs)}

# ----------------- Chunking -----------------
def chunk_text(text: str, chunk_chars: int = CHUNK_CHARS, overlap: int = CHUNK_OVERLAP):
    n = len(text)
    start = 0
    while start < n:
        end = min(start + chunk_chars, n)
        yield start, end, text[start:end]
        if end == n:
            break
        start = max(0, end - overlap)

# ----------------- Ingestion -----------------
def ingest_file(filepath: str) -> List[Dict]:
    filepath = Path(filepath)
    ext = filepath.suffix.lower()
    file_stem = filepath.name
    out_items = []

    if ext == ".pdf":
        info = extract_text_from_pdf(str(filepath))
        for page in info["pages"]:
            txt = page["text"] or ""
            if not txt.strip():
                continue
            for s,e,chunk in chunk_text(txt):
                out_items.append({
                    "id": str(uuid.uuid4()),
                    "file_name": file_stem,
                    "source_type": "pdf",
                    "page": page["page"],
                    "char_start": int(s),
                    "char_end": int(e),
                    "text": chunk.strip(),
                    "raw_path": str(filepath)
                })

    elif ext in [".docx", ".doc"]:
        info = extract_text_from_docx(str(filepath))
        txt = info.get("text","")
        for s,e,chunk in chunk_text(txt):
            out_items.append({
                "id": str(uuid.uuid4()),
                "file_name": file_stem,
                "source_type": "docx",
                "char_start": int(s),
                "char_end": int(e),
                "text": chunk.strip(),
                "raw_path": str(filepath)
            })

    elif ext in [".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".webp"]:
        info = ocr_image(str(filepath))
        full = info.get("full_text","")
        for s,e,chunk in chunk_text(full):
            out_items.append({
                "id": str(uuid.uuid4()),
                "file_name": file_stem,
                "source_type": "image",
                "char_start": int(s),
                "char_end": int(e),
                "text": chunk.strip(),
                "ocr_details": info["ocr"],
                "raw_path": str(filepath)
            })

    elif ext in [".mp3", ".wav", ".m4a", ".flac", ".ogg"]:
        info = transcribe_audio(str(filepath), model_size="tiny")
        segments = info.get("segments", [])
        if segments:
            for seg in segments:
                text = seg.get("text","").strip()
                if not text:
                    continue
                out_items.append({
                    "id": str(uuid.uuid4()),
                    "file_name": file_stem,
                    "source_type": "audio",
                    "start_time": float(seg.get("start",0.0)),
                    "end_time": float(seg.get("end",0.0)),
                    "text": text,
                    "raw_path": str(filepath)
                })
        else:
            text = info.get("text","")
            for s,e,chunk in chunk_text(text):
                out_items.append({
                    "id": str(uuid.uuid4()),
                    "file_name": file_stem,
                    "source_type": "audio",
                    "char_start": int(s),
                    "char_end": int(e),
                    "text": chunk.strip(),
                    "raw_path": str(filepath)
                })

    else:
        try:
            txt = filepath.read_text(encoding="utf-8")
            for s,e,chunk in chunk_text(txt):
                out_items.append({
                    "id": str(uuid.uuid4()),
                    "file_name": file_stem,
                    "source_type": "text",
                    "char_start": int(s),
                    "char_end": int(e),
                    "text": chunk.strip(),
                    "raw_path": str(filepath)
                })
        except Exception:
            print(f"Skipping unsupported file type: {filepath}")
            return []

    # Save chunks to JSONL
    out_path = INGESTED_DIR / f"{file_stem}.jsonl"
    with open(out_path, "w", encoding="utf-8") as fh:
        for it in out_items:
            fh.write(json.dumps(it, ensure_ascii=False) + "\n")
    print(f"Ingested {len(out_items)} chunks from {file_stem} -> {out_path}")
    return out_items
