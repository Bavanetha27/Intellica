# backend/embed_faiss.py
import os
import json
from pathlib import Path

# OpenAI or SentenceTransformers for embeddings
# Here we use sentence-transformers (offline-friendly)
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# ----------------- Config -----------------
BASE_DIR = Path(__file__).resolve().parent.parent
INGESTED_DIR = BASE_DIR / "data/ingested"
VECTOR_DIR = BASE_DIR / "data/vectors"
VECTOR_DIR.mkdir(parents=True, exist_ok=True)

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"  # English only
DIM = 384  # embedding dimension for all-MiniLM-L6-v2

# ----------------- Load model -----------------
model = SentenceTransformer(EMBEDDING_MODEL_NAME)

# ----------------- FAISS index -----------------
index = faiss.IndexFlatL2(DIM)  # L2 distance

# Store metadata for each vector
metadatas = []

# ----------------- Process ingested files -----------------
for jsonl_file in INGESTED_DIR.glob("*.jsonl"):
    print(f"Processing {jsonl_file.name}...")
    with open(jsonl_file, "r", encoding="utf-8") as f:
        for line in f:
            item = json.loads(line)
            text = item.get("text", "")
            if not text.strip():
                continue

            # Generate embedding (numpy array)
            emb = model.encode(text)
            emb = np.array([emb], dtype="float32")  # shape (1, DIM)
            index.add(emb)

            # Keep metadata
            metadatas.append({
                "id": item.get("id"),
                "file_name": item.get("file_name"),
                "source_type": item.get("source_type"),
                "page": item.get("page", None),
                "char_start": item.get("char_start", None),
                "char_end": item.get("char_end", None),
                "start_time": item.get("start_time", None),
                "end_time": item.get("end_time", None),
                "raw_path": item.get("raw_path"),
                "text": item.get("text", "")  # <- THIS IS IMPORTANT
            })

# ----------------- Save FAISS index & metadata -----------------
faiss_file = VECTOR_DIR / "faiss_index.bin"
faiss.write_index(index, str(faiss_file))

meta_file = VECTOR_DIR / "metadatas.json"
with open(meta_file, "w", encoding="utf-8") as f:
    json.dump(metadatas, f, ensure_ascii=False, indent=2)

print(f"FAISS index saved to {faiss_file}")
print(f"Metadata saved to {meta_file}")
print(f"Total vectors: {index.ntotal}")
