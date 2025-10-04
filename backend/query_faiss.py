# backend/query_faiss.py
import json
from pathlib import Path
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

# ----------------- Config -----------------
BASE_DIR = Path(__file__).resolve().parent.parent
VECTOR_DIR = BASE_DIR / "data" / "vectors"
FAISS_FILE = VECTOR_DIR / "faiss_index.bin"
META_FILE = VECTOR_DIR / "metadatas.json"

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"  # English only
TOP_K = 5  # Number of results to return

# ----------------- Load FAISS & metadata -----------------
index = faiss.read_index(str(FAISS_FILE))
with open(META_FILE, "r", encoding="utf-8") as f:
    metadatas = json.load(f)

# ----------------- Load embedding model -----------------
model = SentenceTransformer(EMBEDDING_MODEL_NAME)

# ----------------- Query function -----------------
def search(query: str, top_k: int = TOP_K):
    query_emb = model.encode(query)
    query_emb = np.array([query_emb], dtype="float32")
    
    # Search FAISS
    distances, indices = index.search(query_emb, top_k)
    
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue
        meta = metadatas[idx]
        results.append({
            "score": float(dist),
            "text": meta.get("text", ""),
            "file_name": meta.get("file_name"),
            "source_type": meta.get("source_type"),
            "page": meta.get("page"),
            "char_start": meta.get("char_start"),
            "char_end": meta.get("char_end"),
            "start_time": meta.get("start_time"),
            "end_time": meta.get("end_time"),
            "raw_path": meta.get("raw_path")
        })
    return results

# ----------------- Interactive CLI -----------------
if __name__ == "__main__":
    print("=== FAISS Semantic Search (English) ===")
    while True:
        q = input("\nEnter your query (or 'exit' to quit): ").strip()
        if q.lower() in ["exit", "quit"]:
            break
        top_results = search(q, top_k=TOP_K)
        if not top_results:
            print("No results found.")
            continue
        for i, r in enumerate(top_results, 1):
            print(f"\n[{i}] File: {r['file_name']} | Type: {r['source_type']}")
            if r["page"] is not None:
                print(f"Page: {r['page']}")
            if r["start_time"] is not None:
                print(f"Time: {r['start_time']}s - {r['end_time']}s")
            print(f"Text: {r['text'][:500]}{'...' if len(r['text'])>500 else ''}")
            print(f"Path: {r['raw_path']}")
            print(f"Score: {r['score']:.4f}")
