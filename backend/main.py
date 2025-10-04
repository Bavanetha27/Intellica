# backend/main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import json
import faiss
import torch
import numpy as np
import uvicorn
from fastapi import UploadFile, File
import whisper
from PIL import Image
import easyocr

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Import your existing modules
from ingest import ingest_file
from embed_faiss import VECTOR_DIR, model as embed_model
from rag_generate import generate_answer

app = FastAPI(title="Multimodal RAG API", version="2.0")
ocr_reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())
whisper_model = whisper.load_model("tiny") 


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Config ----------------
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "data/uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

FAISS_FILE = VECTOR_DIR / "faiss_index.bin"
META_FILE = VECTOR_DIR / "metadatas.json"

LLM_MODEL = "google/flan-t5-small"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL)
llm_model = AutoModelForSeq2SeqLM.from_pretrained(LLM_MODEL).to(DEVICE)
llm_model.eval()

from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str

# ---------------- Load FAISS ----------------
def load_index():
    if FAISS_FILE.exists() and META_FILE.exists():
        index = faiss.read_index(str(FAISS_FILE))
        with open(META_FILE, "r", encoding="utf-8") as f:
            metadata = json.load(f)
    else:
        index = faiss.IndexFlatL2(384)
        metadata = []
    return index, metadata

index, metadata = load_index()

def save_index():
    faiss.write_index(index, str(FAISS_FILE))
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

# ---------------- LangChain Pipelines ----------------

def ingest_chain(file_path: str):
    return ingest_file(file_path)

def embed_chain(chunks):
    global index, metadata
    for c in chunks:
        text = c.get("text", "").strip()
        if not text:
            continue
        emb = embed_model.encode(text, convert_to_numpy=True)
        emb = np.array([emb], dtype="float32")
        index.add(emb)
        metadata.append(c)
    save_index()
    return len(chunks)

def rag_chain(query: str):
    answer, sources = generate_answer(query)
    return {"answer": answer, "sources": sources}

rag_pipeline = rag_chain
# ---------------- API Routes ----------------

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunks = ingest_chain(str(file_path))
    chunk_count = embed_chain(chunks)

    return {
        "message": f"File '{file.filename}' successfully ingested.",
        "chunks_created": chunk_count
    }

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    result = whisper_model.transcribe(str(file_path))
    return {"text": result["text"]}

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Read text using EasyOCR
    results = ocr_reader.readtext(str(file_path))
    # Combine all detected text segments
    text = " ".join([res[1] for res in results])
    
    return {"text": text}

@app.post("/query")
def query_endpoint(request: QueryRequest):
    q = request.query
    answer, sources = generate_answer(q)
    return {"answer": answer, "sources": sources}


@app.get("/")
def home():
    return {"message": "LangChain-powered Multimodal RAG API is running 🚀"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
